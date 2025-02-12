---
aep: 61
title: "Akash Network store optimizations"
author: Artur Troian (@troian)
status: Last Call
type: Standard
category: Core
created: 2025-01-30
updated: 2025-01-30
estimated-completion: 2025-02-28
roadmap: major
---

## Motivation

Improve read performance of blockchain API by optimizing prefixes in x/stores based on object state.

## Summary

A lot of Akash Network API clients (e.g. Console and provider service) query blockchain to get specifics about certain leases, orders, etc.
Current implementation implies single unordered index per store, which create challenges for clients when they need to query items of specific state, for example active leases, or open orders.
At this moment, market store contains over 1.3M order records, and for provider service to catch up with them at startup it has to iterate over all of them to and filter out open orders. Specifying filters like state in the query is not effective, and in-fact reduces performance due to way store keys are built.

In majority of the cases API client is interested in objects that are in any state other than closed (i.e. active, open, paused, etc), therefore it is feasible to split single store into multiple stores, each of them will contain only objects of the certain state.

Certain stores (x/market, x/authz) will also benefit from reverse indexes to be added for improved reading performace. With x/market for example, adding reverse index for bids and leases will greatly improve queries when client is looking for bids/leases by provider.

## Implementation details

State of the object will be considered as part of the store prefix and will be prepended to the store key.
Such approach has following pros and cons:
- Pros:
    - reduce number of items to iterate over when querying for objects of certain state
    - retains pagination logic
- Cons:
    - Finding specific object by id will be O(N), where N is number of states particular object can be in.
    - Cost of certain transactions will likely increase due necessity of checking object via multiple prefixes

### x/deployment

**Deployments** store will be updated with following prefixes:
    - {0x11, 0x00} - deployments
        - {0x01} - active deployments
        - {0x02} - closed deployments
    - {0x12, 0x00} - deployment groups
        - {0x01} - open deployment groups
        - {0x02} - paused deployment groups
        - {0x03} - deployment groups with insufficient funds
        - {0x04} - closed deployment groups

### x/market

**Orders** store will be updated with following prefixes:
    - {0x11, 0x00} - orders
        - {0x01} - open orders
        - {0x02} - active orders
        - {0x03} - closed orders

**Bids** store will be updated with following prefixes:
    - {0x12, 0x00} - bids
        - {0x01} - open bids, normal order
        - {0x02} - active bids, normal order
        - {0x03} - lost bids
        - {0x04} - closed bids
    - {0x12, 0x01} - bids, with reverse index
        - {0x01} - open bids, with provider address as first token of the key
        - {0x02} - active bids, with provider address as first token of the key

**Leases** store will be updated with following prefixes:
    - {0x13, 0x00} - leases
        - {0x01} - active leases
        - {0x02} - insufficient funds leases
        - {0x03} - closed leases
    - {0x13, 0x01} - leases, with reverse index
        - {0x01} - active leases, with provider address as first token of the key

### x/authz

Store will update with following prefixes:
    - {0x01} - grantor prefix (remains unchanged)
    - {0x03} - grantee prefix. Format of the key is `0x03<granteeAddressLen (1 Byte)><granteeAddress_Bytes><granterAddressLen (1 Byte)><granterAddress_Bytes>: grants count`

**NOTE**: Index {0x02} is reserved to retain compatibility with future upgrade to Cosmos-SDK 0.47 upgrade. This upgrade introduces prefix `0x02` for `GrantsQueue`message.

## Copyright

All content herein is licensed under [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0).

