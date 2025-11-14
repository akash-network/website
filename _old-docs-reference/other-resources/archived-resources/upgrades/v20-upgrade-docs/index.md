---
categories: ["Other Resources", "Archived Resources"]
tags: []
weight: 2
title: "Akash Mainnet5 Node Upgrade Guide"
linkTitle: "Akash Mainnet5 Node Upgrade Guide"
---

## Akash Mainnet5 Node Upgrade Guide

### Network Upgrade Schedule

Countdown to network upgrade is listed below.

[Network Upgrade Countdown](https://www.mintscan.io/akash/blocks/8998907)

### Upgrade Details

#### Akash Network v0.20.0

- [Release Notes](https://github.com/akash-network/node/releases/tag/v0.20.0)

#### Akash Mainnet

- Upgrade Height: `8998907`

#### Snapshot Services

- [autostake](https://autostake.net/networks/akash#services)

### Upgrade Guidelines

#### Update Go

The use Go version 1.19.2 is required. For more information, see [Go](https://golang.org/).

### Common Steps for All Upgrade Options

In the sections that follow both `Cosmovisor` and `non-Cosmovisor` upgrade paths are provided. Prior to detailing specifics steps for these upgrade paths, in this section we cover steps required regardless of upgrade path chosen.

> _**Note**_: The following steps are not required if the auto-download option is enabled for Cosmovisor.

Either download the Akash binary (v0.20.0) or build it from source:

```
git clone https://github.com/akash-network/node
cd akash
git fetch --all
git checkout v0.20.0
GO_LINKMODE="internal" CGO_ENABLED=0 make akash
```

### Option 1: Upgrade Using Cosmovisor

The following instructions assume the `akash` and `cosmovisor` binaries are already installed and cosmovisor is set up as a systemd service.

The section that follows will detail the install/configuration of Cosmovisor. If additional details are necessary, visit [Start a node with Cosmovisor ](https://github.com/akash-network/docs/blob/anil/v3-instructions/guides/node/cosmovisor.md)for instructions on how to install and set up the binaries.

> _**NOTE**_ - Cosmovisor 1.0 is required

#### Configure Cosmovisor

> _**Note**_: The following steps are not required if Cosmovisor v1.0 is already installed and configured to your preferred settings.

To install `cosmovisor` by running the following command:

```
go install cosmossdk.io/tools/cosmovisor/cmd/cosmovisor@v1.4.0
```

Check to ensure the installation was successful:

```
DAEMON_NAME=akash DAEMON_HOME=~/.akash cosmovisor version
```

Update `cosmovisor` systemd service file and make sure the environment variables are set to the appropriate values (the following example includes the recommended settings).

- _**NOTE**_ - `UNSAFE_SKIP_BACKUP=false` is set to false indicating that a backup is enabled. The `DAEMON_DATA_BACKUP_DIR` will dictate where the backup is stored.
- _**NOTE**_ - with `UNSAFE_SKIP_BACKUP` set to false, Cosmovisor will make a copy of the entire chain. Please ensure that your node has sufficient space to accommodate this chain backup which may be large.
- _**NOTE**_ - It is preferable if you start your service under a dedicated non-system user other than root.

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
Environment="AKASH_PRUNING=nothing"
Environment="AKASH_IAVL_DISABLE_FASTNODE=false"
Environment="AKASH_STATESYNC_SNAPSHOT_INTERVAL=0"

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

#### Prepare Upgrade Binary

Create the folder for the upgrade binary (v0.20.0) - cloned in this [step](#common-steps-for-all-upgrade-options) - and copy the akash binary into the folder.

This next step assumes that the akash binary was built from source and stored in the current (i.e., akash) directory:

```
mkdir -p $HOME/.akash/cosmovisor/upgrades/v0.20.0/bin

cp ./.cache/bin $HOME/.akash/cosmovisor/upgrades/v0.20.0/bin
```

At the proposed block height, `cosmovisor` will automatically stop the current binary (v0.18.X), set the upgrade binary as the new current binary (v0.20.0), and then restart the node.\\

### Option 2: Upgrade Without Cosmovisor

Using Cosmovisor to perform the upgrade is not mandatory.

Node operators also have the option to manually update the `akash` binary at the time of the upgrade. Doing it before the upgrade height will stop the node.

When the chain halts at the proposed upgrade height, stop the current process running `akash`.

Either download the Akash upgrade binary (v0.20.0) or build from source - completed in this [step](#common-steps-for-all-upgrade-options) - and ensure the `akash` binary has been updated:

```
akash version
```

Update configuration with

```
akash init
```

##### Additional Settings

> _**NOTE**_ - we strong suggest using environment variables over manually modifying the config.toml / app.toml

- To prevent `panic: cannot delete latest saved version` error

```
export AKASH_PRUNING=nothing
```

- To prevents `panic: runtime error: invalid memory address or nil pointer dereference` error

```
export AKASH_IAVL_DISABLE_FASTNODE=false
```

- To prevent panic: `runtime error: invalid memory address or nil pointer dereference error on cosmos-sdk's createSnapshot ... incrVersionReaders`

```
export AKASH_STATESYNC_SNAPSHOT_INTERVAL=0
```

Restart the process running `akash`.
