---
categories: ["Developers", "Deployment"]
tags: ["akt", "CLI", "Command Line"]
weight: 0
title: "akt CLI"
linkTitle: "akt CLI"
description: "Deploy and manage Akash applications using akt, the unified Akash Network command-line interface"
---

Use `akt` to deploy workloads, query the chain, operate provider leases, and work with the Akash Console managed wallet.

`akt` replaces the CLI functionality previously spread across `akash`, `provider-services`, and the chain SDK CLI with a single binary. It adds named contexts for managing multiple networks and accounts, offline SDL authoring, built-in deployment workflows, Akash Console managed-wallet integration, and real-time network monitoring.

---

## Why akt

- **One binary** - Chain queries, transactions, deployment workflows, provider operations, and monitoring in a single tool.
- **Flag-minimal operation** - After initial context configuration, most commands require zero additional flags.
- **Two deployment rails** - Sign transactions locally with your own keys, or route through the [Akash Console managed wallet](/docs/api-documentation/console-api) with no local keys at all.
- **Positional arguments** - Commands take their primary values positionally, following the Akash resource hierarchy (`owner/dseq/gseq/oseq/provider`).

```bash
# State keyword, identity + state, dseq, and a date range: all positional
akt query deployment active
akt query deployment akash1abc.../12345 closed
akt tx deployment close 12345
akt console usage 2026-01-01 2026-01-31
```

These pages describe `akt` v0.1.1. The project is under active development, so check `akt <command> --help` when using another release.

---

## In This Section

### [Installation](/docs/developers/deployment/akt/installation)

Install the `akt` binary, run the first-time setup, and enable shell completion.

### [Contexts & Configuration](/docs/developers/deployment/akt/configuration)

Configure contexts, networks, keys, and environment variables.

### [Deployments](/docs/developers/deployment/akt/deployments)

Author SDL files and run the full deployment lifecycle with `akt deploy`, `akt update`, and `akt close`.

### [Console Integration](/docs/developers/deployment/akt/console)

Deploy with the Akash Console managed wallet: no local keys, deposits in USD.

### [Queries & Transactions](/docs/developers/deployment/akt/queries-and-transactions)

Query the chain and submit transactions for every Akash and Cosmos SDK module.

### [Network Monitor](/docs/developers/deployment/akt/monitor)

Watch consensus, provider fleet health, and Oracle/BME state in real time with `akt monitor`.

### [MCP Server](/docs/developers/deployment/akt/mcp)

Expose Akash tools to AI assistants over the Model Context Protocol.

### [Commands Reference](/docs/developers/deployment/akt/commands-reference)

Reference for `akt` command groups, common arguments, and flags.

---

## Quick Links

- **[akt on GitHub](https://github.com/akash-network/akt)** - Source code, releases, and issue tracker
- **[SDL Reference](/docs/developers/deployment/akash-sdl)** - Deployment configuration syntax
- **[Managed Wallet API](/docs/api-documentation/console-api)** - The Console API behind `akt console`
- **[Discord Support](https://discord.akash.network)** - Get help in the #developers channel

---

Start with the [installation guide](/docs/developers/deployment/akt/installation).
