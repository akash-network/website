---
categories: ["Guides"]
tags: ["Data Visualization"]
weight: 1
title: "Redash"
linkTitle: "Redash"
---


[Redash](https://redash.io/) is an open-source tool designed for data visualization and dashboard creation. It enables users to connect to various data sources, craft interactive dashboards, and generate visualizations for data analysis. With its intuitive interface, Redash allows users to query, visualize, and share data insights across an organization. Businesses can leverage Redash to create reports, charts, graphs, and dashboards, facilitating data-driven decision-making.

## Akash Console Deployment Setup

The provided [`deploy.yaml`](https://github.com/akash-network/awesome-akash/blob/master/Redash/deploy.yaml) file utilizes [IP leases](/docs/network-features/ip-leases) and [persistent storage](https://akash.network/docs/network-features/persistent-storage). If you are not receiving bids, consider removing one or both of these features.

Once deployed, access the deployment shell, select "redash," and execute the following commands in sequence:

```

bin/docker-entrypoint create_db
bin/docker-entrypoint server

```

- `create_db`: Initializes the necessary database schema for Redash.
- `server`: Launches the Redash web server, making the application accessible upon completion.

Expected outputs from these commands are provided below.

## Service Overview

- `redash/redash:10.0.0.b50363`: This image is used across several services, each explained below:

    - `redash`: The core web server for Redash, delivering the web application to users, managing interactions, and executing SQL queries.
    - `scheduler`: Manages scheduled tasks within Redash, ensuring background jobs run at predefined intervals.
    - `scheduled_worker`: Executes worker processes for scheduled queries and schema-related tasks.
    - `adhoc_worker`: Handles worker processes specifically for ad-hoc queries.
    - `worker`: A general-purpose worker process for various tasks.

- `redis:5.0-alpine`: Redis functions as a caching system and message broker, aiding in data caching, background job management, and real-time updates.

- `redash/nginx`: Nginx operates as a reverse proxy and web server for Redash, handling HTTP requests, load balancing, SSL termination, and serving static content. It directs traffic to the Redash web server and offers enhanced security and performance.

- `postgres:9.6-alpine`: PostgreSQL serves as the relational database backend for Redash, storing user data, query metadata, visualization configurations, and other application data.