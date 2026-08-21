# AEP-88 Implementation Guide

Companion to [AEP-88](./README.md). This document specifies deployment procedure, verification
requirements, and operational preconditions. Normative contract and relayer behaviour is in the AEP
itself; this guide covers how a conforming deployment is carried out and proven.

## 1. Governance Deployment Sequence

Five proposals, in dependency order. Each depends on the outputs of the preceding step (code IDs from
the stores, addresses from the instantiates), so they cannot be bundled or submitted in parallel.

| #  | Proposal               | Content                                          | Produces        |
| -- | ---------------------- | ------------------------------------------------ | --------------- |
| 1a | Store `pyth-vaa`       | `MsgStoreCode`, `instantiate_permission: Nobody` | code ID         |
| 1b | Store `pyth-pro`       | `MsgStoreCode`, `instantiate_permission: Nobody` | code ID         |
| 2a | Instantiate `pyth-vaa` | Router verifier configuration                    | verifier address |
| 2b | Instantiate `pyth-pro` | Pairing, `update_fee`, `price_feed_id`           | feed address    |
| 3  | Register source        | `/akash.oracle.v2.MsgUpdateParams`, additive     | live feed       |

### 1.1 Store proposals must be split

Base64-encoding both wasm artifacts into a single store proposal produces a transaction of
approximately 903 KB against a `max_tx_bytes` of approximately 1 MB — roughly 86% of the limit, too
thin a margin to risk. Split proposals land at approximately 465–620 KB each.

### 1.2 Deposit staging

Submit with a partial deposit below `min_deposit`. The proposal lands in `DEPOSIT_PERIOD`, where its
rendered content can be reviewed on a block explorer before voting opens; a subsequent top-up triggers
the voting period.

This is recommended for any contract-bearing proposal. Proposal content is only fully legible once it
is on chain, and deposit period is the only phase in which a mistake can be abandoned rather than
voted down.

### 1.3 Oracle parameter proposal

`/akash.oracle.v2.MsgUpdateParams` replaces the entire params struct — any field omitted from the
proposal is reset, not preserved.

- Build the proposal from a fresh `akash q oracle params` dump taken immediately before submission.
- Re-dump and rebuild if any other oracle governance lands before the proposal is submitted.
- Append the new source to the existing `sources` array; do not replace the incumbent entry.
- Confirm the message type is `v2`. Duration-based parameters confirm the v2 shape; earlier networks
  used `v1` and the wrong type fails.

## 2. Artifact Verification

Testnet and mainnet builds may be cut from separate releases of the same source and therefore carry
different checksums. Do not assume parity.

Mainnet artifacts MUST be verified twice:

1. Against the release checksum manifest, before submitting the store proposal.
2. Against the on-chain code checksum, after the store proposal executes.

Note that release archive filenames may differ from development filenames in separator convention
(`pyth_vaa.wasm` versus `pyth-vaa.wasm`).

## 3. Deployment Verification

Three independent checks. All three are mandatory before a deployment is considered live; each
addresses a failure mode the others do not.

### 3.1 Governance lineage

Fetch the passed proposal and read the **message**, not the title. Confirm
`MsgInstantiateContract`, the code ID, the label, and the exact `msg` body against live chain state,
field by field.

Proposal titles are not authoritative. Copy-paste carryover between sequential proposals has produced
a title naming the wrong contract while the executed message was correct — an auditor working from
titles alone would draw the wrong conclusion about which contract was instantiated.

```
akash q gov proposal <id> -o json | jq '.messages[]'
```

> The proposal object is returned at the top level, with no `.proposal` wrapper. Use `jq '.messages[]'`,
> not `jq '.proposal.messages[]'`.

### 3.2 Config pairing

Query each contract's config and confirm the pairing is what governance approved:

- `pyth-pro` `get_config` → `pyth_vaa_contract` names the `pyth-vaa` instance created by the preceding
  proposal; `update_fee` and `price_feed_id` match the instantiate message.
- `pyth-vaa` `get_config` → router set index, router public keys, quorum, expected emitter chain, and
  expected emitter address match the approved configuration byte for byte.

### 3.3 Byte-code checksum

Confirm the on-chain code checksum for each code ID matches the release artifact, and that the code ID
each contract runs is the one governance stored.

## 4. Relayer Deployment Preconditions

### 4.1 Account public key bootstrap

A newly funded account exists on chain but has **no public key** until it authors a transaction. Gas
estimation fails on every update with a "no public key on chain" error, and it does **not** self-heal
on restart, because the signing client caches account state at connect time.

Before starting a relayer against a new wallet:

1. Send one outbound transaction from the key (a 1 uakt self-send suffices).
2. Confirm the key is registered:

```
akash q auth account <addr> -o json | jq '.account.pub_key'
```

> The field is nested under `.account`. `jq '.pub_key'` returns null regardless of state.

### 4.2 Process supervision

When the relayer process exits, its container may remain running with a zero exit code, so container
restart policies never fire. The health endpoint correctly reports the stopped state and nothing acts
on it.

- An external watchdog polling the health endpoint, or an in-container supervisor, is required.
- Containers MUST run with an explicit memory limit, so that exhaustion produces a recoverable
  process kill rather than a host-level event that no restart policy can respond to.

### 4.3 Configuration changes

- Environment files are read at container creation. Containers must be **recreated**, not restarted,
  for configuration changes to take effect; editing a file and restarting silently does nothing.
- Fetch method and polling interval are coupled. An interval of `0` is inert under streaming fetch but
  becomes a tight loop under polling, and passes schema validation because zero is non-negative. Both
  values must be changed together.

### 4.4 Pre-flight checklist

Before starting a relayer:

- [ ] Wallet public key confirmed non-null on chain
- [ ] Deviation tolerance variable **absent** from configuration — not set to zero
- [ ] Unordered transaction method configured
- [ ] Contract address matches the governance-instantiated `pyth-pro`
- [ ] Feed ID matches the contract's `price_feed_id`
- [ ] Memory limit set; supervision or watchdog in place
- [ ] Wallet funded with runway appropriate to the measured burn rate

## 5. Submission Verification

Confirm on chain, not from logs, that submissions carry the required properties:

```
akash query tx <hash> -o json | jq '{unordered: .tx.body.unordered,
  timeout_timestamp: .tx.body.timeout_timestamp,
  sequence: .tx.auth_info.signer_infos[0].sequence,
  gas_wanted, gas_used, code}'
```

Expected: `unordered: true`, populated `timeout_timestamp`, `sequence: "0"`, `code: 0`.

Feed freshness is verified by querying `get_price_feed` on the contract and comparing `publish_time`
against wall clock — never by the oracle's `is_healthy` flag alone, which has reported healthy while
prices were past `max_price_staleness_period`.

## 6. Operational Notes

### 6.1 Fee model

Gas fees are charged on **requested** gas, not consumed gas. With continuous submission, relayer
wallet runway is a direct feed-outage risk under `min_price_sources: 1` and must be alerted on as a
first-class control rather than treated as housekeeping.

Simulation under-estimates actual gas consumption by a small margin, so the gas multiplier requires
headroom above 1.0; the conventional default of 1.5 leaves substantially more headroom than needed and
is a candidate for tuning against measured consumption.

### 6.2 Contention

Where more than one relayer submits to the same contract, losing submissions fail with the monotonic
`publish_time` invariant after the ante handler succeeds, so their fees are charged. Observed
rejection rates under two active relayers on one contract have run at 15–30% of submissions.

This is expected behaviour of the invariant, not a defect. When diagnosing it, note that relayer
versions have differed in how completely they surface the underlying contract error — one version
truncating at the bare broadcast code while another surfaces the full error text. A version that makes
a pre-existing condition visible must not be reported as having introduced it.

### 6.3 Known client-side defect

The `--unordered` CLI flag is accepted without error but is not plumbed into the transaction factory:
`--generate-only` shows `"unordered": false` and a null `timeout_timestamp`. CLI sends from an
actively relaying account therefore race the relayer for the sequence, and `ErrWrongSequence` (code
32) is the result of losing that race.

Workarounds until the client is fixed: retry until a send lands, or stop the relayer briefly, send,
and restart.

## 7. Rollback

During the transitional window — after the new source is registered and before upstream cutover —
rollback is a single oracle parameter update removing the new source from the `sources` array. The
incumbent contract and its relayers remain functional throughout, which is why the incumbent source
stays registered even after its relayers are retired.

**Rollback becomes void at upstream cutover.** Once the guardian feed is discontinued, a respun
incumbent relayer has nothing valid to fetch. Rollback procedures MUST be removed from operator
documentation at that point rather than left in place as a trap, and the incumbent source deregistered
so that the reported source count matches reality.