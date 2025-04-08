---
categories: ["Providers"]
tags: []
weight: 2
title: "Monitoring, Logs, & Management"
linkTitle: "Monitoring, Logs, & Management"
---

- [Provider Logs](#provider-logs)
- [Provider Status and General Info](#provider-status-and-general-info)
- [Provider Lease Management](#provider-lease-management)
- [Provider Manifests](#provider-manifests)
- [Provider Earnings](#provider-earnings)

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