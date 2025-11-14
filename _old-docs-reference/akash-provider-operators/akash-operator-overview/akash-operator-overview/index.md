---
categories: ["Akash Provider Operators"]
tags: []
title: "Akash Operator Overview"
linkTitle: "Akash Operator Overview"
weight: 1
description: >-
---

## Suggested Pre-Reading

#### Kubebuilder for Operator Builds

Familiarity with Kubernetes Operators allows a better understanding of Akash provider Custom Resource Definitions (CRD) and custom controllers.

A very populate tool for scaffolding Kubernetes Operators is Kubebuilder. While the Akash Provider Operators were not created using Kubebuilder, reviewing this tool and experimenting with simple examples provided in the guide below serve as an excellent exposure to the creation of CRDs and associated controllers.

- [Kubebuilder Tutorials](https://book.kubebuilder.io/introduction.html)

#### Code-Generator for Operator Builds

The Akash code base uses [code-generator ](https://github.com/kubernetes/code-generator) for CRD and controller scaffolding. Code-Generator limits some of the bloated boiler-plate created via other tools like Kubebuilder. Many resources exist for an introduction to code-generator and listed below is one such article to increase familiarity with the scaffolded directory structure. With this knowledge in place we can begin digging into Akash Provider Operators.

- [Extending Kubernetes - Create Controllers for Core and Custom Resources (using code-generator)](https://trstringer.com/extending-k8s-custom-controllers/)

## Akash Provider Operators

- [Hostname Operator](/docs/akash-provider-operators/akash-operator-overview/hostname-operator-for-ingress-controller/hostname-operator-for-ingress-controller/)
- [IP Operator](/docs/akash-provider-operators/akash-operator-overview/ip-operator-for-ip-leases/)
- [Inventory Operator](/docs/akash-provider-operators/akash-operator-overview/inventory-operator-for-persistent-storage/)
