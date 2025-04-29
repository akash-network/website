---
aep: 23
title: "Multi Currency Support with Stable Payments"
author: Cheng Wang (@lechenghiskhan)
status: Final
type: Standard
category: Core
created: 2023-08-22
completed: 2023-08-29
updated: 2024-12-01
resolution: https://www.mintscan.io/akash/proposals/224
discussions-to: https://github.com/orgs/akash-network/discussions/147
roadmap: major
---

## Motivation

Currently, the only supported form of payment and settlement on Akash Network is the network's native AKT coin. This creates several challenges for both providers and tenants, including, but not limited to, the following:

### Tenant challenges

1. Lack of price stability. This leads to tenants having difficulty understanding their costs and planning potential spending ahead of time due to the inherent price volatility of AKT.
2. Acquiring, using, and holding an alternative asset. Tenants have to go through the process of acquiring and holding AKT, which is not as widely accessible or as well-understood as USDC.

### Provider challenges

1. Lack of price stability. It becomes difficult to consistently and reliably forecast revenues due to the inherent price volatility of AKT.
2. Holding and liquidating an alternative asset. Providers have to understand how to handle, custody, and ultimately liquidate AKT earnings in order to realize revenue.

Collectively, these challenges make it difficult for Akash Network to acquire tenants and providers who don't have, don't understand, or don't wish to acquire/hold AKT.

Stable payments aim to alleviate resource planning concerns around a volatile alternative asset, making the experiences for both providers and tenants on Akash Network more consistent and accessible. This will clear the path for more tenants to deploy more workloads to Akash Network and make the value proposition for providers clearer while lowering the barrier to entry for both. Supporting native USDC will enable greater access across the board for both sides of the marketplace.

## How does this feed into AKT 2.0?

AKT 2.0 is a massive undertaking that encompasses economics, incentive theory, and public goods design just to name a few. This PRD aims to tackle one of the single biggest components of AKT 2.0: stable payments & the take rate.

## Desired user experience

### Phase 1: MVP

For the initial launch, we should focus on the bare essentials to expedite implementation. This phase should be limited to:
1. Native USDC integration
   - Transactions will occur in a single currency (USDC to USDC or AKT to AKT), without any currency conversion.
2. Simplified take rate mechanism
   - A straightforward 20% deduction from provider settlements. Providers can adjust their bid prices accordingly.
3. Module account implementation
   - Potentially include a basic version without multi-sig distribution, controlled solely by governance. This feature may be postponed if it slows down development.
4. Gas fee structure
   - USDC transactions will continue to use AKT for gas fees.

### Stage 2: Rapid Succession

1. If not implemented in the initial phase, activate blockchain-based governance to facilitate the distribution or exchange and subsequent destruction of AKT tokens.
2. Implement a streamlined deployment process that eliminates gas fees by utilizing an authorized faucet, which is funded through revenue-sharing mechanisms.

### Stage 3: Additional Features

All Phasse 3 enhancements should be considered secondary priorities after implementing more critical aspects of AKT 2.0.
1. Implement atomic swap functionality:
   - Integrate at the account module level to potentially enable automatic burning in the future.
   - Incorporate at the tenant account level, allowing those who prefer to pay in USDC to avoid acquiring AKT solely for gas fees.
     - An alternative approach could involve enabling gas-free transactions for USDC deployments due to the high take rate.
2. Support cross-currency transactions and settlements (e.g., pay using USDC and settle in AKT).
3. Introduce bilateral take fees, applying them to both tenants and providers instead of providers exclusively.

## Feature and Capability Overview

The following list outlines key features and capabilities, presented without specific prioritization:
1. Axelar-based USDC integration
   - Implement USDC support within the SDL
2. Osmosis DEX integration
   - Develop price oracles for AKT/USDC exchange rate determination
   - Implement automatic token swaps to facilitate:
     - Gas fee payments for tenants and providers without requiring AKT acquisition
3. Solution for gasless initial transactions
   - Address the challenge of users needing minimal AKT for their first operations
   - Primary focus: Certificate creation process
   - Potential solution: Investigate AuthZ gas module from Cosmos SDK
4. Module account creation
   - Establish an account to hold the platform's take rate
   - Consider this account as a potential foundation for the IDP
5. Take rate implementation
   - Option A: Single-sided approach (applied during provider withdrawals)
   - Option B: Dual-sided approach (applied during tenant deposits and provider withdrawals)

## Proposed Specification [Initial Draft]

This document outlines the key features for the first phase of the stable payments enhancement package, encompassing stable payments, settlements, and fee structures. This represents a minimum viable product, with subsequent phases to be defined after finalizing this specification.

### USDC Integration

1. Initially, only Axelar USDC on Osmosis will be supported as the stable currency on Akash Network.Future considerations: Axelar USDC directly on Akash Network, Gravity USDC, issuance chain USDC.
![USDC on Osmosis](https://user-images.githubusercontent.com/68354230/228345109-ab3d4ecc-2325-453a-8d03-54da6005cf3a.png)

2. Leverage existing Kado onramp support on Osmosis

![Kado Onramp](https://user-images.githubusercontent.com/68354230/228345384-2bcfa102-8b0a-469b-8a8b-cde10cfe40f3.png)

3. Wallet compatibility (Keplr): Implement USDC support mirroring Osmosis' current Keplr integration, including viewing, sending, and receiving USDC with gas paid in native currency.

4. Establish a governance-updatable table of supported currencies and their respective Take rates. Initial table for phase 1:

| Currency | Take Rate |
| -------- | -------- |
| AKT | 4% |
| USDC | 20% |

### Fee Structure

1. Set initial USDC fee rate at 20%.
2. Apply fees only when providers withdraw funds.
3. Implement currency-specific fee rates, adjustable independently through governance.

### SDL & Escrow

1. Enable currency selection in SDL, allowing tenants to specify AKT, USDC, or ALL.
2. Implement provider querying based on currency parameters.
3. Adapt escrow accounts to handle USDC transactions.
4. Define minimum escrow amounts for new currencies (e.g., uAKT for AKT, TBD for USDC).
5. Allow providers to filter and bid on jobs based on currency preferences.
6. Enable USDC settlements from escrow for providers.

### Community Pool Updates

1. Ensure compatibility with Osmosis' Axelar USDC, including holding and transacting capabilities.
2. Make USDC balances, transactions, and history visible on block explorers.

## Network Upgrade

1. Necessary due to state changes.
2. Testnet requirements: likely two separate testnets (Akash and Osmosis).

## Educational Initiatives

1. Inform providers about fee rates and pricing strategies.
2. Educate tenants on potential cost benefits of AKT vs USDC payments.
3. Brief ecosystem partners (Praetor, Cloudmos, Spheron, etc.) on changes.
4. Initiate discussions on GitHub and Discord for feedback and clarifications.
5. Prepare Vanguards and insiders to address community questions.
6. Update relevant documentation.

## Marketing Strategy

1. Create a Twitter thread highlighting key features, linking to GitHub spec.
2. Cross-post to Akash's other social channels.
3. Host a community AMA discussing feature mechanics and network impact.
4. Summarize AMA content in a blog post on akash.network, amplified through social media.

## Copyright

All content herein is licensed under [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0). 