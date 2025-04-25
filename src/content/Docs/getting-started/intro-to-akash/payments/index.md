---
categories: ["Other Resources"]
tags: []
weight: 2
title: "Payments"
linkTitle: "Payments"
---

Leases are paid from deployment owner (tenant) to the provider through a [deposit](#bid-deposits) & withdraw mechanism.

### Bid Deposits

Tenants are required to submit a deposit when creating a deployment. Leases will be paid passively from the balance of this deposit. At any time, a lease provider may withdraw the balance owed to them from this deposit.

If the available funds in the deposit ever reaches zero, a provider may close the lease. A tenant can add funds to their deposit at any time. When a deployment is closed, the unspent portion of the balance will be returned to the tenant.

Bidding on an order requires a deposit to be made. The deposit will be returned to the provider account when the [bid](#bid-deposits) transitions to state `CLOSED`.

Bid deposits are implemented with an escrow account module. See [here](#escrow-accounts) for more information.

## Escrow Accounts

Escrow accounts are a mechanism that allow for time-based payments from one account to another without block-by-block micropayments. They also support holding funds for an account until an arbitrary event occurs.

Escrow accounts are necessary in akash for two primary reasons:

1.  Leases in Akash are priced in blocks - every new block, a payment

    from the tenant (deployment owner) to the provider (lease holder)

    is due. Performance and security considerations prohibit the

    naive approach of transferring tokens on every block.

2.  Bidding on an order should not be free (for various reasons, including performance and security). Akash requires a deposit for every bid. The deposit is returned to the bidder when the bid is closed.

Escrow [accounts](#escrow-accounts) are created with an arbitrary ID, an owner, and a balance. The balance is immediately transferred from the owner account to the escrow module [account](#escrow-accounts). [Accounts](#escrow-accounts) may have their balance increased by being deposited to after creation.

[Payments](#payment) represent transfers from the escrow account to another account. They are (currently) block-based - some amount is meant to be transferred for every block. The amount owed to the payment from the escrow [account](#escrow-accounts) is subtracted from the escrow [account](#escrow-accounts) balance through a settlement process.

[Payments](#payment) may be withdrawn from, which transfers any undisbursed balance from the module account to the payment owner's account.

When an [account](#escrow-accounts) or a [payment](#payment) is closed, any remaining balance will be transferred to their respective owner accounts.

If at any time the amount owed to [payments](#payment) is greater than the remaining balance of the [account](#escrow-accounts), the account and all payments are closed with state `OVERDRAWN`.

Many actions invoke the settlement process and may cause the account to become overdrawn.

**How are gas fees calculated on Akash?**

Akash uses the basic Cosmos gas calculations for all fees. Cosmos documentation on gas can be found [here](https://docs.cosmos.network/v0.53/learn/beginner/gas-fees).

## Account Settlement

Account settlement is the process of updating internal accounting of the balances of [payments](#payment) for an [account](#escrow-accounts) to the current height.

Many actions trigger the account settlement process - it ensures an up-to-date ledger when acting on the [account](#escrow-accounts).

Account settlement goes as follows:

1. Determine `blockRate` - the amount owed for every block.
2. Determine `heightDelta` - the number of blocks since last settlement.
3. Determine `numFullBlocks` - the number of blocks that can be paid for in full.
4. Transfer amount for `numFullBlocks` to [payments](#payment).
5. If `numFullBlocks` is less than `heightDelta` ([account](#escrow-accounts) overdrawn), then
   1. Distribute remaining balance among [payments](#payment), weighted by each [payment](#payment)'s `rate`
   2. Distribute any remaining balance from above as evenly as possible
   3. Set [account](#escrow-accounts) and [payments](#payment) to state `OVERDRAWN`.

## Models

### Account

| Field         | Description                                 |
| ------------- | ------------------------------------------- |
| `ID`          | Unique ID of account.                       |
| `Owner`       | Account address of owner.                   |
| `State`       | Account state.                              |
| `Balance`     | Amount deposited from owner account.        |
| `Transferred` | Amount disbursed from account via payments. |
| `SettledAt`   | Last block that payments were settled.      |

#### Account State

| Name        |
| ----------- |
| `OPEN`      |
| `CLOSED`    |
| `OVERDRAWN` |

### Payment

| Field       | Description                              |
| ----------- | ---------------------------------------- |
| `AccountID` | Escrow [`Account`](#escrow-accounts) ID. |
| `PaymentID` | Unique (over `AccountID`) ID of payment. |
| `Owner`     | Account address of owner.                |
| `State`     | Payment state.                           |
| `Rate`      | Tokens per block to transfer.            |
| `Balance`   | Balance currently reserved for owner.    |
| `Withdrawn` | Amount already withdrawn by owner.       |

#### Payment State

| Name        |
| ----------- |
| `OPEN`      |
| `CLOSED`    |
| `OVERDRAWN` |

## Methods

### `AccountCreate`

Create an escrow account. Funds are deposited from the owner account to the escrow module account.

#### Arguments

| Field     | Description                          |
| --------- | ------------------------------------ |
| `ID`      | Unique ID of account.                |
| `Owner`   | Account address of owner.            |
| `Deposit` | Amount deposited from owner account. |

### `AccountDeposit`

Add funds to an escrow account. Funds are transferred from the owner account to the escrow module account.

#### Arguments

| Field    | Description                          |
| -------- | ------------------------------------ |
| `ID`     | Unique ID of account.                |
| `Amount` | Amount deposited from owner account. |

### `AccountSettle`

Re-calculate remaining account and payment balances.

#### Arguments

| Field | Description           |
| ----- | --------------------- |
| `ID`  | Unique ID of account. |

### `AccountClose`

Close account - settle and close payments, return remaining account balance to owner account.

#### Arguments

| Field | Description           |
| ----- | --------------------- |
| `ID`  | Unique ID of account. |

### `PaymentCreate`

Create a new payment. The account will first be settled; this method will fail if the account cannot be settled.

#### Arguments

| Field       | Description                              |
| ----------- | ---------------------------------------- |
| `AccountID` | Escrow [`Account`](#escrow-accounts) ID. |
| `PaymentID` | Unique (over `AccountID`) ID of payment. |
| `Owner`     | Account address of owner.                |
| `Rate`      | Tokens per block to transfer.            |

#### Invariants

- Account is in state `OPEN` after being settled.
- `ID` is unique.
- `Owner` exists.
- `Rate` is non-zero and account has funds for one block.

### `PaymentWithdraw`

Withdraw funds from a payment balance. Account will first be settled.

#### Arguments

| Field       | Description                              |
| ----------- | ---------------------------------------- |
| `AccountID` | Escrow [`Account`](#escrow-accounts) ID. |
| `PaymentID` | Unique (over `AccountID`) ID of payment. |

### `PaymentClose`

Close a payment. Account will first be settled.

#### Arguments

| Field       | Description                              |
| ----------- | ---------------------------------------- |
| `AccountID` | Escrow [`Account`](#escrow-accounts) ID. |
| `PaymentID` | Unique (over `AccountID`) ID of payment. |

## Hooks

Hooks are callbacks that are registered by users of the escrow module that are to be called on specific events.

### `OnAccountClosed`

Whenever an account is closed `OnAccountClosed(Account)` will be called.

### `OnPaymentClosed`

Whenever a payment is closed, `OnAccountClosed(Account)` will be called.
