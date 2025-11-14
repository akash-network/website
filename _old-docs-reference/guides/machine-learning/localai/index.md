---
categories: ["Guides"]
tags: ["Machine Learning","LLMs"]
weight: 1
title: "Guide to Deploying **LocalAI** on Akash"
linkTitle: "LocalAI"
---

**LocalAI** is an open-source, self-hosted alternative to OpenAI's APIs, providing users with the capability to run LLMs (Large Language Models) locally without relying on external services. It is a lightweight solution designed for privacy-focused deployments, allowing developers to leverage AI features for applications, chatbots, and more without the cost or latency of cloud-based solutions. LocalAI is compatible with various LLMs such as GPT models and can be tailored to fit specific application needs.

---

## Key Features of LocalAI
1. **Privacy**: LocalAI processes all data locally, ensuring sensitive data doesn't leave your infrastructure.
2. **Cost-Effective**: Avoid expensive API fees from cloud providers.
3. **Flexibility**: Supports multiple model formats, making it easy to fine-tune for specific use cases.
4. **Open Source**: Customizable and transparent.

---

## Why Deploy LocalAI on Akash?
**Akash** is a decentralized cloud computing platform where developers can deploy applications at a fraction of the cost compared to traditional providers. By deploying LocalAI on Akash, you combine the privacy and flexibility of LocalAI with the decentralized, cost-effective infrastructure of Akash.

---

## Step-by-Step Deployment Guide

### Prerequisites
1. **Akash Account**: Create an account on [Akash Network](https://akash.network/) and set up your wallet.
2. **Akash CLI**: Install the Akash CLI for managing deployments.
3. **SDL File**: Use the sample SDL file provided below or modify it based on your requirements.
4. **Docker Knowledge**: Familiarity with containerized applications.
5. **LocalAI Image**: Access to the LocalAI Docker image (e.g., `localai/localai:latest`).

---

## Sample SDL File for LocalAI Deployment
The following SDL file is a template for deploying LocalAI on Akash:

```yaml
version: "2.0"

services:
  localai:
    image: localai/localai:latest
    env:
      - MODEL_PATH=/models
    expose:
      - port: 8080
        as: 80
        to:
          - global: true
    resources:
      cpu:
        units: 1000m
      memory:
        size: 2Gi
      storage:
        size: 10Gi
    args:
      - "serve"
      - "--host"
      - "0.0.0.0"
      - "--port"
      - "8080"

profiles:
  compute:
    localai:
      resources:
        cpu:
          units: 1000m
        memory:
          size: 2Gi
        storage:
          size: 10Gi
  placement:
    akash:
      attributes:
        host: akash
      signedBy:
        anyOf:
          - "akash1..."
      pricing:
        localai:
          denom: uakt
          amount: 100

deployment:
  localai:
    akash:
      profile: localai
      count: 1
```

---

## Steps to Deploy

### 1. **Set Up Akash CLI**
- Install the Akash CLI from the [Akash documentation](/docs/deployments/akash-cli/overview/).
- Configure your wallet and ensure sufficient funds for deployment.

### 2. **Prepare the SDL File**
- Save the above SDL file as `deploy.yaml`.
- Adjust resources (CPU, memory, and storage) and pricing as necessary for your application needs.

### 3. **Validate the SDL File**
Run the following command to validate your SDL file:
```bash
provider-services tx deployment create deploy.yaml --from <wallet-name> --chain-id <chain-id> --node <rpc-node>
```

### 4. **Create the Deployment**
Submit your deployment request:
```bash
provider-services tx deployment create deploy.yaml --from <wallet-name>
```

### 5. **Monitor the Deployment**
Check the status of your deployment using:
```bash
provider-services query deployment list --owner <wallet-address>
```

### 6. **Access the Application**
- After the deployment is complete, the LocalAI API will be accessible at the exposed endpoint. 
- If you’ve made the service global in the SDL file, use the assigned domain or IP to interact with the LocalAI API.

### 7. **Upload Your Models**
- Use Akash's persistent storage to upload your AI models to `/models` as defined in the `MODEL_PATH` environment variable.

---

## Post-Deployment Configuration
1. **Test the API**: 
   - Use tools like `curl` or Postman to send requests to your LocalAI API.
   - Example:
     ```bash
     curl -X POST http://<your-akash-endpoint>/api/v1/chat -d '{"message": "Hello AI"}'
     ```

2. **Scale Your Deployment**: Modify the `count` parameter in the deployment profile to increase the number of LocalAI instances.

3. **Optimize Resources**: Based on usage, tweak CPU, memory, and storage allocations in the SDL file.

---

## Conclusion
By deploying **LocalAI** on **Akash**, you gain access to a secure, cost-effective, and scalable environment for running AI models. This deployment is ideal for developers and organizations looking for an affordable and private AI solution.

For further customization and advanced deployment options, refer to the [LocalAI GitHub repository](https://github.com/localAI) and [Akash Network documentation](https://akash.network/docs).