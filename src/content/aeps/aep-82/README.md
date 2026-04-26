---
aep: 82
title: "Console Split: Managed Platform and Self-Custodial Air"
description: "Split Akash Console into a fully-managed platform (console.akash.network) and a dedicated self-custodial app (Console Air)"
author: Maxime Beauchamp (@baktun14) Greg Osuri (@gosuri)
status: Draft
type: Standard
category: Interface
created: 2026-04-24
estimated-completion: 2026-05-31
roadmap: major
---

## Motivation

Akash Console today tries to serve two fundamentally different users through a single application:

1. **Self-custodial users** who connect a Keplr wallet, sign their own transactions, and own their on-chain identity.
2. **Fully managed users** who pay with a credit card and never need to create or manage a crypto wallet.

Console started as a wallet-only product. Credit card support was added because requiring a wallet created an enormous amount of friction for mainstream developers, and offering both paths has genuinely helped users who spread workloads across multiple platforms.

However, blending both experiences in a single application has become a liability:

- **User confusion.** The two paths imply different identities, different recovery models, different billing surfaces, and different trust assumptions. New users routinely struggle to understand which path applies to them, and existing users are forced to reason about concepts (wallets, credits, escrow, credit cards) that are only relevant to half of the audience.
- **Product complexity.** Almost every new feature has to be designed, implemented, tested, and documented twice — once for the wallet identity model and once for the managed identity model. This has significantly slowed feature velocity and widened the surface area for bugs.
- **Misaligned usage.** Over 85% of spend on Console today comes from credit card users. Keeping the wallet option inside the managed experience optimizes the product for a small fraction of actual spend while burdening the majority.

At the same time, the self-custodial, permissionless nature of Akash is a core property of the network that must be preserved. The answer is not to remove the wallet path — it is to give it a home where it can be treated as a first-class experience rather than an alternate mode inside a managed product.

## Summary

We propose splitting Akash Console into two dedicated applications, each optimized for a single identity model:

1. **console.akash.network** — the fully managed platform. No wallet. Credit card billing. Optimized for the lowest possible friction and the broadest possible developer audience.
2. **Console Air** — the fully self-custodial application. Wallet-only (Keplr and compatible wallets). No managed billing. Optimized for users who want to own their keys, sign their own transactions, and interact with Akash permissionlessly.

Each application has a single identity model, a single billing model, and a single mental model for the user. Features are designed once, for the audience that actually uses them.

## Proposed Solution

### console.akash.network (Managed Platform)

- **Identity:** email + password (and/or SSO), backed by the existing managed-wallet infrastructure established in [AEP-63](../aep-63).
- **Payments:** credit card only, including the credit and auto-reload features from [AEP-31](../aep-31), [AEP-72](../aep-72), and [AEP-74](../aep-74).
- **Scope removed:** Keplr connect, manual AKT balance, wallet-signed transactions, wallet-based deployment history.
- **Scope preserved and expanded:** trial credits, auto credit reload, billing & usage, alerts, custom domains, and all other managed features currently on Console's roadmap.
- **Evolution:** continues to evolve as a fully managed, opinionated platform — the front door for developers who want Akash's price/performance without Akash's crypto surface area.

### Console Air (Self-Custodial)

- **Identity:** Keplr (and compatible Cosmos wallets) only. Users sign every transaction.
- **Payments:** AKT (and any future on-chain denominations) paid directly from the user's wallet to on-chain escrow. No credit card, no managed balance, no off-chain billing.
- **Scope removed:** email sign-up, credit card payments, managed trial credits, server-side account state that isn't derivable from on-chain data.
- **Scope preserved:** full deployment lifecycle (SDL, bid, lease, manifest, logs, shell, updates, close), provider selection, certificates, multi-depositor escrow ([AEP-75](../aep-75)), and any future on-chain features that require direct wallet signing.
- **Positioning:** the canonical reference client for permissionless Akash usage. Open to any wallet and any provider, with no gatekeeping layer between the user and the chain.

### Migration

- Existing managed (credit card) users continue on console.akash.network with no action required. The domain and account system stay the same.
- Existing self-custodial users on console.akash.network are guided to Console Air. For a transition period, console.akash.network will display a clear banner for any user arriving with a connected Keplr wallet, directing them to Console Air with a one-click handoff that preserves the connected address.
- The wallet-connect code path in console.akash.network is removed after the transition period ends.
- Documentation, tutorials, and all external links are updated to point to the appropriate application based on audience.

### Shared Infrastructure

Both applications continue to be built in the same [akash-network/console](https://github.com/akash-network/console) monorepo and share:

- The underlying SDL editor, deployment lifecycle UI components, and provider selection logic.
- Common design system and component library.
- The Console API layer ([AEP-63](../aep-63), [AEP-69](../aep-69), [AEP-70](../aep-70)) for features that apply to both audiences (e.g., provider data, pricing).

What is *not* shared is the identity, billing, and account management surface. Those diverge cleanly between the two apps and are no longer forced into a single abstraction.

## Rationale

### Why split rather than hide

We considered keeping a single application and hiding the wallet path behind a feature flag or a hidden route. This fails the core goal: a single app still forces every feature designer, PM, and engineer to reason about both identity models when making changes, even if one is rarely surfaced in the UI. A clean split aligns the codebase, the surface area, and the team with the audience.

### Why keep Console Air rather than deprecate it

The self-custodial path is a defining property of Akash. Removing it from Console entirely — without an obvious replacement — would signal that Akash is retreating from its permissionless roots. Console Air preserves and in fact strengthens that path by giving it a dedicated, uncompromised home.

### Why not a third-party wallet-only client

A first-party, open-source self-custodial client ensures that self-custodial usage of Akash remains practical and well-supported regardless of third-party interest. Existing wallet users on Console already depend on us for this experience; they deserve a smooth transition rather than a hand-off to an unmaintained alternative.

### Naming

"Console Air" signals a lightweight, no-overhead, pure self-custodial experience, in contrast to the full managed platform at console.akash.network.

## Backward Compatibility

- Credit card / managed users: no change. Same URL, same accounts, same billing.
- Wallet users on console.akash.network: temporarily supported with a redirect/handoff flow to Console Air, then removed after the transition period. No on-chain state is affected; users retain full access to their deployments via their wallet in Console Air, the Akash CLI, or any other self-custodial client.
- API consumers: unchanged. The Console API ([AEP-69](../aep-69), [AEP-70](../aep-70)) continues to serve both applications.

## Security Considerations

- **Reduced attack surface on the managed side.** Removing wallet-signing code paths from console.akash.network eliminates an entire class of phishing and transaction-injection risks for the managed audience, which today has no reason to sign on-chain transactions.
- **Reduced attack surface on the self-custodial side.** Removing managed-billing code paths from Console Air removes server-side account, session, and payment logic from the self-custodial audience, shrinking the trust surface of the application they rely on for signing.
- **Clear trust model per app.** Each application has a single, documented trust model, which makes security review and user education substantially simpler.
- **Transition redirect.** The handoff from console.akash.network to Console Air for wallet users must only redirect to a verified, first-party domain to avoid being used as a phishing vector.

## Implementations

- Akash Console: [github.com/akash-network/console](https://github.com/akash-network/console)

## References

- [AEP-31: Credit Card Payments In Console](../aep-31)
- [AEP-63: Console API for Managed Wallet Users](../aep-63)
- [AEP-72: Console - Improved User Onboarding](../aep-72)
- [AEP-74: Console - Auto Credit Reload](../aep-74)

## Copyright

Copyright and related rights waived via [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).
