---
title: "GPU Compute vs Memory Bandwidth: The Two Limits of LLM Inference"
pubDate: 2026-09-01
lastUpdated: 2026-09-01
author: "Sandeep Narahari, Contributor"
description: "GPU compute governs prompt processing (prefill); memory bandwidth is usually the limit on token generation (decode) — though KV-cache access, batching, and kernel efficiency can shift it. See the ops:byte ratio that tells you which applies to your workload."
tags: ["Guides"]
bannerImage: ./banner.webp
draft: false
faqAccordion: true
metaTitle: "GPU Compute vs Memory Bandwidth: LLM Inference Bottlenecks (2026)"
metaDescription: "GPU compute drives prompt processing, memory bandwidth drives token generation. Learn the ops:byte ratio for H100, H200, B200, and A100 to find your GPU bottleneck."
---

*By Sandeep Narahari, Contributor. Last updated: September 2026.*

*AI Infrastructure Engineering 101, Part 2.*

Memory bandwidth slows down token generation. Compute slows down prompt reading. To work out which one applies to you, divide the GPU's math speed by its memory speed: 295 on an H100, 206 on an H200, 281 on a B200. If your workload does less math than that per byte it reads, memory is your limit. Generating a token does about one operation per byte, so it almost always is.

[What Actually Determines LLM Inference Speed in 2026?](/the-bid/what-actually-determines-llm-inference-speed-2026/) said prefill is limited by compute and decode by bandwidth. Here is the math behind it.

## TL;DR

- GPU compute is how much math the chip can do, in TFLOPS. H100 and H200 both do 989 dense BF16. B200 does 2,250.
- Memory bandwidth is how fast it pulls weights out of memory. H100: 3.35 TB/s. H200: 4.8. B200: up to 8.0.
- Divide one by the other and you get the ops\:byte ratio. An H100 needs about 295 tokens moving through it at once to keep its math units busy. Real chat traffic usually has 20.
- The two phases are far apart. On one H100, reading a 1,500-token prompt is limited by compute, 5 to 1. Writing one token back is limited by memory, 295 to 1.
- The H200 proves it. Same chip, same math speed, 43% faster memory. Tokens come out up to 1.9x faster, prompts read at the same speed.

## What is GPU compute?

GPU compute is how much math the chip can do per second, measured in TFLOPS (trillions of floating point operations per second).

Almost all of it happens in Tensor Cores, small units built to multiply matrices. A transformer is a long chain of matrix multiplications, so the Tensor Core number is the one that matters. Smaller number formats are faster because there are fewer bits to move. From NVIDIA's [H100 datasheet](https://www.nvidia.com/en-us/data-center/h100/), one H100 SXM does 67 TFLOPS in FP32, 989 in BF16, and 1,979 in FP8.

Watch out for one thing on the spec sheets. NVIDIA prints the numbers you get with sparsity on, which needs weights arranged in a pattern normal models do not have. Both the H100 and [Blackwell](https://www.primeline-solutions.com/media/categories/server/nach-gpu/nvidia-hgx-h200/nvidia-blackwell-b200-datasheet.pdf) datasheets footnote it as "shown with sparsity." For a normal model the real number is half of what is printed, and every figure here is the real one.

## What is memory bandwidth?

Memory bandwidth is how fast the GPU moves data between its memory and its math units, measured in TB/s.

The weights, activations, and KV cache all sit in GPU memory, and nothing gets multiplied until it has been fetched. Bandwidth depends on the memory chips, not the processor, which is why the H200 hits 4.8 TB/s using the [same processor](https://www.nvidia.com/en-us/data-center/h200/) that gives the H100 3.35 TB/s. That gap compounds at long context, where the growing KV cache is itself the thing streaming through memory — see [H100 vs H200 for Long-Context LLMs](/the-bid/h100-vs-h200-long-context-llms/).

Memory has been falling behind for years. In [AI and Memory Wall](https://arxiv.org/abs/2403.14123) (IEEE Micro, 2024), Gholami and co-authors measured chip math speed roughly tripling every two years while memory speed rose only about 1.6x. GPUs keep getting much better at math and only a little better at fetching.

## How do you know which one is limiting you?

You compare two ratios. Your workload's is its operations divided by the bytes it reads, called arithmetic intensity. The GPU's is its peak math speed divided by its memory bandwidth, called the ops\:byte ratio.

If your number is higher, math is the bottleneck. If it is lower, memory is. NVIDIA puts it this way in its [GPU Performance Background User's Guide](https://docs.nvidia.com/deeplearning/performance/pdf/GPU-Performance-Background-User-Guide.pdf), and the idea comes from the roofline model, published by Williams, Waterman, and Patterson in [Communications of the ACM](https://m-cacm.acm.org/magazines/2009/4/22959-roofline-an-insightful-visual-performance-model-for-multicore-architectures/fulltext) in 2009.

Here is where today's GPUs sit:

| GPU (SXM) | Dense BF16 (TFLOPS) | Bandwidth (TB/s) | Ops\:byte ratio | Tokens needed to keep the math units busy |
|---|---|---|---|---|
| A100 80GB | 312 | 2.039 | 153 | ~153 |
| H100 80GB | 989 | 3.35 | 295 | ~295 |
| H200 141GB | 989 | 4.8 | 206 | ~206 |
| B200 180GB | 2,250 | 8.0 | 281 | ~281 |

The last column is the useful one, and the math is short. A layer with a d by d weight matrix processing B tokens does 2Bd² operations and reads d²p bytes, where p is bytes per weight. Intensity is 2B/p, which reaches 295 when B is about 295. FP8 barely moves the threshold, since it doubles the math speed and the operations per byte together.

Put simply: an H100 needs roughly 295 tokens flowing through it at once to keep its math units fed. With fewer, it is reading a huge pile of weights and barely using them.

## Prefill vs decode: which one hits which limit?

Prefill is the model reading your prompt. Every token goes through in one pass, so there are hundreds at once and the math units stay busy. Decode is the model writing tokens back, one at a time. One token per pass is nowhere near enough work.

Here is a 70B model in FP8, so 70 GB of weights, on one H100:

| Phase | Math needed | Weights to read | Math time (ms) | Memory time (ms) | What limits it |
|---|---|---|---|---|---|
| Prefill, 1,500 tokens | 210 TFLOP | 70 GB | 106 | 21 | Compute, 5 to 1 |
| Decode, 1 token | 0.14 TFLOP | 70 GB | 0.07 | 21 | Memory, 295 to 1 |

Both columns assume full speed, which never quite happens. Prefill usually hits 40% to 50% of peak math speed, while decode gets closer to peak on the memory side, so the real prefill gap is smaller than 5 to 1 and the real decode gap stays near 295 to 1. The 1,500-token prompt is not made up. It is the median prompt Microsoft measured on a live coding service in Splitwise.

Three sets of measurements back this up. NVIDIA's own [TensorRT-LLM post](https://nvidia.github.io/TensorRT-LLM/blogs/H200launch.html) shows the H200 generating tokens 1.9x faster than an H100 on Llama-70B, while time to first token stays about the same, because that part is limited by compute. [Splitwise](https://arxiv.org/abs/2311.18677) found that going from A100 to H100, which is 3.43x more math but only 1.64x more bandwidth, cut prompt reading 1.95x but token writing only 1.68x. The same paper found that cutting an H100 from 700W to 350W barely slows token generation but hurts prompt reading badly. A chip waiting on memory does not need much power.

That is all about the regular layers. Attention behaves differently, which is why batching helps less than you would expect. Recasens and co-authors, in [Mind the Memory Gap](https://arxiv.org/abs/2503.08311) (IEEE CLOUD 2025), found even large batches stay stuck on memory: batching lets requests share one weight read, but each still reads its own KV cache. Splitwise also found real chat traffic runs with 20 or fewer tokens in flight most of the time, far below the 295 an H100 needs.

## H100 vs H200 vs B200

| Spec | H100 SXM | H200 SXM | B200 SXM |
|---|---|---|---|
| Memory | 80 GB HBM3 | 141 GB HBM3e | 180 GB HBM3e |
| Bandwidth (TB/s) | 3.35 | 4.8 | up to 8.0 |
| Dense BF16 (TFLOPS) | 989 | 989 | 2,250 |
| Dense FP8 (TFLOPS) | 1,979 | 1,979 | 4,500 |
| Dense FP4 (TFLOPS) | not supported | not supported | 9,000 |
| Ops\:byte ratio | 295 | 206 | 281 |
| Math vs H100 | 1.00x | 1.00x | 2.28x |
| Bandwidth vs H100 | 1.00x | 1.43x | 2.39x |

The H200 is an H100 with better memory bolted on. It does nothing for reading prompts and a lot for writing tokens — see our full [NVIDIA H200 GPU Guide](/the-bid/nvidia-h200-gpu-guide-2026-specs-benchmarks-pricing/) for specs and pricing. The B200 raises both sides by roughly 2.3x, which is why its ops\:byte ratio lands close to the H100's. Blackwell is the first generation in a while to improve math and memory at about the same rate instead of pulling them apart.

The A100's low ratio of 153 is worth noticing, and it is not a bad thing — see our [NVIDIA A100 GPU Guide](/the-bid/nvidia-a100-gpu-guide-2026-specs-benchmarks-pricing/) for the full spec breakdown. It is exactly why the Splitwise team put [prompt reading on H100s and token writing on cheaper A100s](/the-bid/what-actually-determines-llm-inference-speed-2026/).

On the B200 row: NVIDIA's datasheet says 7.7 TB/s for HGX and 8 TB/s for GB200. At 7.7 the ratio is 292, which changes nothing above.

## What to take away

Compute and bandwidth are two different things, and your model uses them at two different moments. Reading the prompt uses compute. Writing tokens uses bandwidth. The ops\:byte ratio tells you which one you are running out of: 295 on an H100, 206 on an H200, 281 on a B200, 153 on an A100. Below that number, more TFLOPS get you nothing.

So the big TFLOPS number barely matters for token speed, and the TB/s number barely matters for prompt speed. There is no single "faster GPU." Work out which half of the job you do more of, then pay for that half — see [H100 Rental Price in 2026](/the-bid/h100-rental-price-2026-cost-per-hour/) for what that costs by provider.

## FAQ

**Is LLM inference limited by compute or memory?** Both, at different moments. Prefill reads the whole prompt in one pass and is limited by compute, which sets time to first token. Decode writes one token per pass and is limited by memory bandwidth, which sets tokens per second. Most requests spend more time decoding, so people usually call inference memory-bound.

**What is a GPU's ops\:byte ratio?** It is peak math speed divided by memory bandwidth. It tells you how much math a workload must do per byte read before the math units become the limit. An H100 sits at 295. Below that you are waiting on memory, above it you are waiting on math.

**Does the H200 have more compute than the H100?** No. Both use the same Hopper processor and have identical math speed at every precision. The only difference is memory: 141 GB at 4.8 TB/s versus 80 GB at 3.35 TB/s. Everything the H200 does better comes from memory, not math.

**Why doesn't batching fix the memory bottleneck?** Batching lets many requests share one read of the weights, which helps. But each request still reads its own KV cache, and that part is not shared. Recasens and co-authors measured attention staying memory-bound no matter how large the batch got.

**How many tokens does an H100 need to keep its math units busy?** About 295 in one pass. Splitwise measured real chat traffic running with 20 or fewer tokens in flight 60% to 70% of the time, more than ten times short of that.
