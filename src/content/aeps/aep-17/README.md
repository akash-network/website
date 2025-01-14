---
aep: 17
title: "IP Address Market"
author: Greg Osuri (@gosuri)
status: Final
type: Standard
category: Core
created: 2022-11-08
completed: 2022-11-15
updated: 2024-12-01
resolution: https://www.mintscan.io/akash/proposals/25
roadmap: major
---

## Motivation

IP leasing on Akash provides workloads with their own dedicated IP address. This feature makes it simpler for these workloads to be discovered by others.

The use of dedicated IP addresses through leasing enhances the visibility and accessibility of Akash workloads. This system allows for more straightforward identification and connection to specific workloads.

By implementing IP leasing, Akash improves the overall functionality and usability of its platform. This feature streamlines the process of locating and interacting with workloads, making the system more efficient for users.

## Summary

IP Leases Features provide tenants with the ability to request publicly routable IP addresses for their deployed services. This feature allows IP Leases to be ordered as part of a deployment process, enhancing the flexibility and functionality of service deployment.

The introduction of IP Leases opens up new deployment opportunities that rely on static public IP addresses and static port mappings. This feature is particularly beneficial for services that require consistent and predictable network configurations, enabling more robust and reliable deployments.

One of the key advantages of IP Leases is that they allow the use of all ports within the 1-65535 range. This comprehensive port access provides tenants with greater control over their network configurations and enables them to implement a wide range of services and applications that may require specific port assignments.

## Features

* Option for Tenants to request publicly routable IP addresses for the services they deploy
* IP Lease can be ordered as part of a deployment
* Opens new deployment opportunities dependent: on&#x20;
  * Static public IP address
  * Static port mappings
* Allows use of all ports (1-65535 range)

## Limitations

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

## Announcements

* [Introducing IP Leases on Akash Network](https://akash.network/blog/introducing-ip-leases-on-akash-network/)

## Copyright

All content herein is licensed under [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0).