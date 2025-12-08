---
categories: ["Developers", "Deployment"]
tags: ["SDK", "JavaScript", "TypeScript", "Go", "API"]
weight: 3
title: "Akash SDK"
linkTitle: "Akash SDK"
description: "Deploy on Akash programmatically with official SDKs"
---

**Deploy and manage Akash applications programmatically using our official SDKs.**

The Akash SDK allows you to integrate deployment capabilities directly into your applications, tools, and workflows.

---

## Quick Example

Deploy a simple application using the SDK:

```typescript
import { AkashClient } from '@akashnetwork/chain-sdk'

// Initialize client
const client = await AkashClient.create({
  rpcEndpoint: 'https://rpc.akashnet.net',
  mnemonic: process.env.AKASH_MNEMONIC
})

// Create deployment
const deployment = await client.deployment.create({
  sdl: mySDLConfig,
  deposit: '5000000uakt'
})

console.log('Deployment created:', deployment.dseq)
```

---

## Available SDKs

- **Go SDK** - For Go applications and services
- **JavaScript/TypeScript SDK** - For Node.js, web apps, and serverless functions

Both SDKs provide identical functionality and are generated from the same protobuf definitions.

---

## Full Documentation

For comprehensive SDK documentation, installation guides, API reference, and examples:

**→ [View Full SDK Documentation](/docs/api-documentation/sdk)**

The complete SDK documentation is located in the [Extend section](/docs/api-documentation/getting-started), which covers:
- **[Installation Guide](/docs/api-documentation/sdk/installation)** - Set up the SDK in your project
- **[Quick Start](/docs/api-documentation/sdk/quick-start)** - Build your first SDK integration
- **[API Reference](/docs/api-documentation/sdk/api-reference)** - Complete API documentation
- **[Examples](/docs/api-documentation/sdk/examples)** - Real-world code examples

---

## When to Use the SDK

**Use the SDK when you need to:**
- Build custom deployment automation
- Integrate Akash into existing platforms
- Create provider management tools
- Build monitoring and analytics dashboards
- Develop custom CLI tools

**Prefer other tools when:**
- You want a visual interface → Use [Akash Console](/docs/developers/deployment/akash-console)
- You need pre-built CLI commands → Use [provider-services CLI](/docs/developers/deployment/cli)
- You want wallet-free deployments → Use [Managed Wallet API](/docs/api-documentation/console-api)

---

## Related Resources

- **[SDL Reference](/docs/developers/deployment/akash-sdl)** - Define your deployments
- **[AuthZ](/docs/developers/deployment/authz)** - Grant deployment permissions
- **[Akash Console](/docs/developers/deployment/akash-console)** - Visual deployment interface

---

**Ready to build?** → [Start with the SDK documentation](/docs/api-documentation/sdk)

