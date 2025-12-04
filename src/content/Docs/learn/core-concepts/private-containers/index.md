---
categories: ["Learn", "Core Concepts"]
tags: ["Docker", "Private Registry", "Credentials"]
weight: 3
title: "Private Container Registries"
linkTitle: "Private Containers"
description: "Deploy from private Docker registries on Akash Network"
---

**Use private Docker images in your Akash deployments.**

Many applications use private container registries (Docker Hub private repos, GitHub Container Registry, AWS ECR, Google Container Registry, etc.). Akash supports deploying from private registries using credentials configured in your SDL.

---

## How It Works

When you specify `credentials` in your SDL, Akash providers use those credentials to pull your private container images, just like running `docker login` before `docker pull`.

**Supported registries:**
- Docker Hub (private repositories)
- GitHub Container Registry (ghcr.io)
- Google Container Registry (gcr.io)
- AWS Elastic Container Registry (ECR)
- Azure Container Registry
- GitLab Container Registry
- Any Docker-compatible private registry

---

## SDL Configuration

### Basic Syntax

```yaml
version: "2.0"

services:
  app:
    image: docker.io/mycompany/private-app:v1.0
    credentials:
      host: https://index.docker.io/v1/
      username: myusername
      password: mypassword
    expose:
      - port: 8080
        as: 80
        to:
          - global: true

profiles:
  compute:
    app:
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
        app:
          denom: uakt
          amount: 10000

deployment:
  app:
    akash:
      profile: app
      count: 1
```

---

## Registry-Specific Examples

### Docker Hub Private Repository

```yaml
services:
  app:
    image: myusername/my-private-repo:latest
    credentials:
      host: https://index.docker.io/v1/
      username: myusername
      password: dckr_pat_abc123...  # Use access token, not password
```

**Best practice:** Use a Docker Hub Personal Access Token instead of your password:
1. Go to [Docker Hub Settings → Security](https://hub.docker.com/settings/security)
2. Click "New Access Token"
3. Give it a name and select permissions (Read-only is sufficient)
4. Copy the token and use it as the `password` in your SDL

### GitHub Container Registry (ghcr.io)

```yaml
services:
  app:
    image: ghcr.io/myorg/my-app:v1.0
    credentials:
      host: https://ghcr.io
      username: myusername
      password: ghp_abc123...  # GitHub Personal Access Token
```

**Creating a GitHub PAT:**
1. Go to [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. Generate new token (classic)
3. Select `read:packages` scope
4. Copy the token and use it in your SDL

### Google Container Registry (gcr.io)

```yaml
services:
  app:
    image: gcr.io/my-project/my-app:latest
    credentials:
      host: https://gcr.io
      username: _json_key
      password: |
        {
          "type": "service_account",
          "project_id": "my-project",
          ...
        }
```

**Note:** For GCR, username must be `_json_key` and password is the entire JSON service account key.

### AWS Elastic Container Registry (ECR)

ECR requires temporary credentials that expire. Use AWS CLI to get credentials:

```bash
aws ecr get-login-password --region us-east-1
```

```yaml
services:
  app:
    image: 123456789012.dkr.ecr.us-east-1.amazonaws.com/my-repo:latest
    credentials:
      host: https://123456789012.dkr.ecr.us-east-1.amazonaws.com
      username: AWS
      password: eyJwYXlsb2FkIjoiQ...  # Token from aws ecr get-login-password
```

**Important:** ECR tokens expire after 12 hours. For long-running deployments, consider using a different registry or implementing a credential refresh mechanism.

---

## Security Best Practices

### 1. Use Access Tokens

**Never use your main account password.** Always create access tokens with minimal permissions:
- Docker Hub: Personal Access Tokens
- GitHub: Personal Access Tokens with `read:packages`
- GitLab: Deploy Tokens or Personal Access Tokens
- Cloud providers: Service account keys with read-only permissions

### 2. Rotate Credentials Regularly

- Regenerate access tokens periodically
- Update your SDL with new credentials
- Use deployment updates to refresh credentials without redeploying

### 3. Scope Permissions Minimally

Grant only the permissions needed:
- **Read-only access** to container registries
- Limit tokens to specific repositories if possible
- Use short-lived tokens when available

### 4. Protect Your SDL File

Your SDL contains sensitive credentials:
- **Never commit SDL files with credentials to git**
- Use environment variables or secret management tools
- Consider using `.gitignore` for SDL files
- Use separate SDL files for development vs production

### 5. Audit Access

- Monitor access logs in your container registry
- Review which tokens are being used
- Revoke unused or suspicious tokens immediately

---

## Multi-Service Deployments

Each service can have its own credentials:

```yaml
services:
  frontend:
    image: ghcr.io/myorg/frontend:latest
    credentials:
      host: https://ghcr.io
      username: myusername
      password: ghp_token1...
    
  backend:
    image: docker.io/mycompany/backend:v2
    credentials:
      host: https://index.docker.io/v1/
      username: company_user
      password: dckr_pat_token2...
    
  database:
    image: postgres:15  # Public image, no credentials needed
```

---

## Troubleshooting

### Error: "Failed to pull image"

**Possible causes:**
1. **Wrong credentials** - Double-check username/password
2. **Wrong host** - Verify the registry host URL
3. **Expired token** - Regenerate and update your credentials
4. **No permissions** - Ensure the token has read access to the repository
5. **Image doesn't exist** - Verify the image name and tag

**Solution:** Check provider logs for specific error messages.

### Error: "Unauthorized"

**Cause:** Invalid or expired credentials.

**Solution:**
1. Regenerate your access token
2. Update the SDL with new credentials
3. Update your deployment or create a new one

### Error: "Image not found"

**Cause:** Image name is incorrect or you don't have access.

**Solution:**
1. Verify the full image path: `registry.com/username/repository:tag`
2. Ensure the image exists in your private registry
3. Check that your credentials have access to this specific repository

---

## Alternative Approaches

### Build Images Before Deploying

If credential management is too complex:
1. Build your images locally
2. Push to a **public** registry (with non-sensitive code)
3. Deploy from the public registry without credentials

### Use Public Base Images

If possible, design your app to:
1. Use public base images
2. Mount configuration/secrets at runtime
3. Pull sensitive data from environment variables instead of baking into images

---

## Example: Complete Private Deployment

Here's a full example of a private Next.js app with Redis:

```yaml
version: "2.0"

services:
  web:
    image: ghcr.io/myorg/nextjs-app:prod
    credentials:
      host: https://ghcr.io
      username: myusername
      password: ghp_abc123...
    env:
      - REDIS_URL=redis://redis:6379
      - NODE_ENV=production
    expose:
      - port: 3000
        as: 80
        to:
          - global: true
        http_options:
          max_body_size: 10485760
  
  redis:
    image: redis:7-alpine  # Public image
    expose:
      - port: 6379

profiles:
  compute:
    web:
      resources:
        cpu:
          units: 1.0
        memory:
          size: 1Gi
        storage:
          size: 1Gi
    redis:
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
        web:
          denom: uakt
          amount: 10000
        redis:
          denom: uakt
          amount: 5000

deployment:
  web:
    akash:
      profile: web
      count: 1
  redis:
    akash:
      profile: redis
      count: 1
```

---

## Related Topics

- [SDL Syntax Reference](/docs/developers/deployment/akash-sdl/syntax-reference) - Complete SDL documentation
- [Environment Variables](/docs/developers/deployment/akash-sdl/syntax-reference#environment-variables) - Managing app configuration
- [Updates & Migrations](/docs/learn/core-concepts/updates-migrations) - Updating credentials without redeploying

---

**Need help?** Ask in [Discord](https://discord.akash.network) #deployments channel!

