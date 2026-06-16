---
categories: ["Providers"]
tags: ["Operations", "Configuration", "Attributes"]
weight: 7
title: "Provider Attributes"
linkTitle: "Provider Attributes"
description: "Configure provider attributes to advertise your capabilities to tenants"
---

Provider attributes allow you to advertise your provider's capabilities, location, hardware, and features to potential tenants. These attributes help the Akash network match deployments with providers that meet specific requirements.

## Why Attributes Matter

Accurate provider attributes enable:

- **Better Deployment Matching**: Tenants can find providers with specific capabilities
- **Geographic Selection**: Tenants can deploy to specific regions or countries
- **Hardware Requirements**: Match deployments to specific CPU, GPU, or storage types
- **Feature Discovery**: Advertise support for persistent storage, IP leases, custom domains
- **Transparency**: Build trust by sharing provider details (organization, location, contact)

## Attribute Configuration

Attributes are defined in your `provider.yaml` file under the `attributes` section:

```yaml
attributes:
  - key: host
    value: akash
  - key: tier
    value: community
  - key: organization
    value: my-provider-org
```

After updating attributes, restart your provider:

```bash
cd /root/provider
helm upgrade akash-provider akash/provider \
  -n akash-services \
  -f provider.yaml \
  --set bidpricescript="$(cat price_script.sh | openssl base64 -A)"
```

---

## Standard Attributes

Basic information about your provider.

### host

- **Value**: `akash`
- **Purpose**: Identifies provider as Akash Network member
- **Required**: Yes

```yaml
- key: host
  value: akash
```

### tier

- **Value**: `community`
- **Purpose**: Provider tier classification
- **Required**: Yes

```yaml
- key: tier
  value: community
```

### organization

- **Value**: Your organization name
- **Purpose**: Provider operator identification
- **Example**: `my-company`

```yaml
- key: organization
  value: my-provider-org
```

### email

- **Value**: Contact email address
- **Purpose**: Support and communication
- **Required**: Yes

```yaml
- key: email
  value: support@example.com
```

### discord-username

- **Value**: Your Discord username (without `@`)
- **Purpose**: Contact for audit and provider support
- **Required for audit**: Yes — audited providers must be in the [Akash Discord](https://discord.gg/akash) with the Provider role

```yaml
- key: discord-username
  value: your_discord_username
```

See [Provider Audit](/docs/providers/operations/provider-audit) for full audit attribute requirements.

### website

- **Value**: Provider website URL
- **Purpose**: Marketing and information
- **Required for audit**: Yes

```yaml
- key: website
  value: https://example.com
```

### status-page

- **Value**: Status page URL
- **Purpose**: Service health monitoring
- **Optional**: Yes

```yaml
- key: status-page
  value: https://status.example.com
```

---

## Location Attributes

Geographic and facility information.

### country

- **Value**: ISO 3166 Alpha-2 country code
- **Purpose**: Country identification
- **Examples**: `US`, `GB`, `DE`, `JP`, `SG`
- **Recommended**: Yes

```yaml
- key: country
  value: US
```

### city

- **Value**: Three-letter city code
- **Purpose**: City identification
- **Examples**: `NYC`, `LAX`, `LON`, `FRA`, `SIN`

```yaml
- key: city
  value: LAX
```

### location-region

- **Value**: [UN geoscheme](https://en.wikipedia.org/wiki/United_Nations_geoscheme) region code
- **Purpose**: Regional classification for deployment matching
- **Required**: Yes
- **Note**: Use the key `location-region`. The legacy `region` key is not supported.
- **Examples**:
  - `na-us-west`, `na-us-northeast`, `na-us-midwest`
  - `eu-west`, `eu-central`, `eu-north`
  - `as-east`, `as-southeast`, `oc-aus`

```yaml
- key: location-region
  value: na-us-west
```

See the [provider attributes schema](https://github.com/akash-network/console/blob/main/config/provider-attributes.json) for the full list of accepted region values.

### timezone

- **Value**: UTC offset (e.g., `utc-8`, `utc+1`)
- **Purpose**: Time zone identification

```yaml
- key: timezone
  value: utc-8
```

### location-type

- **Values**: `datacenter`, `colo`, `home`, `office`, `mix`
- **Purpose**: Hosting environment classification

```yaml
- key: location-type
  value: datacenter
```

### hosting-provider

- **Value**: Data center or cloud provider name
- **Purpose**: Facility identification
- **Examples**: `equinix`, `aws`, `azure`, `ovh`, `hetzner`

```yaml
- key: hosting-provider
  value: equinix
```

---

## Hardware Attributes

CPU, GPU, storage, and memory specifications.

### capabilities/cpu

- **Values**: `intel`, `amd`, `arm`
- **Purpose**: CPU vendor identification
- **Required**: Yes

```yaml
- key: capabilities/cpu
  value: amd
```

### capabilities/cpu/arch

- **Values**: `x86`, `x86-64`, `arm`, `arm-64`
- **Purpose**: CPU architecture

```yaml
- key: capabilities/cpu/arch
  value: x86-64
```

### capabilities/gpu

- **Values**: `nvidia`, `amd`, `intel`, `xilinx`
- **Purpose**: GPU vendor (if GPUs available)

```yaml
- key: capabilities/gpu
  value: nvidia
```

### GPU models (capabilities/gpu/vendor/...)

- **Purpose**: Advertise available GPU models
- **Format**: One attribute per model, synced from [provider-configs](https://github.com/akash-network/provider-configs/blob/main/devices/pcie/gpus.json)
- **Examples**: `rtx4090`, `a100`, `h100`, `gtx1050` (lowercase, no spaces)

```yaml
- key: capabilities/gpu/vendor/nvidia/model/rtx4090
  value: "true"
- key: capabilities/gpu/vendor/nvidia/model/a100
  value: "true"
```

See [GPU Capabilities](#gpu-capabilities) below for RAM and interface sub-keys.

### cuda

- **Value**: CUDA version string (for example `12.7`, `13.0`)
- **Purpose**: Advertise the CUDA version available on GPU nodes

```yaml
- key: cuda
  value: "12.7"
```

### capabilities/memory

- **Values**: `ddr2`, `ddr3`, `ddr3ecc`, `ddr4`, `ddr4ecc`, `ddr5`, `ddr5ecc`
- **Purpose**: RAM type
- **Required**: Yes

```yaml
- key: capabilities/memory
  value: ddr5
```

### hardware-energy-source

- **Values**: `solar`, `wind`, `nuclear`, `coal`, `mix`, `unknown`
- **Purpose**: Energy source transparency

```yaml
- key: hardware-energy-source
  value: solar
```

### hardware-cooling

- **Values**: `free`, `air`, `liquid`
- **Purpose**: Cooling system type
- **Note**: `free` = free cooling (outside air)

```yaml
- key: hardware-cooling
  value: liquid
```

---

## Network Attributes

Internet connectivity specifications.

### network-provider

- **Value**: ISP name
- **Purpose**: Network provider identification

```yaml
- key: network-provider
  value: level3
```

### network-speed-up

- **Value**: Upload speed in Mbps
- **Purpose**: Advertise upload bandwidth

```yaml
- key: network-speed-up
  value: 10000
```

### network-speed-down

- **Value**: Download speed in Mbps
- **Purpose**: Advertise download bandwidth

```yaml
- key: network-speed-down
  value: 10000
```

---

## Feature Attributes

Advertise support for advanced features.

### feat-persistent-storage

- **Values**: `true`, `false`
- **Purpose**: Advertise persistent storage availability
- **Required**: Yes
- **Note**: Requires Rook-Ceph or similar. Also set the storage class capability keys below when `true`.

```yaml
- key: feat-persistent-storage
  value: true
```

### capabilities/storage/1/class

- **Values**: `beta1`, `beta2`, `beta3`
- **Purpose**: Primary persistent storage class
- **Required**: Yes (if you have persistent storage)

```yaml
- key: capabilities/storage/1/class
  value: beta3
```

| Value   | Storage type |
| ------- | ------------ |
| `beta1` | HDD          |
| `beta2` | SSD          |
| `beta3` | NVMe         |

### capabilities/storage/1/persistent

- **Values**: `"true"`, `"false"`
- **Purpose**: Indicate that storage class 1 provides persistent storage
- **Required**: Yes (if you have persistent storage)

```yaml
- key: capabilities/storage/1/persistent
  value: "true"
```

**Complete persistent storage example:**

```yaml
- key: feat-persistent-storage
  value: true
- key: capabilities/storage/1/class
  value: beta3
- key: capabilities/storage/1/persistent
  value: "true"
```

> **Important:** You can only advertise **one persistent storage class** per provider. Choose either beta1 (HDD), beta2 (SSD), or beta3 (NVMe) based on what you configured in Rook-Ceph.

### feat-shm

- **Values**: `true`, `false`
- **Purpose**: Advertise shared memory (SHM) support via the `ram` storage class
- **Recommended**: Yes (all providers should support SHM)

```yaml
- key: feat-shm
  value: true
```

### capabilities/storage/2/class (SHM/Shared Memory)

- **Value**: `ram`
- **Purpose**: SHM storage class (separate from persistent storage at index 1)
- **Required**: Yes (if advertising SHM)

```yaml
- key: capabilities/storage/2/class
  value: ram
```

### capabilities/storage/2/persistent (SHM)

- **Value**: `"false"`
- **Purpose**: SHM is non-persistent
- **Required**: Yes (if advertising SHM)

```yaml
- key: capabilities/storage/2/persistent
  value: "false"
```

**Complete storage example with persistent storage and SHM:**

```yaml
# Persistent storage (index 1)
- key: feat-persistent-storage
  value: true
- key: capabilities/storage/1/class
  value: beta3
- key: capabilities/storage/1/persistent
  value: "true"

# SHM/Shared Memory (index 2)
- key: feat-shm
  value: true
- key: capabilities/storage/2/class
  value: ram
- key: capabilities/storage/2/persistent
  value: "false"
```

> **Note:** All providers should support SHM for deployments requiring shared memory. This is configured in the inventory operator during provider installation.

### capabilities/ip-lease

- **Values**: `"true"`, `"false"`
- **Purpose**: Advertise IP lease support (requires MetalLB + `akash-ip-operator`, and `ipoperator: true` in `provider.yaml`)

```yaml
- key: capabilities/ip-lease
  value: "true"
- key: feat-endpoint-ip
  value: "true"
```

Both `capabilities/ip-lease` and `feat-endpoint-ip` should be set when offering IP leases.
### feat-endpoint-custom-domain

- **Values**: `true`, `false`
- **Purpose**: Advertise custom domain support

```yaml
- key: feat-endpoint-custom-domain
  value: true
```

### tee/type

- **Values**: `cpu`, `cpu-gpu`
- **Purpose**: Advertise Trusted Execution Environment (Confidential Compute) support
- **Required**: Only if your provider supports TEE workloads

| Value | Description |
|-------|-------------|
| `cpu` | CPU-only confidential VMs (AMD SEV-SNP or Intel TDX) |
| `cpu-gpu` | Confidential VMs with NVIDIA GPU Confidential Computing (AMD SEV-SNP or Intel TDX) |

The actual hardware platform (`snp` or `tdx`) is detected by the provider from Kubernetes node labels at runtime and is not advertised as a provider attribute.

```yaml
- key: tee/type
  value: cpu
```

> See [Confidential Compute Setup](/docs/providers/setup-and-installation/kubespray/confidential-compute) for full TEE configuration instructions.

---

## GPU Capabilities

For GPU providers, advertise models and their RAM/interface variants using the standardized capability key format. Valid keys are synced from the [provider-configs](https://github.com/akash-network/provider-configs) GPU database.

### GPU Attribute Format

```
capabilities/gpu/vendor/<vendor>/model/<model>
capabilities/gpu/vendor/<vendor>/model/<model>/ram/<size>
capabilities/gpu/vendor/<vendor>/model/<model>/interface/<iface>
capabilities/gpu/vendor/<vendor>/model/<model>/ram/<size>/interface/<iface>
```

**Example for NVIDIA RTX 4090 (PCIe, 24Gi):**

```yaml
- key: capabilities/gpu/vendor/nvidia/model/rtx4090
  value: "true"
- key: capabilities/gpu/vendor/nvidia/model/rtx4090/ram/24Gi
  value: "true"
- key: capabilities/gpu/vendor/nvidia/model/rtx4090/interface/pcie
  value: "true"
- key: capabilities/gpu/vendor/nvidia/model/rtx4090/ram/24Gi/interface/pcie
  value: "true"
```

### GPU Vendors

- `nvidia` — NVIDIA GPUs
- `amd` — AMD GPUs (for example `mi100`, `mi60`)

### GPU Interface Types

- `pcie` — PCIe connected (most common)
- `sxm` — SXM form factor (data center)
- `mig` — Multi-Instance GPU

### RAM Sizes

Common values: `8Gi`, `12Gi`, `16Gi`, `24Gi`, `32Gi`, `40Gi`, `48Gi`, `80Gi`

### Multiple GPU Models

If you have different GPU models across nodes, list each model with its RAM and interface keys:

```yaml
attributes:
  # RTX 4090
  - key: capabilities/gpu/vendor/nvidia/model/rtx4090
    value: "true"
  - key: capabilities/gpu/vendor/nvidia/model/rtx4090/ram/24Gi
    value: "true"
  - key: capabilities/gpu/vendor/nvidia/model/rtx4090/interface/pcie
    value: "true"
  - key: capabilities/gpu/vendor/nvidia/model/rtx4090/ram/24Gi/interface/pcie
    value: "true"

  # RTX 3090
  - key: capabilities/gpu/vendor/nvidia/model/rtx3090
    value: "true"
  - key: capabilities/gpu/vendor/nvidia/model/rtx3090/ram/24Gi
    value: "true"
  - key: capabilities/gpu/vendor/nvidia/model/rtx3090/interface/pcie
    value: "true"
  - key: capabilities/gpu/vendor/nvidia/model/rtx3090/ram/24Gi/interface/pcie
    value: "true"
```

**Important:** Each node should only have one GPU model. Don't mix GPU types on a single node.

### Adding New GPU Models

If your GPU isn't in the [provider-configs database](https://github.com/akash-network/provider-configs), submit it:

1. Visit the [provider-configs repository](https://github.com/akash-network/provider-configs)
2. Follow the GPU submission process in the README
3. Wait for approval (typically 1–3 business days)
4. Update your provider attributes with the approved capability keys

---

## Complete Example

Here's a complete `provider.yaml` attributes section:

```yaml
attributes:
  # Standard
  - key: host
    value: akash
  - key: tier
    value: community
  - key: organization
    value: my-gpu-provider
  - key: email
    value: support@mygpuprovider.com
  - key: discord-username
    value: mygpuprovider
  - key: website
    value: https://mygpuprovider.com

  # Location
  - key: location-region
    value: na-us-west
  - key: country
    value: US
  - key: city
    value: LAX
  - key: timezone
    value: utc-8
  - key: location-type
    value: datacenter
  - key: hosting-provider
    value: equinix

  # Hardware
  - key: capabilities/cpu
    value: amd
  - key: capabilities/cpu/arch
    value: x86-64
  - key: capabilities/gpu
    value: nvidia
  - key: capabilities/memory
    value: ddr5

  # Network
  - key: network-provider
    value: level3
  - key: network-speed-up
    value: 10000
  - key: network-speed-down
    value: 10000

  # Features
  - key: feat-persistent-storage
    value: true
  - key: feat-shm
    value: true
  - key: capabilities/ip-lease
    value: "true"
  - key: feat-endpoint-ip
    value: "true"
  - key: feat-endpoint-custom-domain
    value: true

  # Persistent Storage (required if you have Rook-Ceph)
  - key: capabilities/storage/1/class
    value: beta2
  - key: capabilities/storage/1/persistent
    value: "true"

  # SHM/Shared Memory (recommended for all providers)
  - key: capabilities/storage/2/class
    value: ram
  - key: capabilities/storage/2/persistent
    value: "false"

  # GPU Capabilities
  - key: capabilities/gpu/vendor/nvidia/model/rtx4090
    value: "true"
  - key: capabilities/gpu/vendor/nvidia/model/rtx4090/ram/24Gi
    value: "true"
  - key: capabilities/gpu/vendor/nvidia/model/rtx4090/interface/pcie
    value: "true"
  - key: capabilities/gpu/vendor/nvidia/model/rtx4090/ram/24Gi/interface/pcie
    value: "true"
  - key: cuda
    value: "12.7"

  # Confidential Compute (if TEE hardware is available)
  # - key: tee/type
  #   value: cpu
```

---

## Verify Attributes

After updating your provider, verify attributes are registered:

```bash
provider-services query provider get <your-provider-address>
```

Look for your attributes in the `attributes` section of the output.

---

## Related Resources

- [Provider Installation](/docs/providers/setup-and-installation/kubespray/provider-installation)
- [GPU Support Setup](/docs/providers/setup-and-installation/kubespray/gpu-support)
- [Confidential Compute Setup](/docs/providers/setup-and-installation/kubespray/confidential-compute) — TEE configuration guide
- [Provider Audit](/docs/providers/operations/provider-audit) — Official audit process and attribute checklist
- [Provider Attributes Schema](https://github.com/akash-network/console/blob/main/config/provider-attributes.json) (canonical key list)
- [Provider Configs Repository](https://github.com/akash-network/provider-configs)
