# AEP-82 Implementation Guide

> Companion to [AEP-82: Resource Reclamation](./README.md) (the authoritative specification).
>
> This document contains **implementation-specific details only**: protobuf definitions, Go interfaces,
> codebase-specific notes, handler pseudocode, and the complete file change matrix. For the design,
> behavior, rules, and rationale, see [README.md](./README.md).

---

## 1. Codebase-Specific Implementation Notes

### 1.1 CreateBid Keeper Signature

The current `CreateBid` keeper method accepts `(id, price, resourcesOffer)` and constructs the `Bid`
struct inline. The new `reclamation_window` field on `Bid` requires updating this signature:

```go
// Current
CreateBid(ctx sdk.Context, id mv1.BidID, price sdk.DecCoin, roffer types.ResourcesOffer) (types.Bid, error)

// Updated
CreateBid(ctx sdk.Context, id mv1.BidID, price sdk.DecCoin, roffer types.ResourcesOffer, reclaimWindow *time.Duration) (types.Bid, error)
```

This change propagates to the `IKeeper` interface and all call sites.

### 1.2 CreateOrder Signature

The current `CreateOrder` accepts `(groupID, groupSpec)`. The reclamation requirement (deployment-level)
must be passed as an additional parameter:

```go
// Current
CreateOrder(ctx sdk.Context, gid dtypes.GroupID, spec dvbeta.GroupSpec) (types.Order, error)

// Updated
CreateOrder(ctx sdk.Context, gid dtypes.GroupID, spec dvbeta.GroupSpec, reclamation *mv1.DeploymentReclamation) (types.Order, error)
```

This change propagates to:
- `IKeeper` interface (`x/market/keeper/keeper.go:26`)
- `MarketKeeper` interface (`x/deployment/imports/keepers.go:22`)
- Concrete implementation (`x/market/keeper/keeper.go:153`)
- All call sites (see [Section 5](#5-complete-createorder-call-site-inventory))

### 1.3 Market Handler DeploymentKeeper Interface

The `CloseLease` handler in `x/market/handler/server.go` auto-creates a new order when the tenant
closes a lease and the group remains open (line 289). It needs to pass the reclamation requirement to
`CreateOrder`. The order's `Reclamation` field (already fetched at line 246) provides this:

```go
ms.keepers.Market.CreateOrder(ctx, group.ID, group.GroupSpec, order.Reclamation)
```

No change to the `DeploymentKeeper` interface in `x/market/handler/keepers.go` is required for
this path – the reclamation config comes from the `Order`, not the `Deployment`.

However, `StartGroup` in the deployment handler needs the `Deployment` to retrieve the reclamation
config. The deployment handler already has access to `ms.deployment` (`keeper.IKeeper`), which
exposes `GetDeployment`. No new interface method is needed.

### 1.4 Query Handler: Hardcoded Lease States

The lease query handler at `x/market/keeper/grpc_query.go:761` hardcodes the "all states" list:

```go
states = append(states, byte(v1.LeaseActive), byte(v1.LeaseInsufficientFunds), byte(v1.LeaseClosed))
```

`LeaseReclaiming` must be added:

```go
states = append(states, byte(v1.LeaseActive), byte(v1.LeaseInsufficientFunds), byte(v1.LeaseClosed), byte(v1.LeaseReclaiming))
```

Without this change, queries with no state filter silently omit all reclaiming leases.

### 1.5 Escrow Hooks: Intentional Reclamation Bypass

The `OnEscrowPaymentClosed` hook in `x/market/hooks/hooks.go` does not check lease state before
closing. When an escrow payment closes (insufficient funds or deployment closure), a lease in
`LeaseReclaiming` is closed immediately, bypassing the reclamation window.

This is **intentional and correct**:
- Insufficient funds: the money ran out; reclamation cannot continue.
- Deployment closure: the tenant voluntarily exited; reclamation is moot.

No changes to hooks are required.

### 1.6 OnLeaseClosed Guard

The existing `OnLeaseClosed` guard in `x/market/keeper/keeper.go:347-350` skips leases that are
already `LeaseClosed` or `LeaseInsufficientFunds`. The new `LeaseReclaiming` state is NOT in the
skip list, so `OnLeaseClosed` correctly handles closing a reclaiming lease. No change needed.

### 1.7 Lease State Index

The lease state index (`LeaseIndexes.State`) uses `int32(lease.State)` as the index key. The new
`LeaseReclaiming = 4` state is automatically indexed without code changes. Queries filtering by
`state=4` work out of the box.

### 1.8 WithdrawLease During Reclamation

The `WithdrawLease` handler (`server.go:165-178`) only checks that the lease exists, then calls
`Escrow.PaymentWithdraw`. It does **not** check `lease.State`. This means `WithdrawLease` works
correctly during `LeaseReclaiming` without any code changes. The provider can withdraw accrued
funds at any point during the reclamation window.

### 1.9 CloseLease Error Code

The existing `CloseLease` handler (line 267-268) returns `mv1.ErrOrderClosed` when the lease is
not active. This is a pre-existing misnomer (should be `ErrLeaseNotActive`). This AEP does not
fix it but notes it for future cleanup. The reclamation changes update the check to also accept
`LeaseReclaiming`:

```go
if lease.State != mv1.LeaseActive && lease.State != mv1.LeaseReclaiming {
    return &mvbeta.MsgCloseLeaseResponse{}, mv1.ErrOrderClosed
}
```

---

## 2. Protobuf Definitions

### 2.1 New File: `proto/node/akash/market/v1/reclamation.proto`

```protobuf
syntax = "proto3";
package akash.market.v1;

import "gogoproto/gogo.proto";
import "google/protobuf/duration.proto";
import "akash/market/v1/types.proto";

option go_package = "pkg.akt.dev/go/node/market/v1";

// DeploymentReclamation defines the tenant's reclamation requirements.
// Stored on the Deployment and propagated to Orders.
message DeploymentReclamation {
  // min_window is the minimum reclamation window the tenant requires.
  google.protobuf.Duration min_window = 1 [
    (gogoproto.nullable)    = false,
    (gogoproto.stdduration) = true,
    (gogoproto.jsontag)     = "min_window",
    (gogoproto.moretags)    = "yaml:\"min_window\""
  ];
}

// Reclamation defines the runtime reclamation state stored on a Lease.
message Reclamation {
  // window is the negotiated reclamation window duration (from the winning bid).
  google.protobuf.Duration window = 1 [
    (gogoproto.nullable)    = false,
    (gogoproto.stdduration) = true,
    (gogoproto.jsontag)     = "window",
    (gogoproto.moretags)    = "yaml:\"window\""
  ];

  // started_at is the block height at which reclamation was initiated.
  // Zero means reclamation has not been started yet.
  int64 started_at = 2 [
    (gogoproto.jsontag)  = "started_at",
    (gogoproto.moretags) = "yaml:\"started_at\""
  ];

  // deadline is the unix timestamp at which the reclamation window expires.
  // Zero means reclamation has not been started yet.
  int64 deadline = 3 [
    (gogoproto.jsontag)  = "deadline",
    (gogoproto.moretags) = "yaml:\"deadline\""
  ];

  // reason is the provider's stated reason for reclamation.
  LeaseClosedReason reason = 4 [
    (gogoproto.jsontag)  = "reason",
    (gogoproto.moretags) = "yaml:\"reason\""
  ];
}
```

### 2.2 Modify: `proto/node/akash/market/v1/lease.proto`

Add to `Lease.State` enum:

```protobuf
// LeaseReclaiming denotes a lease in reclamation (grace period before closure).
reclaiming = 4 [
    (gogoproto.enumvalue_customname) = "LeaseReclaiming"
];
```

Add field to `Lease` message:

```protobuf
// Reclamation holds reclamation configuration and state, if applicable.
// Nil if reclamation is not configured for this lease.
Reclamation reclamation = 7 [
  (gogoproto.nullable) = true,
  (gogoproto.jsontag)  = "reclamation,omitempty",
  (gogoproto.moretags) = "yaml:\"reclamation,omitempty\""
];
```

### 2.3 Modify: `proto/node/akash/market/v1/event.proto`

Add:

```protobuf
// EventLeaseReclaimStarted is triggered when a provider initiates reclamation.
message EventLeaseReclaimStarted {
  option (gogoproto.equal) = true;

  LeaseID id = 1 [
    (gogoproto.nullable)   = false,
    (gogoproto.customname) = "ID",
    (gogoproto.jsontag)    = "id",
    (gogoproto.moretags)   = "yaml:\"id\""
  ];

  LeaseClosedReason reason = 2 [
    (gogoproto.jsontag)  = "reason",
    (gogoproto.moretags) = "yaml:\"reason\""
  ];

  // deadline is the unix timestamp when the reclamation window expires.
  int64 deadline = 3 [
    (gogoproto.jsontag)  = "deadline",
    (gogoproto.moretags) = "yaml:\"deadline\""
  ];
}
```

### 2.4 Modify: `proto/node/akash/market/v1beta5/leasemsg.proto`

Add:

```protobuf
// MsgLeaseStartReclaim is sent by the provider to initiate reclamation on an active lease.
message MsgLeaseStartReclaim {
  option (gogoproto.equal) = false;

  akash.market.v1.LeaseID id = 1 [
    (gogoproto.customname) = "ID",
    (gogoproto.nullable)   = false,
    (gogoproto.jsontag)    = "id",
    (gogoproto.moretags)   = "yaml:\"id\""
  ];

  akash.market.v1.LeaseClosedReason reason = 2 [
    (gogoproto.jsontag)  = "reason",
    (gogoproto.moretags) = "yaml:\"reason\""
  ];
}

// MsgLeaseStartReclaimResponse is the response from starting lease reclamation.
message MsgLeaseStartReclaimResponse {}
```

### 2.5 Modify: `proto/node/akash/market/v1beta5/service.proto`

Add RPC to `service Msg`:

```protobuf
// LeaseStartReclaim initiates the reclamation window on an active lease.
rpc LeaseStartReclaim(MsgLeaseStartReclaim) returns (MsgLeaseStartReclaimResponse);
```

### 2.6 Modify: `proto/node/akash/market/v1beta5/bidmsg.proto`

Add to `MsgCreateBid`:

```protobuf
// reclamation_window is the reclamation window duration the provider offers.
// If the order requires reclamation, this must be >= the order's min_window.
// Nil means the provider does not offer reclamation on this bid.
google.protobuf.Duration reclamation_window = 5 [
  (gogoproto.nullable)    = true,
  (gogoproto.stdduration) = true,
  (gogoproto.jsontag)     = "reclamation_window,omitempty",
  (gogoproto.moretags)    = "yaml:\"reclamation_window,omitempty\""
];
```

### 2.7 Modify: `proto/node/akash/market/v1beta5/bid.proto`

Add to `Bid`:

```protobuf
// reclamation_window is the reclamation window offered by this provider.
google.protobuf.Duration reclamation_window = 6 [
  (gogoproto.nullable)    = true,
  (gogoproto.stdduration) = true,
  (gogoproto.jsontag)     = "reclamation_window,omitempty",
  (gogoproto.moretags)    = "yaml:\"reclamation_window,omitempty\""
];
```

### 2.8 Modify: `proto/node/akash/market/v1beta5/order.proto`

Add to `Order`:

```protobuf
// reclamation is the deployment-level reclamation requirement, propagated to the order.
// Nil means the deployment does not require reclamation.
akash.market.v1.DeploymentReclamation reclamation = 5 [
  (gogoproto.nullable) = true,
  (gogoproto.jsontag)  = "reclamation,omitempty",
  (gogoproto.moretags) = "yaml:\"reclamation,omitempty\""
];
```

### 2.9 Modify: `proto/node/akash/market/v1beta5/params.proto`

Add:

```protobuf
// min_reclamation_window is the minimum reclamation window duration allowed.
google.protobuf.Duration min_reclamation_window = 4 [
  (gogoproto.nullable)    = false,
  (gogoproto.stdduration) = true,
  (gogoproto.jsontag)     = "min_reclamation_window",
  (gogoproto.moretags)    = "yaml:\"min_reclamation_window\""
];

// max_reclamation_window is the maximum reclamation window duration allowed.
google.protobuf.Duration max_reclamation_window = 5 [
  (gogoproto.nullable)    = false,
  (gogoproto.stdduration) = true,
  (gogoproto.jsontag)     = "max_reclamation_window",
  (gogoproto.moretags)    = "yaml:\"max_reclamation_window\""
];
```

### 2.10 Modify: `proto/node/akash/deployment/v1beta4/deploymentmsg.proto`

Add to `MsgCreateDeployment`:

```protobuf
// reclamation specifies the deployment-level reclamation requirements.
// Nil means the tenant does not require reclamation.
akash.market.v1.DeploymentReclamation reclamation = 5 [
  (gogoproto.nullable) = true,
  (gogoproto.jsontag)  = "reclamation,omitempty",
  (gogoproto.moretags) = "yaml:\"reclamation,omitempty\""
];
```

### 2.11 Modify: `proto/node/akash/deployment/v1/deployment.proto`

Add to `Deployment`:

```protobuf
// reclamation stores the deployment's reclamation requirements for persistence.
// Needed so that StartGroup can propagate reclamation to newly created orders.
akash.market.v1.DeploymentReclamation reclamation = 5 [
  (gogoproto.nullable) = true,
  (gogoproto.jsontag)  = "reclamation,omitempty",
  (gogoproto.moretags) = "yaml:\"reclamation,omitempty\""
];
```

---

## 3. Go Interface Changes

### 3.1 Error Sentinels (`go/node/market/v1/errors.go`)

```go
ErrLeaseNotReclamable          = sdkerrors.Register(ModuleName, N, "lease does not have reclamation configured")
ErrLeaseAlreadyReclaiming      = sdkerrors.Register(ModuleName, N, "reclamation already in progress")
ErrReclamationNotStarted       = sdkerrors.Register(ModuleName, N, "reclamation not started; call MsgLeaseStartReclaim first")
ErrReclamationWindowNotElapsed = sdkerrors.Register(ModuleName, N, "reclamation window has not elapsed")
ErrReclamationWindowInvalid    = sdkerrors.Register(ModuleName, N, "reclamation window outside governance bounds")
ErrReclamationRequired         = sdkerrors.Register(ModuleName, N, "order requires reclamation but bid does not offer it")
ErrReclamationWindowTooShort   = sdkerrors.Register(ModuleName, N, "reclamation window shorter than order minimum")
```

Note: `ErrReclamationNotStarted` and `ErrReclamationWindowNotElapsed` are intentionally split into two
distinct errors. The former is returned when the provider tries to `CloseBid` on an `Active` lease that
has reclamation. The latter is returned when the provider tries to `CloseBid` on a `Reclaiming` lease
before the deadline.

#### Deployment Module Error (`go/node/deployment/v1/errors.go`)

```go
ErrInvalidReclamation = sdkerrors.Register(ModuleName, N, "invalid reclamation configuration")
```

This error is returned by the `CreateDeployment` handler when the tenant's `min_window` fails
validation against governance bounds (see [Section 4.6](#46-modified-createdeployment-xdeploymenthandlerservergo)).

### 3.2 Message Support (`go/node/market/v1beta5/msgs.go`)

```go
func NewMsgLeaseStartReclaim(id v1.LeaseID, reason v1.LeaseClosedReason) *MsgLeaseStartReclaim

func (msg *MsgLeaseStartReclaim) Type() string          // "MsgLeaseStartReclaim"
func (msg *MsgLeaseStartReclaim) Route() string          // v1.RouterKey
func (msg *MsgLeaseStartReclaim) GetSignBytes() []byte   // standard marshal

func (msg *MsgLeaseStartReclaim) GetSigners() []sdk.AccAddress {
    // signer is the provider
    provider, _ := sdk.AccAddressFromBech32(msg.ID.Provider)
    return []sdk.AccAddress{provider}
}

func (msg *MsgLeaseStartReclaim) ValidateBasic() error {
    if err := msg.ID.Validate(); err != nil {
        return err
    }
    if !msg.Reason.IsRange(v1.LeaseClosedReasonRangeProvider) {
        return cerrors.Wrapf(v1.ErrInvalidLeaseClosedReason, "value \"%d\" range 10000..19999", msg.Reason)
    }
    return nil
}
```

### 3.3 Codec Registration (`go/node/market/v1beta5/codec.go`)

In `init()`:
```go
sdkutil.RegisterCustomSignerField(&MsgLeaseStartReclaim{}, "id", "provider")
```

In `RegisterInterfaces`:
```go
registry.RegisterImplementations((*sdk.Msg)(nil),
    // ... existing ...
    &MsgLeaseStartReclaim{},
)
```

In `RegisterLegacyAminoCodec`:
```go
cdc.RegisterConcrete(&MsgLeaseStartReclaim{}, "akash-sdk/x/"+v1.ModuleName+"/"+(&MsgLeaseStartReclaim{}).Type(), nil)
```

### 3.4 Params (`go/node/market/v1beta5/params.go`)

```go
const (
    DefaultMinReclamationWindow = 1 * time.Hour
    DefaultMaxReclamationWindow = 720 * time.Hour // 30 days
)
```

Update `DefaultParams()` and `Validate()` accordingly.

---

## 4. Handler Pseudocode

### 4.1 LeaseStartReclaim (`x/market/handler/server.go`)

```go
func (ms msgServer) LeaseStartReclaim(goCtx context.Context, msg *mvbeta.MsgLeaseStartReclaim) (*mvbeta.MsgLeaseStartReclaimResponse, error) {
    ctx := sdk.UnwrapSDKContext(goCtx)

    lease, found := ms.keepers.Market.GetLease(ctx, msg.ID)
    if !found {
        return nil, mv1.ErrUnknownLease
    }

    if lease.State != mv1.LeaseActive {
        return nil, mv1.ErrLeaseNotActive
    }

    if lease.Reclamation == nil {
        return nil, mv1.ErrLeaseNotReclamable
    }

    if lease.Reclamation.StartedAt != 0 {
        return nil, mv1.ErrLeaseAlreadyReclaiming
    }

    blockTime := ctx.BlockTime()
    deadline := blockTime.Add(lease.Reclamation.Window)

    lease.Reclamation.StartedAt = ctx.BlockHeight()
    lease.Reclamation.Deadline = deadline.Unix()
    lease.Reclamation.Reason = msg.Reason
    lease.State = mv1.LeaseReclaiming

    if err := ms.keepers.Market.SaveLease(ctx, lease); err != nil {
        return nil, err
    }

    if err := ctx.EventManager().EmitTypedEvent(&mv1.EventLeaseReclaimStarted{
        ID:       lease.ID,
        Reason:   msg.Reason,
        Deadline: deadline.Unix(),
    }); err != nil {
        return nil, err
    }

    return &mvbeta.MsgLeaseStartReclaimResponse{}, nil
}
```

### 4.2 Modified CloseBid (`x/market/handler/server.go`)

The active-bid-with-lease path (currently lines 137-162) gains a reclamation check.
The existing lease state check at line 142 (`if lease.State != mv1.LeaseActive`) must be
**replaced** by the following switch block (not added after it):

```go
// Replaces the existing `if lease.State != mv1.LeaseActive` check at line 142.
// Must appear BEFORE the bid.State check at line 146.

switch lease.State {
case mv1.LeaseActive:
    if lease.Reclamation != nil {
        return nil, mv1.ErrReclamationNotStarted
    }
    // No reclamation -- proceed with existing close cascade
case mv1.LeaseReclaiming:
    if ctx.BlockTime().Unix() < lease.Reclamation.Deadline {
        return nil, mv1.ErrReclamationWindowNotElapsed
    }
    // Window elapsed -- proceed with existing close cascade
default:
    return nil, mv1.ErrLeaseNotActive
}

// ... existing close cascade (Deployment.OnBidClosed, OnLeaseClosed, etc.) ...
```

### 4.3 Modified CreateBid (`x/market/handler/server.go`)

After existing attribute/capability matching (around line 97), add reclamation validation:

```go
// Reclamation validation
if order.Reclamation != nil {
    if msg.ReclamationWindow == nil {
        return nil, mv1.ErrReclamationRequired
    }
    if *msg.ReclamationWindow < order.Reclamation.MinWindow {
        return nil, mv1.ErrReclamationWindowTooShort
    }
}

if msg.ReclamationWindow != nil {
    if *msg.ReclamationWindow < params.MinReclamationWindow {
        return nil, mv1.ErrReclamationWindowInvalid
    }
    if *msg.ReclamationWindow > params.MaxReclamationWindow {
        return nil, mv1.ErrReclamationWindowInvalid
    }
}

// Pass reclamation_window to CreateBid
bid, err := ms.keepers.Market.CreateBid(ctx, msg.ID, msg.Price, msg.ResourcesOffer, msg.ReclamationWindow)
```

### 4.4 Modified CreateLease (`x/market/handler/server.go`)

After `Market.CreateLease(ctx, bid)` succeeds (line 222), store reclamation config:

```go
if bid.ReclamationWindow != nil {
    lease, _ := ms.keepers.Market.GetLease(ctx, bid.ID.LeaseID())
    lease.Reclamation = &mv1.Reclamation{
        Window: *bid.ReclamationWindow,
    }
    ms.keepers.Market.SaveLease(ctx, lease)
}
```

Note: This performs a create followed by an immediate get-modify-save, resulting in two store writes
for the lease. An optimization would be to modify the `CreateLease` keeper method to accept an
optional `*mv1.Reclamation` parameter and set it during initial creation. Either approach is correct;
the two-write approach is shown here for clarity.

### 4.5 Modified CloseLease (`x/market/handler/server.go`)

Update the lease state check (line 267) to accept `LeaseReclaiming`:

```go
if lease.State != mv1.LeaseActive && lease.State != mv1.LeaseReclaiming {
    return &mvbeta.MsgCloseLeaseResponse{}, mv1.ErrOrderClosed
}
```

Pass reclamation to the re-order call (line 289):

```go
if _, err := ms.keepers.Market.CreateOrder(ctx, group.ID, group.GroupSpec, order.Reclamation); err != nil {
    return &mvbeta.MsgCloseLeaseResponse{}, err
}
```

### 4.6 Modified CreateDeployment (`x/deployment/handler/server.go`)

Validate reclamation against governance bounds, store on the Deployment, and pass to CreateOrder:

```go
// Validate reclamation window against market module params
if msg.Reclamation != nil {
    marketParams, err := ms.market.GetParams(ctx)  // requires adding GetParams to the MarketKeeper interface
    if err != nil {
        return nil, err
    }
    if msg.Reclamation.MinWindow <= 0 {
        return nil, v1.ErrInvalidReclamation
    }
    if msg.Reclamation.MinWindow < marketParams.MinReclamationWindow {
        return nil, v1.ErrInvalidReclamation
    }
    if msg.Reclamation.MinWindow > marketParams.MaxReclamationWindow {
        return nil, v1.ErrInvalidReclamation
    }
}

deployment := v1.Deployment{
    ID:          did,
    State:       v1.DeploymentActive,
    Hash:        msg.Hash,
    CreatedAt:   ctx.BlockHeight(),
    Reclamation: msg.Reclamation,   // NEW
}

// In the order creation loop:
for _, group := range groups {
    if _, err := ms.market.CreateOrder(ctx, group.ID, group.GroupSpec, msg.Reclamation); err != nil {
        return &types.MsgCreateDeploymentResponse{}, err
    }
}
```

Note: This requires adding `GetParams` to the `MarketKeeper` interface used by the deployment handler
(`x/deployment/imports/keepers.go`). Alternatively, the reclamation bounds could be stored as deployment
module parameters, but keeping them in the market module avoids parameter duplication.

### 4.7 Modified StartGroup (`x/deployment/handler/server.go`)

Retrieve reclamation from the persisted Deployment:

```go
deployment, found := ms.deployment.GetDeployment(ctx, msg.ID.DeploymentID())
if !found {
    return &types.MsgStartGroupResponse{}, v1.ErrDeploymentNotFound
}

if _, err := ms.market.CreateOrder(ctx, group.ID, group.GroupSpec, deployment.Reclamation); err != nil {
    return &types.MsgStartGroupResponse{}, err
}
```

---

## 5. Complete CreateOrder Call Site Inventory

All locations that call `CreateOrder` and must be updated to pass the `reclamation` parameter:

### Interface Definitions (2)

| File                                   | Line | Interface      |
|----------------------------------------|------|----------------|
| `node/x/market/keeper/keeper.go`       | 26   | `IKeeper`      |
| `node/x/deployment/imports/keepers.go` | 22   | `MarketKeeper` |

### Implementation (1)

| File                             | Line |
|----------------------------------|------|
| `node/x/market/keeper/keeper.go` | 153  |

### Production Call Sites (3)

| File                                  | Line | Context                    |
|---------------------------------------|------|----------------------------|
| `node/x/deployment/handler/server.go` | 101  | `CreateDeployment`         |
| `node/x/deployment/handler/server.go` | 226  | `StartGroup`               |
| `node/x/market/handler/server.go`     | 289  | `CloseLease` auto-re-order |

### Test Call Sites (3)

| File                                    | Line | Context                 |
|-----------------------------------------|------|-------------------------|
| `node/x/market/keeper/keeper_test.go`   | 27   | `Test_CreateOrder`      |
| `node/x/market/keeper/keeper_test.go`   | 503  | `createOrder` helper    |
| `node/x/market/handler/handler_test.go` | 1414 | `testSuite.createOrder` |

---

## 6. SDL Changes

### 6.1 New File: `go/sdl/reclamation.go`

SDL type for parsing the `reclamation` YAML block:

```go
type v2Reclamation struct {
    MinWindow string `yaml:"min_window"`
}

func (r *v2Reclamation) toDeploymentReclamation() (*dv1.DeploymentReclamation, error)
```

The `toDeploymentReclamation()` method parses the duration string via `time.ParseDuration`,
validates it is positive, and returns `*dv1.DeploymentReclamation`. Returns `nil, nil` when
the receiver is nil (no reclamation block in SDL).

### 6.2 SDL Interface Extension: `go/sdl/sdl.go`

A new method is added to the `SDL` interface:

```go
type SDL interface {
    DeploymentGroups() (dtypes.GroupSpecs, error)
    Manifest() (manifest.Manifest, error)
    Version() ([]byte, error)
    Reclamation() (*dv1.DeploymentReclamation, error)  // NEW
    validate() error
}
```

Implemented on `v2`, `v2_1`, and the `sdl` wrapper.

### 6.3 Modified: `go/sdl/v2.go` and `go/sdl/v2_1.go`

Both SDL version structs gain:

1. A `ReclaimCfg *v2Reclamation` field (with `yaml:"-"` tag since decoding is manual)
2. A `"reclamation"` case in the `UnmarshalYAML` switch
3. A `Reclamation()` method delegating to `ReclaimCfg.toDeploymentReclamation()`
4. Validation in `validate()` that calls `toDeploymentReclamation()` when `ReclaimCfg != nil`,
   ensuring invalid durations are caught at `sdl.Read()` time

### 6.4 Modified: `go/sdl/sdl-input.schema.yaml`

A new optional property is added to the top-level schema:

```yaml
reclamation:
  description: Deployment-level reclamation requirements (optional)
  additionalProperties: false
  properties:
    min_window:
      type: string
      minLength: 1
  required:
    - min_window
  type: object
```

Not added to the top-level `required` list -- the field is optional.

### 6.5 Modified: `go/cli/deployment_tx.go`

The `GetTxDeploymentCreateCmd` function calls `sdlManifest.Reclamation()` after parsing the SDL
and sets the result on `MsgCreateDeployment.Reclamation` before calling `ValidateBasic()`.

---

## 7. CLI Changes

### 7.1 New Flag: `--reclamation-window` on `tx market bid create`

**Flag definition** (`go/cli/flags/market.go`):

```go
func AddReclamationWindowFlag(flags *pflag.FlagSet) {
    flags.String(FlagReclamationWindow, "", "Reclamation window duration the provider offers (e.g. 24h, 720h). Optional.")
}

func ReclamationWindowFromFlags(flags *pflag.FlagSet) (*time.Duration, error)
```

Returns `nil` when the flag is empty (not specified). The `MsgCreateBid.ReclamationWindow` field
is set to the parsed value.

### 7.2 New Command: `tx market bid start-reclaim`

A new CLI command for providers to initiate reclamation on an active lease:

```
akash tx market bid start-reclaim \
  --from <provider-key> \
  --owner <owner> --dseq <dseq> --gseq <gseq> --oseq <oseq> \
  --reason <10000-19999>
```

The provider address is derived from the `--from` flag (the transaction signer), matching the
pattern used by `bid close`. The `--provider` flag is registered by the shared `LeaseIDFlags`
helper but is not needed when `--from` is specified.

Constructs and broadcasts `MsgLeaseStartReclaim`. Uses `LeaseIDFromFlags` (with
`WithProvider(cctx.FromAddress)`) for identifying the lease and `BidClosedReasonFromFlags`
for the reason (same `--reason` flag as `bid close`, validated to provider range 10000-19999).

Registered under `GetTxMarketBidCmds()` alongside `create` and `close`.

---

## 8. Upgrade Handler

The upgrade handler for this chain version must:

1. **Set default reclamation params** -- existing chains have zero-value `Duration` for
   `min_reclamation_window` and `max_reclamation_window`. These must be set to defaults before
   any reclamation transactions can be validated:

```go
params, _ := marketKeeper.GetParams(ctx)
params.MinReclamationWindow = 1 * time.Hour
params.MaxReclamationWindow = 720 * time.Hour
marketKeeper.SetParams(ctx, params)
```

2. **No data migration** -- existing leases have `reclamation = nil` (new nullable proto field).
   Existing orders and bids have `reclamation = nil` / `reclamation_window = nil`. No state
   migration is needed.

---

## 9. Testing Strategy

### Unit Tests (keeper_test.go)

- Create order with reclamation requirement; verify stored on order
- Create bid with `reclamation_window`; verify stored on bid
- Create lease from bid with reclamation; verify `Reclamation` stored on lease
- `MsgLeaseStartReclaim` on lease with reclamation; verify state transition to `LeaseReclaiming`
- `MsgLeaseStartReclaim` on lease without reclamation; verify `ErrLeaseNotReclamable`
- `MsgLeaseStartReclaim` on already-reclaiming lease; verify `ErrLeaseAlreadyReclaiming`
- `OnLeaseClosed` from `LeaseReclaiming` state; verify correct transition to `LeaseClosed`
- `OnGroupClosed` cascade with reclaiming lease; verify lease closed

### Handler Integration Tests (handler_test.go)

- Full flow: deploy with reclamation -> bid with window -> lease -> start reclaim -> advance time -> close
- `CreateBid` without reclamation on order that requires it -> `ErrReclamationRequired`
- `CreateBid` with window shorter than order minimum -> `ErrReclamationWindowTooShort`
- `CreateBid` with window outside governance bounds -> `ErrReclamationWindowInvalid`
- `CloseBid` on `LeaseActive` with reclamation -> `ErrReclamationNotStarted`
- `CloseBid` on `LeaseReclaiming` before deadline -> `ErrReclamationWindowNotElapsed`
- `CloseBid` on `LeaseReclaiming` after deadline -> success; group paused
- `CloseLease` (tenant) during reclamation window -> success; auto-re-order with reclamation inherited
- `CloseLease` (tenant) on `LeaseActive` with reclamation -> success (tenant always can close)
- Provider offers reclamation voluntarily (order does not require it) -> accepted; lease has reclamation
- Lease without reclamation -> existing behavior unchanged
- Escrow insufficient funds during reclamation -> lease closed, bypasses window
- `CreateDeployment` with `min_window < params.MinReclamationWindow` -> `ErrInvalidReclamation`
- `CreateDeployment` with `min_window > params.MaxReclamationWindow` -> `ErrInvalidReclamation`
- `CreateDeployment` with `min_window = 0` -> `ErrInvalidReclamation`
- `StartGroup` after reclamation close -> new order inherits reclamation from `Deployment`

### Genesis Tests

- Export/import round-trip with leases in `LeaseReclaiming` state
- Export/import with reclamation-configured orders and bids
