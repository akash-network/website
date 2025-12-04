---
categories: ["Providers"]
tags: ["Provider Console", "Web UI", "Setup"]
weight: 3
title: "Provider Console Setup"
linkTitle: "Provider Console"
description: "Web-based provider setup using the Provider Console application"
---

**The easiest way to set up an Akash provider using a web-based interface—no command line required!**

The Provider Console is a user-friendly web application that guides you through provider setup with a visual interface.

---

## What is Provider Console?

Provider Console is a web-based application designed to simplify the process of becoming an Akash provider. It provides:

- **Visual Setup Wizard** - Step-by-step guided configuration
- **No CLI Required** - Everything through the browser
- **Automated Installation** - Handles Kubernetes and provider setup
- **Real-Time Monitoring** - View provider status and earnings
- **Web-Based Management** - Manage your provider from anywhere

---

## Why Provider Console?

### ✅ Advantages
- **Easiest to use** - No command line experience needed
- **Fastest setup** - 1-2 hours to get online
- **Guided process** - Step-by-step wizard
- **Lower learning curve** - Great for beginners
- **Visual feedback** - See status in real-time

### ⚠️ Considerations
- **Less customization** - Fewer configuration options
- **Web dependency** - Requires browser access
- **Best for smaller setups** - Optimized for 1-3 nodes
- **Still requires hardware** - Need a server to run on

---

## Quick Start

### Step 1: Access Provider Console
Visit: **[provider-console.akash.network](https://provider-console.akash.network)**

### Step 2: Connect Your Wallet
- Connect your Keplr or Leap wallet
- Ensure you have 5+ AKT for deposits

### Step 3: Follow the Setup Wizard
- Enter server details
- Configure provider settings
- Set pricing
- Deploy!

---

## What It Handles

The Provider Console automates:
- ✅ Server preparation
- ✅ Kubernetes installation
- ✅ Provider software deployment
- ✅ Certificate management
- ✅ Network configuration
- ✅ Initial pricing setup

---

## Prerequisites

Before starting:

- **Server requirements:**
  - Ubuntu 22.04 or 24.04
  - 4+ CPU cores, 8+ GB RAM
  - 100+ GB storage
  - Root/sudo access
  - Static IP or DDNS
  
- **AKT wallet** with 5+ AKT
- **Web browser** (Chrome, Firefox, or Brave)
- **SSH access** to your server

---

## Supported Features

### Included
- ✅ Basic provider setup
- ✅ Pricing configuration
- ✅ Provider monitoring
- ✅ Deployment management

### Advanced Features
For GPU support, persistent storage, or IP leases, you may need to use:
- [Provider Playbook →](/docs/providers/setup-and-installation/provider-playbook)
- [Kubespray Setup →](/docs/providers/setup-and-installation/kubespray)

---

## Best For

**Provider Console is ideal for:**
- First-time providers
- Testing Akash provider operations
- Small to medium setups (1-3 nodes)
- Users without extensive CLI experience
- Quick evaluation of provider economics

**Consider other methods for:**
- Large multi-node clusters (10+ nodes)
- Custom network configurations
- Advanced GPU setups
- Production data center deployments

---

## Post-Setup

After setup completes:

1. **Monitor your provider** - Check console dashboard
2. **Test with deployment** - Deploy a sample app
3. **Tune pricing** - Adjust based on demand
4. **Review operations** - See [Operations](/docs/providers/operations)

---

## Alternative Methods

**Want more control?**
- [Provider Playbook →](/docs/providers/setup-and-installation/provider-playbook) - Automated with Ansible
- [Kubespray →](/docs/providers/setup-and-installation/kubespray) - Full manual control

---

## Support

- **Discord:** [discord.akash.network](https://discord.akash.network) - #providers channel

---

**Ready to start?** Visit [Provider Console →](https://provider-console.akash.network)

