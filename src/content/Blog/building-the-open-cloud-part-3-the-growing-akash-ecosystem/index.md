---
title: "Building the Open Cloud, Part 3: The Growing Akash Ecosystem"
description: By Anil Murty, Head of Product at Overclock Labs, and Alani Kuye, Technical Program Manager at Overclock Labs

pubDate: "2022-11-03"
draft: false

categories:
  - Insights
tags:
  - Insights
contributors:
  - Anil Murty

bannerImage: ./banner-image.png
---

_By_ [**_Anil Murty_**](https://www.linkedin.com/in/anilmurty/)_, Head of Product at Overclock Labs, and_ [**_Alani Kuye_**](https://www.linkedin.com/in/alanikuye/)_, Technical Program Manager at Overclock Labs_

---

This is a continuation of the four-part blog post series we started in October. In the [first post](https://akash.network/blog/building-the-open-cloud-part-one), we discussed the current state of web3 infrastructure and a few of its challenges. We followed that up with a [second post](https://akash.network/blog/building-the-open-cloud-part-2-re-imagining-the-cloud-with-akash) outlining how Akash’s decentralized open cloud solves these challenges. In the process, Akash is creating a platform for a thriving ecosystem of developer-focused products, tools, and services. This post will highlight Akash Network’s growing and thriving ecosystem.

## What is a Software Ecosystem?

If you are unfamiliar with the term “ecosystem” in the context of software services, here is a quick primer. It originates from the definition used in biology: a physical geographic area where organisms (plants and animals) as well as the weather and landscape, work together to form a “bubble of life.” Much the same, a software ecosystem is a virtual abstraction of space where various digital players work together to create a world of services for users in a common market.

Arguably, the best example of a software ecosystem today is the one created by Apple, which includes their software and hardware, as well as products and services built by third parties like iOS app developers and hardware accessory manufacturers. Apple’s ecosystem stands in contrast to the Android ecosystem, which is more open. A third party can develop a phone which runs the Android operating system, even though Google also makes its own phones, like the Pixel. Given the open nature of Akash’s software platform — Akash Network is comparable to the Android ecosystem.

## The Akash Network Ecosystem

Akash’s ecosystem evolves organically as people discover the power of the platform and find new use cases that even we (the core team at Overclock Labs) have not thought about. We’ve seen projects fall into two categories:

1.  Ecosystem projects that build products, tools, and services that make it easier for others to use Akash Network.
2.  Projects that run some part of their product or service (website, nodes, and core infrastructure) on Akash.

![](https://www.datocms-assets.com/45776/1667500750-61-1.png)

Let’s take a look at a few of these projects in more detail.

### Praetor App

Besides all the benefits to the user that we outlined in the [previous post](https://akash.network/blog/building-the-open-cloud-part-2-re-imagining-the-cloud-with-akash), Akash Network also enables any data center operator today (or in theory, any person with compute and storage capacity) to become a provider on Akash Network. This is one way for existing data center operators to monetize their unused capacity. When Akash launched, the Overclock Labs team built a [CLI-based process](https://akash.network/docs/providers/build-a-cloud-provider) for setting up an Akash provider on a group of servers. While this was great for those with a technical background, it prevented less technical people from being able to “join the open cloud revolution” by becoming a provider. This is where Praetor App saw an opportunity and decided to build a solution.

Praetor App is web-based product that significantly reduces the technical complexity of setting up a new provider on Akash. [Praetor is now called Akash provider console](https://provider-console.akash.network/). Akash provider console also includes a [provider profitability calculator](https://akash.network/pricing/provider-calculator/) and [usage pricing calculator](https://akash.network/pricing/usage-calculator/) as well as a provider status dashboard that shows the location, count, capacity, and uptime of the (~50 and growing) providers on Akash Network.

![](https://www.datocms-assets.com/45776/1667500819-screen-shot-2022-11-03-at-2-39-58-pm.png)

### Cloudmos

Similar to the way that Praetor enables the growth of providers, [Cloudmos](https://cloudmos.io/) enables less technical users to deploy on Akash by providing an easy-to-use graphical user interface (GUI), as an alternative to Overclock’s CLI method.

Cloudmos includes a downloadable (win/exe and mac/dmg images available [here](https://github.com/maxmaxlabs/cloudmos-deploy/releases)) application, as well as a beta web-based UI for deploying an application. They have also built a very cool pricing comparison tool [https://cloudmos.io/price-compare](https://cloudmos.io/price-compare) that compares the price of compute resources on Akash with those on the three major public cloud providers (AWS, Azure, and GCP).

![](https://www.datocms-assets.com/45776/1667500882-screen-shot-2022-11-03-at-2-41-12-pm.png)

### Terraform Provider for Akash (by Luna, an Akash Insider)

[Terraform](https://www.terraform.io/) is one the most popular infrastructure automation tools used by DevOps teams that operate public cloud infrastructure. The way Terraform automates infrastructure provisioning is through the use of “providers”. Put simply, a “Terraform Provider” is like a “plugin” that lets you work with public APIs provided by cloud service providers, SaaS providers, and other services used by a development team. Given the popularity of Terraform among developers and operations engineers, we were excited to see someone from the Akash community take it upon themselves to build a Terraform provider for Akash. The provider is located at the official Hashicorp Terraform registry docs [here](https://registry.terraform.io/providers/cloud-j-luna/akash/latest/docs). Detailed instructions on how to use it can be found in the Akash Network docs [here](https://akash.network/docs/other-resources/experimental/akash-deployments-via-terraform).

![](https://www.datocms-assets.com/45776/1667504595-screen-shot-2022-11-03-at-3-43-06-pm.png)

### Moultrie Audits

A key part of Akash Network’s value comes from the diversity of its providers. While this is an advantage, it also creates a challenge because we have to ensure that the providers are who they claim to be and the services they claim to provide (amount of compute resources, reliability, security) are accurately represented. While the Akash core team (Overclock Labs) has a process for auditing providers before they are allowed onto the network, a critical part of scaling Akash Network is to have additional auditors. This is where [Moultrie Audits](https://www.moultrieaudits.com/) fulfills an important role. They perform checks on all Akash providers when they join, as well as on a regular basis, to ensure the providers are accurately representing themselves on the Akash Network marketplace.

### Vixello

Vixello are builders and recently joined as validators within the Akash ecosystem. Vixello is focused on building tools that accelerate the adoption of web3, by bridging the gap for those coming from web2.

The Vixello team is increasingly active within the Akash ecosystem. They are testing tools encapsulating general business functions such as: invoice management, fiat to crypto payments, and decentralized business processes — in a manner that enables web2 and web3 to coexist.

## Join the Akash Ecosystem

Akash Network greatly values its [ecosystem](https://akash.network/ecosystem/showcase/latest/) of third-party products and services and is always excited to hear about new ones.

If you are interested in becoming a provider on Akash Network, building services for Akash, or integrating with Akash — reach out to us via [akash.network](https://akash.network), or any of our ecosystem partners.

If you prefer listening to reading, check out [this talk](https://www.youtube.com/watch?v=jGqZzNWQrNs&t=1373s) from Messari Mainnet 2022, or [this video](https://www.youtube.com/watch?v=8cicuhuf94s) that discusses the state of the Akash ecosystem as of October 2022.

Meanwhile, if you are eager to get started, head over to Akash Network’s [documentation](https://akash.network/docs/).
