---
categories: ["API Documentation", "Console API"]
tags: ["Console", "API", "Reference", "REST API", "Endpoints"]
weight: 2
title: "API Reference"
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
    dseq: string;     // Deployment sequence ID
    manifest: string; // Deployment manifest JSON
  }
}
```

**Example:**
```typescript
const deployResponse = await apiRequest<{ data: { dseq: string; manifest: string } }>(
  "/v1/deployments",
  {
    method: "POST",
    body: JSON.stringify({
      data: {
        sdl: sdlContent,
        deposit: 5 // $5 deposit
      }
    })
  }
);

const { dseq, manifest } = deployResponse.data;
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
  }[];
}
```

**Example:**
```typescript
const bidsResponse = await apiRequest<{ data: BidResponse[] }>(
  `/v1/bids?dseq=${dseq}`
);

const bids = bidsResponse.data;
```

---

## POST /v1/leases

Create a lease by accepting a provider bid.

**Request:**
```typescript
{
  manifest: string;
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
const leaseResponse = await apiRequest<CreateLeaseResponse>(
  "/v1/leases",
  {
    method: "POST",
    body: JSON.stringify({
      manifest: manifest,
      leases: [{
        dseq: dseq,
        gseq: firstBid.bid.id.gseq,
        oseq: firstBid.bid.id.oseq,
        provider: firstBid.bid.id.provider
      }]
    })
  }
);

console.log("Lease created with state:", leaseResponse.data.deployment.state);
```

---

## POST /v1/deposit-deployment

Add additional funds to a deployment's escrow to keep it running.

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
const depositResponse = await apiRequest<DepositDeploymentResponse>(
  "/v1/deposit-deployment",
  {
    method: "POST",
    body: JSON.stringify({
      data: {
        dseq: dseq,
        deposit: 0.5 // Add $0.50
      }
    })
  }
);
```

---

## GET /v1/deployments

List all deployments for the authenticated user.

**Query Parameters:**
- `skip` (optional) - Number of deployments to skip (default: 0)
- `limit` (optional) - Maximum number of deployments to return (default: 10)

**Response:**
```typescript
{
  data: {
    deployments: {
      deployment: {
        id: { owner: string; dseq: string };
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
        price: { denom: string; amount: string };
        created_at: string;
        closed_on: string;
        reason?: string;
        status: LeaseStatus | null;
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
    }[];
    pagination: {
      total: number;
      skip: number;
      limit: number;
    };
  }
}
```

**Example:**
```typescript
const deploymentsResponse = await apiRequest<ListDeploymentsResponse>(
  "/v1/deployments?skip=0&limit=10"
);

const { deployments, pagination } = deploymentsResponse.data;
```

---

## GET /v1/deployments/:dseq

Get detailed information about a specific deployment.

**Path Parameters:**
- `dseq` - Deployment sequence ID

**Response:**
```typescript
{
  data: {
    deployment: {
      id: { owner: string; dseq: string };
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
      price: { denom: string; amount: string };
      created_at: string;
      closed_on: string;
      reason?: string;
      status: LeaseStatus | null;
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
const deploymentResponse = await apiRequest<GetDeploymentResponse>(
  `/v1/deployments/${dseq}`
);

const { deployment, leases, escrow_account } = deploymentResponse.data;
```

---

## PUT /v1/deployments/:dseq

Update an existing deployment with a new SDL configuration.

**Path Parameters:**
- `dseq` - Deployment sequence ID

**Request:**
```typescript
{
  data: {
    sdl: string;     // Updated SDL content as string
  }
}
```

**Response:**
```typescript
{
  data: {
    deployment: {
      id: { owner: string; dseq: string };
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
      price: { denom: string; amount: string };
      created_at: string;
      closed_on: string;
      reason?: string;
      status: LeaseStatus | null;
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
const updateResponse = await apiRequest<UpdateDeploymentResponse>(
  `/v1/deployments/${dseq}`,
  {
    method: "PUT",
    body: JSON.stringify({
      data: {
        sdl: updatedSdlContent
      }
    })
  }
);
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
    success: boolean;
  }
}
```

**Example:**
```typescript
const closeResponse = await apiRequest<CloseDeploymentResponse>(
  `/v1/deployments/${dseq}`,
  {
    method: "DELETE"
  }
);

console.log("Deployment closed:", closeResponse.data.success);
```

---

## GET /v2/deployment-settings/{dseq}

Get deployment settings for a specific deployment. If no settings exist, they are automatically created with auto top-up **enabled** by default.

**Path Parameters:**
- `dseq` (required) - Deployment sequence number

**Query Parameters:**
- `userId` (optional) - User ID. Defaults to the current authenticated user if not provided

**Response:**
```typescript
{
  data: {
    id: string;                  // UUID
    userId: string;              // User ID
    dseq: string;                // Deployment sequence number
    autoTopUpEnabled: boolean;   // Whether auto top-up is enabled
    estimatedTopUpAmount: number; // Estimated top-up amount
    topUpFrequencyMs: number;    // Top-up frequency in milliseconds
    createdAt: string;           // ISO 8601 datetime
    updatedAt: string;           // ISO 8601 datetime
  }
}
```

**Example:**
```typescript
const settingsResponse = await apiRequest<DeploymentSettingResponse>(
  `/v2/deployment-settings/${dseq}`
);

const settings = settingsResponse.data;
console.log("Auto top-up enabled:", settings.autoTopUpEnabled);
```

---

## POST /v2/deployment-settings

Create deployment settings for a deployment.

**Request:**
```typescript
{
  data: {
    dseq: string;                    // Deployment sequence number
    autoTopUpEnabled?: boolean;      // Whether auto top-up is enabled (default: false)
    userId?: string;                 // User ID. Defaults to the current authenticated user if not provided
  }
}
```

**Response (201):**
```typescript
{
  data: {
    id: string;                  // UUID
    userId: string;              // User ID
    dseq: string;                // Deployment sequence number
    autoTopUpEnabled: boolean;   // Whether auto top-up is enabled
    estimatedTopUpAmount: number; // Estimated top-up amount
    topUpFrequencyMs: number;    // Top-up frequency in milliseconds
    createdAt: string;           // ISO 8601 datetime
    updatedAt: string;           // ISO 8601 datetime
  }
}
```

**Example:**
```typescript
const createResponse = await apiRequest<DeploymentSettingResponse>(
  "/v2/deployment-settings",
  {
    method: "POST",
    body: JSON.stringify({
      data: {
        dseq: "12345",
        autoTopUpEnabled: true
      }
    })
  }
);

console.log("Settings created:", createResponse.data.id);
```

---

## See Also

- **[Getting Started](/docs/api-documentation/console-api/getting-started)** - Full workflow with examples
- **[SDL Reference](https://docs.akash.network/docs/getting-started/stack-definition-language/)** - SDL syntax and options
- **[Akash CLI](https://docs.akash.network/docs/deployments/akash-cli/installation/)** - Wallet-based deployments
- **[Console](https://console.akash.network)** - Visual interface for managing deployments
- **[GitHub: akash-network/console](https://github.com/akash-network/console)** - Source and issues
