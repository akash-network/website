---
title: "Building the Open Cloud, Part 2: Re-Imagining the Cloud With Akash"
description: This is the second entry in our four-part blog series. In this post, we build on our summary from Part 1, which focused on the key challenges in web3 infrastructure today.

pubDate: "2022-10-14"
draft: false

categories:
  - Insights
tags:
  - Insights
  - Product
  - Developers
contributors:
  - Anil Murty

bannerImage: ./banner-image.png
---

This is the second entry in our [four-part blog series](https://akash.network/blog/building-the-open-cloud-part-one). In this post, we build on our summary from Part 1, which focused on the key challenges in web3 infrastructure today. If you prefer to watch a presentation of this, you can find the recording [here](https://www.youtube.com/watch?v=jGqZzNWQrNs).

![](https://www.datocms-assets.com/45776/1665775012-screen-shot-2022-10-14-at-3-16-49-pm.png)

Before we dig in and talk about how Akash Network addresses these challenges, let's start with a refresher on how public clouds work today.

## The Status Quo for Public Cloud Infrastructure

Any public cloud today — AWS, Azure, Google Cloud, Alibaba, Tencent, Oracle, Digital Ocean, or any of the smaller players in the space — is structured around the idea of a single large entity (like Amazon, in the case of AWS or Microsoft in case of Azure) owning all the infrastructure. All users (thousands, if not millions) connect to that infrastructure through the interfaces that the cloud provider exposes.

![](https://www.datocms-assets.com/45776/1665775180-screen-shot-2022-10-14-at-3-19-38-pm.png)

The model above revolutionized the software industry. It enabled people to get started without the need to spin up and manage their own infrastructure. It lowered significant capital expenditure (CapEx) for small startups. The programmability of clouds also enabled things like elastic autoscaling and supported DevOps principles. The programmability of cloud infrastructure allows development teams to move faster by managing the infrastructure their applications run on without being dependent on operations teams. Their autoscaling nature also allows companies to keep costs low by fluidly scaling in response to demand.

While the things above have contributed immensely to the pace of innovation across many industries, they have some drawbacks.

- The cloud provider sets the price and you take it or leave it.
- The cloud provider decides where their infrastructure will be located. So, if they choose not to have a presence in your country or region, users of your application are forced to connect to a less-than-optimal location from a latency perspective.
- If one cloud service provider offers a better service for one thing (say, compute) and another offers a better service for something else (say, storage), it is hard if not impossible to use “the best of breed” for your application.
- The current model does nothing to address the underutilized infrastructure in the 7M+ datacenters around the world.
- The user experience for deploying on a given cloud provider is, for the most part, decided by that cloud provider.

## A Decentralized Vision

Imagine a decentralized version of a public cloud that addresses these concerns. It would look something like this:

![](https://www.datocms-assets.com/45776/1665775229-screen-shot-2022-10-14-at-3-20-16-pm.png)

Instead of a single, large entity owning and controlling all the infrastructure, you would have several smaller entities owning portions of the infrastructure. Users could choose which provider they want to run on — and if they choose, they could run on more than one provider.

While this solves some of the problems we outlined earlier, it introduces new ones. The users in this scenario are now faced with the daunting task of figuring out contractual agreements with multiple providers, each of which could be for different lengths of time. Assuming they figure that out, they would then have to figure out how to deploy to each of these providers, which may have different interfaces and feature sets. All this would take an army of legal, operations, and engineering talent — making the task unrealistic for a small company.

This is where Overclock Labs saw an opportunity and decided to build a solution.

## The Akash Network Approach

Overclock Labs pioneered a two-sided marketplace for cloud compute where “Tenants” lease compute resources from “Providers” to deploy their applications and services. Akash Network’s marketplace for cloud compute is a software abstraction layer that provides a consistent experience for users regardless of which provider they choose for their deployment.

![](https://www.datocms-assets.com/45776/1665775298-screen-shot-2022-10-14-at-3-21-36-pm.png)

There are clear benefits to this approach:

1.  Each provider sets its own price.
2.  The tenant has greater freedom of choice for their deployment. If they are willing to sacrifice reliability for lower costs, the decision to make that tradeoff is left to the user.
3.  If a provider chooses to drop a tenant’s application or service for arbitrary reasons, the tenant has greater optionality to avoid serious downtime.
4.  This model allows the underutilized capacity in the 7M+ datacenters to be brought to market, making it more environmentally sustainable.
5.  As the network grows, the user’s options for geographic locations scale non-linearly, so their application achieves lower (read: better) latency and response times.

In addition, Akash is an open-source, community-driven network that is powered by a blockchain. This means that it adheres to a governance model that has been proven by many other open source projects and other blockchains.

![](https://www.datocms-assets.com/45776/1665775331-screen-shot-2022-10-14-at-3-22-09-pm.png)

## Akash Network “Under the Hood”

If the above has you excited to learn more, here is a quick overview of how Akash Network works.

Akash is built on Open Source Software (OSS). The two major technologies that Akash uses are [Docker](https://www.docker.com/) and [Kubernetes](https://kubernetes.io/). Docker is the world's most widely used container technology and Kubernetes is the world’s most popular container orchestrator.

![](https://www.datocms-assets.com/45776/1665775391-screen-shot-2022-10-14-at-3-23-08-pm.png)

Providers on Akash Network run [Kubernetes clusters](https://kubernetes.io/docs/concepts/architecture/) and Tenants (users of Akash Network) deploy their applications as Docker containers onto these Kubernetes clusters.

A typical deployment workflow on Akash looks like the block diagram below:

![](https://www.datocms-assets.com/45776/1665775430-screen-shot-2022-10-14-at-3-23-44-pm.png)

Tenants begin by containerizing their application into a docker image so it is portable (can be easily moved between providers). Then, they include a reference to that image in an SDL file. SDL stands for “Stack Definition Language” and, as the name suggests, is a way for users to specify which infrastructure stack they would like for their application. The SDL file includes compute needs, locations, and pricing.

Once as SDL file is prepared, it is submitted to the Akash marketplace as a _“request for bids”_. Akash software takes the information contained in the SDL file and broadcasts it to all the providers on the Akash marketplace (more than 50 at the time of writing). The providers inspect the request and decide if it is something that they can satisfy. If a provider decides that it can satisfy the request — it responds with a bid.

The tenant ends up with a set of bids from the providers that respond. The number of bids can range from a few to a few dozen, depending on the request. Then, the tenant decides which bid suits their needs. They may decide to choose a lower-cost provider, even if that provider lacks features. Once the user selects a provider and instructs Akash to deploy, the application container is scheduled to run on the provider and, within a few minutes, the application is deployed and running.

To summarize, it is a simple, four-step process:

1.  Create SDL File 📁
2.  Request a bid 💲
3.  Choose a provider 🤝
4.  Deploy! 🚀

In case you are wondering what an SDL file looks like, here is an example of one that is used to spin up a Tetris game on the web. Let’s break it down and understand the various parts.

![](https://www.datocms-assets.com/45776/1665775495-screen-shot-2022-10-14-at-3-24-52-pm.png)

The SDL file answers five questions to help Akash decide which provider to choose and how to deploy the app:

1.  **Which app(s) or service(s) would you like to run?** In this case, it is a version of the game, Tetris, as indicated by the \`image:bsodr/tetris\` reference — which points to a publicly available docker image located [here](https://hub.docker.com/r/bsord/tetris/tags).
2.  **What infrastructure resources do you need to run the deployment?** This is where you indicate the required amount of CPU, memory, and storage.
3.  **Where (location or provider specifics) would you like to run it?** This tells Akash if you have a preference for certain audited attributes (more on auditors in our forthcoming ecosystem post) or locations for the provider.
4.  **How much are you willing to pay the provider to host the deployment?** This is where you specify the maximum amount you’re willing to spend, which will then be used in a “reverse auction” on the marketplace.
5.  **How many replicas do you want to run?** This is pretty self-explanatory.

And, that’s it! Isn’t that way easier than you thought it would be? There are many people hard at work at Overclock Labs as well as in small teams of independent developers within the Akash community who are building deployment and provider set-up solutions. This will make the process of interacting with Akash Network much easier. Eventually, someone with little to no technical expertise can operate on Akash. Stay tuned for subsequent posts that will dig into some of these products.

Meanwhile, if you are eager to get started, head over to Akash Network’s [documentation](https://akash.network/docs/).
