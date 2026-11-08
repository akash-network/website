---
categories: ["Node Operators"]
tags: ["Akash Sink", "Solana", "Reporter", "Relayer", "Validators"]
weight: 6
title: "Operate Akash Sink services"
linkTitle: "Akash Sink"
description: "Run relayers and independent reporters for an existing Akash Sink bridge"
---

Relayers and reporters keep transfers moving between Akash and Solana. Download
them from [sink-operators](https://github.com/akash-network/sink-operators), independently of the native node release.

[v0.1.0](https://github.com/akash-network/sink-operators/releases/tag/v0.1.0) is a prerelease for isolated test networks.
Production deployment is not ready. These commands use `--network testnet`,
which rejects both mainnets. Obtain the test chain ID, Solana genesis, RPCs,
program and mint from the deployment coordinator. The program must match the
release's compiled interface.

| Task                                               | Guide                                                      |
| -------------------------------------------------- | ---------------------------------------------------------- |
| Send AKT and follow a transfer                     | [Bridge with akt](/docs/developers/akt/sink)               |
| Submit Akash headers and transfer proofs to Solana | [Run a relayer](/docs/node-operators/akash-sink/relayer)   |
| Verify finalized outcomes and report them on Akash | [Run a reporter](/docs/node-operators/akash-sink/reporter) |

## Service roles

| Service  | Responsibility                                                                             | Credentials                                                         |
| -------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| Relayer  | Upload signed Akash headers and proofs that Solana verifies                                | A funded Solana payer and the configured header-update permission   |
| Reporter | Verify finalized Solana outcomes and submit reports, vetoes, and eligible refunds on Akash | A governance-selected Akash account with an owner-only software key |

Neither service holds user funds. Validators continue producing their normal consensus signatures; the Solana light client verifies those signatures. Run services separately from validator hosts.

A relayer cannot change the proven recipient or amount. A reporter cannot mint on Solana. Reporters must use independent nodes and verify finalized outcomes before signing. If a service is offline, transfers can wait even while both chains continue producing blocks.

## Before starting a service

Obtain the reviewed service release and network manifest. Confirm the Akash chain ID, Solana genesis, program, mint, artifact checksums, and the service version supported by that bridge. Use a release built for those deployed program IDs.

A relayer needs a dedicated payer funded with SOL and persistent journals. A reporter needs a dedicated software key, AKT for fees, and governance admission to the active reporter policy. Keep signing keys outside release directories.

Set `RPC` to the Akash node's CometBFT endpoint and query the active configuration with the matching native binary:

```bash
akash query sink params --node "$RPC" --output json
akash query sink reporters 0 --node "$RPC" --output json
akash query sink state --node "$RPC" --output json
```

`params` returns configuration, `reporters 0` returns the current policy, and `state` returns totals, native epoch usage, and the refund candidate. The [pending akt CLI](/docs/developers/akt/sink) exposes these queries too.

## Download and install

The operator archive includes its Node runtime, dependencies, header encoder,
executable commands and systemd units. No source checkout, compiler, npm, KMS or
hardware wallet is needed. Use Ubuntu 24.04 x86-64 (glibc 2.39 or newer). Install
the host prerequisites; the relayer uses Python's standard library for locking:

```bash
apt-get update
apt-get install -y ca-certificates curl tar python3 libstdc++6
```

Install v0.1.0 as the host administrator. For an existing installation, follow
the [upgrade procedure](https://github.com/akash-network/sink-operators/blob/v0.1.0/docs/install.md#upgrade-or-roll-back) first:

```bash
TAG=v0.1.0
VERSION=${TAG#v}
ASSET=akt-bridge_${VERSION}_linux_amd64.tar.gz
BASE=https://github.com/akash-network/sink-operators/releases/download/$TAG
DOWNLOAD=$(mktemp -d /var/tmp/akt-bridge.XXXXXX)
cd "$DOWNLOAD"
curl -fLO "$BASE/$ASSET"
curl -fLO "$BASE/akt-bridge_${VERSION}_checksums.txt"
sha256sum --check "akt-bridge_${VERSION}_checksums.txt"

RELEASE=/opt/akt-bridge/releases/$TAG
test ! -e "$RELEASE"
install -d -m 0755 "$RELEASE"
tar -xzf "$ASSET" -C "$RELEASE"
chown -R root:root "$RELEASE"
chmod -R a+rX,go-w "$RELEASE"
"$RELEASE/bin/akt-reporter" --version
ln -s "releases/$TAG" /opt/akt-bridge/current.next
mv -Tf /opt/akt-bridge/current.next /opt/akt-bridge/current
cd "$RELEASE"
rm -rf "$DOWNLOAD"
```

Verify the printed source commit against the release notes, then follow the
[relayer](/docs/node-operators/akash-sink/relayer) or
[reporter](/docs/node-operators/akash-sink/reporter) steps. Keys and durable state
stay outside the release directory.

For later upgrades, stop the service before switching `current`; keep the previous
compatible release and current journals. Follow the
[upgrade procedure](https://github.com/akash-network/sink-operators/blob/v0.1.0/docs/install.md#upgrade-or-roll-back).

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
