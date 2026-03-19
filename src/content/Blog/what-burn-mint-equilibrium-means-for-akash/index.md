---

title: "What Burn-Mint Equilibrium Means for Akash"
description: "Explaining Akash burn-mint economics and why it matters."
pubDate: "2026-03-18"
draft: false
archive: false
showcase: false
featured: false

categories:
  - Economics
  - Protocol

tags:
  - Akash
  - Tokenomics
  - Burn-Mint

contributors:
  - Michelle Javed

bannerImage: ./burn-mint-banner.png
---

**By Michelle Javed** 

**TL;DR:**

The Burn-Mint Equilibrium (BME) Incentivized Testnet wrapped up on March 4, 2026 after two weeks of intensive stress-testing. The testnet ran 52 scenarios across 11 categories, putting the new economic model through its paces with $10,000 in AKT rewards incentivizing participation.

BME replaces traditional inflation with a burn-and-mint mechanism: users burn AKT to mint ACT (a USD-pegged pricing unit) when deploying compute, and providers receive stable payments regardless of market conditions. The dynamic Collateralization Ratio and circuit-breaker system were key focus areas during testing, ensuring the network can halt minting automatically if volatility threatens the peg.

The on-chain governance vote for BME launched March 7, with the mainnet upgrade [scheduled for March 23 at 14:00 UTC](https://www.mintscan.io/akash/proposals/318). This is one of the most significant economic upgrades in Akash history, directly tying AKT scarcity to real network demand.

**Why BME is Crucial for DePIN** 

Every DePIN hits the same wall. You either give users stable pricing and watch your token become irrelevant, or you force native token payments and watch enterprises walk away. 

Offering Stable payments drive adoption but weaken the token. Users pay in USDC, bypass the native asset entirely, and token holders watch revenue grow while price stagnates. 

Forcing native token payments creates a different problem because volatility suppresses enterprise interest. No one deploys a 30-day AI training job when compute costs might swing 20% on a liquidation cascade. Providers face the same pressure. Electricity bills and hardware costs don't fluctuate with token markets, so revenue stability matters just as much on the supply side.

[AEP-23](https://github.com/akash-network/AEP/tree/main/spec/aep-23) solved this by allowing tenants to pay in USDC while providers received stable USD-denominated settlements. The system worked well for driving adoption and revenue growth across the network. But the tradeoff became impossible to ignore. When tenants pay directly in USDC, demand for AKT diminishes. Staking rewards distributed from settlement fees proved insufficient to sustain strong token economics, and AKT's role as the fundamental economic unit of the network weakened even as usage grew.

The introduction of Burn-Mint Equilibrium (BME) through [AEP-76](https://akash.network/roadmap/aep-76/) resolves this tension by making AKT essential to every transaction while maintaining the stable USD experience users expect. It preserves stable pricing for all participants while creating structural demand for AKT, and it does so without imposing extractive fees.

We ran a dedicated incentivized testnet to validate these mechanics under real conditions. Here is what we built, what we observed, what surprised us, and what comes next.

**BME Tokenomics Overview**

At the core of BME are two tokens working in tandem.

**AKT** remains the network's value-accruing asset, used for staking, governance, and settlement. **ACT** (Akash Compute Token) is a non-transferable, USD-pegged compute credit that exists solely to pay for infrastructure resources.

When a tenant needs compute capacity, they burn AKT at the current oracle price to mint ACT. If AKT trades at $1.14 and a tenant needs $1,000 in compute credits, approximately 877 AKT gets burned to mint 1,000 ACT. The tenant now holds a dollar-denominated balance with no price volatility and no exposure to token markets, just credits they spend on compute.

The tenant then deploys workloads and consumes ACT over time as providers deliver compute resources. At settlement, the protocol burns the consumed ACT and mints fresh AKT to pay providers based on the current oracle price at that moment.

This is where the deflationary pressure comes from. If AKT moved from $1.14 to $1.50 during the lease, the protocol only needs to mint 667 AKT to cover the $1,000 settlement. The tenant burned 877 and the provider received 667, which means 210 AKT are permanently removed from supply.

Every dollar spent on Akash infrastructure creates direct AKT demand and permanent supply reduction.

![bme-diagram][bme1]

[bme1]: ./bme-diagram-1.png

**The Vault and Circuit Breakers**

When tenants burn AKT to mint ACT, those tokens enter a module account that tracks "remint credits" for future provider payouts. 

This creates immediate supply reduction. 

If the network holds $10 million in outstanding ACT credits backed by 8.77 million AKT in the vault, those tokens exit circulating supply. They cannot be traded, accessed by exchanges, or influence price discovery until provider settlement occurs.

The vault operates as a volatility buffer. When AKT appreciates between tenant deposits and provider settlements, the vault holds more dollar-denominated value than required to fulfill obligations. This surplus materializes as net burns when providers receive payment. The collateral ratio, meaning the vault's AKT value divided by outstanding ACT obligations, serves as the system's primary health metric.

That ratio relies on oracle prices from dual feeds (Osmosis TWAP and external sources) with medianization to prevent manipulation. Time-weighted averaging over 30-minute windows smooths volatility and raises the cost of any manipulation attempt.

When AKT declines, the vault absorbs the impact. Circuit breakers activate at defined thresholds. At a 0.95 collateral ratio, enhanced monitoring triggers a warning state. At 0.90, new ACT minting throttles while existing settlements continue uninterrupted. This design ensures providers always receive payment while preventing destabilizing spirals during periods of extreme volatility.

The system self-corrects through arbitrage. Price movements create opportunities that naturally restore equilibrium without manual intervention.

![bme-diagram][bme2]

[bme2]: ./bme-diagram-2.png

**BME Incentivized Testnet**

BME is elegant on paper. The math is clean and the incentive alignment makes sense in theory

But we have been in this space long enough to know that tokenomic mechanisms that look perfect in simulation have a long history of failing on contact with actual users, actual load, and actual adversarial behavior.

We designed the incentivized testnet around three questions that would determine whether BME was ready for production.

First, does the AKT-to-ACT conversion hold up under heavy load? The mint and burn operations are the heartbeat of BME. If they degrade under throughput, nothing else matters.

Second, does the circuit breaker trigger correctly at every threshold? The circuit breaker is the system's safety net. If it fires too early, it disrupts normal operations. If it fires too late or not at all, the vault is exposed.

The third was whether there are bugs that only surface under adversarial conditions. We offered bounties specifically to incentivize participants to stress-test edge cases we might not have anticipated.

**Testnet Observations**

The conversion pipeline was rock solid. AKT-to-ACT minting and ACT-to-AKT burn were incredibly stable even in the heaviest periods of testnet use, with no unexpected circuit breaker invocations and no other stability issues. The most critical path in the system held without a single issue across the full duration of the testnet.

The testnet had two dedicated periods for circuit breaker testing: 24 hours of circuit breaker halt testing and 24 additional hours of circuit breaker warning testing. The circuit breaker behaved as intended through all testing periods with very granular tests leveled against it.

Circuit breaker thresholds and expected behavior in the halt state were flawless. Minting stopped when it should have stopped, settlements continued when they should have continued, and the system resumed cleanly once conditions normalized.

The warning state is where things got interesting.

**The Warning-State Bug**

* Collateral ratio in the 90–95% range should trigger a warning state (continued minting, enhanced monitoring)  
* Instead, the system was jumping straight to halt, cutting off new ACT creation prematurely  
* We identified the root cause, patched it, and rolled the fix into testnet  
* All subsequent circuit breaker testing passed without a single failure  
* This is the kind of edge case that only surfaces with real participants against real thresholds, and exactly why incentivized testnets exist

**What Held Up** 

* Despite bounties to incentivize discovery, no additional bugs were found  
* BME behavior, ACT use in deployments, provider settlements, and pointed security validations all came back clean  
* Oracle medianization, TWAP smoothing, and vault accounting ran cleanly through conditions designed to break them

**Why Now**

AI compute demand is bottlenecked by supply constraints that centralized providers cannot resolve on their own. Foundation model training, fine-tuning workloads, and inference scaling all face power limitations and GPU scarcity. Hyperscalers ration capacity through waiting lists and preferential allocation.

Akash's decentralized marketplace coordinates underutilized GPU capacity with compute-starved AI teams. This addresses genuine infrastructure bottlenecks rather than creating synthetic demand.

Several developments converge to make this the right moment. Migration to a shared security chain reduces operational overhead for the marketplace. Upcoming VM and TEE (Trusted Execution Environment) support expands the addressable market beyond GPU workloads, increasing the range of compute tasks the network can service.

BME ensures that as product-market fit strengthens, the economic model scales with it.

**What Comes Next**

BME transforms every workload on Akash into a deflationary event. Network growth and token value stop being competing priorities and become mechanically linked.

The mechanism achieves what decentralized infrastructure requires. It coordinates distributed resources where value flows to participants rather than intermediaries. AKT becomes essential to every transaction without imposing costs on users or providers. Tenants pay market rates for compute. Providers earn competitive revenue without take rates. Token holders benefit from structural supply reduction tied directly to usage.

For the Akash community, BME marks a maturation point. The network evolved from pioneering decentralized compute to establishing stable payments that drove growth. Now it synthesizes those phases into a sustainable economic model designed to scale with AI infrastructure demand.

The incentivized testnet confirmed the mechanism works. The mainnet implementation is next.

[Proposal \#318](https://www.mintscan.io/akash/proposals/318) has been approved on-chain, and is scheduled to go live on **March 23rd, 2026 at approximately 14:00 UTC** at block height 26063777\.

This Akash Mainnet 17 upgrade will be the largest single upgrade in Akash's history.
