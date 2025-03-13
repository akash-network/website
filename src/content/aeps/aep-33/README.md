---
aep: 33
title: "Escrow Balance Alerts in Akash Console"
description: "Alerting system for low escrow balance"
author: Anil Murty (@anilmurty) Maxime Beauchamp (@baktun14)
status: Draft
type: Standard
category: Interface
created: 2024-12-01
updated: 2025-03-12
estimated-completion: 2025-04-30
roadmap: major
---

## Motivation

One of the primary issues users face with Akash is the unexpected termination of leases due to depleted escrow funds. Implementing an alerting and notification system for this problem gives users the tools to monitor and take actions to alleviate the problem and associated frustration.

## Summary

Users of Akash Console will have the option of configuring a low escrow balance alert for any deployment within their account and optionally tieing the alert to a notification channel. The initial notification channel supported will be email with more notification channels added over time, based on customer/ user feedback. The alert configuration will allow the user to specify a name that will show up in tne notification email subject as well as notes in the body that will let them quickly identify which account and deployment the alert is associated with. In addition the user will have the option to specify a threshold (<, =, >) that will determine when the alert is triggered. Lastly the user will have a global view of all alerts configured in the account and will be able to perform certain actions from there like viewing the alert configuration, disabling or deleting it and viewing all the past events triggered from it.

