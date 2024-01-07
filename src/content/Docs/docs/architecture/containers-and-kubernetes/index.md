---
categories: ["Architecture"]
tags: []
title: "Containers & Kubernetes"
linkTitle: "Containers & Kubernetes"
weight: 3
---


The **Akash Container Platform** serves as a deployment platform for hosting and managing [containers](#containers), providing users the capability to run _**any**_ Cloud-Native application. The Akash Network incorporates a set of cloud management services, including [Kubernetes](https://kubernetes.io), to orchestrate and manage containers seamlessly.

## Containers

A **container** represents a standardized software unit that encapsulates code and all its dependencies. This packaging allows applications to run consistently and reliably across various computing environments. A **container image** is a lightweight, standalone, executable package containing everything necessary to run an application: code, runtime, system tools, system libraries, and settings. At runtime, **container images** transform into **containers**. Whether for Linux or Windows-based applications, containerized software ensures uniform operation, irrespective of the underlying infrastructure. Containers provide isolation, ensuring consistent functionality regardless of differences between development and staging environments.

## Kubernetes

The Akash Network functions as a peer-to-peer network comprising clusters of computation nodes, each running Kubernetes. According to the official documentation:

> Kubernetes is a portable, extensible, open-source platform for managing containerized workloads and services, facilitating both declarative configuration and automation. It boasts a large, rapidly growing ecosystem, with widely available services, support, and tools.

> Kubernetes executes workloads by placing containers into Pods to run on Nodes. Nodes can be virtual or physical machines, depending on the cluster. Each node, managed by the control plane, houses the services necessary to run Pods.

The scalability, resilience, and security inherent in Kubernetes make it an ideal solution for providers to run their tenants' workloads. By leveraging this technology, Akash Network establishes itself as a decentralized Serverless Compute marketplace.