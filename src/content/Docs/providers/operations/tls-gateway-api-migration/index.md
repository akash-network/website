---
categories: ["Providers", "Operations"]
tags: ["TLS", "Gateway API", "Migration", "Certificates", "Let's Encrypt"]
weight: 4
title: "TLS Migration to Gateway API"
linkTitle: "TLS Migration to Gateway API"
description: "Restore TLS/HTTPS for deployment hostnames after migrating from ingress-nginx to the Gateway API stack"
---

If you completed the [Gateway API migration](/docs/providers/operations/gateway-api-migration) and previously had a working TLS setup with ingress-nginx (cert-manager + Let's Encrypt wildcard for `*.ingress.<yourdomain>`), this guide restores HTTPS on the new stack. Your existing cert-manager and ClusterIssuer are unchanged; you create a new Certificate in the **akash-gateway** namespace and enable TLS on the Gateway.

**Prerequisites:**

- [Gateway API migration](/docs/providers/operations/gateway-api-migration) completed (NGF + akash-gateway in place, ingress-nginx removed)
- cert-manager and your ClusterIssuer (e.g. `letsencrypt-prod`) still installed
- DNS API secret (e.g. Cloudflare or GCP) still in the `cert-manager` namespace

**Time:** about 10 minutes

---

## STEP 1 - Expose Port 443 on NGINX Gateway Fabric

Add host port 443 to your NGF configuration so the Gateway can serve HTTPS.

Edit `/root/provider/values-nginx-gateway-fabric.yaml` and add 443 to the `hostPorts` list under `nginx.container`:

```yaml
container:
  hostPorts:
    - port: 80
      containerPort: 80
    - port: 8443
      containerPort: 8443
    - port: 8444
      containerPort: 8444
    - port: 5002
      containerPort: 5002
    - port: 443
      containerPort: 443
```

Upgrade NGF:

```bash
cd /root/provider
helm upgrade ngf oci://ghcr.io/nginx/charts/nginx-gateway-fabric -n nginx-gateway -f values-nginx-gateway-fabric.yaml
```

Ensure firewall allows inbound **443/tcp**.

---

## STEP 2 - Create Wildcard Certificate in akash-gateway Namespace

The old Certificate lived in the `ingress-nginx` namespace, which is gone. Create a new Certificate in **akash-gateway** using your existing ClusterIssuer (same domain and DNS-01 setup). Replace `yourdomain.com` with your actual domain and `letsencrypt-prod` with your ClusterIssuer name if different:

```bash
cat > wildcard-cert.yaml << 'EOF'
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: wildcard-yourdomain-com
  namespace: akash-gateway
spec:
  secretName: wildcard-yourdomain-com-tls
  issuerRef:
    name: letsencrypt-prod
    kind: ClusterIssuer
  commonName: '*.yourdomain.com'
  dnsNames:
  - '*.yourdomain.com'
  - '*.ingress.yourdomain.com'
EOF

kubectl apply -f wildcard-cert.yaml
```

Wait for the certificate to be ready:

```bash
kubectl -n akash-gateway get certificate
kubectl -n akash-gateway describe certificate wildcard-yourdomain-com
```

Ensure status shows `Ready: True` (usually 1–2 minutes).

---

## STEP 3 - Enable HTTPS on the Gateway

Turn on the Gateway’s HTTPS listener with the chart’s single-flag TLS option. The chart expects a Secret named `wildcard-<domain-with-dashes>-tls` (e.g. `example.com` → `wildcard-example-com-tls`), which matches the Certificate from STEP 2. Replace `yourdomain.com` with your domain:

```bash
helm upgrade akash-gateway akash/akash-gateway -n akash-gateway --set "gateway.https.domain=yourdomain.com"
```

Use the same Helm repo you used for the Gateway API migration (e.g. `akash-dev` instead of `akash` if applicable). Re-run this `helm upgrade` with the same `--set` whenever you upgrade the chart so TLS stays enabled.

Verify the HTTPS listener is present:

```bash
kubectl -n akash-gateway get gateway akash-gateway -o yaml | grep -A 20 "name: https"
```

---

## STEP 4 - Verify HTTPS

Test the wildcard certificate (replace with your domain):

```bash
echo "" | openssl s_client -connect test.ingress.yourdomain.com:443 -showcerts 2>&1 | \
  openssl x509 -issuer -subject -dates -noout -text | \
  grep -E '(Issuer:|Subject:|Not Before:|Not After :|DNS:)'
```

You should see Let's Encrypt as issuer and your wildcard in the subject/DNS. If the certificate is not picked up, restart the NGF data plane:

```bash
kubectl -n nginx-gateway rollout restart deployment -l app.kubernetes.io/name=nginx-gateway-fabric
```

---

## Related Resources

- [Gateway API Migration](/docs/providers/operations/gateway-api-migration)
- [TLS/SSL Certificates](/docs/providers/setup-and-installation/kubespray/tls-certificates) – full TLS guide (cert-manager install, DNS provider, troubleshooting)
