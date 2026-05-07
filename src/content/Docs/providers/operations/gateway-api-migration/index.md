---
categories: ["Providers", "Operations"]
tags: ["Gateway API", "NGINX Gateway Fabric", "Migration", "Networking", "Kubernetes", "cert-manager"]
weight: 3
title: "Gateway API migration"
linkTitle: "Gateway API migration"
description: "Migrate from ingress-nginx to NGINX Gateway Fabric and akash-gateway (TLS required in akash-gateway)"
---

**Migrate from ingress-nginx to NGINX Gateway Fabric and the [akash-gateway](https://github.com/akash-network/helm-charts/tree/main/charts/akash-gateway) chart.** For a **new** cluster, use [Provider installation (prep)](/docs/providers/setup-and-installation/kubespray/provider-installation-prep) and [Provider installation (install)](/docs/providers/setup-and-installation/kubespray/provider-installation) end-to-end instead.

**Time:** About 30–45 minutes of hands-on work, plus certificate wait time.

---

## Prerequisites

You need **working TLS for the Gateway** in namespace **`akash-gateway`**: TLS Secrets **`wildcard-ingress-tls`** and **`akash-default-tls`** (chart defaults for listeners **`https-wildcard`** and **`https-custom`**), and `Certificate` resources in **`Ready`** state where you use Let’s Encrypt. You may use a self-signed placeholder for **`akash-default-tls`** as in [prep STEP 9](/docs/providers/setup-and-installation/kubespray/provider-installation-prep#step-9---lets-encrypt-cert-manager-and-tls-secrets) until you replace it.

**Check your cluster:**

```bash
kubectl -n akash-gateway get certificate,secret
kubectl -n akash-gateway describe certificate wildcard-ingress
```

**If you are not there yet**

- **New cert-manager / first-time Let’s Encrypt for the provider** — Complete [Provider installation (prep) – STEP 9](/docs/providers/setup-and-installation/kubespray/provider-installation-prep#step-9---lets-encrypt-cert-manager-and-tls-secrets). The [Provider installation (install)](/docs/providers/setup-and-installation/kubespray/provider-installation) document does not install cert-manager. If you are following the **full** prep doc in order, do [STEP 8 (Gateway API and NGF)](/docs/providers/setup-and-installation/kubespray/provider-installation-prep#step-8---install-gateway-api-and-nginx-gateway-fabric) before STEP 9 so NGF and port **443** match what the Gateway stack needs, **or** install NGF only once: skip duplicate NGF work between prep and this guide’s [STEP 2](#step-2-install-nginx-gateway-fabric) below.

- **cert-manager already on the cluster, but certificates for deployers are still attached to the old install (for example `ingress-nginx`)** — Run [TLS migration to Gateway API](/docs/providers/operations/tls-gateway-api-migration) first, then return here.

---

## What you'll install

- Gateway API CRDs (experimental, includes `TCPRoute`)
- NGINX Gateway Fabric with host ports 80, 443, 8443, 8444, 5002
- The `akash-gateway` Helm release (`Gateway`, `TCPRoute`s, HTTPS for deployers)

---

## Before you begin

- [Prerequisites](#prerequisites) satisfied (or you will complete [TLS migration to Gateway API](/docs/providers/operations/tls-gateway-api-migration) in parallel)
- Provider on v0.11.2 before upgrading to v0.12.0
- `kubectl` and Helm 3
- `ingress-nginx` on TCP 8443 and 8444 today
- Host ports 80, 443, 8443, 8444, and 5002 available on your nodes
- cert-manager and a `ClusterIssuer` (as required by the prerequisite step)

---

## STEP 1: Install Gateway API CRDs

Install the Gateway API CRDs (experimental channel, includes `TCPRoute`) from NGINX Gateway Fabric. These are required before deploying NGINX Gateway Fabric.

```bash
kubectl kustomize "https://github.com/nginx/nginx-gateway-fabric/config/crd/gateway-api/experimental?ref=v2.5.1" | kubectl apply --server-side -f -
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

If you already installed NGINX Gateway Fabric from [Provider installation (prep) – STEP 8](/docs/providers/setup-and-installation/kubespray/provider-installation-prep#step-8---install-gateway-api-and-nginx-gateway-fabric) with the same host ports and settings, **do not** install it again; continue at [STEP 3](#step-3-install-the-akash-gateway-gateway--tcproutes).

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
  snippets:
    enable: true
  resources:
    requests:
      cpu: 1000m
      memory: 1Gi
    limits:
      cpu: 1000m
      memory: 1Gi

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
        cpu: 1000m
        memory: 1Gi
      limits:
        cpu: 1000m
        memory: 1Gi
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

Satisfy the [prerequisites](#prerequisites) so **`wildcard-ingress-tls`** and **`akash-default-tls`** exist in **`akash-gateway`** before or alongside this install. If you are still moving Let’s Encrypt off the old stack, do [TLS migration to Gateway API](/docs/providers/operations/tls-gateway-api-migration) first. **New clusters** follow [Provider installation (prep) – STEP 9](/docs/providers/setup-and-installation/kubespray/provider-installation-prep#step-9---lets-encrypt-cert-manager-and-tls-secrets) and [Provider installation (install)](/docs/providers/setup-and-installation/kubespray/provider-installation).

Pass the same **`domain`** you use for the provider (for example with `-f /root/provider/provider.yaml`) so the wildcard host `*.ingress.<domain>` matches your DNS; only keys this chart uses are read from the file.

```bash
helm repo add akash https://akash-network.github.io/helm-charts
helm repo update akash

helm install akash-gateway akash/akash-gateway \
  -n akash-gateway \
  --create-namespace \
  -f /root/provider/provider.yaml
```

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

## Related resources

- [TLS migration to Gateway API](/docs/providers/operations/tls-gateway-api-migration) — old `Certificate` and Secrets → `akash-gateway`
- [Provider installation (prep)](/docs/providers/setup-and-installation/kubespray/provider-installation-prep) — `provider.yaml`, DNS, NGF, **STEP 8–9** (Let’s Encrypt, TLS Secrets)
- [Provider installation (install)](/docs/providers/setup-and-installation/kubespray/provider-installation) — `helm install` for `akash-gateway`, operators, and `akash/provider`
- [Provider installation (prep) – STEP 9 (TLS)](/docs/providers/setup-and-installation/kubespray/provider-installation-prep#step-9---lets-encrypt-cert-manager-and-tls-secrets) — cert-manager, `wildcard-ingress-tls` / `akash-default-tls`, troubleshooting
- [Updates & maintenance](/docs/providers/operations/updates-maintenance)
- [Provider verification](/docs/providers/operations/provider-verification)
- [NGINX Gateway Fabric](https://docs.nginx.com/nginx-gateway-fabric/)
- [Kubernetes Gateway API](https://gateway-api.sigs.k8s.io/)

---

