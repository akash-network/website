---
categories: ["Providers"]
tags: ["Operations", "Leases"]
weight: 1
title: "Lease Management"
linkTitle: "Lease Management"
description: "Inspect active leases and perform provider-side lease operations"
---

Use the unified `akt` CLI for on-chain lease operations and `kubectl` for the workloads represented inside the provider cluster. Comparing both views helps identify a lease that is closed on-chain but still has cluster resources, or a live lease whose workload is unhealthy.

## Before you start

Install [`akt`](/docs/developers/deployment/akt/installation) and select a mainnet keyring context containing the provider key. Confirm the active identity before a transaction:

```bash
akt context show
akt context keys show <provider-key> --address
```

The address must match the provider owner recorded in `provider.yaml`.

## List active provider leases

Query active leases by provider address:

```bash
akt query market lease \
  --by provider \
  <provider-address> \
  active \
  --page 1 \
  --limit 500
```

`akt` uses positional resource filters. The active context supplies the chain ID, RPC endpoint, and query defaults.

## Compare leases with cluster workloads

List the provider's workload records and their lease labels:

```bash
kubectl --namespace lease get manifests --show-labels
kubectl --namespace lease get providerhosts
```

Inspect one manifest:

```bash
kubectl --namespace lease get manifest <manifest-name> --output yaml
```

The labels identify the owner, deployment sequence (`dseq`), group sequence (`gseq`), order sequence (`oseq`), and provider. Match that tuple to the on-chain lease result.

Deployment routes use Gateway API resources. Confirm them with:

```bash
kubectl get httproutes --all-namespaces
```

## Close a provider bid

Closing a bid terminates the provider side of the lease and releases its capacity. Verify the exact lease tuple and reason before signing:

```bash
akt tx market bid close \
  --owner <tenant-address> \
  --dseq <dseq> \
  --gseq <gseq> \
  --oseq <oseq> \
  --from <provider-key> \
  --reason 10002 \
  --yes
```

The provider address is derived from the signing key. Do not pass the tenant's key or address to `--from`.

Provider reason codes are:

|    Code | Meaning                                |
| ------: | -------------------------------------- |
| `10000` | Workload or environment instability    |
| `10001` | Planned decommissioning                |
| `10002` | Unspecified provider reason            |
| `10003` | Tenant did not send a manifest in time |

If the lease uses a reclamation window, follow the [reclamation procedure](/docs/providers/setup-and-installation/kubespray/reclamation). The chain rejects a close transaction submitted before its reclamation deadline.

## Verify cleanup

After the transaction is committed, confirm that the lease is no longer active and that its cluster resources disappear:

```bash
akt query market lease \
  --by provider \
  <provider-address> \
  active \
  --page 1 \
  --limit 500

kubectl --namespace lease get manifests --show-labels
kubectl get namespaces
```

If a closed lease remains in Kubernetes, inspect the provider and operator logs before deleting anything manually:

```bash
kubectl --namespace akash-services logs statefulset/akash-provider --tail 200
kubectl --namespace akash-services get pods
kubectl --namespace lease get events --sort-by=.metadata.creationTimestamp
```

Restart the provider only after identifying a reconciliation problem:

```bash
kubectl --namespace akash-services rollout restart statefulset/akash-provider
kubectl --namespace akash-services rollout status statefulset/akash-provider
```

## Automation safety

Do not automate lease closure by executing the legacy `provider-services` binary inside the provider pod. The `akt` binary, context, and signing key are not supplied by that pod, and interactive keyrings are unsuitable for unattended cron jobs.

An automated policy needs a dedicated, least-privilege keyring context, a non-interactive secret source, exact allow or deny rules, transaction auditing, retry protection, and alerting. Test the policy with `akt`'s `--dry-run` option before enabling signed transactions. Keep private keys outside scripts, container images, and Git.

## Related resources

- [`akt` queries and transactions](/docs/developers/deployment/akt/queries-and-transactions)
- [`akt` contexts and key management](/docs/developers/deployment/akt/configuration)
- [Provider Status and Monitoring](/docs/providers/operations/monitoring)
- [Provider Verification](/docs/providers/operations/provider-verification)
