---
categories: ["Developers", "Deployment", "Console Air"]
tags: ["Console Air", "Self-Custody", "Keplr", "Wallet", "Deployment"]
weight: 2
title: "Deploy with Console Air"
linkTitle: "Console Air"
description: "Step-by-step walkthrough for deploying on Akash with Console Air — the self-custody, self-hostable UI"
---

**Deploy on Akash with Console Air using your own Keplr wallet — no managed billing, no time limits, full blockchain control.**

[Console Air](https://github.com/akash-network/console-air) is the self-custody, self-hostable counterpart to Akash Console. It's the same visual deploy UI you've used on `console.akash.network`, with the managed-wallet flows removed and the self-custody flows kept. You run it locally (or host your own instance), connect your wallet, and sign every transaction yourself.

Not sure if Console Air is right for you? See [Choosing Your Console](/docs/getting-started/choosing-your-console).

---

## Prerequisites

Before you start, you need:

1. **A Keplr Wallet**
   - [Install Keplr](https://www.keplr.app/) (Chrome, Brave, Edge, or mobile)

2. **AKT Tokens in Your Wallet**
   - Minimum: **1 AKT** (for ACT minting + gas fees)
   - Recommended: **5+ AKT** for comfortable testing

3. **Where to Get AKT:**
   - [Osmosis DEX](https://app.osmosis.zone/) - Swap from other Cosmos tokens
   - Centralized exchanges: [See full list](https://akash.network/token)
   - Bridge from other chains

4. **A running Console Air instance**
   - Local: clone [`akash-network/console-air`](https://github.com/akash-network/console-air) and run it (see the repo README)
   - Self-hosted: deploy your own instance (see [Self-hosting guide](https://github.com/akash-network/console-air/blob/main/docs/self-hosting.md))

---

## Step 1: Open Console Air

Open your Console Air instance in the browser (typically `http://localhost:3000` for a local run, or your self-hosted URL).

![Connect Wallet Button](/images/docs/console/wallet/1-wallet-connect-button.png)
*Console Air homepage — click "Connect Wallet" in the top right*

---

## Step 2: Connect Your Wallet

1. Click **"Connect Wallet"** in the top right corner.

2. Pick your wallet provider:

![Wallet Selection](/images/docs/console/wallet/2-wallet-selection.png)
*Select your Keplr wallet to connect (Console Air uses [Cosmos Kit](https://cosmoskit.com/), so any compatible wallet works)*

3. **Approve the connection** in your wallet extension — allow Console Air to:
   - View your Akash address
   - Request transaction approvals
   - Query your balance

4. Your wallet address and AKT balance will appear in the top right.

![Wallet Connected](/images/docs/console/wallet/4-wallet-connected.png)
*Successfully connected — your address and AKT balance are now visible*

5. **Swap AKT for ACT**
   - Hover over your wallet in the top right and click **Wallet Actions → Mint ACT**
   - Pick how many AKT you want to swap for ACT (minimum swap: 10 ACT)
   - Leave some AKT for transaction gas
   - Click **Mint ACT** and approve the transaction

![Mint ACT](/images/docs/console/wallet/5-mint-act.png)
*Mint ACT — your deployment escrow currency, minted from AKT*

**You're now connected with both AKT (for gas) and ACT (for deposits).**

---

## Step 3: Understanding the Console Air Interface

After connecting, you'll see:

### Top Bar
- **Your Address** — shortened wallet address (e.g., `akash1abc...xyz`)
- **Balance** — your available AKT and ACT
- **Network Status** — connection indicator

### Sidebar Navigation
- **Home** — dashboard overview
- **Deployments** — your active and past deployments
- **Templates** — pre-built deployment templates
- **SDL Builder** — visual deployment editor
- **Providers** — browse available providers

### Main Dashboard
- **Active Deployments** — running deployments and status
- **Quick Actions** — deploy button, settings
- **Account Overview** — balance, escrow (ACT), and spending

![Deployments Dashboard](/images/docs/console/15-deployments-dashboard.png)
*Your Console Air dashboard showing deployments and quick actions*

---

## Step 4: Deploy Your First Application

### Option A: Use a Template (Recommended)

1. Click **"Templates"** in the sidebar.

![Templates Library](/images/docs/console/5-templates-library.png)
*Browse pre-built templates for common applications*

2. Choose a template and click **"Deploy"**.

![Template Detail](/images/docs/console/6-template-detail.png)
*Review template details and deploy with one click*

3. Review the pre-filled SDL configuration.
4. (Optional) Customize CPU, memory, storage.
5. Click **"Create Deployment"**.

### Option B: Custom Deployment

1. Click the **"Deploy"** button.
2. Choose **"Empty Template"** or **"SDL Builder"**.

![SDL Configuration](/images/docs/console/7-sdl-configuration.png)
*Build your deployment configuration using the SDL editor*

3. Write or build your SDL configuration.
4. Click **"Create Deployment"**.

---

## Step 5: Create the Deployment

After clicking "Create Deployment":

1. **Set Deposit Amount**
   - Default is usually fine (in **ACT**, sized to your resources)
   - Held in escrow — refunded when you close the deployment
   - Use ACT unless the circuit breaker is in effect

![Deposit Screen](/images/docs/console/wallet/6-deposit-amount-wallet.png)
*Set your deposit amount (ACT) — held in escrow and refunded on close*

2. **Approve Transaction in Wallet**

Your wallet (Keplr) will pop up requesting approval:

![Deployment Transaction Approval](/images/docs/console/wallet/7-deployment-tx-approval.png)
*Approve the deployment creation transaction in your wallet*

Review the transaction details:
   - Deposit amount
   - Gas fee (usually < 0.1 AKT)
   - Total cost

Click **"Approve"**.

Wait ~30 seconds for blockchain confirmation.

**Deployment created. Waiting for provider bids…**

---

## Step 6: Accept a Provider Bid

After creating your deployment, providers will bid to host it.

1. **View Bids** — click "View Bids" (wait 30–60 seconds for providers to respond).

![Provider Bids](/images/docs/console/wallet/9-bid-selection-wallet.png)
*Review and compare provider bids — choose based on price, location, and attributes*

2. **Review Bids** — you'll see:
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

Wait ~20 seconds for lease creation and manifest delivery.

---

## Step 7: Send Manifest

Once the lease is created, Console Air automatically sends your manifest to the provider (no wallet approval needed).

Wait 30–60 seconds for your container to start. Status will change:
- "Manifest Received"
- "Starting Services..."
- **"Active"**

---

## Step 8: Access Your Deployment

Once status shows **"Active"** or **"Running"**:

![Deployment Active](/images/docs/console/12-deployment-active.png)
*Your deployment is live with URLs and management controls*

You'll see:
- **Live URLs** — access your application
- **Status** — real-time deployment state
- **Cost Tracking** — current spending and escrow balance
- **Management Controls** — logs, update, close

**Congratulations — your app is live on Akash, fully self-custody.**

---

## Managing Your Deployment

### View Logs

Monitor your application's output in real time:

1. Click your deployment.
2. Select the **"Logs"** tab.
3. View real-time container logs.

![Deployment Logs](/images/docs/console/13-deployment-logs.png)
*View real-time logs from your running containers*

### Monitor Events and Shell Access

Access deployment events and a shell terminal:

![Deployment Events](/images/docs/console/14-deployment-events.png)
*View deployment events and access shell terminal*

### Update Deployment

Modify your running deployment:

1. Click your deployment.
2. Click **"Update Deployment"**.
3. Edit the SDL configuration.

![Deployment Update](/images/docs/console/16-deployment-update.png)
*Update your deployment configuration on the fly*

4. Click **"Update"**.
5. **Approve the update transaction** in your wallet.

![Update Transaction Approval](/images/docs/console/wallet/10-update-tx-approval.png)
*Approve the deployment update transaction in your wallet*

Existing containers continue running until the new version is ready.

### Close Deployment

Stop your deployment and reclaim your deposit:

1. Open your deployment.
2. Click **"Close Deployment"**.

![Deployment Close Confirmation](/images/docs/console/17-deployment-close.png)
*Confirm deployment closure — your deposit will be refunded*

3. **Approve the close transaction** in your wallet.

![Close Transaction Approval](/images/docs/console/wallet/11-close-tx-approval.png)
*Approve the deployment close transaction in your wallet*

4. Your deposit is refunded to your wallet.

![Deployment Closed](/images/docs/console/wallet/11.1-close-tx-approval.png)
*Deployment successfully closed — deposit refunded to your wallet*

**Always close deployments to get your deposit back.**

---

## Understanding Costs

### What You Pay

1. **Deposit (Escrow)**
   - Held while the deployment runs
   - Fully refunded when you close
   - Typical: deposit in ACT (e.g. ~5 ACT); gas in AKT

2. **Provider Fees**
   - Paid per block from your deposit
   - Varies by resources (CPU, RAM, storage, GPU)
   - Typical: often under $5/month for basic web apps

3. **Gas Fees**
   - Blockchain transaction fees
   - Very small: ~0.02–0.1 AKT per transaction
   - Paid when creating, updating, or closing deployments

### Cost Example

**Simple web app (0.5 CPU, 512 MB RAM, 512 MB storage):**
- Deposit: in **ACT** (~$1–2 equivalent, refundable)
- Cost: often under $5/month (paid from ACT escrow)
- Gas: ~0.1 AKT total (network fees in AKT)

Your deposit (ACT) is held in escrow while the deployment runs and is fully refundable when you close. Use ACT unless the circuit breaker is in effect.

---

## Common Questions

### "How much AKT/ACT do I need?"
Fund your deployment in **ACT** (deposit is refundable). Keep some **AKT** for gas. Mint ACT by burning AKT from inside Console Air.

### "What if I run out of ACT in escrow?"
Your deployment will close automatically. Monitor your escrow balance and add more **ACT** (click "Add Funds" on the deployment). When the circuit breaker is in effect, you can top up with **AKT**; otherwise use ACT only.

### "My wallet isn't connecting"
- Make sure the Keplr extension is installed
- Refresh the page
- Check that you're on the Akash network in your wallet
- Disable other wallet extensions temporarily

### "No bids received"
- Your max price might be too low — raise it in the SDL
- Wait 2–3 minutes (sometimes it takes time)
- Try off-peak hours
- Last resort: ask in [Discord](https://discord.akash.network) `#deployments` for a vanguard SDL review

### "Deployment closed unexpectedly"
**Possible causes:**
- Ran out of ACT (or AKT during a circuit-breaker window) in escrow
- Provider went offline
- Deployment configuration error

**Check:** the Logs and Events tabs for error messages.

---

## What's Next?

### Deploy Real Applications
- **[SDL Examples Library](/docs/developers/deployment/akash-sdl/examples-library)** — 290+ deployment examples
  - Web Applications — Nginx, WordPress, Ghost
  - Databases — PostgreSQL, MongoDB, Redis
  - AI/ML — Ollama, Stable Diffusion, ComfyUI
  - GPU Workloads — LLMs, image generation, ML training

### Learn More
- **[SDL Reference](/docs/developers/deployment/akash-sdl)** — master deployment configurations
- **[Core Concepts](/docs/getting-started/core-concepts)** — understand how Akash works
- **[Console Air self-custody guide](https://github.com/akash-network/console-air/blob/main/docs/self-custody.md)** — wallet, signing, and certificate details
- **[Console Air self-hosting guide](https://github.com/akash-network/console-air/blob/main/docs/self-hosting.md)** — deploy your own instance

### Want Managed Instead?
- **[Akash Console](/docs/developers/deployment/akash-console)** — the managed alternative: credit-card billing, no wallet needed

---

## Need Help?

- **Discord:** [discord.akash.network](https://discord.akash.network) — `#general` or `#developers`
- **Console Air issues:** [github.com/akash-network/console-air/issues](https://github.com/akash-network/console-air/issues)
- **Support:** [GitHub Support](https://github.com/akash-network/support/issues)

---

**Ready to deploy?** Grab [Console Air on GitHub →](https://github.com/akash-network/console-air)
