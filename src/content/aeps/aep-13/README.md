---
aep: 13
title: "Mainnet 2: DCX Platform"
author: Kaustubh Patral (@kaustubhkapatral), Greg Osuri (@gosuri)
status: Final
type: Standard
category: Core
created: 2021-02-03
completed: 2021-02-17
updated: 2024-12-01
roadmap: major
---

## Summary

Akash's codebase is production-ready after testnet, with minor issues resolved. The team is updating to the final Stargate version of Cosmos-SDK, planning a mainnet upgrade for decentralized cloud and IBC integration. Akash Network will be an early IBC adopter. Significant changes in Stargate require coordination with partners for upgrades and testing, despite previous collaboration on CosmosHub testnets.

## Motivation

Enable Compute trading functionality on Akash.

## Background

The successful completion of **The Akashian Challenge Phase 3**, an incentivized testnet program, demonstrates that the Akash codebase is production-ready for implementing DeCloud. While the testnet software had minor issues and used pre-release versions of Cosmos-SDK, significant improvements and fixes have since been made. The final Stargate (v0.41.0) release of Cosmos-SDK is now available.

Akash's core team has been diligently updating the codebase to align with SDK changes. The time has come to schedule the mainnet upgrade for Akash Network, enabling users to experience the full potential of decentralized cloud computing and IBC features from the Stargate release. Akash Network is poised to be among the first chains to incorporate IBC.

Given the numerous changes in the latest Stargate version of Cosmos-SDK, it is crucial to coordinate with Akash Network partners, allowing them to upgrade and test their integrations. Although much of this coordination occurred on CosmosHub testnets, it remains essential to verify and test integrations specifically with Akash Network.

The following stakeholders will be impacted:
- Exchanges
- Wallets
- Block Explorers
- Staking Dashboards
- Validators & Delegators (Infra, tools & scripts, ledgers etc.)

The major expectation of this proposal is to get a signal of approval from the ecosystem players on the changes and risks associated with the upgrade and their readiness for it.

### The Upgrade Plan

- Run the Akash-Stargate testnet and coordinate with other stakeholders to update and test their integrations
- Create documentation and FAQs to help new partners
- Test the upgrade path from `akashnet-1` to `akashnet-2`
- Verify the state migrations
- Test all the transactions and queries to ensure stable software for the upgrade

### Akashnet Stargate Testnet:

Vitwit (Witval validator) will lead and execute the testnet and coordinate with all the validators and other stakeholders:

- Plan the testnet to test the upgrade path. This should include real testing of state export, migration, and upgrade.
- Help document the migration path for exchanges, explorers, and wallets.
- Coordinate and test the integrations
- Test mainnet-2 features, i.e., deployments, providers, and marketplace
- Coordinate with the dev team and marketing team for necessary fixes and announcements.

### Post Testnet

This submission seeks to gauge initial support or opposition from validators and community members regarding the proposed Akashnet upgrade strategy. The outcome of this proposal will inform a subsequent governance proposal, which will provide comprehensive information about the upgrade process and specific software versions. A series of action items will be implemented following the testnet phase:
- Coordinate on a final date and software version for the upgrade
- Fix any and all documentation, UX, and non-state breaking issues
- Wait for the final release
- Make a proposal to upgrade the network

### Risks and Mitigation

There are a number of state-breaking changes in the new software. Here is a list of features added/improved:

- Akash DeCloud: Providers
- MarketPlace: Bids, Orders, and Leases
- Deployments
- Protobuf migration: Stargate version Cosmos-SDK has one of the best encodings now. We now have support for both Protobuf and Amino encoding options.
- IBC: Inter Blockchain Communication is the long-awaited feature from Cosmos-SDK and is now available for use in production. This allows us to transfer tokens between different chains securely.
- Fast Sync
- CosmoVisor
- Tendermint Changes

Ensuring smooth state migrations and data integrity verification is crucial for the success of the mission. While CosmosHub has conducted several testnets to identify and address critical issues, it remains essential to thoroughly test these migrations and resolve any integration problems with other clients.

In the event of upgrade complications, a well-defined rollback procedure should be in place to facilitate a seamless restart of the current network and postpone the upgrade as needed. All coordination efforts should be conducted through the #testnet-validators channel on Discord.

## Copyright

All content herein is licensed under [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0).