---
aep: 61
title: "Enhanced Read Performance Onchain Queries"
author: Artur Troian (@troian)
status: Last Call
type: Standard
category: Core
created: 2025-01-30
updated: 2025-02-18
completed: 2025-03-12
roadmap: major
---

## Motivation

Improve the read performance of the blockchain API by optimizing prefixes in `x/stores` based on object states.

## Summary

Many Akash Network API clients (e.g., Console and provider service) query the blockchain to get specific information about leases, orders, and other objects.

The current implementation uses a single unordered index per store, which creates challenges for clients when they need to query items of a specific state (e.g., active leases or open orders).
Currently, the market store contains over 1.3M order records, and for the provider service to catch up at startup, it must iterate over all of them to filter out open orders. Specifying filters like state in the query is ineffective and, in fact, reduces performance due to how store keys are built.

In the majority of cases, API clients are interested in objects that are in any state other than closed (i.e., active, open, paused, etc.). Therefore, it is feasible to split a single store into multiple stores, each containing objects of a specific state.

Certain stores (`x/market`, `x/authz`) will also benefit from reverse indexes to improve reading performance. For example, with `x/market`, adding reverse indexes for bids and leases will greatly improve query performance when clients look for bids/leases by provider.

## Implementation

The state of the object will be considered as part of the store prefix and will be prepended to the store key.
This approach has the following pros and cons:
- Pros:
    - reduces the number of items to iterate over when querying for objects of a certain state
    - retains pagination logic
- Cons:
    - Finding a specific object by ID will be `O(N)`, where `N` is the number of states a particular object can be in
    - Cost of certain transactions will likely increase due to the necessity of checking objects via multiple prefixes

### `x/deployment`

**Deployments** store will be updated with following prefixes:

- `{0x11, 0x00}` - deployments
    - `{0x01}` - active deployments
    - `{0x02}` - closed deployments
- `{0x12, 0x00}` - deployment groups
    - `{0x01}` - open deployment groups
    - `{0x02}` - paused deployment groups
    - `{0x03}` - deployment groups with insufficient funds
    - `{0x04}` - closed deployment groups

### `x/market`

**Orders** store will be updated with following prefixes:
- `{0x11, 0x00}` - orders
    - `{0x01}` - open orders
    - `{0x02}` - active orders
    - `{0x03}` - closed orders

**Bids** store will be updated with following prefixes:
- `{0x12, 0x00}` - bids
    - `{0x01}` - open bids, normal order
    - `{0x02}` - active bids, normal order
    - `{0x03}` - lost bids
    - `{0x04}` - closed bids
- `{0x12, 0x01}` - bids, with reverse index
    - `{0x01}` - open bids, with provider address as first token of the key
    - `{0x02}` - active bids, with provider address as first token of the key

**Leases** store will be updated with following prefixes:
- `{0x13, 0x00}` - leases
    - `{0x01}` - active leases
    - `{0x02}` - insufficient funds leases
    - `{0x03}` - closed leases
- `{0x13, 0x01}` - leases, with reverse index
    - `{0x01}` - active leases, with provider address as first token of the key

### `x/authz`

Store will update with following prefixes:
- `{0x01}` - grantor prefix (remains unchanged)
- `{0x03}` - grantee prefix. Format of the key is `0x03<granteeAddressLen (1 Byte)><granteeAddress_Bytes><granterAddressLen (1 Byte)><granterAddress_Bytes>: grants count`

**NOTE**: Index `{0x02}` is reserved to retain compatibility with future upgrade to Cosmos-SDK 0.47 upgrade. This upgrade introduces prefix `{0x02}` for `GrantsQueue` message.

## Copyright

All content herein is licensed under [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0).
