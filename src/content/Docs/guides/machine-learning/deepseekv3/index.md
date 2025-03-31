---
categories: ["Guides"]
tags: ["Machine Learning"]
weight: 3
title: "DeepSeek V3"
linkTitle: "DeepSeek V3"
---

# Deploying DeepSeek V3 on Akash

## Introduction

**DeepSeek V3** is an advanced open-source large language model (LLM) developed by **DeepSeek AI**. It provides high-quality natural language processing (NLP) capabilities, making it suitable for tasks such as:

- **Chatbots & Virtual Assistants** – Powering AI-driven conversational agents.
- **Code Generation & Analysis** – Assisting developers in writing, debugging, and optimizing code.
- **Content Creation** – Generating human-like text for articles, reports, and creative writing.
- **Summarization & Translation** – Improving productivity by condensing text or translating languages.

By deploying DeepSeek V3 on **Akash**, we leverage decentralized computing infrastructure to run the model cost-effectively, avoiding reliance on centralized cloud providers.

---

## Prerequisites

Ensure you have the following installed on your **Linux/macOS** system:

- **Docker** ([Installation Guide](https://docs.docker.com/get-docker/))
- **Akash CLI** ([Installation Guide](/docs/getting-started/quickstart-guides/akash-cli/))
- **Provider Services CLI** (Replaces the old `akash` CLI) 
  ```sh
  curl -sSfL https://raw.githubusercontent.com/akash-network/provider-services/main/install.sh | sh
  ```
- **A funded Akash wallet** ([Funding Guide](/docs/deployments/akash-cli/installation/#fund-your-account))

---

## Step 1: Build & Push DeepSeek V3 Docker Image

Clone the **DeepSeek V3** repository and build a Docker container.

```sh
git clone https://github.com/deepseek-ai/DeepSeek-V3.git
cd DeepSeek-V3
```

Modify the `Dockerfile` as needed, then build and push the image:

```sh
docker build -t <your-dockerhub-username>/deepseek-v3 .
docker push <your-dockerhub-username>/deepseek-v3
```

Replace `<your-dockerhub-username>` with your actual Docker Hub username.

---

## Step 2: Prepare the SDL File

Create a file called `deepseek-v3.yaml` with the following **Service Definition Language (SDL)** content:

```yaml
services:
  deepseek-v3:
    image: <your-dockerhub-username>/deepseek-v3:latest
    expose:
      - port: 8000
        as: 80
        to:
          - global: true
profiles:
  compute:
    deepseek-v3:
      resources:
        cpu:
          units: 4
        memory:
          size: 16Gi
        storage:
          size: 50Gi
  placement:
    dcloud:
      attributes:
        region: us-west
      pricing:
        deepseek-v3:
          denom: uakt
          amount: 1000
deployment:
  deepseek-v3:
    dcloud:
      profile: deepseek-v3
      count: 1
```

Modify the `image` field with your **Docker Hub image name**.

---

## Step 3: Deploy on Akash

### 1. Submit Deployment

```sh
provider-services tx deployment create deepseek-v3.yaml --from <your-wallet-name>
```

### 2. Query Deployment Status

```sh
provider-services query deployment list --owner <your-wallet-address>
```

Once a provider accepts the deployment, you can retrieve logs using:

```sh
provider-services query deployment logs --dseq <deployment-sequence-number>
```

### 3. Access DeepSeek V3

Once deployed, you can find your service URL with:

```sh
provider-services query deployment get --dseq <deployment-sequence-number>
```

Navigate to the URL in your browser or use `curl`:

```sh
curl http://<your-service-url>
```

---

## Step 4: Manage & Delete Deployment

### Update Deployment
Modify `deepseek-v3.yaml` and run:

```sh
provider-services tx deployment update deepseek-v3.yaml --from <your-wallet-name>
```

### Close Deployment

```sh
provider-services tx deployment close --dseq <deployment-sequence-number> --from <your-wallet-name>
```

---

## Conclusion

You have successfully deployed DeepSeek V3 on Akash! This setup allows you to run LLM workloads on a decentralized cloud, reducing costs and improving scalability.
