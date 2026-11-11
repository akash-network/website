---
categories: ["Learn", "Akash Migrate"]
tags: ["AKT", "Solana", "Contracts", "Multisig"]
weight: 2
title: "Akash Migrate mainnet reference"
linkTitle: "Mainnet addresses and releases"
description: "Official AKT mint, bridge programs, Squads addresses, source repositories, contract artifacts and operator releases"
---

Use these addresses for Akash Migrate on `akashnet-2` and Solana mainnet-beta. Addresses and deployed contract bytes were checked on **November 10, 2026**. Query the chains for current authorities, limits, pauses and reporter membership.

## Token and contract addresses

| Account                         | Address                                                                                                                                                                   | Purpose                                                                             |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| **AKT token mint**              | [<code style="white-space: nowrap">5d3fjPDdkYbtYcAMR9PC2TANaEyhzuyP8JxTEwqjVgBZ</code>](https://explorer.solana.com/address/5d3fjPDdkYbtYcAMR9PC2TANaEyhzuyP8JxTEwqjVgBZ) | Identifies the token in wallets, exchanges and token accounts.                      |
| AKT bridge program              | [<code style="white-space: nowrap">98inUHb5mMaHWQZ9ut9PGrnmkMpncLZWWAyFwxCWagME</code>](https://explorer.solana.com/address/98inUHb5mMaHWQZ9ut9PGrnmkMpncLZWWAyFwxCWagME) | Verifies transfer proofs and mints or voids transfers. Use as operator `programId`. |
| Tendermint light-client program | [<code style="white-space: nowrap">2dTK4NwEkv3gyY5dZnG4TuDYFMoNYQYrBqEGwTSmEmKr</code>](https://explorer.solana.com/address/2dTK4NwEkv3gyY5dZnG4TuDYFMoNYQYrBqEGwTSmEmKr) | Verifies Akash headers. The bridge stores its current light-client pin.             |
| Access-manager program          | [<code style="white-space: nowrap">HntLc7xrcRMRk9X38uMytCnweFJhVVCuzqhkVPe1RkCq</code>](https://explorer.solana.com/address/HntLc7xrcRMRk9X38uMytCnweFJhVVCuzqhkVPe1RkCq) | Manages light-client administration and relayer permissions.                        |
| Mint-authority PDA              | [<code style="white-space: nowrap">CXyyuFHJEG3HfbQfgBVwQWUWXYb4EkwetLfnEZXUkroj</code>](https://explorer.solana.com/address/CXyyuFHJEG3HfbQfgBVwQWUWXYb4EkwetLfnEZXUkroj) | AKT program-controlled signing address for issuance and metadata updates.           |
| Metaplex metadata account       | [<code style="white-space: nowrap">93dhGSGLuHwUx8amRkXZHowjRCB1XBcgUscQ6yBc1cgP</code>](https://explorer.solana.com/address/93dhGSGLuHwUx8amRkXZHowjRCB1XBcgUscQ6yBc1cgP) | Stores the token name, symbol and metadata URI.                                     |

The token is **Akash**, symbol **AKT**, with **6 decimals**: `1 AKT = 1,000,000` base units. The mint has no freeze authority. The bridge pause guardian can stop new bridge mints; it cannot freeze tokens already in wallets. The [versioned metadata JSON](https://raw.githubusercontent.com/akash-network/net/130ca0ac6fab3bc1999e3612a1fbca83d57b439c/solana/mainnet/akt.json) points to the AKT image stored in the net repository.

The mint and bridge program are different accounts. Use the **mint** to identify AKT; use the **program** when configuring services or preparing bridge instructions. Neither is a receiving wallet. Deposits must name the recipient's Solana wallet address.

## Multisig and native authorities

| Account                      | Address                                                                                                                                                                   | Purpose                                                                                   |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Squads vault, index `0`      | [<code style="white-space: nowrap">H2sXJRVW3SnTdFGjTXpGSsVKN2HnDaKc6xLRomS36H3U</code>](https://explorer.solana.com/address/H2sXJRVW3SnTdFGjTXpGSsVKN2HnDaKc6xLRomS36H3U) | Upgrade authority for all three programs, access-manager admin and Solana pause guardian. |
| Squads multisig account      | [<code style="white-space: nowrap">Hx92ZBfSJ7kLaDpmRYvh5TcnrSLWMnh5eDdpQqC9B3ke</code>](https://explorer.solana.com/address/Hx92ZBfSJ7kLaDpmRYvh5TcnrSLWMnh5eDdpQqC9B3ke) | Stores membership, threshold and transaction settings. It is distinct from the vault.     |
| Squads v4 program            | [<code style="white-space: nowrap">SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvj52pCf</code>](https://explorer.solana.com/address/SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvj52pCf)   | Executes approved vault instructions.                                                     |
| Native `sink` module account | <code style="white-space: nowrap">akash1r9ut4ukp207nhumr8uaykyh6v7p9qlwxmcf48p</code>                                                                                     | Holds native AKT backing and pending deposits; refunds return to their original senders.  |
| Akash pause guardian         | <code style="white-space: nowrap">akash1aagclq778tq4ga0lke3wrd3mgw0rt3cc6670dp</code>                                                                                     | Can disable native deposits, refunds or both. Akash governance re-enables them.           |

At verification, the squad required **2 of 5** approvals and had a **zero-second time lock**. Check its current settings in the [Squads app](https://app.squads.so/squads/H2sXJRVW3SnTdFGjTXpGSsVKN2HnDaKc6xLRomS36H3U/transactions?tab=Vault). Reaching the approval threshold makes a proposal executable; a member with execution permission must still execute it.

The vault's administrative authority does not automatically allow it to receive a bridged deposit. Off-curve recipient vaults need approval in **both** the native `allowed_destination_vaults` parameter and the Solana mint policy. At verification, Solana listed this vault but the native list was empty. Query both policies before sending to any vault. Ordinary eligible wallet addresses do not need vault allowlisting.

## Network identity and queries

| Network                  | Identity                                       |
| ------------------------ | ---------------------------------------------- |
| Akash                    | `akashnet-2`                                   |
| Solana                   | `mainnet-beta`                                 |
| Full Solana genesis hash | `5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d` |

These public queries require no signing key:

```bash
solana --config /dev/null --url https://api.mainnet-beta.solana.com genesis-hash
solana --config /dev/null --url https://api.mainnet-beta.solana.com \
  --commitment finalized account 5d3fjPDdkYbtYcAMR9PC2TANaEyhzuyP8JxTEwqjVgBZ --output json
solana --config /dev/null --url https://api.mainnet-beta.solana.com \
  --commitment finalized program show 98inUHb5mMaHWQZ9ut9PGrnmkMpncLZWWAyFwxCWagME
```

`solana account` returns raw account data. For decoded decimals, supply and mint authority without a wallet configuration, query Solana JSON-RPC with curl and jq:

```bash
curl -fsS https://api.mainnet-beta.solana.com \
  -H 'Content-Type: application/json' \
  --data '{"jsonrpc":"2.0","id":1,"method":"getAccountInfo","params":["5d3fjPDdkYbtYcAMR9PC2TANaEyhzuyP8JxTEwqjVgBZ",{"encoding":"jsonParsed","commitment":"finalized"}]}' \
  | jq '.result.value.data.parsed.info'
```

With an [akt mainnet context](/docs/developers/akt/configuration):

```bash
akt query sink params -o json
akt query sink reporters -o json
akt query sink state -o json
```

The public Solana RPC is suitable for occasional checks and can rate-limit requests. Production services need reliable endpoints with the required history; reporters use their own independent nodes.

## Releases and Docker images

These are the versions checked for the operator guides. Contract deployments, blockchain releases and service releases have separate version histories.

| Component                  | Release                                                                                                          | Docker image / artifact                                |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| akt CLI                    | [v1.1.1](https://github.com/akash-network/akt/releases/tag/v1.1.1)                                               | Checksummed CLI downloads for the supported platforms. |
| Relayer and header encoder | [relayer/v0.1.3](https://github.com/akash-network/node/releases/tag/relayer%2Fv0.1.3)                            | `ghcr.io/akash-network/akt-relayer:0.1.3`              |
| Reporter                   | [reporter/v0.1.4-rc1](https://github.com/akash-network/node/releases/tag/reporter%2Fv0.1.4-rc1) — **prerelease** | `ghcr.io/akash-network/akt-reporter:0.1.4-rc1`         |
| Native Akash node          | [v2.2.0](https://github.com/akash-network/node/releases/tag/v2.2.0)                                              | Node release containing the native Sink module.        |

The listed operator images and archives target **Linux amd64**. The relayer image includes its header encoder. Each role's release includes Compose files, a config example, checksums and an `image-digest.txt`; use those files together. Review the reporter release-candidate status before selecting it for a deployment.

Immutable image references:

```text
ghcr.io/akash-network/akt-relayer@sha256:f614f5acc5b6a2c5dcde9c66f19ebaef1ba439edaf69e4475ed7cc52d9839a13
ghcr.io/akash-network/akt-reporter@sha256:09fb90cdf973376f1e1b70e9ddd7c154a60ea29f27d48138f398cad5449fc1c0
```

Follow [operator installation](/docs/node-operators/akash-sink) for configuration, funding, reporter admission and startup.

## Contract artifacts and source

The deployed AKT binary matches the [November 10 metadata upgrade package](https://github.com/akash-network/node/tree/launch/solana-mainnet-20261109/contracts/solana/deployments/mainnet/upgrades/20261110-token-metadata). The light client and access manager still match the [original launch package](https://github.com/akash-network/node/tree/launch/solana-mainnet-20261109/contracts/solana/deployments/mainnet). Each package includes `.so` binaries, JSON IDLs, generated TypeScript interfaces, checksums and build provenance. The original AKT binary is retained as historical evidence, not the current AKT deployment.

| Source                                   | Location                                                                                                                                        |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Contract launch and administration guide | [Canonical deployment guide](https://github.com/akash-network/node/blob/launch/solana-mainnet-20261109/contracts/solana/docs/deploy-program.md) |
| AKT contract compilation source          | [node at c815e3d9](https://github.com/akash-network/node/tree/c815e3d9cc5dfcd4ebefc20dfd9ed7b3be3dc708/contracts/solana)                        |
| Pinned light client and access manager   | [ibc-contracts at b3f25b45](https://github.com/akash-network/ibc-contracts/tree/b3f25b45c785a9cb571cb169e5b612fb6c94e1f8)                       |
| Native Sink module                       | [node](https://github.com/akash-network/node/tree/main/x/sink)                                                                                  |
| Generated chain clients                  | [chain-sdk](https://github.com/akash-network/chain-sdk)                                                                                         |
| User CLI                                 | [akt](https://github.com/akash-network/akt)                                                                                                     |
| Portal                                   | [sink-portal](https://github.com/akash-network/sink-portal)                                                                                     |
| Bridge monitoring                        | [akash-sink-monitor](https://github.com/akash-network/akash-sink-monitor)                                                                       |
| Token metadata and image                 | [net/solana/mainnet](https://github.com/akash-network/net/tree/130ca0ac6fab3bc1999e3612a1fbca83d57b439c/solana/mainnet)                         |

The portal's public URL will be announced separately. Use the [CLI transfer guide](/docs/developers/akt/sink) until it is available.
