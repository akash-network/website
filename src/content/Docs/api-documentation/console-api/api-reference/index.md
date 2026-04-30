---
categories: ["API Documentation", "Console API"]
tags: ["Console", "API", "Reference", "REST API", "Endpoints"]
weight: 2
title: "API Reference"
linkTitle: "API Reference"
description: "Complete API reference for Console Managed Wallet API endpoints"
---

Complete reference for all Console API endpoints.

---

## Authentication

Every request must include the `x-api-key` header. Create and manage keys in [Console](https://console.akash.network) from your profile menu -> API Keys.

Example HTTP request:

```http
GET /v1/deployments HTTP/1.1
Host: console-api.akash.network
x-api-key: YOUR_API_KEY
```

Authentication errors return `401 Unauthorized`:

```json
{ "error": "Unauthorized", "message": "Missing or invalid API key" }
```

---

## Errors

The API uses standard HTTP status codes. All error responses share the same JSON shape.

| HTTP Status | Code string | Description |
|---|---|---|
| 400 | BadRequest | The request body or query parameters are invalid. Check `message` for details. |
| 401 | Unauthorized | `x-api-key` is missing, expired, or invalid. |
| 404 | NotFound | The resource (`dseq`) does not exist or is not owned by the authenticated user. |
| 409 | Conflict | Action conflicts with current resource state (for example, lease already exists). |
| 429 | TooManyRequests | Request rate exceeded. Wait before retrying. |
| 500 | InternalServerError | Unexpected server error. Retry with exponential backoff. |

Error response schema:

```json
{
  "error": "string",
  "message": "string"
}
```

---

## API Versioning

Endpoints are prefixed with a version number (`/v1/` or `/v2/`). Versions are independent. Upgrading one endpoint version does not affect others.

| Version | Status | Endpoints |
|---|---|---|
| v1 | Stable | Deployments, bids, leases, deposit |
| v2 | Stable | Deployment settings |

Path-level versioning means you can adopt `/v2/deployment-settings` without changing existing `/v1/deployments` calls. Future breaking changes are introduced as a new version prefix, and prior versions remain available for a deprecation period announced in the changelog ([https://github.com/akash-network/console/releases](https://github.com/akash-network/console/releases)).

---

## Pagination

`GET /v1/deployments` uses offset-based pagination via `skip` and `limit`.

| Parameter | Type | Default | Maximum | Description |
|---|---|---|---|---|
| skip | integer | 0 | - | Number of records to skip (offset) |
| limit | integer | 10 | 100 | Maximum records to return per page |

Fetching all deployments (JavaScript generator):

```javascript
async function* getAllDeployments() {
  let skip = 0;
  const limit = 100;
  while (true) {
    const res = await fetch(
      `https://console-api.akash.network/v1/deployments?skip=${skip}&limit=${limit}`,
      { headers: { "x-api-key": process.env.AKASH_API_KEY } }
    );
    const page = await res.json();
    yield* page;
    if (page.length < limit) break;
    skip += limit;
  }
}
```

---
## POST /v1/deployments

Create a new deployment from an SDL manifest and fund its escrow.

| Field | Location | Type | Required | Description |
|---|---|---|---|---|
| x-api-key | header | string | yes | Your API key |
| sdl | body | string | yes | Deployment manifest in SDL (YAML) format, as a JSON string |
| deposit | body | string | no | Initial escrow deposit in USD, for example `"5.00"` |

```bash
curl -X POST https://console-api.akash.network/v1/deployments \
  -H "x-api-key: $AKASH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"sdl": "version: \"2.0\"\n..."}'
```

```javascript
const res = await fetch("https://console-api.akash.network/v1/deployments", {
  method: "POST",
  headers: {
    "x-api-key": process.env.AKASH_API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ sdl: sdlString }),
});
const { dseq } = await res.json();
```

| Field | Type | Description |
|---|---|---|
| dseq | string | Deployment sequence ID |
| status | string | Deployment status |
| createdAt | string | ISO-8601 creation time |

```json
{ "dseq": "1234567", "status": "active", "createdAt": "2024-01-15T10:30:00Z" }
```

---

## GET /v1/bids

List provider bids for a deployment. Poll until bids arrive.

| Field | Location | Type | Required | Description |
|---|---|---|---|---|
| x-api-key | header | string | yes | Your API key |
| dseq | query | string | yes | Deployment sequence ID returned by create deployment |

```bash
curl "https://console-api.akash.network/v1/bids?dseq=1234567" \
  -H "x-api-key: $AKASH_API_KEY"
```

```javascript
const res = await fetch(`https://console-api.akash.network/v1/bids?dseq=${dseq}`, {
  headers: { "x-api-key": process.env.AKASH_API_KEY },
});
const bids = await res.json();
```

| Field | Type | Description |
|---|---|---|
| id | string | Bid ID |
| provider | string | Provider address |
| price | string | Bid price amount |
| denom | string | Price denomination |
| status | string | Bid status |

```json
[
  { "id": "bid_abc123", "provider": "akash1abc...xyz", "price": "0.50", "denom": "usd", "status": "open" }
]
```

> Note: This endpoint returns `[]` while bids are pending.

---

## POST /v1/leases

Accept a provider bid and activate the deployment lease.

| Field | Location | Type | Required | Description |
|---|---|---|---|---|
| x-api-key | header | string | yes | Your API key |
| dseq | body | string | yes | Deployment sequence ID |
| bidId | body | string | yes | Bid ID from `GET /v1/bids` |

```bash
curl -X POST https://console-api.akash.network/v1/leases \
  -H "x-api-key: $AKASH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"dseq": "1234567", "bidId": "bid_abc123"}'
```

```javascript
const res = await fetch("https://console-api.akash.network/v1/leases", {
  method: "POST",
  headers: {
    "x-api-key": process.env.AKASH_API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ dseq, bidId }),
});
const lease = await res.json();
```

| Field | Type | Description |
|---|---|---|
| leaseId | string | Lease ID |
| dseq | string | Deployment sequence ID |
| provider | string | Selected provider |
| status | string | Lease status |

```json
{ "leaseId": "lease_xyz789", "dseq": "1234567", "provider": "akash1abc...xyz", "status": "active" }
```

---

## POST /v1/deposit-deployment

Add funds to a deployment's escrow to extend its runtime.

| Field | Location | Type | Required | Description |
|---|---|---|---|---|
| x-api-key | header | string | yes | Your API key |
| dseq | body | string | yes | Deployment sequence ID |
| amount | body | string | yes | Deposit amount in USD, for example `"10.00"` |

```bash
curl -X POST https://console-api.akash.network/v1/deposit-deployment \
  -H "x-api-key: $AKASH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"dseq": "1234567", "amount": "10.00"}'
```

```javascript
const res = await fetch("https://console-api.akash.network/v1/deposit-deployment", {
  method: "POST",
  headers: {
    "x-api-key": process.env.AKASH_API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ dseq, amount: "10.00" }),
});
const data = await res.json();
```

| Field | Type | Description |
|---|---|---|
| dseq | string | Deployment sequence ID |
| depositedAmount | string | Amount deposited |
| newBalance | string | New escrow balance |

```json
{ "dseq": "1234567", "depositedAmount": "10.00", "newBalance": "14.73" }
```

---

## GET /v1/deployments

List all deployments for the authenticated user, with pagination.

| Field | Location | Type | Required | Description |
|---|---|---|---|---|
| x-api-key | header | string | yes | Your API key |
| skip | query | integer | no | Offset. Default `0` |
| limit | query | integer | no | Max records. Default `10`, max `100` |

```bash
curl "https://console-api.akash.network/v1/deployments?skip=0&limit=10" \
  -H "x-api-key: $AKASH_API_KEY"
```

```javascript
const res = await fetch("https://console-api.akash.network/v1/deployments?skip=0&limit=10", {
  headers: { "x-api-key": process.env.AKASH_API_KEY },
});
const deployments = await res.json();
```

| Field | Type | Description |
|---|---|---|
| dseq | string | Deployment sequence ID |
| status | string | Deployment status |
| createdAt | string | ISO-8601 creation time |
| balance | string | Current escrow balance in USD |

```json
[
  { "dseq": "1234567", "status": "active", "createdAt": "2024-01-15T10:30:00Z", "balance": "9.23" },
  { "dseq": "1234568", "status": "closed", "createdAt": "2024-01-10T08:00:00Z", "balance": "0.00" }
]
```

---

## GET /v1/deployments/{dseq}

Retrieve full details for a single deployment by its sequence ID.

| Field | Location | Type | Required | Description |
|---|---|---|---|---|
| x-api-key | header | string | yes | Your API key |
| dseq | path | string | yes | Deployment sequence ID |

```bash
curl "https://console-api.akash.network/v1/deployments/1234567" \
  -H "x-api-key: $AKASH_API_KEY"
```

```javascript
const res = await fetch(`https://console-api.akash.network/v1/deployments/${dseq}`, {
  headers: { "x-api-key": process.env.AKASH_API_KEY },
});
const deployment = await res.json();
```

| Field | Type | Description |
|---|---|---|
| dseq | string | Deployment sequence ID |
| status | string | Deployment status |
| sdl | string | SDL used for deployment |
| provider | string | Provider address |
| balance | string | Current balance |
| leaseId | string | Active lease ID |

```json
{
  "dseq": "1234567",
  "status": "active",
  "sdl": "version: \"2.0\"...",
  "provider": "akash1abc...xyz",
  "balance": "9.23",
  "createdAt": "2024-01-15T10:30:00Z",
  "leaseId": "lease_xyz789"
}
```

---

## PUT /v1/deployments/{dseq}

Update an active deployment with a revised SDL.

| Field | Location | Type | Required | Description |
|---|---|---|---|---|
| x-api-key | header | string | yes | Your API key |
| dseq | path | string | yes | Deployment sequence ID |
| sdl | body | string | yes | Updated SDL in YAML format, passed as a JSON string |

```bash
curl -X PUT "https://console-api.akash.network/v1/deployments/1234567" \
  -H "x-api-key: $AKASH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"sdl": "version: \"2.0\"\n..."}'
```

```javascript
const res = await fetch(`https://console-api.akash.network/v1/deployments/${dseq}`, {
  method: "PUT",
  headers: {
    "x-api-key": process.env.AKASH_API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ sdl: updatedSdl }),
});
const updated = await res.json();
```

| Field | Type | Description |
|---|---|---|
| dseq | string | Deployment sequence ID |
| status | string | Deployment status |
| updatedAt | string | ISO-8601 update time |

```json
{ "dseq": "1234567", "status": "active", "updatedAt": "2024-01-16T09:00:00Z" }
```

---

## DELETE /v1/deployments/{dseq}

Close a deployment and return remaining escrow funds to your account.

| Field | Location | Type | Required | Description |
|---|---|---|---|---|
| x-api-key | header | string | yes | Your API key |
| dseq | path | string | yes | Deployment sequence ID to close |

```bash
curl -X DELETE "https://console-api.akash.network/v1/deployments/1234567" \
  -H "x-api-key: $AKASH_API_KEY"
```

```javascript
const res = await fetch(`https://console-api.akash.network/v1/deployments/${dseq}`, {
  method: "DELETE",
  headers: { "x-api-key": process.env.AKASH_API_KEY },
});
const closed = await res.json();
```

| Field | Type | Description |
|---|---|---|
| dseq | string | Deployment sequence ID |
| status | string | Deployment status |
| refundedAmount | string | Refunded escrow amount |
| closedAt | string | ISO-8601 close time |

```json
{ "dseq": "1234567", "status": "closed", "refundedAmount": "4.50", "closedAt": "2024-01-16T12:00:00Z" }
```

---

## GET /v2/deployment-settings/{dseq}

Get auto top-up and other settings for a specific deployment.

| Field | Location | Type | Required | Description |
|---|---|---|---|---|
| x-api-key | header | string | yes | Your API key |
| dseq | path | string | yes | Deployment sequence number |
| userId | query | string | no | Defaults to authenticated user |

```bash
curl "https://console-api.akash.network/v2/deployment-settings/1234567" \
  -H "x-api-key: $AKASH_API_KEY"
```

```javascript
const res = await fetch(`https://console-api.akash.network/v2/deployment-settings/${dseq}`, {
  headers: { "x-api-key": process.env.AKASH_API_KEY },
});
const settings = await res.json();
```

| Field | Type | Description |
|---|---|---|
| dseq | string | Deployment sequence number |
| autoTopUp | boolean | Auto top-up enabled state |
| topUpThreshold | string | Threshold in USD |
| topUpAmount | string | Top-up amount in USD |

```json
{ "dseq": "1234567", "autoTopUp": true, "topUpThreshold": "2.00", "topUpAmount": "5.00" }
```

---

## POST /v2/deployment-settings

Create or update auto top-up settings for a deployment.

| Field | Location | Type | Required | Description |
|---|---|---|---|---|
| x-api-key | header | string | yes | Your API key |
| dseq | body | string | yes | Deployment sequence number |
| autoTopUp | body | boolean | yes | Enable or disable automatic top-up |
| topUpThreshold | body | string | conditional | Required when `autoTopUp` is `true` |
| topUpAmount | body | string | conditional | Required when `autoTopUp` is `true` |

```bash
curl -X POST https://console-api.akash.network/v2/deployment-settings \
  -H "x-api-key: $AKASH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "dseq": "1234567",
    "autoTopUp": true,
    "topUpThreshold": "2.00",
    "topUpAmount": "5.00"
  }'
```

```javascript
const res = await fetch("https://console-api.akash.network/v2/deployment-settings", {
  method: "POST",
  headers: {
    "x-api-key": process.env.AKASH_API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    dseq,
    autoTopUp: true,
    topUpThreshold: "2.00",
    topUpAmount: "5.00",
  }),
});
const created = await res.json();
```

| Field | Type | Description |
|---|---|---|
| dseq | string | Deployment sequence number |
| autoTopUp | boolean | Auto top-up state |
| topUpThreshold | string | Threshold in USD |
| topUpAmount | string | Top-up amount in USD |
| createdAt | string | ISO-8601 creation time |

```json
{
  "dseq": "1234567",
  "autoTopUp": true,
  "topUpThreshold": "2.00",
  "topUpAmount": "5.00",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

---

## See Also

- **[Getting Started](/docs/api-documentation/console-api/getting-started)** - Full workflow with examples
- **[SDL Reference](https://docs.akash.network/docs/getting-started/stack-definition-language/)** - SDL syntax and options
- **[Akash CLI](https://docs.akash.network/docs/deployments/akash-cli/installation/)** - Wallet-based deployments
- **[Console](https://console.akash.network)** - Visual interface for managing deployments
- **[GitHub: akash-network/console](https://github.com/akash-network/console)** - Source and issues
