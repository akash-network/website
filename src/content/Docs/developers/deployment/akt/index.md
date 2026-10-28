---
categories: ["Developers", "Deployment"]
tags: ["akt", "CLI", "Deployment"]
weight: 0
title: "Deploy with akt"
linkTitle: "Deploy with akt"
description: "Deploy and manage Akash applications from the command line with akt, using your own keys or the Akash Console managed wallet"
---

**Deploy and manage applications from the command line with `akt`.**

`akt` runs the deployment lifecycle in one command: it creates the deployment, waits for bids, selects a provider, creates the lease and sends the manifest. It signs with your own keys, or routes through the Akash Console managed wallet so you need no local keys at all.

New to `akt`? [Install it](/docs/developers/akt/installation) and [create a context](/docs/developers/akt/configuration) first. The [akt CLI](/docs/developers/akt) section covers everything else the CLI does, including chain queries and transactions, network monitoring and AI agent tooling.

---

## In This Section

### [Deployments](/docs/developers/deployment/akt/deployments)

Author SDL files and run the full deployment lifecycle with `akt deploy`, `akt update`, and `akt close`.

### [Console Integration](/docs/developers/deployment/akt/console)

Deploy with the Akash Console managed wallet and account credits.

---

## Quick Start

```bash
# Generate an SDL, preview the plan, then deploy
akt sdl init web --image nginx:1.27 > deploy.yaml
akt deploy deploy.yaml --dry-run
akt deploy deploy.yaml
```

---

## Related Resources

- [akt CLI](/docs/developers/akt) - Installation, configuration and the full command set
- [SDL Reference](/docs/developers/deployment/akash-sdl) - Deployment configuration syntax
- [Commands Reference](/docs/developers/akt/commands-reference) - Every `akt` command group
