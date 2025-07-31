---
aep: 70
title: "Console API - JWT, Events & Logs"
author: Anil Murty (@anilmurty) Maxime Beauchamp (@baktun14)
status: draft
type: Standard
category: Interface
created: 2025-05-28
updated: 2025-07-30
estimated-completion: 2025-08-30
roadmap: minor
---


## Motivation

Accessing the API requires creating a certificate and working with mTLS. JWT eliminates the need for these.

## Summary

This is a follow up to the [AEP-63](https://akash.network/roadmap/aep-63/)

## High Level Specification:

1. Transition all existing endpoints to use JWT Authentication. This requires [AEP-64](https://akash.network/roadmap/aep-64/) to be complete
2. Implement Retrieving Logs: `GET/v1/logs/{dseq}`
3. Implement Retrieving Events: `GET/v1/events/{dseq}`
4. Implement Funding Account via stripe checkout