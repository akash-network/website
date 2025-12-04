---
title: "Akash Provider Audit Process"
linkTitle: "Akash Provider Audit Process"
description: "Guide to get your Akash Provider audited."
weight: 3 # Adjust weight relative to other sections under Providers
---


This guide explains how to get your Akash provider audited by the core team, allowing you to bid on deployments that request audited providers and join the trusted provider network.

## Overview

The audit process verifies that your provider meets all technical requirements and operates reliably. Once audited, your provider will be able to accept deployment requests from the broader Akash community.

**Timeline:** Typically 1-3 business days after submitting your audit request.

## Prerequisites

Before requesting an audit, you **must** complete and verify all applicable requirements below. Testing should be done using a **different AKT account** than the one your provider uses.

### 1. Required Provider Attributes

Your provider must have the following attributes configured:

```bash
provider-services query provider get <provider_akash1_address> --node=https://rpc.akashnet.net:443
```

**Required output:**

```yaml
attributes:
  - key: host
    value: akash
  - key: tier
    value: community
  - key: organization
    value: <your_organization_name>

info:
  email: "your@email.com"
  website: "yourwebsite.com"
```

**Requirements:**
- `host: akash` and `tier: community` are mandatory
- `organization` must be set to your organization name
- At least one of `email` or `website` must be populated (both recommended)
- Additional attributes (GPU, persistent storage, IP leases) must accurately reflect your actual capabilities

### 2. DNS Configuration

**Note:** Provider URL refers to your provider's domain name. In the examples below, replace `yourdomain.com` with your actual domain.

#### Provider URL Resolution

Test that your provider URL resolves correctly:

```bash
ping provider.yourdomain.com
```

**Expected result:** 
```
PING provider.yourdomain.com (203.0.113.10): 56 data bytes
64 bytes from 203.0.113.10: icmp_seq=0 ttl=54 time=12.345 ms
```

**Example using a real provider:**
```bash
ping provider.hurricane.akash.pub
# Should resolve to the provider's IP address
```

#### Ingress URL Resolution

Test wildcard ingress resolution:

```bash
host anything.ingress.yourdomain.com
```

**Expected result:** 
```
anything.ingress.yourdomain.com has address 203.0.113.10
```

**Example using a real provider:**
```bash
host test.ingress.hurricane.akash.pub
# Output: test.ingress.hurricane.akash.pub has address 147.75.195.10
```

### 3. Network and Port Configuration

Ensure the following ports are open and accessible:
- **80** (HTTP)
- **443** (HTTPS)
- **8443** (Provider status endpoint)
- **8444** (Provider gRPC endpoint)
- **30000-32767** (NodePort range)

See the [firewall configuration documentation](/docs/providers/build-a-cloud-provider/akash-cloud-provider-build-with-helm-charts/#firewall-rule-creation) for detailed setup instructions.

### 4. Provider Status Endpoints

#### HTTP Status Endpoint

```bash
curl -sk https://provider.yourdomain.com:8443/status | jq
```

**Expected result:** JSON response with cluster information, example:
```json
{
  "cluster": {
    "leases": 15,
    "inventory": {
      "active": [
        {
          "cpu": 32000,
          "memory": 67108864000,
          "storage": [
            {
              "class": "default",
              "quantity": 1099511627776
            }
          ]
        }
      ]
    }
  },
  "bidengine": {
    "orders": 42
  },
  "manifest": {
    "deployments": 15
  }
}
```

#### gRPC Status Endpoint

```bash
grpcurl -insecure provider.yourdomain.com:8444 akash.provider.v1.ProviderRPC.GetStatus
```

**Expected result:** JSON response similar to:
```json
{
  "cluster": {
    "leases": 15,
    "inventory": {
      "cluster": {
        "nodes": 3,
        "cpu": 96000,
        "memory": 201326592000,
        "storage": [
          {
            "class": "default",
            "quantity": 3298534883328
          }
        ]
      },
      "active": {
        "cpu": 32000,
        "memory": 67108864000,
        "storage": [
          {
            "class": "default",
            "quantity": 1099511627776
          }
        ]
      }
    }
  },
  "bidengine": {
    "orders": 42
  },
  "manifest": {
    "deployments": 15
  }
}
```
### 5. TLS/SSL Certificate Verification

Verify that your provider's TLS certificates are properly configured with Let's Encrypt.

#### Check Provider Endpoint Certificate
```bash
echo | openssl s_client -servername provider.yourdomain.com -connect provider.yourdomain.com:8443 2>/dev/null | openssl x509 -noout -issuer -subject -dates
```

**Expected result:**
- issuer=C = US, O = Let's Encrypt, CN = R3
- subject=CN = provider.yourdomain.com
- notBefore=Nov  1 12:00:00 2024 GMT
- notAfter=Jan 30 12:00:00 2025 GMT

**Requirements:**
- Issuer should be "Let's Encrypt"
- Subject should match your provider domain
- Certificate should not be expired (notAfter date should be in the future)
- Certificate should be valid (notBefore date should be in the past)

#### Check Ingress Certificate
```bash
echo | openssl s_client -servername test.ingress.yourdomain.com -connect test.ingress.yourdomain.com:443 2>/dev/null | openssl x509 -noout -issuer -subject -dates
```

**Expected result:** Similar to above, with:
- Let's Encrypt as the issuer
- Valid, non-expired certificate
- Wildcard certificate (ingress.yourdomain.com) or specific domain match


### 6. Deployment Testing

You must successfully test the following on your own provider before requesting an audit:

#### Basic Deployment Test

Deploy a simple application (e.g., speedtest) to verify:
- Provider responds to orders
- Deployments complete successfully
- Basic functionality works

**Example SDL for basic deployment:**

```yaml
---
version: "2.0"

services:
  web:
    image: nginx:latest
    expose:
      - port: 80
        as: 80
        to:
          - global: true

profiles:
  compute:
    web:
      resources:
        cpu:
          units: 0.5
        memory:
          size: 512Mi
        storage:
          size: 512Mi
  placement:
    dcloud:
      attributes:
        host: akash
      pricing:
        web:
          denom: uakt
          amount: 1000

deployment:
  web:
    dcloud:
      profile: web
      count: 1
```

#### Ingress Test

Deploy an application that exposes port 80 (e.g., speedtest) to verify:
- HTTP/HTTPS ingress works
- Domain routing functions correctly

**Example SDL for ingress testing:**

```yaml
---
version: "2.0"

services:
  speedtest:
    image: adolfintel/speedtest:latest
    expose:
      - port: 80
        as: 80
        to:
          - global: true
        accept:
          - speedtest.yourdomain.com

profiles:
  compute:
    speedtest:
      resources:
        cpu:
          units: 0.5
        memory:
          size: 512Mi
        storage:
          size: 512Mi
  placement:
    dcloud:
      pricing:
        speedtest:
          denom: uakt
          amount: 1000

deployment:
  speedtest:
    dcloud:
      profile: speedtest
      count: 1
```

#### NodePort Test

Deploy Ubuntu and test SSH access via NodePort to verify:
- NodePort range is accessible
- Port forwarding works correctly

**Example SDL for NodePort testing:**

```yaml
---
version: "2.0"

services:
  ubuntu:
    image: ubuntu:22.04
    command:
      - "sh"
      - "-c"
    args:
      - 'apt-get update && apt-get install -y openssh-server && mkdir /var/run/sshd && echo "root:akash" | chpasswd && sed -i "s/#PermitRootLogin prohibit-password/PermitRootLogin yes/" /etc/ssh/sshd_config && /usr/sbin/sshd -D'
    expose:
      - port: 22
        as: 22
        to:
          - global: true
        proto: tcp

profiles:
  compute:
    ubuntu:
      resources:
        cpu:
          units: 0.5
        memory:
          size: 512Mi
        storage:
          size: 1Gi
  placement:
    dcloud:
      pricing:
        ubuntu:
          denom: uakt
          amount: 1000

deployment:
  ubuntu:
    dcloud:
      profile: ubuntu
      count: 1
```

**To test SSH access:**
```bash
# After deployment, get the NodePort from the lease
ssh root@provider-ip -p <nodeport>
# Password: akash
```

#### Network Connectivity Test

From any deployment, verify internet access:

```bash
apt update
```

**Expected result:** Successful connection to package repositories

### 7. Optional Feature Testing

If your provider offers additional features, you must test them:

#### GPU Support (if applicable)

If your provider advertises GPU support, you must verify it works correctly.

Deploy a GPU-enabled application using the SDL below:

**Example SDL for GPU testing:**
```yaml
---
version: "2.0"

services:
  gpu-test:
    image: nvidia/cuda:11.8.0-base-ubuntu22.04
    command:
      - "sh"
      - "-c"
    args:
      - 'sleep infinity'
    expose:
      - port: 80
        as: 80
        to:
          - global: true

profiles:
  compute:
    gpu-test:
      resources:
        cpu:
          units: 1
        memory:
          size: 2Gi
        storage:
          size: 5Gi
        gpu:
          units: 1
          attributes:
            vendor:
              nvidia:
  placement:
    dcloud:
      attributes:
        host: akash
      pricing:
        gpu-test:
          denom: uakt
          amount: 10000

deployment:
  gpu-test:
    dcloud:
      profile: gpu-test
      count: 1
```

**To verify GPU functionality:**

1. Shell into the deployment
2. Run the following command:
```bash
nvidia-smi
```

**Expected result:** The command should display GPU information including GPU model, driver version, and current utilization.

#### Persistent Storage (if applicable)

Deploy speedtest-tracker with persistent storage configured:
- Adjust the storage class in your SDL to match your provider's configuration
- Verify data persists across deployment restarts

**Example SDL for persistent storage testing:**

```yaml
---
version: "2.0"

services:
  speedtest-tracker:
    image: lscr.io/linuxserver/speedtest-tracker:latest
    env:
      - "PUID=1000"
      - "PGID=1000"
      - "DB_CONNECTION=sqlite"
    expose:
      - port: 80
        as: 80
        to:
          - global: true
        accept:
          - speedtest-tracker.yourdomain.com

profiles:
  compute:
    speedtest-tracker:
      resources:
        cpu:
          units: 0.5
        memory:
          size: 512Mi
        storage:
          - size: 1Gi
          - size: 5Gi
            attributes:
              persistent: true
              class: beta3  # Adjust based on your provider's storage class
  placement:
    dcloud:
      attributes:
        host: akash
      pricing:
        speedtest-tracker:
          denom: uakt
          amount: 5000

deployment:
  speedtest-tracker:
    dcloud:
      profile: speedtest-tracker
      count: 1
```

**Note:** Replace `class: beta3` with your provider's actual storage class name (e.g., `beta1`, `beta2`, `nvme`, etc.)

#### IP Leases (if applicable)

Deploy an application requiring a dedicated IP address and verify:
- IP assignment works correctly
- External connectivity functions as expected

Contact the team on Discord (#providers channel) for assistance with IP lease testing.

## How to Request an Audit

Once you've completed and verified all applicable prerequisites:

### 1. Create a GitHub Issue

Go to the [Akash Network Support repository](https://github.com/akash-network/support/issues) and create a new issue.

### 2. Use the Correct Format

**Issue Title:**
```
[Provider Audit] provider.yourdomain.com
```

**Issue Template:**

```markdown
## Provider Information
- **Provider Address:** akash1...
- **Provider URI:** provider.yourdomain.com
- **Organization:** Your Organization Name
- **Contact Email:** your@email.com
- **Website:** yourwebsite.com

## Checklist
I confirm that I have tested and verified the following:

- [ ] Provider URI name resolution works
- [ ] Ingress URI name resolution works
- [ ] Provider status endpoint (port 8443) works
- [ ] Provider gRPC endpoint (port 8444) works
- [ ] Provider responds to orders
- [ ] Basic deployment works
- [ ] Ingress (port 80) works
- [ ] NodePort works
- [ ] Network connectivity works
- [ ] Provider attributes are correctly configured
- [ ] GPU functionality works (if applicable)
- [ ] Persistent storage works (if applicable)
- [ ] IP leases work (if applicable)

## Additional Notes
[Any additional information about your provider setup or capabilities]
```

### 3. Examples of Successful Audits

Reference these GitHub issues for examples:
- [Issue #1047](https://github.com/akash-network/community/issues/1047)
- [Issue #1029](https://github.com/akash-network/community/issues/1029)

## What Happens During the Audit

The core team will verify:

1. **DNS Resolution:** Both provider and ingress URIs resolve correctly
2. **Endpoint Accessibility:** Status endpoints respond properly
3. **Deployment Functionality:** Test deployments can be created and run
4. **Network Connectivity:** Deployed workloads can access the internet
5. **Ingress/NodePort:** External access methods work correctly
6. **Attributes Accuracy:** Provider attributes match actual capabilities
7. **Optional Features:** GPU, storage, and IP leases work as advertised (if offered)

## After Approval

Once your provider passes the audit:

1. **Signed Transaction:** The core team will sign an on-chain transaction granting the audit attribute
2. **Verification:** Verify your audit status using:
   ```bash
   provider-services query provider get <provider_akash1_address> --node=https://rpc.akashnet.net:443
   ```
   Look for the audit attribute in the output
3. **Start Accepting Audited Deployments:** Your provider can now bid on deployments that specifically request audited providers
4. **Join the Community:** Continue engaging with the provider community on [Discord](https://discord.com/invite/akash) in the #providers channel

## Getting Help

If you encounter issues during the setup or testing process:

- **Discord:** Join the [Akash Discord](https://discord.com/invite/akash) and ask in the **#providers** channel
- **Documentation:** Review the [provider setup documentation](/docs/providers/build-a-cloud-provider/index.md/)
- **GitHub:** Search [existing issues](https://github.com/akash-network/support/issues) for similar problems

## Important Notes

- **Test with a different account:** Always test your provider using a different AKT account than the one running the provider
- **Complete prerequisites first:** Don't request an audit until you've verified all applicable requirements
- **Accurate attributes:** Ensure all provider attributes accurately reflect your actual capabilities
- **Be responsive:** Monitor your GitHub issue for questions from the audit team

## Related Documentation

- [Audited Attributes Overview](/docs/deployments/audited-attributes/)
- [Provider Setup Guide](/docs/providers/build-a-cloud-provider/)
- [Provider Console Setup](/docs/providers/build-a-cloud-provider/provider-console/)
- [Hardware Best Practices](/docs/providers/build-a-cloud-provider/hardware-best-practices/)