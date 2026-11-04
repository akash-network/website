---
categories: ["Node Operators", "Akash Sink"]
tags: ["Akash Sink", "Reporter", "Solana", "Validators"]
weight: 1
title: "Run an Akash Sink reporter"
linkTitle: "Reporter"
description: "Configure independent nodes and an external signer, preview Sink outcomes, and activate a reporter through governance"
---

A reporter verifies finalized Solana outcomes and reports them on Akash. Reporters can also veto conflicting refunds and finalize eligible refunds. They cannot mint tokens on Solana.

For a new network, complete [deployment](/docs/node-operators/akash-sink#deploy-an-operated-network) first. Follow the [reporter reference](https://github.com/akash-network/node/blob/feat/sink-review/contracts/solana/docs/reporter.md) for configuration, custody, and alert details.

## Requirements

- Your own Akash node with current blocks and the expected chain ID.
- Your own replaying Solana node with transaction history, on the expected genesis.
- A funded Akash reporter account controlled through an external signer.
- Node.js 24 and the reviewed service archive for the deployed program and SDK.

Keep Solana history for the outages you need to recover from plus the challenge period. Reporters must use independent observation sources. Finalized commitment does not make a dishonest RPC response trustworthy.

## Install and configure

Follow [service installation](https://github.com/akash-network/node/blob/feat/sink-review/contracts/solana/docs/deploy-services.md) to verify the archive and install it under a dedicated Unix account.

Copy the shipped `reporter/config.example.json` to `/etc/akt-reporter/config.json`. Set the exact chain ID, Solana genesis, program, mint, reporter address, RPCs, fees, and `externalSigner`. Obtain identities from the reviewed deployment manifest, not from an untrusted endpoint. A mainnet fork has its own chain identity.

The production broadcast entry point requires an external signer. Local private-key files are for tests only. Follow [key custody](https://github.com/akash-network/node/blob/feat/sink-review/contracts/solana/docs/reporter.md#key-custody) to implement and verify the signer protocol. Run only one signing process per reporter account.

Check the configuration without invoking the signer:

```bash
cd /opt/akt-bridge/current/contracts/solana
node --import tsx deploy/service-config.ts reporter-preview /etc/akt-reporter/config.json
```

## Preview before broadcasting

Install the shipped `deploy/systemd/akt-reporter.service`. It starts in preview mode:

```bash
systemctl daemon-reload
systemctl enable --now akt-reporter
journalctl -u akt-reporter -f
```

Preview reads both chains without signing or broadcasting. Verify network identities, freshness, transfer outcomes, and alert delivery. Treat missing history or RPC failures as unavailable evidence, not as a void.

## Join the reporter policy

Akash governance chooses reporter membership and the decimal threshold. Query the configuration and current policy with the matching native node binary:

```bash
akash query sink params --node "$RPC" --output json
akash query sink reporters 0 --node "$RPC" --output json
```

Use the [native governance procedure](https://github.com/akash-network/node/blob/feat/sink-review/_docs/sink-deployment.md#configure-and-enable-sink) to propose the complete parameter set. The [pending akt CLI guide](/docs/developers/akt/sink#governance-actions) describes its proposal helpers separately.

After passage, confirm your address is in the current policy. Quorum is the member count multiplied by the decimal threshold, rounded up, and must exceed two thirds of the members. Policy version and settlement round are separate; each report must match both.

## Enable signing

After preview checks and governance admission, install the broadcast drop-in from [the service guide](https://github.com/akash-network/node/blob/feat/sink-review/contracts/solana/docs/deploy-services.md#supervise-and-activate). It selects `deploy/service.sh reporter-broadcast` with your configuration. Reload systemd and restart the reporter.

Verify a real signed report, its committed receipt, the remaining fee balance, and the expected settlement. Configuration validation alone does not prove signer access or transaction delivery.

## Monitor and recover

Page on conflicting outcomes, unavailable audits, stale nodes, signer errors, and light-client changes. Reporters inspect disputes even when a transfer is already minted or refunded. See the [alert reference](https://github.com/akash-network/node/blob/feat/sink-review/contracts/solana/docs/reporter.md#alerts).

Refunds require the recorded challenge deadline and all native payment conditions. Standard builds enforce a minimum of 72 hours. If evidence cannot be checked before a deadline, escalate through governance or the refund pause; do not fabricate an outcome.

After a restart, confirm the same chain and program identities, retained votes, and balances. Follow [service recovery](https://github.com/akash-network/node/blob/feat/sink-review/contracts/solana/docs/deploy-services.md#upgrade-rollback-and-recovery) when changing releases.
