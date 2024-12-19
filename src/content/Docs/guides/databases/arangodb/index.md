---
categories: ["Guides"]
tags: ["Database", "SQL", "Version Control"]
weight: 1
title: "Guide to Deploy ArangoDB on Akash Network"
linkTitle: "ArangoDB"
---


##**Overview of ArangoDB**

ArangoDB is a powerful, multi-model database that supports key-value, document, and graph data models. It is open-source and designed for scalability, high performance, and flexibility. Its capabilities include:

- **Multi-Model Database**: Combines key-value, document, and graph database functionalities in a single engine.
- **AQL (ArangoDB Query Language)**: A highly expressive SQL-like query language.
- **High Availability**: Supports replication and sharding for distributed setups.
- **Built-in Graph Processing**: Ideal for applications requiring relationship analysis.

Deploying ArangoDB on **Akash Network**, a decentralized cloud platform, leverages its cost efficiency and distributed infrastructure to host a resilient and scalable database setup.

---

## **Sample SDL for ArangoDB Deployment on Akash**

Here is an example SDL (Stack Definition Language) file to deploy ArangoDB on the Akash Network:

```yaml
---
version: "2.0"

services:
  arangodb:
    image: arangodb:latest
    env:
      - ARANGO_ROOT_PASSWORD=changeme # Set the root password
    expose:
      - port: 8529
        as: 80
        to:
          - global

profiles:
  compute:
    arangodb:
      resources:
        cpu:
          units: 0.5
        memory:
          size: 1Gi
        storage:
          size: 5Gi
  placement:
    westcoast:
      attributes:
        region: us-west
      signedBy:
        anyOf:
          - akash1qqlx6... # Replace with the provider's address
      pricing:
        arangodb:
          denom: uakt
          amount: 100

deployment:
  arangodb:
    westcoast:
      profile: arangodb
      count: 1
```

---

## **Steps to Deploy ArangoDB on Akash**

1. **Install Akash CLI**
   Ensure you have the Akash CLI installed and configured on your machine. Follow the [official Akash CLI installation guide](#) if you haven’t already.

2. **Create the SDL File**
   Copy the above SDL into a file named `deploy.yml`. Customize the environment variables, such as `ARANGO_ROOT_PASSWORD`, and ensure the `placement` section reflects the regions and providers you wish to deploy to.

3. **Validate the SDL**
   Run the following command to ensure your SDL file is valid:
   ```bash
   akash validate deploy.yml
   ```

4. **Send the Deployment to Akash**
   Deploy your application by creating a deployment:
   ```bash
   akash tx deployment create deploy.yml --from <account-name> --chain-id <chain-id> --node <node-url>
   ```
   Replace `<account-name>`, `<chain-id>`, and `<node-url>` with your Akash account details.

5. **Bid Acceptance**
   Monitor bids for your deployment and accept a provider’s bid:
   ```bash
   akash query market bid list --owner <your-address>
   akash tx market lease create --owner <your-address> --dseq <dseq-id> --from <account-name>
   ```

6. **Access Your Deployment**
   After accepting the bid and starting the deployment, retrieve the deployment's endpoint:
   ```bash
   akash query deployment get <deployment-id>
   ```
   Access ArangoDB via the public endpoint on port `80` (or the port you specified in the SDL).

7. **Secure Your Database**
   - Use a strong password for `ARANGO_ROOT_PASSWORD`.
   - Restrict access by deploying a reverse proxy or firewall configuration to limit exposure of the database.

---

## **Scaling and Customization**

To scale your deployment:
- Increase the `count` value in the deployment section for multiple instances.
- Adjust `cpu`, `memory`, and `storage` resources under the `compute` profile to meet your application's requirements.

---

## **Troubleshooting**

1. **Logs**: Retrieve logs from your deployment:
   ```bash
   akash tx deployment logs <deployment-id>
   ```

2. **Issues with Bids**: Ensure sufficient funds are deposited into your Akash wallet.

3. **Connectivity Issues**: Check if your deployment is correctly exposing ports and if the provider is reachable.

---

By deploying ArangoDB on Akash, you can utilize decentralized cloud infrastructure to build highly available and scalable applications at a fraction of the cost of traditional cloud providers.