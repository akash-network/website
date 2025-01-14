---
aep: 48
title: "Private Overlay Networking"
author: Artur Troian (@troian)
status: Draft
type: Standard
category: Core
created: 2024-12-01
updated: 2025-01-11
estimated-completion: 2026-05-30
roadmap: major
---

## Motivation

Lease-to-lease networking on the Akash Network would provide dynamic IP address management and secure communication between tenants workloads.

## Summary

Currently, workloads belonging to the same tenant on the Akash Network can communicate with each other only via public IP addresses, limiting the platform’s ability to support interconnected deployments and tenant-specific networking needs. To address this challenge, this AEP introduces the concepts of a Akash Virtual Private Network (AVPN) to enable seamless and secure communication between tenant workloads while adhering to the principles of decentralization.

## Akash Virtual Private Network
Tenant will be responsible for creating network on the blockchain.
Thus we introduce concept of the network, which is owned by the tenant and references deployments required to be part of the network (active lease can always be queried by deployment id).

The deployment can be added/removed to/from the network during deployment create or via deployment update transactions.

### Decentralized DHCP Server
1. Lease-to-Lease Communication:
    - Facilitates network discovery and dynamic address resolution for workloads in different leases.
    - Routes IP allocations across providers through p2p network.
2. Consensus-Driven Allocation:
    - Uses peer-to-peer communication between providers to manage IP assignments, ensuring no single point of failure.

### Decentralized Firewall

The decentralized firewall ensures secure, policy-driven communication between leases of the tenant.

1. Policy Enforcement Across Leases:
    - Each lease can have its own set of firewall rules (defined in smart contracts) to govern inbound and outbound traffic.
    - Inter-lease communication is allowed only if explicitly permitted by both leases' policies.
2. Customizable Rules:
    - Allows users to define and update policies via [Netowork Manifest)[#Network-manifest]
    - Examples:
        - Block specific IP ranges between leases.
        - Allow secure ports for application-specific traffic (e.g., HTTP, HTTPS, or custom protocols).

### Network manifest
The Network Manifest is a declarative document that describes tenant-specific network policies and routing rules. It is distributed to participating providers and enforced throughout the network.
* Manifest Distribution:
    - The tenant populates the manifest on any provider within their decentralized network.
    - The manifest is propagated across the P2P network of providers, ensuring consistent enforcement of policies.
* Authorization:
    - Providers must be authorized by the tenant to join the network. (The detailed authorization workflow will be addressed in a separate AEP.)
* Manifest Challenges:
    - Deployment referencing currently relies on deployment IDs. This poses challenges when deployments are closed and replaced by new ones. Future AEPs will address the manifest format and deployment lifecycle nuances.

### Providers P2P network
Providers participating in a tenant’s network form a P2P network to distribute manifests, allocate IP addresses, and enforce firewall rules.

* Joining and Leaving the Network:
    - Providers join the P2P network when they host a lease added to the tenant’s network.
    - Providers leave the network when their hosted leases are closed or removed.
* Multi-Network Support:
    - Providers can simultaneously participate in multiple tenant networks, ensuring scalability and flexibility.

## Copyright

All content herein is licensed under [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0).
