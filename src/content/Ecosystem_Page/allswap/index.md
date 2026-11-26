---
projectTitle: AllSwap
projectImage: "./project-banner.png"
pubDate: "2026-11-26"
tags:
  - DeFi
  - Security
  - Tools
category: deployed_on_akash
description: Non-custodial cross-chain swap & bridge aggregator across 46+ blockchains with open-source multi-chain address checksum, Memo/Tag routing, and anti-poisoning validation tooling.
ctaButton:
  label: Launch Address Validator
  link: https://allswap.io/tools/address-validator
  enable: true
websiteLink: https://allswap.io
githubLink: https://github.com/zhangglnuo-art/multichain-memo-address-validator
twitterLink: https://x.com/allswapio
featured: false
showcase: false
---

AllSwap ([https://allswap.io](https://allswap.io)) is a non-custodial cross-chain swap and bridge aggregator supporting 46+ blockchain networks including EVM chains, Solana, Bitcoin, Cosmos, TON, XRP Ledger, Stellar, and Sui.

To eliminate irreversible transfer errors across heterogeneous blockchain networks, AllSwap maintains the open-source **MultiChain Memo & Address Validator** suite ([https://allswap.io/tools/address-validator](https://allswap.io/tools/address-validator)), providing:

- **Cryptographic Address & Checksum Verification**: Validates EIP-55, Base58Check, Bech32/Bech32m, StrKey, and Ed25519 address formats offline.
- **Mandatory Memo & Destination Tag Enforcement**: Prevents unallocated custodial deposits on XRP, XLM, ATOM, TON, HBAR, and EOS.
- **Vanity Address-Poisoning Defense**: Detects lookalike addresses that mimic the leading and trailing characters of trusted counterparty addresses.
- **Open-Source Tooling & Documentation**: Full CLI, Nuxt, Fastify, Hono, Valibot, and DatoCMS integrations documented at [https://allswap.io/docs](https://allswap.io/docs).
