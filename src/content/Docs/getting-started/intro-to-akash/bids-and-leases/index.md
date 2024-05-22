---
categories: ["Getting Started"]
tags: []
title: "Bids and Leases"
linkTitle: "Bids and Leases"
weight: 3
---

## How does the Marketplace work?

The Akash Marketplace revolves around [Deployments](#deployment), which fully describe the resources that a tenant is requesting from the network. Deployments contain [Groups](#group), which is a grouping of resources that are meant to be leased together from a single provider.

Deploying applications onto [Akash](https://github.com/ovrclk/akash) involves two types of users:

1. The **Tenant**: the entity that deploys the application.
2. The **Provider**: the entity that hosts the application.

### What is a Reverse Auction?

Akash uses a reverse auction. Tenants set the price and terms of their deployment, and the Cloud providers bid on the deployments.

In a very simple reverse auction:

1. A tenant creates orders.
2. Providers bid on orders.
3. Tenants choose winning bids and create leases.

### Akash Deployment Lifecycle

The lifecycle of a typical application deployment is as follows:

1. The tenant creates a `.yml` file made up of [SDL](/docs/getting-started/stack-definition-language/) markup which describes the resources needed to run their application. This is known as a [deployment](#deployment).
2. The tenant submits that definition to the blockchain.
3. Their submission generates an [order](#order) on the marketplace.
4. Providers that would like to fulfill that order [bid](#bid) on it.
5. After some period of time, a winning [bid](#bid) for the [order](#order) is chosen, and a [lease](#lease) is created.
6. Once a [lease](#lease) has been created, the tenant submits a [manifest](/docs/getting-started/stack-definition-language/) to the provider.
7. The provider executes workloads as instructed by the [manifest](/docs/getting-started/stack-definition-language/).
8. The workload is running - if it is a web application it can be visited
9. The provider or tenant eventually closes the [lease](#lease), shutting down the workload.

## Payments

Leases are paid from deployment owner (tenant) to the provider through a deposit and withdraw mechanism.

Tenants are required to submit a deposit when creating a deployment. Leases will be paid passively from the balance of this deposit. At any time, a lease provider may withdraw the balance owed to them from this deposit.

If the available funds in the deposit ever reaches zero, a provider may close the lease, therefore a tenant who wishes to keep a lease alive must add funds to their deposit as this ensures that their lease does not end prematurely. When a deployment is closed, the unspent portion of the balance will be returned to the tenant.

### Escrow Accounts

[Escrow accounts](/docs/getting-started/intro-to-akash/payments/#escrow-accounts) are a mechanism that allows for time-based payments from one account to another without block-by-block micropayments. They also support holding funds for an account until an arbitrary event occurs.

Escrow accounts are necessary in Akash for two primary reasons:

1. Leases in Akash are priced in blocks - every new block, a payment from the tenant (deployment owner) to the provider (lease holder) is due. Performance and security considerations prohibit the naive approach of transferring tokens on every block.
2. Bidding on an order should not be free (for various reasons, including performance and security). Akash requires a deposit for every bid. The deposit is returned to the bidder when the bid is closed.

## Bid Deposits

Bidding on an order requires a deposit to be made. The deposit will be returned to the provider account when the [bid](#bid) transitions to state `CLOSED`.

Bid deposits are implemented with an escrow account module. See [here](/docs/getting-started/intro-to-akash/payments/#escrow-accounts) for more information.

## Audited Attributes

Audited attributes allow users deploying applications to be more selective about which providers can run their apps. Anyone on the Akash Network can assign these attributes to Providers via an on-chain transaction.

## On-Chain Parameters

| Name                   | Initial Value | Description                                        |
| ---------------------- | ------------- | -------------------------------------------------- |
| deployment_min_deposit | 0.5akt        | Minimum deposit to make deployments. Target: ~$2.2 |
| bid_min_deposit        | 0.5akt        | Deposit amount required to bid. Target: ~$2.2      |

## Transactions

### DeploymentCreate

Creates a [deployment](#deployment), and open [groups](#group) and [orders](#order) for it.

#### Parameters

| Name          | Description                                                  |
| ------------- | ------------------------------------------------------------ |
| DeploymentID  | ID of Deployment.                                            |
| DepositAmount | Deposit amount. Must be greater than deployment_min_deposit. |
| Version       | Hash of the manifest that is sent to the providers.          |
| Groups        | A list of [group](#group) descriptions.                      |

### DeploymentDeposit

Add funds to a deployment's balance.

#### Parameters

| Name          | Description                                                   |
| ------------- | ------------------------------------------------------------- |
| DeploymentID  | ID of Deployment.                                             |
| DepositAmount | Deposit amount. Must be greater than `deployment_min_deposit` |

### GroupClose

Closes a [group](#group) and any [orders](#order) for it. Sent by the tenant.

#### Parameters

| Name | Description  |
| ---- | ------------ |
| ID   | ID of Group. |

### GroupPause

Puts a `PAUSED` state, and closes any and [orders](#order) for it. Sent by the tenant.

#### Parameters

| Name | Description  |
| ---- | ------------ |
| ID   | ID of Group. |

### GroupStart

Transitions a [group](#group) from state `PAUSED` to state `OPEN`. Sent by the tenant.

#### Parameters

| Name | Description  |
| ---- | ------------ |
| ID   | ID of Group. |

### BidCreate

Sent by a provider to bid on an open [order](#order). The required deposit will be returned when the bid transitions to state `CLOSED`.

#### Parameters

| name    | description                                 |
| ------- | ------------------------------------------- |
| OrderID | ID of Order                                 |
| TTL     | Number of blocks this bid is valid for      |
| Deposit | Deposit amount. `bid_min_deposit` if empty. |

### BidClose

Sent by provider to close a bid or a lease from an existing bid.

When closing a lease, the bid's group will be put in state `PAUSED`.

#### Parameters

| name  | description |
| ----- | ----------- |
| BidID | ID of Bid   |

#### State Transitions

| Object | Previous State | New State |
| ------ | -------------- | --------- |
| Bid    | `ACTIVE`       | `CLOSED`  |
| Lease  | `ACTIVE`       | `CLOSED`  |
| Order  | `ACTIVE`       | `CLOSED`  |
| Group  | `OPEN`         | `PAUSED`  |

### LeaseCreate

Sent by tenant to create a lease.

1. Creates a `Lease` from the given [bid](#bid).
2. Sets all non-winning [bids](#bid) to state `CLOSED` (deposit returned).

#### Parameters

| name  | description                        |
| ----- | ---------------------------------- |
| BidID | [Bid](#bid) to create a lease from |

### MarketWithdraw

This withdraws balances earned by providing for leases and deposits of bids that have expired.

#### Parameters

| name  | description                        |
| ----- | ---------------------------------- |
| Owner | Provider ID to withdraw funds for. |

## Models

### Deployment

| Name     | Description                                                                         |
| -------- | ----------------------------------------------------------------------------------- |
| ID.Owner | account address of tenant                                                           |
| ID.DSeq  | Arbitrary sequence number that identifies the deployment. Defaults to block height. |
| State    | State of the deployment.                                                            |
| Version  | Hash of the manifest that is sent to the providers.                                 |

#### State

| Name   | Description                      |
| ------ | -------------------------------- |
| OPEN   | Orders may be created.           |
| CLOSED | All groups are closed. Terminal. |

### Group

| Name            | Description                                                         |
| --------------- | ------------------------------------------------------------------- |
| ID.DeploymentID | [Deployment](#deployment) ID of group.                              |
| ID.GSeq         | Arbitrary sequence number. Internally incremented, starting at `1`. |
| State           | State of the group.                                                 |

#### State

| Name   | Description                               |
| ------ | ----------------------------------------- |
| OPEN   | Has an open or active order.              |
| PAUSED | Bid closed by provider. May be restarted. |
| CLOSED | No open or active orders. Terminal.       |

### Order

| Name       | Description                                                         |
| ---------- | ------------------------------------------------------------------- |
| ID.GroupID | [Group](#group) ID of group.                                        |
| ID.OSeq    | Arbitrary sequence number. Internally incremented, starting at `1`. |
| State      | State of the order.                                                 |

#### State

| Name   | Description                                        |
| ------ | -------------------------------------------------- |
| OPEN   | Accepting bids.                                    |
| ACTIVE | Open lease has been created.                       |
| CLOSED | No active leases and not accepting bids. Terminal. |

### Bid

| Name        | Description                                                |
| ----------- | ---------------------------------------------------------- |
| ID.OrderID  | [Group](#group) ID of group.                               |
| ID.Provider | Account address of provider.                               |
| State       | State of the bid.                                          |
| EndsOn      | Height at which the bid ends if it is not already matched. |
| Price       | Bid price - amount to be paid on every block.              |

#### State

| Name   | Description                              |
| ------ | ---------------------------------------- |
| OPEN   | Awaiting matching.                       |
| ACTIVE | Bid for an active lease (winner).        |
| CLOSED | No active leases for this bid. Terminal. |

### Lease

| Name  | Description                                   |
| ----- | --------------------------------------------- |
| ID    | The same as the [bid](#bid) ID for the lease. |
| State | State of the bid.                             |

#### State

| Name   | Description                                              |
| ------ | -------------------------------------------------------- |
| ACTIVE | Active lease - tenant is paying provider on every block. |
| CLOSED | No payments being made. Terminal.                        |
