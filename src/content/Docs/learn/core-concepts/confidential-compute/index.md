---
categories: ["Learn", "Core Concepts"]
tags: ["Confidential Compute", "TEE", "Security", "Privacy", "GPU"]
weight: 7
title: "Confidential Compute (TEE)"
linkTitle: "Confidential Compute"
description: "Deploy workloads inside hardware-backed Trusted Execution Environments on Akash Network"
---

> **Experimental feature.** Confidential Compute (TEE) is experimental and under active development. Its SDL syntax, attestation API, and runtime behavior may change without notice. We encourage you to try it and share feedback, but plan for breaking changes.

**Deploy workloads inside hardware-isolated Trusted Execution Environments (TEEs) where neither the provider nor any other party can access your data or code in memory.**

Standard cloud deployments require trusting the infrastructure operator. Confidential Compute eliminates that requirement. Containers run inside encrypted virtual machines where the CPU hardware enforces isolation, so the provider's OS, hypervisor, and administrators cannot inspect the workload's memory.

Akash supports AMD SEV-SNP and Intel TDX. Tenants specify a TEE *capability* (`cpu` or `cpu-gpu`) in their SDL, and the provider resolves the actual hardware *platform* (`snp` or `tdx`) at deployment time based on its cluster nodes. NVIDIA GPU Confidential Computing is available with the `cpu-gpu` capability.

> **Important: Private container registries are not supported yet.** Confidential Compute workloads can only pull images from **public** registries. If your SDL references an image that requires registry credentials to pull, the deployment will fail. See [Limitations and Considerations](#limitations-and-considerations) for details.

---

## Why Confidential Compute?

### Hardware-Enforced Isolation

In a standard deployment, the provider's operating system has full access to container memory. With Confidential Compute:

- **Memory is encrypted by the CPU**, this means the provider's OS, hypervisor and administrators cannot read it
- **Workloads run in a Trusted Execution Environment (TEE)**, which is an hardware-level isolation, not software sandboxing
- **Attestation provides cryptographic proof** that the workload is running in a genuine TEE with the expected configuration
- **GPU memory can also be protected** via NVIDIA Confidential Computing

### Use Cases

**AI & Machine Learning:**
- Private model inference (protect proprietary models)
- Confidential fine-tuning on sensitive data

**Healthcare:**
- Processing protected health information (PHI)
- Drug discovery on confidential compounds

**General Privacy:**
- Any workload handling secrets, PII or proprietary algorithms
- Zero-trust deployments where you cannot trust the infrastructure

---

## Supported TEE Types

Akash uses capability-based TEE types. You choose the workload type; the provider resolves the hardware platform.

| Capability | SDL Value | Description |
|------------|-----------|-------------|
| CPU-only TEE | `cpu` | Confidential VM with CPU memory encryption |
| CPU + GPU TEE | `cpu-gpu` | Confidential VM with CPU memory encryption plus NVIDIA GPU Confidential Computing |

The provider selects the actual runtime class based on its detected hardware platform:

| Capability | Platform | Runtime Class |
|------------|----------|---------------|
| `cpu` | Intel TDX (`tdx`) | `kata-qemu-tdx` |
| `cpu` | AMD SEV-SNP (`snp`) | `kata-qemu-snp` |
| `cpu-gpu` | Intel TDX (`tdx`) | `kata-qemu-nvidia-gpu-tdx` |
| `cpu-gpu` | AMD SEV-SNP (`snp`) | `kata-qemu-nvidia-gpu-snp` |

Both Intel TDX and AMD SEV-SNP provide equivalent security guarantees. The actual platform used depends on the provider's hardware. Use `cpu-gpu` when your workload requires GPU acceleration (e.g., AI inference or training).

---

## How It Works

Deploying a confidential workload requires only a `params.tee` value in your SDL. The platform handles the rest:

1. **Your SDL specifies the TEE capability** via `params.tee` (`cpu` or `cpu-gpu`)
2. **The chain-SDK projects `tee/type=<value>`** as a placement requirement so only capable providers can bid
3. **The provider matches the bid** using its advertised `tee/type` attribute and resolves the RuntimeClass from the requested capability plus its detected hardware platform (`tdx` or `snp`)
4. **A Kata Container VM launches inside the hardware TEE** (AMD SEV-SNP or Intel TDX)
5. **Your container runs inside the encrypted VM** and all memory is hardware-encrypted
6. **The Akash attestation sidecar is injected by default** (unless disabled by the tenant)
7. **You can verify the TEE** at any time by requesting a hardware-signed attestation report from the provider

Everything inside the VM boundary is encrypted. The provider's OS and administrators cannot access it.

---

## SDL Configuration

Set `params.tee` to the desired capability in your service definition. The rest of the SDL remains unchanged.

> **Important: Images must come from a public registry.** Private container registries are not supported yet for Confidential Compute. Every `image` referenced by a TEE service must be publicly pullable, images requiring pull credentials will cause the deployment to fail.

### Basic Example — CPU-only TEE

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
          size: 128Mi
  placement:
    westcoast:
      pricing:
        web:
          denom: uact
          amount: 1000

deployment:
  web:
    westcoast:
      profile: web
      count: 1
```

### GPU + TEE Example

To combine GPU workloads with Confidential Compute, use `cpu-gpu` and add GPU resources:

```yaml
---
version: "2.1"

services:
  inference:
    image: my-private-model:latest
    expose:
      - port: 8080
        as: 80
        to:
          - global: true
    params:
      tee: cpu-gpu

profiles:
  compute:
    inference:
      resources:
        cpu:
          units: 0.5
        memory:
          size: 256Mi
        storage:
          size: 128Mi
        gpu:
          units: 1
          attributes:
            vendor:
              nvidia:
  placement:
    westcoast:
      pricing:
        inference:
          denom: uact
          amount: 10000

deployment:
  inference:
    westcoast:
      profile: inference
      count: 1
```

### TEE Type Reference

The `params.tee` field accepts the following values:

| Value | Runtime Class (Intel TDX) | Runtime Class (AMD SEV-SNP) | Description |
|-------|---------------------------|-----------------------------|-------------|
| `cpu` | `kata-qemu-tdx` | `kata-qemu-snp` | CPU-only confidential VM |
| `cpu-gpu` | `kata-qemu-nvidia-gpu-tdx` | `kata-qemu-nvidia-gpu-snp` | Confidential VM with NVIDIA GPU CC |

`cpu-gpu` must be paired with GPU resources in the compute profile. GPU CC workloads request the `nvidia.com/pgpu` Kubernetes resource for VFIO passthrough.

---

## Attestation

Attestation is how you verify that your workload is genuinely running inside a hardware TEE. The attestation report is signed by the CPU hardware itself and the provider cannot forge or tamper with it.

### Overview

The attestation flow has two stages:

1. **Challenge**: Send a random 64-byte nonce (your challenge) to the provider's attestation quote endpoint. The nonce ensures the report is fresh and was generated for your specific request
2. **Verification**: The provider proxies your request to the in-pod attestation sidecar, which returns a hardware-signed report. Verify it against AMD's, Intel's, or NVIDIA's published root-of-trust certificates to confirm the TEE is genuine

### Using the CLI

The simplest way to request attestation:

```bash
provider-services lease-attestation \
  --dseq <deployment-sequence> \
  --gseq <group-sequence> \
  --oseq <order-sequence> \
  --provider <provider-address> \
  --from <your-key>
```

### API Reference

The attestation API exposes a single quote endpoint. The provider forwards your nonce to the attestation sidecar running inside the TEE and returns the hardware-signed response verbatim.

#### Quote (Challenge-Response)

Send your nonce to receive a hardware-signed attestation report:

```
POST /lease/{dseq}/{gseq}/{oseq}/attestation/quote
```

Request:
```json
{
  "nonce": "<base64-encoded-64-bytes>",
  "bind_tls": false
}
```

Response:
```json
{
  "report": "<base64-raw-attestation-report>",
  "cert_chain": "<base64-certificate-chain>",
  "tee_type": "snp",
  "auxblob": "<base64-auxiliary-blob>",
  "gpu_reports": [
    {
      "device_index": 0,
      "report": "<base64-gpu-attestation>"
    }
  ],
  "tls_bound": false
}
```

The `report` field contains the raw hardware-signed attestation evidence (an SNP report or TDX quote). For GPU TEE types, `gpu_reports` contains a per-device entry for every GPU in the workload.

### GPU Report Format

Each `gpu_reports[].report` value is a base64-encoded blob that contains two concatenated parts:

```
[SPDM evidence (variable length)][PEM certificate chain (variable length)]
```

Split on the first `-----BEGIN CERTIFICATE-----` marker to separate them:

- **Before the marker** — SPDM measurement records and signature (the GPU attestation evidence)
- **From the marker onward** — PEM-encoded certificate chain, 5 certificates in order:
  1. Device certificate (leaf)
  2. GSP BROM certificate
  3. Provisioner ICA
  4. Identity CA
  5. NVIDIA Device Identity CA (self-signed root)

### TLS Channel Binding

Setting `bind_tls: true` binds the attestation report to the current TLS session. The sidecar computes `SHA-512(tls_public_key || nonce)[:64]` and places the result in the report's `REPORT_DATA` field. This proves the attestation came from the same endpoint you're connected to, preventing relay attacks.

### Security Model

The attestation design enforces these properties:

- **Provider cannot modify evidence** — the nonce and hardware report are passed through verbatim
- **Nonce proves freshness** — the hardware includes your nonce in `REPORT_DATA`, proving the report was generated for your request
- **Channel binding is optional but recommended** — for sensitive workloads, use `bind_tls: true` to prevent attestation relay

---

## Limitations and Considerations

- **Private container registries are not supported yet.** Confidential Compute workloads can only pull images from **public** registries. Images that require authentication (pull credentials/`imagePullSecrets`) cannot be used with a TEE deployment, and the deployment will fail if it references one. Support for private registries is planned but not yet available. For now, ensure any image used in a confidential workload is publicly pullable.
- **Provider availability**: Only providers with TEE-capable hardware can accept confidential workloads. Look for the `tee/type` attribute when selecting a provider.
- **Performance**: Memory encryption adds a small overhead (~1-5%). GPU Confidential Computing may add further overhead depending on the workload.
- **Sidecar resources**: The attestation sidecar consumes modest resources (10m CPU, 32-64Mi memory) which are automatically included in resource accounting.
- **Runtime environment**: TEE workloads run inside Kata VMs rather than standard containers. Most workloads are unaffected, but features that depend on direct host kernel access may behave differently.
- **Distroless and scratch-based images are not supported.** Kata Containers uses a guest agent inside the VM to set up and manage the container filesystem. Images built `FROM scratch` or from `gcr.io/distroless/...` lack the minimal filesystem structure (e.g. `/dev`, `/proc`, `/sys`) that the guest agent requires to initialize the container. Use a minimal but complete base image such as `alpine` or `ubuntu` instead.

---

## Related Topics

- [CC Hardware Compatibility](/docs/providers/operations/confidential-compute-hardware) — Which CPUs and GPUs support Confidential Compute
- [Provider Confidential Compute Setup](/docs/providers/setup-and-installation/kubespray/confidential-compute) — How providers enable TEE support
- [GPU Deployments](/docs/learn/core-concepts/gpu-deployments) — General GPU deployment guide
- [Provider Attributes](/docs/providers/operations/provider-attributes) — How providers advertise TEE capabilities
