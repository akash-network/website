---
title: "Introducing Akash"
description: This week we introduced The Akash Network to the world with a press release and the open sourcing of our software. You can learn about Akash to your heart’s content by visiting our site or reading our light paper (a friendly version of the traditionally-impenetrable crypto whitepaper), so I’ll dispense with a long description of Akash to focus instead on something more meta

pubDate: "2018-03-25"
draft: false

categories:
  - News
tags:
  - News
contributors:
  - Nick Alesandro

bannerImage: ./banner-image.jpg
---

This week we introduced The Akash Network to the world with a press release and the open sourcing of our software. You can learn about Akash to your heart’s content by [visiting our site](https://akash.network/) or [reading our light paper](https://akash.network/paper.pdf) (a friendly version of the traditionally-impenetrable crypto whitepaper), so I’ll dispense with a long description of Akash to focus instead on something more meta: **why** we’re doing this and **how** we’re going to do it.

## The Akash tl;dr

First, in case you didn’t read the whitepaper, here’s **what** we’re doing:

Overclock Labs is a company whose projects include the Akash Network. The Akash Network allows companies with idle server capacity (there are a lot of them) to make it available for cloud deployments. Developers who want to deploy to Akash specify their deployment criteria in a declarative file posted to our native blockchain, where it’s picked up and bid on by any provider capable of meeting the criteria. Low bid wins and then the parties move off chain to distribute the workload in Docker containers. Once a workload is live, the agreed-on count of Akash tokens is transferred from the tenant’s wallet to the provider’s wallet on a periodic basis for as long as the workload is live, with all that settlement activity written to chain.

## Why Akash?

We’re on a bit of a mission. Today’s cloud infrastructure providers have a real oligopoly, which allows them to charge non-commodity prices for commodity compute, [inhibits real competition](http://www.platformonomics.com/2017/04/follow-the-capex-cloud-table-stakes/), and crowds out open-source projects. We think that’s wrong. Wrong for companies and individuals that use cloud compute; wrong for their customers to whom costs are ultimately passed; and wrong for society as a whole because one of its basic building blocks is controlled by three huge companies. [I wrote about the situation in more depth here](https://blog.akash.network/2018/03/19/decentralized-infrastructure-is-a-moral-issue/).

### Distribute then decentralize

While the current cryptocurrency landscape is [undeniably fascinating](https://youtu.be/e5nyQmaq4k4?t=42s), the real power of blockchain lies in its ability to create a cryptographically-enforced, **distributed**, and open source of truth. [From banking to real estate to voting to identity to file storage and more](https://hackernoon.com/popular-use-cases-of-blockchain-technology-you-need-to-know-df4e1905d373), we’re entering a technological era where “trusted” (serious quotes around that one) central sources of truth are not always necessary. Central authorities are inherently vulnerable and even corruptible — but even when working as designed they’re not always incented to act on behalf of the communities they serve. So public companies are obligated to [maximize shareholder value](https://www.marketwatch.com/story/amazon-is-worth-so-much-because-aws-is-techs-true-unicorn-2017-04-27), not, say, to work toward fairly-priced cloud infrastructure.

A distributed approach is perfect for cloud infrastructure because the ideal cloud is **decentralized**, with thousands of globally-distributed points of presence — way more than the handful of hyperscale datacenters offered by big providers. So how to build and run this ideal cloud?

Using a centralized approach, we’d make a massive capex investment to build out those points of presence. Instead we use the capacity that’s already present in thousands of companies’ on-prem and colo datacenters.

Using a centralized approach, we’d make a massive opex investment to manage, support, collect/distribute revenue, AND assume liability for the network. Instead we use blockchain to connect providers and tenants as peers and to allow direct payments between peers.

Using a centralized approach, we’d make another massive investment of time and resources to build a new brand that users trust with their workloads. Instead we use blockchain to ensure every marketplace transaction is visible to everyone, including payment histories and adverse events — so users can trust facts instead of a brand.

In other words, we’re using blockchain’s natural strength as a distributed and open source of truth to facilitate the development of decentralized cloud infrastructure. Not for nothing, this approach also allows a small project like ours to present a credible alternative to the hyperscale, centralized providers.

### Transparency

[We are indeed living in interesting times](https://en.wikipedia.org/wiki/May_you_live_in_interesting_times). Technology-driven decentralization will affect the social and political domains in unpredictable ways. Token sale-driven funding models will affect which types of projects become viable and how they grow, again in unpredictable ways. And from a purely technological perspective, blockchain is new and will evolve rapidly and unpredictably, with new capabilities forming a feedback loop with social, political, commercial, and of course [regulatory](https://www.wsj.com/articles/sec-launches-cryptocurrency-probe-1519856266) domains.

So here we are in the [early days of something big](https://www.pcmag.com/article/351486/blockchain-the-invisible-technology-thats-changing-the-wor), and we’re all (yes all of us) pretty much figuring it out as we go. We’re drawing on historical precedents, making mistakes, enjoying successes, and reasoning our way through innumerable issues. And we’re doing all this while working with a technology that is inherently open and transparent. So we, and the organizations we belong to, must also be open and transparent. It’s the right thing to do.

It’s the right thing to do because we learn from one anothers’ mistakes and successes. It’s the right thing to do because admitting you don’t know something opens a path to learning — both for yourself and for those unwilling to admit it. It’s the right thing to do because investors and customers deserve full information to make effective decisions. It’s the right thing to do because the technology demands it. And, at the risk of hyperbole, it’s right because history needs a contemporaneous record of how this all went down.

With this in mind, we’ve made a firm commitment to transparency. The software that drives the Network is still under development, but we’ve open sourced it now. [Follow our progress, warts and all, on GitHub](https://github.com/ovrclk/akash/). We actively communicate with our investors and [make our monthly investor letters public](https://github.com/ovrclk/updates/) (full disclosure, we do sanitize them slightly). And more softly, we’re committed to using direct and plain language in all our communication and equally committed to responsiveness with our [growing telegram community](https://t.me/AkashNW). We’re grateful to other transparent projects in the space and look to them for ways to improve. Let’s make transparency a default expectation — let’s be brave!
