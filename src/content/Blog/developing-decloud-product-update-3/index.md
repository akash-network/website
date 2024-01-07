---
title: "Developing DeCloud: Product Update 3"
description: Since my last Developing DeCloud Product Update in December, we ran and wrapped up two exciting and action-packed weeks of The Akashian Challenge Phase 3 Testnet, and we’ve been integrating the testnet learnings for development of Mainnet 2, the materialization of Akash DeCloud.

pubDate: "2021-01-21"
draft: false

categories:
  - Updates
tags:
  - Updates
contributors:
  - Adam Bozanich

bannerImage: ./banner-image.png
---

Since [my last Developing DeCloud Product Update](https://akash.network/blog/developing-decloud-product-update-2/) in December, [**we ran and wrapped up two exciting and action-packed weeks of The Akashian Challenge Phase 3 Testnet**](https://akash.network/blog/akash-decloud-from-phase-3-to-mainnet-2/), and we’ve been integrating the testnet learnings for development of Mainnet 2, the materialization of Akash DeCloud.

Over the two weeks of Phase 3, we saw a staggering 3600+ application deployments on the world’s first decentralized cloud, including DeFi, gaming, messaging, databases, block explorers, and more—here’s a sample:

- **DeFi** - SushiSwap & UniSwap
- **Blog** - Ghost & Wordpress
- **Games** - DOOM & Super Mario
- **Databases** - mongoDB & MySQL
- **Data Visualization** - UFO Sightings
- **Block Explorers** - Big Dipper & Aneka

Check out the [full Awesome Akash list](https://github.com/ovrclk/awesome-akash) for a complete list of applications deployed in Phase 3.

Since then, we’ve been analyzing and integrating data and feedback from Phase 3 to improve functionality, enhance usability, and strengthen Mainnet 2.

####

**Akash DeCloud Development Update**  
**\_\_\_\_\_**

**DEPLOY TOOL**

The [deploy tool](https://github.com/ovrclk/akash/pull/1032) helps to automate deployments on Akash. Previously, deploying an application on Akash required numerous transactions and manual variable declarations.

The process went something like this--send a transaction, wait, send another transaction to confirm the previous one worked as expected, then repeat those steps until deployment is complete.

Now, even as the process is nearly identical behind the scenes, the user experience is greatly enhanced because it only takes one transaction to deploy an application.

**COSMOS SDK V0.40.0 UPDATE**

Akash’s software is [now compatible](https://github.com/ovrclk/akash/pull/1016) with the renowned [v0.40.0](https://github.com/cosmos/cosmos-sdk/releases/tag/v0.40.0) of Cosmos SDK, also known as [Stargate](https://stargate.cosmos.network/). Stargate enables functionality for Cosmos SDK-based blockchains, like Akash, to connect with each other using the first ever standardized protocol for Inter-Blockchain Communication (IBC).

In addition to enabling IBC, Akash’s upgrade to Stargate will bring additional features such as state sync, automatic upgrades, and full-featured light clients.

**HOSTNAME VALIDATION**

The [Hostname Validation feature](https://github.com/ovrclk/akash/pull/1024) allows Akash providers to evaluate hostnames before accepting a deployment manifest and ultimately hosting the associated application.  If a provider sees a manifest and the specified hostname is already in use, the provider will reject the manifest.

When a deployment closes for any reason, its hostname will be released and made available for future use.

Hostname validation will also enable providers to block specific hostnames or domains.

**IMPLEMENT mTLS AUTHENTICATION**

TLS, or Transport Layer Security, is a cryptographic protocol used to secure communications between web servers and web browsers (clients). With TLS, the client verifies the identity of the server, and a secure connection is made - the server doesn’t necessarily care about the identity of the client.

On Akash, the provider (server) doesn’t want just anyone (client) to be able to access it and to make HTTP requests. If a client makes a request for a resource that they are not authorized to access, that request should be denied.

To solve this, mTLS, or mutual Transport Layer Security, is [now implemented](https://github.com/ovrclk/akash/pull/1017) on Akash. Certificates of accounts are stored on-chain so that both the client and the server can look up each other’s certificates.

Before mTLS, anyone could access logs and status for a tenant’s lease from the provider. With mTLS incorporated, the client and server each verify each other’s identities before a trusted communications line can be established.

**INVENTORY MANAGEMENT IMPROVEMENTS**

The testnet exposed corner-cases in the compute inventory management of provider services. While fixing these issues, we made inventory management more flexible, and we thoroughly tested final changes to ensure that it will behave as expected.

####

**What’s Next?**  
**\_\_\_\_\_**

**ESCROW ACCOUNTS & PAYMENTS**

This is a mechanism to allow time-based payments from one account to another, without block-by-block micropayments. They also support holding funds for an account until an arbitrary event occurs.

**EXPOSE KUBERNETES EVENT LOGS**

With this functionality, tenants can fetch Kubernetes events for any given lease and help them debug if there are any errors.

**ON-CHAIN RESOURCE LIMIT PARAMETERS**

Currently provider resource limit parameters are hard-coded in Akash’s software. We’ll be moving these on-chain so they can be changed via governance proposals.

Phase 3 Testnet exceeded our expectations, and showcased the beginnings of what is possible on Akash DeCloud. I’m excited to share more soon about what we’re building for Mainnet 2, launching this February 2021.

####

**Don’t Miss the Latest Akash Network Product Updates**  
**\_\_\_\_\_**

Join our [Discord dev chat](https://discord.com/invite/DxftX67) for technical support and information.

Join our [Telegram](https://t.me/AkashNW) for the latest Akash Network platform, product, and Akash Token (AKT) updates and announcements.
