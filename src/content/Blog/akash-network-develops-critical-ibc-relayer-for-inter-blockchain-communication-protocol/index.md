---
title: "Akash Network Develops Critical IBC Relayer for Inter-Blockchain Communication Protocol"
description: Blockchain’s wider adoption and acceleration has been limited by the scalability issue. There have been many efforts to solve the scalability challenge, including developing faster databases with hardware to increase transactions per second (TPS), and “sharding” the blockchain, where a chain's transactional load is split and distributed among a large quantity of network partitions (shards).

pubDate: "2021-02-18"
draft: false

categories:
  - News
tags:
  - News
contributors:
  - Maly Ly

bannerImage: ./banner-image.png
---
  
Blockchain’s wider adoption and acceleration has been limited by the scalability issue. There have been many efforts to solve the scalability challenge, including developing faster databases with hardware to increase transactions per second (TPS), and “sharding” the blockchain, where a chain's transactional load is split and distributed among a large quantity of network partitions (shards).

Having been [early supporters and adopters of Cosmos and Tendermint](https://akash.network/blog/decentralized-serverless-computing-coming-to-cosmos/), we’ve been incredibly excited about Inter-Blockchain Communication (IBC), led by Cosmos Network’s non-profit Interchain Foundation.

#### **Inter-Blockchain Communication (IBC)**  
**\_\_\_\_\_**

In development for over three years, IBC is the flagship feature of the Cosmos Network. For crypto and blockchain, where interoperability and composability are essential to continued growth for decentralized sectors like decentralized finance (DeFi), IBC is the most promising production ready solution.  

IBC enables different blockchain protocols to communicate and transact with each other independently, providing a framework to connect the global economy to the blockchain. Participants on existing blockchains will be able to interact and exchange with each other across chains.   

The ability for chains to transact and interoperate will be transformational for the industry.  

The Cosmos Hub will be the first blockchain to support IBC through its much anticipated Stargate protocol update, enabling the exchange of transactions across different chains, initially within the Cosmos community, and later, to the wider blockchain ecosystem.

#### **Akash Network’s Development of the IBC Relayer**  
**\_\_\_\_\_**

In September 2020, we [announced a partnership with the ICF](https://akash.network/blog/akash-partners-with-cosmoss-interchain-foundation-to-accelerate-development-of-inter-blockchain-communication/) to help accelerate development of the IBC interoperability protocol.  

The ICF awarded Akash with a grant to build and maintain the IBC Relayer. Essential to launching the IBC protocol and the only way users will be able to use IBC, the Relayer is the user interface that enables all transfers and transactions on IBC.  

We migrated and developed features from Cosmos’s Game of Zones, Cosmos’s proof-of-concept testnet, to a production ready IBC-compatible Relayer.  

Following are the key features we worked on for the IBC Relayer:  

*   **API Server:** We implemented an end-to-end API server that allows clients to interact with IBC chains. This feature allows the Relayer to expose an RPC server that enables a user to make common queries and use all the relayer functionality against a programmatic HTTP interface, i.e. a website. This feature will also allow for remote management of relayer nodes.
    

*   **Improved Client-side Validations:** We improved the security and robustness of the Relayer by improving client-side validations for messages.  
      
    
*   **Added Support for Client, Connection, and Channel Recycling:** This feature is a crucial performance enhancement for the IBC network, and reduces the number of connections needed between different servers, improving efficiency and speed in the system.  
      
    
*   **Automatic Updates to Clients for Preventing Expiry:** We added crucial usability improvements such as automatic client updates to prevent expiration of IBC clients, reducing management and monitoring of the system.  
      
    
*   **Typed Events:** This feature simplifies the code base and makes it easier for clients to consume events from all Cosmos SDK-based chains. It also makes the system more stable and greatly improves the developer experience.
    

*   **Architecture Decision Records (ADR) in Cosmos SDK:** Our submission for how we want to design events was integrated into the latest Cosmos SDK and will be incorporated into the Relayer.
    

#### **Akash MAINNET 2, One of the First Networks Integrated with IBC**  
**\_\_\_\_\_**

We look forward to seeing how the community uses the Relayer. Once IBC launches on Thursday, February 18, 2021, we’ll continue to maintain and manage the IBC Relayer, and make improvements.  

Our upcoming Akash MAINNET 2, the world’s first decentralized cloud marketplace, will be one of the first networks in the Cosmos ecosystem to have IBC and IBC Relayer integrated.  

With IBC and IBC Relayer, Akash DeCloud’s multi-currency settlement and the ability to pay for cloud compute using stablecoins (such as Kava’s USDX) will be coming much sooner, rather than later. Decentralized organizations will be able to purchase cloud compute programmatically on Akash DeCloud, instead of relying on centralized exchanges.  

Akash’s work on IBC will enable us to adopt and benefit from interchain technologies faster than other networks. Akash DeCloud, integrated with IBC, will enable more composability, innovation, and scaling for DeFi and decentralized organizations.  
  
  

**For the latest Akash, AKT, and Mainnet 2 news and promotions, join our Telegram!**  

[Join The Unstoppable Cloud](https://t.me/AkashNW)