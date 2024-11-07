---
categories: ["Guides"]
tags: ["Frameworks"]
weight: 1
title: "Deploying an Angular App on Akash"
linkTitle: "Angular"
---

To deploy an Angular application to the Akash Network, you'll follow a series of steps, including building your Angular app, creating a deployment file, and using Akash CLI or the console to deploy. Below is a step-by-step guide to help you through the process.

## Step 1: Build Your Angular Application

### 1. Install Angular CLI (if not already installed):

```
npm install -g @angular/cli
```

### 2. Navigate to Your Angular Project:

```
cd /path/to/your/angular-app
```

### 3. Build the Angular App for Production: 

This command will create a `dist` directory with your production-ready application. 

```
ng build --prod
```

The output will be in the `dist/your-app-name` directory.

## Step 2: Prepare the Deployment File

To deploy your application on Akash, you need to define an SDL (Stack Definition Language) file that specifies how your application should be deployed. Here's a sample SDL file that you can customize:

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
          - global
    resources:
      cpu:
        units: 1
      memory:
        size: 512Mi
      storage:
        size: 1Gi
    deployment:
      replicas: 1
    args:
      - /bin/sh
      - -c
      - |
        cp -r /myapp/* /usr/share/nginx/html
        nginx -g "daemon off;"

profiles:
  compute:
    web:
      resources:
        cpu:
          units: 1
        memory:
          size: 512Mi
        storage:
          size: 1Gi
  placement:
    akash:
      pricing:
        web:
          denom: uakt
          amount: 1000

deployment:
  web:
    akash:
      profile: web
      count: 1
```

## Customizing the SDL File:

1. **Copy your Angular app files**: Ensure your Angular app files (the contents of `dist/your-app-name`) are copied to `/myapp/` in the container.

2. **NGINX Configuration**: By default, this SDL file assumes you are serving your Angular app with NGINX. The `nginx:alpine` image is lightweight and perfect for static websites.

3. Resource Allocation: You can adjust the `cpu`, `memory`, and `storage` parameters based on the needs of your application.

## Step 3: Deploy Using Akash CLI

1. **Install Akash CLI**: Follow the instructions to install the [Akash CLI](/docs/getting-started/quickstart-guides/akash-cli/) on your system from the Akash Documentation.

2. **Authenticate with Akash**: Ensure your account is funded with some AKT tokens and that your wallet is properly configured.

3. **Deploy the App**:

    - **Upload the SDL file**:

    ```
    akash tx deployment create deployment.yaml --from <your-wallet>
    ```
    - **Check the Status**: Monitor the status of your deployment with:
    ```
    akash query deployment get <deployment-id>
    ```
    - **Get the Lease**: Once the deployment is created, obtain a lease for it:
    ```
    akash tx market lease create --owner <your-wallet> --dseq <deployment-id> --gseq 1 --oseq 1 --provider <provider-address>
    ```

4. **Access the Application**: Once your deployment is live, you can access your Angular application through the public URL provided by the Akash provider.

## Step 4: Deploy Using Akash Console (Alternative Method)

1. **Visit the Akash Console**: Navigate to the [Akash Console](https://console.akash.network/).

2. **Authenticate**: Log in using your Keplr wallet or another supported wallet.

3. **Create a Deployment**:

    - Use the console's guided interface to create a new deployment.
    - Upload your SDL file and follow the prompts to complete the deployment process.
    - Monitor and Manage: The console provides an easy-to-use interface for monitoring your deployment, checking logs, and managing resources.

## Final Notes

- **Scaling**: You can scale your application by increasing the replicas count in the SDL file.

- **SSL/TLS**: Consider using Akash’s capabilities to manage SSL/TLS certificates for your domain.