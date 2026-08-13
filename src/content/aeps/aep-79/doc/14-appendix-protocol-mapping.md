# 14. Appendix: Protocol Mapping (Cosmos → Solana → EVM)

| | |
|---|---|
| **Document** | 14. Appendix: protocol mapping |
| **Doc ID** | AKASH-MIG-14 |
| **Version** | 0.9 (draft for review) |
| **Date** | 2026-08-10 |
| **Owner** | Overclock Labs |
| **Audience** | Vendor engineering (all workstreams) |
| **Status** | Informative: realizes decisions D-01…D-24; contains no new requirements |

## Purpose

- Single lookup artifact mapping every Cosmos-side protocol element (message, query, state object,
  event, parameter, module account, unit, error) to its Solana equivalent (per
  [03](./03-solana-architecture.md)) and EVM equivalent (per [04](./04-ethereum-architecture.md)).
- Source of truth for parity test matrices ([09](./09-testing-and-verification.md)) and SOW
  traceability ([11](./11-scope-of-work.md)).

## In scope

- All messages, queries, stored state, typed events, and parameters of the ten Akash modules at
  commit `096bff57` (protocol line per A-12), plus the stock Cosmos SDK surface Akash users actually
  exercise.
- Module-account, identity, unit, time-basis, fee, and error-taxonomy mappings.
- A Cosmos↔Solana↔EVM concept glossary.

## Out of scope

- Rationale for target designs (see [03](./03-solana-architecture.md) /
  [04](./04-ethereum-architecture.md)) and for decisions (see
  [13](./13-open-questions-and-assumptions.md)).
- Token-migration accounting ([05](./05-token-migration.md)) and snapshot tooling
  ([06](./06-state-and-data-migration.md)).
- Off-chain API/indexer schemas ([07](./07-offchain-and-clients.md)).

## Notation

| Convention | Meaning |
|---|---|
| `akash-market.create_bid` | Solana: program (BRIEF-fixed name) `.` Anchor instruction (snake_case) |
| `Marketplace.createBid` | EVM: contract (BRIEF-fixed name) `.` external function |
| `["bid", owner, dseq, gseq, oseq, provider]` | PDA seed tuple under the owning program. String literals = UTF-8 bytes; `owner`/`provider` = 32-byte pubkey; integers little-endian fixed width (`dseq` u64 = 8 B, `gseq`/`oseq` u32 = 4 B) |
| lifecycle `init: X / close: Y / rent: A→B` | account created by instruction X, closed by Y, rent paid by A and refunded to B (D-23) |
| gov-gated | executable only by governance executor: Realms governance PDA (Solana) / `AkashTimelock` (EVM) per D-11 |
| n/a post-migration | concept ends with the sovereign chain; no target equivalent |
| Code paths | `x/…/file.go:NN` = [akash-network/node](https://github.com/akash-network/node) @ `096bff57`; proto types from `pkg.akt.dev/go` |

Names in this appendix are the shared registry proposed to docs 03/04; if 03/04 diverge, 03/04 govern
and the divergence is a doc defect to reconcile before G1. Amounts are micro-units (`uakt`/`uact`,
6 decimals) throughout.

---

## 1. Message mapping

Every transaction message accepted by the current chain. Type URLs are the protobuf `Any` type URLs.

### 1.1 x/deployment (`akash.deployment.v1beta4`, handlers `x/deployment/handler/server.go`)

| Cosmos msg (type URL) | Semantics | Solana | EVM | Behavioral deltas / notes |
|---|---|---|---|---|
| `/akash.deployment.v1beta4.MsgCreateDeployment` | Create deployment + N groups, open escrow account, create one order per group (`server.go:41-130`) | `akash-deployment.create_deployment` (CPI → `akash-escrow.create_account`, `akash-market.create_order` per group) | `DeploymentRegistry.createDeployment` (calls `EscrowVault`, `Marketplace`) | Parity: deposit MUST be ACT (uakt rejected at create, `server.go:60-62`); group price denom MUST be uact (`server.go:93`); reclamation window validated against market config (D-24). Delta: dseq from per-tenant counter, not block height (D-09, Q-12). Deposit `Sources` resolve balance and/or deposit allowance (§1.10, D-21) |
| `/akash.deployment.v1beta4.MsgUpdateDeployment` | Replace SDL hash pointer on active deployment (`server.go:132-157`) | `akash-deployment.update_deployment` | `DeploymentRegistry.updateDeployment` | Hash must differ; active-only. SDL itself stays off-chain (D-09, A-10) |
| `/akash.deployment.v1beta4.MsgCloseDeployment` | Close deployment; escrow account close cascades to groups/orders/bids/leases via hooks (`server.go:159-177`, `x/market/hooks/hooks.go`) | `akash-deployment.close_deployment` + permissionless `finalize_deployment_close` cranks (one per group/lease) | `DeploymentRegistry.closeDeployment` (inline bounded cascade) | Delta (Solana): Cosmos cascade is one atomic tx; Solana splits terminal-state finalization across crank instructions (CU/account limits, D-23); funds are safe in between (escrow marked closed first). EVM keeps single-tx cascade bounded by group count |
| `/akash.deployment.v1beta4.MsgCloseGroup` | Close one group + its order/bid/lease (`server.go:179-201`) | `akash-deployment.close_group` | `DeploymentRegistry.closeGroup` | 1:1 |
| `/akash.deployment.v1beta4.MsgPauseGroup` | Pause group; closes order/lease, keeps group resumable (`server.go:203-214`) | `akash-deployment.pause_group` | `DeploymentRegistry.pauseGroup` | 1:1 |
| `/akash.deployment.v1beta4.MsgStartGroup` | Resume paused group; creates a fresh order (oseq+1) (`server.go:226-253`) | `akash-deployment.start_group` (CPI create_order) | `DeploymentRegistry.startGroup` | Carries deployment's reclamation config into new order |
| `/akash.deployment.v1beta4.MsgUpdateParams` | Gov-gated param update (`server.go:255-268`) | gov-gated `akash-config.set_deployment_params` | gov-gated `AkashConfig.setDeploymentParams` | All module `MsgUpdateParams` collapse into the config program/contract (D-11); §5 |

### 1.2 x/market (`akash.market.v1beta5`, handlers `x/market/handler/server.go`)

| Cosmos msg (type URL) | Semantics | Solana | EVM | Behavioral deltas / notes |
|---|---|---|---|---|
| `/akash.market.v1beta5.MsgCreateBid` | Provider bids on open order; opens bid-collateral escrow account (`server.go:29-136`) | `akash-market.create_bid` (CPI → `akash-escrow.create_account`) | `Marketplace.createBid` | Parity: per-denom `BidMinDeposits`; reject when existing bids > `OrderMaxBids` (`server.go:45-46`, wraps `ErrInvalidBid`); `bseq` MUST be 0; bid price ≤ order price; resources offer must match group spec; attribute match vs provider self-attrs + audited attrs (`x/audit`); reclamation window bounds (D-24). Delta: bid count tracked as a counter on the order account (no index scan) |
| `/akash.market.v1beta5.MsgCloseBid` | Provider closes own bid; on active lease, gated by reclamation (`server.go:138-192`) | `akash-market.close_bid` | `Marketplace.closeBid` | Parity: lease active + reclamation configured ⇒ must `LeaseStartReclaim` first (`ErrReclamationNotStarted`); reclaiming + now < deadline ⇒ `ErrReclamationWindowNotElapsed` (D-24). Cascades: pause group, close lease/order, close payment |
| `/akash.market.v1beta5.MsgCreateLease` | Tenant accepts a bid: creates lease + streaming payment; all other open bids lose and their collateral refunds (`server.go:209-283`) | `akash-market.create_lease` (CPI → `akash-escrow.create_payment`); losing bids closed by permissionless `akash-market.close_lost_bid` (one per bid, crank) | `Marketplace.createLease` (inline loop over ≤ `OrderMaxBids` bids) | Delta (Solana): losing-bid refunds are NOT in the accept tx (account/CU caps, D-23); order is marked matched so lost bids can only be closed/refunded, never matched. EVM keeps Cosmos atomicity (bounded at 20). Payment rate = bid price converted to per-second (§7.3, D-21) |
| `/akash.market.v1beta5.MsgCloseLease` | Tenant closes lease; if group still open, order is re-listed (oseq+1) (`server.go:285-336`) | `akash-market.close_lease` | `Marketplace.closeLease` | Relist parity preserved. Reason recorded (`LeaseClosedReason`, §4) |
| `/akash.market.v1beta5.MsgWithdrawLease` | Provider settles + withdraws accrued earnings (`server.go:194-207` → `escrow.PaymentWithdraw`) | `akash-market.withdraw_lease` (CPI → `akash-escrow.settle_and_withdraw`) | `Marketplace.withdrawLease` | Parity: provider receives 100% (no protocol take today, `x/take` dead). Also callable by anyone as bare `akash-escrow.settle` (§1.11, D-21) |
| `/akash.market.v1beta5.MsgLeaseStartReclaim` | Provider starts graceful wind-down; sets deadline = now + window (`server.go:338-379`) | `akash-market.lease_start_reclaim` | `Marketplace.startLeaseReclaim` | 1:1 (already wall-clock-based on Cosmos). Window ∈ [1h, 720h] per config (D-24) |
| `/akash.market.v1beta5.MsgUpdateParams` | Gov-gated (`server.go:381-392`) | gov-gated `akash-config.set_market_params` | gov-gated `AkashConfig.setMarketParams` | §5 |

### 1.3 x/escrow (`akash.escrow.v1`, handler `x/escrow/handler/server.go`)

| Cosmos msg (type URL) | Semantics | Solana | EVM | Behavioral deltas / notes |
|---|---|---|---|---|
| `/akash.escrow.v1.MsgAccountDeposit` | Top up an escrow account from balance and/or authz grant sources (`server.go:31-44`; `keeper.go:176-345`) | `akash-escrow.account_deposit` | `EscrowVault.accountDeposit` | Parity: the ONLY path that accepts uakt into deployment escrow (create is ACT-only); settles first when account overdrawn; grant source draws down the delegated deposit allowance (D-21). Delta: AKT moves as token transfer into per-account vault; ACT deposit = burn-from-depositor + ledger credit (D-19) |

### 1.4 x/bme (`akash.bme.v1`, handlers `x/bme/handler/server.go`)

| Cosmos msg (type URL) | Semantics | Solana | EVM | Behavioral deltas / notes |
|---|---|---|---|---|
| `/akash.bme.v1.MsgBurnMint` | Queue an AKT↔ACT swap request; executed at next epoch (`server.go:52-75`; `keeper.go:786-865`) | `akash-bme.request_burn_mint` (creates pending-record PDA) | `BurnMintEscrow.requestBurnMint` | Parity: only uakt↔uact; healthy oracle price required on both denoms; rejected when status ≥ halt_cr EXCEPT ACT→AKT refunds under CR-halt (blocked under halt_oracle); funds escrowed into vault at request; pending balances excluded from CR (D-20). Delta: request pays rent for its queue record (refunded on execute/cancel) |
| `/akash.bme.v1.MsgMintACT` | Sugar: BurnMint with `DenomToMint = uact` (`server.go:77-98`) | `akash-bme.mint_act` | `BurnMintEscrow.mintACT` | `MinMint = 10,000,000 uact` floor applies (§5) |
| `/akash.bme.v1.MsgBurnACT` | Sugar: BurnMint with `DenomToMint = uakt` (`server.go:100-121`) | `akash-bme.burn_act` | `BurnMintEscrow.burnACT` | Allowed under CR-halt (refund path), not under oracle-halt |
| `/akash.bme.v1.MsgFundVault` | Gov-only vault top-up from a non-module source (`server.go:123-167`) | gov-gated `akash-bme.fund_vault` | gov-gated `BurnMintEscrow.fundVault` | Vault seeded at S1 from migrated bme module account via Wind-down Reserve (D-05, D-20; [05](./05-token-migration.md)) |
| `/akash.bme.v1.MsgUpdateParams` | Gov-gated (`server.go:34-50`) | gov-gated `akash-config.set_bme_params` | gov-gated `AkashConfig.setBmeParams` | §5; epoch params convert block→time basis (D-20) |

### 1.5 x/oracle (`akash.oracle.v2`)

| Cosmos msg (type URL) | Semantics | Solana | EVM | Behavioral deltas / notes |
|---|---|---|---|---|
| `/akash.oracle.v2.MsgAddPriceEntry` | Authorized source (the CosmWasm Pyth contract) submits AKT/USD price; only `akt`/`usd` accepted | Not ported. Replaced by permissionless Pyth pull update: post/refresh the AKT/USD price-update account via `pyth-solana-receiver`; protocol programs read it directly (D-13, D-22) | Not ported. `IPyth.updatePriceFeeds` (permissionless, fee-paid); contracts read `getPriceNoOlderThan` | Trust moves from a single authorized source address (`RESEARCH: params.Sources`) to Pyth's signed price attestations. On-chain TWAP/median aggregation (oracle EndBlocker) is retired; consumers use Pyth price + confidence + staleness bound from config (§5.4). Feed: `[TO-VERIFY: Pyth AKT/USD feed ID and Solana feed account at kickoff]` |
| `/akash.oracle.v2.MsgUpdateParams` | Gov-gated | gov-gated `akash-config.set_oracle_params` (staleness/deviation bounds, feed ID) | gov-gated `AkashConfig.setOracleParams` | §5.4 |

### 1.6 x/provider (`akash.provider.v1beta4`, handlers `x/provider/handler/server.go`)

| Cosmos msg (type URL) | Semantics | Solana | EVM | Behavioral deltas / notes |
|---|---|---|---|---|
| `/akash.provider.v1beta4.MsgCreateProvider` | Register provider: host URI, attributes, contact info (`server.go:33-51`) | `akash-provider-registry.create_provider` | `ProviderRegistry.createProvider` | Delta: registration additionally anchors the provider's JWT signing key(s) (D-10; [07](./07-offchain-and-clients.md)); optional registration collateral per Q-08. Providers re-register on the target chain at launch (D-08) |
| `/akash.provider.v1beta4.MsgUpdateProvider` | Update registry record (`server.go:53-72`) | `akash-provider-registry.update_provider` | `ProviderRegistry.updateProvider` | Parity incl. historical quirk: "no active leases" check was removed in v0.32.0 and is NOT reintroduced |
| `/akash.provider.v1beta4.MsgDeleteProvider` | Currently returns `ErrInternal` "NOTIMPLEMENTED" (`server.go:74-88`) | `akash-provider-registry.deactivate_provider` then `close_provider`: staged, rejected while provider has active leases/open bids (03 REQ-SOL-035) | `ProviderRegistry.beginDeregister` / `finalizeDeregister` (same guard, 04) | Deliberate delta: target implements the staged deregistration the Cosmos chain stubbed; closes registry account, refunds rent/collateral |

### 1.7 x/audit (`akash.audit.v1`)

| Cosmos msg (type URL) | Semantics | Solana | EVM | Behavioral deltas / notes |
|---|---|---|---|---|
| `/akash.audit.v1.MsgSignProviderAttributes` | Auditor signs an attribute set for a provider; consumed by bid matching | `akash-audit.sign_provider_attributes` | `AuditRegistry.signProviderAttributes` | Upsert per (provider, auditor) pair; attributes bounded to fit account (realloc on growth) |
| `/akash.audit.v1.MsgDeleteProviderAttributes` | Auditor deletes named attribute keys (or all) for a provider | `akash-audit.delete_provider_attributes` | `AuditRegistry.deleteProviderAttributes` | Account closed (rent→auditor) when the set empties |

### 1.8 x/cert (`akash.cert.v1`): NOT PORTED (D-10)

| Cosmos msg (type URL) | Semantics | Solana | EVM | Behavioral deltas / notes |
|---|---|---|---|---|
| `/akash.cert.v1.MsgCreateCertificate` | Store x509 cert (PEM) + pubkey on chain, keyed by owner+serial | Not ported | Not ported | Replaced by JWT auth against signing keys in the provider registry; tenant mTLS client certs replaced by wallet-signed ephemeral credentials ([07](./07-offchain-and-clients.md)). Historical certs archived per [06](./06-state-and-data-migration.md) |
| `/akash.cert.v1.MsgRevokeCertificate` | Move cert to revoked state | Not ported | Not ported | Key rotation = `update_provider` / `updateProvider` (registry key replacement is the revocation) |

### 1.9 x/wasm (awasm) + wasmd: NOT PORTED (D-22)

| Cosmos msg (type URL) | Semantics | Solana | EVM | Behavioral deltas / notes |
|---|---|---|---|---|
| `/akash.wasm.v1.MsgUpdateParams` | Gov-gated blocked-address list for the CosmWasm msg filter | Not ported | Not ported | The awasm filter existed to confine the Pyth CosmWasm contracts (`x/wasm/keeper/msg_filter.go:64-180`); direct Pyth reads make it moot |
| `/cosmwasm.wasm.v1.MsgStoreCode`, `MsgInstantiateContract`, `MsgExecuteContract` (wasmd) | Host/drive the Pyth price-feed contracts; upload locked to gov on mainnet | Not ported | Not ported | Sole production use = Pyth VAA verification → `MsgAddPriceEntry`; collapses to Pyth pull reads (D-13, D-22) |

### 1.10 Stock Cosmos SDK messages in active use

| Cosmos msg (type URL) | Semantics | Solana | EVM | Behavioral deltas / notes |
|---|---|---|---|---|
| `/cosmos.bank.v1beta1.MsgSend` (uakt) | Transfer AKT | SPL Token-2022 `transfer_checked` (AKT mint, D-03) | `AKT.transfer` / `transferFrom` (D-04) | 1:1 in micro-units (6 decimals both sides) |
| `/cosmos.bank.v1beta1.MsgSend` (uact) | Rejected today: `SendEnabled=false` for uact (`cmd/akash/cmd/genesis.go:121-130`) | n/a: ACT mint has Token-2022 `NonTransferable`; only protocol burn/mint CPIs move it (D-19) | n/a: `ACT` transfers revert except for protocol contracts (D-19) | Non-transferability parity is a hard requirement of D-19 |
| `/cosmos.bank.v1beta1.MsgMultiSend` | Batch transfer | Multiple transfer instructions in one Solana tx | Multicall / batch-disperse contract (non-protocol) | Convenience only; not a protocol surface |
| `/cosmos.staking.v1beta1.MsgDelegate` | Bond AKT to a validator | n/a post-migration (D-06): no sovereign consensus; governance power via Realms AKT deposits | n/a post-migration: governance via `AkashGovernor` votes | Bonded/unbonding stake is credited liquid at S1 (D-06); replacement participation incentives per D-12 |
| `/cosmos.staking.v1beta1.MsgUndelegate`, `MsgBeginRedelegate` | Unbond / move stake | n/a post-migration | n/a post-migration | Unbonding entries at S1 credited liquid (D-06) |
| `/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward`, `MsgWithdrawValidatorCommission` | Claim staking rewards | n/a post-migration | n/a post-migration | Accrued unclaimed rewards up to halt are folded into claims (D-06; [05](./05-token-migration.md)) |
| `/cosmos.gov.v1.MsgSubmitProposal` | Submit governance proposal (deposit-gated) | Realms (SPL Governance) create-proposal in the AKT realm (D-11) | `AkashGovernor.propose` | Deposit model → proposal-creation token threshold (Realms) / `proposalThreshold` (Governor); no burn-on-veto equivalent |
| `/cosmos.gov.v1.MsgVote` (+`MsgVoteWeighted`) | Vote on proposal | Realms cast-vote | `AkashGovernor.castVote` / `castVoteWithReason` | Quorum/period values set at G1 per D-11 (§5.6) |
| `/cosmos.gov.v1.MsgDeposit` | Top up proposal deposit | n/a: no deposit phase in Realms | n/a: no deposit phase in Governor | Spam control shifts to creation thresholds |
| `/cosmos.authz.v1beta1.MsgGrant` with `/akash.escrow.v1.DepositAuthorization` | Grant deposit-on-behalf right `{SpendLimit legacy, SpendLimits Coins, Scopes}` (`x/escrow/keeper/keeper.go:176-345`) | `akash-escrow.grant_deposit_allowance`: creates allowance PDA `["allowance", granter, grantee]` {limits per denom, scopes} | `EscrowVault.approveDepositAllowance(grantee, limits, scopes)` | D-21: explicit on-chain delegated-deposit allowance replaces authz. Parity: partial spends decrement the allowance; refunds on account close RESTORE it (`keeper.go:1050-1075`); scopes = {deployment, bid} msg classes. Console fee-sponsorship flows depend on restore-on-refund |
| `/cosmos.authz.v1beta1.MsgRevoke` (same grant) | Revoke grant | `akash-escrow.revoke_deposit_allowance` (closes PDA, rent→granter) | `EscrowVault.revokeDepositAllowance(grantee)` | Outstanding escrow deposits unaffected; only future draws blocked |
| `/cosmos.authz.v1beta1.MsgExec` | Execute a granted msg | n/a: depositor signs deposit ix directly; allowance consumed inside `account_deposit` / `create_deployment` / `create_bid` paths | n/a: same | Matches current semantics: grants are consumed inside escrow's `AuthorizeDeposits`, not via generic exec |
| `/cosmos.authz.v1beta1.MsgGrant` (generic, other types) | Arbitrary msg delegation | No general successor; app-level session keys/delegates per [07](./07-offchain-and-clients.md) | No general successor; account-abstraction session keys | Only the DepositAuthorization seam is protocol-load-bearing today |
| `/cosmos.feegrant.v1beta1.MsgGrantAllowance` / `MsgRevokeAllowance` | Sponsor another account's tx fees (used for onboarding; fees only; deposits use authz) | Fee-sponsorship service: sponsor co-signs as Solana fee payer (relayer per [07](./07-offchain-and-clients.md), Q-07) | ERC-4337 paymaster charging/settling in AKT ([07](./07-offchain-and-clients.md)) | Moves from consensus feature to operated service on Solana; on EVM paymaster is on-chain but operated (Q-07) |
| `/ibc.applications.transfer.v1.MsgTransfer` | ICS-20 send AKT to other Cosmos chains | n/a post-migration: no IBC; third-party bridges out of protocol scope | n/a post-migration: canonical/third-party bridges out of protocol scope | IBC-out AKT handled by the D-07 pre-C return-home window + redemption process ([05](./05-token-migration.md) §7) |

### 1.11 New target-chain entrypoints with no Cosmos msg predecessor (context)

| Solana | EVM | Purpose |
|---|---|---|
| `akash-escrow.settle` (permissionless) | `EscrowVault.settle` (permissionless) | Force lazy settlement / overdrawn detection; replaces the implicit in-consensus settle points (D-21). Cosmos exposes `AccountSettle` only as a keeper method with no tx caller (`x/escrow/keeper/keeper.go`) |
| `akash-market.close_lost_bid` (crank) | inline in `createLease` | Losing-bid close + collateral/rent refund (§1.2) |
| `akash-deployment.finalize_deployment_close` (crank) | inline in `closeDeployment` | Cascade finalization (§1.1) |
| `akash-bme.crank_epoch` (permissionless, tipped) | keeper automation calling `BurnMintEscrow.executeEpoch` | Replaces bme EndBlocker epoch execution (D-20); processes ≤ `max_records_per_crank` |
| Pyth receiver `post_update` (ecosystem ix) | `IPyth.updatePriceFeeds` | Replaces the CosmWasm pyth contract → `MsgAddPriceEntry` path (D-13) |
| `akash-claims.claim` / residual claim | `MigrationClaims.claim` | Token migration (D-05; [05](./05-token-migration.md)) |
| `akash-emissions.distribute` | `EmissionsMinter.mint` (timelocked schedule) | Replacement emissions (D-12) |

---

## 2. Query mapping

Read-path legend: **PDA** = direct `getAccountInfo` + Anchor/Borsh decode (authoritative for LIVE
entities); **view** = `eth_call` on a view function (authoritative live); **indexer** = Console
indexer API (D-16), authoritative for lists, filters, and anything CLOSED (accounts are closed at
terminal state; events are the system of record for history, D-23). Cosmos `PageRequest`
(key/offset/limit/reverse) maps to indexer cursor pagination; on-chain enumeration is not provided on
either target (`getProgramAccounts` scans are not a supported API path).

| Cosmos gRPC endpoint | Request filters | Solana read path | EVM read path | Notes |
|---|---|---|---|---|
| `akash.deployment.v1beta4.Query/Deployments` | `DeploymentFilters{owner,dseq,state}`, pagination | indexer (authoritative for list/closed) | indexer | State filter incl. `closed` only answerable by indexer on both targets |
| `akash.deployment.v1beta4.Query/Deployment` | `DeploymentID{owner,dseq}` | PDA `["deployment", owner, dseq]` (authoritative live); indexer if closed | view `DeploymentRegistry.deployments(owner,dseq)`; indexer if closed | Response bundles groups + escrow account: clients fetch group PDAs / `groups()` views alongside |
| `akash.deployment.v1beta4.Query/Group` | `GroupID{owner,dseq,gseq}` | PDA `["group", owner, dseq, gseq]` | view `DeploymentRegistry.groups(...)` | none |
| `akash.deployment.v1beta4.Query/Params` | none | PDA `["config"]` (akash-config), deployment section | view `AkashConfig.deploymentParams()` | §5 |
| `akash.market.v1beta5.Query/Orders` | `OrderFilters`, pagination | indexer | indexer | none |
| `akash.market.v1beta5.Query/Order` | `OrderID` | PDA `["order", owner, dseq, gseq, oseq]` | view `Marketplace.orders(...)` | none |
| `akash.market.v1beta5.Query/Bids` | `BidFilters`, pagination | indexer | indexer | Provider-side bid engines subscribe to events instead of polling ([07](./07-offchain-and-clients.md)) |
| `akash.market.v1beta5.Query/Bid` | `BidID` | PDA `["bid", owner, dseq, gseq, oseq, provider]` | view `Marketplace.bids(...)` | Response includes bid escrow account; fetch escrow PDA / view too |
| `akash.market.v1beta5.Query/Leases` | `LeaseFilters`, pagination | indexer | indexer | none |
| `akash.market.v1beta5.Query/Lease` | `LeaseID` | PDA `["lease", owner, dseq, gseq, oseq, provider]` | view `Marketplace.leases(...)` | Response includes payment; fetch payment PDA / view |
| `akash.market.v1beta5.Query/Params` | none | `["config"]` market section | view `AkashConfig.marketParams()` | none |
| `akash.escrow.v1.Query/Accounts` | `state`, `xid`, pagination (`grpc_query.go`) | open/overdrawn: escrow account PDA (§3.3); lists & closed: indexer | live: view `EscrowVault.accounts(accountId)`; lists & closed: indexer | Cosmos state-in-key probing (3 prefixes) disappears: state is an explicit enum field (§3.3) |
| `akash.escrow.v1.Query/Payments` | `state`, `xid`, pagination | live: payment PDA; lists & closed: indexer | live: view `EscrowVault.payments(paymentId)`; else indexer | Accrued balance is computed lazily: clients derive live accrual as `rate × (now − settled_at)` client-side or call `settle` first |
| `akash.bme.v1.Query/Params` | none | `["config"]` bme section | view `AkashConfig.bmeParams()` | none |
| `akash.bme.v1.Query/VaultState` | none | PDA `["bme-state"]` + vault token account balance | view `BurnMintEscrow.vaultState()` | Vault AKT = token-account balance (Solana) / contract AKT balance (EVM); pending balances netted per CR formula (D-20) |
| `akash.bme.v1.Query/Status` | none | `["bme-state"]` (mint status, previous, CR, backoff) | view `BurnMintEscrow.status()` | none |
| `akash.bme.v1.Query/LedgerRecords` | filters, pagination | pending: queue PDAs (live); executed/canceled: indexer ONLY | pending: view/iterable queue; executed/canceled: indexer ONLY | Delta: executed/canceled ledger is not stored on-chain on targets; events are the record (D-23, §3.4) |
| `akash.oracle.v2.Query/Prices` | source/denom filters | Pyth AKT/USD price account (live); history: indexer | `IPyth.getPriceUnsafe` (live); history: indexer | Per-source price rows disappear (Pyth aggregates upstream) |
| `akash.oracle.v2.Query/AggregatedPrice` | `DataID{akt,usd}` | Pyth price account read with staleness/confidence bounds from config | `IPyth.getPriceNoOlderThan(feedId, maxAge)` | This is the protocol-facing read used by BME/escrow paths |
| `akash.oracle.v2.Query/Params` | none | `["config"]` oracle section | view `AkashConfig.oracleParams()` | §5.4 |
| `akash.provider.v1beta4.Query/Providers` | pagination | indexer | indexer | none |
| `akash.provider.v1beta4.Query/Provider` | `owner` | PDA `["provider", owner]` (authoritative) | view `ProviderRegistry.providers(addr)` | none |
| `akash.audit.v1.Query/AllProvidersAttributes` | pagination | indexer | indexer | none |
| `akash.audit.v1.Query/ProviderAttributes` | `owner`, pagination | indexer (all auditors for provider) | indexer | Per-pair PDAs are not enumerable on-chain |
| `akash.audit.v1.Query/ProviderAuditorAttributes` | `owner`, `auditor` | PDA `["audit", provider, auditor]` (authoritative) | view `AuditRegistry.attributes(provider, auditor)` | The bid-matching read path: MUST be on-chain-readable (used inside `create_bid`) |
| `akash.audit.v1.Query/AuditorAttributes` | `auditor`, pagination | indexer | indexer | none |
| `akash.cert.v1.Query/Certificates` | owner/serial/state filter | n/a: not ported (D-10); historical certs in archive ([06](./06-state-and-data-migration.md)) | n/a | Provider key lookups go to the provider registry instead |
| `akash.epochs.v1beta1.Query/EpochInfos` | none | `["bme-state"]` next-epoch timestamps | view `BurnMintEscrow.epochs()` | Generic epochs module has no successor; only bme epochs survive (§3.5) |
| `akash.epochs.v1beta1.Query/CurrentEpoch` | epoch id | same | same | none |
| `akash.discovery.v1.Discovery/GetInfo` (+ REST `/akash/discovery/v1/info`) | none | akash-config version registry account (program versions, min client version) + on-chain Anchor IDL accounts | `AkashConfig.versions()` + published ABI registry | Client version negotiation moves to config + Console `/info` ([07](./07-offchain-and-clients.md)); today: `app/app.go:538-578`, consumed by chain-sdk |

---

## 3. State-object mapping

### 3.1 Conventions

- Every live entity is its own Solana account / EVM struct (D-23). Terminal state ⇒ account closed,
  rent refunded; history thereafter only in the indexer.
- Cosmos `LegacyDec` (18 fractional digits) → Solana `u128` fixed-point ×1e18 / EVM `uint256` ×1e18
  (WAD). Plain token amounts → `u64` micro-units (Solana) / `uint256` micro-units (EVM).
- All Cosmos block-height fields (`CreatedAt`, `SettledAt`, `Depositor.Height`, reclamation
  `StartedAt`) → unix-seconds `i64`/`uint64` timestamps (D-21). Rates → per-second (§7.3).
- EVM entity keys: `bytes32 id = keccak256(abi.encode(...))` of the ID tuple, stored in mappings.

### 3.2 x/deployment (store `deployment`, `x/deployment/keeper/keeper.go:63-66`)

| Cosmos object (key) | Solana account | EVM storage | Representation deltas |
|---|---|---|---|
| `v1.Deployment{ID{Owner,DSeq}, State(active/closed), Hash, CreatedAt, Reclamation{MinWindow}}`; IndexedMap @ `0x11 0x00`, state index @ `0x11 0x02` | PDA `["deployment", owner, dseq]` (akash-deployment). init: `create_deployment` / close: `finalize_deployment_close` / rent: tenant→tenant | `DeploymentRegistry`: `mapping(bytes32 => Deployment)`, id = keccak(owner,dseq) | State index → indexer. `Hash` = 32-byte SDL manifest hash (unchanged). `CreatedAt` height→timestamp |
| `v1beta4.Group{ID{Owner,DSeq,GSeq}, State(open/paused/insufficient_funds/closed), GroupSpec{Name, Requirements, Resources[]{cpu,mem,storage,gpu,endpoints, Count, Price DecCoin}}, CreatedAt}`; IndexedMap, indexes by state + deployment @ `0x12 0x03` | PDA `["group", owner, dseq, gseq]`. init: `create_deployment`/`start_group` / close: with deployment finalization / rent: tenant→tenant | `mapping(bytes32 => Group)` | `Price DecCoin` (uact per block) → `price_per_second` u128 ×1e18 micro-ACT (§7.3). GroupSpec serialized Borsh/ABI; size-bounded (SDL stays off-chain, only spec summary on-chain as today) |
| per-tenant dseq counter (implicit today: client defaults dseq = current block height) | PDA `["tenant", owner]` `{next_dseq u64}`. init: first `create_deployment` / never closed / rent: tenant | `mapping(address => uint64) nextDseq` | D-09/Q-12: explicit monotonic counter replaces height-derived convention; old/new histories namespaced by chain-id in indexer |
| `pendingDenomMigrations Map[DeploymentID, Int]` @ `0x13 0x01` (AKT→ACT scratch; drained by v2.1.0) | not ported | not ported | Transitional artifact; excluded from snapshot transform ([06](./06-state-and-data-migration.md)) |
| `Params{MinDeposits Coins}` Item | `["config"]` deployment section | `AkashConfig` | §5.1 |

### 3.3 x/market (store `market`, keys `x/market/keeper/keys/key.go:29-56`)

| Cosmos object (key) | Solana account | EVM storage | Representation deltas |
|---|---|---|---|
| `Order{ID{Owner,DSeq,GSeq,OSeq}, State(open/active/closed), Spec GroupSpec, CreatedAt, Reclamation}`; IndexedMap @ `0x11 0x01`, state/group indexes | PDA `["order", owner, dseq, gseq, oseq]` (akash-market) + `bid_count u32`. init: CPI from deployment / close: `close_lost_bid` sweep completion or order close / rent: tenant→tenant | `Marketplace`: `mapping(bytes32 => Order)` | `bid_count` field replaces `BidCountForOrder` index scan (enforces `OrderMaxBids`) |
| `Bid{ID{Owner,DSeq,GSeq,OSeq,Provider,BSeq}, State(open/active/lost/closed), Price DecCoin, CreatedAt, ResourcesOffer, ReclamationWindow}`; IndexedMap @ `0x12 0x02`, indexes by state/provider/order | PDA `["bid", owner, dseq, gseq, oseq, provider]`. init: `create_bid` / close: `close_bid`/`close_lost_bid` / rent: provider→provider | `mapping(bytes32 => Bid)`, id incl. provider | `bseq` dropped from key (chain enforces `bseq == 0` at create, `server.go`); retained as constant 0 in API shapes for client compat. Price → per-second u128 ×1e18 |
| `Lease{ID, State(active/insufficient_funds/closed/reclaiming), Price DecCoin, CreatedAt, ClosedOn, Reason, Reclamation{Window,StartedAt,Deadline,Reason}}`; IndexedMap @ `0x13 0x02` | PDA `["lease", owner, dseq, gseq, oseq, provider]`. init: `create_lease` / close: `close_lease`/cascade / rent: tenant→tenant | `mapping(bytes32 => Lease)` | `ClosedOn` height→timestamp; `Reclamation.StartedAt/Deadline` already time-friendly (deadline is blockTime-based today, `server.go:338-379`). `LeaseClosedReason` enum values preserved verbatim (Invalid=0, Owner=1, Unstable=10000, Decommissioned=10001, Unspecified=10002, ManifestTimeout=10003, InsufficientFunds=20000) |
| `Params` Item @ `0x14 0x00` | `["config"]` market section | `AkashConfig` | §5.2 |

### 3.4 x/escrow (store `escrow`, raw KV, `x/escrow/keeper/key.go:19-26`) and x/bme (store `bme`, `x/bme/keeper/key.go:12-26`)

| Cosmos object (key) | Solana account | EVM storage | Representation deltas |
|---|---|---|---|
| escrow `Account{ID{Scope(deployment/bid), XID}, State}` + `AccountState{Owner, State(open/closed/overdrawn), Transferred DecCoins, SettledAt height, Funds []Balance (LegacyDec, negative = overdrawn marker), Deposits []Depositor}`; key `0x11 0x00 + state byte + id` (state-in-key; lookups probe 3 prefixes, `keeper.go:1335-1375`) | deployment scope: PDA `["account", 0x01, owner, dseq]`; bid scope: PDA `["account", 0x02, owner, dseq, gseq, oseq, provider]` (akash-escrow). init: CPI from deployment/market / close: account close after refunds / rent: creator→creator. AKT vault = ATA(account PDA, AKT mint), created on first AKT deposit, closed with account | `EscrowVault`: `mapping(bytes32 => Account)`; AKT/ACT balances held by the contract, attributed in the struct | Three deliberate re-representations: (1) state-in-key → explicit `state` enum field; (2) negative `Funds` overdrawn marker → non-negative per-denom balances + explicit `debt` u128 field; (3) `SettledAt` height → `settled_at` unix i64. `Transferred` → cumulative u128 per denom. ACT "funds" are ledger numbers backed by burn/mint (D-19). No ACT token account exists (Solana); EVM holds restricted ACT directly |
| escrow `Depositor{Owner, Height, Source(balance/grant), Balance DecCoin}` (ordered list, FIFO refunds, `keeper.go:1211-1280`) | `Vec<Depositor{owner: Pubkey, deposited_at: i64, source: enum{Balance, Allowance}, balance: u128}>` inside the account (bounded `MAX_DEPOSITORS`, config §5.1) | `Depositor[]` in Account struct (same bound) | FIFO order + grant-restore-on-refund preserved (D-21). Cosmos list is unbounded in code but practically bounded (single authz depositor rule); target sets an explicit bound |
| escrow `Payment{ID{AID, XID=lease}, State}` + `PaymentState{Owner(payee), State, Rate DecCoin/block, Balance DecCoin, Unsettled DecCoin, Withdrawn Coin}`; key `0x12 0x00 + state byte + id` | PDA `["payment", account_pubkey, gseq, oseq, provider]`. init: `create_payment` (CPI from market) / close: payment close / rent: tenant→tenant | `mapping(bytes32 => Payment)` | `Rate` per-block LegacyDec → `rate_per_second` u128 ×1e18 micro-ACT (§7.3; D-21; u64 micro-ACT/s alone is insufficient: typical rates are fractional micro-units per second). `Balance` (accrued unwithdrawn) → u128 ×1e18; `Unsettled` debt → explicit `debt` field; `Withdrawn` → u64 micro. AKT-fallback settlement path (BME-halted, priced via oracle, `keeper.go:609-687`) preserved as instruction branch |
| escrow `BmeAccountsPrefix` @ `0x14 0x01` (declared, unused) | not ported | not ported | Dead key |
| bme `status Item` @ `0x04 0x00` `{Status MintStatus(healthy/warning/halt_cr/halt_oracle), PreviousStatus, EpochHeightDiff}` | PDA `["bme-state"]` (akash-bme): `{mint_status, previous_status, cr_bps, epoch_backoff_secs, next_mint_epoch_at i64, next_burn_epoch_at i64, pending_uakt u64, pending_uact u64, total_burned {uakt,uact} u128, total_minted {uakt,uact} u128, remint_credits {uakt,uact} u128, next_record_seq u64}`. init: program init / never closed | `BurnMintEscrow` top-level storage (same fields) | Consolidates 7 Cosmos collections (status, epochs map keys "mint"/"burn", ledgerPendingBalances, totalBurned, totalMinted, remintCredits, ledgerSequence) into one state account/contract storage. `EpochHeightDiff` (blocks) → seconds; transient per-block sequence → persistent global `next_record_seq` (LedgerRecordID `{Denom,ToDenom,Source,Height,Sequence}` → global u64 seq) |
| bme `ledgerPending Map[LedgerRecordID, LedgerPendingRecord{Owner, To, CoinsToBurn, DenomToMint, Attempts}]` @ `0x03 0x01` | PDA per record `["bme-pending", seq]`. init: `request_burn_mint` / close: `crank_epoch` (execute or cancel) / rent: requester→requester | queue mapping `(uint64 seq => PendingRecord)` + head/tail cursors | Retry semantics preserved: `Attempts` ≤ `MaxPendingAttempts`, cancel at max (D-20) |
| bme `ledger` (executed records) @ `0x03 0x02`, `ledgerCanceled` @ `0x03 0x04` | NOT stored on-chain: emitted as events, indexer is the record (D-23) | same | Query delta noted in §2 (`LedgerRecords`) |
| bme `Params` Item @ `0x09 0x00` | `["config"]` bme section | `AkashConfig` | §5.3 |

### 3.5 x/oracle, x/epochs

| Cosmos object (key) | Solana account | EVM storage | Representation deltas |
|---|---|---|---|
| oracle `latestPriceID`, `prices` (per-source timestamped records), `aggregatedPrices`, `pricesHealth`, `sourceSequence`/`sourceID`, transient `pricesSequence` (`x/oracle/keeper/key.go:12-24`) | All replaced by the Pyth AKT/USD price(-update) account; consumers read price, confidence, publish_time directly (D-13, D-22) | Replaced by Pyth contract storage (`IPyth`) | On-chain per-source history, TWAP/median aggregation, and health tracking retire; staleness/deviation enforcement moves to consuming programs using §5.4 config bounds. Price history for analytics → indexer |
| oracle `Params` | `["config"]` oracle section (feed ID, max age, deviation bound) | `AkashConfig` | §5.4 |
| epochs `EpochInfo{ID, StartTime, Duration, CurrentEpoch, CurrentEpochStartTime/Height, EpochCountingStarted}`; named epochs `"hour"` (oracle prune), `"bme"` | Not ported as a module. bme epochs live in `["bme-state"]` (§3.4); `"hour"` prune epoch has no successor (no on-chain price history to prune) | same | Epoch scheduling becomes timestamp comparison inside `crank_epoch` / keeper job (D-20) |

### 3.6 x/provider, x/audit, x/cert, awasm

| Cosmos object (key) | Solana account | EVM storage | Representation deltas |
|---|---|---|---|
| `Provider{Owner, HostURI, Attributes, Info{EMail, Website}}`; raw KV `ProviderPrefix ‖ len-prefixed addr` | PDA `["provider", owner]` (akash-provider-registry). init: `create_provider` / close: `delete_provider` / rent: provider→provider | `ProviderRegistry`: `mapping(address => Provider)` | Adds `signing_keys` (rotating operator hot keys for JWT auth) + TLS SPKI hash anchors (D-10/D-10.a) and optional collateral fields (Q-08); owner address = cold owner authority. Attributes bounded; account realloc on update (Solana) |
| `AuditedAttributesStore{Attributes}` keyed `owner ‖ auditor` (read model `AuditedProvider{Owner, Auditor, Attributes}`) | PDA `["audit", provider, auditor]` (akash-audit). init: `sign_provider_attributes` / close: full delete / rent: auditor→auditor | `AuditRegistry`: `mapping(bytes32 (provider,auditor) => Attributes)` | 1:1; consumed on-chain by `create_bid` attribute matching |
| `Certificate{State(valid/revoked), Cert PEM, Pubkey}` keyed `owner ‖ serial` (≤40-byte serial) | not ported (D-10) | not ported | Archived at halt ([06](./06-state-and-data-migration.md)); replacement = registry signing keys + JWT ([07](./07-offchain-and-clients.md)) |
| awasm `Params{BlockedAddresses}` | not ported (D-22) | not ported | Filter layer has no successor |

---

## 4. Event mapping

Solana: Anchor events emitted via event-CPI (log-truncation-safe), names = Cosmos names minus the
`Event` prefix. EVM: Solidity events; `indexed` fields chosen to match today's indexer access
patterns (by owner, by provider). The legacy string-event convention
`sdkutil.BaseModuleEvent{module, action}` under `EventTypeMessage = "akash.v1"`
(`pkg.akt.dev/go/sdkutil/event.go`) is fully superseded by these typed events; the canonical
event-schema registry (names, versions, indexer topics) is maintained in
[07](./07-offchain-and-clients.md).

| Cosmos typed event (fields) | Anchor event | EVM event signature | Notes |
|---|---|---|---|
| `deployment/v1.EventDeploymentCreated{ID, Hash}` | `DeploymentCreated{owner, dseq, hash}` | `DeploymentCreated(address indexed owner, uint64 indexed dseq, bytes32 hash)` | none |
| `EventDeploymentUpdated{ID, Hash}` | `DeploymentUpdated{owner, dseq, hash}` | `DeploymentUpdated(address indexed owner, uint64 indexed dseq, bytes32 hash)` | none |
| `EventDeploymentClosed{ID}` | `DeploymentClosed{owner, dseq}` | `DeploymentClosed(address indexed owner, uint64 indexed dseq)` | none |
| `EventGroupStarted{ID}` | `GroupStarted{owner, dseq, gseq}` | `GroupStarted(address indexed owner, uint64 indexed dseq, uint32 gseq)` | none |
| `EventGroupPaused{ID}` | `GroupPaused{owner, dseq, gseq}` | `GroupPaused(address indexed owner, uint64 indexed dseq, uint32 gseq)` | none |
| `EventGroupClosed{ID}` | `GroupClosed{owner, dseq, gseq}` | `GroupClosed(address indexed owner, uint64 indexed dseq, uint32 gseq)` | none |
| `market/v1.EventOrderCreated{ID}` | `OrderCreated{owner, dseq, gseq, oseq}` | `OrderCreated(address indexed owner, uint64 indexed dseq, uint32 gseq, uint32 oseq)` | Bid engines' primary trigger |
| `EventOrderClosed{ID}` | `OrderClosed{...}` | `OrderClosed(address indexed owner, uint64 indexed dseq, uint32 gseq, uint32 oseq)` | none |
| `EventBidCreated{ID, Price}` | `BidCreated{order_id, provider, price_per_second}` | `BidCreated(bytes32 indexed orderId, address indexed provider, uint256 pricePerSecond)` | Price basis converted (§7.3) |
| `EventBidClosed{ID}` | `BidClosed{order_id, provider}` | `BidClosed(bytes32 indexed orderId, address indexed provider)` | Emitted for lost bids too |
| `EventLeaseCreated{ID, Price}` | `LeaseCreated{lease_id, price_per_second}` | `LeaseCreated(bytes32 indexed leaseId, address indexed owner, address indexed provider, uint256 pricePerSecond)` | Provider daemon deploy trigger |
| `EventLeaseClosed{ID, Reason}` | `LeaseClosed{lease_id, reason}` | `LeaseClosed(bytes32 indexed leaseId, uint32 reason)` | `LeaseClosedReason` codes preserved (§3.3) |
| `EventLeaseReclaimStarted{ID, Reason, Deadline}` | `LeaseReclaimStarted{lease_id, reason, deadline}` | `LeaseReclaimStarted(bytes32 indexed leaseId, uint32 reason, uint64 deadline)` | D-24 |
| `bme/v1.EventMintStatusChange{PreviousStatus, NewStatus, CollateralRatio}` | `MintStatusChange{previous, new, cr_bps}` | `MintStatusChange(uint8 previous, uint8 next, uint32 crBps)` | Emitted by `crank_epoch`/`executeEpoch` on transitions; primary circuit-breaker monitor signal ([08](./08-security-and-audits.md)) |
| `EventVaultFunded{Amount, Source, NewVaultBalance}` | `VaultFunded{amount, source, new_balance}` | `VaultFunded(uint256 amount, address indexed source, uint256 newBalance)` | Gov-gated path + S1 seeding (D-05) |
| `EventLedgerRecordExecuted{ID, BurnedFrom, MintedTo, Burner, Minter, Burned CoinPrice, Minted CoinPrice, Spread, RemintCreditIssued/Accrued}` | `LedgerRecordExecuted{seq, ...same fields, prices ×1e18}` | `LedgerRecordExecuted(uint64 indexed seq, ...)` | System of record for executed swaps (§3.4): indexer MUST persist losslessly |
| `EventLedgerRecordCanceled{ID, CancelReason, Owner, To, CoinsToBurn, DenomToMint}` | `LedgerRecordCanceled{seq, reason, ...}` | `LedgerRecordCanceled(uint64 indexed seq, uint8 reason, ...)` | Incl. `MaxAttempts` cancels |
| `oracle/v2.EventPriceData{Source, Id, Price, Timestamp}` | n/a: superseded by Pyth's own feed updates | n/a: Pyth `PriceFeedUpdate` event | Indexer ingests Pyth updates for price history |
| `EventPriceStaleWarning{Id, LastHeight, BlocksToStall}` | n/a: off-chain monitor on Pyth publish_time age | n/a: same | Alerting moves to ops monitoring ([08](./08-security-and-audits.md)); on-chain effect surfaces as `MintStatusChange(halt_oracle)` |
| `EventPriceStaled{Id, LastHeight}` | n/a (as above) | n/a | none |
| `EventPriceRecovered{Id, Height}` | n/a (as above) | n/a | none |
| `EventAggregatedPrice{Price}` | n/a: no on-chain aggregation | n/a | none |
| `provider/v1beta4.EventProviderCreated{Owner}` | `ProviderCreated{owner}` | `ProviderCreated(address indexed owner)` | none |
| `EventProviderUpdated{Owner}` | `ProviderUpdated{owner}` | `ProviderUpdated(address indexed owner)` | none |
| `EventProviderDeleted{Owner}` (in proto, never emitted; delete unimplemented) | `ProviderDeleted{owner}` | `ProviderDeleted(address indexed owner)` | Actually emitted on targets (§1.6 delta) |
| `audit/v1.EventTrustedAuditorCreated{Owner, Auditor}` | `TrustedAuditorCreated{owner, auditor}` | `TrustedAuditorCreated(address indexed owner, address indexed auditor)` | none |
| `EventTrustedAuditorDeleted{Owner, Auditor}` | `TrustedAuditorDeleted{owner, auditor}` | `TrustedAuditorDeleted(address indexed owner, address indexed auditor)` | none |
| `epochs/v1beta1.EventEpochEnd{EpochNumber}` / `EventEpochStart{EpochNumber, EpochStartTime}` | `EpochExecuted{kind(mint/burn), epoch_at, records_processed}` emitted by `crank_epoch` | `EpochExecuted(uint8 kind, uint64 epochAt, uint32 processed)` | Only bme epochs survive; generic module retired (§3.5) |
| `wasm/v1.EventMsgBlocked{ContractAddress, MsgType, Reason}` (context) | n/a: awasm not ported (D-22) | n/a | none |
| none (escrow emits NO events today; state changes surface via market hooks only) | NEW: `AccountDeposited`, `PaymentSettled`, `PaymentWithdrawn`, `AccountOverdrawn`, `AccountClosed{refunds[]}` | NEW: same names as Solidity events | Deliberate addition: with lazy settlement + indexer-as-history (D-21/D-23), escrow lifecycle MUST be event-visible; schema in [07](./07-offchain-and-clients.md) |

---

## 5. Parameter mapping

Target locations: Solana = the `["config"]` account of `akash-config` (one account, per-module
sections); EVM = `AkashConfig` storage. Mutability: **DAO** = changeable by governance
(Realms executor / `AkashTimelock`, D-11); **immutable** = compile-time/launch constant. Defaults
below are the current-chain values (code-cited); launch values are the same unless a decision says
otherwise.

### 5.1 x/deployment (`deployment/v1beta4/params.go:32-38`) + escrow bounds

| Param | Current default | Target location | Mutability | Notes |
|---|---|---|---|---|
| `MinDeposits` (Coins) | `500000uakt, 500000uact` | config.deployment.min_deposits | DAO | Per-denom validation preserved; uakt entry applies to `account_deposit` top-ups (create is ACT-only, §1.1) |
| (new) `MAX_DEPOSITORS` per escrow account | n/a (unbounded in code) | config.escrow.max_depositors (initial value 16) | DAO | Target-only bound required by fixed account sizing (§3.4); DAO-config parameter, initial value 16 (13 §amendments) |

### 5.2 x/market (`market/v1beta5/params.go:16-58`)

| Param | Current default | Target location | Mutability | Notes |
|---|---|---|---|---|
| `BidMinDeposit` (Coin, legacy) | `500000uakt` | dropped | none | Superseded by `BidMinDeposits`; not carried |
| `BidMinDeposits` (Coins) | `500000uakt, 500000uact` | config.market.bid_min_deposits | DAO | Provider bid collateral |
| `OrderMaxBids` | `20` (validation cap 500) | config.market.order_max_bids | DAO | Enforced via order `bid_count` (§3.3); EVM `createLease` loop bound; raising it has gas implications (04) |
| `MinReclamationWindow` | `1h` | config.market.min_reclamation_window_secs | DAO | D-24 |
| `MaxReclamationWindow` | `720h` | config.market.max_reclamation_window_secs | DAO | D-24 |

### 5.3 x/bme (`bme/v1/params.pb.go`; defaults per research pack / `pkg.akt.dev/go/node/bme/v1/params.go`)

| Param | Current default | Target location | Mutability | Notes |
|---|---|---|---|---|
| `CircuitBreakerWarnThreshold` | `9500` bps | config.bme.cr_warn_bps | DAO | warn > halt, both ≤ 10000 (validation preserved) |
| `CircuitBreakerHaltThreshold` | `9000` bps | config.bme.cr_halt_bps | DAO | D-20 carries both defaults |
| `MinEpochBlocks` | `10` blocks | config.bme.min_epoch_secs = `65` | DAO | ×6.5 s/block conversion (D-20/D-21 time basis) |
| `EpochBlocksBackoffPercent` | `10` % | config.bme.epoch_backoff_pct | DAO | Backoff formula unchanged; cap 14400 blocks → `93600` s |
| `MintSpreadBps` | `25` | config.bme.mint_spread_bps | DAO | ≤ 1000 validation preserved |
| `SettleSpreadBps` | `0` | config.bme.settle_spread_bps | DAO | ≤ 1000 |
| `MaxEndblockerRecords` | `50` | config.bme.max_records_per_crank | DAO | Per `crank_epoch` call / keeper run (D-20) |
| `MinMint` | `10,000,000uact` | config.bme.min_mint | DAO | none |
| `MaxPendingAttempts` | `3` | config.bme.max_pending_attempts | DAO | Backfilled to 3 by v2.1.0 upgrade if zero |

### 5.4 x/oracle (`oracle/v2` params; defaults `x/oracle` research pack `params.go:31-46`)

| Param | Current default | Target location | Mutability | Notes |
|---|---|---|---|---|
| `Sources` | `[akash1nc5tatafv6eyq7llkr2gv50ff9e22mnf70qgjlv737ktmt4eswrqyagled]` (single CosmWasm Pyth contract) | replaced: config.oracle.pyth_feed_id (+ Solana feed account) | DAO | Trust root moves to Pyth attestation (D-13); `[TO-VERIFY: Pyth AKT/USD feed ID]` |
| `MinPriceSources` | `1` | n/a | none | Pyth aggregates publishers upstream |
| `MaxPriceStalenessPeriod` | `30s` | config.oracle.max_price_age_secs = 30 | DAO | Enforced at every protocol read (`getPriceNoOlderThan` / receiver check) |
| `TwapWindow` | `5s` | n/a (option: read Pyth EMA price for smoothing) | none | On-chain TWAP retired; parity decision for BME pricing in 03/04 |
| `MaxPriceDeviationBps` | `150` | config.oracle.max_deviation_bps | DAO | Retained as sanity bound: reject spot price deviating > bound from Pyth EMA/confidence |
| `PriceRetention` | `24h` | n/a | none | No on-chain history to retain |
| `PruneEpoch` | `"hour"` | n/a | none | No pruning needed |
| `MaxPrunePerEpoch` | `1000` | n/a | none | none |
| `MaxFutureTimeDrift` | `10s` | n/a | none | Pyth receiver validates publish_time |
| `FeedContractsParams` | `[]*Any` (feed contract config) | folded into config.oracle.pyth_feed_id | DAO | none |

### 5.5 awasm + dead take module

| Param | Current default | Target location | Mutability | Notes |
|---|---|---|---|---|
| awasm `BlockedAddresses` | `[]` | n/a (D-22) | none | No filter layer on targets |
| take `DefaultTakeRate` / `DenomTakeRates[uakt]` | `20` % / `2` % (DEAD: store deleted v2.0.0, module unwired; providers keep 100% today) | no take at launch (parity). Placeholder config.escrow.take_rate_bps = 0 reserved for future DAO decision | DAO | Historical only (`x/take`, `pkg.akt.dev/go/node/take/v1/params.go:29-38`); any future fee is a config addition to the escrow payout path, not a token-layer hook (see D-03 detail) |

### 5.6 Chain-level parameters (from `cmd/akash/cmd/genesis.go:219-299`, intended genesis values; live akashnet-2 state may differ: `[TO-VERIFY: live param values via state export, Q-19]`)

| Param | Current value | Target disposition | Notes |
|---|---|---|---|
| staking.UnbondingTime | 14 days | n/a post-migration (D-06) | No sovereign staking |
| staking.MaxValidators | 100 | n/a | none |
| staking.BondDenom | uakt | n/a | none |
| staking.MinCommissionRate | 0.05 | n/a | none |
| mint (inflation) params | NOT in repo; on-chain state only (Q-19) | replaced by `akash-emissions`/`EmissionsMinter` schedule (D-12, curve per Q-01) | Modeling input for [05](./05-token-migration.md) |
| distribution.CommunityTax | 0 | n/a: treasury funded by emissions split (D-12) | none |
| distribution.WithdrawAddrEnabled | true | n/a | none |
| gov.MinDeposit | 2,500,000,000 uakt (2,500 AKT) | Realms proposal-creation threshold / `AkashGovernor.proposalThreshold`; values set at G1 (D-11) | No deposit-refund/burn mechanic on targets |
| gov.MaxDepositPeriod | 14 days | n/a (no deposit phase) | none |
| gov.VotingPeriod | 3 days | Realms voting time / `votingPeriod`; set at G1 (D-11) | none |
| gov.Quorum | 0.2 | Realms vote threshold config / `quorum()`; set at G1 | none |
| gov MaxMetadataLen | 10200 (`app/types/app.go:377-379`) | n/a: proposal metadata off-chain in both stacks | Off-chain gov tooling note for [07](./07-offchain-and-clients.md) |
| slashing.SignedBlocksWindow | 30000 | n/a post-migration | none |
| slashing.MinSignedPerWindow | 0.05 | n/a | none |
| slashing.DowntimeJailDuration | 1 min | n/a | none |
| slashing.SlashFractionDoubleSign | 0.05 | n/a | none |
| slashing.SlashFractionDowntime | 0 | n/a | none |
| crisis.ConstantFee | 500,000,000,000 uakt | n/a (invariants module unwired anyway) | none |
| min gas price | 0.0025 vs 0.025 uakt (inconsistent: `cmd/akash/cmd/config.go:26` vs `util/cli/configs.go:361`) | n/a: target fee regimes per §7.4 | Known defect; do not port |
| block time | 6.5 s target (`util/network/network.go:8`) | conversion constant for §7.3 only | none |
| auth unordered txs | enabled (`app/types/app.go:279`) | see §7.4 sequence row | Client/indexer assumption |

---

## 6. Module-account mapping

Current perms per `app/mac.go:15-27`; `allowedReceivingModAcc` is EMPTY ⇒ every module account is
blocked from receiving external bank sends today.

| Module account (perms) | Solana | EVM | Notes |
|---|---|---|---|
| `escrow` (no perms) | Per-escrow-account token accounts: each escrow account PDA owns its own AKT ATA (§3.4); no pooled vault | `EscrowVault` contract holds AKT/ACT with per-account struct attribution | DELIBERATE DIFFERENCE (Solana): Cosmos pools all escrow funds in one module account with logical attribution; Solana segregates funds per entity, so mis-attribution becomes structurally impossible and write contention is per-lease (D-23). Balance at S1 → Wind-down Reserve (D-05) |
| `bme` (Burner, Minter) | `akash-bme`: vault = AKT token account owned by PDA `["vault"]`; ACT mint+burn authority = PDA `["mint-authority"]` (D-19) | `BurnMintEscrow` holds vault AKT; has mint/burn rights on `ACT` (role-gated) | Vault seeded from migrated bme module balance (D-20 via D-05). Burner/Minter perms → explicit mint-authority PDAs / `MINTER_ROLE` |
| `fee_collector` (no perms) | n/a: tx fees go to Solana validators (burn+tips) | n/a: gas to the host-chain sequencer | No protocol fee capture today (take dead); §5.5 |
| `distribution` (no perms) | n/a: community pool balance at S1 → Wind-down Reserve → DAO treasury (Realms treasury account) | → `AkashTimelock`-owned treasury | [05](./05-token-migration.md); precedent: v2.1.0 already moved 427,414,453 uakt distribution→escrow imperatively (`upgrades/software/v2.1.0/upgrade.go:88-108`) |
| `mint` (Minter) | `akash-emissions` PDA holds AKT mint authority post-claims (D-03, D-12) | `EmissionsMinter` sole minter alongside `MigrationClaims` (D-04) | Sovereign inflation ends at halt |
| `bonded_tokens_pool` (Burner, Staking) | n/a: bonded stake credited liquid at S1 (D-06) | n/a | none |
| `not_bonded_tokens_pool` (Burner, Staking) | n/a: unbonding stake credited liquid at S1 (D-06) | n/a | none |
| `gov` (Burner) | Realms governance PDAs (proposal escrows) | `AkashGovernor`/`AkashTimelock` | Live gov deposits at S1 reserved and resolved per [05](./05-token-migration.md) |
| `transfer` / ibc (Minter, Burner) | n/a: IBC escrow balances at S1 reserved; stranded vouchers per D-07 | n/a | none |
| receive-blocking (`allowedReceivingModAcc` empty, `app/app.go:85,496-504`) | Program vaults writable only via program instructions (owner = program PDAs), an equivalent guarantee | Cannot block bare ERC-20 transfers to a contract address: guard via internal accounting + `sweep()` for unattributed AKT | EVM delta flagged for [08](./08-security-and-audits.md) monitoring |

---

## 7. Identity, units, time & fees

### 7.1 Identity

| Cosmos | Solana | EVM | Notes |
|---|---|---|---|
| `akash1…` bech32 account (secp256k1; addr = ripemd160(sha256(pubkey))) | base58 ed25519 pubkey (32 B) | `0x…` 20-B EIP-55 (keccak of secp256k1 pubkey) | NO derivation mapping in either direction; linkage established only by signed claim (old key authorizes new address) per [05](./05-token-migration.md) |
| `akashvaloper…` / `akashvalcons…` | n/a post-migration | n/a | Validator identities end (D-06) |
| Module account address (`authtypes.NewModuleAddress`) | Program PDA | Contract address | §6 |
| x509 cert identity (x/cert) | wallet signature + provider registry signing keys (D-10) | same | [07](./07-offchain-and-clients.md) |

### 7.2 Units & sequences

| Cosmos | Solana | EVM | Notes |
|---|---|---|---|
| `uakt` (10⁻⁶ AKT; display `akt`) | AKT Token-2022 mint base unit, 6 decimals (D-03) | `AKT` ERC-20, 6 decimals (D-04) | 1:1 micro-unit parity by design |
| `uact` (10⁻⁶ ACT; `SendEnabled=false`) | ACT Token-2022 NonTransferable mint, 6 decimals (D-19) | `ACT` restricted ERC-20, 6 decimals | Wallet presentation per Q-16 |
| `uusd` (oracle quote, exponent 6) | Pyth USD quote, exponent −8 | same | ×100 rescale at every oracle read; implement once in a shared price lib |
| `LegacyDec` (18 fractional digits) | u128 fixed-point ×1e18 | uint256 ×1e18 (WAD) | Used for rates, prices, CR math |
| `dseq` u64 (client convention: creation block height; user-choosable) | per-tenant counter PDA (§3.2) | `nextDseq[owner]` | D-09/Q-12. Indexers namespace (chain, owner, dseq): old heights and new counters may numerically overlap |
| `gseq` u32 (1..N), `oseq` u32 (bumps on relist/restart) | identical u32 semantics | identical | none |
| `bseq` u32 (MUST be 0 at CreateBid today) | constant 0 in API shapes; not in bid PDA seeds | constant 0; not in bid id hash | Kept for wire-shape compat only |
| Tx hash: uppercase hex SHA-256, 64 chars | base58 tx signature (first sig, 64 B) | `0x` + 64 hex keccak256 | Explorer/Console link formats change (A-11, [07](./07-offchain-and-clients.md)) |
| Account `sequence` (+ unordered txs enabled today) | recent-blockhash validity window; durable nonce opt-in for offline signers | strict per-account nonce | EVM is a regression for parallel submitters vs unordered txs; provider daemon queues per-key ([07](./07-offchain-and-clients.md)) |

### 7.3 Time basis (D-21)

| Concept | Cosmos today | Solana | EVM | Rule |
|---|---|---|---|---|
| Clock | block height; 6.5 s target block time | `Clock` sysvar `unix_timestamp` (slots ≈ 400 ms are NOT the protocol clock) | `block.timestamp` (seconds-scale host-chain blocks, e.g. Base ≈ 2 s) | All protocol state/durations in unix seconds |
| Streaming rate | `Rate DecCoin` per block | `rate_per_second` u128 ×1e18 micro-ACT | same in uint256 | Conversion at the pricing layer: `rate_per_second = rate_per_block × 2/13` (exact rational for 6.5 s; fixed at S1). Applies to price quoting/tooling parity; live payments do not migrate (D-08) |
| Accrual | `Rate × (height − SettledAt)`, lazy (`x/escrow/keeper/keeper.go:535-604`) | `rate × (now − settled_at)`, lazy + permissionless `settle` | same | D-21 |
| Epochs | bme: every `MinEpochBlocks` blocks via EndBlocker | timestamp-gated, crank-executed | timestamp-gated, keeper-executed | D-20; §5.3 conversion |
| Reclamation deadline | `blockTime + Window` (already time-based) | identical | identical | D-24 |

### 7.4 Fees / gas

| Concept | Cosmos today | Solana | EVM (host chain) | Notes |
|---|---|---|---|---|
| Fee token | uakt (min gas price 0.025 uakt community floor; no fee market) | SOL: 5000 lamports/signature + priority fee (CU price × CU limit, local fee markets) | ETH: EIP-1559 gas + L1 data fee | Users lose "pay fees in AKT" natively |
| AKT fee UX | native | fee-payer sponsorship service co-signs; costs accounted in AKT ([07](./07-offchain-and-clients.md), Q-07) | ERC-4337 paymaster accepting AKT | Operated services; ownership per Q-07 |
| Gas metering | gas wanted/used per msg | compute units (per-tx CU limit; per-writable-account 12M CU/block cap, which motivates D-23 sharding) | gas | Perf targets in [09](./09-testing-and-verification.md) |
| feegrant | `x/feegrant` allowance (tx fees only) | sponsorship service allow-list | paymaster policy | §1.10 |

---

## 8. Error taxonomy mapping

The ~operationally-relevant set (provider daemons, Console, and BME ops branch on these). Cosmos
errors are registered with gRPC codes in `pkg.akt.dev/go` (`node/<module>/.../errors.go`,
`node/escrow/module/error.go:29-47`). Targets: Anchor error enums per program (numeric code = 6000 +
enum index, frozen at IDL freeze, [07](./07-offchain-and-clients.md)); EVM = Solidity custom errors
(4-byte selector from the signature shown). Names below are the stable contract.

| Cosmos error | Condition | Solana (program: error) | EVM custom error | Notes |
|---|---|---|---|---|
| escrow `ErrInvalidDeposit` | deposit sources don't cover amount; bad denom | akash-escrow: `InvalidDeposit` | `InvalidDeposit()` | Incl. allowance shortfall (D-21) |
| escrow `ErrAccountClosed` | op on closed escrow account | akash-escrow: `AccountClosed` | `AccountClosed()` | Solana: also surfaces as account-not-found once closed+reaped; clients treat both as closed |
| escrow `ErrAccountNotFound` | unknown account id | akash-escrow: `AccountNotFound` (Anchor `AccountNotInitialized`) | `AccountNotFound()` | none |
| escrow `ErrAccountOverdrawn` | settle found funds exhausted | akash-escrow: `AccountOverdrawn` | `AccountOverdrawn()` | Explicit `debt` field replaces negative-funds marker (§3.4) |
| escrow `ErrPaymentClosed` | withdraw/close on closed payment | akash-escrow: `PaymentClosed` | `PaymentClosed()` | none |
| escrow `ErrPaymentRateZero` | zero-rate payment create | akash-escrow: `PaymentRateZero` | `PaymentRateZero()` | none |
| escrow `ErrUnauthorizedDepositScope` / `ErrInvalidAuthzScope` | grant used outside its scopes | akash-escrow: `UnauthorizedDepositScope` | `UnauthorizedDepositScope()` | Allowance scopes (§1.10) |
| deployment `ErrDeploymentExists` | duplicate (owner,dseq) | akash-deployment: `DeploymentExists` (Anchor account-already-in-use) | `DeploymentExists()` | Counter-based dseq makes this unreachable except manual dseq reuse |
| deployment `ErrDeploymentClosed` | update/close on closed deployment | akash-deployment: `DeploymentClosed` | `DeploymentClosed()` | none |
| deployment `ErrInvalidDeposit` | create deposit invalid, incl. uakt at create | akash-deployment: `InvalidDeposit` | `DeploymentRegistry.InvalidDeposit()` | ACT-only-at-create parity (§1.1) |
| deployment `ErrInvalidPrice` | group price not uact / non-positive | akash-deployment: `InvalidPrice` | `InvalidPrice()` | D-19 lease pricing stays ACT |
| deployment `ErrGroupNotOpen` / `ErrGroupClosed` / `ErrGroupPaused` | group state gate failures | akash-deployment: `InvalidGroupState{expected, actual}` | `InvalidGroupState(uint8 expected, uint8 actual)` | Collapsed into one parameterized error |
| market `ErrInvalidBid` (wraps "too many existing bids") | bid validation incl. > `OrderMaxBids` (`server.go:45-46`) | akash-market: `InvalidBid`, `TooManyBids` | `InvalidBid()`, `TooManyBids(uint32 max)` | Max-bids split into its own code (operationally distinct for bid engines) |
| market `ErrBidExists` | provider already bid this order | akash-market: `BidExists` | `BidExists()` | none |
| market `ErrBidOverOrder` | bid price > order max price | akash-market: `BidOverOrder` | `BidOverOrder()` | none |
| market `ErrBidInvalidPrice` / `ErrBidZeroPrice` | zero/invalid bid price | akash-market: `BidInvalidPrice` | `BidInvalidPrice()` | none |
| market `ErrAttributeMismatch` / `ErrCapabilitiesMismatch` | provider attrs/capabilities fail order requirements | akash-market: `AttributeMismatch`, `CapabilitiesMismatch` | `AttributeMismatch()`, `CapabilitiesMismatch()` | Matching runs on-chain against registry + audit PDAs (§2) |
| market `ErrOrderNotOpen` | bid/lease on non-open order | akash-market: `OrderNotOpen` | `OrderNotOpen()` | none |
| market `ErrBidNotOpen` / `ErrBidNotActive` | lease-create/close on wrong bid state | akash-market: `InvalidBidState` | `InvalidBidState(uint8)` | none |
| market `ErrLeaseNotActive` | withdraw/reclaim/close on inactive lease | akash-market: `LeaseNotActive` | `LeaseNotActive()` | none |
| market `ErrReclamationNotStarted` | provider close_bid on active lease without reclaim | akash-market: `ReclamationNotStarted` | `ReclamationNotStarted()` | D-24 |
| market `ErrReclamationWindowNotElapsed` | close before deadline | akash-market: `ReclamationWindowNotElapsed` | `ReclamationWindowNotElapsed(uint64 deadline)` | D-24 |
| market `ErrReclamationWindowInvalid` / `...Required` / `...TooShort` | window outside gov bounds / missing / short | akash-market: `ReclamationWindowInvalid` | `ReclamationWindowInvalid()` | Bounds from config (§5.2) |
| bme `ErrOracleUnhealthy` / `ErrZeroPrice` | oracle stale/zero at request or execution | akash-bme: `OracleUnhealthy` | `OracleUnhealthy()` | Raised off Pyth staleness/confidence checks (§5.4) |
| bme `ErrCircuitBreakerActive` | status ≥ halt_cr (except ACT→AKT under CR-halt) | akash-bme: `CircuitBreakerActive` | `CircuitBreakerActive(uint8 status)` | D-20 refund exception preserved |
| bme `ErrInsufficientVaultFunds` | vault can't cover mint/settle | akash-bme: `InsufficientVaultFunds` | `InsufficientVaultFunds()` | none |
| bme `ErrMinimumMint` | mint below `MinMint` | akash-bme: `BelowMinimumMint` | `BelowMinimumMint(uint256 min)` | none |
| bme `ErrEpsilon` | result below denom precision | akash-bme: `AmountBelowPrecision` | `AmountBelowPrecision()` | none |
| oracle `ErrUnauthorizedWriterAddress` | non-source submitted price | n/a: price posting permissionless via Pyth (§1.5) | n/a | Trust-model change, not an error rename |
| oracle `ErrPriceStalled` | price beyond staleness | consumer-side: `StalePrice` in each consuming program | `StalePrice(uint64 age)` | Every consumer enforces the same config bound |

---

## 9. Glossary: Cosmos/Akash ↔ Solana ↔ EVM

| Cosmos / Akash term | Solana equivalent | EVM equivalent |
|---|---|---|
| Module (`x/foo`) + keeper | Program (`akash-foo`) + its state accounts | Contract (`Foo…`) + its storage |
| `Msg` (protobuf tx body) | Instruction | External function call |
| Msg type URL (`/akash…Msg…`) | 8-byte Anchor instruction discriminator | 4-byte function selector |
| Multi-msg tx (atomic) | Multi-instruction transaction (atomic) | Multicall within one tx / one function call |
| KVStore (module store key) | Per-entity accounts owned by the program | Contract storage (mappings/structs) |
| `collections.IndexedMap` secondary index | None on-chain: PDA derivation is the primary key; secondary access via indexer (D-16/D-23) | None on-chain: mapping key primary; indexer secondary |
| Ante handler (sigverify, fees, sequence) | Runtime checks (signatures, blockhash, fee payer) + Anchor account constraints | EVM intrinsic checks + `require`/modifiers |
| BeginBlocker / EndBlocker | Permissionless crank instruction (tip-incentivized) | Keeper automation (Gelato / Chainlink Automation) |
| CacheContext (revert-on-error subcall) | Instruction fails ⇒ whole tx reverts; per-record isolation via separate crank txs | try/catch around external subcall |
| Module hooks (escrow→market) | CPI between programs | Cross-contract call |
| Gov proposal (`x/gov`) | Realms (SPL Governance) proposal | `AkashGovernor` proposal + `AkashTimelock` operation |
| Gov module authority address | Realms governance PDA (executor) | `AkashTimelock` address |
| `MsgUpdateParams` / params subspace | gov-gated write to `["config"]` (akash-config) | gov-gated `AkashConfig` setter |
| Denom (`uakt`) | SPL Token-2022 mint | ERC-20 |
| `SendEnabled=false` (uact) | Token-2022 `NonTransferable` extension | Transfer-restricted ERC-20 |
| `bank.SendCoins` | SPL `transfer_checked` | `ERC20.transfer` |
| Bank `Minter`/`Burner` perms | Mint/burn authority PDAs on the mint | `MINTER_ROLE`-style access control |
| Module account | Program PDA + owned token accounts | Contract-held balances |
| Typed event (`EmitTypedEvent`) | Anchor event (event-CPI) | Solidity event (log + indexed topics) |
| Tendermint event indexing / WebSocket subscribe | Geyser/webhook stream → indexer; RPC `logsSubscribe` | `eth_subscribe(logs)` → indexer |
| IBC / ICS-20 | None (third-party bridges outside protocol scope) | Canonical/third-party bridges outside protocol scope |
| bech32 `akash1…` | base58 pubkey | `0x` hex (EIP-55) |
| Account sequence (+ unordered txs) | Recent blockhash window; durable nonce for offline signing | Per-account nonce |
| `x/feegrant` | Fee-payer sponsorship service | ERC-4337 paymaster |
| `x/authz` grant (DepositAuthorization) | Deposit-allowance PDA with restore-on-refund (D-21) | `EscrowVault` allowance mapping |
| Genesis / `InitGenesis` | Program `initialize` instructions + claims seeding | Constructor/initializer + claims seeding |
| Genesis export (`akash export`) | Snapshot artifacts pipeline ([06](./06-state-and-data-migration.md)) | Same |
| Upgrade handler + cosmovisor | Program upgrade via upgradeable BPF loader, authority = Squads v4 + timelock (D-11/D-15) | Proxy (UUPS) upgrade behind `AkashTimelock` + Safe |
| Store migration / ConsensusVersion | Account schema `version` field + lazy per-account migrate on touch | Storage-layout discipline + `reinitializer` |
| `in-place-testnet` (testnetify) | Fork tooling: Surfpool / `solana-test-validator --clone` of mainnet accounts | Anvil fork of the host chain |
| Invariants (`x/crisis`) | Off-chain property tests + monitors (none registered on current chain either) | Same |
| `simulate` / CheckTx | `simulateTransaction` | `eth_call` / `estimateGas` |
| Discovery service (`GetInfo`, min_client_version) | akash-config version registry + on-chain Anchor IDL accounts | `AkashConfig.versions()` + published ABI registry |
| SDL / manifest (off-chain, hash on-chain) | Unchanged: hash in deployment account (D-09, A-10) | Unchanged: hash in Deployment struct |

---

## Cross-references

- [01. Current architecture](./01-current-architecture.md): narrative behind every Cosmos-side row.
- [03. Solana architecture](./03-solana-architecture.md) / [04. Ethereum architecture](./04-ethereum-architecture.md): normative target designs these mappings summarize.
- [05. Token migration](./05-token-migration.md) / [06. State & data migration](./06-state-and-data-migration.md): module-account balance disposition; snapshot transforms.
- [07. Off-chain & clients](./07-offchain-and-clients.md): indexer, event-schema registry, fee sponsorship, JWT auth.
- [13. Open questions & decision log](./13-open-questions-and-assumptions.md): all D/A/Q items cited here.

## Feeds into

- [09. Testing & verification](./09-testing-and-verification.md): parity test matrix rows are generated from §1/§3/§8 tables.
- [11. Scope of work](./11-scope-of-work.md): per-workstream deliverable traceability (message/query coverage counts).
- Vendor implementation of 03/04: shared naming registry (instructions, events, errors, config fields).
