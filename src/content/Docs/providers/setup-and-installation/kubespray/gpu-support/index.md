---
categories: ["Providers"]
tags: ["GPU", "Advanced Features", "Configuration"]
weight: 2
title: "GPU Support"
linkTitle: "GPU Support"
description: "Enable NVIDIA GPU resources on your Akash provider"
---

This guide shows how to enable NVIDIA GPU support on your Akash provider after Kubernetes is deployed.

> **Don't have GPUs?** Skip to [Persistent Storage (Rook-Ceph)](/docs/providers/setup-and-installation/kubespray/persistent-storage) or [Provider Installation](/docs/providers/setup-and-installation/kubespray/provider-installation).

> **Prerequisites:** You must have already configured the NVIDIA runtime in Kubespray **before** deploying your cluster. See [Kubernetes Setup - Step 7](/docs/providers/setup-and-installation/kubespray/kubernetes-setup#step-7---configure-gpu-support-optional).

**Time:** 30-45 minutes

---

## STEP 1 - Install NVIDIA Drivers

Run these commands on **each GPU node**:

### Update System

```bash
apt update
DEBIAN_FRONTEND=noninteractive apt -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" dist-upgrade
apt autoremove
```

Reboot the node after this step.

### Add NVIDIA Repository

```bash
wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2404/x86_64/3bf863cc.pub
apt-key add 3bf863cc.pub
echo "deb https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2404/x86_64/ /" | tee /etc/apt/sources.list.d/cuda-repo.list
apt update
```

### Install Driver

Install the recommended NVIDIA driver version 580:

```bash
DEBIAN_FRONTEND=noninteractive apt -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" install nvidia-driver-580
apt -y autoremove
```

Reboot the node.

### Verify Installation

```bash
nvidia-smi
```

You should see your GPUs listed with driver information.

### SXM GPUs Only

If you have non-PCIe GPUs (SXM form factor), also install Fabric Manager:

```bash
apt-get install nvidia-fabricmanager-580
systemctl start nvidia-fabricmanager
systemctl enable nvidia-fabricmanager
```

---

## STEP 2 - Install NVIDIA Container Toolkit

Run on **each GPU node**:

```bash
curl -s -L https://nvidia.github.io/libnvidia-container/gpgkey | apt-key add -
curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | tee /etc/apt/sources.list.d/libnvidia-container.list

apt-get update
apt-get install -y nvidia-container-toolkit nvidia-container-runtime
```

---

## STEP 3 - Configure NVIDIA CDI

Run on **each GPU node**:

### Generate CDI Specification

```bash
sudo nvidia-ctk cdi generate --output=/etc/cdi/nvidia.yaml
```

### Configure NVIDIA Runtime

Edit `/etc/nvidia-container-runtime/config.toml` and ensure these lines are **uncommented** and set to:

```toml
accept-nvidia-visible-devices-as-volume-mounts = false
accept-nvidia-visible-devices-envvar-when-unprivileged = true
```

> **Note:** This setup uses **CDI (Container Device Interface)** for device enumeration, which provides better security and device management.

---

## STEP 4 - Create NVIDIA RuntimeClass

Run from a **control plane node**:

```bash
cat > nvidia-runtime-class.yaml << 'EOF'
kind: RuntimeClass
apiVersion: node.k8s.io/v1
metadata:
  name: nvidia
handler: nvidia
EOF

kubectl apply -f nvidia-runtime-class.yaml
```

---

## STEP 5 - Label GPU Nodes

Label each GPU node (replace `<node-name>` with actual node name):

```bash
kubectl label nodes <node-name> allow-nvdp=true
```

### Verify Labels

```bash
kubectl describe node <node-name> | grep -A5 Labels
```

You should see `allow-nvdp=true`.

---

## STEP 6 - Install NVIDIA Device Plugin

Run from a **control plane node**:

```bash
helm repo add nvdp https://nvidia.github.io/k8s-device-plugin
helm repo update

helm upgrade -i nvdp nvdp/nvidia-device-plugin \
  --namespace nvidia-device-plugin \
  --create-namespace \
  --version 0.18.0 \
  --set runtimeClassName="nvidia" \
  --set deviceListStrategy=cdi-cri \
  --set nvidiaDriverRoot="/" \
  --set-string nodeSelector.allow-nvdp="true"
```

### Verify Installation

```bash
kubectl -n nvidia-device-plugin get pods -o wide
```

You should see `nvdp-nvidia-device-plugin` pods running on your GPU nodes.

### Check Logs

```bash
kubectl -n nvidia-device-plugin logs -l app.kubernetes.io/instance=nvdp
```

**Expected output:**

```
Detected NVML platform: found NVML library
Starting GRPC server for 'nvidia.com/gpu'
Registered device plugin for 'nvidia.com/gpu' with Kubelet
```

---

## STEP 7 - Test GPU Functionality

Create a test pod:

```bash
cat > gpu-test-pod.yaml << 'EOF'
apiVersion: v1
kind: Pod
metadata:
  name: gpu-test
spec:
  restartPolicy: Never
  runtimeClassName: nvidia
  containers:
    - name: cuda-container
      image: nvcr.io/nvidia/k8s/cuda-sample:vectoradd-cuda11.6.0
      resources:
        limits:
          nvidia.com/gpu: 1
  tolerations:
  - key: nvidia.com/gpu
    operator: Exists
    effect: NoSchedule
EOF

kubectl apply -f gpu-test-pod.yaml
```

### Verify Test

Wait for the pod to complete, then check logs:

```bash
kubectl logs gpu-test
```

**Expected output:**

```
[Vector addition of 50000 elements]
Copy input data from the host memory to the CUDA device
CUDA kernel launch with 196 blocks of 256 threads
Copy output data from the CUDA device to the host memory
Test PASSED
Done
```

### Test nvidia-smi

Create an interactive test:

```bash
kubectl run gpu-shell --rm -it --restart=Never --image=nvidia/cuda:11.6.0-base-ubuntu20.04 -- nvidia-smi
```

You should see GPU information displayed.

### Cleanup

```bash
kubectl delete pod gpu-test
```

---

## Next Steps

Your Kubernetes cluster now has GPU support!

**Optional enhancements:**
- [TLS Certificates](/docs/providers/setup-and-installation/kubespray/tls-certificates) - Automatic SSL certificates
- [IP Leases](/docs/providers/setup-and-installation/kubespray/ip-leases) - Enable static IPs

> **Note:** After installing the provider, you'll need to add GPU attributes to your `provider.yaml` to advertise GPU capabilities. This is covered in the Provider Installation guide.
