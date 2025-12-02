---
categories: ["For Node Operators"]
tags: ["Validators"]
weight: 2
title: "Validators"
linkTitle: "Validators"
description: "Run and operate Akash validators"
---

**Become part of Akash's consensus layer by running a validator node.**

Validators are responsible for committing new blocks to the blockchain through voting. They participate in the consensus protocol by broadcasting votes that contain cryptographic signatures signed by each validator's private key.

---

## What is an Akash Validator?

Validators:
- **Propose and vote on blocks** in the Akash blockchain
- **Secure the network** through Proof-of-Stake consensus
- **Earn rewards** from block provisions and transaction fees
- **Can be slashed** for downtime or double-signing

Validators must maintain high uptime and security to avoid penalties and earn rewards for their delegators.

---

## Validator Requirements

### Minimum Hardware
- **CPU:** 8 cores (16 cores recommended)
- **RAM:** 128 GB required
- **Storage:** 512 GB SSD/NVMe (1 TB+ recommended)
- **Network:** 100 Mbps+
- **Uptime:** 99.9%+ required to avoid slashing

### Minimum Stake
- **Active Set:** Top 100 validators by voting power
- **Minimum Self-Delegation:** 1 AKT
- **Recommended Initial Stake:** 10,000+ AKT to be competitive

Check current requirements:
- Discord: `$votingpower` command in #validators-status
- Explorer: [Mintscan Akash Validators](https://www.mintscan.io/akash/validators)

### Technical Requirements
- **Linux experience** - Command line proficiency
- **Node operations** - Understanding of blockchain nodes
- **Security knowledge** - Key management and server hardening
- **Monitoring** - Alerting and uptime tracking

---

## Validator Setup Options

### [Running a Validator](/docs/for-node-operators/validators/running-a-validator)

**Deploy a validator using the CLI on your own infrastructure.**

**Prerequisites:**
- Full Akash node running and synced
- Akash wallet with sufficient AKT
- Server meeting validator hardware requirements

**Time:** 30-45 minutes (after node is synced)

---

### [Validator via Omnibus](/docs/for-node-operators/validators/omnibus)

**Deploy a validator with sentry architecture on Akash Network.**

**Features:**
- Sentry node protection
- Runs on Akash Network
- S3 bucket for key backup
- DDOS protection

**Time:** 1-2 hours

---

### [TMKMS with Stunnel](/docs/for-node-operators/validators/tmkms-stunnel)

**Advanced: Separate validator key management using TMKMS.**

**Use for:**
- Enhanced security
- HSM integration
- Key isolation

**Time:** 2-3 hours

---

## Validator Economics

### Revenue Sources
1. **Block Rewards** - Fixed AKT inflation rewards
2. **Transaction Fees** - Fees from network transactions
3. **Commission** - Percentage of delegator rewards

### Costs & Risks
- **Server Costs** - $50-200/month depending on setup
- **Slashing Risk** - 0.01% for downtime, 5% for double-sign
- **Opportunity Cost** - Self-delegated AKT is locked

### Commission Rates
- **Typical Range:** 5-10%
- **Maximum Rate:** Set at validator creation (cannot increase beyond)
- **Maximum Change Rate:** Max % point change per day

---

## Before You Start

### Prerequisites

1. **Run a Full Node First**
   - See [Node Build Guides](/docs/for-node-operators/node-build)
   - Ensure node is fully synced before creating validator

2. **Secure Your Keys**
   - **Never share** your validator private key (`priv_validator_key.json`)
   - Consider using TMKMS for key management
   - Backup keys offline in multiple secure locations

3. **Plan for High Availability**
   - Set up monitoring and alerting
   - Consider sentry node architecture
   - Have a recovery plan for downtime

4. **Understand Slashing**
   - **Downtime:** Miss >50% of 10,000 blocks = 0.01% slash + jail
   - **Double-Sign:** Sign blocks at same height = 5% slash + tombstone
   - Jailed validators must submit unjail transaction

---

## Validator Resources

### Community
- **Discord:** [#validators channel](https://discord.akash.network)
- **Telegram:** [Akash Validators](https://t.me/AkashNW)

### Tools
- **Block Explorers:**
  - [Mintscan](https://www.mintscan.io/akash)
  - [ATOMScan](https://atomscan.com/akash)
- **Monitoring:**
  - [PANIC by Simply VC](https://github.com/SimplyVC/panic)
  - [Tenderduty](https://github.com/blockpane/tenderduty)

### Documentation
- [Cosmos Validator FAQ](https://hub.cosmos.network/main/validators/validator-faq.html)
- [Sentry Node Architecture](https://forum.cosmos.network/t/sentry-node-architecture-overview/454)

---

## Ready to Begin?

**Start with a full node:**

→ [Node Build Guides](/docs/for-node-operators/node-build)

Then create your validator:

→ [Running a Validator](/docs/for-node-operators/validators/running-a-validator)
