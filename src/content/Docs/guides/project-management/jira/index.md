---
categories: ["Guides"]
tags: ["Project Management"]
weight: 3
title: "Deploying Jira on Akash"
linkTitle: "Jira"
---

# 

This guide will walk you through deploying Atlassian Jira Software on the Akash decentralized cloud.

## Prerequisites

Before deploying, ensure you have:
- Akash CLI installed (Installation Guide)
- Akash wallet with sufficient funds
- Domain name (optional but recommended)

## Step 1: Configure the Deployment File

Create a file named `deploy.yaml` and add the following content:

```yaml
---
version: "2.0"

services:
  jira:
    image: atlassian/jira-software:latest
    expose:
      - port: 8080
        as: 80
        to:
          - global: true

profiles:
  compute:
    jira:
      resources:
        cpu:
          units: 1.0
        memory:
          size: 512Mi
        storage:
          size: 1Gi
  placement:
    akash:
      attributes:
        host: akash
      signedBy:
        anyOf:
          - "akash1365yvmc4s7awdyj3n2sav7xfx76adc6dnmlx63"
      pricing:
        jira:
          denom: uakt
          amount: 10000

deployment:
  jira:
    akash:
      profile: jira
      count: 1
```

## Step 2: Deploy to Akash

1. **Create a Deployment**  
   Run the following command to create a deployment:
   ```
    provider-services tx deployment create deploy.yaml --from <your-wallet-name> --chain-id <your-chain-id>
   ```
   Replace `<your-wallet-name>` and `<your-chain-id>` accordingly.

2. **Check Deployment Status**  
   After submission, check the status:
   ```
    provider-services query deployment list --owner <your-wallet-address>
   ```

3. **Accept a Bid**  
   Once a provider offers resources, accept the bid:
   ```
    provider-services tx deployment lease create --owner <your-wallet-address> --dseq <deployment-sequence> --from <your-wallet-name>
   ```

4. **Get the Lease Information**  
   Retrieve the lease details:
   ```
    provider-services query lease list --owner <your-wallet-address>
   ```

5. **Access Jira**  
   Once the deployment is active, obtain the external URL:
   ```
    provider-services query lease status --owner <your-wallet-address> --dseq <deployment-sequence>
   ```
   Look for the assigned public IP or domain name, then navigate to `http://<your-ip>` in your browser to access Jira.

## Step 3: Configure Jira

Upon accessing Jira:
- Follow the setup wizard.
- Configure database settings if needed.
- Set up an administrator account.
- Start using Jira!

## Troubleshooting

If the deployment fails, check logs:
```bash
provider-services query deployment status --owner <your-wallet-address> --dseq <deployment-sequence>
```
- Ensure your wallet has enough uakt tokens for bidding.
- If Jira is inaccessible, confirm the global exposure settings in `deploy.yaml`.

## Conclusion

You have successfully deployed Jira on Akash! This setup allows for decentralized and cost-effective hosting of your project management software.