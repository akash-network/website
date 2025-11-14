---
categories: ["Guides"]
tags: ["STream Processing", "Message Broker"]
weight: 1
title: "Apache Kafka"
linkTitle: "Apache Kafka"
---

Deploying Apache Kafka on Akash using the official `apache/kafka` Docker image involves several steps, including preparing the SDL file, deploying it to the Akash network, and verifying the deployment. Follow the guide below:

---

## **Step 1: Prepare the SDL File**

Create an SDL (Service Definition Language) file to define your Kafka deployment. Here's an example of an SDL file (`kafka-deployment.yml`):

```
version: "2.0"

services:
  kafka:
    image: apache/kafka:latest
    env:
      - KAFKA_BROKER_ID=1
      - KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181
      - KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://{AKASH_HOST}:9092
      - KAFKA_LISTENERS=PLAINTEXT://0.0.0.0:9092
    expose:
      - port: 9092
        as: 9092
        to:
          - global

  zookeeper:
    image: bitnami/zookeeper:latest
    env:
      - ALLOW_ANONYMOUS_LOGIN=yes
    expose:
      - port: 2181
        as: 2181
        to:
          - global

profiles:
  compute:
    kafka:
      resources:
        cpu:
          units: 0.5
        memory:
          size: 1Gi
        storage:
          size: 5Gi
    zookeeper:
      resources:
        cpu:
          units: 0.25
        memory:
          size: 512Mi
        storage:
          size: 2Gi

  placement:
    akash:
      attributes:
        region: us-west
      signedBy:
        anyOf:
          - akash
      pricing:
        kafka:
          denom: uakt
          amount: 500
        zookeeper:
          denom: uakt
          amount: 300

deployment:
  kafka:
    profile: kafka
    count: 1
  zookeeper:
    profile: zookeeper
    count: 1
```

**Key Notes:**
- Replace `{AKASH_HOST}` with the hostname or IP of your Akash deployment (it will be assigned later).
- `zookeeper` is required as Kafka relies on it for distributed coordination.
- Adjust resource and pricing configurations based on your requirements.

---

## **Step 2: Deploy the SDL to Akash**

1. **Install Akash CLI:**
   Ensure you have the Akash CLI installed on your system. You can follow [Akash's official installation guide](/docs/deployments/akash-cli/overview/).

2. **Authenticate to Akash:**
   ```
   provider-services wallet import <your-wallet-key>
   ```

3. **Submit the Deployment:**
   ```
   provider-services tx deployment create kafka-deployment.yml --from <your-wallet-address>
   ```

4. **Bid on the Deployment:**
   Use the Akash CLI to review provider bids and accept a bid:
   ```
   provider-services query market lease list --owner <your-wallet-address>
   provider-services tx market lease create --dseq <deployment-sequence> --from <your-wallet-address>
   ```

---

## **Step 3: Verify Deployment**

1. **Check Logs:**
   Use the Akash CLI to view the logs and ensure the services are running:
   ```
   provider-services provider lease-logs --dseq <deployment-sequence> --from <your-wallet-address>
   ```

2. **Access Kafka:**
   Once deployed, Akash will assign an external hostname or IP for your Kafka service. You can retrieve it using:
   ```
   provider-services provider lease-status --dseq <deployment-sequence> --from <your-wallet-address>
   ```

   Use the `KAFKA_ADVERTISED_LISTENERS` address to interact with Kafka clients.

---

## **Step 4: Test the Kafka Deployment**

Install Kafka's CLI tools on your local machine and configure them to interact with the deployed Kafka broker. Example commands:

- **Create a Topic:**
  ```
  kafka-topics.sh --create --topic test-topic --bootstrap-server <AKASH_HOST>:9092
  ```

- **Produce Messages:**
  ```
  kafka-console-producer.sh --topic test-topic --bootstrap-server <AKASH_HOST>:9092
  ```

- **Consume Messages:**
  ```
  kafka-console-consumer.sh --topic test-topic --from-beginning --bootstrap-server <AKASH_HOST>:9092
  ```

---

## **Step 5: Monitor and Scale**

- **Monitor Resource Usage:**
  Regularly monitor the usage of your deployment to ensure sufficient resources are allocated.
  ```
  provider-services provider lease-status --dseq <deployment-sequence>
  ```

- **Scale the Deployment:**
  Modify the `count` value in the SDL file to scale Kafka or Zookeeper instances, then redeploy.

---

This guide provides a straightforward way to deploy Kafka on Akash using the official Docker image. You can further customize the SDL file or Kafka configuration to suit specific needs.
