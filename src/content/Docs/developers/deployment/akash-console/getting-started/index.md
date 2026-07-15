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
- **Managed Billing** - Start with free trial credits, then pay-as-you-go by credit card
- **No CLI Required** - Everything you need in your browser

---

## Getting Started

### Step 1: Sign Up

Visit [console.akash.network](https://console.akash.network) and click **"Start deploying"**.

Choose how you want to sign up:

- **Continue with Google**
- **Continue with GitHub**
- **Continue with email** — we'll email you a 6-digit code, so there's no password to remember

**No credit card required.** You get **$1 in free trial credits** to deploy your first container right away.

<!-- SCREENSHOT: The "Start deploying" sign-up screen showing Google / GitHub / email options and the "$1 credit to deploy your first container. No card required." copy -->
![Sign up for Akash Console](/images/docs/console/onboarding-1-signup.png)
*Sign up with Google, GitHub, or a passwordless email code—no credit card required*

### Step 2: Choose How to Get Started

After signing up, Console opens straight into **"Let's deploy your first app."** The rest of the app stays gated until your first deployment is live, so you can focus on getting something running.

You have two paths:

- **Pick a ready-to-go template** — a curated set of one-click apps (web apps, AI models, databases, and more) that get you a live URL in about 30 seconds.
- **Deploy your own image** — bring your own Docker image or custom SDL. See [Deploy your own app](#deploy-your-own-app) below.

You start with **$1 in free trial credits**, and on your first purchase you also get **10% in bonus credits, up to $100**. Some templates (such as high-end GPU apps) require adding a card to unlock.

<!-- SCREENSHOT: The "Let's deploy your first app" path picker showing the template cards and the "$1 in free trial credits… 10% in bonus credits… up to $100" sub-heading -->
![Choose a template or deploy your own image](/images/docs/console/onboarding-2-path-picker.png)
*"Let's deploy your first app"—pick a template or deploy your own image*

### Step 3: Watch Your First Deployment Go Live

Pick a template and Console handles the rest for you—no deposit to set, no provider bids to compare. You'll see the deploy funnel move through:

1. **Creating deployment**
2. **Matching with providers** — Console automatically picks the best host for you
3. **Preparing deployment**

Typical deploys take **15–30 seconds**. When your deployment is ready, Console automatically redirects you to it with a live URL.

<!-- SCREENSHOT: The provisioning funnel ("Deploying {template}", "We'll pick the best host for you…", phase progress Creating → Matching → Preparing) -->
![Your first deployment provisioning](/images/docs/console/onboarding-3-deploying.png)
*Console creates the deployment, matches a provider, and redirects you when it's ready*

### Free Trial Limits

Your free trial gives you room to explore:

- **$1 in free trial credits** to deploy your first apps
- **30-day trial window**
- **24-hour deployments** — trial deployments last a maximum of 1 day, but you can redeploy as many times as you like during the trial
- **No high-end GPUs** — high-end GPUs (such as the NVIDIA H100, H200, B200, A100, and RTX 5090/4090) aren't included in the free trial

To run longer deployments and unlock high-end GPUs, add credits to move to pay-as-you-go (see below).

### Skip the Trial

Ready to go beyond the trial? Add credits at any time to unlock the full Console and switch to pay-as-you-go:

1. Choose **"Skip the trial - unlock Console"** (or **"Add funds"** once you're in the app)
2. Add credits with a card — the minimum top-up is **$20**
3. That's it — longer runtimes, high-end GPUs, and the full Console are unlocked

**First-purchase bonus:** On your first purchase of $100 or more, get 10% in bonus credits, up to $100.

<!-- SCREENSHOT: The Add Credits sheet showing the credit amount, the $20 minimum, and the 10% first-purchase bonus -->
![Add credits to unlock Console](/images/docs/console/onboarding-4-skip-trial-credits.png)
*Add credits to unlock pay-as-you-go—your first purchase earns a 10% bonus*

---

## Key Features

### Visual SDL Builder

Build your deployment configuration visually without writing YAML:

- **Service Configuration** - Add services, set images, configure ports
- **Resource Allocation** - Set CPU, memory, and storage requirements
- **Network Settings** - Configure exposed ports and endpoints
- **Environment Variables** - Add environment variables to your containers
- **Pricing** - Set maximum bid prices

<!-- VERIFY: SDL Builder form UI still matches this screenshot -->
![SDL Builder Interface](/images/docs/console/4-sdl-builder-interface.png)
*Visual SDL Builder - configure your deployment using a form-based interface*

### Pre-Built Templates

Browse ready-to-deploy application templates:

- **AI/ML Models** - Stable Diffusion, LLMs, Ollama, Open WebUI
- **Databases** - PostgreSQL, MongoDB, Redis, MySQL
- **Web Servers** - Nginx, Apache, Caddy
- **Development Tools** - Jupyter, VS Code Server
- **And much more...**

<!-- VERIFY: Templates library grid still matches this screenshot -->
![Templates Library](/images/docs/console/5-templates-library.png)
*Browse pre-built templates for common applications*

<!-- VERIFY: Template detail page still matches this screenshot -->
![Template Detail](/images/docs/console/6-template-detail.png)
*View template details and deploy with one click*

### Deployment Dashboard

Monitor and manage all your deployments:

- **Active Leases** - See all running deployments
- **Deployment Status** - Real-time status updates
- **Logs** - View container logs directly in the console
- **Events** - Monitor deployment events
- **Shell** - Open a shell into your running container
- **URLs** - Access your deployed applications

<!-- VERIFY: Deployments/Leases dashboard still matches this screenshot (now a "Leases" tab; Balance/Cost/Spent labels) -->
![Deployments Dashboard](/images/docs/console/15-deployments-dashboard.png)
*Manage all your deployments from a single dashboard*

---

## Deploy Your Own App

The guided flow above picks a provider for you automatically. When you bring your own Docker image or custom SDL, you get the full configure screen—including choosing your own provider.

### Step-by-Step Deployment Flow

#### 1. Configure Your Deployment

Use the SDL Builder or start from a template, then customize your image, resources, and settings:

<!-- VERIFY: SDL configuration screen still matches this screenshot -->
![SDL Configuration](/images/docs/console/7-sdl-configuration.png)
*Configure your deployment with SDL or use the visual builder*

#### 2. Review and Deploy

Review your configuration and deploy. A small deployment deposit is set aside automatically from your credit balance and returned when you close the deployment—there's no deposit amount to enter and no crypto involved.

<!-- SCREENSHOT: Deployment review screen for a custom/BYO deploy (USD credits, automatic deposit—no ACT, no manual deposit field) -->
![Deployment Review](/images/docs/console/8-deployment-review.png)
*Review your deployment—the deposit is handled automatically in USD credits*

#### 3. Choose Your Provider

For a bring-your-own-image deploy, Console lets you pick the provider yourself. Once providers respond, compare them and choose one based on:

- **Price** - Cost per month
- **Location** - Geographic region
- **Attributes** - Features and certifications

<!-- SCREENSHOT: Provider selection screen for the manual/BYO path (guided template deploys match automatically; this documents "Choose my provider") -->
![Provider Selection](/images/docs/console/10-bid-selection.png)
*Compare providers and pick one for your bring-your-own-image deployment*

#### 4. Access Your Running Deployment

Once the provider is selected, your deployment starts running:

<!-- SCREENSHOT: Active deployment/lease detail view (live URLs, Cost/Spent labels in USD) -->
![Deployment Active](/images/docs/console/12-deployment-active.png)
*Your deployment is live with URLs and status information*

You'll see:
- **Live URLs** - Access your application
- **Status** - Real-time deployment state
- **Cost Tracking** - Current spending
- **Management Controls** - Update, logs, close

---

## Console vs CLI

### When to Use Console

**Use Console if you:**
- Prefer visual interfaces over terminal commands
- Are new to Akash and want guided setup
- Want quick deployments with pre-built templates
- Need to manage multiple deployments with a dashboard view
- Want to try Akash with free trial credits
- Prefer pay-as-you-go billing with a credit card

### When to Use CLI

**Use CLI if you:**
- Need automation and scripting for deployments
- Want CI/CD pipeline integration
- Prefer command-line workflows
- Need advanced features like AuthZ delegation
- Want direct blockchain control without GUI
- Are building tooling on top of Akash

**Both work together!** Deployments created in Console can be managed via CLI, and vice versa. Use whichever tool fits your workflow best.

---

## Common Tasks

### View Deployment Logs

Monitor your application's output in real-time:

1. Go to **"Leases"** in the sidebar
2. Click on your deployment
3. Navigate to the **"Logs"** tab
4. View real-time container logs

<!-- VERIFY: Logs tab still matches this screenshot -->
![Deployment Logs](/images/docs/console/13-deployment-logs.png)
*View real-time logs from your running containers*

### Monitor Events and Open a Shell

Deployment **Events** and **Shell** are now separate tabs. Use **Events** to follow lifecycle activity and **Shell** to open a terminal into your running container:

<!-- VERIFY: Events tab still matches this screenshot (Shell is now its own tab) -->
![Deployment Events](/images/docs/console/14-deployment-events.png)
*View deployment events; open a terminal from the Shell tab*

### Update a Deployment

Modify your running deployment without downtime:

1. Select your deployment
2. Click **"Update"**
3. Modify your SDL or configuration
4. Click **"Update Deployment"**
5. Changes will be applied to your running deployment

<!-- VERIFY: Update deployment screen still matches this screenshot -->
![Deployment Update](/images/docs/console/16-deployment-update.png)
*Update your deployment configuration on the fly*

**Note:** Existing containers continue running until the new version is ready.

### Close a Deployment

Stop your deployment and return the deposit to your balance:

1. Select your deployment
2. Click **"Close"**
3. Confirm the action
4. Your deployment stops and the automatic deposit is returned to your credit balance

<!-- VERIFY: Close deployment confirmation still matches this screenshot -->
![Deployment Close Confirmation](/images/docs/console/17-deployment-close.png)
*Confirm deployment closure—the deposit returns to your balance*

<!-- VERIFY: Deployment-closed confirmation still matches this screenshot -->
![Deployment Closed](/images/docs/console/17.1-deployment-close.png)
*Deployment successfully closed*

### Manage Billing and Credits

View your credit balance and add funds (everything is in USD credits):

<!-- SCREENSHOT: Billing/Credits screen showing USD balance and the 10% first-purchase bonus -->
![Billing and Credits](/images/docs/console/18-billing-credits.png)
*Manage your credits, payment methods, and billing*

You can:
- Check your remaining credits
- Add credits or update your card (minimum top-up $20)
- Turn on auto top-up so you never run out
- View spending history

**First-purchase bonus:** On your first purchase of $100 or more, get 10% in bonus credits, up to $100.

---

## Next Steps

- **[Console Air](https://github.com/akash-network/console-air)** - Self-custody alternative — bring your own Keplr wallet and run the UI yourself
- **[Console API](/docs/api-documentation/console-api)** - Programmatic deployments with REST API
- **[SDL Examples Library](/docs/developers/deployment/akash-sdl/examples-library)** - Deployment examples for all application types
- **[SDL Reference](/docs/developers/deployment/akash-sdl)** - Deep dive into Stack Definition Language
- **[CLI Documentation](/docs/developers/deployment/cli)** - Learn command-line deployment

---

## Need Help?

- **Console Support:** [GitHub Support](https://github.com/akash-network/support/issues)
- **Discord:** [discord.akash.network](https://discord.akash.network)
- **Documentation:** Browse the [full docs](/docs)

---

**Ready to deploy?** Visit [console.akash.network](https://console.akash.network) and create your first deployment!
