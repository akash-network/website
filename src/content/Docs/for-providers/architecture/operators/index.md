---
categories: ["For Providers"]
tags: ["Architecture", "Operators"]
weight: 5
title: "Operators"
linkTitle: "Operators"
description: "Kubernetes operators that extend provider functionality"
---

Akash Provider uses Kubernetes operators to extend cluster functionality and manage custom resources. These operators run as separate services and communicate with the provider via Kubernetes Custom Resource Definitions (CRDs).

## In This Section

### [Inventory Operator](/docs/for-providers/architecture/operators/inventory)
Discovers and tracks cluster resources (CPU, GPU, memory, storage) in real-time.

### [IP Operator](/docs/for-providers/architecture/operators/ip)
Manages static IP address allocation for deployments via MetalLB integration.

### [Hostname Operator](/docs/for-providers/architecture/operators/hostname)
Manages custom hostname assignments and creates ingress resources for deployments.

## What Are Operators?

Kubernetes operators are applications that extend Kubernetes functionality by:

1. **Watching Custom Resources** - Monitor CRDs for changes
2. **Reconciliation** - Compare desired state with actual state  
3. **Taking Action** - Create/update/delete Kubernetes resources
4. **Continuous Monitoring** - Ensure state consistency

## Akash Operators

### Inventory Operator

**Purpose:** Resource discovery and tracking

**Key Features:**
- Discovers cluster resources (CPU, GPU, storage)
- Tracks resource availability in real-time
- Supports hardware feature discovery (GPU models, storage classes)
- Integrates with NVIDIA Device Plugin for GPUs
- Updates Kubernetes node labels with capabilities
- Publishes inventory to provider service for bidding

**When It Runs:** Continuously, updates on hardware changes

### IP Operator

**Purpose:** Static IP address management

**Key Features:**
- Allocates dedicated IP addresses for deployments
- Integrates with MetalLB for IP allocation
- Supports IP sharing across services (same tenant)
- Tracks IP pool usage and availability
- Handles IP lifecycle (create, update, delete)
- Exposes HTTP API for monitoring

**When It Runs:** Event-driven, responds to ProviderLeasedIP CRDs

### Hostname Operator

**Purpose:** Custom hostname and ingress management

**Key Features:**
- Manages custom hostname assignments
- Creates Kubernetes Ingress resources automatically
- Integrates with ingress controllers (Ingress-NGINX, Traefik)
- Handles hostname conflicts and validation
- Supports wildcard hostnames
- Monitors hostname health

**When It Runs:** Event-driven, responds to ProviderHost CRDs

## How Operators Integrate

```
+--------------------------------------------------+
|              Provider Service                    |
|  +-------------------------------------------+   |
|  |         Cluster Service                   |   |
|  |  - Creates CRDs (ProviderHost, etc.)      |   |
|  |  - Calls operator client interfaces       |   |
|  +-------------------+-----------------------+   |
+--------------------+--------------------------+
                     |
                     | Creates CRDs
                     v
            +--------------------+
            |   Kubernetes API   |
            |   (CRD Storage)    |
            +---------+----------+
                      |
                      | Watch Events
                      |
       +--------------+--------------+--------------+
       |              |              |              |
       v              v              v              v
+----------+   +----------+   +----------+   +----------+
|Inventory |   |    IP    |   | Hostname |   |  Other   |
|Operator  |   | Operator |   | Operator |   |Operators |
+----------+   +----------+   +----------+   +----------+
       |              |              |              |
       |              |              |              |
       v              v              v              v
+-----------------------------------------------------+
|           Kubernetes Resources                      |
|  - Nodes, Pods                                      |
|  - Services, Ingress                                |
|  - MetalLB IPAddressPools                           |
+-----------------------------------------------------+
```

## Operator Communication

### Via CRDs (Custom Resource Definitions)

Operators watch for CRD changes:

- **ProviderHost** - Hostname assignments
- **ProviderLeasedIP** - IP allocations
- **Manifest** - Deployment specifications

### Via gRPC

Operators expose gRPC services for programmatic access to inventory, status, and state information.

### Via Event Bus (PubSub)

Operators publish events:

- `inventory.cluster` - Resource availability updates
- `inventory.nodes` - Node hardware changes
- `inventory.storage` - Storage capacity updates

## Related Documentation

- [Provider Service Overview](/docs/for-providers/architecture/overview) - High-level architecture
- [Cluster Service](/docs/for-providers/architecture/cluster-service) - Resource management
- [Bid Engine](/docs/for-providers/architecture/bid-engine) - Bidding logic
- [Manifest Service](/docs/for-providers/architecture/manifest-service) - Manifest handling

