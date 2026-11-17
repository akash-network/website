# AEP-95 Implementation

> Companion to [AEP-95: One-Way AKT Sink to Solana](./README.md) (the authoritative specification).
>
> This document contains **implementation-specific details only**: code locations, byte-level encodings, protobuf messages, error codes, account layouts, service defaults and the status of the code against the specification.
> For the design, behavior, rules, and rationale, see [README.md](./README.md).

---

## Code

| Part                                                           | Repository and branch                                                       | Path                                                                                                                                                                                                                             |
| -------------------------------------------------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `x/sink` keeper, message server and module                     | `akash-network/node`, `release/feat/sink`                                   | `x/sink`                                                                                                                                                                                                                         |
| Upgrade that installs `x/sink`                                 | node                                                                        | `upgrades/software/v2.2.0`                                                                                                                                                                                                       |
| App wiring                                                     | node                                                                        | `app/mac.go` (module account), `app/app.go` (blocked addresses, BeginBlock order), `app/ante.go` (`DepositDecorator`), `app/types/app.go` (keeper), `app/app_configure.go` (genesis order), `app/export.go` (zero-height export) |
| AKT program                                                    | node                                                                        | `contracts/solana/programs/akt-solana`                                                                                                                                                                                           |
| Relayer, reporter, monitor, reconciler                         | node                                                                        | `contracts/solana/local`, `contracts/solana/reporter`, `contracts/solana/shared`                                                                                                                                                 |
| Deployment tooling and operator docs                           | node                                                                        | `contracts/solana/deploy`, `contracts/solana/scripts`, `contracts/solana/docs`                                                                                                                                                   |
| Protobuf                                                       | `akash-network/chain-sdk`, `feat/sink`                                      | `proto/node/akash/sink/v1`                                                                                                                                                                                                       |
| Go types and stateless validation                              | chain-sdk                                                                   | `go/node/sink/v1`                                                                                                                                                                                                                |
| CLI                                                            | chain-sdk                                                                   | `go/cli/sink_tx.go`, `go/cli/sink_query.go`                                                                                                                                                                                      |
| ICS07 client, access manager, membership library, header codec | `akash-network/ibc-contracts` at `0da3165d8428a1b7792cc17551ecd1d3985761e6` | Pinned in `contracts/solana/programs/akt-solana/Cargo.toml:33` and `contracts/solana/tools/header-encoder/Cargo.toml:21`                                                                                                         |

Paths that start with `x/`, `app/`, `upgrades/`, `tests/` or `contracts/` are in node. Paths that start with `proto/` or `go/` are in chain-sdk. Line numbers were taken on 2026-11-04 from node `9e9010fc` and chain-sdk `ea3d90b3`, with their uncommitted working-tree changes. Those changes include the reporter module-account check in `x/sink/keeper/params.go:28-40` and comment-only edits to `proto/node/akash/sink/v1/query.proto`. `contracts/solana/docs/production-deployment.md` and `contracts/solana/docs/deploy-program.md` are cited by section instead of line.

## Status against the specification

### Launch requirements not met in these repositories

The README keeps these as normative launch requirements.

| Requirement                                                                                                                  | Status                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Evidence                                                                                                                                                                      |
| ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The monitor pauses Solana minting through the guardian key on any supply mismatch or violation of the `x/sink` bank equality | Not implemented. The reconciler evaluates both equations and writes alerts. The monitor only reads and reports. No service holds the guardian key or calls `guardian_pause`. The production service set has no monitor                                                                                                                                                                                                                                                                                                                                                                                                                | `contracts/solana/local/reconcile.ts:311-349`; `contracts/solana/local/monitor.ts:14-15`; `contracts/solana/deploy/service.sh:9-15`                                           |
| Monitoring alerts and paging                                                                                                 | Partial. Implemented checks: light-client age (warning at 25%, critical at 50% of the trusting period), frozen client, pin change, relayer access, relayer payer balance (warning below 5 SOL, critical below 1 SOL), disk use, stalled Akash and Solana heights. The reconciler also alerts on holds, on Akash outcomes without a matching finalized Solana status, and on Solana outcomes still pending on Akash after 600 s. Missing: pending-transfer age before any Solana status, authority and configuration events, cap usage above 80%, reporter fee balances, reporter vote age. Alerts are log lines; nothing pages        | `contracts/solana/local/monitor.ts:32-59, 140-257`; `contracts/solana/local/reconcile-policy.ts:12-19, 28-70`                                                                 |
| A public endpoint publishes total, circulating and Solana supply                                                             | Not implemented in node or chain-sdk                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | —                                                                                                                                                                             |
| Portal                                                                                                                       | Not in these repositories. It is a separate `sink-portal` checkout. Node keeps the shared contract types in `contracts/solana/local/team-contracts.ts`, and `contracts/solana/local/team.ts` is a testnet adapter, not the production API                                                                                                                                                                                                                                                                                                                                                                                             | `contracts/solana/scripts/check-portal-contract.sh:4-5`; `contracts/solana/docs/production-deployment.md` ("Launch acceptance gates")                                         |
| The relayer submits waiting records oldest first, by deposit height and then sequence                                        | Not implemented. Each pass queues disputes, then the `REFUND_PENDING`, `VOIDED` and `TRANSFER_PENDING` buckets (each in owner-first key order), then unfinished jobs, then newly discovered history, and relays in that order                                                                                                                                                                                                                                                                                                                                                                                                         | `contracts/solana/local/open-transfers.ts:40-60`; `contracts/solana/local/relay.ts:1257-1282, 1566-1593, 1637-1652`                                                           |
| Reporters run in preview mode against their own nodes before the proposal that opens transfers                               | Partial. Each scan pass reads the finalized Solana bridge accounts and the Akash node's committed state, then stops with `not a current reporter` unless the current reporter policy lists the reporter. It reviews no transfer: a one-shot run exits with code 1, and a `--watch` run logs the error on every pass. The single opening proposal lists the reporters only as transfers open, so before launch the shipped reporter's preview exercises only its configuration, both node connections and the light-client pin, not the transfer review that depends on membership. The operator docs expect this error during preview | `contracts/solana/reporter/scan.ts:98-108, 152-162`; `contracts/solana/reporter/run.ts:151-162`; `contracts/solana/docs/production-deployment.md` ("Launch sequence", step 4) |

### Rules that nothing on chain enforces

| Rule                                                                             | Status                                                                                                                                                           |
| -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Transfers stay open for 2 years from token launch                                | Policy commitment. No timer exists                                                                                                                               |
| Akash `max_amount_per_transfer` no higher than the Solana `per_transfer_max`     | Operational. Neither chain reads the other's caps                                                                                                                |
| Akash `max_transfer_amount_per_epoch` no higher than the Solana `daily_mint_cap` | Operational. The Akash value is an aggregate cap per native `day` epoch (`x/sink/keeper/deposit.go:129-136`), not a copy of the Solana cap                       |
| `allowed_destination_vaults` equal to the Solana `vaults`                        | Operational. Akash has no count limit (`go/node/sink/v1/params.go:88-100`); Solana allows at most 16 (`contracts/solana/programs/akt-solana/src/state.rs:90-99`) |
| A governance void's settlement fits the 16,384-byte proof limit                  | Operational. Akash sets no limit on the reporter count. See [Proof size](#proof-size)                                                                            |

### Known defect: governance can refund a Minted transfer

The README makes `MINTED` final: governance can void and refund only a transfer that is not `MINTED` or `REFUNDED`, and no governance confirmation changes the status of a `MINTED` transfer. The keeper allows one exception.

- `MsgRequestVoid` rejects a `MINTED` transfer only when its hold is not `HOLD_CONFLICT`, so it writes a void order into a conflict-held `MINTED` transfer (`x/sink/keeper/settlement.go:57`).
- `MsgConfirmVoid` moves a conflict-held `MINTED` transfer that has a void order to `REFUND_PENDING` with a new challenge window (`x/sink/keeper/settlement.go:316-331`). `MsgFinalizeRefund` can then pay it (`x/sink/keeper/settlement.go:385-512`).
- One opposing reporter vote is enough to put a `MINTED` transfer under `HOLD_CONFLICT` (`x/sink/keeper/settlement.go:122-156`). The path therefore needs one reporter and one governance proposal.
- The runbook row "A mint quorum contradicts Solana" in `contracts/solana/docs/production-deployment.md` ("Incident runbooks") keeps the transfer Minted and tells operators not to use this path. `x/sink/README.md` and chain-sdk `docs/sink-decisions.md` mark it as this defect.
- To conform, both messages must reject `STATUS_MINTED` whatever the hold.

### Other open items

- The `v2.2.0` handler also runs `RepairEscrowPayments`. It closes open deployment escrow payments whose leases are closed or insufficient-funds, changes only payment state and index, and emits `escrow_orphan_payments_repaired`. The handler also stores and migrates the Pyth VAA Wasm contract at `akash1zwv6feuzhy6a9wekh96cd57lsarmqlwxdypdsplw6zhfncqw6ftqucuysk` (`upgrades/software/v2.2.0/upgrade.go:64-86`; `upgrades/software/v2.2.0/escrow.go:23-112`).
- The production upgrade height is not chosen. The operator docs list the final upgrade name and height as a launch gate (`contracts/solana/docs/production-deployment.md`, "Launch acceptance gates").
- The operator docs follow the README's launch order. The "Launch sequence" in `contracts/solana/docs/production-deployment.md` puts the Akash upgrade first, opens transfers with one proposal that also sets `refunds_enabled` and the `x/sink` `pause_guardian`, runs `set_bridge_enabled(true)` right after that proposal passes, and sends the seed before the caps are lowered. Its "Solana mint policy" section, the example policy in `contracts/solana/docs/deploy-program.md` ("8. Checkpoint and bridge") and the comments at `contracts/solana/deploy/rehearse-launch.sh:190, 209` call 1,000,000 AKT per transfer and 10,000,000 AKT per UTC day seed-window values, not launch caps. The tooling uses those values on Solana (`rehearse-launch.sh:191-192, 210`; `contracts/solana/local/relay.ts:524-526`; `tests/upgrade/sink/setup.sh:60`). The local stack also sets `x/sink` to 1,000,000 AKT per transfer and 10,000,000 AKT per epoch (`contracts/solana/local/stack.ts:232-235`).
- All ten Amino names are still `sink/<Msg>` (`go/node/sink/v1/codec.go:11-22`; `amino.name` options in `proto/node/akash/sink/v1/msgs.proto`).
- Only `SetParams` rejects module accounts as reporters (`x/sink/keeper/params.go:28-40`). Genesis import does not apply that rule (`x/sink/keeper/genesis.go:17-158`). `Params.ValidateBasic` does not apply the quorum rule either. `SetParams` applies it before storing a policy (`x/sink/keeper/params.go:21-26`), and genesis validation applies it to every retained policy (`go/node/sink/v1/settlement.go:238-254`; `go/node/sink/v1/policy.go:42-48`).
- The default `reporters_threshold` 0.66 (`go/node/sink/v1/params.go:27`) gives a quorum that is not above two thirds for every set size divisible by three, and for some other sizes.
- Reporter messages are matched against members by exact string (`x/sink/handler/server.go:104, 131`). Duplicates are rejected by decoded address (`go/node/sink/v1/policy.go:22-37`). The shipped reporter accepts only a lowercase 20-byte `akash` address (`contracts/solana/reporter/config.ts:139-146`).
- Akash errors 3, 19, 31 and 37 are registered but never returned (`go/node/sink/v1/errors.go`).
- The module reports consensus version 2 at its first install (`x/sink/module.go:82`).
- The module registers no crisis invariant. The bank equality is checked inline (`x/sink/keeper/keeper.go:306-327`).
- Installation and every deposit or refund need the existing `x/epochs` record named `day`. Genesis validation reads it, so the upgrade fails without it (`x/sink/keeper/genesis.go:64-74`; `x/sink/keeper/epoch.go:9-23`).
- The relayer's default per-transfer budget is 5,000,000 lamports (`contracts/solana/local/relay-policy.ts:67-69`). It is checked before each paid transaction (`contracts/solana/local/relay.ts:820-829`). A mint that creates the recipient's token account locks about 5,296,560 lamports of rent. The 3.5M-lamport estimate in the comment at `relay-policy.ts:67` is below that.

## Akash `x/sink`

### Store keys and values

Prefixes are in `x/sink/keeper/key.go:10-22`. Key codecs are in `x/sink/keeper/codec.go`. Values use `codec.CollValue`, the protobuf binary encoding (`x/sink/keeper/keeper.go:110-122`).

| Prefix  | Collection                                  | Key after the prefix                                                      | Value                                  |
| ------- | ------------------------------------------- | ------------------------------------------------------------------------- | -------------------------------------- |
| `01 00` | params                                      | —                                                                         | `Params`                               |
| `02 00` | transfers (proven)                          | ID: `u8 len(owner) ‖ owner ‖ BE64(height) ‖ BE64(sequence)`               | `RecordData`                           |
| `03 01` | settlements (proven)                        | `u8 status ‖ ID`                                                          | `SettlementData`                       |
| `04 00` | totals                                      | —                                                                         | `Totals`                               |
| `04 01` | accounts                                    | raw owner address bytes                                                   | `AccountUsage`                         |
| `04 02` | send_usage                                  | —                                                                         | `EpochUsage`                           |
| `04 03` | refund_usage                                | —                                                                         | `EpochUsage`                           |
| `05 00` | refund_queue                                | `BE64(scope) ‖ challenge_end (8 bytes big-endian, sign bit flipped) ‖ ID` | empty                                  |
| `06 00` | sequence (transient store `sink_transient`) | —                                                                         | BE64, reset to 0 in every `BeginBlock` |
| `07 00` | policies                                    | `BE64(version)`                                                           | `ReporterPolicy`                       |
| `07 01` | policy_sequence                             | —                                                                         | BE64 current policy version            |
| `08 00` | history                                     | `BE64(height) ‖ BE64(sequence) ‖ u8 len(owner) ‖ owner`                   | empty                                  |
| `08 01` | disputes (held transfers)                   | same as history                                                           | empty                                  |

The refund-queue scope is 0 for a governance-confirmed refund and the policy version for a reporter-confirmed one (`x/sink/keeper/refundq.go:13-24`).

### Proven encodings

Only the transfer and settlement entries are proven on Solana. The node codecs produce the fixtures in `contracts/solana/programs/akt-solana/tests/fixtures`. The SDK, the AKT program and the services check them.

| Item                   | Bytes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Source                                                                                                         |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Transfer key           | `02 00 ‖ u8 len(owner) ‖ owner ‖ BE64(height) ‖ BE64(sequence)`. 19 + len(owner) bytes; 39 for a 20-byte owner                                                                                                                                                                                                                                                                                                                                                                                                                                  | `x/sink/keeper/codec.go:52-70`; `contracts/solana/programs/akt-solana/src/wire.rs:40-59`                       |
| Settlement key         | `03 01 ‖ status (01 to 05) ‖ u8 len(owner) ‖ owner ‖ BE64(height) ‖ BE64(sequence)`. 20 + len(owner) bytes                                                                                                                                                                                                                                                                                                                                                                                                                                      | `x/sink/keeper/codec.go:155-164`; `wire.rs:61-64`                                                              |
| `RecordData` value     | `0a ‖ L1 ‖ dest ‖ 12 ‖ L2 ‖ 0a 04 "uakt" ‖ 12 ‖ L3 ‖ amount`. `dest` is canonical base58 (L1 32 to 44); `amount` is the decimal u64 (L3 1 to 20); L2 = 8 + L3. 45 to 76 bytes                                                                                                                                                                                                                                                                                                                                                                   | `proto/node/akash/sink/v1/types.proto:162-173`; `wire.rs:66-79, 98-120`                                        |
| `SettlementData` value | Protobuf fields: 1 `hold` (enum), 2 `round` (uint64), 3 `policy` (`ReporterPolicy`: 1 `version`, 2 `members` repeated string, 3 `threshold` decimal string), 4 `votes` (repeated `Vote`: 1 `reporter`, 2 `observation`, 3 `policy_version`), 5 `challenge_end` (int64 Unix seconds), 6 `governance_observation` (`Observation`: 1 `outcome`, 2 `slot`, 3 `transaction_signature`), 7 `veto_by`, 8 `veto_reason`, 9 `void_authorization` (1 `requested_height` int64, 2 `requested_round` uint64), 10 `veto_policy_version` (0 means governance) | `proto/node/akash/sink/v1/types.proto:176-233, 358-415`                                                        |
| Proof path             | `["sink", key]`. `MerkleProof` with two existence proofs: IAVL (`ics23:iavl`), then multistore (`ics23:simple`, key `sink`)                                                                                                                                                                                                                                                                                                                                                                                                                     | `contracts/solana/programs/akt-solana/src/light_client.rs:164-186`; `contracts/solana/shared/proof.ts:199-244` |
| Proof-buffer nonce     | SHA-256 of the proven key                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | `wire.rs:81-83`; `contracts/solana/programs/akt-solana/src/state.rs:148-151`                                   |
| Status PDA             | `["transfer", SHA-256(owner bytes), LE64(height), LE64(sequence)]`. The IDL cannot express the hashed seed, so clients compute it                                                                                                                                                                                                                                                                                                                                                                                                               | `contracts/solana/programs/akt-solana/src/constants.rs:19-20`; `contracts/solana/shared/proof.ts:54-65`        |

`void_transfer` parses the proven `SettlementData` strictly (`contracts/solana/programs/akt-solana/src/authorization.rs:71-125`):

- Fields 1 to 10 appear in ascending order, and only field 4 repeats. Varints are minimal.
- Fields 1, 2, 5 and 10 are nonzero varints. Fields 3, 4, 6, 7, 8 and 9 are length-delimited, with field 6 at most 79 bytes, field 8 at most 256, field 9 at most 21 and the rest at most 16,384.
- Field 9 is present and is exactly `08 h 10 r` with 0 < h ≤ i64::MAX and r > 0.
- `requested_round ≤ round` and `deposit height ≤ requested_height < proof_height`.

#### Proof size

The `maximum_evidence` settlement vector encodes to 6,519 bytes (`x/sink/keeper/key_test.go:307-309, 345-402`). It has 32 reporters with 20-byte addresses, ratio 1, 32 votes, one opposing witness, a 256-byte veto reason and a void order. It is not a maximum over reporter policies. The full proof, with the value and both paths, must fit the 16,384-byte buffer (`contracts/solana/programs/akt-solana/tests/fixtures/README.md:36-37`). The operator docs plan up to seven reporters and require the proof size to be checked whenever the reporter policy changes (`contracts/solana/docs/audit.md:119`).

### Transfer ID

| Item                | Rule                                                                                                                                       | Source                                                                                             |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| Type                | `ID { owner, height, sequence }`; string form `owner/height/sequence`                                                                      | `proto/node/akash/sink/v1/types.proto:113-134`; `go/node/sink/v1/id.go:11-54`                      |
| Validation          | `owner` is any address `AccAddressFromBech32` accepts (1 to 255 bytes); `height > 0`; `sequence > 0`                                       | `go/node/sink/v1/id.go:11-21`                                                                      |
| Allocation          | Block height and a transient per-block sequence starting at 1. A failed deposit rolls back its allocation. Simulation uses the next height | `x/sink/keeper/keeper.go:280-304`; `x/sink/keeper/abci.go:20-25`; `x/sink/keeper/deposit.go:24-34` |
| Solana `TransferId` | Borsh `u32 LE len ‖ owner ‖ u64 LE height ‖ u64 LE sequence`; owner 1 to 255 bytes, height 1 to i64::MAX, sequence > 0                     | `contracts/solana/programs/akt-solana/src/wire.rs:12-38`                                           |

### Parameters

`proto/node/akash/sink/v1/params.proto:13-93`. Defaults are in `go/node/sink/v1/params.go:19-30`, which the code calls a development policy (`params.go:18`). The amount defaults meet the README's seed-window minimum but are not launch caps. Stateless rules are in `go/node/sink/v1/params.go:32-103`. Stateful rules are in `x/sink/keeper/params.go:16-134`.

| #   | Field                           | Type            | Default                 | Validation                                                                                                                                                                             |
| --- | ------------------------------- | --------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `enabled`                       | bool            | false                   | If true: `min_amount_per_transfer` > 0 (`params.go:55-57`) and `reporters` non-empty (`params.go:70-72`). Deposits also need current policy members (`x/sink/keeper/deposit.go:65-67`) |
| 2   | `min_amount_per_transfer`       | Coin            | 1,000,000 uakt          | Valid `uakt` coin (`params.go:41-49`). ≤ `max_amount_per_transfer`, ≤ `max_transfer_amount_per_epoch`, and ≤ `max_epoch_amount_per_account` when that is positive (`params.go:59-63`)  |
| 3   | `max_amount_per_transfer`       | Coin            | 1,000,000,000,000 uakt  | Positive (`params.go:51-53`); fits u64; ≤ `max_epoch_refund` (`params.go:59-63`)                                                                                                       |
| 4   | `max_transfer_amount_per_epoch` | Coin            | 10,000,000,000,000 uakt | Positive. Not bounded by `max_amount_per_transfer`                                                                                                                                     |
| 5   | `max_epoch_amount_per_account`  | Coin            | 1,000,000,000,000 uakt  | ≥ 0; 0 means no limit                                                                                                                                                                  |
| 6   | `max_epoch_refund`              | Coin            | 1,000,000,000,000 uakt  | Positive. A decrease is rejected if any `TRANSFER_PENDING`, `VOIDED` or `REFUND_PENDING` amount exceeds it (`x/sink/keeper/params.go:49-87`)                                           |
| 7   | `reporters`                     | repeated bech32 | []                      | Valid, distinct by decoded address (`go/node/sink/v1/policy.go:22-37`). No module accounts; an address without an account is allowed (`x/sink/keeper/params.go:28-40`). No count limit |
| 8   | `reporters_threshold`           | `LegacyDec`     | 0.66                    | 0 ≤ r ≤ 1 (`params.go:66-68`). If n > 0, 3·ceil(r·n) > 2n, enforced in `SetParams` (`x/sink/keeper/params.go:24-26`; `go/node/sink/v1/policy.go:10-20`)                                |
| 9   | `reporter_challenge_period`     | Duration        | 72h                     | ≥ 72h in release builds (`go/node/sink/v1/challenge_floor.go:7`); ≥ 1 s with the `sinkdev` build tag (`challenge_floor_dev.go:7`); ≤ 9,223,372,035.999999999 s (`params.go:16, 74-80`) |
| 10  | `allowed_destination_vaults`    | repeated string | []                      | Canonical base58 of 32 nonzero bytes, at most 44 characters, distinct (`params.go:88-100`; `go/node/sink/v1/destination.go:38-56`). No count limit                                     |
| 11  | `refunds_enabled`               | bool            | false                   | —                                                                                                                                                                                      |
| 12  | `pause_guardian`                | bech32          | ""                      | Empty or a valid address (`params.go:82-86`)                                                                                                                                           |

A reporter or threshold change writes a new `ReporterPolicy` with members sorted and the version incremented. An unchanged set, in any order, keeps the version (`x/sink/keeper/params.go:89-125, 136-149`). `MsgGuardianPause` writes params without revalidation (`x/sink/keeper/guardian.go:9-31`).

### Messages

The service is `proto/node/akash/sink/v1/service.proto:10-32`. Stateless validation is in `go/node/sink/v1/msgs.go:34-155`. Handlers are in `x/sink/handler/server.go`. "Gov" means the governance module account (`app/types/app.go:301-308`).

| Message                              | Fields (proto)                                                                                                   | Signer      | Authorization                                                                                                  | Keeper                              | Amino                     |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ------------------------- |
| `MsgSink` → `MsgSinkResponse { id }` | `dest_type`, `dest`, `amount`, `sender` (`msgs.proto:17-45`)                                                     | `sender`    | Sole top-level message (`x/sink/keeper/ante.go:16-40`); signing account with a public key (`deposit.go:46-49`) | `x/sink/keeper/deposit.go:23-216`   | `sink/MsgSink`            |
| `MsgUpdateParams`                    | `authority`, `params` (`msgs.proto:48-63`)                                                                       | `authority` | Gov (`server.go:53-55`)                                                                                        | `x/sink/keeper/params.go:16-134`    | `sink/MsgUpdateParams`    |
| `MsgRequestVoid`                     | `authority`, `id`, `expected_round` (`msgs.proto:69-90`)                                                         | `authority` | Gov (`server.go:75-77`)                                                                                        | `x/sink/keeper/settlement.go:42-86` | `sink/MsgRequestVoid`     |
| `MsgReportOutcome`                   | `reporter`, `id`, `policy_version`, `round`, `observation` (`msgs.proto:96-128`)                                 | `reporter`  | Member of the current policy (`server.go:99-106`)                                                              | `settlement.go:88-202`              | `sink/MsgReportOutcome`   |
| `MsgVetoVoid`                        | `signer`, `id`, `reason` (`msgs.proto:134-155`)                                                                  | `signer`    | Current member or gov (`server.go:126-133`)                                                                    | `settlement.go:204-257`             | `sink/MsgVetoVoid`        |
| `MsgRestartTransfer`                 | `authority`, `id`, `reason`, `expected_round` (`msgs.proto:161-188`)                                             | `authority` | Gov (`server.go:151-153`)                                                                                      | `settlement.go:259-381`             | `sink/MsgRestartTransfer` |
| `MsgConfirmMint`                     | `authority`, `id`, `evidence { slot, transaction_signature }`, `reason`, `expected_round` (`msgs.proto:194-227`) | `authority` | Gov (`server.go:173-175`)                                                                                      | `settlement.go:259-381`             | `sink/MsgConfirmMint`     |
| `MsgConfirmVoid`                     | as `MsgConfirmMint` (`msgs.proto:233-266`)                                                                       | `authority` | Gov (`server.go:195-197`)                                                                                      | `settlement.go:259-381`             | `sink/MsgConfirmVoid`     |
| `MsgFinalizeRefund`                  | `executor`, `id` (`msgs.proto:272-288`)                                                                          | `executor`  | Anyone                                                                                                         | `settlement.go:385-512`             | `sink/MsgFinalizeRefund`  |
| `MsgGuardianPause`                   | `guardian`, `deposits`, `refunds` (`msgs.proto:294-312`)                                                         | `guardian`  | `params.pause_guardian`, non-empty (`server.go:237-244`)                                                       | `x/sink/keeper/guardian.go:14-46`   | `sink/MsgGuardianPause`   |

Amino names are registered in `go/node/sink/v1/codec.go:11-22`. Observations need `OUTCOME_MINTED` or `OUTCOME_VOIDED`, a positive slot and a nonzero 64-byte signature. Reasons are 1 to 256 bytes of UTF-8 and not blank. Resolutions need `expected_round` > 0 and below the maximum u64 (`go/node/sink/v1/settlement.go:19-44`; `go/node/sink/v1/msgs.go:125-143`). `MsgGuardianPause` needs at least one flag (`msgs.go:145-155`).

Deposit check order (`x/sink/keeper/deposit.go`):

1. Request marker (36-39).
2. Signing account (46-49).
3. `enabled` (56-58) and policy members (60-67).
4. Destination (69-81).
5. Minimum and maximum (83-89).
6. Started epoch (91-98).
7. Per-account epoch cap (120-127) and aggregate epoch cap (129-136).
8. ID (138-150).
9. Bank equality (152-154), transfer (156-159), record (161-166), usage (168-182), settlement (184-197), bank equality (199-201), event (203-211).

`MsgFinalizeRefund` check order (`x/sink/keeper/settlement.go`):

1. Already refunded is a no-op (395-397).
2. `refunds_enabled` (404-406).
3. Payable (413-424).
4. Challenge end (426-428).
5. Queue head (430-437).
6. Started epoch (439-446).
7. Refund cap (448-465).
8. Bank equality (467-469), status (475-480), payment and recipient balance check (482-495), bank equality (497-499), event (501-507).

### Queries

Service and paths are in `proto/node/akash/sink/v1/query.proto:16-55`. Messages are at `query.proto:57-225`. Handlers are in `x/sink/keeper/grpc_query.go`.

| Query       | REST                                                                | Request                         | Response                                                                                         | Pagination and errors                                                                                                                                                                                                                                                                                                                                                                                                                        | Handler                                                    |
| ----------- | ------------------------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `Transfer`  | `GET /akash/sink/v1/transfers/{id.owner}/{id.height}/{id.sequence}` | `id`                            | `transfer: TransferState { id, data, settlement, status }`                                       | Probes all five status keys and requires exactly one settlement                                                                                                                                                                                                                                                                                                                                                                              | `grpc_query.go:106-125`; `x/sink/keeper/keeper.go:178-215` |
| `Transfers` | `GET /akash/sink/v1/transfers`                                      | `owner`, `status`, `pagination` | `transfers`, `pagination { next_key, total }`                                                    | Owner only: that owner's records by height and sequence. Status, alone or with owner: that settlement bucket in key order. Neither: the history index by height, sequence and owner. Opaque cursor carrying the walk; on resume, owner and status come from the cursor, `reverse` from the request. Limit 0 means 100; no maximum. Offset needs a status filter. `count_total` ignored; `total` is the page size. Malformed cursors rejected | `grpc_query.go:259-468`                                    |
| `Disputes`  | `GET /akash/sink/v1/disputes`                                       | `pagination`                    | `transfers`, `pagination`                                                                        | SDK `CollectionPaginate` over the dispute index (chronological). Offset and key are mutually exclusive                                                                                                                                                                                                                                                                                                                                       | `grpc_query.go:228-252`                                    |
| `Account`   | `GET /akash/sink/v1/accounts/{owner}`                               | `owner`                         | `usage { total_sent, epoch_sent, last_epoch }` normalized to the current epoch, `epoch`          | Fails on a missing or invalid `day` epoch                                                                                                                                                                                                                                                                                                                                                                                                    | `grpc_query.go:128-163`                                    |
| `State`     | `GET /akash/sink/v1/state`                                          | —                               | `totals`, `epoch`, `send_usage`, `refund_usage` (both normalized), `refund_head` (optional `ID`) | The head is the oldest unheld candidate in scope 0 or the current policy. Payment still needs maturity, capacity and enabled refunds                                                                                                                                                                                                                                                                                                         | `grpc_query.go:169-224`                                    |
| `Params`    | `GET /akash/sink/v1/params`                                         | —                               | `params`                                                                                         | —                                                                                                                                                                                                                                                                                                                                                                                                                                            | `grpc_query.go:47-54`                                      |
| `Reporters` | `GET /akash/sink/v1/reporters?version=`                             | `version`                       | `reporters: []ReporterPolicy`                                                                    | 0 returns the current policy, or nothing before the first one. The maximum u64 returns every retained policy. Any other value returns that version or NotFound                                                                                                                                                                                                                                                                               | `grpc_query.go:58-104`                                     |

The CLI exposes `transfer`, `transfers`, `disputes`, `account`, `state`, `params` and `reporters` (`go/cli/sink_query.go`). It also exposes the transactions `deposit`, `guardian-pause`, `request-void`, `report-outcome`, `veto-void`, `restart-transfer`, `confirm-mint`, `confirm-void`, `finalize-refund` and `update-params` (`go/cli/sink_tx.go`).

### Events

All events are typed `akash.sink.v1` messages (`proto/node/akash/sink/v1/event.proto`).

| Event                                                          | Fields                                                          | Emitted when                                                  | Source                                  |
| -------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------- | --------------------------------------- |
| `EventTransferCreated`                                         | `id`, `sender`, `recipient`, `amount`, `height`                 | Deposit accepted                                              | `x/sink/keeper/deposit.go:203-211`      |
| `EventVoidOrdered`                                             | `id`                                                            | New void order; not on a repeated request                     | `x/sink/keeper/settlement.go:49-51, 79` |
| `EventOutcomeReported`                                         | `id`, `reporter`, `outcome`                                     | A vote is recorded, including a conflicting one               | `settlement.go:191-197`                 |
| `EventReportConflict`                                          | `id`, `reporter`                                                | Conflict hold set                                             | `settlement.go:148-156`                 |
| `EventMintConfirmed`                                           | `id`                                                            | Mint quorum reached                                           | `settlement.go:160-165`                 |
| `EventVoidConfirmed`                                           | `id`, `challenge_end` (Timestamp)                               | Void quorum reached                                           | `settlement.go:166-184`                 |
| `EventVoidVetoed`                                              | `id`, `signer`, `reason`                                        | Veto                                                          | `settlement.go:246-252`                 |
| `EventTransferResolved`                                        | `id`, `decision`, `reason`                                      | Restart or confirmation                                       | `settlement.go:370-376`                 |
| `EventTransferRefunded`                                        | `id`, `sender`, `amount`                                        | Refund paid                                                   | `settlement.go:501-507`                 |
| `EventGuardianPaused`                                          | `guardian`, `deposits`, `refunds`, `enabled`, `refunds_enabled` | Guardian pause                                                | `x/sink/keeper/guardian.go:33-41`       |
| `EventPreexistingBalanceMoved`                                 | `amount` (Coins), `recipient` (distribution module address)     | Installation swept a balance                                  | `x/sink/keeper/install.go:56-75`        |
| `EventTotalsUpdated`                                           | the ten totals and `refunded_in_epoch`                          | A record is created or changes status (not at genesis import) | `x/sink/keeper/refundq.go:80-138`       |
| `sink_withdraw_address_reset` (untyped, attribute `delegator`) | —                                                               | Installation cleared a withdraw address                       | `install.go:77-95`                      |

### Enums

`proto/node/akash/sink/v1/types.proto:11-110`.

| Enum       | Values                                                                                                                                                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Status`   | 0 `STATUS_INVALID` (means "any" in filters), 1 `STATUS_TRANSFER_PENDING`, 2 `STATUS_MINTED`, 3 `STATUS_VOIDED`, 4 `STATUS_REFUND_PENDING`, 5 `STATUS_REFUNDED`. Terminal: 2 and 5 (`go/node/sink/v1/settlement.go:55-57`) |
| `Hold`     | 0 `HOLD_NONE`, 1 `HOLD_VETO`, 2 `HOLD_CONFLICT`                                                                                                                                                                           |
| `Decision` | 0 `DECISION_UNSPECIFIED`, 1 `DECISION_RESTART`, 2 `DECISION_CONFIRM_MINT`, 3 `DECISION_CONFIRM_VOID`                                                                                                                      |
| `Outcome`  | 0 `OUTCOME_UNSPECIFIED`, 1 `OUTCOME_MINTED`, 2 `OUTCOME_VOIDED`                                                                                                                                                           |
| `DestType` | 0 `DEST_TYPE_INVALID`, 1 `DEST_TYPE_SOLANA`                                                                                                                                                                               |

### Genesis

`GenesisState` (`proto/node/akash/sink/v1/genesis.proto:53-102`):

- 1 `params`
- 2 `totals`
- 3 `policy_sequence`
- 4 `policies`
- 5 `send_usage`
- 6 `refund_usage`
- 7 `records` (`GenesisRecord { id, data, settlement, status }`; field 4 reserved)
- 8 `accounts` (`GenesisAccount { owner, usage }`)

The default genesis has default params, zero totals, `policy_sequence` 0, no policies and zero usage (`go/node/sink/v1/genesis.go:7-18`).

| Check                                                                                                                                                                       | Source                                                                      |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Params; policies valid, unique and not above `policy_sequence`; totals valid                                                                                                | `go/node/sink/v1/genesis.go:20-44`; `go/node/sink/v1/settlement.go:238-254` |
| Each record: ID, data, settlement against its policies; unique ID and unique (height, sequence); unpaid amount ≤ `max_epoch_refund`; totals recomputed and equal            | `go/node/sink/v1/genesis.go:46-97`; `go/node/sink/v1/settlement.go:98-236`  |
| Accounts: valid and unique owners; lifetime usage equals the owner's records; every record owner present; epoch usage sums to `send_usage`; `refund_usage` ≤ total refunded | `go/node/sink/v1/genesis.go:99-146`                                         |
| `policy_sequence` 0 means no reporters; otherwise the policy at `policy_sequence` matches params                                                                            | `x/sink/keeper/genesis.go:17-47`                                            |
| Governance vetoes signed by the authority; usage epochs not ahead of the `day` epoch                                                                                        | `x/sink/keeper/genesis.go:53-77`                                            |
| Empty store; record and void-request heights below max(1, initial height); sink address holds the sink module account; bank equality                                        | `x/sink/keeper/genesis.go:83-158, 160-190, 304-312`                         |
| Export revalidates, rejects orphaned settlements and checks the bank equality                                                                                               | `x/sink/keeper/genesis.go:192-278`                                          |
| A zero-height export fails once any transfer exists                                                                                                                         | `app/export.go:46-60`; `x/sink/keeper/genesis.go:284-297`                   |

Genesis runs after auth, bank and epochs (`app/app_configure.go:62-95`). Epochs runs first in `BeginBlock` (`app/app.go:347-349`).

### Errors

Codespace `sink` (`go/node/sink/v1/errors.go:8-126`). Codes marked † are registered but never returned.

| Code | Name                       | gRPC               | Code | Name                               | gRPC               |
| ---- | -------------------------- | ------------------ | ---- | ---------------------------------- | ------------------ |
| 1    | `ErrInvalidParam`          | InvalidArgument    | 20   | `ErrAccountDailyAmountExceeded`    | ResourceExhausted  |
| 2    | `ErrInvalidDestination`    | InvalidArgument    | 21   | `ErrRefundCapReached`              | ResourceExhausted  |
| 3    | `ErrInvalidRecord` †       | InvalidArgument    | 22   | `ErrNotReporter`                   | PermissionDenied   |
| 4    | `ErrInvalidObservation`    | InvalidArgument    | 23   | `ErrNotGuardian`                   | PermissionDenied   |
| 5    | `ErrInvalidReason`         | InvalidArgument    | 24   | `ErrStaleReport`                   | FailedPrecondition |
| 6    | `ErrInvalidReporters`      | InvalidArgument    | 25   | `ErrNoPendingVoid`                 | FailedPrecondition |
| 7    | `ErrInvalidSettlement`     | InvalidArgument    | 26   | `ErrChallengeWindowEnded`          | FailedPrecondition |
| 8    | `ErrInvalidGenesis`        | InvalidArgument    | 27   | `ErrChallengeWindowNotElapsed`     | FailedPrecondition |
| 9    | `ErrInvalidGuardianPause`  | InvalidArgument    | 28   | `ErrRefundOutOfOrder`              | FailedPrecondition |
| 10   | `ErrInvalidResolution`     | InvalidArgument    | 29   | `ErrDepositNotSole`                | InvalidArgument    |
| 11   | `ErrOverflow`              | OutOfRange         | 30   | `ErrSenderNotSigningAccount`       | PermissionDenied   |
| 12   | `ErrTransferNotFound`      | NotFound           | 31   | `ErrEscrowTransferNotAuthorized` † | PermissionDenied   |
| 13   | `ErrTransferExists`        | AlreadyExists      | 32   | `ErrBalanceMismatch`               | Internal           |
| 14   | `ErrTransferClosed`        | FailedPrecondition | 33   | `ErrInternal`                      | Internal           |
| 15   | `ErrDepositsDisabled`      | FailedPrecondition | 34   | `ErrInvalidID`                     | InvalidArgument    |
| 16   | `ErrRefundsDisabled`       | FailedPrecondition | 35   | `ErrInvalidClock`                  | InvalidArgument    |
| 17   | `ErrBelowMinTransfer`      | FailedPrecondition | 36   | `ErrSendCapReached`                | ResourceExhausted  |
| 18   | `ErrAboveMaxTransfer`      | FailedPrecondition | 37   | `ErrInvalidPagination` †           | InvalidArgument    |
| 19   | `ErrAccountLimitReached` † | ResourceExhausted  | 38   | `ErrSettlementHeld`                | FailedPrecondition |

### App wiring and upgrade

| Item             | Fact                                                                                                                                                                                                                                                                         | Source                                                         |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Module account   | `sink` with no permissions                                                                                                                                                                                                                                                   | `app/mac.go:16-29`                                             |
| Blocked address  | Every module account is blocked; no receiving exceptions                                                                                                                                                                                                                     | `app/app.go:85, 516-526`                                       |
| Ante order       | `DepositDecorator` runs after `ValidateBasic`, timeout and memo checks and before fee deduction and signature checks                                                                                                                                                         | `app/ante.go:48-61`                                            |
| Keeper authority | Governance module account                                                                                                                                                                                                                                                    | `app/types/app.go:301-308`                                     |
| Install          | `PrepareInstall`: fails if already initialized or if another module owns the address; replaces any other account with the module account (same account number and sequence); sends the whole balance to the community pool; clears withdraw addresses that point at the sink | `x/sink/keeper/install.go:30-100`                              |
| Upgrade `v2.2.0` | Refuse if `sink` is in the version map; `PrepareInstall`; `RunMigrations` (sink `InitGenesis` with the default genesis); escrow repair; Pyth Wasm migration; `CheckBalance`; `SetParams(DefaultParams())`, which creates policy version 1 with no members and ratio 0.66     | `upgrades/software/v2.2.0/upgrade.go:21-101`                   |
| Store loader     | `Added: ["sink"]`                                                                                                                                                                                                                                                            | `upgrades/software/v2.2.0/upgrade.go:34-39`                    |
| Quota epoch      | `x/epochs` record `day`; advances in the first block after its end, once per block                                                                                                                                                                                           | `x/sink/keeper/epoch.go:9-23`; `x/epochs/keeper/abci.go:29-58` |

## Solana AKT program

Paths in this section are relative to `contracts/solana/programs/akt-solana/src` unless noted. The program ID in the source is a development key (`lib.rs:14`); launch uses fresh keypairs.

### Accounts

| Account                          | Seeds                                                        | Size (bytes)                  | Fields                                                                                                                                               | Source                          |
| -------------------------------- | ------------------------------------------------------------ | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| `LaunchConfig`                   | `["config"]`                                                 | 84                            | `version` (2), `initializer`, `mint`, `bridge_enabled`, `initialized_at_slot`, `bump`, `mint_authority_bump`                                         | `state.rs:15-33`                |
| AKT mint                         | `["mint"]`                                                   | SPL mint                      | 6 decimals, mint authority `["mint_authority"]`, no freeze authority                                                                                 | `instructions/genesis.rs:34-45` |
| Mint authority                   | `["mint_authority"]`                                         | 0                             | Signs mint and Metaplex CPIs; metadata update authority                                                                                              | `constants.rs:12-14`            |
| `BridgeConfig`                   | `["bridge"]`                                                 | 656                           | `light_client_program`, `chain_id` (≤ 64), `policy`, `mint_day`, `minted_today`                                                                      | `state.rs:36-72`                |
| `MintPolicy` (in `BridgeConfig`) | —                                                            | —                             | `per_transfer_max`, `daily_mint_cap`, `vaults` (≤ 16, no zero key); `0 < per_transfer_max ≤ daily_mint_cap`                                          | `state.rs:75-100`               |
| `PauseGuardian`                  | `["guardian"]`                                               | 42                            | `guardian: Option<Pubkey>`, `bump`                                                                                                                   | `state.rs:105-112`              |
| `ProofBuffer`                    | `["proof", submitter, nonce]`                                | 80 + `expected_len`, ≤ 16,464 | `submitter`, `nonce` (SHA-256 of the proven key), `expected_len` (1 to 16,384), `data`. First allocation ≤ 10,240; `grow_proof_buffer` adds the rest | `state.rs:116-159`              |
| `TransferStatus`                 | `["transfer", SHA-256(owner), LE64(height), LE64(sequence)]` | 340                           | `id`, `proof_height`, `resolved_at_slot`, `outcome`: `Minted { amount, recipient }` or `Voided { reason: InvalidRecipient or Governance }`           | `state.rs:161-193`              |

Sizes are asserted in `state.rs:363-369`.

### Instructions

Admin instructions take `UpgradeAuthority { program, program_data, authority }`, where `authority` must be the upgrade authority recorded in `ProgramData` (`instructions/upgrade_authority.rs:16-24`). If the program is made immutable, every admin instruction fails.

| Instruction           | Arguments                                                                     | Accounts after the admin accounts                                                                                                                                                                                                                                            | Caller                  | Source                                        |
| --------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | --------------------------------------------- |
| `initialize`          | —                                                                             | `program`, `program_data`, `authority`, `config` (init), `mint` (init), `mint_authority`, `token_program`, `system_program`                                                                                                                                                  | Upgrade authority, once | `instructions/genesis.rs:7-72`                |
| `set_token_metadata`  | `uri: String` (`https://`, 9 to 200 printable ASCII bytes)                    | `config`, `mint`, `mint_authority`, `metadata`, `metadata_program`, `system_program`, `rent`                                                                                                                                                                                 | Upgrade authority       | `instructions/token_metadata.rs:14-123`       |
| `configure_bridge`    | `chain_id: String` (1 to 64 bytes), `policy: MintPolicy`                      | `config`, `bridge` (init), `light_client_program`, `client_state`, `latest_consensus`, `system_program`                                                                                                                                                                      | Upgrade authority, once | `instructions/bridge_admin.rs:14-93`          |
| `set_bridge_enabled`  | `enabled: bool`                                                               | `config`, `bridge`                                                                                                                                                                                                                                                           | Upgrade authority       | `instructions/bridge_admin.rs:41-48, 96-103`  |
| `set_mint_policy`     | `policy: MintPolicy`                                                          | `config`, `bridge`                                                                                                                                                                                                                                                           | Upgrade authority       | `instructions/bridge_admin.rs:107-112`        |
| `set_pause_guardian`  | `guardian: Option<Pubkey>`                                                    | `pause_guardian` (init if needed), `system_program`                                                                                                                                                                                                                          | Upgrade authority       | `instructions/pause_guardian.rs:13-52`        |
| `guardian_pause`      | —                                                                             | `guardian` (signer), `pause_guardian`, `config`                                                                                                                                                                                                                              | Pause guardian          | `instructions/pause_guardian.rs:27-61`        |
| `repin_light_client`  | `chain_id: String`                                                            | `bridge`, `light_client_program`, `client_state`, `latest_consensus`                                                                                                                                                                                                         | Upgrade authority       | `instructions/bridge_admin.rs:50-65, 119-135` |
| `create_proof_buffer` | `nonce: [u8; 32]`, `expected_len: u32`                                        | `submitter`, `proof_buffer` (init), `system_program`                                                                                                                                                                                                                         | Anyone                  | `instructions/proof_buffer.rs:7-17, 51-63`    |
| `grow_proof_buffer`   | —                                                                             | `submitter`, `proof_buffer` (realloc), `system_program`                                                                                                                                                                                                                      | Buffer submitter        | `instructions/proof_buffer.rs:19-29, 65-67`   |
| `append_proof`        | `offset: u32`, `chunk: Vec<u8>` (1 to 500 bytes)                              | `submitter`, `proof_buffer`                                                                                                                                                                                                                                                  | Buffer submitter        | `instructions/proof_buffer.rs:31-38, 72-91`   |
| `close_proof_buffer`  | —                                                                             | `submitter`, `proof_buffer` (close)                                                                                                                                                                                                                                          | Buffer submitter        | `instructions/proof_buffer.rs:40-48, 95-97`   |
| `mint_transfer`       | `id: TransferId`, `recipient_key: Pubkey`, `amount: u64`, `proof_height: u64` | `payer`, `config`, `bridge`, `proof_buffer`, `status` (init), `light_client_program`, `client_state`, `latest_consensus`, `proof_consensus`, `mint`, `mint_authority`, `recipient`, `recipient_token_account`, `token_program`, `associated_token_program`, `system_program` | Anyone, top level       | `instructions/mint_transfer.rs:24-203`        |
| `void_transfer`       | `id: TransferId`, `settlement_status: u8` (1 to 5), `proof_height: u64`       | `payer`, `bridge`, `proof_buffer`, `status` (init), `light_client_program`, `client_state`, `latest_consensus`, `proof_consensus`, `system_program`                                                                                                                          | Anyone, top level       | `instructions/void_transfer.rs:12-76`         |

`initialize` and `mint_transfer`/`void_transfer` do not use the admin account group; their full account lists are given. Instruction data is the 8-byte Anchor discriminator followed by Borsh arguments. With a 20-byte owner, `mint_transfer` data is 96 bytes and `void_transfer` data is 57 bytes (`wire.rs:237-278`).

The resolution rules are in `instructions/resolution.rs:26-76`, `light_client.rs:23-187`, `instructions/mint_transfer.rs:83-203` and `authorization.rs:71-125`:

- The instruction is top level and preceded only by ComputeBudget instructions.
- Light-client accounts are authenticated by owner, PDA and discriminator. The client has the right chain ID, is not frozen, and has 0 < trusting period < unbonding period. The latest consensus timestamp is positive and ≤ now + drift, and now < timestamp + trusting period. `0 < proof_height ≤ latest height`. The ID is valid and `id.height < proof_height`.
- The buffer nonce equals SHA-256(key), the buffer is complete, and two-level membership is checked with `tendermint_light_client_membership::membership` against the consensus root.
- For a mint, recipient acceptance requires all of: not executable, not the zero key, not the mint-authority PDA, not owned by either token program; System-owned and on curve, or listed in `vaults`; and an associated token account that is absent or an initialized legacy SPL Token account for the mint owned by the recipient.
- Caps apply only to mints. `day = unix_timestamp / 86,400`, and a day earlier than `mint_day` fails with `InvalidClock`.

### Errors

Anchor adds 6000 to the enum discriminants, starting at 1000 (`errors.rs:4-77`; the IDL test is `contracts/solana/tests/idl.test.ts:173-208`).

| Code | Name                        | Message                                                                                                                 |
| ---- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 7000 | `InvalidProgramData`        | ProgramData account does not belong to this program                                                                     |
| 7001 | `UnauthorizedInitializer`   | Only this program's upgrade authority may run genesis                                                                   |
| 7002 | `InvalidAuthority`          | Signer is not this program's upgrade authority                                                                          |
| 7003 | `UnauthorizedGuardian`      | Signer is not the configured pause guardian                                                                             |
| 7004 | `InvalidMetadataUri`        | Metadata URI must start with https:// and be 9 to 200 printable ASCII bytes                                             |
| 7005 | `InvalidMetadata`           | Existing metadata is not for the AKT mint or not controlled by the mint-authority PDA                                   |
| 7006 | `InvalidChainId`            | Chain ID must be 1 to 64 bytes                                                                                          |
| 7007 | `InvalidPolicy`             | Mint policy needs 0 < per-transfer max <= daily cap and at most 16 nonzero vaults                                       |
| 7008 | `InvalidLightClient`        | Light-client account has the wrong owner or address, or invalid parameters                                              |
| 7009 | `WrongChain`                | Light-client chain ID differs from the expected chain ID                                                                |
| 7010 | `ClientFrozen`              | Light client is frozen                                                                                                  |
| 7011 | `ClientExpired`             | Light client's latest consensus state is older than its trusting period                                                 |
| 7012 | `InvalidConsensusTimestamp` | Latest consensus timestamp is zero or later than the clock plus the allowed drift                                       |
| 7013 | `InvalidProofHeight`        | Proof height must be between 1 and the client's latest height                                                           |
| 7014 | `InvalidProofLength`        | Proof must declare 1 to 16384 bytes; chunks must be 1 to 500 bytes and fit that length                                  |
| 7015 | `InvalidProofOffset`        | Proof chunk offset must equal the number of bytes already written                                                       |
| 7016 | `IncompleteProof`           | Proof buffer holds fewer bytes than it declared                                                                         |
| 7017 | `BridgeDisabled`            | Bridge minting is disabled                                                                                              |
| 7018 | `CpiNotAllowed`             | Mint and void must be top-level instructions, not CPI                                                                   |
| 7019 | `PrecedingInstruction`      | Only compute budget instructions may precede mint or void                                                               |
| 7020 | `InvalidRecord`             | Record needs a 1-to-255-byte owner, positive sequence and amount, and 0 < height <= MaxInt64 with height < proof height |
| 7021 | `InvalidClock`              | Solana clock is negative or earlier than the recorded mint day                                                          |
| 7022 | `TransferLimit`             | Amount exceeds the per-transfer mint limit; retry after a policy change                                                 |
| 7023 | `DailyLimit`                | Amount would exceed the daily mint cap; retry on a later UTC day                                                        |
| 7024 | `InvalidProofNonce`         | Proof buffer nonce must be the full SHA-256 of the proven key                                                           |
| 7025 | `InvalidSettlementStatus`   | Canonical settlement status must be 1 through 5                                                                         |
| 7026 | `InvalidVoidAuthorization`  | Settlement must contain a unique, bounded permanent void authorization                                                  |
| 7027 | `InvalidMembershipProof`    | Full IAVL and multistore membership proof does not verify                                                               |
| 7028 | `ProofBufferTooSmall`       | Grow the proof buffer before appending beyond its allocation                                                            |

A pruned or missing consensus state fails as `InvalidLightClient` (`light_client.rs:35-53`).

### Events

`events.rs:14-83`. Events are emitted with `emit!` as `Program data:` log lines.

| Event                 | Fields                                                         | Emitted by                       |
| --------------------- | -------------------------------------------------------------- | -------------------------------- |
| `LaunchInitialized`   | `mint`, `initializer`                                          | `initialize`                     |
| `TokenMetadataSet`    | `mint`, `metadata`, `uri`                                      | `set_token_metadata`             |
| `BridgeConfigured`    | `light_client_program`, `chain_id`, `policy`                   | `configure_bridge`               |
| `BridgeEnabledSet`    | `enabled`, `authority`                                         | `set_bridge_enabled`             |
| `MintPolicySet`       | `previous`, `policy`                                           | `set_mint_policy`                |
| `PauseGuardianSet`    | `previous`, `guardian`                                         | `set_pause_guardian`             |
| `GuardianPaused`      | `guardian`                                                     | `guardian_pause`                 |
| `LightClientRepinned` | `previous_program`, `program`, `previous_chain_id`, `chain_id` | `repin_light_client`             |
| `TransferResolved`    | `id`, `proof_height`, `resolved_at_slot`, `outcome`            | `mint_transfer`, `void_transfer` |

### Constants

`constants.rs:9-61`, `wire.rs:7-10`, `authorization.rs:6-8`.

| Constant                                                                        | Value                                                                                                                                        |
| ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Seeds                                                                           | `config`, `mint`, `mint_authority`, `bridge`, `guardian`, `transfer`, `proof`; light client `client`, `consensus_state`; Metaplex `metadata` |
| `AKT_DECIMALS`                                                                  | 6                                                                                                                                            |
| `LAUNCH_CONFIG_VERSION`                                                         | 2                                                                                                                                            |
| `TOKEN_NAME`, `TOKEN_SYMBOL`                                                    | "Akash Network", "AKT"                                                                                                                       |
| `METADATA_URI_SCHEME`, `MAX_METADATA_URI_LEN`                                   | `https://`, 200                                                                                                                              |
| `MAX_CHAIN_ID_LEN`                                                              | 64                                                                                                                                           |
| `MAX_VAULTS`                                                                    | 16                                                                                                                                           |
| `MAX_PROOF_BYTES`, `MAX_PROOF_CHUNK_BYTES`                                      | 16,384, 500                                                                                                                                  |
| `SECONDS_PER_DAY`                                                               | 86,400                                                                                                                                       |
| `SINK_STORE`, `TRANSFER_KEY_PREFIX`, `SETTLEMENT_KEY_PREFIX`, `MAX_OWNER_BYTES` | `sink`, `02 00`, `03 01`, 255                                                                                                                |
| Void parser limits                                                              | observation 79, veto reason 256, authorization 21 bytes                                                                                      |

### Dependencies

`contracts/solana/programs/akt-solana/Cargo.toml:23-34` and `contracts/solana/Cargo.toml:12-15`:

- `anchor-lang` =0.32.1 (`init-if-needed`) and `anchor-spl` =0.32.1 (`metadata`).
- `solana-curve25519` =2.3.5, `solana-instruction` =2.3.0 (`syscalls`), `solana-sha256-hasher` =2.2.1, `solana-allocator` =0.1.2.
- `ibc-core-commitment-types` =0.57.0, `ibc-proto` =0.51.1.
- `tendermint-light-client-membership` from `akash-network/ibc-contracts` at `0da3165d8428a1b7792cc17551ecd1d3985761e6` (`solana` feature).
- ICS07 account types come from `declare_program!` over `contracts/solana/idls/ics07_tendermint.json` (`contracts/solana/programs/akt-solana/ics07-tendermint-interface/src/lib.rs`).
- `tendermint`, `tendermint-proto` and `tendermint-light-client-verifier` are patched to `cometbft/tendermint-rs` `a2aa5bf`.

`contracts/solana/scripts/fetch-light-client.py:24-31` refuses to build unless the program and the header encoder pin the same full IBC commit.

The IBC repository merges the four verifier changes as commits `c8cf7fa6` (signature batches), `9af99b68` (monotonic latest height), `a573c29f` (consensus pruning) and `0da3165d` (open relaying). Pruning adds ICS07 errors 6034 and 6035 (`contracts/solana/docs/verifier.md:3-20, 64-66`).

## Off-chain services

Paths in this section are relative to `contracts/solana`.

### Relayer

| Setting                  | Default                     | Range                                           | Source                                                         |
| ------------------------ | --------------------------- | ----------------------------------------------- | -------------------------------------------------------------- |
| `maxLamportsPerTransfer` | 5,000,000                   | 1 to 1,000,000,000                              | `local/relay-config.ts:146-151`; `local/relay-policy.ts:67-69` |
| `maxHeaderSignatures`    | 100                         | 1 to 128                                        | `local/relay-config.ts:152-157`; `local/relay-policy.ts:445`   |
| `refreshFraction`        | 1/5                         | 0 < f < 1                                       | `local/relay-config.ts:126-134`; `local/relay-policy.ts:21-23` |
| `retryMaxSeconds`        | 900                         | 6 to 86,400                                     | `local/relay-config.ts:159`                                    |
| `pruneIntervalSeconds`   | 600                         | 60 to 86,400                                    | `local/relay-config.ts:160`                                    |
| `maxAgeSeconds`          | 60                          | 10 to 600                                       | `local/relay-config.ts:161`                                    |
| `pollSeconds`            | 3                           | 1 to 600                                        | `local/relay-config.ts:162`                                    |
| `lightClientProgram`     | unset (follow `["bridge"]`) | optional pin; a different pin stops the relayer | `local/relay-config.ts:29-30`; `local/relay.ts:300-360`        |

Behavior:

- Resolutions request 1,400,000 compute units and a 256 KiB heap (`local/relay.ts:279-282`).
- Proofs come from `/store/sink/key` with `prove=true` at proof height − 1 (`local/relay.ts:1068-1080`).
- Before paying, the relayer waits on pause, caps, clock and recipient checks (`local/relay-policy.ts:103-145, 192-207`).
- It never mints a transfer that Akash shows as `REFUND_PENDING` or `REFUNDED` without a void order, and it rechecks Akash before the first paid transaction and again before resolution (`local/relay-policy.ts:151-162, 234-255`; `local/relay.ts:1091-1130`).
- Header refresh happens when a record needs a newer proof height or the client reaches `refreshFraction` of its trusting period (`local/relay-policy.ts:212-230`).
- Pruning runs only when the payer is a `RELAYER_ROLE` member (`local/relay.ts:1530-1555`).

### Reporter

| Setting                     | Rule                                                                       | Source                                               |
| --------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------- |
| `reporter`                  | Lowercase 20-byte `akash` address                                          | `reporter/config.ts:139-146`                         |
| `maxAgeSeconds`             | 1 to 600                                                                   | `reporter/config.ts:171`                             |
| `maxSlotLead`               | optional, up to 100,000; default `(maxAgeSeconds + 60) × 5`                | `reporter/config.ts:172`; `reporter/solana.ts:84-86` |
| `auditPerScan`              | default 100, up to 10,000                                                  | `reporter/config.ts:174`                             |
| `pollSeconds`               | 1 to 60                                                                    | `reporter/config.ts:175`                             |
| `feeAmountUakt`, `gasLimit` | at most 1,000,000 uakt and 20,000,000 gas                                  | `reporter/config.ts:147-154`                         |
| `externalSigner`            | absolute command path, up to 32 arguments, 1 to 120 s timeout (default 10) | `reporter/config.ts:38-81`                           |

The reporter reads at finalized commitment (`reporter/run.ts:106-111`) and runs in preview mode unless started with `--broadcast` (`reporter/run.ts:75-83`). Each pass reviews disputes and open transfers and then a rolling audit of history (`reporter/scan.ts:98-163`). Its decisions are in `reporter/policy.ts:121-257`: report under the current policy and round, veto a `REFUND_PENDING` transfer with no finalized Solana status before its challenge end, and finalize the refund-queue head when it is payable.

### Monitor and reconciler

| Service                               | Checks                                                                                                                                                                                     | Defaults                                           | Source                                                          |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------- | --------------------------------------------------------------- |
| Monitor (local supervised stack only) | Disk (warning 80%, critical 90%); Akash and Solana height stalls (critical after 300 s); light-client age (warning 25%, critical 50% or frozen); pin change; relayer access; payer balance | interval 60 s; payer warning 5 SOL, critical 1 SOL | `local/monitor.ts:32-59, 140-257`                               |
| Reconciler                            | Solana supply plus indexed burns against finalized `Minted` statuses; bank balance against pending + minted + voided + refund-pending; per-transfer alerts                                 | report lag 600 s                                   | `local/reconcile.ts:181-353`; `local/reconcile-policy.ts:12-70` |

### Rent figures used in the README

The README figures are computed from account sizes at Solana's rent-exempt rate: 6,960 lamports per byte, including the 128-byte account overhead.

| Account                  | Bytes  | Lamports                                      |
| ------------------------ | ------ | --------------------------------------------- |
| `TransferStatus`         | 340    | 3,257,280                                     |
| Associated token account | 165    | 2,039,280                                     |
| ICS07 consensus state    | 88     | 1,503,360 (matches `docs/verifier.md:48-50`)  |
| `ProofBuffer`            | 80 + n | (208 + n) × 6,960; 115,480,320 for n = 16,384 |
