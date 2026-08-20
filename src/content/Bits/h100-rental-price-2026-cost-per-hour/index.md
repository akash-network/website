---
title: "H100 Rental Price in August 2026: How Much Does an H100 Cost Per Hour by GPU Provider?"
pubDate: 2026-08-19
lastUpdated: 2026-08-19
author: "Sandeep Narahari, Contributor"
description: "How much does an NVIDIA H100 cost to rent in August 2026? Compare H100 prices from Akash, GPU clouds, and hyperscalers, with rates ranging from about $2 to $12 per GPU-hour."
tags: ["Guides"]
bannerImage: ./banner.webp
draft: false
faqAccordion: true
---

*By Sandeep Narahari, Contributor. Last updated: August 2026.*

Renting an NVIDIA [H100](https://www.nvidia.com/en-us/data-center/h100/) costs about \$2 to \$12 per GPU-hour on-demand in 2026. Most single-GPU on-demand rates cluster between \$2 and \$7, interruptible spot capacity can dip below \$2, and the priciest hyperscaler 8-GPU nodes reach roughly \$12.29 per GPU-hour. One widely cited aggregator puts the market median near \$3.37.

That range looks wide because "H100 rental" is not one product. The price depends on the provider, the form factor (PCIe, SXM5, or NVL), how many GPUs are in the node, the billing model, and the region. The tables below break those apart, with every rate checked on August 19, 2026.

## TL;DR

- On-demand H100 rentals run about \$2 to \$12 per GPU-hour in 2026. Most single-GPU on-demand list rates sit between \$2 and \$7, and [GetDeploying](https://getdeploying.com/gpus/nvidia-h100) puts the median across 50+ tracked providers near \$3.37.
- Hyperscalers charge the most. AWS P5 works out to about \$6.88 per GPU-hour, Azure's single-GPU NC H100 v5 is about \$6.98, and its 8-GPU ND H100 v5 SXM node is about \$12.29. Google Cloud A3 lands near \$11.06.
- Specialized clouds are cheaper. RunPod runs about \$2.59 (Community) to \$3.29 (Secure), and Lambda lists \$3.29 (PCIe) to about \$4.29 (SXM).
- Prices went up, not down, in early 2026. One-year contract rates jumped nearly 40%, from \$1.70 to \$2.35 per GPU-hour between October 2025 and March 2026, as capacity sold out ([SemiAnalysis](https://newsletter.semianalysis.com/p/the-great-gpu-shortage-rental-capacity)).
- Billing model matters as much as provider. Spot and multi-year reserved rates run roughly half of on-demand.
- Buying starts around \$25,000 per PCIe card, and a full 8-GPU server runs about \$250,000 to \$400,000 or more, so renting is usually more economical for variable or low-utilization workloads ([CloudZero](https://www.cloudzero.com/blog/h100-gpu-cost/)).

## How much does it cost to rent an H100 per hour in 2026?

An H100 rents for about \$2 to \$12 per GPU-hour on-demand in 2026, depending on the provider, form factor, and node size. The table lists current published rates normalized to a single H100 GPU-hour, with the exact instance and form factor named so the numbers compare on the same basis — confirm each against the provider before you commit.

Prices checked August 19, 2026, in US regions. Rates elsewhere can differ by 5% to 20%, and marketplace rates move continuously.

| Provider | Instance / SKU | Form factor | Billing type | Rate per GPU-hour |
|---|---|---|---|---|
| Vast.ai | Marketplace host | Mixed | Marketplace (interruptible) | ~\$1.65 and up |
| Akash | Marketplace | Mixed | Marketplace | ~\$2.52 |
| [RunPod](https://www.runpod.io/pricing) | Community Cloud | PCIe | On-demand | ~\$2.59 |
| RunPod | Secure Cloud | PCIe / SXM | On-demand | ~\$3.29 |
| Lambda | On-demand | PCIe | On-demand | ~\$3.29 |
| Lambda | On-demand | SXM5 | On-demand | ~\$3.99 to \$4.29 |
| CoreWeave | HGX H100 (8-GPU) | SXM5 | On-demand (8-GPU bundle) | ~\$6.16 |
| [AWS](https://aws.amazon.com/ec2/instance-types/p5/) | p5.4xlarge (1x), p5.48xlarge (8x) | SXM5 | On-demand | ~\$6.88 |
| [Azure](https://azure.microsoft.com/en-us/pricing/details/virtual-machines/) | NC40ads H100 v5 (1x) | NVL (94GB) | On-demand | ~\$6.98 |
| [Google Cloud](https://cloud.google.com/compute/gpus-pricing) | a3-highgpu-8g (8x) | SXM5 | On-demand | ~\$11.06 |
| Azure | ND96isr H100 v5 (8x) | SXM5 | On-demand | ~\$12.29 |

Source: [GetDeploying H100 index](https://getdeploying.com/gpus/nvidia-h100), cross-checked against each provider's own pricing page, all checked August 19, 2026. Akash figure checked August 19, 2026, on the [Akash GPU pricing page](/pricing/gpus/), where the live rate varies with marketplace supply — check the current number before deploying.

Two cautions on reading this table. First, these are different products: a marketplace host, a single-GPU PCIe instance, and an 8-GPU SXM node carry different performance, interconnect, and reliability, so a like-for-like comparison means matching form factor and node size, not just the dollar figure. Second, the AWS, Azure, and Google rates are standard on-demand list prices; the same providers sell the identical hardware for materially less through spot and multi-year commitments, covered next. For a worked example of what an Akash H100 rate means for a real workload's monthly bill, see the [Qwen self-hosting cost breakdown](/the-bid/qwen3-8-27b-managed-api-vs-self-hosting-gpu-cloud/).

## Why did H100 rental prices go up in 2026?

H100 rental prices rose in early 2026 because on-demand capacity effectively sold out, not because the hardware got more valuable. This caught out a market that spent 2025 expecting Hopper-generation rates to keep falling as newer chips shipped.

One-year H100 contract pricing climbed almost 40%, from a low of \$1.70 per GPU-hour in October 2025 to \$2.35 by March 2026, according to [SemiAnalysis](https://newsletter.semianalysis.com/p/the-great-gpu-shortage-rental-capacity). Available on-demand capacity was booked out, with teams that locked in early holding onto it even as rates climbed.

A likely driver, rather than a certainty, is that Blackwell lead times stretched into mid-2026, so demand backed up onto the H100 and kept Hopper rates firm. When the newest chips are constrained, the prior generation tends to stay in heavy use.

The practical lesson for buyers: in a tight market the useful question shifts from "what is the lowest rate" to "where is there capacity at all," which makes it worth pricing several providers and billing models rather than defaulting to one.

## Is it cheaper to rent an H100 on a hyperscaler or a marketplace / specialized GPU cloud?

Marketplace and specialized GPU clouds are both usually cheaper than hyperscalers for the same H100, often by half or more on standard on-demand rates. Bid-driven marketplaces like Akash tend to sit at the bottom of that range, specialized providers a step above, and hyperscalers well above both: marketplace rates start around \$1.65, specialized providers list roughly \$2 to \$4, and hyperscalers list roughly \$6.88 and up.

A hyperscaler is a large general-purpose cloud such as AWS, Microsoft Azure, or Google Cloud. A marketplace GPU cloud, like Akash, lets multiple providers bid to fill capacity, which tends to push rates toward the market floor. A specialized GPU cloud is a fixed-rate provider built specifically for AI compute. All three rent the same class of NVIDIA H100, but their pricing reflects very different cost structures.

| Provider category | Example H100 on-demand rate (USD per GPU-hour) | Relative cost |
|---|---|---|
| Marketplace / spot | ~\$1.65 and up | Lowest |
| Specialized GPU cloud | ~\$2 to \$4 | Low to mid |
| Hyperscaler (single-GPU) | ~\$6.88 to \$6.98 | High |
| Hyperscaler (8-GPU SXM node) | ~\$11 to \$12.29 | Highest |

Source: [CloudZero](https://www.cloudzero.com/blog/h100-gpu-cost/), checked August 19, 2026. Takeaway: the gap between marketplace/specialized rates and hyperscaler rates holds even before spot or reserved discounts are applied.

Two caveats keep this honest. AWS and Google Cloud often sell H100s only in 8-GPU instances, so a single-GPU workload can end up paying for capacity it does not use. And where a hyperscaler earns its price is compliance certifications, global regions, deep managed services, and stricter data residency, which matter for regulated or enterprise workloads — see [does enterprise AI leak your company data](/the-bid/does-enterprise-ai-leak-your-company-data/) for what that risk looks like in practice. If those needs are real, the premium can be worth it; if not, it is spend on features the workload never touches. Hyperscaler list prices are also the ceiling: spot and committed-use rates cut them substantially, as the next section shows.

## On-demand vs reserved vs spot: which H100 pricing model is cheapest?

Spot is the cheapest H100 pricing model, reserved sits in the middle, and on-demand costs the most. The gap is large enough to change your bill by half, which is why comparing a spot quote from one provider against an on-demand quote from another is misleading.

On-demand means paying the posted hourly rate with no commitment. Reserved means committing to a one-year or three-year term for a discount. Spot, also called interruptible, is unused inventory sold cheap that the provider can reclaim at short notice.

| Billing model | Typical price vs on-demand | Example rate (from ~\$3.37 median) | Best for |
|---|---|---|---|
| On-demand | Baseline | ~\$3.37/hr | Bursty, experimental, short jobs |
| 1-year reserved | ~25% less | ~\$2.53/hr | Steady, predictable workloads |
| 3-year reserved | ~45% less | ~\$1.85/hr | Long-term production at scale |
| Spot / interruptible | ~48% to 52% less | ~\$1.60/hr and below | Checkpointed training, batch jobs |

Source: [GetDeploying GPU Price Index](https://getdeploying.com/gpu-price-index), 2026. On hyperscalers the same pattern holds: AWS and Azure spot rates commonly run 60% to 80% below on-demand, and multi-year commitments cut the effective rate by roughly a third to a half.

The takeaway: match the billing model to the workload. A checkpointed training run tolerates spot interruptions and captures the deepest discount, while a latency-sensitive inference endpoint usually needs on-demand or reserved capacity. Once you've picked a rate, run it through the [usage cost calculator](/pricing/usage-calculator/) to translate an hourly rate into a monthly bill before you commit to a term.

## Should I rent or buy an H100 in 2026?

Renting is usually more economical for variable or low-utilization workloads, which describes most teams. Buying pays off only at steady, high utilization sustained over years.

A single H100 PCIe card costs about \$25,000 to \$30,000. SXM5 cards are generally sold inside 8-GPU systems rather than as loose cards, and a complete 8-GPU H100 server runs about \$250,000 to \$400,000 or more depending on configuration ([CloudZero](https://www.cloudzero.com/blog/h100-gpu-cost/)). SXM and PCIe refer to form factor: SXM5 delivers higher memory bandwidth and NVLink for multi-GPU jobs, while PCIe is cheaper and simpler for single-card use.

The card-only break-even is straightforward: at a \$27,000 PCIe card and a \$3.29/hour on-demand PCIe rate, you would need about 8,200 GPU-hours, roughly 340 days of continuous use, to match the purchase price. That figure ignores the server chassis, networking, power, cooling, and idle time, all of which push the real break-even later. One estimate that folds in a 30% to 50% infrastructure premium puts practical break-even near 18 months of continuous use ([CloudZero](https://www.cloudzero.com/blog/h100-gpu-cost/)); the true number depends heavily on utilization, so treat it as a planning estimate rather than a fixed rule.

The takeaway: rent for bursty, experimental, or uncertain workloads and avoid the capital outlay. Buy only if you can keep the GPUs busy near continuously for years and are equipped to operate the hardware. With newer parts arriving, a large multi-year H100 purchase also carries more depreciation risk than it did a year ago. For teams weighing self-hosting economics on rented H100s, this [self-hosting cost guide for Kimi K3, GLM-5.2, and DeepSeek V4 Flash](/the-bid/kimi-k3-vs-glm-5-2-vs-deepseek-v4-flash-0731-self-host-guide/) works through the cost per token in practice.

## What affects the price of an H100 per hour?

Five factors move the H100 hourly rate: provider category, billing model, form factor, node size, and region. Each explains why quotes for the "same" GPU differ so widely.

Provider category is the biggest lever, since hyperscaler on-demand runs multiples of specialized-cloud rates. Billing model comes next, as spot and reserved run roughly half of on-demand. Form factor matters because the H100 ships as PCIe, SXM5, and NVL with different memory and bandwidth, and SXM5 usually costs more. Node size matters because 8-GPU-only instances can force you to pay for capacity you do not use. Region matters too: one aggregator, [GPUPerHour](https://gpuperhour.com/), reports some non-US regions running 15% to 25% below US East for the same hardware, though the size of that gap varies by provider and SKU.

The takeaway: when you compare two H100 quotes, confirm they match on form factor, billing model, node configuration, and region. Otherwise "H100 price per hour" is not one number, it is five variables at once.

## How does the H100 compare to newer and older GPUs on price?

In broad terms the H100 sits between the newest Blackwell parts and the previous-generation A100 on price, though configuration and region cause enough overlap that this is a tendency, not a fixed hierarchy. Whether to rent an H100 at all depends on the model you are running.

For large-model training and high-throughput inference, the [B300, B200, and H200](/the-bid/nvidia-b300-vs-b200-vs-h200-best-gpu-for-self-hosting-ai/) offer more memory and throughput at a higher hourly rate, which can still win on total job cost when they finish faster. For smaller models, the previous-generation A100 is frequently cheaper per hour and adequate, as the [A100 GPU guide](/the-bid/nvidia-a100-gpu-guide-2026-specs-benchmarks-pricing/) covers in detail — and for many of those models, a single H100 is enough on its own, as this [Nemotron single-GPU setup](/the-bid/run-nvidia-nemotron-3-5-lightning-on-one-gpu-vllm-setup-for-h100-a100-on-akash/) shows. The H100 costs more per hour than the A100 but runs many training and inference jobs faster, so the two can land close on cost per token when the H100 finishes sooner; the exact ratio depends on the workload.

| GPU generation | Example model | Relative on-demand price vs H100 | Typical fit |
|---|---|---|---|
| Blackwell (newest) | B200, B300 | Higher | Frontier training, largest models |
| Hopper | H200 | Slightly higher | Memory-bound inference, 70B+ models |
| Hopper | H100 | Baseline | General training and inference |
| Ampere (prior gen) | A100 80GB | Lower | Fine-tuning, mid-size models |

The takeaway: the cheapest GPU-hour is not always the cheapest job. A faster card at a higher rate can finish sooner and cost less overall, so compare cost per completed run alongside the hourly rate, with the caveat that this depends on the specific workload and how well it uses the extra memory and throughput.

## FAQ

**How much does it cost to rent an H100 per hour?** An H100 rents for about \$2 to \$12 per GPU-hour on-demand in 2026, with most single-GPU on-demand rates between \$2 and \$7 and a median near \$3.37 per [GetDeploying](https://getdeploying.com/gpus/nvidia-h100). Specialized GPU clouds sit at the low end, while hyperscalers like AWS and Azure charge more for the same hardware.

**Why is the H100 so expensive to rent right now?** Prices rose in early 2026 because on-demand capacity effectively sold out. One-year contract rates jumped nearly 40%, from \$1.70 to \$2.35 per GPU-hour between October 2025 and March 2026, per [SemiAnalysis](https://newsletter.semianalysis.com/p/the-great-gpu-shortage-rental-capacity). Constrained supply of newer Blackwell chips likely pushed demand back onto the H100.

**Is it cheaper to rent an H100 on AWS or a specialized cloud?** Specialized GPU clouds are usually cheaper than AWS on standard on-demand rates. AWS P5 works out to about \$6.88 per GPU-hour and sells H100s mainly in 8-GPU instances, while dedicated providers commonly range from roughly \$2 to \$4 per GPU-hour. AWS spot and committed-use rates narrow the gap.

**What is the cheapest way to rent an H100?** Spot capacity is cheapest, dipping below \$2 per GPU-hour, but it is interruptible and best for checkpointed or batch work. Bid-driven marketplaces like Akash offer similarly low rates without that interruption risk. For steady workloads, a one-year or three-year reserved term cuts roughly 25% to 45% off on-demand ([GetDeploying index](https://getdeploying.com/gpu-price-index)).

**Should I rent or buy an H100 in 2026?** Rent for variable or low-utilization work. Buying starts around \$25,000 for a PCIe card, and a full 8-GPU server runs about \$250,000 to \$400,000 or more. Once infrastructure and idle time are included, one estimate puts break-even near 18 months of continuous use, so buying suits only steady, high-utilization workloads run over years ([CloudZero](https://www.cloudzero.com/blog/h100-gpu-cost/)).

**What is the difference between H100 PCIe, SXM5, and NVL pricing?** PCIe H100 80GB cards cost less to buy and rent and suit single-card use. SXM5 delivers higher memory bandwidth and NVLink for multi-GPU training and carries a rental premium, usually appearing in 8-GPU nodes. NVL is a higher-memory (94GB) PCIe-form variant used in some single-GPU instances, such as Azure's NC H100 v5.

**Is the H100 still worth renting over an H200 or A100?** Often yes. The H100 is cheaper per hour than the H200 and adequate for most training and inference, while the [A100](/the-bid/a100-40gb-vs-80gb-vram-bandwidth-mig-compared/) is cheaper still for smaller models. Compare cost per completed job, not just the hourly rate, since a faster card can finish sooner.
