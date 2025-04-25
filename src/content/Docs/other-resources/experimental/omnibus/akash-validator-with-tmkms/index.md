---
categories: ["Other Resources", "Experimental"]
tags: []
weight: 2
title: "Akash Validator with TMKMS"
linkTitle: "Akash Validator with TMKMS"
---

**NOTE** - the steps in this guide are currently deemed experimental pending security enhancements that will be introduced prior to becoming production grade. At this time, please only use this guide for experimentation or non-production use.

In this guide we will create an Akash Validator as a deployment. The Tendermint Key Management System (TMKMS) will be used so that we do not store the validator's private key on the validator server itself.

The Validator deployment will take advantage of statesync for rapid blockchain synchronization.

Sections in this guide:

- [Validator Topology](#validator-topology)
- [Obtain Private Key](#obtain-private-key)
  - [Example Validator Private Key Retrieval](#example-validator-private-key-retrieval)
- [Akash Validator Deployment](#akash-validator-deployment)
  - [Akash Console](#akash-console)
  - [Create the Akash Validator Deployment](#create-the-akash-validator-deployment)
    - [Create New Deployment](#create-new-deployment)
  - [Empty Template Option](#empty-template-option)
    - [Copy SDL into Editor](#copy-sdl-into-editor)
      - [Populated Editor](#populated-editor)
    - [Deployment Deposit](#deployment-deposit)
    - [Select Akash Provider](#select-akash-provider)
    - [Deployment Logs](#deployment-logs)
    - [Capture Deployment URI and Port](#capture-deployment-uri-and-port)
- [TMKMS Setup](#tmkms-setup)
  - [Prepare TMKMS Dependencies (Ubuntu Instructions)](#prepare-tmkms-dependencies-ubuntu-instructions)
    - [**Rust Install**](#rust-install)
    - [**GCC**](#gcc)
    - [**Libusb**](#libusb)
  - [Setup TMKMS](#setup-tmkms)
    - [Compiling TMKMS from Source Code](#compiling-tmkms-from-source-code)
    - [Copy Validator Private Key into TMKMS Config File](#copy-validator-private-key-into-tmkms-config-file)
    - [**Import the Private Validator Key into TMKMS**](#import-the-private-validator-key-into-tmkms)
    - [**Delete Private Key File on the Validator**](#delete-private-key-file-on-the-validator)
  - [**Modify tmkms.toml**](#modify-tmkmstoml)
    - [Example tmkms.toml File](#example-tmkmstoml-file)
- [Start and Verify the TMKMS Service](#start-and-verify-the-tmkms-service)
  - [Start the TMKMS Service](#start-the-tmkms-service)
    - [Initial Log Messages](#initial-log-messages)
    - [Log Messages Indicating Successful TMKMS Connection](#log-messages-indicating-successful-tmkms-connection)
    - [Active Validator Set Log Messages](#active-validator-set-log-messages)

## Validator Topology

In this guide we create a Validator within an Akash Deployment.

The topology of the environment will be as follows:

- Akash Validator as a deployment and as created in the [Akash Validator Deployment](#akash-validator-deployment) section of this guide
- Tendermint Key Managment System (TMKMS) used for storage of the Validators private key on a secured server. The TMKMS instance - configured in the [TMKMS Setup](#tmkms-setup) section of this guide - may be created on any secure server of your choosing. The TMKMS server must have connectivity to the Akash Validator.

## Obtain Private Key

In the [TMKMS Setup](#tmkms-setup) section of this guide we will import the Validators private key.

If you have a pre-existing Akash Validator the private key from this instance may be used.

If this is a new Akash Validator - create an Akash validator instance for the purpose of private key generation, capture the private key, and then shut down the validator.

### Example Validator Private Key Retrieval

- Display contents of key file on the validator

```
cat ~/.akash/config/priv_validator_key.json
```

- Example Output

```
{
  "address": "134FCAC9<redacted>",
  "pub_key": {
    "type": "tendermint/PubKeyEd25519",
    "value": "BrL0wA8DWiVvm<redacted>"
  },
  "priv_key": {
    "type": "tendermint/PrivKeyEd25519",
    "value": "3RphlkX7PucBKSdhFKviFV5TI<redacted>"
  }
}
```

## Akash Validator Deployment

### Akash Console

- Within this guide we will use the Akash Console application to create the Akash Validator
- Please review our[ Akash Console ](broken-reference)docs to install and configure the application if this is your first time using

### Create the Akash Validator Deployment

- Use the steps that follow - within Akash Console - to create your Akash Validator deployment

#### Create New Deployment

- Use the `CREATE DEPLOYMENT` button to launch a new deployment

![](../../../../assets/validatorCreateDeployment.png)

### Empty Template Option

- Select the `Empty` option as we will be copying a pre-constructed Akash SDL for the deployment

![](../../../../assets/validatorBlankTemplate.png)

#### Copy SDL into Editor

- Copy the following Akash SDL into the Editor pane
- Reference the [Populated Editor](#populated-editor) section for further clarity
- Select the `CREATE DEPLOYMENT` button to proceed

```
---
version: "2.0"

services:
  node:
    image: ghcr.io/akash-network/cosmos-omnibus:v0.3.42-akash-v0.22.7
    env:
      - MONIKER=my-moniker-1
      - CHAIN_JSON=https://raw.githubusercontent.com/akash-network/net/main/mainnet/meta.json
      - MINIMUM_GAS_PRICES=0.0025uakt
      - P2P_POLKACHU=1
      - STATESYNC_POLKACHU=1
      - AKASH_PRIV_VALIDATOR_LADDR=tcp://0.0.0.0:26658
    expose:
      - port: 26657
        as: 80
        to:
          - global: true
      - port: 26658
        to:
          - global: true
    params:
      storage:
        data:
          mount: /root/.akash

profiles:
  compute:
    node:
      resources:
        cpu:
          units: 4
        memory:
          size: 8Gi
        storage:
          - size: 512Mi
          - name: data
            size: 120Gi
            attributes:
              persistent: true
              class: beta2
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
          amount: 10000

deployment:
  node:
    dcloud:
      profile: node
      count: 1
```

##### Populated Editor

![](../../../../assets/validatorTemplatePopulated.png)

#### Deployment Deposit

- An escrow account is created for the deployment that is deducted from by the provider for the cost of the workload over time
- By default 0.5 AKT is specified as the initial escrow deposit
- If a deployment's escrow runs out of funds (0 AKT), the lease will be closed by the provider. Consider increasing the initial deposit to an amount that will be enough to fund the deployment for some time. And/or consider a strategy to ensure the escrow is re-funded on a periodic basis to ensure no disruption to your validator.
- When ready select `DEPOSIT` to proceed and `APPROVE` any Transaction/gas fee prompts that follow

![](../../../../assets/validatorDeploymentDeposit.png)

#### Select Akash Provider

- A list of Akash Providers that have bid on your deployment is displayed
- Choose the desired Provider from the list and then select `ACCEPT BID` to proceed

![](../../../../assets/validatorSelectProvider.png)

#### Deployment Logs

- The `LOGS` pane for the new Deployment will display
- NOTE - after a period of time the logs will display a `Back-off restarting failed container` message. This is expected as the container will not start until it has established a connection with the TMKMS server in subsequent steps.
- Select the `LEASES` tab to proceed into the next step

![](../../../../assets/validatorDeploymentLogs.png)

#### Capture Deployment URI and Port

- In upcoming TMKMS configuration sections we will need to specify our Akash Validator deployment's URI and port
- Capture this info from the `LEASES` tab for later use
- In the example the following values would be captured (these values will be different for your deployment):
  - URI - using the Provider field - `provider.mainnet-1.ca.aksh.pw`
  - Port - using the Forwarded Port field - `31237`

![](../../../../assets/validatorDeploymentURICapture.png)

## TMKMS Setup

### Prepare TMKMS Dependencies (Ubuntu Instructions)

- All steps in this section should be performed on the TMKMS server unless otherwise noted

#### **Rust Install**

```
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

source $HOME/.cargo/env
```

#### **GCC**

```
sudo apt update

sudo apt install git build-essential ufw curl jq snapd --yes
```

#### **Libusb**

```
apt install libusb-1.0-0-dev

export RUSTFLAGS=-Ctarget-feature=+aes,+ssse3
```

### Setup TMKMS

- All steps in this section should be performed on the TMKMS server unless otherwise noted

#### Compiling TMKMS from Source Code

```
cd ~
git clone https://github.com/iqlusioninc/tmkms.git
cd ~/tmkms
cargo install tmkms --features=softsign
mkdir /etc/tmkms
tmkms init /etc/tmkms/
```

#### Copy Validator Private Key into TMKMS Config File

- Create the `priv_validator_key.json` file

```
vi ~/tmkms/config/secrets/priv_validator_key.json
```

- Copy/paste the validator private key into the `priv_validator_key.json` file

#### **Import the Private Validator Key into TMKMS**

```
tmkms softsign import ~/tmkms/config/secrets/priv_validator_key.json ~/tmkms/config/secrets/priv_validator_key
```

#### **Delete Private Key File on the Validator**

- Conduct this step on the Akash Validator machine
- Securely delete the priv_validator_key.json from your validator node and store it safely offline in case of an emergency. The `priv_validator_key` will be what TMKMS will use to sign for your validator.
- Return to the TMKMS server after this step to complete subsequent steps in this section

```
shred -uvz ~/.akash/config/priv_validator_key.json
```

### **Modify tmkms.toml**

- Begin by deleting the existing `tmkms.toml` file and re-creating anew

```
rm ~/tmkms/config/tmkms.toml

vi ~/tmkms/config/tmkms.toml
```

- Copy the following configuration into the new `tmkms.toml` file
- Updating this file with your Akash validator URI - in the `addr` field - is the only edit that should be necessary
- The Akash validator URI was revealed and captured in the [Akash Validator Deployment](#akash-validator-deployment) section of this guide
- Refer to the [example](#example-tmkmstoml-file) for further clarification

```
## Chain Configuration

### Cosmos Hub Network

[[chain]]
id = "akashnet-2"
key_format = { type = "bech32", account_key_prefix = "akashpub", consensus_key_prefix = "akashvalconspub" }
state_file = "/root/tmkms/config/state/priv_validator_state.json"

## Signing Provider Configuration

### Software-based Signer Configuration

[[providers.softsign]]
chain_ids = ["akashnet-2"]
key_type = "consensus"
path = "/root/tmkms/config/secrets/priv_validator_key"

## Validator Configuration

[[validator]]
chain_id = "akashnet-2"
addr = "tcp://<akash-provider-address>:<akash-deployment-port>"
secret_key = "/etc/tmkms/secrets/kms-identity.key"
protocol_version = "v0.34"
reconnect = true
```

##### Example tmkms.toml File

```
## Chain Configuration

### Cosmos Hub Network

[[chain]]
id = "akashnet-2"
key_format = { type = "bech32", account_key_prefix = "akashpub", consensus_key_prefix = "akashvalconspub" }
state_file = "/root/tmkms/config/state/priv_validator_state.json"

## Signing Provider Configuration

### Software-based Signer Configuration

[[providers.softsign]]co
chain_ids = ["akashnet-2"]
key_type = "consensus"
path = "/root/tmkms/config/secrets/priv_validator_key"

## Validator Configuration

[[validator]]
chain_id = "akashnet-2"
addr = "tcp://provider.mainnet-1.ca.aksh.pw:31508"
secret_key = "/etc/tmkms/secrets/kms-identity.key"
protocol_version = "v0.34"
reconnect = true
```

## Start and Verify the TMKMS Service

All steps in this section should be performed on the TMKMS server unless otherwise noted

### Start the TMKMS Service

```
tmkms start -c $HOME/tmkms/config/tmkms.toml
```

#### Initial Log Messages

- The following connection error messages will initially display after the TMKMS service start
- Wait approximately 5-10 minutes for the connection to establish and at which time these error messages should cease

```
2022-03-08T23:42:37.926816Z  INFO tmkms::commands::start: tmkms 0.11.0 starting up...
2022-03-08T23:42:37.926968Z  INFO tmkms::keyring: [keyring:softsign] added consensus Ed25519 key: osmovalconspub1zcjduepq2qfkp3ahrhaafzuqglme9mares0eluj58xr6cy7c37cdmzq0eecqk0yehr
2022-03-08T23:42:37.927216Z  INFO tmkms::connection::tcp: KMS node ID: 948f8fee83f7715f99b8b8a53d746ef00e7b0d9e
2022-03-08T23:42:37.929454Z ERROR tmkms::client: [osmosis-1@tcp://123.456.32.123:26659] I/O error: Connection refused (os error 111)
```

#### Log Messages Indicating Successful TMKMS Connection

- Eventually the following TMKMS log messages should display indicating successful connection between the TMKMS server and the Akash validator

```
2022-07-06T14:45:15.099703Z  INFO tmkms::session: [akashnet-2@tcp://provider.mainnet-1.ca.aksh.pw:31508] connected to validator successfully
2022-07-06T14:45:15.099920Z  WARN tmkms::session: [akashnet-2@tcp://provider.mainnet-1.ca.aksh.pw:31508]: unverified validator peer ID! (1c0716972c63d3322dd5f1e93b3720442f2e52dc)
```

#### Active Validator Set Log Messages

- If the Akash validator is part of the active set the following singed block messages should be seen in the TMKMS logs

```
2022-03-08T23:46:06.208451Z  INFO tmkms::connection::tcp: KMS node ID: 948f8fee83f7715f99b8b8a53d746ef00e7b0d9e
2022-03-08T23:46:06.210568Z  INFO tmkms::session: [osmosis-1@tcp://164.92.136.160:26659] connected to validator successfully
2022-03-08T23:46:06.210604Z  WARN tmkms::session: [osmosis-1@tcp://164.92.136.160:26659]: unverified validator peer ID! (ba44dd36899602e255b04e3608e5ef0fe4bc5f5b)
2022-03-08T23:46:15.929787Z  INFO tmkms::session: [osmosis-1@tcp://164.92.136.160:26659] signed PreCommit:<nil> at h/r/s 3399910/0/2 (0 ms)
2022-03-08T23:46:17.344579Z  INFO tmkms::session: [osmosis-1@tcp://164.92.136.160:26659] signed PreCommit:<nil> at h/r/s 3399911/0/2 (0 ms)
2022-03-08T23:46:22.367627Z  INFO tmkms::session: [osmosis-1@tcp://164.92.136.160:26659] signed PreCommit:<nil> at h/r/s 3399912/0/2 (0 ms)
2022-03-08T23:46:27.409777Z  INFO tmkms::session: [osmosis-1@tcp://164.92.136.160:26659] signed PreCommit:<nil> at h/r/s 3399913/0/2 (0 ms)
2022-03-08T23:46:32.442300Z  INFO tmkms::session: [osmosis-1@tcp://164.92.136.160:26659] signed PreCommit:<nil> at h/r/s 3399914/0/2 (0 ms)
2022-03-08T23:46:37.452162Z  INFO tmkms::session: [osmosis-1@tcp://164.92.136.160:26659] signed PreCommit:<nil> at h/r/s 3399915/0/2 (0 ms)
```
