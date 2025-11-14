---
title: "Introducing the Permaweb Hackathon"
description: When you buy an NFT how do you know it is going to be around in 20 years? Who is paying to store it?

pubDate: "2021-11-08"
draft: false

categories:
  - Developers
tags:
  - Developers
  - News
contributors:
  - Colin Pollen

bannerImage: ./banner-image.jpg
---

When you buy an NFT how do you know it is going to be around in 20 years? Who is paying to store it? NFTs are non-fungible tokens that grant ownership of unique items like art, music, digital items in a game, or real-world objects. Generative NFTs are especially popular as they transform strings of data stored in the token into colorful digital images of [Apes](https://boredapeyachtclub.com/#/), [Punks](https://www.larvalabs.com/cryptopunks), [Mondrians](https://paulstamatiou.com/how-i-made-50k-in-3-days-with-nfts/), even the [cover of Rolling Stone’s](https://hypebeast.com/2021/11/rolling-stone-bored-ape-yacht-club-digital-cover-nfts-announcement) magazine. While the actual tokens define ownership, they do not store the actual images on the blockchain. More often than not, the artwork is stored somewhere out of your control - or on a server that could shut down or suffer from data corruption.

The Akash Network is ideal for producing generative art, but a more permanent solution is needed to store your NFTs. Akash Network is a cloud platform that offers containers with _**ephemeral**_ storage, and data stored in containers are not meant to be stored long-term. _**Persistent**_ storage is on the [Akash Roadmap](https://akash.network/roadmap) and will add the ability for data to persist between restarts, ideal for data-intensive workloads such as blockchain nodes.

> “As seen with the NFT gaming platform, Strange Clan, powered by Akash, we’ve seen real-world use cases that leverage Akash’s distributed peer-to-peer marketplace for cloud compute. We’re excited to partner with Arweave and ArDrive to enable NFT creators and collectors to create generative art and store the NFTs permanently on Arweave using ArDrive.”
>
> Greg Osuri, CEO at Akash Network

When it comes to choosing storage services for your NFT, the most important factors are durability and availability. Availability is a measure of hardware redundancy while durability is a measure of data redundancy. Amazon S3 “boasts” an availability of 99.99% which translates to over 8 hours downtime per year. Durability is the ability for data to be protected from corruption and “bit rot” over the long term. Amazon Elastic Block Store (EBS) volumes have annual failure rates that range between 0.1% - 0.2% every year. For every 1000 Amazon EBS volumes that you provision in a year, you can expect one or two of them to fail.

### Meet the Permaweb 

[Arweave](https://www.arweave.org/) is a decentralized data storage protocol that allows you to store documents and applications in perpetuity on a permanent internet — the permaweb. The protocol matches people who have hard drive space to spare with those individuals and organizations that need to store data or host content permanently. All data stored is backed by an [endowment](https://arwiki.wiki/#/en/storage-endowment) ensuring it is available in perpetuity. You can read an introduction to Arweave and the _**permaweb**_ [here](https://arwiki.wiki/#/en/the-permaweb). Arweave is a completely community-owned and operated open-source network. The Arweave network is powered by the AR token, which can be found on most major exchanges.

> “We are very excited to see support for Arweave and ArDrive grow in the Akash ecosystem. Persistent state between VM executions is a critical issue in the space -- and we are thrilled to see this being addressed with Arweave.”
>
> Sam Williams

[ArDrive](https://ardrive.io/) is a permanent storage platform whose [applications and core libraries](https://github.com/ardriveapp/) offer hierarchical organization, privacy via complete end-to-end encryption, flexibility, extensibility, and access control over your most valuable data, all made possible by its underlying core technology, the [Arweave File System (ArFS) Protocol](https://ardrive.atlassian.net/wiki/spaces/help/pages/278495281/Arweave+File+System). ArDrive is a fantastic way to [store NFT data durably and permanently](https://ardrive.io/nft/) on Arweave.

> "ArDrive is the critical layer bridging the existing models that users and data systems rely upon to organize and access their data with the transaction-oriented, decentralized, and cryptographically secure Arweave Permaweb. ArDrive-powered, durable storage for Akash compute systems and bootstrap workflows are a natural fit and an exciting opportunity. The ArDrive Community is ready to support, and eager to celebrate the innovations developed by the Challengers!"
>
> Ariel Melendez, Chief Technology Officer at ArDrive

### Durable NFT Challenge

Akash Network, Arweave Protocol, and ArDrive are partnering to offer a prize to open source projects to utilize building blocks from the Akash and ArDrive ecosystems to create an amazing NFT-related integration. NFT creators and collectors can create generative art using Akash’s compute marketplace and store the NFTs permanently on Arweave using ArDrive.

The winner of the PermaNFT Challenge will receive 1,000 AKT and 10AR, equivalent to 20GB of perma-storage. The runner-up will receive 100 AKT and 2.5AR, equivalent to 5GB of perma-storage.

### Bootstrap Challenge

Snapshots and Bootstrap images for Akash deploys, backed by ArDrive. Use the [ArDrive CLI](https://github.com/ardriveapp/ardrive-cli/) (Node.js) to create an app, service, or workflow integration that can take automatic, permanent backups of Akash Databases, Docker Snapshots, and/or Bootstrap Images to public or private drives on ArDrive. Alternatively, or in addition, create an app, service, or workflow integration that can retrieve backups from ArDrive of key Akash entities and/or data and deploy or restore them to Akash.

The winner of the Bootstrap Challenge will receive 1,000 AKT and 10AR, equivalent to 20GB of perma-storage. The runner up will receive 100 AKT and 2.5AR, equivalent to 5GB of perma-storage.

### Filesystem Challenge

Filesystems are critical for containers. [FUSE (Filesystem in Userspace)](https://github.com/libfuse/libfuse) is an interface for userspace programs to export a filesystem to the Linux kernel. Create a FUSE integration for a Linux-based Akash container that utilizes ArDrive as its FUSE backend. Use the [ArDrive CLI](https://github.com/ardriveapp/ardrive-cli/) (Node.js - Typescript) or [ArDrive Core Library](https://github.com/ardriveapp/ardrive-core-js) (Node.js - Typescript) to build your integration.

The winner of the Filesystem Challenge will receive 1,000 AKT and 10AR, equivalent to 20GB of perma-storage. The runner-up will receive 100 AKT and 2.5AR, equivalent to 5GB of perma-storage.

### How to Participate

To compete in the challenge, submit your work to the [Akash-Arweave Challenge](https://forum.akash.network/c/bounties/arweave/) on the Akash Community Forum. Please include the following information:

- Project name and a list of team members
- A description of what your project does and why you decided to build it
- Demo video or presentation slides. Your video should be around 3 minutes long and include a demo of your working project. Videos must be made publicly visible.
- Access to your working application or Github code repository. Access must be provided to the working application or code for judging and testing by providing a link to a website, functioning demo, or a Github repository.

To help developers get started here are some of the important links:

- Akash Getting Started: [https://akash.network/docs/getting-started/quickstart-guides/akash-cli/](https://akash.network/docs/getting-started/quickstart-guides/akash-cli/)
- Akash Discord: [http://discord.akash.network/](http://discord.akash.network/)
- Akash Community Fund: [http://forum.akash.network/](http://forum.akash.network/)
- ArDrive CLI Docs: [https://github.com/ardriveapp/ardrive-cli](https://github.com/ardriveapp/ardrive-cli)
- ArDrive Core Library Docs: [https://github.com/ardriveapp/ardrive-core-js](https://github.com/ardriveapp/ardrive-core-js)
- ArDrive Discord: [https://discord.gg/ya4hf2H](https://discord.gg/ya4hf2H)
- ArDrive Knowledge Base: [http://kb.ardrive.io](http://kb.ardrive.io)
- Arweave wiki: [https://arwiki.wiki/#/en/category/resources](https://arwiki.wiki/#/en/category/resources)
- Arweave Faucet:  [faucet.arweave.net](http://faucet.arweave.net)
- Example Pool: [https://ar.virdpool.com/](https://ar.virdpool.com/)
- Example Pool: [https://www.hpool.in/statistics/ar](https://www.hpool.in/statistics/ar)

To learn more about the hackathon and how you can participate check out the Akash Community Forum, [here](https://forum.akash.network/c/bounties/arweave/57).
