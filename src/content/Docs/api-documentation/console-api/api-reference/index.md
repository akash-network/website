---
categories: ["API Documentation", "Console API"]
tags: ["Console", "API", "Reference", "REST API", "Endpoints"]
weight: 2
title: "API Reference"
linkTitle: "API Reference"
description: "Complete API reference for Console Managed Wallet API endpoints"
---

Complete reference for all Console Managed Wallet API endpoints.

Base URL: `https://console-api.akash.network`

---

## Authentication

Every request must include the `x-api-key` header. Create and manage keys in [Console](https://console.akash.network) under Settings → API Keys.

```http
GET /v1/deployments HTTP/1.1
Host: console-api.akash.network
x-api-key: YOUR_API_KEY
```

Authentication errors return `401 Unauthorized`:

```json
{ "error": "Unauthorized", "message": "Invalid API key" }
```

---

## Response envelope

Every JSON response is wrapped in a top-level `data` field, for example:

```json
{ "data": { "...": "..." } }
```

For list endpoints, `data` contains both the array and a `pagination` object. All examples below show the full response body.

---

## Errors

The API uses standard HTTP status codes. All error responses share the same JSON shape.

| HTTP Status | Code string         | Description                                                                     |
| ----------- | ------------------- | ------------------------------------------------------------------------------- |
| 400         | BadRequest          | The request body or query parameters are invalid. Check `message` for details.  |
| 401         | Unauthorized        | `x-api-key` is missing, expired, or invalid.                                    |
| 404         | NotFound            | The resource (`dseq`) does not exist or is not owned by the authenticated user. |
| 429         | TooManyRequests     | Request rate exceeded. Wait before retrying.                                    |
| 500         | InternalServerError | Unexpected server error. Retry with exponential backoff.                        |

Error response schema:

```json
{ "error": "string", "message": "string" }
```

---

## API Versioning

Endpoints are prefixed with a version number (`/v1/` or `/v2/`). Versions are independent. Upgrading one endpoint version does not affect others.

| Version | Status | Endpoints                          |
| ------- | ------ | ---------------------------------- |
| v1      | Stable | Deployments, bids, leases, deposit |
| v2      | Stable | Deployment settings (auto top-up)  |

Future breaking changes are introduced as a new version prefix, and prior versions remain available for a deprecation period announced in the changelog ([https://github.com/akash-network/console/releases](https://github.com/akash-network/console/releases)).

---

## Pagination

`GET /v1/deployments` uses offset-based pagination via `skip` and `limit`.

| Parameter | Type    | Default | Minimum | Description                        |
| --------- | ------- | ------- | ------- | ---------------------------------- |
| skip      | integer | 0       | 0       | Number of records to skip (offset) |
| limit     | integer | 1000    | 1       | Maximum records to return per page |

The response includes a `pagination` object with `total`, `skip`, `limit`, and `hasMore` so you can drive a paging loop without guessing when to stop:

```javascript
async function* getAllDeployments() {
  let skip = 0;
  const limit = 100;
  while (true) {
    const res = await fetch(
      `https://console-api.akash.network/v1/deployments?skip=${skip}&limit=${limit}`,
      { headers: { "x-api-key": process.env.AKASH_API_KEY } },
    );
    const { data } = await res.json();
    yield* data.deployments;
    if (!data.pagination.hasMore) break;
    skip += limit;
  }
}
```

---

## POST /v1/deployments

Create a new deployment from an SDL manifest and fund its escrow.

| Field        | Location | Type   | Required | Description                                                |
| ------------ | -------- | ------ | -------- | ---------------------------------------------------------- |
| x-api-key    | header   | string | yes      | Your API key                                               |
| data.sdl     | body     | string | yes      | Deployment manifest in SDL (YAML) format, as a JSON string |
| data.deposit | body     | number | yes      | Initial escrow deposit in USD. Minimum `0.5`               |

```bash
curl -X POST https://console-api.akash.network/v1/deployments \
  -H "x-api-key: $AKASH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "data": { "sdl": "version: \"2.0\"\n...", "deposit": 0.5 } }'
```

```javascript
const res = await fetch("https://console-api.akash.network/v1/deployments", {
  method: "POST",
  headers: {
    "x-api-key": process.env.AKASH_API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ data: { sdl: sdlString, deposit: 0.5 } }),
});
const { data } = await res.json();
```

Response `201 Created`:

| Field                       | Type   | Description                                           |
| --------------------------- | ------ | ----------------------------------------------------- |
| data.dseq                   | string | Deployment sequence ID                                |
| data.manifest               | string | Rendered manifest blob to send with `POST /v1/leases` |
| data.signTx.code            | number | Cosmos tx code (0 = success)                          |
| data.signTx.transactionHash | string | Broadcast transaction hash                            |
| data.signTx.rawLog          | string | Raw chain log                                         |

```json
{
  "data": {
    "dseq": "1234567",
    "manifest": "...",
    "signTx": { "code": 0, "transactionHash": "ABCDEF...", "rawLog": "[...]" }
  }
}
```

---

## GET /v1/bids

List provider bids for a deployment. Poll until bids arrive.

| Field     | Location | Type   | Required | Description                                          |
| --------- | -------- | ------ | -------- | ---------------------------------------------------- |
| x-api-key | header   | string | yes      | Your API key                                         |
| dseq      | query    | string | yes      | Deployment sequence ID returned by create deployment |

```bash
curl "https://console-api.akash.network/v1/bids?dseq=1234567" \
  -H "x-api-key: $AKASH_API_KEY"
```

```javascript
const res = await fetch(
  `https://console-api.akash.network/v1/bids?dseq=${dseq}`,
  {
    headers: { "x-api-key": process.env.AKASH_API_KEY },
  },
);
const { data: bids } = await res.json();
```

Response `200 OK` (returns `{ "data": [] }` while bids are pending):

| Field                      | Type   | Description                                      |
| -------------------------- | ------ | ------------------------------------------------ |
| data[].bid.id.owner        | string | Owner address                                    |
| data[].bid.id.dseq         | string | Deployment sequence ID                           |
| data[].bid.id.gseq         | number | Group sequence                                   |
| data[].bid.id.oseq         | number | Order sequence                                   |
| data[].bid.id.provider     | string | Provider address                                 |
| data[].bid.id.bseq         | number | Bid sequence (chain height)                      |
| data[].bid.state           | string | Bid state (e.g. `open`)                          |
| data[].bid.price.denom     | string | Chain denom (e.g. `uact`)                        |
| data[].bid.price.amount    | string | Chain amount in micro-units, per block           |
| data[].bid.created_at      | string | Chain height at creation                         |
| data[].bid.resources_offer | array  | Offered CPU / memory / storage / GPU / endpoints |
| data[].escrow_account      | object | Provider's bid escrow account                    |

```json
{
  "data": [
    {
      "bid": {
        "id": {
          "owner": "akash1...",
          "dseq": "1234567",
          "gseq": 1,
          "oseq": 1,
          "provider": "akash1...",
          "bseq": 92
        },
        "state": "open",
        "price": { "denom": "uact", "amount": "10000" },
        "created_at": "92",
        "resources_offer": [{ "resources": { "...": "..." }, "count": 1 }]
      },
      "escrow_account": { "...": "..." }
    }
  ]
}
```

> Note: there is no flat `bid.id` string — the bid is identified by the composite `{owner, dseq, gseq, oseq, provider, bseq}`. When creating a lease, copy `dseq`, `gseq`, `oseq`, and `provider` from this object.

---

## POST /v1/leases

Accept one or more provider bids and ship the manifest in a single call.

| Field             | Location | Type   | Required | Description                                      |
| ----------------- | -------- | ------ | -------- | ------------------------------------------------ |
| x-api-key         | header   | string | yes      | Your API key                                     |
| manifest          | body     | string | yes      | Manifest blob returned by `POST /v1/deployments` |
| leases            | body     | array  | yes      | One entry per bid to accept                      |
| leases[].dseq     | body     | string | yes      | Deployment sequence ID                           |
| leases[].gseq     | body     | number | yes      | Group sequence (from `bid.id.gseq`)              |
| leases[].oseq     | body     | number | yes      | Order sequence (from `bid.id.oseq`)              |
| leases[].provider | body     | string | yes      | Provider address (from `bid.id.provider`)        |

```bash
curl -X POST https://console-api.akash.network/v1/leases \
  -H "x-api-key: $AKASH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "manifest": "<MANIFEST>",
    "leases": [
      { "dseq": "1234567", "gseq": 1, "oseq": 1, "provider": "akash1provider..." }
    ]
  }'
```

```javascript
const res = await fetch("https://console-api.akash.network/v1/leases", {
  method: "POST",
  headers: {
    "x-api-key": process.env.AKASH_API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    manifest,
    leases: [
      {
        dseq: chosen.dseq,
        gseq: chosen.gseq,
        oseq: chosen.oseq,
        provider: chosen.provider,
      },
    ],
  }),
});
const { data } = await res.json();
```

Response `200 OK` is the same shape as `GET /v1/deployments/{dseq}` — see below.

---

## POST /v1/deposit-deployment

Add USD funds to a deployment's escrow to extend its runtime.

| Field        | Location | Type   | Required | Description                          |
| ------------ | -------- | ------ | -------- | ------------------------------------ |
| x-api-key    | header   | string | yes      | Your API key                         |
| data.dseq    | body     | string | yes      | Deployment sequence ID               |
| data.deposit | body     | number | yes      | Deposit amount in USD. Minimum `0.5` |

```bash
curl -X POST https://console-api.akash.network/v1/deposit-deployment \
  -H "x-api-key: $AKASH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "data": { "dseq": "1234567", "deposit": 0.5 } }'
```

```javascript
const res = await fetch(
  "https://console-api.akash.network/v1/deposit-deployment",
  {
    method: "POST",
    headers: {
      "x-api-key": process.env.AKASH_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data: { dseq, deposit: 0.5 } }),
  },
);
const { data } = await res.json();
```

Response `200 OK`: full deployment object after the top-up; see `GET /v1/deployments/{dseq}` below. The new escrow balance is in `data.escrow_account.state.funds[].amount` (raw chain micro-units).

---

## GET /v1/deployments

List all deployments for the authenticated user, with pagination.

| Field     | Location | Type    | Required | Description                 |
| --------- | -------- | ------- | -------- | --------------------------- |
| x-api-key | header   | string  | yes      | Your API key                |
| skip      | query    | integer | no       | Offset. Default `0`         |
| limit     | query    | integer | no       | Max records. Default `1000` |

```bash
curl "https://console-api.akash.network/v1/deployments?skip=0&limit=10" \
  -H "x-api-key: $AKASH_API_KEY"
```

```javascript
const res = await fetch(
  "https://console-api.akash.network/v1/deployments?skip=0&limit=10",
  {
    headers: { "x-api-key": process.env.AKASH_API_KEY },
  },
);
const { data } = await res.json();
```

Response `200 OK`:

| Field                   | Type    | Description                                                                                   |
| ----------------------- | ------- | --------------------------------------------------------------------------------------------- |
| data.deployments[]      | array   | One entry per deployment, same shape as `GET /v1/deployments/{dseq}` minus per-lease `status` |
| data.pagination.total   | number  | Total deployments for the user                                                                |
| data.pagination.skip    | number  | Skip value used                                                                               |
| data.pagination.limit   | number  | Limit value used                                                                              |
| data.pagination.hasMore | boolean | True when more pages are available                                                            |

```json
{
  "data": {
    "deployments": [
      {
        "deployment": { "...": "..." },
        "leases": [],
        "escrow_account": { "...": "..." }
      }
    ],
    "pagination": { "total": 23, "skip": 0, "limit": 10, "hasMore": true }
  }
}
```

---

## GET /v1/deployments/{dseq}

Retrieve full details for a single deployment by its sequence ID.

| Field     | Location | Type   | Required | Description            |
| --------- | -------- | ------ | -------- | ---------------------- |
| x-api-key | header   | string | yes      | Your API key           |
| dseq      | path     | string | yes      | Deployment sequence ID |

```bash
curl "https://console-api.akash.network/v1/deployments/1234567" \
  -H "x-api-key: $AKASH_API_KEY"
```

```javascript
const res = await fetch(
  `https://console-api.akash.network/v1/deployments/${dseq}`,
  {
    headers: { "x-api-key": process.env.AKASH_API_KEY },
  },
);
const { data } = await res.json();
```

Response `200 OK`:

| Field                      | Type   | Description                                                                                |
| -------------------------- | ------ | ------------------------------------------------------------------------------------------ |
| data.deployment.id.owner   | string | Owner address                                                                              |
| data.deployment.id.dseq    | string | Deployment sequence ID                                                                     |
| data.deployment.state      | string | Deployment state (`active`, `closed`)                                                      |
| data.deployment.hash       | string | Manifest hash                                                                              |
| data.deployment.created_at | string | Chain height at creation                                                                   |
| data.leases[]              | array  | Active leases (composite id + `state`, `price`, `created_at`, `closed_on`, `status`)       |
| data.escrow_account        | object | Deployment escrow account with `funds[]`, `deposits[]`, `transferred[]` (raw chain denoms) |

```json
{
  "data": {
    "deployment": {
      "id": { "owner": "akash1ownerxxx...", "dseq": "1234567" },
      "state": "active",
      "hash": "...",
      "created_at": "92"
    },
    "leases": [
      {
        "id": {
          "owner": "akash1ownerxxx...",
          "dseq": "1234567",
          "gseq": 1,
          "oseq": 1,
          "provider": "akash1providerxxx...",
          "bseq": 92
        },
        "state": "active",
        "price": { "denom": "uact", "amount": "10000" },
        "created_at": "92",
        "closed_on": "",
        "status": { "forwarded_ports": {}, "ips": {}, "services": {} }
      }
    ],
    "escrow_account": {
      "id": { "scope": "deployment", "xid": "..." },
      "state": {
        "owner": "akash1ownerxxx...",
        "state": "open",
        "transferred": [],
        "settled_at": "92",
        "funds": [{ "denom": "uact", "amount": "5500000" }],
        "deposits": []
      }
    }
  }
}
```

---

## PUT /v1/deployments/{dseq}

Update an active deployment with a revised SDL.

| Field     | Location | Type   | Required | Description                                         |
| --------- | -------- | ------ | -------- | --------------------------------------------------- |
| x-api-key | header   | string | yes      | Your API key                                        |
| dseq      | path     | string | yes      | Deployment sequence ID                              |
| data.sdl  | body     | string | yes      | Updated SDL in YAML format, passed as a JSON string |

```bash
curl -X PUT "https://console-api.akash.network/v1/deployments/1234567" \
  -H "x-api-key: $AKASH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "data": { "sdl": "version: \"2.0\"\n..." } }'
```

```javascript
const res = await fetch(
  `https://console-api.akash.network/v1/deployments/${dseq}`,
  {
    method: "PUT",
    headers: {
      "x-api-key": process.env.AKASH_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data: { sdl: updatedSdl } }),
  },
);
const { data } = await res.json();
```

Response `200 OK`: full deployment object — same shape as `GET /v1/deployments/{dseq}`.

---

## DELETE /v1/deployments/{dseq}

Close a deployment. Remaining escrow is returned asynchronously by the chain to your Console balance.

| Field     | Location | Type   | Required | Description                     |
| --------- | -------- | ------ | -------- | ------------------------------- |
| x-api-key | header   | string | yes      | Your API key                    |
| dseq      | path     | string | yes      | Deployment sequence ID to close |

```bash
curl -X DELETE "https://console-api.akash.network/v1/deployments/1234567" \
  -H "x-api-key: $AKASH_API_KEY"
```

```javascript
const res = await fetch(
  `https://console-api.akash.network/v1/deployments/${dseq}`,
  {
    method: "DELETE",
    headers: { "x-api-key": process.env.AKASH_API_KEY },
  },
);
const { data } = await res.json();
```

Response `200 OK`:

```json
{ "data": { "success": true } }
```

---

## GET /v2/deployment-settings/{dseq}

Get auto top-up settings for a specific deployment. Settings are auto-created on first read.

| Field     | Location | Type   | Required | Description                    |
| --------- | -------- | ------ | -------- | ------------------------------ |
| x-api-key | header   | string | yes      | Your API key                   |
| dseq      | path     | string | yes      | Deployment sequence number     |
| userId    | query    | string | no       | Defaults to authenticated user |

```bash
curl "https://console-api.akash.network/v2/deployment-settings/1234567" \
  -H "x-api-key: $AKASH_API_KEY"
```

```javascript
const res = await fetch(
  `https://console-api.akash.network/v2/deployment-settings/${dseq}`,
  {
    headers: { "x-api-key": process.env.AKASH_API_KEY },
  },
);
const { data } = await res.json();
```

Response `200 OK`:

| Field                     | Type          | Description                             |
| ------------------------- | ------------- | --------------------------------------- |
| data.id                   | string (uuid) | Setting record id                       |
| data.userId               | string        | Owning user id                          |
| data.dseq                 | string        | Deployment sequence number              |
| data.autoTopUpEnabled     | boolean       | Whether auto top-up is enabled          |
| data.estimatedTopUpAmount | number        | Estimated top-up amount per cycle (USD) |
| data.topUpFrequencyMs     | number        | Top-up cadence in milliseconds          |
| data.createdAt            | string        | ISO-8601 creation time                  |
| data.updatedAt            | string        | ISO-8601 last update time               |

```json
{
  "data": {
    "id": "00000000-0000-0000-0000-000000000000",
    "userId": "00000000-0000-0000-0000-000000000000",
    "dseq": "1234567",
    "autoTopUpEnabled": true,
    "estimatedTopUpAmount": 5,
    "topUpFrequencyMs": 86400000,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

## POST /v2/deployment-settings

Create deployment settings (typically used to enable auto top-up when the settings row does not yet exist).

| Field                 | Location | Type          | Required | Description                        |
| --------------------- | -------- | ------------- | -------- | ---------------------------------- |
| x-api-key             | header   | string        | yes      | Your API key                       |
| data.dseq             | body     | string        | yes      | Deployment sequence number         |
| data.autoTopUpEnabled | body     | boolean       | yes      | Enable or disable automatic top-up |
| data.userId           | body     | string (uuid) | no       | Defaults to authenticated user     |

```bash
curl -X POST https://console-api.akash.network/v2/deployment-settings \
  -H "x-api-key: $AKASH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "data": { "dseq": "1234567", "autoTopUpEnabled": true } }'
```

```javascript
const res = await fetch(
  "https://console-api.akash.network/v2/deployment-settings",
  {
    method: "POST",
    headers: {
      "x-api-key": process.env.AKASH_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data: { dseq, autoTopUpEnabled: true } }),
  },
);
const { data } = await res.json();
```

Response `201 Created`: same shape as `GET /v2/deployment-settings/{dseq}`.

---

## PATCH /v2/deployment-settings/{dseq}

Update an existing settings row.

| Field                 | Location | Type          | Required | Description                        |
| --------------------- | -------- | ------------- | -------- | ---------------------------------- |
| x-api-key             | header   | string        | yes      | Your API key                       |
| dseq                  | path     | string        | yes      | Deployment sequence number         |
| userId                | query    | string (uuid) | no       | Defaults to authenticated user     |
| data.autoTopUpEnabled | body     | boolean       | yes      | Enable or disable automatic top-up |

```bash
curl -X PATCH https://console-api.akash.network/v2/deployment-settings/1234567 \
  -H "x-api-key: $AKASH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "data": { "autoTopUpEnabled": false } }'
```

```javascript
const res = await fetch(
  `https://console-api.akash.network/v2/deployment-settings/${dseq}`,
  {
    method: "PATCH",
    headers: {
      "x-api-key": process.env.AKASH_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data: { autoTopUpEnabled: false } }),
  },
);
const { data } = await res.json();
```

Response `200 OK`: same shape as `GET /v2/deployment-settings/{dseq}`.

---

## See Also

- **[Getting Started](/docs/api-documentation/console-api/getting-started)** - Full workflow with examples
- **[Quickstart](/docs/api-documentation/console-api/quickstart)** - End-to-end deployment in five API calls
- **[SDL Reference](/docs/developers/deployment/akash-sdl)** - SDL syntax and options
- **[Console](https://console.akash.network)** - Visual interface for managing deployments
- **[GitHub: akash-network/console](https://github.com/akash-network/console)** - Source and issues
