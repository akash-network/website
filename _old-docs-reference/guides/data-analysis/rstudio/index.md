---
categories: ["Guides"]
tags: ["Data Analysis"]
weight: 1
title: "RStudio"
linkTitle: "RStudio"
---

## Prerequisites

1. **Akash Account**: Ensure you have an Akash account with sufficient AKT to deploy.
2. **Akash CLI**: Install the Akash CLI, which you'll use to interact with the Akash Network.
3. **SDL Template**: Ensure you have the SDL template you previously shared.

## Step-by-Step Deployment

1. **Modify the SDL Template for RStudio**

Update your SDL template with the necessary configuration to deploy RStudio. Here’s an example of how the SDL template might look:

```
version: "2.0"

services:
  rstudio:
    image: "rocker/rstudio"  # RStudio's official Docker image
    env:
      - PASSWORD=<set_a_secure_password>
    expose:
      - port: 8787   # Default RStudio port
        as: 80       # Map to a publicly accessible port if needed
        proto: tcp
        to:
          - global: true

profiles:
  compute:
    rstudio:
      resources:
        cpu:
          units: 500m
        memory:
          size: 1Gi
        storage:
          size: 1Gi

  placement:
    westcoast:
      attributes:
        region: us-west
      signedBy:
        anyOf:
          - akash
      pricing:
        rstudio:
          denom: uakt
          amount: 100  # Adjust according to your budget and requirements

deployment:
  rstudio:
    westcoast:
      profile: rstudio
      count: 1
```

Replace `<set_a_secure_password>` with a secure password of your choice. This will be the password for the RStudio instance.

2. **Deploy the SDL Template on Akash**

- Save the modified SDL file (e.g., deploy-rstudio.yaml).

- In your terminal, navigate to the directory containing this SDL file.

- Run the following command to initialize the deployment:

```
provider-services tx deployment create deploy-rstudio.yaml --from <your-akash-wallet> --chain-id <chain-id> --node <node-url>
```

3. **Monitor the Deployment**

- Use Akash’s CLI commands to check the status of your deployment.
- Once it is deployed, note the external IP and port provided for the service.

4. **Access RStudio**

- Open a browser and navigate to http://<external-ip>:80.
- Log in with the username rstudio and the password you set earlier.

## Additional Tips

- **Storage and Memory**: You may need to adjust the `memory` and `storage` configurations in the SDL file depending on your workload.
- **Security**: For production deployments, consider securing the deployment with SSL or limiting access.