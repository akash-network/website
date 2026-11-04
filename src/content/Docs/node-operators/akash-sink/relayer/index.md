---
categories: ["Node Operators", "Akash Sink"]
tags: ["Akash Sink", "Relayer", "Solana", "Validators"]
weight: 2
title: "Run an Akash Sink relayer"
linkTitle: "Relayer"
description: "Install and operate a relayer against an existing Akash and Solana deployment"
---

A relayer uploads Akash block headers and transfer proofs to Solana. Solana verifies the signatures and proofs before minting or voiding a transfer. The relayer needs a funded payer, but cannot change the proven recipient or amount.

For a new network, complete [deployment](/docs/node-operators/akash-sink#deploy-an-operated-network) first. For a disposable test, use [local E2E](https://github.com/akash-network/node/blob/feat/sink-review/_docs/sink-local-e2e.md).

## Requirements

- An Akash RPC with the expected chain ID, current blocks, and the state history needed to construct proofs.
- A Solana RPC on the expected genesis, with sufficient transaction history for recovery.
- A dedicated Solana payer funded for fees and temporary account rent.
- A persistent state directory used by only one running relayer with that payer.
- Node.js 24 and a reviewed service archive built for the host's CPU architecture and libc.

Follow the [node and history requirements](https://github.com/akash-network/node/blob/feat/sink-review/contracts/solana/docs/operators.md#requirements). Pruned history can prevent proof generation or recovery.

## Install and configure

Use [service installation](https://github.com/akash-network/node/blob/feat/sink-review/contracts/solana/docs/deploy-services.md) to build or obtain the checked archive, verify its hash, create the service account, and install the root-owned release.

Copy the shipped `relayer/config.example.json` to `/etc/akt-relayer/config.json`. Fill it from the deployment manifest, including:

- `akashRpc`, `akashChainId`, `solanaRpc`, and `solanaGenesisHash`.
- The deployed `programId`.
- `payerKeyFile`, owned by the service account with mode `0600`.
- `headerEncoder`, set to `/opt/akt-bridge/current/bin/akt-header-encoder`.
- `stateDir`, set to `/var/lib/akt-relayer` and retained across releases.

Do not use development program IDs or a repository cache as production state. Set an explicit spending budget and alert on payer balance. The [configuration reference](https://github.com/akash-network/node/blob/feat/sink-review/contracts/solana/docs/operators.md#configure) lists the remaining options.

Check the configuration from the installed release:

```bash
cd /opt/akt-bridge/current/contracts/solana
node --import tsx deploy/service-config.ts relayer /etc/akt-relayer/config.json
```

This check does not read the payer key. Startup also checks the live chain and program identities.

## Start the service

Install the shipped `deploy/systemd/akt-relayer.service` as described in the service guide. After reviewing its paths and permissions:

```bash
systemctl daemon-reload
systemctl enable --now akt-relayer
journalctl -u akt-relayer -f
```

Confirm that headers advance and pending transfers resolve. Header updates require the configured relayer role or open-relaying setting; running the process alone does not grant those rights. Read the `relayer-access` output and [update-rights reference](https://github.com/akash-network/node/blob/feat/sink-review/contracts/solana/docs/operators.md#update-rights).

## Monitor and recover

Monitor light-client age, payer balance, progress, and JSON alerts. Investigate `relay-budget-exhausted`, `relay-discovery-failed`, `relay-unbacked-settlement`, `light-client-mismatch`, and repeated retry failures. See the [alert reference](https://github.com/akash-network/node/blob/feat/sink-review/contracts/solana/docs/operators.md#alerts).

Keep the same journals and spend ledger after restart. Do not delete a running payer lock, reset a budget to hide repeated failures, or restore an older journal after transactions were sent. Missing transaction history can block recovery even when a permanent Solana outcome exists.

Use the [service upgrade and recovery procedure](https://github.com/akash-network/node/blob/feat/sink-review/contracts/solana/docs/deploy-services.md#upgrade-rollback-and-recovery). An expired or frozen light client requires the separate [incident runbook](https://github.com/akash-network/node/blob/feat/sink-review/contracts/solana/docs/production-deployment.md#incident-runbooks).
