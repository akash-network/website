---
categories: ["Akash Provider"]
tags: ["Akash Provider", "Bid", "Pricing"]
weight: 9
title: "Bid Pricing Calculation"
linkTitle: "Bid Pricing Calculation"
---

In this guide we cover the use of a utility which calculates pricing used by an Akash Provider based on inputted server specifications.&#x20;

Following a dry run of the Provider price script within this guide, the utility will be used within the execution of the provider build and will tune the provider's bin engine appropriately.

Review these sections for Provider pricing and bid info:

- [Download Git Repository](#download-git-repository)
- [Calculate Pricing](#calculate-pricing)

# Download Git Repository

- Download the Akash Helm Chart repository which includes script we will use for Provider pricing calculations

```
cd ~

git clone https://github.com/akash-network/helm-charts.git
```

# Calculate Pricing

## Overview

In the steps that follow we will conduct example Akash Provider bid calculations based on resource (CPU/mem/stroage/GPU/etc) values passed in.

> _**NOTE**_ - we assume Ubuntu 22.04 usage when executing commands covered in this section. The steps outlined have been fully tested and verified on this Ubuntu version. If you are attempting these commands on other operating systems - I.e. MacOS - ensure Bash is updated or issues may arise. We recommended conducting these steps on Ubuntu if possible.

## Akash Provider Pricing Calculations

### Example Resource/Order Input

- To calculate the bid price that your Akash Provider will extend based on specific resource requests, we make use of an input file.
- In our example we name the input file `ibc-gpu-3-services-1-gpu-each-different.jq` - which is an example JSON formatted file containing specified order hardware specs.
- The example `ibc-gpu-3-services-1-gpu-each-different.jq` file below defines an order that consists of three separate services.
- Edit this file as necessary with your own pricing specifications.
- A single or multiple services may be defined in your own file use.

#### Create the File

```
cd ~/helm-charts/charts/akash-provider/scripts

vim ibc-gpu-3-services-1-gpu-each-different.jq
```

#### Populate the File

```
{
  "resources": [
    {
      "memory": 1073741824,
      "cpu": 1000,
      "gpu": {
        "units": 1,
        "attributes": {
          "vendor": {
            "nvidia": {
              "model": "*"
            }
          }
        }
      },
      "storage": [
        {
          "class": "ephemeral",
          "size": 1073741824
        }
      ],
      "count": 1,
      "endpoint_quantity": 1,
      "ip_lease_quantity": 0
    },
    {
      "memory": 1073741824,
      "cpu": 1000,
      "gpu": {
        "units": 1,
        "attributes": {
          "vendor": {
            "nvidia": {
              "model": "a100"
            }
          }
        }
      },
      "storage": [
        {
          "class": "ephemeral",
          "size": 1073741824
        }
      ],
      "count": 1,
      "endpoint_quantity": 1,
      "ip_lease_quantity": 0
    },
    {
      "memory": 1073741824,
      "cpu": 1000,
      "gpu": {
        "units": 1,
        "attributes": {
          "vendor": {
            "nvidia": {
              "model": "t4"
            }
          }
        }
      },
      "storage": [
        {
          "class": "ephemeral",
          "size": 1073741824
        }
      ],
      "count": 1,
      "endpoint_quantity": 1,
      "ip_lease_quantity": 0
    }
  ],
  "price": {
    "denom": "uakt",
    "amount": "1000.000000000000000000"
  },
  "price_precision": 6
}
```

### Execute Order Pricing Estimation

> _**NOTE**_ - that in this example we are feeding desired per resource USD pricing within the command

> _**NOTE**_ - the outputted value is the UAKT block rate. In the example below this would be:
>
> - `982.378419` X `429909` - calculate price in UAKT/Month with approx `429909` blocks/month
> - `422333323.733871` - UAKT/Month calculated using formula above
> - `422` - AKT/Month approximately
> - `Current AKT price` X `422` - USD/Month

- Example - `PRICE_TARGET_CPU=1.60` - in this command line provided value we are specifying our desired CPU core price as `$1.60/month`.
- In a subsequent section we outline the use of environment variables for resource pricing instead of defining within a single command.

```
cd ~/helm-charts/charts/akash-provider/scripts

PRICE_TARGET_CPU=1.60 PRICE_TARGET_MEMORY=0.80 PRICE_TARGET_HD_EPHEMERAL=0.02 PRICE_TARGET_HD_PERS_HDD=0.01 PRICE_TARGET_HD_PERS_SSD=0.03 PRICE_TARGET_HD_PERS_NVME=0.04 PRICE_TARGET_ENDPOINT=0.05 PRICE_TARGET_IP=5 PRICE_TARGET_GPU_MAPPINGS="a100=120,t4=80,*=130" ./price_script_generic.sh <<< $(cat ibc-gpu-3-services-1-gpu-each-different.jq) ; echo
```

_**Example/Expected Output**_

- In this example the script is executed and the output suggests that the monthly cost of the example order is `982` UAKT/block

```
PRICE_TARGET_CPU=1.60 PRICE_TARGET_MEMORY=0.80 PRICE_TARGET_HD_EPHEMERAL=0.02 PRICE_TARGET_HD_PERS_HDD=0.01 PRICE_TARGET_HD_PERS_SSD=0.03 PRICE_TARGET_HD_PERS_NVME=0.04 PRICE_TARGET_ENDPOINT=0.05 PRICE_TARGET_IP=5 PRICE_TARGET_GPU_MAPPINGS="a100=120,t4=80,*=130" ./price_script_generic.sh <<< $(cat ibc-gpu-3-services-1-gpu-each-different.jq) ; echo

982.378419
```

### Environment Variable Declarations for Resource Pricing

- Instead of including the per resource prices within the CLI command, we can instead define these environment variables
- Use of these variables makes the use of the command to estimate provider pricing much cleaner

```
PRICE_TARGET_CPU
PRICE_TARGET_MEMORY
PRICE_TARGET_HD_EPHEMERAL
PRICE_TARGET_HD_PERS_HDD
PRICE_TARGET_HD_PERS_SSD
PRICE_TARGET_HD_PERS_NVME
PRICE_TARGET_ENDPOINT
PRICE_TARGET_IP
PRICE_TARGET_GPU_MAPPINGS
```

#### Default Values

- If certain pricing variables are not defined the following defaults are used
- Note that the GPU mappings variable can be expanded to include more than three models as necessitated

```
PRICE_TARGET_CPU=1.60
PRICE_TARGET_MEMORY=0.80
PRICE_TARGET_HD_EPHEMERAL=0.02
PRICE_TARGET_HD_PERS_HDD=0.01
PRICE_TARGET_HD_PERS_SSD=0.03
PRICE_TARGET_HD_PERS_NVME=0.04
PRICE_TARGET_ENDPOINT=0.05
PRICE_TARGET_IP=5
PRICE_TARGET_GPU_MAPPINGS="a100=120,t4=80,*=130"
```

#### Command Execution with Environment Varaible Use

- If Akash Provider pricing environment variables are used, the pricing estimation script execution becomes much more concise such as:

```
cd ~/helm-charts/charts/akash-provider/scripts

./price_script_generic.sh <<< $(cat ibc-gpu-3-services-1-gpu-each-different.jq) ; echo
```

_**Example/Expected Output**_

```
./price_script_generic.sh <<< $(cat ibc-gpu-3-services-1-gpu-each-different.jq) ; echo

982.378419
```
