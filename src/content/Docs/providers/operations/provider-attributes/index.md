---
categories: ["Providers"]
tags: ["Operations", "Configuration", "Attributes"]
weight: 4
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
- **Recommended**: Yes

```yaml
- key: email
  value: support@example.com
```

### website

- **Value**: Provider website URL
- **Purpose**: Marketing and information
- **Recommended**: Yes

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

- **Value**: UN geoscheme region
- **Purpose**: Regional classification
- **Examples**:
  - `us-west`, `us-east`, `us-central`
  - `eu-west`, `eu-east`
  - `ap-southeast`, `ap-northeast`

```yaml
- key: location-region
  value: us-west
```

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

### hardware-cpu

- **Values**: `intel`, `amd`, `apple`
- **Purpose**: CPU vendor identification

```yaml
- key: hardware-cpu
  value: amd
```

### hardware-cpu-arch

- **Values**: `x86-64`, `arm64`, `arm`
- **Purpose**: CPU architecture

```yaml
- key: hardware-cpu-arch
  value: x86-64
```

### hardware-gpu

- **Values**: `nvidia`
- **Purpose**: GPU vendor (if GPUs available)

```yaml
- key: hardware-gpu
  value: nvidia
```

### hardware-gpu-model

- **Value**: Comma-separated GPU models
- **Purpose**: Advertise available GPU models
- **Examples**: `rtx4090`, `a100`, `h100`, `rtx3090`

```yaml
- key: hardware-gpu-model
  value: rtx4090,rtx3090
```

### hardware-disk

- **Values**: `ssd`, `nvme`, `hdd`, `mix`
- **Purpose**: Storage type classification

```yaml
- key: hardware-disk
  value: nvme
```

### hardware-memory

- **Values**: `ddr4`, `ddr5`, `ecc`, `mix`
- **Purpose**: RAM type

```yaml
- key: hardware-memory
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
- **Note**: Requires Rook-Ceph or similar

```yaml
- key: feat-persistent-storage
  value: true
```

### feat-persistent-storage-type

- **Values**: `beta1`, `beta2`, `beta3` (storage classes)
- **Purpose**: Advertise available storage types

```yaml
- key: feat-persistent-storage-type
  value: beta2
```

### feat-endpoint-ip

- **Values**: `true`, `false`
- **Purpose**: Advertise IP lease support

```yaml
- key: feat-endpoint-ip
  value: true
```

### feat-endpoint-custom-domain

- **Values**: `true`, `false`
- **Purpose**: Advertise custom domain support

```yaml
- key: feat-endpoint-custom-domain
  value: true
```

---

## GPU Capabilities

For GPU providers, use the standardized GPU attribute format.

### GPU Attribute Format

```
capabilities/gpu/vendor/<vendor>/model/<model>
```

**Examples:**

```yaml
# Basic GPU model
- key: capabilities/gpu/vendor/nvidia/model/rtx4090
  value: true

# GPU with RAM specification
- key: capabilities/gpu/vendor/nvidia/model/rtx4090/ram/24Gi
  value: true

# GPU with interface type
- key: capabilities/gpu/vendor/nvidia/model/a100/interface/sxm
  value: true
```

### GPU Vendors

- `nvidia` - NVIDIA GPUs

### GPU Interface Types

- `pcie` - PCIe connected (most common)
- `sxm` - SXM form factor (data center)
- `mig` - Multi-Instance GPU

### RAM Sizes

Common values: `8Gi`, `12Gi`, `16Gi`, `24Gi`, `32Gi`, `40Gi`, `48Gi`, `80Gi`

### Multiple GPU Models

If you have different GPU models across nodes:

```yaml
attributes:
  # RTX 4090
  - key: capabilities/gpu/vendor/nvidia/model/rtx4090
    value: true
  - key: capabilities/gpu/vendor/nvidia/model/rtx4090/ram/24Gi
    value: true
  
  # RTX 3090
  - key: capabilities/gpu/vendor/nvidia/model/rtx3090
    value: true
  - key: capabilities/gpu/vendor/nvidia/model/rtx3090/ram/24Gi
    value: true
```

**Important:** Each node should only have one GPU model. Don't mix GPU types on a single node.

### Adding New GPU Models

If your GPU isn't in the [provider-configs database](https://github.com/akash-network/provider-configs), submit it:

1. Visit [provider-configs repository](https://github.com/akash-network/provider-configs)
2. Follow the GPU submission process in the README
3. Wait for approval (typically 1-3 business days)
4. Update your provider attributes

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
  - key: website
    value: https://mygpuprovider.com
  
  # Location
  - key: location-region
    value: us-west
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
  - key: hardware-cpu
    value: amd
  - key: hardware-cpu-arch
    value: x86-64
  - key: hardware-gpu
    value: nvidia
  - key: hardware-gpu-model
    value: rtx4090
  - key: hardware-disk
    value: nvme
  - key: hardware-memory
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
  - key: feat-persistent-storage-type
    value: beta2
  - key: feat-endpoint-ip
    value: true
  - key: feat-endpoint-custom-domain
    value: true
  
  # GPU Capabilities
  - key: capabilities/gpu/vendor/nvidia/model/rtx4090
    value: true
  - key: capabilities/gpu/vendor/nvidia/model/rtx4090/ram/24Gi
    value: true
  - key: capabilities/gpu/vendor/nvidia/model/rtx4090/interface/pcie
    value: true
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
- [Provider Configs Repository](https://github.com/akash-network/provider-configs)
