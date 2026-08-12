# 10. Rollout, Cutover & Old-Chain Sunset

| | |
|---|---|
| **Document** | 10. Rollout, cutover & old-chain sunset |
| **Doc ID** | AKASH-MIG-10 |
| **Version** | 0.9 (draft for review) |
| **Date** | 2026-08-10 |
| **Owner** | Overclock Labs |
| **Audience** | Vendor engineering & delivery leads, Overclock ops/comms, community reviewers |
| **Status** | Normative where marked (MUST/SHALL); informative otherwise |

## Purpose

The program spine: phase plan (P0–P7), decision gates (G0–G5), the governance sequence on the Cosmos chain, the S1
cutover runbook, wind-down operations through halt, rollback/contingency handling, operational notifications, and
post-migration hypercare/handover. Event notation (fixed in [D-05/D-18](./13-open-questions-and-assumptions.md)): **C** = cutover;
**S1** = supply snapshot at C; **H** = final halt = C+90d; **S2** = residual snapshot at H.

## In scope

- Phase plan (gate/event-bounded); gate definitions (entry, exit, evidence, approver).
- The on-chain governance sequence on `akashnet-2` (Akash mainnet), including proposal skeletons.
- The S1 cutover runbook (T-minus schedule with owners) and the C→H wind-down operating rhythm.
- Rollback and contingency mechanics, including the abort switch and the point of no return.
- Operational notifications, hypercare SLAs, success metrics, handover, decommission pointer.

## Out of scope

- The program calendar and the audience-facing communications plan: maintained client-side in the
  program & comms plan, outside this technical set.
- Claims/token mechanics and exchange swap design: [05. Token migration](./05-token-migration.md).
- Snapshot/export tooling, verification internals, archives, decommission details: [06. State & data migration](./06-state-and-data-migration.md).
- Rehearsal/dry-run definitions and pass criteria: [09. Testing](./09-testing-and-verification.md).
- RACI, staffing, payment milestones M0..Mn: [11. Scope of work](./11-scope-of-work.md).
- Risk scoring: [12. Risk register](./12-risk-register.md).

## 1. Phase plan (P0–P7)

**REQ-ROL-001** The program SHALL be executed as eight phases P0–P7 separated by gates G0–G5 (§2). Work gated behind
a pending gate MUST NOT start, except the "in parallel while pending" items enumerated per gate in §2.

**REQ-ROL-002** The program calendar is maintained client-side outside this technical set; the calendar date of S1
SHALL be set exclusively by the governance sequence in §3; external communications MUST quote governance-set dates
only.

| Phase | Bounded by | Principal contents | Exits via |
|---|---|---|---|
| P0 Mobilization + Stage A verification | T0 (Vendor kickoff) → G0 | Staffing, environments, re-verification of volatile facts ([13 §4](./13-open-questions-and-assumptions.md)), live-state data pull (Q-19), exchange outreach start (Q-04), prototype spikes (Q-15), signal proposal (§3.i), G0 decision package | **G0** |
| P1 Design freeze | G0 → G1 | Selected-path architecture ([03](./03-solana-architecture.md)/[04](./04-ethereum-architecture.md)) REQ baseline, [05](./05-token-migration.md)/[06](./06-state-and-data-migration.md)/[07](./07-offchain-and-clients.md) designs, G1-gated Q-xx resolutions, emissions model ratified (Q-01) | **G1** |
| P2 Build | G1 → G2 | Programs/contracts, claims stack, migration pipeline v1, chain adapter, indexer, Console port | **G2** |
| P3 Testnet + audits | P2 tail (audit prep on frozen components) → G3 | Public testnet, two audit rounds ([08](./08-security-and-audits.md)), load tests, migration dry-runs R1–R2 ([09](./09-testing-and-verification.md)) | feeds G3 |
| P4 Rehearsals + governance ratification | dry-run R2 pass → G3 | Rehearsal R3 (mainnet-fork dress, G3 evidence), binding proposals (§3.ii–iii), exchange commitments | **G3** |
| P5 Launch + S1 cutover + verification | G3 → G4 | Target-chain launch + provider onboarding open (launch precedes C, [07](./07-offchain-and-clients.md)); rehearsal R4 (final dress, S1−14d); §4 runbook: sunset upgrade at C, snapshot, root attestation + 7-day public verification (D-05.b), exchange swaps, claims open ≈C+8–10d | **G4** |
| P6 Wind-down operations | C → H (90d ≈ 13 wk) | §5: weekly residual distributions, provider migration KPIs, validator wind-down administration, tenant notices (§5.4) | feeds G5 |
| P7 S2 + sunset + close-out | H → H+13 wk close-out | S2 residual snapshot + final distribution, halt, archives, infra decommission (H+90d), hypercare exit, handover | **G5** |

P3 overlaps P2's tail (audit prep on frozen components); P4 overlaps P3's (rehearsals start once dry-run R2 passes).

## 2. Decision gates (G0–G5)

**REQ-ROL-003** Each gate SHALL be passed by a recorded sign-off from its named approver(s), referencing the
evidence bundle; gate reviews and outcomes are logged in the program repository.

**REQ-ROL-004** Gate evidence bundles MUST be archived (hashes recorded) and retrievable through H+5y; they are
contractual acceptance artifacts referenced by [11](./11-scope-of-work.md) payment milestones.

### G0. Target ratification (end of P0)

Implements D-01: final selection between the Solana and Ethereum paths.
- **Entry:** kickoff verification sprint complete (volatile-facts report delivered); [02](./02-target-selection.md)
  analysis re-validated; community **signal proposal** (§3.i) submitted on `akashnet-2`.
- **Exit checklist:**
  - [ ] Signal proposal passed (quorum ≥20%, majority yes) on `akashnet-2`.
  - [ ] Overclock leadership sign-off memo naming the target (D-01 → Fixed in [13](./13-open-questions-and-assumptions.md)).
  - [ ] Vendor contract phase-2 trigger executed (target-specific build authorized per [11](./11-scope-of-work.md)).
  - [ ] Program calendar re-baselined in the client-side program & comms plan (REQ-ROL-002).
- **Evidence:** proposal tally export, leadership memo, verification-sprint report, updated doc 13.
- **Approver:** joint, Akash governance (signal) + Overclock leadership; Vendor acknowledges.
- **In parallel while pending:** target-neutral workstreams (token-migration design, claims UX, indexer schema, chain-adapter interface, exchange outreach). No target-specific mainnet code.

**REQ-ROL-005** The Vendor MUST NOT begin target-specific implementation (beyond design spikes and prototypes)
before G0 passes.

**REQ-ROL-006** G0 SHALL NOT pass without all four exit items; a failed signal proposal returns the program to
option analysis ([02](./02-target-selection.md)) with no Vendor obligation beyond P0.

### G1. Architecture freeze (end of P1)

- **Entry:** design reviews of [03](./03-solana-architecture.md)/[04](./04-ethereum-architecture.md) (selected path)
  + [05](./05-token-migration.md)/[06](./06-state-and-data-migration.md)/[07](./07-offchain-and-clients.md) complete; all Q-xx items "needed by G1" resolved.
- **Exit checklist:**
  - [ ] REQ baseline of docs 03/04 (selected path) + 05/06/07 frozen at version 1.0.
  - [ ] Provisional decisions due at G1 (D-03, D-07, D-11, D-17) confirmed or amended in doc 13.
  - [ ] Exchange coordination plan v1 (venues, lead times, coverage math; Q-04) approved.
  - [ ] Thresholds proposed in this document (70% exchange coverage, genesis-provider counts, KPI intervention levels) ratified or amended.
- **Evidence:** design-review minutes, frozen doc versions, exchange plan.
- **Approver:** joint, Overclock (accepts design) + Vendor (commits to build).
- **In parallel while pending:** build of already-approved components; testnet tooling; comms hub.

**REQ-ROL-007** After G1, changes to frozen REQ baselines SHALL flow through change control (README §change control)
with schedule and audit-scope impact assessment; no silent drift.

### G2. Code complete, audits started, testnet live (end of P2)

- **Entry:** all in-scope REQs implemented, unit/integration tests green; public-testnet deployment candidate ready;
  audit firms contracted ([08](./08-security-and-audits.md)).
- **Exit checklist:**
  - [ ] Public testnet live with full protocol + claims stack and seeded test state.
  - [ ] Audit round 1 formally started on a frozen commit (code-freeze tag).
  - [ ] Migration dry-run R1 (pipeline on synthetic + testnet state) passed per [09](./09-testing-and-verification.md).
  - [ ] Old-chain upgrade freeze in effect: no state-layout-affecting `akashnet-2` upgrades from G2 to H (A-01), coordinated with the core team.
- **Evidence:** testnet endpoints + uptime report, audit engagement letters + freeze tag, dry-run R1 report.
- **Approver:** Vendor delivers; Overclock accepts.
- **In parallel while pending:** audit-prep docs, rehearsal planning, exchange tech-pack drafting, provider daemon beta.

**REQ-ROL-008** Components under audit MUST be code-frozen; any post-freeze change re-enters audit scope (delta
review at minimum) before G3.

**REQ-ROL-009** G2 SHALL include written confirmation from Overclock that the `akashnet-2` upgrade freeze (A-01) is
in effect through H.

### G3. Launch readiness (end of P4; gates S1)

- **Entry:** audits complete; rehearsals R2–R3 executed; §3.ii proposal drafted; ops staffing plan signed.
- **Exit checklist:**
  - [ ] Audits clean: all critical and high findings fixed **and re-verified by the auditor**; mediums dispositioned with published rationale ([08](./08-security-and-audits.md)).
  - [ ] Rehearsal R3 (full dress on a mainnet-fork snapshot) passed within its target windows ([09](./09-testing-and-verification.md)); rehearsal R4 scheduled at S1−14d.
  - [ ] Exchange commitments: written swap playbooks from venues jointly covering **≥70% of trailing-90d AKT spot volume** (proposed value, ratified at G1; REQ-ROL-012).
  - [ ] **Binding on-chain governance approval** of the migration + S1 schedule passed (§3.ii).
  - [ ] War-room staffing, monitoring dashboards, status page, and operational-notification artifacts ready (§4.4, §7).
  - [ ] Claims portal + CLI release candidates signed off after a mainnet-fork claim dry-run.
- **Evidence:** final audit reports + re-verification letters, rehearsal R3 report, signed exchange commitments, on-chain tally of §3.ii, runbook sign-off.
- **Approver:** Akash governance (binding vote) + joint Overclock/Vendor go decision.
- **In parallel while pending:** provider re-registration (§4.1 S1−30d items), rehearsal R4 prep.

**REQ-ROL-010** G3 SHALL NOT pass with any unremediated critical/high audit finding; re-verification MUST be
performed by the issuing auditor, not self-attested.

**REQ-ROL-011** G3 SHALL NOT pass unless rehearsal R3 met the §4.3 cutover time targets end to end on the
rehearsal environment: export → verified root within the ≤24h publication budget, plus a claims-open drill
at the rehearsed C+8–10d offset (verification window compressed on the rehearsal clock, steps executed in
full; D-05.b; [09](./09-testing-and-verification.md)).

**REQ-ROL-012** G3 SHALL NOT pass until exchange swap commitments cover ≥70% of trailing-90-day AKT spot volume
[TO-VERIFY: per-venue AKT volume distribution; the Q-04 data pull establishes the denominator]. Waiving or lowering
the threshold requires Overclock leadership sign-off recorded in doc 13.

**REQ-ROL-013** No irreversible action on `akashnet-2` (sunset-upgrade submission, module-account commitments, cutover dates presented as final) SHALL occur before the binding governance approval (§3.ii) passes, i.e., before G3.

### G4. S1 executed and verified (end of P5)

- **Entry:** §4 runbook executed through the first weekly residual cycle (S1+7d) and self-custody
  claims-open (≈C+8–10d per D-05.b).
- **Exit checklist:**
  - [ ] Sunset upgrade activated at height C; old chain producing blocks in wind-down mode.
  - [ ] S1 dual-implementation verification passed; root attestation published (§4.3); 7-day public
    verification window completed with no substantiated objection and the root armed (D-05.b).
  - [ ] Self-custody claims opened on schedule (≈C+8–10d) and live ≥7d with success rate ≥99%; no open P1 incidents.
  - [ ] Exchange swaps executing (majors credited or in announced windows).
  - [ ] Marketplace open on target chain with genesis providers live and ≥1 independent funded deployment completing an order→bid→lease cycle.
  - [ ] First weekly residual cycle (§5.1) executed.
- **Evidence:** attestation bundle, claims/swap telemetry, incident log, marketplace dashboards.
- **Approver:** joint war-room sign-off (roster §4.2); reported to governance via forum post.
- **In parallel while pending:** wind-down operations (§5) run regardless; G4 only closes P5.

**REQ-ROL-014** G4 SHALL NOT be declared while any P1 incident is open or any exit item is unmet; failure to reach
G4 by S1+21d escalates to the contingency board (§6.3).

### G5. S2, sunset complete, program close (end of P7)

- **Exit checklist:**
  - [ ] S2 residual snapshot at H exported, verified to the same dual-implementation standard, and final residual distribution published ([05](./05-token-migration.md)).
  - [ ] Chain halted at H; archives published per [06](./06-state-and-data-migration.md): full state export, indexer DB, static explorer.
  - [ ] Infrastructure decommission checklist ([06](./06-state-and-data-migration.md)) complete at H+90d.
  - [ ] Hypercare exit criteria met (§8.1); success-metric scorecard published (§8.2).
  - [ ] Handover package accepted and key ceremony completed (§8.3).
- **Evidence:** archive hashes + locations, decommission checklist, scorecard, handover acceptance.
- **Approver:** Overclock (accepts handover); result posted to the community forum.

**REQ-ROL-015** G5 SHALL NOT pass until archives are published at permanent, publicly documented locations and the
handover package (§8.3) is accepted in writing.

## 3. Governance sequence on `akashnet-2`

A **governance proposal** is an on-chain vote among staked-AKT holders on the Cosmos chain (mechanics in
[01](./01-current-architecture.md)). Current parameters: **voting period 3 days**, **minimum deposit 2,500 AKT**,
**quorum 20%** of bonded stake, max deposit period 14 days; with the deposit self-funded, a proposal completes in
~3–4 days wall clock. Expedited proposals (shortened voting for emergencies) exist in the chain's SDK version
[TO-VERIFY: live `akashnet-2` expedited governance parameters (voting period and minimum deposit) at P0].

**REQ-ROL-016** The governance sequence SHALL execute in order (i)→(ii)→(iii)→(iii-b); a later proposal MUST NOT be
submitted before its predecessor passes. Proposal skeletons (full texts are a P4 deliverable; Overclock owns,
Vendor supplies technical content):

- **(i) Signal: "Migrate the Akash protocol to [target]"** (text proposal, P0; G0 entry). States intent to migrate
  per the AKASH-MIG document set (version pinned by hash), summarizes the dual-snapshot mechanism (S1 at cutover,
  90-day wind-down, S2 at halt, 2-year claim window) and the Gate 0 process, and asks the community to signal
  support. Explicitly non-binding: no height, no date, no funds movement.
- **(ii) Binding migration approval** (text proposal, submitted during P4; G3 exit condition per REQ-ROL-013). Ratifies:
  execution per the doc set; the sunset upgrade **name `v3.0.0-sunset`**; the **S1 height formula** (C = first
  block whose timestamp ≥ the approved cutover instant, with the concrete height
  computed at proposal-(iii) submission as `h_submit + ceil((T_cutover − t_submit)/6.5s)` from the chain's 6.5 s
  average block time); H = C+90d; the wind-down message allow-list policy (Q-17); claim windows per D-05; and the
  point-of-no-return declaration (§6.2) verbatim.
- **(iii) Sunset software upgrade** (software-upgrade proposal, submitted S1−21d). The standard Cosmos mechanism
  directing every validator's Cosmovisor supervisor to swap binaries at an exact height: schedules `v3.0.0-sunset`
  at the concrete height C per (ii), binary URLs + SHA-256 checksums in the info field. The upgrade installs the
  wind-down message filter and min-gas raise (D-18; detail in [06](./06-state-and-data-migration.md)).
  **(iii-b)** mirrors this at H−21d, scheduling the final halt at height H.
- **(iv) Emergency path (C→H)** (expedited, as needed). Pre-drafted expedited proposals covering: cancellation of a
  scheduled upgrade (pre-S1 abort, §6.1); wind-down extension (replacement halt height); sunset anti-spam parameter
  adjustment (Q-17); supplemental validator-incentive funding. Deposits pre-funded from an ops account.

**REQ-ROL-017** Proposal (ii) MUST contain, at minimum: doc-set version hash, upgrade name, S1 height formula and
target instant, H offset, claim-window durations, and the §6.2 point-of-no-return text. Any later material deviation
requires a superseding proposal.

**REQ-ROL-018** Proposal (iii) SHALL be submitted no later than S1−21d and MUST encode the concrete height C;
predicted-time drift handling per REQ-ROL-024.

**REQ-ROL-019** Proposal (iii-b) SHALL be submitted no later than H−21d; H MUST equal C+90d unless a
governance-approved extension (path iv) supersedes it.

**REQ-ROL-020** The emergency templates (iv) MUST exist, be rehearsed (used verbatim in rehearsal R3), and have
funding arranged before G3.

## 4. S1 cutover runbook

**REQ-ROL-021** The cutover SHALL be executed from a versioned, executable copy of this runbook; every deviation
MUST be logged in real time in the war-room log and reviewed at the S1 retrospective.

### 4.1 T-minus schedule

| T | Action | Owner | Notes |
|---|---|---|---|
| S1−35d | Target-chain production deployment complete: programs/contracts live, order intake disabled via config ([03](./03-solana-architecture.md)/[04](./04-ethereum-architecture.md)) | Vendor | G3 evidence |
| S1−30d | **Formal exchange notices**: exact cutover instant, height formula, per-venue swap tech pack final | Overclock BD | Precedent: 3–6mo engagement, 30d formal notice (RNDR/HNT playbooks) |
| S1−30d | **Provider re-registration opens** on target chain; **provider daemon GA** (chain adapter, [07](./07-offchain-and-clients.md)) | Vendor eng + Overclock provider team | D-08: launch precedes C |
| S1−30d | Validator coordination channel stood up; abort-procedure instructions distributed (§6.1) | Overclock ops | Validators = the ≤100 block-producing operators of the Cosmos chain |
| S1−28d | Claims portal + CLI final RC; mainnet-fork claim dry-run | Vendor | [05](./05-token-migration.md) |
| S1−21d | Sunset upgrade proposal (iii) submitted with concrete height C | Overclock on-chain ops | §3 |
| S1−17d | Voting closes; C confirmed (or program re-baselines) | Akash governance | 3d voting period |
| S1−14d | **Rehearsal R4**: final dress on fresh mainnet-fork state | Vendor | [09](./09-testing-and-verification.md); failure → §6.1 abort review |
| S1−14d | IBC voucher-return final call (Osmosis/Hub frontends, wallets) | Overclock comms | D-07; IBC = Cosmos cross-chain transfer protocol, see [01](./01-current-architecture.md) |
| S1−7d | **Genesis providers confirmed**: ≥20 providers including top-5 by GPU capacity registered, bid engines live (threshold ratified at G1) | Overclock provider team | Go/no-go input |
| S1−7d | War-room shifts locked; status page live; dashboards frozen | Joint ops | §4.4 |
| **S1−72h** | **Go/no-go #1** | Roster §4.2 | Abort → §6.1 path A |
| S1−48h | Height re-estimates published every 12h (block-time drift) | Overclock ops | REQ-ROL-024 |
| **S1−24h** | **Exchange/custodian deposit + withdrawal freeze** for Cosmos-chain AKT | Exchanges (coordinated by Overclock BD) | HNT precedent: ~1-day pause |
| S1−24h | Wallets pause stake/redelegate UX; Console blocks new old-chain deployments (UI-level; chain enforces at C) | Wallet partners / Console team | |
| **S1−6h** | **Go/no-go #2 (final)** | Roster §4.2 | After "go", no abort (§6.2) |
| **S1 (height C)** | **Sunset upgrade activates**: marketplace-entry messages filtered, min-gas raised; chain continues in wind-down mode. S1 balance baseline = committed state at height C−1 (last pre-upgrade block; the upgrade handler moves no balances) | Validators (Cosmovisor) | D-18; [06](./06-state-and-data-migration.md) |
| C → +20h | Snapshot export ×2 independent pipelines; transform; Merkle roots computed and compared (§4.3) | Vendor + Overclock (independent operators) | [06](./06-state-and-data-migration.md) |
| +20h → +24h | Root attestation window: signer quorum per §4.3 | Attestation roster | |
| ≤ S1+24h | **Root published on target chain; Wind-down Reserve minted; BME vault seeded** (REQ-ROL-029). Self-custody claims do NOT open yet (D-05.b) | Vendor | [05](./05-token-migration.md) |
| S1 → +7d | **Exchange swaps execute**. Custodial crediting is NOT gated on the verification window or claims-open (D-05.b; venue allocations reserved in the S1 tree): majors ≤~1 day (HNT precedent); stragglers staggered up to ~4 wk (RNDR precedent); day-1 auto-convert is the requested default (ASI precedent) | Exchanges / Overclock BD | Per-venue windows on status page |
| S1+24h | **Marketplace order intake enabled** on target (providers already registered); first funded deployments expected ≤S1+48h once exchange-swapped AKT circulates (self-custody claims open ≈C+8–10d) | Vendor + Overclock | D-08 |
| S1+24h → ≈C+8d | **7-day public verification window** on the published S1 root: dual-implementation match published, community recomputation invited; root armed at window close ([06](./06-state-and-data-migration.md) §4.3) | Vendor + community | D-05.b; REQ-ROL-030 |
| S1+72h | War-room review #1: swap coverage, verification-window telemetry, incident log; staffing step-down decision | Joint | §4.4 |
| S1+7d | First weekly residual cycle executes (§5.1); S1 retrospective published; G4 review scheduled | Joint | §5 |
| ≈C+8–10d | **Self-custody claims open** (portal + CLI) once the verification window closes and the root is armed | Vendor | [05](./05-token-migration.md); D-05.b |

**REQ-ROL-022** Formal exchange notices MUST be sent no later than S1−30d and MUST include the point-of-no-return
declaration (§6.2) and the per-venue technical pack (§7).

**REQ-ROL-023** Provider re-registration and the GA provider daemon release MUST be available no later than S1−30d,
so that supply exists on the target chain before demand cuts over (D-08).

**REQ-ROL-024** From S1−48h, Overclock ops SHALL publish height-to-time re-estimates at least every 12h; if the
predicted cutover drifts >6h from the announced instant, an advisory MUST go to all §7 notification audiences (the height, not the wall-clock time, is authoritative).

Sequencing note: the Helium L1→Solana migration (2023-04-18) took a ~30h full chain halt between the final L1 block
and Solana state going live. Akash's design is strictly softer: **the old chain never stops at S1**. The sunset
upgrade only freezes marketplace entry; the balance "halt" is *logical* at height C. Transfers, refunds, settlement,
withdrawals, and BME burns keep working through H, so the ≤24h target (REQ-ROL-029) bounds only root-publication
latency (self-custody claims open after the 7-day public verification window, ≈C+8–10d per D-05.b).

### 4.2 Go/no-go governance

**REQ-ROL-025** Go/no-go reviews SHALL be held at S1−72h and S1−6h with this roster: Overclock executive sponsor
(chair), Overclock ops lead, Vendor engineering lead, Vendor security lead, Vendor claims/token lead, one
provider-community representative, one validator representative. Quorum = ≥5 of 7 including the chair, Vendor engineering lead, and Vendor security lead.

**REQ-ROL-026** A "go" requires unanimous assent of chair + Vendor engineering lead + Vendor security lead, plus a
majority of members present. The chair holds sole **abort authority**: the chair MAY abort unilaterally, and an
abort cannot be overruled at the same review. Go/no-go criteria checklists (from rehearsal R4) are pre-published;
ad-hoc criteria additions require chair approval.

### 4.3 Snapshot verification and root attestation

**REQ-ROL-027** The S1 snapshot SHALL be exported and transformed by **two independent pipeline implementations run
by different operators** (Vendor and Overclock) from independently synced nodes; the resulting Merkle roots MUST
match bit-for-bit before publication ([06](./06-state-and-data-migration.md) defines the pipelines; [05](./05-token-migration.md) the tree format).

**REQ-ROL-028** The matched root SHALL be attested by ≥4-of-5 designated signers (Overclock, Vendor, two independent
community auditors, Vendor security lead) over the root, snapshot height, and supply-conservation totals; the
attestation bundle is published alongside the root.

**REQ-ROL-029** Target for height C → attested root published on the target chain is **≤24h**. Exceeding 24h is a
declared incident with §7 notifications; exceeding 72h escalates per §6.3 row B. Self-custody claims-open follows at
≈C+8–10d after the 7-day public verification window (D-05.b); that offset is schedule, not an incident trigger.

**REQ-ROL-030** Self-custody claims MUST NOT open before (a) the attestation bundle is published AND (b) the ≥7-day
public verification window ([06](./06-state-and-data-migration.md) §4.3) has elapsed with the root armed (D-05.b).
Exchange custodial swaps execute from S1 against venue allocations reserved in the S1 tree and are NOT gated on the
verification window or on claims-open.

### 4.4 Monitoring thresholds and war-room

**REQ-ROL-031** A war-room SHALL run 24/7 from S1−24h to at least S1+72h (three 8h shifts, each staffed with
incident commander, claims on-call, protocol on-call, old-chain ops, indexer/Console on-call, comms lead). Step-down below 24/7 requires the S1+72h review's approval; §8.1 on-call coverage continues through hypercare.

**REQ-ROL-032** The following thresholds SHALL be armed from S1−24h; each breach triggers its action:

| Metric | Threshold | Action |
|---|---|---|
| Claims success rate (rolling 15 min) | <99% | P1 incident; guardian pause evaluation (§6.3 row A) |
| Root verification | any mismatch | Stop publication; §6.3 row B |
| Target-chain protocol tx failure rate (non-user-error) | >0.5% over 30 min | P1 incident |
| Escrow settlement lag | p95 >60s over 1h | P2; crank/keeper capacity response ([03](./03-solana-architecture.md)/[04](./04-ethereum-architecture.md)) |
| Old-chain block interval | >15s sustained 30 min | Validator ops escalation; §6.3 row E |
| Old-chain bonded voting power online | <80% | Activate validator contingency (§5.2, §6.3 row E) |
| Exchange swap coverage at S1+7d | <95% of exchange-held supply | BD escalation; per-venue status publication (§6.3 row C) |
| Claim-portal availability | <99.5% daily | P2 |

### 4.5 Target-specific runbook deltas

#### Solana specifics

A Solana cluster halt (historical precedent exists) triggers §6.3 row D: claims are not time-critical and wait out
a restart. Root publication lands in `akash-claims`; attestation signing uses the Squads v4 flow in [08](./08-security-and-audits.md).

#### Ethereum specifics

On the host chain, sequencer downtime is the analogous outage (L1 forced inclusion exists but is unnecessary for a delayable
claims-open). Root publication lands in `MigrationClaims`; attestation signing uses the Safe flow in [08](./08-security-and-audits.md).

## 5. Wind-down operations (C → H)

### 5.1 Weekly residual distribution cycle (D-05)

Old-chain escrow settlements, refunds, and withdrawals during C→H are honored on the target chain from the Wind-down
Reserve via weekly Merkle distributions ([05](./05-token-migration.md) defines amounts; cadence per Q-18).

| Day (weekly) | Step | Owner |
|---|---|---|
| Mon | Export old-chain state at designated height h_n | Overclock ops |
| Tue | Dual-pipeline diff vs h_(n−1): per-address residual deltas; candidate root + full CSV published | Vendor |
| Tue → Thu | **48h public dispute window**: anyone can recompute from published inputs | Community / auditors |
| Thu | Attestation signing (REQ-ROL-028 standard); root published on target; distribution claimable from Wind-down Reserve | Vendor |
| Fri | KPI dashboard refresh + weekly public update | Overclock comms |

**REQ-ROL-033** Residual cycles SHALL run weekly from S1+7d through H, each with a published candidate root, a ≥48h
dispute window, and attestation before distribution.

**REQ-ROL-034** A substantiated dispute SHALL halt that cycle's distribution only; the cycle re-runs after
resolution and the next cycle absorbs any delay. Disputes and resolutions are published.

### 5.2 Validator wind-down administration

The old chain needs ≥2/3 of bonded voting power online through H to keep producing blocks; the incentive design for
validators serving through halt is specified in [06](./06-state-and-data-migration.md), funded per Q-13.

**REQ-ROL-035** Overclock SHALL administer the validator wind-down program weekly: publish the uptime roster, accrue
incentives per the [06](./06-state-and-data-migration.md) formula, and settle them in the terminal distribution at
H. Validator-set health feeds the §4.4 thresholds.

### 5.3 Provider migration KPI dashboard and interventions

**REQ-ROL-036** A public dashboard SHALL be updated at least weekly during C→H with, at minimum: % of active
providers re-registered on the target chain; % of GPU capacity live on target (vs the S1−30d baseline); active lease
count old vs new chain; escrow value remaining on the old chain; cumulative residual distributions paid.

**REQ-ROL-037** The following intervention thresholds SHALL trigger their playbooks without further approval
(playbooks owned by Overclock, funded per the D-12 provider-incentive pool):

| Trigger | Playbook |
|---|---|
| <50% GPU capacity live on target at C+30d | **Incentive boost**: raise provider-incentive pool rewards, direct outreach to top-20 providers, migration office hours, white-glove re-registration support |
| <60% capacity at C+45d | Above + governance consultation on wind-down extension (§3.iv) |
| Active new-chain leases <30% of baseline at C+45d | Tenant-side incentives (deployment credits via Console), demand-side comms push |
| Escrow value on old chain >25% of S1 level at C+75d | Targeted outreach on remaining leases; confirm forced-close notices (§5.4) |

### 5.4 Tenant communications cadence

**REQ-ROL-038** Tenants with leases still active on the old chain SHALL receive: weekly general updates; direct
notices (Console, provider relays) at C+30d, C+60d, and C+75d; and a final forced-close warning no later than
**7 days before H**, stating that leases open at H are force-closed with escrow refunds honored in the S2 distribution ([05](./05-token-migration.md), [06](./06-state-and-data-migration.md)).

## 6. Rollback and contingency

### 6.1 Pre-S1: abort paths (old chain unaffected)

Before the sunset upgrade activates, aborting leaves `akashnet-2` untouched, which is the point of REQ-ROL-013 (no
irreversible old-chain action before the G3 binding vote): the program can stop at any gate with no protocol damage.

**REQ-ROL-039** The scheduled sunset upgrade MUST carry an abort switch usable until the S1−6h go/no-go, implemented
as two windows:

- **Path A (until ≈S1−36h): governance cancellation.** A pre-drafted, pre-funded expedited proposal invoking the
  chain's upgrade-cancellation message (the standard Cosmos mechanism for de-scheduling an upgrade) is held ready
  from S1−72h; expedited voting completes before C [TO-VERIFY: expedited voting period, per §3].
- **Path B (≈S1−36h → S1−6h): coordinated validator skip.** Validators restart with the standard skip-upgrade flag
  for height C (`--unsafe-skip-upgrades <C>`); effective when operators representing >2/3 of voting power apply it.
  Instructions and the coordination channel exist from S1−30d (§4.1); the cancellation proposal is still submitted
  afterward to ratify the abort on-chain.

An abort via either path returns the program to P4; rescheduling requires a new proposal (iii). Between C and root
publication one damage-limited recovery remains: if S1 verification fails catastrophically (§6.3 row B exhausted),
an emergency proposal (§3.iv) re-opens the marketplace by reverting the message filter, a disaster path that
exists only until claims open.

### 6.2 Post-S1: point of no return

**REQ-ROL-040** The point of no return is the **execution of S1 itself** (activation of the sunset upgrade at C and
the start of exchange custodial swaps): from that moment the migration cannot be reversed. The subsequent
publication of the attested S1 root and the opening of claims (≈C+8–10d per D-05.b) is the **final verification
milestone**, after which no accounting adjustment to the S1 distribution is possible. Both statements MUST appear
verbatim in proposal (ii), all exchange notices, the claim portal, and the migration hub page.

### 6.3 Contingency matrix

**REQ-ROL-041** The following matrix SHALL be maintained as a live document, and rows A–E SHALL each be exercised at
least once across rehearsals R3–R4 ([09](./09-testing-and-verification.md)).

| # | Scenario | Detection | Immediate action | Authority | Comms |
|---|---|---|---|---|---|
| A | Claims bug discovered post-S1 | §4.4 thresholds; bug bounty; user reports | **Pause claims only** via guardian role ([08](./08-security-and-audits.md)); marketplace and residual cycles keep running; patch via timelock-expedited path; root unchanged | Guardian (pause) + upgrade multisig (patch) | Status page ≤1h; post-mortem ≤72h |
| B | Snapshot verification mismatch (pipelines disagree) | REQ-ROL-027 comparison | Delay root publication ≤72h; triage board (Vendor eng lead, Overclock ops, one attestor-auditor) isolates divergence; if unresolved, a third independent implementation adjudicates | Triage board; chair decides publish/hold | Incident notice at +24h (REQ-ROL-029); daily updates |
| C | Exchange fails to swap on time | Venue status tracking | None on-chain; custodial users' entitlements are unaffected (venue allocation reserved per [05](./05-token-migration.md)); publish per-venue status; RNDR precedent: staggered windows up to ~4 wk are normal | Overclock BD | Per-venue status rows; user guidance |
| D | Target-chain outage during S1 window | Chain monitoring | Claims are not time-critical: delay claims-open/marketplace-open until stable; old chain continues wind-down unaffected (§4.5) | War-room chair | Status page; revised timeline notice |
| E | Mass provider no-show / old-chain validator attrition | §5.3 KPIs; §4.4 voting-power threshold | Provider side: §5.3 incentive boost, then governance-approved wind-down extension (§3.iv). Validator side: Q-13 incentives; worst case, accelerate S2 from the last good height by emergency governance + social consensus | Overclock + governance | Weekly updates; dedicated notices |

**REQ-ROL-042** The guardian pause (row A) MUST be scoped to claim execution only; it SHALL NOT be able to pause
marketplace programs/contracts, already-attested residual distributions, or transfers of already-claimed AKT.

**REQ-ROL-043** Root-publication delay (row B) beyond 72h total requires the chair to invoke either the
third-implementation adjudication or the §6.1 disaster re-open path; silent extension is prohibited.

## 7. Operational notifications

The audience-facing communications plan is maintained in the client-side program & comms plan, outside this
technical set. This section retains only the notifications execution depends on; their runbook triggers live in
§4.1, §5.4, and §6.

**REQ-ROL-044** [RELOCATED] Audience×milestone communications-artifact matrix and migration-hub-page canonical
index: maintained in the client-side program & comms plan, outside this technical set.

Operational notifications (execution-required; REQ IDs below remain active):

| Notification | Latest trigger | Owner | Reference |
|---|---|---|---|
| Exchange/custodian formal notice + final technical pack | S1−30d (pack delivered ≥16 wk before C) | Overclock BD; pack content by Vendor | §4.1; REQ-ROL-022, REQ-ROL-046; [11](./11-scope-of-work.md) REQ-SOW-026 |
| Exchange/custodian deposit + withdrawal freeze notice | S1−24h freeze | Exchanges, coordinated by Overclock BD | §4.1 |
| Provider daemon-GA upgrade notice + re-registration opening | S1−30d | Vendor eng + Overclock provider team | §4.1; REQ-ROL-023 |
| Validator upgrade coordination channel + abort-procedure instructions | S1−30d | Overclock ops | §4.1, §6.1 |
| IBC counterparty notices | S1−60d | Overclock | REQ-ROL-045 |
| Tenant wind-down notices + forced-close warning | C+30d/C+60d/C+75d; ≤H−7d | Overclock | §5.4; REQ-ROL-038 |
| Height re-estimates + drift advisories | from S1−48h, every ≤12h | Overclock ops | §4.1; REQ-ROL-024 |

**REQ-ROL-045** IBC counterparty notices (at minimum an Osmosis governance forum post and a Cosmos Hub forum post)
MUST be published no later than S1−60d, covering the voucher-return campaign, the stranded-voucher redemption
process, and channel wind-down ([05](./05-token-migration.md)).

**REQ-ROL-046** The exchange-facing technical pack MUST include: snapshot/height definition, Merkle proof format +
verification tooling, venue swap-allocation mechanics, test vectors, target-chain integration guide (mint/contract addresses, finality guidance), freeze-window recommendation, and support escalation contacts.

**REQ-ROL-047** A public status page SHALL run from S1−7d through G5; during C→H a written weekly update SHALL be
published (residual cycle results, KPIs, incidents) per §5.

## 8. Post-migration: hypercare, success metrics, handover

### 8.1 Hypercare (90 days, C → H; reduced through G5)

**REQ-ROL-048** The Vendor SHALL provide hypercare from S1 through H at the following SLAs, and from H through G5 at
P1/P2-only coverage:

| Severity | Definition | Response | Mitigation/workaround | Resolution target |
|---|---|---|---|---|
| P1 | Funds at risk, claims blocked, marketplace down, snapshot integrity in question | **2h, 24/7** | 12h | 72h (patch via [08](./08-security-and-audits.md) expedited path) |
| P2 | Core flow degraded (settlement lag, indexer lag, portal errors) | 8h | 48h | 7d |
| P3 | Non-core defect, tooling issues | 24h | none | next scheduled release |
| P4 | Cosmetic, docs | 72h | none | backlog |

Exit criteria (G5 input): 30 consecutive days with no P1, ≤2 open P2s, every runbook executed once by Overclock staff with the Vendor observing.

### 8.2 Success metrics

**REQ-ROL-049** The program scorecard SHALL be measured continuously and published at H and at G5. The
protocol-verifiable acceptance rows are the table below; market/adoption success targets (exchange-swap and
claim-adoption percentages, provider-capacity retention, lease-volume recovery) are maintained in the client-side
program & comms plan and do not gate acceptance under this set; the operational intervention thresholds that
trigger runbook playbooks remain normative in §4.4 and §5.3.

| Metric | Target |
|---|---|
| Fund-loss incidents unrecovered | 0 |
| S1 root-publication latency | ≤24h (REQ-ROL-029); self-custody claims-open on the D-05.b schedule (≈C+8–10d) |
| Residual cycles executed on schedule | 13/13 |

Misses do not retroactively fail gates; each miss requires a published root-cause and remediation plan at G5.

### 8.3 Handover package and key ceremony

**REQ-ROL-050** Before G5 the Vendor SHALL deliver, and Overclock accept, a handover package containing: executable
versions of every runbook in this document (cutover, residual cycle, contingency rows A–E, emergency governance
templates); monitoring dashboards + alert configurations with thresholds as code; incident playbooks; operational
documentation for claims, cranks/keepers, indexer, RPC dependencies (ownership per Q-07); and a training sign-off from the receiving Overclock operators.

**REQ-ROL-051** A witnessed **key ceremony** SHALL transfer or verify all operational authorities per
[08](./08-security-and-audits.md): upgrade-authority multisig seats (Squads v4 for Solana; Safe for EVM) and timelock
roles, claims guardian keys, crank/keeper operator keys, attestation-signer set retirement, and mint-authority state
verification (D-03/D-04). The ceremony record (who holds what, from when) is a G5 evidence artifact.

### 8.4 Decommission

**REQ-ROL-052** Old-chain infrastructure decommission SHALL follow the checklist in
[06. State & data migration](./06-state-and-data-migration.md) (archives published at H; RPC/seed/snapshot
endpoints retired at H+90d per D-18); completion evidence feeds G5.

## Cross-references

- [02. Target selection](./02-target-selection.md): Gate 0 selection basis; ratified at G0.
- [05. Token migration](./05-token-migration.md): S1/S2 contents, claims, exchange allocations, Wind-down Reserve, IBC redemption.
- [06. State & data migration](./06-state-and-data-migration.md): sunset upgrade internals, export/verification pipelines, validator incentive formula, archives, decommission.
- [07. Off-chain services & clients](./07-offchain-and-clients.md): provider daemon GA, Console, wallet integrations (§4/§7).
- [08. Security & audits](./08-security-and-audits.md): audit gates, guardian role, timelock paths, key ceremony detail.
- [09. Testing & verification](./09-testing-and-verification.md): dry-runs R1–R2, rehearsals R3–R4, pass criteria behind G2/G3.
- [11. Scope of work](./11-scope-of-work.md): milestones M0..Mn and payment gates mapped to G0–G5; RACI for the §7 operational notifications.
- [12. Risk register](./12-risk-register.md): risks whose triggers reference §4.4/§5.3 thresholds.
- [13. Open questions](./13-open-questions-and-assumptions.md): D-01, D-05, D-08, D-18; Q-04, Q-13, Q-17, Q-18, Q-19.

## Feeds into

- [11. Scope of work](./11-scope-of-work.md): phases/gates become milestones and payment triggers.
- [12. Risk register](./12-risk-register.md): contingency matrix rows map to risk mitigations.
- [05](./05-token-migration.md)/[06](./06-state-and-data-migration.md): execute inside the §4/§5 runbooks defined here.
- Vendor project plan and the go/no-go checklists derived from §4.
