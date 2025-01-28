---
categories: ["Guides"]
tags: ["Artificial Intelligence/Machine Learning"]
weight: 1
title: "H2O"
linkTitle: "H2O"
---

[H2O](https://h2o.ai/) is an in-memory platform for distributed, scalable machine learning. H2O uses familiar interfaces like R, Python, Scala, Java, JSON and the Flow notebook/web interface, and works seamlessly with big data technologies like Hadoop and Spark.

This guide covers deploying the H2O-3 (the third incarnation of H2O, and the successor to H2O-2) open-source machine learning platform on the Akash network. We'll use a sample SDL (Stack Definition Language) template and demonstrate deployment through both the Akash CLI and the Akash Console.

## Prerequisites

    - Akash Network Account: Set up your wallet and fund it with AKT.
    - Akash CLI: Installed and configured on your machine.
    - Akash Console: Accessible at console.akash.network.
    - H2O-3 Docker Image: We'll use the official Docker image for H2O.

## Step 1: Sample SDL Template

The following SDL template defines the deployment of H2O-3:

```
version: "2.0"

services:
  h2o3:
    image: h2oai/h2o-open-source-ai:latest
    env:
      - H2O_DRIVER_PORT=54321
      - H2O_WEB_PORT=54322
    expose:
      - port: 54321
        as: 80
        accept:
          - 0.0.0.0/0
        to:
          - global
      - port: 54322
        as: 443
        accept:
          - 0.0.0.0/0
        to:
          - global

profiles:
  compute:
    h2o3:
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
        region: us-west
      pricing:
        h2o3:
          denom: uakt
          amount: 1000

deployment:
  h2o3:
    akash:
      profile: h2o3
      count: 1
```

## Step 2: Deploy Using Akash CLI

1. **Create the Deployment**

Save the above SDL template as `deploy.yaml`. Run the following commands to deploy via the CLI:

```
provider-services tx deployment create deploy.yaml --from <your_wallet_name> --chain-id <chain_id> --node <node_url> --gas-prices <price> --gas-adjustment <adjustment>
```

2. **Bid on the Deployment**

Fetch the deployment status:

```
provider-services query market lease list --owner <your_wallet_address> --dseq <deployment_sequence>
```

Look for active bids and create a lease with:

```
provider-services tx market lease create --owner <your_wallet_address> --dseq <deployment_sequence> --gseq <group_sequence> --oseq <order_sequence> --from <your_wallet_name> --chain-id <chain_id> --node <node_url> --gas-prices <price> --gas-adjustment <adjustment>
```

3. **Access Your Deployment**

Once the lease is active, query the lease status to find the assigned external IP:

```
provider-services query market lease status --owner <your_wallet_address> --dseq <deployment_sequence> --gseq <group_sequence> --oseq <order_sequence> --provider <provider_address>
```

Visit <`assigned_IP`>:80 for the H2O API and <`assigned_IP`>:443 for the web UI.

## Step 3: Deploy Using Akash Console

1. **Login**:

    - Visit [Akash Console](https://console.akash.network/) and log in using your Akash wallet.

2. **Create Deployment**:

    - Navigate to "Deployments" and click "Create Deployment."
    - Upload the `deploy.yaml` file or paste the SDL directly.

3. **Review and Submit**:

    - Review the SDL details.
    - Submit the deployment and wait for bids.

4. **Select a Bid**:

    - Once bids are available, select the most suitable provider based on pricing and region.

5. **Access Your Deployment**:

    - After the lease is created, the provider will assign an external IP. Use this IP to access the H2O services.

## Step 4: Testing and Validation

    - **API Test**: Access the H2O-3 REST API at `http://<assigned_IP>:80/3/`.

    - **Web UI Test**: Visit` https://<assigned_IP>:443/` for the H2O-3 web interface.

    - **Monitor Logs**: Use the Akash CLI to view logs for the deployment:

    ```
    provider-services logs --dseq <deployment_sequence> --gseq <group_sequence> --oseq <order_sequence> --provider <provider_address> --from <your_wallet_name>
    ```

## Additional Notes

- Ensure the `uakt` balance in your wallet can cover deployment and lease costs.
- Adjust compute resources in the SDL file if H2O-3 requires more memory or CPU.
- Use SSL/TLS if deploying in production to secure the web interface.