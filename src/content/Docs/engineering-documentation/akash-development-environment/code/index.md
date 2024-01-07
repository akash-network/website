---
categories: ["Akash Development Environment"]
tags: []
title: "Code"
linkTitle: "Code"
weight: 1
description: >-
---


For this example, repositories will be located in `~/go/src/github.com/akash-network`. Create directory if it does not already exist via:

```
mkdir -p ~/go/src/github.com/akash-network
```

## Clone Akash Node and Provider Repositories

> _**NOTE**_ - all commands in the remainder of this guide  assume a current directory of `~/go/src/github.com/akash-network`unless stated otherwise.

```shell
cd ~/go/src/github.com/akash-network 
git clone https://github.com/akash-network/node.git
git clone https://github.com/akash-network/provider.git
```

## Allow Direnv Management of Provider Directory

```
cd provider
direnv allow
```