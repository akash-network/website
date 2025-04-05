---
categories: ["Guides"]
tags: ["Machine Learning"]
weight: 1
title: "PyTorch"
linkTitle: "PyTorch"
---

Akash Network is a decentralized cloud platform that enables developers to deploy containerized applications, including machine learning frameworks like PyTorch. This guide will help you deploy PyTorch on Akash using its official Docker image.

---

## **Prerequisites**

1. **Akash CLI Installed**: Ensure the Akash CLI is installed and configured. Follow the [official guide](/docs/getting-started/quickstart-guides/akash-cli/) for installation.
2. **Akash Wallet**: Fund your wallet with AKT tokens for deployment.
3. **Docker Knowledge**: Basic understanding of Docker and containerization.
4. **SDL Template**: Akash uses SDL files for defining deployments.
5. **PyTorch Docker Image**: Use the official [PyTorch Docker image](https://hub.docker.com/r/pytorch/pytorch).

---

## **Step 1: Define Your SDL File**

Create an SDL file (`deploy.yaml`) for your deployment. Here's an example configuration:

```
---
version: "2.0"

services:
  pytorch:
    image: pytorch/pytorch:latest # Replace with the desired PyTorch tag
    args:
      - "bash"  # Start a bash shell for interaction
    env:
      - TZ=UTC  # Set timezone (optional)
    expose:
      - port: 8888  # Port for Jupyter Notebook or API access
        as: 8888
        to:
          - global
    resources:
      cpu:
        units: 2.0  # Adjust CPU units
      memory:
        size: 4Gi  # Adjust memory size
      storage:
        size: 10Gi  # Adjust storage size

profiles:
  compute:
    pytorch:
      match:
        - "provider=akash"
      resources:
        cpu:
          units: 2.0
        memory:
          size: 4Gi
        storage:
          size: 10Gi
  placement:
    westcoast:
      attributes:
        region: us-west
      pricing:
        pytorch:
          denom: uakt
          amount: 5000  # Adjust based on your budget

deployment:
  pytorch_deployment:
    westcoast:
      profile: pytorch
      count: 1
```

---

## **Step 2: Deploy on Akash**

1. **Initialize Deployment**:

   ```
   provider-services tx deployment create deploy.yaml --from <your-wallet> --node <node-address> --chain-id <chain-id>
   ```

   Replace `<your-wallet>`, `<node-address>`, and `<chain-id>` with your Akash configuration.

2. **Bid for Resources**:
   Once the deployment is created, providers will bid to host it. Run the following command to view the bids:

   ```
   provider-services query market bid list --owner <your-wallet>
   ```

3. **Lease Selection**:
   Accept a bid to create a lease:

   ```
   provider-services tx market lease create --dseq <deployment-sequence> --gseq 1 --oseq 1 --from <your-wallet>
   ```

4. **Check Deployment Status**:
   After creating the lease, check the status of your deployment:
   ```
   provider-services  query deployment get --owner <your-wallet> --dseq <deployment-sequence>
   ```

---

## **Step 3: Access Your PyTorch Deployment**

1. **Retrieve Deployment Details**:
   Obtain the external IP and port assigned to your deployment:

   ```
   provider-services provider lease-status --dseq <deployment-sequence> --from <your-wallet>
   ```

2. **Connect to the Service**:
   - If running a Jupyter Notebook, open a browser and navigate to `http://<external-ip>:8888`.
   - If exposing a REST API or serving a model, use the appropriate endpoint.

---

## **Step 4: Verify PyTorch**

1. SSH into the container:

   ```
   ssh -p <port> root@<external-ip>
   ```

   (Use the credentials provided by the provider.)

2. Start a Python shell and test PyTorch:
   ```
   python
   >>> import torch
   >>> print(torch.__version__)
   ```

---

## **Optional: Customize the Docker Container**

If you need additional libraries or custom configurations:

1. Create a custom `Dockerfile`:

   ```dockerfile
   FROM pytorch/pytorch:latest
   RUN pip install flask gunicorn  # Example: Add Flask and Gunicorn
   WORKDIR /workspace
   COPY . /workspace
   CMD ["bash"]
   ```

2. Build and push your custom image:

   ```
   docker build -t <your-dockerhub-username>/custom-pytorch:latest .
   docker push <your-dockerhub-username>/custom-pytorch:latest
   ```

3. Update the `image` field in the SDL file to use your custom image.

---

## **Step 5: Manage and Scale Deployment**

1. **Update Deployment**:
   Modify the `deploy.yaml` file and run:

   ```
   provider-services tx deployment update deploy.yaml --from <your-wallet>
   ```

2. **Stop Deployment**:
   ```
   provider-services tx deployment close --owner <your-wallet> --dseq <deployment-sequence>
   ```

---

By following this guide, you can successfully deploy PyTorch on Akash, leveraging the decentralized cloud for your machine learning tasks.
