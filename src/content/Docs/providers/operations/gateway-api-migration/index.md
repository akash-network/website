---
categories: ["Providers", "Operations"]
tags: ["Gateway API", "NGINX Gateway Fabric", "Migration", "Networking", "Kubernetes"]
weight: 3
title: "Gateway API Migration"
linkTitle: "Gateway API Migration"
description: "Migrate your Akash provider from ingress-nginx TCP proxying to NGINX Gateway Fabric using the Kubernetes Gateway API"
---

This guide walks through migrating an existing Akash provider from ingress-nginx TCP pass-through to [NGINX Gateway Fabric (NGF)](https://github.com/nginx/nginx-gateway-fabric) using the Kubernetes Gateway API. This migration improves traffic routing for provider endpoints by replacing ad-hoc TCP ConfigMap entries with first-class `TCPRoute` resources.

---

## Prerequisites

Before starting, ensure you have:

- Running Akash provider on **v0.10.7** (required before upgrading to v0.11.0)
- `kubectl` configured with access to your cluster
- `helm` v3 installed
- `ingress-nginx` currently handling TCP ports 8443 and 8444
- Cluster nodes with host port availability on ports 80, 8443, 8444, and 5002

**Time Estimate:** 20-30 minutes

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

**Note:** `gwAPIExperimentalFeatures.enable: true` is required for `TCPRoute` support. `nginx.kind: daemonSet` with `ClusterIP` service type means NGINX binds directly to host ports on each node rather than using a LoadBalancer.

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

The [akash-gateway](https://github.com/akash-network/helm-charts/tree/main/charts/akash-gateway) Helm chart creates the Gateway resource and TCPRoutes in one step. Install it after the Gateway API CRDs and NGINX Gateway Fabric are in place.

```bash
helm repo add akash https://akash-network.github.io/helm-charts
helm repo update akash

helm install akash-gateway akash/akash-gateway \
  -n akash-gateway \
  --create-namespace
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

## STEP 4: Upgrade Provider to v0.11.0

With the Gateway resources in place, upgrade the Akash provider Helm charts to v0.11.0.

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
akash/akash-hostname-operator     15.0.0           0.11.0
akash/akash-inventory-operator    15.0.0           0.11.0
akash/akash-ip-operator           15.0.0           0.11.0
akash/akash-node                  16.0.1           1.2.1
akash/provider                    15.0.0           0.11.0
```

### Backup Current Chart Values

```bash
cd /root/provider
for i in $(helm list -n akash-services -q | grep -vw akash-node); do helm -n akash-services get values $i > ${i}.pre-v0.11.0.values; done
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

Allow a minute or two for Kubernetes to apply the changes, then confirm all pods are running v0.11.0:

```bash
kubectl -n akash-services get pods -o custom-columns='NAME:.metadata.name,IMAGE:.spec.containers[*].image'
```

All provider, hostname-operator, and inventory-operator images should reference `0.11.0`.

---

## STEP 5: Uninstall ingress-nginx

With the provider upgraded and NGINX Gateway Fabric handling all traffic on ports 80, 8443, 8444, and 5002, ingress-nginx is no longer needed and can be removed.

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
ss -tlnp | grep -E ':(80|8443|8444|5002)\s'
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
ss -tlnp | grep -E ':(80|8443|8444|5002)\s'
```

If ingress-nginx still holds the ports, ensure it was fully uninstalled in Step 6:

```bash
helm list -n ingress-nginx
```

If the release still exists, uninstall it:

```bash
helm uninstall ingress-nginx -n ingress-nginx
```

---

## Related Resources

- [TLS Migration to Gateway API](/docs/providers/operations/tls-gateway-api-migration) – restore HTTPS for `*.ingress.<domain>` after migrating (if you had TLS with ingress-nginx)
- [Provider Installation](/docs/providers/setup-and-installation/kubespray/provider-installation)
- [Updates & Maintenance](/docs/providers/operations/updates-maintenance)
- [Provider Verification](/docs/providers/operations/provider-verification)
- [NGINX Gateway Fabric Documentation](https://docs.nginx.com/nginx-gateway-fabric/)
- [Kubernetes Gateway API](https://gateway-api.sigs.k8s.io/)

---

