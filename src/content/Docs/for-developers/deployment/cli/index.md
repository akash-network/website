---
categories: ["For Developers", "Deployment"]
tags: ["CLI", "Command Line", "Provider Services"]
weight: 2
title: "Akash CLI"
linkTitle: "CLI"
description: "Deploy and manage Akash applications using the provider-services command-line interface"
---

**Deploy and manage Akash applications using the Provider Services CLI - the most powerful way to interact with Akash Network.**

The Provider Services CLI gives you complete control over deployments, with support for scripting, automation, and advanced features.

---

## What is the Provider Services CLI?

The Provider Services CLI (`provider-services`) is the official command-line interface for deploying on Akash. It provides:

- **Full Deployment Control** - Create, update, and manage deployments
- **Scriptable** - Automate workflows with shell scripts
- **CI/CD Ready** - Integrate with your deployment pipelines
- **Advanced Features** - Access all Akash capabilities
- **Production Ready** - Battle-tested and reliable

---

## Installation

Get started with the CLI:

**[Installation Guide →](/docs/for-developers/deployment/cli/installation-guide)**

The installation guide covers:
- Installing the Akash CLI on macOS, Linux, or Windows
- Creating your wallet
- Configuring the CLI
- Funding your account

---

## Key Features

### Deployment Management
- Create deployments from SDL files
- Update running deployments
- Close and manage leases
- View deployment status and logs

### Market Operations
- View available bids
- Accept leases
- Monitor provider marketplace
- Check pricing

### Wallet Operations
- Create and manage wallets
- Check balances
- Send transactions
- Query blockchain state

### Advanced Features
- Custom SDL configurations
- Deployment automation
- Batch operations
- Provider queries

---

## Quick Start

### 1. Install the CLI
```bash
# See installation guide for detailed instructions
curl -sSfL https://raw.githubusercontent.com/akash-network/provider/main/install.sh | sh
```

### 2. Create a Wallet
```bash
provider-services keys add my-wallet
```

### 3. Fund Your Wallet
Get AKT tokens and fund your account (minimum 5 AKT recommended)

### 4. Create SDL File
Write your deployment configuration (see [SDL Reference](/docs/for-developers/deployment/akash-sdl))

### 5. Deploy
```bash
provider-services tx deployment create deploy.yml \
  --from my-wallet \
  --node https://rpc.akash.network:443 \
  --chain-id akashnet-2 \
  --gas-prices 0.025uakt \
  --gas auto \
  --gas-adjustment 1.5
```

---

## Common Commands

### Deployment Commands
```bash
# Create deployment
provider-services tx deployment create <sdl-file> \
  --from <wallet> \
  --node https://rpc.akash.network:443 \
  --chain-id akashnet-2 \
  --gas-prices 0.025uakt

# Query deployments
provider-services query deployment list \
  --owner <address> \
  --node https://rpc.akash.network:443

# Close deployment
provider-services tx deployment close \
  --dseq <deployment-id> \
  --from <wallet> \
  --node https://rpc.akash.network:443 \
  --chain-id akashnet-2 \
  --gas-prices 0.025uakt
```

### Market Commands
```bash
# View bids for your deployment
provider-services query market bid list \
  --owner <address> \
  --node https://rpc.akash.network:443

# Create lease (accept a bid)
provider-services tx market lease create \
  --dseq <deployment-id> \
  --gseq <group-sequence> \
  --oseq <order-sequence> \
  --provider <provider-address> \
  --from <wallet> \
  --node https://rpc.akash.network:443 \
  --chain-id akashnet-2 \
  --gas-prices 0.025uakt
```

### Query Commands
```bash
# Check balance
provider-services query bank balances <address> \
  --node https://rpc.akash.network:443

# View providers
provider-services query provider list \
  --node https://rpc.akash.network:443
```

---

## CLI vs Other Tools

### Use CLI if you:
- ✅ Need full control over deployments
- ✅ Want to script/automate deployments
- ✅ Need CI/CD integration
- ✅ Prefer command-line workflows
- ✅ Need advanced features

### Use Console if you:
- ✅ Prefer visual interfaces
- ✅ Want quick deployments
- ✅ Are new to Akash
- ✅ Don't need automation

### Use SDK if you:
- ✅ Want to integrate Akash into your app
- ✅ Need programmatic control
- ✅ Are building deployment tools
- ✅ Prefer code over CLI

---

## Documentation Sections

### Installation & Setup
- [Installation Guide →](/docs/for-developers/deployment/cli/installation-guide) - Install and configure the CLI
- [Configuration →](/docs/for-developers/deployment/cli/configuration) - Configure networks and settings

### Reference
- [Commands Reference →](/docs/for-developers/deployment/cli/commands-reference) - Complete command documentation
- [Common Tasks →](/docs/for-developers/deployment/cli/common-tasks) - Practical examples

### Deployment Guides
- [SDL Reference →](/docs/for-developers/deployment/akash-sdl) - Deployment configuration
- [Deployment Guides →](/docs/for-developers/deployment/deployment-guides) - Specific use cases

---

## Resources

### Official Documentation
- [Installation →](/docs/for-developers/deployment/cli/installation-guide)
- [Commands Reference →](/docs/for-developers/deployment/cli/commands-reference)
- [SDL Reference →](/docs/for-developers/deployment/akash-sdl)

### Community
- **Discord:** [discord.akash.network](https://discord.akash.network) - #developers channel
- **GitHub:** [github.com/akash-network/provider](https://github.com/akash-network/provider)

---

**Ready to start?** Begin with the [Installation Guide →](/docs/for-developers/deployment/cli/installation-guide)!
