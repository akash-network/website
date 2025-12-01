---
categories: ["For Providers"]
tags: ["Provider", "Installation", "Helm", "Setup"]
weight: 4
title: "Provider Installation"
linkTitle: "Provider Installation"
description: "Install and configure your Akash provider using Helm charts"
---

This guide shows how to install the Akash provider on your Kubernetes cluster.

**Time:** 30-45 minutes

---

## Prerequisites

Before starting, ensure you have:

### Required

- **Kubernetes cluster** deployed and verified
- **Domain name** that you control (e.g., `provider.example.com`)
- **Akash wallet** with:
  - Minimum 50 AKT recommended (0.5 AKT deposit per bid)
  - Funded account ([Fund Your Account](/docs/deployments/akash-cli/installation/#fund-your-account))

### Optional (if configured)

- GPU support enabled
- Persistent storage (Rook-Ceph) deployed

---

## STEP 1 - Prepare Provider Wallet

> **Don't have an Akash wallet yet?**
> - [Install Akash CLI](/docs/deployments/akash-cli/installation/)
> - [Create an Account](/docs/deployments/sandbox/installation/)
> - [Fund Your Account](/docs/deployments/akash-cli/installation/#fund-your-account)

### Export Wallet Key

On your local machine (where you created your Akash wallet):

```bash
# Export your private key
provider-services keys export <your-key-name>
```

You'll be prompted for your keyring passphrase. The output will look like:

```
-----BEGIN TENDERMINT PRIVATE KEY-----
kdf: bcrypt
salt: <salt-value>
type: secp256k1

<base64-encoded-key>
-----END TENDERMINT PRIVATE KEY-----
```

Save this output to a file called `key.pem`.

### Create Key Secret

Create a password for your key:

```bash
echo "your-secure-password" > key-pass.txt
```

---

## STEP 2 - Setup on Control Plane Node

SSH into your Kubernetes control plane node and create the provider directory:

```bash
mkdir -p /root/provider
cd /root/provider
```

### Upload Files

Upload the following files to `/root/provider/`:
- `key.pem` (your private key)
- `key-pass.txt` (your key password)

### Encode Secrets

```bash
# Base64 encode the key
KEY_SECRET=$(cat /root/provider/key.pem | openssl base64 -A)

# Base64 encode the password
KEY_PASSWORD=$(cat /root/provider/key-pass.txt | openssl base64 -A)

# Get your provider address
ACCOUNT_ADDRESS=$(provider-services keys show <your-key-name> -a)
```

---

## STEP 3 - Install Helm and Add Akash Repository

### Install Helm

```bash
# Download Helm
wget https://get.helm.sh/helm-v4.0.1-linux-amd64.tar.gz
tar -zxvf helm-v4.0.1-linux-amd64.tar.gz
install linux-amd64/helm /usr/local/bin/helm

# Verify installation
helm version
```

### Add Akash Helm Repository

```bash
helm repo add akash https://akash-network.github.io/helm-charts
helm repo update
```

---

## STEP 4 - Create Namespaces

Create all required namespaces:

```bash
kubectl create namespace akash-services
kubectl create namespace lease
kubectl label namespace akash-services akash.network=true
kubectl label namespace lease akash.network=true
```

---

## STEP 5 - Install Akash RPC Node

> **Important:** Running your own RPC node is a **strict requirement** for Akash providers. This removes dependence on public nodes and ensures reliable access to the blockchain.

### Install Akash Node via Helm

The default installation uses blockchain snapshots for fast synchronization.

```bash
helm install akash-node akash/akash-node \
  -n akash-services
```

### Verify Node is Running

```bash
kubectl -n akash-services get pods -l app=akash-node
```

**Expected output:**

```
NAME             READY   STATUS    RESTARTS   AGE
akash-node-1-0   1/1     Running   0          2m
```

**Sync Time:** The node will download and extract a blockchain snapshot, then sync to the latest block. This typically takes ~5 minutes. You can proceed with the next steps while it syncs.

---

## STEP 6 - Install Akash Operators

### Install Hostname Operator

```bash
helm install akash-hostname-operator akash/akash-hostname-operator \
  -n akash-services
```

### Install Inventory Operator

**Without persistent storage:**

```bash
helm install inventory-operator akash/akash-inventory-operator \
  -n akash-services \
  --set inventoryConfig.cluster_storage[0]=default \
  --set inventoryConfig.cluster_storage[1]=ram
```

**With persistent storage (adjust beta3 to your storage class):**

```bash
helm install inventory-operator akash/akash-inventory-operator \
  -n akash-services \
  --set inventoryConfig.cluster_storage[0]=default \
  --set inventoryConfig.cluster_storage[1]=beta3 \
  --set inventoryConfig.cluster_storage[2]=ram
```

**Note:** 
- Index 0 is always **default** (ephemeral storage)
- Index 1 is **ram** (SHM/shared memory) if no persistent storage, or your persistent storage class (**beta1**/**beta2**/**beta3**)
- Index 2 is **ram** (SHM/shared memory) if you have persistent storage
- All providers should support SHM for deployments requiring shared memory

### Apply Provider CRDs

```bash
kubectl apply -f https://raw.githubusercontent.com/akash-network/provider/main/pkg/apis/akash.network/crd.yaml
```

---

## STEP 7 - Configure DNS

### Configure at Your DNS Provider

Log into your DNS provider (Cloudflare, GoDaddy, Route53, etc.) and create the following DNS records:

**1. Provider A Record:**
```
Type: A
Name: provider (or your subdomain)
Value: <your-provider-public-ip>
TTL: 3600 (or Auto)
```

**2. Wildcard Ingress A Record:**
```
Type: A
Name: *.ingress.provider (or *.ingress.your-subdomain)
Value: <your-provider-public-ip>
TTL: 3600 (or Auto)
```

**Example:**
```
provider.example.com           →  203.0.113.45
*.ingress.provider.example.com →  203.0.113.45
```

### Verify DNS Propagation

After configuring DNS, verify both records resolve correctly:

```bash
# Check provider domain
dig provider.example.com +short

# Check wildcard ingress domain
dig test.ingress.provider.example.com +short
```

Both should return your provider's public IP.

> **Note:** DNS propagation can take a few minutes. Wait until both records resolve before proceeding.

---

## STEP 8 - Create Provider Configuration

### Download Price Script

```bash
cd /root/provider
curl -s https://raw.githubusercontent.com/akash-network/provider/main/price_script_generic.sh > price_script.sh
chmod +x price_script.sh
```

### Create provider.yaml

Replace the values with your actual configuration:

```bash
cat > /root/provider/provider.yaml << 'EOF'
---
from: "$ACCOUNT_ADDRESS"
key: "$KEY_SECRET"
keysecret: "$KEY_PASSWORD"
domain: "provider.example.com"
node: "http://akash-node-1:26657"
withdrawalperiod: 12h
chainid: "akashnet-2"
attributes:
  - key: region
    value: us-west
  - key: host
    value: akash
  - key: tier
    value: community
  - key: organization
    value: "Your Organization"
  - key: country
    value: US
  - key: city
    value: "San Francisco"
  - key: location-type
    value: datacenter
  - key: capabilities/cpu
    value: intel
  - key: capabilities/cpu/arch
    value: x86-64
  - key: capabilities/memory
    value: ddr4
  - key: network-speed-up
    value: 1000
  - key: network-speed-down
    value: 1000

email: contact@example.com
website: https://example.com
organization: Your Organization

# Pricing (in uakt per unit)
price_target_cpu: 1.60
price_target_memory: 0.30
price_target_hd_ephemeral: 0.02
price_target_hd_pers_hdd: 0.01
price_target_hd_pers_ssd: 0.03
price_target_hd_pers_nvme: 0.10
price_target_endpoint: 0.05
price_target_ip: 5.00
EOF
```

---

### Add Persistent Storage Attributes (if you have Rook-Ceph)

If you configured persistent storage with Rook-Ceph, add the storage attributes to your `provider.yaml`:

```yaml
attributes:
  # ... existing attributes ...
  - key: capabilities/storage/1/class
    value: <storage-class>
  - key: capabilities/storage/1/persistent
    value: "true"
```

**Example for beta3 (NVMe) storage class:**

```yaml
  - key: capabilities/storage/1/class
    value: beta3
  - key: capabilities/storage/1/persistent
    value: "true"
```

**Example for beta2 (SSD) storage class:**

```yaml
  - key: capabilities/storage/1/class
    value: beta2
  - key: capabilities/storage/1/persistent
    value: "true"
```

> **Important:** You can only advertise **one storage class** per provider. Choose either beta1 (HDD), beta2 (SSD), or beta3 (NVMe) based on what you configured in Rook-Ceph.

---

### Add GPU Attributes (if you have GPUs)

If you configured GPU support, add GPU attributes to your `provider.yaml`:

```yaml
attributes:
  # ... existing attributes ...
  - key: capabilities/gpu/vendor/nvidia/model/<model>
    value: "true"
  - key: capabilities/gpu/vendor/nvidia/model/<model>/ram/<ram>
    value: "true"
  - key: capabilities/gpu/vendor/nvidia/model/<model>/interface/<interface>
    value: "true"
  - key: capabilities/gpu/vendor/nvidia/model/<model>/interface/<interface>/ram/<ram>
    value: "true"
```

**Example for NVIDIA RTX 4090:**

```yaml
  - key: capabilities/gpu/vendor/nvidia/model/rtx4090
    value: "true"
  - key: capabilities/gpu/vendor/nvidia/model/rtx4090/ram/24Gi
    value: "true"
  - key: capabilities/gpu/vendor/nvidia/model/rtx4090/interface/pcie
    value: "true"
  - key: capabilities/gpu/vendor/nvidia/model/rtx4090/interface/pcie/ram/24Gi
    value: "true"
```

> **Note:** Model names should be lowercase with no spaces. List each GPU model you're offering.

---

### Complete Example with All Features

Here's a full example showing GPU, persistent storage, and all optional attributes:

```yaml
---
from: "akash1..."
key: "LS0tLS1CRUdJTi..."
keysecret: "eHJiajdSS..."
domain: "provider.example.com"
node: "http://akash-node-1:26657"
withdrawalperiod: 12h
chainid: "akashnet-2"

attributes:
  # Location
  - key: region
    value: us-west
  - key: country
    value: US
  - key: city
    value: "San Francisco"
  - key: location-type
    value: datacenter
  - key: datacenter
    value: us-west-dc-1
  
  # Required
  - key: host
    value: akash
  - key: tier
    value: community
  - key: organization
    value: "Your Organization"

  # CPU
  - key: capabilities/cpu
    value: intel
  - key: capabilities/cpu/arch
    value: x86-64
  
  # Memory
  - key: capabilities/memory
    value: ddr5ecc
  
  # Network
  - key: network-speed-up
    value: 10000
  - key: network-speed-down
    value: 10000
  
  # GPU (if you have GPUs)
  - key: capabilities/gpu
    value: nvidia
  - key: capabilities/gpu/vendor/nvidia/model/h100
    value: "true"
  - key: capabilities/gpu/vendor/nvidia/model/h100/ram/80Gi
    value: "true"
  - key: capabilities/gpu/vendor/nvidia/model/h100/interface/sxm
    value: "true"
  - key: capabilities/gpu/vendor/nvidia/model/h100/interface/sxm/ram/80Gi
    value: "true"
  - key: cuda
    value: "13.0"
  
  # Persistent Storage (if you have Rook-Ceph)
  - key: capabilities/storage/1/class
    value: beta3
  - key: capabilities/storage/1/persistent
    value: "true"
  
  # SHM (Shared Memory) storage class (optional)
  - key: capabilities/storage/2/class
    value: ram
  - key: capabilities/storage/2/persistent
    value: "false"

email: contact@example.com
website: https://example.com
organization: Your Organization

# Pricing
price_target_cpu: 1.60
price_target_memory: 0.30
price_target_hd_ephemeral: 0.02
price_target_hd_pers_hdd: 0.01
price_target_hd_pers_ssd: 0.03
price_target_hd_pers_nvme: 0.10
price_target_endpoint: 0.05
price_target_ip: 5.00

# GPU pricing (format: "model=price,model=price" or "*=price" for all)
price_target_gpu_mappings: "h100=840,*=840"
```

> **Note:** This example shows all possible configurations. Only include the sections relevant to your provider setup.

---

## STEP 9 - Install Provider

```bash
cd /root/provider

helm install akash-provider akash/provider \
  -n akash-services \
  -f provider.yaml \
  --set bidpricescript="$(cat price_script.sh | openssl base64 -A)"
```

### Verify Provider

```bash
kubectl -n akash-services get pods
```

**Expected output:**

```
NAMESPACE        NAME                                              READY   STATUS    RESTARTS   AGE
akash-services   akash-node-1-0                                    1/1     Running   0          4d1h
akash-services   akash-provider-0                                  1/1     Running   0          47h
akash-services   operator-hostname-79fbbffbb7-xxxxx                1/1     Running   0          47h
akash-services   operator-inventory-7bb766f7bb-xxxxx               1/1     Running   0          39m
akash-services   operator-inventory-hardware-discovery-node1       1/1     Running   0          38m
```

All pods should show `Running` status and `1/1` ready.

---

## STEP 10 - Install Ingress Controller

### Create Ingress Configuration

```bash
cat > /root/ingress-nginx-custom.yaml << 'EOF'
controller:
  service:
    type: ClusterIP
  ingressClassResource:
    name: "akash-ingress-class"
  kind: DaemonSet
  hostPort:
    enabled: true
  admissionWebhooks:
    port: 7443
  config:
    allow-snippet-annotations: false
    compute-full-forwarded-for: true
    proxy-buffer-size: "16k"
  metrics:
    enabled: true
  extraArgs:
    enable-ssl-passthrough: true

tcp:
  "8443": "akash-services/akash-provider:8443"
  "8444": "akash-services/akash-provider:8444"
EOF
```

### Install Ingress-NGINX

```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --version 4.12.1 \
  -f /root/ingress-nginx-custom.yaml
```

### Label Ingress Resources

```bash
kubectl label namespace ingress-nginx app.kubernetes.io/name=ingress-nginx app.kubernetes.io/instance=ingress-nginx
kubectl label ingressclass akash-ingress-class akash.network=true
```

### Verify Ingress

```bash
kubectl -n ingress-nginx get pods
```

**Expected output:**

```
NAME                             READY   STATUS    RESTARTS   AGE
ingress-nginx-controller-xxx     1/1     Running   0          2m
```

---

## STEP 11 - Verify Provider On-Chain

### Check Provider Status

```bash
provider-services query provider get $ACCOUNT_ADDRESS \
  --node https://rpc.akashnet.net:443
```

**Expected output:**

```
attributes:
- key: region
  value: us-west
- key: host
  value: akash
- key: tier
  value: community
host_uri: https://provider.example.com:8443
info:
  email: ""
  website: ""
owner: akash1...
```

### Check Provider Logs

```bash
kubectl -n akash-services logs -f akash-provider-0
```

Look for messages indicating the provider is bidding on deployments.

---

## STEP 12 - Verify Firewall

Ensure these ports are open on your provider's public IP:

**Required:**
- `80/tcp` - HTTP
- `443/tcp` - HTTPS
- `8443/tcp` - Provider Endpoint
- `8444/tcp` - Provider GRPC
- `30000-32767/tcp` - Kubernetes NodePort range

**Optional (if using external access):**
- `6443/tcp` - Kubernetes API

Test connectivity:

```bash
# From an external machine
curl -k https://provider.example.com:8443/status
```

---

## STEP 13 - Install ReplicaSet Cleanup Script (Recommended)

When deployments update but the provider is out of resources, Kubernetes won't destroy old pods until new ones are created. This can cause deployments to get stuck.

**This script automatically removes old ReplicaSets when new ones fail due to insufficient resources.**

See [GitHub Issue #82](https://github.com/akash-network/support/issues/82) for more details.

### Create the Script

On the **control plane node**, create `/usr/local/bin/akash-force-new-replicasets.sh`:

```bash
cat > /usr/local/bin/akash-force-new-replicasets.sh <<'EOF'
#!/bin/bash
#
# Version: 0.2 - 25 March 2023
# Files:
# - /usr/local/bin/akash-force-new-replicasets.sh
# - /etc/cron.d/akash-force-new-replicasets
#
# Description:
# This workaround identifies deployments stuck due to "insufficient resources"
# and removes older ReplicaSets, leaving only the newest one.

kubectl get deployment -l akash.network/manifest-service -A -o=jsonpath='{range .items[*]}{.metadata.namespace} {.metadata.name}{"\n"}{end}' |
  while read ns app; do
    kubectl -n $ns rollout status --timeout=10s deployment/${app} >/dev/null 2>&1
    rc=$?
    if [[ $rc -ne 0 ]]; then
      if kubectl -n $ns describe pods | grep -q "Insufficient"; then
        OLD="$(kubectl -n $ns get replicaset -o json -l akash.network/manifest-service --sort-by='{.metadata.creationTimestamp}' | jq -r '(.items | reverse)[1:][] | .metadata.name')"
        for i in $OLD; do kubectl -n $ns delete replicaset $i; done
      fi
    fi
  done
EOF
```

### Make Executable

```bash
chmod +x /usr/local/bin/akash-force-new-replicasets.sh
```

### Install JQ (if not already installed)

```bash
apt -y install jq
```

### Create Cron Job

Create `/etc/cron.d/akash-force-new-replicasets`:

```bash
cat > /etc/cron.d/akash-force-new-replicasets << 'EOF'
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
SHELL=/bin/bash

*/5 * * * * root /usr/local/bin/akash-force-new-replicasets.sh
EOF
```

The script runs every 5 minutes to clean up stuck ReplicaSets.

---

## Next Steps

Your provider is now running! 

**Verify your provider:**
- **→ [Provider Verification](/docs/for-providers/operations/provider-verification/)** - Verify your provider is working correctly

**Quick health checks:**
- Monitor provider status: `kubectl -n akash-services get pods`
- Check bids: `kubectl -n akash-services logs akash-provider-0 | grep bid`
- Watch for leases: `kubectl -n lease get pods`

**Optional enhancements:**
- [TLS Certificates](/docs/for-providers/setup-and-installation/kubespray/tls-certificates) - Automatic SSL certificates for deployments
- [IP Leases](/docs/for-providers/setup-and-installation/kubespray/ip-leases) - Enable static IPs for deployments

**Provider Resources:**
- [Provider Calculator](https://akash.network/pricing/provider-calculator/) - Estimate earnings
- [Provider Operations](/docs/for-providers/operations/) - Lease management, monitoring, and maintenance
- [Akash Discord](https://discord.akash.network) - Join the provider community

---

## Additional Configuration

### Update Provider Attributes

To update your provider attributes:

1. Edit `/root/provider/provider.yaml`
2. Upgrade the Helm release:

```bash
cd /root/provider

helm upgrade akash-provider akash/provider \
  -n akash-services \
  -f provider.yaml \
  --set bidpricescript="$(cat price_script.sh | openssl base64 -A)"
```

### Update Pricing

Edit the `price_target_*` values in `provider.yaml` and run the upgrade command above.

### Check Provider Version

```bash
kubectl -n akash-services get pod akash-provider-0 -o yaml | grep image:
```
