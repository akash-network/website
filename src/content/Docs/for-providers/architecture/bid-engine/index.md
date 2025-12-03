---
categories: ["For Providers"]
tags: ["Architecture", "Bid Engine", "Bidding"]
weight: 2
title: "Bid Engine Service"
linkTitle: "Bid Engine"
description: "How the bid engine processes orders and generates bids"
---

The Bid Engine Service is responsible for monitoring the Akash blockchain for deployment orders, evaluating them against provider capabilities, and submitting competitive bids.

## Architecture

```
+----------------------------------------------+
|         Bid Engine Service                   |
|                                              |
|  +---------------------------------------+   |
|  |     Order Fetcher                     |   |
|  |  - Queries chain for open orders      |   |
|  |  - Pages through results              |   |
|  |  - Handles catchup on restart         |   |
|  +--------------+------------------------+   |
|                 |                            |
|                 v                            |
|  +---------------------------------------+   |
|  |     Event Subscriber                  |   |
|  |  - Listens for EventOrderCreated      |   |
|  |  - Receives real-time order events    |   |
|  +--------------+------------------------+   |
|                 |                            |
|                 v                            |
|  +---------------------------------------+   |
|  |     Order Manager (Map)               |   |
|  |  - orders map[orderID]*order          |   |
|  |  - Tracks active order processing     |   |
|  +--------------+------------------------+   |
|                 |                            |
|                 v                            |
|  +---------------------------------------+   |
|  |     Order Instance (per order)        |   |
|  |  - Order lifecycle FSM                |   |
|  |  - Resource matching                  |   |
|  |  - Price calculation                  |   |
|  |  - Bid submission                     |   |
|  +--------------+------------------------+   |
|                 |                            |
|                 v                            |
|  +---------------------------------------+   |
|  |     Pricing Strategy                  |   |
|  |  - Shell script pricing               |   |
|  |  - Scale-based pricing                |   |
|  +---------------------------------------+   |
+----------------------------------------------+
```

## Service Initialization

When the provider starts, the Bid Engine Service:

1. **Subscribes to Events** - Connects to the event bus
2. **Starts Provider Attribute Service** - Validates provider attributes
3. **Launches Order Fetcher** - Queries chain for existing open orders (catchup)
4. **Waits for Operators** - Ensures hostname/inventory operators are ready
5. **Begins Processing** - Starts handling orders and events

**Code Reference:** `/bidengine/service.go` - `NewService()`

## Order Processing

### Order Discovery

Orders are discovered in two ways:

#### 1. Real-Time Events (Primary)

```go
case *mtypes.EventOrderCreated:
    key := mquery.OrderPath(ev.ID)
    order, err := newOrder(s, ev.ID, s.cfg, s.pass, false)
    s.orders[key] = order
```

- Listens for `EventOrderCreated` events from the blockchain
- Immediately creates an order manager for the new order
- Begins bid evaluation process

#### 2. Catchup on Startup

```go
func (s *service) ordersFetcher(ctx context.Context, aqc sclient.QueryClient)
```

- Queries the blockchain for all open orders
- Paginates through results (1000 orders per page)
- Catches up on any orders created while provider was offline
- Ensures no orders are missed during restarts

### Order Lifecycle

Each order goes through a finite state machine:

```
1. CREATED
   ↓
2. EVALUATING
   ↓ (checks pass)
3. BIDDING
   ↓
4. BID_SUBMITTED
   ↓ (lease awarded or order closed)
5. COMPLETE
```

**Code Reference:** `/bidengine/order.go` - `order.run()`

## Bid Evaluation

When an order is detected, the bid engine evaluates:

### 1. Provider Attributes Match

```go
func shouldBid(order Request, pattr apclient.Attributes) (bool, error)
```

**Checks:**
- Provider attributes match order requirements
- GPU model/vendor matches (if GPU deployment)
- Region/datacenter matches (if specified)
- Feature support (persistent storage, IP leases, etc.)

**Example Order Requirements:**

```yaml
# SDL attributes
profiles:
  compute:
    gpu-profile:
      attributes:
        region: us-west
        capabilities/gpu/vendor/nvidia/model/rtx4090: true
```

### 2. Resource Availability

```go
cluster.Reserve(order.OrderID, order.Resources)
```

**Checks:**
- Sufficient CPU available
- Sufficient memory available
- Sufficient storage available
- GPU units available (if GPU required)
- Persistent storage available (if requested)

**Resource Reservation:**
- Resources are **reserved** (not allocated) when bidding
- Prevents overbidding on limited resources
- Reservation is released if lease is not won
- Reservation is converted to allocation when lease is won

### 3. Price Calculation

```go
price, err := s.config.BidPricingStrategy.CalculatePrice(ctx, req)
```

Two pricing strategies are supported:

#### Shell Script Pricing

Custom pricing logic in `price_script.sh`:

```bash
#!/bin/bash
# Custom pricing logic
# Input: JSON with order details
# Output: Price in uakt/block

CPU_PRICE=100
MEMORY_PRICE=50
STORAGE_PRICE=10

# Calculate total price
# ... pricing logic ...
echo "$TOTAL_PRICE"
```

**Advantages:**
- Maximum flexibility
- Can integrate external pricing APIs
- Dynamic pricing based on demand
- Can consider time of day, region, etc.

#### Scale-Based Pricing

Simple multiplier-based pricing from `provider.yaml`:

```yaml
bidpricestoragescale: 1.0
bidpricecpuscale: 1.0
bidpricememoryscale: 1.0
bidpriceendpointscale: 1.0
bidpricescriptpath: ""
```

**Calculation:**

```
price = (cpu_units * cpu_scale) + 
        (memory_units * memory_scale) + 
        (storage_units * storage_scale) +
        (endpoint_count * endpoint_scale)
```

**Code Reference:** `/bidengine/pricing.go`

## Bid Submission

Once evaluation passes, the bid is submitted:

### Bid Components

```proto
message MsgCreateBid {
  BidID bid_id = 1;
  cosmos.base.v1beta1.DecCoin price = 2;
  cosmos.base.v1beta1.Coin deposit = 3;
}
```

**Fields:**
- `bid_id` - Unique identifier (order ID + provider address)
- `price` - Bid price in uakt per block
- `deposit` - Bid deposit (typically 5 AKT)

### Transaction Broadcast

```go
tx := NewMsgCreateBid(order.OrderID, provider, price, deposit)
response := txClient.BroadcastTx(tx)
```

**Process:**
1. Create signed transaction
2. Broadcast to Akash blockchain
3. Wait for transaction confirmation
4. Handle success or failure

### Bid Timeout

If bid submission fails or times out:

```go
timeout := s.cfg.BidTimeout // default: 5 minutes
```

- Order manager waits for bid timeout duration
- If bid not confirmed within timeout, order processing stops
- Resources are unreserved
- Order manager is removed from active orders

## Provider Attribute Validation

The bid engine includes a Provider Attribute Signature Service that validates provider attributes:

### Signature Verification

```go
func (s *providerAttrSignatureService) validate(attr apclient.Attributes)
```

**Checks:**
- Required attributes are present (`host`, `tier`)
- Attribute format is valid
- No invalid or malformed attributes
- GPU attributes follow correct naming convention

### Automatic Attribute Updates

The service monitors for attribute changes:

```go
case ptypes.ProviderResourcesEvent:
    // Update provider attributes
    s.updateAttributes(event.Attributes)
```

**Triggers:**
- Provider configuration changes
- GPU discovery updates
- Feature enablement (storage, IP leases)

## Monitoring & Metrics

### Prometheus Metrics

```go
var ordersCounter = promauto.NewCounterVec(prometheus.CounterOpts{
    Name: "provider_order_handler",
}, []string{"action"})

var orderManagerGauge = promauto.NewGauge(prometheus.GaugeOpts{
    Name: "provider_order_manager",
})
```

**Metrics Exposed:**
- `provider_order_handler{action="start"}` - Orders started
- `provider_order_handler{action="stop"}` - Orders completed
- `provider_order_manager` - Active orders being processed

### Status API

```go
func (s *service) Status(ctx context.Context) (*apclient.BidEngineStatus, error)
```

**Returns:**

```json
{
  "orders": 5  // number of active orders
}
```

**Query Status:**

```bash
grpcurl -insecure provider.example.com:8444 \
  akash.provider.v1.ProviderRPC.GetStatus
```

## Configuration

### Bid Engine Config

```go
type Config struct {
    PricingStrategy PricingStrategy
    Deposit         sdk.Coin
    BidTimeout      time.Duration
    Attributes      []Attribute
    MaxGroupVolumes int
}
```

**From provider.yaml:**

```yaml
# Bid deposit (escrow)
biddeposit: 5000000uakt  # 5 AKT

# Bid timeout
bidtimeout: 5m

# Pricing strategy
bidpricescriptpath: "/path/to/price_script.sh"
# OR
bidpricestoragescale: 1.0
bidpricecpuscale: 1.0
bidpricememoryscale: 1.0

# Max volumes per deployment
maxgroupvolumes: 20

# Provider attributes
attributes:
  - key: host
    value: akash
  - key: tier
    value: community
```

## Error Handling

The bid engine handles various error scenarios:

### Chain Query Failures

```go
if errors.Is(err, context.Canceled) {
    break
}
// Retry on transient errors
continue
```

- Retries on network errors
- Graceful shutdown on context cancellation
- Continues processing other orders

### Resource Reservation Failures

```go
if err := cluster.Reserve(order.OrderID, resources); err != nil {
    log.Error("resource reservation failed", "err", err)
    return // Skip this order
}
```

- Skip orders that exceed available resources
- Log reason for rejection
- Continue processing other orders

### Bid Submission Failures

```go
if err := SubmitBid(tx); err != nil {
    log.Error("bid submission failed", "err", err)
    cluster.Unreserve(order.OrderID)
    return
}
```

- Release reserved resources on failure
- Log error details
- Retry logic for transient failures

## Advanced Features

### Concurrent Order Processing

Each order is processed in its own goroutine:

```go
order, err := newOrder(s, orderID, s.cfg, s.pass, false)
go order.run()  // Concurrent execution
```

**Benefits:**
- Process multiple orders simultaneously
- Don't block on slow order evaluation
- Maximize bidding throughput

### Operator Waiting

Before bidding, the service waits for operators:

```go
err := s.waiter.WaitForAll(ctx)
```

**Ensures:**
- Hostname operator is ready
- Inventory operator has discovered resources
- IP operator is available (if configured)

**Prevents:**
- Bidding before resource discovery complete
- Incorrect resource availability calculations
- Missing feature support

## Related Documentation

- [Cluster Service](/docs/for-providers/architecture/cluster-service) - Resource management
- [Provider Attributes](/docs/for-providers/operations/provider-attributes) - Attribute configuration
- [Provider Installation](/docs/for-providers/setup-and-installation/kubespray/provider-installation) - Pricing configuration
