---
aep: 78
title: Enable CosmWasm Smart Contracts on Akash Network
author: Artur Troian (@troian)
status: Draft
type: Standard
category: Core
roadmap: major
created: 2025-11-14
estimated-completion: 2026-03-30
---

## Summary

This AEP proposes enabling CosmWasm smart contract functionality on Akash Network to unlock programmable decentralized cloud infrastructure, enabling automated resource management, advanced settlement mechanisms, and on-chain governance capabilities. This enhancement leverages Pyth Network as a price oracle to support AEP-76's Burn Mint Equilibrium (BME) mechanism and extends Akash's capabilities beyond simple compute marketplaces into a fully programmable cloud platform.

## Abstract

CosmWasm is a multi-chain smart contracting platform built for the Cosmos ecosystem that allows developers to write secure, performant smart contracts in Rust. Enabling CosmWasm on Akash Network will provide the foundation for building sophisticated decentralized applications (dApps), implementing automated marketplace logic, creating programmable payment channels, and enabling complex provider-tenant relationships. This proposal integrates with AEP-76's requirement for a reliable price oracle by incorporating Pyth Network's low-latency price feeds, ensuring accurate and manipulation-resistant pricing for the BME tokenomics model while opening the door to a rich ecosystem of on-chain applications.

## Motivation

### Current Limitations

Akash Network currently operates as a decentralized compute marketplace where the core functionality is hardcoded into the blockchain's native modules. While this approach ensures stability and security, it creates several limitations:

1. **Limited Programmability**: New marketplace features require network upgrades and governance approval, slowing innovation
2. **Rigid Settlement Mechanisms**: Payment and escrow logic cannot be easily modified or extended
3. **Manual Governance**: Complex decisions require off-chain coordination and manual execution
4. **Limited Ecosystem Integration**: Cannot natively interact with other protocols or leverage composable primitives
5. **Oracle Dependency**: AEP-76's BME mechanism requires reliable price oracles, which need smart contract infrastructure to function optimally
6. **Provider Incentives**: Limited ability to create sophisticated incentive mechanisms for providers

### Benefits of CosmWasm Integration

Enabling CosmWasm smart contracts on Akash Network provides transformational capabilities:

**1. Programmable Cloud Infrastructure**
- Custom deployment automation and orchestration logic
- Conditional resource allocation based on on-chain conditions
- Dynamic pricing algorithms implemented as smart contracts
- Automated provider selection and load balancing

**2. Advanced Settlement and Payment Systems**
- Programmable escrow contracts with custom release conditions
- Micropayment channels for real-time resource usage billing
- Multi-party payment splits and revenue sharing
- Integration with AEP-76's BME mechanism via smart contract-based burn/mint operations

**3. Enhanced Price Oracle Integration**
- Smart contracts consuming Pyth Network price feeds for AKT/USD pricing
- Automated arbitrage mechanisms for the BME equilibrium
- Price-triggered actions for lease renewals and settlements
- Oracle failsafe mechanisms and price aggregation logic

**4. Ecosystem Integration**
- Lending protocols for provider collateral and tenant deposits
- Liquid staking derivatives for staked AKT
- Cross-chain bridges and IBC-enabled applications
- Yield optimization strategies for network participants

**5. Decentralized Governance Tools**
- On-chain voting mechanisms for network parameters
- Automated treasury management
- Provider slashing and dispute resolution contracts
- Community fund allocation and grant programs

**6. Developer Ecosystem Growth**
- Attract Cosmos ecosystem developers already familiar with CosmWasm
- Enable third-party innovation without requiring core protocol changes
- Create opportunities for application-specific tooling and infrastructure
- Foster composability with other Cosmos chains running CosmWasm

## Specification

### Technical Architecture

#### Core Components

**1. CosmWasm Module Integration**

The implementation requires integrating the `x/wasm` module from the CosmWasm stack into the Akash blockchain:

```
wasmd v0.61.6.0 or higher
- CosmWasm VM integration
- Wasm bytecode storage
- Smart contract instantiation and execution
- Gas metering and optimization
```

**2. Pyth Network Oracle Integration**

As required by AEP-76, Pyth Network will serve as the primary price oracle. Pyth network has ready to use smart-contract implementing [oracle price feed](https://github.com/pyth-network/pyth-crosschain/blob/main/target_chains/cosmwasm/contracts/README.md)


#### Smart Contract Capabilities

**Supported Features:**
- Contract upload, instantiation, execution, and migration will be supported via governance
- Inter-contract messaging (CosmWasm to CosmWasm)
- IBC contract support for cross-chain operations
- Query support for contract state
- Native token handling (AKT and ACT)
- Integration with native Akash modules (deployment, provider, market)

**Gas and Fee Structure:**
- Gas costs for contract operations based on computational complexity
- Storage fees for contract code and state
- Execution fees for contract calls
- Gas limits and optimization requirements

#### Security Considerations

**1. Contract Upload Governance**
Initially, contract upload permissions should be restricted to governance-approved addresses to prevent malicious code deployment:

```
Parameters:
- code_upload_access: "Governance" | "Everybody" | "Nobody"
- instantiate_default_permission: "Everybody" | "Nobody"
```

**2. Contract Execution Limits**
- Maximum contract size: 800 KB (compressed)
- Maximum gas per transaction: 100M units
- Query gas limit: 10M units
- Maximum recursion depth: 5 levels

**3. Oracle Security**
- Pyth Network provides cryptographically signed price updates
- Multi-source price aggregation to prevent manipulation
- Confidence intervals for price data quality
- Emergency circuit breakers for anomalous price feeds

**4. Testing Requirements**
- Testnet deployment and community review before mainnet activation

### Integration with AEP-76

This proposal directly supports AEP-76's Burn Mint Equilibrium mechanism by providing:

1. **Smart Contract-Based BME Implementation**: The burn-mint logic can be implemented as auditable, upgradeable smart contracts rather than hardcoded protocol logic

2. **Pyth Network Price Oracle**: CosmWasm enables integration with Pyth's low-latency price feeds, providing the reliable pricing infrastructure required for BME operations

3. **Automated Arbitrage Mechanisms**: Smart contracts can monitor ACT/AKT price spreads and execute arbitrage automatically, helping maintain the BME equilibrium

4. **Transparent Operations**: All burn-mint operations occur in observable smart contracts, increasing transparency and auditability

5. **Extensibility**: Future improvements to the BME mechanism can be deployed as contract upgrades without requiring hard forks

## Rationale

### Why CosmWasm?

1. **Cosmos Ecosystem Standard**: CosmWasm is the de facto smart contract platform for Cosmos SDK chains, ensuring compatibility and developer familiarity
2. **Security**: Rust's memory safety guarantees and CosmWasm's design prevent common smart contract vulnerabilities (reentrancy attacks, overflow/underflow issues)
3. **Performance**: WebAssembly provides near-native execution speed while maintaining portability
4. **IBC Native**: CosmWasm has first-class support for Inter-Blockchain Communication, enabling cross-chain applications
5. **Proven Track Record**: Multiple Cosmos chains (Juno, Neutron, Stargaze, Terra 2.0) successfully run CosmWasm with significant TVL and activity

### Why Pyth Network?

As required by AEP-76, Pyth Network is the optimal choice for price oracle functionality:

1. **Low Latency**: 400ms price updates enable real-time pricing for BME operations
2. **High Quality Data**: Price feeds sourced from major exchanges, market makers, and trading firms
3. **Cosmos Integration**: Already deployed on Osmosis and other Cosmos chains with proven reliability
4. **Security**: Cryptographically signed price updates with confidence intervals and multi-source aggregation
5. **Comprehensive Coverage**: Supports AKT/USD and other necessary price pairs for the Akash ecosystem

### Alternative Approaches Considered

**1. Native Module Implementation**
- **Pros**: Better performance, simpler architecture
- **Cons**: Requires hard forks for updates, limits developer innovation, no composability with broader ecosystem

**2. EVM Compatibility Layer**
- **Pros**: Access to Ethereum developer community and tooling
- **Cons**: Less optimized for Cosmos, different security model, not standard for Cosmos ecosystem

**3. Other Oracle Solutions (Chainlink, Band Protocol)**
- **Pros**: Established reputation, wide adoption
- **Cons**: Less Cosmos-native, higher latency, AEP-76 specifically targets Pyth Network

## Backwards Compatibility

This proposal is fully backwards compatible:

- Existing Akash modules and functionality remain unchanged
- CosmWasm operates as an additional module alongside existing features
- No changes to current deployment, provider, or market modules
- Existing deployments continue to function without modification
- Opt-in functionality for users who want smart contract features

## Test Cases

### Integration Tests

1. Deploy Pyth contract on testnet
2. Deploy BME burn-mint contracts
3. Execute full burn-mint cycle with price oracle query
4. Verify correct ACT minting and AKT burning
5. Test automated arbitrage contract behavior
6. Validate settlement contract execution with real deployments

### Testnet Deployment

- Public testnet with CosmWasm enabled
- Developer documentation and examples
- Bug bounty for critical vulnerabilities
- Community testing period: minimum 3 months before mainnet

## Security Considerations

### Contract Security

1. **Upgrade Path**: Use contract migration features carefully with governance oversight
2. **Permission System**: Initially restrict contract uploads to governance-approved addresses
3. **Gas Limits**: Implement appropriate gas limits to prevent DoS attacks

### Oracle Security

1. **Price Manipulation**: Pyth's multi-source aggregation and confidence intervals mitigate manipulation risks
2. **Data Staleness**: Circuit breakers trigger if price data exceeds freshness threshold
3. **Fallback Mechanisms**: Multiple oracle sources for critical operations
4. **Governance Override**: Emergency governance actions can pause BME operations if oracle issues detected

## Implementation

### Required Changes

**1. Core Node Software**
```
akash-network/node:
- Integrate wasmd v0.61.6
- Add x/wasm module to app.go
- Configure wasm parameters
- Enable contract upload governance
```

**2. CosmWasm Contracts**
```
New Repository: akash-network/contracts
- Pyth oracle consumer
```

**3. Documentation**
```
akash-network/docs:
- CosmWasm developer guide
- Contract deployment tutorial
- Oracle integration guide
- Security best practices
- Example contracts and templates
```

**4. Testing Infrastructure**
```
- Testnet deployment scripts
- Integration test suite
- Performance benchmarks
- Security testing framework
```

## References

- [CosmWasm Documentation](https://docs.cosmwasm.com/)
- [CosmWasm GitHub](https://github.com/CosmWasm/cosmwasm)
- [Pyth Network Documentation](https://docs.pyth.network/)
- [Pyth Network on Osmosis](https://www.pyth.network/blog/pyth-launches-price-oracles-on-osmosis)
- [AEP-76: Burn Mint Equilibrium](https://akash.network/roadmap/aep-76/)
- [Cosmos SDK Documentation](https://docs.cosmos.network/)
- [Akash Network Documentation](https://docs.akash.network/)

## Copyright

All content herein is licensed under [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0).
