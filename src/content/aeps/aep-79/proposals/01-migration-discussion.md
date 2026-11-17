# Discussion: Migrating Akash to Solana

On Monday, Oct 26, we will submit an on-chain proposal on `akashnet-2` to move Akash Network to Solana. This thread is for questions, concerns and feedback before and during the vote.

A YES vote approves the migration of the Akash protocol to Solana and authorizes two things:

1. AKT launches as an SPL token on Solana **once the token and portal audits are complete, expected 2 to 3 weeks after the proposal passes**.
2. A **one-way migration portal** opens for **2 years**. AKT moves 1:1, keeps its ticker and 6 decimals, and total supply does not change.

**It does not move the marketplace.** There is no cutover date yet. Live leases, staking and governance on `akashnet-2` keep working as they do today. The marketplace moves only after audits and migration rehearsals pass and a separate cutover proposal passes. A NO vote means nothing moves: the token does not launch and the program returns to option analysis.

The proposal needs 20% quorum of bonded stake and a majority voting YES. Voting runs for 3 days.

## Why Solana

Akash pays the full cost of a sovereign chain without using its powers. About 100 validators bond AKT only to secure consensus, and the core team maintains its own forks of cosmos-sdk, CometBFT and gogoproto. Nothing in the marketplace needs custom consensus.

We opened AEP-79 as an RFP in December 2025, then published a 15-document plan in August 2026 that weighed seven options against 15 hard requirements. Solana and an existing EVM L2 both cleared every bar. Solana won on fit:

- **No chain to run.** No bonding, slot auction, SOL stake or revenue share. Marketplace network fees come to about 0.075 SOL a day.
- **Cheapest under load.** About 9x cheaper than an EVM L2 on a calm day and about 300x cheaper under load, by our own designs.
- **No single operator.** No sequencer, and two independent validator clients in production.
- **The runtime fits.** Native Pyth prices, Token-2022 for ACT, and fee-payer relayers so users don't need SOL.
- **Our peers are there.** Helium, Render, io.net, Hivemapper and Nosana settle on Solana, and Helium and Render have already run this playbook.

The full reasoning, including where the EVM path came out ahead, is in the report linked below.

## What changes for you

| You are | Before cutover | What to know |
| --- | --- | --- |
| AKT holder (self-custody) | Nothing required | Use the official portal any time in the 2-year window. No SOL needed. Migration is one-way. |
| AKT holder (exchange) | Nothing required | Your exchange migrates balances on its own schedule. Watch for its notice. |
| Console wallet | Nothing required | Your balance migrates automatically. |
| Staker | Keep earning rewards | Unbond (21 days) before migrating. Staking rewards end at cutover. |
| Validator | Keep validating | Role and income end at halt, 90 days after cutover. A continuity payout covers the wind-down. |
| Provider | Upgrade one daemon, re-register on Solana | Keep 100% of lease payments; no protocol take at launch. |
| Tenant | Nothing required | SDL files don't change. Live leases run until you close them or the old chain halts. |
| Builder | Plan for SDK v2 and CLI v3 | SPL AKT exists from token launch, so wallets, DEXs and custodians can add it early. |

**Phishing is the biggest risk to holders.** There will be one official portal domain. Check the Solana address before you confirm.

## What we give up

This is a trade, and we want the costs on the table:

- **Sovereign consensus.** Akash can't change Solana's block times or fee markets. We keep control of our programs, upgrades, governance and fee policy.
- **The validator role.** About 100 operators lose a role and an income stream. We owe them a respectful wind-down.
- **Native IBC.** Cosmos links after halt go through third-party bridges.
- **Live slashing.** Not live on Solana yet; SIMD-0212 is still in governance.
- **Some atomic steps.** Closes and bid refunds run through automated cranks, and each lease locks a refundable rent deposit of about 0.024 SOL.

## Timeline and how to take part

1. **Now:** read the report and the proposal text, and ask questions here.
2. **Mon, Oct 26:** migration proposal submitted on `akashnet-2`. Voting runs for 3 days.
3. **2 to 3 weeks after it passes, once audits are complete:** SPL AKT launches and the portal opens for 2 years. We will announce the exact date through official Akash channels.
4. **After audits and rehearsals:** a cutover proposal sets the cutover date and the 90-day wind-down. That is a separate vote.
5. **21 days before cutover, and 21 days before halt:** sunset and halt upgrades.

Vote with any Cosmos wallet that supports governance, or ask your validator how they plan to vote. Until about 6 hours before cutover, governance or validators can still stop the marketplace move.

## Questions we want your input on

These are still open and will be settled before the cutover proposal. Tell us what you think:

1. How should unvested AKT migrate?
2. How should AKT still on `akashnet-2` at halt reach the portal?
3. What should happen to AKT not migrated within the 2-year window?
4. What should the capped emissions curve for provider incentives and the treasury look like, and should holders have a role in backing providers?
5. How large should the validator continuity payout be?

Other concerns are welcome too, especially from validators, providers and exchanges.

## Links

- Report: [Why We Selected Solana for Akash](https://claude.ai/artifact/Boybg6pc96ery8YFBep7gS) (replace with public URL)
- Proposal text: [Proposal: Migrate the Akash Protocol to Solana](https://claude.ai/artifact/RTvkxczTDFQE7ErZrJ7iKZ) (replace with public URL)
- [AEP-79 and the Akash Chain Migration Program](https://github.com/akash-network/AEP/tree/main/spec/aep-79)
- On-chain proposal: link added once submitted
