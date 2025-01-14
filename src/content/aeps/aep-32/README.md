---
aep: 32
title: "Akash Provider Console 1.0"
author: Anil Murty (@anilmurty) Jigar Patel (@jigar-arc10) Deval Patel (devalpatel67)
status: Draft
type: Standard
category: Interface
created: 2024-12-01
updated: 2025-01-10
estimated-completion: 2025-01-30
roadmap: major
---

## Motivation

Make Akash Provider set up and management easy, with the goal of onboarding 100s of new providers. 

## Summary

Akash Provider Console will be a cloud based product that complements the Deployment Console (Akash Console). It's primary objective will be to provide an easy way for new DC operators (and other compute providers) to onboard themselves (self-serve) on to Akash with little to no support from the Akash core team or community. This will include automatic set up of a Kubernetes cluster on user provided VMs and installation and configuration of Akash provider software on top of that Kubernetes cluster (including networking, attributes and pricing configuration). As a secondary objective, the Provider Console will give new and existing compute providers tools to manage their Akash providers better. This will include things like a dashboard that shows leases, earnings, resources and profitability as well as some tools to view and manage leases running on the provider and to maintain (update and upgrade things) the provider. Over time the provider console will add several quality of life features including observability tooling set up and reporting (metrics & logs), content moderation, notifications (from provider to tenants) and more.
