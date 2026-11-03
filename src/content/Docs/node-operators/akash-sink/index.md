---
categories: ["Node Operators"]
tags: ["Akash Sink", "Solana", "Reporter", "Relayer", "Validators"]
weight: 6
title: "Akash Sink Services"
linkTitle: "Akash Sink"
description: "What Akash validators and node operators run for Akash Sink: the relayer and reporter services that move AKT transfers from Akash to Solana"
---

**Akash Sink moves AKT one way from Akash to Solana. Two services run alongside Akash nodes to keep it working: relayers and reporters.** This section covers what each one does and what you need to run it.

For how transfers work from a user's point of view, see [Akash Sink](/docs/learn/akash-sink).

---

## What Validators Need

Validators need no new service to keep transfers working. After the chain upgrade that installs the `sink` module, run the upgraded `akash` binary as usual. The release and its upgrade guide are TBD at launch; use the matching [release manifest](#releases-and-network-values).

Mints on Solana are authorized by the signatures validators already produce. An Akash light client on Solana verifies each block header against the Akash validator set, then checks a proof of the transfer record against that header. No extra key or signing service is involved.

Validators are well placed to run the two services below, since both need Akash nodes and around-the-clock operations. Run them on their own hosts, not on your validator.

---

## Services

| Service  | What it does                                                                                                                                                   | Authority                                                                                                                                 | Who runs it      |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| Relayer  | Uploads Akash block headers to the light client on Solana, and submits the proofs that mint or void each transfer. At least one must run for transfers to move | None. Solana verifies every header and proof, so a relayer can only delay transfers                                                       | Anyone           |
| Reporter | Reads each transfer's outcome from its own Solana node and votes on Akash, so Akash can close the transfer or refund it                                        | Votes only, and can never mint. A refund needs more than two thirds of the reporters, a challenge window of at least 72 hours and no veto | The reporter set |

Neither service holds user funds or controls the AKT program on Solana.

---

## How They Fit Together

1. A user deposits AKT on Akash. The `sink` module locks it and writes a transfer record.
2. A relayer proves the record on Solana. The AKT program mints the AKT, or voids the transfer if the address can't receive it.
3. Each reporter reads the result at finalized commitment from its own Solana node and sends `MsgReportOutcome` on Akash.
4. When enough reporters agree, Akash settles the transfer as minted, or as refund-pending. Payment follows only after every refund condition is met.

If no relayer runs, transfers wait. If fewer reporters than the threshold report, transfers stay pending on Akash. Neither failure loses funds.

---

## What You Need

**Relayer:** an Akash node that keeps at least one light-client trusting period of state, a Solana RPC you run or trust, and a Solana payer key funded with SOL. See the [relayer requirements](/docs/node-operators/akash-sink/relayer#requirements).

**Reporter:** your own Akash node, your own Solana RPC node with transaction history, an Akash account key in a KMS or HSM, and AKT for fees. See the [reporter requirements](/docs/node-operators/akash-sink/reporter#requirements).

Both run on Node.js 24 from the Akash Sink services release, each on its own host.

---

## Become a Reporter

Akash governance sets the reporters in the `sink` module parameters: up to 32 accounts, with a vote threshold above two thirds of the set.

1. Set up your nodes and run the reporter in preview mode, which reads and decides without sending anything. See [Run a Reporter](/docs/node-operators/akash-sink/reporter).
2. Share your reporter account address. A governance proposal adds it to `reporters` and adjusts `reporters_threshold`, for example with [`akt tx sink update-params`](/docs/developers/akt/sink#governance-actions).
3. Once the proposal passes, run the reporter with broadcasting enabled.

The threshold is a decimal ratio with `3 × ratio > 2` and `ratio <= 1`. The required vote count is the ratio times membership, rounded up. Changing membership or that effective count creates a new immutable policy version; reordering the same members does not.

Unpaid transfers refresh their quorum authorization under the new policy. Minted and refunded records retain the evidence that authorized their outcome. Governance-confirmed refund authorization survives rotation. Votes retain their policy versions, and opposite evidence can create a conflict even after a transfer is financially complete. Query `disputes` to include those terminal conflicts.

SDK observation validation checks outcome/evidence format. It does not verify a Solana transaction or finality. Each reporter must do those checks against its own correctly identified node before signing.

---

## Recovery and Deployment Compatibility

The composite-ID module uses genesis schema version 4 and module consensus version 2. Numeric-ID and earlier composite-ID testnets require fresh paired state. Schema versions 1 through 3 are rejected; changing the marker alone is not a migration. Preserve the old programs, ledgers, runtime state and portal history; do not copy scalar-ID journals into the new services. The chain upgrade only installs sink on pre-sink state and rejects an existing sink version entry.

A populated export contains parameters, the explicit current policy version and referenced policy history, raw send/refund usage, each `GenesisRecord` with its status and complete settlement, and each account's usage once. Settlement data includes the permanent void authorization, retained votes, governance observation, veto and integer challenge deadline. Import restores canonical status keys and rebuilds dispute, refund and history indexes. It does not create new funds, sweep balances or guess missing authorization.

The module bank balance must equal the sum of pending, minted, void-requested and refund-pending amounts in `uakt`, with no extra denominations. Refunded amounts are outside escrow. Restore bank and auth state together with sink state and verify the populated export/import round trip before enabling services.

Set genesis `genesis_time` at or after the exported last block time, and keep `initial_height` above all imported transfer heights. Import rejects a record at or above the first block height, because reusing an ID would collide with its permanent Solana resolution account. The per-block sequence resets to zero at BeginBlock; the first issued sequence is 1. A database restart continues from its committed height.

Back up the full export, binaries, program artifacts and network manifest. Verify their hashes and chain/program/mint identities before resuming. Compare the exported policy history and raw epoch usage. Query the restored transfers, disputes, refund head and current policy, and reconcile escrow against Solana outcomes. A successful process start alone is not a recovery check.

---

## Build and Network Values

Use the reviewed build manifest for the exact node/SDK/services versions, checksums, Akash chain ID, Solana genesis hash, program ID and mint. Do not infer compatibility from the `akash.sink.v1` protobuf package name: the unreleased schema changed inside that package. No new deployment address is assigned by these instructions.

- [Node, module and Solana services source](https://github.com/akash-network/node)
- [SDK source](https://github.com/akash-network/chain-sdk)
- [Portal source](https://github.com/akash-network/sink-portal)

---

## Related Resources

- [Run an Akash Sink Reporter](/docs/node-operators/akash-sink/reporter)
- [Run an Akash Sink Relayer](/docs/node-operators/akash-sink/relayer)
- [Akash Sink](/docs/learn/akash-sink)
- [Send AKT to Solana with akt](/docs/developers/akt/sink)
