---
title: "Self-Hosting Guide: Kimi K3.1 Pro vs GLM-5.2 vs DeepSeek-V4-Flash-0731 — 1.56TB of Weights and What It Takes to Serve Them (2026)"
pubDate: 2026-08-06
lastUpdated: 2026-11-07
author: "Sandeep Narahari, Contributor"
description: "How much VRAM to run Kimi K3? 1.56TB for weights alone, plus ~29GB of KV cache at 1M context. Actual checkpoint sizes, GPU counts and licence terms for three open-weight frontier models, updated for Kimi K3.1 Pro."
tags: ["Comparisons", "Alternatives", "Guides"]
bannerImage: ./banner.webp
draft: false
faqAccordion: true
---

_Last updated: November 2026_

Kimi K3.1 Pro, like the Kimi K3 it was post-trained from, occupies 1.56TB on disk, GLM-5.2 occupies 755.6GB in its official FP8 release, and DeepSeek V4 Flash 0731 occupies 156.4GB. That is a 10x spread between the largest and smallest, and it does not track parameter count the way most comparisons assume.

**TL;DR**

- Actual checkpoint sizes: Kimi K3 at 1.56TB, GLM-5.2 at 755.6GB official FP8 (1.507TB if you insist on BF16), DeepSeek V4 Flash 0731 at 156.4GB.
- Parameter count is a bad proxy. Kimi K3 has 3.7x GLM-5.2's parameters but takes only about twice the disk, because K3 ships natively in 4-bit MXFP4 while GLM-5.2's headline checkpoint is 16-bit.
- The 5.6TB figure circulating for Kimi K3 is wrong. It comes from multiplying 2.8T parameters by 2 bytes for BF16, a precision Moonshot never released.
- Hardware floors differ by a factor of eight. K3 wants an 8x B300 node or larger, GLM-5.2 FP8 fits a single 8x [H200](/pricing/gpus/h200/) node, and V4 Flash 0731 fits on 2 H200s or a single RTX 4090 with system RAM.
- License terms are a real decision axis. GLM-5.2 and DeepSeek V4 Flash 0731 are plain MIT. Kimi K3 and K3.1 Pro use custom licenses with revenue-triggered obligations above \$20M.
- Kimi K3.1 Pro keeps K3's weights footprint and swaps its 24 full-attention layers for Gated DSA. At the full 1M-token context it needs only about 29GB of KV cache per sequence, because the other 69 of its 93 layers hold a fixed-size state.

## How much VRAM do you need to run Kimi K3.1 Pro?

About 1.56TB for the weights, plus roughly 29GB of KV cache at the full 1M-token context. That is before framework overhead and activations, so plan for more.

The 1.56TB is measured, not estimated. Kimi K3.1 Pro ships as 96 safetensors shards on [Hugging Face](https://huggingface.co/moonshotai/Kimi-K3.1-Pro) totalling 1,561,293,160,568 bytes. Kimi K3 is within half a gigabyte of that, at 1,560,936,091,448 bytes, so the two models are the same size on disk.

The weights are already 4-bit. Moonshot published them in MXFP4, four-bit floats in groups of 32, so there is no smaller official build to wait for. Not everything is quantized, though. Attention, the shared experts, the dense MLP, the router, the output head, and the vision tower all stay at higher precision, which is part of why a 2.8T model in 4-bit still lands at 1.56TB.

In GPUs, the weights alone need at least:

| GPU                         | VRAM  | Minimum for weights | Practical floor   |
| --------------------------- | ----- | ------------------- | ----------------- |
| [H100](/pricing/gpus/h100/) | 80GB  | 20                  | 24 (3 nodes of 8) |
| [H200](/pricing/gpus/h200/) | 141GB | 12                  | 16 (2 nodes of 8) |
| [B200](/pricing/gpus/b200/) | 180GB | 9                   | 16 (2 nodes of 8) |
| MI300X                      | 192GB | 9                   | 16 (2 nodes of 8) |
| [B300](/pricing/gpus/b300/) | 288GB | 6                   | 8 (1 node)        |

B300 is the only GPU in the table where a single eight-GPU node holds the weights. It leaves about 740GB of its 2.304TB for KV cache and runtime.

## What changed between Kimi K3 and Kimi K3.1 Pro?

The size, the context window, and the parameter counts did not change. The attention layers and the training did.

Both are 2.8T-parameter mixture-of-experts models with 104B activated, 93 layers, and a 1,048,576-token context, and both take text and image input. K3.1 Pro is post-trained from K3 with large-scale joint reinforcement learning, and Moonshot reports gains in coding, 3D creation, financial research, and factual accuracy.

The architectural change is in the 24 full-attention layers. K3 used Gated MLA there. K3.1 Pro replaces them with Gated DeepSeek Sparse Attention, which selects the 2,048 most relevant earlier tokens for each new one rather than attending to all of them. Moonshot's stated reason is more efficient long-context modeling.

For anyone sizing hardware, the practical answer is that a K3 deployment plan carries over to K3.1 Pro unchanged.

## How big are the Kimi K3, GLM-5.2, and DeepSeek V4 Flash 0731 checkpoints?

Kimi K3 is 1,560GB, GLM-5.2 is 755.6GB in its official FP8 release, and DeepSeek V4 Flash 0731 is 156.4GB. These are repository weight sizes only, measured before KV cache, runtime buffers, and operating system overhead, each of which adds materially at long context.

| Model                  | Total params | Active params | Official checkpoint | Size     | License                |
| ---------------------- | ------------ | ------------- | ------------------- | -------- | ---------------------- |
| Kimi K3                | 2.8T         | 104B          | MXFP4 (native)      | 1.56 TB  | Custom Kimi K3 License |
| GLM-5.2                | 753B         | ~40B          | FP8                 | 755.6 GB | MIT                    |
| GLM-5.2 (BF16 variant) | 753B         | ~40B          | BF16                | 1.507 TB | MIT                    |
| DeepSeek V4 Flash 0731 | 284B         | 13B           | MXFP4 + FP8/BF16    | 156.4 GB | MIT                    |

Kimi K3's [Hugging Face repository](https://huggingface.co/moonshotai/Kimi-K3) is public and ungated with 96 downloadable weight shards occupying 1,560,936,091,448 bytes, which is 1.561 TB in decimal units or 1.420 TiB. Kimi K3.1 Pro is the same size: 1,561,293,160,568 bytes across 96 shards, against K3's 1,560,936,091,448. [GLM-5.2's](https://huggingface.co/zai-org/GLM-5.2) official BF16 weights are 1.507 TB and its official FP8 weights are 755.6 GB before KV cache or runtime overhead. [DeepSeek's V4 Flash 0731](https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731) reference checkpoint measures 156.4GB, with [Unsloth's bit-identical lossless GGUF repack](https://huggingface.co/unsloth/DeepSeek-V4-Flash-0731-GGUF) at 161.9GB.

Kimi K3 is 10x the size of DeepSeek V4 Flash 0731, but only 2.1x the size of GLM-5.2's official FP8 release despite carrying 3.7x GLM-5.2's parameters. Checkpoint size is parameter count multiplied by precision format, and across these three models the precision factor varies more than the parameter factor does.

## Why does Kimi K3 take only twice the space of GLM-5.2 despite 3.7x the parameters?

Kimi K3 takes only twice the space of GLM-5.2 because Kimi K3 stores weights at roughly 4.5 bits per parameter while GLM-5.2's official checkpoint stores them at 8 and its BF16 variant at 16. Moonshot's public release is MXFP4 weights with MXFP8 activations rather than a separate BF16 master checkpoint, and K3 was trained with quantization-aware training so the released MXFP4 weights serve natively at 4-bit with no calibration pass required.

Run the arithmetic on effective density and the picture inverts:

| Model                  | Params | Checkpoint size | Bytes per parameter | Effective precision |
| ---------------------- | ------ | --------------- | ------------------- | ------------------- |
| Kimi K3                | 2.8T   | 1.56 TB         | 0.56                | ~4.5-bit            |
| DeepSeek V4 Flash 0731 | 284B   | 156.4 GB        | 0.55                | ~4.4-bit            |
| GLM-5.2 (FP8)          | 753B   | 755.6 GB        | 1.00                | 8-bit               |
| GLM-5.2 (BF16)         | 753B   | 1.507 TB        | 2.00                | 16-bit              |

Kimi K3 and DeepSeek V4 Flash 0731 are almost identical in bytes per parameter, because both were quantization-aware trained with routed experts stored natively in MXFP4. DeepSeek keeps roughly 96% of the model in MXFP4 with the remainder in FP8 or BF16, which is why Unsloth's 8-bit repack comes out only about 7GB larger than its 4-bit one: most of the model was already 4-bit when DeepSeek shipped it.

This is why the widely repeated 5.6TB figure for Kimi K3 is wrong. It comes from multiplying 2.8 trillion parameters by 2 bytes, the BF16 assumption that held for open-weight releases until quantization-aware training became standard at this scale. Moonshot never published a BF16 checkpoint. If you budgeted 5.6TB of storage or GPU memory for K3, you overbought by more than 3.5x.

The practical rule: ask what precision the checkpoint actually ships in before multiplying anything by parameter count.

## How many GPUs do you need to run Kimi K3, GLM-5.2, or DeepSeek V4 Flash 0731?

Kimi K3 needs an 8x B300 node, GLM-5.2 needs 8x H200 to hold its official FP8 weights, and DeepSeek V4 Flash 0731 needs only 2x H200 or a single RTX 4090 paired with system RAM. The table below sizes weights only; add 20% to 40% for KV cache at moderate context, and far more if you intend to use the full million-token windows all three models advertise.

| Model and precision                 | Weights        | Minimum practical node  | Aggregate VRAM             |
| ----------------------------------- | -------------- | ----------------------- | -------------------------- |
| Kimi K3 (MXFP4 native)              | 1.56 TB        | 8x B300                 | 2,304 GB                   |
| GLM-5.2 (FP8 official)              | 755.6 GB       | 8x H200                 | 1,128 GB                   |
| GLM-5.2 (INT4 community)            | ~368 to 388 GB | 4x H200 or 8x H100      | 564 to 640 GB              |
| DeepSeek V4 Flash 0731              | 156.4 GB       | 2x H200                 | 282 GB                     |
| DeepSeek V4 Flash 0731 (3-bit GGUF) | 103 GB         | 1x RTX 4090 + 128GB RAM | 24 GB VRAM plus system RAM |

Three details change deployment plans. [vLLM](/blog/running-vllm-on-akash/)'s day-zero guidance puts Kimi K3's hardware floor at one 8x B300 node or a GB300 NVL72, while Moonshot's own production guidance calls for 64 or more accelerators. K3 does not fit an 8x H200 node at 1,128GB, so Hopper deployments require multi-node placement. The same counts apply to Kimi K3.1 Pro. Note that a single eight-GPU node of 192GB cards (1.536TB) cannot hold either model's 1.561TB of weights. GLM-5.2's FP8 release likewise does not fit on 8x [H100](/pricing/gpus/h100/) at all, which makes the 8x H200 node its natural home. And only DeepSeek V4 Flash 0731 has a credible single-GPU path, running quantized on one RTX 4090 with sufficient system RAM.

Architecture matters at long context too. Three out of every four attention layers in Kimi K3 use Kimi Delta Attention, which carries a constant-size state instead of a KV cache that grows linearly with context, so K3's memory profile at 1M tokens is better than its weight size alone suggests. GLM-5.2 uses MLA attention with a sparse-attention indexer, and its full 1M context in practice wants 8x [B200](/pricing/gpus/b200/) with FP8 KV cache rather than the 8x H200 that holds the weights.

## Why does a 1M-token context only cost ~29GB of KV cache?

Because only 24 of the model's 93 layers keep a cache that grows with context. The other 69 are KDA (Kimi Delta Attention), a linear-attention layer that carries a fixed-size state however long the input runs.

The 24 that do cache store a compressed latent rather than full keys and values: 512 latent values plus 64 rotary values, 576 per token per layer. At bf16 (calculated):

- 576 values × 2 bytes × 24 layers = 27,648 bytes per token
- 27,648 × 1,048,576 tokens ≈ 29GB at full context, or about 14.5GB with fp8 KV cache

For scale, if all 93 layers were conventional multi-head attention at 96 heads of 128 dimensions, the same million tokens would need roughly 4.8TB of KV cache (calculated). That is three times the weights. The hybrid design cuts it by around 165x.

We cover per-token KV cache maths for long-context serving in detail in [H100 vs H200 for Long-Context LLMs](/the-bid/h100-vs-h200-long-context-llms/).

## Can you run Kimi K3.1 Pro locally on consumer hardware?

No. Not on a workstation, and not on a single server built from 192GB-class GPUs.

An RTX 5090 has 32GB, so holding the weights would take about 49 of them, and consumer cards have no interconnect that lets a model be split that many ways at usable speed. Community requantizations do not change this. The official release is already 4-bit, and even Unsloth's 1-bit GGUF of Kimi K3 is 594GB, or about 19 RTX 5090s.

Most single datacentre nodes cannot hold it either. Eight GPUs at 192GB each give 1.536TB, and the weights are 1.561TB, so a full node of eight MI300Xs is about 25GB short. Eight 180GB B200s are about 120GB short. Only an eight-GPU B300 node, at 2.304TB, holds a single replica on one machine. On anything else, two nodes is the floor, with high-bandwidth networking between them and a serving stack that supports expert parallelism across nodes.

If you need K3.1 Pro without building that, a managed endpoint is the realistic route. See the section on when a managed API beats self-hosting below.

## What does it cost per hour to self-host Kimi K3, GLM-5.2, or DeepSeek V4 Flash 0731?

Checked against [Akash marketplace rates](/pricing/gpus/) on October 22, 2026: H200 SXM5 (141GB) is listed at **\$3.85/GPU-hr**, with capacity arranged through the [on-demand GPU](/gpus-on-demand/) request form. DeepSeek V4 Flash 0731 runs about \$7.70/hour on 2 H200s, GLM-5.2 about \$30.80/hour on 8. Kimi K3's 8x B300 requirement is priced from live provider bids on [Akash's B300 pricing page](/pricing/gpus/b300/), and you can [request access](/next-gen-gpus/) when no provider has bids open. The table costs that node at the tracked August 2026 market median of \$8.31/GPU-hr ([B300 vs B200 vs H200](/the-bid/nvidia-b300-vs-b200-vs-h200-best-gpu-for-self-hosting-ai/)) as a reference, not as an Akash rate.

| Model                  | Node        | Hourly                                   | Monthly at 24/7 |
| ---------------------- | ----------- | ---------------------------------------- | --------------- |
| DeepSeek V4 Flash 0731 | 2x H200 SXM | \$7.70                                   | ~\$5,621        |
| GLM-5.2 (INT4)         | 4x H200 SXM | \$15.40                                  | ~\$11,242       |
| GLM-5.2 (FP8 official) | 8x H200 SXM | \$30.80                                  | ~\$22,484       |
| Kimi K3                | 8x B300     | \$66.48 (at \$8.31/GPU-hr market median) | ~\$48,530       |

Worth flagging: H200 supply on Akash is thin, and an 8x H200 deployment for GLM-5.2 FP8 needs a full node from a single provider. That is a real capacity constraint today, not a pricing one — treat the GLM-5.2 FP8 row as a spot-availability check before you plan around it, and INT4 on 4x H200 as the more reliably obtainable path.

If Kimi K3 is your model, the 8x B300 node comes to around \$66.48/hour at the tracked market median. Check live bids on the [B300 pricing page](/pricing/gpus/b300/) and confirm actual availability first, since B300 capacity on Akash is limited. For most teams, decentralized marketplace capacity at this tier is still an emerging option rather than a settled one, and neither is any single consumer machine a substitute. K3's weights are genuinely open, and few teams need to self-host them at all. What the weights buy most teams is optionality, an audit path, and a private deployment route if regulation demands one, rather than a cheaper monthly bill.

## Which gives the most capability per dollar: Kimi K3, GLM-5.2, or DeepSeek V4 Flash 0731?

DeepSeek V4 Flash 0731 delivers roughly 88% of Kimi K3's independent intelligence score at about 1/54th the output token price, which makes DeepSeek V4 Flash 0731 the default choice unless vision or peak agentic capability is required.

| Model                  | AA Intelligence Index | API input (\$/M) | API output (\$/M) | Vision | Reasoning control         |
| ---------------------- | --------------------- | ---------------- | ----------------- | ------ | ------------------------- |
| Kimi K3                | 57                    | 3.00             | 15.00             | Yes    | Always on, cannot disable |
| GLM-5.2                | 51                    | 1.40             | 4.40              | No     | High and Max modes        |
| DeepSeek V4 Flash 0731 | 50                    | 0.14             | 0.28              | No     | Low, high, max, or off    |

Read the gap between 57 and 50 carefully. Seven points on the Artificial Analysis Intelligence Index is a real difference on hard agentic work, and Kimi K3 is the only one of the three with native vision. But the price ratio is 53x on output tokens, so K3 has to be more than 53x more useful on your workload to justify itself on cost alone, and it rarely will be.

GLM-5.2 sits awkwardly in the middle on price while leading DeepSeek V4 Flash 0731 by a single index point. Its case is architectural rather than economic: a mature FP8 single-node deployment story, well-supported INT4 community quantizations, and a 1M context that production stacks have been serving since June.

## How do the Kimi K3, GLM-5.2, and DeepSeek V4 Flash 0731 licenses differ?

GLM-5.2 and DeepSeek V4 Flash 0731 both ship under plain MIT. Kimi K3 and Kimi K3.1 Pro each ship under a custom license that is permissive for most users but attaches obligations at scale.

Both licenses permit downloading, running, modifying, fine-tuning, distributing, and deploying commercially at no license cost. Two conditions apply, and only at large scale:

- Operating a Model-as-a-Service business that exceeds \$20 million in revenue over any consecutive 12 months requires a separate agreement with Moonshot.
- Any product with more than 100 million monthly active users or more than \$20 million in monthly revenue must display the model name in its interface: "Kimi K3" or "Kimi K3.1-Pro".

Internal use and use through official products or certified inference partners are exempt. Both license files are on Hugging Face: the [Kimi K3 License](https://huggingface.co/moonshotai/Kimi-K3/blob/main/LICENSE) and the [Kimi K3.1-Pro License](https://huggingface.co/moonshotai/Kimi-K3.1-Pro/blob/main/LICENSE). Apart from the model name, their text is identical.

For most teams this is a non-issue. For anyone building a commercial inference product on top of these weights, it is the difference between a clean MIT dependency and a contract negotiation triggered by your own success. If license simplicity matters, the MIT pair are the safer foundation.

## Is Kimi K3.1 Pro open source?

It is open-weight, not open-source. The weights are free to download from Hugging Face without an access request, but they are published under a custom license listed there as kimi-k3.1-pro, which is not OSI-approved. Kimi K3 likewise shipped under its own Kimi K3 License.

The practical difference is that an open-source license grants the standard freedoms to use, modify, and redistribute without conditions. A custom open-weight license can attach conditions, and this one should be read before commercial use.

On revenue sharing, the license text contains no royalty or revenue-share clause. Its two conditions apply only at scale. A company running a Model-as-a-Service business above a revenue threshold needs a separate agreement with Moonshot, whose terms are not published. A product above a user-count or monthly-revenue threshold must display "Kimi K3.1-Pro" in its interface. Internal use, and use through Moonshot's official products or certified inference partners, are exempt from both. Check the [LICENSE file](https://huggingface.co/moonshotai/Kimi-K3.1-Pro/blob/main/LICENSE) in the K3.1 Pro repository for the current terms rather than relying on secondary summaries, including this one.

## Should you self-host Kimi K3, GLM-5.2, or DeepSeek V4 Flash 0731?

Self-host DeepSeek V4 Flash 0731 if you want open weights on hardware you can actually rent or own, GLM-5.2 if you need a proven single-node FP8 deployment, and Kimi K3 only if peak capability or vision is non-negotiable and you have Blackwell-class infrastructure.

| Your situation                                              | Model                             | Reason                                            |
| ----------------------------------------------------------- | --------------------------------- | ------------------------------------------------- |
| Smallest viable footprint, widest hardware options          | DeepSeek V4 Flash 0731            | 156.4GB fits 2 H200s or one consumer GPU with RAM |
| Cheapest per token at competitive quality                   | DeepSeek V4 Flash 0731            | \$0.14/\$0.28 against index score 50              |
| Established 8-GPU node deployment, 1M context in production | GLM-5.2                           | 755.6GB FP8, mature vLLM and SGLang paths         |
| Need images understood, not just text                       | Kimi K3                           | Only one of the three with native vision          |
| Peak agentic capability regardless of cost                  | Kimi K3                           | Index 57, seven points clear of the field         |
| Clean MIT license for a commercial product                  | GLM-5.2 or DeepSeek V4 Flash 0731 | No revenue-triggered obligations                  |
| Air gap, data residency, or regulatory requirement          | Any, sized to your hardware       | All three publish downloadable weights            |

## When is a managed API cheaper than self-hosting an open-weight model?

A managed API wins whenever your volume does not cover the fixed cost of a node sitting idle, which for most teams is most of the time. A 2x H200 node at roughly \$7.70 per hour bills whether requests arrive or not, so at \$0.28 per million output tokens the same spend buys about 27.5 million output tokens per hour before self-hosting is even competitive.

DeepSeek V4 Flash 0731 is available on [AkashML](/blog/akashml-managed-ai-inference-on-the-decentralized-supercloud/) at \$0.14 per million input tokens and \$0.28 per million output, with cache reads at \$0.02, at full precision with the complete 1M context behind an OpenAI-compatible API. GLM-5.2 is on AkashML too, listed on [OpenRouter](https://openrouter.ai/provider/akashml) at \$0.77/M input and \$2.42/M output with a 1.05M-token context (a 45% discount off list at time of writing) — cheaper than self-hosting for most volumes, without giving up the FP8-class weights. Because the weights are identical to the ones you would download, moving between the endpoint and your own deployment is a configuration change rather than a migration, not a re-architecture.

Both are also reachable straight from [Claude Code](https://akashml.com/docs/guides/claude-code): point `ANTHROPIC_BASE_URL` at AkashML's Anthropic-compatible endpoint and remap the model tiers — GLM-5.2 slots into the Opus tier, DeepSeek V4 Flash 0731 into Sonnet — so you can run agentic coding sessions against either model without leaving your existing CLI workflow.

Self-hosting still wins on the axes price cannot touch: data residency, guaranteed capacity, custom fine-tunes, and the right to keep running a model after its creator deprecates it. Deploying any of these three yourself is an [SDL file](/docs/developers/deployment/akash-sdl/) away, and for regulatory or air-gap requirements stricter than plain residency, Akash's [confidential compute](/docs/learn/core-concepts/confidential-compute/) runs inference inside hardware TEEs so weights and inputs stay unreadable even to the host.

There's a subtler reason to keep that loop closed, too: every prompt, correction, and eval sent to a closed vendor API teaches that vendor's model, not yours — the [Reverse Information Paradox](/bits/does-enterprise-ai-leak-your-company-data/) that Microsoft CEO Satya Nadella named in July 2026. Open weights on infrastructure you control keep that compounding value on your side of the boundary instead of your vendor's.

## FAQs

**How much disk space does Kimi K3 need?** Kimi K3's official checkpoint occupies 1.56TB across 96 weight shards on Hugging Face, or 1.420 TiB. This is the native MXFP4 release, not a quantization. Figures of 5.6TB circulating online come from multiplying 2.8 trillion parameters by 2 bytes for BF16, a precision Moonshot never published for this model. [Unsloth's GGUF requantizations](https://huggingface.co/unsloth/Kimi-K3-GGUF) span 594GB at 1-bit up to a lossless 1.56TB 8-bit repack, for llama.cpp-based servers instead of vLLM or SGLang.

**Can GLM-5.2 run on 8x H100?** GLM-5.2's official FP8 release at 755.6GB does not fit on an 8x H100 node's 640GB of aggregate VRAM. The practical single-node target is 8x H200 at 1,128GB total, which leaves roughly 370GB for KV cache. Community INT4 quantizations around 368 to 388GB do fit 8x H100 or 4x H200. [Unsloth's GGUF requantizations](https://huggingface.co/unsloth/GLM-5-GGUF) offer finer-grained options, from 176GB at 1-bit up to a lossless 869GB 8-bit repack.

**Which open-weight model has the smallest self-host footprint?** DeepSeek V4 Flash 0731 has the smallest footprint of the three at 156.4GB for its official checkpoint, roughly 10x smaller than Kimi K3 and 5x smaller than GLM-5.2's FP8 release. Quantized to 3-bit it drops to 103GB, small enough for a single RTX 4090 paired with 128GB of system RAM.

**Why is Kimi K3 only twice the size of GLM-5.2 despite 3.7x the parameters?** Kimi K3 ships natively in 4-bit MXFP4 at about 0.56 bytes per parameter, while GLM-5.2's official release is FP8 at 1.0 byte per parameter and its BF16 variant is 2.0. Precision format, not parameter count, determines checkpoint size, and quantization-aware training now lets frontier models ship at 4-bit without a separate full-precision master.

**Is Kimi K3's license actually open?** Kimi K3 uses a custom MIT-derived license that permits commercial use, modification, and redistribution at no cost for most users. Two conditions apply at scale: Model-as-a-Service businesses above \$20 million in annual revenue need a separate agreement, and products above 100 million monthly active users or \$20 million monthly revenue must display "Kimi K3" in their interface.

**Which of these models can run on consumer hardware?** Only DeepSeek V4 Flash 0731 has a practical consumer path, running quantized at roughly 11 tokens per second on a single RTX 4090 with 96GB or more of system RAM. GLM-5.2 can technically load a 2-bit quant on a 4x 4090 box with 256GB of RAM at 3 to 6 tokens per second. Kimi K3 has no practical consumer deployment.

**Do all three support 1M context?** All three advertise roughly 1,048,576-token context windows, but the memory cost differs sharply. Kimi K3 uses Kimi Delta Attention on three of every four layers, giving constant-size state rather than a growing KV cache. GLM-5.2 needs 8x B200 with FP8 KV cache to reach full context, notably more than the hardware that holds its weights.

**How much does LLM hosting cost per month for Kimi K3, GLM-5.2, and DeepSeek V4 Flash?** Running 24/7 for 730 hours on Akash, DeepSeek V4 Flash 0731 on 2x H200 costs about \$5,621 a month, and GLM-5.2 costs about \$11,242 on 4x H200 at INT4 or \$22,484 on 8x H200 at FP8, using the H200 rate of \$3.85 per GPU-hour as of October 22, 2026. Kimi K3 on 8x B300 comes to about \$48,530 a month at the tracked August 2026 market median of \$8.31 per GPU-hour; Akash's B300 rate comes from live provider bids on the [B300 pricing page](/pricing/gpus/b300/). A managed API costs less whenever your traffic doesn't keep the node busy.

**How much VRAM do you need to run Kimi K3?** You need 1.56TB for the weights alone, measured by summing the 96 safetensors shards on Hugging Face, plus roughly 29GB of KV cache at the full 1M-token context in bf16. That means at least 12 H200s or 20 H100s before any headroom.

**Can you run Kimi K3.1 Pro locally?** Not on consumer hardware. The weights are 1.56TB, roughly 49 RTX 5090s, and consumer cards lack the interconnect to serve a model split that far. It needs either a single eight-GPU B300 node or at least two eight-GPU datacentre nodes of smaller cards.

**Can a single eight-GPU node run Kimi K3.1 Pro?** Only with B300s, at 288GB each. Eight GPUs at 192GB each give 1.536TB, and the weights are 1.561TB, so a full node of MI300Xs is about 25GB short. A node of 180GB B200s is about 120GB short.

**Is Kimi K3.1 Pro open source?** It is open-weight, not open-source. The weights are published under a custom kimi-k3.1-pro license that is not OSI-approved. Check the LICENSE file before commercial use.

**Why does Kimi K3.1 Pro's 1M context not need terabytes of KV cache?** Only 24 of its 93 layers are full-attention. The other 69 use KDA linear attention, which holds a fixed-size state regardless of context length. A conventional attention stack at the same size would need roughly 4.8TB.
