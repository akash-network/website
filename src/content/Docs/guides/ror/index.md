---
categories: ["Guides"]
tags: ["Web Development", "Ruby on Rails", "Ruby", "Framework"]
weight: 1
title: "Deploying a Ruby on Rails App to Akash Network"
linkTitle: "Ruby on Rails"
---

This guide will walk you through the process of building and deploying a Ruby on Rails app on the Akash Network using both the Akash CLI and the Akash Console. 

## Step 1: Prepare Your Ruby on Rails Application

1. **Set Up Your App**:

    - Ensure your Rails app is ready for deployment:
        - Configure the database in `config/database.yml` for production use.
        - Precompile assets with:
        ```
        rails assets:precompile
        ```
        - Add a web server like Puma to your Gemfile if not already included:
        ```
        gem 'puma'
        ```
    - Create a `Dockerfile` for containerizing the app:
    ```
    FROM ruby:3.2
    RUN apt-get update -qq && apt-get install -y build-essential libpq-dev nodejs yarn
    WORKDIR /app
    COPY Gemfile* /app/
    RUN bundle install
    COPY . /app
    CMD ["bundle", "exec", "puma", "-C", "config/puma.rb"]
    ```
    - Build your Docker image:
    ```
    docker build -t my-rails-app .
    ```

2. **Push the Image to a Registry**:
Tag and push your image to a Docker registry like Docker Hub or GitHub Container Registry:
```
docker tag my-rails-app <your-registry>/<your-app>:latest
docker push <your-registry>/<your-app>:latest
```

## Step 2: Create the SDL File
The SDL file specifies resources, services, and pricing for your Akash deployment. Below is a sample `deploy.yaml`:
```
version: "2.0"

services:
  web:
    image: <your-registry>/<your-app>:latest
    env:
      - RAILS_ENV=production
    expose:
      - port: 3000
        as: 80
        to:
          - global: true

profiles:
  compute:
    web:
      resources:
        cpu:
          units: 0.5
        memory:
          size: 512Mi
        storage:
          size: 1Gi
  placement:
    default:
      attributes:
        host: akash
      pricing:
        web:
          denom: uakt
          amount: 1000

deployment:
  web:
    profile: web
    count: 1
```
Replace `<your-registry>/<your-app>:latest` with your Docker image's URL.

## Step 3: Deploy Using Akash CLI

1. Install Akash CLI:

    - Follow the official Akash CLI installation guide.

2. Create a Deployment:

    - Submit the SDL file:
    ```
    akash tx deployment create deploy.yaml --from <your-key-name> --chain-id akashnet-2 --node <node-url>
    ```
3. Bid for Resources:
    - Query active deployments and choose a provider:

    ```
    akash query market lease list --owner <your-address>
    ```

    - Create a lease:

    ```
    akash tx market lease create --owner <your-address> --dseq <deployment-sequence> --gseq 1 --oseq 1 --provider <provider-address> --from <your-key-name>
    ```
4. Upload Files:

    - Use akash provider send-manifest to send your manifest file:

    ``
    akash provider send-manifest deploy.yaml --dseq <deployment-sequence> --provider <provider-address> --from <your-key-name>
    ```

5. Access the App:

    - Query your deployment for the lease and endpoint:

        ```
        akash query market lease get --dseq <deployment-sequence> --provider <provider-address>
        ```

    - Visit the provided URL.

## Step 4: Deploy Using Akash Console

1. Access the Akash Console:
    - Open the [Akash Console](https://console.akash.network/).

2. Create a Deployment:
    - Upload your `deploy.yaml` file using the UI.
    - Select the desired provider and submit your deployment.

3. Monitor Deployment:
    - The console provides a user-friendly way to monitor deployment progress and access logs.

4. Get the Endpoint:
    -Once the deployment is live, the console will display the app's endpoint.
