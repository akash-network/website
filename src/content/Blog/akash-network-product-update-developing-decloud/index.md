---
title: "Akash Network Product Update: Developing DeCloud"
description: With our Mainnet 1 launch and IEO on BitMax last month, we achieved key milestones to secure the Akash Network and achieve liquidity for Akash Token (AKT), developing a strong foundation for our platform.

pubDate: "2020-11-17"
draft: false

categories:
  - Updates
tags:
  - Updates
contributors:
  - Adam Bozanich

bannerImage: ./banner-image.png
---
With our Mainnet 1 launch and IEO on BitMax last month, we achieved key milestones to secure the Akash Network and achieve liquidity for Akash Token (AKT), developing a strong foundation for our platform. 

In parallel, our Engineering and Product teams have accelerated platform functionality in preparation for The Akashian Challenge: Phase 3 Testnet, and Mainnet 2, soon after, to materialize Akash DeCloud.

Today, we’re excited to launch our biweekly _Developing Decloud_ Product Update to share more about the development of our platform and products with you.

####   
**Akash DeCloud Development Update**  
**\_\_\_\_\_**  

**Improved Bid Pricing**

Previously, a provider was only able to specify their bid pricing based on the memory requested for a given job. This worked as a proof of concept, and for internal and small scale testing, but we need a more robust pricing configuration system for real world applications. 

Providers [can now set](https://github.com/ovrclk/akash/pull/904) pricing based on parameters such as CPU count, storage capacity, and endpoints!

  
**Support for TCP & UDP**

Until now, Akash only supported client traffic via the HTTP application protocol on port 80. HTTP supports virtual host routing which enables routing to multiple endpoints or tenants. However, Akash must support non-HTTP traffic and different protocols, and route to the appropriate tenant applications. 

An Akash endpoint consists of two components, a host name or IP address, and a unique port chosen at random. [This enables routing](https://github.com/ovrclk/akash/pull/904) to multiple unique application endpoints for a deployment, and allows users to choose which transport protocol the ingress router needs to support, either TCP or UDP.

  
**Audited Attributes**

We’ve been working on a system called “[Audited Attributes](https://github.com/ovrclk/akash/pull/905)”, which will allow users deploying applications to be more selective about which providers can run their apps. Anyone on the Akash blockchain can assign these attributes to Providers via an on-chain transaction.

But the goal is for reputable persons or companies to be able to vouch for Providers by assigning them these audited attributes, and users can select Providers whose attributes fit their deployment needs.  

  
**Preparation for The Akashian Challenge Phase 3 Testnet**

To prepare for the upcoming [The Akashian Challenge Phase 3](https://akash.network/blog/the-akashian-challenge-phase-3-teaser/) testnet, we’re progressing a number of features including Audited Attributes, and implementation of the long-awaited Inter-Blockchain Communication protocol (IBC), which spans across the entire Cosmos ecosystem.

####   
**Inter-Blockchain Communication (IBC) Development Update**  
**\_\_\_\_\_**

**Typed Events**

[Typed events have been merged](https://github.com/cosmos/relayer/pull/324) upstream on the Cosmos SDK and work has begun on the relayer implementation. This fix makes it easier for clients to consume events from all Cosmos SDK-based chains. These include active validator set changes, delegations, governance proposals, and other chain specific events. 

When you’re watching new blocks show up on a block explorer, for example, these are events, and previously the code to implement them was complex and unruly. Typed events will make coding event-driven applications much simpler to write. 

Akash pushed these changes to the Cosmos SDK, as we’re maintaining three of these types of applications: the provider daemon, the relayer, and the deploy daemon.  

  
**API Server**

[We’ve also started work](https://github.com/cosmos/relayer/pull/323) on the API server. Presently, the relayer functions only via the command line interface, meaning there is no way to programmatically interact with it besides writing bash scripts against the command line tool. This work allows the relayer to expose an RPC server that enables a user to make common queries and use all the relayer functionality against a programmatic HTTP interface, i.e. a website. 

Under the contract we have with the Interchain Foundation (ICF), one of the deliverables for the relayer is to expose this functionality via a REST interface. This will allow for remote management of relayer nodes.

  
**Testnets**

IBC has gone through major security audits, and is currently undergoing final preparations for the v1.0 release, which is a part of Cosmos SDK v0.40. Alongside this release, there will be v1.0 of the relayer, which functions as the secure bridge between IBC compatible chains. 

To ensure compatibility, there will be a number of upcoming testnets that will connect multiple validator testnets between a number of ecosystem organizations including Akash, Agoric, Cosmos, and CosmWasm!

####   
**What’s Next?**  
**\_\_\_\_\_**

*   Hands-on testing and bug fixing, including documenting and addressing possible workflow improvements
    
*   Reviewing and supporting a security audit.
    
*   Preparing for Testnet v3: documentation, guides, examples.  
      
    

####   
**Don’t Miss the Latest Akash Network Product Updates**  
**\_\_\_\_\_**  

Join our [Discord dev](https://discord.akash.network) chat for technical support and information.

Join our [Telegram](https://t.me/AkashNW) for the latest Akash Network platform, product, and Akash Token (AKT) updates and announcements.