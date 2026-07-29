---
categories: ["Developers", "Deployment", "akt CLI"]
tags: ["akt", "CLI", "Deployments", "SDL", "Workflows"]
weight: 3
title: "Deploy with akt"
linkTitle: "Deployments"
description: "Author SDL files and run the full deployment lifecycle with akt deploy, update, and close"
---

**Deploy applications on Akash with a single command.**

The workflow commands `akt deploy`, `akt update`, and `akt close` orchestrate the full deployment lifecycle (create, bid selection, lease, and manifest), routing each step through the active context's auth method: local signing for `keyring` contexts, the Console API for `console-api` contexts.

---

## Prerequisites

Before deploying, ensure you have:

- `akt` installed and a context configured ([Installation Guide →](/docs/developers/deployment/akt/installation))
- For `keyring` contexts: a funded account. A minimum deposit of 0.5 AKT is required to deploy, plus a small transaction fee.
- For `console-api` contexts: a Console API key ([Console Integration →](/docs/developers/deployment/akt/console)). Deposits are in USD (minimum $0.50).

---

## Author an SDL

`akt sdl` scaffolds, generates, and validates deployment SDLs entirely locally, with no context, no key, and no RPC endpoint needed.

```bash
# List the built-in scaffolds and the flags each honors
akt sdl scaffolds

# Generate a web service SDL
akt sdl init web --image nginx:1.27 > deploy.yaml

# GPU workload with a specific model
akt sdl init gpu --gpu-model h100 --image myorg/model:1.0 > gpu.yaml

# Generate and validate without touching disk
akt sdl init web --image nginx:1.27 | akt sdl validate -

# Validate a file (exit 0 valid, exit 1 invalid)
akt sdl validate deploy.yaml
```

Built-in scaffolds: `web`, `gpu`, `multi-service`, and `ip-lease`. Generation flags (`--image`, `--cpu`, `--memory`, `--gpu-model`, `--price`, ...) have per-scaffold defaults, so the zero-flag invocation always produces valid output.

A valid document prints `valid: 1 service(s), 1 group(s), 0 warning(s)`. Problems are listed with a hint:

```
invalid: 1 error(s), 1 warning(s)
  error: services/web/image: image "nginx" has no tag; pin an explicit version for reproducible deployments
    hint: use "nginx:<version>" instead of an untagged image
  warning: profiles/placement/dcloud/pricing: pricing denom "uakt" is on-chain only; managed (console-api) deployments are priced in "uact" (micro-ACT, 1:1 USD)
```

**Lint rules:**

- An unpinned image is an **error**: every service image must carry an explicit tag or `@sha256:` digest. Untagged images and `:latest` are rejected as non-reproducible.
- For pricing, `uact` passes, `uakt` is a **warning** (valid on-chain, but managed `console-api` deployments are priced in `uact`), and any other denom is an error.

See the [SDL Reference](/docs/developers/deployment/akash-sdl) for the full configuration syntax.

---

## Deploy

Run the full deployment lifecycle (create the deployment, wait for bids, select a provider, create the lease, and send the manifest) with one command:

```bash
akt deploy deploy.yaml
```

In interactive mode (the default), `akt` shows a per-step progress display and prompts you to select a bid from a provider/price table.

**Flags:**

- `--deposit` - Initial deposit: `5000000uakt` (coin, `keyring` contexts), `5usd` or `$5` (USD, `console-api` contexts), or `auto` for the chain minimum (default)
- `--bid-timeout` - Maximum time to wait for bids (default: `5m`)
- `--bid-select` - Bid selection mode: `interactive` (default), `cheapest`, or `provider=<addr>`
- `--yes` (`-y`) - Skip confirmation prompts
- `--dry-run` - Show the execution plan without broadcasting transactions

**Example:**

```bash
# Deploy, automatically accepting the cheapest bid
akt deploy deploy.yaml --bid-select cheapest --yes
```

**Note:** On `console-api` contexts, provider manifest steps are skipped; the Console submits manifests internally.

---

## Automate in CI/CD

For scripting, `--output jsonl` replaces the interactive display with one JSON object per line, one line per step (`create-deployment`, `wait-for-bids`, `select-bid`, `create-lease`, `send-manifest`, `display-result`):

```bash
akt deploy deploy.yaml --bid-select cheapest --yes -o jsonl
```

```jsonl
{"workflow":"deploy","id":"wf_a1b2c3","step":"create-deployment","result":"completed","errors":[],"txs":[{"hash":"ABCD...","height":12345,"gas_used":150000,"code":0}]}
{"workflow":"deploy","id":"wf_a1b2c3","step":"wait-for-bids","result":"completed","errors":[],"txs":[]}
{"workflow":"deploy","id":"wf_a1b2c3","step":"create-lease","result":"completed","errors":[],"txs":[{"hash":"EFGH...","height":12350,"gas_used":120000,"code":0}]}
```

Parse with `jq`:

```bash
# Extract the deployment transaction hash
akt deploy deploy.yaml --bid-select cheapest --yes -o jsonl \
  | jq -r 'select(.step == "create-deployment") | .txs[0].hash'
```

---

## Update a Deployment

Update the deployment on-chain from a modified SDL file:

```bash
akt update deploy.yaml 12345
```

**What can be updated:**

- Container image versions
- Environment variables
- Command and args

**What cannot be updated:**

- CPU, memory, storage, GPU resources
- Placement criteria
- Service names

To change resources or placement, close the deployment and create a new one.

---

## Close a Deployment

Close the deployment and return the remaining escrow balance:

```bash
akt close 12345
```

---

## Monitor a Deployment

Check on-chain state with the positional query filters:

```bash
# List your deployments (owner defaults to the context account)
akt query deployment

# Get a specific deployment
akt query deployment 12345

# Leases for a deployment
akt query market lease 12345
```

Reach the provider gateway for live status, logs, and a shell:

```bash
# Live lease deployment status
akt provider lease-status 12345

# Stream container logs
akt provider lease-logs 12345 --follow

# Stream Kubernetes events
akt provider lease-events 12345 --follow

# Open an interactive shell in a container
akt provider lease-shell --dseq 12345 --provider akash1... --service web -- /bin/sh
```

**Note:** On `console-api` contexts, use the equivalent `akt console logs`, `akt console events`, `akt console status`, and `akt console shell` commands. See [Console Integration](/docs/developers/deployment/akt/console).

---

## Local Deployment Store

`akt` keeps a per-context local store of your deployments for fast, offline-capable listings:

```bash
# Display local store information
akt store status

# Export the local store to YAML or JSON
akt store export > deployments-backup.yaml

# Import records from a previously exported file
akt store import deployments-backup.yaml
```

---

## Next Steps

- **[Console Integration →](/docs/developers/deployment/akt/console)** - Deploy with the managed wallet, funded in USD
- **[Queries & Transactions →](/docs/developers/deployment/akt/queries-and-transactions)** - Work with the chain directly
- **[SDL Reference →](/docs/developers/deployment/akash-sdl)** - Learn SDL configuration
- **[SDL Examples →](/docs/developers/deployment/akash-sdl/examples-library)** - 290+ deployment examples

---

**Need help?** Join [Discord](https://discord.akash.network) #developers channel!
