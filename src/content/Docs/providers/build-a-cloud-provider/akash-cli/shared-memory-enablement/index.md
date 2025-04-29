---
categories: ["Providers"]
tags: ["Akash Provider", "Shared Memory"]
weight: 8
title: "Shared Memory Enablement"
linkTitle: "Shared Memory Enablement"
---

## Update Provider Configuration File

Providers must be updated with attributes in order to bid on the SHM deplloyments.

> _**NOTE**_ - in the Akash Provider build documentation a `provider.yaml` file was created and which stores provider attribute/other settings. In this section we will update that `provider.yaml` file with SHM related attributes. The remainder of the pre-existing file should be left unchanged.

### Access Provider Configuration File

- Steps included in this code block create the necessary `provider.yaml` file in the expected directory

```
cd ~

cd provider

vim provider.yaml
```

### **Update the Provider YAML File With SHM Attribute**

- When the `provider.yaml` file update is complete look like the following example.

```
  - key: capabilities/storage/3/class
    value: ram
  - key: capabilities/storage/3/persistent
    value: false
```

#### Example Provider Config File

```

---
from: "$ACCOUNT_ADDRESS"
key: "$(cat ~/key.pem | openssl base64 -A)"
keysecret: "$(echo $KEY_PASSWORD | openssl base64 -A)"
domain: "$DOMAIN"
node: "$AKASH_NODE"
withdrawalperiod: 12h
attributes:
  - key: host
    value: akash
  - key: tier
    value: community
  - key: capabilities/storage/3/class
    value: ram
  - key: capabilities/storage/3/persistent
    value: false
```

## Update Provider Via Helm

```

helm upgrade --install akash-provider akash/provider -n akash-services -f provider.yaml \
--set bidpricescript="$(cat /root/provider/price_script_generic.sh | openssl base64 -A)"
```

## Update the Inventory Operator with SHM Support

> _**NOTE**_ - when your Akash Provider was initially installed a step was included to also install the Akash Inventory Operator. In this step we will make any necessary changes to the inventory operator for SHM support.

### Helm Chart - values.yaml file

- The `values.yaml` file for the inventory operator defaults are as follows
- To support SHM we must update the inventory operator to include SHM/ram class. We will update the inventory operator with such support in the subsequent step.

```
# Default values for inventory-operator.
# This is a YAML-formatted file.
# Declare variables to be passed into your templates.

image:
  repository: ghcr.io/akash-network/provider
  pullPolicy: IfNotPresent

inventoryConfig:
  # Allow users to specify cluster storage options
  cluster_storage:
    - default
    - beta2
  exclude:
    nodes: []
    node_storage: []
```

#### Update Cluster Storage Cluster Setting

- Use this command to update the cluster storage settings with SHM support

> NOTE - in the example we include the support of persistent storage type of `beta3` as well. Adjust this section appropriately based on your provider's support of persistent storage.

```
helm upgrade --install inventory-operator akash/akash-inventory-operator -n akash-services --set inventoryConfig.cluster_storage[0]=default,inventoryConfig.cluster_storage[1]=beta3,inventoryConfig.cluster_storage[2]=ram
```

#### Expected Output

```
root@node1:~/helm-charts/charts# helm install inventory-operator akash/akash-inventory-operator -n akash-services

NAME: inventory-operator
LAST DEPLOYED: Thu May  5 18:15:57 2022
NAMESPACE: akash-services
STATUS: deployed
REVISION: 1
TEST SUITE: None
```

## Verify Health of Akash Provider

Use the following command to verify the health of the Akash Provider and Hostname Operator pods

```
kubectl get pods -n akash-services
```

#### Example/Expected Output

```
root@node1:~/provider# kubectl get pods -n akash-services
NAME                                       READY   STATUS    RESTARTS   AGE
akash-hostname-operator-5c59757fcc-kt7dl   1/1     Running   0          17s
akash-provider-0                           1/1     Running   0          59s
```

## Verify Provider Attributes On Chain

- In this step we ensure that your updated Akash Provider Attributes have been updated on the blockchain. Ensure that the GPU model related attributes are now in place via this step.

> _**NOTE**_ - conduct this verification from your Kubernetes control plane node

```
# Ensure that a RPC node environment variable is present for query
export AKASH_NODE=https://rpc.akashnet.net:443

# Replace the provider address with your own value
provider-services query provider get <provider-address>
```

#### Example/Expected Output

```

provider-services query provider get akash1mtnuc449l0mckz4cevs835qg72nvqwlul5wzyf

attributes:
- key: region
  value: us-central
- key: host
  value: akash
- key: tier
  value: community
- key: organization
  value: akash test provider
- key: capabilities/storage/3/class
  value: ram
- key: capabilities/storage/3/persistent
  value: false

host_uri: https://provider.akashtestprovider.xyz:8443
info:
  email: ""
  website: ""
owner: akash1mtnuc449l0mckz4cevs835qg72nvqwlul5wzyf

```

## Verify Akash Provider Image

Verify the Provider image is correct by running this command:

```
kubectl -n akash-services get pod akash-provider-0 -o yaml | grep image: | uniq -c
```

#### Expected/Example Output

```
root@node1:~/provider# kubectl -n akash-services get pod akash-provider-0 -o yaml | grep image: | uniq -c
      4     image: ghcr.io/akash-network/provider:0.5.4
```
