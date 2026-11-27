---
title: "Neocloud vs Hyperscaler vs GPU Marketplace: Where to Run Open-Source AI in 2026"
description: "H100 and A100 prices per GPU-hour on AWS, Google Cloud, CoreWeave, RunPod and Akash, plus how hyperscalers, neoclouds and GPU marketplaces differ."
pubDate: 2026-11-27
author: "Sandeep Narahari, Contributor"
tags: ["Guides"]
bannerImage: ./banner.webp
draft: false
faqAccordion: true
metaTitle: "Neocloud vs Hyperscaler vs GPU Marketplace: GPU Costs (2026)"
metaDescription: "H100 and A100 prices per GPU-hour on AWS, Google Cloud, CoreWeave, RunPod and Akash, plus how hyperscalers, neoclouds and GPU marketplaces differ."
---

_By Sandeep Narahari, Contributor. Last updated: November 27, 2026. Prices checked November 25 to 27, 2026._

## TL;DR

- **Hyperscalers** (AWS, Google Cloud) charge the most per GPU: \$6.88 to \$11.06 per H100 GPU-hour on demand. You pay for the widest set of managed services around the GPU.
- **Neoclouds** run their own GPU fleets built for AI. CoreWeave lists an H100 at about \$6.16 per GPU-hour, sold as 8-GPU nodes. RunPod lists \$2.69 to \$4.39 for an H100 SXM.
- **GPU marketplaces** let a network of GPU providers, including enterprise data centers, compete for your job. On Akash, an open GPU cloud, H100 SXM GPUs were \$2.55 per GPU-hour on November 27, 2026. You rent one GPU or many, running in minutes by credit card, with no quota request, no egress fees and no long-term contract.
- **For open-source models,** the same H100 runs the same model at the same speed wherever it sits. A lower hourly price means a lower cost per token. Many teams keep their apps on a hyperscaler and run their GPU work on Akash.

Open-source models like Llama, Qwen and DeepSeek have made the GPU itself the main cost of running AI. Where you rent that GPU now decides most of the bill. This guide compares the three ways to rent one: hyperscalers, neoclouds and GPU marketplaces.

## What's the difference between a hyperscaler, a neocloud and a GPU marketplace?

The difference is who owns the GPUs and how you buy them. A hyperscaler rents GPUs as one service among hundreds. A neocloud is a cloud built only for AI, running its own GPU fleet. A GPU marketplace connects you to many GPU providers, from enterprise data centers to specialist operators, and you pick one.

|                         | Hyperscaler                                                        | Neocloud                                            | GPU marketplace                                                                                              |
| ----------------------- | ------------------------------------------------------------------ | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Examples                | AWS, Google Cloud, Azure                                           | CoreWeave, Lambda, Nebius                           | Akash                                                                                                        |
| Who owns the GPUs       | The cloud itself                                                   | The cloud itself, in owned or leased data centers   | A network of GPU providers, from verified enterprise data centers to independent operators                   |
| How you get an H100     | Quota request, or a reserved Capacity Block                        | On demand or reserved, often as 8-GPU nodes         | Add a card and deploy in 1 to 3 minutes; reserved clusters by quote                                          |
| H100 price per GPU-hour | \$6.88 to \$11.06                                                  | About \$6.16 (CoreWeave)                            | \$2.55 (Akash, Nov 27, 2026)                                                                                 |
| Strengths               | Managed databases, identity, compliance and support in one account | GPU-first networking and support, large clusters    | GPUs in minutes by card, transparent pricing, no egress fees, no lock-in, data kept in the region you choose |
| Trade-offs              | Highest GPU prices, egress fees, capacity can be scarce            | Fewer managed services; large nodes suit large jobs | Large multi-node clusters are quoted as reserved capacity                                                    |

RunPod sits between the last two. Its Secure Cloud runs in partner data centers, like a neocloud. Its Community Cloud runs on machines from independent hosts, like a marketplace. For a full comparison, see [Akash vs RunPod](/explore/compare/akash-vs-runpod/).

## H100 and A100 prices per GPU-hour: five providers compared

On-demand H100 prices ranged from \$2.55 to \$11.06 per GPU-hour on November 27, 2026. The highest price is more than four times the lowest, for the same 80 GB GPU.

| Provider                | Type            | H100 80GB, per GPU-hour          | A100 80GB, per GPU-hour         | How it's sold                               |
| ----------------------- | --------------- | -------------------------------- | ------------------------------- | ------------------------------------------- |
| [Akash](/pricing/gpus/) | GPU marketplace | \$2.55 (SXM5)                    | \$1.07 to \$1.91 (SXM4)         | 1 GPU or more, from GPU providers worldwide |
| RunPod Community Cloud  | Hybrid          | From \$2.69 (SXM)                | From \$1.39 (SXM)               | 1 GPU or more                               |
| RunPod Secure Cloud     | Hybrid          | \$4.39 (SXM)                     | \$2.19 (SXM)                    | 1 GPU or more                               |
| CoreWeave               | Neocloud        | \$6.16 (\$49.24 per 8-GPU node)  | \$2.70 (\$21.60 per 8-GPU node) | 8-GPU nodes                                 |
| AWS                     | Hyperscaler     | \$6.88 (p5.48xlarge, \$55.04)    | \$3.43 (p4de.24xlarge, \$27.45) | 1 or 8 GPUs (H100), 8 GPUs (A100), US East  |
| Google Cloud            | Hyperscaler     | \$11.06 (a3-highgpu-8g, \$88.49) | \$5.07 (a2-ultragpu-1g)         | H100 in 8-GPU VMs; A100 from 1 GPU          |

All prices are on-demand list prices in USD, checked November 25 to 27, 2026. Committed-use and reserved discounts lower the hyperscaler prices; see the [methodology](#methodology-and-pricing-snapshot) below.

For H100 prices from more providers, including Azure and Lambda, and monthly and yearly totals, see our [H100 rental price guide](/the-bid/h100-rental-price-2026-cost-per-hour/).

## Cost per million tokens: the same H100 on five clouds

An H100 running the same model with the same settings produces the same tokens per second on any cloud. So cost per token follows the hourly price. At 2,500 output tokens per second, a million tokens costs \$0.28 on Akash and \$0.76 on AWS.

**Cost per 1M tokens = price per GPU-hour ÷ (tokens per second × 3,600) × 1,000,000**

| Provider            | H100 per GPU-hour | At 1,000 tokens/s | At 2,500 tokens/s | At 5,000 tokens/s |
| ------------------- | ----------------- | ----------------- | ----------------- | ----------------- |
| Akash               | \$2.55            | \$0.71            | \$0.28            | \$0.14            |
| RunPod Secure Cloud | \$4.39            | \$1.22            | \$0.49            | \$0.24            |
| CoreWeave           | \$6.16            | \$1.71            | \$0.68            | \$0.34            |
| AWS                 | \$6.88            | \$1.91            | \$0.76            | \$0.38            |
| Google Cloud        | \$11.06           | \$3.07            | \$1.23            | \$0.61            |

_Cost per million output tokens, using the on-demand prices above._

Would rather pay per token than run GPUs? [AkashML](https://akashml.com) serves open models through an OpenAI-compatible API: Llama 3.3 70B at \$0.20 input and \$0.52 output per million tokens, and GPT OSS 120B at \$0.037 and \$0.187. New accounts get free credit with no card.

Your throughput depends on the model, its precision, the batch size and the serving engine. Measure it once with vLLM's serving benchmark, then read your cost from the row for your provider. For when renting a GPU beats paying a per-token API, see [Qwen3.8-27B: managed API vs self-hosting](/the-bid/qwen3-8-27b-managed-api-vs-self-hosting-gpu-cloud/).

## Is CoreWeave cheaper than AWS?

Yes, at list prices, but by less than most people expect. A CoreWeave H100 costs about 10% less per GPU-hour than an AWS H100: \$6.16 against \$6.88. For the A100 80GB the gap is about 21%: \$2.70 against \$3.43.

CoreWeave sells H100s as 8-GPU nodes, so its smallest H100 order costs \$49.24 an hour. AWS also offers a single-GPU H100 instance (p5.4xlarge) at \$6.88 an hour. AWS Savings Plans and Capacity Blocks lower its effective price for committed use, which narrows the gap further.

The bigger price difference is with RunPod and Akash. An H100 there costs \$2.55 to \$4.39 per GPU-hour, and you can rent one GPU at a time. For a model that fits on one GPU, that matters more than the gap between CoreWeave and AWS.

## Why AI teams run their GPUs on Akash

Akash is an open GPU cloud: a global network of GPU providers, from verified enterprise data centers to specialist GPU operators, compete for your job, and you keep full control of your stack. Here's what that gives you, with the proof behind each point.

| What you get                                 | How it works                                                                                                                                                                                                               | Proof                                                                                            |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| GPUs in minutes, no quota or sales call      | Add a credit card and every GPU type unlocks. Your container is running in 1 to 3 minutes.                                                                                                                                 | [Akash quick start](/docs/getting-started/quick-start/)                                          |
| Transparent pricing                          | Live prices for every GPU are public. You see every provider's quote before anything runs, and the quote you accept is the rate you pay, locked for the life of the deployment.                                            | [Akash GPU pricing](/pricing/gpus/)                                                              |
| The hourly rate is the whole bill            | No egress or bandwidth fees, so responses, checkpoints and datasets leave for free.                                                                                                                                        | At 30 TB a month, egress was 22.9% of an AWS H100 bill and 31.5% on Google Cloud (pricing study) |
| One H100, not eight                          | Rent a single GPU, or as many as you need. No 8-GPU minimum.                                                                                                                                                               | CoreWeave's smallest H100 order is an 8-GPU node at \$49.24 an hour                              |
| No vendor lock-in                            | Any standard Docker image runs unchanged, and the same deployment file moves between providers and regions. Close a deployment any time and billing stops.                                                                 | AWS Capacity Blocks can't be cancelled once bought                                               |
| Sovereign AI: you decide where data runs     | Require a region, country or data center in your deployment, so your data and models stay in the jurisdiction you choose, for GDPR or data-residency rules.                                                                | [Provider location attributes](/docs/learn/core-concepts/providers-leases/)                      |
| Confidential computing                       | Run inside hardware-isolated Trusted Execution Environments on AMD SEV-SNP or Intel TDX, with NVIDIA GPU Confidential Computing. The provider can't read your model or data in memory, and attestation lets you verify it. | [Confidential compute docs](/docs/learn/core-concepts/confidential-compute/) (experimental)      |
| Reserved clusters with InfiniBand and an SLA | Reserved B300, B200, H200, H100 and A100, committed for your term, on bare metal with InfiniBand for multi-node training. SLA-backed, with no multi-year lock-in.                                                          | [Akash enterprise](/use-cases/enterprise/)                                                       |
| You choose the provider                      | See each provider's region, 7-day uptime and price before you deploy. Filter to audited providers and verified enterprise data centers with redundant power and networking.                                                | Akash Console shows all three for every quote                                                    |
| Open models by API                           | Skip GPU operations: call Llama, Qwen, GLM, Kimi or GPT OSS through an OpenAI-compatible API and pay per token.                                                                                                            | [AkashML](https://akashml.com)                                                                   |
| Normal cloud billing                         | Pay by card in USD for on-demand GPUs, or by invoice for reserved clusters.                                                                                                                                                | [Akash GPU pricing](/pricing/gpus/)                                                              |

Teams in production on Akash include [Razer](/use-cases/enterprise/), which reported \$0.01 per image and a 3.24-second average response for its AVA Mini campaign. [Astria moved its image models to Akash](/blog/why-astria-moved-its-ai-image-workloads-to-akash-network/) after trying Lambda, AWS and RunPod.

## Keep your apps where they are

You don't have to move your whole stack. Keep your application and databases on AWS or Google Cloud, and move the GPU bill, usually the biggest line, to Akash. Any Docker image runs as it is, and vLLM serves an OpenAI-compatible endpoint, so your app changes one URL. See [Akash vs AWS](/explore/compare/akash-vs-aws/) for the full comparison.

## Which GPU setup fits your workload?

Match the setup to how long you need the GPUs and how many you need together.

| Buyer                              | Typical workload                                          | What matters most                                         | How to run it on Akash                                                                    |
| ---------------------------------- | --------------------------------------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Researcher fine-tuning open models | LoRA or full fine-tunes on 1 to 8 GPUs, for hours or days | Price per hour, a fast start, stopping without a contract | On-demand H100 or A100, billed by the hour                                                |
| Developer serving an LLM           | One model on 1 or 2 GPUs, running all day                 | Steady price, no egress fees, uptime                      | On-demand GPU from an audited provider, served with vLLM as an OpenAI-compatible endpoint |
| Startup scaling GPU workloads      | Usage that grows month to month                           | More GPUs when needed, no lock-in                         | Start on demand, then move to a reserved cluster once usage is steady                     |
| Team training a larger model       | 16 to hundreds of GPUs for weeks                          | NVLink, InfiniBand, a fixed term, support                 | Reserved bare-metal cluster with SLA-backed uptime                                        |
| Product team shipping AI features  | Calls to an open model, with traffic that rises and falls | Model outputs, not GPU operations; no cost when idle      | AkashML, an OpenAI-compatible API billed per token                                        |

See live prices for every GPU on [Akash GPU pricing](/pricing/gpus/), or [request a reserved cluster](/use-cases/enterprise/) for training and steady production traffic.

## Methodology and pricing snapshot

All prices are on-demand list prices in USD per GPU-hour, checked between November 25 and 27, 2026. Where a provider sells only multi-GPU machines, we divided the machine price by its GPU count.

- **Akash:** the average of recent provider bids per GPU-hour, weighted by each provider's GPU count, from the Akash Console GPU price feed on November 27, 2026. 40 H100 SXM5 GPUs and 120 A100 80GB GPUs were listed. CPU, memory and storage requested with the GPU can change the bid; estimate them with the [Usage Pricing Calculator](/pricing/usage-calculator/).
- **AWS:** Linux on-demand prices in US East (N. Virginia). Instance prices include the host CPUs, memory and local NVMe storage.
- **Google Cloud:** on-demand prices for A3 and A2 Ultra machine types as published on Google's [accelerator-optimized pricing page](https://cloud.google.com/compute/gpus-pricing).
- **CoreWeave:** North America on-demand instance prices.
- **RunPod:** Secure Cloud prices and Community Cloud starting prices for SXM GPUs.

Not included: spot and preemptible prices, committed-use and reserved discounts, storage, and egress. Akash and RunPod don't charge egress; AWS and Google Cloud do.

## FAQ

**What is the difference between a neocloud and a hyperscaler?** A hyperscaler such as AWS or Google Cloud sells GPUs as one of hundreds of cloud services. A neocloud such as CoreWeave or Lambda is built only for AI and runs its own GPU fleet. Neoclouds usually charge less per GPU-hour; hyperscalers offer more managed services around the GPU.

**Is Akash a neocloud?** No. Akash is an open GPU cloud built on a global network of GPU providers, including verified enterprise data centers. Providers compete for your job, and you choose who runs it, in which region, on which hardware. Like a neocloud, it focuses on AI compute, and it adds reserved clusters with an SLA and open models by API.

**Which GPU cloud is best for running open-source AI models?** For models that run on 1 to 8 GPUs, an open GPU cloud like Akash gets you the GPU in minutes and the lowest cost per token in this comparison. An H100 costs \$2.55 per GPU-hour on Akash, against \$6.16 to \$11.06 on CoreWeave, AWS and Google Cloud, with no egress fees. Teams whose apps run on a hyperscaler can keep them there and move only the GPU work.

**Do GPU clouds charge egress fees?** Some do. AWS and Google Cloud charge for data leaving their networks. Akash and RunPod don't charge egress fees, so serving an inference endpoint or moving checkpoints out adds no per-GB cost.

**Can I run Llama, Qwen or DeepSeek on Akash?** Yes. Akash runs any Docker container, so you can serve open-source models with vLLM, SGLang, Ollama or Hugging Face Transformers. Choose the GPU by the model's memory needs: an 80 GB [H100](/pricing/gpus/h100/) or [A100](/pricing/gpus/a100/) fits models up to about 30B parameters in FP8, or about 70B in 4-bit.

**Is Akash reliable enough for production inference?** Yes. Akash Console shows each provider's 7-day uptime before you deploy. Audited providers pass a review of their infrastructure and a long-running benchmark workload, and you can limit a deployment to audited providers only. For production traffic that needs guaranteed uptime, reserved bare-metal clusters come with SLA-backed uptime, NVLink and InfiniBand.

**Do I need a long-term contract to rent GPUs?** Not on Akash. On-demand GPUs have no minimum term: the price is locked when you accept a provider's quote, and billing stops when you close the deployment. Reserved clusters are committed for the term you choose, with no multi-year lock-in. By contrast, AWS Capacity Blocks can't be cancelled once bought.

**Can I choose where my AI data is stored and processed?** Yes. On Akash, every provider publishes its region, country and data center, and your deployment can require them. Your data and models run only in the jurisdiction you pick, which supports GDPR, data-residency and sovereign AI requirements. On a hyperscaler you choose a region, but the provider is always the same company.

**Does Akash support confidential computing?** Yes, as an experimental feature. Workloads can run inside Trusted Execution Environments on AMD SEV-SNP or Intel TDX, with NVIDIA GPU Confidential Computing on supported hardware. Memory is encrypted by the hardware, so the provider can't read your model or data, and attestation proves the workload runs in a genuine TEE.

**How is GPU pricing set on Akash?** Providers quote for each deployment, and you see every quote, with the provider's region and uptime, before anything runs. The quote you accept is the rate you pay, locked for the life of the deployment, with no egress fees on top. Akash publishes live average prices for every GPU on its [pricing page](/pricing/gpus/).

**How much does it cost to self-host an open-source LLM?** Divide the GPU's hourly price by the tokens it produces per hour. For example, if an H100 at \$2.55 per hour produced 2,000 output tokens per second, the cost would be about \$0.35 per million tokens. Measure your own throughput, because it changes with the model, batch size and serving settings.
