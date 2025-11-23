---
categories: ["Mainnet 15 Upgrade"]
tags: []
weight: 1
title: "Akash v1.1.0 Node Upgrade Guide"
linkTitle: "Akash v1.1.0 Node Upgrade Guide"
---

## Upgrade Details

- **Upgrade name**: Mainnet15
- **Binary version**: `v1.1.0`
- **Block height**: [24332547](https://www.mintscan.io/akash/block/24332547)
- **Estimated time**: Monday, November 24th, 2025 at 14:10 UTC
- **Expected duration**: 10-15 minutes of network downtime
- **Binary release**: Available approximately 10 hours before the upgrade
- [Binary Links](https://github.com/akash-network/node/releases/tag/v1.1.0)

> ⚠️ **Note:** Block times have high variance. Please monitor the [block countdown](https://www.mintscan.io/akash/block/24332547) for more precise timing estimates.

## Validator Expectations

To ensure a network upgrade with minimal downtime, Akash Validators should be available as follows:

- **One hour prior to upgrade** - available and monitoring the Akash Discord server's `validator` and `validator-announcement` channels for any late breaking guidance

- **Available throughout the network upgrade window** (expected 10-15 minutes)

- **One hour post upgrade** - available and monitoring the Akash Discord server's `validator` and `validator-announcement` channels for any possible revised strategies or updates deemed necessary

### Emergency Coordination

In the event of issues during the upgrade, please coordinate via the **validators channel in Discord** to reach emergency consensus and mitigate problems quickly.

## Hardware Requirements

This upgrade does not carry significant state changes and is relatively light-weight. It is recommended for **all validators to use at least 64GB of RAM** with swap enabled.

## Upgrade Process

In the sections that follow, both `Cosmovisor` (recommended) and `non-Cosmovisor` (manual) upgrade paths are provided. Full upgrade details and coordination can be found via the Akash Discord validators channel.

## Option 1: Upgrade Using Cosmovisor (Recommended)

The following instructions assume the `akash` and `cosmovisor` binaries are already installed and cosmovisor is set up as a systemd service.

The section that follows will detail the install/configuration of Cosmovisor. If additional details are necessary, visit the [Cosmovisor documentation](https://docs.cosmos.network/master/run-node/cosmovisor.html#upgrades) for instructions on how to install and set up the binaries.

> _**NOTE**_ - Cosmovisor `1.5.0` or higher is required

Validators and RPCs supervised by Cosmovisor with `DAEMON_ALLOW_DOWNLOAD_BINARIES=true` will automatically download upgrade binaries from the [upgrade info file](https://raw.githubusercontent.com/akash-network/net/main/mainnet/upgrades/v1.1.0/info.json).

### Configure Cosmovisor

> _**Note**_: The following steps are not required if Cosmovisor v1.5.0+ is already installed and configured to your preferred settings.

To install `cosmovisor` by running the following command:

```
go install cosmossdk.io/tools/cosmovisor/cmd/cosmovisor@v1.5.0
```

Check to ensure the installation was successful:

```
DAEMON_NAME=akash DAEMON_HOME=~/.akash cosmovisor version
```

Update `cosmovisor` systemd service file and make sure the environment variables are set to the appropriate values (the following example includes the recommended settings).

- _**NOTE**_ - It is preferable if you start your service under a dedicated non-system user other than root.
- _**NOTE**_ - `DAEMON_SHUTDOWN_GRACE` (optional, default none), if set, send interrupt to binary and wait the specified time to allow for cleanup/cache flush to disk before sending the kill signal. The value must be a duration (e.g. 1s).

```
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

Cosmovisor can be configured to automatically download upgrade binaries. It is recommended that validators do not use the auto-download option and that the upgrade binary is compiled and placed manually.

If you would like to enable the auto-download option, update the following environment variable in the systemd configuration file:

```
Environment="DAEMON_ALLOW_DOWNLOAD_BINARIES=true"
```

Cosmovisor will automatically create a backup of the data directory at the time of the upgrade and before the migration.

If you would like to disable the auto-backup, update the following environment variable in the systemd configuration file:

```
Environment="UNSAFE_SKIP_BACKUP=true"
```

Move the file to the systemd directory:

```
sudo mv cosmovisor.service /etc/systemd/system/akash.service
```

Restart `cosmovisor` to ensure the environment variables have been updated:

```
systemctl daemon-reload
systemctl start akash
systemctl enable akash
```

Check the status of the `cosmovisor` service:

```
sudo systemctl status cosmovisor
```

Enable `cosmovisor` to start automatically when the machine reboots:

```
sudo systemctl enable cosmovisor.service
```

### Download Precompiled Binary (Recommended)

> _**NOTE -**_ Skip this section if you have enabled `DAEMON_ALLOW_DOWNLOAD_BINARIES=true` in your Cosmovisor configuration. It will automatically create the correct path and download the binary based on the plan info from the governance proposal.

This upgrade links an `info.json` file that references the correct release with pre-built binaries. 

Download the [Akash binary](https://github.com/akash-network/node/releases/tag/v1.1.0) for your platform from the GitHub releases page.

> If you need to build the binary from source instead, see the [Build Binary From Sources](#build-binary-from-sources) section in the Appendix.

### Prepare Upgrade Binary

Create the folder for the upgrade (v1.1.0) and copy the akash binary into the folder:

```bash
# Create the upgrade directory
mkdir -p $HOME/.akash/cosmovisor/upgrades/v1.1.0/bin

# Copy the downloaded binary (adjust path to your download location)
cp /path/to/downloaded/akash $HOME/.akash/cosmovisor/upgrades/v1.1.0/bin/akash

# Make it executable
chmod +x $HOME/.akash/cosmovisor/upgrades/v1.1.0/bin/akash

# Verify the version
$HOME/.akash/cosmovisor/upgrades/v1.1.0/bin/akash version
```

> If you built from source, the binary will be in `.cache/goreleaser/main/<YOUR_OS_ARCH>/akash` - see [Build Binary From Sources](#build-binary-from-sources) for details.

At the proposed block height (24332547), `cosmovisor` will automatically stop the current binary (v1.0.0), set the upgrade binary as the new current binary (v1.1.0), and then restart the node.

## Option 2: Manual Upgrade Without Cosmovisor

Using Cosmovisor to perform the upgrade is not mandatory.

Node operators also have the option to manually update the `akash` binary at the time of the upgrade.

> ⚠️ **Warning:** Do NOT replace the binary before the upgrade height, as this will stop your node.

### Manual Upgrade Steps

1. **Wait for the chain to halt** at block height 24332547

2. **Stop your node** (if not already stopped)

3. **Install the new binary** - Either download the [Akash binary](https://github.com/akash-network/node/releases/tag/v1.1.0) or build from source (see [Build Binary From Sources](#build-binary-from-sources))

4. **Verify the binary version:**
   ```bash
   akash version
   # Should output: v1.1.0
   ```

5. **Restart your node**

## Appendix

### Build Binary From Sources

> _**NOTE**_ - We highly recommend downloading a precompiled Akash binary over building from source. Only use this method if precompiled binaries are not available for your platform or if you have specific requirements.

#### Prerequisites

Ensure the following dependencies are installed before building:

| Dependency | Minimum Version | Notes |
|------------|----------------|-------|
| `golang` | >= 1.25.4 | Required for compiling Go code |
| `direnv` | latest | Environment management - see [direnv.net](https://direnv.net) |
| `docker` | latest | Required for containerized builds |
| `make` | latest | Build automation |
| `git` | latest | Version control |
| `jq` | latest | JSON processing |
| `unzip` | latest | Archive extraction |
| `wget` | latest | File downloads |
| `curl` | latest | HTTP requests |
| `npm` | latest | JavaScript package management |
| `readlink` | latest | Path resolution |
| `lz4` | latest | Compression |

#### Direnv Setup

If using `direnv` for the first time (or cloning sources onto a new host), you should see the following message after entering the source directory:

```shell
direnv: error .envrc is blocked. Run `direnv allow` to approve its content
```

If you don't see this message, `direnv` is likely not hooked to your shell. Visit [direnv.net](https://direnv.net) for installation and shell integration instructions.

#### Build Steps

Follow these steps to build the v1.1.0 binary from source:

```bash
# Clone the repository
git clone https://github.com/akash-network/node.git

# Navigate to the directory
cd node

# Checkout the release tag
git checkout v1.1.0

# Allow direnv to set up the environment
direnv allow

# Build the release binary
make release
```

#### Build Output

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

Select the directory matching your operating system and architecture:
- **Linux AMD64**: `linux_amd64_v1/akash`
- **Linux ARM64**: `linux_arm64/akash`
- **macOS Intel**: `darwin_amd64_v1/akash`
- **macOS Apple Silicon**: `darwin_arm64/akash`

#### Verify the Build

After building, verify the binary version:

```bash
.cache/goreleaser/main/<YOUR_OS_ARCH>/akash version
# Should output: v1.1.0
```

#### Using the Built Binary

For **Cosmovisor**, copy the built binary to the upgrade directory:

```bash
mkdir -p $HOME/.akash/cosmovisor/upgrades/v1.1.0/bin
cp .cache/goreleaser/main/<YOUR_OS_ARCH>/akash $HOME/.akash/cosmovisor/upgrades/v1.1.0/bin/akash
chmod +x $HOME/.akash/cosmovisor/upgrades/v1.1.0/bin/akash
```

For **manual upgrade**, copy the binary to your system path or use it directly when the upgrade height is reached.

## Additional Resources

- [Akash Network GitHub](https://github.com/akash-network/node)
- [Block Explorer](https://www.mintscan.io/akash/)

