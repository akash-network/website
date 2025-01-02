---
categories: ["Guides"]
tags: ["Frameworks", "Python", "Flask"]
weight: 1
title: "Deploying a Flask App on Akash"
linkTitle: "Flask"
---

Here’s a step-by-step guide on how to create and deploy a Flask application on the Akash decentralized cloud using the sample SDL template. This guide assumes you have basic knowledge of Flask and are familiar with Docker and the Akash ecosystem.

## Prerequisites

1. **Install Akash CLI**: Ensure the Akash CLI (akash) is installed and configured on your system.
2. **Set Up Wallet**: Create an Akash wallet and fund it with AKT tokens.
4. **Docker Installed**: Have Docker installed for containerizing your Flask app.
5. **Basic Flask App**: Have a working Flask application.

## Step 1: Prepare Your Flask App

1. **Create a Flask App Structure**: Your Flask app should look something like this:

```
my-flask-app/
├── app/
│   ├── __init__.py
│   ├── routes.py
├── Dockerfile
├── requirements.txt
├── config.py
└── wsgi.py
```
2. **Create the Dockerfile**: Create a Dockerfile to containerize your application. Example:

```
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt

COPY . .

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "wsgi:app"]
```

3. **Install Dependencies Create a `requirements.txt` file with the necessary Flask dependencies:

```
Flask==2.3.2
gunicorn==21.2.0
```

## Step 2: Containerize the Application

1. **Build the Docker Image** In the project root directory, run:
```
docker build -t my-flask-app .
```
2. **Test Locally** Run the container to ensure it works:
```
docker run -p 5000:5000 my-flask-app
```

## Step 3: Prepare the SDL File

Below is a sample SDL template tailored for a Flask app:

```
version: "2.0"

services:
  flask-service:
    image: your-dockerhub-username/my-flask-app:latest
    expose:
      - port: 5000
        as: 80
        to:
          - global: true

profiles:
  compute:
    flask-compute:
      resources:
        cpu:
          units: 1
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
          - "akash1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
      pricing:
        flask-compute:
          denom: uakt
          amount: 100

deployment:
  flask-deployment:
    flask-service:
      profile: flask-compute
      count: 1
```

## Step 4: Push Your Docker Image

1. Tag Your Image

```
docker tag my-flask-app your-dockerhub-username/my-flask-app:latest
```

2. Push to DockerHub
```
docker push your-dockerhub-username/my-flask-app:latest
```

## Step 5: Deploy on Akash

1. **Create Deployment** Use the Akash CLI to create the deployment:
```
akash tx deployment create deploy.yaml --from <your-wallet-name> --node <node-url> --chain-id <chain-id> --fees 5000uakt
```
2. **Approve Lease** After creating the deployment, view bids:
```
akash query market bid list --owner <your-address>
```
Select a provider and approve the lease:
```
akash tx market lease create --dseq <deployment-sequence> --from <your-wallet-name> --provider <provider-address> --node <node-url> --chain-id <chain-id> --fees 5000uakt
```
3. **Access Your App** Once the lease is approved, Akash will provide an external URL or IP for accessing the deployed Flask app.

## Step 6: Verify Deployment
1. **Check Logs** To debug any issues:
```
akash logs --dseq <deployment-sequence> --gseq <group-sequence> --oseq <order-sequence>
```
2. **Test Application** Visit the external URL or IP in a browser to ensure the Flask app is running.

## Optional Enhancements

- **Enable HTTPS**: Use a reverse proxy like NGINX with SSL certificates.
- **Scaling**: Adjust the count in the deployment to scale the number of instances.
