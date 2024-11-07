---
categories: ["Guides"]
tags: ["Frameworks"]
weight: 1
title: "HDeploying a Django App on Akash"
linkTitle: "Django"
---

This guide here would show you how to deploy a Django app to Akash using the Akash CLI or Console, along with a sample SDL (`deploy.yaml`) file. It assumes you already have a Django app, and are familiar with Docker.

## Prerequisites

1. **Install Docker**: Required to containerize the Django app.
2. **Install Akash CLI**: For command-line deployment.
3. **Akash Account & Wallet**: You'll need AKT tokens to deploy on the network.
4. **Akash Keystore**: Set up your Akash keystore using akash keys add <key-name> if you haven’t already.
5. **Akash Console (Optional)**: For a GUI-based deployment option.

## Create Your Docker Image

1. Set up a Dockerfile to containerize the application:

```
# Dockerfile for Django App
FROM python:3.10

WORKDIR /app
COPY . /app

RUN pip install -r requirements.txt

# Collect static files for Django
RUN python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "my_django_app.wsgi:application"]
```

replace `my_django_app` with the name of your app.

2. Build the Docker image:

```
docker build -t my_django_app .
```

## Step 2: Push the Image to a Container Registry

You need to push the Docker image to a registry that Akash can access (Docker Hub, GitHub Packages, or any public registry).

```
docker tag my_django_app <your-username>/my_django_app:latest
docker push <your-username>/my_django_app:latest
```

## Step 3: Create the SDL Deployment File (`deploy.yaml`)

Here’s a sample SDL file for deploying on Akash, based on your SDL template:

```
# deploy.yaml
version: "2.0"

services:
  web:
    image: "<your-username>/my_django_app:latest"  # Replace with your Docker image URL
    expose:
      - port: 8000
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
          size: 512Mi                       # Edit as needed
        storage:
          size: 1Gi                         # Edit as needed

  placement:
    westcoast:
      attributes:
        region: us-west
      signedBy:
        anyOf:
          - "akash1a...your-verified-provider"  # Replace with the provider's Akash address
      pricing:
        web:
          denom: uakt
          amount: 100  # Set your desired price in uakt

deployment:
  web:
    westcoast:
      profile: web
      count: 1
```

## Step 4: Deploy to Akash Using the CLI

1. **Initialize Deployment**:

```
akash tx deployment create deploy.yaml --from <your-key-name> --node <node> --chain-id <chain-id> --fees 5000uakt
```

2. **Wait for the Deployment to Match with a Provider**: Check for available providers using:

```
akash query market lease list --owner <your-address>
```






