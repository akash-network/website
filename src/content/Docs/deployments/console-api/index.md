---
categories: [Akash Console API]
tags: ["API"]
weight: 5
title: "Akash Console API"
linkTitle: "Akash Console API"
---

# Console API

> _**PLEASE NOTE**_ - The Console API for Managed Wallet users is currently in active development. This documentation will be updated frequently as new features are released. Check the [Swagger documentation](https://console-api.akash.network/v1/swagger) for the most up-to-date API specification.

## What is the Console API?

The Console API provides **programmatic access** to deploy and manage applications on the Akash Network for users with managed wallets. Deploy containerized applications, manage their lifecycle, and monitor workloads using simple REST API calls—no blockchain knowledge or wallet management required.

With the Console API, you can:

- **Deploy applications** using SDL (Stack Definition Language) via REST API
- **Manage deployments** programmatically without blockchain wallet complexity
- **Pay with credit cards** instead of managing cryptocurrency wallets
- **Automate workflows** through CI/CD pipelines and custom integrations
- **Build platforms** that offer Akash deployments to your users


## When to Use Console API

Use the Console API when you need:

- **Automated deployments** triggered by code commits, monitoring alerts, or schedules
- **Programmatic control** over the complete deployment lifecycle
- **CI/CD integration** with GitHub Actions, Jenkins, GitLab CI, or other platforms
- **Custom dashboards** for managing Akash workloads in your own interface
- **Platform integration** to offer Akash as a backend service to your users
- **Credit card payments** instead of managing cryptocurrency



## Other Deployment Methods

If the Console API doesn't fit your use case, explore these alternatives:

- **[Akash Console (Web UI)](/docs/deployments/akash-console/)** - Visual web interface for manual deployments
- **[Akash CLI](/docs/deployments/akash-cli/)** - Command-line interface for advanced blockchain operations
- **[akash SDKs](https://github.com/akash-network/chain-sdk)** - Programmatic access via SDK for custom applications


## Prerequisites

Before using the Console API, ensure you have:

- **Managed Wallet Account** - Create one at [console.akash.network](https://console.akash.network)
- **Credit Card Payment** - Configure payment in Console Settings and enable USD Payments
- **Minimum Balance** - At least $5 USD for your first deployment deposit
- **SDL Knowledge** - Basic understanding of [Stack Definition Language](/docs/getting-started/stack-definition-language/)
- **API Client** - curl, Postman, or HTTP library in your preferred language


## Getting started

- Managed Wallet Account: Create one at https://console.akash.network.
- Payment Method: Add a valid credit card in Console Settings and set USD Payments if required.
- Minimum Balance: Keep at least $5 USD for initial deployments.
- SDL knowledge — See [Stack Definition Language](/docs/getting-started/stack-definition-language/) for SDL basics.

### Access Console API

1. Log in to your managed wallet at https://console.akash.network/
2. Hover over your profile icon in the top-right corner and select **API Keys**.
3. Click **Create API Key**, provide a name, and click **Create**.
4. Copy your API key and store it securely — the key is shown only once and is used in the Authorization header as a Bearer token.

![](/src/content/Docs/assets/console_home_api.png)


4. From the API Keys page you can view, revoke, or delete keys.
5. Click **Create Key**, give it a name, and click `Create`. Store the key securely.
> _**WARNING**_ - Copy and save your API key immediately. It will only be shown once and cannot be retrieved later.

![](/src/content/Docs/assets/api_keys_home.png)


## Troubleshooting

### Can't Find API Keys Option?

**Problem:** API Keys menu option is not visible in the profile dropdown.

**Solutions:**

- Ensure you're logged into a **managed wallet account** at [console.akash.network](https://console.akash.network)
- API Keys are not available for standard Keplr/Leap wallet connections
- Verify you have selected **USD Payments** as your payment method in Settings
- If the issue persists, contact support on [Discord](https://discord.com/channels/747885925232672829/771909909335506955)

### Can't Create API Key?

**Problem:** Create API Key button is disabled or returns an error.

**Solutions:**

- Ensure your account has a **valid payment method** configured in Settings
- Verify your account balance is at least **$5 USD**
- Check that **USD Payments** is enabled in Console Settings
- Try refreshing the page or clearing your browser cache
- If the problem continues, reach out on [Discord](https://discord.com/channels/747885925232672829/771909909335506955)

### API Key Not Working (401 Unauthorized)?

**Problem:** Receiving 401 Unauthorized error when making API requests.

**Solutions:**

- Verify the API key is included in the `Authorization` header as `Bearer YOUR_API_KEY`
- Check that the API key was copied correctly (no extra spaces or characters)
- Ensure the API key hasn't been deleted or revoked in Console Settings
- Try creating a new API key and testing with it

### API Returns 403 Forbidden?

**Problem:** API key is valid but receiving 403 Forbidden error.

**Solutions:**

- Verify your account has sufficient balance for the operation
- Check that your payment method is valid and not expired
- Ensure USD Payments is still enabled in Settings
- Contact support if the issue persists
