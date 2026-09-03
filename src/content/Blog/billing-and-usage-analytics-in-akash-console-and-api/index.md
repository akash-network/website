---
title: "Billing & Usage Analytics in Akash Console & API"
description: "Billing & Usage: credit card purchase history and analytics for Akash."

pubDate: "2025-08-17"
draft: false

categories:
  - Product
tags:
  - Product
  - Akash Console
  - billing
  - usage analytics
  - credit card
  - AEP-68
  - spend tracking
  - cloud cost management
  - receipts
  - deployment cost
contributors:
  - Anil Murty

bannerImage: ./banner.png
---

> **TL;DR:** Akash Console now shows credit card users full billing transparency: credit purchase history with downloadable receipts, usage charts by week/month/year, and cumulative spend tracking — similar to AWS billing pages, accessible under Account Settings.


As more Akash users pay for compute with credit cards, they expect the same billing transparency they get from traditional cloud providers and SaaS services. [AEP‑68](/roadmap/aep-68/) noted that while crypto wallet users can see token transfers on a block explorer, credit‑card users have no such tracking and often ask for billing information. Users also want to see how much of their funds are being used and for what, similar to AWS billing pages.

The new **Billing & Usage** feature introduces a new page in Account Settings that surfaces this information.

![Billing & Usage](billing-usage-1.png)

The two tabs display the following information:

- **Credit Purchase History**: A table lists all transactions where credits were added to the user’s balance. Each entry shows the date, amount, payment method, status and provides links to download a copy of the receipt. There is also an option to export all transactions as a csv file for easy record keeping or ingesting into internal systems. A date range picker allows users to filter to a specific time range.

![Billing & Usage](billing-usage-2.png)

- **Usage Charts:** In the “Usage” tab users can see a summary of their total spend and total deployments and charts showing usage over time as well as cumulative spending over time. Here too, users can switch between weekly, monthly or annual views or select a custom date range.

![Billing & Usage](billing-usage-3.png)

Together, these elements give credit‑card users the insight they need to manage their budgets. Users can download receipts, see when credits were added and understand how their compute spend evolves over time.

For technical support or any questions about the Billing & Usage, please head over to the [Akash Discord](https://discord.akash.network/) server, where technical members of the Akash community are available around the clock and ready to assist.

## Frequently Asked Questions

**Where do I find billing information in Akash Console?**
Under Account Settings → Billing & Usage — shows two tabs: Credit Purchase History and Usage Charts with filters for weekly, monthly, annual, or custom date ranges.

**Can I download receipts for my Akash purchases?**
Yes — the Credit Purchase History tab includes links to download individual receipts, plus a CSV export option for all transactions for accounting and record-keeping.

**What does the Usage Charts tab show?**
Total spend summary, total deployments, spend-over-time charts, and cumulative spending over time — with weekly, monthly, annual, or custom date range views.

**Is billing tracking available for crypto wallet users?**
Crypto wallet users can track token transfers on a block explorer like Mintscan. The new Billing & Usage dashboard is specifically for credit card users who don't have that visibility.

**What is AEP-68?**
The Akash Enhancement Proposal that identified the need for billing transparency for credit card users — noting that while crypto users see token transfers on-chain, credit card users had no equivalent visibility.

**Can I export my usage data?**
Yes — the Credit Purchase History tab includes a CSV export for all transactions, making it easy to ingest spend data into internal accounting or analytics systems.

**Where can I get support for billing questions?**
Join the Akash Discord at discord.akash.network — technical community members are available 24/7 to assist with billing, usage, and account management questions.

