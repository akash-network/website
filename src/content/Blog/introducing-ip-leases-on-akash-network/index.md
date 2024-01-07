---
title: "Introducing IP Leases on Akash Network"
description: Overclock Labs, the parent company of Akash Network which is developing tools, protocols, and infrastructure that support the evolution and adoption of Web3, is excited to announce the general availability of “IP Leases” on Akash Network.

pubDate: "2022-11-23"
draft: false

categories:
  - Product
tags:
  - Product
contributors:
  - Anil Murty

bannerImage: ./banner-image.png
---

[Overclock Labs](https://twitter.com/ovrclk_), the parent company of Akash Network which is developing tools, protocols, and infrastructure that support the evolution and adoption of Web3, is excited to announce the general availability of “IP Leases” on Akash Network.

IP Leases allow Tenants of Akash Network to request reserved, publicly routable IP addresses for the services they deploy, and allow Providers on the network to monetize their acquired and available IP space. IP Leases are supported in version [**0.18.0** of the Akash CLI](https://docs.akash.network/mainnet4-upgrade-docs/akash-v0.18.0-cli-release-notes) and are also available for use via the [Cloudmos deploy tool](https://cloudmos.io/). The on-chain code changes to support IP Leases were already released as part of the recent Akash Network [Mainnet 4 upgrade](https://www.mintscan.io/akash/proposals/27), so this feature is ready to use right now.

## Why We Built It

As Akash Network has gained popularity among Web3 developers, we have been listening closely to feedback and prioritizing things that make it easier for them to manage and scale applications and workloads on a decentralized cloud. While Web3 applications have many differences from “traditional” Web2 applications, they also have a lot in common when it comes to their underlying infrastructure needs. So it was no surprise that one of the most highly requested features from our community and customers was one that we take for granted when deploying services on existing cloud providers (like AWS, Azure, and GCP) — the ability to have a public, reserved Internet routable IP address assigned to a service running on public cloud infrastructure. IP Leases are also a key piece of our broader product strategy as we move into the “parity” (with respect to Web2) phase, as [highlighted by Greg in a tweet](https://twitter.com/gregosuri/status/1587858044108488705) recently:

![](https://www.datocms-assets.com/45776/1669215218-screen-shot-2022-11-23-at-9-53-27-am.png)

While Akash users have had ways to expose endpoints of their services, using HTTP endpoints connected to ports provided by Kubernetes — they had no control over the ports. Further, some services (like a VPN, for example) must use standard ports in the 0-1024 range, which isn’t possible unless you have a dedicated IP address. The ability to lease a dedicated IP address removes these limitations and broadens the types of applications that can be deployed on Akash Network.

## For Tenants (Developers & Other Users)

Users deploying workloads on Akash now have the option to request a public IPv4 address as part of their deployments. Users needing dedicated IP addresses for their applications and services specify that in their bid request and submit it to the Akash marketplace. Providers that have dedicated IP address pools configured to respond to the request, and the user is able to pick one of the providers to deploy their service on. Once deployed, the user gets an IP address in addition to an HTTP endpoint, either of which can be used to access the service publicly:

![](https://www.datocms-assets.com/45776/1669215272-screen-shot-2022-11-23-at-9-54-17-am.png)

_(“User 03” here wants a dedicated IP address, and “Provider 02” has this capability available)_

IP addresses are a new _kind_ of _endpoint_ and can be requested when declaring each service in a deployment (in the SDL). Each declaration returns one single IPv4 address that may be bound to one or more ports in the standard (0-65535) range.

![](https://www.datocms-assets.com/45776/1669215359-screen-shot-2022-11-23-at-9-55-49-am.png)

- Users only need to lease one public IPv4 address for all the services included in their deployment as long as they use a unique port for each of the services.
- The leased IP address is only reserved for the time that the lease is open with the specific provider unless explicitly migrated to a new lease.
- Leased IP addresses are retained when deployments are updated.

Here is an example of an Akash SDL file and the resulting lease, showing the IP address allocated to the service for which the IP address was requested

![](https://www.datocms-assets.com/45776/1669215407-screen-shot-2022-11-23-at-9-56-36-am.png)

To see a full detailed explanation of how to use IP Leases, check out our [documentation](https://docs.akash.network/features/ip-leases).

## For Providers

Current and new providers on Akash Network can use the new IP Lease functionality starting today, offering their users more value and increasing revenue by monetizing their unused IP space. Providers interested in making IP Leases available to their users have a set of steps to perform:

1.  Decide on the pool of IP addresses you wish to make available. If you are running in a colocation facility, you would lease this pool from your hosting provider.
2.  Associate those IP addresses with a node on your Kubernetes cluster. This is the pool of IP addresses that will be available for lease.
3.  Install and configure a [Metal LB](https://metallb.universe.tf/) instance to work with your Kubernetes cluster. This is a load balancer that will take care of assigning and unassigning IP addresses from your pool to services as they come and go.
4.  Define a Kubernetes Service that makes the monitoring endpoints (APIs) of the Metal LB instance accessible to Akash services.
5.  Add Kubernetes Custom Resource Definitions (CRDs) declaring the IP addresses available.

## Digging Deeper

We would love it if you used IP Leases in your next deployment. To get you going smoothly, we have updated our [documentation](https://docs.akash.network/features/ip-leases) to cover all technical details. If you are curious about the high-level details of how we implement this feature, stay tuned for an upcoming technical blog post outlining how we use [MetalLB](https://metallb.universe.tf/) and [Kubernetes Custom Resources](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/) under the hood to make IP Leases possible.
