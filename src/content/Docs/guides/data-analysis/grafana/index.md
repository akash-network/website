---
categories: ["Guides"]
tags: ["Data Visualization"]
weight: 1
title: "Grafana"
linkTitle: "Grafana"
---

Here’s a step-by-step guide for deploying Grafana on Akash using the **grafana/grafana** Docker image:

---

### **Step 1: Install Akash CLI**
Ensure you have the Akash CLI installed and configured. Follow [Akash CLI installation documentation](/docs/getting-started/quickstart-guides/akash-cli/) to set up the CLI and connect to your wallet.

---

### **Step 2: Prepare Your SDL File**
Create a file named `deploy.yaml` to define your deployment configuration.

```
---
version: "2.0"

services:
  grafana:
    image: grafana/grafana:latest
    env:
      - GF_SECURITY_ADMIN_USER=admin        # Grafana Admin Username
      - GF_SECURITY_ADMIN_PASSWORD=admin   # Grafana Admin Password
    expose:
      - port: 3000
        as: 80
        to:
          - global

profiles:
  compute:
    grafana:
      resources:
        cpu:
          units: 0.5
        memory:
          size: 512Mi
        storage:
          size: 1Gi

  placement:
    akash:
      attributes:
        region: us-west # Choose an Akash region
      pricing:
        grafana:
          denom: uakt
          amount: 1000 # Price in Akash tokens

deployment:
  grafana:
    grafana:
      profile: grafana
      count: 1
```

### **Explanation of Key Parameters:**
- **Image**: `grafana/grafana:latest` is the official Grafana Docker image.
- **Environment Variables**: `GF_SECURITY_ADMIN_USER` and `GF_SECURITY_ADMIN_PASSWORD` are used to set up the Grafana admin credentials.
- **Expose**: Expose port 3000 (Grafana’s default) to port 80 for external access.
- **Resources**: Allocate 0.5 CPUs, 512Mi memory, and 1Gi storage.
- **Pricing**: Adjust pricing based on your budget and network bids.

---

### **Step 3: Validate the SDL File**
Run the following command to ensure your SDL file is valid:

```
provider-services validate deploy.yaml
```

---

### **Step 4: Create a Deployment**
Submit the deployment to the Akash network:

```
provider-services tx deployment create deploy.yaml --from <your-wallet-name> --node <akash-node-url>
```

### **Step 5: Bid Selection**
Once your deployment is live, select a bid:

```
provider-services query market lease list --owner <your-wallet-address> --node <akash-node-url>
```

Identify a suitable bid and accept it:

```
provider-services tx market lease create --owner <your-wallet-address> --dseq <deployment-sequence> --oseq <order-sequence> --gseq <group-sequence> --provider <provider-address> --from <your-wallet-name>
```

---

### **Step 6: Access Your Deployment**
1. Get the access details from your provider:

   ```
   provider-services provider lease-status --dseq <deployment-sequence> --gseq <group-sequence> --oseq <order-sequence> --provider <provider-address> --from <your-wallet-name>
   ```

2. Note the `Service URI` for the Grafana service (e.g., `http://<provider-ip>:<port>`).

3. Open the URL in your browser and log in using the admin credentials you specified in the SDL file (`admin/admin` in this example).

---

### **Step 7: Secure Your Grafana Instance**
1. Update your admin password for security.
2. Configure HTTPS using a reverse proxy or Akash’s ingress configurations if required.

---

### **Step 8: (Optional) Add Persistent Storage**
To make your Grafana setup persistent:
1. Use decentralized storage solutions like Filecoin or Storj.
2. Update your SDL file to include persistent volume mounts \.

---

### Example Persistent Storage SDL Snippet:
```
profiles:
  compute:
    grafana:
      resources:
        cpu:
          units: 0.5
        memory:
          size: 512Mi
        storage:
          size: 5Gi # Adjust based on your Grafana storage needs
      persistent_storage:
        - mount: /var/lib/grafana
          class: default
```

---

### **Step 9: Monitor and Scale Your Deployment**
Monitor Grafana logs and resource usage via Akash’s CLI:

```
akash provider lease-logs --dseq <deployment-sequence> --gseq <group-sequence> --oseq <order-sequence> --provider <provider-address> --from <your-wallet-name>
```

Scale your deployment if needed by modifying the `count` parameter in the SDL file or increasing resources (CPU/memory).

---

By following this guide, you’ll have a fully operational Grafana instance running on Akash’s decentralized cloud! Let me know if you need further assistance.
