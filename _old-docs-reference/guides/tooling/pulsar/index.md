---
categories: ["Guides"]
tags: ["Messaging", "Streaming"]
weight: 1
title: "Apache Pulsar"
linkTitle: "Apache Pulsar"
---

Here’s a guide to deploying **Apache Pulsar** with all the official connectors and offloaders using the `apachepulsar/pulsar-all` image. 

## Steps to Deploy Apache Pulsar on Akash Network

1. **Prepare Environment**
   - Install Akash CLI or use an existing deployment manager for the Akash network.
   - Ensure you have the necessary funds in your Akash wallet to deploy.

2. **Write the Deployment YAML**

Below is the `deploy.yaml` configuration:

```
---
version: "2.0"
services:
  pulsar:
    image: apachepulsar/pulsar-all:latest
    expose:
      - port: 6650  # Pulsar Broker Port
        as: 6650
        to:
          - global: true
      - port: 8080  # Pulsar Admin API Port
        as: 80
        to:
          - global: true
    env:
      - PULSAR_MEM: "-Xms2g -Xmx2g -XX:MaxDirectMemorySize=4g"
      - PULSAR_STANDALONE_CONF: "/pulsar/conf/standalone.conf"
      - PULSAR_PREFIX_clusterName: "standalone"
    args:
      - bin/pulsar
      - standalone
      - "--no-functions-worker"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/admin/v2/clusters"]
      interval: 30s
      timeout: 5s
      retries: 3

profiles:
  compute:
    pulsar:
      resources:
        cpu:
          units: "2.0"
        memory:
          size: "4Gi"
        storage:
          - size: "20Gi"

  placement:
    global:
      pricing:
        pulsar:
          denom: uakt
          amount: 500

deployment:
  pulsar:
    global:
      profile: pulsar
      count: 1
```

## Explanation of the Deployment Configuration

- **Image**: Uses `apachepulsar/pulsar-all:latest`, which includes all official connectors and offloaders.
- **Ports**:
  - 6650: The Pulsar broker port for client connections.
  - 8080: The Pulsar Admin REST API for managing the Pulsar cluster.
- **Environment Variables**:
  - Configures JVM memory and standalone Pulsar setup.
- **Health Check**:
  - Ensures that the Pulsar Admin API is accessible to verify the service is running correctly.
- **Resource Allocation**:
  - Assigns 2 CPU cores, 4GB memory, and 20GB storage to the service.

## Deployment Instructions

1. Save the YAML file as `deploy.yaml`.
2. Deploy it using the Akash CLI:
   ```
   provider-services tx deployment create deploy.yaml --from <your_wallet> --chain-id <chain_id> --node <node_url>
   ```
3. Monitor the deployment:
   ```
   provider-services query deployment list --owner <your_wallet>
   ```

## Verifying the Deployment

1. Access the Pulsar Admin API:
   ```
   curl http://<deployment_url>:80/admin/v2/clusters
   ```
   Replace `<deployment_url>` with the URL provided by Akash for your deployment.

2. Connect a Pulsar client to the broker:
   ```
   pulsar-client produce my-topic --messages "Hello, Pulsar!"
   ```

This setup deploys Apache Pulsar with all connectors and offloaders, ready for production use. 