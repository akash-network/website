---
categories: ["Guides"]
tags: ["Database", "NoSQL"]
weight: 1
title: "CouchDB"
linkTitle: "Apache CouchDB"
---

[Apache CouchDB](https://couchdb.apache.org/), often shortened to just "CouchDB", is an open-source NoSQL database that uses JSON to store data, JavaScript as its query language using MapReduce, and HTTP for its API. It’s known for its ease of use, scalability, and fault-tolerant replication capabilities, making it a popular choice for distributed applications.

## Setting Up Your Environment

Before deploying CouchDB on Akash, ensure you have the following prerequisites:

1. Akash Network Account: You should have an account on the Akash Network with sufficient AKT tokens to deploy the service.

2. [Akash CLI](/docs/getting-started/quickstart-guides/akash-cli/) or [Console](https://console.akash.network/) Access: Set up and configured on your machine.

3. Docker Knowledge: Familiarity with Docker is helpful.

## Creating the SDL File

Below is a sample SDL file to deploy CouchDB using the official Docker image:

```
---
version: "2.0"

services:
  couchdb:
    image: couchdb 
    env:
      - COUCHDB_USER=admin
      - COUCHDB_PASSWORD=password
    expose:
      - port: 5984
        as: 80
        to:
          - global: true

profiles:
  compute:
    couchdb:
      resources:
        cpu:
          units: 1.0
        memory:
          size: 1Gi
        storage:
          size: 1Gi
  placement:
    akash:
      attributes:
        host: akash
      signedBy:
        anyOf:
          - "akash1365yvmc4s7awdyj3n2sav7xfx76adc6dnmlx63"
          - "akash18qa2a2ltfyvkyj0ggj3hkvuj6twzyumuaru9s4"
      pricing:
        couchdb: 
          denom: uakt
          amount: 10000

deployment:
  couchdb:
    akash:
      profile: couchdb
      count: 1
```

- `services`: Defines the Docker image and port mapping.

- `profiles`: Specifies the compute resources required (CPU, memory, and storage).

- `deployment`: Sets the profile and instance count.

Save this file as `deploy.yaml`.


## Deploying CouchDB on Akash 

### Using the CLI

**Step 1: Authenticate with Akash**

First, authenticate your Akash account:

```
akash tx authz grant <spender> --msg-type <message-type> --from <your-account-name> --node <node-url>
```

Replace `<spender>`, `<message-type>`,` <your-account-name>`, and `<node-url>` with your specific values.

**Step 2: Create and Fund a Deployment**

Upload your `deploy.yaml` SDL file:

```
akash tx deployment create deploy.yaml --from <your-account-name>
```

Fund your deployment with AKT:

```
akash tx deployment deposit <deployment-id> <amount>uakt --from <your-account-name>
```

Wait for the deployment to be accepted by a provider.

**Step 3: Monitor and Access CouchDB**

Once the deployment is active, retrieve the access details:

```
akash query deployment get <deployment-id>
```

You’ll receive the public IP or domain for accessing CouchDB.

For a more detailed CLI deployment guide, refer to [Akash CLI Deployment Guide](/docs/getting-started/quickstart-guides/akash-cli/) on the Akash documentation site.

### Using the Console

If you prefer a UI-based approach, you can deploy CouchDB using the Akash Console:

1. Visit the [Akash Consol](https://console.akash.network/deployments)e.

2. Sign in with your Keplr wallet.

2. Upload your deploy.yaml SDL file in the "Create Deployment" section.

3. Configure the deployment settings (similar to the CLI method).

4. Submit the deployment and fund it with the required AKT.

5. Monitor the deployment status via the console interface.

For more detailed instructions, you can refer to the [Akash Console Guide](/docs/getting-started/quickstart-guides/akash-console/).

## Post-Deployment: Setting Up CouchDB

After your CouchDB instance is up and running:

1. **Access the CouchDB Dashboard**: 

- Use the IP or domain provided during the deployment.

- The default port for CouchDB is `5984`.

2. **Secure CouchDB**:

- CouchDB is insecure by default. Set up an admin user by running the following command:

```
curl -X PUT http://<your-ip>:5984/_node/_local/_config/admins/admin -d '"password"'
```
- Replace `<your-ip>` with your actual IP and `password` with your desired admin password.

3. **Verify Installation**:

Access the CouchDB dashboard by navigating to `http://<your-ip>:5984/_utils/`.

## Useful Resources

- [Official CouchDB Documentation](https://couchdb.apache.org/)

- [Akash CLI Documentation](/docs/getting-started/quickstart-guides/akash-cli/)

