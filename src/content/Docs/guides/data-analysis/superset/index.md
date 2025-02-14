---
categories: ["Guides"]
tags: ["Data Analysis"]
weight: 1
title: "Apache Superset"
linkTitle: "Apache Superset"
---

To deploy Apache Superset on the Akash network, follow these steps:

## Prerequisites

1. Akash Wallet with sufficient funds.
2. Akash CLI installed on your system and configured.
3. YAML Configuration File for Apache Superset. Here’s an example configuration that you can customize.

## 1. Create the YAML File for Apache Superset

Create a file named `deploy.yaml` and configure it with the required specifications to deploy Apache Superset. This configuration will define the resources, Docker image, and other settings for the deployment.

Here’s an example configuration:

```
---
version: "2.0"

services:
  superset:
    image: apache/superset:latest
    expose:
      - port: 8088
        as: 80
        to:
          - global: true
    env:
      SUPERSET_ENV: production
      SUPERSET_SECRET_KEY: <YOUR_SECRET_KEY>
      DATABASE_URL: <YOUR_DATABASE_URL>  # Replace with your database URL
    args:
      - "--timeout 60"

profiles:
  compute:
    superset:
      resources:
        cpu:
          units: 0.5
        memory:
          size: 1Gi
        storage:
          size: 5Gi

  placement:
    akash:
      pricing:
        superset:
          denom: uakt
          amount: 100  # Set the price you are willing to pay

deployment:
  superset:
    superset:
      profile:
        compute: superset
        placement: akash
      count: 1
```

## 2. Customize the YAML Configuration

Update the following placeholders in the `deploy.yaml` file:

    - **SUPERSET_SECRET_KEY**: Replace `<YOUR_SECRET_KEY>` with a secure, random key.
    - **DATABASE_URL**: Replace `<YOUR_DATABASE_URL>` with the database URL for Superset’s metadata (e.g., PostgreSQL, MySQL).

## 3. Deploy Apache Superset on Akash

1. Initialize the deployment by creating an Akash deployment with the deploy.yml file:

```
provider-services tx deployment create deploy.yml --from <your-wallet> --chain-id <chain-id> --node <node-address>
```

2. Verify the deployment status to check if it is live:

```
provider-services query deployment list --owner <your-wallet>
```

3. Find and accept a bid by checking available bids for your deployment and accepting one:

```
provider-services query market bid list --owner <your-wallet>
# Accept a bid
provider-services tx market lease create --from <your-wallet> --dseq <deployment-sequence> --oseq <order-sequence> --gseq <group-sequence> --provider <provider-address>
```

4. Retrieve the lease endpoint to access your Apache Superset instance:

    ```
    provider-services query market lease status --owner <your-wallet> --provider <provider-address> --dseq <deployment-sequence> --gseq <group-sequence> --oseq <order-sequence>
    ```
The endpoint will provide the public IP or domain where you can access your Apache Superset instance. Navigate to this address in your web browser to start using Apache Superset.

## Additional Configuration

- **Persistent Storage**: If needed, adjust the storage size in the compute section.
- **Scaling**: Adjust the count value under deployment to scale horizontally if needed.

This setup will run Apache Superset on Akash using minimal resources, but you may scale up CPU, memory, and storage based on your requirements.

