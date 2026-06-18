---
aep: 83
title: "Confidential Compute via Kata Containers"
author: Joao Luna (@cloud-j-luna)
status: Draft
type: Standard
category: Core
created: 2026-04-14
updated: 2026-06-16
estimated-completion: 2026-07-31
requires: 29, 65
roadmap: major
---

## Summary

This AEP defines how tenants request confidential computing workloads on Akash Network and how providers advertise confidential compute capabilities. Tenants set `params.tee` in their SDL to either `cpu` or `cpu-gpu` to request confidential compute. The provider determines the actual TEE platform (AMD SEV-SNP or Intel TDX) at deployment time based on its hardware. Workloads run inside Kata Containers (micro-VMs) on TEE-capable providers. The spec covers CPU-only and GPU confidential computing, NVIDIA GPU passthrough to Kata VMs, attestation sidecars, and combined CPU+GPU attestation.

## Motivation

[AEP-65](../aep-65) establishes the rationale for Confidential Computing on Akash and recommends Kata Containers (micro-VMs) as the execution model. [AEP-29](../aep-29) covers hardware attestation. What remains undefined is:

1. How tenants express "I need confidential compute" in their SDL.
2. How providers advertise Kata/TEE capability so the marketplace can match bids.
3. How the provider runtime selects Kata Containers for those workloads.
4. How GPU confidential computing (NVIDIA CC-on mode) integrates with the Kata VM model.
5. How attestation evidence is collected and returned to the tenant.

This AEP addresses all five.

## Design Principles

- **Capability-based TEE selection**: Tenants specify what they need (`cpu` or `cpu-gpu`) rather than a specific hardware platform. The provider determines the actual TEE platform (SNP or TDX) at deployment time based on its hardware.
- **Opt-in**: Only workloads that explicitly request confidential compute run in Kata. All other workloads are unaffected.
- **Provider-side transparency**: Providers advertise capability; the runtime class selection and TEE platform detection are handled automatically by the provider software.
- **GPU as a first-class concern**: GPU confidential computing is expressed via the `cpu-gpu` TEE type, which encodes both CPU TEE and GPU CC requirements.
- **Attestation by default**: The provider injects an attestation sidecar into every CC workload.

## Specification

### 1. SDL Changes

A tenant requests confidential compute by setting `tee` in the service `params`:

```yaml
services:
  web:
    image: nginx
    expose:
      - port: 80
        to:
          - global: true
    params:
      tee: cpu
```

The `tee` field is a string that selects the confidential compute capability. The supported values are:

| TEE Type | Description |
|---|---|
| `cpu` | CPU-only confidential compute. The provider selects the appropriate TEE platform (AMD SEV-SNP or Intel TDX) and runtime class. |
| `cpu-gpu` | CPU + GPU confidential compute. Requires GPU resources in the compute profile. The provider uses VFIO GPU passthrough with CC-on mode. |

The provider determines the actual TEE platform and Kubernetes `RuntimeClass` at deployment time:

| SDL `tee` | TEE Platform | RuntimeClass |
|---|---|---|
| `cpu` | AMD SEV-SNP | `kata-qemu-snp` |
| `cpu` | Intel TDX | `kata-qemu-tdx` |
| `cpu-gpu` | AMD SEV-SNP | `kata-qemu-nvidia-gpu-snp` |
| `cpu-gpu` | Intel TDX | `kata-qemu-nvidia-gpu-tdx` |

#### SDL Schema

```yaml
tee:
  type: string
  enum:
    - cpu
    - cpu-gpu
```

The `tee` field lives under `services.<name>.params`, alongside existing params like `storage`.

#### CPU-Only Confidential Compute

```yaml
version: "2.1"
services:
  web:
    image: nginx
    expose:
      - port: 80
        to:
          - global: true
    params:
      tee: cpu

profiles:
  compute:
    web:
      resources:
        cpu:
          units: 2
        memory:
          size: "2Gi"
        storage:
          - size: "10Gi"
  placement:
    confidential:
      pricing:
        web:
          denom: uakt
          amount: 1000

deployment:
  web:
    confidential:
      profile: web
      count: 1
```

#### GPU Confidential Compute

GPU confidential compute uses the `cpu-gpu` TEE type. This requires GPU resources to be defined in the compute profile:

```yaml
version: "2.1"
services:
  inference:
    image: nvidia-app
    expose:
      - port: 8080
        to:
          - global: true
    params:
      tee: cpu-gpu

profiles:
  compute:
    inference:
      resources:
        cpu:
          units: 8
        memory:
          size: "32Gi"
        storage:
          - size: "100Gi"
        gpu:
          units: 1
          attributes:
            vendor:
              nvidia:
                - model: h100
  placement:
    confidential-gpu:
      pricing:
        inference:
          denom: uakt
          amount: 5000

deployment:
  inference:
    confidential-gpu:
      profile: inference
      count: 1
```

#### Validation Rules

1. `tee` must be one of the two allowed values (`cpu`, `cpu-gpu`).
2. The `cpu-gpu` TEE type requires GPU resources in the compute profile. The SDL parser rejects deployments that specify `cpu-gpu` without GPU resources.
3. All services within the same deployment group must use the same TEE type or none at all. Mixed TEE types in a single group are rejected.

#### Placement Attribute Projection

The SDL builder automatically adds the TEE type as a placement requirement attribute:

```
tee/type = <type>
```

The marketplace uses this attribute to match orders with providers that support the requested TEE capability.

### 2. Provider Attributes

Providers that support confidential compute advertise TEE capability as:

| Attribute | Value | When to Advertise |
|---|---|---|
| `tee/type` | `cpu` | CPU TEE available (AMD SEV-SNP or Intel TDX) |
| `tee/type` | `cpu-gpu` | CPU TEE + GPU CC available |

These attributes are set automatically by the provider's inventory service when it detects the right hardware and runtime setup. The inventory service checks that:

1. Kata Containers runtime is installed and registered as a Kubernetes `RuntimeClass`.
2. A CPU TEE is enabled (TDX or SEV-SNP active in BIOS and kernel).
3. For `cpu-gpu`: NVIDIA GPU(s) are in CC-on mode and VFIO passthrough is set up.

The provider detects the TEE platform (SNP or TDX) from Kubernetes node labels at startup:
- `amd.feature.node.kubernetes.io/snp=true` for AMD SEV-SNP
- `intel.feature.node.kubernetes.io/tdx=true` for Intel TDX

### 3. Provider Runtime Selection

When a provider receives a lease with a `tee` parameter, it combines the SDL TEE type with the detected TEE platform to select a Kubernetes `RuntimeClass`:

| SDL `tee` | Detected Platform | RuntimeClass |
|---|---|---|
| `cpu` | SNP | `kata-qemu-snp` |
| `cpu` | TDX | `kata-qemu-tdx` |
| `cpu-gpu` | SNP | `kata-qemu-nvidia-gpu-snp` |
| `cpu-gpu` | TDX | `kata-qemu-nvidia-gpu-tdx` |

The provider injects the `runtimeClassName` into the pod spec:

```yaml
spec:
  runtimeClassName: kata-qemu-snp
  containers:
    - name: web
      image: <tenant-image>
```

For CC workloads, the provider also adds node affinity selectors to ensure scheduling on TEE-capable nodes:

| Node Selector | Applied When |
|---|---|
| `katacontainers.io/kata-runtime: true` | All CC workloads |
| `amd.feature.node.kubernetes.io/snp: true` | SNP platform detected |
| `intel.feature.node.kubernetes.io/tdx: true` | TDX platform detected |
| `nvidia.com/cc.ready.state: true` | `cpu-gpu` workloads |

No tenant-side container image changes are required.

### 4. Attestation Sidecar

The provider adds an attestation sidecar container to every CC workload pod. The sidecar runs inside the Kata micro-VM alongside the tenant's containers and exposes endpoints for collecting hardware attestation evidence.

#### Sidecar Injection

A mutating admission webhook (`attestation-sidecar-injector.akash.network`) watches for pod creation in Akash-managed namespaces. It adds the sidecar when:

1. The pod has a CC runtime class (any `kata-qemu-*` class), AND
2. The pod has the `akash.network=true` label, AND
3. The pod does NOT have the `akash.network/attestation-disabled` annotation.

The sidecar container:

| Property | Value |
|---|---|
| Name | `akash-attestation-sidecar` |
| Port | 8790 (TCP) |
| Privileged | Yes (required for configfs/device access) |
| CPU | 10m request / 100m limit |
| Memory | 32Mi request / 64Mi limit (128Mi for GPU) |

The sidecar's resources come out of the tenant's requested allocation. The provider adjusts the primary container's limits to make room for the sidecar while keeping total pod resources within the lease budget.

#### Sidecar Endpoints

The sidecar exposes three HTTP endpoints on port 8790:

**POST /quote** - Collects hardware-signed attestation evidence.

Request:
```json
{
  "nonce": "<base64-encoded, must decode to exactly 64 bytes>",
  "bind_tls": false
}
```

Response:
```json
{
  "report": "<base64 raw attestation report>",
  "cert_chain": "<base64 certificate chain>",
  "tee_platform": "snp|tdx|snp-gpu|tdx-gpu",
  "auxblob": "<base64, may be empty>",
  "gpu_reports": [
    {"device_index": 0, "report": "<base64>"},
    {"device_index": 1, "report": "<base64>"}
  ],
  "tls_bound": false
}
```

The `report` field contains the raw hardware-signed attestation report:
- SEV-SNP: ~1184 bytes, nonce at offset 0x50 (REPORT_DATA field)
- TDX: 1024 bytes, nonce in report_data field

### 5. Gateway Attestation Endpoints

The provider gateway exposes an endpoint for tenants to interact with the attestation sidecar:

**POST /lease/{dseq}/{gseq}/{oseq}/attestation/quote** (Authenticated)

Forwards the tenant's nonce to the attestation sidecar and returns the hardware-signed evidence unchanged. The provider does not look at or change the payload. Authentication uses the standard Akash lease authentication (mTLS with the lease owner's key).

### 6. NVIDIA GPU Passthrough to Kata VMs

For GPU confidential workloads, the NVIDIA GPU is passed through to the Kata micro-VM via VFIO. This is a provider-side concern managed by the NVIDIA GPU Operator, which provides three components for Kata support:

- **NVIDIA VFIO Manager**: Loads the `vfio-pci` driver and binds it to GPUs on the node.
- **NVIDIA Sandbox Device Plugin**: Discovers passthrough-capable GPUs and advertises them to kubelet.
- **NVIDIA Kata Manager**: Provides optimized kernel images and initrd for the guest VM.

GPU passthrough is cold-plug only. The GPU is attached at VM launch time during pod sandbox creation, before the container starts. Inside the guest VM, the NVIDIA kernel modules are loaded and the GPU is initialized on the virtual PCI bus.

#### Multi-GPU Passthrough

Kata Containers supports passing multiple GPUs to a single micro-VM via VFIO. Each GPU is attached to its own virtual PCIe root port using the `cold_plug_vfio = root-port` configuration. There is no Kata-side limit on the number of VFIO devices per VM.

Note: the NVIDIA GPU Operator's Sandbox Device Plugin currently limits allocation to a single GPU per pod for standard PCIe-attached GPUs. On NVSwitch-based HGX systems (Hopper SXM, Blackwell), the GPU Operator supports multi-GPU passthrough (all 8 GPUs + 4 NVSwitches passed as a unit). Akash providers may need to configure GPU allocation outside the GPU Operator's device plugin to support multi-GPU pods on non-HGX systems.

#### Limitations

- vGPU (virtual GPU) is not supported. Only full physical GPU passthrough.
- The host must have IOMMU enabled and PCI Access Control Services (ACS) configured.

### 7. NVIDIA CC-On Mode

For GPU memory and computation to be protected, the NVIDIA GPU must be running in **Confidential Computing mode (CC-on)**. This is a provider-side hardware configuration.

#### What CC-On Mode Protects

- **Data in transit (PCIe bus)**: All data crossing the PCIe bus between CPU and GPU is encrypted using AES-GCM-256. This includes CUDA kernels, command buffers, synchronization primitives, and all DMA transfers.
- **GPU execution state**: Performance counters are disabled to prevent side-channel attacks. All internal firewalls are active.
- **GPU memory (HBM)**: On-package HBM is considered physically secure and is not encrypted, allowing full-speed computation.

#### CC-On Mode Configuration

CC-on mode is stored in an EEPROM on the GPU and persists across reboots. Providers enable it using NVIDIA's `gpu-admin-tools`:

```bash
sudo python3 nvidia_gpu_tools.py --devices gpus --set-cc-mode=on --reset-after-cc-mode-switch
```

A GPU reset (PF-FLR) is required after changing the mode. The mode can be queried with `--query-cc-mode`.

NVIDIA defines three modes:

| Mode | Description |
|---|---|
| `off` | Default. No CC features. |
| `on` | Full CC: bus encryption active, performance counters disabled, all firewalls active. |
| `devtools` | Encryption enabled but performance counters accessible for profiling/debugging. |

Providers advertising TEE capability with GPUs must have those GPUs in `on` mode (not `devtools`).

#### CPU-GPU Secure Channel

On Hopper GPUs (H100/H200), the CPU TEE and GPU communicate through a **bounce buffer** in shared system memory:

1. The NVIDIA driver allocates a bounce buffer in shared (unprotected) system memory.
2. Data leaving the CPU TEE (TDX TD or SEV-SNP VM) is encrypted with a session key negotiated via SPDM and placed in the bounce buffer.
3. The GPU's DMA engine reads and decrypts the data into GPU HBM.
4. The reverse path applies for GPU-to-CPU transfers.

This bounce buffer approach has a throughput ceiling of approximately 4 GB/sec due to CPU-side encryption overhead.

Future Blackwell GPUs will eliminate this bottleneck using **TDISP (TEE Device Interface Security Protocol)** and **PCIe IDE (Integrity and Data Encryption)**, which provide hardware-level inline encryption on the PCIe bus. This requires Intel TDX Connect (Xeon 6) or AMD SEV-TIO on the CPU side.

### 8. Composite Attestation (CPU + GPU)

When a workload runs with the `cpu-gpu` TEE type, the attestation sidecar collects **both** CPU and GPU attestation evidence in a single `/quote` response.

The CPU TEE acts as the trust anchor for the GPU. The GPU is not a standalone TEE, it depends on the CPU TEE to set up the secure channel (SPDM session) and to drive the attestation flow.

#### Attestation Evidence Collection

The sidecar's composite provider:
1. Collects the CPU attestation report (SNP or TDX) with the tenant's nonce in the report_data field.
2. Collects per-GPU attestation reports through the NVIDIA driver inside the Kata VM.
3. Returns everything in a single `QuoteResponse`:
   - `report`: CPU TEE attestation report
   - `gpu_reports[]`: per-GPU attestation evidence with device indices

#### Verification

The tenant verifies the composite evidence:

1. **CPU verification**: Check the SNP/TDX report against expected measurements (launch measurement, firmware version, etc.) and confirm the nonce in report_data matches.
2. **GPU verification**: Check each GPU report against NVIDIA's Reference Integrity Manifest (RIM) service. GPU evidence can be verified through:
   - **NVIDIA Remote Attestation Service (NRAS)**: Send GPU evidence for verification and get back a signed JWT.
   - **Intel Trust Authority**: For combined CPU + GPU verification in a single request (Intel TDX + NVIDIA GPU).
   - **Local verification**: Using NVIDIA's NVTrust SDK with RIM files from NVIDIA's RIM service.

#### Guest Pre-Start Hook (Local Attestation)

The NVIDIA GPU Operator runs a **local GPU verifier** as a container guest pre-start hook within the Kata initrd. This verifier checks GPU measurements against RIM files fetched from NVIDIA's RIM service before the tenant's containers start.

This is **local attestation only**, it does not talk to any external verification services. If local attestation fails, the containers still start, but the GPU is not marked as "Ready". CUDA applications will fail at runtime with a "system not initialized" error. In other words, it's fail-open at the container level but fail-closed at the CUDA level.

For **remote attestation** that produces a cryptographically verifiable JWT, the tenant should use the attestation sidecar endpoints or run verification from inside the container using the appropriate SDK (Intel Trust Authority client, NVIDIA NVTrust SDK, or AMD SEV-SNP verification tools).

## Rationale

### Why `params.tee` instead of a placement attribute?

The initial design used a single `confidential-compute: true` placement attribute. During implementation this was changed to a service-level `params.tee` field for several reasons:

1. **GPU CC is a distinct requirement**: The `cpu-gpu` type needs a different runtime class, different node selectors, and produces extra attestation evidence (GPU reports). Encoding this in the TEE type makes the requirement explicit rather than guessing it from the compute profile.
2. **Proto compatibility**: Putting TEE configuration in `ServiceParams` alongside storage and credentials follows the existing pattern for service-level config. It maps cleanly to protobuf (`TEEParams` message in `ServiceParams`).

The TEE type is still added as a placement attribute (`tee/type`) for marketplace matching, so providers only bid on orders they can actually serve.

### Why capability-based types (`cpu`, `cpu-gpu`) instead of platform-specific types?

An earlier design used platform-specific types (`sev-snp`, `tdx`, `sev-snp-gpu`, `tdx-gpu`) that required tenants to choose a specific TEE platform upfront. This was changed to capability-based types for several reasons:

1. **Tenants care about capability, not platform**: A tenant wants confidential compute, not a specific CPU vendor's TEE. Whether the workload runs on AMD SEV-SNP or Intel TDX is a provider-side concern.
2. **Broader marketplace matching**: With platform-specific types, a tenant requesting `sev-snp` could not be matched with a TDX provider, even though both offer equivalent confidentiality guarantees. Capability-based types let the marketplace match on what matters.
3. **Simpler SDL**: `tee: cpu` is simpler than `tee: { type: sev-snp }`. The SDL went from a nested object to a plain string.
4. **Attestation handles platform specifics**: The actual TEE platform is reported in the attestation response (`tee_platform` field), so the tenant learns the platform when they verify the attestation evidence.

The `cpu-gpu` type still makes GPU CC explicit:

- `cpu-gpu` means: CPU TEE VM + VFIO GPU passthrough + CC-on mode + composite attestation.
- `cpu` with a GPU in the compute profile means: CPU TEE VM + standard GPU (no CC guarantees on the GPU).

### Why Kata Containers?

As discussed in [AEP-65](../aep-65), Kata Containers provide the best balance of security, compatibility, and operational simplicity:

- OCI-compatible: tenants keep their existing container workflows.
- CRI-compatible: integrates with Kubernetes via `RuntimeClass` without a separate orchestrator.
- Each container runs in its own micro-VM with dedicated kernel, providing strong isolation.
- TEE protection (TDX/SEV) applies at the VM boundary, securing memory and execution state.
- NVIDIA officially supports GPU passthrough to Kata VMs via the GPU Operator, with dedicated runtime classes for each TEE combination.

## Backward Compatibility

This proposal is backward compatible:

- Existing SDLs without `params.tee` continue to work unchanged.
- Existing providers without Kata support simply will not bid on TEE orders.
- The `tee` field in `ServiceParams` is optional and nullable in protobuf.
- No on-chain parameter changes are required.

## Security Considerations

- **Attestation by default**: The provider injects an attestation sidecar into every CC workload. This lowers the barrier to performing attestation, but tenants must still actively verify the returned evidence. The sidecar is not a security guarantee, it is a tool.
- **TLS channel binding**: The sidecar's TLS binding prevents man-in-the-middle attacks from the host. Tenants should use `bind_tls: true` in production to make sure the TLS endpoint they're talking to is inside the attested TEE.
- **Bounce buffer overhead**: On Hopper GPUs (H100/H200), the CPU-GPU secure channel uses a software bounce buffer capped at about 4 GB/sec. Tenants with heavy CPU-GPU data transfer should be aware of this. Future Blackwell GPUs with TDISP/PCIe IDE will remove this bottleneck.
- **Device passthrough scope**: TEE device nodes and GPUs are passed through to the Kata VM, not exposed to the host. This keeps host isolation intact while enabling attestation and GPU compute inside the enclave.
- **NVLink**: On Hopper GPUs, data sent over NVLink between GPUs is not encrypted. Multi-GPU confidential workloads on NVLink-connected systems should keep this in mind. NVLink encryption is introduced with Blackwell.
- **Sidecar privileges**: The attestation sidecar runs as privileged (root) to access TEE device nodes and configfs. This is inside the Kata VM, not on the host, so the impact is limited to the tenant's own enclave.

---

## Upstream Tracking Notes

The following upstream issues and PRs are relevant to the implementation of this AEP and should be monitored:

### Intel TDX + GPU Runtime Class (`kata-qemu-nvidia-gpu-tdx`)

The Kata Containers runtime has experimental support for TDX+GPU, but the NVIDIA GPU Operator does not yet ship the runtime class. The active blocker is CDI spec generation for TDX's iommufd device paths.

| Item | Status | Link |
|---|---|---|
| Kata PR #10867: GPU QEMU SNP+TDX experimental updates | Merged (Feb 2025) | https://github.com/kata-containers/kata-containers/pull/10867 |
| Kata PR #10868: QEMU TDX experimental workflow | Merged (Feb 2025) | https://github.com/kata-containers/kata-containers/pull/10868 |
| Kata PR #11568: Add proper TDX config path for GPU | Merged (Jul 2025) | https://github.com/kata-containers/kata-containers/pull/11568 |
| Kata Issue #11721: TDX VM + GPU VFIO_MAP_DMA failure | Closed (redirected to k8s-kata-manager) | https://github.com/kata-containers/kata-containers/issues/11721 |
| **k8s-kata-manager Issue #133: CDI spec for TDX+GPU (blocker)** | **Open** | https://github.com/NVIDIA/k8s-kata-manager/issues/133 |

### Confidential Containers + GPU Roadmap

| Item | Status | Link |
|---|---|---|
| CoCo Issue #278: Road to Confidential Containers with GPUs | Open (umbrella tracker) | https://github.com/confidential-containers/confidential-containers/issues/278 |
