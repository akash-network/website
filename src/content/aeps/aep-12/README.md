---
aep: 12
title: Trusted Execution Environment (TEE)
author: Adam Bozanich (@boz), Greg Osuri (@gosuri)
discussions-to: https://github.com/orgs/akash-network/discussions/614
status: Draft
type: Standard
category: Core
created: 2020-03-17
updated: 2024-12-01
estimated-completion: 2025-06-30
roadmap: major
---

## Summary

Trusted Execution Environment (TEE) guarantees code and data loaded inside to be protected with respect to confidentiality and integrity that is enforced at the processor level.

## Motivation

Providers execute a Tenant's workload. Providers have physical access to the machine executing a tenant’s workload thereby can gain access to sensitive information by inspecting the memory. The unprotected access presents a challenge to secure sensitive information when running on an untrusted node.

## Rationale

When we use the cloud today, AWS for example, even though AWS employees can inspect your application, we trust that AWS ensures that it won’t be the case because of brand value. Akash. [DCS-8] ensure this level of trust by means of accreditation. We can enhance that trust further by providing a Trusted Execution Environment (TEE).

A TEE as an isolated execution environment provides security features such as isolated execution, the integrity of applications executing with the TEE, along with confidentiality of their assets. In general terms, the TEE offers an execution space that provides a higher level of security to tenants than a rich operating system (OS) and more functionality than a 'secure element' (SE).

TEE is platform-dependent, all major providers have a form for TEE implementations as stated below.

### Hardware Support

* AMD
  * [Platform Security Processor](https://www.amd.com/system/files/TechDocs/52740_16h_Models_30h-3Fh_BKDG.pdf)
  * [AMD GuardMI](https://www.amd.com/en/technologies/guardmi)
* ARM
  * [Trust Zone](http://www.openvirtualization.org/open-source-arm-trustzone.html)
* Intel
  * [SGX Software Guard Extensions](https://01.org/intel-softwareguard-extensions)
* RISC-V
  * [MultiZone™ Security Trusted Execution Environment](https://hex-five.com/multizone-security-sdk/)
* IBM
  * [IBM Secure Service Container](https://www.ibm.com/us-en/marketplace/secure-service-container)

### SDKs

* [Ilinux-sgx](https://github.com/intel/linux-sgx):  Reference implementation of a Launch Enclave for 'Flexible Launch Control' for Intel SGX
* [linux-sgx-driver](https://github.com/intel/linux-sgx-driver): out-of-tree driver for the Linux Intel(R) SGX software stack, which will be used until the driver upstreaming process is complete.

## Further Research

Opensource Implementations for TEE are incomplete, projects like [Keystone](http://docs.keystone-enclave.org/en/latest/) are making progress in the right direction and require further analysis on practicality.
