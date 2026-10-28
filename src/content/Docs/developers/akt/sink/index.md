---
categories: ["Developers", "akt CLI"]
tags: ["akt", "CLI", "Akash Sink", "Solana", "AKT"]
weight: 4
title: "Send AKT to Solana"
linkTitle: "AKT to Solana"
description: "Send AKT from Akash to Solana with akt tx sink deposit, follow transfers and refunds, and run the reporter, guardian and governance sink commands"
---

**Send AKT to Solana and follow each transfer from the command line.**

`akt tx sink` and `akt query sink` cover the [Akash Sink](/docs/learn/akash-sink) module: deposits, transfer status, refunds, totals, and the commands that reporters, the pause guardian and governance use. A deposit locks AKT on Akash, and the same amount is minted to a Solana wallet. Transfers are one way.

The sink commands need akt version TBD at launch or later, from [GitHub Releases](https://github.com/akash-network/akt/releases) or [Homebrew](/docs/developers/akt/installation). Run `akt tx sink --help` to check your binary.

---

## Before You Start

- A context with a keyring signing account. See [Contexts & Configuration](/docs/developers/akt/configuration).
- AKT for the transfer, plus the network fee.
- A Solana wallet address you control. Use the wallet address itself, not a token account.

Check that deposits are enabled and read the current limits:

```bash
akt query sink params
```

`Deposits` reads `Enabled` while transfers are open. `Min Transfer` and `Max Transfer` bound each deposit. `Deposits Per Account Per Day`, `Open Transfers Per Account` and `Max Amount Per Account Per Day` are the per-account limits.

---

## Send AKT to Solana

```bash
# 10 AKT to a Solana wallet
akt tx sink deposit <solana-address> 10akt

# The same amount in uakt
akt tx sink deposit <solana-address> 10000000uakt
```

The amount is an exact AKT decimal (`2.5akt`) or a whole number of `uakt` (`2500000uakt`). akt rejects zero, fractional `uakt`, other denominations and malformed Solana addresses before it sends anything. It never rounds an amount.

A successful deposit means Akash recorded the transfer and locked the AKT. The mint on Solana follows, usually within a few minutes.

The output includes the transfer's record ID, the ledger ID the portal shows, once the transaction is in a block. By default (`--broadcast-mode sync`) akt returns before that. To wait for the block and see the ID right away, use `--broadcast-mode block`:

```bash
akt tx sink deposit <solana-address> 10akt --broadcast-mode block
```

Or look the ID up later from the transaction hash:

```bash
akt query tx <tx-hash> -o json \
  | jq -r '.events[] | select(.type == "sink_deposit") | .attributes[] | select(.key == "transfer_id") | .value'
```

**Note:** A deposit must be the only message in its transaction and must be signed by the depositing account. Akash rejects deposits sent through authz, a contract or a transaction with other messages.

---

## Follow a Transfer

```bash
akt query sink record <id>
```

The `Sink Transfer` section shows the public status:

| Status           | Meaning                                                             |
| ---------------- | ------------------------------------------------------------------- |
| Transfer pending | The AKT is locked. The Solana mint isn't confirmed yet.             |
| Completed        | Reporters confirmed the mint on Solana.                             |
| Void             | Voided. The settlement shows whether the refund is waiting or paid. |

Below it, `Transfer` shows the sender, recipient, amount and height. `Settlement` shows the detailed status (`Pending`, `Minted`, `Voided` or `Refunded`), any hold, the reporter votes and the end of the challenge window. A `Veto` or `Conflict` hold means the transfer waits for governance; see [Governance Actions](#governance-actions).

`akt query sink transfer <id>` prints the transfer and its settlement without the public status. Add `-o json` to either command for scripts.

---

## Check Account Limits

```bash
# The context's default account
akt query sink account

# Another account
akt query sink account akash1abc...
```

The output shows the deposits and AKT sent on the account's last deposit day (UTC), and how many of its transfers are still open. These are the counters the per-account limits check.

---

## Refunds

When a transfer is voided, its AKT is refunded to the sender after a challenge window of at least 72 hours. Reporters pay refunds automatically. Anyone can also send the refund transaction and pay its fee:

```bash
akt tx sink finalize-refund <id>
```

The refund always goes to the original sender, for the recorded amount. Akash refuses it while the challenge window is open, while the transfer is held, while refunds are paused or once the day's refund limit is used up.

Refunds are paid in order: earliest challenge end first, then lowest ID. A refund waits while an older one is unpaid. `akt query sink open-transfers` lists voided transfers with their challenge end.

---

## Network Totals and Open Transfers

```bash
# Locked AKT by bucket, refund counters, the reporter epoch and the parameters
akt query sink state

# Transfers not yet minted or refunded, 50 per page
akt query sink open-transfers --limit 50

# The next page; the output prints the --start-after value
akt query sink open-transfers --start-after 1200

# Only transfers held for governance
akt query sink open-transfers --held-only
```

`Open Transfers` in `state` counts every transfer not yet minted or refunded, including voided transfers waiting for their refund.

---

## Reporter Commands

Reporters are the accounts in the sink parameters' reporter set. Each one checks transfer results on its own Solana node and votes on Akash.

```bash
# Vote that transfer 12 was minted, with the finalized slot and signature of the Solana transaction
akt tx sink report-outcome 12 minted 412345678 <solana-signature> --from reporter

# Stop the refund of a void that doesn't match Solana, during the challenge window
akt tx sink veto-void 12 "status account shows a mint at slot 412345678" --from reporter
```

To run the reporter service that sends these automatically, see [Run an Akash Sink Reporter](/docs/node-operators/akash-sink/reporter).

`report-outcome` reads the current reporter epoch and the transfer's round from the chain before signing. Use `--reporter-epoch` and `--round` to set them yourself. The signature is the base58 signature of the Solana transaction that minted or voided the transfer. Veto reasons are 1 to 256 bytes.

---

## Pause Guardian

The pause guardian named in the sink parameters can switch deposits, refunds or both off:

```bash
akt tx sink guardian-pause deposits --from guardian
akt tx sink guardian-pause refunds --from guardian
akt tx sink guardian-pause all --from guardian
```

The guardian can only switch things off. A governance proposal turns them back on.

---

## Governance Actions

Each `propose-*` command submits a governance proposal that carries one sink message, with the governance module as its authority. Your account signs and pays the deposit.

```bash
# Change parameters: save the current values, edit the file, then propose it
akt query sink params -o json > sink-params.json
akt tx sink propose-params sink-params.json --deposit 50000000uakt

# Order a transfer voided, for a transfer that can't be minted
akt tx sink propose-void 12 --deposit 50000000uakt

# Veto a void at any time before its refund is paid
akt tx sink propose-veto 12 "void evidence does not match Solana"

# Let reporters vote again on a held transfer
akt tx sink propose-resolve 12 restart "reporters disagreed after an RPC outage"

# Confirm a Solana void, with the slot and signature of the void
akt tx sink propose-resolve 12 confirm-void "recipient was a token account" 412345678 <solana-signature>
```

`propose-resolve` takes one of three decisions:

- `restart`: clears the votes and the hold, so reporters vote again. Takes no slot or signature.
- `confirm-mint`: closes the transfer as minted. Needs the slot and signature of the Solana mint.
- `confirm-void`: confirms the Solana void. Needs the slot and signature of the void. A new challenge window starts, and the refund still follows the refund switch and the daily limit.

A transfer that is already minted or refunded can't change. `propose-params` replaces every parameter, so always start from the current values; akt checks the file before it broadcasts.

**Flags:**

- `--title`, `--summary` - Proposal text (defaults describe the action)
- `--deposit` - Initial proposal deposit
- `--expedite` - Submit an expedited proposal
- `--authority` - Message authority (default: the governance module account)

---

## Troubleshooting

Errors from a deposit, with their cause and fix:

- `Solana address must be canonical base58 of 32 bytes` - The address is mistyped or isn't a Solana address. Copy it from the wallet's receive screen.
- `Solana recipient must be a canonical on-curve key or an allowlisted vault` - The address can't belong to a wallet, for example an associated token account. Use the wallet address.
- `sink deposits disabled` - Deposits are paused. Check `Deposits` in `akt query sink params`.
- `sink amount ... is below the minimum transfer` - Send at least `Min Transfer`.
- `sink per-transfer limit` - The amount is above `Max Transfer`.
- `sink account limit` - The account reached its deposits for the UTC day, or has too many open transfers. Check `akt query sink account`.
- `sink amount ... exceeds the account's remaining daily amount` - The account's AKT per day limit doesn't cover this amount. Send less, or wait for the next UTC day.
- `sink sender must be an ordinary signing account` - The sender is a module account or a contract. Send from a regular account.
- `sink requires a sole top-level MsgSink` - The deposit was sent with other messages, through authz or from a contract. Send it on its own.

A transfer that stays `Transfer pending` keeps its AKT locked on Akash until it's minted or refunded. Transfers wait when the daily mint limit is reached and mint once it resets. Don't send the deposit again.

---

## Related Resources

- [Akash Sink](/docs/learn/akash-sink) - How transfers, statuses, limits and refunds work
- [Use the Akash Sink Portal](/docs/learn/akash-sink/portal) - The same transfer from the web app
- [Queries & Transactions](/docs/developers/akt/queries-and-transactions) - Shared transaction flags and output formats
- [Commands Reference](/docs/developers/akt/commands-reference#sink-akt-to-solana) - Command summary
