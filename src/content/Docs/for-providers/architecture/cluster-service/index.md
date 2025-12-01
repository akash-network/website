---
categories: ["For Providers"]
tags: ["Architecture", "Provider"]
title: "Cluster Service"
linkTitle: "Cluster Service"
weight: 3
description: "Manages Kubernetes resources, deployments, and reservation lifecycle"
---

The Cluster Service is the core orchestration component that manages the provider's Kubernetes cluster. It handles resource reservations, deployment lifecycle, hostname management, and inventory tracking.

## Purpose

The Cluster Service acts as the bridge between Akash blockchain events and Kubernetes resources by:

1. **Resource Reservation** - Reserves cluster resources when bidding on orders
2. **Deployment Management** - Creates and updates tenant deployments
3. **Hostname Tracking** - Manages custom hostname assignments
4. **Inventory Synchronization** - Tracks available resources in real-time
5. **Lease Lifecycle** - Monitors lease state and handles cleanup

## Architecture

### Service Structure

**Implementation**: `cluster/service.go`

```go
type service struct {
    session session.Session
    client  Client
    bus     pubsub.Bus
    sub     pubsub.Subscriber
    
    inventory *inventoryService
    hostnames *hostnameService
    
    managers  map[mtypes.LeaseID]*deploymentManager
    managerch chan *deploymentManager
    
    config Config
}
```

### Key Components

1. **Inventory Service** - Tracks available cluster resources
2. **Hostname Service** - Manages custom hostname reservations
3. **Deployment Managers** - One per active lease, manages Kubernetes resources
4. **Event Bus** - Receives blockchain events (lease won, manifest received)
5. **Kubernetes Client** - Interacts with cluster API

## Service Initialization

### 1. Service Creation

The provider service creates the cluster service on startup:

**Source**: `service.go`

```go
cluster, err := cluster.NewService(
    ctx,
    session,
    bus,
    client,
    waiter,
    clusterConfig,
)
```

### 2. Configuration

Cluster configuration is loaded from provider settings:

```yaml
# provider.yaml
inventory-resource-poll-period: 5s
inventory-resource-debug-frequency: 10
cpu-commit-level: 1.0
memory-commit-level: 1.0
storage-commit-level: 1.0
blocked-hostnames:
  - ".internal.local"
deployment-ingress-domain: provider.example.com
deployment-ingress-static-hosts: true
```

**Configuration Parameters:**

- `inventory-resource-poll-period` - How often to poll inventory (default: 5s)
- `cpu-commit-level` - CPU overcommit ratio (1.0 = no overcommit)
- `memory-commit-level` - Memory overcommit ratio
- `storage-commit-level` - Storage overcommit ratio
- `blocked-hostnames` - List of blocked hostnames/domains
- `deployment-ingress-domain` - Provider's base domain
- `deployment-ingress-static-hosts` - Enable static hostname assignment

### 3. Initial State Discovery

On startup, the cluster service discovers existing state:

```bash
# Find existing deployments
deployments, err := findDeployments(ctx, log, client)

# Find existing hostnames
allHostnames, err := client.AllHostnames(ctx)

# Initialize inventory service
inventory, err := newInventoryService(ctx, cfg, log, sub, client, waiter, deployments)

# Initialize hostname service
hostnames, err := newHostnameService(ctx, cfg, activeHostnames)
```

**Rebuilds State From:**
- Kubernetes namespaces (pattern: `lease-*`)
- Existing ingress resources
- Active pods and services
- Persistent volumes

## Resource Reservation

### Reservation Process

When the bid engine decides to bid on an order:

```go
// 1. Bid engine requests reservation
reservation, err := cluster.Reserve(orderID, resourceGroup)

// 2. Inventory service checks availability
available := inventory.checkAvailability(resourceGroup)

// 3. Create reservation if resources available
if available {
    reservation = inventory.reserve(orderID, resourceGroup)
}

// 4. Reservation held until lease won or bid lost
```

### Reservation Lifecycle

```
Order Created
     ↓
Bid Placed → Reserve() → Resources Reserved
     ↓                          ↓
Lease Won                   Lease Lost
     ↓                          ↓
Deploy                     Unreserve()
```

### What Gets Reserved

**CPU & Memory:**
```yaml
resources:
  cpu: 1000m      # 1 CPU core
  memory: 2Gi     # 2 GB RAM
```

**Storage:**
```yaml
storage:
  - size: 10Gi
    class: beta3    # Or: default, beta2, beta1
```

**Endpoints:**
```yaml
expose:
  - port: 80
    as: 80
    to:
      - global: true  # Reserves external port
```

**GPUs:**
```yaml
resources:
  gpu:
    units: 1
    attributes:
      vendor:
        nvidia:
          - model: rtx4090
```

## Deployment Management

### Deployment Manager

Each active lease has a dedicated deployment manager:

**Implementation**: `cluster/manager.go`

```go
type deploymentManager struct {
    lease    mtypes.LeaseID
    mgroup   *manifest.Group
    state    deploymentState
    
    bus      pubsub.Bus
    client   Client
    session  session.Session
    
    updatech   chan *manifest.Group
    teardownch chan struct{}
}
```

### Deployment States

```go
const (
    dsDeployActive      = iota  // Running normally
    dsDeployPending             // Waiting for manifest
    dsDeployComplete            // Lease closed
    dsDeployError               // Error state
)
```

### Deployment Lifecycle

#### 1. Lease Won Event

When a lease is won, the cluster service creates a deployment manager:

```go
// Event received from blockchain
case event.ManifestReceived:
    leaseID := ev.LeaseID
    mgroup := ev.ManifestGroup()
    
    // Create deployment manager
    manager := newDeploymentManager(s, leaseID, mgroup, true)
    s.managers[leaseID] = manager
```

#### 2. Manifest Received

The deployment manager receives the manifest and deploys to Kubernetes:

```go
// Deployment manager processes manifest
func (dm *deploymentManager) deploy(mgroup *manifest.Group) error {
    // 1. Reserve hostnames
    withheldHostnames, err := dm.hostnameService.ReserveHostnames(...)
    
    // 2. Create Kubernetes resources
    err = dm.client.Deploy(dm.lease, mgroup)
    
    // 3. Publish event
    dm.bus.Publish(event.ManifestReceived{
        LeaseID: dm.lease,
        Group:   mgroup,
    })
}
```

#### 3. Kubernetes Resources Created

The Kubernetes client creates resources in the lease namespace:

**Namespace**: `lease-<owner>-<dseq>-<gseq>-<oseq>`

**Resources Created:**
- **Deployments** - For stateless services
- **StatefulSets** - For persistent storage services
- **Services** - ClusterIP, NodePort, LoadBalancer
- **Ingress** - For HTTP(S) endpoints
- **PersistentVolumeClaims** - For storage
- **ConfigMaps** - For environment variables
- **Secrets** - For sensitive data

#### 4. Deployment Update

When a tenant updates their deployment:

```go
case event.ManifestReceived:
    manager := s.managers[ev.LeaseID]
    if manager != nil {
        // Update existing deployment
        err := manager.update(ev.ManifestGroup())
    }
```

**Update Process:**
1. Parse new manifest
2. Compare with existing resources
3. Update changed resources
4. Rolling update for pods
5. Update hostname reservations

#### 5. Lease Closure

When a lease ends:

```go
// 1. Receive lease closed event
case event.LeaseClosed:
    manager := s.managers[ev.LeaseID]
    
    // 2. Teardown deployment
    manager.teardown()
    
    // 3. Delete Kubernetes resources
    client.TeardownLease(ev.LeaseID)
    
    // 4. Release hostnames
    hostnameService.ReleaseHostnames(ev.LeaseID)
    
    // 5. Unreserve inventory
    inventory.unreserve(ev.LeaseID.OrderID())
    
    // 6. Remove manager
    delete(s.managers, ev.LeaseID)
```

## Event Processing

The cluster service runs a perpetual event loop:

```go
func (s *service) run(ctx context.Context, deployments []Deployment) {
    // Create managers for existing deployments
    for _, deployment := range deployments {
        manager := newDeploymentManager(s, deployment.LeaseID(), ...)
        s.managers[deployment.LeaseID()] = manager
    }
    
    // Event loop
    for {
        select {
        case ev := <-s.sub.Events():
            switch ev := ev.(type) {
            case event.ManifestReceived:
                s.handleManifestReceived(ev)
            case event.LeaseWon:
                s.handleLeaseWon(ev)
            case event.LeaseClosed:
                s.handleLeaseClosed(ev)
            }
        case manager := <-s.managerch:
            s.handleManagerComplete(manager)
        case req := <-s.statusch:
            req <- s.getStatus()
        }
    }
}
```

### Event Types

**Blockchain Events:**
- `LeaseWon` - New lease awarded to provider
- `LeaseClosed` - Lease ended by tenant or provider
- `ManifestReceived` - Tenant sent deployment manifest

**Internal Events:**
- `DeploymentManagerComplete` - Deployment fully terminated
- `InventoryUpdated` - Resource availability changed
- `HostnameReserved` - Hostname assigned to deployment

## Hostname Integration

The cluster service integrates with the hostname service:

```go
// Reserve hostnames for deployment
withheldHostnames, err := s.hostnames.ReserveHostnames(
    ctx,
    hostnames,
    leaseID,
)

// Release hostnames on lease close
err = s.hostnames.ReleaseHostnames(leaseID)

// Transfer hostname between deployments (same owner)
err = s.TransferHostname(
    ctx,
    newLeaseID,
    hostname,
    serviceName,
    externalPort,
)
```

## Inventory Integration

The cluster service relies on the inventory service for resource tracking:

```go
// Reserve resources for bid
reservation, err := s.inventory.Reserve(orderID, resourceGroup)

// Unreserve if bid lost or lease closed
err = s.inventory.Unreserve(orderID)

// Check current inventory status
status := s.inventory.Status()
```

**Inventory Tracks:**
- Available CPU, memory, storage
- Allocated resources per lease
- GPU availability and models
- External port pool
- Storage classes and capacity

## Source Code Reference

**Primary Implementation**:
- `cluster/service.go` - Main cluster service
- `cluster/manager.go` - Deployment manager
- `cluster/inventory.go` - Inventory tracking
- `cluster/hostname.go` - Hostname management
- `cluster/kube.go` - Kubernetes client wrapper

**Key Functions**:
- `NewService()` - Initialize cluster service
- `Reserve()` - Reserve resources for bid
- `Unreserve()` - Release reserved resources
- `newDeploymentManager()` - Create deployment manager
- `findDeployments()` - Discover existing deployments

## Related Documentation

- [Provider Service Overview](/docs/for-providers/architecture/overview) - High-level architecture
- [Bid Engine](/docs/for-providers/architecture/bid-engine) - Bidding logic
- [Manifest Service](/docs/for-providers/architecture/manifest-service) - Manifest handling
- [Operators](/docs/for-providers/architecture/operators) - Inventory, IP, Hostname operators
