---
categories: ["Guides"]
tags: ["Messaging"]
weight: 1
title: "NATS"
linkTitle: "NATS"
---


NATS is a lightweight, high-performance, open-source messaging system for distributed systems. Deploying it on Akash provides cost-effective, decentralized hosting for your messaging infrastructure.

---

## **Prerequisites**
1. **Akash Account**: Ensure you have an Akash wallet and some AKT tokens for deployment.
2. **Akash CLI**: Installed and configured. Refer to [Akash CLI setup](/docs/getting-started/quickstart-guides/akash-cli/).
3. **Dockerized NATS Image**: We'll use the official NATS Docker image (`nats:latest`).
4. **Domain/Access**: Optional but recommended to configure DNS for accessing your NATS instance.

---

## **Step 1: Write the SDL File**

Create an SDL file (e.g., `deploy.yaml`) that defines your NATS deployment:

```
---
version: "2.0"

services:
  nats:
    image: nats:latest
    env:
      - "NATS_SERVER_NAME=nats-server"
    expose:
      - port: 4222
        as: 4222
        to:
          - global
      - port: 6222
        as: 6222
        to:
          - global
      - port: 8222
        as: 8222
        to:
          - global

profiles:
  compute:
    nats:
      resources:
        cpu:
          units: 0.5
        memory:
          size: 512Mi
        storage:
          size: 1Gi

  placement:
    akash:
      attributes:
        host: akash
      signedBy:
        anyOf:
          - akash
      pricing:
        nats:
          denom: uakt
          amount: 1000

deployment:
  nats:
    akash:
      profile: nats
      count: 1
```

**Explanation:**
- **Services**: Defines the NATS container using the official Docker image.
- **Exposed Ports**:
  - `4222`: Client connections.
  - `6222`: Cluster connections (if scaling).
  - `8222`: Monitoring.
- **Profiles**:
  - `compute`: Allocates resources (CPU, memory, storage) for the NATS server.
  - `placement`: Specifies deployment attributes and pricing.

---

## **Step 2: Deploy the SDL**

### 1. **Create a Deployment**
Run the following command to create a deployment on Akash:

```bash
provider-services tx deployment create deploy.yaml --from <your_wallet> --chain-id <chain_id> --node <rpc_node> --fees 5000uakt -y
```

Replace:
- `<your_wallet>`: Your Akash wallet name.
- `<chain_id>`: Akash chain ID (e.g., `akashnet-2`).
- `<rpc_node>`: The Akash RPC node (e.g., `https://rpc.akash.network:443`).

### 2. **Wait for Deployment Approval**
Use this command to check the status of your deployment:

```bash
provider-services query deployment list --owner <your_address>
```

Once approved, you’ll get the `lease_id`.

---

## **Step 3: Validate the Lease**

After the provider accepts the deployment, create a lease using:

```bash
provider-services tx market lease create --dseq <deployment_sequence> --from <your_wallet> --chain-id <chain_id> --node <rpc_node> --fees 5000uakt -y
```

---

## **Step 4: Access the NATS Server**

### 1. **Find the Provider Endpoint**
Run the following command to retrieve the endpoint of your deployment:

```bash
aprovider-services query market lease get --owner <your_address> --dseq <deployment_sequence> --gseq 1 --oseq 1 --provider <provider_address>
```

### 2. **Connect to NATS**
Use the returned endpoint to connect your clients to the NATS server using the appropriate port (e.g., `4222`).

For example:
```bash
nats-server -connect <provider_endpoint>:4222
```

---

## **Optional: Configure DNS**
If you want a user-friendly domain name, map the provider's IP to your domain using a DNS record. This step enhances usability for production deployments.

---

## **Step 5: Monitor the NATS Server**

The NATS monitoring dashboard is exposed on port `8222`. Access it by navigating to:
```
http://<provider_endpoint>:8222
```

---

## **Step 6: Manage Your Deployment**

### **To Update Deployment**:
Modify the SDL file and use:
```bash
 provider-services tx deployment update deploy.yaml --from <your_wallet> --chain-id <chain_id> --node <rpc_node> --fees 5000uakt -y
```

### **To Close Deployment**:
Terminate the deployment when it’s no longer needed:
```bash
provider-services tx deployment close --dseq <deployment_sequence> --from <your_wallet> --chain-id <chain_id> --node <rpc_node> --fees 5000uakt -y
```

---

## **Conclusion**
This guide walks you through deploying NATS on Akash Network, ensuring cost-efficiency, scalability, and decentralization for your messaging infrastructure. Adjust the SDL file as needed for your use case, such as scaling resources or configuring security.