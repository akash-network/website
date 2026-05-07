---
aep: 81
title: "Pyth Price feed Integration"
author: Artur Troian (@troian)
status: Final
type: Standard
category: Core
created: 2026-03-06
updated: 2026-03-23
completed: 2026-03-23
roadmap: major
requires: 76,80
---

## Abstract

This proposal introduces a Pyth Network oracle integration for Akash Network, providing cryptographically verifiable AKT/USD price feeds required by the Burn-Mint Equilibrium ([AEP-76](../aep-76)).
The design deploys two CosmWasm contracts — a Wormhole verification contract and a Pyth relay contract — alongside a new `x/oracle` native module that stores prices, computes TWAP, and enforces staleness/deviation health checks.
An off-chain Hermes client relays VAA-signed price data from Pyth's pull oracle onto the chain.

## Motivation

AEP-76 introduces BME, which settles all leases in AKT using a 30-minute TWAP oracle price. The oracle must be:

1. **Decentralized** — no single point of failure or trust.
2. **Verifiable** — every price submission must carry a cryptographic proof.
3. **Low-latency** — sub-minute updates to keep TWAP responsive.
4. **Governance-managed** — Akash validators control guardian sets and oracle parameters without external governance dependencies.

No existing on-chain mechanism satisfies all four. Pyth Network's pull oracle model — where prices are aggregated from first-party publishers on Pythnet, attested by 19 Wormhole Guardians,
and verified on the destination chain — meets every requirement while covering 500+ feeds across crypto, equities, FX, and commodities.

## Specification

### Overview

The integration consists of four components:

| Component         | Type                   | Description                                                                |
|-------------------|------------------------|----------------------------------------------------------------------------|
| Wormhole contract | CosmWasm (WASM)        | Verifies VAA guardian signatures                                           |
| Pyth contract     | CosmWasm (WASM)        | Verifies VAA via Wormhole, parses Pyth payload, relays price to `x/oracle` |
| `x/oracle` module | Cosmos SDK native      | Stores prices, calculates TWAP, enforces health checks                     |
| Hermes client     | Off-chain (TypeScript) | Fetches VAA from Pyth Hermes API, submits to Pyth contract                 |

### Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     Pyth Network (Off-chain)                 │
│              Publishers → Pythnet → Hermes API               │
└──────────────────────────────────────────────────────────────┘
                                │
                         VAA with prices
                                │
┌───────────────────────────────┼──────────────────────────────┐
│          Hermes Client        │        (Off-chain)           │
│    github.com/akash-network/hermes                           │
│    Fetches VAA and submits to Pyth contract                  │
└───────────────────────────────┼──────────────────────────────┘
                                │
                    execute: update_price_feed(vaa)
                                ▼
┌──────────────────────────────────────────────────────────────┐
│                Akash Network (On-chain / CosmWasm)           │
│                                                              │
│  ┌────────────────────────────┐                              │
│  │     Wormhole Contract      │◄── WASM Contract #1          │
│  │  - Verifies VAA signatures │    Verifies guardian         │
│  │  - Returns verified payload│    signatures (13/19)        │
│  └─────────────▲──────────────┘                              │
│                │ query: verify_vaa                            │
│                │                                             │
│  ┌─────────────┴──────────────┐                              │
│  │    Pyth Contract           │◄── WASM Contract #2          │
│  │  - Receives VAA from client│    Verifies + relays         │
│  │  - Queries Wormhole        │    in single transaction     │
│  │  - Parses Pyth payload     │                              │
│  │  - Relays to x/oracle      │                              │
│  └─────────────┬──────────────┘                              │
│                │                                             │
│       CosmosMsg::Custom(SubmitPrice)                         │
│                ▼                                             │
│  ┌────────────────────────────┐                              │
│  │      x/oracle Module       │◄── Native Cosmos module      │
│  │  - Stores price            │    Aggregates prices from    │
│  │  - Calculates TWAP         │    authorized sources        │
│  │  - Health checks           │                              │
│  └────────────────────────────┘                              │
└──────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Pyth Publishers** aggregate prices (AKT/USD) on Pythnet.
2. **Wormhole Guardians** (19 validators) observe and sign the price attestation as a VAA. A valid VAA requires **13 of 19 signatures** (2/3 supermajority).
3. **Hermes Client** fetches the latest price + VAA from Pyth's Hermes API.
4. **Hermes Client** submits the VAA to the Pyth contract on Akash.
5. **Pyth Contract** queries the Wormhole contract to verify VAA signatures.
6. **Pyth Contract** parses the Pyth price attestation from the verified VAA payload.
7. **Pyth Contract** relays the validated price to `x/oracle` via `CosmosMsg::Custom(SubmitPrice)`.
8. **`x/oracle` Module** stores the price, calculates TWAP, and performs health checks.
9. **Consumers** (e.g., `x/bme`) query `x/oracle` for the current AKT/USD TWAP.

### Wormhole Contract

**Purpose:** Verify VAA signatures from Wormhole's guardian network.

- Queries guardian addresses from `x/oracle` module params via a custom Akash querier (not stored in contract state).
- Validates that 13/19 guardians signed the VAA.
- Returns the verified payload for downstream contracts.
- Guardian set updates are managed via Akash governance, not Wormhole governance VAAs.

**Source:** `contracts/wormhole/`

#### Query Messages

```rust
pub enum QueryMsg {
    /// Verify VAA and return parsed contents
    VerifyVAA {
        vaa: Binary,        // Base64-encoded VAA
        block_time: u64,    // Current block time for validation
    },
    /// Get current guardian set info
    GuardianSetInfo {},
}
```

#### Instantiate Parameters

| Parameter      | Type   | Description                                    | Value             |
|----------------|--------|------------------------------------------------|-------------------|
| `gov_chain`    | u16    | Wormhole governance chain ID                   | `1` (Solana)      |
| `gov_address`  | Binary | Governance contract address (32 bytes, base64) | See Wormhole docs |
| `chain_id`     | u16    | Wormhole chain ID for Akash                    | `29`              |
| `fee_denom`    | String | Native token denomination                      | `"uakt"`          |

#### Parsed VAA Response

```rust
pub struct ParsedVAA {
    pub version: u8,
    pub guardian_set_index: u32,
    pub timestamp: u32,
    pub nonce: u32,
    pub len_signers: u8,
    pub emitter_chain: u16,      // Source chain (26 = Pythnet)
    pub emitter_address: Vec<u8>, // 32-byte emitter address
    pub sequence: u64,
    pub consistency_level: u8,
    pub payload: Vec<u8>,        // Pyth price attestation data
    pub hash: Vec<u8>,
}
```

### Pyth Contract

**Purpose:** Receive VAA, verify via Wormhole, parse Pyth payload, and relay price to `x/oracle`.

- Receives raw VAA from the Hermes client.
- Queries the Wormhole contract to verify VAA signatures.
- Parses the Pyth price attestation from the verified payload.
- Validates the price feed ID and data source emitter.
- Relays the validated price to `x/oracle` (no local price storage).
- Admin-controlled for governance.

**Source:** `contracts/pyth/`

#### Execute Messages

```rust
pub enum ExecuteMsg {
    /// Submit price update with VAA proof
    UpdatePriceFeed {
        vaa: Binary,         // VAA data from Pyth Hermes API (base64 encoded)
    },
    /// Admin: Update the fee
    UpdateFee { new_fee: Uint256 },
    /// Admin: Transfer admin rights
    TransferAdmin { new_admin: String },
    /// Admin: Refresh cached oracle params
    RefreshOracleParams {},
    /// Admin: Update contract configuration
    UpdateConfig {
        wormhole_contract: Option<String>,
        price_feed_id: Option<String>,
        data_sources: Option<Vec<DataSourceMsg>>,
    },
}

pub struct DataSourceMsg {
    pub emitter_chain: u16,      // Wormhole chain ID (26 for Pythnet)
    pub emitter_address: String, // 32 bytes, hex encoded
}
```

#### Query Messages

```rust
pub enum QueryMsg {
    GetConfig {},        // Returns admin, wormhole_contract, fee, feed ID, data_sources
    GetPrice {},         // Returns latest price
    GetPriceFeed {},     // Returns price with metadata
    GetOracleParams {},  // Returns cached x/oracle params (uses custom Akash querier)
}
```

#### Instantiate Parameters

| Parameter                        | Type   | Description                       | Example                  |
|----------------------------------|--------|-----------------------------------|--------------------------|
| `admin`                          | String | Admin address                     | Governance address       |
| `wormhole_contract`              | String | Wormhole contract address         | `akash1...`              |
| `update_fee`                     | String | Fee for price updates (Uint256)   | `"1000000"`              |
| `price_feed_id`                  | String | Pyth price feed ID (64-char hex)  | AKT/USD feed ID          |
| `data_sources[].emitter_chain`   | u16    | Wormhole chain ID                 | `26` (Pythnet)           |
| `data_sources[].emitter_address` | String | Pyth emitter address (32 bytes)   | See Pyth docs            |

#### Internal Flow

1. Receive VAA from Hermes client.
2. Query Wormhole: `verify_vaa(vaa)` → `ParsedVAA`.
3. Validate emitter is a trusted Pyth data source.
4. Parse Pyth price attestation from VAA payload (P2WH batch format).
5. Validate price feed ID matches expected feed (AKT/USD).
6. Send `CosmosMsg::Custom(SubmitPrice)` to `x/oracle`.

### Pyth Price Attestation Format

```rust
pub struct PythPrice {
    pub id: String,        // Price feed ID (32 bytes, hex encoded)
    pub price: i64,        // Price value (scaled by 10^expo)
    pub conf: u64,         // Confidence interval
    pub expo: i32,         // Price exponent (e.g., -8 means divide by 10^8)
    pub publish_time: i64, // Unix timestamp when price was published
    pub ema_price: i64,    // Exponential moving average price
    pub ema_conf: u64,     // EMA confidence interval
}
```

The VAA payload uses the P2WH Batch Price Attestation wire format:
- Magic bytes: `P2WH` (0x50325748)
- Major/minor version: 2 bytes each
- Header size, attestation count, attestation size: 2 bytes each
- Each attestation: 150 bytes containing price data

### `x/oracle` Module

The native Cosmos SDK module that serves as the single source of truth for on-chain price data.

#### Responsibilities

- Store price submissions from authorized sources (CosmWasm contracts).
- Calculate Time-Weighted Average Price (TWAP) over a configurable window.
- Enforce staleness checks (reject prices older than `max_price_staleness_blocks`).
- Enforce deviation bounds (reject outliers exceeding `max_price_deviation_bps`).
- Expose prices to other modules (e.g., `x/bme`) via keeper queries.

#### Governance Parameters

| Parameter                    | Type     | Description                      | Default         |
|------------------------------|----------|----------------------------------|-----------------|
| `sources`                    | []String | Authorized contract addresses    | `[]`            |
| `min_price_sources`          | u32      | Minimum sources for valid price  | `1`             |
| `max_price_staleness_blocks` | i64      | Max age in blocks (~6s/block)    | `60` (~6 min)   |
| `twap_window`                | i64      | TWAP calculation window (blocks) | `180` (~18 min) |
| `max_price_deviation_bps`    | u64      | Max deviation in basis points    | `150` (1.5%)    |

#### Feed Contract Parameters

Oracle params include typed contract configuration stored under `feed_contracts_params`:

```json
{
  "feed_contracts_params": [
    {
      "@type": "/akash.oracle.v1.PythContractParams",
      "akt_price_feed_id": "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d"
    },
    {
      "@type": "/akash.oracle.v1.WormholeContractParams",
      "guardian_addresses": ["58CC3AE5C097b213cE3c81979e1B9f9570746AA5", "..."]
    }
  ]
}
```

Guardian addresses are 20-byte Ethereum-style addresses (40 hex characters). The current set of 19 guardians can be obtained from [Wormhole documentation](https://wormhole.com/docs/protocol/infrastructure/guardians/).

#### Custom Querier

A custom Akash querier (`x/wasm/bindings/`) enables CosmWasm contracts to read `x/oracle` params (including guardian addresses) directly, without duplicating configuration in contract state.

#### CLI Queries

```bash
akash query oracle params           # Oracle parameters
akash query oracle price uakt usd   # AKT/USD price
akash query oracle prices            # All prices
```

### Hermes Client (Price Relayer)

An off-chain TypeScript service that bridges Pyth's pull oracle to Akash.

**Repository:** [github.com/akash-network/hermes](https://github.com/akash-network/hermes)

#### Why Required

Pyth uses a pull model — prices are not automatically pushed on-chain. The Hermes client automates fetching the latest price + VAA proof from Pyth's Hermes API and submitting it to the on-chain Pyth contract.

#### Features

- **Daemon mode** — continuous updates at configurable intervals.
- **Smart updates** — compares `publish_time` timestamps and skips transactions when the on-chain price is already current.
- **Multi-arch Docker** — supports `linux/amd64` and `linux/arm64`.
- **CLI tools** — manual updates, price queries, admin operations.

#### Configuration

| Variable             | Required | Default                       | Description                 |
|----------------------|----------|-------------------------------|-----------------------------|
| `RPC_ENDPOINT`       | Yes      | —                             | Akash RPC endpoint          |
| `CONTRACT_ADDRESS`   | Yes      | —                             | Pyth contract address       |
| `MNEMONIC`           | Yes      | —                             | Wallet mnemonic for signing |
| `HERMES_ENDPOINT`    | No       | `https://hermes.pyth.network` | Pyth Hermes API URL         |
| `UPDATE_INTERVAL_MS` | No       | `300000`                      | Update interval (5 min)     |
| `GAS_PRICE`          | No       | `0.025uakt`                   | Gas price for transactions  |
| `DENOM`              | No       | `uakt`                        | Token denomination          |

#### Cost Estimation

| Interval | Updates/Month | Approx Monthly Cost |
|----------|---------------|---------------------|
| 5 min    | 8,640         | ~9 AKT              |
| 10 min   | 4,320         | ~4.5 AKT            |
| 15 min   | 2,880         | ~3 AKT              |

Per update: ~150,000 gas × 0.025 uakt/gas = 3,750 uakt gas + 1,000,000 uakt update fee ≈ 0.001 AKT.

### Contract Deployment

On Akash mainnet, contract code can only be stored via governance proposals. The deployment sequence is:

1. **Store Wormhole WASM** — governance proposal to store `wormhole.wasm`.
2. **Instantiate Wormhole** — governance proposal with init params (gov_chain, chain_id, fee_denom).
3. **Store Pyth WASM** — governance proposal to store `pyth.wasm`.
4. **Instantiate Pyth** — governance proposal with init params (admin, wormhole_contract, update_fee, price_feed_id, data_sources).
5. **Register oracle source** — governance proposal to update `x/oracle` params: add the Pyth contract to `sources`, set guardian addresses, configure TWAP/staleness/deviation parameters.
6. **Run Hermes client** — start the off-chain relayer targeting the deployed Pyth contract.

Pre-built WASM artifacts are available at:
```
contracts/wormhole/artifacts/wormhole.wasm
contracts/pyth/artifacts/pyth.wasm
```

### Guardian Set Management

Guardian addresses are stored in `x/oracle` module params (not in the Wormhole contract). This enables:

- **Akash governance control** — guardian set updates via standard governance proposals.
- **Faster incident response** — no dependency on Wormhole governance VAAs.
- **Single source of truth** — the Wormhole contract queries `x/oracle` params at verification time via the custom querier.

To update the guardian set, submit a governance proposal that updates the `WormholeContractParams` in `feed_contracts_params`.

### Source Code

| Component      | Location                            |
|----------------|-------------------------------------|
| Wormhole       | `contracts/wormhole/`               |
| Pyth           | `contracts/pyth/`                   |
| x/oracle       | `x/oracle/`                         |
| Custom Querier | `x/wasm/bindings/`                  |
| Hermes Client  | `github.com/akash-network/hermes`   |
| E2E Tests      | `tests/e2e/pyth_contract_test.go`   |

## Rationale

### Why Two Contracts

Separating Wormhole verification from Pyth price parsing provides modularity. The Wormhole contract is a reusable VAA verifier that can serve future cross-chain integrations beyond Pyth. The Pyth contract handles Pyth-specific logic (P2WH parsing, feed ID validation, data source authorization) and acts as the relay to `x/oracle`.

### Why Pull Model

Pyth's pull oracle requires an off-chain relayer (Hermes client) rather than automatic on-chain pushes. While this introduces an operational dependency, it provides:

- **Cost efficiency** — only pay for updates when new data is available.
- **Flexibility** — configurable update intervals to balance cost vs. freshness.
- **Simplicity** — the on-chain contracts remain stateless relays, reducing attack surface.

### Why Guardian Addresses in `x/oracle` Params

Storing guardian addresses in the Wormhole contract would require Wormhole governance VAAs to update them. By storing them in `x/oracle` module params:

- Akash governance retains full control over the oracle trust model.
- Guardian set rotations are standard param-change proposals.
- No external governance dependency for security-critical updates.

### Why Not Osmosis TWAP Alone

AEP-76 specifies dual-feed medianization (Osmosis TWAP + external oracle). Pyth provides the external oracle feed. Using only Osmosis TWAP would create a single point of failure and be vulnerable to manipulation of a single liquidity pool.

## Security Considerations

### VAA Verification

Every price submission must carry a valid VAA signed by at least 13 of 19 Wormhole Guardians. The Wormhole contract verifies all signatures on-chain before any price data is accepted. Without valid VAA verification, price submissions are rejected.

### Oracle Health Checks

The `x/oracle` module enforces:
- **Staleness** — prices older than `max_price_staleness_blocks` are rejected.
- **Deviation** — prices deviating more than `max_price_deviation_bps` from the current TWAP are rejected as outliers.
- **Minimum sources** — `min_price_sources` must be met for a valid price.

### Authorized Sources

Only contract addresses listed in `x/oracle` params `sources` can submit prices. Adding or removing sources requires a governance proposal.

### Guardian Set Trust

The 19 Wormhole Guardians (including Google Cloud and other major validators) provide decentralized trust. The 13/19 quorum threshold means an attacker must compromise a supermajority of guardians to forge a VAA.

### Hermes Client Wallet

The relayer wallet should be a dedicated, minimally funded account. It only needs enough AKT to cover gas and update fees. Compromise of this wallet cannot produce fake prices — it can only submit VAAs that must still pass on-chain verification.

### Contract Governance

Both contracts are deployed with an admin address (governance). Contract upgrades, configuration changes, and fee updates all require governance authorization.

## Backward Compatibility

This proposal introduces new on-chain modules and contracts. It does not modify existing modules or break existing functionality. The `x/oracle` module is a new addition required by AEP-76.

## Implementations

- Wormhole contract: `contracts/wormhole/`
- Pyth contract: `contracts/pyth/`
- Hermes client: [github.com/akash-network/hermes](https://github.com/akash-network/hermes)

## References

- [Pyth Network Documentation](https://docs.pyth.network/)
- [Pyth Hermes API](https://hermes.pyth.network/docs/)
- [Pyth Price Feed IDs](https://pyth.network/developers/price-feed-ids)
- [Wormhole Documentation](https://docs.wormhole.com/)
- [Wormhole Guardians](https://wormhole.com/docs/protocol/infrastructure/guardians/)
- [CosmWasm Documentation](https://docs.cosmwasm.com/)
- [AEP-76: Burn Mint Equilibrium](../aep-76)
- [AEP-81: Pyth Oracle Integration](../aep-81)

## Copyright

Copyright and related rights waived via [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).
