---
categories: ["Node Operators", "Akash Sink"]
tags: ["Akash Sink", "Relayer", "Solana", "Validators"]
weight: 2
title: "Run an Akash Sink Relayer"
linkTitle: "Relayer"
description: "Run an Akash Sink relayer: an Akash node with proof history, a Solana RPC, a funded payer key, configuration, update rights, spend limits and alerts"
---

A relayer carries Akash state to Solana. It keeps the Akash light client on Solana current by uploading signed Akash block headers, and submits the proofs that mint or void each transfer.

A relayer has no trusted power: the light client verifies every header and the AKT program verifies every proof. Anyone can run one, and several can run at once. Each transfer resolves once on Solana, and a relayer that loses the race pays only its proof-upload fees.

Read [Akash Sink Services](/docs/node-operators/akash-sink) first for how relayers fit in.

---

## Requirements

- **Akash node:** a CometBFT RPC endpoint you run or trust, serving proofs of the `sink` store at every height from the light client's latest verified height to now. Keep at least one light-client trusting period of state; `pruning = "nothing"` is simplest.
- **Solana RPC:** HTTP JSON-RPC, from your own node or a provider you trust. A dishonest RPC can't make Solana accept a false header or proof, but it can waste fees.
- **Payer key:** a Solana keypair file used only by this relayer, funded with SOL.
- **State directory:** one per relayer and payer. It holds header-upload journals and the spend ledger.
- **Runtime:** Node.js 24 and the Akash Sink services release (TBD at launch). It needs no Akash or Solana validator. Run it on its own host, not on your validator.

The Akash node must not be catching up, and its latest block must be newer than `maxAgeSeconds`.

---

## Install

Download the Akash Sink services release, which contains both the relayer and the reporter, and check it against its published checksum:

- Release: TBD at launch
- Checksum: TBD at launch
- Source: [akash-network/node `contracts/solana`](https://github.com/akash-network/node/tree/feat/sink-contracts/contracts/solana)

The release runs on Node.js 24. Run the commands on this page from the release directory.

---

## STEP 1: Create and Fund the Payer

```bash
solana-keygen new -o /etc/akt-relayer/payer-keypair.json
chmod 600 /etc/akt-relayer/payer-keypair.json
solana-keygen pubkey /etc/akt-relayer/payer-keypair.json
```

Send SOL to the payer address. Measured costs at the base fee, without priority fees:

| Action                                 | Cost             |
| -------------------------------------- | ---------------- |
| Mint to a wallet's first AKT account   | About 0.0035 SOL |
| Mint to an existing token account      | About 0.0014 SOL |
| Void                                   | About 0.0014 SOL |
| Header update                          | About 0.0015 SOL |
| Proof buffer, while a proof is pending | About 0.03 SOL   |

A first mint includes the rent for the wallet's new AKT token account. Proof buffer rent comes back when the buffer closes, and pruning an expired header returns its rent to the relayer that prunes it.

Updates happen only when a pending transfer needs a newer header, or when the light client has gone a fifth of its trusting period without one. Hold a few days of spend plus 0.05 SOL for temporary accounts.

The relayer doesn't watch its own balance. Set up an alert for it.

---

## STEP 2: Configure

Create `/etc/akt-relayer/config.json`. Relative paths resolve against the file's directory, and unknown fields are rejected:

```json
{
  "akashRpc": "http://127.0.0.1:26657",
  "akashChainId": "akashnet-2",
  "solanaRpc": "http://127.0.0.1:8899",
  "solanaGenesisHash": "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d",
  "programId": "<AKT program, TBD at launch>",
  "payerKeyFile": "/etc/akt-relayer/payer-keypair.json",
  "stateDir": "/var/lib/akt-relayer"
}
```

| Field                    | Required | Meaning                                                    |
| ------------------------ | -------- | ---------------------------------------------------------- |
| `akashRpc`               | Yes      | CometBFT RPC URL                                           |
| `akashChainId`           | Yes      | `akashnet-2`; the node and the AKT program must match      |
| `solanaRpc`              | Yes      | Solana JSON-RPC URL, with no credentials                   |
| `solanaGenesisHash`      | Yes      | Checked at startup                                         |
| `programId`              | Yes      | The AKT program on Solana                                  |
| `payerKeyFile`           | Yes      | Owner-only payer keypair                                   |
| `stateDir`               | Yes      | Journals and spend ledger                                  |
| `lightClientProgram`     | No       | Optional pin; leave unset to follow changes                |
| `maxLamportsPerTransfer` | No       | Spend limit per transfer, default 5,000,000 lamports       |
| `maxHeaderSignatures`    | No       | Larger commits are trimmed, default 100                    |
| `refreshFraction`        | No       | Share of the trusting period before an update, default 0.2 |
| `retryMaxSeconds`        | No       | Longest backoff for a failed transfer, default 900         |
| `pruneIntervalSeconds`   | No       | How often expired headers are pruned, default 600          |
| `maxAgeSeconds`          | No       | Oldest acceptable Akash block, default 60                  |
| `pollSeconds`            | No       | Pause between passes, default 3                            |

Take `solanaGenesisHash` from a trusted source, not from the RPC you configure. Never point two running relayers at one `stateDir`.

Skipping across a long interval needs the old validator set to hold more than a third of the new voting power. Lower `refreshFraction` if the validator set changes quickly.

---

## STEP 3: Run

From the release directory:

```bash
npm run relayer -- --config /etc/akt-relayer/config.json
```

The relayer runs continuously. Run it under a supervisor such as systemd that always restarts it. Each output line is JSON, and alerts go to stderr. A restart resumes an interrupted header upload from the state directory.

---

## Update Rights

Mints and voids are open to anyone. Header updates need update rights on the light client, which the relayer logs as `relayer-access` at startup and whenever they change:

| `access` | Meaning                                              | Updates headers | Prunes |
| -------- | ---------------------------------------------------- | --------------- | ------ |
| `member` | The payer holds the relayer role on the light client | Yes             | Yes    |
| `open`   | Open relaying is on, so any payer can update headers | Yes             | No     |
| `none`   | Neither                                              | No              | No     |

With `none`, the relayer still relays transfers that the latest verified header already covers, and logs `relay-header-blocked` when a newer header is needed. The AKT program's multisig grants the relayer role and turns open relaying on or off.

---

## Before It Pays

For each transfer without a result on Solana, the relayer:

1. Waits without paying while minting is paused or a per-transfer or daily cap applies (`relay-wait`). Capped transfers mint once the limit allows.
2. Never relays a record that Akash shows as voided or refunded without a Solana result (`relay-unbacked-settlement`).
3. Rereads the transfer at the newest Akash height right before its first paid transaction (`relay-final-check`).
4. Simulates every transaction before sending it, so a failing one costs nothing.

---

## Spend Limit

The relayer records what it pays per transfer: every fee, plus the rent its resolving transaction locks. When a transfer's total passes `maxLamportsPerTransfer`, the relayer stops paying for it and logs `relay-budget-exhausted`. The default of 5,000,000 lamports leaves room for dozens of failed attempts.

Investigate the transfer's `relay-retry` errors, then reset its budget:

```bash
npx tsx local/relay.ts --config /etc/akt-relayer/config.json --reset-budget 42
npx tsx local/relay.ts --config /etc/akt-relayer/config.json --reset-budget all
```

The running relayer picks up the change on its next pass.

---

## Large Validator Sets

A header with more than `maxHeaderSignatures` signatures doesn't fit one Solana transaction. The relayer keeps the highest-power signers until they hold more than two thirds of the voting power, with a margin, marks the rest absent, and logs `header-signatures-trimmed`. If no subset fits, it logs `header-unsupported`.

---

## Alerts

Route these to someone on call:

- `light-client-changed`: governance moved the AKT program to a new light client. Confirm the proposal and check `relayer-access`.
- `light-client-mismatch`: the light client differs from your pin, and paying has stopped. Verify the change, then update or remove the pin.
- `bridge-chain-mismatch`: the AKT program accepts another Akash chain. Check `akashChainId` and `programId`.
- `relayer-access` with `none`, or `relay-header-blocked`: the payer can't update the light client. Request the relayer role, or rely on another relayer.
- `relay-budget-exhausted`: the spend limit was reached for one transfer. Read its `relay-retry` errors, fix the cause, then reset.
- `relay-final-check`: Akash changed between planning and paying. Review the transfer; this is usually a governance action.
- `relay-unbacked-settlement`: Akash shows a void or refund with no Solana result. Investigate the reporters or governance.
- Repeated `relay-retry` or `header-retry`: transfers or updates keep failing. Check the RPCs, the payer balance and the light client.
- `header-unsupported`: no set of signatures fits one update, so the light client will expire. Escalate.
- `consensus-prune-failed`, `proof-buffer-close-failed`: rent recovery failed and is retried later. Check the RPC if it persists.

Also watch the light client's age, which is the time since its latest verified Akash header. The relayer stops at expiry with `light client expired`, and recovery needs governance.

---

## Related Resources

- [Akash Sink Services](/docs/node-operators/akash-sink) - How relayers and reporters fit together
- [Run an Akash Sink Reporter](/docs/node-operators/akash-sink/reporter)
- [Akash Sink](/docs/learn/akash-sink) - How transfers work for users
