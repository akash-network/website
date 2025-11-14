---
categories: ["For Providers"]
tags: ["Kubespray", "Manual Setup", "CLI", "Advanced"]
weight: 2
title: "Kubespray Setup"
linkTitle: "Kubespray"
description: "Manual provider setup using Kubespray and Helm for full control"
---

**Complete control over your Akash provider setup using Kubespray for Kubernetes and Helm for provider deployment.**

This method gives you the most flexibility and customization options, ideal for advanced users and custom configurations.

---

## Why Kubespray?

### ✅ Advantages
- **Full control** - Customize every aspect
- **Maximum flexibility** - Adapt to your infrastructure
- **Learn deeply** - Understand every component
- **Production-ready** - Best for large deployments
- **Custom configurations** - Network, storage, security

### ⚠️ Considerations
- **More complex** - Requires Kubernetes expertise
- **Time-intensive** - 4-8 hours initial setup
- **More maintenance** - Manual updates required
- **Higher skill requirement** - Linux + K8s + networking

---

## Setup Overview

The manual setup process involves:

1. **Kubernetes Cluster** - Deploy using Kubespray
2. **Provider Installation** - Install using Helm charts
3. **Configuration** - Set pricing, attributes, features
4. **Advanced Features** - Add GPU, storage, IP leases

---

## Setup Guides

### Core Setup (Required)

#### [Step 1: Kubernetes Setup →](/docs/for-providers/setup-and-installation/kubespray/kubernetes-setup)
Set up a Kubernetes cluster using Kubespray:
- Install Kubernetes control plane
- Configure worker nodes
- Set up networking
- Configure storage

**Time:** 2-4 hours

---

#### [Step 2: Provider Installation →](/docs/for-providers/setup-and-installation/kubespray/provider-installation)
Install and configure the Akash provider:
- Install Helm
- Deploy provider using Helm charts
- Configure provider settings
- Set up ingress controller

**Time:** 2-3 hours

---

### Advanced Features (Optional)

#### [GPU Support →](/docs/for-providers/setup-and-installation/kubespray/gpu-support)
Enable GPU resources on your provider:
- Install NVIDIA drivers
- Configure GPU operator
- Set GPU attributes
- Test GPU deployments

**Time:** 2-4 hours

---

#### [Persistent Storage →](/docs/for-providers/setup-and-installation/kubespray/persistent-storage)
Add persistent storage capabilities:
- Install Rook-Ceph operator
- Configure storage classes
- Set up persistent volumes
- Test persistence

**Time:** 1-2 hours

---

#### [IP Leases →](/docs/for-providers/setup-and-installation/kubespray/ip-leases)
Enable static IP addressing:
- Configure IP pools
- Set up MetalLB or similar
- Enable IP lease operator
- Test IP assignment

**Time:** 1-2 hours

---

## Recommended Order

### Phase 1: Basic Provider
1. Kubernetes Setup
2. Provider Installation
3. Test with simple deployment

**Goal:** Get a working provider online

---

### Phase 2: Add Features
4. GPU Support (if you have GPUs)
5. Persistent Storage (if needed)
6. IP Leases (if you have extra IPs)

**Goal:** Maximize revenue potential

---

### Phase 3: Optimize
7. Tune pricing
8. Monitor performance
9. Scale capacity

**Goal:** Maximize profitability

---

## Prerequisites

### Skills Required
- **Linux administration** - Command line proficiency
- **Kubernetes experience** - Basic K8s concepts
- **Networking knowledge** - Firewalls, routing, DNS
- **Troubleshooting** - Debug logs, system issues

### Hardware Required
- See [Hardware Requirements](/docs/for-providers/getting-started/hardware-requirements)
- Minimum: Control plane + 1 worker node
- Recommended: 3 control plane + 3+ worker nodes

### Software Required
- **Ansible** - For Kubespray
- **Helm** - For provider deployment
- **kubectl** - For Kubernetes management
- **Git** - For cloning repositories

---

## Time Estimates

### Initial Setup
- **Kubernetes cluster:** 2-4 hours
- **Provider installation:** 2-3 hours
- **Configuration & testing:** 1-2 hours
- **Total:** 5-9 hours (first time)

### Adding Features
- **GPU support:** 2-4 hours
- **Persistent storage:** 1-2 hours
- **IP leases:** 1-2 hours

### Subsequent Deployments
- With experience: 2-3 hours total
- Using notes/scripts: 1-2 hours

---

## Alternative Methods

Not sure manual setup is right for you?

- **[Provider Playbook →](/docs/for-providers/setup-and-installation/provider-playbook)** - Automated setup (recommended for most)
- **[Provider Console →](/docs/for-providers/setup-and-installation/provider-console)** - Web-based setup (easiest)

---

## Support

- **Discord:** [discord.akash.network](https://discord.akash.network) - #providers channel
- **Forum:** [forum.akash.network](https://forum.akash.network)
- **Docs:** Continue to [Kubernetes Setup →](/docs/for-providers/setup-and-installation/manual-setup/kubernetes-setup)

---

**Ready to begin?** Start with [Kubernetes Setup →](/docs/for-providers/setup-and-installation/kubespray/kubernetes-setup)

