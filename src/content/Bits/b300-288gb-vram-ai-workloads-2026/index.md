---
title: "B300's 288GB VRAM: Which AI Workloads Actually Benefit From It in 2026?"
pubDate: 2026-08-24
lastUpdated: 2026-08-24
author: "Sandeep Narahari, Contributor"
description: "The B300's 288GB of HBM3e helps three workloads: long-context inference at high concurrency, single-GPU serving of 235B to 428B-class models, and mid-size full fine-tuning. Below that band, an H200 or H100 does the same job for less."
tags: ["Guides"]
bannerImage: ./banner.webp
draft: false
faqAccordion: true
---

*By Sandeep Narahari, Contributor. Last updated: August 2026.*

Three workloads justify the B300's 288GB: long-context inference at high concurrency, single-GPU serving of roughly 235B to 428B-parameter models, and full fine-tuning in the 8B to 16B range. Below that band, the extra memory sits idle while you pay for it.

## TL;DR

- The B300, NVIDIA's official name for the chip is Blackwell Ultra, ships with [288GB of HBM3e per GPU](https://docs.nvidia.com/dgx/dgxb300-user-guide/introduction-to-dgxb300.html), reached through 12-high memory stacks rather than the prior generation's 8-high stacks. [Memory bandwidth holds steady at 8 TB/s](https://www.theregister.com/2025/03/18/nvidia_blackwell_ultra/), the same as the previous Blackwell generation.
- NVIDIA states [DGX B300 delivers 1.5x the dense FP4 performance and 2x the attention performance of DGX B200](https://www.nvidia.com/en-us/data-center/dgx-b300/). That compute uplift is tied to NVFP4, a 4-bit format that [only runs on Blackwell Tensor Cores](https://research.nvidia.com/labs/eai/blogs/pushing-intelligence-to-4-bit/).
- The clearest case for 288GB is KV cache headroom on long-context serving. A 70B-class model at 128K context needs roughly 43GB of KV cache per sequence in BF16. One B300 has room for roughly 10 such sessions at once with an FP8 cache; one H200 has room for about 3.
- Request B300 on [Akash](https://akash.network/pricing/gpus/) through the [GPUs on demand](https://akash.network/gpus-on-demand/) form for the 235B-to-428B and long-context workloads described here.
- If your model fits in 141GB and your context stays under 32K, an H200 or H100 does the same job without paying for capacity you will not use.

## Which AI Workloads Actually Benefit From the B300's 288GB?

Each workload below benefits because a specific memory term, not raw compute, is what limits it. The table is the short answer; the sections after it work through the arithmetic.

| Workload | What binds the memory | Does 288GB help? | Alternative if it does not |
|---|---|---|---|
| Long-context inference, 128K+ tokens, many concurrent sessions | KV cache, scales linearly with context x concurrent sessions | Yes, the largest single win | H200 141GB with an FP8 KV cache |
| Serving a ~235B to ~428B model at FP8 on one GPU | Model weights | Yes, removes tensor parallelism entirely | 2x H200 with tensor parallelism |
| Full fine-tuning an 8B to 16B model | Optimizer states, roughly 16 bytes per trainable parameter | Yes, keeps the run on one GPU | 2x H200, or LoRA on one H100 |
| Serving models under ~235B at FP8 | Model weights | No | H100 80GB or an H200 sized to the model |
| Frontier MoE models above 1T parameters | Model weights across many GPUs regardless of per-GPU capacity | Not decisive on its own | Interconnect topology matters more than per-GPU memory |

The pattern: 288GB is a middle-band solution. Below the band, a smaller card wins on cost per token. Above the band, you are running multi-GPU either way, and NVLink domain size decides more than what any single card holds.

## Does Long-Context Inference Benefit From the B300's 288GB?

Long-context inference is the clearest case, because KV cache grows linearly with context length and concurrent sessions, and quickly outgrows the model weights themselves.

The KV cache size for one sequence is `2 x layers x kv_heads x head_dim x tokens x bytes_per_element`. Applying that formula to a Llama-3.1-70B-class architecture using grouped-query attention (80 layers, 8 KV heads, 128 head dimension) gives the following per-sequence footprint:

| Context length | KV cache, BF16 | KV cache, FP8 |
|---|---|---|
| 32K tokens | 10.7 GB | 5.4 GB |
| 128K tokens | 42.9 GB | 21.5 GB |
| 256K tokens | 85.9 GB | 42.9 GB |
| 1M tokens | 343.6 GB | 171.8 GB |

These are calculated figures from the formula above, not a measured benchmark. Now apply it: take a 70B-class model at FP8 (about 70GB of weights) and reserve roughly 8GB for activations and framework overhead. What's left is the cache pool:

| GPU | VRAM | Free for KV cache | Concurrent 128K sessions (FP8 cache) |
|---|---|---|---|
| H100 SXM5 | 80 GB | 2 GB | Effectively zero |
| H200 SXM5 | 141 GB | 63 GB | About 3 |
| B300 | 288 GB | 210 GB | About 10 |

Roughly 3x the concurrency is the entire memory-side argument for the B300 on this workload. It only pays off if you actually keep the card saturated with real traffic; four concurrent sessions on a B300 leaves most of the extra capacity idle. See our [H100 vs H200 for long-context LLMs breakdown](/bits/h100-vs-h200-long-context-llms/) for the same arithmetic worked through the H100/H200 pair in more depth, including vLLM's actual memory-allocation formula.

## Which Models Fit on One B300 That Do Not Fit on One H200?

At FP8 with roughly 15% headroom for KV cache and activations, one B300 holds a model up to roughly 245B parameters and one H200 holds roughly 120B. The band the B300 uniquely owns as a single GPU sits around 235B to 428B parameters at FP8, published as open weights by several labs through 2026.

| Model | Total params (published) | Active params | GPUs at FP8: B300 / H200 |
|---|---|---|---|
| Qwen3-235B-A22B | 235B | 22B | 1 / 2 |
| MiniMax M3 | 428B | ~23B | 2 / 4 |
| GLM-5.2 | ~744-753B | ~40B | 4 / 7 |
| DeepSeek-V4-Flash | 284B | 13B | 2 / 3 |
| DeepSeek-V4-Pro | 1.6T | 49B | 7 / 14 |
| Kimi K3 | 2.8T | 104B | 12 / 24 |

Sourcing on these figures: Qwen3-235B-A22B's parameter count comes from [an MoE speculative-decoding paper on arXiv that lists it as a 235B-total, 22B-active, 8-of-128-expert model](https://arxiv.org/pdf/2605.00342). MiniMax M3's 428B total and roughly 23B active parameters appear on [MiniMax's own Hugging Face model card](https://huggingface.co/MiniMaxAI/MiniMax-M3). GLM-5.2's parameter count has two official figures worth noting: [Z.ai's own Hugging Face organization page states the GLM-5 family scales up to 744B total, 40B active](https://huggingface.co/zai-org/GLM-5), while [NVIDIA's own quantized checkpoint of GLM-5.2 lists 753B total parameters](https://huggingface.co/nvidia/GLM-5.2-NVFP4). Both are official; the small gap likely reflects rounding or a minor version difference and does not affect which memory tier the model needs. [NVIDIA's own developer blog gives DeepSeek-V4-Pro as 1.6T total / 49B active and DeepSeek-V4-Flash as 284B total / 13B active](https://developer.nvidia.com/blog/build-with-deepseek-v4-using-nvidia-blackwell-and-gpu-accelerated-endpoints/), both with 1M-token context support. Kimi K3's 2.8T total and 104B active parameters, activating 16 of 896 experts per token, are consistent across multiple technical write-ups of Moonshot AI's own release materials, including [one hosted on Hugging Face](https://huggingface.co/blog/ResterChed/kimi-k3-model-overview-mxfp4-quantization-open-wei).

Two things stand out. Qwen3-235B-A22B is the clean case: it collapses a two-GPU tensor-parallel deployment into a single card, removing all-reduce traffic from every forward pass. DeepSeek-V4-Flash is the boundary case: at 284GB of FP8 weights, it very nearly fills a single B300's 288GB before you've allocated anything for KV cache, which is a useful illustration of exactly where the ceiling sits. Kimi K3 is the opposite end: at 2.8T total parameters it needs a multi-node cluster regardless of which GPU you pick, so the 288GB only halves the GPU count versus an H200 rather than changing the deployment shape. For a wider spec-by-spec look at where the B300 sits against the B200 and H200 across VRAM, bandwidth, and model fit, see our [B300 vs B200 vs H200 comparison](/bits/nvidia-b300-vs-b200-vs-h200-best-gpu-for-self-hosting-ai/).

## Does NVFP4 Change Any of This?

NVFP4 is a 4-bit floating-point format [built into Blackwell's Tensor Cores](https://research.nvidia.com/labs/eai/blogs/pushing-intelligence-to-4-bit/), and it changes the compute side of the equation, not the memory side. On a B300 running NVFP4, the same VRAM budget holds roughly twice as many parameters as FP8, which is why the model-fit band above roughly doubles if you quantize further. But NVFP4 throughput gains are hardware-gated: [H100, H200, and A100 have no native FP4 Tensor Cores](https://research.nvidia.com/labs/eai/blogs/pushing-intelligence-to-4-bit/), so an FP4 checkpoint run on Hopper saves memory without the speed benefit.

Support has matured quickly. [The vLLM project's own blog reports 26,200 prefill tokens per GPU-second and 10,100 decode tokens per GPU-second on GB200 NVL72](https://blog.vllm.ai/2026/02/03/dsr1-gb200-part1.html) for DeepSeek-style MoE models using NVFP4 GEMM and FP8 GEMM together, a 3-5x improvement over the same team's earlier H200 numbers. [vLLM has also shipped day-0 Kimi K3 serving](https://vllm.ai/blog/tags/performance), and the [SGLang project's own roadmap lists NVFP4 quantization support and Blackwell-specific optimization as active workstreams](https://github.com/sgl-project/sglang/issues/17130). If your serving stack has not moved to NVFP4, the B300 gives you memory capacity and nothing else; the compute uplift is conditional on the quantization format, not automatic.

## Does Fine-Tuning or RL Post-Training Need 288GB?

Full fine-tuning benefits from 288GB in a narrow band, roughly 8B to 16B parameters, because mixed-precision AdamW training holds five things in memory per trainable parameter: FP16 weights, an FP32 master copy, FP16 gradients, and two FP32 optimizer moments. [Academic work deriving this arithmetic for a 7B model](https://arxiv.org/abs/2306.09782) puts full fine-tuning memory at roughly 16 bytes per parameter, about 112GB total.

| Model size | Full fine-tune memory at 16 bytes/param | B300s needed | H200s needed |
|---|---|---|---|
| 7B | 112 GB | 1 | 1 |
| 14B | 224 GB | 1 | 2 |
| 32B | 512 GB | 2 | 4 |
| 70B | 1,120 GB | 4 | 8 |

The 14B row is where 288GB earns its premium: one B300 keeps the run on a single GPU where an H200 forces sharding. Below 14B, an H200 already fits. Above 32B, both cards are multi-GPU, and most teams reach for LoRA or QLoRA instead, which shrinks trainable parameters enough that optimizer state stops being the binding constraint.

RL post-training loops (GRPO-style setups holding a policy model, a reference model, and a rollout engine in memory simultaneously) plausibly land in the same band as full fine-tuning, since three resident copies of a mid-size model push past 141GB well before they push past 288GB. This is reasoning from the architecture of these loops rather than a published memory benchmark, so treat it as directional.

## Which AI Workloads Do Not Benefit From the B300's 288GB?

Most of them. If a workload fits comfortably in 141GB, the B300 adds cost without adding throughput, because dense FP8 throughput on Blackwell Ultra is unchanged from the prior Blackwell generation and memory bandwidth stays at 8 TB/s. The compute and bandwidth gains are specific to NVFP4, not general.

Workloads that see no benefit from the extra capacity:

- Models under roughly 235B parameters at FP8 or lower. These fit an H200 or even an H100 with room to spare.
- Short-context chat and classification. At 4K to 8K tokens the KV cache is a rounding error, and the binding constraint is bandwidth, which the B300 does not improve over prior Blackwell.
- LoRA and QLoRA fine-tuning under 70B. QLoRA on a 70B base peaks around 50GB, comfortably an H100 job.
- Any stack still running BF16 or FP8 only. The B300's headline compute claims are tied to NVFP4. Without quantizing to it, the B300 is a memory upgrade and nothing more.

## What Should You Rent If Your Workload Does Not Need 288GB?

Practical mapping from the workloads above, using tiers Akash currently lists:

- **70B-class model at FP8, 32K context:** H200 141GB at \$4.45/hr, or H100 80GB at \$2.04/hr with an FP8 cache.
- **Mid-size models needing headroom above 80GB:** RTX PRO 6000 at \$2.04/hr.
- **Batch fine-tuning, classical ML, smaller models:** A100 80GB at \$1.07/hr, with over 100 units currently unallocated.
- **Inference without managing infrastructure directly:** AkashML serves open models through a managed endpoint on Akash's decentralized GPUs.
- **Workloads with data-sensitivity requirements:** confidential compute on Akash runs a deployment where the machine's owner cannot inspect it.

## FAQ

**Is the B300 worth it over the H200?** The B300 is worth it when a workload is memory-bound above 141GB: long-context serving at high concurrency, single-GPU inference on roughly 235B-to-428B-parameter models, or full fine-tuning around 14B parameters. For anything that fits in 141GB, an H200 does the same work without the premium.

**How much VRAM does the B300 have?** 288GB of HBM3e per GPU, per NVIDIA's own DGX B300 documentation. That's reached with 12-high HBM3e stacks versus the prior generation's 8-high stacks, a 50% capacity increase, while bandwidth holds at 8 TB/s, unchanged from the prior generation.

**How many concurrent 128K-context sessions can one B300 serve?** Serving a 70B-class model at FP8 with an FP8 KV cache, one B300 has room for roughly 10 concurrent 128K-token sessions, against about 3 on an H200. This is a memory-capacity estimate from the standard KV cache formula, not a measured throughput benchmark, and doesn't account for bandwidth as a separate ceiling.

**Does the B300 run frontier models like Kimi K3 on a single GPU?** No. Kimi K3, at 2.8T total parameters with 104B active per token, needs roughly 12 B300s at FP8 just to hold the weights, so it remains a multi-node deployment regardless of GPU choice. The 288GB halves the GPU count versus an H200 but doesn't change the fact that interconnect topology, not per-GPU memory, is the deciding factor at that scale.

**Do I need NVFP4 to benefit from the B300?** Not for memory capacity, but yes for the compute uplift NVIDIA advertises. Dense FP8 throughput on Blackwell Ultra matches the prior Blackwell generation; the performance gains are specific to NVFP4, which only accelerates on Blackwell Tensor Cores. If your serving stack hasn't moved to it, the B300 is a memory upgrade only.

**Is a B300 air-cooled or does it need liquid cooling?** The 8-GPU DGX B300 system ships in an air-cooled chassis, per NVIDIA's own technical documentation. Liquid cooling becomes necessary at rack scale, specifically in NVIDIA's 72-GPU GB300 NVL72 configuration, where power density is far higher than a single 8-GPU box.
