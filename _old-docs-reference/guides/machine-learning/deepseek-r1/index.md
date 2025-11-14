---
categories: ["Guides"]
tags: ["AI/ML", "Training", "Framework"]
weight: 1
title: "Deploying DeepSeek R1 on Akash"
linkTitle: "DeepSeek R1"
---


## Introduction

[DeepSeek R1](https://github.com/deepseek-ai/DeepSeek-R1) is a powerful, open-source AI model designed for natural language processing tasks such as text generation, summarization, and interactive chat applications. It provides state-of-the-art performance, making it a viable alternative to proprietary models. By deploying DeepSeek R1 on the decentralized cloud provider Akash, users can harness its capabilities in a cost-effective, censorship-resistant, and scalable manner.

## Use Cases
- **Chatbots and Virtual Assistants**: Implement intelligent conversational agents for customer support or personal assistance.
- **Text Summarization**: Generate concise summaries from large documents.
- **Code Completion**: Provide AI-powered suggestions for coding and development environments.
- **Content Generation**: Create high-quality AI-generated articles, stories, and reports.

## Deployment Guide
This guide walks through the process of containerizing DeepSeek R1 and deploying it on Akash.

### Prerequisites
Ensure you have the following installed:
- Docker
- Akash CLI
- A funded Akash wallet

### Step 1: Build the DeepSeek R1 Container
First, clone the repository and build a Docker container for DeepSeek R1:
```sh
# Clone the repository
git clone https://github.com/deepseek-ai/DeepSeek-R1.git
cd DeepSeek-R1

# Build the Docker container
docker build -t deepseek-r1 .

# Optionally, test locally
docker run -p 8000:8000 deepseek-r1
```

### Step 2: Push the Container to a Registry
Tag and push your container to a public registry like Docker Hub or GHCR:
```sh
# Tag the image
docker tag deepseek-r1 your-dockerhub-username/deepseek-r1:latest

# Push to registry
docker push your-dockerhub-username/deepseek-r1:latest
```

### Step 3: Create an Akash SDL (Stack Definition Language) File
Save the following as `deploy.yml`:
```yaml
version: "2.0"
services:
  deepseek:
    image: your-dockerhub-username/deepseek-r1:latest
    env:
      - MODEL_PATH=/models
    expose:
      - port: 8000
        as: 80
        to:
          - global: true
profiles:
  compute:
    deepseek:
      resources:
        cpu:
          units: 4
        memory:
          size: 8Gi
        storage:
          size: 50Gi
  placement:
    west-coast:
      pricing:
        deepseek:
          denom: uakt
          amount: 1000
deployment:
  deepseek:
    west-coast:
      profile: deepseek
      count: 1
```

### Step 4: Deploy on Akash
1. Fund your wallet with `uakt`.
2. Create a deployment:
   ```sh
   provider-services tx deployment create deploy.yml --from <your-wallet> --node https://rpc.akash.network:443 --gas auto --gas-adjustment 1.5
   ```
3. Get the deployment status:
   ```sh
   provider-services query deployment list --owner <your-wallet>
   ```
4. Find available providers:
   ```sh
   provider-services query provider list
   ```
5. Lease the deployment:
   ```sh
   provider-services tx market lease create --from <your-wallet> --dseq <deployment-sequence-id> --oseq 1 --gseq 1 --provider <provider-address>
   ```
6. Get service logs:
   ```sh
   provider-services query lease logs --owner <your-wallet> --provider <provider-address> --dseq <deployment-sequence-id>
   ```
7. Access the running instance:
   ```sh
   curl http://<deployment-url>/
   ```

### Step 5: Verify and Monitor Deployment
- Monitor logs: `provider-services query lease logs`
- Query active deployments: `provider-services query deployment list --owner <your-wallet>`

## Conclusion
You have successfully deployed DeepSeek R1 on Akash! This setup allows you to run AI-powered applications in a decentralized and scalable way while leveraging the cost benefits of Akash’s infrastructure.
