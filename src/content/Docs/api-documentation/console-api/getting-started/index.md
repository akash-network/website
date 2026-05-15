---
categories: ["API Documentation", "Console API"]
tags: ["Console", "API", "Managed Wallet", "REST API", "Getting Started"]
weight: 1
title: "Getting Started with Managed Wallet API"
linkTitle: "Getting Started"
description: "Get started deploying on Akash with the Console Managed Wallet API"
---

Deploy on Akash programmatically using the Console API with a managed wallet.

Note: The Console API is actively developed. See the changelog ([https://github.com/akash-network/console/releases](https://github.com/akash-network/console/releases)) for upcoming breaking changes.

---

## Getting Started

### Create an API Key

1. Visit [console.akash.network](https://console.akash.network)
2. Sign in with your account
3. Navigate to **Settings** → **API Keys**
4. Click **"Create API Key"**
5. Copy and save your API key securely

> Warning: API keys grant full access to your Console account. Keep them secret.

### Authentication

All requests must include the `x-api-key` header. Pass your API key directly in this header.

cURL example:

```bash
curl https://console-api.akash.network/v1/deployments \
  -H "x-api-key: YOUR_API_KEY"
```

If the key is missing or invalid, the API returns `401 Unauthorized`:

```json
{ "error": "Unauthorized", "message": "Invalid API key" }
```

Security practices:

- Store the key in an environment variable (`AKASH_API_KEY`), never in source code.
- Rotate keys in Console under Settings → API Keys to keep your workflows safe in case of key compromise.
- Keys grant full access to your Console account, so treat them like passwords.

### Response envelope

Every JSON response from the Console API is wrapped in a top-level `data` field, for example:

```json
{ "data": { "dseq": "1234567", "manifest": "...", "signTx": { ... } } }
```

All examples in this guide show the full response body — extract the value you need from `response.data`.

### Money fields

The Managed Wallet bills your Console account in **USD** (credit card). The `deposit` field on `POST /v1/deployments` and `POST /v1/deposit-deployment` is a number in dollars. The minimum accepted value is `0.5` ($0.50); pass a larger value to top up by more.

The blockchain itself works in raw on-chain denoms (`uact`, `uusdc`, …). Wherever you see `price.denom` / `price.amount` in a bid response or an `escrow_account.state.funds` entry, those are raw chain values in micro-units (1 ACT = 1 000 000 uact). The SDL `pricing` block also uses chain denoms — the managed wallet handles the USD ↔ chain conversion for you.

---

## Complete Deployment Workflow

### 1. Create Deployment

POST your SDL plus an initial USD `deposit` to create a deployment. The API returns a `dseq` (deployment sequence number) that identifies the deployment in all subsequent calls. The response also returns the broadcast transaction hash for the on-chain `MsgCreateDeployment`.

cURL:

```bash
curl -X POST https://console-api.akash.network/v1/deployments \
  -H "x-api-key: $AKASH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "sdl": "<YOUR_SDL_YAML_AS_STRING>",
      "deposit": 0.5
    }
  }'
```

JavaScript (fetch):

```javascript
const res = await fetch("https://console-api.akash.network/v1/deployments", {
  method: "POST",
  headers: {
    "x-api-key": process.env.AKASH_API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ data: { sdl: YOUR_SDL_STRING, deposit: 0.5 } }),
});
const { data } = await res.json();
const dseq = data.dseq;
```

Response (`201 Created`):

```json
{
  "data": {
    "dseq": "1234567",
    "manifest": "<computed manifest hash + manifest blob>",
    "signTx": {
      "code": 0,
      "transactionHash": "ABCDEF...",
      "rawLog": "[...]"
    }
  }
}
```

---

### 2. Wait for and Fetch Bids

List bids for your deployment. Bids typically arrive within 30–60 seconds. The response is wrapped in `data` and each bid is identified by a **composite id** (`owner`/`dseq`/`gseq`/`oseq`/`provider`/`bseq`), not a single opaque string.

cURL:

```bash
curl "https://console-api.akash.network/v1/bids?dseq=1234567" \
  -H "x-api-key: $AKASH_API_KEY"
```

JavaScript (fetch):

```javascript
const res = await fetch(
  `https://console-api.akash.network/v1/bids?dseq=${dseq}`,
  { headers: { "x-api-key": process.env.AKASH_API_KEY } },
);
const { data: bids } = await res.json();
```

Response:

```json
{
  "data": [
    {
      "bid": {
        "id": {
          "owner": "akash1ownerxxx...",
          "dseq": "1234567",
          "gseq": 1,
          "oseq": 1,
          "provider": "akash1providerxxx...",
          "bseq": 92
        },
        "state": "open",
        "price": { "denom": "uact", "amount": "10000" },
        "created_at": "92",
        "resources_offer": [
          {
            "resources": {
              "cpu": { "units": { "val": "500" } },
              "memory": { "quantity": { "val": "536870912" } },
              "storage": [],
              "endpoints": []
            },
            "count": 1
          }
        ]
      },
      "escrow_account": {
        "id": { "scope": "bid", "xid": "..." },
        "state": {
          "owner": "akash1providerxxx...",
          "state": "open",
          "transferred": [],
          "settled_at": "...",
          "funds": [],
          "deposits": []
        }
      }
    }
  ]
}
```

Polling example:

```javascript
async function waitForBids(dseq, { pollMs = 3000, maxAttempts = 20 } = {}) {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(
      `https://console-api.akash.network/v1/bids?dseq=${dseq}`,
      { headers: { "x-api-key": process.env.AKASH_API_KEY } },
    );
    const { data } = await res.json();
    if (data.length > 0) return data;
    await new Promise((r) => setTimeout(r, pollMs));
  }
  throw new Error("No bids received within timeout");
}
```

---

### 3. Create Lease

Accept one or more bids to activate the deployment lease(s) and send the manifest to the chosen provider(s) in a single call.

Pick the bid(s) you want, then build the `leases[]` array from the bid id (omitting `owner` and `bseq`). The `manifest` field is the rendered manifest produced by the SDL — you can re-use the manifest hash returned by `POST /v1/deployments` if you cached it.

cURL:

```bash
curl -X POST https://console-api.akash.network/v1/leases \
  -H "x-api-key: $AKASH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "manifest": "<MANIFEST_FROM_CREATE_DEPLOYMENT>",
    "leases": [
      { "dseq": "1234567", "gseq": 1, "oseq": 1, "provider": "akash1providerxxx..." }
    ]
  }'
```

JavaScript (fetch):

```javascript
const chosen = bids[0].bid.id;
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

Response (`200 OK`) is the same shape as `GET /v1/deployments/{dseq}` — the full deployment object including its now-active lease(s):

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
        "status": null
      }
    ],
    "escrow_account": {
      "id": { "scope": "deployment", "xid": "..." },
      "state": {
        "owner": "akash1ownerxxx...",
        "state": "open",
        "transferred": [],
        "settled_at": "...",
        "funds": [{ "denom": "uact", "amount": "5500000" }],
        "deposits": []
      }
    }
  }
}
```

---

### 4. Add Deposit to Deployment

Add USD funds to extend deployment runtime.

cURL:

```bash
curl -X POST https://console-api.akash.network/v1/deposit-deployment \
  -H "x-api-key: $AKASH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "data": { "dseq": "1234567", "deposit": 0.5 } }'
```

JavaScript (fetch):

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

Response (`200 OK`): the full deployment object after the top-up; the new balance is visible under `data.escrow_account.state.funds[].amount` (raw chain micro-units).

```json
{
  "data": {
    "deployment": { "...": "..." },
    "leases": [],
    "escrow_account": { "...": "..." }
  }
}
```

---

### 5. Close Deployment

Close a deployment and recover remaining escrow funds.

cURL:

```bash
curl -X DELETE "https://console-api.akash.network/v1/deployments/1234567" \
  -H "x-api-key: $AKASH_API_KEY"
```

JavaScript (fetch):

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

Response (`200 OK`):

```json
{ "data": { "success": true } }
```

Any unspent escrow is returned to your Console balance asynchronously by the chain — call `GET /v1/deployments/{dseq}` afterward to inspect the final state, or check the [Console](https://console.akash.network) UI for the credited amount.

---

## Complete Example Script

This example runs the full managed-wallet deployment flow in one script.

```javascript
const API_BASE_URL = "https://console-api.akash.network";
const API_KEY = process.env.AKASH_API_KEY;

if (!API_KEY) {
  throw new Error("Set AKASH_API_KEY before running this script.");
}

const SDL = `version: "2.0"
services:
  web:
    image: nginx:stable
    expose:
      - port: 80
        as: 80
        to:
          - global: true
profiles:
  compute:
    web:
      resources:
        cpu:
          units: 0.5
        memory:
          size: 512Mi
        storage:
          - size: 512Mi
  placement:
    dcloud:
      pricing:
        web:
          denom: uact
          amount: 10000
deployment:
  web:
    dcloud:
      profile: web
      count: 1`;

async function apiRequest(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "x-api-key": API_KEY,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`HTTP ${res.status}: ${body}`);
  }
  return res.json();
}

async function waitForBids(dseq, { pollMs = 3000, maxAttempts = 20 } = {}) {
  for (let i = 0; i < maxAttempts; i++) {
    const { data } = await apiRequest(`/v1/bids?dseq=${dseq}`);
    if (data.length > 0) return data;
    await new Promise((resolve) => setTimeout(resolve, pollMs));
  }
  throw new Error("No bids received within timeout");
}

async function main() {
  const create = await apiRequest("/v1/deployments", {
    method: "POST",
    body: JSON.stringify({ data: { sdl: SDL, deposit: 0.5 } }),
  });
  const { dseq, manifest } = create.data;

  const bids = await waitForBids(dseq);
  const chosenId = bids[0].bid.id;

  await apiRequest("/v1/leases", {
    method: "POST",
    body: JSON.stringify({
      manifest,
      leases: [
        {
          dseq: chosenId.dseq,
          gseq: chosenId.gseq,
          oseq: chosenId.oseq,
          provider: chosenId.provider,
        },
      ],
    }),
  });

  await apiRequest("/v1/deposit-deployment", {
    method: "POST",
    body: JSON.stringify({ data: { dseq, deposit: 0.5 } }),
  });

  const status = await apiRequest(`/v1/deployments/${dseq}`);
  console.log("Deployment status:", status);

  const closed = await apiRequest(`/v1/deployments/${dseq}`, {
    method: "DELETE",
  });
  console.log("Closed deployment:", closed);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

---

## Best Practices

### Security

- **Never commit API keys** to version control
- **Use environment variables** for API keys
- **Rotate keys regularly** as a security best practice
- **Restrict key permissions** if possible

```typescript
// Good: use environment variables
const API_KEY = process.env.AKASH_API_KEY;

// Bad: hardcoded key
const API_KEY = "ac.sk.mainnet.xxx...";
```

### Error Handling

Use HTTP status codes to determine recovery behavior.

| Status                    | Meaning            | Common cause                                           |
| ------------------------- | ------------------ | ------------------------------------------------------ |
| 200 OK                    | Request succeeded  | -                                                      |
| 201 Created               | Resource created   | `POST /v1/deployments`, `POST /v2/deployment-settings` |
| 400 Bad Request           | Invalid input      | Malformed SDL, missing required field                  |
| 401 Unauthorized          | Auth failed        | Missing or invalid `x-api-key`                         |
| 404 Not Found             | Resource not found | `dseq` does not exist or belongs to another user       |
| 429 Rate Limited          | Rate limited       | Polling interval too fast or burst of requests         |
| 500 Internal Server Error | Server error       | Retry with exponential backoff                         |

Error response shape:

```json
{
  "error": "BadRequest",
  "message": "SDL validation failed: missing 'profiles' section"
}
```

### Polling for Bids

Poll every 3 seconds for 30–60 seconds, then back off or return a timeout error.

---

## Managed Wallet vs SDK

| Feature               | Managed Wallet API | Akash SDK                  |
| --------------------- | ------------------ | -------------------------- |
| **Wallet Management** | Managed by Console | You manage wallet          |
| **Authentication**    | API Key            | Private key/mnemonic       |
| **Payment**           | Credit card (USD)  | Crypto (AKT)               |
| **API Type**          | REST API           | Native blockchain          |
| **Language**          | Any (HTTP)         | Go, TypeScript             |
| **Setup**             | API key only       | Wallet + blockchain setup  |
| **Best For**          | SaaS, web apps     | Blockchain apps, CLI tools |

## Limitations

- Payment method: Credit card only. Existing wallets cannot be linked to a Managed Wallet account at this time.
- Wallet access: Console manages the wallet. You cannot export private keys or sign arbitrary transactions.
- API stability: Pin integrations to `v1` or `v2`. Versions are independent, and breaking changes are announced in the changelog ([https://github.com/akash-network/console/releases](https://github.com/akash-network/console/releases)).
- For production workloads without managed wallet constraints: use the [Akash SDK](/docs/api-documentation/sdk) or CLI with your own wallet.

---

## Resources

- **[API Reference](/docs/api-documentation/console-api/api-reference)** - Complete endpoint documentation
- **[Quickstart](/docs/api-documentation/console-api/quickstart)** - End-to-end deployment in five API calls
- **[SDL Reference](/docs/developers/deployment/akash-sdl)** - SDL syntax guide
- **[Console Documentation](/docs/developers/deployment/akash-console)** - Console overview

---

## Need Help?

- **Discord:** [discord.akash.network](https://discord.akash.network)
- **GitHub Issues:** [console/issues](https://github.com/akash-network/console/issues)
- **Support:** [GitHub Support](https://github.com/akash-network/support/issues)
