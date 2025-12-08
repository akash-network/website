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

### 1. Create Certificate

Generate a certificate for secure provider communication:

```typescript
interface CertificateResponse {
  data: {
    data: {
      certPem: string;      // Certificate in PEM format
      encryptedKey: string; // Encrypted private key
    }
  }
}

const certResponse = await api.post<CertificateResponse>(
  "/v1/certificates",
  {}, // Empty request body
  {
    headers: {
      "x-api-key": apiKey
    }
  }
);

const { certPem, encryptedKey } = certResponse.data.data;
console.log("Certificate created");
```

---

### 2. Create Deployment

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

### 3. Wait for and Fetch Bids

Poll for provider bids:

```typescript
interface BidID {
  owner: string;
  dseq: string;
  gseq: number;
  oseq: number;
  provider: string;
}

interface Bid {
  bid_id: BidID;
  state: string;
  price: {
    denom: string;
    amount: string;
  };
  created_at: string;
}

interface BidsResponse {
  data: {
    data: {
      bid: Bid;
    }[];
  }
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

console.log("Selected bid from provider:", firstBid.bid_id.provider);
console.log("Bid price:", firstBid.price.amount, firstBid.price.denom);
```

---

### 4. Create Lease

Accept a bid and create a lease:

```typescript
interface CreateLeaseRequest {
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

interface CreateLeaseResponse {
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
      closed_on: string;
    }[];
    escrow_account: {
      id: {
        scope: string;
        xid: string;
      };
      owner: string;
      state: string;
      balance: {
        denom: string;
        amount: string;
      };
      transferred: {
        denom: string;
        amount: string;
      };
      settled_at: string;
      depositor: string;
      funds: {
        denom: string;
        amount: string;
      };
    };
  }
}

const leaseResponse = await api.post<CreateLeaseResponse>(
  "/v1/leases",
  {
    manifest: manifest,
    certificate: {
      certPem: certPem,
      keyPem: encryptedKey
    },
    leases: [
      {
        dseq: dseq,
        gseq: firstBid.bid_id.gseq,
        oseq: firstBid.bid_id.oseq,
        provider: firstBid.bid_id.provider
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

### 5. Add Deposit to Deployment

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

### 6. Close Deployment

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
    // 1. Create certificate
    console.log("Creating certificate...");
    const certResponse = await api.post(
      "/v1/certificates",
      {},
      { headers: { "x-api-key": API_KEY } }
    );
    const { certPem, encryptedKey } = certResponse.data.data;
    
    // 2. Create deployment
    console.log("Creating deployment...");
    const sdl = fs.readFileSync("deploy.yaml", "utf-8");
    const deployResponse = await api.post(
      "/v1/deployments",
      { data: { sdl, deposit: 5 } },
      { headers: { "x-api-key": API_KEY } }
    );
    const { dseq, manifest } = deployResponse.data.data;
    console.log("Deployment created with dseq:", dseq);
    
    // 3. Wait for bids
    console.log("Waiting for bids...");
    const bids = await waitForBids(dseq, API_KEY);
    const firstBid = bids[0];
    console.log("Selected provider:", firstBid.bid_id.provider);
    
    // 4. Create lease
    console.log("Creating lease...");
    const leaseResponse = await api.post(
      "/v1/leases",
      {
        manifest,
        certificate: { certPem, keyPem: encryptedKey },
        leases: [{
          dseq,
          gseq: firstBid.bid_id.gseq,
          oseq: firstBid.bid_id.oseq,
          provider: firstBid.bid_id.provider
        }]
      },
      { headers: { "x-api-key": API_KEY } }
    );
    console.log("**Lease created! Deployment is live.");
    
    // 5. (Optional) Add more deposit
    console.log("Adding additional deposit...");
    await api.post(
      "/v1/deposit-deployment",
      { data: { dseq, deposit: 0.5 } },
      { headers: { "x-api-key": API_KEY } }
    );
    
    // 6. Keep running or close
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

**For complete endpoint documentation**, see the **[API Reference →](/docs/api-documentation/console-api/api-reference)**

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

