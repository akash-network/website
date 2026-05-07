---
categories: ["Developers", "Deployment", "Akash Console"]
tags: ["Console", "Logs", "Log Forwarding", "Datadog", "Observability", "Monitoring"]
weight: 3
title: "Log Forwarding"
linkTitle: "Log Forwarding"
description: "Forward container logs and Kubernetes events from your Akash deployment to Datadog using the Console SDL builder"
---

**Stream container logs and Kubernetes events from your Akash deployment to an external monitoring service.**

When you enable log forwarding for a service, Akash Console adds a sidecar collector to your manifest that captures the service's container logs and pod-level Kubernetes events, then forwards them to your monitoring provider. Datadog is currently the only supported destination; more providers will follow.

---

## How It Works

Enabling log forwarding adds a second service to your deployment alongside the one you're configuring. That sidecar runs the [`ghcr.io/akash-network/log-collector`](https://github.com/akash-network/console/tree/main/apps/log-collector) image and:

- Discovers pods belonging to the target service via a Kubernetes label selector
- Tails each pod's container stdout/stderr
- Watches Kubernetes events for the same pods (scheduling, image pulls, OOM kills, container lifecycle)
- Ships everything to your provider through Fluent Bit

The collector is wired up automatically — Console sets the label selector, image, and destination environment variables for you.

---

## Enabling Log Forwarding

1. Open the **SDL Builder** in [Akash Console](https://console.akash.network) and select or create a deployment.
2. Expand the service you want to monitor.
3. Scroll to the **Log Forwarding** section and check **Enable log forwarding for this service**.
4. A new card appears with two sub-sections:
   - **Log Provider Info** — choose your destination (Datadog) and enter its credentials.
   - **Resources** — adjust CPU, memory, and ephemeral storage for the collector sidecar. The defaults (0.1 CPU, 256 Mi RAM, 512 Mi storage) are sufficient for most workloads.

Toggling the checkbox off removes the sidecar service from the manifest.

---

## Datadog Configuration

The Datadog provider needs two values:

| Field          | SDL env var   | Description                                                                   | Example         |
| -------------- | ------------- | ----------------------------------------------------------------------------- | --------------- |
| Regional URL   | `DD_SITE`     | Your Datadog site (regional endpoint).                                        | `datadoghq.eu`  |
| Provider API   | `DD_API_KEY`  | A Datadog [API key](https://docs.datadoghq.com/account_management/api-app-keys/) with log ingestion permissions. | `xxxxxxxx...`   |

Logs arrive in Datadog tagged with `source: akash.network`. Pod metadata (namespace, pod name, container) is preserved on each line so you can filter by service and replica.

---

## What Gets Added to Your SDL

For a service named `web`, Console appends a sidecar named `web-log-collector` that mirrors the target service's placement profile. The generated SDL fragment looks like:

```yaml
services:
  web-log-collector:
    image: ghcr.io/akash-network/log-collector:2.20.1
    env:
      - PROVIDER=DATADOG
      - POD_LABEL_SELECTOR=akash.network/manifest-service=web
      - DD_API_KEY=<your-key>
      - DD_SITE=datadoghq.eu

profiles:
  compute:
    web-log-collector:
      resources:
        cpu:
          units: 0.1
        memory:
          size: 256Mi
        storage:
          - size: 512Mi
            attributes:
              persistent: true
```

Console keeps the sidecar's title and placement in sync with the target service, so renaming or moving the service automatically updates the collector. You can review the full manifest on the **Review** step before deploying.

---

## Resource Sizing

The defaults work for most services. Tune them when:

- **High log volume** — bump CPU to `0.25`+ and memory to `512 Mi`+ for chatty applications (debug logging, request tracing).
- **Multi-replica services** — the collector handles all replicas of the target service; scale memory linearly with replica count if you run many pods per service.
- **Burst tolerance** — increase ephemeral storage if you expect traffic spikes; the collector buffers to disk before forwarding.

---

## Verifying Logs Arrive

After deployment:

1. Confirm both services show as **active** in the deployment dashboard.
2. Open the **Logs** tab on the collector service to see Fluent Bit's startup output. A successful run prints the configured outputs and `started successfully`.
3. In Datadog, open **Logs > Live Tail** and filter by `source:akash.network`. You should see entries from your service within a few seconds.

If logs don't show up, check that:

- The Datadog API key is valid and has log-ingestion scope
- `DD_SITE` matches your Datadog account region (`datadoghq.com`, `datadoghq.eu`, `us3.datadoghq.com`, etc.)
- The collector sidecar is in the same placement group as the target service

---

## Manual SDL Configuration

If you build manifests outside Console (CLI, automation), you can add the same sidecar by hand. See [SDL Advanced Features → Log Forwarding](/docs/developers/deployment/akash-sdl/advanced-features#log-forwarding) for the manual pattern.

---

## Related Resources

- **[Akash Console](/docs/developers/deployment/akash-console)** — Web interface overview
- **[SDL Advanced Features](/docs/developers/deployment/akash-sdl/advanced-features)** — Manual SDL patterns including log forwarding
- **[Datadog Log Management](https://docs.datadoghq.com/logs/)** — Datadog documentation