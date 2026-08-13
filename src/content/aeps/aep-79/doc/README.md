# Akash Network: Chain Migration Program (Cosmos SDK → Solana / Ethereum)

| | |
|---|---|
| **Program** | Akash chain migration (working title: "Akash 3.0") |
| **Doc set ID** | AKASH-MIG |
| **Version** | 0.9 (draft for review) |
| **Date** | 2026-08-10 |
| **Owner** | Overclock Labs |
| **Audience** | Executing developer agency ("the Vendor"), Akash core team, community reviewers |
| **Status** | Target selection open; decided at Gate 0 (see [10](./10-rollout-and-cutover.md)) |

## What this is

This document set specifies, to execution depth, the migration of the Akash Network protocol from its
sovereign Cosmos SDK Layer-1 chain (`akashnet-2`) to one of two target ecosystems:

- **Path A (Solana)**: the Akash marketplace re-implemented as a suite of
  Solana programs on Solana mainnet.
- **Path B (Ethereum)**: the Akash marketplace re-implemented as EVM contracts, default variant on an
  existing EVM L2 (host chain selected against the criteria in [04](./04-ethereum-architecture.md);
  candidates include Base, Arbitrum One, and Robinhood Chain), non-default variant as a dedicated
  Arbitrum Orbit rollup.

Both paths are specified fully enough to execute. The comparative analysis lives in
[02. Target selection](./02-target-selection.md); the final choice is a client decision at **Gate 0**
and does not block Vendor mobilization on shared workstreams (token migration design, indexing,
off-chain adaptation layers).

This document set is the successor to, and supersedes where in conflict, the earlier
[`RFP_SHARED_SECURITY.md`](../README.md) exploration (shared security within Cosmos),
which is retained in the option analysis as the stay-Cosmos baseline.

## Document map

Read in numeric order for full context; role-based shortcuts below.

| # | Document | Contents |
|---|---|---|
| 00 | [Executive summary](./00-executive-summary.md) | Drivers, candidate targets, migration shape, effort at a glance |
| 01 | [Current architecture](./01-current-architecture.md) | Akash on Cosmos SDK today: modules, state, transactions, escrow mechanics, parameters, off-chain seams |
| 02 | [Target selection](./02-target-selection.md) | Option space, analysis, Gate 0 |
| 03 | [Solana target architecture](./03-solana-architecture.md) | Programs, accounts/PDAs, instructions, settlement cranks, fees, governance, oracles |
| 04 | [Ethereum target architecture](./04-ethereum-architecture.md) | Contracts, existing-L2 variant vs dedicated-rollup variant, host-chain criteria, gas abstraction, governance |
| 05 | [Token migration](./05-token-migration.md) | AKT supply accounting, snapshot, claims, staking/vesting/IBC handling, exchanges, emissions |
| 06 | [State & data migration](./06-state-and-data-migration.md) | What migrates vs winds down, export/transform tooling, verification, archives |
| 07 | [Off-chain services & clients](./07-offchain-and-clients.md) | provider-services adaptation, Console/API, indexers, SDKs, wallets, provider auth |
| 08 | [Security & audits](./08-security-and-audits.md) | Threat model, key management, upgrade authority, audit plan, bug bounty |
| 09 | [Testing & verification](./09-testing-and-verification.md) | Test strategy, testnets, load targets, migration dry-runs, acceptance criteria |
| 10 | [Rollout & cutover](./10-rollout-and-cutover.md) | Phases, gates, cutover runbook, rollback, old-chain sunset |
| 11 | [Scope of work](./11-scope-of-work.md) | Workstreams, deliverables, milestone sequence, effort estimates, team, RACI, acceptance gates |
| 12 | [Risk register](./12-risk-register.md) | Risks with likelihood/impact/mitigation/owner |
| 13 | [Open questions & assumptions](./13-open-questions-and-assumptions.md) | Decision log (D-xx), assumptions (A-xx), open questions (Q-xx) |
| 14 | [Appendix: protocol mapping](./14-appendix-protocol-mapping.md) | Exhaustive Cosmos→Solana→EVM mapping of every message, query, state object, event, parameter; glossary |

### Reading paths by role

- **Agency engagement lead / PM**: 00 → 02 → 11 → 10 → 12 → 13.
- **Protocol engineer (target chain)**: 01 → 14 → 03 or 04 → 05 → 06 → 08 → 09.
- **Off-chain / infra engineer**: 01 (§ off-chain seams) → 07 → 09 → 10.
- **Security lead**: 03/04 → 08 → 05 → 10.
- **Akash community reviewer**: 00 → 02 → 05 → 10 → 13.

## Conventions used throughout

1. **RFC-2119 keywords.** MUST/SHALL/SHOULD/MAY are normative obligations on the Vendor unless a
   different actor is named.
2. **Requirement IDs.** Normative requirements are numbered `REQ-<AREA>-NNN` (e.g. `REQ-SOL-014`) and
   are stable: they will be referenced in the contract, test plans, and acceptance reviews. Areas:
   GEN (program-wide), SOL, EVM, TOK (token), STA (state migration), OFF (off-chain), SEC, TST, ROL
   (rollout), SOW.
3. **Decision / assumption / question / risk IDs.** `D-xx` (decisions made), `A-xx` (assumptions to
   validate), `Q-xx` (open questions with owners), `R-xx` (risks). All indexed in
   [13](./13-open-questions-and-assumptions.md) and [12](./12-risk-register.md).
4. **Event notation.** Protocol events are sequenced relative to `C` (cutover = S1) and `H`
   (halt/snapshot = S2), e.g. `H+90d`, `S1−24h`; gates `G0–G5` order the program. Calendar planning
   (dates, durations, milestones-with-dates) is intentionally excluded from this technical set.
5. **Code citations.** References like `x/escrow/keeper/keeper.go:210` point into
   [`akash-network/node`](https://github.com/akash-network/node) at the commit current on 2026-08-10;
   protobuf type references point into `akash-api` (`pkg.akt.dev/go`).
6. **Ecosystem facts.** Statements about Solana/Ethereum mainnet capabilities are stated "as of
   2026-08". The Vendor MUST re-verify time-sensitive facts (versions, fees, feature status) at kickoff;
   [13](./13-open-questions-and-assumptions.md) lists the ones we consider volatile.

## Status & change control

- This set is a **draft for internal and community review**. Nothing here is a governance decision;
  on-chain governance approval of the migration itself is a precondition tracked in
  [10](./10-rollout-and-cutover.md).
- Changes flow via pull request to this directory. Each merged revision bumps the version in each
  affected file's metadata table. Requirement IDs are never renumbered; superseded requirements are
  marked `[WITHDRAWN]` in place.
- Questions from prospective Vendors should be filed as issues referencing doc + requirement IDs.
- The `internal/` subdirectory holds program planning and communications material (calendars,
  dated milestones, payment schedules, comms plans) relocated out of this set; it is **not part of
  the vendor technical package** and is excluded from the doc map above.
