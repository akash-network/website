---
categories: ["API Documentation", "Console API"]
tags: ["Console", "API", "Managed Wallet", "REST API"]
weight: 3
title: "Managed Wallet API"
linkTitle: "Managed Wallet API"
description: "Deploy on Akash programmatically without managing wallets or private keys"
---

Deploy on Akash programmatically using the Console API. It lets you create and manage deployments with Console-managed wallets, so you do not have to manage private keys.

Base URL: `https://console-api.akash.network`

Authentication: pass your API key in every request with `x-api-key: YOUR_API_KEY`.

---

## Features

- Create and manage deployments via plain HTTP with no blockchain client or SDK required.
- Receive bids from providers and accept them by creating a lease in a single API call.
- Fund deployments with a credit card; no AKT wallet or crypto exchange needed.
- Authenticate with a single API key scoped to your Console account.
- Monitor deployments with list, get, and settings endpoints.

---

## How it works

1. Create a deployment: POST your SDL (deployment manifest) to `/v1/deployments`.
2. Accept a bid: wait around 30 seconds, GET bids from `/v1/bids?dseq=...`, then POST to `/v1/leases` to accept one.
3. Manage and fund: add deposits, update the SDL, or DELETE to close the deployment and recover remaining funds.

---

## Documentation

- **[Getting Started](/docs/api-documentation/console-api/getting-started)** - Complete guide with examples and best practices
- **[API Reference](/docs/api-documentation/console-api/api-reference)** - Endpoint documentation with schemas

---

## Need Help?

- **Discord:** [discord.akash.network](https://discord.akash.network)
- **GitHub Issues:** [https://github.com/akash-network/console/issues](https://github.com/akash-network/console/issues)
