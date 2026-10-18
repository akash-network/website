---
categories: ["API Documentation", "Console API"]
tags: ["Console", "API", "Organizations", "Teams", "Projects", "API Keys"]
weight: 3
title: "Organizations and Projects through the API"
linkTitle: "Organizations and Projects"
description: "Choose the organization and project of a Console API request, bind API keys to a team or a project, deploy into a project, and handle the organization error codes"
---

Every Console API request runs in one organization: your personal account or a team you belong to. It can also be limited to one project of that organization. This page covers how the API picks both, and what changes for API keys, deployments and errors. For the roles and how organizations work in Console, see [Organizations and Projects](/docs/developers/deployment/akash-console/organizations-and-projects).

---

## Before you start

Some actions need a signed-in Console session and answer `403` with code `session_required` when called with an API key:

- creating an organization
- accepting an invitation
- leaving or deleting an organization

Do those in [Console](https://console.akash.network). Everything else on this page works with an API key.

---

## Choose the organization

**An API key acts in the organization it was created in.** To get a key for a team, switch to the team in Console, then create the key under **Settings → API Keys**. A key created in your personal account, including every key created before organizations existed, acts in your personal account.

The `x-organization-id` header names the organization of a request, by id or slug. With an API key it is optional: the key already decides. If you send it, it has to name the key's organization, otherwise the API answers `400` with code `organization_mismatch`.

```bash
curl https://console-api.akash.network/v1/organizations \
  -H "x-api-key: $AKASH_API_KEY"
```

With an API key, the list holds only the key's organization, with your role in it:

```json
{
  "data": [
    {
      "id": "0b6c3f9e-8f1a-4d2b-9c7e-1a2b3c4d5e6f",
      "name": "Acme Corp",
      "slug": "acme-corp",
      "type": "team",
      "role": "admin",
      "isActive": true,
      "hasPaymentMethod": true,
      "createdAt": "2026-10-01T12:00:00.000Z"
    }
  ]
}
```

A key keeps working only while you are a member. Once you leave the team or are removed from it, its requests answer `403` with code `organization_forbidden`.

Requests made with a Console session token (the web app) pick the organization with `x-organization-id`. Without it they run in the organization used last, or in the personal account.

---

## Limit a request to a project

List the projects you can reach to get their ids:

```bash
curl https://console-api.akash.network/v1/projects \
  -H "x-api-key: $AKASH_API_KEY"
```

Send `x-project-id` with a project id to limit a request to that project: lists only show its deployments, and new deployments go into it. A project you cannot reach answers `403` with code `project_forbidden`.

```bash
curl https://console-api.akash.network/v1/deployments \
  -H "x-api-key: $AKASH_API_KEY" \
  -H "x-project-id: $PROJECT_ID"
```

---

## Keys bound to a project

An API key can be limited to one project of its organization. In Console, pick the project in the **Project** field when you create the key. Through the API, pass `projectId`:

```bash
curl -X POST https://console-api.akash.network/v1/api-keys \
  -H "x-api-key: $AKASH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "data": { "name": "checkout-api CI", "projectId": "'"$PROJECT_ID"'" } }'
```

The new key's `organizationId` is the organization the request ran in, and its `projectId` is the project. A project-bound key:

- only sees and changes the deployments of its project, and deploys into it without any header
- can still do only what your role allows in that project
- can read its organization and its project, but cannot manage members, invitations, projects, billing or API keys
- answers `403` with code `project_forbidden` when `x-project-id` names another project
- reaches nothing once the project is deleted or you lose access to it

`GET /v1/api-keys` shows the `organizationId` and `projectId` of each of your keys.

---

## Deploy into a project

`POST /v1/deployments` files the new deployment in a project, picked in this order:

1. `data.projectId` in the request body
2. the only project you can deploy into, when the key, the `x-project-id` header or your access leaves just one
3. the organization's default project

If you cannot deploy into the project it lands on, the API answers `400` with code `project_required`. Name a project you can deploy into.

```bash
curl -X POST https://console-api.akash.network/v1/deployments \
  -H "x-api-key: $AKASH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "data": { "sdl": "<YOUR_SDL_YAML_AS_STRING>", "projectId": "'"$PROJECT_ID"'" } }'
```

The deployment is funded from the organization's balance. When the project has a monthly budget and this deployment's deposit would take it past the budget, the API answers `403` with code `project_budget_exceeded` and creates nothing. An owner or admin can raise the budget.

The bids, lease and close calls are the same as in the [Quickstart](/docs/api-documentation/console-api/quickstart). They work on any deployment of a project you can change.

---

## List deployments by project

`GET /v1/deployments` takes a `projectId` query parameter, and each listed deployment carries its `projectId`:

```bash
curl "https://console-api.akash.network/v1/deployments?projectId=$PROJECT_ID" \
  -H "x-api-key: $AKASH_API_KEY" | jq '.data.deployments[] | {dseq: .deployment.id.dseq, projectId}'
```

A project you cannot reach lists nothing, the same as one that does not exist.

To find where a single deployment is filed, call `GET /v1/deployment-locations/{dseq}`:

```bash
curl https://console-api.akash.network/v1/deployment-locations/1234567 \
  -H "x-api-key: $AKASH_API_KEY"
```

```json
{
  "data": {
    "organizationId": "0b6c3f9e-8f1a-4d2b-9c7e-1a2b3c4d5e6f",
    "organizationSlug": "acme-corp",
    "projectId": "7d2e4a61-3b9c-4f0e-a5d8-6c1b2e3f4a5b"
  }
}
```

---

## Move a deployment

Owners and admins can move a deployment to another project of the organization. It keeps running; only the project it is filed in changes.

```bash
curl -X PATCH https://console-api.akash.network/v1/deployments/1234567/project \
  -H "x-api-key: $AKASH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "data": { "projectId": "'"$TARGET_PROJECT_ID"'" } }'
```

```json
{
  "data": {
    "dseq": "1234567",
    "projectId": "7d2e4a61-3b9c-4f0e-a5d8-6c1b2e3f4a5b"
  }
}
```

Other roles get `403`. An unknown deployment or project answers `404`.

---

## Set up a team through the API

Once the team exists and you have a key for it (see [Choose the organization](#choose-the-organization)), an owner or admin can do the rest with that key.

**1. Create a project:**

```bash
curl -X POST https://console-api.akash.network/v1/projects \
  -H "x-api-key: $AKASH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "data": { "name": "checkout-api", "description": "Payments backend" } }'
```

The response carries the project's `id`. Project names are unique within the organization (`409` with code `project_name_taken`).

**2. Invite someone with access to that project:**

```bash
curl -X POST https://console-api.akash.network/v1/organization-invitations \
  -H "x-api-key: $AKASH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "emails": ["dev@example.com"],
      "role": "member",
      "projectAccess": "selected",
      "projectGrants": [{ "projectId": "'"$PROJECT_ID"'", "role": "member" }]
    }
  }'
```

`role` is one of `owner`, `admin`, `member`, `billing` or `viewer`; only an owner can invite an owner. For a member or viewer, either set `"projectAccess": "all"` or list `projectGrants`. Each invitee gets an email with a link that expires after 7 days, and accepts the invitation in Console.

**3. Give an existing member access to another project.** Get their `userId` from `GET /v1/organization-members`, then:

```bash
curl -X POST https://console-api.akash.network/v1/project-members \
  -H "x-api-key: $AKASH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "data": { "projectId": "'"$PROJECT_ID"'", "userId": "'"$USER_ID"'", "role": "member" } }'
```

Project roles are `viewer`, `member` (also deploys) and `admin` (also renames the project and manages its access). Owners and admins reach every project without a grant.

**4. Set a monthly budget on the project:**

```bash
curl -X POST https://console-api.akash.network/v1/project-budgets \
  -H "x-api-key: $AKASH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "data": { "projectId": "'"$PROJECT_ID"'", "monthlyAmountUsd": 500, "alertThresholdPercent": 80, "stopTopUps": false } }'
```

**5. Deploy into it,** as in [Deploy into a project](#deploy-into-a-project).

**6. Follow spend and activity:**

```bash
# Spend per project for October (UTC days, inclusive)
curl "https://console-api.akash.network/v1/project-spend?startDate=2026-10-01&endDate=2026-10-31" \
  -H "x-api-key: $AKASH_API_KEY"

# What happened in a project, newest first
curl "https://console-api.akash.network/v1/organization-activities?projectId=$PROJECT_ID&limit=20" \
  -H "x-api-key: $AKASH_API_KEY"
```

Every endpoint, with its fields, is in the [API Reference](/docs/api-documentation/console-api/api-reference#group-teams).

---

## Provider tokens in a team

`POST /v1/create-jwt-token` mints tokens for the provider's lease endpoints (logs, events, status, shell). In a team organization:

- `ttl` can be at most `3600` seconds, so a removed member's access ends within the hour. A larger value answers `400`.
- When you can reach only some projects (as a member or viewer, with a project-bound key, or with `x-project-id`), the token has to name its deployments one by one with `"access": "granular"`. Otherwise the API answers `403` with code `project_forbidden`. A token that does more than read (`status`, `events`, `logs`) needs permission to change each deployment it names.

---

## Errors

Organization and project errors use the usual error body, with the code in `code`:

```json
{
  "error": "ForbiddenError",
  "message": "The project is not reachable in this organization",
  "code": "project_forbidden",
  "type": "client_error"
}
```

| Status | `code`                    | Meaning                                                                                                                             |
| ------ | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 400    | `organization_mismatch`   | `x-organization-id` names another organization than the API key's.                                                                  |
| 403    | `organization_forbidden`  | You are not a member of the organization, for example after leaving it or being removed.                                            |
| 403    | `project_forbidden`       | The project is out of your reach, the key is limited to another project, or the deployment is filed in a project you cannot change. |
| 400    | `project_required`        | No project you can deploy into was named. Pass `projectId` or `x-project-id`.                                                       |
| 403    | `project_budget_exceeded` | The deposit would take the project past its monthly budget. `data.projectIds` lists the projects.                                   |
| 403    | `session_required`        | The action needs a signed-in Console session, not an API key.                                                                       |

Managing members, invitations, projects and budgets has its own codes, such as `owner_role_restricted`, `last_owner`, `project_access_required`, `project_name_taken`, `project_not_empty` and `invitation_email_limit_reached`. The [API Reference](/docs/api-documentation/console-api/api-reference#group-teams) lists them per endpoint.

---

## Related Resources

- [Organizations and Projects](/docs/developers/deployment/akash-console/organizations-and-projects) - Roles, project access, invitations, budgets and team billing
- [Getting Started](/docs/api-documentation/console-api/getting-started) - API keys, authentication and the deployment workflow
- [API Reference](/docs/api-documentation/console-api/api-reference) - Every endpoint with its fields
