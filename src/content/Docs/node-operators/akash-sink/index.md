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

Validators need no new service to keep transfers working. After the chain upgrade that installs the `sink` module, run the upgraded `akash` binary as usual. The release and its upgrade guide are TBD at launch; see [Releases](#releases-and-network-values).

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
4. When enough reporters agree, Akash settles the transfer as minted, or as voided with a refund after the challenge window.

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
2. Share your reporter account address. A governance proposal adds it to `reporters` and adjusts `reporter_threshold`, for example with [`akt tx sink propose-params`](/docs/developers/akt/sink#governance-actions).
3. Once the proposal passes, run the reporter with broadcasting enabled.

Changing the reporter set or the threshold starts a new reporter epoch. Votes from the previous epoch no longer count, and reporters vote again on open transfers.

---

## Releases and Network Values

| Item                                            | Value                                                                                                                    |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Akash node release with the `sink` module       | TBD at launch                                                                                                            |
| Akash Sink services release (relayer, reporter) | TBD at launch                                                                                                            |
| Akash Sink services release checksum            | TBD at launch                                                                                                            |
| akt release with the sink commands              | TBD at launch                                                                                                            |
| `sink` module source                            | [akash-network/node `x/sink`](https://github.com/akash-network/node/tree/feat/sink/x/sink)                               |
| Solana programs, relayer and reporter source    | [akash-network/node `contracts/solana`](https://github.com/akash-network/node/tree/feat/sink-contracts/contracts/solana) |
| Akash Sink portal source                        | [akash-network/sink-portal](https://github.com/akash-network/sink-portal)                                                |
| Akash chain ID                                  | `akashnet-2`                                                                                                             |
| Solana genesis hash (mainnet)                   | `5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d`                                                                           |
| AKT program on Solana                           | TBD at launch                                                                                                            |
| AKT mint on Solana                              | TBD at launch                                                                                                            |

---

## Related Resources

- [Run an Akash Sink Reporter](/docs/node-operators/akash-sink/reporter) - Nodes, key custody, preview, onboarding and alerts
- [Run an Akash Sink Relayer](/docs/node-operators/akash-sink/relayer) - Nodes, payer funding, update rights and alerts
- [Akash Sink](/docs/learn/akash-sink) - How transfers work for users
- [Send AKT to Solana with akt](/docs/developers/akt/sink) - Sink commands, including reporter and governance commands
