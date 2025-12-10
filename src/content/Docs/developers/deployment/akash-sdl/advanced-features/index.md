---
categories: ["Developers", "Deployment", "Akash SDL"]
tags: ["SDL", "Advanced", "Features"]
title: "SDL Advanced Features"
linkTitle: "Advanced Features"
description: "Advanced SDL features and capabilities"
weight: 4
---

**Unlock the full power of Akash SDL with advanced features.**

This guide covers advanced SDL capabilities for complex deployments.

---

## Persistent Storage

### Basic Persistent Storage

Persistent storage survives container restarts and redeployments:

```yaml
profiles:
  compute:
    database:
      resources:
        storage:
          - size: 1Gi                    # Ephemeral storage
          - name: db-data
            size: 10Gi
            attributes:
              persistent: true           # Survives restarts
              class: beta3               # Storage class
```

### Storage Classes

Different storage classes offer different performance characteristics:

```yaml
storage:
  - name: persistent-data
    size: 5Gi
    attributes:
      persistent: true
      class: beta3              # Standard persistent storage

  - name: shm
    size: 512Mi
    attributes:
      persistent: false
      class: ram                # Shared memory (/dev/shm)
```

**Available storage classes:**
- `beta3` - Standard persistent storage (SSD-backed)
- `ram` - Shared memory only (`/dev/shm`), for applications requiring shared memory
- Provider-specific classes (check provider documentation)

### Mounting Persistent Storage

Map storage volumes to container paths:

```yaml
services:
  database:
    image: postgres:15
    params:
      storage:
        db-data:
          mount: /var/lib/postgresql/data
          readOnly: false
        
        db-backups:
          mount: /backups
          readOnly: false
```

### Multi-Volume Example

Complex applications with multiple storage needs:

```yaml
services:
  wordpress:
    image: wordpress
    params:
      storage:
        wp-content:
          mount: /var/www/html/wp-content
          readOnly: false
        wp-uploads:
          mount: /var/www/html/wp-content/uploads
          readOnly: false

profiles:
  compute:
    wordpress:
      resources:
        storage:
          - size: 512Mi                  # Ephemeral: temp files
          - name: wp-content
            size: 5Gi
            attributes:
              persistent: true
              class: beta3
          - name: wp-uploads
            size: 20Gi
            attributes:
              persistent: true
              class: beta3
```

---

## GPU Configuration

### Basic GPU Allocation

Request GPU resources for AI/ML workloads:

```yaml
profiles:
  compute:
    ml-worker:
      resources:
        cpu:
          units: 4.0
        memory:
          size: 16Gi
        gpu:
          units: 1
          attributes:
            vendor:
              nvidia:
                - model: rtx4090
        storage:
          - size: 50Gi
```

### GPU Model Selection

Specify exact GPU models for optimal performance:

```yaml
# Single specific model
gpu:
  units: 1
  attributes:
    vendor:
      nvidia:
        - model: a100

# Multiple acceptable models (provider chooses)
gpu:
  units: 1
  attributes:
    vendor:
      nvidia:
        - model: a100
        - model: a6000
        - model: rtx4090
```

### GPU with VRAM Requirements

Specify minimum VRAM for memory-intensive workloads:

```yaml
gpu:
  units: 1
  attributes:
    vendor:
      nvidia:
        - model: a100
          ram: 40GB           # Minimum 40GB VRAM
```

### GPU Interface Type

Specify PCIe or SXM interface:

```yaml
gpu:
  units: 1
  attributes:
    vendor:
      nvidia:
        - model: a100
          ram: 80GB
          interface: sxm      # SXM interface (faster interconnect)
```

**Supported interfaces:**
- `pcie` - PCIe interface (standard)
- `sxm` - SXM interface (NVIDIA only, higher bandwidth)

### Multi-GPU Configuration

Request multiple GPUs for distributed training:

```yaml
gpu:
  units: 4                    # 4 GPUs
  attributes:
    vendor:
      nvidia:
        - model: a100
          ram: 80GB
          interface: sxm
```

---

## IP Endpoints (Dedicated IPs)

### Basic IP Endpoint

Get a dedicated IP address for your service:

```yaml
services:
  web:
    image: nginx:1.25.3
    expose:
      - port: 80
        to:
          - global: true
            ip: "myendpoint"      # Reference to endpoint

endpoints:
  myendpoint:
    kind: "ip"                    # Dedicated IP
```

### Multiple IP Endpoints

Different services on different IPs:

```yaml
services:
  web:
    image: nginx:1.25.3
    expose:
      - port: 80
        to:
          - global: true
            ip: "web-ip"
  
  api:
    image: api-server
    expose:
      - port: 443
        to:
          - global: true
            ip: "api-ip"

endpoints:
  web-ip:
    kind: "ip"
  api-ip:
    kind: "ip"
```

### Shared IP Endpoint

Multiple ports on the same IP:

```yaml
services:
  web:
    image: nginx:1.25.3
    expose:
      - port: 80
        to:
          - global: true
            ip: "shared"
      - port: 443
        to:
          - global: true
            ip: "shared"

endpoints:
  shared:
    kind: "ip"
```

**Use cases for IP endpoints:**
- Custom DNS configuration
- IP whitelisting requirements
- Multiple services needing separate IPs
- Applications requiring static IPs

---

## HTTP Options

### Advanced HTTP Configuration

Fine-tune HTTP behavior for production workloads:

```yaml
services:
  web:
    image: nginx:1.25.3
    expose:
      - port: 80
        to:
          - global: true
        http_options:
          max_body_size: 104857600      # 100MB max request size
          read_timeout: 60000            # 60 second read timeout
          send_timeout: 60000            # 60 second send timeout
          next_tries: 3                  # Retry failed requests 3 times
          next_timeout: 10000            # 10 second timeout between retries
          next_cases:                    # Retry on these conditions
            - error                      # Network errors
            - timeout                    # Timeouts
            - 500                        # Internal server error
            - 502                        # Bad gateway
            - 503                        # Service unavailable
            - 504                        # Gateway timeout
```

### HTTP Options Explained

**max_body_size** (bytes)
- Maximum size of request body
- Default: 1MB
- Use for file uploads, large POST requests

**read_timeout** (milliseconds)
- Timeout for reading request from client
- Default: 60000 (60 seconds)

**send_timeout** (milliseconds)
- Timeout for sending response to client
- Default: 60000 (60 seconds)

**next_tries** (number)
- Number of retry attempts for failed requests
- Default: 0 (no retries)
- Useful for handling transient failures

**next_timeout** (milliseconds)
- Timeout between retry attempts
- Default: 0

**next_cases** (array of strings)
- Conditions that trigger a retry
- Options: `error`, `timeout`, `http_500`, `http_502`, `http_503`, `http_504`

### Example: Large File Upload Service

```yaml
expose:
  - port: 80
    to:
      - global: true
    http_options:
      max_body_size: 1073741824       # 1GB for large file uploads
      read_timeout: 300000             # 5 minutes
      send_timeout: 300000             # 5 minutes
```

### Example: High-Availability API

```yaml
expose:
  - port: 80
    to:
      - global: true
    http_options:
      next_tries: 5                    # Aggressive retry
      next_timeout: 2000               # 2 second between retries
      next_cases:
        - error
        - timeout
        - 502
        - 503
```

---

## Private Container Registries

### Basic Authentication

Pull images from private registries:

```yaml
services:
  web:
    image: registry.example.com/private/app:v1.2.3
    credentials:
      host: https://registry.example.com
      username: myuser
      password: mypassword
```

### Docker Hub Private Images

```yaml
services:
  web:
    image: mycompany/private-app:latest
    credentials:
      host: https://index.docker.io/v1/
      username: dockerhub-user
      password: dockerhub-token
```

### GitHub Container Registry

```yaml
services:
  web:
    image: ghcr.io/myorg/private-app:latest
    credentials:
      host: https://ghcr.io
      username: github-username
      password: github-pat-token
```

### Multiple Services with Different Registries

```yaml
services:
  frontend:
    image: registry1.example.com/frontend:latest
    credentials:
      host: https://registry1.example.com
      username: user1
      password: pass1
  
  backend:
    image: registry2.example.com/backend:latest
    credentials:
      host: https://registry2.example.com
      username: user2
      password: pass2
```

---

## Service-to-Service Communication

### Internal Service Exposure

Services can communicate without public exposure:

```yaml
services:
  frontend:
    image: nginx:1.25.3
    env:
      - BACKEND_URL=http://backend:3000    # Use service name as hostname
    expose:
      - port: 80
        to:
          - global: true                    # Public
  
  backend:
    image: api-server
    expose:
      - port: 3000
        to:
          - service: frontend               # Only accessible to frontend
```

### Multi-Service Internal Network

Complex microservices architecture:

```yaml
services:
  api-gateway:
    image: nginx:1.25.3
    expose:
      - port: 80
        to:
          - global: true
  
  auth-service:
    image: auth-api
    expose:
      - port: 8080
        to:
          - service: api-gateway
  
  user-service:
    image: user-api
    expose:
      - port: 8081
        to:
          - service: api-gateway
  
  database:
    image: postgres
    expose:
      - port: 5432
        to:
          - service: auth-service
          - service: user-service
```

**Service discovery:**
- Services can reach each other using service names as hostnames
- Example: `http://auth-service:8080`, `postgres://database:5432`
- No public exposure = better security for internal services

---

## Provider Selection

### Geographic Targeting

Target specific regions:

```yaml
placement:
  us-west:
    attributes:
      region: us-west
    pricing:
      web:
        denom: uakt
        amount: 100
  
  eu-central:
    attributes:
      region: eu-central
    pricing:
      web:
        denom: uakt
        amount: 120
```

### Provider Auditing (Signed Providers)

Require audited providers for production:

```yaml
placement:
  production:
    attributes:
      tier: premium
    signedBy:
      anyOf:
        - akash1365yvmc4s7awdyj3n2sav7xfx76adc6dnmlx63    # Auditor 1
        - akash1...                                        # Auditor 2
      allOf:
        - akash1...                                        # Required auditor
    pricing:
      web:
        denom: uakt
        amount: 150
```

**signedBy options:**
- `anyOf` - Provider must be signed by at least one of these auditors
- `allOf` - Provider must be signed by all of these auditors

### Custom Provider Attributes

Target providers with specific capabilities:

```yaml
placement:
  high-performance:
    attributes:
      region: us-west
      tier: premium
      datacenter: equinix
      network: 10gbit
      ssd: true
    pricing:
      web:
        denom: uakt
        amount: 200
```

---

## Protocol Support

### TCP and UDP

Specify protocol for non-HTTP services:

```yaml
services:
  dns-server:
    image: bind9
    expose:
      - port: 53
        proto: udp              # UDP protocol
        to:
          - global: true
  
  game-server:
    image: minecraft
    expose:
      - port: 25565
        proto: tcp              # TCP protocol (default)
        to:
          - global: true
```

**Supported protocols:**
- `tcp` (default)
- `udp`

**Note:** Port 80 defaults to HTTP/HTTPS protocols and is automatically configured for web traffic.

---

## Domain Accept Lists

### Restrict Access by Domain

Only allow specific domains to access your service:

```yaml
services:
  web:
    image: nginx:1.25.3
    expose:
      - port: 80
        accept:
          - example.com
          - www.example.com
          - api.example.com
        to:
          - global: true
```

**Use cases:**
- Custom domain hosting
- Multi-tenant applications
- Domain-based routing

---

## Environment Variables

### Basic Environment Variables

Pass configuration to containers:

```yaml
services:
  web:
    image: node-app
    env:
      - NODE_ENV=production
      - PORT=3000
      - LOG_LEVEL=info
```

### Database Connection Strings

```yaml
services:
  backend:
    image: api-server
    env:
      - DATABASE_URL=postgres://user:pass@database:5432/myapp
      - REDIS_URL=redis://cache:6379
      - API_KEY=your-api-key
```

### Service Discovery via Environment

```yaml
services:
  frontend:
    image: react-app
    env:
      - REACT_APP_API_URL=http://backend:3000
      - REACT_APP_WS_URL=ws://websocket:8080
```

---

## Command and Args Override

### Override Container Command

Replace the default container command:

```yaml
services:
  web:
    image: nginx:1.25.3
    command:
      - /bin/sh
      - -c
    args:
      - |
        echo "Custom startup script"
        nginx -g 'daemon off;'
```

### Run Custom Scripts

```yaml
services:
  worker:
    image: python:3.11
    command:
      - python
    args:
      - -m
      - myapp.worker
      - --config
      - /config/worker.yaml
```

---

## Complete Advanced Example

Putting it all together - a production-ready multi-service deployment:

```yaml
version: "2.0"

services:
  frontend:
    image: registry.example.com/frontend:v2.1.0
    credentials:
      host: https://registry.example.com
      username: deploy-user
      password: deploy-token
    env:
      - API_URL=http://backend:3000
      - NODE_ENV=production
    expose:
      - port: 80
        accept:
          - example.com
          - www.example.com
        to:
          - global: true
            ip: "web-ip"
        http_options:
          max_body_size: 10485760
          read_timeout: 30000
          send_timeout: 30000
          next_tries: 3
          next_timeout: 5000
          next_cases:
            - error
            - timeout
            - 502
            - 503
  
  backend:
    image: registry.example.com/backend:v2.1.0
    credentials:
      host: https://registry.example.com
      username: deploy-user
      password: deploy-token
    env:
      - DATABASE_URL=postgres://app:password@database:5432/myapp
      - REDIS_URL=redis://cache:6379
      - NODE_ENV=production
    expose:
      - port: 3000
        to:
          - service: frontend
  
  database:
    image: postgres:15
    env:
      - POSTGRES_DB=myapp
      - POSTGRES_USER=app
      - POSTGRES_PASSWORD=password
    expose:
      - port: 5432
        to:
          - service: backend
    params:
      storage:
        db-data:
          mount: /var/lib/postgresql/data
          readOnly: false
  
  cache:
    image: redis:7-alpine
    expose:
      - port: 6379
        to:
          - service: backend

profiles:
  compute:
    frontend:
      resources:
        cpu:
          units: 1.0
        memory:
          size: 1Gi
        storage:
          - size: 512Mi
    
    backend:
      resources:
        cpu:
          units: 2.0
        memory:
          size: 2Gi
        storage:
          - size: 1Gi
    
    database:
      resources:
        cpu:
          units: 2.0
        memory:
          size: 4Gi
        storage:
          - size: 1Gi
          - name: db-data
            size: 20Gi
            attributes:
              persistent: true
              class: beta3
    
    cache:
      resources:
        cpu:
          units: 0.5
        memory:
          size: 512Mi
        storage:
          - size: 256Mi
  
  placement:
    production:
      attributes:
        region: us-west
        tier: premium
      signedBy:
        anyOf:
          - akash1365yvmc4s7awdyj3n2sav7xfx76adc6dnmlx63
      pricing:
        frontend:
          denom: uakt
          amount: 150
        backend:
          denom: uakt
          amount: 200
        database:
          denom: uakt
          amount: 250
        cache:
          denom: uakt
          amount: 100

deployment:
  frontend:
    production:
      profile: frontend
      count: 2
  backend:
    production:
      profile: backend
      count: 3
  database:
    production:
      profile: database
      count: 1
  cache:
    production:
      profile: cache
      count: 1

endpoints:
  web-ip:
    kind: "ip"
```

---

## Related Resources

- **[SDL Syntax Reference](/docs/developers/deployment/akash-sdl/syntax-reference)** - Complete syntax documentation
- **[Best Practices](/docs/developers/deployment/akash-sdl/best-practices)** - Optimization and security tips
- **[Examples Library](/docs/developers/deployment/akash-sdl/examples-library)** - Real-world examples
- **[Akash SDK](/docs/api-documentation/sdk)** - Programmatic deployment
