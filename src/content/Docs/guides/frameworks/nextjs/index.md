---
categories: ["Guides"]
tags: ["Web Development", "React", "JavaScript", "Framework"]
weight: 1
title: "Next.js"
linkTitle: "Next.js"
---

[Next.js](https://nextjs.org/) is a is a popular React framework that enables server-side rendering and static site generation, making it ideal for building fast and SEO-friendly web applications. It provides features like automatic code splitting, simplified routing, and easy integration with APIs.

## Prerequisites

Before we start, ensure you have the following:

- Basic knowledge of React and Next.js.

- Node.js and npm installed on your machine.

- [Akash CLI](/docs/getting-started/quickstart-guides/akash-cli/) installed and configured. You could alternatively use the [Akash Console](https://console.akash.network/deployments). 

- An Akash wallet with a minimum of 5 AKT to pay for the deployment.

- Docker: Installed and running on your machine if you plan to use Docker for building the Next.js app.

## Create a Next.js Application

If you already have a Next.js app, you can skip this section. Otherwise, follow these steps to create a new Next.js project:


1. Create a New Next.js App:

Open your terminal and run the following command to create a new Next.js project:

```
npx create-next-app@latest my-nextjs-app
cd my-nextjs-app
```
This will set up a basic Next.js application in a directory called `my-nextjs-app`. You can rename `my-nextjs-app` to whatever you want. 


2. Build Your Application:

Once you've customized your Next.js application and added all the necessary components, build the production version:

```
npm run build
```
This command generates a .next directory containing the compiled code.

3. Export Static Files (Optional):

If your Next.js app is completely static (doesn't use server-side rendering or dynamic API routes), you can export it as static files:

```
npm run export
```

The static files will be placed in an out directory.

## Prepare for Akash Deployment

1. Create a Dockerfile:
If you haven't already, create and save a `Dockerfile` in the root of your project. This file will instruct Docker on how to build an image of your Next.js app.

```

# Use the official Node.js 18 image as the base image
FROM node:18-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# Production image
FROM node:18-alpine AS runner

# Set the working directory inside the container
WORKDIR /app

# Copy the build output from the builder stage
COPY --from=builder /app/.next /app/.next
COPY --from=builder /app/public /app/public
COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm install --production

# Expose the port the app runs on
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "start"]


```

2. Build the Docker Image:

Build the Docker image for your application:

```
docker build -t my-nextjs-app .
```

After the build is complete, you can run the Docker container locally to test it:

```
docker run -p 3000:3000 my-nextjs-app
```

3. Push the Docker Image to a Registry:

```
docker tag my-nextjs-app your-dockerhub-username/my-nextjs-app

docker push your-dockerhub-username/my-nextjs-app
```

## Deploy to Akash

### Option 1: Deploy Using Akash CLI

1. Install the Akash CLI:

Follow the [official guide](/docs/getting-started/quickstart-guides/akash-cli/) to install the Akash CLI on your system.

2. Create an SDL Deployment File:

Create a file named deploy.yaml in your project directory with the following content:

```
---
version: "2.0"

services:
  web:
    image: your-dockerhub-username/my-nextjs-app:latest
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
          units: 100m
        memory:
          size: 512Mi
        storage:
          size: 1Gi
  placement:
    default:
      pricing:
        web:
          denom: uakt
          amount: 1000

deployment:
  web:
    profiles:
      - web
    count: 1

```

Replace `your-dockerhub-username/my-nextjs-app` with your actual Docker Hub username and image name.

3. Deploy Your Application:

Run the following commands to deploy your application:

```
akash tx deployment create deploy.yaml --from <your-akash-account>

akash tx deployment send-manifest deploy.yaml --from <your-akash-account>
```

Follow the instructions in the CLI to complete the deployment process.

4. Monitor Your Deployment:

Use the Akash CLI to monitor the status of your deployment:

```
akash query deployment get <deployment-id>
```
You can also check the logs of your service:

```
akash query provider log <deployment-id> --provider <provider-address>
```

### Option 2: Deploy Using Akash Console

1. Access the Akash Console:

- Visit the [Akash Console](https://console.akash.network/deployments) in your web browser.

2. Log in to Your Akash Wallet:

- Connect your Akash wallet to the console by following the on-screen instructions.

3. Create a New Deployment:

Click on "New Deployment" and follow the prompts to create a new deployment. You'll be asked to upload your SDL file (use the [`deploy.yaml`](/docs/guides/frameworks/nextjs/#option-1-deploy-using-akash-cli) created earlier).

4. Submit the Deployment:

- Review the deployment details, set your bid price, and submit the deployment. The console will guide you through the process.

5. Manage and Monitor:

Once deployed, you can manage and monitor your deployment through the Akash Console, viewing logs, and scaling resources as needed.


## References

1. [Akash CLI Deployment Guide](/docs/getting-started/quickstart-guides/akash-cli/)

2. [Akash Console Deployment Guide](/docs/getting-started/quickstart-guides/akash-console/)

3. [Next.js Documentation](https://nextjs.org/docs)




