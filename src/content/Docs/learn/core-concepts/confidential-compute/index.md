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

> **New: private registries, persistent encrypted storage, and sealed secrets.** Confidential workloads can now pull private images, attach encrypted persistent volumes, and receive injected secrets, all through tenant-controlled references that the provider brokers but can never read. See [Confidential Registries, Storage, and Secrets](#confidential-registries-storage-and-secrets).

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

> **Public images need nothing extra.** Any publicly pullable `image` works with no additional configuration. To pull from a **private** registry, provide the credentials as a KBS reference so the provider never sees them, see [Private Registry Credentials](#private-registry-credentials).

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

## Confidential Registries, Storage, and Secrets

Confidential workloads often need something that would normally be visible to whoever runs the machine: credentials to pull a private image, or an encrypted disk that survives restarts. Akash handles these through a **Key Broker Service (KBS)**. The KBS hands a secret to the guest only after the guest proves, through hardware attestation, that it is the exact TEE you deployed. The provider relays the request and never sees what comes back.

In your SDL you only ever write a reference: an opaque `kbs:///repo/type/tag` URI, or a signed `sealed.<...>` token. The real secret lives in the KBS and never touches the SDL, the manifest, or the provider.

### Choosing a Key Broker (`params.kbs`)

Set `params.kbs.mode` on each confidential service to choose whose KBS releases its secrets. This block is required whenever a service uses any of the reference-based features below.

**Provider mode** uses the KBS the provider operates. This is the simplest option and is enough for most workloads.

```yaml
params:
  tee: cpu
  kbs:
    mode: provider
```

**Tenant mode** points the workload at a KBS you run yourself, so your own attestation policy decides what gets released.

```yaml
params:
  tee: cpu
  kbs:
    mode: tenant
    url: https://kbs.example.com:8443
    certificate: |
      -----BEGIN CERTIFICATE-----
      ...your KBS public certificate...
      -----END CERTIFICATE-----
    imageSecurityPolicyURI: kbs:///team/security-policy/sha256-<64-hex-digest>
    agentPolicy: |
      package agent_policy
      default allow = false
```

**Managed Trustee (Overclock Labs).** Tenant mode does not mean you have to operate Trustee yourself. Overclock Labs, the team behind Akash, runs a managed Trustee instance you can point `url` at. You get an attestation authority that is independent of the provider, you keep your own key-release policies, and the provider still never sees your secrets, without the work of standing up and maintaining the service. This is the easiest way to use tenant mode.

### Private Registry Credentials

A confidential service can pull from a private registry, but you hand it the credentials **by reference, never inline**, so the provider never reads them. Put the registry login in your KBS and point `credentials.uri` at it:

```yaml
services:
  app:
    image: registry.example.com/team/private-app:latest
    credentials:
      uri: kbs:///team/registry/app
    params:
      tee: cpu
      kbs:
        mode: provider
```

The URI has to be the canonical `kbs:///repo/type/tag` form. A confidential service rejects inline `username`/`password` credentials, since those would hand the secret straight to the provider. Ordinary (non-TEE) services keep using inline credentials exactly as before.

### Persistent Encrypted Storage

Confidential workloads can attach persistent volumes that only your guest can decrypt. The data survives restarts, and neither the provider nor the host ever holds the key.

Mark the volume `persistent: true`, request a block storage `class` the provider has qualified for confidential storage, and give it a signed key reference:

```yaml
services:
  db:
    image: postgres:16
    params:
      tee: cpu
      kbs:
        mode: provider
      storage:
        data:
          mount: /var/lib/postgresql/data
          keyRef: sealed.<compact-JWS>
profiles:
  compute:
    db:
      resources:
        cpu:
          units: 2
        memory:
          size: 4Gi
        storage:
          - name: data
            size: 10Gi
            attributes:
              class: beta3
              persistent: true
```

The guest encrypts the volume with a key the KBS releases against your `keyRef`. That `keyRef` has to be a tenant-signed sealed reference (`sealed.<header>.<payload>.<signature>`), and it only works on a persistent volume. Not every provider offers this. You need one that advertises a block storage class qualified for confidential storage, see [Limitations and Considerations](#limitations-and-considerations).

### Sealed Environment Variables

The guest unseals any environment variable value that starts with `sealed.` before your container runs. If it cannot, the container fails to start rather than coming up with the raw `sealed.` string still in place, so a broken secret never leaks its encoded form into your app.

```yaml
services:
  app:
    image: myorg/app:latest
    env:
      - API_KEY=sealed.<compact-JWS>
    params:
      tee: cpu
      kbs:
        mode: provider
```

Use sealed environment variables for API keys, database passwords, and other runtime secrets you don't want visible to the provider.

---

## Preparing Images for Confidential Compute

A TEE workload runs inside a Kata VM, and its image is pulled and unpacked **inside the encrypted guest** ("guest pull") rather than on the host. A few image properties that don't matter for a normal deployment become important here. Following these keeps you on the happy path.

### Run as a numeric user, not a named one

The image must run as a **numeric UID/GID**, not a username. Because the image is mounted inside the guest, the host cannot read the image's `/etc/passwd` / `/etc/group` to translate a name into an ID. An image whose config sets, for example, `USER appuser:appgroup` fails at container creation with:

```
failed to create containerd container: mount callback failed on ...: openat etc/passwd: no such file or directory
```

Fix it in the image by using numeric IDs (or root):

```dockerfile
# Instead of: USER appuser:appgroup
USER 1000:1000
```

If you don't control the image, re-publish it with only a numeric-user change — the image contents are unchanged, so this is fast and safe:

```bash
# Find the numeric IDs the named user maps to
docker run --rm <image> id <username>

# Re-tag with a numeric user (config-only change) to a PUBLIC registry
crane mutate <image> --user "1000:1000" -t <public-registry>/<image>:<tag>
```

(Publish to a public registry — private registries are not supported yet, see below.)

### Keep images small and size memory accordingly

The image is decompressed and unpacked **into the guest's memory** (`shared_fs` is disabled, so there is no host-shared filesystem). This has two consequences:

- **The extracted image must fit in the guest.** Request enough `memory` to hold the *extracted* image plus your application's working set, with headroom. A ~10 GB compressed image can expand to 20-30 GB; if it doesn't fit, container creation fails with `Failed to unpack layer to destination`.
- **Very large images can time out.** The image is fetched during container creation inside the guest rather than by the normal host image pull, so very large images may exceed the request timeout and fail with `context deadline exceeded`. You cannot change this from the SDL; providers can raise the timeout, but the reliable fix is a smaller image.

**Prefer smaller images.** For AI inference, a lightweight server that downloads the model at runtime (for example [Ollama](https://ollama.com)) is far easier to run confidentially than a multi-gigabyte all-in-one CUDA image.

### Known-good example — confidential GPU inference with Ollama

This small, root-user, public image serves a Llama model under `cpu-gpu` with none of the pitfalls above:

```yaml
---
version: "2.1"

services:
  ollama:
    image: ollama/ollama:latest
    expose:
      - port: 11434
        as: 11434
        to:
          - global: true
    command:
      - bash
      - "-lc"
    args:
      - |
        /bin/ollama serve &
        until /bin/ollama ps >/dev/null 2>&1; do sleep 1; done
        /bin/ollama pull llama3.2:3b
        wait
    params:
      tee: cpu-gpu

profiles:
  compute:
    ollama:
      resources:
        cpu:
          units: 4
        memory:
          size: 16Gi
        storage:
          size: 20Gi
        gpu:
          units: 1
          attributes:
            vendor:
              nvidia:
  placement:
    dcloud:
      pricing:
        ollama:
          denom: uact
          amount: 100000

deployment:
  ollama:
    dcloud:
      profile: ollama
      count: 1
```

Once the lease is running, test inference against the forwarded port:

```bash
curl http://<lease-host>:<port>/api/generate \
  -d '{"model":"llama3.2:3b","prompt":"Hello from a confidential GPU","stream":false}'
```

Swap `llama3.2:3b` for `llama3.2:1b` for an even lighter demo.

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

- **Private registries require KBS-brokered credentials.** A confidential service can pull private images, but the registry credentials must be supplied as a `kbs:///repo/type/tag` reference under `credentials.uri`, not inline. Inline `username`/`password` credentials and `imagePullSecrets` are rejected for TEE services. See [Confidential Registries, Storage, and Secrets](#confidential-registries-storage-and-secrets).
- **Provider availability**: Only providers with TEE-capable hardware can accept confidential workloads. Look for the `tee/type` attribute when selecting a provider.
- **Performance**: Memory encryption adds a small overhead (~1-5%). GPU Confidential Computing may add further overhead depending on the workload.
- **Sidecar resources**: The attestation sidecar consumes modest resources (10m CPU, 32-64Mi memory) which are automatically included in resource accounting.
- **Runtime environment**: TEE workloads run inside Kata VMs rather than standard containers. Most workloads are unaffected, but features that depend on direct host kernel access may behave differently.
- **Distroless and scratch-based images are not supported.** Kata Containers uses a guest agent inside the VM to set up and manage the container filesystem. Images built `FROM scratch` or from `gcr.io/distroless/...` lack the minimal filesystem structure (e.g. `/dev`, `/proc`, `/sys`) that the guest agent requires to initialize the container. Use a minimal but complete base image such as `alpine` or `ubuntu` instead.
- **Images must run as a numeric user, not a named one.** A named `USER` in the image (e.g. `USER appuser`) fails at container creation (`openat etc/passwd: no such file or directory`) because the host cannot resolve the name against the in-guest filesystem. Use a numeric `UID:GID` (or root). See [Preparing Images for Confidential Compute](#preparing-images-for-confidential-compute).
- **Image size is bounded by guest memory.** The image is unpacked into guest RAM (there is no host-shared filesystem), so large images need a correspondingly large `memory` request and can otherwise fail to unpack (`Failed to unpack layer to destination`) or time out during creation (`context deadline exceeded`). Prefer small images and size `memory` for the *extracted* image plus your working set.
- **Ephemeral `storage` is not a real disk (and not extra RAM).** With `shared_fs` disabled, the container's writable layer lives in the guest's RAM. A `storage` request is neither turned into a disk of that size nor into that much RAM (RAM comes from `memory`); usable writable space is bounded by the VM's memory, and writing past it fails with an out-of-space error. Size `memory` for what your workload writes. For durable data, attach a [persistent encrypted volume](#persistent-encrypted-storage) instead. See [Preparing Images for Confidential Compute](#preparing-images-for-confidential-compute).
- **Persistent confidential volumes need a qualified provider and a slow first mount.** Encrypted persistent storage is only available on providers that advertise a block storage class qualified for confidential use. The volume is read in full on first attach to establish encryption, so a large disk can take several minutes before the container starts (roughly 15+ minutes per TB); later restarts mount quickly.

---

## Related Topics

- [CC Hardware Compatibility](/docs/providers/operations/confidential-compute-hardware) — Which CPUs and GPUs support Confidential Compute
- [Provider Confidential Compute Setup](/docs/providers/setup-and-installation/kubespray/confidential-compute) — How providers enable TEE support
- [GPU Deployments](/docs/learn/core-concepts/gpu-deployments) — General GPU deployment guide
- [Provider Attributes](/docs/providers/operations/provider-attributes) — How providers advertise TEE capabilities
