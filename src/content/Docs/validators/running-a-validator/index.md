---
title: "Running a Validator"
linkTitle: "Running a Validator"
weight: 1
description: Akash Validator Nodes enables interactions with the network, validation of transactions, and participation in the consensus process.
categories: ["Validators"]
tags: ["Helm"]
---

## What is an Akash Validator?

Validators are responsible for committing new blocks to the blockchain through voting. A validator's stake is slashed if they become unavailable or sign blocks at the same height. Please read about [Sentry Node Architecture](https://forum.cosmos.network/t/sentry-node-architecture-overview/454) to learn how to protect your node from DDOS attacks and to ensure high-availability on mainnet.

## Akash Validator General Info

### Validator Hardware Requirements and Recommendations

- CPU - 4/8 Core
- Memory - 8/16GB
- Disk - SSD or NVMe
  - Size - 512GB or larger

### Active Validator Set

- 100 (current) which was extended from 85 recently
- Tokens to stake to be active = more than last active validator
- Check with the command `$votingpower` in the Akash Discord server's > validators-status channel for current requirements to get into the active validator set
- You can stake by yourself or from external wallets within your community

### Akash Node Build

Before setting up your validator node, make sure you've already gone through the[ Full Node Setup ](/docs/akash-nodes/akash-node-cli-build/)guide.

## Create Your Validator

### Validator Account and Network Configuration

#### Validator Account

Prior to validator creation we must create an Akash account for validator use. Use the steps covered in this [guide](/docs/deployments/akash-cli/installation/) to create this account. _**NOTE -**_ only the \`Create an Account\` and \`Fund your Account\` sections of this guide need to be completed for this purpose.

#### Network Configuration

Configure settings to communicate with the Akash blockchain as follows:

```
AKASH_NET="https://raw.githubusercontent.com/akash-network/net/main/mainnet"
export AKASH_CHAIN_ID="$(curl -s "$AKASH_NET/chain-id.txt")"
```

### Validator Creation

Your `akashvalconspub` can be used to create a new validator by staking tokens. You can find your validator pubkey by running:

```bash
provider-services tendermint show-validator
```

The file that stores this private key lives at `~/.akash/config/priv_validator_key.json`. To create your validator, just use the following command.

> Note that in the output of this command your \`akashvaloper\` address will be revealed. Note this address for future use including the verification steps later in this guide.

```bash
provider-services tx staking create-validator \
  --amount=1000000uakt \
  --pubkey="$(akash tendermint show-validator)" \
  --moniker="$AKASH_MONIKER" \
  --chain-id="$AKASH_CHAIN_ID" \
  --commission-rate="0.10" \
  --commission-max-rate="0.20" \
  --commission-max-change-rate="0.01" \
  --min-self-delegation="1" \
  --gas="auto" \
  --gas-prices="0.0025uakt" \
  --gas-adjustment=1.5 \
  --from="$AKASH_KEY_NAME"
```

::: tip When specifying commission parameters, the `commission-max-change-rate` is used to measure % _point_ change over the `commission-rate`. E.g. 1% to 2% is a 100% rate increase, but only 1 percentage point. :::

::: tip `min-self-delegation` is a stritly positive integer that represents the minimum amount of self-delegated voting power your validator must always have. A `min-self-delegation` of 1 means your validator will never have a self-delegation lower than `1000000uakt` :::

You can confirm that you are in the validator set by using a third party explorer for the testnet you are joining.

## Edit Validator Description

You can edit your validator's public description. This info is to identify your validator, and will be relied on by delegators to decide which validators to stake to. Make sure to provide input for every flag below. If a flag is not included in the command the field will default to empty (`--moniker` defaults to the machine name) if the field has never been set or remain the same if it has been set in the past.

The `$AKASH_KEY_NAME` specifies the key for the validator which you are editing. If you choose to not include certain flags, remember that the `--from` flag must be included to identify the validator to update.

The `--identity` can be used as to verify identity with systems like Keybase or UPort. When using with Keybase `--identity` should be populated with a 16-digit string that is generated with a [keybase.io](https://keybase.io) account. It's a cryptographically secure method of verifying your identity across multiple online networks. The Keybase API allows explorers to retrieve your Keybase avatar. This is how you can add a logo to your validator profile.

```bash
provider-services tx staking edit-validator
  --new-moniker="$AKASH_MONIKER" \
  --website="https://akash.network" \
  --identity=6A0D65E29A4CBC8E \
  --details="The SUPERCLOUD IS HERE!" \
  --chain-id="$AKASH_CHAIN_ID" \
  --gas="auto" \
  --gas-prices="0.0025uakt" \
  --gas-adjustment=1.5 \
  --from="$AKASH_KEY_NAME" \
  --commission-rate="0.10"
```

**Note**: The `commission-rate` value must adhere to the following invariants:

- Must be between 0 and the validator's `commission-max-rate`
- Must not exceed the validator's `commission-max-change-rate` which is maximum

  % point change rate **per day**. In other words, a validator can only change

  its commission once per day and within `commission-max-change-rate` bounds.

## View Validator Description

View the validator's information with this command:

```bash
provider-services query staking validator $AKASH_VALIDATOR_ADDRESS
```

## Track Validator Signing Information

In order to keep track of a validator's signatures in the past you can do so by using the `signing-info` command:

```bash
provider-services query slashing signing-info $AKASH_VALIDATOR_PUBKEY \
  --chain-id="$AKASH_CHAIN_ID"
```

## Unjail Validator

When a validator is "jailed" for downtime, you must submit an `Unjail` transaction from the operator account in order to be able to get block proposer rewards again (depends on the zone fee distribution).

```bash
provider-services tx slashing unjail \
    --from="$AKASH_KEY_NAME" \
    --chain-id="$AKASH_CHAIN_ID"
```

## Confirm Your Validator is Running

### Ensure Validator Sync

- Ensure that the field \`catching_up\` is false and that the latest block corresponds to the current block of the blockchain

```
akash status
```

#### Example Output when Validator is in Sync

```
{"NodeInfo":{"protocol_version":{"p2p":"8","block":"11","app":"0"},"id":"136d67725800cb5a8baeb3e97dbdc3923879461e","listen_addr":"tcp://0.0.0.0:26656","network":"akashnet-2","version":"0.34.19","channels":"40202122233038606100","moniker":"cznode","other":{"tx_index":"on","rpc_address":"tcp://0.0.0.0:26657"}},"SyncInfo":{"latest_block_hash":"4441B6D626166822979597F252B333C131C1DCB2F0467FF282EF0EAA3936B8CC","latest_app_hash":"1ED64AE88E5CFD53651CD2B6B4E970292778071C8FBE23289393B4A06F57975F","latest_block_height":"8284780","latest_block_time":"2022-10-31T15:28:17.565762161Z","earliest_block_hash":"E25CE5DD10565D6D63CDA65C8653A15F962A4D2960D5EC45D1DC0A4DE06F8EE3","earliest_app_hash":"19526102DDBCE254BA71CC8E44185721D611635F638624C6F950EF31D3074E2B","earliest_block_height":"5851001","earliest_block_time":"2022-05-12T17:51:58.430492536Z","catching_up":false},"ValidatorInfo":{"Address":"354E7FA2BF8C5B9C0F1C80F1C222818EC992D377","PubKey":{"type":"tendermint/PubKeyEd25519","value":"1+dVHZD7kfqnDU6I+bKbCv4ZE1LPieyMH+mwsOowhqY="},"VotingPower":"0"}}
```

### Confirm Validator's Staking Status

#### Template

```
akash query staking validator <akashvaloper-address>
```

#### Example

```
akash query staking validator akashvaloper16j3ge9lkpgtdkzntlja08gt6l63fql60xdupxq
```

#### Example Output

- Status will display as \`BOND_STATUS_UNBONDED\` after initial build

```
commission:
  commission_rates:
    max_change_rate: "0.010000000000000000"
    max_rate: "0.200000000000000000"
    rate: "0.100000000000000000"
  update_time: "2022-10-31T15:24:25.040091667Z"
consensus_pubkey:
  '@type': /cosmos.crypto.ed25519.PubKey
  key: 1+dVHZD7kfqnDU6I+bKbCv4ZE1LPieyMH+mwsOowhqY=
delegator_shares: "1000000.000000000000000000"
description:
  details: ""
  identity: ""
  moniker: cznode
  security_contact: ""
  website: ""
jailed: false
min_self_delegation: "1"
operator_address: akashvaloper1jy7ej9t6r8q5dyjrst88nt9rjgkdltgx97wfvd
status: BOND_STATUS_UNBONDED
tokens: "1000000"
unbonding_height: "0"
unbonding_time: "1970-01-01T00:00:00Z"
```

### Active Set Confirmation

Your validator is active if the following command returns anything

> _**NOTE**_ - this command will only display output of your validator is in the active set

```bash
provider-services query tendermint-validator-set | grep "$(provider-services tendermint show-validator)"
```

You should now see your validator in one of the Akash Testnet explorers. You are looking for the `bech32` encoded `address` in the `~/.akash/config/priv_validator.json` file.

## Halting Your Validator

When attempting to perform routine maintenance or planning for an upcoming coordinated upgrade, it can be useful to have your validator systematically and gracefully halt. You can achieve this by either setting the `halt-height` to the height at which you want your node to shutdown or by passing the `--halt-height` flag to `provider-services`. The node will shutdown with a zero exit code at that given height after committing the block.

## Common Problems

### Problem #1: My validator has `voting_power: 0`

Your validator has become jailed. Validators get jailed, i.e. get removed from the active validator set, if they do not vote on `500` of the last `10000` blocks, or if they double sign.

If you got jailed for downtime, you can get your voting power back to your validator. First, if `provider-services` is not running, start it up again. If you are running `systemd` this will be different:

```bash
provider-services start
```

Wait for your full node to catch up to the latest block. Then, you can [unjail your validator](#unjail-validator)

Lastly, check your validator again to see if your voting power is back.

```bash
provider-services status
```

You may notice that your voting power is less than it used to be. That's because you got slashed for downtime!

### Problem #2: My `provider-services` crashes because of `too many open files`

The default number of files Linux can open (per-process) is `1024`. `aprovider-services` is known to open more than `1024` files. This causes the process to crash. A quick fix is to run `ulimit -n 4096` (increase the number of open files allowed) and then restart the process with `provider-services start`. If you are using `systemd` or another process manager to launch `provider-services` this may require some configuration at that level. See the [`systemd` configuration doc](https://github.com/akash-network/docs/tree/1c9232aaec2197efbf4532e8883a247566cf9e28/guides/node/systemd.md) for details on how to configure `systemd` to aleviate this issue.
