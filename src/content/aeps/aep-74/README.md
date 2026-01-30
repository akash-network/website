---
aep: 74
title: "Console - Auto Credit Reload"
description: "Make it easier for customers to keep their deployments running"
author: Anil Murty (@anilmurty)
status: Draft
type: Standard
category: Interface
created: 2025-07-31
updated: 2025-08-01
completed: 2025-12-31
resolution: https://github.com/akash-network/console/milestone/27?closed=1
roadmap: minor
---

## Motivation

Making it easier for existing paying users to keep their deployments running without needing to manually intervene on the payment side, improves user experience and drives utilization higher

## Summary

Akash Console added support for being able to automatically top up deployment escrow accounts before they run out via [AEP-57](https://akash.network/roadmap/aep-57/) That feature alleviated a major pain point for Akash users but only went as far as the amount of credits in the account. The next logical step to that is to extend the top up functionality so that it automatically also purchases and adds more credits to the user account which can then be used to fund any automatic escrow top up jobs periodically. This would allow users and customers with long running workloads (like inference APIs) to (in theory) never have to worry about purchasing credits or topping up their deployments.

## Proposed Solution

Customers that have a valid credit card saved in the system (saving of credit cards will be available once [AEP-72](https://akash.network/roadmap/aep-72/) ships) will have the option to enable "Auto Credit Reload" along with two dollar amounts - one dollar amount for the balance to maintain and another dollar amount that is a threshold at which the reload is triggered. When Auto Credit Reload is enabled, a service will monitor the customer's credit balance and when it falls below a (user defined) threshold, it will kick of a purchase of credits necessary to bring back the account balance to the configured balance.

### UI/ UX

1. Customer sets up and saves at least one valid credit card in the system. If there is more than one, then a default one to charge is selected. Note that implementing this is out of scope of this AEP but is addressed by [AEP-57](https://akash.network/roadmap/aep-57/) which needs to be completed before this AEP.
2. There is a global configuration in the same payment settings page that allows the user to enable or disable "Auto Credit Reload"
3. Enabling Auto Credit Reload requires them to specify two values:
   - A "Reload Balance" (this is the account balance that the service will reload to periodically). There will be a minimum amount here (say $15)
   - A "Reload Threshold" (this is the condition that will trigged the service to perform a reload). There will be a minimum amount for this also (say $5)
4. The service will monitor the account balance and when the balance is at or below the Reload Threshold it will trigged a credit purchase to bring the balance up to the Reload Balance. For example if the user sets a Reload Balance of $100 and a Threshold of $20, a credit purchase of $80 will automatically be performed when the account balance drops to $20.
5. The user will have an option to be notified (via email) when the Auto Credit Reload is performed. 
6. If the Auto Reload fails (due to an invalid credit card or other issue) the user will be notified. Not addressing the issue may result in the balance going to $0 0 - which will over time cause deployments to run out of funds and shut down.

Github Milestone: https://github.com/akash-network/console/milestone/27?closed=1