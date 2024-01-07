---
title: "Akash MAINNET 2 Update: April 29, 2021"
description: Akash MAINNET 2 v0.10.1 launched on March 8th, and since then, we’ve seen an exciting diversity of apps deployed on Akash, and we’ll be sharing many of these pioneering use cases in the coming weeks. We’ve had a 10x increase in deployments since the launch of MAINNET 2.

pubDate: "2021-05-05"
draft: false

categories:
  - Updates
tags:
  - Updates
contributors:
  - Neil Gehani

bannerImage: ./banner-image.png
---

Akash MAINNET 2 ([v0.10.1](https://github.com/ovrclk/akash/releases/tag/v0.10.1)) launched on March 8th, and since then, we’ve seen an exciting diversity of apps deployed on Akash, and we’ll be sharing many of these pioneering use cases in the coming weeks. We’ve had a 10x increase in deployments since the launch of MAINNET 2.

Since the launch of the world’s first decentralized cloud, our team has focused on strengthening and improving ecosystem security and interoperability, provider capabilities, and deployment UX to make it faster for developers to deploy.

This second MAINNET 2 update refers to the latest release ([v0.12.1](https://github.com/ovrclk/akash/releases/tag/v0.12.1)) and incorporates all [changes](https://github.com/ovrclk/akash/compare/v0.10.1...v0.12.1) since MAINNET 2 launch.

We’re building out our ecosystem of partners to enable production-grade applications:  traditional cloud-native, serverless, machine learning, and decentralized projects (DeFi, dApps, DAOs). We’ll democratize the acquisition of compute by offering developers unprecedented choice--not only in where they deploy and how fast they’ll be able to deploy, but also at a price they want to pay.

Our goal is to change the power dynamics and put developers in control (self-sovereign).

We update frequently as we progress the platform. You can always check the [releases](https://github.com/ovrclk/akash/releases) page in our GitHub repo for the latest enhancements and fixes.

**NETWORK USAGE**

The most important KPI that we’re monitoring is _Active Leases - Daily, Monthly_ (DAL/MAL).

This indicates new deployments per day. Note: deployments can be _active_ for more than 1 day. The day after our launch, we had 3 DAL and are now averaging 50.

There are a few other KPIs that we are tracking. We’ll soon have a network stats page that will show the relevant KPIs that indicate network usage and growth.

**IMPROVED UX FOR TENANTS**

We’ve made several improvements to our Command Line Interface (CLI) for developers to make deploying faster and more streamlined.

- [#1165](https://github.com/ovrclk/akash/issues/1165) - changed default to query for all provider attributes if no arguments are provided. Makes it faster to vouch for the provider via signing for all attributes at once

- [#1153](https://github.com/ovrclk/akash/issues/1153) - improved error reporting

- [#1187](https://github.com/ovrclk/akash/issues/1187) - improved support for hardware wallets (e.g. [Ledger](https://shop.ledger.com/pages/hardware-wallets-comparison))

- [#1151](https://github.com/ovrclk/akash/issues/1151) - output and error messages stream to stdout/stderr

- [#1149](https://github.com/ovrclk/akash/issues/1149) - improved output messages when using option flags. Default is scoped to option flags

**SAFETY NET FEATURE**

We recently added a safety net for Tenants. If a manifest is not sent to a provider within some period of time after a lease is created, the provider will close the lease. This safety net prevents tenants from paying for leases that do not have any workloads running.

**PROVIDER PRICING**

[Pricing Update](https://github.com/ovrclk/akash/pull/1173): To account for Akash Token’s (AKT) rising prices, providers will need a way to offer lower bids than the current minimum of 1 uAKT, or 0.000001 AKT. Included in this update is the first step towards implementing fractional uAKT pricing, and involves switching the pricing variables from integer type to decimal type.

Ultimately, providers will be able to structure their pricing in such a way that they may earn 0.25 uAKT per block and be able to withdraw 1 uAKT every four blocks.

_In the future, we will support fractional uAKT._

**IMPROVED NETWORK PERFORMANCE**

We now preemptively stop broadcasting so that as more providers come online, invalid transactions will not affect network performance. Providers only bid on deployments that attributes have been audited for, and have the correct signature. [This](https://github.com/ovrclk/akash/pull/1162) determines which provider is allowed to bid, in order.

This reduces the network congestion on the blockchain for improved performance, and enables pre-filtering of acceptable matches. An additional filter has been added that enables providers to not bid on groups where the calculated price is too high ([#1147](https://github.com/ovrclk/akash/pull/1147)).

**CLIENT CERTIFICATES AUTO CREATE**

[Client Certificates Check](https://github.com/ovrclk/akash/pull/1169): To establish secure connections between Tenants and Providers on Akash, an mTLS certificate must be created and stored on-chain. If the certificate was not created, and a Tenant tried to use the deploy tool to create a deployment, the process would fail and the user’s transaction fee would be wasted.

This fix now requires a certificate file to be present and on-chain before the transaction is broadcast to the network. It will auto-create if one doesn’t exist.

**ECOSYSTEM**

- Security improvements to the ecosystem: [Cosmos SDK](https://github.com/ovrclk/akash/pull/1171) and [Tendermint](https://github.com/ovrclk/akash/pull/1202).

- [Reliability improvement](https://github.com/ovrclk/akash/pull/1193) _-_ This improves the reliability of the transaction written to the blockchain. Today, the transaction has a 10 second timeout. At times, it can take longer for approval by enough validators. We ensure that this timeout doesn’t result in an error. We now auto-retry to check if the transaction is recorded, enabling the deployment workflow.

- IBC is now live! - InterBlockchain Communication protocol enables interoperability between multiple blockchains in the Cosmos ecosystem. We’re one of the core contributors to the Cosmos and Tendermint open-source projects.  As core developers of the IBC relayer, we’re excited to announce that IBC is now live on Akash. With IBC, Akash enables ATOM to AKT swap via Cosmos HUB, and multi-currency settlement, thus enhancing liquidity.

**UPDATED FAQ**

We started consolidating developer questions into an [FAQ](https://docs.akash.network/documentation/faq) and will continue to expand this resource.

#### **Don’t Miss the Latest MAINNET 2, Akash, and AKT News!**

\_\_\_\_\_

[**Join our Telegram**](https://t.me/AkashNW) for the latest news, giveaways, and invites to special events!

[**Join our Discord developer chat**](https://discord.com/invite/DxftX67) for technical support and information.
