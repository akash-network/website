---
categories: ["Akash Custom Clients"]
tags: []
title: "Query a Specific Deployment ID (DSEQ and Owner ID Specified)"
linkTitle: "Query a Specific Deployment ID (DSEQ and Owner ID Specified)"
weight: 1
description: >-
---

## Deployment Query Overview

> [Source code reference location](https://github.com/chainzero/akash-client/blob/main/akashrpcclient_queryonly/main.go)

For the purpose of querying a specific deployment a `DeploymentID` struct - defined in Akash source code - is populated with the desired `Owner` and `Dseq` fields.

The `QueryDeploymentRequest` struct's `ID` field is then defined with the `deploymentid` struct reference.

```
....TRUNCATED....
// Query the blockchain using the client's `Deployment` method for a return of a specific deployment
deploymentid := types.DeploymentID{
	Owner: "akash1f53fp8kk470f7k26yr5gztd9npzpczqv4ufud7",
	DSeq:  10219997,
}

querydeploymentrequest := types.QueryDeploymentRequest{
	ID: deploymentid,
}

// Query the blockchain using the client's `Deployment` method
queryResp, err := queryClient.Deployment(ctx, &querydeploymentrequest)
if err != nil {
	log.Fatal(err)
}
....TRUNCATED....
```

## Deployment Method

> [Source code reference location](https://github.com/akash-network/node/blob/master/x/deployment/types/v1beta2/query.pb.go)

The Deployment method used in this example is located in the deployment module Protobuf file.

In the section [Using Examples to Build Your Own Query](/akash-docs/engineering-documentation/akash-custom-clients/akash-client---query-only/example-rpc-queries/using-examples-to-build-your-own-query/) we will explore the Protobuf files and types further.

```
func (c *queryClient) Deployment(ctx context.Context, in *QueryDeploymentRequest, opts ...grpc.CallOption) (*QueryDeploymentResponse, error) {
	out := new(QueryDeploymentResponse)
	err := c.cc.Invoke(ctx, "/akash.deployment.v1beta2.Query/Deployment", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}
```
