---
categories: ["Getting Started"]
tags: ["Console", "Billing", "Credits", "Funding", "Auto Top-Up"]
weight: 5
title: "How Funding Works"
linkTitle: "How Funding Works"
description: "How Akash Console credits, automatic deployment funding, Auto Top-Up, and the available vs. reserved balance work"
---

**You add credits to your Akash Console account, and Console keeps your deployments funded from that balance.** There is no deposit to choose and no per-deployment balance to watch.

This page covers the managed Console at [console.akash.network](https://console.akash.network), including the Console API. If you deploy with your own wallet through Console Air or the CLI, see [Choosing Your Console](/docs/getting-started/choosing-your-console) — you fund each deployment yourself there.

## Adding credits

Credits are denominated in US dollars. You get them three ways:

- **Free trial credits** when you first sign up, with no card required
- **A card payment** from Settings, under Payment Methods
- **A coupon code**, redeemed on the same page

Credits are spent as your deployments run. Console converts them to the network's ACT token behind the scenes, so nothing you do involves buying or holding crypto.

## Available and reserved

Your billing page splits the account balance in two.

**Reserved** is what your running deployments are holding to stay online. Each one keeps roughly two days of its own cost in reserve, so a deployment that costs $1/day reserves about $2. Reserved credits are not gone — they are committed. Whatever a deployment does not spend comes back to available when it closes.

**Available** is everything else: what you can spend on a new deployment right now.

The billing page also shows how long your whole balance will last at your current spend rate, and which deployments the reserved amount is split across.

## Automatic funding

Console funds every deployment for you.

A new deployment is funded the moment it is created, so it can take a lease immediately rather than waiting for a background job. From then on, Console tops it up to keep it ahead of its own burn rate for as long as your account has credits. You do not enable this, and there is no per-deployment setting to get wrong.

Automatic funding also leaves some of your available balance untouched, so topping up a running deployment can never eat the headroom you need to start a new one.

**Note:** The exact figures Console funds against — the runway it targets, the headroom it leaves, the amount a deployment starts with — are platform constants, and API callers can read the current values from `GET /v1/deployment-funding-config`.

## Auto Top-Up

Automatic funding moves credits from your balance to your deployments. Auto Top-Up is the layer above it: charging your card so that balance never hits zero. It is off until you turn it on from the billing page, and it needs a default payment method.

There are two modes:

- **Fixed threshold** charges a set amount as soon as your available balance drops to a limit you pick. This is the recommended mode.
- **Predicted spend** charges whatever it takes to cover the next week of your current deployments, checked once a day.

## Runtime limits

By default a deployment runs until you close it or your credits run out. You can instead give it a runtime limit when you create it, and Console will close it once it reaches that limit and return the unused credits to your balance.

A limit is not a lock. You can extend it, or lift it entirely and go back to always-on funding, from the deployment's settings. Console emails you before a runtime-limited deployment reaches its limit.

## When credits run low

Console emails you before your credits run out, so you have time to add more. If you have Auto Top-Up on, your card is charged instead and you get no warning email, because there is nothing to act on.

If the balance does reach zero, automatic funding has nothing left to top up with. Your running deployments spend down what they already hold and then close. Adding credits before that point keeps them alive with no further action from you: funding picks them up on its next pass.

## Closing a deployment

Closing a deployment stops its services and returns whatever it had not yet spent to your account balance. Settlement happens on-chain, so the credited amount can take a short while to appear.

## Related Resources

- [Console Onboarding Guide](/docs/getting-started/console-onboarding) — deploy your first app
- [Quick Start](/docs/getting-started/quick-start) — deploy with free trial credits
- [Managed Wallet API](/docs/api-documentation/console-api/getting-started) — the same funding model, from the API
- [Choosing Your Console](/docs/getting-started/choosing-your-console) — managed Console vs. self-custody Console Air
- [Deployments and Escrow](/docs/learn/core-concepts/deployments) — how funding works at the blockchain level
