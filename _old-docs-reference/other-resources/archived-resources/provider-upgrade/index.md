---
categories: ["Other Resources", "Archived Resources"]
tags: []
weight: 2
title: "Provider Upgrade"
linkTitle: "Provider Upgrade"
---

The upgrade instructions provided in this guide pertain to Akash providers installed via Helm Charts.

If your provider was installed using Praetor, please visit the [Praetor Discord](http://discord.gg/uzUCHTF93D) server for upgrade guidance and inquiries.

> All providers _**MUST**_ upgrade their Akash Provider and related components (RPC Node, CRDs, etc) on the date of the `Mainnet4` upgrade (November 17th 2022) to avoid disruption. Providers which are not upgrade post `Mainnet4` will be unable to bid on new orders. Pre-existing deployments on non-upgraded providers will not incur service disruption. But the ability to bid on new deployments, allow container shell access, and other features will be impacted until the provider's RPC nodes are upgraded to `0.18.0` and Providers are upgraded to use Provider Services version `0.1.0`.

> _**NOTE**_ - please do not attempt to upgrade your provider until the `Mainnet4` upgrade has been completed. The Helm Charts will be updated to the use the correct/current binaries on the day of the `Mainnet4` upgrade.

## Provider Upgrade Procedure

### Update Local Helm Repo

```
helm repo update akash
```

### RPC Node

```
helm -n akash-services get values akash-node | grep -v '^USER-SUPPLIED VALUES' > akash-node-values.yml
```

- Prior to executing the Helm Upgrade command - inspect `akash-node-values.yml` for `image tag` and remove it if present

```
helm upgrade akash-node akash/akash-node -n akash-services -f akash-node-values.yml
```

### Akash Provider

#### Annotate CRDs

Annotate your current CRDs if you haven't yet, they are normally delivered by the helm-charts, but they were missing in some releases. They prevent CRD from being removed upon helm uninstall.

```
kubectl annotate crd manifests.akash.network helm.sh/resource-policy=keep
kubectl annotate crd providerhosts.akash.network helm.sh/resource-policy=keep
kubectl annotate crd providerleasedips.akash.network helm.sh/resource-policy=keep
```

> If you get some errors, ignore them. Most likely you already have these annotations set in place.&#x20;
>
> It is normal if you do not have providerleasedips yet, it comes with mainnet4 upgrade only.

#### Manifest Backup

- Backup all provider manifest prior to initiating the upgrade process
- You can restore them later if you lose them (e.g. by using kubectl apply -f manifests-backup.yaml). To verify the CRD contents use kubectl -n lease get manifests command. (Change manifests to providerhosts or providerleasedips depending on CRD you are verifying).

```
kubectl -n lease get manifests -o yaml > manifests-backup.yaml

kubectl -n lease get providerhosts -o yaml > providerhosts-backup.yaml

# this is only valid for akash-ip-operator

kubectl -n lease get providerleasedips -o yaml > providerleasedips-backup.yaml
```

#### Provider Upgrade

```
helm -n akash-services get values akash-provider | grep -v '^USER-SUPPLIED VALUES' > akash-provider-values.yml
```

- With the release of the akash-provider helm-chart version 4.0.5, the provider is now deployed as a StatefulSet.&#x20;
- &#x20;Use the following step to uninstall any pre-existing Provider instances which used `Deployment` kubernetes resource type before deploying a new one. But first, backup the values using `helm get values ....` command as covered in prior step.

```
helm -n akash-services uninstall akash-provider
```

- Prior to executing the Helm Upgrade command - inspect `akash-provider-values.yml` for `image tag` and remove it if present

```
helm upgrade --install akash-provider akash/provider -n akash-services -f akash-provider-values.yml
```

### Hostname Operator

#### Ensure Any Prior Hostname Operator Instances are Uninstalled

```
helm uninstall hostname-operator -n akash-services
```

#### Install/Upgrade the Hostname Operator

```
helm upgrade --install akash-hostname-operator akash/akash-hostname-operator -n akash-services
```

### Inventory Operator

- Only necessary if providing persistent storage

```
helm upgrade inventory-operator akash/akash-inventory-operator -n akash-services
```

### Ingress Controller (Optional)

```
helm -n ingress-nginx get values akash-ingress | grep -v '^USER-SUPPLIED VALUES' > akash-ingress-values.yml
```

- Prior to executing the Helm Upgrade command - inspect `akash-ingress-values.yml` for image tag and remove it if present

```
helm upgrade akash-ingress akash/akash-ingress -n ingress-nginx -f akash-ingress-values.yml
```

- Issue following to unblock the akash-provider `8443/tcp port` in case you have been using a very old `akash-ingress` helm chart which used the deployment k8s kind of resource

```
kubectl -n ingress-nginx delete deployment ingress-nginx-controller
```
