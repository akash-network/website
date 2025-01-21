---
categories: ["Providers"]
tags: []
weight: 2
title: "Akash Provider FAQ and Guide"
linkTitle: "Akash Provider FAQ and Guide"
---

Use the techniques detailed in this guide to verify Akash Provider functionality and troubleshoot issues as they appear.

The guide is broken down into the following categories:

- [Provider Maintenance](#provider-maintenance)
- [How to terminate the workload from the Akash Provider using CLI](#how-to-terminate-the-workload-from-the-akash-provider-using-cli)
- [Provider Logs](#provider-logs)
- [Provider Status and General Info](#provider-status-and-general-info)
- [Provider Lease Management](#provider-lease-management)
- [Provider Manifests](#provider-manifests)
- [Provider Earnings](#provider-earnings)
- [Dangling Deployments](#dangling-deployments)
- [Heal Broken Deployment Replicas by Returning Lost command to Manifests](#heal-broken-deployment-replicas-by-returning-lost-command-to-manifests)
- [Maintaining and Rotating Kubernetes/etcd Certificates: A How-To Guide](#maintaining-and-rotating-kubernetes-etcd-certificates-a-how-to-guide)
- [Force New ReplicaSet Workaround](#force-new-replicaset-workaround)
- [Kill Zombie Processes](#kill-zombie-processes)
- [Close Leases Based on Image](#close-leases-based-on-image)
- [Provider Bid Script Migration for GPU Model Pricing](#provider-bid-script-migration---gpu-models)
- [GPU Provider Troubleshooting](#gpu-provider-troubleshooting)

## Provider Maintenance

### Stop Provider Services Prior to Maintenance

When conducting maintenance on your Akash Provider, ensure the `akash-provider` service is stopped during the maintenance period.

> An issue exist currently in which provider leases may be lost during maintenance activities if the `akash-provider` service is not stopped prior. This issue is detailed further [here](https://github.com/akash-network/provider/issues/64).

#### Steps to Stop the `akash-provider` Service

```
kubectl -n akash-services get statefulsets
kubectl -n akash-services scale statefulsets akash-provider --replicas=0
```

#### Steps to Verify the `akash-provider` Service Has Been Stopped

```
kubectl -n akash-services get statefulsets
kubectl -n akash-services get pods -l app=akash-provide
```

#### Steps to Start the `akash-provider` Service Post Maintenance

```
kubectl -n akash-services scale statefulsets akash-provider --replicas=1
```

## How to terminate the workload from the Akash Provider using CLI

#### Impact of Steps Detailed in the K8s Cluster

- Steps outlined in this section will terminate the deployment in K8s cluster and remove the manifest.
- Providers can close the bid to get the provider escrow back.
- Closing the bid will terminate the associated application running on the provider.
- Closing the bid closes the lease (payment channel), meaning the tenant won't get any further charge for the deployment from the moment the bid is closed.
- Providers cannot close the deployment orders. Only the tenants can close deployment orders and only then would the deployment escrow be returned to the tenant.

#### Impact of Steps Detailed on the Blockchain

The lease will get closed and the deployment will switch from the open to paused state with the open escrow account. Use akash query deployment get CLI command to verify this of desired. The owner will still have to close his deployment (akash tx deployment close) in order to get the AKT back from the deployment's escrow account (5 AKT by default). The provider has no rights to close the user deployment on its own.

Of course you don't have to kubectl exec inside the akash-provider Pod - as detailed in this guide - you can just do the same anywhere where you have:

- Providers key
- Akash CLI tool;
- Any mainnet akash RPC node to broadcast the bid close transaction
- It is also worth noting that in some cases running the transactions from the account that is already in use (such as running akash-provider service) can cause the account sequence mismatch errors (typically when two clients are trying to issue the transaction within the same block window which is \~6.1s)

#### STEP 1 - Find the deployment you want to close

```
root@node1:~# kubectl -n lease get manifest --show-labels --sort-by='.metadata.creationTimestamp'
...
5reb3l87s85t50v77sosktvdeeg6pfbnlboigoprqv3d4   26s     akash.network/lease.id.dseq=8438017,akash.network/lease.id.gseq=1,akash.network/lease.id.oseq=1,akash.network/lease.id.owner=akash1h24fljt7p0nh82cq0za0uhsct3sfwsfu9w3c9h,akash.network/lease.id.provider=akash1nxq8gmsw2vlz3m68qvyvcf3kh6q269ajvqw6y0,akash.network/namespace=5reb3l87s85t50v77sosktvdeeg6pfbnlboigoprqv3d4,akash.network=true
```

#### STEP 2 - Close the bid

```
kubectl -n akash-services exec -i $(kubectl -n akash-services get pods -l app=akash-provider --output jsonpath='{.items[0].metadata.name}') -- bash -c "provider-services tx market bid close --owner akash1h24fljt7p0nh82cq0za0uhsct3sfwsfu9w3c9h --dseq 8438017 --oseq 1 --gseq 1 -y"
```

#### STEP 3 - Verification

- To make sure your provider is working well, you can watch the logs while trying to deploy something there, to make sure it bids (i.e. broadcasts the tx on the network)

```
kubectl -n akash-services logs -l app=akash-provider --tail=100 -f | grep -Ev "running check|check result|cluster resources|service available replicas below target"
```

_**Example/Expected Messages**_

```
I[2022-11-11|12:09:10.778] Reservation fulfilled                        module=bidengine-order order=akash1h24fljt7p0nh82cq0za0uhsct3sfwsfu9w3c9h/8438017/1/1
D[2022-11-11|12:09:11.436] submitting fulfillment                       module=bidengine-order order=akash1h24fljt7p0nh82cq0za0uhsct3sfwsfu9w3c9h/8438017/1/1 price=21.000000000000000000uakt
I[2022-11-11|12:09:11.451] broadcast response                           cmp=client/broadcaster response="code: 0\ncodespace: \"\"\ndata: \"\"\nevents: []\ngas_used: \"0\"\ngas_wanted: \"0\"\nheight: \"0\"\ninfo: \"\"\nlogs: []\nraw_log: '[]'\ntimestamp: \"\"\ntx: null\ntxhash: AF7E9AB65B0200B0B8B4D9934C019F8E07FAFB5C396E82DA582F719A1FA15C14\n" err=null
I[2022-11-11|12:09:11.451] bid complete                                 module=bidengine-order order=akash1h24fljt7p0nh82cq0za0uhsct3sfwsfu9w3c9h/8438017/1/1
```

- To ensure, you can always bounce the provider service which will have no impact on active workloads

```
kubectl -n akash-services delete pods -l app=akash-provider
```

## Provider Logs

The commands in this section peer into the provider’s logs and may be used to verify possible error conditions on provider start up and to ensure provider order receipt/bid process completion steps.

### Command Template

Issue the commands in this section from a control plane node within the Kubernetes cluster or a machine that has kubectl communication with the cluster.

```
kubectl logs <pod-name> -n akash-services
```

### Example Command Use

- Using the example command syntax we will list the last ten entries in Provider logs and enter a live streaming session of new logs generated

```
kubectl -n akash-services logs $(kubectl -n akash-services get pods -l app=akash-provider --output jsonpath='{.items[-1].metadata.name}') --tail=10 -f
```

### Example Output

- Note within the example the receipt of a deployment order with a DSEQ of 5949829
- The sequence shown from `order-detected` thru reservations thru `bid-complete` provides an example of what we would expect to see when an order is received by the provider
- The order receipt is one of many events sequences that can be verified within provider logs

```
kubectl -n akash-services logs $(kubectl -n akash-services get pods -l app=akash-provider --output jsonpath='{.items[-1].metadata.name}') --tail=10 -f

I[2022-05-19|17:20:42.069] syncing sequence                             cmp=client/broadcaster local=22 remote=22
I[2022-05-19|17:20:52.069] syncing sequence                             cmp=client/broadcaster local=22 remote=22
I[2022-05-19|17:21:02.068] syncing sequence                             cmp=client/broadcaster local=22 remote=22
D[2022-05-19|17:21:10.983] cluster resources                            module=provider-cluster cmp=service cmp=inventory-service dump="{\"nodes\":[{\"name\":\"node1\",\"allocatable\":{\"cpu\":1800,\"memory\":3471499264,\"storage_ephemeral\":46663523866},\"available\":{\"cpu\":780,\"memory\":3155841024,\"storage_ephemeral\":46663523866}},{\"name\":\"node2\",\"allocatable\":{\"cpu\":1900,\"memory\":3739934720,\"storage_ephemeral\":46663523866},\"available\":{\"cpu\":1295,\"memory\":3204544512,\"storage_ephemeral\":46663523866}}],\"total_allocatable\":{\"cpu\":3700,\"memory\":7211433984,\"storage_ephemeral\":93327047732},\"total_available\":{\"cpu\":2075,\"memory\":6360385536,\"storage_ephemeral\":93327047732}}\n"
I[2022-05-19|17:21:12.068] syncing sequence                             cmp=client/broadcaster local=22 remote=22
I[2022-05-19|17:21:22.068] syncing sequence                             cmp=client/broadcaster local=22 remote=22
I[2022-05-19|17:21:29.391] order detected                               module=bidengine-service order=order/akash1ggk74pf9avxh3llu30yfhmr345h2yrpf7c2cdu/5949829/1/1
I[2022-05-19|17:21:29.495] group fetched                                module=bidengine-order order=akash1ggk74pf9avxh3llu30yfhmr345h2yrpf7c2cdu/5949829/1/1
I[2022-05-19|17:21:29.495] requesting reservation                       module=bidengine-order order=akash1ggk74pf9avxh3llu30yfhmr345h2yrpf7c2cdu/5949829/1/1
D[2022-05-19|17:21:29.495] reservation requested                        module=provider-cluster cmp=service cmp=inventory-service order=akash1ggk74pf9avxh3llu30yfhmr345h2yrpf7c2cdu/5949829/1/1 resources="group_id:<owner:\"akash1ggk74pf9avxh3llu30yfhmr345h2yrpf7c2cdu\" dseq:5949829 gseq:1 > state:open group_spec:<name:\"akash\" requirements:<signed_by:<> attributes:<key:\"host\" value:\"akash\" > > resources:<resources:<cpu:<units:<val:\"100\" > > memory:<quantity:<val:\"2686451712\" > > storage:<name:\"default\" quantity:<val:\"268435456\" > > endpoints:<> > count:1 price:<denom:\"uakt\" amount:\"10000000000000000000000\" > > > created_at:5949831 "
D[2022-05-19|17:21:29.495] reservation count                            module=provider-cluster cmp=service cmp=inventory-service cnt=1
I[2022-05-19|17:21:29.495] Reservation fulfilled                        module=bidengine-order order=akash1ggk74pf9avxh3llu30yfhmr345h2yrpf7c2cdu/5949829/1/1
D[2022-05-19|17:21:29.496] submitting fulfillment                       module=bidengine-order order=akash1ggk74pf9avxh3llu30yfhmr345h2yrpf7c2cdu/5949829/1/1 price=4.540160000000000000uakt
I[2022-05-19|17:21:29.725] broadcast response                           cmp=client/broadcaster response="code: 0\ncodespace: \"\"\ndata: \"\"\nevents: []\ngas_used: \"0\"\ngas_wanted: \"0\"\nheight: \"0\"\ninfo: \"\"\nlogs: []\nraw_log: '[]'\ntimestamp: \"\"\ntx: null\ntxhash: AFCA8D4A900A62D961F4AB82B607749FFCA8C10E2B0486B89A8416B74593DBFA\n" err=null
I[2022-05-19|17:21:29.725] bid complete                                 module=bidengine-order order=akash1ggk74pf9avxh3llu30yfhmr345h2yrpf7c2cdu/5949829/1/1
I[2022-05-19|17:21:32.069] syncing sequence                             cmp=client/broadcaster local=23 remote=22
```

## Provider Status and General Info

Use the verifications included in this section for the following purposes:

- [Determine Provider Status](#provider-status)
- [Review Provider Configuration](#provider-configuration-review)
- [Current Versions of Provider's Akash and Kubernetes Installs](#current-versions-of-providers-akash-and-kubernetes-installs)&#x20;

### Provider Status

Obtain live Provider status including:

- Number of active leases
- Active leases and hard consumed by those leases
- Available resources on a per node basis

#### Command Template

Issue the commands in this section from any machine that has the [Akash CLI ](/docs/deployments/akash-cli/installation/)installed.

```
provider-services status <provider-address>
```

#### Example Command Use

```
provider-services status akash1q7spv2cw06yszgfp4f9ed59lkka6ytn8g4tkjf
```

#### Example Output

```
provider-services status akash1wxr49evm8hddnx9ujsdtd86gk46s7ejnccqfmy
{
  "cluster": {
    "leases": 3,
    "inventory": {
      "active": [
        {
          "cpu": 8000,
          "memory": 8589934592,
          "storage_ephemeral": 5384815247360
        },
        {
          "cpu": 100000,
          "memory": 450971566080,
          "storage_ephemeral": 982473768960
        },
        {
          "cpu": 8000,
          "memory": 8589934592,
          "storage_ephemeral": 2000000000000
        }
      ],
      "available": {
        "nodes": [
          {
            "cpu": 111495,
            "memory": 466163988480,
            "storage_ephemeral": 2375935850345
          },
          {
            "cpu": 118780,
            "memory": 474497601536,
            "storage_ephemeral": 7760751097705
          },
          {
            "cpu": 110800,
            "memory": 465918152704,
            "storage_ephemeral": 5760751097705
          },
          {
            "cpu": 19525,
            "memory": 23846356992,
            "storage_ephemeral": 6778277328745
          }
        ]
      }
    }
  },
  "bidengine": {
    "orders": 0
  },
  "manifest": {
    "deployments": 0
  },
  "cluster_public_hostname": "provider.bigtractorplotting.com"
}
```

## Provider Configuration Review

Review the Provider’s attribute, and Host URI with the status command

### Command Template

Issue the commands in this section from any machine that has the [Akash CLI](/docs/deployments/akash-cli/installation/) installed.

```
provider-services query provider get <akash-address>
```

### Example Command Use

```
provider-services query provider get <address>
```

### Example Output

```
attributes:
- key: capabilities/storage/1/class
  value: default
- key: capabilities/storage/1/persistent
  value: "true"
- key: capabilities/storage/2/class
  value: beta2
- key: capabilities/storage/2/persistent
  value: "true"
- key: host
  value: akash
- key: organization
  value: akash.network
- key: region
  value: us-west
- key: tier
  value: community
- key: provider
  value: "1"
- key: chia-plotting
  value: "true"
host_uri: https://provider.mainnet-1.ca.aksh.pw:8443
info:
  email: ""
  website: ""
owner: akash1q7spv2cw06yszgfp4f9ed59lkka6ytn8g4tkjf
```

### Current Versions of Provider's Akash and Kubernetes Installs

- Command may be issued from any source with internet connectivity

```
curl -sk https://provider.mainnet-1.ca.aksh.pw:8443/version | jq,
```

### Provider Lease Management

Use the verifications included in this section for the following purposes:

- [List Provider Active Leases](#list-provider-active-leases)
- [List Active Leases from Hostname Operator Perspective](#list-active-leases-from-hostname-operator-perspective)
- [Provider Side Lease Closure](#provider-side-lease-closure)
- [Ingress Controller Verifications](#ingress-controller-verifications)

### List Provider Active Leases

#### Command Template

Issue the commands in this section from any machine that has the [Akash CLI](/docs/deployments/akash-cli/installation/) installed.

```
provider-services query market lease list --provider <provider-address> --gseq 0 --oseq 0 --page 1 --limit 500 --state active
```

#### Example Command Use

```
provider-services query market lease list --provider akash1yvu4hhnvs84v4sv53mzu5ntf7fxf4cfup9s22j --gseq 0 --oseq 0 --page 1 --limit 500 --state active
```

#### Example Output

```
leases:
- escrow_payment:
    account_id:
      scope: deployment
      xid: akash19gs08y80wlk5wl4696wz82z2wrmjw5c84cvw28/5903794
    balance:
      amount: "0.455120000000000000"
      denom: uakt
    owner: akash1q7spv2cw06yszgfp4f9ed59lkka6ytn8g4tkjf
    payment_id: 1/1/akash1q7spv2cw06yszgfp4f9ed59lkka6ytn8g4tkjf
    rate:
      amount: "24.780240000000000000"
      denom: uakt
    state: open
    withdrawn:
      amount: "32536"
      denom: uakt
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

### List Active Leases from Hostname Operator Perspective

##### **Command Syntax**

Issue the commands in this section from a control plane node within the Kubernetes cluster or a machine that has the kubectl communication with the cluster.

```
kubectl -n lease get providerhosts
```

##### **Example Output**

```
NAME                                                  AGE
gtu5bo14f99elel76srrbj04do.ingress.akashtesting.xyz   60m
kbij2mvdlhal5dgc4pc7171cmg.ingress.akashtesting.xyz   18m
```

### Provider Side Lease Closure

#### **Command Template**

Issue the commands in this section from a control plane node within the Kubernetes cluster or a machine that has the kubectl communication with the cluster.

```
provider-services tx market bid close --node $AKASH_NODE --chain-id $AKASH_CHAIN_ID --owner <TENANT-ADDRESS> --dseq $AKASH_DSEQ --gseq 1 --oseq 1 --from <PROVIDER-ADDRESS> --keyring-backend $AKASH_KEYRING_BACKEND -y --gas-prices="0.0025uakt" --gas="auto" --gas-adjustment=1.15
```

#### Example Command Use

```
provider-services tx market bid close --node $AKASH_NODE --chain-id akashnet-2 --owner akash1n44zc8l6gfm0hpydldndpg8n05xjjwmuahc6nn --dseq 5905802 --gseq 1 --oseq 1 --from akash1yvu4hhnvs84v4sv53mzu5ntf7fxf4cfup9s22j --keyring-backend os -y --gas-prices="0.0025uakt" --gas="auto" --gas-adjustment=1.15
```

#### **Example Output (Truncated)**

```
{"height":"5906491","txhash":"0FC7DA74301B38BC3DF2F6EBBD2020C686409CE6E973E25B4E8F0F1B83235473","codespace":"","code":0,"data":"0A230A212F616B6173682E6D61726B65742E763162657461322E4D7367436C6F7365426964","raw_log":"[{\"events\":[{\"type\":\"akash.v1\",\"attributes\":[{\"key\":\"module\",\"value\":\"deployment\"},{\"key\":\"action\",\"value\":\"group-paused\"},{\"key\":\"owner\",\"value\":\"akash1n44zc8l6gfm0hpydldndpg8n05xjjwmuahc6nn\"},{\"key\":\"dseq\",\"value\":\"5905802\"},{\"key\":\"gseq\",\"value\":\"1\"},{\"key\":\"module\",\"value\":\"market\"},{\"key\":\"action\",\"value\":\"lease-closed\"}
```

### Ingress Controller Verifications

#### Example Command Use

Issue the commands in this section from a control plane node within the Kubernetes cluster or a machine that has the kubectl communication with the cluster.

```
kubectl get ingress -A
```

#### Example Output

- **NOTE -** in this example output the last entry (with namespace moc58fca3ccllfrqe49jipp802knon0cslo332qge55qk) represents an active deployment on the provider

```
NAMESPACE                                       NAME                                                  CLASS                 HOSTS                                                 ADDRESS                   PORTS   AGE

moc58fca3ccllfrqe49jipp802knon0cslo332qge55qk   5n0vp4dmbtced00smdvb84ftu4.ingress.akashtesting.xyz   akash-ingress-class   5n0vp4dmbtced00smdvb84ftu4.ingress.akashtesting.xyz   10.0.10.122,10.0.10.236   80      70s
```

## Provider Manifests

Use the verifications included in this section for the following purposes:

- [Retrieve Active Manifest List From Provider](#retrieve-active-manifest-list-from-provider)
- [Retrieve Manifest Detail From Provider](#retrieve-manifest-detail-from-provider)

### Retrieve Active Manifest List From Provider

#### **Command Syntax**

Issue the commands in this section from a control plane node within the Kubernetes cluster or a machine that has kubectl communication with the cluster.

```
kubectl -n lease get manifests --show-labels
```

#### Example Output

- The show-labels options includes display of associated DSEQ / OSEQ / GSEQ / Owner labels

```
kubectl -n lease get manifests --show-labels

NAME                                            AGE   LABELS
h644k9qp92e0qeakjsjkk8f3piivkuhgc6baon9tccuqo   26h   akash.network/lease.id.dseq=5950031,akash.network/lease.id.gseq=1,akash.network/lease.id.oseq=1,akash.network/lease.id.owner=akash15745vczur53teyxl4k05u250tfvp0lvdcfqx27,akash.network/lease.id.provider=akash1xmz9es9ay9ln9x2m3q8dlu0alxf0ltce7ykjfx,akash.network/namespace=h644k9qp92e0qeakjsjkk8f3piivkuhgc6baon9tccuqo,akash.network=true
```

### Retrieve Manifest Detail From Provider

#### Command Template

Issue the commands in this section from a control plane node within the Kubernetes cluster or a machine that has kubectl communication with the cluster.

```
kubectl -n lease get manifest <namespace> -o yaml
```

#### Example Command Use

- **Note -** use the \`kubectl get ingress -A\` covered in this guide to lookup the namespace of the deployment of interest

```
kubectl -n lease get manifest moc58fca3ccllfrqe49jipp802knon0cslo332qge55qk -o yaml
```

#### Example Output

```
apiVersion: akash.network/v2beta1
kind: Manifest
metadata:
  creationTimestamp: "2022-05-16T14:42:29Z"
  generation: 1
  labels:
    akash.network: "true"
    akash.network/lease.id.dseq: "5905802"
    akash.network/lease.id.gseq: "1"
    akash.network/lease.id.oseq: "1"
    akash.network/lease.id.owner: akash1n44zc8l6gfm0hpydldndpg8n05xjjwmuahc6nn
    akash.network/lease.id.provider: akash1yvu4hhnvs84v4sv53mzu5ntf7fxf4cfup9s22j
    akash.network/namespace: moc58fca3ccllfrqe49jipp802knon0cslo332qge55qk
  name: moc58fca3ccllfrqe49jipp802knon0cslo332qge55qk
  namespace: lease
  resourceVersion: "75603"
  uid: 81fc7e4f-9091-44df-b4cf-5249ddd4863d
spec:
  group:
    name: akash
    services:
    - count: 1
      expose:
      - external_port: 80
        global: true
        http_options:
          max_body_size: 1048576
          next_cases:
          - error
          - timeout
          next_tries: 3
          read_timeout: 60000
          send_timeout: 60000
        port: 8080
        proto: TCP
      image: pengbai/docker-supermario
      name: supermario
      unit:
        cpu: 100
        memory: "268435456"
        storage:
        - name: default
          size: "268435456"
  lease_id:
    dseq: "5905802"
    gseq: 1
    oseq: 1
    owner: akash1n44zc8l6gfm0hpydldndpg8n05xjjwmuahc6nn
    provider: akash1yvu4hhnvs84v4sv53mzu5ntf7fxf4cfup9s22j
```

### Provider Earnings

Use the verifications included in this section for the following purposes:

- [Provider Earnings History](#provider-earnings-history)
- [AKT Total Earned by Provider](#akt-total-earned-by-provider)
- [AKT Total Earning Potential Per Active Deployment](#akt-total-earning-potential-per-active-deployment)
- [Current Leases: Withdrawn vs Consumed](#current-leases-withdrawn-vs-consumed)

### Provider Earnings History

Use the commands detailed in this section to gather the daily earnings history of your provider

#### Command Template

- Only the following variables need update in the template for your use:
  - AKASH_NODE - populate value with the address of your RPC node
  - PROVIDER - populate value with your provider address

```
export AKASH_NODE=<your-RPC-node-address>

PROVIDER=<your-provider-address>; STEP=23.59; BLOCK_TIME=6; HEIGHT=$(provider-services query block | jq -r '.block.header.height'); for i in $(seq 0 23); do BLOCK=$(echo "scale=0; ($HEIGHT-((60/$BLOCK_TIME)*60*($i*$STEP)))/1" | bc); HT=$(provider-services query block $BLOCK | jq -r '.block.header.time'); AL=$(provider-services query market lease list --height $BLOCK --provider $PROVIDER --gseq 0 --oseq 0 --page 1 --limit 200 --state active -o json | jq -r '.leases | length'); DCOST=$(provider-services query market lease list --height $BLOCK --provider $PROVIDER --gseq 0 --oseq 0 --page 1 --limit 200 -o json --state active | jq --argjson bt $BLOCK_TIME -c -r '(([.leases[].lease.price.amount // 0|tonumber] | add)*(60/$bt)*60*24)/pow(10;6)'); BALANCE=$(provider-services query bank balances --height $BLOCK $PROVIDER -o json | jq -r '.balances[] | select(.denom == "uakt") | .amount // 0|tonumber/pow(10;6)'); IN_ESCROW=$(echo "($AL * 0.5)" | bc); TOTAL=$( echo "($BALANCE+$IN_ESCROW)" | bc); printf "%8d\t%.32s\t%4d\t%12.4f\t%12.6f\t%12.4f\t%12.4f\n" $BLOCK $HT $AL $DCOST $BALANCE $IN_ESCROW $TOTAL; done
```

#### **Example Command Use**

```
PROVIDER=akash18ga02jzaq8cw52anyhzkwta5wygufgu6zsz6xc; STEP=23.59; BLOCK_TIME=6; HEIGHT=$(provider-services query block | jq -r '.block.header.height'); for i in $(seq 0 23); do BLOCK=$(echo "scale=0; ($HEIGHT-((60/$BLOCK_TIME)*60*($i*$STEP)))/1" | bc); HT=$(provider-services query block $BLOCK | jq -r '.block.header.time'); AL=$(provider-services query market lease list --height $BLOCK --provider $PROVIDER --gseq 0 --oseq 0 --page 1 --limit 200 --state active -o json | jq -r '.leases | length'); DCOST=$(provider-services query market lease list --height $BLOCK --provider $PROVIDER --gseq 0 --oseq 0 --page 1 --limit 200 -o json --state active | jq --argjson bt $BLOCK_TIME -c -r '(([.leases[].lease.price.amount // 0|tonumber] | add)*(60/$bt)*60*24)/pow(10;6)'); BALANCE=$(provider-services query bank balances --height $BLOCK $PROVIDER -o json | jq -r '.balances[] | select(.denom == "uakt") | .amount // 0|tonumber/pow(10;6)'); IN_ESCROW=$(echo "($AL * 0.5)" | bc); TOTAL=$( echo "($BALANCE+$IN_ESCROW)" | bc); printf "%8d\t%.32s\t%4d\t%12.4f\t%12.6f\t%12.4f\t%12.4f\n" $BLOCK $HT $AL $DCOST $BALANCE $IN_ESCROW $TOTAL; done
```

#### Example Output

- Column Headers

```
block height, timestamp, active leases, daily earning, balance, AKT in escrow, total balance (AKT in escrow + balance)
```

- Output generated from `Example Command Use`

```
 6514611	2022-06-28T15:32:53.445887205Z	  52	    142.8624	 1523.253897	 260	   1783.2539
 6500457	2022-06-27T15:56:52.370736803Z	  61	    190.8000	 1146.975982	 305	   1451.9760
 6486303	2022-06-26T15:25:08.727479091Z	  38	    116.9280	 1247.128473	 190	   1437.1285
 6472149	2022-06-25T15:18:50.058601546Z	  39	    119.3184	 1211.060233	 195	   1406.0602
 6457995	2022-06-24T15:17:19.284205728Z	  56	    186.8688	 1035.764462	 280	   1315.7645
 6443841	2022-06-23T14:51:42.110369321Z	  50	    182.6352	 1005.680589	 250	   1255.6806
 6429687	2022-06-22T14:58:52.656092131Z	  36	    120.3984	  962.763599	 180	   1142.7636
 6415533	2022-06-21T15:04:57.22739534Z	  29	    226.7568	  837.161130	 145	    982.1611
 6401379	2022-06-20T15:08:17.114891411Z	   8	     57.5136	  760.912627	  40	    800.9126
 6387225	2022-06-19T15:12:16.883456449Z	   6	     53.9856	  697.260245	  30	    727.2602
 6373071	2022-06-18T15:16:16.007190056Z	   6	    257.1696	  635.254956	  30	    665.2550
 6358917	2022-06-17T15:20:52.671364197Z	   5	     33.2208	  560.532818	  25	    585.5328
```

### AKT Total Earned by Provider

Use the commands detailed in this section to gather the total earnings of your provider&#x20;

#### Command Template

Issue the commands in this section from any machine that has the [Akash CLI ](/docs/deployments/akash-cli/installation/)installed.

- **Note** - ensure queries are not limited only to leases created by your account by issuing `unset AKASH_FROM` prior to the `akash query market` command execution

```
provider-services query market lease list --provider <PROVIDER-ADDRESS> --page 1 --limit 1000 -o json | jq -r '([.leases[].escrow_payment.withdrawn.amount|tonumber] | add) / pow(10;6)'
```

#### **Example Command Use**

```
provider-services query market lease list --provider akash1yvu4hhnvs84v4sv53mzu5ntf7fxf4cfup9s22j --page 1 --limit 1000 -o json | jq -r '([.leases[].escrow_payment.withdrawn.amount|tonumber] | add) / pow(10;6)'
```

#### Example Output

```
8.003348
```

### AKT Total Earning Potential Per Active Deployment

#### Legend for Command Syntax

In the equations used in the calculation of earning potential, several figures are used that are indeed not static.&#x20;

For accurate earning potential based on today's actual financial/other realities, consider if the following numbers should be updated prior to command execution.

##### Figures in Current Command Syntax

- 1.79 price of 1 AKT in USD
- 6.088 block time (current available via: [https://mintscan.io/akash](https://mintscan.io/akash))
- 30.436875 used as the average number of days in a month

#### Command Syntax

Issue the commands in this section from any machine that has the [Akash CLI](/docs/deployments/akash-cli/installation/) installed.

**Note** - ensure queries are not limited only to leases created by your account by issuing `unset AKASH_FROM` prior to the `akash query market` command execution

```
provider-services query market lease list --provider <PROVIDER-ADDRESS> --gseq 0 --oseq 0 --page 1 --limit 100 --state active -o json | jq -r '["owner","dseq","gseq","oseq","rate","monthly","USD"], (.leases[] | [(.lease.lease_id | .owner, .dseq, .gseq, .oseq), (.escrow_payment | .rate.amount, (.rate.amount|tonumber), (.rate.amount|tonumber))]) | @csv' | awk -F ',' '{if (NR==1) {$1=$1; printf $0"\n"} else {$6=(($6*((60/6.088)*60*24*30.436875))/10^6); $7=(($7*((60/6.088)*60*24*30.436875))/10^6)*1.79; print $0}}' | column -t
```

#### Example Command Use

```
provider-services query market lease list --provider akash1yvu4hhnvs84v4sv53mzu5ntf7fxf4cfup9s22j --gseq 0 --oseq 0 --page 1 --limit 100 --state active -o json | jq -r '["owner","dseq","gseq","oseq","rate","monthly","USD"], (.leases[] | [(.lease.lease_id | .owner, .dseq, .gseq, .oseq), (.escrow_payment | .rate.amount, (.rate.amount|tonumber), (.rate.amount|tonumber))]) | @csv' | awk -F ',' '{if (NR==1) {$1=$1; printf $0"\n"} else {$6=(($6*((60/6.088)*60*24*30.436875))/10^6); $7=(($7*((60/6.088)*60*24*30.436875))/10^6)*1.79; print $0}}' | column -t
```

#### Example Output

```
"owner"                                         "dseq"     "gseq"  "oseq"  "rate"                  "monthly"  "USD"

"akash1n44zc8l6gfm0hpydldndpg8n05xjjwmuahc6nn"  "5850047"  1       1       "4.901120000000000000"  1.92197    3.44032
"akash1n44zc8l6gfm0hpydldndpg8n05xjjwmuahc6nn"  "5850470"  1       1       "2.901120000000000000"  1.13767    2.03643
```

### Current Leases: Withdrawn vs Consumed

Use the commands detailed in this section to compare the amount of AKT consumed versus the amount of AKT withdrawn per deployment. This review will ensure that withdraw of consumed funds is occurring as expected.

#### Command Syntax

Only the following variables need update in the template for your use:

- AKASH_NODE - populate value with the address of your RPC node
- PROVIDER - populate value with your provider address

```
export AKASH_NODE=<your-RPC-node-address>

PROVIDER=<your-provider-address>; HEIGHT=$(provider-services query block | jq -r '.block.header.height'); provider-services query market lease list --height $HEIGHT --provider $PROVIDER --gseq 0 --oseq 0 --page 1 --limit 10000 --state active -o json | jq --argjson h $HEIGHT -r '["owner","dseq/gseq/oseq","rate","monthly","withdrawn","consumed","days"], (.leases[] | [(.lease.lease_id | .owner, (.dseq|tostring) + "/" + (.gseq|tostring) + "/" + (.oseq|tostring)), (.escrow_payment | (.rate.amount|tonumber), (.rate.amount|tonumber), (.withdrawn.amount|tonumber)), (($h-(.lease.created_at|tonumber))*(.escrow_payment.rate.amount|tonumber)/pow(10;6)), (($h-(.lease.created_at|tonumber))/((60/6)*60*24))]) | @csv' | awk -F ',' '{if (NR==1) {$1=$1; printf $0"\n"} else {block_time=6; rate_akt=(($4*((60/block_time)*60*24*30.436875))/10^6); $4=rate_akt; withdrawn_akt=($5/10^6); $5=withdrawn_akt; $6; $7; print $0}}' | column -t
```

#### Example Command Use

```
PROVIDER=akash18ga02jzaq8cw52anyhzkwta5wygufgu6zsz6xc; HEIGHT=$(provider-services query block | jq -r '.block.header.height'); provider-services query market lease list --height $HEIGHT --provider $PROVIDER --gseq 0 --oseq 0 --page 1 --limit 10000 --state active -o json | jq --argjson h $HEIGHT -r '["owner","dseq/gseq/oseq","rate","monthly","withdrawn","consumed","days"], (.leases[] | [(.lease.lease_id | .owner, (.dseq|tostring) + "/" + (.gseq|tostring) + "/" + (.oseq|tostring)), (.escrow_payment | (.rate.amount|tonumber), (.rate.amount|tonumber), (.withdrawn.amount|tonumber)), (($h-(.lease.created_at|tonumber))*(.escrow_payment.rate.amount|tonumber)/pow(10;6)), (($h-(.lease.created_at|tonumber))/((60/6)*60*24))]) | @csv' | awk -F ',' '{if (NR==1) {$1=$1; printf $0"\n"} else {block_time=6; rate_akt=(($4*((60/block_time)*60*24*30.436875))/10^6); $4=rate_akt; withdrawn_akt=($5/10^6); $5=withdrawn_akt; $6; $7; print $0}}' | column -t
```

#### Example Output

```
"owner"                                         "dseq/gseq/oseq"  "rate"  "monthly"  "withdrawn"  "consumed"  "days"
"akash1zrce7fke2pxmnrwlwdjxcgyfcz43vljw5tekr2"  "6412884/1/1"     23      10.0807    2.33866      2.358627    7.121458333333333
"akash1ynq8anzujggr7w38dltlx3u77le3z3ru3x9vez"  "6443412/1/1"     354     155.155    25.1846      25.49154    5.000694444444444
"akash1y48wwg95plz4ht5sakdqg5st8pmeuuljw6y9tc"  "6503695/1/1"     45      19.7231    0.488925     0.527895    0.8146527777777778
"akash1ga6xuntfwsqrutv9dwz4rjcy5h8efn7yw6dywu"  "6431684/1/1"     66      28.9272    5.47028      5.527302    5.815763888888889
"akash1f9mn3dhajkcrqxzk5c63kzka7t9tur3xehrn2r"  "6426723/1/1"     69      30.2421    6.06048      6.120024    6.1594444444444445
"akash12r63l4ldjvjqmagmq9fe82r78cqent5hucyg48"  "6496087/1/1"     114     49.9652    2.10661      2.204874    1.343125
"akash12r63l4ldjvjqmagmq9fe82r78cqent5hucyg48"  "6496338/1/1"     98      42.9525    1.78683      1.871212    1.3259722222222223
"akash1tfj0hh6h0zqak0fx7jhhjyc603p7d7y4xmnlp3"  "6511999/1/1"     66      28.9272    0.169422     0.226182    0.23798611111111112
```

## Dangling Deployments

As part of routine Akash Provider maintenance it is a good idea to ensure that there are no "dangling deployments" in your provider's Kubernetes cluster.

We define a "dangling deployment" as a scenario in which the lease for a deployment was closed but due to a communication issue the associated deployment in Kubernetes is not closed. Vice versa applies too, where the dangling deployment could sit active on the chain but not on the provider. This should be a rare circumstance but we want to cleanse the provider of any such "dangling deployments" from time to time.

Please use this [Dangling Deployment Script](https://gist.github.com/andy108369/f211bf6c06f2a6e3635b20bdfb9f0fca) to both discover and close any such deployments.

### Heal Broken Deployment Replicas by Returning Lost command to Manifests

Prior to the `provider` version `0.2.1` (`akash/provider helm-chart version 4.2.0`) there was an issue which was affecting some deployments.

#### Issue

&#x20;The deployments with the `command` explicitly set in their SDL manifest files were losing it upon `akash-provider` pod/service restart.

This was leading to their replica pods running in `CrashLoopBackOff` state on the provider side reserving additional resources, while the original replica was still running which was not visible to the client.

#### Impact

- Double amount of the resources are being occupied by the deployment on the provider side
- Manifests of these deployments are missing the command

The good news is that both issues can be fixed without the customer intervention.

Once you have updated your provider to 0.2.1 version or greater following the instructions, you can patch the manifests with the correct command which will get rid of the deployments left in `CrashLoopBackOff` state.

**STEP1** - Backup manifests

Before patching the manifests, please make sure to back them up.

```
mkdir before
cd before
for i in manifests providerhosts providerleasedips; do kubectl -n lease get $i -o yaml > $i-backup.yaml; done
```

They can help in troubleshooting the issues should any arise later.

**STEP2** - Collect the deployments which are affected by the lost command issue

```
kubectl get deployment -l akash.network/manifest-service -A -o=jsonpath='{range .items[*]}{.metadata.namespace} {.metadata.name}{"\n"}{end}' |
  while read ns app; do
    kubectl -n $ns rollout status --timeout=60s deployment/${app} >/dev/null 2>&1
    rc=$?
    if [[ $rc -ne 0 ]]; then
      kubectl -n $ns rollout history deployment/${app} -o json |
        jq -r '[(.metadata | .annotations."deployment.kubernetes.io/revision", .namespace, .name), (.spec.template.spec.containers[0].command|tostring)] | @tsv'
      echo
     fi
   done
```

_**Example Output:**_

> revision, namespace, pod, command

```
3	2anv3d7diieucjlga92fk8e5ej12kk8vmtkpi9fpju79a	cloud-sql-proxy-7bfb55ddb	["sh","-c"]
4	2anv3d7diieucjlga92fk8e5ej12kk8vmtkpi9fpju79a	cloud-sql-proxy-57c8f9ff48	null

3	2dl4vdk2f7ia1m0vme8nqkv0dadnnj15becr5pmfu9j22	cloud-sql-proxy-7dc7f5b856	["sh","-c"]
4	2dl4vdk2f7ia1m0vme8nqkv0dadnnj15becr5pmfu9j22	cloud-sql-proxy-864fd4cff4	null

1	2k83g8gstuugse0952arremk4gphib709gi7b6q6srfdo	app-78756d77ff	["bash","-c"]
2	2k83g8gstuugse0952arremk4gphib709gi7b6q6srfdo	app-578b949f48	null

7	2qpj8537lq7tiv9fabdhk8mn4j75h3anhtqb1b881fhie	cloud-sql-proxy-7c5f486d9b	["sh","-c"]
8	2qpj8537lq7tiv9fabdhk8mn4j75h3anhtqb1b881fhie	cloud-sql-proxy-6c95666bc8	null

1	b49oi05ph3bo7rdn2kvkkpk4tcigb3ts0o7sp40fcdk5o	app-b58f9bb4f	["bash","-c"]
2	b49oi05ph3bo7rdn2kvkkpk4tcigb3ts0o7sp40fcdk5o	app-6dd87bb7c6	null
3	b49oi05ph3bo7rdn2kvkkpk4tcigb3ts0o7sp40fcdk5o	app-57c67cc57d	["bash","-c"]
4	b49oi05ph3bo7rdn2kvkkpk4tcigb3ts0o7sp40fcdk5o	app-655567846f	null
```

The pods with the null commands are the bad replicas in this case, affected by the lost command issue.

You might see some pods with `null` commands for those replicas which stuck in `Pending` state because of insufficient resources on the provider, just ignore those.

They will start back again once provider regains enough capacity.

**STEP3** - Patch the manifests

```
kubectl get deployment -l akash.network/manifest-service -A -o=jsonpath='{range .items[*]}{.metadata.namespace} {.metadata.name}{"\n"}{end}' |
  while read ns app; do
    kubectl -n $ns rollout status --timeout=60s deployment/${app} >/dev/null 2>&1
    rc=$?
    if [[ $rc -ne 0 ]]; then
      command=$(kubectl -n $ns rollout history deployment/${app} -o json | jq -sMc '.[0].spec.template.spec.containers[0].command | select(length > 0)')
      if [[ $command != "null" && ! -z $command ]]; then
        index=$(kubectl -n lease get manifests $ns -o json | jq --arg app $app -r '[.spec.group.services[]] | map(.name == $app) | index(true)')
        if [[ $index == "null" || -z $index ]]; then
          echo "Error: index=$index, skipping $ns/$app ..."
          continue
        fi
        echo "Patching manifest ${ns} to return the ${app} app its command: ${command} (index: ${index})"
        kubectl -n lease patch manifests $ns --type='json' -p='[{"op": "add", "path": "/spec/group/services/'${index}'/command", "value":'${command}'}]'

        ### to debug:  --dry-run=client -o json | jq -Mc '.spec.group.services[0].command'
        ### locate service by its name instead of using the index: kubectl -n lease get manifests $ns -o json | jq --indent 4 --arg app $app --argjson command $command -r '(.spec.group.services[] | select(.name == $app)) |= . + { command: $command }' | kubectl apply -f -
        echo
      else
        echo "Skipping ${ns}/${app} which does not use command in SDL."
      fi
     fi
   done
```

_**Example Output**_:

```
Patching manifest 2anv3d7diieucjlga92fk8e5ej12kk8vmtkpi9fpju79a to return the cloud-sql-proxy its command: ["sh","-c"]
manifest.akash.network/2anv3d7diieucjlga92fk8e5ej12kk8vmtkpi9fpju79a patched

Patching manifest 2dl4vdk2f7ia1m0vme8nqkv0dadnnj15becr5pmfu9j22 to return the cloud-sql-proxy its command: ["sh","-c"]
manifest.akash.network/2dl4vdk2f7ia1m0vme8nqkv0dadnnj15becr5pmfu9j22 patched

Patching manifest 2k83g8gstuugse0952arremk4gphib709gi7b6q6srfdo to return the app its command: ["bash","-c"]
manifest.akash.network/2k83g8gstuugse0952arremk4gphib709gi7b6q6srfdo patched

Patching manifest 2qpj8537lq7tiv9fabdhk8mn4j75h3anhtqb1b881fhie to return the cloud-sql-proxy its command: ["sh","-c"]
manifest.akash.network/2qpj8537lq7tiv9fabdhk8mn4j75h3anhtqb1b881fhie patched

Patching manifest b49oi05ph3bo7rdn2kvkkpk4tcigb3ts0o7sp40fcdk5o to return the app its command: ["bash","-c"]
manifest.akash.network/b49oi05ph3bo7rdn2kvkkpk4tcigb3ts0o7sp40fcdk5o patched
```

**STEP4** - Bounce the provider pod/service

```
kubectl -n akash-services delete pods -l app=akash-provider
```

That's all. The bad replicas will disappear on their own.

Example with one namespace:

_**Before**_:

```
0obkk0j6vdnp7qmsj477a88ml4i0639628gcn016smrg0   cloud-sql-proxy-69f75ffbdc-c5t69                                  1/1     Running            0                 20d
0obkk0j6vdnp7qmsj477a88ml4i0639628gcn016smrg0   syncer-59c447b98c-t9xv9                                           1/1     Running            36 (15h ago)      20d
0obkk0j6vdnp7qmsj477a88ml4i0639628gcn016smrg0   cloud-sql-proxy-56b5685cc7-qjvh2                                  0/1     CrashLoopBackOff   5587 (48s ago)    19d
```

_**After:**_

```
0obkk0j6vdnp7qmsj477a88ml4i0639628gcn016smrg0   cloud-sql-proxy-69f75ffbdc-c5t69                                  1/1     Running            0                  20d
0obkk0j6vdnp7qmsj477a88ml4i0639628gcn016smrg0   syncer-59c447b98c-t9xv9                                           1/1     Running            36 (15h ago)       20d
```

### Persistent Storage Deployments

- Persistent storage enabled deployments are of statefulset kind.
- These do not have replicas and thus `CrashLoopBackOff` containers.
- There is no impact, so you can skip them.
- However, if you still want to fix their manifests, then apply the following procedure

**STEP1** - Verify the statefulset deployments

Here you can ignore the "null" ones, they are normal deployments just not using the command in their SDL manifest files.

```
kubectl get statefulset -l akash.network/manifest-service -A -o=jsonpath='{range .items[*]}{.metadata.namespace} {.metadata.name}{"\n"}{end}' |
  while read ns app; do
    kubectl -n $ns get statefulset $app -o json | jq -r '[(.metadata | .namespace, .name), (.spec.template.spec.containers[0].command|tostring)] | @tsv'
    echo
   done
```

_**Example Output:**_

```
4ibg2ii0dssqtvb149thrd4a6a46g4mkcln2v70s6p20c	hnsnode	["hsd","--bip37=true","--public-host=REDACTED","--listen=true","--port=REDACTED","--max-inbound=REDACTED"]

66g95hmtta0bn8dajdcimo55glf60sne7cg8u9mv6j9l6	postgres	["sh","-c"]

esnphe9a86mmn3ibdcrncul82nnck7p4dpdj69ogu4b7o	validator	null

idr99rvt44lt6m1rp7vc1o0thpfqdqgcnfplj2a92ju86	web	null

k9ch280ud97qle6bqli9bqk65pn7h07tohmrmq88sofq2	wiki	null

tahcqnrs6dvo9ugee59q94nthgq5mm645e89cmml906m2	node	null
```

**STEP2** - Patch the manifest

```
kubectl get statefulset -l akash.network/manifest-service -A -o=jsonpath='{range .items[*]}{.metadata.namespace} {.metadata.name}{"\n"}{end}' |
  while read ns app; do
    command=$(kubectl -n $ns get statefulset $app -o json | jq -Mc '.spec.template.spec.containers[0].command')
    if [[ $command != "null" && ! -z $command ]]; then
      echo "Patching manifest ${ns} to return the ${app} its command: ${command}"
      kubectl -n lease patch manifests $ns --type='json' -p='[{"op": "add", "path": "/spec/group/services/0/command", "value":'${command}'}]'
      ## to debug:  --dry-run=client -o json | jq -Mc '.spec.group.services[0].command'
      echo
    else
      echo "Skipping ${ns}/${app} which does not use command in SDL."
    fi
   done
```

That's all. There is no need bouncing the `akash-provider` pod/service for the statefulset deployment.

### Maintaining and Rotating Kubernetes/etcd Certificates: A How-To Guide

> The following doc is based on [https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-certs/](https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-certs/) & [https://www.txconsole.com/posts/how-to-renew-certificate-manually-in-kubernetes](https://www.txconsole.com/posts/how-to-renew-certificate-manually-in-kubernetes)

When K8s certs expire, you won't be able to use your cluster. Make sure to rotate your certs proactively.

The following procedure explains how to rotate them manually.

Evidence that the certs have expired:

```
root@node1:~# kubectl get nodes -o wide
error: You must be logged in to the server (Unauthorized)
```

You can always view the certs expiration using the `kubeadm certs check-expiration` command:

```
root@node1:~# kubeadm certs check-expiration
[check-expiration] Reading configuration from the cluster...
[check-expiration] FYI: You can look at this config file with 'kubectl -n kube-system get cm kubeadm-config -o yaml'
[check-expiration] Error reading configuration from the Cluster. Falling back to default configuration

CERTIFICATE                         EXPIRES                  RESIDUAL TIME   CERTIFICATE AUTHORITY   EXTERNALLY MANAGED
admin.conf                          Feb 20, 2023 17:12 UTC   <invalid>       ca                      no
apiserver                           Mar 03, 2023 16:42 UTC   10d             ca                      no
!MISSING! apiserver-etcd-client
apiserver-kubelet-client            Feb 20, 2023 17:12 UTC   <invalid>       ca                      no
controller-manager.conf             Feb 20, 2023 17:12 UTC   <invalid>       ca                      no
!MISSING! etcd-healthcheck-client
!MISSING! etcd-peer
!MISSING! etcd-server
front-proxy-client                  Feb 20, 2023 17:12 UTC   <invalid>       front-proxy-ca          no
scheduler.conf                      Feb 20, 2023 17:12 UTC   <invalid>       ca                      no

CERTIFICATE AUTHORITY   EXPIRES                  RESIDUAL TIME   EXTERNALLY MANAGED
ca                      Feb 18, 2032 17:12 UTC   8y              no
!MISSING! etcd-ca
front-proxy-ca          Feb 18, 2032 17:12 UTC   8y              no
root@node1:~#
```

### Rotate K8s Certs

#### Backup etcd DB

It is crucial to back up your etcd DB as it contains your K8s cluster state! So make sure to backup your etcd DB first before rotating the certs!

##### Take the etcd DB Backup

> Replace the etcd key & cert with your locations found in the prior steps

```
export $(grep -v '^#' /etc/etcd.env | xargs -d '\n')
etcdctl -w table member list
etcdctl endpoint health --cluster -w table
etcdctl endpoint status --cluster -w table
etcdctl snapshot save node1.etcd.backup
```

You can additionally backup the current certs:

```
tar czf etc_kubernetes_ssl_etcd_bkp.tar.gz /etc/kubernetes /etc/ssl/etcd
```

#### Renew the Certs

> IMPORTANT: For an HA Kubernetes cluster with multiple control plane nodes, the `kubeadm certs renew` command (followed by the `kube-apiserver`, `kube-scheduler`, `kube-controller-manage`r pods and `etcd.service` restart) needs to be executed on all the control-plane nodes, on one control plane node at a time, starting with the primary control plane node. This approach ensures that the cluster remains operational throughout the certificate renewal process and that there is always at least one control plane node available to handle API requests. To find out whether you have an HA K8s cluster (multiple control plane nodes) use this command `kubectl get nodes -l node-role.kubernetes.io/control-plane`

Now that you have the etcd DB backup, you can rotate the K8s certs using the following commands:

##### Rotate the k8s Certs

```
kubeadm certs renew all
```

##### Update your kubeconfig

```
mv -vi /root/.kube/config /root/.kube/config.old
cp -pi /etc/kubernetes/admin.conf /root/.kube/config
```

##### Bounce the following services in this order

```
kubectl -n kube-system delete pods -l component=kube-apiserver
kubectl -n kube-system delete pods -l component=kube-scheduler
kubectl -n kube-system delete pods -l component=kube-controller-manager
systemctl restart etcd.service
```

##### Verify the Certs Status

```
kubeadm certs check-expiration
```

Repeat the process for all control plane nodes, one at a time, if you have a HA Kubernetes cluster.

## Force New ReplicaSet Workaround

The steps outlined in this guide provide a workaround for known issue which occurs when a deployment update is attempted and fails due to the provider being out of resources. This is happens because K8s won't destroy an old pod instance until it ensures the new one has been created.\
\
GitHub issue description can be found [here](https://github.com/akash-network/support/issues/82).

### Requirements

##### Install JQ

```
apt -y install jq
```

### Steps to Implement

#### 1). Create \`/usr/local/bin/akash-force-new-replicasets.sh\` file

```
cat > /usr/local/bin/akash-force-new-replicasets.sh <<'EOF'
#!/bin/bash
#
# Version: 0.2 - 25 March 2023
# Files:
# - /usr/local/bin/akash-force-new-replicasets.sh
# - /etc/cron.d/akash-force-new-replicasets
#
# Description:
# This workaround goes through the newest deployments/replicasets, pods of which can't get deployed due to "insufficient resources" errors and it then removes the older replicasets leaving the newest (latest) one.
# This is only a workaround until a better solution to https://github.com/akash-network/support/issues/82 is found.
#

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

#### 2). Mark As Executable File

```
chmod +x /usr/local/bin/akash-force-new-replicasets.sh
```

#### 3). Create Cronjob

Create the crontab job `/etc/cron.d/akash-force-new-replicasets` to run the workaround every 5 minutes.

```
cat > /etc/cron.d/akash-force-new-replicasets << 'EOF'
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
SHELL=/bin/bash

*/5 * * * * root /usr/local/bin/akash-force-new-replicasets.sh
EOF
```

## Kill Zombie Processes

### Issue

In certain Kubernetes deployments, subprocesses may not properly implement the `wait()` function, leading to the creation of `<defunct>` processes, commonly known as "zombie" processes. These occur when a subprocess completes its task but remains in the system's process table because the parent process has not retrieved its exit status. Over time, if these zombie processes are not managed, they can accumulate and consume all available process slots in the system, leading to PID exhaustion and resource starvation.

While zombie processes do not consume CPU or memory resources directly, they occupy slots in the system's process table. If the process table becomes full, no new processes can be spawned, potentially causing severe disruptions. The limit for the number of process IDs (PIDs) available on a system can be checked using:

```
$ cat /proc/sys/kernel/pid_max
4194304
```

To prevent this issue, it is crucial to manage and terminate child processes correctly to avoid the formation of zombie processes.

### Recommended Approaches

1. **Proper Process Management in Scripts**: Ensure that any scripts initiating subprocesses correctly manage their lifecycle. For example:

   ```bash
   #!/bin/bash

   # Start the first process
   ./my_first_process &

   # Start the second process
   ./my_second_process &

   # Wait for any process to exit
   wait -n

   # Exit with the status of the process that exited first
   exit $?
   ```

2. **Using a Container Init System**: Deploying a proper container init system ensures that zombie processes are automatically reaped, and signals are forwarded correctly, reducing the likelihood of zombie process accumulation. Here are some tools and examples that you can use:

   - [**Tini**](https://github.com/krallin/tini): A lightweight init system designed for containers. It is commonly used to ensure zombie process reaping and signal handling within Docker containers. You can easily add Tini to your Docker container by using the `--init` flag or adding it as an entrypoint in your Dockerfile.
   - [**Dumb-init**](https://github.com/Yelp/dumb-init): Another lightweight init system designed to handle signal forwarding and process reaping. It is simple and efficient, making it a good alternative for minimal containers that require proper PID 1 behavior.
   - [**Runit Example**](https://git.nixaid.com/arno/postfix/src/branch/master/Dockerfile#L21): Runit is a fast and reliable init system and service manager. This [Dockerfile example](https://git.nixaid.com/arno/postfix/src/branch/master/Dockerfile#L21) demonstrates how to use Runit as the init system in a Docker container.
   - [**Supervisord Example by Docker.com**](https://docs.docker.com/config/containers/multi-service_container/#use-a-process-manager): Supervisord is a popular process manager that allows for managing multiple services within a container. The official Docker documentation provides a [supervisord example](https://docs.docker.com/config/containers/multi-service_container/#use-a-process-manager) that illustrates how to manage multiple processes effectively.
   - [**S6 Example**](https://github.com/just-containers/s6-overlay): S6 is a powerful init system and process supervisor. The [S6 overlay repository](https://github.com/just-containers/s6-overlay) offers examples and guidelines on how to integrate S6 into your Docker containers, providing process management and reaping.


For more details on this approach, refer to the following resources:
- [Container Init Process](https://devopsdirective.com/posts/2023/06/container-init-process/)
- [zombie reproducer and in-depth explanation](https://github.com/akash-network/awesome-akash/issues/565#issuecomment-2304206825)
- [Docker Multi-Service Containers](https://docs.docker.com/config/containers/multi-service_container/#use-a-wrapper-script)
- [Docker and the PID 1 Zombie Reaping Problem](https://blog.phusion.nl/2015/01/20/docker-and-the-pid-1-zombie-reaping-problem/)
- [Terminating a Zombie Process in Linux Environments](https://www.dell.com/support/kbdoc/en-us/000019108/terminating-a-zombie-process-in-linux-environments)
- [Zombie Processes and their Prevention](https://www.geeksforgeeks.org/zombie-processes-prevention/)

### Example of Zombie Processes on the Provider

In some cases, misconfigured container images can lead to a rapid accumulation of zombie processes. For instance, a container that repeatedly fails to start an `sshd` service might spawn zombie processes every 20 seconds:

```bash
root      712532  696516  0 14:28 ?        00:00:00      \_ [bash] <defunct>
syslog    713640  696516  0 14:28 ?        00:00:00      \_ [sshd] <defunct>
root      807481  696516  0 14:46 ?        00:00:00      \_ [bash] <defunct>
root      828096  696516  0 14:50 ?        00:00:00      \_ [bash] <defunct>
root      835000  696516  0 14:51 pts/0    00:00:00      \_ [haproxy] <defunct>
root      836102  696516  0 14:51 ?        00:00:00      \_ SCREEN -S webserver
root      836103  836102  0 14:51 ?        00:00:00      |   \_ /bin/bash
root      856974  836103  0 14:55 ?        00:00:00      |       \_ caddy run
root      849813  696516  0 14:54 pts/0    00:00:00      \_ [haproxy] <defunct>
pollina+  850297  696516  1 14:54 ?        00:00:40      \_ haproxy -f /etc/haproxy/haproxy.cfg
root      870519  696516  0 14:58 ?        00:00:00      \_ SCREEN -S wallpaper
root      870520  870519  0 14:58 ?        00:00:00      |   \_ /bin/bash
root      871826  870520  0 14:58 ?        00:00:00      |       \_ bash change_wallpaper.sh
root     1069387  871826  0 15:35 ?        00:00:00      |           \_ sleep 20
syslog    893600  696516  0 15:02 ?        00:00:00      \_ [sshd] <defunct>
syslog    906839  696516  0 15:05 ?        00:00:00      \_ [sshd] <defunct>
syslog    907637  696516  0 15:05 ?        00:00:00      \_ [sshd] <defunct>
syslog    913724  696516  0 15:06 ?        00:00:00      \_ [sshd] <defunct>
syslog    914913  696516  0 15:06 ?        00:00:00      \_ [sshd] <defunct>
syslog    922492  696516  0 15:08 ?        00:00:00      \_ [sshd] <defunct>
```

### Steps to Implement a Workaround for Providers

Since providers cannot control the internal configuration of tenant containers, it is advisable to implement a system-wide workaround to handle zombie processes.

1. **Create a Script to Kill Zombie Processes**

   Create the script `/usr/local/bin/kill_zombie_parents.sh`:
   ```bash
   cat > /usr/local/bin/kill_zombie_parents.sh <<'EOF'
   #!/bin/bash
   # This script detects zombie processes that are descendants of containerd-shim processes
   # and first attempts to prompt the parent process to reap them by sending a SIGCHLD signal.

   find_zombie_and_parents() {
     for pid in /proc/[0-9]*; do
       if [[ -r $pid/stat ]]; then
         read -r proc_pid comm state ppid < <(cut -d' ' -f1,2,3,4 "$pid/stat")
         if [[ $state == "Z" ]]; then
           echo "$proc_pid $ppid"
           return 0
         fi
       fi
     done
     return 1
   }

   get_parent_chain() {
     local pid=$1
     local chain=""
     while [[ $pid -ne 1 ]]; do
       if [[ ! -r /proc/$pid/stat ]]; then
         break
       fi
       read -r ppid cmd < <(awk '{print $4, $2}' /proc/$pid/stat)
       chain="$pid:$cmd $chain"
       pid=$ppid
     done
     echo "$chain"
   }

   is_process_zombie() {
     local pid=$1
     if [[ -r /proc/$pid/stat ]]; then
       read -r state < <(cut -d' ' -f3 /proc/$pid/stat)
       [[ $state == "Z" ]]
     else
       return 1
     fi
   }

   attempt_kill() {
     local pid=$1
     local signal=$2
     local wait_time=$3
     local signal_name=${4:-$signal}

     echo "Attempting to send $signal_name to parent process $pid"
     kill $signal $pid
     sleep $wait_time

     if is_process_zombie $zombie_pid; then
       echo "Zombie process $zombie_pid still exists after $signal_name"
       return 1
     else
       echo "Zombie process $zombie_pid no longer exists after $signal_name"
       return 0
     fi
   }

   if zombie_info=$(find_zombie_and_parents); then
     zombie_pid=$(echo "$zombie_info" | awk '{print $1}')
     parent_pid=$(echo "$zombie_info" | awk '{print $2}')

     echo "Found zombie process $zombie_pid with immediate parent $parent_pid"

     parent_chain=$(get_parent_chain "$parent_pid")
     echo "Parent chain: $parent_chain"

     if [[ $parent_chain == *"containerd-shim"* ]]; then
       echo "Top-level parent is containerd-shim"
       immediate_parent=$(echo "$parent_chain" | awk -F' ' '{print $1}' | cut -d':' -f1)
       if [[ $immediate_parent != $parent_pid ]]; then
         if attempt_kill $parent_pid -SIGCHLD 15 "SIGCHLD"; then
           echo "Zombie process cleaned up after SIGCHLD"
         elif attempt_kill $parent_pid -SIGTERM 15 "SIGTERM"; then
           echo "Zombie process cleaned up after SIGTERM"
         elif attempt_kill $parent_pid -SIGKILL 5 "SIGKILL"; then
           echo "Zombie process cleaned up after SIGKILL"
         else
           echo "Failed to clean up zombie process after all attempts"
         fi
       else
         echo "Immediate parent is containerd-shim. Not killing."
       fi
     else
       echo "Top-level parent is not containerd-shim. No action taken."
     fi
   fi
   EOF
   ```

2. **Mark the Script as Executable**

   ```bash
   chmod +x /usr/local/bin/kill_zombie_parents.sh
   ```

3. **Create a Cron Job**

   Set up a cron job to run the script every 5 minutes:

   ```bash
   cat > /etc/cron.d/kill_zombie_parents << 'EOF'
   PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
   SHELL=/bin/bash

   */5 * * * * root /usr/local/bin/kill_zombie_parents.sh | logger -t kill_zombie_parents
   EOF
   ```

This workaround will help mitigate the impact of zombie processes on the system by periodically terminating their parent processes, thus preventing the system's PID table from being overwhelmed.


## Close Leases Based on Image

Below is the suboptimal way of terminating the leases with the selected (unwanted) images (until Akash natively supports that).

Suboptimal because once the deployment gets closed the provider will have to be restarted to recover from the `account sequence mismatch` error. Providers already do it automatically through the K8s's `liveness` probe set to the akash-provider deployment.

The other core problem is that the `image` is **unknown** until the client transfers the SDL to the provider (`tx send-manifest`) which can only happen after provider bids, client accepts the bid.

Follow the steps associated with your Akash Provider install method:

- [Akash Provider Built with Helm Charts](#akash-provider-built-with-helm-charts)

### Akash Provider Built with Helm Charts

#### Create Script

- Create script file - `/usr/local/bin/akash-kill-lease.sh` - and populate with the following content:

```
#!/bin/bash
# Files:
# - /etc/cron.d/akash-kill-lease
# - /usr/local/bin/akash-kill-lease.sh

# Uncomment IMAGES to activate this script.
# IMAGES="packetstream/psclient"

# You can provide multiple images, separated by the "|" character as in this example:
# IMAGES="packetstream/psclient|traffmonetizer/cli"

# Quit if no images were specified
test -z $IMAGES && exit 0

kubectl -n lease get manifests -o json | jq --arg md_lid "akash.network/lease.id" -r '.items[] | [(.metadata.labels | .[$md_lid+".owner"], .[$md_lid+".dseq"], .[$md_lid+".gseq"], .[$md_lid+".oseq"]), (.spec.group | .services[].image)] | @tsv' | grep -Ei "$IMAGES" | while read owner dseq gseq oseq image; do kubectl -n akash-services exec -i $(kubectl -n akash-services get pods -l app=akash-provider -o name) -- env AKASH_OWNER=$owner AKASH_DSEQ=$dseq AKASH_GSEQ=$gseq AKASH_OSEQ=$oseq provider-services tx market bid close; done

```

#### Make the Script Executable

```
chmod +x /usr/local/bin/akash-kill-lease.sh
```

#### Create Cron Job

- Create the Cron Job file - `/etc/cron.d/akash-kill-lease` - with the following content:

```
# Files:
# - /etc/cron.d/akash-kill-lease
# - /usr/local/bin/akash-kill-lease.sh

PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
SHELL=/bin/bash

*/5 * * * * root /usr/local/bin/akash-kill-lease.sh
```

### Provider Bid Script Migration - GPU Models

A new bid script for Akash Providers has been released that now includes the ability to specify pricing of multiple GPU models.

This document details the recommended procedure for Akash providers needing migration to the new bid script from prior versions.

##### New Features of Bid Script Release

- Support for parameterized price targets (configurable through the Akash/Provider Helm chart values), eliminating the need to manually update your bid price script
- Pricing based on GPU model, allowing you to specify different prices for various GPU models

##### How to Migrate from Prior Bid Script Releases

##### STEP 1 - Backup your current bid price script

> This command will produce an `old-bid-price-script.sh` file which is your currently active bid price script with your custom modifications

```
helm -n akash-services get values akash-provider -o json | jq -r '.bidpricescript | @base64d' > old-bid-price-script.sh
```

##### STEP 2 - Verify Previous Custom Target Price Values

```
cat old-bid-price-script.sh | grep ^TARGET
```

##### Example/Expected Output

```
# cat old-bid-price-script.sh | grep ^TARGET
TARGET_CPU="1.60"          # USD/thread-month
TARGET_MEMORY="0.80"       # USD/GB-month
TARGET_HD_EPHEMERAL="0.02" # USD/GB-month
TARGET_HD_PERS_HDD="0.01"  # USD/GB-month (beta1)
TARGET_HD_PERS_SSD="0.03"  # USD/GB-month (beta2)
TARGET_HD_PERS_NVME="0.04" # USD/GB-month (beta3)
TARGET_ENDPOINT="0.05"     # USD for port/month
TARGET_IP="5"              # USD for IP/month
TARGET_GPU_UNIT="100"      # USD/GPU unit a month
```

#### STEP 3 - Backup Akash/Provider Config

> This command will backup your akash/provider config in the `provider.yaml` file (excluding the old bid price script)

```
helm -n akash-services get values akash-provider | grep -v '^USER-SUPPLIED VALUES' | grep -v ^bidpricescript > provider.yaml
```

#### STEP 4 - Update provider.yaml File Accordingly

> Update your `provider.yaml` file with the price targets you want. If you don't specify these keys, the bid price script will default values shown below

`price_target_gpu_mappings` sets the GPU price in the following way and in the example provided:

- `a100` nvidia models will be charged by `120` USD/GPU unit a month
- `t4` nvidia models will be charged by `80` USD/GPU unit a month
- Unspecified nvidia models will be charged `130` USD/GPU unit a month (if `*` is not explicitly set in the mapping it will default to `100` USD/GPU unit a month)
- Extend with more models your provider is offering if necessary with syntax of `<model>=<USD/GPU unit a month>`
- If your GPU model has different possible RAM specs - use this type of convention: `a100.40Gi=900,a100.80Gi=1000`

```
price_target_cpu: 1.60
price_target_memory: 0.80
price_target_hd_ephemeral: 0.02
price_target_hd_pers_hdd: 0.01
price_target_hd_pers_ssd: 0.03
price_target_hd_pers_nvme: 0.04
price_target_endpoint: 0.05
price_target_ip: 5
price_target_gpu_mappings: "a100=120,t4=80,*=130"
```

#### STEP 5 - Download New Bid Price Script

```
mv -vi price_script_generic.sh price_script_generic.sh.old

wget https://raw.githubusercontent.com/akash-network/helm-charts/main/charts/akash-provider/scripts/price_script_generic.sh
```

#### STEP 6 - Upgrade Akash/Provider Chart to Version 6.0.5

```
helm repo update akash

helm search repo akash/provider
```

##### Expected/Example Output

```
# helm repo update akash
# helm search repo akash/provider
NAME          	CHART VERSION	APP VERSION	DESCRIPTION
akash/provider	6.0.5        	0.4.6      	Installs an Akash provider (required)
```

#### STEP 7 - Upgrade akash-provider Deployment with New Bid Script

```
helm upgrade akash-provider akash/provider -n akash-services -f provider.yaml --set bidpricescript="$(cat price_script_generic.sh | openssl base64 -A)"
```

##### Verification of Bid Script Update

```
helm list -n akash-services | grep akash-provider
```

##### Expected/Example Output

```
# helm list -n akash-services | grep akash-provider
akash-provider         	akash-services	28      	2023-09-19 12:25:33.880309778 +0000 UTC	deployed	provider-6.0.5                	0.4.6
```

### GPU Provider Troubleshooting

Should your Akash Provider encounter issues during the installation process or in post install hosting of GPU resources, follow the troubleshooting steps in this guide to isolate the issue.

> _**NOTE**_ - these steps should be conducted on each Akask Provider/Kubernetes worker nodes that host GPU resources unless stated otherwise within the step

- [Basic GPU Resource Verifications](#basic-gpu-resource-verifications)
- [Examine Linux Kernel Logs for GPU Resource Errors and Mismatches](#examine-linux-kernel-logs-for-gpu-resource-errors-and-mismatches)
- [Ensure Correct Version/Presence of NVIDIA Device Plugin](#ensure-correct-versionpresence-of-nvidia-device-plugin)
- [NVIDIA Fabric Manager](#nvidia-fabric-manager)

### Basic GPU Resource Verifications

- Conduct the steps in this section for basic verification and to ensure the host has access to GPU resources

#### Prep/Package Installs

```
apt update && apt -y install python3-venv

python3 -m venv /venv
source /venv/bin/activate
pip install torch numpy
```

#### Confirm GPU Resources Available on Host

> _**NOTE**_ - example verification steps were conducted on a host with a single NVIDIA T4 GPU resource. Your output will be different based on the type and number of GPU resources on the host.

```
nvidia-smi -L
```

##### Example/Expected Output

```
# nvidia-smi -L

GPU 0: Tesla T4 (UUID: GPU-faa48437-7587-4bc1-c772-8bd099dba462)
```

#### Confirm CUDA Install & Version

```
python3 -c "import torch;print(torch.version.cuda)"
```

##### Example/Expected Output

```
# python3 -c "import torch;print(torch.version.cuda)"

11.7
```

#### Confirm CUDA GPU Support iis Available for Hosted GPU Resources

```
python3 -c "import torch; print(torch.cuda.is_available())"
```

##### Example/Expected Output

```
# python3 -c "import torch; print(torch.cuda.is_available())"

True
```

### Examine Linux Kernel Logs for GPU Resource Errors and Mismatches

```
dmesg -T | grep -Ei 'nvidia|nvml|cuda|mismatch'
```

##### Example/Expected Output

> _**NOTE**_ - example output is from a healthy host which loaded NVIDIA drivers successfully and has no version mismatches. Your output may look very different if there are issues within the host.

```
# dmesg -T | grep -Ei 'nvidia|nvml|cuda|mismatch'

[Thu Sep 28 19:29:02 2023] nvidia: loading out-of-tree module taints kernel.
[Thu Sep 28 19:29:02 2023] nvidia: module license 'NVIDIA' taints kernel.
[Thu Sep 28 19:29:02 2023] nvidia-nvlink: Nvlink Core is being initialized, major device number 237
[Thu Sep 28 19:29:02 2023] NVRM: loading NVIDIA UNIX x86_64 Kernel Module  535.104.05  Sat Aug 19 01:15:15 UTC 2023
[Thu Sep 28 19:29:02 2023] nvidia-modeset: Loading NVIDIA Kernel Mode Setting Driver for UNIX platforms  535.104.05  Sat Aug 19 00:59:57 UTC 2023
[Thu Sep 28 19:29:02 2023] [drm] [nvidia-drm] [GPU ID 0x00000004] Loading driver
[Thu Sep 28 19:29:03 2023] audit: type=1400 audit(1695929343.571:3): apparmor="STATUS" operation="profile_load" profile="unconfined" name="nvidia_modprobe" pid=300 comm="apparmor_parser"
[Thu Sep 28 19:29:03 2023] audit: type=1400 audit(1695929343.571:4): apparmor="STATUS" operation="profile_load" profile="unconfined" name="nvidia_modprobe//kmod" pid=300 comm="apparmor_parser"
[Thu Sep 28 19:29:04 2023] [drm] Initialized nvidia-drm 0.0.0 20160202 for 0000:00:04.0 on minor 0
[Thu Sep 28 19:29:05 2023] nvidia_uvm: module uses symbols nvUvmInterfaceDisableAccessCntr from proprietary module nvidia, inheriting taint.
[Thu Sep 28 19:29:05 2023] nvidia-uvm: Loaded the UVM driver, major device number 235.
```

### Ensure Correct Version/Presence of NVIDIA Device Plugin

> _**NOTE**_ - conduct this verification step on the Kubernetes control plane node on which Helm was installed during your Akash Provider build

```
helm -n nvidia-device-plugin list
```

##### Example/Expected Output

```
# helm -n nvidia-device-plugin list

NAME    NAMESPACE               REVISION    UPDATED                                    STATUS      CHART                          APP VERSION
nvdp    nvidia-device-plugin    1           2023-09-23 14:30:34.18183027 +0200 CEST    deployed    nvidia-device-plugin-0.14.1    0.14.1
```

### NVIDIA Fabric Manager

- In some circumstances it has been found that the NVIDIA Fabric Manager needs to be installed on worker nodes hosting GPU resources (e.g. non-PCIe GPU configurations such as those using SXM form factors)
- If the output of the `torch.cuda.is_available()` command - covered in prior section in this doc - is an error condition, consider installing the NVIDIA Fabric Manager to resolve issue
- Frequently encountered error message encounter when issue exists:\
  \
  `torch.cuda.is_available() function: Error 802: system not yet initialized (Triggered internally at ../c10/cuda/CUDAFunctions.cpp:109.)`
- Further details on the NVIDIA Fabric Manager are available [here](https://forums.developer.nvidia.com/t/error-802-system-not-yet-initialized-cuda-11-3/234955)

> _**NOTE**_ - replace `525` in the following command with the NVIDIA driver version used on your host

> _**NOTE**_ - you may need to wait for about 2-3 minutes for the nvidia fabricmanager to initialize

```
apt-get install nvidia-fabricmanager-525
systemctl start nvidia-fabricmanager
systemctl enable nvidia-fabricmanager
```

- **nvidia-fabricmanager** package version mismatch


Occasionally, the Ubuntu repositories may not provide the correct version of the **nvidia-fabricmanager** package. This can result in the `Error 802: system not yet initialized` error on SXM NVIDIA GPUs.

A common symptom of this issue is that **nvidia-fabricmanager** fails to start properly:

```
# systemctl status nvidia-fabricmanager
Nov 05 13:55:26 node1 systemd[1]: Starting NVIDIA fabric manager service...
Nov 05 13:55:26 node1 nv-fabricmanager[104230]: fabric manager NVIDIA GPU driver interface version 550.127.05 don't match with driver version 550.120. Please update with matching NVIDIA driver package.
Nov 05 13:55:26 node1 systemd[1]: nvidia-fabricmanager.service: Control process exited, code=exited, status=1/FAILURE
```

To resolve this issue, you’ll need to use the official NVIDIA repository. Here's how to add it:

> _**NOTE**_ - replace `2204` with your Ubuntu version (e.g. `2404` for Ubuntu noble release)

> _**NOTE**_ - Running `apt dist-upgrade` with the official NVIDIA repo bumps the `nvidia` packages along with the `nvidia-fabricmanager`, without version mismatch issue.

```
wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/3bf863cc.pub
apt-key add 3bf863cc.pub

echo "deb https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/ /" > /etc/apt/sources.list.d/nvidia-official-repo.list
apt update
apt dist-upgrade
apt autoremove
```

> `dpkg -l | grep nvidia` -- make sure to remove any version you don't expect
> and reboot
