---
categories: ["Guides"]
tags: ["Web Development", "React", "JavaScript", "Framework"]
weight: 1
title: "Building and Deploying a NestJS App on Akash Network"
linkTitle: "Next.js"
---

This guide walks you through setting up, containerizing, and deploying a NestJS application on Akash Network. 

## 1. Build a NestJS App

Follow these steps to create and prepare your NestJS app:

### Step 1.1: Create a New NestJS App

1. Ensure Node.js and npm are installed on your system.
2. Run the following commands:
```
    npm i -g @nestjs/cli
    nest new my-nestjs-app
```
3. Navigate into the project:
```
    cd my-nestjs-app
```
### Step 1.2: Configure Your Application
- Install any additional packages your app needs (e.g., `npm install --save <package>`).
- Update the application logic in the appropriate directories (e.g., `src/`).

## 2. Containerize the App

To deploy the app on Akash, you need to containerize it using `Docker`.

### Step 2.1: Create a `Dockerfile`

In the root of your NestJS app, create a Dockerfile:
```
# Base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Build the app
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Command to start the app
CMD ["npm", "run", "start:prod"]
```
### Step 2.2: Build and Test the Image

1. Build the Docker image:
```
docker build -t my-nestjs-app .
```
2. Run the image locally to test:
```
docker run -p 3000:3000 my-nestjs-app
```
3. Visit `http://localhost:3000` to confirm your app works.

## 3. Deploy to Akash
Akash supports deployments via its CLI or Web Console. Below, you'll find instructions for both, along with a sample `deploy.yaml` file.

### Step 3.1: Prepare the Deployment File

Akash deployments require an SDL file (deploy.yaml). Below is a sample based template:

```
---
version: "2.0"

services:
  web:
    image: my-nestjs-app
    expose:
      - port: 3000
        as: 80
        to:
          - global: true

profiles:
  compute:
    web:
      resources:
        cpu:
          units: 0.5
        memory:
          size: 512Mi
        storage:
          size: 1Gi

  placement:
    westcoast:
      attributes:
        region: us-west
      signedBy:
        anyOf:
          - "akash1xxxxxx"
      pricing:
        web:
          denom: uakt
          amount: 1000

deployment:
  web:
    westcoast:
      profile: web
      count: 1
```

Replace `my-nestjs-app` with the name of your image in a public Docker registry (e.g., Docker Hub).

### Step 3.2: Deploy Using Akash CLI

1. Install Akash CLI by following Akash CLI Installation Guideenticate your wallet by following Wallet Authentication .
2. Deploy `deploy.yaml` using the commands below:
```
akash tx deployment create deploy.yaml --from <your-wallet-name> --node <akash-node-url>
```
Detailed CLI deployment instructions are available [here](docs/getting-started/quickstart-guides/akash-cli/).


### Step 3.3: Deploy Using Akash Web Console

If you prefer a GUI, use the Akash Console.

1. Access the console at console.akash.network.
2. Login with your wallet.
3. Follow the Console Deployment Guide to upload your `deploy.yaml` file to complete the process.

## 4. Monitor and Access Your App

After deployment:

    1. Use the Akash CLI or Console to monitor the status of your deployment.
    2. Retrieve the app's external URL or IP from the deployment details.
    3. Access your app via a browser or API client.
