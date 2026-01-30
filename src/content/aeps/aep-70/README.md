---
aep: 70
title: "Console API using JWT"
author: Anil Murty (@anilmurty) Maxime Beauchamp (@baktun14)
status: draft
type: Standard
category: Interface
created: 2025-05-28
updated: 2025-07-30
completed: 2025-08-30
resolution: https://github.com/akash-network/console/milestone/21?closed=1
roadmap: minor
---


## Motivation

Accessing the API requires creating a certificate and working with mTLS. JWT eliminates the need for these.

## Summary

This is a follow up to the [AEP-63](https://akash.network/roadmap/aep-63/)

## High Level Specification:

1. Transition all existing endpoints to use JWT Authentication. This requires [AEP-64](https://akash.network/roadmap/aep-64/) to be complete