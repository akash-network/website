# Troubleshooting and recovery

Preserve the failing command, exit status, stderr, full resource identifiers,
and structured result. Include `akt version --long` when reporting a defect.
Use the user's original context throughout diagnosis.

## Missing configuration or unavailable command

```bash
akt context show --context example -o json
akt deploy --context example --help
```

Read the capability diagnostic. An RPC endpoint enables chain queries;
transactions additionally need a usable account and signing key. Console
needs a resolvable API key. A context can have either or both paths configured.
Follow the named remedy only within the intended setup task. A missing
capability is not a reason to switch network or spend from another account.

If a known flag is rejected, inspect that command's help. Some identity and
filter flags have positional replacements. Syntax can differ between the
shared workflows, raw transactions, and explicit Console commands.

## A command waits for input

Check whether it is selecting a bid, confirming a mutation, unlocking the
keyring, or starting an interactive shell/dashboard. `--yes` skips supported
confirmation prompts only. An unattended deployment needs `--bid-select`.
Use a one-shot query or an explicit remote shell command for structured output.
Supply credentials through the configured mechanism rather than changing to an
insecure keyring backend.

## Deployment or transaction outcome is uncertain

Stop before replaying a create, accepting another bid, or closing resources.
Read the workflow's JSONL results and recovery instructions, then inspect its
action log:

```bash
akt context log --context example --type workflow --limit 20 -o json
```

Use `--workflow-id` with the captured ID to isolate one run. For a chain
transaction hash, `akt query tx <transaction-hash> --context example -o json`
can establish confirmation. A `sync` submission response only establishes
submission; inspect the transaction result and deployment state.

For chain deployments, inspect the deployment and its leases with the queries
in [deployment recipes](deployments.md). For Console, inspect its deployment,
bids, and live service status:

```bash
akt console deployment get 12345 --context example -o json
akt console bid list 12345 --context example -o json
akt console status 12345 --context example -o json
```

Console create and lease timeouts can occur after the operation commits. Do not
blindly resubmit. Follow the CLI's reconciliation output and report unresolved
state if a definitive read is unavailable. There is no implemented workflow
`--resume`; use the concrete recovery commands emitted for the failed step.
Preserve funded resources unless their closure is covered by the task.

## Local store differs from remote state

```bash
akt store status --context example -o json
```

The local store is a snapshot. Use authoritative chain or Console reads to
establish mutation outcomes. `akt store sync --context example` explicitly
reconciles the local store when needed. `akt store export` is an inspection
and backup format; it is not a deployable SDL, and there is no `store list`.
