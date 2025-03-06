---
categories: ["Guides"]
tags: ["Database", "NoSQL",]
weight: 1
title: "MongoDB"
linkTitle: "MongoDB"
---

MongoDB is a leading NoSQL database that offers high performance, high availability, and automatic scaling. It stores data in flexible, JSON-like documents, making it an excellent choice for modern applications requiring dynamic, hierarchical, or large-scale data management. With MongoDB, developers can leverage its schema-less nature to adapt quickly to changing application requirements.

**Key Features of MongoDB:**
- **Flexible Schema:** Store data in JSON-like documents for easier data modeling.
- **Horizontal Scalability:** Scale your application with built-in sharding.
- **High Availability:** Built-in replication ensures redundancy and failover support.
- **Rich Query Language:** Perform complex queries, aggregations, and more.
- **Wide Use Cases:** Ideal for applications in e-commerce, IoT, gaming, and beyond.

By deploying MongoDB on Akash, a decentralized cloud computing platform, users gain the advantage of cost-effective, censorship-resistant, and resilient database hosting.

---

## **Deploying MongoDB on Akash**

To deploy MongoDB on Akash, you need to define the deployment parameters in an SDL (Stack Definition Language) file. Below is a step-by-step guide:

### **Step 1: Install Akash CLI**

1. Install the Akash CLI on your local machine.
   ```bash
   curl https://raw.githubusercontent.com/ovrclk/akash/master/godownloader.sh | sh
   ```
2. Initialize your Akash wallet and fund it with the required AKT tokens.

### **Step 2: Prepare MongoDB SDL File**

Here’s a sample SDL file for deploying MongoDB:

```
version: "2.0"
services:
  mongodb:
    image: mongo:latest
    env:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=securepassword
    expose:
      - port: 27017
        as: 27017
        to:
          - global: true
        protocol: TCP
profiles:
  compute:
    mongodb:
      resources:
        cpu:
          units: 1
        memory:
          size: 512Mi
        storage:
          size: 5Gi
  placement:
    westcoast:
      attributes:
        region: us-west
      pricing:
        mongodb:
          denom: uakt
          amount: 1000
deployment:
  mongodb:
    westcoast:
      profile: mongodb
      count: 1
```

### **Step 3: Deploy the SDL on Akash**

1. Save the SDL file as `deploy.yaml`.
2. Use the Akash CLI to create a deployment:
   ```bash
   akash tx deployment create deploy.yaml --from <wallet-name> --node <akash-node> --chain-id <chain-id>
   ```
3. Wait for the deployment to be approved and available.

### **Step 4: Verify the Deployment**

1. Retrieve the service endpoint using:
   ```bash
   provider-services lease-status --dseq $AKASH_DSEQ --from $AKASH_KEY_NAME --provider $AKASH_PROVIDER
   ```
2. Connect to MongoDB using a MongoDB client or CLI:
   ```bash
   mongo --host <endpoint> --port 27017 -u admin -p securepassword
   ```

---

## **Advanced Configuration**

- **Data Persistence:** To persist data, consider mounting persistent storage. Modify the SDL to include volume bindings for the `/data/db` directory.
- **Scaling:** Adjust the compute resources and `count` to scale MongoDB for high-traffic applications.
- **Networking:** Use Akash’s reverse proxy or external load balancers to manage connections securely.

---

## **Conclusion**

By deploying MongoDB on Akash, you can achieve a cost-effective, decentralized, and scalable database solution for your application. With the flexibility of Akash and the powerful capabilities of MongoDB, you are well-equipped to handle modern data requirements while leveraging decentralized cloud infrastructure. Ensure to monitor the deployment’s performance and optimize resources for cost efficiency.

