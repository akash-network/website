---
categories: ["Akash Custom Client"]
tags: []
title: "Akash gRPC Implementation Overview"
linkTitle: "Akash gRPC Implementation Overview"
weight: 1
description: >-
---

## gRPC Repository Structure

Prior to delving into the gRPC implementation it is useful to review an overview of the repository structure.  In the sections that follow Deployment protobuf messages and services are explored as an example and allows familiarization with the directory structures.

In recent code updates a new `akash-api` repository was created to isolate protobuf/gRPC definitions.

Akash gRPC API definitions are structured as follows:

- [gRPC Repository Structure](#grpc-repository-structure)
  - [Protobuf Message Definitions](#protobuf-message-definitions)
  - [Protobuf Service Definitions](#protobuf-service-definitions)

### Protobuf Message Definitions

> [Source code reference location](https://github.com/akash-network/akash-api/blob/main/proto/node/akash/deployment/v1beta3/deployment.proto)

Example Akash protobuf message definition can be explored in the `akash-api/proto/node/akash/deployment/v1beta3/service.proto` file.

### Protobuf Service Definitions

> [Source code reference location](https://github.com/akash-network/akash-api/blob/main/proto/node/akash/deployment/v1beta3/service.proto)

Example Akash protobuf service definition can be explored in the `akash-api/proto/node/akash/deployment/v1beta3/service.proto` file.