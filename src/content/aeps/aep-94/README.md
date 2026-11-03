---
aep: 94
title: "Console: Organizations and Projects"
description: "Organization-owned billing and managed wallet, with projects as the grouping and permission boundary for shared team workloads"
author: Maxime Beauchamp (@baktun14)
status: Final
type: Standard
category: Interface
created: 2026-09-04
completed: 2026-10-27
discussions-to: https://github.com/orgs/akash-network/discussions
roadmap: major
requires: 63, 68, 84
---

## Abstract

Akash Console is single-tenant per user. Every owned row hangs off the user, and a user has exactly one managed wallet. Because a deployment's on-chain identity is `(owner_address, dseq)` and that address is the managed wallet, the wallet is the tenancy boundary: two people cannot share a workload, and billing is attached to a person rather than a company.

This AEP introduces organizations, a team boundary that owns billing and the managed wallet, and projects, a grouping and permission boundary inside an organization. After the change a company pays once, its engineers share the workloads they deploy under one on-chain address, and those workloads are filed into projects that individual members can be granted or denied access to. Every user gets a personal organization, invisible until they create or join a team, so nothing changes for someone working alone.

The scope is Console's own services in `akash-network/console`. There are no chain changes.

## Motivation

Every authorization rule in the Console API is "this row belongs to the current user", and the hard constraint underneath is one managed wallet per user. Three consequences follow:

- Two people cannot see or manage the same workload. A teammate cannot restart a service their colleague deployed.
- Billing is attached to a person. A company cannot pay for its engineers' usage, and an engineer leaving takes the payment relationship with them.
- There is no way to separate staging from production, or one client's workloads from another's, beyond naming conventions held in browser local storage.

[AEP-63](../aep-63) gave managed-wallet users an API, [AEP-68](../aep-68) gave them billing and usage, and [AEP-84](../aep-84) made Console managed-wallet only. All three assume one person per wallet. Teams are the next unit of adoption and the current model has no place to put them.

## Specification

### Scope

In scope: organizations, projects, membership and invitations; moving the wallet and the billing relationship to the organization; tenant scoping and a role and project based permission model; deployments filed into projects and listed through the API; organization-scoped API keys; per-person caps on the free trial and the first-purchase bonus; organization-scoped alerts; per-project spend attribution and budgets.

Out of scope: chain changes; one wallet per project (see Rationale); API key permissions narrower than the owner's role (a follow-up); SSO and directory sync.

### Concepts

**Organization.** The billing and ownership boundary. Owns the managed wallet, the Stripe customer, payment methods, transactions and credit. One wallet per organization, so all members deploy under one on-chain owner address.

**Project.** A grouping inside an organization and a permission boundary. Every deployment belongs to exactly one project. Every organization has a default project that cannot be deleted.

**Personal organization.** Auto-created for every user, containing only them. It preserves today's behaviour exactly and stays invisible in the UI until the user creates or joins a team.

**Roles.**

| Organization role | Can |
|---|---|
| `OWNER` | Everything, including billing and deleting the organization |
| `ADMIN` | Everything except billing and deleting the organization; cannot grant or remove `OWNER` |
| `MEMBER` | Deploy and manage within granted projects |
| `BILLING` | Payment methods, transactions, invoices; no deployment access |
| `VIEWER` | Read-only within granted projects |

`OWNER` and `ADMIN` implicitly reach every project. `MEMBER` and `VIEWER` reach only projects they are explicitly granted, with a project-level role of admin, member or viewer. An organization always has at least one `OWNER`.

### What this is not

The words "organization" and "project" carry expectations from AWS and GCP that this design does not meet, so three boundaries are stated plainly and must be reflected in product copy.

**A project is not a confidentiality boundary.** All of an organization's deployments live under one public on-chain owner address. Anyone, member or not, can enumerate them from the chain. What the project boundary enforces is mutation (closing, funding and updating a deployment all route through the API) and what the app shows. It does not make a deployment's existence secret.

**A project is not a spend boundary.** The on-chain deposit authorization is organization-wide and cannot carry a project id. Any member who can deploy in any project can spend the organization's entire balance, including on projects they cannot see. Per-project budgets are a cooperative guardrail against accidental overspend and a basis for chargeback, not isolation. A true spend boundary would require one wallet per project, which is the trade consciously made in exchange for shared workloads and a single credit pool.

**An organization is not a security boundary against its own admins.** An API key carries its owner's full organization role, so an `OWNER`'s key can delete the organization. Scoped keys are follow-up work.

### A. Model

New entities: organizations, organization members, invitations, projects, project members, and a record of granted free trials. Everything a user owns today (wallet, wallet settings, payment methods, transactions, deployment records, API keys, templates) gains an organization, and where relevant a project. The existing user references stay as "who did this" for audit, and stop being used for authorization.

Four invariants shape the model:

- **Every user has exactly one personal organization**, guaranteed at the database level, which is what makes the backfill safe to re-run.
- **The wallet row is never recreated or renumbered.** Its identifier is the key-derivation index that determines the on-chain address, so the migration only adds columns and updates rows, and the transaction signer needs no change. The cascade that today deletes a user's wallet and deployment records with the user is removed: under organizations a departing member must not take the wallet's address mapping or a live deployment's funding with them.
- **Organizations and projects are soft-deleted.** An organization owns a funded wallet; a hard delete would orphan real funds.
- **Rows cannot straddle organizations.** A project-bearing row is constrained to a project of the same organization, and removing someone from an organization removes all their project grants with them.

### B. Authorization

Three layers, in order of trust. First, a tenant predicate applied by the data layer to every query, unconditionally, so that a query written without any explicit filtering returns only the active organization's rows; today's filtering is opt-in per call site, which is survivable while each user only sees their own data and becomes a cross-tenant leak the moment organizations share tables. Second, role-based ability rules with project scoping. Third, coarse route guards.

Every authenticated request resolves an active organization: an API key's bound organization first, then a client-supplied organization header, then the user's last-used organization if they are still a member, then their personal organization. An API key combined with a conflicting header is rejected rather than resolved either way; naming an organization the caller does not belong to is rejected. A client may narrow a request to one project, never widen it. Membership is not cached, so removal takes effect immediately.

The current rule engine builds rules by string-templating JSON and cannot express "this member may reach these projects" (an array interpolated into a JSON string silently becomes a comma-joined string that matches nothing). It is replaced by rules built from real data, with "admin, all projects" and "no context" kept as distinct states so the data layer never fails open. Two rules the database cannot express are enforced in services with a locking read: an `ADMIN` may not grant or remove `OWNER`, and the last `OWNER` may not be demoted or removed.

### C. Deployments and projects

A deployment has no database record today; the list is read straight from the chain by owner address and names live in the browser. With one address per organization, the API must decide which deployments a member may see, so the per-deployment record becomes authoritative: organization, project, owner address, name and state.

Every deployment belongs to a project from the moment it is created. The record is written before the transaction is broadcast, so a deployment that succeeds on chain is never missing from the app; a safety net at the signing chokepoint and a periodic reconciliation against the chain catch anything that bypassed the primary path and file it into the default project rather than losing it. Deployments closed outside the app are reflected as closed.

The deployment list is served by the API, filtered to what the caller may see, with server-side paging, search by name and a project filter. A deployment the caller cannot see is indistinguishable from one that does not exist. Owners and admins can move a deployment between projects; a project still holding deployments cannot be deleted. Deployment names move from browser storage onto the record, migrated once from local storage.

### D. Organization lifecycle

A user creates an organization from the account menu and becomes its `OWNER`; it gets a default project and its own non-trial wallet immediately, and the user is switched into it. Creation is rate-limited per user (see F).

Owners and admins invite by email with a role and optional project grants; an admin cannot invite as `OWNER`. Invitations expire, can be revoked, are not duplicated on re-invite, and their links are secrets stored only as a hash. A trial organization cannot invite. Opening an invitation shows who invited them and to what before asking them to sign in or sign up; after authenticating the invitee returns to the invitation, joins with the intended access, and lands in the organization. A signed-in user whose email differs from the invited one must confirm rather than silently joining as the wrong identity. Accepting twice, or two people racing one link, cannot produce duplicate membership.

A members screen lets owners and admins change roles and remove members. A removed member loses access immediately, and their deployments stay with the organization and keep running, because they belong to the organization's wallet. Owners and admins create, rename and delete projects and grant or revoke project access; revocation is immediate, and a member with no grants sees an explanation rather than an empty list.

### E. Billing

The credit layer itself is unchanged: balances, spending authorization and signing are already keyed by wallet or address. The change is routing. The Stripe customer, payment methods, transactions and auto-reload settings belong to the organization, and every record still notes which member acted. Wallet provisioning moves from user registration to organization creation. Members joining a team do not bring their saved cards. Analytics keeps the acting person as the identity and adds the organization as a property.

Two rules are load-bearing. Payment idempotency keys keep their formula, because a client retry spanning a deploy boundary would otherwise produce a second charge. And the payer is never derived from ambient context: a refund for a purchase made in organization A debits organization A, read off the transaction, even if the buyer has since moved to organization B.

### F. Trial and bonus abuse

This is the highest-risk consequence of the change and must ship in the same release as organization creation.

Today the ceiling is one free trial per verified email, held up by one wallet per user. Once users can create organizations it becomes one trial per organization, unbounded per person, and the existing fingerprint checks are blind to it because they look for other users, not for the same person. The first-purchase bonus (10% of a first top-up, up to $100) has the same hole and hands out real money.

Both become one per person across all organizations, enforced by unique constraints so that an atomic insert replaces a check-then-act race, backfilled from existing activated wallets so current users cannot claim again. As policy on top: trials only on personal organizations (behind a setting, so it can be relaxed later), owner or admin only, trial organizations cannot invite, and a refunded bonus does not restore eligibility. Rejected claims are recorded so the abuse rate is visible. Organization creation is rate-limited per user, which caps every organization-multiplied abuse vector at once, including ones not yet thought of.

### G. API keys

Every API key is bound to one organization at creation, and optionally to one project for CI use. A key acts only within that organization regardless of any header the caller supplies. Existing keys are bound to their owner's personal organization. A member's key cannot exceed what that member can do.

### H. Frontend

The active organization is remembered per browser and sent to the API on every request, with a one-shot query parameter so a link can open directly in a specific organization. A switcher in the header shows the current organization when the user has more than one and is hidden otherwise. Switching shows no data from the previous organization, even briefly. The personal organization stays invisible, so an existing user's interface is unchanged apart from a "Create organization" entry in the account menu. The onboarding gate must let invitees and new organizations through: an invitee without a wallet of their own inherits the organization's, and must not be sent into first-deployment onboarding.

### I. Alerts and notifications

Alerts and notification channels belong to the organization and, where relevant, to a project, so an alert created by one member is visible to others who can see the project. Each organization has one default channel. Existing alerts and channels are attributed to their owner's personal organization and keep firing. The notifications service trusts identity headers minted by the proxy, so the guard that rejects client-supplied identity headers must be generated from the same list that mints them.

### J. Per-project spend and budgets

Spend is reported per project over a date range, reconciling against the organization total with any remainder shown as unassigned. Owners and admins set a monthly budget per project. Exceeding it raises an alert first and then blocks new deployments in that project; stopping running deployments is opt-in, never the default. A budget is a rate limiter on new commitments, not a spend cap: funds are deposited in advance and consumed per block, so a project can overrun by whatever it has already deposited. Per-project spend is visible only to members who can see the project, and unlike today's public wallet-keyed spend reporting it must not be public, since project names and spend reveal organization structure.

### K. Rollout

Three steps: an additive schema change, an idempotent backfill (a personal organization and owner membership per user, a default project per organization, then the organization onto every child row), and a tightening step that makes the new columns required and adds the new constraints. The first two ship a release early; the third ships with the application code that requires organization context. Pre-flight checks run before the backfill and assertions run before tightening. The notifications service has its own database with no link to the main one, so its backfill is an explicit deploy step rather than a migration.

| Phase | Contents |
|---|---|
| 0 | Model, backfill, tenant scoping, permission engine, active-organization resolution, wallet and billing relationship moved to the organization. Nothing user-visible. |
| 1 | Behind a feature flag: create, invite and accept, member and role management, projects and grants, organization switcher, deployments filed into projects and listed through the API, deployment names persisted. |
| 1.5 | Before full rollout: organization-scoped API keys, trial and bonus caps, project picker in the deploy flow, billing and usage re-labelled to the organization. |
| 2 | Schema tightening, per-project spend and budgets, alert scoping, organization-prefixed routes, audit log. |

## Rationale

**One wallet per organization, not per project.** A wallet per project would make projects real spend and confidentiality boundaries, at the cost of one credit pool and one set of cards per project, and workloads that cannot move between projects without changing on-chain owner. Shared workloads and a single balance are what teams asked for; the boundaries a wallet per project would have given are stated as non-goals instead of being half-implemented.

**A personal organization for everyone.** Backfilling one for every user means the rest of the code has exactly one path, with no nullable-organization branch to carry forever, and the migration is a no-op from the user's point of view.

**Default-on scoping at the data layer.** Once one organization's rows sit beside another's, a single forgotten opt-in is a cross-tenant leak, so the safe query has to be the one that requires no thought.

**Write the deployment record before broadcast.** The default project is admin-visible. A member's deployment that reconciled into it after the fact would vanish from that member's own view.

**Soft delete and kept user references.** Both are about the irreversibility of the alternative: a hard-deleted organization orphans funds, and a dropped column cannot come back mid-rollback.

**Abuse caps in the same release as creation.** The bonus pays out up to $100 per organization and organization creation is otherwise free. Unique constraints are the enforcement because a check-then-act race is exactly what a determined abuser will find.

**Analytics keyed on the person.** Switching the identity to the organization would fork every existing user's history the day the migration ran.

## Backward Compatibility

- A user who never creates or joins an organization sees the product exactly as before. Their personal organization is invisible and their wallet address is unchanged.
- Every existing wallet keeps its exact on-chain address; the migration adds columns and updates rows, and the signing service needs no change.
- Existing API keys keep working, bound to their owner's personal organization. Requests with no organization header resolve deterministically.
- Payment webhooks in flight during the migration resolve through a temporary fallback to the legacy user link. Idempotency keys are unchanged, so no client retry produces a second charge.
- Existing alerts and channels keep firing under the owner's personal organization.
- Users who already used a free trial cannot claim another after the migration.
- Any cacheable organization-scoped response must vary on the organization, or a shared cache would serve one organization's data to another.

## Test Cases

- The backfill is idempotent; every user has exactly one personal organization and is its `OWNER`; the wallet id range is identical before and after the migration.
- A query with no explicit filter returns only the active organization's rows; a bulk update cannot touch rows outside it; a new organization-bearing table without scoping fails a coverage test.
- A member granted two of four projects sees exactly those two; a member with no grants sees nothing; owners and admins reach every project without a grant.
- An API key with a conflicting organization header is rejected; naming an organization the caller does not belong to returns `403`.
- An admin cannot promote to `OWNER`; the last `OWNER` cannot be removed under concurrent attempts; a removed member loses access immediately and their deployments keep running.
- An invitation cannot be accepted twice or by a race; an invitee with a differing email must confirm; an invitee without a wallet is not sent to onboarding.
- The deployment record exists before broadcast; a bypassing path files into the default project; a member cannot see, close or fund a deployment in an ungranted project.
- A top-up in a team charges the organization's card; a refund debits the organization that paid even after the buyer left.
- A second trial through a new organization is refused; two simultaneous claims cannot both succeed; the bonus is granted at most once per person and a refund does not restore it.
- The switcher is hidden with only a personal organization; a switch shows no stale data; server-rendered and client-rendered pages agree on the organization.

## Implementations

All in `akash-network/console`, merged between 2026-10-12 and 2026-10-27. Phases 0 to 1.5 and most of phase 2 shipped behind the `organizations` flag, which opened to customers on 2026-10-27.

| Area | Pull requests |
|---|---|
| Model, backfill, tenant scoping, permission engine, active organization | [#4299](https://github.com/akash-network/console/pull/4299), [#4303](https://github.com/akash-network/console/pull/4303), [#4304](https://github.com/akash-network/console/pull/4304), [#4305](https://github.com/akash-network/console/pull/4305), [#4306](https://github.com/akash-network/console/pull/4306), [#4309](https://github.com/akash-network/console/pull/4309) |
| Wallet and billing relationship moved to the organization | [#4317](https://github.com/akash-network/console/pull/4317), [#4323](https://github.com/akash-network/console/pull/4323), [#4325](https://github.com/akash-network/console/pull/4325) |
| Staff-only rollout controls and rollout alerts | [#4294](https://github.com/akash-network/console/pull/4294), [#4295](https://github.com/akash-network/console/pull/4295), [#4296](https://github.com/akash-network/console/pull/4296), [#4412](https://github.com/akash-network/console/pull/4412) |
| Create, switch, invite, accept, members and roles | [#4312](https://github.com/akash-network/console/pull/4312), [#4316](https://github.com/akash-network/console/pull/4316), [#4319](https://github.com/akash-network/console/pull/4319), [#4320](https://github.com/akash-network/console/pull/4320), [#4326](https://github.com/akash-network/console/pull/4326), [#4329](https://github.com/akash-network/console/pull/4329), [#4332](https://github.com/akash-network/console/pull/4332), [#4423](https://github.com/akash-network/console/pull/4423), [#4428](https://github.com/akash-network/console/pull/4428), [#4430](https://github.com/akash-network/console/pull/4430), [#4431](https://github.com/akash-network/console/pull/4431), [#4438](https://github.com/akash-network/console/pull/4438), [#4442](https://github.com/akash-network/console/pull/4442), [#4596](https://github.com/akash-network/console/pull/4596), [#4597](https://github.com/akash-network/console/pull/4597) |
| Projects, grants, deployments filed into projects and listed through the API | [#4311](https://github.com/akash-network/console/pull/4311), [#4318](https://github.com/akash-network/console/pull/4318), [#4321](https://github.com/akash-network/console/pull/4321), [#4322](https://github.com/akash-network/console/pull/4322), [#4334](https://github.com/akash-network/console/pull/4334), [#4335](https://github.com/akash-network/console/pull/4335), [#4337](https://github.com/akash-network/console/pull/4337), [#4401](https://github.com/akash-network/console/pull/4401), [#4406](https://github.com/akash-network/console/pull/4406), [#4433](https://github.com/akash-network/console/pull/4433), [#4434](https://github.com/akash-network/console/pull/4434), [#4525](https://github.com/akash-network/console/pull/4525), [#4532](https://github.com/akash-network/console/pull/4532), [#4612](https://github.com/akash-network/console/pull/4612) |
| Organization-scoped API keys, trial and bonus caps, team and project limits, project picker | [#4314](https://github.com/akash-network/console/pull/4314), [#4324](https://github.com/akash-network/console/pull/4324), [#4328](https://github.com/akash-network/console/pull/4328), [#4333](https://github.com/akash-network/console/pull/4333), [#4383](https://github.com/akash-network/console/pull/4383), [#4384](https://github.com/akash-network/console/pull/4384), [#4402](https://github.com/akash-network/console/pull/4402), [#4587](https://github.com/akash-network/console/pull/4587) |
| Project access to logs, provider tokens, templates and certificates | [#4340](https://github.com/akash-network/console/pull/4340), [#4399](https://github.com/akash-network/console/pull/4399), [#4400](https://github.com/akash-network/console/pull/4400), [#4404](https://github.com/akash-network/console/pull/4404), [#4417](https://github.com/akash-network/console/pull/4417), [#4467](https://github.com/akash-network/console/pull/4467) |
| Per-project spend and budgets | [#4327](https://github.com/akash-network/console/pull/4327), [#4330](https://github.com/akash-network/console/pull/4330), [#4338](https://github.com/akash-network/console/pull/4338), [#4398](https://github.com/akash-network/console/pull/4398), [#4422](https://github.com/akash-network/console/pull/4422), [#4427](https://github.com/akash-network/console/pull/4427), [#4429](https://github.com/akash-network/console/pull/4429), [#4435](https://github.com/akash-network/console/pull/4435), [#4436](https://github.com/akash-network/console/pull/4436), [#4437](https://github.com/akash-network/console/pull/4437), [#4440](https://github.com/akash-network/console/pull/4440), [#4443](https://github.com/akash-network/console/pull/4443), [#4447](https://github.com/akash-network/console/pull/4447), [#4567](https://github.com/akash-network/console/pull/4567) |
| Alert and notification channel scoping | [#4313](https://github.com/akash-network/console/pull/4313), [#4390](https://github.com/akash-network/console/pull/4390), [#4393](https://github.com/akash-network/console/pull/4393), [#4394](https://github.com/akash-network/console/pull/4394), [#4396](https://github.com/akash-network/console/pull/4396), [#4403](https://github.com/akash-network/console/pull/4403), [#4418](https://github.com/akash-network/console/pull/4418), [#4599](https://github.com/akash-network/console/pull/4599) |
| Team activity feed | [#4395](https://github.com/akash-network/console/pull/4395), [#4448](https://github.com/akash-network/console/pull/4448), [#4450](https://github.com/akash-network/console/pull/4450), [#4592](https://github.com/akash-network/console/pull/4592) |
| Team billing and payment methods | [#4376](https://github.com/akash-network/console/pull/4376), [#4377](https://github.com/akash-network/console/pull/4377), [#4424](https://github.com/akash-network/console/pull/4424), [#4426](https://github.com/akash-network/console/pull/4426), [#4432](https://github.com/akash-network/console/pull/4432), [#4449](https://github.com/akash-network/console/pull/4449), [#4451](https://github.com/akash-network/console/pull/4451), [#4572](https://github.com/akash-network/console/pull/4572), [#4584](https://github.com/akash-network/console/pull/4584), [#4585](https://github.com/akash-network/console/pull/4585), [#4609](https://github.com/akash-network/console/pull/4609) |
| Team deletion, and a member's account deletion | [#4331](https://github.com/akash-network/console/pull/4331), [#4392](https://github.com/akash-network/console/pull/4392), [#4405](https://github.com/akash-network/console/pull/4405), [#4408](https://github.com/akash-network/console/pull/4408), [#4409](https://github.com/akash-network/console/pull/4409), [#4410](https://github.com/akash-network/console/pull/4410), [#4414](https://github.com/akash-network/console/pull/4414), [#4419](https://github.com/akash-network/console/pull/4419), [#4420](https://github.com/akash-network/console/pull/4420), [#4478](https://github.com/akash-network/console/pull/4478), [#4479](https://github.com/akash-network/console/pull/4479), [#4481](https://github.com/akash-network/console/pull/4481), [#4483](https://github.com/akash-network/console/pull/4483), [#4489](https://github.com/akash-network/console/pull/4489) |
| Hidden variables sealed under a team's key ([AEP-92](../aep-92)) | [#4473](https://github.com/akash-network/console/pull/4473), [#4474](https://github.com/akash-network/console/pull/4474), [#4476](https://github.com/akash-network/console/pull/4476), [#4477](https://github.com/akash-network/console/pull/4477) |
| Cross-team access review and beta release gate | [#4389](https://github.com/akash-network/console/pull/4389), [#4397](https://github.com/akash-network/console/pull/4397), [#4407](https://github.com/akash-network/console/pull/4407), [#4415](https://github.com/akash-network/console/pull/4415), [#4416](https://github.com/akash-network/console/pull/4416), [#4466](https://github.com/akash-network/console/pull/4466), [#4469](https://github.com/akash-network/console/pull/4469) |
| API reference and launch | [#4411](https://github.com/akash-network/console/pull/4411), [#4413](https://github.com/akash-network/console/pull/4413), [#4598](https://github.com/akash-network/console/pull/4598), [#4602](https://github.com/akash-network/console/pull/4602) |

Three parts of section K did not ship and remain follow-up work:

- The tightening step. The new organization columns are still nullable, and the per-user access rules are still in place.
- Organization-prefixed routes. Links name their organization with an `?org=` parameter instead, and each browser tab sends the organization it shows on every request ([#4576](https://github.com/akash-network/console/pull/4576), [#4580](https://github.com/akash-network/console/pull/4580)).
- A full audit log. The team activity feed records team creation, invitations, joins, renames and deployment changes, but not member, access, API key or billing changes.

## Security Considerations

- **Cross-tenant leakage** is the new failure class this AEP introduces. The unconditional tenant predicate is the primary control, database constraints make a row in the wrong organization unrepresentable, and a coverage test makes a forgotten table a test failure rather than a leak.
- **Header trust.** Organization and project headers are minted by the proxy and rejected when supplied by a client, on every service, from one shared list. An API key's bound organization always wins over a header.
- **Deployment enumeration is public.** The chain publishes every deployment under the organization's address. Product copy must not imply confidentiality.
- **Spend is organization-wide.** Any member who can deploy anywhere can spend the whole balance. Owners should grant `MEMBER` with care and treat `VIEWER` as the default for people who do not deploy.
- **API keys carry full role** until per-key permissions exist; keys for automation should be created by a `MEMBER` bound to a single project.
- **Trial and bonus multiplication** is closed by unique constraints and by the per-user creation rate limit as a backstop.
- **Wallet safety.** The wallet id is the derivation index; the migration is additive only and verified against the id range.
- **Deleting an organization that still holds credit** is blocked while a balance or active leases remain, since credit is an on-chain grant only that organization's key can spend and there is no path to refund it to members.
- **Invitation links** are bearer secrets: hashed at rest, expiring, idempotent on acceptance.

## Open questions

- Rolling deploy or a brief write freeze for the tightening step.
- Who receives deployment alerts in a team. The phase 1 answer is whoever deployed.
- Trial state on organization switch: trial status is per wallet, so it flips when moving between a trialing personal organization and a paid team.
- Whether narrower API key permissions should land in phase 1.5 rather than later, given that adding them is cheap now and breaking later.

## Copyright

All content herein is licensed under [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0).
