---
aep: 75
title: "Multi-depositor escrow account"
author: Artur Troian (@troian)
status: Final
type: Standard
category: Core
created: 2025-08-18
updated: 2025-09-02
estimated-completion: 2025-08-30
roadmap: major
---

## Abstract

This AEP proposes enhancement of the `x/escrow` module with support of multiple funds depositors, enabling flexible fund management and improved automation workflows for deployment operations.

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

## Key Changes

This AEP introduces several fundamental changes to the escrow system:

### 1. **New Deposit Type Structure**
- Introduces `akash.base.deposit.v1.Deposit` message type
- Supports multiple funding sources (balance, grants) in a single deposit
- Enables flexible fund allocation strategies

### 2. **Enhanced Message Types**
- Updates `MsgCreateDeployment` and `MsgCreateBid` to use new deposit structure
- Replaces single depositor model with multi-source deposit capability
- Maintains backward compatibility through structured message format

### 3. **New Escrow Operations**
- Adds `MsgAccountDeposit` for additional deposits to existing accounts
- Introduces `DepositAuthorization` for granular access control
- Supports both deployment and bid-level escrow operations

### 4. **Improved Authorization System**
- Implements secondary indexing for efficient grant lookups
- Supports multiple authorization scopes (deployment, bid)
- Enables more sophisticated permission management

## Technical Details

1. Introduce new type `Deposit` in a new package `akash.base.deposit.v1`
```proto
// Source is an enum which lists source of funds for deployment deposit.
enum Source {
  option (gogoproto.goproto_enum_prefix) = false;

  // Prefix should start with 0 in enum. So declaring dummy state.
  invalid = 0 [(gogoproto.enumvalue_customname) = "SourceInvalid"];
  // DepositSourceBalance denotes account balance as source of funds
  balance = 1 [(gogoproto.enumvalue_customname)  = "SourceBalance"];
  // DepositSourceGrant denotes authz grants as source of funds
  grant = 2 [(gogoproto.enumvalue_customname)  = "SourceGrant"];
}

// Deposit is a data type use by MsgCreateDeployment, MsgDepositDeployment and MsgCreateBid to indicate source of the deposit
message Deposit {
  // Deposit specifies the amount of coins to include in the deployment's first deposit.
  cosmos.base.v1beta1.Coin amount = 1 [
    (gogoproto.nullable) = false,
    (gogoproto.moretags) = "yaml:\"amount\""
  ];

  // Sources list of deposit sources, each entry must be unique
  repeated Source sources = 5 [
    (gogoproto.castrepeated) = "Sources",
    (gogoproto.jsontag)      = "deposit_sources",
    (gogoproto.moretags)     = "yaml:\"deposit_sources\""
  ];
}

```
2. In `MsgCreateDeployment` and `MsgCreateBid` replace `deposit` and `depositor` fields and replace with `deposit` of type `Deposit`
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
  akash.base.deposit.v1.Deposit deposit = 4 [
    (gogoproto.nullable) = false,
    (gogoproto.jsontag)  = "deposit",
    (gogoproto.moretags) = "yaml:\"deposit\""
  ];
}

// MsgCreateBid defines an SDK message for creating Bid.
message MsgCreateBid {
  option (gogoproto.equal)      = false;

  akash.market.v1.BidID id = 1 [
    (gogoproto.customname) = "ID",
    (gogoproto.nullable)   = false,
    (gogoproto.jsontag)    = "id",
    (gogoproto.moretags)   = "yaml:\"id\""
  ];

  // Price holds the pricing stated on the Bid.
  cosmos.base.v1beta1.DecCoin price = 2 [
    (gogoproto.nullable) = false,
    (gogoproto.jsontag)  = "price",
    (gogoproto.moretags) = "yaml:\"price\""
  ];

  // Deposit holds the amount of coins to deposit.
  akash.base.deposit.v1.Deposit deposit = 3 [
    (gogoproto.nullable) = false,
    (gogoproto.jsontag)  = "deposit",
    (gogoproto.moretags) = "yaml:\"deposit\""
  ];

  // ResourceOffer is a list of resource offers.
  repeated ResourceOffer resources_offer = 4 [
    (gogoproto.nullable)     = false,
    (gogoproto.castrepeated) = "ResourcesOffer",
    (gogoproto.customname)   = "ResourcesOffer",
    (gogoproto.jsontag)      = "resources_offer",
    (gogoproto.moretags)     = "yaml:\"resources_offer\""
  ];
}
```

3. Remove `MsgDepositDeployment` and `DeploymentDepositAuthorization` from `deployment` module

4. Introduce `MsgAccountDeposit` in escrow module
```proto
// MsgAccountDeposit represents a message to deposit funds into an existing escrow account
// on the blockchain. This is part of the interaction mechanism for managing
// deployment-related resources.
message MsgAccountDeposit {
  option (gogoproto.equal) = false;
  option (cosmos.msg.v1.signer) = "owner";

  // Owner is the account bech32 address of the user who owns the deployment.
  // It is a string representing a valid bech32 account address.
  //
  // Example:
  //   "akash1..."
  string owner = 1 [
    (cosmos_proto.scalar) = "cosmos.AddressString",
    (gogoproto.jsontag)   = "owner",
    (gogoproto.moretags)  = "yaml:\"owner\""
  ];

  // ID is the unique identifier of the account.
  akash.escrow.id.v1.Account id = 2 [
    (gogoproto.nullable)   = false,
    (gogoproto.customname) = "ID",
    (gogoproto.jsontag)    = "id",
    (gogoproto.moretags)   = "yaml:\"id\""
  ];

  akash.base.deposit.v1.Deposit deposit = 3 [
    (gogoproto.nullable) = false,
    (gogoproto.jsontag)  = "deposit",
    (gogoproto.moretags) = "yaml:\"deposit\""
  ];
}
```

5. Introduce `DepositAuthorization` in `escrow` module
```proto
// DepositAuthorization allows the grantee to deposit up to spend_limit coins from
// the granter's account for a deployment.
message DepositAuthorization {
  option (cosmos_proto.message_added_in)     = "chain-sdk v0.1.0";
  option (cosmos_proto.implements_interface) = "cosmos.authz.v1beta1.Authorization";
  option (amino.name)                        = "akash/DepositAuthorization";

  // State is an enum which refers to state of deployment.
  enum Scope {
    option (gogoproto.goproto_enum_prefix) = false;

    // Prefix should start with 0 in enum. So declaring dummy state.
    invalid = 0 [(gogoproto.enumvalue_customname)     = "DepositScopeInvalid"];
    // DeploymentActive denotes state for deployment active.
    deployment = 1 [(gogoproto.enumvalue_customname)  = "DepositScopeDeployment"];
    // DeploymentClosed denotes state for deployment closed.
    bid = 2 [(gogoproto.enumvalue_customname)         = "DepositScopeBid"];
  }

  // SpendLimit is the amount the grantee is authorized to spend from the granter's account for
  // the purpose of deployment.
  cosmos.base.v1beta1.Coin spend_limit = 1 [
    (gogoproto.nullable) = false,
    (gogoproto.jsontag)  = "spend_limit"
  ];

  repeated Scope scopes = 2 [
    (gogoproto.castrepeated) = "DepositAuthorizationScopes",
    (gogoproto.jsontag)  = "scopes",
    (gogoproto.moretags) = "yaml:\"scopes\""
  ];
}
```

6. Introduce transaction message server in `escrow` module
```proto
// Msg defines the x/deployment Msg service.
service Msg {
  option (cosmos.msg.v1.service) = true;

  // AccountDeposit deposits more funds into the escrow account.
  rpc AccountDeposit(MsgAccountDeposit) returns (MsgAccountDepositResponse);
}
```

### AccountDeposit Functionality

The `AccountDeposit` operation allows users to add additional funds to existing escrow accounts, supporting multiple funding sources and flexible deposit strategies.

#### Workflow Overview

1. **Message Validation**:
   - Verify the account exists and belongs to the message signer
   - Validate deposit amount and sources
   - Check authorization permissions if using grants

2. **Fund Processing**:
   - Process each deposit source in the specified order
   - Deduct funds from balance or process authorization grants
   - Combine funds from multiple sources to meet the total deposit amount

3. **Account Update**:
   - Add new deposits to the escrow account
   - Preserve deposit order for settlement purposes
   - Update account balance and metadata

#### Implementation Details

##### Source Processing Order
The system processes deposit sources sequentially until the total deposit amount is satisfied:

1. **Sequential Processing**: Each source in the `sources` array is processed one by one in the specified order
2. **Amount Tracking**: The system maintains a running total of remaining amount needed
3. **Source Exhaustion**: When a source is fully utilized, the system moves to the next source
4. **Early Termination**: Processing stops as soon as the total deposit amount is reached
5. **Validation**: If all sources are exhausted and the amount is still not met, the transaction fails

##### Grant Authorization Processing
When processing authorization grants as a funding source:

1. **Grant Discovery**: The system queries all available grants for the account owner
2. **Permission Validation**: Each grant is checked for proper permissions and expiration
3. **Amount Calculation**: The system determines how much can be drawn from each grant
4. **Sequential Utilization**: Grants are used in order until the required amount is satisfied
5. **Fund Transfer**: Once approved, funds are deducted from the grant and transferred to escrow
6. **Record Keeping**: Each processed grant is recorded with its source and amount details

#### Error Handling

The `AccountDeposit` operation handles various error scenarios:

- **Insufficient Funds**: If the total available funds from all sources cannot meet the deposit amount
- **Invalid Account**: If the escrow account doesn't exist or doesn't belong to the signer
- **Authorization Failures**: If grant processing fails due to insufficient permissions or expired grants
- **Source Processing Errors**: If individual source processing encounters issues

#### Settlement Order

Deposits are processed and settled in the order they are received:

1. **First-in-First-out (FIFO)**: Earlier deposits are settled before later ones
2. **Source Preservation**: The order of sources within each deposit is maintained
3. **Combination Logic**: Multiple deposits from the same address are combined but maintain chronological order

#### Use Cases

1. **Escrow Top-up**: Add funds to prevent deployment termination
2. **Grant Utilization**: Use authorization grants for additional deposits
3. **Multi-source Funding**: Combine balance and grant funds for larger deposits
4. **Automated Replenishment**: Support automated systems for maintaining escrow balances

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
var GranteeMsgTypeUrlKey = []byte{0x04} // reverse prefix to get grantee's grants by msgTypeUrl
```

The `Keeper` interface should be extended with following:
```go
type Keeper interface {
  GetGranteeGrantsByMsgType(ctx context.Context, grantee sdk.AccAddress, msgType string, onGrant func(context.Context, sdk.AccAddress, authz.Authorization, *time.Time) bool)
}
```

## Implementation Resources

### Development Guidelines

#### Protobuf Message Structure
All new message types follow standard Cosmos SDK patterns:
- Use `gogoproto` annotations for consistent serialization
- Implement proper validation rules and constraints
- Maintain backward compatibility where possible

#### Authorization Implementation
The enhanced authorization system provides:
- Efficient grant lookup through secondary indexing
- Support for multiple authorization scopes
- Granular permission management for different operation types

#### Escrow Account Management
Multi-depositor escrow accounts support:
- Multiple funding sources per account
- Ordered deposit processing
- Automatic fund combination from same addresses
- Flexible settlement strategies

### Testing Considerations

1. **Unit Tests**: Test individual message validation and processing
2. **Integration Tests**: Verify escrow account creation and management flows
3. **Authorization Tests**: Validate grant processing and permission enforcement
4. **Performance Tests**: Ensure efficient grant lookup and processing

## Copyright

All content herein is licensed under [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0).
