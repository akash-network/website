---
aep: 83
title: "Confidential Compute via Kata Containers"
author: Joao Luna (@cloud-j-luna)
status: Draft
type: Standard
category: Core
created: 2026-04-14
requires: 29, 65
roadmap: major
---

## Summary

This AEP defines how tenants request confidential computing workloads on Akash Network and how providers advertise confidential compute capabilities. It introduces minimal SDL changes, leveraging the existing placement attributes mechanism to match tenants with TEE-capable providers that run workloads inside Kata Containers (micro-VMs). It covers both CPU-only and GPU confidential computing, including NVIDIA GPU passthrough to Kata VMs and composite attestation of CPU + GPU TEEs.

## Motivation

[AEP-65](../aep-65) establishes the rationale for Confidential Computing on Akash and recommends Kata Containers (micro-VMs) as the execution model. [AEP-29](../aep-29) covers hardware attestation. What remains undefined is:

1. How tenants express "I need confidential compute" in their SDL.
2. How providers advertise Kata/TEE capability so the marketplace can match bids.
3. How the provider runtime selects Kata Containers for those workloads.
4. How GPU confidential computing (NVIDIA CC-on mode) integrates with the Kata VM model.
5. How composite attestation works when both CPU and GPU TEEs are involved.

This AEP addresses all five, with the vision of **minimal SDL and UX changes.

## Design Principles

- **Minimal SDL surface**: Reuse existing SDL constructs (placement attributes) rather than inventing new top-level sections.
- **Opt-in**: Only workloads that explicitly request confidential compute run in Kata. All other workloads are unaffected.
- **Provider-side transparency**: Providers advertise capability; the runtime class selection (default vs kata) is handled automatically by the provider software.
- **GPU as a first-class concern**: GPU confidential computing is not an afterthought. The spec addresses GPU passthrough, CC-on mode, and composite attestation as core components.

## Specification

### 1. SDL Changes

A tenant requests confidential compute by adding a single attribute to their placement profile:

```yaml
attributes:
  confidential-compute: true
```

This is the **only change** compared to a regular deployment. The attribute acts as a filter: only providers that advertise `confidential-compute: true` will bid on the order. No new SDL keywords, sections, or schema versions are required.

Whether the workload gets CPU-only or CPU+GPU confidential computing is determined by the compute profile: if the profile includes GPU resources, the provider automatically uses a CC-on GPU and the combined Kata runtime class. No separate GPU attribute is needed — a GPU TEE is meaningless without a CPU TEE (the GPU relies on the CPU TEE as its trust anchor), so the two are inseparable.

#### CPU-Only Confidential Compute

```yaml
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
      attributes:
        confidential-compute: true
      signedBy:
        anyOf:
          - akash1<auditor-address>
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

The only difference from the CPU-only case is that the compute profile includes GPU resources. The same `confidential-compute: true` attribute is used.

```yaml
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
      attributes:
        confidential-compute: true
      signedBy:
        anyOf:
          - akash1<auditor-address>
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

Tenants that need a specific CPU TEE technology can add a finer-grained attribute:

```yaml
attributes:
  confidential-compute: true
  confidential-compute-tee: intel-tdx   # or amd-sev-snp
```

Since attestation is vendor-specific (different device nodes, quote formats, and verification flows for TDX vs SEV-SNP), tenants running their own attestation logic will typically need to specify the CPU TEE technology.

### 2. Provider Attributes

Providers that support confidential compute must advertise the following attributes:

| Attribute | Value | When to Advertise |
|---|---|---|
| `confidential-compute` | `true` | Kata Containers runtime installed + TEE-capable CPU detected |
| `confidential-compute-tee` | `intel-tdx` or `amd-sev-snp` | Always (specific CPU TEE technology available) |

These attributes should be set automatically by the provider's inventory service (per [AEP-41](../aep-41)) when it detects the relevant hardware and runtime configuration. The inventory service must verify:

1. Kata Containers runtime is installed and registered as a Kubernetes `RuntimeClass`.
2. CPU TEE is enabled (TDX or SEV-SNP active in BIOS and kernel).
3. For GPU nodes: NVIDIA GPU(s) are in CC-on mode and VFIO passthrough is configured.

GPU confidential capability is not advertised as a separate attribute. Instead, the provider's inventory already advertises GPU models (e.g., `nvidia-h100`). When a tenant's order combines `confidential-compute: true` with a GPU compute profile, the marketplace matches against providers that have both `confidential-compute: true` and the requested GPU model. The provider is responsible for ensuring its advertised GPUs are in CC-on mode when `confidential-compute: true` is set.

### 3. Provider Runtime Selection

When a provider receives a lease for an order with `confidential-compute: true`, the provider software must select the appropriate Kata runtime class based on whether the order includes GPU resources.

The Confidential Containers Operator and NVIDIA GPU Operator provide pre-built runtime classes for TEE combinations:

| RuntimeClass | CPU TEE | GPU | Source | Status |
|---|---|---|---|---|
| `kata-qemu-tdx` | Intel TDX | No | CoCo Operator | Available |
| `kata-qemu-snp` | AMD SEV-SNP | No | CoCo Operator | Available |
| `kata-qemu-nvidia-gpu` | None | Yes | GPU Operator | Available |
| `kata-qemu-nvidia-gpu-snp` | AMD SEV-SNP | Yes | GPU Operator | Available |
| `kata-qemu-nvidia-gpu-tdx` | Intel TDX | Yes | GPU Operator | Not yet shipped (as of GPU Operator v25.3.1) |

Intel TDX + GPU passthrough is technically feasible — the SPDM/bounce buffer mechanism is identical to the SEV-SNP path, and NVIDIA documents TDX GPU confidential computing in their standalone SecureAI deployment guide. However, the NVIDIA GPU Operator does not yet ship the `kata-qemu-nvidia-gpu-tdx` runtime class. Some NVIDIA documentation references it by name, suggesting it is in progress. Until it ships, providers with Intel TDX + GPU hardware would need to configure the runtime class manually.

The provider software selects the runtime class based on the lease:

1. `confidential-compute: true` + no GPU in compute profile: use the CPU-only class (`kata-qemu-tdx` or `kata-qemu-snp`).
2. `confidential-compute: true` + GPU in compute profile: use the combined class (`kata-qemu-nvidia-gpu-snp`, or `kata-qemu-nvidia-gpu-tdx` when available).

The provider injects the `runtimeClassName` into the pod spec:

```yaml
spec:
  runtimeClassName: kata-qemu-nvidia-gpu-snp
  containers:
    - name: inference
      image: <tenant-image>
```

No tenant-side container image changes are required.

### 4. NVIDIA GPU Passthrough to Kata VMs

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

### 5. NVIDIA CC-On Mode

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

Providers advertising `confidential-compute: true` with GPUs must have those GPUs in `on` mode (not `devtools`).

#### CPU-GPU Secure Channel

On Hopper GPUs (H100/H200), the CPU TEE and GPU communicate through a **bounce buffer** in shared system memory:

1. The NVIDIA driver allocates a bounce buffer in shared (unprotected) system memory.
2. Data leaving the CPU TEE (TDX TD or SEV-SNP VM) is encrypted with a session key negotiated via SPDM and placed in the bounce buffer.
3. The GPU's DMA engine reads and decrypts the data into GPU HBM.
4. The reverse path applies for GPU-to-CPU transfers.

This bounce buffer approach has a throughput ceiling of approximately 4 GB/sec due to CPU-side encryption overhead.

Future Blackwell GPUs will eliminate this bottleneck using **TDISP (TEE Device Interface Security Protocol)** and **PCIe IDE (Integrity and Data Encryption)**, which provide hardware-level inline encryption on the PCIe bus. This requires Intel TDX Connect (Xeon 6) or AMD SEV-TIO on the CPU side.

### 6. Composite Attestation (CPU + GPU)

When a workload runs with both CPU and GPU TEEs, the tenant must verify **both** TEEs. This is achieved through composite attestation, where the CPU TEE serves as the trust anchor for the GPU. The GPU is not a standalone TEE — it relies on the CPU TEE to establish the secure channel (SPDM session) and to orchestrate the attestation flow.

#### Attestation Flow

1. From within the Kata VM, the tenant collects CPU TEE evidence (TDX quote via `/dev/tdx-attest` or SEV-SNP report via `/dev/sev-guest`).
2. The NVIDIA in-guest driver collects GPU attestation evidence via the NVTrust SDK.
3. Both pieces of evidence are sent to **Intel Trust Authority** as a single composite attestation request.
4. Intel Trust Authority verifies the CPU quote independently.
5. Intel Trust Authority forwards the GPU evidence to **NVIDIA Remote Attestation Service (NRAS)**.
6. NRAS verifies the GPU evidence against golden measurements from NVIDIA's Reference Integrity Manifest (RIM) service and returns a signed JWT.
7. Intel Trust Authority validates the NRAS JWT and returns a **composite attestation token** containing claims for both TEEs.

The composite token is a JWT with two sub-objects:
- `intel_tee`: TDX attestation claims (or `amd_sev_snp` for AMD).
- `nvidia_gpu`: GPU attestation claims (the verified NRAS result).

#### Platform Support for Composite Attestation

| CPU TEE | GPU TEE | Composite Attestation Status |
|---|---|---|
| Intel TDX | NVIDIA NVTrust | Generally Available (Intel Trust Authority) |
| AMD SEV-SNP | NVIDIA NVTrust | Preview (Intel Trust Authority Pilot environment) |

For AMD SEV-SNP, GPU attestation can be performed independently via NRAS while composite attestation matures to GA.

#### Guest Pre-Start Hook (Local Attestation)

The NVIDIA GPU Operator runs a **local GPU verifier** as a container guest pre-start hook within the Kata initrd. This verifier checks GPU measurements against RIM files fetched from NVIDIA's RIM service before the tenant's containers start.

This is **local attestation only**, it does not perform remote composite attestation and does not communicate with Intel Trust Authority. On failure, containers still start, but the GPU is not set to a "Ready" state. CUDA applications will fail at runtime with a "system not initialized" error. This is fail-open at the container level but fail-closed at the CUDA level.

For **remote composite attestation** (which produces a cryptographically verifiable JWT the tenant can present to relying parties), the tenant must run the Intel Trust Authority client from inside the container using the `trustauthority-client-for-python` or `trustauthority-client-for-go` SDK. The remote flow requires an ITA API key and network connectivity to ITA endpoints. See the attestation flow described above for details.

## Rationale

### Why placement attributes instead of a new SDL field?

The SDL already has a well-understood mechanism for matching tenant requirements to provider capabilities: placement attributes. Adding a dedicated `confidential: true` field to compute profiles or services would require:

- SDL schema changes and version bump
- Client library updates (akashjs, chain SDK)
- Console UI changes to parse the new field

Using placement attributes avoids all of this. It works with the existing SDL parser, marketplace matching logic, and provider bid filtering, with zero code changes to core SDL handling.

### Why a single `confidential-compute` attribute for both CPU and GPU?

A GPU TEE is not a standalone security boundary. The NVIDIA GPU relies on the CPU TEE (TDX TD or SEV-SNP VM) as its trust anchor: the SPDM session is established from the CPU TEE, the attestation flow originates inside the confidential VM, and the bounce buffer encryption keys are negotiated by the CPU-side driver running within the TEE. There is no valid configuration where GPU confidential computing operates without CPU confidential computing.

Separating them into two attributes (`confidential-compute` + `confidential-compute-gpu`) would:
- Allow tenants to express an invalid state (GPU CC without CPU CC).
- Require validation rules to enforce that GPU implies CPU.
- Add marketplace complexity for no functional benefit.

Instead, `confidential-compute: true` means "run in a Kata VM with CPU TEE." When the compute profile also includes GPU resources, the provider automatically selects the combined runtime class and ensures the GPU is in CC-on mode. The GPU path is an implicit consequence of requesting confidential compute with GPU resources, not a separate opt-in.

### Why Kata Containers?

As discussed in [AEP-65](../aep-65), Kata Containers provide the best balance of security, compatibility, and operational simplicity:

- OCI-compatible: tenants keep their existing container workflows.
- CRI-compatible: integrates with Kubernetes via `RuntimeClass` without a separate orchestrator.
- Each container runs in its own micro-VM with dedicated kernel, providing strong isolation.
- TEE protection (TDX/SEV) applies at the VM boundary, securing memory and execution state.
- NVIDIA officially supports GPU passthrough to Kata VMs via the GPU Operator, with dedicated runtime classes for each TEE combination.

## Backward Compatibility

This proposal is fully backward compatible:

- Existing SDLs without the `confidential-compute` attribute continue to work unchanged.
- Existing providers without Kata support simply will not bid on confidential compute orders.
- No SDL version bump is required.
- No on-chain parameter changes are required.

## Security Considerations

- **Attestation is critical**: Deploying with `confidential-compute: true` without performing attestation only guarantees Kata VM isolation, not that the workload is running inside a genuine TEE. Tenants must perform remote composite attestation from within the VM to obtain a verifiable JWT. The GPU Operator's local pre-start hook provides a baseline check (CUDA fails if local attestation fails), but it is not a substitute for remote attestation via Intel Trust Authority.
- **Provider attribute trust**: The `confidential-compute` attribute should be verified by auditors or set automatically by the inventory service ([AEP-41](../aep-41)) rather than self-reported by providers, to prevent false capability claims.
- **CC-on mode enforcement**: Providers must not run GPUs in `devtools` mode for confidential workloads. The `devtools` mode enables performance counters that could leak information via side channels.
- **Bounce buffer overhead**: On Hopper GPUs (H100/H200), the CPU-GPU secure channel uses a software bounce buffer with ~4 GB/sec throughput. Tenants with high-bandwidth CPU-GPU transfer needs should be aware of this limitation. Future Blackwell GPUs with TDISP/PCIe IDE will remove this bottleneck.
- **Device passthrough scope**: TEE device nodes and GPUs are passed through to the Kata VM boundary, not directly to the host. This maintains host isolation while enabling attestation and GPU compute within the enclave.
- **NVLink**: On Hopper GPUs, data transmitted over NVLink between GPUs is not encrypted. Multi-GPU confidential workloads on NVLink-connected systems should consider this. NVLink encryption is introduced with Blackwell.

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
