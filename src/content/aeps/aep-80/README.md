---
aep: 80
title: "On-Chain Oracle Module"
author: Artur Troian (@troian)
status: Final
type: Standard
category: Core
created: 2026-03-06
estimated-completion: 2026-03-23
roadmap: major
requires: 76
---

## Abstract

This proposal introduces `x/oracle`, a native Cosmos SDK module that provides trustworthy, aggregated price data for on-chain consumers. The module accepts price submissions from authorized CosmWasm contracts, calculates Time-Weighted Average Prices (TWAP), enforces staleness and deviation health checks, and exposes aggregated prices to other modules via keeper queries. A custom CosmWasm querier and message filter allow smart contracts to both read oracle parameters (including Wormhole guardian sets) and submit verified prices — forming the on-chain backbone for the Burn-Mint Equilibrium ([AEP-76](../aep-76)) and external oracle integrations such as Pyth ([AEP-81](../aep-81)).

## Motivation

AEP-76 requires a reliable AKT/USD TWAP price for every BME mint and settlement operation. This price must be:

1. **Multi-source** — aggregated from multiple independent oracle providers to resist manipulation.
2. **Time-weighted** — smoothed over a configurable window to dampen short-term volatility.
3. **Health-checked** — automatically flagged when sources are stale or diverge beyond acceptable bounds.
4. **Governance-controlled** — all parameters (authorized sources, TWAP window, deviation limits) updatable via governance proposals.
5. **CosmWasm-accessible** — smart contracts (e.g., Pyth relay) must be able to submit prices and query oracle configuration without duplicating state.

No existing Cosmos SDK module provides this combination. The `x/oracle` module fills this gap as a purpose-built price aggregation layer.

## Specification

### Module Identity

| Property    | Value      |
|-------------|------------|
| Module name | `oracle`   |
| Store key   | `oracle`   |
| Router key  | `oracle`   |

### Data Model

#### DataID

Uniquely identifies a price pair.

```protobuf
message DataID {
  string denom = 1;       // Asset denomination (e.g., "uakt")
  string base_denom = 2;  // Base denomination (e.g., "usd")
}
```

#### PriceDataID

Identifies a price from a specific source.

```protobuf
message PriceDataID {
  uint32 source = 1;      // Oracle provider index (assigned sequentially)
  string denom = 2;
  string base_denom = 3;
}
```

#### PriceDataRecordID

Complete price record identifier including block height, enabling range queries.

```protobuf
message PriceDataRecordID {
  uint32 source = 1;
  string denom = 2;
  string base_denom = 3;
  int64  height = 4;      // Block height when recorded
}
```

#### PriceDataState

The price value and its publish timestamp.

```protobuf
message PriceDataState {
  string                    price = 1;     // cosmos.Dec (must be positive)
  google.protobuf.Timestamp timestamp = 2; // Publisher timestamp
}
```

#### AggregatedPrice

The computed aggregate output stored per `DataID` at the end of each block.

```protobuf
message AggregatedPrice {
  string                    denom = 1;
  string                    twap = 2;           // Time-weighted average price
  string                    median_price = 3;
  string                    min_price = 4;
  string                    max_price = 5;
  google.protobuf.Timestamp timestamp = 6;      // Computation time
  uint32                    num_sources = 7;     // Contributing sources
  uint64                    deviation_bps = 8;   // (max - min) * 10000 / min
}
```

#### PriceHealth

Health status computed alongside aggregation.

```protobuf
message PriceHealth {
  string          denom = 1;
  bool            is_healthy = 2;           // has_min_sources AND deviation_ok
  bool            has_min_sources = 3;
  bool            deviation_ok = 4;
  uint32          total_sources = 5;
  uint32          total_healthy_sources = 6;
  repeated string failure_reason = 7;
}
```

### KV Store Layout

All state is stored under module prefix `0x11` using `collections.Map` with custom codecs for composite keys:

| Prefix       | Key Type            | Value Type        | Description                             |
|--------------|---------------------|-------------------|-----------------------------------------|
| `0x11, 0x00` | `PriceDataRecordID` | `PriceDataState`  | All price records, ordered by height    |
| `0x11, 0x01` | `PriceDataID`       | `int64`           | Latest recorded height per source/denom |
| `0x11, 0x02` | `DataID`            | `AggregatedPrice` | Current aggregated price per denom pair |
| `0x11, 0x03` | `DataID`            | `PriceHealth`     | Current health status per denom pair    |
| `0x12, 0x00` | —                   | `uint64`          | Source ID sequence counter              |
| `0x12, 0x02` | `string`            | `uint32`          | Source address to numeric ID mapping    |
| `0x09`       | —                   | `Params`          | Module parameters                       |

Custom codecs encode composite keys with length-prefixed strings and big-endian integers, enabling efficient range iteration by source and height.

### Parameters

```protobuf
message Params {
  repeated string              sources = 1;                    // Authorized source addresses
  uint32                       min_price_sources = 2;          // Min sources for valid price
  int64                        max_price_staleness_blocks = 3; // Max age in blocks
  int64                        twap_window = 4;                // TWAP window in blocks
  uint64                       max_price_deviation_bps = 5;    // Max deviation (basis points)
  repeated google.protobuf.Any feed_contracts_params = 6;      // Contract-specific config
}
```

#### Defaults

| Parameter                    | Default | Description                           |
|------------------------------|---------|---------------------------------------|
| `sources`                    | `[]`    | No sources authorized initially       |
| `min_price_sources`          | `1`     | At least 1 source required            |
| `max_price_staleness_blocks` | `60`    | ~6 minutes at 6s blocks               |
| `twap_window`                | `180`   | ~18 minutes at 6s blocks              |
| `max_price_deviation_bps`    | `150`   | 1.5% maximum deviation                |

#### Feed Contract Parameters

The `feed_contracts_params` field uses `google.protobuf.Any` to store typed configuration for different oracle integrations:

```protobuf
message PythContractParams {
  string akt_price_feed_id = 1;  // Pyth price feed ID for AKT/USD
}

message WormholeContractParams {
  repeated string guardian_addresses = 1;  // 20-byte hex-encoded Ethereum addresses
}
```

These are read by the custom CosmWasm querier (see [CosmWasm Integration](#cosmwasm-integration)) so that smart contracts can access configuration without duplicating it in contract state.

### Messages

#### MsgAddPriceEntry

Submits a new price from an authorized source.

```protobuf
service Msg {
  rpc AddPriceEntry(MsgAddPriceEntry) returns (MsgAddPriceEntryResponse);
  rpc UpdateParams(MsgUpdateParams) returns (MsgUpdateParamsResponse);
}

message MsgAddPriceEntry {
  string         signer = 1;  // Authorized source address
  DataID         id = 2;      // Price pair (denom + base_denom)
  PriceDataState price = 3;   // Price value + timestamp
}
```

**Validation rules:**

1. `signer` must be in `Params.sources`.
2. `id.denom` must be `"uakt"` and `id.base_denom` must be `"usd"` (only AKT/USD supported currently).
3. `price.price` must be positive.
4. `price.timestamp` must be newer than the last recorded price from the same source.
5. For the first price from a source, the timestamp must not be older than 12 seconds from the current block time.

On success, the price is stored with a `PriceDataRecordID` keyed to the current block height, the latest height tracker is updated, and an `EventPriceData` event is emitted.

#### MsgUpdateParams

Governance-only message to update module parameters.

```protobuf
message MsgUpdateParams {
  string authority = 1;  // x/gov module account
  Params params = 2;
}
```

When sources are updated, each new source address is assigned a unique sequential `uint32` ID used as the source field in price record keys.

### Source ID Assignment

Each authorized source address receives a unique `uint32` identifier, assigned from a monotonically increasing sequence. This numeric ID is used in all KV store keys instead of the full address, enabling compact storage and efficient range queries. Source IDs are assigned when the source first appears in a `Params.sources` update and are never reused.

### TWAP Calculation

The TWAP is calculated per-source over a configurable block window using block-height weighting.

**Algorithm:** `calculateTWAPBySource(ctx, source, denom, windowBlocks)`

1. Compute `startHeight = currentHeight - windowBlocks`.
2. Retrieve all price records for the source within `[startHeight, currentHeight]` via range iteration on `PriceDataRecordID`.
3. For each data point `i`:
   - If first data point: `weight_i = currentHeight - height_i`
   - Otherwise: `weight_i = height_i - height_{i-1}`
4. `weightedSum = sum(price_i * weight_i)`
5. `TWAP = weightedSum / totalWeight`

Returns `ErrTWAPZeroWeight` if no data falls within the window.

### EndBlocker — Price Aggregation

At the end of every block, the module runs aggregation:

1. **Collect latest prices** — iterate `latestPrices` map, group by `DataID`.
2. **Filter stale prices** — discard any price whose timestamp is older than `currentBlockTime - (maxPriceStalenessBlocks * 6s)`.
3. **Calculate per-source TWAP** — for each non-stale source, compute TWAP over the configured window. Skip sources where TWAP calculation fails.
4. **Compute aggregates:**
   - `twap` = mean of all source TWAPs
   - `median_price` = median of source prices
   - `min_price`, `max_price` = extremes
   - `deviation_bps` = `(max_price - min_price) * 10000 / min_price`
5. **Set health status:**
   - `has_min_sources` = `num_sources >= min_price_sources`
   - `deviation_ok` = `deviation_bps <= max_price_deviation_bps`
   - `is_healthy` = `has_min_sources AND deviation_ok`
   - Record failure reasons if unhealthy
6. **Store results** — write `AggregatedPrice` and `PriceHealth` to their respective maps. Only store the aggregated price if health check passes.

### Queries

```protobuf
service Query {
  // Historical price data with pagination
  rpc Prices(QueryPricesRequest) returns (QueryPricesResponse);
  // Module parameters
  rpc Params(QueryParamsRequest) returns (QueryParamsResponse);
  // Aggregated price and health for a denom
  rpc AggregatedPrice(QueryAggregatedPriceRequest) returns (QueryAggregatedPriceResponse);
  // Price feed configuration
  rpc PriceFeedConfig(QueryPriceFeedConfigRequest) returns (QueryPriceFeedConfigResponse);
}
```

| Query             | Filters                                    | Returns                              |
|-------------------|--------------------------------------------|--------------------------------------|
| `Prices`          | asset_denom, base_denom, height (optional) | Paginated `PriceData` list           |
| `AggregatedPrice` | denom                                      | `AggregatedPrice` + `PriceHealth`    |
| `PriceFeedConfig` | denom                                      | Feed config (Pyth feed ID, enabled)  |
| `Params`          | —                                          | Current `Params`                     |

**Denom normalization:** queries accept micro-denoms (`uakt`, `uact`) and normalize them to base denoms (`akt`, `act`) for internal lookup. ACT is hardcoded to return a price of 1 USD.

#### REST Endpoints

| Method | Path                                        |
|--------|---------------------------------------------|
| GET    | `/akash/oracle/v1/prices`                   |
| GET    | `/akash/oracle/v1/params`                   |
| GET    | `/akash/oracle/v1/aggregated_price/{denom}` |
| GET    | `/akash/oracle/v1/price_feed_config/{denom}`|

### Events

```protobuf
// Emitted on successful price submission
message EventPriceData {
  string         source = 1;  // Source address
  DataID         id = 2;
  PriceDataState data = 3;
}

// Emitted when a source approaches staleness
message EventPriceStaleWarning {
  string source = 1;
  DataID id = 2;
  int64  last_height = 3;
  int64  blocks_to_stall = 4;
}

// Emitted when a source becomes stale
message EventPriceStaled {
  string source = 1;
  DataID id = 2;
  int64  last_height = 3;
}

// Emitted when a stale source recovers
message EventPriceRecovered {
  string source = 1;
  DataID id = 2;
  int64  height = 3;
}
```

### Errors

| Error                        | Condition                                             |
|------------------------------|-------------------------------------------------------|
| `ErrUnauthorizedWriterAddress` | Signer not in `Params.sources`                      |
| `ErrInvalidTimestamp`        | Timestamp older than existing or too far from block time |
| `ErrPriceStalled`            | Price data is stale                                   |
| `ErrTWAPZeroWeight`          | No price data within TWAP window                      |
| `ErrPriceEntryExists`        | Duplicate price entry                                 |
| `ErrInvalidFeedContractParams` | Malformed feed contract params                      |
| `ErrInvalidFeedContractConfig` | Invalid feed contract configuration                 |

### CosmWasm Integration

The oracle module exposes a custom querier and message filter for CosmWasm contracts, enabling smart contracts to interact with the oracle without custom SDK message types.

#### Custom Querier

Registered as a `QueryPlugins.Custom` handler in the CosmWasm keeper, allowing contracts to issue custom queries:

```go
// Registered in app setup
wasmkeeper.WithQueryPlugins(&wasmkeeper.QueryPlugins{
    Custom: wasmbindings.CustomQuerier(app.Keepers.Akash.Oracle),
})
```

**Supported queries:**

| Query Type     | Request              | Response                                |
|----------------|----------------------|-----------------------------------------|
| `oracle_params` | `OracleParamsQuery{}` | Oracle params with Pyth/Wormhole config |
| `guardian_set`  | `GuardianSetQuery{}` | Guardian addresses (base64) + expiration |

The `oracle_params` response includes typed Pyth and Wormhole contract parameters unpacked from the `feed_contracts_params` Any types. The `guardian_set` response converts hex guardian addresses to base64 encoding for contract consumption.

#### Message Filter

CosmWasm contracts are restricted to a single protobuf `Any` message type:

```
/akash.oracle.v1.MsgAddPriceEntry
```

All other `Any` message types (staking, distribution, governance, IBC, bank burns) are rejected. This ensures that oracle source contracts can only submit price data and cannot perform other privileged operations.

**Data flow — price submission from contract:**

```
CosmWasm Contract (e.g., Pyth relay)
    │ sends protobuf Any: MsgAddPriceEntry
    ▼
Message Filter (wasm/keeper/msg_filter.go)
    │ validates message type = MsgAddPriceEntry
    ▼
Oracle Handler (x/oracle/handler/server.go)
    │ validates source, denom, price, timestamp
    ▼
Oracle Keeper
    │ stores PriceDataRecord, updates latest height
    ▼
EndBlocker aggregation (every block)
```

**Data flow — parameter query from contract:**

```
CosmWasm Contract (e.g., Wormhole verifier)
    │ sends custom query: { "guardian_set": {} }
    ▼
Custom Querier (wasm/bindings/custom_querier.go)
    │ reads x/oracle params, unpacks WormholeContractParams
    ▼
Returns guardian addresses as base64
```

### Genesis State

```protobuf
message GenesisState {
  Params                params = 1;
  repeated PriceData    prices = 2;
  repeated LatestHeight latest_height = 3;
}
```

Default genesis initializes with `DefaultParams()` and empty price history.

### CLI

#### Transaction Commands

```
akash tx oracle feed [asset-denom] [base-denom] [price] [timestamp]
```

Submits a `MsgAddPriceEntry`. The timestamp must be in RFC3339Nano format.

#### Query Commands

```
akash query oracle prices [--asset-denom X] [--base-denom Y] [--height Z]
akash query oracle aggregated-price [denom]
akash query oracle price-feed-config [denom]
akash query oracle params
```

## Rationale

### TWAP Over Spot Price

Using a Time-Weighted Average Price rather than spot prices protects against flash manipulation. A single anomalous price update is diluted across the entire TWAP window, making it economically infeasible to manipulate the oracle for BME operations.

### Block-Height Weighting

The TWAP uses block heights rather than wall-clock time for weighting. This is simpler and deterministic — all validators compute identical results without clock synchronization concerns.

### EndBlocker Aggregation

Computing aggregates at the end of every block ensures that consumers always read a consistent, up-to-date price. Lazy computation on query would introduce inconsistency across nodes.

### Guardian Addresses in Oracle Params

Storing Wormhole guardian addresses in `x/oracle` params rather than in the Wormhole contract state ensures that Akash governance controls the trust model. The custom querier bridges this data to the contract layer without state duplication.

### Single Message Type Filter

Restricting CosmWasm contracts to `MsgAddPriceEntry` minimizes the attack surface. Oracle source contracts are purpose-built and should not need access to staking, governance, or bank operations.

### ACT Hardcoded to 1 USD

Since ACT is a dollar-pegged compute credit (AEP-76), the oracle returns a fixed 1 USD price for ACT queries. This avoids circular dependencies where ACT pricing would need its own oracle feed.

## Security Considerations

### Source Authorization

Only addresses explicitly listed in `Params.sources` can submit prices. Adding or removing sources requires a governance proposal. Each source is assigned a unique numeric ID that is never reused, preventing ID-reuse attacks.

### Timestamp Validation

New prices must have a timestamp strictly newer than the last price from the same source. The first price from a source must be within 12 seconds of the current block time. This prevents replay attacks and backdated price injection.

### Staleness Protection

Prices older than `max_price_staleness_blocks` are filtered out during aggregation. If all sources become stale, no aggregated price is produced and `PriceHealth.is_healthy` becomes false. Consumers (e.g., `x/bme`) must check health before using prices.

### Deviation Bounds

If the spread between min and max source prices exceeds `max_price_deviation_bps`, the health check fails. This detects compromised or malfunctioning sources before the bad data can affect BME operations.

### Message Filter Isolation

CosmWasm contracts authorized as oracle sources can only execute `MsgAddPriceEntry`. All other Cosmos SDK message types are blocked at the WASM keeper layer, limiting the blast radius of a compromised contract.

### Governance-Only Parameter Updates

All parameter changes — including adding/removing sources, adjusting TWAP window, and updating guardian addresses — require `x/gov` authority. No individual account can unilaterally modify oracle behavior.

## Backward Compatibility

This is a new module with no existing state to migrate. It does not modify any existing modules. Consumers opt in by querying the oracle keeper.

## Implementations

| Component      | Location                                                |
|----------------|---------------------------------------------------------|
| Keeper         | `node/x/oracle/keeper/`                                 |
| Handler        | `node/x/oracle/handler/`                                |
| Module         | `node/x/oracle/module.go`                               |
| Custom Querier | `node/x/wasm/bindings/custom_querier.go`                |
| Query Types    | `node/x/wasm/bindings/akash_query.go`                   |
| Message Filter | `node/x/wasm/keeper/msg_filter.go`                      |
| Proto          | `chain-sdk/proto/node/akash/oracle/v1/`                 |
| Go Types       | `chain-sdk/go/node/oracle/v1/`                          |
| CLI            | `chain-sdk/go/cli/oracle_query.go`, `oracle_tx.go`      |

## References

- [AEP-76: Burn Mint Equilibrium](../aep-76)
- [Cosmos SDK Bank Module](https://docs.cosmos.network/v0.46/modules/bank/)
- [CosmWasm Documentation](https://docs.cosmwasm.com/)

## Copyright

Copyright and related rights waived via [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).
