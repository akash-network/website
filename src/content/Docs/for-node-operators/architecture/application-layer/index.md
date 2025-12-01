---
categories: ["For Node Operators"]
tags: ["Architecture", "Application", "Cosmos SDK", "Modules"]
weight: 3
title: "Application Layer"
linkTitle: "Application Layer"
description: "Deep dive into the Akash application layer, Cosmos SDK modules, and Akash marketplace modules"
---

The Application Layer is where Akash's blockchain logic lives. Built on the Cosmos SDK, this layer implements all blockchain functionality including accounts, tokens, staking, governance, and Akash's unique marketplace features.

---

## Application Architecture

```
+---------------------------------------------------------------+
|                    Application Layer (ABCI)                   |
|                                                               |
|  +----------------------------------------------------------+ |
|  |                   AkashApp                               | |
|  |                                                          | |
|  |  +-----------------------+  +-----------------------+    | |
|  |  | Module Manager        |  | Keepers               |    | |
|  |  | - Register Modules    |  | - Cosmos Keepers      |    | |
|  |  | - Order Execution     |  | - Akash Keepers       |    | |
|  |  | - Genesis             |  | - State Access        |    | |
|  |  +-----------------------+  +-----------------------+    | |
|  |                                                          | |
|  |  +-----------------------+  +-----------------------+    | |
|  |  | Codec                 |  | Transaction Router    |    | |
|  |  | - Proto/Amino         |  | - Message Routing     |    | |
|  |  | - Serialization       |  | - Handler Dispatch    |    | |
|  |  +-----------------------+  +-----------------------+    | |
|  +----------------------------------------------------------+ |
|                            |                                  |
|                            | ABCI Interface                   |
|                            v                                  |
+---------------------------------------------------------------+
                             |
                    CometBFT Consensus
```

---

## ABCI Interface

The **Application Blockchain Interface (ABCI)** connects CometBFT consensus to the application logic.

### ABCI Methods

**Block Lifecycle:**

```
PreBlock → BeginBlock → [DeliverTx...] → EndBlock → Commit
```

**1. PreBlock**
```go
PreBlock(RequestPreBlock) → ResponsePreBlock
```
- Called before BeginBlock
- Used for upgrades and module initialization
- Introduced in Cosmos SDK v0.50

**2. BeginBlock**
```go
BeginBlock(RequestBeginBlock) → ResponseBeginBlock
```
- Called at block start
- Updates validator set
- Distributes block rewards
- Processes evidence

**3. DeliverTx**
```go
DeliverTx(RequestDeliverTx) → ResponseDeliverTx
```
- Called for each transaction in block
- Executes transaction logic
- Updates state
- Emits events
- Returns gas used

**4. EndBlock**
```go
EndBlock(RequestEndBlock) → ResponseEndBlock
```
- Called at block end
- Module end-block logic
- Validator set updates
- Returns validator changes

**5. Commit**
```go
Commit() → ResponseCommit
```
- Persists state to disk
- Computes app hash (state root)
- Returns app hash to CometBFT

### Additional ABCI Methods

**CheckTx** - Validate transaction before mempool
```go
CheckTx(RequestCheckTx) → ResponseCheckTx
```

**Query** - Query application state
```go
Query(RequestQuery) → ResponseQuery
```

**InitChain** - Initialize chain from genesis
```go
InitChain(RequestInitChain) → ResponseInitChain
```

---

## Module System

Akash uses a modular architecture where each module handles specific functionality.

### Module Structure

Each module contains:
- **Keeper** - State access and business logic
- **Messages** - User-initiated state changes
- **Queries** - Read-only state access  
- **Genesis** - Initial state
- **Events** - Notifications of state changes

```
Module
├── keeper/
│   ├── keeper.go       # State access
│   ├── msg_server.go   # Message handlers
│   └── query.go        # Query handlers
├── types/
│   ├── msgs.go         # Message definitions
│   ├── genesis.go      # Genesis state
│   └── events.go       # Event types
└── module.go           # Module interface
```

---

## Cosmos SDK Modules

Standard modules from Cosmos SDK that provide core blockchain functionality.

### Auth Module

**Purpose:** Account authentication and signature verification

**Key Features:**
- Account management (BaseAccount, ModuleAccount)
- Signature verification
- Account sequences (nonce)
- Public key storage

**Account Types:**
```go
BaseAccount          // Standard user account
ModuleAccount        // Module-owned account
VestingAccount       // Time-locked tokens
```

**Key Functions:**
- `GetAccount(addr) → Account`
- `SetAccount(account)`
- `NewAccountWithAddress(addr) → Account`

---

### Bank Module

**Purpose:** Token transfers and balance management

**Key Features:**
- Send tokens between accounts
- Track balances per denom
- Supply tracking
- Module-to-module transfers

**Message Types:**
```protobuf
MsgSend              // Send tokens to address
MsgMultiSend         // Send to multiple addresses
```

**Queries:**
```protobuf
QueryBalance         // Get account balance
QueryAllBalances     // Get all denoms
QuerySupply          // Get total supply
```

**Example:**
```bash
# Query balance
akash query bank balances akash1abc...

# Send tokens
akash tx bank send <from> <to> 1000000uakt
```

---

### Staking Module

**Purpose:** Proof-of-Stake consensus and delegation

**Key Features:**
- Validator registration
- Delegation/undelegation
- Rewards distribution
- Slashing for misbehavior

**Validator States:**
```
Unbonded → Unbonding → Bonded
```

**Message Types:**
```protobuf
MsgCreateValidator   // Register as validator
MsgEditValidator     // Update validator info
MsgDelegate          // Delegate to validator
MsgUndelegate        // Undelegate from validator
MsgBeginRedelegate   // Move delegation
```

**Parameters:**
```go
UnbondingTime: 336h         // 2 weeks
MaxValidators: 100          // Top 100 by stake
MaxEntries: 7               // Max unbonding ops
HistoricalEntries: 10000    // Historical info kept
MinCommissionRate: 0.05     // 5% minimum
```

---

### Distribution Module

**Purpose:** Fee distribution to validators and delegators

**Key Features:**
- Block reward distribution
- Transaction fee distribution
- Commission for validators
- Community pool management

**Distribution Flow:**
```
Block Rewards + Fees
  → Validator Commission (5-20%)
  → Delegator Rewards (proportional)
  → Community Pool (if tax > 0%)
```

**Message Types:**
```protobuf
MsgWithdrawDelegatorReward      // Claim rewards
MsgWithdrawValidatorCommission  // Claim commission
MsgFundCommunityPool            // Donate to pool
```

**Parameters:**
```go
CommunityTax: 0                 // 0% to community pool
WithdrawAddrEnabled: true       // Allow changing withdraw address
```

---

### Governance Module

**Purpose:** On-chain governance and proposals

**Key Features:**
- Submit proposals
- Vote on proposals
- Tally votes
- Execute approved proposals

**Proposal Types:**
- **Text Proposal** - Signal/coordination
- **Parameter Change** - Update chain parameters
- **Software Upgrade** - Coordinate upgrades
- **Community Pool Spend** - Spend from pool

**Voting Options:**
```
Yes, No, Abstain, NoWithVeto
```

**Parameters:**
```go
MinDeposit: 2500000000uakt      // 2,500 AKT
MaxDepositPeriod: 336h          // 2 weeks
VotingPeriod: 72h               // 3 days
Quorum: 0.2                     // 20% must vote
Threshold: 0.5                  // 50% yes to pass
VetoThreshold: 0.334            // 33.4% veto fails
```

**Lifecycle:**
```
Proposal Submitted
  → Deposit Period (2 weeks)
     → Voting Period (3 days)
        → Tally
           → Pass/Reject/Veto
```

---

### Slashing Module

**Purpose:** Penalize validator misbehavior

**Slashing Conditions:**

**1. Downtime:**
- Miss 50%+ blocks in window
- Penalty: 0.01% slash
- Jailed (can unjail)

**2. Double-Signing:**
- Sign two blocks at same height
- Penalty: 5% slash
- **Permanently tombstoned**

**Parameters:**
```go
SignedBlocksWindow: 30000       // ~41 hours
MinSignedPerWindow: 0.5         // Must sign 50%+
DowntimeJailDuration: 600s      // 10 min jail
SlashFractionDoubleSign: 0.05   // 5%
SlashFractionDowntime: 0.0001   // 0.01%
```

---

### Mint Module

**Purpose:** Token inflation

**Inflation Model:**
```
Target: 7-20% APR (adjusts based on bonding ratio)
Target Bonding Ratio: 67%
```

**Inflation adjusts:**
- **High bonding** → Lower inflation
- **Low bonding** → Higher inflation

**Block Rewards:**
```
Reward = (Inflation × TotalSupply) / BlocksPerYear
```

---

### IBC Module

**Purpose:** Inter-Blockchain Communication

**Key Features:**
- Cross-chain token transfers
- Cross-chain contract calls
- Light client verification
- Channel/connection management

**Transfer Flow:**
```
Source Chain
  → Lock Tokens
     → Relay Packet
        → Target Chain
           → Mint IBC Tokens
```

---

## Akash Marketplace Modules

Akash-specific modules that implement decentralized cloud marketplace.

### Deployment Module

**Purpose:** Workload deployments on Akash

**Location:** `x/deployment`

**Key Entities:**

**Deployment:**
```protobuf
message Deployment {
  DeploymentID id = 1;
  DeploymentState state = 2;
  bytes version = 3;
  int64 created_at = 4;
}
```

**States:**
```
Active → Closed
```

**Message Types:**
```protobuf
MsgCreateDeployment   // Create new deployment
MsgUpdateDeployment   // Update (new manifest version)
MsgCloseDeployment    // Close deployment
```

**Lifecycle:**
```
Create Deployment (with SDL)
  → Order Created (in Market module)
     → Bids Received
        → Lease Created
           → Deployment Active
              → Close Deployment
                 → Lease Closed
```

---

### Market Module

**Purpose:** Order book and lease management

**Location:** `x/market`

**Key Entities:**

**Order:**
- Created automatically from deployment
- Contains resource requirements
- Triggers bid matching

**Bid:**
- Provider's offer to fulfill order
- Includes pricing
- Must match all requirements

**Lease:**
- Accepted bid
- Active workload placement
- Escrow payment handling

**Message Types:**
```protobuf
MsgCreateBid      // Provider bids on order
MsgCloseBid       // Close bid
MsgWithdrawLease  // End lease early
MsgCloseLease     // Close lease
```

**State Flow:**
```
Order (Open)
  ↓
Bids Received
  ↓
Lease Created (Order → Matched)
  ↓
Lease Active
  ↓
Lease Closed
```

---

### Provider Module

**Purpose:** Provider registration and attributes

**Location:** `x/provider`

**Provider Entity:**
```protobuf
message Provider {
  string owner = 1;
  string host_uri = 2;
  repeated Attribute attributes = 3;
  ProviderInfo info = 4;
}
```

**Attributes:**
Providers advertise capabilities:
```yaml
- key: region
  value: us-west

- key: tier
  value: community

- key: hardware-cpu
  value: amd

- key: hardware-gpu
  value: nvidia-a100
```

**Message Types:**
```protobuf
MsgCreateProvider   // Register provider
MsgUpdateProvider   // Update attributes
MsgDeleteProvider   // Deregister provider
```

---

### Escrow Module

**Purpose:** Payment escrow for leases

**Location:** `x/escrow`

**How It Works:**

```
Deployment Created
  ↓
Escrow Account Created
  ↓
Tenant Deposits Funds
  ↓
Lease Created
  ↓
Funds Locked in Escrow
  ↓
Block-by-Block Payment
  ↓
Provider Withdraws Earnings
  ↓
Lease Closed → Refund Balance
```

**Account Types:**
```
DeploymentAccount    // Per deployment
LeaseAccount         // Per lease
```

**Settlement:**
- Payments calculated per block
- Provider can withdraw anytime
- Tenant can top up escrow
- Refund on lease close

---

### Audit Module

**Purpose:** Provider auditing and attestations

**Location:** `x/audit`

**Auditor Attributes:**
Auditors sign provider attributes:
```yaml
auditor: akash1auditor...
provider: akash1provider...
attributes:
  - key: tier
    value: community
  - key: uptime
    value: 99.9
```

**Message Types:**
```protobuf
MsgSignProviderAttributes    // Auditor signs
MsgDeleteProviderAttributes  // Remove attestation
```

---

### Certificate Module

**Purpose:** TLS certificate management for mTLS

**Location:** `x/cert`

**Purpose:**
- Secure deployment communication
- Mutual TLS between tenant and provider
- On-chain certificate storage

**Message Types:**
```protobuf
MsgCreateCertificate   // Publish certificate
MsgRevokeCertificate   // Revoke certificate
```

---

### Take Module

**Purpose:** Network income distribution

**Location:** `x/take`

**Take Parameters:**
```go
DefaultTakeRate: 0.0          // 0% network fee
DenomTakeRates: map[denom]rate
```

**Purpose:**
- Collect fees from marketplace
- Fund community pool
- Sustainable network economics

---

## State Management

### IAVL Tree

State stored in **Immutable AVL (IAVL) tree**:

**Features:**
- Balanced binary search tree
- Immutable (versioned)
- Merkle proofs
- O(log n) operations

**Store Structure:**
```
Root (AppHash)
├── auth/
│   ├── accounts/
│   └── params/
├── bank/
│   ├── balances/
│   └── supply/
├── staking/
│   ├── validators/
│   └── delegations/
├── deployment/
│   ├── deployments/
│   └── groups/
├── market/
│   ├── orders/
│   ├── bids/
│   └── leases/
└── ...
```

### KVStore Operations

**Basic operations:**
```go
// Get value
value := store.Get(key)

// Set value
store.Set(key, value)

// Delete value
store.Delete(key)

// Iterate range
iterator := store.Iterator(start, end)
```

### State Queries

**Query examples:**
```bash
# Query deployment
akash query deployment get \
  --owner akash1abc... \
  --dseq 123

# Query market lease
akash query market lease get \
  --owner akash1abc... \
  --dseq 123 \
  --provider akash1provider...

# Query provider
akash query provider get akash1provider...
```

---

## Transaction Processing

### Transaction Structure

```protobuf
message Tx {
  TxBody body = 1;
  AuthInfo auth_info = 2;
  repeated bytes signatures = 3;
}

message TxBody {
  repeated google.protobuf.Any messages = 1;
  string memo = 2;
  int64 timeout_height = 3;
}
```

### Processing Flow

```
Transaction Received
  ↓
Decode Transaction
  ↓
Verify Signatures (AnteHandler)
  ↓
Check Account Sequence
  ↓
Deduct Fees
  ↓
Route Messages to Modules
  ↓
Execute Message Handlers
  ↓
Update State
  ↓
Emit Events
  ↓
Return Response
```

### AnteHandler

Runs before message execution:

**Checks:**
1. Signature verification
2. Account exists
3. Sequence number valid
4. Sufficient balance for fees
5. Gas limit valid
6. Memo size limit

**Gas deduction:**
```
TotalGas = sum(message.Gas) + SignatureGas + TxSizeGas
```

---

## Module Execution Order

### BeginBlock Order

```go
[]string{
  upgradetypes.ModuleName,      // upgrades
  minttypes.ModuleName,          // inflation
  distrtypes.ModuleName,         // distribute rewards
  slashingtypes.ModuleName,      // slash validators
  evidencetypes.ModuleName,      // process evidence
  stakingtypes.ModuleName,       // update validators
  ibchost.ModuleName,            // IBC
  authtypes.ModuleName,          // auth
  banktypes.ModuleName,          // bank
  govtypes.ModuleName,           // gov
  escrow.ModuleName,             // escrow payments
  deployment.ModuleName,         // deployments
  market.ModuleName,             // market
  provider.ModuleName,           // providers
  audit.ModuleName,              // audits
  cert.ModuleName,               // certificates
  take.ModuleName,               // take
}
```

### EndBlock Order

Similar order for end-block processing.

---

## Genesis State

### Genesis File Structure

```json
{
  "genesis_time": "2021-06-18T17:00:00Z",
  "chain_id": "akashnet-2",
  "initial_height": "1",
  "consensus_params": {...},
  "app_state": {
    "auth": {...},
    "bank": {...},
    "staking": {...},
    "deployment": {...},
    "market": {...},
    "provider": {...}
  }
}
```

### Module Genesis

Each module defines initial state:

```go
func (module) InitGenesis(ctx, genesis) {
  // Initialize module state
}

func (module) ExportGenesis(ctx) {
  // Export current state
}
```

---

## Additional Resources

- [Cosmos SDK Documentation](https://docs.cosmos.network)
- [ABCI Specification](https://docs.cometbft.com/v0.38/spec/abci/)
- [Akash Node Repository](https://github.com/akash-network/node)
- [Module Development Guide](https://tutorials.cosmos.network/)

