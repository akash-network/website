---
categories: ["Other Resources"]
tags: []
weight: 2
title: " Akash Mainnet8 Upgrade"
linkTitle: " Akash Mainnet8 Upgrade"
---

> _**NOTE**_ - documentation for Mainnet8 upgrade is not yet complete. Please check back prior to announced upgrade date/time for finalized details.

Documentation related to Akash Network upgrade to version `0.28.0`:

- [Node Upgrade Instructions](#akash-v0280-node-upgrade-guide)
- [Provider Upgrade Instructions](#provider-up)

### Upgrade Details

- Upgrade Height: `13759618`
- [Upgrade Timer](https://www.mintscan.io/akash/block/13759618)

## Akash v0.28.0 Node Upgrade Guide

### Upgrade Details

- **Upgrade name**: v0.28.0
- **Binary version**: v0.28.2
- [Upgrade countdown/block height](https://www.mintscan.io/akash/block/13759618)
- [Binary Links](https://github.com/akash-network/node/releases/tag/v0.28.2)

### Common Steps for All Upgrade Options

In the sections that follow both `Cosmovisor` and `non-Cosmovisor` upgrade paths are provided.
Prior to detailing specifics steps for these upgrade paths, in this section we cover steps required regardless of upgrade path chosen.

> _**NOTE -**_ The following steps are not required if the auto-download option is enabled for Cosmovisor.

Either download the [Akash binary](#upgrade-details) or build it from source.
We highly recommend using a pre-complied binary but provide instructions to build from source [here](#build-binary-from-source) in the rare event it would be necessary.

### Option 1: Upgrade Using Cosmovisor

The following instructions assume the `akash` and `cosmovisor` binaries are already installed and cosmovisor is set up as a systemd service.

The section that follows will detail the install/configuration of Cosmovisor.
If additional details are necessary, visit [Start a node with Cosmovisor](https://github.com/akash-network/docs/blob/anil/v3-instructions/guides/node/cosmovisor.md)for instructions on how to install and set up the binaries.

> _**NOTE**_ - Cosmovisor 1.0 is required

#### Configure Cosmovisor

> _**Note**_: The following steps are not required if Cosmovisor v1.0 is already installed and configured to your preferred settings.

To install `cosmovisor` by running the following command:

```
go install github.com/cosmos/cosmos-sdk/cosmovisor/cmd/cosmovisor@v1.5.0
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

Cosmovisor can be configured to automatically download upgrade binaries.
It is recommended that validators do not use the auto-download option and that the upgrade binary is compiled and placed manually.

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

> Skip this section if you have enabled DAEMON_ALLOW_DOWNLOAD_BINARIES cosmovisor parameter. It will automatically create the correct path and download the binary based on the plan info from the govt proposal.

Create the folder for the upgrade (v0.28.0) - cloned in this [step](#common-steps-for-all-upgrade-options) - and copy the akash binary into the folder.

This next step assumes that the akash binary was built from source and stored in the current (i.e., akash) directory:

```
mkdir -p $HOME/.akash/cosmovisor/upgrades/v0.28.0/bin

cp ./.cache/bin $HOME/.akash/cosmovisor/upgrades/v0.28.0/bin
```

At the proposed block height, `cosmovisor` will automatically stop the current binary (v0.26.X), set the upgrade binary as the new current binary (v0.28.0), and then restart the node.\\

### Option 2: Upgrade Without Cosmovisor

Using Cosmovisor to perform the upgrade is not mandatory.

Node operators also have the option to manually update the `akash` binary at the time of the upgrade. Doing it before the upgrade height will stop the node.

When the chain halts at the proposed upgrade height, stop the current process running `akash`.

Either download the [Akash binary](#upgrade-details) or build from source - completed in this [step](#common-steps-for-all-upgrade-options) - and ensure the `akash` binary has been updated:

```
akash version
```

Update configuration with

```
akash init
```

Restart the process running `akash`.

### Appendix

#### Build Binary From Sources

##### Prerequisites

> _**NOTE**_ - we highly recommend downloading a complied Akash binary over building the binary from source

Direnv is required to compile sources. Check [here](https://direnv.net) for details on how to install and hook to your shell

if using direnv first time (or cloning sources on to a new host) you should see following message after entering source dir:

```shell
direnv: error .envrc is blocked. Run `direnv allow` to approve its content
```

if no such message, most like direnv is not hooked to the shell

##### Build

```shell
git clone --depth 1 --branch v0.28.2 https://github.com/akash-network/node
cd node
direnv allow
make release
```

After build artefacts are located in `dist` directory

## Mainnet8 Provider Upgrade Procedure

### Overview

This is a comprehensive guide that covers the steps necessary to upgrade from Mainnet5 to Mainnet6 of Akash Network and Akash Provider components in a Kubernetes cluster.

### IMPORTANT

#### This procedure does not apply to providers using the Provider Console!

Providers using the Provider Console (previously know as Praetor App) should wait for further upgrade instructions from the Akash team!

### Provider Components to be Upgraded

- `provider-services` is the main binary of the `akash-provider`, `akash-hostname-operator`, `akash-inventory-operator`, and `akash-ip-operator` helm charts
- `akash` is the main binary of the `akash-node` helm chart

#### Mainnet6 Versions (Pre-Upgrade)

- `provider-services`: `0.4.7`
- `node`: `0.26.0`

#### Mainnet8 Versions (Post-Upgrade)

- `provider-services`: `0.4.8`
- `node`: `0.28.2`

### Upgrade Procedure

IMPORTANT! Seek help if you encounter an issue at any step or have doubts! Please seek the support in the `#providers` Akash Network Devs Discord room [here](https://discord.akash.network/).

#### STEP 1 - Scale down to 0 replicas the akash-provider

This step is crucial to prevent unexpected behavior during the upgrade.

> _**NOTE**_: The Akash Deployments will continue to run as usual while `akash-provider` service is stopped. The only impact is that users won't be able to perform `lease-<shell|events|logs>` against their deployments nor deploy/update or terminate them.

```
kubectl -n akash-services scale statefulsets akash-provider --replicas=0
```

#### STEP 2 - Upgrade the Helm Charts

> Follow these steps to upgrade various Helm charts. Make sure you've backed up your existing Helm chart configurations.

Helm charts to be upgraded are: `akash-node` (aka RPC node), `akash-provider`, `akash-hostname-operator`, `akash-inventory-operator`, and `akash-ip-operator`.

##### 2.1. Upgrade the Repo

```
helm repo update akash
```

Verify you can see the correct chart/app versions:

```
# helm search repo akash
NAME                          	CHART VERSION	APP VERSION	DESCRIPTION
akash/akash-hostname-operator 	8.0.0        	0.4.8      	An operator to map Ingress objects to Akash dep...
akash/akash-inventory-operator	8.0.0        	0.4.8      	An operator required for persistent storage (op...
akash/akash-ip-operator       	8.0.0        	0.4.8      	An operator required for ip marketplace (optional)
akash/akash-node              	8.0.0        	0.28.2     	Installs an Akash RPC node (required)
akash/provider                	8.0.0        	0.4.8      	Installs an Akash provider (required)
```

##### 2.2. akash-node Chart

Take the current `akash-node` chart values:

```
helm -n akash-services get values akash-node | grep -v '^USER-SUPPLIED VALUES' > akash-node-values.yml
```

Upgrade your `akash-node` chart:

```
helm upgrade akash-node akash/akash-node -n akash-services -f akash-node-values.yml
```

##### 2.3 akash-provider Chart

Take the current `akash-provider` chart values:

```
helm -n akash-services get values akash-provider | grep -v '^USER-SUPPLIED VALUES' > provider.yaml
```

```
helm upgrade akash-provider akash/provider -n akash-services -f provider.yaml
```

> _**IMPORTANT**_: Make sure your provider is using the latest bid price script! Here is the guide that tells you how you can set it for your akash-provider chart. [/docs/providers/build-a-cloud-provider/akash-cli/akash-cloud-provider-build-with-helm-charts/#step-8---provider-bid-customization](/docs/providers/build-a-cloud-provider/akash-cli/akash-cloud-provider-build-with-helm-charts#step-8---provider-bid-customization)

##### 2.4 akash-hostname-operator Chart

```
helm upgrade akash-hostname-operator akash/akash-hostname-operator -n akash-services
```

##### 2.5 akash-inventory-operator Chart

> Skip this section if your provider does not provide persistent storage.

> _**Note**_: This is not a typo, we are installing the inventory-operator without the akash- prefix.

```
helm upgrade inventory-operator akash/akash-inventory-operator -n akash-services
```

##### 2.6 akash-ip-operator Chart

> Skip this section if your provider does not provide IP leasing.

Take the current akash-ip-operator chart values:

```
helm -n akash-services get values akash-ip-operator | grep -v '^USER-SUPPLIED VALUES' > akash-ip-operator-values.yml
```

```
helm upgrade akash-ip-operator akash/akash-ip-operator -n akash-services -f akash-ip-operator-values.yml
```

#### STEP 3 - Verify the Charts Have Been Upgraded

Perform these checks to ensure the upgrade was successful.

\
Run this command to check the pods and their versions within the `akash-services` namespace:

```
kubectl -n akash-services get pods -o custom-columns='NAME:.metadata.name,IMAGE:.spec.containers[*].image'
```

The charts upgrade went well, if you are seeing these images and versions:

- provider and operator image is: `ghcr.io/akash-network/provider:0.4.8`
- node image is: `ghcr.io/akash-network/node:0.28.2`

Example Result:

```
# kubectl -n akash-services get pods -o custom-columns='NAME:.metadata.name,IMAGE:.spec.containers[*].image'
NAME                                        IMAGE
akash-hostname-operator-86d4596d6c-pwbt8    ghcr.io/akash-network/provider:0.4.8
akash-inventory-operator-69464fbdff-dxkk5   ghcr.io/akash-network/provider:0.4.8
akash-ip-operator-6f6ddc47f8-498kj          ghcr.io/akash-network/provider:0.4.8
akash-node-1-0                              ghcr.io/akash-network/node:0.28.2
akash-provider-0                            ghcr.io/akash-network/provider:0.4.8
```

### Update your provider-services client

Make sure to update your local `provider-services` binary (aka the Akash client) if you had it installed.

Verify the version and the location using these two commands:

```
provider-services version
type -p provider-services
```

If you get anything below `0.4.8`, then get the right binary from [this page](https://github.com/akash-network/provider/releases/).
