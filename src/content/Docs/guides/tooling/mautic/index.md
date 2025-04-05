---
categories: ["Guides"]
tags: ["Marketing Automation"]
weight: 1
title: "Mautic"
linkTitle: "Mautic"
---

To deploy **Mautic** (an open-source marketing automation platform) using the `mautic/mautic` Docker image on the **Akash Network**, you'll need to define an **SDL (Stack Definition Language)** file, configure your environment, and deploy the app. Below is a step-by-step guide:

---

### **1. Requirements**
- Install the Akash CLI on your system ([Guide](/docs/getting-started/quickstart-guides/akash-cli/)).
- Fund your Akash wallet with AKT tokens to pay for deployment costs.
- A domain name or Akash's automatically generated domain for accessing Mautic.
- Basic knowledge of Docker and Akash SDL configuration.

---

### **2. Create the SDL File**
The SDL file defines the deployment configuration for Mautic on Akash. Below is a sample `mautic.yml` file:

```
---
version: "2.0"

services:
  mautic:
    image: mautic/mautic:latest
    env:
      - MAUTIC_DB_HOST=mautic-db
      - MAUTIC_DB_USER=mautic
      - MAUTIC_DB_PASSWORD=mautic_password
      - MAUTIC_DB_NAME=mautic
    expose:
      - port: 80
        as: 80
        to:
          - global
    depends_on:
      - mautic-db

  mautic-db:
    image: mariadb:latest
    env:
      - MYSQL_ROOT_PASSWORD=root_password
      - MYSQL_DATABASE=mautic
      - MYSQL_USER=mautic
      - MYSQL_PASSWORD=mautic_password
    expose:
      - port: 3306
        as: 3306
        to:
          - mautic

profiles:
  compute:
    mautic-profile:
      resources:
        cpu:
          units: 1
        memory:
          size: 1Gi
        storage:
          size: 5Gi

  placement:
    akash:
      attributes:
        region: us-west # Choose a region
      pricing:
        mautic-profile:
          denom: uakt
          amount: 100

deployment:
  mautic:
    profile: mautic-profile
    count: 1
```

---

### **3. Key Configuration Notes**
- **Services:**
  - `mautic`: The Mautic container using the `mautic/mautic` image.
  - `mautic-db`: A MariaDB container to serve as the database backend.
- **Environment Variables:**
  - Adjust the `MYSQL_` and `MAUTIC_DB_` environment variables according to your needs.
- **Storage:**
  - The `storage` size for both `mautic` and `mautic-db` should be sufficient to handle your data needs.
- **Pricing:**
  - Modify the `amount` under `pricing` to match your budget.

---

### **4. Deploy Mautic on Akash**
1. **Initialize Deployment**:
   Save the `mautic.yml` file and deploy it with Akash CLI:
   ```
   akash tx deployment create mautic.yml --from <your_wallet_address>
   ```

2. **Bid and Lease**:
   After submitting the deployment, watch for bids and create a lease:
   ```
   akash query market bid list --owner <your_wallet_address>
   akash tx market lease create --dseq <deployment_sequence> --from <your_wallet_address>
   ```

3. **Access the Deployment**:
   Use Akash's automatically generated domain or map your custom domain using a CNAME record.

---

### **5. Post-Deployment**
- Visit the Mautic URL (e.g., `http://<akash_domain>`) and complete the setup wizard.
- Enter the database details matching your MariaDB container environment variables:
  - Host: `mautic-db`
  - Database: `mautic`
  - Username: `mautic`
  - Password: `mautic_password`

---

### **6. Customization (Optional)**
- To use SSL, set up a reverse proxy like **NGINX** or use services like **Cloudflare** for HTTPS.
- Scale resources by updating the `compute` section in the SDL file.

---

### **7. Updating Mautic**
If you need to update the Mautic version, modify the image in the SDL file and redeploy:
```
image: mautic/mautic:<new_version>
```

---

By following these steps, you can successfully deploy and manage **Mautic** on the Akash Network. 