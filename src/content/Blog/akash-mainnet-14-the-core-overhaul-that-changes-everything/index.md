---
title: "Akash Mainnet 14: The Core Overhaul That Changes Everything"
description: Akash Mainnet 14 upgrades the network to Cosmos SDK v0.53, introducing JWT authentication, IAVL storage optimizations, expedited governance, multi-depositor escrow, and lease termination reasons. This foundational refactor removes legacy technical debt and accelerates innovation for the next generation of decentralized cloud computing.

pubDate: "2025-10-28"
draft: false

categories:
  - Product
tags:
  - Product
contributors:
  - Anil Murty

bannerImage: ./banner-image.png
---

The Akash core codebase is getting a massive overhaul.

After months of deep refactoring, Akash is taking a massive leap: jumping several generations from Cosmos SDK v0.45 to Cosmos SDK v0.53, part of a larger refactoring effort to closing nearly eight years of legacy technical debt that has slowed the pace of innovation that predates even the GPU marketplace launch in 2023.

This is one of the most significant milestones in the network's history and the most significant upgrade since the launch of mainnet 6, which brought GPUs to Akash Network. This upgrade lays the foundation for faster development, improved performance, and a new era of feature velocity.

The Mainnet 14 upgrade will take place on Tuesday, October 28th, 2025, at 13:23 UTC (block [#23939793](https://www.mintscan.io/akash/block/23939793)), upgrading Akash's node to the latest Cosmos SDK.

This upgrade brings major performance and functionality improvements:

## Full Abstraction: The Path to Usable Decentralization

Akash is removing one of the biggest barriers to decentralized adoption: blockchain friction. With the introduction of [AEP-63: Full API Authentication Abstraction](/roadmap/aep-63/), users and developers will no longer need to create blockchain authentication certificates to interact with the network. Instead, Akash will adopt JWT (JSON Web Tokens), a global standard used across modern web applications, to simplify authentication, improve compatibility, and make user experience seamless. This means developers can build and deploy workloads using familiar Web2-style authentication, without ever touching the blockchain directly.

## IAVL Storage Upgrades

A major leap in performance. This upgrade introduces significant optimizations to the IAVL storage layer, resulting in dramatically faster queries and execution on live state, unlocking higher throughput and efficiency. These changes improve both validator efficiency and end-user responsiveness, enabling higher throughput and reduced latency for on-chain operations. By modernizing a key component of the Cosmos SDK stack, Akash now benefits from faster block execution and smoother performance during high network load, a foundational improvement that directly enhances reliability and scalability.

## Expedited Governance Proposals

Akash governance gets faster and more resilient. This enhancement streamlines the proposal lifecycle for urgent network decisions, allowing time-sensitive changes to move through governance in a fraction of the time. Whether it's an emergency patch, a parameter update, or a critical upgrade, the new expedited proposal process ensures the network can adapt quickly without compromising transparency or community participation. It's governance at the speed of innovation.

## AEP-75: Multi-Depositor Escrow Account

A redesign of Akash's escrow system that adds powerful flexibility for developers and providers. With [AEP-75](/roadmap/aep-75/), any funded account can now act as a depositor, supporting simultaneous grants and contributions to multiple deployments. This enables more composable, collaborative, and automated deployment flows.

## AEP-39: Lease Termination Reason

Improving transparency and accountability across the network. AEP-39 extends the lease state to include a termination reason field, allowing providers and the network to specify exactly why a lease ended. This added clarity strengthens provider reputation systems, simplifies debugging for developers, and enhances overall trust and traceability across the marketplace.

## Why It Matters

For years, Akash's architecture has pushed the limits of what's possible in decentralized cloud computing. But legacy components from the early Cosmos days created friction that slowed the pace of innovation and limited how quickly we could deliver new capabilities.

With the Mainnet 14 refactor complete, those barriers are gone. Akash's foundation is now faster, cleaner, and fully prepared for the next generation of development, paving the way for Virtual Machines, Confidential Computing, Resource Verification, and other advanced features that expand what decentralized infrastructure can do, effectively erasing the line between web3 and web2 applications/infrastructure.

Mainnet 14 marks the beginning of Akash's next growth phase, one that scales not just infrastructure, but innovation itself.

In the coming months, users can expect:

- **Faster Feature Rollouts** – With technical debt cleared, Akash can ship updates and improvements on a near-monthly basis.
- **Enhanced Governance Agility** – Streamlined governance mechanics allow the community to adapt faster to emerging needs.
- **Expanded Enterprise Capabilities** – A modernized stack ready for large-scale adoption, integrating seamlessly with established enterprise workflows.
- **Advanced Developer Experience** – Simpler authentication, more intuitive APIs, and a UX that feels as smooth as the centralized cloud, without sacrificing decentralization.

The upgrade to Cosmos SDK v0.53 isn't just another version step, it's the architectural reboot that unlocks Akash's true potential. From this point forward, the network evolves faster, developers build easier, and decentralized cloud finally competes at the pace of modern innovation.

## Upgrade Resources

If you're an operator, validator, or contributor, please review the upgrade guide here:

👉 [Akash Mainnet 14 Node Upgrade Guide](/docs/mainnet-14-upgrade/node-upgrade-guide/)
