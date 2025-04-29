---
categories: ["Akash API"]
tags: []
title: "Exploration of Akash Queries Using the Akash API Source Code"
linkTitle: "Exploration of Akash Queries Using the Akash API Source Code"
weight: 1
description: >-
---


In this section we will use an Akash deployments query as an example of:

* General use of the Akash API repository within custom code
* Explore Akash API Go code generated thru protoc
* Using the Protobuf generated gateway for blockchain queries
* Sending receipt of Protobuf messages with HTTP API requests to Akash RPC nodes

#### Sections Within This Guide

* [gRPC Gateway Use](#grpc-gateway-use)
* [Example gRPC Gateway Use and Deep Dive Explanations](#example-grpc-gateway-use-and-deep-dive-explanations)

## gRPC Gateway Use

The Protobuf generated gRPC gateway creates a HTTP handler for upstream gRPC queries.  The gRPC gateway provides an interface for clients incapable of using gRPC calls directly.  In this guide we use the gRPC source code for blockchain queries to remove friction and ease of development.

The gRPC gateway definitions used on our example query of Akash deployments are located [here](https://github.com/akash-network/akash-api/blob/main/go/node/deployment/v1beta3/query.pb.gw.go).

## Example gRPC Gateway Use and Deep Dive Explanations

### Subsections within Code Exploration

- [gRPC Gateway Use](#grpc-gateway-use)
- [Example gRPC Gateway Use and Deep Dive Explanations](#example-grpc-gateway-use-and-deep-dive-explanations)
	- [Subsections within Code Exploration](#subsections-within-code-exploration)
	- [Complete Code Example - Query Deployments with Owner Filter](#complete-code-example---query-deployments-with-owner-filter)
	- [Deep Code Exploration Using Query Deployments Example](#deep-code-exploration-using-query-deployments-example)
		- [Protoc Generated Go Code Overview](#protoc-generated-go-code-overview)
		- [Protoc Generated File Deepdive](#protoc-generated-file-deepdive)

### Complete Code Example - Query Deployments with Owner Filter

> _**NOTE**_ - prior to execution of this code ensure package dependencies mirror those found in the source code repo `go.mod` file [here](https://github.com/akash-network/akash-api/blob/main/go.mod)

```
package main

import (
	"encoding/hex"
	"fmt"
	"io/ioutil"
	"net/http"
	"strings"

	"github.com/golang/protobuf/proto"

	"github.com/akash-network/akash-api/go/node/deployment/v1beta3"
)

func main() {
	// Replace string with preferred Akash RPC Node
	// At the time of this writing a Testnet RPC Node is utilized to utilize the latest version of the Akash API
	url := "https://rpc.testnet-02.aksh.pw:443"
	method := "GET"

	// Create the QueryDeploymentsRequest with necessary filters
	// Replace the Owner address with the account of interest and to query deplpyments associated with that account
	request := &v1beta3.QueryDeploymentsRequest{
		Filters: v1beta3.DeploymentFilters{
			// Set any filters you need to query deployments
			// For example, you can set the owner of the deployment, status, etc.
			Owner: "akash1w3k6qpr4uz44py4z68chfrl7ltpxwtkngnc6xk",
		},
		// Pagination: &v1beta3.PageRequest{
		// 	// Set pagination options if needed
		// 	// For example, you can set the number of results per page, the page number, etc.
		// },
	}

	// Manually serialize the struct fields into the protobuf message
	data, err := manualMarshal(request)
	if err != nil {
		fmt.Println("Error encoding protobuf:", err)
		return
	}

	// Convert the byte slice to a hexadecimal string
	protoMessage := hex.EncodeToString(data)

	// Construct the payload string and use the protoMessage variable in the data key
	payload := strings.NewReader(fmt.Sprintf(`{"jsonrpc":"2.0","id":0,"method":"abci_query","params":{"data":"%s","height":"0","path":"/akash.deployment.v1beta3.Query/Deployments","prove":false}}`, protoMessage))

	client := &http.Client{}
	req, err := http.NewRequest(method, url, payload)

	if err != nil {
		fmt.Println(err)
		return
	}
	req.Header.Add("Content-Type", "application/json")

	res, err := client.Do(req)
	if err != nil {
		fmt.Println(err)
		return
	}
	defer res.Body.Close()

	body, err := ioutil.ReadAll(res.Body)
	if err != nil {
		fmt.Println(err)
		return
	}

	// Prints protobuf encoded message that can be converted to human readable format/Go struct
	fmt.Println(string(body))

}

// Manually serialize the struct fields into the protobuf message
func manualMarshal(msg proto.Message) ([]byte, error) {
	var buf proto.Buffer
	if err := buf.Marshal(msg); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}

```

### Deep Code Exploration Using Query Deployments Example

#### Protoc Generated Go Code Overview

* Within the example Deployments blockchain query we make use of:
  * [ ] Deployments protobuf definitions which are originally defined [here](-api/tree/main/proto/node/akash/deployment/v1beta3) and specifically in the `query.proto` definition file
  * [ ] Go code generated via protoc and that are located [here](https://github.com/akash-network/akash-api/tree/main/go/node/deployment/v1beta3) and specifically the `query.pb.gw.go` and `query.pb.go` files

> _**NOTE**_ - the protoc generated Go files used in our custom code examples are the same type definitions used throughout Akash source code.  For example - the Akash CLI source code and specifically Deployment/Deployments queries are defined [here](https://github.com/akash-network/node/blob/main/x/deployment/client/cli/query.go).   Within the referenced file and CLI client definitions the types located in `github.com/akash-network/akash-api/go/node/deployment/v1beta3` are utilized.  These are the same definitions and types we we use in this custom client code example.

#### Protoc Generated File Deepdive

* The example Deployments Query code uses the protoc generated gRPC gateway
* The gRPC gateway registers the DeploymentsQuery endpoint
* For DeploymentsQuery the HTTP GET request requires the following attributes in the payload with associated values for our use case:
  * [ ] `"path":"/akash.deployment.v1beta3.Query/Deployments"`
  * [ ] `"data"` - protobuf encoded message&#x20;

_**Custom/Relevant Code**_

* Utilize the protoc generated Go type of `QueryDeploymentsRequest`
* Embed protobuf encoded payload in HTTP request to gRPC gateway

```
	// Create the QueryDeploymentsRequest with necessary filters
	// Replace the Owner address with the account of interest and to query deplpyments associated with that account
	request := &v1beta3.QueryDeploymentsRequest{
		Filters: v1beta3.DeploymentFilters{
			// Set any filters you need to query deployments
			// For example, you can set the owner of the deployment, status, etc.
			Owner: "akash1w3k6qpr4uz44py4z68chfrl7ltpxwtkngnc6xk",
		},
		// Pagination: &v1beta3.PageRequest{
		// 	// Set pagination options if needed
		// 	// For example, you can set the number of results per page, the page number, etc.
		// },
	}

	// Manually serialize the struct fields into the protobuf message
	data, err := manualMarshal(request)
	if err != nil {
		fmt.Println("Error encoding protobuf:", err)
		return
	}

	// Convert the byte slice to a hexadecimal string
	protoMessage := hex.EncodeToString(data)

	// Construct the payload string and use the protoMessage variable in the data key
	payload := strings.NewReader(fmt.Sprintf(`{"jsonrpc":"2.0","id":0,"method":"abci_query","params":{"data":"%s","height":"0","path":"/akash.deployment.v1beta3.Query/Deployments","prove":false}}`, protoMessage))

```

_**QueryDeploymentsRequest Type**_

* Source code for this type is located [here](https://github.com/akash-network/akash-api/blob/main/go/node/deployment/v1beta3/query.pb.go)

```
// QueryDeploymentsRequest is request type for the Query/Deployments RPC method
type QueryDeploymentsRequest struct {
	Filters    DeploymentFilters  `protobuf:"bytes,1,opt,name=filters,proto3" json:"filters"`
	Pagination *query.PageRequest `protobuf:"bytes,2,opt,name=pagination,proto3" json:"pagination,omitempty"`
}
```