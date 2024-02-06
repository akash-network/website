---
categories: ["Akash Custom Clients"]
tags: []
title: "Query All Deployments on the Blockchain"
linkTitle: "Query All Deployments on the Blockchain"
weight: 1
description: >-
---

## Deployments Query Overview

> [Source code reference location](https://github.com/chainzero/akash-client/blob/main/akashrpcclient_queryonly/main.go)

Within the `main.go` file a very simplistic query example is examined first.

Details on the Deployments method:

- The Deployments method requires no input and returns all deployments on the blockchain.
- By default the output, returned data is limited to the most recent 100 records/deployments and is paginated.

> _**NOTE**_ - in the sample code provided in the GitHub repository this `Deployments` query is commented out and the `Deployment` query is active/highlighted. Uncomment this block to experiment with the Deployments query.

```
....TRUNCATED....
// Query the blockchain using the client's `Deployments` method for a return of all deployments
queryResp, err := queryClient.Deployments(ctx, &types.QueryDeploymentsRequest{})
if err != nil {
	log.Fatal(err)
}
....TRUNCATED....
```

## Deployments Method&#x20;

> [Source code reference location](https://github.com/akash-network/node/blob/master/x/deployment/types/v1beta2/query.pb.go)

The Deployments method used in this example is located in the deployment module Protobuf file.

In the section [Using Examples to Build Your Own Query](/docs/akash-custom-clients/akash-client---query-only/example-rpc-queries/using-examples-to-build-your-own-query/) we will explore the Protobuf files and types further.

```
func (c *queryClient) Deployments(ctx context.Context, in *QueryDeploymentsRequest, opts ...grpc.CallOption) (*QueryDeploymentsResponse, error) {
	out := new(QueryDeploymentsResponse)
	err := c.cc.Invoke(ctx, "/akash.deployment.v1beta2.Query/Deployments", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}
```
