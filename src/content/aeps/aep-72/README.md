---
aep: 72
title: "Console - Improved User Onboarding"
description: "Console User Onboarding on par with leading SaaS and CSPs"
author: Anil Murty (@anilmurty) Maxime Beauchamp (@baktun14)
status: Final
type: Standard
category: Interface
created: 2025-07-31
updated: 2025-07-31
completed: 2025-09-24
roadmap: major
---

## Motivation

Akash Console is the primary way that new users discover the magic of Akash Network and as such it is very important that the UX for getting them started be streamlined for maximum success along with somewhat generous trial credits comparable to other clouds (CSPs) in the industry.

## Summary

After surveying over a dozen products (across the public cloud, neo cloud and AI inference space) we've realized that there are a few common paradigms:
1. A more generous amount of trial credit than the $10 that Console users get
2. More restrictive trial sign up than the completely open and free trial that Console has (no sign up required, no credit card needed)
3. A streamlined onboarding process with as few distractions as possible
4. A limited time duration for deployments created that helps with freeing up resources that currently get hogged up and aren't available for new users
5. A limited time duration for the trial itself which creates a sense of urgency
6. Reminders within the UI as well as through notifications that encourage the user to upgrade and convert to a paid user so they can not lose their deployments or the trial credits.

Further, the current trial is limited to a small subset of providers and we'd like to extend this to the entire network so that all providers benefit from it.

With those in mind, we've enbarked on a project to build a new onboarding flow that will:
1. Optimize the landing page for new users that is significantly simpler from a cognitive load perspective
2. Require that the users sign up and enter a valid credit card (won't be charged) before they can start the trial
3. Grant the user a lot more trial credits ($100 - which is a 10x increase from current) so that they can fully experience the product
4. Open up the trial to ALL providers on the network - in conjunction with the[Tenant Incentives Pilot (TIPs)](https://github.com/orgs/akash-network/discussions/978) proposal
5. Limit trial deployments to run for only 24 hours (will be closed unless the user upgrades to paid user but they can redeploy)
6. Limit trials to last 30 days
7. Plug the onboarding flow into the email notification system built as part of the Alert & Notification work in [AEP-33](https://akash.network/roadmap/aep-33/)

Github Milestone: https://github.com/akash-network/console/milestone/23
