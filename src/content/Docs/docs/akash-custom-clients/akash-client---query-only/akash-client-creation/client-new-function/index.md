---
categories: ["Akash Custom Clients"]
tags: []
title: "Client New Function"
linkTitle: "Client New Function"
weight: 1
description: >-
---

> [Source code reference location](https://github.com/chainzero/akash-client/blob/main/akashrpcclient\_queryonly/client/client.go)

The `New` function is called from `main.go` initiating the creation of a new client instance.

```
// New creates a new client with given options.
func New(ctx context.Context, options ...Option) (Client, error) {
	c := Client{
		nodeAddress:    defaultNodeAddress,
		keyringBackend: account.KeyringTest,
		addressPrefix:  "akash",
		out:            io.Discard,
		gas:            "auto",
	}
...TRAUNCATED....
```

Examining the Client struct - located in the same file - reveals the settings/definitions the the `New` method will populate including:

* RPC node address
* Location of keyring
* Address of the deployment account - expanded on in the coverage of transactions in this doc
* Gas setting - expanded on in the coverage of transactions in this doc

For the purpose of our blockchain query client build a majority of these fields are not necessary with RPC node address being the main setting of importance.

```
type Client struct {
	// RPC is Tendermint RPC.
	RPC rpcclient.Client

	// TxFactory is a Cosmos SDK tx factory.
	TxFactory tx.Factory

	// context is a Cosmos SDK client context.
	context client.Context

	// AccountRegistry is the registry to access accounts.
	AccountRegistry account.Registry

	accountRetriever client.AccountRetriever
	bankQueryClient  banktypes.QueryClient
	gasometer        Gasometer
	signer           Signer

	addressPrefix string

	nodeAddress string
	out         io.Writer
	chainID     string

	homePath           string
	keyringServiceName string
	keyringBackend     account.KeyringBackend
	keyringDir         string

	gas           string
	gasPrices     string
	gasAdjustment float64
	fees          string
	generateOnly  bool
}
```