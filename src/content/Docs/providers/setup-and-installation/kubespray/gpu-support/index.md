---
categories: ["Providers"]
tags: ["GPU", "InfiniBand", "RoCE", "RDMA", "NVIDIA Operators", "Configuration"]
weight: 2
title: "GPU & InfiniBand / RoCE Support"
linkTitle: "GPU Support"
description: "Enable NVIDIA GPUs — and optional InfiniBand or RoCE RDMA — on your Akash provider using the NVIDIA GPU Operator and Network Operator"
---

This guide enables NVIDIA GPU support on your Akash provider using the **NVIDIA GPU Operator**, which manages the driver, container toolkit, device plugin, and validation entirely in containers — no driver installs on the host.

It also covers an **optional** InfiniBand / RDMA section ([Part 2](#part-2--infiniband--rdma-optional)) for providers whose GPU nodes have Mellanox/NVIDIA ConnectX HCAs and need a high-speed fabric for multi-node GPU workloads (NCCL), and a **RoCE rail networks** section ([Part 3](#part-3--roce-rail-networks-optional)) for clusters whose ConnectX ports run in **Ethernet** mode (RoCEv2, common on rail-optimized H100/H200 systems). Neither is required to run a GPU provider — skip Parts 2 and 3 if your nodes have no RDMA-capable hardware.

> **Don't have GPUs?** Skip to [Persistent Storage (Rook-Ceph)](/docs/providers/setup-and-installation/kubespray/persistent-storage) or [Provider Installation](/docs/providers/setup-and-installation/kubespray/provider-installation).

**Time:** 30–45 minutes for GPU (add 30–60 minutes for the optional InfiniBand section, including the MOFED kernel-module compile; add another 20–30 minutes for RoCE rail networks).

---

## Prerequisites

- Kubernetes cluster deployed via [Kubespray](/docs/providers/setup-and-installation/kubespray/kubernetes-setup) (kubeadm + Calico CNI + containerd)
- **Clean GPU nodes** — no pre-installed NVIDIA driver, CUDA driver package, NVIDIA Container Toolkit, or legacy NVIDIA device-plugin Helm release. For the optional RDMA flow, do not preinstall MOFED/OFED. The operators manage these components, and host-managed copies conflict.

For the optional InfiniBand section, additionally:

- Mellanox/NVIDIA ConnectX InfiniBand HCAs in the GPU nodes
- InfiniBand fabric cabled and managed (a switch running a Subnet Manager, or OpenSM on a node)
- All IB ports showing `State: Active` (`ibstat` on the host)

For RoCE (Part 3), instead of the InfiniBand fabric items:

- ConnectX ports in **Ethernet** mode (`ibstat` shows `Link layer: Ethernet`), cabled to an Ethernet fabric — no Subnet Manager involved
- A dedicated IP subnet per rail (assigned in [Part 3](#part-3--roce-rail-networks-optional))
- Provider version **0.16.2 or later** (RoCE rail network attachment)

> **Note:** The GPU Operator replaces the older manual host-driver workflow. The hard requirement is that **no NVIDIA driver, CUDA driver package, Container Toolkit, or MOFED/OFED is installed on the host** — remove any before starting. The GPU Operator manages the toolkit and CDI integration after Kubernetes is available, as described in [Kubernetes Setup – Step 7](/docs/providers/setup-and-installation/kubespray/kubernetes-setup#step-7---prepare-for-gpu-support-optional).

> **Provider Playbook:** The automated installer reads PCI vendor, device, and class IDs from Linux sysfs on every configured worker and matches them against its checksum-pinned [`provider-configs`](https://github.com/akash-network/provider-configs) database. It derives the canonical model, VRAM, and PCIe/SXM interface automatically; CUDA `13.0` comes from the playbook's central version matrix.

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

| GPU form factor                                  | Fabric Manager                              |
| ------------------------------------------------ | ------------------------------------------- |
| Any SXM (HGX/DGX) — A100, H100, H200, B200, B300 | Required (`fabricManager.enabled: true`)    |
| Any PCIe — A100-PCIe, L40S, A6000, RTX, etc.     | Not needed (`fabricManager.enabled: false`) |

Do not infer the form factor from the absence of the word `SXM` in `lspci`; many systems do not expose that text. Match the numeric PCI ID to the [`provider-configs` GPU database](https://github.com/akash-network/provider-configs) or confirm the board form factor in the server or GPU vendor documentation. The Provider Playbook performs the PCI-ID lookup automatically.

## Step 2 — Install the GPU Operator

Add the NVIDIA Helm repo:

```bash
helm repo add nvidia https://helm.ngc.nvidia.com/nvidia
helm repo update
```

Pin the chart to **`v26.7.0`**. NVIDIA GPU Operator charts use CalVer (`vYY.MM.PP`).

Create `gpu-operator-values.yaml`:

```yaml
cdi:
  enabled: true
  nriPluginEnabled: false # Kubespray; the Provider Playbook enables this for its pinned K3s runtime

toolkit:
  env: []

hostPaths:
  kubeletRootDir: "/var/lib/kubelet" # Match a custom kubelet root if configured

driver:
  enabled: true
  rdma:
    enabled: false # ← Keep false for DMA-BUF; true enables legacy nvidia-peermem
    useHostMofed: false

fabricManager:
  enabled: false # ← Set true for SXM GPUs (see table above)

migManager:
  enabled: false

dcgmExporter:
  enabled: true

nodeStatusExporter:
  enabled: true
```

> **Why `driver.rdma.enabled: false` by default?** GPU Operator 26.7 uses the recommended DMA-BUF path for GPUDirect RDMA without this setting. Enabling it opts into the legacy `nvidia-peermem` module and makes the driver pod wait for MOFED.

### Reconcile CRDs before every install or upgrade

Helm does not upgrade CRDs stored in a chart's `crds/` directory. Pull the pinned chart and apply both the GPU Operator and bundled Node Feature Discovery CRDs before the release:

```bash
rm -rf /tmp/akash-gpu-operator-chart
helm pull nvidia/gpu-operator \
  --version v26.7.0 \
  --untar \
  --untardir /tmp/akash-gpu-operator-chart

kubectl apply --server-side --force-conflicts \
  --filename /tmp/akash-gpu-operator-chart/gpu-operator/crds \
  --filename /tmp/akash-gpu-operator-chart/gpu-operator/charts/node-feature-discovery/crds/nfd-api-crds.yaml

helm upgrade --install gpu-operator nvidia/gpu-operator \
  --namespace gpu-operator \
  --create-namespace \
  --version v26.7.0 \
  -f gpu-operator-values.yaml
```

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

Run a CUDA 13.0 GPU test. Create `gpu-test.yaml`:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: gpu-test
spec:
  restartPolicy: Never
  containers:
    - name: nvidia-smi
      image: nvidia/cuda:13.0.3-base-ubuntu24.04
      command: ["nvidia-smi"]
      resources:
        limits:
          nvidia.com/gpu: 1
```

```bash
kubectl apply -f gpu-test.yaml
kubectl wait --for=jsonpath='{.status.phase}'=Succeeded pod/gpu-test --timeout=5m
kubectl logs gpu-test
kubectl delete pod gpu-test
```

You should see the GPUs listed with driver information. If your nodes have no InfiniBand hardware, you're done — continue to [Next Steps](#next-steps).

---

# Part 2 — InfiniBand / RDMA (optional)

> **Only for GPU nodes with Mellanox/NVIDIA ConnectX HCAs.** This section adds the NVIDIA Network Operator (DOCA-OFED plus the RDMA shared device plugin) so multi-node GPU workloads can use the fabric for NCCL. If your nodes have no ConnectX hardware, skip this section entirely. **RoCE clusters** (ConnectX ports in Ethernet mode) complete this section too — where a step below says `Link layer: InfiniBand`, expect `Ethernet` — then continue to [Part 3](#part-3--roce-rail-networks-optional).

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
# (RoCE clusters: Link layer: Ethernet — expected; continue to Part 3 after this Part)
```

### Supported Adapter Families

Network Operator 26.7 has been validated with ConnectX-6, ConnectX-6 Dx, ConnectX-7, ConnectX-8, ConnectX-9, and BlueField-3 adapters. Protocol support differs by adapter, so check the [Network Operator 26.7 platform support matrix](https://docs.nvidia.com/networking/display/kubernetes2670/platform-support.html) before deployment.

Always read the exact PCI device ID from your own hardware with `lspci -n | grep 15b3`. The ID in the `15b3:XXXX` pair is what goes into the NicClusterPolicy `deviceIDs` selector; do not infer it from the product-family name.

## Step 5 — Install the Network Operator

Pin the chart to **`26.7.0`** (CalVer `YY.MM.PP`). This release supports Kubernetes 1.32 through 1.36. Keep the chart, component images, and NicClusterPolicy schema aligned.

The GPU Operator already supplies Node Feature Discovery. NVIDIA supports only one NFD deployment per cluster, so disable the Network Operator's copy. Network Operator manages its own CRD upgrades through Helm hooks.

```bash
helm upgrade --install network-operator nvidia/network-operator \
  --namespace nvidia-network-operator \
  --create-namespace \
  --version 26.7.0 \
  --set nfd.enabled=false
```

Apply the `NicClusterPolicy` yourself in the next step. On later upgrades, use the same chart version and NFD setting.

## Step 6 — Apply the NicClusterPolicy

Create `nic-cluster-policy.yaml`. Set `deviceIDs` from Step 4 (`lspci -n | grep 15b3`). Example below uses **`101b`** (ConnectX-6); change it if your cards differ.

Component image tags are pinned to **Network Operator v26.7.0** (`network-operator-v26.7.0` and DOCA driver `doca3.5.0-26.07-0.7.7.0-0`). Keep them aligned with the chart version from Step 5.

```yaml
apiVersion: mellanox.com/v1alpha1
kind: NicClusterPolicy
metadata:
  name: nic-cluster-policy
spec:
  ofedDriver:
    image: doca-driver
    repository: nvcr.io/nvidia/mellanox
    version: "doca3.5.0-26.07-0.7.7.0-0"
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
    version: "network-operator-v26.7.0"
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
      version: "network-operator-v26.7.0"
    multus:
      image: multus-cni
      repository: nvcr.io/nvidia/mellanox
      version: "network-operator-v26.7.0"
    ipoib:
      image: ipoib-cni
      repository: nvcr.io/nvidia/mellanox
      version: "network-operator-v26.7.0"

  nvIpam:
    image: nvidia-k8s-ipam
    repository: nvcr.io/nvidia/mellanox
    version: "network-operator-v26.7.0"
    enableWebhook: false
```

> **Version tags:** the `doca-driver` and `network-operator-v26.7.0` tags above match Network Operator chart `26.7.0`. If you change the chart version, update these tags from the [NGC catalog](https://catalog.ngc.nvidia.com/) and [Network Operator release notes](https://docs.nvidia.com/networking/display/kubernetes/network-operator).

**CRD schema notes (Network Operator v26.7.x):**

- `rdmaSharedDevicePlugin` takes a `config` field (a JSON string), **not** a `resources` array.
- Resource name must be `rdma_shared_device_ib` with `rdmaHcaMax: 63` (Akash interconnect expects this resource).
- `nvIpam` is a **top-level** `spec` field, **not** nested under `secondaryNetwork`.
- `secondaryNetwork` accepts only `cniPlugins`, `multus`, and `ipoib`.
- Component versions should match the operator version (`network-operator-v26.7.0`).

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

## Step 7 — Keep DMA-BUF as the GPUDirect path

GPU Operator 26.7 uses DMA-BUF for the standard GPUDirect RDMA path. Keep `driver.rdma.enabled: false`; enabling it specifically opts into the legacy `nvidia-peermem` module and is not required for general InfiniBand or RoCE support.

DMA-BUF requires an open NVIDIA kernel module, Linux kernel 5.12 or later, CUDA 11.7 or later, and a supported Turing-or-newer GPU. If your hardware or software does not meet those [GPUDirect RDMA prerequisites](https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/latest/gpu-operator-rdma.html), use the documented `nvidia-peermem` fallback. Wait for the Network Operator's driver pods first, set `driver.rdma.enabled: true`, reconcile the GPU Operator CRDs as shown in Step 2, and upgrade the GPU Operator release.

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

### Cross-Node GPUDirect Bandwidth Test

Create two long-running test pods on different GPU nodes. Replace `node1` and `node2` if your Kubernetes node names differ:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: ib-server
spec:
  nodeName: node1
  restartPolicy: Never
  containers:
    - name: perf
      image: mellanox/cuda-perftest
      command: ["sleep", "infinity"]
      securityContext:
        capabilities:
          add: ["IPC_LOCK"]
      resources:
        limits:
          nvidia.com/gpu: 1
          rdma/rdma_shared_device_ib: 1
---
apiVersion: v1
kind: Pod
metadata:
  name: ib-client
spec:
  nodeName: node2
  restartPolicy: Never
  containers:
    - name: perf
      image: mellanox/cuda-perftest
      command: ["sleep", "infinity"]
      securityContext:
        capabilities:
          add: ["IPC_LOCK"]
      resources:
        limits:
          nvidia.com/gpu: 1
          rdma/rdma_shared_device_ib: 1
```

Save the manifest as `ib-gpu-test.yaml`, apply it, and wait for both pods:

```bash
kubectl apply -f ib-gpu-test.yaml
kubectl wait --for=condition=Ready pod/ib-server pod/ib-client --timeout=5m
kubectl get pods ib-server ib-client -o wide
```

In the first terminal, start the server. If the allocated HCA is not `mlx5_0`, substitute the correct device:

```bash
kubectl exec -it ib-server -- \
  ib_write_bw --use_cuda=0 --use_cuda_dmabuf \
  -d mlx5_0 -a -F --report_gbits -q 1
```

In a second terminal, connect with the server pod IP shown by `kubectl get pods -o wide`:

```bash
kubectl exec -it ib-client -- \
  ib_write_bw -n 5000 --use_cuda=0 --use_cuda_dmabuf \
  -d mlx5_0 -a -F --report_gbits -q 1 <ib-server-pod-ip>

kubectl delete -f ib-gpu-test.yaml
```

Both pods request a GPU and an RDMA device, and `--use_cuda_dmabuf` makes this a GPU-memory test rather than a host-memory RDMA test.

> **NCCL configuration is handled by the Akash provider.** You do not configure NCCL on the cluster. When a tenant requests GPU interconnect in the SDL, the provider auto-injects the NCCL environment (`NCCL_IB_DISABLE=0`, `NCCL_IB_HCA` from the node's discovered HCA families) and requests one `rdma/rdma_shared_device_ib` handle per GPU. On RoCE fabrics it additionally attaches the rail networks from [Part 3](#part-3--roce-rail-networks-optional) so NCCL can select the pod's own RoCEv2 GID. Provider setup ends once the node advertises the GPU and RDMA resources verified above.

---

# Part 3 — RoCE Rail Networks (optional)

> **Only for clusters whose ConnectX ports run in Ethernet mode (RoCEv2).** Typical on rail-optimized H100/H200 systems: one HCA per GPU, each cabled to its own Ethernet "rail". If `ibstat` on your nodes shows `Link layer: InfiniBand`, Part 2 alone is complete — skip this section.

**Why RoCE needs an extra step that InfiniBand doesn't:** InfiniBand addresses RDMA peers by LID, which works from any pod with no network configuration. RoCEv2 addresses peers by **IP** — establishing a connection resolves the remote rail IP through the pod's own network namespace. A pod with only the cluster CNI interface cannot do that, even with the RDMA device allocated. The fix: the provider attaches every rail network it finds in the `akash-rails` namespace to RoCE interconnect pods at deploy time (multus secondary interfaces). This section creates those rail networks.

First complete **Part 2** (Steps 5–8) — the Network Operator, NicClusterPolicy, and RDMA device plugin are identical for RoCE, including the `rdma_shared_device_ib` resource name. Differences for RoCE clusters:

- No Subnet Manager — the rails are ordinary Ethernet.
- `ibstat` shows `Link layer: Ethernet` (this is what makes the provider advertise the `roce` fabric — detection is automatic).
- Set `deviceIDs` for your NICs as usual (e.g. ConnectX-7 = `1021`).

## Step 9 — Verify RoCE Mode and Rail Addressing

Each rail NIC needs a host IP in its own per-rail subnet (one `/24` per rail is the standard scheme). If your rails are not yet addressed, add them via netplan — one stanza per rail interface, same subnets on every node, unique host octet per node:

```yaml
# /etc/netplan/60-roce-rails.yaml  (chmod 600), then: netplan apply
network:
  version: 2
  ethernets:
    enp26s0np0:
      {
        mtu: 9000,
        accept-ra: false,
        optional: true,
        addresses: [10.100.0.11/24],
      }
    enp60s0np0:
      {
        mtu: 9000,
        accept-ra: false,
        optional: true,
        addresses: [10.100.1.11/24],
      }
    # ... one per rail; keep the host octet (.11 here) identical across rails,
    # unique per node. No gateways, no routes — each rail is a directly
    # attached /24; the default route stays on your management network.
```

Verify on each node:

```bash
# Ports in Ethernet mode
ibstat | grep "Link layer"
# Link layer: Ethernet          ← RoCE (all ports)

# List the RoCEv2 entries and note the GID index for this rail
show_gids | awk '$5=="v2" && $4!=""'

# Optional host-memory transport check per rail. Substitute the RoCEv2 GID
# index reported above on each host (server on node A, client on node B):
#   A: ib_write_bw -d mlx5_0 -x <server-gid-index> --report_gbits
#   B: ib_write_bw -d mlx5_0 -x <client-gid-index> <node-A-rail-IP> --report_gbits
# Expect the port line rate (e.g. ~391 Gb/s on 400G CX-7).
```

## Step 10 — Create the Rail Networks

The provider attaches **every** NetworkAttachmentDefinition it finds in the `akash-rails` namespace to RoCE interconnect pods. Create one `MacvlanNetwork` per rail there, with an nv-ipam `IPPool` per rail so pod IPs are assigned automatically (both CRDs are installed by the Network Operator from Part 2).

Adjust `RAILS` (the rail NIC names, in rail order) and the subnet pattern to your cluster:

```bash
kubectl create namespace akash-rails

RAILS=(enp26s0np0 enp60s0np0 enp77s0np0 enp94s0np0 enp156s0np0 enp188s0np0 enp204s0np0 enp220s0np0)
for k in "${!RAILS[@]}"; do
cat <<YAML | kubectl apply -f -
apiVersion: nv-ipam.nvidia.com/v1alpha1
kind: IPPool
metadata:
  name: rail$k
  namespace: nvidia-network-operator
spec:
  subnet: 10.100.$k.0/24
  perNodeBlockSize: 16
---
apiVersion: mellanox.com/v1alpha1
kind: MacvlanNetwork
metadata:
  name: rail$k
spec:
  networkNamespace: akash-rails
  master: ${RAILS[$k]}
  mode: bridge
  mtu: 9000
  ipam: '{"type": "nv-ipam", "poolName": "rail$k"}'
YAML
done
```

> **Pod IPs cannot collide with host rail IPs:** nv-ipam hands each node a block of `perNodeBlockSize` addresses starting from `.1`. Keep your host rail IPs above `nodes × perNodeBlockSize` (e.g. with 4 nodes × 16, pods use `.1`–`.64`; put hosts at `.65+`).

Verify:

```bash
# 8 NADs generated in akash-rails (one per MacvlanNetwork)
kubectl get network-attachment-definitions -n akash-rails

# Per-node address blocks assigned
kubectl get ippools.nv-ipam.nvidia.com -n nvidia-network-operator
# (fully-qualified name required — Calico also has an "ippools" CRD)
```

That's the whole cluster-side setup. The provider's rails namespace is configurable via `--interconnect-roce-networks-namespace` (default `akash-rails`) — with the default namespace and the layout above there is nothing to set. The provider's service account needs `list` on `network-attachment-definitions.k8s.cni.cncf.io` (included in the provider Helm chart).

## Step 11 — Verify RoCE End-to-End

Launch two pods shaped like Akash interconnect workloads — rail annotation, RDMA resource, unprivileged — on **different nodes**, and run the bandwidth test between them:

```bash
NETS=$(kubectl get network-attachment-definitions -n akash-rails -o name | sed 's|.*/|akash-rails/|' | paste -sd,)
echo "$NETS"   # akash-rails/rail0,akash-rails/rail1,...

for p in a b; do
cat <<YAML | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: roce-test-$p
  annotations:
    k8s.v1.cni.cncf.io/networks: $NETS
spec:
  restartPolicy: Never
  affinity:
    podAntiAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
      - topologyKey: kubernetes.io/hostname
        labelSelector: { matchLabels: { app: roce-test } }
  containers:
  - name: perf
    image: mellanox/cuda-perftest
    command: ["sleep", "infinity"]
    securityContext:
      capabilities:
        add: ["IPC_LOCK"]
    resources:
      limits:
        nvidia.com/gpu: 1
        rdma/rdma_shared_device_ib: 1
YAML
kubectl label pod roce-test-$p app=roce-test
done

kubectl wait --for=condition=Ready pod/roce-test-a pod/roce-test-b --timeout=180s
kubectl exec roce-test-a -- ip -br addr | grep net
# Expect one netN interface per rail with an auto-assigned rail IP

# Find the pod's RoCEv2 GID index for the first rail (rail interfaces
# register pod-local GIDs; host GID entries are not visible in the pod):
kubectl exec roce-test-a -- bash -c \
  'grep -rl "RoCE v2" /sys/class/infiniband/mlx5_0/ports/1/gid_attrs/types 2>/dev/null | head -1'
# The trailing number of that path is the GID index (typically 4 or 5)

# GPUDirect bandwidth (use each pod's matching rail HCA and GID index):
# terminal 1:
kubectl exec -it roce-test-a -- \
  ib_write_bw --use_cuda=0 --use_cuda_dmabuf \
  -d mlx5_0 -x <server-gid-index> -a -F --report_gbits -q 1
# terminal 2 (target = roce-test-a's rail0 IP from `ip -br addr`):
kubectl exec -it roce-test-b -- \
  ib_write_bw -n 5000 --use_cuda=0 --use_cuda_dmabuf \
  -d mlx5_0 -x <client-gid-index> -a -F --report_gbits -q 1 \
  <rail0-ip-of-a>
# Expect port line rate, matching the raw host test from Step 9

kubectl delete pod roce-test-a roce-test-b
```

If the pods show `netN` rail interfaces and the bandwidth matches Step 9's raw numbers, RoCE is fully operational — tenant interconnect deployments will get the same attachment automatically.

> **Tenant SDLs are identical on IB and RoCE.** Deployers write `interconnect: []` either way; the provider detects the fabric and handles rail attachment and NCCL environment on its own. A tenant can pin a fabric with `capabilities/gpu-interconnect/fabric/roce` in placement attributes, but never configures rails or GIDs.

---

## Deployment Order Summary

```
GPU-only provider:
  1. Kubespray (kubeadm + Calico + containerd)
  2. GPU Operator (driver.rdma.enabled: false)
  3. Nodes report nvidia.com/gpu

Adding InfiniBand or RoCE:
  4. Network Operator (helm)
  5. NicClusterPolicy → MOFED compile + RDMA device plugin
        ↓ wait for MOFED pods Running
  6. Nodes report nvidia.com/gpu AND rdma/rdma_shared_device_ib

RoCE only (Part 3):
  7. Rail IP addressing on hosts (netplan, one /24 per rail)
  8. akash-rails namespace: IPPool + MacvlanNetwork per rail
  9. Provider attaches the rails to RoCE interconnect pods automatically
```

---

## Troubleshooting

**`no matches for kind "ClusterPolicy"` or `"NodeFeatureRule"` from GPU Operator** — reconcile both bundled sets of CRDs before installing or upgrading:

```bash
# GPU Operator CRDs
rm -rf /tmp/akash-gpu-operator-chart
helm pull nvidia/gpu-operator --version v26.7.0 --untar \
  --untardir /tmp/akash-gpu-operator-chart
kubectl apply --server-side --force-conflicts \
  -f /tmp/akash-gpu-operator-chart/gpu-operator/crds \
  -f /tmp/akash-gpu-operator-chart/gpu-operator/charts/node-feature-discovery/crds/nfd-api-crds.yaml
helm upgrade -i gpu-operator nvidia/gpu-operator \
  --namespace gpu-operator --create-namespace \
  --version v26.7.0 -f gpu-operator-values.yaml
```

**GPU driver pod stuck in `Init:0/1` after opting into `nvidia-peermem`** — the driver init container is waiting for MOFED. This applies only when `driver.rdma.enabled: true`. Either finish the Network Operator deployment or return to the default DMA-BUF configuration with `driver.rdma.enabled: false`.

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

Your cluster now has GPU support (and optionally InfiniBand or RoCE RDMA).

- [Provider installation – STEP 9 (TLS)](/docs/providers/setup-and-installation/kubespray/provider-installation-prep#step-9---lets-encrypt-cert-manager-and-tls-secrets) — **required** for all providers: cert-manager and Gateway TLS
- [IP Leases](/docs/providers/setup-and-installation/kubespray/ip-leases) — enable static IPs

> **Note:** The Provider Playbook renders GPU model, RAM, interface, and CUDA attributes automatically. If you follow this manual guide, add those GPU attributes to `provider.yaml` yourself. Interconnect providers must also add `capabilities/gpu-interconnect` and the matching `.../fabric/infiniband` or `.../fabric/roce` key. See [Provider Attributes — GPU Interconnect](/docs/providers/operations/provider-attributes/#gpu-interconnect-infiniband--roce).
