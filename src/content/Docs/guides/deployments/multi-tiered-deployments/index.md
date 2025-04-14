---
categories: ["Deployments"]
tags: ["Blockchain"]
weight: 1
title: "Multi-Tiered Deployment"
linkTitle: "Multi-Tiered Deployment"
---

## Deploy a Multi-Tiered Application

In this guide, we will deploy a multi-tier web application on Akash. The example application will consist of two services: a front-end web service and a back-end database.

### Before We Begin

This guide is to be considered an extension of the [Akash CLI](/docs/getting-started/quickstart-guides/akash-cli/) guide. Please ensure you have successfully completed all steps leading up to the ["Create the Deployment Configuration"](/docs/getting-started/quickstart-guides/akash-cli/#step-1--create-your-configuration) step in said guide, as they will not be discussed here.

## Create the Deployment Configuration

Let's create a deployment configuration that specifies multiple services in a single deployment.

```bash
---
version: "2.0"

services:
  redis:
    image: bitnami/redis:6.2
    env:
      - REDIS_AOF_ENABLED=no
      - ALLOW_EMPTY_PASSWORD=yes
    expose:
      - port: 6379        
        to:
          - service: goosebin
  goosebin:
    image: hydrogen18/goosebin:latest
    env:
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - PASTE_SIZE_LIMIT=100000
      - HTTP_PORT=8000
    depends_on:
      - redis
    expose:
      - port: 8000
        as: 80
        to:
          - global: true        

profiles:
  compute:
    redis:
      resources:
        cpu:
          units: 1
        memory:
          size: 128Mi
        storage:
          size: 16Mi
    goosebin:
      resources:
        cpu:
          units: 1
        memory:
          size: 64Mi
        storage:
          size: 16Mi
  placement:
    dc1:      
      pricing:
        redis: 
          denom: uakt
          amount: 9999
        goosebin: 
          denom: uakt
          amount: 9999

deployment:
  redis:
    dc1:
      profile: redis
      count: 1
  goosebin:
    dc1:
      profile: goosebin
      count: 1
```

Let's break down the above SDL into its 3 primary categories: `services`, `profiles`, and `deployment`.

#### Services

```bash
services:
  redis:
    image: bitnami/redis:6.2
    env:
      - REDIS_AOF_ENABLED=no
      - ALLOW_EMPTY_PASSWORD=yes
    expose:
      - port: 6379        
        to:
          - service: goosebin
  goosebin:
    image: hydrogen18/goosebin:latest
    env:
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - PASTE_SIZE_LIMIT=100000
      - HTTP_PORT=8000
    depends_on:
      - redis
    expose:
      - port: 8000
        as: 80
        to:
          - global: true
```

The `services` entries contain maps of workloads to be run on the Akash deployment. This deployment has 2 service entries: `redis` and `goosebin` - the former being our backend and the latter being our frontend. Please note that while these service names are arbitrary, their usage must remain consistent across the whole .yml file.

We can see that `goosebin` is globally exposed and open to the public, while `redis` is internal to the deployment and is only shared with `goosebin`.

Within the `goosebin` entry, we set some environmental variables - these are declared internally within the `goosebin` image. Note that each application can choose whatever environment variables it wants to use on its own for configuration. The variable that ties our services together is `REDIS_HOST`. This is what `goosebin` looks at to determine which host to connect to for `redis`. In this case, we set `REDIS_HOST=redis` because we chose to name the service `redis` - had we named the service `database`, we would have set `REDIS_HOST=database`.

The `expose` section is similar to other HTTP examples - internally, the container for this example is listing on port 8000. The deployment will only be assigned a unique URI that can be visited in a web browser when `expose` has `global: true` and the port is set to 80.

#### Profiles

```bash
profiles:
  compute:
    redis:
      resources:
        cpu:
          units: 1
        memory:
          size: 128Mi
        storage:
          size: 16Mi
    goosebin:
      resources:
        cpu:
          units: 1
        memory:
          size: 64Mi
        storage:
          size: 16Mi
  placement:
    dc1:      
      pricing:
        redis: 
          denom: uakt
          amount: 100
        goosebin: 
          denom: uakt
          amount: 100
```

The `profiles` entries contain named compute and placement profiles to be used in the deployment.

Since we have 2 services to deploy, details for each of them must be specified here. This section is very similar to a standard deployment, so it won't be covered in detail here. An important item to note, however, is that the named compute/placement profiles here (`redis` and `goosebin`) must match the names we had specified in the `services` section. [Additional mappings](https://github.com/akash-network/docs/tree/a8e7a472b43ec742a03bc5063f6c5a82ca3ca2ea/sdl/README.md#profiles) can also be specified within `profiles` such as audited attributes and data center attributes.

#### Deployments

```bash
deployment:
  redis:
    dc1:
      profile: redis
      count: 1
  goosebin:
    dc1:
      profile: goosebin
      count: 1
```

The `deployment` entries map the datacenter profiles to compute profiles to create a final desired configuration for the resources required for the services.

Similar to the `profiles` entries, we must specify deployment criteria for both of our services. This says that the 1 instance of the `redis` service and 1 instance of the `goosebin` service should be deployed to a datacenter matching the `dc1` datacenter profile. Each instance of the services will have the resources defined in its corresponding compute profile (`redis` or `goosebin`) available to it.

#### Deployment

Now that we have the SDL configured, let's deploy this application and see what happens. 

**Create the Deployment**

Create the deployment by running:

```bash
provider-services tx deployment create goosebin.yml --from $AKASH_KEY_NAME --node $AKASH_NODE --chain-id $AKASH_CHAIN_ID --fees 5000uakt -y
```

Once a provider is chosen, a lease is created, and the manifest is uploaded, we can view the status of our deployment by running:

```bash
provider-services lease-status --node $AKASH_NODE --home ~/.akash --dseq $AKASH_DSEQ --from $AKSH_KEY_NAME --provider $AKASH_PROVIDER
```

You should see a response similar to:

```javascript
{
  "services": {
    "goosebin": {
      "name": "goosebin",
      "available": 1,
      "total": 1,
      "uris": [
        "p3n56m0h7dant3iphkau8tdeds.ingress.sjc1p0.mainnet.akashian.io"
      ],
      "observed_generation": 1,
      "replicas": 1,
      "updated_replicas": 1,
      "ready_replicas": 1,
      "available_replicas": 1
    },
    "redis": {
      "name": "redis",
      "available": 1,
      "total": 1,
      "uris": null,
      "observed_generation": 1,
      "replicas": 1,
      "updated_replicas": 1,
      "ready_replicas": 1,
      "available_replicas": 1
    }
  },
  "forwarded_ports": {}
}
```

The URI shown above will take you to the front-end service. We can verify the service is running and talking with the backend (`redis`) by running the following:

```bash
provider-services lease-logs --node $AKASH_NODE --home $AKASH_HOME  --from $AKSH_KEY_NAME --dseq $AKASH_DSEQ  --provider $AKASH_PROVIDER
```

You should see a response similar to:

```bash
[goosebin-5cf5678d5b-rfdqv] Starting HTTP server on "0.0.0.0:8000"
[goosebin-5cf5678d5b-rfdqv] GET / rendered "home"
[goosebin-5cf5678d5b-rfdqv] GET /create-paste rendered "newPaste"
[goosebin-5cf5678d5b-rfdqv] POST /create-paste rendered "createPaste"
[goosebin-5cf5678d5b-rfdqv] GET /paste/HD-i5mNSyiQn0Kop8y8IvQ rendered "showPaste"
[goosebin-5cf5678d5b-rfdqv] GET /create-paste rendered "newPaste"
[goosebin-5cf5678d5b-rfdqv] GET / rendered "home"
[goosebin-5cf5678d5b-rfdqv] GET / rendered "home"
[goosebin-5cf5678d5b-rfdqv] POST /create-paste rendered "createPaste"
[redis-8569665588-zh6pr] redis 19:38:14.11 
[redis-8569665588-zh6pr] redis 19:38:14.17 Welcome to the Bitnami redis container
[redis-8569665588-zh6pr] redis 19:38:14.18 Subscribe to project updates by watching https://github.com/bitnami/bitnami-docker-redis
[redis-8569665588-zh6pr] redis 19:38:14.19 Submit issues and feature requests at https://github.com/bitnami/bitnami-docker-redis/issues
[redis-8569665588-zh6pr] redis 19:38:14.20 
[redis-8569665588-zh6pr] redis 19:38:14.21 INFO  ==> ** Starting Redis setup **
[redis-8569665588-zh6pr] redis 19:38:14.27 WARN  ==> You set the environment variable ALLOW_EMPTY_PASSWORD=yes. For safety reasons, do not use this flag in a production environment.
[redis-8569665588-zh6pr] redis 19:38:14.29 INFO  ==> Initializing Redis
[redis-8569665588-zh6pr] redis 19:38:14.42 INFO  ==> Setting Redis config file
[redis-8569665588-zh6pr] redis 19:38:14.59 INFO  ==> ** Redis setup finished! **
[redis-8569665588-zh6pr] 
[redis-8569665588-zh6pr] redis 19:38:14.62 INFO  ==> ** Starting Redis **
[redis-8569665588-zh6pr] 1:C 06 Apr 2021 19:38:14.689 # oO0OoO0OoO0Oo Redis is starting oO0OoO0OoO0Oo
[redis-8569665588-zh6pr] 1:C 06 Apr 2021 19:38:14.689 # Redis version=6.2.1, bits=64, commit=00000000, modified=0, pid=1, just started
[redis-8569665588-zh6pr] 1:C 06 Apr 2021 19:38:14.689 # Configuration loaded
[redis-8569665588-zh6pr] 1:M 06 Apr 2021 19:38:14.690 * monotonic clock: POSIX clock_gettime
[redis-8569665588-zh6pr] 1:M 06 Apr 2021 19:38:14.691 * Running mode=standalone, port=6379.
```

We can see the `goosebin` frontend has made some requests to the `redis` backend, and the containers are healthy.