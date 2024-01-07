---
categories: ["Akash Client - Create Transactions"]
tags: []
title: "Deployment ID Message Population"
linkTitle: "Deployment ID Message Population"
weight: 1
description: >-
---


> [Source code reference location](https://github.com/chainzero/akash-client/blob/main/akashrpcclient\_withtx/main.go)

For the purpose of eventually sending such info in the message - in this step we declare a `DeploymentID` struct and then populate the fields of:

* _**Owner**_ - account of the deployer
* _**DSeq**_ - the deployment ID which we will set to the current block height of the Akash blockchain

## Code Review

As we continue message construction a variable with the name of `id` is created which is of type `DeploymentID`.  The type is defined in Deployment module and in the following Protobuf file:

[github.com/akash-network/node/x/deployment/types/v1beta2/deployment.pb](https://github.com/akash-network/node/blob/52d5ee5caa2c6e5a5e59893d903d22fe450d6045/x/deployment/types/v1beta2/deployment.pb.go#L59)

A couple of Cosmos SDK functions are called to perform the following objectives:

* _**GetFromBech32 -**_ take the human readable bech32 address and convert it to a slice of bytes.  Within the called logic a sanity check of the account prefix - which is `akash` in this chain - is conducted.
* _**AccAddress**_ - take the slice of bytes returned from previous function and convert it to string.  This does not occur via a simple string conversion but rather calls the `String` method defined in our source code > utils directory/package that parses/formats the slice of bytes appropriately and makes several validations of address format.

The returned data is stored as the `DeploymentID` struct `Owner` field.

Additionally we use a simple API request in the `utils` package and via the `BlockHeight` function to get the current block height of the chain and store it as the `DeploymentID` struct's `DSeq` field.  The returned value - which is an integer - is converted to string which the struct expects.

```
....truncated....
id := v1beta2.DeploymentID{}

// Replace the Akash address below with the address that should be used for deployment creation
bech32Address := "akash1w3k6qpr4uz44py4z68chfrl7ltpxwtkngnc6xk"

ownerBytes, err := sdk.GetFromBech32(bech32Address, accountPrefix)
if err != nil {
	fmt.Println("Error from GetFromBech32: ", err)
}

accOwnerBytes := sdk.AccAddress(ownerBytes)

id.Owner = utils.String(accOwnerBytes)

id.DSeq, err = strconv.ParseUint(utils.BlockHeight(), 10, 64)
if err != nil {
	fmt.Println("Error: ", err)
}
....truncated....
```