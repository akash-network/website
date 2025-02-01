---
categories: ["Guides"]
tags: ["Data Visualization"]
weight: 1
title: "Matomo"
linkTitle: "Matomo"
---


Below is a guide on how to deploy **Matomo**, a powerful web analytics platform, on Akash Network.


## **Step 1: Install Prerequisites**
Before deploying, ensure you have:
1. **Akash CLI**: Installed and configured.
2. **Account Balance**: Sufficient AKT tokens in your wallet.
3. **Docker**: Installed locally for testing your Matomo deployment.
4. **Domain or Static IP**: For accessing Matomo after deployment.

---

## **Step 2: Prepare the SDL File**
Here’s a sample SDL file for deploying Matomo. It uses an Nginx web server and a MySQL-compatible database (MariaDB).

### **deploy.yaml**
```
---
version: "2.0"

services:
  matomo:
    image: matomo:latest
    env:
      - MATOMO_DATABASE_HOST=mariadb
      - MATOMO_DATABASE_USERNAME=matomo
      - MATOMO_DATABASE_PASSWORD=yourpassword
      - MATOMO_DATABASE_DBNAME=matomo
    expose:
      - port: 80
        as: 80
        to:
          - global: true
    depends_on:
      - mariadb

  mariadb:
    image: mariadb:10.5
    env:
      - MYSQL_ROOT_PASSWORD=rootpassword
      - MYSQL_DATABASE=matomo
      - MYSQL_USER=matomo
      - MYSQL_PASSWORD=yourpassword
    expose:
      - port: 3306
        as: 3306
        to:
          - service: matomo

profiles:
  compute:
    matomo-profile:
      resources:
        cpu:
          units: 1
        memory:
          size: 512Mi
        storage:
          size: 2Gi
    mariadb-profile:
      resources:
        cpu:
          units: 1
        memory:
          size: 1Gi
        storage:
          size: 5Gi

  placement:
    default:
      attributes:
        region: us-west
      signedBy:
        anyOf:
          - akash1provideraddress...
      pricing:
        matomo-profile:
          denom: uakt
          amount: 100
        mariadb-profile:
          denom: uakt
          amount: 100

deployment:
  matomo:
    profile: matomo-profile
    count: 1
  mariadb:
    profile: mariadb-profile
    count: 1
```

---

## **Step 3: Steps to Deploy**

### **1. Customize the SDL**
- Replace `yourpassword` and `rootpassword` with secure passwords.
- Update the `region` under `placement` if required.
- Adjust `pricing` values to match your budget.

### **2. Validate the SDL File**
Run the following command to validate the SDL file:
```
provider-services deployment sdl validate deploy.yaml
```

### **3. Create the Deployment**
Create the deployment using:
```
provider-services tx deployment create deploy.yaml --from <your_wallet> --chain-id <chain_id> --node <node_url>
```

### **4. Bid for Deployment**
Wait for providers to submit bids and select a provider:
```
provider-services tx market lease create --dseq <deployment_sequence> --oseq 1 --gseq 1 --from <your_wallet>
```

### **5. Retrieve Lease Information**
After the lease is created, get the lease information:
```
provider-services query market lease list --owner <your_address>
```

### **6. Access Matomo**
Once deployed:
1. Retrieve the service URL or IP using:
   ```
   provider-services provider service-status --provider <provider_address> --dseq <deployment_sequence> --from <your_wallet>
   ```
2. Configure your domain (if applicable) to point to the service's external IP.

3. Visit the URL to complete Matomo setup.

---

## **Step 4: Complete the Matomo Setup**
1. Navigate to the Matomo web interface using the URL or IP.
2. Follow the on-screen instructions to set up:
   - Database details:
     - Host: `mariadb`
     - Database: `matomo`
     - User: `matomo`
     - Password: Your chosen password.
3. Finish the installation and start using Matomo.

---

## **Optional Enhancements**
- **TLS/SSL**: Use tools like [Certbot](https://certbot.eff.org/) with an Nginx reverse proxy.
- **Backup**: Set up periodic backups for the database and configuration files.

---

You have now successfully deployed Matomo on Akash Network!