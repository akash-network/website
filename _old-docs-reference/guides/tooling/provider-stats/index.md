---
categories: ["Guides"]
tags: ["Dashboard"]
weight: 3
title: "Akash Provider Node Utilization Dashboard"
linkTitle: "Provider Utilization Dashboard"
---


The [Akash Provider Utilization Dashboard](https://github.com/Zblocker64/provider-stats) has three pods with three diffrent services:

1. **Periodic Shell Script:** This script runs at a configurable frequency, making a gRPCurl request to a server with reflection enabled. It retrieves the current provider utilization data and stores the JSON response in a database.
2. **NoSQL Database (CouchDB):** This database stores the server utilization logs (in JSON format) retrieved by the shell script.
3. **Web Application:** This app features a dashboard that displays the daily average utilization of resources such as CPU, GPU, memory, and storage.


## Getting Started

These instructions will guide you through deploying this project using the [Akash Console](https://console.akash.network).



### Deploying

You will need an Akash wallet with at least 0.5 AKT. You can use any deployment tool of your choice. This guide uses the [Akash Console](https://console.akash.network), but you can also the [Akash CLI](/docs/deployments/akash-cli/overview/).

#### Environment Variables

- `COUCHDB_USER` - The admin username for CouchDB.
- `COUCHDB_PASSWORD` - The password for the CouchDB admin user.
- `COUCHDB_URL` - The URL for CouchDB, eg., "http://admin:password@couchdb:5984"
- `COUCHDB_DB_NAME` - The name of the database.
- `COUCHDB_DESIGN_DOC` - The database design document.
- `COUCHDB_CPU_VIEW` - The database index for CPU data.
- `COUCHDB_GPU_VIEW` - The database index for GPU data.
- `COUCHDB_MEMORY_VIEW` - The database index for memory data.
- `COUCHDB_STORAGE_VIEW` - The database index for storage data.
- `PROVIDER_URL` - The URL from which the service will pull data.

**Note:**  

 When changing the COUCHDB_USER and COUCHDB_PASSWORD values, update them in the environment variables for both containers.

 #### Volumes

- `couchdb_data`: This is where CouchDB persists its data.

### Accessing the Applications

**CouchDB**

To access the CouchDB UI, navigate to the URL provided by the [Akash Console](https://console.akash.network) in your web browser. Log in with the `COUCHDB_USER` and `COUCHDB_PASSWORD` configured in your environment variables. Add `/_utils/` to the end of your URL.

![](../../../assets/provider-stats1.png)

**Flask App**

Your Flask application will be available at the URL provided by the [Akash Console](https://console.akash.network). You can also set a custom domain as specified in the SDL.

![](../../../assets/provider-stats2.png)

**gRPC Poller**

This service depends on CouchDB and performs periodic polling. Adjust the interval by setting the `REQUEST_INTERVAL` environment variable. No further access is required after deployment.

### Persistent Data

The composition uses named volumes to ensure your data persists across container restarts.

### Troubleshooting

Deployment should be straightforward, but if the database does not initialize correctly and no data appears on your web dashboard, follow these steps:

1. Log into the database using the provided DB URL.
2. Log in with your username and password.
3. Navigate to the setup tab.
4. Select "single node" and re-enter your username and password.

This should resolve the issue, and data should appear within 15 minutes.



