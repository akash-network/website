---
categories: ["Guides"]
tags: ["Search"]
weight: 1
title: "OpenSearch"
linkTitle: "OpenSearch"
---

Here’s a step-by-step guide to deploying OpenSearch using the `opensearchproject/opensearch` Docker image on Akash, a decentralized cloud computing platform.

---

### **Step 1: Install Akash CLI**
1. Download and install the Akash CLI from the [Akash GitHub releases page](https://github.com/akash-network/node/releases).
2. Ensure you have an Akash wallet with sufficient funds for deployment.

---

### **Step 2: Write the SDL Deployment File**
Create a file called `deploy.yaml` for your OpenSearch deployment. Here’s a sample SDL template:

```
---
version: "2.0"

services:
  opensearch:
    image: opensearchproject/opensearch:latest
    env:
      - discovery.type=single-node # For standalone mode
    expose:
      - port: 9200
        as: 9200
        to:
          - global
      - port: 9600
        as: 9600
        to:
          - global

profiles:
  compute:
    opensearch:
      resources:
        cpu:
          units: 2
        memory:
          size: 4Gi
        storage:
          size: 10Gi
  placement:
    akash:
      pricing:
        opensearch:
          denom: uakt
          amount: 100

deployment:
  opensearch:
    opensearch:
      profile: opensearch
      count: 1
    placement:
      akash:
        profile: akash
        count: 1
```

---

### **Step 3: Deploy the SDL File on Akash**
1. **Upload the SDL File:**
   Run the following command to validate and create a deployment from your SDL file:
   ```
   provider-services tx deployment create deploy.yaml --from <wallet-name> --chain-id <chain-id> --node <node-url>
   ```

2. **Wait for Deployment Approval:**
   Akash will broadcast the deployment transaction. Wait for a provider to accept your bid.

3. **Lease the Deployment:**
   Once a bid is accepted, lease the deployment by running:
   ```
   provider-services tx market lease create --dseq <deployment-sequence> --oseq 1 --gseq 1 --from <wallet-name>
   ```

4. **Query Lease Details:**
   Use the following command to get the deployment’s IP address:
   ```
   provider-services provider lease-status --dseq <deployment-sequence> --oseq 1 --gseq 1 --provider <provider-address>
   ```

---

### **Step 4: Access OpenSearch**
1. Once deployed, OpenSearch will be available at the provider's public IP and port (e.g., `http://<provider-ip>:9200`).
2. Use tools like `curl` or any HTTP client to interact with the OpenSearch API:
   ```
   curl -X GET "http://<provider-ip>:9200/_cat/health?v"
   ```

---

### **Step 5: Monitor OpenSearch**
OpenSearch exposes a monitoring endpoint at port 9600. Access metrics and logs using:
```
curl -X GET "http://<provider-ip>:9600/_nodes/stats"
```

---

### **Optional: Persist Data Using External Storage**
By default, Akash deployments are stateless, and data will be lost if the container is restarted. To persist data:
1. Modify the SDL to include an external volume:
   ```
   services:
     opensearch:
       volumes:
         - /data:/mnt/data/opensearch
   ```
2. Attach persistent storage using Akash’s storage solutions.

---

This configuration deploys a single-node OpenSearch setup. For clustering, update the `discovery.type` and network configurations accordingly. Let me know if you'd like additional customization!