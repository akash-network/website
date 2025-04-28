---
categories: ["Akash Provider"]
tags: ["Akash Provider", "Infrastructure", "Maintenance"]
weight: 1
title: "Infrastructure Upkeep"
linkTitle: "Infrastructure Upkeep"
---

# Infrastructure Upkeep

## Maintaining and Rotating Kubernetes/etcd Certificates: A How-To Guide

> The following doc is based on [Certificate Management with kubeadm](https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-certs/) & [https://www.txconsole.com/posts/how-to-renew-certificate-manually-in-kubernetes](https://www.txconsole.com/posts/how-to-renew-certificate-manually-in-kubernetes)

When K8s certs expire, you won't be able to use your cluster. Make sure to rotate your certs proactively.

The following procedure explains how to rotate them manually.

Evidence that the certs have expired:

```
root@node1:~# kubectl get nodes -o wide
error: You must be logged in to the server (Unauthorized)
```

You can always view the certs expiration using the `kubeadm certs check-expiration` command:

```
root@node1:~# kubeadm certs check-expiration
...
```

### Rotate K8s Certs

#### Backup etcd DB

It is crucial to back up your etcd DB as it contains your K8s cluster state! So make sure to backup your etcd DB first before rotating the certs!

##### Take the etcd DB Backup

```
export $(grep -v '^#' /etc/etcd.env | xargs -d '\n')
etcdctl -w table member list
etcdctl endpoint health --cluster -w table
etcdctl endpoint status --cluster -w table
etcdctl snapshot save node1.etcd.backup
```

You can additionally backup the current certs:

```
tar czf etc_kubernetes_ssl_etcd_bkp.tar.gz /etc/kubernetes /etc/ssl/etcd
```

#### Renew the Certs

> IMPORTANT: For an HA Kubernetes cluster with multiple control plane nodes, the `kubeadm certs renew` command (followed by the `kube-apiserver`, `kube-scheduler`, `kube-controller-manager` pods and `etcd.service` restart) needs to be executed on all the control-plane nodes, one at a time.

##### Rotate the k8s Certs

```
kubeadm certs renew all
```

##### Update your kubeconfig

```
mv -vi /root/.kube/config /root/.kube/config.old
cp -pi /etc/kubernetes/admin.conf /root/.kube/config
```

##### Bounce the following services in this order

```
kubectl -n kube-system delete pods -l component=kube-apiserver
kubectl -n kube-system delete pods -l component=kube-scheduler
kubectl -n kube-system delete pods -l component=kube-controller-manager
systemctl restart etcd.service
```

##### Verify the Certs Status

```
kubeadm certs check-expiration
```

Repeat the process for all control plane nodes, one at a time, if you have a HA Kubernetes cluster.

## Provider Bid Script Migration - GPU Models

A new bid script for Akash Providers has been released that now includes the ability to specify pricing of multiple GPU models.

##### New Features of Bid Script Release

- Parameterized price targets via Helm chart values
- Model-based GPU pricing

##### STEP 1 - Backup your current bid price script

```
helm -n akash-services get values akash-provider -o json | jq -r '.bidpricescript | @base64d' > old-bid-price-script.sh
```

##### STEP 2 - Verify Previous Custom Target Price Values

```
cat old-bid-price-script.sh | grep ^TARGET
```

##### STEP 3 - Backup Akash/Provider Config

```
helm -n akash-services get values akash-provider | grep -v '^USER-SUPPLIED VALUES' | grep -v ^bidpricescript > provider.yaml
```

##### STEP 4 - Update provider.yaml File Accordingly

```
price_target_cpu: 1.60
price_target_memory: 0.80
price_target_hd_ephemeral: 0.02
price_target_hd_pers_hdd: 0.01
price_target_hd_pers_ssd: 0.03
price_target_hd_pers_nvme: 0.04
price_target_endpoint: 0.05
price_target_ip: 5
price_target_gpu_mappings: "a100=120,t4=80,*=130"
```

##### STEP 5 - Download New Bid Price Script

```
mv -vi price_script_generic.sh price_script_generic.sh.old
wget https://raw.githubusercontent.com/akash-network/helm-charts/main/charts/akash-provider/scripts/price_script_generic.sh
```

##### STEP 6 - Upgrade Akash/Provider Chart to Version 6.0.5

```
helm repo update akash
helm search repo akash/provider
```

##### STEP 7 - Upgrade akash-provider Deployment with New Bid Script

```
helm upgrade akash-provider akash/provider -n akash-services -f provider.yaml --set bidpricescript="$(cat price_script_generic.sh | openssl base64 -A)"
```

##### Verification of Bid Script Update

```
helm list -n akash-services | grep akash-provider
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

