---
categories: ["API Documentation"]
tags: ["SDK", "API", "REST API", "Integration", "Documentation"]
weight: 1
title: "API Documentation"
linkTitle: "Getting Started"
description: "Integrate Akash Network into your applications with SDKs and APIs"
---

**Programmatic access to Akash Network: query the chain directly, use indexed data and managed wallets, or integrate with the chain SDK.**

Choose the right API for your use case:

- **Blockchain REST/RPC** — Query data from the chain directly (gRPC, REST, RPC on an Akash node). Use this when your app needs to read chain state or submit transactions to the blockchain.
- **Console API** — Query indexed data (stats, deployments, providers) and manage deployments for Console managed wallets. This is **not** a node: it serves aggregated/indexed data and managed-wallet flows, not raw chain queries.
- **Chain SDK** — Integrate with Akash in Go or TypeScript/JavaScript. Use your own wallet (AKT/USDC) or custodial flows.

---

## Blockchain REST/RPC (query the chain directly)

Query blockchain state and submit transactions via an Akash node. Use this when you need to read chain data (balances, deployments, validators, etc.) or broadcast transactions — not when you only need indexed stats or managed-wallet deployments.

- **[Node API Layer](/docs/node-operators/architecture/api-layer)** — gRPC, REST (gRPC-Gateway), and CometBFT RPC on an Akash node
- Run your own node or use a public RPC endpoint to query the chain directly

## Akash Blockchain SDK

Build deployment and provider management into your app with the official chain SDK (Go and TypeScript/JavaScript). Integrate with the blockchain using your own wallet or custodial wallets; pay with AKT or USDC.

- **[Akash SDK](/docs/api-documentation/sdk)** - Official Go and JavaScript/TypeScript SDKs
- **[Installation Guide](/docs/api-documentation/sdk/installation)** - Get started with SDK installation
- **[Quick Start](/docs/api-documentation/sdk/quick-start)** - Deploy your first application programmatically
- **[API Reference](/docs/api-documentation/sdk/api-reference)** - Complete SDK documentation
- **[Examples](/docs/api-documentation/sdk/examples)** - Code examples for common tasks

## Console API (indexed data & managed wallets)

The Console API serves **indexed data** (providers, stats, deployments) and **managed wallet** deployment flows. It is **not** an Akash node — do not use it to query chain state or broadcast transactions. Use it for dashboards, provider/GPU discovery, and credit-card deployments via Console.

**Indexed data (read-only, no auth):**

- **[Console API — Network Data](/docs/api-documentation/rest-api)** - Public endpoints for providers, GPU availability, and network statistics (indexed data; base URL: `console-api.akash.network`)
- **[Providers API](/docs/api-documentation/rest-api/providers-api)** - List and query provider details, hardware specs, and availability
- **[GPU Availability Guide](/docs/api-documentation/rest-api/gpu-availability-guide)** - Find GPU resources across the network

**Managed wallets (API key required):**

- **[Managed Wallet API](/docs/api-documentation/console-api)** - Create and manage deployments with Console-managed wallets; pay with credit card. No wallet or private key management.

---

## Use Cases

### When to use Blockchain REST/RPC (node)
- Your app needs to query chain state (balances, deployments, validators, etc.) directly
- You need to broadcast transactions to the chain
- You are building tooling that talks to an Akash node (gRPC, REST, or RPC)

### When to use the Akash Blockchain SDK
- Full blockchain integration with your own wallet
- Pay with AKT or USDC cryptocurrency
- Build deployment automation tools
- Create custom deployment workflows
- Build provider management dashboards
- Develop monitoring and analytics tools

### When to use Console API (managed wallets)
- Accept credit card payments for deployments
- Deploy without managing wallets or crypto
- Build SaaS platforms that need simple payments
- Create user-friendly deployment interfaces
- Offer Akash deployments to non-crypto users

### When to use Console API (indexed network data)
- Query provider availability, hardware specs, and GPU models (indexed data)
- Build network dashboards and analytics tools
- Monitor provider uptime and capacity
- Find GPU resources for your workloads
- No authentication or payment setup needed (public read-only endpoints)

---

## Getting Started

**Choose your integration method:**

- **Query the chain directly (node)?** → [Node API Layer](/docs/node-operators/architecture/api-layer) - gRPC, REST, RPC on an Akash node
- **Blockchain integration in code?** → [Use the Blockchain SDK](/docs/api-documentation/sdk) - Pay with AKT/USDC, manage your own wallet
- **Credit card deployments?** → [Managed Wallet API](/docs/api-documentation/console-api) - No wallet needed, pay with credit card via Console
- **Indexed network data (providers, GPU, stats)?** → [Console API — Network Data](/docs/api-documentation/rest-api) - Public endpoints, not a node

**Need help?**

- Ask questions in [Discord](https://discord.akash.network) #developers
- Contribute on [GitHub](https://github.com/akash-network)

---

## Related Resources

- **[Deployment Methods](/docs/developers/deployment)** - Console, CLI, and AuthZ for end users
- **[SDL Reference](/docs/developers/deployment/akash-sdl)** - Stack Definition Language
- **[Provider Operations](/docs/providers/operations)** - Running a provider
- **[Contributing](/docs/developers/contributing)** - Contribute to Akash codebase

---

**Questions?** Join [Discord](https://discord.akash.network) #developers channel!
