---
categories: ["Providers", "Operations"]
tags: ["Gateway API", "NGINX Gateway Fabric", "cert-manager", "TLS", "Migration", "Kubernetes"]
weight: 4
title: "TLS migration to Gateway API"
linkTitle: "TLS migration to Gateway API"
description: "Move Let’s Encrypt and TLS secrets from ingress-nginx into the akash-gateway namespace for NGINX Gateway Fabric"
---

Use this guide when you **already run cert-manager** and certificates for the old stack (for example in `ingress-nginx`), and you need the **`wildcard-ingress-tls`** and **`akash-default-tls`** Secrets in **`akash-gateway`** for the [akash-gateway](https://github.com/akash-network/helm-charts/tree/main/charts/akash-gateway) chart.

If you are **installing cert-manager for the first time**, do that in [Provider installation (prep) – STEP 9](/docs/providers/setup-and-installation/kubespray/provider-installation-prep#step-9---lets-encrypt-cert-manager-and-tls-secrets) (after [STEP 8](/docs/providers/setup-and-installation/kubespray/provider-installation-prep#step-8---install-gateway-api-and-nginx-gateway-fabric) if you are following the full prep doc in order), then continue with [Gateway API migration](/docs/providers/operations/gateway-api-migration).

---

<a id="re-bind-tls-to-akash-gateway"></a>

## Re-bind TLS to `akash-gateway`

If NGINX Gateway Fabric already exposes port 443, you do not need another NGF upgrade. Keep **443/tcp** open on the firewall.

### 1. Remove old Let’s Encrypt resources

From the **previous** install (commonly the `ingress-nginx` namespace or wherever the old stack stored certs), **delete** any `Certificate` that was issuing the provider or ingress hostnames, so cert-manager is not renewing the same names in two places:

```bash
kubectl get certificate -A
```

Delete the old resources (for example, `kubectl delete certificate <name> -n ingress-nginx`). Delete the old TLS `Secret` if you no longer need it and you want a clean handoff; cert-manager will create new Secrets when the new `Certificate` resources become Ready.

### 2. Wildcard cert (`https-wildcard`) in `akash-gateway`

The chart’s **`https-wildcard`** listener expects a TLS Secret named **`wildcard-ingress-tls`**, from a `Certificate` named **`wildcard-ingress`** in **`akash-gateway`**. Create that using your real domain, DNS names, and `ClusterIssuer` (see [prep STEP 9 (TLS)](/docs/providers/setup-and-installation/kubespray/provider-installation-prep#step-9---lets-encrypt-cert-manager-and-tls-secrets) for DNS-01 and issuer setup).

```yaml
# /root/provider/wildcard-ingress-tls.yaml
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: wildcard-ingress
  namespace: akash-gateway
spec:
  secretName: wildcard-ingress-tls
  issuerRef:
    name: letsencrypt-prod
    kind: ClusterIssuer
  commonName: "*.yourdomain.com"
  dnsNames:
    - "*.yourdomain.com"
    - "*.ingress.yourdomain.com"
```

```bash
kubectl apply -f /root/provider/wildcard-ingress-tls.yaml
```

Adjust `issuerRef.name` and `dnsNames` to match your environment.

### Default listener secret (`https-custom`)

If you do not have a real cert for the custom listener yet, a self-signed placeholder is enough until you replace it:

```bash
openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
  -keyout /tmp/default.key -out /tmp/default.crt -subj "/CN=default"

kubectl create secret tls akash-default-tls \
  --cert=/tmp/default.crt --key=/tmp/default.key -n akash-gateway
```

### Wait for the Certificate

Usually one to two minutes until Ready:

```bash
kubectl -n akash-gateway get certificate
kubectl -n akash-gateway describe certificate wildcard-ingress
```

### Match `akash-gateway` to your domain

If you change values after the first install:

```bash
cd /root/provider
helm upgrade --install akash-gateway akash/akash-gateway -n akash-gateway -f provider.yaml
```

### Check listeners and HTTPS

```bash
kubectl -n akash-gateway get gateway akash-gateway -o yaml \
  | grep -E "name: (https-wildcard|https-custom)" -A 20
```

```bash
# Replace `yourdomain.com` and use a tenant hostname under your domain
echo "" | openssl s_client -connect test.ingress.yourdomain.com:443 -showcerts 2>&1 \
  | openssl x509 -issuer -subject -dates -noout -text \
  | grep -E "(Issuer:|Subject:|Not Before:|Not After :|DNS:)"
```

If NGF does not pick up the new cert, restart its data plane:

```bash
kubectl -n nginx-gateway rollout restart deployment \
  -l app.kubernetes.io/name=nginx-gateway-fabric
```

For another pass on verification, use the [end-to-end HTTPS test in prep](/docs/providers/setup-and-installation/kubespray/provider-installation-prep#end-to-end-https-test-after-helm-install-akash-gateway). DNS-01 and issuer details: [STEP 9 (TLS) in prep](/docs/providers/setup-and-installation/kubespray/provider-installation-prep#step-9---lets-encrypt-cert-manager-and-tls-secrets) and the [cert-manager DNS-01 documentation](https://cert-manager.io/docs/configuration/acme/dns01/).

---

## Related

- [Gateway API migration](/docs/providers/operations/gateway-api-migration) — NGF, `akash-gateway`, and provider upgrade
- [Provider installation (prep) – STEP 9 (TLS)](/docs/providers/setup-and-installation/kubespray/provider-installation-prep#step-9---lets-encrypt-cert-manager-and-tls-secrets)
- [Provider installation (install)](/docs/providers/setup-and-installation/kubespray/provider-installation)
