---
categories: ["Guides"]
tags: ["Machine Learning"]
weight: 1
title: "Deploying Mistral 7B on Akash"
linkTitle: "Mistral 7B"
---

To deploy the Mistral 7B model on Akash, you can follow the instructions below.

## SDL File for Mistral 7B Model Deployment on Akash

Use the `SDL` file below:

```
version: "2.0"

services:
  mistral-service:
    image: ghcr.io/mistralai/mistral-src/vllm:latest
    expose:
      - port: 8000
        as: 80
        to:
          - global: true
        accept:
          - tcp
    args:
      - "--host=0.0.0.0"
      - "--model=mistralai/Mistral-7B-Instruct-v0.2"
      - "--tensor-parallel-size=1"
      - "--gpus=all"
    resources:
      cpu:
        units: 1.0
      memory:
        size: 16Gi 
      storage:
        size: 100Gi
      gpus:
        units: 1  # Set this according to your GPU requirement

profiles:
  compute:
    mistral-profile:
      resources:
        cpu:
          units: 1.0
        memory:
          size: 16Gi
        storage:
          size: 100Gi
        gpus:
          units: 1  # Set this according to your GPU requirement

  placement:
    mistral-placement:
      attributes:
        region: us-west  # Specify region based on available providers with GPU support

deployment:
  mistral-deployment:
    mistral-profile:
      - mistral-placement
```

## Deployment Guide

### 1. Akash CLI Guide 

**Prerequisites**:
- Make sure you have the [Akash CLI](/docs/getting-started/quickstart-guides/akash-cli/) installed and configured.

**Steps**:
1. **Initialize the SDL file**: Save the mistral_7b_akash_deployment.yaml file in your working directory.
2. **Submit the Deployment**: Use the Akash CLI to deploy the file to Akash.
```
provider-services tx deployment create --from <your_akash_key> --node <akash_node> --dseq <deployment_sequence_number> --sdl mistral_7b_akash_deployment.yaml --fees <fees_in_akt>
```

Replace <your_akash_key>, <akash_node>, <deployment_sequence_number>, and <fees_in_akt> with your specific values.

3. **Wait for Lease Creation**: After deployment creation, wait for the provider to bid on your deployment and create a lease.

4. **Service Validation**: Once the lease is active, find the assigned IP for the service:
```
provider-services provider lease-status --dseq <deployment_sequence_number> --from <your_akash_key>
```

5. **Access the Service**: You should be able to access the Mistral 7B model at http://<provider-ip>:80.

### 2. Akash Console Guide

**Prerequisites**:

- Access to the [Akash Console](https://console.akash.network/).

**Steps**:

1. **Login to the Akash Console**: Navigate to the Akash Console and log in using your wallet.

2. **Create a New Deployment**:

- Click on "Create Deployment".
- Upload the mistral_7b_akash_deployment.yaml file or paste its contents directly into the SDL editor.
- Click on "Next" to proceed.

3. **Select Pricing and Finalize**:

- Choose a provider with GPU support that meets the SDL requirements.
- Confirm your payment settings and finalize the deployment.

4. **Deployment Validation**:

- Once your deployment is active, check the "Lease" tab for the IP address.
- Click on the IP to access the Mistral 7B model endpoint directly.

These instructions should guide you through deploying the Mistral 7B model on Akash using both the Akash CLI and Console.