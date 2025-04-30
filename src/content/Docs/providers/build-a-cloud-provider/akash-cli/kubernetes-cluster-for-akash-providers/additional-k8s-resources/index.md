---
categories: ["Providers"]
tags: ["Akash Provider", "Kubernetes", "Resources"]
weight: 2
title: "Additional K8s Resources"
linkTitle: "Additional K8s Resources"
description: "Additional resources and examples for Kubernetes cluster setup"
---

## Kubespray Hosts.Yaml Examples

### Hosts.Yaml Overview

The Kubespray hosts.yaml inventory file is composed of 3 groups:

- **kube_node**: list of Kubernetes nodes where the pods will run.
- **kube_control_plane**: list of servers where Kubernetes control plane components (apiserver, scheduler, controller) will run.
- **etcd**: list of servers to compose the etcd server. You should have at least 3 servers for failover purpose.

Please following these links for YAML examples and depending on your preferred topology:

- [Kubespray Hosts.Yaml Examples](#kubespray-hostsyaml-examples)
  - [Hosts.Yaml Overview](#hostsyaml-overview)
- [All-In-One Node](#all-in-one-node)
  - [Topology](#topology)
  - [ Pros](#-pros)
  - [Cons](#cons)
  - [Example Hosts.yaml File](#example-hostsyaml-file)
- [One Control Plane Node with Multiple Worker Nodes](#one-control-plane-node-with-multiple-worker-nodes)
  - [Topology](#topology-1)
  - [Pros](#pros)
  - [Cons](#cons-1)
  - [Example Hosts.yaml File](#example-hostsyaml-file-1)
- [Multiple Control Plane Nodes with Multiple Work Nodes](#multiple-control-plane-nodes-with-multiple-work-nodes)
  - [Topology](#topology-2)
  - [Pros](#pros-1)
  - [Cons](#cons-2)
  - [Example Hosts.yaml File](#example-hostsyaml-file-2)

## All-In-One Node

### Topology

- node1 - is a single control plane + etcd node
- node1 - is also running the pods

### &#x20;Pros

- Easy to manage

### Cons

- Single point of failure for K8s/etcd/pods;
- Thinner security barrier since pods are running on control plane / etcd nodes;

### Example Hosts.yaml File

```
  children:
    kube_control_plane:
      hosts:
        node1:
    kube_node:
      hosts:
        node1:
    etcd:
      hosts:
        node1:
    k8s_cluster:
      children:
        kube_control_plane:
        kube_node:
    calico_rr:
      hosts: {}
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

### Example Hosts.yaml File

```
 children:
    kube_control_plane:
      hosts:
        node1:
    kube_node:
      hosts:
        node2:
        node3:
    etcd:
      hosts:
        node1:
    k8s_cluster:
      children:
        kube_control_plane:
        kube_node:
    calico_rr:
      hosts: {}
```

## Multiple Control Plane Nodes with Multiple Work Nodes

### Topology

- Nodes 1.-3 - the control plane + etcd nodes; (This makes K8s High Available)
- Node 4.-N - the kube nodes on which the Pods will run

### Pros

- Highly available control plane / etcd
- Better security barrier since pods aren't running on control plane / etcd nodes
- Can scale by adding either more control plane nodes or worker nodes

### Cons

- More complex environment makes its configuration & management more difficult

### Example Hosts.yaml File

```
  children:
    kube_control_plane:
      hosts:
        node1:
        node2:
        node3:
    kube_node:
      hosts:
        node4:
        node5:
        node6:
    etcd:
      hosts:
        node1:
        node2:
        node3:
    k8s_cluster:
      children:
        kube_control_plane:
        kube_node:
    calico_rr:
      hosts: {}
```
