---
categories: ["Guides"]
tags: ["CI/CD", "DevOps"]
weight: 1
title: "Jenkins"
linkTitle: "Jenkins"
---



## Prerequisites
1. **Akash CLI**: Ensure the Akash CLI (`akash`) is installed and configured on your machine.
2. **Akash Account**: You should have an active Akash account with sufficient tokens to fund the deployment.
3. **Akash Wallet**: The wallet must be configured with an active keypair.
4. **Docker Knowledge**: Familiarity with the `jenkins/jenkins` Docker image.
5. **Akash SDL Template**: Use your existing SDL template as the base for the deployment.

---

## Step 1: Create the `deploy.yaml` File
Below is an example `deploy.yaml` file for deploying Jenkins on Akash using the `jenkins/jenkins` Docker image. Replace placeholders (`<...>`) with your details.

```yaml
---
version: "2.0"

services:
  jenkins:
    image: jenkins/jenkins:lts
    expose:
      - port: 8080
        as: 80
        accept:
          - http
        to:
          - global
      - port: 50000
        as: 50000
        accept:
          - tcp
        to:
          - global
    env:
      - JAVA_OPTS=-Djenkins.install.runSetupWizard=false
    args:
      entrypoint: ["/bin/tini", "--", "/usr/local/bin/jenkins.sh"]

profiles:
  compute:
    jenkins:
      resources:
        cpu:
          units: 2
        memory:
          size: 2Gi
        storage:
          size: 10Gi
  placement:
    akash:
      attributes:
        host: akash
      pricing:
        jenkins:
          denom: uakt
          amount: 100

deployment:
  jenkins:
    jenkins:
      profile: jenkins
      count: 1
```

---

## Step 2: Validate the SDL File
Before deploying, validate the SDL file to ensure correctness.

```bash
provider-services tx deployment create deploy.yaml --from <your-wallet-name> --chain-id <chain-id> --node <node-url> --fees <fee>
```

---

## Step 3: Deploy to Akash
1. **Create the Deployment**:
   Use the Akash CLI to deploy the `jenkins/jenkins` service.

   ```bash
   provider-services tx deployment create deploy.yaml --from <wallet-name> --chain-id <chain-id> --node <node-url> --fees <fee>
   ```

2. **Check Deployment Status**:
   After deploying, monitor the status to ensure it’s active.

   ```bash
   provider-services query deployment list --owner <your-wallet-address>
   ```

3. **Bid Matching**:
   Accept a bid for your deployment if necessary.

   ```bash
   provider-services tx market lease create --owner <your-wallet-address> --dseq <deployment-sequence> --oseq <order-sequence> --gseq <group-sequence> --from <wallet-name> --fees <fee>
   ```

---

## Step 4: Access Jenkins
1. **Retrieve the Lease Information**:
   Obtain the external IP and ports for accessing Jenkins.

   ```bash
   provider-services query market lease list --owner <your-wallet-address>
   ```

2. **Login to Jenkins**:
   - Access Jenkins via the provided external IP (e.g., `http://<external-ip>:80`).
   - Follow the initial Jenkins setup if required or use the `JAVA_OPTS` configuration in the `deploy.yaml` to skip the setup wizard.

---

## Step 5: Secure Jenkins
1. **Set Up an Admin User**:
   - Once Jenkins is running, create an admin user to secure your instance.
2. **Install Plugins**:
   - Install necessary plugins via the Jenkins dashboard.
3. **Configure Firewall Rules**:
   - Use Akash’s security groups or your infrastructure to limit access to Jenkins.

---

## Notes
1. **Data Persistence**:
   Ensure that the `storage` size specified in the SDL file is sufficient to store Jenkins data.
2. **Scaling**:
   Modify the `deployment` section in the SDL file to scale the Jenkins instance if needed.
3. **Budget Management**:
   Monitor your wallet balance to ensure uninterrupted service.

This guide ensures you can deploy Jenkins efficiently while leveraging Akash's decentralized cloud services. Let me know if you need help with any specific step!