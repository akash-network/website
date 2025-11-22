---
categories: [Akash Console API]
tags: ["API", "Quick Start"]
weight: 3
title: "Examples"
linkTitle: "Examples"
---

# Quick Start: Deploy Hello World

Deploy a simple NGINX server using the Console API. This guide uses a bash script to automate the deployment process.

## Prerequisites

You need an **API Key**. See [API Key Setup](/docs/deployments/console-api/prerequisites#api-key-setup).

## Step 1: Prepare SDL

Save the following content as `deploy.yaml`. This defines a simple NGINX service.

```yaml
---
version: "2.0"
services:
  web:
    image: nginx:latest
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
          size: 512Mi
  placement:
    akash:
      pricing:
        web:
          denom: ibc/170C677610AC31DF0904FFE09CD3B5C657492170E7E52372E48756B71E56F2F1
          amount: 10000
deployment:
  web:
    akash:
      profile: web
      count: 1
```

## Step 2: Run Deployment Script

You can use this bash script to automate the **Lease Flow**:
1.  **Create Certificate**: Authenticates you with providers.
2.  **Create Deployment**: Submits your SDL.
3.  **Fetch Bids**: Finds a provider.
4.  **Create Lease**: Starts the workload.
5.  **Deposit Deployment**: (Optional for this quick test, as initial deposit covers it).

**Copy and paste this into your terminal:**

```bash
# Set your API Key
export AKASH_API_KEY="your-api-key-here"

# 1. Create Certificate
echo "Creating Certificate..."
CERT_RES=$(curl -s -X POST https://console-api.akash.network/v1/certificates \
  -H "x-api-key: $AKASH_API_KEY")
CERT_PEM=$(echo $CERT_RES | jq -r '.data.certPem')
KEY_PEM=$(echo $CERT_RES | jq -r '.data.encryptedKey')

# 2. Create Deployment
echo "Creating Deployment..."
DEP_RES=$(curl -s -X POST https://console-api.akash.network/v1/deployments \
  -H "x-api-key: $AKASH_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"data\": {\"sdl\": \"$(cat deploy.yaml | sed 's/"/\\"/g')\", \"deposit\": 5}}")
DSEQ=$(echo $DEP_RES | jq -r '.data.dseq')
MANIFEST=$(echo $DEP_RES | jq -r '.data.manifest')

echo "Deployment created with DSEQ: $DSEQ. Waiting 15s for bids..."
sleep 15

# 3. Fetch Bids
echo "Fetching Bids..."
BID=$(curl -s -H "x-api-key: $AKASH_API_KEY" https://console-api.akash.network/v1/bids?dseq=$DSEQ | jq -r '.data.data[0]')
PROVIDER=$(echo $BID | jq -r '.bid.bid_id.provider')

if [ -z "$PROVIDER" ] || [ "$PROVIDER" == "null" ]; then
  echo "No bids received yet. Please check status manually."
  exit 1
fi

# 4. Create Lease
echo "Creating Lease with Provider: $PROVIDER"
curl -X POST https://console-api.akash.network/v1/leases \
  -H "x-api-key: $AKASH_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"manifest\": \"$MANIFEST\",
    \"certificate\": {\"certPem\": \"$CERT_PEM\", \"keyPem\": \"$KEY_PEM\"},
    \"leases\": [{\"dseq\": \"$DSEQ\", \"gseq\": 1, \"oseq\": 1, \"provider\": \"$PROVIDER\"}]
  }"

echo ""
echo "---------------------------------------------------"
echo "Lease created! Check status at: https://console.akash.network/deployments/$DSEQ"
```

## Next Steps

*   Understand the full [Lease Flow](workflows).

## Advanced Examples

For production applications, we recommend using a robust client like the TypeScript example below.

### TypeScript (Full Lease Flow)

This script demonstrates the complete lifecycle: creating a certificate, deploying an SDL, selecting a bid, creating a lease, and funding the deployment.

**Prerequisites:**
*   `npm install axios`

```typescript
import axios from 'axios';
import * as fs from 'fs';

// Configuration
const API_URL = 'https://console-api.akash.network';
const API_KEY = 'your-api-key-here'; // Replace with your key
const SDL_PATH = './deploy.yaml'; // Path to your SDL file

// Axios Instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY
  }
});

// Interfaces
interface CertificateResponse {
  data: { data: { certPem: string; encryptedKey: string; } }
}

interface CreateDeploymentResponse {
  data: { data: { dseq: string; manifest: string; } }
}

interface Bid {
  bid_id: { owner: string; dseq: string; gseq: number; oseq: number; provider: string; };
  price: { denom: string; amount: string; };
}

interface BidsResponse {
  data: { data: { bid: Bid; }[]; }
}

async function main() {
  try {
    console.log("--- Starting Lease Flow ---");

    // 1. Create Certificate
    console.log("1. Creating Certificate...");
    const certRes = await api.post<CertificateResponse>('/v1/certificates', {});
    const { certPem, encryptedKey } = certRes.data.data; // Swagger says: { data: { certPem, encryptedKey } }
    console.log("   Certificate created.");

    // 2. Create Deployment
    console.log("2. Creating Deployment...");
    const sdlContent = fs.readFileSync(SDL_PATH, 'utf8');
    const deployRes = await api.post<CreateDeploymentResponse>('/v1/deployments', {
      data: { sdl: sdlContent, deposit: 5 } // $5 deposit
    });
    const { dseq, manifest } = deployRes.data.data; // Swagger says: { data: { dseq, manifest, signTx } }
    console.log(`   Deployment created. DSEQ: ${dseq}`);

    // 3. Fetch Bids
    console.log("3. Waiting for Bids (15s)...");
    await new Promise(r => setTimeout(r, 15000)); // Wait for network propagation
    
    const bidsRes = await api.get<BidsResponse>(`/v1/bids?dseq=${dseq}`);
    const bids = bidsRes.data.data;
    
    if (!bids || bids.length === 0) {
      throw new Error("No bids received. Check SDL requirements or price.");
    }
    console.log(`   Received ${bids.length} bids.`);
    
    // Select the first bid (Simple strategy)
    const selectedBid = bids[0].bid;
    console.log(`   Selected Provider: ${selectedBid.bid_id.provider} (${selectedBid.price.amount} ${selectedBid.price.denom})`);

    // 4. Create Lease
    console.log("4. Creating Lease...");
    await api.post('/v1/leases', {
      manifest: manifest,
      certificate: { certPem, keyPem: encryptedKey },
      leases: [{
        dseq: dseq,
        gseq: selectedBid.bid_id.gseq,
        oseq: selectedBid.bid_id.oseq,
        provider: selectedBid.bid_id.provider
      }]
    });
    console.log("   Lease created successfully! Workload should start shortly.");
    console.log(`   View status: https://console.akash.network/deployments/${dseq}`);

  } catch (error: any) {
    console.error("Error:", error.response ? error.response.data : error.message);
  }
}

main();
```

### Python (Requests)

A simple example to list deployments.

```python
import requests
import os

API_URL = "https://console-api.akash.network/v1"
API_KEY = os.getenv("AKASH_API_KEY")

headers = {
    "x-api-key": API_KEY,
    "Content-Type": "application/json"
}

def get_deployments():
    response = requests.get(f"{API_URL}/deployments", headers=headers)
    if response.status_code == 200:
        print("Deployments:", response.json())
    else:
        print("Error:", response.text)

get_deployments()
```

### cURL

Quick commands for testing.

#### List Deployments
```bash
curl -X GET https://console-api.akash.network/v1/deployments \
  -H "x-api-key: $AKASH_API_KEY"
```

#### Get Specific Deployment
```bash
curl -X GET https://console-api.akash.network/v1/deployments/123456 \
  -H "x-api-key: $AKASH_API_KEY"
```

#### Close Deployment
```bash
curl -X DELETE https://console-api.akash.network/v1/deployments/123456 \
  -H "x-api-key: $AKASH_API_KEY"
```
