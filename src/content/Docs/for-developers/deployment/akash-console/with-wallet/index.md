---
categories: ["For Developers", "Deployment", "Akash Console"]
tags: ["Console", "Wallet", "Keplr", "Leap", "Deployment"]
weight: 2
title: "Using Console with Your Wallet"
linkTitle: "With Wallet"
description: "Deploy on Akash Console using your own Keplr or Leap wallet for direct blockchain access"
---

**Use Akash Console with your own crypto wallet for full control and no deployment time limits.**

If you already have AKT and prefer direct blockchain access, you can connect your Keplr or Leap wallet to Akash Console instead of using the managed trial wallet.

---

## Why Use Console with Your Own Wallet?

### Benefits:
- ✅ **No deployment time limits** - Run indefinitely (trial has 24-hour limit)
- ✅ **Full blockchain control** - Direct access to your AKT and transactions
- ✅ **No credit card required** - Use your existing AKT holdings
- ✅ **Lower fees** - Pay network fees directly, no payment processing fees
- ✅ **Visual interface** - Easier than CLI for most users

### Best For:
- Users who already own AKT
- Those comfortable with crypto wallets
- Anyone wanting deployments longer than 24 hours
- Users who prefer visual tools over CLI

---

## Prerequisites

Before you start, you need:

1. **A Keplr or Leap Wallet**
   - [Install Keplr](https://www.keplr.app/) (Chrome, Brave, Edge, or mobile)
   - [Install Leap](https://www.leapwallet.io/) (Chrome, Brave, Edge, or mobile)

2. **AKT Tokens in Your Wallet**
   - Minimum: **5 AKT** (for deposit + gas fees)
   - Recommended: **10+ AKT** for comfortable testing
   
3. **Where to Get AKT:**
   - [Osmosis DEX](https://app.osmosis.zone/) - Swap from other Cosmos tokens
   - Centralized exchanges: [See full list](https://akash.network/token)
   - Bridge from other chains

---

## Step 1: Visit Akash Console

Open your browser and go to **[console.akash.network](https://console.akash.network)**

You'll see the Console homepage.

---

## Step 2: Connect Your Wallet

1. Click **"Connect Wallet"** in the top right corner
2. Choose your wallet:
   - **Keplr** (most popular)
   - **Leap** (alternative)

3. A popup will appear from your wallet extension
4. **Approve the connection** - Allow Console to:
   - View your Akash address
   - Request transaction approvals
   - Query your balance

5. Your wallet address and AKT balance will appear in the top right

✅ You're now connected with your own wallet!

---

## Step 3: Understanding the Console Interface

After connecting, you'll see:

### Top Bar
- **Your Address** - Shortened wallet address (e.g., `akash1abc...xyz`)
- **Balance** - Your available AKT
- **Network Status** - Connection indicator

### Sidebar Navigation
- **Home** - Dashboard overview
- **Deployments** - Your active and past deployments
- **Templates** - Pre-built deployment templates
- **SDL Builder** - Visual deployment editor
- **Providers** - Browse available providers

### Main Dashboard
- **Active Deployments** - Running deployments and status
- **Quick Actions** - Deploy button, add funds, settings
- **Account Overview** - Balance, escrow, and spending

---

## Step 4: Deploy Your First Application

### Option A: Use a Template (Recommended)

1. Click **"Templates"** in the sidebar
2. Browse available templates:
   - Hello World (simple web app)
   - Databases (PostgreSQL, MongoDB, Redis)
   - AI/ML (Stable Diffusion, LLMs)
   - And more...

3. Click **"Deploy"** on your chosen template
4. Review the pre-filled SDL configuration
5. (Optional) Customize CPU, memory, storage
6. Click **"Create Deployment"**

### Option B: Custom Deployment

1. Click **"Deploy"** button (top left or center)
2. Choose **"Empty Template"** or **"SDL Builder"**
3. Write or build your SDL configuration
4. Set your pricing (how much you'll pay per block)
5. Click **"Create Deployment"**

---

## Step 5: Create the Deployment

After clicking "Create Deployment":

1. **Review Deployment Details**
   - Resources requested (CPU, RAM, storage)
   - Estimated cost per month
   - Deposit amount (usually 5 AKT minimum)

2. **Set Deposit Amount**
   - Default is usually fine (5 AKT)
   - This is held in escrow, refunded when you close
   - Not a fee—just a security deposit

3. **Approve Transaction in Wallet**
   - Your wallet (Keplr/Leap) will popup
   - Review the transaction
   - Check gas fee (usually < 0.1 AKT)
   - Click **"Approve"**

⏳ Wait ~30 seconds for blockchain confirmation

✅ Deployment created!

---

## Step 6: Accept a Provider Bid

After creating your deployment, providers will bid to host it:

1. **View Bids** - Click "View Bids" button
2. **Wait for Bids** - 30-60 seconds for providers to respond
3. **Review Bids** - You'll see:
   - Provider name and reputation
   - Price per block (lower = cheaper)
   - Available resources
   - Uptime statistics

4. **Select a Provider**
   - Sorted by price (lowest first)
   - Check uptime and reviews
   - For testing, lowest price is fine

5. **Accept Bid**
   - Click **"Accept"** on your chosen provider
   - **Approve transaction** in your wallet

⏳ Wait ~20 seconds for lease creation

---

## Step 7: Send Manifest

Once the lease is created:

1. Console will prompt: **"Send Manifest"**
2. Click **"Send Manifest"**
3. No wallet approval needed (this is off-chain)

⏳ Wait 30-60 seconds for your container to start

Status will change:
- "Manifest Received"
- "Starting Services..."
- **"Running"** ✅

---

## Step 8: Access Your Deployment

Once status shows **"Running"**:

1. Click on your deployment
2. Look for **"Leases"** or **"URIs"** section
3. You'll see URLs like: `http://provider.example.com:12345`
4. Click the URL to visit your deployed application

**🎉 Congratulations! Your app is live on Akash!**

---

## Managing Your Deployment

### View Logs

1. Click on your deployment
2. Select the **"Logs"** tab
3. Choose your service (e.g., `web`)
4. View real-time logs

**Tip:** Logs are essential for debugging!

### Update Deployment

To change your deployment:

1. Click on your deployment
2. Click **"Update Deployment"**
3. Edit the SDL configuration
4. Click **"Update"**
5. **Approve transaction** in wallet

**Note:** Updates create a new deployment sequence.

### Close Deployment

When you're done:

1. Go to your deployment
2. Click **"Close Deployment"**
3. **Approve transaction** in wallet
4. Your deposit will be refunded to your wallet!

**💰 Always close deployments to get your deposit back.**

---

## Understanding Costs

### What You Pay

1. **Deposit (Escrow)**
   - Held while deployment runs
   - Fully refunded when you close
   - Typical: 5 AKT

2. **Provider Fees**
   - Paid per block from your deposit
   - Varies by resources (CPU, RAM, storage, GPU)
   - Typical: $5-50/month for web apps

3. **Gas Fees**
   - Blockchain transaction fees
   - Very small: ~0.02-0.1 AKT per transaction
   - Paid when creating/updating/closing deployments

### Cost Example

**Simple web app (0.5 CPU, 512MB RAM, 512MB storage):**
- Deposit: 5 AKT (~$10-15)
- Cost: ~$3-5/month
- Gas: ~0.1 AKT total

**Your 5 AKT deposit covers ~1-2 months of hosting.**

---

## Wallet vs Trial Comparison

| Feature | Console with Wallet | Trial (Managed Wallet) |
|---------|-------------------|----------------------|
| **Setup** | Need wallet + AKT | Just email + credit card |
| **Deployment Limit** | None (run forever) | 24 hours max |
| **Cost** | Pay with AKT | Pay with credit card |
| **Deposit** | 5 AKT (refundable) | Included in credits |
| **Control** | Full blockchain access | Managed by Console |
| **Best For** | Crypto users | Beginners |

---

## Common Questions

### "How much AKT do I need?"
**Answer:** Start with **10 AKT**:
- 5 AKT for deposit (refundable)
- 5 AKT for provider payments and gas fees

### "Can I use trial AND wallet?"
**Answer:** Yes! You can switch between them:
- **Trial wallet** for testing (24-hour limit)
- **Your wallet** for production (no limits)

### "What if I run out of AKT in escrow?"
**Answer:** Your deployment will close automatically. Monitor your escrow balance and add more AKT if needed (click "Add Funds" on your deployment).

### "My wallet isn't connecting"
**Solution:**
- Make sure Keplr/Leap extension is installed
- Try refreshing the page
- Check you're on the Akash network in your wallet
- Disable other wallet extensions temporarily

### "No bids received"
**Solution:**
- Your pricing might be too low
- Increase the price in your SDL
- Wait 2-3 minutes (sometimes takes time)
- Try deploying during off-peak hours

### "Deployment closed unexpectedly"
**Possible causes:**
- Ran out of funds in escrow
- Provider went offline
- Deployment configuration error

**Check:** Logs and Events tabs for error messages

---

## Tips for Success

- 💡 **Start with templates** - Use Hello World for your first deployment
- 💰 **Monitor your escrow** - Keep an eye on your deposit balance
- 📊 **Check provider stats** - Choose providers with high uptime
- 🔍 **Use logs** - Logs are your best debugging tool
- 💾 **Save your SDLs** - Keep copies of working configurations
- 🚀 **Test pricing** - Try different price points to see what gets bids faster

---

## What's Next?

### Deploy Real Applications
- **[Web Applications](/docs/for-developers/deployment-guides/web-applications)** - Blogs, APIs, websites
- **[Databases](/docs/for-developers/deployment-guides/databases)** - PostgreSQL, MongoDB, Redis
- **[AI/ML](/docs/for-developers/deployment-guides/machine-learning)** - LLMs, Stable Diffusion
- **[GPU Workloads](/docs/for-developers/deployment-guides/gpus)** - GPU compute

### Learn More
- **[SDL Reference](/docs/for-developers/deployment/akash-sdl)** - Master deployment configurations
- **[Core Concepts](/docs/getting-started/core-concepts)** - Understand how Akash works

### Advanced Workflows
- **[Akash CLI](/docs/for-developers/deployment/cli)** - Command-line automation
- **[Akash SDK](/docs/for-developers/deployment/akash-sdk)** - Programmatic deployments

---

## Need Help?

- **Discord:** [discord.akash.network](https://discord.akash.network) - #general or #developers
- **Support:** [support.akash.network](https://support.akash.network) - Official support

---

**Ready to deploy?** [Visit Console →](https://console.akash.network)

