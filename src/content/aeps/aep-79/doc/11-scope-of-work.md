# 11. Scope of Work (Vendor Statement of Work)

| | |
|---|---|
| **Document** | 11. Scope of work |
| **Doc ID** | AKASH-MIG-11 |
| **Version** | 0.9 (draft for review) |
| **Date** | 2026-08-10 |
| **Owner** | Overclock Labs |
| **Audience** | Vendor commercial and engineering leadership; Overclock program management |
| **Status** | Normative (MUST/SHALL) and commercial; attached to the executed contract as its statement of work; informative where not marked |

## Purpose

- Define the commercial engagement under which an external developer agency ("the Vendor") executes the migration
  specified by document set AKASH-MIG (docs 00–14).
- Fix workstreams, deliverables, milestones, payment gates, effort envelope, team shape, and the split of
  responsibilities between the Vendor, Overclock Labs, community governance, and third parties.
- Provide the qualification and proposal-format requirements for the RFP process this SOW feeds.

## In scope

- Two-stage commercial structure (Stage A target-neutral; Stage B single-target build and launch).
- Workstreams WS0–WS8 with numbered deliverables (D-WSn.m) and acceptance criteria.
- Milestones M0–M8 mapped to gates G0–G5 (gates defined in [10](./10-rollout-and-cutover.md)).
- Effort estimates, team composition, RACI, change control, IP/licensing, warranty, exclusions.

## Out of scope

- Technical requirements: they live in docs [03](./03-solana-architecture.md)–[10](./10-rollout-and-cutover.md) and
  are incorporated by reference via their `REQ-*` IDs.
- Legal terms beyond the scaffold in §6 (liability, insurance, jurisdiction; counsel finalizes).
- Tokenomics decisions (the Vendor models; the client and governance decide; see D-12, Q-01).
- Risk treatment detail: see [12. Risk register](./12-risk-register.md).

## 1. Engagement overview

### 1.1 Parties and governing artifacts

The client is **Akash Network, contracting via Overclock Labs, Inc.** ("Overclock", "the client"), acting as steward
for the Akash community; community governance retains the decision rights listed in §5. The supplier is **the
Vendor**, selected through the RFP process in §7. The governing technical artifacts are the documents of this set
(AKASH-MIG 00–14) at the contracted version. The protocol being migrated is the Akash v2 line as at commit `096bff57`
(A-12); Akash/Cosmos concepts are defined in [01. Current architecture](./01-current-architecture.md).

**REQ-SOW-001** The contract SHALL incorporate documents AKASH-MIG-00 through AKASH-MIG-14 by reference at a pinned
version, and every Vendor obligation SHALL be traceable to a numbered `REQ-*` requirement or a numbered deliverable
(D-WSn.m) in this document.

**REQ-SOW-002** In case of conflict, precedence SHALL be: (1) the executed contract, (2) this SOW including its
REQ-SOW requirements, (3) numbered `REQ-*` requirements in the other documents of this set, (4) informative prose and
diagrams. Conflicts SHALL be resolved through change control (§6.2).

### 1.2 Two-stage commercial structure

The engagement is contracted in two stages so the client's Gate 0 target selection (D-01, ratified per
[10](./10-rollout-and-cutover.md)) neither stalls mobilization nor forces the Vendor to price target-specific risk
before the target is chosen.

| Stage | Window | Pricing | Content |
|---|---|---|---|
| **Stage A: target-neutral foundation** | T0 → M1 | Firm fixed price | Kickoff verification sprint (volatile facts, [13 §4](./13-open-questions-and-assumptions.md)); tokenomics modeling start (WS1); migration-engine detailed design (WS3); REQ-baseline confirmation of docs [03](./03-solana-architecture.md)/[04](./04-ethereum-architecture.md); prototype spikes incl. the Q-15 Go–Solana prototype; Q-05/Q-11/Q-12/Q-19 investigations; G0 decision package |
| **Stage B: single-target build and launch** | G0 → M8 | Fixed per milestone, priced per path (two-column bid) | Full build, audit, testnet, launch, cutover (S1), wind-down (S2), sunset, hypercare on the **selected** target only |

**REQ-SOW-003** Stage A SHALL be target-neutral: its deliverables MUST be equally valid for the Solana and Ethereum
paths, and the Vendor SHALL NOT begin target-exclusive production implementation before G0.

**REQ-SOW-004** The Vendor's proposal SHALL price Stage A as a firm fixed price and Stage B as two separate
fixed-price milestone schedules (one per path); only the selected path's Stage B price becomes payable.

**REQ-SOW-005** After G0, the Vendor SHALL implement exactly one target path. The non-selected path's architecture
document ([03](./03-solana-architecture.md) or [04](./04-ethereum-architecture.md)) SHALL be retained as documentation
only: at each gate review the Vendor SHALL record learnings that would materially invalidate it, but SHALL NOT build
against it.

**REQ-SOW-006** Stage B SHALL NOT start before (a) client acceptance of M1 and (b) the G0 decision; the Stage B
schedule (calendar maintained client-side; milestone sequence per §3.1) re-baselines from the actual G0 date (A-14).

### 1.3 Program shape

Nine workstreams (§2) run across nine milestones (§3) aligned to gates G0–G5 defined in
[10. Rollout & cutover](./10-rollout-and-cutover.md). The effort envelope is 142–200 person-months across the milestone
sequence (§3.1), plus wind-down and hypercare tails (§4), a planning estimate refined at M1 (REQ-SOW-045). Precedents ran
longer end-to-end (Helium ≈ 2 years from vote to L1 sunset; Render ≈ 2 years to completed ticker swap; see
[02](./02-target-selection.md)); this program compresses the build because the specification is complete before T0,
while the exchange/claims tail remains calendar-bound, not effort-bound.

## 2. Workstreams

Each workstream states objective, scope, out-of-scope, numbered deliverables with acceptance criteria, dependencies,
and Overclock-side prerequisites. Deliverable IDs `D-WSn.m` are stable and contractual.

**REQ-SOW-007** Each deliverable SHALL be accepted only against its stated acceptance criteria and the `REQ-*`
families it references; partial acceptance SHALL be recorded with a written punch list and a remediation date.

### WS0. Program management & architecture stewardship

**Objective.** Keep the program on schedule, every obligation REQ-traceable, and the architecture coherent as
decisions land.

**Scope.**
- Program plan, weekly reporting, monthly steering support, gate review packages (§9).
- REQ-traceability matrix upkeep across all `REQ-*` families → deliverables → tests → evidence.
- Risk register ([12](./12-risk-register.md)) co-ownership; decision-log hygiene (D/A/Q items appended to
  [13](./13-open-questions-and-assumptions.md) via PR); change-impact analysis for every CR touching docs 03–10.

**Out of scope.** Community governance operations and legal coordination (Overclock).

| ID | Deliverable | Acceptance criteria | Due |
|---|---|---|---|
| D-WS0.1 | Program management plan (schedule, staffing, tooling, comms per §9) | Client review; covers all WS and M0–M8 | M0 |
| D-WS0.2 | Weekly status reports | Format per REQ-SOW-050; delivered every week, no gaps | recurring |
| D-WS0.3 | REQ-traceability matrix (living) | Every in-scope `REQ-*` mapped to deliverable + test + status; refreshed at each milestone | each M |
| D-WS0.4 | Gate review packages G0–G5 | Contents per [10](./10-rollout-and-cutover.md) gate entry criteria | each G |
| D-WS0.5 | Monthly risk reviews | R-xx deltas with mitigation status; steering minutes | recurring |

**REQ-SOW-008** The Vendor SHALL maintain the REQ-traceability matrix such that at every milestone review 100% of
in-scope requirements have a status of satisfied, in-progress with plan, or CR-pending.

**REQ-SOW-009** The Vendor SHALL deliver each gate review package no less than 5 business days before the scheduled
gate review.

**Dependencies.** None (starts at T0). **Overclock prerequisites.** Named program lead and steering members at T0;
decision SLAs per §9.

### WS1. Tokenomics & economic modeling

**Objective.** Produce the quantitative basis for the emissions replacement (D-12), BME parameters (D-20), and
validator wind-down incentives, for the client and governance to decide on.

**Scope.**
- Supply accounting workbook from a live `akashnet-2` state export: mint/inflation parameters and vesting-account
  inventory (Q-19: on-chain state, not in source), module-account balances, IBC-out supply.
- Emissions curve modeling (Q-01): gross rate, decay, provider-incentive/community-treasury split, hard cap; ≥3
  scenarios with sensitivity analysis; provider-incentive budget sizing and payout options.
- BME parameter study: CR thresholds (9500/9000 bps defaults per D-20), mint-spread sensitivity, time-based epoch
  length, vault seeding from the S1 Wind-down Reserve ([05](./05-token-migration.md)).
- Validator wind-down incentive sizing (Q-13) for `akashnet-2` validators operating the chain C→H.

**Out of scope.** Making the decisions: parameters are ratified by the client and, where
[10](./10-rollout-and-cutover.md) requires, by on-chain governance. Token price forecasting.

| ID | Deliverable | Acceptance criteria | Due |
|---|---|---|---|
| D-WS1.1 | Supply accounting workbook (Q-19 data pull) | Reconciles to on-chain total supply at export height; feeds [05](./05-token-migration.md) REQ-TOK accounting | M1 |
| D-WS1.2 | Emissions model + scenario report (Q-01) | Reproducible model (open source, pinned inputs); ≥3 scenarios; sensitivity documented | M1 (v1), M2 (final) |
| D-WS1.3 | BME parameter study | Covers CR thresholds, spread, epoch timing under time-based execution; parity notes vs current params | M2 |
| D-WS1.4 | Validator wind-down incentive sizing (Q-13) | Options with cost per option; feeds Overclock/governance decision | M2 |
| D-WS1.5 | Final tokenomics report, ratified | Client sign-off + governance ratification recorded; parameters frozen into config for build | G1 gate evidence |

**REQ-SOW-010** All WS1 models SHALL be delivered as reproducible artifacts (source + pinned inputs + run
instructions), not as spreadsheets alone.

**REQ-SOW-011** The Vendor SHALL present tokenomics outputs as decision options with quantified trade-offs; the Vendor
SHALL NOT self-select final parameter values (decision rights per §5).

**Dependencies.** Archive-node access (Q-19). **Overclock prerequisites.** Finance counterpart; governance-forum
ratification process; archive node or trusted state export by M0.

### WS2. On-chain protocol (programs / contracts)

**Objective.** Implement the selected target architecture (marketplace, tokens, governance wiring, emissions) to the
REQ sets of [03](./03-solana-architecture.md) or [04](./04-ethereum-architecture.md).

**Scope.**
- Tokens: AKT (D-03 Token-2022 / D-04 ERC-20) and ACT as restricted protocol asset (D-19).
- Marketplace: deployment, market (order→bid→lease, reclamation D-24), escrow with streaming settlement (D-21),
  provider registry, audit registry; BME engine port (D-20) with crank/keeper execution.
- Config/governance wiring (D-11): parameter accounts/contracts, timelock, upgrade authority per
  [08](./08-security-and-audits.md); Realms gap analysis (Q-11) in Stage A.
- Emissions program/contract implementing the ratified WS1 schedule (D-12: timelocked, DAO-adjustable, hard-capped);
  Pyth pull-oracle integration (D-13); settlement-stablecoin path (D-14).

**Out of scope.** The non-selected path (REQ-SOW-005); migration/claims logic (WS3); off-chain services (WS4); any
general smart-contract platform successor (D-22).

| ID | Deliverable | Acceptance criteria | Due |
|---|---|---|---|
| D-WS2.1 | REQ-baseline confirmation report for docs 03 and 04 | Every REQ-SOL and REQ-EVM confirmed feasible or flagged with a CR; Stage A spike results attached (escrow/BME core-loop CU-or-gas benchmark, Q-05 Token-2022 support matrix, Q-12 dseq check) | M1 |
| D-WS2.2 | Token deployments (AKT, ACT) on devnet/testnet | Conform to D-03/D-04/D-19; token REQs demonstrated; metadata correct | M2 |
| D-WS2.3 | Core marketplace programs/contracts, feature-complete | Full order→bid→lease→settle→close lifecycle on persistent devnet; parity harness (D-WS6.1) green on marketplace golden vectors | M3 |
| D-WS2.4 | BME + escrow settlement engine | REQ family satisfied incl. CR breaker, AKT-fallback, FIFO refunds, delegated-deposit allowance (D-21); invariant suite green | M3 |
| D-WS2.5 | Governance/config wiring + emissions | Parameter changes only via governance path; emissions mint matches ratified schedule across ≥2 simulated epochs on testnet | M4 |
| D-WS2.6 | Mainnet deployment + verified builds | Reproducible build hashes published; upgrade authority per key ceremony (D-WS5.5) | M5 |

**REQ-SOW-012** WS2 SHALL implement 100% of the selected path's `REQ-SOL-*` or `REQ-EVM-*` requirements except those
explicitly deferred by an approved CR.

**REQ-SOW-013** Every WS2 code module SHALL carry test references to the REQ IDs it satisfies, and CI SHALL fail on
untraceable normative behavior changes.

**Dependencies.** G0 (target); WS1 parameter freeze at G1; WS5 reviews inline. **Overclock prerequisites.** Timely
decisions on Q-08 (provider collateral) and Q-11 by G1.

### WS3. Migration engine

**Objective.** Build and operate the machinery that moves value (snapshots, Merkle claims, Wind-down Reserve,
residual distributions, IBC redemption, old-chain sunset) per [05](./05-token-migration.md) and
[06](./06-state-and-data-migration.md).

**Scope.**
- Snapshot exporter: **two independent implementations** (S1- and S2-capable) covering balances, vesting schedules,
  bonded/unbonding stake incl. accrued rewards (D-06), and module accounts.
- Merkle tooling: tree construction, root verification, proof service, independent-verifier kit; claims
  program/contract (`akash-claims` / `MigrationClaims`) incl. Wind-down Reserve and vesting re-creation (D-05/D-06).
- Residual-distribution pipeline: automated weekly old-chain→new-chain Merkle drops C→H (D-05, Q-18); IBC-redemption
  support tooling (D-07) incl. counterparty voucher snapshots per Q-03.
- Old-chain sunset upgrade (D-18): msg-type filter + min-gas raise at C (Q-17 calibration with the core team), halt at
  H, final state export and archives per [06](./06-state-and-data-migration.md).

**Out of scope.** Any persistent two-way bridge (excluded by D-05). Exchange-side swap execution (§5). Custodial
mechanics for Console managed wallets (Q-14: Console team leads).

| ID | Deliverable | Acceptance criteria | Due |
|---|---|---|---|
| D-WS3.1 | Migration engine detailed design | Covers all REQ-TOK/REQ-STA machinery; reviewed by client + WS5 | M1 |
| D-WS3.2 | Snapshot exporter ×2 (independent) | No shared code beyond protobuf schemas; **byte-identical Merkle roots** on ≥3 mainnet state exports and every rehearsal | M3 |
| D-WS3.3 | Claims program/contract + proof service | REQ-TOK claims requirements demonstrated end-to-end on testnet from a real mainnet snapshot; audited (WS5) | M4 |
| D-WS3.4 | Residual-distribution pipeline | One-command weekly cycle: old-chain delta export → Merkle drop → publication; ≤7-day lag shown in rehearsal | M5 |
| D-WS3.5 | IBC redemption tooling (D-07) | Counterparty snapshot list per Q-03; redemption flow tested with stand-in data | M5 |
| D-WS3.6 | Sunset upgrade for `akashnet-2` | Passes upgrade tests against mainnet state export; msg allow-list per D-18/Q-17; adopted on rehearsal network | M5 |
| D-WS3.7 | Supply reconciliation dashboard | Live proof that minted(new) + reserved = snapshot supply at all times ([05](./05-token-migration.md)) | M6 |

**REQ-SOW-014** The two snapshot exporters SHALL be built by non-overlapping engineer sets with no shared code except
canonical schema definitions, and both SHALL run at every rehearsal and at S1/S2.

**REQ-SOW-015** A snapshot output SHALL be usable for S1/S2 only when both exporters produce identical Merkle roots;
any divergence is a program-halting defect until root-caused.

**REQ-SOW-016** The residual-distribution pipeline SHALL honor old-chain escrow settlements, refunds, and withdrawals
occurring C→H in new-chain AKT with a lag of ≤7 days (D-05; cadence per Q-18).

**Dependencies.** A-01 (upgrade freeze from G2); WS2 token mints; docs
[05](./05-token-migration.md)/[06](./06-state-and-data-migration.md) baselines. **Overclock prerequisites.** Core-team
review bandwidth for the sunset upgrade; validator outreach channel; archive infrastructure decision (Q-09) by G3.

### WS4. Off-chain services & clients

**Objective.** Adapt the off-chain estate (provider daemon, indexing, SDKs, CLI, claim portal) per
[07. Off-chain & clients](./07-offchain-and-clients.md), preserving the Console API surface (A-11).

**Scope.**
- `provider-services` chain adapter (`pkg/chain`) + Solana signer sidecar if required (D-17); Stage A Q-15 prototype
  decides the sidecar question.
- Indexer per D-16 (Geyser/webhooks→Postgres on Solana; Ponder-class on EVM) exposing existing Console API shapes;
  events as system of record for history (D-23).
- `chain-sdk` v2 (TypeScript and Go) replacing the `pkg.akt.dev/go` chain surface; CLI re-target; JWT auth continuity
  (D-10).
- Claim portal (web) for S1/residual/S2 claims incl. proof generation and wallet flows; provider re-registration
  wizard (keys, attributes, collateral per Q-08, JWT signing-key anchoring).
- Console integration support: interface contracts, fixtures, liaison; Console team implements Console changes
  (Q-14).

**Out of scope.** Console feature development; wallet vendors' own integrations (Vendor supplies specs); running
production infra beyond hypercare (Q-07).

| ID | Deliverable | Acceptance criteria | Due |
|---|---|---|---|
| D-WS4.1 | Q-15 prototype report (Go–Solana feasibility) | Working prototype; sidecar go/no-go recommendation with benchmarks | M1 |
| D-WS4.2 | Chain adapter + (if needed) signer sidecar | provider-services runs full lease lifecycle against testnet with unmodified Kubernetes logic; REQ-OFF satisfied | M3 |
| D-WS4.3 | Indexer + Console-shape API | Existing Console API contract tests pass modulo address/tx-hash formats (A-11); backfill from genesis demonstrated | M3 |
| D-WS4.4 | chain-sdk v2 (TS + Go) + CLI | Full protocol coverage; used by parity harness and portal; semver prereleases | M4 |
| D-WS4.5 | Claim portal + provider re-registration wizard | End-to-end on public testnet with real snapshot fixtures; rate-limit review; screening hooks per Q-10 decision | M4 |
| D-WS4.6 | Console integration support package | Interface contracts + fixtures delivered; Console team sign-off on sufficiency | M4 |
| D-WS4.7 | Production releases of all clients | Versioned, signed releases; provider upgrade path validated by ≥3 external testnet providers (A-05) | M5 |

**REQ-SOW-017** The indexer SHALL preserve existing Console API shapes such that Console requires only
address/tx-hash-format changes (A-11); breaking shape changes require a CR.

**REQ-SOW-018** All client deliverables SHALL ship with migration guides and compatibility matrices (WS8) at the same
milestone.

**Dependencies.** WS2 interface definitions (IDL/ABI) from M2; D-17/Q-15 decision at G1. **Overclock prerequisites.**
Console counterpart from G0; maintainer access to `akash-network/provider`, `pkg.akt.dev/go`, and chain-sdk repos;
provider-council testers (A-05).

### WS5. Security

**Objective.** Execute the security program of [08. Security & audits](./08-security-and-audits.md): internal
reviews, external audits, bounty, monitoring, key ceremonies, incident response.

**Scope.**
- Threat-model upkeep; internal security review of every WS2/WS3/WS4 deliverable before external audit.
- Audit management: scoping, data rooms, firm liaison, finding triage, fix cycles, re-audit (firms contracted by
  Overclock per §6.6, Vendor-managed technically).
- Bug bounty setup (platform, scope, severity/payout ladder) live before mainnet deploy.
- Monitoring/alerting build: supply-conservation monitors, escrow/BME invariant watchers, crank/keeper liveness,
  claims anomaly detection.
- Key ceremonies (upgrade authority, multisig, timelock) per [08](./08-security-and-audits.md); incident-response
  playbooks, drills, on-call design for launch and wind-down.

**Out of scope.** Performing the external audits (independent firms); custody of client keys (Overclock/multisig
signers).

| ID | Deliverable | Acceptance criteria | Due |
|---|---|---|---|
| D-WS5.1 | Threat model + internal review reports | Every audited component has a pre-audit internal review with closed criticals | M3 (rolling) |
| D-WS5.2 | Audit round managed to closure | ≥2 independent firms; all critical/high findings fixed + re-verified; reports published | M5 (G3 evidence) |
| D-WS5.3 | Bug bounty live | Public program with funded pool (client-side, §6.6) before mainnet deploy | M5 |
| D-WS5.4 | Monitoring & alerting stack | REQ-SEC monitors live against mainnet deployment before S1; runbook-linked alerts | M5 |
| D-WS5.5 | Key ceremony execution + records | Documented, witnessed ceremonies; custody per [08](./08-security-and-audits.md); recovery drills passed | M5 |
| D-WS5.6 | Incident-response playbooks + drill results | ≥2 game-day drills covering cutover-window scenarios from [12](./12-risk-register.md) | M5 |

**REQ-SOW-019** External audit scope SHALL cover, at minimum: all WS2 programs/contracts, the WS3 claims path and
exporters, and the sunset upgrade; ≥2 independent firms for the on-chain protocol and ≥1 for the migration engine.

**REQ-SOW-020** No mainnet deployment SHALL occur with an open critical or high audit finding; G3 SHALL NOT pass
without published audit reports and verified fixes.

**REQ-SOW-021** The bug bounty program SHALL be live and funded before any mainnet deployment and SHALL remain in
force through hypercare exit (M8).

**Dependencies.** WS2/WS3 deliverable freezes (audit entry); Overclock audit contracting by M2. **Overclock
prerequisites.** Audit budget and firm contracts (Q-20); multisig signer availability; legal review of bounty terms.

### WS6. Quality & testnets

**Objective.** Prove behavioral parity with the current chain and operational readiness for cutover, per
[09. Testing & verification](./09-testing-and-verification.md).

**Scope.**
- Parity harness + golden vectors: current-chain behavior fixtures (escrow settlement math, BME epoch execution, FIFO
  refunds, reclamation windows) replayed against the target implementation.
- Fuzz/invariant suites (supply conservation, escrow non-negativity, CR-breaker monotonicity).
- Public incentivized testnet: deployment, operations, telemetry, participant support.
- Migration rehearsals ×3 against mainnet-scale state exports, each exercising S1 → claims → residual cycle → S2
  end-to-end; load/performance testing against [09](./09-testing-and-verification.md) targets.

**Out of scope.** Testnet participant rewards funding (client-side, Q-21); Console QA (Console team).

| ID | Deliverable | Acceptance criteria | Due |
|---|---|---|---|
| D-WS6.1 | Parity harness + golden vectors | Vectors generated from current-chain code/state; CI-integrated; covers all REQ-TST parity items | M2 (v1), M3 (full) |
| D-WS6.2 | Fuzz + invariant suites | Run continuously in CI; zero outstanding invariant violations at each gate | M3 |
| D-WS6.3 | Public testnet, live and operated | Uptime and participation targets per REQ-TST; ≥3 external providers run real workloads (A-05) | M4 (G2 evidence) |
| D-WS6.4 | Migration rehearsals 1–3 + reports | Rehearsal 3 at mainnet scale within REQ-TST time/error budgets; both exporters byte-identical (REQ-SOW-015) | M4–M5 |
| D-WS6.5 | Load/perf test report | Meets [09](./09-testing-and-verification.md) targets on mainnet-candidate infrastructure | M5 (G3 evidence) |

**REQ-SOW-022** The Vendor SHALL execute no fewer than three full migration rehearsals; the final rehearsal SHALL use
a full mainnet state export and satisfy the acceptance thresholds of [09](./09-testing-and-verification.md) before G3.

**REQ-SOW-023** Golden vectors SHALL be derived mechanically from current-chain code or recorded mainnet behavior,
never hand-written from documentation.

**Dependencies.** WS2/WS3/WS4 drops; testnet infra budget (§6.6). **Overclock prerequisites.** Incentivized-testnet
reward budget (Q-21) by G1; provider-council recruitment (A-05).

### WS7. Launch & wind-down operations

**Objective.** Execute the runbooks of [10. Rollout & cutover](./10-rollout-and-cutover.md): mainnet launch, S1
cutover, weekly residual cycles, S2, old-chain sunset, hypercare.

**Scope.**
- Target-chain launch operations: deployments, provider-onboarding window (launch precedes C, D-08).
- S1 cutover execution at C per the T-minus runbook: snapshot, root attestation support, claims opening, exchange-swap
  support window.
- Weekly residual-distribution cycles C→H (≈13 cycles, D-05) with published per-cycle reports.
- S2 at H: final snapshot, residual distribution, halt coordination, archive publication (D-18).
- Hypercare: 90 days post-S2 (H → M8); on-call, defect remediation, operational tuning, handover shadowing.

**Out of scope.** Exchange-side execution; validator operation of the old chain (validators/community); post-hypercare
operations (Q-07: separately contractable).

| ID | Deliverable | Acceptance criteria | Due |
|---|---|---|---|
| D-WS7.1 | Mainnet launch executed | Programs/contracts live; provider registrations meet [10](./10-rollout-and-cutover.md) launch criteria | M5→M6 |
| D-WS7.2 | S1 cutover executed | Runbook completed within its window; roots attested; claims open; reconciliation clean (D-WS3.7) | M6 (G4) |
| D-WS7.3 | Residual cycles operated | Every cycle ≤7-day lag (REQ-SOW-016); per-cycle report published | C→H |
| D-WS7.4 | S2 + sunset executed | Halt at H; archives published per [06](./06-state-and-data-migration.md); final conservation report | M7 (feeds G5) |
| D-WS7.5 | Hypercare period + exit report | SLAs per REQ-SOW-024 met; open-defect count within warranty terms; handover complete (WS8) | M8 |

**REQ-SOW-024** From launch through hypercare exit, the Vendor SHALL staff on-call with: P1 (funds-at-risk or
protocol-halt) response ≤2 h and mitigation plan ≤24 h; P2 response ≤1 business day; post-incident reports within 5
business days.

**REQ-SOW-025** The Vendor SHALL execute cutover only on the go/no-go "go" authorization recorded per
[10](./10-rollout-and-cutover.md) §4.2 (G4 subsequently verifies the executed S1), and SHALL abort per the
runbook's rollback criteria without requiring a change order.

**Dependencies.** G3 (launch) and G4 (cutover) authorizations; WS3/WS5 tooling live. **Overclock prerequisites.**
Governance halt-height proposal passed (A-02); exchange coordination complete (Q-04); comms execution; foundation ops
for the IBC redemption window (D-07).

### WS8. Documentation, devrel & handover

**Objective.** Make the migrated protocol operable and adoptable without the Vendor.

**Scope.**
- Protocol documentation for the target chain (concepts, accounts/contracts, instruction/function reference;
  complements [14](./14-appendix-protocol-mapping.md)).
- Provider migration guide, tenant migration guide, wallet/holder claim guides, exchange technical pack.
- Operational runbooks (indexer, cranks/keepers, monitors); handover training to the operator chosen under Q-07;
  recorded training for Overclock engineering and the provider community.

**Out of scope.** Marketing content; community management; translations beyond English.

| ID | Deliverable | Acceptance criteria | Due |
|---|---|---|---|
| D-WS8.1 | Protocol + API documentation | Complete for every shipped program/contract and client; reviewed by Overclock eng | M5 |
| D-WS8.2 | Provider & tenant migration guides | Validated by ≥3 external testnet providers completing migration unaided | M5 |
| D-WS8.3 | Exchange technical pack | Delivered to Overclock BD ≥16 weeks before planned C; swap runbook + test vectors + contacts | M4 |
| D-WS8.4 | Claim-portal user guides + holder FAQ | Published with portal; covers S1/residual/S2 and IBC-redemption cases | M6 |
| D-WS8.5 | Runbooks + training + handover | Named operator (Q-07) runs one full residual cycle and one incident drill unaided | M8 |

**REQ-SOW-026** The exchange technical pack SHALL be delivered no less than 16 weeks before the planned cutover date C
(exchange lead times per [05](./05-token-migration.md); precedent: 3–6 month notice).

**REQ-SOW-027** Handover SHALL be evidenced by the receiving operator executing the core operational procedures
without Vendor assistance, recorded as part of M8 acceptance.

**Dependencies.** All WS outputs. **Overclock prerequisites.** Docs-site access; Q-07 operator named by G3; BD channel
to exchanges.

## 3. Milestones, gates, and payment schedule

### 3.1 Milestone sequence and gate mapping

Gates G0–G5 are defined in [10. Rollout & cutover](./10-rollout-and-cutover.md); glosses below are informative. The
milestone sequence and gate mapping below are contractual; the calendar targets (offsets from Vendor kickoff T0) are
maintained in the client-side program & comms plan and are re-baselined at M1 (REQ-SOW-045) and at the actual G0 date.

| M | Gate | Milestone content (headline) |
|---|---|---|
| M0 | none | Mobilization complete: verification sprint done (volatile facts re-verified, [13 §4](./13-open-questions-and-assumptions.md)); environments and CI up; program plan accepted (D-WS0.1) |
| M1 | feeds **G0** (target selection) | Stage A complete: G0 decision package; REQ-baseline confirmation (D-WS2.1); migration-engine design (D-WS3.1); tokenomics model v1 (D-WS1.2); Q-15 verdict (D-WS4.1) |
| M2 | **G1** (architecture freeze) | Detailed design frozen on selected target; tokenomics ratified (D-WS1.5); tokens on devnet (D-WS2.2); parity harness v1 (D-WS6.1) |
| M3 | none | Feature-complete on persistent devnet: marketplace + BME/escrow (D-WS2.3/2.4), exporters ×2 (D-WS3.2), adapter + indexer (D-WS4.2/4.3); internal security reviews current (D-WS5.1) |
| M4 | **G2** (code complete; audits started; public testnet live; old-chain upgrade freeze per A-01) | Public testnet live (D-WS6.3); claims end-to-end on testnet (D-WS3.3); SDKs/portal (D-WS4.4/4.5); audits underway; exchange pack delivered (D-WS8.3); rehearsal 1 done |
| M5 | **G3** (launch readiness) | Audits closed (D-WS5.2); rehearsal 3 at mainnet scale (D-WS6.4); load targets met (D-WS6.5); mainnet deployed + key ceremonies (D-WS2.6/5.5); monitoring + bounty live (D-WS5.3/5.4); launch executed, provider onboarding open (D-WS7.1) |
| M6 | **G4** (S1 executed and verified; cutover at C per the [10](./10-rollout-and-cutover.md) §4.2 go/no-go) | S1 executed (D-WS7.2); claims open; exchange swaps in progress; residual cycle 1 complete; reconciliation dashboard clean (D-WS3.7) |
| M7 | feeds **G5** (at H = C+90 d) | All residual cycles done (D-WS7.3); S2 + halt + archives (D-WS7.4); final supply-conservation report |
| M8 | **G5** (sunset complete; program close) | Hypercare exit (90 d post-S2, D-WS7.5); handover complete (D-WS8.5); warranty transition per §6.4 |

**REQ-SOW-028** A milestone SHALL be deemed achieved only when all its listed deliverables are accepted (or
punch-listed per REQ-SOW-007) and, where a gate is attached, the gate decision is recorded per
[10](./10-rollout-and-cutover.md).

**REQ-SOW-029** The client SHALL complete each milestone acceptance review within 10 business days of the Vendor's
submission; the review clock and the gate-decision clock run concurrently where applicable.

### 3.2 Payment schedule (suggested, negotiable)

Fixed price per milestone, payable on acceptance of the milestone's gate/deliverable evidence (§3.1, §3.3). The
percentage allocation across milestones is a commercial matter maintained in the client-side program & comms plan,
outside this technical set. Stage A (M0–M1) is invoiced under the Stage A order; M2–M8 under the Stage B order for
the selected path.

**REQ-SOW-030** Payments SHALL be tied exclusively to accepted milestones per §3.1; no time-based fees under the
fixed-price component (T&M applies only where §6.1 says so).

**REQ-SOW-031** [RELOCATED] Minimum share of the program fee retained payable at or after M7; maintained in the
client-side program & comms plan, outside this technical set.

### 3.3 Per-milestone demonstration and evidence requirements

**REQ-SOW-032** Each milestone submission SHALL include a live demonstration and an evidence bundle (reports, test
outputs, tracker links) covering at minimum:

- **M0**: verification-sprint report vs [13 §4](./13-open-questions-and-assumptions.md); CI/environments walkthrough.
- **M1**: G0 package walkthrough; spike demos (Q-15 prototype live; escrow/BME benchmarks on both targets); D-WS2.1
  deviations list; tokenomics model run live.
- **M2**: devnet demo (token mints + a governance parameter change through timelock); D-WS1.5 ratification records.
- **M3**: full lifecycle demo on persistent devnet (deploy → bid → lease → settle → close, BME swap epoch,
  forced-settle crank/keeper); exporter ×2 root match on a fresh mainnet export; parity run.
- **M4**: public-testnet walkthrough with external providers; claims end-to-end from real snapshot fixtures; audit
  kickoff evidence; rehearsal-1 report.
- **M5**: audit reports + fix verification; rehearsal-3 metrics vs [09](./09-testing-and-verification.md) thresholds;
  mainnet build-hash and authority-custody verification; monitoring live-fire test; signed launch runbook.
- **M6**: S1 execution log vs runbook; attested roots + independent-verifier confirmations; claims telemetry;
  reconciliation review; exchange status summary.
- **M7**: residual-cycle ledger (all cycles, lags, amounts); S2 execution log; archive URLs + integrity hashes; final
  conservation report (liquid@S1 + reserved@S1 = total; reserved fully allocated by S2, D-05).
- **M8**: hypercare metrics vs REQ-SOW-024; open-defect register; handover evidence per REQ-SOW-027; warranty-period
  plan.

## 4. Effort estimate and team

### 4.1 Effort by workstream (person-months)

Planning estimate, **not a commitment**; the Vendor bids its own numbers, and the estimate is re-baselined at M1
(REQ-SOW-045). Ranges cover both target paths.

| WS | Workstream | Low PM | High PM | Primary roles |
|---|---|---|---|---|
| WS0 | Program mgmt & architecture | 12 | 16 | Engagement lead, protocol architect |
| WS1 | Tokenomics & modeling | 6 | 9 | Economist/quant (may be subcontracted), architect |
| WS2 | On-chain protocol | 40 | 55 | Senior Rust/Anchor or Solidity |
| WS3 | Migration engine | 18 | 26 | Go (Cosmos-side), Rust/Solidity (claims) |
| WS4 | Off-chain & clients | 30 | 42 | Go/backend, TS full-stack |
| WS5 | Security | 10 | 14 | Security engineer, audit liaison |
| WS6 | Quality & testnets | 16 | 22 | QA lead, devops/SRE |
| WS7 | Launch & wind-down ops | 6 | 10 | SRE, engagement lead |
| WS8 | Docs, devrel & handover | 4 | 6 | Tech writer, devrel |
| **Total** | | **142** | **200** | planning envelope, refined at M1 (REQ-SOW-045); calendar client-side |

### 4.2 Estimating assumptions

1. Basis is the Solana path; on the Ethereum path WS2 skews ≈10% lower (mature Solidity tooling, no crank
   infrastructure) and WS4 drops the signer sidecar, with the total envelope unchanged.
2. Includes Stage A (≈ 12–16 PM inside the totals). Excludes external audit-firm effort (client-side, §6.6); includes
   Vendor audit management and remediation (WS5).
3. Assumes this document set as the frozen baseline; REQ-affecting changes adjust effort via CR (§6.2).
4. Assumes Overclock counterpart availability per §4.5 (A-03); slippage converts to schedule/effort CRs.
5. Console changes are performed by the Console team (D-WS4.6 support only); custodial-wallet migration (Q-14) is not
   Vendor effort.
6. The 90-day wind-down and 90-day hypercare tails are fractional-team operations (§4.3).

### 4.3 Team composition by phase (FTE)

| Role | Stage A (T0→M1) | Build (→M3) | Harden (→M5) | Launch/wind-down (→M7) | Hypercare (→M8) |
|---|---|---|---|---|---|
| Engagement lead / PM | 1 | 1 | 1 | 1 | 0.5 |
| Protocol architect | 1 | 1 | 1 | 0.5 | 0.25 |
| Senior Rust/Anchor **or** Solidity engineers | 2 | 4 | 3 | 1 | 0.5 |
| Go/backend engineers (migration engine, adapter) | 1 | 2 | 2 | 1 | 0.5 |
| TS full-stack (SDK, portal, indexer) | 0.5 | 2 | 2 | 1 | 0.5 |
| DevOps / SRE | 0.5 | 1 | 1 | 1 | 0.5 |
| QA lead (+1 QA eng during hardening) | 0.5 | 1 | 2 | 1 | 0.25 |
| Security engineer / audit liaison | 0.25 | 0.5 | 1 | 0.5 | 0.25 |
| Tech writer / devrel | 0.25 | 0.5 | 0.5 | 0.5 | 0.25 |
| **Total FTE** | **7.0** | **13.0** | **13.5** | **7.5** | **3.5** |

### 4.4 Named key personnel and substitution

**REQ-SOW-033** The Vendor SHALL name, in its proposal and the contract: the engagement lead, the protocol architect,
the security lead, and the two most senior target-chain engineers ("key personnel"), with CVs and shipped-protocol
references.

**REQ-SOW-034** Key personnel SHALL be allocated ≥80% to this engagement from G0 through G4 and SHALL NOT be
substituted without client consent; substitutes MUST have equal or better demonstrated qualifications, with ≥10
business days' notice and a paid overlap period at the Vendor's cost.

**REQ-SOW-035** Substitution of more than two key personnel before G4 SHALL entitle the client to a remediation plan
and, if unresolved within 30 days, termination for cause under the contract.

### 4.5 Overclock counterpart commitments (A-03)

Overclock commits, for the engagement duration: **≥2 FTE counterpart engineers** (old-chain expertise, review
bandwidth, sunset-upgrade co-development); **product/comms staffing** for holder, provider, and exchange
communications; **governance operations** (proposal drafting, forum management, vote logistics per A-02); a finance
counterpart for WS1; a Console-team counterpart from G0; timely decisions per §9. These are conditions precedent to
the Vendor's schedule obligations; shortfalls route through §6.2.

## 5. RACI

R = responsible (does the work), A = accountable (owns the outcome; one A per row), C = consulted, I = informed.
"Governance" = Akash on-chain/community governance.

| # | Activity | Vendor | Overclock | Governance | Third parties |
|---|---|---|---|---|---|
| 1 | Target selection (G0, D-01) | C | R | **A** | none |
| 2 | REQ baseline changes (change control §6.2) | R (impact) | **A** | I | none |
| 3 | Tokenomics parameters (Q-01, D-12) | R (model) | C | **A** | none |
| 4 | Protocol implementation (WS2–WS4) | **A**/R | C | I | none |
| 5 | Deliverable acceptance & milestone sign-off | C | **A**/R | I | none |
| 6 | Audit firm selection & contracting (Q-20) | C | **A**/R | I | audit firms: I |
| 7 | External audits: execution + remediation | R (manage/fix) | **A** | I | audit firms: R |
| 8 | Governance proposals (migration approval, halt height; A-02) | C (drafting) | R | **A** | none |
| 9 | Snapshot execution S1/S2 (D-05) | R | **A** | I | exchanges: I |
| 10 | Merkle root attestation & publication | R (compute/verify) | **A** (attest) | I | independent verifiers: C |
| 11 | Exchange coordination (Q-04) | C (tech pack, D-WS8.3) | **A**/R | I | exchanges: R |
| 12 | Community & holder communications | C (content) | **A**/R | I | wallets/DEX frontends: C |
| 13 | Treasury & Wind-down Reserve operations | R (tooling/execution) | **A** (custody) | C (policy) | none |
| 14 | Key ceremonies & upgrade-authority custody (D-15) | R (ceremony) | **A** (custodian) | I | independent witness: C |
| 15 | Incident command (launch → hypercare exit) | R (technical lead, on-call) | **A** (severity, external comms) | I | infra providers: C |
| 16 | Old-chain validator coordination (sunset upgrade, D-18; Q-13) | R (artifact) | **A**/R (outreach) | C | validators: R (adopt) |
| 17 | Legal/regulatory review (Q-02/Q-03/Q-10) | I | **A** | C | counsel: R |

**REQ-SOW-036** The Vendor SHALL NOT execute any activity for which another party holds A (rows 1, 3, 8, 11, 17) on
its own authority; where the Vendor holds R for such rows it acts only on the accountable party's recorded
instruction.

## 6. Commercial terms scaffold

Informative except where marked; contract counsel finalizes wording.

### 6.1 Pricing structure

Recommended: **fixed price per milestone** (§3.2) for M0–M7 scope, plus a **T&M pool with a not-to-exceed cap** for
WS7 operational tails (residual cycles beyond plan, hypercare surge, incident response beyond SLA baselines) at
rate-card rates. Alternates the client will entertain: capped T&M throughout, or fixed price with a shared risk/reward
band on the cutover date.

**REQ-SOW-037** The Vendor's rate card (all roles) SHALL be fixed for the engagement duration and SHALL apply to any
T&M component and to CR pricing.

### 6.2 Change control

**REQ-SOW-038** Any change that adds, removes, or alters a numbered `REQ-*` requirement, a deliverable's acceptance
criteria, a milestone date, or the price SHALL flow through a written change request (CR) containing: motivation,
affected REQ/D/Q/R IDs, schedule impact, cost impact, and risk impact.

**REQ-SOW-039** The Vendor SHALL deliver CR impact assessments within 10 business days of request; the client SHALL
decide CRs within 10 business days of receipt; undecided CRs escalate per §9.4.

**REQ-SOW-040** The Vendor SHALL NOT perform work against an unapproved CR; an emergency path (security-critical
fixes) MAY proceed on the engagement lead + client program lead's joint written authorization within 48 hours, with
the CR regularized within 10 business days.

### 6.3 Intellectual property and licensing

**REQ-SOW-041** All deliverables (programs/contracts, tooling, tests, documentation) SHALL be licensed Apache-2.0 or
MIT (matching the existing Akash codebase's open-source posture), with copyright assigned to or licensed irrevocably
for Akash Network's benefit as counsel directs.

**REQ-SOW-042** All development SHALL occur in public repositories under the `akash-network` GitHub organization from
day one; private repositories are permitted only for undisclosed security fixes and key-ceremony material, and MUST be
published after remediation/ceremony.

**REQ-SOW-043** The Vendor SHALL NOT introduce dependencies with licenses incompatible with Apache-2.0/MIT
distribution, nor proprietary services in the critical path, without an approved CR.

### 6.4 Warranty, hypercare, and re-baseline

**REQ-SOW-044** Beyond hypercare (D-WS7.5), the Vendor SHALL provide a 90-day warranty from M8 acceptance: defects in
accepted deliverables against their REQ acceptance criteria are remediated at the Vendor's cost, with P1/P2 response
times per REQ-SOW-024.

**REQ-SOW-045** At M1 the parties SHALL re-baseline the Stage B schedule and effort estimate against Stage A findings,
preserving the milestone/gate structure of §3.1; the re-baseline is executed as a CR.

### 6.5 Liability, insurance, termination

- **Liability cap and carve-outs:** [placeholder; legal to finalize; market practice is a cap at a multiple of fees
  with carve-outs for willful misconduct and IP indemnity].
- **Insurance:** [placeholder; professional indemnity/E&O and cyber minimums; legal to finalize].
- **Termination for convenience:** client may terminate on 30 days' notice.

**REQ-SOW-046** On any termination, the Vendor SHALL be paid for accepted milestones plus a pro-rata amount for
demonstrably complete work-in-progress, and SHALL deliver within 15 business days: all repositories current,
credentials rotated and handed over, an open-items register, and a written state-of-work report sufficient for a
successor to continue.

### 6.6 Third-party costs: excluded from Vendor fees (client-side budget lines)

Vendor fees exclude the following; they are budgeted and paid client-side. Ranges are indicative planning figures as
of 2026-08-10, not quotes [TO-VERIFY: market quotes at M1 for audit, bounty-platform, and RPC/infra lines].

| Budget line | Indicative range | Notes |
|---|---|---|
| Security audits (≥2 firms; protocol + migration engine + sunset upgrade) | US$400k–1.0M | Pass-through per REQ-SOW-047; firm selection Q-20 |
| Bug bounty pool + platform fees | US$250k–1.0M funded ceiling | Severity-tiered; pool pays out only on valid findings |
| RPC / indexer / testnet infrastructure opex | US$10k–40k / month | Program duration + hypercare; post-M8 per Q-07 |
| Incentivized-testnet rewards | per Q-21 decision | Community incentives, provider participation (A-05) |
| Exchange integration costs | per venue; expected minimal for 1:1 swaps | Q-04; precedent: swaps typically fee-free but venue-specific |
| Old-chain archive hosting (≥5 y) | per Q-09 decision | Storage vendor + funding source |
| Key-ceremony hardware (HSMs, air-gapped machines) | US$10k–30k | Retained by Overclock |
| Legal counsel (claims, unclaimed funds, screening) | client-side | Q-02, Q-03, Q-10 |

**REQ-SOW-047** Where the Vendor administers third-party spend (e.g., audit logistics), it SHALL be billed as
pass-through at cost with zero markup, under a client-approved cap per line; forecast overruns SHALL be flagged before
commitment.

## 7. Vendor qualification and proposal requirements

This SOW feeds an RFP. Responses not meeting §7.1 are non-conforming.

### 7.1 Qualification criteria

**REQ-SOW-048** The Vendor SHALL demonstrate all of the following in its proposal:

1. ≥2 production protocol launches on Solana and/or EVM mainnets with ≥US$100M TVL-equivalent secured at peak
   (per-path evidence for whichever paths the Vendor bids), with links to deployed programs/contracts.
2. Prior token-migration or genesis-event experience (chain migration, large claims/airdrop event, or token swap of
   comparable scale), with a written retrospective or reference.
3. Audit track record: ≥3 completed third-party audits of Vendor-authored code with published reports; disclosure of
   any post-audit exploits and remediation.
4. Open-source history: maintained public repositories evidencing the proposed team's work.
5. ≥2 client references for engagements ≥US$1M or ≥12 months, contactable by Overclock.
6. Capacity: named key personnel per REQ-SOW-033 available at ≥80% from the proposed T0.

### 7.2 Proposal response format

**REQ-SOW-049** Proposals SHALL contain, in order: (1) executive summary (≤2 pages); (2) per-workstream approach for
WS0–WS8 (≤3 pages each) explicitly citing the REQ families each WS satisfies; (3) team: org chart, key-personnel CVs,
phase-staffing table in the §4.3 format; (4) fixed-price table per milestone (M0–M8, per the §3.1 sequence and §3.2 terms), Stage A firm, Stage
B priced per path; (5) rate card; (6) assumptions register (numbered, each with the consequence if false); (7)
qualification evidence per REQ-SOW-048; (8) exceptions taken to this SOW, as redlines referencing REQ-SOW IDs.
Proposals that restate this document set without workstream-specific engineering substance will be scored down.

## 8. Assumptions and exclusions

### 8.1 Commercial assumptions (imported from [13](./13-open-questions-and-assumptions.md))

The full register lives in doc 13; the subset below is load-bearing for price and schedule. If one fails, the affected
obligations re-open via CR (§6.2).

| ID | Assumption (abbreviated) | Commercial consequence if false |
|---|---|---|
| A-01 | `akashnet-2` stable; state-affecting upgrade freeze from G2 | WS3 rework; schedule CR |
| A-02 | Governance approves migration and halt-height proposals | Program pause/termination per §6.5 |
| A-03 | Overclock counterparts per §4.5 | Schedule/effort CR |
| A-04 | ≥85–90% of circulating AKT reachable via exchanges + claims within 12 months | Extended claims-support tail (Q-07 scope) |
| A-05 | Providers accept one daemon upgrade + re-registration | WS4/WS8 extra enablement effort |
| A-07 | Ecosystem facts re-verified at kickoff hold | Stage A CRs before G0 (cheapest point to absorb) |
| A-09 | AKT ticker retained across venues | Exchange-pack rework (D-WS8.3) |
| A-12 | Baseline = v2 line at `096bff57`; pre-G1 protocol changes folded into docs 01/14 | Re-baseline CR at M1 |
| A-14 *(new)* | Client renders the G0 decision ≤10 business days after M1 acceptance | Stage B calendar slips day-for-day |
| A-15 *(new)* | Single prime Vendor; subcontractors (e.g., WS1 economist) only with client approval and prime liability | Contract restructuring |

### 8.2 Exclusions: not in Vendor scope or fees

1. Legal opinions, regulatory filings, jurisdictional analyses (client counsel; Q-02, Q-03, Q-10).
2. Exchange listing/negotiation and any listing or integration fees (Overclock BD; Vendor delivers D-WS8.3 and
   engineering support only).
3. Marketing and paid communications spend (Vendor supports technical content only).
4. **Tokenomics decisions**: the Vendor models (WS1); the client and governance decide (D-12, Q-01).
5. Post-hypercare operations: indexer, RPC, cranks/keepers, fee-sponsorship relayer, claims support beyond M8, unless
   separately contracted per Q-07.
6. Old-chain validator operations C→H (validators/community; Vendor ships the sunset upgrade, D-WS3.6).
7. Console product development and custodial managed-wallet migration execution (Console team; Q-14).
8. Market making, liquidity provisioning, or DeFi listings for AKT on the target chain.
9. Third-party costs per §6.6; hardware procurement beyond development needs.
10. Building the non-selected target path (documentation stewardship only, REQ-SOW-005).

## 9. Engagement reporting and governance

### 9.1 Weekly status

**REQ-SOW-050** The Vendor SHALL publish a written weekly status report (≤2 pages) in the shared repository
containing: milestone burn-up vs plan; per-WS RAG status with deltas; deliverable (D-WSn.m) state changes; new/changed
risks (R-xx) and open questions (Q-xx); decisions needed with owner and need-by date; REQ-traceability delta;
next-week plan.

### 9.2 Monthly steering

**REQ-SOW-051** A monthly steering committee (Vendor engagement lead + architect; Overclock program lead + engineering
counterpart; others as agenda requires) SHALL review schedule, burn on any T&M pools, top risks, and pending CRs;
minutes and actions are recorded in the tracker.

### 9.3 Gate reviews

**REQ-SOW-052** Gate reviews G0–G5 SHALL follow the entry/exit criteria of
[10. Rollout & cutover](./10-rollout-and-cutover.md), using the Vendor's gate package (D-WS0.4); the client records the decision
(pass / conditional pass with punch list / hold) within 10 business days.

### 9.4 Escalation path

**REQ-SOW-053** Disputes and blocked decisions SHALL escalate: WS leads (48 h) → Vendor engagement lead + Overclock
program lead (5 business days) → steering committee (next or extraordinary session within 10 business days) →
executive sponsors under the contract's dispute clause. Escalation SHALL NOT stop non-disputed work.

### 9.5 Tooling

**REQ-SOW-054** The engagement SHALL run on: a shared issue tracker whose tickets are keyed to REQ-*/D-WSn.m/Q-xx/R-xx
IDs; public `akash-network` repositories (REQ-SOW-042) with CI visible to the client; a shared communications channel
with Overclock counterparts; and document-set changes via pull request per the
[README change-control convention](./README.md). The tracker is the single source of truth for deliverable status.

## Cross-references

- [03. Solana](./03-solana-architecture.md) / [04. Ethereum architecture](./04-ethereum-architecture.md): REQ sets WS2 implements.
- [05. Token migration](./05-token-migration.md), [06. State & data migration](./06-state-and-data-migration.md):
  REQ sets WS3 implements.
- [07. Off-chain & clients](./07-offchain-and-clients.md): REQ set WS4 implements.
- [08. Security & audits](./08-security-and-audits.md): WS5 program (audits, key ceremonies, monitoring).
- [09. Testing & verification](./09-testing-and-verification.md): WS6 acceptance thresholds.
- [10. Rollout & cutover](./10-rollout-and-cutover.md): gates G0–G5 and the runbooks WS7 executes.
- [12. Risk register](./12-risk-register.md): risks WS0 co-owns.
- [13. Open questions & assumptions](./13-open-questions-and-assumptions.md): D/A/Q items cited throughout.

## Feeds into

- The RFP package and the executed contract (this document becomes its statement of work).
- [12. Risk register](./12-risk-register.md): commercial risks and owners.
- [13. Open questions & assumptions](./13-open-questions-and-assumptions.md): new items A-14, A-15, Q-20, Q-21
  (recorded via lead).
