---
categories: ["Node Operators", "Network Upgrades"]
tags: ["Mainnet", "Upgrade", "Cosmovisor"]
weight: 1
title: "Mainnet 18 - Akash v2.1.0"
linkTitle: "Mainnet 18"
description: "Complete upgrade guide for Mainnet 18 (Akash v2.1.0)"
---

**Upgrade guide for Akash Network Mainnet 18 upgrade to v2.1.0.**

This guide provides step-by-step instructions for upgrading your node to Akash v2.1.0 using both Cosmovisor (recommended) and manual upgrade methods.

**Governance proposal:** [Proposal #328](https://www.mintscan.io/akash/proposals/328)

---

## Upgrade Details

**Upgrade Information:**
- **Upgrade Name:** v2.1.0
- **Binary Version:** `v2.1.0`
- **Block Height:** [27,230,465](https://www.mintscan.io/akash/block/27230465)
- **Estimated Time:** June 11th, 2026 at ~14:00 UTC
- **Upgrade Info File:** [info.json](https://raw.githubusercontent.com/akash-network/net/main/mainnet/upgrades/v2.1.0/info.json)
- **Binary Links:** [GitHub Releases](https://github.com/akash-network/node/releases/tag/v2.1.0) (once published)

> **Note:** Block times have high variance. Monitor the chain or block explorer for the upgrade. Prepare your node to halt at the upgrade height; install the v2.1.0 binary once it is available via the upgrade info file or GitHub releases.

---

## Upgrade Features

By voting **YES** on [Proposal #328](https://www.mintscan.io/akash/proposals/328), the network approves the following changes:

### 1. Oracle v2

Oracle v2 is a fundamental architectural redesign of the `x/oracle` module introduced in the prior mainnet upgrade. The core shift replaces block-height-based time referencing with wall-clock timestamps and durations, making staleness detection, TWAP computation, and price querying independent of block production cadence. Key additions:

- **Wall-clock time model** — Staleness, TWAP, and queries are driven by timestamps and durations rather than block heights, removing dependence on block cadence.
- **Epoch-based pruning** — Bounds state growth over time.
- **Explicit source identity management** — Price sources are tracked via auto-incrementing numeric IDs.
- **Transient store** — Provides per-block sequence disambiguation.
- **Sortable timestamp key encoding** — Lexicographically-sortable keys enable efficient range queries.
- **Future-time-drift protection** — Rejects submissions timestamped improperly far in the future.
- **Flattened message/event schema** — Separates price values from timestamps.
- **Time-range query API** — Upgrades the query interface from single-height lookups to time-range filters.
- **Modern collections-based state** — Adopts `cosmossdk.io/collections` for typed, indexed state management, replacing raw KV store operations.

**Migration note:** The v1-to-v2 migration performs a complete state wipe followed by re-initialization with a freshly deployed Pyth contract. The fundamental incompatibility between block-height-keyed and timestamp-keyed storage schemas precludes in-place data conversion. Price history from v1 is not carried forward; the feed re-initializes from fresh submissions after the upgrade.

### 2. Resource Reclamation

Introduces implementation of [AEP-82](https://github.com/akash-network/AEP/tree/main/spec/aep-82) as a marketplace extension that provides a negotiated grace period before provider-initiated lease termination.

Today a provider that needs to terminate a lease can only close it immediately or wait for the tenant to act. Immediate closure is disruptive — tenant workloads are terminated without warning, risking data loss and downtime — and there is no on-chain mechanism for a provider to give advance notice. This blocks common provider scenarios such as planned maintenance, capacity decommissioning, and resource rebalancing. Resource Reclamation adds a wall-clock grace period that is negotiated between tenant and provider at bid time. Key capabilities:

- **Tenant opt-in** — A tenant may specify a minimum reclamation window in `MsgCreateDeployment`. Providers that do not support reclamation must not bid on such deployments.
- **Provider opt-in** — A provider may offer a reclamation window in their bid, even for deployments that do not require it. When required, the offered window must meet or exceed the tenant's minimum.
- **Negotiated window** — The reclamation window is a wall-clock duration agreed at bid time and stored on the lease at creation.
- **Reclamation initiation** — A provider initiates reclamation via the new `MsgLeaseStartReclaim`, transitioning the lease from `Active` to the new `Reclaiming` state and setting a deadline.
- **Window enforcement** — During the window the provider cannot close the lease; the tenant can close at any time. Payments continue at the full lease rate. After the window elapses, either party may close.
- **Governance bounds** — New market module parameters enforce minimum and maximum reclamation window durations (defaults: `min` 1h, `max` 720h / 30 days).

This change adds a new `LeaseReclaiming` state (value `4`) to the lease state machine, a new `MsgLeaseStartReclaim` market message, an `EventLeaseReclaimStarted` event, and new reclamation fields on the deployment, order, bid, and lease records.

### 3. Market Order Close Event Fix

Resolves a marketplace event bug ([support#438](https://github.com/akash-network/support/issues/438)) in which `EventOrderClosed` was not emitted when a deployment or group was closed while its order was still in the `OrderOpen` state.

When a deployment is closed before any lease is created, the order remains `OrderOpen` (bids may be open, since no `MsgCreateLease` has run). In that path, `OnGroupClosed` previously iterated only `OrderActive` orders, so it never called `OnOrderClosed` for the still-open order — and `OnOrderClosed` is the only place `akash.market.v1.EventOrderClosed` is emitted. The deployment module still correctly emitted `EventDeploymentClosed` and `EventGroupClosed`, but the corresponding market-level order-closed signal was missing.

The practical impact was on downstream consumers that listen only for `EventOrderClosed` — most notably the provider `bidengine` — which never received a market-level "order closed" signal for this path, leaving open bids and orphaned bid state.

This upgrade corrects `OnGroupClosed` in `x/market` to include orders in the `OrderOpen` state, ensuring `OnOrderClosed` runs and `EventOrderClosed` is emitted (and open bids are closed) when a deployment or group is closed before any lease exists.

---

## Validator Expectations

To ensure a network upgrade with minimal downtime, Akash Validators should be available as follows:

**Timeline:**
- **One hour prior to upgrade** - Available and monitoring the Akash Discord server's `#validators` and `#validator-announcements` channels for any late-breaking guidance
- **During upgrade window** – Available throughout the expected downtime
- **After binary release** – Install v2.1.0 binary and restart once available
- **One hour post upgrade** - Available and monitoring Discord channels for any possible revised strategies or updates deemed necessary

### Emergency Coordination

In the event of issues during the upgrade, coordinate via the **#validators channel in Discord** to reach emergency consensus and mitigate problems quickly.

**Discord:** [discord.akash.network](https://discord.akash.network)

---

## Hardware Requirements

**Recommended specifications for running a node for this upgrade:**

This upgrade adds the resource reclamation marketplace extension and performs a state-breaking redesign of the `x/oracle` module, including an oracle state wipe and redeployment of the Pyth contract. It is recommended that all validators meet the following:

- **OS:** Ubuntu 24.04
- **RAM:** At least 32 GB with swap enabled
- **CPU:** 8+ cores minimum
- **Storage:** Sufficient space for blockchain data (1 TB+ recommended)

As with any state-breaking upgrade, validators are strongly encouraged to snapshot their node prior to the upgrade height.

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

Validators and RPCs supervised by Cosmovisor with `DAEMON_ALLOW_DOWNLOAD_BINARIES=true` will automatically download upgrade binaries from the [upgrade info file](https://raw.githubusercontent.com/akash-network/net/main/mainnet/upgrades/v2.1.0/info.json) once available.

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

This upgrade uses an info.json file that references the correct release with pre-built binaries. Once available, download the Akash v2.1.0 binary for your platform from the [GitHub releases page](https://github.com/akash-network/node/releases/tag/v2.1.0).

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
mkdir -p $HOME/.akash/cosmovisor/upgrades/v2.1.0/bin

# Copy the downloaded binary (adjust path to your download location)
cp /path/to/downloaded/akash $HOME/.akash/cosmovisor/upgrades/v2.1.0/bin/akash

# Make it executable
chmod +x $HOME/.akash/cosmovisor/upgrades/v2.1.0/bin/akash

# Verify the version
$HOME/.akash/cosmovisor/upgrades/v2.1.0/bin/akash version
```

**Expected output:** `v2.1.0`

### Step 5: Wait for Upgrade

At the proposed block height (27,230,465), Cosmovisor will automatically:
1. Stop the current binary
2. Set the upgrade binary as the new current binary (v2.1.0)
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

**1. Wait for the chain to halt** at block height 27,230,465

**2. Stop your node** (if not already stopped):

```bash
sudo systemctl stop akash
```

**3. Install the v2.1.0 binary** once available:

Either download the precompiled binary from [GitHub releases](https://github.com/akash-network/node/releases/tag/v2.1.0) or build from source (see [Build Binary From Source](#build-binary-from-source)).

**4. Verify the binary version:**

```bash
akash version
# Should output: v2.1.0
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
git checkout v2.1.0

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
# Should output: v2.1.0
```

### Using the Built Binary

**For Cosmovisor:**

```bash
mkdir -p $HOME/.akash/cosmovisor/upgrades/v2.1.0/bin
cp .cache/goreleaser/main/<YOUR_OS_ARCH>/akash $HOME/.akash/cosmovisor/upgrades/v2.1.0/bin/akash
chmod +x $HOME/.akash/cosmovisor/upgrades/v2.1.0/bin/akash
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
- `latest_block_height` – Current block (should be > 27,230,465)

### Check Binary Version

```bash
akash version
```

**Expected output:** `v2.1.0`

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
- Binary not yet released: v2.1.0 will be available via the upgrade info file and GitHub releases

### Node Out of Sync

**Check peer connections:**

```bash
akash status | jq '.node_info.other.peers'
```

If low peer count, add peers from:
- [Polkachu Peers](https://polkachu.com/live_peers/akash)
- [Akash Network net repo — `meta.json` (`persistent_peers`)](https://github.com/akash-network/net/blob/main/mainnet/meta.json)

### Cosmovisor Not Upgrading

**Verify upgrade binary exists:**

```bash
ls -la $HOME/.akash/cosmovisor/upgrades/v2.1.0/bin/akash
```

**Check Cosmovisor logs:**

```bash
sudo journalctl -u akash -f
```

**Common issues:**
- Upgrade binary not in correct location (ensure v2.1.0 is placed after it is released)
- Binary not executable
- `DAEMON_ALLOW_DOWNLOAD_BINARIES` set incorrectly

---

## Additional Resources

- **Governance Proposal:** [Proposal #328 on Mintscan](https://www.mintscan.io/akash/proposals/328)
- **GitHub:** [akash-network/node](https://github.com/akash-network/node)
- **Block Explorer:** [Mintscan](https://www.mintscan.io/akash) | [ATOMScan](https://atomscan.com/akash) | [Arcturian](https://explorer.arcturian.tech/akash/staking)
- **Discord:** [#validators channel](https://discord.akash.network)
- **Network Info:** [akash-network/net](https://github.com/akash-network/net)

---

## Need Help?

- **Discord:** [#validators channel](https://discord.akash.network)
- **GitHub Issues:** [akash-network/node/issues](https://github.com/akash-network/node/issues)

---
