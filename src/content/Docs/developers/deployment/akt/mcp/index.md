---
categories: ["Developers", "Deployment", "akt CLI"]
tags: ["akt", "CLI", "MCP", "AI", "Automation"]
weight: 7
title: "MCP Server"
linkTitle: "MCP Server"
description: "Expose Akash Network tools to AI assistants with the akt MCP server"
---

**Expose Akash Network tools to AI assistants over the Model Context Protocol.**

`akt mcp` starts an MCP (Model Context Protocol) server over stdio. It serves two tool sets: chain tools resolved from the active `akt` context, and Console tools registered whenever a Console API key resolves. Either rail alone is enough. The server only refuses to start when neither is available.

---

## Start the Server

```bash
# Read-only mode (safe for AI agents)
akt mcp

# With write tools enabled
akt mcp --enable-writes

# Managed setup: Console tools only, no context or wallet needed
akt mcp --console-api-key <key>
```

**Flags:**

- `--enable-writes` - Enable write tools (on-chain transactions and provider mutations)
- `--console-api-key` - Console API key; overrides the context credential and `AKT_CONSOLE_API_KEY`

By default, only read-only query tools are available. Write tools require explicit opt-in via `--enable-writes`. Read tools are annotated as read-only; write tools are marked destructive.

A contextless Console setup is read-only. Enabling writes requires an explicitly selected context so every mutation has a stable action-log destination. On a chain context, failure to initialize an optional signer does not remove the available query tools; signing-dependent tools are omitted instead.

Stop the stdio server with Ctrl-C. `akt` cancels in-flight work, releases the blocked input loop, and exits cleanly. Closing stdin also performs a clean shutdown.

---

## Available Tools

With both rails configured, read-only mode registers 27 tools and `--enable-writes` registers 33.

**Chain read tools** (require a network with an RPC endpoint): node status, account balances, deployments, orders, bids, leases, providers, audited attributes, and certificates.

**Console read tools** (require a resolvable Console API key): deployments, bids, providers, GPU pricing, wallet balance, and usage history.

**Write tools (with `--enable-writes`):** close deployment, create lease, close lease, and submit manifest on the chain rail; close deployment and deposit into escrow on the Console rail. These operations use the same transaction, provider, and Console action logs as their CLI equivalents.

Owner-scoped chain tools default to the context's `default-account`. If the context has no account, the tool requires an explicit `owner`; it never broadens the request to every account on the network. Console tools use the Console API identity and do not need a local account.

---

## Connect a Client

MCP clients launch the server themselves over stdio. For Claude Code:

```bash
claude mcp add akash -- akt mcp
```

For clients configured with JSON (e.g., Claude Desktop):

```json
{
  "mcpServers": {
    "akash": {
      "command": "akt",
      "args": ["mcp"]
    }
  }
}
```

Only add `--enable-writes` if you want the client to close deployments, create and close leases, submit manifests, and spend Console credits on your behalf.

---

## Related Resources

- [Contexts & Configuration](/docs/developers/deployment/akt/configuration) - The context the server resolves its settings from
- [Console Integration](/docs/developers/deployment/akt/console) - Setting up the Console API key the Console tools use
- [Model Context Protocol](https://modelcontextprotocol.io) - Protocol documentation
- [Commands Reference](/docs/developers/deployment/akt/commands-reference) - Complete `akt` command reference
