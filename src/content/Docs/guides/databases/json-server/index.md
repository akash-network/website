---
categories: ["Guides"]
tags: ["Database"]
weight: 1
title: "JSON Server"
linkTitle: "JSON Server"
---


[JSON Server](https://json-server.dev/) is a simple, yet powerful tool for setting up a REST API with a mock database using JSON files.

## Prerequisites

1. **Akash Wallet and AKT Tokens:** You'll need an Akash wallet with some AKT tokens to deploy your service.

2. **Akash CLI**: Install the Akash CLI to interact with the network. Alternatively, you can deploy via the [Akash Console](https://console.akash.network)

## Prepare the Akash Deployment

This is assuming you would be using the [Akash CLI](/docs/getting-started/quickstart-guides/akash-cli/). 

1. Create a deployment YAML file:

Download and edit the YAML file [here](https://github.com/akash-network/awesome-akash/blob/master/json-server/deploy.yaml).

2. Deploy the application:

```

akash tx deployment create deploy.yml --from <your-akash-account> --node https://rpc-akash.chain-1.com --chain-id akashnet-2 --fees 5000uakt

```

3. View deployment status:


```

akash query deployment get <deployment-id>


```

4. Access the JSON Server:

Once your deployment is active, the output will provide an IP address or domain where your JSON Server can be accessed. You can navigate to http://<your-akash-endpoint> in your web browser to interact with the API.

## Verify and Interact with the JSON Server

To verify everything is working, you can use curl or simply navigate to the endpoint provided:

```

curl http://<your-akamai-endpoint>/posts

```

This should return the contents of your `db.json` file.







