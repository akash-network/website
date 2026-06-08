---
categories: ["Providers"]
tags: ["Reclamation", "Advanced Features"]
weight: 6
title: "Reclamation"
linkTitle: "Reclamation"
description: "Enable resource reclamation support on your Akash provider"
---

Providers can opt into supporting resource reclamation by configuring a reclamation window. When enabled, the provider's bid daemon will offer that window on bids it submits, allowing the provider to match orders from tenants that require reclamation.

Reclamation is a tenant-negotiated grace period that gives the tenant time to migrate before the provider terminates a lease. See the [SDL reclamation documentation](/docs/developers/deployment/akash-sdl/advanced-features/#resource-reclamation) for the tenant-facing perspective and [AEP-82](https://akash.network/roadmap/aep-82/) for the full protocol specification.

By default, providers do not offer reclamation. Reclamation is opt-in via configuration.

## Prerequisites

- `provider-services` **v0.13.0** or later

## Configuration

The reclamation window is set via the `--reclamation-window` flag on `provider-services run`, or equivalently via the `AKASH_RECLAMATION_WINDOW` environment variable.

Accepted values are Go-style duration strings:

- `24h` — 24 hours
- `720h` — 30 days
- `0` or unset — no reclamation offered (default)

### Helm chart

Set the reclamation window in your provider `values.yaml`:

```yaml
reclamationWindow: "24h"
```

Apply the change with `helm upgrade`. This injects `AKASH_RECLAMATION_WINDOW=24h` into the provider StatefulSet environment.

### Direct env var injection

The env var can also be set directly on a running provider StatefulSet without a helm upgrade:

```bash
kubectl -n akash-services set env statefulset/akash-provider \
    AKASH_RECLAMATION_WINDOW=24h
```

This triggers a rolling restart and the provider picks up the new value on startup. Use this path for quick experimentation; for persistent configuration prefer the helm value above.

## Choosing a window

The window is a commitment: once a tenant matches with your provider, you cannot terminate the lease before the negotiated window elapses (other than by waiting). This has real operational implications:

- **Shorter windows** (e.g. `1h` — current network minimum) suit providers running shorter-lived or fast-recovering workloads
- **Longer windows** (e.g. `24h`–`72h`) give tenants stronger migration guarantees, making your provider more attractive to tenants who require reclamation, but commit capacity for longer through any reclaim event
- Windows must be within the network's `min_reclamation_window` and `max_reclamation_window` governance bounds

The reclamation window applies to all bids from your provider. The bid daemon does not currently offer per-order or attribute-based window selection.

## Verifying configuration

After enabling reclamation, verify the env var is in scope on the running pod:

```bash
kubectl -n akash-services exec akash-provider-0 -c provider -- env | grep RECLAMATION
```

Expected output:

```
AKASH_RECLAMATION_WINDOW=24h
```

To verify the provider actually bids on reclamation-required orders, watch the bid daemon logs after a tenant deploys with the `reclamation` SDL block:

```bash
kubectl -n akash-services logs -f akash-provider-0 -c provider | grep -E "order|bid|reclamation"
```

A successful bid on a reclamation-required order produces a log sequence ending in `bid complete`:

```
INF order detected         module=bidengine-service order=<order-id>
INF requesting reservation module=bidengine-order order=<order-id>
INF Reservation fulfilled  module=bidengine-order order=<order-id>
DBG submitting fulfillment module=bidengine-order order=<order-id> price=...
INF bid complete           module=bidengine-order order=<order-id>
```

If the provider's configured window is shorter than the order's required minimum, the chain rejects the bid with `reclamation window shorter than order minimum` and the daemon unwinds its reservation. If reclamation is not configured, the chain rejects with `order requires reclamation but bid does not offer it`. In both cases no bid lands on chain.

You can confirm a successful bid's reclamation window on chain:

```bash
akash query market bid get \
    --owner <tenant-address> \
    --dseq <dseq> --gseq 1 --oseq 1 \
    --provider <your-provider-address>
```

The `reclamation_window` field on the bid will reflect the configured value.

## Disabling reclamation

Set the env var to `0` (or unset it entirely) and restart the provider:

```bash
# Set to 0
kubectl -n akash-services set env statefulset/akash-provider \
    AKASH_RECLAMATION_WINDOW=0

# Or unset entirely
kubectl -n akash-services set env statefulset/akash-provider \
    AKASH_RECLAMATION_WINDOW-
```

The provider will resume default behavior: no reclamation offered on bids, and orders requiring reclamation will not be matched.

## Initiating reclamation

When you need to reclaim resources from an active lease, submit a `MsgLeaseStartReclaim` from the provider key:

```bash
provider-services tx market bid start-reclaim \
    --from <provider-key> \
    --owner <tenant-address> \
    --dseq <dseq> --gseq 1 --oseq 1 \
    --provider <your-provider-address> \
    --reason <reason-code> \
    --chain-id <chain-id> \
    --node <rpc-endpoint>
```

The `--reason` flag accepts a numeric code in the range 10000–19999:

- `10000` — unstable (workload or environment instability)
- `10001` — decommission (planned decommissioning)
- `10002` — unspecified (generic provider-initiated)
- `10003` — manifest_timeout (tenant did not send manifest)

Choose the code that most accurately reflects why you're reclaiming. The reason is recorded on the lease and emitted in the `EventLeaseReclaimStarted` event, giving tenants and indexers context for the reclamation.

After the reclamation window elapses, close the bid to terminate the lease:

```bash
provider-services tx market bid close \
    --from <provider-key> \
    --owner <tenant-address> \
    --dseq <dseq> --gseq 1 --oseq 1 \
    --provider <your-provider-address> \
    --reason <reason-code> \
    --chain-id <chain-id> \
    --node <rpc-endpoint>
```

Closing before the deadline is rejected by the chain with `reclamation window has not elapsed`.

## Pricing considerations

Holding capacity through a reclamation window is a real cost — during the grace period you cannot reclaim that capacity for a higher-paying tenant. Providers may want to price reclamation-required orders at a premium via the bid pricing script.

The bid pricing script does not currently expose `reclamation_window` as an input variable, so reclamation-aware pricing is not possible at this time. Until that input becomes available, the same script logic applies to all bids regardless of reclamation requirement.

## See also

- [SDL reclamation](/docs/developers/deployment/akash-sdl/advanced-features/#resource-reclamation) — tenant-facing documentation
- [AEP-82: Resource Reclamation](https://akash.network/roadmap/aep-82/) — protocol specification