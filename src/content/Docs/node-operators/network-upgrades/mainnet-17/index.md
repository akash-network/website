---
categories: ["Node Operators", "Network Upgrades"]
tags: ["Mainnet", "Upgrade", "Cosmovisor"]
weight: 1
title: "Mainnet 17 - Akash v2.0.0"
linkTitle: "Mainnet 17"
description: "Complete upgrade guide for Mainnet 17 (Akash v2.0.0)"
---

**Upgrade guide for Akash Network Mainnet 17 upgrade to v2.0.0.**

This guide provides step-by-step instructions for upgrading your node to Akash v2.0.0 using both Cosmovisor (recommended) and manual upgrade methods.

---

## Upgrade Details

**Upgrade Information:**
- **Upgrade Name:** Mainnet17
- **Binary Version:** `v2.0.0`
- **Block Height:** 26,063,777
- **Binary Release:** Binaries will be released approximately **24 hours before** the upgrade height
- **Binary Links:** [GitHub Releases](https://github.com/akash-network/node/releases/tag/v2.0.0) (once published)

> **Note:** Block times have high variance. Monitor the chain or block explorer for the upgrade. Prepare your node to halt at the upgrade height; install the v2.0.0 binary once it is released (~24 hours after the chain halts).

---

## Validator Expectations

To ensure a network upgrade with minimal downtime, Akash Validators should be available as follows:

**Timeline:**
- **One hour prior to upgrade** - Available and monitoring the Akash Discord server's `#validators` and `#validator-announcements` channels for any late-breaking guidance
- **During upgrade window** – Available throughout the expected downtime
- **After binary release** – Install v2.0.0 binary and restart once released (~24 hours after upgrade height)
- **One hour post upgrade** - Available and monitoring Discord channels for any possible revised strategies or updates deemed necessary

### Emergency Coordination

In the event of issues during the upgrade, coordinate via the **#validators channel in Discord** to reach emergency consensus and mitigate problems quickly.

**Discord:** [discord.akash.network](https://discord.akash.network)

---

## Hardware Requirements

**Recommended specifications for running a node for this upgrade:**

- **OS:** Ubuntu 24.04
- **RAM:** 128 GB with 64 GB swap
- **CPU:** 8+ cores minimum
- **Storage:** Sufficient space for blockchain data (1 TB+ recommended)

---

## Upgrade Process

Two upgrade methods are available:
1. **Cosmovisor** (Recommended) - Automatic upgrade
2. **Manual** - Manual binary replacement

Choose the method that best suits your setup. Full upgrade details and coordination can be found via the [Akash Discord #validators channel](https://discord.akash.network).

---

## Option 1: Upgrade Using Cosmovisor (Recommended)

The following instructions assume the `akash` and `cosmovisor` binaries are already installed and Cosmovisor is set up as a systemd service.

> **Note:** Cosmovisor v1.5.0 or higher is required.

Validators and RPCs supervised by Cosmovisor with `DAEMON_ALLOW_DOWNLOAD_BINARIES=true` will automatically download upgrade binaries from the upgrade info file (info.json) once available. Because binaries are released ~24 hours after the upgrade height, ensure your Cosmovisor setup can obtain the binary when released, or place the binary manually after download.

### Step 1: Configure Cosmovisor

> **Note:** Skip this step if Cosmovisor v1.5.0+ is already installed and configured.

**Install Cosmovisor:**

```bash
go install cosmossdk.io/tools/cosmovisor/cmd/cosmovisor@v1.5.0
```

**Verify installation:**

```bash
DAEMON_NAME=akash DAEMON_HOME=~/.akash cosmovisor version
```

### Step 2: Configure Systemd Service

Update your Cosmovisor systemd service file with the following recommended settings:

**Create/edit `/etc/systemd/system/akash.service`:**

```ini
[Unit]
Description=Akash with cosmovisor
Requires=network-online.target
After=network-online.target

[Service]
User=root
Group=root
ExecStart=/root/go/bin/cosmovisor run start

Restart=always
RestartSec=10
LimitNOFILE=4096

Environment="DAEMON_NAME=akash"
Environment="DAEMON_HOME=/root/.akash"
Environment="DAEMON_RESTART_AFTER_UPGRADE=true"
Environment="DAEMON_ALLOW_DOWNLOAD_BINARIES=false"
Environment="DAEMON_LOG_BUFFER_SIZE=512"
Environment="UNSAFE_SKIP_BACKUP=true"
Environment="DAEMON_SHUTDOWN_GRACE=15s"

[Install]
WantedBy=multi-user.target
```

**Important Environment Variables:**

- `DAEMON_ALLOW_DOWNLOAD_BINARIES=false` – It's recommended to manually place the binary (set to `true` for auto-download from upgrade info once available)
- `UNSAFE_SKIP_BACKUP=true` - Set to `false` if you want automatic backup before upgrade
- `DAEMON_SHUTDOWN_GRACE=15s` - Grace period for cleanup before shutdown

> **Note:** It's preferable to run the service under a dedicated non-system user other than root.

**Reload and restart:**

```bash
sudo systemctl daemon-reload
sudo systemctl restart akash
sudo systemctl enable akash
```

**Check status:**

```bash
sudo systemctl status akash
```

### Step 3: Download Precompiled Binary (Recommended)

> **Note:** Skip this step if you have enabled `DAEMON_ALLOW_DOWNLOAD_BINARIES=true` in your Cosmovisor configuration.

This upgrade uses an info.json file that references the correct release with pre-built binaries. **Binaries will be released approximately 24 hours after the upgrade height.** Once released, download the Akash v2.0.0 binary for your platform from the [GitHub releases page](https://github.com/akash-network/node/releases/tag/v2.0.0).

**Select your platform:**
- Linux AMD64
- Linux ARM64
- macOS Intel
- macOS Apple Silicon

> If you need to build from source instead, see [Build Binary From Source](#build-binary-from-source).

### Step 4: Prepare Upgrade Binary

Create the folder for the upgrade and copy the binary:

```bash
# Create the upgrade directory
mkdir -p $HOME/.akash/cosmovisor/upgrades/v2.0.0/bin

# Copy the downloaded binary (adjust path to your download location)
cp /path/to/downloaded/akash $HOME/.akash/cosmovisor/upgrades/v2.0.0/bin/akash

# Make it executable
chmod +x $HOME/.akash/cosmovisor/upgrades/v2.0.0/bin/akash

# Verify the version
$HOME/.akash/cosmovisor/upgrades/v2.0.0/bin/akash version
```

**Expected output:** `v2.0.0`

### Step 5: Wait for Upgrade

At the proposed block height (26,063,777), Cosmovisor will automatically:
1. Stop the current binary
2. Set the upgrade binary as the new current binary (v2.0.0)
3. Restart the node

**Monitor the upgrade:**

```bash
# Watch logs
sudo journalctl -u akash -f

# Check sync status after upgrade
akash status | jq '.sync_info.catching_up'
```

---

## Option 2: Manual Upgrade Without Cosmovisor

Using Cosmovisor to perform the upgrade is not mandatory. Node operators can manually update the `akash` binary at the time of the upgrade.

>  **Warning:** Do NOT replace the binary before the upgrade height, as this will stop your node.

### Manual Upgrade Steps

**1. Wait for the chain to halt** at block height 26,063,777

**2. Stop your node** (if not already stopped):

```bash
sudo systemctl stop akash
```

**3. Wait for the v2.0.0 binary release** (approximately 24 hours after the upgrade height), then install the new binary:

Either download the precompiled binary from [GitHub releases](https://github.com/akash-network/node/releases/tag/v2.0.0) or build from source (see [Build Binary From Source](#build-binary-from-source)).

**4. Verify the binary version:**

```bash
akash version
# Should output: v2.0.0
```

**5. Restart your node:**

```bash
sudo systemctl start akash
```

**6. Monitor sync status:**

```bash
akash status | jq '.sync_info.catching_up'
```

**Expected:** `false` when fully synced

---

## Build Binary From Source

> **Note:** We highly recommend downloading a precompiled Akash binary over building from source. Only use this method if precompiled binaries are not available for your platform or if you have specific requirements.

### Prerequisites

Ensure the following dependencies are installed before building:

| Dependency | Minimum Version | Notes |
|------------|-----------------|-------|
| golang | >= 1.26 | Required for compiling Go code |
| direnv | latest | Environment management - [direnv.net](https://direnv.net) |
| docker | latest | Required for containerized builds |
| make | latest | Build automation |
| git | latest | Version control |
| jq | latest | JSON processing |
| unzip | latest | Archive extraction |
| wget | latest | File downloads |
| curl | latest | HTTP requests |
| npm | latest | JavaScript package management |
| readlink | latest | Path resolution |
| lz4 | latest | Compression |

### Direnv Setup

If using `direnv` for the first time, you should see the following message after entering the source directory:

```
direnv: error .envrc is blocked. Run `direnv allow` to approve its content
```

If you don't see this message, `direnv` is likely not hooked to your shell. Visit [direnv.net](https://direnv.net) for installation and shell integration instructions.

### Build Steps

```bash
# Clone the repository
git clone https://github.com/akash-network/node.git

# Navigate to the directory
cd node

# Checkout the release tag
git checkout v2.0.0

# Allow direnv to set up the environment
direnv allow

# Build the release binary
make release
```

### Build Output

After the build completes successfully, binaries will be located in `.cache/goreleaser/main`.

The directory structure will look like:

```
.cache/goreleaser/main/
├── darwin_amd64_v1/
│   └── akash
├── darwin_arm64/
│   └── akash
├── linux_amd64_v1/
│   └── akash
├── linux_arm64/
│   └── akash
└── ... (other platforms)
```

### Verify the Build

```bash
.cache/goreleaser/main/<YOUR_OS_ARCH>/akash version
# Should output: v2.0.0
```

### Using the Built Binary

**For Cosmovisor:**

```bash
mkdir -p $HOME/.akash/cosmovisor/upgrades/v2.0.0/bin
cp .cache/goreleaser/main/<YOUR_OS_ARCH>/akash $HOME/.akash/cosmovisor/upgrades/v2.0.0/bin/akash
chmod +x $HOME/.akash/cosmovisor/upgrades/v2.0.0/bin/akash
```

**For manual upgrade:**

Copy the binary to your system path or use it directly when the upgrade height is reached.

---

## Verification After Upgrade

### Check Node Status

```bash
akash status | jq '.sync_info'
```

**Important fields:**
- `catching_up: false` - Node is synced
- `latest_block_height` – Current block (should be > 26,063,777)

### Check Binary Version

```bash
akash version
```

**Expected output:** `v2.0.0`

### Check Validator Status

```bash
akash query staking validator <your-validator-address>
```

**Verify:**
- `jailed: false`
- `status: BOND_STATUS_BONDED` (if in active set)

---

## Troubleshooting

### Node Not Starting After Upgrade

**Check logs:**

```bash
sudo journalctl -u akash -n 100 --no-pager
```

**Common issues:**
- Binary not executable: `chmod +x /path/to/akash`
- Wrong binary version: Verify with `akash version`
- Permission issues: Check user/group settings in systemd service
- Binary not yet released: v2.0.0 is expected ~24 hours after the upgrade height

### Node Out of Sync

**Check peer connections:**

```bash
akash status | jq '.node_info.other.peers'
```

If low peer count, add peers from:
- [Polkachu Peers](https://polkachu.com/live_peers/akash)
- [Akash Network net repo](https://github.com/akash-network/net/blob/main/mainnet/peer-nodes.txt)

### Cosmovisor Not Upgrading

**Verify upgrade binary exists:**

```bash
ls -la $HOME/.akash/cosmovisor/upgrades/v2.0.0/bin/akash
```

**Check Cosmovisor logs:**

```bash
sudo journalctl -u akash -f
```

**Common issues:**
- Upgrade binary not in correct location (ensure v2.0.0 is placed after it is released)
- Binary not executable
- `DAEMON_ALLOW_DOWNLOAD_BINARIES` set incorrectly

---

## Additional Resources

- **GitHub:** [akash-network/node](https://github.com/akash-network/node)
- **Block Explorer:** [Mintscan](https://www.mintscan.io/akash) | [ATOMScan](https://atomscan.com/akash) | [Arcturian](https://explorer.arcturian.tech/akash/staking)
- **Discord:** [#validators channel](https://discord.akash.network)
- **Network Info:** [akash-network/net](https://github.com/akash-network/net)

---

## Need Help?

- **Discord:** [#validators channel](https://discord.akash.network)
- **GitHub Issues:** [akash-network/node/issues](https://github.com/akash-network/node/issues)

---
