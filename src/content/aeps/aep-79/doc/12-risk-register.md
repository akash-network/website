# 12. Risk Register

| | |
|---|---|
| **Document** | 12. Risk register |
| **Doc ID** | AKASH-MIG-12 |
| **Version** | 0.9 (draft for review) |
| **Date** | 2026-08-10 |
| **Owner** | Overclock Labs |
| **Audience** | Program leadership (Vendor + client), all workstream leads |
| **Status** | Normative where marked (MUST/SHALL); informative otherwise |

## Purpose

Single register of program risks for the Akash chain migration, with a uniform scoring method,
proactive mitigations, reactive contingencies, named owners, and leading indicators. This is the
operational artifact the program office (PMO) walks monthly and at every gate; it links each risk to
the documents, decisions (D-xx), assumptions (A-xx), and open questions (Q-xx) that govern its
treatment. Risk IDs (R-xx) are stable and are cited from other documents in the set.

## In scope

- Program risks across both target paths (Solana and Ethereum), with path-scoped rows marked.
- Scoring method, risk statement format, owner types, review cadence, and linkage rules.
- Escalation and acceptance rules, including which scores require steering-committee sign-off.
- Risk-budget linkage to the contingency reserve established in [11. Scope of work](./11-scope-of-work.md).
- Killed-risk log structure (empty at v0.9).

## Out of scope

- Requirement statements: these live in their home documents as `REQ-*`; this document allocates none.
- Decision rationale and open-question tracking: [13. Open questions](./13-open-questions-and-assumptions.md).
- Incident response procedures, monitoring stack, and key-management detail: [08. Security](./08-security-and-audits.md).
- Gate definitions and cutover runbook: [10. Rollout & cutover](./10-rollout-and-cutover.md).
- General business risks of Akash Network unrelated to the migration program.

---

## 1. Method

### 1.1 Scoring

Risks are first assessed on conventional 5-point likelihood and impact scales, then collapsed to a
3×3 grid for reporting: raw 1–2 → **L**, 3 → **M**, 4–5 → **H**. The collapse is deliberate: 5×5
granularity is spurious precision at pre-execution stage and produces assessor-dependent rankings;
3×3 keeps ordering stable. Numeric values L=1, M=2, H=3; **score = likelihood × impact ∈ {1, 2, 3, 4, 6, 9}**.

Anchors (program horizon = Vendor kickoff through H+90d):

| Level | Likelihood | Impact |
|---|---|---|
| **H** | > 60% within program horizon | Any non-recoverable user-fund loss or supply-conservation breach; program stop; gate slip > 3 months; budget overrun > 25%; loss of a launch-critical constituency (validators, providers, exchanges) |
| **M** | 25–60% | Bounded, recoverable fund exposure; gate slip 1–3 months; budget overrun 10–25%; material but recoverable adoption or reputation damage; core UX degraded > 1 week |
| **L** | < 25% | Slip < 1 month; budget < 10%; cosmetic or short-lived degradation with a workaround |

Score bands: **9 = Critical**, **6 = High**, **3–4 = Medium**, **1–2 = Low**. Handling per band is
defined in §6. Scores in this register are current assessments as of 2026-08-10 (pre-Gate-0, both
paths open) assuming baseline program controls only; listed mitigations are the funded plan to drive
scores down, re-measured at each review.

### 1.2 Risk statement format

Every risk statement MUST use the causal form:

> **Because** \<condition that exists today\>, \<event\> **may occur**, **causing** \<consequence\>.

Condition and consequence must be concrete enough to test: a reviewer can check whether the condition
still holds and whether the consequence would move an anchor in §1.1.

### 1.3 Owner types

Each risk has exactly one accountable owner (a role, not a person). Owners MAY delegate mitigation
actions but not accountability, and own the monitoring of their risk's trigger.

| Code | Role | Accountable for |
|---|---|---|
| VEL | Vendor engineering lead | Technical mitigations, parity/verification tooling |
| VSL | Vendor security lead | Security mitigations, audit plan execution, incident readiness (with 08) |
| OPL | Overclock protocol lead | Old-chain maintenance, protocol decisions, upgrade-authority operations |
| OIL | Overclock infrastructure/ops lead | RPC, indexer, crank/keeper, relayer, validator-ops backstops |
| OBD | Overclock ecosystem/BD lead | Exchanges, providers, customers |
| OCL | Overclock community/governance lead | Governance process, comms, community programs |
| LC | Legal counsel (client-retained) | Legal and regulatory risks |
| PMO | Joint program office (Vendor PM + Overclock PM) | Cross-cutting program and schedule risks |

### 1.4 Review cadence

- **Monthly**: PMO-chaired risk review; all Medium-and-above risks walked; expected-cost estimates
  (§6.3) refreshed; new risks admitted; trigger status confirmed.
- **At every gate (G0–G5, per [10](./10-rollout-and-cutover.md))**: full re-score of all open risks;
  acceptance decisions re-affirmed; gate hold rules in §6.2 applied. At Gate 0, risks scoped to the
  unselected path retire to the killed-risk log (§5).
- **Event-driven**: when a trigger fires or a linked assumption (A-xx) fails validation, the owner
  MUST re-score within 5 business days and notify the PMO.

Register changes flow by pull request to this file per the change-control rules in the
[README](./README.md). R-xx IDs are never renumbered or reused.

### 1.5 Linkage rules

- Every risk MUST link at least one document of this set, and SHOULD link every D/A/Q item its
  treatment depends on (`Links` column: docs; then D/A/Q IDs).
- A failed assumption triggers immediate re-score of all risks linking it (§1.4). A resolved open
  question triggers review of linked risks at the next monthly.
- A risk treatment that requires a new program decision escalates through
  [13](./13-open-questions-and-assumptions.md) (append a D-xx); this register never records decisions itself.

---

## 2. Master risk register

Path column: **Both** = applies regardless of Gate 0 outcome; **SOL** / **EVM** = applies only to that
path. Categories: technical, security, market, operational, legal, schedule, organizational.
Mitigation = proactive (funded in workstream budgets, [11](./11-scope-of-work.md)); Contingency =
reactive (funded from the contingency reserve, §6.3).

| ID | Title | Category | Path | Risk statement | L | I | S | Mitigation (proactive) | Contingency (reactive) | Owner | Trigger / leading indicator | Links |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| R-01 | Claims-program exploit (migrated-supply honeypot) | Security | Both | Because the claims program/contract holds mint authority over the entire migrated AKT supply for the 2-year claim window, a proof-verification or claim-accounting flaw may be exploited, causing unauthorized minting or theft of migrated supply. | M | H | 6 | Both independent audits cover it; property-based/formal verification of Merkle-proof and double-claim logic; mint constrained by construction to roots committed at S1/S2; per-epoch mint caps; real-time supply-conservation monitor with auto-pause; top bug-bounty tier. | Guardian pause of claims; incident response per 08; patched redeploy against re-verified roots; public reconciliation report. | VSL | Conservation-monitor delta nonzero; anomalous claim velocity; audit or bounty critical finding. | 05, 08; D-05, D-15 |
| R-02 | Snapshot accounting error / conservation mismatch | Technical | Both | Because S1 must transform every balance class (liquid, vesting, bonded/unbonding, accrued rewards, module accounts, IBC escrows) in two denoms into Merkle claims plus the Wind-down Reserve, an export or transform defect may occur, causing supply non-conservation discovered after irreversible mints. | M | H | 6 | Two independent transform implementations required to produce byte-identical output; at least 3 mainnet-export dry-runs (09); conservation equation as acceptance criterion (05); public root, per-address balance explorer, and challenge window before first mint. | Pre-open: recompute and republish root. Post-open: pause claims, freeze unclaimed tranche, corrections funded from reserve/treasury by governance. | VEL | Dry-run diffs nonzero; challenge-window findings; Q-19 data gaps at kickoff. | 05, 06, 09; D-05, D-06, Q-19 |
| R-03 | Escrow parity defect causing tenant/provider fund loss | Technical | Both | Because escrow semantics (FIFO multi-depositor refunds, overdrawn accounting, per-block to per-second rate conversion, AKT fallback under BME halt) are re-implemented on a new VM, an undetected behavioral divergence may occur, causing tenant or provider fund loss or mis-payment at marketplace scale. | M | H | 6 | Differential replay harness against recorded akashnet-2 escrow histories (09); invariant suite (deposits = payouts + refunds; no negative payouts); audit scope weighted to escrow paths. | Pause affected instruction via upgrade authority; treasury-funded reimbursement policy; hotfix through the expedited-upgrade path in 08. | VEL | Replay-harness divergence; indexer-vs-chain reconciliation drift. | 03, 04, 09; D-21 |
| R-04 | BME collateral-ratio manipulation via oracle latency | Security | Both | Because BME swap pricing derives from a single Pyth AKT/USD feed and executes in epoch batches, oracle latency or price manipulation in thin AKT markets may be exploited, causing vault collateral drain and a CR halt. | M | H | 6 | Carry over CR breaker (9500/9000 bps), mint spread, MinMint, and epoch batching; add per-epoch volume caps and staleness/confidence gating on Pyth reads; economic red-team exercise per 08. | CR-halt path still permits ACT-to-AKT refunds (D-20); governance vault top-up; parameter tightening via governance. | VSL | CR trending toward warn threshold; swap-queue volume anomaly vs TWAP divergence. | 03, 04, 08; D-13, D-20 |
| R-05 | Crank/keeper liveness failure (settlement + BME epochs) | Operational | Both | Because settlement, BME epochs, and residual distributions run on permissionless cranks (Solana) or keeper automation (EVM) instead of consensus EndBlockers, incentive shortfall or operator outage may leave epochs unexecuted, causing settlement lag, stalled swaps, and late overdrawn detection with providers serving unpaid workloads. | M | M | 4 | Crank-tip economics sized in 03; redundant Vendor- and Overclock-operated fallback executors; keeper SLA contracts on EVM; epoch-lag alerting per 08. | Manual execution runbook; raise tips/keeper budgets via governance. | OIL | Epoch-execution lag over threshold; tip-balance drawdown rate. | 03, 04, 07; D-20, D-21, Q-07 |
| R-06 | Fee-sponsorship relayer drain | Security | Both | Because a fee-sponsorship relayer/paymaster pays transaction fees for onboarding and Console flows, Sybil spam against sponsored paths may occur, causing relayer balance drain and sponsored-UX outage. | M | M | 4 | Per-account rate limits and scoped allowlists; spend caps with auto-shutoff; anomaly monitoring on sponsored spend. | Refill under tightened rules; degrade to user-paid fees (UX loss, not fund loss). | OIL | Sponsored-spend rate anomaly vs baseline. | 07; D-17, Q-07 |
| R-07 | Alpenglow instability inside the launch window | Technical | SOL | Because Solana's Alpenglow consensus rewrite is expected to activate on mainnet inside the program window (Q3–Q4 2026, as of 2026-08), network instability or validator-economics turbulence may occur near cutover, causing launch delay or degraded early UX. | M | M | 4 | Gate criterion in 10: no cutover within a defined stability buffer after activation; design promises no specific finality figures; soak testing on Alpenglow-enabled clusters. | Hold at gate and shift C by a governance-approved delta; before Gate 0 the EVM path remains available. | PMO | Activation-schedule announcements; cluster incident reports. | 02, 03, 10; A-13, A-07 |
| R-08 | Solana congestion / fee spikes vs marketplace UX | Technical | SOL | Because Solana fees and inclusion latency degrade during network-wide congestion events, marketplace transactions (bids, settlements, claims) may face fee spikes or drops, causing degraded bidding economics and tenant UX. | M | M | 4 | Per-entity account sharding avoids hot writable accounts (D-23); priority-fee strategy and retry logic in clients and provider daemon (07); congestion playbook per 08. | Temporary priority-fee subsidy for critical paths; batch low-urgency operations off-peak. | VEL | p95 landing latency and fee monitors breaching SLOs in 09. | 03, 07; D-23 |
| R-09 | Token-2022 exchange-support gaps | Market | SOL | Because some exchanges and custodians still lack full Token-2022 support (as of 2026-08), onboarding of the migrated AKT mint may be delayed at some venues, causing fragmented launch liquidity or a forced late token-standard decision. | M | M | 4 | Kickoff support-matrix survey (Q-05); D-03 pre-commits a legacy-SPL fallback decided at G1 with no other design impact; early per-venue technical outreach. | Execute the D-03 fallback at G1; never operate two canonical mints. | OBD | Support matrix below threshold across top-10 venues at G1. | 02, 05; D-03, Q-04, Q-05 |
| R-10 | Rent-cost escalation with SOL price | Technical | SOL | Because rent-exempt deposits are denominated in SOL, a sustained SOL price surge may raise per-entity account deposit costs, causing higher effective per-deployment/bid costs and provider friction. | M | L | 2 | Small per-entity accounts with close-and-refund lifecycle (D-23); ZK compression held as a designed optimization option. | Enable compression for high-volume account classes; protocol rent-subsidy pool. | VEL | SOL price sustained above the design threshold stated in 03. | 03; D-23 |
| R-11 | Host-chain policy/economics shift (B1) or Orbit licensing change (B2) | Market | EVM | Because the EVM path deploys on third-party chains with shifting economics (Base announced its Superchain exit 2026-02; Arbitrum Orbit's AEP takes 10% of net protocol revenue), adverse policy or fee-structure changes may occur after selection, causing re-platforming pressure or margin erosion. | M | M | 4 | Gate 0 evaluation weighs policy stability; contracts kept portable EVM (no chain-specific dependencies); B2 variant maintained execution-ready as documented fallback. | Redeploy to an alternate L2 reusing 06 tooling; invoke the Q-06 revisit trigger. | PMO | Host-chain fee/policy announcements; AEP term changes. | 02, 04; D-02, Q-06 |
| R-12 | Exchange coordination slippage incl. multi-year tail | Market | Both | Because exchange swap execution is per-venue and precedent shows long tails (Render's ticker swap completed roughly two years after its migration vote; the ASI phase-2 ticker never fully completed on major venues), some venues may lag S1 by months or years, causing fragmented liquidity, user confusion, and prolonged dual-asset support burden. | H | M | 6 | Venue coordination from G1 (Q-04) with 3–6 months notice; same-ticker chain-swap playbook (A-09), which precedent shows completes in about a day per venue; per-venue technical integration packets; dedicated BD owner. | Market-maker liquidity provisioning on live venues; extended claims support and comms for laggards. | OBD | Signed venue commitments below target at G2. | 05, 10; A-04, A-09, Q-04 |
| R-13 | IBC-stranded AKT holders / counterparty non-cooperation | Operational | Both | Because AKT held as IBC vouchers on counterparty chains (Osmosis pools, Cosmos Hub) is invisible to S1 unless returned home, and counterparty chains have no obligation to cooperate, holders may miss the return campaign, causing stranded value and redemption disputes. | M | M | 4 | Counterparty-chain snapshots for outreach targeting (Q-03); wallet and DEX-frontend campaign; bounded foundation redemption window funded from reserved supply (D-07). | Governance-approved window extension; case-by-case foundation redemption. | OCL | IBC-out AKT balance not declining by campaign midpoint. | 05; D-07, Q-03 |
| R-14 | Validator attrition during C→H wind-down | Operational | Both | Because old-chain AKT loses claim value at S1 and akashnet-2 configures zero downtime slashing, validators may shut down during the C-to-H wind-down before incentives land, causing loss of consensus liveness that blocks lease settlement, weekly residual distributions, and the S2 snapshot. | M | H | 6 | Validator recognition/incentive program funded before C (Q-13); rewards accrued to halt honored at S2 (D-06); signed uptime commitments covering over two-thirds of voting power as a cutover gate criterion (10); Overclock backstop validators on standby. | Coordinated restart from last committed height; execute S2 early from last committed state per the 10 contingency runbook. | OIL | Voting-power decline and missed-block rates after the migration vote passes. | 06, 10; D-18, Q-13, A-01 |
| R-15 | Provider capacity attrition / re-registration no-show | Market | Both | Because providers must upgrade daemons and re-register on the target chain rather than being migrated automatically, operator inertia or dissent may leave capacity behind, causing a thin supply side at launch and tenant flight. | M | H | 6 | Provider council previews (A-05); migration incentives from the provider pool (D-12); one-command re-registration tooling (07); incentivized testnet with top providers by capacity; white-glove support for the top cohort. | Governance-boosted launch incentives; Overclock-operated seed capacity. | OBD | Re-registration rate below target at C−2 weeks (threshold per 10). | 07, 10; A-05, D-08, Q-08 |
| R-16 | Tenant workload interruption blowback | Market | Both | Because running leases must conclude or redeploy within the 90-day wind-down and are force-closed at H, tenants with long-lived workloads may suffer interruption or unplanned migration work, causing churn and public criticism. | M | M | 4 | Early, repeated comms with fixed dates; Console-guided redeploy tooling (07); provider-assisted migration playbooks; forced close only at H, never before. | Escalated support plus service credits on the target chain (H itself is fixed and cannot be extended per-lease). | OBD | Share of active leases not redeployed by C+45d. | 06, 10; D-08 |
| R-17 | Demand-side pause during migration uncertainty | Market | Both | Because customers defer spending during platform transitions, new deployments may stall between announcement and post-launch stabilization, causing a revenue dip and a weakened usage narrative during the migration year. | H | M | 6 | Target chain live before C so supply and demand overlap (D-08); migration credits; direct outreach to top tenants; parity and uptime reporting published throughout. | Treasury-funded demand incentives post-launch. | OBD | New-deployment rate decline after announcement vs trailing baseline. | 00, 10; D-08 |
| R-18 | Competitor exploitation of the transition window | Market | Both | Because the migration consumes roadmap and attention for 12+ months, competitors (io.net and other Solana DePIN compute networks on the Solana path) may target Akash tenants and providers during the window, causing durable market-share loss. | H | L | 3 | Current chain keeps shipping until C (state-layout freeze only from G2 per A-01); differentiated positioning (general compute/containers vs GPU clusters); fast-follow feature roadmap post-launch. | Targeted win-back incentive campaigns. | OBD | Competitor campaigns referencing the migration; churn attribution in account reviews. | 00, 02; A-01 |
| R-19 | Governance rejection or contentious vote split | Organizational | Both | Because the migration requires on-chain governance approval and ends the validator constituency's role and revenue, the binding proposal may fail or pass narrowly with a hostile minority, causing program stop at Gate 0 or a contested execution environment. | M | H | 6 | Signal proposal before G0 (A-02); validator recognition program designed before the binding vote (Q-13); public review of this document set; turnout operation sized to the 20% quorum and 3-day voting window. | Revise terms and re-vote; if permanently blocked, stop at G0 under the Vendor wind-down clause in 11. | OCL | Signal-vote margins; validator forum sentiment. | 00, 10, 11; A-02, Q-13 |
| R-20 | Old-chain fork continuation confusion | Market | Both | Because halting akashnet-2 leaves its software and history public, a faction may continue the chain as a fork claiming the AKT name, causing market confusion and exchange listing disputes. | L | H | 3 | Exchange alignment on canonical chain identity (A-06, Q-04); trademark posture prepared by counsel; snapshot-based claims give a fork no hold on new-chain supply. | Exchange advisories; brand enforcement through counsel. | OCL | Fork coordination activity; validator hold-out blocs post-vote. | 05, 10; A-06, Q-04 |
| R-21 | Post-S1 old-chain spam | Operational | Both | Because old-chain AKT has no claim value after S1, griefers may flood the wind-down chain with near-free transactions, causing state bloat and degraded wind-down operations. | M | L | 2 | Sunset upgrade message allow-list plus min-gas raise (D-18); calibration task Q-17; mempool and state-growth monitoring. | Further min-gas raises via emergency upgrade. | OPL | Old-chain transaction rate and state growth post-C. | 06, 10; D-18, Q-17 |
| R-22 | Multisig signer compromise or collusion | Security | Both | Because upgrade authority and treasury sit behind Squads v4 / Safe multisigs during the transition, signer key compromise or collusion may occur, causing malicious program upgrades or treasury theft. | L | H | 3 | Signer policy per 08 (hardware keys, organizational and geographic distribution, high k-of-n); timelock on all privileged actions creating a public reaction window; independent pre-signing verification of queued actions. | Use the timelock window to alert and counteract; incident response per 08; authority rotation. | OPL | Signer device incidents; unexpected queued timelock actions. | 08; D-11, D-15 |
| R-23 | Governance capture immediately post-launch | Security | Both | Because early post-launch DAO turnout is low while claims are still in progress and no staking lock exists, an attacker may cheaply assemble voting power, causing hostile parameter changes or treasury drain. | L | H | 3 | Launch-phase guardrails per 08: timelock everywhere, quorum floors, council veto (Realms capability check, Q-11), staged transfer of authorities, treasury spend caps. | Council veto/pause; emergency authority migration per 08. | OPL | Sudden voting-power concentration; hostile proposal queue. | 03, 08; D-11, Q-11 |
| R-24 | Realms/SPL-governance maintenance thinness | Technical | SOL | Because SPL Governance (Realms) has been in low-velocity maintenance since spinning out of Solana Labs in 2024, features or fixes Akash governance needs may not land upstream, causing a fork-and-maintain burden on the Vendor and DAO. | M | M | 4 | Q-11 gap analysis at G1; budget line for a light fork in 11; the critical authority path is carried by actively maintained Squads v4 rather than Realms. | Fork Realms with minimal delta, or adopt an alternate governance stack at G1. | VEL | Q-11 gap-analysis results; upstream release cadence. | 03, 08, 11; D-11, Q-11 |
| R-25 | Indexer vendor risk + Geyser/RPC vendor lock | Operational | Both | Because indexing depends on vendor infrastructure (Geyser/webhook providers and commercial RPC on Solana; Ponder, whose team joined Monad in 2026-02, on EVM), vendor pivots or price changes may occur, causing indexer rework or degraded data freshness behind the Console API. | M | M | 4 | Vendor-neutral ingestion seam (raw Geyser protocol, standard EVM logs); pin and vendor the indexer framework or select an alternative (Subsquid/Envio-class) at kickoff (A-07); at least two contracted RPC providers; self-host option costed in 11. | Swap vendor behind the seam; temporary degraded-SLA public-RPC fallback. | OIL | Vendor roadmap announcements; ingestion-lag SLO breaches. | 07; D-16, A-11 |
| R-26 | Pyth AKT feed discontinuation or quality degradation | Operational | Both | Because BME pricing and USD-referenced flows depend on a single Pyth AKT/USD feed (continuing the current chain's single-source oracle), feed discontinuation or quality degradation may occur, causing oracle-halt that blocks new ACT issuance (and with it new deployment funding) until a feed recovers. | M | M | 4 | Publisher/SLA engagement with Pyth (Akash already integrates Pyth verifiers on the current chain); staleness and confidence gating; a secondary oracle (Switchboard-class) evaluated and kept integration-ready per 03/04. | Governance-approved switch to the secondary feed; current-chain halt semantics preserved meanwhile (oracle-halt blocks refunds too, as today). | OPL | Feed staleness/confidence metrics; publisher-count decline. | 03, 04; D-13, D-20 |
| R-27 | Regulatory action on the claims portal | Legal | Both | Because the claims portal distributes tokens to a global holder base, securities (MiCA) obligations or sanctions-screening (OFAC) requirements may attach, causing forced geo-blocking, redesign, schedule slip, or enforcement exposure. | M | H | 6 | Legal review complete before G2 (Q-10); OFAC screening and geo-fencing designed into the portal from the start (05); claims kept non-custodial: the portal is UI only, the program verifies proofs; jurisdiction analysis feeding Q-02. | Jurisdiction-specific restrictions; the direct program/CLI claim path remains permissionless; counsel-led response. | LC | Counsel opinion; regulator inquiries; venue geo-policy changes. | 05; Q-02, Q-10 |
| R-28 | Key-person loss (Vendor or Overclock) | Organizational | Both | Because current-chain semantics knowledge concentrates in a few Overclock engineers and target designs in a few Vendor leads, key-person loss may occur mid-program, causing schedule slip and fidelity loss in ported semantics. | M | M | 4 | Counterpart staffing of at least 2 FTE (A-03); this document set maintained as the knowledge-transfer artifact; pairing and rotation on critical components; contractual Vendor bench depth (11). | Backfill plan; schedule re-baseline at the next gate. | PMO | Attrition notices; single-owner components in the 11 RACI. | 11, 13; A-03 |
| R-29 | Budget overrun / scope creep (REQ churn) | Schedule | Both | Because a 12-month dual-path program with a 15-document specification invites requirement churn, uncontrolled scope growth may occur, causing budget overrun and milestone slip. | H | M | 6 | Change control per README (stable REQ IDs, withdrawn-not-renumbered); PMO change board; payment gates bound to fixed milestone scope (11); Gate 0 retires one path's build scope. | Contingency-reserve drawdown per §6.3 rules; descope negotiation at gates against an out-of-scope backlog. | PMO | Change-request rate; earned-value variance per milestone. | 11, 13 |
| R-30 | Cosmos-fork dependency decay before halt | Technical | Both | Because akashnet-2 runs on Akash-maintained forks of cosmos-sdk, CometBFT, and gogoproto while engineering attention shifts to the target chain, an upstream CVE or consensus bug may land with no staffed maintainer, causing an under-resourced emergency patch on the old chain before halt. | M | M | 4 | Named old-chain maintenance owner through H (A-01); security-patch-only policy from G2; upstream advisory monitoring; old-chain maintenance budget line in 11. | Emergency patch via the existing upgrade/height-patch machinery; governance-approved accelerated halt if catastrophic. | OPL | Upstream CVE announcements; fork divergence from upstream security branches. | 01, 06, 10; A-01 |
| R-31 | Audit-finding cascade delays the launch gate | Schedule | Both | Because two independent audits cover novel high-value components (claims, escrow, BME), material findings are near-certain and remediation/re-audit cycles may stack, causing slip of the audit-complete launch gate (G3). | H | M | 6 | Shift-left internal security reviews and audit-readiness checks; component-staged audits with claims first (longest pole); re-audit windows pre-booked with both firms; finding-severity SLAs per 08. | Reduce launch scope to audited components; publish a revised timeline at the gate. | VSL | Open critical/high finding count vs remediation burn-down. | 08, 09, 10, 11 |
| R-32 | SDL/manifest hash drift discovered late | Technical | Both | Because provider manifest validation depends on canonical serialization and hashing (ADR-002: manifest version = SHA-256 of sorted JSON) while the deployment hash field moves to a new chain encoding, a cross-stack serialization divergence may surface only in late end-to-end testing, causing launch-blocking integration failures. | M | M | 4 | Golden-vector corpus of recorded mainnet manifests and hashes run in CI across provider daemon, Console, and SDKs from G1 (09); SDL and serialization libraries frozen (A-10, D-09); cross-language hash conformance suite. | Fast provider-daemon hotfix (off-chain component, quick iteration); temporary dual-serialization acceptance shim. | VEL | Conformance-suite failures; testnet manifest rejection rate. | 01, 07, 09; D-09, A-10 |
| R-33 | Unclaimed-funds policy legal challenge | Legal | Both | Because sweeping unclaimed funds to the community treasury after the 2-year window touches abandoned-property and consumer-protection law across jurisdictions, legal challenges may occur years later, causing forced window extension or clawback exposure. | L | M | 2 | Counsel opinion before G2 shapes the final policy (Q-02); policy published in claim terms up front; conservative default (extend before sweep) if the opinion is adverse. | Governance-approved window extension; segregated holdback of contested amounts. | LC | Counsel opinion; claim-rate telemetry approaching window end. | 05; D-05, Q-02 |
| R-34 | Claim phishing / fake claim portals | Security | Both | Because the 2-year claim window requires holders to sign claim payloads naming a recipient address, and every precedent migration attracted imitation sites and wallet-drainer campaigns, fake claim portals impersonating the official one may occur, causing individual holders to sign entitlements to attacker recipients and reputational damage to the program. | H | M | 6 | Single canonical portal domain published in every governance proposal, exchange notice, and wallet integration; official-domain signing and comms discipline (no intermediate link domains); the signed ADR-036 payload binds root, claims address, and recipient, and the portal renders the recipient exactly as signed with clipboard-mismatch warnings ([05](./05-token-migration.md) §4.3, REQ-TOK-020/024); look-alike-domain and drainer-kit monitoring with takedown retainers from S1−30d; wallet-partner verified-domain allowlists. | Rapid takedown escalation (registrars, wallet blocklists, search/ad providers); incident comms per [10](./10-rollout-and-cutover.md) §6.3; support playbook for affected holders (losses are scoped to the signing holder by design, never to the distribution). | OCL | Registered look-alike domains; user phishing reports; wallet-drainer telemetry referencing the claim flow. | 05, 08, 10; D-05, Q-10 |
| R-35 | Residual-distribution ledger disputes (weekly root challenges) | Operational | Both | Because weekly residual roots are computed off-chain from old-chain exports and any party can recompute them during the ≥48h public dispute window, a substantiated root challenge (or a flood of bad-faith ones) may occur, causing halted weekly distributions, provider payouts delayed beyond the ≤7-day lag commitment, and contested wind-down accounting. | M | M | 4 | Dual-implementation byte-equality gate before every publication ([06](./06-state-and-data-migration.md) §4.1); published inputs + recompute script per root (REQ-TOK-036); staffed objection channel with disputes scoped to reproducible discrepancies ([05](./05-token-migration.md) §6.3 / REQ-TOK-037, [06](./06-state-and-data-migration.md) §4.3); a dispute halts only the affected cycle (REQ-ROL-034). | Re-run and publish a corrected superseding root (never mutate); the next cycle absorbs the delay; PMO comms on the revised cycle calendar. | VEL | Objection reproducing a discrepancy; cycle export→distribution lag exceeding 96h (REQ-STA-030). | 05, 06, 10; D-05, Q-18 |

---

## 3. Top risks

### 3.1 Heat map

Rows = likelihood, columns = impact. Cells list R-IDs (35 open risks as of 2026-08-10).

| Likelihood \ Impact | L (1) | M (2) | H (3) |
|---|---|---|---|
| **H (3)** | R-18 | R-12, R-17, R-29, R-31, R-34 | none |
| **M (2)** | R-10, R-21 | R-05, R-06, R-07, R-08, R-09, R-11, R-13, R-16, R-24, R-25, R-26, R-28, R-30, R-32, R-35 | R-01, R-02, R-03, R-04, R-14, R-15, R-19, R-27 |
| **L (1)** | none | R-33 | R-20, R-22, R-23 |

No risk currently scores 9 (Critical). Thirteen risks score 6 (High); §3.2 ranks them, with ties broken
by (a) irreversibility of the consequence, (b) proximity to the next gate, (c) mitigation leverage.

### 3.2 Top-10

| Rank | ID | Title | Score | Why ranked here |
|---|---|---|---|---|
| 1 | R-01 | Claims-program exploit | 6 | Irreversible loss of migrated supply; exposed for the full 2-year window |
| 2 | R-02 | Snapshot conservation mismatch | 6 | Single-event S1; irreversible once mints begin |
| 3 | R-03 | Escrow parity defect | 6 | Continuous fund flows through re-implemented core logic |
| 4 | R-04 | BME CR manipulation | 6 | Economic attack surface on the highest-complexity ported component |
| 5 | R-19 | Governance rejection / split | 6 | The one program-stopping risk; nearest in time (pre-G0) |
| 6 | R-15 | Provider re-registration no-show | 6 | Launch is dead on arrival without the supply side |
| 7 | R-14 | Validator attrition C→H | 6 | Wind-down integrity; blocks residual distributions and S2 |
| 8 | R-12 | Exchange coordination slippage | 6 | Highest-likelihood market risk; multi-year tail per precedent |
| 9 | R-17 | Demand-side pause | 6 | High-likelihood revenue erosion across the whole program year |
| 10 | R-29 | Scope creep / budget overrun | 6 | Near-certain churn pressure; erodes every workstream |

Just below the line, still High and steering-visible: **R-27** (claims-portal regulatory: held out
because counsel engagement before G2 is already committed via Q-10 and the design is non-custodial by
construction), **R-31** (audit cascade: the accepted schedule cost of the security posture; buffers
in 10/11 exist specifically to absorb it), and **R-34** (claim phishing: losses are scoped to the
signing holder by design; treatment is comms discipline, official-domain signing, and takedown
operations rather than protocol code).

### 3.3 Mitigation investment: top 5

**R-01. Claims-program exploit.** This receives the largest single security investment in the program.
The claims program custodies, in effect, the entire float; the Helium and Render precedents show the
claims machinery is where value concentrates for years. Both independent audits cover it in full;
Merkle-proof verification and double-claim prevention get property-based and, where tractable, formal
treatment; the mint authority is constrained by construction to roots committed at S1/S2 so whole bug
classes are unrepresentable; a supply-conservation monitor compares cumulative mints against committed
totals in real time with an auto-pause threshold; and it anchors the top bug-bounty tier per
[08](./08-security-and-audits.md).

**R-02. Snapshot conservation.** S1 is a one-shot, irreversible event, so the mitigation buys
redundancy and public verifiability rather than speed: two independently written export/transform
pipelines must produce byte-identical Merkle output; at least three full dry-runs against mainnet
exports are gated in [09](./09-testing-and-verification.md); and the root plus a per-address balance
explorer are published for a community challenge window before the first mint. The conservation
equation (claims + Wind-down Reserve = old-chain supply, per denom) is the acceptance criterion in
[05](./05-token-migration.md).

**R-03. Escrow parity.** The escrow engine is where tenant and provider money moves every hour, and
its Cosmos semantics are idiosyncratic (FIFO depositors, grant-restore on refund, overdrawn debt
accounting, AKT fallback). The investment is a differential replay harness: recorded akashnet-2
escrow/settlement histories are replayed against the target implementation with equivalence assertions,
plus an invariant suite. This harness is also the parity evidence used at the launch gate, so the spend
does double duty as acceptance tooling.

**R-04. BME manipulation.** The BME port carries over the defenses that exist today (CR circuit
breaker at 9500/9000 bps, mint spread, MinMint, epoch batching) and adds per-epoch volume caps and
staleness/confidence gating on Pyth reads, because target-chain latency characteristics differ from
EndBlocker execution. A dedicated economic red-team exercise (simulated oracle-latency and
thin-liquidity attacks against a forked deployment) is budgeted in [08](./08-security-and-audits.md).

**R-19. Governance rejection.** Mitigation here is mostly sequencing and comms, cheap relative to
consequence: a non-binding signal proposal runs before G0 so the program never mobilizes against a
hostile community; the validator recognition program (Q-13) is designed *before* the binding vote so
the constituency with the most to lose sees its treatment first; and this document set is published for
review so the vote is on a concrete, criticizable plan rather than a narrative.

---

## 4. Category posture rollup

**Technical (8 risks).** Posture is parity-first: differential replay against recorded mainnet
behavior, dual-implementation of the S1 transform, and golden-vector conformance suites, per
[09](./09-testing-and-verification.md). Platform risks (Alpenglow, congestion, rent) are absorbed by
schedule buffers and by design decisions already fixed (D-23 per-entity sharding and close-and-refund).
The two fidelity risks (R-02, R-03) carry the deepest verification spend.

**Security (6 risks).** Posture leans on dual audits + the parity harness + staged authority: every
privileged path (claims mint, upgrades, treasury) sits behind multisig-plus-timelock (D-11, D-15) with
launch-phase governance guardrails, monitoring with auto-pause on conservation breaches, an economic
red-team for BME, and a bounty program, all specified in [08](./08-security-and-audits.md). The
concentration point is the claims program (R-01); the user-side surface (R-34 claim phishing) is
treated with official-domain signing and takedown operations rather than protocol code.

**Market (8 risks).** The largest aggregate likelihood mass sits here, and treatments are coordination
and incentives rather than code: the exchange playbook per precedent, provider migration incentives,
tenant credits, and competitor-aware positioning. Every market risk has a measurable leading indicator
(venue commitments, re-registration rate, deployment rate) reviewed at gates so adoption risk surfaces
early rather than at launch.

**Operational (7 risks).** Posture is liveness engineering: redundant cranks/keepers with fallback
operators, contracted RPC/indexer redundancy, oracle staleness gating with an integration-ready
secondary, and validator backstops. The deliberately short 90-day wind-down (D-08, D-18) bounds
old-chain operational exposure by construction; residual-root disputes (R-35) halt only the affected
weekly cycle by design.

**Legal (2 risks).** Counsel is engaged before G2 on both fronts (claims portal Q-10, unclaimed funds
Q-02). The design keeps claims non-custodial and the portal separable from the protocol, so legal
restrictions degrade convenience, not solvency, and never strand funds.

**Schedule (2 risks).** Posture is gate discipline: fixed milestone scope behind payment gates,
a PMO change board, pre-booked re-audit windows, and a contingency reserve sized in
[11](./11-scope-of-work.md). Schedule risks are reported monthly against earned-value and burn-down
indicators.

**Organizational (2 risks).** Governance approval is front-loaded (signal vote before G0) with the
validator constituency addressed first; knowledge concentration is treated by contractual counterpart
staffing (A-03) and by maintaining this document set as the transfer artifact.

---

## 5. Killed-risk log

Risks are never deleted or renumbered. When a risk is retired, its row moves here with the closing
evidence. Kill reasons: **mitigated-out** (score reduced to Low and the exposure window closed),
**expired** (exposure window passed without occurrence), **superseded** (merged into another R-xx),
**path-descoped** (Gate 0 retired the path; expected for all SOL- or EVM-scoped rows). Killing a High
or Critical risk requires PMO sign-off at a monthly or gate review.

| ID | Title | Final score | Killed at (date / gate) | Reason | Evidence |
|---|---|---|---|---|---|
| none | (none at v0.9) | none | none | none | none |

---

## 6. Escalation, acceptance, and risk budget

### 6.1 Acceptance authority

| Band | Score | Default treatment | Acceptance authority | Reporting |
|---|---|---|---|---|
| Critical | 9 | Mitigate or stop the affected workstream | Not acceptable. The steering committee (composition per the [11](./11-scope-of-work.md) RACI) MUST approve a treatment plan; convened within 5 business days of the risk being scored 9 | Immediate notification, then weekly until reduced to ≤ 6 |
| High | 6 | Mitigate | Acceptance (proceeding without further mitigation) REQUIRES steering-committee sign-off, recorded as a decision in [13](./13-open-questions-and-assumptions.md) | Monthly steering report |
| Medium | 3–4 | Mitigate or accept | PMO, with documented rationale in this register | Monthly PMO review |
| Low | 1–2 | Accept and monitor | Risk owner | Gate reviews |

### 6.2 Gate rules

A gate review (G0–G5, per [10](./10-rollout-and-cutover.md)) MUST NOT pass while:

1. any open risk scores 9; or
2. any High (6) risk lacks either a funded mitigation plan or a recorded steering-committee acceptance; or
3. any trigger in this register has fired without a completed re-score.

Cutover-critical gates additionally verify the specific gate criteria delegated to them by rows above
(R-07 stability buffer, R-14 validator commitments, R-15 re-registration threshold, R-12 venue
commitments).

### 6.3 Risk budget and contingency reserve

The reactive side of this register is funded by the **contingency reserve** established in
[11. Scope of work](./11-scope-of-work.md); proactive mitigations are funded in baseline workstream
budgets. Rules:

1. Owners of High/Critical risks maintain an expected-cost estimate (likelihood-band midpoint ×
   cost-if-realized), refreshed at the monthly review.
2. The sum of expected costs of open High/Critical risks MUST remain within the remaining contingency
   reserve. If projected to exceed it, the PMO MUST re-baseline (descope, add budget, or obtain
   steering-committee acceptance) before the next gate.
3. Any single reserve drawdown exceeding 25% of the remaining reserve REQUIRES steering-committee
   approval in advance.
4. Every drawdown is recorded in this file against the triggering R-xx, with amount and date.
5. Reserve consumption is reported at every gate alongside the re-scored register.

---

## Cross-references

- [13. Open questions & assumptions](./13-open-questions-and-assumptions.md): D/A/Q items linked throughout; new decisions arising from risk treatment are appended there.
- [10. Rollout & cutover](./10-rollout-and-cutover.md): gates G0–G5, cutover runbook, and the contingency runbooks R-07/R-14 rely on.
- [11. Scope of work](./11-scope-of-work.md): contingency reserve, RACI (steering committee, owner roles), budget lines named in mitigations.
- [08. Security & audits](./08-security-and-audits.md): audit plan, key management, incident response, monitoring behind R-01, R-03, R-04, R-22, R-23, R-31.
- [09. Testing & verification](./09-testing-and-verification.md): parity harness, dry-runs, conformance suites cited as mitigations.
- [05. Token migration](./05-token-migration.md) / [06. State & data migration](./06-state-and-data-migration.md): claims, conservation accounting, wind-down mechanics underlying R-01, R-02, R-13, R-14, R-21.
- [07. Off-chain & clients](./07-offchain-and-clients.md): indexer, relayer, provider tooling behind R-05, R-06, R-15, R-25, R-32.

## Feeds into

- [10. Rollout & cutover](./10-rollout-and-cutover.md): gate reviews consume the re-scored register and §6.2 gate rules.
- [11. Scope of work](./11-scope-of-work.md): contingency-reserve sizing and the change-board process take input from §6.3 and R-29.
- [00. Executive summary](./00-executive-summary.md): top-10 snapshot (§3.2).
- Monthly PMO operations: this file is the working register of record; Vendor assumes its maintenance at kickoff.
