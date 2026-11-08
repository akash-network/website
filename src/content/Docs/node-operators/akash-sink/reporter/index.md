---
categories: ["Node Operators", "Akash Sink"]
tags: ["Akash Sink", "Reporter", "Solana", "Validators"]
weight: 1
title: "Run an Akash Sink reporter"
linkTitle: "Reporter"
description: "Configure independent nodes and a software key, preview Sink outcomes, and activate a reporter through governance"
---

A reporter verifies finalized Solana outcomes and reports them on Akash. Reporters can also veto conflicting refunds and finalize eligible refunds. They cannot mint tokens on Solana.

These instructions use the v0.1.0 test-network release with an existing bridge. Follow [reporter operations](https://github.com/akash-network/sink-operators/blob/v0.1.0/docs/operations.md#reporter) for configuration, custody, and alert details.

## Requirements

- Your own Akash node with current blocks and the expected chain ID.
- Your own replaying Solana node with transaction history, on the expected genesis.
- A dedicated Akash reporter account with an owner-only software key.
- The reviewed operator package for the deployed program; its Node runtime is included.

Keep Solana history for the outages you need to recover from plus the challenge period. Reporters must use independent observation sources. Finalized commitment does not make a dishonest RPC response trustworthy.

## Install and configure

Complete [download and installation](/docs/node-operators/akash-sink#download-and-install). As the host administrator:

```bash
ROOT=/opt/akt-bridge/current
useradd --system --home-dir /var/lib/akt-reporter --shell /usr/sbin/nologin akt-reporter
install -d -o akt-reporter -g akt-reporter -m 0700 /etc/akt-reporter /var/lib/akt-reporter
install -o akt-reporter -g akt-reporter -m 0600 \
  "$ROOT/config/reporter.json" /etc/akt-reporter/config.json
runuser -u akt-reporter -- "$ROOT/bin/akt-reporter" keys create \
  --out /etc/akt-reporter/reporter.key
```

Only the public Akash address is printed. Fund it with AKT for fees and share it
with the governance coordinator. Back up the key securely. It is an unencrypted
software key, readable only by the service user (`0600`); use a dedicated key,
never a validator consensus key. No KMS or custom signer is required.

Edit `/etc/akt-reporter/config.json`. Set your independent RPC endpoints, deployed
program and mint, generated reporter address, `akashChainId` and
`solanaGenesisHash`. Replace both mainnet identities in the example with the test
deployment identities. Keep `keyFile` pointing to
`/etc/akt-reporter/reporter.key`, and preserve the reviewed fee and freshness limits.
Use the deployment handoff for identities. A mainnet fork has a different chain ID.

Check the configuration without loading the key or contacting a node:

```bash
runuser -u akt-reporter -- "$ROOT/bin/akt-reporter" check --network testnet --config /etc/akt-reporter/config.json
```

Run only one signing process per account. Existing external-signer integrations
remain optional; see the [custody reference](https://github.com/akash-network/sink-operators/blob/v0.1.0/docs/install.md#create-a-key-and-configure).

## Preview before broadcasting

Install the shipped `deploy/systemd/akt-reporter.service`. It starts in preview mode:

```bash
install -m 0644 "$ROOT/deploy/systemd/akt-reporter.service" /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now akt-reporter
journalctl -u akt-reporter -f
```

Preview reads both chains without signing or broadcasting. Before governance
admits the address it stops with `not a current reporter`; this is not a
successful observation scan. After admission, verify freshness, transfer outcomes
and alert delivery. Treat missing history or RPC failures as unavailable evidence,
not as a void.

## Join the reporter policy

Akash governance chooses reporter membership and the decimal threshold. Query the configuration and current policy with the matching native node binary:

```bash
akash query sink params --node "$RPC" --output json
akash query sink reporters 0 --node "$RPC" --output json
```

Share your public reporter address for the network's governance process. A proposal adds it to the complete parameter set. The [pending akt CLI guide](/docs/developers/akt/sink#governance-actions) describes the proposal helper. Do not enable signing until the proposal passes and the current policy includes your account.

After passage, confirm your address is in the current policy. Quorum is the member count multiplied by the decimal threshold, rounded up, and must exceed two thirds of the members. Policy version and settlement round are separate; each report must match both.

## Enable signing

After governance admission and a successful preview scan, enable broadcasting:

```bash
install -d -m 0755 /etc/systemd/system/akt-reporter.service.d
cat > /etc/systemd/system/akt-reporter.service.d/broadcast.conf <<'EOF'
[Service]
ExecStart=
ExecStart=/opt/akt-bridge/current/bin/akt-reporter run --network testnet --config /etc/akt-reporter/config.json --watch --broadcast
EOF
systemctl daemon-reload
systemctl restart akt-reporter
journalctl -u akt-reporter -f
```

Verify a real signed report, its committed receipt, the remaining fee balance, and the expected settlement. Configuration validation alone does not prove signer access or transaction delivery.

## Monitor and recover

Page on conflicting outcomes, unavailable audits, stale nodes, signer errors, and light-client changes. Reporters inspect disputes even when a transfer is already minted or refunded. See the [operations guide](https://github.com/akash-network/sink-operators/blob/v0.1.0/docs/operations.md#reporter).

Refunds require the recorded challenge deadline and all native payment conditions. Standard builds enforce a minimum of 72 hours. If evidence cannot be checked before a deadline, escalate through governance or the refund pause; do not fabricate an outcome.

After a restart, confirm the same chain and program identities, retained votes, and balances. Follow [service recovery](https://github.com/akash-network/sink-operators/blob/v0.1.0/docs/install.md#upgrade-or-roll-back) when changing releases.
