---
categories: ["Guides"]
tags: ["Deployments"]
weight: 1
title: "Setup, Deploy, and Launch an Nginx on Akash Network"
linkTitle: "Nginx"
---

Here's a step-by-step guide on how to set up, deploy, and launch an Nginx server to Akash, using the official Docker image, the Akash CLI, or the console. 

## Step 1: Install Akash CLI

Follow the Akash CLI installation guide to set up the CLI tool for managing deployments. Ensure you have:

- Akash wallet created and funded.
- Your node and CLI properly configured.

## Step 2: Create the SDL File

Below is a sample `deploy.yaml` file

```
---
version: "2.0"

services:
  nginx:
    image: nginx:latest # Official Nginx Docker image
    expose:
      - port: 80
        as: 80
        to:
          - global: true

profiles:
  compute:
    nginx:
      resources:
        cpu:
          units: 1
        memory:
          size: 512Mi
        storage:
          size: 1Gi
  placement:
    default:
      attributes:
        region: us-west
      pricing:
        nginx:
          denom: uakt
          amount: 50

deployment:
  nginx:
    nginx:
      profile: nginx
      count: 1
```

- **Image**: `nginx:latest` pulls the latest official Docker image for Nginx.
- **Expose**: Port 80 is exposed globally to make your server accessible on the web.
- **Resources**: Defines the compute resources (CPU, memory, and storage) for the container.
- **Pricing**: Sets a price in Akash tokens (`uakt`) for your deployment.

## Step 3: Deploy to Akash

### Step 3a: Deploy Using Akash CLI (option a)

1. **Authenticate and prepare your environment**:

```
provider-services tx authz grant <provider-address> --from <wallet-name>
```
Replace `<provider-address>` and `<wallet-name>` with your provider's address and your wallet name.

2. **Submit the SDL file for deployment**:
```
provider-services tx deployment create deploy.yaml --from <wallet-name>
```
3. **Bid on a provider: Run this command to find available bids**:
```
provider-services query market bid list --owner <wallet-address>
```
4. **Accept a bid and deploy**:
```
provider-services tx market lease create --bid-id <bid-id> --from <wallet-name>
```
5. **Check deployment status**:
```
    provider-services query market lease status --owner <wallet-address> --dseq <deployment-sequence>
```
6. **Access your Nginx server**: Use the provided endpoint to access your running Nginx server.

For a full CLI guide, visit: [Akash CLI Deployment](/docs/deployments/akash-cli/overview/).

### Step 3b: Deploy Using Akash Console

1. Navigate to the [Akash Console](https://console.akash.network/).
2. Login using your Akash wallet.
3. Upload the `deploy.yaml` file.
4. Submit your deployment request.
5. Choose a provider and approve the bid.
6. Monitor your deployment and retrieve the endpoint URL once the deployment is live.

For detailed instructions, check the [Akash Console Guide](/docs/deployments/akash-console/).

## Step 4: Verify Your Nginx Server

Once your deployment is live:

    1. Visit the provided endpoint URL.
    2. You should see the default Nginx welcome page.

## Additional Notes

- If you need to customize the Nginx configuration, create a custom nginx.conf file and mount it in the Docker container. Update the services block in the SDL file to include a volume mapping.
- For persistent storage or logging, configure additional storage resources in the SDL file.