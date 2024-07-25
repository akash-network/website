---
categories: ["Akash End to End Testing (Provider)"]
tags: []
title: "providerRepoCoverage"
linkTitle: "providerRepoCoverage"
weight: 1
description: >-
---


## Akash Provider Repo SDL Testing Coverage

## Content

* CURRENT TESTS
  * [Persistent Storage](#persistent-storage)
  * [IP Leases](#ip-leases)
  * [GPU](#gpu)
  * [Services](#services)
  * [Profiles](#profiles)
  * [Placement](#placement)
  * [Resources](#resources)
  * [Escrow/Payments](#escrowpayments)
  * [General](#general)
* SUGGESTED ADDITIONS

## _**Current Tests**_

## Persistent Storage

### Test Coverage

| Success/Failure Test | Test Specs                                                                                            | Current E2E Test Coverage |
| -------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------- |
|                      |                                                                                                       |                           |
| _**Success**_        |                                                                                                       |                           |
|                      | [SIMPLE PERSISTENT STORAGE DEPLOYMENT TEST WITH BETA2 STORAGE TYPE](#simple-persistent-storage-deployment-test-with-beta2-storage-type)                 | \[] Coverage              |
|                      | [SIMPLE PERSISTENT STORAGE DEPLOYMENT TEST WITH NO STORAGE TYPE DEFINED](#simple-persistent-storage-deployment-test-with-no-storage-type-defined)            | \[X] Coverage             |
| _**Failure**_        |                                                                                                       |                           |
|                      | [SIMPLE PERSISTENT STORAGE DEPLOYMENT TEST WITH NO MOUNT SPECIFIED](#simple-persistent-storage-deployment-test-with-no-mount-specified)                 | \[] Coverage              |
|                      | [SIMPLE PERSISTENT STORAGE DEPLOYMENT TEST FAIL ON NO ABSOLUTE MOUNT PATH](#simple-persistent-storage-deployment-test-with-no-absolute-mount-path)          | \[] Coverage              |
|                      | [SIMPLE PERSISTENT STORAGE DEPLOYMENT TEST FAIL ON INVALID NAME](#simple-persistent-storage-deployment-test-fail-on-invalid-name)                    | \[] Coverage              |
|                      | [SIMPLE PERSISTENT STORAGE DEPLOYMENT TEST FAIL ON ATTEMPT TO USE MOUNT PATH TWICE](#simple-persistent-storage-deployment-test-fail-on-attempt-to-use-mount-path-twice) | \[] Coverage              |
|                      | [SIMPLE PERSISTENT STORAGE DEPLOYMENT TEST FAIL ON NO SERVICE CONFIG](#simple-persistent-storage-deployment-test-fail-on-no-service-config)               | \[] Coverage              |

#### Expected Success

#### **SIMPLE PERSISTENT STORAGE DEPLOYMENT TEST WITH BETA2 STORAGE TYPE**

* _**Description**_ - verify simple persistent storage deployment with the storage type of BETA2.
* [Current SDL](https://github.com/akash-network/provider/blob/f13aca40ac42f96b80ec5e863cdfa20093e23b44/testdata/deployment/deployment-v2-storage-beta2.yaml) - `deployment-v2-storage-beta2.yaml`
* _**Expected Outcome**_ - success deployment/order creation with associated provider bid receipt for persistent storage type of BETA2.

#### **SIMPLE PERSISTENT STORAGE DEPLOYMENT TEST WITH NO STORAGE TYPE DEFINED**

* _**Description**_ - verify simple persistent storage deployment with the storage type omitted/not populated.
* [Current SDL](https://github.com/akash-network/provider/blob/main/testdata/deployment/deployment-v2-storage-default.yaml) - `deployment-v2-storage-default.yaml`
* _**Expected Outcome**_ - success deployment/order creation. Note - no providers on the network (at the time of this writing) bid on default storage type.
* _**Current Coverage**_ - [end to end test coverage](https://github.com/akash-network/provider/blob/main/integration/persistentstorage\_test.go)

**PERSISTENT STORAGE DEPLOYMENT UPDATE TEST A**

* _**Description**_ - verify deployment update capability when persistent storage is included in workload.
* [Current SDL](https://github.com/akash-network/provider/blob/main/testdata/deployment/deployment-v2-storage-updateA.yaml) - `deployment-v2-storage-updateA.yaml`
* _**Expected Outcome**_ - successful update of image and/or env variables when persistent storage is included in deplopyment.

**PERSISTENT STORAGE DEPLOYMENT UPDATE TEST B**

* _**Description**_ - verify deployment update capability when persistent storage is included in workload.
* [Current SDL](https://github.com/akash-network/provider/blob/main/testdata/deployment/deployment-v2-storage-updateB.yaml) - `deployment-v2-storage-updateB.yaml`
* _**Expected Outcome**_ - successful update of image and/or env variables when persistent storage is included in deplopyment.

#### Expected Failure

#### SIMPLE PERSISTENT STORAGE DEPLOYMENT TEST WITH NO MOUNT SPECIFIED 

* _**Description**_ - Failure test when no mount point is provided for persistent storage use
* [Current SDL](https://github.com/akash-network/provider/blob/f13aca40ac42f96b80ec5e863cdfa20093e23b44/testdata/sdl/storageClass1.yaml) - `storageClass1.yaml`
* _**Expected Outcome**_ - The SDL should fail validation on deployment creation attempt as there is no mount point specified for persistent storage in the `services > params > storage > configs` stanza.

#### **SIMPLE PERSISTENT STORAGE DEPLOYMENT TEST FAIL ON NO ABSOLUTE MOUNT PATH**

* _**Description**_ - Failure test when no absolute directory path is supplied in mount point.
* [Current SDL](https://github.com/akash-network/provider/blob/f13aca40ac42f96b80ec5e863cdfa20093e23b44/testdata/sdl/storageClass2.yaml) - `storageClass2.yaml`
* _**Expected Outcome**_ - The SDL should fail validation on deployment creation attempt as the persistent storage mount point specified is a relative path of `etc/nginx`. If the path were the absolute path of `/etc/nginx` the validation would succeed.

#### **SIMPLE PERSISTENT STORAGE DEPLOYMENT TEST FAIL ON INVALID NAME**

* _**Description**_ - Failure test when the persistent storage name does not align with name provided in services stanza.
* [Current SDL](https://github.com/akash-network/provider/blob/f13aca40ac42f96b80ec5e863cdfa20093e23b44/testdata/sdl/storageClass3.yaml) - `storageClass3.yaml`
* _**Expected Outcome**_ - The SDL should fail validation on deployment creation attempt as the persistent storage name specified in the `profiles` stanza - which is `configs` - does not align with the name used in the `services` stanza which is `data`.

#### **SIMPLE PERSISTENT STORAGE DEPLOYMENT TEST FAIL ON ATTEMPT TO USE MOUNT PATH TWICE**

* _**Description**_ - Failure test when a single mount path is used on more than one persistent storage volume.
* [Current SDL](https://github.com/akash-network/provider/blob/f13aca40ac42f96b80ec5e863cdfa20093e23b44/testdata/sdl/storageClass4.yaml) - `storageClass4.yaml`
* _**Expected Outcome**_ - The SDL should fail validation on deployment creation attempt as the persistent storage mount point of `/etc/nginx` is used on multiple persistent storage volumes within the `services` stanza.

#### **SIMPLE PERSISTENT STORAGE DEPLOYMENT TEST FAIL ON NO SERVICE CONFIG**

* _**Description**_ - Failure test when no config for persistent storage is present in the `services > params > storage` stanza.
* [Current SDL](https://github.com/akash-network/provider/blob/f13aca40ac42f96b80ec5e863cdfa20093e23b44/testdata/sdl/storageClass5.yaml) - `storageClass5.yaml`
* _**Expected Outcome**_ - The SDL should fail validation on deployment creation attempt as the `params > storage` section of the `services` stanza does not contain expected specifications (volume name and mount point).

## IP Leases

### Test Coverage

| Success/Failure Test | Test Specs                                                                                            | Current E2E Test Coverage |
| -------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------- |
|                      |                                                                                                       |                           |
| _**Success**_        |                                                                                                       |                           |
|                      | [SIMPLE IP LEASES CREATION AND ASSIGNMENT](#simple-ip-leases-creation-and-assignment)                                          | \[X] Coverage             |
|                      | [MULTIPLE AND UNIQUE IP LEASES CREATION AND ASSIGNMENT - MULTIPLE PLACEMENT GROUPS](#multiple-and-unique-ip-leases-creation-and-assignment---multiple-placement-groups) | \[] Coverage              |
|                      | [MULTIPLE AND UNIQUE IP LEASES CREATION AND ASSIGNMENT - SINGLE PLACEMENT GROUP](#multiple-and-unique-ip-leases-creation-and-assignment---single-placement-group)    | \[] Coverage              |
|                      | [MULTIPLE AND UNIQUE IP LEASES CREATION AND ASSIGNMENT - MULTIPLE PLACEMENT GROUPS](#multiple-and-unique-ip-leases-creation-and-assignment---multiple-placement-groups-1) | \[] Coverage              |
|                      | [SINGLE IP LEASE CREATION AND WITH MULTIPLE SERVICES ASSIGNMENT](#single-ip-lease-creation-and-with-multiple-services-assignment)                    | \[] Coverage              |

#### Expected Success

##### **SIMPLE IP LEASES CREATION AND ASSIGNMENT**

* _**Description**_ - validation of IP Leases creation and assignment to service .
* [Current SDL](https://github.com/akash-network/provider/blob/f13aca40ac42f96b80ec5e863cdfa20093e23b44/testdata/deployment/deployment-v2-ip-endpoint.yamll) - `deployment-v2-ip-endpoint.yaml`
* _**Expected Outcome**_ - deployment creation succeeds with the creation of an IP endpoint named `meow` and successful assignment of the `meow` IP endpoint to the `web` service. Bid received from provider supporting IP Leases.
* _**Current Coverage**_ - [end to end test coverage](https://github.com/akash-network/provider/blob/main/integration/ipaddress\_test.go)

##### **MULTIPLE AND UNIQUE IP LEASES CREATION AND ASSIGNMENT - MULTIPLE PLACEMENT GROUPS**

* _**Description**_ - two IP Leases declaration and assignment in unique deployment groups with multiple (two) placement groups.
* [Current SDL](https://github.com/akash-network/provider/blob/f13aca40ac42f96b80ec5e863cdfa20093e23b44/testdata/deployment/deployment-v2-multi-groups-ip-endpoint.yaml) - `deployment-v2-multi-groups-ip-endpoint.yaml`
* _**Expected Outcome**_

##### **MULTIPLE AND UNIQUE IP LEASES CREATION AND ASSIGNMENT - SINGLE PLACEMENT GROUP**

* _**Description**_ - two IP Leases declaration and assignment in unique deployment groups with a single placement groups.
* [Current SDL](https://github.com/akash-network/provider/blob/f13aca40ac42f96b80ec5e863cdfa20093e23b44/testdata/deployment/deployment-v2-multi-ip-endpoint.yamll) - `deployment-v2-multi-ip-endpoint.yaml`
* _**Expected Outcome**_ - successful creation of two IP Leases with activation in associated deployment group.

##### **MULTIPLE AND UNIQUE IP LEASES CREATION AND ASSIGNMENT - MULTIPLE PLACEMENT GROUPS**

* _**Description**_ - two IP Leases declaration and assignment in unique deployment groups with multiple placement groups.
* [Current SDL](https://github.com/akash-network/provider/blob/f13aca40ac42f96b80ec5e863cdfa20093e23b44/testdata/deployment/deployment-v2-multi-groups-ip-endpoint.yaml) - `deployment-v2-multi-groups-ip-endpoint.yaml`
* _**Expected Outcome**_ - successful creation of two IP Leases with activation in associated deployment group.

##### **SINGLE IP LEASE CREATION AND WITH MULTIPLE SERVICES ASSIGNMENT**

* _**Description**_ - ensure that a single IP Lease may be shared by multiple services.
* [Current SDL](https://github.com/akash-network/provider/blob/f13aca40ac42f96b80ec5e863cdfa20093e23b44/testdata/deployment/deployment-v2-shared-ip-endpoint.yaml) - `deployment-v2-shared-ip-endpoint.yaml`
* _**Expected Outcome**_ - successful creation of a single IP Lease with verification of assignment to two services using unique ports (TCP 80 and 81).

#### Expected Failure

### GPU

#### Expected Success

#### Expected Failure

### Services

#### Expected Success

**Intra Service Communication Test**

* _**Description**_ - validation of communication of intra service communication using web front-end to Redis Server using Redis service name.
* [Current SDL](https://github.com/akash-network/provider/blob/f13aca40ac42f96b80ec5e863cdfa20093e23b44/testdata/deployment/deployment-v2-c2c.yaml) - `deployment/deployment-v2-c2c.yaml`
* _**Expected Outcome**_ - web front-end should have successful communication with Redis pod via Redis service name.
* _**Current Coverage**_ - [end to end test coverage](https://github.com/akash-network/provider/blob/main/integration/container2container\_test.go)

**Node Port Assignment Test**

* _**Description**_ - ensure a Kubernetes node port is assigned to service when a non-HTTP port is specified.
* [Current SDL](https://github.com/akash-network/provider/blob/f13aca40ac42f96b80ec5e863cdfa20093e23b44/testdata/deployment/deployment-v2-nodeport.yaml) - `deployment-v2-nodeport.yaml`
* _**Expected Outcome**_ - assignment of node port in the range of 30000-32767 when a non-HTTP port is specified in SDL port field.
* _**Current Coverage**_ - [end to end test coverage](https://github.com/akash-network/provider/blob/main/integration/node\_port\_test.go)

**URL Assignment on HTTP Service**

* _**Description**_ - ensure assignment of URL on HTTP/HTTPS port usage within service.
* [Current SDL](https://github.com/akash-network/provider/blob/f13aca40ac42f96b80ec5e863cdfa20093e23b44/testdata/deployment/deployment-v2-nohost.yaml) - `deployment-v2-nohost.yaml`
* _**Expected Outcome**_ - assignment of valid HTTP URL for web services. Current SDL creates a single HTTP service and thus should expect a single URL assignment. URL should be in format of `<uniqueid>.provider.<provider-domain-name>`

**PRIVATE SERVICE VALIDATION**

* _**Description**_ - ensure a service that does not have `global: true` specification in the `expose\to` stanza is only reachable to specified services of the same SDL.
* [Current SDL](https://github.com/akash-network/provider/blob/f13aca40ac42f96b80ec5e863cdfa20093e23b44/testdata/sdl/private\_service.yaml) - `private_service.yaml`
* _**Expected Outcome**_ - referenced SDL should create a service with no node port assignment that should only be reachable inside the Kubernetes cluster and only to services it is exposed to explicitly. In the SDL tested only the `bind` service should have access to the `pg` service.

#### Expected Failure

**MISALIGNMENT/INCONSISTENT SERVICE NAMES**

* _**Description**_ - service name mismatch in the declaration within the `services` stanza and the use of the service in the `deployment` stanza
* [Current SDL](https://github.com/akash-network/provider/blob/f13aca40ac42f96b80ec5e863cdfa20093e23b44/testdata/sdl/deployment-svc-mismatch.yaml) - `deployment-svc-mismatch.yaml`
* _**Expected Outcome**_ - referenced SDL names the service `web` in the `services` stanza but references the service with name `webapp` in the \`deployment stanza. The misalignment of service name between stanzas should result in a validation failure during deployment creation transaction send.

### Profiles

#### Expected Success

#### Expected Failure

### Placement

#### Expected Success

#### Expected Failure

### Resources

#### Expected Success

#### Expected Failure

### Escrow/Payments

#### Expected Success

**Custom Denomination Test**

**TEST1**

* Description - validation of payment using custom denom in placement section of the SDL.
* [Current SDL](https://github.com/akash-network/provider/blob/f13aca40ac42f96b80ec5e863cdfa20093e23b44/testdata/deployment/deployment-v2-custom-currency.yaml) - `deployment-v2-custom-currency.yaml`
* _**Expected Outcome**_ - deployment creation succeeds with custom demon specified and bids received from provider supporting denom.
* _**Current Coverage**_ - [end to end test coverage](https://github.com/akash-network/provider/blob/main/integration/customcurrency\_test.go)

**Per Block Price Specification Test**

**TEST1**

* Description - validation of specified per block pricing specification.
* [Current SDL](https://github.com/akash-network/provider/blob/f13aca40ac42f96b80ec5e863cdfa20093e23b44/testdata/deployment/deployment-v2-escrow.yaml) - `deployment-v2-escrow.yaml`
* _**Expected Outcome**_ - bid received from provider with a per block price of less than or equal to specified amount.
* _**Current Coverage**_ - [end to end test coverage](https://github.com/akash-network/provider/blob/main/integration/escrow\_monitor\_test.go)

#### Expected Failure

### General

#### Expected Success

**SIMPLE DEPLOYMENT - SINGLE SERVICE - TEST A**

* _**Description**_ - simple deployment test with a single service. No IP Leases, persistent storage, or other services.
* [Current SDL](https://github.com/akash-network/provider/blob/f13aca40ac42f96b80ec5e863cdfa20093e23b44/testdata/sdl/simple.yaml) - `simple.yaml`
* _**Expected Outcome**_ - successful deployment/order creation with receipt of provider bid on simple, single service SDL

**SIMPLE DEPLOYMENT - SINGLE SERVICE - TEST B**

* _**Description**_ - simple deployment test with a single service. No IP Leases, persistent storage, or other services.
* [Current SDL](https://github.com/akash-network/provider/blob/main/testdata/deployment/deployment-v2.yaml) - `deployment-v2.yaml`
* _**Expected Outcome**_ - successful deployment/order creation with receipt of provider bid on simple, single service SDL
* _**Current Coverage**_ - [end to end test coverage](https://github.com/akash-network/provider/blob/main/integration/app\_test.go)

**SIMPLE DEPLOYMENT - SINGLE SERVICE - TEST C**

* _**Description**_ - simple deployment test with a single service. No IP Leases, persistent storage, or other services.
* [Current SDL](https://github.com/akash-network/provider/blob/main/testdata/deployment/deployment.yaml) - `deployment.yaml`
* _**Expected Outcome**_ - successful deployment/order creation with receipt of provider bid on simple, single service SDL

**MIGRATION TESTING**

* _**Description**_ - migration testing to new API version
* [Current SDL](https://github.com/akash-network/provider/blob/main/testdata/deployment/deployment-v2-migrate.yaml) - `deployment-v2-migrate.yaml`
* _**Expected Outcome**_ - successful deployment/order creation with receipt of provider bid.
* _**Current Coverage**_ - [end to end test coverage](https://github.com/akash-network/provider/blob/main/integration/migrate\_hostname\_test.go)

**NEW CONTAINER**

* _**Description**_ - validation of container/pod creation on new Akash deployment
* [Current SDL](https://github.com/akash-network/provider/blob/main/testdata/deployment/deployment-v2-newcontainer.yaml) - `deployment-v2-newcontainer.yaml`
* _**Expected Outcome**_ - successful deployment/order creation with receipt of provider bid.

**DEPLOYMENT UPDATE TEST A**

* _**Description**_ - verify deployment update capability.
* [Current SDL](https://github.com/akash-network/provider/blob/main/testdata/deployment/deployment-v2-updateA.yaml) - `deployment-v2-updateA.yaml`
* _**Expected Outcome**_ - successful update of image and/or env variables of pre-existing deplopyment.
* _**Current Coverage**_ - [end to end test coverage](https://github.com/akash-network/provider/blob/main/integration/deployment\_update\_test.go)

**DEPLOYMENT UPDATE TEST B**

* _**Description**_ - verify deployment update capability.
* [Current SDL](https://github.com/akash-network/provider/blob/main/testdata/deployment/deployment-v2-updateB.yaml) - `deployment-v2-updateB.yaml`
* _**Expected Outcome**_ - successful update of image and/or env variables of pre-existing deplopyment.

#### Expected Failure

**SIMPLE DEPLOYMENT - TWO SERVICES**

* **Description** - simple deployment test with two services. Deployment should fail validation as two services are declared but only one used. No IP Leases, persistent storage, or other services.
* [Current SDL](https://github.com/akash-network/provider/blob/f13aca40ac42f96b80ec5e863cdfa20093e23b44/testdata/sdl/simple2.yaml) - `simple2.yaml`
* _**Expected Outcome**_ - simple deployment with two services declares should fail validation as only one of the created services is called in the `deployment` stanza.

## Suggested Additions

**DEPLOYMENT WITH MULTIPLE SERVICES USING DIFFERENT REPLICA COUNTS**

* _**Description**_ - create deployment/order with multiple services using different replica counts and ensure bid receipt from provider.