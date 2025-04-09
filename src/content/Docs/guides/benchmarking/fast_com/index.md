---
categories: ["Guides"]
tags: ["Benchmarking"]
weight: 1
title: "Fast.com By Netflix"
linkTitle: "Fast_com"
---

![](../../../assets/fast-logo.png)

[Fast.com](https://fast.com) is a simple and easy-to-use internet speed test tool created by[ Netflix](https://netflix.com). It measures your download speed, which is often the most critical metric for streaming content. Unlike other speed tests that may provide more detailed metrics like upload speed, ping, and jitter, Fast.com focuses solely on the download speed to deliver a streamlined experience that aligns with Netflix's core service—streaming video content.

Fast.com uses Netflix's servers for testing, making it particularly relevant for users who want to gauge their internet speed for Netflix streaming.

## Prerequisites

Before you begin, make sure you have the following:

- [Akash CLI](/docs/getting-started/quickstart-guides/akash-cli/) installed and configured. You could alternatively use the [Akash Console](https://console.akash.network/deployments). 

- An Akash wallet with a minimum of 5 AKT to pay for the deployment.

- Docker: Installed and running on your machine. 

- An SDL file: This file defines the resources and configuration for your Akash deployment.

## Step 1: Pull the Official Docker Image

Netflix has not provided an official Docker image for Fast.com, so instead, you'll use a community-maintained image that replicates Fast.com's functionality. You can find this image on Docker Hub.

To pull the Docker image, use the following command:

```
docker pull ddooo/fast
```

## Step 2: Create the SDL File (`deploy.yaml`)

The SDL file is essential for deploying to Akash. It specifies the compute resources, the Docker image to use, and other configuration options. Below is a sample `deploy.yaml` file for deploying Fast.com:

```
---
version: "2.0"

services:
  fast:
    image: ddooo/fast
    expose:
      - port: 80
        to:
          - global: true
profiles:
  compute:
    fast:
      resources:
        cpu:
          units: 1.0
        memory:
          size: 512Mi
        storage:
          size: 512Mi
  placement:
    akash:
      pricing:
        fast:
          denom: uakt
          amount: 10000
deployment:
  fast:
    akash:
      profile: fast
      count: 1
```

## Step 3: Deploy to Akash 

### Using Akash CLI

With the SDL file ready, you can deploy it using the Akash CLI.

1. Initialize the Deployment: Use the following command to initialize the deployment:

```
provider-services tx deployment create deploy.yaml --from <your-wallet> --node <node-address> --chain-id <chain-id>
```

Replace `<your-wallet>`, `<node-address>`, and `<chain-id>` with your specific configurations.

2. Find a Provider: After initializing, find a provider that meets your requirements:

```
provider-services provider lease-status --from <your-wallet>
```

This command will show the available providers and the status of your lease.

3. Approve the Lease: Approve the lease to start the deployment:

```
provider-services tx market lease-create --from <your-wallet> --node <node-address> --chain-id <chain-id>
```

4. Monitor the Deployment: You can monitor the status of your deployment using:

```
provider-services provider lease-status --from <your-wallet>
```
This will give you the necessary details to access your deployment.

5. Access and Share Your Deployment:

Once the deployment is live, you can access the Fast.com service via the public IP address provided by the Akash Network. Share the IP address with others so they can test their internet speeds using your deployed service.

6. Manage and Terminate the Deployment:

To terminate your deployment when it's no longer needed, use the following command:

```
provider-services tx deployment close --from <your-wallet> --node <node-address> --chain-id <chain-id>
```

### Using Akash Console

If you prefer using the [Akash Console](https://console.akash.network/) (a web-based UI for managing deployments), follow these steps:

1. Login to Akash Console: Go to the Akash Console and log in using your wallet credentials.

2. Create a New Deployment: Click on "Create Deployment" and upload your deploy.yaml file.

3. Select a Provider: The console will show available providers based on your SDL configuration. Choose one that fits your requirements.

4. Deploy: Confirm the deployment and wait for it to go live.

5. Access the Service: Once deployed, the console will provide a link to access your Fast.com instance.


