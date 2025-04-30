---
categories: ["Providers"]
tags: ["Akash Provider", "IP", "Leases"]
weight: 5
title: "IP Leases Enablement"
linkTitle: "IP Leases Enablement"
---

In this guide we detail the enablement of IP Leases on a pre-existing Akash provider.

Please be aware of the following prerequisites prior to getting started.&#x20;

> _**NOTE**_ - IP Leases enablement is an optional step for Akash providers. Some providers may not have available public IP address pools and/or other requirements for enabling this feature.

## Prerequisites&#x20;


- Provider IP Leases enablement is only supported for Akash providers built using [Helm Charts](/docs/providers/build-a-cloud-provider/akash-cli/akash-cloud-provider-build-with-helm-charts/)

- Available pool of unallocated public IP addresses

## Sections in this Guide

- [Create the MetalLB Namespace](#create-the-metallb-namespace)
- [MetalLB Install](#metallb-install)
- [Enable strictARP in kube-proxy](#enable-strictarp-in-kube-proxy)
- [Akash Provider Update](#akash-provider-update)
- [IP Operator](#ip-operator)
- [Additional notes on the IP Operator](#additional-notes-on-the-ip-operator)
- [Troubleshooting IP Leases Issues](#troubleshooting-ip-leases-issues)

## Create the MetalLB Namespace

Issue the following command to create the necessary MetalLB namespace:

```
kubectl create ns metallb-system
```

## MetalLB Install

In this guide we present paths to install MetalLB both via Helm Charts and Kubespray. Please follow only the path applicable, ideal to your environment.

Sections within this guide:

- [New MetalLB Deployment via Helm](#option-1-deploy-metallb-with-helm)
- [New MetalLB Deployment via Kubespray](#option-2-deploy-metallb-using-kubespray)
- [Migration of MetalLB Version 0.12.X to 0.13.x](#migrating-metallb-012x-to-013x)

### Option 1: Deploy MetalLB with Helm

> _**NOTE**_ - If you plan to upgrade your MetalLB Helm-Chart in the future, ensure the [metallb release notes](https://metallb.universe.tf/release-notes/) are followed.

```
helm repo add metallb https://metallb.github.io/metallb

helm -n metallb-system install metallb metallb/metallb --version 0.14.9
```

### Expose your MetalLB Controller to the Akash IP Operator

```
kubectl -n metallb-system expose deployment metallb-controller --name=controller --overrides='{"spec":{"ports":[{"protocol":"TCP","name":"monitoring","port":7472}]}}'
```

### Apply your MetalLB Config

> _**NOTE**_ - make sure you replace the example addresses with your IP ranges

#### Create the MetalLB Config

```
cat > metallb-config.yaml << EOF
---
apiVersion: metallb.io/v1beta1
kind: IPAddressPool
metadata:
  name: default
  namespace: metallb-system
spec:
  addresses:
  - 144.217.30.192/28
  - 198.50.185.112/28
  - 66.70.218.96/28
  - 194.28.98.217/32
  - 194.28.98.219-194.28.98.222
  autoAssign: true
  avoidBuggyIPs: false
---
apiVersion: metallb.io/v1beta1
kind: L2Advertisement
metadata:
  creationTimestamp: null
  name: l2advertisement1
  namespace: metallb-system
spec:
  ipAddressPools:
  - default
EOF
```

#### Apply the MetalLB Config

```
kubectl apply -f metallb-config.yaml
```

> If you are using MetalLB with a kubernetes version that enforces [Pod Security Admission](https://kubernetes.io/docs/concepts/security/pod-security-admission/) (which is beta in k8s 1.23), make sure to label the metallb-system namespace with the following labels:

```
  labels:
    pod-security.kubernetes.io/enforce: privileged
    pod-security.kubernetes.io/audit: privileged
    pod-security.kubernetes.io/warn: privileged
```

## Option 2: Deploy MetalLB using Kubespray

Based on MetalLB via Kubespray guidance documented [here](https://github.com/kubernetes-sigs/kubespray/blob/v2.20.0/docs/metallb.md)


The Kubespray flags provided bellow should go into your Provider's Kubespray inventory file and under the vars section. Our reference Provider Kubespray inventory file - used during initial Provider Kubernetes cluster build - is located [here](/docs/providers/build-a-cloud-provider/akash-cli/kubernetes-cluster-for-akash-providers/kubernetes-cluster-for-akash-providers#step-4---ansible-inventory).


```
# akash provider needs metallb pool name set to `default` - https://github.com/akash-network/provider/blob/v0.1.0-rc13/cluster/kube/metallb/client.go#L43
metallb_pool_name: default
metallb_enabled: true
metallb_speaker_enabled: true
#metallb_avoid_buggy_ips: true
metallb_protocol: layer2
kube_proxy_strict_arp: true

# set your IP ranges here
metallb_ip_range:
  - 144.217.30.192/28
  - 198.50.185.112/28
  - 66.70.218.96/28
```

### Expose your MetalLB Controller to the Akash IP Operator

- Kubespray your cluster with this config and then expose your MetalLB controller for the Akash IP Operator access it

```
kubectl -n metallb-system expose deployment controller --overrides='{"spec":{"ports":[{"protocol":"TCP","name":"monitoring","port":7472}]}}'
```

## Migrating MetalLB 0.12.X to 0.13.X

> _**Perform the following only if you have upgraded your MetalLB from 0.12 (or prior) to 0.13 (or higher) version.**_

> Based on [https://metallb.universe.tf/configuration/migration_to_crds/](https://metallb.universe.tf/configuration/migration_to_crds/)

1\). Save the old v0.12 configmap-based metallb config to a `config.yaml` file

```
kubectl -n metallb-system get cm config -o yaml > config.yaml
```

2\). Use this command to migrate it to v0.13 (CRD-based format) - (`resources.yaml`)

```
docker run -d -v $(pwd):/var/input quay.io/metallb/configmaptocrs
```

This will produce a new config file - `resources.yaml`.

3\). Apply the new config

```
kubectl apply -f resources.yaml
```

4\). Remove the old config

```
kubectl -n metallb-system delete cm config
```

#### Example of Legacy v0.12 Metallb Configmap Based Config

- `config.yaml`

```
apiVersion: v1
data:
  config: |
    address-pools:
    - name: default
      protocol: layer2
      addresses:
      - 194.28.98.216/29
kind: ConfigMap
metadata:
  annotations:
    kubectl.kubernetes.io/last-applied-configuration: |
      {"apiVersion":"v1","data":{"config":"address-pools:\n- name: default\n  protocol: layer2\n  addresses:\n  - 194.28.98.216/29\n"},"kind":"ConfigMap","metadata":{"annotations":{},"name":"config","namespace":"metallb-system"}}
  creationTimestamp: "2023-02-20T10:35:36Z"
  name: config
  namespace: metallb-system
  resourceVersion: "150026"
  uid: fd35767f-2f35-4792-b4fd-01b1d9ce2cb8
```

#### Example of New metallb v0.13 CRD Based Config

- `resources.yaml`

```
# This was autogenerated by MetalLB's custom resource generator.
apiVersion: metallb.io/v1beta1
kind: IPAddressPool
metadata:
  creationTimestamp: null
  name: default
  namespace: metallb-system
spec:
  addresses:
  - 194.28.98.216/29
status: {}
---
apiVersion: metallb.io/v1beta1
kind: L2Advertisement
metadata:
  creationTimestamp: null
  name: l2advertisement1
  namespace: metallb-system
spec:
  ipAddressPools:
  - default
status: {}
---
```

## Enable strictARP in kube-proxy

If you're using kube-proxy in IPVS mode, since Kubernetes v1.14.2 you have to enable strict ARP mode.

> _**NOTE**_ - this is not needed if you're using kube-router as service-proxy because it is enabling strict ARP by default.

Achieve this by patching your kube-proxy config in current cluster:

```
# see what changes would be made, returns nonzero returncode if different
kubectl get configmap kube-proxy -n kube-system -o yaml | \
sed -e "s/strictARP: false/strictARP: true/" | \
kubectl diff -f - -n kube-system

# actually apply the changes, returns nonzero returncode on errors only
kubectl get configmap kube-proxy -n kube-system -o yaml | \
sed -e "s/strictARP: false/strictARP: true/" | \
kubectl apply -f - -n kube-system
```

- If using kubespray for your cluster deployment, make sure to add the following variable:

```
kube_proxy_strict_arp: true
```

## Akash Provider Update

### IP Leases Provider Setting

Update your provider configuration with the necessary IP Leases setting. The setting will be added via an edit of your `provider.yaml` file and subsequent provider Helm update as detailed in this section.

### Capture Current Provider Settings to File

- Issue this command to capture current provider settings and write to file

```
cd ~

helm -n akash-services get values akash-provider | grep -v ^USER > provider.yaml
```

### Update Provider Settings

Open the file containing the current provider settings

```
cd ~

vi provider.yaml
```

> _**NOTE**_ - we will make two updates to the `provider.yaml` file in section. One update will enable the IP Operator. The second update will ensure the provider is advertising the `ip-lease` attribute.

#### Add the IP Operator Key-Value Pair

```
ipoperator: true
```

#### Attribute Update

Update your provider to advertise the following attribute. This attribute can be used (by users deploying on Akash) to select providers supporting the IP Lease.

```
- key: ip-lease
  value: true
```

#### Example Provider YAML Post Updates

```
attributes:
- key: region
  value: eu-west
- key: host
  value: akash
- key: tier
  value: community
- key: organization
  value: chainzero
- key: ip-lease
  value: true
domain: akashtesting.xyz
from: akash1xmz9es9ay9ln9x2m3q8dlu0alxf0ltce7ykjfx
key: <redacted>
keysecret: <redacted>
node: http://akash.c29r3.xyz:80/rpc
withdrawalperiod: 24h
ipoperator: true
```

### Update Provider Command Template

```
helm upgrade akash-provider akash/provider -n akash-services -f provider.yaml
```

#### Expected/Example Output

```
root@node1:~/provider# helm upgrade akash-provider akash/provider -n akash-services -f provider.yaml --set ipoperator=true
Release "akash-provider" has been upgraded. Happy Helming!
NAME: akash-provider
LAST DEPLOYED: Wed Aug 10 20:35:10 2022
NAMESPACE: akash-services
STATUS: deployed
REVISION: 2
TEST SUITE: None
```

## Verification

Run the following command to verify the IP Operator setting

```
kubectl -n akash-services get statefulsets akash-provider -o yaml | grep -i -A1 ip_oper
```

#### Expected/Example Output

```
# kubectl -n akash-services get statefulsets akash-provider -o yaml | grep -i -A1 ip_oper
        - name: AKASH_IP_OPERATOR
          value: "true"
```

## IP Operator

Create the necessary IP Operator for IP Leases provider enablement.

### Command Template

- Replace `<provider-address>` with the address of your provider

```
helm install akash-ip-operator akash/akash-ip-operator -n akash-services --set provider_address=<provider-address>
```

### Example Command

```
helm install akash-ip-operator akash/akash-ip-operator -n akash-services --set provider_address=akash1hwmenz63dp59uve5ytea09suwgr47y3rn9902y
```

### Example Output

```
helm install akash-ip-operator akash/akash-ip-operator -n akash-services --set provider_address=akash1hwmenz63dp59uve5ytea09suwgr47y3rn9902y

NAME: akash-ip-operator
LAST DEPLOYED: Wed Aug 10 20:43:38 2022
NAMESPACE: akash-services
STATUS: deployed
REVISION: 1
TEST SUITE: None
```

## Additional notes on the IP Operator

If running non-Helm-based Akash Provider, then make sure to set the following&#x20;

```
AKASH_IP_OPERATOR=true
```

- Alternatively this could be passed in via CLI argument

```
provider-services run --ip-operator=true
```

- Additional ensure that the Akash provider IP operator is running (`provider-services ip-operator`)

## Troubleshooting IP Leases Issues

### Issues Following IP Leases Install

If either of the symptoms listed in this section are apparent following initial IP Leases installation, cure the issue by bouncing the `ip-operator` pod as follows:

```
kubectl -n akash-services delete pod -l app=akash-ip-operator
```

#### Symptoms

1. The Akash Provider isn't replying to 8443/status endpoint (I.e. `curl -ks https://provider.xyz.com:8443/status`)
2. The `akash-ip-operator` has `barrier is locked messages` in its logs. Which can be gathered via:

```
kubectl -n akash-services logs -l akash.network/component=akash-ip-operator -f
```

##### Example Log Output When Issue Exists

```
kubectl -n akash-services logs -l akash.network/component=akash-ip-operator -f
...
E[2023-06-22|13:11:42.428] barrier is locked, can't service request     operator=ip path=/health
E[2023-06-22|13:11:44.430] barrier is locked, can't service request     operator=ip path=/health
```
