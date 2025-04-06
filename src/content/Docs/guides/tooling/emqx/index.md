---
categories: ["Guides"]
tags: ["Messaging", "MQTT"]
weight: 1
title: "EMQX"
linkTitle: "EMQX"
---

This guide walks you through deploying EMQX (Erlang MQTT Broker) on Akash Network using the official Docker image (`emqx`) and an SDL file for deployment.

---

### **Step 1: Prerequisites**

1. **Akash CLI Setup**: Ensure you have the Akash CLI installed and configured.
   - Follow the [Akash CLI guide](/docs/deployments/akash-cli/overview/) to set up your wallet and environment.
2. **Docker Hub Account**: Ensure access to the official `emqx` Docker image.
3. **Akash Provider**: Ensure your Akash provider is active for accepting deployments.

---

### **Step 2: Create the SDL File**

Here’s a sample SDL file (`deploy.yaml`) for deploying EMQX:

```
version: "2.0"

services:
  emqx:
    image: emqx/emqx:latest
    env:
      EMQX_NAME: "emq-node"
      EMQX_LISTENER__TCP__DEFAULT: "1883"
      EMQX_LISTENER__SSL__DEFAULT: "8883"
      EMQX_ADMIN_PASSWORD: "admin" # Set your admin password
    expose:
      - port: 1883
        as: 1883
        to:
          - global
      - port: 8883
        as: 8883
        to:
          - global
    resources:
      cpu:
        units: 0.5
      memory:
        size: 512Mi
      storage:
        size: 1Gi

profiles:
  compute:
    emqx:
      resources:
        cpu:
          units: 0.5
        memory:
          size: 512Mi
        storage:
          size: 1Gi
  placement:
    any-provider:
      attributes:
        host: akash
      signedBy:
        anyOf:
          - "akash.network"
      pricing:
        emqx:
          denom: uakt
          amount: 1000

deployment:
  emqx:
    profile:
      compute: emqx
      placement: any-provider
    count: 1
```

---

### **Step 3: Deploy the SDL File**

1. **Create the Deployment**:
   Run the following command to create a deployment using your `deploy.yaml` file:
   ```
   provider-services tx deployment create deploy.yaml --from <your-wallet-name> --node <node-url> --chain-id <chain-id>
   ```

2. **Bid Selection**:
   Once the deployment is created, choose a provider:
   ```
   provider-services query market bid list --owner <your-address>
   ```
   Accept a bid:
   ```
   provider-services tx market lease create --owner <your-address> --dseq <dseq> --oseq <oseq> --gseq <gseq> --from <your-wallet-name>
   ```

3. **Submit Manifest**:
   Submit the deployment manifest:
   ```
   provider-services tx deployment send-manifest deploy.yaml --from <your-wallet-name>
   ```

---

### **Step 4: Verify Deployment**

1. **Get Lease Info**:
   ```
   provider-services query market lease list --owner <your-address>
   ```
2. **Access Your Service**:
   - Use the `EMQX` broker’s exposed ports (`1883` for MQTT, `8883` for MQTT with SSL).
   - Obtain the service’s external IP address from the provider.

---

### **Step 5: Test the EMQX Deployment**

1. **MQTT Client**:
   Use any MQTT client to connect to your EMQX deployment:
   - Broker URL: `tcp://<external-ip>:1883`
   - SSL Broker URL: `ssl://<external-ip>:8883`

2. **Admin Dashboard**:
   Access the EMQX dashboard using the IP and appropriate port (default is `18083`):
   ```
   http://<external-ip>:18083
   ```
   Login using:
   - Username: `admin`
   - Password: `<password-set-in-env>`

---

### **Step 6: Manage and Scale**

1. **Update Deployment**:
   Modify the `deploy.yaml` file and submit updates as needed.

2. **Scaling**:
   Increase the `count` in the deployment section to add more EMQX nodes.

---

This setup provides a fully functioning EMQX broker on Akash Network, leveraging the flexibility and decentralized hosting capabilities of Akash. For further customization, refer to the [EMQX documentation](https://docs.emqx.com/en/) and Akash’s [deployment guides](/docs/deployments/akash-cli/overview/).
