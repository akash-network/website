---
aep: 60
title: "NextGen AMD GPU support"
author: Anil Murty (@anilmurty)
status: Draft
type: Standard
category: Core
created: 2024-01-05
updated: 2024-01-05
estimated-completion: 2025-03-15
roadmap: minor
---


## Motivation

Akash providers and users would like to be able to provide and user AMD GPUs.

## Summary

While Akash added support for AMD GPUs in 2024, there are indications that the support may have regressed since the Feature Discovery service was implemented. Specifically, AMD GPUs are not being labeled correctly even when added to the GPU database. The scope of this AEP is to fix this issue and to test with the latest available AMD GPUs like the MI300 to ensure that it all works asa expected.
