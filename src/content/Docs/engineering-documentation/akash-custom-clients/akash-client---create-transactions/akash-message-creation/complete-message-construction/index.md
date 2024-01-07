---
categories: ["Akash Client - Create Transactions"]
tags: []
title: "Complete Message Construction"
linkTitle: "Complete Message Construction"
weight: 1
description: >-
---



In this section of our code in `main.go` we complete the remaining values need in a message type defined in the Akash source code of `MsgCreateDeployment`.

The `MsgCreateDeployment` struct is defined within:

[github.com/akash-network/node/x/deployment/types/v1beta2/deploymentmsg.pb.go](https://github.com/akash-network/node/blob/52d5ee5caa2c6e5a5e59893d903d22fe450d6045/x/deployment/types/v1beta2/deploymentmsg.pb.go#L28)

## Code Review

Most of this code is self-explanatory. For example the `Version` (Akash code) and `ParseCoinNormalized` (CosmosSDK) define the hash version of the SDL and convert an AKT string deposit declaration for the deployment.

Sending the SDL read earier from file and stored as `sdlManifest` is sent to the Akash `DeploymentGroups` method to eventually store in the `GroupSpec` struct that capture individual profiles defined and required in the manifest.  A slice of such `GroupSpec` structs is stored in the `MsgCreateDeployment` struct's `Groups` field.

```
...truncated...
version, err := sdl.Version(sdlManifest)
if err != nil {
	fmt.Println("Error from Version: ", err)
}

deposit := "5000000uakt"
depositCoin, err := sdk.ParseCoinNormalized(deposit)
if err != nil {
	fmt.Println("Error ParseCoinNormalized: ", err)
}

groups, err := sdlManifest.DeploymentGroups()
if err != nil {
	fmt.Println("Error: ", err)
}

msg := &v1beta2.MsgCreateDeployment{
	ID:      id,
	Version: version,
	Groups:  make([]v1beta2.GroupSpec, 0, len(groups)),
	Deposit: depositCoin,
	// Depositor: depositorAcc,
	Depositor: id.Owner,
}

for _, group := range groups {
	msg.Groups = append(msg.Groups, *group)
}

if err := msg.ValidateBasic(); err != nil {
	fmt.Println("Error from ValidateBasic: ", err)
}
...truncated...
```