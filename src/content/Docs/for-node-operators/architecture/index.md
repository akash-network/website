---
categories: ["For Node Operators"]
tags: ["Architecture", "Node"]
weight: 4
title: "Node Architecture"
linkTitle: "Architecture"
description: "Deep dive into Akash Node architecture and components"
---

Understand the internal architecture of Akash nodes and how they interact with the blockchain.

This section provides detailed technical documentation for developers and operators who want to understand how Akash nodes work internally.

---

## Node Architecture Overview

Akash nodes are built on the Cosmos SDK and use CometBFT (formerly Tendermint) for consensus. The node architecture consists of three main layers:

### 1. Consensus Layer (CometBFT)
- Block production and validation
- Peer-to-peer networking
- Byzantine Fault Tolerant consensus
- State machine replication

### 2. Application Layer (Cosmos SDK + Akash Modules)
- Standard Cosmos SDK modules (auth, bank, staking, etc.)
- Akash-specific marketplace modules
- State management and storage
- Transaction processing

### 3. API Layer
- gRPC endpoints
- REST API
- WebSocket subscriptions
- RPC queries

---

## Architecture Sections

### [Overview](/docs/for-node-operators/architecture/overview)

High-level overview of node architecture, responsibilities, state management, and how all components work together.

### [Consensus Layer](/docs/for-node-operators/architecture/consensus-layer)

Deep dive into CometBFT consensus engine:
- Byzantine Fault Tolerance
- Block production and validation
- P2P networking and gossip protocol
- Validator operations
- Mempool and transaction propagation

### [Application Layer](/docs/for-node-operators/architecture/application-layer)

Complete guide to the application layer:
- Cosmos SDK modules (auth, bank, staking, gov, etc.)
- Akash marketplace modules (deployment, market, provider, escrow)
- ABCI interface
- State management and IAVL tree
- Transaction processing

### [API Layer](/docs/for-node-operators/architecture/api-layer)

All APIs for interacting with nodes:
- gRPC services and clients
- REST API (gRPC-Gateway)
- CometBFT RPC endpoints
- WebSocket subscriptions
- Code examples in multiple languages

---

## For Developers

If you're building on Akash or contributing to the node codebase:

- **Source Code:** [github.com/akash-network/node](https://github.com/akash-network/node)
- **Cosmos SDK Docs:** [docs.cosmos.network](https://docs.cosmos.network)
- **CometBFT Docs:** [docs.cometbft.com](https://docs.cometbft.com)
