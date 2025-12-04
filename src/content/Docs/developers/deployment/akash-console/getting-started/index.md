---
categories: ["Developers", "Deployment", "Akash Console"]
tags: ["Akash Console", "GUI", "Web Interface", "Tutorial"]
weight: 1
title: "Getting Started with Console"
linkTitle: "Getting Started"
description: "Learn the basics of Akash Console - features, interface, and common tasks"
---

**Deploy applications on Akash Network using the web-based Akash Console—no CLI required!**

Akash Console is a user-friendly web interface that lets you deploy, manage, and monitor your applications on Akash Network without needing to use command-line tools.

---

## What is Akash Console?

Akash Console is a web-based deployment platform that provides:

- **Visual SDL Editor** - Build your deployment configuration with a visual interface
- **One-Click Deployments** - Deploy applications in minutes
- **Deployment Management** - View, update, and manage all your deployments
- **Real-Time Monitoring** - Monitor your deployments' status and logs
- **Wallet Integration** - Connect your wallet and manage funds
- **No CLI Required** - Everything you need in your browser

---

## Getting Started

### Step 1: Access Akash Console

Visit [console.akash.network](https://console.akash.network) in your web browser.

### Step 2: Connect Your Wallet

1. Click **"Connect Wallet"** in the top right
2. Choose your wallet provider (Keplr or Leap)
3. Approve the connection

**Note:** You'll need a funded wallet with at least 0.5 AKT for deposit plus gas fees.

### Step 3: Create Your First Deployment

1. Click **"Create Deployment"** or **"New Deployment"**
2. Use the visual SDL editor or paste your SDL file
3. Configure your resources (CPU, memory, storage)
4. Set your pricing preferences
5. Click **"Deploy"**

---

## Key Features

### Visual SDL Builder

Build your deployment configuration visually:

- **Service Configuration** - Add services, set images, configure ports
- **Resource Allocation** - Set CPU, memory, and storage requirements
- **Network Settings** - Configure exposed ports and endpoints
- **Environment Variables** - Add environment variables to your containers
- **Pricing** - Set maximum bid prices

### Deployment Dashboard

Monitor and manage all your deployments:

- **Active Deployments** - See all running deployments
- **Deployment Status** - Real-time status updates
- **Logs** - View container logs directly in the console
- **Metrics** - Monitor resource usage
- **URLs** - Access your deployed applications

### Wallet Management

Manage your funds directly in the console:

- **Balance** - View your AKT balance
- **Escrow** - Monitor deployment escrow accounts
- **Transactions** - View transaction history
- **Top Up** - Add funds to your wallet

---

## Quick Example: Deploy a Web App

### Using the Visual Builder

1. **Create New Deployment**
   - Click "Create Deployment" → "Use Visual Builder"

2. **Add a Service**
   - Service Name: `web`
   - Image: `nginx:1.25.3`
   - Port: `80`

3. **Set Resources**
   - CPU: `0.5`
   - Memory: `512Mi`
   - Storage: `512Mi`

4. **Configure Network**
   - Expose port `80` to the internet

5. **Set Pricing**
   - Maximum bid: `10000 uAKT` per block

6. **Deploy**
   - Review your configuration
   - Click "Deploy"
   - Wait for provider bids
   - Accept a bid
   - Your app will be live!

---

## Console vs CLI

### When to Use Console

✅ **Use Console if you:**
- Prefer visual interfaces
- Are new to Akash
- Want quick deployments
- Need to manage multiple deployments easily
- Want to avoid command-line tools

### When to Use CLI

✅ **Use CLI if you:**
- Need automation/scripting
- Want CI/CD integration
- Prefer command-line workflows
- Need advanced features
- Want full control

**Both work together!** You can create deployments in Console and manage them via CLI, or vice versa.

---

## Common Tasks

### View Deployment Logs

1. Go to **"Deployments"** in the sidebar
2. Click on your deployment
3. Navigate to **"Logs"** tab
4. View real-time container logs

### Update a Deployment

1. Select your deployment
2. Click **"Edit"** or **"Update"**
3. Modify your SDL or configuration
4. Click **"Update Deployment"**
5. Changes will be applied to your running deployment

### Close a Deployment

1. Select your deployment
2. Click **"Close"** or **"Stop"**
3. Confirm the action
4. Your deployment will stop and remaining escrow will be refunded

### Monitor Costs

1. Go to **"Deployments"**
2. View **"Cost"** column for each deployment
3. Check **"Escrow Balance"** to see remaining funds
4. Top up escrow if needed

---

## Next Steps

- **[Using Console with Your Wallet](/docs/developers/deployment/akash-console/with-wallet)** - Connect your own wallet for unlimited deployments
- **[Console API](/docs/developers/deployment/akash-console/api)** - Programmatic deployments with REST API
- **[SDL Examples Library](/docs/developers/deployment/akash-sdl/examples-library)** - 290+ deployment examples for all application types
- **[SDL Reference](/docs/developers/deployment/akash-sdl)** - Deep dive into Stack Definition Language
- **[CLI Documentation](/docs/developers/deployment/cli)** - Learn command-line deployment

---

## Need Help?

- **Console Support:** [GitHub Support](https://github.com/akash-network/support/issues)
- **Discord:** [discord.akash.network](https://discord.akash.network)
- **Documentation:** Browse the [full docs](/docs)

---

**Ready to deploy?** Visit [console.akash.network](https://console.akash.network) and create your first deployment!

