---
categories: ["For Providers"]
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
- **Ubuntu 24.04 LTS Server** (recommended)
- Ubuntu 22.04 LTS also supported
- Ensure all nodes are fully updated with latest security patches

### CPU Architecture
- **x86_64 processors only** (officially supported)
- ARM processors are **not currently supported**
- Applies to all nodes in the cluster

---

## Minimum Hardware Specifications

### Control Plane Node (per node)

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

### Worker Node (per node)

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
- Popular models: A100, H100, A40, RTX 4090, RTX 3090, T4, V100

### GPU Best Practices

**One GPU Type Per Node:**
- Each node should only support **one type of GPU**
- Mixing different GPU models on the same node is **not recommended**
- Multiple identical GPUs per node is fine

**Driver Requirements:**
- Latest NVIDIA drivers installed
- CUDA toolkit properly configured
- Container runtime GPU support enabled

**Example Configurations:**
- **AI/ML Node:** 4x NVIDIA A100 (all same model)
- **Rendering Node:** 2x RTX 4090 (all same model)
- **Mixed Workload:** 8x T4 (all same model)

---

## Storage Guidelines

### Root/Ephemeral Storage
- **Minimum:** 100GB per worker node
- **Recommended:** 500GB+ per worker node
- **Type:** SSD or NVMe for performance

### Persistent Storage (Optional)

**Requirements:**
- All persistent storage must be **same type** across entire cluster
- **SSD or NVMe required** for optimal performance
- **Do not mix** storage types (e.g., SSD + HDD)

**Capacity:**
- **Minimum:** 1TB per node
- **Recommended:** 2TB+ per node
- **Scale based on** expected workload types

**Storage Classes:**
- `beta1` - Standard performance
- `beta2` - Enhanced performance
- `beta3` - Premium performance
- `ram` - In-memory storage

---

## Network Requirements

### Internet Connection

**Bandwidth:**
- **Minimum:** 100 Mbps symmetrical
- **Recommended:** 1 Gbps symmetrical
- **Critical:** Upload speed matters as much as download

**Latency:**
- Low latency preferred (< 50ms to major hubs)
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

### Firewall Rules

**Required Open Ports:**
- `8443/tcp` - Manifest uploads
- `30000-32767/tcp` - Kubernetes NodePort range
- `30000-32767/udp` - Kubernetes NodePort range (UDP services)

**Recommended:**
- `22/tcp` - SSH (restrict to your IPs)
- `6443/tcp` - Kubernetes API (control plane only)
- `80/tcp` and `443/tcp` - HTTP/HTTPS workloads

### Internal Network

**For Multi-Node Clusters:**
- Low-latency network between nodes (< 2ms)
- 10 Gbps+ recommended for storage traffic
- Separate VLANs for management, storage, and tenant traffic (optional but recommended)

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

## System Configuration

### DNS Configuration
- Set up A records for your provider domain
- Configure reverse DNS (PTR records) if possible
- Use subdomains for organization (e.g., `provider.yourdomain.com`)

### Time Synchronization
- NTP properly configured on all nodes
- Critical for certificate validation
- Recommended: Use multiple NTP servers

### Security
- Keep all systems updated
- Use SSH key authentication (disable password auth)
- Configure firewall rules properly
- Regular security audits
- Monitor for suspicious activity

---

## Performance Optimization

### CPU
- Disable CPU frequency scaling (use "performance" governor)
- Enable all CPU cores
- Consider CPU pinning for GPU workloads

### Memory
- Disable swap (Kubernetes best practice)
- Use ECC RAM for production environments
- Monitor memory usage closely

### Storage
- Use NVMe for best performance
- Enable TRIM for SSDs
- Regular disk health monitoring
- Consider RAID for redundancy

### Network
- Enable jumbo frames (MTU 9000) if supported
- Disable network power management
- Use bonded interfaces for redundancy
- QoS configuration for priority traffic

---

## Next Steps

**Previous:** [← Should I Run a Provider?](/docs/for-providers/getting-started/should-i-run-a-provider)  
**Next:** [Cost Analysis →](/docs/for-providers/getting-started/cost-analysis)

Or jump to:
- [Quick Setup →](/docs/for-providers/getting-started/quick-setup)
- [Setup & Installation →](/docs/for-providers/setup-and-installation)

