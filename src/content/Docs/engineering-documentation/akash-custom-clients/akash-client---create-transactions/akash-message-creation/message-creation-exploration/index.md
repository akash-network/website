---
categories: ["Akash Client - Create Transactions"]
tags: []
title: "Message Creation Exploration"
linkTitle: "Message Creation Exploration"
weight: 1
description: >-
---

## Akash Source Code Use

> [Source code reference location](https://github.com/akash-network/node/blob/master/x/deployment/client/cli/tx.go)

For the purpose of Deployment Creation message construction it is useful to reverse engineer Akash CLI source code within the Deployment module.&#x20;

Based on Go client usage there are several adjustments that will be necessary and we will bring relevant code into our own local copy to make those adjustments.

This source code is location in the Deployments module at - `github.com/akash-network/node/x/deployment/client/cli/tx.go`.

We explore - and use - many of the techniques the Akash CLI source code for ease of exploration in other areas of interest by the developer in future use cases.  In other words - if we become familiar with message construction using the source code example for Deployment Creation transactions - we can easily use a similar review for the construction of a Lease Create transaction as an example.

> _**NOTE**_ - for brevity and focus there are elements in Akash source code that we will not use in the construction of our custom client.  Example - in the source code a validation that a valid certificate for Akash provider interactions is verified.  In our focus solely on the Deployment Create transaction this validation is not necessary.  Certainly such validations would be wise in a production grade client but in exploration we want to be entirely focused on the specific matter of interest.

## Akash Source Code Specific Location

The specific location of the Akash source code is within the `cmdCreate` function.  As the Akash CLI invokes this logic with the registered Cobra command such logic is called when the CLI command - `provider-services tx deployment create` is called.

> `func cmdCreate(key string) *cobra.Command`