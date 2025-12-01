---
categories: ["For Providers"]
tags: ["Operations", "Leases"]
weight: 1
title: "Lease Management"
linkTitle: "Lease Management"
description: "Manage active leases, track earnings, and handle lease lifecycle"
---

This guide covers lease management operations for Akash providers. Most lease management tasks can be automated using two scripts. The manual commands at the bottom are provided for reference and troubleshooting.

---

## Automated Lease Management (Recommended)

The following two scripts automate most lease management tasks. Set them up once and let them run automatically.

### 1. Dangling Deployments Cleanup

Occasionally, leases may be closed on-chain but remain active in Kubernetes (or vice versa), creating "dangling deployments." These orphaned deployments consume resources without generating revenue.

**This script automatically identifies and removes dangling deployments.**

#### Download and Run

```bash
cd ~
wget https://gist.githubusercontent.com/Zblocker64/6da5f4833289270450260d360922cb11/raw/6035d31758143ee0b8edcfcf1b295225a2691bb7/cleanup_provider.sh
chmod +x cleanup_provider.sh
./cleanup_provider.sh
```

#### What the Script Does

- Compares on-chain lease state with Kubernetes manifests
- Identifies discrepancies between chain and cluster
- Automatically cleans up dangling resources
- Reports deployments that were removed

**Run this script regularly** (daily or weekly) to keep your provider clean.

### 2. Close Leases by Container Image

Block specific container images by automatically closing leases that use them.

**This script automatically monitors and closes deployments using unwanted images.**

#### Create the Script

Create `/usr/local/bin/akash-kill-lease.sh`:

```bash
#!/bin/bash

# Uncomment and set IMAGES to activate
# IMAGES="packetstream/psclient"

# Multiple images separated by "|"
# IMAGES="packetstream/psclient|traffmonetizer/cli"

# Exit if no images specified
test -z $IMAGES && exit 0

kubectl -n lease get manifests -o json | \
  jq --arg md_lid "akash.network/lease.id" -r '.items[] | [(.metadata.labels | .[$md_lid+".owner"], .[$md_lid+".dseq"], .[$md_lid+".gseq"], .[$md_lid+".oseq"]), (.spec.group | .services[].image)] | @tsv' | \
  grep -Ei "$IMAGES" | \
  while read owner dseq gseq oseq image; do
    kubectl -n akash-services exec -i $(kubectl -n akash-services get pods -l app=akash-provider -o name) -- \
      env AKASH_OWNER=$owner AKASH_DSEQ=$dseq AKASH_GSEQ=$gseq AKASH_OSEQ=$oseq \
      provider-services tx market bid close
  done
```

#### Make Executable

```bash
chmod +x /usr/local/bin/akash-kill-lease.sh
```

#### Create Cron Job (Automate It)

Create `/etc/cron.d/akash-kill-lease`:

```
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
SHELL=/bin/bash

*/5 * * * * root /usr/local/bin/akash-kill-lease.sh
```

This cron job runs every 5 minutes to automatically close leases with unwanted images.

**Note:** The image name is only known **after** the client sends the manifest (post-bid acceptance), so the provider will have already bid on the deployment.

---

## Manual Operations

The commands below are for manual troubleshooting and one-off operations. **Most providers won't need these** - the automated scripts above handle lease management automatically.

### List Provider Active Leases

View all active leases on your provider to monitor current deployments.

### Command Template

```bash
provider-services query market lease list \
  --provider <provider-address> \
  --gseq 0 \
  --oseq 0 \
  --page 1 \
  --limit 500 \
  --state active
```

### Example

```bash
provider-services query market lease list \
  --provider akash1yvu4hhnvs84v4sv53mzu5ntf7fxf4cfup9s22j \
  --gseq 0 \
  --oseq 0 \
  --page 1 \
  --limit 500 \
  --state active
```

### Example Output

```yaml
leases:
- escrow_payment:
    account_id:
      scope: deployment
      xid: akash19gs08y80wlk5wl4696wz82z2wrmjw5c84cvw28/5903794
    balance:
      amount: "0.455120000000000000"
      denom: uakt
    owner: akash1q7spv2cw06yszgfp4f9ed59lkka6ytn8g4tkjf
    rate:
      amount: "24.780240000000000000"
      denom: uakt
    state: open
  lease:
    closed_on: "0"
    created_at: "5903822"
    lease_id:
      dseq: "5903794"
      gseq: 1
      oseq: 1
      owner: akash19gs08y80wlk5wl4696wz82z2wrmjw5c84cvw28
      provider: akash1q7spv2cw06yszgfp4f9ed59lkka6ytn8g4tkjf
    price:
      amount: "24.780240000000000000"
      denom: uakt
    state: active
```

## List Active Leases from Kubernetes

View active leases from the Kubernetes cluster perspective using the Hostname Operator.

### Command

```bash
kubectl -n lease get providerhosts
```

### Example Output

```
NAME                                                  AGE
gtu5bo14f99elel76srrbj04do.ingress.example.com      60m
kbij2mvdlhal5dgc4pc7171cmg.ingress.example.com      18m
```

## Close a Lease (Provider-Side)

Providers can close bids to terminate deployments and recover provider escrow.

**What happens when you close a lease:**
- Closes the lease (payment channel) immediately
- Terminates the workload running on the provider
- Returns provider escrow to the provider
- Tenant must close their deployment separately to recover their escrow (5 AKT by default)

### Command Template

```bash
provider-services tx market bid close \
  --node $AKASH_NODE \
  --chain-id $AKASH_CHAIN_ID \
  --owner <TENANT-ADDRESS> \
  --dseq <DSEQ> \
  --gseq 1 \
  --oseq 1 \
  --from <PROVIDER-ADDRESS> \
  --keyring-backend $AKASH_KEYRING_BACKEND \
  -y \
  --gas-prices="0.025uakt" \
  --gas="auto" \
  --gas-adjustment=1.15
```

### Example

```bash
provider-services tx market bid close \
  --node $AKASH_NODE \
  --chain-id akashnet-2 \
  --owner akash1n44zc8l6gfm0hpydldndpg8n05xjjwmuahc6nn \
  --dseq 5905802 \
  --gseq 1 \
  --oseq 1 \
  --from akash1yvu4hhnvs84v4sv53mzu5ntf7fxf4cfup9s22j \
  --keyring-backend os \
  -y \
  --gas-prices="0.025uakt" \
  --gas="auto" \
  --gas-adjustment=1.15
```

## Retrieve Active Manifest List

List all active manifests (deployments) running on your provider.

### Command

```bash
kubectl -n lease get manifests --show-labels
```

### Example Output

```
NAME                                            AGE   LABELS
h644k9qp92e0qeakjsjkk8f3piivkuhgc6baon9tccuqo   26h   akash.network/lease.id.dseq=5950031,akash.network/lease.id.gseq=1,akash.network/lease.id.oseq=1,akash.network/lease.id.owner=akash15745vczur53teyxl4k05u250tfvp0lvdcfqx27,akash.network/lease.id.provider=akash1xmz9es9ay9ln9x2m3q8dlu0alxf0ltce7ykjfx
```

## Retrieve Manifest Details

Get detailed information about a specific deployment's manifest.

### Command Template

```bash
kubectl -n lease get manifest <namespace> -o yaml
```

### Example

```bash
kubectl -n lease get manifest moc58fca3ccllfrqe49jipp802knon0cslo332qge55qk -o yaml
```

## Ingress Controller Verification

Verify ingress resources for active deployments.

### Command

```bash
kubectl get ingress -A
```

### Example Output

```
NAMESPACE                                       NAME                                      CLASS                 HOSTS                                     ADDRESS          PORTS   AGE
moc58fca3ccllfrqe49jipp802knon0cslo332qge55qk   5n0vp4dmbtced00smdvb84ftu4.ingress.example.com   akash-ingress-class   5n0vp4dmbtced00smdvb84ftu4.ingress.example.com   10.0.10.122      80      70s
```

## Terminate Workload from Provider (CLI Method)

Alternative method to close a bid using `kubectl exec`.

### Step 1: Find the Deployment

```bash
kubectl -n lease get manifest --show-labels --sort-by='.metadata.creationTimestamp'
```

### Step 2: Close the Bid

```bash
kubectl -n akash-services exec -i $(kubectl -n akash-services get pods -l app=akash-provider --output jsonpath='{.items[0].metadata.name}') -- \
  bash -c "provider-services tx market bid close \
    --owner <owner-address> \
    --dseq <dseq> \
    --oseq 1 \
    --gseq 1 \
    -y"
```

### Step 3: Verify Provider Health

Watch provider logs to ensure bidding continues normally:

```bash
kubectl -n akash-services logs -l app=akash-provider --tail=100 -f | \
  grep -Ev "running check|check result|cluster resources|service available replicas below target"
```

### Restart Provider if Needed

If account sequence mismatches occur, restart the provider:

```bash
kubectl -n akash-services delete pods -l app=akash-provider
```

---

## Related Resources

- [Provider Status & Monitoring](/docs/for-providers/operations/monitoring)
- [Provider Logs](/docs/for-providers/operations/monitoring#provider-logs)
- [Provider Verification](/docs/for-providers/operations/provider-verification)

