---
categories: ["Mainnet 13 Upgrade"]
tags: []
weight: 2
title: "Akash v0.38.0 Node Upgrade Guide"
linkTitle: "Akash v0.38.0 Node Upgrade Guide"
---

## Upgrade Details

- **Upgrade name**: Mainnet13
- **Binary version**: `v0.38.0`
- [Upgrade countdown/block height](https://www.mintscan.io/akash/block/20608553)
- [Binary Links](https://github.com/akash-network/node/releases/tag/v0.38.0)
- Please set `pruning = "nothing"` in your `app.toml` file or else the node will not sync

## Validator Expectations

To ensure a network upgrade with minimal downtime, Akash Validators should be available as follows:

- One hour prior to upgrade - available and monitoring the Akash Discord server's `validator` and `validator-announcement` channels for any late breaking guidance

- Avaialble throughout the network upgrade window

- One hour post upgrade - available and monitoring the Akash Discord server's `validator` and `validator-announcement` channels for any possible revised strategies or updates deemed necessary

## Special Instructions

We recommend validators utilize 128GB of RAM. This upgrade brings state change and might take a few minutes to complete.
If you are unable to have 128GB of RAM, at a minimum have a total of 128GB of swap set to prevent out of memory errors.

## Common Steps for All Upgrade Options

In the sections that follow both `Cosmovisor` and `non-Cosmovisor` upgrade paths are provided. Prior to detailing specifics steps for these upgrade paths, in this section we cover steps required regardless of upgrade path chosen.

> _**NOTE -**_ The following steps are not required if the auto-download option is enabled for Cosmovisor.

Either download the [Akash binary](https://github.com/akash-network/node/releases/tag/v0.38.0) or build it from source. We highly recommend using a pre-complied binary but provide instructions to build from source here in the rare event it would be necessary.

## Option 1: Upgrade Using Cosmovisor

The following instructions assume the `akash` and `cosmovisor` binaries are already installed and cosmovisor is set up as a systemd service.

The section that follows will detail the install/configuration of Cosmovisor. If additional details are necessary, visit [Start a node with Cosmovisor](https://github.com/akash-network/docs/blob/anil/v3-instructions/guides/node/cosmovisor.md)for instructions on how to install and set up the binaries.

> _**NOTE**_ - Cosmovisor `1.5.0` is required

### Configure Cosmovisor

> _**Note**_: The following steps are not required if Cosmovisor v1.0 is already installed and configured to your preferred settings.

To install `cosmovisor` by running the following command:

```
go install cosmossdk.io/tools/cosmovisor/cmd/cosmovisor@v1.5.0
```

Check to ensure the installation was successful:

```
DAEMON_NAME=akash DAEMON_HOME=~/.akash cosmovisor version
```

Update `cosmovisor` systemd service file and make sure the environment variables are set to the appropriate values(the following example includes the recommended settings).

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

### Prepare Upgrade Binary

> Skip this section if you have enabled DAEMON_ALLOW_DOWNLOAD_BINARIES cosmovisor parameter. It will automatically create the correct path and download the binary based on the plan info from the govt proposal.

Create the folder for the upgrade (v0.38.0) - cloned in this [step](#common-steps-for-all-upgrade-options) - and copy the akash binary into the folder.

This next step assumes that the akash binary was built from source and stored in the current (i.e., akash) directory:

```
mkdir -p $HOME/.akash/cosmovisor/upgrades/v0.38.0/bin

cp ./.cache/bin $HOME/.akash/cosmovisor/upgrades/v0.38.0/bin
```

At the proposed block height, `cosmovisor` will automatically stop the current binary (v0.34.X), set the upgrade binary as the new current binary (v0.38.0), and then restart the node.\\

## Option 2: Upgrade Without Cosmovisor

Using Cosmovisor to perform the upgrade is not mandatory.

Node operators also have the option to manually update the `akash` binary at the time of the upgrade. Doing it before the upgrade height will stop the node.

When the chain halts at the proposed upgrade height, stop the current process running `akash`.

Either download the [Akash binary](https://github.com/akash-network/node/releases/tag/v0.38.0) or build from source - completed in this [step](#common-steps-for-all-upgrade-options) - and ensure the `akash` binary has been updated:

```
akash version
```

Update configuration with

```
akash init
```

Restart the process running `akash`.

## Appendix

### Build Binary From Sources

#### Prerequisites

> _**NOTE**_ - we highly recommend downloading a complied Akash binary over building the binary from source

Direnv is required to compile sources. Check [here](https://direnv.net) for details on how to install and hook to your shell

if using direnv first time (or cloning sources on to a new host) you should see following message after entering source dir:

```shell
direnv: error .envrc is blocked. Run `direnv allow` to approve its content
```

if no such message, most like direnv is not hooked to the shell

#### Build

```shell
git clone --depth 1 --branch v0.38.0 https://github.com/akash-network/node
cd node
direnv allow
make release
```

After build artefacts are located in `dist` directory
