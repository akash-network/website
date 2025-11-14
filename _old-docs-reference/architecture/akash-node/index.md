---
categories: ["Architecture"]
tags: []
title: "Akash Node"
linkTitle: "Akash Node"
weight: 3
---


The Akash Node is a vital component within the Akash Network, a decentralized cloud computing platform that establishes a marketplace for computing resources. This node facilitates interactions with the network, transaction validation, and active participation in the consensus process.

### Key Responsibilities

1. **Blockchain Synchronization**: Ensures continuous synchronization with the network, maintaining an up-to-date copy of the blockchain to ensure data consistency and availability.

2. **Transaction Submission**: Enables users to submit various transactions, including deployments, bids, and leases, to the Akash Network.

3. **Querying Network State**: Provides an interface for querying the network's state, allowing users to access information related to deployments, orders, and account balances.

### How it Works

The [Akash Node](https://github.com/akash-network/node) plays a critical role in facilitating interactions within the Akash Network. Here's a detailed look at its functioning and its integral role in the ecosystem:

#### Blockchain Synchronization

The Akash Node continuously synchronizes with the network to maintain an up-to-date blockchain copy. Leveraging the Tendermint consensus [algorithm](https://tendermint.com/core/), a Byzantine Fault Tolerant (BFT) engine, the node ensures efficient agreement on the blockchain state.

#### Transaction Validation and Propagation

Responsible for validating and propagating transactions, the node checks the validity of received transactions according to the network's rules. Valid transactions are added to the mempool and propagated to [peers](https://docs.tendermint.com/).

#### Block Creation

Validator nodes within the Akash Network engage in block creation, proposing new blocks that contain transactions from the mempool. Validators then participate in the consensus process to reach agreement on block validity. Once consensus is reached, the new block is appended to the blockchain, and the node updates its local copy [accordingly](https://docs.tendermint.com/).

#### Gossip Protocol

The Akash Node utilizes a gossip protocol to efficiently communicate with [peers](https://github.com/tendermint/tendermint/tree/master/spec). This protocol enables nodes to share information about the network's state, ensuring consistent views of the blockchain [state](https://github.com/tendermint/tendermint/tree/master/spec).

#### Querying Network State

Maintaining an indexed view of the blockchain state, the Akash Node enables users to query information such as account balances, deployment statuses, and order books. Leveraging the [Application Blockchain Interface (ABCI)](https://github.com/tendermint/tendermint/blob/v0.34.x/spec/abci/README.md), the node processes and responds to user queries, offering insights into the network's state.

#### Governance and Staking

Validator nodes, particularly, participate in governance and staking processes. Validators stake Akash Tokens (AKT) as collateral, securing their network position. These nodes engage in governance by voting on proposals that impact the network's parameters, upgrades, and critical decisions.

In conclusion, the Akash Node serves as a pivotal component in the Akash Network, responsible for blockchain synchronization, transaction validation and propagation, block creation, and facilitating user queries. Additionally, it actively contributes to governance and staking processes, ensuring the network's proper functioning and decentralization.

- [Akash Node GitHub](https://github.com/akash-network/node)
- [Akash Network Official Website](https://akash.network/)
- [Tendermint Consensus](https://tendermint.com/core/)
- [Tendermint Core Documentation](https://docs.tendermint.com/)
- [Gossip Protocol in Tendermint](https://github.com/tendermint/tendermint/tree/master/spec)
- [Application Blockchain Interface](https://github.com/tendermint/tendermint/blob/v0.34.x/spec/abci/abci.md)