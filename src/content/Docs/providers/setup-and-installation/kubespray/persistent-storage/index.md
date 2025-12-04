---
categories: ["Providers"]
tags: ["Persistent Storage", "Advanced Features", "Configuration"]
weight: 3
title: "Persistent Storage"
linkTitle: "Persistent Storage"
description: "Enable persistent storage on your Akash provider using Rook-Ceph"
---

> **Don't need persistent storage?** Skip to [Provider Installation](/docs/providers/setup-and-installation/kubespray/provider-installation).

This guide shows how to enable persistent storage on your Akash provider using Rook-Ceph.

**Time:** 45-60 minutes

---

## Prerequisites

Before starting, ensure you have:

### Hardware Requirements

See [Hardware Requirements - Persistent Storage](/docs/providers/getting-started/hardware-requirements#persistent-storage-optional) for detailed specifications:
- **Minimum:** 4 SSDs across all nodes, OR 2 NVMe SSDs across all nodes
- **Drives must be:**
  - Dedicated exclusively to persistent storage
  - Unformatted (no partitions or filesystems)
  - NOT used for OS or ephemeral storage
- **Recommended:** Distribute across multiple nodes for redundancy

### Network Requirements

- **Minimum:** 10 GbE NIC cards for storage nodes
- **Recommended:** 25 GbE or faster for better performance

### Ceph Requirements

For production use:
- **Minimum 3 OSDs** for redundancy and high availability
- **Minimum 2 Ceph managers**
- **Minimum 3 Ceph monitors**
- **Minimum 60 GB** disk space at `/var/lib/ceph/` (each monitor requires 60 GB)

**OSDs per drive:**
- HDD: 1 OSD max
- SSD: 1 OSD max
- NVMe: 2 OSDs max

> **Important:** Do NOT run multiple OSDs on a single SAS/SATA drive. NVMe drives can achieve improved performance with 2 OSDs per drive.

---

## STEP 1 - Identify Storage Nodes and Devices

### List Available Nodes

```bash
kubectl get nodes
```

### Check Available Drives

SSH into each potential storage node and list unformatted drives:

```bash
lsblk -f
```

Look for drives with no `FSTYPE` (unformatted). Example output:

```
NAME   FSTYPE LABEL UUID                                 MOUNTPOINT
sda                                                       
sdb                                                       
sdc    ext4         a1b2c3d4-5678-90ab-cdef-1234567890ab /
```

In this example, `sda` and `sdb` are unformatted and can be used for Ceph.

### Wipe Drives (if needed)

If drives have existing partitions or filesystems, wipe them:

```bash
# WARNING: This destroys all data on the drive!
sudo wipefs -a /dev/sda
sudo wipefs -a /dev/sdb
```

---

## STEP 2 - Install Rook-Ceph Operator

Run from a **control plane node**:

### Add Rook Helm Repository

```bash
helm repo add rook-release https://charts.rook.io/release
helm repo update
```

### Create Rook-Ceph Namespace

```bash
kubectl create namespace rook-ceph
```

### Install Operator

**Standard installation (default kubelet path `/var/lib/kubelet`):**

```bash
helm install rook-ceph-operator rook-release/rook-ceph \
  --namespace rook-ceph \
  --version 1.18.7 \
  --wait \
  --timeout 10m
```

**Custom kubelet path (if you configured a custom path in Kubernetes setup):**

If you configured a custom kubelet directory (e.g., `/data/kubelet`), you need to set the CSI kubelet directory:

```bash
helm install rook-ceph-operator rook-release/rook-ceph \
  --namespace rook-ceph \
  --version 1.18.7 \
  --set csi.kubeletDirPath="/data/kubelet" \
  --wait \
  --timeout 10m
```

### Verify Operator

```bash
kubectl -n rook-ceph get pods
```

**Expected output:**

```
NAME                                 READY   STATUS    RESTARTS   AGE
rook-ceph-operator-xxx               1/1     Running   0          2m
rook-discover-xxx                    1/1     Running   0          2m
rook-discover-yyy                    1/1     Running   0          2m
```

---

## STEP 3 - Deploy Ceph Cluster

### Create Cluster Configuration

Create a file with your storage node and device information:

```bash
cat > rook-ceph-cluster.values.yml << 'EOF'
operatorNamespace: rook-ceph

configOverride: |
  [global]
  osd_pool_default_pg_autoscale_mode = on
  osd_pool_default_size = 3
  osd_pool_default_min_size = 2

cephClusterSpec:
  dataDirHostPath: /var/lib/rook  # Change if using custom mount point
  
  mon:
    count: 3
  
  mgr:
    count: 2

  storage:
    useAllNodes: false
    useAllDevices: false
    deviceFilter: "^sd[ab]"  # Adjust to match your devices
    config:
      osdsPerDevice: "1"     # Set to "2" for NVMe drives
    nodes:
    - name: "node1"          # Replace with your actual node names
    - name: "node2"
    - name: "node3"

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
      name: beta2                # SSD storage class
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

# Do not create default Ceph file systems or object stores
cephFileSystems:
cephObjectStores:

# Spawn rook-ceph-tools for troubleshooting
toolbox:
  enabled: true
EOF
```

**Important Configuration:**

- **dataDirHostPath:** Default is `/var/lib/rook`
  - If using a custom mount point (e.g., RAID array at `/data`), change to `/data/rook`
  - This directory stores Ceph monitor and manager data (not OSD data)
- **deviceFilter:** Adjust to match your drives
  - SATA/SAS drives: `"^sd[ab]"`
  - NVMe drives: `"^nvme[01]n1"`
- **osdsPerDevice:** 
  - NVMe drives: `"2"`
  - HDD/SSD drives: `"1"`
- **nodes:** Replace with your actual storage node names from `kubectl get nodes`
- **storageClass name:** 
  - HDD: `beta1`
  - SSD: `beta2`
  - NVMe: `beta3`

### Install Cluster

```bash
helm install rook-ceph-cluster rook-release/rook-ceph-cluster \
  --namespace rook-ceph \
  --version 1.18.7 \
  -f rook-ceph-cluster.values.yml
```

This will take **5-10 minutes** to deploy.

---

## STEP 4 - Verify Ceph Cluster

### Check Cluster Status

```bash
kubectl -n rook-ceph get cephcluster
```

**Expected output:**

```
NAME        DATADIRHOSTPATH   MONCOUNT   AGE   PHASE   MESSAGE                        HEALTH
rook-ceph   /var/lib/rook     3          5m    Ready   Cluster created successfully   HEALTH_OK
```

Wait until `PHASE` is `Ready` and `HEALTH` is `HEALTH_OK`.

### Check OSDs

```bash
kubectl -n rook-ceph get pods -l app=rook-ceph-osd
```

You should see OSD pods running on your storage nodes.

### Check Ceph Status

Use the Ceph toolbox to check cluster health:

```bash
kubectl -n rook-ceph exec -it deploy/rook-ceph-tools -- ceph status
```

**Expected output:**

```
  cluster:
    id:     a1b2c3d4-5678-90ab-cdef-1234567890ab
    health: HEALTH_OK
 
  services:
    mon: 3 daemons, quorum a,b,c
    mgr: a(active), standbys: b
    osd: 6 osds: 6 up, 6 in
```

### Check Storage Class

```bash
kubectl get storageclass
```

**Expected output:**

```
NAME                 PROVISIONER                  RECLAIMPOLICY   VOLUMEBINDINGMODE   AGE
beta2 (default)      rook-ceph.rbd.csi.ceph.com   Delete          Immediate           5m
```

---

## STEP 5 - Test Persistent Storage

Create a test PVC to verify storage is working:

```bash
cat > test-pvc.yaml << 'EOF'
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: test-pvc
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
  storageClassName: beta2
EOF

kubectl apply -f test-pvc.yaml
```

### Verify PVC

```bash
kubectl get pvc test-pvc
```

**Expected output:**

```
NAME       STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
test-pvc   Bound    pvc-a1b2c3d4-5678-90ab-cdef-1234567890ab   1Gi        RWO            beta2          10s
```

Status should be `Bound`.

### Cleanup

```bash
kubectl delete pvc test-pvc
```

---

## Troubleshooting

### Check Operator Logs

```bash
kubectl -n rook-ceph logs -l app=rook-ceph-operator
```

### Check Ceph Logs

```bash
kubectl -n rook-ceph exec -it deploy/rook-ceph-tools -- ceph -s
kubectl -n rook-ceph exec -it deploy/rook-ceph-tools -- ceph osd tree
kubectl -n rook-ceph exec -it deploy/rook-ceph-tools -- ceph osd status
```

### Common Issues

**OSDs not starting:**
- Verify drives are unformatted: `lsblk -f`
- Check deviceFilter matches your drives
- Review OSD pod logs: `kubectl -n rook-ceph logs <osd-pod-name>`

**HEALTH_WARN:**
- Check `ceph status` for specific warnings
- Common warnings during initial setup are normal and will resolve

**No PVC binding:**
- Verify storage class exists: `kubectl get sc`
- Check CSI provisioner is running: `kubectl -n rook-ceph get pods -l app=csi-rbdplugin-provisioner`

---

## Next Steps

Your persistent storage is now ready!

**→ [Provider Installation](/docs/providers/setup-and-installation/kubespray/provider-installation)** - Install the Akash provider

**Optional enhancements:**
- [TLS Certificates](/docs/providers/setup-and-installation/kubespray/tls-certificates) - Automatic SSL certificates
- [IP Leases](/docs/providers/setup-and-installation/kubespray/ip-leases) - Enable static IPs

> **Note:** You'll need to configure storage classes in the inventory operator during provider installation to advertise persistent storage capabilities. This is covered in the Provider Installation guide.

---

## Additional Resources

- [Rook Documentation](https://rook.io/docs/rook/latest-release/)
- [Ceph Documentation](https://docs.ceph.com/)
- [Storage Class Benchmarking Script](https://github.com/masonr/yet-another-bench-script)
