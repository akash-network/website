---
categories: ["Guides"]
tags: ["Cataloging"]
weight: 1
title: "GeoNetwork"
linkTitle: "GeoNetwork"
---


## Introduction to GeoNetwork
GeoNetwork is an open-source cataloging tool designed to manage spatially referenced resources. It provides a robust platform for geospatial metadata management, enabling organizations to share, find, and use spatial data. Key features include:

- **Metadata Management:** Create, edit, and manage geospatial metadata.
- **Data Discovery:** Search and access spatial datasets via an intuitive interface.
- **Interoperability:** Supports OGC standards such as CSW, WMS, WFS, and WCS.
- **Integration:** Seamless integration with GIS platforms and web services.

GeoNetwork is widely used by governments, research institutions, and organizations that need to catalog and disseminate spatial data.

---

## Deployment on Akash

### Step 1: Prerequisites
1. **Akash Account and Wallet:** Ensure you have an Akash account and wallet set up with sufficient AKT tokens.
2. **Akash CLI:** Install and configure the Akash CLI tool on your machine.
3. **GeoNetwork Docker Image:** Use the official GeoNetwork Docker image from Docker Hub (`geonetwork:latest`).

---

### Step 2: Create a Deployment SDL File
The SDL (Service Definition Language) file defines the deployment. Here's a sample SDL file for GeoNetwork:

```
version: "2.0"

services:
  geonetwork:
    image: geonetwork:latest
    expose:
      - port: 8080
        as: 80
        to:
          - global
    env:
      - JAVA_OPTS=-Xms512m -Xmx1024m
    resources:
      cpu:
        units: 0.5
      memory:
        size: 1Gi
      storage:
        size: 5Gi

profiles:
  compute:
    geonetwork:
      resources:
        cpu:
          units: 0.5
        memory:
          size: 1Gi
        storage:
          size: 5Gi
  placement:
    global:
      attributes:
        region: us-west

deployment:
  geonetwork:
    geonetwork:
      profile: geonetwork
      count: 1
```

### Explanation of the SDL File:
- **Services Section:** Specifies the GeoNetwork Docker image and exposes port `8080`.
- **Environment Variables:** Configures the JVM options (`JAVA_OPTS`) for GeoNetwork.
- **Resources:** Allocates 0.5 CPU, 1 GiB of memory, and 5 GiB of storage.
- **Placement:** Specifies the preferred region for deployment.

---

### Step 3: Deploy on Akash
1. **Initialize Deployment:**
   Use the Akash CLI to create and deploy the configuration:
   ```
   provider-services tx deployment create deploy.yaml --from <wallet_name>
   ```

2. **View Deployment Status:**
   Check the status of your deployment:
   ```
   provider-services query deployment list --owner <your_wallet_address>
   ```

3. **Accept a Lease:**
   Once your deployment is created, accept a provider's lease:
   ```
   provider-services tx market lease create --dseq <deployment_sequence> --from <wallet_name>
   ```

---

### Step 4: Access GeoNetwork
After the deployment is live, access GeoNetwork via the external IP provided by the Akash provider. You can use a browser to navigate to:

```
http://<external_ip>
```

---

### Step 5: Configure GeoNetwork
1. **Login:** The default admin credentials are:
   - Username: `admin`
   - Password: `admin`
2. **Start Cataloging:**
   - Create new metadata records or upload existing ones.
   - Configure GeoNetwork to interact with your GIS or data storage solutions.

---

### Step 6: Monitor and Update
- **Logs:** View logs to troubleshoot any issues:
  ```
  docker logs <container_id>
  ```
- **Updates:** To update GeoNetwork, redeploy with the latest Docker image.

---

## Conclusion
Deploying GeoNetwork on Akash provides a decentralized, cost-efficient way to manage and share geospatial data. By leveraging Akash's decentralized cloud, you can ensure scalability and resilience for your geospatial cataloging needs.