---
title: "Akash DeCloud: From Phase 3 to Mainnet 2"
description: Through running three phases of The Akashian Challenge, one of the ecosystem’s most ambitious testnets, we’ve been able to gather data, identify critical issues, and ensure our network’s scalability, security, and usability before launching our DeCloud Mainnet 2.

pubDate: "2020-12-23"
draft: false

categories:
  - Updates
tags:
  - Updates
contributors:
  - Adam Bozanich

bannerImage: ./banner-image.png
---

Through running three phases of The Akashian Challenge, one of the ecosystem’s most ambitious testnets, we’ve been able to gather data, identify critical issues, and ensure our network’s scalability, security, and usability before launching our DeCloud: Mainnet 2.

In the initial phases of The Akashian Challenge, we tested governance and voting, and improved the process for network upgrades to strengthen our platform. These explorations gave us critical insights on how to build a healthy and vital community for growth, and led to the successful [launch of our Mainnet 1](https://akash.network/blog/announcing-akash-mainnet-live-and-bitmax-ieo/) with a full 64-validator set.

In Phase 3, we integrated performance enhancements from Cosmos SDK v0.40, and tested Akash DeCloud’s deployment platform.

With 500,000 Akash Token (AKT) in rewards and hundreds of participants joining from around the world, [The Akashian Challenge Phase 3: Developer Operations](https://akash.network/blog/the-akashian-challenge-phase-3-rewards-overview/) included guided challenges for deploying applications of increasing complexity — from simple single-page applications to blockchain network components, and open ended challenges where participants could show off their Akash OPS skills by extending the guided examples to deploy any application they desired — from DeFi to CI.

We also offered additional rewards for participation outside of the deployment challenges, including active validator participation, writing blog posts and how-to guides, and sharing novel uses of our platform.

We set out with the following goals:

- Test platform functionality for Mainnet 2

- Distribute tokens to potential users for Mainnet 2

- Build a catalog of applications (SDLs) to launch Mainnet 2

_So how did we do, and how is Phase 3 helping us build a stronger Mainnet 2?_

#### **Recap of The Akashian Challenge: Phase 3 Testnet**

\_\_\_\_\_

I’m thrilled to share that over only two weeks, Phase 3 testnet participation, deployments, and learnings, exceeded our expectations.

By the metrics alone:

- **3600+ applications deployed**

- **460+ developers**

- **149 registered validators**

During Week 1, Forbole deployed their Big Dipper block explorer on Akash DeCloud, making it the first instance of a prominent block explorer to migrate from centralized cloud to decentralized cloud.

Additionally, Serum DEX UI became the first instance a major DeFi project is hosted on the DeCloud.

In Week 2, we had mind-bending Inception-style deployments, as Challengers deployed an Akash node on Akash. Challengers also deployed video games and well-known DeFi apps on Akash including SushiSwap and UniSwap.

By having its frontend deployed on Akash’s decentralized cloud, UniSwap can provide its users unstoppable access to $1.4 billion of liquidity that can’t be shut down by centralized cloud providers.

During all this action, Akash surpassed 1,000,000 blocks.

Among the coolest Awesome Akash apps deployed:

- **DeFi** - SushiSwap & UniSwap

- **Blog** - Ghost & Wordpress

- **Games** - DOOM & Super Mario

- **Databases** - mongoDB & MySQL

- **Data Visualization** - UFO Sightings

- **Block Explorers** - Big Dipper & Aneka

You can check out the [full Awesome Akash list](https://github.com/ovrclk/awesome-akash) for more.

#### **The Journey to Mainnet 2**

**\_\_\_\_\_**

Among the learnings from Phase 3 that we’ll leverage for Mainnet 2:

**Tendermint’s State Sync works!** After some tinkering, we discovered a way to use state sync to quickly bring up nodes. This is great for developers who want to quickly bring up a node for any number of uses - querying the blockchain, using a web wallet, etc.

We identified **pain points in the deployment process,** which currently requires multiple transactions and is quite cumbersome. We’re now developing a tool to streamline the process.

We also realized we need **better feedback (logs) when deployments are failing**. If an application uses too much memory, it terminates without telling the user specifically why. The \`command\` and \`args\` service fields of the SDL file aren't documented well enough. The service won’t start if these fields are not inputted correctly. We now know we’ll need to add validation up-front for items like invalid environment or service names.

We discovered that **inventory management needs tuning**. Under heavy load, there were cases where the provider would bid on orders that it didn’t have sufficient capacity to run. These deployments would wait for other workloads to complete, but if that didn’t happen in time, the workload would time out and be killed.

Ultimately, our aim was for Phase 3 to accelerate our vision for a decentralized cloud computing marketplace by serving as the launchpad for Mainnet 2. We’ll continue to study the data and feedback from Phase 3 and leverage the learnings to strengthen Mainnet 2.

_**Stay tuned for more information on Akash DeCloud: Mainnet 2, launching early in Q1 2021.**_

#### **Don’t Miss Critical Phase 3 Updates**

**\_\_\_\_\_**

Join our [Discord dev](https://discord.akash.network/) chat for technical support and information.

Join our [Telegram](https://t.me/AkashNW) for the latest Akash Network and AKT announcements, events, and giveaways.
