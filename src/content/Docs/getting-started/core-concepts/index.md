---
categories: ["Getting Started"]
tags: ["Concepts", "Basics"]
weight: 2
title: "Core Concepts"
linkTitle: "Core Concepts"
description: "Quick introduction to key Akash concepts"
---

**Learn the basics of how Akash Network works in 5 minutes.**

---

## How Akash Works

Akash is a decentralized marketplace connecting people who need compute resources with data centers that provide them.

```
You create a deployment → Providers bid → You accept a bid → Your app runs
```

---

## Key Terms

### Deployment
A request for compute resources. You describe what you need (CPU, memory, storage) using SDL (Stack Definition Language).

### Provider
A data center offering compute resources on Akash. Providers bid competitively to host your deployment.

### Lease
An agreement between you and a provider. Locks in pricing and resources for your deployment.

### SDL
Stack Definition Language - a YAML file that describes your deployment:
- What container image to run
- How much CPU, memory, and storage you need
- What ports to expose
- How much you're willing to pay

### Escrow
Funds held to pay for your deployment. Provider is paid automatically per block from your escrow account.

---

## Basic Workflow

### 1. Create Deployment
Write an SDL file describing your app and resources needed.

### 2. Review Bids
Providers submit bids with their pricing. Choose the one you prefer.

### 3. Accept Bid
Create a lease with the selected provider.

### 4. App Runs
Provider pulls your container image and starts your app.

### 5. Automatic Payment
Your escrow pays the provider per block (~6 seconds).

---

## Deployment Options

### Akash Console (Easiest)
- Visual web interface
- $100 free trial (no wallet needed)
- Perfect for beginners

### CLI (Most Control)
- Command-line interface
- Use your own wallet
- Best for automation

### SDK (Programmatic)
- JavaScript/TypeScript or Go
- Integrate into your apps
- Build custom tools

---

## Resource Units

- **CPU:** Measured in units (1 unit = 1 thread)
- **Memory:** Measured in Mi (Mebibytes) or Gi (Gibibytes)
- **Storage:** Measured in Mi or Gi
- **GPU:** Measured in units with specific model requirements

**Example:** `0.5` CPU, `512Mi` memory, `1Gi` storage

---

## Pricing

Akash is **significantly cheaper** than traditional cloud providers:

- **Basic web app:** ~$1-3/month
- **Small API:** ~$5-10/month
- **GPU workload (RTX 4090):** ~$50-150/month

Prices vary by provider and demand.

---

## What You Can Update

✅ **Container image version**  
✅ **Environment variables**  
✅ **Container commands**

❌ **CPU, Memory, Storage amounts** - Must create new deployment

---

## Learn More

Want to understand Akash in depth?

**[→ Detailed Core Concepts](/docs/learn/core-concepts)** - Deep dive into deployments, providers, SDL, private containers, persistent storage, IP leases, and more.

---

## Next Steps

- **[Quick Start →](/docs/getting-started/quick-start)** - Deploy your first app
- **[SDL Reference →](/docs/developers/deployment/akash-sdl)** - Learn SDL syntax
- **[Discord →](https://discord.akash.network)** - Get help from the community
