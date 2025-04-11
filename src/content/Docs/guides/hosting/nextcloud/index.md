---
categories: ["Guides"]
tags: ["Hosting"]
weight: 1
title: "Nextcloud"
linkTitle: "Nextcloud"
---

Deploying Nextcloud on the Akash Network using the `provider-services` command involves several key steps, from setting up your environment to launching the Nextcloud application. Below is a comprehensive guide to assist you through this process.

**1. Install Akash Provider Services**

Begin by installing the Akash Provider Services CLI, which is essential for interacting with the Akash Network. On macOS, you can use Homebrew:

```bash
brew untap ovrclk/tap
brew tap akash-network/tap
brew install akash-provider-services
```


For Linux systems, execute the following commands:

```bash
cd ~/Downloads
curl -sfL https://raw.githubusercontent.com/akash-network/provider/main/install.sh | bash
sudo mv ./bin/provider-services /usr/local/bin
provider-services version
```


Ensure that the installation is successful by verifying the version. 

**2. Set Up an Akash Account**

Create an Akash account and fund it with AKT tokens to facilitate transactions on the network. Detailed instructions for account creation and funding can be found in the Akash documentation. 

**3. Prepare the Nextcloud Docker Image**

Nextcloud operates within a Docker container. You can either use an existing Nextcloud Docker image or build a customized one to suit your requirements. Ensure that the Docker image is accessible from a public registry, such as Docker Hub.

**4. Create the Deployment Configuration File**

Draft a deployment configuration file (SDL) that outlines the resources and parameters for your Nextcloud deployment. Below is an example configuration:

```yaml
version: '2.0'
services:
  nextcloud:
    image: nextcloud:24.0.5
    #https://hub.docker.com/_/nextcloud
    expose:
      - port: 80
        as: 80
        to:
          - global: true
    env:
      - MYSQL_PASSWORD=REPLACE_ME
      - MYSQL_DATABASE=nextcloud
      - MYSQL_USER=nextcloud
      - MYSQL_HOST=db
  db:
    image: mariadb:10.5
    expose:
      - port: 3306
        to:
          - service: nextcloud
    args:
      - --transaction-isolation=READ-COMMITTED
      - --binlog-format=ROW
    env:
      - MARIADB_DATABASE=nextcloud
      - MARIADB_PASSWORD=REPLACE_ME
      - MARIADB_USER=nextcloud
      - MARIADB_RANDOM_ROOT_PASSWORD=true
profiles:
  compute:
    nextcloud:
      resources:
        cpu:
          units: 2
        memory:
          size: 512Mi
        storage:
          - size: 16Gi
    db:
      resources:
        cpu:
          units: 1
        memory:
          size: 512Mi
        storage:
          - size: 8Gi
  placement:
    akash:
      #######################################################
      #Keep this section to deploy on trusted providers
      signedBy:
        anyOf:
          - "akash1365yvmc4s7awdyj3n2sav7xfx76adc6dnmlx63"
      #######################################################
      #Remove this section to deploy on untrusted providers
      #Miners: You can receive more bids from more providers by removing this section
      #Beware* You may have deployment, security, or other issues on untrusted providers
      #https://akash.network/docs/providers/audited-attributes
      pricing:
        nextcloud:
          denom: uakt
          amount: 10000
        db:
          denom: uakt
          amount: 10000
deployment:
  nextcloud:
    akash:
      profile: nextcloud
      count: 1
  db:
    akash:
      profile: db
      count: 1
```


Ensure you replace the environment variables with your actual database credentials and adjust resource allocations as needed.

**5. Deploy Nextcloud on Akash**

With your SDL file prepared, proceed to deploy Nextcloud using the Akash Provider Services CLI:

```bash
provider-services tx deployment create <path-to-your-sdl-file> --from <your-akash-account>
```


Monitor the deployment status and, once active, retrieve the service's endpoint to access your Nextcloud instance.

**6. Configure DNS and SSL (Optional but Recommended)**

For enhanced security and accessibility, configure a domain name and obtain an SSL certificate for your Nextcloud service. This can be achieved by setting up a reverse proxy with SSL termination.

By following these steps, you can successfully deploy Nextcloud on the Akash Network using the `provider-services` command. Ensure that you tailor the configurations to meet your specific requirements and maintain the security of your deployment. 