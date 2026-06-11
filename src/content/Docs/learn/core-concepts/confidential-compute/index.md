---
categories: ["Learn", "Core Concepts"]
tags: ["Confidential Compute", "TEE", "Security", "Privacy", "GPU"]
weight: 7
title: "Confidential Compute (TEE)"
linkTitle: "Confidential Compute"
description: "Deploy workloads inside hardware-backed Trusted Execution Environments on Akash Network"
---

**Deploy workloads inside hardware-isolated Trusted Execution Environments (TEEs) where neither the provider nor any other party can access your data or code in memory.**

Standard cloud deployments require trusting the infrastructure operator. Confidential Compute eliminates that requirement. Containers run inside encrypted virtual machines where the CPU hardware enforces isolation, the provider's OS, hypervisor and administrators cannot inspect the workload's memory.

Akash supports AMD SEV-SNP and Intel TDX, with optional NVIDIA GPU Confidential Computing for GPU-accelerated workloads.

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

Akash currently supports four TEE configurations:

| TEE Type | SDL Value | Description |
|----------|-----------|-------------|
| AMD SEV-SNP | `sev-snp` | CPU-only confidential VM on AMD hardware |
| AMD SEV-SNP + GPU | `sev-snp-gpu` | SEV-SNP with NVIDIA GPU Confidential Computing |
| Intel TDX | `tdx` | CPU-only confidential VM on Intel hardware |
| Intel TDX + GPU | `tdx-gpu` | TDX with NVIDIA GPU Confidential Computing |

Both `sev-snp` and `tdx` provide equivalent security guarantees. The choice depends on the provider's hardware. Use the `-gpu` variants when your workload requires GPU acceleration (e.g., AI inference or training).

---

## How It Works

Deploying a confidential workload requires only a `params.tee` block in your SDL. The platform handles the rest:

1. **Your SDL specifies the TEE type** via `params.tee.type`
2. **The provider schedules the workload** on a TEE-capable node
3. **A Kata Container VM launches inside the hardware TEE** (AMD SEV-SNP or Intel TDX)
4. **Your container runs inside the encrypted VM** and all memory is hardware-encrypted
5. **Bring your own attestation stack or Akash injects its own** alongside your workload
6. **You can verify the TEE** by requesting to the provider a hardware-signed attestation report at any time

Everything inside the VM boundary is encrypted. The provider's OS and administrators cannot access it.

---

## SDL Configuration

Add a `params.tee` block to your service definition. The rest of the SDL remains unchanged.

### Basic Example — AMD SEV-SNP

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

### Basic Example — Intel TDX

The only change is the TEE type:

```yaml
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
        type: tdx
```

### GPU + TEE Example

To combine GPU workloads with Confidential Compute, use a GPU TEE type and add GPU resources:

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
      tee:
        type: tdx-gpu

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

> You can also use `sev-snp-gpu` instead of `tdx-gpu` depending on which TEE hardware the provider offers.

### TEE Type Reference

The `params.tee.type` field accepts the following values:

| Value | Runtime Class | Hardware Required |
|-------|---------------|-------------------|
| `sev-snp` | `kata-qemu-snp` | AMD with SEV-SNP |
| `sev-snp-gpu` | `kata-qemu-nvidia-gpu-snp` | AMD with SEV-SNP + NVIDIA CC GPU |
| `tdx` | `kata-qemu-tdx` | Intel with TDX |
| `tdx-gpu` | `kata-qemu-nvidia-gpu-tdx` | Intel with TDX + NVIDIA CC GPU |

---

## Attestation

Attestation is how you verify that your workload is genuinely running inside a hardware TEE. The attestation report is signed by the CPU hardware itself and the provider cannot forge or tamper with it.

### Overview

The attestation flow has three stages:

1. **Discovery**: Query the provider's directory API to locate the attestation component for your lease
2. **Challenge**: Send a random 64-byte nonce (your challenge) to the provider. The nonce ensures the report is fresh and was generated for your specific request
3. **Verification**: The attestation component returns a hardware-signed report. Verify it against AMD or Intel root-of-trust certificates to confirm the TEE is genuine

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

For programmatic verification, the attestation API has two endpoints.

#### Discovery (Directory)

Returns routing hints to locate the attestation sidecar. This endpoint is unauthenticated.

```
GET /attestation/directory/{dseq}/{gseq}/{oseq}
```

```json
{
  "endpoint": "https://<sidecar-url>/quote",
  "tee_type": "amd-sev-snp",
  "runtime_class": "kata-qemu-snp",
  "protocol_version": "2",
  "expected_launch_measurement": "<hex>",
  "expected_image_digest": "<digest>"
}
```

> **Important:** The directory response is **untrusted**. All values are advisory routing hints only. You must verify claims against the hardware-signed attestation report.

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

The `report` field contains the raw hardware-signed attestation evidence (an SNP report or TDX quote). For GPU TEE types, `gpu_reports` contains a per-device entry for every GPU in the workload, each with its own hardware-signed attestation evidence. Verify GPU reports against NVIDIA's published root certificates.

### TLS Channel Binding

Setting `bind_tls: true` binds the attestation report to the current TLS session. The sidecar computes `SHA-512(tls_public_key || nonce)[:64]` and places the result in the report's `REPORT_DATA` field. This proves the attestation came from the same endpoint you're connected to, preventing relay attacks.

### Security Model

The attestation design enforces these properties:

- **Provider cannot modify evidence** — the nonce and hardware report are passed through verbatim
- **Directory hints are untrusted** — they are routing aids only; always verify against the hardware-signed report
- **Nonce proves freshness** — the hardware includes your nonce in `REPORT_DATA`, proving the report was generated for your request
- **Channel binding is optional but recommended** — for sensitive workloads, use `bind_tls: true` to prevent attestation relay

---

## Limitations and Considerations

- **Provider availability**: Only providers with TEE-capable hardware can accept confidential workloads. Look for the `tee/type` attribute when selecting a provider.
- **Performance**: Memory encryption adds a small overhead (~1-5%). GPU Confidential Computing may add further overhead depending on the workload.
- **Sidecar resources**: The attestation sidecar consumes modest resources (10m CPU, 32-64Mi memory) which are automatically included in resource accounting.
- **Runtime environment**: TEE workloads run inside Kata VMs rather than standard containers. Most workloads are unaffected, but features that depend on direct host kernel access may behave differently.

---

## Related Topics

- [Provider Confidential Compute Setup](/docs/providers/setup-and-installation/kubespray/confidential-compute) — How providers enable TEE support
- [GPU Deployments](/docs/learn/core-concepts/gpu-deployments) — General GPU deployment guide
- [Provider Attributes](/docs/providers/operations/provider-attributes) — How providers advertise TEE capabilities
