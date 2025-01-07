---
aep: 36
title: "Custom Domain Configuration via Akash Console"
author: Anil Murty (@anilmurty)
status: Draft
type: Standard
category: Interface
created: 2024-12-01
updated: 2024-12-01
estimated-completion: 2025-06-30
roadmap: minor
---

## Motivation

Many users of Akash Console deploy apps and services that need a custom domain. Configuring the mapping from the endpoint (or port mapping) received when the lease is created requires going into a separate UI (like Cloudflare). Allowing this configuration within Console makes UX better

## Summary

Users of Akash Console will have the option of choosing their DNS provider of choice from a set of available options and then configuring custom domain. Console would take care of authenticating the user (via the API credentials for the speicifc DNS provider) and settin the configuration.
