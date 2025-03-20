---
aep: 35
title: "Realtime Pricing In Akash Console"
author: Anil Murty (@anilmurty)
status: Draft
type: Standard
category: Interface
created: 2024-12-01
updated: 2024-03-19
estimated-completion: 2025-05-31
roadmap: minor
---

## Motivation

New users (unfamiliar with Akash) often struggle to find provider pricing within Console and don't realize that they need to create a deployment to see it.

## Summary

A "Pricing" tab on the left side bar of Console that leads to a page where users can easily view pricing of resources for each provider on the network. Since pricing is based on the resources being requested and is dynamic based on the provider as well as based on when the request is made, the design of this page will require two things. One a selection of fixed configurations (GPU, CPU, Memory and Storage combinations) similar to "instances" in traditional clouds. And two, a mechanism for querying the network in real-time and updating the prices for those configurations from providers at that time, similar to what is done for the [GPU pricing page](https://akash.network/gpus/). Lastly the user would have the option of clicking "deploy" from any of these "instance" options and that will lead to this [custom container](https://console.akash.network/new-deployment?step=edit-deployment) template but pre-configured with the resources matching the specific instance chosen.
