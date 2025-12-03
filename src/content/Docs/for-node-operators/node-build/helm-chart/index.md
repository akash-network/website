---
categories: ["For Node Operators"]
tags: ["Node Build", "Helm"]
weight: 2
title: "Akash Node Via Helm Chart"
linkTitle: "Helm Chart"
---

Deploy an Akash RPC node to your Kubernetes cluster using Helm. This method uses blockchain snapshots for rapid synchronization.

**Time:** 20-30 minutes (including snapshot download and sync)

**Requirements:**
- Existing Kubernetes cluster
- Helm 4.0+
- kubectl access
- 100 GB storage (minimum), 1 TB recommended

---

## Step 1 - Prepare Kubernetes Cluster

### Create Namespace

```bash
kubectl create ns akash-services
kubectl label ns akash-services akash.network/name=akash-services akash.network=true
```

### Install Helm

```bash
# Download Helm
wget https://get.helm.sh/helm-v4.0.1-linux-amd64.tar.gz
tar -zxvf helm-v4.0.1-linux-amd64.tar.gz
install linux-amd64/helm /usr/local/bin/helm

# Add Akash Helm repository
helm repo add akash https://akash-network.github.io/helm-charts
helm repo update akash
```

---

## Step 2 - Install Akash Node

### Install with Default Settings (Recommended)

The default installation uses blockchain snapshots for fast initial sync (~20 minutes for download and extraction, depending on connection speed).

```bash
helm install akash-node akash/akash-node -n akash-services
```

**Expected output:**

```
NAME: akash-node
NAMESPACE: akash-services
STATUS: deployed
```

**What happens:**
- Downloads latest blockchain snapshot from Akash snapshot provider
- Extracts snapshot to node data directory
- Begins syncing from snapshot height to current block

### Install with Custom Storage

For production nodes, increase storage allocation:

```bash
helm install akash-node akash/akash-node -n akash-services \
  --set ceph_storage.enabled=true \
  --set ceph_storage.capacity=1000Gi \
  --set ceph_storage.storageclass=beta3
```

### Install with State Sync (Alternative)

State sync is faster but requires finding reliable RPC endpoints:

```bash
helm install akash-node akash/akash-node -n akash-services \
  --set state_sync.enabled=true \
  --set state_sync.rpc1="https://akash-rpc.polkachu.com:443" \
  --set state_sync.rpc2="https://akash-rpc.polkachu.com:443"
```

---

## Step 3 - Verify Node

### Check Pod Status

```bash
kubectl get pods -n akash-services
```

**Expected output:**

```
NAME                       READY   STATUS    RESTARTS   AGE
akash-node-1-xxxxx-xxxxx   1/1     Running   0          2m
```

### Check Sync Status

```bash
# Get pod name
POD_NAME=$(kubectl get pods -n akash-services -l app=akash-node -o jsonpath='{.items[0].metadata.name}')

# Check status
kubectl exec -n akash-services $POD_NAME -- akash status | jq '.SyncInfo.catching_up'
```

**Expected:**
- `true` - Still syncing
- `false` - Fully synced

### Monitor Logs

```bash
kubectl logs -n akash-services -l app=akash-node --tail=50 -f
```

Press `Ctrl+C` to stop following logs.

---

## Access Node RPC

### From Within Kubernetes Cluster

```bash
export AKASH_NODE="http://$(kubectl -n akash-services get svc akash-node-1 -o jsonpath='{.spec.clusterIP}'):26657"
curl -s "$AKASH_NODE/status" | jq '.result.sync_info'
```

### From Outside Kubernetes (Port Forward)

```bash
# Forward RPC port
kubectl -n akash-services port-forward svc/akash-node-1 26657:26657

# In another terminal, test the connection
curl -s http://127.0.0.1:26657/status | jq '.result.sync_info'
```

---

## Configuration Options

View available configuration options:

```bash
helm show values akash/akash-node
```

**Common options:**

| Option | Default | Description |
|--------|---------|-------------|
| `akash_node.snapshot_provider` | `akash` | Snapshot provider: `akash`, `polkachu`, `c29r3`, or `autostake` |
| `state_sync.enabled` | `false` | Enable state sync (alternative to snapshot) |
| `ceph_storage.enabled` | `false` | Use Ceph block storage |
| `ceph_storage.capacity` | `100Gi` | Size of Ceph volume |
| `ceph_storage.storageclass` | `akash-nodes` | Storage class name |
| `local_storage.enabled` | `false` | Use local node storage |
| `local_storage.capacity` | `100Gi` | Size of local volume |
| `akash_node.moniker` | `mynode` | Node name |
| `akash_node.chainid` | `akashnet-2` | Chain ID |
| `akash_node.pruning` | `nothing` | Pruning strategy |

---

## Upgrade Node

```bash
# Update Helm repository
helm repo update akash

# Upgrade node
helm upgrade akash-node akash/akash-node -n akash-services
```

---

## Uninstall Node

```bash
helm -n akash-services uninstall akash-node
```

**Note:** This does not delete the persistent volume claim. To remove it:

```bash
kubectl -n akash-services delete pvc data-akash-node-1-0
```

---

## Next Steps

- **For Validators:** See [Running a Validator](/docs/for-node-operators/validators/running-a-validator)
- **For Providers:** Configure provider to use this node as RPC endpoint
- **For dApps:** Use the node's cluster IP or port-forward for local development

---

**Questions?** Join [#validators on Discord](https://discord.com/channels/747885925232672829/771909963946237993)