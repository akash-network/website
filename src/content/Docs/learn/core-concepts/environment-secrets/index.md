---
categories: ["Learn", "Core Concepts"]
tags: ["Environment Variables", "Secrets", "Configuration", "Security"]
weight: 7
title: "Environment Variables & Secrets"
linkTitle: "Environment & Secrets"
description: "Managing configuration and sensitive data in Akash deployments"
---

**Securely configure your applications on Akash Network.**

Environment variables are the primary way to configure applications on Akash. This guide covers how to use environment variables effectively and manage sensitive data securely.

---

## What are Environment Variables?

**Environment variables** are key-value pairs passed to your containers at runtime. They're used to:
- Configure application behavior
- Store API keys and credentials
- Set feature flags
- Specify connection strings
- Control logging levels
- Define runtime parameters

**Example:**
```
NODE_ENV=production
DATABASE_URL=postgres://user:pass@db:5432/myapp
API_KEY=sk_live_abc123...
```

---

## Basic Configuration

### SDL Syntax

```yaml
version: "2.0"

services:
  web:
    image: myapp:latest
    env:
      - NODE_ENV=production
      - PORT=8080
      - LOG_LEVEL=info
    expose:
      - port: 8080
        as: 80
        to:
          - global: true

profiles:
  compute:
    web:
      resources:
        cpu:
          units: 1.0
        memory:
          size: 1Gi
        storage:
          size: 512Mi

  placement:
    akash:
      pricing:
        web:
          denom: uakt
          amount: 10000

deployment:
  web:
    akash:
      profile: web
      count: 1
```

### Multiple Environment Variables

```yaml
services:
  app:
    env:
      # Application config
      - NODE_ENV=production
      - APP_NAME=MyApp
      - APP_VERSION=1.0.0
      
      # Server config
      - HOST=0.0.0.0
      - PORT=8080
      
      # Feature flags
      - ENABLE_ANALYTICS=true
      - ENABLE_CACHING=true
      
      # External services
      - REDIS_URL=redis://redis:6379
      - DATABASE_URL=postgres://db:5432/myapp
```

---

## Common Environment Variable Patterns

### Application Framework Config

**Node.js/Express:**
```yaml
env:
  - NODE_ENV=production
  - PORT=8080
  - NPM_CONFIG_LOGLEVEL=warn
```

**Python/Flask:**
```yaml
env:
  - FLASK_ENV=production
  - FLASK_APP=app.py
  - FLASK_RUN_PORT=5000
```

**Ruby/Rails:**
```yaml
env:
  - RAILS_ENV=production
  - RAILS_LOG_TO_STDOUT=true
  - SECRET_KEY_BASE=your_secret_key
```

**Go:**
```yaml
env:
  - GO_ENV=production
  - GIN_MODE=release
  - PORT=8080
```

### Database Connections

**PostgreSQL:**
```yaml
env:
  - DATABASE_URL=postgres://user:password@postgres:5432/dbname
  - PGHOST=postgres
  - PGPORT=5432
  - PGDATABASE=myapp
  - PGUSER=admin
  - PGPASSWORD=secure_password
```

**MongoDB:**
```yaml
env:
  - MONGO_URI=mongodb://mongo:27017/myapp
  - MONGO_HOST=mongo
  - MONGO_PORT=27017
  - MONGO_DATABASE=myapp
```

**Redis:**
```yaml
env:
  - REDIS_URL=redis://redis:6379
  - REDIS_HOST=redis
  - REDIS_PORT=6379
  - REDIS_DB=0
```

### External Service APIs

```yaml
env:
  # AWS
  - AWS_REGION=us-east-1
  - AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
  - AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
  
  # Stripe
  - STRIPE_API_KEY=sk_live_abc123...
  - STRIPE_WEBHOOK_SECRET=whsec_abc123...
  
  # SendGrid
  - SENDGRID_API_KEY=SG.abc123...
  
  # Sentry
  - SENTRY_DSN=https://abc123@o123.ingest.sentry.io/123
```

---

## Managing Secrets

### ⚠️ Security Warning

**Environment variables in SDL are NOT encrypted.** Anyone with access to your SDL file can read them.

### Where Secrets Appear

❌ **Visible in:**
- SDL file (plain text)
- Provider manifest (sent directly to provider)
- Container environment (inside running containers)

✅ **NOT on blockchain:**
- SDL and manifest are NOT stored on-chain
- Only deployment metadata (resources, pricing) stored on blockchain
- Environment variables never touch the blockchain

### Best Practices for Secrets

#### 1. Use Environment-Specific SDL Files

**Development SDL:**
```yaml
# deploy-dev.yml
env:
  - NODE_ENV=development
  - API_KEY=test_key_123  # Test key, safe to commit
```

**Production SDL:**
```yaml
# deploy-prod.yml (NEVER commit to git!)
env:
  - NODE_ENV=production
  - API_KEY=sk_live_real_key_abc123  # Real key, keep secret
```

**`.gitignore`:**
```
deploy-prod.yml
*.prod.yml
secrets.yml
```

#### 2. Use Placeholder Values

**Committed SDL:**
```yaml
env:
  - NODE_ENV=production
  - API_KEY=REPLACE_WITH_REAL_KEY
  - DATABASE_PASSWORD=REPLACE_WITH_REAL_PASSWORD
```

**Before deploying:** Replace placeholders with real values

#### 3. Use Secret Management Tools

**External secret stores:**
- AWS Secrets Manager
- HashiCorp Vault
- Google Secret Manager
- Azure Key Vault

**Application fetches secrets at runtime:**
```yaml
env:
  - SECRET_STORE_URL=https://vault.example.com
  - SECRET_STORE_TOKEN=vault_token_abc123
  # App fetches actual secrets from vault
```

#### 4. Rotate Secrets Regularly

**When to rotate:**
- Suspected compromise
- Employee departure
- Regular schedule (e.g., every 90 days)
- After closing deployment

**How to rotate:**
1. Generate new secrets in external service
2. Update SDL with new values
3. Update deployment or redeploy
4. Revoke old secrets
5. Verify application works with new secrets

---

## Multi-Service Communication

### Service-to-Service Environment Variables

Services in the same deployment can reference each other by service name:

```yaml
services:
  frontend:
    image: frontend:latest
    env:
      - BACKEND_URL=http://backend:8080
      - API_ENDPOINT=http://backend:8080/api
  
  backend:
    image: backend:latest
    env:
      - DATABASE_URL=postgres://database:5432/app
      - REDIS_URL=redis://cache:6379
    expose:
      - port: 8080
  
  database:
    image: postgres:15
    env:
      - POSTGRES_DB=app
      - POSTGRES_USER=admin
      - POSTGRES_PASSWORD=secure_pass
    expose:
      - port: 5432
  
  cache:
    image: redis:7-alpine
    expose:
      - port: 6379
```

**How it works:**
- Akash creates internal DNS
- Service name resolves to internal IP
- No external networking needed for inter-service communication

---

## Dynamic Configuration

### Referencing Other Services

**Pattern:**
```yaml
services:
  app:
    env:
      - SERVICE_A_URL=http://service-a:8080
      - SERVICE_B_URL=http://service-b:9000
  
  service-a:
    expose:
      - port: 8080
  
  service-b:
    expose:
      - port: 9000
```

### Using Exposed Ports

```yaml
services:
  app:
    env:
      - EXTERNAL_API=https://external-service.com
      - INTERNAL_DB=postgres://database:5432
      - LISTEN_PORT=8080
    expose:
      - port: 8080
        as: 80
        to:
          - global: true
```

---

## Configuration Files

### Alternative to Environment Variables

For complex configuration, use config files:

**1. Bake into Docker image:**
```dockerfile
COPY config.production.json /app/config.json
```

**2. Mount from volume (if using persistent storage):**
```yaml
services:
  app:
    image: myapp:latest
    env:
      - CONFIG_PATH=/data/config.json
    # Config stored in persistent volume
```

**3. Fetch at startup:**
```yaml
services:
  app:
    env:
      - CONFIG_URL=https://config.example.com/app-config.json
    # App downloads config on startup
```

---

## Twelve-Factor App Principles

### Store Config in Environment

✅ **DO:**
```yaml
env:
  - DATABASE_URL=postgres://...
  - API_KEY=sk_live_...
  - ENABLE_FEATURE_X=true
```

❌ **DON'T:**
```yaml
# Hardcoding in app code
database = Database.connect("postgres://hardcoded...")
```

### One Codebase, Many Deploys

Same image, different environment variables:

**Development:**
```yaml
env:
  - NODE_ENV=development
  - LOG_LEVEL=debug
  - API_URL=http://api.dev.example.com
```

**Production:**
```yaml
env:
  - NODE_ENV=production
  - LOG_LEVEL=warn
  - API_URL=https://api.example.com
```

---

## Common Patterns

### Feature Flags

```yaml
env:
  - ENABLE_NEW_UI=true
  - ENABLE_BETA_FEATURES=false
  - FEATURE_FLAG_API_V2=true
```

### Logging Configuration

```yaml
env:
  - LOG_LEVEL=info  # debug, info, warn, error
  - LOG_FORMAT=json  # json, pretty, simple
  - LOG_OUTPUT=stdout  # stdout, file
```

### Performance Tuning

```yaml
env:
  - WORKER_PROCESSES=4
  - MAX_CONNECTIONS=100
  - CACHE_TTL=3600
  - REQUEST_TIMEOUT=30
```

### Third-Party Integrations

```yaml
env:
  # Monitoring
  - DD_AGENT_HOST=datadog-agent
  - NEW_RELIC_LICENSE_KEY=abc123
  
  # Analytics
  - GOOGLE_ANALYTICS_ID=UA-123456-1
  - MIXPANEL_TOKEN=abc123
  
  # Error tracking
  - SENTRY_DSN=https://...
  - BUGSNAG_API_KEY=abc123
```

---

## Debugging Environment Variables

### Verify Environment in Container

**List all environment variables:**
```bash
# SSH/exec into container
env | sort

# Or check specific variable
echo $NODE_ENV
```

**In logs:**
```yaml
services:
  app:
    image: myapp:latest
    command: ["/bin/sh", "-c"]
    args:
      - |
        echo "Environment variables:"
        env | sort
        echo "Starting application..."
        npm start
```

### Common Issues

**Problem: Variable not set**
```
Error: DATABASE_URL is not defined
```

**Solution:** Add to SDL:
```yaml
env:
  - DATABASE_URL=postgres://...
```

**Problem: Variable with spaces**
```yaml
# ❌ WRONG - will break
env:
  - MESSAGE=Hello World

# ✅ CORRECT - quote the value
env:
  - MESSAGE="Hello World"
```

**Problem: Special characters**
```yaml
# ❌ WRONG - special chars may break
env:
  - PASSWORD=p@$$w0rd!

# ✅ CORRECT - escape or quote
env:
  - PASSWORD="p@$$w0rd!"
```

---

## Security Checklist

### Before Deployment

- [ ] Remove test/development secrets
- [ ] Replace placeholder values with real secrets
- [ ] Verify no secrets in git history
- [ ] Review all environment variables
- [ ] Use least-privilege API keys
- [ ] Enable API key restrictions where possible

### SDL File Management

- [ ] Add `*.prod.yml` to `.gitignore`
- [ ] Store production SDL securely (password manager, encrypted)
- [ ] Never commit secrets to git
- [ ] Don't share SDL files publicly
- [ ] Limit access to production SDL

### After Deployment

- [ ] Verify secrets work correctly
- [ ] Monitor for unauthorized access
- [ ] Set up secret rotation schedule
- [ ] Document where secrets are stored
- [ ] Have secret recovery plan

---

## Advanced Patterns

### Conditional Configuration

**Using init containers (requires custom image):**
```yaml
services:
  app:
    image: myapp:latest
    env:
      - ENV=production
    command: ["/bin/sh", "-c"]
    args:
      - |
        if [ "$ENV" = "production" ]; then
          export LOG_LEVEL=warn
        else
          export LOG_LEVEL=debug
        fi
        exec npm start
```

### Secrets from External Services

**Fetch from HashiCorp Vault:**
```yaml
services:
  app:
    env:
      - VAULT_ADDR=https://vault.example.com
      - VAULT_TOKEN=s.abc123...
      - SECRET_PATH=secret/data/myapp
    # App fetches secrets from Vault at startup
```

**Fetch from AWS Secrets Manager:**
```yaml
services:
  app:
    env:
      - AWS_REGION=us-east-1
      - AWS_ACCESS_KEY_ID=AKIA...
      - AWS_SECRET_ACCESS_KEY=...
      - SECRET_NAME=prod/myapp/database
    # App fetches from AWS on startup
```

---

## Example: Complete Secure Setup

Full application with proper secret management:

```yaml
version: "2.0"

services:
  frontend:
    image: ghcr.io/myorg/frontend:v1.0
    env:
      # Public config
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://api.example.com
      
      # Internal references
      - BACKEND_URL=http://backend:8080
    expose:
      - port: 3000
        as: 80
        to:
          - global: true
  
  backend:
    image: ghcr.io/myorg/backend:v1.0
    env:
      # App config
      - NODE_ENV=production
      - PORT=8080
      - LOG_LEVEL=info
      
      # Database (sensitive)
      - DATABASE_URL=postgres://admin:CHANGE_ME@database:5432/app
      
      # External APIs (sensitive)
      - STRIPE_SECRET_KEY=sk_live_CHANGE_ME
      - SENDGRID_API_KEY=SG.CHANGE_ME
      
      # JWT signing (sensitive)
      - JWT_SECRET=CHANGE_ME_LONG_RANDOM_STRING
      
      # Services
      - REDIS_URL=redis://cache:6379
    expose:
      - port: 8080
  
  database:
    image: postgres:15
    env:
      - POSTGRES_DB=app
      - POSTGRES_USER=admin
      - POSTGRES_PASSWORD=CHANGE_ME_SECURE_PASSWORD
      - PGDATA=/var/lib/postgresql/data/pgdata
    expose:
      - port: 5432
  
  cache:
    image: redis:7-alpine
    expose:
      - port: 6379

profiles:
  compute:
    frontend:
      resources:
        cpu:
          units: 1.0
        memory:
          size: 1Gi
        storage:
          size: 512Mi
    backend:
      resources:
        cpu:
          units: 2.0
        memory:
          size: 2Gi
        storage:
          size: 1Gi
    database:
      resources:
        cpu:
          units: 2.0
        memory:
          size: 4Gi
        storage:
          - size: 20Gi
            attributes:
              persistent: true
              class: beta2
    cache:
      resources:
        cpu:
          units: 0.5
        memory:
          size: 512Mi
        storage:
          size: 512Mi

  placement:
    akash:
      pricing:
        frontend:
          denom: uakt
          amount: 10000
        backend:
          denom: uakt
          amount: 15000
        database:
          denom: uakt
          amount: 20000
        cache:
          denom: uakt
          amount: 5000

deployment:
  frontend:
    akash:
      profile: frontend
      count: 1
  backend:
    akash:
      profile: backend
      count: 1
  database:
    akash:
      profile: database
      count: 1
  cache:
    akash:
      profile: cache
      count: 1
```

**Before deploying:**
1. Replace all `CHANGE_ME` values with real secrets
2. Save as `deploy-prod.yml` (not in git)
3. Verify all secrets are correct
4. Deploy

---

## Best Practices Summary

✅ **DO:**
- Use environment variables for all configuration
- Keep secrets out of git
- Use separate SDL files for dev/prod
- Rotate secrets regularly
- Document secret locations
- Use least-privilege API keys
- Fetch secrets from external stores when possible

❌ **DON'T:**
- Commit secrets to git
- Hardcode configuration in code
- Use the same secrets across environments
- Share production SDL files
- Leave secrets in git history
- Use root/admin credentials when not needed

---

## Related Topics

- [Private Container Registries](/docs/learn/core-concepts/private-containers) - Using credentials in SDL
- [Deployments & Lifecycle](/docs/learn/core-concepts/deployments) - Updating environment variables
- [SDL Syntax Reference](/docs/developers/deployment/akash-sdl/syntax-reference) - Environment variable syntax

---

**Questions about configuration?** Ask in [Discord](https://discord.akash.network) #deployments channel!

