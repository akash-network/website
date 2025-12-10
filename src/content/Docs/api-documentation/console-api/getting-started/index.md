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

**WIP:** This API is under active development and may change frequently.

---

## Getting Started

### Create an API Key

1. Visit [console.akash.network](https://console.akash.network)
2. Sign in with your account
3. Navigate to **Settings** → **API Keys**
4. Click **"Create API Key"**
5. Copy and save your API key securely

**Important:** API keys grant full access to your Console account. Keep them secret!

---

## API Endpoints

**Base URL:** `https://console-api.akash.network`

All requests require the `x-api-key` header:

```typescript
const API_BASE_URL = "https://console-api.akash.network";
const API_KEY = "your-api-key-here";

// Helper function for API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return response.json();
}
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
    image: baktun/hello-akash-world:1.0.0
    expose:
      - port: 3000
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
          denom: ibc/170C677610AC31DF0904FFE09CD3B5C657492170E7E52372E48756B71E56F2F1
          amount: 10000
deployment:
  web:
    dcloud:
      profile: web
      count: 1
`;

const deployResponse = await apiRequest<CreateDeploymentResponse>(
  "/v1/deployments",
  {
    method: "POST",
    body: JSON.stringify({
      data: {
        sdl: sdl,
        deposit: 5 // $5 deposit
      }
    })
  }
);

const { dseq, manifest } = deployResponse.data;
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
  maxAttempts = 10
): Promise<BidResponse[]> {
  for (let i = 0; i < maxAttempts; i++) {
    console.log(`Checking for bids (attempt ${i + 1}/${maxAttempts})...`);
    
    const response = await apiRequest<BidsResponse>(`/v1/bids?dseq=${dseq}`);

    if (response.data?.length > 0) {
      console.log(`Found ${response.data.length} bid(s)`);
      return response.data;
    }
    
    // Wait 3 seconds before next attempt
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  throw new Error("No bids received after maximum attempts");
}

// Use the function
const bids = await waitForBids(dseq);
const firstBid = bids[0];

console.log("Selected bid from provider:", firstBid.bid.id.provider);
console.log("Bid price:", firstBid.bid.price.amount, firstBid.bid.price.denom);
console.log("Certificate required:", firstBid.isCertificateRequired);
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

const leaseResponse = await apiRequest<CreateLeaseResponse>(
  "/v1/leases",
  {
    method: "POST",
    body: JSON.stringify({
      manifest: manifest,
      leases: [
        {
          dseq: dseq,
          gseq: firstBid.bid.id.gseq,
          oseq: firstBid.bid.id.oseq,
          provider: firstBid.bid.id.provider
        }
      ]
    } as CreateLeaseRequest)
  }
);

console.log("✅ Lease created!");
console.log("Deployment state:", leaseResponse.data.deployment.state);
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

const depositResponse = await apiRequest<DepositDeploymentResponse>(
  "/v1/deposit-deployment",
  {
    method: "POST",
    body: JSON.stringify({
      data: {
        dseq: dseq,
        deposit: 0.5 // Add $0.50 to escrow
      }
    })
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
    success: boolean;
  }
}

const closeResponse = await apiRequest<CloseDeploymentResponse>(
  `/v1/deployments/${dseq}`,
  {
    method: "DELETE"
  }
);

console.log("Deployment closed:", closeResponse.data.success);
```

---

## Complete Example Script

Here's a complete working example that you can copy-paste and run directly:

```typescript
// Set your API key here or use environment variable
const API_KEY = process.env.CONSOLE_API_KEY || "your-api-key-here";
const API_BASE_URL = "https://console-api.akash.network";

// SDL configuration for a Hello Akash World deployment
const SDL = `
version: "2.0"
services:
  web:
    image: baktun/hello-akash-world:1.0.0
    expose:
      - port: 3000
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
          denom: ibc/170C677610AC31DF0904FFE09CD3B5C657492170E7E52372E48756B71E56F2F1
          amount: 10000
deployment:
  web:
    dcloud:
      profile: web
      count: 1
`;

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error ${response.status}: ${error}`);
  }
  
  return response.json();
}

async function waitForBids(dseq: string, maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    console.log(`Checking for bids (attempt ${i + 1}/${maxAttempts})...`);
    const response = await apiRequest<{ data: any[] }>(`/v1/bids?dseq=${dseq}`);
    
    if (response.data?.length > 0) {
      console.log(`Found ${response.data.length} bid(s)`);
      return response.data;
    }
    
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  throw new Error("No bids received after maximum attempts");
}

async function deployToAkash() {
  try {
    // 1. Create deployment
    console.log("Creating deployment...");
    const deployResponse = await apiRequest<{ data: { dseq: string; manifest: string } }>(
      "/v1/deployments",
      {
        method: "POST",
        body: JSON.stringify({ data: { sdl: SDL, deposit: 5 } })
      }
    );
    const { dseq, manifest } = deployResponse.data;
    console.log("✅ Deployment created with dseq:", dseq);
    
    // 2. Wait for bids
    console.log("\\nWaiting for provider bids...");
    const bids = await waitForBids(dseq);
    const firstBid = bids[0];
    console.log("Selected provider:", firstBid.bid.id.provider);
    console.log("Price:", firstBid.bid.price.amount, firstBid.bid.price.denom);
    
    // 3. Create lease
    console.log("\\nCreating lease...");
    await apiRequest(
      "/v1/leases",
      {
        method: "POST",
        body: JSON.stringify({
          manifest,
          leases: [{
            dseq,
            gseq: firstBid.bid.id.gseq,
            oseq: firstBid.bid.id.oseq,
            provider: firstBid.bid.id.provider
          }]
        })
      }
    );
    console.log("**Lease created! Deployment is live.");
    
    console.log("\\n========================================");
    console.log("🚀 Deployment is running!");
    console.log("   DSEQ:", dseq);
    console.log("   Provider:", firstBid.bid.id.provider);
    console.log("========================================");
    console.log("\\nTo close this deployment later, run:");
    console.log(`  DELETE /v1/deployments/${dseq}`);
    
  } catch (error) {
    console.error("❌ Error:", error instanceof Error ? error.message : error);
  }
}

// Run the deployment
deployToAkash();
```

Save this as `deploy.ts` and run:

```bash
export CONSOLE_API_KEY="your-api-key-here"
npx tsx deploy.ts
```

Or run directly with Deno:

```bash
CONSOLE_API_KEY="your-api-key-here" deno run --allow-net --allow-env deploy.ts
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
  const response = await apiRequest("/v1/deployments", {
    method: "POST",
    body: JSON.stringify(data)
  });
} catch (error) {
  if (error instanceof Error) {
    console.error("Error:", error.message);
  }
}
```

For more detailed error handling:

```typescript
async function apiRequestWithErrorHandling<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API error ${response.status}: ${errorBody}`);
  }
  
  return response.json();
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

