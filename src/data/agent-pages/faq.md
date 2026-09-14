# Akash Network

**Akash Network is an open-source cloud computing marketplace where independent providers bid to run containerized workloads, including NVIDIA GPUs. Developers and AI agents deploy to Akash Network with a credit card or a crypto wallet and pay auction prices rather than list prices.**

[Deploy Now](https://console.akash.network)

[Get in Touch](https://akash.network/gpus-on-demand)

## What is Akash Network?

Akash Network is a permissionless marketplace for cloud compute. Providers — datacenters, mining operations, and individual hardware owners — offer spare CPU, GPU, memory, and storage. A tenant publishes a deployment request, providers bid against it, and the tenant accepts a bid. Akash Network settles those leases on its own Cosmos SDK blockchain. The software is Apache 2.0 licensed and developed in public.

## Can an AI agent deploy to Akash Network on its own?

Yes. Akash Network ships five agent-facing interfaces: an open-source skill bundle for Claude Code, Codex, and OpenCode; an MCP server started with `akt mcp`; a REST API authenticated by a single `x-api-key` header; a single-binary CLI called `akt`; and Go and TypeScript SDKs. An agent holding an Akash Console API key can create a deployment, accept a provider bid, read logs, and close the deployment with no human approving any step.

## Do you need cryptocurrency to use Akash Network?

No. Akash Console at console.akash.network is the managed path: sign up with an email address, add a credit card, and deploy. Billing is in US dollars, the minimum deployment deposit is $0.50, and no wallet, seed phrase, or token purchase is involved at any step. Programmatic access works the same way — the Console API authenticates with an API key and bills the same card.

## Can you deploy to Akash Network with your own wallet?

Yes. Console Air is the self-custody deploy app: you connect a Keplr-compatible wallet, sign every transaction yourself, and can self-host the interface against your own RPC and API endpoints. It is the crypto-native path and it does require crypto — AKT for gas, and ACT, the deployment escrow currency, minted by burning AKT. The two apps deploy to the same network and are compared side by side at akash.network/docs/getting-started/choosing-your-console.

## What GPUs can you rent on Akash Network?

Providers on Akash Network offer NVIDIA datacenter GPUs including H100 and A100 class hardware, alongside consumer cards such as the RTX 4090 and RTX 5090 contributed through the Akash Homenode program. Because every provider sets its own bid, availability, region, and price vary by provider rather than following a single rate card.

## How does deploying to Akash Network work?

A tenant describes the workload in SDL, a YAML format specifying container image, CPU, memory, storage, GPU, and exposed ports. Publishing that deployment opens an auction, and provider bids typically arrive within 30 to 60 seconds. Accepting a bid creates a lease, the manifest is delivered off-chain to the winning provider, and the container starts. Funds sit in a per-deployment escrow account and unspent balance returns to the tenant when the deployment closes.

## What is confidential compute on Akash Network?

Confidential compute runs a workload inside a hardware-isolated Trusted Execution Environment, so the provider hosting it cannot read the workload's memory. On Akash Network it is requested with one SDL field: `tee: cpu` for a confidential VM, or `tee: cpu-gpu` to combine it with NVIDIA GPU confidential computing. The provider selects AMD SEV-SNP or Intel TDX and handles attestation.

## Can you run AI agents and inference on Akash Network?

Yes. Akash Network runs long-lived containers with persistent storage, custom domains, and dedicated IP leases, which is what a stateful agent needs to survive between sessions. Agents deployed this way can also call hosted open-weight models through AkashML, a managed inference service running on Akash Network, which exposes an OpenAI-compatible API at api.akashml.com and an Anthropic-compatible Messages endpoint at api.akashml.com/anthropic.

## Is Akash Network open source?

Yes. The Akash node, provider software, Akash Console, Console Air, the `akt` CLI, and the Akash skill bundle for coding agents are Apache 2.0 licensed and developed at github.com/akash-network. Anyone can run a provider on Akash Network without permission or a commercial agreement.

## How does Akash Network compare to other GPU clouds?

Side-by-side breakdowns against RunPod, Lambda Labs, AWS, and Heroku are published at [akash.network/explore/compare](https://akash.network/explore/compare/).

## Deploy on Akash Network

[Deploy Now](https://console.akash.network)

[Get in Touch](https://akash.network/gpus-on-demand)

Onboard your agent by asking it to fetch and follow [the Akash setup playbook](https://akash.network/get-started.md).
