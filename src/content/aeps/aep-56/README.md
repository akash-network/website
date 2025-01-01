---
aep: 56
title: Verifiable provider resources
author: Artur Troian (@troian)
status: Draft
type: Standard
category: Core
created: 2024-12-19
updated: 2024-12-19
estimated-completion: 2025-06-30
roadmap: minor
---

## Summary

This proposal aims to implement verification of the compute resources supplied by providers on Akash Network and extends already in place [Trusted providers](../aep-9/README.md).

## Motivation

To ensure that the resources supplied by the providers are accurately represented and can be trusted by users and other stakeholders within the ecosystem.
This will enhance the overall security, reliability, and transparency of the network, fostering greater trust and adoption of Akash Network as a decentralized cloud computing platform.

## Features

- **Data Availability Layer** - external to Akash Network storage for the snapshots of the provider resources.

## Implementation

With provider service installaiton comes `Feature Discovery Service` (FDS) which hands inventory information to the provider engine.
The FDS functionality will be extended to snapshot information below which further will be signed by the provider and placed to the **DA**:

- CPU
- cpu id
- architecture
- model
- vendor
  - micro-architecture [levels](https://github.com/HenrikBengtsson/x86-64-level)
- features
- GPU
- gpu id
- vendor (already implemented)
- model (already implemented)
- memory size (already implemented)
- interface (already implemented)
- Memory
  - vendor
  - negotiated speed
  - timings
  - serial number
- Storage

### Workflow

For provider to be verified it must:

- commit first snapshot of resources upon commissioning to the network
- allow Auditor to inspect hardware
- commit snapshots:
  - whenever there is change to the hardware due to expansion, maintenance
  - when challenged by the Auditor (workflow TBD)

### Stores extension

1. Implement extension to the `x/provider` store

   ```protobuf
   syntax = "proto3";
   package akash.provider.v1beta4;

   import "gogoproto/gogo.proto";
   import "cosmos_proto/cosmos.proto";

   message ResourcesSnapshot {
       string owner    = 1 [
           (cosmos_proto.scalar) = "cosmos.AddressString",
           (gogoproto.jsontag)   = "owner",
           (gogoproto.moretags)  = "yaml:\"owner\""
       ];
       google.protobuf.Duration timestamp = 2 [
           (gogoproto.jsontag) = "timestamp",
           (gogoproto.moretags) = "yaml:\"timestamp\""
       ];
       // location of the snapshot on the external DA
       string filepath = 3;
       // checksum of the timestamp, filepath and it's content
       string hash = 4;
   }
   ```

2. Implement extension to the `x/audit` store

   ```protobuf
   syntax = "proto3";
   package akash.audit.v1;

   import "akash/provider/v1beta4/provider.proto";

   message AuditedResourcesSnapshot {
      string auditor = 1 [
        (gogoproto.jsontag)  = "auditor",
        (gogoproto.moretags) = "yaml:\"auditor\""
      ];

      akash.provider.v1beta4.ResourcesSnapshot snapshot = 2;
   }
   ```
