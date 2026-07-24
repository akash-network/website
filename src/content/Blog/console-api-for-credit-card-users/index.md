---
title: "Console API for Credit Card Users"
description: "API lets credit card users manage deployments, no blockchain knowledge needed."

pubDate: "2025-08-16"
draft: false

categories:
  - Product
tags:
  - Product
  - Akash Console
  - REST API
  - credit card
  - deployment automation
  - AEP-63
  - managed wallets
  - CI/CD
  - DevOps
  - decentralized cloud
  - no crypto required
contributors:
  - Anil Murty

bannerImage: ./banner.png
---

> **TL;DR:** The Akash Console Managed Wallets API (AEP-63) lets credit card users programmatically deploy and manage workloads via standard REST endpoints — no blockchain knowledge, no private keys, no Cosmos SDK. Full Swagger docs at console-api.akash.network/v1/swagger.


You shouldn’t have to be a crypto expert to deploy on the decentralized cloud. The [Credit Card payments functionality](/blog/introducing-credit-card-payments-in-akash-console/), introduced last year solved that problem. Earlier this year, the Akash core team took that one step further by allowing credit‑card users to programmatically manage workloads without worrying about crypto or blockchain specific parameters or functions.

Crypto users of Akash Network have had the [AkashJS](https://github.com/akash-network/akashjs) SDK for programmatic deployments for several years. For non-crypto users (aka “normies”) AkashJS was practically unusable as it required mnemonics, wallets and Cosmos SDK know-how. [AEP‑63](/roadmap/aep-63/) identified this gap, noting that the growing number of credit card users of Akash needed a simple, developer‑friendly API. The result is the **Managed Wallets API v1**: a set of REST endpoints that make Akash accessible to teams that prefer to pay with credit cards.

<div class="grid md:grid-cols-2 gap-4 ">

![Console API for Credit Card Users](api-1.png)

![Console API for Credit Card Users](api-2.png)

</div>

## Build fast without blockchain knowledge

[AEP‑63](/roadmap/aep-63/) envisioned a world where developers could provision, scale and tear down deployments using familiar HTTP calls. That vision is now reality. No more managing private keys or mnemonics – just generate an API key from the Console, then use API endpoints to automate everything from certificate creation to bidding, leasing and deployment closure

The API covers:

- **API key management**: Generate, list or revoke keys. Each key is scoped to your account and validated automatically, so you stay secure.
- **Certificate management**: Use endpoints to create, view or revoke TLS certificates. These certificates are required for secure HTTPS deployments.
- **Deployment lifecycle**: Programmatically create deployments, list all your deployments, fetch specific deployment details and close deployments when you’re done.
- **Funding Deployments**: Check your escrow balance and deposit additional funds on the fly.
- And more!

![Console API for Credit Card Users](api-3.png)

**Documentation & UI**: To help you get started, we’ve added a user‑friendly [API key management page](https://console.akash.network/user/api-keys) in Console and published comprehensive [docs via Swagger](https://console-api.akash.network/v1/swagger)

![Console API for Credit Card Users](api-4.png)

## Looking Ahead

In the spirit of continuous improvement, [AEP-70](/roadmap/aep-70/) on the Akash Network near term roadmap will make this API even easier and more useful by adding the following features:

- Use of JWT Authentication: Users will not have to worry about creating and managing certificates
- Retrieving Events & Logs associated with a deployment

For technical support or any questions about the new Console API, please head over to the [Akash Discord](https://discord.akash.network/) server, where technical members of the Akash community are available around the clock and ready to assist.

## Frequently Asked Questions

**What is the Akash Console API for credit card users?**
A set of REST endpoints (Managed Wallets API v1) that let non-crypto users programmatically create, manage, fund, and close Akash deployments without wallets, mnemonics, or Cosmos SDK knowledge.

**How do I get started with the Console API?**
Generate an API key from the Console at console.akash.network/user/api-keys, then use standard HTTP calls to manage your deployments. Full docs at console-api.akash.network/v1/swagger.

**What operations does the API cover?**
API key management, TLS certificate management, full deployment lifecycle (create, list, fetch, close), escrow balance checking and funding, and more.

**Do I need to understand blockchain to use the API?**
No — the API abstracts all blockchain complexity. Use familiar HTTP patterns identical to any other cloud API, with API key authentication instead of cryptographic keys.

**What is AEP-63?**
The Akash Enhancement Proposal that identified the gap for credit card users needing programmatic access — leading to the Managed Wallets API v1 as the solution.

**What is coming in AEP-70 for the Console API?**
JWT authentication (eliminating certificate management) and the ability to retrieve events and logs associated with deployments — making the API even simpler for CI/CD integration.

**Can crypto wallet users use this API too?**
This API is specifically designed for managed wallet (credit card) users. Crypto users have AkashJS SDK available at github.com/akash-network/akashjs for programmatic access.

