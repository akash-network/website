---
categories: ["Guides"]
tags: ["Artificial Intelligence/Machine Learning"]
weight: 1
title: "Deploying OpenThinker-32B on Akash"
linkTitle: "OpenThinker-32B"
---

## Introduction

### What is Open Thoughts?
[Open Thoughts](https://huggingface.co/open-thoughts) is an initiative aimed at developing open, accessible AI models for various applications, including natural language understanding, reasoning, and creative generation.

### What is OpenThinker-32B?
[OpenThinker-32B](https://huggingface.co/open-thoughts/OpenThinker-32B) is a 32-billion parameter AI model designed for general-purpose reasoning, natural language generation, and task-specific learning. Its architecture is optimized for high-quality text output and deep contextual understanding.

### Use Cases and Relevance
OpenThinker-32B can be utilized in a variety of domains, including:
- **Conversational AI** – Chatbots, virtual assistants, customer support automation.
- **Content Generation** – Article writing, summarization, creative storytelling.
- **Research & Analysis** – Assisting in technical research, generating reports, and processing large datasets.
- **Code Assistance** – Automated code generation, completion, and debugging.
- **Education & Learning** – Personalized tutoring, interactive educational tools.

With its deployment on **Akash**, a decentralized cloud marketplace, OpenThinker-32B can run efficiently with cost-effective, censorship-resistant infrastructure.

---

## Deployment Guide

### Prerequisites
Ensure you have the following installed on your Linux system:

- [Akash CLI](/docs/getting-started/quickstart-guides/akash-cli/)
- Docker
- `jq`
- `curl`
- `kubectl`
- An Akash wallet with sufficient funds
- A GPU provider on Akash supporting large AI models

### Step 1: Build and Push the Container
We need to create a Docker container for OpenThinker-32B and push it to a registry.

#### 1.1 Clone the Model Repository
```sh
mkdir -p ~/openthinker
cd ~/openthinker
git clone https://huggingface.co/open-thoughts/OpenThinker-32B
```

#### 1.2 Create a Dockerfile
Inside `~/openthinker`, create a `Dockerfile`:

```dockerfile
FROM nvidia/cuda:12.1.1-devel-ubuntu22.04

WORKDIR /app

RUN apt update && apt install -y python3-pip git

COPY OpenThinker-32B /app/OpenThinker-32B

RUN pip3 install torch transformers accelerate

CMD ["python3", "-m", "transformers-cli", "serve"]
```

#### 1.3 Build and Push the Image
Replace `YOUR_DOCKER_USERNAME` with your Docker Hub username:

```sh
docker build -t YOUR_DOCKER_USERNAME/openthinker-32b:latest .
docker push YOUR_DOCKER_USERNAME/openthinker-32b:latest
```

---

### Step 2: Create SDL File for Akash Deployment
Create a file `deploy.yml` with the following content:

```yaml
version: "2.0"
services:
  openthinker:
    image: YOUR_DOCKER_USERNAME/openthinker-32b:latest
    env:
      - HF_HOME=/app/OpenThinker-32B
    expose:
      - port: 5000
        as: 80
        to:
          - global: true
profiles:
  compute:
    openthinker:
      resources:
        cpu:
          units: 8
        memory:
          size: 64Gi
        gpu:
          units: 1
        storage:
          size: 80Gi
  placement:
    dcloud:
      pricing:
        openthinker:
          denom: uakt
          amount: 5000
deployment:
  openthinker:
    dcloud:
      profile: openthinker
      count: 1
```

---

### Step 3: Deploy to Akash

#### 3.1 Fund Your Wallet
Ensure your Akash wallet has funds. If needed, transfer **$AKT** to your address.

#### 3.2 Create and Send the Deployment
```sh
provider-services create deploy.yml --from YOUR_WALLET_NAME --node https://rpc.akash.network:443
```

#### 3.3 Get Deployment Status
```sh
provider-services status --dseq YOUR_DSEQ --from YOUR_WALLET_NAME
```

#### 3.4 Get the Service URL
After successful deployment, obtain the endpoint:
```sh
provider-services lease-status --dseq YOUR_DSEQ --from YOUR_WALLET_NAME | jq -r '.services.openthinker.uri'
```

#### 3.5 Access the Model
Once deployed, you can access OpenThinker-32B via:
```sh
curl -X POST "http://YOUR_DEPLOYMENT_URL/generate" -H "Content-Type: application/json" -d '{"prompt": "Hello, how are you?"}'
```

---

## Conclusion
Deploying **OpenThinker-32B** on **Akash** enables decentralized, cost-efficient AI inferencing with GPU acceleration. By leveraging Akash’s open marketplace, AI developers and businesses can run large-scale models without reliance on centralized cloud providers.

For more details, visit:
- **Akash Documentation**: https://akash.network/docs
- **OpenThinker-32B on Hugging Face**: https://huggingface.co/open-thoughts/OpenThinker-32B
