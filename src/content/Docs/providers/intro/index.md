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

1. **[Using the Provider Playbook Script](/docs/providers/build-a-cloud-provider/provider-playbook-script/):** This automated approach uses Ansible playbooks to set up and configure your provider infrastructure, including Kubernetes, GPU support, and storage solutions. It's ideal for those who want a standardized, repeatable deployment process.
2. **[Using the Akash CLI](/docs/providers/build-a-cloud-provider/akash-cli/intro/):** This method gives you full control over your provider setup and operations, allowing for advanced configurations and automation.
3. **[Using the Provider Console](/docs/providers/build-a-cloud-provider/provider-console/):** This more user-friendly approach enables providers to onboard quickly without needing extensive command-line knowledge.

All methods allow you to register your resources, set pricing, and accept deployment requests from tenants seeking cloud compute power.

Becoming an Akash provider helps to decentralize cloud computing while allowing you to monetize unused compute capacity. Whether you choose the playbook, CLI, or web app approach, the process is designed to be straightforward and accessible to a wide range of users.

## Prerequisites for Building an Akash Provider

### Wallet Funding - Minimum of 5 AKT

A deposit of 5 AKT is required to place a bid on an order. This deposit is fully refundable regardless of whether your bid is successful or not.

For detailed steps on creating an Akash account, please refer to our [documentation](/docs/deployments/akash-cli/installation/).

### Hardware Requirements

For comprehensive hardware requirements and best practices, please refer to our [Hardware Best Practices](/docs/providers/build-a-cloud-provider/hardware-best-practices/) guide. This guide covers:

- System requirements for control plane and worker nodes
- GPU requirements and configurations
- Storage best practices
- Network requirements
- Security considerations
