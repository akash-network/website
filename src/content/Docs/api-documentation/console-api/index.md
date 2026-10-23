---
categories: ["API Documentation", "Console API"]
tags: ["Console", "API", "Managed Wallet", "REST API"]
weight: 2
title: "Managed Wallet API"
linkTitle: "Managed Wallet API"
description: "Deploy on Akash programmatically without managing wallets or private keys"
---

Deploy on Akash programmatically using the Console API. It lets you create and manage deployments with Console-managed wallets, so you do not have to manage private keys.

Base URL: `https://console-api.akash.network`

Authentication: pass your API key in every request with `x-api-key: YOUR_API_KEY`. A key acts in the account it was created in, your personal account or one of your teams, and can be limited to one project. See [Organizations and Projects](/docs/api-documentation/console-api/organizations-and-projects).

---

## Features

- Create and manage deployments via plain HTTP with no blockchain client or SDK required.
- Receive bids from providers and accept them by creating a lease in a single API call.
- Fund deployments with a credit card; no AKT wallet or crypto exchange needed.
- Authenticate with an API key that acts in your personal account or in one of your teams, optionally limited to one project.
- Monitor deployments with list, get, and settings endpoints.
- Work as a team: manage members, invitations, projects and budgets, and deploy into a project.

---

## How it works

1. Create a deployment: POST your SDL (deployment manifest) to `/v1/deployments`.
2. Accept a bid: wait around 30 seconds, GET bids from `/v1/bids?dseq=...`, then POST to `/v1/leases` to accept one.
3. Manage: update the SDL, or DELETE to close the deployment. Funding is automatic. Console keeps the deployment running from the credits of the account it runs in (yours, or your team's) and returns whatever it did not spend when you close it.

---

## Documentation

- **[Getting Started](/docs/api-documentation/console-api/getting-started)** - Complete guide with examples and best practices
- **[API Reference](/docs/api-documentation/console-api/api-reference)** - Endpoint documentation with schemas
- **[Quickstart](/docs/api-documentation/console-api/quickstart)** - End-to-end deployment in five API calls
- **[Organizations and Projects](/docs/api-documentation/console-api/organizations-and-projects)** - Choose the team and project of a request, project-bound keys, and the team error codes

---

## Changelog

See the [full GitHub releases](https://github.com/akash-network/console/releases) for the authoritative version history.

---

## Need Help?

- **Discord:** [discord.akash.network](https://discord.akash.network)
- **GitHub Issues:** [https://github.com/akash-network/console/issues](https://github.com/akash-network/console/issues)
