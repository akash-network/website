---
categories: ["Node Operators"]
tags: ["Node Build", "CLI"]
weight: 1
title: "Akash Node CLI Build"
linkTitle: "CLI Build"
---

Build an Akash RPC node manually on a Linux server. This guide provides full control over node configuration and is ideal for validators, providers, and production dApps.

**Time:** 15-30 minutes (setup) + 20-30 minutes (sync via snapshot)

**Requirements:**
- Ubuntu 24.04 LTS
- 4 CPU cores
- 8 GB RAM
- 100 GB SSD storage (minimum), 1 TB recommended
- Root access

---

## Overview

This guide covers:

1. [Install Akash Software](#step-1---install-akash-software)
2. [Add Akash to PATH](#step-2---add-akash-to-path)
3. [Choose Node Moniker](#step-3---choose-node-moniker)
4. [Initialize Node](#step-4---initialize-node)
5. [Set Minimum Gas Price](#step-5---set-minimum-gas-price)
6. [Copy Genesis File](#step-6---copy-genesis-file)
7. [Add Seed and Peer Nodes](#step-7---add-seed-and-peer-nodes)
8. [Configure Fast Sync](#step-8---configure-fast-sync)
9. [Download Blockchain Snapshot](#step-9---download-blockchain-snapshot)
10. [Start the Node](#step-10---start-the-node)

---



## Step 1 - Install Akash Software

Install the latest stable version of Akash Node software.

### Install Dependencies

```bash
apt update
apt install -y jq unzip curl
```

### Download and Install Akash

```bash
cd ~
curl -sSfL https://raw.githubusercontent.com/akash-network/node/main/install.sh | sh
```

This installs the `akash` binary to `~/bin/akash`.

---

## Step 2 - Add Akash to PATH

Add the Akash binary location to your system PATH.

### Edit Environment File

```bash
nano /etc/environment
```

### Update PATH

Add `/root/bin` to the existing PATH:

**Before:**
```
PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin"
```

**After:**
```
PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin:/root/bin"
```

Save and exit (`Ctrl+X`, then `Y`, then `Enter`).

### Activate Changes

```bash
source /etc/environment
```

### Verify Installation

```bash
akash version
```

**Expected output:**
```
v1.1.0
```

---

## Step 3 - Choose Node Moniker

Choose a memorable name for your node (ASCII characters only).

```bash
export AKASH_MONIKER="my-akash-node"
```

**Note:** You can change the moniker later in `~/.akash/config/config.toml`.

---

## Step 4 - Initialize Node

Initialize your Akash node with the mainnet chain ID.

### Set Network Variables

```bash
export AKASH_NET="https://raw.githubusercontent.com/akash-network/net/main/mainnet"
export AKASH_CHAIN_ID="$(curl -s "$AKASH_NET/chain-id.txt")"
```

### Initialize Node

```bash
akash init --chain-id "$AKASH_CHAIN_ID" "$AKASH_MONIKER"
```

This creates the node configuration in `~/.akash/`.

**Expected:** JSON output with chain ID and node information.

---

## Step 5 - Set Minimum Gas Price

Set a minimum gas price to protect your node from spam transactions.

```bash
nano ~/.akash/config/app.toml
```

Find the `minimum-gas-prices` field and set it to:

```toml
minimum-gas-prices = "0.0025uakt"
```

Save and exit.

---

## Step 6 - Copy Genesis File

Download the genesis file for the Akash mainnet.

```bash
curl -s "$AKASH_NET/genesis.json" > $HOME/.akash/config/genesis.json
```

---
## Step 7 - Add Seed and Peer Nodes

Configure seed and peer nodes to connect your node to the network.

### Download and Configure Automatically

```bash
# Get seed nodes
SEED_NODES=$(curl -s "$AKASH_NET/seed-nodes.txt" | paste -d, -s)

# Get peer nodes
PEER_NODES=$(curl -s "$AKASH_NET/peer-nodes.txt" | paste -d, -s)

# Update config.toml with seed nodes
sed -i.bak "s|^seeds = \"\"|seeds = \"$SEED_NODES\"|" ~/.akash/config/config.toml

# Update config.toml with peer nodes
sed -i.bak "s|^persistent_peers = \"\"|persistent_peers = \"$PEER_NODES\"|" ~/.akash/config/config.toml

# Configure RPC to listen on all interfaces
sed -i.bak 's|laddr = "tcp://127.0.0.1:26657"|laddr = "tcp://0.0.0.0:26657"|' ~/.akash/config/config.toml
```

**What this does:**
- Downloads current seed and peer node lists
- Automatically updates `config.toml` with the nodes
- Configures RPC to accept external connections
- Creates backup files (`.bak`) before modifications

### Verify Configuration

```bash
grep "^seeds" ~/.akash/config/config.toml
grep "^persistent_peers" ~/.akash/config/config.toml
grep "laddr.*26657" ~/.akash/config/config.toml
```

**Expected output:**
```
seeds = "27eb432ccd5e895c5c659659120d68b393dd8c60@35.247.65.183:26656,..."
persistent_peers = "9180b99a5be3443677e0f57fc5f40e8f071bdcd8@161.35.239.0:51656,..."
laddr = "tcp://0.0.0.0:26657"
```

---


## Step 8 - Configure Fast Sync

Verify Fast Sync is enabled (it should be by default).

```bash
nano ~/.akash/config/config.toml
```

Confirm these settings:

```toml
# Fast Sync enabled
fast_sync = true

# Fast Sync version (v0 recommended)
[fastsync]
version = "v0"
```

---

## Step 9 - Download Blockchain Snapshot

Download a blockchain snapshot to sync quickly. Snapshots are updated hourly.

### Remove Existing Data

```bash
rm -rf ~/.akash/data
mkdir -p ~/.akash/data
cd ~/.akash
```

### Download Latest Snapshot

**Snapshot URL:** [https://snapshots.akash.network/akashnet-2/latest](https://snapshots.akash.network/akashnet-2/latest)

**Size:** ~15GB compressed, updated hourly

```bash
# Install lz4 if not already installed
apt-get install -y lz4

# Download snapshot
wget -O akashnet-2_latest.tar.lz4 https://snapshots.akash.network/akashnet-2/latest --inet4-only

# Decompress
lz4 -d akashnet-2_latest.tar.lz4

# Extract
tar -xvf akashnet-2_latest.tar
```

**Note:** This process takes 20-30 minutes depending on your internet speed (~15 GB compressed download).

---

## Step 10 - Start the Node

Create a systemd service to run your Akash node.

### Create Start Script

```bash
cat > /usr/local/bin/start-akash-node.sh << 'EOF'
#!/usr/bin/env bash
/root/bin/akash start
EOF

chmod +x /usr/local/bin/start-akash-node.sh
```

### Create Systemd Service

```bash
cat > /etc/systemd/system/akash-node.service << 'EOF'
[Unit]
Description=Akash Node
After=network.target

[Service]
User=root
Group=root
ExecStart=/usr/local/bin/start-akash-node.sh
Restart=on-failure
RestartSec=15
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
EOF
```

### Start the Service

```bash
systemctl daemon-reload
systemctl enable akash-node
systemctl start akash-node
```

### Check Node Status

```bash
akash status
```

**Expected (while syncing):**

```json
{
  "SyncInfo": {
    "latest_block_height": "15234567",
    "catching_up": true
  }
}
```

**Expected (when synced):**

```json
{
  "SyncInfo": {
    "latest_block_height": "15234567",
    "catching_up": false
  }
}
```

Compare `latest_block_height` with [Mintscan](https://www.mintscan.io/akash) to verify sync status.

### Monitor Logs

```bash
journalctl -u akash-node -f
```

Press `Ctrl+C` to stop following logs.

---

## Configuration Files

Your Akash node configuration is stored in `~/.akash/config/`:

- **`app.toml`** - Cosmos SDK application configuration (gas prices, API, gRPC)
- **`config.toml`** - Tendermint consensus configuration (P2P, RPC, mempool)
- **`genesis.json`** - Genesis state of the blockchain

---

## Optional: Enable RPC & API Services

### RPC Service (Port 26657)

Already enabled if you followed Step 7. Used for transactions and queries.

**Configuration:** `~/.akash/config/config.toml`

```toml
[rpc]
laddr = "tcp://0.0.0.0:26657"
```

### API Service (Port 1317)

Enable the REST API for external tools (wallets, dashboards).

Edit `~/.akash/config/app.toml`:

```toml
[api]
enable = true
address = "tcp://0.0.0.0:1317"
```

Restart the node:

```bash
systemctl restart akash-node
```

---

## State Pruning

Control how much blockchain history your node stores.

**Pruning Strategies:**

1. **`default`** - Keep last 100 states + every 500th state (recommended)
2. **`nothing`** - Keep all history (archival node, requires >1TB storage)
3. **`everything`** - Keep only current state (not for validators!)
4. **`custom`** - Manual configuration

**Configuration:** `~/.akash/config/app.toml`

```toml
[pruning]
pruning = "default"
```

**Important:** Validators should use `default` or `nothing`. Never use `everything` for validator nodes.

---

## Other Networks

This guide uses Akash mainnet. For testnet or edgenet:

- [Akash Network Configurations](https://github.com/akash-network/net)

---

## Next Steps

- **For Validators:** See [Running a Validator](/docs/node-operators/validators/running-a-validator)
- **For Providers:** Use your node as an RPC endpoint in provider configuration
- **For dApps:** Configure your application to use your node's RPC/API endpoints

---

**Questions?** Join [#validators on Discord](https://discord.com/channels/747885925232672829/771909963946237993)
