---
categories: ["Guides"]
tags: ["Messaging", "MQTT"]
weight: 1
title: "Lightstreamer"
linkTitle: "Lightstreamer"
---


This guide will walk you through deploying Lightstreamer on Akash, utilizing the official Docker image provided by Lightstreamer.

---

### **Prerequisites**
1. **Akash CLI Setup**: Ensure you have the Akash CLI installed and configured. Refer to the [Akash documentation](https://akash.network/docs) for setup instructions.
2. **Docker Image**: Use the official Lightstreamer Docker image (`lightstreamer`) from Docker Hub.
3. **Akash Wallet**: Have an Akash wallet funded with AKT tokens to cover deployment costs.
4. **SDL File Template**: Use an SDL (Stack Definition Language) file for deployment configuration.

---

## **Steps to Deploy Lightstreamer**

### Step 1: Pull the Official Lightstreamer Docker Image
Ensure you can access the Lightstreamer image by pulling it locally:
```
docker pull lightstreamer
```

---

### Step 2: Create an SDL File
Create an SDL file (`deploy.yaml`) that specifies your deployment requirements for Lightstreamer. Below is a template SDL file configured for the Lightstreamer Docker container.

```
---
version: "2.0"

services:
  lightstreamer:
    image: lightstreamer
    env:
      - LS_LOGGER_CONF=/lightstreamer/conf/lightstreamer_log_conf.xml
    expose:
      - port: 8080
        as: 8080
        to:
          - global: true

profiles:
  compute:
    lightstreamer:
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
        lightstreamer:
          denom: uakt
          amount: 100

deployment:
  lightstreamer:
    lightstreamer:
      profile:
        compute: lightstreamer
        placement: akash
      count: 1
```

**Explanation:**
- **`image`**: Uses the official Lightstreamer Docker image.
- **`env`**: Sets necessary environment variables (modify as needed for Lightstreamer configuration).
- **`port: 8080`**: Exposes port 8080 for external access.
- **Resources**: Allocates 0.5 CPU, 512 MB RAM, and 1 GB storage.
- **Pricing**: Sets a bid price of 100 uAKT (adjust based on your needs).

---

### Step 3: Deploy to Akash
1. **Create the Deployment**:
   Use the `provider-services tx deployment create` command to submit your deployment.

   ```
   provider-services tx deployment create deploy.yaml --from <your-wallet-name> --chain-id <chain-id> --node <node-url>
   ```

2. **Check Deployment Status**:
   Verify the status of your deployment to ensure it was accepted:
   ```
   provider-services query deployment list --owner <your-wallet-address>
   ```

3. **Accept a Bid**:
   Once your deployment is active, accept a provider’s bid:
   ```
   provider-services tx deployment lease create --from <your-wallet-name> --chain-id <chain-id> --node <node-url>
   ```

4. **Query Lease Status**:
   Confirm the lease has been established:
   ```
   provider-services query market lease list --owner <your-wallet-address>
   ```

---

### Step 4: Access the Lightstreamer Service
Once the lease is active, find the external IP and port assigned to your deployment:
```
provider-services query provider service-logs --provider <provider-address> --dseq <deployment-sequence>
```

Visit the Lightstreamer service in your browser using the assigned URL:
```
http://<external-ip>:8080
```

---

## **Customizing Lightstreamer**
- To customize configurations (e.g., log files or server settings), mount your configuration files into the container. Update the `SDL` file to include a volume mount:
  ```
  services:
    lightstreamer:
      image: lightstreamer
      env:
        - LS_LOGGER_CONF=/custom/path/log_conf.xml
      expose:
        - port: 8080
          as: 8080
          to:
            - global: true
      volumes:
        - /local/path/to/config:/lightstreamer/conf
  ```

---

### **Useful Commands**
- **Stop a Deployment**:
  ```
  provider-services tx deployment close --dseq <deployment-sequence> --from <your-wallet-name>
  ```
- **Fetch Logs**:
  ```
  provider-services query provider service-logs --provider <provider-address> --dseq <deployment-sequence>
  ```

---

By following these steps, you can successfully deploy Lightstreamer on the Akash network using its official Docker image. Adjust the resources and configuration as needed for your specific use case.