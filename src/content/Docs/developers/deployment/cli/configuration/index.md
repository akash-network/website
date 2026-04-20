---
categories: ["Developers", "Deployment", "CLI"]
tags: ["CLI", "Configuration", "Setup"]
weight: 2
title: "CLI Configuration"
linkTitle: "Configuration"
description: "Configure the provider-services CLI for your environment"
---

**Configure the provider-services CLI with networks, wallets, and custom settings.**

> **Prerequisites:** You must have the CLI installed and configured. See the [Installation Guide →](/docs/developers/deployment/cli/installation-guide)

This guide covers all configuration options for the CLI.

---

## Network Configuration

### Mainnet (Production)

Values below match [mainnet `meta.json`](https://raw.githubusercontent.com/akash-network/net/main/mainnet/meta.json); override **`AKASH_META_URL`** to point at another network’s `meta.json` when needed.

```bash
export AKASH_META_URL="https://raw.githubusercontent.com/akash-network/net/main/mainnet/meta.json"
export AKASH_CHAIN_ID="$(curl -sSf "$AKASH_META_URL" | jq -r '.chain_id')"
export AKASH_NODE="$(curl -sSf "$AKASH_META_URL" | jq -r '.apis.rpc[0].address')"
export AKASH_GAS_PRICES="0.025uakt"
export AKASH_GAS_ADJUSTMENT="1.5"
```

### Sandbox

Use [sandbox-2 `meta.json`](https://raw.githubusercontent.com/akash-network/net/main/sandbox-2/meta.json).

```bash
export AKASH_META_URL="https://raw.githubusercontent.com/akash-network/net/main/sandbox-2/meta.json"
export AKASH_CHAIN_ID="$(curl -sSf "$AKASH_META_URL" | jq -r '.chain_id')"
export AKASH_NODE="$(curl -sSf "$AKASH_META_URL" | jq -r '.apis.rpc[0].address')"
export AKASH_GAS_PRICES="0.025uakt"
export AKASH_GAS_ADJUSTMENT="1.5"
```

---

## Wallet Configuration

### Set Default Wallet
```bash
export AKASH_KEYRING_BACKEND="os"
export AKASH_KEY_NAME="my-wallet"  # Replace with your wallet name
export AKASH_FROM="$AKASH_KEY_NAME"
```

### Keyring Backend Options
- `os` - OS-native keystore (recommended)
- `file` - Encrypted file
- `test` - Unencrypted (testing only)

---

## Gas Configuration

### Gas Settings
```bash
# Gas price (in uakt per unit)
export AKASH_GAS_PRICES="0.025uakt"

# Gas adjustment factor (multiply estimated gas)
export AKASH_GAS_ADJUSTMENT="1.5"

# Fixed gas amount (optional)
export AKASH_GAS="auto"
```

### Tips
- Higher gas prices = faster transaction confirmation
- Gas adjustment helps avoid "out of gas" errors
- `auto` estimates gas automatically

---

## Custom RPC/API Endpoints

### RPC Node

From `meta.json` (same pattern as above), or set a URL explicitly:

```bash
export AKASH_NODE="https://rpc.akashnet.net:443"
```

### API Endpoint

REST / LCD URL from `meta.json`: `jq -r '.apis.rest[0].address'` against `AKASH_META_URL`, or:

```bash
export AKASH_API="https://api.akashnet.net:443"
```

### Use Your Own Node
```bash
export AKASH_NODE="http://your-node-ip:26657"
export AKASH_API="http://your-node-ip:1317"
```

---

## Persistent Configuration

### Add to Shell Profile

**Bash (~/.bashrc):** (`jq` must be installed for the subshells.)

```bash
echo 'export AKASH_META_URL="https://raw.githubusercontent.com/akash-network/net/main/mainnet/meta.json"' >> ~/.bashrc
echo 'export AKASH_CHAIN_ID="$(curl -sSf "$AKASH_META_URL" | jq -r ".chain_id")"' >> ~/.bashrc
echo 'export AKASH_NODE="$(curl -sSf "$AKASH_META_URL" | jq -r ".apis.rpc[0].address")"' >> ~/.bashrc
source ~/.bashrc
```

**Zsh (~/.zshrc):**

```bash
echo 'export AKASH_META_URL="https://raw.githubusercontent.com/akash-network/net/main/mainnet/meta.json"' >> ~/.zshrc
echo 'export AKASH_CHAIN_ID="$(curl -sSf "$AKASH_META_URL" | jq -r ".chain_id")"' >> ~/.zshrc
echo 'export AKASH_NODE="$(curl -sSf "$AKASH_META_URL" | jq -r ".apis.rpc[0].address")"' >> ~/.zshrc
source ~/.zshrc
```

---

## Configuration File

### Create Config File (Optional)
```bash
# Create config directory
mkdir -p ~/.akash

# Create config file
cat > ~/.akash/config.yaml << EOF
chain-id: akashnet-2
node: https://rpc.akashnet.net:443
gas-prices: 0.025uakt
gas-adjustment: 1.5
keyring-backend: os
EOF
```

### Use Config File
```bash
provider-services --config ~/.akash/config.yaml <command>
```

---

## Verify Configuration

### Check Current Settings
```bash
# View all environment variables
env | grep AKASH

# Test connection
provider-services query block

# Check wallet
provider-services keys list
```

---

## Advanced Configuration

### Timeout Settings
```bash
export AKASH_BROADCAST_MODE="sync"  # sync, async, or block
export AKASH_OUTPUT="json"          # json or text
```

### Debug Mode
```bash
export AKASH_TRACE="true"
```

---

## Next Steps

- **[Commands Reference →](/docs/developers/deployment/cli/commands-reference)** - Learn all CLI commands
- **[Common Tasks →](/docs/developers/deployment/cli/common-tasks)** - Practical deployment examples

---
