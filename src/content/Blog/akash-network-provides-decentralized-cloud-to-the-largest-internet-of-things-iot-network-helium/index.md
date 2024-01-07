---
title: "Akash Network Provides Decentralized Cloud to the Largest Internet of Things (IoT) Network, Helium"
description: Migrating the Helium blockchain's consensus group from hosted hotspots to validators is a major upgrade for scalability and performance. From the Foundation's perspective, we want to see Helium validators optimize for diversity of infrastructure and decentralization, which is why we're thrilled to have Akash in the Helium ecosystem.

pubDate: "2021-05-27"
draft: false

categories:
  - News
tags:
  - News
contributors:
  - Colin Pollen

bannerImage: ./banner-image.png
---

> Migrating the Helium blockchain's consensus group from hosted hotspots to validators is a major upgrade for scalability and performance. From the Foundation's perspective, we want to see Helium validators optimize for diversity of infrastructure and decentralization, which is why we're thrilled to have Akash in the Helium ecosystem. Not only is their performance and cost structure attractive to node operators, but their decentralized cloud aligns with our own ethos of creating permissionless and open systems.
>
> Scott Sigel, Director of Operations at the Decentralized Wireless Alliance, the nonprofit foundation arm of the Helium Network

Today, we’re excited to announce that we’ve been selected to support the Helium Network, the largest peer-to-peer wireless internet-of-things (IoT) network, and providing a decentralized, open-source, and low-cost cloud alternative for Helium’s new blockchain validators, projected to launch June 2021.

Validators will play an integral role in the expansion, stability, and success of the Helium network, acting as the consensus group, and performing functions that include verifying transactions and adding new blocks to the blockchain.

Akash Network is proud to be providing a faster, more efficient, and low-cost deployment and hosting solution for the Helium validator software.

As part of today’s announcement, I’ll be sharing how I learned to run a Helium validator on Akash, along with providing a detailed deployment guide.

### **How I learned to run a Helium Validator on Akash in one day**

Some people can dive into documentation and figure something out in an hour, but for someone like me, it can take a ***whole*** day. Fortunately, this article covers the step-by-step process of deploying a Helium Validator on the Akash decentralized cloud (DeCloud). By end of day, you’ll have a Helium Validator running on [Akash](https://akash.network/) DeCloud — and you don’t need to be a developer.

_**If you already know about Helium Validators, skip to the technical step-by-step section.**_

### **Why am I so excited about Helium?**

Today, the Helium blockchain, and its [30,000+ hotspots](https://explorer.helium.com/hotspots) provide access to the largest Long Range Wide Area Network (LoRaWAN) in the world. By deploying a simple device at your home or office, you are helping provide coverage for billions of devices and earning cryptocurrency.

Helium was started in 2013; MIT called [2013: The year of the Internet of Things](https://www.technologyreview.com/2013/01/04/180666/2013-the-year-of-the-internet-of-things/). It was the early days, when people still called it “The IoT”. Helium’s innovative LongFi technology is based on the IEEE 802.15.4 standard with enhancements to harden security, increase bandwidth, and simplify ease of use. In 2014, I signed up for the Helium Beta Kit, and I still have my original Helium Atom to this day. Helium’s VP [Mark Phillips](https://www.linkedin.com/in/mark-phillips-255b757/) even emailed me directly asking me to do some beta testing. I felt special to be part of something new.

The Helium blockchain and HNT launched in 2019 and sparked a massive growth in Helium’s network. If you were one of the early adopters, you’ve been mining HNT, and it’s likely paid off much more than the cost of the hotspot. Hotspots use Proof-of-Coverage (PoC) to verify wireless coverage from peers and earn rewards for providing coverage and transferring device data. A single Helium hotspot in the right neighborhood can earn over $12,000 (USD) in monthly HNT mining rewards.

New partnerships and customers are coming to Helium’s network including [FreedomFi](https://freedomfi.com/helium5g/)’s Helium5G network which pays people to host a 5G hotspot and reward them with HNT.

#### **Helium Validators are right around the corner.**

Helium’s Validators are a new entity on the Helium Blockchain that will perform the work of the consensus group including verifying transactions and adding new blocks to the blockchain. Helium Validators are projected to go live on their Mainnet by June 2021, and possibly sooner.

To host a Validator node requires a stake (deposit) of 10,000 HNT and running Validator node software in a suitable environment. In return for staking, users contribute to network stability and earn rewards.

![](https://www.datocms-assets.com/45776/1622233046-colin-1.png)

#### **Mining with Validators vs. Hotspots**

Validators split the Consensus Group reward, [which is 6% of all HNT mined](https://docs.helium.com/blockchain/mining/#mining-and-token-rewards). Approximately 300,000 HNT is split evenly amongst validators every month. Initial validator size is somewhere between 100 and 500. Early stakers will earn a larger % of the 300,000 HNT.

Compared with Helium hotspots, the earnings are split evenly amongst routers. There are currently over 30,000 routers and many more joining the network every day ,  reducing each routers individual earnings.

#### **What is the APR for running Helium Validator?**

It depends on the number of validators and how often a validator is randomly chosen to participate in the consensus group. Helium’s website depicts an estimated APR represented assuming 10k HNT per node.

![](https://www.datocms-assets.com/45776/1622233062-colin-2.png)

### **Why run on Akash?**

Akash is the first open-source and decentralized Cloud. Akash’s peer-to-peer marketplace offers the most flexible and cost-effective options for a developer to deploy their app.

- **Efficient:** Pay for what you need, when needed. Akash lets you set the price, length of lease, and terms of your deployment.
- **Flexible:** Compatible with all existing cloud applications. Akash Network supports generic compute — any cloud native applications running on the cloud today (AWS, Google Cloud, Microsoft Azure), can run on Akash.
- **Price Advantage:** Up to 10x lower in cost for developers. Helium Validators can run on Akash without worrying about running up an expensive bill from Amazon.
- **Censorship-resistant**: Akash is founded on the principle of permissionless open access and does not decide who can use the marketplace.
- **Open-source:** Purpose built for “builders” by some of the top developers in the world. Akash is a community-driven open source project that allows anyone to contribute.

With advanced containerization technology and a unique staking model to accelerate adoption, Akash will be a faster, more efficient, and up to 10x lower cost cloud platform.

### **How to run a Helium Validator on Akash**

This section is sourced from Tom Beynon’s [**Helium-on-Akash**](https://github.com/tombeynon/helium-on-akash) project and [**Helium’s Validator Deployment Guide**](https://docs.helium.com/mine-hnt/validators/validator-deployment-guide/). If you run into any issues or have feedback, feel free to join [**Akash’s Discord Chat**](http://chat/) and ask me for help. My name on Discord is @colinster.

Validators currently can only run on Helium’s Testnet —  a network designed to deploy and test new software for beta testing — before going live on their Mainnet — or production network. This means you’ll be deploying to the Testnet until Mainnet is live. This guide reflects deploying to the Testnet only. This guide will be updated when Validators are ready for MainNet.

#### **Step 1. Set Up a Helium Testnet Wallet** 

- Install the [Helium CLI Wallet](https://github.com/helium/helium-wallet-rs). The easy way to download the latest binary release. Download the latest binary for your platform here from [Releases](https://github.com/helium/helium-wallet-rs/releases/latest). Unpack the zip file and place the helium-wallet binary in your $PATH somewhere.
- Once you have your [Helium CLI Wallet](https://github.com/helium/helium-wallet-rs) installed locally, it’s time to create your Testnet Wallet. Run the following command to create it.

  helium-wallet create basic--network testnet

- You’ll be prompted to supply a new passphrase to complete it. This is used to encrypt/decrypt the wallet.key file, and is needed to sign transactions. Don't lose it.
- This command will produce a wallet.key file on your machine.
- Next, run the info command to get all the details for your wallet.

  helium-wallet info

#### **Step 2. Get Testnet Tokens (TNT)**

Running a Validator requires a stake. This stake is 10000 tokens per Validator. For the Testnet we are using TNTs.

To acquire them, head to [faucet.helium.wtf](https://faucet.helium.wtf/) and input your public key from the wallet you just created. Use your public wallet address. If you copy and paste, the one above the TNT will be sent to someone else.

Once you’ve inputted your address, the Faucet will deliver just over 10000 TNT to your Testnet Wallet. This can take up to 10 minutes so please be patient. Make a cup of coffee, issue a compelling tweet, then check your wallet balance using the balance command:

    helium-wallet balance

#### **Step 3. Set Up an Akash Mainnet Wallet**

- [Install the Akash CLI](https://docs.akash.network/guides/install). To installakashusing homebrew just enter:

  brew tap ovrclk/tap
  brew install akash
  brew link akash --force

- Set the variable AKASH_NET to the URL of the Akash MainNet. [You can also choose to deploy on Testnet or Edgenet.](https://docs.akash.network/guides/version) Enter the following command on your command prompt to set the variable.

  AKASH_NET="https://raw.githubusercontent.com/ovrclk/net/master/mainnet"

- Set the variable AKASH_VERSION to the URL of the Akash MainNet

  AKASH_VERSION="$(curl -s "$AKASH_NET/version.txt")"

- Set the variable AKASH_CHAIN_ID environment variable:

  AKASH_CHAIN_ID="$(curl -s "$AKASH_NET/chain-id.txt")"

- Set the variable AKASH_NODE environment variable:

  AKASH_NODE="$(curl -s "$AKASH_NET/rpc-nodes.txt" | shuf -n 1)"

- Set the variable AKASH_KEY_NAME to the Key name of your choosing. This documentation uses a value of “alice”.
- Set the variableAKASH_KEYRING_BACKEND Keyring backend to use for local keys. This should be os (default), file, ortest.
- Derive a new private key and encrypt to disk using the command keys add, to generate a key with the named alice, run the below:

  akash \
  --keyring-backend "$AKASH_KEYRING_BACKEND" \
    keys add "$AKASH_KEY_NAME"

You’ll see a response similar to below:

    - name: alice
    type: local
    address: akash1cz87pqkad72gggrv3t7y2x9z56h9gqghlnx3j3
    pubkey: akashpub1addwnpepqtnydvj056gy64uuquldq5yx7mr8ncmn3ut59wwl9p83d8h2v4rtg5xa3vn
    mnemonic: ""
    threshold: 0
    pubkeys: []
    **Important** write this mnemonic phrase in a safe place. It is the only way to recover your account if you ever forget your password.
    town wolf margin parrot strong disease dance eyebrow inflict meadow crunch version tube elite interest movie uphold column shift fox excuse humble nest call

**IMPORTANT:** It’s imperative your keep the mnemonic phrase is a safe place and it is the ONLY way to recover your private key incase you change or lose your device.

- Find your account address with this command:

  akash \
  --keyring-backend "$AKASH_KEYRING_BACKEND" \
    keys show "$AKASH_KEY_NAME" -a

#### **Step 4. Get Akash Tokens**

The easy way to get Akash Tokens (AKT) is to purchase them on [exchanges listed here](https://akash.network/token/). From there you can withdraw tokens to your address.

Another easy way to get Akash Tokens is to join [Akash’s Discord Chat](http://chat/) and ask me directly for help. My name on Discord is @colinster.

Check your account balance with the following CLI command:

    akash \
    --node "$AKASH_NODE" \
    query bank balances "$AKASH_ACCOUNT_ADDRESS"

#### **Step 5. Configure your Deployment**

The easiest way to deploy a Helium validator is using the working example of a deployment configuration for Akash. Clone the [**Helium-on-Akash**](https://github.com/tombeynon/helium-on-akash) from GitHub which includes three important files:

- Dockerfile - Installs the AWS CLI on top of the [Helium validator docker image](https://quay.io/team-helium/validator) and sets boot.sh to run whenever the container starts.
- boot.sh - This script instructs the docker container to download swarm_key from S3 (if it exists), start the miner and prints the address. It then uploads the swarm_key if it didn't download it earlier (new miner).
- deploy.yml - The deployment configuration is stored in the deploy.yml file, which includes all the important information including CPU, memory, storage, port configuration.

Enter your S3 bucket and IAM credentials into the env section. These settings will allow the container to connect to your S3 bucket and upload/download the swarm_key on boot. [Click here for step-by-step instructions on how to set up your S3 bucket.](https://docs.aws.amazon.com/AmazonS3/latest/userguide/example-walkthroughs-managing-access-example1.html#grant-permissions-to-user-in-your-account-step1)

If you have a swarm_key already, make sure this is uploaded to S3 in the same location as S3_KEY_PATH.

    image: tombeynon/helium-on-akash:v0.0.3
    env:
    — AWS_ACCESS_KEY=mykey
    — AWS_SECRET_KEY=mysecret
    — S3_KEY_PATH=mybucket/miner1/swarm_key

#### **Step 6. Deploy on Akash**

You can deploy your Validator on Akash using the Akash CLI following the [Akash deployment guide](https://docs.akash.network/guides/deploy) or using Tom Beynon’s [Deploy UI](https://github.com/tombeynon/akash-deploy).

Once the container is deployed, check the logs to see your address once the server starts (can take a while). If your swarm_key didn’t exist in S3 before, the new one should have been uploaded. Subsequent deploys using the same S3 details will now use the same swarm_key.

#### **Step 7: Stake Tokens to Your Validator**

Now that your Validator node is running, the final step in the process is to formally stake TNT to your Validator. As part of the staking process the Validator address needs to both be in the staking transaction and sign the transaction.

After a wallet stakes a validator node, the wallet becomes that node’s owner, has control over that validator node, and receives rewards.

First, double check your wallet balance to make sure you have the 10000 TNT required to stake, along with a few extra to cover the transaction fees. (The faucet provides all of this.)

    helium-wallet balance
    +-----------------------------------------------------+----------------+--------------+-----------------+
    | Address                                             | Balance        | Data Credits | Security Tokens |
    +-----------------------------------------------------+----------------+--------------+-----------------+
    | 1aP7nm6mGLMFtgiHQQxbPgKcBwnuQ6ehgTgTN8zjFuxByzJ8eA5 | 10005.00000000 | 0            | 0.00000000      |
    +-----------------------------------------------------+----------------+--------------+-----------------+

To stake tokens, we need to get the validator node address. Obtain it using the following:

    miner peer addr

The resulting output will look like this (except with your specific validator address). The string after /p2p/ is your Validator address:

    /p2p/1YwLbGTCEhVbwKEehRVQRC8N3q35ydXTH1B6BQys5FB1paHssdR

We can now use this address with the Helium Wallet CLI validators stake command to formally stake the 10000 TNT required.

Here's the full command using the Validator address from above as an example. (Make sure you replace it with yours.)

    helium-wallet validators stake 1YwLbGTCEhVbwKEehRVQRC8N3q35ydXTH1B6BQys5FB1paHssdR 10000 --commit

After running this, you’ll need to input your wallet passphrase to sign the transaction.

And with that, you’re done.

Congratulations! You’re running a Helium Network Validator.
