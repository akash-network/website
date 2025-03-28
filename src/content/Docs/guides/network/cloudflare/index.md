---
categories: ["Guides"]
tags: ["Network"]
weight: 1
title: "Using Cloudflare with Your Akash Deployment"
linkTitle: "Cloudflare"
---


Cloudflare can help improve the security, performance, and reliability of your Akash deployment. This guide will walk you through:  

- Setting up a **custom domain** with Cloudflare  
- Enabling **Cloudflare proxy (CDN & security features)**  
- Setting up **HTTPS (SSL/TLS)**  

---

## **Prerequisites**  
Before you begin, ensure you have:  

- A **deployed Akash application** (follow the [Akash deployment guide](https://akash.network/docs) if you don’t have one).  
- A **domain** added to Cloudflare.  
- The latest **Akash CLI** installed .  

---

## **Step 1: Get Your Akash Deployment Hostname**  

Run the following command to fetch the lease details of your deployment:  

```sh
provider-services lease-status --dseq <DSEQ> --from <WALLET_NAME> --provider <PROVIDER_ADDRESS>
```

Replace:  
- `<DSEQ>` with your **deployment sequence number**.  
- `<WALLET_NAME>` with your **Akash wallet name**.  
- `<PROVIDER_ADDRESS>` with the **provider’s address**.  

Look for the **"uris"** field in the output. You should see a hostname like:  

```
"uris": ["abcdef.provider.akash.network"]
```

This is the default provider-assigned hostname.

---

## **Step 2: Configure Cloudflare DNS**  

1. **Log into Cloudflare** and select your domain.  
2. Go to the **DNS** settings.  
3. Add a **CNAME record** to point your custom domain to your Akash deployment:  

   - **Type:** `CNAME`  
   - **Name:** `app` (or `@` for root domain)  
   - **Target:** `abcdef.provider.akash.network` (from Step 1)  
   - **Proxy status:** **Enabled** (Orange cloud)  

4. Click **Save**.  

---

## **Step 3: Configure SSL/TLS**  

To ensure your Akash deployment is served over HTTPS:  

1. Go to **SSL/TLS** settings in Cloudflare.  
2. Set SSL mode to **"Full"** (recommended) or **"Full (strict)"** if you have a valid certificate on your Akash deployment.  
3. Optionally, enable **"Always Use HTTPS"** to automatically redirect HTTP traffic.  

---

## **Step 4: Optimize Performance & Security**  

- **Enable Cloudflare Caching:** Under the **Caching** section, enable caching to improve performance.  
- **Enable DDoS Protection:** Cloudflare’s security features help mitigate attacks.  
- **Use Page Rules:** You can add rules to customize caching, redirects, or security settings for your app.  

---

## **Step 5: Test Your Setup**  

After a few minutes, try accessing your app via your **custom domain** (`app.yourdomain.com`). It should now be served through Cloudflare with SSL and caching enabled.  

---

## **Troubleshooting**  

- **DNS Not Resolving?** Wait for Cloudflare’s DNS propagation (can take a few minutes).  
- **SSL Errors?** Ensure SSL is set to **Full** (not Flexible) in Cloudflare.  
- **Incorrect Proxy Behavior?** Disable the **Proxy (Orange cloud)** temporarily to diagnose issues.  

---

## **Conclusion**  

By using Cloudflare, you enhance your Akash deployment with **better performance, security, and free SSL**. You can further explore Cloudflare’s **WAF, bot protection, and load balancing** to optimize your setup.