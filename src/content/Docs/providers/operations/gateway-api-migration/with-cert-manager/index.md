---
categories: ["Providers", "Operations"]
tags: ["Gateway API", "NGINX Gateway Fabric", "Migration", "Networking", "Kubernetes", "cert-manager"]
weight: 4
title: "Gateway API migration (with cert-manager)"
linkTitle: "With cert-manager"
description: "Migrate from ingress-nginx to NGINX Gateway Fabric and akash-gateway when cert-manager and a DNS-01 issuer are already in use"
---

**Migrate from ingress-nginx to NGINX Gateway Fabric and the [akash-gateway](https://github.com/akash-network/helm-charts/tree/main/charts/akash-gateway) chart.**

You already use cert-manager and a `ClusterIssuer` for Let’s Encrypt. For the wildcard, you mainly **recreate the same `Certificate` request** with three changes: **`metadata.namespace: akash-gateway`**, **`metadata.name: wildcard-ingress`**, and **`spec.secretName: wildcard-ingress-tls`** (chart defaults for `https-wildcard`). Keep your **DNS names** and **`issuerRef`** the same as before. Install the Gateway stack in the steps below, then apply that `Certificate` in [Re-bind TLS](#re-bind-tls-to-akash-gateway).

If cert-manager is not on the cluster yet, use the [without cert-manager](/docs/providers/operations/gateway-api-migration/without-cert-manager) path and [prep STEP 9](/docs/providers/setup-and-installation/kubespray/provider-installation-prep#step-9---lets-encrypt-cert-manager-and-tls-secrets) first. [Back to overview](/docs/providers/operations/gateway-api-migration).

**Time:** 30–45 minutes of work, plus time for certificates to become Ready.

---

## What you'll install

- Gateway API CRDs (standard + experimental, includes `TCPRoute`)
- NGINX Gateway Fabric with host ports 80, 443, 8443, 8444, 5002
- The `akash-gateway` Helm release (`Gateway`, `TCPRoute`s, HTTPS for deployers)
- TLS for the Gateway in the `akash-gateway` namespace (secret names and listeners are set in the [re-bind](#re-bind-tls-to-akash-gateway) section)

---

## Before you begin

- Provider on v0.11.2 before upgrading to v0.12.0
- `kubectl` and Helm 3
- `ingress-nginx` on TCP 8443 and 8444 today
- Host ports 80, 443, 8443, 8444, and 5002 available on your nodes
- cert-manager and a `ClusterIssuer`; plan to finish TLS in `akash-gateway` (not only in `ingress-nginx`)

---

## STEP 1: Install Gateway API CRDs

Install the standard Gateway API CRDs. These are required before deploying NGINX Gateway Fabric.

```bash
# Install NGINX Gateway Fabric CRDs (standard channel)
kubectl kustomize "https://github.com/nginx/nginx-gateway-fabric/config/crd/gateway-api/standard?ref=v2.4.2" | kubectl apply -f -
```

Then install the full experimental Gateway API bundle, which includes `TCPRoute` support:

```bash
# Install experimental Gateway API resources (includes TCPRoute)
kubectl apply -f https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.3.0/experimental-install.yaml
```

Verify the CRDs are installed:

```bash
kubectl get crd | grep gateway.networking.k8s.io
```

**Expected output:**

```
gatewayclasses.gateway.networking.k8s.io
gateways.gateway.networking.k8s.io
httproutes.gateway.networking.k8s.io
tcproutes.gateway.networking.k8s.io
...
```

---

## STEP 2: Install NGINX Gateway Fabric

On your control plane node, save the following as `/root/provider/values-nginx-gateway-fabric.yaml`:

```yaml
# values-nginx-gateway-fabric.yaml
nginxGateway:
  gatewayClassName: nginx

  gwAPIExperimentalFeatures:
    enable: true

  leaderElection:
    enable: true

  config:
    logging:
      level: info

  resources:
    requests:
      cpu: 100m
      memory: 128Mi
    limits:
      cpu: 500m
      memory: 256Mi

nginx:
  kind: daemonSet

  service:
    type: ClusterIP

  container:
    hostPorts:
      - port: 80
        containerPort: 80
      - port: 443
        containerPort: 443
      - port: 8443
        containerPort: 8443
      - port: 8444
        containerPort: 8444
      - port: 5002
        containerPort: 5002

    resources:
      requests:
        cpu: 100m
        memory: 128Mi
      limits:
        cpu: 1000m
        memory: 512Mi
```

**Note:** `gwAPIExperimentalFeatures.enable: true` is required for `TCPRoute` support. `nginx.kind: daemonSet` with `ClusterIP` service type means NGINX binds directly to host ports on each node rather than using a LoadBalancer. **Include port 443** so deployers can reach HTTPS on the Gateway without a second NGF upgrade.

**Firewall:** allow **443/tcp** in addition to your existing provider ports.

Install NGINX Gateway Fabric via Helm:

```bash
cd /root/provider

helm install ngf oci://ghcr.io/nginx/charts/nginx-gateway-fabric \
  --create-namespace \
  -n nginx-gateway \
  -f values-nginx-gateway-fabric.yaml
```

Verify the installation:

```bash
kubectl -n nginx-gateway get pods
```

**Expected output:**

```
NAME                                         READY   STATUS    RESTARTS   AGE
ngf-nginx-gateway-fabric-xxxxxxxxxx-xxxxx    2/2     Running   0          60s
```

---

## STEP 3: Install the Akash Gateway (Gateway + TCPRoutes)

The [akash-gateway](https://github.com/akash-network/helm-charts/tree/main/charts/akash-gateway) Helm chart creates the `Gateway` resource, `TCPRoute`s, and **HTTPS** listeners named **`https-wildcard`** and **`https-custom`**. It expects TLS Secrets **`wildcard-ingress-tls`** and **`akash-default-tls`** (defaults).

**New clusters:** the recommended order is to finish **cert-manager, ClusterIssuer, and both Secrets** in [Provider installation (prep) – STEP 9](/docs/providers/setup-and-installation/kubespray/provider-installation-prep#step-9---lets-encrypt-cert-manager-and-tls-secrets) **before** `helm install akash-gateway` (then continue with [Provider installation (install)](/docs/providers/setup-and-installation/kubespray/provider-installation)).

**In-place migration (this guide):** you will install the chart below, then follow [re-bind TLS to akash-gateway](#re-bind-tls-to-akash-gateway) to attach the same (or a new) Let’s Encrypt certificate to the new listeners. If you **do not** have cert-manager yet, stop and use [Gateway API migration (without cert-manager)](/docs/providers/operations/gateway-api-migration/without-cert-manager) instead.

Pass the same **`domain`** you use for the provider (for example with `-f /root/provider/provider.yaml`) so the wildcard host `*.ingress.<domain>` matches your DNS; only keys this chart uses are read from the file.

```bash
helm repo add akash https://akash-network.github.io/helm-charts
helm repo update akash

helm install akash-gateway akash/akash-gateway \
  -n akash-gateway \
  --create-namespace \
  -f /root/provider/provider.yaml
```

If you are not ready to use your full values file, set the domain explicitly:

```bash
helm install akash-gateway akash/akash-gateway -n akash-gateway --create-namespace --set "domain=yourdomain.com"
```

The chart enables TLS **listeners** by default, but the cluster must still have the **Secrets** in place, or clients will not get valid HTTPS. After this `helm install`, complete [re-bind TLS to akash-gateway](#re-bind-tls-to-akash-gateway).

### Verify

```bash
kubectl -n akash-gateway get gateway akash-gateway
kubectl -n akash-services get tcproutes
```

**Expected output:**

```
# Gateway
NAME             CLASS   ADDRESS   PROGRAMMED   AGE
akash-gateway    nginx             True         30s

# TCPRoutes
NAME                    AGE
akash-provider-8443     15s
akash-provider-8444     15s
```

<a id="re-bind-tls-to-akash-gateway"></a>

### Re-bind TLS to akash-gateway

If [STEP 2](#step-2-install-nginx-gateway-fabric) already opens port 443 on NGF, you do not need another NGF upgrade. Keep **443/tcp** open on the firewall.

#### Wildcard cert (https-wildcard)

Point the wildcard `Certificate` at the Gateway by setting:

| Field | Value |
|-------|--------|
| `metadata.namespace` | `akash-gateway` |
| `metadata.name` | `wildcard-ingress` |
| `spec.secretName` | `wildcard-ingress-tls` |

Copy **`spec.dnsNames`** (and **`spec.commonName`** if you use it) and **`spec.issuerRef`** from your existing ingress-nginx `Certificate`; only the namespace, resource name, and secret name change. Then apply:

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

**Note:** After cutover, delete the old `Certificate` in `ingress-nginx` if you no longer need it, so you are not renewing the same hostnames twice.

#### Default listener secret (https-custom)

If you do not have a real cert for the custom listener yet, a self-signed placeholder is enough until you replace it:

```bash
openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
  -keyout /tmp/default.key -out /tmp/default.crt -subj "/CN=default"

kubectl create secret tls akash-default-tls \
  --cert=/tmp/default.crt --key=/tmp/default.key -n akash-gateway
```

#### Wait for the Certificate

Usually one to two minutes until Ready:

```bash
kubectl -n akash-gateway get certificate
kubectl -n akash-gateway describe certificate wildcard-ingress
```

#### Helm: same domain as the provider

```bash
cd /root/provider
helm upgrade --install akash-gateway akash/akash-gateway -n akash-gateway -f provider.yaml
```

#### Check listeners and HTTPS

```bash
kubectl -n akash-gateway get gateway akash-gateway -o yaml \
  | grep -E "name: (https-wildcard|https-custom)" -A 20
```

```bash
# Replace host with a tenant name under your domain
echo "" | openssl s_client -connect test.ingress.yourdomain.com:443 -showcerts 2>&1 \
  | openssl x509 -issuer -subject -dates -noout -text \
  | grep -E "(Issuer:|Subject:|Not Before:|Not After :|DNS:)"
```

If NGF does not pick up the new cert, restart its data plane:

```bash
kubectl -n nginx-gateway rollout restart deployment \
  -l app.kubernetes.io/name=nginx-gateway-fabric
```

For another pass on verification, use the [end-to-end HTTPS test in prep](/docs/providers/setup-and-installation/kubespray/provider-installation-prep#end-to-end-https-test-after-helm-install-akash-gateway). DNS-01 and issuer setup details: [STEP 9 (TLS) in prep](/docs/providers/setup-and-installation/kubespray/provider-installation-prep#step-9---lets-encrypt-cert-manager-and-tls-secrets) and the [cert-manager DNS-01 docs](https://cert-manager.io/docs/configuration/acme/dns01/).

---

## STEP 4: Upgrade Provider to v0.12.0

With the Gateway resources in place, upgrade the Akash provider Helm charts to v0.12.0.

### Update Helm Repo

```bash
helm repo update akash
```

Verify the expected chart versions are available:

```bash
helm search repo akash
```

**Expected output:**

```
NAME                              CHART VERSION    APP VERSION
akash/akash-hostname-operator     16.0.0           0.12.0
akash/akash-inventory-operator    16.0.0           0.12.0
akash/akash-ip-operator           16.0.0           0.12.0
akash/akash-node                  17.1.1           2.0.1
akash/provider                    16.0.0           0.12.0
```

### Backup Current Chart Values

```bash
cd /root/provider
for i in $(helm list -n akash-services -q | grep -vw akash-node); do helm -n akash-services get values $i > ${i}.pre-v0.12.0.values; done
```

### Upgrade Operators

```bash
helm -n akash-services upgrade akash-hostname-operator akash/akash-hostname-operator
helm -n akash-services upgrade inventory-operator akash/akash-inventory-operator
```

**With persistent storage** (adjust storage class to match your setup):

```bash
helm -n akash-services upgrade inventory-operator akash/akash-inventory-operator \
  --set inventoryConfig.cluster_storage[0]=default \
  --set inventoryConfig.cluster_storage[1]=beta3 \
  --set inventoryConfig.cluster_storage[2]=ram
```

**With IP leasing (MetalLB):**

```bash
helm -n akash-services upgrade akash-ip-operator akash/akash-ip-operator
```

### Upgrade Provider

```bash
cd /root/provider

helm upgrade akash-provider akash/provider \
  -n akash-services \
  -f provider.yaml \
  --set bidpricescript="$(cat price_script_generic.sh | openssl base64 -A)"
```

### Verify Pod Versions

Allow a minute or two for Kubernetes to apply the changes, then confirm all pods are running v0.12.0:

```bash
kubectl -n akash-services get pods -o custom-columns='NAME:.metadata.name,IMAGE:.spec.containers[*].image'
```

All provider, hostname-operator, and inventory-operator images should reference `0.12.0`.

---

## STEP 5: Uninstall ingress-nginx

With the provider upgraded and NGINX Gateway Fabric handling all traffic on ports 80, **443**, 8443, 8444, and 5002, ingress-nginx is no longer needed and can be removed.

```bash
helm uninstall ingress-nginx -n ingress-nginx
```

Verify all ingress-nginx resources are removed:

```bash
kubectl -n ingress-nginx get pods
```

**Expected output:**

```
No resources found in ingress-nginx namespace.
```

---

## Verification

### Check Provider Endpoints

Verify that the provider endpoints are accessible through the new gateway:

```bash
# Replace provider.example.com with your provider domain
curl -k https://provider.example.com:8443/status
```

### Verify TCPRoute Status

```bash
kubectl -n akash-services describe tcproute akash-provider-8443
kubectl -n akash-services describe tcproute akash-provider-8444
```

Look for `ResolvedRefs` and `Accepted` conditions showing `True` in the output.

### Check NGINX Gateway Fabric Logs

```bash
kubectl -n nginx-gateway logs -l app.kubernetes.io/name=nginx-gateway-fabric -c nginx-gateway
```

### Verify No Port Conflicts

Confirm no two processes are bound to the same host ports:

```bash
# Run on each node in your cluster
ss -tlnp | grep -E ':(80|443|8443|8444|5002)\s'
```

Each port should appear only once, owned by the NGINX Gateway Fabric process.

---

## Troubleshooting

### Issue: Gateway Shows `Programmed: False`

**Symptoms:**
- `kubectl get gateway akash-gateway` shows `PROGRAMMED: False`
- TCPRoutes remain unresolved

**Diagnosis:**

```bash
kubectl -n akash-gateway describe gateway akash-gateway
```

**Solution:**

Verify NGINX Gateway Fabric pods are running and the `GatewayClass` was registered:

```bash
kubectl -n nginx-gateway get pods
kubectl get gatewayclass nginx
```

If the `GatewayClass` is missing, the Helm install may have failed. Re-run the Helm install from Step 2.

---

### Issue: TCPRoute `ResolvedRefs` is `False`

**Symptoms:**
- `kubectl describe tcproute akash-provider-8443` shows backend not found

**Diagnosis:**

```bash
kubectl -n akash-services get service akash-provider
```

**Solution:**

Confirm the `akash-provider` service exists in the `akash-services` namespace and exposes the expected ports:

```bash
kubectl -n akash-services get service akash-provider -o yaml | grep -A 20 ports
```

The service must have ports 8443 and 8444 defined.

---

### Issue: Port Conflict on Node

**Symptoms:**
- NGINX Gateway Fabric pods fail to start or crash-loop
- Error in pod logs: `bind: address already in use`

**Solution:**

Check which process holds the port on the affected node:

```bash
ss -tlnp | grep -E ':(80|443|8443|8444|5002)\s'
```

If ingress-nginx still holds the ports, ensure it was fully uninstalled in Step 5:

```bash
helm list -n ingress-nginx
```

If the release still exists, uninstall it:

```bash
helm uninstall ingress-nginx -n ingress-nginx
```

---

## Related Resources

- [Gateway API migration overview](/docs/providers/operations/gateway-api-migration) — pick **with** vs **without** cert-manager
- [Gateway API migration (without cert-manager)](/docs/providers/operations/gateway-api-migration/without-cert-manager) — if you need to install cert-manager first
- [Provider installation (prep)](/docs/providers/setup-and-installation/kubespray/provider-installation-prep) — `provider.yaml`, DNS, NGF, and **STEP 9** (Let’s Encrypt, Secrets)
- [Provider installation (install)](/docs/providers/setup-and-installation/kubespray/provider-installation) — `helm install` for `akash-gateway`, operators, and `akash/provider`
- [Provider installation (prep) – STEP 9 (TLS)](/docs/providers/setup-and-installation/kubespray/provider-installation-prep#step-9---lets-encrypt-cert-manager-and-tls-secrets) — cert-manager, `wildcard-ingress-tls` / `akash-default-tls`, troubleshooting
- [Updates & Maintenance](/docs/providers/operations/updates-maintenance)
- [Provider Verification](/docs/providers/operations/provider-verification)
- [NGINX Gateway Fabric](https://docs.nginx.com/nginx-gateway-fabric/)
- [Kubernetes Gateway API](https://gateway-api.sigs.k8s.io/)

---

