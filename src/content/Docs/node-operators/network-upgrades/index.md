---
categories: ["Node Operators"]
tags: ["Network Upgrades", "Upgrades"]
weight: 3
title: "Network Upgrades"
linkTitle: "Network Upgrades"
description: "Upgrade guides for Akash network upgrades"
---

**Stay up to date with Akash Network upgrades.**

This section contains comprehensive upgrade guides for node operators and validators, including both Cosmovisor (automated) and manual upgrade instructions.

---

## Current Network Upgrade

### [Mainnet 19 - Akash v2.2.0](/docs/node-operators/network-upgrades/mainnet-19/)

**Status:** Upcoming  
**Governance Proposal:** [#347](https://www.mintscan.io/akash/proposals/347)  
**Upgrade Height:** 29,399,482  
**Estimated Time:** November 6th, 2026 at ~14:00 UTC  
**Binary Version:** v2.2.0  

Complete upgrade guide including the new `x/sink` module for AKT on Solana (AEP-95), the Pyth VAA verifier contract update, escrow payment repair, Cosmovisor and manual upgrade instructions, build from source guide, and troubleshooting. Monitor block height and Discord for timing; prepare your node before the upgrade.

---

## Upgrade Coordination

**Discord Channels:**
- [#validators](https://discord.akash.network) - Support and discussion
- [#validator-announcements](https://discord.akash.network) - Official announcements

**Resources:**
- [GitHub Releases](https://github.com/akash-network/node/releases)
- [Network Info](https://github.com/akash-network/net)
- [Block Explorers](https://www.mintscan.io/akash)

---

## Best Practices

**Before Every Upgrade:**
1. **Read the complete upgrade guide**
2. **Backup your validator keys**
3. **Monitor Discord channels for announcements**
4. **Verify binary checksums**
5. **Be available during the upgrade window**

**Recommended Setup:**
- Use Cosmovisor for automatic upgrades
- Enable monitoring and alerting
- Have a rollback plan ready
- Join Discord for real-time coordination
