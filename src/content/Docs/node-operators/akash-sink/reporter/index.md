---
categories: ["Node Operators", "Akash Sink"]
tags: ["Akash Sink", "Reporter", "Solana", "Validators"]
weight: 1
title: "Run an Akash Sink Reporter"
linkTitle: "Reporter"
description: "Run an Akash Sink reporter with your own Akash and Solana nodes and a key in a KMS or HSM: configuration, preview mode, joining the reporter set, and alerts"
---

A reporter reads the outcome of each Akash Sink transfer from its own Solana node and votes on Akash. When enough reporters agree, Akash closes the transfer as minted, or confirms a void and refunds the sender after the challenge window. A reporter also vetoes voids that don't match Solana, and pays refunds once they are due.

Reporters can never mint AKT. Read [Akash Sink Services](/docs/node-operators/akash-sink) first for how reporters fit in.

---

## Requirements

- **Akash node:** your own node on the Akash release that adds the `sink` module (TBD at launch), synced and not catching up. Default pruning works, since the reporter reads only the latest height.
- **Solana node:** your own non-voting RPC node on mainnet's Agave version, started with `--full-rpc-api --enable-rpc-transaction-history`.
- **Solana history:** at least the challenge period (72 hours or more) plus the longest reporter outage you plan to survive. Plan for 7 days or more.
- **Reporter account:** a new Akash account used only for reporting, with its key in a KMS or HSM. Never use a validator consensus key.
- **Funds:** AKT in the reporter account for transaction fees.
- **Runtime:** Node.js 24 and the Akash Sink services release (TBD at launch). Run it on its own host, not on your validator.

**Use your own nodes.** Finalized commitment doesn't protect against a dishonest RPC node, so reporters must not share nodes or rely on a public RPC provider. The vote threshold only means something if each reporter checks Solana independently.

For Solana node hardware, follow Anza's [RPC node requirements](https://docs.anza.xyz/operations/requirements).

---

## Install

Download the Akash Sink services release, which contains both the relayer and the reporter, and check it against its published checksum:

- Release: TBD at launch
- Checksum: TBD at launch
- Source: [akash-network/node `contracts/solana`](https://github.com/akash-network/node/tree/feat/sink-contracts/contracts/solana)

The release runs on Node.js 24. Run the commands on this page from the release directory.

---

## STEP 1: Prepare Your Nodes

Check that your Solana node is on mainnet. The reporter compares this value with its configuration on every pass:

```bash
solana --url http://127.0.0.1:8899 genesis-hash
```

**Expected output:**

```
5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d
```

Your Akash node must report chain ID `akashnet-2`, must not be catching up, and its latest block must be newer than `maxAgeSeconds` (see STEP 3).

---

## STEP 2: Set Up the Reporter Key

Broadcasting needs exactly one signer. Preview mode never loads a key.

### External signer

Keep the reporter key in a KMS, an HSM or a signing service, behind a command the reporter runs for each transaction. The command must be an absolute path. It runs without a shell, and the reporter writes one JSON object to its stdin:

```json
{
  "chainId": "akashnet-2",
  "accountNumber": "42",
  "sequence": "7",
  "address": "akash1...",
  "signDocBase64": "..."
}
```

`signDocBase64` holds the `SIGN_MODE_DIRECT` sign doc bytes. The command signs the SHA-256 of those bytes with secp256k1, prints one JSON object and exits 0:

```json
{
  "publicKeyBase64": "<33-byte compressed key>",
  "signatureBase64": "<64-byte r||s>"
}
```

The reporter checks the returned key and signature against the exact sign doc before it broadcasts. A timeout, a nonzero exit or a failed check stops that transaction, and nothing is sent.

The reporter only asks the signer to sign `MsgReportOutcome`, `MsgVetoVoid` and `MsgFinalizeRefund` from the reporter account on `akashnet-2`. Your signer can decode the sign doc and refuse anything else.

### Key file (testing only)

`--key-file PATH` reads an owner-only file containing the private key as 64 lowercase hex characters. Use it only for testing.

### Fund the account

Send AKT to the reporter account for transaction fees. An account that has never sent a transaction has no public key on chain yet, so set `publicKeyBase64` in the signer configuration.

---

## STEP 3: Configure

Create a configuration file outside the release directory, for example `/etc/akt-reporter/config.json`:

```json
{
  "akashRpc": "http://127.0.0.1:26657",
  "akashChainId": "akashnet-2",
  "solanaRpc": "http://127.0.0.1:8899",
  "solanaGenesisHash": "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d",
  "programId": "<AKT program, TBD at launch>",
  "mint": "<AKT mint, TBD at launch>",
  "reporter": "akash1...",
  "maxAgeSeconds": 60,
  "maxTransfers": 1000,
  "pollSeconds": 15,
  "feeAmountUakt": "12500",
  "gasLimit": "500000",
  "externalSigner": {
    "command": "/usr/local/bin/akt-sign",
    "args": ["--key", "reporter-1"],
    "timeoutSeconds": 10,
    "publicKeyBase64": "A..."
  }
}
```

| Field                | Meaning                                                 |
| -------------------- | ------------------------------------------------------- |
| `akashRpc`           | Your Akash node's CometBFT RPC, with no credentials     |
| `akashChainId`       | `akashnet-2`                                            |
| `solanaRpc`          | Your Solana node                                        |
| `solanaGenesisHash`  | The value from STEP 1                                   |
| `programId`, `mint`  | The AKT program and mint on Solana                      |
| `reporter`           | Your reporter account address                           |
| `lightClientProgram` | Optional pin; leave unset to follow changes (see below) |
| `maxAgeSeconds`      | Freshness bound for both nodes, at most 600             |
| `maxTransfers`       | Scan limit for nodes without the `OpenTransfers` query  |
| `pollSeconds`        | Delay between passes                                    |
| `feeAmountUakt`      | Fee per Akash transaction, at most 1 AKT                |
| `gasLimit`           | Gas per Akash transaction, at most 20,000,000           |
| `externalSigner`     | The signer command from STEP 2                          |

The reporter refuses credentials in `akashRpc`; put an authenticated endpoint behind a local proxy instead. Set `feeAmountUakt` high enough to cover the network's minimum gas price for `gasLimit`. `--signer-command PATH` on the command line replaces the configured signer command.

**Light client changes.** Governance can point the AKT program at a new light client. With `lightClientProgram` unset, the reporter follows the change and prints a `light-client-changed` alert. With it set, a change stops the reporter with `light-client-mismatch` until you update the configuration. Follow is the default for independent operators.

---

## STEP 4: Run in Preview Mode

Preview reads both chains and prints the decisions it would make, without loading a key or sending anything. Run these commands from the release directory:

```bash
# One pass
npm run reporter -- --config /etc/akt-reporter/config.json

# Continuously
npm run reporter -- --config /etc/akt-reporter/config.json --watch
```

Output is JSON lines: observations, proposed messages, alerts, errors and one summary per pass:

```json
{
  "scanned": 4,
  "audited": 100,
  "index": "open-transfers",
  "failures": 0,
  "lightClientProgram": "..."
}
```

Keep preview running for several days. Every pass should finish with `"failures":0` and no alerts.

---

## STEP 5: Join the Reporter Set

Share your reporter account address with the Akash community. A governance proposal adds it to the `reporters` parameter and sets a `reporter_threshold` above two thirds of the new set. Anyone can submit it:

```bash
akt query sink params -o json > sink-params.json
# Add the address to "reporters" and update "reporter_threshold", then:
akt tx sink propose-params sink-params.json --deposit <amount>uakt
```

After the proposal passes, check that your address is listed:

```bash
akt query sink params
```

---

## STEP 6: Start Broadcasting

```bash
npm run reporter -- --config /etc/akt-reporter/config.json --watch --broadcast
```

The configured external signer signs each transaction. Run the reporter under a supervisor such as systemd that always restarts it, and run only one signing process per reporter account to avoid sequence conflicts.

A rejected or timed-out transaction is logged, and the next pass rereads chain state. Ctrl-C stops after the current operation.

---

## Verify Operation

- Each pass summary shows `"failures":0` and `"index":"open-transfers"`.
- Your address appears in the votes of recent transfers:

```bash
akt query sink transfer <id>
```

- The reporter account keeps enough AKT for fees.

---

## Alerts

Route these to someone on call:

- `light-client-mismatch`: the light client changed away from your pin, and the reporter has stopped.
- `light-client-changed`: the light client changed. Review the governance proposal.
- `open-transfers-inconsistent`: your Akash node's listing disagrees with its own state.
- `Akash settlement contradicts finalized Solana outcome`: a possible false report or false confirmation.
- `Akash reports an outcome without a finalized Solana status`: a possible false void or mint quorum.
- `Akash reports a Solana slot beyond any plausible finalized slot`: a report carries a fabricated slot.
- `Transfer requires governance review`: a veto or conflict hold is waiting for governance.
- Repeated `error` lines: stale or misconfigured nodes, missing history or signer failures.
- `"index":"full-scan"`: your Akash node lacks the `OpenTransfers` query. Upgrade it.

Stale nodes, missing history, signer failures and RPC errors stop reporting. They never cause a veto or a refund on their own.

---

## Troubleshooting

### Every pass fails with a freshness error

**Cause:** One of your nodes is catching up, or its latest block is older than `maxAgeSeconds`.

**Solution:** Wait for the node to sync, or check its peers and disk. Raise `maxAgeSeconds` only if your nodes are healthy but slow, and keep it at or below 600.

### Observations fail with missing blocks

**Cause:** Your Solana node no longer has the block a transfer resolved in.

**Solution:** Increase history retention. Raising retention can't recover blocks already deleted, so keep at least 7 days from the start.

### Transactions fail before broadcast

**Cause:** The signer timed out, exited with an error, or returned a key that doesn't match `reporter`.

**Solution:** Run the signer by hand with a sample request, and check `publicKeyBase64` against the reporter account.

---

## Related Resources

- [Akash Sink Services](/docs/node-operators/akash-sink) - How relayers and reporters fit together
- [Run an Akash Sink Relayer](/docs/node-operators/akash-sink/relayer)
- [Send AKT to Solana with akt](/docs/developers/akt/sink) - Sink queries and the reporter commands in akt
