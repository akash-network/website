---
title: "Announcing The Akashian Challenge: Phase 2"
description: After much anticipation, we’re excited to announce THE SHIP HAS LANDED for The Akashian Challenge Phase 2 DEX Operations! As a decentralized system, and the world’s first distributed cloud computing marketplace, we’re leveraging The Akashian Challenge incentivized testnet to gather data, identify critical issues, and ensure our network’s scalability, security, and usability for a strong mainnet. With 3,000,000 AKT in rewards, Supermini prizes, and 106 validators vying for 64 validator spots at Mainnet, Challengers will need to leverage their technical and social prowess to maneuver their way to victory.

pubDate: "2020-06-25"
draft: false

categories:
  - Testnets
tags:
  - Testnets
contributors:
  - Maly Ly

bannerImage: ./banner-image.png
---

**After much anticipation, we’re excited to announce THE SHIP HAS LANDED for The Akashian Challenge Phase 2: DEX Operations!**

As a decentralized system, and the world’s first distributed cloud computing marketplace, we’re leveraging The Akashian Challenge incentivized testnet to gather data, identify critical issues, and ensure our network’s scalability, security, and usability for a strong mainnet.

**With 3,000,000 AKT in rewards, Supermini prizes, and 106 validators vying for 64 validator spots at Mainnet,** Challengers will need to leverage their technical and social prowess to maneuver their way to victory. Through The Akashian Challenge, participants are able to explore different aspects of our decentralized cloud computing platform.

[**Get Started Now**](https://akash.network/docs/akashian/phase2)

### **Phase 1 Recap**

**\_\_\_\_\_**

In Phase 1, The Akashian Challenge became the second largest testnet in the Cosmos Hub since the Game of Stakes, and is currently the second largest testnet after Ethereum 2.0.

We tested governance and voting, and gained insights on network upgrades that strengthened our platform. Our testnet also withstood an AWS outage that brought down the centralized cloud (and internet), and weathered a [massive zero fee transaction attack](https://medium.com/@novysf/the-outcome-from-akash-testnet-zero-fee-transaction-attack-5fd4aaa68d97).

We were elated to see all the collaboration that occurred in Phase 1, and we’re grateful to participants for helping us build a healthy and vital community for growth.

![](https://www.datocms-assets.com/45776/1620922441-akash-v6-1-1024x768.png)

### **Phase 2: DEX Operations**

**\_\_\_\_\_**

**The Akashian Challenge Phase 2: DEX Operations will launch next Monday, June 29th at 1600 UTC / 9:00AM PST. Phase 2 will encompass three weeks of challenges.**

**Check out our** [**Phase 2 Challenge Schedule**](https://akash.network/challenge/phase2/schedule) **and** [**Phase 2 Rewards Schedule**](https://akash.network/challenge/phase2/rewards) **to plan your strategy!**

To incentivize participants we’ve allocated 600,000 AKT for Phase 2 rewards.

The Akashian Challenge Phase 2 will introduce, demonstrate, and test the decentralized exchange features of Akash. This decentralized exchange (DEX) is different from others in the cryptocurrency world, which are focused on settling trades; the Akash DEX is designed to settle requests for application deployments.

As this phase of the competition is primarily focused on the on-chain code, we won’t be running the network in a decentralized fashion.

Weekly challenges will focus on provider and tenant DEX operations--creating orders, bidding, handling leases--, while long-running challenges will focus on supporting a healthy network foundation.

###

**Long-Running Challenges**  
**\_\_\_\_\_**

Long-running challenges are active for the entire Akashian Challenge. They’re designed to encourage participation, and present an opportunity for us to observe longer term behaviors of the network.

These long-running challenges include the following, detailed below:

- Validator Architecture and Monitoring
- Network Infrastructure Support

###

**Validator Architecture and Monitoring**  
**\_\_\_\_\_\_**

The process of operating a validator is varied and there are [many](https://blog.polychainlabs.com/tendermint/2020/03/26/threshold-validator-for-tendermint.html) [possible](https://iqlusion.blog/a-look-inside-our-validator-architecture) [architectures](https://certus.one/sign-os) that can be used.

The choice of architecture depends primarily on the security model the validator operator chooses to protect against. Whatever architecture is chosen, monitoring and alerting tooling is necessary to help the validator maintain uptime and respond to on-chain events like proposals, slashing events, delegations, etc.

Teams will earn rewards for:

- Writing blog posts detailing their validator setup with supporting code/configuration
- Writing blog posts detailing their monitoring infrastructure with supporting code/configuration
- Making PRs that add additional prometheus metrics to the [x/deployment](https://github.com/ovrclk/akash/tree/master/x/deployment), [x/market](https://github.com/ovrclk/akash/tree/master/x/market) or [x/provider](https://github.com/ovrclk/akash/tree/master/x/provider) modules facilitating network monitoring.

###

**Network Infrastructure Support**  
**\_\_\_\_\_\_**

In order to support the network, a validator needs to run full nodes and sentries. This long running challenge will reward validators who run seed nodes with publicly available P2P endpoints or full nodes/sentries with publicly available RPC/p2p ports.

Note that running [tenderseed instances](https://gitlab.com/polychainlabs/tenderseed) is allowed/encouraged. Nodes must be reachable and posted in the [ovrclk/net](https://github.com/ovrclk/net) repository to be eligible for this reward.

###

**Weekly Challenges**  
**\_\_\_\_\_\_**

The Akashian Challenge: Phase 2 will encompass three weeks of challenges. Weekly challenges focus on different aspects of network functionality each week. These challenges are designed to test specific features of the DEX.

**Week 1: Capture the Orders**

The Akashian Challenge team will be creating orders continuously. The Week 1 challenge asks users to explore how to operate as a provider by finding and bidding on leases. This can be accomplished by running the provider daemon, using \`akashctl\` and some \`bash\` scripting, or by building custom tooling.

**Reward Opportunities:**

- Validators whose providers have won the most number of leases.
- Validators whose providers have placed the most number of bids.
- Bonus Category: Blog post detailing how winning provider bids works in the Akash system, and custom code to do so.

**Week 2: Chaos is a Ladder**

Week 2 is a test for throughput of the DEX. This will allow our team to identify performance bottlenecks in our code under realistic network conditions. The challenge builds on users' provider experience from the Week 1: Capture the Orders challenge and encourages them to explore how to operate as a tenant on the network.

**Reward Opportunities:**

- **Provider: Total Lease-Hours per Provider**: Points awarded to the provider that accumulates the greatest total number of lease-blocks. A lease block is an open lease for one block - if a provider has two leases during one block it is counted as two lease-blocks.

- **Provider: Total Lease Count**: Points awarded to the provider that accumulates the greatest total number total leases.

- **Tenant: Total Lease-Hours:** Points awarded to the tenant that accumulates the greatest total number of lease-blocks. A lease block is an open lease for one block - if a tenant has two leases during one block it is counted as two lease-blocks.

- **Tenant: Total Lease Count**: Points awarded to the tenant that accumulates the greatest total number total leases.

**Week 3: Cast a Wide Net**

The Week 3 challenge encompasses more throughput DEX testing, and encourages participants to explore large-scale deployment options. During this time, the provider daemon will be in Beta, in preparation for Phase 3.

**Reward Opportunities:**

- **Tenant: deployment with the largest number of individual providers:** Tenants can create deployments that have many orders - who can make a deployment that is fulfilled by the highest number of individual providers?
- **Provider: largest number of concurrent leases:** Providers may have more than one active lease at any given time. Award tokens to the provider that has the most active leases at one time over the period of the challenge.

###

**Phase 2 Rewards**  
**\_\_\_\_\_**

You can check out the [**Phase 2 Rewards Schedule**](https://akash.network/challenge/phase2/rewards) for a detailed schedule of reward opportunities. A total of **600,000 AKT** is allocated for Phase 2 Rewards that include:

1.  **One-Off Challenges**
2.  **Phase Completion**
3.  **Long Running Challenges**
4.  **Bi-Weekly Winners**
5.  **Bonus Challenges**

###

**Ready to Get Started?**  
**\_\_\_\_\_\_**

1.  **Review the** [**Challenge Schedule**](https://akash.network/challenge/phase2/schedule)
2.  **Review the** [**Rewards Schedule**](https://akash.network/challenge/phase2/rewards)
3.  **Check out the** [**Phase 2 Docs**](https://akash.network/docs/akashian/phase2)
4.  **Plan for launch next Monday, June 29th at 1600 UTC / 9:00 AM PST**

###

**Don’t Miss Critical Updates**  
**\_\_\_\_\_\_**

Join [our Telegram](https://t.me/AkashNW) and [Riot](https://riot.im/app/#/room/#akashnet:matrix.org) to get the latest news, giveaways, and special invitations to events and AMAs!

[**Get Started Now**](https://akash.network/docs/akashian/phase2)
