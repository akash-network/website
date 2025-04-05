---
categories: ["Guides"]
tags: ["Deployments"]
weight: 1
title: "Setup, Deploy, and Launch Caddy on Akash Network"
linkTitle: "Caddy"
---

[Caddy](https://caddyserver.com/) is an extensible server platform that uses TLS by default. This guide walks you through setting up, deploying, and launching the Caddy web server on the Akash Network. We'll use the official Docker image for Caddy and leverage your provided SDL template to craft the deployment configuration.

## Prerequisites

1. **Install Akash CLI**: Follow the official guide to [set up the Akash CLI](/docs/getting-started/quickstart-guides/akash-cli/).
2. **Create an Akash Wallet**: If you don’t already have an Akash wallet, use the [wallet creation guide](/docs/getting-started/token-and-wallets/#keplr-wallet) to set one up.
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
provider-services deployment validate deploy.yaml
```

2. Create Deployment:
```
provider-services tx deployment create deploy.yaml --from <your-wallet-name> --chain-id <chain-id> --node <node-url> --fees <fee-amount>uakt
```
3. Query Lease: After creating the deployment, query the lease to ensure it’s active:
```
    provider-services query market lease list --owner <your-wallet-address> --node <node-url>
```
4. Access the Deployment: Note the endpoint provided in the lease logs. Use this URL to access your Caddy instance.

For detailed steps on using the CLI, refer to the Akash CLI Deployment Guide.

## Step 3: Deploy Using Akash Console

1. Access the Akash Console: Go to https://console.akash.network.

2. Login: Connect your Akash wallet to the console.

3. Create Deployment:
    - Upload the deploy.yaml file.
    - Follow the prompts to set pricing and finalize the deployment.

4. Monitor Deployment: Use the console to monitor logs and obtain the deployment’s public endpoint.

For more details, follow the [Akash Console Guide](/docs/deployments/akash-console/).

## Step 4: Verify and Launch Caddy

1. **Test the Endpoint**: Visit the public endpoint URL from your lease logs or the Akash console. You should see Caddy's default web page.

2. **Customize Caddy**:
    - Create a Caddyfile for custom configurations.
    - Update the Docker image to mount your Caddyfile.

3. **Redeploy if Necessary**: Update your SDL file and redeploy for any configuration changes.

## Troubleshooting

- **Akash Discord Support**: Join [Akash Discord](https://discord.gg/akash) for community help.