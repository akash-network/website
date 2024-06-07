---
categories: ["Network Fetures"]
tags: []
weight: 1
title: "Fee Grants"
linkTitle: "Fee Grants"
---

## Overview

Fee Grants allow the payment of transactions fees via a different account than the deployment account.  If used in conjunction with authorized spend, this allows a user to create and manage a deployment with no AKT deducted from their own wallet.

## Fee Grant Creation

The syntax to create a Fee Grant is as follows.

### Template

```
provider-services tx feegrant grant <granter-account> <grantee-account> --spend-limit <fee-amount-granted-in-uakt>
```

### Example Command Use

```
provider-services tx feegrant grant akash1vuh6y4nurr45ujexq8nu8tlscdkl44ha7zwsy4 akash1ujp4fy4xxvfrqe4zqv7w3kzktz8wz8h2msaq2u --spend-limit 1000000uakt
```

## Fee Grant Query

Query an existing Fee Grant as follows:

### Template

```
provider-services query feegrant grant <granter-account> <grantee-account>
```

### Example Command Use

```
provider-services query feegrant grant akash1vuh6y4nurr45ujexq8nu8tlscdkl44ha7zwsy4 akash1ujp4fy4xxvfrqe4zqv7w3kzktz8wz8h2msaq2u
```

### Example Output

```
provider-services query feegrant grant akash1vuh6y4nurr45ujexq8nu8tlscdkl44ha7zwsy4 akash1ujp4fy4xxvfrqe4zqv7w3kzktz8wz8h2msaq2u

allowance:
  '@type': /cosmos.feegrant.v1beta1.BasicAllowance
  expiration: null
  spend_limit:
  - amount: "1000000"
    denom: uakt
grantee: akash1ujp4fy4xxvfrqe4zqv7w3kzktz8wz8h2msaq2u
granter: akash1vuh6y4nurr45ujexq8nu8tlscdkl44ha7zwsy4
```

## Fee Grant Use

Once created a Fee Grant can be used on any transaction.  In this section we provide examples of using an existing Fee Grant for Akash deployment related transactions.

> Note that in these examples the use of the Fee Grant comes from the inclusion of the  `--fee-account` switch in the command.  Any transaction may use an available Fee Grant using this syntax.

### Fee Grant Example - Publish Cert

```
provider-services tx cert publish client --from $AKASH_KEY_NAME --fee-account akash1vuh6y4nurr45ujexq8nu8tlscdkl44ha7zwsy4
```

### Fee Grant Example - Create Deployment

```
provider-services tx deployment create deploy.yml --from $AKASH_KEY_NAME --fee-account akash1vuh6y4nurr45ujexq8nu8tlscdkl44ha7zwsy4
```