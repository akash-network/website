---
aep: 49
title: "Virtual Machines"
author: Artur Troian (@troian)
status: Draft
type: Standard
category: Core
created: 2024-12-01
updated: 2025-01-11
estimated-completion: 2026-02-20
roadmap: major
---

## Summary

The concept of virtual machines (VMs) for the Akash Network revolves around leveraging decentralized cloud computing resources to deploy, manage, and scale Virtual Machines securely and cost-effectively.

This AEP will be extended via Github discussion and updated with the results and further details.

## Motivation
Not all workloads are containerized. Many enterprises and users rely on legacy applications that run exclusively on VMs. By supporting VMs, Akash can:
- Enable the migration of legacy applications without requiring extensive re-architecting.
- Attract customers from industries reliant on VM-based infrastructures, such as finance and healthcare.

## Specification

There are a few options to support VMs on Akash:
- [KubeVirt](https://kubevirt.io/) is a Kubernetes extension designed to manage and run virtual machines (VMs) alongside containerized workloads within a Kubernetes cluster.
    At this moment, KubeVirt seems to be most viable option as Akash deployments run on Kubernetes. This also implies minimal to no changes to the current deployment model.
- [QEMU](https://www.qemu.org/) is a full system emulator and virtualizer.
- [Firecracker](https://firecracker-microvm.github.io/) is a fast and lightweight virtualization solution.

Both QEMU and Firecracker will require changes to the current deployment model as well as designing and developing new provider stack.

## Copyright

All content herein is licensed under [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0).
