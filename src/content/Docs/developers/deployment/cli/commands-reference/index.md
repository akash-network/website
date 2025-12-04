---
categories: ["Developers", "Deployment", "CLI"]
tags: ["CLI", "Commands", "Reference"]
weight: 4
title: "CLI Commands Reference"
linkTitle: "Commands Reference"
description: "Complete reference of all Provider Services CLI commands"
---

**Complete reference for all Provider Services CLI commands.**

This guide covers all available commands for managing deployments, wallets, and querying the Akash Network.

---

## Command Structure

```bash
provider-services <command> <subcommand> [arguments] [flags]
```

**Global Flags:**
- `--node` - RPC endpoint (default: `tcp://localhost:26657`)
- `--chain-id` - Network identifier (e.g., `akashnet-2`)
- `--from` - Wallet name or address
- `--gas-prices` - Gas price (e.g., `0.025uakt`)
- `--gas` - Gas limit (`auto` or specific amount)
- `--gas-adjustment` - Gas estimation multiplier (e.g., `1.5`)

---

## Deployment Commands

### Create Deployment

Create a new deployment from an SDL file.

```bash
provider-services tx deployment create <sdl-file> \
  --from <wallet> \
  --node https://rpc.akash.network:443 \
  --chain-id akashnet-2 \
  --gas-prices 0.025uakt \
  --gas auto \
  --gas-adjustment 1.5
```

**Flags:**
- `--dseq` - Deployment sequence number (optional, defaults to current block height)
- `--deposit` - Initial deposit amount (optional, auto-calculated if not provided)

**Example:**
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

### Query Deployments

List all deployments for an account.

```bash
provider-services query deployment list \
  --owner <address> \
  --node https://rpc.akash.network:443
```

**Flags:**
- `--owner` - Filter by owner address
- `--state` - Filter by state (`active`, `closed`)
- `--page` - Page number for pagination
- `--limit` - Results per page

**Example:**
```bash
provider-services query deployment list \
  --owner akash1... \
  --node https://rpc.akash.network:443
```

---

### Get Deployment

Get details of a specific deployment.

```bash
provider-services query deployment get \
  --owner <address> \
  --dseq <deployment-id> \
  --node https://rpc.akash.network:443
```

**Example:**
```bash
provider-services query deployment get \
  --owner akash1... \
  --dseq 1234567 \
  --node https://rpc.akash.network:443
```

---

### Update Deployment

Update an existing deployment with a new SDL.

```bash
provider-services tx deployment update <sdl-file> \
  --dseq <deployment-id> \
  --from <wallet> \
  --node https://rpc.akash.network:443 \
  --chain-id akashnet-2 \
  --gas-prices 0.025uakt \
  --gas auto \
  --gas-adjustment 1.5
```

**Important:** You cannot change resource groups in an update. Only environment variables and image versions can be updated.

---

### Close Deployment

Close a deployment and reclaim your deposit.

```bash
provider-services tx deployment close \
  --dseq <deployment-id> \
  --from <wallet> \
  --node https://rpc.akash.network:443 \
  --chain-id akashnet-2 \
  --gas-prices 0.025uakt \
  --gas auto \
  --gas-adjustment 1.5
```

**Example:**
```bash
provider-services tx deployment close \
  --dseq 1234567 \
  --from my-wallet \
  --node https://rpc.akash.network:443 \
  --chain-id akashnet-2 \
  --gas-prices 0.025uakt \
  --gas auto \
  --gas-adjustment 1.5
```

---

## Market Commands

### List Bids

View all bids for your deployment.

```bash
provider-services query market bid list \
  --owner <address> \
  --node https://rpc.akash.network:443
```

**Flags:**
- `--owner` - Filter by deployment owner
- `--dseq` - Filter by deployment sequence
- `--gseq` - Filter by group sequence
- `--oseq` - Filter by order sequence
- `--provider` - Filter by provider address
- `--state` - Filter by state (`open`, `active`, `closed`)

**Example:**
```bash
provider-services query market bid list \
  --owner akash1... \
  --dseq 1234567 \
  --node https://rpc.akash.network:443
```

---

### Get Bid

Get details of a specific bid.

```bash
provider-services query market bid get \
  --owner <address> \
  --dseq <deployment-id> \
  --gseq <group-sequence> \
  --oseq <order-sequence> \
  --provider <provider-address> \
  --node https://rpc.akash.network:443
```

---

### Create Lease

Accept a bid and create a lease.

```bash
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

**Example:**
```bash
provider-services tx market lease create \
  --dseq 1234567 \
  --gseq 1 \
  --oseq 1 \
  --provider akash1... \
  --from my-wallet \
  --node https://rpc.akash.network:443 \
  --chain-id akashnet-2 \
  --gas-prices 0.025uakt
```

---

### List Leases

View all leases for your account.

```bash
provider-services query market lease list \
  --owner <address> \
  --node https://rpc.akash.network:443
```

**Flags:**
- `--owner` - Filter by deployment owner
- `--provider` - Filter by provider
- `--dseq` - Filter by deployment sequence
- `--state` - Filter by state (`active`, `closed`)

---

### Close Lease

Close a lease (also closes the deployment).

```bash
provider-services tx market lease close \
  --dseq <deployment-id> \
  --gseq <group-sequence> \
  --oseq <order-sequence> \
  --provider <provider-address> \
  --from <wallet> \
  --node https://rpc.akash.network:443 \
  --chain-id akashnet-2 \
  --gas-prices 0.025uakt
```

---

## Provider Commands

### List Providers

View all registered providers on the network.

```bash
provider-services query provider list \
  --node https://rpc.akash.network:443
```

**Example output:**
```json
{
  "providers": [
    {
      "owner": "akash1...",
      "host_uri": "https://provider.example.com",
      "attributes": [
        {
          "key": "region",
          "value": "us-west"
        }
      ]
    }
  ]
}
```

---

### Get Provider

Get details of a specific provider.

```bash
provider-services query provider get <provider-address> \
  --node https://rpc.akash.network:443
```

---

## Certificate Commands

### Generate Certificate

Generate a client certificate for sending manifests.

```bash
provider-services tx cert generate client \
  --from <wallet> \
  --node https://rpc.akash.network:443 \
  --chain-id akashnet-2 \
  --gas-prices 0.025uakt
```

---

### Publish Certificate

Publish your certificate to the blockchain.

```bash
provider-services tx cert publish client \
  --from <wallet> \
  --node https://rpc.akash.network:443 \
  --chain-id akashnet-2 \
  --gas-prices 0.025uakt
```

---

### Revoke Certificate

Revoke a published certificate.

```bash
provider-services tx cert revoke \
  --from <wallet> \
  --node https://rpc.akash.network:443 \
  --chain-id akashnet-2 \
  --gas-prices 0.025uakt
```

---

### List Certificates

View all certificates for an account.

```bash
provider-services query cert list \
  --owner <address> \
  --node https://rpc.akash.network:443
```

---

## Wallet Commands

### Create Wallet

Create a new wallet.

```bash
provider-services keys add <wallet-name>
```

**Flags:**
- `--recover` - Import from mnemonic
- `--keyring-backend` - Keyring storage (`os`, `file`, `test`)

**Example:**
```bash
provider-services keys add my-wallet
```

---

### Import Wallet

Import an existing wallet from mnemonic.

```bash
provider-services keys add <wallet-name> --recover
```

You'll be prompted to enter your 24-word mnemonic phrase.

---

### List Wallets

List all wallets in your keyring.

```bash
provider-services keys list
```

---

### Show Wallet

Display wallet address and public key.

```bash
provider-services keys show <wallet-name>
```

**Flags:**
- `-a` - Show address only
- `-p` - Show public key only

**Example:**
```bash
# Show address only
provider-services keys show my-wallet -a
```

---

### Delete Wallet

Delete a wallet from your keyring.

```bash
provider-services keys delete <wallet-name>
```

**Warning:** This cannot be undone. Make sure you have backed up your mnemonic.

---

### Export Wallet

Export a wallet to a keyfile.

```bash
provider-services keys export <wallet-name>
```

---

### Import Keyfile

Import a wallet from an exported keyfile.

```bash
provider-services keys import <wallet-name> <keyfile>
```

---

## Query Commands

### Check Balance

Query account balance.

```bash
provider-services query bank balances <address> \
  --node https://rpc.akash.network:443
```

**Example:**
```bash
provider-services query bank balances akash1... \
  --node https://rpc.akash.network:443
```

**Example output:**
```json
{
  "balances": [
    {
      "denom": "uakt",
      "amount": "5000000"
    }
  ]
}
```

**Note:** Amounts are in `uakt` (micro-AKT). 1 AKT = 1,000,000 uakt.

---

### Query Account

Get account information.

```bash
provider-services query account <address> \
  --node https://rpc.akash.network:443
```

---

### Node Status

Check node sync status.

```bash
provider-services status \
  --node https://rpc.akash.network:443
```

---

### Block Information

Get block information by height.

```bash
provider-services query block <height> \
  --node https://rpc.akash.network:443
```

---

### Transaction

Query transaction by hash.

```bash
provider-services query tx <hash> \
  --node https://rpc.akash.network:443
```

---

## Transaction Commands

### Send Tokens

Send AKT to another address.

```bash
provider-services tx bank send <from-address> <to-address> <amount>uakt \
  --from <wallet> \
  --node https://rpc.akash.network:443 \
  --chain-id akashnet-2 \
  --gas-prices 0.025uakt
```

**Example:**
```bash
provider-services tx bank send akash1from... akash1to... 1000000uakt \
  --from my-wallet \
  --node https://rpc.akash.network:443 \
  --chain-id akashnet-2 \
  --gas-prices 0.025uakt
```

---

## Common Flag Combinations

### Mainnet Configuration

```bash
--node https://rpc.akash.network:443 \
--chain-id akashnet-2 \
--gas-prices 0.025uakt \
--gas auto \
--gas-adjustment 1.5
```

### Testnet Configuration

```bash
--node https://rpc.sandbox.akash.network:443 \
--chain-id sandbox-01 \
--gas-prices 0.025uakt \
--gas auto \
--gas-adjustment 1.5
```

---

## Environment Variables

Set these to avoid repeating flags:

```bash
export AKASH_NODE="https://rpc.akash.network:443"
export AKASH_CHAIN_ID="akashnet-2"
export AKASH_GAS_PRICES="0.025uakt"
export AKASH_GAS_ADJUSTMENT="1.5"
export AKASH_KEYRING_BACKEND="os"
```

---

## Output Formats

Control output format with `--output`:

```bash
# JSON (default)
provider-services query ... --output json

# Text
provider-services query ... --output text

# YAML
provider-services query ... --output yaml
```

---

## Related Resources

- [CLI Installation](/docs/developers/deployment/cli/installation-guide)
- [Common Tasks](/docs/developers/deployment/cli/common-tasks)
- [Configuration](/docs/developers/deployment/cli/configuration)
- [SDL Reference](/docs/developers/deployment/akash-sdl)
