---
categories: ["Guides"]
tags: ["AI/ML", "Training", "Framework"]
weight: 1
title: "Machine Learning Environments"
linkTitle: "Machine Learning Environments"
---

## **Overview**

The **nielsborie/machine-learning-environments** Docker image provides a preconfigured environment for machine learning development, containing tools and frameworks such as TensorFlow, PyTorch, Jupyter Notebook, and more. Deploying it on **Akash**, a decentralized cloud computing platform, will allow you to host and utilize this machine-learning environment at a lower cost and with high scalability.

---

## **Steps to Deploy on Akash**

### 1. **Set Up Akash Environment**
   - Install the Akash CLI.
   - Fund your wallet with $AKT tokens to cover deployment costs.

### 2. **Write the SDL File**
   Create a deployment SDL (Service Definition Language) file to describe the service. Below is an example SDL tailored for deploying the `nielsborie/machine-learning-environments` Docker image:

   ```yaml
   version: "2.0"
   services:
     machine-learning:
       image: nielsborie/machine-learning-environments
       expose:
         - port: 8888 # For Jupyter Notebook
           as: 80
           to:
             - global: true
         - port: 6006 # TensorBoard
           as: 6006
           to:
             - global: true
   profiles:
     compute:
       machine-learning:
         resources:
           cpu:
             units: 2 # Number of CPU units
           memory:
             size: 4Gi # Memory allocation
           storage:
             size: 20Gi # Storage for ML datasets
     placement:
       akash:
         attributes:
           host: akash
         pricing:
           machine-learning:
             denom: uakt
             amount: 1000 # Cost in uAKT per block
   deployment:
     machine-learning:
       akash:
         profile: machine-learning
         count: 1
   ```

### 3. **Upload Datasets or Notebooks**
   Use Akash’s persistent storage options or integrate an external cloud storage solution (e.g., S3-compatible storage) to store your datasets or ML notebooks.

### 4. **Submit Deployment**
   - Deploy the environment using the Akash CLI:
     ```bash
     provider-services tx deployment create <your-sdl-file>.yaml --from <your-wallet>
     ```
   - Verify your deployment:
     ```bash
     provider-services query deployment list --owner <your-address>
     ```

### 5. **Access the Environment**
   - Once deployed, you’ll get the **endpoint URL**. Use this to access Jupyter Notebook or other tools within the container.
   - For Jupyter, open your browser and navigate to `http://<endpoint-url>:80`.

### 6. **Monitor and Scale**
   - Use Akash CLI or Akashlytics dashboard to monitor resource usage.
   - Scale the environment by modifying the SDL file and redeploying.

---

## **Benefits of Akash Deployment**
1. **Cost-Effective**: Decentralized compute is generally cheaper than traditional cloud platforms.
2. **Customizability**: Modify the SDL file to adjust resources or add services as needed.
3. **Scalability**: Add nodes or scale resources easily.
4. **Decentralization**: Leverage Akash's censorship-resistant infrastructure for hosting ML workloads.

---

This deployment provides a fully operational machine-learning environment accessible from any browser while taking advantage of Akash's decentralized infrastructure for cost savings and flexibility. 