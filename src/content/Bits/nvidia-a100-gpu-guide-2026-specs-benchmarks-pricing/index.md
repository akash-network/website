---
title: "NVIDIA A100 GPU Guide 2026: Specs, Benchmarks & Pricing"
pubDate: 2026-08-16
lastUpdated: 2026-08-16
author: "Sandeep Narahari, Contributor"
description: "NVIDIA A100 GPU guide: full specs, Ampere architecture, FP16/TF32 benchmarks, and 2026 pricing on Akash, plus buying and workload guidance."
tags: ["Guides"]
bannerImage: ./banner.webp
draft: false
faqAccordion: true
---

*Last updated: August 2026*

The NVIDIA A100 is a 2020 data-center GPU built on the Ampere architecture, with 6,912 CUDA cores, 432 third-generation Tensor cores, and 40GB or 80GB of high-bandwidth memory. In 2026 it remains a mainstream choice for AI inference, fine-tuning, and mid-scale training. On the [Akash marketplace](/pricing/gpus/), checked August 16, 2026, an 80GB A100 starts at \$1.07/GPU-hr, averages \$1.54/GPU-hr, with providers' top asking rate at \$1.83/GPU-hr.

**TL;DR**

- **What it is:** NVIDIA's Ampere-generation data-center GPU (GA100), launched 2020, still in heavy use in 2026.
- **Headline specs:** 6,912 CUDA cores, 432 Tensor cores, 40GB HBM2 or 80GB HBM2e, up to 2,039 GB/s bandwidth, 312 TFLOPS dense FP16.
- **Variants:** 40GB and 80GB, in PCIe or SXM form factors, plus the 8-GPU DGX A100 server.
- **Where it sits:** two generations behind NVIDIA's current Blackwell chips (B300/B200), but capable for most non-frontier AI work. The H100 delivers roughly 3 to 4 times its transformer throughput.
- **Cost:** on [Akash](/pricing/gpus/), checked August 16, 2026, an 80GB A100 runs \$1.07 to \$1.83/GPU-hr, averaging \$1.54/GPU-hr. See the FAQ and the [pricing page](/pricing/gpus/) for current rates.

## What is the NVIDIA A100?

The NVIDIA A100 is a data-center GPU designed for AI training, inference, and high-performance computing (HPC). It launched in May 2020 as the first product built on NVIDIA's Ampere architecture, and an 80GB version followed in November 2020. It replaced the V100 (Volta) as NVIDIA's flagship accelerator and was itself succeeded by the H100 (Hopper) in 2022.

The A100 introduced third-generation Tensor cores and the TF32 precision format, which sped up AI math without code changes, and it was the first NVIDIA GPU to support Multi-Instance GPU (MIG), which splits one physical card into isolated slices. In 2026 the A100 is no longer NVIDIA's fastest chip, but its mature software stack and wide availability keep it in active service for teams that do not need frontier-scale performance.

## What are the full NVIDIA A100 specifications?

The A100 pairs 6,912 CUDA cores and 432 Tensor cores with either 40GB or 80GB of high-bandwidth memory. The two memory sizes share the same compute silicon; they differ in memory capacity, bandwidth, and power. Specs below are from NVIDIA's A100 datasheet.

| Specification | A100 40GB | A100 80GB |
|---|---|---|
| Architecture | NVIDIA Ampere (GA100) | NVIDIA Ampere (GA100) |
| Process node | TSMC 7nm | TSMC 7nm |
| Transistors | 54.2 billion | 54.2 billion |
| Die size | 826 mm² | 826 mm² |
| CUDA cores | 6,912 | 6,912 |
| Tensor cores | 432 (3rd gen) | 432 (3rd gen) |
| Streaming multiprocessors | 108 | 108 |
| GPU memory | 40 GB HBM2 | 80 GB HBM2e |
| Memory bandwidth | 1,555 GB/s | 1,935 GB/s (PCIe), 2,039 GB/s (SXM) |
| NVLink bandwidth | 600 GB/s | 600 GB/s |
| Max power (TDP) | 250W (PCIe), 400W (SXM) | 300W (PCIe), 400 to 500W (SXM) |
| MIG instances | up to 7 | up to 7 |
| Interface | PCIe Gen4 / SXM4 | PCIe Gen4 / SXM4 |
| Launched | 2020 | November 2020 |

### A100 compute throughput by precision

Different workloads use different numeric precisions. The A100 supports FP64 down to INT8, but it does not support FP8, the 8-bit format introduced with the later H100. Structural sparsity is a hardware feature that doubles throughput when a model's weights are pruned to a supported pattern.

| Precision | Dense throughput | With structural sparsity |
|---|---|---|
| FP64 | 9.7 TFLOPS | N/A |
| FP64 Tensor Core | 19.5 TFLOPS | N/A |
| FP32 | 19.5 TFLOPS | N/A |
| TF32 Tensor Core | 156 TFLOPS | 312 TFLOPS |
| BF16 / FP16 Tensor Core | 312 TFLOPS | 624 TFLOPS |
| INT8 Tensor Core | 624 TOPS | 1,248 TOPS |
| FP8 | not supported | not supported |

The takeaway: the A100's headline AI figure is 312 TFLOPS of dense FP16 Tensor performance (624 with sparsity). The lack of FP8 is the main compute gap versus newer chips, and it matters most for large-model inference.

## A100 variants: which one to pick

The A100 comes in 40GB and 80GB memory sizes, in PCIe or SXM form factors, plus the 8-GPU DGX A100 server. In short: choose 80GB unless you are sure your model fits in 40GB, and pick SXM over PCIe only when you need many GPUs working as one.

| Choice | Pick this when... | Trade-off |
|---|---|---|
| 80GB over 40GB | your model or batch size needs more than 40GB, or you want headroom | small premium to rent; 40GB is also increasingly hard to find on marketplaces |
| 40GB over 80GB | your workload fits comfortably under 40GB and you want to save on cost | 1,555 GB/s bandwidth vs. 1,935 to 2,039 GB/s on the 80GB card |
| SXM over PCIe | you're running multiple GPUs that need to act as one, via NVLink | needs an HGX baseboard (as in DGX A100); typically SXM-only in the 8-GPU DGX A100 server |
| PCIe over SXM | single-GPU or a handful of GPUs without full NVLink mesh needs | lower TDP (250 to 300W) but capped at Gen4 PCIe for host connectivity |

Both memory sizes and both form factors share the same 6,912 CUDA cores and 432 Tensor cores, so the choice comes down to memory headroom and whether you need NVLink-connected multi-GPU scaling, not raw compute.

## How does the A100 perform, and where does it sit in 2026?

The A100 is roughly a third to a quarter as fast as the current generation on transformer workloads, but it remains capable for most AI work that is not frontier-scale. The H100 delivers about 3 to 4 times the A100's FP16 transformer throughput and adds an FP8 Transformer Engine.

Here is where the A100 sits across recent NVIDIA data-center generations:

| GPU | Architecture | Year | Memory | Bandwidth | FP16 Tensor (dense) | FP8 |
|---|---|---|---|---|---|---|
| V100 | Volta | 2017 | 16 / 32 GB HBM2 | 900 GB/s | 125 TFLOPS | No |
| A100 | Ampere | 2020 | 40GB HBM2 / 80GB HBM2e | up to 2,039 GB/s | 312 TFLOPS | No |
| H100 | Hopper | 2022 | 80 GB HBM3 | 3,350 GB/s | ~989 TFLOPS | Yes |
| H200 | Hopper | 2024 | 141 GB HBM3e | 4,800 GB/s | ~989 TFLOPS | Yes |
| B200 | Blackwell | 2024 to 2025 | 192 GB HBM3e | ~8,000 GB/s | higher, adds FP4 | Yes |

The takeaway: the H100 and H200 share the same compute engine and differ mainly in memory, so an H200 helps A100 upgraders most when a model exceeds 80GB. Blackwell (B200) is a generational leap but costs more and is scarcer than Ampere and Hopper parts, which is one reason the A100 still has a role. For how the newest chips stack up, see [NVIDIA B300 vs B200 vs H200](/bits/nvidia-b300-vs-b200-vs-h200-best-gpu-for-self-hosting-ai/).

## What can you run on an A100?

An A100 80GB handles most practical AI workloads short of frontier-scale pretraining. Its memory capacity and bandwidth suit inference, fine-tuning, and mid-scale training.

Common workloads include LoRA and QLoRA fine-tuning of models up to roughly 65B parameters, inference on models up to 30B (or 70B quantized), diffusion-model and computer-vision training, and FP64 scientific computing where the A100's double-precision Tensor cores help. Using MIG, one A100 can be split into up to seven isolated instances to serve several smaller models at once, which improves utilization for inference fleets. For a hands-on example, see [how to run a model on a single A100 with vLLM](/bits/run-nvidia-nemotron-3-5-lightning-on-one-gpu-vllm-setup-for-h100-a100-on-akash/).

## Why is the A100 still in demand in 2026?

Because next-generation Blackwell capacity is tight and the A100's mature driver stack keeps it the practical default for inference, fine-tuning, and mid-scale training that doesn't need frontier-scale compute. NVIDIA CEO Jensen Huang has said the A100 fleet is "mission-capable from 2020 through 2029," pointing to CUDA's cross-generation compatibility as what lets older Ampere chips keep earning their keep years after launch — a claim backed by CoreWeave reportedly signing A100 rental contracts through 2029 and A100 rental pricing holding steady rather than depreciating ([Yahoo Finance](https://finance.yahoo.com/technology/ai/articles/jensen-huang-says-nvidia-2020-113101547.html)). On Akash's marketplace alone, checked August 16, 2026, 222 A100 GPUs are listed across 7 independent providers — a sign the card is still actively deployed, not winding down. For teams evaluating hardware, this means the A100 is neither obsolete nor a bargain-bin part; it is a supported, in-demand chip whose cost depends mostly on how you rent it.

## What factors affect the cost of running A100 workloads?

The cost of an A100 workload is set mostly by how you rent the GPU and how efficiently you use it, not by the hardware, which is identical everywhere. The largest savings come from matching the billing mode to the workload, keeping the GPU busy instead of idle, and choosing a provider whose pricing responds to supply and demand.

| Cost factor | Pushes cost down | Pushes cost up |
|---|---|---|
| Billing mode | reserved or bid-driven pricing for steady use | fixed-rate on-demand for 24/7 workloads |
| Utilization | high usage, autoscaling, idle shutdown | idle time on hourly billing |
| Configuration | 40GB or PCIe when sufficient | 80GB or SXM when not needed |
| Surrounding services | bundled or low egress | separate storage and egress fees |
| Provider model | marketplace with competitive bidding | fixed rate card |

On the provider question, marketplaces work differently from fixed rate cards: independent providers bid to fill your order, which tends to move rates toward the market floor. Akash Network runs on this model, listing A100 capacity from independent providers whose rates vary and are shown on the [Akash GPU pricing page](/pricing/gpus/). For comparison, hyperscaler on-demand A100 rates run well above that: roughly \$2.70/GPU-hr (CoreWeave), \$3.43/GPU-hr (AWS), and \$4.03/GPU-hr (GCP).

## FAQ

**What is the NVIDIA A100 used for?** The A100 is a data-center GPU for AI training, inference, and high-performance computing. In 2026 it is commonly used for LLM inference, LoRA and QLoRA fine-tuning, diffusion and computer-vision training, and FP64 scientific workloads. Its 40GB or 80GB of memory and MIG partitioning make it flexible for both single large models and multi-tenant inference.

**How much memory does the A100 have?** The A100 comes in 40GB and 80GB versions. The 40GB model uses HBM2 with 1,555 GB/s of bandwidth, while the 80GB model uses faster HBM2e at 1,935 GB/s (PCIe) or 2,039 GB/s (SXM). Both share the same 6,912 CUDA cores and 432 Tensor cores, so they differ only in memory and power.

**Is the A100 better than the H100?** No. The H100 is faster across most AI metrics, with roughly 3 to 4 times the A100's FP16 transformer throughput, HBM3 memory at 3.35 TB/s, and FP8 support the A100 lacks. The A100 remains relevant because it is cheaper, widely available, and sufficient for inference, fine-tuning, and mid-scale training.

**Does the A100 support FP8?** No. FP8 was introduced with the H100 (Hopper) and its Transformer Engine. The A100 supports FP64, FP32, TF32, BF16, FP16, and INT8, with a headline figure of 312 TFLOPS of dense FP16 Tensor performance (624 with structural sparsity). The missing FP8 mainly affects large-model inference efficiency.

**How much does it cost to rent an A100 per hour in 2026?** On the [Akash marketplace](/pricing/gpus/), checked August 16, 2026, an 80GB A100 starts at \$1.07/GPU-hr, averages \$1.54/GPU-hr, and tops out at \$1.83/GPU-hr as providers bid for your workload. Hyperscaler on-demand rates run higher, from roughly \$2.70/GPU-hr (CoreWeave) to \$4.03/GPU-hr (GCP). Rates move with supply and demand, so check [current Akash pricing](/pricing/gpus/) before deploying.

**How much does an A100 cost per month?** Running one A100 continuously for 720 hours on Akash costs roughly \$770 at the starting rate, about \$1,109 at the average rate, and up to \$1,318 at the top of the current range (all as of August 16, 2026). Storage, networking, and egress are often billed separately, so the real monthly total can run higher than the GPU rate alone.

**Should I choose the A100 40GB or 80GB?** Choose the 80GB in most cases. It uses faster HBM2e memory and fits larger models and batch sizes the 40GB card cannot hold, and 80GB SXM4 is what's predominantly available on GPU marketplaces today. The 40GB variant is worth choosing only when you've confirmed your workload fits comfortably within 40GB and want to save on cost. For the full breakdown by model size, MIG slice, and context length, see our [A100 40GB vs 80GB decision guide](/bits/a100-40gb-vs-80gb-vram-bandwidth-mig-compared/).

**How much does it cost to buy an A100?** A new A100 80GB costs roughly \$7,000 to \$15,000, and used units run \$4,000 to \$9,000. The 40GB PCIe model runs \$8,000 to \$10,000 new, while the 80GB SXM variant reaches \$18,000 to \$20,000 because it needs an HGX baseboard and delivers higher memory bandwidth. These are secondary-market retail figures, not Akash rental data, so treat them as directional and confirm with a current vendor quote before buying.

**Can you still get A100 GPUs in 2026?** Yes. Although NVIDIA's newer architectures get the production focus, the A100 remains widely available through cloud rental and existing inventory. Software support continues through current CUDA and driver releases, so the A100 is neither obsolete nor unsupported.
