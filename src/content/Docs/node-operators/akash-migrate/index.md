---
categories: ["Node Operators"]
tags: ["Akash Migrate", "Solana", "Reporter", "Relayer", "Validators"]
weight: 6
title: "Operate Akash Migrate services"
linkTitle: "Akash Migrate"
description: "Run relayers and independent reporters for an existing Akash Migrate bridge"
---

Relayers and reporters are maintained in [akash-network/node](https://github.com/akash-network/node/tree/main/contracts/solana). Each has its own version, download and Docker image, independent of blockchain releases.

| Task                                          | Guide                                                         |
| --------------------------------------------- | ------------------------------------------------------------- |
| Submit Akash headers and proofs to Solana     | [Run a relayer](/docs/node-operators/akash-migrate/relayer)   |
| Verify finalized outcomes and report to Akash | [Run a reporter](/docs/node-operators/akash-migrate/reporter) |
| Send AKT                                      | [Bridge with akt](/docs/developers/akt/sink)                  |

## Before starting

Use a Linux amd64 host with Docker Engine, Compose v2, curl, jq and sha256sum. The [mainnet reference](/docs/learn/akash-migrate/mainnet) lists the deployed programs, mint, source code and release artifacts. Each service needs both an Akash CometBFT RPC and a Solana RPC. Use your operator endpoints; reporters require independent observation nodes.

The relayer needs a Solana payer funded with SOL, open relaying or header-update permission, and persistent journals. Each reporter needs a dedicated Akash private key, AKT for fees, governance admission and independent Akash and replaying Solana nodes. Keep Solana history for the challenge period plus expected outages. Neither service holds user funds.

Run one signing process per key. Keep service keys separate from validator consensus keys. Keys are mounted from files, never entered into Compose environment variables.

## Docker Compose setup

Run the host setup as an administrator. Choose one role; the commands select these checked releases:

| Role     | Version                      | Image                                          |
| -------- | ---------------------------- | ---------------------------------------------- |
| Relayer  | `0.1.3`                      | `ghcr.io/akash-network/akt-relayer:0.1.3`      |
| Reporter | `0.1.4-rc1` (**prerelease**) | `ghcr.io/akash-network/akt-reporter:0.1.4-rc1` |

The reporter release candidate includes receipt-verification fixes. Confirm the selected version with your deployment coordinator. The release links, source and immutable image digests are in the [mainnet reference](/docs/learn/akash-migrate/mainnet#releases-and-docker-images).

```bash
ROLE=relayer # or reporter
case "$ROLE" in
  relayer) VERSION=0.1.3 ;;
  reporter) VERSION=0.1.4-rc1 ;;
  *) echo 'Choose relayer or reporter'; exit 1 ;;
esac
ACCOUNT=akt-$ROLE
BASE=https://github.com/akash-network/node/releases/download/$ROLE%2Fv$VERSION

install -d -m 0755 /opt/$ACCOUNT
cd /opt/$ACCOUNT
curl -fLO "$BASE/akt-$ROLE-compose.yaml"
curl -fLO "$BASE/akt-$ROLE.env.example"
curl -fLO "$BASE/akt-$ROLE-config.example.json"
curl -fLO "$BASE/akt-${ROLE}_${VERSION}_checksums.txt"
sha256sum --ignore-missing --check "akt-${ROLE}_${VERSION}_checksums.txt"
mv "akt-$ROLE-compose.yaml" docker-compose.yaml
mv "akt-$ROLE.env.example" .env
mv "akt-$ROLE-config.example.json" config.json

useradd --system --home-dir /var/lib/$ACCOUNT --shell /usr/sbin/nologin "$ACCOUNT"
install -d -o "$ACCOUNT" -g "$ACCOUNT" -m 0700 /etc/$ACCOUNT
install -o "$ACCOUNT" -g "$ACCOUNT" -m 0600 config.json /etc/$ACCOUNT/config.json
sed -i "s/^OPERATOR_UID=.*/OPERATOR_UID=$(id -u "$ACCOUNT")/" .env
sed -i "s/^OPERATOR_GID=.*/OPERATOR_GID=$(id -g "$ACCOUNT")/" .env
# Relayer only: retain this directory across container upgrades.
if [ "$ROLE" = relayer ]; then
  install -d -o "$ACCOUNT" -g "$ACCOUNT" -m 0700 /var/lib/$ACCOUNT
fi
docker compose pull
```

If the service account already exists, reuse it and skip `useradd`. Populate the public mainnet values below. Replace the two RPC examples with reachable endpoints operated for your service. Container `127.0.0.1` is not the host or another container.

```bash
AKASH_RPC='http://YOUR_AKASH_NODE:26657'
SOLANA_RPC='http://YOUR_SOLANA_NODE:8899'
jq --arg akash "$AKASH_RPC" --arg solana "$SOLANA_RPC" '
  .akashRpc = $akash |
  .solanaRpc = $solana |
  .akashChainId = "akashnet-2" |
  .solanaGenesisHash = "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d" |
  .programId = "98inUHb5mMaHWQZ9ut9PGrnmkMpncLZWWAyFwxCWagME" |
  if has("mint") then
    .mint = "5d3fjPDdkYbtYcAMR9PC2TANaEyhzuyP8JxTEwqjVgBZ"
  else . end
' config.json > config.mainnet.json
install -o "$ACCOUNT" -g "$ACCOUNT" -m 0600 config.mainnet.json /etc/$ACCOUNT/config.json
rm config.mainnet.json
```

Keep `OPERATOR_NETWORK=mainnet`. The role guide supplies your key and, for a reporter, its verified public address. These operator-specific inputs are the remaining required settings. Review `.env` before starting. Do not put private keys in environment variables or commit runtime configuration. For RPC authentication, use a local authenticated proxy rather than credentials in URLs.

Continue with the [reporter](/docs/node-operators/akash-migrate/reporter) or [relayer](/docs/node-operators/akash-migrate/relayer) guide to create/import a key and start the service.

## Environment variables

`.env` configures Compose. Chain settings belong in `config.json`.

| Variable           | Default or requirement | Purpose                                                                      |
| ------------------ | ---------------------- | ---------------------------------------------------------------------------- |
| `OPERATOR_IMAGE`   | Required               | Published role-specific version or image digest                              |
| `OPERATOR_NETWORK` | `mainnet`              | Use `testnet` for an isolated deployment; it rejects both mainnet identities |
| `OPERATOR_UID`     | `10001`                | Service UID; must own the key and relayer state                              |
| `OPERATOR_GID`     | `10001`                | Service GID                                                                  |
| `OPERATOR_CONFIG`  | Required               | Existing absolute host path to JSON config; read-only mount                  |
| `OPERATOR_KEY`     | Required               | Existing absolute host path to the `0600` private-key file; read-only mount  |
| `OPERATOR_STATE`   | Relayer only           | Existing writable host directory for journals and spending state             |

The setup above replaces the default UID/GID with the dedicated host account. Missing files fail startup instead of becoming empty directories. Both images expose no ports and send logs to stdout/stderr with rotation. See the [complete JSON configuration reference](https://github.com/akash-network/node/blob/reporter/v0.1.4-rc1/contracts/solana/docs/operator-configuration.md) for every service field.

## Download without Docker

Each release also includes a checksummed `akt-ROLE_VERSION_linux_amd64.tar.gz` archive. It bundles Node and dependencies; the relayer includes its header encoder. Use Ubuntu 26.04 or 24.04 amd64, or another distribution with glibc 2.39+, with Bash, Python 3, CA certificates and libstdc++6. Follow [archive installation](https://github.com/akash-network/node/blob/relayer/v0.1.3/contracts/solana/docs/operator-releases.md#download-without-docker). No source checkout, compiler, npm, KMS or hardware wallet is needed.

## Upgrade or roll back

Stop the service, select the reviewed version or digest in `OPERATOR_IMAGE`, then run `docker compose pull` and `docker compose up -d`. A signing reporter must continue using both its base and broadcast Compose files. Preserve keys, configuration and relayer journals; never run old and new signing processes together. Verify network identity and logs after restart. Rollback uses the previous compatible image and the same retained data.

## Reporter quorum and refunds

Reporter quorum is `ceil(member count × threshold)`. The required vote count must exceed two thirds of the members. At the November 10 mainnet check, five reporters and a threshold of `0.667` required four votes. Query the active policy rather than assuming a version or fixed reporter count.

A confirmed Solana void becomes refund-pending. Payment still needs challenge maturity, current authorization, no hold, enabled refunds, queue priority, and available epoch capacity. Standard builds require at least 72 hours. A refund candidate or passed deadline does not prove payment.

## Monitor and restart

Monitor light-client age, RPC freshness, fee balances, transfer progress, refund conditions and cap usage. [akash-sink-monitor](https://github.com/akash-network/akash-sink-monitor) provides separate bridge monitoring and alerting; install and configure it independently. Confirm alert delivery to the on-call operator. Preserve the same network identities and durable service state across restarts. Do not restore older journals after transactions have been sent.

The [relayer guide](/docs/node-operators/akash-migrate/relayer#monitor-and-recover) covers proof and transaction recovery. The [reporter guide](/docs/node-operators/akash-migrate/reporter#monitor-and-recover) covers unavailable evidence, conflicting outcomes, and signer failures.

## Related guides

- [How Akash Migrate works](/docs/learn/akash-migrate)
- [Bridge with akt](/docs/developers/akt/sink)
- [Use the portal](/docs/learn/akash-migrate/portal)
