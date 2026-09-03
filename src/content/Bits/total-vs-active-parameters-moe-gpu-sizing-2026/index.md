---
title: "Total vs Active Parameters: How Much GPU Memory Does an LLM Need?"
pubDate: 2026-09-02
lastUpdated: 2026-09-02
author: "Sandeep Narahari, Contributor"
description: "Total parameters set how much GPU memory an LLM needs; active parameters set the compute cost per token. See why Kimi K3, at 104B active parameters, still needs 64+ accelerators."
tags: ["Guides"]
bannerImage: ./banner.webp
draft: false
faqAccordion: true
metaTitle: "Total vs Active Parameters: LLM GPU Memory Guide (2026)"
metaDescription: "How much GPU memory does an LLM need? Total parameters set memory, active sets compute cost — a sizing guide for MoE models like Mixtral and DeepSeek-V3."
---

*By Sandeep Narahari, Contributor. Last updated: September 2026.*

Total parameters set how much GPU memory you need. Active parameters set how much compute each token costs. Kimi K3 activates 104B parameters per token and still needs 64 or more accelerators, because sparsity governs compute, not footprint.

[GPU Compute vs Memory Bandwidth: The Two Limits of LLM Inference](/the-bid/gpu-compute-vs-bandwidth-2026/) covered which GPU resource runs out first. This part covers which model number tells you how much of that resource you need.

## TL;DR

- "7B" means 7 billion parameters. At BF16 each parameter is 2 bytes, so weights alone are about 14 GB. Parameters times bytes-per-parameter is your floor.
- A dense model runs essentially every parameter for every token. An MoE model routes each token to a few experts and leaves the rest idle.
- Mixtral 8x7B is the clean example. The [Mistral team's paper](https://arxiv.org/abs/2401.04088) puts it plainly: each token has access to 47B parameters but uses 13B active parameters during inference.
- The same paper states the rule directly: memory cost is proportional to the total (sparse) parameter count, while active parameters are proportional to compute cost.
- Kimi K3 shows it at scale. It is 2.8T total with 104B active, and Moonshot recommends 64 or more accelerators to serve it.

## What does 7B, 70B, or 400B actually mean?

The number is parameters, in billions: the learned weights inside the model. They have to sit in memory before the model produces a token, so the floor is parameters multiplied by bytes per parameter, which depends on precision:

> **GPU memory floor (GB) = total parameters (B) × bytes per parameter**
> 2 bytes at BF16/FP16, 1 at FP8, 0.5 at MXFP4/INT4.

| Precision | Bytes/param | 70B model | 405B model |
|---|---|---|---|
| BF16/FP16 | 2 | 140 GB | 810 GB |
| FP8 | 1 | 70 GB | 405 GB |
| MXFP4/INT4 | 0.5 | 35 GB | 203 GB |

The takeaway: precision moves the memory bill as much as model size does. These are weights only. KV cache and activations sit on top, which is why real deployments need headroom. See [H100 vs H200 for Long-Context LLMs](/the-bid/h100-vs-h200-long-context-llms/) for how fast KV cache grows.

Real checkpoints rarely match the naive arithmetic, because models mix precisions. OpenAI's [gpt-oss-120b](https://huggingface.co/openai/gpt-oss-120b) holds 116.8B parameters but ships as a 60.8 GiB checkpoint, since its MoE weights are MXFP4 while attention and embeddings are not.

## What is the difference between a dense model and an MoE model?

A dense model uses essentially its full parameter set for every token. A mixture-of-experts (MoE) model splits its feed-forward layers into parallel copies called experts, and a small router picks a few per token.

Llama 3.1 405B is dense: all 405B parameters are active for every token. Mixtral 8x7B is MoE: each layer holds eight expert feed-forward blocks and a router selects two per token. Attention layers are shared rather than duplicated, which is why eight copies of a 7B model total 47B and not 56B.

The [Mixtral paper](https://arxiv.org/abs/2401.04088) states the design goal cleanly: raising the expert count while holding the number selected per token fixed grows parameter count while keeping computational cost effectively constant. Capacity grows, arithmetic does not.

## What are total vs active parameters?

Total parameters are how much model exists. Active parameters per token are how much of that model runs for a given token. In a dense model the two are identical. In an MoE model the active count is a fraction of the total.

Mixtral 8x7B is the canonical example: 47B parameters available to each token, 13B active during inference. It matched or beat Llama 2 70B across most benchmarks while using roughly 5x fewer active parameters. Current models push the ratio much further:

| Model | Total params | Active per token | Ratio |
|---|---|---|---|
| Mixtral 8x7B | 47B | 13B | 3.6:1 |
| gpt-oss-120b | 116.8B | 5.1B | 23:1 |
| Qwen3.8-Flash-Next | 125B (plus 51B N-gram) | 6B | 21:1 |
| DeepSeek-V3 | 671B | 37B | 18:1 |
| Kimi K3 | 2.8T | 104B | 27:1 |

The takeaway: sparsity ratios have gone from under 4:1 in 2023 to nearly 30:1 in 2026. Sources: [Mixtral paper](https://arxiv.org/abs/2401.04088), [gpt-oss-120b model card](https://huggingface.co/openai/gpt-oss-120b), [vLLM Qwen3.8-Flash-Next recipe](https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next), [DeepSeek-V3 repository](https://github.com/deepseek-ai/DeepSeek-V3), [Kimi K3 model card](https://huggingface.co/moonshotai/Kimi-K3). Figures as of September 2026.

Two counts need care. DeepSeek-V3's main model is 671B, but the published checkpoint is 685B because it includes a 14B multi-token-prediction module. Qwen3.8-Flash-Next is quoted as 125B, 176B, or 180B depending on whether its 51B N-gram table and 4B MTP head are counted. Read the model card before sizing anything.

## Do you size GPUs by total or active parameters?

Size by total parameters. The [Mixtral paper](https://arxiv.org/abs/2401.04088) says so directly: the analysis of active parameters reflects inference compute cost and does not account for memory cost, and memory cost for serving Mixtral is proportional to its 47B total. Every expert must be resident, because the router can select any combination on any token.

| Question | Which number answers it | Why |
|---|---|---|
| How many GPUs do I need? | Total parameters | All weights must be loaded and addressable |
| What is my compute cost per token? | Active parameters | Idle experts consume no FLOPs |
| What will loading the model cost? | Total parameters | Full checkpoint moves from disk to VRAM |
| How fast will tokens come out? | Both | Active sets the arithmetic, total sets what must be resident |

The takeaway: MoE cuts your compute bill, not your memory bill. Teams that plan capacity from the active number find the model will not load at all.

One honest caveat on speed. [GPU Compute vs Memory Bandwidth](/the-bid/gpu-compute-vs-bandwidth-2026/) showed token generation is usually limited by memory bandwidth rather than math, so a lower active count does not translate one-for-one into faster tokens. The Mixtral authors flag two specific costs: the routing mechanism itself adds overhead, and running more than one expert per device increases memory loads. They conclude MoE suits batched workloads where arithmetic intensity is high, which is the same threshold that piece described.

## Why does a sparse model still need so much VRAM?

Because sparsity governs which weights compute, not which weights exist. Kimi K3 is the clearest demonstration to date.

Moonshot AI's [K3](https://huggingface.co/moonshotai/Kimi-K3) routes each token to 16 of 896 experts, about 104B active out of 2.8 trillion, using MXFP4 weights from quantization-aware training. Per token it does roughly the arithmetic of a 104B model, and Moonshot still recommends supernode configurations with 64 or more accelerators.

So K3 prices per token like a mid-size model and deploys like the largest open model shipped. Nothing about the 27:1 ratio changes the footprint. Documented deployments across the range, from each model's own maintainers:

| Model | Checkpoint size | Documented deployment |
|---|---|---|
| gpt-oss-120b | 60.8 GiB (MXFP4) | Single 80 GB GPU |
| Qwen3.8-Flash-Next | 172.78 GiB (FP8) | TEP8 on 8x H200, or TP2 minimum on GB300 |
| DeepSeek-V3 | FP8 weights, 671B main | Reference demo runs 2 nodes at 8 GPUs each |
| Kimi K3 | MXFP4, 2.8T | 64+ accelerators recommended |

The takeaway: a 117B model fits on one GPU and a 125B model needs eight, because total footprint and precision decide, not the headline parameter count.

## How many GPUs do you need to run a 70B or 405B model?

At BF16, a 70B model's ~140GB floor fits on two 80GB GPUs (H100/A100) or one 141GB H200; a 405B model's ~810GB floor needs at least six H200s or ten 80GB GPUs. That is a bare-weights minimum with zero room for KV cache, activations, or the parallelism scheme the model actually ships with, so treat it as a starting point, not an order.

The formula above gives a floor, not an answer. Qwen3.8-Flash-Next makes the gap concrete.

Its FP8 checkpoint is 172.78 GiB, which by arithmetic alone would fit inside two H200s. The [vLLM recipe](https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next) instead documents TEP8 across eight H200s, and notes plain TP8 is incompatible with the checkpoint's 128-wide quantization blocks. Parallelism strategy and kernel constraints decide the configuration, not just capacity.

That model also bends the "everything must be in VRAM" rule. Its 51B N-gram embedding table can be asynchronously offloaded to host memory, needing at least 51 GB of system RAM instead of GPU memory. Lookup-style parameters with little per-token compute are the exception: the weights doing matrix multiplications still have to be on the GPU.

The practical sequence: compute the floor from total parameters and precision, add headroom for KV cache and activations, then check the maintainer's validated recipe before ordering anything.

Sizing to total parameters means you are usually buying memory rather than FLOPs, and the two are not priced proportionally. GPU rental rates vary widely by provider, so an eight-GPU H200 configuration is a rate you compare, not a fixed number. Our [H100 rental price roundup](/the-bid/h100-rental-price-2026-cost-per-hour/) found rates spanning roughly \$2 to \$12 per GPU-hour as of August 2026, a 6x spread on identical silicon.

## FAQ

**How much GPU memory do I need to run a 70B or 405B parameter LLM?** Multiply total parameters by bytes per parameter: at BF16 (2 bytes) a 70B model needs about 140 GB and a 405B model needs about 810 GB, before KV cache and activations. At FP8 those numbers halve to roughly 70 GB and 405 GB. Add headroom on top, since weights are only the floor.

**How many GPUs do I need to run a 70B or 405B parameter model?** At BF16, a 70B model's ~140GB weight floor fits on two 80GB GPUs (H100/A100) or one 141GB H200, and a 405B model's ~810GB floor needs at least six H200s or ten 80GB GPUs. That's a bare-weights minimum with no room for KV cache, activations, or the parallelism scheme the model ships with — real deployments typically run more GPUs than the floor implies, so check the maintainer's validated recipe before ordering hardware.

**What is the difference between total and active parameters in an LLM?** Total parameters are every weight in the model. Active parameters are the subset that actually runs for a given token. Dense models have identical total and active counts. MoE models route each token through a router that picks a few experts, so active parameters are often 3% to 30% of the total — Mixtral 8x7B activates 13B of its 47B total per token.

**Does a mixture-of-experts (MoE) model need less VRAM than a dense model?** No. An MoE model needs memory proportional to its total parameters, because the router can select any expert on any token and all experts must be resident in GPU memory. The Mixtral paper states memory cost for serving the model is proportional to its 47B total, not its 13B active count. Sparsity reduces compute, not footprint.

**How do I calculate GPU memory requirements for a model?** Multiply total parameters by bytes per parameter: 2 for BF16, 1 for FP8, 0.5 for 4-bit. Add headroom for KV cache and activations. Then check the maintainer's published checkpoint size, since mixed-precision models rarely match the naive figure, and confirm against their validated serving recipe before ordering hardware.

**Why do MoE models activate only a small fraction of their parameters?** Because quality scales with total capacity while inference cost scales with active compute. Raising the expert count while holding the number selected per token fixed grows the model's capacity without growing its arithmetic. Ratios have risen from roughly 3.6:1 in Mixtral 8x7B to about 27:1 in Kimi K3.

**Do fewer active parameters make an MoE model faster to run?** Not proportionally. Token generation is usually limited by memory bandwidth, not math, and the Mixtral authors note that routing adds overhead while running multiple experts per device increases memory loads. They describe MoE as best suited to batched workloads that reach good arithmetic intensity — the same threshold that determines whether you're compute- or bandwidth-bound in general.
