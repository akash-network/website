---
title: "NVIDIA H200 GPU Guide 2026: Specs, Benchmarks, and Pricing"
pubDate: 2026-08-20
lastUpdated: 2026-08-20
author: "Sandeep Narahari, Contributor"
description: "NVIDIA H200 specs (141GB HBM3e, 4.8TB/s), benchmarks versus the H100, and live hourly rental prices fetched from provider APIs on August 20, 2026. Rates run from $4.45/hr to $10.60/hr per GPU across seven providers."
tags: ["Guides"]
bannerImage: ./banner.webp
draft: false
faqAccordion: true
---

*By Sandeep Narahari, Contributor. Last updated: August 2026.*

> **Note:** All hourly rates in this guide were fetched directly from provider pricing APIs and public pricing pages on August 20, 2026 at 20:05 UTC. GPU rental prices move weekly, so treat every figure as a point-in-time reading and check the linked sources before you budget.

The NVIDIA H200 is a Hopper-architecture data center GPU with 141GB of HBM3e memory and 4.8TB/s of memory bandwidth. Renting one costs between \$4.45 and \$10.60 per GPU-hour on demand, depending on the provider.

## TL;DR

- Specs: 141GB HBM3e, 4.8TB/s bandwidth, 3,958 TFLOPS FP8 with sparsity, up to 700W TDP in SXM form factor. Same compute silicon as the H100, with 1.76x the memory and 1.43x the bandwidth ([NVIDIA](https://www.nvidia.com/en-us/data-center/h200/)).
- Cheapest on-demand rate found: \$4.45 per GPU-hour, on the [Akash Network marketplace](/pricing/gpus/), fetched from its public API on August 20, 2026. Nebius at \$4.50 and RunPod at \$4.59 sit within 3% of it, so the sub-\$5 tier is competitive rather than a single outlier.
- Most expensive: \$10.60 per GPU-hour on Azure ND96isr H200 v5 in East US 2, fetched from the Azure Retail Prices API on the same date. Azure costs 2.4x the marketplace low for identical hardware.
- Cheapest interruptible rate: \$2.33 per GPU-hour on Azure low priority in South Central US 2, which is 78% below Azure list and suits checkpointed or batch work only.
- Real inference gain over H100: roughly 1.4x on memory-bound decode, not the 1.9x headline figure, which came from a specific TensorRT-LLM offline throughput test.
- Buying instead: an H200 SXM module runs \$32,000 to \$40,000, and an 8-GPU HGX H200 server runs about \$370,000, which is roughly 14 months of continuous rental at \$4.45/hr.

## What are the NVIDIA H200's full specs?

The H200 pairs the H100's Hopper compute die with 141GB of HBM3e memory at 4.8TB/s, which is 1.76x the capacity and 1.43x the bandwidth of the H100 SXM. Peak math throughput is unchanged from the H100, so every H200 gain traces back to memory.

| Specification | H200 SXM | H200 NVL | Unit |
|---|---|---|---|
| Memory | 141 | 141 | GB HBM3e |
| Memory bandwidth | 4.8 | 4.8 | TB/s |
| FP8 Tensor Core (with sparsity) | 3,958 | 3,341 | TFLOPS |
| FP16 / BF16 Tensor Core (with sparsity) | 1,979 | 1,671 | TFLOPS |
| TF32 Tensor Core (with sparsity) | 989 | 835 | TFLOPS |
| FP64 Tensor Core | 67 | 60 | TFLOPS |
| NVLink bandwidth | 900 | 900 | GB/s per GPU |
| PCIe | Gen5, 128 | Gen5, 128 | GB/s |
| Max TDP (configurable) | 700 | 600 | W |
| Multi-Instance GPU | Up to 7 at 18GB | Up to 7 at 16.5GB | instances |

Source: [NVIDIA H200 product page](https://www.nvidia.com/en-us/data-center/h200/). The practical takeaway is that the SXM variant is the one nearly every cloud rents, and the NVL variant trades about 16% of peak throughput and 100W of power for a PCIe form factor that fits standard servers.

## How much faster is the H200 than the H100?

The H200 delivers roughly 1.4x the H100's LLM decode throughput in independent testing, and up to 1.9x in NVIDIA's own offline throughput benchmarks. The gap between those two numbers is the difference between a bandwidth-bound benchmark and a marketing-facing best case.

| Workload | H100 SXM | H200 SXM | B200 SXM | Unit |
|---|---|---|---|---|
| Llama 3.1 70B FP8, single-request decode | 115 to 135 | 160 to 185 | 300 to 360 | tokens/sec |
| Llama 3.1 405B FP8, 8-way tensor parallel | 35 to 45 | 50 to 65 | 100 to 130 | tokens/sec |
| Llama 2 13B FP8, batch 1024 (NVIDIA, TensorRT-LLM) | not published | 11,819 | not published | tokens/sec |
| Llama 2 70B, NVIDIA headline claim | 1.0x baseline | 1.9x | not applicable | relative |
| GPT-3 175B, NVIDIA headline claim | 1.0x baseline | 1.6x | not applicable | relative |

Sources: [General Compute benchmark, June 14, 2026](https://www.generalcompute.com/blog/h100-vs-h200-vs-b200-which-gpu-is-best-for-llm-inference), [NVIDIA TensorRT-LLM H200 launch post](https://nvidia.github.io/TensorRT-LLM/blogs/H200launch.html), [NVIDIA H200 product page](https://www.nvidia.com/en-us/data-center/h200/).

The 1.4x figure tracks the 1.43x bandwidth increase almost exactly, which is the expected result for autoregressive decoding. For what the older part costs today, see [H100 rental price in August 2026](https://akash.network/the-bid/h100-rental-price-2026-cost-per-hour/), which tracks H100 cost per hour across eleven providers. NVIDIA's own TensorRT-LLM numbers carry a disclaimer that they were produced on TensorRT-LLM v0.5, so newer serving stacks will shift them.

The larger H200 benefit is topology, not throughput. A 70B model in BF16 fits on one H200 but needs two H100s, and Llama 405B in FP8 fits on two H200s versus four to six H100s. Removing a GPU from the serving topology removes tensor-parallel communication overhead, which often beats the raw 1.4x.

## How much does an H200 cost per hour in 2026?

On-demand H200 rental costs \$4.45 to \$10.60 per GPU-hour, a 2.4x spread across providers for the same 141GB SXM part. Every rate below was fetched on August 20, 2026 at 20:05 UTC from the source listed in the final column.

| Provider | \$/GPU-hour | \$/GB HBM-hour | \$/month (730 hrs, 1 GPU) | Price source, fetched 2026-08-20 |
|---|---|---|---|---|
| [Akash Network](/pricing/gpus/) | 4.45 | 0.0316 | 3,248 | [Akash Console API](/pricing/gpus/) |
| [Nebius](https://nebius.com/prices) | 4.50 | 0.0319 | 3,285 | [Nebius pricing page](https://nebius.com/prices) |
| [RunPod](https://www.runpod.io/pricing) Secure Cloud | 4.59 | 0.0326 | 3,351 | [RunPod Pricing page](https://www.runpod.io/pricing) |
| CoreWeave HGX H200 (8x, \$50.44/hr) | 6.31 | 0.0447 | 4,603 | [CoreWeave pricing](https://www.coreweave.com/pricing) |
| [AWS](https://aws.amazon.com/ec2/instance-types/p5/) p5en.48xlarge (8x, \$63.296/hr) | 7.91 | 0.0561 | 5,776 | [Vantage EC2 data](https://instances.vantage.sh/aws/ec2/p5en.48xlarge) |
| [Azure](https://azure.microsoft.com/en-us/pricing/details/virtual-machines/) ND96isr H200 v5, East US 2 (8x, \$84.80/hr) | 10.60 | 0.0752 | 7,738 | [Azure Retail Prices API](https://learn.microsoft.com/en-us/rest/api/cost-management/retail-prices/azure-retail-prices) |

Two things stand out. First, hyperscaler H200 capacity sells only in 8-GPU nodes, so the minimum AWS commitment is \$63.296 per hour and the minimum Azure commitment is \$84.80 per hour, while the marketplaces and neoclouds rent single GPUs. Second, the entire sub-\$5 tier is 44% to 58% below the hyperscaler rates for identical silicon, and the gap is structural rather than promotional: AWS and Azure bundle enterprise support, compliance certifications, and integrated networking into the hourly rate.

A third-party aggregator listing 36 providers put the full H200 range at \$1.41 to \$13.78 per GPU-hour across all billing models on the same day ([GetDeploying](https://getdeploying.com/gpus/nvidia-h200)).



## How much does it cost to buy an H200 instead of renting one?

An H200 SXM module costs \$32,000 to \$40,000, and a complete 8-GPU HGX H200 server costs about \$370,000, or roughly \$46,250 per GPU once NVSwitch fabric, CPUs, and chassis are included ([Mercatus](https://www.mercatus-ai.com/blog/h200-server-price), last verified 2026-05-04).

| Rental rate | Monthly cost at 24/7 | Months to match $46,250 per-GPU capex |
|---|---|---|
| \$4.45/hr (Akash Network) | 3,248 | 14.2 |
| \$4.59/hr (RunPod Secure) | 3,351 | 13.8 |
| \$6.31/hr (CoreWeave) | 4,603 | 10.0 |
| \$7.91/hr (AWS) | 5,776 | 8.0 |
| \$10.60/hr (Azure) | 7,738 | 6.0 |

These break-even points ignore power, cooling, colocation, networking, staff, and depreciation, all of which push the real crossover later. A 700W GPU at industrial power rates plus datacenter overhead adds meaningful monthly cost per GPU, so a purchase that looks break-even at 14 months on hardware alone typically lands closer to 20 months or more in practice. Buying makes sense at sustained 90%-plus utilization over multiple years. Renting makes sense for everything spikier than that.

## Why did H200 supply and pricing shift in August 2026?

H200 supply loosened in August 2026 because the first meaningful shipments of the chip reached Chinese buyers, releasing inventory that NVIDIA had stockpiled for that market. ByteDance and Tencent each took delivery of roughly 10,000 H200 accelerators in the weeks before August 19, 2026, the first substantial movement into the region since export approval in December 2025 ([Tom's Hardware, August 19, 2026](https://www.tomshardware.com/pc-components/gpus/first-nvidia-h200-shipments-reach-bytedance-and-tencent-as-beijing-loosens-its-import-block)).

Those 10,000-unit deliveries are about 2.5% of the 400,000-plus units the approved Chinese firms are licensed to buy, and NVIDIA had built up roughly 500,000 H200s for the market. Beijing has routed most licensed chips to Hong Kong, whose 47 datacenters total 581MW, well short of what a single company's full allocation would draw. The practical effect for renters outside China is that a large H200 inventory remains in the western market for now.

Pricing has moved in both directions this year. AWS raised P5e and P5en capacity block pricing by about 15% in January 2026, taking one US West configuration from \$43.26 to \$49.75 per hour while stating that its commitment not to raise on-demand and Savings Plan pricing was unchanged ([Data Center Dynamics, January 6, 2026](https://www.datacenterdynamics.com/en/news/aws-quietly-increases-prices-for-h200-ec2-instances-by-15/)). Marketplace and neocloud rates, meanwhile, have drifted down as Blackwell capacity absorbs the demand for frontier training.

## FAQ

**How much VRAM does the NVIDIA H200 have?** The NVIDIA H200 has 141GB of HBM3e memory with 4.8TB/s of bandwidth, in both the SXM and NVL form factors. That is 1.76x the H100 SXM's 80GB and 1.43x its 3.35TB/s bandwidth. The 141GB capacity lets a 70B-parameter model run in BF16 on a single GPU.

**What is the cheapest place to rent an H200 in 2026?** The cheapest on-demand H200 rate found on August 20, 2026 was \$4.45 per GPU-hour on the [Akash Network marketplace](/pricing/gpus/), followed by Nebius at \$4.50, RunPod Secure Cloud at \$4.59, and CoreWeave at \$6.31. Interruptible capacity started at \$2.33 per GPU-hour on Azure low priority. Prices change weekly.

**Is the H200 faster than the H100?** Yes. The H200 delivers about 1.4x the H100's LLM decode throughput, matching its 1.43x memory bandwidth advantage, and NVIDIA reports up to 1.9x on Llama 2 70B offline throughput and 1.6x on GPT-3 175B. Peak compute is identical to the H100, so all gains come from memory.

**How much does an H200 GPU cost to buy?** An H200 SXM module costs \$32,000 to \$40,000 and an H200 PCIe card costs \$28,000 to \$34,000, with a complete 8-GPU HGX H200 server running \$320,000 to \$420,000, typically about \$370,000. That works out to roughly \$46,250 per GPU including NVSwitch fabric, CPUs, and chassis.

**Why is AWS H200 pricing so much higher than marketplace pricing?** AWS charges \$7.91 per GPU-hour for H200 capacity in p5en.48xlarge instances versus \$4.45 to \$4.59 on marketplaces and neoclouds, and Azure charges \$10.60. Hyperscalers bundle enterprise support, compliance certifications, and integrated networking, and they sell H200s only in 8-GPU nodes, so the minimum spend is \$63.296 per hour on AWS.

**Can you rent a single H200 instead of an 8-GPU node?** Yes. Akash Network, RunPod, and Nebius rent single H200 GPUs, while AWS, Azure, and Google Cloud sell H200 capacity only in 8-GPU instances. Single-GPU rental suits inference and fine-tuning of models up to about 70B parameters in BF16, which fit in 141GB.
