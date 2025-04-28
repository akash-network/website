---
categories: ["Akash Provider"]
tags: ["Akash Provider"]
weight: 1
title: "Provider Overview"
linkTitle: "Provider Overview"
---

Akash Network provides a decentralized cloud marketplace where users can lease compute resources in a permissionless and open environment. As an Akash provider, you can contribute your compute resources to the network and earn revenue by hosting workloads for tenants.

## Getting Started

There are three primary ways to become an Akash provider:

1. **Using the Provider Playbook Script:** This automated approach uses Ansible playbooks to set up and configure your provider infrastructure, including Kubernetes, GPU support, and storage solutions. It's ideal for those who want a standardized, repeatable deployment process.
2. **Using the Akash CLI:** This method gives you full control over your provider setup and operations, allowing for advanced configurations and automation.
3. **Using the Akash Web App:** This more user-friendly approach enables providers to onboard quickly without needing extensive command-line knowledge.

All methods allow you to register your resources, set pricing, and accept deployment requests from tenants seeking cloud compute power.

Becoming an Akash provider helps to decentralize cloud computing while allowing you to monetize unused compute capacity. Whether you choose the playbook, CLI, or web app approach, the process is designed to be straightforward and accessible to a wide range of users.

## Prerequisites for Building an Akash Provider

### Wallet Funding - Minimum of 5 AKT

A deposit of 5 AKT is required to place a bid on an order. This deposit is fully refundable regardless of whether your bid is successful or not.

For detailed steps on creating an Akash account, please refer to our [documentation](/docs/deployments/akash-cli/installation/).

### Kubernetes Cluster Hardware Requirements and Recommendations

**Kubernetes Master Node Requirements**

- **Minimum Specifications:**
    - 4 CPUs
    - 8 GB RAM
    - 50 GB Disk

- **Recommended Specifications:**
    - 16 CPUs
    - 32 GB RAM
    - 100 GB Disk

**Kubernetes Worker Node Requirements**

- **Minimum Specifications:**
    - 4 CPUs
    - 8 GB RAM
    - 100 GB Disk

- **Recommendations:**
    - The more resources available, the better the performance, especially for handling more concurrent deployments.
    - It is crucial to maximize CPU capacity. For instance, if you have 8 CPUs, 100 GB RAM, and 2 TB of storage, the CPU is likely to be the bottleneck. Since people tend to deploy at least 1 CPU per deployment, the server could only host a maximum of 8 deployments, and likely only around 6 deployments, as approximately 2 CPUs will be reserved for Kubernetes system components.