## Summary

This proposal asks AKT stakers to approve moving Akash Network from its sovereign Cosmos chain, `akashnet-2`, to Solana mainnet.

**A YES vote:**

1. Approves the migration of the Akash protocol to Solana, as specified in [AEP-79](https://github.com/akash-network/AEP/tree/main/spec/aep-79) and the Akash Chain Migration Program.
2. Authorizes AKT to launch as an SPL token on Solana **once the token and portal audits are complete, expected 2 to 3 weeks after this proposal passes**, and opens a **one-way migration portal for 2 years**.

**What this proposal does not do:** it does not set a cutover date and does not move the marketplace. Live leases, staking and governance on `akashnet-2` continue unchanged. The marketplace moves only after audits and migration rehearsals pass **and** a separate cutover proposal passes on this chain.

## Why Solana

Akash pays the full cost of a sovereign chain without using its powers. Nothing in the marketplace needs custom consensus: escrow settles lazily, with no vote extensions or per-block sweeps. Meanwhile, about 100 validators bond AKT only to secure consensus, and the core team maintains forks of cosmos-sdk, CometBFT and gogoproto.

Solana was selected after an open RFP ([AEP-79](https://github.com/akash-network/AEP/tree/main/spec/aep-79), Dec 15 2025) and a 15-document migration plan (Aug 10 2026) that weighed seven options against 15 hard requirements. Two cleared every bar: Solana mainnet and an existing EVM L2. Solana won on fit:

- **No chain to run.** Security is inherited, with no bonding, slot auction, SOL stake or revenue share. Network fees for the whole marketplace come to about 0.075 SOL a day.
- **Cost under load.** By our designs, a marketplace operation costs about 9x less than on an EVM L2 on a calm day and about 300x less under load.
- **No single operator.** No sequencer; two independent validator clients (Agave, Firedancer) in production.
- **Runtime fit.** Native Pyth prices (retiring Akash's CosmWasm subsystem), Token-2022 keeps ACT non-transferable, and fee-payer relayers let users act without holding SOL.
- **DePIN and liquidity.** Helium, Render, io.net, Hivemapper and Nosana settle on Solana; Helium and Render are the migration playbook. Solana ranks first in weekly DEX volume and carries about $15B in stablecoins.

The Solana Foundation asks for nothing up front and has offered engineering, audit and gas-subsidy support, to be confirmed in a letter of intent. The plan does not depend on it.

## What Akash gives up

- Sovereign consensus: Akash cannot change Solana's block times or fee markets. It keeps control of its programs, upgrades, governance and fee policy.
- Validator income and the validator role on `akashnet-2`.
- Native IBC. Cosmos links after halt go through third-party bridges.
- Live slashing (SIMD-0212 is still in Solana governance).
- Some atomic steps: deployment closes and bid refunds run through automated cranks. Each lease also locks a refundable rent deposit of about 0.024 SOL.

## Required disclosures

**1. Staking rewards and validator income end.** Staking rewards and old-chain inflation end at **cutover**. Validator income and the validator role end at **halt**, 90 days after cutover. A continuity payout, funded before cutover, pays validators who keep the chain live during the wind-down (at least 90% of blocks signed and 80% of time in the active set; double-signing forfeits it). A capped, DAO-governed emissions program for provider incentives and the treasury replaces old-chain inflation; its curve is ratified before the cutover proposal.

**2. Migration is one-way and irreversible.** AKT sent through the portal arrives 1:1 as SPL AKT (same ticker, 6 decimals) and leaves circulation on `akashnet-2`. **There is no path back** from SPL AKT to AKT on `akashnet-2`. Total supply does not change.

**3. The portal is open for 2 years** from token launch. Self-custody holders connect their Cosmos wallet and choose a Solana address. Exchanges migrate customer balances on their own schedule. Console-managed wallets migrate automatically. AKT on Osmosis or other IBC chains must return to `akashnet-2` first. Solana fees for migrating holders are covered by a relayer; no SOL is needed to migrate.

**4. Staked AKT must be unbonded first.** Bonded and unbonding AKT must finish unbonding (21 days) before it can be migrated. There is no rush: until cutover, AKT on `akashnet-2` still pays gas, earns staking rewards and votes on the remaining proposals.

**5. Live lease wind-down.** Nothing changes for live workloads before cutover. After cutover, new deployments go to Solana; existing leases keep running for 90 days until halt, and tenants can still top up, close and withdraw on `akashnet-2`. Refunds of deposits made before cutover are paid weekly in SPL AKT; top-ups made after cutover are not credited on Solana. Notices go out at 30, 60 and 75 days after cutover, with a final warning at least 7 days before halt. Providers run one daemon upgrade (`akash provider migrate`) and re-register on Solana; old-chain earnings are paid weekly in SPL AKT. SDL files do not change.

**6. Points of no return.** For the token, the point of no return is **token launch**: once the portal opens, every migration is final. For the marketplace, it is **cutover**: governance or validators can stop the marketplace move until about 6 hours before cutover.

**Still open, to be settled and published before the cutover proposal:** how AKT still on `akashnet-2` at halt reaches the portal, what happens to AKT not migrated within 2 years, the emissions curve and the size of the validator continuity payout.

## Security

- Two independent audits of the token and portal code before launch; two more plus an economic review and a public audit contest on the marketplace programs. All critical and high findings fixed and re-verified; reports published within 30 days.
- Portal safeguards: formal checks of mint logic, per-epoch mint caps, independent reconciliation of both chains and automatic pause on any supply mismatch.
- **Phishing is the top threat. There will be one official portal domain, announced through official Akash channels. Always check the Solana address before you confirm.**

## Timeline

1. **This proposal** (migration). Quorum 33.40% of bonded stake, majority YES.
2. **Token launch**, once the token and portal audits are complete, expected 2 to 3 weeks after this proposal passes: SPL AKT launches and the portal opens for 2 years. The launch date is announced through official Akash channels.
3. **Build and audits.** Solana marketplace work, a provider testnet of at least 6 weeks with 25+ independent operators, and a 14-day community dress rehearsal with zero blockers.
4. **Cutover proposal** (text). Sets the cutover instant, the height formula, the 90-day wind-down and the point-of-no-return declarations.
5. **Sunset upgrade**, submitted 21 days before cutover. **Halt upgrade**, submitted 21 days before halt.

IBC partners get 60 days' notice before cutover; provider re-registration opens 30 days before cutover.

## Voting options

- **YES**: approve the migration to Solana and authorize the SPL AKT token launch and 2-year one-way migration portal.
- **NO**: do not migrate. Nothing moves; the token does not launch and the program returns to option analysis.
- **NO WITH VETO**: as NO, and the proposal is considered spam or harmful.
- **ABSTAIN**: contribute to quorum without taking a side.

## References

- [Why We Selected Solana for Akash](https://claude.ai/artifact/Boybg6pc96ery8YFBep7gS) (Oct 20 2026). Needs a public URL before submission.
- [AEP-79 and the Akash Chain Migration Program](https://github.com/akash-network/AEP/tree/main/spec/aep-79)
- Plan version pinned by commit: `0805c517a16952df95573906e2a4da7128ef0b66`
- Discussion: [GitHub Discussion #1123](https://github.com/orgs/akash-network/discussions/1123)
