---
categories: ["Other Resources", "Experimental"]
tags: []
weight: 2
title: "Akash Deployments via Terraform"
linkTitle: "Akash Deployments via Terraform"
---

Akash Deployments may now be launched and managed via Terraform!

Within this guide we will break down the deployment process using this new path.

We begin with a review of the [Terraform Manifest file components](#terraform-manifest-file) and provide a [Full Manifest Example](#terraform-manifest---complete-example) for additional clarity.

The following activities are possible currently via the Terraform Akash Provider:

- [Deployment Create](#create-akash-deployment)
- [Deployment Close](#close-akash-deployment)

## Prerequisites

The following applications must be installed on the machine performing the Akash deployment via Terraform covered in this guide.

### **Terraform**

Download and install the latest version of Terraform if a pre-existing installation is not present.

The Terraform client for Windows, MacOS, and Linux is available [here](https://www.terraform.io/downloads)**.**

### **Akash**

The Akash CLI is necessary and the recommended version is 0.1.0.

Akash CLI install instructions are available [here](/docs/deployments/akash-cli/installation/#install-akash-cli)**.** Note only the \`Install Akash CLI\` and \`Create/Fund Account\` sections of this guide are necessary for Terraform use.

## Terraform Manifest - Template

### Overview

Within this section we review a Terraform Manifest example for building an Akash deployment.

### Terraform Manifest File

- Use the blocks reviewed in this section to create your Terraform Manifest.
- Create a directory to house the files for your Terraform project and use this directory for all files created in the rest of this guide
- Create a file named `akashdeployment.tf` and populate the file with the blocks review below
- Refer to the [Terraform Manifest - Complete Example ](#terraform-manifest---complete-example)for clarity on how the blocks covered in this section fit together.

### Terraform Block

- The `akash` provider is defined and current version specified
- No adjustments to the Terraform manifest block should be necessary
- Periodically check to ensure the latest version is specified

```
terraform {
  required_providers {
    akash = {
      source = "cloud-j-luna/akash"
      version = "0.0.5"
    }
  }
}
```

### Provider Block

- Provider attributes are defined in this block
- Replace the `account_address` and `key_name` attributes with your own values

```
provider "akash" {
  account_address = "akash1<redacted>"
  keyring_backend = "os"
  key_name = "mykey"
  node = "https://akash-rpc.polkachu.com:443"
  chain_id = "akashnet-2"
  chain_version = "0.1.0"
}
```

### **Resource Block**

- Definition of the Akash Deployment
- Replace `hello_world` with the preferred name of your deployment
- Assumes that the `deploy.yaml` Akash SDL exists in the same directory as the Terraform file

```
resource "akash_deployment" "hello_world" {
  sdl = file("${path.module}/deploy.yaml")
}
```

### **Output Block**

- Output the assigned URI and ports of the deployment
- Replace `hello_world` with the name of your deployment defined in the Resource Block

```
output "services" {
  value = akash_deployment.hello_world.services
}
```

## Akash SDL Hello World Example

### Overview

- Use the example Akash SDL below for our Terraform demonstration
- Create a file named `deploy.yaml` with the Terraform project direct created prior
- Copy the contents of the `Hello World SDL` below into the `deploy.yaml` file

#### Hello World SDL

```
---
version: "2.0"

services:
  website:
    image: nginxdemos/hello
    expose:
      - port: 80
        http_options:
          max_body_size: 104857600
        to:
          - global: true
profiles:
  compute:
    website:
      resources:
        cpu:
          units: 1.0
        memory:
          size: 512Mi
        storage:
          size: 512Mi
  placement:
    akash:
      attributes:
        host: akash
      signedBy:
        anyOf:
          - "akash1365yvmc4s7awdyj3n2sav7xfx76adc6dnmlx63"
      pricing:
        website:
          denom: uakt
          amount: 10000
deployment:
  website:
    akash:
      profile: website
      count: 1
```

## Create Akash Deployment

### **Overview**

In this section we create an Akash Deployment via Terraform.

Complete the construction of the Terraform manifest before initiating the deployment creation.

Ensure that the steps detailed in this section are executed from the directory in which the Terraform manifest exists.

_**NOTE**_ - at this time the selection of the Akash provider from the bid list is automatic and selects the lowest priced bid. Consider adding attributes to the SDL to further limit provider bids received if necessary. Many providers advertise a**n** `organization` attribute and inclusion of this attribute within the SDL would allow only that provider to bid. In the near future other schemes will be introduced to allow specific provider bid selection in the deployment creation process via Terraform.

### **Steps**

#### Initialize the Terraform Project

```
terraform init
```

#### Confirm Resources to be Created

```
terraform plan
```

#### Create the Akash Deployment via Terraform

```
terraform apply -auto-approve
```

### **Expected/Example Output from Deployment Creation**

- Confirm the application successfully deployed onto the Akash Network by visiting the generated and displayed in output `service_uri`

```
services = tolist([
  {
    "service_name" = "hello_world"
    "service_uri" = "at2flmmh8pdtdfclbmfe2pv59o.praetor.ingress.d3akash.cloud"
  },
])
```

## Close Akash Deployment

### **Overview**

In this section we close an Akash Deployment via Terraform.

Ensure that the steps detailed in this section are executed from the directory in which the Terraform manifest exists.

### **Steps**

#### Close the Deployment

```
terraform destroy -auto-approve
```

## Terraform Manifest - Complete Example

- Replace the _**account_address**_ and _**key-name**_ values

```
terraform {
  required_providers {
    akash = {
      source = "cloud-j-luna/akash"
      version = "0.0.5"
    }
  }
}

provider "akash" {
  account_address = "akash1g<redacted>"
  keyring_backend = "os"
  key_name = "mykey"
  node = "https://akash-rpc.polkachu.com:443"
  chain_id = "akashnet-2"
  chain_version = "0.1.0"
}

resource "akash_deployment" "hello_world" {
  sdl = file("${path.module}/deploy.yaml")
}

output "services" {
  value = akash_deployment.hello_world.services
}
```
