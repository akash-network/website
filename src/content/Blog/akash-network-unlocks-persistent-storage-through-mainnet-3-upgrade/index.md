---
title: "Akash Network Unlocks Persistent Storage Through Mainnet 3 Upgrade"
description: Mainnet 3, unlocked 🚀

pubDate: "2022-04-26"
draft: false

categories:
  - Updates
tags:
  - Updates
  - Developers
  - Product
  - News
contributors:
  - Kelsey Ruiz

bannerImage: ./banner-image.png
---

Mainnet 3, unlocked 🚀

Our two-week incentivized competition known as Testnet 3 allowed developers to stress-test recently piloted features on the Akash Network. Those features, integral to expanding the functionality that supports decentralized infrastructure and Web3, are now available to everyone through the Mainnet 3.0 ([v0.16](https://github.com/ovrclk/akash/releases)) upgrade.

Today, at block height 5,629,650, we successfully upgraded the network. This upgrade introduces enterprise-grade features like persistent storage, necessary for running all high-resource workloads. This enables developers greater flexibility for running real-world applications, like deploying validators and nodes, and expanding applications for the mining community.

> “This is a huge milestone for Akash Network. We launched the network in March of 2021. After a year of listening to our users, gathering feedback, and optimizing for the developer, we’re excited to deliver an upgrade that demonstrates the capabilities of Akash Network to support decentralized cloud infrastructure, accelerate Web3, and help users move away from centralized cloud service providers.”
>
> Greg Osuri, Founder of Akash Network and CEO of Overclock Labs

Let’s take a closer look at the features that are now available through the v0.16 upgrade.

### **Persistent Storage**

Persistent storage on Akash allows data to remain available through the lifetime of its lease. A deployment could drop, reinitialize, and move within a provider while retaining access to data stored. The provider allocates a volume on the host that is mounted within the deployment.

> “In this release, we are enabling higher resource caps for each deployment. Deployments will now have access to 256 CPUs per service, 512 CPUs total in a deployment, 32 TB storage capacity, and 512 GB memory. Persistent storage is not just an optional feature, it is a requirement for many workload types such as large blockchain node hosting and database-backed applications.”
>
> Adam Bozanich, Founder of Akash Network and CTO of Overclock Labs

This functionality closely mimics storage capabilities in public cloud environments. The ability for data to remain available through the life of its lease is a huge leap forward for many deployment use cases. Future releases will explore the ability to persist data across leases, adding even further capability. Check out the documentation, [here](https://akash.network/docs/features/persistent-storage).

### **Fractional uAKT**

Fractional uAKT removes the minimum cost of deployment. In the past, a deployment could not be cheaper than one uAKT per block. This means, extremely light workloads like a crypto wallet, or perhaps a personal blog could end up being more expensive than necessary. The limitation also would have more severe consequences as token price increases. A lightweight deployment could increase from $1 to $5 per month if the token were to double or triple in price.

With fractional uAKT, prices will remain consistent and resource consumption can be accurate to the cost. Check out the documentation, [here](https://akash.network/docs/features/fractional-uakt).

### **Authorized Spend** 

Authorized Spend allows users to authorize their wallet to spend a set number of tokens by another source wallet on deployments. The authorized spend is restricted to Akash deployment activities and the recipient of the tokens would not have access to those tokens for other operations.

This allows large teams to work on deployments together without using shared wallets, thereby reducing security concerns. Additionally, this allows new community members to spin up deployments without access to a faucet. Check out the documentation, [here](https://akash.network/docs/features/authorized-spend).

### **Inflation Decay Curve**

Today the inflation curve is handled manually by proposal voting when it is deemed necessary. On occasion, this has led to AKT scaling incorrectly with inflation going out of ideal ranges. Not only is this bad for trust in the token but it hurts token stability.

To solve this, the automatic curve mechanism will autocorrect when the inflation differs from the plan. This removes the need for human intervention and further stabilizes and secures the future of the token and the economics surrounding it.

![](https://www.datocms-assets.com/45776/1650912109-twitter-akash-mainnet3-launch2.png)

For more information on the Akash Network Mainnet 3 v0.16 upgrade, click [here](https://github.com/ovrclk/akash/releases) and tune into Akash Weekly on Twitter Spaces, Wednesday April 27th at 9 AM PST. Be sure to follow us on [Twitter](https://twitter.com/akashnet) and [Telegram](https://t.me/AkashNW) to stay in the loop on the latest news and updates. For technical support, head to our [Discord](https://discord.com/channels/747885925232672829/747885925878726841) or [Forum](https://forum.akash.network/).
