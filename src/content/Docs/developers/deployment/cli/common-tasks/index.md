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
    image: nginx:1.25.3
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
  --from $AKASH_KEY_NAME
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
  --from $AKASH_KEY_NAME
```

**5. Send manifest:**
```bash
provider-services send-manifest deploy.yml \
  --dseq <deployment-seq> \
  --provider <provider-address> \
  --from $AKASH_KEY_NAME
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
  --from $AKASH_KEY_NAME
```

### Get Service Status
```bash
provider-services lease-status \
  --dseq <deployment-seq> \
  --provider <provider-address> \
  --from $AKASH_KEY_NAME
```

---

## Updating Deployments

### What Can Be Updated?

**✅ Can update:**
- Container image versions
- Environment variables
- Command and args
- Some exposed port configurations

**❌ Cannot update (must close and recreate deployment):**
- CPU, memory, storage, GPU resources
- Placement criteria (provider attributes)
- Service names

### Update Deployment (2-Step Process)

Updating a deployment requires two steps:

**Step 1: Update on-chain deployment hash**
```bash
# Modify your SDL file
nano deploy.yml

# Update deployment on-chain
akash tx deployment update deploy.yml \
  --dseq <deployment-seq> \
  --from $AKASH_KEY_NAME
```

**Step 2: Send updated manifest to provider**
```bash
# Send updated manifest to provider
provider-services send-manifest deploy.yml \
  --dseq <deployment-seq> \
  --provider <provider-address> \
  --from $AKASH_KEY_NAME
```

---

## Closing Deployments

### Close Deployment
```bash
provider-services tx deployment close \
  --dseq <deployment-seq> \
  --from $AKASH_KEY_NAME
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

# Assumes environment variables are set: AKASH_KEY_NAME, AKASH_GAS, AKASH_GAS_ADJUSTMENT
SDL_FILE="deploy.yml"

# Create deployment
echo "Creating deployment..."
RESULT=$(provider-services tx deployment create $SDL_FILE --from $AKASH_KEY_NAME -y --output json)
DSEQ=$(echo $RESULT | jq -r '.logs[0].events[] | select(.type=="akash.v1.EventDeploymentCreated") | .attributes[] | select(.key=="dseq") | .value')

echo "Deployment created: $DSEQ"
echo "Waiting for bids..."
sleep 30

# Query bids
BIDS=$(provider-services query market bid list --owner $(provider-services keys show $AKASH_KEY_NAME -a) --dseq $DSEQ --output json)
PROVIDER=$(echo $BIDS | jq -r '.bids[0].bid.provider')

echo "Creating lease with provider: $PROVIDER"
provider-services tx market lease create --dseq $DSEQ --provider $PROVIDER --from $AKASH_KEY_NAME -y

echo "Sending manifest..."
provider-services send-manifest $SDL_FILE --dseq $DSEQ --provider $PROVIDER --from $AKASH_KEY_NAME

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

- **[Commands Reference →](/docs/developers/deployment/cli/commands-reference)** - Complete CLI command reference
- **[SDL Reference →](/docs/developers/deployment/akash-sdl)** - Learn SDL configuration
- **[SDL Examples →](/docs/developers/deployment/akash-sdl/examples-library)** - 290+ deployment examples

---

**Need help?** Join [Discord](https://discord.akash.network) #developers channel!

