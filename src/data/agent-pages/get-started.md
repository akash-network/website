---
name: akash-get-started
area: Getting Started
supported_surfaces: [cli, skills, mcp, api]
description: |-
  Hand your coding agent this playbook to set up Akash Network: install the
  akt CLI, connect an Akash Console API key, add the Akash skill, and register
  the MCP server once for use across projects.
title: 'Onboard your agent to Akash Network'
url: https://akash.network/get-started.md
runtimes: [Claude Code, Codex CLI, OpenCode, Cursor, VS Code with Copilot]
---

# Set up Akash Network for your AI coding agent

Use this playbook to prepare the current agent to deploy workloads on Akash Network. Install the CLI, connect a credential, add guidance, and register MCP once. Link individual deployments later, when a task requires one.

## How to run

Run section 1 once per machine. Run sections 2 through 4 once per coding agent. Section 5 is reference material to read, not steps to execute.

Perform actions yourself when terminal or file access is available. Global or user-scoped installation is the default. Pause only for user authentication, approval, or UI actions you cannot perform. Do not merely return commands for the user to copy.

Akash Network deployments spend real money. Default to the read-only configuration in section 4 unless the user explicitly asks for write access.

## 1. Install the akt CLI

`akt` is a single binary covering chain queries, deployment workflows, provider operations, Console integration, and the MCP server. It replaces the older `akash` and `provider-services` binaries.

Check for an existing installation:

```sh
akt version
```

If `akt` is missing, fetch the current installation instructions and follow them for this platform:

```text
https://akash.network/docs/developers/deployment/akt/installation
```

Do not guess an install command or a release URL. Read the page, install, then verify with `akt version` before continuing.

## 2. Connect an Akash Console API key

This is the recommended credential. It uses a Console-managed wallet, bills in US dollars by card, and requires no local keys, seed phrase, or token purchase.

Create a context for it:

```sh
akt context create console --network mainnet --auth-method console-api --set-current
```

**Pause here.** The key can only be created in a browser. Ask the user to:

1. Open `https://console.akash.network` and sign in.
2. Go to Settings, then API Keys.
3. Create a key and paste it back.

Then store and validate it:

```sh
akt console login
```

In a non-interactive shell, pass it positionally instead: `akt console login <key>`. The key is written to `contexts/<name>/console-api-key` with mode 0600, never to `config.yaml`, and never printed.

Verify:

```sh
akt console whoami
```

If the user prefers self-custody, create a keyring context instead and fund it with AKT for deposits and gas. The equivalent web interface is Console Air at `https://air.akash.network`, where the user connects their own wallet and signs each transaction; it issues no API key, so an agent cannot act through it. Do not set up both rails in the same session — pick one and confirm it works.

## 3. Add Akash guidance

The Akash skill bundle teaches the agent to write SDL and run the deployment lifecycle. It installs three skills: `akash-network:akash` for deploying workloads, `akash-network:akash-provider` for running a provider, and `akash-network:akash-node` for running a node or validator.

### Claude Code

```sh
/plugin marketplace add akash-network/akash-skill
/plugin install akash-network@akash-network
```

Confirm with `/plugin` that `akash-network` is listed. Reload only if the skills are not discoverable.

### Codex CLI

Codex reads the repository's `.codex-plugin/plugin.json` manifest and loads from `skills/`. Add `akash-network/akash-skill` as a local or marketplace Codex plugin.

### OpenCode and other agents

Link the skills into the agent's global skills directory:

```sh
git clone https://github.com/akash-network/akash-skill
mkdir -p ~/.agents/skills
ln -s "$(pwd)/akash-skill/skills/akash" ~/.agents/skills/akash
```

Add `akash-provider` and `akash-node` the same way only if the user runs infrastructure.

## 4. Connect the Akash MCP server

`akt mcp` runs over stdio. The client launches it; there is no remote endpoint, no OAuth, and no URL to configure.

### Claude Code

```sh
claude mcp add akash -- akt mcp
```

### Clients configured by JSON

Inspect the existing config and merge this entry without replacing unrelated settings:

```json
{
  "mcpServers": {
    "akash": {
      "command": "akt",
      "args": ["mcp"]
    }
  }
}
```

### Write access

The server is read-only by default. Read tools are annotated read-only; write tools are marked destructive.

Adding `--enable-writes` grants the client the ability to close deployments, create and close leases, submit manifests, and spend Console credits. On the Console rail that means spending the user's money; on the chain rail it means broadcasting signed transactions.

Do not add `--enable-writes` unless the user asks for it in this session. If they do, say plainly what it grants before making the change.

Verify the server loaded by listing tools in the client and calling one read-only tool.

## 5. What to know before deploying

- **A deployment is an auction, not a push.** Publish the workload, wait for provider bids, accept one, and the manifest goes to that provider. Nothing runs until a lease exists.
- **Bids take time.** They typically arrive 30 to 60 seconds after the deployment is created. Poll about every 3 seconds, then back off rather than retrying tighter.
- **Escrow drains while the lease runs.** The minimum deposit is $0.50. A deployment left running keeps spending. Top it up, or close it to reclaim the unspent balance.
- **Close what you open.** An abandoned deployment is a live bill, not a stopped process.
- **Images need explicit version tags.** `latest` is not acceptable in a deployment the user will rely on.
- **Confidential compute images must be public.** A service using `tee: cpu` or `tee: cpu-gpu` cannot pull from a private registry; credentials are ignored and the deployment fails.
- **Author SDL locally first.** `akt sdl scaffolds` lists the built-in templates and validates without a context, a key, or a network connection.

## Verification

Before reporting success, prove the setup end to end:

1. Scaffold a minimal web SDL with `akt sdl`.
2. `akt deploy deploy.yaml --deposit 5`
3. Confirm the lease is active and the returned URI responds.
4. `akt close <dseq>`
5. Confirm the deployment shows closed and the escrow balance returned.

If the user does not want to spend on a test deploy, stop after step 1 and say so in the report.

## Completion

Report only verified state:

```text
Akash Network agent setup is ready
CLI: akt <version>
Credential: <console-api|keyring>, verified as <account or console identity>
Guidance: <skill bundle|skipped>, <global|project> scope
MCP: <connected|skipped>, <read-only|writes enabled>
Test deploy: <dseq closed and escrow returned|skipped at user request>
```

Sources:

- https://akash.network/docs/developers/deployment/akt/
- https://akash.network/docs/developers/deployment/akt/console/
- https://akash.network/docs/developers/deployment/akt/mcp/
- https://akash.network/docs/getting-started/ai-agents/
- https://akash.network/docs/api-documentation/console-api/getting-started/
