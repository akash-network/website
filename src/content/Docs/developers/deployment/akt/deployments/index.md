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

- `akt` installed and a context configured ([installation guide](/docs/developers/deployment/akt/installation))
- For `keyring` contexts: a funded account for the live chain deposit and transaction fees. `akt` queries the current deployment minimum when the deposit is `auto`.
- For `console-api` contexts: a Console API key ([Console integration](/docs/developers/deployment/akt/console)) and an explicit USD deposit of at least $0.50.

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
  warning: profiles/placement/dcloud/pricing: pricing denom "uakt" does not match the default deposit; use "uact" on either rail or pass a matching explicit uakt deposit on chain
```

**Lint rules:**

- An unpinned image is an **error**: every service image must carry an explicit tag or `@sha256:` digest. Untagged images and `:latest` are rejected as non-reproducible.
- For pricing, `uact` is canonical on both rails. `uakt` produces a **warning** because it only works on chain with an explicitly matching `--deposit <amount>uakt`. Any other denomination is an error.

See the [SDL Reference](/docs/developers/deployment/akash-sdl) for the full configuration syntax.

---

## Deploy

Run the full deployment lifecycle (create the deployment, wait for bids, select a provider, create the lease, and send the manifest) with one command:

```bash
akt deploy deploy.yaml
```

In interactive mode (the default), `akt` shows a per-step progress display and prompts you to select a bid from a provider/price table.

**Flags:**

- `--deposit` - Initial deposit. Use `auto` for the live chain minimum, an explicit coin with its denomination on the chain rail, or `5`, `5usd`, `$5`, or `5.50usd` on the Console rail. The default is `auto`, but Console contexts require an explicit USD amount.
- `--bid-timeout` - Maximum time to wait for bids (default: `5m`)
- `--bid-select` - Bid selection mode: `interactive` (default), `cheapest`, or `provider=<addr>`
- `--ready-timeout` - Maximum time to wait for deployed services to become ready (default: `2m`)
- `--no-wait-active` - Return after manifest submission without waiting for readiness
- `--yes` (`-y`) - Skip confirmation prompts
- `--dry-run` - Show the execution plan without broadcasting transactions

**Example:**

```bash
# Deploy, automatically accepting the cheapest bid
akt deploy deploy.yaml --bid-select cheapest --yes
```

On `console-api` contexts, provider manifest steps are skipped because the Console submits manifests internally.

Before any transaction is broadcast, `--dry-run` resolves the signer and the deposit that execution would use. A chain `auto` dry-run queries the live deployment minimum. It fails if that value cannot be resolved instead of printing a fallback amount.

After manifest submission, a successful deploy waits for service readiness and prints the deployment owner, dseq, selected provider, bid price, live service URIs, readiness result, Console link when applicable, auto-top-up state, and follow-up commands. Use `--no-wait-active` for automation that only needs manifest acceptance.

If a deploy fails after creating paid chain state, `akt` prints the dseq, provider, escrow risk, and exact retry and close commands. It does not automatically close the deployment. Retry the failed step, or run the printed `akt close <dseq>` command if you are abandoning it.

---

## Automate in CI/CD

For scripting, `--output jsonl` replaces the interactive display with one JSON object per line, one line per step (`create-deployment`, `wait-for-bids`, `select-bid`, `create-lease`, `send-manifest`, `display-result`):

```bash
akt deploy deploy.yaml --bid-select cheapest --yes -o jsonl
```

```jsonl
{"workflow":"deploy","id":"wf_a1b2c3","step":"create-deployment","result":"completed","errors":[],"txs":[{"hash":"ABCD...","height":12345,"gas_used":150000,"code":0}]}
{"workflow":"deploy","id":"wf_a1b2c3","step":"wait-for-bids","result":"completed","errors":[],"txs":[]}
{"workflow":"deploy","id":"wf_a1b2c3","step":"create-lease","result":"completed","errors":[],"txs":[{"hash":"EFGH...","height":12350,"gas_used":120000,"code":0}],"outputs":{"dseq":"12345","provider":"akash1provider..."}}
{"workflow":"deploy","id":"wf_a1b2c3","step":"display-result","result":"completed","errors":[],"txs":[],"outputs":{"dseq":"12345","provider":"akash1provider...","uris":{"web":["https://example.test"]},"ready":true}}
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

Image and environment changes usually keep the current leases. Changing the resource profile can close leases and reopen bidding, so review the effect before confirming.

On the chain rail, `akt update` submits the update and sends the revised manifest to every provider with an active lease. It attempts every provider before reporting an error, and the manifest step is safe to retry. On the Console rail, the Console API handles the manifest update.

---

## Close a Deployment

Close the deployment and return the remaining escrow balance:

```bash
akt close 12345
```

Closing a deployment is irreversible. `akt` checks the current state first; an already-closed or missing deployment exits nonzero and records the failed action instead of reporting another successful close.

---

## Confidential compute deployments

`akt` supports SDLs whose placement requirements include confidential compute. Set `params.tee` to `cpu-gpu` in the SDL, then deploy it through the normal workflow. `akt` preserves the TEE placement requirement and manifest parameters so a compatible provider schedules the attestation sidecar.

After the lease becomes active, request a fresh quote:

```bash
akt provider lease-attestation 12345
```

The command authenticates the provider transport and verifies that the report echoes a fresh nonce. It reports fields such as `tee_platform`, `nonce_verified`, and `mock_report`. It does not yet verify the hardware evidence signature, endorsement chain, or measurement policy, so treat it as a freshness and transport-authentication check rather than full remote attestation.

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
# Live lease deployment status; provider resolves from the active lease
akt provider lease-status 12345

# Stream container logs
akt provider lease-logs 12345 --follow

# Stream Kubernetes events
akt provider lease-events 12345 --follow

# Open an interactive shell in a container
akt provider lease-shell --dseq 12345 --service web -- /bin/sh
```

`akt` resolves a single active provider lease from the dseq, then resolves the gateway URL from that provider's on-chain record. Pass `--provider` when several active leases make the choice ambiguous. `--provider-url` overrides the gateway URL for diagnostics; it is not a blockchain RPC URL.

**Note:** On `console-api` contexts, use the equivalent `akt console logs`, `akt console events`, `akt console status`, and `akt console shell` commands. See [Console Integration](/docs/developers/deployment/akt/console).

---

## Local Deployment Store

`akt` keeps a per-context local store of your deployments for fast, offline-capable listings:

```bash
# Display local store information
akt store status

# Reconcile tracked accounts with current chain state
akt store sync

# Export the local store to YAML or JSON
akt store export > deployments-backup.yaml

# Import records from a previously exported file
akt store import deployments-backup.yaml
```

`akt store export` is a backup and inspection format. It is not an SDL and cannot be passed to `akt deploy`.

---

## Next Steps

- **[Console integration](/docs/developers/deployment/akt/console)** - Deploy with the managed wallet, funded in USD
- **[Queries and transactions](/docs/developers/deployment/akt/queries-and-transactions)** - Work with the chain directly
- **[SDL reference](/docs/developers/deployment/akash-sdl)** - Learn SDL configuration
- **[SDL examples](/docs/developers/deployment/akash-sdl/examples-library)** - Browse deployment examples

---

**Need help?** Join [Discord](https://discord.akash.network) #developers channel!
