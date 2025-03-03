---
categories: ["Guides"]
tags: ["API",]
weight: 1
title: "Guide to Deploy Kong on Akash"
linkTitle: "Kong"
---

Kong is a scalable, open-source API gateway and service mesh designed to manage, secure, and monitor APIs and microservices. It offers essential features like load balancing, authentication, rate limiting, caching, and logging, making it highly effective for modern applications such as containerized, cloud-native, and microservices architectures.

Deploying Kong on Akash enables you to take advantage of a decentralized cloud platform to lower hosting costs while ensuring high availability.

---

## Step 1: Prepare Your Kong Deployment Files

To deploy Kong on Akash, you must create a Service Deployment Language (SDL) file that specifies how to deploy your application, including its resource requirements and container configuration.

Here's a sample SDL file for deploying Kong on Akash.

---

## Sample SDL File

```yaml
version: "2.0"

services:
  kong:
    image: kong:latest
    expose:
      - port: 8000
        as: 80
        to:
          - global
      - port: 8443
        as: 443
        to:
          - global
    env:
      KONG_DATABASE: "off"
      KONG_PROXY_ACCESS_LOG: "/dev/stdout"
      KONG_PROXY_ERROR_LOG: "/dev/stderr"
      KONG_ADMIN_ACCESS_LOG: "/dev/stdout"
      KONG_ADMIN_ERROR_LOG: "/dev/stderr"
      KONG_PROXY_LISTEN: "0.0.0.0:8000, 0.0.0.0:8443 ssl"
      KONG_ADMIN_LISTEN: "0.0.0.0:8001, 0.0.0.0:8444 ssl"
    resources:
      cpu:
        units: 0.5
      memory:
        size: 512Mi
      storage:
        size: 1Gi

profiles:
  compute:
    kong-profile:
      resources:
        cpu:
          units: 0.5
        memory:
          size: 512Mi
        storage:
          size: 1Gi
  placement:
    kong-placement:
      attributes:
        region: us-west
      pricing:
        kong:
          denom: uakt
          amount: 5000

deployment:
  kong-deployment:
    profile:
      compute: kong-profile
      placement: kong-placement
    count: 1
```

---

## Step 2: Validate the SDL File

Before you can deploy, make sure your SDL file is valid:

1. Save the SDL file as `deploy.yaml`.
2. Validate the SDL file using the Akash CLI:
   ```bash
    provider-services tx deployment validate deploy.yaml
   ```

---

## Step 3: Deploy Kong on Akash

1. **Submit the Deployment**  
   Deploy the SDL file with the Akash CLI:
   ```bash
   provider-services tx deployment create deploy.yaml --from <your-account>
   ```

2. **Monitor Deployment Status**  
   To check the status of your deployment:
   ```bash
   provider-services query deployment list --owner <your-address>
   ```

3. **Accept a Bid**  
   When a provider bids on your deployment, accept that bid:
   ```bash
   provider-services tx deployment lease create --from <your-account> --dseq <deployment-sequence> --oseq <order-sequence> --gseq <group-sequence> --provider <provider-address>
   ```

4. **Access Kong**  
   After the deployment has been activated, retrieve the access details (IP and port) for your Kong API Gateway by querying the lease:
   ```bash
   provider-services query lease status --owner <your-address> --provider <provider-address> --dseq <deployment-sequence>
   ```

---

## Step 4: Test Kong Deployment

To ensure Kong is operational:

1. Access the Kong API Gateway using the provided IP and port.
2. Test the default proxy at port 80 or 443.
3. Check the Kong Admin API, which is typically available on port 8001 or 8444.

---

## Step 5: Manage and Update Deployment

- **Update Deployment:** Adjust your `deploy.yaml` file and redeploy using the same commands.
- **Stop Deployment:** To cancel your lease and stop the deployment:
  ```bash
  provider-services tx deployment close --from <your-account> --dseq <deployment-sequence>
  ```

---

By deploying Kong on Akash, you can enjoy the benefits of a decentralized, cost-effective network without sacrificing the powerful API management capabilities Kong offers.

