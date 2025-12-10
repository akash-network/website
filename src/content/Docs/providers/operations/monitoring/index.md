---
categories: ["Providers"]
tags: ["Operations", "Monitoring"]
weight: 3
title: "Monitoring"
linkTitle: "Monitoring"
description: "Monitor your provider and track performance"
---

This guide covers monitoring and troubleshooting tools for Akash providers, including log analysis, status checks, and GPU troubleshooting.

## Provider Logs

Provider logs show order receipt, bidding activity, manifest processing, and errors. Use logs to verify provider health and troubleshoot issues.

### View Provider Logs

```bash
kubectl logs <pod-name> -n akash-services
```

### Stream Live Logs

View the last 50 log entries and follow new logs in real-time:

```bash
kubectl logs akash-provider-0 -n akash-services --tail=50 -f
```

### Filter Logs

Exclude routine health checks and focus on important events:

```bash
kubectl -n akash-services logs -l app=akash-provider --tail=100 -f | \
  grep -Ev "running check|check result|cluster resources|service available replicas below target"
```

### Example Log Output

Here's what a successful order processing sequence looks like:

```
I[2025-04-29|20:35:25.057] order detected                               module=bidengine-service order=order/akash1d2xltxu5vmsxza8gu2j9vudcpacuntn6r72aee/21299713/1/1
I[2025-04-29|20:35:25.058] group fetched                                module=bidengine-order order=akash1d2xltxu5vmsxza8gu2j9vudcpacuntn6r72aee/21299713/1/1
I[2025-04-29|20:35:25.059] Reservation fulfilled                        module=bidengine-order order=akash1d2xltxu5vmsxza8gu2j9vudcpacuntn6r72aee/21299713/1/1
D[2025-04-29|20:35:25.060] submitting fulfillment                       module=bidengine-order order=akash1d2xltxu5vmsxza8gu2j9vudcpacuntn6r72aee/21299713/1/1 price=21.000000000000000000uakt
I[2025-04-29|20:35:25.061] broadcast response                           response="code: 0" txhash=AF7E9AB65B0200B0B8B4D9934C019F8E07FAFB5C396E82DA582F719A1FA15C14
I[2025-04-29|20:35:25.061] bid complete                                 module=bidengine-order order=akash1d2xltxu5vmsxza8gu2j9vudcpacuntn6r72aee/21299713/1/1
```

### Declined Bids

When the provider declines to bid due to incompatible attributes:

```
D[2025-04-29|20:35:25.058] unable to fulfill: incompatible attributes   wanted="gpu:vendor/nvidia/model/rtx-3060-ti" have="gpu:vendor/nvidia/model/rtx4090"
D[2025-04-29|20:35:25.059] declined to bid                              module=bidengine-order
```

This is normal behavior when deployment requirements don't match your provider's capabilities.

## Provider Status

Get comprehensive provider status including active leases, resource utilization, and per-node capacity.

### Command Template

```bash
provider-services status <provider-address>
```

### Example

```bash
provider-services status akash1wxr49evm8hddnx9ujsdtd86gk46s7ejnccqfmy
```

### Example Output

```json
{
  "cluster": {
    "leases": 3,
    "inventory": {
      "active": [
        {
          "cpu": 8000,
          "memory": 8589934592,
          "storage_ephemeral": 5384815247360
        },
        {
          "cpu": 100000,
          "memory": 450971566080,
          "storage_ephemeral": 982473768960
        }
      ],
      "available": {
        "nodes": [
          {
            "cpu": 111495,
            "memory": 466163988480,
            "storage_ephemeral": 2375935850345
          },
          {
            "cpu": 118780,
            "memory": 474497601536,
            "storage_ephemeral": 7760751097705
          }
        ]
      }
    }
  },
  "bidengine": {
    "orders": 0
  },
  "manifest": {
    "deployments": 0
  },
  "cluster_public_hostname": "provider.example.com"
}
```

### Status Fields Explained

- **`leases`**: Number of active leases
- **`inventory.active`**: Resources currently consumed by deployments
- **`inventory.available.nodes`**: Available resources per node
- **`bidengine.orders`**: Orders currently being processed
- **`manifest.deployments`**: Manifests waiting to be deployed
- **`cluster_public_hostname`**: Your provider's public hostname

## GPU Provider Troubleshooting

When GPU deployments fail or GPUs aren't detected, use these steps to diagnose issues.

**Scope:** Conduct these checks on **each Kubernetes worker node** hosting GPU resources unless specified otherwise.

### Basic GPU Verifications

#### Install Testing Tools

```bash
apt update && apt -y install python3-venv
python3 -m venv /venv
source /venv/bin/activate
pip install torch numpy
```

#### Verify GPU Detection

```bash
nvidia-smi -L
```

**Expected Output:**

```
GPU 0: Tesla T4 (UUID: GPU-faa48437-7587-4bc1-c772-8bd099dba462)
```

If no GPUs are listed, check:
- Driver installation
- Hardware connection
- BIOS/UEFI settings

#### Check CUDA Version

```bash
python3 -c "import torch;print(torch.version.cuda)"
```

**Expected Output:** `12.7` (or your installed CUDA version)

#### Verify CUDA GPU Support

```bash
python3 -c "import torch; print(torch.cuda.is_available())"
```

**Expected Output:** `True`

If `False`, see the NVIDIA Fabric Manager section below.

### Check Kernel Logs for GPU Errors

Examine kernel logs for driver issues, version mismatches, or hardware errors:

```bash
dmesg -T | grep -Ei 'nvidia|nvml|cuda|mismatch'
```

#### Healthy Output Example

```
[Thu Sep 28 19:29:02 2023] nvidia: loading out-of-tree module taints kernel.
[Thu Sep 28 19:29:02 2023] NVRM: loading NVIDIA UNIX x86_64 Kernel Module  580.13.04
[Thu Sep 28 19:29:02 2023] nvidia-modeset: Loading NVIDIA Kernel Mode Setting Driver for UNIX platforms  580.13.04
[Thu Sep 28 19:29:04 2023] [drm] Initialized nvidia-drm 0.0.0 20160202 for 0000:00:04.0 on minor 0
[Thu Sep 28 19:29:05 2023] nvidia-uvm: Loaded the UVM driver, major device number 235.
```

#### Problem Indicators

- `mismatch` errors → Driver/kernel version conflict
- `failed to initialize` → Hardware or configuration issue
- Missing `nvidia-uvm` → Incomplete driver installation

### Verify NVIDIA Device Plugin

The NVIDIA Device Plugin DaemonSet must be running on all GPU nodes for Kubernetes to schedule GPU workloads.

#### Check Plugin Status

```bash
kubectl get pods -n nvidia-device-plugin -l app.kubernetes.io/name=nvidia-device-plugin
```

#### Expected Output

```
NAME                                         READY   STATUS    RESTARTS   AGE
nvidia-device-plugin-daemonset-abc123        1/1     Running   0          2d3h
nvidia-device-plugin-daemonset-def456        1/1     Running   0          2d3h
```

**Indicators:**
- `READY` should be `1/1`
- `STATUS` should be `Running`
- One pod per GPU-enabled node

#### Troubleshooting Plugin Issues

If pods are not running:

```bash
# Check pod events
kubectl describe pod -n nvidia-device-plugin <pod-name>

# Check DaemonSet status
kubectl get daemonset -n nvidia-device-plugin

# View plugin logs
kubectl logs -n nvidia-device-plugin <pod-name>
```

### NVIDIA Fabric Manager (SXM GPUs)

**When Needed:** NVIDIA Fabric Manager is **required for non-PCIe GPU configurations** such as:
- SXM form factor GPUs
- NVLink-connected GPUs
- Multi-GPU setups with direct GPU-to-GPU communication

#### Common Error

If `torch.cuda.is_available()` returns:

```
Error 802: system not yet initialized (Triggered internally at ../c10/cuda/CUDAFunctions.cpp:109.)
```

Install Fabric Manager to resolve this issue.

#### Install Fabric Manager

Replace `580` with your NVIDIA driver version:

```bash
apt-get install nvidia-fabricmanager-580
systemctl start nvidia-fabricmanager
systemctl enable nvidia-fabricmanager
```

**Initialization Time:** Wait 2-3 minutes after starting the service before testing GPU availability.

#### Verify Fabric Manager Status

```bash
systemctl status nvidia-fabricmanager
```

**Expected Output:**

```
● nvidia-fabricmanager.service - NVIDIA Fabric Manager Daemon
     Loaded: loaded
     Active: active (running) since ...
```

### Fabric Manager Version Mismatch

Ubuntu repositories may not provide a Fabric Manager version matching your driver, causing startup failures.

#### Symptom

```bash
systemctl status nvidia-fabricmanager
```

Shows:

```
nv-fabricmanager[104230]: fabric manager NVIDIA GPU driver interface version 580.127.05 doesn't match with driver version 580.120
systemd[1]: nvidia-fabricmanager.service: Control process exited, code=exited, status=1/FAILURE
```

#### Fix: Use Official NVIDIA Repository

**Prerequisites:**
- Ubuntu 24.04 LTS
- Root access

Add the official NVIDIA CUDA repository:

```bash
wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2404/x86_64/3bf863cc.pub
apt-key add 3bf863cc.pub

echo "deb https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2404/x86_64/ /" > /etc/apt/sources.list.d/nvidia-official-repo.list

apt update
apt dist-upgrade
apt autoremove
```

**Tip:** Running `apt dist-upgrade` with the official NVIDIA repo upgrades all NVIDIA packages (driver, fabric manager, CUDA tools) in sync, preventing version mismatches.

#### Verify Package Versions

```bash
dpkg -l | grep nvidia
```

Remove any unexpected versions and **reboot the node** to apply changes.

### Additional GPU Resources

- [NVIDIA Developer Forum - Error 802](https://forums.developer.nvidia.com/t/error-802-system-not-yet-initialized-cuda-11-3/234955)
- [NVIDIA Driver Documentation](https://docs.nvidia.com/datacenter/tesla/tesla-installation-notes/)
- [Kubernetes Device Plugins](https://kubernetes.io/docs/concepts/extend-kubernetes/compute-storage-net/device-plugins/)

---

## Related Resources

- [Provider Installation](/docs/providers/setup-and-installation/kubespray/provider-installation)
- [GPU Support Setup](/docs/providers/setup-and-installation/kubespray/gpu-support)
- [Lease Management](/docs/providers/operations/lease-management)
- [Updates & Maintenance](/docs/providers/operations/updates-maintenance)

