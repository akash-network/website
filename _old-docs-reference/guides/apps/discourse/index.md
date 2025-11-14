---
categories: ["Guides"]
tags: ["Social"]
weight: 1
title: "Discourse on Akash"
linkTitle: "Discourse"
---

Discourse is a fully open-source discussion platform designed for the future of the Internet. It can be used as a mailing list, discussion forum, long-form chat room, and more. To learn more, visit [Discourse](https://www.discourse.org/).

## Discourse on Akash Overview

This guide will help you deploy a multi-tiered Discourse application on the Akash Network, consisting of four services/containers:

- Backend Services:
    - PostgreSQL
    -  Redis
    - Sidekiq (for background job processing)

- Frontend Service:
    - Discourse

To deploy your Discourse instance on the Akash Network, simply use the provided [`deploy.yml`](https://github.com/akash-network/awesome-akash/blob/master/discourse/deploy.yml) script on Mainnet. You can refer to any "Step by Step Guide to Akash" for detailed instructions.

