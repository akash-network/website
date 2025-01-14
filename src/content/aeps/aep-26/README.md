---
aep: 26
title: "Provider Incentives Pilot (PIP)"
author: Cheng Wang (@lechenghiskhan)
status: Final
type: Meta
created: 2024-01-08
completed: 2024-02-09
updated: 2024-12-01
resolution: https://www.mintscan.io/akash/proposals/246
discussions-to: https://github.com/orgs/akash-network/discussions/448
roadmap: major
---

# Motivation

Akash faces a critical shortage of high-density GPUs, particularly A100s, hindering new tenant acquisition. 91% of A100 GPUs are fully utilized, leaving no inventory for meaningful workloads.

Immediate use cases for these GPUs include:
1. AI workload training and fine-tuning
2. AI inference applications
3. Virtual world rendering and game hosting

To address this shortage, we propose funding provider incentives as outlined in AKT 2.0 (https://github.com/orgs/akash-network/discussions/32), supported by proposals 211 (https://www.mintscan.io/akash/proposals/211), 240 (https://www.mintscan.io/akash/proposals/240), and 241 (https://www.mintscan.io/akash/proposals/241), which ensure a well-funded Community Pool for this purpose.

## Program Budget

In this initial pilot program, we will request $5,000,000. We estimate these incentives bring on over 1,000 A100s and are estimated to run for 120 days. The estimated start date will be February 2024.

Any non-distributed tokens will be returned to the community just as done [here](https://github.com/orgs/akash-network/discussions/99#discussioncomment-7085698).


## Approaches

We propose three methods to incentivize providers, all administered by the Pilot Program Administrator (PPA), which can be an individual or a team. The PPA will be elected by a vote within the steering committee. Anyone can apply to be the PPA, provided they meet the following criteria:

* Should have extensive experience in managing the community.
* Must possess deep expertise in managing Akash providers.
* Should be publicly known and respected within the Akash Community.
* Ideally should have contributed to the Akash open-source repositories.

**Responsibilities:**

* Commit time and resources towards administering the program.
* Disclose all payments to the public and maintain a strict record of all payments that are subject to 3rd party audit if necessary.
* Provide server management and support to participants.
* Provide responsible settlement services (AKT to USD) for participants if needed.
* Builds tools for verifying compute.

#### 1. Committed Pool

The goal of the committed pool is to provide high-quality computing resources by engaging professional providers of compute, usually [tier-2 or higher](https://phoenixnap.com/blog/data-center-tiers-classification) data center operators, who can commit to providing computing power to Akash for at least one year. The program is open to anyone, but it has strict requirements for quality, quantity, reliability, compliance, and support. 

Information (pricing, specs, and availability) on all compute providers considered for this pool will be shared publicly. The rationale guiding provider selection will also be disclosed to the public.

Some advantages are:

* High-quality and reliable compute
* Cost-optimized (No overage)
* Akash Core Team has identified providers that are ready and can go live with short notice

Some disadvantages are:

* Fewer participants (providers)
* More centralized
* A smaller sample size means less data to learn from for building on-chain incentives
* Risk of obsolescence


##### Budget & Distribution

We propose allocating 40% of the Pilot budget that is approximately $3,500,000 with the following distribution (not final):

<table>
  <tr>
   <td>Chipset
   </td>
   <td>Est. Price / Hr
   </td>
   <td>Quantity
   </td>
   <td>Total
   </td>
  </tr>
  <tr>
   <td>H100
   </td>
   <td>$2.49
   </td>
   <td>83
   </td>
   <td>$1,800,000
   </td>
  </tr>
  <tr>
   <td>A100 80 GB
   </td>
   <td>$1.69
   </td>
   <td>54
   </td>
   <td>$800,000
   </td>
  </tr>
  <tr>
   <td>RTX A6000
   </td>
   <td>$0.98
   </td>
   <td>105
   </td>
   <td>$900,000
   </td>
  </tr>
</table>


#### 2. Liquidity Mining Pool

In alignment with how DeFi applications and other [DePIN](https://messari.io/assets/depin) projects (like Helium Network, Filecoin, and others) we propose a model in which providers supply GPUs to a homogeneous configuration pool. This pool allocates a fixed amount of tokens per epoch, distributed pro-rata to all participants.

Each provider's earnings will be distributed periodically, with a cadence that allows us enough time to check for accuracy, uptime, and other critical metrics. The source code and reports will be made publicly available for the sake of transparency.

These incentives will attract and retain providers on Akash, directly addressing the current GPU supply shortage. The program's subsidies are designed to ensure profitability for providers, secure meaningful quantities of GPUs in desired configurations, and provide technical support.

Some advantages are:

* More participants
* Increased awareness
* A larger sample size means more data to learn from for building on-chain incentives

Some disadvantages are:

* Unknown quality and reliability
* Greater volatility on compute availability
* Value-extraction by arbitrageurs (Inefficient use of funds)
* Greater risk
* Harder to answer tenant questions

#####  Budget & Distribution

We propose allocating 40% of the Pilot budget which is approximately $750,000 with the following distribution (not final):

<table>
  <tr>
   <td>Chipset
   </td>
   <td>Allocation
   </td>
   <td>Value
   </td>
  </tr>
  <tr>
   <td>Any Nvidia GPU with at least 24GB VRAM
   </td>
   <td>100%
   </td>
   <td>$750,000
   </td>
  </tr>
</table>

#### 3. Next-Generation R&D Pool

As AI models are evolving the GPU architecture and following suit. This model provides sufficient budget to the PPA to understand the dynamic demand curve by allowing for benchmarking and customer development

##### Budget & Distribution

We propose allocating 20% of the program budget, which is $750,000 and will be exclusively allocated to GPUs launched in 2024 or later. This will apply to both Nvidia and AMD GPUs. Some GPU models under consideration are Nvidia’s H200, B100, L40s, and AMD’s MI300 MI350. 

Some advantages are:

* Greater flexibility
* Future-proofing
* Being able to be first-to-market on new GPUs 

Some disadvantages are:

* Opportunity cost of not being able to use the funds immediately

# Copyright

All content herein is licensed under [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0). 
