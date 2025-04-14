---
categories: ["Guides"]
tags: ["Network"]
weight: 3
title: "Owncloud"
linkTitle: "Owncloud"
---

### Deploy OwnCloud on Akash Network

This guide provides step-by-step instructions to deploy OwnCloud on Akash.

#### Prerequisites
- Installed Akash CLI
- An Akash wallet with sufficient funds


### Step 1: Create the SDL (Stack Definition Language) File

Create a file named `deploy.yaml` and add the following content:

```yaml
version: "2.0"
services:
  owncloud:
    image: owncloud/server:10.15.2
    expose:
      - port: 8080
        as: 80
        to:
          - global: true
    env:
      - OWNCLOUD_TRUSTED_DOMAINS=*
      - OWNCLOUD_ADMIN_USERNAME=admin
      - OWNCLOUD_ADMIN_PASSWORD=adminpassword
      - OWNCLOUD_DB_TYPE=sqlite
profiles:
  compute:
    owncloud:
      resources:
        cpu:
          units: 1.0
        memory:
          size: 2Gi
        storage:
          size: 10Gi
  placement:
    provider-services:
      pricing:
        owncloud:
          denom: uakt
          amount: 1000
deployment:
  owncloud:
    provider-services:
      profile: owncloud
      count: 1
```

### Step 2: Deploy on Akash

1. **Create a deployment**  
   Run the following command to create a deployment:
   ```
   provider-services tx deployment create deploy.yaml --from <your-wallet-name> --chain-id <provider-services-chain-id> --node <provider-services-node>
   ```

2. **Query the deployment status**
   ```
   provider-services query market lease list --owner <your-wallet-address>
   ```
   Identify the `lease_id` from the output and use it to get lease details:
   ```
   provider-services query market lease get --owner <your-wallet-address> --dseq <deployment-sequence-number>
   ```

3. **Get the provider's IP address**  
   Once the lease is active, get the provider's endpoint:
   ```
   provider-services provider service-status --provider <provider-address> --dseq <deployment-sequence-number>
   ```

4. **Access OwnCloud**  
   Navigate to `http://<provider-ip>` in your browser and log in using the credentials specified in `deploy.yaml`.

### Step 3: Manage and Update OwnCloud

- To update OwnCloud, modify `deploy.yaml` and redeploy.
- Ensure database storage persists across updates by using an external database instead of SQLite.
- Regularly back up important data.

### Conclusion

You have successfully deployed OwnCloud on Akash! You can now use it as a self-hosted cloud storage solution.