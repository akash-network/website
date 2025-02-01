---
categories: ["Guides"]
tags: ["Web Development", "Next.js", "JavaScript", "Framework"]
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

- Create your Certificate

Akash requires an account to have a valid certificate associated with it to start participating in the deployment process. In this section of the guide, we will create a certificate locally, and then proceed to store this certificate on the Akash blockchain. To do this, ensure you have followed all the steps outlined in this guide up to this point. Additionally, these transactions must be executed from an Akash account in possession of some $AKT tokens.

Once an account has a certificate associated with it, it can begin deploying services on the Akash blockchain. **A certificate needs to be created only once per account. After creation, it can be used across any number of deployments for as long as it remains valid.**


```
provider-services tx cert generate client -from $AKASH_KEY_NAME
```

- Publish Cert to the Blockchain

```
provider-services tx cert publish client -from $AKASH_KEY_NAME
```

- Create your Deployment

- CPU Support

Only x86_64 processors are officially supported for Akash deployments. This may change in the future and when ARM processors are supported it will be announced and documented.

- Akash Deployment

> _**NOTE**_ - if your current terminal session has been used to create prior deployments, issue the command `unset AKASH_DSEQ` to prevent receipt of error message `Deployment Exists`

To deploy on Akash, run:

```
provider-services tx deployment create deploy.yaml -from $AKASH_KEY_NAME
```

You should see a response similar to:

```javascript
{
  "height":"140325",
  "txhash":"2AF4A01B9C3DE12CC4094A95E9D0474875DFE24FD088BB443238AC06E36D98EA",
  "codespace":"",
  "code":0,
  "data":"0A130A116372656174652D6465706C6F796D656E74",
  "raw_log":"[{\"events\":[{\"type\":\"akash.v1\",\"attributes\":[{\"key\":\"module\",\"value\":\"deployment\"},{\"key\":\"action\",\"value\":\"deployment-created\"},{\"key\":\"version\",\"value\":\"2b86f778de8cc9df415490efa162c58e7a0c297fbac9cdb8d6c6600eda56f17e\"},{\"key\":\"owner\",\"value\":\"akash1vn06ycjjnvsvl639fet9lajjctuturrtx7fvuj\"},{\"key\":\"dseq\",\"value\":\"140324\"},{\"key\":\"module\",\"value\":\"market\"},{\"key\":\"action\",\"value\":\"order-created\"},{\"key\":\"owner\",\"value\":\"akash1vn06ycjjnvsvl639fet9lajjctuturrtx7fvuj\"},{\"key\":\"dseq\",\"value\":\"140324\"},{\"key\":\"gseq\",\"value\":\"1\"},{\"key\":\"oseq\",\"value\":\"1\"}]},{\"type\":\"message\",\"attributes\":[{\"key\":\"action\",\"value\":\"create-deployment\"},{\"key\":\"sender\",\"value\":\"akash1vn06ycjjnvsvl639fet9lajjctuturrtx7fvuj\"},{\"key\":\"sender\",\"value\":\"akash1vn06ycjjnvsvl639fet9lajjctuturrtx7fvuj\"}]},{\"type\":\"transfer\",\"attributes\":[{\"key\":\"recipient\",\"value\":\"akash17xpfvakm2amg962yls6f84z3kell8c5lazw8j8\"},{\"key\":\"sender\",\"value\":\"akash1vn06ycjjnvsvl639fet9lajjctuturrtx7fvuj\"},{\"key\":\"amount\",\"value\":\"5000uakt\"},{\"key\":\"recipient\",\"value\":\"akash14pphss726thpwws3yc458hggufynm9x77l4l2u\"},{\"key\":\"sender\",\"value\":\"akash1vn06ycjjnvsvl639fet9lajjctuturrtx7fvuj\"},{\"key\":\"amount\",\"value\":\"5000000uakt\"}]}]}]",
  "logs":[
    {
      "msg_index":0,
      "log":"",
      "events":[
        {
          "type":"akash.v1",
          "attributes":[
            {
              "key":"module",
              "value":"deployment"
            },
            {
              "key":"action",
              "value":"deployment-created"
            },
            {
              "key":"version",
              "value":"2b86f778de8cc9df415490efa162c58e7a0c297fbac9cdb8d6c6600eda56f17e"
            },
            {
              "key":"owner",
              "value":"akash1vn06ycjjnvsvl639fet9lajjctuturrtx7fvuj"
            },
            {
              "key":"dseq",
              "value":"140324"
            },
            {
              "key":"module",
              "value":"market"
            },
            {
              "key":"action",
              "value":"order-created"
            },
            {
              "key":"owner",
              "value":"akash1vn06ycjjnvsvl639fet9lajjctuturrtx7fvuj"
            },
            {
              "key":"dseq",
              "value":"140324"
            },
            {
              "key":"gseq",
              "value":"1"
            },
            {
              "key":"oseq",
              "value":"1"
            }
          ]
        },
        {
          "type":"message",
          "attributes":[
            {
              "key":"action",
              "value":"create-deployment"
            },
            {
              "key":"sender",
              "value":"akash1vn06ycjjnvsvl639fet9lajjctuturrtx7fvuj"
            },
            {
              "key":"sender",
              "value":"akash1vn06ycjjnvsvl639fet9lajjctuturrtx7fvuj"
            }
          ]
        },
        {
          "type":"transfer",
          "attributes":[
            {
              "key":"recipient",
              "value":"akash17xpfvakm2amg962yls6f84z3kell8c5lazw8j8"
            },
            {
              "key":"sender",
              "value":"akash1vn06ycjjnvsvl639fet9lajjctuturrtx7fvuj"
            },
            {
              "key":"amount",
              "value":"5000uakt"
            },
            {
              "key":"recipient",
              "value":"akash14pphss726thpwws3yc458hggufynm9x77l4l2u"
            },
            {
              "key":"sender",
              "value":"akash1vn06ycjjnvsvl639fet9lajjctuturrtx7fvuj"
            },
            {
              "key":"amount",
              "value":"5000000uakt"
            }
          ]
        }
      ]
    }
  ],
  "info":"",
  "gas_wanted":"100000",
  "gas_used":"94653",
  "tx":null,
  "timestamp":""
}
```

- Find your Deployment \-

Find the Deployment Sequence (DSEQ) in the deployment you just created. You will need to replace the AKASH_DSEQ with the number from your deployment to configure a shell variable.

```bash
export AKASH_DSEQ=CHANGETHIS
```

Now set the Order Sequence (OSEQ) and Group Sequence (GSEQ). Note that if this is your first time deploying on Akash, OSEQ and GSEQ will be 1.

```bash
AKASH_OSEQ=1
AKASH_GSEQ=1
```

Verify we have the right values populated by running:

```bash
echo $AKASH_DSEQ $AKASH_OSEQ $AKASH_GSEQ
```

- View your Bids

After a short time, you should see bids from providers for this deployment with the following command:

```bash
provider-services query market bid list -owner=$AKASH_ACCOUNT_ADDRESS -node $AKASH_NODE -dseq $AKASH_DSEQ -state=open
```

- Choose a Provider

Note that there are bids from multiple different providers. In this case, both providers happen to be willing to accept a price of _1 uAKT_. This means that the lease can be created using _1 uAKT_ or _0.000001 AKT_ per block to execute the container. You should see a response similar to:

```
bids:
- bid:
    bid_id:
      dseq: "140324"
      gseq: 1
      oseq: 1
      owner: akash1vn06ycjjnvsvl639fet9lajjctuturrtx7fvuj
      provider: akash10cl5rm0cqnpj45knzakpa4cnvn5amzwp4lhcal
    created_at: "140326"
    price:
      amount: "1"
      denom: uakt
    state: open
  escrow_account:
    balance:
      amount: "50000000"
      denom: uakt
    id:
      scope: bid
      xid: akash1vn06ycjjnvsvl639fet9lajjctuturrtx7fvuj/140324/1/1/akash10cl5rm0cqnpj45knzakpa4cnvn5amzwp4lhcal
    owner: akash10cl5rm0cqnpj45knzakpa4cnvn5amzwp4lhcal
    settled_at: "140326"
    state: open
    transferred:
      amount: "0"
      denom: uakt
- bid:
    bid_id:
      dseq: "140324"
      gseq: 1
      oseq: 1
      owner: akash1vn06ycjjnvsvl639fet9lajjctuturrtx7fvuj
      provider: akash1f6gmtjpx4r8qda9nxjwq26fp5mcjyqmaq5m6j7
    created_at: "140326"
    price:
      amount: "1"
      denom: uakt
    state: open
  escrow_account:
    balance:
      amount: "50000000"
      denom: uakt
    id:
      scope: bid
      xid: akash1vn06ycjjnvsvl639fet9lajjctuturrtx7fvuj/140324/1/1/akash1f6gmtjpx4r8qda9nxjwq26fp5mcjyqmaq5m6j7
    owner: akash1f6gmtjpx4r8qda9nxjwq26fp5mcjyqmaq5m6j7
    settled_at: "140326"
    state: open
    transferred:
      amount: "0"
      denom: uakt
```

For this example, we will choose `akash10cl5rm0cqnpj45knzakpa4cnvn5amzwp4lhcal` Run this command to set the provider shell variable:

```
AKASH_PROVIDER=akash10cl5rm0cqnpj45knzakpa4cnvn5amzwp4lhcal
```

Verify we have the right value populated by running:

```
echo $AKASH_PROVIDER
```

- Create a Lease

Create a lease for the bid from the chosen provider above by running this command:

```
provider-services tx market lease create -dseq $AKASH_DSEQ -provider $AKASH_PROVIDER -from $AKASH_KEY_NAME
```

- Confirm the Lease

You can check the status of your lease by running:

```
provider-services query market lease list -owner $AKASH_ACCOUNT_ADDRESS -node $AKASH_NODE -dseq $AKASH_DSEQ
```

Note the bids will close automatically after 5 minutes, and you may get the response:

```
bid not open
```

If this happens, close your deployment and open a new deployment again. To close your deployment run this command:

```
provider-services tx deployment close -dseq $AKASH_DSEQ  -owner $AKASH_ACCOUNT_ADDRESS -from $AKASH_KEY_NAME
```

If your lease was successful you should see a response that ends with:

```
    state: active
```

{/* {% hint style="info" %} */}
Please note that once the lease is created, the provider will begin debiting your deployment's escrow account, even if you have not completed the deployment process by uploading the manifest in the following step.
{/* {% endhint %} */}

- Send the Manifest

Upload the manifest using the values from above step:

```
provider-services send-manifest deploy.yaml -dseq $AKASH_DSEQ -provider $AKASH_PROVIDER -from $AKASH_KEY_NAME
```

- Confirm the URL

Now that the manifest is uploaded, your image is deployed. You can retrieve the access details by running the below:

```
provider-services lease-status -dseq $AKASH_DSEQ -from $AKASH_KEY_NAME -provider $AKASH_PROVIDER
```

You should see a response similar to:

```javascript
{
  "services": {
    "web": {
      "name": "web",
      "available": 1,
      "total": 1,
      "uris": [
        "rga3h05jetf9h3p6dbk62m19ck.ingress.ewr1p0.mainnet.akashian.io"
      ],
      "observed_generation": 1,
      "replicas": 1,
      "updated_replicas": 1,
      "ready_replicas": 1,
      "available_replicas": 1
    }
  },
  "forwarded_ports": {}
}
```

You can access the application by visiting the hostnames mapped to your deployment. Look for a URL/URI and copy it to your web browser.

- View your logs

You can view your application logs to debug issues or watch progress like so:

```bash
provider-services lease-logs \
  -dseq "$AKASH_DSEQ" \
  -provider "$AKASH_PROVIDER" \
  -from "$AKASH_KEY_NAME"
```

- Update the Deployment

- Update the Manifest

Update the deploy.yaml manifest file with the desired change.

_**NOTE:**_\*\* Not all attributes of the manifest file are eligible for deployment update. If the hardware specs of the manifest are updated (I.e. CPU count), a re-deployment of the workload is necessary. Other attributes, such as deployment image and funding, are eligible for updates.

- Issue Transaction for On Chain Update

```
provider-services tx deployment update deploy.yaml -dseq $AKASH_DSEQ -from $AKASH_KEY_NAME
```

- Send Updated Manifest to Provider

```
provider-services send-manifest deploy.yaml -dseq $AKASH_DSEQ -provider $AKASH_PROVIDER -from $AKASH_KEY_NAME
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




