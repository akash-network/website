---
title: "Gemini 3.7 Flash vs GPT-5.6 Terra vs Claude Sonnet 5: Pricing, Benchmarks & Performance (2026)"
pubDate: 2026-08-14
lastUpdated: 2026-08-14
author: "Sandeep Narahari, Contributor"
description: "Gemini 3.7 Flash is the cheapest of the three at a blended $1.35 per million tokens, GPT-5.6 Terra leads most agentic coding benchmarks, and Claude Sonnet 5 leads knowledge work. Full pricing, benchmark, and speed comparison for August 2026."
tags: ["Comparisons", "Alternatives", "Guides"]
bannerImage: ./banner.webp
draft: false
faqAccordion: true
metaTitle: "Gemini 3.7 Flash vs GPT-5.6 Terra vs Claude Sonnet 5 (2026)"
metaDescription: "Compare Gemini 3.7 Flash, GPT-5.6 Terra, and Claude Sonnet 5 on pricing, coding benchmarks, speed, and context windows to pick the right model for 2026."
---

*Last updated: August 2026*

As of August 14, 2026, [Gemini 3.7 Flash](https://gemini.google.com/) is the cheapest of the three at a blended \$1.35 per million tokens and the fastest by output speed, [GPT-5.6 Terra](https://openai.com/) leads most agentic coding benchmarks, and [Claude Sonnet 5](https://www.anthropic.com/) leads knowledge work. All three are closed, API-only models, and two have price increases already scheduled.

**TL;DR**

- Price: Gemini 3.7 Flash \$0.75 / \$3.75 per 1M tokens (intro, through December 31, 2026), Claude Sonnet 5 \$2 / \$10 (intro, through August 31, 2026), GPT-5.6 Terra \$2 / \$12. Blended 80/20: \$1.35, \$3.60, \$4.00.
- Overall intelligence: all three land within two points on Artificial Analysis's composite index: GPT-5.6 Terra 57, Gemini 3.7 Flash 56, Claude Sonnet 5 55.
- Agentic coding: GPT-5.6 Terra leads Terminal-Bench 2.1 at 87.4%, but Gemini 3.7 Flash is only 1.6 points behind at 85.8%, and both beat Claude Sonnet 5 at 80.4%.
- Where each one actually wins: Terra on long-horizon software engineering (DeepSWE 69.6%) and computer use (OSWorld 2.0 50.2%); Gemini 3.7 Flash on web development (WebDev Arena 1588 Elo), production code quality (FrontierCode 43.6%) and workflow automation (AutomationBench 30.4%); Sonnet 5 on knowledge work (GDPval-AA v2 Elo 1598) and Agent's Last Exam (33.3%).
- Speed: the Flash line generates roughly 3x the tokens per second of Sonnet 5 in matched testing, but Gemini's verbosity means cheap per token does not always mean cheap per task.
- Cheaper alternative: open-weight [Kimi K3](/bits/kimi-k3-vs-glm-5-2-vs-deepseek-v4-flash-0731-self-host-guide/) matches GPT-5.6 Terra at the top of that index (both 57), and GLM-5.2 scores 51 while blending to about \$1.10 per 1M tokens on [AkashML](/blog/akashml-managed-ai-inference-on-the-decentralized-supercloud/), undercutting even Gemini 3.7 Flash's introductory price.

The three models compared here target the same job: a fast, capable workhorse for coding and agents that teams run at high volume. Gemini 3.7 Flash launched August 13, 2026, three weeks after Gemini 3.6 Flash. GPT-5.6 Terra reached general availability July 9, 2026, as the mid-tier of OpenAI's Sol, Terra, and Luna lineup. Claude Sonnet 5 launched June 30, 2026. Each section below answers one question, and the post closes with a use-case recommendation.

## Which is cheapest: Gemini 3.7 Flash, GPT-5.6 Terra, or Claude Sonnet 5?

Gemini 3.7 Flash is the cheapest of the three by a wide margin as of August 14, 2026. At an 80/20 input-to-output token mix, Gemini 3.7 Flash blends to about \$1.35 per million tokens, against \$3.60 for Claude Sonnet 5 and \$4.00 for GPT-5.6 Terra.

| Model | Input (\$/1M tokens) | Output (\$/1M tokens) | Blended 80/20 (\$/1M tokens) | Long-context surcharge |
|---|---|---|---|---|
| Gemini 3.7 Flash | \$0.75 (intro) | \$3.75 (intro) | \$1.35 | None reported |
| Claude Sonnet 5 | \$2.00 (intro) | \$10.00 (intro) | \$3.60 | None |
| GPT-5.6 Terra | \$2.00 | \$12.00 | \$4.00 | 2x input above 272K, plus 10% regional uplift |

The blended figures assume an 80% input / 20% output workload; output-heavy agent runs shift the ranking toward whichever model has the lower output rate. Gemini 3.7 Flash also prices context caching at \$0.075 per million tokens during the introductory period. Pricing is drawn from Google's, OpenAI's, and Anthropic's own developer pricing pages, plus third-party pricing roundups from VentureBeat, MarkTechPost, eesel AI, and DataCamp.

## Are these prices about to change?

Yes. Two of the three current rates are temporary introductory prices, and both are scheduled to rise.

| Model | Current rate (\$/1M in / out) | Changes to | Effective date |
|---|---|---|---|
| Gemini 3.7 Flash | \$0.75 / \$3.75 | \$1.50 / \$7.50 | January 1, 2027 |
| Claude Sonnet 5 | \$2.00 / \$10.00 | \$3.00 / \$15.00 | September 1, 2026 |
| GPT-5.6 Terra | \$2.00 / \$12.00 | No increase announced | Cut from \$2.50 / \$15 on July 30, 2026 |

Gemini 3.7 Flash's price doubles on January 1, 2027, lifting its blended cost to about \$2.70 per million tokens. Claude Sonnet 5's introductory window closes August 31, 2026, after which its blended cost rises to \$4.20. GPT-5.6 Terra is the only one of the three whose most recent move was a cut rather than a scheduled increase, making its \$2 / \$12 the closest thing to a stable list price here. Multi-month cost models should use post-intro rates, not today's promotional ones.

## Which model wins on coding and agent benchmarks?

GPT-5.6 Terra leads most shared agentic coding benchmarks, but the margins over Gemini 3.7 Flash are small and Gemini 3.7 Flash costs about a third as much. Claude Sonnet 5 trails on agentic coding and leads on knowledge work.

Two caveats before the table. First, the cross-model numbers below come from Google's own published comparison table for the 3.7 Flash launch, so competitor scores are vendor-run rather than independently replicated. Second, on July 8, 2026, OpenAI published an audit finding that roughly 30% of [SWE-bench Pro](https://www.swebench.com/) tasks are flawed, containing overly strict tests or incomplete problem descriptions, so SWE-bench Pro results in particular should be read with caution.

| Benchmark (higher is better) | Gemini 3.7 Flash | GPT-5.6 Terra | Claude Sonnet 5 |
|---|---|---|---|
| Terminal-Bench 2.1 (CLI agents) | 85.8% | 87.4% | 80.4% |
| Terminal-Bench 3.0 (harder CLI) | 14.9% | 20.8% | 14.6% |
| DeepSWE v1.1 (long-horizon SWE) | 65.3% | 69.6% | 54.0% |
| OSWorld 2.0 (computer use) | 38.1% | 50.2% | Not in table |
| AutomationBench (workflow automation) | 30.4% | 23.6% | 10.7% |
| GDPval-AA v2 (knowledge work, Elo) | 1525 | 1578 | 1598 |
| Agent's Last Exam | 26.3% | Not in table | 33.3% |
| FrontierCode 1.1 Main (production code) | 43.6% | 41.3% | 42.7% |
| WebDev Arena (web development, Elo) | 1588 | 1523 | 1541 |
| SWE-bench Pro (repo bug-fixing) | Not published | 63.4% | 63.2% |
| AA Intelligence Index (composite) | 56 | 57 | 55 |

The pattern is clearer than a single winner. GPT-5.6 Terra takes the hardest agentic and computer-use tests, which is what you would expect at nearly three times Gemini's blended price, and edges the composite index by a single point. Gemini 3.7 Flash lands within 1.6 points of Terra on [Terminal-Bench](https://www.tbench.ai/) 2.1 and leads outright on web development, production code quality, and workflow automation, where Claude Sonnet 5's 10.7% is a notable weak spot. Claude Sonnet 5 wins the two knowledge-work measures. The composite spread across all three is two points, so on aggregate capability these are close substitutes and price becomes the differentiator. On SWE-bench Pro, Terra and Sonnet 5 remain effectively tied at 63.4% and 63.2%, a gap smaller than the benchmark's own error margin given the audit above.

## How do they compare on speed and latency?

The Flash line is roughly three times faster per token than Claude Sonnet 5 in matched testing, while GPT-5.6 Terra has by far the lowest time to first token. Independent speed figures for Gemini 3.7 Flash are not published yet, so the closest proxy is Gemini 3.6 Flash, which it directly replaces.

Reasoning effort dominates these numbers, so configurations must be matched to be meaningful: a model in maximum-thinking mode can post a time to first token measured in minutes rather than seconds, because thinking happens before the first token appears.

| Model and configuration | Output speed (tokens/sec) | Time to first token | AA Intelligence Index |
|---|---|---|---|
| Gemini 3.7 Flash | Not yet measured | Not yet measured | 56 |
| Gemini 3.6 Flash (high), as proxy | 221 to 238 | ~17.8 to 18.2s | 52 |
| GPT-5.6 Terra (medium) | 112.8 | 1.50s | 47 |
| GPT-5.6 Terra (xhigh) | 107.7 | 33.39s | 53 |
| Claude Sonnet 5 (non-reasoning, high effort) | 62.7 | 1.85s | 43 |
| Claude Sonnet 5 (adaptive reasoning, max effort) | 73.0 | 186.84s | 55 |

Read this by use case rather than by winner. For streaming chat interfaces where a user watches a cursor, time to first token is the number that matters, and GPT-5.6 Terra in non-reasoning mode is among the lowest-latency models measured at about 1.33 seconds on long prompts. For batch generation and code output, tokens per second matters more, and the Flash line wins clearly. For maximum accuracy, Claude Sonnet 5 at max effort posts the highest intelligence score of these configurations while being unusable for anything interactive.

One caveat that undercuts the headline price advantage: the Flash line is verbose. [Artificial Analysis](https://artificialanalysis.ai/) measured Gemini 3.6 Flash at about \$0.50 and 1.3 minutes per Intelligence Index task, and Gemini Flash models have historically generated well above the cross-model average in output tokens for the same work. A model that costs a fifth as much per token but writes twice as many tokens is not a fifth of the cost per task. Benchmark real token consumption on your own workload before assuming the pricing table is the whole story.

Artificial Analysis has scored Gemini 3.7 Flash at 56 on its Intelligence Index but has not yet published its throughput or latency, which is why the speed columns above still carry the 3.6 Flash proxy. Those two measures are rolling 72-hour medians that drift between windows, hence the ranges.

None of these three is the fastest option available, which matters if throughput is the binding constraint. NVIDIA's open-weight Nemotron 3.5 Lightning, released August 11, 2026, measured roughly 669 tokens per second in Artificial Analysis pre-release testing, nearly triple the Flash line, and completed a representative benchmark task in about half a minute against 3.4 minutes for gpt-oss-120b. It is a 30B model with 3B active parameters and scores 24 on the Intelligence Index, so it is far less capable than the three compared here; the point is that a purpose-built execution model can be an order of magnitude faster and cheaper for the high-volume, low-difficulty steps in an agent loop. It also fits on one 80GB card, so the deployment question collapses to a single GPU and a serving config rather than a multi-node cluster: [running Nemotron 3.5 Lightning on one H100 or A100 with vLLM](/bits/run-nvidia-nemotron-3-5-lightning-on-one-gpu-vllm-setup-for-h100-a100-on-akash/) covers the flags the hybrid Mamba architecture needs and what the A100 versus H100 choice costs per hour.

## What are the context windows and output limits?

All three offer a roughly 1M-token context window, so context size is not a deciding factor between them. The differences appear in maximum output length and input modalities.

| Model | Context window | Max output | Modalities | Knowledge cutoff |
|---|---|---|---|---|
| Gemini 3.7 Flash | 1M tokens | 64K tokens | Text, image, audio, video | March 2026 |
| GPT-5.6 Terra | ~1.05M tokens | 128K tokens | Text, image | Not stated in sources |
| Claude Sonnet 5 | 1M tokens | 128K tokens (to 300K via beta) | Text, image | Not stated in sources |

Gemini 3.7 Flash is the only one of the three that natively accepts audio and video, which matters for multimodal pipelines. GPT-5.6 Terra and Claude Sonnet 5 both allow double Gemini's output length, which matters for long-form generation and large diffs in coding agents. One cost detail specific to Claude Sonnet 5: its updated tokenizer counts roughly 1.0 to 1.35x more tokens for the same text than Sonnet 4.6, so real spend can exceed what the rate card implies.

## What are you actually locked into with these three models?

Three things, and none of them is simply that these models are closed. First, GPT-5.6 Terra charges a 10% uplift for regional processing, so data residency has a line-item cost rather than being a configuration choice. Second, the rate card moves unilaterally in both directions, as Google's scheduled January doubling and OpenAI's July cut demonstrate; a 12-month forecast built on today's introductory prices is wrong for two of the three. Third, migration means swapping one hosted API for another rather than owning the model, so there is no fallback to your own hardware if a vendor changes access, which is not hypothetical: Anthropic briefly suspended two other Claude models over export-control compliance in June 2026 and restored access three weeks later.

For most teams these are acceptable terms, and none of it is unique to these three; it is the shape of every closed frontier API. It matters here only because it sets up the comparison the next section makes on price.

## Can open-weight models match Gemini 3.7 Flash, GPT-5.6 Terra, and Claude Sonnet 5?

For a growing share of coding and agent work, yes, and at a fraction of the price. GLM-5.2 (a 753-billion-parameter mixture-of-experts model, meaning only a subset of parameters activate per token), DeepSeek V4 Flash 0731, and Kimi K3 all ship downloadable weights and now score within a few points of the two closed mid-tier models on the same independent index.

Measured on one consistent index rather than each vendor's own suite, the top open-weight model is level with the best of the three. On the Artificial Analysis Intelligence Index, Kimi K3 scores 57, matching GPT-5.6 Terra and sitting above Gemini 3.7 Flash at 56 and Claude Sonnet 5 at 55.

| Model | AA Intelligence Index | Input (\$/1M) | Output (\$/1M) | Blended 80/20 | Open weights |
|---|---|---|---|---|---|
| Kimi K3 | 57 | \$3.00 | \$15.00 | \$5.40 | Yes, custom license |
| GPT-5.6 Terra | 57 | \$2.00 | \$12.00 | \$4.00 | No |
| Gemini 3.7 Flash | 56 | \$0.75 | \$3.75 | \$1.35 | No |
| Claude Sonnet 5 | 55 | \$2.00 | \$10.00 | \$3.60 | No |
| GLM-5.2 on AkashML | 51 | \$0.77 | \$2.42 | \$1.10 | Yes, MIT |
| DeepSeek V4 Flash 0731 on AkashML | 50 | \$0.14 | \$0.28 | \$0.17 | Yes, MIT |

Read this as two separate findings. At the top of the table, [Kimi K3](/bits/kimi-k3-vs-glm-5-2-vs-deepseek-v4-flash-0731-self-host-guide/) shows open weights now reach frontier mid-tier capability, tying GPT-5.6 Terra on the index, but it costs \$5.40 blended against Terra's \$4.00, so the case for K3 is the weights themselves rather than the price. Lower down is where the money is: GLM-5.2 sits four points below Claude Sonnet 5 and six below GPT-5.6 Terra while blending to \$1.10 per million tokens, undercutting even Gemini 3.7 Flash's introductory rate, under a plain MIT license. DeepSeek V4 Flash 0731 gives up one further point at \$0.17 blended, roughly a twentieth of GPT-5.6 Terra. Index scores get revised as the index version changes, so compare within this table rather than against figures from an older one.

If self-hosting rather than a managed endpoint is the goal, the thing that trips people up first is that parameter count does not predict what the model needs. Kimi K3 carries 3.7x GLM-5.2's parameters but occupies only about twice the disk, because it ships natively in 4-bit; the 5.6TB figure circulating for it comes from assuming a 16-bit checkpoint that Moonshot never released, and budgeting against it overbuys by more than 3.5x. [Actual checkpoint sizes, licenses, and node requirements for Kimi K3, GLM-5.2, and DeepSeek V4 Flash 0731](/bits/kimi-k3-vs-glm-5-2-vs-deepseek-v4-flash-0731-self-host-guide/) settle whether self-hosting is even on the table before hardware enters the conversation.

The integration cost is close to zero either way. [AkashML](/blog/akashml-managed-ai-inference-on-the-decentralized-supercloud/) is a managed inference service on Akash Network, a GPU marketplace where independent providers bid to run workloads, and it exposes an OpenAI-compatible API, so pointing an existing app at it is a one-line base-URL change: the same effort as switching between any of the three closed models above. For [Claude Code](https://akashml.com/docs/guides/claude-code) specifically, you can set `ANTHROPIC_BASE_URL` to AkashML's Anthropic-compatible endpoint and remap tiers, slotting GLM-5.2 into the Opus tier and DeepSeek V4 Flash into the Sonnet tier, which runs agentic coding sessions against open weights without leaving the existing CLI workflow.

If you would rather rent hardware than pay per token, [Akash's marketplace rates](/pricing/gpus/) as of mid-August 2026 are \$1.86/GPU-hr for an A100, \$2.58 for an H100, \$4.37 for an H200, \$5.00 for a B200, and \$6.00 for a B300, against roughly \$7 to over \$10 per hour for hyperscaler H100 on-demand capacity. Which card you need is decided by memory rather than hourly price, and the ordering inverts once you divide by capacity: the B300 is the most expensive GPU per hour but the cheapest per gigabyte of VRAM, which is the number that predicts the bill for memory-bound serving. A single B300 holds DeepSeek V4 Flash 0731 with roughly 130GB left for KV cache, while Kimi K3 does not fit an 8x H200 node at all. [Comparing the B300, B200, and H200 for self-hosting](/bits/nvidia-b300-vs-b200-vs-h200-best-gpu-for-self-hosting-ai/) works through that math per model. Rates move with the reverse auction, so check [live Akash GPU pricing](/gpus-on-demand/) before planning around them.

The honest tradeoff: the closed three still lead on the hardest agentic and computer-use tasks, ship polished multimodal features, and require no infrastructure decisions. A rented node also bills whether requests arrive or not, so for spiky traffic a managed endpoint usually beats self-hosting on cost. What open weights buy is the option: price set by competition rather than by a vendor, plus air-gapping, data residency, custom fine-tunes, and the right to keep running a model after its creator deprecates it. The real 2026 decision is not only which of the three closed APIs to pick, but whether a closed API is the right layer at all.

## Which model should you choose for your use case?

Pick Gemini 3.7 Flash for cost and throughput, GPT-5.6 Terra for the hardest agentic work and lowest latency, Claude Sonnet 5 for knowledge work and accuracy at max effort, and an open-weight model when self-hosting or high-volume economics outweigh the last few benchmark points.

| If your priority is | Choose | The deciding number |
|---|---|---|
| Lowest cost per token right now | Gemini 3.7 Flash | \$1.35 blended, about a third of the other two |
| Terminal and CLI agents | GPT-5.6 Terra | 87.4% Terminal-Bench 2.1, with Gemini 1.6 points behind |
| Long-horizon software engineering | GPT-5.6 Terra | 69.6% DeepSWE v1.1 vs 65.3% and 54.0% |
| Agentic computer use | GPT-5.6 Terra | 50.2% OSWorld 2.0 vs 38.1% for Gemini |
| Enterprise workflow automation | Gemini 3.7 Flash | 30.4% AutomationBench vs 23.6% and 10.7% |
| Web development and UI generation | Gemini 3.7 Flash | 1588 WebDev Arena Elo vs 1541 and 1523 |
| Production code quality | Gemini 3.7 Flash | 43.6% FrontierCode 1.1 vs 42.7% and 41.3% |
| Knowledge work and professional research | Claude Sonnet 5 | 1598 Elo GDPval-AA v2, highest of the three |
| Streaming chat where latency is visible | GPT-5.6 Terra (non-reasoning) | ~1.33s time to first token |
| Batch generation throughput | Gemini 3.7 Flash | Flash line at 237.8 tokens/sec vs 62.7 for Sonnet 5 |
| Audio or video input | Gemini 3.7 Flash | Only one of the three with native audio and video |
| Longest generated output | GPT-5.6 Terra or Claude Sonnet 5 | 128K max output vs 64K for Gemini 3.7 Flash |
| Predictable cost over 12 months | GPT-5.6 Terra | Only one of the three with no scheduled increase |
| Highest capability with open weights | Kimi K3 | Index 57, level with GPT-5.6 Terra |
| Self-hosting, air-gap, or data residency | Any open-weight model | The closed three publish no weights at all |
| Lowest cost at high volume | DeepSeek V4 Flash 0731 on AkashML | \$0.17 blended, about a twentieth of Terra |

For most teams the practical answer is two models rather than one: a cheap, fast default for the bulk of calls and a stronger model reserved for the hard ones. Because all four options above speak an OpenAI-compatible API, routing between them is a configuration choice rather than a rewrite, which is what makes these cost differences worth acting on.

## FAQ

**Is Gemini 3.7 Flash cheaper than Claude Sonnet 5 and GPT-5.6 Terra?** Yes, as of August 2026. Gemini 3.7 Flash blends to about \$1.35 per million tokens at an 80/20 input-output mix, versus \$3.60 for Claude Sonnet 5 and \$4.00 for GPT-5.6 Terra. Its introductory rate expires December 31, 2026, after which the price doubles and the gap narrows.

**Which model is best for coding agents?** GPT-5.6 Terra leads most agentic coding benchmarks, scoring 87.4% on [Terminal-Bench](https://www.tbench.ai/) 2.1 and 69.6% on DeepSWE v1.1. Gemini 3.7 Flash is close behind at 85.8% and 65.3% for about a third of the price. Claude Sonnet 5 trails both on agentic coding at 80.4% and 54.0%.

**Which model scores highest overall?** GPT-5.6 Terra leads by one point on the [Artificial Analysis](https://artificialanalysis.ai/) composite Intelligence Index at 57, with Gemini 3.7 Flash at 56 and Claude Sonnet 5 at 55. A two-point spread means aggregate capability is close to equivalent across the three, so workload fit and price matter more than the ranking.

**Which model is fastest?** The Flash line is fastest by throughput, generating 237.8 tokens per second in matched testing against 62.7 for Claude Sonnet 5. GPT-5.6 Terra has the lowest time to first token at roughly 1.33 to 1.50 seconds in non-reasoning and medium modes, which matters more for streaming chat than raw throughput does.

**Does Gemini 3.7 Flash being cheaper per token mean it is cheaper per task?** Not necessarily. Gemini Flash models generate more output tokens than the cross-model average for the same work, so a lower per-token rate can be partly offset by longer outputs. Artificial Analysis measured Gemini 3.6 Flash at about \$0.50 per benchmark task. Measure token consumption on your own workload.

**Can I self-host any of these three models?** No. Gemini 3.7 Flash, GPT-5.6 Terra, and Claude Sonnet 5 are all closed, API-only models with no published weights. Self-hosting, air-gapped deployment, and full data-residency control require open-weight models, which run on your own hardware or through a GPU marketplace such as [Akash](/pricing/gpus/).

**When do these prices go up?** Claude Sonnet 5 rises from \$2/\$10 to \$3/\$15 on September 1, 2026. Gemini 3.7 Flash doubles from \$0.75/\$3.75 to \$1.50/\$7.50 on January 1, 2027. GPT-5.6 Terra has no announced increase; its last move was a cut to \$2/\$12 on July 30, 2026.

**What is the difference between GPT-5.6 Sol, Terra, and Luna?** They are three tiers of OpenAI's GPT-5.6 family. Sol is the flagship at \$5/\$30 per million tokens, Terra is the mid-tier compared here at \$2/\$12, and Luna is the low-cost tier at \$0.20/\$1.20. Terra is the closest match to Gemini 3.7 Flash and Claude Sonnet 5 on positioning.

**Are these benchmark scores independently verified?** Partly. The cross-model scores here come from Google's own launch comparison table, so competitor numbers are vendor-run. OpenAI also published an audit on July 8, 2026 finding roughly 30% of SWE-bench Pro tasks flawed. Treat all figures as directional and test on your own workload.

**How much cheaper are open-weight models than these three?** GLM-5.2 costs about \$1.10 per million tokens blended on [AkashML](/blog/akashml-managed-ai-inference-on-the-decentralized-supercloud/) and DeepSeek V4 Flash 0731 about \$0.17, against \$1.35 for Gemini 3.7 Flash, \$3.60 for Claude Sonnet 5, and \$4.00 for GPT-5.6 Terra. GLM-5.2 undercuts all three while scoring 51 on the Artificial Analysis Intelligence Index against their 52 to 55.
