---
categories: ["Akash Nodes"]
tags: ["Blockchain"]
weight: 1
title: "Akash Node CLI Build"
linkTitle: "Akash Node CLI Build"
---

We would want our own Akash node when we have one of the following needs:

* _**Akash Validator**_ - a full Akash Node is a prerequisite step to run a validator&#x20;
* _**Akash Provider**_ - a dedicated Akash Node is recommended for providers&#x20;
* _**Akash Production dApps**_ - a dedicated Akash Node is best practice to eliminate reliance on public nodes when you take your distributed apps past the testing phase.

In this guide we will review the Akash Node setup which includes the following steps:

* [STEP1 - Install Akash Software](#step1---install-akash-software)
* [STEP2 - Add Akash Install Location in the User’s Path](#step2---add-akash-install-location-in-the-users-path)
* [STEP3 - Choose a Node Moniker](#step3---choose-a-node-moniker)
* [STEP4 - Initialize New Node](#step4---initialize-new-node)
* [STEP5 - Set Minimum Gas Price](#step5---set-minimum-gas-price)
* [STEP6 - Copy the Genesis File](#step6---copy-the-genesis-file)
* [STEP7 - Add Seed Nodes](#step7---add-seed-and-peer-nodes)
* [STEP8 - Fast Sync](#step8---fast-sync)
* [STEP9 - Blockchain Snapshot Use](#step9---blockchain-snapshot-use)
* [STEP10 - Start the Akash Node](#step10---start-the-akash-node)
* [Additional Information](#additional-information)
* [RPC Service](#rpc-service)
* [API Service](#api-service)



## STEP1 - Install Akash Software



In this step we will cover Installing the Akash software on a Linux server.  We will use an Ubuntu server for our examples.  The commands may need to be changed slightly depending on your Linux distribution.

### Download and Install Akash

#### Install Latest Stable Akash Version

```
cd ~

apt install jq -y

apt install unzip -y

curl -sSfL https://raw.githubusercontent.com/akash-network/node/main/install.sh | sh
```

## STEP2 - Add Akash Install Location in the User’s Path

Add the Akash install location to the user’s path for ease of use.

**NOTE -** below we provide the steps to add the Akash install directory to a user’s path on a Linux Ubuntu server.  Please take a look at a guide for your operating system and how to add a directory to a user’s path.

### Open User’s Path Settings in an Editor

```
vi /etc/environment
```

### View Current Path Settings

* It is always best practice to view the path within a text editor or cat it out to console prior to the update to avoid errors.
* Example file_**:**_

```
PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin"
```

### Add the Akash Executable Path

* Add the following directory, which is the Akash install location, to PATH
*   _**Note**_ - this assumes Akash was installed while logged in as the root user.

    ```
    /root/bin
    ```

### Post Update Path Settings

```
PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin:/root/bin"
```

### Activate New Path Settings

*   Make the new path active in the current session

    ```
    . /etc/environment
    ```

### Verify New Path Settings and Akash Install

*   Display the version of Akash software installed.  This confirms the software installed and that the new user path addition worked.

    ```
    akash version
    ```
* Expected result (version displayed may be different)

```
root@ip-10-0-10-146:~# akash version

v0.26.1
```

## STEP3 - Choose a Node Moniker

We choose a "moniker" which is a readable name for your Akash Node.

* Replace the moniker value with a name of your choice
* **NOTE** - monikers can contain only ASCII characters

```
AKASH_MONIKER=<moniker>
```

### Moniker Updates

*   The moniker can be changed later, if needed, within the following file:

    ```
    ~/.akash/config/config.toml
    ```

## STEP4 - Initialize New Node

In this step we will initialize our new Akash Node.  In the background several configuration files will be created which can be edited later as needed.

_**Before starting the node, we specify the Akash network and chain ID**_

```
AKASH_NET="https://raw.githubusercontent.com/akash-network/net/main/mainnet"

export AKASH_CHAIN_ID="$(curl -s "$AKASH_NET/chain-id.txt")"
```

_**Start the node**_

```
akash init --chain-id "$AKASH_CHAIN_ID" "$AKASH_MONIKER"
```

_**Example/Expected Result**_

```
{"app_message":{"audit":{"attributes":[]},"auth":{"accounts":[],"params":{"max_memo_characters":"256","sig_verify_cost_ed25519":"590","sig_verify_cost

<output truncated>

},"upgrade":{},"vesting":{}},"chain_id":"akashnet-2","gentxs_dir":"","moniker":"chainzero","node_id":"2f4491952df08e69fd988c6f5d6ed21e25318fbc"}
```

## STEP5 - Set Minimum Gas Price

Your node keeps unconfirmed transactions in its mempool. In order to protect the node from spam, it is best to set a minimum gas price that the transaction must meet in order to be accepted into the mempool.

_**This setting can be found in the following file and we will change the default value which is blank.**_

```
vi ~/.akash/config/app.toml
```

_**The initial recommended min-gas-prices is 0.0025uakt but you might want to change it later.**_

```
# This is a TOML config file.
# For more information, see https://github.com/toml-lang/toml

##### main base config options #####

# The minimum gas prices a validator is willing to accept for processing a
# transaction. A transaction's fees must meet the minimum of any denomination
# specified in this config (e.g. 10uatom).

minimum-gas-prices = "0.0025uakt"
```

## STEP6 - Copy the Genesis File

Akash nodes need the Genesis file for the blockchain.  In this step we will gather the genesis.json file and make sure it is valid.

### Copy the Genesis File

```
curl -s "$AKASH_NET/genesis.json" > $HOME/.akash/config/genesis.json
```
## STEP7 - Add Seed and Peer Nodes



A seed node is used as an initial peer on the network. The seed node will provide a list of peers which can be used going forward. In this step we will configure a seed node to connect with.

## Seed Nodes

### List Current Seed Nodes

```
curl -s "$AKASH_NET/seed-nodes.txt" | paste -d, -s
```

### Expected Output of Seed Node List

```
root@ip-10-0-10-101:~# curl -s "$AKASH_NET/seed-nodes.txt" | paste -d, -s

27eb432ccd5e895c5c659659120d68b393dd8c60@35.247.65.183:26656,8e2f56098f182ffe2f6fb09280bafe13c63eb42f@46.101.176.149:26656,fff99a2e8f3c9473e4e5ee9a99611a2e599529fd@46.166.138.218:26656
```

### **Include the Seed Nodes in Config Files**

#### Seed Nodes

*   Open the config.toml file in an editor

    ```
    vi $HOME/.akash/config/config.toml
    ```
* Within the editor find the seeds field as shown at the bottom of this output

```
#######################################################
###           P2P Configuration Options             ###
#######################################################
[p2p]

# Address to listen for incoming connections
laddr = "tcp://0.0.0.0:26656"

# Address to advertise to peers for them to dial
# If empty, will use the same port as the laddr,
# and will introspect on the listener or use UPnP
# to figure out the address.
external_address = ""

# Comma separated list of seed nodes to connect to
seeds = ""
```

* Copy and paste the seed nodes returned via the “List Current Seed Nodes” part of this section
*   Following update the seeds field should appear like this:

    ```
    # Comma separated list of seed nodes to connect to
    seeds = "27eb432ccd5e895c5c659659120d68b393dd8c60@35.247.65.183:26656,8e2f56098f182ffe2f6fb09280bafe13c63eb42f@46.101.176.149:26656,fff99a2e8f3c9473e4e5ee9a99611a2e599529fd@46.166.138.218:26656"
    ```

## Peer Nodes

### List Current Peer Nodes

```
curl -s "$AKASH_NET/peer-nodes.txt" | paste -d, -s
```

### Expected Output of Peer Node List

```
root@ip-10-0-10-146:~# curl -s "$AKASH_NET/peer-nodes.txt" | paste -d, -s

27eb432ccd5e895c5c659659120d68b393dd8c60@35.247.65.183:26656,9180b99a5be3443677e0f57fc5f40e8f071bdcd8@161.35.239.0:51656,47c9acc0e7d9b244a6404458e76d50b6284bfbbb@142.93.77.25:26656,ab7b55588ea3f4f7a477e852aa262959e54117cd@3.235.249.94:26656,4acf579e2744268f834c713e894850995bbf0ffa@50.18.31.225:26656,3691ac1f56389ffec8579c13a6eb8eca41cf8ae3@54.219.88.246:26656,86afe23f116ba4754a19819a55d153008eb74b48@15.164.87.75:26656,6fbc3808f7d6c961e84944ae2d8c800a8bbffbb4@138.201.159.100:26656,a2a3ffe7ac122a218e1f59c32a670f04b8fd3033@165.22.69.102:26656
```

### **Include the Peer Nodes in Config Files**

#### Persistent Peers

*   Open the config.toml file in an editor

    ```
    vi $HOME/.akash/config/config.toml
    ```
* Within the editor find the persistent\_peers field as shown at the bottom of this output

```
#######################################################
###           P2P Configuration Options             ###
#######################################################
[p2p]

# Address to listen for incoming connections
laddr = "tcp://0.0.0.0:26656"

# Address to advertise to peers for them to dial
# If empty, will use the same port as the laddr,
# and will introspect on the listener or use UPnP
# to figure out the address. ip and port are required
# example: 159.89.10.97:26656
external_address = ""

# Comma separated list of seed nodes to connect to
seeds = "429d14fe2ab411e946623c20b060efdf230a5a8a@p2p.edgenet-1.ewr1.aksh.pw:26656,174e186ab7ef0aa8add457fecc5cca41b52cc031@p2p.edgenet-1.ewr1.aksh.pw:26652,a0dcc96946847f8bee74ffabd7d6d4809d030829@p2p.edgenet-1.ewr1.aksh.pw:26653,49c15444a04187b46db5e35b428b93bda42885e8@p2p.edgenet-1.ewr1.aksh.pw:26654,d9b7aba0738fd94072f11f49d5c2c0e119ef4268@170.187.200.114:26656"

# Comma separated list of nodes to keep persistent connections to
persistent_peers = ""
```

* Copy and paste the seed nodes returned via the “List Current Peer Nodes” part of this section
* Following update the persistent\_peers field should appear like this:

```
# Comma separated list of nodes to keep persistent connections to

persistent_peers = "27eb432ccd5e895c5c659659120d68b393dd8c60@35.247.65.183:26656,9180b99a5be3443677e0f57fc5f40e8f071bdcd8@161.35.239.0:51656,47c9acc0e7d9b244a6404458e76d50b6284bfbbb@142.93.77.25:26656,ab7b55588ea3f4f7a477e852aa262959e54117cd@3.235.249.94:26656,4acf579e2744268f834c713e894850995bbf0ffa@50.18.31.225:26656,3691ac1f56389ffec8579c13a6eb8eca41cf8ae3@54.219.88.246:26656,86afe23f116ba4754a19819a55d153008eb74b48@15.164.87.75:26656,6fbc3808f7d6c961e84944ae2d8c800a8bbffbb4@138.201.159.100:26656,a2a3ffe7ac122a218e1f59c32a670f04b8fd3033@165.22.69.102:26656"
```

## RPC Listening Address



*   Open the config.toml file in an editor

    ```
    vi $HOME/.akash/config/config.toml
    ```
* Within the editor find the RPC listening address field as shown in this output
* Update the listening address field to `"tcp://0.0.0.0:26657"` as shown
* This setting will ensure listening occurs on all interfaces

```
[rpc]

# TCP or UNIX socket address for the RPC server to listen on
laddr = "tcp://0.0.0.0:26657"
```


## STEP8 - Fast Sync

Fast Sync means nodes can catch up quickly by downloading blocks in bulk.

*   Fast Sync settings can be found in the following file



```
cat $HOME/.akash/config/config.toml
```

### Verify Fast Sync Settings

* Most likely no changes will be necessary to config.toml and the default settings will be fine. But we will make sure.&#x20;
*   Verify the fast\_sync field is set to true

    ```
    # If this node is many blocks behind the tip of the chain, FastSync
    # allows them to catchup quickly by downloading blocks in parallel
    # and verifying their commits
    fast_sync = true
    ```
* Verify the Fast Sync version is set to v0.&#x20;
*   While version 0 is said to be the “legacy” version, in our experience this version works better.

    ```
    #######################################################
    ###       Fast Sync Configuration Connections       ###
    #######################################################
    [fastsync]

    # Fast Sync version to use:
    #   1) "v0" (default) - the legacy fast sync implementation
    #   2) "v1" - refactor of v0 version for better testability
    #   2) "v2" - complete redesign of v0, optimized for testability & readability
    version = "v0"
    ```


    ## STEP9 - Blockchain Snapshot Use

We could let our node catch up to the current block but this would take a very long time. Instead we will download a snapshot of the blockchain before starting our node.

**NOTE** - at the time of this writing the snapshot is 7GB.

### Remove Existing Data

```
rm -rf ~/.akash/data; \
mkdir -p ~/.akash/data; \
cd ~/.akash
```

### Download Snapshot&#x20;

The latest Akash snapshot version - made available via The Offical Akash Network Snapshot - can be found [here](https://snapshots.akash.network/akashnet-2/latest).  This snapshot is updated every hour.

#### Example Steps

```
wget -O akashnet-2_latest.tar.lz4 https://snapshots.akash.network/akashnet-2/latest --inet4-only

apt-get install lz4

lz4 -d akashnet-2_latest.tar.lz4

tar -xvf akashnet-2_latest.tar
```

## STEP10 - Start the Akash Node



### Start the Node

In this section we will create a script and a related service to start the node.  The service will additionally ensure that the node is restarted following reboots.

#### Create Script to Start Node

* Create a script to start the Akash Node

```
cd ~

cat <<EOF | tee /usr/local/bin/start-node.sh
#!/usr/bin/env bash

/root/bin/akash start
EOF
```

* Make the script an executable

```
chmod 744 /usr/local/bin/start-node.sh
```

#### Create Related Service

```
cat > /etc/systemd/system/akash-node.service << 'EOF'
[Unit]
Description=Akash Node
After=network.target

[Service]
User=root
Group=root
ExecStart=/usr/local/bin/start-node.sh
KillSignal=SIGINT
Restart=on-failure
RestartSec=15
StartLimitInterval=200
StartLimitBurst=10
#LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
EOF
```

#### Start the Service

```
systemctl daemon-reload
systemctl start akash-node
systemctl enable akash-node
```

### Check the Status of the Node

* Initially the node will show a status of `"catching_up":true` within the output of the status command
* Eventually the node will show the height of the latest block and should indicate `"catching_up":false`
*   The latest block number can be found on the [Mintscan](https://www.mintscan.io/akash) website for comparison.

    ```
    akash status
    ```

#### Example/Sample Output

* Status output while Node is catching up to current block

```
akash status

{"NodeInfo":{"protocol_version":{"p2p":"8","block":"11","app":"0"},"id":"f2b42b91d103996efa12ab860c05dac66b8e9f7c","listen_addr":"tcp://0.0.0.0:26656","network":"akashnet-2","version":"0.34.19","channels":"40202122233038606100","moniker":"node","other":{"tx_index":"on","rpc_address":"tcp://0.0.0.0:26657"}},"SyncInfo":{"latest_block_hash":"D18299F966825C5886B7F88D677413F6564F323ADBF55C5E80AF76CA8E151E06","latest_app_hash":"4E6A696D911E7A238F4E4BD437712B197858E3A7ED319B12F38961B2C2960C47","latest_block_height":"6493433","latest_block_time":"2022-06-27T04:03:30.370092856Z","earliest_block_hash":"E25CE5DD10565D6D63CDA65C8653A15F962A4D2960D5EC45D1DC0A4DE06F8EE3","earliest_app_hash":"19526102DDBCE254BA71CC8E44185721D611635F638624C6F950EF31D3074E2B","earliest_block_height":"5851001","earliest_block_time":"2022-05-12T17:51:58.430492536Z","catching_up":true},"ValidatorInfo":{"Address":"CF6AC143794B35885AA4B29CA012DABFAEB88EAB","PubKey":{"type":"tendermint/PubKeyEd25519","value":"f0mUYVv5z2HCi4UmK72C/pxwbIu5tdDHEVc94yCLZQc="},"VotingPower":"0"}}
```

## Additional Information

### Config Files

Akash Node configurations are found within these files:

#### Cosmos Specific Configuration

```
~/.akash/config/app.toml
```

#### Tendermint Specific Configuration

```
~/.akash/config/config.toml
```

### Akash Networks

Within this guide the Akash mainnet is used and as specified in the AKASH\_NET value.  To launch a node on the testnet or edgenet and for additional network information, use this [guide](https://github.com/akash-network/net).

### State Pruning

There are several strategies for pruning state, please be aware that this is only for state and not for block storage:

1. **default:** the last 100 states are kept in addition to every 500th state; pruning at 10 block intervals
2. **nothing:** all historic states will be saved, nothing will be deleted (i.e. archiving node)
3. **everything:** all saved states will be deleted, storing only the current state; pruning at 10 block intervals
4. **custom:** allow pruning options to be manually specified through pruning-keep-recent, pruning-keep-every, and pruning-interval

You can configure the node's pruning strategy at start time with the --pruning or by configuring the app.toml file.

_**Validator Node Pruning Note**_** -** please do not use --pruning everything on validator nodes as it is known to cause issues. Instead use --pruning default.

## RPC Service

The RPC Service allows for both sending transactions to the network and for querying state from the network. It is used by the `akash` command-line tool when using an `akash tx` command or `akash query` command.

The RPC Service is configured in the `[rpc]` section of `~/.akash/config/config.toml`.

By default, the service listens on port `26657`, but this can also be changed in the `[rpc]` section of `config.toml`.


## API Service

The API Service of a full node enables a read-only query API that is useful for many tools such as dashboards, wallets, and scripting in general.

The API Service is configured in `~/.akash/config/app.toml` and can be enabled in the `[api]` section:

```
[api]
enable = "true"
```

By default, the service listens on port `1317`, but this can also be changed in the `[api]` section of `app.toml`.
