---
categories: ["Providers", "Operations"]
tags: ["Gateway API", "NGINX Gateway Fabric", "Migration", "Networking", "Kubernetes"]
weight: 3
title: "Gateway API migration"
linkTitle: "Gateway API migration"
description: "Choose a migration path: from ingress-nginx to NGINX Gateway Fabric, with or without cert-manager already on the cluster"
---

**Replace ingress-nginx with NGINX Gateway Fabric and the akash-gateway chart on an existing cluster.**

This migration moves provider TCP from ingress-nginx to the Kubernetes Gateway API. HTTPS ends at `akash-gateway` (listeners `https-wildcard` and `https-custom`); you need NGF on port 443. New builds should use the [prep](/docs/providers/setup-and-installation/kubespray/provider-installation-prep) and [install](/docs/providers/setup-and-installation/kubespray/provider-installation) guides instead.

**Time:** Depends on path; budget about 30–60 minutes of hands-on work plus certificate wait time.

---

## Choose your path

- **[With cert-manager](/docs/providers/operations/gateway-api-migration/with-cert-manager)** - cert-manager and a ClusterIssuer are already installed; you still add **new** `Certificate` objects and TLS **Secrets in `akash-gateway`** (the chart does not use certs left in `ingress-nginx` or other namespaces by default). Same issuer, new namespace and secret names the chart expects.
- **[Without cert-manager](/docs/providers/operations/gateway-api-migration/without-cert-manager)** - You install cert-manager, a DNS-01 issuer, and TLS secrets using [prep STEP 9](/docs/providers/setup-and-installation/kubespray/provider-installation-prep#step-9---lets-encrypt-cert-manager-and-tls-secrets), then follow the same Gateway steps.

## Requirements (both)

Provider **v0.10.7** before **v0.11.0**, Helm 3, ingress-nginx on 8443/8444, host ports 80, 443, 8443, 8444, and 5002 free, and a public DNS zone. DNS-01 options are in [STEP 9 (TLS)](/docs/providers/setup-and-installation/kubespray/provider-installation-prep#step-9---lets-encrypt-cert-manager-and-tls-secrets) and the [cert-manager DNS-01 docs](https://cert-manager.io/docs/configuration/acme/dns01/).

---

## Related Resources

- [Gateway API migration (with cert-manager)](/docs/providers/operations/gateway-api-migration/with-cert-manager)
- [Gateway API migration (without cert-manager)](/docs/providers/operations/gateway-api-migration/without-cert-manager)
- [Provider installation (prep)](/docs/providers/setup-and-installation/kubespray/provider-installation-prep) — full stack prep including STEP 9 (TLS)
- [Provider installation (install)](/docs/providers/setup-and-installation/kubespray/provider-installation)
- [Updates & maintenance](/docs/providers/operations/updates-maintenance)
- [Provider verification](/docs/providers/operations/provider-verification)
