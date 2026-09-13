---
name: akt-cli
description: Use akt, the Akash Network CLI, to configure contexts, author SDLs, deploy workloads, inspect deployments, and troubleshoot chain, Console, or provider operations. Apply when operating akt or deploying applications on Akash; repository development follows the project's contributor instructions.
---

# Operate Akash with akt

`akt` is the unified Akash user CLI. It manages contexts and keys, queries the
chain, signs transactions, deploys workloads, accesses provider gateways, and
integrates with Akash Console. Blockchain validators and provider infrastructure
run through their own node software.

This skill needs an installed `akt` binary and shell access. Install the skill
from the same release as the binary; repository copies track their checkout.
Use the installed version's help when examples differ from available commands.
There is no need to read the akt source repository to operate the CLI.

## Discover the installed CLI

```bash
akt version --long -o json
akt --help
```

Inspect the relevant command's `--help` before choosing arguments. Workflow
definitions can be overridden per context, so discover their help with the
same `--context` you intend to use. Bare `akt` prints help; `akt monitor` is an
interactive dashboard. Use one-shot queries for agent inspection.

## Establish identity and capabilities

A context selects a network, keyring, default account, Console credentials,
local deployment store, and action log. Context selection is `--context`, then
`AKT_CONTEXT`, then the configured current context. Use per-invocation
`--context` when working on a named environment.

```bash
akt context list -o json
akt context show --context example -o json
```

Replace `example` with the user's intended context. Check its network,
`auth_method`, account, and `capabilities` before acting. A configured RPC
enables chain commands but does not prove that a funded signing key exists.
Unavailable commands explain which configuration is missing.

Two execution paths can coexist in one context:

- `keyring`: the user holds the key and akt signs chain transactions.
- `console-api`: Console signs using its managed wallet and funds deployments
  from account credits.

The context preference chooses the path for shared `deploy`, `update`, and
`close` workflows. Explicit `akt tx` commands always use local signing.
Explicit `akt console` commands use Console. Read [setup](references/setup.md)
when configuration, credentials, installation, or MCP setup is needed.

## Choose the operation and identifiers

Prefer `akt deploy`, `akt update`, and `akt close` for complete deployment
lifecycle work. They select the configured execution path and coordinate the
underlying steps. Use lower-level commands when the task calls for an individual
operation or recovery step.

SDL is the YAML description of services, resources, placement, and pricing.
The deployment sequence number, `dseq`, identifies a deployment within its
owner's account. Keep the context and owner with every captured dseq.
Orders and leases add group/order sequence numbers and a provider address.

Primary values are positional. Deployment queries accept identifiers such as
`12345` or `<full-owner-address>/12345`, with an omitted owner resolved from
the context. Query filters can take a positional state such as `active`.
Use command help for the exact hierarchy; familiar `--owner`, `--dseq`,
`--state`, and service flags are disabled on some commands. Other commands
still expose those flags. Preserve complete addresses when reporting results.

## Run a bounded operation

1. Keep the user's chosen network, account, provider requirements, and budget.
   Inspect or preview freely within the requested task. A skill invocation or
   `--yes` does not grant permission to spend funds or close other workloads.
2. Generate or edit the SDL, then validate it locally. Read
   [deployment recipes](references/deployments.md) for the sequence and examples.
3. Preview a workflow with `--dry-run` when useful. A chain preview with the
   default `auto` deposit can query live network parameters; it is not an
   offline transaction simulation or proof that deployment will succeed.
4. For authorized unattended deployment, supply an explicit bid strategy and
   `--yes`. Use `cheapest` only if any qualifying provider is acceptable, or
   `provider=<full-provider-address>` when a provider was chosen. `--yes` does
   not select a bid, supply missing arguments, or unlock a keyring.
5. Capture results and inspect resulting deployment, lease, and service state.
   A transaction hash or `sync` broadcast response alone is not confirmation.

## Read machine output

Request `-o json` for ordinary queries and `-o jsonl` for workflow execution or
previews. Preserve stderr separately from stdout. Parse each JSONL record and
retain the workflow/run ID, dseq, provider, transaction hashes, and errors.
Check the exit status as well as the records.

SDL source commands such as `sdl init` emit raw YAML; redirect that output to a
file without `-o`. Human output scales amounts for readability. Machine amounts
retain their denomination, so never interpret a micro-denominated integer as
whole AKT or dollars without conversion.

## Recover from partial failure

A failed or interrupted deployment may leave funded resources and active leases.
Read the emitted recovery commands and inspect authoritative state before
repeating a mutation. An ambiguous Console create or lease response may already
have committed. Do not replay the whole deployment or invent a `--resume` flag.

Use `akt context log` to inspect recorded mutations, and retain the original
error and run ID. Closing leftover resources requires the user's existing
authorization to cover those resources. Read
[troubleshooting](references/troubleshooting.md) for state checks and remedies.

MCP is optional. If the client already exposes akt tools, discover their current
schemas and use this same operating guidance. Tool availability depends on
configuration. `akt mcp` starts read-only; enabling writes is a separate choice.
