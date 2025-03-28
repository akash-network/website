---
categories: ["Guides"]
tags: ["Data Analysis"]
weight: 1
title: "JATOS"
linkTitle: "JATOS"
---


Here’s a guide to deploying JATOS on Akash using the `jatos/jatos` Docker image.

---

## **What is JATOS?**
JATOS (Just Another Tool for Online Studies) is an open-source software designed to run online studies, often used in psychology, social sciences, and behavioral research.

---

## **Prerequisites**
1. **Akash Account**: Ensure you have an Akash account and wallet set up.
2. **AKT Tokens**: Sufficient tokens for deployment.
3. **Akash CLI**: Installed and configured.
4. **Akash SDL Template**: A customizable SDL file for deploying the `jatos/jatos` image.
5. **Docker Image**: `jatos/jatos` is the official Docker image for JATOS.
6. **Domain/Static IP**: Optional, but helpful if you want to expose the JATOS instance publicly.

---

## **Steps to Deploy JATOS on Akash**

### 1. **Prepare Your Akash SDL File**
Create an SDL file (`deploy.yaml`) that defines your JATOS deployment. Below is an example configuration:

```
---
version: "2.0"

services:
  jatos:
    image: jatos/jatos
    env:
      - JATOS_IP=0.0.0.0
      - JATOS_PORT=80
    expose:
      - port: 80
        as: 80
        to:
          - global
        accept: [ "http" ]
    resources:
      cpu:
        units: 1
      memory:
        size: 512Mi
      storage:
        size: 1Gi

profiles:
  compute:
    jatos:
      resources:
        cpu:
          units: 1
        memory:
          size: 512Mi
        storage:
          size: 1Gi

  placement:
    westcoast:
      attributes:
        region: us-west
      signedBy:
        anyOf:
          - akash1abcdefghijklmnopqrstu # Replace with the provider's public key
      pricing:
        jatos:
          denom: uakt
          amount: 100

deployment:
  jatos:
    westcoast:
      profile: jatos
      count: 1
```

---

### 2. **Configure JATOS**
Update the following variables in the SDL file if needed:

- **Environment Variables**:
  - `JATOS_IP`: Set to `0.0.0.0` to listen on all interfaces.
  - `JATOS_PORT`: Set the port JATOS will run on.
  - Add more environment variables if needed (e.g., `DB_HOST`, `DB_PORT` for an external database).

---

### 3. **Deploy to Akash**
1. **Validate SDL File**: Use the Akash CLI to validate your SDL file.
   ```
   provider-services tx deployment create deploy.yaml --from <wallet-name>
   ```
2. **Query Deployment**: Check the status of your deployment.
   ```
   provider-services query market lease list --owner <your-address>
   ```
3. **Accept a Bid**: Once a provider submits a bid, accept it.

---

### 4. **Access JATOS**
- Once deployed, JATOS will be accessible via the endpoint provided by the Akash provider.
- You can access the application by navigating to `http://<akash-provider-ip>:<port>` in your browser.

---

### 5. **Persisting Data**
To ensure persistent data storage:
- Use Akash’s persistent storage options (modify the SDL file under `storage`).
- Alternatively, connect JATOS to an external database like MySQL or PostgreSQL. Update the environment variables in the SDL file to point to the database.

---

## **Post-Deployment Tasks**
1. **Secure JATOS**:
   - Use HTTPS for secure communication. Consider using a reverse proxy (e.g., Traefik or NGINX) with SSL certificates.
2. **Monitor Resource Usage**:
   - Adjust the CPU and memory limits in the SDL file as per your workload.
3. **Scaling**:
   - If needed, you can scale JATOS instances by increasing the `count` value in the deployment section of the SDL file.

---

## **Troubleshooting**
1. **Deployment Fails**:
   - Ensure the Akash provider supports the required resources.
   - Check for errors in the deployment logs.

2. **JATOS Not Accessible**:
   - Verify that the `expose` section in the SDL file is correctly configured.
   - Ensure the provider has opened the necessary ports.

3. **Database Issues**:
   - Confirm that the database is accessible from the Akash deployment.
   - Double-check the database credentials in the environment variables.

---

## **Useful Links**
- [Akash CLI Documentation](/docs/getting-started/quickstart-guides/akash-cli/)
- [JATOS Official Docker Image](https://hub.docker.com/r/jatos/jatos)
- [JATOS Documentation](https://www.jatos.org/)

By following this guide, you should be able to deploy JATOS on Akash and run your online studies effectively. 