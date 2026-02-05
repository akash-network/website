---
title: "Akash Network: Q4 2025 Report"
description: If the state of Akash in Q3 2025 was defined by Messari as a period of "steady growth and technical preparation," Q4 became the forge in which the Akash Network was truly tested and redefined.

pubDate: "2025-12-31"
draft: false

categories:
  - News
tags:
  - News
contributors:
  - Michelle Javed

bannerImage: ./banner-image.png
---

If the state of Akash in Q3 2025 was defined by [Messari](https://messari.io/report/state-of-akash-q3-2025) as a period of "steady growth and technical preparation," Q4 became the forge in which the Akash Network was truly tested and redefined.

Rather than retreating, Akash chose momentum over caution, successfully deploying three pivotal infrastructure upgrades designed to enhance the network's high performance capabilities.

1. **Chain Refactor (Mainnet 14)**: Upgraded to Cosmos SDK v0.53, paying down eight years of technical debt.
2. **AkashML**: Launched a fully managed AI inference service, driving measurable increases in demand and revenue.
3. **WASM Smart Contracts**: Enabled modular network upgrades without requiring full chain coordination.

This report deconstructs how Akash transformed a market catastrophe into a catalyst for its most aggressive expansion to date.

## Akash Network Successfully Completed the Upgrade to Mainnet 14

On [October 28th](https://x.com/akashnet/status/1983209724129804533), Akash Network executed the upgrade to Mainnet 14 at block #23939793. This was not a routine patch, rather a foundational overhaul that leapfrogged the network to [Cosmos SDK v0.53](https://akash.network/blog/akash-mainnet-14-the-core-overhaul-that-changes-everything/) and paid down eight years of technical debt.

The upgrade's major features are now live:

- **JWT Authentication (AEP-63)**: Full account abstraction via JSON Web Tokens, allowing developers to sign in via GitHub or Google. This effectively dismantled the "cryptographic barrier" to entry.

- **IAVL Storage Optimization**: Dramatic improvements in block execution speeds, essential for high-frequency bidding by AI agents.

- **Multi-Depositor Escrow (AEP-75)**: Enabling collaborative funding for deployments, allowing DAOs and grant programs to fund infrastructure without taking ownership of the workload.

## Resilience in the Face of 10/10

While many projects halted operations during the uncertainty of the 10/10 fiasco, the Akash core team doubled down.

This "shakeout" served as a definitive catalyst for [AEP-76](/roadmap/aep-76/) (Burn-Mint Equilibrium).

The community has approved the BME model, which is slated for an early Q1 2026 launch. Once live, BME will ensure that tenants can budget in USD-pegged ACT tokens, permanently insulating the Supercloud from market volatility while linking network revenue to AKT scarcity.

## Update on BME & [WASM Smart Contracts](https://x.com/akashnet/status/1999235048000659870)

The core team has completed the key infrastructure components needed for BME, which are currently deployed in the Sandbox and open-sourced. Another major breakthrough this quarter is the introduction of WASM Smart Contracts:

- **Modular Upgrades**: Akash now features permissioned smart contracts based on WASM. This allows us to update the network faster in "packets" rather than requiring weeks of coordination for monolithic chain upgrades.

- **Price Oracle**: The core team has implemented a price oracle using Pyth to pull accurate AKT/USD data, a critical component for calculating the BME mint price.

- **The Path to Bare Metal**: Beyond tokenomics, WASM contracts are the key to unlocking bare metal deployment. This will allow enterprise users to squeeze every bit of performance out of GPUs for high-scale pre-training and fine-tuning.

- **Next Steps**: The core team is finalizing the burn and mint logic, which will be ready for public testing in under two weeks. Track progress on the [wasm branch of the Akash Node Repo](https://github.com/akash-network/node).

## AkashML: Managed AI Inference is Live

By late November, the core team launched [AkashML](https://akashml.com), the network's first fully managed [AI inference service](https://akash.network/blog/akashml-managed-ai-inference-on-the-decentralized-supercloud/).

**The Impact**: AkashML allows startups and developers to deploy leading open-source models like Llama 3.3-70B, DeepSeek V3, and Qwen3-30B-A3B instantly.

**The Savings**: By leveraging decentralized GPUs, AkashML delivers 70-85% cost savings compared to traditional hyperscalers.

**DeepSeek V3.2**: In December, DeepSeek released V3.2 with breakthrough architectural innovations, including DeepSeek Sparse Attention (DSA) and Group Relative Policy Optimization (GRPO), shattering computational constraints that historically limited open-weights models. [The model is now live on AkashML](https://akashml.com/models/deepseek-v3.2), giving developers immediate access to one of the most significant advances in open-source AI on fully decentralized infrastructure.

## Provider Incentives & Fiscal Discipline

The Provider Incentives Pilot (PIP) framework reached a major milestone this quarter. By design, the PIP mandates that unused capital from the program must return to the community pool to ensure every token is working toward active growth.

- **AKT Reclaimed**: In Q4 alone, 2.1 million AKT was [returned](https://x.com/akashnet/status/2004620727971184872) to the community pool.

- **Yearly Total**: This brings the total 2025 refund to 3,826,854 AKT, demonstrating a level of fiscal accountability that allows the DAO to scale aggressively into NVIDIA Blackwell B200/B300 systems in 2026.

## Expansion of The Student Ambassador Program

Following a successful pilot cohort with scholars from Princeton, Cornell, USC, and UT Austin–the Akash Student Ambassador Program is expanding its reach. The program is cultivating the future CTOs and engineers who will define the architecture of the decentralized cloud era.

The mission to bring the Supercloud to the world's leading research institutions continues as [applications for the Spring 2026 Cohort are now open!](https://docs.google.com/forms/d/e/1FAIpQLScprUXYrjp9HdwUW_DdTu1UnOvmw2bMfJ0wVKZ1J653uuJsxQ/viewform)

## Returning to Grassroots: The Q4 Event Strategy

In Q4, the events team shifted toward a "Tiered" strategy to maximize ROI, maintaining a 50/50 split between AI/ML events and blockchain conferences. While the team maintained a Tier 1 presence at NeurIPS in San Diego, they pivoted toward hosting intimate, high-impact gatherings rather than massive, impersonal booths.

This allowed smaller, targeted events to network with the brightest thought-leaders and builders in AI and DePIN. These activations allow for deeper technical discussions and high-fidelity relationship building with researchers who are moving the needle on model training.

Direct immersion into specialized AI communities establishes Akash as the first name mentioned when researchers look for permissionless, high-density compute.

**Q1 2026 continues this momentum with two grassroots activations:**

### 1. AI Agent Build Night | Austin, TX | January 14, 2026

A hands-on technical workshop in partnership with AITX where builders construct and deploy AI agents using Akash Console and AkashML. The 90-minute build session culminates in demos and networking with Austin's AI developer community.

Register [here](https://luma.com/AIAgentBuildNight)

### 2. AI x Speed Chess | Williamsburg, NYC | January 28, 2026

A networking event partnering with Williamsburg Chess (the largest chess club in NYC) to connect AI founders and chess enthusiasts for competition and conversation.

Stay up-to-date with upcoming events on [X](https://x.com/akashnet).

### Experience the Supercloud

- [Akash Console Login](https://console.akash.network/)
- [Akash Provider Console](/providers/)

### Network Intelligence

- [Akash Stats](https://stats.akash.network/)
- [AKT Token](/token)
- [Providers](/providers)

### Resources

- [Documentation](/docs/)
- [White Paper](https://ipfs.io/ipfs/QmVwsi5kTrg7UcUEGi5UfdheVLBWoHjze2pHy4tLqYvLYv)
