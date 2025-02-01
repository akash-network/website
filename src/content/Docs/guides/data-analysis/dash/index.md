---
categories: ["Guides"]
tags: ["Data Visualization"]
weight: 1
title: "Dash"
linkTitle: "Dash"
---

[Dash](https://dash.plotly.com) is an open-source web framework for Python that enables you to build interactive web applications, typically for data visualization, using Plotly. It's particularly useful for creating complex dashboards with minimal coding effort.

## Prepare Your Dash App

Make sure you have a Dash app ready and Dockerized. If not, you can use the official Docker image for Dash by Plotly. Here’s a simple example of a Dash app:

```
# app.py
import dash
import dash_core_components as dcc
import dash_html_components as html

app = dash.Dash(__name__)

app.layout = html.Div(children=[
    html.H1(children='Hello Dash'),
    dcc.Graph(
        id='example-graph',
        figure={
            'data': [
                {'x': [1, 2, 3], 'y': [4, 1, 2], 'type': 'bar', 'name': 'SF'},
            ],
            'layout': {
                'title': 'Dash Data Visualization'
            }
        }
    )
])

if __name__ == '__main__':
    app.run_server(debug=True)
```

You can create a Dockerfile to containerize this app:

```
# Dockerfile
FROM python:3.8-slim

WORKDIR /app

COPY app.py /app/
RUN pip install dash

CMD ["python", "app.py"]
```

Build your Docker image locally:

```
docker build -t my-dash-app .
```

## Create Your Akash Deployment YAML

To deploy to Akash, you need an SDL file. Here’s a sample `deploy.yml`:

```
version: "2.0"

services:
  web:
    image: my-dash-app:latest
    expose:
      - port: 8050
        as: 80
        to:
          - global: true

profiles:
  compute:
    web:
      resources:
        cpu:
          units: 0.1
        memory:
          size: 512Mi
        storage:
          size: 512Mi
  placement:
    westcoast:
      attributes:
        host: akash
      signedBy:
        anyOf:
          - "akash1365yvmc4s7awdyj3n2sav7xfx76adc6dnmlx63"
      pricing:
        web:
          denom: uakt
          amount: 1000

deployment:
  web:
    westcoast:
      profile: web
      count: 1

```

## Deploy to Akash

Before deploying your app on Akash, ensure you have the following prerequisites:

1. Akash Network Account: You should have an account on the Akash Network with sufficient AKT tokens to deploy the service.

2. [Akash CLI](/docs/getting-started/quickstart-guides/akash-cli/) or [Console](https://console.akash.network/) Access: Set up and configured on your machine.

### Using Akash CLI

1. Deploy the App:

```
provider-services tx deployment create deploy.yml --from your-wallet --chain-id your-chain-id
```

2. Monitor Deployment:

```
provider-services query deployment list
```

3. Get Service URL: After deployment, you can find your service URL and access your Dash app.

### Deploy Using Akash Console

1. Log in to [Akash Console](https://console.akash.network): Go to the Akash Dashboard and connect your wallet.

2. Create a New Deployment:

- Navigate to the "Deployments" section.

- Upload your deploy.yml file.
- Follow the instructions to complete the deployment.

3. Monitor: Check the status of your deployment through the console.

4. Access: Once the deployment is live, you can access your Dash app via the provided URL.




