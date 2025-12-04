---
categories: ["Learn", "Core Concepts"]
tags: ["Providers", "Leases", "Bidding", "Provider Selection"]
weight: 2
title: "Providers & Leases"
linkTitle: "Providers & Leases"
description: "Understanding Akash providers, bidding, and lease management"
---

**Learn how to choose providers and manage leases on Akash Network.**

Providers are the backbone of Akash Network - they're the data centers that host your applications. Understanding how providers work, how to evaluate them, and how to manage leases is essential for successful deployments.

---

## What is a Provider?

A **provider** is a data center or infrastructure operator that offers compute resources on Akash Network.

**Providers offer:**
- CPU and GPU compute
- Memory (RAM)
- Storage (persistent and ephemeral)
- Network connectivity
- Optional features (IP leases, persistent storage)

**Providers compete on:**
- Price
- Performance
- Reliability
- Location
- Features

---

## How Providers Work

### Provider Registration

Providers register on Akash blockchain:
1. Stake AKT tokens as collateral
2. Publish their resource capacity
3. Set pricing models
4. Define attributes (location, features, certifications)
5. Run provider software to monitor orders

### Bidding Process

When you create a deployment:

1. **Order posted** - Your resource requirements published on blockchain
2. **Providers evaluate** - Each provider checks if they can fulfill the order
3. **Automated bidding** - Qualifying providers submit bids automatically
4. **You choose** - Review bids and select preferred provider
5. **Lease created** - Agreement finalized on blockchain

**Bidding happens fast:** Most bids arrive within 30-120 seconds

---

## Provider Attributes

Providers publish attributes to help you make informed decisions:

### Location

```
region: us-west
datacenter: equinix-sv15
city: San Jose
country: US
```

**Why it matters:**
- Latency to your users
- Data sovereignty requirements
- Disaster recovery planning

### Capabilities

```
persistent-storage: true
ip-leases: true
gpu: true
```

**Common capabilities:**
- `persistent-storage` - Can provide persistent volumes
- `ip-leases` - Offers dedicated IP addresses
- `gpu` - Has GPU resources available

### Hardware

```
cpu: AMD EPYC 7643
gpu: NVIDIA RTX 4090
network: 10Gbps
```

**Specifications:**
- CPU model and generation
- GPU models available
- Network capacity
- Storage type (HDD/SSD/NVMe)

### Certifications

```
audited: true
tier: premium
uptime-guarantee: 99.9%
```

**Trust indicators:**
- Security audits
- Tier classification
- SLA commitments
- Community reputation

---

## Choosing a Provider

### Evaluation Criteria

#### 1. Price

**Check:**
- Bid price per block
- Total estimated monthly cost
- IP lease costs (if needed)
- Persistent storage costs (if needed)

**Strategy:**
- Lowest isn't always best
- Balance cost with reliability
- Consider total cost of ownership

#### 2. Reputation

**Check:**
- Provider uptime history
- Community feedback in Discord
- Active lease count
- Time in operation

**Red flags:**
- Brand new provider (no history)
- Frequent downtime reports
- Negative community feedback
- Suspiciously low prices

#### 3. Location

**Consider:**
- Proximity to your users
- Compliance requirements (GDPR, data residency)
- Latency requirements
- Backup/DR location diversity

**Example:**
- US users → US-based provider
- EU users with GDPR → EU-based provider
- Global app → Multiple providers in different regions

#### 4. Features

**Match your needs:**
- Need persistent storage? → Check `persistent-storage: true`
- Need dedicated IP? → Check `ip-leases: true`
- Need GPU? → Check `gpu: true` and specific models
- Need high bandwidth? → Check network capacity

#### 5. Performance

**Consider:**
- CPU generation and model
- Storage type (NVMe > SSD > HDD)
- Network speed
- GPU models (for GPU workloads)

---

## Understanding Bids

### Bid Components

When you receive a bid, it includes:

```
Provider: akash1abc...xyz
Price: 8,500 uakt/block
Location: US-West
Attributes:
  - persistent-storage: true
  - region: us-west
  - tier: premium
```

### Price Calculation

**Bid price is per block (~6 seconds):**

```
Bid: 10,000 uakt/block

Hourly cost: 10,000 × 600 blocks = 6,000,000 uakt = 0.006 AKT
Daily cost: 0.006 × 24 = 0.144 AKT
Monthly cost: 0.144 × 30 = 4.32 AKT
```

**At $2.50/AKT:** ~$10.80/month

### Comparing Bids

**Example bids for same deployment:**

| Provider | Price | Location | Storage | IP Lease | Monthly |
|----------|-------|----------|---------|----------|---------|
| Provider A | 8,500 | US-West | Yes | Yes | $9.18 |
| Provider B | 9,200 | US-East | Yes | No | $9.94 |
| Provider C | 7,800 | EU-Central | No | Yes | $8.42 |
| Provider D | 12,000 | US-West | Yes | Yes | $12.96 |

**Decision factors:**
- Provider A: Good price, all features, good location
- Provider B: Slightly more, no IP lease
- Provider C: Cheapest, but no persistent storage (dealbreaker if you need it)
- Provider D: Most expensive, but might be worth it for premium tier/reputation

---

## Lease Management

### Creating a Lease

**Process:**
1. Review available bids
2. Select preferred provider
3. Submit lease creation transaction
4. Wait for lease confirmation (~6 seconds)
5. Upload manifest to provider

**Console:** Click "Accept" on your chosen bid
**CLI:**
```bash
provider-services tx market lease create \
  --dseq <deployment-id> \
  --provider <provider-address> \
  --from <wallet>
```

### Active Lease

Once lease is active:

**Your responsibilities:**
- Monitor escrow balance
- Pay gas fees for updates
- Close lease when done

**Provider responsibilities:**
- Run your containers
- Maintain uptime
- Process manifest updates
- Accept escrow payments

### Lease States

**`active`** - Running normally
- Containers active
- Escrow being paid
- Services accessible

**`insufficient_funds`** - Escrow depleted
- Containers stopped
- Lease still exists but inactive
- Cannot restart without new deployment

**`closed`** - Terminated
- You closed it
- Provider closed it
- Permanent end state

---

## Provider Communication

### Manifest Upload

After lease creation, you send the manifest to the provider:

**What it includes:**
- Full service specifications
- Environment variables
- Port configurations
- Image pull credentials (if private)

**How it's sent:**
- Direct HTTPS to provider endpoint
- Authenticated with JWT or mTLS certificate
- Not stored on blockchain

**Provider endpoint:**
```
https://provider.akash.network:8443/
```

### Service Endpoints

Provider gives you URLs to access services:

```
https://5g8qj7kl3m-8080.provider.akash.network
```

**Format:**
- Unique subdomain per service
- Provider's domain
- Port number
- HTTPS by default

### Logs and Status

**Access logs:**
- Console: View logs in UI
- CLI: Query provider directly
- SDK: Programmatic log access

**Check status:**
- Service health
- Container state
- Resource usage
- Recent events

---

## Provider Selection Strategies

### Strategy 1: Lowest Price

**When to use:**
- Cost-sensitive workloads
- Non-critical applications
- Development/testing

**Approach:**
1. Sort bids by price
2. Accept lowest bid
3. Monitor performance

**Risk:** May sacrifice reliability for cost

### Strategy 2: Best Reputation

**When to use:**
- Production applications
- Business-critical workloads
- Long-running services

**Approach:**
1. Research providers in Discord
2. Check uptime history
3. Prioritize established providers
4. Accept higher cost for reliability

**Benefit:** Higher reliability, better support

### Strategy 3: Geographic Optimization

**When to use:**
- Latency-sensitive applications
- Compliance requirements
- Multi-region deployments

**Approach:**
1. Filter by location
2. Choose closest to users
3. Consider data residency laws

**Example:** EU app with GDPR → EU-based provider only

### Strategy 4: Feature Requirements

**When to use:**
- Specific technical needs
- GPU workloads
- Persistent storage requirements

**Approach:**
1. Filter by required attributes
2. Eliminate providers without needed features
3. Choose among qualified providers

**Example:** Need NVIDIA A100 GPU → Filter for that specific model

---

## Multi-Provider Deployments

For high availability, deploy to multiple providers:

### Load Balancing

```
       ┌──────────────┐
       │ Load Balancer│
       │ (External)   │
       └───────┬──────┘
               │
       ┌───────┴────────┐
       │                │
   ┌───▼───┐       ┌───▼───┐
   │Prov. A│       │Prov. B│
   │US-West│       │US-East│
   └───────┘       └───────┘
```

**Benefits:**
- Redundancy
- Geographic distribution
- Load distribution
- Zero-downtime updates

**Challenges:**
- More complex setup
- Higher costs
- Need external load balancer
- Shared state management

---

## Provider Issues & Troubleshooting

### Provider Downtime

**Symptoms:**
- Services inaccessible
- Logs show "connection refused"
- Manifest queries fail

**What to do:**
1. Check provider status in Discord
2. Wait 15-30 minutes (may be temporary)
3. If persistent, close and redeploy to different provider

**Prevention:** Multi-provider deployment

### Performance Issues

**Symptoms:**
- Slow response times
- High latency
- Resource constraints

**Diagnosis:**
1. Check logs for resource limits
2. Monitor resource usage
3. Compare with provider's advertised specs

**Solutions:**
- Increase resources (requires redeploy)
- Move to different provider
- Optimize application

### Provider Not Responding

**Symptoms:**
- Cannot upload manifest
- Cannot query logs/status
- No response from provider API

**What to do:**
1. Verify provider endpoint
2. Check certificate/authentication
3. Try from different network
4. Contact provider in Discord
5. If no response within 24h, close lease and redeploy

---

## Provider Economics

### Provider Revenue Model

Providers earn from:
- Base compute charges (per block)
- IP lease fees
- Persistent storage fees
- Premium tier pricing

### Provider Costs

Providers pay for:
- Hardware and infrastructure
- Electricity
- Maintenance
- Staff/Operations
- AKT token stake

### Competitive Dynamics

**Market forces:**
- More providers = lower prices
- Unique features = premium pricing
- Reputation = price premium
- Location scarcity = higher prices

**Example:**
- GPU providers can charge 3-10x CPU-only pricing
- EU providers may charge premium for GDPR compliance
- Established providers command loyalty premium

---

## Best Practices

### Selection

✅ **DO:**
- Research providers before accepting bids
- Check community feedback
- Verify required features are available
- Test with small deployment first
- Document your provider choices

❌ **DON'T:**
- Always choose cheapest bid
- Ignore provider reputation
- Skip attribute verification
- Deploy production to unknown providers

### Management

✅ **DO:**
- Monitor lease health regularly
- Keep provider contact info
- Have backup provider list
- Plan migration procedures
- Test failover scenarios

❌ **DON'T:**
- Ignore provider downtime warnings
- Let escrow run out unexpectedly
- Deploy without backup plan
- Assume all providers are equal

### Communication

✅ **DO:**
- Join provider Discord channels
- Report issues constructively
- Provide clear error information
- Be patient with provider responses

❌ **DON'T:**
- Expect 24/7 instant support
- Be hostile or demanding
- Ignore provider announcements
- Skip troubleshooting steps

---

## Provider Ecosystem

### Provider Types

**Tier 1 - Established**
- Long operating history (6+ months)
- High uptime (>99%)
- Active community presence
- Professional support

**Tier 2 - Growing**
- Moderate history (1-6 months)
- Good uptime (>95%)
- Building reputation
- Responsive to issues

**Tier 3 - New/Experimental**
- Recently launched (<1 month)
- Unknown reliability
- Lower prices to attract users
- Higher risk

### Finding Providers

**Resources:**
- [Akash Stats](https://stats.akash.network) - Provider list and metrics
- [Discord](https://discord.akash.network) - Provider announcements
- Provider Console - Direct provider management
- Community reviews - #providers channel

---

## Advanced Topics

### Provider APIs

Providers expose REST/gRPC APIs:
- Manifest submission
- Status queries
- Log streaming
- Shell access (some providers)

### Provider Attributes Deep Dive

Custom attributes for filtering:
```yaml
placement:
  requirements:
    attributes:
      - key: region
        value: us-west
      - key: tier
        value: premium
      - key: persistent-storage
        value: true
```

### Provider Economics for Deployers

Maximize value:
- Batch similar workloads to one provider
- Commit to longer leases (negotiate if possible)
- Use off-peak pricing (some providers)
- Bundle services for discounts

---

## Related Topics

- [Deployments & Lifecycle](/docs/learn/core-concepts/deployments) - Understanding deployments
- [Pricing & Economics](/docs/learn/core-concepts/pricing) - Cost calculations
- [IP Leases](/docs/learn/core-concepts/ip-leases) - Dedicated IP addresses
- [Persistent Storage](/docs/learn/core-concepts/persistent-storage) - Data persistence

---

**Questions about providers?** Ask in [Discord](https://discord.akash.network) #providers channel!

