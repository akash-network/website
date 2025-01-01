---
aep: 24
title: "GPU Marketplace"
author: Greg Osuri (@gosuri)
status: Final
type: Standard
category: Core
created: 2023-08-22
completed: 2023-08-29
updated: 2024-12-01
resolution: https://www.mintscan.io/akash/proposals/224
roadmap: major
---

## Motivation

The advancement of artificial intelligence is constrained by the limited access to powerful GPUs. Despite the abundance of these processors in various organizations, individuals requiring them for AI research and development often struggle to utilize them. Implementing a GPU trading system on Akash would address this crucial bottleneck in AI progress, allowing for more efficient resource allocation and accelerating innovation in the field.

## Summary

The network’s sixth Mainnet upgrade brings GPU support, Stable Payments, and Take Rates to Akash. With this upgrade, providers on the network will be able to offer GPU resources to deployers around the world, and both providers and deployers will have access to USDC settlement. At settlement, the network will begin capturing value via Take Rates on both USDC and AKT.

The upgrade will bring the following features to Akash.

### GPU Marketplace

The main feature of the upgrade will enable an open-source marketplace for high-density GPUs. This will be accomplished by adapting Akash’s existing Supercloud infrastructure to allow network providers to support GPUs. This initial upgrade will focus support and testing on NVIDIA, given the AI and machine learning industry’s preference for NVIDIA GPUs. In the future, the network will focus support and testing on other manufacturers, including AMD and others.

GPU support has already been **validated in the Akash GPU Testnet** (https://akash.network/blog/testing-the-first-ai-supercloud/) (a public beta test of the GPU network features, AI deployments, and benchmarking). Over 1,300 people signed up to participate, and the testnet hosted NVIDIA H100s, and A100s, along with consumer-grade GPUs from the 30-series and 40-series. Access to consumer-grade GPUs is one way the Akash Supercloud stands apart from other cloud providers. These models are typically overlooked, even though they can often run inference on less memory-intensive AI models. The flexibility to choose from the widest possible range of GPUs makes the Supercloud powerful.

### Stable Payments

The second most anticipated feature of the upgrade is the addition of Stable Payments, which is part of the **larger AKT 2.0 initiative** (https://github.com/orgs/akash-network/discussions/32). Although many features and advantages are built into AKT, Akash’s native utility token, any token with inherent volatility presents a challenge to long-term providers and deployers. Significant price movements can drastically change the value of the cloud services rendered as part of the lease agreement coordinated through Akash’s open marketplace. One solution to the long-term volatility challenge is to incorporate alternative settlement currencies. For the rollout of Stable Payments, that currency will be USDC, a stablecoin pegged to the U.S. dollar. In the future, additional settlement currencies can be added with a simple governance proposal.

### Take Rates

For the network to capture value and direct resources toward building the network and rewarding participants, there must be a mechanism for the network to capture value.

The mechanism for capturing value at the network level is called Take Rates. These rates are applied to each lease and can be changed at any time with a governance vote. The network Take Rates will initially be set at 4% for AKT and 20% for USDC.

**Read the original draft proposal of both Stable Payments and Take Rates** (https://github.com/orgs/akash-network/discussions/147) for an overview of the specific features of each.

## Akash Mainnet 6 Upgrade

This proposal is for upgrading the Akash Network to version **v0.24.0** at a height 12606074 (https://www.mintscan.io/akash/blocks/12606074).

By voting YES on this proposal, you approve the following changes:
1. The introduction of deployment settlement and payment in IBC-enabled (non-AKT) currencies. Currencies can be added, removed, or modified by submitting `ParamChange` governance proposals.
2. The introduction of Take Fees for AKT Stakers. Take rates for each currency (including AKT) can be added, removed, or modified by submitting `ParamChange` governance proposals. This upgrade sets a 2% take rate for **AKT**.
3. The introduction of support for GPU deployments.
4. Enforcing a **Minimum Validators Commission** using an on-chain parameter. The default value is set to 5%. During the upgrade, each validator with a commission of less than 5% will be updated to 5%.
5. Introducing a **Minimum Initial Deposit** for governance proposals using an on-chain parameter. The proposal originator must deposit at least the Minimum Initial Deposit for the proposal transaction to succeed. The default value is set to 40% of `MinDeposit`.
6. The fixing of dangling Escrow Payments. Some escrow payments remain open when the actual escrow account is closed.
7. The addition of a **FeeGrant** module. This module allows accounts to grant fee allowances and to use fees from their accounts. Grantees can execute any transaction without the need to maintain sufficient fees.
8. The upgrade of Cosmos SDK to `v0.45.16`.
9. The upgrade of IBC to `v4.4.2`.

A detailed list of features, fixes, and improvements can be found in the changelog (https://github.com/akash-network/node/releases/tag/v0.24.0).

Upgrade instructions are available in the upgrade docs (https://docs.akash.network/akash-v0.24.0-network-upgrade/v0.24.0-upgrade-docs).

Validators and RPCs supervised by **cosmovisor** with **DAEMON\_ALLOW\_DOWNLOAD\_BINARIES=true** will pick up upgrade binaries from upgrade info (https://raw.githubusercontent.com/akash-network/net/main/mainnet/upgrades/v0.24.0/info.json).

## Announcements

- [The Supercloud for AI is Live](https://akash.network/blog/the-supercloud-for-ai-is-live)

# Copyright

All content herein is licensed under [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0). 

