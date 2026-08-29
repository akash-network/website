---
title: "What Actually Determines LLM Inference Speed in 2026?"
pubDate: 2026-08-29
lastUpdated: 2026-08-29
author: "Sandeep Narahari, Contributor"
description: "Seven factors set LLM inference speed in 2026 — GPU compute, memory bandwidth, model architecture, VRAM/KV cache, precision, batch size, and serving software — and the model you picked is only one of them."
tags: ["Guides"]
bannerImage: ./banner.webp
draft: false
faqAccordion: true
metaTitle: "LLM Inference Speed Explained: 7 Factors That Matter (2026)"
metaDescription: "LLM inference speed comes down to 7 factors, not just the model: GPU compute, memory bandwidth, VRAM/KV cache, precision, batch size, and serving software."
---

*By Sandeep Narahari, Contributor. Last updated: August 2026.*

*AI Infrastructure Engineering 101, Part 1.*

Seven things, and the model you picked is only one of them. GPU compute, memory bandwidth, model architecture, VRAM and KV cache, precision, batch size, and serving software. On August 20, 2026, Artificial Analysis measured the same 31B model at 870 and 3,431 tokens per second on different systems.

## TL;DR

- The seven factors are GPU compute, memory bandwidth, model size and architecture, VRAM and KV cache, precision, batch size, and inference software.
- Compute and bandwidth govern different phases. Prefill processes the prompt and is compute bound, setting time to first token. Decode generates tokens one at a time and is bandwidth bound, setting tokens per second.
- The decode ceiling is arithmetic. Memory bandwidth divided by bytes read per token. An H100 at 3.35 TB/s reading a 70 GB model tops out near 48 tokens per second for a single stream.
- Software moves the number as much as silicon. Continuous batching and paged KV cache gave 2 to 4x throughput in the vLLM paper. Chunked prefill gave up to 5.6x serving capacity under latency targets. Speculative decoding gave up to 6.5x in EAGLE-3.
- The proof is in the spread. Artificial Analysis records a 9.8x output speed gap and a 35x time to first token gap across 11 providers serving identical MiniMax-M3 weights.

## Factor 1: How much does GPU compute matter for inference speed?

It decides how fast your prompt gets read, not how fast tokens come out.

Inference has two phases with opposite bottlenecks. Prefill runs the entire prompt through the model in one pass, which is a large matrix multiplication and genuinely compute bound. Decode then produces one token per forward pass, which is a tiny matrix multiplication and bandwidth bound. Prefill sets time to first token. Decode sets tokens per second.

This split is the reason a single speed number is meaningless. The [DistServe authors built their OSDI 2024 system](https://arxiv.org/abs/2401.09670) around it, observing that engines running both phases on the same GPUs must prioritize one latency or over-provision for both. Separating the phases onto different GPUs let them serve 7.4x more requests or meet 12.6x tighter latency targets.

Compute matters more than people credit in one growing case: long context. An agentic session that has accumulated 100,000 tokens of history pays a large prefill bill on every turn, and that bill is compute and attention, not weight streaming. If your workload is long prompts and short answers, you are closer to compute bound than the rest of this post implies. If it is short prompts and long answers, factor 2 owns your latency.

## Factor 2: Why is memory bandwidth the main limit on tokens per second?

Because generating each token requires reading the model's active weights out of VRAM, and reading is slower than multiplying.

The ceiling is a division. Take the GPU's memory bandwidth, divide by the bytes moved per token, and you have the maximum single-stream generation speed before any software is involved. A 70B dense model with 8-bit weights moves roughly 70 GB per token.

| GPU | Memory | Bandwidth | Ceiling for a 70B model at 8-bit, batch of 1 |
|---|---|---|---|
| A100 80GB SXM4 | 80 GB HBM2e | 2,039 GB/s | ~29 tokens/sec |
| RTX PRO 6000 Blackwell SE | 96 GB GDDR7 | 1,597 GB/s | ~23 tokens/sec |
| H100 80GB SXM5 | 80 GB HBM3 | 3,350 GB/s | ~48 tokens/sec |
| H200 141GB SXM | 141 GB HBM3e | 4,800 GB/s | ~69 tokens/sec |
| B200 180GB SXM | 180 GB HBM3e | up to 8,000 GB/s | ~114 tokens/sec |
| B300 288GB SXM6 | 288 GB HBM3e | up to 8,000 GB/s | ~114 tokens/sec |
| Rubin R100 (shipping H2 2026) | 288 GB HBM4 | up to 22,000 GB/s | ~314 tokens/sec |

Bandwidth and capacity come from NVIDIA's published specifications for the [H100](https://www.nvidia.com/en-us/data-center/h100/), [H200](https://www.nvidia.com/en-us/data-center/h200/), [RTX PRO 6000 Blackwell Server Edition](https://www.nvidia.com/en-us/data-center/rtx-pro-6000-blackwell-server-edition/), the [A100 datasheet](https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/a100/pdf/nvidia-a100-datasheet.pdf), the [HGX reference architecture](https://docs.nvidia.com/enterprise-reference-architectures/hgx-ai-factory/latest/components.html) for B200 and B300, and NVIDIA's [Vera Rubin deep dive](https://developer.nvidia.com/blog/inside-the-nvidia-rubin-platform-six-new-chips-one-ai-supercomputer/) for Rubin. The ceilings are our arithmetic from those figures, and they are ceilings. Real deployments land below them, because attention over the KV cache, kernel launch overhead, and sampling all consume time this calculation ignores.

The cleanest proof that bandwidth rather than compute drives decode: the H100 and H200 use the same Hopper compute die and post identical FP8 throughput. The H200 generates tokens faster because NVIDIA attached faster memory to it.

## Factor 3: Do model size and MoE architecture change inference speed?

Total parameter count matters less than how many parameters activate per token.

A dense model reads all of its weights on every forward pass. A mixture-of-experts model routes each token to a subset of experts and reads only those. gpt-oss-120b has [116.8B total parameters and 5.13B active per token](https://arxiv.org/pdf/2508.10925), so its bandwidth bill per token resembles a small model even though its checkpoint is 60.8 GiB. That is why MoE models feel fast on a single card.

The advantage narrows as concurrency rises. Different requests in a batch route to different experts, so a large enough batch ends up touching most of the expert weights anyway. MoE also converts a memory problem into a communication problem. NVIDIA built the [Rubin platform's NVLink 6 fabric as a full all-to-all topology across 72 GPUs](https://developer.nvidia.com/blog/inside-the-nvidia-rubin-platform-six-new-chips-one-ai-supercomputer/) specifically because expert routing generates bursty traffic that overwhelms hierarchical fabrics.

Read it this way: MoE is excellent for latency-sensitive serving at low concurrency on one node, and becomes a networking design problem at scale.

## Factor 4: How do VRAM and the KV cache affect inference speed?

They decide whether you can batch, and batching is where throughput comes from.

VRAM holds three things: the weights, the activations, and the KV cache. The KV cache stores the attention state for every token in every active request, so it grows with both context length and concurrency. Whatever VRAM is left after the weights is your concurrency budget.

This is why a 70 GB model on an 80 GB card is a worse deployment than the numbers suggest. It fits, but with almost nothing left for cache, which caps how many requests you can hold at once. The H200's extra 61 GB buys batch size, and batch size buys throughput.

Two consequences follow. First, cache management is a performance feature. vLLM's [PagedAttention allocates KV cache in fixed-size blocks](https://arxiv.org/pdf/2309.06180) rather than reserving a contiguous maximum per request, which is most of how it reached 2 to 4x higher throughput at the same latency in the original SOSP 2023 evaluation. Second, at long context the cache itself becomes the thing you are streaming, which is why NVIDIA now sells a dedicated tier for it: Inference Context Memory Storage, an Ethernet-attached flash layer that the company claims delivers up to 5x higher tokens per second than treating KV cache as ordinary storage.

## Factor 5: Does precision change how fast a model runs?

Directly, because precision is just bytes per weight, and bytes per weight is the numerator of the bandwidth ceiling.

Moving weights from 16-bit to 8-bit roughly halves the memory traffic per forward pass. Four-bit formats cut it further. gpt-oss-120b [post-trained its MoE weights to MXFP4 at 4.25 bits per parameter](https://arxiv.org/pdf/2508.10925), which is what lets a 117B model serve from a single 80 GB card at all.

The cost is accuracy, and it varies by model and format rather than following a clean rule. This is now a visible product decision rather than an implementation detail. On the Artificial Analysis provider listings, endpoints are labelled FP8, MXFP8, and NVFP4 next to the operator's name. When two providers serve the same weights at different speeds, precision is one of the first places to look.

One hardware caveat: precision support is generational. Ampere has no native FP8 tensor cores, so 8-bit weights on an A100 must be dequantized before the matmul, adding compute that Hopper and Blackwell do not pay.

## Factor 6: How much does batch size change inference speed?

More than most single hardware upgrades, and in opposite directions for the two metrics you care about.

Batching raises total tokens per second across all users, because the weights are read once and amortized across every request in the batch. It lowers tokens per second for any individual user, because each step now does more work. There is no setting that maximizes both.

Two scheduling techniques define the current state of the art:

- **Continuous batching.** Instead of waiting for a batch to finish, the scheduler swaps a completed request out and a queued one in at every decode step, so the GPU never idles on a half-empty batch.
- **Chunked prefill.** A long prompt entering the batch stalls everyone else's decode. [Sarathi-Serve splits prefills into fixed-size chunks](https://arxiv.org/abs/2403.02310) and interleaves them with ongoing decodes, which the authors call stall-free scheduling. Under tail latency constraints they measured 2.6x higher serving capacity for Mistral-7B on one A100 and up to 5.6x for Falcon-180B with pipeline parallelism.

The practical version: a chat product wants small batches and low time between tokens. An overnight document pipeline wants large batches and does not care about per-user latency. Same model, same card, different deployment.

## Factor 7: How much of inference speed comes from the serving software?

Enough that it routinely outweighs the hardware choice, which you can prove without a lab.

[Artificial Analysis benchmarks 11 API providers serving MiniMax-M3](https://artificialanalysis.ai/models/minimax-m3/providers) at 10,000 input tokens, reporting the median over a trailing 72 hour window. As of August 29, 2026, output speed ranged from 229.4 to 23.4 tokens per second, a 9.8x gap, while blended price varied only 2.2x. Time to first answer token ranged from 0.77 seconds to 27.19 seconds. Same weights, same benchmark.

Beyond batching, three software levers account for most of that spread:

- **Prefix caching.** Reusing the KV cache for a shared prompt prefix skips prefill entirely. [SGLang's RadixAttention keeps prefixes in a radix tree](https://www.lmsys.org/blog/2024-01-17-sglang/) and reports up to 5x higher throughput with the largest gains in first token latency. System prompts, few-shot examples, and multi-turn history all qualify. Fully unique prompts get nothing.
- **Speculative decoding.** A small draft model proposes several tokens and the target model verifies them in one pass, converting sequential steps into parallel ones. [EAGLE-3 reports speedups up to 6.5x](https://arxiv.org/abs/2503.01840). The gain is real only at low batch sizes, where bandwidth rather than compute is the constraint.
- **Kernels and framework.** vLLM, SGLang, and TensorRT-LLM implement the same math with different attention kernels, scheduler overhead, and graph capture. Framework choice alone moves published numbers.

None of this requires newer silicon. All of it requires someone to configure it.

## Which GPU delivers the most inference speed per dollar in 2026?

It depends entirely on whether your model and KV cache fit. Below is live pricing from the Akash marketplace, queried on August 29, 2026, combined with the manufacturer bandwidth figures above.

| GPU | Bandwidth | Price on Akash | Bandwidth per $/hr | Capacity |
|---|---|---|---|---|
| RTX 5090 | 1,792 GB/s | $0.42/hr | ~4.3 TB/s | 32 GB, no NVLink |
| RTX 4090 | 1,008 GB/s | $0.28/hr | ~3.6 TB/s | 24 GB, no NVLink |
| H100 80GB SXM5 | 3,350 GB/s | $2.04/hr | ~1.6 TB/s | 80 GB |
| A100 80GB SXM4 | 2,039 GB/s | $1.83/hr | ~1.1 TB/s | 80 GB, no FP8 |
| H200 141GB SXM | 4,800 GB/s | $4.45/hr | ~1.1 TB/s | 141 GB |
| RTX PRO 6000 Blackwell SE | 1,597 GB/s | $2.04/hr | ~0.8 TB/s | 96 GB |
| B200 180GB SXM | up to 8,000 GB/s | $5.00/hr | ~1.6 TB/s | 180 GB |
| B300 288GB SXM6 | up to 8,000 GB/s | $6.00/hr | ~1.3 TB/s | 288 GB |

Prices are current Akash marketplace rates as of August 29, 2026, pulled from the Akash console API.

The B200 row is the interesting result. At $5.00/hr against roughly 8 TB/s, it lands at about the same bandwidth per dollar as an H100, while carrying 180 GB instead of 80 GB — for a bandwidth-bound workload that also needs KV cache headroom, that's the strongest combination in the table, and it's the case where paying more per hour genuinely buys more tokens per dollar. B300 gives up a little bandwidth per dollar for 288 GB, which is a capacity purchase rather than a speed purchase.

The consumer cards still win the per-dollar column outright and lose on everything requiring capacity. A 32 GB card cannot hold a 70B model, cannot hold a large KV cache, and has no NVLink for tensor parallelism, which means it cannot batch its way to high aggregate throughput. Under about 20B parameters at 4-bit with low concurrency, that column is telling you something real. Serving a 120B MoE to hundreds of concurrent users, it is a trap.

Worth separating from all of this: the fastest GPU is not the cheapest per token. Citing SemiAnalysis InferenceX benchmarks from April 2026, [NVIDIA states that an H100 serves gpt-oss-120b at roughly \$0.09 per million tokens at 66 tokens per second per user using vLLM](https://www.nvidia.com/en-us/data-center/h100/), while a B200 serves it at roughly \$0.02 per million tokens at 55 tokens per second per user using TensorRT-LLM. The newer card is quoted at lower per-user speed and 4.5x lower cost per token, because each system was run at a different point on its own throughput-versus-latency curve, on a different stack.

## What changes with HBM4, Rubin, and dedicated decode hardware?

The bandwidth ceiling rises sharply, and the industry starts building separate silicon per phase.

NVIDIA states the [Rubin GPU carries up to 288 GB of HBM4 at up to 22 TB/s](https://developer.nvidia.com/blog/inside-the-nvidia-rubin-platform-six-new-chips-one-ai-supercomputer/), roughly 2.8x Blackwell's 8 TB/s, with Vera Rubin NVL72 targeted at mass production in the second half of 2026. HBM4 doubles the interface width versus HBM3e. For a bandwidth-bound workload, that is close to a direct multiplier on decode.

The architectural shift matters more. On August 24, 2026, NVIDIA published third-party benchmark results for Groq 3 LPX, an SRAM-based decode accelerator that pairs with Vera Rubin NVL72. [Artificial Analysis measured Gemma 4 31B at 3,431 output tokens per second at 100K context, against 870 for the fastest public endpoint](https://developer.nvidia.com/blog/how-nvidia-groq-3-lpx-unlocks-ultrafast-interactivity-at-long-context-on-nvidia-vera-rubin/), and NVIDIA's own SPEED-Bench coding run produced a median of 4,767 tokens per second. The same post notes that popular agentic tools today run closer to 60 tokens per second.

The pairing configurations are the tell: prefill-decode disaggregation, attention-FFN disaggregation, and external-drafter speculative decoding. Each assigns a phase to the hardware that suits it, which is factor 1 turned into a procurement decision. For anyone renting rather than building, note that all three are software patterns available on today's hardware. Splitting prefill and decode across two GPU pools does not require Rubin. It requires an orchestration layer and a fast link.

## FAQ

**What determines LLM inference speed?** Seven factors: GPU compute, memory bandwidth, model size and architecture, VRAM and KV cache capacity, numeric precision, batch size, and serving software. Compute governs prompt processing and time to first token. Bandwidth governs token generation. The remaining five determine how much of the theoretical ceiling a deployment actually reaches.

**Is inference speed limited by compute or memory?** Both, in different phases. Prefill processes the entire prompt in one pass and is compute bound. Decode generates one token per pass and is memory bandwidth bound. A GPU can post excellent tokens per second and still feel slow if prefill queues, which is why time to first token and output speed are reported separately.

**How do I calculate maximum tokens per second for a GPU?** Divide memory bandwidth by the bytes read per token. A 70B model at 8-bit weights moves roughly 70 GB per token, so an H100 SXM5 at 3,350 GB/s tops out near 48 tokens per second for a single stream. Real throughput lands below this, since attention and kernel overhead are excluded.

**Are MoE models faster than dense models?** At low concurrency, yes. A mixture-of-experts model reads only its routed experts per token, so gpt-oss-120b moves roughly the weight volume of its 5.13B active parameters rather than its 116.8B total. The advantage shrinks at high batch sizes, when different requests activate different experts and most weights get read anyway.

**Does quantization make inference faster?** Yes, because precision determines bytes per weight and bytes per weight sets the bandwidth bill. Halving from 16-bit to 8-bit roughly halves memory traffic per forward pass. The cost is accuracy, which varies by model and format, so quantization is a speed-versus-quality decision rather than a free upgrade.

**Why do providers serve the same open model at different speeds?** Because speed is a configuration outcome. Batch size, precision, prefix caching, chunked prefill, and speculative decoding are all operator choices. Artificial Analysis currently records a 9.8x output speed spread across 11 providers serving identical MiniMax-M3 weights while blended prices vary only 2.2x.

**How much VRAM do I need to serve a 70B model?** More than the weights alone. A 70B model at 8-bit weights is roughly 70 GB, which fits an 80 GB card but leaves little room for the KV cache and activations that grow with context length and concurrency. A 141 GB H200 or a multi-GPU configuration provides the headroom that makes batching viable.
