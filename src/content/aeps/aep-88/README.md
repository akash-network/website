---
aep: 88
title: "Pyth Router-Based Price Feed Contracts"
author: Scott Carruthers (@chainzero) Joseph Chalabi (@chalabi2)
status: Draft
type: Standard
created: 2026-08-17
category: Core
requires: 76, 78, 80
---

## Summary

This AEP replaces the Akash price feed contracts. Pyth Network is retiring the Wormhole
guardian-set consensus model that the current contracts verify against, and replacing it with a
router model in which price attestations are signed by a fixed router set under a quorum threshold.
This proposal introduces a new contract pair — `pyth-vaa`, a router-quorum attestation verifier, and
`pyth-pro`, the price feed contract registered as an `x/oracle` source — deployed through governance
alongside the existing pair and transitioned additively, so that the AKT/USD price feed underpinning
Burn-Mint Equilibrium (AEP-76) continues uninterrupted across the upstream cutover.

## Abstract

The Akash price feed is a chain of three components: Pyth publishes signed AKT/USD attestations, an
off-chain relayer submits them, and a CosmWasm contract pair verifies and stores them for the
`x/oracle` module (AEP-80) to aggregate and expose to BME. Verification is the consensus-relevant
link, and it is the link Pyth is changing. The existing contracts verify guardian-signed VAAs against
a Wormhole guardian set; the replacement verifies router-signed attestations against a router set and
emitter fixed at instantiation.

This AEP specifies the two contracts, their configuration and invariants, their registration with
`x/oracle`, the behaviour required of the relayer that feeds them, and a migration path in which the
new source is registered additively before the incumbent is retired. Deployment procedure,
verification commands, and operational preconditions are specified separately in the
[Implementation Guide](./IMPLEMENTATION.md).

## Motivation

Akash's Burn-Mint Equilibrium mechanism (AEP-76) mints ACT against burned AKT at an AKT/USD reference
price supplied by the `x/oracle` module (AEP-80), which accepts price submissions from authorized
CosmWasm contracts (AEP-78) and enforces staleness, deviation, and source-count health checks. The
price feed is therefore a dependency of the token's monetary mechanism: if the price stops advancing,
BME stops minting.

Three factors make the current contract pair untenable:

1. **Upstream consensus model change.** Pyth is discontinuing the Wormhole guardian-set feed in favour
   of a router model — attestations signed by a fixed set of five routers under a 3-of-5 quorum,
   delivered over an authenticated endpoint. After the upstream cutover the existing contracts have
   nothing valid to verify. This is not a deprecation with a compatibility window; the feed stops.

2. **Fragility of tracking a mutable external registry.** The guardian set changes on Wormhole's
   schedule, not Akash's. A guardian set rotation (index 5 to 6) has already required contract-side
   intervention on mainnet to restore the feed. Every future rotation is an unscheduled outage risk on
   a component that gates AKT minting.

3. **Payload and verification cost.** Guardian VAAs measure approximately 1748 bytes. Router-based
   attestations measure approximately 816–844 bytes, with a simpler verification path — fixed router
   set, fixed emitter, quorum count — and no dependency on an externally mutable validator registry.

## Specification

### Contract Architecture

Current architecture:

```
Pythnet --guardian-signed VAA--> [wormhole: guardian set] --> [pyth: price store] --> x/oracle
```

Replacement architecture:

```
Pythnet --router-signed attestation--> [pyth-vaa: quorum verifier] --> [pyth-pro: price store] --> x/oracle
```

| Contract   | Role                                                                            | Registered as oracle source |
| ---------- | ------------------------------------------------------------------------------- | :-------------------------: |
| `pyth-vaa` | Verifies a router-signed attestation against a configured router set and emitter |             No              |
| `pyth-pro` | Holds the price feed, charges the update fee, enforces monotonic `publish_time`  |             Yes             |

`pyth-pro` names its verifier through a `pyth_vaa_contract` field in its instantiate message. Only
`pyth-pro` is registered with `x/oracle`; `pyth-vaa` is reached through the pairing.

### Router Verification Model

`pyth-vaa` is instantiated with a router verifier configuration:

```json
{
  "admin": "<governance module address>",
  "router_verifier": {
    "router_set_index": 0,
    "routers": ["<5 router public keys, base64>"],
    "expected_emitter_chain": 26,
    "expected_emitter_address": "<Pythnet emitter, base64>"
  }
}
```

- **Quorum**: five routers, 3-of-5 signatures required.
- **Emitter binding**: `expected_emitter_chain` 26 is Pythnet. An attestation from any other chain or
  emitter is rejected regardless of signature validity.
- **Set index**: `router_set_index` records which upstream router set the configuration corresponds
  to.
- **Admin**: the contract admin is the governance module address.

The production router set is used on both testnet and mainnet, so testnet validation exercises
mainnet verification behaviour.

### Contract Configuration

`pyth-pro` is instantiated with:

```json
{
  "pyth_vaa_contract": "<pyth-vaa address>",
  "update_fee": "1",
  "price_feed_id": "<Pyth AKT/USD feed ID>"
}
```

- **`pyth_vaa_contract`** — the paired verifier. Repointing this field is the mechanism by which a
  router set rotation is absorbed.
- **`update_fee`** — MUST be at least 1 uakt. A value of `0` is invalid: CosmWasm rejects zero-value
  coin transfers, so a contract instantiated with a zero fee cannot accept any price update, and the
  instantiate succeeds regardless. The specified value is `1`.
- **`price_feed_id`** — binds the contract to a single Pyth feed, so a valid attestation for a
  different feed cannot be accepted. The relayer's configured feed ID and the contract's MUST match.

### Contract Invariants

**Monotonic `publish_time`.** `pyth-pro` accepts an update only if the attested `publish_time` is
strictly newer than the stored value. An equal or older timestamp fails execution with
`Invalid price data: price data is older than current data` (broadcast code 5).

Because the failure occurs during contract execution rather than at the ante handler, the transaction
is included and its gas fee is paid. Rejected submissions are not free, which constrains submission
topology (see [Relayer Requirements](#relayer-requirements)).

### Oracle Module Integration

`pyth-pro` is registered as an `x/oracle` price source through a governance parameter update using
`/akash.oracle.v2.MsgUpdateParams`. The message replaces the entire params struct, so any field
omitted from the proposal is reset rather than preserved; proposals MUST be constructed from a current
parameter dump.

Registration is **additive**: the proposal appends `pyth-pro` to the existing `sources` array rather
than replacing the incumbent entry, producing a transitional two-source state that preserves a
rollback path.

Parameters governing feed operation:

| Parameter                    | Value | Relevance                                             |
| ---------------------------- | ----- | ----------------------------------------------------- |
| `min_price_sources`          | 1     | One healthy source suffices — no dual-source guarantee |
| `max_price_staleness_period` | 30s   | The freshness budget the relayer must stay inside      |
| `twap_window`                | 5s    |                                                       |
| `max_price_deviation_bps`    | 150   | Constrains how far a second source may diverge         |
| `max_future_time_drift`      | 10s   |                                                       |

### Relayer Requirements

The contracts are inert without a relayer fetching signed attestations and submitting them. Three
requirements are properties of the system rather than of any single deployment.

**1. Unordered transaction signing.** Relayers submit continuously at approximately 5–6 second
intervals. Under ordered signing, rapid submission desynchronises the account sequence and produces
`account sequence mismatch` at the ante handler, which has terminated the relayer process and taken
the feed down for hours. Relayers MUST use unordered transactions (ADR-070): `unordered: true`,
`sequence: "0"`, and a populated `timeout_timestamp`. Both the broadcast path and the gas-estimation
simulate call must run unordered; a simulate call left running against the sequenced account
reintroduces the failure.

**2. No price-deviation filtering.** Relayers MUST NOT configure a price-deviation tolerance. A
tolerance instructs the relayer to skip submission when the price has not moved by more than the
configured amount, applied inclusively — so even a tolerance of zero skips ticks on which the price is
unchanged. Pyth republishes at approximately 5 second intervals and, in flat markets, republishes an
unchanged price with a newer publish time. Skipping those ticks freezes contract `publish_time` for
the length of the flat run, which is bounded by market volatility rather than by configuration and can
exceed `max_price_staleness_period`. The discarded attestation is validly signed and genuinely fresh;
submitting it advances `publish_time` correctly.

The tolerance MUST remain unset. An explicitly configured `0` still skips unchanged prices and remains
exposed. A tolerance can only be used safely once the relayer implements a maximum-interval
heartbeat — submitting at least every N seconds regardless of deviation, with N below
`max_price_staleness_period` — which is a precondition for enabling the feature rather than an
optional companion to it.

**3. Single active submitter.** With no deviation filtering, one relayer submits on every tick, which
is the maximum achievable freshness. Additional parallel relayers add no freshness while multiplying
fees and generating contention: when two relayers submit the same attestation, the loser is rejected
by the monotonic `publish_time` invariant and pays for the failed transaction. Parallel actives buy
failover only; hot-standby or leader election is the preferred topology.

### Migration

Migration is additive-then-subtractive, so that no single step can take the feed down.

| Phase | Action                                                                                     |
| ----- | ------------------------------------------------------------------------------------------ |
| 1     | Contract validation on testnet against the production router set                            |
| 2     | Store and instantiate `pyth-vaa` and `pyth-pro` on mainnet via governance                   |
| 3     | Register `pyth-pro` as an **additional** oracle source                                      |
| 4     | Bring `pyth-pro` relayers online and validate submissions on chain                          |
| 5     | Decommission incumbent relayers; the incumbent source goes stale but remains registered     |
| 6     | Establish cutover readiness (see [Test Cases](#test-cases))                                 |
| 7     | Upstream cutover — the guardian feed ends                                                   |
| 8     | Deregister the incumbent source and retire rollback procedures                              |

No state migration is required. The incumbent source remains registered after its relayers are
retired: a stale registered source is harmless while `min_price_sources` is 1 and the oracle reports
one healthy source, and keeping it registered preserves rollback at no operational cost. That rollback
becomes void at upstream cutover, at which point a respun incumbent relayer would have nothing valid
to fetch.

Relayers are pre-warmed before source registration passes, during which their submissions are rejected
as unauthorized. Unordered signing is a prerequisite for this, because submissions begin landing at
full cadence the moment registration takes effect.

## Rationale

### Why two contracts rather than one

The verifier changes on Pyth's schedule; the price store changes on Akash's schedule. Splitting them
means a router set rotation is absorbed by instantiating a new `pyth-vaa` and repointing `pyth-pro`,
without migrating price state or re-registering the oracle source. It also minimises the surface
requiring re-audit after an upstream change. The cost is one additional contract and one additional
governance proposal per deployment.

### Why the trust anchor is fixed at instantiation

The router set, quorum, emitter chain, and emitter address are instantiate parameters with the
governance module as admin, rather than values read from a registry at verification time. This
inverts the property that made the guardian-set design fragile: an upstream rotation becomes an
explicit governance event carrying a new `router_set_index`, rather than a state change that occurs
without Akash's participation and breaks verification when it does.

### Alternative approaches considered

**1. Migrate the existing contracts in place.** CosmWasm migration would preserve addresses and avoid
re-registration.

- *Pros*: no oracle parameter change, no address churn.
- *Cons*: forecloses the additive transition, since there is no incumbent left to roll back to.
  Rejected: the rollback cushion is worth more than address stability.

**2. Raise `max_price_staleness_period` to absorb submission gaps.** Considered as a response to the
flat-market skip behaviour described in [Relayer Requirements](#relayer-requirements).

- *Cons*: flat-run length is unbounded, so no finite value is safe; and raising the threshold degrades
  the control's real purpose, which is detecting a relayer that has stopped. Rejected in favour of
  correcting relayer behaviour.

**3. Add relayer redundancy to absorb submission gaps.**

- *Cons*: relayers run identical logic against an identical feed and therefore skip in lockstep.
  Redundancy addresses process failure, not correlated logic failure. Rejected as a substitute for the
  relayer requirement; retained as failover.

## Backwards Compatibility

This proposal is backwards compatible and does not break consensus.

- The new contracts are stored and instantiated alongside the incumbent pair; neither is modified.
- The oracle `sources` array is modified additively, so the incumbent source continues to function.
- Consumers of `x/oracle`, including BME, see no interface change — only a different contract behind
  an existing source list.
- No state migration is performed and none is required.
- Rollback during the transitional window is a single parameter update removing the new source.

## Test Cases

### Contract tests

1. Verify a well-formed attestation carrying the quorum threshold of router signatures; expect
   acceptance.
2. Verify an attestation one signature below quorum; expect rejection.
3. Verify a correctly signed attestation from an unexpected emitter chain or emitter address; expect
   rejection.
4. Submit an attestation whose `publish_time` equals the stored value; expect
   `price data is older than current data`.
5. Submit an attestation for a feed ID other than the configured one; expect rejection.
6. Instantiate with `update_fee` of `0` and attempt an update; expect failure, confirming the
   minimum-fee requirement.

### Integration tests

1. Deploy both contracts on testnet against the production router set via governance.
2. Register `pyth-pro` additively and confirm the oracle reports both sources.
3. Run a relayer for a sustained period and confirm contract `publish_time` advances continuously,
   including across flat-price intervals.
4. Execute a full BME mint cycle against the aggregated price.
5. Run two relayers against one contract and confirm the losing submissions fail with the monotonic
   invariant rather than corrupting state.
6. Confirm submissions carry `unordered: true` and `sequence: "0"` on chain.

### Cutover readiness

Readiness MUST be established as a proof rather than a set of health checks:

- The oracle reports one healthy source of the registered set.
- The incumbent contract's `get_price_feed` `publish_time` is shown frozen.
- `pyth-pro`'s `publish_time` is shown current and advancing against wall clock.
- Therefore the single healthy source is necessarily `pyth-pro`.
- **Independent confirmation**: compare the price held by each contract against the oracle's
  `median_price`. A match with `pyth-pro` demonstrates the oracle is reading the new contract without
  relying on the oracle's own health accounting.

> The `source: N` field in `akash q oracle prices` is an internal source ID, not an index into the
> params `sources` array, and cannot be used to determine which contract is feeding the oracle.

## Security Considerations

**Verification trust anchor.** Router set, quorum, emitter chain, and emitter address are fixed at
instantiation with the governance module as admin. No operator key can weaken verification, and a
router set rotation is a governance event rather than a silent external state change.

**Replay protection.** Attestation replay is prevented by the monotonic `publish_time` invariant at
the contract; transaction replay is prevented by the unordered-transaction timeout dictionary at the
chain.

**Deployment authenticity.** A price feed deployment is only as trustworthy as the proof that the
contract the chain reads is the contract governance approved. Three independent checks are mandatory
before a deployment is considered live — governance lineage read from the proposal *message* rather
than its title, on-chain config pairing, and byte-code checksum. Procedures are specified in the
[Implementation Guide](./IMPLEMENTATION.md).

**Single-source exposure.** Once the incumbent source is deregistered, `min_price_sources: 1` means
the network runs on one contract fed by one upstream provider. Residual risks are upstream
availability, relayer liveness, and relayer wallet funding; the last is a direct feed-outage risk
because submission is continuous and fees are charged on requested rather than consumed gas.

**Credential handling.** The upstream endpoint requires an authenticated API key, making the relayer
host a credential-bearing component. Keys and relayer mnemonics must be vault-sourced and rotated on
exposure.

## Implementation

### Required changes

**1. Contracts** — `akash-network/contracts`: `pyth-vaa` router-quorum verifier, `pyth-pro` price feed
contract with pairing, fee, and feed-ID configuration.

**2. Node release artifacts** — `akash-network/node`: contract wasm artifacts published with the
release, accompanied by a checksum manifest.

**3. Relayer** — unordered transaction signing on both the broadcast and simulate paths; deviation
comparison skipped when unconfigured; health endpoint exposing configured feed ID, contract address,
and liveness.

**4. Governance** — five proposals: two stores, two instantiates, one oracle parameter update.

**5. Documentation** — operator guide covering relayer deployment and the retirement of rollback
procedures at upstream cutover.

Deployment sequence, verification commands, deployment preconditions, and known client-side defects
are specified in the [Implementation Guide](./IMPLEMENTATION.md).

## References

- [Pyth Network Documentation](https://docs.pyth.network/)
- [CosmWasm Documentation](https://docs.cosmwasm.com/)
- ADR-070 — Unordered Transactions (Cosmos SDK)
- [AEP-76: Burn Mint Equilibrium](https://akash.network/roadmap/aep-76/)
- [AEP-78: Enable CosmWasm Smart Contracts](https://akash.network/roadmap/aep-78/)
- [AEP-80: On-Chain Oracle Module](https://akash.network/roadmap/aep-80/)
- [Implementation Guide](./IMPLEMENTATION.md)

## Copyright

All content herein is licensed under [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0).