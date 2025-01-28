---
categories: ["Guides"]
tags: ["AI & ML"]
weight: 1
title: "SKypilot"
linkTitle: "Skypilot"
---

[SkyPilot ](https://docs.skypilot.co/en/latest/docs/index.html) is a framework for running AI and batch workloads on any infra, offering unified execution, high cost savings, and high GPU availability.

Here’s a step-by-step guide to creating a Akypilot Docker image and deploying it on Akash.

## Creating the Docker Image

### Step 1: Clone the Repository

1. Open your terminal and clone the SkyPilot repository:

```
git clone https://github.com/skypilot-org/skypilot.git
cd skypilot
```

2. Review the repo structure to understand what files and scripts are present:

```
ls -la
```

### Step 2: Create a Dockerfile

1. Inside the `skypilot` directory, create a `Dockerfile`:

```
touch Dockerfile
```

2. Open the file in your favorite text editor and add the following instructions:

```
# Use an official Python image as the base
FROM python:3.10-slim

# Set the working directory
WORKDIR /app

# Copy the SkyPilot source code into the container
COPY . /app

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose the necessary port (if applicable)
EXPOSE 8000

# Define the command to run your application
CMD ["python", "skypilot.py"]
```

Adjust the `CMD` line based on the entry point for the application.


### Step 3: Build the Docker Image

1. Build the image using Docker:

```
docker build -t skypilot-app .
```
2. Verify the image is built successfully:

```
docker images
```
### Step 4: Push the Docker Image to a Registry

1. Log in to a container registry (e.g., Docker Hub, GitHub Packages, or others):

```
docker login
```
2. Tag the Docker image:

```
docker push <your-dockerhub-username>/skypilot-app:latest
```

### Step 5: Deploy on Akash

**Prepare the SDL File**

1. Use the SDL template below to create a `deploy.yaml` file:

```
version: "2.0"

services:
  web:
    image: <your-dockerhub-username>/skypilot-app:latest
    env:
      - PORT=8000
    expose:
      - port: 8000
        as: 80
        accept:
          - 0.0.0.0/0
        to:
          - global
profiles:
  compute:
    web:
      resources:
        cpu:
          units: 1.0
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
          - "akash"
      pricing:
        web:
          denom: uakt
          amount: 100
deployment:
  web:
    akash:
      profile: web
      count: 1

```

2. Replace `<your-dockerhub-username>` with your actual Docker Hub username or the registry URL.



**Deploy Using Akash CLI**

1. Install the Akash CLI if you haven’t already:

```
curl https://raw.githubusercontent.com/ovrclk/akash/master/godownloader.sh | sh
```

2. Authenticate and fund your Akash wallet with testnet or mainnet tokens.

3. Create a deployment using the SDL file:

```
provider-services tx deployment create --from <your-wallet-address> --node <akash-node-url> --fees <fee>
```
4. Monitor the status of the deployment:

```
provider-services query deployment list --owner <your-wallet-address>
```
5. Access the application using the assigned endpoint once the deployment is active.
