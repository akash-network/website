---
title: "B300 GPU Rental Cost in 2026: $6/Hour for 288GB SXM6 for AI Inference & Training"
pubDate: 2026-09-03
lastUpdated: 2026-09-03
author: "Sandeep Narahari, Contributor"
description: "How much it costs to rent an NVIDIA B300 GPU per hour in 2026, what 288GB of HBM3e gets you over an H200 or H100, and when renting beats buying a $53,000 card."
tags: ["Guides"]
bannerImage: ./banner.webp
draft: false
faqAccordion: true
metaTitle: "B300 GPU Rental Price 2026: Cost Per Hour"
metaDescription: "How much it costs to rent an NVIDIA B300 per hour in 2026, what 288GB HBM3e gets you over an H200 or H100, and when renting beats buying."
---

*By Sandeep Narahari, Contributor. Last updated: September 2026.*

Renting an NVIDIA B300 costs about \$6.00 per GPU-hour as of September 2026, per [Akash GPU pricing](/pricing/gpus/), against a purchase price near \$53,000 for the card alone.

## TL;DR

- **Entry rate:** billed on demand, per full B300 — see [Akash GPU pricing](/pricing/gpus/).
- **Relative cost:** a B300 runs roughly 1.4x an H200 rate and about 2.3x an H100 rate on the same marketplace, for 2x and 3.6x the memory respectively.
- **What you get:** 288 GB of HBM3e at 8 TB/s in an SXM6 form factor, roughly 3.6x the memory of an H100 and 50% more than a B200.
- **Rent vs buy:** a single B300 costs roughly \$53,000 to purchase and a full 8-GPU DGX B300 system runs \$300,000 to \$500,000, so renting wins for anything below sustained multi-year utilization.
- **Best fit:** memory-bound inference on 100B-plus parameter models, long-context serving, and fine-tuning runs measured in days or weeks.

## What does the B300 rate actually add up to per day, month, and year?

At that hourly rate, one B300 costs \$144 per day, \$4,320 per month at 720 hours, and \$52,560 per year at continuous 8,760-hour use. An 8-GPU node costs eight times those figures.

| Duration | 1x B300 | 8x B300 node |
|---|---|---|
| 24 hours (1 day) | \$144 | \$1,152 |
| 168 hours (1 week) | \$1,008 | \$8,064 |
| 720 hours (1 month) | \$4,320 | \$34,560 |
| 8,760 hours (1 year) | \$52,560 | \$420,480 |

The number that matters for budgeting is the monthly figure at your real duty cycle, not the 24/7 figure. A team running eight B300s eight hours a day on weekdays consumes roughly 176 GPU-hours per GPU per month, which comes to about \$1,056 per GPU rather than \$4,320, or \$8,448 for the node. Model your actual schedule before you compare an hourly rate against a purchase price, because idle hours are the single largest variable in the total.

## What are you actually renting when you rent a B300?

A B300 rental gives you one NVIDIA Blackwell Ultra GPU with 288 GB of HBM3e memory at 8 TB/s of bandwidth, in the SXM6 socketed form factor rather than a PCIe card. That memory sits on eight 12-high HBM3e stacks behind a wide memory interface, and each GPU links to its neighbors over NVLink for multi-GPU scaling.

| Specification | B300 | B200 | H200 | H100 SXM |
|---|---|---|---|---|
| Memory (GB) | 288 HBM3e | 192 HBM3e | 141 HBM3e | 80 HBM3 |
| Memory bandwidth (TB/s) | 8.0 | 8.0 | 4.8 | 3.35 |
| Form factor | SXM6 | SXM | SXM5 | SXM5 |
| Dense FP8 (PFLOPS) | ~5 | ~5 | not supported | not supported |

The B300 is a memory part before it is a compute part. Bandwidth did not move from the B200, and dense FP8 throughput is roughly the same across both parts, which means a serving stack that has not adopted NVFP4 gets no compute benefit at all and is paying purely for capacity. Two capabilities were deliberately cut to fund that design: INT8 throughput sits well under FP8 because that silicon budget went to NVFP4, and FP64 was cut back for the same reason. The result is a part that handles classical HPC worse than the B200 it replaces. See our [B300 vs B200 vs H200 comparison](/the-bid/nvidia-b300-vs-b200-vs-h200-best-gpu-for-self-hosting-ai/) for the full spec breakdown.

What you are renting, then, is capacity rather than raw throughput, and capacity is where the B300 prices well. At [its entry rate](/pricing/gpus/), a B300 returns more GPU memory per dollar-hour than an H100 or an H200 at their [respective rates](/pricing/gpus/). If your constraint is fitting a model, that is the number to optimize. If your constraint is FLOPS, it is not.

## Which inference workloads make renting a B300 worth it?

Renting a B300 pays off for inference when a model plus its KV cache does not fit on cheaper hardware, because avoiding a multi-GPU shard removes both interconnect overhead and the cost of a second or fourth GPU. Our own arithmetic on this puts a single B300 comfortably holding models in the roughly 235B to 428B-parameter range at FP8 — see [which workloads actually benefit from the B300's 288GB](/the-bid/b300-288gb-vram-ai-workloads-2026/) for the model-by-model breakdown.

Workloads where the B300 rental is the right call:

- **Large open-weight models on a single GPU.** A 100B to 250B-parameter model that needs two H200s or four H100s can often sit on one B300, which collapses tensor-parallel communication entirely.
- **Long-context serving.** The extra on-package capacity exists specifically so a full model and a large KV cache stay resident without offloading, which is the difference between a 128K-context product that works and one that thrashes.
- **Reasoning models with long output chains.** NVIDIA rates Blackwell Ultra attention throughput at twice the B200's, and reasoning workloads are decode-bound rather than bound by training arithmetic.
- **High-concurrency batch inference.** More resident KV cache means more simultaneous sequences per GPU, which lowers cost per token even at a higher cost per hour.

Workloads where a B300 rental wastes money: 7B to 30B models that fit comfortably on an H100 or an RTX PRO 6000, FP8-only serving stacks that cannot reach NVFP4, and anything FP64-heavy. For those, an H100 does the same job for a fraction of the price — check [current rates](/pricing/gpus/).

## When does renting a B300 make more sense than buying for training?

Renting a B300 makes more sense than buying whenever your training utilization sits below roughly 60% to 70% sustained over multiple years, because market estimates put a single B300 near \$53,000 and a fully configured 8-GPU DGX B300 system between \$300,000 and \$500,000.

Rent when any of these are true:

- **Your runs are bursty.** Fine-tuning cycles measured in days or weeks, followed by weeks of evaluation, leave purchased hardware idle for most of its depreciation window.
- **You are memory-bound, not FLOP-bound.** A run that previously needed multi-node memory pooling can collapse onto fewer B300s, and you only need that capacity while the run is live.
- **The hardware roadmap is moving.** NVIDIA's successor part, Rubin R100, carries 288 GB of HBM4 at higher bandwidth and began shipping in the second half of 2026, with broad cloud availability expected in 2027. Buying at the top of a generation transition means owning depreciating silicon while renters switch SKUs.
- **You cannot host it anyway.** Rack-scale Blackwell Ultra deployments call for high-bandwidth networking and dense power delivery that most existing facilities cannot supply. The 8-GPU DGX B300 chassis itself ships air-cooled; liquid cooling only becomes necessary at NVIDIA's 72-GPU NVL72 rack scale, which is its own facilities decision.

Buy when you have a genuinely continuous training pipeline, an existing high-density facility, cheap power, and a two-year-plus commitment to the same architecture. Those conditions are real, and for the teams that meet them, ownership wins. They just describe a small minority of teams renting GPUs in 2026.

## What does the rent versus buy math look like for a B300?

At [the entry rate](/pricing/gpus/), \$53,000 of B300 hardware buys about 8,833 rented GPU-hours, which is roughly 368 days of continuous use. Break-even therefore lands near one year of nonstop utilization before you add any of the costs of actually running the machine.

| Factor | Renting at [entry rate](/pricing/gpus/) | Buying one B300 |
|---|---|---|
| Upfront capital | \$0 | ~\$53,000 per GPU, \$300,000 to \$500,000 for an 8-GPU DGX B300 |
| Cost at 100% use, 1 year | \$52,560 | Hardware, plus power, cooling, networking, and staff |
| Cost at 30% use, 1 year | \$15,768 | Unchanged; idle hardware still depreciates |
| Time to first token | Minutes | Weeks to months of procurement and buildout |
| Exposure to Rubin R100 transition | Switch SKUs at the end of a lease | Own the asset through the transition |

The takeaway: renting only loses on price if you can hold a B300 above roughly 70% utilization for two-plus years and you already have the facility to run it. At 30% utilization, one year of rental costs less than a third of the card's sticker price, before you count the facility. Purchase figures are reseller estimates rather than NVIDIA list prices, since the B300 is not sold as a standalone card and NVIDIA publishes no list price for it.

## Who should rent B300 GPUs?

B300 rental fits four groups: AI startups shipping large open-weight models, research teams with intermittent training schedules, enterprises running proof-of-concept work before committing capital, and any team on a fixed-duration project.

- **Startups serving 100B-plus models.** Renting converts a \$53,000 capital decision into an hourly one, and lets you drop to H200s or H100s the moment your model gets smaller or quantized.
- **Research teams.** Grant-funded work with defined project windows should never own hardware that outlives the grant. Rent for the run, release the lease, publish.
- **Enterprises evaluating Blackwell Ultra.** Renting a small B300 cluster for four to six weeks answers the "does NVFP4 actually help our stack" question for a fraction of the cost of the procurement process for buying.
- **Short-term and seasonal projects.** A four-week fine-tune at 8 GPUs costs about \$32,256 at [the entry rate](/pricing/gpus/), against \$300,000-plus to purchase the equivalent node.

Who should not rent: teams whose models fit in 80 GB, teams running FP64 scientific workloads, and teams with sustained continuous training and an existing facility built for the hardware.

## What should you check before renting B300 GPUs?

Check eight things before signing a B300 rental: GPU count and topology, interconnect, storage, networking and egress, billing granularity, contract term, region, and software stack support. The hourly rate is the number people compare, and it is rarely the number that decides the total bill.

- **GPU count and NVLink topology.** Eight B300s connected by NVLink behave very differently from eight B300s in separate PCIe-attached machines. Confirm which you are getting before you plan a tensor-parallel deployment.
- **Node-to-node interconnect.** Multi-node training needs high-bandwidth InfiniBand or RoCE. Undersized fabric wastes the GPU capacity you are paying for.
- **Storage.** Ask for local NVMe capacity and throughput, not just a volume size. A dataloader that cannot keep 288 GB of memory fed turns an expensive GPU into an idle one.
- **Egress and data transfer fees.** Some providers price egress separately, and for inference workloads moving large payloads this can rival the compute line item.
- **Billing granularity.** Per-second billing versus a one-hour minimum matters a lot for bursty inference. Confirm what happens to billing when a container restarts.
- **Contract term and preemption.** Spot or interruptible capacity is cheaper and can be reclaimed without notice, so treat it as batch-only. Reserved terms cut the rate but lock you in across the Rubin transition.
- **Region and compliance.** Confirm the physical location of the provider if you have data residency requirements.
- **Software stack support.** Verify your serving stack supports NVFP4 on Blackwell Ultra. If it does not, you are paying the B300 premium for memory alone, which may still be the right call, but you should know that going in.

## How do you rent B300 GPUs on Akash?

To rent B300 GPUs on Akash, submit the [GPUs on demand](https://akash.network/gpus-on-demand/) request form with your GPU count, workload type, and duration, and the team returns a custom quote matched against available provider capacity.

## FAQ

**How much does it cost to rent a B300 GPU per hour?** See the [entry rate above](/pricing/gpus/). The rate covers one full B300 with 288 GB of HBM3e on an SXM6 socket. Reserved terms and spot capacity price below on-demand; bundled managed stacks price above it.

**Is it cheaper to rent or buy a B300 GPU?** Renting a B300 is cheaper than buying for most teams — see the rent-vs-buy breakdown above. Buying only wins above roughly 70% sustained utilization across multiple years, plus the facility to run it.

**How much memory does a B300 have?** A B300 has 288 GB of HBM3e memory with 8 TB/s of bandwidth, delivered through eight 12-high HBM3e stacks. That is 50% more memory than a B200's 192 GB, roughly twice an H200's 141 GB, and 3.6 times an H100's 80 GB.

**What models can run on a single B300?** A single B300 comfortably runs models in the roughly 235B to 428B-parameter range at FP8, covering most current open-weight models without tensor parallelism. Larger contexts reduce that ceiling as KV cache grows — see our [B300 288GB workload breakdown](/the-bid/b300-288gb-vram-ai-workloads-2026/) for the model-by-model numbers.

**Is the B300 worth it over an H200 for inference?** The B300 is worth it over an H200 when memory capacity is the constraint. It offers 288 GB against 141 GB and 8 TB/s against 4.8 TB/s, at a higher [per-GPU-hour rate](/pricing/gpus/). For any model that fits in 141 GB, the H200 is the better value and the easier capacity to find.

**Does the B300 support FP64 workloads?** No, the B300 is a poor choice for FP64 workloads. NVIDIA de-emphasized both FP64 and INT8 on Blackwell Ultra, reallocating that silicon to NVFP4 throughput and attention performance. Classical HPC and scientific computing workloads should use a B200, an H100, or an A100 instead.

**Should I wait for the Rubin R100 instead of renting a B300?** No, waiting is rarely correct if you need capacity now. The Rubin R100 with 288 GB of HBM4 began shipping in the second half of 2026, with broad cloud availability expected in 2027. Renting rather than buying is precisely how you avoid being stranded by that transition.
