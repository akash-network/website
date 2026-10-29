---
title: "Why We Selected Solana for Akash"
description: "The Akash core team has selected Solana as the next home for Akash Network. Here is why, how the options compared, and what changes for AKT holders, providers and tenants."
pubDate: "2026-10-26"

categories:
  - Updates
tags:
  - Solana
  - AKT
  - Governance
  - Decentralized Cloud
contributors:
  - Greg Osuri

bannerImage: ./banner.png
---

## Summary

The Akash core team has selected Solana as the next home for Akash Network. We propose to leave Akash's sovereign Cosmos chain, `akashnet-2`, and rebuild the marketplace as native programs on Solana mainnet. AKT becomes a native Solana token, and nothing changes for live workloads until cutover. Cutover has no date yet: a separate governance vote sets it only after audits and migration rehearsals pass. Workloads then keep running for 90 days after cutover while tenants redeploy.

We selected Solana for four reasons:

1. **Akash stops paying for a chain it does not use.** About 100 validators bond AKT only to secure consensus, and the core team maintains its own forks of cosmos-sdk, CometBFT and gogoproto. On Solana, security is inherited by every program, with no bonding, slot auction or SOL stake. Network fees for the whole marketplace come to about 0.075 SOL a day, a few dollars.
2. **Headroom at near-zero cost.** A median Solana transaction costs about \$0.001. Akash's roughly 15,000 marketplace transactions a day are a rounding error next to Solana's 112M daily user transactions, even at 100 times today's load.
3. **DePIN already lives there.** Helium, Render, io.net, Hivemapper and Nosana settle on Solana. Helium's 2023 move off its own chain and Render's token move give Akash a proven migration playbook.
4. **Liquidity and users.** Solana ranks first in weekly DEX volume, carries \$15B in stablecoins and sees about 2.2M daily fee payers. Meanwhile the Cosmos ecosystem is consolidating, and Noble, its stablecoin chain, left in March 2026.

AKT moves first. Two weeks after the migration proposal passes, and only once two independent audits have passed, the core team launches AKT as an SPL token on Solana and a one-way migration portal opens for 2 years. The marketplace follows later, once audits and rehearsals pass. Tenants keep their SDL files and live leases, and providers upgrade one daemon and re-register.

Akash also gives something up: sovereign consensus, validator income, native IBC and the "own chain" story. This report sets out those costs plainly next to the gains.

Nothing moves yet. After publishing this report, we will submit a migration proposal on `akashnet-2`. The marketplace cutover then needs at least two more votes: a cutover proposal and a sunset upgrade.

## Why leave Akash's own chain

Akash pays the full cost of a sovereign chain without using any of its powers. A survey of the codebase found nothing in the marketplace that needs its own consensus: no custom transaction handling, no vote extensions and no per-block sweeps, since escrow settles lazily.

That cost shows up in five places:

- **Locked capital.** A large share of AKT is bonded to validators only to secure consensus. That capital does nothing for tenants or providers. On a shared chain it can fund provider incentives, liquidity and growth.
- **Engineering drag.** The core team maintains forks of cosmos-sdk, CometBFT and gogoproto, a custom upgrade system with 16 upgrades behind it, and validator coordination for every release. It also runs a whole CosmWasm subsystem whose only production job is importing Pyth prices.
- **Scale.** Orders, bids, lease settlements and token swaps are chatty. The chain must absorb 10 to 100 times today's activity at fees that round to zero against lease value.
- **Distribution.** Wallets, stablecoins, DeFi and retail attention are elsewhere. In 2025 and 2026 Kujira, Comdex, Picasso, Quasar and Evmos wound down, Neutron left Interchain Security, and Noble left for its own EVM chain on 2026-03-18.
- **Talent.** The pools of Rust and Solidity developers dwarf the Cosmos SDK pool, so contributing to Akash gets easier on either target.

dYdX runs well as a Cosmos appchain because its order book needs custom block processing. Akash's marketplace does not, and that asymmetry is the case for leaving.

## How we decided

We ran an open request for proposals. When the evidence showed that shared security alone would not fix the problem, we widened it.

1. **Dec 15, 2025:** [**AEP-79**](https://github.com/akash-network/AEP/tree/main/spec/aep-79) **opens.** Akash asked established L1s to become its shared-security provider. Proposals were judged on five goals: lower the AKT staking burden, cut operational overhead, preserve decentralization, scale at predictable cost, and keep interoperability.
2. **Mid-2026: the Solana Foundation responds.** Its plan redeploys the marketplace as native Solana programs.
3. **Aug 10, 2026: the Chain Migration Program.** Overclock Labs published a 15-document plan that specifies both a Solana path and an EVM L2 path to execution depth. It weighed seven options against 15 hard requirements.
4. **Selection: Solana.** The core team has selected Solana. After publishing this report, we will submit a migration proposal on akashnet-2. Gate 0, the plan's first go/no-go checkpoint, closes if it passes with 33.4% quorum and a majority voting yes, and the core team records the choice. A failed proposal sends the program back to option analysis.

The requirements were concrete, not a matter of taste. Every candidate had to show at least 50 marketplace transactions a second sustained and 500 in bursts. It also needed a median cost of \$0.01 or less, production Pyth price feeds and a deep native stablecoin. Other bars included support from the top 10 AKT trading venues, 99.5% liveness over 24 months, confirmation within 5 seconds, gasless onboarding, and a comparable protocol that had already migrated there at scale.

The choice was also built to be falsifiable. Six evidence items could have flipped the choice. Four of them would have moved it to the EVM path:

- Exchanges covering 80% of AKT volume rejecting Solana's Token-2022 standard, with no good fallback.
- Solana's Alpenglow consensus upgrade turning visibly unstable.
- Two or more top-5 AKT venues supporting an EVM swap but not a Solana one.
- Provider software taking over 50% more effort to integrate on Solana than on EVM.

## How the options compared

Seven options were on the table, and two cleared every hard requirement: Solana mainnet and an existing EVM L2.

| Option                              | Outcome          | Deciding factor                                                                                     |
| ----------------------------------- | ---------------- | --------------------------------------------------------------------------------------------------- |
| Solana mainnet                      | **Selected**     | Home of DePIN, runtime fits the marketplace, most fee headroom                                      |
| Existing EVM L2                     | Finalist         | Deepest EVM talent and tooling, but single commercial sequencers, policy churn and no DePIN cluster |
| Dedicated Arbitrum Orbit rollup     | Held as fallback | Brings back the chain-running burden Akash is leaving                                               |
| Ethereum L1                         | Rejected         | Gas still spikes to 5 to 40 gwei under load; a live marketplace cannot price off calm days          |
| SVM L2 (Eclipse, Termina class)     | Future option    | Young, brings back operations work, lacks mainnet's distribution                                    |
| Stay on Cosmos with shared security | Superseded       | Eases staking cost, barely touches overhead, does nothing for distribution                          |
| Status quo                          | Baseline only    | All four problems stay and compound                                                                 |

Our public plan specifies both finalists to the same depth, and the head-to-head below draws on it.

|                                           | Solana mainnet                                                                         | Existing EVM L2                                                                            |
| ----------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Security comes from                       | Solana's validators, about 770 to 800 block producers                                  | Ethereum's validator set, through a Stage 1 rollup                                         |
| Slashing                                  | Not live yet; SIMD-0212 is in governance                                               | Live on Ethereum                                                                           |
| Who orders transactions                   | The validator set, on two production clients                                           | A single sequencer run by a commercial operator, with forced inclusion as the escape hatch |
| Cost to place a bid, calm                 | About \$0.0008                                                                         | About \$0.007                                                                              |
| Cost to close a deployment, elevated load | About \$0.0014                                                                         | About \$0.43                                                                               |
| Blocks and confirmation                   | About 400 ms blocks, sub-second optimistic confirmation, about 12.8 s to full finality | About 200 ms preconfirmations on some L2s, about 13 min to Ethereum finality               |
| Oracle and token rules                    | Pyth native; ACT non-transferable through Token-2022                                   | Pyth pull contracts; ACT restricted by contract                                            |
| Gasless use                               | Fee-payer relayers                                                                     | ERC-4337 paymasters                                                                        |
| Cosmos links                              | None native; Cosmos routes are thinning                                                | IBC Eureka to Ethereum, live since April 2025                                              |
| DePIN peers and precedent                 | Helium, Render, io.net, Hivemapper; Helium's 2023 chain sunset                         | No DePIN cluster                                                                           |
| Talent and tooling                        | Rust and Anchor                                                                        | The deepest engineering, audit and tooling market                                          |
| Execution novelty                         | Higher: cranks, rent and account limits                                                | Lowest: claims, vesting and governance tooling are commodity                               |
| Distribution                              | 2.2M daily fee payers, \$15B in stablecoins                                            | Exchange-affiliated funnels and native stablecoins                                         |

Costs come from our own designs, assuming SOL at \$150 and ETH at \$1,917.

The EVM path wins on Ethereum's security budget, live slashing, Cosmos links, talent and the lowest execution novelty. Solana wins on fit: cost under load, no single operator, a runtime that matches the marketplace, where Akash's peers are, and how concrete the offer is. The next section explains why fit decided it.

## Why we selected Solana

Fit decided it. Solana's runtime fits our design, it is the cheapest home for a busy marketplace, no single company runs it, and Akash's peers and buyers are already there.

### The runtime fits our design

- **Native Pyth prices.** The CosmWasm subsystem Akash runs only to import Pyth prices goes away.
- **Token-2022.** ACT stays a non-transferable compute credit, enforced by the token standard itself.
- **Fee-payer relayers.** Users can act without first buying SOL.
- **No chain to run.** The design rule is "Solana mainnet only: no appchain, no sequencer, no bespoke oracle network." We still run lightweight cranks and a fee relayer.

An EVM L2 can do most of this too, through Pyth contracts, restricted tokens and paymasters. On Solana it comes with the runtime.

### It is the cheapest home for a busy marketplace

By our own designs, a marketplace operation costs about 9 times less on Solana on a calm day and about 300 times less under load, as the table above shows.

Capacity is not a concern either. Solana blocks now hold 100M compute units, and because each lease has its own account, Akash's throughput scales with the whole block. Solana puts Akash's network fees at about 0.075 SOL a day at today's volume.

### DePIN lives there, and so does the playbook

More than 50 DePIN projects, worth about \$3.5B combined, settle on Solana: Helium, Render, io.net, Nosana and Hivemapper among them. Helium is the only network to retire its own L1 into another L1 at scale, in 2023, and it is healthy three years on. Render moved its token too.

Their playbooks are the ones our plan uses. Render moved its token to Solana through an upgrade portal, the closest model for ours, and Helium's migration tooling is open for reuse. Akash follows a proven path into its own buyers' and sellers' ecosystem instead of pioneering into an empty one.

### Liquidity, users and institutional capital

As a native Solana token, AKT plugs straight into lending markets, liquid staking, collateral and aggregator routing through Jupiter, Orca and Raydium.

- **DEX volume:** about \$11.5B a week, first worldwide (May 2026).
- **Stablecoins:** \$15B in circulation, USDC about 56%. These are direct rails for paying for GPUs.
- **Users:** about 2.2M daily fee payers and 167M monthly token-holding addresses.
- **Institutions:** BlackRock's BUIDL, Apollo's ACRED and spot Solana ETFs are live. That institutional capital matters for financing GPU capacity on Akash.

### No single operator

Solana has no sequencer. Two independent validator clients, Agave and Firedancer, run in production, and two more are in development. Every EVM L2 we considered runs a single sequencer operated by one company, whose commercial policies can change under Akash. For a protocol whose promise is decentralized cloud, both the dependency and how it looks matter.

Solana's governance also shows real checks. In March 2025, SIMD-228 drew 74% of stake, by Solana's count the largest turnout of any blockchain vote, and still failed at 61.4% against a 66.7% threshold. Economic changes there need broad consensus.

### A concrete offer

The Solana Foundation answered with funding and audit support, a gas subsidy design and a phased plan.

## What changes for you

If the proposals pass, the move happens in two steps. **Token launch** comes two weeks after the migration proposal passes, and only once two independent audits have passed: the core team launches AKT as an SPL token on Solana and a one-way migration portal opens for 2 years. **Cutover** comes later, once audits and rehearsals pass, when new deployments move to Solana. **Halt** follows 90 days after cutover, when the old chain stops.

Every migration is one-way. AKT moved to Solana cannot move back to Cosmos. For the marketplace, cutover is the point of no return.

### AKT holders

- **In self-custody:** use the migration portal. Connect your Cosmos wallet, choose your Solana address, and your AKT arrives 1:1 as SPL AKT.
- **On an exchange:** exchanges move customer balances through the portal on their own schedule. Watch for your exchange's notice.
- **In a Console-managed wallet:** nothing to do. Your balance migrates automatically.
- **You have 2 years from launch.** AKT keeps its ticker and its 6 decimals. AKT sent to the portal leaves circulation on Cosmos, so total supply does not change.
- **On Osmosis or another IBC chain:** bring it back to akashnet-2 first, then use the portal.
- **No rush before cutover.** Until then, AKT on Cosmos still pays for gas, staking and governance on the old chain.
- **Phishing is the top threat.** There will be one official portal domain. Check the Solana address before you confirm.

Still being settled: how unvested AKT migrates, how AKT still on Cosmos at halt reaches the portal, and what happens to AKT not migrated within 2 years.

### Stakers and delegators

To migrate staked AKT, unbond it first, which takes 21 days, then use the portal. Until cutover, staked AKT still secures the old chain, earns rewards and votes on the remaining proposals. Old-chain inflation, and with it staking rewards, ends at cutover. New mechanisms for staking will be announced prior to cutover.

### Validators

The validator role, and its income, end at halt. Between cutover and halt the old chain still needs you.

After halt there is room for you as a provider, RPC operator, or crank runner on the new network. There are new income streams that are uniquely suited for validators will be announced prior to cutover.

### Providers

- **Before cutover:** run one daemon upgrade, re-register on Solana with collateral, and get re-audited. You can sign a link from your old address to keep your reputation.
- **Cutover to halt:** run a daemon on each chain. Old-chain earnings are paid weekly in new AKT, on average about 7 days later and at most 11.
- **Close unfunded leases.** Leases funded by top-ups made after cutover earn nothing on Solana.
- **Keep 100% of lease payments.** There is no protocol take at launch.

### Tenants

- **Your SDL files do not change.** Live leases keep running until you close them or the old chain halts.
- **New deployments go to Solana.** Console makes that the default before cutover. You can still top up, close and withdraw on the old chain.
- **Refunds** of deposits made before cutover arrive as weekly payouts in new AKT. Top-ups made after cutover are not credited on Solana.
- **Notices** come 30, 60 and 75 days after cutover, with a final warning at least 7 days before halt.

### Builders and integrators

- **SDKs:** `@akashnetwork/chain-sdk` v2 is a breaking release on `@solana/kit` that keeps the high-level API. A new Go module replaces the current one.
- **CLI v3:** same command names without the `tx` and `query` prefixes, plus `akash provider migrate` and `akash events tail`.
- **APIs:** the Console API `/v2` uses Solana addresses; `/v1` is frozen with old-chain data. Lists and history come from the indexer.
- **Wallets and explorers:** Phantom, Solflare and Ledger are fully supported; Keplr and Leap remain only for migration and wind-down. Solscan and SolanaFM replace Mintscan, which ends at halt.
- **Integrations that hold AKT:** SPL AKT exists from token launch, so wallets, DEXs and custodians can add it before the marketplace moves.

## Risks and trade-offs

We believe the move is a trade up, but it is not free. The largest risks sit in the migration itself, not in Solana, and each has a named mitigation and a gate it must clear.

### What Akash gives up

- **Control of consensus.** Akash cannot change Solana's block times or fee markets. Akash keeps control of its programs, upgrades, governance and fee policy.
- **Slashing and validator count.** Economic slashing is not live on Solana yet; SIMD-0212 is still in governance. Validator count has fallen to about 770 to 800, a fair criticism. Client diversity, with Firedancer in production beside Agave, is the counterpoint.
- **Native IBC.** Solana has no IBC, and Cosmos routes to Solana are thinning. Cosmos links after halt go through third-party bridges.
- **Some atomic steps.** Closing a deployment and refunding losing bids now take follow-up transactions run by automated cranks, with closes targeted within 60 seconds. Funds stay safe in between. Very large multi-group SDLs may need more than one transaction.
- **Rent deposits.** Each lease locks a refundable deposit of about 0.024 SOL, roughly \$3.60 at \$150 per SOL. A 10,000-lease marketplace holds about 450 SOL, and its dollar value moves with SOL's price.
- **Gas fees in SOL.** All leases will continue to be paid in ACT whereas Gas Fees will be in SOL. Paying gas fees in AKT needs a sponsorship relayer instead of working natively.
- **Akash validators' role.** About 100 operators lose a role and an income stream. We owe them a respectful wind-down.

### What could go wrong

| Risk                              | Why it matters                                                                                        | Mitigation                                                                                                                                                 |
| --------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Migration portal exploit          | For 2 years it controls minting of SPL AKT                                                            | Two independent audits before launch, formal checks of the mint logic, per-epoch mint caps, an automatic pause on any supply mismatch, top bug-bounty tier |
| Supply mismatch between chains    | SPL AKT minted must always equal AKT taken out on Cosmos                                              | Independent reconciliation of both chains; automatic pause on any mismatch                                                                                 |
| Old chain thins as holders leave  | Unbonding to migrate lowers the stake that secures the old chain and votes on the remaining proposals | Staking keeps earning rewards until cutover, and a validator continuity payout covers the wind-down. Further measures are still open.                      |
| Escrow behaves differently        | Tenants or providers could lose funds                                                                 | Recorded akashnet-2 escrow history replayed against the new programs; 500+ test vectors; invariant fuzzing                                                 |
| ACT price manipulation            | Thin AKT markets and a single Pyth feed                                                               | Keep the collateral circuit breaker (warn at 95%, halt at 90%), spread and batching; add volume caps and staleness checks                                  |
| Governance rejection              | The one risk that stops the program                                                                   | Publish this report first, then the migration proposal; the marketplace moves only after a cutover proposal passes                                         |
| Providers do not re-register      | Thin capacity on day one                                                                              | One-command re-registration, incentives, a paid testnet; 20+ providers, including the top 5 by GPU capacity, confirmed 7 days before cutover               |
| Validators leave during wind-down | Settlements and payouts stall                                                                         | Continuity payout funded before cutover; uptime pledges from two thirds of voting power as a cutover gate                                                  |
| Exchanges switch slowly           | Two versions of AKT trade side by side and liquidity splits                                           | The portal stays open 2 years so venues can switch on their own schedule; we coordinate with each venue                                                    |
| Fake migration portals            | Holders lose funds                                                                                    | One official portal domain; look-alike monitoring and takedowns from before launch                                                                         |
| Alpenglow lands in our window     | Solana's largest consensus upgrade may land inside our build window                                   | No cutover inside a stability buffer after activation; soak tests                                                                                          |
| Exchanges reject Token-2022       | Listings and custody slow down                                                                        | Venue survey; fallback to the classic SPL token standard, decided before token launch                                                                      |

### How we keep it safe

- **Audits:** two independent firms on the token and portal code before launch. Two more plus an economic review and a public audit contest on the marketplace, and a pentest of off-chain services. Every critical and high finding must be fixed and re-verified. Reports are published within 30 days.
- **Path to immutability:** after a burn-in of 12 months by default and a governance vote, the portal and escrow core become immutable.
- **Testing:** before cutover, a provider testnet of at least 6 weeks with 25+ independent operators, then a 14-day community dress rehearsal with zero blockers.

## Timeline and next steps

Four on-chain proposals bracket the move: the migration proposal after this report, a cutover proposal once audits and rehearsals are done, a sunset upgrade 21 days before cutover and a halt upgrade 21 days before halt. The token launches two weeks after the migration proposal passes, and only once two independent audits have passed. Cutover has no date yet, because the cutover proposal sets it.

<figure class="not-prose my-10 rounded-[14px] bg-card p-6 ring-1 ring-foreground/10 md:p-8">
<figcaption class="mb-8">
<p class="font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground">Migration roadmap</p>
<p class="mt-3 text-2xl font-normal leading-tight tracking-[-0.04em] text-foreground md:text-3xl">AKT moves first. The marketplace follows.</p>
<p class="mt-2 text-sm leading-6 text-muted-foreground">Phases and gates in order, not to scale. Cutover has no date yet.</p>
</figcaption>
<ol class="ml-[7px] border-l !border-foreground/20">
<li class="relative pb-7 pl-8 last:pb-0"><span aria-hidden="true" class="absolute -left-[7.5px] top-[5px] h-3.5 w-3.5 rounded-full bg-foreground ring-4 ring-card md:top-[7px]"></span><div class="flex flex-wrap items-baseline gap-x-3 gap-y-1"><span class="font-mono text-xs text-muted-foreground">01</span><span class="text-base font-medium leading-6 tracking-[-0.02em] text-foreground md:text-lg md:leading-7">Report and migration proposal</span><span class="rounded-full bg-foreground px-2 py-0.5 font-mono text-[10px] uppercase leading-4 tracking-[0.08em] text-background">Now</span></div><p class="mt-1 text-sm leading-6 text-muted-foreground md:text-[15px]">Publish this report, then submit the migration proposal on akashnet-2.</p></li>
<li class="relative pb-7 pl-8 last:pb-0"><span aria-hidden="true" class="absolute -left-[5.5px] top-[7px] h-2.5 w-2.5 rotate-45 bg-foreground ring-4 ring-card"></span><p class="text-sm leading-6 text-muted-foreground"><span class="mr-2 font-mono text-xs uppercase tracking-[0.08em] text-foreground">Gate 0</span>The migration proposal passes with 33.4% quorum and a majority voting yes.</p></li>
<li class="relative pb-7 pl-8 last:pb-0"><span aria-hidden="true" class="absolute -left-[7.5px] top-[5px] h-3.5 w-3.5 rounded-full bg-foreground ring-4 ring-card md:top-[7px]"></span><div class="flex flex-wrap items-baseline gap-x-3 gap-y-1"><span class="font-mono text-xs text-muted-foreground">02</span><span class="text-base font-medium leading-6 tracking-[-0.02em] text-foreground md:text-lg md:leading-7">Token launch, two weeks later</span><span class="rounded-full bg-foreground px-2 py-0.5 font-mono text-[10px] uppercase leading-4 tracking-[0.08em] text-background">One-way</span></div><p class="mt-1 text-sm leading-6 text-muted-foreground md:text-[15px]">Only after two independent audits pass, AKT launches as an SPL token and the migration portal opens for 2 years.</p></li>
<li class="relative pb-7 pl-8 last:pb-0"><span aria-hidden="true" class="absolute -left-[6.5px] top-[6px] h-3 w-3 rounded-full border !border-foreground bg-card ring-4 ring-card md:top-[8px]"></span><div class="flex flex-wrap items-baseline gap-x-3 gap-y-1"><span class="font-mono text-xs text-muted-foreground">03</span><span class="text-base font-medium leading-6 tracking-[-0.02em] text-foreground md:text-lg md:leading-7">Design freeze</span></div><p class="mt-1 text-sm leading-6 text-muted-foreground md:text-[15px]">Lock the marketplace designs and the emissions model.</p></li>
<li class="relative pb-7 pl-8 last:pb-0"><span aria-hidden="true" class="absolute -left-[5.5px] top-[7px] h-2.5 w-2.5 rotate-45 bg-foreground ring-4 ring-card"></span><p class="text-sm leading-6 text-muted-foreground"><span class="mr-2 font-mono text-xs uppercase tracking-[0.08em] text-foreground">Gate 1</span>Designs are frozen and the emissions model is ratified.</p></li>
<li class="relative pb-7 pl-8 last:pb-0"><span aria-hidden="true" class="absolute -left-[6.5px] top-[6px] h-3 w-3 rounded-full border !border-foreground bg-card ring-4 ring-card md:top-[8px]"></span><div class="flex flex-wrap items-baseline gap-x-3 gap-y-1"><span class="font-mono text-xs text-muted-foreground">04</span><span class="text-base font-medium leading-6 tracking-[-0.02em] text-foreground md:text-lg md:leading-7">Build</span></div><p class="mt-1 text-sm leading-6 text-muted-foreground md:text-[15px]">Solana programs, the indexer, Console and the provider daemon.</p></li>
<li class="relative pb-7 pl-8 last:pb-0"><span aria-hidden="true" class="absolute -left-[5.5px] top-[7px] h-2.5 w-2.5 rotate-45 bg-foreground ring-4 ring-card"></span><p class="text-sm leading-6 text-muted-foreground"><span class="mr-2 font-mono text-xs uppercase tracking-[0.08em] text-foreground">Gate 2</span>The public testnet is live, the first audit round is under way and the first dry run has passed.</p></li>
<li class="relative pb-7 pl-8 last:pb-0"><span aria-hidden="true" class="absolute -left-[6.5px] top-[6px] h-3 w-3 rounded-full border !border-foreground bg-card ring-4 ring-card md:top-[8px]"></span><div class="flex flex-wrap items-baseline gap-x-3 gap-y-1"><span class="font-mono text-xs text-muted-foreground">05</span><span class="text-base font-medium leading-6 tracking-[-0.02em] text-foreground md:text-lg md:leading-7">Testnet and audits</span></div><p class="mt-1 text-sm leading-6 text-muted-foreground md:text-[15px]">A provider testnet of 6+ weeks, two audit rounds and load tests.</p></li>
<li class="relative pb-7 pl-8 last:pb-0"><span aria-hidden="true" class="absolute -left-[6.5px] top-[6px] h-3 w-3 rounded-full border !border-foreground bg-card ring-4 ring-card md:top-[8px]"></span><div class="flex flex-wrap items-baseline gap-x-3 gap-y-1"><span class="font-mono text-xs text-muted-foreground">06</span><span class="text-base font-medium leading-6 tracking-[-0.02em] text-foreground md:text-lg md:leading-7">Rehearsals and cutover proposal</span></div><p class="mt-1 text-sm leading-6 text-muted-foreground md:text-[15px]">A dress rehearsal runs on forked mainnet, and the cutover proposal sets the cutover height.</p></li>
<li class="relative pb-7 pl-8 last:pb-0"><span aria-hidden="true" class="absolute -left-[5.5px] top-[7px] h-2.5 w-2.5 rotate-45 bg-foreground ring-4 ring-card"></span><p class="text-sm leading-6 text-muted-foreground"><span class="mr-2 font-mono text-xs uppercase tracking-[0.08em] text-foreground">Gate 3</span>The cutover proposal passes, audits are closed and the dress rehearsal has passed.</p></li>
<li class="relative pb-7 pl-8 last:pb-0"><span aria-hidden="true" class="absolute -left-[7.5px] top-[5px] h-3.5 w-3.5 rounded-full bg-foreground ring-4 ring-card md:top-[7px]"></span><div class="flex flex-wrap items-baseline gap-x-3 gap-y-1"><span class="font-mono text-xs text-muted-foreground">07</span><span class="text-base font-medium leading-6 tracking-[-0.02em] text-foreground md:text-lg md:leading-7">Cutover</span><span class="rounded-full bg-foreground px-2 py-0.5 font-mono text-[10px] uppercase leading-4 tracking-[0.08em] text-background">Point of no return</span></div><p class="mt-1 text-sm leading-6 text-muted-foreground md:text-[15px]">New deployments move to Solana. The old chain only settles existing leases.</p></li>
<li class="relative pb-7 pl-8 last:pb-0"><span aria-hidden="true" class="absolute -left-[5.5px] top-[7px] h-2.5 w-2.5 rotate-45 bg-foreground ring-4 ring-card"></span><p class="text-sm leading-6 text-muted-foreground"><span class="mr-2 font-mono text-xs uppercase tracking-[0.08em] text-foreground">Gate 4</span>The marketplace is live with funded deployments and the first weekly payout is done.</p></li>
<li class="relative pb-7 pl-8 last:pb-0"><span aria-hidden="true" class="absolute -left-[6.5px] top-[6px] h-3 w-3 rounded-full border !border-foreground bg-card ring-4 ring-card md:top-[8px]"></span><div class="flex flex-wrap items-baseline gap-x-3 gap-y-1"><span class="font-mono text-xs text-muted-foreground">08</span><span class="text-base font-medium leading-6 tracking-[-0.02em] text-foreground md:text-lg md:leading-7">Wind-down, 90 days</span></div><p class="mt-1 text-sm leading-6 text-muted-foreground md:text-[15px]">Old leases keep running. Earnings and refunds are paid weekly in new AKT.</p></li>
<li class="relative pb-7 pl-8 last:pb-0"><span aria-hidden="true" class="absolute -left-[6.5px] top-[6px] h-3 w-3 rounded-full border !border-foreground bg-card ring-4 ring-card md:top-[8px]"></span><div class="flex flex-wrap items-baseline gap-x-3 gap-y-1"><span class="font-mono text-xs text-muted-foreground">09</span><span class="text-base font-medium leading-6 tracking-[-0.02em] text-foreground md:text-lg md:leading-7">Halt and close-out, 13 weeks</span></div><p class="mt-1 text-sm leading-6 text-muted-foreground md:text-[15px]">The final payout is made, the old chain halts and archives are published.</p></li>
<li class="relative pb-7 pl-8 last:pb-0"><span aria-hidden="true" class="absolute -left-[5.5px] top-[7px] h-2.5 w-2.5 rotate-45 bg-foreground ring-4 ring-card"></span><p class="text-sm leading-6 text-muted-foreground"><span class="mr-2 font-mono text-xs uppercase tracking-[0.08em] text-foreground">Gate 5</span>The final payout is verified, the old chain is halted and archives are published.</p></li>
</ol>
</figure>

The token moves first, and the portal stays open for 2 years while the marketplace phases run. Each gate must pass before the next phase starts. Until about 6 hours before cutover, governance or validators can still stop the marketplace cutover.

### What happens next

1. **This report.** Read it beside the full plan in [AEP-79](https://github.com/akash-network/AEP/tree/main/spec/aep-79) and raise questions in public.
2. **Migration proposal on akashnet-2.** It states plainly that staking rewards end at cutover and validator income at halt, that holders must move AKT through the one-way portal within 2 years, how live leases wind down, and that migration cannot be reversed. It needs 33.4% quorum and a majority voting yes.
3. **Token launch, two weeks later.** Only once two independent audits have passed, the core team launches AKT as an SPL token and the migration portal opens for 2 years.
4. **Design freeze and build.** Solana-specific marketplace work starts only after the migration proposal passes.
5. **Cutover proposal.** It fixes the sunset upgrade, how the cutover height is set and the 90-day wind-down.
6. **Two final proposals.** A sunset upgrade is submitted 21 days before cutover, and a halt upgrade 21 days before halt.

Lead times protect everyone downstream. IBC partners get 60 days' notice before cutover, and provider re-registration opens 30 days before cutover.

## FAQ

**Is AKT being replaced by a new token?** No. AKT moves 1:1 with the same ticker and 6 decimals. ACT stays a non-transferable compute credit.

**Do I need SOL?** Not to migrate; a fee-payer relayer covers Solana fees for holders who migrate. Day to day, Gas fees are paid in SOL, but Console and the relayer can cover them for you.

**Is the migration portal a bridge?** No. It runs one way only, from Cosmos to Solana, and the old chain halts 90 days after cutover. A two-way bridge would keep both chains alive and add a second honeypot.

**Why not stay on Cosmos with shared security?** It would ease the staking cost but leave Akash running a chain, and it does nothing for distribution. Since the original RFP, Neutron has left Interchain Security and Noble has left Cosmos.

**Why not an Ethereum L2?** It was a strong option, and the EVM path stayed fully specified to the end. Solana came out ahead on cost under load, no single sequencer, the DePIN cluster and a more concrete offer.

**Isn't Solana known for outages?** Solana had several full outages between 2021 and February 2024, each with a public post-mortem. Every candidate had to show 99.5% liveness over the trailing 24 months, and Solana met that bar. Akash's escrow settles by elapsed time, so an outage delays settlement but does not lose funds.

**Does Solana get any AKT or a revenue share?** No. There is no stake, slot fee or revenue share. The only ongoing cost is transaction fees, about 0.075 SOL a day in network fees at today's volume.

**Can this be undone?** Not for tokens: each migration to Solana is one-way. For the marketplace, governance or validators can still stop the cutover until about 6 hours before it happens.

**What if the migration proposal fails?** Nothing moves. The token does not launch, and the program returns to option analysis.

**When does the token launch, and when is cutover?** The token launches two weeks after the migration proposal passes, and only once two independent audits have passed. Cutover has no date yet; the cutover proposal sets it after audits close and rehearsals pass.

## Sources

- [AEP-79: Akash on Shared Security](https://github.com/akash-network/AEP/tree/main/spec/aep-79), the original request for proposals, Dec 15, 2025.
- [Akash Chain Migration Program](https://github.com/akash-network/AEP/tree/main/spec/aep-79/doc), v0.9, Aug 10, 2026. Most used here: [02 Target selection](https://github.com/akash-network/AEP/blob/main/spec/aep-79/doc/02-target-selection.md), [03 Solana architecture](https://github.com/akash-network/AEP/blob/main/spec/aep-79/doc/03-solana-architecture.md), [04 Ethereum architecture](https://github.com/akash-network/AEP/blob/main/spec/aep-79/doc/04-ethereum-architecture.md), [05 Token migration](https://github.com/akash-network/AEP/blob/main/spec/aep-79/doc/05-token-migration.md), [06 State and data migration](https://github.com/akash-network/AEP/blob/main/spec/aep-79/doc/06-state-and-data-migration.md), [07 Off-chain services and clients](https://github.com/akash-network/AEP/blob/main/spec/aep-79/doc/07-offchain-and-clients.md), [08 Security and audits](https://github.com/akash-network/AEP/blob/main/spec/aep-79/doc/08-security-and-audits.md), [10 Rollout and cutover](https://github.com/akash-network/AEP/blob/main/spec/aep-79/doc/10-rollout-and-cutover.md) and [12 Risk register](https://github.com/akash-network/AEP/blob/main/spec/aep-79/doc/12-risk-register.md).
- Solana Foundation proposal to Akash, mid-2026.

Market and network figures, such as DEX volume, stablecoin supply and validator counts, are as reported in these documents in 2026 and the plan requires them to be re-verified at Gate 0.
