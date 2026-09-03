| | |
|---|---|
| **Document** | 08. Security & Audits |
| **Doc ID** | AKASH-MIG-08 |
| **Version** | 0.9 (draft for review) |
| **Date** | 2026-08-10 |
| **Owner** | Overclock Labs |
| **Audience** | Vendor engineering + security leads, audit firms, Akash core team |
| **Status** | Normative where marked (MUST/SHALL); informative otherwise |

## Purpose

Defines the security program for the migration: how the threat model changes when Akash leaves its sovereign
Cosmos SDK chain (see [01. Current architecture](./01-current-architecture.md)) for Solana or an EVM chain, the
component threat models the Vendor MUST design and test against, key management and the upgrade-authority
lifecycle (D-15), the audit plan and its coupling to program gates, the protocol invariant set, operational
security (monitoring, incident response, bug bounty, verifiable builds), and the bridge stance.

## In scope

- Security posture delta analysis: Cosmos sovereign chain → Solana / EVM deployment.
- Threat models for every protocol component and its security-relevant off-chain periphery.
- Key management, multisig/timelock policy, guardian pause powers, authority sunset roadmap.
- Audit tranches, firm selection criteria, gate coupling; bug bounty; monitoring; incident response.
- Protocol invariants (consumed as executable properties by [09. Testing](./09-testing-and-verification.md)).

## Out of scope

- Test implementation detail (fuzz harnesses, testnets, acceptance criteria): [09](./09-testing-and-verification.md).
- Cutover runbooks and gate definitions G0–G5: [10. Rollout & cutover](./10-rollout-and-cutover.md).
- Claims mechanism design and supply accounting: [05. Token migration](./05-token-migration.md).
- Target architecture internals (accounts, instructions, contracts): [03](./03-solana-architecture.md) / [04](./04-ethereum-architecture.md).

---

## 1. Security posture delta

The migration does not merely relocate risk; it changes its shape. Three categories: surfaces that disappear,
surfaces that appear, and surfaces that transform.

### 1.1 What disappears

| Surface (today) | Detail on current chain | Post-migration |
|---|---|---|
| Sovereign validator set + slashing | ~100-validator CometBFT set bonded in AKT; 5% double-sign slash, downtime jailing (`cmd/akash/cmd/genesis.go:219-299`) | Gone. Consensus security is inherited from the L1 (§1.2). Validator-key compromise, cartel, and chain-halt-by-validators classes vanish, as does the cost of operating/monitoring a validator set |
| IBC surface | ICS-20 transfer, v1 + v2 (Eureka) routers; `ibctransfer` module account holds Minter+Burner | Gone at halt H (D-05: no persistent bridge). Removes voucher-inflation bugs, counterparty-chain risk, relayer censorship. Stranded-voucher handling per D-07 |
| CosmWasm + awasm filter | wasmd hosting only the Pyth feed contracts, wrapped by a custom msg filter allowing exactly one message type; hardcoded `ContractDebugMode=true` defect (`app/app.go:158-163`) | Gone (D-22). No general-purpose contract runtime to confine; the outstanding debug-mode defect is retired rather than ported |
| Single-source CosmWasm oracle | One authorized pusher: the Pyth contract address is the sole `Sources` entry with `MinPriceSources=1`; Wormhole guardian-set updates bypass Akash governance entirely (`_docs/governance-updates.md:44-57`) | Replaced by direct Pyth pull-oracle reads in protocol programs/contracts (D-13). **This is a net security improvement**: it removes the single authorized pusher, the four-contract CosmWasm verification chain, and a guardian-update path outside Akash governance, in exchange for a direct, monitorable dependency on Pyth with in-protocol staleness/confidence gating |

### 1.2 What appears

| New surface | Why it matters |
|---|---|
| **Program/contract upgrade authority: the new root of trust** | Today a malicious upgrade requires a public governance proposal plus 2/3 of validators voluntarily running the binary. Post-migration, whoever controls the upgrade authority can replace the code that custodies all protocol funds with one (multisig) signature. Every control in §4 exists to constrain this |
| **Claims distributor honeypot** | At S1 the `akash-claims` / `MigrationClaims` system (including the Wind-down Reserve) controls effectively the entire migrated AKT supply (all unclaimed liquid balances plus all module-held funds) for an exposure window of up to 2 years (D-05). It is the single largest honeypot in the program and receives the strictest treatment in this document (§2.1, §4.5, §5.1) |
| Crank/keeper liveness dependency | Escrow settlement, BME epochs, and residual distributions execute via permissionless cranks (Solana) or keeper automation (EVM) instead of consensus-embedded End/BeginBlockers (D-20/D-21). Liveness failure delays settlement and overdrawn detection (economic exposure), though lazy accounting means no funds are lost by inaction |
| Fee-payer / relayer abuse surface | Gasless-UX sponsorship (fee payer on Solana, paymaster/relayer on EVM) introduces a hot-key service that attackers can drain or abuse (§2.7) |
| L1 inheritance | Solana: consensus outages/degradation and the Alpenglow consensus transition landing inside the migration window (A-13); plan an instability buffer. Ethereum path: L1 consensus plus **the host chain's centralized sequencer** (Stage 1 fault proofs; no major L2 at Stage 2 as of 2026-08; candidate-chain policy also shifts, e.g. Base announced Superchain exit 2026-02); sequencer censorship/downtime and forced-inclusion latency become part of the protocol's availability story |
| Public ordering adversaries (MEV) | Analyzed and largely defused by protocol design in §3 |

### 1.3 What transforms: losing the chain-halt recovery lever

Escrow and BME defects mean **direct fund loss, exactly as today**. What changes is recoverability. On the
sovereign chain, Akash has repeatedly used coordinated upgrades as a state-repair tool: the v1.1.0 upgrade
repaired overdrawn escrow accounts, and v2.1.0 imperatively moved 427,414,453 uakt from the distribution module
account into escrow (`upgrades/software/v2.1.0/upgrade.go:88-108`). On Solana or the host chain there is no halt lever and
no consensus-blessed state rewrite: recovery is limited to what the deployed code and its authorities permit, on
a chain that keeps running while you respond. Three requirement families follow:

**REQ-SEC-001** Every program/contract that holds or moves user funds MUST implement a guardian pause per §4.3 (intake freeze that never blocks withdrawals or refunds).

**REQ-SEC-002** The Vendor MUST document and rehearse (on testnet, before mainnet launch) an upgrade-based recovery runbook per fund-holding program/contract (the migration-era replacement for "upgrade the chain to fix state"), including state-reconstruction sources (indexer + archives per [06](./06-state-and-data-migration.md)) and expected time-to-mitigation.

**REQ-SEC-003** The invariant monitors of §7.1 MUST be deployed and alert-tested before any real-value deployment (testnet dress rehearsal included).

**REQ-SEC-004** Critical-path instructions/functions MUST carry on-chain conservation assertions where cost permits (at minimum I-3 and I-4 of §6), so violations abort atomically rather than requiring after-the-fact recovery.

Note the inherited gap being closed here: the current chain registers **no invariants at all** (the crisis module
is not wired into the app), so the target's §6/§7 posture is strictly stronger than status quo.

---

## 2. Component threat models

Format: STRIDE-informed tables (S spoofing, T tampering, R repudiation, I info disclosure, D denial of service,
E elevation of privilege). Mitigation cells reference the requirement that mandates them.

### 2.1 Claims distributor (`akash-claims` / `MigrationClaims`)

Context: Merkle-distribution claims per D-05; claimants prove ownership of a snapshot Cosmos address and
designate a target-chain recipient. Roots: S1 root, weekly interim residual roots (C→H), S2 root.

| Threat | Class | Vector | Mitigation |
|---|---|---|---|
| Double-claim | T | Replay same leaf; claim across two roots containing overlapping balances | REQ-SEC-007; residual roots MUST contain only incremental amounts ([05](./05-token-migration.md)) |
| Forged Cosmos ownership proof | S | secp256k1 signature malleability (high-S acceptance); verifying the wrong digest (raw bytes vs the documented ADR-36-style sign-doc); accepting a signature over attacker-chosen bytes | REQ-SEC-008 |
| Address confusion | S | Verifier trusts a caller-supplied Cosmos address instead of deriving it from the verified pubkey | REQ-SEC-008 (derivation mandatory) |
| Multisig threshold bypass | E | Cosmos multisig accounts have a distinct threshold pubkey type; a verifier that accepts any single participant key steals every multisig-held balance | REQ-SEC-009 |
| Cross-domain replay | T | Claim message replayed on the other target chain, a testnet, or a later distribution | REQ-SEC-010 |
| Root substitution | T/E | Compromised authority replaces a registered root with an attacker root, the single fastest full-drain path | REQ-SEC-005, REQ-SEC-006 |
| Honeypot drain via code defect | E | Any arithmetic/validation bug in the one program holding ~the entire supply | REQ-SEC-011/012; audit tranche T1 (§5.1); I-3 on-chain |

**REQ-SEC-005** Each Merkle root MUST be immutable once registered: no instruction/function to modify or delete a registered root may exist. New roots (weekly residuals, S2) are append-only, and root registration MUST be permanently disabled (irreversible flag) once the S2 root and the D-07 redemption reserve root are set.

**REQ-SEC-006** Before activation, every root MUST be independently recomputed from the published snapshot data by ≥3 parties (Vendor, Overclock, ≥1 independent auditor/community verifier) whose signed attestations are published; the registration transaction MUST reference the attestation set.

**REQ-SEC-007** The claims program/contract MUST enforce one-leaf-one-claim via a per-leaf on-chain receipt (claim bitmap or receipt PDA / storage slot) checked before payout.

**REQ-SEC-008** Cosmos ownership verification MUST verify secp256k1 over the exact, byte-specified claim digest (documented in [05](./05-token-migration.md)), MUST reject high-S signatures, and MUST derive the snapshot address from the verified pubkey (`bech32(ripemd160(sha256(pubkey)))`) rather than accepting a claimed address.

**REQ-SEC-009** Multisig snapshot accounts MUST be verified at their recorded threshold: k distinct valid participant signatures over the same digest, against the pubkey set committed in the leaf.

**REQ-SEC-010** The signed claim payload MUST bind leaf reference, distribution/root identifier, target-chain identifier, claims program/contract address, and recipient address, making it non-replayable across roots, deployments, and chains.

**REQ-SEC-011** Claims payouts MUST flow mint-on-claim from a program-controlled mint authority (Solana, per D-03) or from a dedicated distributor balance segregated from all other protocol funds (EVM), never from a shared vault.

**REQ-SEC-012** The claims system MUST enforce a governance-set velocity breaker: if claimed value in a rolling 24 h window exceeds a configured fraction of remaining unclaimed supply, claim processing auto-pauses (full-stop tier, §4.3) pending review. Threshold set at G2; anomaly detection also in §7.1.

### 2.2 Escrow (`akash-escrow` / `EscrowVault`)

Context: per D-21 (lazy per-second streaming, permissionless settle, multi-depositor FIFO refunds, overdrawn
semantics, AKT-fallback settlement when BME is halted).

| Threat | Class | Vector | Mitigation |
|---|---|---|---|
| Value creation | T | Arithmetic/rounding defect lets withdrawn+refunded exceed deposited | I-1/I-2 (§6); REQ-SEC-004; fuzz suites in 09 |
| Rounding-direction abuse | T | Many small settles/withdraws harvesting favorable rounding | REQ-SEC-013 |
| Depositor-vector griefing | D | Attacker stuffs the depositor list (dust deposits) so refund loops exceed compute/gas limits; account becomes uncloseable | REQ-SEC-014 |
| Settle front-running | D | Permissionless settle lands just before a tenant top-up, forcing overdrawn→close of a healthy lease | Accepted residual (semantics preserved by D-21); low-balance client alerts (REQ-SEC-071); minimum-deposit params keep runway |
| Overdrawn oscillation | T | Deposit/withdraw cycling across the overdrawn boundary to double-accrue or skip accrual around the settled-at freeze | REQ-SEC-015; boundary property tests (09) |
| Delegated-deposit (allowance) abuse | E | The D-21 delegated-deposit allowance spent on unintended accounts, or restore-on-refund crediting the wrong granter | REQ-SEC-016 |

**REQ-SEC-013** All escrow rounding MUST truncate in the protocol's favor (against the payee/refundee), mirroring current `TruncateInt` behavior; no code path may round up an outflow, and dust remainders accrue to the escrow account.

**REQ-SEC-014** The per-account depositor list MUST be bounded (parameter, default ≤16), and every refund loop MUST fit within one transaction's compute/gas budget at the bound, verified by test.

**REQ-SEC-015** Overdrawn state transitions MUST preserve the current-chain freeze semantics (accrual timestamp frozen while overdrawn; settle-before-deposit ordering) and MUST be covered by a state-machine property suite in [09](./09-testing-and-verification.md).

**REQ-SEC-016** Delegated-deposit allowances MUST record (granter, grantee, scope, remaining limit) on chain; spends decrement atomically with the deposit; refunds restore only the originating granter's allowance, never a balance transfer to the grantee.

### 2.3 BME (`akash-bme` / `BurnMintEscrow`)

Context: per D-20 (queued epoch-batched AKT↔ACT swaps, collateral ratio CR = vault AKT value / ACT supply, warn
9500 bps / halt 9000 bps, mint spread, permissionless crank / keeper execution).

| Threat | Class | Vector | Mitigation |
|---|---|---|---|
| Oracle staleness/manipulation | T | Stale or manipulated AKT/USD price inflates CR (mints unbacked ACT) or misprices refunds | REQ-SEC-017; Pyth confidence + staleness gating per 03/04; monitoring §7.1 |
| Queue jamming | D | Flood of dust swap requests starves the batch executor | REQ-SEC-018 (MinMint ≥ 10 ACT carried over; per-epoch record cap; per-account pending cap) |
| Spread / epoch-timing arbitrage | T | Locking a request-time price and executing later; racing epoch boundaries around price moves | REQ-SEC-019 (execution-time pricing, single price per batch); mint spread (25 bps default) exceeds typical intra-epoch noise |
| Vault drain | E | Any outflow path other than refund execution | REQ-SEC-020 |
| Halt-state abuse | T | Flapping the breaker via price manipulation to time mints; exploiting the CR-halt refund path | REQ-SEC-017/021; analysis below |
| Crank griefing | D | Executor submits failing batches to burn retries | Carry `MaxPendingAttempts=3` cancel semantics; crank tips flat (REQ-SEC-047) |

**Exit-valve analysis (normative context).** ACT→AKT burns remaining allowed under CR-halt (but not under
oracle-halt) is intentional, carried over from the current chain: it lets ACT holders exit to AKT even when the
vault is undercollateralized, preventing a trapped-asset scenario. The consequence is a controlled-run dynamic:
early redeemers exit at full oracle value while CR degrades for late redeemers. Three properties keep this
controlled rather than catastrophic: (a) batch caps (`MaxEndblockerRecords=50`-equivalent per execution) and
epoch backoff rate-limit redemption throughput; (b) refunds always price off a healthy (non-stale) oracle read,
since oracle-halt blocks them; (c) governance can recapitalize via the fund-vault path. The Vendor MUST preserve
all three and MUST NOT "fix" the exit valve by blocking refunds under CR-halt.

**REQ-SEC-017** CR computation and every swap execution MUST enforce the oracle staleness and confidence bounds defined in [03](./03-solana-architecture.md)/[04](./04-ethereum-architecture.md); a stale/unhealthy read MUST resolve to oracle-halt (no mints, no refunds), never to a default price.

**REQ-SEC-018** Queue intake MUST enforce a minimum swap size (default 10 ACT-equivalent), a per-epoch execution record cap, and a per-account pending-request cap, all governance parameters.

**REQ-SEC-019** All records in one epoch batch MUST execute at a single execution-time aggregated price; request-time prices MUST NOT be honored, and queue position within a batch MUST NOT affect the price received.

**REQ-SEC-020** The vault MUST have exactly one outflow path (refund/settlement execution). Funding is one-way (governance fund instruction, mirroring `MsgFundVault`); no administrative withdrawal capability may exist, including for the upgrade authority short of a code upgrade.

**REQ-SEC-021** Mint batches MUST re-check CR as a post-condition and abort mid-batch if CR crosses the halt threshold during execution (carrying current EndBlocker behavior); I-4 (§6) is asserted on-chain.

### 2.4 Marketplace (`akash-market`, `akash-deployment` / `Marketplace`, `DeploymentRegistry`)

| Threat | Class | Vector | Mitigation |
|---|---|---|---|
| Bid-slot griefing | D | Junk bids exhaust the per-order bid cap (today `OrderMaxBids=20`) at zero net cost since collateral is refunded on loss; real providers cannot bid | REQ-SEC-022; collateral sizing + forfeiture per Q-08 |
| Fake providers (Sybil) | S | Costless provider registration floods matching with phantom supply | Registration collateral (Q-08); audited-attribute weighting; REQ-SEC-023 |
| Attribute spoofing | S | Provider self-declares false attributes (region, GPU class) to win leases | Audit registry provenance (REQ-SEC-023); Console default-filters to audited attributes ([07](./07-offchain-and-clients.md)) |
| Reclamation abuse | D | Provider abuses the D-24 reclamation window to strand tenants, or bypasses it to yank leases | Port window bounds 1h–720h exactly; deadline checks as today (`x/market/handler/server.go:138-192`) |
| Lease-award manipulation | T | Ordering attacks on bid/lease creation | Defused by design: tenant explicitly selects the winning bid (§3) |

**REQ-SEC-022** Bid slots MUST NOT be exhaustible at zero economic cost: the design MUST include bid-collateral forfeiture conditions and/or a non-refundable bid fee (parameters from Q-08), and the per-order bid cap MUST remain governance-tunable.

**REQ-SEC-023** The audit registry port MUST preserve auditor-signed attribute provenance (attribute → auditor identity) so clients can distinguish self-declared from audited attributes; matching that consumes audited attributes MUST verify the auditor chain on-chain or via the authoritative read path (REQ-SEC-034).

### 2.5 Provider registry: key rotation (`akash-provider-registry` / `ProviderRegistry`)

Per D-10, provider JWT signing keys are anchored on-chain; rotation is the attack surface: an attacker holding a
provider's owner key rotates the signing key and impersonates the provider to tenants (manifest theft, workload
interception).

**REQ-SEC-024** Signing-key rotation MUST be owner-signed, MUST emit an indexed event, and MUST record the previous key and rotation timestamp on-chain (rotation history queryable).

**REQ-SEC-025** Tenant-side verification (Console, SDKs, provider daemon peers) MUST resolve provider signing keys via the authoritative read path (REQ-SEC-034) at connection time (never from cache older than 5 minutes) and MUST surface unexpected-rotation warnings.

**REQ-SEC-026** The provider daemon MUST alert its operator on any rotation event affecting its own provider record (detects hostile rotation via a compromised owner key).

### 2.6 Governance & upgrade authority (Realms + Squads v4 / OZ Governor + Timelock + Safe)

| Threat | Class | Vector | Mitigation |
|---|---|---|---|
| Proposal spam | D | Cheap proposals bury real ones / voter fatigue | REQ-SEC-027 |
| Timelock bypass | E | A privileged function callable outside the timelock; direct-execution role retained by an EOA | REQ-SEC-028 |
| Malicious proposal rushed at low quorum | E | Parameter/upgrade proposal passed quietly | Timelock delay = public reaction window (§4.2); security-council cancel (REQ-SEC-029) |
| Multisig signer compromise | S/E | Phished/coerced signers reach threshold | §4.1 quorum/geo/HSM requirements (REQ-SEC-048..052) |
| Governance-stack supply chain | T | Upstream Realms (low-velocity maintenance) / Squads / OZ code changes | REQ-SEC-030; Q-11 Realms gap analysis |

**REQ-SEC-027** Proposal creation MUST carry an economic threshold (token deposit or minimum voting power) sized at G1 such that spam is uneconomical; parameters governance-tunable.

**REQ-SEC-028** Every privileged operation (upgrade, parameter change, root registration, treasury movement, authority transfer) MUST route through the timelock; the only exemptions are guardian pause (intake-only, §4.3) and timelock-operation cancellation.

**REQ-SEC-029** A security council (the launch multisig) MUST hold cancel power over queued timelock operations during the upgradeable phase; cancel power sunsets with the §4.5 roadmap.

**REQ-SEC-030** The Vendor MUST pin exact versions of governance-stack dependencies (Realms/SPL Governance, Squads v4, OZ Governor/Timelock/Safe), monitor upstream changes (including scheduled upstream program upgrades such as Pyth's DAO-managed upgrades), and re-verify before adopting any update.

### 2.7 Fee-payer / relayer (gasless UX)

| Threat | Class | Vector | Mitigation |
|---|---|---|---|
| Fee-float drain | D | Spam of valid-but-pointless sponsored transactions | REQ-SEC-031/032 |
| Instruction smuggling | E | Sponsored tx includes instructions moving relayer assets or invoking foreign programs | REQ-SEC-031/033 |
| Quota-identity Sybil | D | Fresh addresses evade per-account quotas | Global rate cap + per-IP/per-session app-layer limits (REQ-SEC-032) |

**REQ-SEC-031** The relayer MUST sponsor only transactions matching an allow-list of (program/contract address, instruction/function selector) patterns for the Akash protocol suite, verified by simulation before signing; anything else is rejected.

**REQ-SEC-032** The relayer MUST enforce per-address and global sponsorship quotas (rate + value), with alerts on quota saturation (§7.1).

**REQ-SEC-033** Fee-payer/paymaster keys MUST hold only a working fee float (auto-refilled from a cold treasury with a capped daily amount) and MUST NOT hold or control any other asset or authority.

### 2.8 Indexer & Console read path

Per D-16/D-23 the indexer is the system of record for history, which makes it a spoofing target: a poisoned
indexer can show a tenant a healthy lease that is closed, or an inflated escrow balance, inducing harmful signed
transactions.

**REQ-SEC-034** Any Console/client flow that results in a money-moving signature (deposit, withdraw, claim, swap, lease create/close) MUST reconcile the displayed state against an authoritative on-chain read (RPC `getAccountInfo` / `eth_call`) immediately before presenting the signing prompt; indexer data alone MUST NOT drive such prompts.

**REQ-SEC-035** An indexer-integrity monitor MUST continuously sample indexer state against chain state (random entity sample + chain-head lag), alerting on divergence (§7.1).

### 2.9 Solana specifics: program vulnerability classes

| Threat | Class | Vector | Mitigation |
|---|---|---|---|
| Missing owner/signer checks; duplicate mutable accounts | S/E | Account substitution with look-alike accounts; same account passed twice mutable, corrupting balance math | REQ-SEC-036 |
| Type confusion | T | Account data reinterpreted across types (missing discriminator) | REQ-SEC-036 |
| PDA seed collision | T | Ambiguous seed concatenation ("ab"+"c" vs "a"+"bc") or scope overlap (escrow deployment vs bid scopes) yields the same PDA | REQ-SEC-037 |
| CPI privilege escalation | E | Program invokes an attacker-supplied program id, or leaks PDA signer seeds to arbitrary CPI | REQ-SEC-038 |
| Account resurrection | T | Closed account revived via lamport top-up or re-init within one transaction | REQ-SEC-039 |
| ALT poisoning | S | Malicious address-lookup-table entries resolve a client-built transaction to attacker accounts | REQ-SEC-040 |

**REQ-SEC-036** Every instruction MUST validate, for every account: owner program, signer/writable expectations, type discriminator, and duplicate-account distinctness (Anchor constraint set, or equivalent explicit checks in Pinocchio paths). All crates build with `overflow-checks=true` and checked casts.

**REQ-SEC-037** PDA seed schemas MUST be canonical, documented in [03](./03-solana-architecture.md), collision-free across programs and scopes, and use fixed-width or length-prefixed components (no raw string concatenation).

**REQ-SEC-038** All CPI target program ids MUST be pinned to known ids (token program, protocol sibling programs, Pyth); no instruction may CPI into a caller-supplied program id, and PDA signer seeds MUST only sign CPIs constructed by the owning program.

**REQ-SEC-039** Account closure MUST be resurrection-safe: drain lamports, zero data, write a CLOSED discriminator (or reassign to the system program); creation paths MUST reject accounts bearing the CLOSED marker within the same transaction.

**REQ-SEC-040** Canonical address lookup tables MUST be published, frozen (no append authority after finalization), and pinned by address in first-party clients; client SDKs MUST verify ALT contents against expected protocol addresses at build time.

### 2.10 Ethereum/host-chain specifics: contract vulnerability classes

| Threat | Class | Vector | Mitigation |
|---|---|---|---|
| Reentrancy on settle/withdraw/refund | E | External token calls mid-state-update; note ACT's restricted-transfer hooks are protocol code and still reenter | REQ-SEC-041 |
| Approval races | T | ERC-20 `approve` front-run on deposit flows | REQ-SEC-042 |
| UUPS storage collision | T | Upgrade shifts storage layout, corrupting escrow accounting | REQ-SEC-043 |
| Uninitialized proxy / implementation takeover | E | Initializer front-run; attacker initializes a bare implementation contract | REQ-SEC-044 |
| Keeper MEV | T | Automation bots sandwich fallback-price settlement around oracle updates | §3 (REQ-SEC-046); flat keeper compensation (REQ-SEC-047) |
| Sequencer trust | D | Host-chain sequencer downtime/censorship delays settles, claims, breaker updates | Forced-inclusion via L1 documented in runbooks (REQ-SEC-002); monitoring §7.1 |

**REQ-SEC-041** All fund-moving external calls MUST follow checks-effects-interactions and carry reentrancy guards; cross-contract protocol calls (EscrowVault↔BurnMintEscrow↔ACT) MUST be modeled as reentrant in tests.

**REQ-SEC-042** Protocol deposit flows MUST use EIP-2612 permit or exact-allowance patterns; no flow may require a standing unlimited approval to a protocol contract.

**REQ-SEC-043** Upgradeable contracts MUST use namespaced storage (ERC-7201) with storage-layout compatibility checks (OZ upgrades tooling or equivalent) enforced in CI for every upgrade.

**REQ-SEC-044** Implementation contracts MUST call `_disableInitializers()` in constructors, and deployment scripts MUST atomically deploy+initialize proxies (deterministic deployment, no initialization window).

---

## 3. MEV and transaction-ordering analysis

The current chain is **low-MEV by design**, and this property MUST be preserved. There is no time-priority
auction anywhere in the protocol: an order does not go to the first or best bid by arrival; the tenant
explicitly selects a bid via lease creation (`MsgCreateLease{BidID}`), all bids at or below the order price are
equally eligible, and closing a lease merely relists the order. There are no liquidation bounties, no AMM pools,
no first-come mint windows; the chain runs no-op proposal handlers and a default mempool. Akash has never
depended on ordering fairness, and the target design must not start.

**REQ-SEC-045** No target-chain mechanism may award an economic outcome (lease award, bid acceptance, claim priority, swap price) based on transaction-ordering priority; tenant-selects-bid semantics per D-09 are the normative pattern.

Residual ordering surfaces and their treatment:

| Surface | Extraction | Bound |
|---|---|---|
| Settle-timing (AKT-fallback path prices ACT debt in AKT at settle time) | Caller times settlement around price moves | Aggregated/TWAP price with staleness + deviation caps per 03/04; extraction bounded to intra-window noise (REQ-SEC-046) |
| BME queue position | Jump the queue before an epoch executes | Defused: single execution-time batch price (REQ-SEC-019) |
| Crank/keeper tip races | Bots race permissionless settle/epoch cranks for tips | Benign (identical state outcome); flat tips (REQ-SEC-047) |
| Host-chain sequencer ordering (EVM) | Sequencer-level frontrunning of settles | Same price-bounding as above; private submission SHOULD be available for operational transactions |

**REQ-SEC-046** Every price-consuming settlement path MUST use an aggregated price with explicit staleness and deviation bounds (parameters in 03/04) such that the maximum ordering-derived value transfer per settlement is bounded and quantified in the design review.

**REQ-SEC-047** Crank/keeper incentives MUST be flat per-execution fees or tips, never proportional to value moved, so racing cranks cannot become an extraction market.

---

## 4. Key management and authority lifecycle

### 4.1 Launch configuration

| | Solana | Ethereum/host chain |
|---|---|---|
| Upgrade authority | Squads v4 multisig (de-facto standard as of 2026-08) holding all program upgrade authorities, executing only timelocked proposals | Safe multisig as proposer on OZ `TimelockController`; timelock is `owner`/`UPGRADER_ROLE` of all UUPS proxies |
| Token authorities | AKT/ACT mint authorities held by protocol PDAs (claims/emissions/BME programs) per D-03/D-19, never by the multisig directly | Mint roles granted only to `MigrationClaims`, `EmissionsMinter`, `BurnMintEscrow` per D-04/D-19 |
| DAO layer | Realms (SPL Governance) token voting (Q-11 gap analysis pending) | `AkashGovernor` (OZ Governor) |
| Guardian (pause) | Designated pause key set inside Squads (any 2-of-7 members may trigger intake pause) | `PAUSER_ROLE` held by a 2-of-7 sub-quorum of the Safe |

**REQ-SEC-048** The launch upgrade authority MUST be a multisig with threshold ≥ 4-of-7 (example baseline; exact set fixed at G1 and published).

**REQ-SEC-049** No single organization may control more than 2 of 7 signers (Overclock included), and signers MUST span ≥3 legal jurisdictions.

**REQ-SEC-050** Every signer key MUST be hardware-backed (HSM or hardware wallet on a dedicated device), never hot, never reused across environments (testnet keys distinct).

**REQ-SEC-051** Signer identities/roles MUST be published (at minimum organization + role), and each signer MUST complete a quarterly liveness attestation (signing a canary message); two consecutive misses trigger replacement.

**REQ-SEC-052** Signer departure or suspected compromise MUST trigger a multisig membership change within 7 days; ≥2 simultaneously compromised/lost signers triggers the emergency re-key runbook (REQ-SEC-055).

### 4.2 Timelock policy

| Operation class | Delay | Approver |
|---|---|---|
| Routine parameter change (bounded ranges defined in 03/04) | 48 h | Multisig (Phase L) / DAO (Phase 1+) |
| Program/contract upgrade | 7 d | Multisig + published diff/audit note |
| Residual root registration (weekly, C→H) | 48 h | Multisig + 3-party attestation (REQ-SEC-006) |
| Emergency security patch | 24 h minimum | Elevated threshold 6-of-7; public disclosure ≤72 h after execution |
| Guardian pause (intake-only) | none (instant) | 2-of-7 sub-quorum |
| Full-stop pause | none (instant) | Multisig quorum (4-of-7); auto-expires |

**REQ-SEC-053** All timelock delays, queued operations, and their calldata/instruction payloads MUST be publicly observable (on-chain queue), and queueing MUST emit monitored events (§7.1).

### 4.3 Guardian pause powers

Pause is an intake freeze, never an exit freeze. Per component:

| Component | Intake pause freezes | Never blocked (any tier except full-stop) |
|---|---|---|
| Deployment/Market | New deployments, orders, bids, leases | Lease close, withdraw, escrow refund, reclamation completion |
| Escrow | New accounts, new deposits | Settle, payment withdraw, depositor refund, account close |
| BME | New swap requests (queue intake) | Queued executions; ACT→AKT refunds under CR-halt (the D-20 exit valve) |
| Claims | Nothing at guardian tier | Claims processing (pausable only via full-stop, REQ-SEC-012/054) |
| Emissions | Mint executions | n/a (no user funds) |

**REQ-SEC-054** Guardian (intake) pause MUST NOT be able to block withdrawals, refunds, settlements, or closes. A full-stop pause (all state transitions of one component) MUST require multisig quorum, MUST auto-expire after ≤72 h unless renewed by a governance action, and every use MUST be publicly disclosed with cause.

### 4.4 Key ceremony, rotation, loss

**REQ-SEC-055** Before launch the Vendor MUST deliver, and rehearse with signers: (a) a documented, witnessed key-generation ceremony (on-device generation, no key export, recorded attestation); (b) a rotation runbook (membership swap ≤7 d); (c) a loss/compromise runbook including the ≥2-signer emergency re-key path; (d) an annual rehearsal schedule. These are audit tranche T3 artifacts (§5.1).

### 4.5 Authority sunset roadmap (per D-15)

| Phase | Trigger (all criteria) | Authority state |
|---|---|---|
| **L: Launch** | Target-chain launch | Multisig + timelock as §4.1; security-council cancel active |
| **1: DAO-gated** | S2 complete; two consecutive clean quarters (zero SEV-1/SEV-2, §7.2); all audit criticals closed | Upgrades/params require a passed DAO vote; multisig demoted to executor of passed proposals + canceller. Solana: upgrade authority moves under Realms-governed execution with Squads as emergency council. EVM: Governor becomes sole timelock proposer; Safe retains cancel + pause only |
| **2: Immutability (core)** | Phase 1 + burn-in of N months (default 12; ratify at G2; recorded as an open question for [13](./13-open-questions-and-assumptions.md)) + governance vote | `akash-claims`/`MigrationClaims` and the escrow core: upgrade authority revoked (Solana: set to None; EVM: upgrade path permanently disabled). Root registration already burned per REQ-SEC-005. Market/config/BME remain DAO-upgradeable; emissions mint authority remains DAO+timelock permanently |

**REQ-SEC-056** The Vendor MUST implement the sunset mechanics so each phase transition is a single auditable on-chain action, and MUST publish the roadmap (triggers included) before mainnet launch.

**REQ-SEC-057** Claims and escrow-core immutability (Phase 2) MUST NOT occur before all Phase-2 criteria are met, and MUST occur within 90 days after they are met unless governance explicitly votes to delay (prevents indefinite retention of the upgrade backdoor).

---

## 5. Audit plan

### 5.1 Tranches

| Tranche | Scope | Depth | Gate coupling |
|---|---|---|---|
| **T1: Token & claims** | AKT/ACT mints + extensions/restrictions, `akash-claims`/`MigrationClaims` incl. Wind-down Reserve + residual-root flow, signature verification library (REQ-SEC-008/009), governance/timelock/multisig wiring | 2 independent firms, full scope, fix re-verification | MUST close (all Critical/High fixed + re-verified) before any real-value deployment of token or claims; these gate S1 |
| **T2: Marketplace & economics** | Escrow, BME, market, deployment, provider/audit registries, config, emissions | 2 independent firms + 1 economic/tokenomics review (BME CR breaker + spread + emissions interaction, run dynamics of §2.3) | MUST close before marketplace mainnet launch |
| **T3: Off-chain** | Signer sidecar (D-17), fee relayer (§2.7), claim portal backend, monitoring pipeline, key ceremony/runbooks | 1 code-audit firm + 1 infrastructure pentest | MUST close before cutover C |

**REQ-SEC-058** Each on-chain tranche MUST be audited by two independent firms (no shared ownership or staff), each covering the full tranche scope (not split halves).

**REQ-SEC-059** Every Critical/High finding across all tranches MUST be fixed and re-verified by the issuing firm before **G3** (the cutover go/no-go gate per [10](./10-rollout-and-cutover.md)); no gate crossing may occur with an open Critical/High.

**REQ-SEC-060** Material post-audit diffs (any change to audited fund-flow code) MUST receive a delta review by at least one of the original firms before deployment.

**REQ-SEC-061** All audit reports MUST be published within 30 days of the corresponding fixes being deployed.

**REQ-SEC-062** T2 MUST additionally run a public audit competition (Code4rena/Cantina-class platform; candidate, select at procurement) on the frozen codebase before mainnet launch.

### 5.2 Candidate firms (examples-to-procure; candidates, NOT commitments)

| Path | Code audit candidates (as of 2026-08 reputation; re-verify) | Economic review |
|---|---|---|
| Solana | OtterSec, Neodyme, Zellic, Trail of Bits | Quantitative-risk firm, Gauntlet-class scope (candidate class, procure at G1) |
| EVM | Trail of Bits, Spearbit, OpenZeppelin, Zellic | same |

[TO-VERIFY: firm availability, lead times, and current Solana/EVM practice depth at procurement; book slots ≥3
months ahead; audit-firm queues routinely run a quarter long.]

---

## 6. Formal & property verification: the invariant set

These invariants are the contract between this document and [09](./09-testing-and-verification.md), which turns
them into fuzz targets, stateful property suites, and (where marked) on-chain assertions. This section defines
*what* must always hold; 09 defines *how* it is exercised, not duplicated here.

| ID | Invariant | Enforcement |
|---|---|---|
| I-1 | Escrow conservation, per account and global: Σ(deposits) == Σ(withdrawn) + Σ(refunded) + held (funds + accrued unwithdrawn payment balances) | Property suite + continuous monitor |
| I-2 | No negative stored balance after any settle; overdrawn is expressed only as state flag + unsettled-debt field | Property suite + monitor |
| I-3 | Claims: Σ(claimed per root) ≤ root total; each leaf claims at most once | **On-chain assertion** + monitor |
| I-4 | BME: no ACT mint executes while CR < halt threshold (9000 bps default), evaluated at execution time | **On-chain assertion** (REQ-SEC-021) + monitor |
| I-5 | Depositor refunds pay out in FIFO deposit order | Property suite |
| I-6 | ACT balances change only via protocol burn/mint instructions (non-transferability, D-19) | On-chain by construction + monitor |
| I-7 | BME vault has exactly one outflow path (REQ-SEC-020) | Code review + monitor |

**REQ-SEC-063** Each invariant I-1..I-7 MUST exist as a machine-checkable property in the 09 test suites, and I-3/I-4 MUST additionally be asserted on-chain in the executing instruction/function.

**REQ-SEC-064** The Vendor SHOULD apply formal or semi-formal verification (e.g., Certora-class for EVM, Kani/proptest-backed model checking for Rust; candidates) to the escrow settlement arithmetic and the claims verification library; budget carried in [11. SOW](./11-scope-of-work.md).

---

## 7. Operational security

### 7.1 Monitoring & alerting catalog

**REQ-SEC-065** The following monitors MUST be live (with tested alert delivery) before mainnet launch, each with a runbook link in its alert payload:

| Monitor | Computes | Alert |
|---|---|---|
| Supply conservation | On-chain AKT supply == S1/S2/residual root totals + emissions − burns (and I-1 escrow conservation) | Any mismatch → SEV-1, auto-page |
| Vault CR | BME collateral ratio + trend | ≤9700 bps warn; ≤9500 bps page; redemption-velocity spike page |
| Claims velocity | Claimed value per rolling 1 h / 24 h vs baseline | Anomaly → page + REQ-SEC-012 breaker check |
| Upgrade-authority activity | Any tx touching upgrade authorities, timelock queue, multisig config, mint authorities | Every event → page (no exceptions) |
| Large withdrawals | Single or aggregate outflow above governance-set thresholds per component | Page |
| Crank/keeper liveness | Time since last settle execution / BME epoch / residual distribution | > 2× expected cadence → warn; > 6× → page |
| Oracle staleness | Pyth publish-time lag + confidence width vs 03/04 bounds | Lag > 50% of staleness bound → warn; bound breach → page |
| Indexer integrity | REQ-SEC-035 divergence sampling + head lag | Mismatch, or lag > 64 slots / 30 blocks → warn |
| Relayer health | Fee-float balance, quota saturation, rejection rate | Thresholds per REQ-SEC-032/033 |
| Pause/breaker state | Any pause flag or MintStatus change | Every change → page |

**REQ-SEC-066** Monitors MUST run on infrastructure independent of the primary RPC/indexer vendor (second data source), so a poisoned read path cannot blind them.

**REQ-SEC-067** Supply-conservation (I-1/I-3) violations SHOULD trigger a pre-authorized automatic guardian intake pause of the affected component (policy decision at G2), and MUST page regardless.

### 7.2 Incident response

| Severity | Definition | Response |
|---|---|---|
| SEV-1 | Active exploit or invariant violation; funds moving or mintable | War room ≤15 min; pause decision ≤30 min (REQ-SEC-068); public ack ≤2 h |
| SEV-2 | Confirmed exploitable vulnerability, no active loss; or critical dependency down (oracle halt, sequencer outage) | War room ≤1 h; mitigation plan ≤24 h |
| SEV-3 | Degraded operation (crank stalls, indexer lag, relayer down) | Business-hours response ≤24 h |
| SEV-4 | Minor defect, no fund/liveness impact | Tracked, next release |

**REQ-SEC-068** For SEV-1, elapsed time from declaration to a landed pause transaction MUST be ≤30 minutes, demonstrated in a live drill before launch and re-drilled quarterly.

**REQ-SEC-069** A named incident-response roster (roles, contacts, escalation, pause-capable signer quorum per timezone) MUST exist before launch, with 24/7 coverage during: launch week, the S1/C cutover window, each weekly residual-root publication, the S2/H window, every upgrade execution, and the Alpenglow activation window (A-13) on the Solana path.

**REQ-SEC-070** Comms templates (status page, X/Discord, exchange notice, provider mailing list) and a disclosure policy MUST be prepared pre-launch; every SEV-1/SEV-2 gets a public post-mortem ≤14 days after resolution.

**REQ-SEC-071** Console/client UX MUST include low-escrow-balance warnings ahead of depletion (default: alert at ≤72 h of runway), the compensating control for the §2.2 settle-front-running residual.

### 7.3 Bug bounty

**REQ-SEC-072** An Immunefi-class bug bounty (platform selection at G2) MUST be live at least 2 weeks before mainnet launch, covering the final audited code, and MUST remain funded through at least the end of the claim window.

Indicative tiers (final sizing at G2; payouts capped at 10% of demonstrably at-risk funds):

| Tier | Examples | Indicative range (USD) |
|---|---|---|
| Critical | Theft/freezing of funds, unauthorized mint, root substitution, claims bypass | $250k–$1,000,000 |
| High | Temporary fund lock-up, breaker bypass, griefing with direct economic loss | $50k–$100k |
| Medium | Griefing without direct loss, quota/allow-list bypass on relayer | $10k–$25k |
| Low | Best-practice deviations with a plausible path to impact | $1k–$5k |

In scope: all protocol programs/contracts, token mints, claims + portal backend, relayer, signer sidecar. Out of
scope: testnets, indexer/Console issues without fund impact (separate web-tier bounty), known issues, social
engineering, physical attacks, third-party dependencies (Pyth, Squads, Safe; report upstream).

### 7.4 Reproducible & verifiable builds

**REQ-SEC-073** Solana specifics: every deployed program MUST be built via the verifiable-build toolchain (`solana-verify`-class, pinned container digest) with the on-chain hash matching published source at a tagged commit; verification data published so third parties can independently confirm.

**REQ-SEC-074** Ethereum specifics: every deployed contract MUST have source verified on the canonical explorer(s) and Sourcify, built with pinned compiler version/settings committed to the repo.

**REQ-SEC-075** Dependency hygiene: lockfiles committed; `cargo audit`/`cargo vet` (Rust) and dependency audit (Solidity/TS) in CI; release artifacts signed; no unpinned toolchains in release paths.

---

## 8. Bridge stance

Per D-05 there is **no persistent bridge**: migration is one-way Merkle claims plus exchange swaps, and the
claims system is time-bounded and sunset per §4.5. This is a deliberate security posture, not a gap: a standing
bridge would be a second honeypot with an indefinite lifetime.

**REQ-SEC-076** The Vendor MUST NOT deploy any burn/mint or lock/mint pathway for AKT or ACT beyond the claims system and the emissions minter specified in this document set.

If governance later pursues multichain AKT, the design constraint is the **KelpDAO incident (2026-04)**: ~$292M
lost through a LayerZero deployment configured with a single verifier (1-of-1 DVN) whose RPC infrastructure
attackers (attributed to Lazarus) compromised. The framework held; the verifier quorum configuration was the
failure.

**REQ-SEC-077** Any future multichain AKT deployment MUST use a burn/mint framework (NTT-class), MUST require ≥3 independent verifiers under distinct operators and infrastructure (no 1-of-N or vendor-default configs), MUST enforce per-chain rate limits sized to observed organic daily volume, and MUST pass a dedicated security review + audit under this document's process before launch.

---

## Cross-references

- [01. Current architecture](./01-current-architecture.md): the mechanisms whose semantics §2 threat models preserve.
- [03. Solana architecture](./03-solana-architecture.md) / [04. Ethereum architecture](./04-ethereum-architecture.md): PDA schemas, oracle bounds, parameter ranges consumed by REQ-SEC-017/037/046.
- [05. Token migration](./05-token-migration.md): claim digest specification, root construction, Wind-down Reserve.
- [09. Testing & verification](./09-testing-and-verification.md): executable form of §6 invariants; drills and dress rehearsals.
- [10. Rollout & cutover](./10-rollout-and-cutover.md): gates G0–G5 (REQ-SEC-059 binds to G3), war-room windows.
- [11. Scope of work](./11-scope-of-work.md): audit/bounty/monitoring budget and staffing.
- [12. Risk register](./12-risk-register.md): risk-level treatment of the §1.2 surfaces.
- [13. Open questions](./13-open-questions-and-assumptions.md): Q-08 (collateral), Q-11 (Realms gaps), A-13 (Alpenglow).

## Feeds into

- **09**: invariants I-1..I-7, drill requirements, monitor alert tests.
- **10**: gate entry criteria (audit closure REQ-SEC-058..061), pause runbooks, war-room windows.
- **11**: audit tranches, bounty, monitoring, key-ceremony deliverables as SOW line items.
- **12**: §1/§2 threat surfaces as risk-register entries with owners.
