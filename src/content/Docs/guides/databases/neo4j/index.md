---
categories: ["Guides"]
tags: ["Database", "Graph",]
weight: 1
title: "Guide to Deploy Neo4j on Akash "
linkTitle: "Neo4j"
---



This guide will walk you through deploying Neo4j on Akash, a decentralized cloud computing platform, using the official Neo4j Docker image.

### **Prerequisites**
1. Akash CLI installed and configured with your wallet.
2. A funded wallet with sufficient AKT to cover deployment costs.
3. Basic knowledge of Akash and Docker.

---

## **Step 1: Prepare the SDL File**

Save the following content as `deploy.yaml`:

```
---
version: "2.0"

services:
  neo4j:
    image: neo4j:latest
    env:
      - NEO4J_AUTH=neo4j/testpassword # Replace with a secure password
    expose:
      - port: 7474
        as: 80
        to:
          - global
      - port: 7687
        as: 7687
        to:
          - global
    resources:
      cpu:
        units: 1
      memory:
        size: 2Gi
      storage:
        size: 5Gi

profiles:
  compute:
    neo4j:
      placement:
        cloud: any
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
        host: akash
      signedBy:
        anyOf:
          - "akash.network"
      pricing:
        neo4j:
          denom: uakt
          amount: 100 # Adjust based on your budget

deployment:
  neo4j:
    neo4j:
      profile: neo4j
      count: 1
```

---

## **Step 2: Deploy on Akash**

1. **Create the deployment:**
   Run the following command to create a deployment from the `deploy.yaml` file:
   ```
   akash tx deployment create deploy.yaml --from <wallet-name> --node <node-address> --chain-id <chain-id>
   ```

2. **Monitor the deployment:**
   After the deployment is created, query its status:
   ```
   akash query deployment list --owner <your-address>
   ```

3. **Bid on the deployment:**
   Wait for providers to bid on your deployment. Accept a bid with:
   ```
   akash tx market lease create --owner <your-address> --dseq <deployment-sequence> --from <wallet-name>
   ```

4. **Get the service endpoint:**
   Once the lease is created, retrieve the service endpoint using:
   ```
   akash query market lease-status --owner <your-address> --dseq <deployment-sequence> --node <node-address>
   ```

---

## **Step 3: Access Neo4j**

1. Open a browser and navigate to `http://<service-endpoint>` for the Neo4j UI.
2. Connect to the Bolt protocol using port `7687` if required for programmatic access.

---

## **Step 4: Secure Your Deployment**

1. Replace `NEO4J_AUTH=neo4j/testpassword` in the SDL file with a secure password.
2. Use environment variables to securely manage sensitive credentials.

---

This guide should get you up and running with Neo4j on Akash. 