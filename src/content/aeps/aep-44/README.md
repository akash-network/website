---
aep: 44
title: "Reserved Instances"
author: Anil Murty (@anilmurty) Artur Troian (@troian)
status: Draft
type: Standard
category: Core
created: 2024-12-01
updated: 2025-01-11
estimated-completion: 2026-08-30
roadmap: minor
---

## Motivation

Users/ cusotmers of Akash Network often come from traditional cloud services where they are able to "reserve" a certain number and type of instances for a period of time which gives them the assurance that they will always have access to that exact infrastructure and also provides them lower discounts (for committed use). This is not possible on Akash.

## Summary

Akash Provider software allows for implementing a whitelist of wallets which then limits which tenant workloads will receive bids from the provider. While this provides one way of "reserving" capacity for a specific user/ customer it has a couple of limitations. First, the whitelist can only be applied to the whole provider (all nodes) and not per node (let alone per GPU). And second, setting this up is a fairly manual process (that requires the tenant to directly communicate with the provider).

The ideal user experience is one where a user deploying via Akash Console receives multiple bids from each provider that bids on their workload - potentially as a table of bids with multiple columns. One set of bids is for "on-demand" lease while the others are for different lenghts of "reservations" (say 3months, 6months, 9months, 12 months). The longer the reservation (committment) the lower the price.

Choosing a given reserved price should do two things. First it should check and attempt to escrow funds from the users wallet to cover the entire duration of the resevation for the requested resources. Second it should allocate a portion of the provider (likely one or more nodes of the provider) to that specific tenant - this will need to be done by dynamically updating a whitelist that can be applied per node of the provider.
