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

There are two ways to send a transfer:

- **[The Akash Sink portal](/docs/learn/akash-sink/portal)**: a web app. Connect Keplr, enter a Solana address and an amount, then confirm.
- **[The akt CLI](/docs/developers/akt/sink)**: run `akt tx sink deposit` from the command line.

---

## How a Transfer Works

1. **You deposit AKT on Akash.** The deposit names a Solana wallet address. The Akash `sink` module locks the AKT and writes a permanent record of the transfer: its ledger ID, sender, recipient and amount.
2. **The record is proven on Solana.** A relayer submits Akash block headers and a proof of the record to Solana. The AKT program on Solana checks the proof against its Akash light client. A relayer can delay a transfer, but it can't change a record or create one.
3. **Solana mints the AKT.** The program mints exactly the recorded amount to the recorded address.
4. **Reporters settle the transfer on Akash.** Independent reporters check the result on Solana and vote on Akash. The transfer is settled once enough votes agree. Governance sets that threshold, and it must be more than two thirds of the reporters.

Most transfers finish within a few minutes. You don't need to do anything after the deposit, and closing the portal doesn't stop a transfer.

Each transfer has a **ledger ID**, a number Akash assigns in order. The akt CLI calls it the record ID. Use it to look up the transfer in the portal or on the command line.

If Solana can't deliver to the address, the transfer is voided and the AKT is refunded on Akash. See [Refunds](#refunds).

---

## Statuses

Akash keeps one of three public statuses for every transfer. The portal splits these into smaller steps; see [Statuses in the portal](/docs/learn/akash-sink/portal#statuses).

| Status           | Meaning                                                                                  |
| ---------------- | ---------------------------------------------------------------------------------------- |
| Transfer pending | The AKT is locked on Akash. The Solana mint isn't confirmed yet.                         |
| Completed        | Reporters confirmed the mint on Solana.                                                  |
| Void             | The transfer was voided. The AKT is refunded after the challenge window, or already was. |

---

## Limits

Akash governance sets the transfer limits and can change them.

| Limit               | What it covers                                       |
| ------------------- | ---------------------------------------------------- |
| Minimum and maximum | The smallest and largest single transfer.            |
| Transfers per day   | Deposits one Akash account can make in a UTC day.    |
| Open transfers      | Unfinished transfers one account can have at once.   |
| AKT per day         | AKT one account can deposit in a UTC day, if set.    |
| Daily mint limit    | AKT minted on Solana in a UTC day, across all users. |

A transfer stays open until it's minted or refunded. A deposit that breaks a per-transfer or per-account limit fails, and the AKT stays in your wallet. If the transaction was already sent, its network fee isn't returned.

The daily mint limit works differently. Akash still accepts deposits when the limit is reached, and those transfers mint on a later UTC day, once the limit resets.

The portal shows the current minimum and maximum next to the amount. From the command line, `akt query sink params` shows every limit, and `akt query sink account` shows your account's daily usage and open transfers.

---

## Fees

- You pay the Akash network fee for the deposit, in AKT.
- There is no transfer fee. Solana mints the full amount you deposit.
- You don't need SOL to receive AKT. You need SOL only to move AKT on Solana afterwards.

---

## Refunds

Solana voids a transfer when it can't deliver to the address, for example because the address belongs to a program or a token account instead of a wallet. Akash governance can also void a transfer that can't be minted. A voided transfer is refunded in three steps:

1. Reporters confirm the void on Akash.
2. A challenge window of at least 72 hours starts. During the window, a reporter or Akash governance can stop the refund if the void doesn't match Solana.
3. After the window, the refund is paid to the Akash account that made the deposit. Reporters pay refunds automatically, and anyone can trigger one with `akt tx sink finalize-refund`.

The refund returns the full deposited amount. The Akash network fee for the deposit isn't returned.

Refunds are paid oldest first, up to a daily refund limit. A refund can take longer when older refunds are waiting or the day's limit is used up.

---

## Safety

- **Check the address.** AKT is minted to exactly the address you enter, and a completed transfer can't be reversed. Send to a Solana wallet address you control, not a token account.
- **Your Solana wallet doesn't sign.** You sign one transaction: the deposit on Akash. Connecting a Solana wallet in the portal only reads its address.
- **Deposits and refunds can be paused.** A pause guardian chosen by governance can turn deposits, refunds or both off. Only governance can turn them back on. AKT from transfers you already made stays locked on Akash until it's minted or refunded.
- **Governance controls the settings.** The limits, the reporter set, the vote threshold and the pause guardian are Akash governance parameters. Anyone can read them with `akt query sink params`.

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

Akash refuses text that isn't a valid Solana address and addresses that can't belong to a wallet, such as associated token accounts. Other addresses that can't hold AKT as a wallet, such as programs, are voided on Solana and refunded.

### What if I sent AKT to the wrong wallet?

If the address is a valid wallet, the AKT is minted there and Akash Sink can't recover it. Only transfers that Solana can't deliver are refunded.

### What happens to my transfer during a pause?

A pause stops new deposits, refunds or both. AKT from transfers you already made stays locked on Akash until the transfer is minted or refunded.

### How do I find a transfer?

In the portal, connect the Keplr account that sent it, or track it by ledger ID or Akash transaction hash. On the command line, run `akt query sink record <ledger-id>`.

---

## For Developers

Akash REST endpoints serve the `sink` queries:

| Query                       | REST path                                           |
| --------------------------- | --------------------------------------------------- |
| Public status of a transfer | `/akash/sink/v1/records/{id}`                       |
| Transfer and settlement     | `/akash/sink/v1/transfers/{id}`                     |
| Account usage               | `/akash/sink/v1/accounts/{address}`                 |
| Open transfers              | `/akash/sink/v1/open_transfers?start_after=&limit=` |
| Totals and parameters       | `/akash/sink/v1/state`                              |

Every deposit emits a `sink_deposit` event with the `transfer_id`, `sender`, `amount` in `uakt`, `recipient` and `height`. The ledger ID is also in the transaction's `MsgSinkResponse`.

A deposit must be the only message in its transaction and must be signed by the depositing account. Akash rejects deposits sent through authz, a smart contract or a transaction with other messages.

---

## Related Resources

- [Use the Akash Sink Portal](/docs/learn/akash-sink/portal) - Send a transfer with Keplr
- [Send AKT to Solana with akt](/docs/developers/akt/sink) - Command-line transfers and module commands
- [Akash Sink Services](/docs/node-operators/akash-sink) - Run a relayer or reporter
- [Queries & Transactions](/docs/developers/akt/queries-and-transactions) - Other akt chain commands
