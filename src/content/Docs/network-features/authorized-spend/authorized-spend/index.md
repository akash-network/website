---
categories: ["Network Fetures"]
tags: []
weight: 1
title: "Authorized Spend"
linkTitle: "Authorized Spend"
---

Authorized Spend allows users to authorize spend of a set number of tokens from a source wallet to a destination, funded wallet. The authorized spend is restricted to Akash deployment activities and the recipient of the tokens would not have access to those tokens for other operations. This allows large teams to work on deployments together without using large shared wallets, thereby reducing security concerns.

* [Relevant Commands and Example Use](#relevant-commands-and-example-use)

## Relevant Commands and Example Use

### Authorize Another Wallet to Deploy Using Your Tokens

#### **Description**

Authorize a "deploy wallet" to receive a specified amount of funds from a "funding wallet". The authorization can be scoped to either deployment or bid operations.

The command must be executed from a machine that has access to the funding wallet's private key (i.e. access to private-key in local key-chain).

NOTE - two wallets will be necessary to test Authorized Spend.

#### **Syntax**

* Replace wallet placeholders with actual addresses
* Ensure that `uakt` is used as denomination for the `spend-limit` amount
* The `--scope` parameter can be set to `deployment` or `bid`

```
provider-services tx authz grant <deploy-wallet> deposit --spend-limit=<amount> --from <funding-wallet> --scope <deployment|bid>
```

#### Example Use

```
provider-services tx authz grant akash1fvj54cfq2nrv24k3h9hetzadkgw3falw3suyms deposit --from akash14ql2n74l3jnpzvas4puflstxyn2k9thzmf98g9 --spend-limit=10000000uakt --scope deployment
```

### View Authorization Created - Specific Deploy Wallet

#### **Description**

To view details for a specific deploy wallet authorization from a specified funding wallet.

#### **Syntax**

```
provider-services query authz grants <funding-wallet> <deploy-wallet>
```

#### **Example Use**

```
provider-services query authz grants akash14ql2n74l3jnpzvas4puflstxyn2k9thzmf98g9 akash1fvj54cfq2nrv24k3h9hetzadkgw3falw3suyms
```

#### **Expected Output**

```
grants:
- authorization:
    '@type': /akash.escrow.v1.AccountDepositAuthorization
    spend_limit:
      amount: "10000000"
      denom: uakt
    scope: deployment
  expiration: "2025-01-20T16:04:02Z"
pagination:
  next_key: null
  total: "1"
```

### View Authorizations Created - All Deploy Wallets

#### **Description**

To view ALL wallets authorized to spend from the funding wallet

#### **Syntax**

```
provider-services query authz granter-grants <funding-wallet-address>
```

#### **Example Use**

```
provider-services query authz granter-grants akash14ql2n74l3jnpzvas4puflstxyn2k9thzmf98g9
```

### Change Amount of Authorized Funds

#### **Description**

To change the amount of authorized funds, simply re-run the grant command with the new spend limit. This will update the existing authorization.

#### **Syntax**

```
provider-services tx authz grant <deploy-wallet> deposit --spend-limit=<amount> --from <funding-wallet> --scope <deployment|bid> --gas-prices="0.0025uakt" --gas="auto" --gas-adjustment=1.5 -y
```

#### **Example Use**

```
provider-services tx authz grant akash1fvj54cfq2nrv24k3h9hetzadkgw3falw3suyms deposit --from akash14ql2n74l3jnpzvas4puflstxyn2k9thzmf98g9 --spend-limit=20000000uakt --scope deployment --gas-prices="0.0025uakt" --gas="auto" --gas-adjustment=1.5 -y
```

### Create a Deployment from Authorized Funds

#### **Description**

Use the funds from the authorizer's wallet to create a deployment using the `--deposit-sources` flag. The deployment wallet needs some minimal, additional AKT to cover gas costs.

NOTE - only the deployment creation step is covered in this section. Please refer to our [Deployments Overview](/docs/deployments/overview/) documentation for additional steps in creating a deployment.

#### **Syntax**

```
provider-services tx deployment create <manifest> --from <deploy-wallet> --deposit-sources <sources>
```

#### **Deposit Source Options**

The `--deposit-sources` flag determines where deployment deposits are drawn from:

- `grant` - Deposit only from active grants. Fails if there are no active grants or if their total balance is insufficient.
- `balance` - Deposit only from owner's balance. Fails if the balance is insufficient.
- `grant,balance` - Attempt to deposit from grants first. If insufficient, the remainder is taken from the owner's balance.
- `balance,grant` - Attempt to deposit from owner's balance first. If insufficient, the remainder is taken from grants.

#### **Example Use**

Using only grant funds:
```
provider-services tx deployment create deploy.yml --from akash1fvj54cfq2nrv24k3h9hetzadkgw3falw3suyms --deposit-sources grant
```

Using only balance:
```
provider-services tx deployment create deploy.yml --from akash1fvj54cfq2nrv24k3h9hetzadkgw3falw3suyms --deposit-sources balance
```

Using grants first, then balance if needed:
```
provider-services tx deployment create deploy.yml --from akash1fvj54cfq2nrv24k3h9hetzadkgw3falw3suyms --deposit-sources grant,balance
```

Using balance first, then grants if needed:
```
provider-services tx deployment create deploy.yml --from akash1fvj54cfq2nrv24k3h9hetzadkgw3falw3suyms --deposit-sources balance,grant
```

### Deposit Additional Funds to Deployment

#### **Description**

Deposit additional funds into the escrow account of a running deployment. The `--deposit-sources` flag controls whether funds come from grants, owner balance, or both.

#### **Syntax**

```
provider-services tx escrow deposit deployment <fund-amount> --from <deploy-wallet> --deposit-sources <sources>
```

#### **Example Use**

Depositing from grant funds:
```
provider-services tx escrow deposit deployment 1000000uakt --from akash1fvj54cfq2nrv24k3h9hetzadkgw3falw3suyms --deposit-sources grant
```

Depositing from owner balance:
```
provider-services tx escrow deposit deployment 1000000uakt --from akash1fvj54cfq2nrv24k3h9hetzadkgw3falw3suyms --deposit-sources balance
```

Depositing from grants first, then balance:
```
provider-services tx escrow deposit deployment 1000000uakt --from akash1fvj54cfq2nrv24k3h9hetzadkgw3falw3suyms --deposit-sources grant,balance
```

### Revoke Access to a Deploy Wallet

#### **Description**

Revoke the authorization from a funding wallet. You must specify the message type being revoked.

#### **Syntax**

```
provider-services tx authz revoke <deploy-wallet> "/akash.escrow.v1.MsgAccountDeposit" --from <funding-wallet>
```

#### **Example Use**

```
provider-services tx authz revoke akash1fvj54cfq2nrv24k3h9hetzadkgw3falw3suyms "/akash.escrow.v1.MsgAccountDeposit" --from akash14ql2n74l3jnpzvas4puflstxyn2k9thzmf98g9
```