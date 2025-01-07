---
categories: ["Guides"]
tags: ["Web Development", "Vue.js", "JavaScript", "Framework"]
weight: 1
title: "Guide to Building and Deploying a Vue.js App on Akash"
linkTitle: "Vue.js"
---

This guide will walk you through building a Vue.js application, containerizing it, and deploying it to the Akash Network using the Akash CLI or the Akash Console. 

## Step 1: Create and Build a Vue.js App

1. Create a Vue.js App:

```
npm init vue@latest vue-app
cd vue-app
npm install
```

2. Build the App for Production:

```
npm run build
```
This will generate a `dist` folder containing the production-ready app.

## Step 2: Containerize the Vue.js App

1. Create a Dockerfile: In the root of your project, create a Dockerfile:
```
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```
2. Build the Docker Image:

```
docker build -t vue-app:latest .
```
3. Test the Image Locally (Optional):
```
docker run -d -p 8080:80 vue-app:latest
```

Visit `http://localhost:8080` to confirm the app is running.

4. Push the Image to a Container Registry (e.g., Docker Hub):

```
docker tag vue-app:latest <your_dockerhub_username>/vue-app:latest
docker push <your_dockerhub_username>/vue-app:latest
```

## Step 3: Prepare the SDL File for Deployment

The following is a sample `deploy.yaml` file. Update the fields as needed, such as `image`, `price`, and `resources`.

```
version: "2.0"

services:
  vue-app:
    image: <your_dockerhub_username>/vue-app:latest
    expose:
      - port: 80
        as: 80
        to:
          - global: true

profiles:
  compute:
    vue-app:
      resources:
        cpu:
          units: 0.5
        memory:
          size: 512Mi
        storage:
          size: 1Gi
  placement:
    vue-app:
      pricing:
        vue-app:
          denom: uakt
          amount: 100

deployment:
  vue-app:
    vue-app:
      profile: vue-app
      count: 1
```
Save this file as `deploy.yaml`.

## Step 4: Deploy on Akash

Option 1: Using Akash CLI

1. Install Akash CLI: Follow the guide [here](docs/getting-started/quickstart-guides/akash-cli/) to set up the CLI.

2. Fund Your Account: Fund your Akash wallet to cover deployment costs. Instructions can be found [here](http://localhost:4321/docs/getting-started/token-and-wallets/).

3. Deploy:
     - Create a deployment:

    ```
    akash tx deployment create deploy.yaml --from <your_account_name> --chain-id <chain_id>

    ```
    - Review bids and accept:
    ```
    akash query market lease list --owner <your_wallet_address>
    akash tx market lease create --from <your_account_name> --chain-id <chain_id> --provider <provider_address> --dseq <deployment_sequence> --gseq 1 --oseq 1
    ```
4. Monitor Deployment: Use akash logs to verify the deployment:
```
akash provider lease-logs --from <your_account_name> --provider <provider_address> --dseq <deployment_sequence>
```

## Option 2: Using Akash Console

1. **Access the Console**: Visit the [Akash Console](https://console.akash.network/).

2. **Log In**: Connect your wallet to the console.

3. **Upload SDL**: Upload the `deploy.yaml` file and follow the on-screen steps to deploy.

4. **Monitor and Manage**: Use the console interface to monitor and manage your deployment.

## Step 5: Access Your Deployed App
Once the deployment is complete, Akash will provide a public URL or IP for accessing your app. Open it in your browser to confirm your Vue.js app is live.