---
categories: ["Akash Client - Create Transactions"]
tags: []
title: "Client New Function"
linkTitle: "Client New Function"
weight: 1
description: >-
---

> [Source code reference location](https://github.com/chainzero/akash-client/blob/main/akashrpcclient\_withtx/main.go)

The `New` function is called from `main.go` initiating the creation of a new client instance.  The `New` method in the local `client` package is called.

```
// Account `chainzero` was available in local OS keychain from test machine
accountName := "chainzero"
// accountAddress := "akash1w3k6qpr4uz44py4z68chfrl7ltpxwtkngnc6xk"

ctx := context.Background()
addressPrefix := "akash"

// Create a Cosmos client instance
client, err := client.New(ctx, client.WithAddressPrefix(addressPrefix))
if err != nil {
	log.Fatal(err)
}
```

> [Source code reference location](https://github.com/chainzero/akash-client/blob/main/akashrpcclient\_withtx/client/client.go)

The `New` function in the `client` returns  `Client` struct using hardcoded/default values some of which are defined as constants with in our example code.  Ability to dynamically override these default values would be needed in a production client but is not necessary in our client.

<pre><code><strong>...TRUNCATED...
</strong><strong>const (
</strong>	// GasAuto allows to calculate gas automatically when sending transaction.
	GasAuto = "auto"

	defaultNodeAddress   = "https://akash-rpc.polkachu.com:443"
	defaultGasAdjustment = 2.0
	defaultGasPrice      = "0.025uakt"
	// defaultGasLimit      = 300000

	defaultTXsPerPage = 30

	searchHeight = "tx.height"

	orderAsc = "asc"
)

...TRUNCATED...
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
</code></pre>

Examining additional elements of the Client struct - located in the same file - are needed for downstream operations such as reading the account from the keyring.

* Location of keyring
* Address of the deployment account
* Gas settings - expanded upon on the broadcast section of this doc

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