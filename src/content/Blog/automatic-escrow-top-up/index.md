---
title: "Automatic Escrow Top-Up"
description: "Auto-funds Akash deployments to prevent downtime for credit card users."

pubDate: "2025-08-14"
draft: false

categories:
  - Product
tags:
  - Product
  - Akash Console
  - escrow
  - auto top-up
  - deployment management
  - AEP-57
  - credit card payments
  - uptime
  - decentralized cloud
  - GPU rental
contributors:
  - Anil Murty

bannerImage: ./banner.png
---

> **TL;DR:** Akash Console's Automatic Escrow Top-Up (AEP-57) keeps your deployments running by automatically topping up escrow balances before they hit zero — no more manual monitoring or unexpected downtime. Available now for credit card users via a simple toggle per deployment.


Keeping your applications online should be effortless. In the early days of Akash, if a deployment’s escrow account ran dry, the lease was closed and your app went dark, often without warning. That manual chore of watching balances and topping up funds became a thing of the past earlier this year with the introduction of Automatic Escrow Top Up functionality.

[AEP‑57](/roadmap/aep-57/) identified two key components to make this possible: a simple settings control for turning on automatic top‑ups and a backend worker that watches every deployment’s balance and adds funds before it hits zero. Those ideas came to life in Akash Console a few months ago.

![Automatic Escrow Top-Up](escrow-top-up-1.png)

## Never worry about downtime again

Head to the **Deployments** → **Specific Deployment** and flip the **Auto‑Top‑Up switch**. Behind the scenes, a software job continuously checks the remaining balance on that deployment, estimates when it will run out and initiates a top‑up transaction before the lease expires, as long as there are funds available in the account

![Automatic Escrow Top-Up](escrow-auto-top-up-2.png)
![Automatic Escrow Top-Up](escrow-auto-top-up-3.png)

## Granular control under the hood

To give customers maximum flexibility, we designed the feature around per‑deployment settings, giving users fine‑grained control over which deployments auto‑fund and how long each top‑up should last. A new /v1/deployments REST endpoint also lets your own tools read and update these settings programmatically, if you prefer that.

## Only for Credit Card Users (for now)

The escrow top up feature is only available for users who pay using a credit card for now. We hope to offer a similar capability for crypto users in the future. As a side note, credit card payments still use crypto tokens under the hood for deployment. For details on Credit Card payments and how to use them, consult [this announcement blog post](/blog/introducing-credit-card-payments-in-akash-console/.).

## Completing the circle with Credit Card Auto-Reload

Automatic escrow top-up keeps your deployments running as long as you have enough funds (credits) in your account. Which means you have to check your account periodically and make sure it has enough funds to cover all deployments. We recommend doing so periodically (one a week or month) and making sure to purchase enough funds to cover a slightly longer duration on all active deployments.

Soon you will not need to do that with [AEP-74](/roadmap/aep-74/) on the near-term roadmap.

For technical support or any questions about the escrow top-up, please head over to the [Akash Discord](https://discord.akash.network) server, where technical members of the Akash community are available around the clock and ready to assist.

## Frequently Asked Questions

**What is Automatic Escrow Top-Up on Akash?**
A feature that continuously monitors your deployment's escrow balance and automatically adds funds before it runs out — preventing lease termination and unexpected downtime without manual intervention.

**How do I enable Automatic Escrow Top-Up?**
Go to Deployments → Specific Deployment in Akash Console and flip the Auto-Top-Up switch. The system handles the rest as long as your account has available funds.

**Is Auto-Top-Up available for crypto wallet users?**
Currently only available for credit card users. Crypto wallet support is planned for a future release.

**What is AEP-57?**
The Akash Enhancement Proposal that identified the two key components for automatic escrow top-ups: a per-deployment settings control and a backend worker that monitors balances and initiates top-ups before expiry.

**Can I control which deployments auto-fund?**
Yes — the feature uses per-deployment settings, giving you fine-grained control over which deployments auto-fund and how long each top-up duration should last.

**Is there an API for managing auto-top-up programmatically?**
Yes — a /v1/deployments REST endpoint lets your own tools read and update auto-top-up settings without using the Akash Console UI.

**What happens when my account runs out of funds?**
Auto-top-up only works while your account has available credit. The upcoming AEP-74 will add credit card auto-reload to keep your account funded automatically as well.

