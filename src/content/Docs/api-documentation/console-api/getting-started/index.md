---
categories: ["API Documentation", "Console API"]
tags: ["Console", "API", "Managed Wallet", "REST API", "Getting Started"]
weight: 1
title: "Getting Started with Managed Wallet API"
linkTitle: "Getting Started"
description: "Get started deploying on Akash with the Console Managed Wallet API"
---

Deploy on Akash programmatically using the Console API with a managed wallet.

Note: The Console API is actively developed. Breaking changes are communicated in the changelog ([https://github.com/akash-network/console/releases](https://github.com/akash-network/console/releases)) before taking effect. Pin to the `v1` or `v2` path prefix to isolate your integration from unrelated changes.

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

All requests must include the `x-api-key` header. There is no Bearer token scheme. Pass the key directly as a header value.

cURL example:

```bash
curl https://console-api.akash.network/v1/deployments \
  -H "x-api-key: YOUR_API_KEY"
```

If the key is missing or invalid, the API returns `401 Unauthorized`:

```json
{ "error": "Unauthorized", "message": "Missing or invalid API key" }
```

Security practices:

- Store the key in an environment variable (`AKASH_API_KEY`), never in source code.
- Rotate keys in Console under Settings -> API Keys if a key is compromised.
- Keys grant full access to your Console account, so treat them like passwords.

---

## Complete Deployment Workflow

### 1. Create Deployment

POST your SDL to create a deployment. The API returns a `dseq` (deployment sequence number) that identifies the deployment in all subsequent calls.

cURL:

```bash
curl -X POST https://console-api.akash.network/v1/deployments \
  -H "x-api-key: $AKASH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"sdl": "<YOUR_SDL_YAML_AS_STRING>"}'
```

JavaScript (fetch):

```javascript
const res = await fetch("https://console-api.akash.network/v1/deployments", {
  method: "POST",
  headers: {
    "x-api-key": process.env.AKASH_API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ sdl: YOUR_SDL_STRING }),
});
const { dseq } = await res.json();
```

Response:

```json
{
  "dseq": "1234567",
  "status": "active",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

---

### 2. Wait for and Fetch Bids

List bids for your deployment. Bids typically arrive within 30-60 seconds.

cURL:

```bash
curl "https://console-api.akash.network/v1/bids?dseq=1234567" \
  -H "x-api-key: $AKASH_API_KEY"
```

JavaScript (fetch):

```javascript
const res = await fetch(
  `https://console-api.akash.network/v1/bids?dseq=${dseq}`,
  { headers: { "x-api-key": process.env.AKASH_API_KEY } }
);
const bids = await res.json();
```

Response:

```json
[
  {
    "id": "bid_abc123",
    "provider": "akash1abc...xyz",
    "price": "0.50",
    "denom": "usd",
    "status": "open"
  }
]
```

Polling example:

```javascript
async function waitForBids(dseq, { pollMs = 3000, maxAttempts = 20 } = {}) {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(
      `https://console-api.akash.network/v1/bids?dseq=${dseq}`,
      { headers: { "x-api-key": process.env.AKASH_API_KEY } }
    );
    const bids = await res.json();
    if (bids.length > 0) return bids;
    await new Promise((r) => setTimeout(r, pollMs));
  }
  throw new Error("No bids received within timeout");
}
```

---

### 3. Create Lease

Accept a bid to activate the deployment lease.

cURL:

```bash
curl -X POST https://console-api.akash.network/v1/leases \
  -H "x-api-key: $AKASH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"dseq": "1234567", "bidId": "bid_abc123"}'
```

JavaScript (fetch):

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

Response:

```json
{
  "leaseId": "lease_xyz789",
  "dseq": "1234567",
  "provider": "akash1abc...xyz",
  "status": "active"
}
```

---

### 4. Add Deposit to Deployment

Add funds to extend deployment runtime.

cURL:

```bash
curl -X POST https://console-api.akash.network/v1/deposit-deployment \
  -H "x-api-key: $AKASH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"dseq": "1234567", "amount": "10.00"}'
```

JavaScript (fetch):

```javascript
const res = await fetch("https://console-api.akash.network/v1/deposit-deployment", {
  method: "POST",
  headers: {
    "x-api-key": process.env.AKASH_API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ dseq, amount: "10.00" }),
});
const depositResult = await res.json();
```

Response:

```json
{
  "dseq": "1234567",
  "depositedAmount": "10.00",
  "newBalance": "14.73"
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
const res = await fetch(`https://console-api.akash.network/v1/deployments/${dseq}`, {
  method: "DELETE",
  headers: { "x-api-key": process.env.AKASH_API_KEY },
});
const closeResult = await res.json();
```

Response:

```json
{
  "dseq": "1234567",
  "status": "closed",
  "refundedAmount": "4.50",
  "closedAt": "2024-01-16T12:00:00Z"
}
```

---

## Best Practices

### Security

- **Never commit API keys** to version control
- **Use environment variables** for API keys
- **Rotate keys regularly** as a security best practice
- **Restrict key permissions** if possible

```typescript
// **Good: Use environment variables
const API_KEY = process.env.CONSOLE_API_KEY;

// **Bad: Hardcoded key
const API_KEY = "akt_abc123...";
```

### Error Handling

Use HTTP status codes to determine recovery behavior.

| Status | Meaning | Common cause |
|---|---|---|
| 200 OK | Request succeeded | - |
| 201 Created | Resource created | POST to `/v1/deployments`, `/v1/leases`, `/v2/deployment-settings` |
| 400 Bad Request | Invalid input | Malformed SDL, missing required field |
| 401 Unauthorized | Auth failed | Missing or invalid `x-api-key` |
| 404 Not Found | Resource not found | `dseq` does not exist or belongs to another user |
| 409 Conflict | State conflict | Lease already exists for this deployment |
| 429 Rate Limited | Rate limited | Polling interval too fast or burst of requests |
| 500 Internal Server Error | Server error | Retry with exponential backoff |

Error response shape:

```json
{
  "error": "BadRequest",
  "message": "SDL validation failed: missing 'profiles' section"
}
```

### Polling for Bids

Poll every 3 seconds for 30-60 seconds, then back off or return a timeout error.

---

## Managed Wallet vs SDK

| Feature | Managed Wallet API | Akash SDK |
|---------|-------------------|-----------|
| **Wallet Management** | Managed by Console | You manage wallet |
| **Authentication** | API Key | Private key/mnemonic |
| **Payment** | Credit card (USD) | Crypto (AKT) |
| **API Type** | REST API | Native blockchain |
| **Language** | Any (HTTP) | Go, TypeScript |
| **Setup** | API key only | Wallet + blockchain setup |
| **Best For** | SaaS, web apps | Blockchain apps, CLI tools |

---

## Limitations

- Payment method: Credit card only. Existing AKT wallets cannot be linked to a Managed Wallet account at this time.
- Wallet access: The Console manages the underlying wallet. You cannot export the private key or sign arbitrary transactions.
- API stability: The API is under active development. See the changelog ([https://github.com/akash-network/console/releases](https://github.com/akash-network/console/releases)) for breaking change notices. The `v1` and `v2` path prefixes are versioned independently.
- For production workloads without managed wallet constraints: use the [Akash SDK](/docs/api-documentation/sdk) or CLI with your own wallet.

---

---

## Resources

- **[API Reference](/docs/api-documentation/console-api/api-reference)** - Complete endpoint documentation
- **[Full API Documentation](https://github.com/akash-network/console/wiki/Managed-wallet-API)** - Complete API reference on GitHub
- **[Example Script](https://github.com/akash-network/console/wiki/Managed-wallet-API)** - Working implementation
- **[SDL Reference](/docs/developers/deployment/akash-sdl)** - SDL syntax guide
- **[Console Documentation](/docs/developers/deployment/akash-console)** - Console overview

---

## Need Help?

- **Discord:** [discord.akash.network](https://discord.akash.network) - #developers channel
- **GitHub Issues:** [console/issues](https://github.com/akash-network/console/issues)
- **Support:** [GitHub Support](https://github.com/akash-network/support/issues)
