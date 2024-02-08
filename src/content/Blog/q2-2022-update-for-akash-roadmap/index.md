---
title: "Q4 Update on Akash Roadmap 2022"
description: At the beginning of this quarter, the Akash core team published an ambitious roadmap, the Akash Roadmap 2022. Now we are at the end of our first quarter, here's is an update on how we are progressing through the roadmap.

pubDate: "2021-12-20"
draft: false

categories:
  - Updates
tags:
  - Updates
  - News
contributors:
  - Greg Osuri

bannerImage: ./banner-image.jpg
---

At the beginning of this quarter, the Akash core team published an ambitious roadmap, the [Akash Roadmap 2022](https://akash.network/blog/product-roadmap-2022). Now we are at the end of our first quarter, here's is an update on how we are progressing through the roadmap.

In summary, WAGMI.

### **Persistent Storage**

Akash now supports persistence storage (the most requested feature) in the Testnet. This feature requires a chain upgrade for Mainnet, which is currently planned for Q1 2022.

Persistence storage allows workloads to persist data between restarts, ideal for data-intensive workloads such as blockchain nodes, Solana and Ethereum.

**Status:** Testnet

**Since:** [0.15.0 (rc4)](https://github.com/ovrclk/akash/releases/tag/v0.15.0-rc4)

**Related Pull Request(s):**

- [feat: persistent storage #1348](https://github.com/ovrclk/akash/pull/1348)
- [docs(storage): setup and usage of persistent storage #1471](https://github.com/ovrclk/akash/pull/1348)

### **Network Usage Dashboard**

The first version of the Network usage dashboard is complete and deployed in production, naturally running on Akash, and available at [stats.akash.network](https://stats.akash.network).

This version is inspired by [Akashlytics](https://www.akashlytics.com/); the future version will include several provider-related metrics.

The source code is now being cleaned up and open-sourced momentarily with an announcement planned for early next year.

**Status:** Live ([stats.akash.network](https://stats.akash.network))

### **Hostname Migration**

Akash now supports Hostname Migration in the upcoming Testnet. Usage documentation is available [here](https://akash.network/docs/release-notes/v0.14.0#hostname-migration). This feature requires a chain upgrade for Mainnet, which is currently planned for Q1 2022.

Deployment of an updated workload encounters a challenge when the DNS hostname remains active on the existing deployment.  An example scenario is presented to ensure understanding of the challenge - followed by a review of the mechanism introduced in this release to migrate a hostname to the new deployment.

**Status:** Testnet

**Since:** [0.14.0](https://akash.network/docs/release-notes/v0.14.0)

**Related Pull Request(s):**

- [feat(provider): rework hostname management to use a kube operator #1365](https://github.com/ovrclk/akash/pull/1365)

### **TTY (Shell) Access** 

TTY Access is implemented in the Testnet. This feature requires a chain upgrade for Mainnet, which is currently planned for Q1 2022.

TTY Access allows developers to access the shell of the container that the application is running in. This provides the ability to easily debug. Currently, debugging and running applications on Akash is difficult, as users can not run arbitrary commands on a running container. TTY access unblocks this and allows users to run any command.

**Status:** Testnet

**Since:** [0.14.0](https://akash.network/docs/release-notes/v0.14.0)

**Related Pull Request(s):**

- [Add provider lease-shell command #1293](https://github.com/ovrclk/akash/pull/1293)

### **Inflation Decay Curve** 

Inflation Decay Curve is implemented in the Testnet. This feature requires a chain upgrade for Mainnet, which is currently planned for Q1 2022.

On-chain [inflation decay curve](https://akash.network/roadmap?feature=inflation-decay-curve) ensures inflation decay occurs every block period without needing governance proposals.

**Status:** Testnet

**Since:** [0.15.0 (rc4)](https://github.com/ovrclk/akash/releases/tag/v0.15.0-rc4)

**Related Pull Request(s):**

- [feat(inflation): Implement Akash custom inflation function according to the whitepaper. #1352](https://github.com/ovrclk/akash/issues/1352)

### Airdrop Faucet

The first version of the [Faucet](https://akash.network/roadmap?feature=airdrop-faucet) is complete and deployed in production, available at [drip.akash.network.](https://drip.akash.network) This version emits 20 Akash Token (AKT) and has a minor delay (for manual verification)  to prevent fraud. The future versions will employ automatic algorithms that will transmit tokens in real-time.

The source code is now being cleaned up and open-sourced momentarily. Announcement planned for January.

**Status:** Live ([drip.akash.network](https://drip.akash.network))

### **Provider Onboarding Framework** 

Currently, there is an enormous and intricate set of steps that a provider needs to execute in order to provide compute on the Akash Network. This leads to confusion and instability of the provider. A new provider onboarding framework will increase adoption, optimize the onboarding process, and eliminate potential issues with the provider in the future.

A provider onboarding framework is to ease new providers selling compute on Akash, planned to be released in Q4 of 2021 is now delayed.

The automation for bootstrapping a node is code-complete and tested internally for Testnet and Devnets; the documentation is, however, still pending, so we’re moving this deliverable to next quarter. The helm charts for installing various components are available at [ovrclk/helm-charts](https://github.com/ovrclk/helm-charts).

**Status**: Incomplete

**Related Repositories:**

- [ovrclk/helm-charts](https://github.com/ovrclk/helm-charts)

### **Developer Hub** 

The developer hub will be a one-stop shop for all developer-related content such as guides, tutorials, documentation, architecture, and discussions.

**Status:** Not Started

**Estimate (Updated):** Q1 2022

### **ASN (IP Addresses) Market** 

This Feature Dedicated IP addresses (and ports) for workloads and the marketplace to source them.

Workloads hosted on Akash share IP addresses because there is no facility to assign individual IP addresses to applications. This presents limitations with routing. Hostname name-based routing has to rely on HTTP or SSL. To accommodate for TCP / UDP, Akash assigns random ports and there is no way to multiplex TCP services over a single port. This also slows down fault recovery as DNS services require record updates which are slow to propagate. An ability to assign a dedicated IP address will solve this issue.

**Status:** Incomplete

**Estimate (Updated):** Q1 2022

### **Log Retention** 

The Log Retention feature provides the ability to retain logs between restarts

**Status:** Incomplete

**Estimate (Updated):** Q1 2022

**Related Pull Request(s):**

- [Provider JWT Service #1417](https://github.com/ovrclk/akash/pull/1417)

### **​​Ethereum Bridge**

The Ethereum Bridge enables AKT users to acquire AKT using various ERC-20 tokens (USDT). By enabling users with more options to buy and sell AKT, we can increase liquidity, eliminate friction points found in the new developer onboarding process, and attract additional AKT buyers and traders from the crypto retail market. Additionally, this will increase our likelihood of working with Tier 1 exchanges and DEXs like Uniswap.

The [Gravity Bridge](https://www.gravitybridge.net) went live on [December 14](https://twitter.com/gravity_bridge/status/1470896532257861635). We’re currently testing the bridge and the AKT ERC-20 contract is currently under development and audit.

**Status:** Mainnet

**Related Repositories:**

- [Gravity Bridge](https://github.com/Gravity-Bridge/Gravity-Bridge)

### **Akash Javascript SDK** 

Javascript SDK simplifies extending Akash in Javascript applications by providing libraries to improve access to the Akash API. The SDK also abstracts standard functions like credential management, retries, data marshaling, serialization, and deserialization.

The first version is complete and currently being tested on a new notification service to be announced next quarter.

**Status:** Incomplete

**Updated Estimate:**  Q1 2022

### **AKCMD Deploy Tool** 

AKCMD is a command-line utility that simplifies workload management on the Akash network. AKCMD is a complementary tool to core Akash CLI that focuses on improving tenant workflow by taking an opinionated approach to deployment on Akash Network.

Much progress has been made and the first version will be ready by mid-January.

**Status:** Incomplete

**Updated Estimate:** Q1 2022

### **Lease Renegotiation** 

This feature provides the ability for users to renegotiate the AKT price without breaking the lease. The volatility of AKT leads to unstable value exchanges, as the AKT denominated price is set during lease creation and doesn’t change until the lease terminates. When the dollar AKT is higher than it was during lease creation, it may benefit the provider at the cost of the tenant and vice versa. An ability to renegotiate the lease during its life cycle solves this issue.

We’re exploring a new stable payment mechanism for Akash as part of Akashian Economics 2.0. This feature may be obsolete.

**Status:** Not Started

**Updated Estimate:** Not Planned
