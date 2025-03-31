---
categories: ["Guides"]
tags: ["Numerical Computation"]
weight: 1
title: "Guide to Deploy MATLAB on Akash"
linkTitle: "MATLAB"
---



The Akash Network provides a decentralized cloud platform where you can deploy containerized applications. This guide will walk you through deploying MATLAB on Akash using the official MathWorks MATLAB Docker image.

---

## Prerequisites

1. **MATLAB License**:
   - MATLAB requires a valid license. You will need your license server information or network license key for deployment.

2. **Akash CLI Setup**:
   - Install and configure the [Akash CLI](/docs/deployments/akash-cli/overview/).
   - Fund your Akash wallet with AKT tokens for deployment.

3. **Docker Knowledge**:
   - Familiarity with Docker containers is recommended.

4. **Access to MATLAB Docker Image**:
   - MathWorks provides the MATLAB Docker image on [Docker Hub](https://hub.docker.com/r/mathworks/matlab).
   - You need Docker Hub credentials to access the image.

---

## Step 1: Pull the MATLAB Docker Image

1. Log in to Docker Hub with your credentials:
   ```
   docker login
   ```

2. Pull the MATLAB Docker image:
   ```
   docker pull mathworks/matlab:latest
   ```

---

## Step 2: Prepare the SDL File for Akash Deployment

1. Create an SDL file (`deploy.yml`) for MATLAB. Use the following template:

   ````
   version: "2.0"

   services:
     matlab:
       image: mathworks/matlab:latest
       args:
         - --licenseserver <LICENSE_SERVER_HOST>:<LICENSE_SERVER_PORT>
       env:
         - MATHWORKS_LICENSE_FILE=<LICENSE_SERVER_HOST>:<LICENSE_SERVER_PORT>
       expose:
         - port: 8888
           as: 8888
           to:
             - global
       resources:
         cpu:
           units: 500
         memory:
           size: 512Mi
         storage:
           size: 1Gi

   profiles:
     compute:
       matlab:
         resources:
           cpu:
             units: 500
           memory:
             size: 512Mi
           storage:
             size: 1Gi

   deployment:
     matlab:
       matlab:
         profile: matlab
         count: 1
   ```

   - Replace `<LICENSE_SERVER_HOST>` and `<LICENSE_SERVER_PORT>` with your MATLAB license server details.

---

## Step 3: Deploy to Akash

1. **Create a Deployment**:
   - Submit your SDL file to Akash:
     ```
     provider-services tx deployment create deploy.yml --from <your_account>
     ```

2. **Find a Provider**:
   - Query for providers willing to host your deployment:
     ```
     provider-services query market bid list --owner <your_account>
     ```

3. **Accept a Lease**:
   - Accept a lease from a provider:
     ```
     provider-services tx market lease create --from <your_account> --dseq <deployment_sequence>
     ```

4. **Access Your Deployment**:
   - Get the public endpoint of your deployment:
     ```
     provider-services query market lease get --dseq <deployment_sequence>
     ```

   - Use the endpoint to access your MATLAB application.

---

## Step 4: Verify MATLAB Deployment

1. Open a browser and navigate to the public endpoint (e.g., `http://<endpoint>:8888`).
2. Verify that MATLAB is running and functional.

---

## Step 5: Monitor and Manage Deployment

- Use the Akash CLI to check logs and manage your deployment:
  ```
  provider-services logs --dseq <deployment_sequence> --from <your_account>
  ```

- If you need to update or terminate the deployment:
  ```
  provider-services tx deployment close --dseq <deployment_sequence> --from <your_account>
  ```

---

## Notes

- **Firewall Configuration**:
  Ensure the port `8888` is accessible globally or restrict it based on your needs.

- **MATLAB Licensing**:
  MATLAB requires a valid license at runtime. The deployment will fail if the license is invalid or inaccessible.

- **Resource Optimization**:
  Adjust CPU, memory, and storage in the `resources` section of the SDL file based on your workload.

---

This guide provides a basic setup to deploy MATLAB on Akash. Depending on your specific use case, you can further customize the deployment by modifying the SDL file or integrating additional services.