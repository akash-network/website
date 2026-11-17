---
title: "NVIDIA B200 (Blackwell) GPU Rental Price in 2026: Cost Per Hour and Model Sizing"
pubDate: 2026-09-24
lastUpdated: 2026-11-12
author: "Sandeep Narahari, Contributor"
description: "NVIDIA B200 GPU rental price in 2026, including cost per hour, Akash pricing, Blackwell GPU specs, model sizing, B200 vs B300, and cloud GPU options."
tags: ["Guides"]
bannerImage: ./banner.webp
draft: false
faqAccordion: true
metaTitle: "NVIDIA B200 GPU Rental Price 2026 | Cost/Hour & Blackwell"
metaDescription: "NVIDIA B200 GPU rental price in 2026, including cost per hour, Akash pricing, Blackwell GPU specs, model sizing, B200 vs B300, and cloud GPU options."
---

*By Sandeep Narahari, Contributor. Last updated: November 2026. B200 market reference rate from GetDeploying and B300 from gpus.io, August 2026; AWS and Google Cloud list prices checked September 24, 2026; Akash H100 rate checked November 3, 2026; Akash H200 rate checked October 22, 2026.*

On Akash, the [B200](/pricing/gpus/b200/) GPU rental price comes from live provider bids, listed on [Akash GPU pricing](/pricing/gpus/). When no provider has B200 bids open, you can [request access](/next-gen-gpus/) for on-demand or reserved capacity. A rental gives you one NVIDIA B200 with 180GB of HBM3e and 8 TB/s of memory bandwidth, and on-demand deployments need no long-term contract. The cost math below uses a market reference rate of \$6.14 per GPU-hour, the tracked market median from [GetDeploying](https://getdeploying.com/gpus/nvidia-b200-vs-nvidia-h200) in August 2026.

## TL;DR

- **Live pricing on Akash:** B200 prices come from live provider bids on the [GPU pricing table](/pricing/gpus/), and when no provider has bids open you can [request access](/next-gen-gpus/). At the \$6.14 market reference rate used in this article, one B200 costs \$147.36 a day or \$4,420.80 a month running nonstop, and a full 8-GPU configuration costs \$49.12 an hour, or \$35,366.40 a month.
- **Trillion-parameter models can fit on one 8x B200 node by weight capacity:** Kimi K2.6 (1T parameters), GLM-5.2 (753B), and DeepSeek-V4-Pro (1.6T) have published checkpoints that fit within 1,440GB of B200 HBM. Kimi K3 (2.8T) exceeds that capacity and requires a multi-node configuration.
- **Lowest bandwidth-adjusted cost of the four GPUs compared:** At the rates used here, a B200 costs about \$0.768 per TB/s of peak memory bandwidth per hour, below the [H100](/pricing/gpus/h100/), [H200](/pricing/gpus/h200/), and [B300](/pricing/gpus/b300/) in this comparison, which uses market reference rates for the B200 and B300 and Akash rates for the H100 and H200. The H100 and H200 cost only about 5% to 6% more per unit of bandwidth. For memory-bandwidth-bound serving, that makes the B200 a candidate for lower cost per token, but actual token economics require benchmarking.
- **B300 uses fewer GPUs for memory-heavy workloads; B200 offers more bandwidth per dollar:** B300's 288GB per GPU can reduce the number of GPUs required for some large models. When comparing configurations with more B200 GPUs, the B200 can provide more aggregate memory bandwidth per dollar, but actual throughput depends on the model and serving stack.
- **Market median vs hyperscaler list prices:** The \$6.14 tracked market median is about 56.9% below the AWS P6-B200 list rate of about \$14.24 per GPU-hour, and about 23.8% below Google Cloud's A4 8-GPU B200 configuration at \$64.44 per hour, or about \$8.06 per GPU-hour. Akash's own B200 rate is live on the [GPU pricing table](/pricing/gpus/).

## How much does a B200 cost per hour, month, and year on Akash?

On Akash, the B200 rate comes from live provider bids, so check the [B200 pricing page](/pricing/gpus/b200/) for the current figure. At the \$6.14 market reference rate, a B200 costs \$6.14 an hour, \$4,420.80 a month, and \$53,786.40 a year if it runs nonstop. An 8-GPU node costs \$49.12 an hour, \$35,366.40 a month, and \$430,291.20 a year.

| Duration | 1x B200 at market reference (USD) | 8x B200 node at market reference (USD) |
|---|---|---|
| 1 hour | \$6.14 | \$49.12 |
| 24 hours | \$147.36 | \$1,178.88 |
| 1 week (168 hr) | \$1,031.52 | \$8,252.16 |
| 1 month (720 hr) | \$4,420.80 | \$35,366.40 |
| 1 year (8,760 hr) | \$53,786.40 | \$430,291.20 |

Rate: \$6.14 per GPU-hour, the tracked B200 market median from [GetDeploying](https://getdeploying.com/gpus/nvidia-b200-vs-nvidia-h200), August 2026. Akash's own rate comes from live provider bids on [Akash GPU pricing](/pricing/gpus/).

Few workloads run nonstop, though. If you serve a model and scale it down overnight so each GPU runs 16 hours a day, that's 480 hours a month: \$2,947.20 per GPU instead of \$4,420.80, or \$23,577.60 for a full node. Because Akash billing is on demand, you aren't charged for hours when the deployment is shut down.

## Can one 8x B200 node run a trillion-parameter model?

**Yes - an 8x B200 node can hold the published weights of several trillion-parameter-class models in low-precision formats.** An 8-GPU B200 system provides 1,440GB of HBM3e memory, with 180GB per GPU. NVIDIA rates the 8-GPU DGX B200 system at up to 144 PFLOPS of FP4 tensor compute.

That is enough HBM capacity for models such as Kimi K2.6 (1T parameters), GLM-5.2 (753B), and DeepSeek-V4-Pro (1.6T) at their published checkpoint precisions, based on their listed checkpoint sizes. Kimi K3, at about 2.8T parameters and roughly 1.56TB for its published MXFP4 checkpoint, exceeds the 1.44TB HBM capacity of a single 8x B200 node and therefore requires a multi-node configuration.

The important distinction is that **model weights are only part of the memory requirement**. Actual inference also needs memory for the KV cache, activations, framework overhead, and other runtime allocations. Those requirements vary with context length, concurrency, model architecture, quantization, and serving framework. There is no universal 25 percent multiplier that applies to every model.

| Model | Parameters (total / active) | Published precision | Checkpoint (GB) | Weight-only B200 capacity needed | Example B200 configuration | Cost/hour at market reference | Cost/month at market reference |
|---|---|---|---|---|---|---|---|
| DeepSeek-V4-Flash | 284B / 13B | FP4 + FP8 | 160 | 1 | 2 | \$12.28 | \$8,841.60 |
| Qwen3.5-397B-A17B | 397B / 17B | FP8 | 406 | 3 | 4 | \$24.56 | \$17,683.20 |
| Kimi K2.6 | 1T / 32B | INT4 | 595 | 4 | 8 | \$49.12 | \$35,366.40 |
| GLM-5.2 | 753B | FP8 | 756 | 5 | 8 | \$49.12 | \$35,366.40 |
| DeepSeek-V4-Pro | 1.6T / 49B | FP4 + FP8 | 865 | 5 | 8 | \$49.12 | \$35,366.40 |
| Kimi K3 | 2.8T / 104B | MXFP4 | 1,561 | 9 | 16 (2 nodes) | \$98.24 | \$70,732.80 |

**Weight-only B200 capacity needed** is checkpoint size divided by 180GB per B200, rounded up. **Example B200 configuration** is a practical starting point rather than a universal minimum; the correct GPU count depends on the model, serving framework, context length, concurrency, and parallelism strategy.

Checkpoint and model information comes from the respective model cards: [DeepSeek-V4-Flash](https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash), [Qwen3.5-397B-A17B-FP8](https://huggingface.co/Qwen/Qwen3.5-397B-A17B-FP8), [Kimi K2.6](https://huggingface.co/moonshotai/Kimi-K2.6), [GLM-5.2-FP8](https://huggingface.co/zai-org/GLM-5.2-FP8), [DeepSeek-V4-Pro](https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro), and [Kimi K3](https://huggingface.co/moonshotai/Kimi-K3). NVIDIA lists 180GB HBM3e per B200 GPU and 1.44TB across an 8-GPU B200 system.

Costs use the \$6.14 market reference rate per B200 GPU-hour and 720 hours a month. Akash pricing comes from live provider bids and can vary with marketplace conditions; see [Akash GPU pricing](/pricing/gpus/) for the current rate.

### Why low-precision models fit on B200

Low-precision weights dramatically reduce the memory required to store large models. Kimi K2.6 is distributed as an INT4 model, while DeepSeek-V4-Pro uses a mixed low-precision format. That allows models with more than one trillion total parameters to fit within a single 8x B200 node by weight capacity.

The B200 is designed for low-precision AI workloads and supports FP4 Tensor Core computation. NVIDIA rates an 8-GPU DGX B200 system at up to 144 PFLOPS of FP4 performance ([DGX B200 specs](https://www.nvidia.com/en-us/data-center/dgx-b200/)).

However, fitting the weights does not guarantee that the model will run comfortably at every context length or concurrency level. For production inference, you need to benchmark the model with your actual serving configuration and account for KV-cache and runtime memory.

### What matters when sizing B200s

For MoE models, total parameters primarily determine model-weight memory, while active parameters influence the amount of computation performed for each token. This is why a model with a very large total parameter count can still be practical to serve when only a smaller subset of parameters is active for each token. See [total vs active parameters and GPU sizing](/the-bid/total-vs-active-parameters-moe-gpu-sizing-2026/) for the full breakdown.

For multi-GPU and multi-node deployments, the serving framework also matters. Tensor-parallel size is constrained by the model architecture and implementation rather than by a universal requirement to use powers of two. Common configurations include 1, 2, 4, and 8 GPUs, but the correct value should be verified for the specific model and framework.

The practical takeaway: an 8x B200 node can run many trillion-parameter-class models when they are sufficiently quantized, but the number of GPUs you actually need depends on more than the model's parameter count.

## Is a B200 or B300 cheaper for trillion-parameter models?

It depends on whether you're paying for hours or for throughput. A B300 has 288GB per GPU versus 180GB on B200, so it can fit some models on fewer GPUs and lower the total hourly bill. A B200 configuration provides more aggregate memory bandwidth when you use more GPUs, which may improve cost per token for bandwidth-bound serving.

| Model | B200 at market reference | B300 at market reference | H200 on Akash |
|---|---|---|---|
| DeepSeek-V4-Flash | 2 GPUs, \$12.28/hr | 1 GPU, \$8.31/hr | 2 GPUs, \$7.70/hr |
| Qwen3.5-397B-A17B | 4 GPUs, \$24.56/hr | 2 GPUs, \$16.62/hr | 4 GPUs, \$15.40/hr |
| Kimi K2.6 | 8 GPUs, \$49.12/hr | 4 GPUs, \$33.24/hr | 8 GPUs, \$30.80/hr |
| GLM-5.2 | 8 GPUs, \$49.12/hr | 4 GPUs, \$33.24/hr | 8 GPUs, \$30.80/hr |
| DeepSeek-V4-Pro | 8 GPUs, \$49.12/hr | 4 GPUs, \$33.24/hr | 8 GPUs, \$30.80/hr |
| Kimi K3 | 16 GPUs, \$98.24/hr | 8 GPUs, \$66.48/hr | 16 GPUs, \$61.60/hr |

Same sizing method as the table above. Rates used here: B200 \$6.14 and B300 \$8.31 per GPU-hour (tracked market medians from GetDeploying and gpus.io respectively, August 2026), and H200 \$3.85 per GPU-hour on Akash. Live Akash B200 and B300 rates are on [Akash GPU pricing](/pricing/gpus/).

At these example configurations, the B300 has a lower hourly GPU cost than the B200 for every model in the table because its larger memory capacity can reduce the number of GPUs required. The H200 column, at Akash's \$3.85 rate, is lower per hour still, but it needs twice as many GPUs as the B300 for each model and lacks the FP4 Tensor Cores the B200 and B300 have.

Throughput tells a different story. Eight B200s provide 64 TB/s of combined peak memory bandwidth for \$49.12/hour at the market reference rate. Four B300s provide 32 TB/s for \$33.24/hour. Decode-heavy LLM inference can be strongly influenced by memory bandwidth ([here's why](/the-bid/gpu-compute-vs-bandwidth-2026/)), so the B200 configuration may offer better throughput per dollar in some workloads. However, actual results depend on the model, batch size, parallelism, and serving stack, while B300 also provides Blackwell Ultra architectural improvements.

As a starting point: for a memory-capacity-constrained job, B300 can lower the hourly bill; for high-throughput serving, benchmark both configurations before committing. For more on the larger-memory GPU, see [B300 rental pricing](/the-bid/b300-rental-price-2026-cost-per-hour/).

## How much does a B200 cost per token compared with H100, H200, and B300?

At the \$6.14 market reference rate, a B200 costs about \$0.768 per TB/s of memory bandwidth per hour. That is the lowest bandwidth-adjusted cost among the four GPUs in this comparison, which uses market reference rates for the B200 and B300 and Akash rates for the H200 and H100.

For workloads where LLM decode is primarily limited by GPU memory bandwidth, this provides a useful estimate of relative token economics. Using the B200 as the baseline, the H100 costs about 6% more per unit of memory bandwidth, the B300 about 35% more, and the H200 about 5% more.

| GPU | Memory (GB) | Bandwidth (TB/s) | Rate used (USD/GPU-hr) | Cost per TB/s-hour (USD) | Estimated relative cost per token* | Cost per GB-hour (USD) |
|---|---|---|---|---|---|---|
| B200 | 180 | 8.0 | \$6.14 (market median) | \$0.768 | 1.00x | \$0.0341 |
| B300 | 288 | 8.0 | \$8.31 (market median) | \$1.039 | 1.35x | \$0.0289 |
| H200 | 141 | 4.8 | \$3.85 (Akash) | \$0.802 | 1.05x | \$0.0273 |
| H100 SXM | 80 | 3.35 | \$2.73 (Akash) | \$0.815 | 1.06x | \$0.0341 |

*Estimated relative cost per token is calculated from hourly rental cost divided by peak memory bandwidth, with the B200 set to 1.00x. It is a bandwidth-based proxy, not a measured tokens-per-second benchmark. The comparison assumes decode is primarily memory-bandwidth-bound. B200 and B300 rates are tracked market medians from GetDeploying (August 2026); H200 and H100 rates are Akash rates. Specs from [NVIDIA DGX B200](https://www.nvidia.com/en-us/data-center/dgx-b200/) and [NVIDIA H200](https://www.nvidia.com/en-us/data-center/h200/).

The B200 and B300 both offer up to 8 TB/s of memory bandwidth, but that does not mean they will deliver identical token throughput in every workload. Actual inference performance depends on factors such as model architecture, quantization, batch size, KV-cache usage, software, and GPU utilization. NVIDIA also gives B300 architectural improvements beyond memory bandwidth, so bandwidth alone should not be used to predict token throughput.

The B300's main advantage is memory capacity: 288 GB versus 180 GB on the B200. That extra capacity can allow larger models, longer context windows, or higher batching to fit on a single GPU. On a simple bandwidth-adjusted basis, however, the B200 has the lower hourly cost per unit of memory bandwidth.

For that reason, the table should be read as a memory-bandwidth cost comparison, not as a claim that the B200 will always produce tokens at the lowest dollar-per-token rate.

## How much does it cost to fine-tune a model on B200s?

A B200 fine-tuning run costs the GPU-hour rate multiplied by the number of GPUs and the hours the run takes. At the \$6.14 market reference rate, an 18-hour run on one 8x B200 configuration costs \$884.16.

| Example job | Market reference rate (USD/GPU-hr) | GPUs | Hours (illustrative) | Total at market reference (USD) |
|---|---|---|---|---|
| LoRA fine-tune, single node | \$6.14 | 8 | 18 | \$884.16 |
| Longer fine-tune, single node | \$6.14 | 8 | 72 | \$3,536.64 |
| Multi-node training run | \$6.14 | 16 | 72 | \$7,073.28 |
| A month of serving, single node | \$6.14 | 8 | 720 | \$35,366.40 |

The hours are examples to show the math, not measured run times. See [Akash GPU pricing](/pricing/gpus/) for current marketplace rates.

To estimate your own run, time a short test, extrapolate to the full wall-clock hours, and multiply by the applicable GPU-hour rate and your GPU count. You pay while the deployment is running; closing the deployment stops the services and returns unused escrow to your available balance.

## What should you know before renting a B200 on Akash?

Before you rent, check whether your model fits on one 8x B200 node, how many GPUs you'll actually deploy, how many hours they'll run, whether you need GPU interconnect, and whether you need on-demand or reserved capacity.

- **Does your model fit on one node?** An 8x B200 configuration provides 1,440GB of HBM3e. Compare your model's weight memory with that capacity and leave additional headroom for KV cache and runtime overhead. KV-cache requirements vary with context length, concurrency, model architecture, and precision. Kimi K3's roughly 1.56TB checkpoint does not fit on one 8x B200 node.
- **How many GPUs will you actually deploy?** Tensor parallelism does not universally require a power-of-two GPU count. The valid GPU count depends on the model and serving framework, so verify the supported parallel configuration before budgeting.
- **Is the model FP4 or FP8?** The B200 supports FP4 Tensor Core operations. Low-precision formats such as FP4 can substantially reduce model-weight memory compared with FP8, potentially reducing the number of GPUs required. Actual savings depend on the model and quantization format.
- **Are you paying for hours or for tokens?** A B300 can fit some models on fewer GPUs because it has more memory per GPU. A B200 configuration can provide more aggregate memory bandwidth for a larger GPU count, which may benefit bandwidth-bound serving. Benchmark your own model before committing.
- **Do you need more than one node?** For Kimi K3 or multi-node training, enable GPU interconnect when you deploy in [Akash Console](https://console.akash.network/new-deployment). Akash supports RDMA over InfiniBand and RoCE. You can require a specific fabric or let the provider choose.
- **How many hours will it actually run?** At the \$6.14 market reference rate, one B200 running 24 hours a day for 30 days costs \$4,420.80. Running it for 16 hours per day costs \$2,947.20 over 30 days. You need to actually close the deployment or use a runtime limit to stop billing.
- **On-demand or reserved?** For bursty or experimental work, use on-demand capacity. For predictable production workloads, [Akash Enterprise](/use-cases/enterprise/) offers reserved B300, B200, H200, H100, and [A100](/pricing/gpus/a100/) capacity with dedicated enterprise support and SLA-backed options.

## Is a B200 on Akash cheaper than on AWS or Google Cloud?

It depends on the live rate. Akash B200 pricing comes from provider bids, so compare the current figure on [Akash GPU pricing](/pricing/gpus/) with the hyperscaler list prices below. For reference, the \$6.14 tracked market median is about 56.9% below AWS's \$113.93/hour 8x B200 instance and about 23.8% below Google Cloud's \$64.44/hour 8x B200 instance.

For an 8-GPU configuration running 720 hours, that is \$35,366.40 at the market median, compared with \$46,396.80 on Google Cloud and \$82,031.62 on AWS.

| Provider | Per GPU-hour (USD) | 8x B200 configuration/hour (USD) | 8x B200 configuration/month (USD) | Market median below list |
|---|---|---|---|---|
| Akash | Live rate, see [GPU pricing](/pricing/gpus/) | Live rate | Live rate | — |
| Market median (GetDeploying, Aug 2026) | \$6.14 | \$49.12 | \$35,366.40 | — |
| Google Cloud A4 (list) | \$8.06 | \$64.44 | \$46,396.80 | 23.8% |
| AWS P6-B200 (list) | \$14.24 | \$113.93 | \$82,031.62 | 56.9% |

Sources: [Akash GPU pricing](/pricing/gpus/), [GetDeploying](https://getdeploying.com/gpus/nvidia-b200-vs-nvidia-h200), [Google Cloud accelerator-optimized pricing](https://cloud.google.com/products/compute/pricing/accelerator-optimized), and [AWS EC2 on-demand pricing](https://aws.amazon.com/ec2/pricing/on-demand/). Google lists the A4 `a4-highgpu-8g` at \$64.44/hour, while AWS lists `p6-b200.48xlarge` at about \$113.93/hour in us-east-1.

These are 8-B200 GPU configurations, not identical complete server specifications. Hyperscaler instance prices also include host CPU, RAM, storage, and other infrastructure.

Serving DeepSeek-V4-Pro or Kimi K2.6 on an 8x B200 configuration for 720 hours costs \$35,366.40 at the \$6.14 market reference rate. At the AWS list price above, the difference is \$46,665.22.

## How can enterprises reserve B200 capacity on Akash?

Enterprise teams can reserve B200s for a fixed term through [Akash Enterprise](/use-cases/enterprise/), in addition to renting on demand through the open marketplace. Reserved capacity is available for B300, B200, H200, H100, and A100 GPUs, with bare metal available and an SLA.

On top of GPU-hours, Akash Enterprise provides:

- Dedicated bare-metal servers with no virtualization layer and no shared tenancy.
- High-bandwidth GPU-to-GPU interconnect for multi-node distributed training, including NCCL workloads.
- Hardware-based Trusted Execution Environments (TEEs) that protect data, model inputs and outputs, and model weights.
- Upfront pricing with no egress fees, billed by invoice in USD.
- SOC 2 compliant providers, with HIPAA and other certifications handled case by case.
- Direct access to the technical team for onboarding, architecture guidance, and deployment support, with defined response times.

The usual path is to test a workload at on-demand pricing first, then move steady workloads to reserved capacity. No contract is needed to get started.

## FAQ

**Can I rent a single B200 GPU on Akash?** Yes, when providers have B200 bids open. You can deploy a single B200 or scale up to an 8-GPU configuration at the live rate on the [GPU pricing table](/pricing/gpus/), and when no provider has bids open you can [request access](/next-gen-gpus/) for on-demand or reserved capacity. One B200 provides 180GB of HBM3e, enough to hold models such as [gpt-oss-120b](https://huggingface.co/openai/gpt-oss-120b), whose original checkpoint is about 65GB. Larger models such as DeepSeek-V4-Flash require multiple GPUs for practical inference deployments.

**How much does it cost to run Kimi K3 on B200 GPUs?** Kimi K3 has 2.8 trillion parameters and a 1,561GB MXFP4 checkpoint, which exceeds the 1,440GB weight capacity of one 8x B200 node on checkpoint size alone. A practical starting configuration is 16 B200s across two nodes, which at the \$6.14 market reference rate costs \$98.24 an hour, or \$70,732.80 for a month of nonstop serving. Splitting the model across two nodes requires Akash's GPU interconnect option, and the exact GPU count should be verified against your serving framework and context length.

**How many B200 GPUs do I need for DeepSeek V4 Pro?** DeepSeek-V4-Pro has 1.6 trillion parameters, 49B of them active, and ships as an 865GB checkpoint in mixed FP4 and FP8, which fits within the 1,440GB HBM capacity of one 8x B200 node by checkpoint size alone. A practical starting configuration is 8 B200s, which at the \$6.14 market reference rate costs \$49.12 an hour, or \$35,366.40 for 720 hours. Actual memory requirements depend on context length, KV cache, concurrency, and your serving configuration.

**Does the B200 support FP4 models like Kimi K3 and DeepSeek V4?** Yes. The B200 has FP4 Tensor Cores, and NVIDIA rates an 8-GPU B200 system at up to 144 PFLOPS of FP4 compute. That matters because Kimi K3 ships in MXFP4 and DeepSeek V4 in mixed FP4 and FP8. The previous-generation H100 and H200 don't have FP4 Tensor Cores.

**How much faster is a B200 than an H100?** A B200 has 8 TB/s of memory bandwidth, 2.4 times the H100 SXM's 3.35 TB/s, and 180GB of memory versus 80GB. The actual speedup in LLM serving depends on the model, quantization, batch size, and software stack, so benchmark your workload. On Akash, an H100 costs \$2.73 per GPU-hour, and the B200 rate comes from live provider bids on the [GPU pricing table](/pricing/gpus/).

**Do I need a contract to rent B200 GPUs on Akash?** No. When providers have B200 bids open, you can rent B200s on demand at the live rate with no contract and stop whenever you like. When none do, [request access](/next-gen-gpus/). Teams with steady workloads can move to reserved capacity through [Akash Enterprise](/use-cases/enterprise/), which adds a committed term, an SLA, invoice billing in USD, and bare-metal options.

**How do I pay for B200 GPUs on Akash?** On-demand deployments are paid from your Akash Console balance, which you can top up with a [credit card](/blog/introducing-credit-card-payments-in-akash-console/). Billing runs per block while the deployment is live, so you stop paying when you close it. Reserved capacity through [Akash Enterprise](/use-cases/enterprise/) is invoiced in USD instead.

**Is the NVIDIA B200 the same as the GB200?** No. The B200 is the Blackwell GPU itself. The GB200 is a superchip that pairs one Grace CPU with two Blackwell GPUs over NVLink-C2C, and 36 of them make up the liquid-cooled GB200 NVL72 rack with 72 GPUs ([NVIDIA](https://www.nvidia.com/en-us/data-center/gb200-nvl72/)). On Akash, B200s rent individually or as 8-GPU configurations at the live rate when providers have bids open, with no rack-scale commitment. You can also [request access](/next-gen-gpus/) to GB200 NVL72 capacity.
