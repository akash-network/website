---
categories: ["Guides"]
tags: ["Deployments"]
weight: 1
title: "Deploy an Apache HTTP Server on Akash"
linkTitle: "Apache HTTP Server"
---

The [Apache HTTP Server Project](https://httpd.apache.org/) is an effort to develop and maintain an open-source HTTP server for modern operating systems including UNIX and Windows. The goal of this project is to provide a secure, efficient and extensible server that provides HTTP services in sync with the current HTTP standards.

To deploy an Apache HTTP Server on Akash using Docker and Akash CLI, follow this step-by-step guide. We'll use the official Apache Docker image and deploy it with Akash.

## Prerequisites

1. **Install Akash CLI**: [Installation guide](/docs/deployments/akash-cli/overview/)
2. **Set up an Akash Wallet**: [Wallet setup guide](/docs/deployments/akash-cli/installation/#create-an-account)
3. **Fund your Wallet**: Ensure your wallet is funded with AKT to cover deployment costs. [Funding guide](/docs/deployments/akash-cli/installation/#fund-your-account)
4. **Basic SDL Knowledge**: Understand how SDL files work for Akash deployments.
5. **Docker**: Installed locally to test the Apache container.

## Step 1: Create an SDL File

We’ll use the **Apache HTTP Server official Docker image** to create the SDL file. Here’s a sample `deploy.yaml`:

```
---
version: "2.0"

services:
  apache:
    image: httpd:latest  # Official Docker image for Apache
    expose:
      - port: 80
        as: 80
        to:
          - global: true

profiles:
  compute:
    apache:
      resources:
        cpu:
          units: 1
        memory:
          size: 512Mi
        storage:
          size: 1Gi
  placement:
    global:
      attributes:
        region: us-west  # Specify your preferred region
      pricing:
        apache:
          denom: uakt
          amount: 100

deployment:
  apache:
    <<: *apache
    profile: apache
    count: 1
```

## Step 2a: Deploy Using Akash CLI (option)

1. Initialize Deployment:

    - Save the `deploy.yaml` file in your working directory.

    - Run the following command to create the deployment:
```
   provider-services tx deployment create deploy.yaml --from <your-wallet> --node <node-url> --chain-id <chain-id> --fees <fees>
```
2. Bid Selection:

    - Monitor the bids for your deployment using:
```
provider-services query market bid list --owner <your-address>
```
3. Accept a bid with:
```
   provider-services tx market lease create --bid-id <bid-id> --from <your-wallet> --fees <fees>
```
4. Verify Lease:

    - Confirm the lease creation with:
```
    provider-services query market lease list --owner <your-address>
```
5. Access Deployment:

    - Use the deployment’s external URI to access your Apache server.

## Step 2b: Deploy Using Akash Console (alternative option)

1. Log In:
    - Open the `Akash Console`.

2. Upload SDL:
    - Use the "Deploy" section and upload the `deploy.yaml` file.

3. Choose Configuration:
    - Select preferred pricing and configuration options.

4. Deploy:
    - Click "Deploy" and confirm using your wallet.

5. Monitor Deployment:
    - Watch logs and deployment status directly from the console.

6. Access Deployment:
    - Copy the public endpoint provided after deployment is complete.

## Step 3: Test Your Apache HTTP Server

1. Access the Server:
    - Open the external URI in your browser. You should see the default Apache HTTP Server page.

2. Custom Configuration:
    - Modify configurations by creating a Dockerfile to include your custom `httpd.conf` and updating the image in the SDL.

## Useful Links

    - Apache Docker Hub: https://hub.docker.com/_/httpd
    - Akash Documentation: https://akash.network/docs
    - Akash Console: https://console.akash.network
    - Akash CLI Deployment: (/docs/getting-started/quickstart-guides/akash-cli/)

This guide ensures you have a functional Apache HTTP server running on Akash Network using either the CLI or the console.