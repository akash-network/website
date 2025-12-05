---
categories: ["Providers"]
tags: ["Architecture", "Provider"]
title: "Manifest Service"
linkTitle: "Manifest Service"
weight: 4
description: "Receives, validates, and processes deployment manifests from tenants"
---

The Manifest Service handles the receipt and processing of deployment manifests (SDL) from tenants. It pairs lease events with manifests and coordinates deployment creation with the cluster service.

## Purpose

The Manifest Service acts as the manifest processing pipeline by:

1. **Receiving Manifests** - Accepts HTTP POST requests with SDL manifests
2. **Manifest Validation** - Validates manifest syntax and resource requirements
3. **Lease Pairing** - Matches manifests with won leases
4. **Hostname Validation** - Verifies hostname availability before deployment
5. **Event Emission** - Publishes `ManifestReceived` events to trigger deployment
6. **Watchdog Monitoring** - Closes leases if manifest not received in time

## Architecture

### Service Structure

**Implementation**: `manifest/service.go`

```go
type service struct {
    ctx     context.Context
    session session.Session
    bus     pubsub.Bus
    sub     pubsub.Subscriber
    
    statusch      chan chan<- *Status
    mreqch        chan manifestRequest
    activeCheckCh chan isActiveCheck
    
    managers  map[string]*manager
    managerch chan *manager
    
    hostnameService HostnameServiceClient
    
    watchdogs  map[DeploymentID]*watchdog
    watchdogch chan DeploymentID
}
```

### Key Components

1. **Manifest Managers** - One per deployment, handles manifest lifecycle
2. **Watchdogs** - Monitor for missing manifests (close lease if timeout)
3. **Event Bus** - Receives `LeaseWon` events from blockchain
4. **HTTP Handler** - Accepts manifest submissions via REST API
5. **Hostname Service** - Validates hostname availability

## Service Initialization

### Service Creation

The provider service creates the manifest service on startup:

**Source**: `service.go`

```go
manifest, err := manifest.NewService(
    ctx,
    session,
    bus,
    cluster.HostnameService(),
    manifestConfig,
)
```

### Configuration

```yaml
# provider.yaml
manifest-timeout: 5m  # Time to wait for manifest before closing lease
```

**Configuration Parameters:**

- `manifest-timeout` - Duration to wait for manifest after lease won (default: 5 minutes)
  - `0` = Disable watchdog (wait forever)
  - `5m` = Close lease if no manifest received within 5 minutes

## Manifest Lifecycle

### 1. Lease Won Event

When a provider wins a bid, the manifest service receives the event:

```go
case event.LeaseWon:
    if ev.LeaseID.GetProvider() != s.session.Provider().Address() {
        continue  // Not for this provider
    }
    
    s.handleLease(ev, true)
```

**Process:**
1. Verify lease is for this provider
2. Create watchdog if `manifest-timeout` configured
3. Create or retrieve manifest manager for deployment
4. Wait for manifest submission

### 2. Watchdog Creation

If `manifest-timeout` is set, a watchdog is created:

**Implementation**: `manifest/watchdog.go`

```go
type watchdog struct {
    LeaseID        LeaseID
    ManifestTimeout time.Duration
    
    timer *time.Timer
}
```

**Watchdog Behavior:**
```go
// Start timer when lease won
timer := time.NewTimer(manifestTimeout)

// Close lease if manifest not received
<-timer.C
bus.Publish(event.ClusterLease{
    LeaseID: leaseID,
    Action:  ClusterLeaseActionClose,
})
```

**Purpose**: Prevent "stuck" leases where tenant wins bid but never submits manifest.

**Best Practice**: Set to 5-10 minutes to give tenants time to submit.

### 3. Manifest Submission

Tenant submits manifest via HTTP POST to provider:

**HTTP Endpoint**: `PUT /deployment/{owner}/{dseq}/manifest`

**Request:**
```yaml
# Headers
Authorization: Bearer <jwt-token>
Content-Type: application/x-yaml

# Body (SDL manifest)
version: "2.0"
services:
  web:
    image: nginx:latest
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
          units: 1
        memory:
          size: 1Gi
        storage:
          size: 1Gi
  placement:
    akash:
      pricing:
        web:
          denom: uakt
          amount: 1000
deployment:
  web:
    akash:
      profile: web
      count: 1
```

**Handler Implementation**: `gateway/rest/router.go`

```go
func createManifestHandler(log log.Logger, mclient Client) http.HandlerFunc {
    return func(w http.ResponseWriter, req *http.Request) {
        // 1. Parse request
        deploymentID := requestDeploymentID(req)
        
        // 2. Decode manifest
        var mani manifest.Manifest
        err := DecodeYAML(req.Body, &mani)
        
        // 3. Submit to manifest service
        err = mclient.Submit(subctx, deploymentID, mani)
        
        // 4. Return response
        if err != nil {
            http.Error(w, err.Error(), http.StatusUnprocessableEntity)
            return
        }
        
        w.WriteHeader(http.StatusOK)
    }
}
```

### 4. Manifest Validation

The manifest service validates the submitted manifest:

```go
func (s *service) Submit(ctx context.Context, did DeploymentID, mani Manifest) error {
    // 1. Validate manifest structure
    err := mani.Validate()
    
    // 2. Check hostname availability
    for _, service := range mani.Services {
        for _, expose := range service.Expose {
            if expose.Global && expose.Hosts != nil {
                err := s.hostnameService.CanReserveHostnames(
                    expose.Hosts,
                    did.Owner,
                )
            }
        }
    }
    
    // 3. Send to manager for processing
    s.mreqch <- manifestRequest{
        DeploymentID: did,
        Manifest:     mani,
    }
}
```

**Validation Steps:**
1. **Structure Validation** - Verify YAML syntax and required fields
2. **Resource Validation** - Ensure resources match lease
3. **Hostname Validation** - Check hostname availability
4. **Pricing Validation** - Verify pricing matches lease bid

### 5. Manifest Processing

The manifest manager processes the validated manifest:

**Implementation**: `manifest/manager.go`

```go
type manager struct {
    daddr       DeploymentID
    
    config      ServiceConfig
    session     Session
    bus         Bus
    
    leasech     chan event.LeaseWon
    runch       <-chan runner.Result
    manifestch  chan submitRequest
    
    hostnameService HostnameServiceClient
}
```

**Process:**
1. Parse manifest groups
2. Validate resources against lease
3. Validate hostnames
4. Emit `ManifestReceived` event

```go
func (m *manager) handleManifest(req submitRequest) error {
    // 1. Get manifest group for this lease
    group := req.Manifest.GetGroup(m.lease.GroupSpec.Name)
    
    // 2. Validate hostnames
    hostnames := extractHostnames(group)
    err := m.hostnameService.CanReserveHostnames(hostnames, m.lease.Owner)
    
    // 3. Emit event
    m.bus.Publish(event.ManifestReceived{
        LeaseID:        m.lease,
        Group:          m.lease.Group,
        ManifestGroup:  group,
    })
}
```

### 6. Event Emission

Once validated, the manifest service publishes a `ManifestReceived` event:

```go
event.ManifestReceived{
    LeaseID:        leaseID,
    Group:          group,
    ManifestGroup:  manifestGroup,
}
```

**Subscribers:**
- **Cluster Service** - Creates Kubernetes deployment
- **Bid Engine** - Updates lease tracking
- **Provider Service** - Logs event

### 7. Watchdog Cancellation

When manifest is received, the watchdog is cancelled:

```go
// Manifest received
case req := <-m.manifestch:
    // Stop watchdog
    if watchdog := s.watchdogs[m.daddr]; watchdog != nil {
        watchdog.stop()
        delete(s.watchdogs, m.daddr)
    }
    
    // Process manifest
    m.handleManifest(req)
```

## Manifest Managers

Each deployment has a dedicated manifest manager that:

1. **Tracks Lease State** - Monitors which leases are active
2. **Awaits Manifest** - Waits for tenant to submit manifest
3. **Fetches On-Chain Data** - Queries deployment and lease info
4. **Coordinates Submission** - Ensures manifest matches lease
5. **Handles Updates** - Processes manifest updates

### Manager Lifecycle

```
Lease Won
    ↓
Create Manager
    ↓
Wait for Manifest (with timeout)
    ↓
Manifest Received
    ↓
Validate Manifest
    ↓
Emit ManifestReceived Event
    ↓
Manager Stays Active (for updates)
    ↓
Lease Closed
    ↓
Manager Removed
```

## Manifest Updates

Tenants can update their deployment by submitting a new manifest:

```bash
# Tenant sends updated manifest
akash tx deployment update update.yaml \
  --from mykey \
  --node https://rpc.akashnet.net:443

# Then sends manifest to provider again
akash provider send-manifest update.yaml \
  --dseq 123456 \
  --provider <provider-address>
```

**Update Process:**
1. Tenant updates on-chain deployment
2. Tenant submits new manifest to provider
3. Manifest service validates changes
4. Emits `ManifestReceived` event
5. Cluster service performs rolling update

## Watchdog System

The watchdog system prevents abandoned leases by automatically closing leases that never receive a manifest.

### Watchdog Behavior

```go
// Watchdog created on lease won
watchdog := newWatchdog(
    session,
    shutdownCh,
    watchdogCh,
    leaseID,
    manifestTimeout,
)

// Timer starts
timer := time.NewTimer(manifestTimeout)

// If timeout expires
<-timer.C

// Close lease on-chain
bus.Publish(event.ClusterLease{
    LeaseID: leaseID,
    Action:  ClusterLeaseActionClose,
})

// Log event
log.Info("manifest timeout", "lease", leaseID, "timeout", manifestTimeout)
```

### Design Rationale

The watchdog system solves a resource reservation problem:

**Problem**: Tenant wins lease but never sends manifest
- Cluster resources remain reserved
- Inventory shows resources as unavailable
- Provider cannot bid on other deployments

**Solution**: Watchdog timer closes lease after timeout
- Resources returned to available inventory
- Lease closed on-chain
- Provider can accept new bids

**Configuration**: `manifest-timeout` in `provider.yaml`
- Set to `5m` for standard timeout
- Set to `0` to disable (wait indefinitely)

## Source Code Reference

**Primary Implementation**:
- `manifest/service.go` - Main manifest service
- `manifest/manager.go` - Per-deployment manager
- `manifest/watchdog.go` - Timeout monitoring
- `gateway/rest/router.go` - HTTP endpoints and handlers

**Key Functions**:
- `NewService()` - Initialize manifest service
- `Submit()` - Accept manifest from tenant
- `handleLease()` - Process lease won event
- `newManager()` - Create deployment manager
- `newWatchdog()` - Create timeout monitor

## Related Documentation

- [Provider Service Overview](/docs/providers/architecture/overview) - High-level architecture
- [Cluster Service](/docs/providers/architecture/cluster-service) - Deployment management
- [Bid Engine](/docs/providers/architecture/bid-engine) - Bidding logic
- [Hostname Operator](/docs/providers/architecture/operators/hostname) - Hostname management
