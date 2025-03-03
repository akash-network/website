---
categories: ["Guides"]
tags: ["Data Visualization"]
weight: 1
title: "KNIME"
linkTitle: "KNIME"
---

To deploy KNIME (an open-source data analytics platform) on Akash, we’ll guide you through the steps to create a `deploy.yaml` file, leveraging Akash’s SDL template structure. This file will specify the configuration for deploying KNIME as a Docker container on Akash’s decentralized cloud infrastructure.

## Prerequisites

1. **Akash Wallet**: Ensure you have an Akash wallet and sufficient tokens for deployment.
2. **Akash CLI**: Install and configure the Akash CLI.
3. **Dockerized KNIME Image**: You’ll need a Docker image of KNIME. You can either build your own or use a pre-built image from Docker Hub.

## Step 1: Define the deploy.yaml file Structure

Akash SDL (Service Definition Language) files are structured YAML files used to specify resources and configurations for your deployment. Below is a sample `deploy.yaml` file that includes a configuration to deploy KNIME on Akash.

### `deploy.yaml` File

Here’s a structured `deploy.yaml` file for deploying KNIME on Akash:

```
---
version: "2.0"

services:
  knime:
    image: "knime/knime"  # Docker image for KNIME
    expose:
      - port: 8080
        as: 80
        to:
          - global: true   # Allow global access to KNIME UI
        proto: tcp

profiles:
  compute:
    knime-server:
      resources:
        cpu:
          units: 1      # Adjust CPU units as needed
        memory:
          size: 2Gi     # Allocate at least 2GB of memory for KNIME
        storage:
          size: 5Gi     # Allocate storage space
  placement:
    west-coast:
      attributes:
        host: akash       # Provider attribute
      pricing:
        knime-server:
          denom: uakt
          amount: 100     # Specify the bid price per block

deployment:
  knime:
    west-coast:
      profile: knime-server
      count: 1
```

## Step 2: Configure Each Section

1. **Services Section**:

- Define the `knime` service and specify the Docker image for KNIME.
- Set up port `8080` (or the port KNIME uses) to be exposed globally so it’s accessible via a web interface.

2. **Profiles Section**:

- The compute profile outlines the hardware resources.
    - CPU Units: Define the number of CPU units.
    - Memory Size: Allocate memory (at least 2Gi for KNIME).
    - Storage Size: Set storage size based on data needs.
- The placement profile allows you to specify the deployment region and pricing details.

3. **Deployment Section**:

- Here, you reference the profiles and regions you defined.
- Set the profile (`knime`) and the count (1 instance for this example).

## Step 3: Deploy on Akash

1. **Create the Deploymen**t:

- Use the Akash CLI to submit your deployment:

```
provider-services tx deployment create deploy.yaml --from <wallet_name> --node <node>
```

2. **Set Up Lease**:

- Once deployed, create a lease with the provider to make your service accessible:
```
provider-services tx deployment lease create <deployment-id> --from <wallet_name> --node <node>
```

3. **Access KNIME**:

- After successful deployment, retrieve the lease’s public IP and navigate to <public-ip>:80 to access the KNIME interface.

## Notes and Tips
- **Pricing**: Set the amount for `uakt` tokens based on network costs.
- **Memory & Storage**: Adjust resource allocations depending on the complexity of workflows in KNIME.
- **Monitoring**: Monitor deployment status using the Akash CLI to ensure successful setup and to check resource usage.

This `deploy.yaml` file should give you a solid starting point for deploying KNIME on Akash with adjustable resources and configuration for custom setups. 

