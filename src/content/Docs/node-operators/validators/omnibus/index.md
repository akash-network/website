---
categories: ["Node Operators"]
tags: ["Validators", "Omnibus"]
weight: 2
title: "Validator via Omnibus"
linkTitle: "Omnibus"
description: "Deploy an Akash validator with sentry architecture on Akash Network"
---

Deploy an Akash validator **on the Akash Network itself** using Cosmos Omnibus with a sentry node architecture for DDOS protection.

**Time:** 1-2 hours

---

## Overview

This guide shows how to run your validator as an Akash deployment with:

**Features:**
- **Sentry Node Architecture** - 2 sentry nodes protect validator from DDOS
- **Runs on Akash** - Validator and sentries deployed on Akash Network
- **S3 Key Backup** - Private keys encrypted and backed up to S3
- **State Sync** - Fast initial synchronization

**Security Note:** Your validator private key will be stored in the Akash deployment (encrypted in S3 bucket). Only use trusted providers. For maximum security, consider [TMKMS](/docs/node-operators/validators/tmkms-stunnel) instead.

---

## Prerequisites

Before starting, ensure you have:

1. **Akash Wallet**
   - Funded with 50+ AKT for deployment deposits
   - See [Akash CLI Installation](/docs/deployments/akash-cli/installation)

2. **S3 Storage Account**
   - FileBase account (free tier available)
   - Access to create buckets and keys

3. **Akash Console**
   - Familiar with deploying on Akash
   - See [Akash Console Guide](/docs/developers/akash-console)

4. **Validator Wallet** (separate from deployment wallet)
   - 2+ AKT for validator creation
   - Will be imported into deployment

---

## Architecture

```
Internet
    |
    v
[Sentry Node 1] <---> [Sentry Node 2]
    |                       |
    +-------[Validator]-----+
            (Private)
```

**How it works:**
- Validator only connects to sentry nodes (private peers)
- Sentry nodes connect to validator and public network
- Validator never directly exposed to internet
- All 3 nodes deployed as separate Akash services

---

## Step 1 - Setup S3 Storage (FileBase)

Cosmos Omnibus stores validator keys and node IDs in S3 buckets for persistence across deployment restarts. All data is encrypted before storage.

### Create FileBase Account

1. Go to [FileBase](https://console.filebase.com/)
2. Create a free account
3. Verify your email

### Create Buckets

Create 3 buckets in FileBase:

```
akashnode1
akashnode2
akashvalidator
```

**To create buckets:**
1. Click "Buckets" in sidebar
2. Click "Create Bucket"
3. Enter bucket name
4. Select "IPFS" as storage network
5. Click "Create Bucket"
6. Repeat for all 3 buckets

### Get Access Keys

1. Click "Access Keys" in sidebar
2. Copy your `Access Key` (KEY)
3. Copy your `Secret Access Key` (SECRET)
4. Save these securely - you'll need them for the SDL

**Security:** These keys grant access to your buckets. Keep them private.

---

## Step 2 - Prepare SDL Configuration

### Get SDL Template

Get the validator + sentries SDL template:

**Template:** [cosmos-omnibus validator example](https://github.com/akash-network/cosmos-omnibus/blob/master/_examples/validator-and-private-sentries/deploy.yml)

1. Download or copy the SDL
2. Open in your favorite editor

### SDL Structure

The SDL contains 3 services:
1. **validator** - Your validator node (private)
2. **node1** - First sentry node
3. **node2** - Second sentry node

**We'll configure these in two phases:**
- **Phase 1:** Initial deployment without peer IDs
- **Phase 2:** Re-deploy with peer IDs after capturing them

---

## Step 3 - Configure SDL (Phase 1)

Update environment variables for each service. **Don't worry about peer IDs yet** - we'll add those after the initial deployment.

### Validator Service

Update the `validator` service environment variables:

```yaml
validator:
  image: ghcr.io/akash-network/cosmos-omnibus:v1.2.35-akash-v1.1.0
    env:
    - MONIKER=my-validator
      - CHAIN_JSON=https://raw.githubusercontent.com/akash-network/net/main/mainnet/meta.json
    - MINIMUM_GAS_PRICES=0.025uakt
      - AKASH_MODE=validator
    - AKASH_P2P_PEX=false
    - AKASH_UNCONDITIONAL_PEER_IDS=  # Leave empty for now
      - AKASH_ADDR_BOOK_STRICT=false
      - AKASH_DOUBLE_SIGN_CHECK_HEIGHT=10
    - STATESYNC_RPC_SERVERS=https://akash-rpc.polkachu.com:443,https://akash-rpc.polkachu.com:443
    - S3_KEY=<your-filebase-access-key>
    - S3_SECRET=<your-filebase-secret-key>
    - KEY_PASSWORD=<strong-password>
      - KEY_PATH=akashvalidator
```

**Important fields:**
- `MONIKER` - Your validator name
- `AKASH_P2P_PEX` - Set to `false` for validator (no peer exchange)
- `AKASH_UNCONDITIONAL_PEER_IDS` - Leave empty for now (add sentry IDs later)
- `S3_KEY` / `S3_SECRET` - Your FileBase credentials
- `KEY_PASSWORD` - Strong password for key encryption
- `KEY_PATH` - S3 bucket name (`akashvalidator`)

### Sentry Node 1

Update the `node1` service environment variables:

```yaml
  node1:
  image: ghcr.io/akash-network/cosmos-omnibus:v1.2.35-akash-v1.1.0
    env:
    - MONIKER=sentry-node-1
      - CHAIN_JSON=https://raw.githubusercontent.com/akash-network/net/main/mainnet/meta.json
    - MINIMUM_GAS_PRICES=0.025uakt
      - AKASH_MODE=full
      - AKASH_P2P_PEX=true
    - AKASH_PRIVATE_PEER_IDS=  # Leave empty for now
    - AKASH_UNCONDITIONAL_PEER_IDS=  # Leave empty for now
      - AKASH_ADDR_BOOK_STRICT=false
      - STATESYNC_RPC_SERVERS=https://akash-rpc.polkachu.com:443,https://akash-rpc.polkachu.com:443
      - STATESYNC_SNAPSHOT_INTERVAL=500
    - S3_KEY=<your-filebase-access-key>
    - S3_SECRET=<your-filebase-secret-key>
    - KEY_PASSWORD=<strong-password>
      - KEY_PATH=akashnode1
```

**Important fields:**
- `AKASH_MODE` - Set to `full` (not `validator`)
- `AKASH_P2P_PEX` - Set to `true` for sentry (allows peer exchange)
- `AKASH_PRIVATE_PEER_IDS` / `AKASH_UNCONDITIONAL_PEER_IDS` - Leave empty for now (add validator ID later)

### Sentry Node 2

Update the `node2` service environment variables (same as node1 with different path):

```yaml
  node2:
  image: ghcr.io/akash-network/cosmos-omnibus:v1.2.35-akash-v1.1.0
    env:
    - MONIKER=sentry-node-2
      - CHAIN_JSON=https://raw.githubusercontent.com/akash-network/net/main/mainnet/meta.json
    - MINIMUM_GAS_PRICES=0.025uakt
      - AKASH_MODE=full
      - AKASH_P2P_PEX=true
    - AKASH_PRIVATE_PEER_IDS=  # Leave empty for now
    - AKASH_UNCONDITIONAL_PEER_IDS=  # Leave empty for now
      - AKASH_ADDR_BOOK_STRICT=false
      - STATESYNC_RPC_SERVERS=https://akash-rpc.polkachu.com:443,https://akash-rpc.polkachu.com:443
      - STATESYNC_SNAPSHOT_INTERVAL=500
    - S3_KEY=<your-filebase-access-key>
    - S3_SECRET=<your-filebase-secret-key>
    - KEY_PASSWORD=<strong-password>
    - KEY_PATH=akashnode2  # Different bucket!
```

**Key difference:** `KEY_PATH=akashnode2` (different S3 bucket)

---

## Step 4 - Initial Deployment

We need to deploy once to capture node IDs, then re-deploy with those IDs configured.

### Deploy via Akash Console

1. **Open Akash Console** at [console.akash.network](https://console.akash.network)
2. **Connect wallet** with your deployment funding
3. **Click "Deploy"**
4. **Select "Empty" template**
5. **Paste your SDL** (from Step 3)
6. **Review and accept** deposit (5 AKT)
7. **Select provider** (choose a trusted one for validator!)
8. **Submit deployment**

### Wait for Deployment

Allow 5-10 minutes for all services to start and sync.

**Check status:**
- All 3 services should show "Running"
- Validator and sentry pods should be syncing

---

## Step 5 - Capture Node IDs

Now we need to get the node IDs from each service.

### Get Validator ID

1. Click **"SHELL"** tab in Akash Console
2. Select **"validator"** from service dropdown
3. Run command:

```bash
akash tendermint show-node-id
```

4. Copy the ID (e.g., `2d76800f5a149510229aadf480f8ec02ac6e5297`)
5. Save to notepad

### Get Sentry Node IDs

Repeat for both sentry nodes:

1. Select **"node1"** from service dropdown
2. Run: `akash tendermint show-node-id`
3. Copy and save the ID

4. Select **"node2"** from service dropdown  
5. Run: `akash tendermint show-node-id`
6. Copy and save the ID

**You should now have 3 node IDs:**
- Validator ID
- Node1 ID
- Node2 ID

### Close Deployment

Close the deployment (we'll redeploy with IDs configured):

1. Click **"Close"** button
2. Confirm closure

---

## Step 6 - Update SDL with Node IDs

Edit your SDL with the captured node IDs.

### Update Validator Service

Add sentry node IDs to validator's `AKASH_UNCONDITIONAL_PEER_IDS`:

```yaml
- AKASH_UNCONDITIONAL_PEER_IDS=<node1-id>,<node2-id>
```

**Example:**
```yaml
      - AKASH_UNCONDITIONAL_PEER_IDS=c955c77516b4c6fc62406a63303395fc97662c1e,b3035d5dfbfeb359c716bcb714ab383e6b73a5fd
```

### Update Sentry Services

Add validator ID to **both** `node1` and `node2` services:

```yaml
- AKASH_PRIVATE_PEER_IDS=<validator-id>
- AKASH_UNCONDITIONAL_PEER_IDS=<validator-id>
```

**Example:**
```yaml
      - AKASH_PRIVATE_PEER_IDS=2d76800f5a149510229aadf480f8ec02ac6e5297
      - AKASH_UNCONDITIONAL_PEER_IDS=2d76800f5a149510229aadf480f8ec02ac6e5297
```

**Important:** Update this for **BOTH** node1 and node2 with the **same** validator ID.

---

## Step 7 - Final Deployment

Redeploy with the updated SDL containing all node IDs.

1. Open Akash Console
2. Click "Deploy"  
3. Paste your **updated** SDL (with IDs)
4. Accept deposit
5. Select **same or similar provider** as before
6. Submit deployment

**Wait 10-15 minutes** for nodes to sync and establish peer connections.

---

## Step 8 - Verify Deployment

### Check Node Sync Status

For each service (validator, node1, node2):

1. Go to **SHELL** tab
2. Select service from dropdown
3. Run:

```bash
akash status | jq '.sync_info.catching_up'
```

**Expected:** `false` (when synced)

### Check Peer Connections

Verify validator is connected to sentries:

1. Select **validator** from dropdown
2. Run:

```bash
akash status | jq '.node_info.other.peers'
```

**Expected:** Should show connections to your sentry nodes

### Check on Explorer

View your validator on:
- [Mintscan](https://www.mintscan.io/akash/validators)
- [ATOMScan](https://atomscan.com/akash/validators)
- [Arcturian Explorer](https://explorer.arcturian.tech/akash/staking)

---

## Step 9 - Create Validator

Now that your node is running and synced, create the validator.

### Export Validator Key

1. Go to SHELL tab
2. Select **validator** service
3. Run:

```bash
akash keys list
```

4. Note your validator address

### Create Validator (from local machine)

From your local machine with Akash wallet:

```bash
akash tx staking create-validator \
  --amount=1000000uakt \
  --pubkey="<validator-pubkey-from-deployment>" \
  --moniker="My Validator" \
  --chain-id=akashnet-2 \
  --commission-rate="0.10" \
  --commission-max-rate="0.20" \
  --commission-max-change-rate="0.01" \
  --min-self-delegation="1" \
  --gas="auto" \
  --gas-prices="0.025uakt" \
  --gas-adjustment=1.5 \
  --from="<your-local-key>"
```

**To get validator pubkey from deployment:**

```bash
# In deployment SHELL (validator service)
akash tendermint show-validator
```

---

## Monitoring & Maintenance

### Monitor Deployment

- Check Akash Console for service health
- Monitor deployment balance (funds deployment hosting)
- Set up alerts for deployment issues

### Backup Keys

Your keys are backed up to S3 (encrypted), but also:

1. Export keys from deployment
2. Store offline securely
3. Consider [TMKMS](/docs/node-operators/validators/tmkms-stunnel) for additional security

### Update Deployment

To update (e.g., new Omnibus version):

1. Update SDL with new image version
2. Click "Update" in Akash Console
3. Apply updated SDL

---

## Troubleshooting

### Validator Not Syncing

- Check sentry nodes are synced first
- Verify peer IDs are correctly configured
- Check deployment logs for errors

### Sentry Nodes Not Connecting

- Verify node IDs in SDL are correct
- Ensure all 3 services are running
- Check network connectivity

### Deployment Running Out of Funds

- Monitor deployment balance in Console
- Add more funds before it runs out
- Set up balance alerts

---

## Next Steps

- **Monitor:** Set up [monitoring tools](/docs/node-operators/validators#validator-resources)
- **Security:** Consider [TMKMS](/docs/node-operators/validators/tmkms-stunnel)
- **Community:** Join [#validators on Discord](https://discord.akash.network)

---

**Questions?** Join [#validators on Discord](https://discord.com/channels/747885925232672829/771909963946237993)
