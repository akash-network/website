---
categories: ["Learn", "Core Concepts"]
tags: ["Deployments", "Lifecycle", "Orders", "Escrow"]
weight: 1
title: "Deployments & Lifecycle"
linkTitle: "Deployments"
description: "Understanding Akash deployments from creation to closure"
---

**Master the complete deployment lifecycle on Akash Network.**

A deployment is the fundamental unit of work on Akash - it represents your application, its resource requirements, and the agreement with a provider to run it. Understanding the deployment lifecycle is key to successfully using Akash.

---

## What is a Deployment?

A **deployment** is a request for compute resources on Akash Network. When you create a deployment:

1. You describe what you want to run (containers, resources, ports)
2. The deployment is posted to the blockchain
3. An **order** is created on the marketplace
4. Providers bid to host your deployment
5. You accept a bid and create a **lease**
6. Your application runs on the provider's infrastructure

---

## Key Components

### Deployment

The deployment is your application specification:
- **Services** - What containers to run
- **Resources** - CPU, memory, storage, GPU requirements
- **Pricing** - Maximum you're willing to pay
- **Placement** - Optional requirements (location, attributes)

**Stored on:** Akash blockchain  
**Identified by:** Deployment Sequence (DSEQ) - unique number per account

### Order

When you create a deployment, an **order** opens on the marketplace:
- Advertises your resource needs
- Includes pricing and placement requirements
- Stays open for ~5 minutes
- Providers submit **bids** during this window

**Stored on:** Akash blockchain  
**Identified by:** DSEQ + Group Sequence (GSEQ) + Order Sequence (OSEQ)

### Bid

A **bid** is a provider's offer to host your deployment:
- Specifies the price they'll charge
- Includes provider information and attributes
- Must be at or below your maximum price
- Can be accepted to create a lease

**Stored on:** Akash blockchain  
**Identified by:** DSEQ + GSEQ + OSEQ + Provider Address

### Lease

A **lease** is the active agreement between you and a provider:
- Locks in pricing
- Reserves resources on the provider
- Enables manifest upload
- Continues until closed or escrow depleted

**Stored on:** Akash blockchain  
**Identified by:** DSEQ + GSEQ + OSEQ + Provider Address

### Manifest

The **manifest** is the detailed deployment specification sent to the provider:
- More detailed than the SDL
- Includes all service configurations
- Sent directly to the provider (not on blockchain)
- Used by provider to start containers

**Stored on:** Provider infrastructure  
**Format:** YAML, similar to SDL but with more details

---

## Complete Deployment Lifecycle

### Stage 1: Preparation

**What you do:**
- Write SDL file describing your application
- Ensure wallet has sufficient AKT/USDC (minimum 0.5 + gas fees)
- Choose network (mainnet or sandbox)

**What happens:**
- Nothing yet - you're just preparing

### Stage 2: Create Deployment

**What you do:**
- Submit deployment transaction to blockchain
- Include deposit (escrow) amount

**What happens:**
1. Deployment is recorded on blockchain with unique DSEQ
2. Order automatically opens on marketplace
3. Escrow account created with your deposit
4. Deployment status: `open`
5. Order status: `open`

**Blockchain state:**
```
Deployment #123456 (DSEQ)
  └─ Order #1 (GSEQ 1, OSEQ 1)
       Status: OPEN
       Timeout: ~5 minutes
```

### Stage 3: Provider Bidding

**What providers do:**
- Monitor marketplace for new orders
- Evaluate if they can meet requirements
- Submit bids with their pricing

**What you see:**
- Bids appear in real-time
- Each bid shows provider, price, attributes
- Multiple bids from different providers

**Typical timeline:** Bids arrive within 30 seconds to 2 minutes

**Blockchain state:**
```
Deployment #123456
  └─ Order #1
       Status: OPEN
       ├─ Bid from Provider A: 9000 uakt/block
       ├─ Bid from Provider B: 8500 uakt/block
       └─ Bid from Provider C: 9200 uakt/block
```

### Stage 4: Accept Bid & Create Lease

**What you do:**
- Review bids (price, provider reputation, location)
- Accept your preferred bid

**What happens:**
1. Lease created on blockchain
2. Order closes (no more bids accepted)
3. Resources are permanently reserved on the provider
4. Deployment status: `active`
5. Lease status: `active`

**Note:** When providers submit bids, they temporarily hold the resources. If their bid is not accepted, the resources are released. Once you accept a bid and create a lease, the resources are permanently reserved until the deployment closes.

**Blockchain state:**
```
Deployment #123456
  Status: ACTIVE
  └─ Lease with Provider B
       Price: 8500 uakt/block
       Status: ACTIVE
```

### Stage 5: Send Manifest

**What you do:**
- Upload manifest to provider

**What happens:**
1. Provider receives detailed deployment spec
2. Provider pulls container images
3. Provider starts containers
4. Services become accessible

**Timeline:** Containers typically start within 30-60 seconds

### Stage 6: Running

**What happens automatically:**
- Escrow pays provider per block (~6 seconds)
- Containers run on provider infrastructure
- Services are accessible via provider endpoints

**What you can do:**
- Access your services
- View logs
- Update deployment (limited changes)
- Monitor escrow balance

**Escrow payment:**
```
Block 1: Escrow 5.0 AKT → Pay 0.00085 AKT → Remaining 4.99915 AKT
Block 2: Escrow 4.99915 AKT → Pay 0.00085 AKT → Remaining 4.99830 AKT
...continues until deployment closed or escrow depleted
```

### Stage 7: Closure

**How deployments end:**

**Option A: You close it**
- Submit close transaction
- Containers stop
- Unused escrow returned to you
- Lease status: `closed`

**Option B: Escrow runs out**
- Automatic closure when escrow hits zero
- Containers stop immediately
- Lease status: `insufficient_funds`

**Option C: Provider closes**
- Provider can close lease (rare)
- Unused escrow returned to you
- Lease status: `closed`

**Final state:**
```
Deployment #123456
  Status: CLOSED
  └─ Lease with Provider B
       Status: CLOSED
       Duration: 5000 blocks (~8.3 hours)
       Total cost: 4.25 AKT
       Refunded: 0.75 AKT
```

---

## Deployment States

### On Blockchain

**Deployment States:**
- `open` - Created, waiting for lease
- `active` - Lease active, running
- `closed` - Terminated

**Order States:**
- `open` - Accepting bids
- `matched` - Lease created
- `closed` - No longer active

**Lease States:**
- `active` - Running
- `insufficient_funds` - Escrow depleted
- `closed` - Terminated

### On Provider

**Manifest Status:**
- `pending` - Manifest received, starting containers
- `running` - Containers active
- `error` - Failed to start
- `complete` - Stopped

---

## Escrow Accounts

### How Escrow Works

When you create a deployment, you fund an escrow account:

1. **Deposit:** You transfer AKT/USDC to escrow (minimum 0.5)
2. **Payments:** Provider automatically paid per block from escrow
3. **Refund:** When you close, unused escrow returned to your wallet

### Escrow Calculations

**Formula:**
```
Cost per block = (bid_price) uakt
Blocks per hour = 600 (at 6 seconds per block)
Blocks per day = 14,400
Blocks per month ≈ 432,000
```

**Example:**
```
Bid price: 10,000 uakt per block
Cost per hour: 10,000 × 600 = 6,000,000 uakt = 0.006 AKT
Cost per day: 0.006 × 24 = 0.144 AKT
Cost per month: 0.144 × 30 = 4.32 AKT
```

**Escrow planning:**
```
Deployment duration: 7 days
Cost per day: 0.144 AKT
Total needed: 0.144 × 7 = 1.008 AKT
Recommended escrow: 1.5 AKT (48% buffer)
```

### Monitoring Escrow

**Check balance:**
- Console: View deployment details
- CLI: Query deployment status

**Low balance warning:**
- No automatic alerts from Akash
- Implement your own monitoring
- Set reminders to check balance

**Adding funds:**
- You can deposit additional AKT to existing escrow
- Use CLI: `provider-services tx deployment deposit` command
- Use Console: View deployment → Add funds
- Plan initial escrow generously to minimize need for top-ups

---

## Deployment Updates

### What CAN Be Updated

**Container image tag:**
```yaml
# Before
image: myapp:v1.0

# After update
image: myapp:v1.1
```

**Environment variables:**
```yaml
# Before
env:
  - NODE_ENV=development

# After update
env:
  - NODE_ENV=production
```

**Command and arguments:**
```yaml
# Before
command: ["npm"]
args: ["start"]

# After update
command: ["npm"]
args: ["run", "prod"]
```

### What CANNOT Be Updated

**Resource requirements** (CPU, memory, storage, GPU)

**Service count** (replicas)

**Port configurations**

**Storage attributes**

**Provider/Lease** (tied to specific provider)

**To change these:** Close deployment and create new one

### Update Process

**Console:**
1. Click "Update Deployment"
2. Modify SDL
3. Save and deploy

**CLI:**
```bash
# Update deployment
provider-services tx deployment update deploy-updated.yml \
  --dseq <deployment-id> \
  --from <wallet> \
  --chain-id akashnet-2 \
  --gas auto \
  --gas-adjustment 1.5
```

**What happens:**
1. New SDL hash recorded on blockchain
2. Updated manifest sent to provider
3. Provider re-pulls images if changed
4. Containers restart with new configuration
5. Brief downtime during restart (~10-30 seconds)

---

## Multi-Group Deployments

Advanced: You can deploy multiple service groups with one deployment:

```yaml
deployment:
  frontend:
    akash:
      profile: frontend
      count: 1
  backend:
    akash:
      profile: backend
      count: 1
```

Each group:
- Gets its own order (OSEQ)
- Can have different providers
- Independent lease lifecycle
- Separate pricing

**DSEQ structure:**
```
Deployment #123456
  ├─ Order 1 (frontend)
  │    ├─ Bid from Provider A
  │    └─ Lease with Provider A
  └─ Order 2 (backend)
       ├─ Bid from Provider B
       └─ Lease with Provider B
```

---

## Common Patterns

### Long-Running Services

For services that should run indefinitely:

```yaml
# High escrow deposit
# Monitor balance regularly
# Set up external monitoring
# Have update/restart strategy
```

**Escrow recommendation:** 30-90 days worth

### Temporary/Test Deployments

For short-term testing:

```yaml
# Minimal escrow (just enough for test duration)
# Use sandbox network
# Close promptly after testing
```

**Escrow recommendation:** Hours to days worth

### Batch Jobs

For one-time compute jobs:

```yaml
# Calculate job duration
# Fund escrow accordingly
# Close immediately after completion
```

**Tip:** Monitor logs to detect completion, then close

---

## Troubleshooting

### No Bids Received

**Possible causes:**
1. **Price too low** - Increase maximum price in SDL
2. **Resources unavailable** - Reduce requirements or change specs
3. **Invalid SDL** - Check SDL syntax
4. **Network issues** - Try different network (mainnet vs sandbox)
5. **Restricted to audited providers** - Remove or adjust `signedBy` field if you're limiting deployment to only audited providers

**Solution:** Close order, adjust SDL, redeploy

### Deployment Won't Start

**Possible causes:**
1. **Invalid manifest** - Provider can't parse your config
2. **Image pull failure** - Wrong image name or private without credentials
3. **Resource allocation failure** - Provider overcommitted

**Solution:** Check provider logs, verify SDL, contact provider

### Escrow Depleted Unexpectedly

**Cause:** Underestimated costs or higher bid price than expected

**Prevention:**
- Add 50-100% buffer to escrow estimates
- Monitor balance regularly
- Set up external alerts

**Recovery:** Close and redeploy with more escrow

### Can't Access Services

**Possible causes:**
1. **Containers not started** - Check provider status
2. **Wrong endpoint** - Verify service URL
3. **Port configuration** - Check expose settings in SDL
4. **Provider networking** - Contact provider

**Solution:** Check logs, verify configuration, test connectivity

---

## Best Practices

### Planning

**Calculate escrow needs accurately**
- Estimate duration
- Add 50-100% buffer
- Account for potential overruns

**Test on sandbox first**
- Validate SDL
- Test deployment process
- Estimate costs

**Document your deployments**
- Save SDL files
- Record DSEQ numbers
- Note provider addresses

### Monitoring

**Check regularly:**
- Escrow balance
- Service health
- Provider uptime
- Resource usage

**Set up external monitoring:**
- Uptime monitoring (UptimeRobot, Pingdom)
- Log aggregation (if needed)
- Cost tracking

### Maintenance

**Update images regularly**
- Security patches
- Bug fixes
- Feature updates

**Plan for migrations**
- Have backup provider list
- Document migration process
- Test recovery procedures

---

## Advanced Topics

### Deployment Automation

Automate deployments with CLI/SDK:
- CI/CD integration
- Scheduled deployments
- Auto-scaling (via redeploy)
- Monitoring-driven updates

### Cost Optimization

Strategies to reduce costs:
- Accept lowest bid automatically
- Right-size resources
- Use sandbox for development
- Close deployments when not needed
- Batch similar workloads

### High Availability

For production services:
- Deploy to multiple providers
- Use external load balancer
- Implement health checks
- Have failover procedures
- Monitor continuously

---

## Related Topics

- [Providers & Leases](/docs/learn/core-concepts/providers-leases) - Choosing and working with providers
- [SDL Reference](/docs/developers/deployment/akash-sdl) - Complete SDL documentation

---

**Need help?** Ask in [Discord](https://discord.akash.network) #deployments channel!

