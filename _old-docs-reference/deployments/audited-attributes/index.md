---
categories: ["Akash CLi"]
tags: []
weight: 5
title: "Akash Audited Attributes"
linkTitle: "Akash Audited Attributes"
---

Audited Attributes allow a user to filter which providers can bid on their project. In the use of a Stack Definition Language (SDL) file Audited Attributes enable:

- Deployers to declare mandatory provider attributes, meaning leases will only be generated on platforms that fulfill the developers needs.&#x20;
- Deployers can declare the address of an independent auditor who has validated the provider attributes.

In this guide we will show detailed examples of Audited Attribute usage and best practises.

Deployer usage of Audited Attributes within SDL files is the focus of this document. The mechanics involved in becoming an auditor and auditing provider resources will be covered in separate, provider centric documentation.

## Sample SDL Deployment

We will use the following sample SDL deployment file throughout this guide to explore the use of attributes and auditors.

The SDL example will provision two light-weight, redundant web servers using the Lunie Light container image.

```
version: "2.0"
services:
 web:
   image: ovrclk/lunie-light
   expose:
     - port: 3000
       as: 80
       to:
         - global: true
profiles:
 compute:
   web:
     resources:
       cpu:
         units: 0.1
       memory:
         size: 512Mi
       storage:
         size: 512Mi
 placement:
   ewr1-provider0:
     attributes:
       host: akash
       datacenter: equinix-metal-ewr1
     signedBy:
       anyOf:
         - akash1365yvmc4s7awdyj3n2sav7xfx76adc6dnmlx63
     pricing:
       web:
         denom: uakt
         amount: 100
   sjc1-provider0:
     attributes:
       host: akash
       datacenter: equinix-metal-sjc1
     signedBy:
       anyOf:
         - akash1365yvmc4s7awdyj3n2sav7xfx76adc6dnmlx63
     pricing:
       web:
         denom: uakt
         amount: 100
deployment:
 web:
   ewr1-provider0:
     profile: web
     count: 1
   sjc1-provider0:
     profile: web
     count: 1
```

## SDL Attributes

### Attribute Location Within the SDL

Using the example SDL provided previously, let’s take a look at the profiles section.

```
profiles:
 compute:
   web:
     resources:
       cpu:
         units: 0.1
       memory:
         size: 512Mi
       storage:
         size: 512Mi
 placement:
   ewr1-provider0:
     attributes:
       host: akash
       datacenter: equinix-metal-ewr1
     signedBy:
       anyOf:
         - akash1365yvmc4s7awdyj3n2sav7xfx76adc6dnmlx63
     pricing:
       web:
         denom: uakt
         amount: 100
```

From the isolated SDL section above observe the following from the top down:

1. Attributes are declared within the “profiles” section. The “profiles” section defines compute and placement requirements.&#x20;
2. The “attributes” key is placed within the “placement” section.&#x20;
3. Within the example SDL two unique “attributes” are defined:
   - host: akash&#x20;
   - datacenter: equinix-metal-ewr1

### Attribute Syntax

Referring to the “profiles” SDL section we saw previously - note the following details of “attributes” syntax:

- Attributes are declared key-value pairs with the key and value both strings.&#x20;
- The attribute key-value pairs could be any values but must match the attributes declared by desired providers.&#x20;
- Providers analyze the submitted SDL files and will only bid on projects for which they satisfy the attribute list.

An example attribute would be a location key-value pair which could be used to ensure the deployment is hosted in a specific physical region such as locale: west.

### Attribute Impact

When a user creates a deployment that includes attributes they are ensuring that only providers which have matching attributes are eligible to host their workloads. Referencing the example SDL file and the isolated placement section - the only eligible providers would be those which have declared:

- The host attribute of value akash&#x20;
- The datacenter attribute of value equinix-metal-ewr1

### Attribute Additional Notes

_**No Attribute/Attributes Defined**_

Attributes are an optional parameter in the Akash SDL. A valid manifest may include no attribute section/key.

_**Attribute Governance**_

No governance is available to ensure that the attributes declared by the provider are actual or valid. In theory any provider may declare they satisfy the “host: akash” condition and send bids to any user requiring that attribute. Verification of the attributes to ensure a provider satisfies the claim of the attribute is the role of an auditor and is the subject of the subsequent section.

## Attribute Auditors

Provider auditors assume the role of governance within SDL attributes use. An Auditors job is to ensure a provider has accurate attributes placed on them and can fulfill such requirements.

### Standard Attributes

A comprehensive, open-source framework is in development which will further decentralize the auditing of providers. Pending the release of this framework, an interim process has been developed to confirm providers claiming Akash recognized attributes. The process will allow providers to bid on deployments launched via the SDLs within the Awesome Akash repository. Interested providers may initiate the interim signing process by making contact in Discord with Andy (member of the Akash Developer Insider team) at the following handle: @andy01.

_**Attributes of Community Providers**_

Community providers vetted by Andy should advertise the following attributes before they can be signed by Akash address `akash1365yvmc4s7awdyj3n2sav7xfx76adc6dnmlx63`. Leases should use these attributes to allow audited community providers to bid.

- host: akash
- tier: community
- organization: <your ORG if you have it>

Also make sure to specify email and website in your `provider.yaml` config:

> NOTE: These aren't the provider attributes, but the `info` (informational) fields! So please add them as-is written, do not add them under the `attributes` section. More details on how exactly to add them can be found under "Create a provider.yaml File" section under step 8 of this part of the [document](/docs/providers/build-a-cloud-provider/akash-cli/akash-cloud-provider-build-with-helm-charts/#step-8---provider-build-via-helm-chart).

```
email: your@email.com
website: yourweb.com
```

_**Attributes of Akash Providers**_

The Akash provider, compute resources owned by Akash, will advertise the following attributes. Use of these attributes ensures only Akash provider instances will bid on the lease.

- host: akash
- tier: premium
- organization: ovrclk.com

_**Awesome Akash Examples**_

The example applications in the Awesome Akash repo have the following attributes included. Based on these attributes, both Akash and community providers are able to bid on associated leases.

- host: akash

_**Lease signedBy Fields**_

To use audited providers only, ensure SDLs have the Akash signedBy address of: akash1365yvmc4s7awdyj3n2sav7xfx76adc6dnmlx63.

### Auditor Location Within the SDL

Using the example SDL provided previously let’s take a look at the Auditor review.

```
profiles:
 compute:
   web:
     resources:
       cpu:
         units: 0.1
       memory:
         size: 512Mi
       storage:
         size: 512Mi
 placement:
   ewr1-provider0:
     attributes:
       host: akash
       datacenter: equinix-metal-ewr1
     signedBy:
       anyOf:
         - akash1365yvmc4s7awdyj3n2sav7xfx76adc6dnmlx63
     pricing:
       web:
         denom: uakt
         amount: 100
```

From the isolated SDL section above we can see the following:

1. Required auditors are declared within the “profiles” section. The “profiles” section defines compute and placement requirements.&#x20;
2. Within a specific placement profile (“ewr1-provider0” in the example SDL) there is a signedBy key.

### Declared Auditor Syntax

Referring to the “profiles” SDL section looked at previously - note the following details of the “signedBy” syntax:

- Required auditors may be specified within the signedBy section via either of the following options:
  - [ ] anyOf
    - The “anyOf” key states that if multiple auditors are declared in the YAML list - confirmation is satisfied if ONE auditor in the list is able to confirm necessary attributes.
  - [ ] allOf
    - The “allOf” key states that if multiple auditors are declared in the YAML list - confirmation is satisfied only if ALL auditors in the list are able to confirm necessary attributes.

In the modified SDL manifest depicted below the second placement (“sjc1-provider0”) has been edited to demonstrate the use and syntax of the “allOf” specification within the signedBy section.

```
profiles:
 compute:
   web:
     resources:
       cpu:
         units: 0.1
       memory:
         size: 512Mi
       storage:
         size: 512Mi
 placement:
   ewr1-provider0:
     attributes:
       host: akash
       datacenter: equinix-metal-ewr1
     signedBy:
       anyOf:
         - akash1365yvmc4s7awdyj3n2sav7xfx76adc6dnmlx63
     pricing:
       web:
         denom: uakt
         amount: 100
   sjc1-provider0:
     attributes:
       host: akash
       datacenter: equinix-metal-sjc1
     signedBy:
       allOf:
         - akash1365yvmc4s7awdyj3n2sav7xfx76adc6dnmlx63
         - akash1ss3ty253h6yun0a0fly8s0prcx34x4q2qewpkk
     pricing:
       web:
         denom: uakt
         amount: 100
```

### Auditor Impact

Provider auditors play the role of governance within SDL attribute use.

Using the sample SDL section below should help clarify the concept and use of the auditor role*.*

```
profiles:
 compute:
   web:
     resources:
       cpu:
         units: 0.1
       memory:
         size: 512Mi
       storage:
         size: 512Mi
 placement:
   ewr1-provider0:
     attributes:
       host: akash
       datacenter: equinix-metal-ewr1
     signedBy:
       anyOf:
         - akash1365yvmc4s7awdyj3n2sav7xfx76adc6dnmlx63
     pricing:
       web:
         denom: uakt
         amount: 100
```

_**Auditor Role**_

Provider auditors play the role of governance within SDL attribute use.

Using the sample SDL section below should help clarify the concept and use of the auditor role*.*

```
profiles:
 compute:
   web:
     resources:
       cpu:
         units: 0.1
       memory:
         size: 512Mi
       storage:
         size: 512Mi
 placement:
   ewr1-provider0:
     attributes:
       host: akash
       datacenter: equinix-metal-ewr1
     signedBy:
       anyOf:
         - akash1365yvmc4s7awdyj3n2sav7xfx76adc6dnmlx63
     pricing:
       web:
         denom: uakt
         amount: 100
```

_**Auditor Role**_

In traditional data centers, third-party auditors often validate physical security and environmental mandates. In the Akash landscape third-party validators play a similar role in ensuring a provider is capable of the attributes they ascribe to.

In this role the auditor will perform the following function:

- Audit the attributes claimed by the provider and validate the claims/capabilities are legit.&#x20;
- With introduction of the auditor and use of the signedBy key the danger of a provider declaring an attribute incorrectly or maliciously is removed.

_**Auditor/Signed By Key Functionality**_

- Should the manifest declare both attributes and a signedBy key - only a provider that has been validated by the declared auditor/auditors to have such attributes would become eligible to host the compute resource.&#x20;
- As noted in the Declared Auditor Syntax section:
  - [ ] Inclusion of the signedBy key with a nested allOf key mandates validation by all listed auditors.&#x20;
  - [ ] Inclusion of the signedBy key with a nested anyOf key is satisfied with the validation by one listed auditor.

_**Auditor Trust Relationship**_

- The auditor concept assumes a trust relationship with the defined auditor. For example, in the sample SDL the auditor account declared in the signedBy field (address = “akash1365yvmc4s7awdyj3n2sav7xfx76adc6dnmlx63”) is owned by Akash. Through the use of the signedBy field and the declaration of the Akash auditor address, only Akash audited providers and those validated to possess declared attributes would be eligible to host manifest resources.
- In a circumstance in which the auditor is a third party (not Akash),no process exists to ensure that the auditor conducted accurate provider attribute validation and thus only trusted auditors should be utilized.
- An Akash signBy address may be used when assurance that Akash has validated a provider’s attributes is desired.

### Auditor Additional Notes

_**No Auditor/Signed By Specification**_

A SDL is considered valid with no signedBy section. Both the attributes and signedBy sections are optional.

When a SDL includes attributes but no signedBy key-value pair only providers declaring such attributes will select the deployment for bid but there would be no third party validation that the provider truly meets such specifications.

If a deployer desired access to every provider currently on the Akash network both the attributes and signedBy sections could be removed from the SDL. **NOTE**: Akash cannot be responsible for deployments on providers that are not audited specifically by an Akash auditor.

_**Multiple Placements with Differing Attributes/Auditors**_

Multiple placements may exist in a SDL and each placement may have unique attributes/signedBy specifications.

In an example scenario, a SDL containing multiple micro-services (i.e. web frontend and database backend), it would be possible to dictate that the frontend exist in one locale and the backend exist in another locale via differing values in a locale attribute key-value pair.
