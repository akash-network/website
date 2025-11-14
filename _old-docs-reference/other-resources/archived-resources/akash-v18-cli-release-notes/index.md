---
categories: ["Other Resources", "Archived Resources"]
tags: []
weight: 2
title: "Akash Provider Services v0.1.0 CLI Release Notes"
linkTitle: "Akash Provider Services v0.1.0 CLI Release Notes"
---

Following the release of Akash Mainnet4 - and the associated split of Akash network and provider repositories - new CLI syntax will be introduced.&#x20;

> _**NOTE**_ - The syntax updates are rather simple in that they only impact the beginning of command sets with a shift from `akash` (I.e. `akash tx create`) to `provider-services` (I.e. `provider-services tx create`).

> _**NOTE**_ - please visit this [Detailed CLI Steps](/docs/deployments/akash-cli/installation/) doc for details on installing the Akash CLI and additional command sets.

In these release notes we detail the new CLI syntax for deployment creation and for the purpose of illustration. The prior CLI command syntax (pre-Mainnet4) will be included for clarity as users transition to a new common syntax.

These changes only impact Akash CLI use and have no impact on application use of Akash Console, Praetor App, Akash Helm Charts, etc.

## Create an Akash Deployment

### Environment Variable Declarations

No change in our environment variables and may declare using common syntax.

```
export AKASH_KEYRING_BACKEND=os
export AKASH_FROM=<keyname>
export AKASH_OWNER=akash1<redacted>

export AKASH_NET="https://raw.githubusercontent.com/akash-network/net/main/mainnet"
export AKASH_CHAIN_ID="$(curl -s "$AKASH_NET/chain-id.txt")"
export AKASH_NODE="$(curl -s "$AKASH_NET/rpc-nodes.txt" | shuf -n 1)"

export AKASH_GAS_PRICES=0.0025uakt
export AKASH_GAS=auto
export AKASH_GAS_ADJUSTMENT=1.5
```

### Create Deployment

#### Post-Mainnet4 Syntax

```
provider-services tx deployment create deploy.yml
```

#### Pre-Mainnet4 Syntax

```
akash tx deployment create deploy.yml
```

### Declare Deployment Variables

Again no change to environment variables declarations.

```
AKASH_DSEQ=<DSEQ>
AKASH_OSEQ=<OSEQ>
AKASH_GSEQ=<GSEQ>
```

### View Deployment Bids

#### Post-Mainnet4 Syntax

```
provider-services query market bid list
```

#### Pre-Mainnet4 Syntax

```
akash query market bid list
```

### Declare Chosen Provider Env Variable

```
export AKASH_PROVIDER=akash1<redacted>
```

### Create Lease

#### Post-Mainnet4 Syntax

```
provider-services tx market lease create
```

#### Pre-Mainnet4 Syntax

```
akash tx market lease create
```

### Send Manifest to Provider

#### Post-Mainnet4 Syntax

```
provider-services send-manifest deploy.yml
```

#### Pre-Mainnet4 Syntax

```
akash provider send-manifest deploy.yml
```

### Confirm Lease Status and Retrieve URI/Ports

#### Post-Mainnet4 Syntax

```
provider-services lease-status
```

#### Pre-Mainnet4 Syntax

```
akash provider lease-status
```
