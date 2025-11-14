---
categories: ["Other Resources", "Experimental"]
tags: []
weight: 2
title: "Streamlined Steps"
linkTitle: "Streamlined Steps"
---

Akash CLI use has been streamlined in this guide. With the use of pre-defined environment variables, CLI commands are very concise.

For a more through review of the Akash CLI, including direct use of variables, visit the [CLI Detailed Steps](/docs/deployments/akash-cli/installation/) guide.

#### Akash Wants to Spotlight Your Work&#x20;

Have an idea for a project to deploy on Akash? Already working on a project? Maybe you’ve already deployed a project (or many projects!) to the network?

We love seeing what our community is building. Once your deployment is live, head over to our Discord and share the details of your app in our [Deployments channel](https://discord.com/channels/747885925232672829/1111748832489910332) and tag @Admin.

Once you share your app, someone from the Akash team may reach out to spotlight your app across our newsletter, blog, and social media.

This is a great opportunity to connect with the team at Akash Network and to spotlight your work for our world-class community.

#### Overview of Streamlined Akash CLI Use

- [Install the Akash CLI](#install-the-akash-cli)
  - [Download Source Code](#download-source-code)
  - [Install Akash CLI Client](#install-akash-cli-client)
    - [Add Akash Install Location to User’s Path](#add-akash-install-location-to-users-path)
      - [Make the Path Active in the Current Session](#make-the-path-active-in-the-current-session)
    - [Verify Installation](#verify-installation)
      - [Expected/Example Result](#expectedexample-result)
- [Initialize Environment Variables](#initialize-environment-variables)
- [Create Akash Account and Certificate](#create-akash-account-and-certificate)
  - [**Overview**](#overview)
  - [**Import Pre-Existing Account**](#import-pre-existing-account)
    - [Confirm Key Creation in Local Key Chain](#confirm-key-creation-in-local-key-chain)
      - [Example/Expected Output](#exampleexpected-output)
    - [Create/Export Key Environment Variable](#createexport-key-environment-variable)
  - [Create your Certificate](#create-your-certificate)
    - [Generate Cert](#generate-cert)
    - [Publish Cert to the Blockchain](#publish-cert-to-the-blockchain)
- [Create Test Deployment](#create-test-deployment)
  - [**Create Deployment**](#create-deployment)
- [Initialize Deployment Variables](#initialize-deployment-variables)
  - [Verify Deployment Status](#verify-deployment-status)
- [Review Bids](#review-bids)
  - [List Bids Received from Providers](#list-bids-received-from-providers)
  - [**Choose Provider**](#choose-provider)
  - [Create Lease](#create-lease)
  - [**Confirm Lease Creation**](#confirm-lease-creation)
- [Upload Manifest](#upload-manifest)
  - [Upload Manifest to Provider](#upload-manifest-to-provider)
  - [**Confirm Lease Status**](#confirm-lease-status)
- [Close Deployment](#close-deployment)

## Install the Akash CLI

The below set of steps downloads the environment for easier setup. For advanced usage, check the [Akash CLI Detailed Steps](/docs/deployments/akash-cli/installation/) guide.

### Download Source Code

- Download the Akash Client source code into your home directory and within a subdirectory named `demo`

```
cd ~

git clone https://github.com/ovrclk/demo-env.git demo

cd demo
```

### Install Akash CLI Client

```
apt install make

apt-get install unzip

make install

mv ./bin/provider-services ./
```

#### Add Akash Install Location to User’s Path

Add the software’s install location to the user’s path for easy use of Akash commands.

**NOTE:** Below we provide the steps to add the Akash install directory to a user’s path on a Linux Ubuntu server. Please take a look at a guide for your operating system and how to add a directory to a user’s path.

Open the user’s path file in an editor:

```
vi /etc/environment
```

View within text editor prior to the update:

```
PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin"
```

Add the following directory, which is the Akash install location, to PATH. In this example the active user is root. If logged in as another username, replace /root with your current/home directory.

```
/root/demo
```

View within the text editor following the update:

```
PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin:/root/demo"
```

##### Make the Path Active in the Current Session

```
. /etc/environment
```

#### Verify Installation

- Issue the following command to verify successful install of the Akash CLI client
- Output that displays the installed Akash client version equals a successful install and verification

```
provider-services version
```

##### Expected/Example Result

```
provider-services version

v0.1.0
```

## Initialize Environment Variables

- Initialize the environment variables defined in the `env.sh` file
- The list of environment variables initialized includes:
  - RPC node used for blockchain communication
  - Preferred gas fees
  - Account to be used for deployment purposes
- Update the env.sh file with customized values if necessary
- Note - enter this command on each new environment/shell session to initialize variables

```
source env.sh
```

## Create Akash Account and Certificate

### **Overview**

The steps in this section should be followed if you have a pre-existing Akash account that needs to be imported.\

If you do not have an Akash account and need to create one, follow the steps in this[ guide](/docs/getting-started/token-and-wallets#keplr-wallet) and then proceed with the step below.

### **Import Pre-Existing Account**

- Follow instructions create a new key/account named `myWallet`
- You will be prompted to enter the account mnemonic for import

```
provider-services keys add myWallet --recover
```

#### Confirm Key Creation in Local Key Chain

```
provider-services keys list
```

##### Example/Expected Output

```
provider-services keys list

- name: myWallet
  type: local
  address: akash1f53f<REDACTED>fud7
  pubkey: '{"@type":"/cosmos.crypto.secp256k1.PubKey","key":"A21Z<REDACTED>WObs"}'
  mnemonic: ""
```

#### Create/Export Key Environment Variable

```
export AKASH_KEY_NAME=myWallet
```

### Create your Certificate

In this step we will create a local certificate and then store the certification on the block chain

- Ensure that prior steps in this guide have been completed and that you have a funded wallet before attempting certificate creation.
- **Your certificate needs to be created only once per account** and can be used across all deployments.

##### Generate Cert

- Note: If it errors with `Error: certificate error: cannot overwrite certificate`, then add `--overwrite` should you want to overwrite the cert. Normally you can ignore that error and proceed with publishing the cert (next step).

```
provider-services tx cert generate client --from $AKASH_KEY_NAME
```

##### Publish Cert to the Blockchain

```
provider-services tx cert publish client --from $AKASH_KEY_NAME --gas-prices="0.0025uakt" --gas="auto" --gas-adjustment=1.15
```

## Create Test Deployment

- If a deployment has been in the current session previously, use the following command to clear the DSEQ number to prepare for new deployment creation

```
unset AKASH_DSEQ
```

#### **Create Deployment**

```
provider-services tx deployment create sdl/big-dipper.yaml
```

## Initialize Deployment Variables

- In this step we execute a script that will set environment variables related to the deployment created in the previous step
- Amongst other variables, the deployment ID (DSEQ) is captured and set as an env variable

```
apt install jq

source demo.sh
```

### Verify Deployment Status

```
provider-services query deployment get
```

## Review Bids

### List Bids Received from Providers

```
provider-services query market bid list
```

### **Choose Provider**

- Note - in the following command we set the AKASH_PROVIDER address and then reference the environment variable in subsequent commands (create lease, send manifest, etc)
- Alternatively we could add the provider variable to the env.sh script and re-issue **\`**source env.sh\` . This would negate the need to include the \`--provider\` switch in subsequent commands.
- Replace the provider-address variable with the preferred provider address

```
AKASH_PROVIDER=<provider-address>
```

### Create Lease

```
provider-services tx market lease create --provider $AKASH_PROVIDER
```

### **Confirm Lease Creation**

```
provider-services query market lease list
```

## Upload Manifest

#### Upload Manifest to Provider

- Upload the deployment’s SDL to chosen provide

```
provider-services send-manifest sdl/big-dipper.yaml --provider $AKASH_PROVIDER
```

#### **Confirm Lease Status**

- Retrieve the deployment’s URL and mapped ports

```
provider-services provider lease-status --provider $AKASH_PROVIDER
```

## Close Deployment

- Close an active deployment when desired

```
provider-services tx deployment close
```
