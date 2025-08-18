---
aep: 75
title: "Multi-depositor escrow account"
author: Artur Troian (@troian)
status: Draft
type: Standard
category: Core
created: 2025-08-18
updated: 2025-08-18
estimated-completion: 2025-08-30
roadmap: major
---

## Abstract

This AEP proposes enhancement of the `x/escrow` module with support of multiple funds depositors

## Motivation

The current deployment and escrow workflows are limited to using a single depositor for funds, which creates several significant limitations for users and automation workflows:

### Current Limitations

1. **Immutable Depositor Constraint**:
   - If a deployment owner has multiple spend authorizations from different wallets, only one can be used during the entire lifetime of the deployment
   - The depositor is immutable once set, preventing flexibility in fund management

2. **Inefficient Fund Utilization**:
   - Users cannot combine multiple smaller grants to meet larger deposit requirements
   - Example: An owner with two separate grants (0.2 uAKT and 0.3 uAKT) cannot use them together to create a deployment requiring 0.5 uAKT initial deposit
   - This forces users to maintain larger individual grants or miss deployment opportunities

3. **Unnecessary Complexity in Authorization**:
   - Users must explicitly specify the depositor address when using authorization (authz) for deposits
   - This requirement is redundant since grants can be automatically fetched from the chain state during transaction execution
   - Adds unnecessary complexity to the user experience and automation workflows

### Benefits of Multi-Depositor Support

Implementing multi-depositor escrow accounts would provide:
- **Flexible Fund Management**: Ability to use multiple funding sources for a single deployment
- **Improved Efficiency**: Better utilization of available grants and funds
- **Simplified User Experience**: Reduced complexity in authorization workflows
- **Enhanced Automation**: More flexible automation capabilities for deployment management


## Technical Details

1. Introduce new enum `DepositSource`
```proto
// DepositSource is an enum which lists source of funds for deployment deposit.
enum DepositSource {
  option (gogoproto.goproto_enum_prefix) = false;

  // Prefix should start with 0 in enum. So declaring dummy state.
  invalid = 0 [(gogoproto.enumvalue_customname) = "DepositSourceInvalid"];
  // DepositSourceBalance denotes account balance as source of funds
  balance = 1 [(gogoproto.enumvalue_customname)  = "DepositSourceBalance"];
  // DepositSourceGrant denotes authz grants as source of funds
  grant = 2 [(gogoproto.enumvalue_customname)  = "DepositSourceGrant"];
}
```
2. Replace `depositor` field with `deposit_sources` in `MsgCreateDeployment` and `MsgDepositDeployment`
```
// MsgCreateDeployment defines an SDK message for creating deployment.
message MsgCreateDeployment {
  option (gogoproto.equal)      = false;

  // ID is the unique identifier of the deployment.
  akash.deployment.v1.DeploymentID id = 1 [
    (gogoproto.nullable)   = false,
    (gogoproto.customname) = "ID",
    (gogoproto.jsontag)    = "id",
    (gogoproto.moretags)   = "yaml:\"id\""
  ];

  // GroupSpec is a list of group specifications for the deployment.
  // This field is required and must be a list of GroupSpec.
  repeated GroupSpec groups = 2 [
    (gogoproto.nullable)     = false,
    (gogoproto.castrepeated) = "GroupSpecs",
    (gogoproto.jsontag)      = "groups",
    (gogoproto.moretags)     = "yaml:\"groups\""
  ];

  // Hash of the deployment.
  bytes hash = 3 [
    (gogoproto.jsontag)  = "hash",
    (gogoproto.moretags) = "yaml:\"hash\""
  ];

  // Deposit specifies the amount of coins to include in the deployment's first deposit.
  cosmos.base.v1beta1.Coin deposit = 4 [
    (gogoproto.nullable) = false,
    (gogoproto.moretags) = "yaml:\"deposit\""
  ];

  repeated akash.deployment.v1.DepositSource deposit_sources = 5 [
    (gogoproto.jsontag)  = "deposit_sources",
    (gogoproto.moretags) = "yaml:\"deposit_sources\""
  ];
}

// MsgDepositDeployment represents a message to deposit funds into an existing deployment
// on the blockchain. This is part of the interaction mechanism for managing
// deployment-related resources.
message MsgDepositDeployment {
  option (gogoproto.equal) = false;

  // ID is the unique identifier of the deployment.
  DeploymentID id = 1 [
    (gogoproto.nullable)   = false,
    (gogoproto.customname) = "ID",
    (gogoproto.jsontag)    = "id",
    (gogoproto.moretags)   = "yaml:\"id\""
  ];

  // Amount defines the funds to deposit into the deployment.
  // It is specified as a coin amount (denomination and value).
  cosmos.base.v1beta1.Coin amount = 2 [
    (gogoproto.nullable) = false,
    (gogoproto.jsontag)  = "amount",
    (gogoproto.moretags) = "yaml:\"amount\""
  ];

  repeated DepositSource deposit_sources = 3 [
    (gogoproto.jsontag)  = "deposit_sources",
    (gogoproto.moretags) = "yaml:\"deposit_sources\""
  ];
}
```

### Implementation Guidelines

#### Deposit sources

`DepositSources` array within both messages must:
- contain at least one valid deposit source
- must not contain duplicates
- must preserve order of the sources

#### x/deployment

Following requirements apply for both `MsgCreateDeployment` and `MsgDepositDeployment`.

On message receive:
1. Process deposit autorizations in the order they are specified in the message
  - deduct funds from source up to the `deposit` value
  - if deposit amount not satisfied, try next source until either
    - deposit amount is satisfies - transaction is successul
    - total amount available via all sources is below requested deposit amount - transaction fails
2. Build list of depositor addresses and amounts to be deducted and transfer list to the `escrow.AccountCreate` or `escrow.AccountDeposit`

#### x/escrow

Following requirements apply for both `AccountCreate` and `AccountDeposit`.

1. Order of deposits must be preserved
2. Each if deposit from same address already exists, then funds shall be combined

##### Account settlement

Balance settlemnt proceeds in the order of deposits have been received

#### x/authz

Implement secondary index for efficient search of available grants by grantee address and msgTypeUrl.
The prefix of the index is defined as:
```go
var GranteeMsgKey = []byte{0x04} // reverse prefix to get grantee's grants by msgTypeUrl
```

The `Keeper` interface should be extended with following:
```go
type Keeper interface {
  GetGranteeGrantsByMsgType(ctx context.Context, grantee sdk.AccAddress, msgType string, onGrant func(context.Context, sdk.AccAddress, authz.Authorization, *time.Time) bool)
}
```

## Copyright

All content herein is licensed under [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0).
