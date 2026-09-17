---
categories: ["Developers", "Deployment", "akt CLI"]
tags: ["akt", "CLI", "AI Agents", "Skill", "Automation"]
weight: 7
title: "akt CLI Agent Skill"
linkTitle: "Agent Skill"
description: "Download and install the akt CLI agent skill, including setup, deployment, and troubleshooting references"
---

The `akt-cli` skill teaches a coding agent to operate an installed `akt` binary: inspect contexts, write SDL, deploy workloads, check leases, and recover from failed operations. It includes the main instructions, three reference guides, and optional agent metadata.

## Get the Skill

[Download the complete akt-cli skill ZIP](/skills/akt-cli.zip), or read the files hosted on this website:

| File                                                                           | Contents                                                                                                        |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| [SKILL.md](/skills/akt-cli/SKILL.md)                                           | Main instructions: context selection, command discovery, structured output, deployment workflows, and recovery. |
| [references/setup.md](/skills/akt-cli/references/setup.md)                     | Installation, version checks, chain and Console contexts, credentials, and optional MCP setup.                  |
| [references/deployments.md](/skills/akt-cli/references/deployments.md)         | SDL preparation, previews, bid selection, deployment inspection, updates, and closure.                          |
| [references/troubleshooting.md](/skills/akt-cli/references/troubleshooting.md) | Diagnose setup, funding, bid, manifest, and provider failures; reconcile partial deployments before retrying.   |
| [agents/openai.yaml](/skills/akt-cli/agents/openai.yaml)                       | Optional display name, description, and default prompt for compatible agents.                                   |
| [LICENSE](/skills/akt-cli/LICENSE)                                             | The upstream Apache 2.0 license.                                                                                |

The ZIP contains an `akt-cli/` directory with all six files. Keep the folder intact so the relative links in `SKILL.md` and its references continue to work. A [SHA-256 checksum](/skills/akt-cli.zip.sha256) is available for the ZIP.

## Install the CLI

The skill needs `akt` on your agent's `PATH` and access to a shell. On macOS or Linux with Homebrew:

```bash
brew tap akash-network/tap
brew update
brew install akash-network/tap/akt
akt version --long
```

Homebrew installs the latest published CLI release available in the official tap. For an existing installation, run `brew update` followed by `brew upgrade akash-network/tap/akt`. Check [GitHub](https://github.com/akash-network/akt) for the most up-to-date code and [GitHub Releases](https://github.com/akash-network/akt/releases/latest) for published builds. See [Installation](/docs/developers/deployment/akt/installation) for other platforms and source builds.

Install the skill separately using the steps below. You can inspect contexts and validate SDL before configuring credentials; deploying also requires the appropriate Console account or funded local wallet.

## Install the Skill

### Codex: This Project

From your project root, download and extract the bundle into `.agents/skills/`:

```bash
curl -fL https://akash.network/skills/akt-cli.zip -o akt-cli.zip
mkdir -p .agents/skills
unzip -n akt-cli.zip -d .agents/skills
```

The resulting entry point is `.agents/skills/akt-cli/SKILL.md`.

### Codex: All Your Projects

To make the skill available across your projects, extract the downloaded ZIP into your user skills directory instead:

```bash
mkdir -p ~/.agents/skills
unzip -n akt-cli.zip -d ~/.agents/skills
```

Choose either the project or user location to avoid duplicate skill entries. These commands preserve existing files. To update an older copy, replace its entire `akt-cli/` folder with the new bundle so the main instructions and references stay together.

Codex detects newly installed skills automatically. If it does not appear, restart Codex. See [OpenAI's skill documentation](https://developers.openai.com/codex/skills) for discovery locations and invocation.

### Other Coding Agents

Extract the complete `akt-cli/` folder into your agent's supported skills directory, following that agent's installation instructions. The workflow guidance lives in `SKILL.md` and `references/`; `agents/openai.yaml` supplies optional interface metadata.

### From the akt Repository

The skill lives in `.agents/skills/akt-cli/` in the [akt repository](https://github.com/akash-network/akt/tree/ab8092931db2050c27bc7c499c1d0c89bdcc6d5c/.agents/skills/akt-cli). Copy that complete folder into your project's or agent's skills directory, or use the website ZIP above.

## Use the Skill

In Codex CLI or its IDE extension, mention `$akt-cli` explicitly, or let the agent select it when your request matches the skill. Start with a context inspection:

```text
Use $akt-cli to inspect my staging context and list its deployments.
```

For a deployment preview:

```text
Use $akt-cli to validate deploy.yaml and show the deployment plan for
my staging context. Keep the requested resources and provider constraints.
```

For troubleshooting, include the real deployment identifier:

```text
Use $akt-cli to inspect deployment <dseq> in my staging context,
check its logs and events, and explain why the service is not ready.
```

For changes that spend funds or alter a deployment, specify the target context, workload, spending limits, and intended action. The skill guides the agent to preserve those requirements and report the resulting deployment and lease identifiers.

## What the Skill Covers

- **Context and identity:** Inspect configuration, select chain signing or Console managed deployment, and keep credentials out of output.
- **Command discovery:** Check the installed binary's version and help before relying on flags or examples.
- **Deployment preparation:** Write and validate SDL, preserve resource and placement requirements, preview the plan, and choose an explicit bid strategy for unattended work.
- **Operations:** Use JSON or JSONL output, inspect leases, fetch status, logs, and events, and update or close the intended deployment.
- **Recovery:** Locate the last successful step, inspect chain and provider state, and continue from existing resources after a partial failure.

The skill works through the CLI with shell access. [akt MCP](/docs/developers/deployment/akt/mcp) optionally exposes selected Akash operations as tools for MCP clients. For broader deployment, provider, and node-operator guidance, see the separate [Akash skill bundle](/docs/getting-started/ai-agents).
