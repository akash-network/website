---
categories: ["For Providers"]
tags: ["Operations", "Verification", "Monitoring"]
weight: 5
title: "Provider Verification"
linkTitle: "Provider Verification"
description: "Verify your provider is running correctly and bidding on deployments"
---

After installing your provider, verify it's running correctly and accepting bids.

## Quick Health Checks

### 1. Check Provider Pod Status

```bash
kubectl -n akash-services get pods
```

**Expected output:**

```
NAME                READY   STATUS    RESTARTS   AGE
akash-provider-0    1/1     Running   0          5m
```

**Status should be `Running` with `1/1` Ready.**

### 2. View Provider Logs

```bash
kubectl -n akash-services logs -l app=akash-provider --tail=100 -f
```

**Look for:**
- ✅ `"bidding on order"` - Provider is creating bids
- ✅ `"bid complete"` - Bids are being submitted
- ❌ `"error"` or `"failed"` - Investigate errors

### 3. Verify On-Chain Registration

```bash
provider-services query provider get <your-provider-address>
```

**Verify:**
- Provider address is correct
- Host URI is accessible
- Attributes are set correctly

### 4. Check Provider Status Page

```bash
curl -k https://<your-provider-domain>:8443/status
```

**Expected:** JSON response with provider status information.

### 5. Check Provider gRPC Endpoint

```bash
grpcurl -insecure <your-provider-domain>:8444 akash.provider.v1.ProviderRPC.GetStatus
```

**Expected:** JSON response with provider status via gRPC.

**Install grpcurl (if needed):**

```bash
# Ubuntu/Debian
apt install -y grpcurl

# macOS
brew install grpcurl
```

## Bid Activity Monitoring

### Watch for Bids

```bash
kubectl -n akash-services logs -l app=akash-provider --tail=100 -f | grep bid
```

**If you see no bids:**
- Check your pricing is competitive
- Verify provider attributes are set
- Ensure firewall allows inbound connections
- Check wallet has sufficient balance

## Common Issues

### Provider Pod Not Running

**Check pod status:**

```bash
kubectl -n akash-services describe pod akash-provider-0
```

**Common causes:**
- Insufficient resources
- Configuration errors in `provider.yaml`
- Missing secrets or certificates

**Fix:** Review pod events and logs for specific errors.

### No Bids Showing

**Possible causes:**

1. **Pricing too high** - Check your bid pricing script
2. **Attributes missing** - Verify GPU and feature attributes
3. **Wallet balance low** - Provider needs AKT for transaction fees
4. **Network issues** - Verify connectivity to RPC nodes

**Debug:**

```bash
# Check provider account balance
provider-services query bank balances <provider-address>
```

### Provider Not Accessible Externally

**Test connectivity:**

```bash
# From external machine
curl -k https://<provider-domain>:8443/status
grpcurl -insecure <provider-domain>:8444 akash.provider.v1.ProviderRPC.GetStatus
```

**If it fails:**
- Verify DNS points to your provider IP
- Check firewall allows ports 8443 (HTTP) and 8444 (gRPC)
- Ensure provider domain is in certificate

### Deployment Pods Failing

**Check pod status:**

```bash
kubectl -n lease get pods
kubectl -n lease describe pod <pod-name>
```

**Common issues:**
- GPU not available (for GPU deployments)
- Insufficient resources
- Image pull errors
- Network policies blocking traffic

## Verification Checklist

After provider installation, verify:

- Provider pod is running (`kubectl -n akash-services get pods`)
- Provider is registered on-chain (`provider-services query provider get`)
- Provider status endpoint is accessible (`curl https://provider:8443/status`)
- Provider gRPC endpoint is accessible (`grpcurl provider:8444 akash.provider.v1.ProviderRPC.GetStatus`)
- Provider is bidding on orders (check logs)
- Ingress controller is running (`kubectl -n ingress-nginx get pods`)
- GPU device plugin is running (GPU providers only)
- Wallet has sufficient balance
- Firewall allows required ports (8443, 8444)
- Domain DNS is configured

## Related Resources

- [Monitoring](/docs/for-providers/operations/monitoring) - Provider logs and GPU troubleshooting
- [Lease Management](/docs/for-providers/operations/lease-management) - Managing active deployments
- [Provider Installation](/docs/for-providers/setup-and-installation/kubespray/provider-installation)
- [Hardware Requirements](/docs/for-providers/getting-started/hardware-requirements)

---

**Need Help?** Join [#provider-support on Discord](https://discord.com/channels/747885925232672829/1067866274432274442)

