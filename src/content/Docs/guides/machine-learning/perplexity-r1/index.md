---
categories: ["Guides"]
tags: ["Artificial Intelligence/Machine Learning"]
weight: 1
title: "Deploying Perplexity R1 1776 on Akash"
linkTitle: "Perplexity R1 1776"
---

## Introduction to Perplexity and R1 1776

Perplexity AI is an advanced AI-powered search and knowledge system designed to provide direct and detailed responses to user queries. It is known for its real-time data retrieval, summarization, and contextual awareness.

### What is Perplexity R1 1776?

[Perplexity R1 1776](https://huggingface.co/perplexity-ai/r1-1776) is a machine learning model built for high-quality text generation, capable of reasoning, summarization, and information retrieval. It has applications in AI-driven assistants, automated customer support, research synthesis, and more.

### Why Deploy on Akash?

Akash Network is a decentralized cloud computing marketplace that enables permissionless and cost-effective deployment of containerized applications. Deploying Perplexity R1 1776 on Akash provides:
- **Decentralization**: Avoid reliance on centralized cloud providers.
- **Cost-effectiveness**: Lower deployment costs compared to traditional cloud providers.
- **Scalability**: Easily scale resources as needed.

## Prerequisites

Ensure you have the following installed on your *nix system:
- [Akash CLI](https://github.com/akash-network/node) (`akash` binary)
- [Docker](https://docs.docker.com/get-docker/)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- [Helm](https://helm.sh/docs/intro/install/)

## Step 1: Build and Push the Perplexity R1 1776 Container

First, create a Docker container for the **Perplexity R1 1776** model:

```bash
# Clone the repository or pull the model
git clone https://huggingface.co/perplexity-ai/r1-1776
cd r1-1776

# Create a Dockerfile
cat <<EOF > Dockerfile
FROM python:3.9
RUN pip install torch transformers
COPY . /app
WORKDIR /app
CMD ["python", "app.py"]
EOF

# Build the Docker image
DOCKER_IMAGE="your-dockerhub-username/perplexity-r1-1776:latest"
docker build -t $DOCKER_IMAGE .

# Push to Docker Hub
docker login

docker push $DOCKER_IMAGE
```

## Step 2: Create the Akash Deployment File (SDL)

Save the following **SDL (Stack Definition Language) file** as `deploy.yml`:

```yaml
version: "2.0"
services:
  perplexity:
    image: your-dockerhub-username/perplexity-r1-1776:latest
    expose:
      - port: 8000
        as: 80
        to:
          - global: true
profiles:
  compute:
    perplexity:
      resources:
        cpu: 2
        memory: 4Gi
        storage: 10Gi
  placement:
    dcloud:
      pricing:
        perplexity:
          denom: uakt
          amount: 10000
deployment:
  perplexity:
    dcloud:
      profile: perplexity
      count: 1
```

Modify the `image` field in `deploy.yml` with your actual Docker Hub repository and tag.

## Step 3: Deploy on Akash

### 3.1 Fund Your Akash Wallet
Ensure your Akash wallet has enough AKT tokens to deploy.

```bash
provider-services wallet balance
```

If needed, fund your wallet through [an exchange](https://akash.network/token/).

### 3.2 Deploy Using Provider Services

#### 3.2.1 Create an Order
```bash 
provider-services bid submit deploy.yml
```

#### 3.2.2 View Your Deployment Status
```bash 
provider-services lease status --dseq <deployment-sequence>
```

#### 3.2.3 View Assigned Provider Information
```bash 
provider-services lease list
```

#### 3.2.4 Get Your Deployment URL
```bash 
provider-services lease logs --dseq <deployment-sequence>
```
Once the logs confirm that your application is running, navigate to the assigned provider URL.

## Step 4: Verify and Use the Model

After deployment, open a browser and access the **Perplexity R1 1776** endpoint:
```bash
curl http://<your-provider-url>/predict -X POST -d '{"query": "What is Akash Network?"}'
```

## Conclusion

You have successfully deployed **Perplexity R1 1776** on **Akash**! This setup enables you to leverage the model's capabilities in a decentralized, cost-effective manner. You can scale it further by adjusting resource allocations in the SDL file.

For troubleshooting, check:
- `provider-services lease logs --dseq <deployment-sequence>` for deployment logs.
- The [Akash documentation](https://akash.network/docs) for further configurations.

Happy Deploying!
