---
categories: ["Guides"]
tags: ["Blockchain", "Explorer"]
weight: 1
title: "Guide to Deploy Solar on Akash"
linkTitle: "Solar"
---

**Solar** is a blockchain explorer and dashboard built for monitoring, querying, and analyzing data from blockchain networks. Its primary purpose is to provide a user-friendly interface for developers, validators, and other stakeholders to interact with and extract insights from blockchain data. The **Solar** platform can be deployed on decentralized infrastructure like **Akash**, ensuring cost-effective, scalable, and censorship-resistant hosting.

This guide outlines how to deploy **Solar** on Akash using the `upstage/solar` Docker image and a sample SDL (Service Definition Language) template.

---

## **Prerequisites**

1. **Akash CLI**: Install the Akash CLI on your system by following the [official guide](https://docs.akash.network/guides/cli).
2. **Akash Wallet**: Set up an Akash wallet with sufficient funds to pay for your deployment.
3. **Docker Knowledge**: Basic familiarity with Docker images.
4. **Solar Docker Image**: The prebuilt Docker image `upstage/solar`.

---

## **Steps to Deploy Solar on Akash**

### 1. Create a Deployment Folder
Start by creating a folder for your deployment files:
```
mkdir akash-solar && cd akash-solar
```

### 2. Write the SDL File
The SDL file defines the specifications of your deployment, such as the container image, ports, and resources. Use the following example for deploying **Solar**:

#### `deploy.yaml`
```
version: "2.0"

services:
  solar:
    image: upstage/solar:latest
    env:
      - NODE_ENV=production
    expose:
      - port: 80
        as: 80
        to:
          - global

profiles:
  compute:
    solar:
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
        region: us-west
      signedBy:
        anyOf:
          - akash.network
      pricing:
        solar:
          denom: uakt
          amount: 100

deployment:
  solar:
    akash:
      profile: solar
      count: 1
```

### 3. Validate the SDL File
Run the following command to ensure your SDL file is correctly formatted:
```
akash validate deploy.yaml
```

### 4. Deploy the SDL to Akash
#### a. Create a Deployment
Submit the SDL file to Akash:
```
akash tx deployment create deploy.yaml --from <your-wallet-name> --node <akash-node> --chain-id <akash-chain-id>
```

#### b. Query Deployment Status
Monitor the status of your deployment:
```
akash query deployment list --owner <your-address>
```

#### c. Fund the Lease
Once the deployment is accepted, fund the lease with tokens:
```
akash tx deployment deposit <deployment-id> <amount>uakt --from <your-wallet-name>
```

### 5. Access the Solar Dashboard
Once the deployment is live, Akash will provide an external IP address or hostname. Access the **Solar** dashboard in your browser at:
```
http://<deployment-address>
```

---

## **Overview of the SDL File**
- **Services Section**: Defines the `solar` service using the Docker image `upstage/solar:latest` and exposes port `80` to the global network.
- **Profiles Section**: Configures compute resources, including CPU, memory, and storage. It specifies a pricing model for deployment in Akash tokens (`uakt`).
- **Deployment Section**: Links the service to the compute profile and sets the number of instances to `1`.

---

## **Customizing the Deployment**
1. **Environment Variables**: Update `NODE_ENV` or add additional environment variables in the `env` section of the SDL file.
2. **Ports**: Modify the `port` and `as` fields under `expose` to match your desired setup.
3. **Resources**: Adjust `cpu`, `memory`, and `storage` based on your performance requirements.

---

By following this guide, you can successfully deploy and host **Solar** on Akash, leveraging its decentralized infrastructure to power your blockchain explorer.