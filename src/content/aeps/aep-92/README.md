---
aep: 92
title: "Console: Data Persistence and Secrets"
description: "Move per-user data from browser storage into the Console database and store deployment secrets sealed under a KMS-backed key hierarchy"
author: Maxime Beauchamp (@baktun14) Serhii Stotskyi (@stalniy)
status: Draft
type: Standard
category: Interface
created: 2026-09-04
estimated-completion: 2026-12-31
discussions-to: https://github.com/orgs/akash-network/discussions
roadmap: major
requires: 63, 84
---

## Abstract

Akash Console keeps most of what it knows about a user in that user's browser: the SDL of every deployment they created, provider favorites, the SDL builder draft, deployment names, UI and onboarding state, and, worst of all, secret environment values sitting in plaintext inside drafts and templates. Since the split described in [AEP-84](../aep-84), Console is managed-wallet only and every user has a stable server-side identity, so the database can become the source of truth.

This AEP has two parts. The first is deployment secrets: the Console API remembers each deployment's definition, secret values reach it already encrypted, it stores them sealed under a per-user data key wrapped by a Cloud KMS key the API process cannot extract, the SDL refers to them through a Console-specific URI scheme, and the API derives the manifest it sends to providers itself instead of relaying whatever the browser sends. The second part moves the rest of the browser-held data into a per-user preferences store through a one-time, additive migration, and adds self-service export and deletion of that data.

The scope is `apps/api` and `apps/deploy-web` in `akash-network/console`. There are no chain or provider changes.

## Motivation

A deployment's SDL exists only in React state and `localStorage`. Open Console on another device, or clear site data, and the deployment is still running but Console can no longer show what it is, update it or redeploy it. The manifest-update view carries a warning that the local file may disagree with the chain, because nothing else can be checked against.

Secrets are the sharpest edge of the same problem. A secret environment value is blanked when a draft is saved and lost on redeploy, so users re-enter database URLs and API keys by hand. Where it is not blanked it sits in plaintext in browser storage and in shared templates. The backend has no encryption at rest and no key management of any kind, so it could not store a value it can later read back even if asked to. The one precedent for user-specific key material, managed wallets, derives keys from a master mnemonic held in an environment variable. That gives a key you can recompute, not one you can rotate without rewriting everything it protects, and it requires the master material to live in the process that uses it.

There is also an intake problem that storage alone does not fix. A value typed in the browser and posted in a create-deployment request passes through the CDN, the WAF, the reverse proxy and its access logs, the Next.js proxy route, request-body logging, APM traces and the error tracker. None of them need be compromised for all of them to retain the body. If the strongest promise Console can make is that a stolen credential yields no secret values because no endpoint returns one, then a captured request body undoes that promise: credential plus body equals the values.

Favorites and preferences are a smaller version of the same thing: they do not follow the user across devices and they vanish with site data. Deployment names held in browser storage also block any feature where more than one person looks at the same deployment.

## Specification

### Scope

In scope:

- Server-side storage of each deployment's definition and committed manifest version.
- A key hierarchy backed by Cloud KMS, per-user data encryption keys, and sealed intake of secret values.
- A Console Reference scheme for SDLs, sealed deployment secrets on create and update, and server-derived manifests at lease creation and update.
- Key rotation and access observability.
- A per-user preferences store, a one-time migration of browser-held data, and self-service export and clear.

Out of scope:

- Chain protocol or provider changes. Provider-side secret delivery is the subject of [AEP-50](../aep-50); see Rationale.
- End-to-end encryption. Console assembles the manifest and therefore reads every value at deploy time.
- Full account deletion (identity, wallet funds, billing). This work must not obstruct it.
- Remote-deploy OAuth tokens, deferred to the Build and Deploy effort ([AEP-85](../aep-85)), which must use the encryption service and never browser storage when it ships.
- Self-custodial wallets and Console Air. Sealed secrets require the managed signing path.
- Bring-your-own-key and per-customer KMS keys.

### What is promised, and what is not

Console substitutes secret values into the SDL and hands the result to the provider, so the API necessarily sees plaintext at deploy time. That single fact caps what any storage design here can promise. Within it, this AEP promises:

- No API endpoint returns a secret value, at any privilege level, to any caller. A stolen credential yields names, never values.
- Values are encrypted at rest under a key the API process can exercise but never extract, and decryption can be revoked without a deploy. A database dump without KMS access yields nothing.
- Values arrive at the API already encrypted, bound to the user they were sealed for and to an expiry, so a request body recovered from a log later is inert.
- Every plaintext access requires a call to the key service and is therefore externally auditable.
- Deleting a user makes their stored secrets unrecoverable regardless of what a backup holds.

It does not promise that Console cannot read a value. "Encrypted at rest" is true and routinely misread as "we cannot read it"; user-facing copy must not encourage that reading. Secret names, how many a deployment has and when the set last changed stay in the clear.

### A. Server-side deployment definition

The Console API stores a deployment's SDL and the manifest version committed on chain on the deployment's own record, written before the create transaction is broadcast, and keeps that record in sync as the deployment is updated and eventually closed.

- The order on create is: validate, mint the `dseq`, build and hash the manifest, persist the definition, then broadcast. A broadcast that succeeded without its definition stored would leave a deployment that exists on chain and can never be leased from stored data. A broadcast failure leaves an orphaned record, which is harmless; the write is an update-or-create on `(userId, dseq)` so a retry replaces it.
- Deployments created through the generic transaction endpoint get the same record as ones created through the deployment endpoint.
- An SDL too large to store is rejected before anything is broadcast, rather than deployed unrecorded.
- The record tracks deployment updates and is swept when no chain deployment backs it.
- `GET /v1/deployments/{dseq}` returns the stored definition.
- Until section C exists, the stored SDL has its environment values stripped, because environment variables are where secrets live today and Console may not store secrets in the clear. Once secrets can be referenced rather than inlined, ordinary environment values are stored again so a remembered definition is complete.
- Lease creation keeps using the client-supplied manifest in this phase. A manifest cannot be sent to a provider without secret values, and the stored SDL does not carry them yet.

### B. Key management and sealed intake

**B.1 Key hierarchy.** One Cloud KMS asymmetric key whose private half the Console API can exercise but never extract. Each user has one data encryption key (DEK), wrapped under the KMS key and stored on the user. The DEK is never stored in the clear and lives unwrapped in memory for one request only; a request that touches several secrets unwraps it once.

**B.2 Provisioning without a KMS dependency.** A user signing up gets a wrapped DEK without any KMS call, since wrapping needs only the public half. A user who registered before this phase gets one lazily on first need. Signup therefore gains no dependency on KMS availability.

**B.3 One format.** JWE is the single encryption format at every layer: the client's seal, the wrapped DEK, and the stored secrets. Every blob wrapped under the KMS key names the key version that wrapped it in its `kid`, so adding a version cannot silently orphan data. No hand-written cryptographic primitive and no hand-written byte-format parsing is introduced; values sealed by a standard JOSE library survive the full round trip unchanged.

**B.4 Seal context.** A public route hands an authenticated client everything it needs to seal: the current public key and the claims to bind. The client encrypts all of a deployment's secrets as one payload bound to its own subject and an expiry. The API rejects an invalid or expired sealed payload before spending anything, opens a valid one, and re-encrypts the values under the caller's DEK.

**B.5 Development and CI.** Local development and the entire test suite run against a Cloud KMS emulator, exercising the real formats rather than an in-code key implementation or a mock.

**B.6 Deletion.** Deleting a user cascades to their wrapped DEK, so their stored secrets become unrecoverable from any backup: a crypto-shred rather than a row delete.

This phase ships dark. Plaintext intake for ordinary environment values continues; nothing user-facing changes.

### C. Console References and sealed deployment secrets

**C.1 The scheme.** A Console Reference is how an SDL names a value the Console holds rather than carrying the value itself:

```
ac-<kind>://<NAME>

kind   := "secret"                        ("var" reserved for later)
NAME   := [A-Za-z_][A-Za-z0-9_]{0,63}     (case-sensitive)
```

Rules:

- A reference is recognised only as the entire value of an SDL environment entry. There is no interpolation into a surrounding string, so resolution is an exact match rather than a parse, and a value that merely contains scheme-like text cannot change the meaning of the SDL.
- Any whole value beginning `ac-` is reserved. An unrecognised kind is rejected with a `4xx` naming the offending value, not passed through, so a client written against a future kind fails loudly against an older API instead of shipping a literal `ac-var://X` into a container.
- Resolution goes through a registry keyed by kind; adding a kind is a registration plus a resolver. A reference resolves within its own service's namespace.
- A resolved value is never re-scanned. There is no recursive resolution.
- Substitution sets the parsed YAML value node rather than editing YAML text, so a value containing YAML metacharacters survives unchanged.

**C.2 Create.** `POST /v1/deployments` gains an optional `sealedSecrets` field carrying the transport seal from B.4, whose plaintext is a name-to-value map. There is no plaintext alternative field. Because the names cannot be read until the seal is opened, validation happens after decryption and before any transaction is broadcast: a referenced name with no value is rejected naming it, and a supplied name the SDL does not reference is rejected too, so a typo on either side is caught rather than ignored.

The Console then re-seals for storage rather than storing what the client sent. The client seals before the deployment exists, so its blob cannot be bound to a `dseq`; once the `dseq` is minted the Console writes its own JWE token with a complete protected header `{ sub, dseq, kid }`, so a token copied onto another deployment, or another user's, fails to open rather than decrypting under the wrong identity. Re-sealing needs no KMS call since the DEK is already in hand.

Substitution happens in one place: on the parsed SDL immediately before manifest generation, so the manifest version committed on chain always covers resolved values. The stored SDL keeps the references and is never rewritten with resolved values. The create response still returns a manifest for the browser's comparison, but built from the unresolved SDL, so the resolved form exists only inside the API process. Limits, configurable: 100 secrets per deployment, 16 KB per value. Secrets are a column on the deployment's own record, governed by the existing ownership rules rather than a separate authorization subject.

**C.3 Update.** `PUT /v1/deployments/{dseq}` accepts the same optional field. Since no endpoint returns a value, the client cannot assemble the full set, so the API merges: open the stored token, open the incoming one, overlay, re-seal under a header naming the same deployment. The SDL stays the source of truth for which names exist; names it no longer references are dropped, and names it references with neither a stored nor a supplied value are rejected. An update with no `sealedSecrets` is the common case. A stored token that fails to open fails with a distinct `5xx`, leaves the token untouched, is never retried or overwritten, and logs the header's claims but never its bytes; a failed authentication tag is evidence that something moved the data. A replaced value takes effect when the deployment is next updated on chain, not in the already-running workload.

**C.4 Read.** `GET /v1/deployments/{dseq}` lists the names the SDL references and whether each has a stored value, derived from the SDL and the presence of the token, so it costs no KMS call. There is no separate secrets endpoint and no endpoint returning a value. Per-secret sizes and timestamps are deliberately not offered: a value's byte length is weak but real information about a credential.

**C.5 Redeploy.** `POST /v1/deployments` accepts `inheritSecretsFrom: <dseq>`. The API opens the source token and re-seals its contents under the new deployment's header, in process, with the plaintext never reaching the client. Names supplied in `sealedSecrets` take precedence over inherited ones. Only the owner can inherit, and the source may be closed.

**C.6 Close.** Secrets are kept when a deployment closes so it can be redeployed with its credentials intact. Account deletion is the routine deletion path.

**C.7 Server-derived manifests.** Lease creation stops taking the manifest from its request. It loads the stored definition by `(userId, dseq)`, resolves references from the sealed token, re-derives the manifest through the same SDL service used at create, and sends that to each lease's provider. Re-derivation must be byte-identical to what was hashed at create; a test that derives twice from one stored definition and asserts identical bytes guards against SDK upgrades changing the output. There is deliberately no assertion against the version committed on chain: a divergence surfaces as a provider rejection. A `dseq` with no stored definition falls back to the client-supplied manifest and logs a `LEASE_MANIFEST_FALLBACK` event so the residual volume from older deployments is measurable. A deployment whose SDL contains a Console Reference is never eligible for the fallback, since accepting a client manifest for it would mean accepting a client-supplied secret value. Deployment updates move to the API's update endpoint, which does the same job server-side.

**C.8 The `manifest` request field** on lease creation becomes optional, ignored where a stored definition exists, and documented as deprecated in the OpenAPI description. It is removed together with the fallback, in a later release, once the fallback event count reaches zero.

**C.9 Web app.** Wherever the deployment SDL is read, it comes from the API first and from `localStorage` only for deployments the API has no definition for. The local-versus-chain hash warning renders only in that fallback. A reference-bearing SDL is displayed and resubmitted as-is; the browser never sees a value. The web app stops writing deployment SDL to `localStorage` for new and updated deployments, leaves existing records in place as the fallback, and retires the hash warning and the client-side version comparison once nothing new can reach the fallback path. Deployment updates go through `PUT /v1/deployments/{dseq}` and the browser-side signing and provider calls are removed.

**C.10 Secrets in the deployment form.** Secrets can be entered in the environment variables editor or a dedicated modal at creation and on the deployment details page, and private registry credentials reference secrets the same way. References are visually distinct from literals. This is the first user-visible piece of the secrets work; everything before it is usable over the API only.

### D. Key rotation and access observability

Nothing user-facing. Two operational obligations that follow from holding encrypted secrets at all.

**D.1 Rotation.** A new KMS key version is added and promoted on the cloud side; the Console then re-wraps each user's DEK from the version that wrapped it onto the new one. Because secrets are sealed under the DEK's identity rather than its wrapping, a re-wrap is invisible to every stored token: one row per user, not one per deployment. A fingerprint over every stored token, taken before and after, proves the rotation changed no secret. A run that stops halfway leaves a working system, since every enabled version still opens what it produced, and re-running continues from where it stopped. "Is any DEK still wrapped under version N" is answerable before anyone disables a version, and a dry-run reports what a rotation would do without changing anything.

**D.2 Single-user containment.** One user's DEK can be replaced and their secrets re-sealed under it, as incident response. The scheduled procedure does not contain a leaked DEK; this does.

**D.3 Observability.** KMS data-access audit logging is enabled from the start so the trail exists rather than being discovered missing. The Console emits a per-unwrap event and key-service metrics. Alerts cover the Console's own events: any failed token open, and an unusual spread of unwraps across users. A normal deploy is one DEK unwrap; a mass exfiltration is hundreds across many users inside a second, and the two are trivially distinguishable once something is watching. Audit-trail alerts on decrypt rate and unexpected principals are deferred until unwrap volume can be measured in production.

**D.4 Runbook.** Scheduled rotation, emergency rotation and alert response are written down and rehearsed. The runbook also records what rotation does not protect against, and that deletion is a crypto-shred.

### E. The rest of the browser-held data

**E.1 Inventory.** Provider favorites, the SDL builder draft, deployment names and metadata, the selected network, UI and onboarding state, the managed-wallet token and wallet map, and a standalone trial flag.

**E.2 Preferences store.** A per-user, namespaced (network-scoped where relevant), owner-only store with the server as source of truth. The client adapter reads its cache instantly and reconciles in the background; the server wins on conflict.

**E.3 One-time migration.** Runs once in the background after sign-in, idempotent, multi-device safe (a second device contributes only what the server is missing), additive and non-destructive: skip if present, union-merge list-like data such as favorites, never overwrite. One flag per kind of data, instrumented so failure rates are visible. Local data stays as a fallback and is removed only after a 60 to 90 day window and telemetry confirming a low failure rate.

**E.4 Per kind.** Favorites move to the store, merged on migrate. The SDL builder draft lives on the server, holds references rather than secrets, and syncs across devices. Deployment names and metadata move onto the deployment record from section A. The trial indicator is derived from the server-side wallet record instead of a stored flag. The managed-wallet token and wallet map stop being persisted in the browser. The selected-network preference follows once the separate removal of custom-node settings lands.

**E.5 Export and clear.** A user can export their stored data (preferences, drafts, deployment metadata, templates; secret names but never values) scoped to themselves, and clear drafts, preferences and variables so they are gone from subsequent reads and exports. This is not account deletion.

### F. Phasing

| Phase | Contents | Visible to users |
|---|---|---|
| 1 | Server-side deployment definition (A) | No |
| 2 | Key hierarchy, sealed intake, emulator (B) | No |
| 3 | Console References, sealed secrets on create/update/redeploy, server-derived manifests, web app reads from the API (C.1 to C.9) | No, until C.10 |
| 3b | Secrets in the deployment form (C.10) | Yes |
| 4 | Rotation and observability (D) | No |
| 5 | Preferences store, migration, export and clear (E) | Yes |

Phases 1 and 2 were complete at the time of writing; phase 3 was in progress.

## Rationale

**The security property is server-derived manifests, not a column type.** Storing ciphertext is table stakes. What actually removes the browser from the trust boundary is that the API stops relaying arbitrary client input into what a provider runs and derives the manifest from what it stored. Once that holds, the browser never needs a value, which is what makes "no endpoint returns a value" tenable.

**Sealed intake, not TLS alone.** TLS protects the wire. It does not stop the request body from being retained by every hop that terminates it. Sealing in the browser, bound to the user and an expiry, makes a captured body worthless without also having the KMS private key, which nothing on those hops has.

**A per-user DEK wrapped by KMS, rather than one key for everyone or a derived key.** A single key makes every user's secrets one blast radius and makes rotation a rewrite of every value. A derived key cannot be rotated and keeps master material in the process. A per-user DEK bounds the blast radius to one user, makes deletion a crypto-shred, and makes KMS rotation a re-wrap of one row per user with no secret touched.

**A URI scheme rather than `${...}` or `{{ }}`.** Users' own scripts and commands use both of those, so either would collide with legitimate values. `ac-secret://NAME` needs no escaping in YAML, survives export, import and templating unchanged, is visually obvious when reading an SDL, and reserves a prefix that can carry other kinds later.

**Whole-value references only.** Interpolation would require parsing every string in every SDL and would make "does this value contain a secret" undecidable from the outside. Exact match keeps resolution trivial and keeps a value that happens to contain scheme-like text inert.

**No read-back API.** Write-only-then-replace closes an exfiltration path for free. The merge semantics on update exist precisely so that the absence of read-back does not force users to re-enter everything.

**Secrets survive close.** Redeploying a closed deployment with its credentials intact is the case users hit most; forcing re-entry there would push them back to pasting values into templates.

**A KMS emulator, not an in-code implementation.** Nothing in phase 2 is testable without one, and a test seam that exercises the real JWE formats against a real key service protocol catches the class of bug a mock hides.

**Environment values stripped first, restored later.** Phase 1 could not store environment values without storing secrets in the clear, so it stored the deployment's shape. Once references exist, ordinary values are safe to keep and the stored definition becomes complete.

**Additive migration.** A destructive migration cannot be re-run, cannot cope with a second device, and turns a bug into data loss. Skip-if-present plus union-merge is safe to run any number of times from any number of browsers.

**Relation to [AEP-50](../aep-50).** AEP-50 concerns secrets at the chain and provider layer, so that a provider can receive values the network never sees in the clear. This AEP is about what Console holds on the user's behalf and how it gets into the manifest. The two are complementary: if AEP-50 lands, a Console Reference kind could resolve to a provider-side secret instead of a Console-held value, through the same registry.

## Backward Compatibility

- Deployments created before phase 1 have no stored definition. They keep working through the lease-creation fallback and through the browser's existing `localStorage` records, which are neither migrated nor deleted. The fallback event count is the exit condition for removing the fallback.
- The lease-creation `manifest` field stays accepted until the fallback is removed, and is marked deprecated in the OpenAPI document so generated clients see it.
- `sealedSecrets` and `inheritSecretsFrom` are optional. Clients that never send them are unaffected.
- Any whole SDL environment value that begins with `ac-` is now reserved. A deployment whose SDL uses such a value literally, with an unrecognised kind, is rejected on create and update. This is a breaking change for that (expected to be empty) population and is called out in the release notes.
- Non-secret environment values continue to be written inline in the SDL.
- The public JWK route and the emulator introduce no user-visible change. Signup does not depend on KMS.
- Console Air and self-custodial flows are unchanged. Sealed secrets require the managed signing path, so browser wallets are out of scope rather than broken.
- Browser-held data is left in place until the telemetry-gated cleanup; a user on an old build keeps working from local data throughout the migration window.

## Test Cases

- Definition storage: a definition exists before the create transaction is broadcast, on both the deployment and transaction endpoints; an oversized SDL is rejected with nothing broadcast; a swept record is gone once no chain deployment backs it.
- Key hierarchy: a sealed payload for user A does not open for user B; an expired seal is rejected before any KMS call; a payload sealed by a standard JOSE library round-trips; a user created before the phase gets a DEK on first need; a request touching several secrets unwraps once.
- References: name boundaries and case sensitivity covered exhaustively; a reference inside a larger string is untouched; an unknown `ac-` kind fails with a `4xx` naming it; a resolved value that looks like a reference is not resolved again; registering a second kind in a test makes the deploy path resolve it with no other change; YAML metacharacters in a value survive substitution.
- Create and update: a referenced name with no value fails with nothing persisted and nothing broadcast; a supplied name the SDL does not reference is rejected; the response manifest and body contain no value; the stored SDL keeps references; the on-chain version is the hash of the resolved manifest; replacing one value leaves the others opening to their original plaintext; removing a reference drops the name; a tampered token fails distinctly, stays intact, and logs the event.
- Inheritance and binding: a token moved to another deployment of the same user fails to open; inheriting from another user's deployment returns not found; inheriting from a closed deployment works; a supplied value overrides an inherited one.
- Lease creation: a deliberately wrong client manifest is ignored when a stored definition exists; a reference-bearing deployment whose definition cannot be resolved is refused rather than falling back; deriving twice yields identical bytes; a `dseq` with no definition falls back and logs the event.
- Rotation: fingerprint before equals fingerprint after; a run interrupted halfway leaves every token openable; the "still under version N" query is accurate; a single-user re-key opens under the new DEK only.
- Migration: running twice is a no-op; two devices contribute disjoint favorites and both survive; a server value is never overwritten by a local one; export contains no secret value.

## Implementations

All in `akash-network/console`.

| Phase | Pull requests |
|---|---|
| 1, definition storage | [#3662](https://github.com/akash-network/console/pull/3662), [#3664](https://github.com/akash-network/console/pull/3664), [#3667](https://github.com/akash-network/console/pull/3667), [#3669](https://github.com/akash-network/console/pull/3669), [#3670](https://github.com/akash-network/console/pull/3670), [#3685](https://github.com/akash-network/console/pull/3685), [#3686](https://github.com/akash-network/console/pull/3686), [#3733](https://github.com/akash-network/console/pull/3733), [#3778](https://github.com/akash-network/console/pull/3778), [#3779](https://github.com/akash-network/console/pull/3779), [#3780](https://github.com/akash-network/console/pull/3780) |
| 2, keys and sealed intake | [#3624](https://github.com/akash-network/console/pull/3624), [#3625](https://github.com/akash-network/console/pull/3625), [#3637](https://github.com/akash-network/console/pull/3637), [#3639](https://github.com/akash-network/console/pull/3639), [#3704](https://github.com/akash-network/console/pull/3704), [#3705](https://github.com/akash-network/console/pull/3705) |
| 3, references and sealed secrets | [#3707](https://github.com/akash-network/console/pull/3707), [#3757](https://github.com/akash-network/console/pull/3757), [#3763](https://github.com/akash-network/console/pull/3763), [#3764](https://github.com/akash-network/console/pull/3764), [#3765](https://github.com/akash-network/console/pull/3765), [#3767](https://github.com/akash-network/console/pull/3767), [#3771](https://github.com/akash-network/console/pull/3771); update, inheritance, read, server-derived lease manifests and the web app changes in progress |
| 4 and 5 | Not started |

The AEP moves to Last Call once phase 3 is complete and the deployment form can take a secret (C.10).

## Security Considerations

- **Trust boundary.** The Console API reads every secret value at deploy time, inside the process, for the duration of one request. Anyone who can execute code in that process, or hold the KMS decrypt permission, can read values. The controls that matter are therefore KMS access control and revocation, the audit trail on every unwrap, and alerting on unwrap patterns that do not look like deploys.
- **What a stolen credential yields.** Names and which of them have values. No value, no size, no per-value timestamp.
- **What a database dump yields.** Ciphertext under per-user DEKs that are themselves wrapped under a KMS key the database never held. Nothing without KMS access.
- **Metadata in the clear.** Secret names, the count per deployment, one `updatedAt` for the set, deployment names and user emails. This is a deliberate trade and should be stated in user-facing documentation.
- **Logging.** Sealed tokens are never logged. A failed open logs the protected header's claims, never its bytes. Substituted values exist only in the manifest sent to the provider and in no response, trace attribute or error payload; the create response's manifest is built from the unresolved SDL for that reason.
- **Tamper evidence.** A stored token that fails its authentication tag is left in place rather than overwritten, because it is the only record of what happened.
- **Header binding.** Tokens carry `{ sub, dseq, kid }` so a token moved across deployments or users fails to open. Inheritance re-seals rather than copies, and the test for it asserts the source token does not open under the new context.
- **Delivery to the workload.** Values still land as environment variables, which are visible in process lists, logs, crash dumps and container inspection on the provider. Files on `tmpfs` would be a better shape and are future work, as is confirming nothing secret-adjacent can reach the chain, where it would be permanently public.
- **Public templates.** Because SDLs hold references and never values, a template shared publicly cannot leak a secret. The reference name itself is visible and should be treated as such.
- **Reserved prefix.** Rejecting unknown `ac-` kinds means an older API cannot be tricked into shipping a future reference literally into a container.
- **Rotation does not un-leak.** Re-wrapping DEKs onto a new KMS version protects against future compromise of the old version. It does not help if a DEK itself leaked; single-user re-key and re-seal is the containment for that.

## Copyright

All content herein is licensed under [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0).
