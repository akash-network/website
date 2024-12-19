---
categories: ["Guides"]
tags: ["Apps", "Photo Management",]
weight: 1
title: "Deploying PhotoPrism on Akash"
linkTitle: "PhotoPrism"
---


### **What is PhotoPrism?**
PhotoPrism is a self-hosted AI-powered photo management solution. It allows users to organize, browse, and share their photo collections using modern technology like TensorFlow for image classification and facial recognition. Features include:

- **Automatic Organization:** Tagging, categorization, and duplicate detection.
- **Privacy-Oriented:** Self-hosted to ensure your photos remain private.
- **Powerful Search:** Use keywords, locations, or metadata to find images quickly.
- **AI Capabilities:** Facial recognition, object detection, and more.

It is a popular choice for individuals who want to manage their photo libraries without relying on cloud platforms like Google Photos.

---

## **Steps to Deploy PhotoPrism on Akash**

---

### **Prerequisites**
1. **Akash CLI Installed**: Ensure you have the Akash command-line interface installed and configured. You should have an account with sufficient $AKT tokens.
2. **SDL Template**: The deployment requires an SDL (Service Definition Language) file for specifying deployment details.
3. **Akash Wallet**: Your wallet should be funded with $AKT to pay for the deployment.

---

### **1. Create a Storage Volume**
PhotoPrism requires persistent storage to save photos and metadata. Create a storage volume on Akash using Akash's persistent storage feature.

```
---
version: "2.0"

services:
  photoprism:
    image: photoprism/photoprism
    env:
      PHOTOPRISM_ADMIN_PASSWORD: "yourpassword"
      PHOTOPRISM_DEBUG: "true"
    expose:
      - port: 2342
        as: 80
        to:
          - global
    resources:
      cpu:
        units: 1000m
      memory:
        size: 512Mi
      storage:
        size: 10Gi
    profiles:
      compute:
        - "aksh-default"
    placement:
      attributes:
        region: us-west
      signedBy:
        anyOf:
          - "akash1..."
profiles:
  compute:
    aksh-default:
      resources:
        cpu:
          units: 1000m
        memory:
          size: 512Mi
        storage:
          size: 10Gi
deployment:
  photoprism:
    profile: aksh-default
    count: 1
```

---

### **2. Update the SDL File**

1. Replace `PHOTOPRISM_ADMIN_PASSWORD` with a secure admin password.
2. Adjust the `storage` size according to your photo library requirements.
3. Update the `region` under the `placement` section if you prefer a specific geographic location for your deployment.
4. Save the file as `deploy.yaml`.
---

### **3. Deploy PhotoPrism on Akash**

1. **Validate the SDL File:**

   Run the following command to validate your SDL file:
   ```
   akash tx deployment create --from <wallet_name> --node <akash_node_url>
   ```

2. **Submit the Deployment:**

   After validation, submit your deployment to the Akash network:
   ```
   akash tx deployment create deploy.yaml
   ```

3. **Query Deployment Status:**

   Check the status of your deployment:
   ```
   akash query deployment list --owner <wallet_address>
   ```

---

### **4. Access the PhotoPrism Web Interface**

1. After the deployment is successful, note the external endpoint provided by Akash.
2. Open a browser and navigate to `http://<external_endpoint>` to access the PhotoPrism UI.
3. Log in using the admin credentials set in the SDL file.

---

### **5. Upload and Organize Photos**

- Upload your photos to PhotoPrism via the web interface.
- Let the AI-powered system analyze and organize your photo library.

---

## **Customizing PhotoPrism**

- **Environment Variables:** Adjust configurations like storage paths, database options, or feature toggles by modifying the environment variables in the SDL file.
- **Resource Scaling:** Increase or decrease CPU, memory, or storage resources in the SDL file based on your needs.

---

### **Costs**
The cost of deploying PhotoPrism on Akash will depend on:
- CPU and memory resources allocated.
- Storage volume size.
- Rental prices on Akash's marketplace.

To estimate costs, query the Akash marketplace for current bids:
```
akash query market bid list
```

---

By deploying PhotoPrism on Akash, you get a secure, private, and scalable solution to manage your photo library efficiently without relying on centralized cloud services.