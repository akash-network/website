---
categories: ["Guides"]
tags: ["Database", "NoSQL",]
weight: 1
title: "Deploying OrientDB on Akash: A Comprehensive Guide"
linkTitle: "OrientDB"
---
 

## **Overview of OrientDB**
OrientDB is an open-source, multi-model NoSQL database that combines the benefits of graph and document databases. It is designed to handle large-scale data with flexibility and efficiency, supporting ACID transactions and various querying capabilities. OrientDB is ideal for applications such as social networking, content management, and fraud detection, where relationships and data interconnectivity are critical.

### **Key Features of OrientDB**
1. **Multi-Model Support**: Offers both graph and document database capabilities.
2. **SQL-Like Query Language**: Provides SQL-like syntax for easy querying.
3. **Scalability**: Handles large datasets with support for sharding and replication.
4. **ACID Compliance**: Ensures reliable transactions.
5. **Open Source**: Freely available with a community and enterprise edition.

## **What is Akash?**
Akash is a decentralized cloud computing marketplace that allows developers to deploy and manage applications on a distributed network of providers at a lower cost compared to traditional cloud services. Akash uses **SDL (Stack Definition Language)** files to define application configurations for deployment.

---

## **Step-by-Step Guide to Deploy OrientDB on Akash**

### **Prerequisites**
1. Install the Akash CLI and set up your wallet.
2. Ensure you have AKT tokens for deployment fees.
3. Obtain the Akash provider endpoint.
4. Download OrientDB (Community Edition) or use its Docker image.

---

### **1. Create the SDL File**
The SDL file defines your deployment configuration for OrientDB on Akash. Here's a sample `deploy.yaml` file:

```
version: "2.0"

services:
  orientdb:
    image: orientdb:latest
    env:
      - ORIENTDB_ROOT_PASSWORD=yourpassword # Replace 'yourpassword' with a secure password
    expose:
      - port: 2424 # Binary Protocol Port
        as: 2424
        accept: true
        to:
          - global
      - port: 2480 # HTTP/REST API Port
        as: 2480
        accept: true
        to:
          - global

profiles:
  compute:
    orientdb:
      resources:
        cpu:
          units: 1
        memory:
          size: 2Gi
        storage:
          size: 10Gi
  placement:
    default:
      attributes:
        host: akash
      signedBy:
        anyOf:
          - akash.network
      pricing:
        orientdb:
          denom: uakt
          amount: 100

deployment:
  orientdb:
    orientdb:
      profile: orientdb
      count: 1
```

---

### **2. Steps to Deploy OrientDB**

#### **Step 1: Deploy the SDL File**
1. Save the `deploy.yaml` file in your local directory.
2. Deploy it using the Akash CLI:

   ```bash
   akash tx deployment create deploy.yaml --from <your_wallet_name> --node <node_url>
   ```

#### **Step 2: Wait for the Deployment**
- After submitting, wait for the deployment to propagate across the network.
- Confirm the deployment status with:

   ```bash
   akash query deployment list --owner <your_wallet_address>
   ```

#### **Step 3: Accept a Bid**
- Once providers offer their bids, accept a bid to proceed:

   ```bash
   akash tx market lease create --dseq <deployment_sequence> --gseq <group_sequence> --oseq <order_sequence> --from <your_wallet_name>
   ```

#### **Step 4: Access the Application**
- After the deployment is active, retrieve the lease details:

   ```bash
   akash query market lease list --owner <your_wallet_address>
   ```

- Access OrientDB using its exposed endpoints:
  - Binary Protocol: `tcp://<provider_endpoint>:2424`
  - HTTP/REST API: `http://<provider_endpoint>:2480`

---

### **3. Verifying OrientDB Deployment**
1. Use the OrientDB Web Console:
   - Navigate to `http://<provider_endpoint>:2480`.
   - Log in with `root` as the username and the password specified in the SDL file.

2. Test OrientDB with a sample database:
   - Create a new database using the Web Console.
   - Run queries to verify functionality.

---

### **4. Additional Notes**
- **Scaling**: Modify the `count` in the deployment profile to scale horizontally.
- **Monitoring**: Use Akash’s logs and metrics tools to monitor your OrientDB instance.
- **Persistence**: Add volume mounts for data persistence in the SDL file if required.

---

### **5. Cleanup**
To delete the deployment and free resources:

```bash
akash tx deployment close --owner <your_wallet_address> --dseq <deployment_sequence> --from <your_wallet_name>
```

---

By following this guide, you can effectively deploy and manage OrientDB on Akash's decentralized cloud platform, leveraging its cost-effectiveness and scalability.