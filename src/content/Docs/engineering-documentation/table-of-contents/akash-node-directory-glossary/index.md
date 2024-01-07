---
categories: ["Table of Contents"]
tags: []
title: "Akash Node Directory Glossary"
linkTitle: "Akash Node Directory Glossary"
weight: 1
description: >-
---

## Source Code

> [Source code reference location](https://github.com/akash-network/node)

## Source for Directory Overview

[https://docs.ignite.com/guide/getting-started](https://docs.ignite.com/guide/getting-started)

## App Directory

The `app/` directory contains the files that connect the different parts of the blockchain together. The most important file in this directory is app.go, which includes the type definition of the blockchain and functions for creating and initializing it. This file is responsible for wiring together the various components of the blockchain and defining how they will interact with each other.

## CMD Directory

The `cmd/` directory contains the main package responsible for the command-line interface (CLI) of the compiled binary. This package defines the commands that can be run from the CLI and how they should be executed. It is an important part of the blockchain project as it provides a way for developers and users to interact with the blockchain and perform various tasks, such as querying the blockchain state or sending transactions.

## Docs Directory

The `docs/` directory is used for storing project documentation. By default, this directory includes an OpenAPI specification file, which is a machine-readable format for defining the API of a software project. The OpenAPI specification can be used to automatically generate human-readable documentation for the project, as well as provide a way for other tools and services to interact with the API. The docs/ directory can be used to store any additional documentation that is relevant to the project.

## Proto Directory

The `proto/` directory contains protocol buffer files, which are used to describe the data structure of the blockchain. Protocol buffers are a language- and platform-neutral mechanism for serializing structured data, and are often used in the development of distributed systems, such as blockchain networks. The protocol buffer files in the `proto/` directory define the data structures and messages that are used by the blockchain, and are used to generate code for various programming languages that can be used to interact with the blockchain. In the context of the Cosmos SDK, protocol buffer files are used to define the specific types of data that can be sent and received by the blockchain, as well as the specific RPC endpoints that can be used to access the blockchain's functionality.

## Testutil Directory

The `testutil/` directory contains helper functions that are used for testing. These functions provide a convenient way to perform common tasks that are needed when writing tests for the blockchain, such as creating test accounts, generating transactions, and checking the state of the blockchain. By using the helper functions in the `testutil/` directory, developers can write tests more quickly and efficiently, and can ensure that their tests are comprehensive and effective.

## Module Directory

The `x/` directory contains custom Cosmos SDK modules that have been added to the blockchain. Standard Cosmos SDK modules are pre-built components that provide common functionality for Cosmos SDK-based blockchains, such as support for staking and governance. Custom modules, on the other hand, are modules that have been developed specifically for the blockchain project and provide project-specific functionality.