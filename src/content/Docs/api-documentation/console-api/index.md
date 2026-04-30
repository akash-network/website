---
categories: ["API Documentation", "Console API"]
tags: ["Console", "API", "Managed Wallet", "REST API"]
weight: 3
title: "Managed Wallet API"
linkTitle: "Managed Wallet API"
description: "Deploy on Akash programmatically without managing wallets or private keys"
---

**Deploy on Akash programmatically using the Console Managed Wallet API.**

The Managed Wallet API is part of the **Console API**: it lets you create and manage deployments with Console-managed wallets (no private keys). For querying the blockchain directly, use [Node API Layer](/docs/node-operators/architecture/api-layer)—the Console API is not an Akash node.

---

## Features

- **No wallet management** - Console manages the wallet for you
- **REST API** - Standard HTTP endpoints
- **API Key authentication** - Secure, simple authentication
- **Pay with credit card** - No need to buy and hold AKT

---

## Documentation

- **[Getting Started](/docs/api-documentation/console-api/getting-started)** - Complete guide with examples and best practices
- **[API Reference](/docs/api-documentation/console-api/api-reference)** - Endpoint documentation with schemas
- **[Quickstart](/docs/api-documentation/console-api/quickstart)** - End-to-end deployment in five API calls

---

## Changelog

| Date | Version | Change |
|---|---|---|
| 2024-01-01 | v2 | Added `/v2/deployment-settings` with auto top-up support |
| 2023-xx-xx | v1 | Initial release of `/v1/deployments`, bids, leases |

[Full GitHub releases](https://github.com/akash-network/console/releases)

---

## Need Help?

- **Discord:** [discord.akash.network](https://discord.akash.network) - #developers channel
- **GitHub Issues:** [console/issues](https://github.com/akash-network/console/issues)
