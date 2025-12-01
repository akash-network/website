---
categories: ["For Providers"]
tags: ["Architecture", "Operators"]
weight: 2
title: "IP Operator"
linkTitle: "IP"
description: "Manages static IP address assignments for deployments"
---

The IP Operator manages static IP address allocation for tenant deployments, integrating with MetalLB to provide dedicated external IPs.

## Purpose

The IP Operator:
- **Allocates** static IP addresses for deployments
- **Integrates** with MetalLB for IP address management
- **Tracks** IP usage and availability
- **Enables** IP sharing across services (same tenant)
- **Manages** IP lifecycle (create, update, delete)

## Architecture

```
+---------------------------------------------+
|          IP Operator                        |
|                                             |
|  +--------------------------------------+   |
|  |  CRD Watcher                         |   |
|  |  - Watch ProviderLeasedIP resources  |   |
|  |  - Monitor Add/Update/Delete events  |   |
|  +--------------+-----------------------+   |
|                 |                           |
|                 v                           |
|  +--------------------------------------+   |
|  |  Event Handler                       |   |
|  |  - Process ADD: allocate IP          |   |
|  |  - Process UPDATE: update config     |   |
|  |  - Process DELETE: release IP        |   |
|  +--------------+-----------------------+   |
|                 |                           |
|                 v                           |
|  +--------------------------------------+   |
|  |  MetalLB Client                      |   |
|  |  - CreateIPPassthrough()             |   |
|  |  - UpdateIPPassthrough()             |   |
|  |  - PurgeIPPassthrough()              |   |
|  |  - GetIPAddressUsage()               |   |
|  +--------------+-----------------------+   |
|                 |                           |
|                 v                           |
|  +--------------------------------------+   |
|  |  State Manager                       |   |
|  |  - Track allocated IPs               |   |
|  |  - Monitor IP pool capacity          |   |
|  |  - Expose HTTP endpoints             |   |
|  +--------------------------------------+   |
+---------------------------------------------+
                 |
                 v
        +-------------------+
        |     MetalLB       |
        |  (IP Allocator)   |
        +-------------------+
```

## IP Allocation Flow

### 1. Tenant Requests IP

When a tenant includes an IP endpoint in their SDL:

```yaml
services:
  web:
    image: nginx
    expose:
      - port: 80
        as: 80
        to:
          - global: true
        accept:
          - webdistest.localhost
        ip_name: myip
```

### 2. Provider Creates CRD

The Cluster Service creates a `ProviderLeasedIP` CRD:

```go
func (op *ipOperator) DeclareIP(
    ctx context.Context,
    lID mtypes.LeaseID,
    serviceName string,
    port uint32,
    externalPort uint32,
    proto manifest.ServiceProtocol,
    sharingKey string,
    overwrite bool,
) error
```

**CRD Spec:**

```yaml
apiVersion: akash.network/v2beta2
kind: ProviderLeasedIP
metadata:
  name: akash1abc...xyz-tcp-80
  labels:
    akash.network/lease.id.owner: akash1abc...xyz
    akash.network/lease.id.dseq: "12345"
    akash.network/lease.id.gseq: "1"
    akash.network/lease.id.oseq: "1"
    akash.network/managed: "true"
spec:
  leaseID:
    owner: akash1abc...xyz
    dseq: 12345
    gseq: 1
    oseq: 1
  serviceName: web
  port: 80
  externalPort: 80
  protocol: TCP
  sharingKey: akash1abc...xyz
```

### 3. Operator Watches for CRD

The operator watches for `ProviderLeasedIP` resources:

```go
func (op *ipOperator) observeIPEvent(parentCtx context.Context) error {
    opts := metav1.ListOptions{
        LabelSelector: fmt.Sprintf("%s=true", builder.AkashManagedLabelName),
    }
    
    watcher, err := op.ac.AkashV2beta2().ProviderLeasedIPs(op.ns).Watch(ctx, opts)
    
    for event := range watcher.ResultChan() {
        switch event.Type {
        case watch.Added, watch.Modified:
            op.applyAddOrUpdateEvent(ctx, event)
        case watch.Deleted:
            op.applyDeleteEvent(ctx, event)
        }
    }
}
```

### 4. MetalLB Allocates IP

The operator instructs MetalLB to allocate an IP:

```go
func (m *metalLBClient) CreateIPPassthrough(ctx context.Context, directive metallb.IPPassthrough) error {
    // Create MetalLB IPAddressPool and L2Advertisement
    // Assign IP to service
}
```

**MetalLB Resources Created:**

```yaml
apiVersion: metallb.io/v1beta1
kind: IPAddressPool
metadata:
  name: akash-ip-akash1abc...xyz-tcp-80
spec:
  addresses:
  - 192.168.1.100/32  # Single IP from pool

---
apiVersion: metallb.io/v1beta1
kind: L2Advertisement
metadata:
  name: akash-ip-akash1abc...xyz-tcp-80
spec:
  ipAddressPools:
  - akash-ip-akash1abc...xyz-tcp-80
```

### 5. Kubernetes Service Updated

The Kubernetes Service is updated with the allocated IP:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: web
  namespace: lease-dseq-12345-gseq-1-oseq-1
spec:
  type: LoadBalancer
  loadBalancerIP: 192.168.1.100
  ports:
  - port: 80
    targetPort: 80
    protocol: TCP
```

## IP Sharing

The operator supports IP sharing for services within the same deployment:

### Sharing Key

```go
sharingKey := owner.String()  // Bech32 address
```

**Same Sharing Key** = Services can share the IP
**Different Sharing Key** = Services get unique IPs

### Example: Multiple Services, One IP

```yaml
services:
  web:
    image: nginx
    expose:
      - port: 80
        as: 80
        to:
          - global: true
        ip_name: shared-ip
  
  api:
    image: api-server
    expose:
      - port: 8080
        as: 8080
        to:
          - global: true
        ip_name: shared-ip  # Same IP name
```

**Result:** Both services share the same external IP on different ports:
- `192.168.1.100:80` → web service
- `192.168.1.100:8080` → api service

## Resource Naming

CRD resources are named deterministically:

```go
resourceName := fmt.Sprintf("%s-%s-%d", sharingKey, protocol, externalPort)
```

**Format:** `{owner-address}-{protocol}-{external-port}`

**Example:** `akash1abc...xyz-tcp-80`

**Purpose:**
- Predictable resource names
- Easy identification of IP ownership
- Prevent naming conflicts
- Enable IP reuse for same owner/port/protocol

## State Management

The operator maintains internal state:

```go
type managedIP struct {
    presentLease mtypes.LeaseID
    presentPort  uint32
}

type ipOperator struct {
    state     map[string]managedIP
    inUse     uint
    available uint
}
```

**State Tracking:**
- Map of allocated IPs
- Current usage count
- Available IP count
- Lease associations

## Error Handling

### IP Pool Exhausted

```go
if available == 0 {
    return fmt.Errorf("no IP addresses available in pool")
}
```

**Operator Response:**
- Logs error
- Adds lease to ignored list
- Returns error to cluster service
- Prevents bid on future orders (no IPs)

### Lease Cleanup Failures

```go
case watch.Deleted:
    err := op.mllbc.PurgeIPPassthrough(ctx, directive)
    if err != nil {
        op.log.Error("failed to purge IP", "err", err)
    }
```

**Retry Logic:**
- 5-minute timeout for cleanup
- Logs failures
- State updated regardless (namespace deleted)

### MetalLB Communication Errors

```go
func (op *ipOperator) updateCounts(ctx context.Context) error {
    ctx, cancel := context.WithTimeout(ctx, time.Minute)
    defer cancel()
    
    inUse, available, err := op.mllbc.GetIPAddressUsage(ctx)
    if err != nil {
        return err
    }
}
```

**Periodic Retries:**
- Updates every minute
- Logs failures
- Continues operation

## Integration with Cluster Service

The Cluster Service calls the IP Operator via its client interface:

```go
type IPOperatorClient interface {
    DeclareIP(
        ctx context.Context,
        lID mtypes.LeaseID,
        serviceName string,
        port uint32,
        externalPort uint32,
        proto manifest.ServiceProtocol,
        sharingKey string,
        overwrite bool,
    ) error
}
```

**Flow:**
1. Manifest received with `ip_name`
2. Cluster Service detects IP requirement
3. Cluster Service calls `DeclareIP()`
4. IP Operator creates CRD
5. Operator watches and allocates IP via MetalLB
6. Service gets LoadBalancer IP

## Related Documentation

- [Cluster Service](/docs/for-providers/architecture/cluster-service) - Resource management
- [Inventory Operator](/docs/for-providers/architecture/operators/inventory) - Resource discovery
- [Hostname Operator](/docs/for-providers/architecture/operators/hostname) - Hostname management

