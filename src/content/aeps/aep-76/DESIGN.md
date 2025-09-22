# BME Architecture Blueprint

**Document status:** Draft for architecture sign-off  
**Related spec:** [AEP-76](https://akash.network/roadmap/aep-76/)
**Scope:** Phase 0 (Architecture) - no code delivery, establish invariant-complete blueprint
**Prepared by:** Greg Osuri
**Reviewers:** Protocol Engineering, Economics, Client Engineering, DevOps


## 1. Objectives & Deliverables
- Freeze protocol responsibilities for `x/bme`, `x/act`, and `x/oracle` prior to implementation.
- Define complete data model (stores, module accounts, params) and inter-module contracts.
- Slice migration path from legacy AEP-23 settlements to BME without breaking existing leases.
- Quantify rounding rules, oracle windowing, and dust handling to guarantee deterministic accounting.
- Provide governance & ops requirements (parameters, metrics, emergency hooks) needed at genesis upgrade.

## 2. Component Boundary Overview
| Component | Responsibilities | Key Interactions |
| --- | --- | --- |
| `x/bme` | Vault custody, remint-credit ledger, ACT mint/burn execution, circuit-breaker enforcement | `MsgMintACT`, `MsgBurnACT`, settlement adapter invoked from `x/escrow.paymentWithdraw`, keeper queries for CR/metrics |
| `x/act` | Account-bound ACT balances, non-transferable spend authority, org/project scoping | Keeper exposes `Mint`, `Burn`, `SpendToModule(escrow)`; gRPC queries for balances and metadata |
| `x/oracle` | Medianized AKT/USD price from Osmosis TWAP + secondary feed, freshness validation, deviation guards | `GetPrice(ctx, PriceUseCase)` with use-case tolerances (`Mint`, `Settle`, `Refund`); emits events for monitoring |
| `x/escrow` | Existing lease escrow accounts, per-block accrual, fee routing, provider withdrawals | Calls `bmeKeeper.WithdrawFromACT(ctx, payment)` prior to subtracting fees; registers BME settlement hook without new messages |
| `x/market` | Order/bid/lease lifecycle, escrow funding, provider withdrawals | Continues using `PaymentCreate`, `PaymentWithdraw`, `PaymentClose`; orchestrates auto top-ups via `MsgMintACT` if balances low |
| Console (off-chain) | UX, credit-card onramp, telemetry dashboards | REST/gRPC client of `MsgMintACT`, streams CR metrics, invokes existing `MsgWithdrawLease` when needed |

## 3. Data Model & Storage Layout
### 3.1 Module Accounts & Supply Hooks
- `bme_vault` (new module account)
  - Holds uAKT from tenant top-ups.
  - Balance mirrors `RemintCredits` until settlement consumes credits.
  - Marked as `ModuleAccountTypeBasic` with burn permissions disabled (burn handled via keeper logic).
- `act_module` (new module account)
  - Not spendable; exists to satisfy Cosmos SDK supply bookkeeping for ACT denominations (if minted as `uact`).
- Ensure `SupplyKeeper` whitelist includes ACT for module-level mint/burn.

### 3.2 Key/Value Stores
| Store | Key (prefix) | Value | Notes |
| --- | --- | --- | --- |
| `bme/params` | `0x00` | `Params` | CR thresholds, oracle ids, rounding mode, min mint size |
| `bme/remint` | `0x01` + `uint64` epoch? -> to support histograms, but Phase 0 uses singleton | `sdk.Dec` | Tracks available AKT supply for remint; represented as `sdk.Dec` with 6 decimal precision |
| `bme/metrics` | `0x02` | `OutstandingACT`, `NetBurnRolling` | Maintained via structs for telemetry |
| `act/balances` | `0x10` + `sdk.AccAddress` | `sdk.Dec` | Non-transferable balances; stored in micro dollars (e.g., `uact`) |
| `act/metadata` | `0x11` + `sdk.AccAddress` | `AccountMeta` | Ties balances to auth scopes (org/project) |
| `act/escrow_commit` | `0x12` + `types.AccountID` | `sdk.Dec` | Tracks ACT that has been lent to escrow accounts; mirrors escrow `Balance+Funds` |
| `oracle/prices` | `0x20` + `PriceUseCase` | `PriceSnapshot` | Contains TWAP result, timestamp, stddev, source weights |
| `oracle/feeds` | `0x21` | `FeedConfig[]` | Governance-managed data sources |

### 3.3 State Invariants
- `RemintCredits >= 0` (except transiently in halt mode; if negative, circuit breaker escalates).
- `OutstandingACT = Σ balances(owner) = Σ escrow_commit` (validated via end blocker).
- Every escrow account (`types.Account`) must hold `Balance.Denom == uact`; `escrow_commit[id]` mirrors `Balance + Funds` to the micro-dollar.
- `CR = (VaultBalance(uakt_to_dec) * P_ref) / OutstandingACT`; enforce `CR >= params.soft_floor` outside halt.
- Vault bank balance must equal `RemintCredits` converted to `sdk.Int` minus in-flight dust accumulator.
- ACT denomination is non-transferable: bank `SendCoins` disabled for `uact` except from module to module for refunds/settlements via keeper-controlled path.

### 3.4 Numeric Representation & Rounding
- Base units: `uakt` (1e-6 AKT) and `uact` (1e-6 USD).
- Maintain internal `sdk.Dec` precision at 18 decimal places; round to 6 decimals for external ledger writes.
- Mint path: floor ACT amounts (tenant-friendly), accumulate residual in `VaultDust` (new field) and add to `RemintCredits` when exceeding `1 uakt`.
- Settlement path: floor AKT payouts (provider-safe). Residual flows to `VaultDust` as positive drift, improving CR.
- Refund path mirrors settlement rounding to ensure no arbitrage beyond dust-level.

### 3.5 Keeper Interfaces (Phase 0 contracts)
- `x/act` exposes:
  - `Credit(ctx, owner, amount sdk.DecCoin, meta AccountMeta)` → increase free ACT balance.
  - `CommitToEscrow(ctx, owner, escrowID, amount)` → move ACT from free balance to `escrow_commit[escrowID]` (without bank transfer).
  - `BurnEscrowBalance(ctx, escrowID, amount)` → reduce commitment during settlement/refund.
  - `SpendToModule(ctx, owner, module string, amount)` → helper for migrations (console seed) but locked to `escrow` module.
- `x/bme` exposes:
  - `WithdrawFromACT(ctx, escrowID, provider sdk.AccAddress, amount sdk.DecCoin) (sdk.Int, sdk.Int, sdk.Int, sdk.Dec, error)` returning `(akt_out, use_vault, shortfall, price)`.
  - `QueryVault`, `QueryCR`, telemetry getters.
- `x/escrow` adds hook registration:
  - `SetSettlementAdapter(fn SettlementAdapter)` where `SettlementAdapter` signature matches `WithdrawFromACT`; default implementation is no-op unless BME enabled.

## 4. Oracle Architecture
### 4.1 Feed Pipeline
1. Osmosis TWAP querier (IBC / LCD) supplies 30-min TWAP with 5-min step size, outlier rejection 0.1%.
2. External feed aggregator (e.g., Pyth) delivered via off-chain relayer posting `MsgSubmitPrice` to `x/oracle`.
3. `x/oracle` keeper medianizes available feeds per use-case. Each use-case may specify:
   - `MaxAge` (e.g., mint: 10m; settle/refund: 5m).
   - `MaxDeviation` (1.5%).
   - `Smoothing` (EWMA coefficient for CR reference price).
4. On failure, `ErrOracle` surfaces; `x/bme` can degrade to emergency policy (halt new mints).

### 4.2 Data Structures
```go
// oracle/types/price.go
type PriceSnapshot struct {
    DenomPair   string    // "AKT/USD"
    UseCase     PriceUseCase
    Price       sdk.Dec   // medianized result
    Sources     []PriceSource // metadata for audits
    Timestamp   time.Time
    StdDev      sdk.Dec   // for monitoring
}

type PriceSource struct {
    ID          string    // e.g., "osmosis:pool-XYZ"
    Price       sdk.Dec
    Weight      sdk.Dec
    UpdateTime  time.Time
}
```

### 4.3 Governance Parameters
- `OracleMinFeeds`: default 1 (Osmosis) but prefer 2 for production.
- `OracleHaltDeviation`: if deviation between sources > 3%, trip breaker.
- `OracleDriftMax`: reject price if last update older than `MaxAge` (per use-case). Emits telemetry.

## 5. Process Flows (Textual State Machines)
### 5.1 Mint Path (`MsgMintACT`)
`MsgMintACT` fields:
- `payer sdk.AccAddress`
- `owner sdk.AccAddress`
- `akt_in sdk.Coin` (optional, mutually exclusive with `usd_exact`)
- `usd_exact sdk.Dec` (optional USD target; keeper back-solves AKT)
- `escrow_id types.AccountID` (optional, pre-commit minted ACT to escrow account)
- `memo string` (metadata such as invoice or payment provider reference)

1. Auth layer validates payer signature or feegrant.
2. Keeper fetches `P_mint` with `PriceUseCaseMint` tolerances.
3. Determine `akt_req`:
   - If `usd_exact`: `ceil(usd_exact / P_mint)`.
   - Else `akt_in` direct.
4. `bank.SendCoins(payer → bme_vault, akt_req)`; update `RemintCredits += akt_req`.
5. Calculate `act_out = floor(akt_req * P_mint)`; `actKeeper.Credit(owner, act_out)` adds to non-transferable ledger and, if requested, increments `escrow_commit` for the targeted escrow account.
6. Update metrics: `OutstandingACT += act_out`; recompute `CR` using smoothed `P_ref` (EWMA seeded with minted price).
7. Emit `EventMint` and persist TX trace (payer, owner, price, dust, escrow_id if provided).
8. Circuit breaker check: if new `CR` < `params.halt_threshold`, revert unless bypass flag set via governance emergency.

### 5.2 Settlement Path (escrow `AccountSettle` → `paymentWithdraw`)
1. Existing `x/escrow` end-block logic advances `AccountSettle` for each open escrow account, accruing `FractionalPayment.Balance` in `uact`.
2. When `PaymentWithdraw` or `PaymentClose` is invoked (from `MsgWithdrawLease`, `MsgCloseBid`, or automatic hooks), control enters the new BME settlement adapter before fees are computed.
3. Adapter obtains `act_spend = payment.Balance` (DecCoin, denom `uact`), resolves the escrow account owner from `act/escrow_commit`, and calls `bmeKeeper.WithdrawFromACT(ctx, escrowID, provider, act_spend)`.
4. `WithdrawFromACT`:
   - Fetches `P_settle` using `PriceUseCaseSettle` (freshness 5 min, deviation ≤ 1.5%).
   - Burns ACT from the tenant escrow account (`x/act.BurnEscrowBalance`), updating `OutstandingACT -= act_spend`.
   - Calculates `akt_out = floor(act_spend / P_settle)`.
   - Decrements `RemintCredits` by `use_vault = min(akt_out, RemintCredits)` and transfers that amount of `uakt` from `bme_vault` to the escrow module.
   - Mints any `shortfall = akt_out - use_vault` directly into the escrow module using `x/mint` (inflationary component).
   - Returns `(akt_out, use_vault, shortfall, P_settle)` to the caller and emits `event_bme_settlement`.
5. `paymentWithdraw` replaces the payment balance with a `sdk.DecCoin{Denom: uakt, Amount: akt_out}` before calling `TakeKeeper.SubtractFees`, preserving existing fee logic.
6. Coins are sent from the escrow module to the provider in `uakt` without introducing new messages; telemetry captures vault vs. mint proportions and updated CR.
7. Circuit breaker checks run inside `WithdrawFromACT`. If CR would fall below `halt_threshold`, adapter returns `ErrCircuitBreaker` causing the withdrawal to defer until governance intervention (settlement queue remains pending but no extra gas is charged).

### 5.3 Refund Path (`MsgBurnACT`)
`MsgBurnACT` fields:
- `owner sdk.AccAddress`
- `to sdk.AccAddress` (defaults to owner)
- `act_burn sdk.DecCoin`
- `memo string`

Mirror settlement but `to` is tenant-provided address; share code path to reduce divergence. Refunds allowed even in halt (unless governance toggles `refund_disabled`).

## 6. Circuit Breaker Logic
- Parameters: `warn_threshold` (default 0.95), `halt_threshold` (0.90), `restart_threshold` (0.93 to resume), `mint_cooldown_blocks` (throttles per block).
- Implementation: stored in `Params`; `x/bme` leverages `BeforeMint` hook to enforce.
- Breaking sequence:
  1. If `CR < warn`: emit `EventCRWarning`, no functional change.
  2. If `CR < halt`: set `MintPaused = true`; `MsgMintACT` errors with `ErrCircuitBreaker`.
  3. Settlements/refunds remain allowed to restore CR.
  4. Governance or automatic logic flips `MintPaused` once CR > restart for `cooldown_period` blocks.
- Additional lever: `MaxMintPerBlock` parameter to avoid sudden CR dilutions.

## 7. Migration Strategy (Phase 0 Decisions)
1. **Pre-upgrade snapshot:** capture outstanding stable balances and awaiting settlements from AEP-23.
2. **Convert console stable escrow → ACT**
   - Off-chain service buys AKT at `P_transition` (oracle price at upgrade block).
   - Submit `MsgMintACT` using AKT purchased; ensures `bme_vault` seeded and `RemintCredits` align with outstanding liability.
3. **Seed Vault Buffer:** Governance deposit of AKT (e.g., community pool transfer) to adjust CR > 1 before enabling new mints.
4. **Disable stable payouts:** set `x/market` params to ignore USDC; ensure no outstanding USDC invoices remain.
5. **Genesis modifications:** include new module accounts, new params, zeroed stores, and initial metrics (CR computed from seeded values).
6. **Backwards compatibility:** Provide read-only translation endpoints so console can display pre-upgrade balances as ACT.

## 8. Parameter Catalog (Initial Values TBD)
| Parameter | Module | Purpose | Notes |
| --- | --- | --- | --- |
| `warn_threshold` | `x/bme` | CR warning trigger | e.g., 0.95 |
| `halt_threshold` | `x/bme` | Pause mint threshold | e.g., 0.90 |
| `restart_threshold` | `x/bme` | Resume mint threshold | > halt |
| `mint_cooldown_blocks` | `x/bme` | Rate limit for new ACT mints | e.g., 10 |
| `max_mint_per_block` | `x/bme` | Additional throttle | sized vs. liquidity |
| `oracle_max_age_mint` | `x/oracle` | Freshness requirement | 600s |
| `oracle_max_age_settle` | `x/oracle` | 300s |
| `oracle_deviation_limit` | `x/oracle` | Source disagreement bound | 0.015 |
| `dust_threshold_uakt` | `x/bme` | When to sweep rounding dust | 1 uAKT |
| `min_mint_act` | `x/bme` | Lower bound per mint (USD) | e.g., 10 USD |
| `refund_fee_bps` | `x/bme` | Optional fee to discourage frequent refunds | default 0 |

## 9. Security & Audit Focus Areas
- **Oracle Manipulation:** Document handshake between console RFQ and on-chain oracle; require price attestations to match within tolerance; design monitoring for feed downtime.
- **Module Accounts:** Ensure `bme_vault` flagged in supply keeper to avoid send-enabled operations; restrict `uact` send to module pathways to prevent leakage.
- **Invariant Checks:** Add end-block invariants verifying `OutstandingACT` sum, `RemintCredits` alignment, and `CR` calculations. Provide CLI `akashd q bme invariants` for ops.
- **AuthZ:** Phase 0 defines `MsgMintACT`/`MsgBurnACT` permissions; console uses `ServiceAccount` pattern via `authz` to mint on behalf of tenant.

## 10. Observability & Telemetry Requirements
- Instrument Prometheus gauges: `bme_outstanding_act`, `bme_vault_uakt`, `bme_cr`, `bme_mint_paused`.
- Emit events with consistent attribute keys for price, dust, vault usage to feed data warehouse.
- Provide gRPC queries:
  - `QueryVault()` returning balance, remint credits, CR.
  - `QueryAccountACT(owner)` returning balances and spend forecasts.
  - `QueryParameters()` for governance dashboards.
- Define ABCI telemetry for circuit-breaker transitions (info log + event).

## 11. Open Questions for Sign-off
1. **Denomination Strategy:** Keep ACT off bank module (custom denom) vs. integrate as IBC-denom-like? Decision required to avoid IBC send.
2. **RemintCredits Representation:** Should we track as `sdk.Int` (1e-6 precision) or `sdk.Dec` to accommodate fractional results? Implementation preference affects rounding logic.
3. **Oracle Delivery:** Do we rely on existing price server infrastructure, or must we introduce new relayer? Need ops alignment.
4. **Refund Policy:** Should refunds remain unrestricted during CR stress or adopt staged throttling (e.g., queue with per-block cap)?
5. **Dust Sweeping Frequency:** prefer immediate re-credit vs. periodic end-block sweep; decision influences deterministic accounting tests.
6. **Genesis Seed Amount:** Determine AKT buffer to target initial CR ≥ 1.05.

## 12. Sign-off Checklist
- [ ] Economics + governance approve CR thresholds, rounding, and dust behavior.
- [ ] Protocol engineering validates store layout, invariants, and message schemas.
- [ ] Console/backend teams confirm API contracts (`MsgMintACT`, telemetry endpoints).
- [ ] DevOps confirms oracle infra and monitoring coverage.
- [ ] Migration plan reviewed with product & support; run book drafted.

---
