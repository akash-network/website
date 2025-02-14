---
categories: ["Guides"]
tags: ["Artificial Intelligence/Machine Learning"]
weight: 1
title: "H2O Flow"
linkTitle: "H2O Flow"
---

H2O Flow is a tool for machine learning workflows, typically running as part of the H2O.ai suite, and Akash offers a decentralized cloud environment where you can host this application.

## Step 1: Write the deploy.yaml File for H2O Flow

1. **Define Basic Configuration** Create a new file named `deploy.yaml`. Inside this file, include the necessary fields that Akash requires, such as version, services, profiles, and deployments. Here’s a sample structure:

```
version: "2.0"

services:
  h2o-flow:
    image: "h2oai/h2o-open-source-k8s:latest"
    args: ["java", "-jar", "/h2o.jar", "-flow_dir", "/h2oflow"]
    expose:
      - port: 54321
        as: 80
        to:
          - global: true

profiles:
  compute:
    h2o-flow:
      resources:
        cpu:
          units: 1
        memory:
          size: 2Gi
        storage:
          size: 5Gi

  placement:
    akash:
      attributes:
        region: "us-west"

deployments:
  h2o-deployment:
    h2o-flow:
      profile: h2o-flow
      count: 1
```

Here’s a breakdown of what each section is doing:

- **Services**: Defines the H2O Flow service, specifying the Docker image (`h2oai/h2o-open-source-k8s:latest`). This image includes H2O Flow in the /`h2o.jar` file.

- **Profiles**: Sets the required resources like CPU, memory, and storage.

- **Deployments**: Specifies how many instances of the service will be created (here, just one).

2. Save the `deploy.yaml` file in your working directory.

## Step 2: Install Akash CLI

If you haven’t already installed the Akash CLI, install it by following these instructions:

- Download the Akash CLI from their [GitHub Releases page](https://github.com/ovrclk/akash/releases).
- Install the CLI by following the instructions for your operating system.

## Step 3: Initialize and Fund Your Wallet

1. **Create a Wallet** if you don’t already have one:

```
provider-services keys add <your-wallet-name>
```

2. **Fund Your Wallet**: Get some Akash tokens (AKT) by either purchasing them or using the [faucet](https://faucet.sandbox-01.aksh.pw/) if available.

3. **Check Your Balance**: 

```
provider-services query bank balances <your-wallet-address>
```

## Step 4: Deploy on Akash

1. **Create a Certificate**:

```
provider-services tx cert create client --from <your-wallet-name> --chain-id akashnet-2 --fees 5000uakt
```

2. **Create a Deployment**: Run the following command to start the deployment with your deploy.yaml file:

```
provider-services tx deployment create deploy.yaml --from <your-wallet-name> --chain-id akashnet-2 --fees 5000uakt
```

3. **View the Deployment Status**: Once deployed, you can check the status by running:

```
provider-services query deployment list --owner <your-wallet-address>
```

4. **Get the Service Endpoint**: Once the deployment is live, you will get an external IP or domain through which you can access H2O Flow. Use this to connect to the H2O Flow service.

## Step 5: Connect to H2O Flow

1. Open a browser.

2. Navigate to `http://<your-service-endpoint>`.

3. You should see the H2O Flow interface.


This should give you a functional deployment of H2O Flow on Akash!
