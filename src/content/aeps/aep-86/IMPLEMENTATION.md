# AEP-86 Implementation Guide

> Companion to [AEP-86: Provider Verification Tiers](./README.md) (the authoritative specification).
>
> This document contains **implementation-specific details only**: protobuf definitions, Go interfaces,
> codebase-specific notes, and error codes. It does not repeat specification-level content.
> For the design, behavior, rules, and rationale, see [README.md](./README.md).

---

## 1. Codebase-Specific Implementation Notes

These notes address concerns specific to the existing Akash codebase that are not covered in the specification.

### 1.1 Sybil Prevention Note

[Attestation Submission](./README.md#attestation-submission) step 2 validates `auditor != provider`. However,
an operator could control multiple addresses. Full Sybil prevention beyond address-level checks is handled by
governance approval of auditors -- only governance-approved auditors can submit attestations, and the governance
process is expected to vet auditor independence.

### 1.2 x/provider Enhancement: Registration Timestamp

[On-chain prerequisite enforcement](./README.md#on-chain-prerequisite-enforcement) requires the provider's
registration timestamp via `GetRegistrationTime`. This may require a minor addition to `x/provider` if the
timestamp is not currently stored.

If `x/provider` only stores the provider record without a timestamp, the migration that introduces
`x/verification` must backfill registration times:
- For new providers: store `block_time` of the `MsgCreateProvider` transaction
- For existing providers at migration: set `registered_at` to the upgrade block time (conservative default
  that does not grandfather providers into time-based prerequisites they may not have actually met)

### 1.3 x/market Enhancement: Lease Close Reasons

The [completion rate calculation](./README.md#cross-module-keeper-interfaces) requires distinguishing lease
close reasons. The `x/market` module currently tracks `LeaseClosedReasonOwner` (in `server.go`). This must
be expanded:

- `LeaseClosedReasonTenant` -- tenant initiated the close (counts as "completed")
- `LeaseClosedReasonProvider` -- provider initiated the close (counts as "terminated")
- `LeaseClosedReasonInsufficientFunds` -- escrow depleted (counts as "completed")

Only `LeaseClosedReasonProvider` counts against the provider's completion rate.

### 1.4 Bond Calculation Unit Conversions

The [bond calculation formula](./README.md#bond-calculation) uses `ResourceSummary` fields that are in MB,
while governance parameters are per-GB and per-TB. The implementation must apply unit conversions:

```
required_bond(tier) = (
    resource_summary.total_gpus       * bond_per_gpu[tier]                    +
    resource_summary.total_vcpus      * bond_per_vcpu[tier]                   +
    resource_summary.total_memory_mb  * bond_per_memory_gb[tier]  / 1024      +
    resource_summary.total_storage_mb * bond_per_storage_tb[tier] / 1048576
)
```

### 1.5 Bond Posting Without Snapshot Hash

A provider without a snapshot hash can still post a bond via `MsgPostProviderBond` (the module accepts any
amount). However, auditors cannot submit L2+ attestations until the snapshot hash exists, because
[on-chain prerequisite enforcement](./README.md#on-chain-prerequisite-enforcement) for L2+ requires snapshot
compliance, which requires a snapshot hash record to exist.

### 1.6 Feature Flag: `verification_module_active`

During the [migration period](./README.md#migration-from-aep-9), a governance parameter
`verification_module_active` (default: `false`) controls bid-matching behavior in `x/market`:

- `false`: market module uses `x/audit` for bid matching (current behavior). `VerificationRequirement`
  fields in SDL are accepted but not enforced.
- `true`: market module uses `x/verification` for bid matching. `x/audit` matching is retained only
  for existing deployments created before activation.

`x/market` keeps both keeper dependencies during Phase 1 and Phase 2. Bid filtering should be routed through a
market-owned adapter that evaluates legacy `AttributesFilters`, new `VerificationRequirement`, or both. Mixed orders
require both filters to pass after activation.

### 1.7 Keeper Cycle Resolution

`x/verification` needs read-only lease stats from `x/market`, and `x/market` needs read-only verification facts from
`x/verification`. Avoid a concrete keeper construction cycle by using narrow interfaces and late binding:

- `x/verification` receives `MarketStatsKeeper`, which only exposes `GetProviderLeaseStats`.
- `x/market` receives `VerificationKeeper`, which only exposes bid-filtering queries.
- App wiring constructs both keepers, then sets the interfaces. Neither module imports the other's concrete keeper type.

### 1.8 Audit Escrow Payment Flow

`MsgSubmitAttestation` remains auditor-signed only. Provider funds are collected through `MsgOpenAuditEscrow`, a
provider-signed message that creates an `AuditEscrowRecord`. The submit handler consumes the escrow by `audit_escrow_id`
and must not debit the provider account during `MsgSubmitAttestation`. `MsgOpenAuditEscrow` does not name an auditor.
There is no auditor acceptance or claim transaction in v1. The first valid `MsgSubmitAttestation` that references an
open, matching, unexpired escrow consumes it and records the submitting auditor.
The attestation must include at least the escrow's requested capabilities, but it may include additional capabilities
the auditor verified.

AEP-86 v1 uses one `x/verification` module account to hold verification funds and typed `x/verification` KV records to
track why each amount is held and how it can be released.

The escrow prefixes in this AEP are KV-store prefixes for verification records. They are not separate bank module
accounts. Audit escrow records and grace records use dynamic marshalled envelopes so the module can decode different
verification lifecycle records cleanly. Auditor deposits and pending discrepancy state remain fields on
`AttestationRecord` and `DiscrepancyEvent` in v1.

The provider deposit cannot be redirected or slashed by an auditor alone. Provider-signed cancellation can only return
provider-funded coins to the provider while the escrow is open and unconsumed. Any path that slashes the provider
deposit to the community pool must be signed by governance authority with typed fault attribution and an evidence hash.

Handler path:

- `MsgOpenAuditEscrow`: validate provider registration, minimum fee, provider deposit parameter, and expiry. Transfer
  `fee + provider_deposit` from provider to the `x/verification` module account. Store `AuditEscrowRecord` as `Open`,
  with fee and provider deposit statuses set to escrowed, and enqueue expiry.
- `MsgCancelAuditEscrow`: require provider signer, `Open` status, and `block_time < expires_at`. Return fee and provider
  deposit to the provider, set status `Cancelled`, and set settlement reason `CancelledUnconsumed`.
- `MsgSettleAuditEscrow`: require governance authority and an unconsumed escrow. The reason must be `ProviderFault` or
  `NoFault`, and `fault_attribution` must match the reason. `NoFault` returns provider-funded coins to the provider.
  `ProviderFault` returns the fee to the provider and slashes the provider deposit to the community pool. The handler
  must reject missing evidence or ambiguous fault attribution. V1 does not pay an auditor from an unconsumed escrow unless
  an attestation was submitted.
- `MsgSubmitAttestation`: require `Open` status and `block_time < expires_at`, validate provider, tier, and requested
  capabilities, then set status `Consumed`, record `consumed_by_auditor`, and move the fee lifecycle onto the
  attestation record.

### 1.9 Signing Key Enforcement Deferred

AEP-86 v1 evidence may include observed software version, binary digest, and signature bytes, but the module does not
implement on-chain signing enforcement. Do not add signing-key state, key-type definitions, governance messages,
signing-key queries, or signature rejection rules in the v1 module. Those belong to a separate signing-key AEP or phase
2 change.

### 1.10 V1 Auditor Software Deliverable

Activation requires a reference auditor CLI or agent that can collect audit inputs, evaluate tier checks, emit canonical
evidence, consume audit escrows, submit attestations, and revoke attestations with typed reasons. Treat this as part of
the AEP-86 v1 implementation scope, alongside the module and market wiring.

The auditor software has two workflow phases:

- Baseline phase: run the initial benchmark, record the provider state, and commit the baseline artifact through
  `evidence_hash`.
- Sustained validation phase: rerun checks during the TTL and compare current results to the baseline. Failed sustained
  validation drives typed revocation or lower-tier replacement.

### 1.11 Fund Settlement

V1 should not add a generic delayed-settlement proposal path. Implement a shared settlement helper used by ordinary
terminal states, `ResolveDiscrepancy`, `MsgSettleAuditEscrow` when the governance authority settles an unconsumed
escrow, and discrepancy timeout handling. The helper updates explicit fee and deposit status fields and rejects
ambiguous settlement requests that do not provide a concrete fault attribution or deterministic timeout rule.

### 1.12 x/provider Maintenance Notices

AEP-86 adds provider-to-tenant maintenance signaling to `x/provider`, not `x/verification`. The chain stores the
provider's maintenance window and emits typed events. Tenant delivery is handled by clients, indexers, REST services,
or Console after they map the provider event to active leases in `x/market`.

The current provider module already owns provider identity and registration. Keep the maintenance state in that module
so the signer check is local and the notification feature does not create another dependency from `x/verification`.
No provider-module EndBlocker is required for phase 1. A maintenance window is treated as scheduled, active, elapsed,
or closed by comparing the record to block time in query code. Queries must derive status from the record and block
time instead of trusting the active-maintenance index alone.

Required `x/provider` additions:

- Add provider maintenance protobuf types to the provider chain SDK package, currently
  `pkg.akt.dev/go/node/provider/v1beta4`.
- Add `MsgOpenProviderMaintenance` and `MsgCloseProviderMaintenance` to the provider `Msg` service.
- Add provider maintenance queries to the provider `Query` service.
- Add typed events for open and close.
- Add provider module params for maintenance duration and scheduling lookahead. If `x/provider` does not already have a
  params record, this change must add one to provider genesis import and export.

Suggested protobuf shape:

```protobuf
enum ProviderMaintenanceType {
    provider_maintenance_type_unspecified = 0;
    provider_maintenance_type_planned = 1;
    provider_maintenance_type_emergency = 2;
    provider_maintenance_type_security = 3;
    provider_maintenance_type_network = 4;
    provider_maintenance_type_capacity = 5;
}

enum ProviderMaintenanceStatus {
    provider_maintenance_status_unspecified = 0;
    provider_maintenance_status_scheduled = 1;
    provider_maintenance_status_active = 2;
    provider_maintenance_status_elapsed = 3;
    provider_maintenance_status_closed = 4;
}

message ProviderMaintenanceRecord {
    uint64 id = 1;
    string provider = 2 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    ProviderMaintenanceType maintenance_type = 3;
    google.protobuf.Timestamp starts_at = 4 [(gogoproto.stdtime) = true, (gogoproto.nullable) = false];
    google.protobuf.Timestamp expected_ends_at = 5 [(gogoproto.stdtime) = true, (gogoproto.nullable) = false];
    google.protobuf.Timestamp opened_at = 6 [(gogoproto.stdtime) = true, (gogoproto.nullable) = false];
    google.protobuf.Timestamp closed_at = 7 [(gogoproto.stdtime) = true];
    bytes metadata_hash = 8;
}

message ProviderMaintenanceWithStatus {
    ProviderMaintenanceRecord record = 1 [(gogoproto.nullable) = false];
    ProviderMaintenanceStatus status = 2;
}

message ProviderMaintenanceParams {
    google.protobuf.Duration maintenance_max_duration = 1
        [(gogoproto.stdduration) = true, (gogoproto.nullable) = false];
    google.protobuf.Duration maintenance_max_lookahead = 2
        [(gogoproto.stdduration) = true, (gogoproto.nullable) = false];
}

message MsgOpenProviderMaintenance {
    option (cosmos.msg.v1.signer) = "provider";
    option (amino.name) = "akash/provider/v1beta4/MsgOpenProviderMaintenance";

    string provider = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    ProviderMaintenanceType maintenance_type = 2;
    google.protobuf.Timestamp starts_at = 3 [(gogoproto.stdtime) = true, (gogoproto.nullable) = false];
    google.protobuf.Timestamp expected_ends_at = 4 [(gogoproto.stdtime) = true, (gogoproto.nullable) = false];
    bytes metadata_hash = 5;
}
message MsgOpenProviderMaintenanceResponse {
    uint64 maintenance_id = 1;
}

message MsgCloseProviderMaintenance {
    option (cosmos.msg.v1.signer) = "provider";
    option (amino.name) = "akash/provider/v1beta4/MsgCloseProviderMaintenance";

    string provider = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    uint64 maintenance_id = 2;
}
message MsgCloseProviderMaintenanceResponse {}
```

Suggested query shape:

```protobuf
service Query {
    rpc ProviderMaintenance(QueryProviderMaintenanceRequest) returns (QueryProviderMaintenanceResponse) {
        option (google.api.http).get = "/akash/provider/v1beta4/providers/{provider}/maintenance/{maintenance_id}";
    }

    rpc ProviderMaintenances(QueryProviderMaintenancesRequest) returns (QueryProviderMaintenancesResponse) {
        option (google.api.http).get = "/akash/provider/v1beta4/providers/{provider}/maintenance";
    }
}

message QueryProviderMaintenanceRequest {
    string provider = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    uint64 maintenance_id = 2;
}
message QueryProviderMaintenanceResponse {
    ProviderMaintenanceWithStatus maintenance = 1 [(gogoproto.nullable) = false];
}

message QueryProviderMaintenancesRequest {
    string provider = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    ProviderMaintenanceStatus status_filter = 2;
    cosmos.base.query.v1beta1.PageRequest pagination = 3;
}
message QueryProviderMaintenancesResponse {
    repeated ProviderMaintenanceWithStatus maintenance = 1 [(gogoproto.nullable) = false];
    cosmos.base.query.v1beta1.PageResponse pagination = 2;
}
```

Suggested events:

```protobuf
message EventProviderMaintenanceOpened {
    uint64 maintenance_id = 1;
    string provider = 2 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    ProviderMaintenanceType maintenance_type = 3;
    google.protobuf.Timestamp starts_at = 4 [(gogoproto.stdtime) = true, (gogoproto.nullable) = false];
    google.protobuf.Timestamp expected_ends_at = 5 [(gogoproto.stdtime) = true, (gogoproto.nullable) = false];
    bytes metadata_hash = 6;
}

message EventProviderMaintenanceClosed {
    uint64 maintenance_id = 1;
    string provider = 2 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    google.protobuf.Timestamp closed_at = 3 [(gogoproto.stdtime) = true, (gogoproto.nullable) = false];
}
```

Handler rules:

- `MsgOpenProviderMaintenance` validates that `provider` is registered in `x/provider`.
- The provider address is the signer.
- `maintenance_type` must not be unspecified.
- `expected_ends_at` must be after `starts_at`.
- `expected_ends_at - starts_at` must be less than or equal to `maintenance_max_duration`.
- `starts_at` must be no later than `block_time + maintenance_max_lookahead`.
- V1 allows at most one scheduled or active maintenance window per provider. The keeper can enforce this with an
  active-maintenance index keyed by provider address. When opening a new window, if the existing indexed record has
  `block_time >= expected_ends_at`, clear the stale index and allow the new window.
- `MsgCloseProviderMaintenance` validates that the record exists, belongs to the signer, and has not already been
  closed. It sets `closed_at = block_time`, clears the active-maintenance index if it points at this record, and emits
  `EventProviderMaintenanceClosed`.

Suggested provider store additions:

```text
ProviderMaintenancePrefix | maintenance_id                 -> ProviderMaintenanceRecord
ProviderMaintenanceByOwnerPrefix | provider | maintenance_id -> []byte
ProviderActiveMaintenancePrefix | provider                 -> maintenance_id
ProviderNextMaintenanceIDPrefix                           -> uint64
ProviderParamsPrefix                                      -> ProviderMaintenanceParams
```

The exact byte prefixes must be chosen in the provider chain SDK package so they do not collide with the existing
provider record prefix.

Client alert flow:

1. A provider tx emits `EventProviderMaintenanceOpened`.
2. An indexer, REST service, WebSocket listener, or Console backend observes the event.
3. The listener queries `x/market` active leases for the provider.
4. The listener maps lease owners to tenant notification preferences outside consensus.
5. Console or another tenant-facing client delivers the alert through the tenant's selected channel.
6. Clients query `ProviderMaintenances` when loading a provider, lease, or deployment view so a missed event does not
   hide an active or scheduled window.

This feature does not require the chain to store email addresses, webhooks, Slack destinations, Discord destinations,
Telegram destinations, or tenant acknowledgement state.

Minimum tests:

- Opening maintenance fails for an address that is not a registered provider.
- Opening maintenance fails for unspecified type, invalid time order, excessive duration, excessive lookahead, or an
  already scheduled or active provider window.
- Opening a new maintenance window clears a stale active-maintenance index when the previous window has elapsed.
- Opening maintenance stores the record, creates the provider indexes, and emits `EventProviderMaintenanceOpened`.
- Closing maintenance fails for a different signer or an unknown record.
- Closing maintenance sets `closed_at`, clears the active-maintenance index, and emits `EventProviderMaintenanceClosed`.
- Queries return derived `Scheduled`, `Active`, `Elapsed`, and `Closed` statuses from block time and `closed_at`.
- A client or integration test can map a maintenance event to active leases through existing `x/market` lease queries.

---

## 2. Store Key Design Rationale

Supplements [Store Layout and Indexing](./README.md#store-layout-and-indexing) with design rationale.

### 2.1 Key Design Choices

- **Attestation primary key** is `(provider, auditor)` because the most common query pattern is "get all
  attestations for a provider" (prefix scan on `0x02 | provider_addr`).
- **Auditor secondary index** (`0x10`) enables the reverse lookup without duplicating attestation data.
- **Audit escrow indexes** (`0x11`, `0x12`) allow provider and auditor escrow queries without scanning all escrows.
  The auditor index is created only after an auditor consumes the escrow with `MsgSubmitAttestation`.
- **Dynamic verification records** under `0x08` and `0x0A` use `VerificationStoreRecord` envelopes with `type_url`
  and bytes so newly added escrow or verification lifecycle records can be decoded cleanly by registered decoders.
  These are record prefixes. They do not imply separate module accounts.
- **Time queues** use big-endian timestamps so that lexicographic ordering equals chronological ordering,
  allowing efficient `KVStorePrefixIterator` up to the current block time.
- **Unbonding sequence** (`seq` in `0x23`) allows multiple concurrent unbonding entries for the same provider
  (from multiple partial withdrawals).

### 2.2 Queue Lifecycle

When inserting a queue entry:
- Attestation submitted -> add to `0x20` with `expires_at` from TTL
- Auditor registered/renewed -> add to `0x21` with `renewal_deadline`
- Snapshot hash posted -> remove old `0x22` entry (if any), add new with `compliance_deadline`
- Bond withdrawal initiated -> add to `0x23` with `completion_time`
- Auditor resignation/lapse -> add to `0x24` with `completion_time`
- Audit escrow opened -> add to `0x26` with `expires_at`
- Discrepancy grace created -> add to `0x27` with `expires_at`

When processing a queue entry ([EndBlocker](./README.md#endblocker-design)):
- Process the state transition
- Delete the queue entry
- If the state transition creates a new deadline (e.g., attestation replacement), insert a new queue entry

### 2.3 Gas Considerations

Per-block caps prevent unbounded gas usage:
- If a queue has more entries than the cap, remaining entries are processed in subsequent blocks
- Entries are always processed in chronological order (oldest first)
- The caps are governance parameters, adjustable without chain upgrades
- Under normal conditions, most blocks will process zero or very few entries

---

## 3. Go Interface Definitions

> **Note**: This section is the authoritative reference for code interfaces. The [specification](./README.md)
> contains language-neutral pseudocode for the same interfaces. Where the two diverge, this document takes
> precedence for implementation.

### 3.1 Cross-Module Keeper Interfaces

The `x/verification` module requires read-only access to other modules:

```go
// ProviderKeeper -- from x/provider
type ProviderKeeper interface {
    Get(ctx sdk.Context, id sdk.Address) (ptypes.Provider, bool)
    GetRegistrationTime(ctx sdk.Context, id sdk.Address) (time.Time, bool)
}

// MarketKeeper -- from x/market
type MarketKeeper interface {
    GetProviderLeaseStats(ctx sdk.Context, provider sdk.Address, since time.Time) (LeaseStats, error)
}

// LeaseStats aggregates lease outcomes for a provider
type LeaseStats struct {
    TotalLeases          uint64  // all leases in the window
    CompletedByTenant    uint64  // leases closed by tenant or ran to completion
    TerminatedByProvider uint64  // leases closed by provider prematurely
}
```

### 3.2 Tier Comparison Convention

Tier enum values are ordered by trust (`TierIdentified=1` is the lowest attested tier, `TierTrusted=4` is the
highest). Use these helpers rather than raw operators so call sites stay consistent and `TierUnspecified` is handled.

```go
// TierAtLeast returns true if 'have' is at least as trusted as 'need'.
// Both must be valid tiers (not TierUnspecified).
func TierAtLeast(have, need VerificationTier) bool {
    return have != TierUnspecified && have >= need
}

// TierBetter returns true if 'a' is strictly more trusted than 'b'.
func TierBetter(a, b VerificationTier) bool {
    return a != TierUnspecified && a > b
}
```

### 3.3 VerificationKeeper Interface (consumed by x/market)

```go
// VerificationKeeper -- from x/verification, used by x/market for bid filtering
type VerificationKeeper interface {
    // IsVerificationActive returns the verification_module_active governance parameter.
    // x/market uses this to decide whether VerificationRequirement is enforced.
    IsVerificationActive(ctx sdk.Context) bool

    // GetProviderValidAttestations returns all Valid, non-expired attestations for a provider.
    // Does NOT filter by snapshot compliance -- caller must check separately.
    GetProviderValidAttestations(ctx sdk.Context, provider sdk.Address) ([]AttestationRecord, bool)

    // IsProviderSnapshotCompliant returns true if the provider is NOT snapshot-suspended.
    // Returns true if the provider has no snapshot record (L0 providers don't need one).
    IsProviderSnapshotCompliant(ctx sdk.Context, provider sdk.Address) bool

    // GetProviderBestTier returns the best (highest numeric enum value = highest trust) tier
    // from valid attestations. Returns TierUnspecified if no valid attestations exist.
    GetProviderBestTier(ctx sdk.Context, provider sdk.Address) VerificationTier

    // GetProviderGraceTier returns the active discrepancy grace tier, if one exists.
    // x/market uses this for tier filtering only when verification filtering is active.
    GetProviderGraceTier(ctx sdk.Context, provider sdk.Address) (VerificationTier, bool)

    // ProviderHasCapability returns true if any valid attestation for this provider
    // includes the given capability flag.
    ProviderHasCapability(ctx sdk.Context, provider sdk.Address, cap CapabilityFlag) bool

    // CountQualifiedAuditors returns the number of independent auditors with valid
    // attestations at minTier or better. Named auditor requirements are checked separately.
    CountQualifiedAuditors(
        ctx sdk.Context,
        provider sdk.Address,
        minTier VerificationTier,
    ) uint32
}
```

### 3.4 Market Module Bid Filtering (x/market/handler/server.go)

Extends the current audit-based matching in `CreateBid`:

```go
// Existing legacy audit check remains in place during migration:
//   provAttr, _ := ms.keepers.Audit.GetProviderAttributes(ctx, provider)
//   provAttr = append([]atypes.AuditedProvider{{...}}, provAttr...)
//   if !order.MatchRequirements(provAttr) { return nil, mv1.ErrAttributeMismatch }

// New verification check:
verReq := order.VerificationRequirement()
verificationActive := ms.keepers.Verification.IsVerificationActive(ctx)

if verificationActive && verReq.MinTier != TierUnspecified {
    // L2+ orders must reject snapshot-suspended providers even if a grace tier exists.
    if TierAtLeast(verReq.MinTier, TierVerified) {
        if !ms.keepers.Verification.IsProviderSnapshotCompliant(ctx, provider) {
            return nil, mv1.ErrProviderSnapshotSuspended
        }
    }

    filterTier := ms.keepers.Verification.GetProviderBestTier(ctx, provider)
    if graceTier, ok := ms.keepers.Verification.GetProviderGraceTier(ctx, provider); ok {
        // A grace record preserves the pre-discrepancy tier for tier filtering only.
        filterTier = graceTier
    }
    if !TierAtLeast(filterTier, verReq.MinTier) {
        return nil, mv1.ErrInsufficientVerificationTier
    }

    for _, requiredCap := range verReq.RequiredCapabilities {
        if !ms.keepers.Verification.ProviderHasCapability(ctx, provider, requiredCap) {
            return nil, mv1.ErrMissingCapability
        }
    }

    if verReq.MinAuditorCount > 0 {
        count := ms.keepers.Verification.CountQualifiedAuditors(
            ctx,
            provider,
            verReq.MinTier,
        )
        if count < verReq.MinAuditorCount {
            return nil, mv1.ErrInsufficientAuditorCount
        }
    }

    if len(verReq.RequiredAuditors) > 0 {
        attestations, _ := ms.keepers.Verification.GetProviderValidAttestations(ctx, provider)
        if verReq.AuditorMode == AuditorSelectionModeAll {
            if !hasAttestationFromAll(attestations, verReq.RequiredAuditors, verReq.MinTier) {
                return nil, mv1.ErrRequiredAuditorNotFound
            }
        } else if !hasAttestationFromAny(attestations, verReq.RequiredAuditors, verReq.MinTier) {
            return nil, mv1.ErrRequiredAuditorNotFound
        }
    }
}
```

During migration, this verification check is called by the market-owned adapter only when
`verification_module_active == true`. Legacy `AttributesFilters` continue to use `AuditKeeper`. If an order has both
legacy attributes and verification requirements, the adapter requires both checks to pass.

### 3.5 VerificationRequirement (x/deployment proto addition)

The `PlacementRequirements` in the deployment module gains a new field:

```protobuf
// In deployment proto -- PlacementRequirements
message PlacementRequirements {
    // ... existing attribute fields ...

    // Verification requirements for providers bidding on this group
    VerificationRequirement verification = N;  // new field, nullable (omit = no requirement)
}

// Defined in akash.verification.v1 and imported by deployment
message VerificationRequirement {
    VerificationTier min_tier = 1;                     // 0 = no requirement
    repeated CapabilityFlag required_capabilities = 2;
    repeated string required_auditors = 3;             // specific auditor addresses (optional)
    AuditorSelectionMode auditor_mode = 4;             // any or all for required_auditors; unspecified means any
    uint32 min_auditor_count = 5;                      // total independent auditors required
}
```

---

## 4. Protobuf Definitions

Complete proto file specifications for `akash.verification.v1`. All files are placed under
`proto/node/akash/verification/v1/`.

### 4.1 types.proto

```protobuf
syntax = "proto3";
package akash.verification.v1;

import "gogoproto/gogo.proto";

option go_package = "pkg.akt.dev/go/node/verification/v1";

// VerificationTier represents provider verification levels.
// Higher numeric value = higher trust. TierUnspecified (L0, Permissionless) means no attestation.
enum VerificationTier {
    option (gogoproto.goproto_enum_prefix) = false;

    verification_tier_unspecified = 0
        [(gogoproto.enumvalue_customname) = "TierUnspecified"];   // L0
    verification_tier_identified = 1
        [(gogoproto.enumvalue_customname) = "TierIdentified"];    // L1
    verification_tier_verified = 2
        [(gogoproto.enumvalue_customname) = "TierVerified"];      // L2
    verification_tier_established = 3
        [(gogoproto.enumvalue_customname) = "TierEstablished"];   // L3
    verification_tier_trusted = 4
        [(gogoproto.enumvalue_customname) = "TierTrusted"];       // L4
}

enum AuditorStatus {
    option (gogoproto.goproto_enum_prefix) = false;

    auditor_status_unspecified = 0
        [(gogoproto.enumvalue_customname) = "AuditorStatusUnspecified"];
    auditor_status_active = 1
        [(gogoproto.enumvalue_customname) = "AuditorStatusActive"];
    auditor_status_frozen = 2
        [(gogoproto.enumvalue_customname) = "AuditorStatusFrozen"];
    auditor_status_lapsed = 3
        [(gogoproto.enumvalue_customname) = "AuditorStatusLapsed"];
    auditor_status_resigned = 4
        [(gogoproto.enumvalue_customname) = "AuditorStatusResigned"];
    auditor_status_removed = 5
        [(gogoproto.enumvalue_customname) = "AuditorStatusRemoved"];
}

enum BondStatus {
    option (gogoproto.goproto_enum_prefix) = false;

    bond_status_unspecified = 0
        [(gogoproto.enumvalue_customname) = "BondStatusUnspecified"];
    bond_status_bonded = 1
        [(gogoproto.enumvalue_customname) = "BondStatusBonded"];
    bond_status_frozen = 2
        [(gogoproto.enumvalue_customname) = "BondStatusFrozen"];
    bond_status_unbonding = 3
        [(gogoproto.enumvalue_customname) = "BondStatusUnbonding"];
}

enum AttestationStatus {
    option (gogoproto.goproto_enum_prefix) = false;

    attestation_status_unspecified = 0
        [(gogoproto.enumvalue_customname) = "AttestationStatusUnspecified"];
    attestation_status_valid = 1
        [(gogoproto.enumvalue_customname) = "AttestationStatusValid"];
    attestation_status_voided = 2
        [(gogoproto.enumvalue_customname) = "AttestationStatusVoided"];
    attestation_status_expired = 3
        [(gogoproto.enumvalue_customname) = "AttestationStatusExpired"];
    attestation_status_revoked = 4
        [(gogoproto.enumvalue_customname) = "AttestationStatusRevoked"];
    attestation_status_removed = 5
        [(gogoproto.enumvalue_customname) = "AttestationStatusRemoved"];
}

// Disputed attestations are stored as status=Voided with voided_reason=Discrepancy
// and a pending DiscrepancyEvent. Replacement is a transition event before the
// (provider, auditor) attestation record is overwritten, not a persisted status.

enum VoidedReason {
    option (gogoproto.goproto_enum_prefix) = false;

    voided_reason_unspecified = 0
        [(gogoproto.enumvalue_customname) = "VoidedReasonUnspecified"];
    voided_reason_discrepancy = 1
        [(gogoproto.enumvalue_customname) = "VoidedReasonDiscrepancy"];
    voided_reason_governance = 2
        [(gogoproto.enumvalue_customname) = "VoidedReasonGovernance"];
    voided_reason_bond_withdrawn = 3
        [(gogoproto.enumvalue_customname) = "VoidedReasonBondWithdrawn"];
    voided_reason_bond_slashed = 4
        [(gogoproto.enumvalue_customname) = "VoidedReasonBondSlashed"];
}

enum FeeStatus {
    option (gogoproto.goproto_enum_prefix) = false;

    fee_status_unspecified = 0
        [(gogoproto.enumvalue_customname) = "FeeStatusUnspecified"];
    fee_status_escrowed = 1
        [(gogoproto.enumvalue_customname) = "FeeStatusEscrowed"];
    fee_status_released_to_auditor = 2
        [(gogoproto.enumvalue_customname) = "FeeStatusReleasedToAuditor"];
    fee_status_returned_to_provider = 3
        [(gogoproto.enumvalue_customname) = "FeeStatusReturnedToProvider"];
}

enum DepositStatus {
    option (gogoproto.goproto_enum_prefix) = false;

    deposit_status_unspecified = 0
        [(gogoproto.enumvalue_customname) = "DepositStatusUnspecified"];
    deposit_status_escrowed = 1
        [(gogoproto.enumvalue_customname) = "DepositStatusEscrowed"];
    deposit_status_pending_discrepancy = 2
        [(gogoproto.enumvalue_customname) = "DepositStatusPendingDiscrepancy"];
    deposit_status_returned_to_auditor = 3
        [(gogoproto.enumvalue_customname) = "DepositStatusReturnedToAuditor"];
    deposit_status_slashed = 4
        [(gogoproto.enumvalue_customname) = "DepositStatusSlashed"];
}

enum ProviderDepositStatus {
    option (gogoproto.goproto_enum_prefix) = false;

    provider_deposit_status_unspecified = 0
        [(gogoproto.enumvalue_customname) = "ProviderDepositStatusUnspecified"];
    provider_deposit_status_escrowed = 1
        [(gogoproto.enumvalue_customname) = "ProviderDepositStatusEscrowed"];
    provider_deposit_status_returned_to_provider = 2
        [(gogoproto.enumvalue_customname) = "ProviderDepositStatusReturnedToProvider"];
    provider_deposit_status_slashed = 3
        [(gogoproto.enumvalue_customname) = "ProviderDepositStatusSlashed"];
}

enum FaultAttribution {
    option (gogoproto.goproto_enum_prefix) = false;

    fault_attribution_unspecified = 0
        [(gogoproto.enumvalue_customname) = "FaultAttributionUnspecified"];
    fault_attribution_provider_fault = 1
        [(gogoproto.enumvalue_customname) = "FaultAttributionProviderFault"];
    fault_attribution_auditor_fault = 2
        [(gogoproto.enumvalue_customname) = "FaultAttributionAuditorFault"];
    fault_attribution_shared_fault = 3
        [(gogoproto.enumvalue_customname) = "FaultAttributionSharedFault"];
    fault_attribution_no_fault = 4
        [(gogoproto.enumvalue_customname) = "FaultAttributionNoFault"];
    fault_attribution_inconclusive = 5
        [(gogoproto.enumvalue_customname) = "FaultAttributionInconclusive"];
}

enum AttestationRevocationReason {
    option (gogoproto.goproto_enum_prefix) = false;

    attestation_revocation_reason_unspecified = 0
        [(gogoproto.enumvalue_customname) = "AttestationRevocationReasonUnspecified"];
    attestation_revocation_reason_provider_no_longer_qualifies = 1
        [(gogoproto.enumvalue_customname) = "AttestationRevocationReasonProviderNoLongerQualifies"];
    attestation_revocation_reason_snapshot_mismatch = 2
        [(gogoproto.enumvalue_customname) = "AttestationRevocationReasonSnapshotMismatch"];
    attestation_revocation_reason_software_identity_changed = 3
        [(gogoproto.enumvalue_customname) = "AttestationRevocationReasonSoftwareIdentityChanged"];
    attestation_revocation_reason_capability_misrepresented = 4
        [(gogoproto.enumvalue_customname) = "AttestationRevocationReasonCapabilityMisrepresented"];
    attestation_revocation_reason_provider_non_responsive = 5
        [(gogoproto.enumvalue_customname) = "AttestationRevocationReasonProviderNonResponsive"];
    attestation_revocation_reason_auditor_evidence_error = 6
        [(gogoproto.enumvalue_customname) = "AttestationRevocationReasonAuditorEvidenceError"];
    attestation_revocation_reason_auditor_operational_exit = 7
        [(gogoproto.enumvalue_customname) = "AttestationRevocationReasonAuditorOperationalExit"];
}

enum GovernanceAttestationReason {
    option (gogoproto.goproto_enum_prefix) = false;

    governance_attestation_reason_unspecified = 0
        [(gogoproto.enumvalue_customname) = "GovernanceAttestationReasonUnspecified"];
    governance_attestation_reason_fraudulent_provider = 1
        [(gogoproto.enumvalue_customname) = "GovernanceAttestationReasonFraudulentProvider"];
    governance_attestation_reason_compromised_provider = 2
        [(gogoproto.enumvalue_customname) = "GovernanceAttestationReasonCompromisedProvider"];
    governance_attestation_reason_provider_non_cooperation = 3
        [(gogoproto.enumvalue_customname) = "GovernanceAttestationReasonProviderNonCooperation"];
    governance_attestation_reason_faulty_auditor = 4
        [(gogoproto.enumvalue_customname) = "GovernanceAttestationReasonFaultyAuditor"];
    governance_attestation_reason_negligent_auditor = 5
        [(gogoproto.enumvalue_customname) = "GovernanceAttestationReasonNegligentAuditor"];
    governance_attestation_reason_evidence_insufficient = 6
        [(gogoproto.enumvalue_customname) = "GovernanceAttestationReasonEvidenceInsufficient"];
    governance_attestation_reason_emergency_safety_action = 7
        [(gogoproto.enumvalue_customname) = "GovernanceAttestationReasonEmergencySafetyAction"];
}

enum AuditEscrowSettlementReason {
    option (gogoproto.goproto_enum_prefix) = false;

    audit_escrow_settlement_reason_unspecified = 0
        [(gogoproto.enumvalue_customname) = "AuditEscrowSettlementReasonUnspecified"];
    audit_escrow_settlement_reason_cancelled_unconsumed = 1
        [(gogoproto.enumvalue_customname) = "AuditEscrowSettlementReasonCancelledUnconsumed"];
    audit_escrow_settlement_reason_expired_unconsumed = 2
        [(gogoproto.enumvalue_customname) = "AuditEscrowSettlementReasonExpiredUnconsumed"];
    audit_escrow_settlement_reason_provider_fault = 3
        [(gogoproto.enumvalue_customname) = "AuditEscrowSettlementReasonProviderFault"];
    audit_escrow_settlement_reason_no_fault = 4
        [(gogoproto.enumvalue_customname) = "AuditEscrowSettlementReasonNoFault"];
}

enum DiscrepancyResolutionReason {
    option (gogoproto.goproto_enum_prefix) = false;

    discrepancy_resolution_reason_unspecified = 0
        [(gogoproto.enumvalue_customname) = "DiscrepancyResolutionReasonUnspecified"];
    discrepancy_resolution_reason_auditor_a_correct = 1
        [(gogoproto.enumvalue_customname) = "DiscrepancyResolutionReasonAuditorACorrect"];
    discrepancy_resolution_reason_auditor_b_correct = 2
        [(gogoproto.enumvalue_customname) = "DiscrepancyResolutionReasonAuditorBCorrect"];
    discrepancy_resolution_reason_both_auditors_wrong = 3
        [(gogoproto.enumvalue_customname) = "DiscrepancyResolutionReasonBothAuditorsWrong"];
    discrepancy_resolution_reason_provider_fault = 4
        [(gogoproto.enumvalue_customname) = "DiscrepancyResolutionReasonProviderFault"];
    discrepancy_resolution_reason_shared_fault = 5
        [(gogoproto.enumvalue_customname) = "DiscrepancyResolutionReasonSharedFault"];
    discrepancy_resolution_reason_evidence_inconclusive = 6
        [(gogoproto.enumvalue_customname) = "DiscrepancyResolutionReasonEvidenceInconclusive"];
    discrepancy_resolution_reason_governance_timeout_review = 7
        [(gogoproto.enumvalue_customname) = "DiscrepancyResolutionReasonGovernanceTimeoutReview"];
}

enum ProviderBondSlashReason {
    option (gogoproto.goproto_enum_prefix) = false;

    provider_bond_slash_reason_unspecified = 0
        [(gogoproto.enumvalue_customname) = "ProviderBondSlashReasonUnspecified"];
    provider_bond_slash_reason_resource_misrepresentation = 1
        [(gogoproto.enumvalue_customname) = "ProviderBondSlashReasonResourceMisrepresentation"];
    provider_bond_slash_reason_capacity_overstatement = 2
        [(gogoproto.enumvalue_customname) = "ProviderBondSlashReasonCapacityOverstatement"];
    provider_bond_slash_reason_fraudulent_snapshot = 3
        [(gogoproto.enumvalue_customname) = "ProviderBondSlashReasonFraudulentSnapshot"];
    provider_bond_slash_reason_provider_compromise = 4
        [(gogoproto.enumvalue_customname) = "ProviderBondSlashReasonProviderCompromise"];
    provider_bond_slash_reason_sla_breach = 5
        [(gogoproto.enumvalue_customname) = "ProviderBondSlashReasonSLABreach"];
    provider_bond_slash_reason_non_cooperation_during_audit = 6
        [(gogoproto.enumvalue_customname) = "ProviderBondSlashReasonNonCooperationDuringAudit"];
}

enum AuditEscrowStatus {
    option (gogoproto.goproto_enum_prefix) = false;

    audit_escrow_status_unspecified = 0
        [(gogoproto.enumvalue_customname) = "AuditEscrowStatusUnspecified"];
    audit_escrow_status_open = 1
        [(gogoproto.enumvalue_customname) = "AuditEscrowStatusOpen"];
    audit_escrow_status_consumed = 2
        [(gogoproto.enumvalue_customname) = "AuditEscrowStatusConsumed"];
    audit_escrow_status_cancelled = 3
        [(gogoproto.enumvalue_customname) = "AuditEscrowStatusCancelled"];
    audit_escrow_status_expired = 4
        [(gogoproto.enumvalue_customname) = "AuditEscrowStatusExpired"];
    audit_escrow_status_settled = 5
        [(gogoproto.enumvalue_customname) = "AuditEscrowStatusSettled"];
}

enum VerificationGraceStatus {
    option (gogoproto.goproto_enum_prefix) = false;

    verification_grace_status_unspecified = 0
        [(gogoproto.enumvalue_customname) = "VerificationGraceStatusUnspecified"];
    verification_grace_status_active = 1
        [(gogoproto.enumvalue_customname) = "VerificationGraceStatusActive"];
    verification_grace_status_expired = 2
        [(gogoproto.enumvalue_customname) = "VerificationGraceStatusExpired"];
    verification_grace_status_terminated = 3
        [(gogoproto.enumvalue_customname) = "VerificationGraceStatusTerminated"];
}

enum DiscrepancyStatus {
    option (gogoproto.goproto_enum_prefix) = false;

    discrepancy_status_unspecified = 0
        [(gogoproto.enumvalue_customname) = "DiscrepancyStatusUnspecified"];
    discrepancy_status_pending = 1
        [(gogoproto.enumvalue_customname) = "DiscrepancyStatusPending"];
    discrepancy_status_resolved = 2
        [(gogoproto.enumvalue_customname) = "DiscrepancyStatusResolved"];
    discrepancy_status_timed_out = 3
        [(gogoproto.enumvalue_customname) = "DiscrepancyStatusTimedOut"];
}

enum CapabilityFlag {
    option (gogoproto.goproto_enum_prefix) = false;

    capability_unspecified = 0
        [(gogoproto.enumvalue_customname) = "CapabilityUnspecified"];
    capability_tee_hardware_attestation = 1
        [(gogoproto.enumvalue_customname) = "CapabilityTEEHardwareAttestation"];
    capability_confidential_computing = 2
        [(gogoproto.enumvalue_customname) = "CapabilityConfidentialComputing"];
    capability_persistent_storage = 3
        [(gogoproto.enumvalue_customname) = "CapabilityPersistentStorage"];
    capability_bare_metal = 4
        [(gogoproto.enumvalue_customname) = "CapabilityBareMetal"];
}

enum AuditorSelectionMode {
    option (gogoproto.goproto_enum_prefix) = false;

    auditor_selection_mode_unspecified = 0
        [(gogoproto.enumvalue_customname) = "AuditorSelectionModeUnspecified"];
    auditor_selection_mode_any = 1
        [(gogoproto.enumvalue_customname) = "AuditorSelectionModeAny"];
    auditor_selection_mode_all = 2
        [(gogoproto.enumvalue_customname) = "AuditorSelectionModeAll"];
}

```

### 4.2 state.proto

```protobuf
syntax = "proto3";
package akash.verification.v1;

import "gogoproto/gogo.proto";
import "cosmos_proto/cosmos.proto";
import "cosmos/base/v1beta1/coin.proto";
import "google/protobuf/timestamp.proto";

import "akash/verification/v1/types.proto";

option go_package = "pkg.akt.dev/go/node/verification/v1";

message AuditorRecord {
    string address = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    AuditorStatus status = 2;
    VerificationTier max_attestation_tier = 3;
    cosmos.base.v1beta1.Coin bond_amount = 4 [(gogoproto.nullable) = false];
    BondStatus bond_status = 5;
    bytes metadata_hash = 6;
    google.protobuf.Timestamp registered_at = 7
        [(gogoproto.nullable) = false, (gogoproto.stdtime) = true];
    google.protobuf.Timestamp renewal_deadline = 8
        [(gogoproto.nullable) = false, (gogoproto.stdtime) = true];
    uint64 discrepancy_count = 9;
    google.protobuf.Timestamp bond_unbonding_completion_time = 10
        [(gogoproto.nullable) = true, (gogoproto.stdtime) = true];
}

message AttestationRecord {
    string provider = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    string auditor = 2 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    VerificationTier tier = 3;
    repeated CapabilityFlag capabilities = 4;
    bytes evidence_hash = 5;
    cosmos.base.v1beta1.Coin fee = 6 [(gogoproto.nullable) = false];
    FeeStatus fee_status = 7;
    google.protobuf.Timestamp created_at = 8
        [(gogoproto.nullable) = false, (gogoproto.stdtime) = true];
    google.protobuf.Timestamp expires_at = 9
        [(gogoproto.nullable) = false, (gogoproto.stdtime) = true];
    AttestationStatus status = 10;
    VoidedReason voided_reason = 11;
    cosmos.base.v1beta1.Coin deposit = 12 [(gogoproto.nullable) = false]; // anti-griefing deposit
    DepositStatus deposit_status = 13;
    uint64 audit_escrow_id = 14;
    FaultAttribution fault_attribution = 15;
}

message AuditEscrowRecord {
    uint64 id = 1 [(gogoproto.customname) = "ID"];
    string provider = 2 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    string consumed_by_auditor = 3 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    VerificationTier requested_tier = 4;
    repeated CapabilityFlag requested_capabilities = 5;
    cosmos.base.v1beta1.Coin fee = 6 [(gogoproto.nullable) = false];
    FeeStatus fee_status = 7;
    cosmos.base.v1beta1.Coin provider_deposit = 8 [(gogoproto.nullable) = false];
    ProviderDepositStatus provider_deposit_status = 9;
    AuditEscrowStatus status = 10;
    google.protobuf.Timestamp opened_at = 11
        [(gogoproto.nullable) = false, (gogoproto.stdtime) = true];
    google.protobuf.Timestamp consumed_at = 12
        [(gogoproto.nullable) = true, (gogoproto.stdtime) = true];
    google.protobuf.Timestamp expires_at = 13
        [(gogoproto.nullable) = false, (gogoproto.stdtime) = true];
    bytes metadata_hash = 14;
    AuditEscrowSettlementReason settlement_reason = 15;
    FaultAttribution fault_attribution = 16;
}

message VerificationStoreRecord {
    string type_url = 1;
    bytes value = 2;
}

message DiscrepancyEvent {
    uint64 id = 1 [(gogoproto.customname) = "ID"];
    string provider = 2 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    string auditor_a = 3 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    VerificationTier auditor_a_tier = 4;
    string auditor_b = 5 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    VerificationTier auditor_b_tier = 6;
    google.protobuf.Timestamp timestamp = 7
        [(gogoproto.nullable) = false, (gogoproto.stdtime) = true];
    DiscrepancyStatus resolution_status = 8;
    uint64 resolution_proposal_id = 9;
    uint64 grace_record_id = 10;
    DiscrepancyResolutionReason resolution_reason = 11;
    FaultAttribution fault_attribution = 12;
    bytes resolution_evidence_hash = 13;
}

message ProviderVerificationGraceRecord {
    uint64 id = 1 [(gogoproto.customname) = "ID"];
    string provider = 2 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    VerificationTier preserved_tier = 3;
    repeated uint64 source_discrepancy_ids = 4;
    google.protobuf.Timestamp started_at = 5
        [(gogoproto.nullable) = false, (gogoproto.stdtime) = true];
    google.protobuf.Timestamp expires_at = 6
        [(gogoproto.nullable) = false, (gogoproto.stdtime) = true];
    VerificationGraceStatus status = 7;
}

message ProviderBondRecord {
    string provider = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    cosmos.base.v1beta1.Coin bonded_amount = 2 [(gogoproto.nullable) = false];
    repeated UnbondingEntry unbonding_entries = 3 [(gogoproto.nullable) = false];
    bool slashed = 4;
    google.protobuf.Timestamp last_slash_time = 5
        [(gogoproto.nullable) = true, (gogoproto.stdtime) = true];
}

message UnbondingEntry {
    cosmos.base.v1beta1.Coin amount = 1 [(gogoproto.nullable) = false];
    google.protobuf.Timestamp completion_time = 2
        [(gogoproto.nullable) = false, (gogoproto.stdtime) = true];
}

message ResourceSummary {
    uint32 total_gpus = 1;
    uint32 total_vcpus = 2;
    uint64 total_memory_mb = 3;
    uint64 total_storage_mb = 4;
    uint32 active_leases = 5;
    string software_version = 6;
    bytes software_signature = 7;
}

message ProviderSnapshotRecord {
    string provider = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    bytes snapshot_hash = 2;
    ResourceSummary resource_summary = 3 [(gogoproto.nullable) = false];
    google.protobuf.Timestamp posted_at = 4
        [(gogoproto.nullable) = false, (gogoproto.stdtime) = true];
    google.protobuf.Timestamp snapshot_timestamp = 5
        [(gogoproto.nullable) = false, (gogoproto.stdtime) = true];
    google.protobuf.Timestamp compliance_deadline = 6
        [(gogoproto.nullable) = false, (gogoproto.stdtime) = true];
    bool suspended = 7;
}
```

### 4.3 params.proto

```protobuf
syntax = "proto3";
package akash.verification.v1;

import "gogoproto/gogo.proto";
import "amino/amino.proto";
import "cosmos/base/v1beta1/coin.proto";
import "google/protobuf/duration.proto";

option go_package = "pkg.akt.dev/go/node/verification/v1";

message Params {
    cosmos.base.v1beta1.Coin bond_l1 = 1 [(gogoproto.nullable) = false];
    cosmos.base.v1beta1.Coin bond_l2 = 2 [(gogoproto.nullable) = false];
    cosmos.base.v1beta1.Coin bond_l3 = 3 [(gogoproto.nullable) = false];
    cosmos.base.v1beta1.Coin bond_l4 = 4 [(gogoproto.nullable) = false];

    google.protobuf.Duration ttl_l1 = 5
        [(gogoproto.nullable) = false, (gogoproto.stdduration) = true];
    google.protobuf.Duration ttl_l2 = 6
        [(gogoproto.nullable) = false, (gogoproto.stdduration) = true];
    google.protobuf.Duration ttl_l3 = 7
        [(gogoproto.nullable) = false, (gogoproto.stdduration) = true];
    google.protobuf.Duration ttl_l4 = 8
        [(gogoproto.nullable) = false, (gogoproto.stdduration) = true];

    cosmos.base.v1beta1.Coin min_fee_l1 = 9 [(gogoproto.nullable) = false];
    cosmos.base.v1beta1.Coin min_fee_l2 = 10 [(gogoproto.nullable) = false];
    cosmos.base.v1beta1.Coin min_fee_l3 = 11 [(gogoproto.nullable) = false];
    cosmos.base.v1beta1.Coin min_fee_l4 = 12 [(gogoproto.nullable) = false];

    uint32 discrepancy_threshold = 13;

    google.protobuf.Duration auditor_unbonding_period = 14
        [(gogoproto.nullable) = false, (gogoproto.stdduration) = true];

    google.protobuf.Duration renewal_period_l1 = 15
        [(gogoproto.nullable) = false, (gogoproto.stdduration) = true];
    google.protobuf.Duration renewal_period_l2 = 16
        [(gogoproto.nullable) = false, (gogoproto.stdduration) = true];
    google.protobuf.Duration renewal_period_l3 = 17
        [(gogoproto.nullable) = false, (gogoproto.stdduration) = true];
    google.protobuf.Duration renewal_period_l4 = 18
        [(gogoproto.nullable) = false, (gogoproto.stdduration) = true];

    google.protobuf.Duration snapshot_hash_interval = 19
        [(gogoproto.nullable) = false, (gogoproto.stdduration) = true];
    google.protobuf.Duration max_snapshot_age = 20
        [(gogoproto.nullable) = false, (gogoproto.stdduration) = true];

    cosmos.base.v1beta1.Coin bond_gpu_l2 = 21 [(gogoproto.nullable) = false];
    cosmos.base.v1beta1.Coin bond_gpu_l3 = 22 [(gogoproto.nullable) = false];
    cosmos.base.v1beta1.Coin bond_gpu_l4 = 23 [(gogoproto.nullable) = false];
    cosmos.base.v1beta1.Coin bond_vcpu_l2 = 24 [(gogoproto.nullable) = false];
    cosmos.base.v1beta1.Coin bond_vcpu_l3 = 25 [(gogoproto.nullable) = false];
    cosmos.base.v1beta1.Coin bond_vcpu_l4 = 26 [(gogoproto.nullable) = false];
    cosmos.base.v1beta1.Coin bond_mem_gb_l2 = 27 [(gogoproto.nullable) = false];
    cosmos.base.v1beta1.Coin bond_mem_gb_l3 = 28 [(gogoproto.nullable) = false];
    cosmos.base.v1beta1.Coin bond_mem_gb_l4 = 29 [(gogoproto.nullable) = false];
    cosmos.base.v1beta1.Coin bond_storage_tb_l2 = 30 [(gogoproto.nullable) = false];
    cosmos.base.v1beta1.Coin bond_storage_tb_l3 = 31 [(gogoproto.nullable) = false];
    cosmos.base.v1beta1.Coin bond_storage_tb_l4 = 32 [(gogoproto.nullable) = false];

    google.protobuf.Duration provider_bond_unbonding_period = 33
        [(gogoproto.nullable) = false, (gogoproto.stdduration) = true];

    google.protobuf.Duration min_age_l2 = 34
        [(gogoproto.nullable) = false, (gogoproto.stdduration) = true];
    google.protobuf.Duration min_age_l3 = 35
        [(gogoproto.nullable) = false, (gogoproto.stdduration) = true];
    google.protobuf.Duration min_age_l4 = 36
        [(gogoproto.nullable) = false, (gogoproto.stdduration) = true];
    uint32 min_lease_completion_bps_l3 = 37;
    uint32 min_lease_completion_bps_l4 = 38;
    google.protobuf.Duration clean_history_window_l3 = 39
        [(gogoproto.nullable) = false, (gogoproto.stdduration) = true];
    google.protobuf.Duration clean_history_window_l4 = 40
        [(gogoproto.nullable) = false, (gogoproto.stdduration) = true];
    google.protobuf.Duration min_l3_duration_for_l4 = 41
        [(gogoproto.nullable) = false, (gogoproto.stdduration) = true];
    uint32 min_leases_for_completion_rate = 42;

    uint32 max_endblocker_attestation_expiries = 43;
    uint32 max_endblocker_snapshot_suspensions = 44;
    uint32 max_endblocker_unbonding_completions = 45;
    uint32 max_endblocker_discrepancy_timeouts = 46;
    uint32 max_endblocker_audit_escrow_expiries = 47;
    uint32 max_endblocker_grace_expiries = 48;

    google.protobuf.Duration discrepancy_resolution_timeout = 49
        [(gogoproto.nullable) = false, (gogoproto.stdduration) = true];
    cosmos.base.v1beta1.Coin attestation_deposit = 50 [(gogoproto.nullable) = false];
    google.protobuf.Duration discrepancy_grace_period = 51
        [(gogoproto.nullable) = false, (gogoproto.stdduration) = true];
    cosmos.base.v1beta1.Coin provider_audit_deposit = 52 [(gogoproto.nullable) = false];

    bool verification_module_active = 53;

    google.protobuf.Duration contact_response_critical_l1 = 54
        [(gogoproto.nullable) = false, (gogoproto.stdduration) = true];
    google.protobuf.Duration contact_response_critical_l2 = 55
        [(gogoproto.nullable) = false, (gogoproto.stdduration) = true];
    google.protobuf.Duration contact_response_critical_l3 = 56
        [(gogoproto.nullable) = false, (gogoproto.stdduration) = true];
    google.protobuf.Duration contact_response_critical_l4 = 57
        [(gogoproto.nullable) = false, (gogoproto.stdduration) = true];
    google.protobuf.Duration contact_response_standard_l1 = 58
        [(gogoproto.nullable) = false, (gogoproto.stdduration) = true];
    google.protobuf.Duration contact_response_standard_l2 = 59
        [(gogoproto.nullable) = false, (gogoproto.stdduration) = true];
    google.protobuf.Duration contact_response_standard_l3 = 60
        [(gogoproto.nullable) = false, (gogoproto.stdduration) = true];
    google.protobuf.Duration contact_response_standard_l4 = 61
        [(gogoproto.nullable) = false, (gogoproto.stdduration) = true];
}
```

### 4.4 msg.proto

```protobuf
syntax = "proto3";
package akash.verification.v1;

import "gogoproto/gogo.proto";
import "cosmos_proto/cosmos.proto";
import "cosmos/msg/v1/msg.proto";
import "cosmos/base/v1beta1/coin.proto";
import "amino/amino.proto";
import "google/protobuf/timestamp.proto";

import "akash/verification/v1/types.proto";
import "akash/verification/v1/state.proto";
import "akash/verification/v1/params.proto";

option go_package = "pkg.akt.dev/go/node/verification/v1";

message MsgPostAuditorBond {
    option (cosmos.msg.v1.signer) = "auditor";
    option (amino.name) = "akash/verification/v1/MsgPostAuditorBond";
    string auditor = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    cosmos.base.v1beta1.Coin amount = 2 [(gogoproto.nullable) = false];
}
message MsgPostAuditorBondResponse {}

message MsgSubmitAttestation {
    option (cosmos.msg.v1.signer) = "auditor";
    option (amino.name) = "akash/verification/v1/MsgSubmitAttestation";
    string provider = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    string auditor = 2 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    VerificationTier tier = 3;
    repeated CapabilityFlag capabilities = 4;
    bytes evidence_hash = 5;
    cosmos.base.v1beta1.Coin fee = 6 [(gogoproto.nullable) = false];
    cosmos.base.v1beta1.Coin deposit = 7 [(gogoproto.nullable) = false]; // anti-griefing deposit
    uint64 audit_escrow_id = 8;
}
message MsgSubmitAttestationResponse {}

message MsgOpenAuditEscrow {
    option (cosmos.msg.v1.signer) = "provider";
    option (amino.name) = "akash/verification/v1/MsgOpenAuditEscrow";
    string provider = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    VerificationTier requested_tier = 2;
    repeated CapabilityFlag requested_capabilities = 3;
    cosmos.base.v1beta1.Coin fee = 4 [(gogoproto.nullable) = false];
    cosmos.base.v1beta1.Coin provider_deposit = 5 [(gogoproto.nullable) = false];
    google.protobuf.Timestamp expires_at = 6
        [(gogoproto.nullable) = false, (gogoproto.stdtime) = true];
    bytes metadata_hash = 7;
}
message MsgOpenAuditEscrowResponse {
    uint64 audit_escrow_id = 1;
}

message MsgCancelAuditEscrow {
    option (cosmos.msg.v1.signer) = "provider";
    option (amino.name) = "akash/verification/v1/MsgCancelAuditEscrow";
    string provider = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    uint64 audit_escrow_id = 2;
}
message MsgCancelAuditEscrowResponse {}

message MsgSettleAuditEscrow {
    option (cosmos.msg.v1.signer) = "authority";
    option (amino.name) = "akash/verification/v1/MsgSettleAuditEscrow";
    string authority = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    uint64 audit_escrow_id = 2;
    AuditEscrowSettlementReason reason = 3;
    FaultAttribution fault_attribution = 4;
    bytes evidence_hash = 5;
}
message MsgSettleAuditEscrowResponse {}

message MsgRevokeAttestation {
    option (cosmos.msg.v1.signer) = "auditor";
    option (amino.name) = "akash/verification/v1/MsgRevokeAttestation";
    string provider = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    string auditor = 2 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    AttestationRevocationReason reason = 3;
    bytes evidence_hash = 4;
}
message MsgRevokeAttestationResponse {}

message MsgRemoveAttestation {
    option (cosmos.msg.v1.signer) = "provider";
    option (amino.name) = "akash/verification/v1/MsgRemoveAttestation";
    string provider = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    string auditor = 2 [(cosmos_proto.scalar) = "cosmos.AddressString"];
}
message MsgRemoveAttestationResponse {}

message MsgResignAuditor {
    option (cosmos.msg.v1.signer) = "auditor";
    option (amino.name) = "akash/verification/v1/MsgResignAuditor";
    string auditor = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
}
message MsgResignAuditorResponse {}

message MsgPostProviderBond {
    option (cosmos.msg.v1.signer) = "provider";
    option (amino.name) = "akash/verification/v1/MsgPostProviderBond";
    string provider = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    cosmos.base.v1beta1.Coin amount = 2 [(gogoproto.nullable) = false];
}
message MsgPostProviderBondResponse {}

message MsgWithdrawProviderBond {
    option (cosmos.msg.v1.signer) = "provider";
    option (amino.name) = "akash/verification/v1/MsgWithdrawProviderBond";
    string provider = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    cosmos.base.v1beta1.Coin amount = 2 [(gogoproto.nullable) = false];
}
message MsgWithdrawProviderBondResponse {}

message MsgPostSnapshotHash {
    option (cosmos.msg.v1.signer) = "provider";
    option (amino.name) = "akash/verification/v1/MsgPostSnapshotHash";
    string provider = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    bytes snapshot_hash = 2;
    ResourceSummary resource_summary = 3 [(gogoproto.nullable) = false];
    google.protobuf.Timestamp snapshot_timestamp = 4
        [(gogoproto.nullable) = false, (gogoproto.stdtime) = true];
}
message MsgPostSnapshotHashResponse {}

message MsgRegisterAuditor {
    option (cosmos.msg.v1.signer) = "authority";
    option (amino.name) = "akash/verification/v1/MsgRegisterAuditor";
    string authority = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    string auditor = 2 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    VerificationTier max_attestation_tier = 3;
    bytes metadata_hash = 4;
}
message MsgRegisterAuditorResponse {}

message MsgRenewAuditor {
    option (cosmos.msg.v1.signer) = "authority";
    option (amino.name) = "akash/verification/v1/MsgRenewAuditor";
    string authority = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    string auditor = 2 [(cosmos_proto.scalar) = "cosmos.AddressString"];
}
message MsgRenewAuditorResponse {}

message MsgRemoveAuditor {
    option (cosmos.msg.v1.signer) = "authority";
    option (amino.name) = "akash/verification/v1/MsgRemoveAuditor";
    string authority = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    string auditor = 2 [(cosmos_proto.scalar) = "cosmos.AddressString"];
}
message MsgRemoveAuditorResponse {}

message MsgRevokeProviderAttestation {
    option (cosmos.msg.v1.signer) = "authority";
    option (amino.name) = "akash/verification/v1/MsgRevokeProviderAttestation";
    string authority = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    string provider = 2 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    string auditor = 3 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    GovernanceAttestationReason reason = 4;
    FaultAttribution fault_attribution = 5;
    bytes evidence_hash = 6;
}
message MsgRevokeProviderAttestationResponse {}

message MsgRevokeAllProviderAttestations {
    option (cosmos.msg.v1.signer) = "authority";
    option (amino.name) = "akash/verification/v1/MsgRevokeAllProviderAttestations";
    string authority = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    string provider = 2 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    GovernanceAttestationReason reason = 3;
    FaultAttribution fault_attribution = 4;
    bytes evidence_hash = 5;
}
message MsgRevokeAllProviderAttestationsResponse {}

message MsgRevokeAuditorAttestations {
    option (cosmos.msg.v1.signer) = "authority";
    option (amino.name) = "akash/verification/v1/MsgRevokeAuditorAttestations";
    string authority = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    string auditor = 2 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    GovernanceAttestationReason reason = 3;
    FaultAttribution fault_attribution = 4;
    bytes evidence_hash = 5;
}
message MsgRevokeAuditorAttestationsResponse {}

message MsgResolveDiscrepancy {
    option (cosmos.msg.v1.signer) = "authority";
    option (amino.name) = "akash/verification/v1/MsgResolveDiscrepancy";
    string authority = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    uint64 discrepancy_id = 2;
    string vindicated_auditor = 3 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    bool slash_auditor_a = 4;
    bool slash_auditor_b = 5;
    DiscrepancyResolutionReason reason = 6;
    FaultAttribution fault_attribution = 7;
    bytes evidence_hash = 8;
}
message MsgResolveDiscrepancyResponse {}

message MsgSlashProviderBond {
    option (cosmos.msg.v1.signer) = "authority";
    option (amino.name) = "akash/verification/v1/MsgSlashProviderBond";
    string authority = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    string provider = 2 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    string slash_fraction = 3 [
        (cosmos_proto.scalar)  = "cosmos.Dec",
        (gogoproto.customtype) = "cosmossdk.io/math.LegacyDec",
        (gogoproto.nullable)   = false
    ];
    ProviderBondSlashReason reason = 4;
    bytes evidence_hash = 5;
}
message MsgSlashProviderBondResponse {}

message MsgUpdateParams {
    option (cosmos.msg.v1.signer) = "authority";
    option (amino.name) = "akash/verification/v1/MsgUpdateParams";
    string authority = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    Params params = 2 [(gogoproto.nullable) = false];
}
message MsgUpdateParamsResponse {}
```

### 4.5 service.proto

```protobuf
syntax = "proto3";
package akash.verification.v1;

import "cosmos/msg/v1/msg.proto";
import "akash/verification/v1/msg.proto";

option go_package = "pkg.akt.dev/go/node/verification/v1";

service Msg {
    option (cosmos.msg.v1.service) = true;

    rpc PostAuditorBond(MsgPostAuditorBond) returns (MsgPostAuditorBondResponse);
    rpc OpenAuditEscrow(MsgOpenAuditEscrow) returns (MsgOpenAuditEscrowResponse);
    rpc CancelAuditEscrow(MsgCancelAuditEscrow) returns (MsgCancelAuditEscrowResponse);
    rpc SettleAuditEscrow(MsgSettleAuditEscrow) returns (MsgSettleAuditEscrowResponse);
    rpc SubmitAttestation(MsgSubmitAttestation) returns (MsgSubmitAttestationResponse);
    rpc RevokeAttestation(MsgRevokeAttestation) returns (MsgRevokeAttestationResponse);
    rpc RemoveAttestation(MsgRemoveAttestation) returns (MsgRemoveAttestationResponse);
    rpc ResignAuditor(MsgResignAuditor) returns (MsgResignAuditorResponse);
    rpc PostProviderBond(MsgPostProviderBond) returns (MsgPostProviderBondResponse);
    rpc WithdrawProviderBond(MsgWithdrawProviderBond) returns (MsgWithdrawProviderBondResponse);
    rpc PostSnapshotHash(MsgPostSnapshotHash) returns (MsgPostSnapshotHashResponse);
    rpc RegisterAuditor(MsgRegisterAuditor) returns (MsgRegisterAuditorResponse);
    rpc RenewAuditor(MsgRenewAuditor) returns (MsgRenewAuditorResponse);
    rpc RemoveAuditor(MsgRemoveAuditor) returns (MsgRemoveAuditorResponse);
    rpc RevokeProviderAttestation(MsgRevokeProviderAttestation) returns (MsgRevokeProviderAttestationResponse);
    rpc RevokeAllProviderAttestations(MsgRevokeAllProviderAttestations) returns (MsgRevokeAllProviderAttestationsResponse);
    rpc RevokeAuditorAttestations(MsgRevokeAuditorAttestations) returns (MsgRevokeAuditorAttestationsResponse);
    rpc ResolveDiscrepancy(MsgResolveDiscrepancy) returns (MsgResolveDiscrepancyResponse);
    rpc SlashProviderBond(MsgSlashProviderBond) returns (MsgSlashProviderBondResponse);
    rpc UpdateParams(MsgUpdateParams) returns (MsgUpdateParamsResponse);
}
```

### 4.6 query.proto

```protobuf
syntax = "proto3";
package akash.verification.v1;

import "gogoproto/gogo.proto";
import "cosmos_proto/cosmos.proto";
import "cosmos/base/v1beta1/coin.proto";
import "cosmos/base/query/v1beta1/pagination.proto";
import "google/api/annotations.proto";

import "akash/verification/v1/types.proto";
import "akash/verification/v1/state.proto";
import "akash/verification/v1/params.proto";

option go_package = "pkg.akt.dev/go/node/verification/v1";

service Query {
    rpc Auditor(QueryAuditorRequest) returns (QueryAuditorResponse) {
        option (google.api.http).get = "/akash/verification/v1/auditors/{auditor}";
    }
    rpc Auditors(QueryAuditorsRequest) returns (QueryAuditorsResponse) {
        option (google.api.http).get = "/akash/verification/v1/auditors";
    }
    rpc Attestation(QueryAttestationRequest) returns (QueryAttestationResponse) {
        option (google.api.http).get = "/akash/verification/v1/attestations/{provider}/{auditor}";
    }
    rpc ProviderAttestations(QueryProviderAttestationsRequest) returns (QueryProviderAttestationsResponse) {
        option (google.api.http).get = "/akash/verification/v1/providers/{provider}/attestations";
    }
    rpc AuditorAttestations(QueryAuditorAttestationsRequest) returns (QueryAuditorAttestationsResponse) {
        option (google.api.http).get = "/akash/verification/v1/auditors/{auditor}/attestations";
    }
    rpc Discrepancy(QueryDiscrepancyRequest) returns (QueryDiscrepancyResponse) {
        option (google.api.http).get = "/akash/verification/v1/discrepancies/{id}";
    }
    rpc Discrepancies(QueryDiscrepanciesRequest) returns (QueryDiscrepanciesResponse) {
        option (google.api.http).get = "/akash/verification/v1/discrepancies";
    }
    rpc AuditEscrow(QueryAuditEscrowRequest) returns (QueryAuditEscrowResponse) {
        option (google.api.http).get = "/akash/verification/v1/audit-escrows/{id}";
    }
    rpc ProviderAuditEscrows(QueryProviderAuditEscrowsRequest) returns (QueryProviderAuditEscrowsResponse) {
        option (google.api.http).get = "/akash/verification/v1/providers/{provider}/audit-escrows";
    }
    rpc ProviderVerificationGrace(QueryProviderVerificationGraceRequest) returns (QueryProviderVerificationGraceResponse) {
        option (google.api.http).get = "/akash/verification/v1/providers/{provider}/grace";
    }
    rpc ProviderBond(QueryProviderBondRequest) returns (QueryProviderBondResponse) {
        option (google.api.http).get = "/akash/verification/v1/providers/{provider}/bond";
    }
    rpc ProviderSnapshot(QueryProviderSnapshotRequest) returns (QueryProviderSnapshotResponse) {
        option (google.api.http).get = "/akash/verification/v1/providers/{provider}/snapshot";
    }
    rpc Params(QueryParamsRequest) returns (QueryParamsResponse) {
        option (google.api.http).get = "/akash/verification/v1/params";
    }
}

message QueryAuditorRequest {
    string auditor = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
}
message QueryAuditorResponse {
    AuditorRecord auditor = 1 [(gogoproto.nullable) = false];
}

message QueryAuditorsRequest {
    AuditorStatus status_filter = 1;
    cosmos.base.query.v1beta1.PageRequest pagination = 2;
}
message QueryAuditorsResponse {
    repeated AuditorRecord auditors = 1 [(gogoproto.nullable) = false];
    cosmos.base.query.v1beta1.PageResponse pagination = 2;
}

message QueryAttestationRequest {
    string provider = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    string auditor = 2 [(cosmos_proto.scalar) = "cosmos.AddressString"];
}
message QueryAttestationResponse {
    AttestationRecord attestation = 1 [(gogoproto.nullable) = false];
}

message QueryProviderAttestationsRequest {
    string provider = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    AttestationStatus status_filter = 2;
    cosmos.base.query.v1beta1.PageRequest pagination = 3;
}
message QueryProviderAttestationsResponse {
    repeated AttestationRecord attestations = 1 [(gogoproto.nullable) = false];
    cosmos.base.query.v1beta1.PageResponse pagination = 2;
}

message QueryAuditorAttestationsRequest {
    string auditor = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    cosmos.base.query.v1beta1.PageRequest pagination = 2;
}
message QueryAuditorAttestationsResponse {
    repeated AttestationRecord attestations = 1 [(gogoproto.nullable) = false];
    cosmos.base.query.v1beta1.PageResponse pagination = 2;
}

message QueryDiscrepancyRequest {
    uint64 id = 1;
}
message QueryDiscrepancyResponse {
    DiscrepancyEvent discrepancy = 1 [(gogoproto.nullable) = false];
}

message QueryDiscrepanciesRequest {
    DiscrepancyStatus status_filter = 1;
    cosmos.base.query.v1beta1.PageRequest pagination = 2;
}
message QueryDiscrepanciesResponse {
    repeated DiscrepancyEvent discrepancies = 1 [(gogoproto.nullable) = false];
    cosmos.base.query.v1beta1.PageResponse pagination = 2;
}

message QueryAuditEscrowRequest {
    uint64 id = 1;
}
message QueryAuditEscrowResponse {
    AuditEscrowRecord escrow = 1 [(gogoproto.nullable) = false];
}

message QueryProviderAuditEscrowsRequest {
    string provider = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    AuditEscrowStatus status_filter = 2;
    cosmos.base.query.v1beta1.PageRequest pagination = 3;
}
message QueryProviderAuditEscrowsResponse {
    repeated AuditEscrowRecord escrows = 1 [(gogoproto.nullable) = false];
    cosmos.base.query.v1beta1.PageResponse pagination = 2;
}

message QueryProviderVerificationGraceRequest {
    string provider = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
}
message QueryProviderVerificationGraceResponse {
    ProviderVerificationGraceRecord grace = 1 [(gogoproto.nullable) = false];
}

message QueryProviderBondRequest {
    string provider = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
}
message QueryProviderBondResponse {
    ProviderBondRecord bond = 1 [(gogoproto.nullable) = false];
    cosmos.base.v1beta1.Coin required_for_current_tier = 2 [(gogoproto.nullable) = false];
}

message QueryProviderSnapshotRequest {
    string provider = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
}
message QueryProviderSnapshotResponse {
    ProviderSnapshotRecord snapshot = 1 [(gogoproto.nullable) = false];
}

message QueryParamsRequest {}
message QueryParamsResponse {
    Params params = 1 [(gogoproto.nullable) = false];
}
```

### 4.7 events.proto

```protobuf
syntax = "proto3";
package akash.verification.v1;

import "gogoproto/gogo.proto";
import "cosmos_proto/cosmos.proto";
import "cosmos/base/v1beta1/coin.proto";
import "google/protobuf/timestamp.proto";

import "akash/verification/v1/types.proto";

option go_package = "pkg.akt.dev/go/node/verification/v1";

message EventAuditorRegistered {
    string auditor = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    VerificationTier max_attestation_tier = 2;
}

message EventAuditorBondPosted {
    string auditor = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    cosmos.base.v1beta1.Coin amount = 2 [(gogoproto.nullable) = false];
}

message EventAuditorFrozen {
    string auditor = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    uint64 discrepancy_id = 2;
}

message EventAuditorLapsed {
    string auditor = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
}

message EventAuditorResigned {
    string auditor = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
}

message EventAuditorRemoved {
    string auditor = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
}

message EventAuditorRenewed {
    string auditor = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    google.protobuf.Timestamp new_deadline = 2
        [(gogoproto.nullable) = false, (gogoproto.stdtime) = true];
}

message EventAttestationSubmitted {
    string provider = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    string auditor = 2 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    VerificationTier tier = 3;
    repeated CapabilityFlag capabilities = 4;
    google.protobuf.Timestamp expires_at = 5
        [(gogoproto.nullable) = false, (gogoproto.stdtime) = true];
    uint64 audit_escrow_id = 6;
}

message EventAttestationExpired {
    string provider = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    string auditor = 2 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    VerificationTier tier = 3;
}

message EventAttestationReplaced {
    string provider = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    string auditor = 2 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    VerificationTier old_tier = 3;
    VerificationTier new_tier = 4;
    uint64 old_audit_escrow_id = 5;
    uint64 new_audit_escrow_id = 6;
}

message EventAttestationRevoked {
    string provider = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    string auditor = 2 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    string initiator = 3;
    AttestationRevocationReason reason = 4;
}

message EventAttestationVoided {
    string provider = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    string auditor = 2 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    VoidedReason reason = 3;
}

message EventDiscrepancyDetected {
    uint64 discrepancy_id = 1;
    string provider = 2 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    string auditor_a = 3 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    VerificationTier tier_a = 4;
    string auditor_b = 5 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    VerificationTier tier_b = 6;
}

message EventDiscrepancyResolved {
    uint64 discrepancy_id = 1;
    string vindicated_auditor = 2;
    DiscrepancyResolutionReason reason = 3;
    FaultAttribution fault_attribution = 4;
}

message EventDiscrepancyTimedOut {
    uint64 discrepancy_id = 1;
    string auditor_a = 2 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    string auditor_b = 3 [(cosmos_proto.scalar) = "cosmos.AddressString"];
}

message EventProviderBondPosted {
    string provider = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    cosmos.base.v1beta1.Coin amount = 2 [(gogoproto.nullable) = false];
    cosmos.base.v1beta1.Coin total_bonded = 3 [(gogoproto.nullable) = false];
}

message EventProviderBondSlashed {
    string provider = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    cosmos.base.v1beta1.Coin slashed_amount = 2 [(gogoproto.nullable) = false];
    ProviderBondSlashReason reason = 3;
}

message EventProviderBondWithdrawalInitiated {
    string provider = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    cosmos.base.v1beta1.Coin amount = 2 [(gogoproto.nullable) = false];
    google.protobuf.Timestamp completion_time = 3
        [(gogoproto.nullable) = false, (gogoproto.stdtime) = true];
}

message EventProviderBondWithdrawalCompleted {
    string provider = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    cosmos.base.v1beta1.Coin amount = 2 [(gogoproto.nullable) = false];
}

message EventSnapshotHashPosted {
    string provider = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    bytes snapshot_hash = 2;
    google.protobuf.Timestamp compliance_deadline = 3
        [(gogoproto.nullable) = false, (gogoproto.stdtime) = true];
}

message EventSnapshotSuspended {
    string provider = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
}

message EventSnapshotResumed {
    string provider = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
}

message EventFeeEscrowed {
    string provider = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    string auditor = 2 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    cosmos.base.v1beta1.Coin amount = 3 [(gogoproto.nullable) = false];
}

message EventFeeReleasedToAuditor {
    string auditor = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    cosmos.base.v1beta1.Coin amount = 2 [(gogoproto.nullable) = false];
}

message EventFeeReturnedToProvider {
    string provider = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    cosmos.base.v1beta1.Coin amount = 2 [(gogoproto.nullable) = false];
}

message EventAuditEscrowOpened {
    uint64 audit_escrow_id = 1;
    string provider = 2 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    cosmos.base.v1beta1.Coin fee = 3 [(gogoproto.nullable) = false];
    cosmos.base.v1beta1.Coin provider_deposit = 4 [(gogoproto.nullable) = false];
}

message EventAuditEscrowSettled {
    uint64 audit_escrow_id = 1;
    AuditEscrowSettlementReason reason = 2;
    FaultAttribution fault_attribution = 3;
}

message EventDepositReturnedToAuditor {
    string auditor = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    cosmos.base.v1beta1.Coin amount = 2 [(gogoproto.nullable) = false];
}

message EventDepositSlashed {
    string auditor = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    cosmos.base.v1beta1.Coin amount = 2 [(gogoproto.nullable) = false];
}

message EventVerificationGraceStarted {
    uint64 grace_record_id = 1;
    string provider = 2 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    VerificationTier preserved_tier = 3;
}

message EventVerificationGraceEnded {
    uint64 grace_record_id = 1;
    VerificationGraceStatus status = 2;
}
```

### 4.8 genesis.proto

```protobuf
syntax = "proto3";
package akash.verification.v1;

import "gogoproto/gogo.proto";

import "akash/verification/v1/state.proto";
import "akash/verification/v1/params.proto";

option go_package = "pkg.akt.dev/go/node/verification/v1";

message GenesisState {
    Params params = 1 [(gogoproto.nullable) = false];
    repeated AuditorRecord auditors = 2 [(gogoproto.nullable) = false];
    repeated AttestationRecord attestations = 3 [(gogoproto.nullable) = false];
    repeated DiscrepancyEvent discrepancies = 4 [(gogoproto.nullable) = false];
    repeated ProviderBondRecord provider_bonds = 5 [(gogoproto.nullable) = false];
    repeated ProviderSnapshotRecord provider_snapshots = 6 [(gogoproto.nullable) = false];
    uint64 next_discrepancy_id = 7;
    repeated AuditEscrowRecord audit_escrows = 8 [(gogoproto.nullable) = false];
    uint64 next_audit_escrow_id = 9;
    repeated ProviderVerificationGraceRecord verification_graces = 10 [(gogoproto.nullable) = false];
    uint64 next_grace_record_id = 11;
}
```

---

## Appendix A: Error Codes

| Error                                | Code | gRPC Status              | Description                                                |
|--------------------------------------|------|--------------------------|------------------------------------------------------------|
| `ErrAuditorNotFound`                 | 1    | `NOT_FOUND`              | Auditor address not in registered set                      |
| `ErrAuditorNotActive`                | 2    | `FAILED_PRECONDITION`    | Auditor status is not Active                               |
| `ErrAuditorFrozen`                   | 3    | `FAILED_PRECONDITION`    | Auditor bond is frozen (pending discrepancy resolution)    |
| `ErrAuditorUnauthorizedTier`         | 4    | `PERMISSION_DENIED`      | Attested tier exceeds auditor's max attestation authority   |
| `ErrSelfAttestation`                 | 5    | `INVALID_ARGUMENT`       | Auditor and provider addresses are the same                |
| `ErrInsufficientAuditFee`            | 6    | `INVALID_ARGUMENT`       | Fee below governance minimum for this tier                 |
| `ErrProviderNotRegistered`           | 7    | `NOT_FOUND`              | Provider not found in x/provider                           |
| `ErrInsufficientProviderBond`        | 8    | `FAILED_PRECONDITION`    | Provider bond below required minimum for attested tier     |
| `ErrSnapshotNonCompliant`            | 9    | `FAILED_PRECONDITION`    | Provider snapshot is suspended or missing                  |
| `ErrInsufficientProviderAge`         | 10   | `FAILED_PRECONDITION`    | Provider registration too recent for attested tier         |
| `ErrInsufficientLeaseCompletionRate` | 11   | `FAILED_PRECONDITION`    | Lease completion rate below threshold                      |
| `ErrSlashingHistoryViolation`        | 12   | `FAILED_PRECONDITION`    | Provider has slashing events within lookback window        |
| `ErrInsufficientL3History`           | 13   | `FAILED_PRECONDITION`    | Provider lacks required continuous L3+ attestation for L4  |
| `ErrAttestationNotFound`             | 14   | `NOT_FOUND`              | Attestation (provider, auditor) not found                  |
| `ErrDiscrepancyNotFound`             | 15   | `NOT_FOUND`              | Discrepancy ID not found                                   |
| `ErrBondWithdrawalExceedsMinimum`    | 16   | `FAILED_PRECONDITION`    | Withdrawal would leave bond below minimum for active tiers |
| `ErrSnapshotTooOld`                  | 17   | `INVALID_ARGUMENT`       | Snapshot timestamp exceeds max_snapshot_age                |
| `ErrInsufficientAuditorBond`         | 18   | `FAILED_PRECONDITION`    | Auditor bond below required amount                         |
| `ErrInsufficientVerificationTier`    | 19   | `FAILED_PRECONDITION`    | Provider's tier does not meet deployment requirement       |
| `ErrProviderSnapshotSuspended`       | 20   | `FAILED_PRECONDITION`    | Provider snapshot suspended, cannot bid on L2+ orders      |
| `ErrMissingCapability`               | 21   | `FAILED_PRECONDITION`    | Provider lacks required capability flag                    |
| `ErrRequiredAuditorNotFound`         | 22   | `NOT_FOUND`              | No attestation from a required auditor                     |
| `ErrInsufficientDeposit`             | 23   | `INVALID_ARGUMENT`       | Attestation deposit below governance minimum               |
| `ErrAuditEscrowNotFound`             | 24   | `NOT_FOUND`              | Audit escrow ID not found                                  |
| `ErrAuditEscrowNotConsumable`        | 25   | `FAILED_PRECONDITION`    | Audit escrow is expired, consumed, cancelled, or mismatched |
| `ErrInsufficientProviderDeposit`     | 26   | `INVALID_ARGUMENT`       | Provider audit deposit below governance minimum            |
| `ErrInvalidReason`                   | 27   | `INVALID_ARGUMENT`       | Typed reason is unspecified or incompatible with action    |
| `ErrInvalidFaultAttribution`         | 28   | `INVALID_ARGUMENT`       | Fault attribution is missing or incompatible with settlement |
| `ErrUnknownVerificationRecordType`   | 29   | `INVALID_ARGUMENT`       | Dynamic verification store record has no registered decoder |
| `ErrInsufficientAuditorCount`        | 30   | `FAILED_PRECONDITION`    | Provider lacks required number of independent auditors      |
| `ErrUnauthorizedAuditEscrowSettlement` | 31 | `PERMISSION_DENIED`      | Signer cannot use the requested audit escrow settlement path |

---

## Appendix B: Module Dependencies

```
x/verification
    reads from:
        x/provider   -- provider registration, registration timestamp
        x/market     -- lease completion stats through MarketStatsKeeper
        x/bank       -- token transfers (bond deposits, fee escrow, withdrawals)
        x/gov        -- authority validation for governance messages

    read by:
        x/market     -- bid filtering through VerificationKeeper interface
        x/incentive  -- incentive eligibility (AEP-53, future)
```

```
Module initialization order: construct x/provider, x/market, and x/verification,
then late-bind MarketStatsKeeper and VerificationKeeper interfaces.
Do not pass concrete x/market keeper into x/verification and concrete x/verification
keeper into x/market during construction.
```

---

## 5. Inventory Service Extensions

The Inventory Service already exists in the provider codebase. This specification requires the following extensions:

### 5.1 Required Extensions

- **Multi-source data collection**: For each hardware class (CPU, GPU, memory, storage, network), report
  properties from multiple independent data sources as described in
  [Multi-Source Data Collection](./README.md#multi-source-data-collection). Flag discrepancies between sources.
- **Challenge-response support**: Accept a 32-byte cryptographically random nonce in the query request.
  Include the nonce in the signed response payload.
- **Response signing**: Every response must be signed by the provider's on-chain key. The signature covers
  the entire payload including nonce, timestamp, and all hardware data.
- **Virtualization detection**: Implement the detection methods described in
  [Virtualization Detection](./README.md#virtualization-detection) and include the result in every snapshot.
- **Snapshot hash generation**: Compute SHA-256 of the full snapshot payload for posting via `MsgPostSnapshotHash`.
- **`ResourceSummary` generation**: Extract the on-chain summary fields (`total_gpus`, `total_vcpus`,
  `total_memory_mb`, `total_storage_mb`, `active_leases`, `software_version`, `software_signature`) from
  the full snapshot for inclusion in `MsgPostSnapshotHash`.

### 5.2 Vendor Library Handling

The binary is statically linked for all system libraries. For vendor hardware management libraries (NVIDIA NVML,
AMD ROCm SMI), the binary may dynamically load them at runtime:

1. Treat vendor library output as one data source among multiple
2. Cross-validate against direct hardware reads (PCIe configuration space, CPUID)
3. Flag discrepancies in the snapshot

AEP-86 v1 does not define signature enforcement for dynamically loaded vendor libraries. That problem belongs with the
separate signing-key AEP or phase 2 work.

### 5.3 gRPC Service

The Inventory Service is exposed as a gRPC service on the existing provider daemon endpoint:

```protobuf
service InventoryService {
    rpc GetInventorySnapshot(GetInventorySnapshotRequest) returns (GetInventorySnapshotResponse);
}

message GetInventorySnapshotRequest {
    bytes nonce = 1; // 32 bytes, cryptographically random. Optional.
}

message GetInventorySnapshotResponse {
    bytes snapshot_payload = 1;  // full machine-generated snapshot
    bytes signature = 2;         // provider on-chain key signature over snapshot_payload
    string provider = 3;         // provider address for key lookup
}
```

The snapshot payload format is implementation-defined but must include all fields described in
[Snapshot Contents](./README.md#snapshot-contents).

---

## 6. V1 Auditor Software

The v1 auditor software is a required deliverable for activation. It should live outside consensus code but use the same
protobuf and query clients as `x/verification`.

Minimum commands:

- `collect`: query provider inventory with nonce, fetch chain facts, run benchmarks, and write raw artifacts.
- `verify`: evaluate tier and capability checks from collected artifacts.
- `evidence`: produce canonical evidence bytes and SHA-256 hash for `MsgSubmitAttestation`.
- `submit`: consume `audit_escrow_id`, pay auditor deposit, and submit `MsgSubmitAttestation`.
- `revoke`: run targeted checks during TTL and submit `MsgRevokeAttestation` with typed reason and evidence hash.

The software should keep baseline and sustained validation artifacts separate:

- Baseline artifacts are created during the initial attestation audit and describe the provider state and benchmark
  results that justify the tier.
- Sustained validation artifacts are created during the TTL and compare current results against the baseline. They are
  the evidence source for revocation, replacement, discrepancy response, or renewal.

The evidence encoder must be deterministic. Every field that affects tier, capability, settlement, deposit, or fault
outcome must be typed. Free-form notes can be included, but they must not drive handler behavior.

---

## 7. Module Registration and Genesis

### 7.1 Module Registration

The `x/verification` module is registered in `app.go`:

- Add `x/verification` to the module manager and begin/end blocker registration
- Register the module's store key
- Create the module account for escrow (bond, fee, provider deposit, and auditor deposit escrow)
- Wire keeper dependencies: `ProviderKeeper`, `MarketStatsKeeper`, `BankKeeper`, governance `authority`
- Expose `VerificationKeeper` to `x/market` through late binding after both keepers are constructed

### 7.2 InitGenesis

```go
func (k Keeper) InitGenesis(ctx sdk.Context, state GenesisState) {
    // 1. Validate and set params
    k.SetParams(ctx, state.Params)

    // 2. Create module account for escrow (bonds + fees + deposits)
    //    The module account must exist before any token transfers
    k.accountKeeper.GetModuleAccount(ctx, ModuleName)

    // 3. Import auditor records
    for _, auditor := range state.Auditors {
        k.SetAuditorRecord(ctx, auditor)
        // Re-create renewal deadline queue entries
        k.insertRenewalQueue(ctx, auditor.Address, auditor.RenewalDeadline)
        if auditor.BondStatus == BondStatusUnbonding && !auditor.BondUnbondingCompletionTime.IsZero() {
            k.insertAuditorUnbondingQueue(ctx, auditor.Address, auditor.BondUnbondingCompletionTime)
        }
    }

    // 4. Import attestation records
    for _, att := range state.Attestations {
        k.SetAttestationRecord(ctx, att)
        // Re-create secondary index and expiry queue for Valid attestations
        if att.Status == AttestationStatusValid {
            k.setAuditorAttestationIndex(ctx, att.Auditor, att.Provider)
            k.insertExpiryQueue(ctx, att.Provider, att.Auditor, att.ExpiresAt)
        }
    }

    // 5. Import discrepancy events
    for _, disc := range state.Discrepancies {
        k.SetDiscrepancyEvent(ctx, disc)
        // Re-create timeout queue for Pending discrepancies
        if disc.ResolutionStatus == DiscrepancyStatusPending {
            timeout := disc.Timestamp.Add(k.GetParams(ctx).DiscrepancyResolutionTimeout)
            k.insertDiscrepancyTimeoutQueue(ctx, disc.ID, timeout)
        }
    }

    // 6. Import provider bonds and snapshots
    for _, bond := range state.ProviderBonds {
        k.SetProviderBondRecord(ctx, bond)
        // Re-create unbonding queue entries
        for _, entry := range bond.UnbondingEntries {
            k.insertProviderUnbondingQueue(ctx, bond.Provider, entry.CompletionTime)
        }
    }
    for _, snap := range state.ProviderSnapshots {
        k.SetProviderSnapshotRecord(ctx, snap)
        // Re-create snapshot compliance queue if not suspended
        if !snap.Suspended {
            k.insertSnapshotComplianceQueue(ctx, snap.Provider, snap.ComplianceDeadline)
        }
    }

    // 7. Set next discrepancy ID
    k.SetNextDiscrepancyID(ctx, state.NextDiscrepancyId)

    // 8. Import audit escrows and grace records
    for _, escrow := range state.AuditEscrows {
        k.SetAuditEscrowRecord(ctx, escrow)
        k.setProviderAuditEscrowIndex(ctx, escrow.Provider, escrow.ID)
        if escrow.ConsumedByAuditor != "" {
            k.setAuditorAuditEscrowIndex(ctx, escrow.ConsumedByAuditor, escrow.ID)
        }
        if escrow.Status == AuditEscrowStatusOpen {
            k.insertAuditEscrowExpiryQueue(ctx, escrow.ID, escrow.ExpiresAt)
        }
    }
    for _, grace := range state.VerificationGraces {
        k.SetProviderVerificationGraceRecord(ctx, grace)
        k.setProviderGraceIndex(ctx, grace.Provider, grace.ID)
        if grace.Status == VerificationGraceStatusActive {
            k.insertGraceExpiryQueue(ctx, grace.ID, grace.ExpiresAt)
        }
    }
    k.SetNextAuditEscrowID(ctx, state.NextAuditEscrowId)
    k.SetNextGraceRecordID(ctx, state.NextGraceRecordId)
}
```

### 7.3 ExportGenesis

```go
func (k Keeper) ExportGenesis(ctx sdk.Context) GenesisState {
    return GenesisState{
        Params:             k.GetParams(ctx),
        Auditors:           k.GetAllAuditorRecords(ctx),
        Attestations:       k.GetAllAttestationRecords(ctx),
        Discrepancies:      k.GetAllDiscrepancyEvents(ctx),
        ProviderBonds:      k.GetAllProviderBondRecords(ctx),
        ProviderSnapshots:  k.GetAllProviderSnapshotRecords(ctx),
        NextDiscrepancyId:  k.GetNextDiscrepancyID(ctx),
        AuditEscrows:       k.GetAllAuditEscrowRecords(ctx),
        NextAuditEscrowId:  k.GetNextAuditEscrowID(ctx),
        VerificationGraces: k.GetAllProviderVerificationGraceRecords(ctx),
        NextGraceRecordId:  k.GetNextGraceRecordID(ctx),
    }
}
```

---

## 8. Module Invariants

The following invariants must hold at all times. These are suitable for registration via the Cosmos SDK
`InvariantRegistry` and should be checked in integration tests.

### 8.1 Escrow Balance Invariant

The module account balance must equal the sum of all escrowed funds:

```
module_balance = sum(att.fee for att in attestations where att.fee_status == Escrowed)
              + sum(att.deposit for att in attestations
                    where att.deposit_status == Escrowed or att.deposit_status == PendingDiscrepancy)
              + sum(escrow.fee for escrow in audit_escrows
                    where escrow.fee_status == Escrowed)
              + sum(escrow.provider_deposit for escrow in audit_escrows
                    where escrow.provider_deposit_status == Escrowed)
              + sum(auditor.bond_amount for auditor in auditors
                    where auditor.bond_status == Bonded or Frozen or Unbonding)
              + sum(bond.bonded_amount for bond in provider_bonds)
              + sum(entry.amount for entry in all unbonding_entries across all provider_bonds)
```

### 8.2 Attestation Validity Invariant

No attestation with status `Valid` has `expires_at` in the past (relative to the last processed block time).

### 8.3 Frozen Auditor Invariant

Every auditor with `bond_status == Frozen` has at least one `DiscrepancyEvent` in `Pending` status where
they are either `auditor_a` or `auditor_b`.

### 8.4 Discrepancy Consistency Invariant

For every `DiscrepancyEvent` in `Pending` status:
- Both `auditor_a` and `auditor_b` have `bond_status == Frozen`
- The attestation records referenced by the discrepancy have `status == Voided` and
  `voided_reason == Discrepancy`
- The referenced attestation records have `fee_status == Escrowed` and
  `deposit_status == PendingDiscrepancy`

For every `DiscrepancyEvent` in `TimedOut` status:
- The referenced attestation records have `status == Voided` and `voided_reason == Discrepancy`
- The referenced attestation records have `fee_status == ReturnedToProvider` and `deposit_status == Slashed`

### 8.5 Snapshot Compliance Invariant

No provider with `ProviderSnapshotRecord.suspended == true` has a valid attestation at Level 2 or above that is
active for bid-matching purposes.

### 8.6 Provider Bond Invariant

For every provider with a valid attestation at Level 2 or above, the provider's `bonded_amount` is at least the
minimum required for the attested tier (calculated from the provider's `ResourceSummary` and the tier's
bond-per-resource governance parameters).

### 8.7 Self-Attestation Invariant

No attestation record exists where `provider == auditor`.

### 8.8 Auditor Authority Invariant

No valid attestation exists where the attested tier exceeds the auditor's `max_attestation_tier`.

### 8.9 Audit Escrow Invariant

Every attestation with `audit_escrow_id != 0` references an `AuditEscrowRecord` with `status == Consumed`, matching
provider, matching `consumed_by_auditor`, and a fee at least equal to the attestation fee.

### 8.10 Grace Record Invariant

Every active `ProviderVerificationGraceRecord` has at least one source discrepancy with status `Pending` or `TimedOut`.

---

## 9. CLI Commands

Key commands for common operations. Full command set is auto-generated from proto service definitions.

### 9.1 Transaction Commands

```bash
# Auditor: post bond after governance approval
akash tx verification post-auditor-bond [amount] --from [auditor-key]

# Provider: open an audit escrow
akash tx verification open-audit-escrow \
  --requested-tier [identified|verified|established|trusted] \
  --fee [amount] \
  --provider-deposit [amount] \
  --expires-at [RFC3339] \
  --from [provider-key]

# Provider: cancel an unconsumed audit escrow
akash tx verification cancel-audit-escrow [audit-escrow-id] --from [provider-key]

# Governance authority: settle an unconsumed audit escrow dispute
akash tx verification settle-audit-escrow [audit-escrow-id] \
  --reason [provider_fault|no_fault] \
  --fault-attribution [provider_fault|no_fault] \
  --evidence-hash [hex-encoded-hash] \
  --from [authority-key]

# Auditor: submit attestation for a provider
akash tx verification submit-attestation \
  --provider [provider-addr] \
  --audit-escrow-id [id] \
  --tier [identified|verified|established|trusted] \
  --capabilities [tee_hardware_attestation,confidential_computing,...] \
  --evidence-hash [hex-encoded-hash] \
  --fee [amount] \
  --deposit [amount] \
  --from [auditor-key]

# Auditor: revoke own attestation
akash tx verification revoke-attestation \
  --provider [provider-addr] \
  --reason [typed-reason] \
  --evidence-hash [hex-encoded-hash] \
  --from [auditor-key]

# Provider: post economic bond
akash tx verification post-provider-bond [amount] --from [provider-key]

# Provider: post inventory snapshot hash
akash tx verification post-snapshot-hash \
  --snapshot-hash [hex-encoded-sha256] \
  --resource-summary [json-file-or-inline] \
  --snapshot-timestamp [RFC3339] \
  --from [provider-key]

# Provider: open a provider-wide maintenance window
akash tx provider open-maintenance \
  --type [planned|emergency|security|network|capacity] \
  --starts-at [RFC3339] \
  --expected-ends-at [RFC3339] \
  --metadata-hash [hex-encoded-hash] \
  --from [provider-key]

# Provider: close a maintenance window
akash tx provider close-maintenance [maintenance-id] --from [provider-key]

# Provider: remove an attestation on self
akash tx verification remove-attestation --auditor [auditor-addr] --from [provider-key]
```

### 9.2 Query Commands

```bash
# Query all attestations for a provider
akash query verification provider-attestations [provider-addr]

# Query a specific attestation
akash query verification attestation [provider-addr] [auditor-addr]

# Query provider's bond status
akash query verification provider-bond [provider-addr]

# Query provider's snapshot record
akash query verification provider-snapshot [provider-addr]

# Query auditor details
akash query verification auditor [auditor-addr]

# Query module parameters
akash query verification params

# Query pending discrepancies
akash query verification discrepancies --status pending

# Query an audit escrow
akash query verification audit-escrow [id]

# Query maintenance windows for a provider
akash query provider maintenances [provider-addr] --status [scheduled|active|elapsed|closed]

# Query one maintenance window
akash query provider maintenance [provider-addr] [maintenance-id]
```
