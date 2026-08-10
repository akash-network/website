---
title: "The Ultimate Self-Hosting Guide: Kimi K3 vs GLM-5.2 vs DeepSeek-V4-Flash-0731 (2026)"
pubDate: 2026-08-06
lastUpdated: 2026-08-06
author: "Sandeep Narahari, Contributor"
description: "Kimi K3 needs 1.56TB on disk, GLM-5.2 needs 755.6GB at FP8, and DeepSeek V4 Flash 0731 needs 156.4GB. Actual checkpoint sizes, GPU counts, hourly costs, and license terms for the three open-weight frontier models, with the parameter-count math that misleads everyone."
tags: ["Comparisons", "Alternatives", "Guides"]
bannerImage: ./banner.webp
draft: false
faqAccordion: true
---

*Last updated: August 2026*

Kimi K3 occupies 1.56TB on disk, GLM-5.2 occupies 755.6GB in its official FP8 release, and DeepSeek V4 Flash 0731 occupies 156.4GB. That is a 10x spread between the largest and smallest, and it does not track parameter count the way most comparisons assume.

**TL;DR**

- Actual checkpoint sizes: Kimi K3 at 1.56TB, GLM-5.2 at 755.6GB official FP8 (1.507TB if you insist on BF16), DeepSeek V4 Flash 0731 at 156.4GB.
- Parameter count is a bad proxy. Kimi K3 has 3.7x GLM-5.2's parameters but takes only about twice the disk, because K3 ships natively in 4-bit MXFP4 while GLM-5.2's headline checkpoint is 16-bit.
- The 5.6TB figure circulating for Kimi K3 is wrong. It comes from multiplying 2.8T parameters by 2 bytes for BF16, a precision Moonshot never released.
- Hardware floors differ by a factor of eight. K3 wants an 8x B300 node or larger, GLM-5.2 FP8 fits a single 8x H200 node, and V4 Flash 0731 fits on 2 H200s or a single RTX 4090 with system RAM.
- License terms are a real decision axis. GLM-5.2 and DeepSeek V4 Flash 0731 are plain MIT. Kimi K3 uses a custom license with revenue-triggered obligations above \$20M.

## How big are the Kimi K3, GLM-5.2, and DeepSeek V4 Flash 0731 checkpoints?

Kimi K3 is 1,560GB, GLM-5.2 is 755.6GB in its official FP8 release, and DeepSeek V4 Flash 0731 is 156.4GB. These are repository weight sizes only, measured before KV cache, runtime buffers, and operating system overhead, each of which adds materially at long context.

| Model | Total params | Active params | Official checkpoint | Size | License |
|---|---|---|---|---|---|
| Kimi K3 | 2.8T | 104B | MXFP4 (native) | 1.56 TB | Custom Kimi K3 License |
| GLM-5.2 | 753B | ~40B | FP8 | 755.6 GB | MIT |
| GLM-5.2 (BF16 variant) | 753B | ~40B | BF16 | 1.507 TB | MIT |
| DeepSeek V4 Flash 0731 | 284B | 13B | MXFP4 + FP8/BF16 | 156.4 GB | MIT |

Kimi K3's [Hugging Face repository](https://huggingface.co/moonshotai/Kimi-K3) is public and ungated with 96 downloadable weight shards occupying 1,560,936,091,448 bytes, which is 1.561 TB in decimal units or 1.420 TiB. [GLM-5.2's](https://huggingface.co/zai-org/GLM-5.2) official BF16 weights are 1.507 TB and its official FP8 weights are 755.6 GB before KV cache or runtime overhead. [DeepSeek's V4 Flash 0731](https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731) reference checkpoint measures 156.4GB, with [Unsloth's bit-identical lossless GGUF repack](https://huggingface.co/unsloth/DeepSeek-V4-Flash-0731-GGUF) at 161.9GB.

Kimi K3 is 10x the size of DeepSeek V4 Flash 0731, but only 2.1x the size of GLM-5.2's official FP8 release despite carrying 3.7x GLM-5.2's parameters. Checkpoint size is parameter count multiplied by precision format, and across these three models the precision factor varies more than the parameter factor does.

## Why does Kimi K3 take only twice the space of GLM-5.2 despite 3.7x the parameters?

Kimi K3 takes only twice the space of GLM-5.2 because Kimi K3 stores weights at roughly 4.5 bits per parameter while GLM-5.2's official checkpoint stores them at 8 and its BF16 variant at 16. Moonshot's public release is MXFP4 weights with MXFP8 activations rather than a separate BF16 master checkpoint, and K3 was trained with quantization-aware training so the released MXFP4 weights serve natively at 4-bit with no calibration pass required.

Run the arithmetic on effective density and the picture inverts:

| Model | Params | Checkpoint size | Bytes per parameter | Effective precision |
|---|---|---|---|---|
| Kimi K3 | 2.8T | 1.56 TB | 0.56 | ~4.5-bit |
| DeepSeek V4 Flash 0731 | 284B | 156.4 GB | 0.55 | ~4.4-bit |
| GLM-5.2 (FP8) | 753B | 755.6 GB | 1.00 | 8-bit |
| GLM-5.2 (BF16) | 753B | 1.507 TB | 2.00 | 16-bit |

Kimi K3 and DeepSeek V4 Flash 0731 are almost identical in bytes per parameter, because both were quantization-aware trained with routed experts stored natively in MXFP4. DeepSeek keeps roughly 96% of the model in MXFP4 with the remainder in FP8 or BF16, which is why Unsloth's 8-bit repack comes out only about 7GB larger than its 4-bit one: most of the model was already 4-bit when DeepSeek shipped it.

This is why the widely repeated 5.6TB figure for Kimi K3 is wrong. It comes from multiplying 2.8 trillion parameters by 2 bytes, the BF16 assumption that held for open-weight releases until quantization-aware training became standard at this scale. Moonshot never published a BF16 checkpoint. If you budgeted 5.6TB of storage or GPU memory for K3, you overbought by more than 3.5x.

The practical rule: ask what precision the checkpoint actually ships in before multiplying anything by parameter count.

## How many GPUs do you need to run Kimi K3, GLM-5.2, or DeepSeek V4 Flash 0731?

Kimi K3 needs an 8x B300 node, GLM-5.2 needs 8x H200 to hold its official FP8 weights, and DeepSeek V4 Flash 0731 needs only 2x H200 or a single RTX 4090 paired with system RAM. The table below sizes weights only; add 20% to 40% for KV cache at moderate context, and far more if you intend to use the full million-token windows all three models advertise.

| Model and precision | Weights | Minimum practical node | Aggregate VRAM |
|---|---|---|---|
| Kimi K3 (MXFP4 native) | 1.56 TB | 8x B300 | 2,304 GB |
| GLM-5.2 (FP8 official) | 755.6 GB | 8x H200 | 1,128 GB |
| GLM-5.2 (INT4 community) | ~368 to 388 GB | 4x H200 or 8x H100 | 564 to 640 GB |
| DeepSeek V4 Flash 0731 | 156.4 GB | 2x H200 | 282 GB |
| DeepSeek V4 Flash 0731 (3-bit GGUF) | 103 GB | 1x RTX 4090 + 128GB RAM | 24 GB VRAM plus system RAM |

Three details change deployment plans. [vLLM](/blog/running-vllm-on-akash/)'s day-zero guidance puts Kimi K3's hardware floor at one 8x B300 node or a GB300 NVL72, while Moonshot's own production guidance calls for 64 or more accelerators. K3 does not fit an 8x H200 node at 1,128GB, so Hopper deployments require multi-node placement. GLM-5.2's FP8 release likewise does not fit on 8x H100 at all, which makes the 8x H200 node its natural home. And only DeepSeek V4 Flash 0731 has a credible single-GPU path, running quantized on one RTX 4090 with sufficient system RAM.

Architecture matters at long context too. Three out of every four attention layers in Kimi K3 use Kimi Delta Attention, which carries a constant-size state instead of a KV cache that grows linearly with context, so K3's memory profile at 1M tokens is better than its weight size alone suggests. GLM-5.2 uses MLA attention with a sparse-attention indexer, and its full 1M context in practice wants 8x B200 with FP8 KV cache rather than the 8x H200 that holds the weights.

## What does it cost per hour to self-host Kimi K3, GLM-5.2, or DeepSeek V4 Flash 0731?

Checked against live [Akash marketplace rates](/pricing/gpus/) on August 7, 2026: H200 SXM5 (141GB) is averaging **\$4.37/GPU-hr**, with only 8 of 40 listed [on-demand GPU](/gpus-on-demand/) units currently available from a single active provider. DeepSeek V4 Flash 0731 runs about \$8.74/hour on 2 H200s, GLM-5.2 about \$34.96/hour on 8. Kimi K3's 8x B300 requirement now has a listed starting price too — B300 shows at \$6.00/GPU-hr on Akash's pricing page — but B300 doesn't yet have a dedicated availability page the way H100/H200/A100 do, so treat that figure as a starting rate to confirm via a custom quote rather than guaranteed instant self-serve capacity.

| Model | Node | Hourly | Monthly at 24/7 |
|---|---|---|---|
| DeepSeek V4 Flash 0731 | 2x H200 SXM | \$8.74 | ~\$6,380 |
| GLM-5.2 (INT4) | 4x H200 SXM | \$17.48 | ~\$12,760 |
| GLM-5.2 (FP8 official) | 8x H200 SXM | \$34.96 | ~\$25,521 |
| Kimi K3 | 8x B300 | \$48.00 (at \$6.00/GPU-hr starting rate) | ~\$35,040 |

Worth flagging: an 8x H200 deployment for GLM-5.2 FP8 would currently consume the entire available H200 supply on Akash (8 of 8 available units, from the one provider offering them). That is a real capacity constraint today, not a pricing one — treat the GLM-5.2 FP8 row as a spot-availability check before you plan around it, and INT4 on 4x H200 as the more reliably obtainable path.

If Kimi K3 is your model, budget around \$48/hour for the 8x B300 node at Akash's listed starting rate, but confirm actual availability first — there's no self-serve inventory count for B300 yet, unlike H100/H200/A100. For most teams, decentralized marketplace capacity at this tier is still an emerging option rather than a settled one, and neither is any single consumer machine a substitute. K3's weights are genuinely open, and few teams need to self-host them at all. What the weights buy most teams is optionality, an audit path, and a private deployment route if regulation demands one, rather than a cheaper monthly bill.

## Which gives the most capability per dollar: Kimi K3, GLM-5.2, or DeepSeek V4 Flash 0731?

DeepSeek V4 Flash 0731 delivers roughly 88% of Kimi K3's independent intelligence score at about 1/54th the output token price, which makes DeepSeek V4 Flash 0731 the default choice unless vision or peak agentic capability is required.

| Model | AA Intelligence Index | API input (\$/M) | API output (\$/M) | Vision | Reasoning control |
|---|---|---|---|---|---|
| Kimi K3 | 57 | 3.00 | 15.00 | Yes | Always on, cannot disable |
| GLM-5.2 | 51 | 1.40 | 4.40 | No | High and Max modes |
| DeepSeek V4 Flash 0731 | 50 | 0.14 | 0.28 | No | Low, high, max, or off |

Read the gap between 57 and 50 carefully. Seven points on the Artificial Analysis Intelligence Index is a real difference on hard agentic work, and Kimi K3 is the only one of the three with native vision. But the price ratio is 53x on output tokens, so K3 has to be more than 53x more useful on your workload to justify itself on cost alone, and it rarely will be.

GLM-5.2 sits awkwardly in the middle on price while leading DeepSeek V4 Flash 0731 by a single index point. Its case is architectural rather than economic: a mature FP8 single-node deployment story, well-supported INT4 community quantizations, and a 1M context that production stacks have been serving since June.

## How do the Kimi K3, GLM-5.2, and DeepSeek V4 Flash 0731 licenses differ?

GLM-5.2 and DeepSeek V4 Flash 0731 both ship under plain MIT. Kimi K3 ships under a custom license that is permissive for most users but attaches obligations at scale.

The Kimi K3 License permits downloading, running, modifying, fine-tuning, distributing, and deploying commercially at no license cost, with two conditions that apply only at large scale: operating a Model-as-a-Service business exceeding \$20 million in revenue over any consecutive 12 months requires a separate agreement with Moonshot, and any product built on K3 with more than 100 million monthly active users or more than \$20 million in monthly revenue must display "Kimi K3" in its interface. Internal use and use through official products or certified inference partners are exempt.

For most teams this is a non-issue. For anyone building a commercial inference product on top of these weights, it is the difference between a clean MIT dependency and a contract negotiation triggered by your own success. If license simplicity matters, the MIT pair are the safer foundation.

## Should you self-host Kimi K3, GLM-5.2, or DeepSeek V4 Flash 0731?

Self-host DeepSeek V4 Flash 0731 if you want open weights on hardware you can actually rent or own, GLM-5.2 if you need a proven single-node FP8 deployment, and Kimi K3 only if peak capability or vision is non-negotiable and you have Blackwell-class infrastructure.

| Your situation | Model | Reason |
|---|---|---|
| Smallest viable footprint, widest hardware options | DeepSeek V4 Flash 0731 | 156.4GB fits 2 H200s or one consumer GPU with RAM |
| Cheapest per token at competitive quality | DeepSeek V4 Flash 0731 | \$0.14/\$0.28 against index score 50 |
| Established 8-GPU node deployment, 1M context in production | GLM-5.2 | 755.6GB FP8, mature vLLM and SGLang paths |
| Need images understood, not just text | Kimi K3 | Only one of the three with native vision |
| Peak agentic capability regardless of cost | Kimi K3 | Index 57, seven points clear of the field |
| Clean MIT license for a commercial product | GLM-5.2 or DeepSeek V4 Flash 0731 | No revenue-triggered obligations |
| Air gap, data residency, or regulatory requirement | Any, sized to your hardware | All three publish downloadable weights |

## When is a managed API cheaper than self-hosting an open-weight model?

A managed API wins whenever your volume does not cover the fixed cost of a node sitting idle, which for most teams is most of the time. A 2x H200 node at roughly \$8.74 per hour bills whether requests arrive or not, so at \$0.28 per million output tokens the same spend buys about 31.2 million output tokens per hour before self-hosting is even competitive.

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

