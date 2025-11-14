---
categories: ["Providers"]
tags: ["Akash Provider", "Storage", "Persistent"]
weight: 4
title: "Persistent Storage Enablement"
linkTitle: "Persistent Storage Enablement"
---

At Akash we use the Kubernetes Rook Operator coupled with the Ceph distributed file system to provision Provider persistent storage.


Refer to the [ Akash Provider](/docs/providers/build-a-cloud-provider/akash-cli/akash-cloud-provider-build-with-helm-charts/) guide if your provider has not yet been built.


We encourage becoming familiar with Rook and Ceph prior to configuring Akash persistent storage via this [guide](https://rook.github.io/docs/rook/latest-release/). The current persistent storage use is based on the Rook Ceph helm chart.

Please take into consideration the following Akash recommendations:

- Persistent storage should only be enabled on Kubernetes nodes that are NOT serving as control-plane/master nodes. This does not apply if you are running all-in-one node deployment.
- Ceph will only deploy it's BlueStore on unformatted volumes. A node must have unformatted volumes mounted to serve persistent storage capabilities.
- Ceph uses BlueStore as its default backend to store the objects in a monolithic database-like fashion.
- To read more on Ceph Architecture go [here](https://docs.ceph.com/en/quincy/architecture/).

Get started within the following sections:

- [Persistent Storage Requirements](#persistent-storage-requirements)
- [Environment Review](#environment-review)
- [Deploy Persistent Storage](#deploy-persistent-storage)
- [Check Persistent Storage Health](#check-persistent-storage-health)
- [Provider Attributes and Pricing Adjustments](#provider-attributes-and-pricing-adjustments)
- [Label Nodes For Storage Classes](#label-nodes-for-storage-classes)
- [Inventory Operator](#inventory-operator)
- [Verify Node Labels for Storage Classes](#verify-node-labels-for-storage-classes)
- [Additional Verifications](#verifications)
- [Teardown](#teardown)

## <a href="#ensure-unformatted-drives" id="ensure-unformatted-drives"></a>

## Persistent Storage Requirements

### Environment Overview

When planning persistent storage, take into account the network (between the storage nodes) as a factor which will cause the latency, causing slower disk throughput / IOPS. This might not be suitable for heavy IOPS applications such as Solana validator.

In this case the "all-in-one" provider configuration might be desirable to avoid the network affecting the storage performance. I.e. for the best disk performance, the pods should run where persistent storage has been deployed.

It is advised to run control-plane / etcd separately, for sake of performance and security. We recommend to benchmark your storage with this [script](https://github.com/masonr/yet-another-bench-script) before and after deploying Persistent Storage. This will help know the difference before starting to advertising your provider on the Akash network.

### Environment Requirements

For hosting of persistent storage please note the following, strict requirements for production use.

At least three Ceph OSDs are normally required for redundancy and high availability.

**Single storage node configuration**

- At least 3 HDD or SSD disks with 1 OSD per disk; (which makes a total 3 of OSDs)
- At least 2 NVME disks with 2 OSDs per disk; (which makes a total 4 of OSDs)

**Three storage nodes configuration**

- At least 1 HDD/SSD/NVME disk with 1 OSD per disk over 3 storage nodes; (which makes a total 3 of OSDs)

#### Maximum OSDs per single drive

- HDD 1 OSD
- SSD 1 OSD
- NVME 2 OSDs

#### Additional Requirements

- Minimum two Ceph managers
- Minimum three Ceph monitors
- Minimum recommended disk space at /`var/lib/ceph/` is greater than `60 GiB` as each Ceph Monitor (ceph mon) requires `60 GiB` of disk space
- Additional Ceph minimum hardware requirements may be reviewed in the following document:
  - [Ceph Minimum Hardware Recommendations](https://docs.ceph.com/en/quincy/start/hardware-recommendations/#minimum-hardware-recommendations)
- Running multiple OSDs on a single SAS / SATA drive is NOT a good idea. NVMe drives, however, can achieve improved performance by being split into two or more OSDs.
- Running an OSD and a monitor or a metadata server on a single drive is also NOT a good idea.

### Ceph Prerequisites <a href="#ceph-prerequisites" id="ceph-prerequisites"></a>

In order to configure the Ceph storage cluster, at least one of these local storage options are required:

- Raw devices (no partitions or formatted filesystems)
- Raw partitions (no formatted filesystem)
- PVs available from a storage class in `block` mode

### Networking Requirements

We recommend updating the requirements to include 10 Gbps internal networking (NICs and infrastructure) for Ceph nodes. This is the absolute minimum for providers we aim to include. 10G networking is relatively affordable, and higher speeds like 25G or 100G are common in HPC environments, especially when Ceph is involved.

- **Minimum Network Requirement:** 10 GbE NIC cards for Ceph nodes

## Environment Review

### Retrieve Node Names

Gather the Kubernetes names of all nodes within your cluster. We will use the node names in a subsequent step.

```
kubectl get nodes -ojson | jq -r '.items[].metadata.labels."kubernetes.io/hostname"'
```

#### **Example Output**

```
root@node1:~/akash# kubectl get nodes -ojson | jq -r '.items[].metadata.labels."kubernetes.io/hostname"'

node1
node2
node3
```

### Ensure Unformatted Drives

- Rook-Ceph will automatically discover free, raw partitions. Use the following command on the host that will serve persistent storage to ensure the intended partition as no file system.

```
lsblk -f
```

#### Example/Expected Output

- In this example we have can see that the `xvdf` is unformatted and ready for persistent storage use

```
root@node2:~# lsblk -f
NAME     FSTYPE   FSVER LABEL           UUID                                 FSAVAIL FSUSE% MOUNTPOINTS

xvda
├─xvda1  ext4     1.0   cloudimg-rootfs e7879b8a-f914-4210-998a-d47604682e59   39.4G    18% /
├─xvda14
└─xvda15 vfat     FAT32 UEFI            594C-4810                              99.1M     5% /boot/efi
xvdf
```

### LVM Package <a href="#lvm-package" id="lvm-package"></a>

Ceph OSDs have a dependency on LVM in the following scenarios:

- OSDs are created on raw devices or partitions
- If encryption is enabled (`encryptedDevice: true` in the cluster CR)
- A `metadata` device is specified

For persistent storage use the OSDs are created on raw partitions. Issue the following command on each node serving persistent storage.

```
apt-get install -y lvm2
```

## Storage Class Types

In the subsequent sections persistent storage attributes will be defined. Use the chart below to determine your provider's storage class.

| Class Name | Throughput/Approx matching device | Number of OSD |
| ---------- | --------------------------------- | ------------- |
| beta1      | hdd                               | 1             |
| beta2      | ssd                               | 1             |
| beta3      | NVMe                              | 1 or 2        |

## Deploy Persistent Storage

### **Helm Install**

Install Helm and add the Akash repo if not done previously by following the steps in this [guide](/docs/providers/build-a-cloud-provider/akash-cli/akash-cloud-provider-build-with-helm-charts#step-4---helm-installation-on-kubernetes-node)**.**



All steps in this section should be conducted from the Kubernetes control plane node on which Helm has been installed.

Rook has published the following Helm charts for the Ceph storage provider:

- Rook Ceph Operator: Starts the Ceph Operator, which will watch for Ceph CRs (custom resources)
- Rook Ceph Cluster: Creates Ceph CRs that the operator will use to configure the cluster

The Helm charts are intended to simplify deployment and upgrades.

## Persistent Storage Deployment

- **Note** - if any issues are encountered during the Rook deployment, tear down the Rook-Ceph components via the steps listed [here](/docs/providers/build-a-cloud-provider/akash-cli/helm-based-provider-persistent-storage-enablement/#teardown) and begin anew.
- Deployment typically takes approximately 10 minutes to complete\*\*.\*\*

### Migration procedure

If you already have the `akash-rook` helm chart installed, make sure to use the following documentation:

- [Migration from akash-rook to the upstream rook-ceph Helm Charts](https://gist.github.com/andy108369/cd3ab76884f9006611a2becb4b3ccb4f)

### Rook Ceph repository

#### Add Repo

- Add the Rook repo to Helm

```
helm repo add rook-release https://charts.rook.io/release
```

- Expected/Example Result

```
# helm repo add rook-release https://charts.rook.io/release

"rook-release" has been added to your repositories
```

#### Verify Repo

- Verify the Rook repo has been added

```
helm search repo rook-release --version v1.16.5
```

- Expected/Example Result

```
# helm search repo rook-release --version v1.16.5

NAME                          	CHART VERSION	APP VERSION	DESCRIPTION
rook-release/rook-ceph        	v1.16.5       	v1.16.5     	File, Block, and Object Storage Services for yo...
rook-release/rook-ceph-cluster	v1.16.5       	v1.16.5     	Manages a single Ceph cluster namespace for Rook
```

### **Deployment Steps**

#### **STEP 1 - Install Ceph Operator Helm Chart**

## TESTING

> Scroll further for **PRODUCTION**

> For additional Operator chart values refer to [this](https://github.com/rook/rook/blob/v1.9.9/deploy/charts/rook-ceph/values.yaml) page.

#### All In One Provisioner Replicas

> For all-in-one deployments, you will likely want only one replica of the CSI provisioners.
>
> - Add following to `rook-ceph-operator.values.yml` created in the subsequent step
> - By setting `provisionerReplicas` to `1`, you ensure that only a single replica of the CSI provisioner is deployed. This defaults to `2` when it is not explicitly set.

```
csi:
 provisionerReplicas: 1
```

#### Default Resource Limits

You can disable default resource limits by using the following yaml config, this is useful when testing:

```
cat > rook-ceph-operator.values.yml << 'EOF'
resources:
csi:
  csiRBDProvisionerResource:
  csiRBDPluginResource:
  csiCephFSProvisionerResource:
  csiCephFSPluginResource:
  csiNFSProvisionerResource:
  csiNFSPluginResource:
EOF
```

### Install the Operator Chart

```
helm install --create-namespace -n rook-ceph rook-ceph rook-release/rook-ceph --version 1.16.5 -f rook-ceph-operator.values.yml
```

## PRODUCTION

> No customization is required by default.

- Install the Operator chart:

```
helm install --create-namespace -n rook-ceph rook-ceph rook-release/rook-ceph --version 1.16.5
```

#### STEP 2 - Install Ceph Cluster Helm Chart

> For additional Cluster chart values refer to [this](https://github.com/rook/rook/blob/v1.9.9/deploy/charts/rook-ceph-cluster/values.yaml) page.\
> For custom storage configuration refer to [this](https://rook.io/docs/rook/v1.9/ceph-cluster-crd.html#storage-configuration-specific-devices) example.

## TESTING / ALL-IN-ONE SETUP

> For production multi-node setup, please skip this section and scroll further for **PRODUCTION SETUP**

## Preliminary Steps

1. **Device Filter**: Update `deviceFilter` to correspond with your specific disk configurations.
2. **Storage Class**: Modify the `storageClass` name from `beta3` to an appropriate one, as outlined in the [Storage Class Types table](#storage-class-types).
3. **Node Configuration**: Under the `nodes` section, list the nodes designated for Ceph storage, replacing placeholders like `node1`, `node2`, etc., with your Kubernetes node names.

## Configuration for All-in-One or Single Storage Node

When setting up an **all-in-one production** provider or a single storage node with multiple storage drives (minimum requirement: 3 drives, or 2 drives if `osdsPerDevice` is set to 2):

1. **Failure Domain**: Set `failureDomain` to `osd`.
2. **Size Settings**:
   - The `size` and `osd_pool_default_size` should always be set to `osdsPerDevice + 1` when `failureDomain` is set to `osd`.
   - Set `min_size` and `osd_pool_default_min_size` to `2`.
   - Set `size` and `osd_pool_default_size` to `3`. Note: These can be set to `2` if you have a minimum of 3 drives and `osdsPerDevice` is `1`.
3. **Resource Allocation**: To ensure Ceph services receive sufficient resources, comment out or remove the `resources:` field before execution.

```
cat > rook-ceph-cluster.values.yml << 'EOF'
operatorNamespace: rook-ceph

configOverride: |
  [global]
  osd_pool_default_pg_autoscale_mode = on
  osd_pool_default_size = 1
  osd_pool_default_min_size = 1

cephClusterSpec:
  resources:

  mon:
    count: 1
  mgr:
    count: 1

  storage:
    useAllNodes: false
    useAllDevices: false
    deviceFilter: "^nvme."
    config:
      osdsPerDevice: "1"
    nodes:
    - name: "node1"
      config:

cephBlockPools:
  - name: akash-deployments
    spec:
      failureDomain: host
      replicated:
        size: 1
      parameters:
        min_size: "1"
        bulk: "true"
    storageClass:
      enabled: true
      name: beta3
      isDefault: true
      reclaimPolicy: Delete
      allowVolumeExpansion: true
      parameters:
        # RBD image format. Defaults to "2".
        imageFormat: "2"
        # RBD image features. Available for imageFormat: "2". CSI RBD currently supports only `layering` feature.
        imageFeatures: layering
        # The secrets contain Ceph admin credentials.
        csi.storage.k8s.io/provisioner-secret-name: rook-csi-rbd-provisioner
        csi.storage.k8s.io/provisioner-secret-namespace: rook-ceph
        csi.storage.k8s.io/controller-expand-secret-name: rook-csi-rbd-provisioner
        csi.storage.k8s.io/controller-expand-secret-namespace: rook-ceph
        csi.storage.k8s.io/node-stage-secret-name: rook-csi-rbd-node
        csi.storage.k8s.io/node-stage-secret-namespace: rook-ceph
        # Specify the filesystem type of the volume. If not specified, csi-provisioner
        # will set default as `ext4`. Note that `xfs` is not recommended due to potential deadlock
        # in hyperconverged settings where the volume is mounted on the same node as the osds.
        csi.storage.k8s.io/fstype: ext4

# Do not create default Ceph file systems, object stores
cephFileSystems:
cephObjectStores:

# Spawn rook-ceph-tools, useful for troubleshooting
toolbox:
  enabled: true
  resources:
EOF
```

## PRODUCTION SETUP

### Core Configuration

1. **Device Filter**: Update `deviceFilter` to match your disk specifications.
2. **Storage Class**: Change the `storageClass` name from `beta3` to a suitable one, as specified in the [Storage Class Types table](#storage-class-types).
3. **OSDs Per Device**: Adjust `osdsPerDevice` according to the guidelines provided in the aforementioned table.
4. **Node Configuration**: In the `nodes` section, add your nodes for Ceph storage, ensuring to replace `node1`, `node2`, etc., with the actual names of your Kubernetes nodes.

### Configuration for a Single Storage Node

For a setup involving a single storage node with multiple storage drives (minimum: 3 drives, or 2 drives if `osdsPerDevice` = 2):

1. **Failure Domain**: Set `failureDomain` to `osd`.
2. **Size Settings**:
   - The `size` and `osd_pool_default_size` should always be set to `osdsPerDevice + 1` when `failureDomain` is set to `osd`.
   - Set `min_size` and `osd_pool_default_min_size` to `2`.
   - Set `size` and `osd_pool_default_size` to `3`. Note: These can be set to `2` if you have a minimum of 3 drives and `osdsPerDevice` is `1`.

```
cat > rook-ceph-cluster.values.yml << 'EOF'
operatorNamespace: rook-ceph

configOverride: |
  [global]
  osd_pool_default_pg_autoscale_mode = on
  osd_pool_default_size = 3
  osd_pool_default_min_size = 2

cephClusterSpec:

  mon:
    count: 3
  mgr:
    count: 2

  storage:
    useAllNodes: false
    useAllDevices: false
    deviceFilter: "^nvme."
    config:
      osdsPerDevice: "2"
    nodes:
    - name: "node1"
      config:
    - name: "node2"
      config:
    - name: "node3"
      config:

cephBlockPools:
  - name: akash-deployments
    spec:
      failureDomain: host
      replicated:
        size: 3
      parameters:
        min_size: "2"
        bulk: "true"
    storageClass:
      enabled: true
      name: beta3
      isDefault: true
      reclaimPolicy: Delete
      allowVolumeExpansion: true
      parameters:
        # RBD image format. Defaults to "2".
        imageFormat: "2"
        # RBD image features. Available for imageFormat: "2". CSI RBD currently supports only `layering` feature.
        imageFeatures: layering
        # The secrets contain Ceph admin credentials.
        csi.storage.k8s.io/provisioner-secret-name: rook-csi-rbd-provisioner
        csi.storage.k8s.io/provisioner-secret-namespace: rook-ceph
        csi.storage.k8s.io/controller-expand-secret-name: rook-csi-rbd-provisioner
        csi.storage.k8s.io/controller-expand-secret-namespace: rook-ceph
        csi.storage.k8s.io/node-stage-secret-name: rook-csi-rbd-node
        csi.storage.k8s.io/node-stage-secret-namespace: rook-ceph
        # Specify the filesystem type of the volume. If not specified, csi-provisioner
        # will set default as `ext4`. Note that `xfs` is not recommended due to potential deadlock
        # in hyperconverged settings where the volume is mounted on the same node as the osds.
        csi.storage.k8s.io/fstype: ext4

# Do not create default Ceph file systems, object stores
cephFileSystems:
cephObjectStores:

# Spawn rook-ceph-tools, useful for troubleshooting
toolbox:
  enabled: true
  #resources:
EOF
```

- Install the Cluster chart:

```
helm install --create-namespace -n rook-ceph rook-ceph-cluster \
   --set operatorNamespace=rook-ceph rook-release/rook-ceph-cluster --version 1.16.5 -f rook-ceph-cluster.values.yml
```

#### STEP 3 - Label the storageClass

> This label is mandatory and is [used](https://github.com/akash-network/provider/blob/main/operator/inventory/ceph.go) by the Akash's `inventory-operator` for searching the storageClass.

- Change `beta3` to your `storageClass` you have picked before

```
kubectl label sc beta3 akash.network=true
```

#### STEP 4 - Update Failure Domain (Single Storage Node or All-In-One Scenarios Only)

> When running a single storage node or all-in-one, make sure to change the failure domain from `host` to `osd` for the `.mgr` pool.

```
kubectl -n rook-ceph exec -it $(kubectl -n rook-ceph get pod -l "app=rook-ceph-tools" -o jsonpath='{.items[0].metadata.name}') -- bash

ceph osd crush rule create-replicated replicated_rule_osd default osd
ceph osd pool set .mgr crush_rule replicated_rule_osd
```

## Check Persistent Storage Health

### Persistent Storage Status Check

```
kubectl -n rook-ceph get cephclusters
```

#### **Expected Output**

```
root@node1:~/akash# kubectl -n rook-ceph get cephclusters

NAME        DATADIRHOSTPATH   MONCOUNT   AGE     PHASE   MESSAGE                        HEALTH      EXTERNAL
rook-ceph   /var/lib/rook     1          5m18s   Ready   Cluster created successfully   HEALTH_OK
```

## Provider Attributes and Pricing Adjustments

### Attribute Adjustments

- Conduct the steps in this section on the Kubernetes control plane from which the provider was configured in prior steps
- Adjust the following key-values pairs as necessary within the `provider-storage.yaml` file created below:
  - Update the values of the `capabilities/storage/2/class` key to the correct class type (I.e. `beta2`). Reference the [Storage Class Types](#storage-class-types) doc section for additional details.
  - Update the region value from current `us-west` to an appropriate value such as `us-east` OR `eu-west`

- Ensure that necessary [environment variables](/docs/providers/build-a-cloud-provider/akash-cli/akash-cloud-provider-build-with-helm-charts#step-8---provider-build-via-helm-chart) are in place prior to issuing

##### Caveat on Attributes Updates in Active Leases

- If your provider has active leases, attributes that were used during the creation of those leases cannot be updated
- Example - if a lease was created and is active on your provider with `key=region` and `value=us-east`- it would not be possible to update the `region` attribute without closing those active leases prior

##### Helm Chart Update

```
cd ~

helm repo update
```

#### Capture and Edit provider.yaml File

- In this section we will capture the current provider settings and add necessary persistent storage elements

- _**NOTE**_ - the `bidpricestoragescale` setting in the `provider.yaml` file will be ignored if the [bid pricing script](/docs/providers/build-a-cloud-provider/akash-cli/akash-provider-bid-pricing-calculation/) is used.

##### **Capture Current Provider Settings and Write to File**

```
cd ~

helm -n akash-services get values akash-provider > provider.yaml
```

##### **Update provider.yaml File With Persistent Storage Settings**

- Open the `provider.yaml` file with your favorite editor (I.e. `vi` or `vim`) and add the following

```
attributes:
<keep the existing ones and add the following ones:>
  - key: capabilities/storage/1/class
    value: beta2             # set your storage class here: beta1, beta2 or beta3!
  - key: capabilities/storage/1/persistent
    value: true
```

And add this attribute if you are not using the bid pricing script:

```
bidpricestoragescale: "0.00016,beta2=0.00016" # set your storage class here: beta1, beta2 or beta3!
```

##### Finalized provider.yaml File

- Post additions discussed above, your `provider.yaml` file should look something like this:

```
---
from: "$ACCOUNT_ADDRESS"
key: "$(cat ~/key.pem | openssl base64 -A)"
keysecret: "$(echo $KEY_PASSWORD | openssl base64 -A)"
domain: "$DOMAIN"
node: "$NODE"
withdrawalperiod: 24h
attributes:
  - key: region
    value: "<YOUR REGION>"   # set your region here, e.g. "us-west"
  - key: host
    value: akash
  - key: tier
    value: community
  - key: organization
    value: "<YOUR ORG>"      # set your organization name here
  - key: capabilities/storage/1/class
    value: beta2             # set your storage class here: beta1, beta2 or beta3!
  - key: capabilities/storage/1/persistent
    value: true

bidpricestoragescale: "0.00016,beta2=0.00016" # set your storage class here: beta1, beta2 or beta3!
```

#### Upgrade the Helm Install

```
# Make sure you have "provider.yaml" previously created!
helm upgrade --install akash-provider akash/provider -n akash-services -f provider.yaml
```

##### Expected/Example Output

```
NAME: akash-provider
LAST DEPLOYED: Wed May 11 13:45:56 2022
NAMESPACE: akash-services
STATUS: deployed
REVISION: 1
TEST SUITE: None
```

## Verify Provider Settings

- Issue the following command to verify values applied by Helm

```
helm -n akash-services get values akash-provider
```

### Example/Expected Output

```
helm -n akash-services get values akash-provider

USER-SUPPLIED VALUES:
attributes:
- key: region
  value: europe
- key: host
  value: akash
- key: tier
...
...
bidpricestoragescale: "0.00016"
domain: REDACTED
from: akash1REDACTED
image:
  tag: 0.1.0
...
```

## Provider Status

- Note - the Helm upgrade will spawn a new provider pod
- Possible the prior provider pod may show with a status of deleting on initial view and then would eventually disappear from output

```
kubectl get pods -n akash-services
```

#### Expected/Example Output

```
root@node1:~/helm-charts/charts# kubectl get pods -n akash-services

NAME                                 READY   STATUS    RESTARTS   AGE
akash-provider-6bf9986cdc-btvlg      1/1     Running   0          3m13s
```

## Label Nodes For Storage Classes

Each node serving persistent storage will automatically get `akash.network/capabilities.storage.class.beta3=1` by the `inventory-operator`. (This could be `beta2` or `beta1` instead of `beta3` depending on your type of storage)

> _**NOTE**_ - currently the Helm Charts for persistent storage support only a single storageclass per cluster. All nodes in the cluster should be marked as `beta2` - as an example - and cannot have a mix of `beta2` and `beta3` nodes.

- Ensure that this command is issued - one at a time - for all nodes serving persistent storage

### List Kubernetes Node Names

- Use this command to capture the node names for the subsequent step

```
kubectl get nodes
```

## Inventory Operator

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

## Verify Node Labels For Storage Classes

### Overview

Each node serving persistent storage will automatically get `akash.network/capabilities.storage.class.beta3=1` by the `inventory-operator`. (This could be `beta2` or `beta1` instead of `beta3` depending on your type of storage)

As these labels are automatically applied and this section we will verify proper labeling.

> _**NOTE**_ - currently the Helm Charts for persistent storage support only a single storageclass per cluster. All nodes in the cluster should be marked as `beta2` - as an example - and cannot have a mix of `beta2` and `beta3` nodes.

### Node Label Verification

#### Verification Template

- Replace `<node-name>` with actual node name as gathered via `kubectl get nodes`

```
kubectl describe node <node-name> | grep -A10 Labels
```

#### Example/Expected Output

```
root@node1:~# kubectl describe node node2 | grep -A10 Labels
Labels:             akash.network=true
                    akash.network/capabilities.storage.class.beta2=1
                    akash.network/capabilities.storage.class.default=1
                    allow-nvdp=true
                    beta.kubernetes.io/arch=amd64
                    beta.kubernetes.io/os=linux
                    kubernetes.io/arch=amd64
                    kubernetes.io/hostname=node2
```

## Verifications

Several provider verifications and troubleshooting options are presented in this section which aid in persistent storage investigations including:

- [Ceph Status and Health](#ceph-status-and-health)
- [Ceph Configuration and Detailed Health](#ceph-configuration-and-detailed-health)
- [Ceph Related Pod Status](#ceph-related-pod-status)
- [Kubernetes General Events](#kubernetes-general-events)

### Ceph Status and Health

```
kubectl -n rook-ceph get cephclusters
```

##### **Example Output**

```
root@node1:~/helm-charts/charts# kubectl -n rook-ceph get cephclusters

NAME        DATADIRHOSTPATH   MONCOUNT   AGE   PHASE   MESSAGE                        HEALTH      EXTERNAL
rook-ceph   /var/lib/rook     1          69m   Ready   Cluster created successfully   HEALTH_OK
```

### Ceph Configuration and Detailed Health

```
kubectl -n rook-ceph describe cephclusters
```

##### **Example Output (Tail Only)**

- Ensure the name is correct in the Nodes section
- The `Health` key should have a value of `HEALTH_OK` as shown in example output below
- Review any output of interest in the Events section

```
 Storage:
    Config:
      Osds Per Device:  1
    Nodes:
      Name:  node2
      Resources:
    Use All Devices:                        true
  Wait Timeout For Healthy OSD In Minutes:  10
Status:
  Ceph:
    Capacity:
      Bytes Available:  107333730304
      Bytes Total:      107369988096
      Bytes Used:       36257792
      Last Updated:     2022-05-05T18:43:50Z
    Health:             HEALTH_OK
    Last Checked:       2022-05-05T18:43:50Z
    Versions:
      Mgr:
        ceph version 16.2.5 (0883bdea7337b95e4b611c768c0279868462204a) pacific (stable):  1
      Mon:
        ceph version 16.2.5 (0883bdea7337b95e4b611c768c0279868462204a) pacific (stable):  1
      Osd:
        ceph version 16.2.5 (0883bdea7337b95e4b611c768c0279868462204a) pacific (stable):  3
      Overall:
        ceph version 16.2.5 (0883bdea7337b95e4b611c768c0279868462204a) pacific (stable):  5
  Conditions:
    Last Heartbeat Time:   2022-05-05T18:43:51Z
    Last Transition Time:  2022-05-05T17:34:32Z
    Message:               Cluster created successfully
    Reason:                ClusterCreated
    Status:                True
    Type:                  Ready
  Message:                 Cluster created successfully
  Phase:                   Ready
  State:                   Created
  Storage:
    Device Classes:
      Name:  ssd
  Version:
    Image:    ceph/ceph:v16.2.5
    Version:  16.2.5-0
Events:       <none>
```

### **Ceph Related Pod Status**

```
kubectl -n rook-ceph get pods
```

##### Example Output

```
root@node1:~/akash# kubectl -n rook-ceph get pods

NAME                                              READY   STATUS      RESTARTS   AGE
csi-cephfsplugin-269qv                            3/3     Running     0          77m
csi-cephfsplugin-provisioner-5c8b6d6f4-9j4tm      6/6     Running     0          77m
csi-cephfsplugin-provisioner-5c8b6d6f4-gwhhh      6/6     Running     0          77m
csi-cephfsplugin-qjp86                            3/3     Running     0          77m
csi-rbdplugin-nzm45                               3/3     Running     0          77m
csi-rbdplugin-provisioner-8564cfd44-55gmq         6/6     Running     0          77m
csi-rbdplugin-provisioner-8564cfd44-gtmqb         6/6     Running     0          77m
csi-rbdplugin-t8klb                               3/3     Running     0          77m
rook-ceph-crashcollector-node2-74c68c58b7-kspv6   1/1     Running     0          77m
rook-ceph-mgr-a-6cd6ff8c9f-z6fvk                  1/1     Running     0          77m
rook-ceph-mon-a-79fdcc8b9c-nr5vf                  1/1     Running     0          77m
rook-ceph-operator-bf9c6fd7-px76k                 1/1     Running     0          79m
rook-ceph-osd-0-747fcf4864-mrq6f                  1/1     Running     0          77m
rook-ceph-osd-prepare-node2-x4qqv                 0/1     Completed   0          76m
rook-ceph-tools-6646766697-lgngb                  1/1     Running     0          79m
```

### Kubernetes General Events

- Enters a scrolling events output which would display persistent storage logs and issues if present

```
kubectl get events --sort-by='.metadata.creationTimestamp' -A -w
```

##### Example Output from a Healthy Cluster

```
root@node1:~/helm-charts/charts# kubectl get events --sort-by='.metadata.creationTimestamp' -A -w

warning: --watch or --watch-only requested, --sort-by will be ignored

NAMESPACE        LAST SEEN   TYPE     REASON              OBJECT                                     MESSAGE
akash-services   37m         Normal   ScalingReplicaSet   deployment/akash-provider                  Scaled up replica set akash-provider-6bf9986cdc to 1
akash-services   37m         Normal   Scheduled           pod/akash-provider-6bf9986cdc-btvlg        Successfully assigned akash-services/akash-provider-6bf9986cdc-btvlg to node2
akash-services   37m         Normal   SuccessfulCreate    replicaset/akash-provider-6bf9986cdc       Created pod: akash-provider-6bf9986cdc-btvlg
akash-services   37m         Normal   SuccessfulDelete    replicaset/akash-provider-76966c6795       Deleted pod: akash-provider-76966c6795-lvphs
akash-services   37m         Normal   Created             pod/akash-provider-6bf9986cdc-btvlg        Created container provider
akash-services   36m         Normal   Killing             pod/akash-provider-76966c6795-lvphs        Stopping container provider
akash-services   37m         Normal   Pulled              pod/akash-provider-6bf9986cdc-btvlg        Container image "ghcr.io/ovrclk/akash:0.1.0" already present on machine
akash-services   37m         Normal   ScalingReplicaSet   deployment/akash-provider                  Scaled down replica set akash-provider-76966c6795 to 0
akash-services   37m         Normal   Started             pod/akash-provider-6bf9986cdc-btvlg        Started container provider
akash-services   30m         Normal   SuccessfulCreate    replicaset/inventory-operator-645fddd5cc   Created pod: inventory-operator-645fddd5cc-86jr9
akash-services   30m         Normal   ScalingReplicaSet   deployment/inventory-operator              Scaled up replica set inventory-operator-645fddd5cc to 1
akash-services   30m         Normal   Scheduled           pod/inventory-operator-645fddd5cc-86jr9    Successfully assigned akash-services/inventory-operator-645fddd5cc-86jr9 to node2
akash-services   30m         Normal   Pulling             pod/inventory-operator-645fddd5cc-86jr9    Pulling image "ghcr.io/ovrclk/k8s-inventory-operator"
akash-services   30m         Normal   Created             pod/inventory-operator-645fddd5cc-86jr9    Created container inventory-operator
akash-services   30m         Normal   Started             pod/inventory-operator-645fddd5cc-86jr9    Started container inventory-operator
akash-services   30m         Normal   Pulled              pod/inventory-operator-645fddd5cc-86jr9    Successfully pulled image "ghcr.io/ovrclk/k8s-inventory-operator" in 5.154257083s
ingress-nginx    12m         Normal   RELOAD              pod/ingress-nginx-controller-59xcv         NGINX reload triggered due to a change in configuration
ingress-nginx    12m         Normal   RELOAD              pod/ingress-nginx-controller-tk8zj         NGINX reload triggered due to a change in configuration
```

## Teardown

If a problem is experienced during persistent storage enablement, review and follow the steps provided in these guides to begin anew.

1. [https://rook.io/docs/rook/latest-release/Helm-Charts/ceph-cluster-chart/?h=ceph+cluster+helm+chart#uninstalling-the-chart](https://rook.io/docs/rook/latest-release/Helm-Charts/ceph-cluster-chart/?h=ceph+cluster+helm+chart#uninstalling-the-chart)
2. [https://rook.io/docs/rook/latest-release/Helm-Charts/operator-chart/?h=ceph+operator+helm+chart#uninstalling-the-chart](https://rook.io/docs/rook/latest-release/Helm-Charts/operator-chart/?h=ceph+operator+helm+chart#uninstalling-the-chart)
3. [https://rook.io/docs/rook/latest-release/Getting-Started/ceph-teardown/?h=cleaning+up+cluste](https://rook.io/docs/rook/latest-release/Getting-Started/ceph-teardown/?h=cleaning+up+cluste)
