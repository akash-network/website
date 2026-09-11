---
title: "How to Deploy Paperclip on Akash Network"
pubDate: "2026-09-02"
draft: false
categories:
  - Guides
tags:
  - Guides
  - Deployment
  - SDL
  - AI Agents
contributors:
  - aoritus
bannerImage: ./project-banner.png
---
# How to Deploy Paperclip on Akash: Self-Host Your AI Agent Teams

## What is Paperclip?

[Paperclip](https://github.com/paperclipai/paperclip) is an open-source platform for orchestrating AI agents. It provides shared memory, tool access, and workflow management in a single interface.

This guide covers deploying Paperclip on Akash Network — a decentralized cloud platform.

## Paperclip Capabilities

Paperclip provides an orchestration interface for AI agents with the following features:

- **Agent personas:** Define distinct roles with specific system prompts and behaviors
- **Tool assignment:** Grant agents access to web search, code execution, database queries, and custom functions
- **Workflow chains:** Configure agents to pass outputs to other agents in sequence or in parallel
- **Shared memory:** Agents access a common state store for context persistence across interactions

## Supported Use Cases

Paperclip supports multiple agent collaboration patterns:

| Pattern | Description | Example Workflow |
| :-- | :-- | :-- |
| **Autonomous Coding Teams** | Multi-agent software development | Product Manager agent writes spec → Developer agent writes code → QA agent reviews |
| **Research & Analysis Squads** | Web scraping and report synthesis | Agents scrape sources → synthesize findings → format reports for stakeholders |
| **Customer Support Swarms** | Tiered support with escalation | Tier-1 agents handle routine queries → escalate complex issues to Senior Support agent |
| **Content Pipelines** | Automated content production | Agents monitor news sources → draft articles → push to CMS for human review |

## Supported Agents

Paperclip orchestrates agents that process prompts or API calls:

| Agent / Tool | Primary Function | Best For (Target Persona) |
| :-- | :-- | :-- |
| **Claude Code** | General coding, architecture | CTO, Senior Developer |
| **Codex** | Code generation, refactoring | Backend Engineer |
| **Cursor** | IDE-based development | Frontend Developer |
| **Gemini CLI** | Multi-modal tasks | Content Creator |
| **Hermes** | Advanced reasoning | Strategy Consultant |
| **OpenCode** | Open-source CLI, multi-provider coding | Indie Developer, Open-source Contributor |
| **Pi** | Conversational AI, emotional intelligence | Customer Success, HR Specialist |
| **Grok Build** | Real-time agent building, X integration | Social Media Analyst, Trend Researcher |

## Cost Comparison

Check the [Usage Pricing Calculator](https://akash.network/pricing/usage-calculator/) to see the approximate difference.

| Provider | Est. Monthly Cost | Pros | Cons |
| :-- | :-- | :-- | :-- |
| **Akash Network** | $5.64 | Lowest cost, decentralized compute. | Requires SDL configuration. |
| **AWS** | $8.26 | Enterprise infrastructure, mature ecosystem. | Higher cost, complex networking. |
| **GCP** | $6.85 | Enterprise infrastructure, AI/ML integrations. | Higher cost, complex IAM. |
| **Azure** | $7.32 | Enterprise infrastructure, corporate integration. | Higher cost, complex management portal. |

## Deployment Steps

### Prerequisites

- [Akash Console Air](https://air.akash.network/) account with [pre-minted](https://air.akash.network/mint-burn) ACT tokens OR [Akash Console](https://console.akash.network/) if you want to buy credits without crypto.
- LLM API keys (OpenAI, Anthropic, or compatible provider). [AkashML](https://akashml.com/#models) works perfectly with Claude Code adapter.

### Step 1: Configure the SDL

The SDL defines compute, storage, and networking. Access the Paperclip template from [Akash Console](https://air.akash.network/templates/akash-network-awesome-akash-paperclip) or use this base configuration:
```
---
version: "2.0"
services:
  server:
    image: ghcr.io/paperclipai/paperclip:sha-6a4e2e1
    expose:
      - port: 3100
        as: 80
        to:
        - global: true
    env:
      - DATABASE_URL=postgresql://paperclip:paperclip@db:5432/paperclip
      - PORT=3100
      - SERVE_UI=true
      - PAPERCLIP_DEPLOYMENT_MODE=authenticated
      - PAPERCLIP_DEPLOYMENT_EXPOSURE=private
      - PAPERCLIP_PUBLIC_URL=http://provider.akash.com
      - BETTER_AUTH_SECRET=3e3d4cfd927be0b953e28879b76a811359f8cba18cc40f7f5ae48d6466203cb9
      - ANTHROPIC_BASE_URL=https://api.akashml.com/anthropic
      - ANTHROPIC_AUTH_TOKEN=akml-...
      - ANTHROPIC_MODEL=openai/gpt-oss-120b
      - API_TIMEOUT_MS=3000000
    params:
      storage:
        paperclip-data:
          mount: /var/lib/postgresql/data
          readOnly: false
  db:
    image: postgres:15-alpine
    expose:
      - port: 5432
        as: 5432
        to:
          - service: server
    env:
      - POSTGRES_USER=paperclip
      - POSTGRES_PASSWORD=paperclip
      - POSTGRES_DB=paperclip
      - PGDATA=/var/lib/postgresql/data/pgdata
    params:
      storage:
        pgdata:
          mount: /var/lib/postgresql/data
          readOnly: false
profiles:
  compute:
    server:
      resources:
        cpu:
          units: 1
        memory:
          size: 1gi
        storage:
          - size: 1Gi
          - name: paperclip-data
            size: 10Gi
            attributes:
              persistent: true
              class: beta3
    db:
      resources:
        cpu:
          units: 1
        memory:
          size: 512Mi
        storage:
          - size: 1Gi
          - name: pgdata
            size: 10Gi
            attributes:
              persistent: true
              class: beta3
  placement:
    dcloud:
      pricing:
        server:
          denom: uact
          amount: 100000
        db:
          denom: uact
          amount: 100000
deployment:
  server:
    dcloud:
      profile: server
      count: 1
  db:
    dcloud:
      profile: db
      count: 1
```

### Step 2: Set Environment Variables

Add the following variables via the Console UI:

- `DATABASE_URL` — Database connection URL.
- `PAPERCLIP_PUBLIC_URL` — Temporary placeholder. Will be replaced with actual URL after deployment. Without this, the UI is unavailable.
- `ANTHROPIC_BASE_URL` — Endpoint for Claude Code adapter. AkashML in this case.
- `ANTHROPIC_AUTH_TOKEN` — API key for accessing our endpoint.
- `ANTHROPIC_MODEL` — Model that will be used by default.

Read more about environment variables at [Paperclip Docs](https://docs.paperclip.ing/reference/deploy/environment-variables/) and [AkashML Docs](https://akashml.com/docs/guides/claude-code).

<p align="center">
<img width="1280" height="760" alt="img1" src="https://github.com/user-attachments/assets/af5a0f5e-a9aa-48c6-913d-54b326a7f529" />
</p>

### Step 3: Deploy

1. Click Create Deployment
2. Fund the lease to start deployment
3. Select provider bid from Akash marketplace

<p align="center">
<img width="1280" height="769" alt="img2" src="https://github.com/user-attachments/assets/f73f88b6-ea02-4658-be19-1b4043b3df37" />
</p>

### Step 4: Update Public URL

The application requires its public URL for webhook callbacks and external tool integration.

1. Navigate to active deployment in Console
2. Copy generated endpoint URL (format without IP port: `http://provider.akash.com`) from Leases tab

<p align="center">
<img width="1090" height="527" alt="img3" src="https://github.com/user-attachments/assets/1c2b903b-ebbd-433e-b317-6af3792af545" />
</p>

4. Update deployment, replace `PAPERCLIP_PUBLIC_URL` with copied URL
5. Click `Update Deployment` and wait for container restart

<p align="center">
<img width="1280" height="580" alt="img4" src="https://github.com/user-attachments/assets/943a3e12-0e53-44df-88b8-3b6b9c72099d" />
</p>

### Step 5: Access Interface

After deployment completes, access Paperclip via the endpoint URL. The dashboard provides:

- Agent team creation
- Tool and model assignment
- Real-time execution logs

The first time you open the application, you will be asked to register using email (without confirmation). Let’s choose Claude Code (endpoint is set to AkashML) and make our first agent’s heart beat.

<p align="center">
<img width="471" height="713" alt="img5" src="https://github.com/user-attachments/assets/d95c1bcd-fb24-405a-820f-f489ff5919c0" />
</p>

Set goals, plans, and tasks for agents and monitor their actions.

<p align="center">
<img width="1063" height="876" alt="img6" src="https://github.com/user-attachments/assets/50982f1d-5e2a-4d21-a635-a101b4f09ed8" />
</p>

The standard prompt creates a new engineer agent, by default it uses the Claude Code adapter.

If `ANTHROPIC_BASE_URL` and `ANTHROPIC_AUTH_TOKEN` environment variables are set, no agent configuration is required; by default, the Claude adapter will use our own provider (https://api.akashml.com/anthropic) and the `openai/gpt-oss-120b` model.

## Conclusion

Paperclip on Akash Network provides self-hosted AI agent orchestration with persistent storage, public endpoints, and cost efficiency. This way offers the lowest cost and maximum privacy.
