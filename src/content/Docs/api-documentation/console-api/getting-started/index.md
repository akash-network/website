---
categories: ["API Documentation", "Console API"]
tags: ["Console", "API", "Managed Wallet", "REST API", "Getting Started"]
weight: 1
title: "Getting Started with Managed Wallet API"
linkTitle: "Getting Started"
description: "Get started deploying on Akash with the Console Managed Wallet API"
---

Deploy on Akash programmatically using the Console API with a managed wallet.

Note: The Console API is actively developed. See the changelog ([https://github.com/akash-network/console/releases](https://github.com/akash-network/console/releases)) for upcoming breaking changes.

---

## Getting Started

### Create an API Key

1. Visit [console.akash.network](https://console.akash.network)
2. Sign in with your account
3. If the key is for a team, switch to that organization in the top bar. A key acts in the account it was created in.
4. Navigate to **Settings** → **API Keys**
5. Click **"Create API Key"** and pick when it expires: 30 days, 90 days, 1 year or a custom date. In a team you can also pick a **Project** to limit the key to it.
6. Copy and save your API key securely

> Warning: An API key can do everything your role allows in the account it was created in, unless you limit it to one project. Keep it secret.

### Key Expiration

Every API key expires, at most one year after it is created. A key created through `POST /v1/api-keys` takes an optional `data.expiresAt` (ISO 8601 date-time) that must be in the future and at most one year from now. Without it, the key expires one year after it is created. Asking for a later date returns `400 Bad Request`.

Console emails the key's owner up to three reminders, 30, 7 and 1 day before the key expires. After that, requests made with the key return `401 Unauthorized`.

To rotate a key:

1. Create a new key under **Settings** → **API Keys**
2. Update your integration to use the new key and confirm it works
3. Revoke the old key from the API keys page, or with `DELETE /v1/api-keys/{id}`

### Authentication

All requests must include the `x-api-key` header. Pass your API key directly in this header.

cURL example:

```bash
curl https://console-api.akash.network/v1/deployments \
  -H "x-api-key: YOUR_API_KEY"
```

If the key is missing or invalid, the API returns `401 Unauthorized`:

```json
{ "error": "Unauthorized", "message": "Invalid API key" }
```

An expired key also returns `401 Unauthorized`, with the message `API key has expired`.

Security practices:

- Store the key in an environment variable (`AKASH_API_KEY`), never in source code.
- Rotate keys in Console under Settings → API Keys before they expire, and right away if a key may be compromised.
- Keys act with your role in their account, so treat them like passwords. Limit a key to one project when it only works there.

### Organizations and projects

If you belong to a team, two optional headers matter:

- `x-organization-id`: the organization (id or slug) a request runs in. An API key already decides it, so you only need the header to double-check: naming another organization answers `400` with code `organization_mismatch`.
- `x-project-id`: limits a request to one project. Lists only show that project's deployments, and new deployments go into it.

```bash
curl https://console-api.akash.network/v1/deployments \
  -H "x-api-key: $AKASH_API_KEY" \
  -H "x-project-id: $PROJECT_ID"
```

See [Organizations and Projects](/docs/api-documentation/console-api/organizations-and-projects) for project-bound keys, deploying into a project and the error codes.

### Response envelope

Every JSON response from the Console API is wrapped in a top-level `data` field, for example:

```json
{ "data": { "dseq": "1234567", "manifest": "...", "signTx": { ... } } }
```

All examples in this guide show the full response body — extract the value you need from `response.data`.

### Money fields

The Managed Wallet bills your Console account in **USD** (credit card). You add credits to the account, and Console funds your deployments from that balance on its own. In a team, deployments are funded from the team's own balance, not yours. Creating a deployment takes no deposit, and keeping one running takes no top-up call. See [How Funding Works](/docs/getting-started/how-funding-works) for the full model, or read the current platform figures from `GET /v1/deployment-funding-config`.

The blockchain itself works in raw on-chain denoms (`uact`, `uusdc`, …). Wherever you see `price.denom` / `price.amount` in a bid response or an `escrow_account.state.funds` entry, those are raw chain values in micro-units (1 ACT = 1 000 000 uact). The SDL `pricing` block also uses chain denoms — the managed wallet handles the USD ↔ chain conversion for you.

---

## Complete Deployment Workflow

### 1. Create Deployment

POST your SDL to create a deployment. Console funds it automatically from your account balance, so the request carries no deposit. The API returns a `dseq` (deployment sequence number) that identifies the deployment in all subsequent calls. The response also returns the broadcast transaction hash for the on-chain `MsgCreateDeployment`.

cURL:

```bash
curl -X POST https://console-api.akash.network/v1/deployments \
  -H "x-api-key: $AKASH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "sdl": "<YOUR_SDL_YAML_AS_STRING>"
    }
  }'
```

JavaScript (fetch):

```javascript
const res = await fetch("https://console-api.akash.network/v1/deployments", {
  method: "POST",
  headers: {
    "x-api-key": process.env.AKASH_API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ data: { sdl: YOUR_SDL_STRING } }),
});
const { data } = await res.json();
const dseq = data.dseq;
```

Response (`201 Created`):

```json
{
  "data": {
    "dseq": "1234567",
    "manifest": "<computed manifest hash + manifest blob>",
    "signTx": {
      "code": 0,
      "transactionHash": "ABCDEF...",
      "rawLog": "[...]"
    }
  }
}
```

You don't need to keep `manifest`. Console records the SDL and sends the provider its manifest when you create the lease.

In a team, add `"projectId"` to `data` to pick the project the deployment goes into. Without it, Console uses the only project you can deploy into (such as the project of a project-bound key or of the `x-project-id` header), otherwise the team's default project. See [Deploy into a project](/docs/api-documentation/console-api/organizations-and-projects#deploy-into-a-project).

---

### 2. Wait for and Fetch Bids

List bids for your deployment. Bids typically arrive within 30–60 seconds. The response is wrapped in `data` and each bid is identified by a **composite id** (`owner`/`dseq`/`gseq`/`oseq`/`provider`/`bseq`), not a single opaque string.

cURL:

```bash
curl "https://console-api.akash.network/v1/bids?dseq=1234567" \
  -H "x-api-key: $AKASH_API_KEY"
```

JavaScript (fetch):

```javascript
const res = await fetch(
  `https://console-api.akash.network/v1/bids?dseq=${dseq}`,
  { headers: { "x-api-key": process.env.AKASH_API_KEY } },
);
const { data: bids } = await res.json();
```

Response:

```json
{
  "data": [
    {
      "bid": {
        "id": {
          "owner": "akash1ownerxxx...",
          "dseq": "1234567",
          "gseq": 1,
          "oseq": 1,
          "provider": "akash1providerxxx...",
          "bseq": 92
        },
        "state": "open",
        "price": { "denom": "uact", "amount": "10000" },
        "created_at": "92",
        "resources_offer": [
          {
            "resources": {
              "cpu": { "units": { "val": "500" } },
              "memory": { "quantity": { "val": "536870912" } },
              "storage": [],
              "endpoints": []
            },
            "count": 1
          }
        ]
      },
      "escrow_account": {
        "id": { "scope": "bid", "xid": "..." },
        "state": {
          "owner": "akash1providerxxx...",
          "state": "open",
          "transferred": [],
          "settled_at": "...",
          "funds": [],
          "deposits": []
        }
      }
    }
  ]
}
```

Polling example:

```javascript
async function waitForBids(dseq, { pollMs = 3000, maxAttempts = 20 } = {}) {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(
      `https://console-api.akash.network/v1/bids?dseq=${dseq}`,
      { headers: { "x-api-key": process.env.AKASH_API_KEY } },
    );
    const { data } = await res.json();
    if (data.length > 0) return data;
    await new Promise((r) => setTimeout(r, pollMs));
  }
  throw new Error("No bids received within timeout");
}
```

---

### 3. Create Lease

Accept one or more bids to activate the deployment lease(s). Console creates the leases, then sends each chosen provider the manifest built from the SDL it recorded when you created the deployment, so the request carries only the bids.

Pick the bid(s) you want, then build the `leases[]` array from the bid id (omitting `owner` and `bseq`). A `manifest` field is still accepted but deprecated, so leave it out.

cURL:

```bash
curl -X POST https://console-api.akash.network/v1/leases \
  -H "x-api-key: $AKASH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "leases": [
      { "dseq": "1234567", "gseq": 1, "oseq": 1, "provider": "akash1providerxxx..." }
    ]
  }'
```

JavaScript (fetch):

```javascript
const chosen = bids[0].bid.id;
const res = await fetch("https://console-api.akash.network/v1/leases", {
  method: "POST",
  headers: {
    "x-api-key": process.env.AKASH_API_KEY,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    leases: [
      {
        dseq: chosen.dseq,
        gseq: chosen.gseq,
        oseq: chosen.oseq,
        provider: chosen.provider,
      },
    ],
  }),
});
const { data } = await res.json();
```

Response (`200 OK`) is the same shape as `GET /v1/deployments/{dseq}` — the full deployment object including its now-active lease(s):

```json
{
  "data": {
    "deployment": {
      "id": { "owner": "akash1ownerxxx...", "dseq": "1234567" },
      "state": "active",
      "hash": "...",
      "created_at": "92"
    },
    "leases": [
      {
        "id": {
          "owner": "akash1ownerxxx...",
          "dseq": "1234567",
          "gseq": 1,
          "oseq": 1,
          "provider": "akash1providerxxx...",
          "bseq": 92
        },
        "state": "active",
        "price": { "denom": "uact", "amount": "10000" },
        "created_at": "92",
        "closed_on": "",
        "status": null
      }
    ],
    "escrow_account": {
      "id": { "scope": "deployment", "xid": "..." },
      "state": {
        "owner": "akash1ownerxxx...",
        "state": "open",
        "transferred": [],
        "settled_at": "...",
        "funds": [{ "denom": "uact", "amount": "5500000" }],
        "deposits": []
      }
    }
  }
}
```

If a provider can't be reached, the call answers `502`. With code `provider_unreachable` no lease was created, so pick another bid. With code `manifest_not_delivered` the lease exists but the provider didn't take the manifest: send the same request again to retry, or close the deployment to stop paying for it.

You don't need a funding call after the lease. Console tops the deployment up from your account credits for as long as it runs, so keep credits on the account instead of funding each deployment. See [How Funding Works](/docs/getting-started/how-funding-works).

---

### 4. Close Deployment

Close a deployment. Whatever it has not yet spent returns to your Console account balance.

cURL:

```bash
curl -X DELETE "https://console-api.akash.network/v1/deployments/1234567" \
  -H "x-api-key: $AKASH_API_KEY"
```

JavaScript (fetch):

```javascript
const res = await fetch(
  `https://console-api.akash.network/v1/deployments/${dseq}`,
  {
    method: "DELETE",
    headers: { "x-api-key": process.env.AKASH_API_KEY },
  },
);
const { data } = await res.json();
```

Response (`200 OK`):

```json
{ "data": { "success": true } }
```

Settlement happens on-chain, so the credited amount takes a short while to appear. Call `GET /v1/deployments/{dseq}` afterward to inspect the final state, or check your balance in the [Console](https://console.akash.network) UI.

---

## Complete Example Script

This example runs the full managed-wallet deployment flow in one script.

```javascript
const API_BASE_URL = "https://console-api.akash.network";
const API_KEY = process.env.AKASH_API_KEY;

if (!API_KEY) {
  throw new Error("Set AKASH_API_KEY before running this script.");
}

const SDL = `version: "2.0"
services:
  web:
    image: nginx:stable
    expose:
      - port: 80
        as: 80
        to:
          - global: true
profiles:
  compute:
    web:
      resources:
        cpu:
          units: 0.5
        memory:
          size: 512Mi
        storage:
          - size: 512Mi
  placement:
    dcloud:
      pricing:
        web:
          denom: uact
          amount: 10000
deployment:
  web:
    dcloud:
      profile: web
      count: 1`;

async function apiRequest(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "x-api-key": API_KEY,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`HTTP ${res.status}: ${body}`);
  }
  return res.json();
}

async function waitForBids(dseq, { pollMs = 3000, maxAttempts = 20 } = {}) {
  for (let i = 0; i < maxAttempts; i++) {
    const { data } = await apiRequest(`/v1/bids?dseq=${dseq}`);
    if (data.length > 0) return data;
    await new Promise((resolve) => setTimeout(resolve, pollMs));
  }
  throw new Error("No bids received within timeout");
}

async function main() {
  const create = await apiRequest("/v1/deployments", {
    method: "POST",
    body: JSON.stringify({ data: { sdl: SDL } }),
  });
  const { dseq, manifest } = create.data;

  const bids = await waitForBids(dseq);
  const chosenId = bids[0].bid.id;

  await apiRequest("/v1/leases", {
    method: "POST",
    body: JSON.stringify({
      manifest,
      leases: [
        {
          dseq: chosenId.dseq,
          gseq: chosenId.gseq,
          oseq: chosenId.oseq,
          provider: chosenId.provider,
        },
      ],
    }),
  });

  const status = await apiRequest(`/v1/deployments/${dseq}`);
  console.log("Deployment status:", status);

  const closed = await apiRequest(`/v1/deployments/${dseq}`, {
    method: "DELETE",
  });
  console.log("Closed deployment:", closed);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

---

## Secrets

Console can keep environment values secret. It encrypts each secret value on its side, and no endpoint returns the value afterwards. In the SDL Console stores, a secret appears as an `ac-secret://NAME` reference instead of its value. The SDL syntax is covered in [Secrets in Akash Console](/docs/learn/core-concepts/environment-secrets#secrets-in-akash-console).

### Mark values as secret

Put the secret values in your SDL as usual and list their variable names in `secretEnv`. Console encrypts them on the server, so you don't need any client-side encryption.

```bash
curl -X POST https://console-api.akash.network/v1/deployments \
  -H "x-api-key: $AKASH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "sdl": "<YOUR_SDL_YAML_AS_STRING>",
      "secretEnv": ["API_KEY", "DATABASE_URL"]
    }
  }'
```

- `secretEnv` covers the env of every service in the SDL. Each name you list must be set in the SDL, or the request fails with `400`.
- Every env value you leave out of `secretEnv` is stored as you sent it and stays readable.
- If you omit `secretEnv`, Console encrypts every env value. Send `"secretEnv": []` to keep them all readable.
- Registry credentials are always encrypted.

### Rotate one secret

Patch the variable with its new value and name it in `secretEnv`:

```bash
curl -X PATCH https://console-api.akash.network/v1/deployments/$DSEQ \
  -H "x-api-key: $AKASH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "services": { "web": { "env": { "API_KEY": "new-value" } } },
      "secretEnv": ["API_KEY"]
    }
  }'
```

Variables you don't send keep their current values, secrets included. Set a variable to `null` to remove it. Console sends the deployment update and the new manifest for you, and the new value reaches your container through that update.

To send an edited copy of the whole SDL instead, keeping the secrets you don't touch, see [Replace a Deployment Definition](#replace-a-deployment-definition). Avoid the deprecated `PUT /v1/deployments/{dseq}` for this: it replaces every stored secret with the values in the request, so you'd have to send them all again.

### List a deployment's secrets

`GET /v1/deployments/{dseq}/secrets` lists each secret the stored SDL references and every place it is used. It never returns a value.

```bash
curl https://console-api.akash.network/v1/deployments/$DSEQ/secrets \
  -H "x-api-key: $AKASH_API_KEY"
```

Response (`200 OK`):

```json
{
  "data": {
    "secrets": [
      { "name": "REGISTRY_PASSWORD", "usedBy": [{ "service": "web", "credential": "password" }] },
      {
        "name": "TOKEN",
        "usedBy": [
          { "service": "web", "env": "TOKEN" },
          { "service": "worker", "env": "API_TOKEN" }
        ]
      },
      { "name": "s0_e2", "usedBy": [{ "service": "web", "env": "DATABASE_URL" }] }
    ]
  }
}
```

- Secrets are listed once each, sorted by name.
- A `usedBy` entry has `env` when the secret is the value of an environment variable, and `credential` (`username` or `password`) when it fills a private registry login.
- One secret can fill several places, like `TOKEN` above.
- A name like `s0_e2` is one Console picked when it encrypted a value for you from `secretEnv`.
- `404` means you have no deployment with this dseq, or Console holds no definition for it.

The stored SDL that `GET /v1/deployments/{dseq}` returns in `data.consoleSettings.sdl` shows the same secrets as `ac-secret://NAME` references.

### Redeploy with the same secrets

To create a new deployment that reuses the stored secrets of an existing one, pass its dseq as `inheritSecretsFrom` on `POST /v1/deployments`. The source deployment can be closed. This is how you reuse an SDL full of `ac-secret://` references without re-entering the values.

### Seal secrets yourself (advanced)

If you'd rather Console never receive a secret in plain text, or your SDL already contains `ac-secret://NAME` references, send the values in `sealedSecrets` instead. It's a compact JWE of a flat JSON map from reference name to value, encrypted to the public key that `GET /v1/sdl-secrets-context` returns and carrying the claims that endpoint lists. On `PATCH` and on `PUT /v1/deployments/{dseq}/definition`, the JWE only needs the names you're replacing. Other names keep their stored values. A seal sent with `PATCH` is bound to the SDL Console stores, and one sent with `PUT /v1/deployments/{dseq}/definition` to the document in that request.

---

## Replace a Deployment Definition

`PATCH` changes the fields you name. `PUT /v1/deployments/{dseq}/definition` replaces the whole definition: you send the complete SDL the deployment should run from now on. Secrets you leave as `ac-secret://NAME` references keep their stored values, so you never send them again. Console then updates the deployment and sends the new manifest to its providers, as it does for a patch.

The flow is to read the definition, edit it, check it, and send it back.

### 1. Read the current definition

`GET /v1/deployments/{dseq}` returns what Console stores for the deployment in `data.consoleSettings`:

| Field             | What it holds                                                                        |
| ----------------- | ------------------------------------------------------------------------------------ |
| `sdl`             | The stored SDL as YAML text. Each secret appears as an `ac-secret://NAME` reference. |
| `definition`      | The same SDL as a JSON object, ready to edit and send back as it is.                 |
| `manifestVersion` | The version you read. Send it back as `ifManifestVersion` to guard your write.       |

```bash
API=https://console-api.akash.network

curl -s "$API/v1/deployments/$DSEQ" -H "x-api-key: $AKASH_API_KEY" \
  | jq '.data.consoleSettings' > current.json
```

If `consoleSettings` is `null`, Console holds no definition for the deployment. Record one first, as described in [Record a missing definition](#record-a-missing-definition).

### 2. Edit it

Change what you need, such as an image, an env value or a command, and leave each secret as its reference. This example moves the `web` service to a new image:

```bash
jq '.definition | .services.web.image = "ghcr.io/myorg/web:1.4.0"' current.json > definition.json
```

The network fixes a running deployment's groups, compute resources, replica counts and globally exposed ports. Leave those as they are, or create a new deployment for the change.

### 3. Check it

`POST /v1/deployments/{dseq}/definition/validate` runs the checks the replace would run and saves nothing:

```bash
curl -X POST "$API/v1/deployments/$DSEQ/definition/validate" \
  -H "x-api-key: $AKASH_API_KEY" \
  -H "Content-Type: application/json" \
  -d "$(jq '{data: {definition: .}}' definition.json)"
```

```json
{ "data": { "valid": true, "errors": [], "keptSecrets": ["API_KEY", "s0_e1"] } }
```

`keptSecrets` lists the references that will keep their stored values. If `valid` is `false`, see [Check a Definition](#check-a-definition) for how to read `errors`.

### 4. Replace it

```bash
curl -X PUT "$API/v1/deployments/$DSEQ/definition" \
  -H "x-api-key: $AKASH_API_KEY" \
  -H "Content-Type: application/json" \
  -d "$(jq --arg version "$(jq -r '.manifestVersion' current.json)" \
        '{data: {definition: ., ifManifestVersion: $version}}' definition.json)"
```

Response (`200 OK`): the deployment, in the shape `GET /v1/deployments/{dseq}` returns, plus its `name` and the `manifestVersion` it now runs.

```json
{
  "data": {
    "deployment": { "id": { "owner": "akash1ownerxxx...", "dseq": "1234567" }, "state": "active", "...": "..." },
    "leases": [{ "...": "..." }],
    "escrow_account": { "...": "..." },
    "name": "web",
    "manifestVersion": "Ab3x...="
  }
}
```

The request takes these fields in `data`:

- `sdl` or `definition`: the whole document, as YAML text or as a JSON object. Send exactly one.
- `secretEnv`: which env values you add or change are secret. See below.
- `sealedSecrets`: secret values you sealed yourself, bound to the document in this request. It only needs the names you are setting.
- `ifManifestVersion`: the version you read. See [The version guard](#the-version-guard).
- `name`: renames the deployment. Leave it out to keep the current name.

Add `?async=true` to return as soon as the definition is saved. The answer is then `202` with an `activityId` to follow at `GET /v1/activities/{id}` and the saved `manifestVersion`. Refusals still come back on the request itself.

### How stored secrets carry over

Console compares the document you send with the one it stores:

| In the document you send                                       | What Console stores                                                       |
| -------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `ac-secret://NAME`, with no new value for `NAME`               | Kept: the stored value stays                                              |
| `ac-secret://NAME`, with a new value in `sealedSecrets`        | Replaced with the new value                                               |
| A plain value you added or changed                             | Sealed as a new secret by default; `secretEnv` decides, see below         |
| A plain value Console stores readable, sent back unchanged     | Stays readable, unless you name it in `secretEnv`                         |
| A stored secret that no reference names any more               | Dropped                                                                   |
| `ac-secret://NAME`, with neither a new nor a stored value      | Refused with `400`                                                        |

`secretEnv` works as it does on create, applied to the values you add or change:

- Leave it out and Console encrypts every value you add or change, unless the request carries `sealedSecrets`.
- List variable names and Console encrypts only those. The other values you add or change stay readable.
- Send `[]` to keep every value you add or change readable.
- Naming a variable that Console stores readable makes it secret, even if you send the same value.
- A name that no service sets answers `400`.

Registry credentials are always encrypted.

To rotate a secret without sealing it yourself, write the new value where its reference was and name the variable in `secretEnv`. For example, `API_KEY=new-value` with `"secretEnv": ["API_KEY"]`. Console stores the new value under a name it picks, such as `s0_e1`, and drops the old one. To keep the reference name, seal the new value yourself in `sealedSecrets` instead. Either way, the new value reaches your container through the update Console sends.

### The version guard

Send the `manifestVersion` you read as `ifManifestVersion`. If the deployment changed after you read it, the replace answers `409` with code `deployment_definition_changed` and saves nothing. Read the definition again, redo your edit and send it again.

Without `ifManifestVersion`, Console guards on the version it read when your request arrived, so a change landing at the same time still answers `409` rather than being overwritten. Resending the identical request is safe: if the deployment is already on the version that request produces, it succeeds. Each successful replace returns the new `manifestVersion`, which you can send as `ifManifestVersion` on your next change.

### When Console refuses a replacement

A refused replace saves nothing, sends no deployment update and contacts no provider.

| Status | Code                            | Meaning                                                                                                                                                             | What to do                                                    |
| ------ | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| 400    |                                 | The SDL is invalid, a reference has no value, `sealedSecrets` holds a name no service references or is malformed or expired, or `secretEnv` names a variable no service sets. The message says which. | Fix the document. The check route lists every error at once. |
| 403    |                                 | `sealedSecrets` was sealed for another user or against a different document than the one you sent                                                                  | Seal the values again against the document you send           |
| 403    | `project_forbidden`             | The deployment is in a project you can't change                                                                                                                     | Use a key or role that can change that project                |
| 404    |                                 | Console holds no definition for this deployment                                                                                                                     | [Record it](#record-a-missing-definition) first               |
| 409    | `deployment_definition_changed` | The deployment changed after you read it                                                                                                                            | Read it again, redo the edit and retry                        |
| 409    |                                 | `sealedSecrets` was sealed to a key Console no longer holds                                                                                                         | Fetch `GET /v1/sdl-secrets-context` and seal again            |
| 409    | `stored_secrets_unavailable`    | The stored secrets were sealed for a team member who has since deleted their account                                                                                | Send the full SDL with every secret value again               |
| 422    | `deployment_resources_changed`  | The document changes the groups, compute resources, replica counts or globally exposed ports                                                                        | Create a new deployment instead                               |
| 500    | `stored_secrets_unreadable`     | Console can't open the secrets it stores for this deployment                                                                                                        | Retrying won't help. Send the full SDL with every secret value again |
| 500    | `stored_sdl_unreadable`         | Console can't read the SDL it stores for this deployment                                                                                                            | Retrying won't help                                           |
| 503    |                                 | The key management service is briefly unreachable                                                                                                                   | Retry                                                         |

To send the full SDL with every secret value, use the deprecated `PUT /v1/deployments/{dseq}`, which doesn't read the stored secrets. It replaces all of them with the ones you send.

### Record a missing definition

A deployment created before Console stored definitions, or created outside Console, may have none. `PATCH`, the replace and check-before-replace routes and the secrets list then answer `404`. Record the SDL the deployment runs with `POST /v1/deployments/{dseq}/definition`:

```bash
curl -X POST "https://console-api.akash.network/v1/deployments/$DSEQ/definition" \
  -H "x-api-key: $AKASH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "data": { "sdl": "<THE_SDL_THE_DEPLOYMENT_RUNS>" } }'
```

Response (`201 Created`):

```json
{ "data": { "sdl": "<the SDL as Console stored it>", "manifestVersion": "Ab3x...=" } }
```

- Console records the SDL only if it matches what the deployment runs. Otherwise it answers `422` with code `deployment_definition_mismatch` and records nothing. To apply a different SDL to such a deployment, send it to the deprecated `PUT /v1/deployments/{dseq}`, which records the SDL it applies.
- Recording sends no deployment update and no manifest, so it also works on a closed deployment.
- It never overwrites. If Console already holds a definition, it answers `409` with code `deployment_definition_exists`; edit that one instead.
- Secret values are stored as on create, but this route has no `secretEnv`. Without `sealedSecrets`, Console encrypts every env value. With `sealedSecrets`, it keeps the plain env values readable. Registry credentials are always encrypted.

After that, the deployment reads, patches and replaces like any other.

---

## Check a Definition

Two routes run Console's checks on a definition without deploying it:

- `POST /v1/deployments/validate` checks a definition before you create a deployment from it. It takes the `sdl` or `definition`, `secretEnv`, `sealedSecrets` and `inheritSecretsFrom` the create would carry.
- `POST /v1/deployments/{dseq}/definition/validate` checks a definition before it replaces that deployment's. It takes `sdl` or `definition`, `secretEnv` and `sealedSecrets`, and also reports changes that only a new deployment can take.

Neither one creates, saves, encrypts or sends anything. They check the document and its secrets, not your balance or project budget.

```bash
curl -X POST https://console-api.akash.network/v1/deployments/validate \
  -H "x-api-key: $AKASH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "sdl": "<YOUR_SDL_YAML_AS_STRING>",
      "secretEnv": ["API_KEY", "SENTRY_DSN"]
    }
  }'
```

A check that finds problems still answers `200 OK`:

```json
{
  "data": {
    "valid": false,
    "errors": [
      {
        "path": "/services/web/env/2",
        "keyword": "sdl-reference",
        "message": "no value supplied for SDL Reference \"ac-secret://STRIPE_KEY\" in service \"web\""
      },
      {
        "path": "/secretEnv",
        "keyword": "secretEnv",
        "message": "\"SENTRY_DSN\" is listed in secretEnv, but the request sets no environment variable of that name"
      }
    ],
    "keptSecrets": []
  }
}
```

How to read it:

- `valid` is `true` when the same create or replace would not be refused for its document or its secrets.
- `errors` lists every problem, not just the first. Each would make the real request fail.
- `path` is a JSON pointer into the document. `/services/web/env/2` is the third env entry of the `web` service. The same path applies whether you sent YAML or JSON. It is empty when the error concerns the whole document.
- `keyword` is the kind of check that failed. You will see `sdl-reference` (a reference without a value, or a plain value starting with the reserved `ac-` prefix), `secretEnv` (a name in `secretEnv` that no service sets), `maxLength` (the document is too large to store), `secrets` (the secret values go over Console's limits) and `deployment_resources_changed` (only a new deployment can take the change), along with SDL schema keywords such as `required`.
- `message` explains the error in words.
- `keptSecrets` lists the references whose values would come from what Console already stores: the deployment's own secrets, or those of `inheritSecretsFrom`.

A status other than `200` means the check itself could not run. For example, `400` for a request with both `sdl` and `definition` or a malformed `sealedSecrets`, `404` when the deployment has no stored definition or `inheritSecretsFrom` names a deployment you can't change, and `409` with code `inherited_secrets_unreadable` when the secrets of `inheritSecretsFrom` can no longer be opened.

---

## Send a Definition as JSON

Every route that takes an SDL also takes it as a JSON object in `definition`, in place of the YAML text in `sdl`. That covers `POST /v1/deployments`, `PUT /v1/deployments/{dseq}/definition`, `POST /v1/deployments/{dseq}/definition` and both check routes. Send `sdl` or `definition`, not both.

```bash
curl -X POST https://console-api.akash.network/v1/deployments \
  -H "x-api-key: $AKASH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "definition": {
        "version": "2.0",
        "services": {
          "web": {
            "image": "nginx:1.27.2",
            "env": ["MODE=production", "API_KEY=your-api-key-here"],
            "expose": [{ "port": 80, "as": 80, "to": [{ "global": true }] }]
          }
        },
        "profiles": {
          "compute": {
            "web": {
              "resources": { "cpu": { "units": 0.5 }, "memory": { "size": "512Mi" }, "storage": [{ "size": "1Gi" }] }
            }
          },
          "placement": { "dcloud": { "pricing": { "web": { "denom": "uact", "amount": 10000 } } } }
        },
        "deployment": { "web": { "dcloud": { "profile": "web", "count": 1 } } }
      },
      "secretEnv": ["API_KEY"]
    }
  }'
```

- The object has the same fields as an SDL file: `version`, `services`, `profiles`, `deployment`, and `endpoints` if you use them. Env entries stay `NAME=value` strings, and a secret stays `NAME=ac-secret://NAME`.
- Console validates it like the YAML and reports each problem at its JSON path.
- `GET /v1/deployments/{dseq}` returns the stored definition in this shape as `data.consoleSettings.definition`, so you can edit it and send it back as it is.
- If you seal secrets yourself, the seal is bound to the definition's compact JSON, `JSON.stringify(definition)`, with keys in the order you send them. Seal the exact object you send.

---

## Confidential Compute (TEE)

Run your workload inside a hardware-isolated Trusted Execution Environment (TEE) by adding a single `params.tee` field to a service in your SDL. Set it to `cpu` for a CPU-only confidential VM, or `cpu-gpu` to combine confidential compute with GPU acceleration. The provider selects the underlying hardware platform (AMD SEV-SNP or Intel TDX) and handles attestation automatically — you only choose the TEE option, nothing else.

Confidential Compute is requested entirely through the SDL, so there are no extra API parameters: pass the SDL below as `data.sdl` on `POST /v1/deployments` exactly as in [Step 1](#1-create-deployment).

### CPU-only Confidential Compute

```yaml
version: "2.1"
services:
  web:
    image: nginx:stable
    expose:
      - port: 80
        as: 80
        to:
          - global: true
    params:
      tee: cpu
profiles:
  compute:
    web:
      resources:
        cpu:
          units: 0.5
        memory:
          size: 512Mi
        storage:
          - size: 512Mi
  placement:
    dcloud:
      pricing:
        web:
          denom: uact
          amount: 10000
deployment:
  web:
    dcloud:
      profile: web
      count: 1
```

### GPU + Confidential Compute

The `cpu-gpu` option **requires GPU resources** in the compute profile — a `cpu-gpu` deployment without a `gpu` block is rejected.

```yaml
version: "2.1"
services:
  inference:
    image: my-model:latest
    expose:
      - port: 8080
        as: 8080
        to:
          - global: true
    params:
      tee: cpu-gpu
profiles:
  compute:
    inference:
      resources:
        cpu:
          units: 8
        memory:
          size: 32Gi
        storage:
          - size: 100Gi
        gpu:
          units: 1
          attributes:
            vendor:
              nvidia:
                - model: h100
  placement:
    dcloud:
      pricing:
        inference:
          denom: uact
          amount: 100000
deployment:
  inference:
    dcloud:
      profile: inference
      count: 1
```

> Warning: TEE services can only pull images from **public** registries. The `credentials` field is not honored for confidential workloads, and a deployment that references a private image will fail. Make sure every `image` in a TEE service is publicly pullable.

### TEE type reference

| Value     | Description                                    |
| --------- | ---------------------------------------------- |
| `cpu`     | CPU-only confidential VM                       |
| `cpu-gpu` | Confidential VM with NVIDIA GPU CC (requires GPU resources) |

The provider selects the actual hardware platform (AMD SEV-SNP or Intel TDX) and the runtime automatically at deployment time — you do not choose or configure it.

All services within the same deployment group must use the same TEE type (or none at all); mixing TEE types in a single group is rejected.

For attestation, the security model, and supported hardware, see the [Confidential Compute (TEE) core concepts](/docs/learn/core-concepts/confidential-compute) and the [SDL advanced features reference](/docs/developers/deployment/akash-sdl/advanced-features).

---

## Best Practices

### Security

- **Never commit API keys** to version control
- **Use environment variables** for API keys
- **Rotate keys regularly** as a security best practice
- **Limit a key to one project** when it only deploys there

```typescript
// Good: use environment variables
const API_KEY = process.env.AKASH_API_KEY;

// Bad: hardcoded key
const API_KEY = "ac.sk.mainnet.xxx...";
```

### Error Handling

Use HTTP status codes to determine recovery behavior.

| Status                    | Meaning            | Common cause                                           |
| ------------------------- | ------------------ | ------------------------------------------------------ |
| 200 OK                    | Request succeeded  | -                                                      |
| 201 Created               | Resource created   | `POST /v1/deployments`, `POST /v2/deployment-settings` |
| 400 Bad Request           | Invalid input      | Malformed SDL, missing required field                  |
| 401 Unauthorized          | Auth failed        | Missing, invalid or expired `x-api-key`                |
| 403 Forbidden             | Not allowed        | Your role, the key's project or a project budget does not allow it |
| 404 Not Found             | Resource not found | `dseq` does not exist or is out of your reach          |
| 409 Conflict              | Changed meanwhile  | The deployment changed after you read it (`deployment_definition_changed`) |
| 422 Unprocessable Entity  | Needs a new deployment | The SDL changes resources a running deployment can't change (`deployment_resources_changed`) |
| 429 Rate Limited          | Rate limited       | Polling interval too fast or burst of requests         |
| 500 Internal Server Error | Server error       | Retry with exponential backoff                         |

Error response shape. When the API knows the precise reason, `code` carries it:

```json
{
  "error": "ForbiddenError",
  "message": "The project is not reachable in this organization",
  "code": "project_forbidden",
  "type": "client_error"
}
```

The organization and project codes are `organization_forbidden`, `organization_mismatch`, `project_forbidden`, `project_required`, `project_budget_exceeded`, `project_limit_reached`, `organization_limit_reached` and `session_required`. See [Errors](/docs/api-documentation/console-api/organizations-and-projects#errors) for what each one means.

### Polling for Bids

Poll every 3 seconds for 30–60 seconds, then back off or return a timeout error.

---

## Managed Wallet vs SDK

| Feature               | Managed Wallet API | Akash SDK                  |
| --------------------- | ------------------ | -------------------------- |
| **Wallet Management** | Managed by Console | You manage wallet          |
| **Authentication**    | API Key            | Private key/mnemonic       |
| **Payment**           | Credit card (USD)  | Crypto (AKT)               |
| **API Type**          | REST API           | Native blockchain          |
| **Language**          | Any (HTTP)         | Go, TypeScript             |
| **Setup**             | API key only       | Wallet + blockchain setup  |
| **Best For**          | SaaS, web apps     | Blockchain apps, CLI tools |

## Limitations

- Payment method: Credit card only. Existing wallets cannot be linked to a Managed Wallet account at this time.
- Wallet access: Console manages the wallet. You cannot export private keys or sign arbitrary transactions.
- API stability: Pin integrations to `v1` or `v2`. Versions are independent, and breaking changes are announced in the changelog ([https://github.com/akash-network/console/releases](https://github.com/akash-network/console/releases)).
- For production workloads without managed wallet constraints: use the [Akash SDK](/docs/api-documentation/sdk) or CLI with your own wallet.

---

## Resources

- **[API Reference](/docs/api-documentation/console-api/api-reference)** - Complete endpoint documentation
- **[Quickstart](/docs/api-documentation/console-api/quickstart)** - End-to-end deployment in five API calls
- **[Organizations and Projects](/docs/api-documentation/console-api/organizations-and-projects)** - Teams, projects and project-bound keys through the API
- **[SDL Reference](/docs/developers/deployment/akash-sdl)** - SDL syntax guide
- **[Console Documentation](/docs/developers/deployment/akash-console)** - Console overview
- **[Confidential Compute (TEE)](/docs/learn/core-concepts/confidential-compute)** - Attestation and security model

---

## Need Help?

- **Discord:** [discord.akash.network](https://discord.akash.network)
- **GitHub Issues:** [console/issues](https://github.com/akash-network/console/issues)
- **Support:** [GitHub Support](https://github.com/akash-network/support/issues)
