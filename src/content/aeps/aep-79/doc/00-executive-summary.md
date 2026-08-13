# 00. Executive Summary

| | |
|---|---|
| **Document** | 00. Executive summary |
| **Doc ID** | AKASH-MIG-00 |
| **Version** | 0.9 (draft for review) |
| **Date** | 2026-08-10 |
| **Owner** | Overclock Labs |
| **Audience** | Everyone: start here |
| **Status** | Informative summary of the normative set |

## Purpose

A ten-minute orientation to the entire migration program: why Akash is leaving its sovereign Cosmos
SDK chain, where it is going, how the move works, what it costs, and what could go wrong. Every claim
here is elaborated in a numbered document ([README](./README.md) has the map).

## In scope

- Drivers, candidate targets, migration shape, program plan, effort, top risks, all summarized.

## Out of scope

- Normative requirements (live in docs 02–11); rationale detail (02, 13).

---

## 1. What this program is

Akash Network operates a decentralized compute marketplace: tenants deploy containerized workloads
(defined in SDL manifests) and independent providers bid to host them, with payments streaming
through on-chain escrow. Today the protocol runs as its own Cosmos SDK Layer-1 (`akashnet-2`),
secured by ~100 validators bonding AKT, and has evolved a sophisticated on-chain economy: a
dual-token system (AKT plus ACT, an oracle-priced compute-credit token minted against AKT through a
collateralized burn-mint engine), streaming escrow with multi-depositor support, provider
attestation, and an on-chain Pyth price feed hosted in CosmWasm.

This program migrates the protocol (its marketplace logic, tokens, balances, and community) onto
one of two candidate execution layers, **Solana** or **Ethereum (an existing EVM L2)**, retiring the sovereign
chain. This document set carries both paths at identical, execution-ready depth. The full analysis is
[02. Target selection](./02-target-selection.md); the target is selected at **Gate 0** on the
evidence of a kickoff verification sprint.

## 2. Why

1. **Capital efficiency:** AKT bonded for consensus security does nothing for the marketplace.
   Inherited security frees it for provider incentives and liquidity.
2. **Operational overhead:** Akash maintains forks of cosmos-sdk, CometBFT and gogoproto, a
   16-upgrade release history, validator coordination, and an entire CosmWasm subsystem whose only
   production job is importing Pyth prices. On the targets, most of this apparatus ceases to exist
   rather than being re-hosted.
3. **Scale with cost predictability:** marketplace operations (orders, bids, settlements, BME
   swaps) are chatty; both targets price this at ≤$0.01/op with 10–100× headroom.
4. **Distribution:** users, wallets, stablecoins, DeFi, and, on Solana, the entire DePIN category
   (Helium, Render, io.net, Hivemapper) are already there. Meanwhile the Cosmos ecosystem is
   consolidating (Noble's exit to its own EVM L1 in Mar 2026 being the sharpest recent signal).

Akash pays sovereign costs without using sovereign powers: the codebase survey
([01](./01-current-architecture.md)) found no consensus-level customization the marketplace actually
depends on. That asymmetry is the case for leaving.

## 3. Where: two candidate targets

The protocol will run on one of two targets. Both are specified to the same execution-ready depth,
and the choice between them is made at **Gate 0**, on the evidence collected during the kickoff
verification sprint (decision D-01; the evidence items are listed in
[02 §4.2](./02-target-selection.md)). All work before Gate 0 is target-neutral.

**Path A: Solana mainnet** ([03](./03-solana-architecture.md)). What it offers:

- The DePIN category is concentrated there, along with the two closest precedent migrations:
  Helium's full L1 sunset (2023, healthy three years on) and Render's token move.
- Fees (~$0.001 per transaction, median) and 100M-CU blocks comfortably absorb a chatty
  marketplace.
- Pyth is native, so the current CosmWasm-hosted oracle apparatus disappears instead of being
  rebuilt.
- Token-2022 expresses ACT's non-transferability directly at the mint level.

**Path B: Ethereum, as contracts on an existing EVM L2** ([04](./04-ethereum-architecture.md)). The
specific host chain is selected per Q-42; candidates include Base, Arbitrum One, and Robinhood
Chain. What it offers:

- The deepest engineering, audit, and tooling market of any ecosystem.
- Enterprise credibility and exchange-affiliated distribution funnels.
- Commodity infrastructure for claims, vesting, and governance, giving this path the lowest
  execution novelty.

A dedicated rollup (Arbitrum Orbit) is specified as a variant of Path B but is not a default path:
operating one would re-create the burden this migration exists to eliminate (D-02).

## 4. How: the migration shape

Five structural decisions define the mechanics (full log:
[13](./13-open-questions-and-assumptions.md)):

1. **Rebuild, don't port bytes.** The marketplace programs/contracts re-implement current semantics
   exactly (order→bid→lease flow, streaming escrow, ACT pricing, reclamation windows, SDL
   untouched), verified by a differential-testing harness that replays recorded mainnet histories
   through the new implementation ([09](./09-testing-and-verification.md)).
2. **Dual snapshot, no bridge (D-05).** At cutover **S1**, all liquid AKT/ACT balances, vesting
   schedules, and (as liquid) staked positions become claimable on the target chain via Merkle
   proofs signed with existing Cosmos keys. Exchanges swap custodial balances in bulk at S1, while
   self-custody claims open after a ~7-day public verification of the snapshot root (D-05.b).
   Funds locked in protocol accounts (escrow, BME vault, community pool, IBC escrows) back a
   **Wind-down Reserve** on the target chain.
3. **90-day wind-down, workloads never stop (D-08).** The old chain stops accepting new deployments
   at S1 but keeps settling existing leases for 90 days. Providers' old-chain earnings and tenants'
   refunds during this window are paid out in new-chain AKT via **weekly residual distributions**
   from the reserve. At halt **S2**, a final distribution closes the books; supply conservation is
   machine-verifiable end-to-end.
4. **The token economy ports whole (D-19/D-20/D-12).** ACT remains a non-transferable compute
   credit; the BME engine (queued AKT↔ACT swaps, collateral-ratio circuit breaker, Pyth-priced)
   becomes a program/contract with permissionless crank execution. Sovereign inflation ends at S1;
   a reduced, DAO-governed emissions schedule redirects to provider incentives and the treasury
   (curve to be modeled; Q-01).
5. **Identity and trust re-anchor (D-10/D-11).** Providers re-register on the new chain (with
   collateral) before S1; auditors re-attest; the on-chain x509 registry is replaced by JWT auth
   against on-chain registered keys. Governance moves to Realms+Squads (Solana) or
   Governor+Safe+timelock (EVM), with program upgradeability behind multisig+timelock and a
   published path to immutability.

What each constituency experiences:

- **Tenants:** existing leases run untouched through wind-down; new deployments go to the new chain
  from day one; Console abstracts most of the difference; SDL files unchanged.
- **Providers:** one daemon upgrade + one re-registration before S1; old-chain earnings arrive
  weekly in new-chain AKT during wind-down.
- **AKT holders:** exchange balances swap automatically; self-custody holders claim with their
  existing keys (2-year window); stakers are credited liquid at S1; vesting continues on schedule.
- **Validators:** the role ends at S2; a wind-down incentive (reserved at S1) pays for keeping the
  chain healthy through the transition (Q-13).

## 5. Program plan & effort

Phases P0–P7 across gates G0–G5 ([10](./10-rollout-and-cutover.md)): mobilization & verification →
design freeze → build → testnet + audits → rehearsals + binding governance approval → **S1 cutover**
→ 90-day wind-down → **S2** + sunset + hypercare. This set sequences work by gates and protocol
events (C, H) only; calendar planning is maintained separately and is not part of this technical
package.

Vendor scope ([11](./11-scope-of-work.md)) is structured as target-neutral **Stage A** (verification
sprint, tokenomics modeling, migration-engine design, prototypes) and single-path **Stage B** after
Gate 0, across nine workstreams (protocol, migration engine, off-chain/clients, security, QA,
launch ops, docs). Planning estimate: **142–200 person-months**, team of ~8–12 FTE plus audit
firms, with Overclock counterpart staffing of ≥2 FTE engineering plus product/comms/governance.
Four migration rehearsals (R1–R4, ending with a final dress at S1−14d) on forked mainnet state and two
independent snapshot implementations
are non-negotiable quality gates; client-side budget lines (audits, bounty pool, RPC/infra opex,
exchange coordination) are itemized separately.

## 6. Top risks (register: [12](./12-risk-register.md))

1. **Claims contract as honeypot:** it briefly custodies rights to essentially the entire supply;
   mitigated by dual audits, dual-implementation root verification, staged authority, pause-without-
   blocking-withdrawals design.
2. **Escrow/BME parity defects:** money-losing behavioral drift vs the current chain; mitigated by
   the differential-replay harness and invariant fuzzing.
3. **Exchange coordination slippage:** precedent (Render) shows multi-month tails; mitigated by
   early venue engagement and S1 gating on venue commitments covering ≥70% of volume.
4. **Provider/validator attrition during wind-down:** mitigated by incentives reserved at S1 and
   weekly payout cadence.
5. **Host-chain events in our window:** Solana's Alpenglow consensus upgrade lands ~Q3–Q4 2026;
   buffer in schedule + a Gate 0 evidence item.

## 7. What this document set asks of you

- **Akash community:** review 02 (the choice), 05 (your tokens), 10 (the timeline), 13 (what's still
  open); the signal proposal follows this review cycle.
- **Prospective Vendor:** respond against [11](./11-scope-of-work.md) with per-workstream approach,
  team, and per-milestone pricing; every normative obligation carries a stable `REQ-*` ID for
  traceability from proposal through acceptance.
- **Overclock/core team:** validate assumptions A-01..A-13, staff the counterpart roles, and own the
  governance and exchange tracks.

## Cross-references

- [README](./README.md): document map and conventions.
- [02](./02-target-selection.md): full option analysis behind §3.
- [05](./05-token-migration.md) / [06](./06-state-and-data-migration.md): the mechanics behind §4.
- [11](./11-scope-of-work.md): the commercial ask behind §5.

## Feeds into

The community signal proposal (Gate 0) and Vendor RFP distribution.
