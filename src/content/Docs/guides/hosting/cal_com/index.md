---
categories: ["Guides"]
tags: ["Deployment"]
weight: 1
title: " Guide to Deploying Cal.com on Akash Network"
linkTitle: "Cal.com"
---


This guide walks you through the process of deploying **Cal.com**, an open-source scheduling platform, on **Akash**, a decentralized cloud computing platform. 

---

## **What is Cal.com?**

**Cal.com** is an open-source, self-hosted scheduling solution that helps individuals and businesses manage appointments and bookings. It's a privacy-first alternative to scheduling tools like Calendly, offering full ownership of data. Key features include:

- Integration with various calendar systems (Google Calendar, Outlook, etc.)
- Custom branding and themes
- Group scheduling
- Webhooks for advanced workflows

---

## **Why Deploy on Akash?**

Deploying Cal.com on Akash allows you to:
- Save costs compared to traditional cloud hosting platforms.
- Leverage a decentralized cloud infrastructure.
- Retain full control over your instance of Cal.com.

---

## **Requirements**

1. **Akash CLI**: Installed and configured.
2. **AKT Tokens**: For deployment.
3. **Cal.com Image**: `calcom/cal.com`.
4. **Domain Name**: Optional but recommended for production use.
5. **Akash SDL Template**: A template to define the deployment.

---

## **Steps to Deploy Cal.com on Akash**

### **Step 1: Set Up Akash Environment**

1. Install the Akash CLI:
   ```bash
   curl -sSL https://raw.githubusercontent.com/ovrclk/akash/master/install.sh | sh
   ```

2. Configure your wallet:
   ```bash
   akash keys add <wallet-name>
   ```

3. Fund your wallet with AKT tokens.

4. Initialize the Akash CLI environment:
   ```bash
   akash provider list
   ```

---

### **Step 2: Create SDL File**

The **SDL (Stack Definition Language)** file defines the resources and deployment configuration. Below is a sample SDL file for deploying Cal.com:

```yaml
version: "2.0"

services:
  calcom:
    image: calcom/cal.com
    env:
      DATABASE_URL: <YOUR_DATABASE_URL>
      NEXT_PUBLIC_WEBAPP_URL: http://<YOUR_DOMAIN_OR_IP>
      NEXTAUTH_SECRET: <YOUR_NEXTAUTH_SECRET>
      NEXT_PUBLIC_TELEMETRY_DISABLED: "1"
    expose:
      - port: 3000
        as: 80
        to:
          - global: true

profiles:
  compute:
    calcom:
      resources:
        cpu:
          units: 1
        memory:
          size: 512Mi
        storage:
          size: 1Gi

  placement:
    akash:
      pricing:
        calcom: 
          denom: uakt
          amount: 50

deployment:
  calcom:
    calcom:
      profile: calcom
      count: 1
```

Replace the following placeholders:
- `<YOUR_DATABASE_URL>`: URL of the database where Cal.com will store its data (e.g., PostgreSQL).
- `<YOUR_DOMAIN_OR_IP>`: The domain or IP address where the service will be accessible.
- `<YOUR_NEXTAUTH_SECRET>`: A secret key for authentication.

---

### **Step 3: Deploy to Akash**

1. **Validate the SDL file**:
   ```bash
   akash deployment validate <sdl-file>.yaml
   ```

2. **Create the deployment**:
   ```bash
   akash tx deployment create <sdl-file>.yaml --from <wallet-name> --chain-id <chain-id>
   ```

3. **Bid on providers**:
   Once the deployment is submitted, providers will bid on it. Accept a bid using:
   ```bash
   akash tx market lease create --dseq <deployment-sequence> --from <wallet-name>
   ```

4. **Check Deployment Status**:
   ```bash
   akash deployment status --dseq <deployment-sequence>
   ```

---

### **Step 4: Access the Application**

Once the deployment is active, note the provider's IP or domain in the status output. Use it to access your Cal.com instance.

For production, set up a reverse proxy like **NGINX** and configure SSL certificates using **Let's Encrypt** for HTTPS.

---

## **Optional: Connect Cal.com to PostgreSQL**

To run Cal.com, you need a database. You can deploy PostgreSQL on Akash or use an external database service like **AWS RDS** or **Google Cloud SQL**. Update the `DATABASE_URL` in your SDL file accordingly.

---

## **Troubleshooting**

- **Logs**: Use the Akash CLI to fetch logs for debugging:
  ```bash
  akash deployment logs --dseq <deployment-sequence>
  ```

- **Configuration Issues**: Verify the environment variables and database connectivity.

---

By following this guide, you can deploy and manage your own instance of Cal.com on Akash Network, combining the benefits of decentralized hosting and open-source scheduling.