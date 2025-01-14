---
categories: ["Guides"]
tags: ["Hosting"]
weight: 1
title: "Guide to Creating a Custom Website with Ghost and Deploying to Akash"
linkTitle: "Discourse"
---


## **Overview of Discourse**

**Discourse** is a modern, open-source discussion platform designed to improve online community interactions. Known for its robust features, it combines traditional forum-style discussions with modern tools for engagement. Features include real-time updates, robust moderation tools, extensive customization, and integration capabilities. Discourse is widely used by communities, businesses, and organizations to facilitate meaningful discussions.

### **Key Features:**
1. **Customizable Design:** Flexible theming options for personalized user experiences.
2. **Real-Time Notifications:** Alerts for replies, mentions, and updates.
3. **Trust System:** Automated moderation based on user behavior.
4. **Integration-Friendly:** Seamless integration with services like Slack, WordPress, and more.
5. **Rich API:** Enables advanced automation and integrations.

By deploying Discourse on Akash, you can leverage the decentralized cloud’s cost-effectiveness, scalability, and security to run your discussion forum in a trustless environment.

---

## **Why Deploy Discourse on Akash Network?**

**Akash Network** is a decentralized cloud computing platform, offering affordable and censorship-resistant hosting. Deploying Discourse on Akash enables users to run a secure and scalable community platform while reducing dependency on traditional centralized cloud providers.

**Benefits:**
1. **Cost-Effective:** Save on hosting costs compared to traditional providers.
2. **Scalable:** Dynamically allocate resources to meet traffic demands.
3. **Decentralized:** Resilient against censorship and outages.
4. **Open Source Compatibility:** Easily deploy applications with Docker and Kubernetes support.

---

## **Step-by-Step Deployment Guide**

### **Prerequisites:**
1. **Akash CLI Installed:** Set up the [Akash CLI](https://docs.akash.network/) for managing deployments.
2. **Discourse Requirements:**
   - A domain name with DNS configuration for SSL.
   - Minimum of 2GB RAM and 1 CPU for Discourse.
   - Docker installed in your environment.
3. **Akash Wallet:** Ensure your wallet is funded with $AKT tokens to pay for deployment.

---

### **1. Prepare Discourse Docker Setup**
Discourse requires a Dockerized setup for deployment. Prepare the necessary Docker image and environment variables.

- Use the official Discourse image: `discourse/discourse`.
- Set up the following environment variables in a file (e.g., `.env`):
  ```
  DISCOURSE_HOSTNAME=forum.yourdomain.com
  DISCOURSE_SMTP_ADDRESS=smtp.your-email-provider.com
  DISCOURSE_SMTP_PORT=587
  DISCOURSE_SMTP_USER_NAME=your-email@example.com
  DISCOURSE_SMTP_PASSWORD=your-password
  ```

### **2. Create the Akash Deployment File**
Write an SDL (Service Definition Language) file that describes your deployment. Here’s an example:

```yaml
version: "2.0"

services:
  discourse:
    image: discourse/discourse:latest
    env:
      - DISCOURSE_HOSTNAME=forum.yourdomain.com
      - DISCOURSE_SMTP_ADDRESS=smtp.your-email-provider.com
      - DISCOURSE_SMTP_PORT=587
      - DISCOURSE_SMTP_USER_NAME=your-email@example.com
      - DISCOURSE_SMTP_PASSWORD=your-password
    expose:
      - port: 80
        as: 80
        to:
          - global: true
    resources:
      cpu:
        units: 2
      memory:
        size: 2Gi
      storage:
        size: 20Gi

profiles:
  compute:
    discourse:
      resources:
        cpu:
          units: 2
        memory:
          size: 2Gi
        storage:
          size: 20Gi
  placement:
    akash:
      attributes:
        region: us-west

deployment:
  discourse:
    discourse:
      profile: discourse
      count: 1
```

### **3. Deploy on Akash**
1. **Create a Deployment:**
   - Run the command to create your deployment:
     ```bash
     akash tx deployment create deployment.yaml --from <your_wallet> --chain-id <chain_id> --node <node_url>
     ```
   - Confirm the transaction and note the deployment ID.

2. **Bid on Resources:**
   - Wait for providers to bid on your deployment and accept a bid:
     ```bash
     akash tx market lease create --dseq <deployment_id> --from <your_wallet> --chain-id <chain_id> --node <node_url>
     ```

3. **Access Your Deployment:**
   - Get the external IP address assigned to your Discourse instance. Update your DNS records to point to this IP.

### **4. Set Up SSL**
Use a tool like **Certbot** to generate SSL certificates or integrate Let's Encrypt to secure your Discourse instance. Update your Nginx or Traefik configuration for SSL termination.

### **5. Final Configuration**
- Access your Discourse forum via the browser at `http://forum.yourdomain.com`.
- Follow the setup wizard to complete the configuration.
- Customize your forum with themes, plugins, and settings.

---

## **Maintenance Tips**
- **Monitor Usage:** Regularly monitor resource usage and scale as needed.
- **Backup Data:** Use Akash’s storage features or external storage solutions like Filecoin or S3-compatible storage for regular backups.
- **Update Discourse:** Periodically update the Docker image to stay current with Discourse releases.

---

By following this guide, you can host a robust, scalable, and decentralized Discourse forum on Akash Network, unlocking a new level of cost-efficiency and resilience for your community.