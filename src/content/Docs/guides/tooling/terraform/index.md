---
categories: ["Guides"]
tags: ["Infrastructure-as-Code"]
weight: 1
title: "Terraform"
linkTitle: "Terraform"
---

## **1. Prerequisites**
Before deploying, ensure the following:
- **Akash CLI** is installed and configured.
- You have an Akash wallet funded with sufficient AKT tokens.
- Basic knowledge of writing SDL files for Akash deployments.

---

## **2. Create the Deployment SDL File**
Here's an example SDL file for deploying the `hashicorp/terraform` Docker image on Akash:

```
version: "2.0"

services:
  terraform:
    image: hashicorp/terraform:latest
    command: ["sh", "-c", "tail -f /dev/null"] # Keeps the container running
    expose:
      - port: 8080
        as: 80
        to:
          - global: true

profiles:
  compute:
    terraform:
      resources:
        cpu:
          units: 1
        memory:
          size: 512Mi
        storage:
          size: 1Gi

  placement:
    terraform:
      attributes:
        region: us-west # Change region as needed
      pricing:
        terraform:
          denom: uakt
          amount: 100 # Cost per block (adjust as needed)

deployment:
  terraform:
    terraform:
      profile: terraform
      count: 1
```

This SDL file:
- Uses the `hashicorp/terraform` Docker image.
- Exposes port 80 globally for potential HTTP-based services.
- Allocates 1 CPU unit, 512 Mi of memory, and 1 Gi of storage.

---

## **3. Deploy the SDL File on Akash**
1. **Validate the SDL file**:
   Run the following command to ensure the SDL file is valid:
   ```
   provider-services deployment validate <sdl-file-name>.yaml
   ```

2. **Create the Deployment**:
   Use the Akash CLI to create the deployment:
   ```
   provider-services tx deployment create <sdl-file-name>.yaml --from <account-name> --node <akash-node>
   ```

3. **View the Deployment Status**:
   Check the deployment status:
   ```
   provider-services query deployment list --owner <your-address>
   ```

4. **Accept a Bid**:
   Once a provider makes a bid, accept it:
   ```
   provider-services tx market lease create --dseq <deployment-sequence> --from <account-name>
   ```

5. **Get the Lease Information**:
   After accepting the bid, retrieve the lease details:
   ```
   provider-services query market lease list --owner <your-address>
   ```

---

## **4. Access the Terraform Container**
Once the deployment is live, you can access the `terraform` service.

1. **Retrieve Service Endpoint**:
   Get the service's public IP/endpoint:
   ```
   provider-services query market lease status --dseq <deployment-sequence>
   ```

2. **SSH or Use Akash Logs**:
   - If the container is running, you can connect using `kubectl exec` if you have a setup to manage pods.
   - Alternatively, tail logs:
     ```
     provider-services query deployment logs --dseq <deployment-sequence> --from <account-name>
     ```

---

## **5. Using Terraform in the Container**
To run Terraform commands inside the container:
1. **Use Akash's interactive shell** (if supported):
   ```
   provider-services exec run <lease-info>
   ```
2. Inside the container, initialize Terraform:
   ```
   terraform init
   ```
3. Apply a configuration:
   ```
   terraform apply
   ```
   Mount your configuration files using volume mounts, or copy the configuration into the container via interactive shell commands.

---

## **6. Monitoring and Managing the Deployment**
- Use `provider-services query deployment` commands to monitor deployment health and logs.
- Scale or update resources by modifying and re-deploying the SDL.

---

## **7. Terminate the Deployment**
When the deployment is no longer needed, close it to stop incurring costs:
```
provider-services tx deployment close --dseq <deployment-sequence> --from <account-name>
```

---

By following this guide, you can deploy and manage Terraform containers on Akash. Adjust the SDL as necessary for your specific Terraform usage scenario.