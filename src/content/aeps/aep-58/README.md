---
aep: 58
title: "Per Node Resources in Console"
author: Anil Murty (@anilmurty)
status: Draft
type: Standard
category: Interface
created: 2024-01-05
updated: 2024-01-05
estimated-completion: 2025-05-15
roadmap: minor
---


## Motivation

Akash users frequently receive no bids from providers even though there are enough GPUs on the provider because either there aren't enough GPUs on a single node or there are not enough other resources (CPU, Memory, etc.) on a single node. 

## Summary

The solution requires some deeper thought and brainstorming but here are some initial thoughts and approaches. Note that the ideal solution is one that prevents the issue from occurring in the first place but an improvement (to the current experience) is a solution that provides information to the user about the (apparent) discrepancy and/ or prevents them from requesting bids for workloads that are not likely to get any

- Resources Per Node: Providing per node counts for GPUs or at least max available on any node of the provider in https://console.akash.network/providers -- This would be a column called "Max requestable per deployment" or something. Alternatively, it could be a filter on the table that lets the user specify the count they intend to request and it filters and shows the providers that have >= that count available on any node.

- Quick Check before initiating deployment: Implementing a "Quick Check" button on the SDL builder page that the user can click, which will run a query to return if there are any providers that can meet the needs, while indicating which recommending which resource should be reduced to increase the number of bids received. Note that the reason for doing it here (rather than in the bids stage, is because the user can adjust the resources here while to do that once the deployment is created requires closing the existing deployment and starting a new one)
