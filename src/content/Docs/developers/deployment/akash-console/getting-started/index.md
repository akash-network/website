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
- **Managed Wallet or Bring Your Own** - Start with free trial credits or connect your wallet
- **No CLI Required** - Everything you need in your browser

---

## Getting Started

### Step 1: Access Akash Console

Visit [console.akash.network](https://console.akash.network) in your web browser.

![Console Homepage](/images/docs/console/1-console-homepage.png)
*Akash Console homepage - Start with free trial or connect your own wallet*

### Step 2: Sign Up for Free Trial

1. Click **"Start Free Trial"** or **"Get Started"**
2. Enter your email address
3. Add a credit card (for verification and pay-as-you-go after trial)
4. Receive **$100 in free trial credits**

![Trial Signup](/images/docs/console/2-trial-signup.png)
*Sign up with email and credit card to receive $100 in trial credits*

**Note:** Trial deployments have a 24-hour limit. For longer deployments, use your own wallet or add payment method.

### Step 3: Explore Your Dashboard

After signing up, you'll see your Console dashboard with:

- **Trial Status** - $100.00 in credits with 30 days remaining
- **Setup Progress** - Track completion of onboarding steps
- **Featured Templates** - Quick-deploy options like Hello Akash, ComfyUI, and Llama-3.1-8b
- **One-Click Deploy** - Launch your first app in seconds

![Trial Dashboard](/images/docs/console/3-trial-dashboard.png)
*Console dashboard showing trial credits, setup progress, and featured templates ready to deploy*

---

## Key Features

### Visual SDL Builder

Build your deployment configuration visually without writing YAML:

- **Service Configuration** - Add services, set images, configure ports
- **Resource Allocation** - Set CPU, memory, and storage requirements
- **Network Settings** - Configure exposed ports and endpoints
- **Environment Variables** - Add environment variables to your containers
- **Pricing** - Set maximum bid prices

![SDL Builder Interface](/images/docs/console/4-sdl-builder-interface.png)
*Visual SDL Builder - configure your deployment using a form-based interface*

### Pre-Built Templates

Browse 290+ ready-to-deploy application templates:

- **AI/ML Models** - Stable Diffusion, LLMs, Ollama, Open WebUI
- **Databases** - PostgreSQL, MongoDB, Redis, MySQL
- **Web Servers** - Nginx, Apache, Caddy
- **Development Tools** - Jupyter, VS Code Server
- **And much more...**

![Templates Library](/images/docs/console/5-templates-library.png)
*Browse pre-built templates for common applications*

![Template Detail](/images/docs/console/6-template-detail.png)
*View template details and deploy with one click*

### Deployment Dashboard

Monitor and manage all your deployments:

- **Active Deployments** - See all running deployments
- **Deployment Status** - Real-time status updates
- **Logs** - View container logs directly in the console
- **Events** - Monitor deployment events and shell access
- **URLs** - Access your deployed applications

![Deployments Dashboard](/images/docs/console/15-deployments-dashboard.png)
*Manage all your deployments from a single dashboard*

---

## Quick Example: Deploy a Web App

### Step-by-Step Deployment Flow

#### 1. Configure Your Deployment

Use the SDL Builder or choose a template, then customize your configuration:

![SDL Configuration](/images/docs/console/7-sdl-configuration.png)
*Configure your deployment with SDL or use the visual builder*

#### 2. Set Deposit Amount

Set the initial deposit for your deployment:

![Deployment Review](/images/docs/console/8-deployment-review.png)
*Set your deposit amount - this is held in escrow and refunded when you close the deployment*

The deposit:
- Is held in escrow to pay for your deployment
- Gets refunded when you close the deployment
- Automatically tops up if running low

#### 3. Select a Provider Bid

After creating the deployment, providers will submit bids. Choose one based on:
- **Price** - Cost per month
- **Location** - Geographic region
- **Attributes** - Features and certifications

![Bid Selection](/images/docs/console/10-bid-selection.png)
*Review and accept provider bids for your deployment*

#### 4. Access Your Running Deployment

Once the bid is accepted, your deployment will start running:

![Deployment Active](/images/docs/console/12-deployment-active.png)
*Your deployment is live with URLs and status information*

You'll see:
- ✅ **Live URLs** - Access your application
- 📊 **Status** - Real-time deployment state
- 💰 **Cost Tracking** - Current spending
- ⚙️ **Management Controls** - Update, logs, close

---

## Console vs CLI

### When to Use Console

✅ **Use Console if you:**
- Prefer visual interfaces over terminal commands
- Are new to Akash and want guided setup
- Want quick deployments with pre-built templates
- Need to manage multiple deployments with a dashboard view
- Want to try Akash with free trial credits
- Prefer browsing provider bids visually

### When to Use CLI

✅ **Use CLI if you:**
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

1. Go to **"Deployments"** in the sidebar
2. Click on your deployment
3. Navigate to **"Logs"** tab
4. View real-time container logs

![Deployment Logs](/images/docs/console/13-deployment-logs.png)
*View real-time logs from your running containers*

### Monitor Events and Shell Access

Access deployment events and shell terminal:

![Deployment Events](/images/docs/console/14-deployment-events.png)
*View deployment events and access shell terminal*

### Update a Deployment

Modify your running deployment without downtime:

1. Select your deployment
2. Click **"Edit"** or **"Update"**
3. Modify your SDL or configuration
4. Click **"Update Deployment"**
5. Changes will be applied to your running deployment

![Deployment Update](/images/docs/console/16-deployment-update.png)
*Update your deployment configuration on the fly*

**Note:** Existing containers continue running until the new version is ready.

### Close a Deployment

Stop your deployment and reclaim your deposit:

1. Select your deployment
2. Click **"Close"** or **"Stop"**
3. Confirm the action
4. Your deployment will stop and remaining escrow will be refunded

![Deployment Close Confirmation](/images/docs/console/17-deployment-close.png)
*Confirm deployment closure and reclaim your deposit*

![Deployment Closed](/images/docs/console/17.1-deployment-close.png)
*Deployment successfully closed*

### Manage Billing and Credits

View your trial credits and add payment methods:

![Billing and Credits](/images/docs/console/18-billing-credits.png)
*Manage your trial credits, payment methods, and billing*

You can:
- Check remaining trial credits
- Add or update credit card
- View spending history
- Convert to pay-as-you-go after trial expires

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

