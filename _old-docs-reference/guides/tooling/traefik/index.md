---
categories: ["Guides"]
tags: ["Proxy", "API"]
weight: 1
title: "Traefik"
linkTitle: "Traefik"
---

### **Quick Overview of Traefik**

**Traefik** is a modern reverse proxy and load balancer designed to handle dynamic environments, such as containerized applications. It's popular for its simplicity and features like automatic SSL, seamless integration with container orchestrators (Docker, Kubernetes, etc.), and dynamic configuration. Traefik is often used as an edge router for microservices, acting as the gateway between external requests and internal services.

---

### **Guide to Deploy Traefik on Akash**

This guide covers deploying Traefik on the **Akash Network**, a decentralized cloud platform. The `traefik` Docker image will be used, and we will configure it to expose services dynamically.

---

#### **Prerequisites**

1. **Akash CLI**: Installed and configured on your system.
2. **Akash Account**: Funded with AKT tokens.
3. **Docker Compose YAML or equivalent**: A basic setup to test Traefik routing.
4. **Domain**: (Optional) If you want to configure automatic SSL.

---

#### **Steps to Deploy Traefik**

##### **1. Define the Deployment (SDL File)**

Create a file named `deploy.yaml`. Below is an example SDL template for deploying Traefik:

```
version: "2.0"

services:
  traefik:
    image: traefik
    expose:
      - port: 80
        to:
          - global: true
      - port: 443
        to:
          - global: true
    env:
      - TRAEFIK_PROVIDERS_DOCKER=true
      - TRAEFIK_API_INSECURE=true
      - TRAEFIK_ENTRYPOINTS_WEB_ADDRESS=:80
      - TRAEFIK_ENTRYPOINTS_WEBSECURE_ADDRESS=:443
    args:
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--providers.docker"
      - "--api.insecure=true"
      - "--certificatesresolvers.myresolver.acme.tlschallenge=true"
      - "--certificatesresolvers.myresolver.acme.email=<your-email>"
      - "--certificatesresolvers.myresolver.acme.storage=/letsencrypt/acme.json"
    volumes:
      - size: 2Gi
        mount: /letsencrypt

profiles:
  compute:
    traefik:
      resources:
        cpu:
          units: 0.5
        memory:
          size: 512Mi
        storage:
          size: 2Gi

deployment:
  traefik:
    traefik:
      profile: traefik
      count: 1
```

---

##### **2. Deploy on Akash**

1. **Initialize Deployment**:
   Run the following command to create a deployment:
   ```
   provider-services tx deployment create deploy.yaml --from <your-wallet> --node https://rpc.akashnet.io --chain-id akashnet-2
   ```

2. **View Lease Information**:
   After successful deployment, query the lease to get the deployment's details:
   ```
   provider-services query deployment list --owner <your-address> --state active
   ```

3. **Expose Traefik's Public Endpoint**:
   Use the lease information to query the provider and fetch the public endpoint (IP or domain):
   ```
   provider-services provider lease-status --node <provider-node> --chain-id akashnet-2
   ```

---

##### **3. Test the Deployment**

1. Open the public endpoint in a browser or use `curl`:
   ```
   curl http://<public-ip>
   ```

2. If you enabled the insecure API, you can visit the Traefik dashboard at:
   ```
   http://<public-ip>:8080/dashboard/
   ```

---

##### **4. Add Services to Route Through Traefik**

1. Ensure your services are exposed to the Traefik instance, and they publish metadata that Traefik can read. This can be done with labels (if using Docker) or through additional configurations.

2. Update the `traefik` container’s configuration to recognize your services using its provider configuration.

---

#### **Customizations**

- **SSL/TLS**: Add your email and domain in the `certificatesresolvers.myresolver.acme` fields to configure Let's Encrypt for HTTPS.
- **Scaling**: Update the `count` in the `deployment` section to scale the number of Traefik instances.

