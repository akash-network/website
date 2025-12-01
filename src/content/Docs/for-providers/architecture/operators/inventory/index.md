---
categories: ["For Providers"]
tags: ["Architecture", "Operators"]
weight: 1
title: "Inventory Operator"
linkTitle: "Inventory"
description: "Discovers and tracks cluster resources in real-time"
---

The Inventory Operator continuously discovers and monitors hardware resources across your Kubernetes cluster, making them available for provider bidding decisions.

## Purpose

The Inventory Operator:
- **Discovers** cluster resources (CPU, GPU, memory, storage)
- **Monitors** resource availability in real-time
- **Tracks** resource utilization and allocation
- **Publishes** inventory data to the provider service
- **Updates** Kubernetes node labels with capabilities

## Architecture

```
+---------------------------------------------+
|       Inventory Operator                    |
|                                             |
|  +--------------------------------------+   |
|  |    Cluster Nodes Manager             |   |
|  |  - Watch Kubernetes nodes            |   |
|  |  - Deploy discovery pods             |   |
|  |  - Collect hardware info             |   |
|  +--------------+-----------------------+   |
|                 |                           |
|                 v                           |
|  +--------------------------------------+   |
|  |    Node Discovery Pods               |   |
|  |  - Run on each node                  |   |
|  |  - Detect CPUs, GPUs, storage        |   |
|  |  - Read hardware capabilities        |   |
|  +--------------+-----------------------+   |
|                 |                           |
|                 v                           |
|  +--------------------------------------+   |
|  |    Storage Queriers                  |   |
|  |  - Ceph integration                  |   |
|  |  - Rancher Longhorn integration      |   |
|  |  - Storage class detection           |   |
|  +--------------+-----------------------+   |
|                 |                           |
|                 v                           |
|  +--------------------------------------+   |
|  |    Cluster State Aggregator          |   |
|  |  - Combine node + storage data       |   |
|  |  - Publish to event bus              |   |
|  |  - Respond to queries                |   |
|  +--------------------------------------+   |
+---------------------------------------------+
                 |
                 v
        +-------------------+
        |  Provider Service |
        |  (Bid Engine)     |
        +-------------------+
```

## Discovery Process

### 1. Node Discovery

When the operator starts, it:

1. **Watches Kubernetes Nodes**
   ```go
   watch.Interface for v1.Node resources
   ```
   - Monitors node additions/removals
   - Detects node capacity changes
   - Tracks node status updates

2. **Deploys Discovery Pods**
   - Creates a discovery pod on each node
   - Runs with privileged access for hardware detection
   - Uses same image as operator for consistency

3. **Collects Hardware Information**
   - CPU cores and architecture
   - Memory capacity
   - GPUs (NVIDIA, AMD, Intel)
   - Storage devices (NVMe, SSD, HDD)
   - Network interfaces

### 2. Resource Tracking

The operator tracks:

#### CPU Resources

```yaml
cpu:
  quantity:
    allocatable: 64000  # millicores
    allocated: 32000    # millicores currently used
  info:
    - model: "AMD EPYC 7763"
      vcores: 64
```

#### GPU Resources

```yaml
gpu:
  quantity:
    allocatable: 8
    allocated: 2
  info:
    - vendor: nvidia
      name: rtx4090
      modelid: "2684"
      interface: pcie
      memory_size: 24Gi
```

#### Memory Resources

```yaml
memory:
  quantity:
    allocatable: 256Gi
    allocated: 128Gi
```

#### Storage Resources

```yaml
storage:
  - class: beta2    # Storage class name
    size: 5000Gi    # Total capacity
    provisioner: ceph.rook.io
```

### 3. GPU Feature Discovery

The operator integrates with the NVIDIA Device Plugin and other GPU management tools:

**Detection Process:**
1. Query PCI devices for GPUs
2. Read GPU vendor and product IDs
3. Match against [provider-configs database](https://github.com/akash-network/provider-configs)
4. Extract GPU capabilities (memory, CUDA version, features)
5. Publish GPU info to inventory

**GPU Information Collected:**
- Vendor ID (e.g., `10de` for NVIDIA)
- Product ID (e.g., `2684` for RTX 4090)
- Model name (user-friendly)
- Memory size
- Interface type (PCIe, SXM)

### 4. Storage Discovery

The operator supports multiple storage backends:

#### Rook-Ceph Integration

```go
func NewCeph(ctx context.Context) (QuerierStorage, error)
```

**Discovers:**
- Ceph storage classes
- Available storage capacity
- Provisioner type
- Storage performance class

#### Rancher Longhorn Integration

```go
func NewRancher(ctx context.Context) (QuerierStorage, error)
```

**Discovers:**
- Longhorn volumes
- Storage pools
- Replica counts
- Available capacity

## Real-Time Updates

The operator continuously monitors for changes:

### Node Changes

```go
case watch.Modified:
    if nodeAllocatableChanged(knode, obj) {
        updateNodeInfo(obj, &node)
        signalLabels()
    }
```

**Triggers:**
- Node capacity changes (scale-up/down)
- Node labels modified
- Node conditions changed (Ready, MemoryPressure, etc.)

### Pod Changes

```go
case watch.Added, watch.Modified:
    if isPodAllocated(obj.Status) {
        addPodAllocatedResources(&node, obj)
    }
case watch.Deleted:
    subPodAllocatedResources(&node, &pod)
```

**Tracks:**
- New pod deployments (subtract from available)
- Pod deletions (add back to available)
- Pod resource requests (CPU, memory, GPU)

## Event Publishing

The operator publishes inventory updates to the event bus:

### Topics

- `inventory.nodes` - Node hardware capabilities
- `inventory.storage` - Storage availability
- `inventory.cluster` - Aggregated cluster state

### Retained Events

```go
bus.Pub(state, []string{topicInventoryCluster}, pubsub.WithRetain())
```

Events are retained so new subscribers immediately receive current state.

## Kubernetes Node Labels

The operator adds labels to nodes based on discovered hardware:

### Example Labels

```yaml
akash.network/capabilities.gpu.vendor.nvidia: "true"
akash.network/capabilities.gpu.model.rtx4090: "true"
akash.network/capabilities.storage.class.beta2: "true"
akash.network/capabilities.storage.class.beta3: "true"
```

**Purpose:**
- Enable node selector constraints for scheduling
- Support GPU model matching in deployments
- Allow storage class requirements

## Integration with Bid Engine

The Bid Engine queries the inventory to make bidding decisions:

```go
inventory, err := cluster.Inventory(ctx)
if err != nil {
    return err
}

// Check if resources are available
canBid := inventory.Has(requiredResources)
```

**Flow:**
1. Order arrives with resource requirements
2. Bid Engine queries inventory
3. Inventory Operator returns available resources
4. Bid Engine compares required vs. available
5. Bid submitted if resources sufficient

## Related Documentation

- [Cluster Service](/docs/for-providers/architecture/cluster-service) - Resource reservation
- [Bid Engine](/docs/for-providers/architecture/bid-engine) - Bidding logic
- [IP Operator](/docs/for-providers/architecture/operators/ip) - IP address management
- [Hostname Operator](/docs/for-providers/architecture/operators/hostname) - Hostname management

