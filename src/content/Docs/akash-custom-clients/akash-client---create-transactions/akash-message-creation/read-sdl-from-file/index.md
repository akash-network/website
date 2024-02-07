---
categories: ["Akash Client - Create Transactions"]
tags: []
title: "Read SDL from File"
linkTitle: "Read SDL from File"
weight: 1
description: >-
---


> [Source code reference location](https://github.com/chainzero/akash-client/blob/main/akashrpcclient\_withtx/main.go)

The Create Deployment message construction begins with the reading of SDL (Stack Definition Language) manifest from file.

## Relevant Code

Based on the purpose and utility of the client/integration the SDL may instead be prompted from the user but in this example our code expects the manifest to live within the current working directory and the `testsdl` subdirectory. &#x20;

The locale of the SDL could obviously be updated easily - I.e. use a different subdirectory - easily.

```
...TRUNCATED...
// Start of Msg Create logic
// Logic derived from code initiated via: https://github.com/akash-network/node/blob/52d5ee5caa2c6e5a5e59893d903d22fe450d6045/x/deployment/client/cli/tx.go#L83

sdlLocation := ("./testsdl/deploy.yml")
accountPrefix := "akash"

sdlManifest, err := sdl.ReadFile(sdlLocation)
if err != nil {
	fmt.Println(err)
}
...TRUNCATED...
```

## ReadFile Method - Additional Detail

The `ReadFile` method is called from Akash source code and from within the following path/file.

> [github.com/akash-network/node/sdl/sdl.go](https://github.com/akash-network/node/blob/master/sdl/sdl.go)

_**ReadFile Method**_

As seen in the Akash source code capture from this file the SDL is read via a simple os.ReadFile function call and then passed into the `Read` function as a slice of bytes.

```
// ReadFile read from given path and returns SDL instance
func ReadFile(path string) (SDL, error) {
	buf, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	return Read(buf)
}
```

_**Read Function**_

The `Read` function takes the SDL read from file and unmarshalls the data into a `sdl` struct.

Several pieces of data parsing are initiated with the `Read` function -including passing the SDL struct to the `DeploymentGroups` method and subsequent validation of those deployment groups - and eventually the SDL struct is returned from to ReadFile which in turn returns the SDL struct to `main.go`.

The returned SDL struct is stored as variable `sdlManifest` in our `main.go` file and processing of the message proceeds.

```
// Read reads buffer data and returns SDL instance
func Read(buf []byte) (SDL, error) {
	obj := &sdl{}
	if err := yaml.Unmarshal(buf, obj); err != nil {
		return nil, err
	}

	if err := obj.validate(); err != nil {
		return nil, err
	}

	dgroups, err := obj.DeploymentGroups()
	if err != nil {
		return nil, err
	}

	vgroups := make([]dtypes.GroupSpec, 0, len(dgroups))
	for _, dgroup := range dgroups {
		vgroups = append(vgroups, *dgroup)
	}

	if err := dtypes.ValidateDeploymentGroups(vgroups); err != nil {
		return nil, err
	}

	m, err := obj.Manifest()
	if err != nil {
		return nil, err
	}

	if err := validation.ValidateManifest(m); err != nil {
		return nil, err
	}

	return obj, nil
}
```