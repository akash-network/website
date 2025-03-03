---
categories: ["Guides"]
tags: ["User Management"]
weight: 1
title: "JetBrains Hub"
linkTitle: "JetBrains Hub"
---


## **Step 1: Prerequisites**

Before you begin, ensure the following:

1. You have an active Akash wallet and some AKT tokens for deployment.
2. The `akash` CLI is installed and configured.
3. Docker is installed for testing the JetBrains Hub container locally (optional but recommended).

---

## **Step 2: Test JetBrains Hub Locally**

To verify that the Docker image works as expected:

```
docker run -d -p 8080:8080 jetbrains/hub
```

Access JetBrains Hub at `http://localhost:8080` in your browser. Follow the initial setup wizard if necessary.

---

## **Step 3: Create an SDL Template**

Here's a sample SDL template for deploying JetBrains Hub on Akash. Replace placeholders with appropriate values, such as your wallet address.

### `deploy.yaml`
```
---
version: "2.0"

services:
  hub:
    image: jetbrains/hub:latest
    expose:
      - port: 8080
        as: 80
        to:
          - global: true
    env:
      - HUB_BASE_URL=https://your-hub-domain.com
      - HUB_BACKUP_DIR=/data/backups
    args:
      - /bin/bash
    command:
      - -c
      - "java -jar /opt/hub/hub.jar"

profiles:
  compute:
    hub:
      resources:
        cpu:
          units: 500m
        memory:
          size: 1Gi
        storage:
          size: 5Gi
  placement:
    hub:
      attributes:
        host: akash
      signedBy:
        anyOf:
          - "akash1yourwalletaddress"
      pricing:
        hub:
          denom: uakt
          amount: 100

deployment:
  hub:
    hub:
      profile: hub
      count: 1
```

---

## **Step 4: Deployment Steps**

1. **Validate the SDL File**  
   Run the following command to ensure your SDL file is correctly formatted:
   ```
   provider-services validate deploy.yaml
   ```

2. **Create a Deployment**  
   Use the Akash CLI to create a deployment:
   ```
   provider-services tx deployment create deploy.yaml --from <wallet_name> --node https://rpc.akash.forbole.com:443 --chain-id akashnet-2
   ```

3. **Wait for Bidding**  
   Monitor the status of your deployment using:
   ```
   provider-services query market lease list --owner <your_wallet_address>
   ```

   Once a bid is matched, you'll need to approve it.

4. **Approve the Lease**  
   Approve the lease using:
   ```
   provider-services tx market lease create <deployment_id> --from <wallet_name>
   ```

5. **Retrieve Access Details**  
   After deployment, find the public IP of your service:
   ```
   provider-services query market lease status --dseq <deployment_id>
   ```

   Look for the service URI under the `services` section.

---

## **Step 5: Configure JetBrains Hub**

1. Access the JetBrains Hub URL using the public IP or domain assigned by Akash.
2. Complete the setup wizard by configuring the database, admin account, and other settings.

---

## **Optional: Backup and Persistent Data**

If you want to enable persistent backups for your JetBrains Hub instance:

- Mount a volume to `/data/backups` in the SDL file.
- Use Akash's persistent storage (requires configuring storage profiles).

---

This guide deploys JetBrains Hub on Akash in a scalable, cost-effective way. Let me know if you need further assistance!