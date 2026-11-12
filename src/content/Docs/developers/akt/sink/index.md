---
categories: ["Developers", "akt CLI"]
tags: ["akt", "CLI", "Akash Migrate", "Solana", "AKT"]
weight: 4
title: "Send AKT to Solana"
linkTitle: "AKT to Solana"
description: "Deposit AKT, query composite transfers, follow refunds, and use akt Sink governance proposal helpers"
---

Send AKT from Akash to Solana with `akt tx sink deposit`, then follow the transfer by its `owner/height/sequence` ID. The same amount is minted on Solana. Transfers are one way. Akash Migrate uses the native `sink` module, which keeps its name in CLI commands.

These commands are verified against [akt v1.1.1](https://github.com/akash-network/akt/releases/tag/v1.1.1). Check `akt version`; older installations may not include Sink. Use the [mainnet addresses and releases](/docs/learn/akash-migrate/mainnet) when configuring a client. For services that process transfers, see [relayer and reporter operation](/docs/node-operators/akash-migrate).

## Contents

- [Read the current configuration](#read-the-current-configuration)
- [Send AKT](#send-akt)
- [Follow a transfer](#follow-a-transfer)
- [Paginate at one height](#paginate-at-one-height)
- [Refunds](#refunds)
- [Reporter commands](#reporter-commands)
- [Pause guardian](#pause-guardian)
- [Governance actions](#governance-actions)

## Read the current configuration

Configure an Akash context and a funded signing account using [Contexts and configuration](/docs/developers/akt/configuration). Use a Solana wallet address you control. For a new CLI configuration, create the network before its context:

```bash
akt context network create mainnet --template mainnet
akt context create sink-mainnet --network mainnet --set-current
```

If the network or context already exists, select your existing mainnet context instead. Confirm its chain is `akashnet-2` before signing.

```bash
akt query sink params -o json
akt query sink reporters -o json
akt query sink state -o json
akt query sink account <akash-address> -o json
```

`params` returns the parameter object, including `enabled`, transfer limits, and the challenge duration. `reporters` returns the current policy; pass a version number or `all` to inspect retained policies. `state` returns totals, native epoch usage, and `refund_head`. Parameters and reporter policies are no longer fields of `state`.

Sending and refund quotas use Akash's existing `day` epoch schedule. They do not reset at a hardcoded UTC midnight. The challenge window is a separate duration. Read the current limits before depositing.

## Send AKT

```bash
akt tx sink deposit <solana-address> 1akt --from <sender-key>
# The same amount in base units:
akt tx sink deposit <solana-address> 1000000uakt --from <sender-key>
```

Choose one command. This example sends **1 AKT**. The CLI accepts exact AKT decimals or whole `uakt`; it never rounds. You pay the Akash transaction fee separately. The deposit must be the transaction's sole message, signed by its sender.

A broadcast response alone does not prove inclusion. Save its transaction hash, then query the committed receipt:

```bash
akt query tx <akash-transaction-hash> -o json
```

Wait for inclusion and require execution code `0`. A failed transaction does not create a deposit. After successful inclusion, obtain the complete ID from the transaction response or your transfer history. The ID contains the sender, creating block height, and sequence within that block. Sequence starts at 1 each block and is shared across owners. Sequence alone is not a transfer ID.

Off-curve recipient vaults, including Squads vaults, must be allowed on both chains. See [recipient vault policy](/docs/learn/akash-migrate/mainnet#multisig-and-native-authorities). Do not use the token mint, program ID or token-account address as the recipient.

## Follow a transfer

```bash
akt query sink transfer '<owner>/<height>/<sequence>' -o json
akt query sink transfers <akash-address> --limit 50 -o json
akt query sink transfers <akash-address> refund-pending -o json
akt query sink disputes --limit 50 -o json
```

Owner and status filters are positional in `akt`. A status can also be used alone, for example `akt query sink transfers refund-pending`. The single-transfer response contains a `transfer` object with the ID, immutable record, financial status, and settlement evidence.

| Status                    | Meaning                                                           |
| ------------------------- | ----------------------------------------------------------------- |
| `STATUS_TRANSFER_PENDING` | AKT is locked; the outcome is not confirmed.                      |
| `STATUS_MINTED`           | Mint confirmed; its AKT backing remains locked.                   |
| `STATUS_VOIDED`           | Governance requested a void; Solana confirmation is still needed. |
| `STATUS_REFUND_PENDING`   | Void confirmed; the refund has not been paid.                     |
| `STATUS_REFUNDED`         | The original sender received the refund.                          |

`HOLD_VETO` and `HOLD_CONFLICT` are separate from financial status. Disputes can include already minted or refunded transfers. A hold does not undo a completed mint or payment.

## Paginate at one height

```bash
akt query sink transfers --height <committed-height> --limit 50 -o json
akt query sink transfers --height <same-height> --limit 50 --page-key '<next_key>' -o json
```

Copy `pagination.next_key` without decoding or changing it. Keep height, owner, status, and direction unchanged across pages. Stop when the next key is empty. If the node pruned the height, restart the scan at an available committed height.

For `transfers`, `--offset` and `--page` require a specific financial status. Do not combine them with `--page-key`. Key pagination avoids depending on query-specific offset behavior.

## Refunds

```bash
akt tx sink finalize-refund '<owner>/<height>/<sequence>' --from <executor-key>
```

Anyone may submit this transaction and pay its fee. Funds always return to the original owner, exactly once. Reporters also finalize eligible refunds automatically.

Payment requires current authorization, no hold, elapsed challenge time, enabled refunds, queue priority, and available refund-epoch capacity. The standard build's challenge minimum is 72 hours. `refund_head` identifies a candidate; it does not prove the candidate is payable. Check `STATUS_REFUNDED` and the recipient balance to confirm payment.

## Reporter commands

```bash
akt tx sink report-outcome '<owner>/<height>/<sequence>' minted <slot> <solana-signature> --from reporter
akt tx sink veto-void '<owner>/<height>/<sequence>' 'finalized Solana evidence disagrees' --from reporter
```

The signer must be authorized. `report-outcome` reads the current policy version and settlement round before signing. `--policy-version` and `--round` override those values when needed. Read the policy through `reporters` and the round through `transfer`.

The signature is the base58 transaction signature for the finalized Solana outcome. Syntax validation does not verify that outcome. Reporters must check their own Solana node before signing. See [reporter operation](/docs/node-operators/akash-migrate/reporter).

## Pause guardian

```bash
akt tx sink guardian-pause deposits --from guardian
akt tx sink guardian-pause refunds --from guardian
akt tx sink guardian-pause all --from guardian
```

Choose the intended pause. The guardian can only disable deposits, refunds, or both. Governance re-enables them.

## Governance actions

The `akt` commands submit governance proposals containing the appropriate Sink message. They do not let an ordinary account execute a governance-only action directly.

Start a parameter proposal from the complete current object:

```bash
akt query sink params -o json > sink-params.json
# Edit the approved fields, preserving the rest.
akt tx sink propose-params sink-params.json --deposit <proposal-deposit> --from <proposer-key>
```

Unlike the native `akash query sink params` response, this `akt` command prints the parameter object directly. Do not extract `.params` from it.

Other proposal helpers are:

```bash
akt tx sink propose-void '<owner>/<height>/<sequence>' --deposit <proposal-deposit> --from <proposer-key>
akt tx sink propose-veto '<owner>/<height>/<sequence>' 'evidence disagrees' --deposit <proposal-deposit> --from <proposer-key>
akt tx sink propose-resolve '<owner>/<height>/<sequence>' restart 'reviewed retry' --deposit <proposal-deposit> --from <proposer-key>
akt tx sink propose-resolve '<owner>/<height>/<sequence>' confirm-mint 'verified mint' <slot> <solana-signature> --deposit <proposal-deposit> --from <proposer-key>
akt tx sink propose-resolve '<owner>/<height>/<sequence>' confirm-void 'verified void' <slot> <solana-signature> --deposit <proposal-deposit> --from <proposer-key>
```

Choose the required action and the deposit appropriate to the network. `propose-void` and `propose-resolve` read the current round; `--expected-round` can set it explicitly. A stale round is rejected when the proposal executes. Restarts and confirmations advance the round. A void order alone does not authorize a refund: the Solana outcome and native refund conditions still apply.

The native `akash` CLI has different command names and JSON output. These examples are for `akt`; do not interchange the two binaries in a command.

## Troubleshooting

- If a deposit exceeds a sending cap, reduce the amount or wait for the configured epoch. A refund does not restore sending capacity.
- If a Solana mint waits, check its pause, caps, light-client freshness, and relayer progress. It does not wait for an Akash epoch to end.
- If a transfer is held, investigate the evidence and governance path. Do not repeat the deposit to fix it.
- If the challenge deadline passed but funds have not returned, check every refund condition and the committed transaction.

## Related guides

- [How Akash Migrate works](/docs/learn/akash-migrate)
- [Use the portal](/docs/learn/akash-migrate/portal)
- [Relayers and reporters](/docs/node-operators/akash-migrate)
- [Command reference](/docs/developers/akt/commands-reference#sink-akt-to-solana)
