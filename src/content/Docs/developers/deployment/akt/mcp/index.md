---
categories: ["Developers", "Deployment", "akt CLI"]
tags: ["akt", "CLI", "MCP", "AI", "Automation"]
weight: 7
title: "MCP Server"
linkTitle: "MCP Server"
description: "Expose Akash Network tools to AI assistants with the akt MCP server"
---

**Expose Akash Network tools to AI assistants over the Model Context Protocol.**

`akt mcp` starts an MCP (Model Context Protocol) server over stdio transport. Configuration is resolved from the active `akt` context (network, keyring, default account), so anything you can query with `akt`, a connected AI assistant can query too.

---

## Start the Server

```bash
# Read-only mode (safe for AI agents)
akt mcp

# With write tools enabled
akt mcp --enable-writes
```

By default, only read-only query tools are available (21 tools). Write tools (on-chain transactions and provider mutations) require explicit opt-in via `--enable-writes` to prevent AI agents from sending unapproved transactions.

**Read-only tools include:** node status, account balances, deployments, orders, bids, leases, providers, audited attributes, and certificates.

**Write tools (with `--enable-writes`):** close deployment, create lease, close lease, and submit manifest.

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

**Important:** Only add `--enable-writes` to the client configuration if you want the assistant to be able to close deployments, create and close leases, and submit manifests on your behalf.

---

## Related Resources

- [Contexts & Configuration](/docs/developers/deployment/akt/configuration) - The context the server resolves its settings from
- [Model Context Protocol](https://modelcontextprotocol.io) - Protocol documentation
- [Commands Reference](/docs/developers/deployment/akt/commands-reference) - Complete `akt` command reference
