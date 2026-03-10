---
categories: ["API Documentation", "REST API"]
tags: ["REST API", "Providers", "GPU", "Public API"]
weight: 4
title: "Akash REST API"
linkTitle: "Akash REST API"
description: "Public REST API endpoints for querying Akash Network data including providers and GPU availability"
---

**Public, read-only endpoints for querying Akash Network data. No authentication required.**

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

- **No authentication** — All endpoints are public and read-only
- **JSON responses** — Standard REST API returning JSON
- **Provider data** — Hardware specs, GPU models, uptime, location, and real-time capacity
- **Network statistics** — Active/available/pending resources across the network

---

**Questions?** Join [Discord](https://discord.akash.network) #developers channel!
