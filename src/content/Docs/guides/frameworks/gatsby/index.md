---
categories: ["Guides"]
tags: ["Frameworks"]
weight: 1
title: "How to Build and Deploy a Gatsby App on Akash"
linkTitle: "Gatsby"
---

This guide walks you through the process of building a Gatsby app and deploying it to the Akash Network. We'll cover both using the Akash Console and the Akash CLI.

## 1. Build Your Gatsby App

1. Install Gatsby CLI:

```
npm install -g gatsby-cli
```
2. Create a Gatsby Project:
```
gatsby new my-gatsby-app https://github.com/gatsbyjs/gatsby-starter-default
cd my-gatsby-app
```
3. Build for Production:
```
gatsby build
```
This creates a `public/` directory containing the static files for deployment.

## Prepare Your Akash Deployment

**A. Sample `deploy.yaml`**

Use the following SDL file to configure your Akash deployment. Update placeholders like `YOUR_IMAGE` and `YOUR_DOMAIN` accordingly.

```
---
version: "2.0"

services:
  gatsby:
    image: nginx:latest
    env:
      - NGINX_PORT=80
    expose:
      - port: 80
        as: 80
        to:
          - global: true
    volumes:
      - gatsby-data:/usr/share/nginx/html

profiles:
  compute:
    gatsby:
      resources:
        cpu:
          units: 0.5
        memory:
          size: 512Mi
        storage:
          size: 1Gi

  placement:
    default:
      attributes:
        region: us-west
      signedBy:
        anyOf:
          - "akash1YOURPROVIDERADDRESS"
      pricing:
        gatsby:
          denom: uakt
          amount: 100

deployment:
  gatsby:
    gatsby:
      profile: gatsby
      placement: default
```

**B. Upload Static Files**

Before deployment, host the public/ files on your image. For example:

    Use Docker to create an image:
    ```
    docker build -t YOUR_IMAGE .
    docker push YOUR_IMAGE
    ```
## 3. Deploy Using Akash

### Option A: Akash Console

1. Go to the [Akash Console](https://console.akash.network/).
2. Log in with your Keplr wallet.
3. Create a deployment:

    - Upload the deploy.yaml file.
    - Specify the price you’re willing to pay.

4. Approve the lease once a provider accepts your deployment.
5. Use the provider endpoint to access your app.

## Option B: Akash CLI

1. Install the Akash CLI by following the [CLI Installation Guide](docs/getting-started/quickstart-guides/akash-cli/).
2. Fund your wallet to pay for deployment fees.
3. Deploy your app:
```
akash tx deployment create deploy.yaml --from YOUR_WALLET --chain-id akashnet-2
```
4. Monitor the status:
```
akash query deployment list --owner YOUR_WALLET
```
5. Once the lease is active, access your app via the provider’s endpoint.

## 4. Test Your Deployment

Visit the endpoint provided by the Akash provider to ensure your Gatsby app is live and functional.