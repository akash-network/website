---
title: "Akash Network SDL Guide"
description: "A beginner explainer on how to navigate an SDL file for deployment on Akash."
pubDate: "2026-4-4"
draft: false
categories:
  - Guides
tags:
  - Guides
contributors:
  - Rodri
link: ""
bannerImage: ./project-banner.png
---
# Akash SDL: The Practical Guide

**What You Actually Need to Know to Deploy Anything**

## The Honest Truth About SDLs

There is no magic template that works for everything. Every app is different. But here's what you need to know: about 70% of an SDL is copy-paste boilerplate, and 30% is what you actually need to think about for your specific app.

**This guide will show you:**

- Which parts are basically copy-paste
- Which parts you MUST customize for each app
- How to figure out what values to use
- Real examples from actual deployments

> **REALITY CHECK**
>
> You can't learn SDLs from one guide. You need to: (1) Understand what your app actually needs (ports, storage, environment variables), (2) Try it, (3) Break it, (4) Fix it. This guide gives you the foundation, but experience is the only real teacher.

## The SDL Structure: Quick Overview

An SDL has three main sections:

1. **services:** WHAT you want to run (your Docker image, ports, storage)
2. **profiles:** HOW MUCH resources you need (CPU, RAM, storage size)
3. **deployment:** WHERE it runs (which providers, how many replicas)

## Complete SDL Example (Annotated)

Here's a real SDL for a web service. Pay attention to the comments showing what's template vs custom.

```yaml
version: "2.0"

services:
  web:
    # CUSTOMIZE: Your Docker image
    image: nginx:latest

    # CUSTOMIZE: What ports your app needs
    expose:
      - port: 80
        as: 80
        to:
          - global: true

    # OPTIONAL: Environment variables your app needs
    env:
      - "DATABASE_URL=postgresql://..."
      - "API_KEY=your_key_here"

profiles:
  compute:
    web:
      resources:
        cpu:
          # CUSTOMIZE: Based on your app's needs
          units: 0.5
        memory:
          # CUSTOMIZE: Based on your app's needs
          size: 512Mi
        storage:
          # CUSTOMIZE: Based on your app's needs
          size: 1Gi

  placement:
    akash:
      # TEMPLATE: Usually keep this for production
      attributes:
        host: akash
      # OPTIONAL: Lock to trusted providers
      signedBy:
        anyOf:
          - "akash1365yvmc4s7awdyj3n2sav7xfx76adc6dnmlx63"
      # TEMPLATE: Standard pricing
      pricing:
        web:
          denom: uact
          amount: 1000

deployment:
  web:
    akash:
      profile: web
      # CUSTOMIZE: How many instances you want
      count: 1
```

## Section 1: Services (WHAT You're Running)

**This is where you define WHAT you want to deploy.**

### Image (ALWAYS CUSTOMIZE)

```yaml
services:
  web:
    image: your-docker-image:tag
```

**What it is:** The Docker image you want to run. This is from Docker Hub or any container registry.

**Real examples:**

- `nginx:latest` (web server)
- `postgres:14` (database)
- `ghcr.io/your-org/whisper-api:v1` (custom app)

**How to find it:** Look at the app's documentation. Every containerized app tells you what image to use.

### Expose (CUSTOMIZE EVERY TIME)

```yaml
expose:
  - port: 80    # Internal container port
    as: 80      # External port (usually same)
    to:
      - global: true  # Make it accessible from internet
```

**What it is:** Which ports your app listens on and how to expose them to the internet.

**The key question:** What port does your app listen on?

**Common patterns:**

- Web apps: Usually port 80 or 8080
- Databases: Postgres 5432, MySQL 3306, Redis 6379
- APIs: Often 3000, 5000, 8000, or 8080

**global: true vs false:**

- **true:** Anyone on the internet can access it (web apps, APIs)
- **false:** Only other services in your deployment can access it (internal databases)

> **HOW TO FIND THE PORT**
>
> Check the Docker image documentation or Dockerfile. Look for EXPOSE statements or environment variables like PORT. If it's your own app, you already know what port it listens on.

### Environment Variables (DEPENDS ON APP)

```yaml
env:
  - "DATABASE_URL=postgresql://db:5432/mydb"
  - "API_KEY=secret123"
  - "NODE_ENV=production"
```

**What it is:** Configuration your app needs to run. Every app is different.

**Common examples:**

- Database connection strings
- API keys and secrets
- Feature flags (ENABLE_LOGGING=true)
- Environment (production, development)

**How to find what you need:** Read the app's documentation. Look for 'Configuration' or 'Environment Variables' sections.

## Section 2: Profiles (HOW MUCH Resources)

**This defines the compute resources your app needs.**

### CPU (CUSTOMIZE BASED ON APP)

```yaml
cpu:
  units: 0.5  # 0.5 CPU cores
```

**What it is:** How much CPU power your app gets. Measured in cores.

**Starting points:**

- **0.5 cores:** Small web apps, static sites, light APIs
- **1 core:** Standard web apps, small databases
- **2+ cores:** Heavy processing, ML models, video encoding

**Pro tip:** Start small (0.5), deploy, monitor, then increase if needed. You'll waste money starting too big.

### Memory (CUSTOMIZE BASED ON APP)

```yaml
memory:
  size: 512Mi  # 512 megabytes
```

**What it is:** How much RAM your app gets.

**Common sizes:**

- **256Mi-512Mi:** Tiny apps, static sites
- **1Gi-2Gi:** Most web apps and APIs
- **4Gi+:** Databases, caching, ML models

**Units:** Mi = Mebibytes, Gi = Gibibytes (basically MB and GB)

### Storage (CUSTOMIZE BASED ON APP)

```yaml
storage:
  size: 1Gi  # 1 gigabyte disk space
```

**What it is:** Persistent disk space for your app. This is for data that needs to survive restarts.

**When you need it:**

- Databases (need to store data)
- File uploads
- Logs you want to keep
- Any data that can't be regenerated

**When you DON'T need it:** Stateless apps (pure APIs, static sites that don't write data)

### Pricing (MOSTLY TEMPLATE)

```yaml
pricing:
  web:
    denom: uact
    amount: 1000
```

**What it is:** Maximum price you'll pay per block.

**The truth:** Just use `amount: 1000`. The market will bid lower. This is basically template code.

## Section 3: Deployment (WHERE It Runs)

**This section is mostly template. The main thing you customize is the count.**

### Count (CUSTOMIZE)

```yaml
deployment:
  web:
    akash:
      profile: web
      count: 1  # Number of replicas
```

**What it is:** How many instances of your app to run.

- **count: 1** - Most common. One instance.
- **count: 2+** - High availability. Multiple copies for redundancy.

## Real-World Examples

### Example 1: Simple Web App

**Scenario:** You have a Next.js app that listens on port 3000.

```yaml
version: "2.0"

services:
  webapp:
    image: ghcr.io/yourorg/nextjs-app:latest
    expose:
      - port: 3000
        as: 3000
        to:
          - global: true
    env:
      - "NODE_ENV=production"
      - "DATABASE_URL=postgresql://..."

profiles:
  compute:
    webapp:
      resources:
        cpu:
          units: 1.0
        memory:
          size: 1Gi
        storage:
          size: 512Mi

  placement:
    akash:
      attributes:
        host: akash
      pricing:
        webapp:
          denom: uact
          amount: 1000

deployment:
  webapp:
    akash:
      profile: webapp
      count: 1
```

### Example 2: Database + API (Multi-Service)

**Scenario:** You need both a database and an API that talks to it.

```yaml
version: "2.0"

services:
  database:
    image: postgres:14
    expose:
      - port: 5432
        as: 5432
        to:
          - global: false  # Internal only
    env:
      - "POSTGRES_DB=mydb"
      - "POSTGRES_USER=admin"
      - "POSTGRES_PASSWORD=secure123"

  api:
    image: yourorg/api:latest
    expose:
      - port: 8080
        as: 8080
        to:
          - global: true  # Public
    env:
      - "DATABASE_URL=postgresql://admin:secure123@database:5432/mydb"

profiles:
  compute:
    database:
      resources:
        cpu:
          units: 1.0
        memory:
          size: 2Gi
        storage:
          size: 20Gi  # Need space for data

    api:
      resources:
        cpu:
          units: 0.5
        memory:
          size: 1Gi
        storage:
          size: 512Mi

  placement:
    akash:
      attributes:
        host: akash
      pricing:
        database:
          denom: uact
          amount: 1000
        api:
          denom: uact
          amount: 1000

deployment:
  database:
    akash:
      profile: database
      count: 1
  api:
    akash:
      profile: api
      count: 2  # Run 2 API instances for redundancy
```

## The Checklist: Creating ANY SDL

**Use this every time you create a new SDL:**

1. **What's the Docker image?** (Check Docker Hub or app docs)
2. **What port does it listen on?** (Check Dockerfile or app docs)
3. **Does it need environment variables?** (Database URLs, API keys, etc.)
4. **How much CPU does it need?** (Start with 0.5-1 core)
5. **How much RAM does it need?** (Start with 512Mi-1Gi)
6. **Does it need persistent storage?** (Databases yes, APIs usually no)
7. **How many instances?** (Usually 1 to start)

## What's Template vs What's Custom: Quick Reference

| **SDL Section** | **Template?** | **Notes** |
|---|---|---|
| version | **Template** | Always "2.0" |
| image | **Custom** | Your Docker image, ALWAYS different |
| expose > port | **Custom** | What port your app uses |
| expose > global | **Custom** | true for public, false for internal |
| env | **Depends** | Some apps need it, some don't |
| cpu > units | **Custom** | Based on workload, start with 0.5-1 |
| memory > size | **Custom** | Based on app, start with 512Mi-1Gi |
| storage > size | **Depends** | Only if you need persistent data |
| attributes | **Template** | Just use "host: akash" |
| signedBy | **Template** | Use Core Team address or remove |
| pricing | **Template** | Always denom: uact, amount: 1000 |
| count | **Custom** | How many instances, usually 1 |

## Common Mistakes to Avoid

- **Wrong port:** Your app won't be accessible. Check the Dockerfile or docs.
- **Too little memory:** App crashes with OOM errors. Start higher, then reduce.
- **Missing environment variables:** App starts but doesn't work. Read the app's config docs.
- **No storage for databases:** All data disappears on restart. Always add storage for DBs.
- **Exposing internal services globally:** Security risk. Use `global: false` for databases.

> **FINAL WORD**
>
> No guide will teach you everything. You learn by doing. Start with these examples, deploy, watch it fail, read the logs, fix it, repeat. That's how you actually learn SDLs. This guide gives you the foundation, but experience is the only real teacher.