---
categories: ["Other Resources", "Archived Resources"]
tags: []
weight: 2
title: "Provider Upgrade Instructions 0.1.0 to 0.2.1"
linkTitle: "Provider Upgrade Instructions 0.1.0 to 0.2.1"
---

## Backup Manifests & CRDs

Before doing the upgrade, please make sure to backup the manifests and CRDs:

```
mkdir before
cd before
for i in manifests providerhosts providerleasedips; do kubectl get crd $i.akash.network -o yaml > $i-backup.crd.yaml; kubectl -n lease get $i -o yaml > $i-backup.yaml; done
```

They can help in troubleshooting the issues should any arise later.

## akash-provider

Upgrading akash-provider from 0.1.0 to 0.2.1.

**STEP1** - Patch the CRD using this command:

```
kubectl patch crd manifests.akash.network --type='json' -p='[{"op": "add", "path": "/spec/versions/0/schema/openAPIV3Schema/properties/spec/properties/group/properties/services/items/properties/command", "value":{"type":"array"}}, {"op": "add", "path": "/spec/versions/0/schema/openAPIV3Schema/properties/spec/properties/group/properties/services/items/properties/command/items", "value":{"type":"string"}}]'
```

**STEP2** - Delete `akash-provider-statefulset-restart` cronjob

```
kubectl -n akash-services delete cronjob.batch/akash-provider-statefulset-restart rolebinding.rbac.authorization.k8s.io/provider-restart role.rbac.authorization.k8s.io/provider-restart serviceaccount/provider-restart
```

**STEP3** - Update helm-chart repo

```
helm repo remove akash
helm repo add akash https://akash-network.github.io/helm-charts
helm repo update akash
```

**STEP4** - Verify the version

> APP version should be: `0.2.1`

```
# helm search repo akash/provider
NAME          	CHART VERSION	APP VERSION	DESCRIPTION
akash/provider	4.2.3        	0.2.1      	Installs an Akash provider (required)
```

**STEP5** - Update akash-provider helm-chart

Save current akash-provider config to akash-provider-values.yml file:

```
helm -n akash-services get values akash-provider | grep -v '^USER-SUPPLIED VALUES' > akash-provider-values.yml
```

Inspect `akash-provider-values.yml` file and make sure to remove `image.tag`, `image.repository` directives from your config.

Upgrade the akash-provider chart:

```
helm upgrade --install akash-provider akash/provider -n akash-services -f akash-provider-values.yml
```

## akash-node

Upgrading akash-node from 0.20.0 to 0.22.0.

**STEP1** - Update helm-chart repo

```
helm repo remove akash
helm repo add akash https://akash-network.github.io/helm-charts
helm repo update akash
```

**STEP2** - Verify the version

> APP version should be: `0.22.0`

```
# helm search repo akash/akash-node
NAME            	CHART VERSION	APP VERSION	DESCRIPTION
akash/akash-node	5.3.0        	0.22.0     	Installs an Akash RPC node (required)
```

**STEP3** - Update akash-node helm-chart

Save current akash-node config to `akash-node-values.yml` file:

```
helm -n akash-services get values akash-node | grep -v '^USER-SUPPLIED VALUES' > akash-node-values.yml
```

Inspect `akash-node-values.yml` file and make sure to remove `image.tag`, `image.repository` directives from your config.

Upgrade the akash-node chart:

```
helm upgrade --install akash-node akash/akash-node -n akash-services -f akash-node-values.yml
```
