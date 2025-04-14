---
categories: ["Guides"]
tags: ["APIs"]
weight: 1
title: "Thirdweb"
linkTitle: "Thirdweb"
---

### Deploying Thirdweb on Akash

#### Overview of Thirdweb
Thirdweb is a platform that enables developers to build and deploy web3 applications effortlessly. It provides SDKs, smart contract templates, and user-friendly tools to integrate blockchain functionality into web applications. With Thirdweb, you can quickly set up authentication, deploy smart contracts, and integrate decentralized storage, among other features.

This guide will walk you through deploying a Thirdweb-powered application on Akash using the new provider-services command.

#### Prerequisites
Before you begin, ensure you have the following installed:
- Node.js (latest LTS version recommended)
- Akash CLI (configured with your wallet and funds)
- Docker (for building and testing locally)

#### Step 1: Create a Thirdweb Project
First, create a new Thirdweb project using the starter template:
```bash
npx thirdweb create --template next-javascript-starter
```
Navigate into the project directory:
```bash
cd next-javascript-starter
```

#### Step 2: Understand the Project Structure
- **pages/index.js**: Contains the core logic, including the useMetamask hook to connect to MetaMask, useDisconnect to disconnect, and useAddress to check the connected wallet.
- **pages/_app.js**: Wraps your app in the ThirdwebProvider, ensuring hooks work properly.

#### Step 3: Prepare for Deployment on Akash
Create a `deploy.yaml` file in the root of your project with the following content:
```yaml
version: "2.0"
services:
  web:
    image: "thirdweb/starter-kits:latest"
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
          units: 1
        memory:
          size: 1Gi
        storage:
          size: 1Gi
  placement:
    dcloud:
      pricing:
        web:
          denom: uakt
          amount: 10000

deployment:
  web:
    dcloud:
      profile: web
      count: 1
```

#### Step 4: Deploy to Akash
Create an Akash deployment:
```bash
provider-services create deploy.yaml
```
This will submit the deployment and return a lease ID.

View the deployment status:
```bash
provider-services status <lease-id>
```

Get the access URL:
Once the deployment is active, run:
```bash
provider-services list
```
Look for the assigned URL to access your deployed Thirdweb app.

#### Conclusion
You have successfully deployed a Thirdweb application on Akash using the new provider-services command. Your app is now live and accessible via the assigned URL. For further customization, you can modify the `deploy.yaml` file to adjust resource allocation or add environment variables as needed.

Happy coding!