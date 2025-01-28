---
categories: ["Guides"]
tags: ["Messaging", "Streaming"]
weight: 1
title: "Guide to Deploy RocketMQ on Akash "
linkTitle: "RabbitMQ"
---


This guide will help you deploy Apache RocketMQ on Akash, leveraging the official Docker image. RocketMQ is a distributed messaging and streaming platform. The steps include creating an SDL file for Akash, setting up the RocketMQ broker and nameserver, and deploying them on Akash.

---

### **Prerequisites**
1. **Akash CLI Installed**: Make sure you have the Akash CLI installed and configured.
2. **Docker Image**: Use the official RocketMQ Docker image: `apache/rocketmq:latest`.
3. **Akash Account**: Ensure you have AKT tokens and are ready to deploy.
4. **Ports Used**:
   - Nameserver: `9876`
   - Broker: `10911`, `10912` (communication) and `10909` (Web access)

---

## **Step 1: Prepare the Akash SDL File**

The SDL (Stack Definition Language) file describes your deployment. Here’s an example `rocketmq-deployment.yml` for deploying RocketMQ's nameserver and broker:

```yaml
version: "2.0"

services:
  rocketmq-nameserver:
    image: apache/rocketmq:latest
    args: ["sh", "-c", "mqnamesrv"]
    env:
      - JAVA_OPT=-Duser.timezone=UTC
    expose:
      - port: 9876
        as: 9876
        to:
          - global: true

  rocketmq-broker:
    image: apache/rocketmq:latest
    args: ["sh", "-c", "mqbroker -n rocketmq-nameserver:9876"]
    env:
      - JAVA_OPT=-Duser.timezone=UTC
      - BROKER_ID=0
      - BROKER_NAME=broker-a
      - NAMESRV_ADDR=rocketmq-nameserver:9876
    expose:
      - port: 10909
        as: 10909
        to:
          - global: true
      - port: 10911
        as: 10911
        to:
          - global: true
      - port: 10912
        as: 10912
        to:
          - global: true

profiles:
  compute:
    rocketmq-nameserver:
      resources:
        cpu:
          units: 500m
        memory:
          size: 512Mi
        storage:
          size: 1Gi
    rocketmq-broker:
      resources:
        cpu:
          units: 1
        memory:
          size: 1Gi
        storage:
          size: 2Gi

deployment:
  rocketmq:
    rocketmq-nameserver:
      profile: rocketmq-nameserver
      count: 1
    rocketmq-broker:
      profile: rocketmq-broker
      count: 1
```

---

## **Step 2: Validate the SDL File**

Run the following command to validate the SDL file syntax:

```bash
provider-services validate --manifest rocketmq-deployment.yml
```

If there are errors, correct them before proceeding.

---

## **Step 3: Deploy RocketMQ on Akash**

1. **Create the Deployment:**

   Submit the deployment to Akash:

   ```bash
<<<<<<< HEAD
   provider-services tx deployment create rocketmq-deployment.yml --from <your-account> --gas auto --gas-prices 0.025uakt
=======
   akash tx deployment create rocketmq-deployment.yml --from <your-account> --gas auto --gas-prices 0.0025uakt
>>>>>>> 3d0281b5feb0124cad7689fa4cce08ac9610dcbb
   ```

2. **Check for Bids:**

   Monitor bids from providers using:

   ```bash
   provider-services query market bid list --owner <your-address>
   ```

3. **Accept a Bid:**

   Once you find a suitable bid, accept it:

   ```bash
   provider-services tx market lease create --owner <your-address> --provider <provider-address> --dseq <deployment-sequence> --from <your-account>
   ```

---

## **Step 4: Access RocketMQ**

Once deployed, you can access RocketMQ’s services globally using the assigned domain or IP and the following ports:

1. **Nameserver**: `<IP>:9876`
2. **Broker Web UI**: `<IP>:10909`
3. **Broker Communication**: Ports `10911` and `10912`.

---

## **Step 5: Test RocketMQ**

1. **Install the RocketMQ Client** on your local machine or server.
2. Configure the `NAMESRV_ADDR` to point to the Akash deployment: `<IP>:9876`.
3. Use RocketMQ’s CLI or SDKs to produce and consume messages to ensure everything is working.

---

## **Step 6: Monitor and Manage RocketMQ**

- Check logs by accessing the container logs using Akash CLI.
- Update the deployment if needed by modifying the SDL and resubmitting the deployment.

---

## **Optional Enhancements**
- **Persistent Storage**: Add persistent storage for message logs.
- **Scaling**: Use Akash profiles to scale the broker or nameserver.
- **Secure Access**: Add reverse proxy or VPN to secure RocketMQ services.

---

This guide provides a straightforward method to deploy RocketMQ on Akash using the official Docker image. 