---
categories: ["Node Operators"]
tags: ["Validators"]
weight: 1
title: "Running a Validator"
linkTitle: "Running a Validator"
description: "Create and manage an Akash validator node on mainnet"
---

This guide shows how to create and manage an Akash validator on mainnet.

**Time:** 30-45 minutes

---

## Prerequisites

Before creating a validator, ensure you have:

### 1. Full Node Running

**Your node must be fully synced before creating a validator.**

- See [Node Build Guides](/docs/node-operators/node-build)
- Verify sync status: `akash status | jq '.sync_info.catching_up'`
- Should return `false` when fully synced

### 2. Hardware Requirements

- **CPU:** 8 cores (16 cores recommended)
- **Memory:** 128 GB required
- **Storage:** 512 GB SSD/NVMe (1 TB+ recommended)
- **Network:** 100 Mbps+
- **Uptime:** 99.9%+ to avoid slashing

### 3. Akash Wallet with Sufficient AKT

- **Minimum:** 2 AKT required (1 AKT for self-delegation + 1 AKT for fees)
- **Recommended:** 10,000+ AKT to be competitive in the active set

**Create a wallet:**

```bash
akash keys add <key-name>
```

**Fund your wallet** via exchange or [Keplr](https://wallet.keplr.app/).

### 4. Understand Active Validator Set

- **Active Set Size:** 100 validators
- **Entry Requirement:** More voting power than the 100th validator
- **Check Requirements:** Use `$votingpower` in Discord #validator-alerts channel

---

## Step 1 - Set Environment Variables

```bash
# Network configuration
export AKASH_NET="https://raw.githubusercontent.com/akash-network/net/main/mainnet"
export AKASH_CHAIN_ID="$(curl -s "$AKASH_NET/chain-id.txt")"
export AKASH_NODE="https://rpc.akashnet.net:443"

# Your configuration
export AKASH_KEY_NAME="<your-key-name>"
export AKASH_MONIKER="<your-validator-name>"
```

**Replace:**
- `<your-key-name>` - Name of your wallet key
- `<your-validator-name>` - Public name for your validator

---

## Step 2 - Get Your Validator Public Key

```bash
akash tendermint show-validator
```

**Expected output:**

```json
{"@type":"/cosmos.crypto.ed25519.PubKey","key":"..."}
```

**Important:** The private key for this validator lives in `~/.akash/config/priv_validator_key.json`. **Back up this file securely.**

---

## Step 3 - Create Your Validator

### Understand Commission Parameters

Before creating your validator, understand commission structure:

**`commission-rate`** (e.g., `"0.10"` = 10%)
- Your commission on delegator rewards
- Typical range: 5-10%

**`commission-max-rate`** (e.g., `"0.20"` = 20%)
- Maximum commission you can ever charge
- **Cannot be changed** after validator creation

**`commission-max-change-rate`** (e.g., `"0.01"` = 1%)
- Maximum % point change per day
- Example: 10% → 11% = 1 percentage point change
- Prevents sudden commission spikes

**`min-self-delegation`** (e.g., `"1"`)
- Minimum self-delegated AKT (in uakt)
- `"1"` = minimum 1 uakt self-delegation

### Create Validator JSON File

Create a file named `validator.json`:

```json
{
  "pubkey": {"@type":"/cosmos.crypto.ed25519.PubKey","key":"YOUR_VALIDATOR_PUBKEY_HERE"},
  "amount": "1000000uakt",
  "moniker": "your-moniker",
  "identity": "",
  "website": "",
  "security": "",
  "details": "",
  "commission-rate": "0.10",
  "commission-max-rate": "0.20",
  "commission-max-change-rate": "0.01",
  "min-self-delegation": "1"
}
```

### Populate the JSON File Automatically

You can automatically populate the pubkey field by running:

```bash
PUBKEY=$(akash tendermint show-validator)

cat > validator.json <<EOF
{
  "pubkey": $PUBKEY,
  "amount": "1000000uakt",
  "moniker": "$AKASH_MONIKER",
  "identity": "",
  "website": "",
  "security": "",
  "details": "",
  "commission-rate": "0.10",
  "commission-max-rate": "0.20",
  "commission-max-change-rate": "0.01",
  "min-self-delegation": "1"
}
EOF
```

**Customize the values:**
- `amount`: Amount to stake (1000000uakt = 1 AKT)
- `moniker`: Your validator name
- `identity`: Your Keybase 16-digit ID (optional, for logo)
- `website`: Your validator website (optional)
- `security`: Security contact email (optional)
- `details`: Description of your validator (optional)
- `commission-rate`: Your commission (0.10 = 10%)
- `commission-max-rate`: Maximum commission (cannot change after creation)
- `commission-max-change-rate`: Max change per day (0.01 = 1 percentage point)
- `min-self-delegation`: Minimum self-delegation (1 = 1 uakt)

### Submit the Create Validator Transaction

Now submit the validator creation transaction using the JSON file:

```bash
akash tx staking create-validator validator.json \
  --chain-id="$AKASH_CHAIN_ID" \
  --gas="auto" \
  --gas-prices="0.025uakt" \
  --gas-adjustment=1.5 \
  --from="$AKASH_KEY_NAME"
```

**What this does:**
- Stakes 1 AKT (1000000 uakt) from your wallet
- Creates validator with your specified parameters
- Registers your validator on the blockchain

**Save your validator address** from the output:

```
akashvaloper1...
```

> **Tip:** When specifying commission parameters, the `commission-max-change-rate` is used to measure % point change over the `commission-rate`. E.g. 1% to 2% is a 100% rate increase, but only 1 percentage point.

> **Tip:** `min-self-delegation` is a strictly positive integer that represents the minimum amount of self-delegated voting power your validator must always have. A `min-self-delegation` of `1` means your validator will never have a self-delegation lower than 1 uakt.

---

## Step 4 - Edit Validator Profile (Optional)

Add description, website, and logo to your validator profile.

### Get Keybase Identity (for logo)

1. Create account at [keybase.io](https://keybase.io)
2. Upload your validator logo (recommended: 256x256px)
3. Get your 16-digit Keybase ID

### Update Validator Profile

```bash
akash tx staking edit-validator \
  --new-moniker="My Validator" \
  --website="https://myvalidator.com" \
  --identity=<your-16-digit-keybase-id> \
  --details="Professional Akash validator | 99.9% uptime" \
  --security-contact="security@myvalidator.com" \
  --chain-id="$AKASH_CHAIN_ID" \
  --gas="auto" \
  --gas-prices="0.025uakt" \
  --gas-adjustment=1.5 \
  --from="$AKASH_KEY_NAME"
```

### Update Commission Rate (Optional)

You can change your commission rate once per day within your `commission-max-change-rate`.

```bash
akash tx staking edit-validator \
  --commission-rate="0.08" \
  --chain-id="$AKASH_CHAIN_ID" \
  --gas="auto" \
  --gas-prices="0.025uakt" \
  --gas-adjustment=1.5 \
  --from="$AKASH_KEY_NAME"
```

**Restrictions:**
- Must be between 0 and `commission-max-rate`
- Cannot change more than `commission-max-change-rate` per day
- Example: If `commission-max-change-rate=0.01`, you can only change by 1% point per day

---

## Verify Your Validator

### Check Validator Status

```bash
export AKASH_VALIDATOR_ADDRESS="akashvaloper1..."

akash query staking validator $AKASH_VALIDATOR_ADDRESS
```

**Expected output:**

```yaml
commission:
  commission_rates:
    rate: "0.100000000000000000"
    max_rate: "0.200000000000000000"
    max_change_rate: "0.010000000000000000"
  update_time: "2024-01-15T10:30:00Z"
description:
  moniker: My Validator
  website: https://myvalidator.com
  details: Professional Akash validator
jailed: false
status: BOND_STATUS_BONDED  # or BOND_STATUS_UNBONDED
tokens: "1000000"
```

**Status meanings:**
- `BOND_STATUS_BONDED` - Active in validator set
- `BOND_STATUS_UNBONDED` - Not in top 100 (need more stake)
- `BOND_STATUS_UNBONDING` - Exiting validator set

### Check if in Active Set

```bash
akash query tendermint-validator-set | grep "$(akash tendermint show-validator)"
```

**If output is empty:** Your validator is not in the active set (top 100). You need more voting power.

### Check Node Sync Status

```bash
akash status | jq '.sync_info'
```

**Important fields:**
- `catching_up: false` - Node is synced
- `latest_block_height` - Current block (compare with explorer)

---

## Validator Operations

### View Signing Information

Track your validator's signing performance:

```bash
akash query slashing signing-info \
  $(akash tendermint show-validator) \
  --chain-id="$AKASH_CHAIN_ID"
```

**Output shows:**
- Missed blocks
- Jailed status
- Tombstone status (permanent jail)

### Unjail Validator

If your validator was jailed for downtime:

**Prerequisites:**
- Your node must be fully synced
- Wait at least 10 minutes after downtime period

```bash
akash tx slashing unjail \
  --from="$AKASH_KEY_NAME" \
  --chain-id="$AKASH_CHAIN_ID" \
  --gas="auto" \
  --gas-prices="0.025uakt" \
  --gas-adjustment=1.5
```

**Note:** You **cannot** unjail if you were tombstoned (double-sign). That's permanent.

### Halt Validator for Maintenance

To gracefully stop your validator at a specific block height:

```bash
# Edit config.toml or use flag
akash start --halt-height=12345678
```

The node will stop at block `12345678` with exit code 0.

---

## Monitoring Your Validator

### Check Validator on Explorer

View your validator on a block explorer:
- [Mintscan](https://www.mintscan.io/akash/validators)
- [ATOMScan](https://atomscan.com/akash/validators)
- [Arcturian Explorer](https://explorer.arcturian.tech/akash/staking)

Search for your `akashvaloper` address or moniker.

### Monitor Uptime

**Critical:** Validators must sign >95% of blocks to avoid jailing.

**Missed block threshold:** 500 out of 10,000 blocks (~5%)

Set up monitoring with:
- [PANIC by Simply VC](https://github.com/SimplyVC/panic)
- [Tenderduty](https://github.com/blockpane/tenderduty)

### Check Voting Power

```bash
akash query staking validator $AKASH_VALIDATOR_ADDRESS | grep "tokens"
```

**To increase voting power:**
- Self-delegate more AKT
- Attract delegators through marketing
- Maintain high uptime and commission

---

## Troubleshooting

### Validator Has Zero Voting Power

**Cause:** Your validator was jailed for downtime or double-signing.

**Solution:**

1. **Check if jailed:**

```bash
akash query staking validator $AKASH_VALIDATOR_ADDRESS | grep "jailed"
```

2. **If jailed for downtime:**
   - Ensure node is synced and running
   - Wait 10+ minutes
   - [Unjail your validator](#unjail-validator)

3. **If tombstoned (double-sign):**
   - **Cannot recover** - this is permanent
   - You must create a new validator with a new key

### Validator Not in Active Set

**Cause:** Your voting power is less than the 100th validator.

**Solution:**

Check current requirements:
```bash
# In Discord #validator-alerts
$votingpower
```

**To join active set:**
- Self-delegate more AKT
- Attract delegators
- Lower commission (temporarily)

### Node Crashes: "Too Many Open Files"

**Cause:** Linux default file descriptor limit (1024) is too low.

**Solution:**

```bash
# Temporary fix
ulimit -n 4096
systemctl restart akash-node

# Permanent fix (add to /etc/security/limits.conf)
* soft nofile 65536
* hard nofile 65536
```

Restart your session for permanent fix to take effect.

### Node Out of Sync

**Symptoms:** `catching_up: true` persists

**Solution:**

1. **Check peers:**

```bash
akash status | jq '.node_info.other.peers'
```

2. **Add more peers** in `~/.akash/config/config.toml`:

Get peers from:
- [Polkachu Peers](https://polkachu.com/live_peers/akash)
- [Akash net repo](https://github.com/akash-network/net/blob/main/mainnet/peer-nodes.txt)

3. **Restart node:**

```bash
systemctl restart akash-node
```

### Commission Change Rejected

**Error:** `commission cannot be changed more than max change rate`

**Cause:** Trying to change commission by more than `commission-max-change-rate` in 24 hours.

**Solution:** Wait 24 hours between commission changes, or make smaller incremental changes.

---

## Security Best Practices

1. **Backup Private Key**
   - File: `~/.akash/config/priv_validator_key.json`
   - Store offline in multiple secure locations
   - **Never share** this key

2. **Use Sentry Nodes**
   - Hide validator behind sentry nodes
   - See [Sentry Node Architecture](https://forum.cosmos.network/t/sentry-node-architecture-overview/454)

3. **Enable Firewall**
   - Only allow necessary ports
   - Restrict SSH access

4. **Consider TMKMS**
   - Hardware Security Module (HSM) integration
   - See [TMKMS Guide](/docs/node-operators/validators/tmkms-stunnel)

5. **Monitor 24/7**
   - Set up alerting for downtime
   - Monitor disk space
   - Track signing performance

---

## Next Steps

- **Community:** Join [#validators on Discord](https://discord.akash.network)
- **Advanced:** Set up [TMKMS](/docs/node-operators/validators/tmkms-stunnel)
- **Alternative:** Try [Validator via Omnibus](/docs/node-operators/validators/omnibus)

---

**Questions?** Join [#validators on Discord](https://discord.com/channels/747885925232672829/771909963946237993)
