---
title: "Akash and Filebase Replace S3 with Multi-Cloud dWeb Providers"
description: A core goal of the decentralized web, also known as dWeb, is to help people and organizations regain control of their computing and storage.

pubDate: "2021-07-27"
draft: false

categories:
  - News
tags:
  - Developers
  - News
  - product
contributors:
  - Colin Pollen

bannerImage: ./banner-image.png
---

A core goal of the decentralized web, also known as dWeb, is to help people and organizations regain control of their computing and storage.

To break down barriers when it comes to building the dWeb, Akash Network, an open-source, decentralized cloud has teamed up with Filebase. Filebase is the world’s first object-based storage platform to deliver multi-cloud and dWeb storage options for developers and enterprises.

Decentralized storage networks take advantage of smart, yet complex software which needs to be constantly fed to ensure that storage contracts have enough cryptocurrency. Filebase abstracts away all of that process, making things painless for the end-user.

If you’re using the traditional cloud today, their dashboard should look very familiar to you:

![](https://www.datocms-assets.com/45776/1627339911-image.png)

Together with Filebase and Akash, developers and enterprises can now quickly migrate from Amazon Web Services (AWS), Google Cloud, and Microsoft Azure, onto a decentralized network of cloud providers at a reduced cost of up to 85%. By offering open-source dWeb compute and petabyte-scale object storage, developers and enterprises will now have the ability to pair dWeb applications with thousands of existing backup tools, application SDKs, and frameworks that they already know and love.

“The Filebase API is S3 compatible, which allows developers to seamlessly leverage multiple decentralized storage networks for the first time,” said Joshua Noble, CEO and Co-founder of Filebase. “We’re excited to pair our S3 compatible access layer to decentralized storage networks, with the power and flexibility of Akash Network. We can’t wait to see what our ecosystem builds through the pairing of dWeb compute and multi-cloud storage as one.”

Today, we’re highlighting several open-source projects featuring this integration:

- [Akash documentation site](https://akash.network/docs/)

- [Pinterest app on Rails](https://github.com/ovrclk/akash-on-rails)

- [Backup and restore Postgres](https://akash.network/docs/guides/postgres-sql-restore-or-backup/)

- [Unstoppable Web 2.0](https://akash.network/docs/guides/unstopabble-web/)

- [Hosted Helium Validators](https://github.com/filebase/helium-on-akash)

- [Hosted Cosmos Nodes](https://github.com/ovrclk/cosmos-omnibus)

**Things Are Getting Pinteresting**

The first integration with Filebase was launched months before this partnership. The [Pinterest app on Rails](https://github.com/ovrclk/akash-on-rails) can be seen live on [pin.akash.host](http://pin.akash.host) and features adorable and adoptable animals in a pinterest like view. The web app streams images from decentralized storage using Filebase’s S3 Compatible API. Backups are also stored using the same API.

![](https://www.datocms-assets.com/45776/1627339962-image-1.png)

Through this integration with Filebase, apps running on Akash can now backup, restore, and migrate a database by connecting the containers running on Akash to persistent storage on Sia, Skynet, or Storj.

**An Easy Onramp: Flowing Data onto the Decentralized Web**

![](https://www.datocms-assets.com/45776/1627340002-image-2.png)

“Decentralized, blockchain-based infrastructure services are quickly establishing themselves as foundational elements for the potential next generation of cloud IaaS," said Andrew Smith, Research Manager, Cloud Infrastructure Services at IDC. "These services bring differentiated technology to market which is applicable to real-world use cases like storage and compute cost reduction, data compliance, backup, archive, and long-term cold storage. The partnership between Filebase and Akash highlights the continued evolution and improvements to this emerging market segment."

**How To Use Filebase with Akash**

This is a short setup guide that will help you to quickly configure and setup both Akash and Filebase for success.

If you need more information about how to use Filebase, review their [Dashboard Overview](https://filebase.com/blog/introducing-the-new-and-improved-filebase-dashboard/), [Documentation Section - https://docs.filebase.com](https://docs.filebase.com), or email the team at hello@filebase.com

## **Setup Filebase**

- Step 1: Register for a [Filebase](https://filebase.com/) account (Promo code: **AKASH**).

- Step 2: Login and navigate to your Buckets page.

![](https://www.datocms-assets.com/45776/1627340058-image-3.png)

- Step 3: Create and name your bucket, select the dWeb network of your choice.

![](https://www.datocms-assets.com/45776/1627340093-image-4.png)

- Step 4: Navigate to “Access Keys” and copy your **API Endpoint** “[https://s3.filebase.com](https://s3.filebase.com)”, **Access Key** and **Secret Key** - We will use them next with Akash.

![](https://www.datocms-assets.com/45776/1627340152-image-5.png)

**Setup Akash**

- Step 1: Set the environment variables in the [deploy.yml](https://github.com/ovrclk/akash-postgres-restore/blob/master/deploy.yml) and deploy on Akash

- Step 2: use the URL and port Akash gives you to connect to the Postgres server, with the credentials you provided in the environment variables. For example `cluster.ewr1p0.mainnet.akashian.io:31234`

### **Using with an App Container**

Alternatively, you can add your own app container to the deploy.yml and expose the Postgres 5432 port to your application only for a local server.

For example:

`services:`

`app:`

`image: myappimage:v1`

`depends_on:`

`- service: postgres`

`cron:`

`image: ghcr.io/ovrclk/akash-postgres-restore:v0.0.4`

`env:`

`- POSTGRES_PASSWORD=password`

`...`

`depends_on:`

`- service: postgres`

`postgres:`

`image: postgres:12.6`

`env:`

`- POSTGRES_PASSWORD=password`

`expose:`

`- port: 5432`

`to:`

`- service: app`

`- service: cron`

### **Environment variables**

- `POSTGRES_USER=postgres` - your Postgres server username

- `POSTGRES_PASSWORD=password` - your Postgres server password

- `POSTGRES_HOST=postgres` - Postgres server host (this will be whatever you named it in deploy.yml)

- `POSTGRES_PORT=5432` - Postgres port, will be 5432 unless you aliased it in deploy.yml

- `POSTGRES_DATABASE=akash_postgres` - name of your database

- `BACKUP_PATH=bucketname/path` - bucket and path for your deployments (make sure directories exist first)

- `BACKUP_KEY=key` - your Filebase access key

- `BACKUP_SECRET=secret` - your Filebase secret

- `BACKUP_PASSPHRASE=secret` - a passphrase to encrypt your backups with

- `BACKUP_HOST=https://s3.filebase.com` - the S3 backup host, this defaults to Filebase but can be any S3 compatible host

- `BACKUP_SCHEDULE=*/15 * * * *` - the cron schedule for backups (defaults to every 15 minutes)

- `BACKUP_RETAIN=7 days` - how many days to keep backups for

## **Local Development**

You can run the application locally using Docker compose.

Copy the `.env.sample` file to `.env` and populate

Run docker-compose up to build and run the application

## **Get Started for Free**

[Click here to receive $100 in Akash tokens and 1 TB of S3 Compatible Object Storage for one month.](https://filebase.com/akash)
