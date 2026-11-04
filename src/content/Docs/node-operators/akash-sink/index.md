---
categories: ["Node Operators"]
tags: ["Akash Sink", "Solana", "Reporter", "Relayer", "Validators"]
weight: 6
title: "Run Akash Sink"
linkTitle: "Akash Sink"
description: "Local CLI testing, Akash upgrades, Solana deployment, and operation of Sink relayers and reporters"
---

Sink connects the Akash module to three Solana programs through a relayer and independent reporters. Choose the instructions for your task:

| Task                                                         | Guide                                                                                                                          |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| Test the whole bridge locally with the CLI, without a portal | [Local setup and E2E](https://github.com/akash-network/node/blob/feat/sink-review/_docs/sink-local-e2e.md)                     |
| Upgrade Akash and deploy an operated network                 | [Akash and Solana deployment](https://github.com/akash-network/node/blob/feat/sink-review/_docs/sink-deployment.md)            |
| Build the Solana programs                                    | [Build and toolchain](https://github.com/akash-network/node/blob/feat/sink-review/contracts/solana/docs/setup.md)              |
| Deploy programs and assign authorities                       | [Solana program ceremony](https://github.com/akash-network/node/blob/feat/sink-review/contracts/solana/docs/deploy-program.md) |
| Package and install supervised services                      | [Service installation](https://github.com/akash-network/node/blob/feat/sink-review/contracts/solana/docs/deploy-services.md)   |
| Operate a relayer or reporter                                | [Relayer](/docs/node-operators/akash-sink/relayer) · [Reporter](/docs/node-operators/akash-sink/reporter)                      |

These runbooks contain the commands and their prerequisites. Use one reviewed source revision throughout. Launch release tags, production program IDs, mint, and checksums remain TBD at launch.

## Test locally

The local path adds Solana, a relayer, and seven reporters to the existing Akash upgrade-test Docker Compose setup. It uses the native `akash` CLI, so it does not depend on the pending `akt` commands.

Start with [local setup](https://github.com/akash-network/node/blob/feat/sink-review/_docs/sink-local-setup.md). It requires a separately prepared native upgrade fixture, matching Linux artifacts, and fresh test keys. Follow its architecture, fixed-port, and snapshot prerequisites before starting containers. The Compose overlay does not create the native fixture for you.

Then follow the [mint, refund, and restart steps](https://github.com/akash-network/node/blob/feat/sink-review/_docs/sink-local-e2e.md). Standard builds retain the 72-hour challenge minimum. The documented `sinkdev` option is only for accelerated tests.

Container preparation and Solana program readback have been checked. The complete local upgrade-to-refund sequence remains unverified.

## Deploy an operated network

Follow [the deployment runbook](https://github.com/akash-network/node/blob/feat/sink-review/_docs/sink-deployment.md) in order:

1. Build the node with its committed SDK dependencies and release tags. Record the source and artifact hashes.
2. Rehearse the registered `v2.2.0` upgrade from `v2.1.2` on an isolated snapshot fork. Preserve the native epoch schedule and release challenge.
3. Back up the chain, stage the binary on validators, and complete the governed upgrade. The handler installs Sink disabled and also performs the reviewed escrow and Pyth migrations.
4. Deploy and verify the three Solana programs, their authorities, and a post-upgrade Akash checkpoint.
5. Install the relayer and independent reporters. Fund their fee accounts and run reporters in preview.
6. Configure and enable the bridge through the documented authority and governance steps, then verify canary transfers and retained-state restarts.

The node runbook includes native governance commands, fixed gas for unsigned message generation, and checks for the upgrade's balance changes. The [Solana production runbook](https://github.com/akash-network/node/blob/feat/sink-review/contracts/solana/docs/production-deployment.md) covers activation, monitoring, and incidents.

A snapshot-fork upgrade, mint, refund-pending settlement, and retained-state restarts have passed. That does not establish a mature 72-hour refund, a full mainnet-sized export/import, or a clean end-to-end replay of both published runbooks.

## Understand the services

| Service  | Responsibility                                                                             | Credentials                                                       |
| -------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| Relayer  | Upload signed Akash headers and proofs that Solana verifies                                | A funded Solana payer and the configured header-update permission |
| Reporter | Verify finalized Solana outcomes and submit reports, vetoes, and eligible refunds on Akash | A governance-selected Akash account and external signer           |

Neither service holds user funds. Validators continue producing their normal consensus signatures; the Solana light client verifies those signatures. Run services separately from validator hosts.

Reporter quorum is `ceil(member count × threshold)`. The required vote count must exceed two thirds of the members. Seven reporters with a threshold of `0.70` require five votes. Query the active policy rather than assuming a version or fixed reporter count.

After the upgrade, set `RPC` to the upgraded node's CometBFT endpoint and inspect the separate native queries:

```bash
akash query sink params --node "$RPC" --output json
akash query sink reporters 0 --node "$RPC" --output json
akash query sink state --node "$RPC" --output json
```

`params` returns configuration, `reporters 0` returns the current policy, and `state` returns totals, native epoch usage, and the refund candidate. A refund still needs challenge maturity, current authorization, no hold, enabled refunds, queue priority, and available epoch capacity.

## Preserve state during recovery

Retain chain databases, network identities, program artifacts, and service journals. Do not attach a new mint to already resolved native transfers or reset journals to hide a failure. Backing includes pending, minted, void-requested, and refund-pending amounts; paid refunds are no longer locked.

The registered upgrade installs Sink on pre-Sink state. It is not a migration between incompatible Sink testnet schemas. A service rollback cannot undo chain transactions. Follow the [incident runbooks](https://github.com/akash-network/node/blob/feat/sink-review/contracts/solana/docs/production-deployment.md#incident-runbooks) before recovery.

## Related guides

- [How Akash Sink works](/docs/learn/akash-sink)
- [Send AKT with the pending akt CLI](/docs/developers/akt/sink)
- [Use the portal](/docs/learn/akash-sink/portal)
