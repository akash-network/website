---
categories: ["For Providers"]
tags: ["Operations", "Management"]
weight: 3
title: "Operations"
linkTitle: "Operations"
description: "Day-to-day provider management and operations"
---

**Day-to-day operational tasks for running an Akash provider.**

Once your provider is running, these guides help you manage leases, monitor health, perform maintenance, and troubleshoot issues.

---

## Operational Areas

### [Lease Management](/docs/for-providers/operations/lease-management)

**Manage the lifecycle of deployments on your provider**

**Covers:**
- List active leases (on-chain and Kubernetes)
- Close leases from provider side
- Retrieve deployment manifests
- Track earnings (total, daily, monthly)
- Handle dangling deployments
- Block specific container images

**Use when:** Managing active deployments, tracking revenue, or troubleshooting lease issues.

---

### [Monitoring](/docs/for-providers/operations/monitoring)

**Monitor provider health and troubleshoot issues**

**Covers:**
- View and filter provider logs
- Check provider status and resource utilization
- GPU troubleshooting (drivers, Device Plugin, Fabric Manager)
- Verify NVIDIA components
- Diagnose bidding issues

**Use when:** Checking provider health, investigating why bids aren't happening, or troubleshooting GPU problems.

---

### [Updates & Maintenance](/docs/for-providers/operations/updates-maintenance)

**Keep your provider updated and well-maintained**

**Covers:**
- Stop/start provider services safely
- Rotate Kubernetes and etcd certificates
- Handle stuck ReplicaSets
- Kill zombie processes
- Heal broken deployment replicas
- Maintenance best practices

**Use when:** Performing scheduled maintenance, rotating certificates, or fixing cluster issues.

---

### [Provider Attributes](/docs/for-providers/operations/provider-attributes)

**Configure provider capabilities and hardware discovery**

**Covers:**
- Submit GPU details for feature discovery
- Configure GPU attributes in `provider.yaml`
- Verify attribute registration
- Troubleshoot GPU detection issues

**Use when:** Adding new GPU models, configuring provider capabilities, or fixing attribute mismatches.

---

### [Provider Verification](/docs/for-providers/operations/provider-verification)

**Verify your provider is running correctly**

**Covers:**
- Provider pod health checks
- On-chain registration verification
- Bid activity monitoring
- Common troubleshooting steps
- Verification checklist

**Use when:** After installation, when debugging issues, or performing routine health checks.

---

## Common Tasks

**Daily:**
- Monitor provider logs for errors
- Check active leases and utilization
- Verify bid activity

**Weekly:**
- Review certificate expiration dates
- Check system resource usage
- Verify backups

**Monthly:**
- Update provider services if needed
- Review and optimize bid pricing
- Rotate Kubernetes certificates (check expiration)

---

**Questions?** Join [#provider-support on Discord](https://discord.com/channels/747885925232672829/1067866274432274442)

