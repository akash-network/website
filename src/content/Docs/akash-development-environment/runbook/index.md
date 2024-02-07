---
categories: ["Akash Development Environment"]
tags: []
title: "Runbook"
linkTitle: "Runbook"
weight: 1
description: >-
---

There are four configuration variants, each presented as directory within[ \_run](https://github.com/akash-network/provider/tree/main/\_run).

* `kube` - uses `kind` to set up local cluster. It is widely used by e2e testing of the provider. Provider and the node run as host services. All operators run as kubernetes deployments.
* `single` - uses `kind` to set up local cluster. Main difference is both node and provider (and all operators) are running within k8s cluster as deployments. (at some point we will merge `single` with `kube` and call it `kind`)
* `minikube` - not in use for now
* `ssh` - expects cluster to be up and running. mainly used to test sophisticated features like `GPU` or `IP leases`

The only difference between environments above is how they set up. Once running, all commands are the same.

Running through the entire runbook requires multiples terminals. Each command is marked **t1**-**t3** to indicate a suggested terminal number.

If at any point something goes wrong and cluster needs to be run from the beginning:

```shell
cd provider/_run/<kube|single|ssh>
make kube-cluster-delete
make clean
make init
```