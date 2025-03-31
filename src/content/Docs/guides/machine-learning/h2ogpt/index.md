---
categories: ["Guides"]
tags: ["Artificial Intelligence/Machine Learning"]
weight: 1
title: "h2oGPT"
linkTitle: "h2oGPT"
---

h2oGPT is an Apache V2 open-source project that allows you to query and summarize your documents or just chat with local private GPT LLMs.


## Prerequisites

1. **Akash Account**: Ensure you have an active Akash wallet with AKT tokens for deployment costs.
2. **Akash CLI**: Installed and configured on your system.
3. **Dockerized h2oGPT**: h2oGPT container image available (e.g., from Docker Hub or built locally).
4. **Akash Console**: Access to the [Akash Console](https://console.akash.network/).

## Part 1: Create a Docker Image for h2oGPT

1. Clone the Repository:
```
git clone https://github.com/h2oai/h2ogpt.git
cd h2ogpt
```

2. Build the Docker Image: Ensure Docker is installed and running on your machine, then build the image.

```
docker build -t h2ogpt:latest .
```

3. Test the Docker Image Locally (Optional): Run the Docker container to confirm that h2oGPT is working correctly.

```
docker run -p 7860:7860 h2ogpt:latest
```
Open your browser and navigate to `http://localhost:7860` to confirm the app runs successfully.

4. Push the Docker Image to a Registry: Tag and push the image to a container registry like Docker Hub or GitHub Packages.
```
docker tag h2ogpt:latest <your-registry-username>/h2ogpt:latest
docker push <your-registry-username>/h2ogpt:latest
```



## Part 2: Create an SDL File

Below is an example SDL file to deploy h2oGPT. 

```
---
version: "2.0"

services:
  h2ogpt-service:
    image: <your-registry-username>/h2ogpt:latest
    expose:
      - port: 7860
        as: 80
        to:
          - global: true
    env:
      - H2O_ENV_VARIABLE_1=value1 # Replace with actual environment variables
      - H2O_ENV_VARIABLE_2=value2
profiles:
  compute:
    h2ogpt-profile:
      resources:
        cpu:
          units: 4
        memory:
          size: 8Gi
        storage:
          size: 20Gi
  placement:
    h2ogpt-placement:
      attributes:
        region: us-west # Change based on preference
      signedBy:
        anyOf:
          - akash1<your-provider-address>
deployment:
  h2ogpt-deployment:
    h2ogpt-service:
      profile: h2ogpt-profile
      count: 1
```

## Part 3: Deploy Using Akash CLI

1. Install Akash CLI: Follow the official [Akash CLI setup guide](/docs/getting-started/quickstart-guides/akash-cli/).

2. Fund Your Wallet: Ensure your Akash wallet is funded with AKT for deployment fees.

3. Create and Send the Deployment:

    - Save the SDL file as deploy.yaml.
    - Create the deployment:
    ```
    provider-services tx deployment create h2ogpt-deployment.yaml --from <your-wallet-name> --node https://rpc.akashnet.io:443 --chain-id akashnet-2
    ```
    - Query for bids:
    ```
    provider-services query market bid list --owner <your-wallet-address> --node https://rpc.akashnet.io:443
    ```
    - Accept a bid:
    ```
    provider-services tx market lease create --owner <your-wallet-address> --dseq <deployment-sequence> --gseq <group-sequence> --oseq <order-sequence> --provider <provider-address> --from <your-wallet-name>
    ```
4. Retrieve Deployment Logs: Use the following command to check the logs:

```
provider-services provider lease-logs --provider <provider-address> --dseq <deployment-sequence> --gseq <group-sequence> --oseq <order-sequence>
```

5. Access h2oGPT: Find the deployment's external IP or domain in the logs, then navigate to it in your browser.

## Part 4: Deploy Using Akash Console

1. Access Akash Console: Open the [Akash Console](https://console.akash.network/) in your browser.

2. Log In:

    - Import your Akash wallet or create a new one.
    - Ensure your wallet is funded with AKT.

3. Create a Deployment:

    - Click Create Deployment and paste the SDL file created earlier.
    - Review the details and deploy.

4. Monitor Bids:

    - Wait for bids from providers.
    - Select a bid and finalize the deployment.

5. Access h2oGPT:

    - Locate the provider's external IP or domain.
    - Open it in your browser to interact with the application.