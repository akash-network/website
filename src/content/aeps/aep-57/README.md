---
aep: 57
title: "Automatic Escrow Top Up"
author: Iaroslav Gryshaiev (@ygryshajev) Maxime Beauchamp (@baktun14) Anil Murty (@anilmurty)
status: Draft
type: Standard
category: Interface
created: 2024-01-05
updated: 2024-01-05
estimated-completion: 2025-01-30
roadmap: minor
---


## Motivation

Akash users would like to have the option of having their escrow account automatically topped up from their wallets or accounts (in case of credit cards) so that it doesn't run out of funds and close their deployments.

## Summary

Implement a new UI setting in the existing settings page that allows users to enable or disable automatic top-ups for Akash Network deployments under custodial wallets via AuthZ deployment grants.
https://github.com/akash-network/console/issues/412

Implement a worker CLI handler that automatically adds funds (top-ups) to Akash Network deployments when they are low on balance. This ensures deployments continue to run without requiring users to manually monitor and replenish funds, improving the user experience.
https://github.com/akash-network/console/issues/395 