---
categories: ["Providers"]
tags: ["Akash Provider", "TLS", "Certificates", "Let's Encrypt", "JWT"]
weight: 13
title: "Let's Encrypt JWT Certificates"
linkTitle: "Let's Encrypt JWT Certificates"
---

> _**NOTE**_ - This feature requires provider-services version 0.8.0 or higher.

This guide explains how to enable automatic Let's Encrypt certificate issuance for JWT (JSON Web Token) authentication in your Akash provider using Helm charts. This feature allows your provider to automatically obtain and manage SSL/TLS certificates for secure JWT token validation.

The guide is broken down into the following sections:

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Configuration](#configuration)
- [Complete Example Configuration](#complete-example-configuration)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Testing](#testing)
- [Security Considerations](#security-considerations)
- [Related Documentation](#related-documentation)

## Overview

The Let's Encrypt JWT certificate feature enables your Akash provider to:
- Automatically obtain SSL certificates from Let's Encrypt
- Use HTTP-01 challenge validation by default (no configuration required)
- Support DNS-01 challenge validation as a backup option for wildcard certificates
- Support multiple DNS providers (Google Cloud DNS, Cloudflare) when using DNS validation
- Integrate with JWT authentication workflows
- Automatically renew certificates before expiration

## Prerequisites

Before enabling Let's Encrypt JWT certificates, ensure you have:

1. **Helm-based Akash Provider**: Your provider must be deployed using the official Helm charts
2. **Kubernetes Cluster**: A running Kubernetes cluster with the provider deployed
3. **Storage Class**: Ensure your provider's storage class attribute points to a valid storage class available in your cluster
4. **Public Domain**: Your provider domain must be publicly accessible for HTTP-01 challenge validation
5. **DNS Provider Access** (Optional): Only required if you want to use DNS-01 challenge validation for wildcard certificates

## Configuration

### HTTP Challenge (Default - Recommended)

The HTTP-01 challenge is now the default and recommended method. No additional configuration is required:


### DNS Challenge (Optional)

If you need wildcard certificates or prefer DNS validation, you can configure DNS providers:

#### Cloudflare DNS Configuration

If you're using Cloudflare DNS, add the following configuration:

```yaml
letsEncrypt:
  enabled: true
  acme:
    email: "your-email@example.com"
    caDirUrl: "https://acme-v02.api.letsencrypt.org/directory"
  dns:
    providers:
      - "cf"
  providers:
    cloudflare:
      enabled: true
      apiToken: "your-cloudflare-api-token"
```

#### Cloudflare DNS Setup Steps

1. **Create API Token**:
   - Log into your Cloudflare dashboard
   - Go to "My Profile" → "API Tokens"
   - Click "Create Token"
   - Use the "Custom token" template

2. **Configure Token Permissions**:
   - **Zone Resources**: Include → All zones
   - **Zone Permissions**: DNS:Edit
   - **Account Resources**: Include → All accounts
   - **Account Permissions**: Zone:Read

3. **Copy the Token**: Replace `your-cloudflare-api-token` in your `provider.yaml` with the actual token.

#### Google Cloud DNS Configuration

If you're using Google Cloud DNS, add the following configuration:

```yaml
letsEncrypt:
  enabled: true
  acme:
    email: "your-email@example.com"
    caDirUrl: "https://acme-v02.api.letsencrypt.org/directory"
  dns:
    providers:
      - "gcloud"
  providers:
    googleCloud:
      enabled: true
      serviceAccount:
        content: |
          {
            "type": "service_account",
            "project_id": "your-project-id",
            "private_key_id": "your-private-key-id",
            "private_key": "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n",
            "client_email": "your-service-account@your-project-id.iam.gserviceaccount.com",
            "client_id": "your-client-id",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/your-service-account%40your-project-id.iam.gserviceaccount.com"
          }
```

#### Google Cloud DNS Setup Steps

1. **Create a Service Account**:
   ```bash
   gcloud iam service-accounts create akash-letsencrypt \
     --display-name="Akash Let's Encrypt DNS"
   ```

2. **Grant DNS Admin Role**:
   ```bash
   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member="serviceAccount:akash-letsencrypt@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/dns.admin"
   ```

3. **Create and Download Service Account Key**:
   ```bash
   gcloud iam service-accounts keys create service-account.json \
     --iam-account=akash-letsencrypt@YOUR_PROJECT_ID.iam.gserviceaccount.com
   ```

4. **Copy the JSON Content**: Replace the `content:` section in your `provider.yaml` with the actual content of the `service-account.json` file.

## Complete Example Configuration

Here's a complete `provider.yaml` example with Let's Encrypt JWT certificates enabled using the default HTTP challenge:

```yaml
---
from: "akash1your-provider-address"
key: "your-provider-key"
keysecret: "your-key-secret"
domain: "your-provider-domain.com"
node: "https://rpc.your-network.com:443"
withdrawalperiod: 12h
price_target_gpu_mappings: "rtx4000=80,*=110"
chainid: your-network
attributes:
  - key: region
    value: "us-east"
  - key: host
    value: akash
  - key: tier
    value: community
  - key: organization
    value: "your-org"
  - key: capabilities/storage/1/class
    value: beta3
  - key: capabilities/storage/1/persistent
    value: true
  - key: capabilities/gpu/vendor/nvidia/model/rtx4000
    value: true
  - key: console/trials
    value: true
  - key: console/trials-registered
    value: "true"
email: hosting@your-domain.com
website: https://your-domain.com
bidmindeposit: "5000000uakt"

# Let's Encrypt JWT Certificate Configuration (HTTP Challenge - Default)
letsEncrypt:
  enabled: true
  acme:
    email: "your-email@example.com"
    caDirUrl: "https://acme-v02.api.letsencrypt.org/directory"
```

## Deployment

### Install/Upgrade Provider with Let's Encrypt

1. **Install the Provider** (if not already installed):
   ```bash
   helm install akash-provider akash/provider -f provider.yaml
   ```

2. **Upgrade Existing Provider**:
   ```bash
   helm upgrade akash-provider akash/provider -f provider.yaml
   ```

### Verify Installation

1. **Check Provider Pod Status**:
   ```bash
   kubectl get pods -n akash-services | grep provider
   ```

2. **Check Let's Encrypt Configuration**:
   ```bash
   kubectl describe configmap akash-provider-letsencrypt -n akash-services
   ```

3. **Check Provider Logs**:
   ```bash
   kubectl logs -n akash-services akash-provider-0 -f
   ```

## Troubleshooting

### Common Issues

#### 1. HTTP Challenge Failed
**Cause**: Provider domain is not publicly accessible or firewall is blocking HTTP traffic.
**Solution**: 
- Ensure your provider domain is publicly accessible
- Check that port 80 is open and accessible
- Verify your domain DNS points to the correct IP address

#### 2. Certificate Not Issued
**Cause**: HTTP challenge validation failed or domain not accessible.
**Solution**: 
- Verify your domain is publicly accessible
- Check that the provider service is running and accessible
- Review provider logs for specific error messages

#### 3. Environment Variables Not Set
**Cause**: Let's Encrypt configuration not properly applied.
**Solution**: Verify the `letsEncrypt.enabled: true` is set in your configuration.

#### 4. DNS Challenge Issues (If Using DNS)
**Cause**: DNS provider configuration is missing or incorrect.
**Solution**: 
- For Google Cloud: Verify the `serviceAccount.content` in your `provider.yaml` contains valid JSON
- For Cloudflare: Ensure the `apiToken` is correct and has proper permissions
- Ensure the `dns.providers` list contains the correct provider name (`gcloud` or `cf`)

### Debug Commands

1. **Check Environment Variables**:
   ```bash
   kubectl exec -n akash-services akash-provider-0 -- env | grep AP_CERT_ISSUER
   ```

2. **Check DNS Provider Secret** (if using DNS challenge):
   ```bash
   kubectl get secret akash-provider-gcp-dns -n akash-services -o yaml
   ```

3. **Check Provider Command**:
   ```bash
   kubectl logs -n akash-services akash-provider-0 | grep "Final command:"
   ```

## Testing

### Staging Environment

For testing, use the Let's Encrypt staging environment:

```yaml
letsEncrypt:
  enabled: true
  acme:
    email: "your-email@example.com"
    caDirUrl: "https://acme-staging-v02.api.letsencrypt.org/directory"  # Staging
  # ... rest of configuration
```

### Production Environment

Once testing is complete, switch to production:

```yaml
letsEncrypt:
  enabled: true
  acme:
    email: "your-email@example.com"
    caDirUrl: "https://acme-v02.api.letsencrypt.org/directory"  # Production
  # ... rest of configuration
```

## Security Considerations

1. **API Token Security**: Store Cloudflare API tokens securely and rotate them regularly
2. **Service Account Security**: Use minimal required permissions for Google Cloud service accounts
3. **Email Notifications**: Use a valid email address for Let's Encrypt notifications
4. **Rate Limits**: Be aware of Let's Encrypt rate limits (50 certificates per registered domain per week)

## Related Documentation

- [TLS Certificates for Akash Provider](/docs/providers/build-a-cloud-provider/akash-cli/tls-certs-for-akash-provider/)
- [Helm-based Provider Deployment](/docs/providers/build-a-cloud-provider/akash-cli/akash-cloud-provider-build-with-helm-charts/)
- [Provider Checkup](/docs/providers/build-a-cloud-provider/akash-cli/akash-provider-checkup/)
