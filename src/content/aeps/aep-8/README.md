---
aep: 8
title: "Mainnet 1: Security"
author: Greg Osuri (@gosuri), Adam Bozanich (@boz)
status: Final
type: Standard
category: Core
requires: 6
created: 2020-03-10
completed: 2020-09-25
roadmap: major
---

## Summary

Mainnet release with security, liquidity, and decentralization.

## Motivation

Akash is a decentralized marketplace for cloud computing resources. Its blockchain, built on Cosmos SDK and Tendermint, enables users to deploy and manage their own cloud resources. As one of the first applications for Inter-Blockchain Communication (IBC), Akash Network forms the foundation for this decentralized cloud computing platform.

To ensure Akash's success, we must first establish a secure, scalable, and decentralized blockchain foundation. This requires a diverse set of professional validators before enabling compute trading. We propose launching the blockchain to achieve adequate security and decentralization, preventing potential issues that could erode user trust in the network.

## Mainnet 1

Core to Akash’s platform is a token economic model that uses a native currency, Akash Token (AKT), to solve for volatility (one of the biggest challenges for adoption in crypto), while ensuring economic security of the platform’s public blockchain.

The model bootstraps early supply by using inflation as a subsidy, and activates an incentive structure that unlocks network effects to accelerate growth.

In order to properly compensate providers on the network (providers are users contributing cloud compute to the network e.g. datacenters), AKT must first have economic value. Launching a mainnet and stabilizing the staking set is the first step in establishing economic value.

Akash Mainnet 1 is the launch of the Akash DeCloud and the true beginning of network governance. Akash Mainnet 1 (based on the [Launchpad release](https://blog.cosmos.network/launchpad-a-pre-stargate-stable-version-of-the-cosmos-sdk-e0c58d8c4e24?gi=5e98f3fdc4eb)) enables basic staking and governance operations, including the ability to delegate to validators and vote on governance proposals.

We propose launching Mainnet with 64 validators to establish economic value and to stabilize the staking set. AKT holders will then vote to enable the decentralized cloud modules after the Phase 3 Testnet.

## Genesis Configuration and Token Distribution

Token distribution is critical to the success of Akash, propose the [genesis.json](https://github.com/akash-network/AEP/blob/main/assets/aep-8/genesis.json) to bootstrap the network. Chain identifier will be `akashnet-1`.

## Liquidity

Liquidity is critical to Proof-of-Stake (PoS) chains, as the security of the blockchain relies on the economic value staked to secure the chain. We propose using an exchange to bootstrap liquidity.

## Annoucements

- [Announcing Akash Mainnet Live and Bitmax IEO](https://akash.network/blog/announcing-akash-mainnet-live-and-bitmax-ieo/)
- [Akash DeCloud Mainnet Overview](https://akash.network/blog/akash-decloud-mainnet-overview/)

## Copyright

All content herein is licensed under [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0).
