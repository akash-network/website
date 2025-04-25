---
categories: ["Other Resources"]
tags: []
weight: 2
title: "Testnet 6 gRPC Verifications"
linkTitle: "Testnet 6 gRPC Verifications"
---

# Akash Cosmos SDK 0.50.13 Upgrade Testnet

## Akash gRPC Testing Overview

In the step by step procedures that follow in this guide we find:

* Install procedure for `grpcurl` which will be used in all subsequent steps and the client to query a gRPC endpoint
* Template and Example to list available gRPC services on an endpoint
* Template and Example to list the method of a specific gRPC service
* Template and Example to describe a service method
* Template and Example to describe sub-services
* Template and Example to describe sub-services filters
* Example query

## Install grpcurl

```
# Download the latest version (replace the version number as needed)
wget https://github.com/fullstorydev/grpcurl/releases/download/v1.9.3/grpcurl_1.9.3_linux_x86_64.tar.gz

tar -xvf grpcurl_1.9.3_linux_x86_64.tar.gz

mv grpcurl /usr/local/bin/
# Check grpcurl install status/version
grpcurl --version
```

## List gRPC Services


```
grpcurl -plaintext grpc.akashtestnet.xyz:9090 list
```

### Example/Expected Output

```
grpcurl -plaintext grpc.akashtestnet.xyz:9090 list

akash.audit.v1.Query
akash.cert.v1.Query
akash.deployment.v1beta4.Query
akash.escrow.v1.Query
akash.market.v1beta5.Query
akash.provider.v1beta4.Query
akash.take.v1.Query
cosmos.auth.v1beta1.Query
...
```

## List Methods of a Specific Service


```
grpcurl -plaintext grpc.akashtestnet.xyz:9090 list <service-name>
```

### Example/Expected Output

```
grpcurl -plaintext grpc.akashtestnet.xyz:9090 list akash.deployment.v1beta4.Query
 
akash.deployment.v1beta4.Query
akash.deployment.v1beta4.Query.Deployment
akash.deployment.v1beta4.Query.Deployments
akash.deployment.v1beta4.Query.Group
akash.deployment.v1beta4.Query.Params
```

## Describe a Specific Method

```
grpcurl -plaintext grpc.akashtestnet.xyz:9090 describe <service-name>
```

### Example/Expected Output


```
grpcurl -plaintext grpc.akashtestnet.xyz:9090 describe akash.deployment.v1beta4.Query.Deployment

akash.deployment.v1beta4.Query.Deployment is a method:
rpc Deployment ( .akash.deployment.v1beta4.QueryDeploymentRequest ) returns ( .akash.deployment.v1beta4.QueryDeploymentResponse ) {
  option (.google.api.http) = { get:"/akash/deployment/v1beta4/deployments/info" };
}
```

## Describe Sub-Service

```
grpcurl -plaintext grpc.akashtestnet.xyz:9090 describe <service-name>Request
```

### Example/Expected Output

```
grpcurl -plaintext grpc.akashtestnet.xyz:9090 describe akash.deployment.v1beta4.QueryDeploymentsRequest

akash.deployment.v1beta4.QueryDeploymentsRequest is a message:
message QueryDeploymentsRequest {
  .akash.deployment.v1beta4.DeploymentFilters filters = 1 [(.gogoproto.nullable) = false];
  .cosmos.base.query.v1beta1.PageRequest pagination = 2;
}
```

## Describe Sub-Service Filters


```
grpcurl -plaintext grpc.akashtestnet.xyz:9090 describe <service-name>Filters
```

### Example/Expected Output

```
grpcurl -plaintext grpc.akashtestnet.xyz:9090 describe akash.deployment.v1beta4.DeploymentFilters

akash.deployment.v1beta4.DeploymentFilters is a message:
message DeploymentFilters {
  option (.gogoproto.equal) = false;
  string owner = 1 [
    (.cosmos_proto.scalar) = "cosmos.AddressString",
    (.gogoproto.jsontag) = "owner",
    (.gogoproto.moretags) = "yaml:\owner\"
  ];
  uint64 dseq = 2 [
    (.gogoproto.customname) = "DSeq",
    (.gogoproto.jsontag) = "dseq",
    (.gogoproto.moretags) = "yaml:\dseq\"
  ];
  string state = 3 [
    (.gogoproto.jsontag) = "state",
    (.gogoproto.moretags) = "yaml:\state\"
  ];
}
```

## Execute Example Query

```
grpcurl -plaintext -d '{"filters": {"owner": "akash1p6fulzhjcsghakuracwn20tjqmvf7zvsclf6yw", "dseq": "208986"}}' grpc.akashtestnet.xyz:9090 akash.deployment.v1beta4.Query/Deployments

{
  "deployments": [
    {
      "deployment": {
        "id": {
          "owner": "akash1p6fulzhjcsghakuracwn20tjqmvf7zvsclf6yw",
          "dseq": "208986"
        },
        "state": "active",
        "hash": "ZORpdTqmvTDIbJjnEP5Vo9MJ8uVzbYp6mQWJAeD/n8I=",
        "createdAt": "208987"
      },
...
```

