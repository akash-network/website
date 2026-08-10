---
categories: ["Developers", "Deployment", "akt CLI"]
tags: ["akt", "CLI", "Queries", "Transactions", "Blockchain"]
weight: 5
title: "Queries & Transactions"
linkTitle: "Queries & Transactions"
description: "Query the Akash blockchain and submit transactions for every Akash and Cosmos SDK module with akt"
---

**Query the chain and submit transactions for every Akash and Cosmos SDK module.**

`akt query` (alias `akt q`) and `akt tx` cover the complete Akash chain command set. Defaults for the node, chain ID, gas settings, and signing account come from the active context, so most commands need no flags at all.

---

## Available Modules

| Group          | Modules                                                                                                                                 |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Akash          | `deployment`, `market`, `provider`, `cert`, `audit`, `escrow`, `oracle`, `bme`                                                          |
| Cosmos SDK     | `bank`, `staking`, `distribution`, `gov`, `authz`, `feegrant`, `slashing`, `vesting`, `upgrade`, `crisis`, `evidence`, `mint`, `params` |
| IBC            | `ibc-core`, `ibc-transfer`                                                                                                              |
| WASM           | `store`, `instantiate`, `execute`, `migrate`, `query`                                                                                   |
| Auth utilities | `sign`, `sign-batch`, `multisign`, `validate-signatures`, `broadcast`, `encode`, `decode`                                               |

---

## The Positional Filter Argument

Akash query commands take a **positional filter argument** instead of `--owner`/`--dseq` flags. The filter follows the resource hierarchy (`owner/dseq/gseq/oseq/provider`) with smart type detection: a bech32 address is an owner, a number is a dseq. When no owner is given, the context's default account is used.

State keywords are also positional: `akt query deployment active` lists active deployments, and identity and state combine as two positional arguments (`akt query deployment 12345 active`).

```bash
# List your deployments (owner defaults to context account)
akt query deployment

# Get a specific deployment by dseq (owner from context)
akt query deployment 12345

# List deployments for a specific owner
akt query deployment akash1abc...

# Get a specific deployment by owner and dseq
akt query deployment akash1abc.../12345

# List active leases (positional state keyword)
akt query market lease active

# Leases for a specific deployment
akt query market lease 12345

# Specific lease (owner from context)
akt query market lease 12345/1/1/akash1prov...

# Provider-perspective lease query
akt query market lease --by provider akash1prov...
```

**Note:** When the identity pins down a single record, the state argument acts as a verification. The command fails if the record is in a different state instead of printing it.

**Note:** The identity and filter flags from older Akash CLIs (`--owner`, `--dseq`, `--gseq`, `--oseq`, `--state`, `--provider`) are not available; use the positional form.

If the context has no `default-account`, owner-scoped commands require an explicit owner. They refuse locally instead of returning every account's records. This is normal for `console-api` and monitoring-only contexts:

```bash
# Explicit owner works without a default account
akt query deployment akash1abc...

# Console-owned deployments come from the Console API identity
akt console deployment list
```

---

## Pagination

Paginated queries accept `--limit`, `--offset`, `--page`, `--page-key`, and `--reverse` where the underlying query supports them:

```bash
# Second page, 25 deployments per page
akt query deployment akash1abc... --limit 25 --page 2

# Most recent records first
akt query deployment akash1abc... --limit 25 --reverse
```

Use `--count-total` when you also need the total number of matching records. Unsupported pagination flags are refused rather than ignored.

---

## Common Queries

```bash
# Check balances
akt query bank balances akash1abc...

# Query a provider
akt query provider akash1prov...

# Query staking validators
akt query staking validators

# Query a WASM contract
akt query wasm contract-state smart akash1contract... '{"get_count":{}}'

# The q alias works everywhere
akt q deployment 12345
```

---

## Transactions

All transaction commands accept `--from`, `--gas`, `--fees`, `--broadcast-mode`, `--yes`, `--dry-run`, and other standard flags. Defaults come from the active context.

```bash
# Send tokens
akt tx bank send alice akash1dest... 1000000uakt

# Create a deployment
akt tx deployment create deployment.yaml

# Close a deployment (positional dseq)
akt tx deployment close 12345

# Create a lease (positional dseq and provider; gseq/oseq default to 1)
akt tx market lease create 12345 akash1prov...

# Delegate to a validator
akt tx staking delegate akashvaloper1... 1000000uakt

# Vote on a governance proposal
akt tx gov vote 42 yes

# Generate and publish a client certificate
akt tx cert generate client
akt tx cert publish client

# Convert between AKT and ACT (Burn-Mint-Equilibrium)
akt tx bme mint-act 500000uakt
akt tx bme burn-act 500000uact
```

**Note:** Amounts are in `uakt` (micro-AKT). 1 AKT = 1,000,000 uakt.

Direct `akt tx` commands require a keyring signing account. In a `console-api` context, use `akt deploy`, `akt update`, and `akt close`, or the matching `akt console` deployment command.

---

## Output Formats

```bash
# Pretty table (default): color-coded states, bold identifiers
akt query deployment

# JSON, for scripts and pipes
akt query deployment -o json

# YAML
akt query bank balances akash1abc... -o yaml
```

---

## Related Resources

- [Commands Reference](/docs/developers/deployment/akt/commands-reference) - Complete `akt` command reference
- [Deployments](/docs/developers/deployment/akt/deployments) - The one-command deployment workflow
- [Contexts & Configuration](/docs/developers/deployment/akt/configuration) - Where transaction defaults come from
