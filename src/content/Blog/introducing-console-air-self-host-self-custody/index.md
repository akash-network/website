---
title: "Introducing Console Air: Self-Host, Self-Custody Akash"
description: "Akash Console is splitting in two. Console keeps the fastest path to deploy with managed wallets and credit-card billing. Console Air preserves the full self-custody, self-hostable experience for users who want to run their own keys and their own UI."
pubDate: "2026-05-15"
draft: true

categories:
  - Product
tags:
  - Product
contributors:
  - Maxime Beauchamp

bannerImage: ./banner.png
---

We're splitting Akash Console into two products.

The console you know at [console.akash.network](https://console.akash.network) is becoming more focused: managed wallets, credit-card billing, and the shortest possible path from "I have a Docker image" to "it's running on Akash." Everything that supports that goal stays. Everything that doesn't is moving.

The self-custody features — connecting your own Keplr wallet, signing your own transactions, running the console against your own nodes — are not going away. They're moving to a new home: **Console Air**. Console Air is open source, self-hostable, and preserves the full self-custodial experience for the users who want it.

This split is formalized in [AEP-84](https://akash.network/roadmap/aep-84/), the Akash Enhancement Proposal that outlines the rationale, scope, and migration path.

## Why split the product?

Akash Console has been trying to be two things at once:

1. **The fastest on-ramp to decentralized compute** — for people who don't already hold ACT, don't run a Cosmos wallet, and just want to deploy something. For these users, every wallet pop-up, every "go fund this address," every "sign this transaction" is a paper cut.
2. **A first-class self-custody UI** — for the developers, builders, and providers who already live in the Cosmos ecosystem, hold ACT, and want full control over keys, RPC nodes, and signing.

Optimizing for both at the same time means doing neither of them as well as we could. Every product decision was a compromise: do we surface the credit-card flow, or the Keplr flow? Do we hide gas details, or expose them? Do we route through our managed signer, or your local one?

By splitting, we can stop compromising:

- **Akash Console** becomes the cleanest possible managed-wallet experience. No mnemonic prompts. No chain switching. No "what's a gas adjustment?" Just deploy.
- **Console Air** becomes a serious tool for self-custodial users. Run it locally or self-host it. Use your own nodes. Sign your own transactions. Own the entire stack end-to-end.

Both consoles point at the same Akash Network — the same providers, the same deployments, the same chain. You can use either, or both.

## What's moving to Console Air

If you're a self-custody user today, here's what to expect on Console Air:

- Connect your own Keplr wallet
- Sign every transaction yourself
- Configure custom RPC and API endpoints
- Manage your own deployment certificates
- Self-host the entire UI behind your own domain if you want to

If you're a managed-wallet user — you signed in with email or social login, and the console handles signing for you — nothing changes. Stay on [console.akash.network](https://console.akash.network).

## Migrating: Export your local data

If you've been using self-custody on Akash Console, your local data — saved deployments, certificates, network preferences, favorites — lives in your browser. We've made it easy to bring it with you.

In **Akash Console** → **App Settings** → **General**, click **Export Local Data**. You'll get a JSON file containing your settings, certificates, and deployment metadata.

In **Console Air**, go to the same settings page and click **Import Local Data**. Pick the file you exported. Done — your deployments and certificates are right where you left them.

This works because Console Air is the same codebase, minus the managed-wallet flows. Local storage formats are identical, so the export/import is a straight one-to-one transfer.

## Timeline

Console Air is the new home for self-custody. The managed-wallet console at [console.akash.network](https://console.akash.network) will gradually remove the self-custody flows over the next few releases. We'll surface deprecation notices in-app well before any flow is removed, and we'll keep the export tool working so you always have a clean migration path.

You'll start seeing an in-app banner pointing here and to Console Air over the coming weeks. Once you've migrated (or confirmed you don't need to), dismiss the banner and it stays dismissed.

## Try Console Air

The repository is at [github.com/akash-network/console-air](https://github.com/akash-network/console-air). Clone it, run it locally, or deploy your own instance — the README walks through both. Issues, PRs, and feedback welcome.

If you have questions about the split or the migration, find us in [the Akash Discord](https://discord.gg/akash) or open an issue on the Console Air repo. This is the start of a more focused product on both sides — we want to hear how it lands.
