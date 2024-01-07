---
categories: ["Providers"]
tags: []
weight: 2
title: "Custom Kubernetes Cluster Settings"
linkTitle: "Custom Kubernetes Cluster Settings"
---

This document details necessary settings in custom Kubernetes environments for use as an Akash Provider

## VMware Tanzu

### Kube-System Namespace Labeling

- Make sure kube-system namespace has kubernetes.io/metadata.name: kube-system label

```
kubectl label namespace kube-system kubernetes.io/metadata.name=kube-system
```

Why? This is required by the akash-deployment-restrictions Network Policy to allow Pods access the kube-dns.
