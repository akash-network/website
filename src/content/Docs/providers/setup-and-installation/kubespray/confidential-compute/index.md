---
categories: ["Providers"]
tags: ["Confidential Compute", "TEE", "Advanced Features", "Configuration"]
weight: 3
title: "Confidential Compute (TEE) Support"
linkTitle: "Confidential Compute"
description: "Enable Trusted Execution Environment support on your Akash provider"
---

This guide shows how to enable Confidential Compute (TEE) support on your Akash provider, allowing tenants to deploy workloads inside hardware-backed Trusted Execution Environments.

> **Prerequisites:** You must have a working Akash provider with Kubernetes already deployed. See [Kubernetes Setup](/docs/providers/setup-and-installation/kubespray/kubernetes-setup) and [Provider Installation](/docs/providers/setup-and-installation/kubespray/provider-installation).

> **Hardware required:** Your nodes must have TEE-capable processors, AMD EPYC (Milan or later) for SEV-SNP, or Intel Xeon (Sapphire Rapids or later) for TDX.

> **Do not enable LUKS (full-disk encryption) on TEE host nodes.** SEV-SNP and TDX encrypt guest VM memory at the hardware level, that is the security boundary that matters for tenant workloads. LUKS on the host root filesystem adds boot-time complexity without providing additional protection.

---

## Overview

Confidential Compute on Akash uses [Kata Containers](https://katacontainers.io/) to run tenant workloads inside hardware-encrypted virtual machines. The provider automatically:

1. Detects the TEE platform (`tdx` or `snp`) from Kubernetes node labels
2. Matches tenant `tee/type` placement requirements against advertised provider attributes
3. Resolves the correct Kata RuntimeClass from the requested capability and detected platform
4. Injects an attestation sidecar into each confidential workload
5. Proxies attestation requests from tenants to the sidecar inside the TEE

### Supported Configurations

| TEE Capability | Detected Platform | Runtime Class | Hardware |
|----------------|-------------------|---------------|----------|
| `cpu` | `snp` | `kata-qemu-snp` | AMD with SEV-SNP enabled in BIOS |
| `cpu-gpu` | `snp` | `kata-qemu-nvidia-gpu-snp` | Above + NVIDIA CC-capable GPU |
| `cpu` | `tdx` | `kata-qemu-tdx` | Intel with TDX enabled in BIOS |
| `cpu-gpu` | `tdx` | `kata-qemu-nvidia-gpu-tdx` | Above + NVIDIA CC-capable GPU |

---

## STEP 1 — Verify Hardware Support

Before proceeding, confirm your hardware is on the [supported hardware list](/docs/providers/operations/confidential-compute-hardware). Not all processors in a product family support TEE, so check your specific model.

### AMD SEV-SNP

Run on each TEE node:

```bash
# Check CPU supports SEV-SNP
dmesg | grep -i sev
```

You should see output indicating SEV-SNP is enabled:

```
ccp 0000:22:00.1: sev enabled
ccp 0000:22:00.1: SEV-SNP API:1.51 build:3
SEV supported: 410 ASIDs
SEV-ES and SEV-SNP supported: 99 ASIDs
```

Verify the device exists:

```bash
ls -la /dev/sev-guest
```

> **If SEV-SNP is not showing:** Enable it in your BIOS/UEFI under AMD CBS > CPU Configuration > SEV-SNP. Ensure your firmware is up to date.

### Intel TDX

Run on each TEE node:

```bash
# Check CPU supports TDX
dmesg | grep -i tdx
```

You should see:

```
tdx: TDX module initialized
virt/tdx: module initialized
```

Verify the device exists:

```bash
ls -la /dev/tdx_guest  # or /dev/tdx-attest on older kernels
```

> **If TDX is not showing:** Enable it in your BIOS/UEFI under Intel Advanced Menu > TDX. Requires a TDX-capable kernel (Linux 6.2+).

---

## STEP 2 — Install Kata Containers

Once hardware support is confirmed, install the [Kata Containers](https://katacontainers.io/) runtime. Kata runs each confidential workload inside a lightweight VM with hardware-encrypted memory. Install it on **each TEE node**.

### Install Kata Packages

```bash
# Add Kata Containers repository
sudo mkdir -p /etc/apt/keyrings
wget -qO- https://packagecloud.io/kata-containers/stable/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/kata-containers.gpg
echo "deb [signed-by=/etc/apt/keyrings/kata-containers.gpg] https://packagecloud.io/kata-containers/stable/ubuntu/ $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/kata-containers.list

sudo apt update
sudo apt install -y kata-containers
```

### Configure Kata for Your TEE Type

#### AMD SEV-SNP Configuration

Create the Kata configuration for SNP at `/etc/kata-containers/configuration-qemu-snp.toml`:

```toml
[hypervisor.qemu]
path = "/usr/bin/qemu-system-x86_64"
kernel = "/usr/share/kata-containers/vmlinuz-snp.container"
image = "/usr/share/kata-containers/kata-containers-snp.img"
machine_type = "q35"
firmware = "/usr/share/OVMF/OVMF_CODE.fd"
confidential_guest = true
sev_snp_guest = true

default_memory = 256
default_vcpus = 1

[runtime]
enable_annotations = ["io.katacontainers.*"]
sandbox_cgroup_only = true
```

#### Intel TDX Configuration

Create the Kata configuration for TDX at `/etc/kata-containers/configuration-qemu-tdx.toml`:

```toml
[hypervisor.qemu]
path = "/usr/bin/qemu-system-x86_64"
kernel = "/usr/share/kata-containers/vmlinuz-tdx.container"
image = "/usr/share/kata-containers/kata-containers-tdx.img"
machine_type = "q35"
firmware = "/usr/share/OVMF/OVMF_CODE.fd"
confidential_guest = true
tdx_guest = true

default_memory = 256
default_vcpus = 1

[runtime]
enable_annotations = ["io.katacontainers.*"]
sandbox_cgroup_only = true
```

---

## STEP 3 — Configure Containerd Runtime Classes

Containerd needs to know about the Kata runtime classes so it can launch confidential VMs. Add the entries below to `/etc/containerd/config.toml` on **each TEE node**. Only add the runtime classes that match your hardware.

### AMD SEV-SNP

```toml
[plugins."io.containerd.grpc.v1.cri".containerd.runtimes.kata-qemu-snp]
  runtime_type = "io.containerd.kata-qemu-snp.v2"
  privileged_without_host_devices = true
  [plugins."io.containerd.grpc.v1.cri".containerd.runtimes.kata-qemu-snp.options]
    ConfigPath = "/etc/kata-containers/configuration-qemu-snp.toml"
```

For SNP with GPU support, add:

```toml
[plugins."io.containerd.grpc.v1.cri".containerd.runtimes.kata-qemu-nvidia-gpu-snp]
  runtime_type = "io.containerd.kata-qemu-nvidia-gpu-snp.v2"
  privileged_without_host_devices = true
  [plugins."io.containerd.grpc.v1.cri".containerd.runtimes.kata-qemu-nvidia-gpu-snp.options]
    ConfigPath = "/etc/kata-containers/configuration-qemu-nvidia-gpu-snp.toml"
```

### Intel TDX

```toml
[plugins."io.containerd.grpc.v1.cri".containerd.runtimes.kata-qemu-tdx]
  runtime_type = "io.containerd.kata-qemu-tdx.v2"
  privileged_without_host_devices = true
  [plugins."io.containerd.grpc.v1.cri".containerd.runtimes.kata-qemu-tdx.options]
    ConfigPath = "/etc/kata-containers/configuration-qemu-tdx.toml"
```

For TDX with GPU support, add:

```toml
[plugins."io.containerd.grpc.v1.cri".containerd.runtimes.kata-qemu-nvidia-gpu-tdx]
  runtime_type = "io.containerd.kata-qemu-nvidia-gpu-tdx.v2"
  privileged_without_host_devices = true
  [plugins."io.containerd.grpc.v1.cri".containerd.runtimes.kata-qemu-nvidia-gpu-tdx.options]
    ConfigPath = "/etc/kata-containers/configuration-qemu-nvidia-gpu-tdx.toml"
```

Restart containerd after configuration changes:

```bash
sudo systemctl restart containerd
```

---

## STEP 4 — Create Kubernetes RuntimeClasses

Kubernetes uses [RuntimeClass](https://kubernetes.io/docs/concepts/containers/runtime-class/) resources to map workloads to specific container runtimes. Create one for each TEE type your provider supports. Only create the ones that match your hardware, you do not need all four.

### AMD SEV-SNP

```bash
cat <<EOF | kubectl apply -f -
apiVersion: node.k8s.io/v1
kind: RuntimeClass
metadata:
  name: kata-qemu-snp
handler: kata-qemu-snp
overhead:
  podFixed:
    memory: "160Mi"
    cpu: "250m"
EOF
```

For SNP with GPU:

```bash
cat <<EOF | kubectl apply -f -
apiVersion: node.k8s.io/v1
kind: RuntimeClass
metadata:
  name: kata-qemu-nvidia-gpu-snp
handler: kata-qemu-nvidia-gpu-snp
overhead:
  podFixed:
    memory: "160Mi"
    cpu: "250m"
EOF
```

### Intel TDX

```bash
cat <<EOF | kubectl apply -f -
apiVersion: node.k8s.io/v1
kind: RuntimeClass
metadata:
  name: kata-qemu-tdx
handler: kata-qemu-tdx
overhead:
  podFixed:
    memory: "160Mi"
    cpu: "250m"
EOF
```

For TDX with GPU:

```bash
cat <<EOF | kubectl apply -f -
apiVersion: node.k8s.io/v1
kind: RuntimeClass
metadata:
  name: kata-qemu-nvidia-gpu-tdx
handler: kata-qemu-nvidia-gpu-tdx
overhead:
  podFixed:
    memory: "160Mi"
    cpu: "250m"
EOF
```

### Verify RuntimeClasses

```bash
kubectl get runtimeclass
```

Expected output (depending on which TEE types you configured):

```
NAME                         HANDLER                      AGE
kata-qemu-snp                kata-qemu-snp                1m
kata-qemu-nvidia-gpu-snp     kata-qemu-nvidia-gpu-snp     1m
kata-qemu-tdx                kata-qemu-tdx                1m
kata-qemu-nvidia-gpu-tdx     kata-qemu-nvidia-gpu-tdx     1m
```

---

## STEP 5 — Configure Provider Flags

The Akash provider automatically injectw an attestation sidecar into every confidential workload if requested by the user. This sidecar runs inside the TEE and serves hardware-signed attestation reports to tenants. Enable it with the following flags.

### Required Flags

| Flag | Description | Required |
|------|-------------|----------|
| `--attestation-webhook-enabled` | Enables the Kubernetes mutating admission webhook. When active, the provider intercepts pod creation requests for confidential compute workloads and automatically injects the attestation sidecar container before scheduling. | Yes |
| `--attestation-sidecar-image` | Docker image reference for the attestation sidecar (e.g. `ghcr.io/akash-network/attestation-sidecar:latest`). Required when the webhook is enabled, because the provider passes this image to the webhook for injection into every confidential workload. | Yes |
| `--attestation-webhook-port` | HTTPS port for the webhook server that handles Kubernetes API callbacks. In production, pair this with `--gateway-tls-cert` and `--gateway-tls-key` using a certificate whose SAN includes the provider's K8s service DNS name. Defaults to `9443` and auto-generates a self-signed cert if TLS files are omitted. | No |

### Optional Flags

| Flag | Description | Default |
|------|-------------|---------|
| `--attestation-mock` | Run the sidecar in mock mode with synthetic (fake) attestation reports instead of real TEE hardware evidence. Also switches the webhook registration to a `host.docker.internal` URL for local clusters. **For local development only, never enable in production.** | `false` |

### Example: Helm Values

When deploying the provider with Helm, add these values:

```yaml
# provider.yaml
attestation:
  webhookEnabled: true
  sidecarImage: "ghcr.io/akash-network/attestation-sidecar:latest"
  webhookPort: 9443
```

### Example: CLI Flags

```bash
provider-services run \
  --attestation-webhook-enabled \
  --attestation-sidecar-image "ghcr.io/akash-network/attestation-sidecar:latest" \
  --attestation-webhook-port 9443
```

---

## STEP 6 — Configure Provider Attributes

Tenants discover TEE-capable providers through on-chain attributes. Add the `tee/type` attribute to your `provider.yaml` so your provider appears in TEE-filtered searches. The value is the capability you offer; the actual hardware platform is detected from Kubernetes node labels at runtime.

### CPU-only Confidential Compute

```yaml
attributes:
  - key: tee/type
    value: cpu
```

### Confidential Compute with GPU

```yaml
attributes:
  - key: tee/type
    value: cpu-gpu
```

### Node Labels for Platform Detection

The provider determines whether it runs on Intel TDX or AMD SEV-SNP by reading Kubernetes node labels:

- `intel.feature.node.kubernetes.io/tdx=true` — Intel TDX
- `amd.feature.node.kubernetes.io/snp=true` — AMD SEV-SNP

These labels are set by the Kubernetes node-feature-discovery (NFD) component and do **not** need to be advertised as provider attributes.

### GPU Resources

For `cpu-gpu` workloads, the provider schedules NVIDIA GPUs using the VFIO-passthrough resource `nvidia.com/pgpu`. This resource is exposed by the kata-sandbox-device-plugin and is separate from the standard `nvidia.com/gpu` resource used for non-CC GPU workloads.

After updating attributes, restart your provider:

```bash
cd /root/provider
helm upgrade akash-provider akash/provider \
  -n akash-services \
  -f provider.yaml \
  --set bidpricescript="$(cat price_script.sh | openssl base64 -A)"
```

---

## STEP 7 — Verify Setup

### Test with a Confidential Deployment

Create a test SDL file (`test-cc.yaml`):

```yaml
---
version: "2.1"

services:
  web:
    image: nginx
    expose:
      - port: 80
        as: 80
        to:
          - global: true
    params:
      tee: cpu

profiles:
  compute:
    web:
      resources:
        cpu:
          units: 0.5
        memory:
          size: 256Mi
        storage:
          size: 256Mi
  placement:
    akash:
      pricing:
        web:
          denom: uact
          amount: 1000

deployment:
  web:
    akash:
      profile: web
      count: 1
```

Deploy and verify:

```bash
# Deploy
provider-services tx deployment create test-cc.yaml --from <your-key>

# After lease is created, check that the pod has the correct runtime class
kubectl get pods -n <lease-namespace> -o jsonpath='{.items[0].spec.runtimeClassName}'
# Expected: kata-qemu-snp or kata-qemu-tdx, depending on provider hardware

# Check the attestation sidecar was injected
kubectl get pods -n <lease-namespace> -o jsonpath='{.items[0].spec.containers[*].name}'
# Expected: web akash-attestation-sidecar
```

### Request an Attestation Quote

```bash
provider-services lease-attestation \
  --dseq <deployment-sequence> \
  --gseq 1 \
  --oseq 1 \
  --provider <provider-address> \
  --from <your-key>
```

A successful response contains a hardware-signed attestation report, confirming the workload is running in a genuine TEE.

---

## Troubleshooting

### Pod stuck in Pending

```bash
kubectl describe pod <pod-name> -n <lease-namespace>
```

Common causes:
- **RuntimeClass not found**: Verify the RuntimeClass exists with `kubectl get runtimeclass`
- **No TEE-capable nodes**: Ensure nodes with TEE hardware are labeled and schedulable
- **Kata not installed**: Check that Kata is properly installed on the target node

### Attestation sidecar not injected

- Verify the webhook is running: `kubectl get mutatingwebhookconfigurations`
- Check provider logs for webhook errors
- Ensure `--attestation-webhook-enabled` is set

### Attestation quote returns error

- Verify the sidecar container is running: `kubectl logs <pod> -c akash-attestation-sidecar -n <namespace>`
- Check that TEE devices are accessible inside the Kata VM
- For GPU variants, verify NVIDIA drivers are available inside the guest

### SEV-SNP device not found

- Ensure BIOS has SEV-SNP enabled
- Update to latest firmware/microcode
- Verify kernel supports SEV-SNP (Linux 5.19+)
- Check `dmesg | grep -i sev` for errors

### TDX device not found

- Ensure BIOS has TDX enabled
- Verify TDX kernel module is loaded: `lsmod | grep tdx`
- TDX requires Linux 6.2+ with TDX support compiled in

---

## Related Topics

- [CC Hardware Compatibility](/docs/providers/operations/confidential-compute-hardware) — Supported CPUs and GPUs for Confidential Compute
- [Confidential Compute Overview](/docs/learn/core-concepts/confidential-compute) — Tenant-facing guide for deploying confidential workloads
- [GPU Support](/docs/providers/setup-and-installation/kubespray/gpu-support) — Enable GPU resources on your provider
- [Provider Attributes](/docs/providers/operations/provider-attributes) — Advertise provider capabilities
- [Provider Installation](/docs/providers/setup-and-installation/kubespray/provider-installation) — Base provider setup
