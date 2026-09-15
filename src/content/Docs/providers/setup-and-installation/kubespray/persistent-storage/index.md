---
categories: ["Providers"]
tags: ["Persistent Storage", "Advanced Features", "Configuration"]
weight: 3
title: "Persistent Storage"
linkTitle: "Persistent Storage"
description: "Enable persistent storage on your Akash provider using Rook-Ceph"
---

This guide installs Rook-Ceph with exact dedicated disks and exposes one Akash persistent-storage class. Complete it before [installing the provider](/docs/providers/setup-and-installation/kubespray/provider-installation) so the provider advertises the storage it can actually provision.

The automated [Provider Playbook](/docs/providers/setup-and-installation/provider-playbook) performs read-only disk discovery, recommends a topology, and validates the resulting OSDs and StorageClass. Use that path unless you specifically need a manual Rook configuration.

## Requirements and topology

Ceph needs at least two dedicated physical disks across the cluster and creates one OSD per disk, including NVMe. For production host-failure tolerance, use at least three storage hosts.

| Storage layout                   | Pool size | Minimum replicas | Failure domain | Protection                              |
| -------------------------------- | --------: | ---------------: | -------------- | --------------------------------------- |
| Three or more storage hosts      |         3 |                2 | `host`         | Recommended; tolerates a host failure   |
| Two storage hosts                |         2 |                1 | `host`         | Limited host redundancy                 |
| One host with at least two disks |         2 |                1 | `osd`          | Disk failure only; no host availability |

Use homogeneous media when possible. If you intentionally mix media, advertise the class of the slowest selected disk:

| Media | Akash StorageClass |
| ----- | ------------------ |
| HDD   | `beta1`            |
| SSD   | `beta2`            |
| NVMe  | `beta3`            |

This guide uses three NVMe disks on three hosts and creates `beta3`.

## 1. Identify eligible disks

On every storage host, inspect whole disks and their stable identities:

```bash
lsblk --exclude 7 --output NAME,PATH,SIZE,TYPE,FSTYPE,MOUNTPOINTS,ROTA,RO,RM
ls -l /dev/disk/by-id/
```

A Ceph disk must be:

- A dedicated, non-removable whole disk of at least 5 GiB.
- Unpartitioned and not mounted or used as swap.
- Free of filesystem, RAID, LVM, and Ceph signatures.
- Free of active block-device holders.
- Addressable through a stable `/dev/disk/by-id/...` symlink.

Check a candidate before selecting it:

```bash
sudo wipefs --no-act /dev/nvme0n1
findmnt --source /dev/nvme0n1
swapon --show
sudo pvs
readlink -f /dev/disk/by-id/nvme-example-disk-id
```

No output from `wipefs --no-act` is necessary but not sufficient proof that a disk contains no valuable data. Confirm each disk's ownership through your infrastructure records before proceeding. Rook will consume every selected disk.

Do not use a broad device filter such as `nvme*`. Record the exact stable ID for each disk and the Kubernetes node name returned by:

```bash
kubectl get nodes
```

## 2. Install the Rook-Ceph operator

Run these commands from a control-plane node with Helm 4.2.4 or newer:

```bash
helm repo add rook-release https://charts.rook.io/release
helm repo update
kubectl create namespace rook-ceph --dry-run=client --output yaml | kubectl apply -f -

helm upgrade --install rook-ceph-operator rook-release/rook-ceph \
  --namespace rook-ceph \
  --version 1.19.10 \
  --wait \
  --timeout 10m
```

If kubelet uses a non-default root directory, add `--set csi.kubeletDirPath=/your/kubelet/root` to the Helm command. K3s uses `/var/lib/kubelet` unless you changed it outside the Provider Playbook.

Verify the operator:

```bash
kubectl --namespace rook-ceph rollout status deployment/rook-ceph-operator
kubectl --namespace rook-ceph get pods
```

## 3. Define the Ceph cluster

Create `rook-ceph-cluster.values.yml`. Replace the node names and example disk IDs with the exact values you recorded. The same disk must not appear under more than one node.

```yaml
operatorNamespace: rook-ceph
clusterName: rook-ceph

cephImage:
  repository: quay.io/ceph/ceph
  tag: v19.2.6-20260818

configOverride: |
  [global]
  osd_pool_default_pg_autoscale_mode = on
  osd_pool_default_size = 3
  osd_pool_default_min_size = 2

cephClusterSpec:
  dataDirHostPath: /var/lib/rook

  mon:
    count: 3

  mgr:
    count: 2

  storage:
    useAllNodes: false
    useAllDevices: false
    config:
      osdsPerDevice: "1"
    nodes:
      - name: "node1"
        devices:
          - name: "/dev/disk/by-id/nvme-example-node1"
      - name: "node2"
        devices:
          - name: "/dev/disk/by-id/nvme-example-node2"
      - name: "node3"
        devices:
          - name: "/dev/disk/by-id/nvme-example-node3"

cephBlockPools:
  - name: akash-deployments
    spec:
      failureDomain: host
      replicated:
        size: 3
      parameters:
        min_size: "2"
        bulk: "true"
    storageClass:
      enabled: true
      name: beta3
      isDefault: true
      reclaimPolicy: Delete
      allowVolumeExpansion: true
      parameters:
        imageFormat: "2"
        imageFeatures: layering
        csi.storage.k8s.io/provisioner-secret-name: rook-csi-rbd-provisioner
        csi.storage.k8s.io/provisioner-secret-namespace: rook-ceph
        csi.storage.k8s.io/controller-expand-secret-name: rook-csi-rbd-provisioner
        csi.storage.k8s.io/controller-expand-secret-namespace: rook-ceph
        csi.storage.k8s.io/node-stage-secret-name: rook-csi-rbd-node
        csi.storage.k8s.io/node-stage-secret-namespace: rook-ceph
        csi.storage.k8s.io/fstype: ext4

cephFileSystems:
cephObjectStores:

toolbox:
  enabled: true
```

For two storage hosts, change both default pool values and the block pool to size `2`, minimum size `1`, and failure domain `host`. For one storage host with at least two disks, use size `2`, minimum size `1`, and failure domain `osd`; set `mon.count` and `mgr.count` to `1` for a one-node cluster.

Use `beta2` for an all-SSD layout or `beta1` when any selected disk is an HDD.

## 4. Install and verify the cluster

Review the file one final time. Installing the chart authorizes Rook to consume the listed disks.

```bash
helm upgrade --install rook-ceph-cluster rook-release/rook-ceph-cluster \
  --namespace rook-ceph \
  --version 1.19.10 \
  --values rook-ceph-cluster.values.yml \
  --wait \
  --timeout 20m
```

Wait for the cluster and inspect its OSDs:

```bash
kubectl --namespace rook-ceph get cephcluster rook-ceph
kubectl --namespace rook-ceph get pods --selector app=rook-ceph-osd --output wide
kubectl --namespace rook-ceph exec deployment/rook-ceph-tools -- ceph status
kubectl --namespace rook-ceph exec deployment/rook-ceph-tools -- ceph osd tree
```

The expected OSD count equals the number of physical disks listed in the values file. Every expected OSD must be `up` and `in` before continuing.

Label the selected StorageClass for Akash:

```bash
kubectl label storageclass beta3 akash.network=true --overwrite
kubectl get storageclass beta3 --show-labels
```

## 5. Prove volume provisioning

Create `test-pvc.yaml`:

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: ceph-test
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
  storageClassName: beta3
```

Create and mount the claim:

```bash
kubectl apply -f test-pvc.yaml
kubectl wait --for=jsonpath='{.status.phase}'=Bound persistentvolumeclaim/ceph-test --timeout=5m
kubectl run ceph-test \
  --image=busybox:1.36 \
  --restart=Never \
  --overrides='{"apiVersion":"v1","spec":{"containers":[{"name":"ceph-test","image":"busybox:1.36","command":["sh","-c","echo ok >/data/result && cat /data/result"],"volumeMounts":[{"name":"data","mountPath":"/data"}]}],"volumes":[{"name":"data","persistentVolumeClaim":{"claimName":"ceph-test"}}]}}'
kubectl wait --for=jsonpath='{.status.phase}'=Succeeded pod/ceph-test --timeout=5m
kubectl logs ceph-test
```

The log must contain `ok`. Remove the test resources:

```bash
kubectl delete pod ceph-test
kubectl delete persistentvolumeclaim ceph-test
```

Only advertise persistent storage after this end-to-end mount succeeds. During provider installation, add exactly the Akash-labelled class (`beta1`, `beta2`, or `beta3`) to the inventory operator and provider attributes.

## Existing-cluster upgrades

Do not treat an existing Ceph cluster like a fresh install. Back up its configuration, review [Rook's upgrade procedure](https://rook.io/docs/rook/v1.19/Upgrade/rook-upgrade/), update Rook CRDs before the operator chart, and upgrade Rook before changing the Ceph image.

Provider Playbook supports the direct Rook `1.18.x` to `1.19.10` path and Ceph `19.2.0` through `19.2.6`. It rejects downgrades and skipped Rook minor-version hops. Its upgrade workflow also performs the CephX AES256K daemon-key rotation required for the pinned Ceph release and waits for healthy daemons between phases.

For a manually managed cluster, follow the [Rook CephX key-rotation procedure](https://rook.io/docs/rook/v1.19/Storage-Configuration/Advanced/cephx-key-rotation/) rather than copying only the fresh-install values above.

## Troubleshooting

### A selected disk does not create an OSD

Check the OSD prepare jobs and verify the stable link still targets the intended whole disk:

```bash
kubectl --namespace rook-ceph get pods --selector app=rook-ceph-osd-prepare
kubectl --namespace rook-ceph logs <osd-prepare-pod>
readlink -f /dev/disk/by-id/<selected-disk-id>
sudo wipefs --no-act /dev/<resolved-disk>
```

Rook rejects disks that are partitioned, mounted, in LVM, or contain signatures. Do not switch to a wildcard filter to work around the rejection.

### The cluster reports `HEALTH_WARN`

```bash
kubectl --namespace rook-ceph exec deployment/rook-ceph-tools -- ceph health detail
```

Initial placement-group warnings can resolve while the cluster converges. Investigate persistent warnings before installing the provider.

### A claim does not bind

```bash
kubectl describe persistentvolumeclaim ceph-test
kubectl --namespace rook-ceph get pods --selector app=csi-rbdplugin-provisioner
kubectl get storageclass beta3 --show-labels
```

After storage validation succeeds, continue to [Provider Installation](/docs/providers/setup-and-installation/kubespray/provider-installation).

## Resources

- [Rook-Ceph 1.19 documentation](https://rook.io/docs/rook/v1.19/)
- [Ceph documentation](https://docs.ceph.com/)
- [Provider Playbook version matrix](https://github.com/akash-network/provider-playbooks/blob/main/versions.yml)
