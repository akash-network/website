---
categories: ["Akash Client - Create Transactions"]
tags: []
title: "Retrieve Account from Keyring"
linkTitle: "Retrieve Account from Keyring"
weight: 1
description: >-
---

## Keyring Lookup via Name or Address

> [Source code reference location](https://github.com/chainzero/akash-client/blob/main/akashrpcclient\_withtx/main.go)

As we begin the process of looking up the signing account in the keyring, decision can be made to initiate the lookup either by provided key name or account address.

In the example code a local key name of `chainzero` is used to conduct a lookup by name.

```
...TRUNCATED...
///////TX OPERATIONS/////////

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

// Get account from the keyring
account, err := client.Account(accountName)
if err != nil {
	log.Fatal(err)
}

...TRUNCATED...
```

## Account Function Call

> [Source code reference location](https://github.com/chainzero/akash-client/blob/main/akashrpcclient\_withtx/client/client.go)

The `Account` method - called from `main.go` - and in the `client` local package provokes a keyring lookup based on declaration of keyring location.&#x20;

As the Account method may be passed either a key name or address:

* First an attempt to lookup the passed in argument by name and via the `GetByName` method is attempted
* Second - and only if `GetByName` returns an error based on the failure to lookup the account in the keyring by name - the `GetByAddress` method is attempted

The `GetByName` and `GetByAddress` methods are located in the local `account` package and are detailed in the subsequent section.

```
...TRUNCATED...
func (c Client) Account(nameOrAddress string) (account.Account, error) {
	defer c.lockBech32Prefix()()

	acc, err := c.AccountRegistry.GetByName(nameOrAddress)
	if err == nil {
		return acc, nil
	}
	return c.AccountRegistry.GetByAddress(nameOrAddress)
}
...TRUNCATED...
```

## Get Account By Name or Address

> [Source code reference location](https://github.com/chainzero/akash-client/blob/main/akashrpcclient\_withtx/account/account.go)

The `GetByName` and `GetByAddress` methods invoke upsrream calls to the Cosmos SDK `keyring` package located [here](https://github.com/cosmos/cosmos-sdk/blob/main/crypto/keyring/keyring.go).

```
func (r Registry) GetByName(name string) (Account, error) {
	info, err := r.Keyring.Key(name)
	if errors.Is(err, dkeyring.ErrKeyNotFound) || errors.Is(err, sdkerrors.ErrKeyNotFound) {
		return Account{}, &AccountDoesNotExistError{name}
	}
	if err != nil {
		return Account{}, err
	}

	acc := Account{
		Name: name,
		Info: info,
	}

	return acc, nil
}

// GetByAddress returns an account by its address.
func (r Registry) GetByAddress(address string) (Account, error) {

	sdkAddr, err := sdktypes.AccAddressFromBech32(address)
	if err != nil {
		return Account{}, err
	}
	info, err := r.Keyring.KeyByAddress(sdkAddr)
	if errors.Is(err, dkeyring.ErrKeyNotFound) || errors.Is(err, sdkerrors.ErrKeyNotFound) {
		return Account{}, &AccountDoesNotExistError{address}
	}
	if err != nil {
		return Account{}, err
	}
	return Account{
		Name: address,
		Info: info,
	}, nil
}
```