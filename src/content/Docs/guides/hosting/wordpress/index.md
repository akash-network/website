---
categories: ["Guides"]
tags: ["Hosting"]
weight: 1
title: "Deploying WordPress on Akash Network"
linkTitle: "WordPress"
---

## Guide to Create and Deploy a Custom and WordPress Website on Akash Network Using a Single SDL File

This guide provides step-by-step instructions to set up a custom and WordPress website and deploy it to Akash using a single SDL (Service Deployment Language) file. The SDL will configure a full installation environment, including the web server, database, and WordPress.

---

## Prerequisites
1. **Akash CLI installed**: Ensure you have the Akash CLI installed and configured.
2. **Akash account funded**: Your Akash wallet should have sufficient funds for deployment.
3. **Domain setup**: Optionally, set up a domain with DNS pointing to your Akash deployment.
4. **Docker familiarity**: Basic understanding of Docker containers as Akash uses containerized workloads.
5. **Akash SDL template**: Use a preconfigured SDL format for Akash deployments.

---

## Step 1: Write the SDL File

Below is an SDL file that includes both a WordPress installation and a MySQL database, deployed in a single setup.

```yaml
version: "2.0"

services:
  wordpress:
    image: wordpress:latest
    env:
      - WORDPRESS_DB_HOST=mysql:3306
      - WORDPRESS_DB_USER=wp_user
      - WORDPRESS_DB_PASSWORD=wp_password
      - WORDPRESS_DB_NAME=wp_database
    expose:
      - port: 80
        as: 80
        to:
          - global: true
    depends_on:
      - mysql
    resources:
      cpu:
        units: 0.5
      memory:
        size: 512Mi
      storage:
        size: 1Gi

  mysql:
    image: mysql:5.7
    env:
      - MYSQL_ROOT_PASSWORD=root_password
      - MYSQL_DATABASE=wp_database
      - MYSQL_USER=wp_user
      - MYSQL_PASSWORD=wp_password
    resources:
      cpu:
        units: 0.5
      memory:
        size: 512Mi
      storage:
        size: 1Gi

profiles:
  compute:
    wordpress:
      resources:
        cpu:
          units: 0.5
        memory:
          size: 512Mi
        storage:
          size: 1Gi
    mysql:
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
        region: global
      pricing:
        wordpress:
          denom: uakt
          amount: 100
        mysql:
          denom: uakt
          amount: 50

deployment:
  wordpress:
    akash:
      profile: wordpress
      count: 1
  mysql:
    akash:
      profile: mysql
      count: 1
```

---

## Step 2: Customize the SDL File

- **Database Credentials**: Update the environment variables in the SDL (`MYSQL_ROOT_PASSWORD`, `MYSQL_USER`, `MYSQL_PASSWORD`, etc.).
- **Storage Size**: Adjust the `storage.size` parameter for both services based on your expected website and database usage.
- **CPU and Memory**: Allocate appropriate `cpu` and `memory` resources depending on your workload.

---

## Step 3: Deploy to Akash Network

1. **Initialize Deployment**:
   ```bash
   provider-services tx deployment create <path_to_sdl_file> --from <your_wallet_address> --node <node_url> --chain-id <chain_id>
   ```

2. **Query Lease**:
   Find available providers and create a lease:
   ```bash
   provider-services query market lease list --owner <your_wallet_address>
   provider-services tx market lease create --dseq <deployment_sequence> --oseq <order_sequence> --gseq <group_sequence> --from <your_wallet_address>
   ```

3. **Verify Deployment**:
   Ensure the deployment is active and the services are running:
   ```bash
   provider-services vquery deployment get --owner <your_wallet_address> --dseq <deployment_sequence>
   ```

4. **Access the Website**:
   - Obtain the deployment's public IP or domain:
     ```bash
     provider-services query provider lease-status --owner <your_wallet_address> --dseq <deployment_sequence> --provider <provider_address>
     ```
   - Configure DNS to map your domain to the provided IP or access via the generated IP.

---

## Step 4: Complete WordPress Setup

1. Open the WordPress installation URL in your browser (`http://<deployment_ip>`).
2. Follow the on-screen instructions to:
   - Set up the admin account.
   - Configure the website title and language.
   - Complete the WordPress installation.

---

## Notes

- **File Persistence**: To retain WordPress and MySQL data across redeployments, use Akash’s persistent storage or configure external backups.
- **Domain Integration**: Use services like Cloudflare to easily point your domain to the Akash deployment.
- **Security**: Secure your deployment by:
  - Updating passwords.
  - Configuring HTTPS using reverse proxies like Traefik or Nginx.

---

This setup leverages a single SDL file for ease of deployment, ensuring the entire WordPress stack (web server + database) operates seamlessly on the Akash Network.