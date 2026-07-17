---
categories: ["Providers"]
tags: ["GPU", "InfiniBand", "RDMA", "NVIDIA Operators", "Configuration"]
weight: 2
title: "GPU & InfiniBand Support"
linkTitle: "GPU Support"
description: "Enable NVIDIA GPUs — and optional InfiniBand RDMA — on your Akash provider using the NVIDIA GPU Operator and Network Operator"
---

This guide enables NVIDIA GPU support on your Akash provider using the **NVIDIA GPU Operator**, which manages the driver, container toolkit, device plugin, and validation entirely in containers — no driver installs on the host.

It also covers an **optional** InfiniBand / RDMA section ([Part 2](#part-2--infiniband--rdma-optional)) for providers whose GPU nodes have Mellanox/NVIDIA ConnectX HCAs and need a high-speed fabric for multi-node GPU workloads (NCCL). InfiniBand is **not** required to run a GPU provider — skip Part 2 if your nodes have no IB hardware.

> **Don't have GPUs?** Skip to [Persistent Storage (Rook-Ceph)](/docs/providers/setup-and-installation/kubespray/persistent-storage) or [Provider Installation](/docs/providers/setup-and-installation/kubespray/provider-installation).

**Time:** 30–45 minutes for GPU (add 30–60 minutes for the optional InfiniBand section, including the MOFED kernel-module compile).

---

## Prerequisites

- Kubernetes cluster deployed via [Kubespray](/docs/providers/setup-and-installation/kubespray/kubernetes-setup) (kubeadm + Calico CNI + containerd)
- **Clean GPU nodes** — no pre-installed NVIDIA drivers, CUDA, or MOFED/OFED on the host. The operators manage all drivers in containers, and a host driver will conflict.

For the optional InfiniBand section, additionally:

- Mellanox/NVIDIA ConnectX InfiniBand HCAs in the GPU nodes
- InfiniBand fabric cabled and managed (a switch running a Subnet Manager, or OpenSM on a node)
- All IB ports showing `State: Active` (`ibstat` on the host)

> **Note:** The GPU Operator replaces the older manual host-driver workflow. The hard requirement is that **no NVIDIA driver, CUDA, or MOFED/OFED is installed on the host** — remove any before starting. The GPU Operator manages the container toolkit and containerd runtime for you, so the optional NVIDIA-runtime step in [Kubernetes Setup – Step 7](/docs/providers/setup-and-installation/kubespray/kubernetes-setup#step-7---configure-gpu-support-optional) is not required for this path (it is harmless if already applied).

---

# Part 1 — GPU Operator

Every GPU provider uses this path.

## Step 1 — Verify Clean Nodes

Run on **each GPU node**:

```bash
# Confirm no host NVIDIA driver is installed
dpkg -l | grep -E "nvidia|cuda" | grep -v lib
lsmod | grep nvidia
which nvidia-smi
# All should return empty. If a host driver is present:
#   sudo apt purge --autoremove 'nvidia-*' 'cuda-drivers*' -y && sudo reboot

# Identify GPU hardware
lspci | grep -i nvidia
```

### Fabric Manager Decision

SXM (HGX/DGX) boards use NVLink/NVSwitch and require the Fabric Manager; PCIe cards do not.

| GPU form factor | Fabric Manager |
| --- | --- |
| Any SXM (HGX/DGX) — A100, H100, H200, B200, B300 | Required (`fabricManager.enabled: true`) |
| Any PCIe — A100-PCIe, L40S, A6000, RTX, etc. | Not needed (`fabricManager.enabled: false`) |

Check the form factor:

```bash
lspci -v | grep -A5 -i nvidia | grep -i "subsystem"
# "SXM" in the output → needs Fabric Manager
# No "SXM"           → PCIe, no Fabric Manager needed
```

## Step 2 — Install the GPU Operator

Add the NVIDIA Helm repo:

```bash
helm repo add nvidia https://helm.ngc.nvidia.com/nvidia
helm repo update
```

Pin the chart to the current stable patch (**`v26.3.3`**). NVIDIA GPU Operator charts use CalVer (`vYY.MM.PP`).

Create `gpu-operator-values.yaml`:

```yaml
operator:
  defaultRuntime: containerd

driver:
  enabled: true
  rdma:
    enabled: false       # ← Leave false unless you are doing Part 2 (InfiniBand)
    useHostMofed: false

fabricManager:
  enabled: false         # ← Set true for SXM GPUs (see table above)

migManager:
  enabled: false

dcgmExporter:
  enabled: true

nodeStatusExporter:
  enabled: true
```

> **Why `driver.rdma.enabled: false` by default?** With RDMA enabled, the GPU driver pod's init container waits for MOFED (from the Network Operator) and will sit in `Init:0/1` forever if the Network Operator is not installed. Enable it only in [Part 2](#part-2--infiniband--rdma-optional).

### First deploy — CRDs

`helm upgrade --install` **skips** a chart's `crds/` directory. On a first deploy that causes failures like `no matches for kind "ClusterPolicy"`. Use `helm install` for the initial release (or pre-apply CRDs — see [Troubleshooting](#troubleshooting)).

Deploy (first install):

```bash
helm install gpu-operator nvidia/gpu-operator \
  --namespace gpu-operator \
  --create-namespace \
  --version v26.3.3 \
  -f gpu-operator-values.yaml
```

Later upgrades can use `helm upgrade` with the same `--version` and values file.

Watch the rollout until every pod is `Running` and validators succeed:

```bash
kubectl -n gpu-operator get pods -w

# Healthy end state
kubectl -n gpu-operator get pods | grep -E 'cuda-validator|operator-validator'
# nvidia-cuda-validator-*     Completed
# nvidia-operator-validator-* Running
```

> **Note:** Driver pods may crashloop briefly during the first bring-up while dependencies start, then self-heal. Wait for the validators above before treating it as a failure.
## Step 3 — Verify GPUs

Check allocatable GPUs per node:

```bash
kubectl get nodes -o custom-columns=\
NAME:.metadata.name,\
GPUs:.status.allocatable.nvidia\\.com/gpu
```

Expected:

```
NAME    GPUs
node1   8
node2   8
```

Run a GPU test:

```bash
kubectl run gpu-test --rm -it --restart=Never \
  --image=nvidia/cuda:12.4.0-base-ubuntu22.04 \
  --limits=nvidia.com/gpu=1 \
  -- nvidia-smi
```

You should see the GPUs listed with driver information. If your nodes have no InfiniBand hardware, you're done — continue to [Next Steps](#next-steps).

---

# Part 2 — InfiniBand / RDMA (optional)

> **Only for GPU nodes with Mellanox/NVIDIA ConnectX InfiniBand HCAs.** This section adds the NVIDIA Network Operator (MOFED + the RDMA shared device plugin) and re-enables RDMA in the GPU Operator so multi-node GPU workloads can use the IB fabric for NCCL. If your nodes have no IB hardware, skip this section entirely.

## Step 4 — Verify IB Hardware

Run on **each GPU+IB node**:

```bash
# Confirm no host MOFED is installed (the Network Operator provides its own)
dpkg -l | grep mlnx-ofed
# Should be empty. In-kernel mlx5_core / ib_core modules are fine — the
# Network Operator replaces them with its MOFED versions.

# Identify IB hardware
lspci | grep -i mellanox
# e.g. 1b:00.0 Infiniband controller: Mellanox Technologies MT28908 [ConnectX-6]

# Get the PCI device ID (needed for the NicClusterPolicy)
lspci -n | grep 15b3
# e.g. 1b:00.0 0207: 15b3:101b   ← "101b" is the device ID

# Confirm IB ports are Active
ibstat | grep -E "State|Link layer|Rate"
# Must show: State: Active, Link layer: InfiniBand
```

### ConnectX Device ID Reference

| Card | PCI device ID |
| --- | --- |
| ConnectX-4 | `1013` |
| ConnectX-5 | `1017` |
| ConnectX-5 Ex | `1019` |
| ConnectX-6 | `101b` |
| ConnectX-6 Dx | `101d` |
| ConnectX-7 | `1021` |
| BlueField-2 | `a2d6` |
| BlueField-3 | `a2dc` |

> **Verify against your own hardware** with `lspci -n | grep 15b3` — the device ID in the `15b3:XXXX` pair is what goes into the NicClusterPolicy `deviceIDs` selector.

## Step 5 — Install the Network Operator

Pin the chart to **`26.1.1`** (CalVer `YY.MM.PP`). Unpinned installs can pull a newer chart (for example `26.4.0`) whose CRDs/images do not match the NicClusterPolicy below.

Same CRD rule as the GPU Operator: use `helm install` on first deploy (or pre-apply CRDs). `helm upgrade --install` skips `crds/` and fails with `no matches for kind "NodeFeatureRule"`.

```bash
helm install network-operator nvidia/network-operator \
  --namespace nvidia-network-operator \
  --create-namespace \
  --version 26.1.1 \
  --set deployCR=false \
  --set nfd.enabled=true
```

- `deployCR=false` — apply the `NicClusterPolicy` yourself in the next step.
- `nfd.enabled=true` — Node Feature Discovery (required; the chart registers `NodeFeatureRule` CRDs).

Later upgrades: `helm upgrade network-operator nvidia/network-operator --version 26.1.1 ...` with the same flags.

## Step 6 — Apply the NicClusterPolicy

Create `nic-cluster-policy.yaml`. Set `deviceIDs` from Step 4 (`lspci -n | grep 15b3`). Example below uses **`101b`** (ConnectX-6); change it if your cards differ.

Component image tags are pinned to **Network Operator v26.1.1** (`network-operator-v26.1.1` and DOCA driver `doca3.3.0-26.01-1.0.0.0-0`). Keep them aligned with the chart version from Step 5.

```yaml
apiVersion: mellanox.com/v1alpha1
kind: NicClusterPolicy
metadata:
  name: nic-cluster-policy
spec:
  ofedDriver:
    image: doca-driver
    repository: nvcr.io/nvidia/mellanox
    version: "doca3.3.0-26.01-1.0.0.0-0"
    upgradePolicy:
      autoUpgrade: true
      maxParallelUpgrades: 1
      safeLoad: false
      drain:
        enable: true
        force: true
        timeoutSeconds: 300
        deleteEmptyDir: true

  rdmaSharedDevicePlugin:
    image: k8s-rdma-shared-dev-plugin
    repository: nvcr.io/nvidia/mellanox
    version: "network-operator-v26.1.1"
    config: |
      {
        "configList": [
          {
            "resourceName": "rdma_shared_device_ib",
            "rdmaHcaMax": 63,
            "selectors": {
              "vendors": ["15b3"],
              "deviceIDs": ["101b"]
            }
          }
        ]
      }

  secondaryNetwork:
    cniPlugins:
      image: plugins
      repository: nvcr.io/nvidia/mellanox
      version: "network-operator-v26.1.1"
    multus:
      image: multus-cni
      repository: nvcr.io/nvidia/mellanox
      version: "network-operator-v26.1.1"
    ipoib:
      image: ipoib-cni
      repository: nvcr.io/nvidia/mellanox
      version: "network-operator-v26.1.1"

  nvIpam:
    image: nvidia-k8s-ipam
    repository: nvcr.io/nvidia/mellanox
    version: "network-operator-v26.1.1"
    enableWebhook: false
```

> **Version tags:** the `doca-driver` and `network-operator-v26.1.1` tags above match Network Operator chart `26.1.1`. If you change the chart version, update these tags from the [NGC catalog](https://catalog.ngc.nvidia.com/) / [Network Operator release notes](https://docs.nvidia.com/networking/display/kubernetes/network-operator).

**CRD schema notes (Network Operator v26.1.x):**

- `rdmaSharedDevicePlugin` takes a `config` field (a JSON string), **not** a `resources` array.
- Resource name must be `rdma_shared_device_ib` with `rdmaHcaMax: 63` (Akash interconnect expects this resource).
- `nvIpam` is a **top-level** `spec` field, **not** nested under `secondaryNetwork`.
- `secondaryNetwork` accepts only `cniPlugins`, `multus`, and `ipoib`.
- Component versions should match the operator version (`network-operator-v26.1.1`).

Apply it:

```bash
kubectl apply -f nic-cluster-policy.yaml
```

Wait for MOFED to compile (5–10 minutes on first deploy) and all pods to reach `Running`:

```bash
kubectl -n nvidia-network-operator get pods -w

# MOFED compile progress
kubectl -n nvidia-network-operator logs -l app=mofed-ubuntu24.04 -f --tail=10
```

Expected pods when complete:

```
mofed-ubuntu24.04-*     1/1  Running   ← one per node, MOFED loaded
rdma-shared-dp-ds-*     1/1  Running   ← RDMA device plugin per node
kube-multus-ds-*        1/1  Running
cni-plugins-ds-*        1/1  Running
kube-ipoib-cni-ds-*     1/1  Running
nv-ipam-controller-*    1/1  Running
nv-ipam-node-*          1/1  Running
network-operator-*      1/1  Running
```

## Step 7 — Enable RDMA in the GPU Operator

Now that MOFED is available, re-enable RDMA in the GPU Operator so the driver loads `nvidia-peermem` for GPUDirect RDMA. Edit `gpu-operator-values.yaml`:

```yaml
driver:
  enabled: true
  rdma:
    enabled: true        # ← Now true; MOFED is present
    useHostMofed: false
```

Re-apply (chart already installed — `helm upgrade` is correct here; CRDs are already present):

```bash
helm upgrade gpu-operator nvidia/gpu-operator \
  --namespace gpu-operator \
  --version v26.3.3 \
  -f gpu-operator-values.yaml
```

The GPU driver daemonset rolls; the driver init container detects MOFED and loads `nvidia-peermem`. Wait for the driver pods and `nvidia-operator-validator` to return to `Running`/complete:

```bash
kubectl -n gpu-operator get pods -w
```

## Step 8 — Verify RDMA

Check allocatable RDMA devices per node (`rdmaHcaMax` was `63`):

```bash
kubectl get nodes -o json | \
  jq -r '.items[] | "\(.metadata.name) rdma=\(.status.allocatable["rdma/rdma_shared_device_ib"] // "none")"'
```

Expected:

```
node1 rdma=63
node2 rdma=63
```

### Cross-Node Bandwidth Test

Server on `node1`:

```bash
kubectl run ib-server --image=mellanox/rping-test --restart=Never \
  --overrides='{
    "spec": {
      "nodeName": "node1",
      "containers": [{
        "name": "s",
        "image": "mellanox/rping-test",
        "command": ["ib_write_bw", "-d", "mlx5_0", "--report_gbits"],
        "resources": {"limits": {"rdma/rdma_shared_device_ib": "1"}},
        "securityContext": {"capabilities": {"add": ["IPC_LOCK"]}}
      }]
    }
  }'
```

Client on `node2`:

```bash
SERVER_IP=$(kubectl get pod ib-server -o jsonpath='{.status.podIP}')

kubectl run ib-client --image=mellanox/rping-test --restart=Never \
  --overrides="{
    \"spec\": {
      \"nodeName\": \"node2\",
      \"containers\": [{
        \"name\": \"c\",
        \"image\": \"mellanox/rping-test\",
        \"command\": [\"ib_write_bw\", \"-d\", \"mlx5_0\", \"$SERVER_IP\", \"--report_gbits\"],
        \"resources\": {\"limits\": {\"rdma/rdma_shared_device_ib\": \"1\"}},
        \"securityContext\": {\"capabilities\": {\"add\": [\"IPC_LOCK\"]}}
      }]
    }
  }"

kubectl logs ib-client
# Approximate full-port line rates: ~197 Gb/s (HDR), ~100 Gb/s (HDR100 / EDR)

kubectl delete pod ib-server ib-client
```

> **NCCL configuration is handled by the Akash provider.** You do not configure NCCL on the cluster. When a tenant requests GPU interconnect in the SDL, the provider auto-injects the NCCL environment (`NCCL_IB_DISABLE=0`, `NCCL_IB_HCA` from the node's discovered HCA families, `NCCL_IB_GID_INDEX=3` on RoCE) and requests one `rdma/rdma_shared_device_ib` handle per GPU. Provider setup ends once the node advertises the GPU and RDMA resources verified above.

---

## Deployment Order Summary

```
GPU-only provider:
  1. Kubespray (kubeadm + Calico + containerd)
  2. GPU Operator (driver.rdma.enabled: false)
  3. Nodes report nvidia.com/gpu

Adding InfiniBand:
  4. Network Operator (helm)
  5. NicClusterPolicy → MOFED compile + RDMA device plugin
        ↓ wait for MOFED pods Running
  6. GPU Operator helm upgrade (driver.rdma.enabled: true)
        ↓ driver reloads, loads nvidia-peermem
  7. Nodes report nvidia.com/gpu AND rdma/rdma_shared_device_ib
```

---

## Troubleshooting

**`no matches for kind "ClusterPolicy"` or `"NodeFeatureRule"`** — Helm skipped CRDs because the release was created with `helm upgrade --install`. On first deploy use `helm install`, **or** pre-apply CRDs then upgrade:

```bash
# GPU Operator CRDs
helm pull nvidia/gpu-operator --version v26.3.3 --untar
kubectl create -f gpu-operator/crds/
helm upgrade -i gpu-operator nvidia/gpu-operator \
  --namespace gpu-operator --create-namespace \
  --version v26.3.3 -f gpu-operator-values.yaml

# Network Operator CRDs
helm pull nvidia/network-operator --version 26.1.1 --untar
kubectl create -f network-operator/crds/
helm upgrade -i network-operator nvidia/network-operator \
  --namespace nvidia-network-operator --create-namespace \
  --version 26.1.1 --set deployCR=false --set nfd.enabled=true
```

**GPU driver pod stuck in `Init:0/1`** — the driver init container is waiting for MOFED. This happens when `driver.rdma.enabled: true` but the Network Operator/MOFED is not ready. Either finish Part 2 or set `driver.rdma.enabled: false`.

```bash
kubectl -n nvidia-network-operator get pods | grep mofed
kubectl -n nvidia-network-operator logs -l app=mofed-ubuntu24.04 --tail=20
```

**Driver pods crashloop then recover** — common during first bring-up while the toolkit / device plugin / MOFED ordering settles. Wait for `nvidia-cuda-validator` = `Completed` and `nvidia-operator-validator` = `Running` before debugging further.

**NicClusterPolicy rejected with schema errors** — the CRD schema changes between operator versions. Inspect what your version accepts:

```bash
# Top-level spec fields
kubectl get crd nicclusterpolicies.mellanox.com -o json | \
  jq '.spec.versions[0].schema.openAPIV3Schema.properties.spec.properties | keys'

# secondaryNetwork sub-fields
kubectl get crd nicclusterpolicies.mellanox.com -o json | \
  jq '.spec.versions[0].schema.openAPIV3Schema.properties.spec.properties.secondaryNetwork.properties | keys'
```

**RDMA resources show 0** — check the device plugin logs and confirm `deviceIDs` matches your hardware:

```bash
kubectl -n nvidia-network-operator logs -l app=rdma-shared-dp --tail=20
lspci -n | grep 15b3
```

**IPoIB CNI errors during bring-up** — the NicClusterPolicy deploys an IPoIB CNI, but RDMA verbs traffic does not use it — it goes directly over the HCA, bypassing the kernel network stack. IPoIB errors in `dmesg` do not affect RDMA and won't show up in the `ib_write_bw` verification above.

---

## Next Steps

Your cluster now has GPU support (and optionally InfiniBand RDMA).

- [Provider installation – STEP 9 (TLS)](/docs/providers/setup-and-installation/kubespray/provider-installation-prep#step-9---lets-encrypt-cert-manager-and-tls-secrets) — **required** for all providers: cert-manager and Gateway TLS
- [IP Leases](/docs/providers/setup-and-installation/kubespray/ip-leases) — enable static IPs

> **Note:** After installing the provider, add GPU attributes to your `provider.yaml` to advertise GPU capabilities — and `capabilities/gpu-interconnect` plus `capabilities/gpu-interconnect/fabric/infiniband` (or `.../fabric/roce`) if you completed Part 2. See [Provider Attributes — GPU Interconnect](/docs/providers/operations/provider-attributes/#gpu-interconnect-infiniband--roce).

