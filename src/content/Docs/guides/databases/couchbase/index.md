---
categories: ["Guides"]
tags: ["Database", "NoSQL"]
weight: 1
title: "Couchbase"
linkTitle: "Couchbase"
---




Couchbase is a distributed NoSQL database designed for interactive applications. It combines the benefits of a memory-first architecture, rich query capabilities, and a powerful indexing engine. Couchbase is often used for applications requiring high availability, scalability, and performance.

**Key Features of Couchbase:**
- **JSON Data Storage:** Flexible schema to adapt to dynamic application needs.
- **N1QL Query Language:** SQL-like query syntax for JSON data.
- **Memory-First Architecture:** Ensures low latency and high throughput.
- **Distributed Architecture:** Supports horizontal scaling.
- **Full-Text Search:** Built-in capabilities for advanced text-based queries.
- **Cross-Data Center Replication (XDCR):** Enables data replication across geographically distributed clusters.

---

## **Deploying Couchbase on Akash**

Akash is a decentralized cloud computing platform that allows developers to deploy containerized applications at a lower cost than traditional cloud providers. Here's a step-by-step guide to deploy Couchbase on Akash using the `couchbase` Docker image.

---

### **1. Prepare the Deployment Environment**

1. **Install Akash CLI:**  
   Follow the [official Akash CLI installation guide](docs/deployments/akash-cli/overview/) to set up your environment.

2. **Fund Your Wallet:**  
   Ensure your Akash wallet is funded with sufficient AKT tokens to pay for the deployment.

3. **Create the Deployment Directory:**  
   Set up a directory on your local machine to hold the deployment files.

---

### **2. Create the SDL File**

The SDL (Stack Definition Language) file specifies how Couchbase should be deployed on the Akash network.

Below is an example SDL file for deploying Couchbase:

```
---
version: "2.0"

services:
  couchbase:
    image: couchbase
    expose:
      - port: 8091
        as: 8091
        to:
          - global
      - port: 8092
        as: 8092
        to:
          - global
      - port: 11210
        as: 11210
        to:
          - global
      - port: 11211
        as: 11211
        to:
          - global
    env:
      - CB_USERNAME=admin           # Default Couchbase username
      - CB_PASSWORD=password        # Default Couchbase password
    resources:
      cpu:
        units: 1                    # CPU units
      memory:
        size: 2Gi                   # Memory allocation
      storage:
        size: 10Gi                  # Disk storage

profiles:
  compute:
    couchbase-profile:
      resources:
        cpu:
          units: 1
        memory:
          size: 2Gi
        storage:
          size: 10Gi
  placement:
    couchbase-placement:
      attributes:
        host: akash
      signedBy:
        anyOf:
          - akash
      pricing:
        couchbase-pricing:
          denom: uakt
          amount: 1000

deployment:
  couchbase-deployment:
    profile: couchbase-profile
    count: 1
```

---

### **3. Deploy the SDL File**

1. **Validate the SDL File:**
   Run the following command to ensure your SDL file is correctly formatted:
   ```
   akash tx deployment validate <path-to-sdl>
   ```

2. **Create the Deployment:**
   Deploy the Couchbase service:
   ```
   akash tx deployment create <path-to-sdl> --from <your-wallet-name> --chain-id <chain-id> --node <node-url>
   ```

3. **Bid and Lease Management:**
   - Wait for providers to bid on your deployment.
   - Select a provider and create a lease.

4. **Access Your Couchbase Service:**
   Once the lease is created, you'll receive the endpoint information. Use it to access Couchbase's web UI on `http://<provider-ip>:8091`.

---

### **4. Configure Couchbase**

1. **Access the Admin UI:**
   - Navigate to the Couchbase web interface using the URL provided.
   - Login using the credentials (`CB_USERNAME` and `CB_PASSWORD`) defined in the SDL file.

2. **Set Up Buckets:**
   - Buckets in Couchbase are similar to databases in relational systems.
   - Create buckets for your application needs.

3. **Connect Your Application:**
   - Use Couchbase SDKs or drivers to connect your application to the deployed Couchbase instance.

---

### **5. Monitor and Scale**

- **Monitor Usage:**  
  Use the Couchbase admin UI to monitor resource usage and performance.

- **Scale the Deployment:**  
  Update the `count` field in the SDL file to scale the Couchbase deployment horizontally and redeploy.

---

## **Conclusion**

Deploying Couchbase on Akash provides a cost-efficient and scalable solution for distributed applications. By leveraging Akash’s decentralized infrastructure and Couchbase’s advanced database capabilities, you can build high-performance, scalable systems with minimal overhead.