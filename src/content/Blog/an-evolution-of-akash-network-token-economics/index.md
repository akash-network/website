---
title: "An Evolution of Akash Network Token Economics"
description: Last fall, we released our Akash Network Token Economic Model, a system that leverages Akash Token (AKT), a native currency, to solve for volatility (one of the biggest challenges for adoption in crypto) while ensuring economic security of our public blockchain. In the paper, we presented various strategies to mitigate inherent adoption challenges that face an early market economy — lack of sufficient demand from the tenants (consumers of computing), which in turn hurts demand because of lack of supply.

pubDate: "2020-02-06"
draft: false

categories:
  - Insights
tags:
  - Insights
contributors:
  - Greg Osuri

bannerImage: ./banner-image.png
---

Last fall, we released our Akash Network Token Economic Model, a system that leverages Akash Token (AKT), a native currency, to solve for volatility (one of the biggest challenges for adoption in crypto) while ensuring economic security of our public blockchain. In the paper, we presented various strategies to mitigate inherent adoption challenges that face an early market economy — lack of sufficient demand from the tenants (consumers of computing), which in turn hurts demand because of lack of supply.

We shared a framework that can be applied to any marketplace to bootstrap early supply by subsidizing using inflation (i.e., borrowing from the future). We created a model to activate an incentive structure that not only fairly distributes but will unlock network effects to accelerate growth. With AKT, we create subsidies by borrowing from the future to create the effects of liquidity at an agreeable price point. These subsidies nurture continued network growth and lead to more liquidity, which further accelerates growth.

In this article, we present the market context for Akash’s compelling alternative to the cloud infrastructure oligopoly, and an evolution of our Akash Network Token Economic Model. We introduce two additional powerful drivers for growth and income generation in the ecosystem–the allocation of subsidies, in the form of a Subsidy Pool, and the distribution of a network dividend from a portion of the lease fees, Take Income.

**The Cloud Infrastructure Oligopoly**

Oligopolies can result in various forms of collusion which reduce competition and lead to higher prices for consumers.

Oligopolies happen when a product or service is commoditized. With the advent of containerization, catalyzed by technologies like kubernetes, cloud computing has effectively evolved into a commodity.

Fueled by accelerated global demand for cloud computing, cloud infrastructure is projected to reach $210 billion by 2022 with four companies controlling 71% of the market–Amazon Web Services (AWS), Google Cloud, Microsoft Azure, and Alibaba Cloud.

Cloud computing is a concentrated market with pricing inefficiency, built on the premise that you can only source cloud capacity through a central cloud infrastructure.

To be competitive, technology platforms have needed to either enhance existing capabilities, introduce a novel solution to a problem, or engage in [anti-competitive practices](https://www.nytimes.com/2019/12/15/technology/amazon-aws-cloud-competition.html).

**Breaking the Oligopoly by Decentralization**

Within this market context, there are 8.4 million data centers with an estimated 85% of server capacity underutilized.

To provide an alternative to the cloud oligopoly and to leverage this underutilized capacity from data centers, Akash is creating the Supercloud, the world’s first and only decentralized peer-to-peer cloud marketplace for serverless compute and services, enabling any data center and anyone with a computer to [become a cloud provider](https://akash.network/docs/providers/kube) by offering their unused compute cycles in a safe and frictionless marketplace.

For a system to reach or exceed the scale of the internet, the system should improve on the foundational principles of the internet while solving for inefficiencies inadvertently introduced. We designed Akash to be a decentralized and open ecosystem that is censorship-resistant and self-sovereign.

Akash’s marketplace employs a novel reverse auction mechanism where the tenant (the buyer of computing) sets the price they’re willing to pay and providers bid for the order where the compute provider that bids the lowest wins the job. This ensures that computing is offered at a price point set by a free market, determined by the forces of demand and supply.

**Reducing The Barrier to Entry and Accelerating Growth**

While there clearly is an abundant supply of computing and the Akash Platform is priming up to unlock this supply, the early stages of a market economy need to solve the demand-supply paradox of short-term undersupply, to reach market equilibrium and unlock network effects.

To solve the demand-supply paradox, we can use the subsidies from inflation (i.e., borrowing from the future) as described in our framework “[Bootstrapping the Free Market By Borrowing From Future”.](https://akash.network/blog/bootstrapping-a-free-market-by-borrowing-from-the-future/)

Akash employs an inflation model where a portion of block rewards are captured by a subsidy pool that is distributed to achieve adoption goals depending on the stage of the network, and involves stakeholders performing challenges to claim the subsidy. These subsidy distributions and claim challenges are governed by means of community proposals that are expected to evolve as the network grows. The Subsidy Pool Rate is a governed network parameter that’s subject to change based on community consensus. The proposed Subsidy Pool Rate at genesis is 50%.

**Exponential Cost Savings by Subsidizing Supply**

In the first phase of Akash, we propose using “exponential cost savings” as the initial subsidy trigger. An exponential cost reduction (10x-15x the market) is an extremely attractive incentive for cloud users where cost remains a top industry priority for three years in a row — particularly to price-sensitive segments such as machine learning and big data.

In this model, the subsidies are distributed periodically based on the Subsidy Distribution Cycle network parameter, which is expected to be daily (or equivalent block periods) at genesis.

As a first step, a tenant asks for a low price and providers that win the bid by offering the lowest price are awarded a bounty. The bounty in the early days may be exponentially high (usually 5x – 6x the cost).

For example, Alice wants to run a machine learning application and it costs her $10 / day today on the cloud. Alice then realizes that she gets 10 times more resources on Akash for the same price and she places a bid for $1 / day on Akash’s marketplace.

Bob and Charlie are cloud providers on Akash. Bob expects to earn $5 / day for running Alice’s Job and Charlie (with a better fill rate) expects to earn $6 / day.  A fill rate is the percent of bids won.

Let’s assume the subsidy pool is at $20 / day. This Order is placed on the order book for $1 / day which receives no bids. From there on, the Ask increments every block period by using the subsidy until a provider fulfills the order *or* the subsidy pool is exhausted for that distribution cycle. Any unspent subsidy is carried on to the next cycle.

In our example, let’s say after 4 blocks, the Ask reaches $5. Bob bids for $5 and Charlie bids for $6. Bob wins the Job and earns $5 whereas Alice pays $1. The $4 is paid to Bob from the subsidy pool and $16 is carried to the next cycle.

Alice then posts another order for $1. With the subsidy pool at $20 / day, the pool accumulates to $36. Bob is fully utilized and cannot offer any more compute. Charlie realizes he’s the only one that can fulfill the order and waits until the Ask reaches $36. Charlie now bids on the order and earns $36, 6x what he expected to earn.

![](https://www.datocms-assets.com/45776/1620922312-kawvcvsdg1vdrjavryqdd4xngc7tkhmiqqosq5wge6x9isxirvjhyp65t7molvrdh1pg93-zpmqotocxlixiaa9vuwyii0atjlvn7qwtokuty65weuia4kemgak1zeewvyqx.png)

Alice happily posts another order for $1. Since the subsidy pool in the previous bid was won by Charlie, the subsidy pool resets to $20. Bob realizes Charlie made $36 and adds more capacity to the network, expecting to take part in the network prosperity. Bob realizes that he’s the only provider and decides to wait until the Ask reaches $20.

But Alice is so pleased that she can’t help but share her Akash experience with her friends. Now the Ask is at $15. Danny, another provider, hears about this and decides to offer his capacity to Akash and expects to earn $5. He sees an offer for $15 and bids for $15. Danny earns $15. Alice Pays $1.

![](https://www.datocms-assets.com/45776/1620922320-s6uk4j1nirumr2fcbrmc6grbsfro3ob0c9jtfzv9b1rwtxwbaeycmoacxicrqy4bjwiuunlh95ddrjv5qmbbeknbunho1e1xxbkispg3nscffkactjvwozsmenrrqfa4kh1b.png)

Akash’s system design ensures that a provider can be at risk of losing a job (and subsidy along with it) if they’re always trying to win the entire subsidy, and encourages providers to employ incremental strategies.

**Attracting Liquidity using Network Dividend**

In addition to a portion of the block rewards, Akash Token (AKT) holders receive a portion of the lease fee by means of a Take Income. A portion of the income from every lease is captured by a Take Pool which is then distributed to AKT holders based on their Stake Weight (tokens locked and unlock time). The Take Rate is a network parameter established by the consensus of the community and expected to be 20% at genesis. The proposed Take Rate of 20% is common with high volume marketplaces (e.g. Uber 23% and Apple 30%).

Take Income establishes a clear earning potential of AKT by means of a network dividend instead of relying on speculation. For an industry that is expected to be $210 billion in 2022, a 20% Take Income amounts to $42 billion in income at 100% market penetration.

As the network grows in adoption, the consistent income-generating potential of AKT will attract liquidity, leading to higher subsidies. With a transparent way to measure performance, one may quantify network value.

**Summary**

Akash’s blockchain provides a shared state for decentralized control planes and the Akash Token bootstraps the market — this powerful combination unlocks network effects to accelerate adoption in an open ecosystem.

By leveraging the power of a free market and a permissionless, open cloud, Akash Network will unlock 85% of cloud compute capacity in 8.4 million data centers currently underutilized. Significantly more efficient and up to 10x lower in cost, our Supercloud provides the market with a compelling alternative to the cloud infrastructure oligopoly.

**\[** [**Download Updated Akash Network Token Economic Model to Learn More**](https://akash.network/static/akash-econ.pdf) **\]**
