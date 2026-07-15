---
categories: ["Getting Started"]
tags: ["Console", "Console Air", "Routing"]
weight: 3
title: "Choosing Your Console"
linkTitle: "Choosing Your Console"
description: "Akash ships two web apps for deploying — Console (managed) and Console Air (self-custody). Pick based on whether you want to hold your own keys."
---

**Akash ships two web apps for deploying. Pick the one whose key-custody model matches what you want.**

| | <a href="https://console.akash.network" target="_blank" rel="noopener noreferrer">Akash Console (managed) ↗</a> | <a href="https://github.com/akash-network/console-air" target="_blank" rel="noopener noreferrer">Console Air (self-custody) ↗</a> |
|---|---|---|
| **Wallet** | Not required | Bring your own (Keplr-compatible) |
| **Billing** | Credit card | Pay directly in AKT/ACT |
| **Hosting** | Hosted at `console.akash.network` | Self-hostable; you run it |
| **Best for** | Beginners, SaaS users, anyone who wants AWS-style deploys without crypto | Crypto-native users who want to own their keys end-to-end |
| **Open** | <a href="https://console.akash.network" target="_blank" rel="noopener noreferrer">console.akash.network ↗</a> | <a href="https://github.com/akash-network/console-air" target="_blank" rel="noopener noreferrer">github.com/akash-network/console-air ↗</a> |

## Pick by audience

**Do you want to hold your own keys?**

- **No** → [Akash Console](https://console.akash.network). Sign up with Google, GitHub, or a passwordless email code—no credit card required to start deploying. Begin with the [Quick Start](/docs/getting-started/quick-start).
- **Yes** → [Console Air](https://github.com/akash-network/console-air). Clone the repo, run it locally, connect your wallet. New here? Walk through your first deploy in [Deploy with Console Air](/docs/developers/deployment/console-air). Already have deployments on `console.akash.network`? Follow the [migration guide](https://github.com/akash-network/console-air/blob/main/docs/migrating-from-akash-console.md).

For programmatic access — CLI, SDK, REST API — see the [API Documentation](/docs/api-documentation/getting-started).

## What Console Air looks like

A wallet-connected deploy in three frames — same UI as the legacy self-custody flow, now living in Console Air:

![Wallet connected](/images/docs/console/wallet/4-wallet-connected.png)
*Connected — your Akash address and balances show in the top right.*

![Mint ACT](/images/docs/console/wallet/5-mint-act.png)
*Mint ACT from AKT — Console Air's escrow currency for deployments.*

![Bid selection](/images/docs/console/wallet/9-bid-selection-wallet.png)
*Pick a provider bid and sign the lease in your wallet.*

For the full step-by-step, see [Deploy with Console Air](/docs/developers/deployment/console-air).

## Background

The split is explained in the [Console Air announcement](/blog/introducing-console-air-self-host-self-custody) and the design rationale in [AEP-84](https://github.com/akash-network/AEP/tree/main/spec/aep-84).
