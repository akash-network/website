---
categories: ["Providers"]
tags: ["Operations", "Monitoring"]
weight: 6
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
akt provider status <provider-address>
```

### Example

```bash
akt provider status akash1wxr49evm8hddnx9ujsdtd86gk46s7ejnccqfmy
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

The Provider Playbook installs NVIDIA GPU Operator `v26.7.0`. The Operator manages the NVIDIA driver, Container Toolkit, device plugin, validators, and Fabric Manager as Kubernetes workloads. Do not install or upgrade those packages directly on the host; host-managed NVIDIA packages conflict with the Operator-managed stack.

Run the Kubernetes checks below from a control-plane node or another machine with cluster-admin access to the cluster.

### Check the GPU Operator

```bash
helm status gpu-operator --namespace gpu-operator
kubectl get clusterpolicy cluster-policy
kubectl --namespace gpu-operator get deployments,daemonsets
kubectl --namespace gpu-operator get pods --output wide
```

A healthy installation has:

- A ready `cluster-policy` and a running GPU Operator controller
- Driver, Container Toolkit, device plugin, and operator validator pods on each GPU node
- `nvidia-cuda-validator` pods in `Completed` state
- `nvidia-operator-validator` pods in `Running` state

Driver pods can restart briefly while the Operator reconciles a node. Use the validators and ClusterPolicy state to decide whether the installation is ready.

### Check Allocatable GPUs

Confirm Kubernetes has discovered the expected number of GPUs on every node:

```bash
kubectl get nodes \
  --output='custom-columns=NAME:.metadata.name,GPUS:.status.allocatable.nvidia\.com/gpu'
```

If a GPU node reports an empty value or `0`, inspect the Operator pods assigned to that node:

```bash
kubectl --namespace gpu-operator get pods --output wide
```

Then connect to the affected node and confirm that its PCI bus exposes NVIDIA hardware:

```bash
lspci -nn | grep -i nvidia
```

### Run an End-to-End CUDA Test

Create a disposable pod that requests one GPU and runs `nvidia-smi` inside the Operator-managed CUDA environment:

```bash
kubectl apply -f - <<'EOF'
apiVersion: v1
kind: Pod
metadata:
  name: gpu-test
spec:
  restartPolicy: Never
  containers:
    - name: cuda
      image: nvidia/cuda:13.0.3-base-ubuntu24.04
      command: ["nvidia-smi"]
      resources:
        limits:
          nvidia.com/gpu: 1
EOF

kubectl wait pod/gpu-test \
  --for=jsonpath='{.status.phase}'=Succeeded \
  --timeout=5m
kubectl logs gpu-test
kubectl delete pod gpu-test
```

If the pod does not succeed, leave it in place while you inspect `kubectl describe pod gpu-test` and `kubectl logs gpu-test`. Delete it after collecting the failure details.

### Inspect a Failing Operator Component

Use the failing pod name from the Operator status output:

```bash
kubectl --namespace gpu-operator describe pod <pod-name>
kubectl --namespace gpu-operator logs <pod-name> --all-containers
```

The pod prefix identifies the failing layer:

- `nvidia-driver-daemonset`: NVIDIA driver or kernel compatibility
- `nvidia-container-toolkit-daemonset`: container runtime integration
- `nvidia-device-plugin-daemonset`: GPU resource discovery and advertisement
- `nvidia-cuda-validator`: CUDA initialization
- `nvidia-operator-validator`: overall Operator validation

For driver or kernel failures, connect to the affected node and inspect its kernel log:

```bash
dmesg -T | grep -Ei 'nvidia|nvml|cuda|mismatch'
```

If the node has host-installed NVIDIA driver, Container Toolkit, or Fabric Manager packages, remove that conflicting installation before redeploying with the Provider Playbook.

### Check Operator-Managed Fabric Manager

Fabric Manager is normally needed for SXM/NVSwitch systems and not for PCIe-only GPU systems. The setup wizard detects supported SXM GPU models and configures the GPU Operator accordingly.

Check the configured state and any Fabric Manager workloads:

```bash
kubectl get clusterpolicy cluster-policy \
  --output=jsonpath='{.spec.fabricManager.enabled}{"\n"}'
kubectl --namespace gpu-operator get daemonsets,pods --output wide | grep -i fabric
```

When Fabric Manager is enabled, an `nvidia-fabricmanager` pod should run on each applicable node. Inspect a failing pod with:

```bash
kubectl --namespace gpu-operator describe pod <fabric-manager-pod>
kubectl --namespace gpu-operator logs <fabric-manager-pod> --all-containers
```

For a PCIe-only system, `false` and no Fabric Manager pod are expected. Do not install `nvidia-fabricmanager` with `apt`; correct the GPU Operator configuration and let the Operator reconcile the node.

### Additional GPU Resources

- [NVIDIA GPU Operator Troubleshooting](https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/latest/troubleshooting.html)
- [NVIDIA GPU Operator Platform Support](https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/latest/platform-support.html)
- [GPU Support Setup](/docs/providers/setup-and-installation/kubespray/gpu-support)

---

## Related Resources

- [Provider Installation](/docs/providers/setup-and-installation/kubespray/provider-installation)
- [GPU Support Setup](/docs/providers/setup-and-installation/kubespray/gpu-support)
- [Lease Management](/docs/providers/operations/lease-management)
- [Updates & Maintenance](/docs/providers/operations/updates-maintenance)
