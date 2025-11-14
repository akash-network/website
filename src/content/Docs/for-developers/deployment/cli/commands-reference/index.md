---
categories: ["For Developers"]
tags: ["CLI", "Commands", "Reference"]
weight: 3
title: "CLI Commands Reference"
linkTitle: "Commands Reference"
description: "Complete reference of all provider-services CLI commands"
---

**Complete reference for all provider-services CLI commands.**

This guide covers all available commands and their options.

---

## Command Structure

```bash
provider-services <command> <subcommand> [flags]
```

---

## Deployment Commands

### Create Deployment
```bash
provider-services tx deployment create <sdl-file> \
  --from <wallet> \
  --gas auto \
  --gas-adjustment 1.5
```

### Query Deployments
```bash
# List all deployments for an account
provider-services query deployment list --owner <address>

# Get specific deployment
provider-services query deployment get --dseq <deployment-id> --owner <address>
```

### Update Deployment
```bash
provider-services tx deployment update <sdl-file> \
  --dseq <deployment-id> \
  --from <wallet>
```

### Close Deployment
```bash
provider-services tx deployment close \
  --dseq <deployment-id> \
  --from <wallet>
```

---

## Market Commands

### Query Bids
```bash
# List bids for a deployment
provider-services query market bid list \
  --owner <address> \
  --dseq <deployment-id>
```

### Create Lease
```bash
provider-services tx market lease create \
  --dseq <deployment-id> \
  --provider <provider-address> \
  --from <wallet>
```

### Close Lease
```bash
provider-services tx market lease close \
  --dseq <deployment-id> \
  --provider <provider-address> \
  --from <wallet>
```

---

## Provider Commands

### Query Providers
```bash
# List all providers
provider-services query provider list

# Get specific provider
provider-services query provider get <provider-address>
```

### Provider Status
```bash
provider-services provider-services status
```

---

## Wallet Commands

### Create Wallet
```bash
provider-services keys add <wallet-name>
```

### List Wallets
```bash
provider-services keys list
```

### Show Wallet Address
```bash
provider-services keys show <wallet-name> -a
```

### Export Wallet
```bash
provider-services keys export <wallet-name>
```

### Import Wallet
```bash
provider-services keys import <wallet-name> <keyfile>
```

---

## Query Commands

### Account Balance
```bash
provider-services query bank balances <address>
```

### Transaction Status
```bash
provider-services query tx <tx-hash>
```

### Block Info
```bash
# Latest block
provider-services query block

# Specific block
provider-services query block <height>
```

---

## Manifest Commands

### Send Manifest
```bash
provider-services send-manifest <manifest-file> \
  --dseq <deployment-id> \
  --provider <provider-address> \
  --from <wallet>
```

---

## Common Flags

### Transaction Flags
- `--from` - Wallet to sign transaction
- `--gas` - Gas limit (use `auto` for automatic)
- `--gas-adjustment` - Gas adjustment factor
- `--gas-prices` - Gas price (e.g., `0.025uakt`)
- `--fees` - Fixed fee amount
- `--yes` - Skip confirmation prompt

### Query Flags
- `--node` - RPC node URL
- `--chain-id` - Chain ID
- `--output` - Output format (`json` or `text`)
- `--height` - Query at specific block height

### Global Flags
- `--home` - Home directory
- `--keyring-backend` - Keyring type
- `--help` - Show help

---

## Examples

### Full Deployment Workflow
```bash
# 1. Create deployment
provider-services tx deployment create deploy.yml --from my-wallet --gas auto

# 2. Wait for bids, then query
provider-services query market bid list --owner $(provider-services keys show my-wallet -a)

# 3. Create lease
provider-services tx market lease create --dseq 123456 --provider akash1... --from my-wallet

# 4. Send manifest
provider-services send-manifest manifest.yml --dseq 123456 --provider akash1... --from my-wallet

# 5. Check status
provider-services query deployment get --dseq 123456 --owner $(provider-services keys show my-wallet -a)
```

---

## Help Command

Get help for any command:
```bash
# General help
provider-services --help

# Command help
provider-services tx deployment create --help

# Subcommand help
provider-services query --help
```

---

## Next Steps

- **[Common Tasks →](/docs/for-developers/cli/common-tasks)** - Practical examples
- **[Quick Start →](/docs/getting-started/quick-start)** - Deploy your first app

---

**Previous:** [← Configuration](/docs/for-developers/cli/configuration)  
**Next:** [Common Tasks →](/docs/for-developers/cli/common-tasks)

