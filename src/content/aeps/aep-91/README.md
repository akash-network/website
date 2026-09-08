---
aep: 91
title: "Console: Escrow Abstraction and Auto-Funding"
description: "Hide on-chain escrow from managed-wallet users: always-on deployment funding, optional runtime limits, threshold-based credit reload and one account-level balance view"
author: Maxime Beauchamp (@baktun14)
status: Draft
type: Standard
category: Interface
created: 2026-09-04
estimated-completion: 2026-09-30
discussions-to: https://github.com/orgs/akash-network/discussions
roadmap: major
requires: 74, 75
replaces: 33, 57
---

## Abstract

Akash Console exposes the chain's escrow model directly to people paying with a credit card: a deposit amount to pick at deployment creation, an "Add funds" button on every deployment, a per-deployment auto top-up toggle, and escrow balance and time-left figures that few users can interpret. This AEP removes all of that for managed-wallet accounts.

After this change a deployment stays funded for as long as the account has credits. The only funding choice offered at creation is an optional runtime limit. Billing shows one account balance split into Available and Escrow, with an estimate of how long it lasts. Credits are reloaded from the saved card on a fixed balance threshold, with a cap on how often the card can be charged. One account-level email warns the user before credits run out, replacing the per-deployment escrow alerts of [AEP-33](../aep-33).

The scope is the managed platform described in [AEP-84](../aep-84): `apps/api`, `apps/deploy-web` and `apps/notifications` in `akash-network/console`. There are no chain or provider changes. Console Air, the CLI and the SDKs keep the explicit deposit model.

## Motivation

The deposit model is correct for a self-custodial wallet and wrong for a prepaid credit balance. A user who bought $50 of credits does not think of themselves as running six small escrow accounts; they think they have $50 and expect their workloads to run until it is spent. Every escrow concept the UI showed on top of that mental model produced a support conversation.

It also produced real failures:

- A new deployment started with a chain-minimum deposit of 0.5 ACT and the automatic top-up ran hourly. A GPU deployment could burn through the deposit and be closed by the provider before the first scheduled top-up ever saw it.
- Automatic top-ups drew from the same on-chain deposit authorization as deployment creation. When a top-up drained the shared balance, the next create failed with `402 Insufficient balance` even though the user had just paid.
- Top-ups added a flat 48 hours of a deployment's cost on top of whatever it already held, so a deployment could hold about 72 hours of cost. For a $5/h GPU workload that locked roughly $360 in escrow and moved about $240 in a single deposit, which in turn tripped a chain of card reloads.
- Credit reload was sized from a spend prediction. Charge timing and amount shifted as deployments changed, and the settings page could only describe the outcome as "approximately $X per week".
- A deployment created through the public API or the SDK received its initial deposit and then nothing else, because the per-deployment settings record that the funding job reads was only created the first time someone opened the deployment's detail page in the web app.
- The per-deployment low-escrow alert became meaningless once deployments were kept funded; the condition it watched for was one the platform itself was supposed to prevent.

[AEP-57](../aep-57) introduced automatic escrow top-up as an opt-in setting and [AEP-74](../aep-74) added automatic credit reload from a saved card. Both left the escrow model visible. This AEP finishes the job: the mechanics stay, the user no longer has to operate them.

## Specification

### Scope

In scope:

- Deployment API: default deposits, always-on funding, runtime limits, eager per-deployment records.
- Funding jobs in `apps/api`: triggers, sizing, headroom, deduplication, observability.
- Billing API and UI: fixed-threshold credit reload, charge rate cap, decline handling, balance overview.
- Deployment creation and detail UI: removal of every escrow control.
- Notifications: account-level low-credit email, runtime-limit and provider-outage emails, reload receipts.

Out of scope:

- Chain protocol, escrow module or provider changes (see Future work).
- Self-custodial wallets, Console Air, CLI and SDK deposit flows.
- Pricing, take rates, denominations.
- Full retirement of the bot family that funds escrow from off-chain (see Future work).

### Terminology

Two mechanisms move money and must never be confused in code, copy or docs:

- **Automatic funding** moves credits the user already owns into a deployment's escrow. It never charges a card. It is always on.
- **Auto top-up of credits** (called Auto Recharge in some copy) charges the saved card to buy more credits when the balance is low. It is opt-in.

Balance words: **Available** is what can be spent on new deployments. **Escrow** is what running deployments currently hold on chain. **Total** is their sum. **Runway** is how long Total lasts at the current spend rate. User-facing copy uses "Escrow" rather than "Reserved" so that Console, the chain, the CLI and the docs describe the same thing with the same word.

### A. Deployment creation without a deposit

**A.1 Default deposit.** `POST /v1/deployments` ignores any `deposit` the caller sends and deposits `DEPLOYMENT_DEFAULT_DEPOSIT` (0.5 ACT by default, which must stay at or above the chain's `min_deposits` for `uact`). `POST /v1/deposit-deployment` is marked deprecated and logs every call so its residual use can be measured before removal. Both changes are gated on the `auto_reload_fixed_threshold` feature flag; with the flag off the endpoints behave as before.

**A.2 No deposit prompt.** The creation flow no longer asks for a deposit. In the review step, next to the price, a widget shows what confirming does to the account's money: the estimated amount that will be reserved for this deployment, the Available balance it comes out of, roughly how many hours the reserve covers, and where the auto top-up threshold sits and whether confirming will cross it (in which case the card is charged). Trial users and users without a payment method see a prompt to add credits in place of the threshold line. If Available cannot cover the reservation, the widget says so. The copy states that the reserve is held, not charged: the user pays for the time actually run and unused funds return to Available when the deployment closes. Figures read as estimates, because the eventual reservation depends on the headroom rule in B.5. A balance that fails to load hides the widget and never blocks deploying.

**A.3 Optional runtime limit.** The one funding choice at creation is an optional runtime in hours. Leaving it empty gives always-on funding with no toggle displayed. When a limit is set:

- The initial deposit uses the same sizing as automatic funding but covers the requested hours, up to a per-deposit maximum.
- For limits above the maximum, automatic funding keeps topping the deployment up until the cumulative limit is reached, then stops.
- The deployment still stops earlier if the account balance runs out.
- The deadline is anchored when the lease starts and the countdown begins. Runtime is metered rather than packed into a single string.
- The close is scheduled as a per-deployment background job that fires at the deadline, not discovered by a periodic sweep, so the deployment does not run and bill for up to 15 minutes past the limit. Extending moves the job, lifting the limit cancels it. A deployment the chain cannot close yet because its escrow has not settled is retried. A limit reached while the platform was down is honoured once it recovers. Closing is disabled per environment by default and turned on deliberately.
- An email goes out once when the limit is near, linking to where it can be extended or lifted.

From the deployment's Settings tab a runtime-limited deployment can be extended (the request carries the new absolute total so a retry cannot extend twice, bounded by a per-request increment cap) or switched to always-on funding. The switch is one way and the confirm dialog says so. Capping a deployment that is already always-on is not offered; the user closes and recreates it with a limit. The current mode and remaining runtime are visible in Settings.

### B. Always-on automatic funding

**B.1 Default on, opt-out unreachable.** Automatic funding is on for every deployment. The default lives in code and is decided at read time, not in a database default. With the flag on, an explicit `autoTopUpEnabled: false` on create or update is rejected with `400`; an omitted field falls through to enabled. Deployments that were opted out before this change were switched on once, by a one-off script run after the flag reached 100%. The script takes its live set from open chain leases rather than from the settings table's `closed` flag (see Rationale). On 2026-09-01 that affected 5 deployments across 5 paid users; closed deployments keep whatever they had.

**B.2 Eager per-deployment record.** The per-deployment settings record is created when the deployment is recorded, on both the deployment create endpoint and the generic transaction endpoint, and no longer lazily on first visit to the detail page. Existing managed deployments with no record were backfilled from the chain's open leases. An SDL too large to store is rejected before the deployment is broadcast rather than deployed unrecorded.

**B.3 Three funding triggers.**

1. **Lease start.** The deployment is funded to target the moment its first lease is created, so a fast-draining deployment cannot close before any scheduled pass reaches it. This respects the runtime limit.
2. **Credits landing.** A card purchase, an automatic reload or a manual credit immediately funds that account's draining deployments. A failed immediate funding never affects payment processing.
3. **Hourly sweep.** The scheduled pass remains the safety net. It funds deployments predicted to run out within the look-ahead window (`AUTO_TOP_UP_LOOK_AHEAD_WINDOW_IN_H`, 24 hours by default).

**B.4 Sizing to a target runway.** Every trigger sizes a deposit the same way: bring the deployment up to `AUTO_TOP_UP_TARGET_RUNWAY_IN_H` hours of its cost (48 by default), minus the runway it already holds, where the funded-until height is the later of the current height and the predicted close height. A deployment already above target receives nothing. The target must be strictly greater than the look-ahead window and the configuration schema rejects anything else: the gap between them is the floor on what a triggering deployment receives, and at target equal to window a deployment triggering exactly at the edge would be sized to zero and just re-trigger. The sweep reads one block height and threads it through discovery and sizing so an owner's amount does not depend on where they fall in a long run. The steady-state estimate shown to users is target minus window, so it never reads $0 right after a deposit.

**B.5 Balance headroom for new deployments.** Funding spends the account's deployment allowance down to a floor of `AUTO_TOP_UP_BALANCE_HEADROOM_IN_USD` (whole dollars, default 5, zero disables) so that a user with credits left can still create a deployment after a funding pass. Two properties matter:

- The floor is resolved once per pass from the starting balance. Evaluating it per deployment would let a batch chip it away until the last deployment eats it.
- When Available is at or below the floor, the floor is waived in full rather than scaled, because keeping running deployments alive outranks room for a new one.

The floor caps what a deployment receives; B.4 decides what it asks for. The two stack. The floor must not strand the tail of a balance that could still buy useful runway. All three runway and headroom settings accept finite values only: an `Infinity` headroom would be waived by the rule above and make the whole balance spendable, the opposite of what an operator intends.

**B.6 Deduplication.** A deployment is funded at most once per cooldown (60 minutes by default) through a per-deployment funding claim, so an immediate pass and the hourly sweep overlapping, two purchases arriving together, or a retried deposit cannot fund it twice. Initial funding is serialised against the sweep. Two exceptions keep the cooldown from hurting: a deployment left with less runway than the cooldown by a credit-capped deposit may be funded again as soon as credits arrive, and a deposit too small to outlast the cooldown is skipped rather than made. A deployment whose escrow account is already closed on chain is skipped terminally, and one already-closed deployment in a batch never poisons the other messages in it.

**B.7 Cost at scale.** An owner whose balance cannot fund anything is recognised once per pass rather than once per deployment. The sweep loads its wallets and owners in one query each and reads the chain tip once. The hourly pass sees brand-new deployments only after their creation funding has landed.

**B.8 Transaction reliability.** Managed transactions are signed with a 30-second validity window. No attempt is made once that window has elapsed, and the reported error names the transport failure rather than the expiry. A caller that times out while the signer is still in flight must treat the outcome as unknown, not as failed, because a deposit that lands after the caller gave up would otherwise be retried and fund the deployment twice.

**B.9 Observability.** Immediate and scheduled funding emit separate metrics with no per-run state accumulating for the life of the server. Each pass logs a summary whose counts match its metrics. Dashboards show deposit errors by type, and an alert fires when the share of scanned deployments that actually get funded stays low, distinct from the transaction-failure alert, so a pass that funds nothing is never reported as healthy. A check catches a panel or alert rule that references a metric name nothing emits. The pass reports how many deployments it scanned and how many deposits it declined for buying less runway than the cooldown.

### C. Auto top-up of credits

**C.1 Threshold mode.** When the credit balance falls below a threshold X, the default payment method is charged a fixed amount Y and credits are added. Both are user-set in billing settings, with minimums of $10 for the threshold and $25 for the amount. Spend prediction plays no part in when or how much is charged. A charge is skipped while the account has no active deployments; creating a deployment triggers an immediate check, so a low-balance user is still topped up the moment they deploy.

**C.2 Two modes, no forced migration.** Enabling auto top-up defaults to threshold mode. Accounts already on the prediction-based mode keep it untouched and can switch in either direction from billing settings. Each mode's settings UI shows its own parameters. A one-time email inviting prediction users to switch is planned.

**C.3 Charge rate cap.** Automatic card charges are limited to N per rolling hour per wallet, default 1, in both modes, operator-configurable without a code change. A charge prevented by the cap is deferred, not dropped: it completes once the window reopens if the balance is still below the threshold. Manual purchases are never capped. The settings page tells users the card is charged at most once per hour.

**C.4 Declines.** Attempts after a decline are spaced with a doubling backoff. After a small number of consecutive declines the wallet's auto top-up is paused and the user is emailed. The first decline of a run also sends an email saying the charge failed, that retries continue and how to fix the card; declines in between are silent, and a decline that pauses immediately sends only the pause email. A card reported lost, stolen or fraudulent stops being charged at once. Replacing the default payment method lifts the pause; a successful charge resets the count. While paused, the wallet does not count as opted in for funding alerts. The billing page shows when auto top-up is paused by declines.

**C.5 Receipts and consistency.** A successful automatic charge sends one confirmation with the amount and resulting balance, never duplicated across retries. Removing the default payment method disables auto top-up. Cancelling the pending reload check and scheduling the next one commit or roll back together with the settings update, so a rolled-back save cannot silently leave a wallet with no scheduled check. Top-up charges are idempotent across client retries.

### D. Account balance view

**D.1 Billing overview.** Billing shows Total split into Available and Escrow as a segmented bar, with a dashed marker at the auto top-up threshold and a legend keyed to it. A runway line reads roughly how many days the balance lasts at current usage; with auto top-up on it shows a reassurance message instead of a countdown. Copy explains that escrowed funds return to Available when a deployment closes.

**D.2 One escrow figure.** The Escrow figure nets off what providers have earned since each escrow account last settled (`funds - (latestHeight - settledAt) x pricePerBlock`), on both sides of the subtraction, so Billing, the deployment list and the deployment detail page report the same number and Available never grows because a deployment accrued charges.

**D.3 One balance everywhere.** The navigation, the home page and Billing read the same wallet balance figure and use the same labels.

**D.4 Escrow controls removed.** The deployment detail page loses "Add funds", the auto top-up toggle and the escrow balance and time-left figures. The Billing card on a redesigned detail page is hidden entirely for always-on deployments and shows only the runtime-limit controls of A.3 for limited ones. The trial countdown stays. Both the legacy and the redesigned detail layouts are gated so the redesign can roll out independently. The dead controls and their hooks were deleted once the flag reached every user.

**D.5 Trial status.** Trial accounts see their trial status and limits on the billing page.

### E. Notifications

**E.1 Credits running low.** One account-level email when the account holds less than about a week of coverage, prompting the user to add credits or turn on auto top-up. It is not sent to accounts with auto top-up active or on trial. The notified flag is a latch: a single transient reading cannot clear it, the check confirms credits read low a second time before sending, and the days-remaining figure in the email comes from the same reading. The check runs when something could change the answer (credits moved, the set of running deployments changed) and from the hourly pass, not on every transaction, and it shares one weekly-spend calculation with the figure shown in the product, including for runtime-limited deployments.

**E.2 Per-deployment escrow alerts retired.** The escrow-balance alert of AEP-33 and its configuration UI are removed. The condition it watched for is one the platform now prevents.

**E.3 Runtime limit approaching.** See A.3.

**E.4 Credit reload receipts.** Success, first decline and pause, per C.4 and C.5.

**E.5 Unreachable providers.** The provider inventory keeps retrying providers it has written off, about hourly, so recovery is noticed, and records when each ongoing outage was last checked so consumers can refuse stale data. Owners of active deployments on a provider that has been continuously unreachable for 3 days receive one notification naming the deployment and provider. After 14 continuous days the deployment is closed automatically, its remaining escrow returned to the owner, and the owner told why. Flapping over hours never triggers either. Console stops probing providers for leases that are not live and stops re-dialling a host known to be down; a dial reset caused by the provider starts the unreachable cooldown.

**E.6 Deferred.** A second warning hours before a deployment closes for lack of credits is specified but not built. The counters that would justify it (deposits declined for buying less runway than the cooldown) are in place; if the case does not show up in production the item is closed without work.

### F. Rollout

Everything user-visible flips on the existing `auto_reload_fixed_threshold` flag, evaluated per user, so the deposit removal, the escrow UI removal and the API's rejection of opt-out arrive together for any given account. Order: merge the code, roll the flag out gradually (staging, small production percentage, 100%), run the enablement script only once the flag is at 100% so nobody can watch their toggle flip and turn it straight back off, then delete the dead toggle code. Before the script runs, turning the flag off restores the old UI and API completely. The script itself is one way by design.

## Rationale

**Always-on rather than a better toggle.** The toggle was the source of "why did my deployment close" tickets, and the off state was rarely a considered choice. Bounding spend is a legitimate need, and the runtime limit meets it directly instead of asking users to reason about escrow.

**Fund to a target, not by a flat amount.** Adding 48 hours on top of up to 24 hours already held locked up to 72 hours of cost. Funding to a 48-hour target holds at most that, halves the size of a single deposit for expensive deployments, shrinks the lumps that trigger card reloads, and narrows the window in which a create can fail for lack of Available balance.

**Headroom is waived, not scaled, and resolved once.** If the balance cannot cover both a deposit and the floor, the running deployment wins: a closed workload is worse than a delayed create. Resolving the floor per deployment lets a batch of deployments each take "just under the floor" until nothing is left. $5 is ten times the default creation deposit, costs a $5/h deployment one hour of runway, and sits below the minimum reload threshold so charge cycles are unchanged.

**One flag for the whole cohort.** The "no manual money management" experience only makes sense if the deposit prompt, the escrow controls and the API guard disappear together. Reusing the flag that already gated the threshold reload avoided a second rollout vector and a state where the UI hides a control the API still honours.

**A script, not a migration, for enablement.** A data migration is re-run by every environment forever while matching nothing after the first run, and its merge would have had to wait on a feature flag. A local script, read-only unless told otherwise, gates the run rather than the merge.

**The chain, not the settings table, is the source of the live set.** The settings table's `closed` flag is not maintained: on 2026-09-01 it claimed 48,345 open deployments against roughly 391 open leases across all managed wallets. Filtering on it would have rewritten about 28,000 dead rows to change the behaviour of 6. Any operation that needs the live set intersects with open chain leases.

**Threshold over prediction, but no forced switch.** Users can reason about "when I drop below $X, charge $Y". A forced migration of existing prediction users would have been risky and would have surprised people who signed up for the behaviour they have; offering both and defaulting new enablements to threshold gets there at the users' pace.

**A hard cap on card charges.** Fixed-amount reloads combined with immediate funding can chain several identical charges within minutes for an expensive deployment. No money is lost, but each charge costs a flat processing fee, issuers apply velocity rules mid-burst, and identical charges on a statement turn into disputes. Card networks also cap reattempts of a declined payment (15 per 30 days on Visa, 35 on Mastercard) and fine excessive retries; one production wallet with a dead card accumulated about 950 declined attempts in a day before the pause rule existed. Need-sized reloads remain a possible follow-up once burst data is in hand.

**"Escrow", not "Reserved".** The project set out to remove the word from the UI. The chain, the CLI and the documentation all say escrow, and inventing a Console-only synonym made support conversations harder. The decision was reversed before release.

**Event-driven funding over a faster cron.** A shorter sweep interval would still leave a window and would multiply chain reads for everyone. Funding at lease start and when credits land removes the two windows that actually closed deployments, and the hourly sweep stays as the backstop.

## Future work: chain-enforced escrow refill

Every mechanism in section B compensates off-chain for a chain that wants prepaid, per-deployment escrow while users think in terms of one balance. The hourly sweep, the lease-start and credits-landed triggers, the claims and cooldowns, and the deadline-aware retries each remove an instance of the same race class rather than the class itself, and self-custodial users get none of them.

[AEP-75](../aep-75) already shipped multi-depositor escrow, `MsgAccountDeposit` with `sources: [balance, grant]`, and deposit authorizations with spend limits that the escrow keeper can consume without a `MsgExec`; its spec names automated replenishment as a use case. Settlement is lazy and runs inside deposit, withdraw and close transactions, so the missing piece is a trigger inside settlement's shortfall branch that draws from a designated funding source under an on-chain allowance with caps and rate limits, with pause-instead-of-close as the fallback when the funder is dry. That design was written up in August 2026 and parked pending core-team appetite. If it proceeds it belongs in a Core AEP; this AEP's Console-side mechanics would then shrink to allowance management.

## Backward Compatibility

- With `auto_reload_fixed_threshold` off, every endpoint and screen behaves as before this AEP.
- `POST /v1/deployments` still accepts `deposit` but ignores it. `POST /v1/deposit-deployment` is deprecated and logs its use; removal follows the normal deprecation notice.
- With the flag on, `autoTopUpEnabled: false` is rejected with `400`. Clients that never sent the field see no change. The field is dropped from the request schemas in a later release.
- Open deployments that were opted out were switched on once by the enablement script. Closed deployments were left as they were.
- Accounts on prediction-based auto top-up keep it. Only new enablements default to threshold mode.
- The environment variable `AUTO_TOP_UP_AMOUNT_IN_H` (flat add) is replaced by `AUTO_TOP_UP_TARGET_RUNWAY_IN_H` (target). Operators who had lowered the former to 24 during the interim should restore 48 under the new semantics.
- Console Air, the CLI and the SDKs are unaffected. The chain still requires a deposit; this AEP only changes who picks it.

## Test Cases

- Funding sizing: a deployment above target receives nothing; one holding 12 hours receives target minus 12 hours; an overdue deployment receives a full target; target equal to window is rejected by the configuration schema.
- Headroom: a batch of deployments against one balance leaves exactly the floor; a balance at or below the floor is spent in full; `Infinity` is rejected.
- Deduplication: an immediate pass and the hourly sweep selecting the same deployment produce one deposit; a credit-capped deployment with less runway than the cooldown is funded again after credits land; a closed-on-chain deployment in a batch does not fail the batch.
- Creation: the API ignores a caller-supplied `deposit` and uses the default; an explicit opt-out is rejected with the flag on and accepted with it off; the settings record exists before the create transaction is broadcast, on both the deployment and transaction endpoints.
- Runtime limit: the close job fires at the anchored deadline; extending moves it; lifting cancels it; an unsettled escrow is retried; the initial deposit never exceeds the per-deposit maximum.
- Credit reload: a card is charged at most once per hour in either mode; a capped reload completes when the window reopens if still below threshold; N consecutive declines pause the wallet and send exactly two emails; a lost or stolen code pauses on the first decline; replacing the card resumes.
- Notifications: exactly one low-credit email per low period despite transient coverage readings; no email for accounts with auto top-up on or on trial; one dark-provider notification per continuous outage; no close before 14 continuous days.
- UI: review-step widget matches Billing's labels and hides on a failed balance load; Billing, list and detail show the same escrow figure for a deployment with unsettled blocks.
- End to end (Playwright): create a deployment without a deposit prompt, watch it get funded at lease start, close it and see the escrow return to Available.

## Implementations

All in `akash-network/console`, merged between 2026-07-20 and 2026-09-04 unless noted.

| Area | Pull requests |
|---|---|
| Lease-start and credits-landed funding | [#3527](https://github.com/akash-network/console/pull/3527), [#3552](https://github.com/akash-network/console/pull/3552), [#3590](https://github.com/akash-network/console/pull/3590), [#3607](https://github.com/akash-network/console/pull/3607), [#3611](https://github.com/akash-network/console/pull/3611), [#3724](https://github.com/akash-network/console/pull/3724) |
| Sizing, headroom, cooldown | [#3562](https://github.com/akash-network/console/pull/3562) (interim 24h flat add), [#3620](https://github.com/akash-network/console/pull/3620), [#3623](https://github.com/akash-network/console/pull/3623), [#3682](https://github.com/akash-network/console/pull/3682), [#3703](https://github.com/akash-network/console/pull/3703) |
| Default deposit, always-on, eager records | [#3597](https://github.com/akash-network/console/pull/3597), [#3636](https://github.com/akash-network/console/pull/3636), [#3655](https://github.com/akash-network/console/pull/3655), [#3685](https://github.com/akash-network/console/pull/3685), [#3686](https://github.com/akash-network/console/pull/3686), [#3733](https://github.com/akash-network/console/pull/3733), [#3783](https://github.com/akash-network/console/pull/3783); enablement script run 2026-09-01 (the migration in [#3654](https://github.com/akash-network/console/pull/3654) was closed in its favour) |
| Runtime limits | [#3630](https://github.com/akash-network/console/pull/3630), [#3631](https://github.com/akash-network/console/pull/3631), [#3652](https://github.com/akash-network/console/pull/3652), [#3698](https://github.com/akash-network/console/pull/3698), [#3726](https://github.com/akash-network/console/pull/3726), [#3737](https://github.com/akash-network/console/pull/3737), [#3740](https://github.com/akash-network/console/pull/3740) |
| Threshold reload, modes, rate cap, declines | [#3533](https://github.com/akash-network/console/pull/3533), [#3535](https://github.com/akash-network/console/pull/3535), [#3575](https://github.com/akash-network/console/pull/3575), [#3576](https://github.com/akash-network/console/pull/3576), [#3577](https://github.com/akash-network/console/pull/3577), [#3619](https://github.com/akash-network/console/pull/3619), [#3622](https://github.com/akash-network/console/pull/3622), [#3658](https://github.com/akash-network/console/pull/3658), [#3660](https://github.com/akash-network/console/pull/3660), [#3666](https://github.com/akash-network/console/pull/3666), [#3678](https://github.com/akash-network/console/pull/3678), [#3756](https://github.com/akash-network/console/pull/3756), [#3760](https://github.com/akash-network/console/pull/3760), [#3761](https://github.com/akash-network/console/pull/3761), [#3769](https://github.com/akash-network/console/pull/3769) |
| Balance view and escrow UI removal | [#3583](https://github.com/akash-network/console/pull/3583), [#3610](https://github.com/akash-network/console/pull/3610), [#3650](https://github.com/akash-network/console/pull/3650), [#3651](https://github.com/akash-network/console/pull/3651), [#3736](https://github.com/akash-network/console/pull/3736), [#3741](https://github.com/akash-network/console/pull/3741), [#3745](https://github.com/akash-network/console/pull/3745), [#3751](https://github.com/akash-network/console/pull/3751) |
| Low-credit email and retired alerts | [#3633](https://github.com/akash-network/console/pull/3633), [#3634](https://github.com/akash-network/console/pull/3634), [#3683](https://github.com/akash-network/console/pull/3683), [#3728](https://github.com/akash-network/console/pull/3728), [#3739](https://github.com/akash-network/console/pull/3739) |
| Unreachable providers | [#3647](https://github.com/akash-network/console/pull/3647), [#3648](https://github.com/akash-network/console/pull/3648), [#3649](https://github.com/akash-network/console/pull/3649), [#3695](https://github.com/akash-network/console/pull/3695), [#3696](https://github.com/akash-network/console/pull/3696), [#3697](https://github.com/akash-network/console/pull/3697), [#3699](https://github.com/akash-network/console/pull/3699), [#3731](https://github.com/akash-network/console/pull/3731), [#3743](https://github.com/akash-network/console/pull/3743), [#3786](https://github.com/akash-network/console/pull/3786) |
| Observability and sweep cost | [#3546](https://github.com/akash-network/console/pull/3546), [#3711](https://github.com/akash-network/console/pull/3711), [#3714](https://github.com/akash-network/console/pull/3714), [#3720](https://github.com/akash-network/console/pull/3720), [#3721](https://github.com/akash-network/console/pull/3721), [#3732](https://github.com/akash-network/console/pull/3732), [#3734](https://github.com/akash-network/console/pull/3734), [#3738](https://github.com/akash-network/console/pull/3738), [#3746](https://github.com/akash-network/console/pull/3746), [#3747](https://github.com/akash-network/console/pull/3747) |

Still open at the time of writing: deadline-aware retries and the unknown-outcome case in B.8, the settings-table drift behind the Rationale's live-set rule, the promotional email in C.2, burst measurement for need-sized reloads, and bounding the refusal loop described under Security Considerations. The AEP moves to Last Call once B.8 has merged.

## Security Considerations

- **Automatic funding moves only the user's own credits.** Each deposit is a `MsgAccountDeposit` signed by the user's derived wallet with the master wallet as grant source, bounded by that user's deposit authorization, which is sized from their credit balance. Nothing in this AEP lets funding exceed what the user has paid for.
- **Duplicate funding is self-correcting but not free.** Over-funding a deployment from the user's own allowance returns to the user when the deployment closes, so it is a credit-burn problem rather than a solvency one. The claims and cooldown in B.6 and the unknown-outcome rule in B.8 exist to keep it from happening.
- **Card charges are bounded.** The rate cap, the decline pause and idempotent top-up charges together bound how many times a card can be charged automatically, which protects users from statement shock and the platform from issuer penalties.
- **Headroom configuration.** An unbounded headroom value would be waived by the scarcity rule and make the whole balance spendable. The schema rejects non-finite values; operators should treat the same edge as open for the default deposit setting.
- **Refusal loops.** A zero-balance client retrying creates in a tight loop is refused pre-flight on every attempt and schedules a reload check each time. No charge is attempted and nothing reaches the chain, but two such clients produced about 12,000 warnings and as many wasted checks per day in early September 2026. Bounding that (a short per-wallet refusal cache, skipping redundant reload checks, retry guidance in the `402`) is open work.
- **Provider outages.** Auto-closing a deployment after 14 days on a dark provider acts on the outage record, so that record carries a last-checked timestamp and dead providers keep being retried; acting on a stale record would close healthy deployments.
- **Enablement script.** It changed no money, only whether existing credits could flow into the user's own deployments, and closed deployments were left untouched. It is one way by design and was gated on the flag being at 100%.

## Copyright

All content herein is licensed under [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0).
