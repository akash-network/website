---
categories: ["Providers", "Operations"]
tags: ["GPU", "NVIDIA GPU Operator", "Migration", "Drivers", "Kubernetes", "Maintenance"]
weight: 5
title: "GPU Operator migration"
linkTitle: "GPU Operator migration"
description: "Migrate a provider from host-installed NVIDIA drivers and a standalone device plugin to the containerized NVIDIA GPU Operator"
---

**Migrate an existing GPU provider from manually-installed host drivers (host `nvidia-driver-*`, NVIDIA Container Toolkit, and a standalone `nvidia-device-plugin` Helm release) to the [NVIDIA GPU Operator](/docs/providers/setup-and-installation/kubespray/gpu-support),** which manages the driver, container toolkit, device plugin, and validation in containers.

Migrate if you want a single, versioned source of truth for the GPU stack, simpler driver upgrades, or the baseline required for the [InfiniBand / Network Operator path](/docs/providers/setup-and-installation/kubespray/gpu-support#part-2--infiniband--rdma-optional). For a **new** cluster, follow [GPU & InfiniBand Support](/docs/providers/setup-and-installation/kubespray/gpu-support) directly instead.

> **This is disruptive.** Making the GPU Operator manage the driver requires **removing the host driver**, which means unloading the kernel module. Any GPU workload on a node stops while that node is drained and the driver reloads. Do this **one node at a time** (cordon → drain → migrate → uncordon) during a maintenance window, and expect running GPU leases on each node to be interrupted.

> **The advertised resource is unchanged.** Both the standalone device plugin and the GPU Operator expose `nvidia.com/gpu`. Your `provider.yaml` GPU attributes do **not** change, so no re-bid or attribute edit is needed after migration.

**Time:** ~20–30 minutes per node, plus reboot and operator rollout.

---

## Prerequisites

- Cluster admin (`kubectl`) and Helm 3 on the control plane.
- A maintenance window, or enough spare capacity to drain GPU nodes one at a time.
- Nodes were set up with the **manual** GPU workflow: a host NVIDIA driver, the NVIDIA Container Toolkit, and a standalone `nvidia-device-plugin` Helm release.

### Confirm your current setup

```bash
# Host driver present (this is what we will remove)
ssh <gpu-node> nvidia-smi
ssh <gpu-node> "dpkg -l | grep -E 'nvidia-driver|nvidia-fabricmanager|nvidia-container-toolkit'"

# Standalone device plugin (installed manually, e.g. release "nvdp")
helm list -A | grep -i nvidia-device-plugin
kubectl -n nvidia-device-plugin get pods

# Current GPU capacity (record this — it must match after migration)
kubectl get nodes -o custom-columns=\
NAME:.metadata.name,\
GPUs:.status.allocatable.nvidia\\.com/gpu
```

If `nvidia-smi` on the host returns nothing, the driver is **not** host-installed and you may already be on the Operator — this migration does not apply.

---

## Migration overview

```
1. Record current state (driver/plugin versions, GPU capacity)
2. Remove the standalone nvidia-device-plugin Helm release  (cluster-wide, once)
3. Per node:  cordon → drain → purge host driver + toolkit → reboot
4. Install the GPU Operator                                 (cluster-wide, once)
5. Uncordon and verify nvidia.com/gpu returns
6. Verify the provider still serves GPU leases
```

The standalone device plugin is removed **before** the Operator so two plugins never both try to register `nvidia.com/gpu`.

---

## Step 1 — Record current state

Note these so you can confirm parity afterward (and roll back if needed):

- Host driver version (`nvidia-smi --query-gpu=driver_version --format=csv,noheader`)
- Standalone device plugin Helm release name, namespace, and chart version (`helm list -A`)
- GPU allocatable per node (from the prerequisites check)
- Whether nodes are SXM (need Fabric Manager) or PCIe — see the [Fabric Manager decision](/docs/providers/setup-and-installation/kubespray/gpu-support#fabric-manager-decision)

Keep your old device-plugin values and any `RuntimeClass`/driver install notes until the migration is verified.

## Step 2 — Remove the standalone device plugin

Uninstall the manually-deployed plugin cluster-wide (adjust release name/namespace to your install):

```bash
helm uninstall nvdp --namespace nvidia-device-plugin
kubectl -n nvidia-device-plugin get pods   # confirm terminated
```

`nvidia.com/gpu` will drop to `0`/absent on the nodes until the Operator's device plugin takes over — expected, and the reason for the maintenance window.

> Leave the existing `nvidia` `RuntimeClass` in place. The GPU Operator is compatible with it, and removing it can break scheduling for pods that request `runtimeClassName: nvidia`.

## Step 3 — Clean each node

Do this **one node at a time**. Repeat Step 3 fully for a node before moving to the next.

**Cordon and drain:**

```bash
kubectl cordon <gpu-node>
kubectl drain <gpu-node> --ignore-daemonsets --delete-emptydir-data --force
```

**Purge the host driver and toolkit** (on the node) — the inverse of the manual install:

```bash
# GPU driver + Fabric Manager (server-driver installs used nvidia-fabricmanager)
sudo systemctl stop nvidia-fabricmanager 2>/dev/null || true
sudo apt purge --autoremove -y 'nvidia-driver-*' 'nvidia-fabricmanager-*' 'cuda-drivers*' 'nvidia-dkms-*'

# NVIDIA Container Toolkit / runtime
sudo apt purge --autoremove -y nvidia-container-toolkit nvidia-container-runtime

# Confirm the kernel module is gone (may require the reboot below)
lsmod | grep nvidia || echo "nvidia module unloaded"
```

**Reboot** to guarantee the kernel module is unloaded:

```bash
sudo reboot
```

After reboot, `nvidia-smi` on the host should report **"command not found"** or no driver — that clean state is what lets the Operator manage the driver.

> **containerd runtime:** the GPU Operator's toolkit reconfigures containerd for the `nvidia` runtime. If you previously added an `nvidia` runtime via [Kubespray Setup – Step 7](/docs/providers/setup-and-installation/kubespray/kubernetes-setup#step-7---configure-gpu-support-optional) pointing at the host binary `/usr/bin/nvidia-container-runtime`, you may remove that entry for cleanliness once the Operator is running, but it is not required — the Operator's configuration takes precedence on managed nodes.

## Step 4 — Install the GPU Operator

Once your GPU nodes are clean, install the Operator cluster-wide. Use the same values as a fresh setup — see [GPU & InfiniBand Support → Step 2](/docs/providers/setup-and-installation/kubespray/gpu-support#step-2--install-the-gpu-operator) for the full file, Fabric Manager guidance, CRD notes, and pinned chart version (`v26.3.3`).

```bash
helm repo add nvidia https://helm.ngc.nvidia.com/nvidia
helm repo update

# First deploy: helm install (not upgrade -i) so chart CRDs are applied
helm install gpu-operator nvidia/gpu-operator \
  --namespace gpu-operator \
  --create-namespace \
  --version v26.3.3 \
  -f gpu-operator-values.yaml
```

Key values for migration:

```yaml
driver:
  enabled: true          # Operator installs the driver in a container
  rdma:
    enabled: false       # Leave false unless migrating to InfiniBand too
fabricManager:
  enabled: false         # Set true for SXM GPUs
```

Watch the rollout until every pod is `Running` and validators succeed (`nvidia-cuda-validator` = `Completed`, `nvidia-operator-validator` = `Running`):

```bash
kubectl -n gpu-operator get pods -w
```

Brief driver crashloops during first bring-up often self-heal — wait for the validators before rolling back.
The Operator's driver daemonset only schedules on nodes it can manage — cleaned, uncordoned nodes. Uncordon each node after its driver pod is ready (Step 5).

## Step 5 — Uncordon and verify

```bash
kubectl uncordon <gpu-node>
```

Confirm GPU capacity returns and matches what you recorded in Step 1:

```bash
kubectl get nodes -o custom-columns=\
NAME:.metadata.name,\
GPUs:.status.allocatable.nvidia\\.com/gpu

kubectl run gpu-test --rm -it --restart=Never \
  --image=nvidia/cuda:12.4.0-base-ubuntu22.04 \
  --limits=nvidia.com/gpu=1 \
  -- nvidia-smi
```

## Step 6 — Verify the provider

Because the resource name (`nvidia.com/gpu`) is unchanged, the provider needs no attribute edits. Confirm it still bids and serves:

```bash
# Provider pod healthy
kubectl -n akash-services get pods | grep akash-provider

# GPU inventory reported (should match allocatable)
kubectl -n akash-services logs akash-provider-0 | grep -i gpu | tail
```

Deploy a small GPU workload through Akash as a final end-to-end check.

---

## Rollback

If the Operator's driver fails to come up on a node and you need GPUs back quickly:

```bash
# Remove the Operator
helm uninstall gpu-operator --namespace gpu-operator

# Reinstall the host driver + toolkit and the standalone device plugin
# using your Step 1 notes / previous values, then reboot the node.
```

Keep nodes cordoned until either the Operator driver is `Running` or the host driver is reinstalled — an uncordoned node with no working driver will accept GPU pods it cannot run.

---

## Next steps

- Adding a high-speed fabric for multi-node GPU workloads? Continue to [InfiniBand / RDMA](/docs/providers/setup-and-installation/kubespray/gpu-support#part-2--infiniband--rdma-optional).
- [Updates & maintenance](/docs/providers/operations/updates-maintenance)
- [Monitoring](/docs/providers/operations/monitoring)
