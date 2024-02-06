---
categories: ["Akash Development Environment"]
tags: []
title: "Use Runbook"
linkTitle: "Use Runbook"
weight: 1
description: >-
---



> _**NOTE**_ - this runbook requires three simultaneous terminals

For the purpose of documentation clarity we will refer to these terminal sessions as:

* terminal1
* terminal2
* terminal3

### STEP 1 - Open Runbook

> _**NOTE**_ - run the commands in this step on terminal1, terminal2, and terminal3&#x20;

Run this step on all three terminal sessions to ensure we are in the correct directory for later steps.

```
cd ~/go/src/github.com/akash-network/provider/_run/kube
```

### STEP 2 - Create and Provision Local Kind Kubernetes Cluster

> _**NOTE**_ - run this command in this step on terminal1 only

> _**NOTE**_ - this step may take several minutes to complete

```
make kube-cluster-setup
```

#### Possible Timed Out Waiting for the Condition Error

If the following error is encountered when running `make kube-cluster-setup`:

```
Waiting for deployment "ingress-nginx-controller" rollout to finish: 0 out of 1 new replicas have been updated...
Waiting for deployment "ingress-nginx-controller" rollout to finish: 0 of 1 updated replicas are available...
error: timed out waiting for the condition
make: *** [../common-kube.mk:120: kube-setup-ingress-default] Error 1
```

This is an indication that the Kubernetes ingress-controller did not initialize within the default timeout period.  In such cases, re-execute `make kube-cluster-setup` with a custom timeout period such as the example below.  This step is NOT necessary if `make kube-cluster-setup` completed on first run with no errors encountered.

```
cd provider/_run/<kube|single|ssh>
make kube-cluster-delete
make clean
make init
KUBE_ROLLOUT_TIMEOUT=500 make kube-cluster-setup
```

### STEP 3 - Start Akash Node

> _**NOTE**_ - run this command in this step on terminal2 only

```
make node-run
```

### STEP 4 - Create an Akash Provider

> _**NOTE**_ - run this command in this step on terminal1 only

```
make provider-create
```

#### Note on Keys

Each configuration creates four keys: The keys are assigned to the targets and under normal circumstances there is no need to alter it. However, it can be done with setting KEY\_NAME:

```
# create provider from **provider** key
make provider-create

# create provider from custom key
KEY_NAME=other make provider-create
```

### STEP 5 - Start the Akash Provider

> _**NOTE**_ - run this command in this step on terminal3 only

```
make provider-run
```

### STEP 6 - Create and Verify Test Deployment

> _**NOTE**_ - run the commands in this step on terminal1 only

#### Create the Deployment

* Take note of the deplpyment ID (DSEQ) generated for use in subsequent steps

```
make deployment-create
```

#### Query Deployments

```
make query-deployments
```

#### Query Orders

* Steps ensure that an order is created for the deployment after a short period of time

```
make query-orders
```

#### Query Bids

* Step ensures the Provider services daemon bids on the test deployment

```
make query-bids
```

### STEP 7 - Test Lease Creation for the Test Deployment

> _**NOTE**_ - run the commands in this step on terminal1 only

#### Create Lease

```
make lease-create
```

#### Query Lease

```
make query-leases
```

#### Ensure Provider Received Lease Create Message

* Should see "pending" inventory in the provider status and for the test deployment

```
make provider-status
```

### STEP 8 - Send Manifest

> _**NOTE**_ - run the commands in this step on terminal1 only

#### Send the Manifest to the Provider

```
make send-manifest
```

#### Check Status of  Deployment

```
make provider-lease-status
```

#### Ping the Deplpyment to Ensure Liveness

```
 make provider-lease-ping
```

### STEP 9 - Verify Service Status

> _**NOTE**_ - run the commands in this step on terminal1 only

#### Query Lease Status

```
make provider-lease-status
```

#### Fetch Pod Logs

* Note that this will fetch the logs for all pods in the Kubernetes cluster.  Filter/search for the test deployment's ID (DSEQ) for related activities.

```
make provider-lease-logs
```