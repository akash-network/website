---
categories: ["Guides"]
tags: ["Data Analytics"]
weight: 1
title: "Guide to Deploy Apache Druid on Akash Network"
linkTitle: "Apache Druid"
---

Apache Druid is a real-time analytics database designed for fast aggregation and exploration of large datasets. It is particularly suited for time-series data, enabling low-latency queries on high-ingest rates. Druid is widely used for applications like operational analytics, business intelligence dashboards, and interactive data exploration.  

**Key Features:**
- **Real-time ingestion**: Allows for streaming and batch data ingestion.
- **Columnar storage**: Optimized for analytical queries, offering high-speed data retrieval.
- **Scalability**: Built for horizontal scaling to handle petabyte-scale data.
- **High availability**: Provides redundancy and fault-tolerance with replication.
- **Flexible query models**: Supports SQL-like queries and Druid native queries.

---

## Why Deploy Apache Druid on Akash?

Akash Network is a decentralized cloud marketplace that allows users to deploy workloads at a fraction of the cost of traditional cloud providers. By deploying Apache Druid on Akash, you benefit from:
1. **Cost efficiency**: Lower operational costs for hosting large-scale infrastructure.
2. **Decentralization**: Increased control and reduced dependency on centralized cloud providers.
3. **Scalability**: Easily scale your cluster up or down based on requirements.
4. **Open-source synergy**: Both Druid and Akash are open-source, promoting flexibility and innovation.

---

## Step-by-Step Guide to Deploy Apache Druid on Akash

### 1. Prerequisites

1. **Akash CLI and Wallet Setup:**
   - Install the Akash CLI by following the [official documentation](/docs/deployments/akash-cli/overview/).
   - Fund your Akash wallet with sufficient AKT tokens.

2. **Druid Docker Image:**
   - Druid is available as a container image. You can use the official image from DockerHub: `apache/druid`.

3. **Akash SDL Template:**
   - Prepare an SDL (Stack Definition Language) file to define your deployment specifications.

---

### 2. Prepare Your Deployment Files

#### Sample SDL File for Druid Deployment

Below is an example SDL file to deploy a basic Druid cluster with a single node:

```yaml
version: "2.0"

services:
  druid:
    image: apache/druid:latest
    env:
      - DRUID_NODE_TYPE=coordinator-overlord
      - JAVA_OPTS=-Xmx4g -Xms4g
    expose:
      - port: 8081
        as: 80
        to:
          - global: true

profiles:
  compute:
    druid:
      resources:
        cpu:
          units: 1
        memory:
          size: 4Gi
        storage:
          size: 10Gi
  placement:
    westcoast:
      attributes:
        region: us-west
      signedBy:
        anyOf:
          - akash1...

deployment:
  druid:
    westcoast:
      profile:
        compute: druid
        placement: westcoast
      count: 1
```

---

### 3. Configure and Deploy

1. **Customize the SDL File:**
   - Adjust resource requirements (CPU, memory, and storage) based on your workload.
   - Specify the region or provider attributes.

2. **Validate the SDL File:**
   ```bash
   provider-services tx deployment create deploy.yaml --from <wallet-name>
   ```

3. **Send Your Deployment to Akash:**
   After successful validation, use the following commands to interact with the Akash marketplace:
   ```bash
   provider-services tx deployment create deploy.yaml --from <wallet-name>
   ```

4. **Approve Lease:**
   Once bids are received, select the appropriate provider and approve the lease:
   ```bash
   provider-services tx market lease create --dseq <deployment-sequence> --from <wallet-name>
   ```

---

### 4. Verify and Monitor

1. **Access Druid UI:**
   - Open your browser and navigate to the provider’s IP address or domain with port `8081`.

2. **Monitor Logs:**
   - Use the Akash CLI to check logs:
     ```bash
     provider-services provider lease logs --dseq <deployment-sequence> --from <wallet-name>
     ```

---

### 5. Scale and Manage

- To scale your deployment, update the `count` field in the SDL file for the `deployment` section.
- Redeploy the updated SDL file with:
  ```bash
  provider-services tx deployment update deploy.yaml --from <wallet-name>
  ```

---

## Best Practices for Deploying Apache Druid on Akash

1. **Use Persistent Storage:**
   - Configure volume mounts for data durability across container restarts.

2. **Clustered Deployment:**
   - For production workloads, deploy Druid in a clustered setup with multiple node types (e.g., broker, historical, and middle manager).

3. **Secure Your Deployment:**
   - Set up firewalls and secure ingress rules to restrict access to your Druid instance.

4. **Monitor Costs:**
   - Regularly review your usage to optimize resources and minimize costs.

---

Deploying Apache Druid on Akash provides a scalable and cost-efficient solution for analytics workloads. Customize the deployment as per your requirements and leverage the decentralized power of Akash to reduce dependency on traditional cloud providers.