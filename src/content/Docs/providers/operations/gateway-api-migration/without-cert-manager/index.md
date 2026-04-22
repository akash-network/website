---
categories: ["Providers", "Operations"]
tags: ["Gateway API", "NGINX Gateway Fabric", "Migration", "cert-manager", "Kubernetes"]
weight: 5
title: "Gateway API migration (without cert-manager)"
linkTitle: "Without cert-manager"
description: "Migrate to NGINX Gateway Fabric and akash-gateway after installing cert-manager, a DNS-01 issuer, and TLS secrets"
---

[Overview](/docs/providers/operations/gateway-api-migration) · [With cert-manager](/docs/providers/operations/gateway-api-migration/with-cert-manager)

**Install cert-manager and a working DNS-01 issuer, then migrate from ingress-nginx to NGINX Gateway Fabric and `akash-gateway` the same way as the [with-cert-manager](/docs/providers/operations/gateway-api-migration/with-cert-manager) guide.**

This path is for clusters that do not yet have cert-manager issuing certificates for the provider. You will complete TLS setup in [prep STEP 9](/docs/providers/setup-and-installation/kubespray/provider-installation-prep#step-9---lets-encrypt-cert-manager-and-tls-secrets) (Helm install, ClusterIssuer, DNS credentials, and Certificates into `akash-gateway` for `wildcard-ingress-tls` and `akash-default-tls` where the prep doc specifies). When cert-manager is issuing in that namespace, continue with the [with-cert-manager](/docs/providers/operations/gateway-api-migration/with-cert-manager) guide from [STEP 1: Install Gateway API CRDs](/docs/providers/operations/gateway-api-migration/with-cert-manager#step-1-install-gateway-api-crds).

**Time:** 1–2 hours the first time (cert-manager, DNS, and Let’s Encrypt), then the same 30–45 minutes as the with-cert-manager guide.

---

## What you’ll do first (TLS stack)

In [Provider installation (prep) – STEP 9](/docs/providers/setup-and-installation/kubespray/provider-installation-prep#step-9---lets-encrypt-cert-manager-and-tls-secrets), you’ll install and configure:

- **cert-manager** - ACME client and `Certificate` resources
- **ClusterIssuer** - Let’s Encrypt with DNS-01 (Cloudflare, Google, or [another supported DNS](https://cert-manager.io/docs/configuration/acme/dns01/))
- **Secrets in `akash-gateway`** - At least `wildcard-ingress-tls` and `akash-default-tls` as required for `akash-gateway`

Stop when your `Certificate` objects show Ready and the Gateway stack can be installed.

## Then: Gateway migration

Open [Gateway API migration (with cert-manager)](/docs/providers/operations/gateway-api-migration/with-cert-manager) and run it from the top. Skip re-explaining your issuer in [re-bind TLS](/docs/providers/operations/gateway-api-migration/with-cert-manager#re-bind-tls-to-akash-gateway) if STEP 9 already created the right Secrets; otherwise adjust the Certificate manifests there to match your issuer.

## Requirements

Same as the [overview](/docs/providers/operations/gateway-api-migration#requirements-both): provider **v0.10.7** before **v0.11.0**, Helm 3, ingress-nginx on 8443/8444, host ports 80, 443, 8443, 8444, 5002, and a DNS zone you control.

---

## Related Resources

- [Gateway API migration overview](/docs/providers/operations/gateway-api-migration)
- [Gateway API migration (with cert-manager)](/docs/providers/operations/gateway-api-migration/with-cert-manager) — run after TLS in STEP 9
- [Provider installation (prep) – STEP 9 (TLS)](/docs/providers/setup-and-installation/kubespray/provider-installation-prep#step-9---lets-encrypt-cert-manager-and-tls-secrets)
- [Provider installation (prep)](/docs/providers/setup-and-installation/kubespray/provider-installation-prep)
- [Provider installation (install)](/docs/providers/setup-and-installation/kubespray/provider-installation)
- [Updates & maintenance](/docs/providers/operations/updates-maintenance)
