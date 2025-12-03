---
categories: ["For Node Operators"]
tags: ["Node Build", "Nodes"]
weight: 1
title: "Node Build"
linkTitle: "Node Build"
description: "Build and deploy Akash nodes using different methods"
---

Deploy an Akash RPC node using one of three methods: CLI build, Helm chart (Kubernetes), or Omnibus (on Akash Network).

**Why run an Akash node?**
- Required for validators
- Recommended for providers (lower latency)
- Best practice for production dApps (no reliance on public nodes)

---

## Deployment Methods

### [CLI Build](/docs/for-node-operators/node-build/cli-build)

**Manual installation on a Linux server.**

**Time:** 15-30 minutes (setup) + sync time

**Requirements:**
- Ubuntu 24.04 LTS
- 4 CPU cores
- 8 GB RAM
- 100 GB SSD storage (minimum), 1 TB recommended
- Root access

**Use when:**
- You want full control over the node configuration
- Running on bare metal or VPS
- Learning node operations from scratch

---

### [Helm Chart](/docs/for-node-operators/node-build/helm-chart)

**Deploy to an existing Kubernetes cluster via Helm.**

**Time:** 5-10 minutes

**Requirements:**
- Existing Kubernetes cluster
- Helm 4.0+
- kubectl access
- 100 GB storage (minimum), 1 TB recommended

**Use when:**
- You already have a Kubernetes cluster
- You want quick deployment with blockchain snapshots
- You need to manage multiple nodes

---

### [Omnibus](/docs/for-node-operators/node-build/omnibus)

**Deploy on Akash Network using a pre-built SDL.**

**Time:** 5-10 minutes (deployment) + 20-30 minutes (sync via hourly snapshot)

**Requirements:**
- Akash wallet with ~2 AKT
- Akash Console or CLI access

**Use when:**
- You want to run a node on Akash's network
- Testing or learning Akash deployments
- You don't have dedicated infrastructure

---

## After Deployment

Once your node is running:

1. **Verify sync status** - Check if `catching_up: false`
2. **Check peer connections** - Ensure connected to seed/peer nodes
3. **Monitor block height** - Compare with [Mintscan](https://www.mintscan.io/akash)
4. **Enable services** - Configure RPC/API if needed

For validators, see [Running a Validator](/docs/for-node-operators/validators/running-a-validator).

---

**Questions?** Join [#validators on Discord](https://discord.com/channels/747885925232672829/771909963946237993)

