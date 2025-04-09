---
categories: ["Guides"]
tags: ["Blockchain"]
weight: 1
title: "Deploying Iron Fish on Akash"
linkTitle: "Deploying Iron Fish on Akash"
---

Iron Fish is a Layer 1 blockchain that ensures strong privacy for every transaction using zk-SNARKs. Miners play a crucial role in generating blocks and transmitting transactions. 

## Prerequisites

1. Iron Fish Wallet: You need an Iron Fish wallet to receive rewards. Get one [here](https://ironfish.network/docs/onboarding/iron-fish-tutorial).
2. Akash Account: Ensure you have an Akash account and wallet [set up](http://localhost:4321/docs/deployments/akash-console/).

## Deploy Iron Fish on Akash


1. Set Up Your Wallet: 

- Create your Iron Fish wallet if you haven't already. Follow the tutorial [here](https://ironfish.network/docs/onboarding/iron-fish-tutorial).
Prepare Deployment Configuration:

2. Download or clone the Iron Fish deployment configuration from the Awesome Akash [repository](https://github.com/akash-network/akash-network-website/tree/main).

3. Update Configuration:

- Open the deployment configuration file.
- Locate the `--address` field.
- Replace `REPLACE_ME` with your Iron Fish wallet address.

4. Deploy on Akash:

- Use the Akash CLI or Console to deploy the updated configuration.
- Follow Akash’s deployment steps to launch Iron Fish.

5. Verify Deployment:

- Ensure that Iron Fish is running correctly on Akash.
- Monitor the network status and check if your mining efforts are being recognized.
