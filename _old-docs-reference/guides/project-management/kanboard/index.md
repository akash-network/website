---
categories: ["Guides"]
tags: ["Project Management"]
weight: 3
title: "Kanboard"
linkTitle: "Kanboard"
---

Here's a guide on how to deploy Kanboard on Akash using provider-services.

### Prerequisites
- **Install Docker**: Ensure you have Docker installed on your machine.
- **Create an Akash wallet**: Fund it with $AKT to facilitate deployments.

### Step 1: Prepare the SDL File
1. Create a file named `deploy.yaml` with the following content:

```yaml
---
version: "2.0"

services:
  kanboard:
    image: kanboard/kanboard:v1.2.8
    expose:
      - port: 80
        as: 80
        to:
          - global: true

profiles:
  compute:
    kanboard:
      resources:
        cpu:
          units: 1.0
        memory:
          size: 512Mi
        storage:
          size: 512Mi
  placement:
    akash:
      attributes:
        host: akash
      signedBy:
        anyOf:
          - "akash1365yvmc4s7awdyj3n2sav7xfx76adc6dnmlx63"
      pricing:
        kanboard: 
          denom: uakt
          amount: 10000

deployment:
  kanboard:
    akash:
      profile: kanboard
      count: 1
```

### Step 2: Deploy Using provider-services
2. Run the following command to submit your deployment:

```bash
provider-services tx deployment create deploy.yaml
```

### Step 3: Check Deployment Status
3. To monitor the status of your deployment, use:

```bash
provider-services query deployment list
```
Once the deployment is active, retrieve the service endpoint with:

```bash
provider-services query deployment get <deployment-id>
```

### Step 4: Access Kanboard
4. Use the provided endpoint to access Kanboard in your web browser.

### Step 5: Cleanup (If Needed)
5. If you need to close the deployment, run:

```bash
provider-services tx deployment close <deployment-id>
```

### Conclusion
You have successfully deployed Kanboard on Akash using provider-services. You can now start managing your projects using your decentralized cloud-hosted Kanboard instance!