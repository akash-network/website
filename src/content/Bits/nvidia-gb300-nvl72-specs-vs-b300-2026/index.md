---
title: "What Is the NVIDIA GB300 NVL72? Specs and GB300 vs B300 (2026)"
pubDate: 2026-11-04
lastUpdated: 2026-11-04
author: "Sandeep Narahari, Contributor"
description: "NVIDIA GB300 NVL72 specs: 72 Blackwell Ultra GPUs, 36 Grace CPUs, 20TB HBM3e and 130 TB/s NVLink per rack, plus how GB300 differs from the B300 and GB200."
tags: ["Comparisons", "Guides"]
bannerImage: ./banner.webp
draft: false
faqAccordion: true
---

*By Sandeep Narahari, Contributor. Last updated: November 4, 2026.*

The NVIDIA GB300 NVL72 is a liquid-cooled rack that links 72 Blackwell Ultra GPUs and 36 Grace CPUs into one system, with 20TB of HBM3e memory and 130 TB/s of NVLink bandwidth. The [B300](/pricing/gpus/b300/) is the same GPU generation, usually sold in 8-GPU servers.

## TL;DR

- **What it is:** NVIDIA's liquid-cooled, rack-scale Blackwell Ultra system: 72 GPUs and 36 Grace CPUs on one 130 TB/s NVLink domain.
- **GB300 vs B300:** same GPU generation and 288GB of HBM3e per GPU. B300 usually means the 8-GPU HGX server; GB300 NVL72 is the 72-GPU rack. The real difference is NVLink scale: 8 vs 72 GPUs.
- **Specs:** 20TB HBM3e, 17TB CPU memory, 1,080 PFLOPS dense FP4 per rack.
- **GB300 vs GB200:** 20TB vs 13.4TB of GPU memory and 1,080 vs 720 PFLOPS dense FP4, with the same 130 TB/s NVLink.

## What's inside an NVIDIA GB300 NVL72 rack?

An NVIDIA GB300 NVL72 rack holds 72 Blackwell Ultra GPUs and 36 Arm-based Grace CPUs, [according to NVIDIA](https://www.nvidia.com/en-us/data-center/gb300-nvl72/). NVLink, NVIDIA's direct GPU-to-GPU link, ties all 72 together so software can treat them as one huge accelerator. Each GPU carries HBM3e, the high-bandwidth memory stacked right beside the chip.

The name decodes simply: "G" for Grace, "B300" for Blackwell Ultra, "NVL72" for the 72-GPU NVLink domain. NVIDIA rates Blackwell Ultra at 1.5x the dense FP4 compute (FP4 is the 4-bit number format used for fast AI math) and 2x the attention performance of the original Blackwell.

Strictly, there's no standalone "GB300 GPU." GB300 names the Grace plus Blackwell Ultra platform, with one Grace CPU for every two GPUs. So anyone searching for the NVIDIA GB300 GPU is really after the Blackwell Ultra chip, the same one sold as the B300.

## GB300 vs B300: what's actually different?

Whether you ask GB300 vs B300 or B300 vs GB300, the answer is the same: at the chip level, not much. Both use NVIDIA's Blackwell Ultra GPU with 288GB of HBM3e. The difference is the system around it.

An HGX B300 server puts 8 GPUs on one board. A GB300 NVL72 puts 72 in a rack, adds Grace CPUs, and stretches NVLink across all of them. Think H100 vs DGX H100: the part versus the machine.

| Spec (per system) | HGX B300 (8-GPU server) | GB300 NVL72 (rack) |
|---|---|---|
| GPUs | 8 Blackwell Ultra | 72 Blackwell Ultra |
| Grace CPUs | None | 36 |
| Total GPU memory (TB) | 2.1 | 20 |
| NVLink per GPU (TB/s) | 1.8 | 1.8 |
| Total NVLink bandwidth (TB/s) | 14.4 | 130 |
| Dense FP4 (PFLOPS) | 108 | 1,080 |
| Dense FP4 per GPU (PFLOPS) | 13.5 | 15 |
| Cooling | Depends on server build | Liquid only |

*Sources: [NVIDIA HGX specs](https://www.nvidia.com/en-us/data-center/hgx/), [NVIDIA GB300 NVL72 specs](https://www.nvidia.com/en-us/data-center/gb300-nvl72/). Per-GPU FP4 is the system figure divided by GPU count.*

The takeaway is the NVLink domain. In B300 servers, GPU 1 reaches GPU 9 over the network; in a GB300 rack, all 72 share NVLink. NVIDIA also rates each rack GPU slightly higher (15 vs 13.5 PFLOPS dense FP4), so same generation, not identical configuration.

## What are the NVIDIA GB300 specs?

The NVIDIA GB300 NVL72 has 72 GPUs, 36 CPUs, 20TB of HBM3e, and 130 TB/s of NVLink per rack, with each of the GB300 GPUs carrying up to 288GB. Full sheet from [NVIDIA's GB300 NVL72 page](https://www.nvidia.com/en-us/data-center/gb300-nvl72/):

| Spec | GB300 NVL72 |
|---|---|
| Configuration | 72 Blackwell Ultra GPUs, 36 Grace CPUs |
| Memory per GPU | Up to 288GB HBM3e |
| Total GPU memory / bandwidth | 20TB HBM3e / up to 576 TB/s |
| CPU memory / bandwidth | 17TB LPDDR5X / 14 TB/s |
| Total fast memory | 37TB |
| NVLink bandwidth | 130 TB/s (fifth generation) |
| CPU cores | 2,592 Arm Neoverse V2 |
| FP4 Tensor (PFLOPS) | 1,440 sparse / 1,080 dense |
| FP8/FP6 Tensor (PFLOPS) | 720 (sparse) |
| Networking | 800 Gb/s per GPU via ConnectX-8 SuperNIC |
| Cooling | Fully liquid-cooled |

One note on GB300 memory: 72 x 288GB is about 20.7TB, but NVIDIA lists the rack at 20TB, so that's the official number. The 37TB "fast memory" figure adds the 17TB of Grace CPU memory.

## How does the GB300 NVL72 compare to the GB200 NVL72?

The GB300 NVL72 keeps the GB200's rack layout and NVLink fabric but swaps in Blackwell Ultra GPUs, which adds roughly 50% more GPU memory and dense FP4 compute per rack.

| Spec (per rack) | GB200 NVL72 | GB300 NVL72 |
|---|---|---|
| GPU architecture | Blackwell | Blackwell Ultra |
| GPUs / Grace CPUs | 72 / 36 | 72 / 36 |
| GPU memory (TB HBM3e) | 13.4 | 20 |
| Memory bandwidth (TB/s) | 576 | Up to 576 |
| Dense FP4 (PFLOPS) | 720 | 1,080 |
| NVLink bandwidth (TB/s) | 130 | 130 |
| CPU memory (TB LPDDR5X) | 17 | 17 |

*Sources: [NVIDIA GB200 NVL72 specs](https://www.nvidia.com/en-us/data-center/gb200-nvl72/), [NVIDIA GB300 NVL72 specs](https://www.nvidia.com/en-us/data-center/gb300-nvl72/).*

The upgrade is capacity, not interconnect. Memory bandwidth and NVLink stay flat, so gains show up where models or their KV caches (the memory holding a conversation's context) ran out of room, like long-context reasoning and large mixture-of-experts (MoE) serving.

## When do you need a GB300 rack instead of B300 servers?

You need a GB300 NVL72 when your workload sends constant all-to-all traffic across dozens of GPUs, such as frontier-scale pretraining or very wide expert-parallel MoE serving. For most other work, 8-GPU B300 nodes do the job.

The deciding number is bandwidth between GPUs. Inside a GB300 rack, every GPU reaches the other 71 at 1.8 TB/s over NVLink. Between B300 servers, traffic runs over the network at up to 800 Gb/s per GPU, about 100 GB/s, far slower than NVLink.

An 8x B300 node still holds about 2.1TB of GPU memory, enough to serve trillion-parameter MoE models in 4-bit precision. Our [B300 288GB workload guide](/the-bid/b300-288gb-vram-ai-workloads-2026/) covers which models fit.

On Akash, teams can [deploy the NVIDIA B300 on demand](/pricing/gpus/b300/), or run dedicated multi-node B300 clusters on bare metal with SLA terms through [Akash Enterprise](/use-cases/enterprise/). For how the B300 stacks up against older GPUs, see our [B300 vs B200 vs H200 comparison](/the-bid/nvidia-b300-vs-b200-vs-h200-best-gpu-for-self-hosting-ai/).

## FAQ

**Is the GB300 the same GPU as the B300?** Mostly. GB300 NVL72 racks and B300 servers both use NVIDIA's Blackwell Ultra GPU with 288GB of HBM3e. B300 usually means the 8-GPU HGX or DGX server, while GB300 NVL72 is the 72-GPU rack with Grace CPUs. NVIDIA rates rack GPUs slightly higher on dense FP4.

**How much memory does the GB300 NVL72 have?** The GB300 NVL72 has 20TB of HBM3e GPU memory across 72 GPUs, up to 288GB per GPU, with up to 576 TB/s of total bandwidth. Add the 17TB of LPDDR5X on the Grace CPUs and total fast memory reaches 37TB per rack, per NVIDIA's specs.

**What's the difference between GB300 and GB200?** The GB300 NVL72 uses Blackwell Ultra GPUs; the GB200 NVL72 uses the original Blackwell. GB300 raises rack GPU memory from 13.4TB to 20TB and dense FP4 compute from 720 to 1,080 PFLOPS. Both racks hold 72 GPUs and 36 Grace CPUs and share the same 130 TB/s NVLink bandwidth.

**How many GPUs are in a GB300 NVL72?** A GB300 NVL72 contains 72 NVIDIA Blackwell Ultra GPUs and 36 NVIDIA Grace CPUs in a single liquid-cooled rack. All 72 GPUs sit in one NVLink domain, which is where the "NVL72" in the name comes from. For comparison, an HGX B300 server holds 8 of the same generation of GPU.

**What's the NVLink bandwidth in a GB300 NVL72?** The GB300 NVL72 has 130 TB/s of total NVLink bandwidth across its 72-GPU domain, using fifth-generation NVLink at 1.8 TB/s per GPU. An 8-GPU HGX B300 server has the same 1.8 TB/s per GPU but 14.4 TB/s total, because only 8 GPUs share the NVLink fabric.

**Does the GB300 NVL72 need liquid cooling?** Yes. NVIDIA describes the GB300 NVL72 as a fully liquid-cooled, rack-scale design, so it needs a data center with liquid cooling infrastructure. That's a major difference from 8-GPU B300 servers, where cooling depends on the server build, and one reason most teams run Blackwell Ultra in smaller nodes.

**What CPU does the GB300 NVL72 use?** The GB300 NVL72 uses 36 NVIDIA Grace CPUs, one for every two GPUs, built on Arm Neoverse V2 cores for 2,592 cores per rack. The Grace CPUs carry 17TB of LPDDR5X memory at 14 TB/s, which NVIDIA counts toward the rack's 37TB of total fast memory.
