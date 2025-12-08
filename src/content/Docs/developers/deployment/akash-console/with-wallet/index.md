---
categories: ["Developers", "Deployment", "Akash Console"]
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
- **No deployment time limits** - Run indefinitely (trial has 24-hour limit)
- **Full blockchain control** - Direct access to your AKT and transactions
- **No credit card required** - Use your existing AKT holdings
- **Lower fees** - Pay network fees directly, no payment processing fees
- **Visual interface** - Easier than CLI for most users

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
   - Minimum: **1 AKT** (for deposit + gas fees)
   - Recommended: **5+ AKT** for comfortable testing
   
3. **Where to Get AKT:**
   - [Osmosis DEX](https://app.osmosis.zone/) - Swap from other Cosmos tokens
   - Centralized exchanges: [See full list](https://akash.network/token)
   - Bridge from other chains

---

## Step 1: Visit Akash Console

Open your browser and go to **[console.akash.network](https://console.akash.network)**

![Connect Wallet Button](/images/docs/console/wallet/1-wallet-connect-button.png)
*Akash Console homepage - Click "Connect Wallet" in the top right*

---

## Step 2: Connect Your Wallet

1. Click **"Connect Wallet"** in the top right corner

2. Choose your wallet provider:

![Wallet Selection](/images/docs/console/wallet/2-wallet-selection.png)
*Select Keplr or Leap wallet to connect*

3. **Approve the connection** in your wallet extension - Allow Console to:
   - View your Akash address
   - Request transaction approvals
   - Query your balance

4. Your wallet address and AKT balance will appear in the top right

![Wallet Connected](/images/docs/console/wallet/4-wallet-connected.png)
*Successfully connected - your address and AKT balance are now visible*

**You're now connected with your own wallet!

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

![Deployments Dashboard](/images/docs/console/15-deployments-dashboard.png)
*Your Console dashboard showing deployments and quick actions*

---

## Step 4: Deploy Your First Application

### Option A: Use a Template (Recommended)

1. Click **"Templates"** in the sidebar

![Templates Library](/images/docs/console/5-templates-library.png)
*Browse 290+ pre-built templates for common applications*

2. Choose a template and click **"Deploy"**

![Template Detail](/images/docs/console/6-template-detail.png)
*Review template details and deploy with one click*

3. Review the pre-filled SDL configuration
4. (Optional) Customize CPU, memory, storage
5. Click **"Create Deployment"**

### Option B: Custom Deployment

1. Click **"Deploy"** button (top left or center)
2. Choose **"Empty Template"** or **"SDL Builder"**

![SDL Configuration](/images/docs/console/7-sdl-configuration.png)
*Build your deployment configuration using the SDL editor*

3. Write or build your SDL configuration
4. Click **"Create Deployment"**

---

## Step 5: Create the Deployment

After clicking "Create Deployment":

1. **Set Deposit Amount**
   - Default is usually fine (0.5-5 AKT depending on resources)
   - This is held in escrow, refunded when you close
   - Not a fee—just a security deposit

![Deposit Screen](/images/docs/console/wallet/6-deposit-amount-wallet.png)
*Set your deposit amount - held in escrow and refunded when you close*

2. **Approve Transaction in Wallet**
   
Your wallet (Keplr/Leap) will popup requesting approval:

![Deployment Transaction Approval](/images/docs/console/wallet/7-deployment-tx-approval.png)
*Approve the deployment creation transaction in your wallet*

Review the transaction details:
   - Deposit amount
   - Gas fee (usually < 0.1 AKT)
   - Total cost

Click **"Approve"**

 Wait ~30 seconds for blockchain confirmation

**Deployment created! Now waiting for provider bids...

---

## Step 6: Accept a Provider Bid

After creating your deployment, providers will bid to host it:

1. **View Bids** - Click "View Bids" button (wait 30-60 seconds for providers to respond)

![Provider Bids](/images/docs/console/wallet/9-bid-selection-wallet.png)
*Review and compare provider bids - choose based on price, location, and attributes*

2. **Review Bids** - You'll see:
   - Provider name and reputation
   - Price per month
   - Location and attributes
   - Available resources

3. **Select a Provider**
   - Sorted by price (lowest first)
   - Check attributes and location
   - For testing, lowest price is fine

4. **Accept Bid**
   - Click **"Accept"** on your chosen provider
   - **Approve the lease transaction** in your wallet

![Lease Transaction Approval](/images/docs/console/wallet/8-lease-tx-approval.png)
*Approve the lease creation transaction to accept the provider's bid*

 Wait ~20 seconds for lease creation and manifest to be sent

---

## Step 7: Send Manifest

Once the lease is created:

1. Console automatically sends your manifest to the provider (no wallet approval needed)

 Wait 30-60 seconds for your container to start

Status will change:
- "Manifest Received"
- "Starting Services..."
- **"Active"**

---

## Step 8: Access Your Deployment

Once status shows **"Active"** or **"Running"**:

![Deployment Active](/images/docs/console/12-deployment-active.png)
*Your deployment is live with URLs and management controls*

You'll see:
- **Live URLs** - Access your application
-  **Status** - Real-time deployment state
-  **Cost Tracking** - Current spending and escrow balance
-  **Management Controls** - Logs, update, close

** Congratulations! Your app is live on Akash!**

---

## Managing Your Deployment

### View Logs

Monitor your application's output in real-time:

1. Click on your deployment
2. Select the **"Logs"** tab
3. View real-time container logs

![Deployment Logs](/images/docs/console/13-deployment-logs.png)
*View real-time logs from your running containers*

**Tip:** Logs are essential for debugging!

### Monitor Events and Shell Access

Access deployment events and shell terminal:

![Deployment Events](/images/docs/console/14-deployment-events.png)
*View deployment events and access shell terminal*

### Update Deployment

Modify your running deployment:

1. Click on your deployment
2. Click **"Update Deployment"**
3. Edit the SDL configuration

![Deployment Update](/images/docs/console/16-deployment-update.png)
*Update your deployment configuration on the fly*

4. Click **"Update"**
5. **Approve the update transaction** in your wallet

![Update Transaction Approval](/images/docs/console/wallet/10-update-tx-approval.png)
*Approve the deployment update transaction in your wallet*

**Note:** Existing containers continue running until the new version is ready.

### Close Deployment

Stop your deployment and reclaim your deposit:

1. Go to your deployment
2. Click **"Close Deployment"**

![Deployment Close Confirmation](/images/docs/console/17-deployment-close.png)
*Confirm deployment closure - your deposit will be refunded*

3. **Approve the close transaction** in your wallet

![Close Transaction Approval](/images/docs/console/wallet/11-close-tx-approval.png)
*Approve the deployment close transaction in your wallet*

4. Your deposit will be refunded to your wallet!

![Deployment Closed](/images/docs/console/wallet/11.1-close-tx-approval.png)
*Deployment successfully closed - deposit refunded to your wallet*

** Always close deployments to get your deposit back.**

---

## Understanding Costs

### What You Pay

1. **Deposit (Escrow)**
   - Held while deployment runs
   - Fully refunded when you close
   - Typical: 0.5 AKT

2. **Provider Fees**
   - Paid per block from your deposit
   - Varies by resources (CPU, RAM, storage, GPU)
   - Typical: Often less than $5/month for basic web apps

3. **Gas Fees**
   - Blockchain transaction fees
   - Very small: ~0.02-0.1 AKT per transaction
   - Paid when creating/updating/closing deployments

### Cost Example

**Simple web app (0.5 CPU, 512MB RAM, 512MB storage):**
- Deposit: 0.5 AKT (~$1-2, refundable)
- Cost: Often less than $5/month
- Gas: ~0.1 AKT total

**Your 0.5 AKT deposit is held in escrow while hosting runs, and is fully refundable when you close the deployment.**

---

## Wallet vs Trial Comparison

| Feature | Console with Wallet | Trial (Managed Wallet) |
|---------|-------------------|----------------------|
| **Setup** | Need wallet + AKT | Just email + credit card |
| **Deployment Limit** | None (run forever) | 24 hours max |
| **Cost** | Pay with AKT | Pay with credit card |
| **Deposit** | 0.5 AKT (refundable) | Included in credits |
| **Control** | Full blockchain access | Managed by Console |
| **Best For** | Crypto users | Beginners |

---

## Common Questions

### "How much AKT do I need?"
**Answer:** Start with **5 AKT**:
- 0.5 AKT for deposit (refundable)
- Rest for provider payments and gas fees

### "Can I use trial AND wallet?"
**Answer:** 
- **Trial** - $100 free credits for 30 days, 24-hour deployment limit
- **Credit Card** - Once you add a credit card, you keep your trial credits but can't go back to trial-only mode
- **Your Wallet** - Use your own Keplr/Leap wallet for production deployments with no limits

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
- **Last resort:** Join [Discord](https://discord.akash.network) and ask a vanguard to review your SDL in #deployments channel

### "Deployment closed unexpectedly"
**Possible causes:**
- Ran out of funds in escrow
- Provider went offline
- Deployment configuration error

**Check:** Logs and Events tabs for error messages

---

## Tips for Success

-  **Start with templates** - Use Hello World for your first deployment
-  **Monitor your escrow** - Keep an eye on your deposit balance
-  **Check provider stats** - Choose providers with high uptime
-  **Use logs** - Logs are your best debugging tool
-  **Save your SDLs** - Keep copies of working configurations
-  **Test pricing** - Try different price points to get bids from more providers

---

## What's Next?

### Deploy Real Applications
- **[SDL Examples Library](/docs/developers/deployment/akash-sdl/examples-library)** - 290+ deployment examples
  - Web Applications - Nginx, WordPress, Ghost
  - Databases - PostgreSQL, MongoDB, Redis
  - AI/ML - Ollama, Stable Diffusion, ComfyUI
  - GPU Workloads - LLMs, image generation, ML training

### Learn More
- **[SDL Reference](/docs/developers/deployment/akash-sdl)** - Master deployment configurations
- **[Core Concepts](/docs/getting-started/core-concepts)** - Understand how Akash works

### Advanced Workflows
- **[Console API](/docs/api-documentation/console-api)** - Programmatic deployments via REST API
- **[Akash CLI](/docs/developers/deployment/cli)** - Command-line automation
- **[Akash SDK](/docs/api-documentation/sdk)** - Native blockchain integration

---

## Need Help?

- **Discord:** [discord.akash.network](https://discord.akash.network) - #general or #developers
- **Support:** [GitHub Support](https://github.com/akash-network/support/issues) - Official support

---

**Ready to deploy?** [Visit Console →](https://console.akash.network)

