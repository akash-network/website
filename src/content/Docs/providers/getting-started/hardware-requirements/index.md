---
categories: ["Providers"]
tags: ["Hardware", "Requirements", "Infrastructure"]
weight: 2
title: "Provider Hardware Requirements"
linkTitle: "Hardware Requirements"
description: "Detailed hardware specifications and best practices for Akash providers"
---

**Understand the hardware requirements for running a successful Akash provider.**

This guide covers system requirements, hardware specifications, and best practices.

---

## System Requirements

### Operating System
- **Ubuntu 24.04 LTS Server** (officially supported)
- Ensure all nodes are fully updated with latest security patches

### CPU Architecture
- **x86_64 processors only** (officially supported)
- ARM processors are **not currently supported**
- Applies to all nodes in the cluster

---

## Minimum Hardware Specifications

### Single Server (Worker + Control Plane Combined)

**Minimum:**
- CPU: 8 cores
- RAM: 16GB
- Storage: 150GB SSD

**Recommended:**
- CPU: 12+ cores
- RAM: 48+ GB
- Storage: 500GB+ SSD

**Important Considerations:**
- Reserve ~4 CPU cores for Kubernetes system components (control plane + worker overhead)
- Single server setup is good for testing or small providers
- For production, separate control plane and worker nodes are recommended

### Control Plane Node (per node, separate setup)

**Minimum:**
- CPU: 2 cores
- RAM: 4GB
- Storage: 30GB SSD

**Recommended:**
- CPU: 4 cores
- RAM: 8GB
- Storage: 40GB SSD

**For Production (3-node control plane):**
- 3x control plane nodes for high availability
- Total: 12 CPU cores, 24GB RAM, 120GB storage

### Worker Node (per node, separate setup)

**Minimum:**
- CPU: 4 cores
- RAM: 8GB
- Storage: 100GB SSD

**Recommended:**
- CPU: 8+ cores
- RAM: 32+ GB
- Storage: 500GB+ SSD

**Important Considerations:**
- Reserve ~2 CPU cores for Kubernetes system components
- More resources = more concurrent deployments
- **Example:** 8 CPU node = ~6 deployments (8 CPU - 2 reserved)

---

## GPU Requirements

### Supported GPUs
- **NVIDIA GPUs only** currently supported

### GPU Requirements & Best Practices

**One GPU Type Per Node (Required):**
- Each node **must** have only **one type of GPU**
- Mixing different GPU models on the same node is **not supported**
- Multiple identical GPUs per node is supported and recommended

**One GPU Type Per Provider (Recommended):**
- While technically possible to have different GPU types across nodes, it is **strongly recommended** to standardize on one GPU type per provider
- Having multiple GPU types in one provider (on different nodes) can complicate operations and pricing

**Example Configurations:**
- **AI/ML Node:** 4x NVIDIA A100 (all identical)
- **Rendering Node:** 2x RTX 4090 (all identical)
- **Mixed Workload:** 8x T4 (all identical)

---

## Storage Guidelines

### Root/Ephemeral Storage
- **Minimum:** 100GB per worker node
- **Recommended:** 500GB+ per worker node
- **Type:** SSD or NVMe for performance

### Persistent Storage (Optional)

**Minimum Requirements:**
- **Option 1:** 4 SSDs across all nodes (minimum)
- **Option 2:** 2 NVMe SSDs across all nodes (minimum)
- All persistent storage must be **same type** across entire cluster
- **Do not mix** storage types (e.g., SSD + NVMe, or beta2 + beta3)

**Dedicated Drives:**
- These drives must be **dedicated exclusively** to persistent storage
- Cannot be used for any other purpose (no OS, no ephemeral storage)
- **Recommended:** Distribute dedicated drives across multiple nodes for redundancy

**Storage Classes:**
- `beta1` - HDD (Hard Disk Drive)
- `beta2` - SSD (Solid State Drive)
- `beta3` - NVMe (Non-Volatile Memory Express)

**Example Configurations:**
- **Minimum SSD:** 4x 1TB SSDs across 2-4 nodes (beta2)
- **Minimum NVMe:** 2x 2TB NVMe drives across 2 nodes (beta3)
- **Recommended:** 6+ drives distributed across 3+ nodes for better redundancy

---

## Network Requirements

### Internet Connection

**Bandwidth:**
- **Minimum:** 100 Mbps symmetrical
- **Recommended:** 1+ Gbps symmetrical
- **Critical:** Upload speed matters as much as download

**Latency:**
- Low latency preferred (< 10ms to major hubs)
- Affects bid competitiveness
- Important for real-time workloads

### IP Addressing

**Required:**
- **Option 1:** At least one static public IP
- **Option 2:** Dynamic DNS (DDNS) service

**Optional (for IP leases feature):**
- Multiple static IPs
- /29 subnet or larger
- Allows providers to offer dedicated IPs to tenants

### Domain Name (Required)

**You must own a domain name for your Akash provider:**
- A registered domain that you control (e.g., `yourdomain.com`)
- Used for provider identification and workload routing
- DNS A records will point to your provider's public IP

### Firewall Rules

**Required Open Ports:**
- `80/tcp` - HTTP workloads
- `443/tcp` - HTTPS workloads
- `8443/tcp` - Manifest uploads
- `8444/tcp` - Provider gRPC
- `30000-32767/tcp` - Kubernetes NodePort range
- `30000-32767/udp` - Kubernetes NodePort range (UDP services)

**Recommended:**
- `22/tcp` - SSH (restrict to your IPs)
- `6443/tcp` - Kubernetes API (control plane only, restrict to cluster nodes)

### Internal Network

**For Multi-Node Clusters:**
- Low-latency network between nodes (< 1ms)
- 10 Gbps+ recommended for storage traffic

---

## Cluster Sizing Examples

### Small Provider (Home Lab)
**Hardware:**
- 1 control plane node: 4 CPU, 8GB RAM, 100GB SSD
- 1 worker node: 8 CPU, 32GB RAM, 500GB SSD

**Capacity:**
- ~6 concurrent deployments
- No GPU support
- 100-200GB ephemeral storage

**Cost:** ~$500-1,000 initial + $30-50/month

---

### Medium Provider (Small Data Center)
**Hardware:**
- 3 control plane nodes: 4 CPU, 8GB RAM, 100GB SSD each
- 3 worker nodes: 16 CPU, 64GB RAM, 1TB SSD each

**Capacity:**
- ~40 concurrent deployments
- Optional: 1-2 GPUs per worker
- 1TB+ persistent storage

**Cost:** ~$5,000-10,000 initial + $200-500/month

---

### Large Provider (Data Center)
**Hardware:**
- 3 control plane nodes: 8 CPU, 16GB RAM, 200GB SSD each
- 10+ worker nodes: 32 CPU, 128GB RAM, 2TB NVMe each
- Dedicated GPU nodes: 8 CPU, 64GB RAM, 4x A100 GPUs

**Capacity:**
- 200+ concurrent deployments
- 20+ GPU instances
- 10TB+ persistent storage

**Cost:** ~$50,000-200,000 initial + $2,000-10,000/month

---

## Next Steps

**Previous:** [← Should I Run a Provider?](/docs/providers/getting-started/should-i-run-a-provider)  
**Next:** [Setup & Installation →](/docs/providers/setup-and-installation)

Calculate earnings:
- [Provider Earn Calculator →](https://akash.network/pricing/provider-calculator/)

