---
categories: ["Providers"]
tags: ["Operations", "Audit", "Verification"]
weight: 8
title: "Provider Audit"
linkTitle: "Provider Audit"
description: "Get your Akash provider audited — attribute requirements, benchmark deployment, and how to apply"
---

The **provider audit** is the only path to an official audited badge on Akash. Reviewers verify your on-chain attributes, infrastructure, and a long-running benchmark workload before signing your provider.

**Providers using DDNS (dynamic DNS) are not eligible** for audit. Ingress must use a domain you control with conventional DNS, not a dynamic-DNS provider.

---

## Before you start

1. **Join the Akash Discord** and obtain the **Provider** role. Audited providers must be reachable in Discord.
2. Set a complete **`provider.yaml` attributes** section (see [Attribute requirements](#attribute-requirements) below).
3. Configure **wildcard ingress DNS and TLS** for `*.ingress.<yourdomain>`.
4. Ensure **firewall / NAT** allows Akash provider ports.

Reference guides:

- [Provider Attributes](/docs/providers/operations/provider-attributes) — how to set each key
- [Provider Installation — Configure DNS](/docs/providers/setup-and-installation/kubespray/provider-installation-prep#step-7---configure-dns)
- [Provider Installation — Verify firewall](/docs/providers/setup-and-installation/kubespray/provider-installation/#step-6---verify-firewall)

---

## Hardware requirements

In addition to complete on-chain attributes, your cluster must meet these **minimum capacity** thresholds. Reviewers check inventory and benchmark results against them.

### Network (all providers)

- **At least 500 Mbps upload and 500 Mbps download**
- Set `network-speed-up` and `network-speed-down` to values that reflect your actual sustained bandwidth (minimum **500** each)

### CPU and memory (all providers)

Every provider must have:

- **At least 64 CPU cores** (cluster-wide, available to Akash workloads)
- **At least 128 GiB RAM** (cluster-wide, available to Akash workloads)

**Exception:** GPU providers who **do not** meet these CPU and memory minimums should join **[Akash Homenode](https://homenode.akash.network)** instead of applying for a standalone community audit. Homenode is for distributed consumer and prosumer GPU nodes with smaller CPU and memory footprints.

### CPU-only providers

Providers that **do not** advertise GPUs must meet the CPU and memory minimums above. Do not advertise `capabilities/gpu` or `cuda` if you have no GPUs.

### GPU providers

There is **no minimum GPU count** for audit. Advertise every GPU you run with matching on-chain capability keys — model, RAM, and interface keys for each model you offer.

GPU providers must meet the **64 core / 128 GiB RAM** minimums unless they enroll in **Homenode** (see above).

---

## Attribute requirements

**For audit, you must publish every attribute that applies to your provider.** If any required attribute is missing on-chain, **you will not pass audit**.

The only exceptions are **hardware and GPU keys you do not have**. Do not advertise GPUs, CUDA, or GPU capability keys if you do not run GPUs. Do not advertise persistent storage capability keys if you do not offer persistent storage.

Everything else in the checklist below is **required** — contact info, location, network, CPU/memory, SHM, endpoint features, and Discord.

Verify your attributes on-chain:

```bash
provider-services query provider get <your-provider-address> -o text
```

Canonical key names and allowed values: [provider-attributes.json](https://github.com/akash-network/console/blob/main/config/provider-attributes.json).

### Always required (every provider)

| On-chain key | Notes |
| ------------ | ----- |
| `host` | Must be `akash` |
| `tier` | Must be `community` for community audit |
| `organization` | Operator name |
| `email` | Working contact email |
| `discord-username` | Your Discord username (must match someone in Akash Discord with Provider role) |
| `website` | Organization website URL |
| `status-page` | Public status page URL (use your website if you have no separate status page) |
| `location-region` | [UN geoscheme](https://en.wikipedia.org/wiki/United_Nations_geoscheme) value — **not** the legacy `region` key |
| `country` | ISO 3166 Alpha-2 code |
| `city` | Three-letter city code |
| `timezone` | UTC offset (e.g. `utc-8`) |
| `location-type` | `datacenter`, `colo`, `home`, `office`, or `mix` |
| `hosting-provider` | Facility or cloud name (e.g. `hetzner`, `equinix`) |
| `capabilities/cpu` | `intel`, `amd`, or `arm` |
| `capabilities/cpu/arch` | e.g. `x86-64` |
| `capabilities/memory` | e.g. `ddr4`, `ddr5`, `ddr5ecc` |
| `network-provider` | ISP name |
| `network-speed-up` | Upload Mbps — **minimum 500** for audit |
| `network-speed-down` | Download Mbps — **minimum 500** for audit |
| `feat-shm` | Must be `true` |
| `capabilities/storage/2/class` | Must be `ram` |
| `capabilities/storage/2/persistent` | Must be `"false"` |
| `capabilities/ip-lease` | `"true"` or `"false"` — declare explicitly |
| `feat-endpoint-ip` | `"true"` or `"false"` — declare explicitly |
| `feat-endpoint-custom-domain` | `true` or `false` — declare explicitly |
| `feat-persistent-storage` | `true` or `false` — declare explicitly |

**Discord example:**

```yaml
- key: discord-username
  value: your_discord_username
```

Use the username reviewers can find in the Akash Discord server (without `@`).

### Required if you offer persistent storage

Set `feat-persistent-storage` to `true` and include **one** storage class (HDD, SSD, or NVMe):

| On-chain key | Value |
| ------------ | ----- |
| `capabilities/storage/1/class` | `beta1`, `beta2`, or `beta3` |
| `capabilities/storage/1/persistent` | `"true"` |

If you **do not** offer persistent storage, set `feat-persistent-storage` to `false` and omit the `capabilities/storage/1/*` keys.

### Required if you have GPUs

For each GPU model you offer, include the vendor, model, RAM, and interface keys from [provider-configs](https://github.com/akash-network/provider-configs):

| On-chain key | Notes |
| ------------ | ----- |
| `capabilities/gpu` | e.g. `nvidia` |
| `cuda` | CUDA version on GPU nodes (e.g. `12.7`) |
| `capabilities/gpu/vendor/<vendor>/model/<model>` | Base model key |
| `.../ram/<size>` | VRAM for that model |
| `.../interface/<iface>` | e.g. `pcie`, `sxm` |
| `.../interface/<iface>/ram/<size>` | Combined interface + RAM key |

See [Provider Attributes — GPU Capabilities](/docs/providers/operations/provider-attributes/#gpu-capabilities) for examples.

If you **do not** run GPUs, omit all `capabilities/gpu/*` keys and `cuda`.

### Required if you offer GPU interconnect (InfiniBand / RoCE)

If you advertise multi-node RDMA, include:

| On-chain key | Notes |
| ------------ | ----- |
| `capabilities/gpu-interconnect` | `"true"` |
| `capabilities/gpu-interconnect/fabric/infiniband` | If you offer InfiniBand |
| `capabilities/gpu-interconnect/fabric/roce` | If you offer RoCE |

See [Provider Attributes — GPU Interconnect](/docs/providers/operations/provider-attributes/#gpu-interconnect-infiniband--roce). Omit these keys if you have no InfiniBand/RoCE fabric.

### Attributes must match what you offer

On-chain attributes must match **every capability you advertise** — GPU models, GPU interconnect, SHM, persistent storage, IP leases, custom domains, and network speeds. Reviewers compare your attributes to the audit deployment and your live inventory.

---

## Deploy the audit benchmark

**SDL:** [standalone-audit.sdl.yaml](https://github.com/akash-network/community/blob/main/audit/standalone-audit.sdl.yaml)

### Use a separate tenant wallet

Deploy the audit workload from a **tenant wallet that is not your provider wallet**. Your provider account must **bid on** and **host** the deployment; it cannot be both owner and provider for the same lease.

- **Provider wallet** — the `akash1…` address registered as your provider (used in `provider.yaml` / on-chain provider record)
- **Tenant wallet** — a different wallet you use only to create the deployment, accept your provider's bid, and pay escrow

Fund the tenant wallet with **AKT** (gas) and **ACT** (deployment escrow). See [Deploy with Console Air](/docs/developers/deployment/console-air) or the [CLI installation guide](/docs/developers/deployment/cli/installation-guide).

### Prepare the SDL

1. Copy [standalone-audit.sdl.yaml](https://github.com/akash-network/community/blob/main/audit/standalone-audit.sdl.yaml).
2. Set **`AUDIT_PROVIDER_ID`** to your **provider owner address** (`akash1…`). Do not use a DDNS hostname or public IP.
3. Adjust CPU, memory, storage, and — only if they match what you advertise — GPU, persistent volume, and SHM so the manifest fits your capabilities.

### Option A: Deploy with Console Air

1. Open **[air.akash.network](https://air.akash.network)** and connect your **tenant** wallet (not your provider wallet).
2. Mint **ACT** if needed (Wallet Actions → Mint ACT).
3. Create a deployment and paste your edited SDL (Deploy → Empty Template or SDL Builder).
4. Click **Create Deployment**, set deposit, and approve the transaction in your wallet.
5. When bids arrive, **accept the bid from your provider only** — match the provider address to your provider owner `akash1…` address. Do not accept a bid from another provider.
6. After the lease is active, open the deployment's **HTTPS URL** (port **443**) from the Console Air dashboard.

See [Deploy with Console Air](/docs/developers/deployment/console-air) for the full walkthrough.

### Option B: Deploy with the CLI

Use a CLI key that is **not** your provider key:

```bash
# Tenant wallet (must differ from provider owner address)
export AKASH_KEY_NAME=audit-tenant
export AKASH_ACCOUNT_ADDRESS=$(provider-services keys show $AKASH_KEY_NAME -a)

# Create deployment from edited SDL
provider-services tx deployment create standalone-audit.sdl.yaml --from $AKASH_KEY_NAME -y

# Note deployment sequence (dseq) from the transaction output, then list bids
provider-services query market bid list --owner $AKASH_ACCOUNT_ADDRESS

# Accept YOUR provider's bid only (replace dseq and provider address)
export PROVIDER_ADDRESS=akash1YOUR_PROVIDER_OWNER
provider-services tx market lease create \
  --dseq <dseq> \
  --provider $PROVIDER_ADDRESS \
  --from $AKASH_KEY_NAME -y

# Send manifest to your provider
provider-services send-manifest standalone-audit.sdl.yaml \
  --dseq <dseq> \
  --provider $PROVIDER_ADDRESS \
  --from $AKASH_KEY_NAME
```

See [CLI common tasks — Create and Deploy](/docs/developers/deployment/cli/common-tasks#create-and-deploy-an-application) for more detail.

The deployment serves a **web UI over HTTPS on port 443**. Share that URL with reviewers when benchmarks finish.

### After the deployment is live

1. Open the **HTTPS URL** from the lease (port **443**).
2. The UI runs benchmarks; a full run is often **~1 hour**, depending on profile and GPU.
3. **Do not open a GitHub issue** until **all tests pass** in the UI.
4. Keep the deployment running until a reviewer confirms they are done.

---

## Request the audit

When benchmarks have **finished and all tests pass**, open a **[Provider Audit]** issue in the [Akash community GitHub](https://github.com/akash-network/community/issues/new) and include:

- **Provider owner address** (`akash1…`)
- **HTTPS URL** of the audit deployment
- **Discord username** (must match your on-chain `discord-username` attribute)
- **Email** (must match your on-chain `email`)
- **Name** (optional): a stable label such as an FQDN you control — not a DDNS hostname or public IP

A reviewer will verify attributes, Discord membership, benchmark results, and follow up in the issue. If something fails, fix it, redeploy if needed, and update the thread.

---

## Quick pre-audit checklist

- [ ] [Hardware requirements](#hardware-requirements) met (500 Mbps up/down; 64 cores + 128 GiB RAM, or enrolled in [Homenode](https://homenode.akash.network) if below CPU/memory minimums)
- [ ] All [always-required](#always-required-every-provider) attributes set on-chain
- [ ] `discord-username` set and you are in Akash Discord with Provider role
- [ ] Persistent storage keys present **only if** you offer persistent storage
- [ ] GPU / CUDA keys present **only if** you have GPUs, with full capability keys per model
- [ ] SHM keys present (`feat-shm`, storage index 2)
- [ ] `*.ingress.<yourdomain>` resolves; wildcard TLS works
- [ ] No DDNS hostnames
- [ ] Audit SDL deployed from a **tenant wallet** (not your provider wallet); bid accepted from **your provider only**
- [ ] Audit UI tests **all passing**
- [ ] GitHub issue opened with address, URL, Discord, and email

---

## Related resources

- [Provider Attributes](/docs/providers/operations/provider-attributes)
- [Provider Verification](/docs/providers/operations/provider-verification)
- [Deploy with Console Air](/docs/developers/deployment/console-air)
- [CLI common tasks](/docs/developers/deployment/cli/common-tasks)
- [Community audit guide](https://github.com/akash-network/community/blob/main/audit/README.md)
- [Provider attributes schema](https://github.com/akash-network/console/blob/main/config/provider-attributes.json)

**Questions?** Join [#provider-support on Discord](https://discord.com/channels/747885925232672829/1067866274432274442)
