---
categories: ["Node Operators", "Akash Sink"]
tags: ["Akash Sink", "Reporter", "Solana", "Validators"]
weight: 1
title: "Run an Akash Sink reporter"
linkTitle: "Reporter"
description: "Configure independent nodes and a software key, preview Sink outcomes, and activate a reporter through governance"
---

A reporter verifies finalized Solana outcomes and reports them on Akash. Reporters can also veto conflicting refunds and finalize eligible refunds. They cannot mint tokens on Solana.

These instructions use the independently released reporter image from node, against an existing compatible bridge.

## Requirements

- Your own Akash node with current blocks and the expected chain ID.
- Your own replaying Solana node with transaction history, on the expected genesis.
- A dedicated Akash reporter account with an owner-only software key.
- The reviewed reporter image; its runtime is included.

Keep Solana history for the outages you need to recover from plus the challenge period. Reporters must use independent observation sources. Finalized commitment does not make a dishonest RPC response trustworthy.

## Install and configure

Complete [Docker Compose setup](/docs/node-operators/akash-sink#docker-compose-setup) with `ROLE=reporter`. Run the following host commands from `/opt/akt-reporter`.

Use either a new key or your existing Akash wallet.

### Create a new key

```bash
docker run --rm --user "$(id -u akt-reporter):$(id -g akt-reporter)" \
  --mount type=bind,src=/etc/akt-reporter,dst=/keys \
  ghcr.io/akash-network/akt-reporter:$VERSION keys create --out /keys/reporter.key
```

Only the public Akash address is printed. Back up the key securely. It is an unencrypted
software key, readable only by the service user (`0600`); use a dedicated key,
never a validator consensus key. No KMS or custom signer is required.

Continue at [Configure the reporter](#configure-the-reporter).

### Use an existing Akash wallet

Use the native Akash node CLI, `akash`, on your secure workstation for this
one-time export. It does not need a running node. The commands below use
`akash keys`; CLI versions that export only encrypted armor cannot produce a
reporter key file directly.

#### Recover the same account

If the wallet is already in an Akash CLI keyring, skip recovery. Set `KEY_HOME`,
`KEY_BACKEND` and `KEY_NAME` below to that keyring and key.

Otherwise, recover from your existing mnemonic into a separate keyring:

```bash
KEY_HOME="$HOME/.akash-reporter-export"
KEY_BACKEND=file
KEY_NAME=existing-reporter
HD_PATH="m/44'/118'/0'/0/0"

akash keys add "$KEY_NAME" --recover --no-backup \
	--hd-path "$HD_PATH" --home "$KEY_HOME" --keyring-backend "$KEY_BACKEND"
```

Enter the mnemonic at the prompt. Use your wallet's actual derivation path and
account index; the example selects the first standard Cosmos account. If the
wallet uses a BIP39 passphrase, add `--interactive` and enter that passphrase.
The keyring encryption password is separate from the BIP39 passphrase.

Print the recovered address:

```bash
akash keys show "$KEY_NAME" --address \
	--home "$KEY_HOME" --keyring-backend "$KEY_BACKEND"
```

Compare it with the address in your existing wallet. Continue only when they
match. Recovery does not create a new on-chain account or move funds.

#### Export and install the private key

Export directly to a new owner-only file. This prints no private key to the
terminal and refuses to overwrite an existing file:

```bash
(
	umask 077
	set -o noclobber
	akash keys export "$KEY_NAME" --unsafe --unarmored-hex --yes \
		--home "$KEY_HOME" --keyring-backend "$KEY_BACKEND" \
		> "$KEY_HOME/reporter.key"
)
```

The result is 64 lowercase hex characters without `0x`. The reporter accepts
this raw private key, not the mnemonic or an encrypted keyring export.

Transfer `reporter.key` to `/root/reporter.key` on the reporter host over SSH.
As the host administrator, install it into the empty service key path:

```bash
test ! -e /etc/akt-reporter/reporter.key &&
	install -o akt-reporter -g akt-reporter -m 0600 \
		/root/reporter.key /etc/akt-reporter/reporter.key

docker compose run --rm reporter keys address --key-file /run/keys/key
```

Confirm the printed address still matches your wallet. Set `reporter` to that
address and `keyFile` to `/run/keys/key` in the config.

Keep a secure backup and remove temporary transfer copies.

### Configure the reporter

Fund the verified address with AKT for fees and share it with the governance coordinator.

Edit `/etc/akt-reporter/config.json`. Set your independent RPC endpoints, deployed program and mint, verified reporter address, `akashChainId` and `solanaGenesisHash`. Keep the container key path `keyFile=/run/keys/key`; `.env` maps the host file to that path.

For an isolated deployment, set `OPERATOR_NETWORK=testnet` in `.env` and use its chain ID and genesis hash. Use the same network in the check below:

```bash
docker compose run --rm reporter keys address --key-file /run/keys/key
docker compose run --rm reporter check --config /etc/akt/config.json --network mainnet
```

Use `--network testnet` for a test deployment. Check validates configuration without loading the key or contacting a node. Run only one signing process per account. [External signers](https://github.com/akash-network/node/blob/main/contracts/solana/docs/reporter.md#key-custody) remain optional; software signing needs no KMS.

## Preview before broadcasting

Start in preview mode:

```bash
docker compose up -d
docker compose logs -f reporter
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
BASE=https://github.com/akash-network/node/releases/download/reporter%2Fv$VERSION
curl -fLO "$BASE/akt-reporter-broadcast.yaml"
sha256sum --ignore-missing --check "akt-reporter_${VERSION}_checksums.txt"
mv akt-reporter-broadcast.yaml broadcast.yaml
docker compose -f docker-compose.yaml -f broadcast.yaml up -d
docker compose -f docker-compose.yaml -f broadcast.yaml logs -f reporter
```

Keep both Compose files in subsequent restart/upgrade commands. Omit the override to return to preview. Verify a real signed report, its committed receipt, the remaining fee balance, and the expected settlement. Configuration validation alone does not prove signer access or transaction delivery.

## Monitor and recover

Page on conflicting outcomes, unavailable audits, stale nodes, signer errors, and light-client changes. Reporters inspect disputes even when a transfer is already minted or refunded. See the [operations guide](https://github.com/akash-network/node/blob/main/contracts/solana/docs/reporter.md#alerts).

Refunds require the recorded challenge deadline and all native payment conditions. Standard builds enforce a minimum of 72 hours. If evidence cannot be checked before a deadline, escalate through governance or the refund pause; do not fabricate an outcome.

After a restart, confirm the same chain and program identities, retained votes, and balances. Follow [service recovery](/docs/node-operators/akash-sink#upgrade-or-roll-back) when changing releases.
