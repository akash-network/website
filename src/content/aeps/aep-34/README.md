---
aep: 34
title: "Workload Log Forwarding via Akash Console"
author: Anil Murty (@anilmurty) 
status: Draft
type: Standard
category: Interface
created: 2024-12-01
updated: 2025-01-10
estimated-completion: 2025-03-15
roadmap: minor
---

## Motivation

Customers need to be able to debug issues that occur with their deployments. In the absense of log forwarding, customers can only view limited logs in Console and the logs are lost when the lease closes

## Summary

Users of Akash Console will have the option to configure log forwarding on any deployment within their account. Doing so will forward logs from the container(s) within that deployment to an external logging service where the logs can be viewed and queried. The initial set of external logging service providers supported will be Datadog & Grafana with others added over time. The log forwarder configuration itself will involve specifying API key and secret for the specific logging service (that the user will set up and pay for directly with the said logging service provider). The log forwarding function will likely be achieved using a sidecar container that will authenticate and communicate with the main deployment containers -- this part will be handled seamlessly for the user.
