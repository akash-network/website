---
categories: ["Network Fetures"]
tags: []
weight: 1
title: "Authorized Spend"
linkTitle: "Authorized Spend"
---

Authorized Spend allows users to authorize spend of a set number of tokens from a source wallet to a destination, funded wallet.  The authorized spend is restricted to Akash deployment activities and  the recipient of the tokens would not have access to those tokens for other operations. This allows large teams to work on deployments together without using large shared wallets, thereby reducing security concerns.

* [Relevant Commands and Example Use](#relevant-commands-and-example-use)


## Relevant Commands and Example Use

### Authorize Another Wallet to Deploy Using Your Tokens

#### **Description**

Authorize a “deploy wallet” to receive a specified amount of funds from a “funding wallet”

The command must be executed from a machine that has access to the funding wallet’s private key (I.e. access to private-key in local key-chain).

NOTE - two wallets will be necessary to test Authorized Spend.

#### **Syntax**

* Replace wallet placeholders with actual addresses
* Ensure that `uakt` is used as denomination for the `fund-amount` and as shown in `Example Use`.

```
provider-services tx deployment authz grant <deploy-wallet> <fund-amount> --from <funding-wallet>
```

#### Example Use

```
provider-services tx deployment authz grant akash17ck7uhkpjjj45fw9s9vpv7jn0m97958vjjxmf8 20000000uakt --from akash10x24jqyplwk37nynqy0pqaez5sx9fqrll59hl9
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
provider-services query authz grants akash10x24jqyplwk37nynqy0pqaez5sx9fqrll59hl9 akash17ck7uhkpjjj45fw9s9vpv7jn0m97958vjjxmf8
```

#### **Expected Output**

```
root@ip-10-0-10-95:/home/ubuntu# akash query authz grants akash10x24jqyplwk37nynqy0pqaez5sx9fqrll59hl9 akash17ck7uhkpjjj45fw9s9vpv7jn0m97958vjjxmf8

grants:
- authorization:
    '@type': /akash.deployment.v1beta2.DepositDeploymentAuthorization
    spend_limit:
      amount: "20000000"
      denom: uakt
  expiration: "2023-01-20T16:04:02Z"
pagination:
  next_key: null
  total: "0"
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
provider-services query authz granter-grants akash10x24jqyplwk37nynqy0pqaez5sx9fqrll59hl9
```

### Change Amount of Authorized Funds

#### **Description**

To change the amount of an authorized funds

#### **Syntax**

```
provider-services tx deployment authz grant <deploy-wallet> <fund-amount> --from <funding-wallet> --gas-prices="0.0025uakt" --gas="auto" --gas-adjustment=1.5 -y
```

#### **Example Use**

```
provider-services tx deployment authz grant akash17ck7uhkpjjj45fw9s9vpv7jn0m97958vjjxmf8 10000000uakt --from akash10x24jqyplwk37nynqy0pqaez5sx9fqrll59hl9 --gas-prices="0.0025uakt" --gas="auto" --gas-adjustment=1.5 -y
```

### Create a Deployment from Authorized Funds

#### **Description**

Use the funds from the authorizers wallet to create a deployment. Please note that the deployment wallet needs some minimal, additional AKT to cover gas costs.

NOTE - only the creation deployment step is covered in this section.  Please refer to our [Deployments Overview](/docs/deployments/overview/) documentation for additional steps in creating a deployment.

#### **Syntax**

```
provider-services tx deployment create --depositor-account <funding-wallet> --from <deploy-wallet> deploy.yaml --gas-prices="0.0025uakt" --gas="auto" --gas-adjustment=1.5 -y 
```

#### **Example Use**

```
provider-services tx deployment create --depositor-account akash10x24jqyplwk37nynqy0pqaez5sx9fqrll59hl9 --from akash17ck7uhkpjjj45fw9s9vpv7jn0m97958vjjxmf8 deploy.yaml --gas-prices="0.0025uakt" --gas="auto" --gas-adjustment=1.5 -y
```

### **Deposit Additional Funds to Deployment**

#### **Description**

Deposit additional funds into the escrow account of a running deployment from the funding wallet

#### **Syntax**

```
provider-services tx deployment deposit <fund-amount> --dseq <deployment-id> --from <deploy-wallet> -–depositor-account <funding-wallet> --gas-prices="0.0025uakt" --gas="auto" --gas-adjustment=1.5 -y
```

#### **Example Use**

```
provider-services tx deployment deposit 10000000uakt --dseq 19012 --from akash17ck7uhkpjjj45fw9s9vpv7jn0m97958vjjxmf8 --depositor-account akash10x24jqyplwk37nynqy0pqaez5sx9fqrll59hl9 --gas-prices="0.0025uakt" --gas="auto" --gas-adjustment=1.5 -y
```

### Revoke Access to a Deploy Wallet

#### **Description**

Revoke the authorization from a funding wallet

#### **Syntax**

```
provider-services tx deployment authz revoke <deploy-wallet> --from <funding-wallet>
```

#### **Example Use**

```
provider-services tx deployment authz revoke akash17ck7uhkpjjj45fw9s9vpv7jn0m97958vjjxmf8 --from akash10x24jqyplwk37nynqy0pqaez5sx9fqrll59hl9
```