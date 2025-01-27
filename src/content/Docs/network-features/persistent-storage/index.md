---
categories: ["Network Fetures"]
tags: []
weight: 1
title: "Persistent Storage"
linkTitle: "Persistent Storage"
---

Akash persistent storage allows deployment data to persist through the lifetime of a lease.  The provider creates a volume on disk that is mounted into the deployment. This functionality closely mimics typical container persistent storage.

* [Limitations](#limitations)
* [SDL Deepdive](#sdl-deepdive)
* [Troubleshooting](#troubleshooting)
* [Complete Persistent Storage SDL Example](#complete-persistent-storage-sdl-example)

## Limitations

### Storage Only Persists During the Lease

The storage is lost when:
- The deployment is migrated to a different provider.
- The deployment's lease is closed. Even when relaunched onto the same provider, storage will not persist across leases.
- Shared volumes are not currently supported. If an SDL defines a single profile with a persistent storage definition, and that profile is then used by multiple services, individual unique volumes will be created for each service.

### Single Volume per Service

Note that currently, only a single persistent volume is supported per service definition in the Akash SDL. It is not possible to mount multiple persistent volumes in a service.

### Additional Details

When planning to use persistent storage in a deployment, consider the network (between the storage nodes) as a factor that will cause latency, resulting in slower disk throughput/IOPS. This might not be suitable for heavy IOPS applications such as a Solana validator.

### Backward Compatibility

The introduction of persistent storage does not affect your pre-existing SDLs. All manifests authored previously will work as they are with no changes necessary.

### Troubleshooting Tips

If any errors occur in your deployments of persistent storage workloads, please review the troubleshooting section for possible tips. We will continue to build on this section if there are any frequently encountered issues.

## SDL Deepdive

Our review highlights the persistent storage parameters within the larger SDL example.

### Resources Section

The `storage` attribute within the `profiles.compute.<profile-name>.resources` section defines the storage profile. 

**NOTE:** A maximum amount of two (2) volumes per profile may be defined. The storage profile could consist of:

- A mandatory local container volume which is created with only a size key in our example
- An optional persistent storage volume which is created with the persistent: true attribute in our example

```text
profiles
└── compute
    └── <profile-name>
        └── resources
            └── storage
```

This section allows for multiple storage profiles, each with the following set of attributes.


#### `name`

The name is used by services to link service-specific storage parameters to the storage. It can be omitted in the case of a single value use, and the default value is set to \`default\`.

Default: `default`

Example: `data`

#### `size`

Size requested for the persistent storage

Example: `10Gi` `512mi`

#### `attributes.persistent`

Determine whether the volume requires persistence between restarts.

Default: `false`

#### `attributes.class`

Storage class for persistent volumes. The class enables the selection of a storage type. Only providers capable of delivering the specified storage type will bid on the lease.

| Class      | Matching device |
| -----------|---------------- |
| `beta1`    | hdd             |
| `beta2`    | ssd             |
| `beta3`    | NVMe            |
| `ram`      | System Memory   |

Examples:

Attaching nVME Storage:

```
profiles:
  compute:
    grafana-profile:
      resources:
        cpu:
          units: 1
        memory:
          size: 1Gi
        storage:
          - size: 512Mi
          - name: data
            size: 10Gi
            attributes:
              persistent: true
              class: beta2
```
 
### Services

Within the `services.<service-name>` section a new params section is introduced and is meant to define service specific settings.  Currently only storage related settings are available in params.  Our review begins with an overview of the section and this is followed by a deep dive into the use of storage params.

```
services:
  postgres:
    image: postgres
    params:
      storage:
        data:
          mount: /var/lib/postgres
```

#### Params

Note that params is an optional section under the greater services section.  Additionally note that non-persistent storage should not be defined in the params section.  In this example profile section, two storage profiles are created.  The no name ephemeral storage is not mentioned in the services > params definition.  However the persistent storage profile, named data, is defined within services > params.

```
profiles:
  compute:
    grafana-profile:
      resources:
        cpu:
          units: 1
        memory:
          size: 1Gi
        storage:
          - size: 512Mi
          - name: data
            size: 1Gi
            attributes:
              persistent: true
              class: beta3
```

#### `storage`

The persistent volume is mounted within the container’s local /var/lib/postgres directory.

```
     params:
      storage:
        default:
          mount: /var/lib/postgres
```

### Alternative Uses of Params Storage

#### Default Name Use

In this example the params > storage section is defined for a storage profile using the default (no name explicitly defined) profile

##### _**Services Section**_

```
services:
  postgres:
    image: postgres/postgres
    params:
      storage:
        data:
          mount: /var/lib/postgres
```

##### **Profiles Section**

```
profiles:
  compute:
    grafana-profile:
      resources:
        cpu:
          units: 1
        memory:
          size: 1Gi
        storage:
          - size: 512Mi
          - size: 1Gi
            attributes:
              persistent: true
              class: beta3
```

## Troubleshooting

### Possible Deployment Issues and Recommendations

##### Provider Slow or Over Utilized disks

_Issue_  - Slow/over utilized disks OR networking issue impacting distributed storage system (Ceph)&#x20;

_Solution_ -  always use providers with beta3 class fast storage and change to a new provider if you experience issues

##### Persistent Storage for Deployment Full

_Issue_ - persistent storage allocated to the deployment reaches capacity

_Solution_ - either use fast ephemeral storage so the pod will automatically restart once it gets full or allocate more disk space when for the persistent storage.  Continue to watch and clean the disk or redeploy the pod once persistent storage gets full.

### Hostname Conflict - May Cause Manifest Send Errors

If the hostname defined in the accept field is already in use within the Akash provider, a conflict occurs if another deployment attempts to launch with the same hostname.  This could occur within our testnet environment if multiple people are attempting to use the same SDL and deploy to the same provider.  Consider changing the accept field to a unique hostname (I.e. \<myname>.localhost) if you receive an error in send of the manifest to the provider.

```
 grafana:
    image: grafana/grafana
    expose:
      - port: 3000
        as: 80
        to:
          - global: true
        accept:
          - webdistest.localhost
```


## Complete Persistent Storage SDL Example

```
version: "2.0"
services:
  postgres:
    image: postgres
    params:
      storage:
        data:
          mount: /var/lib/postgres
  grafana:
    image: grafana/grafana
    expose:
      - port: 3000
        as: 80
        to:
          - global: true
        accept:
          - webdistest.localhost
    params:
      storage:
        data:
          mount: /var/lib/grafana
profiles:
  compute:
    grafana-profile:
      resources:
        cpu:
          units: 1
        memory:
          size: 1Gi
        storage:
          - size: 512Mi
          - name: data
            size: 1Gi
            attributes:
              persistent: true
              class: beta2
    postgres-profile:
      resources:
        cpu:
          units: 1
        memory:
          size: 1Gi
        storage:
          - size: 512Mi
          - name: data
            size: 1Gi
            attributes:
              persistent: true
              class: beta2
  placement:
    westcoast:
      pricing:
        grafana-profile:
          denom: uakt
          amount: 1000
        postgres-profile:
          denom: uakt
          amount: 7000
deployment:
  grafana:
    westcoast:
      profile: grafana-profile
      count: 1
  postgres:
    westcoast:
      profile: postgres-profile
      count: 1
```
