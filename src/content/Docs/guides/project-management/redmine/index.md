---
categories: ["Guides"]
tags: ["Project Management"]
weight: 3
title: "Redmine"
linkTitle: "Redmine"
---

Here’s a guide on deploying Redmine on Akash. This guide will walk you through deploying Redmine, an open-source project management software, on the Akash Network. We’ll create and deploy a Redmine container, configure persistent storage, and set up the required services.

## Prerequisites

- **Akash CLI**: Install the Akash CLI by following the instructions in the [Akash documentation](https://akash.network/docs).

## Steps to Deploy Redmine

1. **Create a provider-services Deployment**  
   We’ll use the Akash CLI to define the deployment. Create a YAML file that defines the Redmine service, including the Docker image and storage requirements.  
   Create a `deploy.yaml`:
   ```yaml
   version: "2.0"

services:
  db:
    image: mysql:5.7
    env:
        - MYSQL_ROOT_PASSWORD=12345
        - MYSQL_DATABASE=redmine
    expose:
      - port: 3306
        as: 3306
        to:
          - service: db
  
  redmine:
    image: redmine
    depends-on:
        - db
    env:
        - REDMINE_DB_MYSQL=db
        - REDMINE_DB_USERNAME=root
        - REDMINE_DB_PASSWORD=12345
    expose:
      - port: 3000
        as: 80
        to:
          - global: true

profiles:
  compute:
    db:
      resources:
        cpu:
          units: 1.0
        memory:
          size: 512Mi
        storage:
          size: 512Mi
    
    redmine:
      resources:
        cpu:
          units: 1.0
        memory:
          size: 512Mi
        storage:
          size: 1Gi
          
  placement:
    akash:    
      attributes:
        host: akash
      signedBy:
        anyOf:
          - "akash1365yvmc4s7awdyj3n2sav7xfx76adc6dnmlx63"
      pricing:
        db: 
          denom: uakt
          amount: 10000
        redmine: 
          denom: uakt
          amount: 10000

deployment:
  db:
    akash:
      profile: db
      count: 1
  redmine:
    akash:
      profile: redmine
      count: 1
   ```

2. **Configure Persistent Storage**  
   Redmine requires persistent storage for data, so we’ll create a persistent volume.  
   Run the following command:  
   ```bash
   provider-services volume create redmine-volume --size 10Gi --provider <your-provider>
   ```
   Make sure to replace `<your-provider>` with the correct provider name.

3. **Deploy Redmine with provider-services**  
   Now, deploy Redmine using the provider-services CLI. Run the command to submit the `redmine-deployment.yaml` to Akash:  
   ```bash
   provider-services deploy --file redmine-deployment.yaml --provider <your-provider>
   ```
   This will deploy the Redmine service and map the appropriate ports. The command will provide feedback on the deployment status, including the public IP where Redmine is accessible.

4. **Access Redmine**  
   After deployment, you can access Redmine through the IP address provided in the deployment output. Open your browser and navigate to:  
   ```
   http://<public-ip>:3000
   ```
   Replace `<public-ip>` with the IP address from the deployment output.

5. **Set Up MySQL Database (Optional)**  
   You’ll need a MySQL database for Redmine. You can either set up a MySQL server yourself or use a pre-configured container.  
   To deploy a MySQL container on Akash, create a separate deployment YAML for MySQL and link it to Redmine by updating the `REDMINE_DB_MYSQL` and `REDMINE_DB_PASSWORD` environment variables in the Redmine YAML.

6. **Scaling and Monitoring**  
   To scale your Redmine deployment or monitor the services, use the following commands with provider-services:  
   Scale the deployment:  
   ```bash
   provider-services scale --deployment redmine-deployment --replicas <number-of-replicas>
   ```
   Monitor the deployment:  
   ```bash
   provider-services logs --deployment redmine-deployment
   ```

7. **Cleanup**  
   To remove the Redmine deployment from Akash, use the provider-services CLI to delete the services and volumes:  
   ```bash
   provider-services delete --deployment redmine-deployment
   provider-services volume delete --name redmine-volume
   ```
   This will delete the deployment and clean up associated resources.

## Conclusion  
You’ve successfully deployed Redmine on the Akash network using the provider-services command. Now you can manage your projects with Redmine in a decentralized environment. Be sure to explore Akash's scalability options to meet the demands of your application.