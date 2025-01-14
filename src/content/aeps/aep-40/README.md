---
aep: 40
title: "Continuous Provider Audits"
author: Anil Murty (@anilmurty)
status: Draft
type: Standard
category: Interface
created: 2024-12-01
updated: 2025-01-10
estimated-completion: 2025-05-15
roadmap: minor
---

## Motivation
One of the barriers to Akash adoption is giving users confidence that providers on the network can be trusted.

## Summary
The scope of the effort here involves implmenting a system that can run periodic tests to audit providers and report the data back through an API which can them be consumed by clients like Console. The design for this needs to be vetted out but it will likely involve modification of the provider software to include an inventory service that reports capabilities of the provider and potenentially an agent or daemon that executes periodic tests. The design within Akash Console will likely build on the existing "up time" indicators that show up when a user clicks on the provider details page as well as reflected in the overall "score" of the provider (similar to up time)
