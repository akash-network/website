---
categories: ["Guides"]
tags: ["Benchmarking"]
weight: 1
title: "Deploying LibreSpeed on Akash"
linkTitle: "LibreSpeed"
---



This guide demonstrates how to deploy **LibreSpeed**, a fast speed test service, on Akash.
## Prerequisites

Before you begin, ensure the following:

1. **Akash CLI** installed. Follow the installation guide [here](/docs/getting-started/quickstart-guides/akash-cli/).
2. **Akash Account Setup** and **API Key** configured. (You can find details in the Akash [documentation](/docs).
3. **Docker** installed for building the LibreSpeed container.
4. **Provider Services Command** installed. This new command replaces the old `Akash` CLI for interacting with Akash provider services.

## Steps

### Step 1: Clone the LibreSpeed Repository

Start by cloning the LibreSpeed repository from GitHub:

```bash
git clone https://github.com/librespeed/speedtest.git
cd speedtest
```

### Step 2: Create the Dockerfile

LibreSpeed provides a simple Docker image that you can use to deploy the service. Create a Dockerfile if it’s not already present. Here's an example Dockerfile for LibreSpeed:

```dockerfile
# Use a minimal base image
FROM nginx:alpine

# Copy the LibreSpeed code into the container
COPY . /usr/share/nginx/html

# Expose the default HTTP port
EXPOSE 80
```

### Step 3: Build the Docker Image

Build the Docker image for LibreSpeed:

```bash
docker build -t librespeed .
```

### Step 4: Push the Docker Image to Docker Hub

Push the image to Docker Hub so it can be accessed by Akash:

```bash
docker login
docker tag librespeed yourdockerhubusername/librespeed:latest
docker push yourdockerhubusername/librespeed:latest
```

### Step 5: Define the Akash Deployment

Create a Kubernetes manifest for the deployment. Create a file `deployment.yaml` to define the resource configurations for Akash.

```yaml
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: librespeed
spec:
  replicas: 1
  selector:
    matchLabels:
      app: librespeed
  template:
    metadata:
      labels:
        app: librespeed
    spec:
      containers:
        - name: librespeed
          image: yourdockerhubusername/librespeed:latest
          ports:
            - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: librespeed-service
spec:
  selector:
    app: librespeed
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
  type: LoadBalancer
```

### Step 6: Deploy LibreSpeed on Akash

Deploy the LibreSpeed application.

1. Initialize the deployment with the new CLI command:

```bash
provider-services deploy --file deployment.yaml
```

2. Ensure that the deployment is completed successfully. You should see an endpoint where your LibreSpeed application is accessible.

### Step 7: Access Your LibreSpeed Instance

Once the deployment is successful, you can access your instance via the provided public IP or DNS.

### Step 8: (Optional) Set up Domain Name (DNS)

If you want to point your domain to the deployed instance:

1. Go to your domain registrar and configure an **A record** or **CNAME** pointing to the public IP provided by Akash.

---

## Conclusion

Congratulations! You’ve successfully deployed **LibreSpeed** on **Akash** using the new `provider-services` CLI command. Your speed test instance is now live, and you can access it via the public IP or your domain.

