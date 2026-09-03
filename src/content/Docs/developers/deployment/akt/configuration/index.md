---
categories: ["Developers", "Deployment", "akt CLI"]
tags: ["akt", "CLI", "Configuration", "Contexts", "Keys"]
weight: 2
title: "Contexts & Configuration"
linkTitle: "Configuration"
description: "Configure akt contexts, networks, keys, and environment variables"
---

**Configure `akt` with contexts, networks, and keys.**

> **Prerequisite:** Install `akt` first. See the [installation guide](/docs/developers/deployment/akt/installation).

After initial context configuration, most commands need no connection or signer flags. This guide covers the settings that supply those defaults.

---

## How Configuration Works

`akt` stores its configuration in a YAML file at `~/.config/akt/config.yaml`, built from three building blocks:

- **Contexts** - A named combination of a network, an authentication method, and a default account. One context is active at a time, and every command runs against it.
- **Networks** - Shared network definitions (chain ID, RPC endpoints, gas settings). Built-in templates exist for `mainnet`, `testnet`, and `sandbox`; the sandbox template targets the live `sandbox-2` network. Multiple contexts can reference the same network.
- **Keyrings** - Named key stores shared by one or more contexts. Each keyring selects an `os`, `file`, `test`, `kwallet`, `pass`, or `memory` backend.

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

## Accounts and Account-Free Contexts

Set a default account when you create a keyring context, or add one later:

```bash
akt context edit mainnet --default-account alice
akt context show
```

The value can be a key name or an Akash address. When it is a key name, `akt` resolves it to the full address before running owner-scoped queries.

A `console-api` context intentionally does not need a keyring or `default-account`. The API key identifies the Console account, and the Console managed wallet signs and pays for `akt deploy`, `akt update`, `akt close`, and `akt console` operations.

If that context also has a network, account-independent chain queries such as `akt query staking pool` still work. An owner-scoped query cannot guess an owner, so a bare command such as `akt query deployment` refuses instead of returning every deployment on the network. Use the Console-owned view or provide an address explicitly:

```bash
akt console deployment list
akt query deployment akash1abc...
```

A network-less `console-api` context can run Console commands only. Attach a network before using chain queries, the monitor, or public provider discovery. Direct `akt tx` commands need a keyring context and local signing account.

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

## Gas prices and transaction fees

`--gas auto` estimates the gas limit. The transaction fee also needs a gas price, and that price comes from the selected network's policy.

During first-run setup, `akt` stores each Akash registry network's `high_gas_price`. The built-in templates currently use `0.025uakt`. When a transaction derives its fee from gas prices, the configured network price is a floor:

- A lower `--gas-prices` or `AKT_GAS_PRICES` value is raised to the network floor.
- A higher value is preserved.
- An explicit `--fees` value is authoritative and does not use gas prices.
- Online, offline, generate-only, and dry-run transaction construction use the same rule.

`akt` does not copy one RPC node's local minimum and does not retry a rejected transaction with a guessed fee.

If a context created with an older release still stores `0.0025uakt`, update the network once:

```bash
akt context network show mainnet
akt context network edit mainnet --gas-prices 0.025uakt
```

The edit affects every context that shares that network. Fork it when one context needs a separate policy:

```bash
akt context edit prod --fork-network --gas-prices 0.04uakt
```

---

## Keyring management

Keyrings define where local signing keys live. The `os` backend uses the platform credential store. `akt` refuses to open it when the host has no supported credential store instead of switching to another backend.

```bash
# List keyring definitions
akt context keyring list

# Create a file-backed keyring for a headless host
akt context keyring create headless file

# Change an existing keyring backend
akt context keyring set headless os
```

Use `--keyring <name>` with `akt context create`, or set it later with `akt context edit <name> --keyring <name>`.

---

## Key Management

Keys live in the active context's keyring:

```bash
# Add a new key
akt context keys add alice

# Scripted creation without printing a mnemonic
akt context keys add ci-deployer --yes --no-backup

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

`--yes` is accepted for Cosmos CLI compatibility. It never overwrites an existing key. Unless you pass `--no-backup` or recover an existing key, save the printed mnemonic because it is the only way to recover the account.

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

| Variable              | Description                                                 |
| --------------------- | ----------------------------------------------------------- |
| `AKT_HOME`            | Home directory for config, credentials, keyrings, and state |
| `AKT_CONTEXT`         | Active context for this invocation                          |
| `AKT_CHAIN_ID`        | Chain ID from the selected network                          |
| `AKT_NODE`            | First RPC endpoint from the selected network                |
| `AKT_GRPC_ADDR`       | First gRPC endpoint from the selected network               |
| `AKT_FROM`            | Default transaction account                                 |
| `AKT_KEYRING_BACKEND` | Keyring backend for this invocation                         |
| `AKT_KEYRING_DIR`     | Keyring directory for this invocation                       |
| `AKT_GAS`             | Gas limit or `auto`                                         |
| `AKT_GAS_PRICES`      | Candidate gas prices, subject to the selected network floor |
| `AKT_GAS_ADJUSTMENT`  | Multiplier applied to simulated gas                         |
| `AKT_FEES`            | Fixed transaction fees                                      |
| `AKT_BROADCAST_MODE`  | Transaction broadcast mode                                  |
| `AKT_OUTPUT`          | Default output format                                       |
| `AKT_CONSOLE_API_KEY` | Console API key, overriding the stored context credential   |

The equivalent global flags `--home` and `--context` take precedence over the environment variables.

---

## Output Formats

Commands support `--output` (`-o`) with pretty formatting by default:

```bash
# Pretty table (default): color-coded states, bold identifiers
akt query deployment

# JSON, for scripts and pipes
akt query deployment -o json

# YAML
akt query bank balances akash1abc... -o yaml
```

Pretty output always prints complete addresses. Coin values use readable base, milli, or micro units. JSON and YAML preserve stable machine-readable fields and never include the human `Next:` guidance written to stderr after successful Console actions.

---

## Action Log

Every mutating operation, including transactions, workflows, provider calls, context changes, key management, and Console actions, is recorded in a per-context append-only log. Read-only queries are not recorded. Key export is the exception because moving private key material is a security event. The log never contains mnemonics, passphrases, key material, or API keys.

```bash
# View recent actions for the current context (newest first)
akt context log

# Filter by type and limit
akt context log --type tx --limit 10

# Follow every step of one workflow run
akt context log --workflow-id 9f2c1ab34d55e017

# Show actions since a duration or timestamp
akt context log --since 1h
akt context log --since 2026-01-01
```

The log rotates automatically at 10 MB and keeps up to five rotated files.

---

## Next Steps

- **[Deployments](/docs/developers/deployment/akt/deployments)** - Deploy your first application
- **[Console integration](/docs/developers/deployment/akt/console)** - Set up a managed-wallet context
- **[Commands reference](/docs/developers/deployment/akt/commands-reference)** - Review the main `akt` command groups

---
