---
categories: ["Providers"]
tags: ["Confidential Compute", "TEE", "Hardware", "Compatibility"]
weight: 8
title: "Confidential Compute Hardware Compatibility"
linkTitle: "CC Hardware Compatibility"
description: "Supported CPUs and GPUs for Trusted Execution Environment workloads on Akash"
---

> **Experimental feature.** Confidential Compute (TEE) is experimental and under active development. Its SDL syntax, attestation API, and runtime behavior may change without notice. We encourage you to try it and share feedback, but plan for breaking changes.

Supported hardware for Akash Confidential Compute. Use this page to verify compatibility or plan hardware purchases.

## AMD CPUs (SEV-SNP)

SEV-SNP requires 3rd Gen AMD EPYC (Milan) or later.

| Generation | Codename | Model Series | Notes |
|------------|----------|-------------|-------|
| 3rd Gen | Milan | EPYC 7003 | First generation with SEV-SNP |
| 4th Gen | Genoa | EPYC 9004 | Zen 4 |
| 4th Gen | Bergamo | EPYC 97x4 | Cloud-optimized Zen 4c variant |
| 4th Gen | Siena | EPYC 82x4 | Edge/telco-optimized variant |
| 5th Gen | Turin | EPYC 9005 | Zen 5 |

Host kernel: Linux 5.19+. IOMMU must be enabled.

## Intel CPUs (TDX)

TDX requires 4th Gen Intel Xeon Scalable (Sapphire Rapids) or later. Not all SKUs in a generation have TDX, so check Intel ARK for your specific model.

| Generation | Codename | Model Series | TDX Version |
|------------|----------|-------------|-------------|
| 4th Gen | Sapphire Rapids | Xeon 8400+/6400+ | 1.0 |
| 5th Gen | Emerald Rapids | Xeon 8500+/6500+ | 1.0 |
| 6th Gen | Granite Rapids | Xeon 6900P | 1.5 |
| 6th Gen | Sierra Forest | Xeon 6700E/6900E | 1.5 |

Host kernel: Linux 6.2+. TME must be enabled.

## NVIDIA GPUs (Confidential Computing)

GPU CC requires a supported GPU **and** a CC-capable CPU (SEV-SNP or TDX). Driver 535.86 or later required.

| GPU | Architecture | VRAM | Form Factors |
|-----|-------------|------|-------------|
| H100 | Hopper | 80 GB | SXM, PCIe |
| H200 | Hopper | 141 GB | SXM |
| B100 | Blackwell | 192 GB | SXM |
| B200 | Blackwell | 192 GB | SXM |
| GB200 | Blackwell | 384 GB | NVL |

> Some early H100 boards shipped with vBIOS that does not support CC. Check with your vendor for a CC-enabled vBIOS update if needed.

## Compatibility Matrix

| CPU | GPU | TEE Capability (SDL) | Platform | Runtime Class |
|-----|-----|----------------------|----------|---------------|
| AMD EPYC (Milan+) | None | `cpu` | `snp` | `kata-qemu-snp` |
| AMD EPYC (Milan+) | Hopper/Blackwell | `cpu-gpu` | `snp` | `kata-qemu-nvidia-gpu-snp` |
| Intel Xeon (Sapphire Rapids+) | None | `cpu` | `tdx` | `kata-qemu-tdx` |
| Intel Xeon (Sapphire Rapids+) | Hopper/Blackwell | `cpu-gpu` | `tdx` | `kata-qemu-nvidia-gpu-tdx` |

The TEE *capability* is what tenants set in SDL. The *platform* is detected by the provider from Kubernetes node labels (`intel.feature.node.kubernetes.io/tdx` or `amd.feature.node.kubernetes.io/snp`).

## Related Topics

- [Confidential Compute Setup](/docs/providers/setup-and-installation/kubespray/confidential-compute) — Provider TEE configuration
- [Confidential Compute Overview](/docs/learn/core-concepts/confidential-compute) — Tenant-facing guide
- [Provider Attributes](/docs/providers/operations/provider-attributes) — Advertise TEE capabilities
