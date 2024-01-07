---
title: "Akash DeCloud for DeFi"
description: Finance—an industry that is expected to reach $26.5 trillion by 2020—is being disrupted at an atomic speed by its degenerate cousin, decentralized finance or simply DeFi.

pubDate: "2020-09-08"
draft: false

categories:
  - Insights
tags:
  - Insights
  - Product
contributors:
  - Greg Osuri

bannerImage: ./banner-image.png
---

Finance—an industry that is expected to reach $26.5 trillion by 2020—is being disrupted at an atomic speed by its degenerate cousin, decentralized finance or simply **DeFi**.

We’re witnessing rapid experimentation in every critical sector of finance, from lending and borrowing to insurance--finance hasn’t been this exciting for a long time.

As of the writing of this article, DeFi [added billions](https://defipulse.com) of dollars in assets locked, the past 2 days, a rate which is exponentially growing.

In this article, I’ll make a case for DeFi as the future of finance, explore some of the challenges facing this nascent industry, and propose solutions.

####

**Why Decentralization will Disrupt Finance**  
**\_\_\_\_\_**

Besides the obvious benefits of decentralization, like lower fees and sovereignty, DeFi presents novel opportunities that are only possible on DeFi, such as Flash Loans and Perpetual Swaps. In my view, there are two main reasons why DeFi will take prominence in finance:

**1) Atomic Composability for Endless Possibilities**

Atomic Composability enables developers to build programs that work across multiple protocols that perform a series of actions in a single transaction, wherein if any of the actions in that transaction were to fail, all the prior actions will revert back to the original state they were in before the transaction began.

This property is referred to as “atomicity” and is common in modern databases, particularly in blockchain based systems (blockchain is a state machine).

This presents amazing opportunities that were not possible in traditional finance. One intriguing application of Atomic Composability is “Flash Loans”.

Using Flash Loans, one can borrow at a very high leverage, make a trade (usually an arbitrage), and pay back the loan in the same transaction. As the system knows how much profit one can make from the trade (since it's on blockchain), the loan is guaranteed by a smart contract.

Flash Loans enable hyper-efficient money markets because they can effectively crush any arbitrage opportunities.

For a salient example, the trader in the tweet below walked out with $46k in profits from a $6k investment. How? By taking a margin loan at 16x leverage on DyDx to conduct an arbitrage trade on Ethereum between two decentralized exchanges. While lucrative in the early days of the market, arbitrage opportunities diminish as the networks mature, especially in DeFi because of its openness and composability.

![](https://www.datocms-assets.com/45776/1620925254-screen-shot-2020-09-06-at-6-34-27-pm-711x1024.png)

**2) Permissionless and Open Systems for HyperScale Adoption**

Permissionless enabled the Internet to reach the scale it’s at today. Even though permissioned models (AOL) gained traction in the early days of the Internet, a permissionless model fueled by the web browser (Netscape and Mozilla) and hypertext protocol (HTTP over TCP) was key for the Internet to reach the adoption it has today.

There is no question that a permissionless system would do the same for finance.

There is no signup on DeFi and no one can stop you from using DeFi.

Finance is on the brink of a revolution, and permissionless systems are leading the charge.

####

**Current State of DeFi**  
**\_\_\_\_\_**

The way I see it, there are four major stakeholders in DeFi and they can be summarized as follows:

- **Retail Users**: Regular users using DeFi for trading, borrowing etc.
- **Traders**: Traders that usually trade on a daily basis and are technically competent.
- **Protocol Developers:** Software developers that design and build various protocols that make DeFi happen.
- **Validators**: Blockchain node operators that secure the blockchain that DeFi protocols use.

These stakeholders currently face a distinct set of challenges and risks including:

**Censorship Risk**

A rising trend with the DeFi boom are Stateless (such as [Uniswap](https://app.uniswap.org) or [Aave](https://app.aave.com)) interfaces.   
and [online apps for real money](https://aussielowdepositcasino.com/real-money-casino-apps/).

These interfaces improve user experience exponentially while ensuring sovereignty, but risk censorship as they are hosted on a centralized platform with a DNS name.

While the protocols themselves are censorship resistant, the interfaces are not.

Additionally, Stateless static interfaces are extremely limiting since they are executed on the client (versus a server, which is common). Overburdening the client for computational resources (for shared features) leads to poor user experience.

Censorship resistance for user interfaces is critical to ensure DeFi is resilient.

**Prohibitive Costs**

DeFi users incur two types of costs. The Take Fee (usually a percentage of the trade charged by the protocol) and a Gas Fee (charged to validators that maintain the blockchain).

To swap assets, protocols such as Uniswap charge a 0.03% Take Fee, which is significantly lower than their centralized counterparts. This Take Fee is then distributed back to the liquidity providers as an incentive to build the order book liquidity. As of the writing of this article, the [ETH-USDT](https://uniswap.info/pair/0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852) market pair has the largest liquidity on Uniswap and provides a healthy 45% APY return to its liquidity providers.

The Gas Fees, however, are paid to blockchain maintainers, usually referred to as Validators or Miners, as an incentive for maintaining the security of the blockchain.

Users paid $7,830,064 per day in [Gas Fee](https://bitinfocharts.com/ethereum/) to Ethereum miners with a median cost per transaction currently at $6.40. These prohibitive Gas Fees are due to enormous hosting fees charged by the centralized cloud providers that the validator community depends on for running their nodes.

It is estimated that over [60% of Ethereum](https://thenextweb.com/hardfork/2019/09/23/ethereum-nodes-cloud-services-amazon-web-services-blockchain-hosted-decentralization/) nodes currently run on Amazon Web Services. This centralization not only leads to increased costs due to constrained supply but is also at risk of being centralized and prone to censorship.

High gas costs prevents DeFi from being more accessible to the wider retail market.

**Scalability Challenges**

The high transaction costs are indicative of the scalability challenges blockchain protocols face today. Ethereum blockchain currently supports around 15 transactions per second (TPS), which is prohibitive for smaller transactions and impossible to build high volume money markets (such as high margin trading).

New and promising blockchains such as Solana boast an impressive 50,000 TPS but have limited ecosystem support compared to Ethereum.

Common challenges node operators for new blockchains face are increasing costs and the centralized nature of the cloud service providers, which in turn increase gas costs.

Increasing costs limit validators’ resources and ability to scale their operations to meet demand in a cost-efficient way.

####

**Decentralized Cloud for Decentralized Finance**  
**\_\_\_\_\_**

A permissionless and decentralized cloud infrastructure is imperative to ensuring DeFi remains sovereign and becomes more accessible.

Decentralized cloud networks such as Akash and Storj not only provide viable alternatives to centralized cloud providers, but also address DeFi’s challenges in the following ways:

**Unstoppable DeFi**

Cloud applications hosted on Akash are censorship resistant, meaning the applications can be controlled only by the owner of the key-pair.

This ensures that Stateless interfaces and the underlying node infrastructure to support them, are not at the mercy of centralized cloud providers.

In other words, Akash makes DeFi [unstoppable](https://news.bitcoin.com/decentralizing-the-web-handshake-akash-and-the-quest-for-censorship-resistance).

**Lower Costs**

Akash taps into underutilized cloud capacity across millions of data centers around the world. An estimated 85% of global cloud capacity remains unused today.

At Akash, users set the price they’re willing to pay and the network optimizes for the lowest cost possible for the application to function. Along with a novel subsidy model, this pricing mechanism is projected to reduce cloud computing costs 3x to 15x.

Not only can Layer 1 validators who switch to Akash get significantly better price-performance, but it enables them to stay decentralized.

Additionally, DeFi developers and technical traders can leverage lower costs on Akash for hosting full nodes to bot infrastructure.

Lower cloud costs result in lower fees, which benefits the ecosystem as a whole.

**Increased Scalability**

Akash’s permissionless model enables anyone with a computer to become a cloud provider, unlocking 85% of underutilized cloud computing capacity in 8.4 million data centers around the world

On Akash, developers have unlimited access to all network resources at any time--thus removing barriers to scalability.

####

**What's Next?**  
**\_\_\_\_\_**

At Akash, we’re building the first DeCloud for DeFi, and making DeFi developer challenges a thing of the past.

Akash DeCloud is a vertically integrated solution that enabless developers to deploy interfaces and nodes without friction, and with the best price-performance in the market.

If you are a validator or developer, we invite you to participate in the Akash DeCloud Early Access Program.

#### [**Join Akash DeCloud Early Access Program** → ](https://akashnet.typeform.com/to/UImjD7bs)
