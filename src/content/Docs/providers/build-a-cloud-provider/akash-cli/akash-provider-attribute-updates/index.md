---
categories: ["Akash Provider"]
tags: ["Akash Provider", "Attributes", "Updates"]
weight: 6
title: "Provider Attribute Updates"
linkTitle: "Provider Attribute Updates"
---

## Initial Guidance and Assumptions

- Conduct all steps in this guide from a Kubernetes control plane node in your Akash Provider cluster.
- Guide assumes that your Akash Provider was installed via Helm Charts as detailed in this [guide](/docs/providers/build-a-cloud-provider/akash-cli/helm-based-provider-persistent-storage-enablement/).
- Guide assumes that the Kubernetes control plane node used has Helm installed. Refer to this [guide](/docs/providers/build-a-cloud-provider/akash-cli/helm-based-provider-persistent-storage-enablement/#step-4-helm-installation-on-kubernetes-node) step if a Helm install is needed. Return to this guide once Helm install is completed.

## Caveats

### Attributes in Active Leases

- If your provider has active leases, attributes that were used during the creation of those leases cannot be updated
- Example - if a lease was created and is active on your provider with `key=region` and `value=us-east`- it would not be possible to update the `region` attribute without closing those active leases prior

## Pre-Update Attribute Captures

- Prior to updating the Provider's attributes, capture the current attributes
- We will use this current capture to compare against the updated provider subsequently

### On Chain Current Attributes Capture

#### Command Template

- Replace the `<provider-address>` variable with the address of your provider

```
provider-services query provider get <provder-address>
```

#### Example Command

```
provider-services query provider get akash1xmz9es9ay9ln9x2m3q8dlu0alxf0ltce7ykjfx
```

#### Expected/Example Output

```
attributes:
- key: region
  value: us-central
- key: host
  value: akash
- key: tier
  value: community
- key: organization
  value: akashtesting
host_uri: https://provider.akashtesting.xyz:8443
info:
  email: ""
  website: ""
owner: akash1xmz9es9ay9ln9x2m3q8dlu0alxf0ltce7ykjfx
```

## Provider Update

### Capture Current Provider Settings to File

- Issue this command to capture current provider settings and write to file

```
cd ~

helm -n akash-services get values akash-provider | grep -v ^USER > provider.yaml
```

### Update Provider Settings

- Open the file containing the current provider settings and update attribute key-value pairs as desired

```
cd ~

vi provider.yaml
```

#### Example Provider YAML Update

- If compared to the initial `provider.yaml` file - updates have been made to the `region` and `organization` values have been updated

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
domain: akashtesting.xyz
from: akash1xmz9es9ay9ln9x2m3q8dlu0alxf0ltce7ykjfx
key: <redacted>
keysecret: <redacted>
node: http://akash.c29r3.xyz:80/rpc
withdrawalperiod: 24h
```

### Update Provider

```
cd ~

helm upgrade akash-provider akash/provider -n akash-services -f provider.yaml
```

#### Expected Output of Helm Upgrade

```
Release "akash-provider" has been upgraded. Happy Helming!
NAME: akash-provider
LAST DEPLOYED: Fri Jul  8 14:31:24 2022
NAMESPACE: akash-services
STATUS: deployed
REVISION: 2
TEST SUITE: None
```

## Post Update Verifications

### On Chain Post Update Attributes Verification

#### Command Template

```
provider-services query provider get <provder-address>
```

#### Example Command

```
provider-services query provider get akash1xmz9es9ay9ln9x2m3q8dlu0alxf0ltce7ykjfx
```

#### Expected/Example Output

- Ensure that the new/updated attributes are now active

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
host_uri: https://provider.akashtesting.xyz:8443
info:
  email: ""
  website: ""
owner: akash1xmz9es9ay9ln9x2m3q8dlu0alxf0ltce7ykjfx
```
