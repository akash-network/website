---
aep: 43
title: "Workload Utilization Metrics"
author: Anil Murty (@anilmurty) Artur Troian (@troian)
status: Draft
type: Standard
category: Interface
created: 2024-12-01
updated: 2024-01-11
estimated-completion: 2025-06-30
roadmap: minor
---

## Motivation

Tenants/ users of Akash expect to be able to see what amount of allocated resources are being used by their workloads so that they can better manage peak load and also optimize cost/ spend

## Summary

This AEP will likely require building the necessary contructs (metrics server/ agent) for collecting utilization metrics from the tenant containers and reporting them through an API that can be quried and graphed for display in clients like Console. The metrics collected initially will likely be GPU (VRAM), CPU, Memeory and Storage.
