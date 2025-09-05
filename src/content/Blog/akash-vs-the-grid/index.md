---
title: "Akash vs The Grid"
description: At Akash, we do quite a bit of thinking,writing, and presenting on decentralized infrastructure. It’s our business after all – Akash is a decentralized marketplace and deployment platform for cloud compute.

pubDate: "2018-05-30"
draft: false

categories:
  - Insights
tags:
  - Insights
contributors:
  - Nick Alesandro

bannerImage: ./banner-image.jpg
---

At Akash, we do quite a bit of [thinking](https://docsend.com/view/yvgseww), [writing](https://hackernoon.com/decentralized-infrastructure-is-a-moral-imperative-2ec13dc3138d), and [presenting](https://www.youtube.com/watch?v=JUGjvs6IsrU) on decentralized infrastructure. It’s our business after all – Akash is a decentralized marketplace and deployment platform for cloud compute.  Using The Akash Network, companies make slack server capacity in their colo and on-prem datacenters available for containerized deployment. As a result, Akash-connected datacenters form a decentralized network of compute providers as an alternative to the hyperscale providers that currently dominate the cloud infrastructure market.

We’re not the only game in town though; several other projects are dedicated to bringing decentralized or distributed compute power to users.  And to be clear, we see this as a very [good thing](https://memegenerator.net/img/instances/60763191/its-a-good-thing.jpg) indeed.  Compute is an essential commodity and the world needs a healthy ecosystem of platforms that allow it to be traded quickly, freely and transparently. This article compares Akash with those other projects and attempts to draw relevant distinctions.

### **The Grid Projects: Apples and Oranges**

Other players in the decentralized compute space include DFINITY, Golem, 0chain, iExec, SONM, and Hypernet. We will consider them as a group – let’s call them the Grid Projects – since they all have a similar approach to aggregating compute power.  If you’re interested in specific differences among the Grid Projects, check out [this post](https://medium.com/@hypernet/how-hypernet-compares-to-golem-sonm-iexec-etc-d5aec79e51d6) or maybe [this post](https://themerkle.com/iexec-vs-golem-vs-sonm/) or even [this thread](https://www.reddit.com/r/GolemProject/comments/7kmqx2/is_iexec_a_direct_competitor_of_golem/) because **those differences aren’t relevant** to a comparison with Akash. Why aren’t those differences relevant?  Because Akash’s approach is fundamentally different, so it ends up being an [apples-to-oranges comparison](https://en.wikipedia.org/wiki/Apples_and_oranges).

### **How Akash is Different**

Each of the Grid Projects implements a particular variation of a single theme: Grid Computing.  In a grid compute model, many devices are connected to form a single “virtual supercomputer” that is optimal for running **highly parallelizable, short-term batch jobs** like CGI rendering, financial modeling, or DNA sequencing. In some cases, the Grid Projects’ compute occurs on-chain and in some it’s off-chain, but in all cases they require an application to be implemented specifically to run on this single virtual supercomputer.

The Akash Network is fundamentally different because it uses generic compute resources to host Docker containers in which **any cloud workload** can run.  Short-term batch jobs like CI/CD pipelines, ETL or Spark jobs?  Yep. Long-term workloads like web stacks, application servers, queues, or (this is important) databases?  Also yep. Any workload that can run in containers on AWS, GCP, Azure, or your own hardware can be run on Akash without rewriting it to run on a supercomputer. Akash also differs in that users have access to block storage on the servers running its containers. The Grid Projects either only offer compute with no storage at all or object storage – useful for storing large amounts of unstructured data but not for applications or databases.

### **Enter the Blockchain**

Another critical difference between Akash and the Grid Projects is in the use of blockchain.  Each of the Grid Projects approaches it slightly differently, but all of them perform compute tasks on chain and so all of them are bound by the performance of their blockchains.  And some solve this performance problem better than others.

Akash, on the other hand, uses the blockchain to provide an open and transparent marketplace on which generic compute resources are traded. In other words, space on a server is bought and sold on chain, while deployment is off chain in Docker containers, orchestrated by Kubernetes, residing on specific servers, within datacenters with user-specified characteristics such as region, cross-connections, certification level, end-user latency, reputation, and provider identity.

Akash’s blockchain marketplace also provides a significant price advantage because each workload is bid on by all providers willing and capable to host it.  This auction process is visible to all and the resulting competition will provide downward pressure on prices charged by all providers. Since today’s IaaS providers currently [bring in about US$45B per year](https://www.gartner.com/newsroom/id/3815165), all cloud use cases bring in over US$300B, and the IaaS market is growing at 36%YoY, we believe there is plenty of room for price relief.

## **In Summary**

The world needs supercomputers to run batch jobs to solve complex computational problems and the Grid Providers bring this power to the world. So if you need a supercomputer, check them out.

However, most compute workloads are not complex computational problems that demand supercomputing resources.  They’re applications, databases, and batch jobs managed by overworked DevOps engineers with a budget. So if you need to run your enterprise workload on the provider you choose, at a price you want, using familiar and time-tested tooling, check out [Akash](https://akash.network/).
