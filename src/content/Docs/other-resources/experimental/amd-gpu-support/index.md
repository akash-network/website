---
categories: ["Other Resources", "Experimental"]
tags: []
weight: 2
title: "AMD GPU Support"
linkTitle: "AMD GPU Support"
---

## Introduction

Welcome to the specialized guide designed to assist Akash Providers in enabling AMD GPU support within their Kubernetes clusters. This documentation is particularly crafted for system administrators, developers, and DevOps professionals who manage and operate their Akash Providers. The focus here is to guide you through the process of integrating AMD GPUs into your Kubernetes/Akash setup, ensuring that they can be utilized in the Akash Network.

Throughout this guide, you will find step-by-step instructions on installing the necessary AMD drivers, configuring Kubernetes to acknowledge and leverage AMD GPUs.

This documentation is vital for Akash Providers and Clients who aim to deploy advanced workloads such as machine learning models, high-performance computing tasks, or any applications that benefit from GPU acceleration. By following this guide, you will be able to enhance your service offerings on the Akash Network, catering to a wider range of computational needs with AMD GPU support.

> **NOTE**: To effectively enable AMD GPU support, ensure that your `akash-provider` and `provider-services` (CLI) are updated to version `0.4.9-rc0` or higher. This is a prerequisite for proper integration and functionality of AMD GPUs on your Akash Provider.

## Limitations

Current constraints dictate that combining NVIDIA and AMD GPU vendors within the same Kubernetes worker node is not allowed. However, it is permissible to have different GPU vendors within the same Kubernetes cluster, as long as each individual worker node exclusively uses GPUs from a single vendor, be it NVIDIA or AMD.

- **Vendor Constraint:** Combining NVIDIA and AMD GPUs within the same Kubernetes worker node is not permitted.
- **Vendor Homogeneity:** It is permissible to mix different GPU vendors on the same Kubernetes cluster. However, this mixing is not allowed within a single worker node.
- **Vendor Exclusivity:** Each worker node must exclusively use GPUs from a single vendor, either NVIDIA or AMD. This means a single node cannot have a mix of NVIDIA and AMD GPUs, but different nodes within the same cluster can use different vendors.

## Installing the AMD GPU Driver

Follow these steps to install the AMD GPU Driver:

1. Install AMD GPU drivers using DKMS

- Apply these commands on your node with AMD GPU:

  > based on https://rocm.docs.amd.com/projects/install-on-linux/en/latest/install/install-methods/package-manager/package-manager-ubuntu.html

  ```
  mkdir --parents --mode=0755 /etc/apt/keyrings

  wget https://repo.radeon.com/rocm/rocm.gpg.key -O - | \
    gpg --dearmor | tee /etc/apt/keyrings/rocm.gpg > /dev/null

  echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/rocm.gpg] https://repo.radeon.com/amdgpu/6.0.1/ubuntu jammy main" \
    | tee /etc/apt/sources.list.d/amdgpu.list
  apt update
  apt -y install amdgpu-dkms
  ```

2. Make sure the right driver is loaded:

- Reboot the node:
  By default `/lib/modules/<version>/kernel/drivers/gpu/drm/amd/amdgpu/amdgpu.ko` is loaded, however you cannot simply `modprobe -r amdgpu` and then `modprobe amdgpu`.  
   You need to reboot to make sure the correct AMD GPU driver (DKMS `/lib/modules/<version>/updates/dkms/amdgpu.ko`) is properly loaded.

- Verify correct version is loaded (you may see a higher version, that's okay):

  ```
  # dmesg -T |grep 'amdgpu version'
  [Fri Jan 26 22:47:18 2024] [drm] amdgpu version: 6.3.6

  # dmesg -T |grep -i 'Initialized amdgpu'
  [Fri Jan 26 22:47:19 2024] [drm] Initialized amdgpu 3.56.0 20150101 for 0000:1b:00.0 on minor 1
  ```

## Enabling AMD GPU Support in Akash Provider

### 1. Install `ROCm/k8s-device-plugin` helm-chart

- Add the helm repository and install the chart:

  ```bash
  helm repo add amd-gpu-helm https://github.com/ROCm/k8s-device-plugin/
  helm install --create-namespace --namespace amd-device-plugin --set namespace=amd-device-plugin amd-gpu amd-gpu-helm/amd-gpu --version 0.12.0
  ```

- Verify the installation:

  > NOTE: replace `node1` with the node name of your worker node (`kubectl get nodes`)

  ```bash
  kubectl -n amd-device-plugin logs ds/amd-gpu-device-plugin-daemonset
  kubectl describe node node1 | grep -B1 -Ei 'nvidia.com/gpu|amd.com/gpu'
  ```

- Example output:

  ```bash
  # kubectl -n amd-device-plugin logs ds/amd-gpu-device-plugin-daemonset
  I0126 22:47:52.227295       1 main.go:305] AMD GPU device plugin for Kubernetes
  I0126 22:47:52.227493       1 main.go:305] ./k8s-device-plugin version v1.25.2.7-0-g4503704
  I0126 22:47:52.227506       1 main.go:305] hwloc: _VERSION: 2.10.0, _API_VERSION: 0x00020800, _COMPONENT_ABI: 7, Runtime: 0x00020800
  I0126 22:47:52.227524       1 manager.go:42] Starting device plugin manager
  I0126 22:47:52.227543       1 manager.go:46] Registering for system signal notifications
  I0126 22:47:52.228216       1 manager.go:52] Registering for notifications of filesystem changes in device plugin directory
  I0126 22:47:52.228421       1 manager.go:60] Starting Discovery on new plugins
  I0126 22:47:52.228446       1 manager.go:66] Handling incoming signals
  I0126 22:47:52.228491       1 manager.go:71] Received new list of plugins: [gpu]
  I0126 22:47:52.228555       1 manager.go:110] Adding a new plugin "gpu"
  I0126 22:47:52.228594       1 plugin.go:64] gpu: Starting plugin server
  I0126 22:47:52.228605       1 plugin.go:94] gpu: Starting the DPI gRPC server
  I0126 22:47:52.229986       1 plugin.go:112] gpu: Serving requests...
  I0126 22:48:02.237090       1 plugin.go:128] gpu: Registering the DPI with Kubelet
  I0126 22:48:02.238870       1 plugin.go:140] gpu: Registration for endpoint amd.com_gpu
  I0126 22:48:02.246025       1 amdgpu.go:100] /sys/module/amdgpu/drivers/pci:amdgpu/0000:1b:00.0
  I0126 22:48:02.323568       1 main.go:149] Watching GPU with bus ID: 0000:1b:00.0 NUMA Node: [0]

  # kubectl describe node node1 | grep -B1 -Ei 'nvidia.com/gpu|amd.com/gpu'
  Capacity:
    amd.com/gpu:        1
  --
  Allocatable:
    amd.com/gpu:        1
  --
    hugepages-2Mi      0 (0%)         0 (0%)
    amd.com/gpu        0              0
  ```

### 2. Label AMD GPU Node

- Label your AMD GPU node (replace `mi210` with your AMD GPU model):
  ```bash
  kubectl label node node1 akash.network/capabilities.gpu.vendor.amd.model.mi210=true
  ```

### 3. Test AMD GPU with TensorFlow in Pod

Before proceeding with the deployment, be aware of the following:

> **NOTE:** Starting the `alexnet-gpu` may take a considerable amount of time, especially over slow network connections. This delay is due to the large size of the image, approximately `10 GiB`, as detailed on [Docker Hub](https://hub.docker.com/r/rocm/tensorflow/tags).

To deploy and test the TensorFlow environment on AMD GPUs, follow these steps:

1. Create the pod using the provided YAML file:

   ```bash
   kubectl create -f https://raw.githubusercontent.com/ROCm/k8s-device-plugin/c9fc007f07fca4ea1c495ab57f54e10ffa9e2a6b/example/pod/alexnet-gpu.yaml
   ```

2. Check the logs to verify successful deployment and operation:

   ```bash
   kubectl logs alexnet-tf-gpu-pod
   # Expected output includes:
   # TensorFlow version information, list of devices (e.g., '/gpu:0'), and performance metrics (e.g., total images/sec).
   ```

   Example output:

   ```
   $ kubectl logs alexnet-tf-gpu-pod
   ...
   2024-01-26 22:50:28.771404: I tensorflow/core/common_runtime/gpu/gpu_device.cc:1886] Created device /job:localhost/replica:0/task:0/device:GPU:0 with 63950 MB memory:  -> device: 0, name: AMD Instinct MI210, pci bus id: 0000:1b:00.0
   ...
   TensorFlow:  2.14
   ...
   Devices:     ['/gpu:0']
   ...
   total images/sec: 5849.31
   ```

3. Once testing is complete, delete the pod:
   ```bash
   kubectl delete pod alexnet-tf-gpu-pod
   ```

## Update bid pricing parameters for your AMD GPU card

Make sure you are using the latest bid pricing script. You can follow [these](/docs/providers/provider-faq-and-guide#provider-bid-script-migration---gpu-models) instructions.

- Add the pricing for your AMD GPU model (replace `mi210` with your model) to `provider.yaml` file:
  ```yaml
  price_target_gpu_mappings: "mi210=190,*=200"
  ```

This sets `$190`/month for AMD GPU MI 210 card and defaults to `$200`/month when the GPU model was [not](https://github.com/akash-network/support/issues/166) explicitly set.

## Testing AMD GPU with TensorFlow in Akash Deployment

To test TensorFlow with AMD GPU in Akash Deployment:

- Base your deployment on the image & command/args from the provided YAML file.
- Use image: `rocm/tensorflow`.
- Override the `command` & `args` in the SDL.
- Execute the benchmarking command:
  ```bash
  python3 /benchmarks/scripts/tf_cnn_benchmarks/tf_cnn_benchmarks.py --model=alexnet
  ```

### Example SDL

Use the following SDL configuration to deploy `rocm/tensorflow` image:

> Make sure to replace `SSH_PUBKEY` with your public SSH key should you want to be able ssh to your deployment instead of `lease-shell` into it.

```yaml
---
version: "2.0"

services:
  app:
    image: rocm/tensorflow:latest
    env:
      - 'SSH_PUBKEY=ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAINNFxqDbY0BlEjJ2y9B2IKUUoimOq6oAC7WcsQT8qmII andy'
    command:
      - "sh"
      - "-c"
    args:
      - 'apt-get update;
      apt-get install -y --no-install-recommends -- ssh speedtest-cli netcat-openbsd curl wget ca-certificates jq less iproute2 iputils-ping vim bind9-dnsutils nginx;
      mkdir -p -m0755 /run/sshd;
      mkdir -m700 ~/.ssh;
      echo "$SSH_PUBKEY" | tee ~/.ssh/authorized_keys;
      chmod 0600 ~/.ssh/authorized_keys;
      ls -lad ~ ~/.ssh ~/.ssh/authorized_keys;
      md5sum ~/.ssh/authorized_keys;
      exec /usr/sbin/sshd -D'
    expose:
      - port: 80
        as: 80
        to:
          - global: true
      - port: 22
        as: 22
        to:
          - global: true


profiles:
  compute:
    app:
      resources:
        cpu:
          units: 2
        memory:
          size: 8Gi
        storage:
          size: 25Gi
        gpu:
          units: 1
          attributes:
            vendor:
              amd:
                - model: mi210
  placement:
    akash:
      attributes:
        host: akash
      pricing:
        app:
          denom: uakt
          amount: 1000000

deployment:
  app:
    akash:
      profile: app
      count: 1
```

## Additional material

- Exploring Integration of `rocm-smi` in AMD GPU Pods for Enhanced Compatibility

We are [exploring](https://github.com/ROCm/k8s-device-plugin/issues/44) the possibility of including the `rocm-smi` tool by default in AMD GPU Pods, analogous to how `nvidia-smi` is available in NVIDIA GPU Pods. This inclusion in NVIDIA pods is facilitated by the NVIDIA device plugin, which mounts necessary host paths and utilizes environment variables like `NVIDIA_DRIVER_CAPABILITIES`. For more detailed examples and information, refer to the NVIDIA Container Toolkit documentation [here](https://github.com/NVIDIA/nvidia-container-toolkit/blob/a2262d00cc6d98ac2e95ae2f439e699a7d64dc17/cmd/nvidia-container-runtime/README.md?plain=1#L147-L161). Our goal is to achieve similar functionality for AMD GPUs, enhancing user experience.
