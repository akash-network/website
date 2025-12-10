---
categories: ["Node Operators"]
tags: ["Architecture", "Consensus", "CometBFT"]
weight: 2
title: "Consensus Layer"
linkTitle: "Consensus Layer"
description: "Deep dive into CometBFT consensus engine and how Akash achieves Byzantine Fault Tolerant consensus"
---

The Consensus Layer of Akash nodes is powered by **CometBFT** (formerly Tendermint), a Byzantine Fault Tolerant (BFT) consensus engine. This layer is responsible for block production, validation, and ensuring all nodes in the network maintain identical state.

---

## CometBFT Overview

CometBFT provides the consensus and networking layers that sit below the Akash application logic.

**Key Features:**
- **Byzantine Fault Tolerance** - Network remains secure with up to 1/3 malicious validators
- **Instant Finality** - No blockchain forks; blocks are final when committed
- **High Performance** - Fast block times (~5-6 seconds on Akash)
- **Application Independence** - Communicates with application via ABCI

---

## Architecture

```
+-------------------------------------------------------------+
|                      CometBFT Engine                        |
|                                                             |
|  +-----------------------+  +--------------------------+    |
|  |   Consensus Core      |  |    P2P Networking        |    |
|  |                       |  |                          |    |
|  |  - Propose            |  |  - Peer Discovery        |    |
|  |  - Prevote            |  |  - Block Propagation     |    |
|  |  - Precommit          |  |  - Transaction Gossip    |    |
|  |  - Commit             |  |  - PeX Protocol          |    |
|  +-----------------------+  +--------------------------+    |
|                                                             |
|  +-------------------------------------------------------+  |
|  |                    Mempool                            |  |
|  |  (Pending Transactions)                               |  |
|  +-------------------------------------------------------+  |
|                            |                                |
|                            | ABCI                           |
|                            v                                |
+-------------------------------------------------------------+
                             |
                             v
                    Application Layer
```

---

## Consensus Algorithm

### Byzantine Fault Tolerance

CometBFT uses a **practical Byzantine Fault Tolerant (pBFT)** consensus algorithm that can tolerate up to 1/3 of validators being malicious or offline.

**Assumptions:**
- Total voting power = V
- Byzantine (malicious) voting power = F
- **Safety guaranteed when:** F < V/3
- **Liveness guaranteed when:** F < V/3

**Example:**
- 100 validators
- Up to 33 can be byzantine → network remains safe
- 67+ honest validators → network makes progress

### Consensus Rounds

Each block goes through multiple consensus rounds:

```
Propose → Prevote → Precommit → Commit
```

**Round Steps:**

**1. Propose**
- Designated proposer broadcasts block proposal
- Proposer selection is deterministic (weighted round-robin by voting power)
- Proposal includes transactions from mempool

**2. Prevote**
- Validators broadcast prevote for proposed block
- Validators may prevote `nil` if proposal is invalid
- Requires 2/3+ prevotes to proceed

**3. Precommit**
- Validators broadcast precommit for block
- Requires 2/3+ precommits on same block
- If no consensus, move to next round with new proposer

**4. Commit**
- Block is committed to blockchain
- All nodes apply transactions
- State transitions occur
- New block height begins

### Round Timeouts

Timeouts ensure liveness if proposer fails:

**Default timeouts (Akash mainnet):**
```toml
timeout_propose = "3s"
timeout_propose_delta = "500ms"
timeout_prevote = "1s"
timeout_prevote_delta = "500ms"
timeout_precommit = "1s"
timeout_precommit_delta = "500ms"
timeout_commit = "5s"
```

**How timeouts work:**
- If timeout expires, validators move to next step
- Prevents network stalling on failed proposer
- Delta increases timeout each round

---

## Block Production

### Proposer Selection

Validators take turns proposing blocks using **weighted round-robin**:

```
Proposer Priority = Voting Power × Blocks Since Last Proposal
```

**Selection algorithm:**
1. Calculate priority for each validator
2. Validator with highest priority proposes
3. Selected validator's priority is reduced
4. Other validators' priorities increase

**Example:**
- Validator A: 40% voting power
- Validator B: 30% voting power
- Validator C: 30% voting power

→ A proposes more frequently than B or C

### Block Structure

```
Block
├── Header
│   ├── Version
│   ├── ChainID
│   ├── Height
│   ├── Time
│   ├── LastBlockID
│   ├── LastCommitHash
│   ├── DataHash (transactions)
│   ├── ValidatorsHash
│   ├── NextValidatorsHash
│   ├── ConsensusHash
│   ├── AppHash (application state root)
│   ├── LastResultsHash
│   ├── EvidenceHash
│   └── ProposerAddress
├── Data
│   └── Transactions []
├── Evidence
│   └── Evidence []
└── LastCommit
    └── Signatures []
```

### Consensus Parameters

Key parameters that govern block production:

**Block Parameters:**
```go
Block:
  MaxBytes: 200000      // Max block size: ~200 KB
  MaxGas: 100000000     // Max gas per block: 100M
```

**Evidence Parameters:**
```go
Evidence:
  MaxAgeNumBlocks: 302400     // ~3 weeks at 5s blocks
  MaxAgeDuration: 504h        // 3 weeks
  MaxBytes: 10000             // Max evidence size
```

**Validator Parameters:**
```go
Validator:
  PubKeyTypes: ["ed25519"]    // Supported key types
```

---

## P2P Networking

### Network Architecture

```
           Seed Nodes
               |
        (Peer Exchange)
               |
    +----------+----------+
    |          |          |
Persistent  Validator  Unconditional
  Peers       Node        Peers
    |          |          |
    +----------+----------+
         |
    Other Peers
   (up to max_num_inbound_peers)
```

### Connection Types

**1. Seed Nodes**
- Provide initial peer list
- Not persistent connections
- Disconnect after peer exchange

**Configuration:**
```toml
seeds = "seed1@host1:26656,seed2@host2:26656"
```

**2. Persistent Peers**
- Maintained connections
- Auto-reconnect if disconnected
- Prioritized over other peers

**Configuration:**
```toml
persistent_peers = "node1@host1:26656,node2@host2:26656"
```

**3. Unconditional Peers**
- Always allowed (bypass limits)
- Never disconnected
- Used for sentry architecture

**Configuration:**
```toml
unconditional_peer_ids = "id1,id2,id3"
```

**4. Private Peer IDs**
- Not gossiped to other peers
- Used for validator privacy

**Configuration:**
```toml
private_peer_ids = "id1,id2"
```

### Peer Exchange (PeX)

**PeX Protocol:**
- Nodes exchange known peer addresses
- Automatic peer discovery
- Maintains peer diversity

**Can be disabled:**
```toml
pex = false  # Disable for private validators
```

### Gossip Protocol

CometBFT uses gossip for efficient data propagation:

**What is gossiped:**
- **Transactions** - New tx broadcast to peers
- **Blocks** - Block proposals spread quickly
- **Votes** - Prevotes and precommits
- **Peer addresses** - Via PeX

**Gossip flow:**
1. Node receives data
2. Validates data
3. Forwards to subset of peers
4. Peers forward to their peers
5. Exponential propagation

---

## Mempool

The mempool holds pending transactions before they're included in blocks.

### Mempool Types

**1. Flood Mempool (default)**
- Transactions broadcast to all peers immediately
- Fast propagation
- Higher network usage

**2. Priority Mempool**
- Transactions ordered by priority (gas price)
- Higher fee = included sooner

**Configuration:**
```toml
[mempool]
version = "v1"  # v0 (flood) or v1 (priority)
recheck = true
broadcast = true
size = 5000
max_txs_bytes = 1073741824  # 1 GB
```

### Transaction Lifecycle

```
Client
  → Submit Transaction
     → Mempool (CheckTx)
        → Valid? 
           → Yes → Broadcast to Peers
           → No → Reject
              → Included in Block Proposal
                 → Block Committed
                    → Remove from Mempool
```

### CheckTx

Before accepting transactions, mempool calls `CheckTx` on application:

**Checks performed:**
- Valid signatures
- Sufficient account balance
- Correct sequence number
- Valid gas amount

**Invalid transactions are rejected immediately.**

---

## Validator Operations

### Validator Set

Active validators ordered by voting power:

**Mainnet parameters:**
```go
MaxValidators: 100          // Top 100 by stake
UnbondingTime: 336h         // 2 weeks
MinCommissionRate: 0.05     // 5% minimum
```

**Validator set updates:**
- Applied at `EndBlock`
- Take effect at next block
- Power changes from staking operations

### Signing Requirements

Validators must sign blocks to avoid slashing:

**Signing window:**
```go
SignedBlocksWindow: 30000        // Check last 30k blocks
MinSignedPerWindow: 0.5          // Must sign 50%+
```

**Downtime slashing:**
- Miss 50%+ in window → Slashed
- 0.01% stake penalty
- Jailed (removed from validator set)
- Must `unjail` to return

### Double-Sign Detection

**Double-signing = Byzantine behavior:**
- Signing two different blocks at same height
- Cryptographic evidence submitted
- Heavy slashing: 5% stake
- **Permanent tombstoning**

**Evidence submission:**
```bash
# Evidence expires after
MaxAgeNumBlocks: 302400  # ~3 weeks
MaxAgeDuration: 504h     # 3 weeks
```

---

## State Sync

State sync allows nodes to join network quickly without replaying all blocks.

### How It Works

```
New Node
  → Request State Snapshot (at height H)
     → Download Snapshot Chunks
        → Verify App Hash
           → Load State
              → Start Syncing from H+1
```

**Advantages:**
- Join network in minutes (not days)
- Lower disk I/O during sync
- Less bandwidth usage

**Configuration:**
```toml
[statesync]
enable = true
rpc_servers = "rpc1:26657,rpc2:26657"
trust_height = 1000000
trust_hash = "ABC123..."
```

**Akash mainnet** uses snapshots by default in Helm deployments (~5 minutes to sync).

---

## Consensus Monitoring

### Key Metrics

**Height metrics:**
```
tendermint_consensus_height               # Current block height
tendermint_consensus_latest_block_height  # Latest committed
```

**Validator metrics:**
```
tendermint_consensus_validators           # Total validators
tendermint_consensus_validators_power     # Total voting power
tendermint_consensus_missing_validators   # Offline validators
```

**Round metrics:**
```
tendermint_consensus_rounds              # Consensus rounds taken
tendermint_consensus_num_txs             # Transactions per block
```

**Performance metrics:**
```
tendermint_consensus_block_interval_seconds  # Time between blocks
tendermint_consensus_block_size_bytes        # Block size
```

### Health Checks

**Check node status:**
```bash
curl http://localhost:26657/status
```

**Key fields:**
```json
{
  "sync_info": {
    "latest_block_height": "12345678",
    "latest_block_time": "2024-01-01T00:00:00Z",
    "catching_up": false
  },
  "validator_info": {
    "voting_power": "1000000"
  }
}
```

---

## Configuration

### config.toml

**Consensus settings:**
```toml
[consensus]
timeout_propose = "3s"
timeout_propose_delta = "500ms"
timeout_prevote = "1s"
timeout_prevote_delta = "500ms"
timeout_precommit = "1s"
timeout_precommit_delta = "500ms"
timeout_commit = "5s"

create_empty_blocks = true
create_empty_blocks_interval = "0s"
```

**P2P settings:**
```toml
[p2p]
laddr = "tcp://0.0.0.0:26656"
external_address = ""
seeds = ""
persistent_peers = ""
max_num_inbound_peers = 40
max_num_outbound_peers = 10
pex = true
seed_mode = false
private_peer_ids = ""
```

**Mempool settings:**
```toml
[mempool]
recheck = true
broadcast = true
size = 5000
max_txs_bytes = 1073741824
```

---

## Security Considerations

### Sentry Node Architecture

**Production validators should use sentries:**

```
         Internet
             |
    +--------+--------+
    |                 |
Sentry Node     Sentry Node
    |                 |
    +--------+--------+
             |
        Validator
    (Private Network)
```

**Configuration:**

**Validator:**
```toml
pex = false
persistent_peers = "sentry1,sentry2"
private_peer_ids = "validator_id"
addr_book_strict = false
```

**Sentries:**
```toml
pex = true
unconditional_peer_ids = "validator_id"
private_peer_ids = "validator_id"
```

### Key Management

**Validator key security:**
- Use **TMKMS** for production
- Hardware security module (HSM) support
- Remote signing reduces key exposure

See [TMKMS Guide](/docs/node-operators/validators/tmkms-stunnel)

---

## Additional Resources

- [CometBFT Documentation](https://docs.cometbft.com)
- [Consensus Specification](https://github.com/cometbft/cometbft/tree/main/spec/consensus)
- [P2P Specification](https://github.com/cometbft/cometbft/tree/main/spec/p2p)
- [Run a Validator](/docs/node-operators/validators)
- [Node Build Guide](/docs/node-operators/node-build)

