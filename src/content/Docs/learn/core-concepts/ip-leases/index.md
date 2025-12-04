---
categories: ["Learn", "Core Concepts"]
tags: ["IP Leases", "Networking", "Static IP"]
weight: 5
title: "IP Leases"
linkTitle: "IP Leases"
description: "Dedicated IP addresses and static endpoints for Akash deployments"
---

**Get dedicated IP addresses for your Akash deployments.**

By default, Akash deployments are accessible through dynamic hostnames provided by the provider. IP Leases allow you to get a **dedicated static IP address** for your deployment, enabling custom domains, direct IP access, and more control over networking.

---

## What are IP Leases?

An **IP Lease** is a dedicated public IPv4 address assigned to your deployment for the duration of your lease. This IP address:
- Remains **static** for the lifetime of your deployment
- Allows **direct IP access** without provider hostnames
- Enables **custom domain** mapping
- Supports **any port** configuration
- Works with **TCP and UDP** protocols

---

## When to Use IP Leases

### ✅ Use IP Leases For:

- **Custom domains** - Point your own domain directly to your deployment
- **Static IP requirements** - When you need a consistent IP address
- **Non-HTTP services** - SSH, game servers, custom protocols
- **Direct database access** - Expose databases with a static IP
- **Load balancing** - Use your own load balancer pointed at the IP

**Note:** The IP lease address is for incoming connections only. Outbound/egress traffic from your deployment uses a different IP address.

### ❌ Don't Need IP Leases For:

- **Standard web apps** - Provider hostnames work fine
- **Cost-sensitive deployments** - IP leases cost extra

---

## How IP Leases Work

### 1. Define IP Endpoint in SDL

Define IP endpoints at the top level of your SDL and reference them in your service expose configuration:

```yaml
endpoints:
  myendpoint:
    kind: ip

services:
  web:
    expose:
      - port: 80
        as: 80
        to:
          - global: true
            ip: myendpoint  # Reference the endpoint
```

### 2. Provider Assigns IP

When you create a lease, the provider assigns a dedicated public IP to your deployment.

### 3. Access Your Service

You can now access your service directly via the assigned IP address:
- HTTP: `http://123.456.789.10`
- Custom ports: `123.456.789.10:8080`
- Non-HTTP: `ssh user@123.456.789.10`

---

## SDL Configuration

### Basic HTTP with IP Lease

```yaml
version: "2.0"

endpoints:
  web-endpoint:
    kind: ip

services:
  web:
    image: nginx:latest
    expose:
      - port: 80
        as: 80
        proto: tcp
        to:
          - global: true
            ip: web-endpoint

profiles:
  compute:
    web:
      resources:
        cpu:
          units: 1.0
        memory:
          size: 512Mi
        storage:
          size: 512Mi

  placement:
    akash:
      pricing:
        web:
          denom: uakt
          amount: 10000
        web-endpoint:  # IP endpoint pricing
          denom: uakt
          amount: 10000  # Additional cost for IP

deployment:
  web:
    akash:
      profile: web
      count: 1
```

**Important:** You must include pricing for your IP endpoint, as IP leases have additional costs.

### Multiple Ports

Expose multiple ports on the same IP:

```yaml
endpoints:
  server-ip:
    kind: ip

services:
  server:
    image: myapp:latest
    expose:
      - port: 80
        as: 80
        proto: tcp
        to:
          - global: true
            ip: server-ip
      - port: 443
        as: 443
        proto: tcp
        to:
          - global: true
            ip: server-ip  # Same IP, different port
      - port: 22
        as: 22
        proto: tcp
        to:
          - global: true
            ip: server-ip  # SSH on same IP
```

### Custom Port Mapping

Map container ports to different external ports:

```yaml
endpoints:
  app-ip:
    kind: ip

services:
  app:
    expose:
      - port: 8080  # Container port
        as: 80  # External port
        proto: tcp
        to:
          - global: true
            ip: app-ip
```

Now your service running on port `8080` inside the container is accessible via port `80` on the public IP.

---

## UDP Services

IP leases work with UDP protocols, essential for game servers and real-time applications:

```yaml
endpoints:
  game-ip:
    kind: ip

services:
  game-server:
    image: minecraft-server:latest
    expose:
      - port: 25565
        as: 25565
        proto: udp
        to:
          - global: true
            ip: game-ip

profiles:
  placement:
    akash:
      pricing:
        game-server:
          denom: uakt
          amount: 15000
        game-ip:
          denom: uakt
          amount: 10000
```

---

## Custom Domains

Once you have an IP lease, you can point your custom domain to it.

### 1. Get Your IP Address

After deployment, find your assigned IP:
- **Console:** Check the deployment details
- **CLI:** Query the lease status

### 2. Configure DNS

Add an A record in your DNS provider:

```
Type: A
Name: @ (or subdomain)
Value: 123.456.789.10
TTL: 3600
```

### 3. Access via Domain

Your deployment is now accessible at `yourdomain.com`.

### SSL/TLS with Custom Domains

For HTTPS with custom domains:

**Option 1: Use Caddy (Automatic HTTPS)**

```yaml
endpoints:
  web-ip:
    kind: ip

services:
  web:
    image: caddy:latest
    env:
      - DOMAIN=yourdomain.com
    expose:
      - port: 80
        as: 80
        to:
          - global: true
            ip: web-ip
      - port: 443
        as: 443
        to:
          - global: true
            ip: web-ip
```

**Option 2: Use Traefik with Let's Encrypt**

Configure Traefik in your container to automatically obtain SSL certificates from Let's Encrypt.

**Option 3: Use a Reverse Proxy**

Point your domain to a reverse proxy (Cloudflare, nginx) that handles SSL, then forward to your Akash IP.

---

## Pricing

IP leases have **additional costs** beyond compute resources:

### Provider Charges

- IP lease costs vary by provider
- Typically ~$5-15/month additional
- Specified in SDL under `ip_lease` pricing
- Paid from your escrow account like other resources

### Example Cost Calculation

```
Base compute: $3/month
IP lease: $10/month
Total: $13/month
```

### Set Max Price

In your SDL, set the maximum you're willing to pay:

```yaml
endpoints:
  my-ip:
    kind: ip

placement:
  akash:
    pricing:
      web:
        denom: uakt
        amount: 10000  # Max for compute
      my-ip:
        denom: uakt
        amount: 10000  # Max for IP endpoint
```

Providers will bid at or below these amounts.

---

## Multiple Services, One IP

You can expose multiple services on the same IP address with different ports:

```yaml
version: "2.0"

endpoints:
  shared-ip:
    kind: ip

services:
  frontend:
    image: my-frontend:latest
    expose:
      - port: 3000
        as: 80
        proto: tcp
        to:
          - global: true
            ip: shared-ip

  backend:
    image: my-backend:latest
    expose:
      - port: 8000
        as: 8080
        proto: tcp
        to:
          - global: true
            ip: shared-ip  # Same IP, port 8080

  database:
    image: postgres:15
    expose:
      - port: 5432
        as: 5432
        proto: tcp
        to:
          - global: true
            ip: shared-ip  # Same IP, port 5432

profiles:
  placement:
    akash:
      pricing:
        frontend:
          denom: uakt
          amount: 10000
        backend:
          denom: uakt
          amount: 10000
        database:
          denom: uakt
          amount: 10000
        shared-ip:
          denom: uakt
          amount: 10000  # One IP endpoint for all services
```

Access your services:
- Frontend: `http://123.456.789.10:80`
- Backend: `http://123.456.789.10:8080`
- Database: `123.456.789.10:5432`

---

## Limitations

### Per-Deployment

IP leases are **per-deployment**, not per-account:
- Each deployment gets its own IP lease
- Closing a deployment releases the IP
- New deployment = new IP (even with same provider)

### Provider Availability

Not all providers offer IP leases:
- Check provider attributes before bidding
- Filter for providers with IP lease support
- Pricing varies by provider

### IPv4 Only

Currently, only IPv4 addresses are supported:
- No IPv6 support yet
- One IP address per deployment

### IP Lease Migration

You **can** migrate IP leases between deployments on the same provider:
- Use `provider-services tx deployment migrate-lease` to transfer the IP to a new deployment
- The IP address moves from the old deployment to the new one
- Useful when you need to update resources that cannot be changed via deployment updates

**Note:** You cannot migrate IP leases across different providers - switching providers requires a new IP address.

---

## Common Patterns

### Game Server

```yaml
endpoints:
  game-ip:
    kind: ip

services:
  minecraft:
    image: itzg/minecraft-server:latest
    env:
      - EULA=TRUE
      - TYPE=PAPER
    expose:
      - port: 25565
        as: 25565
        proto: tcp
        to:
          - global: true
            ip: game-ip
```

**Players connect to:** `123.456.789.10:25565`

### SSH Access

```yaml
endpoints:
  ssh-ip:
    kind: ip

services:
  jumpbox:
    image: ubuntu:22.04
    expose:
      - port: 22
        as: 22
        proto: tcp
        to:
          - global: true
            ip: ssh-ip
```

**SSH command:** `ssh user@123.456.789.10`

### API with Custom Domain

```yaml
endpoints:
  api-ip:
    kind: ip

services:
  api:
    image: myapi:latest
    expose:
      - port: 8080
        as: 443
        proto: tcp
        to:
          - global: true
            ip: api-ip
```

**After DNS setup:** `https://api.yourdomain.com`

---

## Troubleshooting

### Provider Doesn't Offer IP Leases

**Solution:** Choose a different provider that supports IP leases. Check provider attributes or ask in Discord for recommendations.

### Can't Access Service via IP

**Possible causes:**
1. **IP not assigned yet** - Wait a few minutes after deployment
2. **Wrong port** - Verify the `as` port in your SDL
3. **Firewall** - Some providers may have additional firewall rules
4. **Service not running** - Check container logs

### IP Changed After Update

**Cause:** IP leases are stable within a deployment but may change if you close and recreate.

**Solution:** To keep the same IP, update your deployment instead of recreating it (when possible).

### DNS Not Resolving

**Causes:**
1. **DNS not propagated** - Can take up to 48 hours (usually much faster)
2. **Wrong IP** - Double-check the IP address in your DNS settings
3. **TTL too high** - Use shorter TTL (300-3600) for faster updates

**Solution:** 
- Wait for DNS propagation
- Use `dig` or `nslookup` to verify DNS records
- Clear local DNS cache

---

## Best Practices

✅ **DO:**
- Budget for IP lease costs in addition to compute
- Use IP leases when you need static endpoints
- Configure monitoring for your IP-based services
- Document your IP addresses for team reference
- Plan for IP changes when migrating providers

❌ **DON'T:**
- Hardcode IP addresses in your application code
- Expect IP to remain after closing deployment
- Use IP leases for basic web apps (costly and unnecessary)
- Share IP addresses publicly if security is a concern

---

## Security Considerations

### Firewall Rules

With a dedicated IP, your services are directly accessible:
- Implement application-level authentication
- Use firewalls within your containers
- Don't expose sensitive services unnecessarily
- Monitor for suspicious traffic

### DDoS Protection

Dedicated IPs can be targets for DDoS attacks:
- Use Cloudflare or similar DDoS protection
- Implement rate limiting
- Monitor bandwidth usage
- Have a plan to close and redeploy if attacked

### Access Control

For services like SSH or databases:
- Use strong authentication (keys, not passwords)
- Change default ports if possible
- Implement IP whitelisting in your application
- Monitor access logs

---

## Related Topics

- [SDL Syntax Reference](/docs/developers/deployment/akash-sdl/syntax-reference) - Expose and endpoint configuration
- [Deployments](/docs/learn/core-concepts/deployments) - Deployment lifecycle
- [Providers & Leases](/docs/learn/core-concepts/providers-leases) - Choosing providers

---

**Need help with IP leases?** Ask in [Discord](https://discord.akash.network) #deployments channel!

