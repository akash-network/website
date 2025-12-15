---
aep: 79
title: "Akash on Shared Security"
author: Greg Osuri (@gosuri)
status: Final
type: Standard
category: Core
created: 2025-12-15
updated: 2025-12-15
estimated-completion: 2026-12-31
roadmap: major
---

## Abstract

This RFP seeks proposals from established Layer 1 protocols to become the shared-security provider for the Akash Network, a decentralized cloud computing marketplace on the Cosmos SDK. The goal is to transition from Akash's sovereign chain to a shared-security model to address high capital inefficiency from AKT staking and excessive operational overhead. This move will adopt a pay-per-use security model, reducing the liquidity burden and allowing the team to focus on product innovation, particularly for GPU-intensive AI workloads. The partner must ensure scalable, robust, and decentralized security, maintaining strong IBC interoperability. Proposals must detail the L1's Security Model, Technical Integration, Scalability, Governance, Economic/Legal Considerations, and Ecosystem Profile to enable Akash to leverage external security while preserving application sovereignty.

## Motivation

Akash Network is migrating from its sovereign chain to a shared-security framework to enhance capital efficiency and reduce operational overhead. This move frees staked AKT for marketplace growth and offloads L1 maintenance and security, allowing developers to focus solely on the `AkashApp` (marketplace logic). The goal is to achieve equivalent or better security at a lower cost, accelerating decentralized cloud innovation.

## Introduction

Akash is a **decentralized cloud computing marketplace** that facilitates peer-to-peer trading of computing power. By eliminating middlemen, users can buy and sell resources at a fraction of the cost of big cloud providers.

Often regarded as the first decentralized cloud and category creator for [DePIN](https://messari.io/report/the-depin-sector-map), the Akash community and code are widely regarded for their deep open-source and decentralization values. Akash is an [open‑source](https://github.com/akash-network) protocol built on the Cosmos SDK and uses Tendermint PoS consensus. Marketplace activity (requests, bids and leases) is stored on‑chain and paid for with the AKT token. The network operates a reverse auction; providers compete to offer resources and often deliver compute **at a fraction of the cost** of centralized cloud. This decentralized model has attracted a **large community of over 500 contributors**.

Akash has traditionally run on its **own sovereign chain**. Operating a sovereign chain has two major drawbacks:

1. **Capital efficiency** – maintaining an independent validator set requires significant liquidity because large amounts of AKT must be staked to secure the chain. Liquidity tied up in security could instead be used to support the application.
2. **Operational and technical overhead** – maintaining a Layer 1 (L1) blockchain solely for a single application demands continuous upgrades, infrastructure management and security expertise. This detracts from product‑focused innovation.

To address these issues, Akash is evaluating a **shared‑security model**. In this model Akash would lease security from another L1 rather than running its own validator set. For example, under **Cosmos Interchain Security** a “consumer chain” leases the **exact same validator set** as the Cosmos Hub; in return, validators receive a share of the consumer chain’s transaction fees. The cost of attacking the consumer chain becomes the same as attacking the Hub, lowering the barrier for launching secure chains. **Polkadot’s parachain model** takes a similar approach: parachains must communicate state transitions to the **Polkadot Relay Chain**, and the Relay Chain’s validators secure all parachains. By concentrating security in one set of validators, parachains don’t need their own security infrastructure. **Celestia** offers modular “data availability” and consensus; rollups submit their data to Celestia and **pay for the inclusion of data.** Fees are only priced on data rather than execution, providing **lower‑cost blockspace**. These examples show that shared‑security can provide robust security and scalability while reducing operational overhead.

## Objectives of this RFP

Akash seeks proposals from foundations or teams behind established Layer 1 protocols interested in serving as the **shared‑security provider** for the Akash Network. Proposals should explain how the candidate L1 will allow Akash to retain sovereignty over its application logic while outsourcing security. The ideal solution should:

1. **Reduce token‑liquidity burden.** Validators must normally stake AKT to secure the chain. We seek a model where security is paid for on a per‑use basis rather than continuously locking large amounts of AKT.
2. **Minimize technical and operational overhead.** The new model should reduce the need for Akash to maintain its own validator set and blockchain infrastructure. The L1 should provide robust consensus, data availability and slashing mechanisms.
3. **Preserve decentralization and openness.** Akash is a community‑owned, open‑source network and the selected L1 must share similar values. The integration should not introduce centralization risks or onerous permissioning.
4. **Provide scalability and cost predictability.** Akash’s workloads, particularly GPU‑intensive AI deployments, are growing rapidly. The security provider must accommodate high throughput without prohibitive costs or slot scarcity.
5. **Enable interoperability.** Akash is built on Cosmos and interacts with other chains via IBC. Proposals should highlight how the L1 integrates with Cosmos/IBC or provides equivalent interoperability.

## Scope of Proposal

Foundations responding to this RFP should provide detailed information addressing the following areas.

### Security Model and Mechanism

* **Shared‑security design.** Explain how your protocol’s shared‑security mechanism works. For instance, Cosmos “replicated security” uses the same validator set on the provider chain to validate blocks on a consumer chain, while Polkadot’s parachains rely on the Relay Chain’s validators and Celestia provides data availability for rollups that pay for data inclusion. Indicate whether the mechanism is **enshrined** (all chains use shared security by default) or **opt‑in**, and discuss potential limitations (e.g., Polkadot’s limited number of parachain slots or Cosmos’s current limit on the number of consumer chains).
* **Economic model.** Detail how Akash will pay for security. Provide fee structures (e.g., transaction‑fee sharing, staking requirements, slot auctions or data‑availability fees) and how costs scale with usage. Highlight whether fees are based on data size (as in Celestia’s pricing) or fixed regardless of usage.
* **Validator incentives and slashing.** Describe how your protocol incentivizes validators and punishes misbehavior. Cosmos Interchain Security slashes validators’ stakes on the provider chain if they misbehave on consumer chains; similar mechanisms should be explained.

### Technical Integration

* **Interoperability with Cosmos and IBC.** Given Akash’s deep integration with the Cosmos ecosystem, proposals should discuss how the L1 connects to Cosmos or supports IBC‑equivalent interoperability. For example, Cosmos consumer chains update their validator sets via IBC packets.
* **Execution environment support.** Describe whether Akash will deploy as a sovereign rollup or consumer chain and whether the L1 supports general purpose execution. Celestia only provides data availability and ordering, requiring a separate settlement layer; Polkadot’s Relay Chain executes parachain transitions.

* **Migration path.** Provide a roadmap for migrating Akash from its sovereign chain to your shared‑security model. Include timelines, required governance approvals and any necessary code modifications.

### Scalability and Performance

* **Throughput and finality.** Provide metrics on your network’s throughput (transactions per second, data throughput) and block finality times. Explain how these metrics will impact Akash’s workload, particularly high‑density GPU leases.
* **Capacity limitations.** Note any hard limits on the number of consumer chains or parachains (e.g., Polkadot’s parachain slot limit or Cosmos’s current capacity for 5–10 consumer chains). Describe plans for scaling beyond these limits.

### Governance and Community Alignment

* **Governance model.** Outline how protocol decisions (e.g., changes to shared‑security parameters, upgrades) are made. Akash values community‑led governance and open‑source principles. The selected L1 should demonstrate transparency and decentralized decision‑making.  
* **Support and collaboration.** Describe the foundation’s commitment to onboarding Akash. This includes technical support, grant funding, marketing collaboration and involvement of your community.  
* **Community Alignment:** Describe the community's commitment to the values of open-source and deep decentralization. Please include profiles of X key community contributors.

### Economic and Legal Considerations

* **Cost of adoption.** Provide estimated costs or required stake for Akash to join your network. Include any slot‑auction costs, bonding requirements or initial collateral.
* **Token‑economic implications.** Discuss how integration affects AKT token demand and potential need to hold your protocol’s token for security (e.g., DOT for Polkadot). Highlight whether cross‑chain fees are paid in AKT, your native token or other assets.
* **Legal and regulatory issues.** Explain any regulatory considerations associated with shared‑security or cross‑chain operations. Akash must ensure compliance with applicable U.S. regulations.

### Ecosystem & Liquidity

* **Liquidity Profile:** Provide a thorough assessment of the chain’s liquidity profile, including market depth, average bid-ask spread, and trading volumes. Key considerations include the ecosystem’s presence on major Centralized Exchanges (CEXs), detailing trading pairs and average daily volume to assess global reach, and its support on Decentralized Exchanges (DEXs). For DEXs, please detail the size and depth of primary liquidity pools, Total Value Locked (TVL), and any details around liquidity incentives.  
  A strong liquidity profile, characterized by deep order books on CEXs and substantial pools on DEXs, is essential for maintaining price stability and attracting institutional investment for Akash.
* **Ecosystem Investment and Growth Support:** Provide your framework to foster growth through strategic project funding. This includes detailing specific investment strategies, such as grants, venture capital participation, and direct financial backing for promising decentralized applications and infrastructure developments. Furthermore, clearly identify and profile the key investors, venture capital firms, and institutional partners who are committed to the long-term success and expansion of the ecosystem.  
* **Institutional Interest:** Describe institutional interests towards the ecosystem, particularly those that are attractive to stable yields backed by real-world assets. Describe how your community can help Akash gain such institutional interest.

## Technical Overview

Akash Network is a decentralized cloud computing marketplace built on the Cosmos SDK, implementing a peer-to-peer network for leasing computing resources. The network consists of tenants seeking computing capacity and providers offering resources, coordinated through blockchain-based smart contracts.

### Core Application Architecture

#### AkashApp Structure

The network is implemented as `AkashApp`, extending Cosmos SDK's `BaseApp` and implementing the ABCI application interface. The application contains:

- **BaseApp**: Core consensus and state management  
- **App**: Container for keepers, module manager, and codec  
- **Codec**: Protobuf and amino codecs for serialization  
- **Module Manager**: Coordinates all blockchain modules

#### Keeper Architecture

State management is handled through a two-tier keeper system:

**Special Keepers** (no dependencies):
- Params, ConsensusParams, Upgrade keepers

**Normal Keepers** (dependency-ordered):
- **Cosmos Core**: Auth, Bank, Staking, Distribution, Slashing, Gov, IBC  
- **Akash-Specific**: Escrow, Deployment, Market, Provider, Audit, Cert, Take

### Module System

#### Core Modules

The marketplace functionality is implemented through six Akash-specific modules:

1. **Deployment**: Manages workload deployment lifecycle  
2. **Market**: Handles orders, bids, and leases  
3. **Provider**: Manages provider registration and attributes  
4. **Escrow**: Processes payments and deposits  
5. **Audit**: Handles provider auditing  
6. **Cert**: Manages certificates  
7. **Take**: Processes marketplace fees

### Module Initialization

Modules follow strict initialization order to satisfy dependencies:

- Foundation modules (auth, bank, staking)  
- Governance modules (slashing, gov)  
- System modules (upgrade, mint, crisis)  
- Cross-chain modules (IBC, evidence, transfer)  
- Akash foundation modules (cert, take, escrow)  
- Marketplace modules (deployment, provider, market)

### ABCI Lifecycle

The application implements the full ABCI lifecycle for block processing:

1. **InitChain**: Initializes genesis state from all modules  
2. **PreBlocker**: Handles upgrades and account preparation  
3. **BeginBlocker**: Processes block-start logic with specific module ordering  
4. **EndBlocker**: Finalizes block processing  
5. **Precommitter**: Final cleanup before state commit

### Marketplace Mechanics

#### Order Flow

1. Tenants create deployment orders specifying resource requirements  
2. Providers bid on orders with offered resources and pricing  
3. Market module matches orders with bids  
4. Escrow module handles payment processing  
5. Deployment module manages container lifecycle

#### State Management

- **KV Stores**: Persistent state for accounts, balances, validators  
- **Transient Stores**: Per-block temporary computation state  
- **Memory Stores**: Non-consensus data like capability keys

### Network Configuration

#### Token Economics

- Native token: AKT (Akash Token)  
- Minimum validator commission: 5%  
- Governance deposit requirements: 40% of MinDeposit  
- Unbonding period: 2 weeks

#### Consensus Parameters

- Block time: \~5 seconds  
- Signed blocks window: 30,000 blocks (\~41 hours)  
- Minimum liveness: 5%  
- Double sign slashing: 5%  
- Downtime slashing: 0%

### Technical Implementation

#### Build System

- Written in Go (Golang 1.21.0+)  
- Uses Makefile for build automation  
- Single binary `akash` containing full node and client functionality

#### API Interfaces

- gRPC services for node communication  
- REST gateway for client access  
- CLI interface for node operations

### Notes

This summary focuses on the [core](https://github.com/akash-network/node) blockchain implementation. The actual deployment of workloads happens through [provider-side](https://github.com/akash-network/provider) infrastructure that interfaces with the blockchain but is not covered in this codebase. The network has undergone multiple upgrades to enhance performance and add features like GPU support and improved fee mechanisms.To learn further into and interact with the code base, check out the [node](https://deepwiki.com/akash-network/node) and [provider](https://deepwiki.com/akash-network/provider) deepwikis.

## Submission

Overclock Labs, the core developer coordinating this proposal, will serve as the primary evaluator. Interested parties should contact Greg Osuri on [X](https://x.com/gregosuri) or [Telegram](https://t.me/gregosuri) .

## Copyright

All content herein is licensed under [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0).
