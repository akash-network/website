---
categories: ["Node Operators"]
tags: ["Akash Sink", "Solana", "Reporter", "Relayer", "Validators"]
weight: 6
title: "Operate Akash Sink services"
linkTitle: "Akash Sink"
description: "Run relayers and independent reporters for an existing Akash Sink bridge"
---

Relayers and reporters are maintained in [akash-network/node](https://github.com/akash-network/node/tree/main/contracts/solana). Each has its own version, download and Docker image, independent of blockchain releases.

| Task                                          | Guide                                                      |
| --------------------------------------------- | ---------------------------------------------------------- |
| Submit Akash headers and proofs to Solana     | [Run a relayer](/docs/node-operators/akash-sink/relayer)   |
| Verify finalized outcomes and report to Akash | [Run a reporter](/docs/node-operators/akash-sink/reporter) |
| Send AKT                                      | [Bridge with akt](/docs/developers/akt/sink)               |

## Before starting

Use a Linux amd64 host with Docker Engine and Compose v2. Obtain the supported service version, Akash chain ID, Solana genesis hash, program/mint addresses and RPC endpoints from the deployment coordinator. Configuration selects the deployment; the programs must implement the release's supported interfaces. Release availability alone does not mean mainnet is ready.

The relayer needs a Solana payer funded with SOL, header-update permission and persistent journals. Each reporter needs a dedicated Akash private key, AKT for fees, governance admission and independent Akash and replaying Solana nodes. Keep Solana history for the challenge period plus expected outages. Neither service holds user funds.

Run one signing process per key. Keep service keys separate from validator consensus keys. Keys are mounted from files, never entered into Compose environment variables.

## Docker Compose setup

Run the host setup as an administrator. Choose one role and a **published** version from [node releases](https://github.com/akash-network/node/releases):

```bash
ROLE=reporter # or relayer
VERSION=0.1.0
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

If the service account already exists, reuse it and skip `useradd`. Review `.env` and edit `/etc/$ACCOUNT/config.json` with the deployment values before starting. Container `127.0.0.1` is not the host or another container; use reachable RPC addresses.

Continue with the [reporter](/docs/node-operators/akash-sink/reporter) or [relayer](/docs/node-operators/akash-sink/relayer) guide to create/import a key and start the service.

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

The setup above replaces the default UID/GID with the dedicated host account. Missing files fail startup instead of becoming empty directories. Both images expose no ports and send logs to stdout/stderr with rotation. See the [complete JSON configuration reference](https://github.com/akash-network/node/blob/main/contracts/solana/docs/operator-configuration.md) for every service field.

## Download without Docker

Each release also includes a checksummed `akt-ROLE_VERSION_linux_amd64.tar.gz` archive. It bundles Node and dependencies; the relayer includes its header encoder. Use Ubuntu 24.04 amd64 or compatible glibc 2.39+, with Bash, Python 3, CA certificates and libstdc++6. Follow [archive installation](https://github.com/akash-network/node/blob/main/contracts/solana/docs/operator-releases.md#download-without-docker). No source checkout, compiler, npm, KMS or hardware wallet is needed.

## Upgrade or roll back

Stop the service, select the reviewed version or digest in `OPERATOR_IMAGE`, then run `docker compose pull` and `docker compose up -d`. A signing reporter must continue using both its base and broadcast Compose files. Preserve keys, configuration and relayer journals; never run old and new signing processes together. Verify network identity and logs after restart. Rollback uses the previous compatible image and the same retained data.

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
