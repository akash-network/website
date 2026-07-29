---
categories: ["Developers", "Deployment", "akt CLI"]
tags: ["akt", "CLI", "Commands", "Reference"]
weight: 8
title: "akt Commands Reference"
linkTitle: "Commands Reference"
description: "Complete reference of all akt CLI commands"
---

**Complete reference for all `akt` commands.**

This guide covers all available commands for managing contexts, deployments, the Akash Console, and querying the Akash Network.

---

## Command Structure

```bash
akt <command> <subcommand> [arguments] [flags]
```

**Global Flags:**

- `--home` - Home directory for config, contexts, and keyrings (default: `$AKT_HOME` or `~/.config/akt`)
- `--context` - Active context name (overrides `current-context` in config)
- `-o, --output` - Output format: `pretty` (default), `json`, `yaml`
- `-v, --verbose` - Increase output verbosity (`-v` verbose, `-vv` debug)
- `-q, --quiet` - Suppress all output except errors

Commands take their primary values **positionally**, following the Akash resource hierarchy (`owner/dseq/gseq/oseq/provider`). Defaults for the node, chain ID, gas settings, and signing account come from the active context.

---

## Context Commands

### Create Context

Create a new context from an existing network.

```bash
akt context create <name> --network <network>
```

**Flags:**

- `--network` - Network definition to use
- `--auth-method` - `keyring` (default) or `console-api`
- `--default-account` - Default signing account
- `--set-current` - Make this the active context

**Example:**

```bash
akt context create prod --network mainnet --default-account alice --set-current
```

---

### Switch Context

Set the active context.

```bash
akt context use <name>
```

---

### Show Context

Show active context details: resolved network, keyring, store path, and capabilities.

```bash
akt context show
```

---

### Edit Context

Change a context's settings.

```bash
akt context edit <name> [flags]
```

**Example:**

```bash
akt context edit prod --default-account bob
```

---

### List, Rename, Delete

```bash
# List all contexts
akt context list

# Rename a context (moves its stored credentials)
akt context rename prod production

# Delete a context
akt context delete staging --yes
```

---

### Action Log

View the per-context log of mutating operations, newest first.

```bash
akt context log
```

**Flags:**

- `--type` - Filter by action type (e.g., `tx`)
- `--since` - Duration (`1h`) or timestamp (`2026-01-01`)
- `--limit` - Maximum entries to show

---

## Network Commands

### Create Network

Create a network definition from a built-in template or custom values.

```bash
akt context network create <name> [flags]
```

**Flags:**

- `--template` - Built-in template: `mainnet`, `testnet`, `sandbox`
- `--chain-id` - Custom chain ID
- `--rpc` - Custom RPC endpoint
- `--gas-prices` - Gas prices (e.g., `0.025uakt`)

**Example:**

```bash
# From template
akt context network create mainnet --template mainnet

# Custom network
akt context network create local --chain-id localnet-1 --rpc http://localhost:26657
```

---

### List, Show, Edit Networks

```bash
# List networks and which contexts use them
akt context network list

# Show full network details
akt context network show mainnet

# Edit a network (affects all contexts using it)
akt context network edit mainnet --gas-prices 0.025uakt
```

---

## Key Commands

### Add Key

Add a new key or recover an existing one.

```bash
akt context keys add <name>
```

**Flags:**

- `--recover` - Import from mnemonic

**Critical:** Save the mnemonic phrase from the output in a safe place. It cannot be shown again.

---

### Show Key

Display key details.

```bash
akt context keys show <name>
```

**Flags:**

- `--address` - Print only the bech32 address (useful for scripting)

---

### List, Delete, Rename

```bash
# List keys in the current context's keyring
akt context keys list

# Delete a key
akt context keys delete alice

# Rename a key
akt context keys rename alice alice-old

# Generate a BIP39 mnemonic without creating a key
akt context keys mnemonic
```

---

### Export / Import

```bash
# Export a key
akt context keys export alice > alice.key

# Import from an exported keyfile
akt context keys import alice-backup alice.key
```

---

### Parse Address

Convert an address between hex and bech32 formats.

```bash
akt context keys parse akash1abc...
```

---

## SDL Commands

Every `akt sdl` subcommand runs entirely locally: no context, no key, no RPC endpoint.

### List Scaffolds

List the built-in scaffolds (`web`, `gpu`, `multi-service`, `ip-lease`) and the flags each honors.

```bash
akt sdl scaffolds
```

---

### Generate an SDL

Print a deployable SDL to stdout, self-checked against the validator.

```bash
akt sdl init <scaffold> [flags]
```

**Flags:**

- `--image` - Container image (must carry an explicit tag or digest)
- `--cpu`, `--memory` - Compute resources
- `--gpu-model` - GPU model for the `gpu` scaffold
- `--price` - Pricing amount

**Example:**

```bash
akt sdl init web --image nginx:1.27 > deploy.yaml
```

---

### Validate an SDL

Validate offline; exit 0 when valid, 1 when not. Use `-` to read stdin.

```bash
akt sdl validate deploy.yaml
```

---

## Workflow Commands

Workflow commands orchestrate the full deployment lifecycle, routing each step through the active context's auth method (local signing for `keyring`, Console API for `console-api`).

### Deploy

Create a deployment, wait for bids, select a provider, create the lease, and send the manifest.

```bash
akt deploy <sdl-file>
```

**Flags:**

- `--deposit` - Initial deposit: coin (`5000000uakt`), USD (`5usd`, `$5`), or `auto` (default)
- `--bid-timeout` - Maximum time to wait for bids (default: `5m`)
- `--bid-select` - `interactive` (default), `cheapest`, or `provider=<addr>`
- `-y, --yes` - Skip confirmation prompts
- `--dry-run` - Show the execution plan without broadcasting

**Example:**

```bash
# Automated deployment for CI/CD: one JSONL line per step
akt deploy deploy.yaml --bid-select cheapest --yes -o jsonl
```

---

### Update

Update a deployment from a modified SDL file.

```bash
akt update <sdl-file> [dseq]
```

**Example:**

```bash
akt update deploy.yaml 12345
```

---

### Close

Close a deployment and return the remaining escrow balance.

```bash
akt close [dseq]
```

**Example:**

```bash
akt close 12345
```

---

## Query Commands

Akash queries use a positional filter argument following the resource hierarchy, with smart type detection (a bech32 address is an owner, a number is a dseq). The `q` alias is equivalent to `query`.

### Deployments

```bash
# List your deployments (owner defaults to context account)
akt query deployment

# Filter positionally: state, dseq, owner, owner/dseq
akt query deployment active
akt query deployment 12345
akt query deployment akash1abc...
akt query deployment akash1abc.../12345
```

---

### Market (Bids and Leases)

```bash
# List active leases (positional state keyword)
akt query market lease active

# Leases for a specific deployment
akt query market lease 12345

# Specific lease (owner from context)
akt query market lease 12345/1/1/akash1prov...

# Provider-perspective query
akt query market lease --by provider akash1prov...

# Bids for a deployment
akt query market bid 12345

# Orders for a deployment
akt query market order 12345
```

---

### Bank, Staking, Governance

```bash
# Check balances
akt query bank balances akash1abc...

# Validators
akt query staking validators

# Governance proposal
akt query gov proposal 42
```

---

### Providers and Certificates

```bash
# Query a provider
akt query provider akash1prov...

# Certificates for an owner
akt query cert akash1abc...
```

---

### WASM

```bash
# Query a contract
akt query wasm contract-state smart akash1contract... '{"get_count":{}}'
```

---

## Transaction Commands

All transaction commands accept `--from`, `--gas`, `--fees`, `--broadcast-mode`, `--yes`, `--dry-run`, and other standard flags. Defaults come from the active context.

### Deployments

```bash
# Create a deployment from an SDL file
akt tx deployment create deployment.yaml

# Update a deployment (positional sdl and dseq)
akt tx deployment update deployment.yaml 12345

# Close a deployment (positional dseq)
akt tx deployment close 12345
```

**Note:** On `console-api` contexts these commands route through the Console managed wallet, and `--deposit` takes USD amounts (`5`, `5usd`, `$5`).

---

### Deployment Groups

Modify a specific group within a deployment (positional dseq and gseq):

```bash
# Pause a deployment group
akt tx deployment group pause 12345 1

# Resume a paused group
akt tx deployment group start 12345 1

# Close a group
akt tx deployment group close 12345 1
```

---

### Market

```bash
# Create a lease (positional dseq and provider; gseq/oseq default to 1)
akt tx market lease create 12345 akash1prov...
```

---

### Bank, Staking, Governance

```bash
# Send tokens
akt tx bank send alice akash1dest... 1000000uakt

# Delegate to a validator
akt tx staking delegate akashvaloper1... 1000000uakt

# Vote on a governance proposal
akt tx gov vote 42 yes
```

---

### Certificates

```bash
# Generate and publish a client certificate
akt tx cert generate client
akt tx cert publish client
```

---

### Mint & Burn ACT (BME)

Convert between AKT and ACT through the Burn-Mint-Equilibrium module:

```bash
# Mint ACT by burning AKT
akt tx bme mint-act 500000uakt

# Burn ACT to mint/remint AKT
akt tx bme burn-act 500000uact

# Generic form: burn tokens to mint another denomination
akt tx bme burn-mint 500000uakt uact
```

See [Mint & Burn ACT](/docs/developers/deployment/cli/act-mint-burn) for background on when and why to convert.

---

## Console Commands

Commands for the [Akash Console managed-wallet API](/docs/api-documentation/console-api). See [Console Integration](/docs/developers/deployment/akt/console) for setup and workflows.

### Authentication

```bash
# Validate a Console API key and store it for the active context
akt console login

# Remove the stored credential
akt console logout

# Show the authenticated account
akt console whoami
```

---

### Deployments

```bash
akt console deployment list
akt console deployment get <dseq>
akt console deployment create <sdl-file> [deposit-usd]
akt console deployment update <sdl-file> <dseq>
akt console deployment deposit <dseq> [amount-usd]
akt console deployment settings <dseq> [true|false]
akt console deployment close <dseq>
```

---

### Bids and Leases

```bash
# Inspect provider bids
akt console bid list <dseq>

# Accept a bid by creating a lease and sending the manifest
akt console lease create <dseq> [provider]
```

---

### Wallet and Usage

```bash
akt console wallet list
akt console wallet balance
akt console wallet settings [true|false]
akt console wallet cost

# Historical spend and active-deployment counts (positional dates)
akt console usage [from] [to]
```

---

### Live Lease Operations

```bash
# Stream container logs from the lease's provider
akt console logs <dseq> [service] --follow

# Stream Kubernetes events
akt console events <dseq> --follow

# Live lease status from the provider gateway
akt console status <dseq> --watch --interval 30s

# Open a shell or run a command in a lease container
akt console shell <dseq> <service>
akt console shell <dseq> <service> -- ls -la
```

---

### Marketplace (No API Key Required)

```bash
# Provider catalog
akt console provider list
akt console provider get <provider>
akt console provider regions
akt console provider auditors

# GPU availability and pricing
akt console gpu

# Deployment templates
akt console template list
akt console template get <id>
akt console template sdl <id>

# List providers able to run an SDL (bid screening)
akt console screen <sdl-file>
```

---

### Credentials

```bash
# Manage Console API keys (the secret is shown ONCE)
akt console apikey list
akt console apikey create <name> [expires-at]
akt console apikey delete <id>

# Mint a provider-scoped JWT
akt console jwt create
```

---

## Provider Commands

Direct provider gateway operations for `keyring` contexts. All lease commands accept `--provider` and `--provider-url` to pin a specific provider, and `--auth-type` to select `jwt` (default) or `mtls` authentication.

### Provider Status

```bash
akt provider status [provider-addr]
```

---

### Lease Status

```bash
akt provider lease-status [dseq]
```

---

### Lease Logs

```bash
akt provider lease-logs [dseq]
```

**Flags:**

- `-f, --follow` - Follow log output
- `--service` - Filter logs by service name
- `--tail` - Number of lines to show from the end of the logs

---

### Lease Events

```bash
akt provider lease-events [dseq] --follow
```

---

### Lease Shell

Open an interactive shell session to a container in a lease. Positional arguments are the remote command, so `--dseq` and `--service` are flags here.

```bash
akt provider lease-shell --dseq <dseq> --provider <provider> --service <service> -- /bin/sh
```

**Flags:**

- `--dseq` - Deployment sequence number
- `--service` - Service name (required)
- `-t, --tty` - Allocate a TTY (default: true)

---

### Manifests

```bash
# Send an SDL manifest to the provider
akt provider send-manifest deploy.yaml --dseq 12345 --provider akash1prov...

# Retrieve the current manifest
akt provider get-manifest [dseq]
```

---

### Migrations

```bash
# Migrate hostnames between deployments
akt provider migrate-hostnames --dseq 12345 --hostnames example.com,app.example.com

# Migrate endpoints between deployments
akt provider migrate-endpoints --dseq 12345 --endpoints <endpoints>
```

---

## Store Commands

Manage the per-context local deployment store.

```bash
# Display local store information
akt store status

# Export the local store to YAML or JSON
akt store export

# Import records from a previously exported file
akt store import <file>
```

---

## Monitor Commands

Real-time dashboards over an RPC WebSocket connection. See [Network Monitor](/docs/developers/deployment/akt/monitor).

```bash
# Launch hub (defaults to Network dashboard)
akt monitor

# Direct dashboards
akt monitor network
akt monitor provider
akt monitor oracle
akt monitor bme
```

**Flags:**

- `--rpc` - RPC endpoint (also accepted as a positional argument)
- `--insecure` - Skip TLS verification
- `--clean-cache` - Clear cache and start fresh

---

## MCP Command

Start an MCP server for AI assistant integration. See [MCP Server](/docs/developers/deployment/akt/mcp).

```bash
# Read-only mode (safe for AI agents)
akt mcp

# With write tools enabled
akt mcp --enable-writes

# Console tools only, no context needed
akt mcp --console-api-key <key>
```

**Flags:**

- `--enable-writes` - Enable write tools (on-chain transactions and provider mutations)
- `--console-api-key` - Console API key; overrides the context credential and `AKT_CONSOLE_API_KEY`

---

## Utility Commands

### Version

```bash
# Short form: version, commit, build date
akt version

# Full build info: version, commit, build date, Go version, platform, build tags
akt version --long
```

---

### Completion

```bash
# Generate a shell completion script (bash, zsh, fish, powershell)
akt completion zsh
```

---

## Output Formats

Control output format with `--output` (`-o`):

```bash
# Pretty table (default): color-coded states, bold identifiers
akt query deployment

# JSON
akt query deployment -o json

# YAML
akt query deployment -o yaml

# JSONL (workflow commands, for CI/CD)
akt deploy deploy.yaml --bid-select cheapest --yes -o jsonl
```

---

## Related Resources

- [Installation](/docs/developers/deployment/akt/installation)
- [Contexts & Configuration](/docs/developers/deployment/akt/configuration)
- [Deployments](/docs/developers/deployment/akt/deployments)
- [Console Integration](/docs/developers/deployment/akt/console)
- [SDL Reference](/docs/developers/deployment/akash-sdl)
