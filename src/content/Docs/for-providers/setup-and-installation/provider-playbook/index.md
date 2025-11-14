---
categories: ["For Providers"]
tags: ["Provider Playbook", "Automation", "Ansible", "Setup"]
weight: 1
title: "Provider Playbook - Automated Setup"
linkTitle: "Provider Playbook"
description: "Automated provider setup using Ansible playbooks"
---

**The fastest way to set up an Akash provider using automated Ansible playbooks.**

The Provider Playbook Script automates Kubernetes installation, provider deployment, and configuration, making it the recommended method for most users.

---

## Why Provider Playbook?

### ✅ Advantages
- **Automated setup** - Most steps handled automatically
- **Standardized deployment** - Consistent, repeatable process
- **Less room for error** - Reduced manual configuration
- **Faster deployment** - 2-4 hours vs 4-8 hours manual
- **Infrastructure as Code** - All configurations versioned

### ⚠️ Considerations
- Requires Ansible knowledge (basic)
- Less customization than manual setup
- Still requires Linux/networking understanding

---

## What It Automates

The playbook handles:
- ✅ Kubernetes cluster deployment
- ✅ GPU detection and configuration
- ✅ Storage configuration (NVMe/SSD)
- ✅ Provider software installation
- ✅ Network and firewall setup
- ✅ Certificate management

---

## Prerequisites

Before starting:

- Server or VM with:
  - **CPU:** 4+ cores
  - **RAM:** 8+ GB
  - **Storage:** 50+ GB
  - **OS:** Ubuntu 22.04 or 24.04
- **Root access** to the server
- **SSH access** configured
- **AKT wallet** with 5+ AKT
- **Basic Ansible knowledge** helpful

---

## Quick Start

### Step 1: Clone the Repository

```bash
git clone https://github.com/akash-network/provider-playbooks.git
cd provider-playbooks
```

### Step 2: Install Ansible

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install ansible -y

# Verify installation
ansible --version
```

### Step 3: Configure Inventory

Edit the inventory file with your server details:

```bash
cp inventory/sample.ini inventory/hosts.ini
nano inventory/hosts.ini
```

### Step 4: Run the Playbook

```bash
ansible-playbook -i inventory/hosts.ini site.yml
```

---

## Detailed Setup Guide

For complete step-by-step instructions, see the [Provider Playbook GitHub repository](https://github.com/akash-network/provider-playbooks).

The repository includes:
- Detailed setup instructions
- Configuration examples
- Troubleshooting guides
- Advanced customization options

---

## Customization Options

The playbook supports:
- **GPU configuration** - Automatic GPU detection
- **Storage options** - NVMe, SSD, or mixed
- **Network settings** - Custom firewall rules
- **Provider attributes** - Location, capabilities
- **Pricing configuration** - Set your rates

---

## Post-Installation

After the playbook completes:

1. **Verify provider status**
2. **Configure pricing**
3. **Test with a deployment**
4. **Monitor performance**

See [Operations](/docs/for-providers/operations) for ongoing management.

---

## Troubleshooting

### Common Issues
- SSH connection failures → Check SSH keys
- Ansible errors → Verify Ansible version
- Kubernetes fails → Check system requirements
- Provider won't start → Review logs

For detailed troubleshooting, see [Troubleshooting](/docs/for-providers/troubleshooting).

---

## Next Steps

**After setup:**
- [Operations →](/docs/for-providers/operations) - Daily provider management
- [Troubleshooting →](/docs/for-providers/troubleshooting) - Fix common issues

**Alternative methods:**
- [Manual Setup →](/docs/for-providers/setup-and-installation/manual-setup) - Full control with Kubespray
- [Provider Console →](/docs/for-providers/setup-and-installation/provider-console) - Web-based setup

---

## Need Help?

- **GitHub Issues:** [provider-playbooks repo](https://github.com/akash-network/provider-playbooks/issues)
- **Discord:** [discord.akash.network](https://discord.akash.network) - #providers channel
- **Forum:** [forum.akash.network](https://forum.akash.network)

