---
categories: ["API Documentation", "REST API"]
tags: ["REST API", "Providers", "GPU", "Public API", "Console API"]
weight: 4
title: "Console API — Network Data"
linkTitle: "Console API — Network Data"
description: "Public Console API endpoints for indexed network data: providers, GPU availability, and statistics (not a node)"
---

**Public, read-only Console API for indexed network data. No authentication required.**

This API serves **indexed data** (providers, GPU availability, network stats). It is **not** an Akash node — do not use it to query chain state or broadcast transactions. For querying the blockchain directly, use [Node API Layer (gRPC, REST, RPC)](/docs/node-operators/architecture/api-layer).

Base URL: `https://console-api.akash.network`

---

## Available Endpoints

### Providers

Query provider details, hardware specs, GPU models, and availability:

- **[Providers API Reference](/docs/api-documentation/rest-api/providers-api)** — `GET /v1/providers` and `GET /v1/providers/{address}`
- **[GPU Availability Guide](/docs/api-documentation/rest-api/gpu-availability-guide)** — Find and filter GPU resources across the network

---

## Quick Example

List all providers on the network:

```bash
curl https://console-api.akash.network/v1/providers
```

Get details for a specific provider:

```bash
curl https://console-api.akash.network/v1/providers/akash1u5cdg7k3gl43mukca4aeultuz8x2j68mgwn28e
```

---

## Key Features

- **Indexed data, not a node** — Aggregated network data from Console; for raw chain queries use [Node API Layer](/docs/node-operators/architecture/api-layer)
- **No authentication** — All endpoints are public and read-only
- **JSON responses** — Standard REST API returning JSON
- **Provider data** — Hardware specs, GPU models, uptime, location, and real-time capacity (indexed)
- **Network statistics** — Active/available/pending resources across the network

---

**Questions?** Join [Discord](https://discord.akash.network) #developers channel!
