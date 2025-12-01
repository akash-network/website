---
categories: ["For Providers"]
tags: ["Kubespray", "Manual Setup", "CLI", "Advanced"]
weight: 0
title: "Kubespray Setup"
linkTitle: "Kubespray"
description: "Manual provider setup using Kubespray and Helm for full control"
---

**Complete control over your Akash provider setup with production-grade Kubernetes.**

Kubespray provides a manual, step-by-step approach to deploying an Akash provider, giving you full control and customization over every component. Ideal for advanced users who need specific configurations or want to deeply understand the infrastructure.

⏱️ **Setup Time:** 1-2 hours

---

## What is Kubespray?

Kubespray is a composition of Ansible playbooks, inventory, provisioning tools, and domain knowledge for deploying production-ready Kubernetes clusters. For Akash providers, we use:

- **Kubespray 2.29** - Latest stable release
- **Kubernetes 1.33.5** - Officially supported version
- **etcd 3.5.22** - Distributed key-value store
- **containerd 2.1.4** - Container runtime
- **Calico 3.30.3** - Container Network Interface (CNI)

---

## Why Choose Kubespray?

### ✅ Advantages
- **Full control** - Customize every aspect of your setup
- **Production-grade** - Battle-tested for large deployments
- **Deep understanding** - Learn exactly how components work together
- **Maximum flexibility** - Adapt to your specific infrastructure needs
- **Custom configurations** - Fine-tune network, storage, and security
- **Reproducible** - Infrastructure as Code approach

### ⚠️ Considerations
- **Requires Kubernetes knowledge** - Must understand K8s concepts
- **More manual steps** - Less automated than Provider Playbook
- **Command-line focused** - Terminal-based setup
- **Ongoing maintenance** - Manual updates and configuration changes

---

## Prerequisites

### Required Knowledge
- **Linux administration** - Comfortable with command line and SSH
- **Kubernetes fundamentals** - Understand pods, deployments, services, namespaces
- **Networking basics** - IP addressing, DNS, firewalls, routing
- **Ansible basics** - Understand playbook concepts (helpful but not required)

### Hardware & System Requirements
See [Hardware Requirements](/docs/for-providers/getting-started/hardware-requirements) for complete specifications including CPU, RAM, storage, network, and GPU requirements.

---

## Setup Process Overview

The Kubespray setup is divided into distinct steps:

### Phase 1: Core Setup (Required)

**1. [Kubernetes Cluster Setup](/docs/for-providers/setup-and-installation/kubespray/kubernetes-setup)**
- Clone Kubespray repository
- Configure inventory and variables
- Deploy Kubernetes cluster with Ansible
- Verify cluster health

**2. [Provider Installation](/docs/for-providers/setup-and-installation/kubespray/provider-installation)**
- Install Helm and required operators
- Deploy Akash provider using Helm charts
- Configure provider settings (domain, region, pricing)
- Verify provider is running

### Phase 2: Optional Features

Add advanced capabilities based on your hardware and business needs:

**3. [GPU Support](/docs/for-providers/setup-and-installation/kubespray/gpu-support)**
- Install NVIDIA drivers and container toolkit
- Deploy NVIDIA device plugin
- Configure GPU attributes
- Test GPU workloads

**4. [Persistent Storage](/docs/for-providers/setup-and-installation/kubespray/persistent-storage)**
- Deploy Rook-Ceph operator
- Configure OSD devices
- Create storage classes (beta1/beta2/beta3)
- Test persistent volumes

**5. [IP Leases](/docs/for-providers/setup-and-installation/kubespray/ip-leases)**
- Configure IP address pool
- Deploy MetalLB load balancer
- Enable IP lease operator
- Test static IP assignment

---

## Recommended Setup Approach

### Start Simple, Add Complexity

**Step 1: Get Basic Provider Running**
1. Deploy Kubernetes cluster (Kubespray)
2. Install provider software (Helm)
3. Test with a simple deployment
4. Verify provider shows up on network

**Goal:** Prove your infrastructure works

---

**Step 2: Add Revenue Features**
5. Enable GPU support (if you have GPUs)
6. Configure persistent storage (if you have dedicated drives)
7. Set up IP leases (if you have extra IPs)

**Goal:** Maximize earning potential

---

**Step 3: Optimize & Scale**
8. Fine-tune pricing based on market
9. Monitor metrics and performance
10. Add capacity as needed
11. Automate maintenance tasks

**Goal:** Maximize profitability and uptime

---

## Time Estimates

### First-Time Setup
- **Kubernetes cluster:** 30-45 minutes
- **Provider installation:** 30-45 minutes
- **Configuration & testing:** 15-30 minutes
- **Total:** ~1-2 hours

### Optional Features
- **GPU support:** 30-60 minutes
- **Persistent storage:** 45-90 minutes (depending on complexity)
- **IP leases:** 30-45 minutes

### Experienced Operators
- **Full setup:** 45-60 minutes
- **With automation:** 20-30 minutes

> **Note:** Times assume you have hardware ready, DNS configured, and have done this before. First-time setup may take longer due to learning curve.

---

## Kubespray vs Provider Playbook

Both methods use Kubespray, but with different levels of automation:

| Feature | Kubespray (This Guide) | Provider Playbook |
|---------|------------------------|-------------------|
| **Automation** | Manual steps | Interactive script |
| **Control** | Full control | Guided configuration |
| **Time** | 1-2 hours | ~1 hour |
| **Skill Level** | Advanced | Intermediate |
| **Customization** | Maximum | Standard options |
| **Best For** | Custom setups, learning | Quick deployment |

**Use Kubespray when you:**
- Need specific Kubernetes configurations
- Want to understand every component
- Have custom networking requirements
- Are integrating with existing infrastructure
- Need fine-grained control over resources

**Use Provider Playbook when you:**
- Want the fastest setup
- Prefer guided configuration
- Are setting up a standard provider
- Don't need custom Kubernetes settings

---

## What Makes This "Advanced"?

Unlike Provider Playbook's automated script, the Kubespray method requires you to:

1. **Manually configure inventory files** - Define your nodes and variables
2. **Understand Ansible concepts** - Know what playbooks are doing
3. **Manually run each step** - Execute commands in the right order
4. **Troubleshoot issues** - Debug problems without a script
5. **Customize configurations** - Edit YAML files for specific needs
6. **Manage updates** - Manually apply upgrades and patches

**However, you gain:**
- Deep understanding of the infrastructure
- Ability to customize anything
- Fine-grained control over security
- Flexibility for unique requirements
- Transferable Kubernetes knowledge

---

## Alternative Setup Methods

Not sure Kubespray is right for you?

**[Provider Playbook →](/docs/for-providers/setup-and-installation/provider-playbook)**
- Automated Kubespray setup with interactive wizard
- Same Kubernetes stack, automated configuration
- Recommended for most users
- ⏱️ Time: ~1 hour

**[Provider Console →](/docs/for-providers/setup-and-installation/provider-console)**
- Web-based setup with no K8s knowledge required
- Fully managed Kubernetes
- Best for beginners
- ⏱️ Time: 15-30 minutes

---

## Getting Help

### Before You Start
- Review [Hardware Requirements](/docs/for-providers/getting-started/hardware-requirements)
- Read [Should I Run a Provider?](/docs/for-providers/getting-started/should-i-run-a-provider)
- Calculate earnings with [Provider Calculator](https://akash.network/pricing/provider-calculator/)

### During Setup
- **Discord:** [discord.akash.network](https://discord.akash.network) - #providers channel
- **Forum:** [forum.akash.network](https://forum.akash.network)
- **Kubespray Docs:** [kubespray.io](https://kubespray.io)

### After Setup
- [Operations Guide →](/docs/for-providers/operations) - Managing your provider
- [Provider Verification →](/docs/for-providers/operations/provider-verification) - Verify your setup

---

## Ready to Begin?

Start with the Kubernetes cluster setup:

**→ [Kubernetes Setup Guide](/docs/for-providers/setup-and-installation/kubespray/kubernetes-setup)**

This will walk you through deploying a production-grade Kubernetes cluster using Kubespray 2.29.

