---
categories: ["API Documentation", "Console API"]
tags: ["Console", "API", "Managed Wallet", "REST API", "Getting Started"]
weight: 1
title: "Getting Started with Managed Wallet API"
linkTitle: "Getting Started"
description: "Get started deploying on Akash with the Console Managed Wallet API"
---

**Deploy on Akash programmatically using the Console Managed Wallet API.**

The Managed Wallet API allows you to create and manage deployments programmatically without managing your own wallet or private keys.

** WIP:** This API is under active development and may change frequently.

---

## Getting Started

### Step 1: Create an API Key

1. Visit [console.akash.network](https://console.akash.network)
2. Sign in with your account
3. Navigate to **Settings** → **API Keys**
4. Click **"Create API Key"**
5. Copy and save your API key securely

** Important:** API keys grant full access to your Console account. Keep them secret!

---

### Step 2: Install Dependencies

```bash
npm install axios
# or
yarn add axios
# or
pnpm add axios
```

---

## Next Steps

- **[API Reference](/docs/api-documentation/console-api/api-reference)** - Complete endpoint documentation
- **[SDL Reference](/docs/developers/deployment/akash-sdl)** - Stack Definition Language syntax
- **[Console Documentation](/docs/developers/deployment/akash-console)** - Console overview
- **[Akash SDK](/docs/api-documentation/sdk)** - Alternative programmatic deployment approach

---

## API Endpoints

**Base URL:** `https://console-api.akash.network`

All requests require the `x-api-key` header:

```javascript
const api = axios.create({
  baseURL: "https://console-api.akash.network",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "your-api-key-here"
  }
});
```

---

## Complete Deployment Workflow

### 1. Create Deployment

Create a deployment from an SDL file:

```typescript
interface CreateDeploymentRequest {
  data: {
    sdl: string;     // SDL file content as string
    deposit: number; // Deposit amount in dollars (minimum $5)
  }
}

interface CreateDeploymentResponse {
  data: {
    data: {
      dseq: string;     // Deployment sequence ID
      manifest: string; // Deployment manifest
    }
  }
}

const sdl = `
version: "2.0"
services:
  web:
    image: nginx:1.25.3
    expose:
      - port: 80
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
          size: 512Mi
  placement:
    akash:
      pricing:
        web:
          denom: uakt
          amount: 1000
deployment:
  web:
    akash:
      profile: web
      count: 1
`;

const deployResponse = await api.post<CreateDeploymentResponse>(
  "/v1/deployments",
  {
    data: {
      sdl: sdl,
      deposit: 5 // $5 deposit
    }
  },
  {
    headers: {
      "x-api-key": apiKey
    }
  }
);

const { dseq, manifest } = deployResponse.data.data;
console.log("Deployment created with dseq:", dseq);
```

---

### 2. Wait for and Fetch Bids

Poll for provider bids:

```typescript
interface BidID {
  owner: string;
  dseq: string;
  gseq: number;
  oseq: number;
  provider: string;
  bseq: number;
}

interface ResourceAttribute {
  key: string;
  value: string;
}

interface DeploymentResource {
  cpu: {
    units: { val: string };
    attributes: ResourceAttribute[];
  };
  gpu: {
    units: { val: string };
    attributes: ResourceAttribute[];
  };
  memory: {
    quantity: { val: string };
    attributes: ResourceAttribute[];
  };
  storage: {
    name: string;
    quantity: { val: string };
    attributes: ResourceAttribute[];
  }[];
  endpoints: {
    kind: string;
    sequence_number: number;
  }[];
}

interface Bid {
  id: BidID;
  state: string;
  price: {
    denom: string;
    amount: string;
  };
  created_at: string;
  resources_offer: {
    resources: DeploymentResource;
    count: number;
  }[];
}

interface BidResponse {
  bid: Bid;
  escrow_account: {
    id: { scope: string; xid: string };
    state: {
      owner: string;
      state: string;
      transferred: { denom: string; amount: string }[];
      settled_at: string;
      funds: { denom: string; amount: string }[];
      deposits: {
        owner: string;
        height: string;
        source: string;
        balance: { denom: string; amount: string };
      }[];
    };
  };
  isCertificateRequired: boolean;
}

interface BidsResponse {
  data: BidResponse[];
}

async function waitForBids(
  dseq: string, 
  apiKey: string, 
  maxAttempts = 10
): Promise<Bid[]> {
  for (let i = 0; i < maxAttempts; i++) {
    console.log(`Checking for bids (attempt ${i + 1}/${maxAttempts})...`);
    
    const response = await api.get<BidsResponse>(
      `/v1/bids?dseq=${dseq}`,
      {
        headers: {
          "x-api-key": apiKey
        }
      }
    );

    if (response.data?.data?.length > 0) {
      console.log(`Found ${response.data.data.length} bid(s)`);
      return response.data.data.map(b => b.bid);
    }
    
    // Wait 3 seconds before next attempt
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  throw new Error("No bids received after maximum attempts");
}

// Use the function
const bids = await waitForBids(dseq, apiKey);
const firstBid = bids[0];

console.log("Selected bid from provider:", firstBid.id.provider);
console.log("Bid price:", firstBid.price.amount, firstBid.price.denom);
```

---

### 3. Create Lease

Accept a bid and create a lease:

```typescript
interface CreateLeaseRequest {
  manifest: string;
  certificate?: {  // Optional - for mTLS authentication
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

interface ForwardedPort {
  port: number;
  externalPort: number;
  host?: string;
  available?: number;
}

interface LeaseIp {
  IP: string;
  Port: number;
  ExternalPort: number;
  Protocol: string;
}

interface LeaseServiceStatus {
  name: string;
  available: number;
  total: number;
  uris: string[];
  observed_generation: number;
  replicas: number;
  updated_replicas: number;
  ready_replicas: number;
  available_replicas: number;
}

interface LeaseStatus {
  forwarded_ports: Record<string, ForwardedPort[]>;
  ips: Record<string, LeaseIp[]>;
  services: Record<string, LeaseServiceStatus>;
}

interface CreateLeaseResponse {
  data: {
    deployment: {
      id: {
        owner: string;
        dseq: string;
      };
      state: string;
      hash: string;
      created_at: string;
    };
    leases: {
      id: {
        owner: string;
        dseq: string;
        gseq: number;
        oseq: number;
        provider: string;
        bseq: number;
      };
      state: string;
      price: {
        denom: string;
        amount: string;
      };
      created_at: string;
      closed_on: string;
      reason?: string;
      status: LeaseStatus | null;
    }[];
    escrow_account: {
      id: {
        scope: string;
        xid: string;
      };
      state: {
        owner: string;
        state: string;
        transferred: { denom: string; amount: string }[];
        settled_at: string;
        funds: { denom: string; amount: string }[];
        deposits: {
          owner: string;
          height: string;
          source: string;
          balance: { denom: string; amount: string };
        }[];
      };
    };
  }
}

const leaseResponse = await api.post<CreateLeaseResponse>(
  "/v1/leases",
  {
    manifest: manifest,
    leases: [
      {
        dseq: dseq,
        gseq: firstBid.id.gseq,
        oseq: firstBid.id.oseq,
        provider: firstBid.id.provider
      }
    ]
  } as CreateLeaseRequest,
  {
    headers: {
      "x-api-key": apiKey
    }
  }
);

console.log("**Lease created!");
console.log("Deployment state:", leaseResponse.data.data.deployment.state);
```

---

### 4. Add Deposit to Deployment

Add additional funds to your deployment's escrow:

```typescript
interface DepositDeploymentRequest {
  data: {
    deposit: number; // Amount in dollars
    dseq: string;
  }
}

interface DepositDeploymentResponse {
  data: CreateLeaseResponse; // Same structure as lease creation
}

const depositResponse = await api.post<DepositDeploymentResponse>(
  "/v1/deposit-deployment",
  {
    data: {
      dseq: dseq,
      deposit: 0.5 // Add $0.50 to escrow
    }
  },
  {
    headers: {
      "x-api-key": apiKey
    }
  }
);

console.log("Deposit added to deployment");
```

---

### 5. Close Deployment

Close a deployment and recover remaining deposit:

```typescript
interface CloseDeploymentResponse {
  data: {
    data: {
      status: string;
      message: string;
    }
  }
}

const closeResponse = await api.delete<CloseDeploymentResponse>(
  `/v1/deployments/${dseq}`,
  {
    headers: {
      "x-api-key": apiKey
    }
  }
);

console.log("Deployment closed:", closeResponse.data.data.message);
```

---

## Complete Example Script

Here's a complete working example that ties it all together:

```typescript
import axios from "axios";
import * as fs from "fs";

const API_KEY = process.env.CONSOLE_API_KEY;
const API_BASE_URL = "https://console-api.akash.network";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

async function deployToAkash() {
  try {
    // 1. Create deployment
    console.log("Creating deployment...");
    const sdl = fs.readFileSync("deploy.yaml", "utf-8");
    const deployResponse = await api.post(
      "/v1/deployments",
      { data: { sdl, deposit: 5 } },
      { headers: { "x-api-key": API_KEY } }
    );
    const { dseq, manifest } = deployResponse.data.data;
    console.log("Deployment created with dseq:", dseq);
    
    // 2. Wait for bids
    console.log("Waiting for bids...");
    const bids = await waitForBids(dseq, API_KEY);
    const firstBid = bids[0];
    console.log("Selected provider:", firstBid.id.provider);
    
    // 3. Create lease
    console.log("Creating lease...");
    const leaseResponse = await api.post(
      "/v1/leases",
      {
        manifest,
        leases: [{
          dseq,
          gseq: firstBid.id.gseq,
          oseq: firstBid.id.oseq,
          provider: firstBid.id.provider
        }]
      },
      { headers: { "x-api-key": API_KEY } }
    );
    console.log("**Lease created! Deployment is live.");
    
    // 4. (Optional) Add more deposit
    console.log("Adding additional deposit...");
    await api.post(
      "/v1/deposit-deployment",
      { data: { dseq, deposit: 0.5 } },
      { headers: { "x-api-key": API_KEY } }
    );
    
    // 5. Keep running or close
    console.log("Deployment is running!");
    console.log("To close later, call DELETE /v1/deployments/" + dseq);
    
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
  }
}

async function waitForBids(dseq: string, apiKey: string, maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    const response = await api.get(`/v1/bids?dseq=${dseq}`, {
      headers: { "x-api-key": apiKey }
    });
    
    if (response.data?.data?.length > 0) {
      return response.data.data.map(b => b.bid);
    }
    
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  throw new Error("No bids received");
}

// Run the deployment
deployToAkash();
```

Save this as `deploy.ts` and run:

```bash
export CONSOLE_API_KEY="your-api-key-here"
npx ts-node deploy.ts
```

---

## API Reference

### Authentication

All API requests require the `x-api-key` header:

```typescript
headers: {
  "Content-Type": "application/json",
  "x-api-key": "your-api-key-here"
}
```

---

### POST /v1/deployments

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

### GET /v1/bids

Fetch bids for a deployment.

**Query Parameters:**
- `dseq` (required) - Deployment sequence ID

**Response:**
```typescript
{
  data: {
    bid: {
      id: {
        owner: string;
        dseq: string;
        gseq: number;
        oseq: number;
        provider: string;
        bseq: number;
      };
      state: string;
      price: {
        denom: string;
        amount: string;
      };
      created_at: string;
      resources_offer: {
        resources: {
          cpu: {
            units: { val: string };
            attributes: { key: string; value: string }[];
          };
          gpu: {
            units: { val: string };
            attributes: { key: string; value: string }[];
          };
          memory: {
            quantity: { val: string };
            attributes: { key: string; value: string }[];
          };
          storage: {
            name: string;
            quantity: { val: string };
            attributes: { key: string; value: string }[];
          }[];
          endpoints: { kind: string; sequence_number: number }[];
        };
        count: number;
      }[];
    };
    escrow_account: {
      id: { scope: string; xid: string };
      state: {
        owner: string;
        state: string;
        transferred: { denom: string; amount: string }[];
        settled_at: string;
        funds: { denom: string; amount: string }[];
        deposits: {
          owner: string;
          height: string;
          source: string;
          balance: { denom: string; amount: string };
        }[];
      };
    };
    isCertificateRequired: boolean;
  }[];
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

### POST /v1/leases

Create a lease by accepting a bid.

**Request:**
```typescript
{
  manifest: string;
  certificate?: {  // Optional - for mTLS authentication
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
      id: {
        owner: string;
        dseq: string;
      };
      state: string;
      hash: string;
      created_at: string;
    };
    leases: {
      id: {
        owner: string;
        dseq: string;
        gseq: number;
        oseq: number;
        provider: string;
        bseq: number;
      };
      state: string;
      price: {
        denom: string;
        amount: string;
      };
      created_at: string;
      closed_on: string;
      reason?: string;
      status: {
        forwarded_ports: Record<string, {
          port: number;
          externalPort: number;
          host?: string;
          available?: number;
        }[]>;
        ips: Record<string, {
          IP: string;
          Port: number;
          ExternalPort: number;
          Protocol: string;
        }[]>;
        services: Record<string, {
          name: string;
          available: number;
          total: number;
          uris: string[];
          observed_generation: number;
          replicas: number;
          updated_replicas: number;
          ready_replicas: number;
          available_replicas: number;
        }>;
      } | null;
    }[];
    escrow_account: {
      id: { scope: string; xid: string };
      state: {
        owner: string;
        state: string;
        transferred: { denom: string; amount: string }[];
        settled_at: string;
        funds: { denom: string; amount: string }[];
        deposits: {
          owner: string;
          height: string;
          source: string;
          balance: { denom: string; amount: string };
        }[];
      };
    };
  }
}
```

**Example:**
```typescript
const leaseResponse = await api.post("/v1/leases", {
  manifest: manifest,
  leases: [{
    dseq: dseq,
    gseq: firstBid.id.gseq,
    oseq: firstBid.id.oseq,
    provider: firstBid.id.provider
  }]
}, {
  headers: { "x-api-key": apiKey }
});

console.log("Lease created with state:", leaseResponse.data.data.deployment.state);
```

---

### POST /v1/deposit-deployment

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

### DELETE /v1/deployments/:dseq

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

Always wrap API calls in try-catch blocks:

```typescript
try {
  const response = await api.post("/v1/deployments", data, {
    headers: { "x-api-key": apiKey }
  });
} catch (error) {
  if (error.response) {
    // API error response
    console.error("API Error:", error.response.data);
    console.error("Status:", error.response.status);
  } else {
    // Network or other error
    console.error("Error:", error.message);
  }
}
```

### Polling for Bids

- **Wait time:** 30-60 seconds typical
- **Poll interval:** 3 seconds recommended
- **Max attempts:** 10-20 attempts
- **Handle no bids:** Increase pricing or try again

### Deposit Management

- **Minimum deposit:** $5 USD
- **Recommended:** Add 20-30% buffer for price fluctuations
- **Monitor balance:** Check escrow regularly
- **Auto-refund:** Remaining deposit refunded on close

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

- ⚠️ **API is in development** - Endpoints may change
- ⚠️ **Credit card payment only** - Cannot use existing AKT
- ⚠️ **Managed wallet** - No direct blockchain access

**For production deployments without time limits**, use the [Akash SDK](/docs/extend/sdk) or [CLI](/docs/developers/deployment/cli) with your own wallet.

---

## Optional: Certificate Authentication (mTLS)

Certificates are **optional** but can be used for secure mTLS (mutual TLS) communication with providers. If you need an additional layer of security for provider communication, you can create and use certificates.

### POST /v1/certificates

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

const { certPem, encryptedKey } = certResponse.data.data;
```

### Using Certificates with Leases

To use a certificate when creating a lease, include the `certificate` field in your lease request:

```typescript
const leaseResponse = await api.post("/v1/leases", {
  manifest: manifest,
  certificate: {
    certPem: certPem,
    keyPem: encryptedKey
  },
  leases: [{
    dseq: dseq,
    gseq: firstBid.id.gseq,
    oseq: firstBid.id.oseq,
    provider: firstBid.id.provider
  }]
}, {
  headers: { "x-api-key": apiKey }
});
```

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

