---
categories: ["Providers"]
tags: ["Akash Provider", "Kubernetes", "Resources"]
weight: 2
title: "Additional K8s Resources"
linkTitle: "Additional K8s Resources"
description: "Additional resources and examples for Kubernetes cluster setup"
---

## Kubespray inventory.ini Examples

### inventory.ini Overview

The Kubespray inventory.ini file is composed of several key groups:

- **kube_control_plane**: list of servers where Kubernetes control plane components (apiserver, scheduler, controller) will run
- **kube_node**: list of Kubernetes nodes where the pods will run
- **etcd**: list of servers to compose the etcd server. 
- **etcd:children**: typically includes kube_control_plane for stacked etcd topology

Please following these links for YAML examples and depending on your preferred topology:

- [Kubespray inventory.ini Examples](#kubespray-inventory-examples)
  - [Inventory File Overview](#inventory-file-overview)
- [All-In-One Node](#all-in-one-node)
  - [Topology](#topology)
  - [Pros](#pros)
  - [Cons](#cons)
  - [Example Inventory File](#example-inventory-file)
- [One Control Plane Node with Multiple Worker Nodes](#one-control-plane-node-with-multiple-worker-nodes)
  - [Topology](#topology-1)
  - [Pros](#pros-1)
  - [Cons](#cons-1)
  - [Example Inventory File](#example-inventory-file-1)
- [Multiple Control Plane Nodes with Multiple Worker Nodes](#multiple-control-plane-nodes-with-multiple-worker-nodes)
  - [Topology](#topology-2)
  - [Pros](#pros-2)
  - [Cons](#cons-2)
  - [Example Inventory File](#example-inventory-file-2)

## All-In-One Node

### Topology

- node1 - is a single control plane + etcd node
- node1 - is also running the pods

### &#x20;Pros

- Easy to manage

### Cons

- Single point of failure for K8s/etcd/pods;
- Thinner security barrier since pods are running on control plane / etcd nodes;

### Example Inventory File

```
[kube_control_plane]
node1 ansible_host=95.54.0.12  # ip=10.3.0.1 etcd_member_name=etcd1

[etcd:children]
kube_control_plane

[kube_node]
node1 ansible_host=95.54.0.12  # ip=10.3.0.1
```

## One Control Plane Node with Multiple Worker Nodes

### Topology

- node1 - single control plane + etcd node
- node2..N - kube nodes where the pods will run

### Pros

- Better security barrier since pods aren't running on control plane / etcd nodes
- Can scale by adding either more control plane nodes or worker nodes

### Cons

- Single point of failure only for K8s/etcd but not the pods

### Example Inventory File

```
[kube_control_plane]
node1 ansible_host=95.54.0.12  # ip=10.3.0.1 etcd_member_name=etcd1

[etcd:children]
kube_control_plane

[kube_node]
node2 ansible_host=95.54.0.13  # ip=10.3.0.2
node3 ansible_host=95.54.0.14  # ip=10.3.0.3
```

## Multiple Control Plane Nodes with Multiple Worker Nodes

### Topology

- Nodes 1-3 - the control plane + etcd nodes; (This makes K8s High Available)
- Node 4-N - the kube nodes on which the Pods will run

### Pros

- Highly available control plane / etcd
- Better security barrier since pods aren't running on control plane / etcd nodes
- Can scale by adding either more control plane nodes or worker nodes

### Cons

- More complex environment makes its configuration & management more difficult

### Example Inventory File

```
[kube_control_plane]
node1 ansible_host=95.54.0.12  # ip=10.3.0.1 etcd_member_name=etcd1
node2 ansible_host=95.54.0.13  # ip=10.3.0.2 etcd_member_name=etcd2
node3 ansible_host=95.54.0.14  # ip=10.3.0.3 etcd_member_name=etcd3

[etcd:children]
kube_control_plane

[kube_node]
node4 ansible_host=95.54.0.15  # ip=10.3.0.4
node5 ansible_host=95.54.0.16  # ip=10.3.0.5
node6 ansible_host=95.54.0.17  # ip=10.3.0.6
```
