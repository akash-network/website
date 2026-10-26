# 13. Open Questions, Assumptions & Decision Log

| | |
|---|---|
| **Document** | 13. Open questions, assumptions & decision log |
| **Doc ID** | AKASH-MIG-13 |
| **Version** | 0.10 (draft for review) |
| **Date** | 2026-10-20 |
| **Owner** | Overclock Labs |
| **Audience** | All program participants |
| **Status** | Living document: single index for D/A/Q items referenced across the set |

## Purpose

Every consequential judgment in this document set is recorded here in one of three forms so the Vendor
never has to guess what is settled and what is not:

- **Decisions (D-xx)**: made, with alternatives considered and rationale. Build on these; reopening one
  requires client sign-off and a version bump across affected docs.
- **Assumptions (A-xx)**: believed true and load-bearing; each has a validation step. If one fails, the
  named docs must be revisited.
- **Open questions (Q-xx)**: genuinely unresolved, each with an owner and a needed-by milestone.

## In scope

- Program-wide decisions, assumptions, questions.
- The list of time-sensitive ecosystem facts the Vendor must re-verify at kickoff.

## Out of scope

- Risks with likelihood/impact treatment: see [12. Risk register](./12-risk-register.md).
- Requirement statements: those live in their home documents as `REQ-*`.

---

## 1. Decision log

Statuses: **Fixed** (design-level decision, stable), **Open (G0)** (selected at Gate 0),
**Provisional** (best current answer; revisit at the named gate), **Core team selection** (chosen by
the core team; confirmed at the named gate), **Superseded** (replaced, wholly or for the part named,
by the decision named in the status; the entry stays in place for traceability and is never
renumbered). Statements withdrawn inside an entry are marked WITHDRAWN in place, naming the superseding
decision, with the original text kept.

| ID | Decision | Status |
|---|---|---|
| D-01 | Target selection: two candidate paths, Solana mainnet (A) and an existing EVM L2 (B), specified to equal execution depth; selected at Gate 0 on the evidence items in [02 §4.2](./02-target-selection.md) | Core team selection: A (Solana); confirmed at G0 when the migration proposal passes |
| D-02 | No new sovereign chain on either path (Solana mainnet; an existing EVM L2 for the Ethereum path, host chain per Q-42; Arbitrum Orbit as the specified non-default dedicated-rollup variant) | Fixed |
| D-03 | AKT on Solana: Token-2022 mint, 6 decimals, metadata extension only, no transfer hook, no freeze authority | Provisional (GT) |
| D-04 | AKT on EVM: OpenZeppelin ERC-20, 6 decimals, EIP-2612 permit | Fixed |
| D-05 | Migration mechanism: dual snapshot, S1 (liquid supply, at cutover C) + weekly residual distributions during wind-down + S2 (residuals, at halt H=C+90d); Merkle claims + exchange swaps; no persistent bridge | Superseded for liquid AKT by D-25; remainder under review (Q-50) |
| D-06 | Bonded/unbonding AKT credited as liquid at S1 incl. accrued rewards; vesting re-created with same end dates | Superseded by D-25 (vesting: Q-45) |
| D-07 | IBC-out AKT: pre-snapshot return campaign + bounded foundation-operated redemption window | Provisional (G1); amended by D-25 (holders return IBC AKT to akashnet-2, then migrate) |
| D-08 | No cross-VM migration of live marketplace state; 90-day wind-down of leases on old chain (C→H), old-chain earnings honored via weekly residual distributions | Fixed; residual payout mechanism under review (Q-50) |
| D-09 | Marketplace semantics preserved: order→bid→lease flow, SDL unchanged, dseq/gseq/oseq UX retained | Fixed |
| D-10 | x/cert x509 registry not ported; provider auth via JWT + on-chain registered signing keys | Fixed |
| D-11 | Governance: Realms DAO + Squads v4 + timelock (Solana) / OZ Governor + AkashTimelock + Safe (EVM) | Provisional (G1) |
| D-12 | Sovereign inflation ends at halt; replacement emissions to provider-incentive pool + community treasury per modeled schedule | Fixed (curve open: Q-01); timing amended by D-25.b |
| D-13 | Price oracle: Pyth pull feeds | Fixed |
| D-14 | Lease settlement in a natively-issued, deeply-liquid stablecoin (the settlement stablecoin) first-class alongside AKT; asset selected per Q-43 (USDC a candidate), configurable, no hard dependency on a single issuer | Fixed |
| D-15 | Programs/contracts launch upgradeable behind multisig + timelock, published path to immutability/on-chain-governed upgrades | Fixed |
| D-16 | Indexing: dedicated indexer (Geyser/webhooks → Postgres on Solana; Ponder-class on EVM) serving existing Console API shapes | Fixed |
| D-17 | provider-services gets a Go chain-adapter interface; Solana impl pairs Go client reads with a co-located signing/tx service; EVM impl via abigen | Provisional (G1) |
| D-18 | Sunset: cutover C (=S1) stops new marketplace writes via sunset upgrade (msg filter + min-gas raise); halt H (=S2) = C+90d; archives published; infra decommission H+90d | Fixed |
| D-19 | ACT ported as first-class asset: Solana Token-2022 NonTransferable mint (protocol moves = burn/mint CPIs); EVM restricted ERC-20; lease pricing stays ACT-denominated | Fixed |
| D-20 | BME engine ported: queued epoch-batched AKT↔ACT swaps, CR circuit breaker (9500/9000 bps defaults), mint spread, vault seeded from migrated bme module account; epochs become time-based, executed by permissionless cranks (Solana) / keeper automation (EVM) | Fixed |
| D-21 | Escrow streaming ports on a per-second time basis (converted from per-block at S1); fully lazy settlement + permissionless settle; FIFO multi-depositor, overdrawn, and AKT-fallback semantics preserved; authz deposit grants become an on-chain delegated-deposit allowance with restore-on-refund | Fixed |
| D-22 | No general-purpose smart-contract platform carried over: CosmWasm existed to host Pyth plumbing; targets read Pyth pull feeds directly; awasm filter layer has no successor | Fixed |
| D-23 | Market state sharded per entity (one account/PDA or struct per deployment/group/order/bid/lease); accounts closed + rent refunded at terminal state; history lives in the indexer (events are the system of record); no global order-book account (Solana 12M CU/account cap) | Fixed |
| D-24 | Provider-initiated lease reclamation windows (min 1h / max 720h) port 1:1 | Fixed |
| D-25 | One-way migration portal for AKT: AKT launches as an SPL token on Solana mainnet at L = V + 7d, and a portal opened at L mints SPL AKT 1:1 against AKT removed from circulation on `akashnet-2` (mechanism per Q-44); replaces S1 snapshot claims and exchange bulk swaps for AKT in user accounts; staked AKT unbonds, then migrates; portal window 2 years from L (D-25.a); `akashnet-2` inflation ends at C (D-25.b); GT passes before the migration proposal is submitted (D-25.c) | Fixed (2026-10-20, core team), subject to the migration proposal |

### Decision details

**D-01. Target selection: two candidate paths, selected at Gate 0.**
*Alternatives considered:* (a) selecting a single target now, before kickoff verification; (b) building
both paths through implementation and deciding late (cost-prohibitive); (c) stay on Cosmos with shared
security (the [`RFP_SHARED_SECURITY.md`](../README.md) path); (d) status quo.
*Rationale:* Solana mainnet and the Ethereum path (an existing EVM L2) both clear the target requirements of
[02 §2](./02-target-selection.md) as of 2026-08 and are specified to equal execution depth in
[03](./03-solana-architecture.md)/[04](./04-ethereum-architecture.md). The factors weighing toward
each differ in kind. Solana: DePIN category concentration (Helium, Render, io.net, Nosana,
Hivemapper), two completed precedent migrations, fee/latency fit for a chatty marketplace, runtime
fit (native Pyth; Token-2022 non-transferability for ACT); Ethereum/EVM L2: engineering/audit market
depth, enterprise perception, exchange-affiliated distribution (e.g. Base's Coinbase funnel),
commodity claims/vesting/governance tooling. Selection happens at Gate 0 against the [02 §4.2](./02-target-selection.md) evidence items
and is an Akash community/leadership decision, not a Vendor decision.
*Update (D-25, 2026-10-20):* path A (Solana) is the core team's selection. Gate 0 confirms it when the
migration proposal passes on `akashnet-2`; the resolution of D-01 is recorded then (REQ-GEN-019).

**D-02. No new sovereign chain.**
*Alternatives:* dedicated OP Stack rollup; Arbitrum Orbit chain; SVM L2 (Eclipse/SOON-class); Solana
network extension. *Rationale:* migration driver #2 is eliminating consensus/infra operational burden;
operating a rollup (sequencer, DA posting, fault-proof ops, upgrade trains) re-creates that burden in a
different shape. Deploying onto a shared chain maximizes the point of leaving Cosmos. The dedicated
rollup is retained as variant B2 in [04](./04-ethereum-architecture.md) with an explicit revisit
trigger (Q-06).

**D-03. AKT as Token-2022, no exotic extensions.**
*Alternatives:* legacy SPL token (maximum compatibility); Token-2022 with transfer hooks (protocol fee
capture at token layer). *Rationale:* metadata extension removes the Metaplex dependency; hooks and
permanent delegate materially degrade exchange/DeFi compatibility and are unnecessary because take
fees are enforced in the escrow program (see [03](./03-solana-architecture.md)), not at the token
layer. Provisional pending Q-05 (custody/exchange support matrix for Token-2022 as of kickoff); the
fallback is a legacy SPL mint with Metaplex metadata, which changes no other design element.
*Amended by D-25:* SPL AKT launches at L, so D-03 (Token-2022 or legacy SPL) is decided with the
exchange and custodian survey (Q-05) before GT passes; status Provisional (GT).

**D-04. ERC-20 with 6 decimals.**
*Alternatives:* 18 decimals (EVM convention). *Rationale:* 1:1 micro-unit parity with `uakt` removes an
entire class of rounding/accounting defects in claims and reconciliation; USDC (6 decimals) proves
ecosystem tooling handles it fine.

**D-05. Dual snapshot + claims; no persistent bridge.**
**[WITHDRAWN: superseded by D-25]** for liquid AKT in user accounts: the one-way portal replaces S1
snapshot claims and exchange bulk swaps for that AKT. The module-account reserve, residual
distributions and S2 parts below are under review (Q-50), because AKT on `akashnet-2` stays
redeemable through the portal after S1 and does not lose its value there.
*Alternatives:* single snapshot at halt (leaves the new-chain marketplace without AKT for 90 days, or
forces a hard stop of running workloads); Render-style burn-and-mint window (requires live validation
of the old chain for the whole window and real bridge infrastructure); indefinite two-way bridge
(permanent security liability). *Rationale:* S1 at cutover moves the liquid supply when exchanges and
holders need it (the day the new-chain marketplace opens) while funds locked in module accounts
(escrow, BME vault, community pool, IBC escrows) are reserved on the target chain and paid out as the
old chain's wind-down resolves them: weekly interim residual Merkle distributions during C→H (so
providers receive old-chain lease earnings in new-chain AKT with ≤1 week lag), and a final S2
distribution at halt. This bounds scope (no bridge), keeps supply conserved and auditable
(liquid@S1 + reserved@S1 = total; reserved is fully allocated by S2), and follows the Helium
precedent for the snapshot/claims machinery. Details in [05](./05-token-migration.md).

**D-06. Bonded AKT goes liquid.**
**[WITHDRAWN: superseded by D-25]** Bonded and unbonding AKT is not credited at S1: holders unbond
(14-day unbonding period) and then migrate through the portal; staking keeps securing `akashnet-2`
and earning rewards until C. Vesting re-creation is reopened as Q-45.
*Alternatives:* forced re-lock into new-chain governance staking; honoring residual unbonding periods
post-migration. *Rationale:* bonding existed to secure consensus that no longer exists post-migration;
carrying lock state across adds claims complexity for no security benefit. New-chain incentives (D-12)
attract voluntary participation instead. Vesting is different: it encodes contractual obligations, so
it is re-created (see [05](./05-token-migration.md) §vesting).

**D-07. IBC-out AKT handling.**
*Alternatives:* trust-minimized claims against counterparty-chain snapshots (requires per-chain proof
tooling for Osmosis/Hub/etc.; disproportionate engineering); ignoring stranded vouchers
(unacceptable, breaks holders). *Rationale:* drive supply home before snapshot via a coordinated
campaign with wallets/DEX frontends, then operate a bounded, published redemption process for
stragglers from reserved supply. Legal review required (Q-03, Q-10).
*Amended by D-25:* holders return IBC AKT to `akashnet-2`, then migrate it through the portal.
Treatment of vouchers still out at H: Q-46.

**D-08. Wind-down instead of live-state migration.**
*Alternatives:* trustless re-creation of live leases on the target chain (cross-VM state proofs,
oracle-attested workload liveness; the riskiest component of the whole program for marginal benefit);
hard cutover with forced lease termination on day one (interrupts running workloads, worst tenant
experience). *Rationale:* leases are finite-lived and expire naturally; a 90-day wind-down lets
workloads either conclude or redeploy on the new chain on the tenant's schedule. Escrow refunds on the
old chain are automatic at close, and both refunds and provider withdrawals during C→H are made whole
in new-chain AKT via the weekly residual distributions (D-05). Providers re-register on the new chain
immediately at launch, so supply is live before demand cuts over. The sunset upgrade at C restricts
the old chain to wind-down message types (settle/withdraw/close/top-up/BME burn) and raises min-gas
to deter spam on a chain whose gas token has just lost claim value. Details in
[06](./06-state-and-data-migration.md).
**Under review (D-25, Q-50).** With AKT on `akashnet-2` redeemable through the portal, the premise
that the old chain's gas token "has just lost claim value" at C is
**[WITHDRAWN: superseded by D-25]**, and the residual payout mechanism above must be re-checked for
double-counting before G1.

**D-19/D-20. ACT and the BME engine port.**
The current protocol prices every lease in ACT (`uact`), a bank-transfer-disabled compute token
minted/redeemed against AKT through the burn-mint-escrow module at oracle prices with a
collateral-ratio circuit breaker. This is core protocol economics, not incidental plumbing, so both
target architectures carry it: ACT keeps its non-transferability (Solana: Token-2022 NonTransferable
extension with burn/mint at protocol boundaries; EVM: transfer-restricted ERC-20), and the BME queue +
CR breaker + spread logic becomes a program/contract whose epoch execution is driven by permissionless
cranks or keeper automation instead of EndBlocker. *Alternative considered:* collapse ACT into
pure-AKT pricing as part of the migration; rejected: it would bundle a tokenomics redesign into an
already-large program and invalidate current-chain behavior parity testing (see
[09](./09-testing-and-verification.md)).

**D-21. Escrow time basis.**
Current escrow rates are per-block (6.5 s target). Blocks are not a stable time unit on either target,
so rates convert to per-second at a fixed factor at S1. Settlement stays lazy (computed on
interaction), with an explicitly permissionless settle entrypoint so cranks/providers can force
overdrawn detection, replacing the implicit guarantee that Cosmos EndBlocker-era code got from
running settle inside consensus. FIFO depositor refunds and grant-restore-on-refund semantics are
preserved because Console fee-sponsorship flows depend on them.

### Amendments from the v0.9 drafting round

Ratified refinements produced while drafting docs 03–12; each extends (never contradicts) its parent
decision. Detail lives in the named documents.

- **D-02.a**: Variant B2 concretized: Arbitrum Orbit **L3 on Arbitrum One**, AnyTrust DA, AKT +
  MigrationClaims on the parent chain with a WAKT gas wrapper on-chain. The B1 host chain is not
  fixed: it is selected per Q-42 against the chain criteria in 04 §1, and the contract suite stays
  portable EVM so the host can change before G1 at bounded cost.
- **D-04.a**: AKT (EVM) includes ERC20Votes with the timestamp clock mode (AkashGovernor
  dependency) (04).
- **D-05.a**: **[WITHDRAWN: superseded by D-25]** for the token: the token's point of no return is
  L (once SPL AKT is minted there is no reversal); C remains the marketplace's point of no return.
  Original text: Point of no return = execution of S1 itself (sunset-upgrade activation at C + start of
  exchange custodial swaps). The later attested-root publication + claims opening (D-05.b) is the
  final verification milestone, after which no accounting adjustment to the S1 distribution is
  possible. Abort paths exist only pre-S1: expedited cancellation proposal to ≈S1−36h, then
  coordinated validator skip-upgrade to S1−6h (10 §6).
- **D-05.b**: **[WITHDRAWN: superseded by D-25]** (AKT in user accounts moves through the portal from
  L, with no S1 claim and no verification window). Original text: Claims-open sequence: S1 root computed and published ≤24 h after C; **7-day public
  verification window** (dual-implementation match + community recomputation) before the root is
  armed; self-custody claims open ≈C+8–10 d. Exchange custodial swaps execute at S1 and are NOT
  gated on this window (05/06/10).
- **D-05.c**: **Under review (D-25, Q-50).** With AKT on `akashnet-2` redeemable through the portal,
  this rule must be re-checked for double-counting before G1. Anti-duplication rule: supply is fixed at S1. Post-S1 old-chain mints (inflation, BME
  mints) carry zero claim value; post-S1 inflows into reserved module accounts are claim-inert; escrow
  residual credits are FIFO-attributed and capped at each account's S1 principal (via
  `Depositor.Height`), which makes the Wind-down Reserve sufficient by construction and blocks
  self-lease duplicate-mint attacks (05 §5, 06 §3). Comms must state plainly that post-S1 escrow
  top-ups spend already-credited AKT.
- **D-06.a**: **[WITHDRAWN: superseded by D-25]** (staking earns rewards on `akashnet-2` until C,
  and holders unbond, then migrate through the portal; nothing is folded into S1 leaves). Original
  text: "Rewards up to halt" is implemented as rewards-to-C in the S1 leaves; C→H staking
  yield is not honored individually; the validator/delegator wind-down budget (Q-13) is the
  compensation channel for C→H service (05).
- **D-10.a**: Provider identity splits into a cold owner authority plus rotating registered operator
  hot keys, with provider TLS SPKI hashes anchored in the registry record. JWT claims schema carries
  over with identical access levels and scopes; signature algs: EdDSA (Solana) / EIP-191 secp256k1 +
  ERC-1271 (EVM); dual issuance modes (offline-signed token, SIWS/SIWE challenge) (07 §3).
- **D-11.a**: EVM launch Governor parameters: quorum default 10% of supply (no clean equivalent of
  Cosmos 20%-of-bonded; calibration = Q-23) (04).
- **D-13.a**: **Oracle keep-alive C→H:** the sunset upgrade's allow-list retains
  `MsgExecuteContract` pinned to the Pyth contract plus `MsgAddPriceEntry`, and Overclock operates
  the Hermes price pusher until H; otherwise BME enters `halt_oracle`, which would block ACT→AKT
  refunds and the escrow AKT-fallback during wind-down (06 §5).
- **D-16.a**: API versioning: `/v1` frozen serving old-chain archive shapes (bech32, hex tx hashes);
  `/v2` target-native with a `chain_id` discriminator (07 §4).
- **D-18.a**: Sunset upgrade named `v3.0.0-sunset` (S1 height = first block with timestamp ≥ the
  governance-approved instant, fixed in the software-upgrade proposal at S1−21d); halt implemented as
  no-binary upgrade `v3.1.0-halt` at H+1, H = last committed block = S2 export height; S2 performs a
  final virtual settlement of still-open escrow accounts (06/10).
- **D-19.a**: Escrowed ACT is burned at deposit; BME's collateral-ratio denominator = ACT mint
  supply + the program-tracked `act_escrowed` ledger (03 DELTA-12; 04 equivalent).
- **D-20.a**: BME epoch execution: permissionless cranks with tips (Solana); Chainlink Automation
  primary + Gelato secondary with permissionless entrypoints always available (EVM). Per-epoch swap
  volume caps added as a new governed parameter (value = Q-25) (03/04, R-04).
- **D-21.a**: Rates are stored as **u128 fixed-point (×10¹⁸) micro-ACT per second**; plain u64 loses
  precision on typical fractional rates. Per-block→per-second conversion at S1 is the exact rational
  ×2/13 (6.5 s blocks) (14 §7, 03/04/06).
- **D-21.b**: Delegated-deposit allowances are funded-at-grant (locked at grant), restore-on-refund,
  revoke-returns-remainder (03 DELTA-07).
- **D-23.a**: The Cosmos hook cascades (escrow→market→deployment) become guarded permissionless
  "reap" instructions/functions with a ≤60 s p95 crank SLA; losing-bid refunds execute asynchronously
  (03 DELTA-04/06).
- **D-14.a**: Settlement-stablecoin mechanism: the settlement stablecoin settles ACT-denominated
  obligations at a governed parity (`stable_act_parity_bps`, default 10000 = par; USD-denominated
  units, decimals normalized if the selected asset is not 6-decimal); pricing remains
  ACT-denominated. Asset selection = Q-43; ratification + whether BME grows a stablecoin PSM = Q-22
  (03 DELTA-08, 04).
- **Escrow bound**: `max_depositors` becomes a DAO-config parameter, initial value 16; other
  protocol bounds (groups ≤8/deployment, resource units ≤4/group, attributes ≤24, signed-by ≤4)
  validated against the mainnet SDL corpus before design freeze (03/14, A-18/Q-38).

**D-10. Drop the on-chain x509 registry.**
*Alternatives:* port x/cert as-is (on-chain certificate blobs are expensive on both targets and the
revocation UX was never good); TLS with trust-on-first-use (weakens provider authentication).
*Rationale:* the provider stack already supports JWT-based auth; anchoring provider signing keys in the
on-chain provider registry gives equivalent trust with two orders of magnitude less state. Tenant mTLS
client certificates are replaced by wallet-signed ephemeral credentials. Details in
[07](./07-offchain-and-clients.md).

**D-12. Emissions replacement.**
Sovereign inflation currently pays validators+delegators. Post-migration there are no validators to
pay. The replacement schedule (reduced gross emissions, directed to provider incentives and the
community treasury) is a tokenomics decision with a dedicated modeling deliverable in
[11. SOW](./11-scope-of-work.md) (WS-1). The Vendor implements whatever curve the model + governance
ratifies via the `akash-emissions` program / `EmissionsMinter` contract; the mechanism (timelocked,
DAO-adjustable, hard-capped) is fixed even though the curve is not.
*Timing amended by D-25.b:* the sunset upgrade at C sets `akashnet-2` x/mint inflation to zero, so
sovereign inflation ends at C rather than at halt and no AKT minted after C reaches the portal.
Whether BME may still mint AKT on `akashnet-2` after C is part of Q-50.

**D-17. Provider daemon chain adapter.**
*Alternatives:* rewrite provider-services in Rust/TS (enormous, unnecessary); pure-Go Solana
integration including tx assembly for all flows (Go SDK maturity risk for edge cases: priority fees,
lookup tables, retries). *Rationale:* an interface seam (`pkg/chain`) keeps the daemon's Kubernetes
logic untouched; reads and simple txs go through the Go client, and a small co-located signer service
(Rust or TS, gRPC, localhost-only) handles tx assembly/broadcast where Go tooling is weak. Provisional:
if kickoff evaluation shows the Go client alone is sufficient (Q-15), drop the signer service.

**D-25. One-way migration portal for AKT; token launch at L = V + 7d.**
*Status:* Fixed (2026-10-20, core team), subject to the migration proposal.

*Notation and events (used across the set):*
- **V**: the moment the migration proposal passes on `akashnet-2` (end of its voting period).
- **L**: token launch = **V + 7d**. SPL AKT mint live and portal open.
- **GT**: gate *token launch readiness* (criteria in [10](./10-rollout-and-cutover.md)). GT MUST pass
  before the migration proposal is submitted, because L follows V by only 7 days (D-25.c).
- Governance sequence on `akashnet-2`: (i) the **migration proposal** (formerly the non-binding
  "signal proposal" in P0) approves the migration to Solana and authorizes the token launch at
  L = V + 7d and the portal; quorum 20% of bonded stake, majority yes; its passage closes G0.
  (ii) The **cutover proposal** (formerly the "binding approval" or "binding proposal" in P4) fixes the
  sunset upgrade, the C height formula and H = C + 90d. (iii) The sunset upgrade proposal (S1-21d /
  C-21d), (iii-b) the halt proposal (H-21d) and (iv) emergency proposals are unchanged.
- Points of no return: **L** for the token (once SPL AKT is minted, no reversal); **C** for the
  marketplace (unchanged).
- C, H, S1 and S2 keep their meanings, but S1 no longer carries AKT held in user accounts. What S1
  and S2 still carry (protocol-held funds, ACT, residuals) is under review in Q-50.

*Decision:*
- AKT launches as an SPL token (standard per D-03) on Solana mainnet at L = V + 7d.
- A migration portal opens at L. AKT removed from circulation on `akashnet-2` is minted 1:1
  (micro-unit) to the Solana address the holder names (mechanism per Q-44). Migration is one-way;
  no program, contract or operated service provides a reverse path.
- The portal replaces S1 snapshot claims and exchange bulk swaps for AKT in user accounts
  (supersedes D-05 for liquid AKT, D-05.a for the token, D-05.b, D-06, D-06.a). Exchanges and
  custodians migrate through the portal on their own schedule.
- Bonded and unbonding AKT must be unbonded (14 days) and then migrated. Staking secures
  `akashnet-2` and earns rewards until C.
- The marketplace migrates at C under the gated plan (P1 to P7, cutover C, 90-day wind-down, halt
  H), unchanged in shape.
- Token and portal work proceeds before G0 as a single-path exception to REQ-GEN-018
  (REQ-GEN-023), so that GT can pass before the migration proposal is submitted.

*Alternatives:* keep D-05 (dual snapshot at C). *Rationale:* moves AKT to Solana at V + 7d instead of
at C, so holders, exchanges and integrations reach Solana distribution while the marketplace is still
being built, and each holder chooses when to move. *Costs accepted:* a verification path from
`akashnet-2` to Solana must run for the whole window (Q-44; this is the "Render-style burn-and-mint
window" D-05 had rejected); the old chain must stay live and secure while stake unbonds (Q-49, R-36);
two representations of AKT coexist until migration completes (R-37).

- **D-25.a**: Portal window: 2 years from L; extension only by governance.
- **D-25.b**: `akashnet-2` inflation ends at C: the sunset upgrade sets x/mint inflation to zero, so
  no AKT minted after C reaches the portal (amends D-12 timing). Whether BME may still mint AKT on
  `akashnet-2` after C is part of Q-50.
- **D-25.c**: GT (token launch readiness) passes before the migration proposal is submitted.

---

## 2. Assumptions

| ID | Assumption | Validation | If false, affects |
|---|---|---|---|
| A-01 | `akashnet-2` operates normally through the program; no upgrades that materially change state layout before halt | Coordination with core team; freeze on state-affecting upgrades from G2 | 05, 06, 10 |
| A-02 | Akash on-chain governance approves the migration (and later, the cutover, sunset and halt proposals) | Migration proposal (G0); cutover, sunset and halt proposals per [10](./10-rollout-and-cutover.md) | Entire program |
| A-03 | Overclock provides ≥2 FTE counterpart engineers + product/comms staffing for the duration | Contract/SOW ratification | 11 |
| A-04 | **[WITHDRAWN: superseded by D-25]** (replacement: A-24) ≥85–90% of circulating AKT is reachable via exchange swaps + active-wallet claims within 12 months (Helium/Render precedent) | Exchange coordination (Q-04); claims telemetry | 05, 12 |
| A-05 | Provider operators accept one daemon upgrade + one on-chain re-registration | Provider council preview; testnet incentives | 07, 10 |
| A-06 | No adversarial fork of the old chain retains economic weight post-halt | Exchange alignment on ticker/chain identity (Q-04) | 05, 10, 12 |
| A-07 | Ecosystem facts in the research pack (fees, versions, feature status) hold as of 2026-08; all volatile items re-verified at kickoff | Kickoff verification sprint (§4 list) | 02, 03, 04 |
| A-08 | At least one natively-issued, deeply-liquid stablecoin exists and is unrestricted on the selected target (true for all candidates as of 2026-08) | Kickoff verification (Q-43) | 03, 04, 05 |
| A-09 | AKT ticker is retained across venues (no rebrand) | Exchange coordination | 05 |
| A-10 | SDL and manifest semantics need no changes for the new chain (manifests never lived on-chain) | Confirmed in [01](./01-current-architecture.md) | 03, 04, 07 |
| A-11 | The existing Console/indexer API surface can be preserved for clients modulo address/tx-hash formats | 07 design review | 07 |
| A-12 | The protocol being migrated is the v2 line as at commit `096bff57` (dual-token AKT/ACT, BME, oracle, epochs, CosmWasm-hosted Pyth feed); any protocol changes shipped before G1 must be folded into [01](./01-current-architecture.md) and [14](./14-appendix-protocol-mapping.md) | Kickoff re-baseline against mainnet | 01, 03, 04, 14 |
| A-13 | Solana's Alpenglow consensus upgrade (expected Q3–Q4 2026) ships without breaking deployed program semantics; program-visible changes are limited to timing/finality characteristics | Track SIMD-0326 rollout at kickoff | 03, 12 |
| A-14 | Client renders the Gate 0 decision ≤10 business days after M1 acceptance; Stage B calendar slips day-for-day otherwise | SOW ratification | 11 |
| A-15 | Single prime Vendor; subcontractors (e.g. WS1 economist) only with client approval and prime liability | SOW ratification | 11 |
| A-16 | An `akashnet-2` archive node with full state/tx/event history since genesis is available to the Vendor (golden vectors, Q-19 pull, weekly wind-down exports) | Overclock provisions at kickoff | 06, 09 |
| A-17 | Launch multisig baseline (4-of-7, ≤2 signers per org, ≥3 jurisdictions) is an example; exact roster and thresholds fixed at G1 key ceremony | G1 ceremony | 08 |
| A-18 | Explicit protocol bounds introduced by the target designs (groups ≤8, resource units ≤4, attributes ≤24, depositors init 16, signed-by ≤4) accommodate the real mainnet SDL corpus | Corpus scan pre-design-freeze (Q-38) | 03, 04, 14 |
| A-19 | **[WITHDRAWN: superseded by D-25]** (replacement: A-24; exchanges migrate through the portal, no bulk swap or deposit cut-off at S1) Exchanges can execute Merkle claims programmatically via the Vendor-supplied integration kit; old-chain AKT deposit crediting at venues is permanently disabled at S1 | Exchange tech-pack review (Q-04) | 05, 10 |
| A-20 | provider-services Kubernetes resource naming (namespaces/ingress derived from lease IDs) does not collide across chains during the dual-stack window | Test in 09 (REQ-OFF-060) | 07, 09 |
| A-21 | `bseq` is retained as constant 0 in API shapes (current chain enforces bseq==0) and dropped from target-chain identity derivations | Parity review | 03, 04, 07, 14 |
| A-22 | The API-types module baseline is `pkg.akt.dev/go` v0.2.14 (go.mod pin); research citations against v0.3.0 module-cache paths are shape-identical | Kickoff re-baseline (with A-12/Q-19) | 01, 14 |
| A-23 | ≥2/3 of bonded voting power remains online C→H given the Q-13 incentive program (contingency: accelerate S2 from last good height) | Signed uptime commitments (Q-26) | 06, 10, 12 |
| A-24 | Exchanges and custodians migrate custodial AKT through the portal within the 2-year window and list SPL AKT (D-25) | Venue outreach (Q-04) | 05, 10, 12 |
| A-25 | Enough AKT stays bonded on `akashnet-2` through H to keep the chain live and meet the 20% quorum on the cutover, sunset and halt proposals (D-25) | Bonded-stake monitoring from V | 06, 10, 12 |

## 3. Open questions

| ID | Question | Owner | Needed by |
|---|---|---|---|
| Q-01 | Replacement emissions curve + provider-incentive budget: gross rate, decay, split, hard cap | Overclock finance + community (Vendor models) | G1 |
| Q-02 | Unclaimed-funds policy after the 2-year claim window (sweep to treasury? extend?); legal posture per jurisdiction. *Amended by D-25:* refers to residual and ACT claims only; AKT not migrated through the portal is Q-48 | Legal counsel | G2 |
| Q-03 | IBC voucher redemption: which counterparty chains to snapshot for outreach (Osmosis, Cosmos Hub, others?), redemption window length, KYC posture | Overclock + legal | G1 |
| Q-04 | Exchange coordination list, lead times, and technical requirements per venue (top ~10 by AKT volume) | Overclock BD | G1 (exchange and custodian technical notice stating L = V + 7d: GT, D-25) |
| Q-05 | Token-2022 support matrix across target exchanges/custodians as of kickoff; fallback trigger to legacy SPL (D-03) | Vendor (kickoff verification) | GT |
| Q-06 | Revisit trigger for dedicated-rollup variant B2: define the host-chain cost/throughput threshold that would reopen D-02 | Vendor + Overclock | G1 |
| Q-07 | Operational ownership post-launch: fee-sponsorship relayer, indexer, RPC; Vendor-operated, Overclock-operated, or third party (with budget) | Overclock | G2 |
| Q-08 | Provider registration collateral size and slashing conditions (partial replacement for staking-based Sybil resistance) | Protocol WG (Vendor proposes) | G1 |
| Q-09 | Old-chain archive hosting: storage vendor, retention (≥5y?), funding | Overclock | G3 |
| Q-10 | Legal review of the claims process (securities/MiCA/OFAC screening for the claim portal?). *Amended by D-25:* covers the migration portal, which opens at L, before G1 | Legal counsel | GT |
| Q-11 | Realms stock vs light fork: gap analysis for council/veto features Akash governance requires | Vendor | G1 |
| Q-12 | dseq semantics: program-maintained counter (working assumption in 03/04) vs slot-derived; confirm no tooling depends on dseq==block-height | Vendor + Console team | G1 |
| Q-13 | Validator wind-down program: recognition/incentives for `akashnet-2` validators through halt | Overclock + community | G2 |
| Q-14 | Console managed-wallet users: custodial migration mechanics and comms | Console team | G2 |
| Q-15 | Go-only Solana integration feasibility for provider daemon (drop signer sidecar?); prototype verdict | Vendor | G1 |
| Q-16 | ACT wallet presentation: token metadata (name/symbol), whether wallets should surface it at all, and how Console explains non-transferability | Console team + Vendor | G2 |
| Q-17 | Old-chain post-S1 anti-spam calibration: sunset msg allow-list contents and min-gas multiplier | Vendor + core team | G3 |
| Q-18 | Interim residual distribution cadence (weekly default) and minimum-payout threshold to keep Merkle drops economical | Vendor | G2 |
| Q-19 | Current mainnet inflation/mint parameters and vesting-account inventory (NOT in source; must be read from live akashnet-2 state export) as inputs to Q-01 modeling and 05 supply accounting; include live gov/staking/consensus params and marketplace op-mix statistics | Vendor (kickoff data pull) | G1 |
| Q-20 | Audit firm selection and budget cap (≥2 protocol firms + ≥1 migration-engine review); contracts signed by M2 | Overclock + Vendor | G1 (T1 token and portal audit firms: before GT, since those audits close at GT, D-25) |
| Q-21 | Incentivized provider-testnet rewards budget and funding source (targets: ≥25 providers, ≥3 regions, GPU presence) | Overclock | G1 |
| Q-22 | Settlement-stablecoin↔ACT parity: ratify the governed `stable_act_parity_bps` par rule (D-14.a) and decide whether BME grows a stablecoin PSM | Protocol WG (Vendor proposes) | G1 |
| Q-23 | EVM Governor quorum/threshold calibration (launch default 10% of supply; Cosmos 20%-of-bonded has no clean ERC20Votes equivalent) | Governance WG | G1 |
| Q-24 | Secondary price oracle (Switchboard-class): selection, integration readiness, and switch criteria as the Pyth fallback | Vendor | G1 |
| Q-25 | BME per-epoch swap volume caps: new governed parameter (mechanism in 03/04); value from WS1 modeling | Vendor + protocol WG | G1 |
| Q-26 | Signed validator uptime commitments covering >2/3 voting power as a cutover gate criterion: mechanism and threshold | Overclock | G2 |
| Q-27 | **[WITHDRAWN: superseded by D-25]** (exchanges migrate through the portal; venue readiness per A-24, Q-04) Which ≥2 exchange venues commit to the pre-G3 sandbox swap test | Overclock BD | G2 |
| Q-28 | Immutability burn-in duration N for claims + escrow core (default proposal: 12 months) | Steering | G2 |
| Q-29 | Claims velocity-breaker threshold (fraction of unclaimed supply per 24 h that auto-pauses claims) | Vendor + steering | G2 |
| Q-30 | Auto-pause policy: may monitors trigger a pre-authorized guardian intake pause on supply-conservation violation? | Steering | G2 |
| Q-31 | Bug-bounty platform selection and final tier sizing | Overclock | G2 (bounty covering token and portal: GT, D-25) |
| Q-32 | Economic-security firm procurement (Gauntlet-class) for the BME/emissions review | Overclock + Vendor | G1 |
| Q-33 | Claims dust threshold DUST_MIN (default 10,000 micro-units) and the legal posture for sweeping dust at tree build. *Amended by D-25:* the S1 dust threshold for AKT claims is withdrawn; applies only to claim trees that remain (Q-50) | Legal + steering | G2 |
| Q-34 | DEX liquidity seeding at launch: amounts, venue split (Raydium/Orca on Solana vs the leading DEX on the EVM host chain), LP policy; pre-authorized community-pool carve-out executable at L (D-25) | Overclock finance | GT |
| Q-35 | Disposition of non-native IBC-voucher balances (e.g. IBC USDC) still on the Akash chain at H | Overclock + legal | G3 |
| Q-36 | Signer-sidecar implementation language (Rust vs TS) and pod packaging for provider-services | Vendor (with Q-15 prototype) | G1 |
| Q-37 | Does the `akash claim` CLI need Cosmos-multisig ADR-036 signing support (tooling capability unclear in Keplr/CLI)? | Vendor | G2 |
| Q-38 | Validate A-18 bounds against the full mainnet SDL corpus; confirm `max_depositors` initial 16 | Vendor | G1 |
| Q-39 | Crank tip funding source (BME spread vs treasury) and tip rates | Vendor + protocol WG | G1 |
| Q-40 | May a provider re-bid on an order after closing its own bid (PDA/id freed)? Benign delta vs must-block (adjunct to Q-12/bseq) | Vendor | G1 |
| Q-41 | BME swap-execution pricing window: `bme` params define a 1 h oracle TWAP while `x/oracle` TwapWindow defaults to 5 s; confirm which the engine actually uses (port fidelity for D-20) | Vendor (code trace at kickoff) | G1 |
| Q-42 | EVM host-chain selection (path B): evaluate candidates (Base, Arbitrum One, Robinhood Chain, others) against the chain criteria in 04 §1; decided with the Gate 0 evidence pack if path B is selected | Overclock + Vendor | G0 |
| Q-43 | Settlement-stablecoin selection: evaluate natively-issued candidates (e.g. USDC, PYUSD, USDT where natively issued) on liquidity depth, issuer and regulatory posture, freeze/blacklist policy, decimals, and availability across both candidate paths; the asset is a configurable protocol parameter | Overclock + Vendor | G1 |
| Q-44 | Portal mechanism (D-25): how AKT leaves circulation on `akashnet-2` and how Solana verifies it before minting. Candidates: (a) send to a keyless migration address with the Solana recipient in the memo, minted against batch roots attested by 3+ independent parties (the REQ-SEC-005/006 attestation pattern); (b) an x/migrate module added by a software upgrade bundled with the migration proposal, burning on-chain, same attestation; (c) Wormhole NTT in burn-and-mint mode (adds the Wormhole guardian set as a trust root; `akashnet-2` already trusts it for Pyth, [01](./01-current-architecture.md) §5.8). Any `akashnet-2` upgrade must ride with or before the migration proposal | Overclock + Vendor security lead | GT |
| Q-45 | Unvested AKT (D-25): locked tokens in Cosmos vesting accounts cannot be transferred. Migrate as tokens vest, or re-create remaining schedules on Solana ([05](./05-token-migration.md) §5 mechanism)? | Overclock + legal | GT |
| Q-46 | IBC-held AKT (D-25): holders return it to `akashnet-2` and then migrate; treatment of vouchers still out at H (relates to D-07, Q-03, Q-35) | Overclock | G1 |
| Q-47 | AKT still on `akashnet-2` at H, whether in user accounts or still bonded or unbonding: how it reaches the portal once the chain halts. Leading candidate: include it in the S2 export and let holders claim through the portal with Cosmos-key signatures until the 2-year window ends | Overclock + Vendor (WS3) | cutover proposal (G3) |
| Q-48 | AKT not migrated when the 2-year window closes (D-25.a): extend, or sweep to treasury after legal review ([05](./05-token-migration.md) §11 policy), decided by governance | Legal + governance | 6 months before window close |
| Q-49 | Old-chain security and governance as stake unbonds to migrate: minimum bonded-stake threshold, quorum risk on later proposals, whether continuity incentives (Q-13) start before C | Overclock | G1 |
| Q-50 | Wind-down accounting under the portal model. D-05/D-08 assumed old-chain AKT has no value after S1. With the portal, AKT paid out of protocol accounts on `akashnet-2` after C (escrow withdrawals and refunds, BME redemptions, community-pool spends, deposit returns, IBC escrow releases) is portal-eligible, so the S1 Wind-down Reserve plus weekly residual distributions would double-count. Options: (a) drop the Wind-down Reserve for AKT and let the old chain pay AKT natively through H, which recipients then migrate; residual distributions remain only where still needed (ACT); (b) keep the Reserve and block AKT outflows from protocol accounts on `akashnet-2` after C via the sunset filter; (c) a hybrid per account type. Also decides ACT handling at C and BME vault seeding | Overclock + Vendor (WS3) | G1 |
| Q-51 | If the marketplace migration stops after L (the cutover proposal fails or the program aborts before C), what happens to SPL AKT and the portal? Per REQ-ROL-054 the portal stays open for its window; the marketplace stays on `akashnet-2`. Needed for disclosure in the migration proposal (REQ-GEN-021) | Overclock | GT |

Folded into existing questions during drafting: delegator coverage and continuity-payout constants
(power cap, 90%/80% eligibility, equivocation forfeiture) → **Q-13**; C→H IBC voucher returns acting
as de-facto bearer claims (needs legal/policy sign-off) → **Q-03/Q-10**; residual-cadence economics →
**Q-18**.

## 4. Volatile facts: re-verify at Vendor kickoff

Solana: current fee levels and compute-unit limits; Token-2022 exchange/custody support; Alpenglow
rollout status; Firedancer share; Realms/SPL-governance maintenance status; rent (storage) cost per
byte; Pyth AKT feed availability. Ethereum/EVM L2s: blob fee levels and L2 fee reality; OP Stack
fault-proof and custom-gas-token status; candidate host-chain throughput, fees, and commercial policy
(Q-42); NTT/OFT security posture.
Both: settlement-stablecoin issuance/liquidity status (Q-43), WalletConnect/wallet support assumptions in [07](./07-offchain-and-clients.md),
RPC-provider SLAs.

## Cross-references

- [02. Target selection](./02-target-selection.md): full rationale for D-01/D-02.
- [12. Risk register](./12-risk-register.md): risks tied to A-05/A-06 and to A-24 (which replaces withdrawn A-04); D-25 risks R-01
  (portal mint path, Q-44), R-36 (old-chain stake, Q-49, A-25), R-37 (two AKT representations, A-24)
  and R-38 (compressed launch, GT).
- [10. Rollout & cutover](./10-rollout-and-cutover.md): gates GT and G0–G5 referenced by Q items; V, L
  and the governance sequence of D-25.

## Feeds into

Every document in the set references this index; Vendor onboarding starts here after 00/02.
