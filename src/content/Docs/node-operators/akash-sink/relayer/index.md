---
categories: ["Node Operators", "Akash Migrate"]
tags: ["Akash Migrate", "Relayer", "Solana", "Validators"]
weight: 2
title: "Run an Akash Migrate relayer"
linkTitle: "Relayer"
description: "Install and operate a relayer against an existing Akash and Solana deployment"
---

A relayer uploads Akash block headers and transfer proofs to Solana. Solana verifies the signatures and proofs before minting or voiding a transfer. The relayer needs a funded payer, but cannot change the proven recipient or amount.

These instructions use the independently released relayer image from node, against an existing compatible bridge.
See [service roles and prerequisites](/docs/node-operators/akash-sink).

## Requirements

- An Akash RPC with the expected chain ID, current blocks, and the state history needed to construct proofs.
- A Solana RPC on the expected genesis, with sufficient transaction history for recovery.
- A dedicated Solana payer funded for fees and temporary account rent.
- A persistent state directory used by only one running relayer with that payer.
- The reviewed relayer image; its runtime and header encoder are included.

Follow the [node and history requirements](https://github.com/akash-network/node/blob/relayer/v0.1.3/contracts/solana/docs/operator-releases.md#before-you-start). Pruned history can prevent proof generation or recovery.

## Install and configure

Complete [Docker Compose setup](/docs/node-operators/akash-sink#docker-compose-setup) with `ROLE=relayer` and `VERSION=0.1.3`. Run the following host commands from `/opt/akt-relayer`.

Use either a new key or your existing Solana keypair.

### Create a new key

```bash
docker run --rm --user "$(id -u akt-relayer):$(id -g akt-relayer)" \
  --mount type=bind,src=/etc/akt-relayer,dst=/keys \
  ghcr.io/akash-network/akt-relayer:$VERSION keys create --out /keys/payer-keypair.json
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

docker compose run --rm relayer keys address --key-file /run/keys/key
```

Confirm the printed address matches your existing Solana wallet. Set
`payerKeyFile` to `/run/keys/key` in the config.

Keep a secure backup and remove temporary transfer copies.

### Configure the relayer

Fund the verified address with SOL. Obtain header-update permission when relaying is closed.

Edit `/etc/akt-relayer/config.json` using the populated mainnet configuration:

- `akashRpc`, `akashChainId`, `solanaRpc`, and `solanaGenesisHash`.
- The deployed `programId`.
- `payerKeyFile`, set to `/run/keys/key`; `.env` maps the host key to this read-only path.
- `headerEncoder`, set to `/opt/akt/bin/akt-header-encoder`.
- `stateDir`, set to `/data`; `.env` maps `/var/lib/akt-relayer` into the container. Retain it across releases.

The access manager and current light client are discovered from the bridge. Leave `lightClientProgram` unset to follow the bridge pin, or set the reviewed address to stop on a pin change. For an isolated deployment, set `OPERATOR_NETWORK=testnet` in `.env` and use its chain ID and genesis hash. Keep state outside the
release directory, set an explicit spending budget and alert on payer balance. The [configuration guide](https://github.com/akash-network/node/blob/relayer/v0.1.3/contracts/solana/docs/operator-configuration.md) lists the remaining options.

Check the configuration from the installed release:

```bash
docker compose run --rm relayer keys address --key-file /run/keys/key
docker compose run --rm relayer check --network mainnet --config /etc/akt/config.json
```

Use `--network testnet` when `.env` selects testnet. Configuration check does not read the payer key. Startup also checks the live chain and program identities.

## Start the service

The relayer submits transactions in its normal run mode:

```bash
docker compose up -d
docker compose logs -f relayer
```

Confirm the startup identity and `relayer-access` logs. The normal run mode broadcasts transactions; it is not a preview. Headers advance when a proof needs a newer height or when the refresh threshold is reached. With `refreshFraction: 0.2` and a 14-day trusting period, an idle client can wait about 2.8 days between refreshes. A restart does not force an otherwise unnecessary update. Confirm pending transfers resolve and the client stays active. Header updates require the configured relayer role or open-relaying setting; running the process alone does not grant those rights. Read the `relayer-access` output and [relayer operations guide](https://github.com/akash-network/node/blob/relayer/v0.1.3/contracts/solana/docs/operators.md).

Public RPC rate limits or unavailable blocks are operational failures, not evidence of a void. The relayer release reads Solana time from the Clock sysvar; use a current release rather than bypassing client-expiry checks.

## Monitor and recover

Monitor light-client age, payer balance, progress, and JSON alerts. Investigate `relay-budget-exhausted`, `relay-discovery-failed`, `relay-unbacked-settlement`, `light-client-mismatch`, and repeated retry failures. See the [operations guide](https://github.com/akash-network/node/blob/relayer/v0.1.3/contracts/solana/docs/operators.md).

Keep the same journals and spend ledger after restart. Do not delete a running payer lock, reset a budget to hide repeated failures, or restore an older journal after transactions were sent. Missing transaction history can block recovery even when a permanent Solana outcome exists.

Use the [service upgrade and recovery procedure](/docs/node-operators/akash-sink#upgrade-or-roll-back). An expired or frozen light client requires the separate [incident runbook](https://github.com/akash-network/node/blob/launch/solana-mainnet-20261109/contracts/solana/docs/deploy-program.md#incident-runbooks).
