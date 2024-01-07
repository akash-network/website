---
title: "Building the Open Cloud, Part 1: The State of Web3 Infrastructure"
description: By Anil Murty, Head of Product at Overclock Labs

pubDate: "2022-10-05"
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

_By Anil Murty, Head of Product at Overclock Labs_

I joined Overclock Labs, the creators of Akash Network, nearly four months ago to lead our product efforts. In that time, I’ve seen exciting developments in our products and those built by a growing number of independent teams that are part of the Akash Network ecosystem. Several developments in the web3, crypto, and cloud computing markets have reinforced our vision and company mission.

This series of four articles will summarize how I see those developments, starting with this article—which explores the current state of web3 infrastructure and the challenges that remain to be solved. The second article will delve into Akash Network’s approach to solving those challenges. The third article will describe some of our latest product efforts in making it easier to deploy on Akash. The fourth article will highlight several projects from Akash’s ecosystem that are contributing their efforts to our vision.

If you prefer listening over reading, [my talk at Messari Mainnet covers much of this content](https://youtu.be/jGqZzNWQrNs?t=10).

## The State of Web3 Infrastructure

While there is plenty that can be said when it comes to Web3 infrastructure across the different layers (L1-L3), for this discussion, I want to focus on three areas:

- The current state of Layer 1 blockchain infrastructure.
- How infrastructure cost impacts the decentralization of chains.
- How better infrastructure and tooling can increase developer traction in Web3.

## The Infrastructure Powering Top DApps Is Centralized

Ethereum and Solana are arguably two of the most popular chains among developers who build Decentralized Apps (DApps). Based on [stats published by State of the DApps](https://www.stateofthedapps.com/stats/platform/ethereum#new), Ethereum runs nearly 3,000 DApps.

![](https://www.datocms-assets.com/45776/1664975700-screen-shot-2022-10-05-at-9-14-49-am.png)

These DApps are powered by Ethereum’s network of ~450K validators (source: [https://beaconscan.com/stat/validator](https://beaconscan.com/stat/validator)), which is impressive.

![](https://www.datocms-assets.com/45776/1664985200-screen-shot-2022-10-05-at-11-53-07-am.png)

If you dig deeper, you’ll see that five validator platforms own 75% of the staking pool, with the largest of them, Lido Finance, making up nearly 30%. (Source: [https://beaconcha.in/charts/pools_distribution](https://beaconcha.in/charts/pools_distribution))

![](https://www.datocms-assets.com/45776/1664985365-screen-shot-2022-10-05-at-11-55-41-am.png)

If we dig yet another layer deeper, things look even more centralized at the “bare metal” infrastructure layer. 75% of Ethereum’s mainnet nodes run on three service providers: Amazon, Google, and Hetzner. (Source: [https://ethernodes.org/networkType/Hosting](https://ethernodes.org/networkType/Hosting))

![](https://www.datocms-assets.com/45776/1664985516-screen-shot-2022-10-05-at-11-58-31-am.png)

The chart above looked different only a few weeks ago. Hetzner and Google swapped places over the course of a few weeks (we’ll cover how that happened shortly). The chart below shows how things looked in early September 2022:

![](https://www.datocms-assets.com/45776/1664985457-ethernodes-org.png)

Although a similar chart doesn’t seem to exist for Solana, I did find several articles talking about how more than a third of Solana’s node infrastructure is also dependent on Amazon (AWS). See this article from [CoinRivet](https://coinrivet.com/it/amazon-hosts-37-of-actively-staked-sol-could-this-be-a-solana-kill-switch/):

![](https://www.datocms-assets.com/45776/1664985571-solana.png)

The obvious takeaway from these stats is that the core (Layer 1) infrastructure that powers many popular chains and, therefore, most DApps are fairly centralized. This presents a huge risk to the Web3 ecosystem as a whole. For instance, if Amazon decided tomorrow that it wants nothing to do with crypto or chooses to build its own chain to compete with Ethereum—it would cause significant disruption to the entire Web3 space.

If you think my concern is overblown, think again. One month ago, this is what Hetzner [decided to do](https://cointelegraph.com/news/hetzner-anti-crypto-policies-a-wake-up-call-for-ethereum-s-future):

![](https://www.datocms-assets.com/45776/1664985640-hetzner-1.png)

![](https://www.datocms-assets.com/45776/1664985671-hetzner-2.png)

This news is the likely reason for the increase in nodes deployed to Google Cloud over the last few weeks.

Now, you may be thinking that in the worst-case scenario, where all the major public clouds decide to become “closed” or anti-crypto, there are always independent data centers around the world where node operators could lease compute capacity.

In theory, that is true. In practice, the story is a little different. Leasing space in an independent data center is a manual, high-touch process relative to self-serve clouds like AWS. Independent data centers can involve significant capital expenditure (CapEx) if you intend to [co-locate](https://en.wikipedia.org/wiki/Colocation_centre) your infrastructure. There is reason to believe that the ease of use of self-serve public clouds has decreased the total number of data centers worldwide—from about 8.5 million in 2015 to about 7.2 million in 2021.

(Source: [https://www.statista.com/statistics/500458/worldwide-datacenter-and-it-sites/](https://www.statista.com/statistics/500458/worldwide-datacenter-and-it-sites/))

![](https://www.datocms-assets.com/45776/1664987339-screen-shot-2022-10-05-at-12-28-46-pm.png)

While the number of data centers worldwide has declined in the last six to seven years, there are still an estimated 7.2 million data centers across the globe.

On average, only 15-20% of the compute capacity within these data centers is fully utilized.

Anything we can do to more efficiently utilize excess compute capacity in these data centers would not only benefit the people running these businesses but would also benefit the planet from the standpoint of environmental sustainability.

## Low-Cost Infrastructure Is the Key to Decentralization

Let’s assume we will keep running our Web3 node infrastructure in public clouds for the foreseeable future. What implications does this have on decentralization from a pure cost perspective?

One of the greatest misconceptions that people have about running workloads in public clouds is that it is _always_ cheaper than running those workloads in a data center. While this is often true for small teams and projects with small resource requirements, as those teams and projects scale, this becomes less and less true.

But don’t just take my word for it. Andreesen Horowitz (a16z), arguably the biggest name in Web3 venture capital, called the cost of the public cloud a “Trillion Dollar Paradox” in a [blog post published in 2021](https://a16z.com/2021/05/27/cost-of-cloud-paradox-market-cap-cloud-lifecycle-scale-growth-repatriation-optimization/).

![](https://www.datocms-assets.com/45776/1664986059-a16z-1.png)

a16z arrived at this thesis after studying the cost structure of several well-known public companies, including Palantir, Slack, Snowflake, Datadog, and Asana. They found that, on average, these large enterprise SaaS companies spend about 50% of their revenue on public cloud hosting.

![](https://www.datocms-assets.com/45776/1664986150-screen-shot-2022-10-05-at-12-09-05-pm.png)

Assuming the cost structure looks similar for the consumer apps we all use (Doordash, Grubhub, Lyft, Uber, Spotify, and others), this means that for every dollar you spend on these apps, nearly $0.50 is paid to a public cloud provider. a16z’s mission is to find the next multi-billion dollar opportunity. Right now, they consider this to be the biggest opportunity in infrastructure.

From _The Cost of Cloud, A Trillion Dollar Paradox_:

![](https://www.datocms-assets.com/45776/1664986255-screen-shot-2022-10-05-at-12-10-39-pm.png)

Cloudflare, whose CDN and reverse-proxy infrastructure [powers nearly 80% of all websites](https://kinsta.com/cloudflare-market-share/), provides another data point related to cloud costs. In a blog post from July 2021, Cloudflare calls egress cost on AWS “...egregious.”

![](https://www.datocms-assets.com/45776/1664986312-cloudflare-1.png)

Egress cost is what AWS’ customers pay to pull data (their own data!) out of AWS. While AWS charges nothing to bring data into AWS (the ”ingress cost”), it charges an arm-and-a-leg to pull data out of AWS. Rather than charging based on the size of the pipe a customer connects to AWS with, Amazon charges based on the amount of data you pull through that pipe. This starkly contrasts how a person is charged for their home broadband connection, where they pay the same cost (based on upload and download speeds) regardless of whether that person watches Netflix for three hours every day or simply uses their email and browses the web.

While AWS charges its customers for the amount of data they pull through (and not the rate at which it flows), it pays the service provider based on the rate at which the data flows (and not the amount of data). In other words, this is the way that AWS makes it expensive to switch to another provider—while earning a pretty penny every time their customers pull out data. The most important thing to keep in mind is that while AWS hasn’t changed its stance despite Cloudflare and others calling it out, most data centers in the world today provide “unmetered bandwidth” where you pay a fixed cost based on the size of the connection rather than the amount of data you pull. This is yet another reason to consider deploying on one of those 7.2M data centers.

What does all this have to do with decentralization? It’s simple: As the Web3 space increasingly transitions to Proof-of-Stake (PoS) consensus mechanisms, the role of validators becomes more and more critical to ensure chain security. As such, the more validators the chains have, the greater the security of the chains and, in turn, the DApps running on those chains. For there to be more validators, the cost of spinning one up must be low enough that nearly anyone can run a validator node. In other words, the lower the cost of the infrastructure to host validator nodes, the more decentralized these chains become.

![](https://www.datocms-assets.com/45776/1664986414-screen-shot-2022-10-05-at-12-13-28-pm.png)

## Developer Traction in Web3

Outside of cost and security, the third biggest factor preventing Web3 applications from going mainstream is the availability of talented dApp developers. Here is a [chart from Electric Capital](https://medium.com/electric-capital/electric-capital-developer-report-2021-f37874efea6d) that tracks the number of Monthly Active Developers in Web3 over time:

![](https://www.datocms-assets.com/45776/1664986484-electric-capital-dev-report.png)

Compare that with a similar chart from Statista showing the growth in total (Web2 plus Web3) developers over time:

![](https://www.datocms-assets.com/45776/1664986652-screen-shot-2022-10-05-at-12-17-29-pm.png)

While the “hockey-stick” growth in Web3 developers is impressive in relative terms, the absolute number of developers (~18,500) pales in comparison to the total number of developers (~28M). Web3 developers only represent a tiny fraction (0.06%).

While there are many reasons developers choose not to move to Web3 (including the fact that some scams and bad actors tend to make more news than legitimate value-generating projects), I believe that a key factor is the availability of a healthy “developer product ecosystem.”

Our friends at [Coinbase recently attempted to define a “Web3 Developer Stack.”](https://www.coinbase.com/blog/a-simple-guide-to-the-web3-developer-stack) Here is what they came up with:

![](https://www.datocms-assets.com/45776/1664986688-coinbase-web3-dev-stack.png)

I love this representation, not only because it is well researched but because it shows a burgeoning ecosystem of products in the Web3 developer world. While this is great to see, it is still a far cry from the developer product ecosystem that exists in Web2. To drive the point home with an equivalent image, here is a product ecosystem image from the [Cloud Native Computing Foundation (CNCF)’s website](https://landscape.cncf.io/):

![](https://www.datocms-assets.com/45776/1664986751-screen-shot-2022-10-05-at-12-19-07-pm.png)

Keep in mind that while the CNCF, part of the Linux Foundation, is arguably one of the largest open source communities, there are a plethora of (non-open-source) commercial solutions that are not represented in the image above.

I present this data to say that anything we can do to foster growth in the ecosystem of tools for Web3 developers helps attract more talent to the space. These developers will not only build dApps but will also build even more tools. So, the space expands exponentially—like a flywheel.

## Summary

The state of Web3 infrastructure can be summarized in three points:

1.  The heavy reliance on public clouds for core Layer 1 infrastructure is an existential risk to chains, nodes, and the DApps that run on those chains.
2.  The cost of public clouds is a significant barrier to entry for new validators. Therefore, finding a cheaper alternative that is also easy to use (if not better) is key to ensuring chain security across the space.
3.  The third-largest barrier to Web3 adoption is the availability of developer talent. One way to drive developer traction is to foster the growth of a healthy “developer product ecosystem,” similar to the one that exists in the Web2 world.

![](https://www.datocms-assets.com/45776/1664987718-screen-shot-2022-10-05-at-12-35-15-pm.png)

If this topic has piqued your interest, stay tuned for the next article in this series. We will delve into how Akash Network addresses the above challenges and more.

If you are interested in Akash Network, [get started today with our documentation](https://docs.akash.network/).
