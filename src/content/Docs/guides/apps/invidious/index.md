---
categories: ["Guides"]
tags: ["Social", "Streaming"]
weight: 1
title: "Invidious on Akash"
linkTitle: "Invidious"
---

Deploying [Invidious](https://invidious.io/), a privacy-respecting front-end for YouTube, on the Akash Network allows you to leverage decentralized cloud computing resources. This guide will walk you through the process of deploying Invidious on Akash using both the [Akash CLI](https://akash.network/docs/deployments/akash-cli/installation/) and [Akash Console](https://akash.network/docs/deployments/akash-console/).

## Prerequisites

1. **Akash Account**: Set up your Akash account and ensure you have AKT (Akash tokens) to pay for deployment.

2. **Docker**: Install Docker on your local machine to manage the Invidious container.

3. **Invidious Docker Image**: Familiarize yourself with the Invidious Docker image (`invidious/invidious:latest`).

4. **PostgreSQL Database**: Invidious requires a PostgreSQL database. Ensure you have access to a running instance.

5. **Domain Name (Optional)**: For a professional setup, configure a custom domain.

## Step-by-Step Deployment Guide

### Prepare the Invidious Docker Image

The official Docker image for Invidious is available on Docker Hub. Pull the image and test it locally if necessary:

```

docker pull invidious/invidious:latest

```

Optionally, run it locally to ensure it works as expected:

```

docker run -p 3000:3000 invidious/invidious

```

### Set Up Akash CLI or Use the Console

You can deploy on Akash using either the CLI or the web-based console:

- **[Akash CLI Installation Guide](https://akash.network/docs/deployments/akash-console/)**: Follow this guide to install the Akash CLI, which is essential for advanced deployment management.

- **[Akash Console Guide](https://akash.network/docs/deployments/akash-console/)**: Use the Akash Console for a more user-friendly, graphical approach to deploying on Akash.

## Create the Deployment File

Below is the SDL (Service Definition Language) file tailored for deploying Invidious on Akash. This file defines the resources and configuration needed for the deployment.

```

---
version: "2.0"

services:
  invidious:
    image: invidious/invidious:latest
    env:
      - DATABASE_URL=postgres://user:password@hostname:5432/invidiousdb
      - DOMAIN=https://yourdomain.com  # Replace with your domain if applicable
      - PORT=3000
    expose:
      - port: 3000
        as: 80
        to:
          - global: true
        protocol: http

profiles:
  compute:
    invidious:
      resources:
        cpu:
          units: 0.5          # Adjust according to your needs
        memory:
          size: 512Mi          # Adjust according to your needs
        storage:
          size: 2Gi            # Adjust according to your needs
  placement:
    akash:
      pricing:
        invidious:
          denom: uakt
          amount: 100000        # Adjust according to your budget

deployment:
  invidious:
    akash:
      profile: invidious
      count: 1
```

### Deploy Invidious on Akash

#### Using Akash CLI:

1. Prepare the SDL file: Save the above SDL configuration as `deployment.yaml`.

2. Deploy via CLI:

    - Navigate to the directory containing `deployment.yaml`.

    - Run the following command to initiate deployment:

    ```

    akash tx deployment create --file deployment.yaml --from your-wallet-name

    ```

    - Monitor Deployment:

        - Use the Akash CLI to check the status of your deployment:

        ```

        akash query deployment status

        ```

3. Using Akash Console:

    - **Log into Akash Console**: Open the [Akash Console](console.akash.network) and connect to it using your wallet.

    - **Upload SDL File**: Use the console interface to upload the `deployment.yaml` file.

    - **Deploy**: Follow the on-screen instructions to deploy the service.

### Access Your Invidious Instance

1. **Obtain the External IP**: Once the deployment is successful, Akash will provide an external IP address.

2. **Configure Domain Name (Optional)**: If you have a domain name, set up DNS to point to the provided IP address.

3. **Access the Service**: Open your browser and visit the IP address (or domain name) to access Invidious.

### Secure the Deployment

1. **HTTPS Configuration**: Use [Let’s Encrypt](https://letsencrypt.org/) (or a SSL/TLS certificate service) to secure your deployment with SSL.

2. **Firewall and Security**: Ensure proper security configurations are in place to protect your deployment.


