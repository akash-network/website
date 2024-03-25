---
categories: ["Akash Provider Operators"]
tags: []
title: "Inventory Operator for Persistent Storage"
linkTitle: "Inventory Operator for Persistent Storage"
weight: 1
description: >-
---

> When your Akash Provider was initially installed a step was included to also install the Akash Inventory Operator. In this step we will make any necessary changes to the inventory operator for your specific persisent storage type (I.e. beta1, beta2, or \`beta3).

### Default Helm Chart - values.yaml file

- The `values.yaml` file for the inventory operator defaults are as follows
- As the default cluster storage type includes `beta2` - no update is necessary if this is your persistent storage type and no further action is necessary for inventory operator and you may skip the remainer of this step
- If your persistent storage type is instead `beta1` or `beta3` proceed to the `Update Cluster Storage Cluster Setting` section next

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

- Again this step is only necessary if you have `beta1` or `beta3` persistent storage type
- Use this command to update the cluster storage settings
- In the following command example we are updating the chart with `beta3` persistent storage type such as - `inventoryConfig.cluster_storage[1]=beta3`. Adjust as necessary for your needs.
- The `default` label can be used and left as is in all circumstances.

```
helm upgrade inventory-operator akash/akash-inventory-operator -n akash-services --set inventoryConfig.cluster_storage[0]=default,inventoryConfig.cluster_storage[1]=beta3
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
