---
aep: 69
title: "Provider Console API - v1"
author: Anil Murty (@anilmurty) Jigar Patel (@jigar-arc10) Deval Patel (devalpatel67)
status: Draft
type: Standard
category: Interface
created: 2025-05-22
updated: 2025-07-30
completed: 2025-07-25
resolution: https://github.com/akash-network/console/milestone/22
roadmap: minor
---

## Motivation

GPU providers using provider Console need to pull data into their own dashboards for financial and other reporting

## Summary

Provider Console currently displays the follownig stats in the dashboard:

- Total (cumulative) revenue
- Daily earnings (most recent 24 hours)

Providers require more granular, structured access to:

- Daily, weekly, and monthly revenue/utilization metrics
- Net revenue/earnings after Akash fees (take rate)

While showing these additional things in the UI would also be great - Providers that we have spoken with, typically want to pull this data via an API, ir order to:

- Integrate with their internal dashboards
- Geneate financing reports for their stakeholders
- Automated revenue tracking and forecasting

## Proposed Solution

Offer a set of APIs to provide revenue and GPU/resources utilization metrics to providers through the provider console backend. 

### Scope of work

- Expose revenue and utilization data via authenticated REST API endpoints
- Support filtering by date range (daily, weekly, monthly)
- Create functions in indexer to retrieve data and create internal API endpoints in deploy-web to expose it through provider-console-backend
- Introduce basic rate-limit to avoid abuse
- Make any necessary changes to indexer to save desired data
- Secure API with provider-specific authentication (likely using JWT Authentication)

### API Spec

TBD (will be added soon)