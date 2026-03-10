---
categories: ["API Documentation", "REST API"]
tags: ["REST API", "Providers", "API Reference", "Endpoints"]
weight: 1
title: "Providers API Reference"
linkTitle: "Providers API"
description: "API reference for querying Akash Network provider details, hardware specs, and availability"
---

Base URL: `https://console-api.akash.network`

---

## GET /v1/providers

Returns a list of all providers on the Akash Network.

### Parameters

| Parameter | In    | Type   | Required | Default | Description                     |
|-----------|-------|--------|----------|---------|---------------------------------|
| `scope`   | query | string | No       | `"all"` | Filter: `"all"` or `"trial"`   |

### Example Request

```bash
curl https://console-api.akash.network/v1/providers
```

### Response

Returns a JSON array of provider objects.

### Provider Object

| Field | Type | Description |
|-------|------|-------------|
| `owner` | string | Provider's Akash address |
| `name` | string \| null | Provider display name |
| `hostUri` | string | Provider host URI |
| `createdHeight` | number | Block height at provider creation |
| `email` | string \| null | Contact email |
| `website` | string \| null | Provider website |
| `lastCheckDate` | string | ISO 8601 timestamp of last health check |
| `isOnline` | boolean | Whether the provider is currently online |
| `isAudited` | boolean | Whether the provider has been audited |
| `isValidVersion` | boolean | Whether the provider runs a valid software version |
| `cosmosSdkVersion` | string \| null | Cosmos SDK version |
| `akashVersion` | string \| null | Akash software version |
| `uptime1d` | number | Uptime ratio over the last 24 hours (0-1) |
| `uptime7d` | number | Uptime ratio over the last 7 days (0-1) |
| `uptime30d` | number | Uptime ratio over the last 30 days (0-1) |

#### Location Fields

| Field | Type | Description |
|-------|------|-------------|
| `ipRegion` | string \| null | IP-based region |
| `ipRegionCode` | string \| null | Region code |
| `ipCountry` | string \| null | IP-based country |
| `ipCountryCode` | string \| null | Country code |
| `ipLat` | string \| null | Latitude |
| `ipLon` | string \| null | Longitude |
| `country` | string \| null | Declared country |
| `city` | string \| null | Declared city |
| `timezone` | string \| null | Timezone |

#### Hardware Fields

| Field | Type | Description |
|-------|------|-------------|
| `hardwareCpu` | string \| null | CPU model |
| `hardwareCpuArch` | string \| null | CPU architecture (e.g., `"x86_64"`) |
| `hardwareGpuVendor` | string \| null | GPU vendor (e.g., `"nvidia"`) |
| `hardwareGpuModels` | array | GPU model names |
| `hardwareMemory` | string \| null | Total memory |
| `hardwareDisk` | array | Disk types |

#### GPU Models

| Field | Type | Description |
|-------|------|-------------|
| `gpuModels` | array | Array of GPU model objects |
| `gpuModels[].vendor` | string | GPU vendor (e.g., `"nvidia"`) |
| `gpuModels[].model` | string | GPU model (e.g., `"rtx4060ti"`, `"t4"`) |
| `gpuModels[].ram` | string | GPU memory (e.g., `"16Gi"`) |
| `gpuModels[].interface` | string | Interface type (e.g., `"PCIe"`) |

#### Network Fields

| Field | Type | Description |
|-------|------|-------------|
| `networkProvider` | string \| null | Network/hosting provider |
| `networkSpeedDown` | number | Download speed |
| `networkSpeedUp` | number | Upload speed |

#### Feature Flags

| Field | Type | Description |
|-------|------|-------------|
| `featPersistentStorage` | boolean | Supports persistent storage |
| `featPersistentStorageType` | array | Persistent storage types available |
| `featEndpointCustomDomain` | boolean | Supports custom domain endpoints |
| `featEndpointIp` | boolean | Supports dedicated IP endpoints |

#### Resource Stats

| Field | Type | Description |
|-------|------|-------------|
| `stats.cpu.active` | number | Active CPU units (millicores) |
| `stats.cpu.available` | number | Available CPU units |
| `stats.cpu.pending` | number | Pending CPU units |
| `stats.gpu.active` | number | Active GPU units |
| `stats.gpu.available` | number | Available GPU units |
| `stats.gpu.pending` | number | Pending GPU units |
| `stats.memory.active` | number | Active memory (bytes) |
| `stats.memory.available` | number | Available memory (bytes) |
| `stats.memory.pending` | number | Pending memory (bytes) |
| `stats.storage.ephemeral.active` | number | Active ephemeral storage (bytes) |
| `stats.storage.ephemeral.available` | number | Available ephemeral storage (bytes) |
| `stats.storage.persistent.active` | number | Active persistent storage (bytes) |
| `stats.storage.persistent.available` | number | Available persistent storage (bytes) |

#### Attributes

| Field | Type | Description |
|-------|------|-------------|
| `attributes` | array | Provider attribute key-value pairs |
| `attributes[].key` | string | Attribute key (e.g., `"datacenter"`, `"host"`) |
| `attributes[].value` | string | Attribute value |
| `attributes[].auditedBy` | array | Addresses that audited this attribute |

### Example Response

```json
[
  {
    "owner": "akash1u5cdg7k3gl43mukca4aeultuz8x2j68mgwn28e",
    "name": null,
    "hostUri": "https://provider.d3akash.cloud:8443",
    "createdHeight": 17519098,
    "email": null,
    "website": null,
    "lastCheckDate": "2026-02-20T18:05:04.000Z",
    "isOnline": true,
    "isAudited": false,
    "isValidVersion": true,
    "uptime1d": 1,
    "uptime7d": 0.98,
    "uptime30d": 0.95,
    "ipCountry": "US",
    "hardwareCpuArch": "x86_64",
    "hardwareGpuVendor": "nvidia",
    "hardwareGpuModels": ["rtx4060ti"],
    "gpuModels": [
      {
        "vendor": "nvidia",
        "model": "rtx4060ti",
        "ram": "16Gi",
        "interface": "PCIe"
      }
    ],
    "stats": {
      "cpu": { "active": 60450, "available": 12000, "pending": 0, "total": 72450 },
      "gpu": { "active": 0, "available": 1, "pending": 0, "total": 1 },
      "memory": { "active": 111154125824, "available": 25769803776, "pending": 0, "total": 136923929600 },
      "storage": {
        "ephemeral": { "active": 206537178112, "available": 100000000000, "pending": 0, "total": 306537178112 },
        "persistent": { "active": 0, "available": 0, "pending": 0, "total": 0 },
        "total": { "active": 206537178112, "available": 100000000000, "pending": 0, "total": 306537178112 }
      }
    },
    "featPersistentStorage": false,
    "featEndpointCustomDomain": false,
    "featEndpointIp": false,
    "networkSpeedDown": 0,
    "networkSpeedUp": 0,
    "attributes": [
      { "key": "host", "value": "akash", "auditedBy": [] }
    ]
  }
]
```

---

## GET /v1/providers/{address}

Returns detailed information about a specific provider.

### Parameters

| Parameter | In   | Type   | Required | Description |
|-----------|------|--------|----------|-------------|
| `address` | path | string | Yes      | Provider's Akash address (e.g., `akash1u5cdg7k3gl43mukca4aeultuz8x2j68mgwn28e`) |

### Example Request

```bash
curl https://console-api.akash.network/v1/providers/akash1u5cdg7k3gl43mukca4aeultuz8x2j68mgwn28e
```

### Response

Returns a single provider object with the same fields as above. Use this endpoint to get the most current resource availability via the `stats` fields.

### Example Response

```json
{
  "owner": "akash1u5cdg7k3gl43mukca4aeultuz8x2j68mgwn28e",
  "hostUri": "https://provider.d3akash.cloud:8443",
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
    "cpu": { "active": 60450, "available": 12000, "pending": 0, "total": 72450 },
    "gpu": { "active": 0, "available": 1, "pending": 0, "total": 1 },
    "memory": { "active": 111154125824, "available": 25769803776, "pending": 0, "total": 136923929600 },
    "storage": {
      "ephemeral": { "active": 206537178112, "available": 100000000000, "pending": 0, "total": 306537178112 },
      "persistent": { "active": 0, "available": 0, "pending": 0, "total": 0 },
      "total": { "active": 206537178112, "available": 100000000000, "pending": 0, "total": 306537178112 }
    }
  }
}
```

---

**See also:** [GPU Availability Guide](/docs/api-documentation/rest-api/gpu-availability-guide) for filtering providers by GPU model and checking availability.
