---
categories: ["Akash Cli"]
tags: ["CLI"]
weight: 5
title: "Akash CLI Installation"
linkTitle: "Akash CLI Installation"
---

Explore detailed steps and options of the Akash CLI. In this guide we will define each environment variable and use within each command.

### Akash Wants to Spotlight Your Work&#x20;

Have an idea for a project to deploy on Akash? Already working on a project? Maybe you’ve already deployed a project (or many projects!) to the network?

We love seeing what our community is building. Once your deployment is live, head over to our Discord and share the details of your app in our [Deployments channel](https://discord.com/channels/747885925232672829/771909909335506955) and tag @Admin.

Once you share your app, someone from the Akash team may reach out to spotlight your app across our newsletter, blog, and social media.

This is a great opportunity to connect with the team at Akash Network and to spotlight your work for our world-class community.

### Overview of Verbose Steps

- [Install Akash](#install-akash-cli)
- [Create an Account](#create-an-account)
- [Fund your Account](#fund-your-account)
- [Configure your Network](#configure-your-network)
- [Create your Configuration](#create-your-configuration)
- [Create your Certificate](#create-your-certificate)
- [Create your Deployment](#create-your-deployment)
- [View your Bids](#view-your-bids)
- [Create a Lease](#create-a-lease)
- [Send the Manifest](#send-the-manifest)
- [Update the Deployment](#update-the-deployment)
- [Close Deployment](#close-deployment)

## Install Akash CLI

Select a tab below to view instructions for MacOS, Linux, or compiling from source.

import TabsWrapper, { TabContent } from "@/components/ui/tabs";

<TabsWrapper client:load >
<TabContent  value="MacOS">
   #### MacOS

The simplest way to install Akash is using Homebrew using:

```
brew untap ovrclk/tap
brew tap akash-network/tap
brew install akash-provider-services
```

If you do not have homebrew get it from [here](https://docs.brew.sh/Homebrew-on-Linux) or follow the below steps for installing the Akash Binary.

**Download Akash Binary**

These commands will retrieve the latest, stable version of the Akash software, store the version in a local variable, and install that version.

```
cd ~/Downloads

#NOTE that this download may take several minutes to complete
curl -sfL https://raw.githubusercontent.com/akash-network/provider/main/install.sh | bash
```

**Move the Akash Binary**

Move the binary file into a directory included in your path

```
sudo mv ./bin/provider-services /usr/local/bin
```

**Verify Akash Installation**

Verify the installation by using a simple command to check the Akash version

```
provider-services version
```

**Expect/Example Output**

```
provider-services version

v0.5.4
```

      </TabContent>

      <TabContent  value="Linux">

The simplest way to install Akash is using Homebrew using:

```
brew untap ovrclk/tap
brew tap akash-network/tap
brew install akash-provider-services
```

If you do not have homebrew, follow the below steps for installing the Akash Binary.

**Download Akash Binary**

These commands will retrieve the latest, stable version of the Akash software, store the version in a local variable, and install that version.

```
cd ~

apt install jq -y

apt install unzip -y

curl -sfL https://raw.githubusercontent.com/akash-network/provider/main/install.sh | bash
```

**Add Akash Install Location to User’s Path**

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

Add the following directory, which is the Akash install location, to `PATH`. In this example the active user is root. If logged in as another username, replace /root with your current/home directory.

```
/root/bin
```

View within the text editor following the update:

```
PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin:/root/bin"
```

#### Make the Path Active in the Current Session

```
. /etc/environment
```

#### Verify Akash Install

Display the version of Akash software installed. This confirms the software installed and that the new user path addition worked.

```
provider-services version
```

**Expected/Example Result**

```
provider-services version

v0.4.7
```

  </TabContent>
  <TabContent value="Source">
  #### From Source

Installing Akash suite from source:

```
$ go get -d github.com/akash-network/provider
$ cd $GOPATH/src/github.com/akash-network/provider
$ AKASH_NET="https://raw.githubusercontent.com/akash-network/net/main/mainnet"
$ AKASH_VERSION="$(curl -s https://api.github.com/repos/akash-network/provider/releases/latest | jq -r '.tag_name')"
$ git checkout "v$AKASH_VERSION"
$ make deps-install
$ make install
```

Akash is developed and tested with [golang 1.16+](https://golang.org/). Building requires a working [golang](https://golang.org/) installation, a properly set `GOPATH`, and `$GOPATH/bin` present in `$PATH`.

Once you have the dependencies properly setup, download and build `akash` using `make install`

  </TabContent>
  </TabsWrapper>

## Create an Account

Configure the name of your key. The command below will set the name of your key to `myWallet`, run the below command and replace `myWallet` with a name of your choice:

```bash
AKASH_KEY_NAME=myWallet
```

Verify you have the shell variables set up . The below command should return the name you've used:

```bash
echo $AKASH_KEY_NAME
```

We now need to point Akash to where the keys are stored for your configuration. To do this we will set the AKASH_KEYRING_BACKEND environmental variable.

```bash
AKASH_KEYRING_BACKEND=os
```

Copy and paste this command into Terminal to create an Akash account:

```bash
provider-services keys add $AKASH_KEY_NAME
```

Read the output and save your mnemonic phrase is a safe place. Let's set a Shell Variable in Terminal `AKASH_ACCOUNT_ADDRESS` to save your account address for later.

```bash
export AKASH_ACCOUNT_ADDRESS="$(provider-services keys show $AKASH_KEY_NAME -a)"

echo $AKASH_ACCOUNT_ADDRESS
```

Note that if you close your Terminal window this variable will not be saved.

## Fund your Account

A minimum deposit of 0.5 AKT is required to deploy on Akash, and a small transaction fee is applied to deployment leases paid by the account used to deploy. There are multiple ways to get funds into your account: you can acquire tokens through buying or swapping to AKT or getting involved in community programs.

Note: to test out the network for free, you can use the Sandbox version of Akash to receive free testing tokens from the Sandbox Faucet. Please refer to [this](https://akash.network/docs/deployments/sandbox/installation/) page on installing and configuring CLI for the Sandbox network.

- [Buying AKT from an exchange / swapping to AKT from a decentralized exchange](https://akash.network/token/#buying-akt)
- [Join the Akash Community and ask how to get involved in community programs](https://discord.com/invite/akash)

## Configure your Network

First configure the base URL (`$AKASH_NET`) for the Akash Network; copy and paste the command below:

```bash
AKASH_NET="https://raw.githubusercontent.com/akash-network/net/main/mainnet"
```

### Version

Next configure the version of the Akash Network `AKASH_VERSION`; copy and paste the command below:

```bash
AKASH_VERSION="$(curl -s https://api.github.com/repos/akash-network/provider/releases/latest | jq -r '.tag_name')"
```

### Chain ID

The akash CLI will recogonize `AKASH_CHAIN_ID` environment variable when exported to the shell.

```bash
export AKASH_CHAIN_ID="$(curl -s "$AKASH_NET/chain-id.txt")"
```

### Network Node

You need to select a node on the network to connect to, using an RPC endpoint. To configure the`AKASH_NODE` environment variable use this export command:

```bash
export AKASH_NODE="$(curl -s "$AKASH_NET/rpc-nodes.txt" | shuf -n 1)"
```

### Confirm your network variables are setup

Your values may differ depending on the network you're connecting to.

```bash
echo $AKASH_NODE $AKASH_CHAIN_ID $AKASH_KEYRING_BACKEND
```

You should see something similar to:

`http://135.181.60.250:26657 akashnet-2 os`

### Set Additional Environment Variables

Set the below set of environment variables to ensure smooth operations

| Variable             | Description                                                                               | Recommended Value |
| -------------------- | ----------------------------------------------------------------------------------------- | ----------------- |
| AKASH_GAS            | Gas limit to set per-transaction; set to "auto" to calculate sufficient gas automatically | `auto`            |
| AKASH_GAS_ADJUSTMENT | Adjustment factor to be multiplied against the estimate returned by the tx simulation     | `1.15`            |
| AKASH_GAS_PRICES     | Gas prices in decimal format to determine the transaction fee                             | `0.0025uakt`       |
| AKASH_SIGN_MODE      | Signature mode                                                                            | `amino-json`      |

```
export AKASH_GAS=auto
export AKASH_GAS_ADJUSTMENT=1.25
export AKASH_GAS_PRICES=0.0025uakt
export AKASH_SIGN_MODE=amino-json
```

### Check your Account Balance

Check your account has sufficient balance by running:

```bash
provider-services query bank balances --node $AKASH_NODE $AKASH_ACCOUNT_ADDRESS
```

You should see a response similar to:

```
balances:
- amount: "93000637"
  denom: uakt
pagination:
  next_key: null
  total: "0"
```

If you don't have a balance, please see the [funding guide](https://github.com/akash-network/docs/tree/b65f668b212ad1976fb976ad84a9104a9af29770/guides/wallet/funding.md). Please note the balance indicated is denominated in uAKT (AKT x 10^-6), in the above example, the account has a balance of _93 AKT_. We're now setup to deploy.

{/* {% hint style="info" %} */}
Your account must have a minimum balance of 0.5 AKT to create a deployment. This 0.5 AKT funds the escrow account associated with the deployment and is used to pay the provider for their services. It is recommended you have more than this minimum balance to pay for transaction fees. For more information on escrow accounts, see [here](/docs/getting-started/intro-to-akash/payments/#escrow-accounts)
{/* {% endhint %} */}

## Create your Configuration

Create a deployment configuration [deploy.yaml](https://github.com/akash-network/docs/tree/b65f668b212ad1976fb976ad84a9104a9af29770/guides/deploy/deploy.yml) to deploy the `ovrclk/lunie-light` for [Lunie Light](https://github.com/ovrclk/lunie-light) Node app container using [SDL](https://github.com/akash-network/docs/tree/b65f668b212ad1976fb976ad84a9104a9af29770/sdl/README.md).

You can use cURL to download the file:

```
curl -s https://raw.githubusercontent.com/akash-network/docs/master/guides/deploy/deploy.yml > deploy.yml
```

#### Modify your Configuration

You may use the sample deployment file as-is or modify it for your own needs as described in our [SDL (Stack Definition Language)](https://github.com/akash-network/docs/blob/master/sdl/README.md) documentation. A typical modification would be to reference your own image instead of our demo app image.

##### EXAMPLE CONFIGURATION:

```bash
cat > deploy.yml <<EOF
---
version: "2.0"

services:
  web:
    image: ovrclk/lunie-light
    expose:
      - port: 3000
        as: 80
        to:
          - global: true

profiles:
  compute:
    web:
      resources:
        cpu:
          units: 0.1
        memory:
          size: 512Mi
        storage:
          size: 512Mi
  placement:
    westcoast:
      attributes:
        host: akash
      signedBy:
        anyOf:
          - "akash1365yvmc4s7awdyj3n2sav7xfx76adc6dnmlx63"
      pricing:
        web:
          denom: uakt
          amount: 1000

deployment:
  web:
    westcoast:
      profile: web
      count: 1

EOF
```

## Create your Certificate

Akash requires an account to have a valid certificate associated with it to start participating in the deployment process. In this section of the guide, we will create a certificate locally, and then proceed to store this certificate on the Akash blockchain. To do this, ensure you have followed all the steps outlined in this guide up to this point. Additionally, these transactions must be executed from an Akash account in possession of some $AKT tokens.

Once an account has a certificate associated with it, it can begin deploying services on the Akash blockchain. **A certificate needs to be created only once per account. After creation, it can be used across any number of deployments for as long as it remains valid.**

#### Generate Cert

- Note: If it errors with `Error: certificate error: cannot overwrite certificate`, then add `--overwrite` should you want to overwrite the cert. Normally you can ignore that error and proceed with publishing the cert (next step).

```
provider-services tx cert generate client --from $AKASH_KEY_NAME
```

#### Publish Cert to the Blockchain

```
provider-services tx cert publish client --from $AKASH_KEY_NAME
```

## Create your Deployment

### CPU Support

Only x86_64 processors are officially supported for Akash deployments. This may change in the future and when ARM processors are supported it will be announced and documented.

### Akash Deployment

> _**NOTE**_ - if your current terminal session has been used to create prior deployments, issue the command `unset AKASH_DSEQ` to prevent receipt of error message `Deployment Exists`

To deploy on Akash, run:

```
provider-services tx deployment create deploy.yml --from $AKASH_KEY_NAME
```

You should see a response similar to:

```javascript
{
  "height":"140325",
  "txhash":"2AF4A01B9C3DE12CC4094A95E9D0474875DFE24FD088BB443238AC06E36D98EA",
  "codespace":"",
  "code":0,
  "data":"0A130A116372656174652D6465706C6F796D656E74",
  "raw_log":"[{\"events\":[{\"type\":\"akash.v1\",\"attributes\":[{\"key\":\"module\",\"value\":\"deployment\"},{\"key\":\"action\",\"value\":\"deployment-created\"},{\"key\":\"version\",\"value\":\"2b86f778de8cc9df415490efa162c58e7a0c297fbac9cdb8d6c6600eda56f17e\"},{\"key\":\"owner\",\"value\":\"akash1vn06ycjjnvsvl639fet9lajjctuturrtx7fvuj\"},{\"key\":\"dseq\",\"value\":\"140324\"},{\"key\":\"module\",\"value\":\"market\"},{\"key\":\"action\",\"value\":\"order-created\"},{\"key\":\"owner\",\"value\":\"akash1vn06ycjjnvsvl639fet9lajjctuturrtx7fvuj\"},{\"key\":\"dseq\",\"value\":\"140324\"},{\"key\":\"gseq\",\"value\":\"1\"},{\"key\":\"oseq\",\"value\":\"1\"}]},{\"type\":\"message\",\"attributes\":[{\"key\":\"action\",\"value\":\"create-deployment\"},{\"key\":\"sender\",\"value\":\"akash1vn06ycjjnvsvl639fet9lajjctuturrtx7fvuj\"},{\"key\":\"sender\",\"value\":\"akash1vn06ycjjnvsvl639fet9lajjctuturrtx7fvuj\"}]},{\"type\":\"transfer\",\"attributes\":[{\"key\":\"recipient\",\"value\":\"akash17xpfvakm2amg962yls6f84z3kell8c5lazw8j8\"},{\"key\":\"sender\",\"value\":\"akash1vn06ycjjnvsvl639fet9lajjctuturrtx7fvuj\"},{\"key\":\"amount\",\"value\":\"5000uakt\"},{\"key\":\"recipient\",\"value\":\"akash14pphss726thpwws3yc458hggufynm9x77l4l2u\"},{\"key\":\"sender\",\"value\":\"akash1vn06ycjjnvsvl639fet9lajjctuturrtx7fvuj\"},{\"key\":\"amount\",\"value\":\"5000000uakt\"}]}]}]",
  "logs":[
    {
      "msg_index":0,
      "log":"",
      "events":[
        {
          "type":"akash.v1",
          "attributes":[
            {
              "key":"module",
              "value":"deployment"
            },
            {
              "key":"action",
              "value":"deployment-created"
            },
            {
              "key":"version",
              "value":"2b86f778de8cc9df415490efa162c58e7a0c297fbac9cdb8d6c6600eda56f17e"
            },
            {
              "key":"owner",
              "value":"akash1vn06ycjjnvsvl639fet9lajjctuturrtx7fvuj"
            },
            {
              "key":"dseq",
              "value":"140324"
            },
            {
              "key":"module",
              "value":"market"
            },
            {
              "key":"action",
              "value":"order-created"
            },
            {
              "key":"owner",
              "value":"akash1vn06ycjjnvsvl639fet9lajjctuturrtx7fvuj"
            },
            {
              "key":"dseq",
              "value":"140324"
            },
            {
              "key":"gseq",
              "value":"1"
            },
            {
              "key":"oseq",
              "value":"1"
            }
          ]
        },
        {
          "type":"message",
          "attributes":[
            {
              "key":"action",
              "value":"create-deployment"
            },
            {
              "key":"sender",
              "value":"akash1vn06ycjjnvsvl639fet9lajjctuturrtx7fvuj"
            },
            {
              "key":"sender",
              "value":"akash1vn06ycjjnvsvl639fet9lajjctuturrtx7fvuj"
            }
          ]
        },
        {
          "type":"transfer",
          "attributes":[
            {
              "key":"recipient",
              "value":"akash17xpfvakm2amg962yls6f84z3kell8c5lazw8j8"
            },
            {
              "key":"sender",
              "value":"akash1vn06ycjjnvsvl639fet9lajjctuturrtx7fvuj"
            },
            {
              "key":"amount",
              "value":"5000uakt"
            },
            {
              "key":"recipient",
              "value":"akash14pphss726thpwws3yc458hggufynm9x77l4l2u"
            },
            {
              "key":"sender",
              "value":"akash1vn06ycjjnvsvl639fet9lajjctuturrtx7fvuj"
            },
            {
              "key":"amount",
              "value":"5000000uakt"
            }
          ]
        }
      ]
    }
  ],
  "info":"",
  "gas_wanted":"100000",
  "gas_used":"94653",
  "tx":null,
  "timestamp":""
}
```

### Find your Deployment #

Find the Deployment Sequence (DSEQ) in the deployment you just created. You will need to replace the AKASH_DSEQ with the number from your deployment to configure a shell variable.

```bash
export AKASH_DSEQ=CHANGETHIS
```

Now set the Order Sequence (OSEQ) and Group Sequence (GSEQ). Note that if this is your first time deploying on Akash, OSEQ and GSEQ will be 1.

```bash
AKASH_OSEQ=1
AKASH_GSEQ=1
```

Verify we have the right values populated by running:

```bash
echo $AKASH_DSEQ $AKASH_OSEQ $AKASH_GSEQ
```

## View your Bids

After a short time, you should see bids from providers for this deployment with the following command:

```bash
provider-services query market bid list --owner=$AKASH_ACCOUNT_ADDRESS --node $AKASH_NODE --dseq $AKASH_DSEQ --state=open
```

### Choose a Provider

Note that there are bids from multiple different providers. In this case, both providers happen to be willing to accept a price of _1 uAKT_. This means that the lease can be created using _1 uAKT_ or _0.000001 AKT_ per block to execute the container. You should see a response similar to:

```
bids:
- bid:
    bid_id:
      dseq: "140324"
      gseq: 1
      oseq: 1
      owner: akash1vn06ycjjnvsvl639fet9lajjctuturrtx7fvuj
      provider: akash10cl5rm0cqnpj45knzakpa4cnvn5amzwp4lhcal
    created_at: "140326"
    price:
      amount: "1"
      denom: uakt
    state: open
  escrow_account:
    balance:
      amount: "50000000"
      denom: uakt
    id:
      scope: bid
      xid: akash1vn06ycjjnvsvl639fet9lajjctuturrtx7fvuj/140324/1/1/akash10cl5rm0cqnpj45knzakpa4cnvn5amzwp4lhcal
    owner: akash10cl5rm0cqnpj45knzakpa4cnvn5amzwp4lhcal
    settled_at: "140326"
    state: open
    transferred:
      amount: "0"
      denom: uakt
- bid:
    bid_id:
      dseq: "140324"
      gseq: 1
      oseq: 1
      owner: akash1vn06ycjjnvsvl639fet9lajjctuturrtx7fvuj
      provider: akash1f6gmtjpx4r8qda9nxjwq26fp5mcjyqmaq5m6j7
    created_at: "140326"
    price:
      amount: "1"
      denom: uakt
    state: open
  escrow_account:
    balance:
      amount: "50000000"
      denom: uakt
    id:
      scope: bid
      xid: akash1vn06ycjjnvsvl639fet9lajjctuturrtx7fvuj/140324/1/1/akash1f6gmtjpx4r8qda9nxjwq26fp5mcjyqmaq5m6j7
    owner: akash1f6gmtjpx4r8qda9nxjwq26fp5mcjyqmaq5m6j7
    settled_at: "140326"
    state: open
    transferred:
      amount: "0"
      denom: uakt
```

For this example, we will choose `akash10cl5rm0cqnpj45knzakpa4cnvn5amzwp4lhcal` Run this command to set the provider shell variable:

```
AKASH_PROVIDER=akash10cl5rm0cqnpj45knzakpa4cnvn5amzwp4lhcal
```

Verify we have the right value populated by running:

```
echo $AKASH_PROVIDER
```

## Create a Lease

Create a lease for the bid from the chosen provider above by running this command:

```
provider-services tx market lease create --dseq $AKASH_DSEQ --provider $AKASH_PROVIDER --from $AKASH_KEY_NAME
```

### Confirm the Lease

You can check the status of your lease by running:

```
provider-services query market lease list --owner $AKASH_ACCOUNT_ADDRESS --node $AKASH_NODE --dseq $AKASH_DSEQ
```

Note the bids will close automatically after 5 minutes, and you may get the response:

```
bid not open
```

If this happens, close your deployment and open a new deployment again. To close your deployment run this command:

```
provider-services tx deployment close --dseq $AKASH_DSEQ  --owner $AKASH_ACCOUNT_ADDRESS --from $AKASH_KEY_NAME
```

If your lease was successful you should see a response that ends with:

```
    state: active
```

{/* {% hint style="info" %} */}
Please note that once the lease is created, the provider will begin debiting your deployment's escrow account, even if you have not completed the deployment process by uploading the manifest in the following step.
{/* {% endhint %} */}

## Send the Manifest

Upload the manifest using the values from above step:

```
provider-services send-manifest deploy.yml --dseq $AKASH_DSEQ --provider $AKASH_PROVIDER --from $AKASH_KEY_NAME
```

### Confirm the URL

Now that the manifest is uploaded, your image is deployed. You can retrieve the access details by running the below:

```
provider-services lease-status --dseq $AKASH_DSEQ --from $AKASH_KEY_NAME --provider $AKASH_PROVIDER
```

You should see a response similar to:

```javascript
{
  "services": {
    "web": {
      "name": "web",
      "available": 1,
      "total": 1,
      "uris": [
        "rga3h05jetf9h3p6dbk62m19ck.ingress.ewr1p0.mainnet.akashian.io"
      ],
      "observed_generation": 1,
      "replicas": 1,
      "updated_replicas": 1,
      "ready_replicas": 1,
      "available_replicas": 1
    }
  },
  "forwarded_ports": {}
}
```

You can access the application by visiting the hostnames mapped to your deployment. Look for a URL/URI and copy it to your web browser.

### View your logs

You can view your application logs to debug issues or watch progress like so:

```bash
provider-services lease-logs \
  --dseq "$AKASH_DSEQ" \
  --provider "$AKASH_PROVIDER" \
  --from "$AKASH_KEY_NAME"
```

## Update the Deployment

### Update the Manifest

Update the deploy.yml manifest file with the desired change.

_**NOTE:**_\*\* Not all attributes of the manifest file are eligible for deployment update. If the hardware specs of the manifest are updated (I.e. CPU count), a re-deployment of the workload is necessary. Other attributes, such as deployment image and funding, are eligible for updates.

### Issue Transaction for On Chain Update

```
provider-services tx deployment update deploy.yml --dseq $AKASH_DSEQ --from $AKASH_KEY_NAME
```

### Send Updated Manifest to Provider

```
provider-services send-manifest deploy.yml --dseq $AKASH_DSEQ --provider $AKASH_PROVIDER --from $AKASH_KEY_NAME
```

## Close Deployment

### Close the Deployment

Should you need to close the deployment follow this step.

```
provider-services tx deployment close --from $AKASH_KEY_NAME
```
