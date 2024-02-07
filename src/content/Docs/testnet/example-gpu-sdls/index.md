---
categories: ["Testnet"]
tags: []
weight: 2
title: "Example GPU SDLs"
linkTitle: "Example GPU SDLs"
---

In the following sections example GPU enabled Akash SDL examples are provided:

- [Specific GPU Vendor](#specific-gpu-vendor)
  - [Overview](#overview)
  - [SDL Example](#sdl-example)
  - [Confirmation](#confirmation)
  - [Specific GPU Vendor \& Model](#specific-gpu-vendor--model)
  - [Overview](#overview-1)
  - [SDL Example](#sdl-example-1)
  - [Confirmation](#confirmation-1)
- [Specific GPU Vendor \& List of Acceptable Models](#specific-gpu-vendor--list-of-acceptable-models)
  - [Overview](#overview-2)
  - [SDL Example](#sdl-example-2)
  - [Confirmation](#confirmation-2)

## Specific GPU Vendor

### Overview

In the example SDL provided below the following request is made:

- GPU Quantity: 1
- GPU Vendor: NVIDIA

Based on these inclusions in the SDL - only providers that have NVIDIA chips will respond with a bid.

> _**NOTE**_ - using this SDL example no specific GPU model/type (I.e. NVIDIA A100) is specified. Based on this syntax any provider with a NVIDIA GPU will respond with a bid. If a specific GPU model/type is needed - use the SDL example [here](#specific-gpu-vendor--model).

### SDL Example

```
---
version: "2.0"

services:
  obtaingpu:
    image: ubuntu:22.04
    command:
      - "sh"
      - "-c"
    args:
      - 'uptime;
        nvidia-smi;
        sleep infinity'
    expose:
      - port: 8080
        as: 80
        to:
          - global: true

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
        storage:
          size: 1Gi
  placement:
    akash:
      pricing:
        obtaingpu:
          denom: uakt
          amount: 100000

deployment:
  obtaingpu:
    akash:
      profile: obtaingpu
      count: 1

```

### Confirmation

- The SDL used in the provided example prints the GPU Model/Chip Type to the logs as depicted below
- We can use these logs to determine the success of the deployment

![](../../assets/gpuCheck.png)

### Specific GPU Vendor & Model

### Overview

In the example SDL provided below the following request is made:

- GPU Quantity: 1
- GPU Vendor: NVIDIA
- GPU Model: T4

Based on these inclusions in the SDL - only providers that have NVIDIA T4 chips will respond with a bid.

### SDL Example

```
---
version: "2.0"

services:
  obtaingpu:
    image: ubuntu:22.04
    command:
      - "sh"
      - "-c"
    args:
      - 'uptime;
        nvidia-smi;
        sleep infinity'
    expose:
      - port: 8080
        as: 80
        to:
          - global: true

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
                - model: t4
        storage:
          size: 1Gi
  placement:
    akash:
      pricing:
        obtaingpu:
          denom: uakt
          amount: 100000

deployment:
  obtaingpu:
    akash:
      profile: obtaingpu
      count: 1

```

### Confirmation

- The SDL used in the provided example prints the GPU Model/Chip Type to the logs as depicted below
- We can use these logs to determine the success of the deployment and confirm that the requested GPU model/type was allocated

![](../../assets/gpuCheck.png)

## Specific GPU Vendor & List of Acceptable Models

### Overview

In the example SDL provided below the following request is made:

- GPU Quantity: 1
- GPU Vendor: NVIDIA
- GPU Model: T4 or A4000

Based on these inclusions in the SDL - only providers that have NVIDIA T4 OR A4000 chips will respond with a bid. The purpose of this SDL use would be in scenario in which specific models of GPU are necessary but there are multiple, acceptable models.&#x20;

&#x20;In this example we specific that providers with NVIDIA T4 or A4000 models should bid on the deployment. But it is possible to list many different models if desired.

### SDL Example

```
---
version: "2.0"

services:
  obtaingpu:
    image: ubuntu:22.04
    command:
      - "sh"
      - "-c"
    args:
      - 'uptime;
        nvidia-smi;
        sleep infinity'
    expose:
      - port: 8080
        as: 80
        to:
          - global: true

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
                - model: t4
                - model: a4000
        storage:
          size: 1Gi
  placement:
    akash:
      pricing:
        obtaingpu:
          denom: uakt
          amount: 100000

deployment:
  obtaingpu:
    akash:
      profile: obtaingpu
      count: 1


```

### Confirmation

- The SDL used in the provided example prints the GPU Model/Chip Type to the logs as depicted below
- We can use these logs to determine the success of the deployment and confirm that the selected GPU model/type was allocated

![](../../assets/gpuCheck.png)
