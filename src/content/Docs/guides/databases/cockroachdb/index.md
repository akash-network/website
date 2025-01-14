---
categories: ["Guides"]
tags: ["Database", ]
weight: 1
title: "Guide to Deploy CockcroachDB on Akash "
linkTitle: "CockcroachDB"
---

## Deploying CockroachDB on Akash Network

This guide demonstrates how to deploy **CockroachDB**, a cloud-native distributed SQL database, on the **Akash Network**. Akash is a decentralized cloud computing platform where you can host containerized applications.

---

## Prerequisites
1. **Akash CLI**: Installed and configured with your wallet and access to testnet/mainnet.
2. **Docker**: To create a container for CockroachDB.
3. **CockroachDB Docker Image**: Official image from `cockroachdb/cockroach`.
4. **Akash SDL Template**: A pre-configured SDL file for deployment.

---

## Steps

### 1. Prepare the CockroachDB Deployment
CockroachDB can be run as a standalone instance or as a cluster. For this guide, we will deploy a single-node instance.

### 2. Write the SDL File
Create a file named `deploy.yaml` and add the following SDL configuration:

```
version: "2.0"

services:
  cockroachdb:
    image: cockroachdb/cockroach:v23.1.1 # Replace with the desired version
    expose:
      - port: 26257
        as: 26257
        to:
          - global: true # Expose to the public internet
      - port: 8080
        as: 8080
        to:
          - global: true
    args:
      - start-single-node
      - --insecure # For simplicity, remove this for production use

profiles:
  compute:
    cockroachdb:
      resources:
        cpu:
          units: 2
        memory:
          size: 2Gi
        storage:
          size: 10Gi

  placement:
    cockroachdb:
      pricing:
        cockroachdb: 
          denom: uakt
          amount: 100 # Specify your budget

deployment:
  cockroachdb:
    cockroachdb:
      profile: cockroachdb
      count: 1
```

### Explanation of the SDL File:
- **`image`**: The Docker image for CockroachDB.
- **`expose`**: Ports 26257 (SQL) and 8080 (Web UI) are exposed for access.
- **`args`**: Starts a single-node CockroachDB instance in insecure mode for simplicity.
- **`resources`**: Configures compute, memory, and storage requirements.
- **`pricing`**: Sets the budget in `uakt` (Akash tokens).

---

### 3. Deploy the SDL File
1. Open a terminal and deploy the SDL file using the Akash CLI:
   ```
   akash tx deployment create deploy.yaml --from <your_wallet> --node https://rpc.akash.network --chain-id <network_chain_id>
   ```
2. Wait for the deployment to initialize. You can monitor the status with:
   ```
   akash query deployment list --owner <your_wallet>
   ```

### 4. Access CockroachDB
- **SQL Port**: Access the SQL interface on `26257`.
- **Web UI**: Access the CockroachDB web UI on `8080` using the Akash-leased hostname.

   Example:
   ```
   http://<lease-hostname>:8080
   ```

---

### 5. Test and Verify
1. Use the `cockroach sql` command to connect:
   ```
   cockroach sql --url "postgresql://<lease-hostname>:26257?sslmode=disable"
   ```
2. Use the Web UI to verify that the database is running.

---

### 6. (Optional) Scaling to a Cluster
To deploy a multi-node CockroachDB cluster:
1. Adjust the SDL file to add additional nodes and define `--join` arguments for cluster setup.
2. Use a shared network for nodes.

---

### Notes
- Replace `--insecure` with SSL certificates for production deployments.
- Monitor resources to ensure your Akash deployment meets CockroachDB’s performance requirements.
- Use persistent storage configurations if required.

This deployment method leverages CockroachDB's containerized image and Akash's decentralized cloud for a cost-effective and distributed database solution.