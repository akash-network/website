---
title: How to Back Up Data from Akash Apps
description: Storage on Akash is currently ephemeral by default. Here's how persistent storage fits in, why there's no one-click download, and two simple ways to add backups to your deployment.
pubDate: 2026-06-04
draft: false
categories:
  - Guides
tags:
  - Guides
  - Storage
  - Backups
contributors:
  - Sam Lister
bannerImage: ./project-banner.png
---

Akash is a decentralized cloud platform built on a low-level architecture, which gives you an exceptional degree of control over your deployments. It's also a fast-growing platform where new capabilities and ease-of-use features are being shipped all the time — and the best is still ahead. A few of those conveniences, data management among them, are still being developed. Until they land, it's worth knowing how to handle them yourself, so this guide covers what you need to know about keeping your data safe when running deployments on Akash.

## Storage is currently ephemeral by default

Today, all data on Akash is ephemeral by default. The storage is wiped on container restarts, crashes, and deployment updates. To avoid losing data, you can use **persistent storage**, which protects your data from all three of those events.

Persistent storage is not a complete backup solution, though. It keeps your data safe **as long as the provider keeps running reliably and your deployment stays active**. If either of those stops being true, persistent storage alone won't save you — which is why you still want a way to get your data *out* of the deployment.

## Why there's no one-click download

If you come from traditional cloud, you're probably used to SSHing into a machine to manage storage, or using an admin panel. That can be possible on Akash too — but only for certain Docker images (for example, an Ubuntu image with SSH built in).

If your deployment doesn't ship with SSH, and its image doesn't support the commands you'd need to back files up through shell access, then file management has to come from **within your application**.

## Two ways to add backups to your app

Since there's no built-in mechanism to download files from a deployment, you add one yourself at the application level. There are two main approaches:

1. **Expose an endpoint** that your data can be downloaded from.
2. **Upload the data from within the application** to external storage.

Your deployment can already access all of its own files, so both options are straightforward. Both fit a wide range of applications and can be triggered either manually or automatically. If you already run an API server, having it serve your data so you can pull it down to a local machine is often the most convenient option.

## Community examples

Community members have built a number of working examples that back up databases to external storage. They're a good starting point to adapt for your own stack:

- [waitrouz/akash-dropbox-backup](https://github.com/waitrouz/akash-dropbox-backup) — files → Dropbox
- [camathebullet/akash-mongo-backup](https://github.com/camathebullet/akash-mongo-backup) — MongoDB
- [frozoffreal/awesome-akash](https://github.com/frozoffreal/awesome-akash/tree/postgres-storj-backup/postgres-storj-backup) — PostgreSQL → Storj
- [eluvietiee/mariadb-backup](https://github.com/eluvietiee/mariadb-backup) — MariaDB
- [rexayop/awesome-akash](https://github.com/rexayop/awesome-akash/tree/redis-storj-backup/redis-storj-backup) — Redis → Storj
- [bobbyshmrd/couchdb-storj-backup](https://github.com/bobbyshmrd/couchdb-storj-backup) — CouchDB → Storj
- [laserkit/awesome-akash](https://github.com/laserkit/awesome-akash/tree/postgres-backup/postgres-backup) — PostgreSQL
- [linaluna100/postgres-apillon-backup](https://github.com/linaluna100/postgres-apillon-backup) — PostgreSQL → Apillon

As you can see, data management on Akash works just the same as anywhere else — it simply has to be built into your app so you never lose access to your data.

## Need help?

If this is something you'd like a hand with, join the [Akash Discord server](https://discord.akash.network) or send your questions through the [Akash support form](https://akash.network/support/).
