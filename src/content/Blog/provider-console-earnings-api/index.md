---
title: "Provider Console - Earnings API"
description: The new Provider Console Earnings API gives Akash providers powerful insights into their revenue, with secure access and easy integration for custom dashboards.

pubDate: "2025-08-18"
draft: false

categories:
  - Product
tags:
  - Product
  - Akash Provider Console
  - Earnings API
  - GPU provider
  - revenue tracking
  - AEP-69
  - datacenter
  - provider earnings
  - decentralized cloud
  - GPU rental income
contributors:
  - Anil Murty

bannerImage: ./banner.png
---

> **TL;DR:** The Akash Provider Console Earnings API (AEP-69) lets GPU providers query daily, weekly, and monthly revenue with from/to timestamps — integrating earnings data into dashboards, accounting systems, and financial reports without manual tracking.


Providers who manage their clusters with Akash Provider Console requested an API to be able to query earnings data for the infrastructure they list on Akash Network. [AEP‑69](/roadmap/aep-69/) spelled out these requirements, calling for daily, weekly and monthly revenue metrics and insight into net earnings after Akash’s take rate. It also highlighted the need for providers to integrate earnings data into internal tools for forecasting and reporting. The core team took that feedback and built the **Provider Console Earnings API (v1)**.

![](./1.png)

## Unlock revenue insights

The Earnings API gives providers a simple yet powerful way to query their income over any period. Specify **from** and **to** timestamps to get total earnings for a day, week or month. The backend aggregates revenue and checks it against blockchain records to ensure accuracy. You’ll know exactly what you earned and when.

![](./2.png)

## Secure API built for providers

Generate and revoke API keys directly from the [Provider Console API Key page](https://provider-console.akash.network/api-keys). Each key is scoped to provider‑specific actions, includes rate limiting and can be revoked at any time. Documentation and example queries are provided to help you integrate quickly.

![](./3.png)

## Build your own dashboards

AEP‑69 envisioned a world where providers could pull their earnings into internal dashboards and accounting systems. Our v1 API takes the first step towards that vision. Use it to automate payouts, create financial reports or display real‑time revenue on your monitoring screens. Future iterations will add utilisation metrics (such as GPU hours by model) and take‑rate calculations, further enhancing your insights.

Whether you’re a single GPU provider or a large data‑center operator, the Earnings API empowers you to understand your business and plan for growth.

If you are a datacenter operator, new to Akash Network and interested in becoming a provider, get started with [Akash Provider Console](https://provider-console.akash.network/)

For technical support or any questions about Akash Provider Console or the Provider Console API, please head over to the [Akash Discord](https://discord.akash.network/) server, where technical members of the Akash community are available around the clock and ready to assist.

## Frequently Asked Questions

**What is the Provider Console Earnings API?**
A REST API (v1) for Akash GPU providers to programmatically query earnings data — specifying from/to timestamps to get total revenue for any period with blockchain-verified accuracy.

**How do I get API access as a provider?**
Generate and manage API keys at provider-console.akash.network/api-keys — each key is scoped to provider-specific actions with rate limiting and can be revoked at any time.

**What metrics does the Earnings API return?**
Total earnings for a specified time range, verified against blockchain records. Future versions will add GPU utilization metrics (GPU hours by model) and take-rate breakdowns.

**What is AEP-69?**
The Akash Enhancement Proposal that identified provider demand for revenue metrics — daily, weekly, and monthly earnings data with net earnings after Akash's take rate for internal forecasting and reporting.

**Can I integrate earnings data into my own dashboards?**
Yes — the API is designed for exactly this use case: automate payouts, create financial reports, or display real-time revenue on monitoring screens within your existing infrastructure.

**Is the Earnings API available to small GPU providers?**
Yes — whether you're a single GPU homenode operator or a large datacenter, the Earnings API gives you the same programmatic revenue visibility.

**How do I become an Akash GPU provider?**
Get started at provider-console.akash.network — Akash Provider Console guides you through Kubernetes setup, resource configuration, pricing, and going live on the network.

