---
categories: ["Testnet"]
tags: []
weight: 2
title: "GPU Testnet Submission Instructions"
linkTitle: "GPU Testnet Submission Instructions"
---

## GPU Provider Challenge - Task Submission Guidance

Ensure proper Testnet Form submission for the GPU Provider Challenge via additional guidance provided in these sections:

- [GPU Provider Challenge - Task Submission Guidance](#gpu-provider-challenge---task-submission-guidance)
  - [Overview](#overview)
  - [Provider Address](#provider-address)
  - [Tenant/Deployment Address](#tenantdeployment-address)
  - [Launch Test Deployment](#launch-test-deployment)
    - [Provide DSEQ (Deployment ID) of Test Deployment](#provide-dseq-deployment-id-of-test-deployment)
    - [Provide Screenshot of Test Deployment](#provide-screenshot-of-test-deployment)

### Overview

The timestamp of your Akash Testnet Provider build completion will be the form submission date/time. When your provider is fully built and tested - using the suggested steps in this document - submit the form immediately to timestamp the completion date/time and to qualify for limited, associated rewards.

### Provider Address

During your Provider build a dedicated account was created in this [step](/docs/deployments/sandbox/installation/). Use this Akash address for submission as the `Akash GPU Testnet Provider Address`.

### Tenant/Deployment Address

Provide the tenant Akash address of the account that is used to launch your Testnet verification deployments (detailed further below).

The tenant address used to launch the test deployment/deployments can be isolated easily such as in the example below.

The address/account used to launch the deployment will be used in Testnet task grading to ensure that the deployment lease was created on your specific provider.

![](../../assets/tenantAddress.png)

### Launch Test Deployment

As described in the Testnet Submission form, a deployment much be launched on your provider using this [SDL](https://gist.github.com/chainzero/86402b1ab2cef63a7e83d4fbad73b0e0).

Use these [Deployment Guides](/docs/testnet/gpu-testnet-client-instructions/) for further details on launching Testnet deployments.

The deployment will be used to verify that your provider is fully functional and satisfies a healthy, running state.

The deployment log output will also be used to verify the GPU resources of your provider as described in this [section](#provide-screenshot-of-test-deployment).

The test deployment can be closed once you have captured the necessary information to satsify task.

> _**NOTE**_ - if your Testnet provider hosts multiple GPU instances - launch multiple test deployment using each of the GPUs and submit DSEQs/screenshots (as reviewed in subsequent sections) for each GPU model/instance.

#### Provide DSEQ (Deployment ID) of Test Deployment

Submit the DSEQ of your test deployment with the submission form. The DSEQ will be used to verify that the deployment was successfully launched on your provider.

The DSEQ can be found easily in the deployment tool (Akash Console, Akash Console, or Akash CLI). Example of isolating the deployment's DSEQ is shown below.

![](../../assets/isoalteDSEQ.png)

#### Provide Screenshot of Test Deployment

Attach a screenshot of the deployment launched on your provider. This step will verify that the provider is fully functional and additional allows verification of the GPU model hosted in the provider.\
\
These logs can be found easily in the deployment tool (Akash Console, Akash Console, or Akash CLI). Example of isolating the deployment's logs is shown below.

> _**NOTE**_ - ensure that the DSEQ is captured within the screen as well. In the example provided below the DSEQ is captured in the screenshot (DSEQ = 1066270 in example). Capture of the DSEQ allows confirmation that this deployment was tested in your provider.

![](../../assets/gpuCheck.png)
