---
title: "Developing DeCloud: Product Update 2"
description: Yesterday, on Monday, November 30th, we announced our second exchange listing on BitMart, further expanding liquidity for AKT token, and launched Phase 3, the third and final phase of The Akashian Challenge incentivized testnet.

pubDate: "2020-12-01"
draft: false

categories:
  - Product
tags:
  - Product
contributors:
  - Adam Bozanich

bannerImage: ./banner-image.png
---

Yesterday, on Monday, November 30th, we [announced our second exchange listing on BitMart](https://akash.network/blog/announcing-akash-token-listing-on-bitmart-exchange/), further expanding liquidity for AKT token, and [launched Phase 3](https://akash.network/blog/the-akashian-challenge-phase-3-week-1-is-live/), the third and final phase of The Akashian Challenge incentivized testnet.

You may remember earlier this year, when we launched The Akashian Challenge, one of the ecosystem’s largest and most ambitious testnets, with 99 active validators.

Phase 3 accelerates our vision for a decentralized and open cloud computing marketplace and will serve as the launchpad for [Mainnet 2](https://akash.network/blog/akash-decloud-mainnet-overview/), the materialization of Akash DeCloud.

With 500,000 Akash Token (AKT) in rewards and the chance to explore the world’s first decentralized cloud, [Phase 3](https://akash.network/challenge/) has attracted validators and developers from around the world. It’s been exciting for us to see Akashian Challengers flex their technical chops through our guided and open ended challenges.

Just in the first day of Phase 3, we’ve seen 86+ application deployments in the world’s first decentralized cloud. We appreciate the support of Phase 3 Challengers to help us build a stronger DeCloud.

#### **Akash DeCloud Development Update**

**\_\_\_\_\_**

**New Release Candidate**

On November 23rd, we cut a new release candidate of our software: [Akash v0.9.0-rc4](https://github.com/ovrclk/akash/releases/tag/v0.9.0-rc4).  The primary feature of this release was the inclusion of Audited Attributes, which allows tenants to create leases only on providers who have met certain criteria and have that criteria verified, or audited, by a person or entity.

For example, Bob has a provider and declares its _region_ attribute to be US-West.  Alice knows Bob personally and can confirm that his provider is in the US-West region, so she submits a transaction on the Akash blockchain signing off that his _region_ attribute is true.

Now, Susan wants to launch an application onto Akash DeCloud, but has two requirements: first, it must run on a US-West server, and second, its region attribute must be audited by Alice, whom she trusts.  Susan’s application will now only be hosted by Bob, or any other provider that meets her two requirements.

[This update](https://github.com/ovrclk/akash/pull/925) improves the Audited Attribute functionality by allowing more flexibility to the tenant for choosing an appropriate provider for their needs.

**Documentation**

To help prepare the developer community for The Akashian Challenge Phase 3, we’ve worked diligently to overhaul our documentation. Improved [metadata organization](https://github.com/ovrclk/net) now allows for a much cleaner and deliberate interface, enabling developers to more easily gather information to join our Mainnet or any current testnet.

**Telemetry**

The Cosmos SDK contains functionality to gain insight into the performance and behavior of applications through the use of what’s called a “telemetry package.”  As Akash is built on the Cosmos SDK, we utilize this telemetry data and are [working to add](https://github.com/ovrclk/akash/issues/921) additional metrics so developers have access to more detailed node information.

Some of these new metrics will include deployment created, order created, order closed, and transfer amount.

#### **What’s Next?**

**\_\_\_\_\_**

- Gateway API authentication
- Provider services stability
- Provider services observability
- Provider services transaction batching

#### **Don’t Miss the Latest Akash Network Product Updates**

**\_\_\_\_\_**

Join our [Discord dev chat](https://discord.com/invite/DxftX67) for technical support and information.

Join our [Telegram](https://t.me/AkashNW) for the latest Akash Network platform, product, and Akash Token (AKT) updates and announcements.
