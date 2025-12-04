---
categories: ["Node Operators"]
tags: ["Validators", "TMKMS", "Security"]
weight: 3
title: "Validator with TMKMS"
linkTitle: "TMKMS and Stunnel"
description: "Deploy an Akash validator with remote key management using TMKMS and Stunnel"
---

Deploy an Akash validator on the network with **Tendermint Key Management System (TMKMS)** for maximum security. Your validator private key is stored on a separate, secured server instead of the validator node itself.

**Time:** 2-3 hours

---

## Overview

This guide shows how to deploy a validator with:

**Features:**
- **Remote Key Management** - Validator key stored on separate TMKMS server
- **Encrypted Communication** - Stunnel provides TLS encryption between validator and TMKMS
- **Runs on Akash** - Validator deployed on Akash Network
- **State Sync** - Fast initial synchronization (~5 minutes)

**Security Benefits:**
- Validator private key never on validator node
- Key can be on HSM (Hardware Security Module)
- Key isolated from internet-facing validator
- Additional layer against key theft

---

## Architecture

```
+-----------------------+         Encrypted         +-----------------------+
|   Akash Validator     |        (Stunnel)         |    TMKMS Server       |
|   (Deployment)        | <-------------------->   |   (Your Server)       |
|                       |                          |                       |
|  +----------------+   |                          |  +----------------+   |
|  | Validator Node |   |       Port 26658        |  |    TMKMS       |   |
|  |  (no priv key) |---|-----(signs blocks)------|--| (has priv key) |   |
|  +----------------+   |                          |  +----------------+   |
|                       |                          |                       |
|  +----------------+   |                          |  +----------------+   |
|  |    Stunnel     |   |       Port 36658        |  |    Stunnel     |   |
|  |    Server      |---|-----(TLS tunnel)--------|--| Client (Docker)|   |
|  +----------------+   |                          |  +----------------+   |
+-----------------------+                          +-----------------------+
         |                                                   |
         |                                                   |
         v                                                   v
   Akash Network                                    Your Infrastructure
```

**How it works:**
1. Validator receives block to sign
2. Sends signing request to Stunnel server (port 26658)
3. Stunnel server encrypts and forwards to Stunnel client (port 36658)
4. Stunnel client decrypts and forwards to TMKMS (port 26658)
5. TMKMS signs with private key
6. Signature returns via same encrypted path
7. Validator broadcasts signed block

---

## Prerequisites

Before starting, ensure you have:

### 1. Akash Wallet
- Funded with 50+ AKT for deployment deposits
- See [Akash CLI Installation](/docs/deployments/akash-cli/installation)

### 2. Separate TMKMS Server
- **OS:** Ubuntu 20.04+ or 22.04 LTS
- **CPU:** 2 cores minimum
- **RAM:** 2 GB minimum
- **Network:** Internet connectivity
- **Security:** Firewall configured, SSH hardened
- **Access:** Root or sudo access

### 3. Validator Private Key
- From existing validator, or
- Generate new key (we'll cover this)

### 4. Akash Console
- Familiar with deploying on Akash
- See [Akash Console Guide](/docs/developers/akash-console)

---

## Step 1 - Obtain Validator Private Key

You need a validator private key to import into TMKMS.

### Option A: Use Existing Validator Key

If you have an existing validator:

```bash
cat ~/.akash/config/priv_validator_key.json
```

Copy this file's contents and save securely.

### Option B: Generate New Key

Deploy a temporary Akash node to generate a key:

1. Follow [Node Build via Omnibus](/docs/node-operators/node-build/omnibus)
2. Once deployed, run in shell:

```bash
cat ~/.akash/config/priv_validator_key.json
```

3. Copy the key contents
4. Close the deployment

### Key Format

Your private key file should look like:

```json
{
  "address": "134FCAC9E5C...",
  "pub_key": {
    "type": "tendermint/PubKeyEd25519",
    "value": "BrL0wA8DWiVvm..."
  },
  "priv_key": {
    "type": "tendermint/PrivKeyEd25519",
    "value": "3RphlkX7PucBKSdhFKviFV5TI..."
  }
}
```

**Security:** Save this file securely offline. You'll import it to TMKMS server next.

---

## Step 2 - Deploy Validator on Akash

Deploy the validator node (without private key) on Akash Network with Stunnel server.

### Get SDL Template

**Template:** [cosmos-omnibus TMKMS example](https://github.com/akash-network/cosmos-omnibus/blob/master/_examples/validator-and-tmkms/deploy.yml)

### Customize SDL

The SDL contains 2 services:

1. **node** - Validator node (private key managed by TMKMS)
2. **proxy** - Stunnel server (encrypts communication)

**Required customizations:**

```yaml
services:
  node:
    env:
      - MONIKER=my-validator  # Change this
  
  proxy:
    env:
      - PSK=<your-unique-psk>  # Generate strong PSK
```

**Generate PSK (Pre-Shared Key):**

```bash
openssl rand -hex 32
```

Save this PSK - you'll need it for Stunnel client configuration.

### Full SDL (Customized)

```yaml
---
version: "2.0"

services:
  node:
    image: ghcr.io/akash-network/cosmos-omnibus:v1.2.35-akash-v1.1.0
    env:
      - MONIKER=my-validator  # Change this
      - CHAIN_JSON=https://raw.githubusercontent.com/akash-network/net/main/mainnet/meta.json
      - MINIMUM_GAS_PRICES=0.025uakt
      - P2P_POLKACHU=1
      - STATESYNC_POLKACHU=1
      - AKASH_PRIV_VALIDATOR_LADDR=tcp://0.0.0.0:26658  # Remote signer
    expose:
      - port: 26657  # RPC (internal to proxy only)
        to:
          - service: proxy
      - port: 26658  # Signing port (internal to proxy only)
        to:
          - service: proxy
    params:
      storage:
        data:
          mount: /root/.akash
  
  proxy:
    image: ghcr.io/ovrclk/stunnel-proxy:v0.0.1
    env:
      - PSK=<your-psk-from-above>  # Must match Stunnel client
      - STUNNEL_SVC_RPC_ACCEPT=36657
      - STUNNEL_SVC_RPC_CONNECT=node:26657
      - STUNNEL_SVC_SIGNER_ACCEPT=36658
      - STUNNEL_SVC_SIGNER_CONNECT=node:26658
    expose:
      - port: 36657  # Encrypted RPC (global)
        to:
          - global: true
      - port: 36658  # Encrypted signer (global)
        to:
          - global: true

profiles:
  compute:
    node:
      resources:
        cpu:
          units: 8
        memory:
          size: 16Gi
        storage:
          - size: 1Gi
          - name: data
            size: 500Gi
            attributes:
              persistent: true
              class: beta3
    proxy:
      resources:
        cpu:
          units: 1
        memory:
          size: 512Mi
        storage:
          size: 512Mi
  
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
          amount: 100000
        proxy:
          denom: uakt
          amount: 10000

deployment:
  node:
    dcloud:
      profile: node
      count: 1
  proxy:
    dcloud:
      profile: proxy
      count: 1
```

### Deploy via Akash Console

1. Open [Akash Console](https://console.akash.network)
2. Click **"Deploy"**
3. Select **"Empty"** template
4. Paste your customized SDL
5. Accept deposit (increase to 50+ AKT for longer runtime)
6. **Select trusted provider** (validator security is critical!)
7. Submit deployment

### Wait for Deployment

**Expected behavior:**
- Deployment will show as running
- Node container will restart repeatedly with error
- **This is normal!** Node is waiting for TMKMS connection

### Capture Connection Details

You need 3 pieces of information from the deployment:

1. Go to **"LEASES"** tab
2. Find the **"Forwarded Ports"** section
3. Note:

**Provider URI:** (e.g., `provider.mainnet-1.ca.aksh.pw`)

**Port for 36658 → ???:** (e.g., `31684`) - This is your **Signer Port**

**Port for 36657 → ???:** (e.g., `32675`) - This is your **RPC Port**

Save these - you'll need them for Stunnel client configuration.

---

## Step 3 - Setup TMKMS Server

**All commands in this step run on your TMKMS server (not the Akash deployment).**

### Install Dependencies

```bash
# Update system
sudo apt update
sudo apt install -y git build-essential ufw curl jq libusb-1.0-0-dev

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Set Rust flags for optimization
export RUSTFLAGS=-Ctarget-feature=+aes,+ssse3
```

### Install TMKMS

```bash
cd ~
git clone https://github.com/iqlusioninc/tmkms.git
cd ~/tmkms
cargo install tmkms --features=softsign
```

**This takes 5-10 minutes to compile.**

### Initialize TMKMS

```bash
mkdir -p /etc/tmkms
tmkms init /etc/tmkms/
```

**Created files:**
- `/etc/tmkms/tmkms.toml` - Configuration file
- `/etc/tmkms/secrets/` - Directory for keys

### Import Validator Private Key

Create the key file:

```bash
vi /etc/tmkms/secrets/priv_validator_key.json
```

Paste your validator private key from Step 1:

```json
{
  "address": "134FCAC9E5C...",
  "pub_key": {
    "type": "tendermint/PubKeyEd25519",
    "value": "BrL0wA8DWiVvm..."
  },
  "priv_key": {
    "type": "tendermint/PrivKeyEd25519",
    "value": "3RphlkX7PucBKSdhFKviFV5TI..."
  }
}
```

### Convert Key to TMKMS Format

```bash
tmkms softsign import \
  /etc/tmkms/secrets/priv_validator_key.json \
  /etc/tmkms/secrets/priv_validator_key.softsign
```

**Expected output:**
```
Imported validator key akashvalcons1...
```

### Secure Key Permissions

```bash
chmod 600 /etc/tmkms/secrets/priv_validator_key.softsign
```

### Delete Original Key File

```bash
shred -uvz /etc/tmkms/secrets/priv_validator_key.json
```

**Important:** The key is now in `.softsign` format. Back up this file securely offline.

---

### Configure TMKMS

Create configuration file:

```bash
cat > /etc/tmkms/tmkms.toml <<EOF
# Tendermint KMS configuration

[[chain]]
id = "akashnet-2"
key_format = { type = "bech32", account_key_prefix = "akashpub", consensus_key_prefix = "akashvalconspub" }
state_file = "/etc/tmkms/state/akashnet-2-consensus.json"

[[providers.softsign]]
chain_ids = ["akashnet-2"]
key_type = "consensus"
path = "/etc/tmkms/secrets/priv_validator_key.softsign"

[[validator]]
chain_id = "akashnet-2"
addr = "tcp://127.0.0.1:36658"
secret_key = "/etc/tmkms/secrets/kms-identity.key"
protocol_version = "v0.34"
reconnect = true
EOF
```

**Important settings:**
- `chain_id` - Must be `akashnet-2` (mainnet)
- `addr` - Points to Stunnel client (local port 36658)
- `reconnect` - Automatically reconnects if connection drops

### Create State Directory

```bash
mkdir -p /etc/tmkms/state
```

---

## Step 4 - Setup Stunnel Client

The Stunnel client provides encrypted connection between TMKMS and your Akash validator.

**Run on TMKMS server (same server as TMKMS).**

### Install Docker and Docker Compose

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Clone Stunnel Proxy Repository

```bash
mkdir -p ~/stunnel
cd ~/stunnel
git clone https://github.com/akash-network/stunnel-proxy
cd stunnel-proxy/client
```

### Configure Stunnel Client

Edit `docker-compose.yml`:

```bash
vi docker-compose.yml
```

**Update these variables with your deployment details from Step 2:**

```yaml
environment:
  - PSK=<your-psk>  # Must match SDL PSK
  - STUNNEL_SVC_RPC_CONNECT=<provider-uri>:<rpc-port>
  - STUNNEL_SVC_SIGNER_CONNECT=<provider-uri>:<signer-port>
```

**Example:**

```yaml
environment:
  - PSK=a1b2c3d4e5f6789...
  - STUNNEL_SVC_RPC_CONNECT=provider.mainnet-1.ca.aksh.pw:32675
  - STUNNEL_SVC_SIGNER_CONNECT=provider.mainnet-1.ca.aksh.pw:31684
```

### Start Stunnel Client

```bash
docker-compose up -d
```

### Verify Stunnel Client

```bash
docker-compose logs -f
```

**Expected:** Should show successful TLS connection to Stunnel server.

---

## Step 5 - Start TMKMS

Run TMKMS service on your TMKMS server.

### Start in Foreground (Testing)

```bash
tmkms start -c /etc/tmkms/tmkms.toml
```

### Expected Initial Logs

**While waiting for Stunnel connection, you'll see:**

```
INFO tmkms::commands::start: tmkms starting...
INFO tmkms::keyring: [keyring:softsign] added consensus Ed25519 key
INFO tmkms::connection::tcp: KMS node ID: 948f8fee83f7715f99b8b8a53d746ef00e7b0d9e
ERROR tmkms::client: [akashnet-2@tcp://127.0.0.1:36658] I/O error: Connection refused (os error 111)
```

**This is normal!** TMKMS is trying to connect to Stunnel client (port 36658).

### Wait for Connection

After Stunnel client connects (from Step 4), you'll see:

```
INFO tmkms::connection::tcp: KMS node ID: 7a1f7c7f726d94787045cca9fee05c1ec67cd09a
INFO tmkms::session: [akashnet-2@tcp://127.0.0.1:36658] connected to validator successfully
WARN tmkms::session: [akashnet-2@tcp://127.0.0.1:36658]: unverified validator peer ID!
```

**Success!** TMKMS is now connected and signing blocks.

### Run as Service (Production)

Create systemd service:

```bash
sudo tee /etc/systemd/system/tmkms.service > /dev/null <<EOF
[Unit]
Description=Akash TMKMS
After=network.target

[Service]
Type=simple
User=root
ExecStart=/root/.cargo/bin/tmkms start -c /etc/tmkms/tmkms.toml
Restart=on-failure
RestartSec=3
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
EOF
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable tmkms
sudo systemctl start tmkms
```

Check status:

```bash
sudo systemctl status tmkms
sudo journalctl -u tmkms -f
```

---

## Step 6 - Verify Everything is Working

### Check TMKMS Logs

```bash
sudo journalctl -u tmkms -f --lines 50
```

**Look for:**
- ✅ `connected to validator successfully`
- ✅ Signing messages (height increasing)

### Check Akash Validator Logs

In [Akash Console](https://console.akash.network):

1. Go to your deployment
2. Click **"LOGS"** tab
3. Select **"node"** service

**Look for:**
- ✅ `executed block height=...`
- ✅ `committed state height=...`
- ✅ Height increasing continuously

### Check Stunnel Proxy Logs

In Akash Console:

1. Select **"proxy"** service from logs
2. **Look for:** TLS connection success messages

**Example successful logs:**
```
LOG5: Service [signer] connected remote server
LOG6: TLS accepted: previous session reused
LOG6: TLSv1.3 ciphersuite: TLS_CHACHA20_POLY1305_SHA256
```

---

## Step 7 - Create Your Validator

Now that your node is running with TMKMS, create the validator.

### Set Environment Variables

On your local machine (with `akash` CLI):

```bash
export AKASH_NET="https://raw.githubusercontent.com/akash-network/net/main/mainnet"
export AKASH_CHAIN_ID="$(curl -s "$AKASH_NET/chain-id.txt")"
export AKASH_NODE="$(curl -s "$AKASH_NET/rpc-nodes.txt" | head -1)"
export AKASH_KEYNAME=<your-key-name>
export AKASH_GAS=auto
export AKASH_GAS_ADJUSTMENT=1.25
export AKASH_GAS_PRICES=0.025uakt
```

### Get Validator Public Key

You need the validator's **consensus public key**. This is in the TMKMS startup logs.

Look for:
```
INFO tmkms::keyring: added consensus Ed25519 key: akashvalconspub1zcjduepq...
```

Or query your deployment via shell and run:
```bash
akash tendermint show-validator
```

Save this value as `AKASH_VALOPER_PUBKEY`.

### Create Validator Transaction

```bash
akash tx staking create-validator \
  --amount=1000000uakt \
  --pubkey="$AKASH_VALOPER_PUBKEY" \
  --moniker="<your-moniker>" \
  --chain-id="$AKASH_CHAIN_ID" \
  --commission-rate="0.10" \
  --commission-max-rate="0.20" \
  --commission-max-change-rate="0.01" \
  --min-self-delegation="1" \
  --gas="$AKASH_GAS" \
  --gas-adjustment="$AKASH_GAS_ADJUSTMENT" \
  --gas-prices="$AKASH_GAS_PRICES" \
  --from="$AKASH_KEYNAME"
```

**Parameters:**
- `--amount` - Self-delegation amount (e.g., 1000000uakt = 1 AKT)
- `--moniker` - Your validator's display name
- `--commission-rate` - Starting commission (e.g., 0.10 = 10%)

### Verify Validator

```bash
akash query staking validator $(akash keys show $AKASH_KEYNAME --bech val -a)
```

Check on [Akash Block Explorers](/docs/network/akash):
- [Mintscan](https://www.mintscan.io/akash/validators)
- [Ping.pub](https://ping.pub/akash/staking)

---

## Security Best Practices

### TMKMS Server Hardening

**Firewall rules:**
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp  # SSH
sudo ufw enable
```

**Disable password authentication:**
```bash
sudo vi /etc/ssh/sshd_config
# Set: PasswordAuthentication no
sudo systemctl restart sshd
```

### Key Backups

**Critical files to backup securely offline:**
- `/etc/tmkms/secrets/priv_validator_key.softsign`
- `/etc/tmkms/secrets/kms-identity.key`
- Your wallet mnemonic

### Monitoring

Monitor these continuously:
- TMKMS service status
- Stunnel connection
- Validator uptime
- Disk space on validator deployment

### High Availability

**For production validators:**
- Use HSM for TMKMS keys
- Implement Sentry Node Architecture
- Deploy multiple sentries across providers
- Monitor with alerts (PagerDuty, etc.)

---

## Troubleshooting

### TMKMS Connection Refused

**Symptom:** `Connection refused (os error 111)`

**Solutions:**
1. Verify Stunnel client is running: `docker ps`
2. Check Stunnel client logs: `docker-compose logs -f`
3. Verify PSK matches in both SDL and docker-compose.yml
4. Verify ports in tmkms.toml (36658)

### Validator Not Signing

**Symptom:** TMKMS connected but no signing messages

**Solutions:**
1. Check validator logs for errors
2. Verify `priv_validator_key.json` deleted from validator
3. Restart validator deployment
4. Check state file: `cat /etc/tmkms/state/akashnet-2-consensus.json`

### Stunnel TLS Errors

**Symptom:** `TLS handshake failed`

**Solutions:**
1. Verify PSK matches exactly
2. Check provider URI and ports
3. Verify Akash deployment is running
4. Check firewall rules

---

## Additional Resources

- [TMKMS GitHub](https://github.com/iqlusioninc/tmkms)
- [Cosmos Validator Security](https://hub.cosmos.network/main/validators/security.html)
- [Stunnel Documentation](https://www.stunnel.org/docs.html)
- [Omnibus TMKMS Example](https://github.com/akash-network/cosmos-omnibus/tree/master/_examples/validator-and-tmkms)
