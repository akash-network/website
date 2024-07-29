---
categories: ["Guides"]
tags: ["Blockchain"]
weight: 1
title: "Mine Raptoreum on Akash Network"
linkTitle: "Mine Raptoreum on Akash Network"
description: How to Mine Raptoreum (RTM) on Akash Network
---

![](../../../assets/raptoreumAkashlytics.png)

## Why use Akash?

Welcome [**Raptoreum**](https://raptoreum.com) \*\*\*\* miners! [**Akash**](https://akash.network) is a decentralized marketplace of compute with thousands of CPU's ready for small and large deployments. Raptoreum mining can be deployed on the network successfully using this guide. Akash is a part of the [**Cosmos**](https://cosmos.network) ecosystem of blockchains.

## Windows/Linux/Mac Users

1. Install [**Keplr**](https://chrome.google.com/webstore/detail/keplr/dmkamcknogkgcdfhhbddcghachkejeap?hl=en) \*\*\*\* wallet as a browser plugin
2. Go to the [**Akash Console**](https://console.akash.network/new-deployment) \*\*\*\* and import your AKT wallet address from Keplr
3. [**Fund your wallet**](/token/#buying-akt)

For additional help we recommend you [**follow our full deployment guide**](/docs/deployments/akash-console/) \*\*\*\* in parallel with this guide.

## How does this work?

Akash uses its blockchain to manage your container deployment and accounting. To deploy on Akash you will need to fund your wallet with at least 10 AKT. Each time you create a deployment, 0.5 AKT will be used for escrow and to fund the deployment. If the deployment is cancelled, the balance of the escrow is returned to you. You can spin up deployments without worrying about any long term contracts and you can cancel anytime.

## Default wallet

Akash uses [**Keplr**](https://chrome.google.com/webstore/detail/keplr/dmkamcknogkgcdfhhbddcghachkejeap?hl=en) as the desktop wallet. Advanced users can follow the \*\*\*\* [**CLI wallet instructions**](/docs/deployments/akash-cli/installation/).

## Quickest way to get more AKT

To fund your deployment you will need AKT in your account. The fastest way to do that is in one of the following two ways.

### Buy on an Exchange

1. Install \*\*\*\* [**Keplr**](https://chrome.google.com/webstore/detail/keplr/dmkamcknogkgcdfhhbddcghachkejeap?hl=en)
2. Buy AKT on an \*\*\*\* [**exchange**](https://www.coingecko.com/en/coins/akash-network#markets)
3. Withdraw your AKT to your Keplr wallet

### Swap from ATOM to AKT

1. Install \*\*\*\* [**Keplr**](https://chrome.google.com/webstore/detail/keplr/dmkamcknogkgcdfhhbddcghachkejeap?hl=en)**.**
2. Send 10 ATOM to your new Cosmos wallet address inside Keplr (this address will start with _cosmos_).
3. Go to \*\*\*\* [**Osmosis Assets**](https://app.osmosis.zone/assets) > next to _Cosmos Hub - ATOM_ click on _Deposit_. This step will deposit ATOM from your Keplr wallet onto the Osmosis platform. Press _Connect Wallet_ to connect your Keplr wallet to Osmosis.
4. Now go back to \*\*\*\* [**Osmosis Homepage**](https://app.osmosis.zone/?from=ATOM&to=AKT) \*\*\*\* and ensure _ATOM > AKT_ is selected to complete the swap. This step swaps your ATOM you deposited onto the Osmosis platform into any other supported coin.
5. Return to the \*\*\*\* [**Osmosis Assets**](https://app.osmosis.zone/assets) page to withdraw your AKT to your Keplr wallet. This step withdraws AKT from the Osmosis platform back into your Keplr wallet. You can now send AKT to Akash Console

Have more questions? Find our team in \*\*\*\* [**Discord**](https://discord.gg/TQWWZYCb) and [**Telegram**](https://t.me/AkashNW).

## Deploying on Akash

Once you have set up your Keplr wallet and imported the address to Akash Console you are ready to create your first deployment. Follow the instructions in Akash Console to create a certificate, then click on _Create Deployment_.

When prompted to _Choose Template_ select _Empty_ as we will copy-and-paste the deploy.yaml file from this repository (listed below). Choose _Empty_ for the template and paste the deploy.yaml file adjusting your wallet address and pool variables as desired.

```
---
version: "2.0"

services:
  raptoreum:
    image: cryptoandcoffee/cpu-akash-cpuminer-gr-avx2:2
    expose:
      - port: 4048
        as: 80
        proto: tcp
        to:
          - global: true
    env:
      - "ADDRESS=RMB251ZucvCNyX1yoQqsSC2wwJ3s7fHx3b"
      - "POOL=suprnova" #You can enter custom pool here, otherwise suprnova nearest location will be used
      - "WORKER=akash"
      - "TUNE=no-tune"
      - "DONATION=0"
profiles:
  compute:
    raptoreum:
      resources:
        cpu:
          units: 1.0
        memory:
          size: 256Mi
        storage:
          size: 128Mi
  placement:
    akash:
      pricing:
        raptoreum:
          denom: uakt
          amount: 2

deployment:
  raptoreum:
    akash:
      profile: raptoreum
      count: 1
```

## Choosing a provider

Akash is a marketplace of compute. Providers set their own prices for compute resources. We recommend you try different providers and check your logs after deployment to determine the hashrate.

![](<../../../assets/chooseProvider (1).png>)

## How to speed up mining?

### Change the tuning option

_TUNE=no-tune_ variable in deploy.yaml to _TUNE=full-tune_

No tune will start mining right away - with no performance tuning of the container. Without this expect a lower hashrate. Be warned, tuning can take at least 3 hours before mining begins - so do not expect to see hashrate on the pool immediately. You can check your logs in Akash Console.

### Increase the deployment size on Akash

You can deploy more CPUs to mine faster.

```
cpu:
  units: 1.0 # Max cpu units is 10
```

Or increase the replica count from count: 1 to count: 2.

```
deployment:
  raptoreum:
    akash:
      profile: raptoreum
      count: 1 # Multiplier for cpu:units
```

## Check your profitability

After your deployment has finished tuning or is displaying results on the pool you can check your profitability by inputting your hashrate from the log file.

[**Minerstat profitability calculator**](https://minerstat.com/coin/RTM)

## What is the best pool? Where do I solo mine?

We recommend you check MiningPoolStats for the most up-to-date list of mining pools.

[**Mining Pool Stats**](https://miningpoolstats.stream/raptoreum)
