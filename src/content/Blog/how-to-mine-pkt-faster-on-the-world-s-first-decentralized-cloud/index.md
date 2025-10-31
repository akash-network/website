---
title: "How to Mine PKT Faster on The World’s First Decentralized Cloud"
description: Mining cryptocurrency on the cloud is much easier than building your own hardware. Cloud hosting usually comes at a higher cost and requires contracts, and service providers can charge extra fees for bandwidth usage.

pubDate: "2021-08-12"
draft: false

categories:
  - Developers
tags:
  - Developers
contributors:
  - Colin Pollen

bannerImage: ./banner-image.png
---

Mining cryptocurrency on the cloud is much easier than building your own hardware. Cloud hosting usually comes at a higher cost and requires contracts, and service providers can charge extra fees for bandwidth usage. Making things more difficult, some cloud providers are shutting off mining operations at will. Crypto-mining projects like [PKT](https://pkt.cash/), are looking for better cloud providers and now they can run on Akash Network, the world’s first open-source and decentralized cloud marketplace.

PKT is a Bitcoin fork using PacketCrypt, a “bandwidth-hard,” proof-of-work blockchain that requires bandwidth and CPU to mine. Miners use idle CPU time to generate small messages called announcements and broadcast them to block miners who pay for them. PKT announcement miners and block miners collaborate to connect bandwidth from their local Internet connections and build a global, decentralized edge network. The PKT Network is designed to enable high-speed, low-cost Internet access without requiring a corporate ISP.

Akash Network helps miners find and lease cloud-hosted CPU and bandwidth from data centers at a lower cost than traditional cloud providers. PKT miners operating on Akash spend 50% less compared to centralized cloud providers. Akash customers also reduce the risk of having operations shut down by providers. While providers ultimately decide if they want to stop bidding on a deployment, the providers on Akash Network are crypto-friendly and benefit by monetizing their underutilized hardware infrastructure on Akash’s marketplace.

Performance is critical to miners, and the team at Chandra Station found Akash was far more performant than Amazon Web Services (AWS) in a side-by-side comparison. We asked several experienced miners from the PKT community to validate the results. After further testing by the community, we found that miners on Akash produce about 2x the amount of PKT as the AWS (c4.2xlarge) EC2 instance with 8 cores. [See our performance results and share your results on the Akash Community](https://forum.akash.network/t/pkt-performance-testing-results/).

Supporting the PKT ecosystem is mutually beneficial to PKT and Akash. Akash’s community can deploy infrastructure towards PKT’s mission to decentralize access to the Internet and also profit by monetizing bandwidth resources.

### Choosing the Ideal Configuration for PKT

When choosing a configuration for PKT mining in the cloud, a higher amount of vCPU cores will yield more PKT, but this performance comes at a higher cost paid in Akash Token (AKT). Akash’s CTO, Adam Bozanovich, looked at the results of the performance testing with various CPU configurations to find the ideal configuration that produces the most PKT for the least AKT spent.

The ideal configuration for PKT miners is 10 vCPU, 1 GB RAM, 1 GB storage. Configurations with less than 10 vCPU do not yield as much PKT and consume excess RAM and storage.

Configurations with 1 core running on 10 miners still produce a similar amount of PKT, but the 10 core miner produced a better price to performance ratio.

[Visit the Akash Community](https://forum.akash.network/) to find more guides, ask for help, and connect with other PKT miners. You can also join the [Akash Discord server](http://discord.akash.network/) to chat with us live.

### Mining is as easy as 1, 2, 3

This article from [Chandra Station](https://www.chandrastation.com/) will walk you through how to deploy a PKT announcement miner on the Akash Network. There are three steps to a successful deployment:

1.  Creating a PKT wallet.
2.  Create a configuration file, using Akash’s stack definition language (SDL).
3.  Deploy the PKT miner on Akash.

### Step 1: Create Your PKT Wallet

There are PKT wallets for Windows, macOS and command-line. Visit [pkt.cash](https://pkt.cash/wallet/) and [pkt.world](http://pkt.world/wallet) (Windows only) to try out the wallets that support mining.

#### **Microsoft Windows**

- Download the most recent zip archive suffixed with -windows.zip available from [pktd releases page](https://github.com/pkt-cash/pktd/releases): (e.g. pktd-v1.3.1-windows.zip).
- Go to the Downloads directory.
- Unarchive the content of the file.
- Open the command prompt.
- Type cd Downloads to change directory to the downloads folder.

#### **MacOS and Linux**

- Download one of the most recent packages available for Linux or macOS from [pktd releases page](https://github.com/pkt-cash/pktd/releases): (e.g. pktd-v1.3.1-macos.pkg).
- Install pktwallet and other utilities by clicking on the package icon in the Finder.

#### **For Linux**

- Download one of the following packages:
- pktd-v1.3.1-linux.deb (Debian or Ubuntu).
- pktd-v1.3.1-linux.rpm (Fedora or RedHat).
- pktd AUR package (Arch linux or Manjaro).
- Install pktwallet and other utilities by clicking on the appropriate package icon or running an installation command.

#### Creating a wallet

To create a new PKT wallet, use the pktwallet — create command:

**For Mac:** `pktwallet --create`

**For Windows:** `./bin/pktwallet.exe --create`

You will be prompted to follow a few steps, make sure you write your seed words on paper so that you can recover your funds even if your computer is damaged.

#### Run PKT wallet

After creating your wallet, you can launch pktwallet with:

**For Mac:** `pktwallet`

**For Windows:** `./bin/pktwallet`

Watch the output from the logs and when you see a log line like this:

```sh
1608294386 [INF] headerlogger.go:64 Processed 1 block in the last 24.82s (height 702781, 2020-12-18 13:26:01 +0100 CET)
```

Compare the height number in the log line (e.g. 702781) to the number in [the pkt block explorer](https://explorer.pkt.cash/) to see when your wallet is up to date.

You may leave pktwallet running in the background or start it only when needed.

#### Creating a new PKT address

While **pktwallet** is running in the background, open a new terminal window, change directory again if needed, and run the following command:

**For Mac:** `pktctl --wallet getnewaddress`

**For Windows:** `./bin/pktctl.exe --wallet getnewaddress`

You should see a series of numbers and letters beginning with pkt1, this is your address which you can use for receiving coins.

**NOTE**: Every time you use getnewaddress, the address you receive must be remembered by **pktwallet** forever so only use it when you actually need an address.

You now have a PKT wallet address and we can move on to step two.

### Step 2: Create Your Configuration File 

When deploying on Akash, miners define the deployment services, data centers, requirements, and pricing parameters, in a “manifest” - a configuration file that may end in `.yml` or `.yaml`. This configuration file follows the YAML standard and is very similar to Docker Compose files. The file is written in a human-friendly language called [Stack Definition Language (SDL)](https://akash.network/docs/getting-started/stack-definition-language/). This SDL file is a form to request resources and declare deployment attributes.

Below is an example configuration file written in the Akash stack definition language (SDL). The file has four sections: version, services, profiles, deployment. Just change the wallet address in the **services** section and you are good to go, or modify it to your taste.

[Download the file](https://github.com/ovrclk/pkt-miner/blob/main/deploy.yaml) or copy the contents below and save it to a new file named `**deploy.yml**`.

```yml title="deploy.yml"
version: "2.0"
services:
  miner:
    image: chandrastation/pkt_on_akash:v1.0.0
    env:
      - WALLET_ADDR=<PKT_Wallet>
      - POOL1=http://pool.pkteer.com
      - POOL2=http://pool.pktpool.io
      - POOL3=http://pool.pkt.world
      - POOL4=http://pool.srizbi.com
    expose:
      - port: 3000
        as: 80
        to:
          - global: true

profiles:
  compute:
    miner:
      resources:
        cpu:
          units: 10
        memory:
          size: 1Gi
        storage:
          size: 1Gi
  placement:
    miner:
      attributes:
        host: akash
      signedBy:
        anyOf:
          - "akash1365yvmc4s7awdyj3n2sav7xfx76adc6dnmlx63"
      pricing:
        miner:
          denom: uakt
          amount: 1000

deployment:
  miner:
    miner:
      profile: miner
      count: 1
```

### Step 3: Deploy Your Miner to Akash

If you are new to Akash Network, you will need to install Akash and set up your wallet, and get some AKT to fund your deployments. Head over to the [Quick Start Guide](https://akash.network/docs/guides/deploy) to get started. It takes just a few minutes to install Akash, and just seconds to create a wallet and add a certificate to the Akash blockchain, enabling you to deploy to Akash.

We recommend using the amazing new [Akashlytics Deploy Tool](https://www.akashlytics.com/deploy) for an easy-to-use Windows or Mac OS tool to deploy. But we know you are a rockstar, and you’ll probably want to use the CLI, so keep reading.

Before you can create a deployment, a certificate must first be created. Your certificate needs to be created only once per account and can be used across all deployments. To do this, run:

```sh
akash tx cert create client --chain-id $AKASH_CHAIN_ID --keyring-backend os --from $AKASH_KEY_NAME --node $AKASH_NODE --fees 5000uakt
```

If you see an error adding your certificate to the blockchain, try again! Now to deploy on Akash, run:

```sh
akash tx deployment create deploy.yml --from` `**<your_wallet_name>**` `--node https://rpc.akash.forbole.com:443 --chain-id akashnet-2 --fees 5000uakt -y
```

After that command, a string of JSON will appear in your terminal/command prompt.

```json
{
  "height": "1696542",
  "txhash": "AF360662F5EF02E22C2FC7CDD1975164FC04651C8B911144FB9B15F06AEFE90C",
  "codespace": "",
  "code": 0,
  "data": "0A130A116372656174652D6465706C6F796D656E74",
  "raw_log": "[{\"events\":[{\"type\":\"akash.v1\",\"attributes\":[{\"key\":\"module\",\"value\":\"deployment\"},{\"key\":\"action\",\"value\":\"deployment-created\"},{\"key\":\"version\",\"value\":\"629fe5d9f40da5a3882b3e9d0ec3ad50d31bc6491f84807987196eed2f87a549\"},{\"key\":\"owner\",\"value\":\"akash10a670qvazh3qa6xdvclc4jtrdjrnwm392x66we\"},{\"key\":\"dseq\",\"value\":\"1696540\"},{\"key\":\"module\",\"value\":\"market\"},{\"key\":\"action\",\"value\":\"order-created\"},{\"key\":\"owner\",\"value\":\"akash10a670qvazh3qa6xdvclc4jtrdjrnwm392x66we\"},{\"key\":\"dseq\",\"value\":\"1696540\"},{\"key\":\"gseq\",\"value\":\"1\"},{\"key\":\"oseq\",\"value\":\"1\"}]},{\"type\":\"message\",\"attributes\":[{\"key\":\"action\",\"value\":\"create-deployment\"},{\"key\":\"sender\",\"value\":\"akash10a670qvazh3qa6xdvclc4jtrdjrnwm392x66we\"},{\"key\":\"sender\",\"value\":\"akash10a670qvazh3qa6xdvclc4jtrdjrnwm392x66we\"}]},{\"type\":\"transfer\",\"attributes\":[{\"key\":\"recipient\",\"value\":\"akash17xpfvakm2amg962yls6f84z3kell8c5lazw8j8\"},{\"key\":\"sender\",\"value\":\"akash10a670qvazh3qa6xdvclc4jtrdjrnwm392x66we\"},{\"key\":\"amount\",\"value\":\"5000uakt\"},{\"key\":\"recipient\",\"value\":\"akash14pphss726thpwws3yc458hggufynm9x77l4l2u\"},{\"key\":\"sender\",\"value\":\"akash10a670qvazh3qa6xdvclc4jtrdjrnwm392x66we\"},{\"key\":\"amount\",\"value\":\"5000000uakt\"}]}]}]",
  "logs": [
    {
      "msg_index": 0,
      "log": "",
      "events": [
        {
          "type": "akash.v1",
          "attributes": [
            { "key": "module", "value": "deployment" },
            { "key": "action", "value": "deployment-created" },
            {
              "key": "version",
              "value": "629fe5d9f40da5a3882b3e9d0ec3ad50d31bc6491f84807987196eed2f87a549"
            },
            {
              "key": "owner",
              "value": "akash10a670qvazh3qa6xdvclc4jtrdjrnwm392x66we"
            },
            { "key": "dseq", "value": "1696540" },
            { "key": "module", "value": "market" },
            { "key": "action", "value": "order-created" },
            {
              "key": "owner",
              "value": "akash10a670qvazh3qa6xdvclc4jtrdjrnwm392x66we"
            },
            { "key": "dseq", "value": "1696540" },
            { "key": "gseq", "value": "1" },
            { "key": "oseq", "value": "1" }
          ]
        },
        {
          "type": "message",
          "attributes": [
            { "key": "action", "value": "create-deployment" },
            {
              "key": "sender",
              "value": "akash10a670qvazh3qa6xdvclc4jtrdjrnwm392x66we"
            },
            {
              "key": "sender",
              "value": "akash10a670qvazh3qa6xdvclc4jtrdjrnwm392x66we"
            }
          ]
        },
        {
          "type": "transfer",
          "attributes": [
            {
              "key": "recipient",
              "value": "akash17xpfvakm2amg962yls6f84z3kell8c5lazw8j8"
            },
            {
              "key": "sender",
              "value": "akash10a670qvazh3qa6xdvclc4jtrdjrnwm392x66we"
            },
            { "key": "amount", "value": "5000uakt" },
            {
              "key": "recipient",
              "value": "akash14pphss726thpwws3yc458hggufynm9x77l4l2u"
            },
            {
              "key": "sender",
              "value": "akash10a670qvazh3qa6xdvclc4jtrdjrnwm392x66we"
            },
            { "key": "amount", "value": "5000000uakt" }
          ]
        }
      ]
    }
  ],
  "info": "",
  "gas_wanted": "200000",
  "gas_used": "94750",
  "tx": null,
  "timestamp": ""
}
```

Find and take note of your **DSEQ** value in bold above. This is your deployment sequence number and identifies your miner on the network, and it will be used in the commands that follow.0

**{"key":"dseq","value":"1696540"}**

Note, if you just followed the Quick Start Guide, you might run into an error such as “deployment exists.” What happened is this **DSEQ** number was stored as an environmental variable in your shell terminal. You should clear it from memory by running this command:

`unset AKASH_DSEQ`

Next, run:

```sh
akash query deployment get --owner <your_akash_wallet_address> --node=tcp://135.181.60.250:26657 --dseq <your_dseq>
```

Create a market order.

```sh
akash query market order get --node=https://rpc.akash.forbole.com:443 --owner <your_akash_wallet> --dseq <your_dseq> --oseq 1 --gseq 1
```

Acquire a list of bids.

```sh
akash query market bid list --owner=<your_wallet_address> --node=https://rpc.akash.forbole.com:443 --dseq <your_dseq>
```

Select a bid from a provider.

```sh
akash tx market lease create --chain-id akashnet-2 --node=tcp://135.181.60.250:26657 --owner <your_wallet_address> --dseq <your_dseq> --gseq 1 --oseq 1 --provider <select_a_provider_from_the_list> --from <your_wallet_name> --fees 5000uakt
```

Confirm your lease is open.

```sh
akash query market lease list --owner <your_wallet_address> --node=tcp://135.181.60.250:26657 --dseq <your_dseq>
```

Send the manifest.

```sh
akash provider send-manifest deploy.yml --node=tcp://135.181.60.250:26657 --dseq <your_dseq> --provider <the_provider_you_selected> --home ~/.akash --from <your_wallet_address>
```

Ensure the miner is running by looking at your logs.

```sh
akash provider lease-logs --node=tcp://135.181.60.250:26657  --dseq <your_dseq> --gseq 1 --oseq 1 --provider <the_provider_you_selected> --from <your_wallet_address>
```

Another great way to see how much PKT you are mining is by visiting the [block explorer](https://explorer.pkt.cash) and inputting your PKT wallet address.

![](https://www.datocms-assets.com/45776/1628712507-1owxmka1g6tvyq6tnhhptta.png)

### You Should Now be Mining PKT

Not only is it cheaper to run a PKT miner on Akash but the PKT yield is also several times higher than what you would get running on AWS. Running the PKT miner in one of Akash’s cloud containers, with a single core, demonstrated twice the yield as an eight-core server running on AWS EC2.

**How to Get Help**

[Visit the Akash Community](https://forum.akash.network/c/mining) to find more guides, ask for help, and connect with other PKT miners. You can also join the [Akash Discord server](http://discord.akash.network/) to chat with us live and ask for support in the #deployments channel.
