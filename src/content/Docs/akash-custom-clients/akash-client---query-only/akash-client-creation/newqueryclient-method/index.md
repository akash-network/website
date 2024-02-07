---
categories: ["Akash Custom Clients"]
tags: []
title: "NewQueryClient Method"
linkTitle: "NewQueryClient Method"
weight: 1
description: >-
---

Within `main.go` the function `NewQueryClient` is called.

Based on the import statements in `main.go` (shown below) and the call of `types.NewQueryClient(client.Context())` - it is evident that:

* The NewQueryClient function exists in the Akash node repository
* The `client` instance that was created in the prior block is passed into the function

```
types "github.com/akash-network/node/x/deployment/types/v1beta2"
```

From within the deployment module code - path above - `NewQueryClient` exists in `query.pb.go`.

> [Source code reference location](https://github.com/akash-network/node/blob/master/x/deployment/types/v1beta2/query.pb.go)

```
func NewQueryClient(cc grpc1.ClientConn) QueryClient {
	return &queryClient{cc}
}
```

The struct returned by `NewQueryClient` creates a client connection using `github.com/gogo/protobuf/grpc` .

```
type queryClient struct {
	cc grpc1.ClientConn
}
```