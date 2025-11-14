---
categories: ["Architecture"]
tags: []
title: "Architecture Overview"
linkTitle: "Architecture Overview"
weight: 3
---

The architecture of Akash Network is composed of several key components.

## Key Components
<br/>

1. **Blockchain Layer**: Provides a secure, scalable consensus mechanism using Tendermint Core and Cosmos SDK.
2. **Application Layer**: Handles deployment, resource allocation, and the lifecycle of deployments within the Akash ecosystem.
3. **Provider Layer**: Manages providers' resources, bids, and user application deployments using Provider Daemon and Container Orchestration.
4. **User Layer**: Enables users to interact with the network, manage resources, and monitor application status using CLI, Console, and Dashboard.

## Blockchain Layer

The Blockchain Layer is built on top of the Cosmos SDK and Tendermint Core, providing a scalable and secure consensus mechanism. This layer is responsible for maintaining the distributed ledger, validator management, governance, and token transactions (Akash Token, AKT). It ensures the security and decentralization of the Akash Network.

### Key Components

- [**Tendermint Core**](https://tendermint.com/sdk/): A Byzantine Fault Tolerant (BFT) consensus engine that provides the foundation for the Akash blockchain.
- [**Cosmos SDK**](https://docs.cosmos.network/): A modular framework that allows for the creation of custom blockchains, offering tools and modules to build the Akash Network.

## Application Layer

The Application Layer is responsible for handling the deployment of applications, resource allocation, and the lifecycle of deployments within the Akash ecosystem. It includes the following components:

- **Deployment**: Users submit deployment configurations specifying their requirements, such as computing resources, storage, and geographic location.
- **Order**: Orders are generated based on deployment configurations and broadcast to the network.
- **Bid**: Providers place bids for the orders, offering their resources at a competitive price.
- **Lease**: Once a user selects the winning bid, a lease is created between the user and the provider.

## Provider Layer

The Provider Layer consists of data centers, cloud providers, and individual server operators who offer their resources to the Akash Network. They run the Akash Provider software to manage their resources, submit bids, and interact with users.

### Key Components

- [**Provider Daemon**](https://github.com/akash-network/provider): A software component that manages the provider's resources, communicates with the Akash blockchain, and handles resource allocation for deployments.
- **Container Orchestration**: Providers utilize container orchestration systems, such as Kubernetes or Docker Swarm, to manage the deployment and scaling of user applications.

## User Layer

The User Layer comprises users who require computing resources, such as developers or businesses, who utilize the Akash Network to deploy and manage their applications. Users interact with the network through various tools and interfaces.

### Key Components

- [**Akash Client (cli)**](https://github.com/akash-network/provider): A command-line interface (CLI) tool that allows users to interact with the Akash Network, create deployments, manage resources, and monitor the status of their applications.
- [**Akash Console**](https://console.akash.network/): Akash Console is a web app for deploying applications on Akash Network, offering a dashboard for deployment monitoring and administration.


In summary, the Akash Network architecture consists of the Blockchain Layer, Application Layer, Provider Layer, and User Layer. This structure enables the platform to provide a decentralized marketplace for computing resources, connecting users who need resources with providers.
