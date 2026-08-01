---
categories: ["Developers", "Deployment", "akt CLI"]
tags: ["akt", "CLI", "Monitoring", "Network", "Validators"]
weight: 6
title: "Network Monitor"
linkTitle: "Monitor"
description: "Watch Akash consensus, provider fleet health, and Oracle/BME state in real time with akt monitor"
---

**Watch network state, provider fleet health, and Oracle/BME state in real time.**

`akt monitor` is a hub-based monitoring tool with three dashboards. It connects directly to an RPC endpoint via WebSocket for real-time vote streaming, which makes it useful during coordinated chain upgrades when online block explorers become unreliable.

No keyring or default account is needed, just an RPC endpoint.

---

## Launch

```bash
# Launch hub (defaults to the Network dashboard)
akt monitor

# Connect to a specific RPC endpoint
akt monitor https://rpc.akashnet.net:443

# Launch directly into a specific dashboard
akt monitor network
akt monitor provider
akt monitor oracle
akt monitor bme

# Or via flag
akt monitor --rpc https://rpc.akashnet.net:443

# Skip TLS verification
akt monitor --insecure

# Clear cache and start fresh
akt monitor --clean-cache
```

---

## Dashboards

### Network

The default dashboard shows consensus state, validator voting, governance proposals, and governance parameters.

Sub-tabs:

- `1` **Overview** - Dual progress bar and block history
- `2` **Validators** - Per-validator signing history
- `3` **Governance** - Recent and active proposals, deadlines, status, and vote tallies
- `4` **Parameters** - Module-by-module governance parameters

The Governance tab includes recent completed proposals even when no vote is active. Voting-period proposals show the current tally; completed proposals show the final tally. Use `j` and `k` to scroll and `r` to refresh.

### Provider

Provider fleet health, version distribution, and per-provider resource utilization.

### Oracle/BME

Oracle aggregated prices plus BME vault state, mint status, and ledger.

---

## Navigation

- `Tab` / `Shift-Tab` - Cycle between the Network, Provider, and Oracle/BME dashboards
- `1` / `2` / `3` / `4` - Switch sub-tabs within the Network dashboard
- `q` / `Ctrl-C` - Save monitor cache state and quit

---

## Related Resources

- [Contexts & Configuration](/docs/developers/deployment/akt/configuration) - Where the default RPC endpoint comes from
- [Commands Reference](/docs/developers/deployment/akt/commands-reference) - Complete `akt` command reference
