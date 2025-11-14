---
categories: ["Guides"]
tags: ["Network"]
weight: 1
title: "Guide to Deploy CJDNS PKT on Akash"
linkTitle: "CJDNS PKT"
---

To deploy **CJDNS PKT** (a software suite for building a secure mesh network) on **Akash**, follow these steps. Akash is a decentralized cloud computing platform that can host decentralized services, and it supports deploying applications via containerization.

Here’s a step-by-step guide on how to deploy **CJDNS PKT** on Akash:

### Prerequisites

1. **Akash Account**: Ensure you have an Akash account. If you don’t, create one at [Akash](https://akash.network/).

2. **Akash CLI**: Install the Akash CLI to interact with the Akash network. Follow the [Akash CLI installation guide](/docs/getting-started/quickstart-guides/akash-cli/) to install the CLI.

3. **Docker**: cjdns needs to run inside a container. Ensure Docker is installed on your local machine.
4. **cjdns Packet**: You will need the container image or packet of cjdns, or you will build one from the cjdns source.

### Steps

#### 1. Create a Docker Image for cjdns

You need to either use a pre-built Docker image for **CJDNS PKT** or create your own. To create a Docker image for cjdns:

1. Clone the **CJDNS PKT** repository from GitHub:

   ```bash
   git clone https://github.com/cjdelis/cjdns.git
   cd cjdns
   ```

2. Build the Docker image for **CJDNS PKT**:

   ```bash
   docker build -t cjdns:latest .
   ```

3. Push the Docker image to a container registry (e.g., Docker Hub, GitHub Container Registry, etc.):

   ```bash
   docker tag cjdns:latest <your-container-registry>/cjdns:latest
   docker push <your-container-registry>/cjdns:latest
   ```

#### 2. Prepare the Akash Manifest (SDL)

The Akash SDL (Stellar Deployment Language) defines how the container will be deployed on Akash. Below is an example `manifest.yaml` file for deploying **CJDNS PKT** on Akash.

```yaml
version: "2.0"
services:
  cjdns:
    image: <your-container-registry>/cjdns:latest
    expose:
      - port: 443
    env:
      - name: NODE_SECRET
        value: "your-node-secret"
      - name: NETWORK_NAME
        value: "your-network-name"
    cpu:
      units: 0.5
    memory:
      size: 2Gi
    storage:
      size: 1Gi
    count: 1
    entrypoint: ["/bin/bash", "-c", "your-entrypoint.sh"]
    volume:
      - /path/to/config:/config
    deployment:
      name: cjdns-deployment
      region: <your-region>
```

- **image**: Replace `<your-container-registry>/cjdns:latest` with your Docker registry and image name.
- **NODE_SECRET**: Set your node secret for cjdns.
- **NETWORK_NAME**: Set your network name.
- **entrypoint**: Define the script that starts the cjdns service.
- **volume**: Bind mount your cjdns configuration files (optional).

#### 3. Deploy on Akash

1. **Initialize Akash CLI**:

   Run the following to authenticate and set up your Akash environment.

   ```bash
   provider-services login
   ```

2. **Create Deployment**:

   Using the Akash CLI, deploy your **CJDNS PKT** service by running the following:

   ```bash
   provider-services tx deployment create manifest.yaml --from <your-wallet-name> --fees 500uatom --chain-id <your-chain-id>
   ```

3. **Track Deployment**:

   After submitting the transaction, track the status of your deployment:

   ```bash
   provider-services tx deployment status <deployment-id> --from <your-wallet-name> --chain-id <your-chain-id>
   ```

   The deployment will provide an endpoint, which you can use to connect to your **CJDNS PKT** network.

#### 4. Access the Service

Once the deployment is successful, you will get the public endpoint where cjdns is running. You can now use this endpoint to integrate with your **CJDNS PKT** network or mesh.

#### 5. Monitor and Scale

- **Monitor** your **CJDNS PKT** service by checking logs or interacting with the container.
  
  ```bash
  provider-services tx deployment logs <deployment-id> --from <your-wallet-name> --chain-id <your-chain-id>
  ```

- **Scale** your **CJDNS PKT** deployment if needed by increasing the service count or resources.

---

### Conclusion

By following these steps, you will have successfully deployed **CJDNS PKT** on the **Akash** network. You can now utilize Akash’s decentralized cloud resources to run your mesh network on cjdns, and take advantage of the flexibility and scalability it provides.