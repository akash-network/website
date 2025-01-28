---
categories: ["Guides"]
tags: ["Data Visualization"]
weight: 1
title: "DATAIKU"
linkTitle: "DATAIKU"
---

**Prerequisites**

1. Install the [Akash CLI](/docs/getting-started/quickstart-guides/akash-cli/) on your machine.
2. Fund your Akash wallet with the required AKT for deployment.
3. Set up the necessary environment variables:
    - AKASH_NODE (Akash node endpoint)
    - AKASH_KEY_NAME (Your Akash wallet name)
    - AKASH_CHAIN_ID (The Akash chain ID)
    - AKASH_ACCOUNT_ADDRESS (Your wallet address)

## Step 1: Create the `deploy.yaml` File

To get started, create a new file called `deploy.yaml`. This file will contain the configuration for deploying Dataiku on Akash, including settings for resources, environment variables, and services.

Below is an example `deploy.yaml` file that you can modify to fit your specific requirements:

```
version: "2.0"

services:
  dataiku:
    image: "dataiku/dss:latest"  # Replace with the specific Dataiku DSS image version if needed
    expose:
      - port: 10000              # The default port for Dataiku DSS
        as: 80
        to:
          - global
    env:
      DSS_PORT: 10000             # Dataiku DSS environment variable for the port
      DSS_USER: "dataiku"         # Default user for the DSS
      DSS_LICENSE_KEY: "your-license-key" # Dataiku license key (replace this with a valid license key)
    args:
      - "start"                   # Command to start Dataiku DSS

profiles:
  compute:
    dataiku:
      resources:
        cpu:
          units: 1
        memory:
          size: "4Gi"             # Memory allocation for the Dataiku instance
        storage:
          size: "10Gi"            # Storage space required for Dataiku installation and data processing

deployment:
  dataiku:
    profile: dataiku
    count: 1                      # Number of instances to deploy

```

## Step 2: Deploy the Application

1. **Initialize Deployment**: Use the Akash CLI to initialize the deployment:

```
provider-services tx deployment create deploy.yaml --from $AKASH_KEY_NAME --chain-id $AKASH_CHAIN_ID --node $AKASH_NODE
```

2. **Check Lease Status**: After deploying, you need to monitor the lease and ensure it’s active. Run:

```
provider-services query market lease list --owner $AKASH_ACCOUNT_ADDRESS --node $AKASH_NODE --chain-id $AKASH_CHAIN_ID
```
3. **Obtain Lease Information**: Once the lease is confirmed, fetch the details:

```
provider-services query market lease status --owner $AKASH_ACCOUNT_ADDRESS --chain-id $AKASH_CHAIN_ID --node $AKASH_NODE --provider <provider-address>
```
Make sure to replace <provider-address> with the provider's actual address from the lease status.

4. **Access Dataiku**: Use the deployment IP address and assigned port to access Dataiku through a browser. The URL format will be:

```
http://<provider-ip>:<port>
```
Replace <provider-ip> and <port> with the actual values from your lease information.

## Step 3: Configure and Secure Dataiku (Optional)
To secure your Dataiku instance:

- Configure firewall settings to restrict access to trusted IPs only.
- Set up SSH tunneling if your application requires more secure access.
