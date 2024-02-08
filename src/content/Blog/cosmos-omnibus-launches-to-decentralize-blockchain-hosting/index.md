---
title: "Cosmos Omnibus Launches to Decentralize Blockchain Hosting"
description: The recently released Cosmos Omnibus helps to decentralize blockchain hosting by providing a simple way to set up and run any blockchain in the Cosmos ecosystem on the cloud provider of your choice. The Omnibus package includes all of the Docker images configuration to make deploying onto Akash Network easy and standardized for any Cosmos SDK-based blockchain.

pubDate: "2021-07-07"
draft: false

categories:
  - News
tags:
  - News
  - Product
  - Developers
contributors:
  - Colin Pollen

bannerImage: ./banner-image.png
---

The recently released [Cosmos Omnibus](https://github.com/tombeynon/cosmos-omnibus/tree/install-and-config) helps to decentralize blockchain hosting by providing a simple way to set up and run any blockchain in the Cosmos ecosystem on the cloud provider of your choice. The Omnibus package includes all of the Docker images configuration to make deploying onto [Akash Network](https://github.com/ovrclk/akash) easy and standardized for any Cosmos SDK-based blockchain.

All blockchains share a common architecture, the software that they develop has no centralized hardware. Blockchains have many connected nodes running software hosted across many machines. A blockchain is only considered decentralized if the hardware hosting the nodes is spread out across many locations, running in independently owned data centers or on home computers. Blockchains require decentralization for security, in order to prevent an individual or small group from taking control of the network.

Many blockchains have a major problem today, the hardware that they use to host their blockchain is owned by one or two companies, Amazon Web Services (AWS) and Google Cloud Platform (GCP). The world’s largest companies are the owners and operators of many decentralized networks. Typically node operators will choose convenience over security, but now it’s more convenient to use the Cosmos Omnibus.

# Run Your Own Node with Cosmos Omnibus on Akash Network

When setting up a validator there are countless ways to configure your setup. The Cosmos Omnibus provides examples for some of the most common configurations. The Cosmos Omnibus software package includes Docker images for [cosmos-sdk](https://github.com/cosmos-cosmos-sdk)\-based blockchains that are pre-configured to run on [Akash](https://github.com/ovrclk/akash). Configuration is achieved using environment variables, with shortcuts available for common setups. Every aspect of the node configuration can be achieved in this way.

### **Supported Networks**

The networks supported by the Cosmos Omnibus include Akash Network, Sentinel VPN, Gaia, Kava, Osmosis, and Persistence One. The Omnibus package includes the docker images and full configuration to run the nodes. The available docker images below can be found on the [cosmos-omnibus repository](https://github.com/ovrclk/cosmos-omnibus/pkgs/container/cosmos-omnibus). The full configuration for each of the supported chains can be found in the example deployment files linked below for each project.

### Run your node locally

To test each image, you can run your blockchain node locally using the docker-compose.yml example file. To run these files, first make sure Docker is installed on your machine and run this command in the directory: docker-compose up

### Run your node on Akash Network

When you want to run your node on a cloud provider, you can easily deploy using Akash and the deploy.yml example deployment file in each chain directory which details the minimum configuration required. Follow the [Akash deployment guide](https://akash.network/docs/guides/deploy). You can use the below configuration options to add functionality.

## **Set your Environment Configuration** 

Cosmos blockchains can be configured entirely using environment variables instead of the config files.The chain configuration can be sourced from a JSON file as implemented by [@sikkatech](https://github.com/sikkatech/tm-networks), or from a metadata repository such as [Akash's network configuration files](https://github.com/ovrclk/net).

**Important Note:** Every chain has its own prefix, but the format of the configuration is standardized. For example to configure the `seeds` option in the p2p section of `config.toml`, for the Akash blockchain: `AKASH_P2P_SEEDS=id@node:26656`

Below are examples for each of the environment variables. If you’d like to learn more about these variables, you may want to read the [Cosmos Docs](https://docs.tendermint.com/master/nodes/configuration.html#p2p-settings).

###  **Backup & Restore your Private Key**

Validators are responsible for committing new blocks in the blockchain. These validators participate in the consensus protocol by broadcasting votes which contain cryptographic signatures signed by each validator's private key.

If you are running a validator, protecting a validator's consensus key is the most important factor to take in when designing your setup. The key that a validator is given upon creation of the node is called a consensus key, it has to be online at all times in order to vote on blocks.

The Cosmos Omnibus allows the node private keys to be backed up and restored from any S3 compatible storage provider, such as Sia, Skynet, or Storj using Filebase.It’s important to backup your private keys somewhere secure, and it’s important to have a secure method to restore the key when booting back up on Akash. Each time the Cosmos Omnibus containers boot up, they will automatically restore a private key from any S3 storage provider.

Akash provides ephemeral storage, which means data stored in the container is erased when the container is shut down. The Cosmos Omnibus solves for this by creating a persistent node ID and validator key on a separate storage.

[Filebase](https://filebase.com/) is a great way to use S3 with decentralised hosting such as Sia, Skynet, or Storj. Cosmos Omnibus can use Filebase to backup the `node_key.json` and `priv_validator_key.json` are both backed up, and can be encrypted with a password.

### **Set up State Sync** 

In proof-of-stake (PoS) blockchains using the Tendermint Core, the consensus process involves rounds of communication between the nodes to determine what block should be committed next. Using this process to sync up with the blockchain from scratch can take a very long time. It's much faster to just download blocks and check the merkle tree of validators than to run the real-time consensus gossip protocol. To support faster syncing, Tendermint offers a fast sync mode and a state sync mode.

With fast-sync your node is downloading all of the data of an application from genesis and verifying it. Fast sync is enabled by default, and can be toggled in the `config.toml` or `via --fast_sync=false`.

With state sync your node will download data related to the head or near the head of the chain and verify the data. This leads to drastically shorter times for joining a network. State sync will continuously work in the background to supply nodes with chunked data when bootstrapping.

Once a few nodes in a network have taken state sync snapshots, new nodes can join the network using state sync. When the node is started it will then attempt to find a state sync snapshot in the network and restore it. The new node will state sync and join the network in seconds instead of spending hours downloading the full chain.

Statesync requires running twice as many nodes and requires that snapshots are enabled. Fortunately, it’s simple to enable State Sync and Snapshots with the Cosmos Omnibus! Just use the environment variables below.

### [Example Statesync Configuration](https://github.com/tombeynon/cosmos-omnibus/blob/install-and-config/_examples/statesync)

This example uses the `STATESYNC_RPC_SERVERS` option which automatically configures statesync from the first node's RPC server. This example includes 2 deployment files:

- `snapshot-deploy.yml` for the two snapshotting nodes
- `statesync-deploy.yml` for a third state-synced node.

When you look inside these files you will notice environment variables configuration as described in the table below.

### **Bootstrap your Node with Data**

Not only can Cosmos Omnibus automatically bootstrap your node with your private key, sync the latest blocks with statesync, but it can restore the node’s data directory from a `.tar` or `.tar.gz` file stored on a public URL. This can be from a specific URL, or from a base URL and a file matching a given pattern**.**

You can configure the bootstrap to restore data from a URL using the environment variables in the chart below.

## **DDoS Mitigation with Sentry Nodes**

One of the most common designs to solve for distributed denial-of-service attack (DDoS) prevention is the [sentry node design](https://forum.cosmos.network/t/sentry-node-architecture-overview/454). On the Cosmos Hub, a validator node can be attacked using the DDoS method. The validator node has a fixed IP address and it opens a RESTful API port facing the Internet.

The sentry node solution provides a way to hide the IP address of the validator node and provide a more easily scalable list of public IP addresses for DDoS mitigation. Multiple distributed nodes (sentry nodes) are deployed in cloud environments and the validator only privately communicates with the sentry nodes. With the possibility of easy scaling (by adding more sentries), it is harder to make an impact on the validator node. New sentry nodes can be brought up during a DDoS attack and they can be integrated into the transaction flow.

All sentry nodes connect to the validator using a private connection. The validator does not have a public IP address to provide its services.

### [Example: Validator with Public Sentries](https://github.com/tombeynon/cosmos-omnibus/blob/install-and-config/_examples/validator-and-public-sentries)

This example shows 2 sentry nodes [state-synced from other nodes](https://github.com/tombeynon/cosmos-omnibus/blob/install-and-config/_examples/statesync), with a single private validator node which only connects to the sentries. Note that you should wait for the sentries to get up to date before running the validator, as it will statesync from those sentries. You can expand the sentry setup to as many nodes as required.  This example includes 2 deployment files:

- `sentries-deploy.yml` to configure the sentry nodes
- `validator-deploy.yml` to configure the validator node

### [Example: Validator with Private Sentries](https://github.com/tombeynon/cosmos-omnibus/blob/install-and-config/_examples/validator-and-private-sentries)

This example is identical to the [public sentries](https://github.com/tombeynon/cosmos-omnibus/blob/install-and-config/_examples/validator-and-public-sentries) example, but shown with the sentries as part of the same deployment to create a private network. The validator will only talk to the sentries that are provided, the sentry nodes will communicate to the validator via a secret connection and the rest of the network through a normal connection. This example includes a single deployment file:

- `deploy.yml` to configure the sentry nodes and validator node

# Load Balancing your Nodes 

### [Example: Load Balanced RPC Nodes](https://github.com/tombeynon/cosmos-omnibus/blob/install-and-config/_examples/load-balanced-rpc-nodes)

This example details two or more deployments of RPC nodes, and an NGINX deployment to load balance them. The deployment is configured to run multiple RPC containers under a single domain. You can add and remove nodes, but remember to update the load balancer deployment when you do. Ideally your RPC nodes would be configured to sync with statesync nodes as covered in this blog and the [documentation](https://github.com/tombeynon/cosmos-omnibus/blob/install-and-config/README.md#statesync).

# Best Practices

Now that you’ve read all about handling your private keys, configuring state sync, restoring from snapshots, sentry node design, and load balancing, you might think there is a lot more work than you realized to run a blockchain node - rather multiple nodes. Fortunately, the Cosmos Omnibus package provides a [directory of examples](https://github.com/tombeynon/cosmos-omnibus/blob/install-and-config/_examples) for all of these common setups. Alternatively you can configure statesync manually using the options we just covered in this blog.

It’s important to remember that a best practice in node operations is not to rely on any single cloud provider, and that includes the Akash Network. Ideally your deployment is not entirely dependent on the Akash network. You should be prepared to run your validator on another cloud, and you should also set up monitoring to detect if your nodes are operating correctly.
