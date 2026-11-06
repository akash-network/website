---
categories: ["Learn"]
tags: ["Akash Sink", "AKT", "Solana", "Transfers"]
weight: 2
title: "Akash Sink: AKT on Solana"
linkTitle: "Akash Sink"
description: "How Akash Sink moves AKT from Akash to Solana: one-way transfers, statuses, limits, fees and refunds"
---

**Akash Sink moves AKT from Akash to Solana.** You lock AKT on Akash, and the same amount of AKT is minted to a Solana wallet you choose.

Transfers are one way. AKT that arrives on Solana can't be sent back to Akash through Akash Sink.

Sink remains pre-release. Use a matching test deployment until the production release and addresses are announced. The CLI examples track the [pending akt update](/docs/developers/akt/sink).

There are two ways to send a transfer:

- **[The Akash Sink portal](/docs/learn/akash-sink/portal)**: a web app. Connect Keplr, enter a Solana address and an amount, then confirm.
- **[The akt CLI](/docs/developers/akt/sink)**: run `akt tx sink deposit` from the command line.

---

## How a Transfer Works

1. **You deposit AKT on Akash.** The deposit names a Solana wallet address. The Akash `sink` module locks the AKT and writes a permanent record of the transfer: its ledger ID, sender, recipient and amount.
2. **The record is proven on Solana.** A relayer submits Akash block headers and a proof of the record to Solana. The AKT program on Solana checks the proof against its Akash light client. A relayer can delay a transfer, but it can't change a record or create one.
3. **Solana mints the AKT.** The program mints exactly the recorded amount to the recorded address.
4. **Reporters settle the transfer on Akash.** Independent reporters check the result on Solana and vote on Akash. The transfer is settled once enough votes agree. Governance sets a decimal threshold. The required vote count is the reporter count multiplied by that threshold, rounded up, and must exceed two thirds of the reporters.

Most transfers finish within a few minutes. You don't need to do anything after the deposit, and closing the portal doesn't stop a transfer.

Each transfer has a **ledger ID** in the form `owner/height/sequence`: the Akash sender, creating block and position within that block. Keep the full ID to look up the transfer in the portal or on the command line.

If Solana cannot deliver to the address, it records a permanent void. The AKT then follows the refund process on Akash. See [Refunds](#refunds).

---

## Statuses

Akash keeps the financial outcome separate from any dispute. The portal also verifies the finalized Solana outcome; see [Statuses in the portal](/docs/learn/akash-sink/portal#statuses).

| Status           | Meaning                                                                                |
| ---------------- | -------------------------------------------------------------------------------------- |
| Transfer pending | AKT is locked on Akash; the outcome is not yet confirmed.                              |
| Minted           | Reporters or governance confirmed the Solana mint. Backing stays locked.               |
| Void requested   | Governance requested a void. Solana has not confirmed it, and no refund has been paid. |
| Refund pending   | A Solana void is confirmed, but the sender has not been repaid.                        |
| Refunded         | The original sender received the refund on Akash.                                      |

A veto or conflict hold requires review. Even a minted or refunded transfer can have an unresolved conflict; the hold does not erase what has already happened.

---

## Limits

Akash governance sets the transfer limits and can change them.

| Limit                  | What it covers                                               |
| ---------------------- | ------------------------------------------------------------ |
| Minimum and maximum    | The smallest and largest single deposit.                     |
| Account epoch amount   | AKT one Akash account can deposit during a quota period.     |
| Aggregate epoch amount | AKT all accounts together can deposit during a quota period. |
| Solana mint amounts    | Independent per-transfer and daily mint caps on Solana.      |
| Refund epoch amount    | AKT that can be repaid on Akash during a quota period.       |

The account cap may be zero to disable that limit. The other caps remain positive, and the aggregate cap still applies. There are no per-account deposit-count or open-transfer-count limits. Deposits that exceed an enabled sending cap fail; the amount stays in the sender's wallet, though a submitted transaction can still incur a network fee.

Akash uses its existing epochs module to track quota periods. The selected `day` schedule has a configurable duration and start time in epochs genesis. Allowances reset when that schedule advances, rather than at midnight UTC. A refund does not restore the sender's sending allowance.

Solana mints can happen as soon as a deposit proof is available. They do not wait for the Akash quota period to end. If Solana's independent daily cap is exhausted, affected mints wait for its next UTC day.

The portal shows transfer bounds and epoch caps. `akt query sink params` shows configuration; `akt query sink state` shows the current epoch and global usage; `akt query sink account <owner>` shows the account's lifetime and current-epoch sending amounts.

---

## Fees

- You pay the Akash network fee for the deposit, in AKT.
- There is no transfer fee. Solana mints the full amount you deposit.
- You don't need SOL to receive AKT. You need SOL only to move AKT on Solana afterwards.

---

## Refunds

Solana voids a transfer when it can't deliver to the address, for example because the address belongs to a program or a token account instead of a wallet. Akash governance can also order a void. The order must be proven on Solana; it does not authorize a refund by itself. The refund process has three steps:

1. Reporters confirm the void on Akash.
2. A challenge window of at least 72 hours starts. During the window, a reporter or Akash governance can stop the refund if the void doesn't match Solana.
3. After the window, an eligible refund can be paid to the original sender. Reporters submit refunds automatically, and anyone can submit `akt tx sink finalize-refund <owner/height/sequence>`.

The refund returns the full deposited amount. The Akash network fee for the deposit isn't returned.

The challenge window is a configurable duration measured from authorization. Crossing a quota boundary does not shorten it. Payment also needs current authorization, no hold, enabled refunds, queue priority and room under the epoch refund cap. A deadline passing does not prove payment. `Refunded` means the money has actually returned.

---

## Safety

- **Check the address.** AKT is minted to exactly the address you enter, and a completed transfer can't be reversed. Send to a Solana wallet address you control, not a token account.
- **Your Solana wallet doesn't sign.** You sign one transaction: the deposit on Akash. Connecting a Solana wallet in the portal only reads its address.
- **Deposits and refunds can be paused.** A pause guardian chosen by governance can turn deposits, refunds or both off. Only governance can turn them back on. AKT from transfers you already made stays locked on Akash until it's minted or refunded.
- **Governance controls the settings.** The limits, the reporter set, the vote threshold and the pause guardian are Akash governance parameters. Read settings with `akt query sink params` and the active policy with `akt query sink reporters`. These commands require the [pending Sink CLI update](/docs/developers/akt/sink).

---

## Verify AKT on Solana

AKT on Solana is an SPL token with six decimals, like AKT on Akash, so one base unit equals one `uakt`. Its token name is `Akash Network` and its symbol is `AKT`.

Other tokens can copy the name and symbol. Check the mint address before you accept or buy AKT on Solana.

| Item                           | Value                                                                     |
| ------------------------------ | ------------------------------------------------------------------------- |
| Akash Sink portal              | TBD at launch                                                             |
| AKT mint on Solana             | TBD at launch                                                             |
| Akash Sink portal source       | [akash-network/sink-portal](https://github.com/akash-network/sink-portal) |
| `sink` module account on Akash | `akash1r9ut4ukp207nhumr8uaykyh6v7p9qlwxmcf48p`                            |

The `sink` module account holds all locked AKT. Akash only releases AKT from it as a refund.

---

## FAQ

### Can I move AKT from Solana back to Akash?

No. Akash Sink only moves AKT from Akash to Solana.

### Which Solana addresses can receive AKT?

A wallet address: the address your Solana wallet shows when you receive tokens. Phantom, Solflare, Backpack and hardware wallets all work, and so does a new address that has never been used.

Akash checks the address format and its configured recipient policy. Solana checks the actual account when resolving the transfer. A token account or other ineligible account can therefore pass the native address check and still be voided on Solana. Send to your wallet address, not its token account.

### What if I sent AKT to the wrong wallet?

If the address is a valid wallet, the AKT is minted there and Akash Sink can't recover it. Only transfers that Solana can't deliver are refunded.

### What happens to my transfer during a pause?

A pause stops new deposits, refunds or both. AKT from transfers you already made stays locked on Akash until the transfer is minted or refunded.

### How do I find a transfer?

In the portal, connect the Keplr account that sent it, or track it by ledger ID or Akash transaction hash. On the command line, run `akt query sink transfer <owner/height/sequence>`.

---

## For Developers

Akash REST endpoints serve the `sink` queries:

| Query                                              | REST path                                                       |
| -------------------------------------------------- | --------------------------------------------------------------- |
| Complete transfer                                  | `/akash/sink/v1/transfers/{id.owner}/{id.height}/{id.sequence}` |
| Transfers, optionally filtered by owner and status | `/akash/sink/v1/transfers?owner=&status=&pagination.limit=`     |
| All held transfers, including paid conflicts       | `/akash/sink/v1/disputes`                                       |
| Account usage                                      | `/akash/sink/v1/accounts/{owner}`                               |
| Totals, epoch usage, and refund candidate          | `/akash/sink/v1/state`                                          |
| Parameters                                         | `/akash/sink/v1/params`                                         |
| Current reporter policy                            | `/akash/sink/v1/reporters`                                      |

Continue list queries with the returned `pagination.next_key`. Treat the key as opaque and keep the same filters, direction, and `x-cosmos-block-height` across a pass. A pruned height must fail the pass. Do not enumerate numeric IDs or treat an exhausted snapshot cursor as a permanent subscription to future transfers.

`MsgSinkResponse` carries the full typed ID. The typed `EventTransferCreated` event is supplementary; owner queries and ID lookups do not depend on a transaction event index. The transfer response exposes one explicit financial status and a separate hold, without a second public-status mapping.

A deposit must be the only message in its transaction and must be signed by the depositing account. Akash rejects deposits sent through authz, a smart contract or a transaction with other messages.

---

## Related Resources

- [Use the Akash Sink Portal](/docs/learn/akash-sink/portal) - Send a transfer with Keplr
- [Send AKT to Solana with akt](/docs/developers/akt/sink) - Command-line transfers and module commands
- [Akash Sink Services](/docs/node-operators/akash-sink) - Run a relayer or reporter
- [Queries & Transactions](/docs/developers/akt/queries-and-transactions) - Other akt chain commands
