---
categories: ["Node Operators", "Akash Sink"]
tags: ["Akash Sink", "Relayer", "Solana", "Validators"]
weight: 2
title: "Run an Akash Sink relayer"
linkTitle: "Relayer"
description: "Install and operate a relayer against an existing Akash and Solana deployment"
---

A relayer uploads Akash block headers and transfer proofs to Solana. Solana verifies the signatures and proofs before minting or voiding a transfer. The relayer needs a funded payer, but cannot change the proven recipient or amount.

These instructions use the v0.1.0 test-network release with an existing bridge.
See [service roles and prerequisites](/docs/node-operators/akash-sink).

## Requirements

- An Akash RPC with the expected chain ID, current blocks, and the state history needed to construct proofs.
- A Solana RPC on the expected genesis, with sufficient transaction history for recovery.
- A dedicated Solana payer funded for fees and temporary account rent.
- A persistent state directory used by only one running relayer with that payer.
- The reviewed Linux operator package; its Node runtime is included.

Follow the [node and history requirements](https://github.com/akash-network/sink-operators/blob/v0.1.0/docs/install.md#before-you-start). Pruned history can prevent proof generation or recovery.

## Install and configure

Complete [download and installation](/docs/node-operators/akash-sink#download-and-install), then create the service account as the host administrator:

```bash
ROOT=/opt/akt-bridge/current
useradd --system --home-dir /var/lib/akt-relayer --shell /usr/sbin/nologin akt-relayer
install -d -o akt-relayer -g akt-relayer -m 0700 /etc/akt-relayer /var/lib/akt-relayer
install -o akt-relayer -g akt-relayer -m 0600 \
  "$ROOT/config/relayer.json" /etc/akt-relayer/config.json
```

Use either a new key or your existing Solana keypair.

### Create a new key

```bash
runuser -u akt-relayer -- "$ROOT/bin/akt-relayer" keys create \
  --out /etc/akt-relayer/payer-keypair.json
```

Only the public address is printed. Keep a secure backup of the key file;
it uses the standard Solana CLI JSON format. Creation
refuses to overwrite an existing key.

Continue at [Configure the relayer](#configure-the-relayer).

### Use an existing Solana keypair

Use the existing Solana CLI keypair JSON file, a 64-byte integer array. A
mnemonic or a browser wallet's base58 private-key export is not this format.
Check its address on your workstation:

```bash
solana-keygen pubkey /secure/path/payer-keypair.json
```

Transfer the file to `/root/payer-keypair.json` on the relayer host over SSH.
As the host administrator, install it into the empty service key path:

```bash
test ! -e /etc/akt-relayer/payer-keypair.json &&
	install -o akt-relayer -g akt-relayer -m 0600 \
		/root/payer-keypair.json /etc/akt-relayer/payer-keypair.json

runuser -u akt-relayer -- /opt/akt-bridge/current/bin/akt-relayer \
	keys address --key-file /etc/akt-relayer/payer-keypair.json
```

Confirm the printed address matches your existing Solana wallet. Set
`payerKeyFile` to `/etc/akt-relayer/payer-keypair.json` in the config.

Keep a secure backup and remove temporary transfer copies.

### Configure the relayer

Fund the verified address with SOL. Obtain header-update permission when relaying is closed.

Edit `/etc/akt-relayer/config.json` using the deployment handoff:

- `akashRpc`, `akashChainId`, `solanaRpc`, and `solanaGenesisHash`.
- The deployed `programId`.
- `payerKeyFile`, owned by the service account with mode `0600`.
- `headerEncoder`, set to `/opt/akt-bridge/current/bin/akt-header-encoder`.
- `stateDir`, set to `/var/lib/akt-relayer` and retained across releases.

Use the test deployment IDs supported by this release. Keep state outside the
release directory, set an explicit spending budget and alert on payer balance. The [configuration guide](https://github.com/akash-network/sink-operators/blob/v0.1.0/docs/install.md#create-a-key-and-configure) lists the remaining options.

Check the configuration from the installed release:

```bash
runuser -u akt-relayer -- /opt/akt-bridge/current/bin/akt-relayer check --network testnet --config /etc/akt-relayer/config.json
```

This check does not read the payer key. Startup also checks the live chain and program identities.

## Start the service

Install the shipped `deploy/systemd/akt-relayer.service` as described in the service guide. After reviewing its paths and permissions:

```bash
install -m 0644 "$ROOT/deploy/systemd/akt-relayer.service" /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now akt-relayer
journalctl -u akt-relayer -f
```

Confirm that headers advance and pending transfers resolve. Header updates require the configured relayer role or open-relaying setting; running the process alone does not grant those rights. Read the `relayer-access` output and [relayer operations guide](https://github.com/akash-network/sink-operators/blob/v0.1.0/docs/operations.md#relayer).

## Monitor and recover

Monitor light-client age, payer balance, progress, and JSON alerts. Investigate `relay-budget-exhausted`, `relay-discovery-failed`, `relay-unbacked-settlement`, `light-client-mismatch`, and repeated retry failures. See the [operations guide](https://github.com/akash-network/sink-operators/blob/v0.1.0/docs/operations.md#relayer).

Keep the same journals and spend ledger after restart. Do not delete a running payer lock, reset a budget to hide repeated failures, or restore an older journal after transactions were sent. Missing transaction history can block recovery even when a permanent Solana outcome exists.

Use the [service upgrade and recovery procedure](https://github.com/akash-network/sink-operators/blob/v0.1.0/docs/install.md#upgrade-or-roll-back). An expired or frozen light client requires the separate [incident runbook](https://github.com/akash-network/node/blob/main/contracts/solana/docs/production-deployment.md#incident-runbooks).
