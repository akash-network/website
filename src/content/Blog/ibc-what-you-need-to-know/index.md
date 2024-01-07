---
title: "IBC: What You Need to Know"
description: Welcome to IBC 101. In this blog, together we’ll explore what IBC is, how it works and why it’s important, but first, why should you care?

pubDate: "2021-12-01"
draft: false

categories:
  - Insights
tags:
  - Insights
contributors:
  - Greg Richardson

bannerImage: ./banner-image.gif
---

Welcome to [IBC](https://ibcprotocol.org/) 101. In this blog, together we’ll explore what IBC is, how it works and why it’s important, but first, why should you care?  IBC is a core component enabling the Cosmos vision and feeding the narrative that the [Cosmos](https://v1.cosmos.network/intro) network is the “Internet of blockchains.” Like gravity, IBC will help pull economic value into the growing blockchain that is the Cosmos Hub.  So without further ado, let’s delve into IBC’s unique properties, features and what’s in store next.  Let’s get to it.

### What is IBC?

IBC is short for Inter-Blockchain Communication.  It has been developed as part of the greater Cosmos network ecosystem by IBC contributors such as Tendermint, Interchain Foundation and Agoric Systems.  In its simplest form, IBC is connecting different blockchains together.  Up until now, blockchains like Bitcoin, Ethereum and many others operate in their own silo or as if each blockchain was its own deserted island, disconnected from the rest of the world or other blockchains and unable to communicate.  It gets rather lonely.

The IBC protocol is a vehicle for blockchains to socially network (communicate, swap tokens and information).  IBC is kind of what the TCP protocol is to the internet.  Prior to TCP, the internet was a collection of desperate computer networks that didn’t communicate well between each other.  Together, with IP, TCP/IP standardized how data was sent and routed over computer networks.  Today, TCP/IP seamlessly underpins how we consume and enjoy the internet every day.  Similarly, IBC standardizes how blockchains communicate. Hence, Cosmos is often referred to as the “Internet of blockchains”.

# How does IBC work?

Each blockchain that wants to communicate with one another sends and receives header files to keep track of validator sets. Put simply, they run a light client of each other to keep track of one another's blockchain/ledger.  When sending tokens from one blockchain to the other, tokens must first be:

1.  Bonded (held in trust) in preparation for the transaction (i.e. 100 ATOM)
2.  A proof must be sent to the receiving blockchain that the tokens have been bonded
3.  The receiving chain must verify the proof of the 100 bonded ATOM tokens
4.  If the proof is verified, 100 ATOM tokens are frozen/bonded on the originating chain, while a representation of the 100 ATOM are created on the new chain

To be compatible with IBC, a blockchain must have fast finality.  Bitcoin and Ethereum, which are both proof of work systems, do not have this capability.  Each blockchain must maintain its own validator set.  In doing so, blockchains maintain better interoperability with applications.

Scaling this solution becomes challenging if multiple blockchains want to communicate with one another.  Connections can get out of hand quickly.  This is where the Cosmos Hub comes into play. Hubs act as the aggregators, enabling a singular blockchain to communicate with many blockchains.  The hub enables a network of blockchains or the ‘internet of blockchains”.

### Why is IBC important?

IBC is a critical element to the Cosmos framework connecting sovereign blockchains.  This creates tremendous value to the network, beyond the obvious ability to swap tokens and information. Paired with the Tendermint BFT engine, Cosmos SDK, and other tools, developers can scale blockchains with speed, security and interoperability within or outside of the Cosmos network.  This kind of versatility can be a powerful incentive for new or existing blockchains to build with or connect to Cosmos via the IBC protocol thereby growing the value of the Cosmos network, in addition to its capability and utility.

### Blockchain Integrations

In addition to token transfers, IBC also facilitates interaction with the IBC data oracle.  IBC compatible blockchains use this protocol to access [BandChain](https://docs.bandchain.org/whitepaper/cosmos-IBC.html)_**.**_

BandChain indexes blockchain data from IBC connected sources.  BandChain receives requests for information and processes the transactions accordingly. In plain English, IBC connects several blockchains together, making cross-chain queries, data and analytics possible.  To simplify and scale access to BandChain, [StarPort](https://starport.com/) was born.  StarPort accelerates the adoption curve of using BandChain***,*** as well as many other aspects of blockchain development.

### Customizations

To be IBC compatible, a blockchain consensus layer must offer fast finality.  Proof of Work (PoW) systems such as Bitcoin and Ethereum do not offer fast finality.  To address this problem, IBC offers “pegs” as an intermediary between the blockchain and the Cosmos Hub.  The peg will translate the PoW system into one that has fast finality and is compatible with IBC.  Ethereum in particular has its own peg or bridge that we’ll talk about later.

IBC and the broader Cosmos network support and enable the building and networking of sovereign blockchains.  While Ethereum supports a wide range of L2 applications/DAPP’s and DeFi, its services are constrained to the limitation of EVM’s (Ethereum Virtual Machine) and the Ethereum protocol.  With Cosmos and IBC DAPP’s and services are sovereign to make decisions and integrate at an L1 layer to maximize efficiencies, security or scalability to the specific needs of a project.

### Governance

The Cosmos network builds and maintains the IBC protocol.  ATOM, being the native token of the Cosmos network, enables [Validators](https://hub.cosmos.network/main/validators/validator-faq.html#what-is-a-validator) and [Delegators](https://hub.cosmos.network/main/validators/validator-faq.html#what-is-a-delegator) the ability to stake ATOM to secure the network and in return receive voting eligibility for new proposals.  Changes to the IBC protocol and other aspects of the Cosmos network must be approved by the community prior to implementation.  This gives anyone the ability who’s staking and/or validating the opportunity to influence the direction of the project.  While running a Validator node does take technical skills, Delegators can easily participate and are also highly encouraged to contribute to the governance process.

### Business Enablement

[_**Osmosis**_](https://app.osmosis.zone/) is the first Cosmos native interchain Decentralized Exchange or DEX and Automated Money Maker or AMM for short.  Osmosis facilitates the trade of Cosmos IBC enabled tokens such as ATOM, OSMO, AKT, LUNA, UST, etc.   More than that, it enables AirDrops, Staking, Voting, Liquidity Pooling and Analytics.

[**Sifchain**](https://sifchain.finance/) is an OMNI Chain Decentralized Exchange or DEX and Automated Money Maker or AMM.  The native token to Sifchain is ROWAN.  What makes Sifchain special is it enables token transfers among the top 20 blockchains and is IBC connected, BinanceChain, Bitcoin, EOS, Polkadot etc.  Becoming a Liquidity Provider on Sifchain can bring juicy APY’s (Annual Percentage Yield) depending on the pair!

[**Emeris**](https://emeris.com/) is a new OMNI Chain Decentralized Exchange or DEX and Automated Money Maker or AMM, developed by the Tendermint foundation.  Aims include multi-wallet support, access to diverse DeFi platforms, multi-chain staking, and a mobile application.  Emeris features the all-new [Gravity Bridge](https://github.com/cosmos/gravity-bridge#:~:text=Gravity%20bridge%20is%20Cosmos,chain%20and%20back%20to%20Ethereum.), which is a great segway to our next topic, the Ethereum network.

### Gravity Bridge and Cross Ecosystem Transfer of Value

The [Gravity Bridge](https://github.com/cosmos/gravity-bridge#:~:text=Gravity%20bridge%20is%20Cosmos,chain%20and%20back%20to%20Ethereum.) is a bi-directional bridge to the Ethereum network designed to run on the Cosmos network for maximum speed, efficiency and security.  With Gravity Bridge, ERC20 based tokens can be transferred to Cosmos chains and back to Ethereum.  The ability to transfer a Cosmos asset to the Ethereum network is in development and should be made available soon.

Cosmos secures over 140 billion USD in capital across 40+ applications and services and is growing all the time.  Just like a port city or Country may be measured by its value and velocity of trade or Gross Domestic Product (GDP), Cosmos will be valued by the amount of trade and liquidity that flows through it.  IBC will facilitate all of this by making it the standard protocol by which sovereign blockchains connect.  Cosmos and IBC interoperability will facilitate the internet of blockchains, which ensures transfer of value will continue to grow for a long time to come.

### Closing

Cosmos has a grand vision, building and connecting decentralized blockchain applications and services. Like a night sky filled with stars, we map the Cosmos with constellations such as Leo, Taurus and Orion.  IBC is what connects blockchains, like stars connected in a constellation.  IBC is the glue that’s building and connecting the Cosmos network to sovereign blockchains.  It’s the protocol that’s enabling the internet of Blockchains.  Imagine that for a second.  What value does or will the internet of blockchains have?
