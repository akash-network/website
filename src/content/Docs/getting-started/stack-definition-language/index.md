---
categories: ["Getting Started"]
tags: []
weight: 2
title: "Stack Definition Language (SDL)"
linkTitle: "Stack Definition Language (SDL)"
---

Customers / tenants define the deployment services, datacenters, requirements, and pricing parameters, in a "manifest" file (deploy.yaml). The file is written in a declarative language called Stack Definition Language (SDL). SDL is a human friendly data standard for declaring deployment attributes. The SDL file is a "form" to request resources from the Network. SDL is compatible with the [YAML](https://yaml.org/) standard and similar to Docker Compose files.

Configuration files may end in `.yml` or `.yaml`.

A complete deployment has the following sections:

- [version](#version)
- [services](#services)
- [profiles](#profiles)
- [deployment](#deployment)
- [persistent storage](/docs/network-features/persistent-storage/)
- [gpu support](#gpu-support)
- [stable payment](#stable-payment)
- [shared memory (shm)](#shared-memory-shm)
- [private container registry support](#private-container-registry-support)

An example deployment configuration can be found [here](https://github.com/akash-network/docs/tree/62714bb13cfde51ce6210dba626d7248847ba8c1/sdl/deployment.yaml).

#### Networking

Networking - allowing connectivity to and between workloads - can be configured via the Stack Definition Language (SDL) file for a deployment. By default, workloads in a deployment group are isolated - nothing else is allowed to connect to them. This restriction can be relaxed.

## Version

Indicates version of Akash configuration file. Currently only `"2.0"` is accepted.

## Services

The top-level `services` entry contains a map of workloads to be ran on the Akash deployment. Each key is a service name; values are a map containing the following keys:

| Name         | Required | Meaning                                                                                                                                                          |
| ------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `image`      | Yes      | Docker image of the container <br /><br/> **Note**: avoid using `:latest` image tags as Akash Providers heavily cache images. |
| `depends-on` | No       | _**NOTE - field is marked for future use and currently has no impact on deployments.**_                                                                          |
| `command`    | No       | Custom command use when executing container                                                                                                                      |
| `args`       | No       | Arguments to custom command use when executing the container                                                                                                     |
| `env`        | No       | Environment variables to set in running container. See [services.env](#servicesenv)                                                                              |
| `expose`     | No       | Entities allowed to connect to the services. See [services.expose](#servicesexpose)                                                                              |
| `params`     | No       | Defines parameters for Persistent Storage and Shared Memory (SHM) use                                                                             |

### services.env

A list of environment variables to expose to the running container.

```yaml
env:
  - API_KEY=0xcafebabe
  - CLIENT_ID=0xdeadbeef
```

### services.expose

#### Notes Regarding Port Use in the Expose Stanza

- HTTPS is possible in Akash deployments but only self signed certs are generated.
- To implement signed certs the deployment must be front ended via a solution such as Cloudflare. If interested in this path, we have created docs for [Cloudflare with Akash](/docs/guides/deployments/tls-termination-of-akash-deployment/).
- You can expose any other port besides 80 as the ingress port (HTTP, HTTPS) port using as: 80 directive if the app understands HTTP / HTTPS. Example of exposing a React web app using this method:

```
      - port: 3000
        as: 80
        to:
          - global: true
        accept:
          - www.mysite.com
```

- In the SDL it is only necessary to expose port 80 for web apps. With this specification both ports 80 and 443 are exposed.

`expose` is a list describing what can connect to the service. Each entry is a map containing one or more of the following fields:

| Name     | Required | Meaning                                                                          |
| -------- | -------- | -------------------------------------------------------------------------------- |
| `port`   | Yes      | Container port to expose                                                         |
| `as`     | No       | Port number to expose the container port as                                      |
| `accept` | No       | List of hosts to accept connections for                                          |
| `proto`  | No       | Protocol type. Valid values = `tcp` or `udp`                                     |
| `to`     | No       | List of entities allowed to connect. See [services.expose.to](#servicesexposeto) |

The `as` value governs the default `proto` value as follows:

> _**NOTE**_ - when as is not set, it will default to the value set by the port mandatory directive.

> _**NOTE**_ - when one exposes as: 80 (HTTP), the Kubernetes ingress controller makes the application available over HTTPS as well, though with the default self-signed ingress certs.

| `port`     | `proto` default |
| ---------- | --------------- |
| 80         | http & https    |
| all others | tcp & udp       |

### services.expose.to

`expose.to` is a list of clients to accept connections from. Each item is a map with one or more of the following entries:

| Name      | Value                        | Default | Description                                               |
| --------- | ---------------------------- | ------- | --------------------------------------------------------- |
| `service` | A service in this deployment |         | Allow the given service to connect                        |
| `global`  | `true` or `false`            | `false` | If true, allow connections from outside of the datacenter |

If no service is given and `global` is true, any client can connect from anywhere (web servers typically want this).

If a service name is given and `global` is `false`, only the services in the current datacenter can connect. If a service name is given and `global` is `true`, services in other datacenters for this deployment can connect.

If `global` is `false` then a service name must be given.

## profiles

The `profiles` section contains named compute and placement profiles to be used in the [deployment](#deployment).

### profiles.compute

`profiles.compute` is map of named compute profiles. Each profile specifies compute resources to be leased for each service instance uses uses the profile.

Example:

This defines a profile named `web` having resource requirements of 2 vCPUs, 2 gigabytes of memory, and 5 gigabytes of storage space available.

```yaml
web:
  cpu: 2
  memory: "2Gi"
  storage: "5Gi"
```

`cpu` units represent a vCPU share and can be fractional. When no suffix is present the value represents a fraction of a whole CPU share. With a `m` suffix, the value represnts the number of milli-CPU shares (1/1000 of a CPU share).

Example:

| Value    | CPU-Share |
| -------- | --------- |
| `1`      | 1         |
| `0.5`    | 1/2       |
| `"100m"` | 1/10      |
| `"50m"`  | 1/20      |

`memory`, `storage` units are described in bytes. The following suffixes are allowed for simplification:

| Suffix | Value  |
| ------ | ------ |
| `k`    | 1000   |
| `Ki`   | 1024   |
| `M`    | 1000^2 |
| `Mi`   | 1024^2 |
| `G`    | 1000^3 |
| `Gi`   | 1024^3 |
| `T`    | 1000^4 |
| `Ti`   | 1024^4 |
| `P`    | 1000^5 |
| `Pi`   | 1024^5 |
| `E`    | 1000^6 |
| `Ei`   | 1024^6 |

### profiles.placement

`profiles.placement` is map of named datacenter profiles. Each profile specifies required datacenter attributes and pricing configuration for each [compute profile](#profilescompute) that will be used within the datacenter. It also specifies optional list of signatures of which tenants expects audit of datacenter attributes.

Example:

```yaml
westcoast:
  attributes:
    region: us-west
  signedBy:
    allOf:
      - "akash1vz375dkt0c60annyp6mkzeejfq0qpyevhseu05"
    anyOf:
      - "akash1vl3gun7p8y4ttzajrtyevdy5sa2tjz3a29zuah"
  pricing:
    web:
      denom: uakt
      amount: 8
    db:
      denom: uakt
      amount: 100
```

This defines a profile named `westcoast` having required attributes `{region="us-west"}`, and with a max price for the `web` and `db` [compute profiles](#profilescompute) of 8 and 15 `uakt` per block, respectively. It also requires that the provider's attributes have been [signed by](#profilesplacementsignedby) the accounts `akash1vz375dkt0c60annyp6mkzeejfq0qpyevhseu05` and `akash1vl3gun7p8y4ttzajrtyevdy5sa2tjz3a29zuah`.

### profiles.placement.signedBy

**Optional**

The `signedBy` section allows you to state attributes that must be signed by one or more accounts of your choosing. This allows for requiring a third-party certification of any provider that you deploy to.

## Deployment

The `deployment` section defines how to deploy the services. It is a mapping of service name to deployment configuration.

Each service to be deployed has an entry in the `deployment`. This entry is maps datacenter profiles to [compute profiles](#profilescompute) to create a final desired configuration for the resources required for the service.

Example:

```yaml
web:
  westcoast:
    profile: web
    count: 20
```

This says that the 20 instances of the `web` service should be deployed to a datacenter matching the `westcoast` datacenter profile. Each instance will have the resources defined in the `web` [compute profile](#profilescompute) available to it.

## GPU Support

GPUs can be added to your workload via inclusion the compute profile section. The placement of the GPU stanza can be viewed in the full compute profile example shown below.

> _**NOTE**_  - when declaring the GPU model - I.e. in this example `rtx4090` - ensure that the model name aligns with the conventions found in this [list](https://github.com/akash-network/provider-configs/blob/main/devices/pcie/gpus.json).

```
profiles:
  compute:
    obtaingpu:
      resources:
        cpu:
          units: 1.0
        memory:
          size: 1Gi
        gpu:
          units: 1
          attributes:
            vendor:
              nvidia:
                - model: rtx4090
        storage:
          size: 1Gi

```

### Additional GPU Use Notes

#### Full GPU SDL Example

To view an example GPU enabled SDL in full for greater context, review this [example](https://github.com/akash-network/awesome-akash/blob/c24af5335be2bccb9d47c95bdd6ab68645fcd679/torchbench/torchbench_gpu_sdl_cuda12_0.yaml#L3) which utilized the declaration of several GPU models.

#### Model Specification Optional

The declaration of a GPU model is optional in the SDL. If your deployment does not require a specific GPU model, leave the model declaration blank as seen in the following example.

```
        gpu:
          units: 1
          attributes:
            vendor:
              nvidia:
```

#### Multiple Models Declared

If your deployment is optimized to run on multiple GPU models, include the appropriate list of models as seen in the following example. In this usage, any Akash provider that has a model in the list will bid on the deployment.

```
gpu:
  units: 1
  attributes:
    vendor:
      nvidia:
        - model: rtx4090
        - model: t4
```

#### GPU RAM Specification

Optionally the SDL may include a GPU RAM/VRAM requirement such as the example below.

```
gpu:
  units: 1
  attributes:
    vendor:
      nvidia:
        - model: a100
          ram: 80Gi
```

#### GPU Interface Specification

Optionally the SDL may include a GPU interface requirement such as the example below.

> _**NOTE**_ - only values of `pcie` or `sxm` should be used in the Akash SDL. There are several variants of the SXM interface but only the simple `sxm` value should be used in the SDL.

```
gpu:
  units: 1
  attributes:
    vendor:
      nvidia:
        - model: a100
          interface: sxm
```

#### GPU with RAM and Interface Specification

Example of specifying both RAM and interface in the SDL GPU section.

```
gpu:
  units: 1
  attributes:
    vendor:
      nvidia:
        - model: a100
          interface: pcie
          ram: 80Gi
```

## Stable Payment

Use of Stable Payments is supported in the Akash SDL and is declared in the placement section of the SDL as shown in the example below.

> _**NOTE**_ - currently only `Axelar USDC (usdc)` is supported and `denom` must be specified as the precise IBC channel name shown in the example.

```
  placement:
    global:
      pricing:
        web:
          denom: ibc/170C677610AC31DF0904FFE09CD3B5C657492170E7E52372E48756B71E56F2F1
          amount: 100
        bew:
          denom: ibc/170C677610AC31DF0904FFE09CD3B5C657492170E7E52372E48756B71E56F2F1
          amount: 100
```

#### Full GPU SDL Example&#x20;

To view an example Stable Payment enabled SDL in full for greater context, review this [example](https://gist.github.com/chainzero/040d19bdb20d632009b8ae206fb548f5).

## Shared Memory (SHM)

A new storage class named `ram`  may be added to the SDL to enable shared memory access for multiple services running in the same container.&#x20;

#### SHM Defintion

> _**NOTE**_ - SHM must not be persistent. The SDL validations  will error if SHM is defined as persistent.&#x20;

```
profiles:
  compute:
    grafana:
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
          - name: shm
            size: 1Gi
            attributes:
              persistent: false
              class: ram
```

#### SHM Use

Use the defined SHM profile within a service:

```
services:
  web:
    image: <docker image>
    expose:
      - port: 80
        as: 80
        http_options:
          max_body_size: 2097152
          next_cases:
            - off
        accept:
          - hello.localhost
        to:
          - global: true
    params:
      storage:
        shm:
          mount: /dev/shm
```

#### Full SHM SDL Example

To view an example SHM enabled SDL in full for greater context, review this[ example](https://gist.github.com/chainzero/0dea9f2e1c4241d2e4d490b37153ec86).

## Private Container Registry Support

Akash deployments now support the use of private container registries to pull images into Akash deployments.  The example use section below details the related username and password authentication declarations to access images in a private registry.  When using Docker Hub private image repostories, use your password in the related field.  When using private Github Image Registries, use your developer token in the password field.

#### Private Registry Image Use Example

##### Notes on Host Declaration in SDL

*   Tested container registries include DockerHub and Github Container Registry.  The host section of the SDL should use these values for related services:
    * DockerHub - `docker.io`
    * Github Container Registry (GHCR) - `ghcr.io`

##### Notes on Username/Password for Private Registries

*   The password field in the credentials section of the SDL should come from:
    * DockerHub - password used to access your account when logging into `hub.docker.com`
    * Github Container Registry - use a Personal Access Token created with your GitHub account > Developer Settings > Personal Access Tokens
    
##### DockerHub Example

```
services:
  supermario:
    image: scarruthers/private-repo-testing:1
    credentials:
      host: docker.io
      username: myuser
      password: "mypassword"
    expose:
      - port: 8080
        as: 80
        to:
          - global: true
```

##### GitHub Container Registry Example

```
services:  
  bew:
    image: ghcr.io/akash-network/test-app-web-private:main
    credentials:
      host: ghcr.io
      username: HIDDEN
      password: "HIDDEN"
    expose:
      - port: 80
        as: 80
        accept:
          - hello1.localhost
        to:
          - global: true
```


#### Full Private Registry Use in SDL Example

To view an example private regisrry used in an Akash SDL in full for greater context, review this[ example](https://gist.github.com/chainzero/c9d2efdd019b03bfbb6727e41bcb049c).

