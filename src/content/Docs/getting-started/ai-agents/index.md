---
categories: ["Getting Started"]
tags: ["AI Agents", "Claude Code", "Codex", "OpenCode", "Skill", "Deployment"]
title: "Akash for AI Agents"
linkTitle: "AI Agents"
weight: 6
description: "Install the Akash skill in your AI coding agent (Claude Code, Codex, OpenCode) and deploy to Akash from natural-language prompts."
---

**Install the Akash skill in your AI coding agent and deploy to Akash from natural-language prompts.**

The [Akash skill](https://github.com/akash-network/akash-skill) is an open-source skill bundle for AI coding agents such as Claude Code, Codex, and OpenCode. It teaches your agent how to write Akash SDL and deploy, inspect, and manage workloads on Akash Network — so you can ship to decentralized compute just by describing what you want.

Installing it adds three skills: `akash-network:akash` (deploying workloads), `akash-network:akash-provider` (running a provider), and `akash-network:akash-node` (running a node or validator). This page focuses on the deployer skill.

---

## Prerequisites

Before you start, make sure you have:

- **A supported coding agent** — Claude Code, Codex, or OpenCode.
- **An Akash API key** (recommended) — create one in [Akash Console](/docs/api-documentation/console-api/getting-started). The skill uses it to deploy through the Console API with a managed wallet. You can instead use a funded self-custody wallet if you deploy through the CLI or an SDK.
- **A container image** for the workload you want to deploy, with an explicit version tag.

---

## Set Up the Skill

Install the skill once, then your agent can deploy to Akash on demand.

### Claude Code (recommended)

Add the marketplace and install the plugin from inside a Claude Code session:

```
/plugin marketplace add akash-network/akash-skill
/plugin install akash-network@akash-network
```

To pin a specific release, add a version tag:

```
/plugin marketplace add akash-network/akash-skill@v3.2.0
```

Update later with:

```
/plugin marketplace update akash-network
```

**Note:** To try the skill in a single session without installing it, clone the repository and launch Claude Code with it as a local plugin:

```bash
git clone https://github.com/akash-network/akash-skill
cd akash-skill
claude --plugin-dir "$(pwd)"
```

### Codex

Codex discovers the skills from the repository's `.codex-plugin/plugin.json` manifest and loads them from `skills/`. Add the akash-skill repository as a local or marketplace Codex plugin, and the Akash skills become available.

### OpenCode & Other Agents

Link the skills into your agent's global skills directory:

```bash
mkdir -p ~/.agents/skills
ln -s /path/to/akash-skill/skills/akash ~/.agents/skills/akash
ln -s /path/to/akash-skill/skills/akash-provider ~/.agents/skills/akash-provider
ln -s /path/to/akash-skill/skills/akash-node ~/.agents/skills/akash-node
```

Replace `/path/to/akash-skill` with the location where you cloned the repository.

**Tip:** In Claude Code, run `/plugin` to confirm `akash-network` is installed. If the skill does not trigger automatically, restart your agent and mention Akash explicitly in your prompt.

---

## Deploy on Akash with the Skill

Once the skill is installed, you don't call it directly — just describe what you want to deploy. The skill auto-triggers on Akash-related prompts and walks through the whole flow: writing the SDL, choosing a deployment method, submitting the deployment, accepting a provider bid, and fetching logs.

For example, tell your agent:

> "Deploy a simple Node.js web app to Akash using my API key."

The skill writes a valid SDL for the app, deploys it through the Console API, waits for a provider bid, and returns the lease details and the public URL where your app is running.

### Example Prompts

- "Write an SDL for a Next.js app with 1 CPU and 1 GB of RAM and deploy it to Akash with my API key."
- "Deploy this SDL to Akash and show me the lease status."
- "Check the logs and events for my Akash deployment."
- "Call DeepSeek on Akash with the OpenAI SDK." (uses [AkashML](https://akashml.com) managed inference)

### Explicit Invocation

In Claude Code you can also invoke the deployer skill directly:

```
/akash-network:akash <task description>
```

### What the Skill Handles

- Writing and validating Akash SDL.
- Choosing a deployment method — Console API, CLI, or the TypeScript/Go SDK.
- Creating the deployment, accepting a bid, and sending the manifest.
- Fetching deployment logs and events through the provider proxy.
- Calling hosted open-source models with AkashML managed inference.

---

## Related Resources

- [Quick Start](/docs/getting-started/quick-start) - Deploy your first app on Akash
- [Core Concepts](/docs/getting-started/core-concepts) - How deployments, leases, and bids work
- [SDL Reference](/docs/developers/deployment/akash-sdl) - Deployment configuration syntax
- [Akash CLI](/docs/developers/deployment/cli) - Command-line deployment
- [Console API](/docs/api-documentation/console-api) - Managed-wallet HTTP API and API keys
- [Akash Skill on GitHub](https://github.com/akash-network/akash-skill) - Source, issues, and releases

---

**Questions?** Join [Discord](https://discord.akash.network) #developers channel!
