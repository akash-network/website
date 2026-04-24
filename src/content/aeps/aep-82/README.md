---
aep: 82
title: "Resource Reclamation"
author: Artur Troian (@troian)
status: Last Call
type: Standard
category: Core
created: 2026-04-22
---

## Motivation

Akash providers currently have two options when they need to terminate a lease: close it immediately (via
`MsgCloseBid`) or wait for the tenant to close it. Immediate closure is disruptive – the tenant's workloads
are terminated without warning, potentially causing data loss and downtime. There is no on-chain mechanism for
providers to give tenants advance notice of an upcoming termination.

This is a problem for several real-world provider scenarios:

- **Planned maintenance** – hardware upgrades, firmware updates, or data center moves require workload evacuation.
- **Decommissioning** – a provider retiring capacity needs to wind down active leases gracefully.
- **Resource rebalancing** – a provider may need to reclaim specific resources while continuing to serve others.

Without a grace period mechanism, providers either accept the reputational cost of abrupt termination or
indefinitely delay necessary infrastructure changes. Tenants, in turn, cannot distinguish between a provider
that will give them time to migrate and one that will cut them off without warning.

## Summary

This AEP introduces **Resource Reclamation**, a marketplace extension that provides a negotiated grace period
before provider-initiated lease termination.

1. **Tenant opt-in** - A tenant may specify a minimum reclamation window as a requirement in
   `MsgCreateDeployment`. Providers that do not support reclamation must not bid on such deployments.

2. **Provider opt-in** - A provider may offer a reclamation window in their bid, even for deployments that
   do not require it. If the deployment requires reclamation, the provider's offered window must meet or
   exceed the tenant's minimum.

3. **Negotiated window** – The reclamation window is a wall-clock duration negotiated between tenant and
   provider at bid time and stored on the lease when it is created.

4. **Reclamation initiation** – A provider initiates reclamation by sending `MsgLeaseStartReclaim`, which
   transitions the lease from `Active` to `Reclaiming` and sets a deadline.

5. **Window enforcement** – During the reclamation window, the provider cannot close the lease. The tenant
   can close at any time. Payments continue at the full lease rate. After the window elapses, either party
   may close the lease.

6. **Governance bounds** – Module parameters enforce minimum and maximum allowed reclamation window durations.

## Specification

This specification targets the current active proto versions: `market/v1beta5` for marketplace
messages and `deployment/v1beta4` for deployment messages. The `deployment/v1beta5` proto (not yet
active in the node) is not addressed and can be updated separately when it is adopted.

### Reclamation Configuration

#### Tenant Requirements

A tenant specifies reclamation requirements at the deployment level via a new field on `MsgCreateDeployment`:

```
DeploymentReclamation {
  min_window: Duration    // minimum reclamation window the tenant requires
}
```

This is a deployment-wide setting. All groups within the deployment share the same reclamation requirement.
The configuration is persisted on the `Deployment` on-chain record so that it survives group restarts
(`MsgStartGroup` must propagate the reclamation requirement to newly created orders).

When set, the requirement is propagated to every `Order` created for the deployment's groups.

When not set (nil), the deployment does not require reclamation. Providers may still voluntarily offer it.

#### Provider Offers

A provider includes a reclamation window in their bid via a new field on `MsgCreateBid`:

```
reclamation_window: Duration    // optional; nil means provider does not offer reclamation
```

The offered window is stored on the `Bid` and, upon lease creation, on the `Lease`.

#### Matching Rules

During bid validation (`CreateBid` handler):

1. If the order requires reclamation (`order.Reclamation != nil`) and the bid does not offer it
   (`msg.ReclamationWindow == nil`), the bid is rejected with `ErrReclamationRequired`.

2. If the order requires reclamation and the bid's window is shorter than the order's minimum
   (`msg.ReclamationWindow < order.Reclamation.MinWindow`), the bid is rejected with
   `ErrReclamationWindowTooShort`.

3. If the bid offers reclamation, the window must be within governance bounds
   (`params.MinReclamationWindow <= window <= params.MaxReclamationWindow`), regardless of whether the
   order requires it.

4. If the order does not require reclamation and the bid does not offer it, no reclamation checks apply
   (existing behavior, unchanged).

#### Deployment Validation

When `MsgCreateDeployment` includes a `reclamation` field, the `min_window` is validated:

- `min_window` must be > 0
- `min_window` must be >= `params.MinReclamationWindow`
- `min_window` must be <= `params.MaxReclamationWindow`

This validation occurs in the `CreateDeployment` handler (not `ValidateBasic`, since governance
parameters are not available during basic validation). If the `min_window` fails validation, the
deployment creation is rejected.

#### Lease Creation

When `MsgCreateLease` is processed and the winning bid offers a reclamation window:

- The lease is created with a `Reclamation` record containing the negotiated window duration.
- The `Reclamation.StartedAt`, `Reclamation.Deadline`, and `Reclamation.Reason` fields are zero/empty
  until the provider initiates reclamation.

When the winning bid does not offer a reclamation window, the lease has no `Reclamation` record (nil),
and all existing lease lifecycle behavior is unchanged.

### Lease State Machine

A new lease state `LeaseReclaiming` (value `4`) is added to the `Lease.State` enum:

```
LeaseStateInvalid       = 0
LeaseActive             = 1
LeaseInsufficientFunds  = 2
LeaseClosed             = 3
LeaseReclaiming         = 4    // NEW
```

#### State Transitions

```
                      MsgCreateLease
                           |
                           v
                     +-----------+
                     | Active(1) |
                     +-----+-----+
                           |
        +------------------+------------------------+
        |                  |                        |
  MsgLeaseStartReclaim  MsgCloseLease          Escrow cascade /
  (provider only)        (tenant only)          MsgCloseDeployment /
        |                  |                    InsufficientFunds
        v                  v                        |
  +--------------+   +----------+     +--------------------+
  |Reclaiming(4) |   | Closed(3)|     |InsufficientFunds(2)|
  +------+-------+   +----------+     +--------------------+
         |
    +----+------------------+-------------------+
    |                       |                   |
  MsgCloseLease          MsgCloseBid          Escrow cascade /
  (tenant, anytime)      (provider,           MsgCloseDeployment /
                          after window)       InsufficientFunds
    |                       |                   |
    v                       v                   v
  +----------+        +----------+   +--------------------+
  | Closed(3)|        | Closed(3)|   |InsufficientFunds(2)|
  +----------+        +----------+   +--------------------+
```

### MsgLeaseStartReclaim

A new transaction message sent by the provider to initiate reclamation on an active lease.

```
MsgLeaseStartReclaim {
  id:     LeaseID              // the lease to reclaim
  reason: LeaseClosedReason    // must be in provider range (10000-19999)
}
```

**Signer:** `id.Provider`

**Validation:**
- Lease must exist
- Lease must be in `LeaseActive` state
- Lease must have a `Reclamation` record (non-nil) -- otherwise `ErrLeaseNotReclamable`
- Reclamation must not have been started already (`Reclamation.StartedAt == 0`) -- otherwise
  `ErrLeaseAlreadyReclaiming`
- Reason must be in provider range (10000-19999)

**Effects:**
1. `Lease.State` transitions from `LeaseActive` to `LeaseReclaiming`
2. `Lease.Reclamation.StartedAt` is set to the current block height
3. `Lease.Reclamation.Deadline` is set to `block_time + Reclamation.Window` (unix timestamp)
4. `Lease.Reclamation.Reason` is set to the provided reason
5. `EventLeaseReclaimStarted` is emitted

### Window Enforcement

#### Provider Close During Reclamation

When a provider sends `MsgCloseBid` on a lease with reclamation:

- If the lease is in `LeaseActive` state and has reclamation configured, the close is rejected with
  `ErrReclamationNotStarted`. The provider must first send `MsgLeaseStartReclaim`.

- If the lease is in `LeaseReclaiming` state and the current block time is before the reclamation
  deadline, the close is rejected with `ErrReclamationWindowNotElapsed`.

- If the lease is in `LeaseReclaiming` state and the current block time is at or past the reclamation
  deadline, the close proceeds normally (existing `CloseBid` cascade: group paused, order closed,
  bid closed, lease closed, escrow payment closed).

#### Tenant Close During Reclamation

The tenant can always close the lease via `MsgCloseLease`, regardless of the reclamation state. If the
lease is in `LeaseReclaiming`, it transitions directly to `LeaseClosed`.

The existing `CloseLease` auto-re-order behavior applies: the deployment group remains open and a new
order is automatically created (with the reclamation requirement inherited from the original order).
This differs from provider-initiated close (see [After Reclamation Close](#after-reclamation-close)),
which pauses the group and does not auto-re-order.

#### Escrow-Initiated Close During Reclamation

If the deployment's escrow account is closed (insufficient funds or `MsgCloseDeployment`) while a lease
is in `LeaseReclaiming`, the lease is closed immediately, bypassing the reclamation window. This is
intentional: if funds run out or the tenant voluntarily closes their deployment, reclamation is moot.

#### Payments During Reclamation

The provider continues serving workloads and receiving payment at the full lease rate throughout the
reclamation window. The escrow payment stream is not modified. The provider can still call
`MsgWithdrawLease` to withdraw accrued funds during reclamation.

### After Reclamation Close

When the provider closes a lease after the reclamation window via `MsgCloseBid`, the existing `CloseBid`
cascade applies:

1. `Deployment.OnBidClosed` is called, which **pauses** the deployment group
2. The lease, bid, and order are closed
3. The escrow payment is closed

This is identical to the current `MsgCloseBid` behavior. No automatic re-ordering occurs. The tenant
must manually call `MsgStartGroup` to re-open bidding for the group.

Note: After a reclamation-initiated close, the lease carries two reason fields:
- `Lease.Reclamation.Reason` -- the reason the provider gave when starting reclamation
  (set by `MsgLeaseStartReclaim`)
- `Lease.Reason` -- the reason attached to the final close (set by `MsgCloseBid`, passed through
  `OnLeaseClosed`)

These serve different purposes. The reclamation reason explains *why the provider initiated the
grace period*. The close reason explains *why the bid was ultimately closed*. They may differ
(e.g., reclamation started for maintenance, bid closed for decommissioning).

### Governance Parameters

Two new parameters are added to the market module's `Params`:

| Parameter                | Type       | Default          | Description                                 |
|--------------------------|------------|------------------|---------------------------------------------|
| `min_reclamation_window` | `Duration` | `1h`             | Minimum reclamation window duration allowed |
| `max_reclamation_window` | `Duration` | `720h` (30 days) | Maximum reclamation window duration allowed |

Constraints:
- `min_reclamation_window` must be > 0
- `max_reclamation_window` must be > `min_reclamation_window`

Both the tenant's `min_window` requirement (validated at deployment creation) and the provider's
offered `reclamation_window` (validated at bid creation) must fall within these bounds.

### Events

A new event type is introduced:

```
EventLeaseReclaimStarted {
  id:       LeaseID
  reason:   LeaseClosedReason
  deadline: int64              // unix timestamp when the reclamation window expires
}
```

### Query Support

The new `LeaseReclaiming` state is automatically queryable through the existing lease query infrastructure:

- The lease state index (secondary index on `int32(state)`) automatically includes the new state value
- `LeaseFilters.State` accepts the new enum value to filter for leases in reclamation (the exact
  string representation depends on proto enum registration -- typically the proto field name
  `"reclaiming"` or the numeric value `4`)
- The "all leases" query (no state filter) includes reclaiming leases

### Reclamation Data Model

#### Deployment-Level Configuration

```
DeploymentReclamation {
  min_window: Duration    // minimum reclamation window the tenant requires
}
```

Stored on:
- `MsgCreateDeployment.reclamation` (input)
- `Deployment.reclamation` (persisted for `StartGroup` re-order)
- `Order.reclamation` (propagated for bid validation)

#### Lease-Level State

```
Reclamation {
  window:     Duration           // negotiated window duration (from winning bid)
  started_at: int64              // block height when reclamation started (0 = not started)
  deadline:   int64              // unix timestamp when window expires (0 = not started)
  reason:     LeaseClosedReason  // provider's stated reason
}
```

Stored on `Lease.reclamation` (nullable; nil means no reclamation configured).

### Error Codes

#### Market Module (`x/market`)

| Error                            | Description                                                   |
|----------------------------------|---------------------------------------------------------------|
| `ErrLeaseNotReclamable`          | Lease does not have reclamation configured                    |
| `ErrLeaseAlreadyReclaiming`      | Reclamation has already been started on this lease            |
| `ErrReclamationNotStarted`       | Provider must call `MsgLeaseStartReclaim` before closing      |
| `ErrReclamationWindowNotElapsed` | Reclamation window has not yet expired                        |
| `ErrReclamationWindowInvalid`    | Window duration outside governance bounds                     |
| `ErrReclamationRequired`         | Order requires reclamation but bid does not offer it          |
| `ErrReclamationWindowTooShort`   | Provider's offered window is shorter than the order's minimum |

#### Deployment Module (`x/deployment`)

| Error                   | Description                                                                          |
|-------------------------|--------------------------------------------------------------------------------------|
| `ErrInvalidReclamation` | Reclamation `min_window` is invalid (zero, below min, or above max governance bound) |
