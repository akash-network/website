---
categories: ["Providers"]
tags: []
weight: 2
title: "Provider Maintenance, Logs, and Troubleshooting"
linkTitle: "Provider Maintenance, Logs, and Troubleshooting
"
---

This section addresses common questions about monitoring, logging, and managing Akash provider operations. It aims to equip providers with the knowledge and tools necessary to effectively oversee their infrastructure, manage leases, track revenue, and troubleshoot issues.

- [Provider Maintenance](#provider-maintenance)
- [Provider Logs](#provider-logs)
- [Provider Status and General Info](#provider-status-and-general-info)
- [GPU Provider Troubleshooting](#gpu-provider-troubleshooting)


## Provider Maintenance

### Stop Provider Services Prior to Maintenance

When conducting maintenance on your Akash Provider, ensure the `akash-provider` service is stopped during the maintenance period.

> An issue exist currently in which provider leases may be lost during maintenance activities if the `akash-provider` service is not stopped prior. This issue is detailed further [here](https://github.com/akash-network/provider/issues/64).

#### Steps to Stop the `akash-provider` Service

```
kubectl -n akash-services get statefulsets
kubectl -n akash-services scale statefulsets akash-provider --replicas=0
```

#### Steps to Verify the `akash-provider` Service Has Been Stopped

```
kubectl -n akash-services get statefulsets
kubectl -n akash-services get pods -l app=akash-provide
```

#### Steps to Start the `akash-provider` Service Post Maintenance

```
kubectl -n akash-services scale statefulsets akash-provider --replicas=1
```

## Provider Logs

The commands in this section peer into the provider’s logs and may be used to verify possible error conditions on provider start up and to ensure provider order receipt/bid process completion steps.

### Command Template

Issue the commands in this section from a control plane node within the Kubernetes cluster or a machine that has kubectl communication with the cluster.

```
kubectl logs <pod-name> -n akash-services
```

### Example Command Use

- Using the example command syntax we will list the last ten entries in Provider logs and enter a live streaming session of new logs generated

```
kubectl -n akash-services logs $(kubectl -n akash-services get pods -l app=akash-provider --output jsonpath='{.items[-1].metadata.name}') --tail=10 -f
```

### Example Output

- Note within the example the receipt of a deployment order with a DSEQ of 5949829
- The sequence shown from `order-detected` through reservations through `bid-complete` provides an example of what we would expect to see when an order is received by the provider
- The order receipt is one of many event sequences that can be verified within provider logs

```
kubectl -n akash-services logs $(kubectl -n akash-services get pods -l app=akash-provider --output jsonpath='{.items[-1].metadata.name}') --tail=10 -f

I[2022-05-19|17:20:42.069] syncing sequence                             cmp=client/broadcaster local=22 remote=22
I[2022-05-19|17:20:52.069] syncing sequence                             cmp=client/broadcaster local=22 remote=22
I[2022-05-19|17:21:02.068] syncing sequence                             cmp=client/broadcaster local=22 remote=22
D[2022-05-19|17:21:10.983] cluster resources                            module=provider-cluster cmp=service cmp=inventory-service dump="{\"nodes\":[{\"name\":\"node1\",\"allocatable\":{\"cpu\":1800,\"memory\":3471499264,\"storage_ephemeral\":46663523866},\"available\":{\"cpu\":780,\"memory\":3155841024,\"storage_ephemeral\":46663523866}},{\"name\":\"node2\",\"allocatable\":{\"cpu\":1900,\"memory\":3739934720,\"storage_ephemeral\":46663523866},\"available\":{\"cpu\":1295,\"memory\":3204544512,\"storage_ephemeral\":46663523866}}],\"total_allocatable\":{\"cpu\":3700,\"memory\":7211433984,\"storage_ephemeral\":93327047732},\"total_available\":{\"cpu\":2075,\"memory\":6360385536,\"storage_ephemeral\":93327047732}}\n"
I[2022-05-19|17:21:12.068] syncing sequence                             cmp=client/broadcaster local=22 remote=22
I[2022-05-19|17:21:22.068] syncing sequence                             cmp=client/broadcaster local=22 remote=22
I[2022-05-19|17:21:29.391] order detected                               module=bidengine-service order=order/akash1ggk74pf9avxh3llu30yfhmr345h2yrpf7c2cdu/5949829/1/1
I[2022-05-19|17:21:29.495] group fetched                                module=bidengine-order order=akash1ggk74pf9avxh3llu30yfhmr345h2yrpf7c2cdu/5949829/1/1
I[2022-05-19|17:21:29.495] requesting reservation                       module=bidengine-order order=akash1ggk74pf9avxh3llu30yfhmr345h2yrpf7c2cdu/5949829/1/1
D[2022-05-19|17:21:29.495] reservation requested                        module=provider-cluster cmp=service cmp=inventory-service order=akash1ggk74pf9avxh3llu30yfhmr345h2yrpf7c2cdu/5949829/1/1 resources="group_id:<owner:\"akash1ggk74pf9avxh3llu30yfhmr345h2yrpf7c2cdu\" dseq:5949829 gseq:1 > state:open group_spec:<name:\"akash\" requirements:<signed_by:<> attributes:<key:\"host\" value:\"akash\" > > resources:<resources:<cpu:<units:<val:\"100\" > > memory:<quantity:<val:\"2686451712\" > > storage:<name:\"default\" quantity:<val:\"268435456\" > > endpoints:<> > count:1 price:<denom:\"uakt\" amount:\"10000000000000000000000\" > > > created_at:5949831 "
D[2022-05-19|17:21:29.495] reservation count                            module=provider-cluster cmp=service cmp=inventory-service cnt=1
I[2022-05-19|17:21:29.495] Reservation fulfilled                        module=bidengine-order order=akash1ggk74pf9avxh3llu30yfhmr345h2yrpf7c2cdu/5949829/1/1
D[2022-05-19|17:21:29.496] submitting fulfillment                       module=bidengine-order order=akash1ggk74pf9avxh3llu30yfhmr345h2yrpf7c2cdu/5949829/1/1 price=4.540160000000000000uakt
I[2022-05-19|17:21:29.725] broadcast response                           cmp=client/broadcaster response="code: 0\ncodespace: \"\"\ndata: \"\"\nevents: []\ngas_used: \"0\"\ngas_wanted: \"0\"\nheight: \"0\"\ninfo: \"\"\nlogs: []\nraw_log: '[]'\ntimestamp: \"\"\ntx: null\ntxhash: AFCA8D4A900A62D961F4AB82B607749FFCA8C10E2B0486B89A8416B74593DBFA\n" err=null
I[2022-05-19|17:21:29.725] bid complete                                 module=bidengine-order order=akash1ggk74pf9avxh3llu30yfhmr345h2yrpf7c2cdu/5949829/1/1
I[2022-05-19|17:21:32.069] syncing sequence                             cmp=client/broadcaster local=23 remote=22
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

### Ensure Correct Version/Presence of NVIDIA Device Plugin

TBD

### NVIDIA Fabric Manager

TBD



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

> _**NOTE**_ - Conduct this verification step on the Kubernetes control plane node where Helm was installed during your Akash Provider setup.

```bash
helm -n nvidia-device-plugin list
```

##### Example/Expected Output

```bash
# helm -n nvidia-device-plugin list

NAME    NAMESPACE               REVISION    UPDATED                                    STATUS      CHART                          APP VERSION
nvdp    nvidia-device-plugin    1           2023-09-23 14:30:34.18183027 +0200 CEST    deployed    nvidia-device-plugin-0.14.1    0.14.1
```

---

### NVIDIA Fabric Manager

- In certain configurations (e.g., non-PCIe GPU setups like SXM form factors), installing the **NVIDIA Fabric Manager** on worker nodes hosting GPU resources may be necessary.
- If `torch.cuda.is_available()` fails (as discussed earlier), installing the Fabric Manager may resolve the issue.

**Common error message:**

```
torch.cuda.is_available() function: Error 802: system not yet initialized (Triggered internally at ../c10/cuda/CUDAFunctions.cpp:109.)
```

Further details: [NVIDIA Developer Forum Thread](https://forums.developer.nvidia.com/t/error-802-system-not-yet-initialized-cuda-11-3/234955)

> _**NOTE**_ - Replace `525` with your installed NVIDIA driver version.
>
> _**NOTE**_ - Wait ~2–3 minutes after installation for the service to initialize.

```bash
apt-get install nvidia-fabricmanager-525
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

> _**NOTE**_ - Replace `2204` with your Ubuntu version (e.g., `2404` for Ubuntu 24.04).
>
> _**NOTE**_ - `apt dist-upgrade` with the official NVIDIA repo upgrades all NVIDIA packages in sync.

```bash
wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/3bf863cc.pub
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


