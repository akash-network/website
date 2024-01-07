---
title: "Building the Supercloud for AI"
description: The world’s compute needs are increasing exponentially. With the rise of AI and machine learning, chip manufacturers are experiencing unprecedented demand, straining the global supply chain that transforms sand into silicon.

pubDate: "2023-06-23"
draft: false

categories:
  - Updates
tags:
  - Updates
contributors:
  - Zach Horn

bannerImage: ./banner-image.jpg


---

**The world’s compute needs are increasing exponentially.** With the rise of AI and machine learning, chip manufacturers are experiencing unprecedented demand, straining the global supply chain that transforms sand into silicon.

High demand, caused by a sharp increase in AI development and a constrained chip supply, contributes to a global GPU shortage that threatens to stall the development and proliferation of widely distributed AI models. More importantly, it threatens to concentrate the development of the most powerful AI models in the hands of a few corporations.

These corporations are often the only ones with the significant resources needed to acquire and operate these powerful GPUs, and they have rushed to capture and control the available supply.

Large cloud providers are no exception. Many of the largest cloud providers are strongly incentivized to focus on their largest customers, who are prioritized by their size and willingness to pay for expensive reserve instances — which involves committing to contracts that guarantee access to the most desirable GPUs. For everyone else, those GPUs are simply unavailable.

These incentives shape a market that often leaves many startups, researchers, and independent developers searching for compute.

## Enter the AI Supercloud

Akash introduced the world to an open-source marketplace for compute. Today, the network is taking the next significant step by launching a testnet for the first open-source marketplace for high-density GPUs — enabling anyone around the world to access a wide range of powerful GPUs for training, pre-processing, fine-tuning, and running inference.

The Overclock Labs team created and tested the first version of the Akash GPU Testnet. Now, the testnet is ready to bring in the community and the general public with over $100,000 of rewards for participants who complete tasks within four categories.

### Set up a GPU provider

Anyone, from independent developers to cloud providers, can set up a GPU Provider on the testnet. These providers will help ensure an adequate supply of compute resources to thoroughly stress-test the network, which is crucial for completing the other tasks.

The Akash GPU Testnet has already received interest from providers with NVIDIA H100s, A100s, and other leading datacenter and consumer GPU models.

### Deploy AI models

The next phase of the testnet will involve deploying various AI models onto each GPU type. As these models have different capabilities and sizes, these tests will help match each GPU type against the deployments it is best suited to handle.

For example, running inference on a smaller language model is best suited for older datacenter models or a consumer-grade GPU. On the other hand, performing fine-tuning on a larger model would likely require the compute power only found in the most capable GPUs — like the NVIDIA H100 or A100.

### Benchmark GPUs with PyTorch

This task will involve benchmarking the performance of each GPU type with PyTorch, a popular framework for machine learning.

This will give insight not only into the individual performance of each GPU type on Akash but also into the network's capabilities as a whole — which will be essential to communicate the value proposition of Akash to those who may be used to traditional centralized cloud providers.

### Create SDLs (Deployment specifications)

The Stack Definition Language (SDL) is a configuration file format that standardizes how deployers request compute resources from providers on Akash.

For the Akash GPU Testnet, one of the four main tasks will involve participants creating new SDL files for many of the leading AI models, tools, and apps. These new SDLs will be added to the [Awesome-Akash](https://github.com/akash-network/awesome-akash) repository, where Akash’s most popular SDLs are gathered for use by the general public.

## Join the Akash GPU Testnet

To learn more about each task, [read the complete overview for the Testnet](https://github.com/akash-network/community/blob/main/wg-gpu/GPU-AI-Incentivized-Testnet.md). This document has all the info you’ll need to get up and running with each task. To connect with the community, head to [Akash’s Discord](https://discord.akash.network). This is the best place to get support during the testnet and stay updated with the upcoming transition from the Akash GPU Testnet through the upgrade to Mainnet 6.
