---
categories: ["Providers"]
tags: ["Architecture", "Operators"]
weight: 3
title: "Hostname Operator"
linkTitle: "Hostname"
description: "Manages custom hostname assignments and ingress resources for tenant deployments"
---

The Hostname Operator manages custom domain names for tenant deployments, creating and maintaining Kubernetes Ingress resources that route external traffic to the appropriate services.

## Purpose

The Hostname Operator enables tenants to expose their deployments using custom hostnames by:

1. **Validating Hostnames** - Ensures hostnames are not blocked and ownership is correct
2. **Reservation Management** - Tracks hostname usage across deployments
3. **Ingress Creation** - Automatically creates Kubernetes Ingress resources
4. **Conflict Resolution** - Prevents hostname conflicts between different tenants
5. **Transfer Support** - Allows hostname transfers between deployments of the same owner

## Architecture

### Core Service

**Implementation**: `cluster/hostname.go`

The hostname service runs as part of the cluster service and manages hostname state in-memory:

```go
type hostnameService struct {
    inUse map[string]hostnameID
    
    requests       chan reserveRequest
    canRequest     chan canReserveRequest
    prepareRequest chan prepareTransferRequest
    releases       chan hostnameID
    
    blockedHostnames []string
    blockedDomains   []string
}
```

### Hostname Identification

Each hostname is associated with a unique deployment identifier:

```go
type hostnameID struct {
    owner sdktypes.Address  // Tenant wallet address
    dseq  uint64             // Deployment sequence
    gseq  uint32             // Group sequence
}
```

**Key Principle**: Only the owner can use or transfer a hostname they've reserved.

## Hostname Lifecycle

### 1. Reservation Check

Before accepting a bid, the provider validates hostname availability:

```bash
# Check if hostnames can be reserved
CanReserveHostnames(hostnames, ownerAddress)
```

**Validation Rules:**
- Hostname not in blocklist
- If in use, must be same owner
- Domain suffix not blocked

### 2. Hostname Reservation

When a lease is created, hostnames are reserved:

```bash
# Reserve hostnames for deployment
ReserveHostnames(ctx, hostnames, leaseID)
```

**Process:**
1. Convert all hostnames to lowercase
2. Check against blocked hostname/domain lists
3. Verify owner has rights to hostname
4. Mark hostnames as in-use for this deployment
5. Return list of withheld hostnames (if replacing another deployment)

### 3. Transfer Preparation

For hostname transfers between deployments (same owner):

```bash
# Prepare hostnames for transfer
PrepareHostnamesForTransfer(ctx, hostnames, newLeaseID)
```

**Use Case**: Blue-green deployments where a new deployment takes over hostnames from an old one.

### 4. Hostname Release

When a lease ends, hostnames are released:

```bash
# Release all hostnames for lease
ReleaseHostnames(leaseID)
```

**Effect**: Makes hostnames available for future reservations.

## Hostname Blocking

Providers can block specific hostnames or entire domains via configuration.

### Configuration

**Provider Config** (`provider.yaml`):

```yaml
blocked-hostnames:
  - "malicious.com"        # Block exact hostname
  - ".example.com"         # Block entire domain (suffix match)
  - "internal.local"       # Block specific name
```

### Blocking Logic

```go
func (hs *hostnameService) isHostnameBlocked(hostname string) error {
    // Check exact hostname match
    for _, blockedHostname := range hs.blockedHostnames {
        if blockedHostname == hostname {
            return fmt.Errorf("hostname blocked")
        }
    }
    
    // Check domain suffix match
    for _, blockedDomain := range hs.blockedDomains {
        if strings.HasSuffix(hostname, blockedDomain) {
            return fmt.Errorf("domain blocked")
        }
    }
    
    return nil
}
```

**Prefix Convention:**
- No prefix = exact hostname match (`example.com`)
- `.` prefix = domain suffix match (`.example.com` blocks `sub.example.com`, `api.example.com`, etc.)

## Hostname Conflicts

### Owner Validation

**Rule**: Only the wallet address that reserved a hostname can use it.

**Example Scenarios:**

1. **Same Owner, Different Deployment** **Allowed
   - Deployment A (owner: akash1abc...) uses `api.example.com`
   - Deployment B (same owner) requests `api.example.com`
   - Result: Hostname transferred from A to B

2. **Different Owner** **Blocked
   - Deployment A (owner: akash1abc...) uses `api.example.com`
   - Deployment B (owner: akash1xyz...) requests `api.example.com`
   - Result: Error - hostname in use

### Withheld Hostnames

When a hostname is transferred between deployments, it may be temporarily "withheld":

```go
// Returns list of hostnames that couldn't be immediately assigned
withheldHostnames, err := ReserveHostnames(ctx, hostnames, leaseID)
```

**Why Withheld?**
- Previous deployment still using it
- Allows graceful transition
- Prevents downtime during updates

## Ingress Integration

The Hostname Operator works with Kubernetes ingress controllers (Ingress-NGINX, Traefik) to route traffic.

### How It Works

1. **Hostname Reserved** → Hostname service tracks reservation
2. **Cluster Service** → Creates `ProviderHost` CRD
3. **Hostname Operator** → Watches CRD, creates `Ingress` resource
4. **Ingress Controller** → Routes traffic to service

### Ingress Resource Example

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-example-com
  namespace: lease-akash1abc-1234-1-1
spec:
  ingressClassName: akash-ingress-class
  rules:
  - host: api.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web
            port:
              number: 80
```

## Implementation Notes

**State Storage**: Hostname reservations are stored in-memory only. On provider restart, state is rebuilt from active leases by querying Kubernetes ingress resources.

## Source Code Reference

**Primary Implementation**:
- `cluster/hostname.go` - Core hostname reservation logic
- `cluster/types/v1beta3/clients/hostname/hostname.go` - Client interface

**Key Functions**:
- `ReserveHostnames()` - Reserve hostnames for lease
- `ReleaseHostnames()` - Free hostnames when lease ends
- `CanReserveHostnames()` - Pre-flight validation
- `PrepareHostnamesForTransfer()` - Blue-green deployment support
- `isHostnameBlocked()` - Blocklist validation

## Related Documentation

- [Cluster Service](/docs/providers/architecture/cluster-service) - Deployment management
- [IP Operator](/docs/providers/architecture/operators/ip) - IP address management
- [Inventory Operator](/docs/providers/architecture/operators/inventory) - Resource discovery
