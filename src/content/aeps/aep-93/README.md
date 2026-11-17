---
aep: 93
title: "Console: Async Actions & Notification Center"
description: "Run blockchain actions as persistent server-side jobs and show their progress, together with alerts, in an in-app notification center instead of a blocking modal"
author: Maxime Beauchamp (@baktun14)
status: Final
type: Standard
category: Interface
created: 2026-09-04
completed: 2026-10-28
discussions-to: https://github.com/orgs/akash-network/discussions
roadmap: minor
requires: 63, 84
---

## Abstract

Every blockchain action in Akash Console (create, update, close or fund a deployment, create a lease, reclaim escrow) opens a full-screen modal that cannot be dismissed and holds the user until the transaction is confirmed. If they refresh or navigate away, the action disappears from the UI even though the server may still complete it.

This AEP makes those actions asynchronous and persistent. The browser enqueues an action, the API signs, broadcasts and confirms it in the background, and the user keeps working. Progress and outcome appear in a notification center: a bell with an unread badge, a dropdown of recent items, toasts on completion, and a full activities page. Alerts that today go out by email only join the same feed.

Async mode is explicit opt-in through `?async=true` on the existing transaction endpoint. The synchronous response stays the default for every caller, permanently. The work is confined to Console's own services in `akash-network/console`. No chain or provider changes.

## Motivation

The blocking modal is a foreground process that should be a background one. Closing a deployment takes a few seconds of chain time; the user does not need to watch it, but the modal makes them, and a page refresh loses the in-flight action from view.

What makes the change tractable now is that Console is managed-wallet only ([AEP-84](../aep-84)). Every transaction is already signed and broadcast entirely server-side, keyed by user. Nothing about that needs the browser to stay open, so this is a server-orchestration and UI change, not a change to how anything is signed. If self-custody ever returned to Console, its browser-must-sign flow would stay out of scope.

The change also fits two adjacent efforts. Console Redesign v2 wants low-level mechanics out of the way. The escrow-abstraction work ([AEP-91](../aep-91)) produces automatic funding events that have no home in the UI today; an activity feed is that home.

## Specification

### Scope

In scope: a persistent record for every asynchronous transaction, a unified activity feed, an opt-in asynchronous mode on the transaction endpoint, the notification center UI, and an in-app sink for fired alerts.

Out of scope: email, push or WebSocket delivery (the feed is polled, like every other live surface in the app); server-side bid selection or a full deployment saga (bid selection stays an interactive page); any change to the signer's custody model; flipping the synchronous default.

### Goals

- Actions are non-blocking and survive a page refresh; the server completes them with the browser closed.
- One notification center shows action status and alert firings side by side.
- Completion produces a toast and refreshes the affected data; every item links to the right page.
- Correctness under retries and crashes: no double broadcast, and no false failure that invites a user to retry a transaction that already executed.
- Nothing changes for an existing caller unless they opt in.

### A. What the user sees

Firing an action returns immediately. The bell shows a pending item at once, and the affected rows show a pending state ("Closing...", "Updating...") with conflicting buttons disabled. When the action completes, a toast reports success or failure and the relevant views refresh. Clicking an item opens the right place: a create leads to bid selection, a lease or update to the deployment, a close to the list, an alert to that deployment's alerts. A failed item shows the error, a way to contact support, and a "Try again" that re-initiates the action through the normal UI; it never replays the transaction blindly. An activities page lists everything with filters for in-progress and failed items. Because every tab polls the same feed, all open tabs agree.

The multi-step create flow (create the deployment, wait for bids, create a lease) is glued together in the browser. Each transaction is its own action. Because the deployment sequence number is generated client-side before broadcast, the create action's link already points at the bid-selection step for that deployment, so a refresh mid-create re-attaches and resumes for free.

### B. How it works

Two records, one feed. An **action** is the execution record: which user and wallet, the messages, the current state, and once known the transaction hash and deadline. An **activity** is what the feed shows: kind (action or alert), status, title, link, and seen and read state. Alerts append to the same feed with a deduplication key so a fired alert is written once. The two are kept separate because one is a hot, locked state machine and the other is a paged read model.

Enqueueing is transactional: the action, its activity and the background job are written together or not at all. Two background jobs then do the work. **Broadcast** signs the transaction, persists the signed bytes, the hash and the deadline, and only then sends it; it is never retried, because it is the one step that could execute a transaction twice. **Confirm** polls the chain for that exact hash until it is found or the deadline has passed; it is idempotent and freely retried. Post-transaction side effects that today run inline in the request move to the confirm step and are idempotent. Reapers re-enqueue stuck rows and expire rows past their deadline. Feed rows and finished actions are kept for 90 days.

The transaction signer splits its combined sign-and-broadcast call into a sign-only call that returns the bytes, hash, gas and deadline, and a broadcast call that takes the bytes. The existing combined call stays for the legacy synchronous path until cleanup.

The browser polls the feed: a few seconds apart while anything is pending, less often when idle so alert firings still appear. A status change from pending to terminal is what fires the toast and the refresh.

### C. API

- `POST /v1/tx` is unchanged by default. With `?async=true` it returns `202` with an activity id after the enqueue; the same balance, fee-grant and trial validation runs first and still returns an immediate `402`. API keys may use it for scripted bulk operations and poll the activity.
- Feed endpoints, scoped to the requesting user: list activities with paging and filters, an unseen count, mark seen, mark read, and read one.
- An internal endpoint for the notifications service to post fired alerts into the feed.

Once the asynchronous engine has proven itself, the synchronous default is served by the same engine: enqueue, wait a bounded time for confirmation, and fall back to returning the activity id past the window. The response shape does not change.

### D. Correctness requirements

Two facts make naive retries dangerous. The signer stamps a validity deadline at sign time and the chain deduplicates unordered transactions by hash within it, so re-signing behind a retrying queue produces a new hash the chain cannot deduplicate and the transaction executes twice. And if the process dies after broadcasting but before recording the hash, the transaction may have landed while the record knows nothing; marking it failed invites the user to retry something that already executed.

The implementation must therefore satisfy these properties:

1. The hash and signed bytes are persisted before any broadcast, so every ambiguous outcome resolves by looking up that exact hash: adopt it if it landed, expire it if not.
2. The broadcast step is never retried; all waiting lives in the idempotent confirm step.
3. Concurrent workers cannot both proceed past the queued state.
4. "Not found past the deadline" for the persisted hash is a safe terminal failure, and the user's retry as a fresh action is unconditionally safe.
5. Any re-broadcast sends the same stored bytes. The only path that creates a new hash is one gas-recovery attempt after a definitive on-chain out-of-gas failure, when the prior transaction is terminal.
6. Post-transaction effects fire once, gated on the confirm step's own state transition.

Fault-injection tests that kill the worker between signing, persisting, broadcasting and confirming must show neither a double broadcast nor a false failure before the feature is ramped.

### E. Alerts in the feed

The notifications service already has a single dispatch point for fired alerts, which sends email. It gains a second, best-effort sink that posts each firing into the feed with a deduplication key. A feed outage never blocks email.

### F. Delivery

Behind a feature flag, in this order: the feed and its read-only notification center shell; the signer split; the asynchronous path with escrow reclamation as the tracer, since it only touches already-dead deployments; idempotency hardening; migration of the fire-and-forget actions (close, deposit) and then the guided flows (create, onboarding, lease, update); the synchronous default onto the engine; alerts into the feed; then removal of the legacy path, the combined signer call and the modal. Deposit is migrated unless AEP-91 has removed the deposit UI first; cleanup is never held hostage to that project.

## Rationale

**Opt-in async, sync default forever.** The value of async is UI-centric; a headless client has no bell and wants to block. An explicit parameter cannot break anyone at deploy time and stale cached bundles keep working through every phase. One engine, two response modes.

**Persist before broadcast, rather than reconcile after.** Reconciling by scanning a sender's recent transactions or stamping a memo is heuristic and lags the chain. Knowing the exact hash before anything is sent turns every ambiguous case into a lookup.

**Never retry the broadcast.** The one step that can double-execute is the one that is not retried; everything that can safely repeat is.

**Polling over WebSockets.** Every live surface in the app already polls. A socket layer for one feature would be new infrastructure for a marginal latency gain.

**Bid selection stays on screen.** A server-side saga that picked bids would change what users get charged without them looking.

**Two records, not one.** Alert rows would otherwise carry a state machine they never use, and every bell poll would compete with worker locks.

## Backward Compatibility

- `POST /v1/tx` without `?async=true` returns exactly today's body for every caller, in every phase. When the engine later serves the synchronous default, only its production changes.
- All new endpoints are additive and visible only to their owner.
- A feature flag lets migrated actions fall back to the modal flow, so a partial rollout leaves unmigrated actions untouched.
- API-key clients that opt in receive a `202` and must poll; clients that do not notice nothing.
- Alerts keep sending email exactly as today.

## Test Cases

- A simulated crash at each point between signing, persisting, broadcasting and confirming yields neither a double broadcast nor a false failure, and a landed transaction is adopted by its hash.
- An expired action fails only after its deadline; a fresh retry by the user succeeds independently.
- Enqueue is atomic: no action without a job, no job without an action.
- Feed endpoints return only the requesting user's items.
- `POST /v1/tx?async=true` returns `202` and the record progresses to confirmed; `POST /v1/tx` without the parameter returns the classic body unchanged.
- In the browser: a close is non-blocking, shows a pending state and resolves on poll; a `402` on enqueue shows the add-credits prompt; a refresh mid-create resumes at bid selection.

## Implementations

All in `akash-network/console`, merged between 2026-10-05 and 2026-10-28. Background actions and the notification center were on for every user from 2026-10-21. The flags and the blocking transaction dialog were removed on 2026-10-28.

The build departs from the design above. By the time work started, the web app sent creates, leases and updates through the domain endpoints rather than `POST /v1/tx`, so the asynchronous mode lives on those endpoints:

- `?async=true` works on `POST /v1/deployments`, `DELETE /v1/deployments/{dseq}`, `PATCH /v1/deployments/{dseq}` and `POST /v1/leases`. `POST /v1/tx` stays synchronous. Calls without `async` answer as before, and their outcome still lands in the feed.
- There is no generic transaction engine and no sign-only signer call. Instead each operation is safe to repeat: a close is idempotent, and a create or lease that already landed is adopted rather than sent again. When the signer cannot tell whether a transaction landed, it returns the hash ([#3804](https://github.com/akash-network/console/pull/3804)) and the activity stays pending until that hash is looked up.

| Area | Pull requests |
|---|---|
| Activity feed, bell, history page and toasts | [#4206](https://github.com/akash-network/console/pull/4206), [#4233](https://github.com/akash-network/console/pull/4233), [#4250](https://github.com/akash-network/console/pull/4250), [#4289](https://github.com/akash-network/console/pull/4289), [#4293](https://github.com/akash-network/console/pull/4293), [#4300](https://github.com/akash-network/console/pull/4300), [#4343](https://github.com/akash-network/console/pull/4343), [#4348](https://github.com/akash-network/console/pull/4348), [#4352](https://github.com/akash-network/console/pull/4352), [#4464](https://github.com/akash-network/console/pull/4464), [#4526](https://github.com/akash-network/console/pull/4526), [#4533](https://github.com/akash-network/console/pull/4533), [#4589](https://github.com/akash-network/console/pull/4589) |
| Close in the background | [#4223](https://github.com/akash-network/console/pull/4223), [#4245](https://github.com/akash-network/console/pull/4245), [#4247](https://github.com/akash-network/console/pull/4247), [#4255](https://github.com/akash-network/console/pull/4255), [#4257](https://github.com/akash-network/console/pull/4257), [#4260](https://github.com/akash-network/console/pull/4260), [#4264](https://github.com/akash-network/console/pull/4264), [#4265](https://github.com/akash-network/console/pull/4265), [#4271](https://github.com/akash-network/console/pull/4271), [#4272](https://github.com/akash-network/console/pull/4272), [#4285](https://github.com/akash-network/console/pull/4285), [#4453](https://github.com/akash-network/console/pull/4453) |
| Create in the background | [#4302](https://github.com/akash-network/console/pull/4302), [#4345](https://github.com/akash-network/console/pull/4345), [#4357](https://github.com/akash-network/console/pull/4357), [#4359](https://github.com/akash-network/console/pull/4359), [#4360](https://github.com/akash-network/console/pull/4360), [#4527](https://github.com/akash-network/console/pull/4527), [#4529](https://github.com/akash-network/console/pull/4529), [#4601](https://github.com/akash-network/console/pull/4601), [#4603](https://github.com/akash-network/console/pull/4603), [#4604](https://github.com/akash-network/console/pull/4604) |
| Accepting a bid in the background | [#4342](https://github.com/akash-network/console/pull/4342), [#4347](https://github.com/akash-network/console/pull/4347), [#4553](https://github.com/akash-network/console/pull/4553) |
| Update in the background | [#4301](https://github.com/akash-network/console/pull/4301), [#4346](https://github.com/akash-network/console/pull/4346), [#4354](https://github.com/akash-network/console/pull/4354), [#4588](https://github.com/akash-network/console/pull/4588), [#4594](https://github.com/akash-network/console/pull/4594), [#4595](https://github.com/akash-network/console/pull/4595) |
| Closes Console makes for the user | [#4341](https://github.com/akash-network/console/pull/4341), [#4344](https://github.com/akash-network/console/pull/4344), [#4503](https://github.com/akash-network/console/pull/4503), [#4504](https://github.com/akash-network/console/pull/4504) |
| Alerts in the feed | [#4353](https://github.com/akash-network/console/pull/4353), [#4356](https://github.com/akash-network/console/pull/4356), [#4358](https://github.com/akash-network/console/pull/4358) |
| Observability | [#4350](https://github.com/akash-network/console/pull/4350) |
| Flag removal and legacy path cleanup | [#4615](https://github.com/akash-network/console/pull/4615), [#4616](https://github.com/akash-network/console/pull/4616), [#4624](https://github.com/akash-network/console/pull/4624) |

## Security Considerations

- **Double spend through retries** is the risk this design is built around; section D lists the properties that close it.
- **Custody is unchanged.** Signing stays in the transaction signer with the same derived wallets and grants. The API stores signed bytes, which are public once broadcast, and never key material.
- **Validation runs twice**, at enqueue for an immediate answer and in the worker as the source of truth, so a queued action cannot bypass a limit that changed in between.
- **Feed access is scoped to the owner.** Workers never take user input for the row they act on.
- **The alert sink** sits behind the existing internal-service trust contract, and the guard that rejects client-supplied identity headers must cover it.
- **"Try again" never replays.** It re-initiates through the UI with fresh validation.
- **A server-side flag** can stop honouring `?async` without a deploy; the synchronous path is unaffected by it.

## Copyright

All content herein is licensed under [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0).
