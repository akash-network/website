---
categories: ["API Documentation", "Console API"]
tags: ["Console", "API", "Reference", "REST API", "Endpoints"]
weight: 2
title: "Managed Wallet API Reference"
linkTitle: "API Reference"
description: "Complete API reference for Console Managed Wallet API endpoints"
---

**Complete reference for all Managed Wallet API endpoints.**

---

## Authentication

All API requests require the `x-api-key` header:

```typescript
headers: {
  "Content-Type": "application/json",
  "x-api-key": "your-api-key-here"
}
```

---

## POST /v1/certificates

Create a certificate for secure provider communication.

**Request:**
```typescript
{} // Empty body
```

**Response:**
```typescript
{
  data: {
    data: {
      certPem: string;      // Certificate in PEM format
      encryptedKey: string; // Encrypted private key
    }
  }
}
```

**Example:**
```typescript
const certResponse = await api.post("/v1/certificates", {}, {
  headers: { "x-api-key": apiKey }
});
```

---

## POST /v1/deployments

Create a new deployment.

**Request:**
```typescript
{
  data: {
    sdl: string;     // SDL content as string
    deposit: number; // Deposit in dollars (minimum $5)
  }
}
```

**Response:**
```typescript
{
  data: {
    data: {
      dseq: string;     // Deployment sequence ID
      manifest: string; // Deployment manifest JSON
    }
  }
}
```

**Example:**
```typescript
const deployResponse = await api.post("/v1/deployments", {
  data: {
    sdl: sdlContent,
    deposit: 5 // $5 deposit
  }
}, {
  headers: { "x-api-key": apiKey }
});

const { dseq, manifest } = deployResponse.data.data;
```

---

## GET /v1/bids

Fetch bids for a deployment.

**Query Parameters:**
- `dseq` (required) - Deployment sequence ID

**Response:**
```typescript
{
  data: {
    data: {
      bid: {
        bid_id: {
          owner: string;
          dseq: string;
          gseq: number;
          oseq: number;
          provider: string;
        };
        state: string;
        price: {
          denom: string;
          amount: string;
        };
        created_at: string;
      }
    }[]
  }
}
```

**Example:**
```typescript
const bidsResponse = await api.get(`/v1/bids?dseq=${dseq}`, {
  headers: { "x-api-key": apiKey }
});

const bids = bidsResponse.data.data.map(b => b.bid);
```

---

## POST /v1/leases

Create a lease by accepting a bid.

**Request:**
```typescript
{
  manifest: string;
  certificate: {
    certPem: string;
    keyPem: string;
  };
  leases: {
    dseq: string;
    gseq: number;
    oseq: number;
    provider: string;
  }[];
}
```

**Response:**
```typescript
{
  data: {
    deployment: {
      deployment_id: {
        owner: string;
        dseq: string;
      };
      state: string;
      version: string;
      created_at: string;
    };
    leases: {
      lease_id: {
        owner: string;
        dseq: string;
        gseq: number;
        oseq: number;
        provider: string;
      };
      state: string;
      price: {
        denom: string;
        amount: string;
      };
      created_at: string;
    }[];
    escrow_account: {
      id: { scope: string; xid: string; };
      owner: string;
      state: string;
      balance: { denom: string; amount: string; };
      transferred: { denom: string; amount: string; };
      settled_at: string;
      depositor: string;
      funds: { denom: string; amount: string; };
    };
  }
}
```

**Example:**
```typescript
const leaseResponse = await api.post("/v1/leases", {
  manifest: manifest,
  certificate: {
    certPem: certPem,
    keyPem: encryptedKey
  },
  leases: [{
    dseq: dseq,
    gseq: firstBid.bid_id.gseq,
    oseq: firstBid.bid_id.oseq,
    provider: firstBid.bid_id.provider
  }]
}, {
  headers: { "x-api-key": apiKey }
});

console.log("Lease created with state:", leaseResponse.data.data.deployment.state);
```

---

## POST /v1/deposit-deployment

Add additional funds to a deployment's escrow.

**Request:**
```typescript
{
  data: {
    deposit: number; // Amount in dollars
    dseq: string;
  }
}
```

**Example:**
```typescript
const depositResponse = await api.post("/v1/deposit-deployment", {
  data: {
    dseq: dseq,
    deposit: 0.5 // Add $0.50
  }
}, {
  headers: { "x-api-key": apiKey }
});
```

---

## DELETE /v1/deployments/:dseq

Close a deployment and recover remaining deposit.

**Path Parameters:**
- `dseq` - Deployment sequence ID

**Response:**
```typescript
{
  data: {
    data: {
      status: string;
      message: string;
    }
  }
}
```

**Example:**
```typescript
const closeResponse = await api.delete(`/v1/deployments/${dseq}`, {
  headers: { "x-api-key": apiKey }
});

console.log("Deployment closed:", closeResponse.data.data.message);
```

---

## Related Resources

- **[Getting Started](/docs/api-documentation/console-api)** - API setup and first deployment
- **[SDL Reference](/docs/developers/deployment/akash-sdl)** - SDL syntax guide
- **[Console Documentation](/docs/developers/deployment/akash-console)** - Console overview

