---
categories: ["Developers", "Deployment", "CLI"]
tags: ["CLI", "ACT", "BME", "Mint", "Burn"]
weight: 5
title: "Mint and Burn ACT (CLI)"
linkTitle: "Mint & Burn ACT"
description: "Use CLI commands to mint ACT from AKT and burn ACT back to AKT"
---

Use `akash` CLI BME transactions to convert between AKT and ACT.

- **Mint ACT:** burn `uakt` and mint `uact`
- **Burn ACT:** burn `uact` and mint/remint `uakt`

---

## Prerequisites

- `akash` CLI installed
- Wallet funded with AKT for mint operations and gas
- Network env vars configured (`AKASH_NODE`, `AKASH_CHAIN_ID`, gas settings)

Example env:

```bash
export AKASH_NODE="https://rpc.akashnet.net:443"
export AKASH_CHAIN_ID="akashnet-2"
export AKASH_GAS="auto"
export AKASH_GAS_PRICES="0.025uakt"
export AKASH_GAS_ADJUSTMENT="1.5"
export AKASH_KEY_NAME="my-wallet"
```

---

## Check BME Status First

Before minting ACT, check status:

```bash
akash query bme status --node "$AKASH_NODE"
```

If minting is halted by circuit breaker status, `mint-act` will fail until status allows minting again.

---

## Mint ACT (Burn AKT -> Mint ACT)

Mint ACT by burning AKT:

```bash
akash tx bme mint-act 5000000uakt \
  --from "$AKASH_KEY_NAME" \
  --node "$AKASH_NODE" \
  --chain-id "$AKASH_CHAIN_ID"
```

`5000000uakt` = 5 AKT input.

---

## Burn ACT (Burn ACT -> Mint AKT)

Burn ACT back to AKT:

```bash
akash tx bme burn-act 5000000uact \
  --from "$AKASH_KEY_NAME" \
  --node "$AKASH_NODE" \
  --chain-id "$AKASH_CHAIN_ID"
```

`5000000uact` = 5 ACT input.

---

## Generic Conversion Command

Use the generic conversion command when needed:

```bash
# AKT -> ACT
akash tx bme burn-mint 1000000uakt uact --from "$AKASH_KEY_NAME"

# ACT -> AKT
akash tx bme burn-mint 1000000uact uakt --from "$AKASH_KEY_NAME"
```

---

## Verify Balances

Check wallet balances before/after:

```bash
AKASH_ADDRESS=$(akash keys show "$AKASH_KEY_NAME" -a)
akash query bank balances "$AKASH_ADDRESS" --node "$AKASH_NODE"
```

Look for both `uakt` and `uact` entries.

---

## Troubleshooting

- **Mint transaction fails while status is halted:** check `akash query bme status`; wait until minting is allowed.
- **Insufficient funds:** keep AKT for gas even when working with ACT.
- **Wrong denom:** use `uakt` for AKT and `uact` for ACT.

---

## Reference

Command names and semantics are from Akash CLI BME command implementations:

- `mint-act`
- `burn-act`
- `burn-mint`

