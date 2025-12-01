---
categories: ["For Node Operators"]
tags: ["Architecture", "Node", "Overview"]
weight: 1
title: "Node Overview"
linkTitle: "Overview"
description: "Detailed overview of Akash Node architecture and how it works"
---

The Akash Node is a blockchain application built on the Cosmos SDK that enables decentralized cloud computing marketplace functionality. This document provides a high-level overview of the architecture and links to detailed documentation for each layer.

---

## Layer Documentation

For detailed information about each layer:

- **[Consensus Layer](/docs/for-node-operators/architecture/consensus-layer)** - CometBFT consensus, block production, P2P networking
- **[Application Layer](/docs/for-node-operators/architecture/application-layer)** - Cosmos SDK modules, Akash modules, state management
- **[API Layer](/docs/for-node-operators/architecture/api-layer)** - gRPC, REST, RPC interfaces and examples

---

## High-Level Architecture

```
+---------------------------------------------------------------+
|                        Akash Node                             |
|                                                               |
|  +----------------------------------------------------------+ |
|  |                     API Layer                            | |
|  |  (gRPC | REST | WebSocket | RPC)                         | |
|  +----------------------------------------------------------+ |
|                            |                                  |
|  +----------------------------------------------------------+ |
|  |              Application Layer (ABCI)                    | |
|  |                                                          | |
|  |  +-----------------------+  +-------------------------+  | |
|  |  | Cosmos SDK Modules    |  | Akash Modules           |  | |
|  |  | - Auth                |  | - Deployment            |  | |
|  |  | - Bank                |  | - Market                |  | |
|  |  | - Staking             |  | - Provider              |  | |
|  |  | - Gov                 |  | - Escrow                |  | |
|  |  | - Distribution        |  | - Audit                 |  | |
|  |  | - Slashing            |  | - Cert                  |  | |
|  |  | - IBC                 |  | - Take                  |  | |
|  |  +-----------------------+  +-------------------------+  | |
|  |                                                          | |
|  |  +----------------------------------------------------+  | |
|  |  |           State Store (IAVL Tree)                  |  | |
|  |  +----------------------------------------------------+  | |
|  +----------------------------------------------------------+ |
|                            |                                  |
|  +----------------------------------------------------------+ |
|  |                Consensus Layer (CometBFT)                | |
|  |  - Block Production                                      | |
|  |  - Byzantine Fault Tolerance                             | |
|  |  - P2P Networking                                        | |
|  |  - Gossip Protocol                                       | |
|  +----------------------------------------------------------+ |
+---------------------------------------------------------------+
```

---

## Core Components

### 1. Consensus Layer (CometBFT)

**CometBFT** (formerly Tendermint) provides the consensus engine and networking layer.

**Responsibilities:**
- **Block Production** - Validators propose and vote on new blocks
- **Consensus** - Byzantine Fault Tolerant consensus algorithm
- **P2P Networking** - Gossip protocol for block and transaction propagation
- **State Machine Replication** - Ensures all nodes maintain identical state

**How it works:**
1. Validators take turns proposing blocks (round-robin)
2. Validators vote on proposed blocks (2/3+ majority required)
3. Committed blocks are passed to application layer via ABCI
4. Application processes transactions and updates state

**Key Features:**
- Instant finality (no forks)
- Byzantine fault tolerance (up to 1/3 malicious validators)
- High performance (~1-2 second block times)

**→ [Learn more about Consensus Layer](/docs/for-node-operators/architecture/consensus-layer)**

---

### 2. Application Layer (Cosmos SDK + ABCI)

The application layer implements blockchain logic using the **Application Blockchain Interface (ABCI)**. This layer processes transactions, manages state, and enforces business logic.

#### Application Structure

The Akash node application (`AkashApp`) extends `BaseApp` from Cosmos SDK:

```go
type AkashApp struct {
    *baseapp.BaseApp
    *apptypes.App
    
    aminoCdc          *codec.LegacyAmino
    cdc               codec.Codec
    txConfig          client.TxConfig
    interfaceRegistry codectypes.InterfaceRegistry
    sm                *module.SimulationManager
}
```

**Key components:**
- **BaseApp** - Core application logic from Cosmos SDK
- **Codec** - Serialization/deserialization of transactions and state
- **ModuleManager** - Manages all blockchain modules
- **Store** - Persistent key-value database (IAVL tree)

**→ [Learn more about Application Layer](/docs/for-node-operators/architecture/application-layer)**

---

### 3. Module System

Akash uses a modular architecture where each module handles specific functionality.

#### Cosmos SDK Modules (Standard Blockchain)

| Module | Purpose |
|--------|---------|
| **auth** | Account authentication and signature verification |
| **bank** | Token transfers and balance tracking |
| **staking** | Validator staking and delegation |
| **gov** | On-chain governance and proposals |
| **distribution** | Fee distribution to validators/delegators |
| **slashing** | Validator penalties for misbehavior |
| **mint** | Token inflation |
| **ibc** | Inter-Blockchain Communication |
| **upgrade** | Coordinated chain upgrades |
| **evidence** | Byzantine behavior evidence handling |
| **authz** | Authorization grants |
| **feegrant** | Fee allowances |

#### Akash-Specific Modules

| Module | Purpose | Source |
|--------|---------|--------|
| **deployment** | Deployment creation and management | `x/deployment` |
| **market** | Order and bid matching | `x/market` |
| **provider** | Provider registration and attributes | `x/provider` |
| **escrow** | Escrow accounts for leases | `x/escrow` |
| **audit** | Provider auditing and attestations | `x/audit` |
| **cert** | TLS certificate management | `x/cert` |
| **take** | Income distribution/fees | `x/take` |

---

### 4. State Management

#### IAVL Tree

State is stored in an **IAVL tree** (Immutable AVL tree):

- **Merkle proofs** - Cryptographic proof of state
- **Versioning** - Historical state snapshots
- **Efficient queries** - O(log n) lookups

#### State Store Layout

Each module has its own prefixed key space in the store:

```
deployment/     - Deployment state
market/         - Orders, bids, leases
provider/       - Provider registrations
escrow/         - Escrow account balances
audit/          - Audit attributes
cert/           - TLS certificates
take/           - Fee parameters
```

#### State Transitions

State changes only occur through transactions:

1. Transaction submitted to mempool
2. Validator proposes block with transactions
3. Block is committed via consensus
4. Transactions executed in order
5. State root hash updated
6. New state is persisted

---

## Transaction Lifecycle

### 1. Transaction Submission

```
Client → Mempool → Validation → Pending
```

**Process:**
- Client signs transaction with private key
- Transaction broadcast to node's mempool
- Node validates signature, fees, and account sequence
- Valid transactions added to mempool
- Propagated to peer nodes via gossip

### 2. Block Production

```
Mempool → Proposal → Consensus → Commit
```

**Process:**
- Proposer selects transactions from mempool
- Creates block and broadcasts to validators
- Validators vote on block (prevote + precommit)
- Block committed when 2/3+ majority reached
- All nodes apply transactions to state

### 3. Transaction Execution

```
Block → BeginBlock → DeliverTx → EndBlock → Commit
```

**ABCI workflow:**

**BeginBlock**
- Called at start of block
- Updates validator set changes
- Distributes block rewards

**DeliverTx** (per transaction)
- Verify transaction signatures
- Check account balances and sequences
- Execute transaction logic
- Emit events
- Deduct fees

**EndBlock**
- Called at end of block
- Execute module end-block logic
- Return validator updates

**Commit**
- Compute new state root hash
- Persist state to disk
- Return app hash to CometBFT

---

## API Layer

### gRPC Services

Each module exposes gRPC services for queries and transactions:

**Query services:**
- `/akash.deployment.v1.Query`
- `/akash.market.v1.Query`
- `/akash.provider.v1.Query`
- `/cosmos.bank.v1beta1.Query`
- `/cosmos.staking.v1beta1.Query`

**Tx services:**
- `/akash.deployment.v1.Msg`
- `/akash.market.v1.Msg`
- `/akash.provider.v1.Msg`

**→ [Learn more about API Layer](/docs/for-node-operators/architecture/api-layer)**

### REST API

gRPC-Gateway provides REST endpoints:

```
GET  /akash/deployment/v1/deployments
GET  /akash/market/v1/orders
GET  /akash/provider/v1/providers
POST /cosmos/tx/v1beta1/txs
```

### RPC Endpoints

CometBFT RPC for blockchain queries:

```
/status              - Node status
/block               - Get block by height
/blockchain          - Get block headers
/tx                  - Get transaction
/validators          - Get validator set
/consensus_state     - Get consensus state
```

---

## Node Responsibilities

### Full Nodes

**Responsibilities:**
- Maintain complete blockchain history
- Validate all blocks and transactions
- Serve RPC/API requests
- Propagate transactions and blocks to peers

**Does NOT:**
- Participate in consensus (no voting)
- Propose blocks
- Receive staking rewards

### Validator Nodes

**Everything a full node does, plus:**
- Participate in block production
- Vote on proposed blocks
- Sign blocks with validator key
- Receive staking rewards and commission
- Subject to slashing for downtime/double-signing

---

## Synchronization Methods

### 1. Block Sync

- Downloads blocks sequentially from peers
- Verifies each block
- Slowest method (~days for mainnet)

### 2. State Sync

- Downloads state snapshot at specific height
- Verifies state via app hash
- Fast sync (~30 minutes)
- See [Node Build guides](/docs/for-node-operators/node-build)

### 3. Snapshots

- Downloads compressed blockchain snapshot
- Extracts and verifies data
- Fastest method (~5 minutes)
- Default method for Helm deployments

---

## Database and Storage

### Database Backends

Supported databases:
- **GoLevelDB** (default) - Pure Go implementation
- **RocksDB** - High performance C++ database
- **BadgerDB** - Pure Go, high performance

### Storage Requirements

| Pruning Strategy | Disk Space | Historical Queries |
|------------------|------------|-------------------|
| `nothing` | ~500 GB | Full history |
| `default` | ~100 GB | Recent blocks only |
| `everything` | ~50 GB | Current state only |

**Recommended for validators:** `nothing` (to serve historical queries)

---

## Networking

### P2P Layer

**PeX (Peer Exchange):**
- Discovers peers automatically
- Shares known peers via gossip
- Maintains peer connections

**Persistent Peers:**
```toml
persistent_peers = "node1@host1:26656,node2@host2:26656"
```

**Seeds:**
```toml
seeds = "seed1@host1:26656,seed2@host2:26656"
```

### Ports

| Port | Protocol | Purpose |
|------|----------|---------|
| 26656 | TCP | P2P (CometBFT) |
| 26657 | TCP | RPC |
| 1317 | TCP | REST API |
| 9090 | TCP | gRPC |

---

## Security

### Key Management

**Validator Key:**
- Used to sign blocks
- Stored in `priv_validator_key.json`
- Should use TMKMS for production

**Node Key:**
- Used for P2P authentication
- Stored in `node_key.json`
- Less critical than validator key

### Sentry Node Architecture

**For production validators:**

```
                  Internet
                      |
         +------------+------------+
         |                         |
    Sentry Node              Sentry Node
         |                         |
         +------------+------------+
                      |
                 Validator
                (Private Network)
```

Sentries protect validator from DDoS attacks.

---

## Monitoring and Observability

### Metrics

Prometheus metrics exposed on port 26660:

```toml
[instrumentation]
prometheus = true
prometheus_listen_addr = ":26660"
```

**Key metrics:**
- `tendermint_consensus_height` - Current block height
- `tendermint_consensus_validators` - Validator count
- `tendermint_mempool_size` - Transactions in mempool
- `tendermint_p2p_peers` - Connected peers

### Logs

**Configure logging:**

```toml
[log]
level = "info"  # trace, debug, info, warn, error
format = "plain"  # plain or json
```

---

## Configuration

### Key Configuration Files

**config.toml** - CometBFT configuration
- P2P settings
- RPC settings
- Consensus parameters

**app.toml** - Application configuration
- API settings
- gRPC settings
- Pruning strategy
- State sync settings

**genesis.json** - Chain genesis state
- Initial validator set
- Chain parameters
- Module genesis state

---

## Additional Resources

- [Node Repository](https://github.com/akash-network/node)
- [Cosmos SDK Documentation](https://docs.cosmos.network)
- [CometBFT Documentation](https://docs.cometbft.com)
- [ABCI Specification](https://docs.cometbft.com/v0.38/spec/abci/)
- [Build a Node](/docs/for-node-operators/node-build)
- [Run a Validator](/docs/for-node-operators/validators)

