---
categories: ["Guides"]
tags: ["Frameworks"]
weight: 1
title: "Hosting a React App on Akash"
linkTitle: "React"
---

Building and deploying a React application to Akash, a decentralized cloud computing marketplace, involves several steps. I'll guide you through the process of creating a React app, packaging it for deployment, and deploying it using both the Akash CLI and the Akash Console. This guide will include a sample SDL (Service Definition Language) file that you can use for your deployment.

## Prerequisites

Before you start, ensure you have the following:

- [Node.js](https://nodejs.org/) and npm installed to build your React app.
- **Akash CLI** installed. You can find installation instructions on the [Akash documentation](docs/getting-started/quickstart-guides/akash-cli/).
- Akash Wallet with sufficient funds to deploy your application.
- A basic understanding of [Docker](https://docker.com/), as Akash deploys applications using Docker containers.

## Step 1: Create a React Application

If you haven't already created a React application, you can do so with the following commands:

```
npx create-react-app my-react-app
cd my-react-app
npm run build
```

This will create a production build of your React app in the `build` directory.

## Step 2: Dockerize Your React Application

To deploy your React app on Akash, you need to containerize it using Docker.

### 1. Create a Dockerfile in the root of your React project:

```
# Use an official Node.js runtime as a parent image
FROM node:16-alpine as build

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Build the React app
RUN npm run build

# Use an official Nginx image to serve the build
FROM nginx:alpine

# Copy the build files to the Nginx html directory
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
```

### 2. Build the Docker image:
 
 ```
 docker build -t my-react-app .
```

### 3. Test the Docker image locally:

```
docker run -p 8080:80 my-react-app
```

Open your browser and go to `http://localhost:8080` to see your React app running.

## Step 3: Prepare the SDL File for Deployment

To deploy your React app on Akash, you need to define an SDL file that describes your deployment. Here’s a sample SDL file (`deploy.yaml`):

```
---
version: "2.0"

services:
  web:
    image: your-dockerhub-username/my-react-app:latest
    expose:
      - port: 80
        as: 80
        to:
          - global: true

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
    westcoast:
      attributes:
        region: us-west
      signedBy:
        anyOf:
          - akash1d4a58trjpqwyt2zj63w9uqwpphzxlz7v75d3t0
      pricing:
        web:
          denom: uakt
          amount: 100

deployment:
  web:
    westcoast:
      profile: web
      count: 1
```

## Step 4: Deploying Using Akash CLI

### 1. Authenticate with your Akash wallet:

```
akash keys add my-key
akash wallet send --from <your-akash-address> --to <your-akash-address> --amount 500000uakt
```
### 2. Create and Fund a Deployment:

```
akash tx deployment create deploy.yml --from my-key
akash tx deployment deposit <deployment-id> 500000uakt --from my-key
```

### 3. Check Lease Status:

```
akash query market lease list --owner <your-akash-address>
```

### 4. Get the Service URI:

```
akash provider send-manifest <lease-id> --from my-key
akash query provider service-logs --from <provider-address> --service web --deployment <deployment-id> --lease <lease-id>
```
### 5. Access Your Deployed App: The service URI will be displayed. You can access your React app using this URI.


## Step 5: Deploying Using Akash Console

1. **Visit the Akash Console**: Go to the [Akash Console](https://console.akash.network/).
2. **Log in**: Use your Akash wallet to log in.
3. **Create a New Deployment**:
    - Upload your `deploy.yaml` file.
    - Follow the prompts to deploy your React app.
4. **Manage Your Deployment**: The console will show you all active deployments, and you can easily manage them.
5. **Access Your App**: The console will provide a link to your deployed application.

## Conclusion

You've now successfully built and deployed a React application on Akash. This decentralized approach to hosting your application provides resilience, lower costs, and freedom from centralized cloud providers.

Don't hesitate to reach out to the [community](https://discord.gg/akash) if you need further assistance.








