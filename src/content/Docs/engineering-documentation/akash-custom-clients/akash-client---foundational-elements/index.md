---
categories: ["Akash Custom Clients"]
tags: []
title: "Akash Client - Foundational Elements"
linkTitle: "Akash Client - Foundational Elements"
weight: 1
description: >-
---

Cosmos has created the Ignite CLI to quickly and easily scaffold new Cosmos blockchains.  As part of this project the Ignite CLI is provided a [Go client example](https://docs.ignite.com/clients/go-client#creating-a-blockchain-client) to programmatically interact with create chains.

In our exploration of interacting with the Akash blockchain we will largely follow the framework created within the Cosmos Ignite project.  But we will not use the Ignite CLI code directly due to the following factors:

* The Akash project and the Ignite CLI currently utilize different versions of the Cosmos SDK and thus we need to adjust the Ignite source code for several differences when interacting with Cosmos SDK versions.
* Deconstructing the Ignite CLI Go client allows a through inspection and understanding of the mechanics necessary and involved in Akash blockchain interactions.

## Objective

The code samples provided in this guide are not meant to provide a full Go client for Akash blockchain use.  We have full Go clients available for this purpose.  Rather the purpose of this guide is to break down the interactions and mechanics involved in querying and submitting transactions to the Akash blockchain to allow developer builds of future integrations.

We believe the review in this document will remove much of the friction and substantial time investments previously encountered when attempting to get started with Akash integrations.

## Focus of Documentation

Akash deployment creation transactions and deployment queries will serve as the focus of this document.

Using the deployment activities, one could easily review the Akash code base to create other transactions/queries of interest including lease creation, provider interractions, etc.

## Base Client

Within this section we will concentrate on formation of the basic Go client capable of creating a session with the Akash blockchain.

The Client we construct in this section will then be utilized for Query and Transaction operations in later sections.