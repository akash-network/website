---
categories: ["Getting Started"]
tags: ["Quick Start", "Console", "Tutorial", "Beginner"]
weight: 2
title: "Quick Start - Deploy with Akash Console"
linkTitle: "Quick Start"
description: "Deploy your first application on Akash Network in under 5 minutes using Akash Console"
---

**Deploy your first application on Akash Network in under 5 minutes using Akash Console—no command line required!**

This guide walks you through deploying a simple web application using Akash Console, the easiest way to get started with Akash.

---

## What You'll Deploy

A simple **"Hello Akash World"** web application. Once deployed, you'll have a live URL you can visit.

**Time:** ~5 minutes  
**Cost:** ~0.5 AKT deposit + small gas fees  
**Difficulty:** Beginner-friendly (no technical knowledge required)

---

## Prerequisites

Before you start, you need:

1. **A Keplr or Leap Wallet**
   - [Install Keplr](https://www.keplr.app/) (Chrome, Brave, or Edge)
   - [Install Leap](https://www.leapwallet.io/) (Chrome, Brave, or Edge)

2. **At least 1 AKT in your wallet**
   - Need AKT? [Buy on an exchange](https://akash.network/token) or swap from other crypto
   - You'll need 0.5 AKT for deposit + ~0.1 AKT for gas fees

That's it! No installation or setup required.

---

## Step 1: Open Akash Console

Visit **[console.akash.network](https://console.akash.network)**

You'll see the Akash Console homepage.

---

## Step 2: Connect Your Wallet

1. Click **"Connect Wallet"** in the top right
2. Choose **Keplr** or **Leap**
3. Approve the connection in your wallet popup
4. Your wallet address and AKT balance will appear

✅ You're now connected!

---

## Step 3: Create a New Deployment

1. Click **"Deploy"** or **"Create Deployment"**
2. You'll see template options:

**Choose one of these options:**

### Option A: Use a Template (Easiest)

1. Click **"Hello World"** template
2. The SDL configuration is pre-filled for you
3. Review the configuration (it's a simple nginx web server)

### Option B: Start from Scratch

1. Click **"Empty Template"** or **"Build Your Own"**
2. You'll see a blank SDL editor
3. Copy and paste this configuration:

```yaml
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
      pricing:
        web:
          denom: uakt
          amount: 10000

deployment:
  web:
    dcloud:
      profile: web
      count: 1
```

**What this configuration does:**
- Deploys an nginx web server
- Uses 0.5 CPU, 512MB RAM, 512MB storage  
- Offers to pay 10,000 uAKT per block (~$0.10/month)
- Makes the site publicly accessible on port 80

---

## Step 4: Review and Create Deployment

1. Review your configuration in the SDL editor
2. Click **"Create Deployment"** at the bottom
3. Set your deposit amount (default 0.5 AKT is fine)
4. Click **"Deposit & Create Deployment"**
5. **Approve the transaction** in your wallet popup

⏳ Wait ~30 seconds. Console will show "Creating Deployment..."

✅ Success! Your deployment is now on the Akash blockchain.

---

## Step 5: Accept a Bid

After creating your deployment, providers will bid to host it:

1. You'll see **"View Bids"** button—click it
2. Wait 10-30 seconds for bids to appear
3. You'll see a list of providers with their prices and details

**Choose a provider:**
- Providers are sorted by price (lowest first)
- Check their uptime and reputation if shown
- For this test, any provider works fine!

4. Click **"Accept"** on your chosen provider
5. **Approve the transaction** in your wallet popup

⏳ Wait ~20 seconds for the lease to be created.

---

## Step 6: Send Your Configuration

Once the lease is created:

1. Console will automatically prompt to **"Send Manifest"**
2. Click **"Send Manifest"**
3. Wait ~30-60 seconds for your container to start

You'll see the status change to:
- "Sending Manifest..." 
- "Starting Services..."
- "Running" ✅

---

## Step 7: Access Your Deployment

Once your deployment is running:

1. Look for the **"URIs"** or **"Access URLs"** section
2. Click on the URL shown (e.g., `http://provider.example.com:12345`)
3. Your web application will open in a new tab!

**🎉 Congratulations! You just deployed on Akash Network!**

---

## Managing Your Deployment

### View Logs

In the Console deployment page:
1. Click **"Logs"** tab
2. Select your service (`web`)
3. View real-time logs

### Update Your Deployment

To change your deployment:
1. Click **"Update"** on your deployment
2. Edit the SDL configuration
3. Click **"Update Deployment"**
4. Approve the transaction

### Close Your Deployment

When you're done:
1. Click on your deployment
2. Click **"Close Deployment"**
3. Approve the transaction
4. Your remaining deposit will be refunded!

**💰 Always close deployments when you're done to avoid ongoing charges.**

---

## Understanding Your Dashboard

The Console dashboard shows:

- **Active Deployments** - All your running deployments
- **Balance** - Your AKT balance
- **Escrow Account** - Funds locked for deployments
- **Transaction History** - All your blockchain transactions

---

## Common Questions

### "No bids received after 2 minutes"
**Solution:** Your price might be too low. Try:
1. Close the deployment
2. Create a new one with higher pricing (e.g., 15000 uAKT instead of 10000)

### "Insufficient funds"
**Solution:** You need more AKT. Check your balance and:
- Buy more AKT from an exchange
- Transfer AKT from another wallet

### "Transaction failed"
**Solution:** 
- Check your wallet has enough AKT for gas fees
- Try again with higher gas settings in your wallet
- Make sure you're on the right network (Akash mainnet)

### "Deployment failed to start"
**Solution:**
- Check your SDL syntax (indentation, required fields)
- Try using a pre-built template first
- Check provider logs for error messages

---

## What's Next?

### 🚀 Deploy Real Applications

Now that you know the basics, deploy something useful:
- **[Web Applications](/docs/for-developers/deployment-guides/web-applications)** - Blogs, APIs, websites
- **[Databases](/docs/for-developers/deployment-guides/databases)** - PostgreSQL, MongoDB, Redis
- **[AI/ML](/docs/for-developers/deployment-guides/machine-learning)** - LLMs, stable diffusion, training
- **[GPU Workloads](/docs/for-developers/deployment-guides/gpus)** - Use Akash's GPU marketplace

### 📚 Learn More

- **[Core Concepts](/docs/getting-started/core-concepts)** - Understand how Akash works
- **[SDL Reference](/docs/for-developers/deployment/akash-sdl)** - Master the Stack Definition Language
- **[What is Akash?](/docs/getting-started/what-is-akash)** - Deep dive into Akash Network

### 💻 For Developers

Ready for more advanced workflows?
- **[Akash CLI](/docs/for-developers/deployment/cli)** - Command-line deployment and automation
- **[Akash SDK](/docs/for-developers/deployment/akash-sdk)** - Build deployment tools with Go or JavaScript/TypeScript
- **[API Reference](/docs/for-developers/blockchain/api-protocols)** - Integrate Akash into your apps

---

## Need Help?

We're here to help you succeed!

- **Discord:** [discord.akash.network](https://discord.akash.network) - Fast, friendly community support
- **Forum:** [forum.akash.network](https://forum.akash.network) - Detailed discussions  
- **Support:** [support.akash.network](https://support.akash.network) - Official support
- **GitHub:** [Report issues](https://github.com/akash-network/support/issues) - Bug reports

---

## Tips for Success

- 💡 **Start small** - Use templates for your first few deployments
- 💰 **Watch your costs** - Close deployments when not in use
- 🔍 **Monitor logs** - Check logs if something doesn't work
- 📝 **Save your SDLs** - Keep copies of working configurations
- 🚀 **Experiment** - Try different providers and configurations

---

**Previous:** [← What is Akash?](/docs/getting-started/what-is-akash)  
**Next:** [Core Concepts →](/docs/getting-started/core-concepts)
