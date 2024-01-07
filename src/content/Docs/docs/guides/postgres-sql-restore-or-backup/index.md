---
categories: ["Guides"]
tags: ["Blockchain"]
weight: 1
title: "PostgreSQL restore/backup"
linkTitle: "PostgreSQL restore/backup"
---

**Repository**: [ovrclk/akash-postgres-restore](https://github.com/ovrclk/akash-postgres-restore)

An auto-restoring Postgres server running on Akash, with backups taken on a configurable schedule. Backups are stored on decentralised storage using Filebase.

Ultimately this is a two container setup, one PostgreSQL server and one scheduler container to restore the database on boot, and run a cronjob to back it up.

## Usage

* Setup a [Filebase](https://filebase.com/) account and bucket (or any S3 compatible storage host).
* Set the environment variables in the [deploy.yml](https://github.com/ovrclk/akash-postgres-restore/blob/master/deploy.yml) and deploy on Akash
* Use the URL and port Akash gives you to connect to the Postgres server, with the credentials you provided in the environment variables. For example cluster.ewr1p0.mainnet.akashian.io:31234

### Using with an app container

Alternatively add your own app container to the deploy.yml and expose the Postgres 5432 port to your application only for a local server.

For example:

```
services:
  app: 
    image: myappimage:v1
    depends_on: 
      - service: postgres
  cron:
    image: ghcr.io/ovrclk/akash-postgres-restore:v0.0.4
    env:
      - POSTGRES_PASSWORD=password
      ...
    depends_on:
      - service: postgres
  postgres:
    image: postgres:12.6
    env:
      - POSTGRES_PASSWORD=password
    expose:
      - port: 5432
        to:
          - service: app
          - service: cron
```

### Environment variables

* `POSTGRES_USER=postgres` - your Postgres server username
* `POSTGRES_PASSWORD=password` - your Postgres server password
* `POSTGRES_HOST=postgres` - postgres server host, whatever you named it in deploy.yml
* `POSTGRES_PORT=5432` - postgres port, will be 5432 unless you aliased it in deploy.yml
* `POSTGRES_DATABASE=akash_postgres` - name of your database
* `BACKUP_PATH=bucketname/path` - bucket and path for your deployments. Make sure directories exist first
* `BACKUP_KEY=key` - your Filebase access key
* `BACKUP_SECRET=secret` - your Filebase secret
* `BACKUP_PASSPHRASE=secret` - a passphrase to encrypt your backups with
* `BACKUP_HOST=https://s3.filebase.com` - the S3 backup host, this defaults to Filebase but can be any S3 compatible host
* `BACKUP_SCHEDULE=*/15 * * * *` - the cron schedule for backups. Defaults to every 15 minutes
* `BACKUP_RETAIN=7 days` - how many days to keep backups for

## Development

You can run the application locally using Docker compose.

Copy the `.env.sample` file to `.env` and populate

Run `docker-compose up` to build and run the application