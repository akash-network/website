---
categories: ["Providers"]
tags: ["Akash Provider", "GPU", "Resources"]
weight: 3
title: "GPU Resource Enablement (Optional Step)"
linkTitle: "GPU Resource Enablement (Optional Step)"
---

The steps involved in enabling your Akash Provider to host GPU resources are covered in this section and via these steps. For comprehensive hardware requirements and best practices, including GPU specifications and configurations, please refer to our [Hardware Best Practices](/docs/providers/build-a-cloud-provider/hardware-best-practices/) guide.

- [GPU Provider Configuration](#gpu-provider-configuration)
- [Enabling GPU Resources on Akash](#enabling-gpu-resources-on-akash)
- [GPU Node Label](#gpu-node-label)
- [Apply NVIDIA Runtime Engine](#apply-nvidia-runtime-engine)
- [Update Akash Provider](#update-akash-provider)
- [GPU Test Deployments](#gpu-test-deployments)
- [GPU Provider Troubleshooting](/docs/providers/provider-faq-and-guide/#gpu-provider-troubleshooting)

## GPU Provider Configuration

### Overview

Sections in this guide cover the installation of the following packages necessary for Akash Provider GPU hosting:

- [Install NVIDIA Drivers & Toolkit](#install-nvidia-drivers-and-toolkit)
- [NVIDIA Runtime Configuration](#nvidia-runtime-configuration)

### Install NVIDIA Drivers & Toolkit

> _**NOTE**_ - The steps in this section should be completed on all Kubernetes nodes hosting GPU resources

#### Prepare Environment

> _**NOTE**_ - reboot the servers following the completion of this step

```
apt update

DEBIAN_FRONTEND=noninteractive apt -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" dist-upgrade

apt autoremove
```

#### Install Latest NVIDIA Drivers

> _**NOTE**_ - Your Ubuntu version should be 24.04.
> _**NOTE**_ - Running `apt dist-upgrade` with the official NVIDIA repo bumps the `nvidia` packages along with the `nvidia-fabricmanager`, without version mismatch issue.

- Add the official nvidia repo

```
wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2404/x86_64/3bf863cc.pub && \
apt-key add 3bf863cc.pub && \
echo "deb https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2404/x86_64/ /" | tee /etc/apt/sources.list.d/nvidia-official-repo.list && \
apt update
```

- Install the latest nvidia-driver version

> In this example the latest was nvidia 565 (max supported CUDA 12.7), you can use `apt-cache search nvidia-driver | grep ^nvidia-driver` command to determine the latest version.

```
DEBIAN_FRONTEND=noninteractive apt -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" install nvidia-driver-565 && \
apt -y autoremove
```

And reboot.

### For non-PCIe, e.g. SXM\* GPUs

In some circumstances it has been found that the NVIDIA Fabric Manager needs to be installed on worker nodes hosting GPU resources (typically, non-PCIe GPU configurations such as those using SXM form factors).

> Replace `565` with your nvidia driver version installed in the previous steps
> You may need to wait for about 2-3 minutes for the nvidia fabricmanager to initialize

```
apt-get install nvidia-fabricmanager-565
systemctl start nvidia-fabricmanager
systemctl enable nvidia-fabricmanager
```

### Install the NVIDIA Container Toolkit

> _**NOTE**_ - The steps in this sub-section should be completed on all Kubernetes nodes hosting GPU resources

```
curl -s -L https://nvidia.github.io/libnvidia-container/gpgkey | apt-key add -
curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list | tee /etc/apt/sources.list.d/libnvidia-container.list

apt-get update
apt-get install -y nvidia-container-toolkit nvidia-container-runtime
```

[Reference](/docs/providers/provider-faq-and-guide/#gpu-provider-troubleshooting)

### Additional References for Node Configurations

> _**NOTE -**_ references are for additional info only. No actions are necessary and the Kubernetes nodes should be all set to proceed to next step based on configurations enacted in prior steps on this doc.

- [https://github.com/NVIDIA/k8s-device-plugin#prerequisites](https://github.com/NVIDIA/k8s-device-plugin#prerequisites)
- [https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html)

### NVIDIA Runtime Configuration

#### Worker nodes

> _**NOTE**_ - The steps in this sub-section should be completed on all Kubernetes nodes hosting GPU resources

Update the nvidia-container-runtime config in order to prevent `NVIDIA_VISIBLE_DEVICES=all` abuse where tenants could access more GPU's than they requested.

> _**NOTE**_ - This will only work with `nvdp/nvidia-device-plugin` helm chart installed with `--set deviceListStrategy=volume-mounts` (you'll get there in the next steps)

Make sure the config file `/etc/nvidia-container-runtime/config.toml` contains these line uncommmented and set to these values:

```
accept-nvidia-visible-devices-as-volume-mounts = true
accept-nvidia-visible-devices-envvar-when-unprivileged = false
```

> _**NOTE**_ - `/etc/nvidia-container-runtime/config.toml` is part of `nvidia-container-toolkit-base` package; so it won't override the customer-set parameters there since it is part of the `/var/lib/dpkg/info/nvidia-container-toolkit-base.conffiles`

#### Kubespray

> _**NOTE**_ - the steps in this sub-section should be completed on the Kubespray host only

> _**NOTE**_ - skip this sub-section if these steps were completed during your Kubernetes build process

In this step we add the NVIDIA runtime confguration into the Kubespray inventory. The runtime will be applied to necessary Kubernetes hosts when Kubespray builds the cluster in the subsequent step.

#### Create NVIDIA Runtime File for Kubespray Use

```
cat > ~/kubespray/inventory/akash/group_vars/all/akash.yml <<'EOF'
containerd_additional_runtimes:
  - name: nvidia
    type: "io.containerd.runc.v2"
    engine: ""
    root: ""
    options:
      BinaryName: '/usr/bin/nvidia-container-runtime'
EOF
```

#### Kubespray the Kubernetes Cluster

```
cd ~/kubespray

source venv/bin/activate

ansible-playbook -i inventory/akash/hosts.yaml -b -v --private-key=~/.ssh/id_rsa cluster.yml
```

## Enabling GPU Resources on Akash

To set up GPU resources on Akash, providers need to ensure their configuration allows for proper GPU detection. This guide will walk you through essential resources, troubleshooting steps, and configuration tips to get your GPUs recognized and operational.

### 1. Important Guides for GPU Configuration

For a comprehensive setup, new providers should start with these foundational guides:

- [Provider Feature Discovery GPU Configuration Integration Guide](/docs/providers/provider-feature-discovery-gpu-configuration-integration-guide/): Step-by-step instructions for configuring GPUs to work seamlessly with Akash.
- [Akash Provider Feature Discovery Upgrade Enablement](/docs/providers/akash-provider-feature-discovery-upgrade-enablement/): Detailed guidance on necessary upgrades to fully support GPU functionality.

These guides are essential for ensuring GPU compatibility, particularly for providers facing detection issues or new to the configuration process.

### 2. Troubleshooting Undetected GPUs in `gpus.json`

In some cases, a provider's GPU may not be recognized if it isn't listed in the [gpus.json](https://github.com/akash-network/provider-configs/blob/main/devices/pcie/gpus.json) file. To check if your GPU model is missing, use the following command to list GPU details on your system:

```bash
provider-services tools psutil list gpu | jq '.cards[] | .pci | {vendor: .vendor, product: .product}'

```

This command returns the vendor and product information of detected GPUs, which you can use to update `gpus.json` and ensure your hardware is correctly identified by Akash.

## GPU Node Label

### Overview

In this section we verify that necessary Kubernetes node labels have been applied for your GPUs. The labeling of nodes is an automated process and here we only verify proper labels have been applied.

### Verification of Node Labels

- Replace `<node-name>` with the node of interest

```
kubectl describe node <node-name> | grep -A10 Labels
```

#### Expected Output using Example

- Note the presence of the GPU model, interface, and ram expected values.

```
root@node1:~# kubectl describe node node2 | grep -A10 Labels
Labels:             akash.network=true
                    akash.network/capabilities.gpu.vendor.nvidia.model.t4=1
                    akash.network/capabilities.gpu.vendor.nvidia.model.t4.interface.PCIe=1
                    akash.network/capabilities.gpu.vendor.nvidia.model.t4.ram.16Gi=1
                    akash.network/capabilities.storage.class.beta2=1
                    akash.network/capabilities.storage.class.default=1
                    allow-nvdp=true
                    beta.kubernetes.io/arch=amd64
                    beta.kubernetes.io/os=linux
                    kubernetes.io/arch=amd64
                    kubernetes.io/hostname=node2
```

## Apply NVIDIA Runtime Engine

### Create RuntimeClass

> _**NOTE**_ - conduct these steps on the control plane node that Helm was installed on via the previous step

### Create the NVIDIA Runtime Config

```
cat > nvidia-runtime-class.yaml << EOF
kind: RuntimeClass
apiVersion: node.k8s.io/v1
metadata:
  name: nvidia
handler: nvidia
EOF
```

### Apply the NVIDIA Runtime Config

```
kubectl apply -f nvidia-runtime-class.yaml
```

### Upgrade/Install the NVIDIA Device Plug In Via Helm - GPUs on All Nodes

> _**NOTE**_ - in some scenarios a provider may host GPUs only on a subset of Kubernetes worker nodes. Use the instructions in this section if ALL Kubernetes worker nodes have available GPU resources. If only a subset of worker nodes host GPU resources - use the section `Upgrade/Install the NVIDIA Device Plug In Via Helm - GPUs on Subset of Nodes` instead. Only one of these two sections should be completed.

```shell

helm repo add nvdp https://nvidia.github.io/k8s-device-plugin

helm repo update

helm upgrade -i nvdp nvdp/nvidia-device-plugin \
  --namespace nvidia-device-plugin \
  --create-namespace \
  --version 0.17.1 \
  --set runtimeClassName="nvidia" \
  --set deviceListStrategy=volume-mounts


```

#### Expected/Example Output

```
root@ip-172-31-8-172:~# helm upgrade -i nvdp nvdp/nvidia-device-plugin \
  --namespace nvidia-device-plugin \
  --create-namespace \
  --version 0.17.1 \
  --set runtimeClassName="nvidia" \
  --set deviceListStrategy=volume-mounts

Release "nvdp" does not exist. Installing it now.
NAME: nvdp
LAST DEPLOYED: Thu Apr 13 19:11:28 2023
NAMESPACE: nvidia-device-plugin
STATUS: deployed
REVISION: 1
TEST SUITE: None
```

### Upgrade/Install the NVIDIA Device Plug In Via Helm - GPUs on Subset of Nodes

> _**NOTE**_ - use the instructions in this section if only a subset of Kubernetes worker nodes have available GPU resources.

- By default, the nvidia-device-plugin DaemonSet may run on all nodes in your Kubernetes cluster. If you want to restrict its deployment to only GPU-enabled nodes, you can leverage Kubernetes node labels and selectors.&#x20;
- Specifically, you can use the `allow-nvdp=true label` to limit where the DaemonSet is scheduled.

#### STEP 1: Label the GPU Nodes

- First, identify your GPU nodes and label them with `allow-nvdp=true`. You can do this by running the following command for each GPU node
- Replace `node-name` of the node you're labeling

> _**NOTE**_ - if you are unsure of the `<node-name>` to be used in this command - issue `kubectl get nodes` from one of your Kubernetes control plane nodes to obtain via the `NAME` column of this command output

```
kubectl label nodes <node-name> allow-nvdp=true
```

#### STEP 2: Update Helm Chart Values

- By setting the node selector, you are ensuring that the `nvidia-device-plugin` DaemonSet will only be scheduled on nodes with the `allow-nvdp=true` label.

```
helm repo add nvdp https://nvidia.github.io/k8s-device-plugin

helm repo update

helm upgrade -i nvdp nvdp/nvidia-device-plugin \
  --namespace nvidia-device-plugin \
  --create-namespace \
  --version 0.17.1 \
  --set runtimeClassName="nvidia" \
  --set deviceListStrategy=volume-mounts \
  --set-string nodeSelector.allow-nvdp="true"
```

#### &#x20;STEP 3: Verify

```
kubectl -n nvidia-device-plugin get pods -o wide
```

_**Expected/Example Output**_

- In this example only nodes: node1, node3 and node4 have the `allow-nvdp=true` labels and that's where `nvidia-device-plugin` pods spawned at:

```
root@node1:~# kubectl -n nvidia-device-plugin get pods -o wide

NAME                              READY   STATUS    RESTARTS   AGE   IP            NODE    NOMINATED NODE   READINESS GATES
nvdp-nvidia-device-plugin-gqnm2   1/1     Running   0          11s   10.233.75.1   node2   <none>           <none>
```

### Verification - Applicable to all Environments

```
kubectl -n nvidia-device-plugin logs -l app.kubernetes.io/instance=nvdp
```

#### Example/Expected Output

```
 root@node1:~# kubectl -n nvidia-device-plugin logs -l app.kubernetes.io/instance=nvdp
  "sharing": {
    "timeSlicing": {}
  }
}
2023/04/14 14:18:27 Retreiving plugins.
2023/04/14 14:18:27 Detected NVML platform: found NVML library
2023/04/14 14:18:27 Detected non-Tegra platform: /sys/devices/soc0/family file not found
2023/04/14 14:18:27 Starting GRPC server for 'nvidia.com/gpu'
2023/04/14 14:18:27 Starting to serve 'nvidia.com/gpu' on /var/lib/kubelet/device-plugins/nvidia-gpu.sock
2023/04/14 14:18:27 Registered device plugin for 'nvidia.com/gpu' with Kubelet
  "sharing": {
    "timeSlicing": {}
  }
}
2023/04/14 14:18:29 Retreiving plugins.
2023/04/14 14:18:29 Detected NVML platform: found NVML library
2023/04/14 14:18:29 Detected non-Tegra platform: /sys/devices/soc0/family file not found
2023/04/14 14:18:29 Starting GRPC server for 'nvidia.com/gpu'
2023/04/14 14:18:29 Starting to serve 'nvidia.com/gpu' on /var/lib/kubelet/device-plugins/nvidia-gpu.sock
2023/04/14 14:18:29 Registered device plugin for 'nvidia.com/gpu' with Kubelet
```

### Test GPUs

> _**NOTE**_ - conduct the steps in this section on a Kubernetes control plane node

#### Launch GPU Test Pod

##### Create the GPU Test Pod Config

```
cat > gpu-test-pod.yaml << EOF
apiVersion: v1
kind: Pod
metadata:
  name: gpu-pod
spec:
  restartPolicy: Never
  runtimeClassName: nvidia
  containers:
    - name: cuda-container
    # Nvidia cuda compatibility https://docs.nvidia.com/deploy/cuda-compatibility/
    # for nvidia 510 drivers
    ## image: nvcr.io/nvidia/k8s/cuda-sample:vectoradd-cuda10.2
    # for nvidia 525 drivers use below image
      image: nvcr.io/nvidia/k8s/cuda-sample:vectoradd-cuda11.6.0
      resources:
        limits:
          nvidia.com/gpu: 1 # requesting 1 GPU
  tolerations:
  - key: nvidia.com/gpu
    operator: Exists
    effect: NoSchedule
EOF
```

##### Apply the GPU Test Pod Config

```
kubectl apply -f gpu-test-pod.yaml
```

#### Verification of GPU Pod

```
kubectl logs gpu-pod
```

##### Expected/Example Output

```
root@node1:~# kubectl logs gpu-pod
[Vector addition of 50000 elements]
Copy input data from the host memory to the CUDA device
CUDA kernel launch with 196 blocks of 256 threads
Copy output data from the CUDA device to the host memory
Test PASSED
Done
```

## Update Akash Provider

### Update Provider Configuration File

Providers must be updated with attributes in order to bid on the GPUs.

> NOTE - in the Akash Provider build documentation a `provider.yaml` file was created and which stores provider attribute/other settings. In this section we will update that `provider.yaml` file with GPU related attributes. The remainder of the pre-existing file should be left unchanged.

#### GPU Attributes Template

- GPU model template is used in the subsequent `Provider Configuration File`
- Multiple such entries should be included in the `Provider Configuration File` if the providers has multiple GPU types
- Currently Akash providers may only host one GPU type per worker node. But different GPU models/types may be hosted on separate Kubernetes nodes.
- We recommend including both a GPU attribute which includes VRAM and a GPU attribute which does not include VRAM to ensure your provider bids when the deployer includes/excludes VRAM spec. Example of this recommended approach in the `provider.yaml` example below.
- Include the GPU interface type - as seen in the example below - to ensure provider bids when the deployer includes the interface in the SDL.

```
capabilities/gpu/vendor/<vendor name>/model/<model name>: true
```

#### Example Provider Configuration File

- In the example configuration file below the Akash Provider will advertise availability of NVIDIA GPU model A4000
- Steps included in this code block create the necessary `provider.yaml` file in the expected directory
- Ensure that the attributes section is updated with your own values

```
cd ~

cd provider

vim provider.yaml
```

#### **Update the Provider YAML File With GPU Attribute**

- When the `provider.yaml` file update is complete is should look like this:

```

---
from: "$ACCOUNT_ADDRESS"
key: "$(cat ~/key.pem | openssl base64 -A)"
keysecret: "$(echo $KEY_PASSWORD | openssl base64 -A)"
domain: "$DOMAIN"
node: "$AKASH_NODE"
withdrawalperiod: 12h
attributes:
  - key: host
    value: akash
  - key: tier
    value: community
  - key: capabilities/gpu/vendor/nvidia/model/a100
    value: true
  - key: capabilities/gpu/vendor/nvidia/model/a100/ram/80Gi
    value: true
  - key: capabilities/gpu/vendor/nvidia/model/a100/ram/80Gi/interface/pcie
    value: true
  - key: capabilities/gpu/vendor/nvidia/model/a100/interface/pcie
    value: true
```

## **Provider Bid Defaults**

- When a provider is created the default bid engine settings are used which are used to derive pricing per workload. If desired these settings could be updated. But we would recommend initially using the default values.
- For a through discussion on customized pricing please visit this [guide](/docs/providers/build-a-cloud-provider/akash-cli/helm-based-provider-persistent-storage-enablement#/step-6---provider-bid-customization).

## Update Provider Via Helm

```

helm upgrade --install akash-provider akash/provider -n akash-services -f provider.yaml \
--set bidpricescript="$(cat /root/provider/price_script_generic.sh | openssl base64 -A)"
```

## Verify Health of Akash Provider

Use the following command to verify the health of the Akash Provider and Hostname Operator pods

```
kubectl get pods -n akash-services
```

#### Example/Expected Output

```
root@node1:~/provider# kubectl get pods -n akash-services
NAME                                       READY   STATUS    RESTARTS   AGE
akash-hostname-operator-5c59757fcc-kt7dl   1/1     Running   0          17s
akash-provider-0                           1/1     Running   0          59s
```

## Verify Provider Attributes On Chain

- In this step we ensure that your updated Akash Provider Attributes have been updated on the blockchain. Ensure that the GPU model related attributes are now in place via this step.

> _**NOTE**_ - conduct this verification from your Kubernetes control plane node

```
# Ensure that a RPC node environment variable is present for query
export AKASH_NODE=https://rpc.akashnet.net:443
# Replace the provider address with your own value
provider-services query provider get <provider-address>
```

#### Example/Expected Output

```bash

provider-services query provider get akash1mtnuc449l0mckz4cevs835qg72nvqwlul5wzyf


attributes:
- key: region
  value: us-central
- key: host
  value: akash
- key: tier
  value: community
- key: organization
  value: akash test provider
- key: capabilities/gpu/vendor/nvidia/model/a100
  value: "true"
- key: capabilities/gpu/vendor/nvidia/model/a100/ram/80Gi
  value: "true"
- key: capabilities/gpu/vendor/nvidia/model/a100/ram/80Gi/interface/pcie
  value: "true"
- key: capabilities/gpu/vendor/nvidia/model/a100/interface/pcie
  value: "true"
host_uri: https://provider.akashtestprovider.xyz:8443
info:
  email: ""
  website: ""
owner: akash1mtnuc449l0mckz4cevs835qg72nvqwlul5wzyf

```

## Verify Akash Provider Image

Verify the Provider image is correct by running this command:

```
kubectl -n akash-services get pod akash-provider-0 -o yaml | grep image: | uniq -c
```

#### Expected/Example Output

```
root@node1:~/provider# kubectl -n akash-services get pod akash-provider-0 -o yaml | grep image: | uniq -c
      4     image: ghcr.io/akash-network/provider:0.4.6
```

## GPU Test Deployments

### Overview

Use any of the Akash deployment tools covered [here](/docs/deployments/overview/) for your Provider test deployments.


> _**NOTE**_ - this section covers GPU specific deployment testing and verificaiton of your Akash Provider. In addition, general Provider verifications can be made via this [Provider Checkup](/docs/providers/build-a-cloud-provider/akash-cli/akash-provider-checkup/) guide.


### Example GPU SDL #1

> _**NOTE**_ - in this example the deployer is requesting bids from only Akash Providers that have available NVIDIA A4000 GPUs. Adjust accordingly for your provider testing.

```
---
version: "2.0"

services:
  gpu-test:
    # Nvidia cuda compatibility https://docs.nvidia.com/deploy/cuda-compatibility/
    # for nvidia 510 drivers
    ## image: nvcr.io/nvidia/k8s/cuda-sample:vectoradd-cuda10.2
    # for nvidia 525 drivers use below image
    image: nvcr.io/nvidia/k8s/cuda-sample:vectoradd-cuda11.6.0
    command:
      - "sh"
      - "-c"
    args:
      - 'sleep infinity'
    expose:
      - port: 3000
        as: 80
        to:
          - global: true
profiles:
  compute:
    gpu-test:
      resources:
        cpu:
          units: 1
        memory:
          size: 1Gi
        gpu:
          units: 1
          attributes:
            vendor:
              nvidia:
                - model: a4000
        storage:
          - size: 512Mi
  placement:
    westcoast:
      pricing:
        gpu-test:
          denom: uakt
          amount: 100000
deployment:
  gpu-test:
    westcoast:
      profile: gpu-test
      count: 1
```

### Testing of Deployment/GPU Example #1

- Conduct the following tests from the deployment's shell.

#### Test 1

```
/tmp/sample
```

#### Expected/Example Output

```
root@gpu-test-6d4f545b6f-f95zk:/# /tmp/sample

[Vector addition of 50000 elements]
Copy input data from the host memory to the CUDA device
CUDA kernel launch with 196 blocks of 256 threads
Copy output data from the CUDA device to the host memory
Test PASSED
Done
```

#### Test 2

```
nvidia-smi
```

#### Expected/Example Output

```
root@gpu-test-6d4f545b6f-f95zk:/# nvidia-smi

Fri Apr 14 09:23:33 2023
+-----------------------------------------------------------------------------+
| NVIDIA-SMI 525.85.12    Driver Version: 525.85.12    CUDA Version: 12.0     |
|-------------------------------+----------------------+----------------------+
| GPU  Name        Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC |
| Fan  Temp  Perf  Pwr:Usage/Cap|         Memory-Usage | GPU-Util  Compute M. |
|                               |                      |               MIG M. |
|===============================+======================+======================|
|   0  NVIDIA RTX A4000    Off  | 00000000:05:00.0 Off |                  Off |
| 41%   44C    P8    13W / 140W |      0MiB / 16376MiB |      0%      Default |
|                               |                      |                  N/A |
+-------------------------------+----------------------+----------------------+

+-----------------------------------------------------------------------------+
| Processes:                                                                  |
|  GPU   GI   CI        PID   Type   Process name                  GPU Memory |
|        ID   ID                                                   Usage      |
|=============================================================================|
|  No running processes found                                                 |
+-----------------------------------------------------------------------------+
root@gpu-test-6d4f545b6f-f95zk:/#
```

## Example GPU SDL #2

> _**NOTE**_ - there is currently an issue with GPU deployments closing once their primary process completes. Due to this issue the example SDL below causes repeated container resarts. The container will restart when the stable diffusion task has completed. When this issue has been resolved, GPU containers will remain running perpetually and will not close when the primary process defined in the SDL completes.

> _**NOTE**_ - the CUDA version necessary for this image is `11.7` currently. Check the image documentation page [here](https://github.com/fboulnois/stable-diffusion-docker/pkgs/container/stable-diffusion-docker) for possible updates.

> _**NOTE**_ - in this example the deployer is requesting bids from only Akash Providers that have available NVIDIA A4000 GPUs

```
---
version: "2.0"

services:
  gpu-test:
    image: ghcr.io/fboulnois/stable-diffusion-docker
    expose:
      - port: 3000
        as: 80
        to:
          - global: true
    cmd:
      - run
    args:
      - 'An impressionist painting of a parakeet eating spaghetti in the desert'
      - --attention-slicing
      - --xformers-memory-efficient-attention
profiles:
  compute:
    gpu-test:
      resources:
        cpu:
          units: 1
        memory:
          size: 20Gi
        gpu:
          units: 1
          attributes:
            vendor:
              nvidia:
                - model: a4000
        storage:
          - size: 100Gi
  placement:
    westcoast:
      pricing:
        gpu-test:
          denom: uakt
          amount: 100000
deployment:
  gpu-test:
    westcoast:
      profile: gpu-test
      count: 1
```
