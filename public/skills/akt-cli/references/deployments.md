# Deployment recipes

Replace context `example`, dseq `12345`, service `web`, and SDL paths with the
values for the requested workload. The commands below are individual recipes,
not a script to run from top to bottom. Inspect help under the selected context
when its workflow definitions differ from the built-ins.

## Author and validate locally

Generate into a new path so an existing SDL is not overwritten:

```bash
akt sdl init web > deploy.yaml
akt sdl validate deploy.yaml -o json
```

These commands need no context, network, or key. `sdl init` writes SDL YAML;
`sdl validate` returns `valid`, service/group counts, errors, and warnings.
Validation failure exits nonzero. Edit the image, resources, environment, and
pricing to match the application, then validate again.

Images must have an explicit version tag or digest. Untagged images and
`:latest` fail validation. Prefer `uact` pricing for use on either execution
path. `uakt` pricing requires a matching explicit chain deposit and is unsuitable
for Console. Use `akt sdl scaffolds` for GPU and multi-service starting points.

## Preview a deployment

```bash
akt deploy deploy.yaml --context example --dry-run -o jsonl
```

The preview emits planned workflow steps without submitting mutations.
The Console path needs no deposit. The chain path defaults to `auto`, which
queries the network's current deposit parameters. An explicit chain coin can
be supplied as the second positional argument if the amount and denomination
were chosen for that network. A deposit is escrow, not a total spending cap.

Preview success does not verify credentials, funding, provider availability,
or application readiness. Review the requested resources and price limits in
the SDL before authorized execution. SDL prices limit bid rates, not cumulative
spend. If the user specifies a total budget, establish how the available billing
and runtime controls can honor it before creating the deployment; do not
promise a total spending cap from an SDL price or escrow deposit.

## Deploy with an approved bid strategy

If the user accepts any qualifying provider and requests the cheapest bid:

```bash
akt deploy deploy.yaml --context example --bid-select cheapest --yes -o jsonl
```

For a chosen provider, replace `cheapest` with
`provider=<full-provider-address>`. Do not infer that lowest price satisfies
region, trust, or hardware requirements. Set those requirements in the SDL.
`--bid-timeout` and `--ready-timeout` bound waiting. Keep the returned dseq,
provider, workflow ID, transaction hashes, and any recovery commands.
Without `--no-wait-active`, deployment also waits for service readiness.

## Inspect a Console deployment

```bash
akt console deployment get 12345 --context example -o json
akt console status 12345 --context example -o json
akt console logs 12345 web --context example -o json
akt console events 12345 --context example -o json
```

These one-shot calls use the managed identity. Add `--follow` to logs/events
only when continuous streaming is requested. For a specific remote command:

```bash
akt console shell 12345 web --context example -o json -- pwd
```

Remote commands have their own effects. Choose a command within the user's
task; structured output requires an explicit command instead of an interactive
shell session.

## Inspect a chain deployment

```bash
akt query deployment 12345 --context example -o json
akt query market lease 12345 active --context example -o json
akt provider lease-status 12345 --context example -o json
akt provider lease-logs 12345 --service web --context example -o json
```

The context supplies the owner for these identifiers. Provider gateways use
the matching local identity. When multiple active leases exist, inspect the
leases and specify the full provider address using the gateway command's
`--provider` override. Console-managed gateway access uses the Console commands
above. The `--service` flag here is supported; Console logs use a positional
service instead.

## Update a deployment

The shared update workflow takes the SDL first, then the dseq:

```bash
akt sdl validate deploy.yaml -o json
akt update deploy.yaml 12345 --context example --dry-run -o jsonl
```

After the update is authorized:

```bash
akt update deploy.yaml 12345 --context example --yes -o jsonl
```

Changing resources can close leases and reopen bidding. Inspect the updated
deployment and services on the same execution path after the workflow.

## Close a deployment

First inspect the exact deployment and confirm it is within the requested
closure or cleanup scope. Preview and execution are separate:

```bash
akt close 12345 --context example --dry-run -o jsonl
```

```bash
akt close 12345 --context example --yes -o jsonl
```

Read back the deployment on its original execution path and verify it is
closed. Preserve any pending transaction hash or unresolved outcome.
