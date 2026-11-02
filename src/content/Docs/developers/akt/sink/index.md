---
categories: ["Developers", "akt CLI"]
tags: ["akt", "CLI", "Akash Sink", "Solana", "AKT"]
weight: 4
title: "Send AKT to Solana"
linkTitle: "AKT to Solana"
description: "Send AKT from Akash to Solana with akt tx sink deposit, follow transfers and refunds, and run the reporter, guardian and governance sink commands"
---

Send AKT from Akash to Solana with `akt tx sink deposit`, then follow the transfer by its composite ID. The same amount is minted on Solana; transfers are one way.

These commands use the composite-ID sink schema. The node, CLI and services must come from the same compatible release. Run `akt query sink --help` and `akt tx sink --help` to check your binary.

## Before You Start

You need an Akash signing account, AKT for the deposit and network fee, and a Solana wallet address you control. See [Contexts & Configuration](/docs/developers/akt/configuration).

Read the current parameters and usage:

```bash
akt query sink state -o json
akt query sink account <akash-address> -o json
```

`params.deposits_enabled` controls deposits. Every amount uses an SDK Coin with denomination `uakt`. The positive limits are `min_amount_per_transfer`, `max_amount_per_transfer`, `max_amount_per_account_epoch`, `max_amount_per_epoch` and `max_refund_per_epoch`. Send and refund epochs are separate UTC days. There are no per-account count quotas.

## Send AKT to Solana

```bash
akt tx sink deposit <solana-address> 10akt
akt tx sink deposit <solana-address> 10000000uakt
```

The CLI accepts exact AKT decimals or whole `uakt`; it rejects other denominations and never rounds. A successful deposit locks the AKT and creates an explicit `STATUS_TRANSFER_PENDING` settlement.

A deposit must be the transaction's sole message and must be signed by its sender. The ante check binds that exact message to the keeper operation. The bank restriction allows only the matching escrow transfer; authz, contract calls and unrelated bank sends cannot bypass it.

`MsgSinkResponse` contains `{owner, height, sequence}`. Its text form is `owner/height/sequence`, for example:

```text
akash1zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3vx69t4/9001/42
```

Height is the creating block. Sequence starts at 1 in each block and is shared by all owners. Keep all three components; sequence alone does not identify a transfer. Do not infer an ID from totals. If the broadcast returns before inclusion, query the transaction or the sender's transfer history.

## Follow a Transfer

```bash
akt query sink transfer '<owner>/<height>/<sequence>' -o json
akt query sink transfers --owner <akash-address> --limit 50 -o json
```

The response contains the ID, immutable recipient and amount, settlement and governance void-order flag.

| Financial status          | Meaning                                                                     |
| ------------------------- | --------------------------------------------------------------------------- |
| `STATUS_TRANSFER_PENDING` | AKT is locked; settlement is not yet authorized.                            |
| `STATUS_MINTED`           | A reporter quorum or governance confirmed the mint; backing remains locked. |
| `STATUS_REFUND_PENDING`   | A Solana void is confirmed; the refund has not been paid.                   |
| `STATUS_REFUNDED`         | The original sender has received the refund.                                |

`HOLD_VETO` or `HOLD_CONFLICT` is separate from the financial status. A minted or refunded transfer can acquire a conflict hold. Use the dispute query to find these records; filtering only unpaid transfers would miss them.

```bash
akt query sink disputes --limit 50 -o json
akt query sink transfers --owner <akash-address> --status STATUS_REFUND_PENDING -o json
```

## Paginate at One Height

List queries accept `--page-key`, `--limit` and `--reverse`. They reject offset and total-count pagination. The default limit is 100 and the maximum is 500.

```bash
akt query sink transfers --height <committed-height> --limit 100 -o json
akt query sink transfers --height <same-height> --limit 100 --page-key '<next_key>' -o json
```

Keep the height and filters unchanged across a pass. A pruned height is a failed pass, not an empty page. Unfiltered history is chronological by height and sequence, so a newly active owner cannot appear behind a completed discovery cursor. Long-running consumers retain the last processed chronological identity when a page has no next key.

`state` returns parameters, financial totals, the current reporter policy, current send/refund usage and `refund_head`. `account` returns lifetime sending and current-epoch sending amounts. Queries normalize stale epoch usage without changing storage; genesis export preserves the raw stamps.

## Refunds

```bash
akt tx sink finalize-refund '<owner>/<height>/<sequence>'
```

Anyone may pay the fee for this message. The funds always go to the original owner, exactly once. Payment requires a confirmed Solana void, an elapsed challenge window, current authorization, no hold, enabled refunds, queue priority and room under the refund epoch cap. The release challenge floor is 72 hours.

`refund_head` identifies the oldest eligible-policy candidate. Queue membership alone does not prove that the challenge has matured or capacity is available. Governance-confirmed refunds survive reporter rotation. Quorum-authorized refunds need the current policy. Refunding does not restore the sender's daily sending capacity.

## Reporter Commands

```bash
akt tx sink report-outcome '<owner>/<height>/<sequence>' <policy-version> <round> minted <slot> <solana-signature> --from reporter
akt tx sink veto-void '<owner>/<height>/<sequence>' 'finalized Solana evidence disagrees' --from reporter
```

Read the policy version from `state` and the round from `transfer`. The report must match both. The signature is the base58 Solana transaction signature. SDK validation checks its format; the reporter must independently verify the transaction and finality.

Votes are deduplicated by reporter, outcome and policy version. A changed signature for the same tuple does not add a vote. An opposite outcome remains evidence of a conflict.

See [Run an Akash Sink Reporter](/docs/node-operators/akash-sink/reporter) for service setup.

## Pause Guardian

```bash
akt tx sink guardian-pause --deposits --from guardian
akt tx sink guardian-pause --refunds --from guardian
akt tx sink guardian-pause --deposits --refunds --from guardian
```

The configured guardian can only turn these switches off. Governance controls re-enabling them.

## Governance Actions

The authority is the governance module. Generate the sink message, inspect it, then include it in a governance proposal using the network's normal proposal workflow. These commands do not grant an ordinary signing account governance authority.

```bash
akt query sink state -o json | jq '.params' > sink-params.json
akt tx sink update-params sink-params.json --generate-only
akt tx sink request-void '<owner>/<height>/<sequence>' --generate-only
akt tx sink restart-transfer '<owner>/<height>/<sequence>' <expected-round> 'refresh disputed evidence' --generate-only
akt tx sink confirm-mint '<owner>/<height>/<sequence>' <expected-round> <slot> <solana-signature> 'verified mint' --generate-only
akt tx sink confirm-void '<owner>/<height>/<sequence>' <expected-round> <slot> <solana-signature> 'verified void' --generate-only
```

Restart and both confirmations require the expected settlement round. A proposal for an older round fails instead of overwriting a newer governance answer. Each successful resolution advances the round.

- Restart clears authorization and holds on an unpaid transfer so reporters can vote again.
- Confirm-mint records mint evidence for an unpaid or minted transfer. It cannot reverse a paid refund.
- Confirm-void on an unpaid transfer or conflict-held minted transfer requires a void order and starts a fresh challenge window. Confirm-void on an already-refunded transfer resolves the dispute without paying again.

A void order is an instruction to obtain a Solana void; it is not evidence that Solana has voided the transfer and does not authorize a refund by itself.

Parameter updates replace the complete parameter object. Changing reporter membership or the effective threshold creates a new policy version. Historical policies and paid-state evidence remain. Lowering the refund cap scans unpaid records and fails if one would no longer fit; existing challenge deadlines are unchanged.

## Troubleshooting

- A rejected deposit leaves the amount in the sender's wallet; the network fee may still be charged.
- An account or aggregate send-cap error requires a smaller amount or the next UTC day. There is no outstanding-count quota to clear.
- A pending Solana mint can wait for a cap, pause, current light-client header or valid proof. It does not need an Akash sending epoch to end.
- A stale policy requires fresh reporter authorization; a stale governance round requires a new proposal based on the current settlement.
- A conflict hold requires governance review. Do not repeat the deposit to fix it.
- A passed challenge deadline does not prove payment. Read `STATUS_REFUNDED`.

## Related Resources

- [Akash Sink](/docs/learn/akash-sink)
- [Use the Akash Sink Portal](/docs/learn/akash-sink/portal)
- [Queries & Transactions](/docs/developers/akt/queries-and-transactions)
- [Commands Reference](/docs/developers/akt/commands-reference#sink-akt-to-solana)
