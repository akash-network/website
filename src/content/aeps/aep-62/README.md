---
aep: 62
title: "Provider Console - Node Manager"
author: Anil Murty (@anilmurty) Jigar Patel (@jigar-arc10) Deval Patel (devalpatel67)
status: Draft
type: Standard
category: Interface
created: 2024-03-15
updated: 2025-04-08
estimated-completion: 2025-04-15
roadmap: minor
---


## Motivation

Akash providers frequently start out with a small cluster (with 1 or 2 nodes) and then expand over time.

## Summary

With Akash Provider Console now generally available and new and existing providers onboarding on to it, we need to add support for a key feature - which is, the ability to easily add new nodes or remove one or more existing nodes from the cluster. In addition, providing a dedicated page (and side menu item) for providers to be able to visualize things at a node level will enable providers to better manage the clusters they operate.

## Feature Requirements

The scope of the work under this AEP will include 3 things:
- A new "Node Management" page and side menu item that lets the provider user visualize key details of indvidual nodes of the specific provider they are connected to, including actions to add or remove nodes.
- A set of onboarding steps in the UI to add (onboard) more nodes on to the provider, starting from the "Node Management" page

## Design

This is the tentative design - there may be some changes to this by the time it is released

![image](https://github.com/user-attachments/assets/f6e537ad-0813-4185-aa2d-4ce4b222ae90)
![image (14)](https://github.com/user-attachments/assets/1c5fdc14-c325-4ac1-867a-2e7e489d0f27)
![image (15)](https://github.com/user-attachments/assets/f78f1598-60dd-46b4-8ba7-dfc5470f2cd5)
![image (16)](https://github.com/user-attachments/assets/acac1956-000e-4ea9-bbf2-39ca7b8c10cf)
![image (17)](https://github.com/user-attachments/assets/a101a644-7a11-4acf-b7e9-b5ba625dacad)
