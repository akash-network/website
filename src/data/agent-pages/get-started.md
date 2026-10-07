---
name: akash-console-get-started
area: Getting Started
supported_surfaces: [api, plugin, skills]
description: |-
  Hand your coding agent this playbook to set up Akash Console: connect
  a Console API key, add Akash platform guidance, and verify API access
  once for use across projects.
title: 'Onboard your agent to Akash Console'
url: https://akash.network/get-started.md
---

# Set up Akash Console for your AI coding agent

Use this playbook to prepare the current agent to deploy on Akash Network through Akash Console. Connect a credential, add guidance, and verify access once. Create individual deployments later, when a task requires one.

Akash Console is the managed path: a Console account funded in US dollars, an API key for authentication, and a REST API at `https://console-api.akash.network`. There is nothing to install. The agent needs shell access with `curl`, or any HTTP client in the language it is working in.

## What Akash is

Akash Network is an open marketplace for cloud compute. Independent providers around the world offer CPU, memory, storage, and GPU capacity; deployers describe a workload, providers bid to run it, and the deployer accepts one bid. The chain records deployments, bids, leases, and payment. The provider runs the containers.

Anything that runs in a Docker container can run on Akash: web apps and APIs, databases, AI training and inference, game servers, CI runners. Resources are requested at exact sizes rather than instance tiers, and pricing is set by competing bids, so cost is usually well below the large clouds for comparable hardware.

The vocabulary the agent will meet:

- **SDL** (Stack Definition Language): a YAML file describing the services, their resources, networking, and acceptable pricing. Comparable to Docker Compose with a pricing section.
- **Deployment**: an SDL submitted to the network, identified by a `dseq`. It is a request for capacity, not a running thing.
- **Provider**: an independent operator running a Kubernetes cluster that bids on deployments and runs leases.
- **Bid**: a provider's offer to run a deployment at a price, quoted per block in `uact`.
- **Lease**: the agreement created when a bid is accepted. Containers start only after a lease exists and the manifest reaches the provider.
- **Escrow**: funds held per deployment that pay the provider block by block while the lease runs. Whatever is unspent returns when the deployment closes.
- **ACT and AKT**: ACT is the USD-pegged compute credit that funds deployments and pays providers. AKT is the network's native token for staking, governance, and gas. Console users never touch either directly; credits are bought in dollars and converted behind the scenes.

Two ways to deploy:

- **Managed**: Akash Console, with a credit card or trial credits, a Console-held wallet, and an API key for agents. New accounts get $1 of trial credits for 30 days with no card; trial deployments close after 24 hours each but can be redeployed. This is the path this playbook sets up.
- **Self-custody**: the user's own wallet, funded in ACT (or AKT when the circuit breaker is in effect), through Console Air, the CLI, or the SDKs. No KYC, no time limits, and the agent needs signing access to a wallet. Not covered here. See [Choosing Your Console](https://akash.network/docs/getting-started/choosing-your-console).

## How to run

Run section 1 once per machine. Run section 2 once per coding agent. Run section 3 to prove the setup. The notes after section 3 are context to keep in mind when a later task deploys, not steps to execute.

In section 2, try the Akash plugin first and use the standalone skill only if the plugin can't be used. If a step is blocked, record why and continue with the remaining steps.

Perform actions yourself when terminal or file access is available. Pause only for user authentication, approval, or UI actions you cannot perform. Do not merely return commands for the user to copy.

Akash deployments spend the user's Console credits. Nothing in sections 1 through 3 creates a deployment or spends anything. Every mutation after setup (create, update, close) needs the user's confirmation.

## 1. Connect an Akash Console API key

The API key is the agent's identity. It grants full access to the user's Console account, so treat it like a password.

Check for an existing key first, without printing it:

```sh
[ -n "$AKASH_API_KEY" ] && echo "AKASH_API_KEY is set" || echo "AKASH_API_KEY is not set"
```

If one is set, skip to the verification below.

If none is set, **pause here.** The key can only be created in a browser. Ask the user to:

1. Open `https://console.akash.network` and sign in. New accounts receive trial credits with no card required; adding a card lifts the trial's 24-hour per-deployment limit.
2. Go to **Settings > API Keys**.
3. Create a key, copy it when it is shown, and paste it back.

Store it as an environment variable in the user's shell profile or the agent's secret store. Never write it into source files, `config` files, or anything tracked by git. If a project `.env` is the only option, confirm it is gitignored first.

```sh
export AKASH_API_KEY="<paste>"
```

Verify the key with a read-only call:

```sh
curl -sS "https://console-api.akash.network/v1/deployments?limit=5" \
  -H "x-api-key: $AKASH_API_KEY"
```

`200` with `{ "data": { "deployments": [...], "pagination": {...} } }` is the success state. `401` means the key is missing or invalid; ask the user to re-create it. Never print the key in the agent's output or logs.

## 2. Add Akash guidance

The [Akash skill](https://github.com/akash-network/akash-skill) teaches the agent to write Akash SDL and run the Console deployment flow: create, wait for bids, accept a lease, fetch logs and events. It also covers AkashML managed inference (OpenAI- and Anthropic-compatible LLM endpoints on Akash) for tasks that call a model rather than deploy one.

Install either the plugin or the standalone skill, not both.

### Preferred: Akash plugin (Claude Code)

From inside a Claude Code session:

```text
/plugin marketplace add akash-network/akash-skill
/plugin install akash-network@akash-network
```

To pin a release instead of the default branch, use `akash-network/akash-skill@<tag>` in the first command. Update later with `/plugin marketplace update akash-network`.

The plugin bundles three skills: `akash-network:akash` for deploying workloads, `akash-network:akash-provider` for running a provider, and `akash-network:akash-node` for running a node or validator. Only the first is needed here.

Confirm with `/plugin` that `akash-network` is listed and `/akash-network:akash` is discoverable. If the skill does not trigger later, restart the agent and mention Akash explicitly in the prompt.

To try it in one session without persisting it: `git clone https://github.com/akash-network/akash-skill && claude --plugin-dir "$(pwd)/akash-skill"`.

### Fallback: standalone skill (Codex, Cursor, OpenCode, others)

The `skills` CLI installs the deployer skill into most coding agents. It needs Node.js; install Node if missing and you can.

```sh
node --version
npx skills add akash-network/akash-skill --skill akash -g
```

Choose the current agent if prompted. `--skill akash` installs only the deployer skill; use `--skill '*'` only if the user runs infrastructure. Drop `-g` only if the user asks for project scope.

Codex also loads the skills from the repository's `.codex-plugin/plugin.json` manifest when the repo is added as a local or marketplace Codex plugin. Use one route, not both.

If `npx skills` can't be used, link the skill by hand:

```sh
git clone https://github.com/akash-network/akash-skill ~/.agents/akash-skill
mkdir -p ~/.agents/skills
ln -s ~/.agents/akash-skill/skills/akash ~/.agents/skills/akash
```

### Using the skill

The skill auto-triggers on Akash prompts and walks the whole flow. In Claude Code it can also be invoked directly with `/akash-network:akash <task>`. Representative prompts:

- "Deploy this SDL to Akash using my API key and show me the lease status."
- "Write an SDL for a Next.js app with 1 CPU and 1 GB of RAM and deploy it to Akash with my API key."
- "Check the logs and events for my Akash deployment."
- "Call DeepSeek on Akash with the OpenAI SDK." (AkashML path)

The skill knows three deployment methods: Console API, Akash CLI, and the TypeScript/Go SDKs. With an API key present, use the Console API. The CLI and SDK paths need a self-custody wallet funded with AKT and ACT and are out of scope here.

## 3. Verify the setup without spending

Prove authentication and read the platform's current funding constants. Neither call creates anything:

```sh
curl -sS "https://console-api.akash.network/v1/deployments?limit=1" \
  -H "x-api-key: $AKASH_API_KEY"

curl -sS "https://console-api.akash.network/v1/deployment-funding-config" \
  -H "x-api-key: $AKASH_API_KEY"
```

`GET /v1/deployment-funding-config` is referenced in the funding docs but not in the API reference; if it returns `404`, record that and continue.

Ask the user to confirm their account shows available credits on the Console billing page. Console funds deployments from that available balance, so an account with none cannot run anything.

Run a live test only if the user explicitly asks. Use a runtime limit so the deployment closes itself even if the agent is interrupted:

```sh
SDL='version: "2.0"
services:
  web:
    image: nginx:1.27
    expose:
      - port: 80
        as: 80
        to:
          - global: true
profiles:
  compute:
    web:
      resources:
        cpu:
          units: 0.5
        memory:
          size: 512Mi
        storage:
          - size: 512Mi
  placement:
    dcloud:
      pricing:
        web:
          denom: uact
          amount: 10000
deployment:
  web:
    dcloud:
      profile: web
      count: 1'

API="https://console-api.akash.network"
H1="x-api-key: $AKASH_API_KEY"
H2="Content-Type: application/json"

# 1. Create; keep dseq and manifest from the response
CREATE=$(curl -sS -X POST "$API/v1/deployments" -H "$H1" -H "$H2" \
  -d "$(jq -n --arg sdl "$SDL" '{data:{sdl:$sdl, runtimeLimitHours:1}}')")
DSEQ=$(jq -r '.data.dseq' <<<"$CREATE")
MANIFEST=$(jq -r '.data.manifest' <<<"$CREATE")

# 2. Poll bids every 3 s until data is non-empty (typically 30 to 60 s)
BIDS=$(curl -sS "$API/v1/bids?dseq=$DSEQ" -H "$H1")

# 3. Accept the first bid; gseq, oseq, provider come from bid.id
curl -sS -X POST "$API/v1/leases" -H "$H1" -H "$H2" \
  -d "$(jq --arg m "$MANIFEST" '{manifest:$m, leases:[.data[0].bid.id | {dseq, gseq, oseq, provider}]}' <<<"$BIDS")"

# 4. Confirm state is active and a URI is served, then close
curl -sS "$API/v1/deployments/$DSEQ" -H "$H1"
curl -sS -X DELETE "$API/v1/deployments/$DSEQ" -H "$H1"
```

Confirm the deployment reports `closed` afterward. Unspent escrow returns to the account once the chain settles, which can take a short while.

## Before you deploy

Keep these in mind when a later task asks for a real deployment:

- **A deployment is an auction, not a push.** Create the deployment, wait for provider bids, accept one, and the manifest goes to that provider in the same call. Nothing runs until a lease exists.
- **Bids take 30 to 60 seconds.** Poll `GET /v1/bids` every 3 seconds, then back off or return a timeout. Tighter polling earns a `429`.
- **Funding is automatic.** There is no deposit to choose and no top-up to call. Console funds each deployment from the account's available credits and keeps roughly two days of cost in escrow. `POST /v1/deposit-deployment` is deprecated; do not use it.
- **Credits are the only limit.** When the account balance reaches zero, running deployments spend down their escrow and close. If the user's work matters, tell them to add credits or enable Auto Top-Up in Console before a long run.
- **Close what you open.** A deployment runs until it is closed or credits run out. An abandoned deployment is a live bill. Prefer `runtimeLimitHours` on anything the agent creates for itself, and extend it with `PATCH /v2/deployment-settings/{dseq}` if needed. Limits can be raised or removed, not lowered.
- **Trial accounts cap each deployment at 24 hours.** A trial deployment closes on its own at the limit. If the user has not added a card, do not promise anything that must run longer.
- **Images need explicit version tags.** Do not use `latest` in a deployment the user will rely on.
- **Confidential compute images must be public.** A service with `params.tee: cpu` or `cpu-gpu` cannot pull from a private registry; `credentials` are ignored and the deployment fails. `cpu-gpu` also requires a `gpu` block in the compute profile.
- **Logs, events, status, and shell come from the provider, not the Console API.** Mint a short-lived JWT with `POST /v1/create-jwt-token` (documented as Tier 2; it may change without notice), resolve the provider's `hostUri`, and call the provider directly. The events path on the wire is `kubeevents`. Provider certificates are self-signed against the on-chain wallet address; validate them against the chain or route through a provider proxy, and use `-k` only for a one-off check. The skill handles this; prefer it over hand-built requests.
- **Pin to `v1` and `v2`.** Versions are independent and breaking changes are announced in the [console changelog](https://github.com/akash-network/console/releases).

## Completion

Report only verified state:

```text
Akash Console agent setup is ready
Credential: Console API key, stored as AKASH_API_KEY, verified with GET /v1/deployments
Guidance: <plugin|standalone skill|blocked: reason>, <global|project> scope
API check: <funding config read|blocked: reason>
Credits: <user confirmed available balance|not confirmed>
Live test deploy: <dseq closed|not requested>
Reload: <not needed|completed>
```

Sources:

- https://akash.network/docs/getting-started/what-is-akash
- https://akash.network/docs/getting-started/core-concepts
- https://akash.network/docs/api-documentation/console-api/getting-started
- https://akash.network/docs/api-documentation/console-api/api-reference
- https://akash.network/docs/getting-started/how-funding-works
- https://akash.network/docs/getting-started/ai-agents
- https://akash.network/docs/developers/deployment/akash-sdl
- https://github.com/akash-network/akash-skill
