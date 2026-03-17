---
categories: ["API Documentation", "REST API"]
tags: ["REST API", "GPU", "Providers", "Guide"]
weight: 2
title: "GPU Availability Guide"
linkTitle: "GPU Availability"
description: "How to find and filter GPU resources across Akash Network providers"
---

GPU availability data is embedded in provider responses — there is no standalone GPU endpoint. This guide shows how to query providers and filter for specific GPU resources using the [Providers API](/docs/api-documentation/rest-api/providers-api).

Base URL: `https://console-api.akash.network`

---

## Finding GPU Providers

### Step 1: Fetch All Providers

```bash
curl https://console-api.akash.network/v1/providers
```

Each provider in the response includes a `gpuModels` array:

```json
{
  "owner": "akash1u5cdg7k3gl43mukca4aeultuz8x2j68mgwn28e",
  "isOnline": true,
  "gpuModels": [
    {
      "vendor": "nvidia",
      "model": "rtx4060ti",
      "ram": "16Gi",
      "interface": "PCIe"
    }
  ],
  "stats": {
    "gpu": { "active": 0, "available": 1, "pending": 0, "total": 1 }
  }
}
```

### Step 2: Filter for Online Providers with GPUs

```javascript
const response = await fetch("https://console-api.akash.network/v1/providers");
const providers = await response.json();

const gpuProviders = providers.filter(
  (p) => p.isOnline && p.gpuModels.length > 0
);
```

### Step 3: Filter by GPU Vendor

```javascript
const nvidiaProviders = gpuProviders.filter((p) =>
  p.gpuModels.some((gpu) => gpu.vendor === "nvidia")
);
```

### Step 4: Filter by Specific GPU Model

```javascript
const t4Providers = gpuProviders.filter((p) =>
  p.gpuModels.some((gpu) => gpu.model === "t4")
);
```

### Step 5: Filter by GPU Memory

```javascript
const highMemProviders = gpuProviders.filter((p) =>
  p.gpuModels.some((gpu) => gpu.ram === "80Gi")
);
```

---

## Checking GPU Availability

The `stats.gpu` field on each provider shows real-time GPU capacity:

| Field | Description |
|-------|-------------|
| `stats.gpu.total` | Total GPU units on the provider |
| `stats.gpu.active` | Currently leased GPUs |
| `stats.gpu.available` | GPUs available for new deployments |
| `stats.gpu.pending` | GPUs in pending state |

Filter for providers with available GPUs:

```javascript
const availableGpuProviders = gpuProviders.filter(
  (p) => p.stats.gpu.available > 0
);
```

---

## Complete Example

This script finds all online providers with available NVIDIA GPUs and prints their details:

```javascript
async function findAvailableGpuProviders(vendor, model) {
  const response = await fetch("https://console-api.akash.network/v1/providers");
  const providers = await response.json();

  return providers
    .filter((p) => {
      if (!p.isOnline || p.gpuModels.length === 0) return false;
      if (p.stats.gpu.available === 0) return false;

      return p.gpuModels.some((gpu) => {
        const vendorMatch = !vendor || gpu.vendor === vendor;
        const modelMatch = !model || gpu.model === model;
        return vendorMatch && modelMatch;
      });
    })
    .map((p) => ({
      owner: p.owner,
      hostUri: p.hostUri,
      gpuModels: p.gpuModels,
      availableGpus: p.stats.gpu.available,
      totalGpus: p.stats.gpu.total,
    }));
}

// Find all providers with available NVIDIA GPUs
const providers = await findAvailableGpuProviders("nvidia");
console.log(`Found ${providers.length} providers with available NVIDIA GPUs:`);
providers.forEach((p) => {
  console.log(`  ${p.owner} — ${p.availableGpus}/${p.totalGpus} GPUs available`);
  p.gpuModels.forEach((gpu) => {
    console.log(`    ${gpu.vendor} ${gpu.model} (${gpu.ram}, ${gpu.interface})`);
  });
});

// Find providers with available T4 GPUs specifically
const t4Providers = await findAvailableGpuProviders("nvidia", "t4");
console.log(`\nFound ${t4Providers.length} providers with available T4 GPUs`);
```

---

## GPU Model Fields Reference

Each entry in the `gpuModels` array contains:

| Field | Type | Description | Examples |
|-------|------|-------------|----------|
| `vendor` | string | GPU manufacturer | `"nvidia"` |
| `model` | string | GPU model identifier | `"rtx4060ti"`, `"t4"`, `"a100"`, `"h100"` |
| `ram` | string | GPU memory | `"16Gi"`, `"40Gi"`, `"80Gi"` |
| `interface` | string | Connection interface | `"PCIe"`, `"SXM"` |

---

**See also:** [Providers API Reference](/docs/api-documentation/rest-api/providers-api) for the complete provider response schema.
