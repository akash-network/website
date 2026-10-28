---
categories: ["Developers"]
tags: ["akt", "CLI", "Command Line"]
weight: 2.5
title: "akt CLI"
linkTitle: "akt CLI"
description: "Query the chain, send transactions, deploy, operate providers and monitor the network with akt, the unified Akash Network command-line interface"
---

Use `akt` to deploy workloads, query the chain, operate provider leases, and work with the Akash Console managed wallet.

This documentation covers release candidate [akt v1.0.0-rc0](https://github.com/akash-network/akt/releases/tag/v1.0.0-rc0). Run `akt version` to check your installed version.

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

Check [akt on GitHub](https://github.com/akash-network/akt) for the most up-to-date code and [GitHub Releases](https://github.com/akash-network/akt/releases/latest) for the latest stable version. [Homebrew installation](/docs/developers/akt/installation) installs the latest stable release. Use the archive instructions to install the release candidate. Run `akt version --long` to check your binary and `akt <command> --help` for its supported syntax; code on GitHub may be ahead of a published release.

---

## In This Section

### [Installation](/docs/developers/akt/installation)

Install the `akt` binary, run the first-time setup, and enable shell completion.

### [Contexts & Configuration](/docs/developers/akt/configuration)

Configure contexts, networks, keys, and environment variables.

### [Queries & Transactions](/docs/developers/akt/queries-and-transactions)

Query the chain and submit transactions for every Akash and Cosmos SDK module.

### [Send AKT to Solana](/docs/developers/akt/sink)

Send AKT to a Solana wallet through Akash Sink, follow the transfer and its refund, and run the reporter, guardian and governance sink commands.

### [Network Monitor](/docs/developers/akt/monitor)

Watch consensus, provider fleet health, and Oracle/BME state in real time with `akt monitor`.

### [Agent Skill](/docs/developers/akt/agent-skill)

Give your coding agent the akt CLI skill. Download the complete bundle, read its reference guides, and install it in your project or agent's skills directory.

### [MCP Server](/docs/developers/akt/mcp)

Expose Akash tools to AI assistants over the Model Context Protocol.

### [Commands Reference](/docs/developers/akt/commands-reference)

Reference for `akt` command groups, common arguments, and flags.

### [Deploy with akt](/docs/developers/deployment/akt)

The deployment workflows (`akt deploy`, `akt update`, `akt close`) and the Akash Console managed wallet are covered in the Deployment section.

---

## Quick Links

- **[akt on GitHub](https://github.com/akash-network/akt)** - Source code, releases, and issue tracker
- **[SDL Reference](/docs/developers/deployment/akash-sdl)** - Deployment configuration syntax
- **[Managed Wallet API](/docs/api-documentation/console-api)** - The Console API behind `akt console`
- **[Discord Support](https://discord.akash.network)** - Get help in the #developers channel

---

Start with the [installation guide](/docs/developers/akt/installation).
