---
title: "Akash MAINNET 2 Product Update"
description: Akash MAINNET 2, the world’s first decentralized open-source cloud, has been five years in the making, and it’s only been two weeks since we launched on Monday, March 8th, 2021. The global community reception has been encouragingly positive, and we’ve been grateful for the pioneering developers who have deployed on the platform, and continue to help us improve the product experience.

pubDate: "2021-03-23"
draft: false

categories:
  - Updates
tags:
  - Updates
  - Product
contributors:
  - Adam Bozanich

bannerImage: ./banner-image.png
---

Akash MAINNET 2, the world’s first decentralized open-source cloud, has been five years in the making, and it’s only been two weeks since we launched on Monday, March 8th, 2021. The global community reception has been encouragingly positive, and we’ve been grateful for the pioneering developers who have deployed on the platform, and continue to help us improve the product experience.

Starting with the Founders Challenge testnet in Q4 2019, then the three phases of The Akashian Challenge testnets through 2020, our approach to developing the platform has  been focused on iterative development, refinement, and on user feedback.

**It was this investment in early and fast learnings that enabled us to conduct a very smooth MAINNET 2 launch in under two hours.** This was an incredible feat for a decentralized network consisting of multiple stakeholder groups and individuals located across the globe. Our community of 64 validators synchronized efforts to stop the chain, and worked through the process for upgrading the chain to the new software.

As new blocks were produced, Akash MAINNET 2 came online! Over the week following launch, we began seeing more deployments and usage on the network. It’s been incredible to see what started from a vision to a live network with deployments.

We’re just starting to see the realization of Akash’s vision of a permissionless, sovereign, and open cloud, enabling builders and companies more freedom and flexibility to create, and to scale.

In the coming weeks, we’ll have exciting updates and use case studies for developers and organizations deploying on the platform.

Check out the MAINNET 2 progress summary below covering the two weeks since launch.

MAINNET 2 Launch Quick Stats:

- The first deployment on Akash DeCloud was the [Bitcoin Whitepaper](http://7nd4hr8cepabrdvaldd1r4uf04.ingress.sjc1p0.mainnet.akashian.io/)

- 234 Applications Deployed (with 25 active)

- 57 Developers

- 8x cost savings versus Amazon Web Services (AWS), being realized by a number of users

#### **MAINNET 2 Development Update**

**\_\_\_\_\_**

**PROVIDER FIXES**

Pricing [Update](https://github.com/ovrclk/akash/pull/1173): To account for AKT token’s rising prices, providers will need a way to offer lower bids than the current minimum of 1 uAKT, or 0.000001 AKT. Included in this update is the first step towards implementing fractional uAKT pricing, and involves switching the pricing variables from integer type to decimal type. Ultimately, providers will be able to structure their pricing in such a way that they may earn 0.25 uAKT per block and be able to withdraw 1 uAKT every four blocks.

**DEPLOYMENT PROCESS**

When the network upgrade first went live, we directed tenants to use the Deploy Tool, which was meant to simplify the deployment process and provide a quick method to deploy applications. The tool integrates a number of steps necessary for deploying on Akash, and returns a URI hostname used to access the application.

As it turned out, many users were having issues with the tool. If one of the intermediate steps failed, for example, the tool would return an error message and exit. The user would fix the cause of error, and run the tool again, but it would restart from the beginning--at times causing new errors as the first steps had already been completed once before.

To remedy this, the [primary documentation](https://akash.network/docs/guides/deploy) for deploying an application now details every step of the process, and provides additional context and clarity for users. We’re already receiving good feedback for this new process, as it gives users a better understanding of what is happening when they deploy their applications.

![](https://www.datocms-assets.com/45776/1620925200-n1tzov9msniedx0-wv-4opunrhmdgcfbbuunzdekzftogbinlimot0oaw2l5wdlg9kd3edpnmaj3ml7o8mi8kgaiagpncwvg1zy3uv0mwizjffuyr2q1hqhx3rco9cigssohnfs.png)

**CLIENT CERTIFICATES CHECK**

[Client Certificates Check](https://github.com/ovrclk/akash/pull/1169): To establish secure connections between Tenants and Providers on Akash, an mTLS certificate must be created and stored on-chain. If the certificate was not created, and a Tenant tried to use the deploy tool to create a deployment, the process would fail and the user’s transaction fee would be wasted. This fix now requires a certificate file to be present and on-chain before the transaction is broadcast to the network.

#### **Don’t Miss the Latest MAINNET 2, Akash, and AKT News!**

\_\_\_\_\_

[**Join our Telegram**](https://t.me/AkashNW) for the latest news, giveaways, and invites to special events!

[**Join our Discord developer chat**](https://discord.com/invite/DxftX67) for technical support and information.
