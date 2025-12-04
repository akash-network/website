---
categories: ["Developers", "Deployment", "Akash SDL"]
tags: ["SDL", "Best Practices", "Optimization"]
title: "SDL Best Practices"
linkTitle: "Best Practices"
description: "Best practices for writing efficient and reliable SDL files"
weight: 3
---

**Write efficient, secure, and cost-effective SDL configurations.**

Follow these best practices to optimize your deployments on Akash Network.

---

## Resource Optimization

### Right-Size Your Resources

**Don't over-provision** - Start small and scale up based on actual usage.

```yaml
# ❌ Bad: Over-provisioned
profiles:
  compute:
    web:
      resources:
        cpu:
          units: 8.0        # Too much for a simple web app
        memory:
          size: 16Gi        # Excessive
        storage:
          size: 500Gi       # Way more than needed

# ✅ Good: Right-sized
profiles:
  compute:
    web:
      resources:
        cpu:
          units: 0.5        # Sufficient for most web apps
        memory:
          size: 512Mi       # Appropriate
        storage:
          size: 1Gi         # Adequate
```

### Use Fractional CPU Units

For lightweight applications, use fractional CPU units to reduce costs:

```yaml
resources:
  cpu:
    units: 0.1          # 100 millicores
    # or
    units: "100m"       # Same as 0.1
```

**Common CPU allocations:**
- Static sites: `0.1` - `0.25`
- Web applications: `0.5` - `1.0`
- Databases: `1.0` - `2.0`
- AI/ML workloads: `4.0+`

### Memory Sizing Guidelines

```yaml
# Minimum viable sizes
memory:
  size: 128Mi       # Minimal static sites
  size: 256Mi       # Small apps
  size: 512Mi       # Standard web apps
  size: 1Gi         # Medium apps with caching
  size: 2Gi+        # Databases, heavy workloads
```

---

## Cost Management

### Set Competitive Pricing

Research current market rates before setting your bid price:

```yaml
# Check current market prices on Akash Console or Cloudmos
placement:
  akash:
    pricing:
      web:
        denom: uakt
        amount: 100      # Start low, increase if no bids
```

**Pricing strategy:**
1. Start with a low bid (e.g., 50-100 uakt)
2. If no bids after 5 minutes, increase by 50%
3. Monitor lease costs and adjust for future deployments

### Use USDC for Stable Pricing

For predictable costs, use USDC instead of AKT:

```yaml
pricing:
  web:
    denom: ibc/170C677610AC31DF0904FFE09CD3B5C657492170E7E52372E48756B71E56F2F1
    amount: 100
```


---

## Security Best Practices

### Use Private Container Registries

Protect proprietary images with credentials:

```yaml
services:
  web:
    image: registry.example.com/private/app:latest
    credentials:
      host: https://registry.example.com
      username: myuser
      password: mypassword      # Use environment variables in production
```

**Security tips:**
- Never commit credentials to version control
- Use environment variables or secrets management
- Rotate credentials regularly
- Use read-only registry tokens when possible

### Limit Exposure

Only expose ports that need to be publicly accessible:

```yaml
# ❌ Bad: Exposing everything
services:
  web:
    expose:
      - port: 80
        to:
          - global: true      # Public
      - port: 3306            # Database port
        to:
          - global: true      # ❌ Don't expose databases publicly!

# ✅ Good: Selective exposure
services:
  web:
    expose:
      - port: 80
        to:
          - global: true      # Public web traffic
  
  database:
    expose:
      - port: 3306
        to:
          - service: web      # ✅ Only accessible to web service
```

### Use Accept Lists for Custom Domains

Restrict access to specific domains:

```yaml
expose:
  - port: 80
    accept:
      - example.com
      - www.example.com
    to:
      - global: true
```

---

## Reliability and Availability

### Use Health Checks (HTTP Options)

Configure timeouts and retries for production reliability:

```yaml
expose:
  - port: 80
    to:
      - global: true
    http_options:
      max_body_size: 104857600    # 100MB
      read_timeout: 60000          # 60 seconds
      send_timeout: 60000          # 60 seconds
      next_tries: 3                # Retry 3 times
      next_timeout: 10000          # 10 second timeout between retries
      next_cases:                  # Retry on these errors
        - error
        - timeout
        - 500
        - 502
        - 503
```

### Implement Service Dependencies

Ensure services start in the correct order:

```yaml
services:
  web:
    image: wordpress
    depends_on:
      - database              # Wait for database to be ready
    
  database:
    image: mysql
```

### Use Persistent Storage for Stateful Apps

Never use ephemeral storage for critical data:

```yaml
# ❌ Bad: Using ephemeral storage for database
storage:
  - size: 10Gi              # Lost on restart!

# ✅ Good: Using persistent storage
storage:
  - size: 1Gi               # Ephemeral for temp files
  - name: db-data
    size: 10Gi
    attributes:
      persistent: true      # ✅ Survives restarts
      class: beta3          # Storage class
```

---

## Performance Optimization

### Optimize Storage Configuration

Separate ephemeral and persistent storage:

```yaml
profiles:
  compute:
    web:
      resources:
        storage:
          - size: 1Gi                    # Ephemeral: OS, temp files
          - name: app-data
            size: 5Gi
            attributes:
              persistent: true           # Persistent: Application data
              class: beta3
```

**Storage best practices:**
- Use ephemeral storage for temporary files, caches, logs
- Use persistent storage for databases, user uploads, configuration
- Don't over-allocate - storage costs add up
- Consider using object storage (S3-compatible) for large files

### Configure Storage Mounts

Mount persistent storage at the correct paths:

```yaml
services:
  database:
    image: postgres
    params:
      storage:
        db-data:
          mount: /var/lib/postgresql/data
          readOnly: false
```

### Use RAM Storage for Shared Memory (SHM)

RAM storage is for shared memory (`/dev/shm`) only, not general caching:

```yaml
storage:
  - name: shm
    size: 512Mi
    attributes:
      persistent: false
      class: ram              # Shared memory only (/dev/shm)
```

**Note:** RAM storage class is specifically for applications that require shared memory (e.g., Chrome, machine learning frameworks). For general caching, use ephemeral storage or an in-memory database like Redis.

---

## Multi-Service Deployments

### Service-to-Service Communication

Use internal networking for service communication:

```yaml
services:
  frontend:
    image: nginx
    env:
      - API_URL=http://backend:3000    # Use service name as hostname
    expose:
      - port: 80
        to:
          - global: true
  
  backend:
    image: node-api
    expose:
      - port: 3000
        to:
          - service: frontend           # Only accessible to frontend
```

**Internal networking benefits:**
- No public exposure of internal services
- Lower latency
- No bandwidth costs
- Automatic service discovery

### Environment Variable Management

Organize environment variables logically:

```yaml
services:
  web:
    env:
      # Application config
      - NODE_ENV=production
      - PORT=3000
      
      # Database connection
      - DB_HOST=database
      - DB_PORT=5432
      - DB_NAME=myapp
      
      # External services
      - REDIS_URL=redis://cache:6379
      - API_KEY=your-api-key        # Use secrets management in production
```

---

## GPU Workloads

### Specify GPU Requirements Precisely

Be specific about GPU requirements to ensure compatibility:

```yaml
resources:
  gpu:
    units: 1
    attributes:
      vendor:
        nvidia:
          - model: rtx4090         # Specific model
            ram: 24GB              # Optional: minimum VRAM
            interface: pcie        # Optional: interface type
```

**GPU selection tips:**
- Specify exact model when possible (e.g., `a100`, `rtx4090`)
- Use wildcards sparingly (may get slower GPUs)
- Include RAM requirement for VRAM-intensive workloads
- Consider cost vs. performance tradeoffs

### GPU Vendor Options

```yaml
# NVIDIA GPUs
vendor:
  nvidia:
    - model: a100
    - model: rtx4090
    - model: rtx3090

# AMD GPUs (limited availability)
vendor:
  amd:
    - model: mi100
```

---

## Provider Selection

### Use Provider Attributes

Target specific provider characteristics:

```yaml
placement:
  us-west:
    attributes:
      region: us-west              # Geographic region
      tier: premium                # Provider tier
      datacenter: equinix          # Specific datacenter
    pricing:
      web:
        denom: uakt
        amount: 100
```

**Common attributes:**
- `region`: Geographic location (us-west, eu-central, asia-east)
- `tier`: Provider quality tier
- `datacenter`: Specific datacenter provider
- Custom attributes set by providers

### Use Signed Providers (Audited)

For production workloads, prefer audited providers:

```yaml
placement:
  production:
    signedBy:
      anyOf:
        - akash1...          # Auditor address
      allOf:
        - akash1...          # Required auditor
    pricing:
      web:
        denom: uakt
        amount: 150          # May cost more for audited providers
```

---

## Testing and Validation

### Test Locally First

Validate your SDL before deploying:

**TypeScript:**
```typescript
import { SDL } from "@akashnetwork/chain-sdk";

const yamlContent = `... your SDL here ...`;

try {
  const sdl = SDL.fromString(yamlContent, "beta3", "mainnet");
  console.log("SDL is valid!");
} catch (error) {
  console.error("SDL validation failed:", error.message);
}
```

**Go:**
```go
import "pkg.akt.dev/go/sdl"

sdlDoc, err := sdl.ReadFile("deploy.yaml")
if err != nil {
    log.Fatalf("SDL validation failed: %v", err)
}

// Validate deployment groups
groups, err := sdlDoc.DeploymentGroups()
if err != nil {
    log.Fatalf("Invalid deployment groups: %v", err)
}
```

### Start with Sandbox

Test deployments on sandbox before mainnet:

```yaml
# Sandbox configuration
placement:
  test:
    pricing:
      web:
        denom: uakt
        amount: 10        # Sandbox tokens are free from faucet
```

**Sandbox Limitations:**
- Limited provider resources (smaller CPU/memory/storage available)
- Limited or no GPU availability
- Fewer providers overall

**If you receive no bids on sandbox** (especially for GPU or high-resource deployments), deploy directly to **mainnet** where more providers and resources are available.

### Use Version Control

Track SDL changes with git:

```bash
git init
git add deploy.yaml
git commit -m "Initial SDL configuration"
```

---

## Documentation and Maintenance

### Comment Your SDL

Add comments to explain complex configurations:

```yaml
services:
  web:
    image: nginx:1.25.3        # Pinned version for stability
    expose:
      - port: 80
        http_options:
          max_body_size: 10485760    # 10MB - prevents large upload attacks
```

### Pin Image Versions

Use specific image tags instead of `latest`:

```yaml
# ❌ Bad: Unpredictable updates
image: nginx:latest

# ✅ Good: Predictable, reproducible
image: nginx:1.25.3

# ✅ Also good: Digest for immutability
image: nginx@sha256:abc123...
```

### Keep SDL Files Organized

Structure for multi-environment deployments:

```
deployments/
├── base.yaml           # Common configuration
├── dev.yaml            # Development overrides
├── staging.yaml        # Staging configuration
└── production.yaml     # Production configuration
```

---

## Common Pitfalls to Avoid

### ❌ Don't Use Excessive Resources

```yaml
# Wastes money and reduces available providers
cpu:
  units: 32.0
memory:
  size: 128Gi
```

### ❌ Don't Expose Databases Publicly

```yaml
# Security risk!
services:
  database:
    expose:
      - port: 5432
        to:
          - global: true      # ❌ Never do this
```

### ❌ Don't Use Ephemeral Storage for Databases

```yaml
# Data loss on restart!
storage:
  - size: 10Gi              # ❌ Not persistent
```

### ❌ Don't Forget to Set Pricing

```yaml
# Will fail to deploy without pricing
placement:
  akash:
    # ❌ Missing pricing section
```

---

## Checklist for Production Deployments

Before deploying to production, verify:

- Resources are right-sized (not over-provisioned)
- Pricing is competitive and reasonable
- Image versions are pinned (not `latest`)
- Sensitive data uses credentials, not hardcoded values
- Databases use persistent storage with appropriate size
- Only necessary ports are exposed publicly
- HTTP options are configured for reliability
- Service dependencies are properly defined
- Provider attributes target appropriate infrastructure
- SDL is tested on sandbox first (or mainnet for GPU/high-resource workloads)
- Configuration is documented with comments
- Backup strategy is in place for persistent data

---

## Related Resources

- **[SDL Syntax Reference](/docs/developers/deployment/akash-sdl/syntax-reference)** - Complete syntax documentation
- **[Advanced Features](/docs/developers/deployment/akash-sdl/advanced-features)** - Advanced SDL capabilities
- **[Examples Library](/docs/developers/deployment/akash-sdl/examples-library)** - Real-world examples
- **[Akash Console](https://console.akash.network)** - Deploy with a GUI
- **[Cloudmos](https://cloudmos.io)** - Alternative deployment interface
