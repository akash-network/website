---
title: "How Do You Use Kimi K3.1 Pro in Claude Code? (Kimi CLI vs Claude Code, 2026)"
description: "Run Kimi K3.1 Pro in Claude Code via an Anthropic-compatible endpoint: setup, Kimi CLI vs Claude Code, what 1M context changes, and where it beats Opus 5.5."
pubDate: 2026-11-20
author: "Sandeep Narahari, Contributor"
tags: ["Guides"]
bannerImage: ./banner.webp
draft: false
faqAccordion: true
---

_Last updated: November 2026_

On AkashML, Akash Network's managed inference API, Kimi K3.1 Pro runs inside Claude Code with no proxy: point `ANTHROPIC_BASE_URL` at AkashML's Anthropic-compatible endpoint, add an API key, and map Claude Code's Opus tier to `moonshotai/Kimi-K3.1-Pro`. Moonshot AI released the model on October 23, 2026, with a 1,048,576-token context window, and ran its own headline coding benchmarks inside the Claude Code harness. That reframes the Kimi CLI vs Claude Code question: you can keep the harness you already use and change only the model.

**TL;DR**

- Claude Code talks to any Anthropic-compatible Messages API. AkashML serves one at `https://api.akashml.com/anthropic`, so running Kimi K3.1 Pro takes a few environment variables, not a router.
- Kimi K3.1 Pro has a 1,048,576-token context window, enough to keep large parts of a codebase in the prompt instead of rediscovering them with search tools every turn.
- On Moonshot's published numbers, K3.1 Pro beats Claude Opus 5.5 on long-horizon coding (SWE-Marathon v1.1: 51.7 vs 46.3) and trails slightly on Terminal-Bench 4.0 (65.7 vs 66.4). Both are vendor-reported.
- Moonshot ran those coding benchmarks in the Claude Code harness, so the published scores describe roughly the setup in this guide.
- Kimi vs Claude Code is not either/or. Kimi Code CLI (the successor to Kimi CLI) is Moonshot's own terminal agent, but Claude Code runs Kimi models directly. If your team already works in Claude Code, swapping the model is less disruptive than swapping the harness.

## Can you use Kimi K3.1 Pro in Claude Code?

Yes. Claude Code sends requests in Anthropic's Messages API format to whatever base URL you configure, and any server that speaks that format can answer. AkashML exposes an Anthropic-compatible endpoint and [documents the Claude Code setup](https://akashml.com/docs/guides/claude-code).

Claude Code switches between three model tiers, Haiku, Sonnet, and Opus, depending on the job. A quick file lookup might go to Haiku, an edit to Sonnet, and deep reasoning to Opus. Each tier can be pointed at a different model with its own environment variable, so you can send the hard turns to Kimi K3.1 Pro and keep lighter models on routine work.

Nothing else about Claude Code changes. Your `CLAUDE.md` files, hooks, permission settings, and slash commands all keep working, because only the model behind the API is different.

AkashML is Akash Network's managed inference service for open-weight models, with OpenAI-compatible and Anthropic-compatible APIs and per-token billing. Kimi K3.1 Pro is listed on its [models page](https://akashml.com/docs/platform/models) with the full 1M-token context.

## How do you use Kimi in Claude Code?

Using Kimi with Claude Code takes a few settings in `~/.claude/settings.json`: AkashML's base URL, your AkashML API key, the K3.1 Pro model ID for the Opus tier, and a longer request timeout. Then open a new terminal and run `claude`. The whole setup takes a few minutes.

**Step 1: Install Claude Code.** On macOS, Linux, or WSL, Anthropic's native installer is the recommended route ([install guide](https://code.claude.com/docs/en/setup)):

```bash
curl -fsSL https://claude.ai/install.sh | bash
claude --version
```

**Step 2: Create an AkashML API key.** In the AkashML dashboard, go to Settings, then API Keys. Keys start with `akml-`.

**Step 3: Add the configuration.** Create `~/.claude/settings.json` if it does not exist and paste:

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://api.akashml.com/anthropic",
    "ANTHROPIC_AUTH_TOKEN": "akml-your-key-here",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "moonshotai/Kimi-K3.1-Pro",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "zai-org/GLM-5.3",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "Qwen/Qwen3.6-35B-A3B",
    "API_TIMEOUT_MS": "3000000"
  }
}
```

**Step 4: Start a session.** Open a new terminal so the settings load, `cd` into a project, and run `claude`. Ask it to summarize the repository to confirm the connection. Requests appear in the AkashML dashboard usage chart.

| Variable                         | Required | What it does                                                             |
| -------------------------------- | -------- | ------------------------------------------------------------------------ |
| `ANTHROPIC_BASE_URL`             | Yes      | Sends Claude Code's requests to AkashML instead of Anthropic             |
| `ANTHROPIC_AUTH_TOKEN`           | Yes      | Your AkashML API key (`akml-...`)                                        |
| `ANTHROPIC_DEFAULT_OPUS_MODEL`   | No       | Model used when Claude Code asks for Opus; set this to K3.1 Pro          |
| `ANTHROPIC_DEFAULT_SONNET_MODEL` | No       | Model used for Sonnet-tier work such as routine edits                    |
| `ANTHROPIC_DEFAULT_HAIKU_MODEL`  | No       | Model used for quick lookups                                             |
| `API_TIMEOUT_MS`                 | No       | Request timeout in ms; 3,000,000 is about 50 minutes for long agent runs |

The takeaway: only the first two variables are mandatory, and the model mappings are where you decide how much work K3.1 Pro handles.

A few practical notes:

- **One session only.** Skip the default mapping and run `claude --model moonshotai/Kimi-K3.1-Pro` to use K3.1 Pro for a single session.
- **All tiers on K3.1 Pro.** Setting all three tier variables to the K3.1 Pro ID gives consistent behavior, at the cost of slower and pricier quick lookups.
- **Cached Anthropic login.** If you previously signed in to Claude Code with an Anthropic account, run `/logout` first so the old credentials do not take priority. [OpenRouter's Claude Code guide](https://openrouter.ai/docs/cookbook/coding-agents/claude-code-integration) flags the same issue.
- **Windows.** Set the same variables with `setx` in Command Prompt or `SetEnvironmentVariable` in PowerShell; [AkashML's guide](https://akashml.com/docs/guides/claude-code) has both versions.

### Kimi K3 and Kimi K2 in Claude Code

The same setup works for older Kimi models. To run Kimi K3 or Kimi K2 in Claude Code, use the base URL and key of a provider that still serves them, and change the model ID in `ANTHROPIC_DEFAULT_OPUS_MODEL`. Early guides to using Kimi K2 in Claude Code relied on [claude-code-router](https://github.com/musistudio/claude-code-router), a local proxy that translates Claude Code's requests into OpenAI-format calls. With a native Anthropic-compatible endpoint, you no longer need that router.

## Kimi CLI vs Claude Code: which should you use?

Use Claude Code if your team already has workflows, hooks, and `CLAUDE.md` files built around it. Use Kimi Code CLI if you want Moonshot's own harness with managed Kimi login and features like video input. Both can run Kimi K3.1 Pro, so this is a harness decision, not a model decision.

The naming trips people up. Kimi CLI was Moonshot's Python-based terminal agent, launched in October 2025. It has since evolved into [Kimi Code CLI](https://github.com/MoonshotAI/kimi-code), an MIT-licensed single binary that migrates old Kimi CLI settings automatically ([overview](https://innfactory.ai/en/ai-harness/kimi-code/)). So Kimi Code vs Claude Code and Kimi CLI vs Claude Code are now the same comparison. Kimi Code CLI is also the official Kimi K3 CLI: it runs the whole K3 series, including K3.1 Pro.

|                           | Kimi Code CLI                                                    | Claude Code                                                |
| ------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------- |
| Maker                     | Moonshot AI                                                      | Anthropic                                                  |
| Default models            | Kimi models via Kimi Code login or a Moonshot API key            | Claude models via an Anthropic account                     |
| Other models              | Configurable to other compatible providers                       | Any Anthropic-compatible endpoint via `ANTHROPIC_BASE_URL` |
| Install                   | Single binary, no Node.js required                               | Native installer (`claude.ai/install.sh`)                  |
| Project instructions file | `AGENTS.md`                                                      | `CLAUDE.md`                                                |
| Editor integration        | Zed and JetBrains via Agent Client Protocol, plus a local web UI | VS Code and JetBrains                                      |
| Standout extras           | Video input, conversational MCP setup, built-in subagents        | Hooks, subagents, plugins and skills                       |

The takeaway: the two harnesses are closer in capability than the names suggest, and switching costs come mostly from team habits and config files, not features.

One detail tips the scale for Claude Code users. In its [K3.1 Pro launch post](https://www.kimi.ai/blog/kimi-k3-1-pro), Moonshot says it evaluated the model on Terminal-Bench 4.0, SWE-Marathon v1.1, and DeepSWE v1.1 using the Claude Code harness, not its own. That does not prove Claude Code is the better harness for Kimi, but it means the benchmark scores were produced in the same environment you get by following this guide.

## What does a 1M-token context change for agentic coding?

A 1,048,576-token window lets the model take in far more of the repository, the conversation history, and tool output in a single request, so the agent can re-read files less and lose less detail to summaries. It does not remove the need for context discipline, and every turn that carries a huge context costs more and responds more slowly.

The output ceiling is large too. [OpenRouter's listing](https://openrouter.ai/moonshotai/kimi-k3.1-pro) declares up to 943,718 output tokens per completion, and reasoning tokens share that budget with the visible answer. In practice Claude Code sets its own per-request output cap well below that; one [published request capture](https://computingforgeeks.com/kimi-k3-1-pro-api-setup/) shows it asking for 32,000 tokens per turn.

Long context is cheaper to serve on this model than on most of its size. K3.1 Pro is a 2.8-trillion-parameter mixture-of-experts model with 104 billion parameters active per token, and most of its layers use Kimi Delta Attention, a linear-attention design that keeps the per-token memory cost of long context small. At the full 1M-token window that works out to [about 29GB of KV cache per sequence](/the-bid/kimi-k3-vs-glm-5-2-vs-deepseek-v4-flash-0731-self-host-guide/), small next to the model's 1.56TB of weights. [Total vs active parameters](/the-bid/total-vs-active-parameters-moe-gpu-sizing-2026/) explains why 104B active matters more for speed than 2.8T total.

What the bigger window makes possible in a coding session:

- **Whole modules instead of grep loops.** The agent can read entire directories into context rather than searching, opening a file, searching again, and opening another.
- **Long tool output stays visible.** Full test logs, stack traces, and build output can sit in context across many turns.
- **Multi-hour tasks hold together.** SWE-Marathon v1.1, where K3.1 Pro posts its biggest lead, is built from multi-hour engineering tasks that depend on keeping earlier decisions in view.
- **Compaction is a harness setting, not a model limit.** Claude Code summarizes older turns when it judges the context is full. Run `/context` in a session to see how much of the window it is actually using with K3.1 Pro.

What does not change: each turn still sends the accumulated context back to the model. Prompt caching softens this, since cached input bills at a lower rate on models that support it ([AkashML pricing formulas](https://akashml.com/docs/guides/pricing)), but a session that sits near 1M tokens is a different cost and latency profile from one that stays small. For more on why long prompts slow down generation, see [what actually determines LLM inference speed](/the-bid/what-actually-determines-llm-inference-speed-2026/).

## Is Kimi K3.1 Pro better than Claude Opus 5.5 for coding?

On long-horizon coding, Moonshot reports that Kimi K3.1 Pro beats Claude Opus 5.5. On terminal tasks the two are effectively tied, with Opus 5.5 slightly ahead, and on closed-book reasoning Opus 5.5 leads by a wide margin. All figures below come from Moonshot's launch post.

| Benchmark             | What it tests                         | Kimi K3.1 Pro (%) | Claude Opus 5.5 (%) | Leader   |
| --------------------- | ------------------------------------- | ----------------- | ------------------- | -------- |
| SWE-Marathon v1.1     | Multi-hour software engineering tasks | 51.7              | 46.3                | K3.1 Pro |
| Terminal-Bench 4.0    | Agentic tasks in a real terminal      | 65.7              | 66.4                | Opus 5.5 |
| HLE with tools        | Hard reasoning with tool access       | 70.0              | 67.7                | K3.1 Pro |
| HLE-Diamond, no tools | Closed-book expert reasoning          | 39.4              | 60.9                | Opus 5.5 |
| BenchCAD with tools   | 3D reconstruction via CAD code        | 92.7              | 96.2                | Opus 5.5 |

_Source: [Moonshot AI, Kimi K3.1 Pro tech blog](https://www.kimi.ai/blog/kimi-k3-1-pro), October 2026. K3.1 Pro scores use max reasoning effort; Opus 5.5 scores are taken from Anthropic's reports and official leaderboards._

The takeaway: K3.1 Pro is strongest where an agent has tools and time, and weakest where the model has to answer from what it knows. That maps well to Claude Code, which is all tools and iteration.

Independent checks are still thin but point the same way. [Vals](https://www.vals.ai/models/kimi_kimi-k3.1-pro) measured K3.1 Pro at 63.64% on Terminal-Bench 4.0, ranking it third of 61 models. That is a few points below Moonshot's own figure, which is normal when a different team runs the harness, so treat the vendor table as directional rather than a head-to-head result.

Choose Opus 5.5 for open-ended design work, knowledge-heavy questions without tool access, and CAD-style spatial tasks. Choose K3.1 Pro for long autonomous runs, very large working contexts, or any situation where you need open weights you can deploy on your own infrastructure. For a broader look at that tradeoff, see [open-weight models vs frontier APIs](/the-bid/gpt-oss-120b-vs-gemini-3-pro/), and for how closed models compare with each other on agentic coding, see [Gemini 3.7 Flash vs GPT-5.6 Terra vs Claude Sonnet 5](/the-bid/gemini-3-7-flash-vs-gpt-5-6-terra-vs-claude-sonnet-5/).

## Can you run Kimi K3.1 Pro in Claude Code through OpenRouter?

Yes. OpenRouter exposes an Anthropic-compatible endpoint, so the same pattern works: set `ANTHROPIC_BASE_URL` to `https://openrouter.ai/api`, put your OpenRouter key in `ANTHROPIC_AUTH_TOKEN`, set `ANTHROPIC_API_KEY` to an empty string, and use the model ID `moonshotai/kimi-k3.1-pro`.

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://openrouter.ai/api",
    "ANTHROPIC_AUTH_TOKEN": "your-openrouter-key",
    "ANTHROPIC_API_KEY": "",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "moonshotai/kimi-k3.1-pro"
  }
}
```

OpenRouter is a router, so the request takes an extra hop to whichever upstream provider serves the model. OpenRouter's own [Claude Code guide](https://openrouter.ai/docs/cookbook/coding-agents/claude-code-integration) also notes that Claude Code through OpenRouter is only guaranteed to work with Anthropic's first-party provider, and that other models may not behave correctly. A direct Anthropic-compatible endpoint such as AkashML removes that extra layer.

## How much does a Claude Code session on Kimi K3.1 Pro cost?

There is no fixed per-session price, because cost scales with tokens, and a long agent run can use several times the tokens of a short one. For current per-token rates, check the [AkashML models and pricing page](https://akashml.com/docs/platform/models).

Five things drive the bill in a Claude Code session:

1. **Output tokens.** Reasoning and the final answer both count as output, and output is the expensive side of the meter.
2. **Reasoning effort.** K3.1 Pro always thinks, with low, high, and max effort levels, and Moonshot's API runs at max by default. Lower effort cuts output tokens on routine turns where deep reasoning adds little.
3. **Context size per turn.** The full conversation is re-sent on every turn, so a session near 1M tokens costs more per turn than one at 50K.
4. **Cache hits.** Cached input tokens bill at a lower cache-read rate on models that support it, which matters a lot for long agent sessions that re-send the same files.
5. **Tier mapping.** Routing Haiku-tier lookups to a small model like `Qwen/Qwen3.6-35B-A3B` instead of K3.1 Pro removes the heaviest model from the cheapest jobs.

For teams running coding agents all day, the bigger question is usually capacity, not per-token price. Because K3.1 Pro's weights are public, a team can also run it on dedicated GPUs it controls. The [self-hosting guide for Kimi K3.1 Pro](/the-bid/kimi-k3-vs-glm-5-2-vs-deepseek-v4-flash-0731-self-host-guide/) covers the hardware floor, an 8x B300 node or larger, and [B300 vs B200 vs H200](/the-bid/nvidia-b300-vs-b200-vs-h200-best-gpu-for-self-hosting-ai/) compares the GPUs that can hold it. [Akash Enterprise](/use-cases/enterprise/) offers reserved GPU capacity for that kind of steady, high-volume workload.

## FAQ

**Can Claude Code use Kimi K3.1 Pro?** Yes. Claude Code works with any Anthropic-compatible Messages API, and Kimi K3.1 Pro is served on several. Set `ANTHROPIC_BASE_URL` to the provider's endpoint, add your API key as `ANTHROPIC_AUTH_TOKEN`, and map a model tier to the K3.1 Pro model ID. Claude Code then runs K3.1 Pro without a proxy or local router.

**Is Kimi CLI better than Claude Code?** Kimi CLI and Claude Code are different harnesses, and both can run Kimi K3.1 Pro. Kimi CLI, now called Kimi Code CLI, is Moonshot's open-source agent with native Kimi login. Claude Code connects to any Anthropic-compatible endpoint. If your team already uses Claude Code, changing the model is less disruptive than changing the harness.

**How much context does Kimi K3.1 Pro give Claude Code?** Kimi K3.1 Pro has a 1,048,576-token context window, and OpenRouter lists up to 943,718 output tokens per completion. That window can hold large parts of a codebase, long test logs, and extended conversation history. Claude Code still applies its own output and compaction limits, so run `/context` to see how much it uses.

**Is Kimi K3.1 Pro better than Claude Opus 5.5 for coding?** On Moonshot's published numbers, Kimi K3.1 Pro leads SWE-Marathon v1.1, a multi-hour engineering benchmark, at 51.7 against Claude Opus 5.5's 46.3. It trails on Terminal-Bench 4.0 at 65.7 against 66.4. Independent figures are still limited, so treat both results as vendor-reported and test on your own repository.

**Do you need an OpenRouter account to use Kimi K3.1 Pro in Claude Code?** No. OpenRouter is one route, but any Anthropic-compatible endpoint that serves Kimi K3.1 Pro works with Claude Code. A direct endpoint removes the extra routing hop, and OpenRouter's own documentation says Claude Code is only guaranteed to work through it with Anthropic's first-party models, so non-Claude models may behave unpredictably.

**Is Kimi K3.1 Pro open source?** Kimi K3.1 Pro is an open-weight model. Moonshot AI published the full weights on Hugging Face on November 4, 2026, under its own Kimi K3.1 Pro license rather than a standard open-source license. The weights are large, [about 1.56 TB on disk](/the-bid/kimi-k3-vs-glm-5-2-vs-deepseek-v4-flash-0731-self-host-guide/), so most developers use a hosted API instead of running the model locally.

**How do you switch Claude Code back to Claude models?** Remove the `ANTHROPIC_BASE_URL`, `ANTHROPIC_AUTH_TOKEN`, and model-mapping entries from `~/.claude/settings.json`, or unset them in your shell, then open a new terminal. Start Claude Code and run `/login` to sign in with your Anthropic account. Keeping a second settings file makes it easy to switch between Kimi K3.1 Pro and Claude.
