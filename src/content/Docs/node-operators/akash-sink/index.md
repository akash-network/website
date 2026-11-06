---
categories: ["Node Operators"]
tags: ["Akash Sink", "Solana", "Reporter", "Relayer", "Validators"]
weight: 6
title: "Operate Akash Sink services"
linkTitle: "Akash Sink"
description: "Run relayers and independent reporters for an existing Akash Sink bridge"
---

Relayers and reporters keep transfers moving between Akash and Solana. These guides cover operating services against an existing bridge.

| Task                                               | Guide                                                      |
| -------------------------------------------------- | ---------------------------------------------------------- |
| Send AKT and follow a transfer                     | [Bridge with akt](/docs/developers/akt/sink)               |
| Submit Akash headers and transfer proofs to Solana | [Run a relayer](/docs/node-operators/akash-sink/relayer)   |
| Verify finalized outcomes and report them on Akash | [Run a reporter](/docs/node-operators/akash-sink/reporter) |

## Service roles

| Service  | Responsibility                                                                             | Credentials                                                       |
| -------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| Relayer  | Upload signed Akash headers and proofs that Solana verifies                                | A funded Solana payer and the configured header-update permission |
| Reporter | Verify finalized Solana outcomes and submit reports, vetoes, and eligible refunds on Akash | A governance-selected Akash account and external signer           |

Neither service holds user funds. Validators continue producing their normal consensus signatures; the Solana light client verifies those signatures. Run services separately from validator hosts.

A relayer cannot change the proven recipient or amount. A reporter cannot mint on Solana. Reporters must use independent nodes and verify finalized outcomes before signing. If a service is offline, transfers can wait even while both chains continue producing blocks.

## Before starting a service

Obtain the reviewed service release and network manifest. Confirm the Akash chain ID, Solana genesis, program, mint, artifact checksums, and the service version supported by that bridge. Production release values remain TBD at launch.

A relayer needs a dedicated payer funded with SOL and persistent journals. A reporter needs an external signer, AKT for fees, and governance admission to the active reporter policy. Keep signing keys outside release directories.

Set `RPC` to the Akash node's CometBFT endpoint and query the active configuration with the matching native binary:

```bash
akash query sink params --node "$RPC" --output json
akash query sink reporters 0 --node "$RPC" --output json
akash query sink state --node "$RPC" --output json
```

`params` returns configuration, `reporters 0` returns the current policy, and `state` returns totals, native epoch usage, and the refund candidate. The [pending akt CLI](/docs/developers/akt/sink) exposes these queries too.

## Reporter quorum and refunds

Reporter quorum is `ceil(member count × threshold)`. The required vote count must exceed two thirds of the members. Seven reporters with a threshold of `0.70` require five votes. Query the active policy rather than assuming a version or fixed reporter count.

A confirmed Solana void becomes refund-pending. Payment still needs challenge maturity, current authorization, no hold, enabled refunds, queue priority, and available epoch capacity. Standard builds require at least 72 hours. A refund candidate or passed deadline does not prove payment.

## Monitor and restart

Monitor light-client age, RPC freshness, fee balances, transfer progress, and service alerts. Preserve the same network identities and durable service state across restarts. Do not restore older journals after transactions have been sent.

The [relayer guide](/docs/node-operators/akash-sink/relayer#monitor-and-recover) covers proof and transaction recovery. The [reporter guide](/docs/node-operators/akash-sink/reporter#monitor-and-recover) covers unavailable evidence, conflicting outcomes, and signer failures.

## Related guides

- [How Akash Sink works](/docs/learn/akash-sink)
- [Bridge with the pending akt CLI](/docs/developers/akt/sink)
- [Use the portal](/docs/learn/akash-sink/portal)
