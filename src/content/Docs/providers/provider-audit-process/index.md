---
title: "Akash Provider Audit Process"
linkTitle: "Akash Provider Audit Process"
description: "Guide to get your Akash Provider audited."
weight: 3 # Adjust weight relative to other sections under Providers
---



This guide explains how to get your Akash provider audited by the core team, allowing you to bid on community deployments and join the trusted provider network.

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

#### Provider URI Resolution

Test that your provider URI resolves correctly:

```bash
ping provider.yourdomain.com
```

**Expected result:** Successful name-to-IP resolution

#### Ingress URI Resolution

Test wildcard ingress resolution:

```bash
host anything.ingress.yourdomain.com
```

**Expected result:** 
```
anything.ingress.yourdomain.com has address YOUR_PROVIDER_IP
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

**Expected result:** JSON response with resources and leases information

#### gRPC Status Endpoint

```bash
grpcurl -insecure yourdomain.com:8444 akash.provider.v1.ProviderRPC.GetStatus
```

**Expected result:** Successful gRPC response with provider status

### 5. Deployment Testing

You must successfully test the following on your own provider before requesting an audit:

#### Basic Deployment Test

Deploy a simple application (e.g., speedtest) to verify:
- Provider responds to orders
- Deployments complete successfully
- Basic functionality works

#### Ingress Test

Deploy an application that exposes port 80 (e.g., speedtest) to verify:
- HTTP/HTTPS ingress works
- Domain routing functions correctly

#### NodePort Test

Deploy Ubuntu and test SSH access via NodePort to verify:
- NodePort range is accessible
- Port forwarding works correctly

#### Network Connectivity Test

From any deployment, verify internet access:

```bash
apt update
```

**Expected result:** Successful connection to package repositories

### 6. Optional Feature Testing

If your provider offers additional features, you must test them:

#### GPU Support (if applicable)

Deploy a GPU-enabled application and verify:

```bash
nvidia-smi
```

**Expected result:** Successful GPU detection and information display

#### Persistent Storage (if applicable)

Deploy speedtest-tracker with persistent storage configured:
- Adjust the storage class in your SDL to match your provider's configuration
- Verify data persists across deployment restarts

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
3. **Start Accepting Deployments:** Your provider can now bid on community deployments
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