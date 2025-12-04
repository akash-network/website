---
categories: ["Node Operators"]
tags: ["Node Build", "Omnibus"]
weight: 3
title: "Akash Node Deployment Via Omnibus"
linkTitle: "Omnibus"
---

Deploy an Akash RPC node on the Akash Network itself using Cosmos Omnibus. This method uses a pre-built Docker image and automated sync with blockchain snapshots (updated hourly).

**Time:** 5-10 minutes (deployment) + 20-30 minutes (blockchain sync via snapshot)

**Requirements:**
- Akash wallet with ~2 AKT (0.5 AKT deposit + usage)
- Akash Console or CLI

---

## Deployment SDL

Use this SDL to deploy an Akash node on the network:

```yaml
---
version: "2.0"

services:
  node:
    image: ghcr.io/akash-network/cosmos-omnibus:v1.2.35-akash-v1.1.0
    env:
      - MONIKER=my-akash-node
      - CHAIN_JSON=https://raw.githubusercontent.com/akash-network/net/main/mainnet/meta.json
      - FASTSYNC_VERSION=v0
      - P2P_POLKACHU=1
      - SNAPSHOT_URL=https://snapshots.akash.network/akashnet-2/latest
      - SNAPSHOT_DATA_PATH=data
      - ADDRBOOK_POLKACHU=1
    expose:
      - port: 26657
        to:
          - global: true
      - port: 26656
        to:
          - global: true
    params:
      storage:
        data:
          mount: /root/.akash

profiles:
  compute:
    node:
      resources:
        cpu:
          units: 4
        memory:
          size: 32Gi
        storage:
          - size: 10Gi
          - name: data
            size: 400Gi
            attributes:
              persistent: true
              class: beta3
  placement:
    dcloud:
      attributes:
        host: akash
      signedBy:
        anyOf:
          - akash1365yvmc4s7awdyj3n2sav7xfx76adc6dnmlx63
      pricing:
        node:
          denom: uakt
          amount: 1000

deployment:
  node:
    dcloud:
      profile: node
      count: 1
```

---

## Configuration Options

### Persistent Storage

The SDL uses **persistent storage** for blockchain data:

- **10Gi ephemeral** - For temporary files and logs
- **400Gi persistent (beta3)** - For blockchain data mounted at `/root/.akash`

**Why persistent storage?**
- Survives pod restarts
- Faster redeployment (no re-sync needed)
- Better for long-running nodes

**Storage classes:**
- `beta3` - NVMe (fastest, recommended)
- `beta2` - SSD
- `beta1` - HDD

To adjust storage size:

```yaml
storage:
  - size: 10Gi
  - name: data
    size: 400Gi      # Increase for more headroom
    attributes:
      persistent: true
      class: beta3   # Change to beta2 or beta1 if needed
```

### Environment Variables

**Pre-configured:**

```yaml
env:
  - MONIKER=my-akash-node                                    # Your node name (change this)
  - CHAIN_JSON=https://raw.githubusercontent.com/.../meta.json  # Chain config
  - FASTSYNC_VERSION=v0                                       # Fast sync (v0 recommended)
  - P2P_POLKACHU=1                                           # Use Polkachu peer nodes
  - SNAPSHOT_URL=https://snapshots.akash.network/.../latest   # Hourly snapshots
  - SNAPSHOT_DATA_PATH=data                                   # Snapshot extraction path
  - ADDRBOOK_POLKACHU=1                                       # Use Polkachu address book
```

**Snapshots:** Updated hourly at [https://snapshots.akash.network/akashnet-2/latest](https://snapshots.akash.network/akashnet-2/latest)

### Resource Requirements

**Current SDL specs:**
- **CPU:** 4 cores
- **Memory:** 32 GB
- **Storage:** 10 GB (ephemeral) + 400 GB (persistent)

**To adjust:**

```yaml
cpu:
  units: 8         # More cores = faster initial sync
memory:
  size: 64Gi       # More RAM for better performance
storage:
  - size: 10Gi
  - name: data
    size: 1000Gi   # 1TB for long-term operation
```

### Provider Selection

The SDL includes `signedBy` to ensure deployment on trusted Akash providers:

```yaml
signedBy:
  anyOf:
    - akash1365yvmc4s7awdyj3n2sav7xfx76adc6dnmlx63  # Akash address
```

This restricts deployment to providers audited by the specified Akash Core Team address, ensuring reliability for critical node infrastructure.

---

## Deployment

### Via Akash Console

1. Open [Akash Console](https://console.akash.network)
2. Create new deployment
3. Paste the SDL above
4. **Adjust storage size** to at least 400Gi
5. Accept .5 AKT deposit
6. Select a provider from bids
7. Wait for deployment to start

### Via Akash CLI

```bash
# Save SDL to deploy.yaml
provider-services tx deployment create deploy.yaml \
  --from mykey \
  --node https://rpc.akashnet.net:443 \
  --chain-id akashnet-2 \
  --deposit 500000uakt \
  --gas auto \
  --gas-adjustment 1.5 \
  --gas-prices 0.025uakt
```

---

## Verification

### Get Your Node URL

Your node is accessible via the provider URL and assigned port.

**In Akash Console:**
1. View your deployment
2. Find the "Leases" section
3. Look for port 26657 mapping
4. Note the provider URL and assigned port (e.g., `provider.example.com:12345`)

**Your node URL format:** `http://provider-url:assigned-port`

### Check Sync Status

Access your node via the deployment URL:

```bash
# Replace with your provider URL and assigned port
curl http://provider.example.com:12345/status | jq '.result.sync_info'
```

**Expected output:**

```json
{
  "latest_block_height": "15234567",
  "catching_up": false
}
```

**Note:** `catching_up: true` means sync is in progress. With hourly snapshots, this typically takes 20-30 minutes depending on connection speed.

### Compare Block Height

Check current block height on [Mintscan](https://www.mintscan.io/akash) and compare with your node's `latest_block_height`.

### Check Peer Connections

```bash
# Replace with your provider URL and assigned port
curl http://provider.example.com:12345/net_info | jq '.result.n_peers'
```

**Expected:** 10+ connected peers

---

## Resources

- [Cosmos Omnibus GitHub](https://github.com/akash-network/cosmos-omnibus)
- [Akash Network Configs](https://github.com/akash-network/net)
- [Chain Registry](https://github.com/cosmos/chain-registry)
