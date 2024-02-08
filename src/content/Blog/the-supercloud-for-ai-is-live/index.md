---
title: "The Supercloud for AI Is Live"
description: "Starting today, Akash is launching capabilities for its Supercloud to offer GPUs - The network now supports NVIDIA GPUs, with options for others such as AMD in the future - The network has successfully hosted NVIDIA H100s and A100s, plus a range of consumer-grade GPUs - Access to consumer-grade GPUs is one way the Akash Supercloud stands apart"

pubDate: "2023-08-31"
draft: false

categories:
  - Updates
tags:
  - Updates
contributors:
  - Zach Horn

bannerImage: ./banner-image.png
---

- Starting today, Akash is launching capabilities for its Supercloud to offer GPUs
- The network now supports NVIDIA GPUs, with options for others such as AMD in the future
- The network has successfully hosted NVIDIA H100s and A100s, plus a range of consumer-grade GPUs
- Access to consumer-grade GPUs is one way the Akash Supercloud stands apart

Silicon is the story of the next decade – and the next big chapter for Akash. The industry that turns sand into semiconductors, and then into fabricated chips, weaves together a network of suppliers, chip fabricators (fabs), manufacturers, and cloud service providers around the world, all of whom coordinate to serve a market hungry for compute to power the development of the greatest invention of the modern era — AI.

Upstream, the market is controlled by massive multinational players. The largest is the Taiwan Semiconductor Manufacturing Company (TSMC), which [controls 55.5% of the worldwide foundry market](https://www.idc.com/getdoc.jsp?containerId=prAP50994023#:~:text=The%20leading%20vendor%2C%20TSMC%2C%20has,pick%20up%20further%20in%202023). At the unit manufacturing level, NVIDIA, AMD, and others manufacture these chips into Graphics Processing Units (GPUs). The GPUs these companies produce are highly sought after for their ability to run processes in parallel — an ability tailor-made for the complex operations required by AI.

As a result of the proliferation of capable Large Language Models (LLMs) and AI applications, high-performance GPUs are experiencing the highest demand surge in recent history. Everyone, from the largest corporations to the most agile startups, is scrambling to secure access.

## The Distribution and Demand for GPUs

As the most in-demand GPUs make their way to market, they are distributed primarily to corporations and hyperscale cloud service providers (CSPs), who have the vast resources needed to acquire and operate these high-priced GPUs. For hyperscale cloud providers, access to these GPUs represents a strong selling point and offers a way to attract customers who prefer to access compute on-demand.

For those looking for on-demand compute, it’s not always easy to find. Users of CSPs are forced to accept permissioned access and the risk of vendor lock-in, and this is only if the desired GPU units are even available. Given the intense demand, it’s common for the highest-performance GPUs to be prioritized for reserved instances, in which the cloud service provider “pre-sells” or reserves access to specific quantities of GPUs for a predetermined length of time. These reserve instances are often expensive and are often prioritized for the largest customers who see cost as secondary to control and access.

## Building the Open-Source Supercloud for AI

Akash addresses these inefficiencies with the first operational Supercloud, a “cloud of clouds,” or a way to permissionlessly access compute resources – including GPUs – from a range of providers, from independent to hyperscale. The network that powers the Supercloud has been in the making for nearly seven years. During that time, it has matured and been battle-tested across various cloud services and specific use cases. The network has onboarded cloud resource providers and coordinated leases for compute resources with deployers around the world.

Each major iteration of the network’s development is marked by a Mainnet upgrade. During these upgrades, the network migrates to a new version of the network code. Each Mainnet upgrade brings new features to the network. Today, the network is completing one of the most significant Mainnet upgrades.

## Mainnet 6: The Akash GPU Mainnet

The network’s sixth Mainnet upgrade brings GPU support, Stable Payments, and Take Rates to Akash. Starting today, providers on the network will be able to offer GPU resources to deployers around the world, and both providers and deployers will have access to USDC settlement. At settlement, the network will begin capturing value via Take Rates on both USDC and AKT.

The upcoming mainnet upgrade will bring the following features to Akash.

### GPU Marketplace

The main feature of the upgrade will enable an open-source marketplace for high-density GPUs. This will be accomplished by adapting Akash’s existing Supercloud infrastructure to allow network providers to support GPUs. This initial upgrade will focus support and testing on NVIDIA, given the AI and machine learning industry’s preference for NVIDIA GPUs. In the future, the network will focus support and testing on other manufacturers, including AMD and others.

GPU support has already been [validated in the Akash GPU Testnet](https://akash.network/blog/testing-the-first-ai-supercloud/) (a public beta test of the GPU network features, AI deployments, and benchmarking). Over 1,300 people signed up to participate, and the testnet hosted NVIDIA H100s, and A100s, along with consumer-grade GPUs from the 30-series and 40-series. Access to consumer-grade GPUs is one way the Akash Supercloud stands apart from other cloud providers. These models are typically overlooked, even though they can often run inference on less memory-intensive AI models. The flexibility to choose from the widest possible range of GPUs makes the Supercloud powerful.

### Stable Payments

The second most anticipated feature of the upgrade is the addition of Stable Payments, which is part of the [larger AKT 2.0 initiative](https://github.com/orgs/akash-network/discussions/32). Although many features and advantages are built into AKT, Akash’s native utility token, any token with inherent volatility presents a challenge to long-term providers and deployers. Significant price movements can drastically change the value of the cloud services rendered as part of the lease agreement coordinated through Akash’s open marketplace. One solution to the long-term volatility challenge is to incorporate alternative settlement currencies. For the rollout of Stable Payments, that currency will be USDC, a stablecoin pegged to the U.S. dollar. In the future, additional settlement currencies can be added with a simple governance proposal.

### Take Rates

For the network to capture value and direct resources toward building the network and rewarding participants, there must be a mechanism for the network to capture value.

The mechanism for capturing value at the network level is called Take Rates. These rates are applied to each lease and can be changed at any time with a governance vote. The network Take Rates will initially be set at 4% for AKT and 20% for USDC.

[Read the original draft proposal of both Stable Payments and Take Rates](https://github.com/orgs/akash-network/discussions/147) for an overview of the specific features of each.

## Joining the Supercloud

The world is waking up to a new technological landscape, shaped by the exponential growth of AI, that carries a vastly higher demand for compute. As upstream manufacturers experience bottlenecks and logistical hurdles, access to GPU compute becomes an existential risk to downstream players like startups and cloud service providers.

This is why now is the perfect time to bring GPUs to the Supercloud. As the network grows, it will only become more powerful, hosting greater and greater quantities of GPUs from providers around the world while becoming an integrated part of the infrastructure powering AI development. It is more important than ever that these challenges are addressed with a fully open-source network — which prevents control of these resources from concentrating in the hands of a few large corporations.

---

_Learn more about the Supercloud from a technical perspective with the [Akash Docs](https://akash.network/docs/). If you are interested in becoming an Akash Provider, see the [Provider setup guides](https://akash.network/docs/providers) in the documentation, and connect with the [Akash Community on Discord](https://discord.akash.network) for individual support._

_To deploy on Akash, get started with [Akash Console](https://console.akash.network) and [Cloudmos Deploy](https://deploy.cloudmos.io/) — two open-source deployment applications that make it easy to get up and running on the Supercloud._

_If you are interested in accessing high-performance GPUs, head to [AkashML](https://akashml.com/) to see available GPU models and reserve now._
