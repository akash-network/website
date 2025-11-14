---
categories: ["Guides"]
tags: ["Data Analysis"]
weight: 1
title: "Guide to Deploying JupyterHub on Akash"
linkTitle: "JupyterHub"
---



## **What is JupyterHub?**

JupyterHub is a multi-user server for Jupyter notebooks, allowing multiple users to work on their own Jupyter notebooks simultaneously. It provides centralized management and customization for educational, research, or corporate environments, where teams or students need a collaborative platform for data science, machine learning, or development.

With JupyterHub, users can:
- Access notebooks from a web browser.
- Run code in languages like Python, R, and Julia.
- Share resources in a scalable way.

This guide shows how to deploy **JupyterHub** using the `jupyterhub/jupyterhub` Docker image on **Akash**.

---

## **Prerequisites**

1. **Akash CLI or Deployment Tool**: Install and set up Akash CLI on your machine.
2. **Akash Account**: Ensure you have AKT tokens and an active account.
3. **Docker Image**: Use the official Docker image `jupyterhub/jupyterhub`.
4. **Domain and SSL (Optional)**: If deploying for public use, you might want a domain with SSL.

---

## **Deployment Steps**

### 1. **Prepare the SDL File**
The **SDL (Service Definition Language)** file defines how the application will run on Akash. Below is an example SDL file for deploying JupyterHub.

```
version: "2.0"

services:
  jupyterhub:
    image: jupyterhub/jupyterhub:latest
    env:
      - JUPYTERHUB_CRYPT_KEY=some-secret-key   # Replace with a secure key
      - JUPYTERHUB_ADMIN_USER=admin           # Replace with admin username
    expose:
      - port: 8000                            # JupyterHub default port
        as: 80                                # Expose on port 80
        to:
          - global

profiles:
  compute:
    jupyterhub:
      resources:
        cpu:
          units: 1                            # Adjust CPU units
        memory:
          size: 2Gi                           # Set memory size
        storage:
          size: 10Gi                          # Allocate storage

  placement:
    jupyterhub:
      attributes:
        region: us-west                       # Adjust region as needed
      signedBy:
        anyOf:
          - akash

deployment:
  jupyterhub:
    jupyterhub:
      profile: jupyterhub
      count: 1                                # Number of replicas
```

### 2. **Customize the Configuration**
- **JUPYTERHUB_CRYPT_KEY**: Replace with a secure, randomly generated key for encrypting user cookies.
- **JUPYTERHUB_ADMIN_USER**: Set this to your desired admin username.
- **Resources**: Adjust CPU, memory, and storage requirements to match your workload.

### 3. **Deploy to Akash**
Use the Akash CLI to deploy the SDL file.

```
provider-services tx deployment create deploy.yaml --from <your-wallet-name>
```

### 4. **Accept a Bid**
Once a provider bids on your deployment, accept the bid to launch the service:

```
provider-services tx market lease create --dseq <deployment-sequence-number> --from <your-wallet-name>
```

### 5. **Access JupyterHub**
After deployment, obtain the service endpoint by running:

```
provider-services provider lease-status --dseq <deployment-sequence-number> --from <your-wallet-name>
```

The endpoint will look something like `http://<provider-ip>:<port>`. Use this in your browser to access JupyterHub.

---

## **Post-Deployment Configuration**

1. **Add Users**:
   - Use the admin panel or update the `jupyterhub_config.py` file to manage users.
   - Example:
     ```python
     c.Authenticator.allowed_users = {'user1', 'user2'}
     c.Authenticator.admin_users = {'admin'}
     ```

2. **Persistent Storage (Optional)**:
   - Use a persistent storage solution like decentralized storage (e.g., Filecoin, IPFS) or attach volumes.

3. **SSL Configuration**:
   - If running in production, use a reverse proxy like NGINX or Traefik with Let's Encrypt for HTTPS.

4. **Scaling**:
   - To scale the deployment, increase the `count` parameter in the SDL file and redeploy.

---

## **Conclusion**

Deploying JupyterHub on Akash offers an affordable and decentralized way to host multi-user Jupyter notebooks. This setup is especially useful for education, research, and collaborative projects. By leveraging Akash's decentralized cloud infrastructure, you can reduce hosting costs and maintain flexibility.