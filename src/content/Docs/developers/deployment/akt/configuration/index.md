---
categories: ["Developers", "Deployment", "akt CLI"]
tags: ["akt", "CLI", "Configuration", "Contexts", "Keys"]
weight: 2
title: "Contexts & Configuration"
linkTitle: "Configuration"
description: "Configure akt contexts, networks, keys, and environment variables"
---

**Configure `akt` with contexts, networks, and keys.**

> **Prerequisites:** You must have `akt` installed. See the [Installation Guide →](/docs/developers/deployment/akt/installation)

`akt` is designed for flag-minimal operation: after initial context configuration, most commands require zero additional flags. This guide covers the context system and all configuration options.

---

## How Configuration Works

`akt` stores its configuration in a YAML file at `~/.config/akt/config.yaml`, built from three building blocks:

- **Contexts** - A named combination of a network, an authentication method, and a default account. One context is active at a time, and every command runs against it.
- **Networks** - Shared network definitions (chain ID, RPC endpoints, gas settings). Built-in templates exist for `mainnet`, `testnet`, and `sandbox`, and multiple contexts can reference the same network.
- **Keyrings** - Shared key stores referenced by contexts.

Contexts use one of two authentication methods:

| Auth Method   | Signing                                                                      | Best For                                     |
| ------------- | ---------------------------------------------------------------------------- | -------------------------------------------- |
| `keyring`     | Local keys, direct chain transactions                                        | Full control, all transaction types          |
| `console-api` | [Akash Console](https://console.akash.network) managed wallet, no local keys | Deployments funded in USD, no key management |

Config changes are picked up live. There is no need to restart anything after editing `config.yaml`.

---

## Context Management

```bash
# List all contexts
akt context list

# Create a context using an existing network
akt context create prod --network mainnet --default-account alice --set-current

# Switch active context
akt context use staging

# Show active context details (resolved network, keyring, store path, capabilities)
akt context show

# Edit a context
akt context edit prod --default-account bob

# Create a Console API context (managed wallet, no local keys)
akt context create console --network mainnet --auth-method console-api --set-current

# Rename or delete
akt context rename prod production
akt context delete staging --yes
```

---

## Network Management

```bash
# Create from built-in template
akt context network create mainnet --template mainnet

# Create custom network
akt context network create local --chain-id localnet-1 --rpc http://localhost:26657

# List networks and which contexts use them
akt context network list

# Show full network details
akt context network show mainnet

# Edit network (affects all contexts using it)
akt context network edit mainnet --gas-prices 0.025uakt
```

---

## Key Management

Keys live in the active context's keyring:

```bash
# Add a new key
akt context keys add alice

# Recover from mnemonic
akt context keys add alice --recover

# List keys in the current context's keyring
akt context keys list

# Show key details
akt context keys show alice

# Print only the bech32 address (useful for scripting)
akt context keys show alice --address

# Export / import
akt context keys export alice > alice.key
akt context keys import alice-backup alice.key

# Parse an address between formats
akt context keys parse akash1abc...
```

**Critical:** When you create a key, save the mnemonic phrase in a safe place. It is the only way to recover the key.

---

## Capability Gating

The active context's configuration determines what `akt` can actually do:

- A network with at least one RPC endpoint enables chain queries, chain transactions, and provider operations, gating the `query`, `tx`, `monitor`, and `provider` command groups.
- A resolvable Console API key enables the Console-backed commands.

`akt context show` ends with a Capabilities block reporting the resolved feature set, naming the remedy for anything the configuration cannot do:

```
  Capabilities:
      Chain queries:       available
      Chain transactions:  available
      Provider gateway:    available
      Console API:         unavailable - run akt console login
```

Commands outside that set are marked `[unavailable]` in help and fail fast with an explanation instead of failing somewhere inside a network call. Presentation is configurable via `defaults.command-gating` in `config.yaml`:

| Mode   | Behavior                                                                                              |
| ------ | ----------------------------------------------------------------------------------------------------- |
| `dim`  | Default. Unavailable commands stay listed, marked `[unavailable]`, and fail fast with an explanation. |
| `hide` | Unavailable commands are removed from help listings; direct invocation still fails fast.              |
| `off`  | No gating; commands fail wherever the missing transport is first touched.                             |

```yaml
# ~/.config/akt/config.yaml
defaults:
  command-gating: dim
```

**Note:** Per-invocation overrides that carry their own connection details (`--node`, `--console-api-key`, a positional `akt monitor` endpoint) grant the capability they supply, so gating never rejects a command that can connect on its own.

---

## Environment Variables

| Variable              | Description                                                   |
| --------------------- | ------------------------------------------------------------- |
| `AKT_HOME`            | Overrides the home directory (config, contexts, keyrings)     |
| `AKT_CONTEXT`         | Overrides the active context for this invocation              |
| `AKT_FROM`            | Overrides the default account for transactions                |
| `AKT_CONSOLE_API_KEY` | Console API key (overrides the per-context stored credential) |

The equivalent global flags `--home` and `--context` take precedence over the environment variables.

---

## Output Formats

All commands support `--output` (`-o`) with pretty formatting by default:

```bash
# Pretty table (default): color-coded states, bold identifiers
akt query deployment

# JSON, for scripts and pipes
akt query deployment -o json

# YAML
akt query bank balances akash1abc... -o yaml
```

---

## Action Log

Every mutating operation (transactions, workflows, provider calls, context changes, and Console actions) is recorded in a per-context append-only log. Read-only queries are not recorded.

```bash
# View recent actions for the current context (newest first)
akt context log

# Filter by type and limit
akt context log --type tx --limit 10

# Show actions since a duration or timestamp
akt context log --since 1h
akt context log --since 2026-01-01
```

The log rotates automatically at 10 MB, keeping up to 5 rotated files.

---

## Next Steps

- **[Deployments →](/docs/developers/deployment/akt/deployments)** - Deploy your first application
- **[Console Integration →](/docs/developers/deployment/akt/console)** - Set up a managed-wallet context
- **[Commands Reference →](/docs/developers/deployment/akt/commands-reference)** - Learn all `akt` commands

---
