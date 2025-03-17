---
categories: ["Guides"]
tags: ["Network"]
weight: 1
title: "How to Use a Custom Domain with Your Akash Deployment  "
linkTitle: "Custom Domain"
---


This guide walks you through setting up a custom domain for your Akash deployment. We’ll cover:  

- Deploying your application  
- Setting up a custom domain with CNAME or A records  
- Configuring HTTPS with Let's Encrypt  

---

## **Prerequisites**  
Before you start, ensure you have:  

- An **Akash deployment** running (if not, follow the [Akash deployment guide](https://akash.network/docs)).  
- A **domain name** (purchased from a domain registrar like Namecheap, GoDaddy, or Cloudflare).  
- The latest Akash CLI installed.  

---

## **Step 1: Get Your Deployment Hostname**  

Run the following command to fetch the lease details of your deployment:  

```sh
provider-services lease-status --dseq <DSEQ> --from <WALLET_NAME> --provider <PROVIDER_ADDRESS>
```

Replace:  
- `<DSEQ>` with your deployment sequence number.  
- `<WALLET_NAME>` with your Akash wallet name.  
- `<PROVIDER_ADDRESS>` with the address of the provider hosting your deployment.  

Look for the **hostnames** under the services section. It should look something like:  

```
"uris": ["abcdef.provider.akash.network"]
```

This is your Akash provider-assigned domain.

---

## **Step 2: Configure Your Custom Domain**  

Now, go to your domain registrar’s DNS settings and:  

### **Option 1: Using a CNAME Record (Recommended)**  
1. Navigate to the **DNS settings** of your domain.  
2. Add a **CNAME record** pointing to the Akash provider hostname.  

Example:  

| Type  | Name  | Value (Target) |
|-------|------|----------------|
| CNAME | `app` (or `@` for root) | `abcdef.provider.akash.network` |

This will map `app.yourdomain.com` to your Akash deployment.  

### **Option 2: Using an A Record**  
If your provider supports static IPs, you can use an A record:  

1. Find the **IP address** of your provider (check Akash lease status or ask the provider).  
2. Add an **A record** in your DNS settings:  

| Type | Name | Value (IP Address) |
|------|------|----------------|
| A    | `app`  | `<PROVIDER_IP>` |

This method works, but IPs might change, so CNAME is preferred.

---

## **Step 3: Enable HTTPS with Let’s Encrypt**  

For SSL, use a reverse proxy (like Caddy or Nginx) inside your Akash deployment, or use a managed service like Cloudflare.

### **Option 1: Using Cloudflare (Easiest)**
1. Set up your domain on **Cloudflare** (free plan works).  
2. Enable **“Full” SSL mode** under **SSL/TLS settings**.  
3. Your site will now have HTTPS automatically.

### **Option 2: Using Caddy (Self-Managed)**
If running **Caddy** inside your Akash deployment, modify your `Caddyfile`:

```
yourdomain.com {
    reverse_proxy localhost:8000
    tls {
        dns cloudflare {env.CLOUDFLARE_API_TOKEN}
    }
}
```

Ensure your Akash SDL allows exposing port 443.

---

## **Step 4: Verify and Test**  
- Wait a few minutes for DNS changes to propagate.  
- Open your browser and visit **https://yourdomain.com**.  
- Use `dig yourdomain.com` or `nslookup yourdomain.com` to verify DNS settings.  

---

## **Conclusion**  
You’ve successfully configured a custom domain for your Akash deployment using `provider-services`. Now your application is accessible via your own domain with HTTPS!