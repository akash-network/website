---
categories: ["Network Fetures"]
tags: []
weight: 1
title: "IP Leases"
linkTitle: "IP Leases"
---


The IP Lease feature for Akash deployments allows a workload to obtain a static, reserved public IP address.

Our guide to including an IP Lease in your deployment includes these sequential sections.

- [IP Leases Features and Limitations](#ip-leases-features-and-limitations)
  - [IP Leases Features](#ip-leases-features)
  - [IP Leases Limitations](#ip-leases-limitations)
- [IP Leases within SDL](#ip-leases-within-sdl)
  - [Endpoints Stanza](#endpoints-stanza)
  - [Services Stanza](#services-stanza)
  - [Attributes](#attributes)
- [IP Leases Port Use](#ip-leases-port-use)
- [IP Leases Verification](#ip-leases-verification)
    - [Example/Expected Output](#exampleexpected-output)
- [IP Leases Migration](#ip-leases-migration)
    - [Migration Steps](#migration-steps)
      - [Migrate Command Template](#migrate-command-template)
      - [Migrate Command Example](#migrate-command-example)
  - [Migration Example](#migration-example)
- [Full SDL Example with IP Leases](#full-sdl-example-with-ip-leases)


## IP Leases Features and Limitations

### IP Leases Features

* Option for Tenants to request publicly routable IP addresses for the services they deploy
* IP Lease can be ordered as part of a deployment
* Opens new deployment opportunities dependent: on&#x20;
  * Static public IP address
  * Static port mappings
* Allows use of all ports (1-65535 range)

### IP Leases Limitations

* If a deployment is updated the IP lease is retained.  However if the lease is closed the IP address is not retained and the reservation of the IP address is lost.
* IP Leases is only valid for inbound communications.  Any communication initiated from within the deployment outbound will utilize a shared IP address from the provider.  However and based on the nature of TCP communications, responses to inbound initiated traffic will use the IP Leases address.
* An IP lease may be migrated to another deployment as detailed in this [section](#ip-leases-migration). Using a migration it would be possible to transfer the IP lease to a new deployment and preserve the reserved address.
* If a deployment is closed and moved to another provider there is no means to maintain or migrate the leased IP address
* Not all providers offer the IP Leases and is currently limited to providers using [MetalLB. ](https://metallb.universe.tf/installation/clouds/)However some providers might use [alternative, custom load balancers](https://metallb.universe.tf/installation/clouds/#alternatives) such as `keepalive-vip`.



## IP Leases within SDL

To illustrate the use of an IP Leases the simple Hello World SDL is used. Please refer to the full SDL used in this document for further clarification on the place of reviewed stanzas.

### Endpoints Stanza

IP Leases can be included in any SDL via the addition of the endpoints section. The endpoints section must be created at the top level of the SDL.

In this example we name the endpoint `myendpoint` but could be any name of your choosing.

The kind is defined as `ip` which is the only valid option at this time. This adds a requirement that the SDL leases exactly one IPv4 address from a provider.

_**NOTE**_ - the endpoint name must be unique across your deployments on a single provider. Using the example - if we tried to use `myendpoint` in another deployment and on the same provider - no IP lease would be created on that second deployment.

```
endpoints:
 myendpoint:
   kind: ip
```

### Services Stanza

In the services stanza we create the association with the endpoint detailed previously.

In this example we have a service running a docker container with port `3000` globally exposed. Additionally the `myendpoint` endpoint is defined via the `ip` key .

_**NOTE**_ - if an endpoint is declared in an SDL, it must be used at least once. Specifying an endpoint name that is not declared results in an error during deployment.

```
services:
 web:
   image: akashlytics/hello-akash-world:0.2.0
   expose:
     - port: 3000
       as: 80
       to:
         - global: true
           ip: myendpoint
```

### Attributes

> _**NOTE**_ - it is no longer necessary to specify the `ip-lease` attribute covered in this section as the bid engine now filters out non-IP lease capable providers when an IP endpoint is required by the deployment.  **This is now an optional and not required step**.

Include the attribute key-value pair of `ip-lease: true` in the SDL.  This ensures that only provider advertising this attribute will bid on the workload.

```
     attributes:
        ip-lease: true
```

## IP Leases Port Use

The IPv4 standard defines ports 1-65535 as valid port numbers.&#x20;

You may use all the unique ports of a single leased IPv4 address amongst any combination of services.&#x20;

Attempting to use the `same port` on `two different` services with the same endpoint is an `error`.


## IP Leases Verification

Assigned IP Leases info can be displayed from the Akash CLI via the `lease-status` command.

_**NOTE**_ _**-**_ ensure the `AKASH_DSEQ` and `AKASH_PROVIDER` environment variables are defined prior to issuing this command. Additional info on environment variables set up for the Akash CLI is available [here](/docs/deployments/akash-cli/installation/).

```
provider-services lease-status --from $AKASH_ACCOUNT_ADDRESS
```

#### Example/Expected Output

**NOTE** - the IP Leases info displayed in the `ips` section.

```
{
  "services": {
    "web": {
      "name": "web",
      "available": 1,
      "total": 1,
      "uris": [
        "bnd9dtb1rddsl6gfcn3q0j771g.www.nocixp1.iptestnet.akashian.io"
      ],
      "observed_generation": 1,
      "replicas": 1,
      "updated_replicas": 1,
      "ready_replicas": 1,
      "available_replicas": 1
    }
  },
  "forwarded_ports": null,
  "ips": {
    "web": [
      {
        "Port": 3000,
        "ExternalPort": 80,
        "Protocol": "TCP",
        "IP": "198.204.231.229"
      }
    ]
  }
}
```

## IP Leases Migration

The migration steps in this section are useful when you need to make changes to an existing deployment - which require deploying the app anew - and there is a desire to limit down time as we transition to the new, updated deployment.

When starting the new deployment - on the same  provider as the pre-existing deployment and with the same IP Leases endpoint name - the new deployment will have no IP address allocated initially.  Used the Migration Steps below to transition the IP lease from the pre-existing to new/updated deployment.

#### Migration Steps

You can migrate an IP address between two active deployments on the same provider. This is done by using the `akash provider migrate-endpoints` command.&#x20;

To migrate an endpoint between two deployments, the endpoint must be declared with identical names in both deployments.

##### Migrate Command Template

* The DSEQ specified should be that of the deployment the IP address should be migrated to

```
provider-services migrate-endpoints --from <key-name> --dseq <dseq-number> --provider=<provider-address> <endpoint-name>
```

##### Migrate Command Example

```
provider-services migrate-endpoints --from mykey --dseq 250172 --provider=akash16l4nf3z6xttgk673q536p873axmy8c7aggre3g myendpoint
```

### Migration Example

To experiment with the IP Leases migration functionality follow these steps.  This example is provided simply to clarify the steps and functionality of the migration process that could be used for your own applications.

* STEP 1 - create a deployment using the [full SDL example](#full-sdl-example-with-ip-leases) in this guide
* STEP 2 - create a second deployment using the [full SDL example](#full-sdl-example-with-ip-leases) in this guide.  No changes to the SDL are necessary.
* STEP 3 - observe that the IP lease remains on the first deployment made
* STEP 4 - with the goal of migrating the IP lease to the new/second deployment - execute the migration steps detailed in this [section](#ip-leases-migration.md#migration-steps)
* STEP 5 - following the successful IP Leases migration - observe that the IP lease is now active on the second/new deployment
* STEP 6 - close the first deployment completing the example of migrating an IP lease to new/updated deployment with little down time during the transition&#x20;


## Full SDL Example with IP Leases

Sections of the following SDL was used in prior sections of this guide. Providing the full SDL for context and placement clarity.

```
---
version: "2.0"
 
endpoints:
 myendpoint:
   kind: ip
 
services:
 web:
   image: akashlytics/hello-akash-world:0.2.0
   expose:
     - port: 3000
       as: 80
       to:
         - global: true
           ip: "myendpoint"
 
profiles:
 compute:
   web:
     resources:
       cpu:
         units: 0.5
       memory:
         size: 512Mi
       storage:
         size: 512Mi
 
 placement:
   dcloud:
     pricing:
       web:
         denom: uakt
         amount: 1000
 
deployment:
 web:
   dcloud:
     profile: web
     count: 1
```