---
title: "Qwen3.8-Flash-Next GPU Requirements, Context & Benchmarks (2026)"
pubDate: 2026-08-26
lastUpdated: 2026-08-26
author: "Sandeep Narahari, Contributor"
description: "Qwen3.8-Flash-Next is 180B total / 6B active, 262K native context (1M with YaRN). FP8 is 173 GiB — here’s the GPU math, benchmarks, and cloud cost."
tags: ["Guides"]
bannerImage: ./banner.webp
draft: false
faqAccordion: true
---

*Last updated: August 2026*

Qwen3.8-Flash-Next is Alibaba's open-weight preview of the architecture behind Qwen4: a 180B-parameter hybrid model that activates only 6B parameters per token, natively handles 262,144 tokens of context (extensible to 1,000,000), and needs a multi-GPU cluster, not a single card, to serve at full precision — a quantized GGUF build is the only way around that, at a quality cost. Source: [Hugging Face model card](https://huggingface.co/Qwen/Qwen3.8-Flash-Next), [Unsloth docs](https://unsloth.ai/docs/models/qwen3.8-next).

**TL;DR**

- 180B total parameters (125B language model + 51B n-gram embedding + 4B multi-token prediction), with only 6B activated per token.
- 262,144-token native context, extensible to 1,000,000 tokens via YaRN scaling.
- The FP8 checkpoint is 172.78 GiB; BF16 is 335.28 GiB. Plan for a minimum of TP2 on a GB300 node or TEP8 on an 8x H200 node — or skip GPUs entirely with a quantized GGUF build on 96GB+ of CPU/unified memory.
- Introduces three new architectural pieces: Qwen Sparse Attention (QSA), Gated Residual connections, and n-gram embedding for cheap parameter scaling.
- It's a research preview, not the production model. The hosted Qwen3.8-Flash (via Qwen Cloud) ships with 1M context by default and built-in tools.

## What is Qwen3.8-Flash-Next?

Qwen3.8-Flash-Next is the first open-weight release built on the architecture Alibaba's Qwen team plans to carry into Qwen4. It's a causal language model with a vision encoder, meaning it handles text, image, and video input in the same chat interface, and it's designed around a specific bet: that further scaling needs new architecture, not just more layers ([Qwen blog](https://qwenlm.github.io/)).

The model card frames this directly as an efficiency move: as parameter counts and context windows keep growing industry-wide, Qwen3.8-Flash-Next targets more capability per activated parameter and per byte of KV cache, rather than more capability per total parameter.

At a glance, the language model has:

| Spec | Value |
|---|---|
| Total parameters | 180B (125B LM + 51B n-gram embedding + 4B MTP) |
| Activated parameters per token | 6B |
| Layers | 48 |
| Hidden dimension | 2,560 |
| Vocabulary | 248,320 tokens |
| MoE experts | 512 total, 10 routed + 1 shared active |
| License | qwen-community-1.0 |
| Modality | Text, image, video in; text out |

Source: [Hugging Face model card](https://huggingface.co/Qwen/Qwen3.8-Flash-Next). Takeaway: the 6B active-parameter figure is what makes inference fast, but it does not shrink the memory footprint. All 512 experts, and the 51B-parameter n-gram embedding table, still have to be addressable at serving time, which is what drives the GPU requirements below.

## The three architectural changes that define it

Qwen Sparse Attention (QSA), paired with Gated DeltaNet in a 3:1 ratio across the network's 12 blocks, replaces token-level selection with micro-block-level selection, which Qwen's team says cuts long-context latency as agentic workloads push average sequence lengths up.

Gated Residual connections replace a single residual stream with four branches, each modulated by a data-dependent read gate and a per-branch scalar write gate, adding expressiveness across layers without the inference cost of a wider hidden dimension.

N-gram embedding indexes 20 million bigrams and trigrams into a 51B-parameter lookup table at layer 2. Because embedding lookups are cheap to compute and easy to offload to host memory, this gives the model a way to scale parameters that doesn't compete with MoE for GPU-side compute or bandwidth. The tradeoff: you need at least 51GB of host RAM, plus runtime headroom, if you offload this table off the GPU ([vLLM Recipes](https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next)).

For background on why parameter count alone doesn't tell you what hardware a model needs, see our [Kimi K3 vs GLM-5.2 vs DeepSeek-V4-Flash-0731 self-host guide](/bits/kimi-k3-vs-glm-5-2-vs-deepseek-v4-flash-0731-self-host-guide/), which works through the same math for three other frontier open-weight MoE models.

## What GPU requirements does Qwen3.8-Flash-Next have?

Qwen3.8-Flash-Next needs a multi-GPU node for either supported precision. The FP8 checkpoint is 172.78 GiB and the BF16 checkpoint is 335.28 GiB, both well past what a single 80GB or 141GB accelerator can hold.

| Precision | Checkpoint size | Minimum validated config | Recommended config |
|---|---|---|---|
| FP8 | 172.78 GiB | TP2 on GB300 | TP4 on GB300 (full-tray), or TEP8 on 8x H200 |
| BF16 | 335.28 GiB | TP2 on GB300 (~190 GiB/GPU) | — |

Source: [Qwen3.8-Flash-Next vLLM Recipe](https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next).

A few details matter more than the top-line numbers:

- On 8x H200 nodes, plain tensor parallelism (TP8) does not work with the official FP8 checkpoint, because its 128-wide quantization blocks are incompatible with that split. The recipe calls for TEP8 — tensor parallelism combined with expert parallelism — to serve it on Hopper-generation hardware.
- Enable expert parallelism on top of tensor parallelism to get usable throughput out of the 512-expert MoE layer.
- Reserve at least 51GB of host memory separately from GPU VRAM if you're offloading the n-gram embedding table, plus runtime headroom on top of that.
- TP2 is a floor, not a target. It's the minimum validated deployment on GB300; TP4 is what Qwen's own team recommends for a full-tray production configuration, including with multi-token prediction enabled.

One distinction worth flagging: the recipe's "GB300" configuration refers to NVIDIA's rack-scale GB300 NVL72 system, a liquid-cooled, 72-GPU Grace Blackwell design, which is a different product from the standalone 8-GPU, air-cooled B300 (DGX B300) that GPU marketplaces currently list (see our [B300's 288GB VRAM guide](/bits/b300-288gb-vram-ai-workloads-2026/)). If you're pricing out a GB300 NVL72-class deployment specifically, confirm with your provider whether that's what's actually on offer versus standalone B300 nodes; the TEP8 8x H200 path is the more broadly available option today.

Takeaway: if your team doesn't already own a multi-GPU H200 or Blackwell-class node, buying the hardware to self-host Qwen3.8-Flash-Next at full precision is a six-figure capital decision. Renting a matching cluster by the hour, on a GPU cloud, is the practical path for most teams evaluating the model.

## Is there a single-machine option? Quantized GGUF and CPU offload

The multi-GPU requirement above applies to the official FP8 and BF16 checkpoints served through vLLM. Unsloth publishes quantized GGUF builds that trade accuracy for a much smaller footprint, runnable on CPU or unified memory through llama.cpp instead of a GPU cluster:

| Quantization | Memory required |
|---|---|
| 1-bit | 75 GB |
| 2-bit | 79 GB |
| 3-bit | 90 GB |
| 4-bit | 112 GB |
| 5-bit | 200 GB |
| 8-bit | 270 GB |
| BF16 | 355 GB |

Source: [Unsloth Qwen3.8-Flash-Next docs](https://unsloth.ai/docs/models/qwen3.8-next). Unsloth recommends at least 96GB of RAM or unified memory for reliable operation, and notes the n-gram/PLE layers need a minimum of 4-bit quantization because of their random-access lookup pattern — they don't compress as cleanly as the dense transformer weights. Takeaway: this is a genuinely different deployment path from the GPU-cluster numbers above, not a smaller version of the same one. A single high-RAM Mac Studio or workstation can run the model at 1- to 4-bit, at a real quality cost, without touching a multi-GPU node at all.

Two capabilities Unsloth's docs surface that aren't on the base model card: Qwen3.8-Flash-Next is a "hybrid thinking" model with adjustable reasoning effort (`xhigh`, `medium`, `low`), and it preserves reasoning traces across conversation turns rather than discarding them between messages.

## How long is Qwen3.8-Flash-Next's context window?

Qwen3.8-Flash-Next supports 262,144 tokens of native context and can be extended to 1,000,000 tokens using YaRN, a rotary position embedding scaling technique supported in vLLM, SGLang, and TokenSpeed.

Two things to plan around if you extend to the full 1M window:

- **Output length budgets.** Qwen's own guidance for agentic tasks within a 1M context is to allow up to 262,144 tokens for reasoning content and up to 131,072 tokens for the final response, on frameworks that separate the two.
- **Static scaling has a cost.** Every current open-source framework implements YaRN as a static scaling factor, meaning it doesn't adapt to input length automatically. Qwen's team recommends only enabling it when you actually need the longer context, since it can measurably hurt performance on shorter texts, and tuning the factor value to your typical context length rather than defaulting to the max.

Longer context also changes the GPU math beyond weights: KV cache grows separately from the model checkpoint and can dominate memory at long context. See our [H100 vs H200 for Long-Context LLMs](/bits/h100-vs-h200-long-context-llms/) and [B300's 288GB VRAM](/bits/b300-288gb-vram-ai-workloads-2026/) guides for the KV-cache arithmetic worked through on comparable hardware.

## How does Qwen3.8-Flash-Next perform on benchmarks?

Qwen3.8-Flash-Next leads or ties its comparison set on most agentic and coding benchmarks Alibaba published, despite activating fewer parameters than every model it's compared against except DeepSeek-V4-Flash-0731. All figures below are first-party, from the Hugging Face model card; independent, third-party reproductions were not available at the time of writing.

| Benchmark | Qwen3.8-Flash-Next | Qwen3.8-27B | Qwen3.7-Plus | DeepSeek-V4-Flash-0731 | Claude Opus 4.6 (Max) |
|---|---|---|---|---|---|
| Params (activated) | 125B (6B) | 27B (27B) | 397B (17B) | 284B (13B) | — |
| Agentic coding (DeepSWE 1.1) | 58.7 | 42.2 | 16.5 | 54.4 | — |
| SWE-bench Pro | 62.5 | 61.7 | 55.8 | 56.0 | 53.4 |
| SWE-bench Multilingual | 81.0 | 73.8 | 75.8 | — | 77.5 |
| Long-horizon office work (CoWorkBench) | 73.9 | 70.7 | 65.1 | 45.1 | 68.2 |
| Professional job tasks (JobBench) | 55.7 | 33.4 | 27.6 | 41.3 | 36.6 |
| Real-world tool use (Toolathlon) | 73.5 | 67.1 | 50.6 | 70.3 | — |
| Instruction following (IFBench) | 81.3 | 79.5 | 79.1 | 79.2 | 62.5 |
| Scientific reasoning (GPQA Diamond) | 91.7 | 89.2 | 90.3 | 90.8 | 91.3 |
| Multidisciplinary reasoning (HLE) | 35.9 | 30.8 | 34.7 | 33.8 | 40.0 |
| Competitive coding (LiveCodeBench v6) | 91.9 | 90.3 | 89.6 | 90.6 | 88.8 |

Source: [Hugging Face model card](https://huggingface.co/Qwen/Qwen3.8-Flash-Next); methodology notes (harness, temperature, context window per benchmark) are documented there.

On vision-language tasks, the pattern holds: Qwen3.8-Flash-Next posts the top score on 8 of 10 published multimodal benchmarks, including computer-use tasks (OSWorld 2.0 partial score of 52.3) and mobile-agent tasks (AndroidWorld, 84.5), against Qwen3.8-27B, Qwen3.7-Plus, and Claude Opus 4.6 (Max).

Takeaway: the benchmark gap over Qwen3.8-27B is largest on agentic and tool-use tasks (JobBench: 55.7 vs. 33.4), which tracks with what the architecture is built for — long-horizon, tool-heavy workloads, rather than raw reasoning, where the gap to Claude Opus 4.6 (Max) is narrower or reversed (HLE, GPQA Diamond).

## Qwen3.8-Flash-Next vs. Qwen3.8-27B vs. Qwen3.7-Plus: which should you deploy?

Is Qwen3.8-Flash-Next the right size for your workload? Usually not if you need single-GPU deployment — Qwen3.8-27B is the better fit there, per Qwen's own published specs. Flash-Next's single-machine option is CPU/unified memory via a quantized GGUF build, not a GPU.

| | Qwen3.8-Flash-Next | Qwen3.8-27B | Qwen3.7-Plus |
|---|---|---|---|
| Total params | 180B | 27B dense (HF lists 28B) | 397B |
| Activated params | 6B | 27B (dense) | 17B |
| Architecture | Hybrid MoE + n-gram embedding | Dense, hybrid attention | Dense |
| Typical hardware | Multi-GPU (TP2-TP8), or quantized GGUF on 96GB+ CPU/unified memory | Single 80GB GPU, FP8 build ~28GB | Multi-GPU, larger cluster than Flash-Next |
| License | qwen-community-1.0 | Apache 2.0 | Not yet confirmed |
| Best fit | Agentic/tool-use workloads at scale | Local dev, single-GPU coding agents | Highest raw dense-model capability |

Sources: Qwen3.8-Flash-Next model card; our [Qwen3.8-27B: Managed API vs Self-Hosting](/bits/qwen3-8-27b-managed-api-vs-self-hosting-gpu-cloud/) post, which measured Qwen3.8-27B's FP8 build at roughly 28GB, comfortably fitting one H100 or A100 80GB.

Takeaway: Qwen3.8-27B is the model to prototype with locally; Qwen3.8-Flash-Next is the model to put behind a production agent stack once you've validated the workflow, since its MoE routing gives it much stronger agentic scores per activated parameter than the dense 27B, at the cost of needing a real multi-GPU deployment.

For the full single-GPU cost breakdown, including the token volume where self-hosting Qwen3.8-27B beats a managed API, see [Qwen3.8-27B: Managed API vs Self-Hosting on GPU Cloud (2026)](/bits/qwen3-8-27b-managed-api-vs-self-hosting-gpu-cloud/).

## Can you deploy Qwen3.8-Flash-Next on GPU cloud?

Yes. Since a single accelerator can't hold either checkpoint, most teams evaluating Qwen3.8-Flash-Next will rent a matching multi-GPU node rather than buy one.

Using live rates from Akash's GPU marketplace, checked August 20, 2026, H200 SXM5 (141GB) starts at \$4.45 per GPU-hour ([NVIDIA H200 GPU Guide 2026](/bits/nvidia-h200-gpu-guide-2026-specs-benchmarks-pricing/)), and B300 (288GB, the standalone DGX B300 part) has been listed from \$6.00 per GPU-hour as a starting rate, checked August 7, 2026, though it doesn't yet have a dedicated self-serve availability page the way H100, H200, and A100 do, so treat it as a rate to confirm via a custom quote rather than guaranteed instant capacity ([Kimi K3 vs GLM-5.2 vs DeepSeek-V4-Flash-0731 self-host guide](/bits/kimi-k3-vs-glm-5-2-vs-deepseek-v4-flash-0731-self-host-guide/)).

Rough monthly cost at these starting rates, running 24/7 (730 hours):

| Config | GPUs | Rate used | Hourly | Monthly (730 hrs) |
|---|---|---|---|---|
| TEP8, 8x H200 (FP8) | 8 | \$4.45/GPU-hr | \$35.60 | ~\$25,988 |
| TP2, 2x B300 (FP8, minimum) | 2 | \$6.00/GPU-hr | \$12.00 | ~\$8,760 |
| TP4, 4x B300 (FP8, full-tray) | 4 | \$6.00/GPU-hr | \$24.00 | ~\$17,520 |

These are starting rates on live GPU marketplaces, not fixed prices; reverse-auction pricing on [Akash](/pricing/gpus/) moves with supply and demand, so confirm current rates before budgeting. B300 in particular is worth a capacity check first, since availability, not price, is the binding constraint right now.

Takeaway: whether Qwen3.8-Flash-Next is worth self-hosting versus calling through Qwen Cloud's API comes down to your request volume and whether you need the preserved-thinking, agentic-context features that come with running the open weights directly. A GPU marketplace removes the capital cost from that decision by letting you rent the exact multi-GPU shape the model needs, by the hour, instead of buying an eight-figure cluster upfront.

For a broader look at what to rent when a workload doesn't need the largest GPU on the market, see [B300's 288GB VRAM: Which AI Workloads Actually Benefit From It](/bits/b300-288gb-vram-ai-workloads-2026/) and [NVIDIA B300 vs B200 vs H200: Best GPU for Self-Hosting AI Models](/bits/nvidia-b300-vs-b200-vs-h200-best-gpu-for-self-hosting-ai/). For the economics of running a fixed-cost GPU against per-token API billing, see [Qwen3.8-27B: Managed API vs Self-Hosting on GPU Cloud](/bits/qwen3-8-27b-managed-api-vs-self-hosting-gpu-cloud/), which works the same math for Qwen3.8-27B and applies the same way at Flash-Next's larger scale.

## FAQ

**Is Qwen3.8-Flash-Next open source?** Yes, weights are published on Hugging Face under the qwen-community-1.0 license. It's an experimental preview of the architecture planned for Qwen4, not a finished production release, and Alibaba positions the hosted Qwen3.8-Flash (via Qwen Cloud) as the production version with more built-in features.

**How many parameters does Qwen3.8-Flash-Next have?** 180 billion total: 125B in the core language model, 51B in a new n-gram embedding table, and 4B in multi-token prediction layers. Only 6B parameters activate per token, but all 180B must be resident in memory (or offloaded to host RAM) to serve the model.

**Can Qwen3.8-Flash-Next run on a single GPU?** Not the official FP8 or BF16 checkpoint through vLLM — the smallest, FP8, is 172.78 GiB, larger than any single accelerator currently ships with. The minimum validated GPU deployment is two GPUs (TP2 on GB300); an 8-GPU H200 node with expert parallelism is the recommended path on Hopper-generation hardware. The one path that skips GPUs entirely is a quantized GGUF build from Unsloth, running on CPU or unified memory instead, at a quality cost.

**Can Qwen3.8-Flash-Next run without a GPU at all?** Yes, at a quality cost. [Unsloth](https://unsloth.ai/docs/models/qwen3.8-next) publishes quantized GGUF builds running on CPU or unified memory via llama.cpp, from 75GB at 1-bit up to 355GB at BF16, with 96GB of RAM recommended as a practical minimum. The n-gram/PLE lookup layers need at least 4-bit quantization since their random-access pattern compresses worse than the dense transformer weights.

**Does Qwen3.8-Flash-Next support extended thinking?** Yes. Per [Unsloth's docs](https://unsloth.ai/docs/models/qwen3.8-next), it's a hybrid thinking model with adjustable reasoning effort (`xhigh`, `medium`, `low`), and it preserves reasoning traces across conversation turns instead of discarding them between messages — a feature not called out on the base Hugging Face model card.

**What's the difference between Qwen3.8-Flash-Next and Qwen3.8-Flash?** Qwen3.8-Flash-Next is the open-weight research preview on Hugging Face. Qwen3.8-Flash is the managed, production version of the same architecture served through Qwen Cloud, with 1,000,000-token context enabled by default and built-in tool support, rather than the 262,144-token native window of the open checkpoint.

**What is Qwen Sparse Attention (QSA)?** QSA is the attention mechanism Qwen3.8-Flash-Next uses in one of every four transformer blocks, paired with Gated DeltaNet in the other three. Instead of selecting individual tokens to attend to, it selects at the micro-block level, which Qwen's team reports significantly cuts latency on long-context, agentic workloads.

**Does Qwen3.8-Flash-Next support image and video input?** Yes. It's a causal language model with a vision encoder, listed on Hugging Face under the image-text-to-text task, and it accepts text, image URLs, and video URLs in the same chat message through the standard OpenAI-compatible API.

**How does Qwen3.8-Flash-Next compare to DeepSeek-V4-Flash-0731?** On Alibaba's published benchmarks, Qwen3.8-Flash-Next leads on most coding and agentic tasks (SWE-bench Pro: 62.5 vs. 56.0; JobBench: 55.7 vs. 41.3) while activating fewer parameters (6B vs. 13B). DeepSeek-V4-Flash-0731 scores higher on repo-level code generation (NL2Repo-Bench: 54.2 vs. 48.1). DeepSeek-V4-Flash-0731 also has the smaller footprint of the two: 156.4GB versus Qwen3.8-Flash-Next's 172.78GB FP8 checkpoint (see our [Kimi K3 vs GLM-5.2 vs DeepSeek-V4-Flash-0731 self-host guide](/bits/kimi-k3-vs-glm-5-2-vs-deepseek-v4-flash-0731-self-host-guide/)).
