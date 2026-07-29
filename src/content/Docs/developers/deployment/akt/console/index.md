---
categories: ["Developers", "Deployment", "akt CLI"]
tags: ["akt", "CLI", "Console", "Managed Wallet"]
weight: 4
title: "Akash Console Integration"
linkTitle: "Console Integration"
description: "Deploy with the Akash Console managed wallet from akt with no local keys and deposits in USD"
---

**Deploy on Akash from the CLI without managing keys or buying AKT.**

Contexts with the `console-api` auth method route deployment operations through the [Akash Console Managed Wallet API](/docs/api-documentation/console-api). The Console backend handles signing and broadcasting, deposits are in USD, and no local keys are needed.

---

## Set Up a Console Context

Create a `console-api` context and store your API key:

```bash
# Set up a console-api context
akt context create console --network mainnet --auth-method console-api --set-current

# Validate and store your API key as the context credential
akt console login
```

Create the API key in [Akash Console](https://console.akash.network) under **Settings > API Keys**. `akt console login` validates the key, then writes it to `contexts/<name>/console-api-key` (mode `0600`); it is never written to `config.yaml` and never printed.

The key resolves in this order: `--console-api-key` flag > `AKT_CONSOLE_API_KEY` environment variable > per-context stored credential. Switching context switches Console identity.

**Tip:** Store or replace the key without the interactive prompt with `akt context edit <context> --console-api-key <key>`. An empty string removes it.

Verify the context:

```bash
akt console whoami
```

---

## Deploy with the Managed Wallet

On a `console-api` context, the familiar deployment commands route through the Console automatically. Deposits and amounts are USD (minimum $0.50), accepted as `5`, `5usd`, or `$5`:

```bash
# Deploy using the Console managed wallet
akt tx deployment create deploy.yaml --deposit 5

# List your deployments
akt query deployment

# Update a deployment
akt tx deployment update deploy.yaml 12345

# Close a deployment
akt tx deployment close 12345
```

The workflow commands work on the same rail: `akt deploy deploy.yaml` creates the deployment, waits for bids, and creates the lease through the Console (manifest submission is handled internally by the Console).

**Note:** Managed deployments are priced in `uact` (micro-ACT, 1:1 USD). `akt sdl validate` warns when an SDL prices in `uakt` for this reason. Commands that require local signing (e.g., `akt tx bank send`, `akt tx gov vote`) are not supported with `console-api` auth; use a `keyring` context for those.

---

## Bids and Leases

```bash
# List bids for a deployment
akt console bid list 12345

# Accept a bid by creating a lease and sending the manifest
akt console lease create 12345 akash1prov...
```

`akt console lease create` defaults to the manifest cached per context by `deployment create`, so the provider argument is the only decision left.

**Note:** The `--manifest` flag takes the manifest the Console renders, not the SDL file. The Console returns that manifest exactly once, at `deployment create`; when it cannot be cached (for example, with no active context), the create result includes it so you can pass it to `lease create` later. Passing the SDL by mistake fails locally with a message naming the cause.

---

## Deployment Lifecycle

Drive the Console API directly with the `akt console deployment` group:

```bash
# List / inspect deployments
akt console deployment list
akt console deployment get 12345

# Create a deployment (managed wallet signs server-side)
akt console deployment create deploy.yaml 5

# Add funds to a deployment's escrow
akt console deployment deposit 12345 5

# View or change a deployment's auto-top-up setting
akt console deployment settings 12345 true

# Close
akt console deployment close 12345
```

---

## Live Lease Operations

Live lease commands reach the provider gateway directly, authorized by a short-lived Console-minted JWT, with no wallet and no local key involved. One-shot calls use a 300-second token; streaming and interactive modes use 3600 seconds.

```bash
# Stream logs for one service
akt console logs 12345 web --follow

# Last 100 lines across all services
akt console logs 12345 --tail 100

# Kubernetes events for the lease
akt console events 12345 --follow

# One live status snapshot from the provider gateway
akt console status 12345

# Re-poll every 30s until Ctrl-C
akt console status 12345 --watch --interval 30s

# Interactive shell in a container (defaults to /bin/sh)
akt console shell 12345 web

# Run a single command (a.k.a. exec)
akt console shell 12345 web -- ls -la
```

**Note:** The service filter and `--tail` are applied client-side. The filter matches the service name as a pod-name prefix (the provider reports pod names like `web-5cfc6c7b4b-4cl7z`), and `--tail` bounds a one-shot read; it does not combine with `--follow`.

---

## Wallet and Usage

All amounts are rendered in USD:

```bash
# Managed wallet balance and settings
akt console wallet list
akt console wallet balance
akt console wallet settings
akt console wallet cost

# Spend history for an explicit range (positional dates)
akt console usage 2026-01-01 2026-01-31
```

**Note:** An account that has never configured auto-reload reports the unconfigured default (`"configured": false`) instead of an error. Running `akt console wallet settings true` creates the settings record and enables auto-reload, which authorizes automatic credit purchases against your payment method.

---

## Browse the Marketplace

These commands hit public Console endpoints and need neither an API key nor a configured context:

```bash
# Provider catalog
akt console provider list
akt console provider get akash1prov...
akt console provider regions
akt console provider auditors

# GPU availability and pricing
akt console gpu

# Deployment templates
akt console template list
akt console template get <id>

# Print a template's raw SDL to stdout (for piping)
akt console template sdl <id> > deploy.yaml

# Which providers can run this SDL? (bid screening)
akt console screen deploy.yaml
```

---

## Credentials

```bash
# Manage Console API keys
akt console apikey list
akt console apikey create ci-key
akt console apikey delete <id>

# Mint a short-lived provider-scoped JWT
akt console jwt create
```

**Critical:** `akt console apikey create` prints the secret exactly once. Store it securely; it cannot be retrieved again.

---

## Related Resources

- [Managed Wallet API](/docs/api-documentation/console-api) - The REST API behind these commands
- [Deployments](/docs/developers/deployment/akt/deployments) - The full deployment lifecycle with `akt`
- [Contexts & Configuration](/docs/developers/deployment/akt/configuration) - Context and credential management
