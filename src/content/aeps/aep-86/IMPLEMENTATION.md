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

---

## 2. Store Key Design Rationale

Supplements [Store Layout and Indexing](./README.md#store-layout-and-indexing) with design rationale.

### 2.1 Key Design Choices

- **Attestation primary key** is `(provider, auditor)` because the most common query pattern is "get all
  attestations for a provider" (prefix scan on `0x02 | provider_addr`).
- **Auditor secondary index** (`0x10`) enables the reverse lookup without duplicating attestation data.
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

> **WARNING: Inverted numeric ordering**. The `VerificationTier` enum uses lower numeric values for higher trust:
> `TierTrusted=1` (L0, highest trust) through `TierIdentified=4` (L3, lowest trust). This means `tier <= threshold`
> checks "is this tier at least as good as the threshold", which reads counter-intuitively. All tier comparisons
> MUST use the helper functions below to prevent off-by-one errors.

```go
// TierAtLeast returns true if 'have' is at least as trusted as 'need'.
// Both must be valid tiers (not TierUnspecified).
// Example: TierAtLeast(TierVerified, TierEstablished) returns false (L2 < L1)
// Example: TierAtLeast(TierTrusted, TierVerified) returns true (L0 >= L2)
func TierAtLeast(have, need VerificationTier) bool {
    return have != TierUnspecified && have <= need
}

// TierBetter returns true if 'a' is strictly more trusted than 'b'.
func TierBetter(a, b VerificationTier) bool {
    return a != TierUnspecified && a < b
}
```

### 3.3 VerificationKeeper Interface (consumed by x/market)

```go
// VerificationKeeper -- from x/verification, used by x/market for bid filtering
type VerificationKeeper interface {
    // GetProviderValidAttestations returns all Valid, non-expired attestations for a provider.
    // Does NOT filter by snapshot compliance -- caller must check separately.
    GetProviderValidAttestations(ctx sdk.Context, provider sdk.Address) ([]AttestationRecord, bool)

    // IsProviderSnapshotCompliant returns true if the provider is NOT snapshot-suspended.
    // Returns true if the provider has no snapshot record (L4 providers don't need one).
    IsProviderSnapshotCompliant(ctx sdk.Context, provider sdk.Address) bool

    // GetProviderBestTier returns the best (lowest numeric enum value = highest trust) tier
    // from valid attestations. Returns TierUnspecified if no valid attestations exist.
    GetProviderBestTier(ctx sdk.Context, provider sdk.Address) VerificationTier

    // ProviderHasCapability returns true if any valid attestation for this provider
    // includes the given capability flag.
    ProviderHasCapability(ctx sdk.Context, provider sdk.Address, cap CapabilityFlag) bool
}
```

### 3.4 Market Module Bid Filtering (x/market/handler/server.go)

Replaces the current audit-based matching in `CreateBid`:

```go
// CURRENT (to be replaced):
//   provAttr, _ := ms.keepers.Audit.GetProviderAttributes(ctx, provider)
//   provAttr = append([]atypes.AuditedProvider{{...}}, provAttr...)
//   if !order.MatchRequirements(provAttr) { return nil, mv1.ErrAttributeMismatch }

// NEW:
verReq := order.VerificationRequirement()

if verReq.MinTier != TierUnspecified {
    bestTier := ms.keepers.Verification.GetProviderBestTier(ctx, provider)
    if !TierAtLeast(bestTier, verReq.MinTier) {
        return nil, mv1.ErrInsufficientVerificationTier
    }

    // L2+ providers must be snapshot-compliant for bid eligibility
    if TierAtLeast(bestTier, TierVerified) {
        if !ms.keepers.Verification.IsProviderSnapshotCompliant(ctx, provider) {
            return nil, mv1.ErrProviderSnapshotSuspended
        }
    }
}

for _, requiredCap := range verReq.RequiredCapabilities {
    if !ms.keepers.Verification.ProviderHasCapability(ctx, provider, requiredCap) {
        return nil, mv1.ErrMissingCapability
    }
}

if len(verReq.RequiredAuditors) > 0 {
    attestations, _ := ms.keepers.Verification.GetProviderValidAttestations(ctx, provider)
    if !hasAttestationFromAny(attestations, verReq.RequiredAuditors) {
        return nil, mv1.ErrRequiredAuditorNotFound
    }
}
```

### 3.5 VerificationRequirement (x/deployment proto addition)

The `PlacementRequirements` in the deployment module gains a new field:

```proto
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
}
```

---

## 4. Protobuf Definitions

Complete proto file specifications for `akash.verification.v1`. All files are placed under
`proto/node/akash/verification/v1/`.

### 4.1 types.proto

```proto
syntax = "proto3";
package akash.verification.v1;

import "gogoproto/gogo.proto";

option go_package = "pkg.akt.dev/go/node/verification/v1";

// VerificationTier represents provider verification levels.
// Lower numeric value = higher trust. L4 (Permissionless) has no attestation.
enum VerificationTier {
    option (gogoproto.goproto_enum_prefix) = false;

    verification_tier_unspecified = 0
        [(gogoproto.enumvalue_customname) = "TierUnspecified"];
    verification_tier_trusted = 1
        [(gogoproto.enumvalue_customname) = "TierTrusted"];       // L0
    verification_tier_established = 2
        [(gogoproto.enumvalue_customname) = "TierEstablished"];   // L1
    verification_tier_verified = 3
        [(gogoproto.enumvalue_customname) = "TierVerified"];      // L2
    verification_tier_identified = 4
        [(gogoproto.enumvalue_customname) = "TierIdentified"];    // L3
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
```

### 4.2 state.proto

```proto
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

```proto
syntax = "proto3";
package akash.verification.v1;

import "gogoproto/gogo.proto";
import "amino/amino.proto";
import "cosmos/base/v1beta1/coin.proto";
import "google/protobuf/duration.proto";

option go_package = "pkg.akt.dev/go/node/verification/v1";

message Params {
    cosmos.base.v1beta1.Coin bond_l3 = 1 [(gogoproto.nullable) = false];
    cosmos.base.v1beta1.Coin bond_l2 = 2 [(gogoproto.nullable) = false];
    cosmos.base.v1beta1.Coin bond_l1 = 3 [(gogoproto.nullable) = false];
    cosmos.base.v1beta1.Coin bond_l0 = 4 [(gogoproto.nullable) = false];

    google.protobuf.Duration ttl_l3 = 5
        [(gogoproto.nullable) = false, (gogoproto.stdduration) = true];
    google.protobuf.Duration ttl_l2 = 6
        [(gogoproto.nullable) = false, (gogoproto.stdduration) = true];
    google.protobuf.Duration ttl_l1 = 7
        [(gogoproto.nullable) = false, (gogoproto.stdduration) = true];
    google.protobuf.Duration ttl_l0 = 8
        [(gogoproto.nullable) = false, (gogoproto.stdduration) = true];

    cosmos.base.v1beta1.Coin min_fee_l3 = 9 [(gogoproto.nullable) = false];
    cosmos.base.v1beta1.Coin min_fee_l2 = 10 [(gogoproto.nullable) = false];
    cosmos.base.v1beta1.Coin min_fee_l1 = 11 [(gogoproto.nullable) = false];
    cosmos.base.v1beta1.Coin min_fee_l0 = 12 [(gogoproto.nullable) = false];

    uint32 discrepancy_threshold = 13;

    google.protobuf.Duration auditor_unbonding_period = 14
        [(gogoproto.nullable) = false, (gogoproto.stdduration) = true];

    google.protobuf.Duration renewal_period_l3 = 15
        [(gogoproto.nullable) = false, (gogoproto.stdduration) = true];
    google.protobuf.Duration renewal_period_l2 = 16
        [(gogoproto.nullable) = false, (gogoproto.stdduration) = true];
    google.protobuf.Duration renewal_period_l1 = 17
        [(gogoproto.nullable) = false, (gogoproto.stdduration) = true];
    google.protobuf.Duration renewal_period_l0 = 18
        [(gogoproto.nullable) = false, (gogoproto.stdduration) = true];

    google.protobuf.Duration snapshot_hash_interval = 19
        [(gogoproto.nullable) = false, (gogoproto.stdduration) = true];
    google.protobuf.Duration max_snapshot_age = 20
        [(gogoproto.nullable) = false, (gogoproto.stdduration) = true];

    cosmos.base.v1beta1.Coin bond_gpu_l2 = 21 [(gogoproto.nullable) = false];
    cosmos.base.v1beta1.Coin bond_gpu_l1 = 22 [(gogoproto.nullable) = false];
    cosmos.base.v1beta1.Coin bond_gpu_l0 = 23 [(gogoproto.nullable) = false];
    cosmos.base.v1beta1.Coin bond_vcpu_l2 = 24 [(gogoproto.nullable) = false];
    cosmos.base.v1beta1.Coin bond_vcpu_l1 = 25 [(gogoproto.nullable) = false];
    cosmos.base.v1beta1.Coin bond_vcpu_l0 = 26 [(gogoproto.nullable) = false];
    cosmos.base.v1beta1.Coin bond_mem_gb_l2 = 27 [(gogoproto.nullable) = false];
    cosmos.base.v1beta1.Coin bond_mem_gb_l1 = 28 [(gogoproto.nullable) = false];
    cosmos.base.v1beta1.Coin bond_mem_gb_l0 = 29 [(gogoproto.nullable) = false];
    cosmos.base.v1beta1.Coin bond_storage_tb_l2 = 30 [(gogoproto.nullable) = false];
    cosmos.base.v1beta1.Coin bond_storage_tb_l1 = 31 [(gogoproto.nullable) = false];
    cosmos.base.v1beta1.Coin bond_storage_tb_l0 = 32 [(gogoproto.nullable) = false];

    google.protobuf.Duration provider_bond_unbonding_period = 33
        [(gogoproto.nullable) = false, (gogoproto.stdduration) = true];

    google.protobuf.Duration min_age_l2 = 34
        [(gogoproto.nullable) = false, (gogoproto.stdduration) = true];
    google.protobuf.Duration min_age_l1 = 35
        [(gogoproto.nullable) = false, (gogoproto.stdduration) = true];
    google.protobuf.Duration min_age_l0 = 36
        [(gogoproto.nullable) = false, (gogoproto.stdduration) = true];
    uint32 min_lease_completion_bps_l1 = 37;
    uint32 min_lease_completion_bps_l0 = 38;
    google.protobuf.Duration clean_history_window_l1 = 39
        [(gogoproto.nullable) = false, (gogoproto.stdduration) = true];
    google.protobuf.Duration clean_history_window_l0 = 40
        [(gogoproto.nullable) = false, (gogoproto.stdduration) = true];
    google.protobuf.Duration min_l1_duration_for_l0 = 41
        [(gogoproto.nullable) = false, (gogoproto.stdduration) = true];
    uint32 min_leases_for_completion_rate = 42;

    uint32 max_endblocker_attestation_expiries = 43;
    uint32 max_endblocker_snapshot_suspensions = 44;
    uint32 max_endblocker_unbonding_completions = 45;
    uint32 max_endblocker_discrepancy_timeouts = 46;

    google.protobuf.Duration discrepancy_resolution_timeout = 47
        [(gogoproto.nullable) = false, (gogoproto.stdduration) = true];
    cosmos.base.v1beta1.Coin attestation_deposit = 48 [(gogoproto.nullable) = false];

    bool verification_module_active = 49;

    google.protobuf.Duration contact_response_critical_l3 = 50
        [(gogoproto.nullable) = false, (gogoproto.stdduration) = true];
    google.protobuf.Duration contact_response_critical_l2 = 51
        [(gogoproto.nullable) = false, (gogoproto.stdduration) = true];
    google.protobuf.Duration contact_response_critical_l1 = 52
        [(gogoproto.nullable) = false, (gogoproto.stdduration) = true];
    google.protobuf.Duration contact_response_critical_l0 = 53
        [(gogoproto.nullable) = false, (gogoproto.stdduration) = true];
    google.protobuf.Duration contact_response_standard_l3 = 54
        [(gogoproto.nullable) = false, (gogoproto.stdduration) = true];
    google.protobuf.Duration contact_response_standard_l2 = 55
        [(gogoproto.nullable) = false, (gogoproto.stdduration) = true];
    google.protobuf.Duration contact_response_standard_l1 = 56
        [(gogoproto.nullable) = false, (gogoproto.stdduration) = true];
    google.protobuf.Duration contact_response_standard_l0 = 57
        [(gogoproto.nullable) = false, (gogoproto.stdduration) = true];
}
```

### 4.4 msg.proto

```proto
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
}
message MsgSubmitAttestationResponse {}

message MsgRevokeAttestation {
    option (cosmos.msg.v1.signer) = "auditor";
    option (amino.name) = "akash/verification/v1/MsgRevokeAttestation";
    string provider = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    string auditor = 2 [(cosmos_proto.scalar) = "cosmos.AddressString"];
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
    cosmos.base.v1beta1.Coin required_bond = 5 [(gogoproto.nullable) = false];
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
    string reason = 4;
}
message MsgRevokeProviderAttestationResponse {}

message MsgRevokeAllProviderAttestations {
    option (cosmos.msg.v1.signer) = "authority";
    option (amino.name) = "akash/verification/v1/MsgRevokeAllProviderAttestations";
    string authority = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    string provider = 2 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    string reason = 3;
}
message MsgRevokeAllProviderAttestationsResponse {}

message MsgRevokeAuditorAttestations {
    option (cosmos.msg.v1.signer) = "authority";
    option (amino.name) = "akash/verification/v1/MsgRevokeAuditorAttestations";
    string authority = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    string auditor = 2 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    string reason = 3;
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
    string reason = 6;
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
    string reason = 4;
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

```proto
syntax = "proto3";
package akash.verification.v1;

import "cosmos/msg/v1/msg.proto";
import "akash/verification/v1/msg.proto";

option go_package = "pkg.akt.dev/go/node/verification/v1";

service Msg {
    option (cosmos.msg.v1.service) = true;

    rpc PostAuditorBond(MsgPostAuditorBond) returns (MsgPostAuditorBondResponse);
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

```proto
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

```proto
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
}

message EventAttestationExpired {
    string provider = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    string auditor = 2 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    VerificationTier tier = 3;
}

message EventAttestationRevoked {
    string provider = 1 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    string auditor = 2 [(cosmos_proto.scalar) = "cosmos.AddressString"];
    string initiator = 3;
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
    string reason = 3;
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
```

### 4.8 genesis.proto

```proto
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
| `ErrInsufficientL1History`           | 13   | `FAILED_PRECONDITION`    | Provider lacks required continuous L1+ attestation for L0  |
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

---

## Appendix B: Module Dependencies

```
x/verification
    reads from:
        x/provider   -- provider registration, registration timestamp
        x/market     -- lease completion stats (provider lease history)
        x/bank       -- token transfers (bond deposits, fee escrow, withdrawals)
        x/gov        -- authority validation for governance messages

    read by:
        x/market     -- bid filtering (VerificationKeeper interface)
        x/incentive  -- incentive eligibility (AEP-53, future)
```

```
Module initialization order: x/provider -> x/market -> x/verification
(x/verification depends on x/provider and x/market keepers)
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

1. Verify the vendor library's cryptographic signature before loading
2. Treat vendor library output as one data source among multiple
3. Cross-validate against direct hardware reads (PCIe configuration space, CPUID)
4. Flag discrepancies in the snapshot

### 5.3 gRPC Service

The Inventory Service is exposed as a gRPC service on the existing provider daemon endpoint:

```proto
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

## 6. Module Registration and Genesis

### 6.1 Module Registration

The `x/verification` module is registered in `app.go`:

- Add `x/verification` to the module manager and begin/end blocker registration
- Register the module's store key
- Create the module account for escrow (bond and fee escrow)
- Wire keeper dependencies: `ProviderKeeper`, `MarketKeeper`, `BankKeeper`, governance `authority`

### 6.2 InitGenesis

```go
func (k Keeper) InitGenesis(ctx sdk.Context, state GenesisState) {
    // 1. Validate and set params
    k.SetParams(ctx, state.Params)

    // 2. Create module account for escrow (bonds + fees)
    //    The module account must exist before any token transfers
    k.accountKeeper.GetModuleAccount(ctx, ModuleName)

    // 3. Import auditor records
    for _, auditor := range state.Auditors {
        k.SetAuditorRecord(ctx, auditor)
        // Re-create renewal deadline queue entries
        k.insertRenewalQueue(ctx, auditor.Address, auditor.RenewalDeadline)
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
}
```

### 6.3 ExportGenesis

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
    }
}
```

---

## 7. Module Invariants

The following invariants must hold at all times. These are suitable for registration via the Cosmos SDK
`InvariantRegistry` and should be checked in integration tests.

### 7.1 Escrow Balance Invariant

The module account balance must equal the sum of all escrowed funds:

```
module_balance = sum(att.fee for att in attestations where att.fee_status == Escrowed)
              + sum(att.deposit for att in attestations where att.status == Valid)
              + sum(auditor.bond_amount for auditor in auditors where auditor.bond_status == Bonded or Frozen)
              + sum(bond.bonded_amount for bond in provider_bonds)
              + sum(entry.amount for entry in all unbonding_entries across all provider_bonds)
```

### 7.2 Attestation Validity Invariant

No attestation with status `Valid` has `expires_at` in the past (relative to the last processed block time).

### 7.3 Frozen Auditor Invariant

Every auditor with `bond_status == Frozen` has at least one `DiscrepancyEvent` in `Pending` status where they
are either `auditor_a` or `auditor_b`.

### 7.4 Discrepancy Consistency Invariant

For every `DiscrepancyEvent` in `Pending` status:
- Both `auditor_a` and `auditor_b` have `bond_status == Frozen`
- The attestation records referenced by the discrepancy have `status == Voided` and
  `voided_reason == Discrepancy`

### 7.5 Snapshot Compliance Invariant

No provider with `ProviderSnapshotRecord.suspended == true` has a valid attestation at Level 2 or above that is
active for bid-matching purposes.

### 7.6 Provider Bond Invariant

For every provider with a valid attestation at Level 2 or above, the provider's `bonded_amount` is at least the
minimum required for the attested tier (calculated from the provider's `ResourceSummary` and the tier's
bond-per-resource governance parameters).

### 7.7 Self-Attestation Invariant

No attestation record exists where `provider == auditor`.

### 7.8 Auditor Authority Invariant

No valid attestation exists where the attested tier exceeds the auditor's `max_attestation_tier`.

---

## 8. CLI Commands

Key commands for common operations. Full command set is auto-generated from proto service definitions.

### 8.1 Transaction Commands

```bash
# Auditor: post bond after governance approval
akash tx verification post-auditor-bond [amount] --from [auditor-key]

# Auditor: submit attestation for a provider
akash tx verification submit-attestation \
  --provider [provider-addr] \
  --tier [identified|verified|established|trusted] \
  --capabilities [tee_hardware_attestation,confidential_computing,...] \
  --evidence-hash [hex-encoded-hash] \
  --fee [amount] \
  --deposit [amount] \
  --from [auditor-key]

# Auditor: revoke own attestation
akash tx verification revoke-attestation --provider [provider-addr] --from [auditor-key]

# Provider: post economic bond
akash tx verification post-provider-bond [amount] --from [provider-key]

# Provider: post inventory snapshot hash
akash tx verification post-snapshot-hash \
  --snapshot-hash [hex-encoded-sha256] \
  --resource-summary [json-file-or-inline] \
  --snapshot-timestamp [RFC3339] \
  --from [provider-key]

# Provider: remove an attestation on self
akash tx verification remove-attestation --auditor [auditor-addr] --from [provider-key]
```

### 8.2 Query Commands

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
```


