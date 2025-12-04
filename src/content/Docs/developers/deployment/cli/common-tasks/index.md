---
categories: ["Developers", "Deployment", "CLI"]
tags: ["CLI", "Tasks", "Examples", "Tutorials"]
weight: 3
title: "CLI Common Tasks"
linkTitle: "Common Tasks"
description: "Common tasks and workflows using the provider-services CLI"
---

**Practical examples and workflows for common CLI tasks.**

This guide provides real-world examples for frequently performed operations.

---

## Deployment Workflows

### Create and Deploy an Application

**1. Write your SDL file (deploy.yml):**
```yaml
version: "2.0"
services:
  web:
    image: nginx
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
          denom: uakt
          amount: 100
deployment:
  web:
    akash:
      profile: web
      count: 1
```

**2. Create deployment:**
```bash
provider-services tx deployment create deploy.yml \
  --from my-wallet \
  --gas auto \
  --gas-adjustment 1.5
```

**3. Wait and query bids:**
```bash
# Get your address
AKASH_ADDRESS=$(provider-services keys show my-wallet -a)

# Query bids (wait 30 seconds after creating deployment)
provider-services query market bid list --owner $AKASH_ADDRESS
```

**4. Accept a bid (create lease):**
```bash
provider-services tx market lease create \
  --dseq <deployment-seq> \
  --provider <provider-address> \
  --from my-wallet \
  --gas auto
```

**5. Send manifest:**
```bash
provider-services send-manifest deploy.yml \
  --dseq <deployment-seq> \
  --provider <provider-address> \
  --from my-wallet
```

---

## Wallet Management

### Create and Fund a Wallet
```bash
# Create wallet
provider-services keys add my-wallet

# Save mnemonic securely!

# Get address
provider-services keys show my-wallet -a

# Check balance
provider-services query bank balances $(provider-services keys show my-wallet -a)
```

### Restore from Mnemonic
```bash
provider-services keys add my-wallet --recover
# Enter your mnemonic when prompted
```

### Export Private Key
```bash
provider-services keys export my-wallet
# Enter password when prompted
```

---

## Monitoring Deployments

### Check Deployment Status
```bash
# Get deployment info
provider-services query deployment get \
  --dseq <deployment-seq> \
  --owner <address>

# Check lease status
provider-services query market lease list --owner <address>
```

### View Logs
```bash
provider-services lease-logs \
  --dseq <deployment-seq> \
  --provider <provider-address> \
  --from my-wallet
```

### Get Service Status
```bash
provider-services lease-status \
  --dseq <deployment-seq> \
  --provider <provider-address> \
  --from my-wallet
```

---

## Updating Deployments

### Update Deployment
```bash
# Modify your SDL file
nano deploy.yml

# Send update
provider-services tx deployment update deploy.yml \
  --dseq <deployment-seq> \
  --from my-wallet
```

### Update Manifest Only
```bash
# Modify manifest (not resources)
provider-services send-manifest deploy.yml \
  --dseq <deployment-seq> \
  --provider <provider-address> \
  --from my-wallet
```

---

## Closing Deployments

### Close Deployment
```bash
provider-services tx deployment close \
  --dseq <deployment-seq> \
  --from my-wallet
```

**Note:** This closes the deployment and all associated leases. Funds in escrow are returned.

---

## Querying the Network

### Find Providers
```bash
# List all providers
provider-services query provider list

# Filter by attributes (example)
provider-services query provider list | grep "region: us-west"
```

### Check Network Status
```bash
# Latest block
provider-services query block

# Network parameters
provider-services query params
```

---

## Scripting and Automation

### Deployment Script Example
```bash
#!/bin/bash

WALLET="my-wallet"
SDL_FILE="deploy.yml"

# Create deployment
echo "Creating deployment..."
RESULT=$(provider-services tx deployment create $SDL_FILE --from $WALLET --gas auto -y --output json)
DSEQ=$(echo $RESULT | jq -r '.logs[0].events[] | select(.type=="akash.v1.EventDeploymentCreated") | .attributes[] | select(.key=="dseq") | .value')

echo "Deployment created: $DSEQ"
echo "Waiting for bids..."
sleep 30

# Query bids
BIDS=$(provider-services query market bid list --owner $(provider-services keys show $WALLET -a) --dseq $DSEQ --output json)
PROVIDER=$(echo $BIDS | jq -r '.bids[0].bid.provider')

echo "Creating lease with provider: $PROVIDER"
provider-services tx market lease create --dseq $DSEQ --provider $PROVIDER --from $WALLET --gas auto -y

echo "Sending manifest..."
provider-services send-manifest $SDL_FILE --dseq $DSEQ --provider $PROVIDER --from $WALLET

echo "Deployment complete!"
echo "DSEQ: $DSEQ"
echo "Provider: $PROVIDER"
```

---

## Troubleshooting

### Check Transaction Status
```bash
# If transaction fails, check the hash
provider-services query tx <tx-hash>
```

### Verify Configuration
```bash
# Check all environment variables
env | grep AKASH
```

### Test Connection
```bash
# Query latest block
provider-services query block
```

---

## Next Steps

- **[SDL Reference →](/docs/developers/deployment/akash-sdl)** - Learn SDL configuration
- **[SDL Examples →](/docs/developers/deployment/akash-sdl/examples-library)** - 290+ deployment examples
- **[Quick Start →](/docs/getting-started/quick-start)** - Full tutorial

---

**Previous:** [← Commands Reference](/docs/developers/deployment/cli/commands-reference)

---

**Need help?** Join [Discord](https://discord.akash.network) #developers channel!

