---
aep: 37
title: "Lease control API via GRPC"
author: Artur Troian (@troian)
status: Draft
type: Standard
category: Core
created: 2024-12-01
updated: 2024-12-09
estimated-completion: 2025-04-30
roadmap: minor
---

## Summary

This proposal aims to implement a lease control API using Protocol Buffers (protobuf) and gRPC. The new API will enhance performance, efficiency, and maintainability by leveraging gRPC's advanced features.

## Motivation

Migrating from REST to gRPC provides several benefits that address common challenges and improve the overall performance and scalability of the API.
Here are the key reasons to consider this migration:

- **Performance**: gRPC uses HTTP/2, which allows for multiplexing multiple requests over a single connection, reducing latency and improving throughput. This is particularly beneficial for
  high-performance applications.
- **Efficiency**: gRPC uses Protocol Buffers (protobuf) for serialization, which is more efficient and compact compared to JSON used in REST. This results in faster processing and reduced bandwidth
  usage.
- **Streaming**: gRPC natively supports streaming, allowing for real-time data exchange between client and server. This is useful for applications requiring continuous data flow, such as live logs or
  events.
- **Strongly Typed Contracts**: gRPC enforces a strongly typed contract between client and server through protobuf definitions. This reduces the likelihood of errors and ensures consistency across
  different services.
- **Code Generation**: gRPC provides tools to automatically generate client and server code from protobuf definitions, reducing boilerplate code and speeding up development.
- **Interoperability**: gRPC supports multiple programming languages, making it easier to build polyglot services and integrate with different systems.
- **Error Handling**: gRPC has a standardized way of handling errors, providing more detailed and structured error messages compared to REST.
- **Security**: gRPC supports built-in authentication and encryption mechanisms, leveraging HTTP/2 features to enhance security.

By migrating to gRPC, we expect to achieve better performance, efficiency, and maintainability of the provider APIs, ultimately leading to a more robust and scalable system.

## Features

* **ServiceStatus** - Retrieves the status of services associated with a lease
* **ServiceLogs** - Retrieves the logs of services associated with a lease
* **ServiceRestart** - Restarts services associated with a lease


## Implementation

Implement `akash.provider.lease.v1.LeaseRPC` with following types and RPC calls


```protobuf
syntax = "proto3";
package akash.provider.lease.v1;

message ServiceFilter {
  string name = 1 [
    (gogoproto.jsontag) = "name",
    (gogoproto.moretags) = "yaml:\"name\""
  ];
  repeated uint32 replicas = 2 [
    (gogoproto.jsontag) = "replicas",
    (gogoproto.moretags) = "yaml:\"replicas\""
  ];
}

// ServiceLogsRequest Request to fetch service logs
message ServiceLogsRequest {
  akash.market.v1.LeaseID lease_id = 1 [
    (gogoproto.nullable) = false,
    (gogoproto.jsontag) = "LeaseID",
    (gogoproto.moretags) = "yaml:\"LeaseID\""
  ];
  ServiceFilter filter = 2 [
    (gogoproto.nullable) = false,
    (gogoproto.jsontag) = "filter",
    (gogoproto.moretags) = "yaml:\"filter\""
  ];

  // Whether to follow the log
  bool follow = 3 [
    (gogoproto.jsontag) = "follow",
    (gogoproto.moretags) = "yaml:\"follow\""
  ];
}

// ServiceLogs Response containing service logs
message ServiceLogs {
  string name = 1 [
    (gogoproto.jsontag) = "name",
    (gogoproto.moretags) = "yaml:\"name\""
  ];
  uint32 replica = 2 [
    (gogoproto.jsontag) = "replica",
    (gogoproto.moretags) = "yaml:\"replica\""
  ];
  bytes logs = 3 [
    (gogoproto.jsontag) = "logs",
    (gogoproto.moretags) = "yaml:\"logs\""
  ];
}

// ServiceLogsResponse Response containing service logs
message ServiceLogsResponse {
  repeated ServiceLogs services = 1 [
    (gogoproto.jsontag) = "LeaseID",
    (gogoproto.moretags) = "yaml:\"LeaseID\""
  ];
}

// ServiceStatusRequest to fetch service status
message ServiceStatusRequest {
  akash.market.v1.LeaseID lease_id = 1 [
    (gogoproto.nullable) = false,
    (gogoproto.jsontag) = "LeaseID",
    (gogoproto.moretags) = "yaml:\"LeaseID\""
  ];
  ServiceFilter filter = 2 [
    (gogoproto.nullable) = false,
    (gogoproto.jsontag) = "filter",
    (gogoproto.moretags) = "yaml:\"filter\""
  ];
  bool follow = 3 [
    (gogoproto.jsontag) = "follow",
    (gogoproto.moretags) = "yaml:\"follow\""
  ];
}

// ServiceStatusResponse containing service statuses.
message ServiceStatusResponse {
  repeated ServiceStatus services = 1 [
    (gogoproto.nullable) = false,
    (gogoproto.jsontag) = "services",
    (gogoproto.moretags) = "yaml:\"services\""
  ];
}

// ServiceRestartRequest Request to restart services
message ServiceRestartRequest {
  akash.market.v1.LeaseID lease_id = 1 [
    (gogoproto.nullable) = false,
    (gogoproto.jsontag) = "LeaseID",
    (gogoproto.moretags) = "yaml:\"LeaseID\""
  ];
  ServiceFilter filter = 2 [
    (gogoproto.nullable) = false,
    (gogoproto.jsontag) = "filter",
    (gogoproto.moretags) = "yaml:\"filter\""
  ];

  // Timeout duration to to wait on requested services to restart.
  // 0 - no wait
  google.protobuf.Duration timeout = 3 [
    (gogoproto.jsontag) = "timeout",
    (gogoproto.moretags) = "yaml:\"timeout\""
  ];
}

message ServiceRestartStatus {
  // State of the service replica after restart request
  enum State {
    option (gogoproto.goproto_enum_prefix) = false;

    // ReplicaRestartStatePending replica restart is in progress
    pending = 0 [(gogoproto.enumvalue_customname) = "ReplicaRestartStatePending"];
    // ReplicaRestartStateActive replica has been restarted successfully
    active = 1 [(gogoproto.enumvalue_customname) = "ReplicaRestartStateActive"];
    // ReplicaRestartStateFailure replica experienced failure during restart
    failure = 2 [(gogoproto.enumvalue_customname) = "ReplicaRestartStateFailure"];
  }

  string service = 1 [
    (gogoproto.jsontag) = "service",
    (gogoproto.moretags) = "yaml:\"service\""
  ];
  string replica = 2 [
    (gogoproto.jsontag) = "replica",
    (gogoproto.moretags) = "yaml:\"replica\""
  ];
  State state = 3 [
    (gogoproto.jsontag) = "state",
    (gogoproto.moretags) = "yaml:\"state\""
  ];
  optional string message = 4 [
    (gogoproto.jsontag) = "message",
    (gogoproto.moretags) = "yaml:\"message\""
  ];
}

// ServiceRestartResponse is response to the ServiceRestartRequest
message ServiceRestartResponse {
  repeated ServiceRestartStatus status = 1 [
    (gogoproto.jsontag) = "status",
    (gogoproto.moretags) = "yaml:\"status\""
  ];
}

// The LeaseRPC service is a gRPC-based service designed to manage and control leases within the Akash Provider ecosystem.
// It provides methods to retrieve service status, fetch service logs, and restart services associated with a lease.
service LeaseRPC {
  // ServiceStatus Retrieves the status of services associated with a lease.
  // buf:lint:ignore RPC_REQUEST_RESPONSE_UNIQUE
  // buf:lint:ignore RPC_RESPONSE_STANDARD_NAME
  rpc ServiceStatus(ServiceStatusRequest) returns (stream ServiceStatusResponse);

  // ServiceLogs Retrieves the logs of services associated with a lease.
  // buf:lint:ignore RPC_REQUEST_RESPONSE_UNIQUE
  // buf:lint:ignore RPC_RESPONSE_STANDARD_NAME
  rpc ServiceLogs(ServiceLogsRequest) returns (stream ServiceLogsResponse);

  // ServiceRestart Restarts services associated with a lease.
  rpc ServiceRestart(ServiceRestartRequest) returns (ServiceRestartResponse);
}
```

# Copyright

All content herein is licensed under [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0).
