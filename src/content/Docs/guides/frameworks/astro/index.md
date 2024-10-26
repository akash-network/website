---
categories: ["Guides"]
tags: ["Frameworks"]
weight: 1
title: "Building and Deploying an Astro App on Akash"
linkTitle: "Astro"
---

Deploying your Astro application on the Akash Network involves a few key steps: building the Astro app, writing a deployment file, and then deploying the application using Akash CLI or the Akash Console. Here’s a step-by-step guide to help you through the process.

## Prerequisites

1. **Astro Application**: You should have an Astro app ready to deploy.

2. **Akash Account**: Ensure you have an Akash account set up with some funds for deployment.

3. **Akash CLI or Console**: You can choose to use either the Akash CLI or the Akash Console for deployment.

## Step 1: Build Your Astro App

Before deploying your Astro app, you need to build it into a static site. Assuming you already have an Astro project, run the following commands:

```
npm install
npm run build
```

This will create a `dist` directory in your project folder that contains the static files to be deployed.

## Step 2: Write the Deployment SDL File

The SDL (Service Definition Language) file defines the services you want to run on Akash. Below is a sample SDL file tailored for deploying a static site like an Astro app:

```
---
version: "2.0"

services:
  web:
    image: nginx:alpine
    env:
      - NGINX_PORT=80
    expose:
      - port: 80
        as: 80
        to:
          - global: true
    mounts:
      - type: volume
        name: app-files
        mount: /usr/share/nginx/html
    restart_policy:
      condition: on-failure

profiles:
  compute:
    web:
      resources:
        cpu:
          units: 100m
        memory:
          size: 128Mi
        storage:
          size: 512Mi

  placement:
    westcoast:
      attributes:
        region: us-west
      signedBy:
        anyOf:
          - akash.network/certificates/v1beta1/provider
      pricing:
        web:
          denom: uakt
          amount: 100

deployment:
  westcoast:
    web:
      profile: web
      count: 1
```

## Step 3: Deploy Your Astro App Using Akash

You can deploy your app either using the Akash CLI or the Akash Console.

### Option 1: Deploy Using Akash CLI

1. **Install Akash CLI**: 

If you haven’t installed the Akash CLI yet, you can find the installation instructions [here](/docs/getting-started/quickstart-guides/akash-cli/).

2. **Create a Deployment**:

First, ensure you have the SDL file saved as `deploy.yaml` in your project directory. Then, run the following commands:

```
akash tx deployment create deployment.yaml --from <your-wallet-name> --node <node-url> --chain-id <chain-id>
```

Replace `<your-wallet-name>`, `<node-url>`, and `<chain-id>` with your actual wallet name, the Akash node URL, and chain ID, respectively.

3. **Create a Lease**:

After the deployment is created, create a lease for it:

```
akash tx market lease create --dseq <deployment-sequence> --from <your-wallet-name> --node <node-url> --chain-id <chain-id>
```
You can find your `dseq` (deployment sequence) from the output of the previous command.

4. **Upload Your App Files**:

Now, upload the built Astro app files (`dist` directory) to the deployment:

```
akash provider send-manifest <provider-address> --dseq <deployment-sequence> --from <your-wallet-name>
```

5. **Access Your Application**:

Once the deployment is successful, you can access your application via the Akash URL provided in the lease response.

### Option 2: Deploy Using Akash Console

1. **Access the Akash Console**:

Go to the Akash Console and log in with your wallet.

2. **Create a Deployment**:

- Click on "Create Deployment".
- Upload your `deployment.yaml` file.
- Review the deployment settings and costs.

3. **Create a Lease**:

After creating the deployment, proceed to create a lease by selecting a provider and finalizing the lease details.

4. **Upload Your App Files**:

After the lease is established, upload the contents of your `dist` directory to the deployment using the provided interface.

5. **Access Your Application**:

Once the deployment is live, you'll receive a URL where your Astro app is hosted.

## Step 4: Monitor and Maintain Your Deployment

Once deployed, you can monitor your deployment using Akash’s CLI or Console tools. Make sure to check on resource usage and renew the lease as necessary to keep your app running.

## Conclusion

By following this guide, you should be able to successfully build and deploy an Astro app on the Akash Network using either the CLI or the Console. The Akash Network offers a decentralized and cost-effective way to host your applications, providing you with control and flexibility over your deployments.




