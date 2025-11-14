---
categories: ["Guides"]
tags: ["AI/ML", ]
weight: 1
title: "FlowiseAI"
linkTitle: "FlowiseAI"
---

## Overview of FlowiseAI

FlowiseAI is an open-source, visual tool designed to enable the creation and deployment of LLM (Large Language Model)-powered chatbots. It allows users to connect LLMs with various data sources, customize workflows, and deploy intelligent conversational agents easily. FlowiseAI is well-liked for its intuitive user interface and compatibility with leading LLMs like OpenAI's GPT, Hugging Face models, and more.

By deploying FlowiseAI on Akash, a decentralized cloud computing platform, you can achieve cost-effective and scalable hosting without relying on centralized cloud providers.

---

## **Deploying FlowiseAI on Akash**

To deploy FlowiseAI on Akash, follow these steps:

---

### **Step 1: Prerequisites**

1. **Install Akash CLI**: Ensure the Akash CLI is installed on your local machine. Consult the [Akash CLI installation guide](/docs/getting-started/quickstart-guides/akash-cli/).

2. **Create an Akash Wallet**: Use the Akash CLI to create a wallet and fund it with AKT tokens.

3. **Set Up the FlowiseAI Docker Image**: FlowiseAI is distributed as a Docker container. The official image is `flowiseai/flowise`.

4. **Prepare the SDL File**: Create a deployment specification (SDL file) to describe your application.

---

### **Step 2: Write the SDL File**

Below is a sample SDL file for deploying FlowiseAI on Akash:

```yaml
version: "2.0"

services:
  flowiseai:
    image: flowiseai/flowise:latest
    expose:
      - port: 3000
        as: 80
        to:
          - global: true

profiles:
  compute:
    flowiseai:
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
        region: us-west
      signedBy:
        anyOf:
          - akash
      pricing:
        flowiseai:
          denom: uakt
          amount: 1000

deployment:
  flowiseai:
    flowiseai:
      profile: flowiseai
      count: 1
```

---

### **Step 3: Deploy the Application**

1. **Validate the SDL File**:
   Run the following command to validate the SDL file:
   ```bash
   provider-services tx deployment create <sdl-file-path> --from <wallet-name> --chain-id <chain-id>
   ```

2. **Check Deployment Status**:
   Use the command below to verify your deployment:
   ```bash
   provider-services query deployment list --owner <wallet-address>
   ```

3. **Bid Selection**:
   Select a provider from the available bids list and accept the bid to finalize your deployment:
   ```bash
   provider-services tx market lease create --from <wallet-name> --chain-id <chain-id> --bid-id <bid-id>
   ```

---

### **Step 4: Access FlowiseAI**

1. After the deployment becomes active, retrieve the access details (e.g., domain or IP address) from the provider's dashboard or the Akash CLI.

2. Open a browser and navigate to the provided URL to access the FlowiseAI interface.

---

### **Step 5: Customize FlowiseAI**

1. **Configure Workflows**:
   Log in to the FlowiseAI interface to set up LLM workflows and connect data sources.

2. **Add Integrations**:
   Integrate with OpenAI, Hugging Face, or other services by configuring API keys in the FlowiseAI dashboard.

3. **Deploy Chatbots**:
   Utilize the platform to deploy and test your chatbot in production settings.

---

## Benefits of Deploying FlowiseAI on Akash

- **Decentralized Hosting**: Minimize reliance on centralized cloud providers.
- **Cost Efficiency**: Benefit from competitive pricing in the Akash marketplace.
- **Scalability**: Easily adjust resources based on demand using the Akash platform.

By following this guide, you can quickly deploy FlowiseAI on Akash and start building powerful LLM-powered chatbots.