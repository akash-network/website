# 02. Target Selection: Option Space & Analysis

| | |
|---|---|
| **Document** | 02. Target selection |
| **Doc ID** | AKASH-MIG-02 |
| **Version** | 0.9 (draft for review) |
| **Date** | 2026-08-10 |
| **Owner** | Overclock Labs |
| **Audience** | Akash leadership & community, Vendor engagement lead |
| **Status** | Analysis; target selected only at Gate 0 |

## Purpose

Establish the option space for Akash's execution environment after leaving its sovereign Cosmos SDK
chain, evaluate the options against weighted criteria derived from the migration drivers, and define
the evidence framework by which the target is selected at Gate 0 (D-01). This document exists so that
Gate 0 is a decision over evidence, not a debate over vibes.

## In scope

- Migration drivers and the requirements they impose on a target (REQ-GEN-001..020).
- Option space: Solana mainnet; an existing EVM L2; dedicated Arbitrum Orbit rollup; Ethereum L1; SVM L2;
  stay-Cosmos with shared security; status quo.
- Gate 0 evidence items and the Gate 0 process.

## Out of scope

- The target designs themselves: [03](./03-solana-architecture.md) and
  [04](./04-ethereum-architecture.md).
- Token migration mechanics: [05](./05-token-migration.md).
- Ecosystem facts are used as of 2026-08 and re-verified at kickoff
  ([13 §4](./13-open-questions-and-assumptions.md)).

---

## 1. Why migrate at all

The drivers, updated from the earlier shared-security exploration
([`RFP_SHARED_SECURITY.md`](../README.md)) with what the codebase survey
([01](./01-current-architecture.md)) established:

1. **Capital efficiency.** Sovereign PoS ties a large share of AKT into validator bonding purely to
   secure consensus. That capital does nothing for the marketplace. On a shared chain, security is
   inherited and AKT becomes available for provider incentives, liquidity, and growth programs.
2. **Operational and engineering overhead.** Running a sovereign chain means owning the full
   consensus stack. Concretely, today Akash maintains **forks of cosmos-sdk, CometBFT, and gogoproto**
   (RESEARCH: `go.mod` replaces all three), a bespoke upgrade-plugin system with a 16-upgrade history,
   validator coordination for every release, snapshot/state-sync infrastructure, and an in-house
   oracle path (CosmWasm-hosted Pyth contracts) that shared chains provide natively. This is a
   permanent tax paid in the scarcest resource: core-team engineering time.
3. **Scale headroom with cost predictability.** Marketplace activity (orders, bids, per-lease
   settlement, BME swaps) is chatty. The target must absorb 10–100× current activity at fees that
   round to zero against lease value.
4. **Distribution, liquidity, and ecosystem gravity.** This is the driver a shared-security
   arrangement inside Cosmos could never solve. AKT's users (tenants buying compute, providers
   earning, holders) should live where wallets, stablecoins, DeFi, and retail attention already are.
   The Cosmos ecosystem is consolidating: the 2025–26 period saw Kujira, Comdex, Picasso, Quasar and
   Evmos wind down, Neutron exit ICS, and **Noble, the Cosmos-native stablecoin chain, leave for its
   own EVM L1 (mainnet 2026-03-18)**. Leaving is now a well-trodden path; staying has network-effect
   costs that compound.
5. **Developer surface area.** Rust/Anchor and Solidity talent pools dwarf Cosmos SDK talent. The
   protocol's contribution funnel widens on either target.

**The counter-example is real:** dYdX continues to operate successfully as a sovereign Cosmos
appchain (v8.2, Jul 2026). Sovereignty works when an orderbook needs custom block processing.
Akash's marketplace does not require consensus-level customization. Nothing in
[01](./01-current-architecture.md) needs its own chain: no custom ante handling, no vote extensions,
no per-block sweeps (escrow settlement is lazy), and the one consensus-adjacent component (the
oracle) is a workaround for not having Pyth natively. Akash pays sovereign costs without using
sovereign powers. That asymmetry is the case for migration.

## 2. What the target must provide

Normative requirements a candidate target must satisfy. These bind the evaluation, and re-verifying
them at kickoff is the first Vendor task ([11](./11-scope-of-work.md), WS0).

**REQ-GEN-001** The target SHALL sustain ≥50 marketplace transactions/second sustained and ≥500 tx/s
burst headroom without protocol-level congestion pricing exceeding $0.05/tx median (methodology in
[09](./09-testing-and-verification.md)).

**REQ-GEN-002** Median all-in transaction cost for simple marketplace operations SHALL be ≤$0.01 at
evaluation-date conditions.

**REQ-GEN-003** The target SHALL have production Pyth price feeds (pull model) or an equivalent
first-party oracle with sub-minute freshness for AKT/USD (D-13 dependency; BME cannot run without it).

**REQ-GEN-004** At least one natively-issued stablecoin with deep liquidity SHALL be available on
the target; the settlement-stablecoin asset is selected per Q-43 (USDC is a candidate) and is a
configurable protocol parameter (D-14).

**REQ-GEN-005** The target's canonical token standard SHALL be supported by the top-10 AKT trading
venues and at least two qualified custodians (validated via Q-04/Q-05).

**REQ-GEN-006** Mature DAO governance and multisig/timelock tooling SHALL exist in production use by
≥3 comparable protocols (D-11).

**REQ-GEN-007** At least two independent production-grade indexing paths SHALL exist (D-16).

**REQ-GEN-008** The target SHALL have ≥99.5% trailing-24-month liveness, with any full-halt incidents
publicly post-mortemed.

**REQ-GEN-009** Deterministic finality or effective confirmation ≤5s for marketplace UX flows.

**REQ-GEN-010** Fee currency abstraction (users transacting without pre-holding the gas asset) SHALL
be achievable: fee-payer/relayer (Solana) or ERC-4337/EIP-7702 paymaster (EVM).

**REQ-GEN-011** A precedent SHALL exist of a comparable protocol migrating onto the target at
comparable scale (de-risks mechanics: claims, exchange swaps, community outcomes).

**REQ-GEN-012** The target's runtime SHALL support the protocol's isolation needs: per-entity state
(D-23), program-enforced token restrictions for ACT (D-19), and secp256k1 signature verification for
Cosmos-key claims ([05](./05-token-migration.md)).

**REQ-GEN-013** Vendor talent availability: ≥3 credible audit firms and a hiring market for the
target's core language.

**REQ-GEN-014** No structural dependency on a single commercial entity for chain operation
(sequencer/validator diversity), or, where one exists (L2 sequencers), a published decentralization
roadmap and forced-inclusion escape hatch.

**REQ-GEN-015** The all-in protocol cost of the chain (rent/storage, revenue shares, license fees)
SHALL be modelled at current, 3× and 10× load before Gate 0 sign-off.

## 3. Option space

| # | Option | One-line description | Status |
|---|---|---|---|
| A | **Solana mainnet** | Programs on Solana L1 | **Candidate path A (D-01; selected at Gate 0)** |
| B1 | **Existing EVM L2** | EVM contracts on an established general-purpose L2; host chain selected per Q-42 (candidates: Base, Arbitrum One, Robinhood Chain) | **Candidate path B (D-01; selected at Gate 0)**; fully specified in [04](./04-ethereum-architecture.md) |
| B2 | Dedicated Arbitrum Orbit chain | Own EVM rollup, AKT as gas | Specified as variant in [04](./04-ethereum-architecture.md); non-default (D-02) |
| B3 | Ethereum L1 | Contracts directly on mainnet | Rejected |
| C | SVM L2 (Eclipse/Termina-class) | Own SVM chain or shared SVM L2 | Not a candidate; noted as future option |
| D | Stay Cosmos: ICS/shared security | Consumer chain of the Hub (prior RFP) | Superseded |
| E | Status quo | Remain sovereign | Baseline for comparison |

### 3.1 Option A: Solana mainnet

**For.** (i) *Category gravity:* Solana is the de-facto DePIN settlement layer (50+ projects,
~$3.5B combined market cap, with Helium, Render, io.net, Nosana, Hivemapper resident). The "DePIN
belongs on Solana" narrative is empirically strong and directly aids BD, listings, and integrations.
(ii) *Precedent:* Helium executed the only fully successful sovereign-L1-sunset-into-L1 at scale
(2023) and is thriving three years later; Render executed the token/coordination migration. Their
playbooks (snapshot+claims, lazy claim distribution, crank automation via Tuk Tuk) de-risk exactly the
mechanics in [05](./05-token-migration.md)/[06](./06-state-and-data-migration.md). (iii) *Fee/latency
fit:* median tx ≈$0.0008; blocks now 100M CU (SIMD-0286, 2026-07); the entire marketplace write-load
is a rounding error at current scale. (iv) *Runtime fit:* Pyth is native (the current chain already
built a whole CosmWasm subsystem just to import Pyth; that subsystem simply disappears, D-22);
Token-2022 gives ACT's non-transferability as a mint-level property (D-19); fee-payer services give
gasless UX (REQ-GEN-010). (v) *Distribution:* the largest retail wallet population and stablecoin
velocity outside Ethereum, native stablecoin issuance (e.g. USDC, PYUSD), deep AKT-relevant DeFi
for liquidity programs.

**Against / risks.** (i) *Alpenglow:* the largest consensus rewrite in Solana's history is expected
to activate inside our program window (Q3–Q4 2026), a real, bounded schedule/stability risk (A-13,
R-linked in [12](./12-risk-register.md)). (ii) *Token-2022 exchange support* is good but not
universal; D-03 carries a legacy-SPL fallback. (iii) *State rent:* ~6,960 lamports/byte makes naive
state porting expensive (≈$1.2/KB at SOL $150); D-23's close-and-refund lifecycle and (optionally)
ZK compression neutralize this, but it constrains design. (iv) *Competitive adjacency:* io.net (100k+
GPUs) is resident and will contest the narrative (also an argument that the demand is there).
(v) *Validator concentration trend* (~840 validators, consolidating) is a fair criticism opponents
will raise; client diversity (Firedancer ~40% of stake incl. Frankendancer) is the counterpoint.

### 3.2 Option B1: an existing EVM L2

Path B deploys the contract suite on an established general-purpose EVM L2. The specific **host
chain** is deliberately not fixed here: [04 §1](./04-ethereum-architecture.md) defines chain-neutral
selection criteria (native stablecoin issuance, production Pyth pull feeds, ERC-4337 paymaster and keeper-automation
coverage, fee targets, Stage 1+ rollup maturity with forced inclusion, commercial-policy stability,
RPC/indexer depth), and the host is chosen per Q-42 with the Gate 0 evidence pack. Current
candidates: Base, Arbitrum One, and Robinhood Chain (an Arbitrum Orbit-based chain launched Jul 2026
with brokerage-scale distribution). Base and Arbitrum One clear the criteria as of 2026-08;
Robinhood Chain requires criteria verification at kickoff (young chain; stablecoin, oracle, and
account-abstraction coverage to confirm per Q-42).

**For.** (i) *EVM everything:* the deepest talent pool, audit market, and tooling maturity
(Foundry/OZ); enterprise perception. (ii) *Performance is now adequate across mature L2s:* complex
interactions cost $0.01–0.05; post-Fusaka blob capacity (14/21) keeps L2 costs trending down; some
candidates add fast preconfirmations (e.g. Flashblocks on Base, ~200ms). (iii) *Distribution and
integration:* natively-issued stablecoins are first-class on the major L2s, and some candidates carry
exchange-affiliated funnels (e.g. Base's Coinbase on-ramp and custody path). (iv) All EVM claims
tooling (Merkle distributors, vesting, governance) is commodity.

**Against / risks.** (i) *Someone else's chain, visibly:* today's general-purpose L2s are
single-sequencer systems operated by commercial entities. For an infrastructure protocol whose brand
is decentralized cloud, the optics and the structural dependency both matter (REQ-GEN-014 partially
satisfied: Stage 1 with forced inclusion across the candidates; decentralization roadmaps slower
than promised). (ii) *Policy flux:* L2 commercial postures move (example: Base announced its
Superchain exit in Feb 2026, with consequences still settling); host-chain selection weighs policy
stability, and the suite stays portable EVM so the host can change before G1 at bounded cost.
(iii) *No DePIN cluster:* the category's liquidity, integrations, and precedent migrations are
elsewhere. (iv) L1-anchored finality for withdrawals is irrelevant to our no-bridge design but
shapes exchange integration lead times.

### 3.3 Option B2: Dedicated Arbitrum Orbit chain

AKT as the gas token, full sovereignty over blockspace, AEP terms (10% of net protocol revenue).
Excluded as a candidate by D-02: it re-creates the operational burden (sequencer ops, DA choices,
upgrade trains, RaaS vendor management) that driver #2 exists to eliminate, adds bridge/liquidity
fragmentation UX, and its ecosystem gravity is only what Akash brings. It is retained fully-specified
as the escape hatch if an existing-chain path fails on costs or policy (revisit trigger Q-06).
OP Stack was rejected for this variant: custom gas tokens are deprecated in the spec (ETH-only fees)
and Superchain commercial terms are in flux post-Base-exit.

### 3.4 Option B3: Ethereum L1

At Aug 2026 gas (0.08–0.23 gwei) L1 is cheap; but the 2026 record still shows 5–40 gwei spikes under
load, and a marketplace that must submit bids and settlements continuously cannot price its UX off
the calm days. Blob economics don't help non-rollup apps. Rejected on REQ-GEN-001/002 robustness;
revisit only if the marketplace's write pattern changes fundamentally.

### 3.5 Option C: SVM L2 / network extension

Eclipse (mainnet since Nov 2024, 1,000+ TPS sustained) and Termina-class SVM rollups make "own SVM
chain" real in 2026, and Grass shows a DePIN peer going that way. But every example is young, the
operational burden returns (driver #2), and none of the distribution benefits of Solana mainnet
apply. Excluded as a candidate; noted as a plausible *future* scaling/sovereignty move that the Solana
program suite (03) would port to with minimal change (a cheap option to hold).

### 3.6 Option D: Stay Cosmos with shared security (prior RFP)

The ICS consumer-chain path solves part of driver #1 (bonding) and little of driver #2 (still a
chain to run, now with a partner's release train too), and none of driver #4. Since that RFP was
drafted, the ground shifted: Neutron exited ICS for sovereignty, the consumer-chain roster shrank,
and the ecosystem's own stablecoin hub left entirely. IBC Eureka (live to Ethereum since 2025-04) is
excellent transitional plumbing ([05](./05-token-migration.md) uses it as an optional rail on the
Ethereum path), but it is a bridge, not a demand engine. Superseded by this program; the RFP document
remains in-repo as the record of that analysis.

### 3.7 Option E: Status quo

Zero migration risk; all four drivers unaddressed and compounding (fork maintenance alone is a
growing liability as upstream Cosmos consolidates). Baseline, not a plan.

## 4. Gate 0 selection

### 4.1 D-01: two candidate paths, one selection at Gate 0

Both candidate paths clear the §2 requirements as of 2026-08. They differ in the *kind* of strength
they offer, and Gate 0 weighs verified evidence of each:

- **What weighs toward A (Solana):** the DePIN category and both relevant migration precedents live
  there (Akash would follow a proven playbook into its own buyer/seller ecosystem rather than
  pioneering into an empty one); runtime fit removes whole subsystems (the CosmWasm/oracle apparatus)
  rather than re-hosting them; fee/latency characteristics fit a chatty marketplace with the most
  headroom.
- **What weighs toward B1 (existing EVM L2):** the deepest engineering, audit, and tooling market;
  enterprise perception and exchange-affiliated distribution funnels (e.g. Base's Coinbase
  relationship, Robinhood Chain's brokerage funnel); commodity claims, vesting, and governance
  infrastructure; the lowest execution novelty of any option.

[03](./03-solana-architecture.md) and [04](./04-ethereum-architecture.md) are maintained at the same
specification depth deliberately: it keeps Gate 0 a real decision and keeps Vendor bids honest on
both paths.

### 4.2 Gate 0 evidence items

**REQ-GEN-016** The kickoff verification sprint SHALL re-test each evidence item and present results
at Gate 0:

1. Token-2022 acceptance across venues covering ≥80% of AKT volume fails AND the legacy-SPL fallback
   (D-03) is judged to materially harm the ACT design (D-19 depends on Token-2022
   non-transferability; fallback = program-ledger ACT, acceptable but weaker wallet UX).
2. Alpenglow rollout enters a visibly unstable period (halts, rollbacks) with no credible
   stabilization before our P3 testnet phase.
3. Two or more top-5 AKT venues state they cannot support a Solana-chain swap on our timeline but
   can support an EVM one.
4. The Q-15 provider-daemon prototype reveals integration costs on Solana exceeding the EVM path by
   >50% effort with no mitigation.
5. Every candidate host chain fails the [04 §1](./04-ethereum-architecture.md) chain criteria on
   commercial-policy stability or infrastructure coverage (native settlement stablecoin, Pyth, keeper/paymaster
   support) as re-verified at kickoff (Q-42).
6. The EVM claims-verification gas benchmark and paymaster viability at projected claim volumes miss
   the [04](./04-ethereum-architecture.md) targets with no mitigation.

Gate 0 selects the path whose verified evidence pack is stronger. A failed viability check on either
path moves the selection to the other, with Stage A work carrying over intact (the migration engine,
tokenomics model, and off-chain adapter design are target-neutral by construction).

### 4.3 Gate 0 process

**REQ-GEN-017** Gate 0 SHALL comprise: (i) publication of the kickoff verification report
(evidence items + volatile-fact re-verification per [13 §4](./13-open-questions-and-assumptions.md));
(ii) a community signal proposal on `akashnet-2` presenting this document and the verification
report; (iii) leadership/steering sign-off recorded in the decision log; (iv) Vendor Stage B
authorization for exactly one path. Gate 0 closes phase P0
([10](./10-rollout-and-cutover.md)).

**REQ-GEN-018** No Stage B (single-path) implementation work SHALL begin before Gate 0; Stage A
work SHALL be limited to target-neutral deliverables plus the two prototype spikes (Q-15 Solana
daemon integration; EVM claims-verification gas benchmark).

**REQ-GEN-019** The Gate 0 decision SHALL be recorded as a resolution of D-01 in
[13](./13-open-questions-and-assumptions.md) with the evidence pack linked, and the not-selected
architecture document SHALL be marked `[ALTERNATE - NOT SELECTED]` in its metadata table but
retained in the set.

**REQ-GEN-020** The community signal proposal SHALL disclose, plainly: the end of sovereign staking
(and validator income), the claims process obligations on holders, the wind-down timeline for live
leases, and the point of no return (S1), with no ambiguity about irreversibility.

## 5. What Akash gives up, stated honestly

1. **Sovereign blockspace and upgrade authority.** Protocol changes become program upgrades gated by
   our own governance (D-11/D-15), but consensus-level evolution belongs to the host chain.
2. **Validator community.** ~100 validator operators lose an income stream and a role; the program
   owes them a respectful wind-down (Q-13, [06](./06-state-and-data-migration.md) §validator
   continuity) and, where possible, a future as providers, RPC operators, or crank runners.
3. **IBC nativeness.** Cosmos-side AKT and integrations require the explicit handling in
   [05](./05-token-migration.md); ongoing Cosmos interop becomes bridge-mediated (or IBC Eureka on
   the Ethereum path).
4. **The "own chain" narrative.** Akash's story changes from "sovereign appchain" to "protocol on
   the best venue for its users." The drivers in §1 are the argument that this is a trade up.

## Cross-references

- [00. Executive summary](./00-executive-summary.md): condensed version of this analysis.
- [03](./03-solana-architecture.md) / [04](./04-ethereum-architecture.md): the two target designs.
- [13](./13-open-questions-and-assumptions.md): D-01/D-02 entries, evidence-linked questions
  (Q-04, Q-05, Q-06, Q-15).
- [12](./12-risk-register.md), risks cited: Alpenglow window, Token-2022 gaps, exchange slippage,
  competitive adjacency.

## Feeds into

Gate 0 (via [10](./10-rollout-and-cutover.md)); Vendor Stage A scope ([11](./11-scope-of-work.md));
the community signal proposal.
