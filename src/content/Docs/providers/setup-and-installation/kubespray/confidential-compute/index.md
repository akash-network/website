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

1. Schedules TEE workloads onto nodes with the correct runtime class
2. Injects an attestation sidecar into each confidential workload
3. Proxies attestation requests from tenants to the sidecar inside the TEE

### Supported Configurations

| TEE Type | Runtime Class | Hardware |
|----------|---------------|----------|
| AMD SEV-SNP | `kata-qemu-snp` | AMD with SEV-SNP enabled in BIOS |
| AMD SEV-SNP + GPU | `kata-qemu-nvidia-gpu-snp` | Above + NVIDIA CC-capable GPU |
| Intel TDX | `kata-qemu-tdx` | Intel with TDX enabled in BIOS |
| Intel TDX + GPU | `kata-qemu-nvidia-gpu-tdx` | Above + NVIDIA CC-capable GPU |

---

## STEP 1 — Verify Hardware Support

### AMD SEV-SNP

Run on each TEE node:

```bash
# Check CPU supports SEV-SNP
dmesg | grep -i snp
```

You should see output indicating SEV-SNP is enabled:

```
SEV-SNP enabled
```

Verify the device exists:

```bash
ls -la /dev/sev
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

## STEP 2 — Install Kata Containers via kata-deploy

[Kata Containers](https://katacontainers.io/) provides the confidential VM runtime. Install it using the `kata-deploy` Helm chart, which configures containerd runtime classes, RuntimeClass resources, and all Kata binaries automatically.

> **Do not install** QEMU, KVM userspace, libvirt, or OVMF packages on the host. Kata ships its own NVIDIA-patched versions of these components. Pre-installing them creates silent conflicts.

```bash
helm install kata-deploy \
  oci://ghcr.io/kata-containers/kata-deploy-charts/kata-deploy \
  --namespace kata-system --create-namespace \
  --set nfd.enabled=false \
  --wait --timeout 10m \
  --version 3.29.0
```

> If running K3s instead of standard Kubernetes, add `--set k8sDistribution=k3s`. Without this flag, kata-deploy will fail searching for containerd config at the wrong path.

Verify the installation:

```bash
# kata-deploy pod should be Running
kubectl get pods -n kata-system

# RuntimeClasses should be created automatically
kubectl get runtimeclass | grep kata-qemu
```

You should see runtime classes including `kata-qemu-snp`, `kata-qemu-tdx`, and their GPU variants (`kata-qemu-nvidia-gpu-snp`, `kata-qemu-nvidia-gpu-tdx`).

## STEP 3 — Install NVIDIA GPU Operator (GPU providers only)

> Skip this step if your provider does not offer GPU Confidential Computing.

The NVIDIA GPU Operator handles GPU VFIO binding, CC mode toggling, and device plugin registration. Do **not** install NVIDIA GPU drivers on the host — the operator manages everything.

```bash
helm repo add nvidia https://helm.ngc.nvidia.com/nvidia
helm repo update

helm install gpu-operator nvidia/gpu-operator \
  --namespace gpu-operator --create-namespace \
  --version v26.3.1 \
  --set sandboxWorkloads.enabled=true \
  --set sandboxWorkloads.mode=kata \
  --set nfd.enabled=true \
  --set nfd.nodefeaturerules=true \
  --wait --timeout 10m
```

Label each GPU node for operand activation:

```bash
kubectl label node <node-name> nvidia.com/gpu.workload.config=vm-passthrough
```

Verify the installation:

```bash
# All operand pods should be Running
kubectl get pods -n gpu-operator

# GPU should be bound to vfio-pci (not nvidia driver)
lspci -nnk -d 10de: | grep "Kernel driver in use"
# Expected: vfio-pci

# CC mode should be enabled
kubectl get node <node-name> -o json | \
  jq '.metadata.labels | with_entries(select(.key | startswith("nvidia.com/cc")))'
# Expected: "nvidia.com/cc.mode.state": "on", "nvidia.com/cc.ready.state": "true"

# Passthrough GPU resource should be advertised
kubectl get node <node-name> -o json | \
  jq '.status.allocatable | with_entries(select(.key | startswith("nvidia.com")))'
# Expected: "nvidia.com/pgpu": "1" (or more, depending on GPU count)
```

The operator deploys several components:
- **nvidia-vfio-manager** — binds GPUs to the `vfio-pci` driver for passthrough
- **nvidia-cc-manager** — toggles GPU Confidential Computing mode (default: on)
- **nvidia-kata-sandbox-device-plugin** — advertises `nvidia.com/pgpu` resources
- **nvidia-sandbox-validator** — node-level CC readiness validation
- **NFD components** — detects CPU TEE capabilities and GPU presence via node labels

## STEP 4 — Configure Provider Flags

The Akash provider automatically injects an attestation sidecar into every confidential workload if requested by the user. This sidecar runs inside the TEE and serves hardware-signed attestation reports to tenants. Enable it with the following flags.

### Required Flags

| Flag | Description | Required |
|------|-------------|----------|
| `--attestation-webhook-enabled` | Enables the Kubernetes mutating admission webhook. When active, the provider intercepts pod creation requests for confidential compute workloads and automatically injects the attestation sidecar container before scheduling. | Yes |
| `--attestation-sidecar-image` | Docker image reference for the attestation sidecar (e.g. `ghcr.io/akash-network/attestation-sidecar:latest`). Required when the webhook is enabled — the provider passes this image to the webhook for injection into every confidential workload. | Yes |
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

## STEP 5 — Configure Provider Attributes

Tenants discover TEE-capable providers through on-chain attributes. Add both `tee/platform` and `tee/type` to your `provider.yaml`:

- **`tee/platform`** — the hardware TEE platform: `snp` (AMD SEV-SNP) or `tdx` (Intel TDX)
- **`tee/type`** — the capability offered: `cpu` (CPU-only) or `cpu-gpu` (CPU + GPU Confidential Computing)

### AMD SEV-SNP, CPU only

```yaml
attributes:
  - key: tee/platform
    value: snp
  - key: tee/type
    value: cpu
```

### AMD SEV-SNP with GPU

```yaml
attributes:
  - key: tee/platform
    value: snp
  - key: tee/type
    value: cpu-gpu
```

### Intel TDX, CPU only

```yaml
attributes:
  - key: tee/platform
    value: tdx
  - key: tee/type
    value: cpu
```

### Intel TDX with GPU

```yaml
attributes:
  - key: tee/platform
    value: tdx
  - key: tee/type
    value: cpu-gpu
```

After updating attributes, restart your provider:

```bash
cd /root/provider
helm upgrade akash-provider akash/provider \
  -n akash-services \
  -f provider.yaml \
  --set bidpricescript="$(cat price_script.sh | openssl base64 -A)"
```

---

## STEP 6 — Verify Setup

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
      tee:
        type: sev-snp

profiles:
  compute:
    web:
      resources:
        cpu:
          units: 0.5
        memory:
          size: 256Mi
        storage:
          size: 128Mi
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
# Expected: kata-qemu-snp

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

- [Confidential Compute Overview](/docs/learn/core-concepts/confidential-compute) — Tenant-facing guide for deploying confidential workloads
- [SDL Advanced Features](/docs/developers/deployment/akash-sdl/advanced-features) — SDL reference for TEE configuration
- [GPU Support](/docs/providers/setup-and-installation/kubespray/gpu-support) — Enable GPU resources on your provider
- [Provider Attributes](/docs/providers/operations/provider-attributes) — Advertise provider capabilities
- [Provider Installation](/docs/providers/setup-and-installation/kubespray/provider-installation) - Base provider setup
