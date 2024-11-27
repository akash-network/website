---
categories: ["Guides"]
tags: ["Frameworks"]
weight: 1
title: "Building and Deploying an Nue JS App on Akash"
linkTitle: "Nue JS"
---

This guide assumes you have basic knowledge of Nue and are familiar with Docker and the Akash ecosystem.

## 1. Building a Vue.js Application

1. Set up your Vue.js environment: Install Vue CLI if it’s not already installed:

```
npm install -g @vue/cli
```
2. Create a new Vue.js project:

```
vue create my-vue-app
```
Follow the prompts to configure your project.

3. Build your application for production:

```
cd my-vue-app
npm run build
```
The production-ready files will be located in the `dist` folder.

## 2. Packaging for Deployment

1. **Packaging for Deployment**:

    - Create a Dockerfile in your project root:

    ```
     FROM node:16-alpine

    WORKDIR /app

    COPY ./dist /app

    RUN npm install -g serve

    CMD ["serve", "-s", "."]
    ```

    - Build the Docker image:
    ```
    docker build -t my-vue-app .
    ```
    - Push the image to a container registry like Docker Hub or GHCR:
    ```
    docker tag my-vue-app <your-registry>/my-vue-app:latest
    docker push <your-registry>/my-vue-app:latest
    ```

2. **Set up an SDL file**: Use your SDL template to create deploy.yaml:

```
---
version: "2.0"

services:
  web:
    image: <your-registry>/my-vue-app:latest
    expose:
      - port: 80
        as: 80
        to:
          - global
profiles:
  compute:
    web:
      resources:
        cpu:
          units: 0.1
        memory:
          size: 128Mi
        storage:
          size: 512Mi
  placement:
    devnet:
      pricing:
        web:
          denom: uakt
          amount: 100
deployment:
  devnet:
    web:
      profile: web
      count: 1
```

## 3. Deploying the Application

### Option 1: Using Akash CLI
1. **Set up Akash CLI**: Follow the [Akash CLI](http://localhost:4321/docs/getting-started/quickstart-guides/akash-cli/) setup guide.

2. **Create and deploy your app**:

    - Fund your wallet: Follow the guide to fund your wallet.
    - Deploy the SDL:
    ```
    akash tx deployment create deploy.yaml --from <your-wallet> --node https://rpc.akash.network:443 --chain-id akashnet-2
    ```
    - Monitor deployment logs and get the lease ID:
    ```
    akash query deployment list --owner <your-address> --node https://rpc.akash.network:443
    ```

### Option 2: Using the Akash Console

1. **Log in to the Akash Console**: Open the [Akash Console](https://console.akash.network/).

2. Create your deployment:
    - Upload the `deploy.yaml` file in the deployment wizard.
    - Review the generated manifest and submit the deployment.

3. Select a provider: Choose a provider, bid on resources, and wait for the deployment to become active.

## 4. Verifying Your Deployment

Once your deployment is live:
    1. Access your app through the IP and port provided by the Akash Network.
    2. Configure your domain (if required) to point to the IP using an A record.

## Useful Links

    - Akash CLI setup: https://docs.akash.network/cli/install
    - Funding wallet: https://docs.akash.network/guides/funding-wallet
    - Akash Console: https://console.akash.network/



