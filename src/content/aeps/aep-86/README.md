---
aep: 86
title: "Provider Verifications"
author: Artur Troian (@troian) Joseph Chalabi (@chalabi2)
status: Draft
type: Standard
category: Core
created: 2026-04-04
supersedes: 9, 40
---

## Motivation

The current provider trust model on Akash (AEP-9) relies on manually assigned audited attributes using a Web of Trust.
This approach is binary (audited or not), does not scale, depends on human accreditors as bottlenecks, and provides no
graduated signal to tenants about the depth of verification a provider has undergone.

Tenants deploying workloads on a decentralized compute marketplace need confidence that:

- The hardware is genuine (not spoofed)
- Provisioned resources match what was bid
- The provider is reliably available
- The infrastructure is where it claims to be
- The operator is accountable

Traditional cloud providers (AWS, GCP, Azure) guarantee these properties implicitly. On Akash, each must be independently
verified. This AEP introduces a graduated, auditor-attested verification tier system that replaces the current audited
attributes model.

## Summary

This AEP defines:

1. **[Verification Tiers](./README.md#verification-tiers)** -- Five levels (Level 0 through Level 4) representing
   progressively deeper verification of a provider's infrastructure, performance, reliability, and operational maturity.
   Level 0 is permissionless (unverified); Level 4 is the highest trust.

2. **[Auditor Role](./README.md#auditor-role)** -- Governance-approved entities that evaluate providers and submit
   on-chain attestations. Auditors post bonds that scale with the highest tier they are authorized to attest and charge
   providers on-chain fees for audits.

3. **[Cross-Validation](./README.md#cross-validation)** -- A mechanism where multiple independent auditor attestations
   for the same provider are compared. Discrepancies exceeding one tier level trigger automatic voiding of conflicting
   attestations and bond freezing.

4. **[Attestation Lifecycle](./README.md#attestation-submission)** -- Per-tier TTLs, fee escrow, revocation, and expiry
   mechanics.

5. **[On-Chain Prerequisite Enforcement](./README.md#on-chain-prerequisite-enforcement)** -- Machine-verifiable tier
   prerequisites (provider registration age, bond posting, lease completion rate, snapshot hash compliance) are enforced
   by the chain when attestations are submitted.

6. **[Provider Economic Bond](./README.md#provider-economic-bond)** -- Providers post AKT collateral scaled to their
   declared resource capacity. The bond is slashable on proven resource misrepresentation and is required for Level 2
   and above.

7. **[Snapshot Hash Enforcement](./README.md#snapshot-hash-enforcement)** -- Providers must periodically post inventory
   snapshot hashes on-chain. Non-compliance triggers automatic attestation suspension for bid-matching purposes.

8. **[New `x/verification` Module](./README.md#module-identity)** -- A new Cosmos SDK module (`akash.verification.v1`)
   replaces the existing `x/audit` module with a
   [phased migration plan](./README.md#migration-from-aep-9).

This AEP supersedes AEP-9 (Trusted Providers) and AEP-40 (Continuous Provider Audits),
unifying their concerns into a single framework.

## Specification

### Verification Tiers

Tiers represent the depth of verification a provider has undergone. The chain stores individual auditor attestations per
provider; it does not compute a single effective tier. Interpretation of attestations is the responsibility of the
application layer (Console, SDL matching, incentive modules).

#### Level 0 -- Permissionless

Trust statement: _"This provider is registered on the network."_

No verification has been performed. The provider has registered on-chain and its daemon is reachable. All provider
attributes are self-reported and unverified.

Requirements:

- Valid on-chain provider registration (`MsgCreateProvider`)
- Provider daemon is reachable (status endpoint responds)

#### Level 1 -- Identified

Trust statement: _"The provider reports its software identity, and we know who operates it."_

The provider reports its provider software identity and the operator behind it is known. This is the first meaningful
trust boundary.

Requirements:

- All Level 0 requirements
- Signed code (phase 2 enforcement target) -- the provider should run an officially signed release of the provider
  software. The software version, binary digest, and observed signature are recorded in auditor evidence for AEP-86 v1.
  Signature enforcement is deferred to a separate signing-key AEP or phase 2.
- Operator identity -- linked to a verifiable entity. The acceptable identity types vary by tier:

  | Tier             | Acceptable Identity Types                                                              |
  | ---------------- | -------------------------------------------------------------------------------------- |
  | L1 (Identified)  | Business registration, domain ownership, or DID-based credential                       |
  | L2 (Verified)    | Business registration or DID-based credential (domain ownership alone is insufficient) |
  | L3 (Established) | Business registration or DID-based credential                                          |
  | L4 (Trusted)     | Business registration required                                                         |

  The auditor records the identity type verified in their off-chain evidence (referenced by `evidence_hash`).
  Signed identity attestation stored on-chain.

- Contact channel -- verified communication endpoint for incident response. Provider must respond to
  critical incidents within `contact_response_critical_l1` and standard provider-operational inquiries within
  `contact_response_standard_l1` (governance parameters). See
  [Contact Responsiveness](./README.md#contact-responsiveness).
- Stated location -- claimed geographic region/jurisdiction (self-reported; verified at higher tiers)

#### Level 2 -- Verified

Trust statement: _"The infrastructure delivers what it promises, and it is where it claims to be."_

Self-reported attributes have been independently validated through automated testing. The provider's claimed resources,
network quality, and physical location have been verified.

Requirements:

- All Level 1 requirements
- Resource delivery accuracy -- provisioned CPU, RAM, GPU memory, and storage match bid quantities. Validated via
  automated resource audit (deploy test workload, measure actual vs. claimed).
- Network quality baseline -- bandwidth and latency meet minimum thresholds. Validated via automated benchmarks from
  multiple vantage points.
- Physical location verification -- hardware is in the claimed region. Validated via IP geolocation and network path
  analysis (traceroute hops, RTT triangulation).
- Inventory consistency -- on-chain attributes match the provider's
  [Inventory Service](./README.md#inventory-service) snapshots. Auditors reconcile snapshot data against on-chain
  attributes; discrepancies flag downgrade.
- Contact responsiveness -- stricter response windows than Level 1. Provider must respond to critical incidents
  within `contact_response_critical_l2` and standard provider-operational inquiries within
  `contact_response_standard_l2`. See
  [Contact Responsiveness](./README.md#contact-responsiveness).
- Minimum economic bond -- AKT locked as provider collateral, scaled to provider capacity. Slashable on proven resource
  misrepresentation. See [Provider Economic Bond](./README.md#provider-economic-bond).
- Minimum uptime -- provider available for a governance-configurable minimum period (e.g., 30 days). Uptime is
  measured on-chain via [snapshot hash posting](./README.md#snapshot-hash-enforcement) frequency: a provider that
  maintains continuous snapshot compliance (posting within every `snapshot_hash_interval` window) for the required
  period demonstrates sustained availability. The `min_age_l2` on-chain prerequisite enforces the minimum
  registration age, while snapshot compliance history provides the availability proof.
- Snapshot hash compliance -- provider must be actively posting inventory snapshot hashes on-chain and must not be
  in suspended state. See [Snapshot Hash Enforcement](./README.md#snapshot-hash-enforcement).

#### Level 3 -- Established

Trust statement: _"This provider is reliably available and consistently performs."_

Time-proven reliability separates serious operators from casual participants. The provider has demonstrated sustained
performance over an extended period.

Requirements:

- All Level 2 requirements
- Extended availability -- minimum governance-configurable rolling uptime above threshold (e.g., 90 days at 99%+).
- Lease completion rate -- above governance-configurable threshold (e.g., 98%). Ratio of provider-completed vs.
  provider-terminated leases over lookback window.
- Continuous performance audits -- periodic automated benchmarks (CPU/GPU, memory bandwidth, storage IOPS, network
  throughput) pass consistently against tier-specific thresholds.
- Resource delivery under load -- audit probes run while provider has active leases to detect overcommitment.
- Data isolation verification -- automated cross-tenant isolation tests (network namespace, filesystem, process isolation).
- Contact responsiveness -- stricter response windows than Level 2. Provider must respond to critical incidents
  within `contact_response_critical_l3` and standard provider-operational inquiries within
  `contact_response_standard_l3`. See
  [Contact Responsiveness](./README.md#contact-responsiveness).
- Higher economic bond -- increased AKT collateral scaled to capacity; longer unbonding period.
- Clean history -- no slashing events or unresolved disputes in lookback window.

**Application-layer policy**: Level 3 should require 2+ independent auditor attestations at Level 3 or better.
Tenants can enforce this with `verification.min_auditor_count: 2`. If they also need attestations from specific named
auditors, they can set `verification.auditors` and choose `verification.auditor_mode: any` or
`verification.auditor_mode: all` (see [SDL Syntax](./README.md#sdl-syntax)).

#### Level 4 -- Trusted

Trust statement: _"This provider is externally audited and offers maximum assurance."_

The highest level of provider assurance. Requires everything from Level 3 plus independent third-party validation of
physical infrastructure and operational practices.

Requirements:

- All Level 3 requirements
- Third-party infrastructure audit -- independent verification of physical data center, power redundancy, cooling, and
  physical security. Audit by governance-approved auditor; audit report hash stored on-chain. Periodic re-audit required.
- Extended compliance history -- minimum governance-configurable continuous Level 3 compliance (e.g., 180 days).
- Maximum economic bond -- highest AKT collateral tier, scaled to capacity.
- SLA commitment -- provider publishes availability and performance SLA parameters. The SLA document hash is
  included in the auditor's off-chain evidence (referenced by `evidence_hash`). The auditor verifies that the
  provider has maintained compliance with their published SLA during the evaluation period. SLA breaches are
  enforced via the existing [`SlashProviderBond`](./README.md#slashproviderbond) governance action when reported
  by auditors or tenants.
- Contact responsiveness -- strictest response windows. Provider must respond to critical incidents within
  `contact_response_critical_l4` and standard provider-operational inquiries within
  `contact_response_standard_l4`. See
  [Contact Responsiveness](./README.md#contact-responsiveness).
- Governance endorsement (optional, supplementary) -- positive attestation from established network participants.

**Application-layer policy**: Level 4 should require 2+ independent auditor attestations at Level 4.
This can be enforced with `verification.min_auditor_count: 2`, optionally combined with named auditor requirements as
described in [Level 3](./README.md#level-1----established).

### Verification Tier Summary

| Dimension                  | L0 (Permissionless) |           L1 (Identified)           |             L2 (Verified)             |           L3 (Established)           |            L4 (Trusted)            |
| -------------------------- | :-----------------: | :---------------------------------: | :-----------------------------------: | :----------------------------------: | :--------------------------------: |
| Signed code                |         --          |              Required               |               Required                |               Required               |              Required              |
| Operator identity          |         --          |              Required               |               Required                |               Required               |              Required              |
| Resource delivery accuracy |         --          |                 --                  |            Automated test             |           Under-load audit           |          Under-load audit          |
| Network quality            |         --          |                 --                  |            Baseline check             |         Continuous benchmark         |        Continuous benchmark        |
| Physical location          |         --          |            Self-reported            |       Verified (geo + network)        |               Verified               |          Audited on-site           |
| Inventory consistency      |         --          |                 --                  |          Machine-reconciled           |          Machine-reconciled          |         Machine-reconciled         |
| Economic bond              |         --          |                 --                  |                Minimum                |                Higher                |              Maximum               |
| Uptime track record        |         --          |                 --                  |            30-day minimum             |             90-day, 99%+             |         180-day continuous         |
| Lease completion rate      |         --          |                 --                  |                  --                   |                 98%+                 |                98%+                |
| Data isolation             |         --          |                 --                  |                  --                   |            Automated test            |           Automated test           |
| Continuous audits          |         --          |                 --                  |                  --                   |            Periodic pass             |           Periodic pass            |
| Contact responsiveness     |         --          | 72 hours critical / 7 days standard | 24 hours critical / 72 hours standard | 4 hours critical / 24 hours standard | 1 hour critical / 4 hours standard |
| Third-party physical audit |         --          |                 --                  |                  --                   |                  --                  |              Required              |
| On-chain SLA               |         --          |                 --                  |                  --                   |                  --                  |              Required              |
| Snapshot hash compliance   |         --          |                 --                  |               Required                |               Required               |              Required              |

### Contact Responsiveness

Providers must maintain verified communication channels, respond within tier-specific time windows, and publish
provider-controlled maintenance notices on chain. Response time requirements escalate with verification tier,
reflecting the operational maturity expected at each level.

This section covers communication that the provider can actually control: active workload incidents, provider
endpoint access, configuration questions, security concerns involving the provider environment, capacity changes,
and planned or emergency maintenance. Marketplace-owned accounting issues, including payment timing, fee accounting,
pricing disputes, and other market settlement behavior, are not provider SLA items and must not be used as grounds for
lowering a provider's verification tier.

#### Incident Severity Levels

| Severity     | Definition                                                                       | Examples                                                                  |
| ------------ | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| **Critical** | Service-affecting incident impacting active tenant workloads or network security | Node outage, data loss, security breach, network partition                |
| **Standard** | Non-urgent provider-controlled operational inquiry or minor issue                | Configuration question, provider endpoint question, maintenance follow-up |

#### Response Time Requirements by Tier

| Tier             |       Critical Incident        |   Standard Provider Inquiry    |
| ---------------- | :----------------------------: | :----------------------------: |
| L1 (Identified)  | `contact_response_critical_l1` | `contact_response_standard_l1` |
| L2 (Verified)    | `contact_response_critical_l2` | `contact_response_standard_l2` |
| L3 (Established) | `contact_response_critical_l3` | `contact_response_standard_l3` |
| L4 (Trusted)     | `contact_response_critical_l4` | `contact_response_standard_l4` |

All response time thresholds are [governance parameters](./README.md#governance-parameters). See
[Initial Governance Parameter Values](./README.md#initial-governance-parameter-values) for suggested defaults.

Response time is measured from the moment the incident is reported through the provider's verified contact channel
to the first meaningful acknowledgement from the provider (not an automated reply). "Meaningful acknowledgement"
means a human response that demonstrates awareness of the reported issue.

#### Auditor Verification

Auditors verify contact responsiveness as part of their off-chain evaluation during attestation:

1. **Probe test** -- the auditor sends a test message (clearly identified as an audit probe) to the provider's
   verified contact channel and measures the time to first meaningful response. The probe should be sent without
   prior notice during the attestation window.
2. **Historical review** -- the auditor reviews any available incident response history (e.g., from tenant
   reports, public incident logs, or prior audit records).
3. **Attestation evidence** -- response time measurements are included in the off-chain audit report
   (referenced by `evidence_hash` in the attestation).

Non-response or exceeding the tier-specific response window is grounds for attesting at a lower tier or refusing
attestation. Repeated non-response during an attestation's TTL is grounds for auditor-initiated revocation via
`MsgRevokeAttestation`.

#### Provider Maintenance Notices

AEP-86 adds provider-signed maintenance notices to `x/provider`. The notice is intentionally narrow: it tells the
chain and tenant-facing clients that the provider has a scheduled or emergency operational window. It does not try to
deliver email, Slack, Discord, Telegram, or webhook messages from consensus. The chain records the source of truth and
emits typed events. Clients, indexers, REST services, and Console use those events and queries to notify tenants through
their selected delivery channels.

V1 supports provider-wide maintenance windows only. A maintenance window applies to all active leases on the provider.
This is the required path for planned maintenance coordination in phase 1. Per-lease, per-region, or free-form provider
messaging can be added later if needed, but they are not required for the phase 1 rollout.

Maintenance window types:

| Type        | Meaning                                                                                         |
| ----------- | ----------------------------------------------------------------------------------------------- |
| `Planned`   | Scheduled maintenance that the provider can announce before the window begins                   |
| `Emergency` | Unplanned work needed to protect active workloads, provider availability, or network safety     |
| `Security`  | Security-related maintenance, patching, credential rotation, or incident containment            |
| `Network`   | Network maintenance, routing changes, upstream provider work, or connectivity remediation       |
| `Capacity`  | Capacity-affecting provider work, such as host replacement, rack work, or resource pool changes |

Provider messages:

```
MsgOpenProviderMaintenance {
  provider: AccAddress
  maintenance_type: ProviderMaintenanceType
  starts_at: Timestamp
  expected_ends_at: Timestamp
  metadata_hash: bytes
}

MsgCloseProviderMaintenance {
  provider: AccAddress
  maintenance_id: uint64
}
```

`provider` is the signer. `metadata_hash` is optional and may point to an off-chain maintenance note, runbook, or
incident record. The on-chain message should not include tenant personal data, private incident details, or long
free-form text.

Open rules:

1. The signer must be the registered provider owner.
2. `maintenance_type` must be one of the defined maintenance types.
3. `expected_ends_at` must be after `starts_at`.
4. The window duration must be no greater than `provider_maintenance_max_duration`.
5. `starts_at` must be no farther in the future than `provider_maintenance_max_lookahead`.
6. V1 permits at most one scheduled or active maintenance window per provider. A provider that needs to correct a
   notice should close the existing window and open a new one. An elapsed window that was not explicitly closed does
   not block a new window.

Close rules:

1. Only the provider that opened the maintenance window can close it.
2. Closing records `closed_at` and emits a close event.
3. If a provider does not close a window, clients treat the window as elapsed after `expected_ends_at`. No EndBlocker
   state transition is required for phase 1.

Provider maintenance state:

```
ProviderMaintenanceRecord {
  id: uint64
  provider: AccAddress
  maintenance_type: ProviderMaintenanceType
  starts_at: Timestamp
  expected_ends_at: Timestamp
  opened_at: Timestamp
  closed_at: Timestamp (nullable)
  metadata_hash: bytes
}
```

Derived status is computed from `closed_at`, `starts_at`, `expected_ends_at`, and block time:

| Derived Status | Condition                                                             |
| -------------- | --------------------------------------------------------------------- |
| `Scheduled`    | `closed_at` is empty and `block_time < starts_at`                     |
| `Active`       | `closed_at` is empty and `starts_at <= block_time < expected_ends_at` |
| `Elapsed`      | `closed_at` is empty and `block_time >= expected_ends_at`             |
| `Closed`       | `closed_at` is set                                                    |

The provider module emits typed events when a maintenance window is opened or closed:

```
EventProviderMaintenanceOpened {
  maintenance_id: uint64
  provider: AccAddress
  maintenance_type: ProviderMaintenanceType
  starts_at: Timestamp
  expected_ends_at: Timestamp
  metadata_hash: bytes
}

EventProviderMaintenanceClosed {
  maintenance_id: uint64
  provider: AccAddress
  closed_at: Timestamp
}
```

Tenant alert path:

1. Provider signs and broadcasts `MsgOpenProviderMaintenance`.
2. `x/provider` validates the provider, stores the `ProviderMaintenanceRecord`, and emits
   `EventProviderMaintenanceOpened`.
3. A client, indexer, REST service, or Console listener observes the event.
4. The listener queries `x/market` for active leases on that provider and maps those leases to tenants.
5. The tenant-facing client creates an alert and delivers it through the tenant's configured channel, such as Console,
   email, webhook, Slack, Discord, or Telegram.
6. Clients also query active and scheduled maintenance records when loading provider or lease views so missed events do
   not hide an active maintenance window.

The chain does not store tenant notification preferences and does not record whether a tenant saw an alert.
Notification delivery failures are client or indexer issues, not provider consensus faults. The provider's on-chain duty
is to publish the maintenance window in time when the provider controls the event and to close it when the window ends.

Maintenance notices do not automatically excuse SLA breaches, failed lease completion, or lower-tier attestation
outcomes. They are evidence that auditors, tenants, and governance can evaluate alongside incident reports, lease
history, and provider behavior.

Provider communication parameters:

| Parameter                            | Description                                                             |
| ------------------------------------ | ----------------------------------------------------------------------- |
| `provider_maintenance_max_duration`  | Maximum length of one provider maintenance window                       |
| `provider_maintenance_max_lookahead` | Maximum time in the future a provider can schedule a maintenance window |

### Signed Code Verification

Provider software releases should be cryptographically signed, but AEP-86 v1 does not implement signing enforcement.
The auditor evidence document may record observed software version, binary digest, and signature bytes. The chain records
the evidence hash, but it does not maintain signing keys, define supported key types, or reject attestations based on
signature validity.

This is intentionally deferred. The first implementation should focus on blockchain behavior, attestation state, escrow,
governance, and market filtering. A separate signing-key AEP or phase 2 change must define the signing system before
signature verification becomes enforceable.

The deferred signing AEP must define at least:

- Supported public key and signature types.
- How public keys are registered, rotated, revoked, queried, and exported in genesis.
- How an auditor or chain client pulls a public key from chain state and verifies a signed provider artifact.
- The exact artifact covered by the signature. For v1 planning, the signature scope is the provider or inventory
  artifact itself, not arbitrary dynamically loaded libraries.
- How to handle unsigned artifacts, unknown keys, revoked keys, modified artifacts, and verification failures.

AEP-86 v1 evidence may include observed signing fields for future compatibility, but those fields are not consensus
enforced and must not be treated as a complete signing-key implementation.

### Capability Flags

Certain provider capabilities are orthogonal to the verification tier and are tracked as on-chain flags embedded within
auditor attestations. The presence or absence of a capability flag does not affect a provider's ability to reach any
verification tier.

Capability flags are included as part of
[`MsgSubmitAttestation`](./README.md#attestation-submission). When an auditor attests a provider, they include both
a verification tier and a set of capability flags that the auditor has verified. This means a single attestation carries
the complete auditor assessment: tier plus capabilities.

Defined capability flags:

- **Hardware Attestation (TEE)** -- CPU/GPU identity cryptographically verified via TEE attestation (Intel TDX,
  AMD SEV-SNP, NVIDIA NVTrust) per AEP-29. Proves the hardware is genuine. Providers with this flag offer
  cryptographic proof of their hardware identity, but hardware attestation is not required for any verification tier.
- **Confidential Computing** -- TEE available for tenant workloads (encrypted execution environment the provider
  operator cannot inspect). Verified via TEE enclave provisioning test per AEP-65.
- **Persistent Storage** -- Provider supports persistent storage volumes that survive lease restarts.
- **Bare Metal** -- Provider offers bare-metal (non-virtualized) compute. Verified by the auditor via inventory
  snapshot [virtualization detection](./README.md#virtualization-detection) showing no hypervisor present.

AEP-86 v1 treats `CapabilityFlag` as a fixed protobuf enum. Adding a new named capability requires a software upgrade
that updates protobuf definitions, validation semantics, SDL names, CLI and UI rendering, evidence requirements, and
auditor software checks. Governance may tune parameters for existing capabilities, but governance cannot add a new
capability identifier without an upgrade in v1.

[Cross-validation](./README.md#cross-validation) (discrepancy detection) applies only to the tier component of
attestations, not to capability flags. Two auditors may attest the same provider at the same tier but with different
capability flags without triggering a discrepancy. Tenants who require specific capabilities should prefer providers
with multiple independent auditor attestations confirming that capability.

This is intentional for v1 because `capabilities` are positive assertions only. A missing capability flag means "this
auditor did not attest this capability," not "this auditor proved the capability is absent." Without negative capability
assertions, the chain cannot distinguish a real contradiction from two auditors checking different optional surfaces. A
future AEP can add explicit `Verified`, `Denied`, and `NotEvaluated` capability assertions and then include capability
disagreements in cross-validation.

### Inventory Service

Providers expose an Inventory Service endpoint that reports machine-generated snapshots of the provider's capabilities
and resources. The Inventory Service is the primary mechanism by which auditors verify provider claims, both during
initial attestation and on an ongoing basis. The endpoint is open to any network participant (auditors, tenants,
tools) for read-only queries.

> **Implementation note**: The Inventory Service already exists in the provider codebase and must be significantly
> extended to meet this specification. The extensions include: multi-source data collection for all hardware classes,
> challenge-response protocol support, virtualization detection, snapshot signing with the provider's on-chain key,
> and on-chain snapshot hash posting via `MsgPostSnapshotHash`. See
> [Implementation Guide](./IMPLEMENTATION.md#5-inventory-service-extensions) for codebase-specific details.

The Inventory Service absorbs the scope of AEP-41 (Standard Provider Attributes) by providing a machine-authoritative
source of provider capabilities, replacing the previous model of self-reported attributes.

> **AEP-41 deprecation**: AEP-41 provider attributes are superseded by inventory snapshots. There is no automatic
> migration or attribute-to-snapshot mapping -- the systems are fundamentally different (key-value self-reported
> attributes vs. structured machine-generated hardware inventory). During the
> [migration period](./README.md#migration-from-aep-9) (Phases 1-3), existing attributes remain queryable via
> `x/audit`. After Phase 4, they are removed. Provider capabilities are determined solely by inventory snapshots
> and auditor attestations.

#### Threat Model

The fundamental challenge of inventory reporting is that the provider controls the machine generating the report.
Even with a known inventory artifact, the operating system, hypervisor, and firmware can lie about the hardware
present. The Inventory Service is designed around the assumption that any single data source can be compromised, and that
defense requires multiple independent layers.

##### Attack Vectors

The following interception points exist between the inventory binary and the actual hardware, ordered from easiest
to hardest to exploit:

1. **Dynamic linker interception (LD_PRELOAD)** -- The provider sets environment variables to inject a shared library
   that intercepts libc calls (`open`, `read`, `ioctl`) before they reach the kernel. The inventory binary calls
   `fopen("/proc/cpuinfo")` and receives fabricated data.

2. **Fake sysfs/procfs** -- The provider mounts overlayfs on `/proc` or `/sys` with modified files, or uses bind
   mounts to replace specific entries. OS-level tools report whatever the provider has placed in these filesystems.

3. **Kernel module syscall hooking** -- The provider loads a kernel module that intercepts syscalls at the kernel
   level. Even if the binary bypasses libc, the kernel itself returns fake data.

4. **Hypervisor spoofing** -- The provider runs the inventory software inside a virtual machine. The hypervisor
   intercepts privileged instructions (including CPUID) and presents a fake hardware topology. The inventory binary
   has no way to distinguish VM-presented hardware from physical hardware.

5. **Firmware/BIOS modification** -- The provider modifies SMBIOS/DMI tables in the BIOS to report different
   hardware identifiers. Tools like `dmidecode` return whatever the firmware claims.

6. **Resource overcommitment** -- The provider has real hardware but overcommits it -- advertising 8 GPUs as
   available when 4 are already allocated to other tenants. Not a hardware spoofing attack, but an inventory
   accuracy attack.

No single defense mechanism defeats all of these vectors. The Inventory Service uses a layered defense strategy
where each layer addresses specific attack vectors, and the combination raises the cost of successful cheating
beyond the economic benefit.

##### Defense Layers

| Layer                                        | Mechanism                                                              | Vectors Defeated                                                            |
| -------------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| 1. Static binary                             | Statically compiled, no dynamic library loading                        | LD_PRELOAD, dynamic linker injection                                        |
| 2. Direct hardware reads                     | Read hardware registers directly, bypassing OS filesystem abstractions | Fake sysfs/procfs, some kernel module attacks                               |
| 3. Multi-source cross-validation             | Report the same property from multiple independent data sources        | Single-source spoofing (faking one source but not all)                      |
| 4. Virtualization detection                  | Active probing for hypervisor presence                                 | Naive VM spoofing                                                           |
| 5. Performance benchmarking (auditor-driven) | Deploy real workloads and measure actual throughput                    | All software-level spoofing (fake hardware cannot deliver real performance) |
| 6. TEE attestation (when available)          | Hardware-rooted chain of trust via enclave execution                   | Everything including VM spoofing and kernel-level attacks                   |

Layer 5 (performance benchmarking) is the ultimate backstop: a provider claiming 8x A100 GPUs must deliver 8x A100
performance. There is no way to fake this without actually having the hardware. This is already part of the
[Level 2 (Verified)](./README.md#level-2----verified) tier requirements.

Layer 6 (TEE attestation) is the gold standard but cannot be required for all providers. Providers with the Hardware
Attestation [capability flag](./README.md#capability-flags) offer the strongest guarantee. Tenants who need maximum
hardware assurance can require it.

#### Binary Requirements

The Inventory Service binary is distributed as part of the provider software artifact. It must meet the following
requirements:

- **Statically linked for system libraries** -- all system dependencies (libc, etc.) are compiled in; the binary
  makes direct syscalls to the kernel, bypassing libc entirely. This eliminates LD_PRELOAD and dynamic linker
  interception for system-level calls. **Exception for vendor hardware management libraries**: the binary may
  dynamically load vendor-provided management libraries (e.g., NVIDIA NVML, AMD ROCm SMI) at runtime. AEP-86 v1 does
  not define signature enforcement for dynamically loaded libraries. Vendor library data is treated as one data source
  among multiple; discrepancies between vendor library output and direct hardware reads (e.g., PCIe configuration
  space) are flagged in the snapshot.
- **Versioned and signature-observed** -- the binary reports its software version, binary digest, and observed signature
  in every inventory snapshot when available. AEP-86 v1 records these fields for evidence compatibility, but signing-key
  verification is deferred to a separate signing-key AEP or phase 2.
- **Direct hardware register reads** -- in addition to reading OS interfaces (`/proc`, `/sys`), the binary reads
  hardware properties directly from hardware registers where possible (see
  [Multi-Source Data Collection](./README.md#multi-source-data-collection) below). Both values are reported in the
  snapshot. For GPU hardware, direct PCIe configuration space reads provide vendor ID, device ID, and BAR
  configuration independently of vendor management libraries.

Whether the Inventory Service is a separate binary or part of the main provider daemon binary is an implementation
detail.

#### Transport and Access

The Inventory Service is exposed as a gRPC service on the existing provider daemon endpoint. It reuses the
provider daemon's TLS configuration and requires no separate authentication -- it is a public, read-only endpoint
analogous to the existing provider status endpoint.

- **Protocol**: gRPC over TLS (reuses existing provider daemon TLS certificate)
- **Port**: same as the provider daemon (no separate port)
- **Authentication**: none required (public read-only)
- **Response signing**: every response MUST be signed by the provider's on-chain key, regardless of whether a
  challenge nonce was included. The signature covers the entire response payload.
- **Rate limiting**: providers SHOULD implement rate limiting on the Inventory Service endpoint. Recommended
  default: 60 requests per minute per source IP. The rate limit is provider-configurable and is not enforced
  on-chain.

#### Snapshot Contents

An inventory snapshot includes:

- **Hardware capabilities** -- CPU models and core counts, GPU models and memory, total physical memory, storage
  devices and capacities, network interface specifications. Each property is reported from multiple independent
  data sources (see [Multi-Source Data Collection](./README.md#multi-source-data-collection)).
- **Resource allocation** -- currently allocated resources (CPU, memory, GPU, storage) across active leases.
- **Available resources** -- unallocated resources available for new workloads.
- **Software version** -- provider software version and observed cryptographic signature bytes.
- **Virtualization status** -- whether the binary detected it is running inside a virtual machine, and the
  detection method and hypervisor identity if detected (see
  [Virtualization Detection](./README.md#virtualization-detection)).
- **Challenge nonce** -- if the query included a nonce, the nonce is included in the signed payload
  (see [Challenge-Response Protocol](./README.md#challenge-response-protocol)).
- **Timestamp** -- snapshot generation time.
- **Source consistency** -- for each hardware property, whether all data sources agree. Discrepancies are flagged
  with the specific values from each source.

Each snapshot is signed by the provider's on-chain key, binding the machine-reported data to the provider's identity.
The signature covers the entire snapshot payload including the nonce and timestamp, preventing modification or replay.

#### Multi-Source Data Collection

The Inventory Service must report hardware properties from multiple independent data sources. This is a hard
requirement, not a recommendation. Snapshots that include only a single source for a property when multiple sources
are available should be treated as lower confidence by auditors.

For each hardware class, the binary reads from both OS-level interfaces and direct hardware register reads where
possible:

**CPU:**

| Source               | Method                                   | Notes                                                                                                                                                   |
| -------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CPUID instruction    | Direct CPU execution (ring 3)            | Reports model, family, stepping, feature flags, topology. On bare metal, cannot be intercepted by the OS kernel. In a VM, the hypervisor can intercept. |
| `/proc/cpuinfo`      | OS filesystem                            | Kernel-reported view. Fakeable via procfs overlay or kernel module.                                                                                     |
| DMI/SMBIOS tables    | Firmware-provided (`/sys/firmware/dmi/`) | BIOS-reported CPU socket information. Fakeable via firmware modification.                                                                               |
| Topology enumeration | CPUID leaf 0x0B / 0x1F                   | Direct enumeration of cores, threads, packages.                                                                                                         |

**GPU:**

| Source                                 | Method                                  | Notes                                                                                                 |
| -------------------------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| PCIe configuration space               | Direct read via sysfs PCI or `/dev/mem` | Reads PCI vendor ID, device ID, subsystem ID from hardware. Harder to fake than sysfs device entries. |
| Vendor management library (e.g., NVML) | Vendor-provided API                     | Reports model, serial number, memory, temperature. For NVIDIA: NVML. For AMD: ROCm SMI.               |
| `/sys/class/drm/`                      | OS filesystem                           | Kernel DRM subsystem view. Fakeable via sysfs overlay.                                                |

**Memory:**

| Source                 | Method                         | Notes                                                                                                            |
| ---------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| SPD data via SMBus/I2C | Direct read from DIMM EEPROM   | Reports actual physical DIMM capacity, speed, manufacturer from the memory module itself. Requires SMBus access. |
| `/proc/meminfo`        | OS filesystem                  | Kernel-reported total and available memory. Fakeable.                                                            |
| DMI/SMBIOS tables      | Firmware-provided              | BIOS-reported memory array information.                                                                          |
| EDAC sysfs             | `/sys/devices/system/edac/mc/` | Error detection and correction subsystem memory controller view.                                                 |

**Storage:**

| Source              | Method                                    | Notes                                                                                    |
| ------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------- |
| SMART data          | ATA/NVMe passthrough commands             | Reads drive model, capacity, serial number, health directly from the storage controller. |
| NVMe admin commands | Direct NVMe identify controller/namespace | For NVMe drives, reads capacity and capabilities from the drive firmware.                |
| `/sys/block/`       | OS filesystem                             | Kernel block device view. Fakeable.                                                      |

**Network:**

| Source                   | Method           | Notes                                                                             |
| ------------------------ | ---------------- | --------------------------------------------------------------------------------- |
| Ethtool ioctl            | Direct NIC query | Reads link speed, driver, firmware version from the network interface controller. |
| `/sys/class/net/`        | OS filesystem    | Kernel network device view. Fakeable.                                             |
| PCIe configuration space | Direct read      | NIC vendor ID, device ID, BAR configuration.                                      |

The snapshot includes the value from each source for every property. Where sources agree, this is a positive trust
signal. Where they disagree, the discrepancy is explicitly flagged with all values included, allowing auditors to
assess which source (if any) has been tampered with.

Spoofing all sources simultaneously for a single property requires compromising independent subsystems (CPU
registers, kernel, firmware, physical hardware buses), which significantly raises the attack cost.

#### Virtualization Detection

The Inventory Service binary actively probes for virtualization and reports the result in every snapshot. Running
in a VM does not disqualify a provider or prevent any verification tier, but it is a fact that auditors and tenants
can see. A provider claiming bare-metal hardware while detected as running in a VM is a red flag for auditor
investigation.

Detection methods:

- **CPUID hypervisor present bit** -- CPUID leaf 0x1, ECX bit 31 is set by all compliant hypervisors per the x86
  specification.
- **Hypervisor vendor string** -- CPUID leaves 0x40000000-0x400000FF return the hypervisor identity string
  (e.g., "KVMKVMKVM", "VMwareVMware", "Microsoft Hv", "XenVMMXenVMM").
- **Timing analysis** -- certain instruction sequences (e.g., CPUID, RDTSC) have measurably different latencies
  in VMs vs. bare metal due to VM exit overhead.
- **Hardware fingerprints** -- presence of VM-specific PCI device IDs (e.g., virtio devices, VMware SVGA, Hyper-V
  synthetic devices) in the PCIe configuration space.
- **DMI/SMBIOS indicators** -- VM platforms often set specific manufacturer/product strings in SMBIOS tables.

The snapshot reports: detected/not-detected, detection method(s) that triggered, and hypervisor identity if
available.

#### Challenge-Response Protocol

All inventory queries support a challenge-response mechanism to prevent snapshot replay attacks.

1. The querier (auditor, tenant, or tool) sends a request that includes a random **nonce** (32 bytes,
   cryptographically random). The nonce MUST be generated using a cryptographically secure random number generator.
2. The Inventory Service generates a fresh snapshot, includes the nonce in the payload, and signs the entire
   payload (including nonce and timestamp) with the provider's on-chain key.
3. The querier verifies the signature against the provider's known on-chain key and confirms the nonce matches.

This ensures:

- The snapshot was generated after the query was issued (prevents caching old snapshots)
- The snapshot has not been modified in transit (signature verification)
- The snapshot was generated by the claimed provider (key binding)

Queries without a nonce are valid but produce snapshots that could be replayed. Auditors should always include a
nonce. Casual queries (e.g., tenant browsing providers in Console) may omit the nonce.

#### On-Chain Snapshot Hashes

Providers periodically post the hash of their latest inventory snapshot on-chain via `MsgPostSnapshotHash`. This
creates an immutable, timestamped audit trail of the provider's self-reported state.

##### Posting Mechanism

`MsgPostSnapshotHash` includes:

- `provider`: provider address (signer)
- `snapshot_hash`: SHA-256 hash of the full snapshot payload
- `resource_summary`: on-chain summary of key capacity metrics (see `ResourceSummary` in
  [State Records](./README.md#provider-snapshot-record))
- `snapshot_timestamp`: snapshot generation time (must be within `max_snapshot_age` of block time)

On submission:

1. Validate the provider is registered on-chain
2. Validate `snapshot_timestamp` is within `[block_time - max_snapshot_age, block_time]` (prevents stale snapshots)
3. Store or replace the `ProviderSnapshotRecord`
4. If the provider was snapshot-suspended, clear the suspension and emit `EventSnapshotResumed`
5. Update the snapshot compliance expiry queue: set next deadline to `block_time + snapshot_hash_interval`
6. Emit `EventSnapshotHashPosted`

##### Snapshot Hash Enforcement

When a provider's `compliance_deadline` passes without a new `MsgPostSnapshotHash`, the following automatic
consequences apply:

1. The provider's `ProviderSnapshotRecord.suspended` is set to `true` by the
   [EndBlocker](./README.md#endblocker-design)
2. An `EventSnapshotSuspended` event is emitted
3. **Effect on attestations**: Suspended providers' attestations at Level 2 and above are treated as **inactive for
   bid matching purposes**. The attestations themselves are NOT voided -- they remain valid in state and their TTLs
   continue running. However, the `x/market` module checks snapshot compliance as an additional filter and rejects
   bids from suspended providers for orders that require Level 2+ verification (see
   [Market Module Integration](./README.md#market-module-integration)).
4. **Effect on new attestations**: `MsgSubmitAttestation` at Level 2 or above is rejected for snapshot-suspended
   providers ([on-chain prerequisite enforcement](./README.md#on-chain-prerequisite-enforcement)).
5. **Recovery**: When the provider posts a new valid snapshot hash via `MsgPostSnapshotHash`, the suspension is
   immediately cleared. No governance action is required.

This design avoids permanent damage for temporary outages (attestations are not voided, TTLs keep running) while
creating a strong economic incentive to maintain snapshot freshness (suspended providers cannot win bids at L2+).

##### Auditor Use of Snapshot Hashes

- Auditors can request the full off-chain snapshot corresponding to any on-chain hash and verify the match.
- If a provider's snapshot changes significantly between two on-chain hashes without a corresponding on-chain
  event (e.g., lease creation/termination), this is a signal for auditor investigation.
- On-chain hashes also allow retroactive verification: if a provider is later found to be cheating, the chain
  of snapshot hashes shows when the misrepresentation began.
- Auditors verify that the off-chain snapshot they receive matches the most recent on-chain snapshot hash. A
  mismatch indicates the provider is serving different data to different queriers.

#### Auditor Use

Auditors query the Inventory Service as part of their evaluation:

- **During initial attestation** -- the auditor queries the Inventory Service with a nonce, compares the snapshot
  against the provider's on-chain attributes, verifies multi-source consistency, checks virtualization status, and
  cross-references against on-chain lease records. Discrepancies between the snapshot and on-chain claims are grounds
  for refusing attestation or attesting at a lower tier.
- **Periodic checks** -- auditors may call the Inventory Service at any time during the attestation's TTL to verify
  that the provider continues to meet the requirements of their attested tier. If a periodic check reveals that the
  provider no longer qualifies (e.g., resource capacity has decreased below claimed levels, observed software identity
  changed unexpectedly, new multi-source discrepancies have appeared), the auditor should revoke their attestation via
  `MsgRevokeAttestation`.
- **Cross-referencing over time** -- auditors compare inventory snapshots taken at different times, correlated with
  on-chain events (lease creation, termination). Available resources should decrease when new leases are created and
  increase when leases end. Inconsistencies indicate overcommitment or manipulation.

### V1 Auditor Software

AEP-86 v1 requires a reference auditor software package before activation. The software does not replace the approved
auditor role, but it makes the mechanical parts of an audit repeatable and gives `evidence_hash` a concrete shape.

The v1 auditor software must provide:

- **Collection commands** for inventory challenge-response, snapshot hash matching, software identity observation,
  provider bond lookup, provider age lookup, lease completion stats, snapshot suspension state, and benchmark execution.
- **Verification commands** that evaluate on-chain prerequisites, inventory consistency, virtualization findings,
  resource delivery checks, network baseline checks, requested capability flags, and tier eligibility.
- **Evidence generation** using a canonical schema and deterministic serialization. The resulting evidence document is
  stored off-chain by the auditor, and its hash is submitted in `MsgSubmitAttestation`.
- **Submission support** that consumes a provider-funded audit escrow, attaches the evidence hash, pays the auditor's
  attestation deposit, and submits `MsgSubmitAttestation`.
- **Revocation support** that reruns the relevant checks during an attestation TTL and submits
  `MsgRevokeAttestation` with a typed reason and evidence hash when the provider no longer qualifies.

#### Auditor Software Phases

The auditor software has two audit phases in v1:

1. **Attestation baseline phase**: the auditor benchmarks the provider during the initial audit, records the state of
   the benchmark as the provider's baseline, and includes the benchmark artifact in the evidence document. This
   baseline is the reference point for the submitted attestation.
2. **Sustained validation phase**: during the attestation TTL, the auditor reruns the relevant checks and compares the
   current results to the baseline. If the provider no longer sustains the baseline within tier thresholds, the auditor
   revokes the attestation or replaces it with a lower-tier attestation using a typed reason and evidence hash.

This phase split is separate from the chain migration phases. The chain stores only the attestation, hashes, escrow
state, and settlement state. The detailed baseline and sustained-validation artifacts live off-chain and are committed
through `evidence_hash`.

#### Evidence Document

The evidence document must be schema-versioned and canonical. Free-form notes may exist, but all fields that affect
tier, capability, fee, deposit, or fault outcomes must be typed.

Canonical v1 schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "akash.audit.evidence.v1",
  "title": "Akash AEP-86 Auditor Evidence",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "schema_version",
    "chain_id",
    "provider",
    "auditor",
    "audit_escrow_id",
    "target_tier",
    "attested_tier",
    "attested_capabilities",
    "collected_at",
    "block_height",
    "snapshot_hash",
    "inventory_nonce",
    "software",
    "network_baseline",
    "sustained_validation",
    "checks",
    "fault_context"
  ],
  "properties": {
    "schema_version": {
      "const": "akash.audit.evidence.v1"
    },
    "chain_id": {
      "type": "string",
      "minLength": 1
    },
    "provider": {
      "$ref": "#/$defs/akash_address"
    },
    "auditor": {
      "$ref": "#/$defs/akash_address"
    },
    "audit_escrow_id": {
      "$ref": "#/$defs/uint64_string"
    },
    "target_tier": {
      "$ref": "#/$defs/tier"
    },
    "attested_tier": {
      "$ref": "#/$defs/tier"
    },
    "attested_capabilities": {
      "type": "array",
      "uniqueItems": true,
      "items": {
        "$ref": "#/$defs/capability"
      }
    },
    "collected_at": {
      "$ref": "#/$defs/timestamp"
    },
    "block_height": {
      "$ref": "#/$defs/uint64_string"
    },
    "snapshot_hash": {
      "$ref": "#/$defs/sha256"
    },
    "inventory_nonce": {
      "$ref": "#/$defs/base64"
    },
    "software": {
      "type": "object",
      "additionalProperties": false,
      "required": ["version", "binary_hash", "verification_status"],
      "properties": {
        "version": {
          "type": "string",
          "minLength": 1
        },
        "binary_hash": {
          "$ref": "#/$defs/sha256"
        },
        "signature": {
          "$ref": "#/$defs/base64"
        },
        "verification_status": {
          "$ref": "#/$defs/software_verification_status"
        }
      }
    },
    "network_baseline": {
      "type": "object",
      "additionalProperties": false,
      "required": ["mbps_down", "mbps_up", "latency_ms_p95", "proof_ref"],
      "properties": {
        "mbps_down": {
          "type": "integer",
          "minimum": 0
        },
        "mbps_up": {
          "type": "integer",
          "minimum": 0
        },
        "latency_ms_p95": {
          "type": "number",
          "minimum": 0
        },
        "proof_ref": {
          "$ref": "#/$defs/sha256"
        }
      }
    },
    "sustained_validation": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "baseline_id",
        "window",
        "last_checked_at",
        "status",
        "proof_ref"
      ],
      "properties": {
        "baseline_id": {
          "$ref": "#/$defs/sha256"
        },
        "window": {
          "type": "string",
          "enum": ["attestation_ttl"]
        },
        "last_checked_at": {
          "$ref": "#/$defs/timestamp"
        },
        "status": {
          "$ref": "#/$defs/validation_status"
        },
        "proof_ref": {
          "$ref": "#/$defs/sha256"
        }
      }
    },
    "checks": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "additionalProperties": false,
        "required": ["name", "status", "proof_ref"],
        "properties": {
          "name": {
            "$ref": "#/$defs/check_name"
          },
          "status": {
            "$ref": "#/$defs/check_status"
          },
          "proof_ref": {
            "$ref": "#/$defs/sha256"
          },
          "observed_at": {
            "$ref": "#/$defs/timestamp"
          },
          "details": {
            "type": "object",
            "additionalProperties": {
              "$ref": "#/$defs/typed_value"
            }
          }
        }
      }
    },
    "fault_context": {
      "type": "object",
      "additionalProperties": false,
      "required": ["fault_attribution", "reason"],
      "properties": {
        "fault_attribution": {
          "$ref": "#/$defs/fault_attribution"
        },
        "reason": {
          "$ref": "#/$defs/reason"
        }
      }
    }
  },
  "$defs": {
    "akash_address": {
      "type": "string",
      "pattern": "^akash1[0-9a-z]+$"
    },
    "uint64_string": {
      "type": "string",
      "pattern": "^[0-9]+$"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "sha256": {
      "type": "string",
      "pattern": "^sha256:[A-Fa-f0-9]{64}$"
    },
    "base64": {
      "type": "string",
      "contentEncoding": "base64"
    },
    "tier": {
      "type": "string",
      "enum": ["L1", "L2", "L3", "L4"]
    },
    "capability": {
      "type": "string",
      "enum": [
        "tee_hardware_attestation",
        "confidential_computing",
        "persistent_storage",
        "bare_metal"
      ]
    },
    "software_verification_status": {
      "type": "string",
      "enum": [
        "observed_only",
        "not_implemented_v1",
        "unsigned_binary",
        "not_applicable"
      ]
    },
    "validation_status": {
      "type": "string",
      "enum": [
        "baseline_established",
        "pass",
        "fail",
        "not_applicable",
        "not_evaluated"
      ]
    },
    "check_status": {
      "type": "string",
      "enum": ["pass", "fail", "not_applicable", "not_evaluated"]
    },
    "check_name": {
      "type": "string",
      "enum": [
        "provider_registered_on_chain",
        "provider_bond_sufficient",
        "provider_age_sufficient",
        "lease_completion_sufficient",
        "no_recent_slashing",
        "snapshot_not_suspended",
        "snapshot_hash_matches_chain",
        "inventory_nonce_matches",
        "inventory_signature_valid",
        "software_identity_recorded",
        "resource_delivery_verified",
        "network_baseline_verified",
        "location_verified",
        "identity_verified",
        "virtualization_status_verified",
        "capability_verified",
        "contact_responsiveness_checked",
        "data_isolation_verified",
        "physical_audit_verified",
        "sustained_baseline_checked"
      ]
    },
    "fault_attribution": {
      "type": "string",
      "enum": [
        "unspecified",
        "provider_fault",
        "auditor_fault",
        "shared_fault",
        "no_fault",
        "inconclusive"
      ]
    },
    "reason": {
      "type": "string",
      "enum": [
        "unspecified",
        "provider_no_longer_qualifies",
        "snapshot_mismatch",
        "software_identity_changed",
        "capability_misrepresented",
        "provider_non_responsive",
        "auditor_evidence_error",
        "auditor_operational_exit",
        "fraudulent_provider",
        "compromised_provider",
        "provider_non_cooperation",
        "faulty_auditor",
        "negligent_auditor",
        "evidence_insufficient",
        "emergency_safety_action",
        "cancelled_unconsumed",
        "expired_unconsumed",
        "auditor_a_correct",
        "auditor_b_correct",
        "both_auditors_wrong",
        "provider_fault",
        "shared_fault",
        "evidence_inconclusive",
        "governance_timeout_review",
        "resource_misrepresentation",
        "capacity_overstatement",
        "fraudulent_snapshot",
        "provider_compromise",
        "sla_breach",
        "non_cooperation_during_audit"
      ]
    },
    "typed_value": {
      "anyOf": [
        {
          "type": "string"
        },
        {
          "type": "number"
        },
        {
          "type": "integer"
        },
        {
          "type": "boolean"
        }
      ]
    }
  }
}
```

Benchmark proof references must point to evidence artifacts, such as raw benchmark output, workload identifiers, vantage
point identifiers, timestamps, and hashes of the workloads used. Numeric measurements without a `proof_ref` are not
sufficient evidence for Level 2 or above.

The auditor software should be built as a constrained CLI or agent with audit logs. Recommended commands are
`collect`, `verify`, `evidence`, `submit`, and `revoke`. The implementation guide should treat this as a first-class
deliverable alongside `x/verification`, not a later tool.

### Auditor Role

#### Overview

An auditor is a governance-approved on-chain role authorized to evaluate providers and submit tier attestations. Auditors
are economically accountable through bonding and are the human-judgment layer that complements machine-verifiable checks.

The chain stores auditor registrations, bonds, and attestations as facts. It does not compute provider trust scores or
effective tiers. Application-layer consumers (Console, SDL matching, incentive modules) interpret raw attestation data
according to their own policies.

The chain enforces a subset of tier prerequisites that are objectively verifiable from on-chain state (see
[On-Chain Prerequisite Enforcement](./README.md#on-chain-prerequisite-enforcement)). Auditors are responsible for all
off-chain verification (resource delivery, identity, network quality, physical location, etc.). If an auditor attests
at a tier that passes on-chain checks but the off-chain evaluation was negligent, the
[cross-validation](./README.md#cross-validation) mechanism and governance review catch it.

#### Auditor Registration

Auditors are added exclusively via [governance proposals](./README.md#governance-actions). A proposal to register an
auditor includes:

- Auditor address
- Maximum attestation tier -- the highest tier this auditor is authorized to attest. An auditor approved for Level 3
  can attest Levels 3, 2, and 1, but not Level 4.
- Organization name and credentials (metadata hash referencing off-chain documentation)

On governance approval, the module derives the required bond from `max_attestation_tier` and the current auditor bond
parameters. The auditor must post at least that amount via `MsgPostAuditorBond` to become Active.

To upgrade an auditor's maximum attestation tier (e.g., from Level 2 to Level 4), a new governance proposal is required.
The auditor must post additional bond to cover the difference.

#### Auditor Bond

The bond is held in an escrow account and scales with the auditor's maximum attestation authority:

| Max Attestation Authority | Bond Requirement                          |
| ------------------------- | ----------------------------------------- |
| Level 1 (Identified)      | `bond_l1` (governance parameter, lowest)  |
| Level 2 (Verified)        | `bond_l2` > `bond_l1`                     |
| Level 3 (Established)     | `bond_l3` > `bond_l2`                     |
| Level 4 (Trusted)         | `bond_l4` (governance parameter, highest) |

Bond states: `Bonded`, `Frozen`, `Unbonding`.

#### Audit Fee

Providers pay auditors an on-chain fee for performing an audit. The provider does not sign
`MsgSubmitAttestation`. Instead, the provider pre-funds an audit escrow through a separate provider-signed request, and
the auditor consumes that escrow when submitting the attestation.

- Governance sets a **minimum fee** per tier level (governance parameter). This prevents race-to-bottom pricing that
  could incentivize cursory evaluations.
- Above the minimum, fees are market-determined. Providers choose what fee to offer, and auditors choose which funded
  requests they are willing to audit.
- Fees are **escrowed** when the provider opens the audit request. If the request expires unused, the provider reclaims
  the escrow. Once an auditor consumes the escrow by submitting an attestation, the fee follows the attestation fee
  lifecycle. If the attestation is voided, fee disposition is determined by typed reason and fault attribution, not by
  `Voided` status alone.

#### Audit Escrow Flow

The provider opens an audit escrow before the auditor submits an attestation:

```
MsgOpenAuditEscrow {
  provider: AccAddress
  requested_tier: VerificationTier
  requested_capabilities: []CapabilityFlag
  fee: Coin
  provider_deposit: Coin
  expires_at: Timestamp
  metadata_hash: bytes
}
```

- `provider` is the signer and funds the escrow.
- No auditor is specified when the escrow is opened. Open audit escrows are a provider-funded pool of requests that any
  active auditor authorized for the requested tier may consume by submitting a valid attestation.
- `fee` must be at least the governance minimum for `requested_tier`.
- `provider_deposit` is a provider-side audit request deposit. It can be zero if governance sets no provider-side
  deposit for the tier.
- `expires_at` bounds how long an auditor can consume the escrow. If it expires unused, the provider can reclaim it.
- `metadata_hash` points to the off-chain commercial audit agreement or request details, if any.

Audit escrow lifecycle is explicit:

| Status      | Meaning                                                         |
| ----------- | --------------------------------------------------------------- |
| `Open`      | Funded by the provider and available for any authorized auditor |
| `Consumed`  | Auditor submitted an attestation that consumed the fee          |
| `Cancelled` | Escrow was cancelled by the provider before it was consumed     |
| `Expired`   | Escrow expired unused                                           |
| `Settled`   | Fee and provider deposit have reached final disposition         |

There is no auditor claim or acceptance transaction in v1. An auditor either submits a valid attestation that consumes
an open escrow, or the escrow remains open until the provider cancels it or it expires. This avoids giving an auditor a
cheap way to reserve provider funds without completing the audit.

Audit escrow close and settlement rules:

| Reason                | Allowed signer       | Fee outcome                                              | Provider deposit outcome  |
| --------------------- | -------------------- | -------------------------------------------------------- | ------------------------- |
| `CancelledUnconsumed` | Provider             | Returned to provider                                     | Returned to provider      |
| `ExpiredUnconsumed`   | EndBlocker           | Returned to provider                                     | Returned to provider      |
| `ProviderFault`       | Governance authority | Returned to provider unless an attestation was submitted | Slashed to community pool |
| `NoFault`             | Governance authority | Returned to provider                                     | Returned to provider      |

The provider cancellation path is a narrow `MsgCancelAuditEscrow` signed by the provider. It only applies while the
escrow is `Open` and unconsumed. A governance-only `MsgSettleAuditEscrow` may settle an unconsumed escrow when the
provider-side deposit is disputed, using `ProviderFault` or `NoFault`. That message must include matching fault
attribution and an evidence hash. The handler must not infer provider fault from an auditor saying work was started off
chain.

```
MsgCancelAuditEscrow {
  provider: AccAddress
  audit_escrow_id: uint64
}

MsgSettleAuditEscrow {
  authority: AccAddress
  audit_escrow_id: uint64
  reason: AuditEscrowSettlementReason
  fault_attribution: FaultAttribution
  evidence_hash: bytes
}
```

The auditor then submits `MsgSubmitAttestation` with `audit_escrow_id`. The module validates that the escrow is `Open`,
funded, unexpired, and matches the provider, requested tier, and requested capabilities. The attestation must include at
least the requested capabilities; extra attested capabilities are allowed. The submitting auditor consumes the escrow
directly. The audit fee is consumed from the escrow, not debited from the provider account during
`MsgSubmitAttestation`.

The auditor's anti-griefing attestation deposit remains separate from provider-side escrow. It is paid by the auditor in
`MsgSubmitAttestation` because it is the auditor's discrepancy liability. Provider-funded deposits and auditor-funded
attestation deposits have separate status fields and settlement rules.

Provider deposit settlement:

- Returned to the provider when the escrow is cancelled before consumption, expires without being consumed or
  settled by governance, or settles with `NoFault`.
- Slashed to the community pool only when governance assigns a typed `ProviderFault` outcome. Examples include the
  provider blocking the audit, submitting knowingly false materials, or withdrawing after auditor work has begun off
  chain without cause. V1 does not pay an auditor from an unconsumed escrow unless an attestation was submitted.
- Returned or slashed by a typed settlement reason. V1 does not introduce a generic open-ended holding state for audit
  escrow disputes. If fault cannot be assigned, the handler uses the no-fault return path. If funds move away from the
  original funder, that movement must come from governance with explicit fault attribution.

#### Attestation Submission

An auditor submits an attestation via `MsgSubmitAttestation`:

- `provider`: provider address being attested
- `auditor`: auditor address (must be Active, authorized for the attested tier)
- `audit_escrow_id`: provider-funded audit escrow consumed by this attestation
- `tier`: the verification tier being attested (must be <= auditor's max attestation tier)
- `capabilities`: list of [capability flags](./README.md#capability-flags) the auditor has verified for this provider
- `evidence_hash`: hash of off-chain audit report / evidence documentation
- `fee`: audit fee amount to consume from the audit escrow (must be >= governance minimum for this tier)
- `deposit`: auditor-funded anti-griefing deposit

On submission, the module:

1. Validates the auditor is Active and authorized for the attested tier
2. Validates the auditor address differs from the provider address (self-audit prevention)
3. Loads and validates the `AuditEscrowRecord` and marks it `Consumed`
4. Validates the fee meets the governance minimum for this tier and is covered by the audit escrow
5. Validates the auditor deposit meets the governance minimum
6. Validates [on-chain prerequisites](./README.md#on-chain-prerequisite-enforcement) for the attested tier
7. Escrows the fee and auditor deposit under the attestation record
8. If the same auditor has an existing attestation for this provider, the old attestation is replaced, the old escrowed
   fee is released to the auditor, the old auditor deposit is returned, and `EventAttestationReplaced` is emitted
9. Stores the new attestation with a TTL based on tier, including the attested capability flags
10. Adds an entry to the attestation expiry queue for [EndBlocker](./README.md#endblocker-design) processing
11. Checks for discrepancy: scans all valid attestations for this provider from different auditors. If any existing
    attestation differs by more than the `discrepancy_threshold` (default: 1 tier level) from the new attestation,
    triggers [cross-validation](./README.md#cross-validation). Discrepancy detection applies only to the tier
    component, not capability flags.

### On-Chain Prerequisite Enforcement

The chain enforces a subset of tier prerequisites that are objectively verifiable from on-chain state. This
prevents obviously invalid attestations from being stored (e.g., a Level 3 attestation for a provider registered
yesterday) and reduces the burden on the [cross-validation](./README.md#cross-validation) mechanism for catching
clear violations.

Auditors remain responsible for all off-chain verification (resource delivery accuracy, identity verification,
network quality, physical location, performance benchmarks, data isolation, etc.).

#### Enforceable Prerequisites by Tier

| Prerequisite                           | Data Source                                                                |    L1    |      L2       |              L3               |                   L4                   |
| -------------------------------------- | -------------------------------------------------------------------------- | :------: | :-----------: | :---------------------------: | :------------------------------------: |
| Provider registered on-chain           | `x/provider` store                                                         | Required |   Required    |           Required            |                Required                |
| Provider bond posted at tier-minimum   | `x/verification` [provider bond](./README.md#provider-economic-bond) store |    --    |   Required    |           Required            |                Required                |
| Provider registration age >= threshold | `x/provider` registration timestamp                                        |    --    | `min_age_l2`  |         `min_age_l3`          |              `min_age_l4`              |
| Lease completion rate >= threshold     | `x/market` lease state counters                                            |    --    |      --       | `min_lease_completion_bps_l3` |     `min_lease_completion_bps_l4`      |
| No active slashing events in window    | `x/verification` provider bond store                                       |    --    |      --       |   `clean_history_window_l3`   |       `clean_history_window_l4`        |
| Snapshot hash compliance               | `x/verification` [snapshot](./README.md#snapshot-hash-enforcement) store   |    --    | Not suspended |         Not suspended         |             Not suspended              |
| Continuous prior-tier attestation      | `x/verification` attestation history                                       |    --    |      --       |              --               | Valid L3+ for `min_l3_duration_for_l4` |

#### Validation Flow

When [`MsgSubmitAttestation`](./README.md#attestation-submission) is processed, step 4 performs the following checks
based on the attested tier:

**For all tiers (L1 through L4):**

- Query `x/provider` to confirm the provider is registered on-chain. Reject with `ErrProviderNotRegistered` if not found.

**For Level 2 and above (L2, L3, L4):**

- Query the [provider bond](./README.md#provider-economic-bond) record. Reject with `ErrInsufficientProviderBond` if
  the bonded amount is less than the tier-required minimum (calculated from the provider's `ResourceSummary` and the
  tier's bond-per-resource [governance parameters](./README.md#governance-parameters)).
- Query the [provider snapshot](./README.md#on-chain-snapshot-hashes) record. Reject with
  `ErrProviderSnapshotSuspended` if the provider is snapshot-suspended.
- Compute the provider's registration age as `block_time - registration_time`. Reject with `ErrProviderTooNew` if
  the age is less than the tier's `min_age` parameter.

**For Level 3 and above (L3, L4):**

- Query `x/market` for the provider's lease completion stats over the lookback window. If the provider has at least
  `min_leases_for_completion_rate` total leases in the window, compute the completion rate as
  `completed_leases / total_leases * 10000` (basis points). Reject with `ErrInsufficientLeaseCompletion` if below
  the tier's threshold. If the provider has fewer than `min_leases_for_completion_rate` leases, the check is skipped
  (new providers are not penalized for low volume).
- Check the provider bond record for slashing events. Reject with `ErrSlashingHistory` if `last_slash_time` is within
  the tier's `clean_history_window`.

**For Level 4 only:**

- Scan the provider's attestation history to verify that the provider has had a continuous valid attestation at Level 3
  or better for at least `min_l3_duration_for_l4`. "Continuous" means there exists at least one valid L3+ attestation
  at all times during the lookback period, considering attestation creation and expiry timestamps. Reject with
  `ErrInsufficientL3History` if not met.

#### Cross-Module Keeper Interfaces

The `x/verification` module requires read-only access to:

```
ProviderKeeper (from x/provider):
  Get(ctx, address) -> (Provider, bool)
  GetRegistrationTime(ctx, address) -> (Timestamp, bool)

MarketKeeper (from x/market):
  GetProviderLeaseStats(ctx, provider, since) -> LeaseStats
```

`LeaseStats`:

```
LeaseStats {
  total_leases: uint64
  completed_by_tenant: uint64    // Tenant-closed or naturally completed
  terminated_by_provider: uint64 // Provider-closed prematurely
}
```

The `x/market` module must distinguish lease close reasons. The existing `LeaseClosedReasonOwner` (tenant-initiated)
is already tracked. A `LeaseClosedReasonProvider` reason must be distinguished from tenant-initiated closures. The
completion rate is calculated as: `(total_leases - terminated_by_provider) / total_leases`.

#### Attestation TTL

Attestations expire automatically. Higher tiers require more frequent re-audit:

| Tier    | TTL                                                 |
| ------- | --------------------------------------------------- |
| Level 1 | Longest (governance parameter, e.g., 365 days)      |
| Level 2 | Shorter (governance parameter, e.g., 180 days)      |
| Level 3 | Shorter still (governance parameter, e.g., 90 days) |
| Level 4 | Shortest (governance parameter, e.g., 90 days)      |

On expiry, the attestation status becomes `Expired`, the escrowed fee is released to the auditor, the auditor deposit is
returned, and the attestation is no longer considered valid. Expiry is processed by the
[EndBlocker](./README.md#endblocker-design) via the attestation expiry queue.

#### Attestation Revocation

An auditor may revoke their own attestation at any time via `MsgRevokeAttestation`. This immediately voids the
attestation. When the reason is provider-side or no-fault, the escrowed fee is released to the auditor because the
auditor performed the work and revocation is an act of diligence. When the auditor revokes because their own evidence
or process was wrong, the fee is returned to the provider.

```
MsgRevokeAttestation {
  provider: AccAddress
  auditor: AccAddress
  reason: AttestationRevocationReason
  evidence_hash: bytes
}
```

`MsgRevokeAttestation` must include a typed revocation reason and a revocation evidence hash. This keeps ongoing
monitoring auditable and prevents "silent" tier drops that have no machine-readable explanation.

V1 revocation settlement is deterministic:

| Reason                      | Fault attribution          | Fee outcome          | Auditor deposit outcome |
| --------------------------- | -------------------------- | -------------------- | ----------------------- |
| `ProviderNoLongerQualifies` | Provider fault or no fault | Released to auditor  | Returned to auditor     |
| `SnapshotMismatch`          | Provider fault or no fault | Released to auditor  | Returned to auditor     |
| `SoftwareIdentityChanged`   | Provider fault or no fault | Released to auditor  | Returned to auditor     |
| `CapabilityMisrepresented`  | Provider fault or no fault | Released to auditor  | Returned to auditor     |
| `ProviderNonResponsive`     | Provider fault or no fault | Released to auditor  | Returned to auditor     |
| `AuditorEvidenceError`      | Auditor fault              | Returned to provider | Slashed                 |
| `AuditorOperationalExit`    | No fault                   | Returned to provider | Returned to auditor     |

A provider may remove any attestation on themselves via `MsgRemoveAttestation`. The escrowed fee is released to the
auditor and the auditor deposit is returned (the auditor performed the work; the provider chose to remove the
attestation).

### Typed Reasons and Fault Attribution

Free-form `reason: string` is not used for settlement or slashing decisions. Messages may include an optional notes
field for human context, but state transitions, fee release, deposit return, and slashing must use typed enums.

```
FaultAttribution =
  Unspecified
  ProviderFault
  AuditorFault
  SharedFault
  NoFault
  Inconclusive

AttestationRevocationReason =
  Unspecified
  ProviderNoLongerQualifies
  SnapshotMismatch
  SoftwareIdentityChanged
  CapabilityMisrepresented
  ProviderNonResponsive
  AuditorEvidenceError
  AuditorOperationalExit

GovernanceAttestationReason =
  Unspecified
  FraudulentProvider
  CompromisedProvider
  ProviderNonCooperation
  FaultyAuditor
  NegligentAuditor
  EvidenceInsufficient
  EmergencySafetyAction

AuditEscrowSettlementReason =
  Unspecified
  CancelledUnconsumed
  ExpiredUnconsumed
  ProviderFault
  NoFault

DiscrepancyResolutionReason =
  Unspecified
  AuditorACorrect
  AuditorBCorrect
  BothAuditorsWrong
  ProviderFault
  SharedFault
  EvidenceInconclusive
  GovernanceTimeoutReview

ProviderBondSlashReason =
  Unspecified
  ResourceMisrepresentation
  CapacityOverstatement
  FraudulentSnapshot
  ProviderCompromise
  SLABreach
  NonCooperationDuringAudit
```

Reason enums answer "what happened." `FaultAttribution` answers "who should bear the economic outcome." Both are
required when a governance action can move fees, deposits, or bonds. The settlement helper rejects any action that uses
`Unspecified` or leaves `FaultAttribution` ambiguous when funds would otherwise be released or slashed.

#### Fee Disposition Summary

The audit fee is released to the auditor in all cases where the attestation reaches a terminal state normally. Voided
attestations use typed fault attribution. The handler must not treat `Voided` as an automatic provider refund.

Required inputs for fee and deposit settlement:

- `terminal_status`: expired, revoked, removed, or voided
- `terminal_transition`: replacement or pending discrepancy, when applicable
- `voided_reason`: discrepancy, governance action, bond withdrawn, or bond slashed
- `typed_reason`: the action-specific reason enum
- `fault_attribution`: provider fault, auditor fault, shared fault, no fault, or inconclusive
- `elapsed_ttl`: optional input for prorated fee release if governance enables proration later

Default v1 disposition:

| Terminal Status                 | Triggered By                         | Fault Attribution                            | Fee Goes To                                  | Deposit Outcome                                          |
| ------------------------------- | ------------------------------------ | -------------------------------------------- | -------------------------------------------- | -------------------------------------------------------- |
| `Expired`                       | TTL reached (EndBlocker)             | No fault                                     | Auditor                                      | Auditor deposit returned                                 |
| `Revoked`                       | Auditor via `MsgRevokeAttestation`   | Provider fault or no fault monitoring reason | Auditor                                      | Auditor deposit returned                                 |
| `Revoked`                       | Auditor via `MsgRevokeAttestation`   | `AuditorEvidenceError`                       | Provider                                     | Auditor deposit slashed                                  |
| `Revoked`                       | Auditor via `MsgRevokeAttestation`   | `AuditorOperationalExit`                     | Provider                                     | Auditor deposit returned                                 |
| `Removed`                       | Provider via `MsgRemoveAttestation`  | No fault                                     | Auditor                                      | Auditor deposit returned                                 |
| `Voided` (Pending discrepancy)  | Cross-validation trigger             | Unknown                                      | Remains escrowed until resolution or timeout | Auditor deposits marked `PendingDiscrepancy`             |
| `Voided` (Discrepancy resolved) | Governance resolution                | Auditor fault                                | Provider for faulty attestation              | Faulty auditor deposit slashed                           |
| `Voided` (Discrepancy resolved) | Governance resolution                | Provider fault or no fault for auditor       | Auditor for vindicated work                  | Vindicated auditor deposit returned                      |
| `Voided` (Discrepancy resolved) | Governance resolution                | Shared fault                                 | Provider                                     | Auditor deposit slashed                                  |
| `Voided` (Governance)           | Governance action                    | Provider fault                               | Auditor                                      | Auditor deposit returned                                 |
| `Voided` (Governance)           | Governance action                    | No fault                                     | Auditor                                      | Auditor deposit returned                                 |
| `Voided` (Governance)           | Governance action                    | Auditor fault                                | Provider                                     | Auditor deposit slashed if the action names that auditor |
| `Voided` (Governance)           | Governance action                    | Shared fault                                 | Provider                                     | Auditor deposit slashed if the action names that auditor |
| `Voided` (BondWithdrawn)        | Provider bond withdrawal             | Provider fault by default                    | Auditor                                      | Auditor deposit returned                                 |
| `Voided` (BondSlashed)          | Provider bond slashed                | Provider fault                               | Auditor                                      | Auditor deposit returned                                 |
| Replacement transition          | Same auditor submits new attestation | No fault                                     | Auditor for old fee                          | Old auditor deposit returned                             |

The settlement helper must update both `fee_status` and `deposit_status` and emit events for each transfer or slash.
`Inconclusive` can be recorded for governance context, but v1 fund settlement requires a concrete fault attribution or
a deterministic timeout rule.

V1 does not persist separate `Disputed` or `Replaced` attestation statuses. A disputed attestation is represented as
`status = Voided`, `voided_reason = Discrepancy`, and a pending `DiscrepancyEvent`. A replacement is represented as an
immediate settlement transition emitted as `EventAttestationReplaced`, then the `(provider, auditor)` attestation record
is overwritten by the new valid attestation.

For v1, `SharedFault` uses the auditor-fault fee path for the attestation fee. Provider-side punishment happens through
provider bond slashing or provider audit deposit settlement, not by adding a new fee-splitting status.

### Cross-Validation

When [`MsgSubmitAttestation`](./README.md#attestation-submission) creates a situation where two valid attestations for
the same provider (from different auditors) differ by more than the `discrepancy_threshold` (default: 1 tier level),
the cross-validation rule triggers:

1. **Both conflicting attestations are voided** (status: `Voided`, reason: `Discrepancy`)
2. **Both auditors' bonds are frozen** (cannot unbond, cannot issue new attestations until resolved)
3. **Escrowed fees remain escrowed and auditor deposits become `PendingDiscrepancy`**, so neither party gets an
   immediate payout before fault is known
4. **Provider receives a bounded discrepancy grace period** if no provider fault is known yet. During the grace period,
   bid filtering may use the provider's pre-discrepancy effective tier so a provider is not immediately dropped to L0
   for an auditor conflict they may not have caused.
5. A `DiscrepancyEvent` is emitted on-chain recording both auditor addresses, both tier claims, the provider, and
   a timestamp.

Resolution requires a [governance proposal](./README.md#resolvediscrepancy) that determines:

- Which auditor (if either) was correct
- Whether to slash either or both auditor bonds
- Whether to remove either or both from the approved auditor set
- Unfreezing bonds of the vindicated auditor(s)
- Fault attribution for fee and deposit settlement
- Whether any discrepancy grace record should end immediately

The discrepancy rule always triggers regardless of the temporal distance between the two attestations. If an old
attestation is stale, it should have expired via its TTL.

**Multi-auditor discrepancy scenarios**: When the new attestation is checked against all existing valid attestations,
it may conflict with multiple auditors simultaneously. In that case, a separate `DiscrepancyEvent` is created for
each conflicting pair (new auditor vs. each conflicting existing auditor). The new auditor's bond is frozen once
(not per-discrepancy). Each existing conflicting auditor's bond is also frozen. All conflicting attestations
(including the new one) are voided. Each discrepancy must be resolved independently via separate governance proposals.

**Frozen auditor edge cases**: If an auditor is already frozen from a previous unresolved discrepancy and a new
attestation from a different auditor conflicts with one of the frozen auditor's remaining valid attestations, the
new discrepancy is created normally. The already-frozen auditor gains an additional discrepancy count. Both
discrepancies must be resolved before the frozen auditor can become Active again.

#### Discrepancy Grace Period

Cross-validation starts from an unknown fault state. The chain knows two auditors disagree, but it does not yet know
whether the provider, one auditor, both auditors, or neither party caused the conflict. To avoid immediately punishing
a provider for a conflict they may not have caused, the module creates a `ProviderVerificationGraceRecord` when a
discrepancy voids the provider's currently effective tier.

```
ProviderVerificationGraceRecord {
  provider: AccAddress
  preserved_tier: VerificationTier
  source_discrepancy_ids: []uint64
  started_at: Timestamp
  expires_at: Timestamp
  status: Active | Expired | Terminated
}
```

During an active grace period:

- `x/market` uses `preserved_tier` for tier bid filtering when `verification_module_active == true` and an order has a
  `VerificationRequirement`.
- Snapshot suspension, provider bond insufficiency, or provider bond slashing terminates the grace period immediately.
- Capability requirements still require valid capability attestations. The grace record preserves tier only.
- The provider should seek a replacement attestation before `expires_at`.

The grace period is bounded by the `discrepancy_grace_period` governance parameter. Governance resolution can terminate
the grace period early if the provider is at fault, or let it expire naturally if the discrepancy is auditor-side.

#### Discrepancy Auto-Resolution Timeout

If a discrepancy event remains in `Pending` status for longer than `discrepancy_resolution_timeout` (governance
parameter), the [EndBlocker](./README.md#endblocker-design) automatically resolves it:

1. Discrepancy status becomes `TimedOut`
2. Both attestations remain voided (they are not reinstated)
3. Escrowed fees are returned to the provider
4. Both auditor deposits for the conflicting attestations are slashed to the community pool
5. Auditor bonds are unfrozen for this discrepancy if the auditor has no other pending discrepancies
6. A `EventDiscrepancyTimedOut` event is emitted

The timeout is not a finding that either auditor was correct. It is a simple v1 safety default: stale disputes do not
restore voided attestations, do not pay either auditor, and do not return anti-griefing deposits. Governance can avoid
that blunt outcome by resolving the discrepancy before timeout.

#### Attestation Deposit (Anti-Griefing)

To raise the economic cost of triggering frivolous discrepancies, auditors must post a small deposit alongside
each attestation submission. The deposit is separate from the audit fee.

- **Deposit amount**: `attestation_deposit` (governance parameter), applied uniformly across all tiers.
- **Normal flow**: the deposit is returned to the auditor when the attestation expires, is removed by the provider, is
  replaced by a new attestation from the same auditor, or is revoked for a provider-side or no-fault reason.
- **Auditor-fault flow**: the deposit is slashed when a typed auditor-fault revocation or governance action says the
  auditor's evidence or process was wrong.
- **Discrepancy flow**: when a discrepancy is triggered, both auditors' deposits for the conflicting attestations
  become `PendingDiscrepancy`. On resolution, the non-vindicated auditor's deposit is slashed (sent to community pool).
  The vindicated auditor's deposit is returned. On auto-resolution timeout, both deposits are slashed to the community
  pool.
- The deposit is included in `MsgSubmitAttestation` as an additional `deposit` field. The module validates
  the deposit meets the governance minimum.

Deposit lifecycle is explicit:

| Status               | Meaning                                        |
| -------------------- | ---------------------------------------------- |
| `Escrowed`           | Deposit is active for a valid attestation      |
| `PendingDiscrepancy` | Deposit is held while a discrepancy is pending |
| `ReturnedToAuditor`  | Deposit has been returned to the auditor       |
| `Slashed`            | Deposit has been sent to the community pool    |

The escrow invariant counts deposits by `deposit_status`, not attestation validity. A voided attestation can still have
escrowed or pending-discrepancy funds.

### Auditor Lifecycle

#### Active Operation

An Active auditor may:

- Submit attestations for any provider (within their max attestation tier)
- Revoke their own attestations
- Receive escrowed fees on attestation expiry

#### Frozen

An auditor whose bond is frozen (due to a discrepancy event) may not:

- Submit new attestations
- Unbond

Existing non-conflicting attestations from a frozen auditor remain valid. A frozen auditor cannot replace their
voided attestation until governance resolves the discrepancy and unfreezes their bond.

#### Resignation

An auditor may voluntarily resign via `MsgResignAuditor`:

- Status becomes `Resigned` -- cannot issue new attestations
- Existing attestations remain valid until their natural TTL expiry
- Bond enters unbonding after all outstanding attestation escrows have resolved (expired, voided, or superseded)

#### Renewal

Governance must periodically re-approve every auditor. This is the same process as initial registration -- a
[governance proposal](./README.md#renewauditor) is submitted and voted on. The renewal period scales with the
auditor's maximum attestation authority: higher authority requires more frequent re-validation.

| Max Attestation Authority | Renewal Period                                                       |
| ------------------------- | -------------------------------------------------------------------- |
| Level 1 (Identified)      | `renewal_period_l1` (governance parameter, longest, e.g., 24 months) |
| Level 2 (Verified)        | `renewal_period_l2` (governance parameter, e.g., 18 months)          |
| Level 3 (Established)     | `renewal_period_l3` (governance parameter, e.g., 12 months)          |
| Level 4 (Trusted)         | `renewal_period_l4` (governance parameter, shortest, e.g., 6 months) |

On successful renewal (governance proposal passes), the auditor's `renewal_deadline` is reset to the current time plus
the applicable renewal period.

If the renewal deadline passes without a successful governance proposal:

- Auditor status becomes `Lapsed` -- cannot issue new attestations
- Existing attestations remain valid until their natural TTL expiry (providers are not disrupted)
- Bond enters unbonding
- The auditor must go through the full governance registration process to reactivate (treated as a new registration)

There is no grace period. The renewal deadline is known well in advance; the auditor and community have the entire
renewal period to prepare the governance proposal.

#### Lapsed

An auditor whose renewal deadline has passed without re-approval:

- Cannot issue new attestations
- Existing non-expired attestations remain valid until their TTL expiry
- Bond enters unbonding
- Must re-register via full governance proposal to become Active again

#### Removal by Governance

Governance may remove an auditor via a [`RemoveAuditor`](./README.md#removeauditor) proposal:

- Status becomes `Removed` -- cannot issue new attestations
- Existing attestations remain valid until their natural TTL expiry (providers are not immediately disrupted)
- Bond enters unbonding (governance-configurable duration)
- The auditor cannot re-register without a new governance proposal

### Governance Actions

All governance proposal types related to the verification tier system are defined here. All governance messages use
the `authority` field set to the governance module address and are submitted via the standard `x/gov` proposal flow.

#### RegisterAuditor

Adds a new auditor to the approved set. Includes auditor address, max attestation tier, and organization metadata. On
approval, the module derives the required bond from the max attestation tier and current params. The auditor must post
their [bond](./README.md#auditor-bond) to become Active.
Sets the initial `renewal_deadline` to the current time plus the applicable
[renewal period](./README.md#renewal).

#### RenewAuditor

Re-approves an existing auditor for a new [renewal period](./README.md#renewal). Same proposal and voting process
as initial registration. On approval, resets the auditor's `renewal_deadline`. The auditor's bond must remain posted.

#### RemoveAuditor

Removes an auditor from the approved set. Auditor status becomes `Removed`. Existing attestations remain valid until
their natural TTL expiry. Bond enters unbonding.

#### RevokeProviderAttestation

Surgically revokes a single attestation on a specific provider.

```
RevokeProviderAttestation {
  authority: AccAddress
  provider: AccAddress
  auditor: AccAddress
  reason: GovernanceAttestationReason
  fault_attribution: FaultAttribution
  evidence_hash: bytes
}
```

Effect:

- The specific attestation (provider + auditor pair) is voided (status: `Voided`, reason: `GovernanceAction`)
- Escrowed fee and auditor deposit are settled according to
  [Fee Disposition Summary](./README.md#fee-disposition-summary)
- No automatic auditor status or bond action

#### RevokeAllProviderAttestations

Revokes all valid attestations on a specific provider. This is the nuclear option for a provider discovered to be
fraudulent or compromised.

```
RevokeAllProviderAttestations {
  authority: AccAddress
  provider: AccAddress
  reason: GovernanceAttestationReason
  fault_attribution: FaultAttribution
  evidence_hash: bytes
}
```

Effect:

- All valid attestations on this provider are voided (status: `Voided`, reason: `GovernanceAction`)
- Escrowed fees and deposits are settled according to `fault_attribution`
- Provider is effectively Level 0 (Permissionless)
- No automatic action against any of the auditors involved

When `fault_attribution` is `ProviderFault`, the auditors are paid for completed work and auditor deposits are returned.
`RevokeAllProviderAttestations` should not be used for a single faulty auditor because it does not name one auditor as
the target. For auditor-side fault on one provider, use `RevokeProviderAttestation`. For auditor-side fault across many
providers, use `RevokeAuditorAttestations`. `Inconclusive` is not a fund-settlement outcome for v1. Governance must use
a concrete fault attribution before this proposal moves fees or deposits.

#### RevokeAuditorAttestations

Revokes all outstanding attestations issued by a specific auditor across all providers. Used when an auditor is found
to have been issuing fraudulent or negligent attestations.

```
RevokeAuditorAttestations {
  authority: AccAddress
  auditor: AccAddress
  reason: GovernanceAttestationReason
  fault_attribution: FaultAttribution
  evidence_hash: bytes
}
```

Effect:

- All valid attestations issued by this auditor (across all providers) are voided (status: `Voided`, reason: `GovernanceAction`)
- Escrowed fees are returned to the respective providers when `fault_attribution` is `AuditorFault`
- Auditor attestation deposits for the voided attestations are slashed when `fault_attribution` is `AuditorFault`
- **Auditor bond is fully slashed**
- Auditor status is not automatically changed to `Removed` -- this proposal can be combined with a separate
  [`RemoveAuditor`](./README.md#removeauditor) proposal if governance also wants to formally remove them. However,
  with a fully slashed bond the auditor is effectively unable to operate until they re-post their bond.

This proposal is independent of `RemoveAuditor`. It allows governance to invalidate an auditor's past work without
necessarily preventing future work (though the full bond slash makes continuation impractical without re-bonding).

#### ResolveDiscrepancy

Resolves a pending or timed-out [discrepancy event](./README.md#cross-validation) triggered by the cross-validation
rule.

```
ResolveDiscrepancy {
  authority: AccAddress
  discrepancy_id: uint64
  vindicated_auditor: AccAddress (empty if neither vindicated)
  slash_auditor_a: bool
  slash_auditor_b: bool
  reason: DiscrepancyResolutionReason
  fault_attribution: FaultAttribution
  evidence_hash: bytes
}
```

Effect:

- Discrepancy event status becomes `Resolved`
- Vindicated auditor's bond is unfrozen (only if all their discrepancies are resolved)
- Non-vindicated auditor's bond is slashed (fully) if the corresponding slash flag is set
- Auditor bond states are updated accordingly. Auditor removal requires a separate `RemoveAuditor` governance action.
- Escrowed fees and pending-discrepancy deposits are settled according to `fault_attribution`
- `resolution_reason`, `fault_attribution`, and `resolution_evidence_hash` are stored on the `DiscrepancyEvent`
- If the discrepancy already timed out, fees and deposits have already followed the timeout rule. The late governance
  action can still settle bond slashing, auditor status, and the final reason record.

#### SlashProviderBond

Slashes a provider's [economic bond](./README.md#provider-economic-bond). Used when a provider is found to have
misrepresented resources.

```
SlashProviderBond {
  authority: AccAddress
  provider: AccAddress
  slash_fraction: Dec (0.0 to 1.0)
  reason: ProviderBondSlashReason
  evidence_hash: bytes
}
```

Effect:

- Provider's `bonded_amount` is reduced by `bonded_amount * slash_fraction`
- Slashed tokens are sent to the community pool
- Provider's `slashed` flag is set, `last_slash_time` is recorded
- If remaining bond falls below the minimum required by any active attestation tier, those attestations are voided
  (status: `Voided`, reason: `BondSlashed`)
- Fees for attestations voided by a provider bond slash are released to auditors by default because the fault is
  provider-side
- An `EventProviderBondSlashed` event is emitted

#### UpdateParams

Updates [governance parameters](./README.md#governance-parameters) for the `x/verification` module.

```
UpdateParams {
  authority: AccAddress
  params: Params
}
```

#### Governance Proposal Summary

| Proposal                                                                     | Target             | Attestation Effect               | Bond Effect              | Auditor Status Effect                |
| ---------------------------------------------------------------------------- | ------------------ | -------------------------------- | ------------------------ | ------------------------------------ |
| [`RegisterAuditor`](./README.md#registerauditor)                             | Auditor            | --                               | Requires posting         | Creates `Active` auditor             |
| [`RenewAuditor`](./README.md#renewauditor)                                   | Auditor            | --                               | Must remain posted       | Resets renewal deadline              |
| [`RemoveAuditor`](./README.md#removeauditor)                                 | Auditor            | Existing valid until TTL         | Enters unbonding         | `Removed`                            |
| [`RevokeAuditorAttestations`](./README.md#revokeauditorattestations)         | Auditor            | All voided immediately           | Fully slashed            | Unchanged (but effectively inactive) |
| [`RevokeProviderAttestation`](./README.md#revokeproviderattestation)         | Provider + Auditor | Single attestation voided        | No effect                | No effect                            |
| [`RevokeAllProviderAttestations`](./README.md#revokeallproviderattestations) | Provider           | All attestations voided          | No effect                | No effect                            |
| [`ResolveDiscrepancy`](./README.md#resolvediscrepancy)                       | Discrepancy event  | --                               | Slash/unfreeze per flags | Unfreeze vindicated                  |
| [`SlashProviderBond`](./README.md#slashproviderbond)                         | Provider           | Void if bond drops below minimum | Provider bond slashed    | No effect                            |
| [`UpdateParams`](./README.md#updateparams)                                   | Module             | --                               | --                       | --                                   |

### Provider Economic Bond

Separate from the [auditor bond](./README.md#auditor-bond), providers must post an AKT bond to qualify for Level 2
and above. The bond serves as economic collateral against resource misrepresentation and is slashable via
[governance action](./README.md#slashproviderbond).

#### Bond Calculation

The required bond is calculated from the provider's declared resource capacity (from their most recent on-chain
`ResourceSummary` submitted via [`MsgPostSnapshotHash`](./README.md#posting-mechanism)):

```
required_bond = sum(
    gpu_count      * bond_per_gpu[tier],
    vcpu_count     * bond_per_vcpu[tier],
    memory_gb      * bond_per_memory_gb[tier],
    storage_tb     * bond_per_storage_tb[tier]
)
```

Each `bond_per_*[tier]` is a [governance parameter](./README.md#governance-parameters). Higher tiers require higher
per-unit bonds:

| Resource       | L2 (Verified)        | L3 (Established)         | L4 (Trusted)             |
| -------------- | -------------------- | ------------------------ | ------------------------ |
| Per GPU        | `bond_gpu_l2`        | `bond_gpu_l3` (>= 2x L2) | `bond_gpu_l4` (>= 4x L2) |
| Per vCPU       | `bond_vcpu_l2`       | `bond_vcpu_l3`           | `bond_vcpu_l4`           |
| Per GB memory  | `bond_mem_gb_l2`     | `bond_mem_gb_l3`         | `bond_mem_gb_l4`         |
| Per TB storage | `bond_storage_tb_l2` | `bond_storage_tb_l3`     | `bond_storage_tb_l4`     |

#### Bond Messages

**`MsgPostProviderBond`** -- Provider deposits AKT into the verification module's bond escrow.

```
MsgPostProviderBond {
    provider: AccAddress (signer)
    amount: Coin (AKT)
}
```

On submission:

1. Validate the provider is registered on-chain
2. Transfer AKT from provider to the module's bond escrow account
3. Update the provider's [`ProviderBondRecord`](./README.md#provider-bond-record) (add to `bonded_amount`)
4. If the provider already has a bond, the new amount is added to the existing bond
5. Emit `EventProviderBondPosted`

**`MsgWithdrawProviderBond`** -- Provider initiates unbonding of part or all of their bond.

```
MsgWithdrawProviderBond {
    provider: AccAddress (signer)
    amount: Coin (AKT amount to withdraw)
}
```

On submission:

1. Validate the requested amount does not exceed the current bonded amount
2. Calculate the remaining bond after withdrawal: `remaining = bonded_amount - amount`
3. If the remaining bond is less than the minimum required by the provider's highest active attestation tier,
   void all attestations at tiers that can no longer be supported (status: `Voided`, reason: `BondWithdrawn`),
   and settle their fees as `ProviderFault` by default
4. Reduce `bonded_amount` by the withdrawal amount
5. Add an `UnbondingEntry` with `completion_time = block_time + provider_bond_unbonding_period`
6. Add an entry to the provider bond unbonding queue for [EndBlocker](./README.md#endblocker-design) processing
7. After unbonding completes (processed by EndBlocker), transfer AKT back to provider

#### Resource Declaration

When posting a bond, the provider's resource capacity is determined from the latest on-chain `ResourceSummary`
(submitted via [`MsgPostSnapshotHash`](./README.md#posting-mechanism)). If no snapshot hash exists, the provider must
submit one first. This creates a natural dependency chain:
`MsgPostSnapshotHash` -> `MsgPostProviderBond` -> `MsgSubmitAttestation` at L2+.

### On-Chain State

#### Module Identity

This specification introduces a new Cosmos SDK module: `x/verification` with proto package `akash.verification.v1`.
This module is separate from the existing `x/audit` module and runs alongside it during the
[migration period](./README.md#migration-from-aep-9).

#### Auditor Record

```
AuditorRecord {
  address: AccAddress
  status: Active | Frozen | Lapsed | Resigned | Removed
  max_attestation_tier: VerificationTier (TierIdentified through TierTrusted)
  bond_amount: Coin
  bond_status: Bonded | Frozen | Unbonding
  bond_unbonding_completion_time: Timestamp (nullable)
  metadata_hash: bytes
  registered_at: Timestamp
  renewal_deadline: Timestamp
  discrepancy_count: uint
}
```

#### Attestation Record

> **Note**: Attestation records exist only for tiers L1-L4 (TierIdentified through TierTrusted). Level 0
> (Permissionless) is the implicit state of any provider without a valid attestation -- there is no L0 attestation
> record. In query responses, `TierUnspecified` (enum value 0) represents "no attestation" (effectively L0).

```
AttestationRecord {
  provider: AccAddress
  auditor: AccAddress
  audit_escrow_id: uint64
  tier: VerificationTier (TierIdentified through TierTrusted)
  capabilities: []CapabilityFlag
  evidence_hash: bytes
  fee: Coin
  fee_status: Escrowed | ReleasedToAuditor | ReturnedToProvider
  deposit: Coin
  deposit_status: Escrowed | PendingDiscrepancy | ReturnedToAuditor | Slashed
  created_at: Timestamp
  expires_at: Timestamp
  status: Valid | Voided | Expired | Revoked | Removed
  voided_reason: null | Discrepancy | Governance | BondWithdrawn | BondSlashed
  fault_attribution: FaultAttribution
}
```

#### Audit Escrow Record

```
AuditEscrowRecord {
  id: uint64
  provider: AccAddress
  consumed_by_auditor: AccAddress (empty until consumed)
  requested_tier: VerificationTier
  requested_capabilities: []CapabilityFlag
  fee: Coin
  fee_status: Escrowed | ReleasedToAuditor | ReturnedToProvider
  provider_deposit: Coin
  provider_deposit_status: Escrowed | ReturnedToProvider | Slashed
  status: Open | Consumed | Cancelled | Expired | Settled
  opened_at: Timestamp
  consumed_at: Timestamp (nullable)
  expires_at: Timestamp
  metadata_hash: bytes
  settlement_reason: AuditEscrowSettlementReason
  fault_attribution: FaultAttribution
}
```

#### Discrepancy Event

```
DiscrepancyEvent {
  id: uint64
  provider: AccAddress
  auditor_a: AccAddress
  auditor_a_tier: uint
  auditor_b: AccAddress
  auditor_b_tier: uint
  timestamp: Timestamp
  resolution_status: Pending | Resolved | TimedOut
  resolution_proposal_id: uint64 (nullable)
  grace_record_id: uint64 (nullable)
  resolution_reason: DiscrepancyResolutionReason
  fault_attribution: FaultAttribution
  resolution_evidence_hash: bytes
}
```

#### Provider Verification Grace Record

```
ProviderVerificationGraceRecord {
  id: uint64
  provider: AccAddress
  preserved_tier: VerificationTier
  source_discrepancy_ids: []uint64
  started_at: Timestamp
  expires_at: Timestamp
  status: Active | Expired | Terminated
}
```

#### Provider Bond Record

```
ProviderBondRecord {
  provider: AccAddress
  bonded_amount: Coin
  unbonding_entries: []UnbondingEntry
  slashed: bool
  last_slash_time: Timestamp (nullable)
}

UnbondingEntry {
  amount: Coin
  completion_time: Timestamp
}
```

#### Provider Snapshot Record

```
ProviderSnapshotRecord {
  provider: AccAddress
  snapshot_hash: bytes
  resource_summary: ResourceSummary
  posted_at: Timestamp
  snapshot_timestamp: Timestamp
  compliance_deadline: Timestamp
  suspended: bool
}

ResourceSummary {
  total_gpus: uint32
  total_vcpus: uint32
  total_memory_mb: uint64
  total_storage_mb: uint64
  active_leases: uint32
  software_version: string
  software_signature: bytes
}
```

#### Provider Maintenance Record

Stored in `x/provider`, not `x/verification`.

```
ProviderMaintenanceRecord {
  id: uint64
  provider: AccAddress
  maintenance_type: Planned | Emergency | Security | Network | Capacity
  starts_at: Timestamp
  expected_ends_at: Timestamp
  opened_at: Timestamp
  closed_at: Timestamp (nullable)
  metadata_hash: bytes
}
```

`Scheduled`, `Active`, `Elapsed`, and `Closed` are derived from the record fields and block time. See
[Provider Maintenance Notices](./README.md#provider-maintenance-notices).

### Governance Parameters

See [Initial Governance Parameter Values](./README.md#initial-governance-parameter-values) for suggested genesis values.

| Parameter                                                          | Description                                                                                                         |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `bond_l1`                                                          | Minimum auditor bond for Level 1 attestation authority                                                              |
| `bond_l2`                                                          | Minimum auditor bond for Level 2 attestation authority                                                              |
| `bond_l3`                                                          | Minimum auditor bond for Level 3 attestation authority                                                              |
| `bond_l4`                                                          | Minimum auditor bond for Level 4 attestation authority                                                              |
| `ttl_l1`                                                           | Attestation TTL for Level 1                                                                                         |
| `ttl_l2`                                                           | Attestation TTL for Level 2                                                                                         |
| `ttl_l3`                                                           | Attestation TTL for Level 3                                                                                         |
| `ttl_l4`                                                           | Attestation TTL for Level 4                                                                                         |
| `min_fee_l1`                                                       | Minimum audit fee for Level 1 attestation                                                                           |
| `min_fee_l2`                                                       | Minimum audit fee for Level 2 attestation                                                                           |
| `min_fee_l3`                                                       | Minimum audit fee for Level 3 attestation                                                                           |
| `min_fee_l4`                                                       | Minimum audit fee for Level 4 attestation                                                                           |
| `discrepancy_threshold`                                            | Maximum tier level difference before [cross-validation](./README.md#cross-validation) triggers (default: 1)         |
| `auditor_unbonding_period`                                         | Duration of auditor bond unbonding                                                                                  |
| `renewal_period_l1`                                                | Auditor [renewal](./README.md#renewal) period for Level 1 max authority                                             |
| `renewal_period_l2`                                                | Auditor renewal period for Level 2 max authority                                                                    |
| `renewal_period_l3`                                                | Auditor renewal period for Level 3 max authority                                                                    |
| `renewal_period_l4`                                                | Auditor renewal period for Level 4 max authority                                                                    |
| `snapshot_hash_interval`                                           | Maximum time between required [snapshot hash](./README.md#on-chain-snapshot-hashes) postings                        |
| `max_snapshot_age`                                                 | Maximum age of snapshot timestamp relative to block time                                                            |
| `bond_gpu_l2` / `bond_gpu_l3` / `bond_gpu_l4`                      | [Provider bond](./README.md#provider-economic-bond) per GPU at each tier                                            |
| `bond_vcpu_l2` / `bond_vcpu_l3` / `bond_vcpu_l4`                   | Provider bond per vCPU at each tier                                                                                 |
| `bond_mem_gb_l2` / `bond_mem_gb_l3` / `bond_mem_gb_l4`             | Provider bond per GB memory at each tier                                                                            |
| `bond_storage_tb_l2` / `bond_storage_tb_l3` / `bond_storage_tb_l4` | Provider bond per TB storage at each tier                                                                           |
| `provider_bond_unbonding_period`                                   | Duration of provider bond unbonding                                                                                 |
| `min_age_l2`                                                       | Minimum provider registration age for Level 2 [on-chain enforcement](./README.md#on-chain-prerequisite-enforcement) |
| `min_age_l3`                                                       | Minimum provider registration age for Level 3                                                                       |
| `min_age_l4`                                                       | Minimum provider registration age for Level 4                                                                       |
| `min_lease_completion_bps_l3`                                      | Minimum lease completion rate (basis points) for Level 3                                                            |
| `min_lease_completion_bps_l4`                                      | Minimum lease completion rate (basis points) for Level 4                                                            |
| `clean_history_window_l3`                                          | Lookback window for clean slashing history (Level 3)                                                                |
| `clean_history_window_l4`                                          | Lookback window for clean slashing history (Level 4)                                                                |
| `min_l3_duration_for_l4`                                           | Minimum continuous Level 3+ attestation duration before Level 4                                                     |
| `min_leases_for_completion_rate`                                   | Minimum lease count before completion rate is enforced                                                              |
| `contact_response_critical_l1`                                     | Maximum response time for critical incidents at Level 1                                                             |
| `contact_response_critical_l2`                                     | Maximum response time for critical incidents at Level 2                                                             |
| `contact_response_critical_l3`                                     | Maximum response time for critical incidents at Level 3                                                             |
| `contact_response_critical_l4`                                     | Maximum response time for critical incidents at Level 4                                                             |
| `contact_response_standard_l1`                                     | Maximum response time for standard provider-controlled operational inquiries at Level 1                             |
| `contact_response_standard_l2`                                     | Maximum response time for standard provider-controlled operational inquiries at Level 2                             |
| `contact_response_standard_l3`                                     | Maximum response time for standard provider-controlled operational inquiries at Level 3                             |
| `contact_response_standard_l4`                                     | Maximum response time for standard provider-controlled operational inquiries at Level 4                             |
| `provider_maintenance_max_duration`                                | Maximum length of one provider maintenance window in `x/provider`                                                   |
| `provider_maintenance_max_lookahead`                               | Maximum time in the future a provider can schedule a maintenance window in `x/provider`                             |
| `max_endblocker_attestation_expiries`                              | Maximum attestation expiries processed per block by [EndBlocker](./README.md#endblocker-design)                     |
| `max_endblocker_snapshot_suspensions`                              | Maximum snapshot suspensions processed per block                                                                    |
| `max_endblocker_unbonding_completions`                             | Maximum bond unbonding completions processed per block                                                              |
| `max_endblocker_discrepancy_timeouts`                              | Maximum discrepancy auto-resolutions processed per block                                                            |
| `max_endblocker_audit_escrow_expiries`                             | Maximum audit escrow expiries processed per block                                                                   |
| `max_endblocker_grace_expiries`                                    | Maximum discrepancy grace expiries processed per block                                                              |
| `discrepancy_resolution_timeout`                                   | Duration before unresolved [discrepancies](./README.md#discrepancy-auto-resolution-timeout) auto-resolve            |
| `discrepancy_grace_period`                                         | Bounded period where a provider may retain pre-discrepancy tier eligibility while fault is unresolved               |
| `attestation_deposit`                                              | Required [deposit](./README.md#attestation-deposit-anti-griefing) per attestation submission (anti-griefing)        |
| `provider_audit_deposit`                                           | Minimum provider-side deposit for opening an audit escrow                                                           |
| `verification_module_active`                                       | Feature flag for [migration](./README.md#migration-from-aep-9): when `true`, market uses `x/verification` for bids  |

### Initial Governance Parameter Values

| Parameter                              | Value              | Rationale                                                                      |
| -------------------------------------- | ------------------ | ------------------------------------------------------------------------------ |
| `bond_l1`                              | 1,000 AKT          | Low barrier for L1 auditors                                                    |
| `bond_l2`                              | 5,000 AKT          | Moderate for L2                                                                |
| `bond_l3`                              | 25,000 AKT         | Significant for L3                                                             |
| `bond_l4`                              | 100,000 AKT        | Highest assurance                                                              |
| `ttl_l1`                               | 365 days           | Annual re-audit                                                                |
| `ttl_l2`                               | 180 days           | Semi-annual                                                                    |
| `ttl_l3`                               | 90 days            | Quarterly                                                                      |
| `ttl_l4`                               | 90 days            | Quarterly                                                                      |
| `min_fee_l1`                           | 10 AKT             | Nominal                                                                        |
| `min_fee_l2`                           | 50 AKT             | Covers automated audit cost                                                    |
| `min_fee_l3`                           | 200 AKT            | Covers deeper evaluation                                                       |
| `min_fee_l4`                           | 1,000 AKT          | Covers on-site audit                                                           |
| `discrepancy_threshold`                | 1                  | Trigger on >1 tier difference                                                  |
| `auditor_unbonding_period`             | 21 days            | Standard Cosmos unbonding                                                      |
| `renewal_period_l1`                    | 24 months          | Longest renewal cycle                                                          |
| `renewal_period_l2`                    | 18 months          |                                                                                |
| `renewal_period_l3`                    | 12 months          |                                                                                |
| `renewal_period_l4`                    | 6 months           | Most frequent re-approval                                                      |
| `snapshot_hash_interval`               | 24 hours           | Daily freshness                                                                |
| `max_snapshot_age`                     | 1 hour             | Snapshot must be recent                                                        |
| `bond_gpu_l2` / `l3` / `l4`            | 50 / 100 / 200 AKT | Per GPU                                                                        |
| `bond_vcpu_l2` / `l3` / `l4`           | 0.5 / 1 / 2 AKT    | Per vCPU                                                                       |
| `bond_mem_gb_l2` / `l3` / `l4`         | 0.25 / 0.5 / 1 AKT | Per GB memory                                                                  |
| `bond_storage_tb_l2` / `l3` / `l4`     | 2 / 4 / 8 AKT      | Per TB storage                                                                 |
| `provider_bond_unbonding_period`       | 21 days            | Standard unbonding                                                             |
| `min_age_l2`                           | 30 days            |                                                                                |
| `min_age_l3`                           | 120 days           |                                                                                |
| `min_age_l4`                           | 300 days           |                                                                                |
| `min_lease_completion_bps_l3` / `l4`   | 9800 (98%)         | High completion threshold                                                      |
| `clean_history_window_l3`              | 90 days            |                                                                                |
| `clean_history_window_l4`              | 180 days           |                                                                                |
| `min_l3_duration_for_l4`               | 180 days           | 6 months at L3 before L4                                                       |
| `min_leases_for_completion_rate`       | 10                 | Avoids 1/1 = 100% gaming                                                       |
| `contact_response_critical_l1`         | 72 hours           | Lenient; proves channel is monitored                                           |
| `contact_response_critical_l2`         | 24 hours           | Business-day response                                                          |
| `contact_response_critical_l3`         | 4 hours            | Near-real-time for established operators                                       |
| `contact_response_critical_l4`         | 1 hour             | Highest-trust providers must be highly responsive                              |
| `contact_response_standard_l1`         | 7 days             | Generous window for non-urgent provider-controlled inquiries                   |
| `contact_response_standard_l2`         | 72 hours           |                                                                                |
| `contact_response_standard_l3`         | 24 hours           |                                                                                |
| `contact_response_standard_l4`         | 4 hours            |                                                                                |
| `provider_maintenance_max_duration`    | 7 days             | Allows long planned windows without making stale notices permanent             |
| `provider_maintenance_max_lookahead`   | 90 days            | Lets tenants see planned maintenance without turning the store into a calendar |
| `max_endblocker_attestation_expiries`  | 100                | Per-block processing cap                                                       |
| `max_endblocker_snapshot_suspensions`  | 50                 | Per-block processing cap                                                       |
| `max_endblocker_unbonding_completions` | 50                 | Per-block processing cap                                                       |
| `max_endblocker_discrepancy_timeouts`  | 10                 | Per-block processing cap                                                       |
| `max_endblocker_audit_escrow_expiries` | 50                 | Per-block processing cap                                                       |
| `max_endblocker_grace_expiries`        | 50                 | Per-block processing cap                                                       |
| `discrepancy_resolution_timeout`       | 90 days            | Prevents indefinite bond freezing                                              |
| `discrepancy_grace_period`             | 14 days            | Gives providers time to replace an attestation while fault is unresolved       |
| `attestation_deposit`                  | 100 AKT            | Anti-griefing; returned on normal expiry, slashed on losing discrepancy        |
| `provider_audit_deposit`               | 100 AKT            | Discourages providers from opening audits and then obstructing them            |
| `verification_module_active`           | `false`            | Off during Phase 1; governance sets to `true` for Phase 2                      |

### Store Layout and Indexing

The `x/verification` module uses the following KV store key layout. All keys use a single-byte prefix for namespace
separation. Composite keys use fixed-width components (20-byte addresses, 8-byte big-endian timestamps/IDs) to
enable efficient prefix iteration and range scans.

#### Primary Records

```
0x01 | auditor_addr (20 bytes)                              -> AuditorRecord
0x02 | provider_addr (20 bytes) | auditor_addr (20 bytes)   -> AttestationRecord
0x03 | discrepancy_id (8 bytes BE)                          -> DiscrepancyEvent
0x04 | provider_addr (20 bytes)                             -> ProviderBondRecord
0x05 | provider_addr (20 bytes)                             -> ProviderSnapshotRecord
0x06                                                        -> Params
0x07                                                        -> next_discrepancy_id (uint64)
0x08 | audit_escrow_id (8 bytes BE)                         -> VerificationStoreRecord(AuditEscrowRecord)
0x09                                                        -> next_audit_escrow_id (uint64)
0x0A | grace_record_id (8 bytes BE)                         -> VerificationStoreRecord(ProviderVerificationGraceRecord)
0x0B                                                        -> next_grace_record_id (uint64)
```

#### Dynamic Verification Records

Escrow and verification lifecycle records under prefixes `0x08` and `0x0A` are stored through a dynamic marshalled
envelope so the store can add new verification record types without overloading one protobuf message.

```
VerificationStoreRecord {
  type_url: string
  value: bytes
}
```

`type_url` must match the concrete protobuf message, for example
`/akash.verification.v1.AuditEscrowRecord`. Handlers must reject unknown `type_url` values unless the chain software
has registered a decoder for that type.

These prefixes are KV-store prefixes, not separate module accounts. AEP-86 v1 holds audit fees, provider audit deposits,
auditor attestation deposits, auditor bonds, and provider bonds in the `x/verification` module account, then uses
verification-store records to say why those coins are held and how they can be released.

#### Secondary Indexes

```
0x10 | auditor_addr (20 bytes) | provider_addr (20 bytes)   -> [] (empty value; existence index)
0x11 | provider_addr (20 bytes) | audit_escrow_id (8B BE)    -> [] (provider audit escrow index)
0x12 | auditor_addr (20 bytes) | audit_escrow_id (8B BE)    -> [] (consumed audit escrow index)
0x13 | provider_addr (20 bytes) | grace_record_id (8B BE)     -> [] (provider grace index)
```

This index enables efficient iteration of all attestations issued by a specific auditor, which is needed for
[`RevokeAuditorAttestations`](./README.md#revokeauditorattestations) and `QueryAuditorAttestations`.

#### Time-Indexed Queues

All queues use big-endian Unix timestamp (8 bytes) as the leading key component after the prefix, enabling
efficient range iteration from the start of the queue up to the current block time.

```
0x20 | expires_at (8B BE) | provider_addr | auditor_addr    -> [] (attestation expiry queue)
0x21 | deadline (8B BE) | auditor_addr                      -> [] (auditor renewal deadline queue)
0x22 | deadline (8B BE) | provider_addr                     -> [] (snapshot compliance queue)
0x23 | completion (8B BE) | provider_addr | seq (4B)        -> [] (provider bond unbonding queue)
0x24 | completion (8B BE) | auditor_addr                    -> [] (auditor bond unbonding queue)
0x25 | timeout (8B BE) | discrepancy_id (8B BE)            -> [] (discrepancy auto-resolution queue)
0x26 | expires_at (8B BE) | audit_escrow_id (8B BE)         -> [] (audit escrow expiry queue)
0x27 | expires_at (8B BE) | grace_record_id (8B BE)         -> [] (discrepancy grace expiry queue)
```

#### Queue Processing Pattern

[EndBlocker](./README.md#endblocker-design) iterates each queue from `prefix` to `prefix | block_time_bytes`
(inclusive), processing and deleting entries. Per-block processing caps
([governance parameters](./README.md#governance-parameters)) prevent unbounded gas usage. If the cap is reached,
remaining entries are processed in the next block.

### EndBlocker Design

The `x/verification` module's EndBlocker processes time-dependent state transitions every block. Queues are processed
in the following order to ensure correct state dependencies.

#### 1. Attestation Expiry Queue (prefix `0x20`)

```
for each entry where expires_at <= block_time (up to max_endblocker_attestation_expiries):
    1. Load AttestationRecord by (provider, auditor) from prefix 0x02
    2. If status == Valid:
       a. Set status = Expired
       b. Set fee_status = ReleasedToAuditor
       c. Set deposit_status = ReturnedToAuditor
       d. Transfer escrowed fee from module account to auditor
       e. Transfer auditor deposit from module account to auditor
       f. Emit EventAttestationExpired
       g. Emit EventFeeReleasedToAuditor
    3. Remove the secondary index entry (prefix 0x10)
    4. Delete queue entry
```

#### 2. Auditor Renewal Queue (prefix `0x21`)

```
for each entry where deadline <= block_time:
    1. Load AuditorRecord from prefix 0x01
    2. If status == Active:
       a. Set status = Lapsed
       b. Set bond_status = Unbonding
       c. Set bond_unbonding_completion_time = block_time + auditor_unbonding_period
       d. Add entry to auditor bond unbonding queue (prefix 0x24)
          with completion_time = block_time + auditor_unbonding_period
       e. Emit EventAuditorLapsed
    3. Delete queue entry
```

#### 3. Snapshot Compliance Queue (prefix `0x22`)

```
for each entry where deadline <= block_time (up to max_endblocker_snapshot_suspensions):
    1. Load ProviderSnapshotRecord from prefix 0x05
    2. If not already suspended:
       a. Set suspended = true
       b. Emit EventSnapshotSuspended
    3. Delete queue entry
    // No new queue entry is created. Provider must post a new MsgPostSnapshotHash
    // to re-enter the compliance cycle.
```

#### 4. Provider Bond Unbonding Queue (prefix `0x23`)

```
for each entry where completion_time <= block_time (up to max_endblocker_unbonding_completions):
    1. Load ProviderBondRecord from prefix 0x04
    2. Find matching UnbondingEntry by completion_time, remove it from the entries list
    3. Transfer the unbonded amount from module escrow to provider
    4. Store updated ProviderBondRecord
    5. Delete queue entry
```

#### 5. Auditor Bond Unbonding Queue (prefix `0x24`)

```
for each entry where completion_time <= block_time (up to max_endblocker_unbonding_completions):
    1. Load AuditorRecord from prefix 0x01
    2. Transfer bond from module escrow to auditor
    3. Set bond_amount = 0, bond_status = Unbonding (completed), bond_unbonding_completion_time = null
    4. Store updated AuditorRecord
    5. Delete queue entry
```

#### 6. Discrepancy Auto-Resolution Queue (prefix `0x25`)

```
for each entry where timeout <= block_time (up to max_endblocker_discrepancy_timeouts):
    1. Load DiscrepancyEvent from prefix 0x03
    2. If resolution_status == Pending:
       a. Set resolution_status = TimedOut
       b. Return escrowed fees to the provider
       c. Slash both auditor deposits to the community pool
       d. Unfreeze auditor bonds for this discrepancy if the auditor has no other pending discrepancies
       e. Emit EventDiscrepancyTimedOut
    3. Delete queue entry
```

#### 7. Audit Escrow Expiry Queue (prefix `0x26`)

```
for each entry where expires_at <= block_time (up to max_endblocker_audit_escrow_expiries):
    1. Load AuditEscrowRecord from prefix 0x08
    2. If status == Open:
       a. Set status = Expired
       b. Set fee_status = ReturnedToProvider
       c. Set provider_deposit_status = ReturnedToProvider
       d. Transfer escrowed fee and provider deposit to provider
       e. Emit EventAuditEscrowSettled with reason `ExpiredUnconsumed`
    3. Delete queue entry
```

#### 8. Discrepancy Grace Expiry Queue (prefix `0x27`)

```
for each entry where expires_at <= block_time (up to max_endblocker_grace_expiries):
    1. Load ProviderVerificationGraceRecord from prefix 0x0A
    2. If status == Active:
       a. Set status = Expired
       b. Emit EventVerificationGraceExpired
    3. Delete queue entry
```

### Protobuf Definitions

Complete protobuf definitions for the `akash.verification.v1` package (8 proto files: types, state, params,
msg, service, query, events, genesis) are provided in the
[Implementation Guide](./IMPLEMENTATION.md#4-protobuf-definitions).

### Market Module Integration

Tenants specify minimum verification requirements in their deployment SDL. The `x/market` module enforces these
requirements during bid creation by querying the `x/verification` module.

During the AEP-9 migration, `x/market` must be wired with both legacy audit support and new verification support. The
bid path should use a small adapter owned by `x/market` that fans out to the legacy `AuditKeeper` and the new
`VerificationKeeper` based on order contents and `verification_module_active`. The current market bid path already
depends on `AuditKeeper` for legacy audited attributes, so AEP-86 extends that path rather than replacing it during the
migration.

#### VerificationKeeper Interface

The `x/market` module consumes `VerificationKeeper` through an interface:

```
VerificationKeeper:
  IsVerificationActive(ctx) -> bool
  GetProviderValidAttestations(ctx, provider) -> ([]AttestationRecord, bool)
  IsProviderSnapshotCompliant(ctx, provider) -> bool
  GetProviderBestTier(ctx, provider) -> VerificationTier
  GetProviderGraceTier(ctx, provider) -> (VerificationTier, bool)
  ProviderHasCapability(ctx, provider, CapabilityFlag) -> bool
  CountQualifiedAuditors(ctx, provider, min_tier) -> uint32
```

- `IsVerificationActive` returns the `verification_module_active` governance parameter. `x/market` uses this to decide
  whether `VerificationRequirement` is enforced during the migration.
- `GetProviderValidAttestations` returns all attestations with status `Valid` that have not expired. This method
  does NOT filter by snapshot compliance -- the caller must check `IsProviderSnapshotCompliant` separately. This
  separation ensures the verification module reports facts while the market module applies bid-time policy.
- `IsProviderSnapshotCompliant` returns `false` if the provider's `ProviderSnapshotRecord.suspended` is `true`.
- `GetProviderBestTier` returns the best (highest numeric enum value = highest trust) tier from valid attestations.
  Returns `TierUnspecified` if no valid attestations exist (effectively Level 0).
- `GetProviderGraceTier` returns the active discrepancy grace tier, if one exists. `x/market` uses this tier for tier
  filtering only when verification filtering is active. It must still enforce snapshot compliance, bond requirements,
  capability requirements, and named auditor requirements.
- `ProviderHasCapability` returns `true` if any valid attestation for this provider includes the given
  [capability flag](./README.md#capability-flags).
- `CountQualifiedAuditors` counts independent auditors with valid attestations at `min_tier` or better. Named auditor
  requirements are checked separately with `auditor_mode`.

#### Dual-Keeper Adapter

`x/market` uses the following migration behavior:

- If an order has only legacy `AttributesFilters`, evaluate it through `AuditKeeper`.
- If an order has only `VerificationRequirement`, evaluate it through `VerificationKeeper` when
  `verification_module_active == true`. When the flag is `false`, accept the field but do not enforce it.
- If an order has both legacy attributes and verification requirements, both filters must pass when
  `verification_module_active == true`.
- Orders created before activation keep legacy audit matching for their legacy attributes.

The keeper dependency cycle is resolved with narrow interfaces and late binding. `x/verification` receives a read-only
`MarketStatsKeeper` interface for lease completion stats. `x/market` receives a read-only `VerificationKeeper`
interface for bid filtering. Neither keeper imports the other's concrete keeper type, and the app wiring sets the
interfaces after both keepers are constructed.

#### Bid Filtering

The `CreateBid` handler in `x/market` is updated to check verification requirements:

```
1. If the order has a VerificationRequirement with min_tier set:
   a. Check snapshot compliance: if `min_tier` is L2 or better and the provider is snapshot-suspended,
      reject with `ErrProviderSnapshotSuspended`. This check uses the requested tier, not the provider's current best tier
      or grace tier.
   b. Check tier: use the provider's best valid tier. If an active grace record exists, use its `preserved_tier` directly
      for tier filtering. If the resulting tier is lower trust than `min_tier`,
      reject with ErrInsufficientVerificationTier
   c. Check capabilities: for each required capability, if provider does not have it,
      reject with ErrMissingCapability
   d. Check auditor count: if min_auditor_count > 0, require at least that many
      independent valid auditors at min_tier or better
   e. Check specific auditors: if required_auditors is non-empty, apply auditor_mode:
      any requires at least one listed auditor, all requires every listed auditor
```

If `min_tier` is omitted or `TierUnspecified`, `x/market` does not apply verification filtering. Capability, auditor
count, and required-auditor fields are only enforced inside a verification requirement that sets `min_tier`.

#### SDL Syntax

Tenants specify verification requirements in the `placement` section of their SDL:

```yaml
profiles:
  placement:
    dc1:
      attributes:
        region: us-west
      verification:
        min_tier: 2
        min_auditor_count: 2
        auditor_mode: all
        capabilities:
          - tee_hardware_attestation
          - confidential_computing
        auditors:
          - akash1auditor1...
          - akash1auditor2...
      pricing:
        web:
          denom: uakt
          amount: 1000
```

`auditor_mode: any` treats `auditors` as an allow-list where one listed auditor is enough. `auditor_mode: all` requires
a valid attestation from every listed auditor. If omitted, `auditor_mode` defaults to `any`. `min_auditor_count` is
independent of the named list and counts total qualified auditors at the requested tier or better. If both are present,
both checks must pass.

**On-chain representation**: The `PlacementRequirements` message (in the deployment module) gains a new
`VerificationRequirement` field containing `min_tier`, `required_capabilities`, `required_auditors`,
`auditor_mode`, and `min_auditor_count`.
If omitted or `min_tier` is unspecified, no verification filtering is applied (backward compatible with
existing deployments). See [Implementation Guide](./IMPLEMENTATION.md#35-verificationrequirement-xdeployment-proto-addition)
for the full protobuf definition.

Console applies default filtering policies (e.g., show only providers with at least one Level 2 attestation by default).

### Incentive Integration

The on-chain incentive module (AEP-53) consumes attestation data to determine provider eligibility and incentive
multipliers. The specific eligibility rules are defined by AEP-53 and consume the raw attestation records stored by
this module via the [VerificationKeeper interface](./README.md#verificationkeeper-interface).

### Migration from AEP-9

The existing `x/audit` module (AEP-9) is deprecated and replaced by the new `x/verification` module through a
phased migration.

#### Phase 1: Parallel Introduction (chain upgrade N)

- Deploy `x/verification` module alongside `x/audit`
- `x/audit` continues to operate normally for existing deployments
- New deployments can use `verification` requirements in SDL (opt-in via the new `VerificationRequirement` field)
- Market module accepts both `AttributesFilters` (legacy) and `VerificationRequirement` (new)
- Market module wires both keepers through a market-owned adapter. Legacy audit checks remain live, while verification
  checks are accepted but gated by `verification_module_active`.
- A governance parameter `verification_module_active` (default: `false`) gates whether `x/verification` is
  checked during bid creation. When `false`, verification requirements in SDL are accepted but not enforced,
  allowing testing.
- No existing data is migrated -- providers must undergo the new verification process from scratch

#### Phase 2: Verification Primary (chain upgrade N+1, approximately 3-6 months after Phase 1)

- `verification_module_active` set to `true` via governance
- Console defaults to showing verification tiers
- New deployments default to verification requirements
- `x/audit` is in maintenance mode (no new features)
- Existing deployments and open orders created with `x/audit` attribute requirements continue to use `x/audit`
  matching for bid filtering. The market module checks both `AttributesFilters` (legacy, for orders created before
  activation) and `VerificationRequirement` (new). An order may contain either or both.
- Integration tests must cover legacy-only, verification-only, and mixed orders before and after activation. For mixed
  orders, the matched-bid set must be the intersection of the legacy audit result and the verification result.

#### Phase 3: Audit Deprecation (chain upgrade N+2, approximately 6-12 months after Phase 1)

- `x/audit` service endpoints return deprecation warnings
- `MsgSignProviderAttributes` and `MsgDeleteProviderAttributes` are disabled (return error)
- Existing audit-based deployments continue to match but new ones cannot be created with audit-only requirements
- All Console and SDK flows use `x/verification` exclusively

#### Phase 4: Audit Removal (chain upgrade N+3)

- `x/audit` module is removed from the app
- Audit store is pruned
- Market module removes legacy `AuditKeeper` interface
- `AttributesFilters` field in `PlacementRequirements` is deprecated

#### State Migration

No automatic state migration from `x/audit` to `x/verification`. The systems are fundamentally different (key-value
attributes vs. tiered attestations). Providers must go through the new verification process.
