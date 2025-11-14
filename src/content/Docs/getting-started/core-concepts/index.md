---
categories: ["Getting Started"]
tags: ["Concepts", "Basics"]
weight: 2
title: "Core Concepts"
linkTitle: "Core Concepts"
---

**Understand the key concepts behind Akash Network.**

This guide explains how Akash works and the core components you'll interact with when deploying applications.

---

## How Akash Works

Akash Network is a decentralized marketplace that connects:

- **Deployers** (you) - People who want to run applications
- **Providers** - Data centers offering compute resources
- **Blockchain** - The Akash blockchain coordinates everything

When you deploy an app:

1. You create a **deployment** describing what you need
2. Providers bid to host your app
3. You accept a bid and create a **lease**
4. Your app runs on the provider's infrastructure
5. Payment happens automatically from your escrow account

---

## Key Components

### Deployments

A **deployment** is a request for compute resources on Akash Network.

**Key Points:**
- Defined using SDL (Stack Definition Language)
- Specifies your app's container image, resources, and ports
- Creates an order on the marketplace
- **With wallet:** Requires a 0.5 AKT minimum deposit
- **With trial:** Uses managed credits (no direct deposit)

**Example deployment:**
- Image: `nginx:latest`
- Resources: 0.5 CPU, 512MB RAM, 512MB storage
- Port: 80 exposed to the internet
- Price: Willing to pay up to 10000 uAKT per block

### Providers

**Providers** are data centers that offer compute resources on Akash Network.

**What providers offer:**
- CPU, GPU, memory, and storage
- Global distribution (North America, Europe, Asia)
- Different pricing and hardware specs
- Various attributes (location, certifications, etc.)

**How to choose a provider:**
- Review their bid price
- Check their uptime/reputation
- Consider geographic location
- Look at their available resources

### Leases

A **lease** is an agreement between you and a provider.

**What happens in a lease:**
- Locks in pricing for your deployment
- Provider allocates resources for your app
- Your escrow account pays the provider per block
- Continues until you close the deployment or funds run out

**Lease lifecycle:**
1. Deployment created → Order opens
2. Providers submit bids
3. You accept a bid → Lease created
4. Provider runs your app
5. Automatic payments per block
6. You close deployment → Lease ends

### SDL (Stack Definition Language)

**SDL** is how you describe your deployment to Akash.

**SDL defines:**
- Container images to deploy
- CPU, memory, and storage requirements
- Network ports and exposure
- Pricing you're willing to pay
- Placement requirements (optional)

**SDL Example:**

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

**Learn more:** [SDL Documentation](/docs/getting-started/stack-definition-language/)

### Escrow Accounts

**Escrow accounts** hold funds to pay for your deployments.

**How escrow works (with wallet):**
- You deposit AKT when creating a deployment (minimum 0.5 AKT)
- Provider is paid automatically per block from escrow
- Unused funds returned when you close the deployment
- If escrow runs out, deployment closes automatically

**Example:**
- Deploy with 5 AKT in escrow
- Provider charges 0.001 AKT per block
- Deployment runs for ~5000 blocks
- Close deployment, get remaining ~4.5 AKT back

**How it works with trial:**
- Managed by Akash Console (you don't see escrow directly)
- Credits are deducted from your $100 trial balance
- 24-hour deployment limit (trial restriction)
- No manual deposit or refund process

### Certificates

**Certificates** enable secure communication between you and providers.

**Important points:**
- Required once per account (wallet users only)
- Valid for one year
- Stored on the Akash blockchain
- Free to create (just gas fees)
- Can be revoked and regenerated

**When you need a certificate:**
- Before your first deployment (wallet users)
- After certificate expires (1 year)
- If you revoke your old certificate

**Note:** Trial users don't need to manually create certificates - they're managed automatically by Console.

---

## Resource Units

Understanding how resources are measured on Akash:

### CPU

- Measured in **units**
- 1 unit = 1 CPU thread
- Common: 0.1 - 4.0 units
- Examples:
  - `0.5` = Half a CPU thread
  - `2.0` = 2 full CPU threads

### Memory

- Measured in **Mi** (Mebibytes) or **Gi** (Gibibytes)
- Common: 512Mi - 16Gi
- Examples:
  - `512Mi` = 512 Mebibytes (~537 MB)
  - `2Gi` = 2 Gibibytes (~2.15 GB)

### Storage

- Measured in **Mi** (Mebibytes) or **Gi** (Gibibytes)
- Persistent or ephemeral
- Common: 512Mi - 100Gi
- Examples:
  - `1Gi` = 1 Gibibyte (~1.07 GB)
  - `10Gi` = 10 Gibibytes (~10.7 GB)

### GPU

- Measured in **units**
- Specific GPU models specified by attributes
- Examples:
  - `units: 1` with `vendor: nvidia` and `model: rtx4090`

---

## Pricing on Akash

### How Pricing Works

**You set the maximum price you're willing to pay:**
- Specified in SDL as `amount` in `uakt` (micro-AKT)
- Price is per block (~6 seconds on Akash)
- Providers bid at or below your max price

**Example calculation:**
- You offer: 10000 uAKT per block
- Provider bids: 5000 uAKT per block
- Blocks per day: ~14,400
- Daily cost: 5000 × 14,400 = 72,000,000 uAKT = 0.072 AKT

### Typical Costs

**Rough estimates (vary by provider and demand):**

**Basic web app:**
- 0.5 CPU, 512MB RAM
- ~$1-3 per month

**Small API:**
- 1 CPU, 2GB RAM
- ~$5-10 per month

**GPU workload:**
- 1x RTX 4090
- ~$50-150 per month

**Database:**
- 2 CPU, 4GB RAM, 20GB storage
- ~$10-20 per month

---

## Network Interaction

### The Blockchain

**Akash blockchain coordinates everything:**
- Deployments and orders
- Bids and leases
- Certificates
- Payments and escrow

**You interact with the blockchain to:**
- Create/update/close deployments
- Accept provider bids
- Manage certificates
- Check balances

### The Provider

**Providers host your actual application:**
- You send your manifest (detailed deployment spec)
- Provider pulls your container images
- Provider runs your containers
- Provider exposes your services

**You interact with providers to:**
- Upload manifest
- Check deployment status
- View logs
- Get service URLs

---

## Updating Deployments

### What CAN Be Updated

You can update certain aspects of your deployment without creating a new one:

✅ **Container image versions** - Change image tags  
✅ **Environment variables** - Update env vars  
✅ **Port configurations** - Modify exposed ports (without resource changes)  
✅ **SDL version** - Update deployment hash

**To update these:**

```bash
# Update on-chain (updates SDL hash)
provider-services tx deployment update deploy.yaml \
  --dseq $AKASH_DSEQ \
  --from $AKASH_KEY_NAME

# Send new manifest to provider
provider-services send-manifest deploy.yaml \
  --dseq $AKASH_DSEQ \
  --provider $AKASH_PROVIDER \
  --from $AKASH_KEY_NAME
```

### What CANNOT Be Updated

❌ **CPU count** - Cannot change after deployment  
❌ **Memory size** - Cannot change after deployment  
❌ **Storage size** - Cannot change after deployment  
❌ **Replica count** - Cannot scale up/down  
❌ **GPU requirements** - Cannot add/remove GPUs

**To change resources:** You must close the deployment and create a new one with updated specifications.

---

## Deployment Lifecycle

**Complete flow of an Akash deployment:**

### 1. Prepare
- Install provider-services CLI
- Create and fund wallet
- Generate certificate
- Write SDL file

### 2. Create Deployment
```bash
provider-services tx deployment create deploy.yaml --from $AKASH_KEY_NAME
```
- Deployment posted to blockchain
- Order opens on marketplace
- Escrow account funded (0.5 AKT minimum)

### 3. Review Bids
```bash
provider-services query market bid list --owner=$AKASH_ACCOUNT_ADDRESS --dseq $AKASH_DSEQ
```
- Providers submit bids
- Review price, provider attributes
- Choose preferred provider

### 4. Create Lease
```bash
provider-services tx market lease create --dseq $AKASH_DSEQ --provider $AKASH_PROVIDER --from $AKASH_KEY_NAME
```
- Accept provider's bid
- Lease created on blockchain
- Provider reserves resources

### 5. Send Manifest
```bash
provider-services send-manifest deploy.yaml --dseq $AKASH_DSEQ --provider $AKASH_PROVIDER --from $AKASH_KEY_NAME
```
- Detailed config sent to provider
- Provider pulls container images
- Containers start running

### 6. Access Application
```bash
provider-services lease-status --dseq $AKASH_DSEQ --provider $AKASH_PROVIDER --from $AKASH_KEY_NAME
```
- Get service URLs
- Application is live!

### 7. Monitor & Manage
- View logs
- Update deployment
- Monitor resources
- Check escrow balance

### 8. Close Deployment
```bash
provider-services tx deployment close --dseq $AKASH_DSEQ --from $AKASH_KEY_NAME
```
- Lease ends
- Containers stopped
- Unused escrow funds returned

---

## Important Limits & Rules

### Deployment Limits

- **Minimum escrow:** 0.5 AKT per deployment
- **Maximum services:** 50 per deployment
- **Certificate expiry:** 1 year
- **Bid timeout:** 5 minutes (bids close automatically)

### SDL Rules

- **Version:** Must be "2.0"
- **Image tags:** Must specify version (no `latest` tag)
- **Resource minimums:** 
  - CPU: 0.1 units
  - Memory: 128Mi
  - Storage: 128Mi

### Best Practices

- **Always specify exact image versions** in SDL
- **Set reasonable pricing** to get competitive bids
- **Monitor escrow balance** to avoid unexpected deployment closure
- **Keep certificates valid** (renew before expiry)
- **Test deployments** on testnet first for complex setups

---

**Previous:** [← What is Akash?](/docs/getting-started/what-is-akash)  
**Next:** [Quick Start →](/docs/getting-started/quick-start)

---

## Next Steps

Now that you understand the core concepts, choose your deployment path:

### Start with Trial (Recommended)
- [**Quick Start - Free Trial**](/docs/getting-started/quick-start) - Deploy your first app with $100 free credits

### Use Your Own Wallet (Advanced)
- [**Console with Wallet**](/docs/for-developers/deployment/console) - Visual interface, no time limits
- [**CLI with Wallet**](/docs/for-developers/deployment/cli) - Command-line deployment
- [**SDK**](/docs/for-developers/deployment/akash-sdk) - Programmatic deployment

### Learn More
- [**SDL Documentation**](/docs/for-developers/deployment/akash-sdl) - Deep dive into SDL

---

## Questions?

**Common questions:**

**Q: Do I need to keep my computer on after deploying?**  
A: No! Once deployed, your app runs on the provider's infrastructure.

**Q: What happens if the provider goes offline?**  
A: Your deployment will go down. You must close and create a new deployment with a different provider.

**Q: Can I deploy multiple apps from one account?**  
A: Yes! Each deployment is independent with its own escrow account.

**Q: How do I scale or change resources?**  
A: You cannot modify resources of an existing deployment. You must close the current deployment and create a new one with updated resources.

**Q: What if I run out of funds in escrow?**  
A: Your deployment will automatically close. Top up escrow before it runs out.

---

## Need Help?

- [Akash Discord](https://discord.akash.network) - Community support
- [Akash Docs](/docs) - Full documentation
- [Stack Definition Language](/docs/getting-started/stack-definition-language/) - SDL reference

