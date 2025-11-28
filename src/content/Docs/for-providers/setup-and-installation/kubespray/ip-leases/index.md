---
categories: ["For Providers"]
tags: ["IP Leases", "Advanced Features", "Networking"]
weight: 5
title: "IP Leases"
linkTitle: "IP Leases"
description: "Enable static IP leases on your Akash provider using MetalLB"
---

> **Don't need IP leases?** This is an optional feature. Skip if you don't have available public IP addresses.

This guide shows how to enable IP leases on your Akash provider, allowing deployments to request static public IP addresses.

**Time:** 20-30 minutes

---

## Prerequisites

Before starting, ensure you have:

- **Provider installed and running** (see [Provider Installation](/docs/for-providers/setup-and-installation/kubespray/provider-installation))
- **Pool of public IP addresses** available for allocation
- **Layer 2 network access** to broadcast ARP for IP addresses

> **Important:** IP leases require you have unallocated public IP addresses and the ability to use them with your provider's network infrastructure.

---

## STEP 1 - Install MetalLB

MetalLB provides load-balancing and IP address management for Kubernetes clusters.

### Create Namespace

```bash
kubectl create namespace metallb-system
```

### Install via Helm

```bash
helm repo add metallb https://metallb.github.io/metallb
helm repo update

helm install metallb metallb/metallb \
  --namespace metallb-system \
  --version 0.14.9
```

### Verify Installation

```bash
kubectl -n metallb-system get pods
```

**Expected output:**

```
NAME                                  READY   STATUS    RESTARTS   AGE
metallb-controller-xxx                1/1     Running   0          2m
metallb-speaker-xxx                   1/1     Running   0          2m
metallb-speaker-yyy                   1/1     Running   0          2m
```

---

## STEP 2 - Configure IP Address Pool

Create a configuration file defining your public IP address pool.

### Create Configuration

Replace the IP addresses with your actual public IP pool:

```bash
cat > metallb-config.yaml << 'EOF'
---
apiVersion: metallb.io/v1beta1
kind: IPAddressPool
metadata:
  name: default
  namespace: metallb-system
spec:
  addresses:
  - 203.0.113.0/28          # CIDR notation
  - 203.0.113.20-203.0.113.30  # Range notation
  - 203.0.113.50/32         # Single IP
  autoAssign: true
  avoidBuggyIPs: false
---
apiVersion: metallb.io/v1beta1
kind: L2Advertisement
metadata:
  name: l2advertisement
  namespace: metallb-system
spec:
  ipAddressPools:
  - default
EOF
```

**Configuration options:**

- **addresses:** List of IP ranges in CIDR, range, or single IP format
- **autoAssign:** Automatically assign IPs from this pool (default: true)
- **avoidBuggyIPs:** Avoid .0 and .255 addresses (default: false)

### Apply Configuration

```bash
kubectl apply -f metallb-config.yaml
```

### Verify Configuration

```bash
kubectl -n metallb-system get ipaddresspool
kubectl -n metallb-system get l2advertisement
```

---

## STEP 3 - Enable Strict ARP

MetalLB requires `strictARP` mode in kube-proxy for Layer 2 operation.

```bash
kubectl get configmap kube-proxy -n kube-system -o yaml | \
sed -e "s/strictARP: false/strictARP: true/" | \
kubectl apply -f - -n kube-system
```

### Restart kube-proxy

```bash
kubectl -n kube-system rollout restart daemonset kube-proxy
```

---

## STEP 4 - Expose MetalLB Controller

The Akash IP Operator needs access to the MetalLB controller:

```bash
kubectl -n metallb-system expose deployment metallb-controller \
  --name=controller \
  --overrides='{"spec":{"ports":[{"protocol":"TCP","name":"monitoring","port":7472}]}}'
```

### Verify Service

```bash
kubectl -n metallb-system get svc controller
```

---

## STEP 5 - Install Akash IP Operator

### Add Akash Helm Repository (if not already added)

```bash
helm repo add akash https://akash-network.github.io/helm-charts
helm repo update
```

### Install IP Operator

```bash
helm install akash-ip-operator akash/akash-ip-operator \
  --namespace akash-services
```

### Verify IP Operator

```bash
kubectl -n akash-services get pods -l app=akash-ip-operator
```

**Expected output:**

```
NAME                                 READY   STATUS    RESTARTS   AGE
akash-ip-operator-xxx                1/1     Running   0          2m
```

---

## STEP 6 - Update Provider Configuration

Add IP lease capabilities to your provider attributes.

### Edit provider.yaml

```bash
nano /root/provider/provider.yaml
```

Add the following attributes:

```yaml
attributes:
  # ... existing attributes ...
  - key: ip-lease
    value: "true"
```

### Update Provider

```bash
cd /root/provider

helm upgrade akash-provider akash/provider \
  -n akash-services \
  -f provider.yaml \
  --set bidpricescript="$(cat price_script.sh | openssl base64 -A)"
```

---

## STEP 7 - Verify IP Leases

### Check IP Operator Logs

```bash
kubectl -n akash-services logs -l app=akash-ip-operator
```

Look for successful initialization messages.

### Test with Deployment

Deploy a test workload that requests an IP:

```yaml
---
version: "2.0"

services:
  web:
    image: nginx
    expose:
      - port: 80
        as: 80
        to:
          - global: true
        ip_name: myip

profiles:
  compute:
    web:
      resources:
        cpu:
          units: 0.5
        memory:
          size: 512Mi
        storage:
          size: 512Mi
  placement:
    akash:
      pricing:
        web:
          denom: uakt
          amount: 1000

deployment:
  web:
    akash:
      profile: web
      count: 1
```

After deployment, check if an IP was assigned:

```bash
kubectl -n lease get svc
```

---

## Troubleshooting

### MetalLB Speaker Not Running

Check speaker logs:

```bash
kubectl -n metallb-system logs -l app.kubernetes.io/component=speaker
```

Ensure nodes have the correct network permissions for Layer 2 ARP.

### IPs Not Assigning

Check IP address pool:

```bash
kubectl -n metallb-system describe ipaddresspool default
```

Verify the IP range is correct and not already in use.

### IP Operator Errors

```bash
kubectl -n akash-services logs -l app=akash-ip-operator --tail=100
```

Common issues:
- MetalLB controller service not accessible
- IP pool exhausted
- Network configuration blocking ARP

---

## Next Steps

Your provider now supports IP leases!

**Optional enhancements:**
- [TLS Certificates](/docs/for-providers/setup-and-installation/kubespray/tls-certificates) - Automatic SSL certificates for deployments

**Resources:**
- [MetalLB Documentation](https://metallb.universe.tf/) - Official MetalLB docs
- [Provider Troubleshooting](/docs/for-providers/troubleshooting/) - Common issues

**Monitor IP usage:**

```bash
# Check allocated IPs
kubectl -n metallb-system get ipaddresspool default -o yaml

# View IP operator status
kubectl -n akash-services logs -l app=akash-ip-operator -f
```
