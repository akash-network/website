---
categories: ["Node Operators"]
tags: ["Hermes", "Oracle", "Pyth", "Wormhole", "Price Relayer"]
weight: 5
title: "Hermes Relayer Setup"
linkTitle: "Hermes Relayer"
description: "Run the Akash Hermes client to relay Pyth price feeds to the oracle"
---

The Akash Hermes client is a lightweight Docker-based service that fetches signed AKT/USD price data (VAAs) from Pyth Network's Hermes API and submits it to the on-chain Pyth contract. The Pyth contract verifies guardian signatures via the Wormhole contract and then updates the oracle module.

**Note:** This is Akash's custom Hermes client ([github.com/akash-network/hermes](https://github.com/akash-network/hermes)), not the Cosmos IBC relayer also named Hermes. They are entirely different tools.

**Image:** `ghcr.io/akash-network/hermes:v0.0.2`

---

## Overview

1. Hermes fetches signed AKT/USD price data (VAAs) from Pyth Network's Hermes API.
2. It submits each VAA to the on-chain Pyth contract via `MsgExecuteContract`.
3. The Pyth contract calls the Wormhole contract to verify guardian signatures before storing the price in the oracle module.

Without a running Hermes relayer (or equivalent), oracle prices do not update. Validators or third parties typically run Hermes to keep the chain supplied with price feeds.

---

## VM Requirements

The Hermes client is a stateless Node.js process that fetches price data every 60 seconds and submits a single transaction. Resource requirements are minimal:

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| vCPU | 1 | 1 |
| RAM | 512MB | 1GB |
| Disk | 10GB | 10GB |
| Network | Outbound HTTPS only | Outbound HTTPS only |

**Inbound ports:** None required. The optional health check endpoint on port 3000 is internal only.

**Outbound connectivity required:**
- `hermes.pyth.network` (HTTPS/443) — Pyth price feed API
- Akash RPC endpoint (HTTPS/443) — transaction submission

A small cloud VM (e.g. GCP `e2-micro`) is sufficient.

---

## Prerequisites

- Ubuntu VM with internet access and Akash RPC connectivity
- Docker installed
- Pyth and Wormhole contracts deployed on the target network (e.g. after Mainnet v2.0.0 or testnet deployment)
- Funded Hermes relayer wallet

---

## Step 1: Install Docker

```bash
apt update && apt upgrade -y
curl -fsSL https://get.docker.com | sh
docker --version
```

---

## Step 2: Create and Fund Hermes Wallet

Create a dedicated Akash account for the Hermes relayer. This wallet pays gas for price-update transactions only. Use a dedicated wallet and do not reuse one that holds significant funds.

```bash
akash keys add hermes-relayer --keyring-backend test

# Note the address and save the mnemonic securely — you will need it for starting the container
akash keys show hermes-relayer -a

# Fund with AKT (10,000 AKT recommended for sustained operation)
akash tx bank send <source-wallet> $(akash keys show hermes-relayer -a) \
  10000000000uakt --from <source-wallet> --chain-id <chain-id> -y

# Verify balance
akash query bank balances $(akash keys show hermes-relayer -a)
```

**Cost estimate:** Each price update uses ~578,000 gas plus a 1 uakt update fee (≈ 0.015 AKT per update). At 60-second intervals: ~25 AKT/day.

---

## Step 3: Configure Environment

On the Hermes VM, create an environment file with all configuration **except** the wallet mnemonic.

Get the Pyth contract address on the target network:

```bash
akash query oracle params -o json \
  --node <rpc-endpoint> | jq '.params.sources'
```

The first address in the `sources` array is the Pyth contract address to use as `CONTRACT_ADDRESS`. For testnet, the RPC endpoint is typically `https://testnetrpc.akashnet.net:443`.

Create the env file on the Hermes VM:

```bash
cat > /root/hermes.env << 'EOF'
RPC_ENDPOINT=https://testnetrpc.akashnet.net:443
CONTRACT_ADDRESS=<PYTH_CONTRACT_ADDRESS>
HERMES_ENDPOINT=https://hermes.pyth.network
UPDATE_INTERVAL_MS=60000
GAS_PRICE=0.025uakt
DENOM=uakt
EOF

chmod 600 /root/hermes.env
```

**Why the mnemonic is excluded:** The mnemonic is passed at container start via an environment variable and is never written to disk. If the host reboots, restart the container and re-enter the mnemonic when starting it.

---

## Step 4: Start Hermes Container

Pass the mnemonic at container start; it is not stored in a file:

```bash
read -s -p "Enter hermes relayer mnemonic: " HERMES_MNEMONIC && echo

docker run -d \
  --name hermes-client \
  --env-file /root/hermes.env \
  -e "WALLET_SECRET=mnemonic:${HERMES_MNEMONIC}" \
  -p 3000:3000 \
  --restart unless-stopped \
  ghcr.io/akash-network/hermes:v0.0.2 node dist/cli.js daemon

# Clear the variable from shell memory
unset HERMES_MNEMONIC
```

---

## Step 5: Verify Operation

```bash
# Watch logs for successful submissions
docker logs -f hermes-client
```

**Expected healthy log output:**
```
Fetched price from Hermes: 44463703 (expo: -8)
  Confidence: 134234, Publish time: 1773350501
  VAA size: 1748 bytes (base64)
Submitting VAA to Pyth contract...
  Wormhole contract: akash14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9sggdamt
Price updated successfully! TX: <hash>
  Gas used: 578255
  New price: 44463703 (expo: -8)
```

**Verify prices in the oracle module:**
```bash
akash query oracle prices | head -n 20
```

**Health check endpoint:**
```bash
curl http://localhost:3000/health
```

---

## Step 6: Confirm Oracle Sources

After the first successful submission, verify the Pyth contract is an authorized oracle source and prices are flowing:

```bash
# Confirm source registered
akash query oracle params -o json | jq '.params.sources'

# Confirm prices on chain
akash query oracle prices | head -n 20

# Check BME is using oracle prices (if applicable)
akash query bme status
```

---

## Updating to a New Network

When the target network changes (e.g. testnet rebuild), update `RPC_ENDPOINT` and `CONTRACT_ADDRESS` in the env file:

```bash
# Stop and remove container
docker stop hermes-client && docker rm hermes-client

# Update env file with new values
nano /root/hermes.env

# Restart with mnemonic (see Step 4)
read -s -p "Enter hermes relayer mnemonic: " HERMES_MNEMONIC && echo

docker run -d \
  --name hermes-client \
  --env-file /root/hermes.env \
  -e "WALLET_SECRET=mnemonic:${HERMES_MNEMONIC}" \
  -p 3000:3000 \
  --restart unless-stopped \
  ghcr.io/akash-network/hermes:v0.0.2 node dist/cli.js daemon

unset HERMES_MNEMONIC

docker logs -f hermes-client
```

**Getting the new network values:**

- **RPC endpoint:** From the network's chain registry or documentation.
- **Pyth contract address:** After Pyth/Wormhole are deployed on the new network, run:
  ```bash
  akash query oracle params -o json --node <new-rpc-endpoint> | jq '.params.sources'
  ```

---

## Troubleshooting

### GuardianSignatureError

```
GuardianSignatureError: query wasm contract failed
```

The Wormhole contract's guardian set is behind the current mainnet guardian set. The Wormhole contract must be updated or redeployed with the current guardian addresses. See the node deployment guide for the current guardian set.

To check the current mainnet guardian set index:
```bash
curl -s https://raw.githubusercontent.com/wormhole-foundation/wormhole/main/guardianset/mainnetv2/ \
  | grep -o 'v[0-9]*\.prototxt' | sort -V | tail -1
```

### source ... is not authorized oracle provider

The Hermes relayer wallet or Pyth contract address is not registered in the oracle module `sources`. Submit a governance proposal to add it.

### Failed to parse URL from undefined

Missing `HERMES_ENDPOINT` in the env file. Set it to `https://hermes.pyth.network`.

### Price deviation check failing

Hermes v0.0.2 includes a price deviation check that skips submission if the new price is too close to the current on-chain price. This is normal and not an error.

---

## Key Values Reference

| Item | Value |
|------|-------|
| Docker image | `ghcr.io/akash-network/hermes:v0.0.2` |
| Hermes API | `https://hermes.pyth.network` |
| AKT/USD Feed ID | `0x4ea5bb4d2f5900cc2e97ba534240950740b4d3b89fe712a94a7304fd2fd92702` |
| Update interval | 60 seconds |
| Approx gas per update | ~578,000 gas |
| Update fee | 1000 uakt per submission |

---

## What Changes vs What Stays the Same

**When switching networks:**

| Setting | Action |
|---------|--------|
| `RPC_ENDPOINT` | Update to new network RPC |
| `CONTRACT_ADDRESS` | Update to Pyth contract address on new network |
| `WALLET_SECRET` | Update if using a different relayer wallet |

**Unchanged:**

- Docker image version
- `HERMES_ENDPOINT` (always `https://hermes.pyth.network`)
- `UPDATE_INTERVAL_MS`, `GAS_PRICE`, `DENOM`

The Hermes client is stateless; all network-specific configuration is in the env file. No image rebuild is required when switching networks.

---

## References

- [Hermes Repository](https://github.com/akash-network/hermes)
- [Pyth Hermes API](https://hermes.pyth.network)
- [Pyth Documentation](https://docs.pyth.network)
- [Wormhole Dashboard](https://wormhole-foundation.github.io/wormhole-dashboard)
- [Node Architecture: Oracle Price Pipeline](/docs/node-operators/architecture/application-layer#oracle-price-pipeline-hermes-and-cosmwasm-contracts)
