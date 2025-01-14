---
aep: 41
title: "Standard Provider Attributes"
author: Anil Murty (@anilmurty)
status: Draft
type: Standard
category: Interface
created: 2024-12-01
updated: 2024-12-01
estimated-completion: 2025-04-30
roadmap: minor
---

## Motivation

Consistent provider attributes let clients and users be able to query and filter on them.

## Summary

Akash providers set attributes manually which leads to inconsistency in the attribute naming and is error prone. Further this relies on providers being trusted to not intentionally fake attributes. In order to solve this, provider attributes should ideally be set automatically by an inventory service (that runs on the provider) that reads the capability of the provider. There will be certain attributes that will need be manually set but those should be very few (and not reflect the core capabilities of the provider that clients trust).
