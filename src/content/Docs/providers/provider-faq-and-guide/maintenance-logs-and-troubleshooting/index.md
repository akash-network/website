---
categories: ["Providers"]
tags: []
weight: 2
title: "Provider Maintenance, Logs, and Troubleshooting"
linkTitle: "Provider Maintenance, Logs, and Troubleshooting"
---

This section addresses common questions about monitoring, logging, and managing Akash provider operations. It aims to equip providers with the knowledge and tools necessary to effectively oversee their infrastructure, manage leases, track revenue, and troubleshoot issues.

- [Provider Maintenance](#provider-maintenance)
- [Provider Logs](#provider-logs)
- [Provider Status and General Info](#provider-status-and-general-info)
- [GPU Provider Troubleshooting](#gpu-provider-troubleshooting)


## Provider Maintenance

### Stop Provider Services Prior to Maintenance

When conducting maintenance on your Akash Provider, ensure the `akash-provider` service is stopped during the maintenance period.

> An issue exists currently in which provider leases may be lost during maintenance activities if the `akash-provider` service is not stopped prior. This issue is detailed further [here](https://github.com/akash-network/provider/issues/64).

#### Steps to Stop the `akash-provider` Service

```
kubectl -n akash-services get statefulsets
kubectl -n akash-services scale statefulsets akash-provider --replicas=0
```

#### Steps to Verify the `akash-provider` Service Has Been Stopped

```
kubectl -n akash-services get statefulsets
kubectl -n akash-services get pods -l app=akash-provider
```

#### Steps to Start the `akash-provider` Service Post Maintenance

```
kubectl -n akash-services scale statefulsets akash-provider --replicas=1
```

## Provider Logs

The commands in this section peer into the provider's logs and may be used to verify possible error conditions on provider start up and to ensure provider order receipt/bid process completion steps.

### Command Template

Issue the commands in this section from a control plane node within the Kubernetes cluster or a machine that has kubectl communication with the cluster.

```
kubectl logs <pod-name> -n akash-services
```

### Example Command Use

- Using the example command syntax we will list the last ten entries in Provider logs and enter a live streaming session of new logs generated

```
kubectl logs akash-provider-0 -n akash-services --tail=50 -f
```

### Example Output

- Note within the example the receipt of a deployment order with a DSEQ of 5949829
- The sequence shown from `order-detected` through reservations through `bid-complete` provides an example of what we would expect to see when an order is received by the provider
- The order receipt is one of many event sequences that can be verified within provider logs

```
kubectl logs akash-provider-0 -n akash-services --tail=50 -f

I[2025-04-29|20:35:25.057] order detected                               module=bidengine-service cmp=provider order=order/akash1d2xltxu5vmsxza8gu2j9vudcpacuntn6r72aee/21299713/1/1
I[2025-04-29|20:35:25.058] group fetched                                module=bidengine-order cmp=provider order=akash1d2xltxu5vmsxza8gu2j9vudcpacuntn6r72aee/21299713/1/1
D[2025-04-29|20:35:25.058] unable to fulfill: incompatible attributes for resources requirements module=bidengine-order cmp=provider order=akash1d2xltxu5vmsxza8gu2j9vudcpacuntn6r72aee/21299713/1/1 wanted="{Name:akash Requirements:{SignedBy:{AllOf:[] AnyOf:[]} Attributes:[]} Resources:[{Resources:{ID:1 CPU:units:<val:\"2000\" >  Memory:quantity:<val:\"10737418240\" >  Storage:[{Name:default Quantity:{Val:32212254720} Attributes:[]}] GPU:units:<val:\"1\" > attributes:<key:\"vendor/nvidia/model/rtx-3060-ti\" value:\"true\" >  Endpoints:[{Kind:RANDOM_PORT SequenceNumber:0}]} Count:1 Price:30000.000000000000000000uakt}]}" have="[{Key:host Value:akash} {Key:tier Value:community} {Key:organization Value:Akash Provider Services} {Key:email Value:info@akashprovid.com} {Key:status-page Value:status.akashprovid.com} {Key:location-region Value:na-us-southwest} {Key:country Value:US} {Key:city Value:DAL} {Key:timezone Value:utc-5} {Key:location-type Value:home} {Key:capabilities/cpu Value:amd} {Key:capabilities/cpu/arch Value:x86-64} {Key:capabilities/gpu Value:nvidia} {Key:capabilities/storage/1/class Value:beta2} {Key:capabilities/storage/1/persistent Value:false} {Key:capabilities/memory Value:ddr4ecc} {Key:network-provider Value:Pavlov Media} {Key:network-speed-up Value:1000} {Key:network-speed-down Value:1000} {Key:capabilities/storage/2/class Value:beta3} {Key:capabilities/storage/2/persistent Value:true} {Key:feat-persistent-storage Value:true} {Key:capabilities/gpu/vendor/nvidia/model/rtx4090 Value:true} {Key:capabilities/gpu/vendor/nvidia/model/rtx4090/ram/24Gi Value:true} {Key:capabilities/gpu/vendor/nvidia/model/rtx4090/ram/24Gi/interface/pcie Value:true} {Key:capabilities/gpu/vendor/nvidia/model/rtx4090/interface/pcie Value:true} {Key:capabilities/storage/3/class Value:ram} {Key:capabilities/storage/3/persistent Value:false} {Key:cuda Value:12.7}]"
D[2025-04-29|20:35:25.059] declined to bid                              module=bidengine-order cmp=provider order=akash1d2xltxu5vmsxza8gu2j9vudcpacuntn6r72aee/21299713/1/1
I[2025-04-29|20:35:25.059] shutting down                                module=bidengine-order cmp=provider order=akash1d2xltxu5vmsxza8gu2j9vudcpacuntn6r72aee/21299713/1/1
D[2025-04-29|20:36:00.041] cluster resources dump={"nodes":[{"name":"4090-node","allocatable":{"cpu":224000,"gpu":8,"memory":506969817088,"storage_ephemeral":1868399843502},"available":{"cpu":129690,"gpu":5,"memory":351501647872,"storage_ephemeral":1430067812526}}],"total_allocatable":{"cpu":224000,"gpu":8,"memory":506969817088,"storage_ephemeral":1868399843502,"storage":{"beta3":2445568376832}},"total_available":{"cpu":129690,"gpu":5,"memory":351501647872,"storage_ephemeral":1430067812526,"storage":{"beta3":2179280404480}}} module=provider-cluster cmp=provider cmp=service cmp=inventory-service
D[2025-04-29|20:37:00.839] cluster resources dump={"nodes":[{"name":"4090-node","allocatable":{"cpu":224000,"gpu":8,"memory":506969817088,"storage_ephemeral":1868399843502},"available":{"cpu":129690,"gpu":5,"memory":351501647872,"storage_ephemeral":1430067812526}}],"total_allocatable":{"cpu":224000,"gpu":8,"memory":506969817088,"storage_ephemeral":1868399843502,"storage":{"beta3":2445568376832}},"total_available":{"cpu":129690,"gpu":5,"memory":351501647872,"storage_ephemeral":1430067812526,"storage":{"beta3":2179280404480}}} module=provider-cluster cmp=provider cmp=service cmp=inventory-service
D[2025-04-29|20:38:01.687] cluster resources dump={"nodes":[{"name":"4090-node","allocatable":{"cpu":224000,"gpu":8,"memory":506969817088,"storage_ephemeral":1868399843502},"available":{"cpu":129690,"gpu":5,"memory":351501647872,"storage_ephemeral":1430067812526}}],"total_allocatable":{"cpu":224000,"gpu":8,"memory":506969817088,"storage_ephemeral":1868399843502,"storage":{"beta3":2445568376832}},"total_available":{"cpu":129690,"gpu":5,"memory":351501647872,"storage_ephemeral":1430067812526,"storage":{"beta3":2179280404480}}} module=provider-cluster cmp=provider cmp=service cmp=inventory-service
2025-04-29 20:38:44.338894 I | http: TLS handshake error from 172.16.224.203:54788: EOF
D[2025-04-29|20:39:02.531] cluster resources dump={"nodes":[{"name":"4090-node","allocatable":{"cpu":224000,"gpu":8,"memory":506969817088,"storage_ephemeral":1868399843502},"available":{"cpu":129690,"gpu":5,"memory":351501647872,"storage_ephemeral":1430067812526}}],"total_allocatable":{"cpu":224000,"gpu":8,"memory":506969817088,"storage_ephemeral":1868399843502,"storage":{"beta3":2445568376832}},"total_available":{"cpu":129690,"gpu":5,"memory":351501647872,"storage_ephemeral":1430067812526,"storage":{"beta3":2179280404480}}} module=provider-cluster cmp=provider cmp=service cmp=inventory-service                          cmp=client/broadcaster local=23 remote=22
```

## Provider Status and General Info

Use the verifications included in this section for the following purposes:

- [Determine Provider Status](#provider-status)
- [Review Provider Configuration](#provider-configuration-review)
- [Current Versions of Provider's Akash and Kubernetes Installs](#current-versions-of-providers-akash-and-kubernetes-installs)&#x20;

### Provider Status

Obtain live Provider status including:

- Number of active leases
- Active leases and hard consumed by those leases
- Available resources on a per-node basis

#### Command Template

Issue the commands in this section from any machine that has the [Akash CLI ](/docs/deployments/akash-cli/installation/)installed.

```
provider-services status <provider-address>
```

#### Example Command Use

```
provider-services status akash1q7spv2cw06yszgfp4f9ed59lkka6ytn8g4tkjf
```

#### Example Output

```
provider-services status akash1wxr49evm8hddnx9ujsdtd86gk46s7ejnccqfmy
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
 },
 {
 "cpu": 8000,
 "memory": 8589934592,
 "storage_ephemeral": 2000000000000
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
 },
 {
 "cpu": 110800,
 "memory": 465918152704,
 "storage_ephemeral": 5760751097705
 },
 {
 "cpu": 19525,
 "memory": 23846356992,
 "storage_ephemeral": 6778277328745
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
 "cluster_public_hostname": "provider.bigtractorplotting.com"
}
```

## GPU Provider Troubleshooting

> Conduct these steps on each Akash Provider/Kubernetes worker node that hosts GPU resources unless stated otherwise.

### Basic GPU Resource Verifications

#### Prep/Package Installs

```
apt update && apt -y install python3-venv
python3 -m venv /venv
source /venv/bin/activate
pip install torch numpy
```

#### Confirm GPU Resources Available on Host

```
nvidia-smi -L
```

#### Confirm CUDA Install & Version

```
python3 -c "import torch;print(torch.version.cuda)"
```

#### Confirm CUDA GPU Support

```
python3 -c "import torch; print(torch.cuda.is_available())"
```

### Examine Linux Kernel Logs for GPU Resource Errors and Mismatches

```
dmesg -T | grep -Ei 'nvidia|nvml|cuda|mismatch'
```



##### Example/Expected Output

> _**NOTE**_ - example output is from a healthy host which loaded NVIDIA drivers successfully and has no version mismatches. Your output may look very different if there are issues within the host.

```
# dmesg -T | grep -Ei 'nvidia|nvml|cuda|mismatch'

[Thu Sep 28 19:29:02 2023] nvidia: loading out-of-tree module taints kernel.
[Thu Sep 28 19:29:02 2023] nvidia: module license 'NVIDIA' taints kernel.
[Thu Sep 28 19:29:02 2023] nvidia-nvlink: Nvlink Core is being initialized, major device number 237
[Thu Sep 28 19:29:02 2023] NVRM: loading NVIDIA UNIX x86_64 Kernel Module  535.104.05  Sat Aug 19 01:15:15 UTC 2023
[Thu Sep 28 19:29:02 2023] nvidia-modeset: Loading NVIDIA Kernel Mode Setting Driver for UNIX platforms  535.104.05  Sat Aug 19 00:59:57 UTC 2023
[Thu Sep 28 19:29:02 2023] [drm] [nvidia-drm] [GPU ID 0x00000004] Loading driver
[Thu Sep 28 19:29:03 2023] audit: type=1400 audit(1695929343.571:3): apparmor="STATUS" operation="profile_load" profile="unconfined" name="nvidia_modprobe" pid=300 comm="apparmor_parser"
[Thu Sep 28 19:29:03 2023] audit: type=1400 audit(1695929343.571:4): apparmor="STATUS" operation="profile_load" profile="unconfined" name="nvidia_modprobe//kmod" pid=300 comm="apparmor_parser"
[Thu Sep 28 19:29:04 2023] [drm] Initialized nvidia-drm 0.0.0 20160202 for 0000:00:04.0 on minor 0
[Thu Sep 28 19:29:05 2023] nvidia_uvm: module uses symbols nvUvmInterfaceDisableAccessCntr from proprietary module nvidia, inheriting taint.
[Thu Sep 28 19:29:05 2023] nvidia-uvm: Loaded the UVM driver, major device number 235.
```

### Ensure Correct Version/Presence of NVIDIA Device Plugin

> _**NOTE**_ - Conduct this verification step on the Kubernetes control plane node where the NVIDIA Device Plugin DaemonSet is running.

> _**NOTE**_ - This method is prefered as helm could be deployed but pods may not be running

```bash

kubectl get pods -n nvidia-device-plugin -l app.kubernetes.io/name=nvidia-device-plugin


##### Example/Expected Output

```bash


nvidia-device-plugin   nvidia-device-plugin-daemonset-abc123   1/1     Running   0     2d3h
nvidia-device-plugin   nvidia-device-plugin-daemonset-def456   1/1     Running   0     2d3h


```

- `READY` should be `1/1`
- `STATUS` should be `Running`
- There should be one pod per GPU-enabled node in your cluster.
- The pod name format will typically be: `nvidia-device-plugin-daemonset-*`

This confirms that the NVIDIA Device Plugin is active and correctly scheduled on GPU nodes.


### NVIDIA Fabric Manager

- In certain configurations (e.g., all non-PCIe GPU setups like SXM form factors), installing the **NVIDIA Fabric Manager** on worker nodes hosting GPU resources may be necessary.
- If `torch.cuda.is_available()` fails (as discussed earlier), installing the Fabric Manager may resolve the issue.

**Common error message:**

```
torch.cuda.is_available() function: Error 802: system not yet initialized (Triggered internally at ../c10/cuda/CUDAFunctions.cpp:109.)
```

Further details: [NVIDIA Developer Forum Thread](https://forums.developer.nvidia.com/t/error-802-system-not-yet-initialized-cuda-11-3/234955)

> _**NOTE**_ - Wait ~2–3 minutes after installation for the service to initialize.

```bash
apt-get install nvidia-fabricmanager-565
systemctl start nvidia-fabricmanager
systemctl enable nvidia-fabricmanager
```

#### Package Version Mismatch

Occasionally, Ubuntu repositories may not provide a version of `nvidia-fabricmanager` that matches your installed NVIDIA driver. This mismatch can cause startup failure and errors like:

```bash
# systemctl status nvidia-fabricmanager
Nov 05 13:55:26 node1 systemd[1]: Starting NVIDIA fabric manager service...
Nov 05 13:55:26 node1 nv-fabricmanager[104230]: fabric manager NVIDIA GPU driver interface version 550.127.05 don't match with driver version 550.120. Please update with matching NVIDIA driver package.
Nov 05 13:55:26 node1 systemd[1]: nvidia-fabricmanager.service: Control process exited, code=exited, status=1/FAILURE
```

#### Fix: Use Official NVIDIA Repository

> _**NOTE**_ - Your Ubuntu version should be 24.04.
>
> _**NOTE**_ - `apt dist-upgrade` with the official NVIDIA repo upgrades all NVIDIA packages in sync.

```bash
wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2404/x86_64/3bf863cc.pub
apt-key add 3bf863cc.pub

echo "deb https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/ /" > /etc/apt/sources.list.d/nvidia-official-repo.list
apt update
apt dist-upgrade
apt autoremove
```

> After upgrading, verify with:

```bash
dpkg -l | grep nvidia
```

> Remove unexpected versions if necessary, and **reboot** the node to apply changes.

