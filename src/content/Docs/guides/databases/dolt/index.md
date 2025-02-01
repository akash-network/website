---
categories: ["Guides"]
tags: ["Database", "SQL", "Version Control"]
weight: 1
title: "Dolt"
linkTitle: "Dolt"
---

[Dolt](https://dolthub.com/) is a version-controlled SQL database that allows you to branch, merge, and collaborate on your database the same way you do with [Git](http://git-scm.com/). It's built for applications that require historical tracking, collaboration, and auditability.

## Prerequisites

1. Akash Network Account: You should have an account on the Akash Network with sufficient AKT tokens to deploy the service.

2. [Akash CLI](/docs/getting-started/quickstart-guides/akash-cli/) or [Console](https://console.akash.network/) Access: Set up and configured on your machine.

3. Docker Knowledge: Familiarity with Docker is helpful.

4. Dolt Installed: Check the [Dolt documentation](https://docs.dolthub.com/introduction) for instructions on how to install 

## Step 1: Setting Up Dolt

1. **Initialize the Dolt Database**: 

Before deploying, you may want to initialize a Dolt repository locally or use an existing one. You can skip this step if you're deploying a pre-configured database.

```

dolt init
dolt sql -q "CREATE TABLE example_table (id INT PRIMARY KEY, name VARCHAR(50));"
dolt add .
dolt commit -m "Initialized database with example table"

```

2. **Push Your Database to a Remote (Optional)**:

If you want to keep your database remote, you can push it to a DoltHub repository.

```

dolt remote add origin <your_dolthub_repo_url>
dolt push origin main

```

## Step 2: Creating the Akash Deployment File

You may modiy the following `deploy.yaml` file as you need:


```
version: "2.0"

services:
  dolt:
    image: dolthub/dolt:latest
    expose:
      - port: 3306
        as: 3306
        to:
          - global: true
    env:
      - DOLT_ENABLE_VERSIONING=true
      - DOLT_PASSWORD=<your_password>

profiles:
  compute:
    dolt:
      resources:
        cpu:
          units: 0.5
        memory:
          size: 1024Mi
        storage:
          size: 5Gi
  placement:
    any:
      attributes:
        host: akash
      signedBy:
        anyOf:
          - "akash1365yvmc4s7awdyj3n2sav7xfx76adc6dnmlx63"
      pricing:
        dolt:
          denom: uakt
          amount: 2000

deployment:
  dolt:
    any:
      profile: dolt
      count: 1

```

## Step 3: Deploying to Akash

You may deploy to Akash either via the CLI or the Console

### Deploying via Akash CLI

1. Initialize Your Akash Deployment:
```
provider-services tx deployment create deploy.yaml -from $AKASH_KEY_NAME
```

2. Check the Deployment Status:

```
provider-services lease-status -dseq $AKASH_DSEQ -from $AKASH_KEY_NAME -provider $AKASH_PROVIDER
```

Make sure your deployment is active and ready.

3. Get Access to Your Database:

Once the deployment is live, you'll receive an endpoint (IP address and port) where the Dolt database is accessible. You can connect using any MySQL client or the Dolt CLI.

### Deploying via Akash Console

1. Log in to the Akash Console:

- Go to the [Akash Console](https://console.akash.network/).

- Connect your wallet and fund it with a minimum of 5 AKT if necessary.

2. Upload the `deploy.yaml` File:

- Navigate to the "Deployments" section.

- Click on the "Deploy" button.

- Upload the `deploy.yaml` file.

- Follow the prompts to submit and deploy your service.

3. Monitor Deployment:

 - Use the Console to monitor the status and logs of your deployment.

- Once the deployment is active, the Dolt database will be accessible at the provided endpoint.

## Step 4: Managing Your Dolt Database

- Connecting to Dolt:

Use the IP address and port from the Akash deployment to connect:

```
dolt sql-server -H <akash_endpoint_ip> -P 3306 -u dolt -p <your_password>
```

- Running SQL Queries:

```
dolt sql -q "SELECT * FROM example_table;"
```

## References

1. [Akash CLI Deployment Guide](/docs/getting-started/quickstart-guides/akash-cli/)

2. [Akash Console Deployment Guide](/docs/getting-started/quickstart-guides/akash-console/)

3. [Dolt Documentation](https://docs.dolthub.com/)


