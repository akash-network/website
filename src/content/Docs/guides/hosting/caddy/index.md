---
categories: ["Guides"]
tags: ["Deployment"]
weight: 1
title: "Setup, Deploy, and Launch Caddy on Akash Network"
linkTitle: "Caddy"
---

[Caddy](https://caddyserver.com/) is an extensible server platform that uses TLS by default. This guide walks you through setting up, deploying, and launching the Caddy web server on the Akash Network. We'll use the official Docker image for Caddy and leverage your provided SDL template to craft the deployment configuration.

## Prerequisites

1. **Install Akash CLI**: Follow the official guide to [set up the Akash CLI](http://localhost:4321/docs/getting-started/quickstart-guides/akash-cli/).
2. **Create an Akash Wallet**: If you don’t already have an Akash wallet, use the [wallet creation guide](http://localhost:4321/docs/getting-started/token-and-wallets/#keplr-wallet) to set one up.
3. **Fund Your Wallet**: Fund your Akash wallet with AKT tokens to pay for deployments.
4. **Install Docker**: Ensure Docker is installed and running on your local machine.
5. **Install a Code Editor**: Use an editor like VSCode for editing SDL files.

## Step 1: Prepare the SDL File (deploy.yaml)

Below is an example SDL file (deploy.yaml) for deploying Caddy using its official Docker image:

```
---
version: "2.0"

services:
  caddy:
    image: caddy:latest
    env:
      - CADDY_HOST=:80
    expose:
      - port: 80
        to:
          - global: true

profiles:
  compute:
    caddy:
      resources:
        cpu:
          units: 0.25
        memory:
          size: 512Mi
        storage:
          size: 1Gi

  placement:
    akash:
      attributes:
        region: us-west
      pricing:
        caddy:
          denom: uakt
          amount: 500

deployment:
  caddy:
    akash:
      profile: caddy
      count: 1
```

### Notes:

- **image**: Uses the official Caddy Docker image.
- **port**: Caddy listens on port 80 globally.
- **resources**: Allocates minimal CPU, memory, and storage resources.
- **pricing**: Defines a base price for deployment.

## Step 2: Deploy Using Akash CLI

1. Validate the SDL File:
```
akash deployment validate deploy.yaml
```

2. Create Deployment:
```
akash tx deployment create deploy.yaml --from <your-wallet-name> --chain-id <chain-id> --node <node-url> --fees <fee-amount>uakt
```
3. Query Lease: After creating the deployment, query the lease to ensure it’s active:
```
    akash query market lease list --owner <your-wallet-address> --node <node-url>
```
4. Access the Deployment: Note the endpoint provided in the lease logs. Use this URL to access your Caddy instance.

For detailed steps on using the CLI, refer to the Akash CLI Deployment Guide.

