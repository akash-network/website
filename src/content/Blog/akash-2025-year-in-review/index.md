---
title: "Akash: 2025 Year in Review"
description: "2025 marks the year Akash evolved from a promising decentralized compute marketplace into a production-ready Supercloud platform capable of competing with centralized cloud giants. The network executed the most comprehensive infrastructure transformation in its history: Mainnet 14 eliminated eight years of technical debt in a single upgrade while the network maintained a consistent 60% utilization rate for accelerated compute."

pubDate: "2026-01-09"
draft: false

categories:
  - News
tags:
  - News
contributors:
  - Michelle Javed

bannerImage: ./banner.png
---

2025 marks the year Akash evolved from a promising decentralized compute marketplace into a production-ready Supercloud platform capable of competing with centralized cloud giants. The network executed the most comprehensive infrastructure transformation in its history: [Mainnet 14](https://akash.network/blog/akash-mainnet-14-the-core-overhaul-that-changes-everything/) eliminated eight years of technical debt in a single upgrade while the network maintained a consistent 60% utilization rate for accelerated compute.

The numbers tell the story: daily fees hit all-time highs of over $13,000, deployments grew 466% to over 3.1 million created, and institutional recognition arrived with Grayscale naming AKT a ["Top 20 Asset with High Potential"](https://research.grayscale.com/market-commentary/grayscale-research-insights-crypto-sectors-in-q2-2025) for three consecutive quarters.

As the global digital infrastructure landscape grappled with the competing forces of centralization and open-source acceleration, Akash decisively positioned itself as the engine of the latter.

The network's activities throughout the year were characterized by a rigorous adherence to an "Agent-Centric" roadmap, anticipating a future where autonomous Artificial Intelligence (AI) agents, rather than human DevOps engineers, become the primary consumers of compute resources.

This report offers a comprehensive examination of the Akash Network's performance and evolution throughout 2025. It synthesizes data from technical roadmap executions, governance proposals (AEPs), market performance metrics, strategic partnership announcements and integrations.

## AI's Infrastructure Crisis in 2025

2025 was defined by three colliding forces that fundamentally reshaped the cloud computing market:

**The GPU Shortage Intensifies:** NVIDIA's H100s remained allocation-only throughout the year, with 6-12 month wait times for enterprise buyers. AWS and Azure responded to constrained supply by raising prices while reducing availability. For startups and mid-market companies building AI products, access to compute became the primary business constraint.

**The AI Commoditization Event:** DeepSeek R1's release in January 2025 proved that efficient model architectures could match GPT-4 performance at 10x lower compute cost. This watershed moment fundamentally shifted AI economics: high performance no longer required massive GPU clusters and nine-figure training budgets. Intelligence became affordable and accessible, democratizing what had been the exclusive domain of well-funded labs. The implications cascaded through the industry—if the intelligence layer commoditizes, then margin concentrates in the most efficient compute layer.

**The Decentralization Imperative:** Following centralized AI censorship controversies, data privacy concerns, and growing enterprise wariness of vendor lock-in, open-source AI adoption accelerated dramatically. Projects like Llama 3.3, DeepSeek, and Qwen became production-grade alternatives deployed by companies unwilling to route sensitive data through OpenAI or Google. The market demanded censorship-resistant, privacy-preserving infrastructure, but existing decentralized solutions lacked the maturity and performance enterprises required.

**The Energy Crisis:** By late 2025, the AI energy crisis transitioned from a theoretical concern to a hard operational limit. With U.S. data center energy consumption projected to triple by 2028, potentially consuming up to [12% of the nation's electricity](https://x.com/akashnet/status/1992359940640641243), hyperscalers began hitting local grid capacities. This "Energy Wall" proved that the centralized mega-data center model is a structural decelerator to human progress, creating a bottleneck because we cannot build centralized power fast enough to meet exponential AI demand.

Akash entered this environment uniquely positioned: a battle-tested decentralized compute marketplace with real GPU inventory, just as demand for cost-efficient, censorship-resistant inference exploded.

While competitors announced roadmaps, Akash had users deploying production workloads.

## 2025 By The Numbers

The network's growth trajectory accelerated dramatically across every metric:

| Metric                   | 2024       | 2025       | Growth |
| ------------------------ | ---------- | ---------- | ------ |
| Deployments Created      | 553,848    | 3,135,110  | +466%  |
| New Leases               | 123,342    | 126,025    | +2.2%  |
| Active Deployments (EOY) | 4,294      | 1,330      | -69%   |
| AKT Network Spend        | 342,442    | 1,941,782  | +467%  |
| USDC Network Spend       | $284,433   | $806,726   | +184%  |
| Total USD Spent          | $1,384,554 | $3,154,814 | +128%  |
| Average Fee Per Lease    | $11.23     | $25.03     | +127%  |

**Key Insights:**

- **Deployment volume exploded 466%** while active deployments decreased 69%. indicating a shift toward shorter-duration, high-frequency AI inference workloads rather than long-running containers. This aligns perfectly with the "agentic" thesis: AI agents spinning up compute for specific tasks, then releasing resources.
- **Network spend more than doubled** despite the decline in concurrent active deployments, suggesting significantly higher resource intensity per deployment (GPUs vs. CPUs) and premium pricing for in-demand hardware.
- **The AKT/USDC spend ratio** (1,941,782 AKT vs. $806,726 USDC) reflects the network's dual-payment system accommodating both crypto-native users and traditional enterprises paying with stablecoins.

**Additional Milestones:**

- **1,000+** GPUs deployed across the network
- **$13,000+** [daily revenue high](https://stats.akash.network/graph/daily-usd-spent) (February 2025)
- **60%** average GPU utilization rate (industry-leading efficiency)
- **3.8M AKT** returned to community treasury (responsible capital allocation)
- **500** attendees at Akash Accelerate flagship event
- **70-85%** cost savings vs. AWS SageMaker for AI inference

## Core Infrastructure: Roadmap Achievements

### Mainnet 14: The Watershed Upgrade

On October 28, 2025, Akash executed the most significant technical refactoring in the network's history. Mainnet 14 was a foundational overhaul that paid down eight years of technical debt in a single coordinated upgrade.

**JWT Authentication (AEP-63): Eliminating Crypto Complexity**

JWT authentication eliminated the number one barrier to enterprise adoption: cryptocurrency complexity. Enterprise DevOps teams could now deploy production workloads by signing in with GitHub or Google, users don't get halted by seed phrases, gas fees, or private key management. Full account abstraction via JSON Web Tokens made Akash indistinguishable from AWS for authentication UX.

Before Mainnet 14, every enterprise pilot hit the same wall: security teams refused to let developers manage cryptographic keys for infrastructure access. JWT authentication removed this objection entirely. A DevOps engineer at a Fortune 500 bank can now provision Akash resources using the same SSO credentials they use for every other enterprise tool.

**IAVL Storage Optimization: Speed for AI Agent Bidding**

Database optimization dramatically improved block execution speeds, which are essential infrastructure for high-frequency automated bidding by AI agents. The network can now process thousands of automated deployment requests per second without validator performance degradation, eliminating latency bottlenecks that would cripple an agent-driven marketplace.

**Multi-Depositor Escrow (AEP-75): Collaborative Infrastructure Funding**

Multi-depositor escrow enables collaborative funding for deployments, allowing DAOs, grant programs, and enterprise procurement teams to sponsor infrastructure without taking ownership of workloads. A DAO can now fund a developer's GPU deployment without controlling their infrastructure. This is critical for ecosystem grants, hackathon sponsorships, and automated agent funding mechanisms.

### WASM Smart Contracts: Modular Evolution

The introduction of permissioned WASM smart contracts fundamentally changed how Akash iterates. Instead of requiring weeks of validator coordination for monolithic chain upgrades, the network can now deploy updates in modular "packets", which enable isolated improvements that don't require full network consensus.

**Key Implementations:**

- **Pyth Price Oracle Integration:** Real-time AKT/USD data feeds provide critical infrastructure for the Burn-Mint Equilibrium economic model, ensuring accurate token valuations for automated treasury operations. This oracle integration would have required a full chain upgrade under the old architecture, but with WASM contracts, it shipped in days.

- **Bare Metal Deployment Foundation:** WASM contracts laid the technical groundwork for direct bare metal GPU access, eliminating virtualization overhead. Enterprise users can now extract maximum performance from hardware for high-scale AI model pre-training workloads where every percentage point of efficiency translates to millions in compute savings.

- **Rapid Security Response:** Security patches and feature upgrades ship in days instead of quarters. When the network experienced a malicious spam attack in March 2025, the core team and validators responded by adjusting transaction costs within hours. This kind of operational speed was impossible under the old upgrade paradigm.

_Why this matters:_ Centralized clouds iterate fast because they control the entire stack. Decentralized networks traditionally trade speed for consensus. WASM contracts let Akash have both: the security and censorship-resistance of decentralization with iteration velocity approaching centralized platforms.

### Enhanced Read Performance: Scaling the Query Layer

As the network scaled to 1.3 million+ order records with deployments growing 466% year-over-year, query performance threatened to become a systemic bottleneck. The core team restructured x/stores with state-specific prefixes, transforming queries from iterating over millions of records to state-filtered subsets targeting only relevant data.

**Impact:**

- API clients (Console, provider services) experienced dramatic performance improvements
- Providers could sync at startup in minutes instead of hours (critical for maintaining high provider counts as the network scales)
- Console users saw sub-second query responses even during peak network activity when thousands of deployments compete for resources

**Reverse Indexing Implementation:** The addition of reverse indexes for bids and leases greatly improved query performance when filtering by provider. This essential infrastructure for provider dashboards, network analytics, and real-time bidding interfaces are what agents use to evaluate compute options.

## Product Launches: From Infrastructure to User Experience

### Console API for Managed Wallet Users

The managed wallet API eliminated the last barrier between traditional developers and Akash infrastructure. Non-crypto users can now programmatically deploy and scale workloads without touching wallets, mnemonics, or Cosmos SDK libraries. These integration patterns are familiar to any engineer who's worked with AWS, Azure, or GCP.

**What Shipped:**

- **Clean REST Endpoints:** Standard HTTP APIs for complete deployment lifecycle management
- **API Key Management:** UI and endpoints for creating, viewing, updating, and deleting API keys with role-based permissions
- **Automated Certificate Handling:** Certificate creation and revocation handled automatically for managed wallet users—no manual cert management
- **Escrow Operations:** Programmatic funding and balance monitoring with webhook notifications
- **Full Documentation:** Swagger docs, docs.akash.network integration, and GitHub wiki with code examples in Python, JavaScript, and Go

Credit card users can now integrate Akash into CI/CD pipelines, auto-scaling systems, and production infrastructure management tools using the same API patterns they use for every other cloud provider.

### Improved User Onboarding (September 2025)

After surveying over a dozen cloud providers (AWS, Vercel, Render, Together.ai), the core team identified a critical conversion gap: Akash's $10 trial was generous in spirit but insufficient for meaningful testing. The new onboarding flow represented a 10x commitment to conversion:

| Element           | Before              | After                   | Rationale                                    |
| ----------------- | ------------------- | ----------------------- | -------------------------------------------- |
| Trial Credits     | $10                 | $100                    | 10x increase enables full production testing |
| Network Access    | Subset of providers | ALL providers           | Users evaluate real marketplace dynamics     |
| Verification      | No signup required  | Credit card (no charge) | Filters low-intent users                     |
| Trial Duration    | Unlimited           | 30 days                 | Creates conversion urgency                   |
| Deployment Limits | No limits           | 24-hour auto-closure    | Frees resources for new trials               |
| Notifications     | None                | Integrated email alerts | Proactive user engagement                    |

The restrictive trial (credit card required) filters out tire-kickers while the generous $100 credit ensures serious developers can fully evaluate the platform for production workloads. The 24-hour deployment limit creates healthy urgency while freeing GPU resources for new trial users, which is critical when H100 availability constrains network growth.

### Escrow Balance Alerts: Preventing Deployment Termination

One of the primary frustrations users faced was unexpected lease termination due to depleted escrow funds, this is particularly problematic for AI inference workloads where interruption means lost customer requests and revenue.

**Functionality:**

- Configurable low-balance thresholds (<, =, >) per deployment with dollar or percentage-based triggers
- Email notifications with deployment identification and time-to-termination estimates
- Custom alert names and notes for multi-account management across teams
- Global alert dashboard showing all configured alerts and triggered events with historical logs
- Granular disable/delete controls and webhook integrations for automated top-ups

A production AI inference API can't afford unexpected downtime. Balance alerts transform Akash from "check your balance manually" to "receive proactive notifications with time to add funds". This update emphasizes the difference between a hobbyist platform and production infrastructure. For enterprises running mission-critical workloads, this is table-stakes reliability.

### Akash Provider Console 1.0: Democratizing Supply

The provider onboarding experience historically required deep Kubernetes expertise, command-line comfort, and community support to troubleshoot configuration issues. Provider Console 1.0 transformed this into a self-serve flow designed to onboard hundreds of new providers with zero support overhead.

**Self-Serve Onboarding:**

- Automatic Kubernetes cluster setup on user-provided VMs (bare metal or cloud instances)
- One-click provider software installation with dependency management
- Guided networking, attributes, and pricing configuration via intuitive UI
- Zero blockchain or Akash-specific knowledge required (if you can provision a VM, you can run a provider)

**Management Dashboard:**

- Real-time lease monitoring and earnings tracking with revenue projections
- Resource utilization and profitability analytics (cost per GPU hour vs. revenue)
- Lease management tools (view active deployments, modify pricing, terminate problem leases)
- Provider maintenance and upgrade automation with zero-downtime update orchestration

**Future Roadmap:** Observability tooling setup, metrics and logs reporting integration, content moderation tools for DMCA compliance, and provider-to-tenant notification system for maintenance windows.

**Security & Access Control: JWT for Provider API (AEP-64)**

The existing mTLS authentication mechanism, while cryptographically secure, created two critical limitations: blockchain dependency (no API access during chain maintenance) and all-or-nothing access control (certificates granted full lease access with no granular permissions).

**JWT Implementation:**

- **Client-Issued Tokens:** Unlike conventional JWT systems where servers issue tokens, Akash clients issue JWTs using wallet signing capabilities (ECDSA with secp256k1 curve). This architectural choice is deliberate…a single wallet may manage dozens of simultaneous leases across different providers, and only the lease owner has the authority to create granular access tokens.

- **Granular Access Control:** Token scoping enables permissions for specific leases, features (logs only, no exec access), or time windows (temporary contractor access). An enterprise can now grant a monitoring tool read-only access to deployment logs without exposing full lease control.

- **Blockchain Independence:** Providers validate JWTs against cached public keys available on-chain, maintaining API availability during chain maintenance or network congestion. This ensures 99.9%+ uptime even when the blockchain layer experiences issues.

- **Short-Lived Tokens:** 15-minute maximum recommended lifetime with implementation-specific configurations. Compromised tokens expire automatically, limiting the blast radius of credential theft.

- **Certificate Compatibility:** Full support for Let's Encrypt and standalone CA certificates, allowing enterprises to integrate Akash into existing PKI infrastructure.

### Billing & Usage Dashboard (In Development)

Recognizing that credit card users needed AWS-style billing transparency for internal cost allocation and budget planning, the core team began development on comprehensive usage tracking.

**Planned Features:**

- Stripe transaction history (date, type, payment method, amount, status, receipt download for accounting)
- Daily usage breakdown (date, resources leased, GPU hours consumed, amount spent per workload)
- Cumulative credit purchase tracking over time with month-over-month comparison
- Account balance trends with spend velocity projections
- Spend analysis by provider, GPU model, and deployment type with exportable reports
- Interactive charts and visualizations for all metrics with custom date range filtering

_Why this matters:_ Enterprise finance teams require detailed usage reporting for chargebacks, cost allocation, and budget planning. "Here's your monthly bill" isn't sufficient. CFOs need "Team A spent $12K on H100s for model training, Team B spent $3K on A100s for inference." This dashboard transforms Akash from "pay and pray" to "measure and optimize."

## The Agentic Turn: AI Infrastructure and AkashML

The intersection of Decentralized Physical Infrastructure Networks (DePIN) and AI was the primary growth narrative for Akash in 2025. The market moved beyond simple "GPU rentals" to comprehensive AI workflow solutions, and Akash moved with it.

### AkashML: The Serverless AI Layer (November 2025)

AkashML launched in November 2025 as a direct response to a fundamental UX problem: deploying AI models on bare-metal Kubernetes is complex. Data scientists want to run inference, not manage infrastructure. AkashML offers a "Serverless" experience, abstracting the underlying Kubernetes complexity entirely.

**Functionality:** Developers select pre-configured open-source models (Llama 3.3-70B, DeepSeek V3, Gwen 2.5-30B, QwQ-32B reasoning model, Llama 3.3 Neomotron by NVIDIA) and receive an API endpoint instantly. No Docker containers, no YAML files, no kubectl commands—just select a model, get an API key, start making inference requests.

**Economics:** By utilizing the idle capacity of decentralized GPUs and eliminating centralized cloud markup, AkashML demonstrated the ability to deliver inference at 70-85% lower cost than AWS SageMaker or OpenAI's API. For context: OpenAI charges $15 per million tokens for GPT-4. AkashML serves comparable open-source models at $2-4 per million tokens.

**Significance:** This product aligns Akash with the "inference-as-a-service" market, which analysts project will eclipse the model training market in total value. While training is one-time capital expenditure, inference is recurring operational expense, and the market is massive. Every customer support chatbot, content moderation system, and recommendation engine requires continuous inference. AkashML makes this affordable for mid-market companies without the capital to build their own infrastructure.

**File Upload Integration:** In March 2025, AkashML added file upload capabilities, allowing users to add context documents to their inference requests. This is critical for RAG (Retrieval-Augmented Generation) applications where models need to reference specific documents or datasets.

**Competitive Positioning:** While AWS SageMaker and OpenAI optimize for convenience and integration with existing cloud ecosystems, AkashML targets two underserved segments:

1. **Cost-sensitive builders:** Startups and mid-market companies where AI infrastructure costs represent 30-50% of gross margins. At 70-85% cost reduction, AkashML makes previously uneconomical applications viable.
2. **Privacy-conscious enterprises:** Organizations in healthcare, finance, and legal sectors that cannot route sensitive data through centralized AI providers due to compliance requirements or competitive concerns.

## Building the Human Layer: Community and Ecosystem

The technological advances of 2025 were matched by sophisticated restructuring of community and ecosystem programs. Recognizing that code doesn't deploy itself, Akash invested heavily in the "Human Layer"—the network of contributors, developers, and advocates who drive adoption.

### The Student Ambassador Program (Q4 2025)

Launched in Fall 2025, the Student Ambassador Program was a long-term strategic play to capture developer mindshare at the source: universities.Following a successful pilot cohort with scholars from **Princeton**, **Cornell**, **USC**, and **UT Austin**, the program is expanding its reach to cultivate the next generation of technical leaders.

Students are future CTOs. If they learn to deploy on Akash during their computer science degree, they will bring Akash into the enterprise when they join companies as engineers and eventually rise to leadership positions. This is a 5-10 year investment in future market share.

The program incentivizes students to organize campus hackathons, run validator nodes on university networks, and produce technical content that helps other students onboard. In Q4, this resulted in a high-volume output of educational resources, including X threads covering the [Akash Network X USC Build Night](https://x.com/0xBlockchainSC/status/1998533122133209567?s=20), a tutorial on [how to self-host the cheapest n8n server](https://x.com/BotbolLucas/status/2005386440545538217), and visionary [2026 Predictions for Akash](https://x.com/mutter88126/status/2008071052061225451?s=20).

Our ambassadors also leveraged LinkedIn to publish deep dives into the industry's shifting economics, such as why [decentralized cloud startups have stronger long-term moats](https://www.linkedin.com/pulse/why-decentralized-cloud-startups-have-weaker-early-moats-helen-hui-zef1e) and how [blockchain will reshape modern AI training](https://www.linkedin.com/pulse/why-blockchain-reshape-modern-ai-training-how-you-can-helen-hui-dzqhe?trk=public_post_feed-article-content). Further thought leadership included pieces on [Why Decentralized Cloud Matters](https://www.linkedin.com/posts/ayeshasatpathy_akashambassadors-activity-7399512011249868800-c6mA/?utm_source=share&utm_medium=member_desktop&rcm=ACoAADl2CroBVl3Y--ZsrolprCV-0LJDfi1uJXU), [Akash Network: The Open Cloud for Builders](https://www.linkedin.com/posts/lucasbotbolagusti_akash-network-the-open-cloud-for-builders-activity-7398834097013387264-wSLR?utm_source=share&utm_medium=member_desktop&rcm=ACoAADLQn6EBUFig-TCMsUdoD9X4oLZPqNgnrBM), and an analysis of why [centralized cloud is powerful, but fragile](https://www.linkedin.com/posts/ayeshasatpathy_akashambassadors-akashnetwork-deai-activity-7409312898759589888-xmTm?utm_source=share&utm_medium=member_desktop&rcm=ACoAACJmvdEBNN21Acr2nkSZEMKHjjMe2fz6jqY) compared to the resilient architecture of the Supercloud.

CS Majors can apply to the Spring 2026 Cohort [here](https://docs.google.com/forms/d/e/1FAIpQLScprUXYrjp9HdwUW_DdTu1UnOvmw2bMfJ0wVKZ1J653uuJsxQ/viewform).

### Akash Insiders: Professionalizing Community Contributions

To manage its growing community and professionalize volunteer contributions, Akash formalized its contributor hierarchy through the Akash Insiders program with distinct roles detailed in Q4 governance proposals:

**Vanguards (Technical Support Core):** The elite technical support corps. These members handle an estimated 70% of Discord support tickets, drastically reducing the burden on the core engineering team. Vanguards answer questions about deployment issues, debugging provider configurations, and troubleshooting network problems.

**Content Creators:** Contributors tasked with producing educational tutorials ("How to deploy DeepSeek on Akash," "Configuring GPU providers for maximum profitability") with professional skillsets in video editing, technical writing, and instructional design. Content serves dual purposes: onboarding new users and SEO for organic discovery.

**Navigators (New Initiative):** Technical guides who assist complex projects in onboarding to the network, including outreach calls with enterprises evaluating Akash, technical architecture reviews, and migration planning. This role bridges the gap between "interested enterprise" and "production deployment."

### Strategic Pivot: From Meetups to Hackathons

**Before (2024-Early 2025):** The Ringmasters program organized community events and local meetups globally. In Q3 2025 alone, Ringmasters hosted 20 events with over 1,100 attendees around the world—impressive reach, but conversion from "meetup attendee" to "active Akash user" remained low.

**After (Late 2025-2026):** Akash reallocated resources toward **hackathons in major tech hubs** (San Francisco, New York, Texas) based on a simple thesis: developers who _build on Akash during a hackathon_ are 10x more likely to become long-term users than attendees who simply hear about it at a meetup.

Meetups create awareness. Hackathons create muscle memory. When a developer spends 48 hours deploying their project on Akash, debugging configuration issues, and ultimately shipping a working application, they internalize the workflow. That developer will default to Akash for future projects because they've already overcome the learning curve.

The Student Ambassador Program complements this strategy, creating a pipeline of student developers who will bring Akash into the enterprise as they graduate and join companies.

### Akash Insiders Relaunch (2026 Preview)

Looking ahead to 2026, the Insiders program is evolving toward:

**Group DYOR Research Sessions:** Structured Q&A sessions with the core team where community members can ask technical questions, discuss roadmap priorities, and understand the "why" behind architectural decisions. This transparency builds trust and creates informed advocates who can accurately represent Akash in external discussions.

**AKT 2026 Foresight Discussions:** Community-driven analysis of market positioning, competitive threats, and growth opportunities—leveraging collective intelligence to inform strategy rather than relying solely on top-down planning.

**Provider and Tenant Relationship Building:** Structured programs to connect providers (compute supply) with tenants (compute demand), reducing marketplace friction and creating sticky bilateral relationships that increase retention.

**Thought Leadership on AI:** Understanding overall sentiment around AI development (safety concerns, energy consumption, centralization risks) and positioning Akash as the solution to these concerns through decentralized, transparent, energy-efficient infrastructure.

## Strategic Partnerships and Integrations

Akash's growth in 2025 was catalyzed by key integrations that embedded the Supercloud into broader Web3, AI, and developer tool ecosystems. These partnerships served multiple purposes: driving user acquisition, validating technical capabilities, and creating network effects where Akash becomes default infrastructure.

### Production Integrations (Active Usage)

**ElizaOS & ai16z:** The integration of AkashChat API into ElizaOS framework positioned Akash as the default inference provider for ai16z's agent ecosystem. ElizaOS is a cognitive agent framework enabling AI agents to operate autonomously, self-improve, and adapt.

**Envision Labs:** Envision Labs redefined how creators harness AI to build, protect, and profit from their work by combining generative AI tools with decentralized infrastructure. The company utilizes Akash's full-stack compute marketplace to power inference for all generative AI models deployed for clients: a steady rental of more than a dozen A100 and H100 GPUs that scales up and down according to customer demand.

**EaveAI:** EaveAI extracts data from X Spaces and translates the landscape of audio data into actionable insights through their Data Hub. Audio data is collected and transcribed via OpenAI Whisper instances, then routed through ChatAPI model inference powered by Akash GPUs.

**Venice.ai:** This privacy-focused AI platform utilizes Akash to serve inference for its uncensored models. By routing queries through Akash's decentralized provider network, Venice.ai guarantees users that their data isn't being harvested by centralized entities like OpenAI or Google.

**Codex Storage:** Codex is a durable, decentralized storage protocol currently in testnet. Akash offers simple infrastructure for Codex's community to quickly deploy decentralized Codex Storage Nodes, jump-starting their network without requiring node operators to manage complex Kubernetes configurations.

**Aakave Network:** Builders on Akash now have access to decentralized storage via Aakave Network, enabling full-stack decentralized infrastructure. Deploy AI workloads, databases, or any application requiring persistent storage entirely on decentralized substrate.

**Developer Tool Integrations**

**Akash MCP Server:** In April 2025, Akash launched its open-source Model Context Protocol (MCP) Server, a framework developed by Anthropic enabling AI agents to carry out real-world tasks. MCP connects AI agents to external tools for deploying applications, managing data, and automating workflows that essentially provide agents with "skills."

**Morpheus Compute Network:** Morpheus offers a platform for Smart Agent Builders to create autonomous agents that can independently purchase computing and inference services through Morpheus' integrated compute marketplace, including decentralized networks like Akash. A "Smart Agent" is an AI agent capable of interacting with Web3 contracts and wallets while also holding cryptocurrency that can autonomously pay for resources.

Morpheus released an Akash Console template allowing anyone to quickly deploy Akash GPU resources to provide compute toward the Morpheus ecosystem, creating bilateral marketplace liquidity.

### Conference Presence and Enterprise Outreach

**NVIDIA GTC Sponsorship (March 2025):** Akash sponsored NVIDIA GTC, one of the AI industry's flagship conferences, placing the network directly in front of the AI hardware and enterprise AI communities rather than just crypto audiences. Greg Osuri presented on ["The Rise of Decentralized Cloud,"](https://www.nvidia.com/en-us/on-demand/session/gtc25-EXS74351/) highlighting Akash's solutions to AI's energy challenges and infrastructure constraints.

**NeurIPS Presence:** Akash Core Team attended NeurIPS, the Thirty-Eighth Annual Conference on Neural Information Processing Systems, participating in the conference and sponsored side events. Within hours of Meta releasing Llama 3.3-70B, Akash made it available on AkashChat and AkashChat API, demonstrating operational speed competitive with centralized providers.

**ETH Denver 2025:** Greg Osuri [discussed](https://www.youtube.com/watch?v=k0HPDluOlsQ) how decentralized and distributed computing networks provide affordable, energy-efficient AI solutions, surpassing the performance of conventional, uniform, high-bandwidth clusters. Akash hosted numerous panels, keynotes, and side events that were generally well-attended.

**Token2049 Singapore (October 2025):** Akash attended Token2049 Singapore with a booth presence that drew consistent crowds of developers, founders, and enthusiasts. The event was capstoned by a networking night cohosted with GensynAI and Solana Foundation, creating direct B2B connections with Web3's biggest founders and interested investors.

### Akash Accelerate 2025: The Flagship Event

Akash Accelerate, held June 23 in Brooklyn's Spice Factory venue, represented the network's coming-of-age as a serious player in the New York tech scene.

**Scale:** 500 attendees from 2,500 RSVPs, demonstrating strong brand pull and selective filtering for high-intent participants.

**Speaker Quality:** Headliners included:

- **Illia Polosukhin:** Co-creator of the Transformer architecture and co-founder of NEAR Protocol, pioneering decentralized, user-owned AI
- **Javier Villamizar (SoftBank Vision Fund):** Joined a fireside chat on **Energy Capacity in the Era of AI**, discussing the critical role of decentralized power and compute as centralized grids hit their physical limits
- **Jake Brukhman (CoinFund):** Featured on the **"Beyond Centralized Models"** panel, sharing his thesis on decentralized training as a new emerging asset class
- **Haseeb Qureshi (Dragonfly):** Participated in the **"Is DePIN Real?"** debate, exploring the hurdles and opportunities for scaling decentralized physical infrastructure to meet enterprise SLAs
- **Bagel AI (CEO Bidhan Roy):** Discussed open-source AI frameworks with zero-knowledge (ZK) proof verification to enable verifiable AI training on the Supercloud
- **Blev Labs:** Showcased cognitive agent frameworks where autonomous agents self-improve and adapt while running in isolated, high-performance containers on Akash

**Budget:** Funded by a $340K governance grant (Prop 289), the event featured high-production value showcases, VIP dinners, and livestream broadcasts, establishing Akash as a legitimate infrastructure player rather than a fringe crypto project.

## Financial Discipline and Capital Recapture

Treasury management in 2025 was defined by a fundamental shift toward "lean operations" and risk mitigation rather than aggressive spending during bull markets.

**Volatility Buffers:** Governance proposals included explicit "Volatility Buffers"—extra AKT requested to account for price fluctuations during liquidation periods. For example, Q1 Events proposal calculated a funding shortfall from the previous quarter due to AKT price drops and requested a top-up, ensuring continuity of operations without mid-quarter emergency funding requests.

**The Provider Incentives Pilot (PIP) Framework:** The success of the PIP framework became visible in 2025 treasury data. By design, the PIP mandates that unused capital from incentive programs returns to the community pool, preventing capital from getting trapped in inactive programs or poorly-performing providers.

**Treasury Impact:** In 2025, this discipline resulted in a total return of **3,370,484 AKT** to the treasury, with **1.6 million AKT returned in Q4 alone**.

This "recycling" of capital demonstrates that the Akash DAO is moving away from permanent token "burns" or one-way capital deployment toward a model where capital is only deployed for verified performance.

If a provider incentive program doesn't drive utilization, the capital returns to the pool for reallocation. This creates accountability: programs must demonstrate ROI or lose funding.

## Additional 2025 Highlights

**Video Generation Capabilities:** Open-source video generation tools deployed on Akash continued to show promise, with community members like Zack Abrams [demonstrating face-swap capabilities](https://www.youtube.com/watch?v=HJ45pnrON2Y) using entirely open-source tooling. This validates Akash as infrastructure not just for text-based AI but for computationally-intensive video processing, a market currently dominated by expensive centralized services like Runway and Pika.

**Greg Osuri Congressional Testimony (May 21, 2025):** Greg Osuri [delivered expert testimony](https://www.youtube.com/watch?v=bkKh1FQiO4w) before the House Oversight and Investigations Subcommittee in a hearing titled "Unleashing a Golden Age: Examining the Use of Federal Lands to Power American Technological Innovation." Osuri testified on how decentralization can solve the coming energy crisis threatening AI progress.

**Silicon GPU NFT Pilot:** Silicon unveiled a pilot program running for 5 months on Akash where they earned **$58,000 USDC** with GPUs tokenized and funded through NFT sales. This proof of concept suggests a promising future where everyday individuals can own GPUs independently of datacenter ownership

## Looking Ahead to 2026

### 1. Shared Security Migration (AEP-79)

The most significant architectural shift in Akash's history is the move from a sovereign Cosmos SDK chain to a **Shared Security model**.

- **Status & Timeline:** Following the RFP issued in late 2025, the migration is a primary focus for 2026 (Estimated completion: **December 30, 2026**).
- **The Partner:** While candidates like **Solana** or other major Layer 1s have been speculated, the destination remains in public evaluation. Akash is seeking a partner that maintains IBC interoperability while offloading L1 maintenance.
- **Strategic Benefits:**
  - **Capital Efficiency:** Reduces the high "liquidity burden" of AKT staking. Instead of locking up massive amounts of AKT to secure the chain, security becomes a **pay-per-use** model.
  - **Resource Allocation:** By outsourcing consensus and data availability, the core team can focus 100% of engineering resources on product innovation (e.g., GPU marketplace logic and AI agent support).

### 2. Bare Metal and Confidential Computing

To capture high-scale AI pre-training and sensitive enterprise workloads, Akash is moving "closer to the metal."

- **Bare Metal Access:** By leveraging WASM smart contracts and modular upgrades, Akash is eliminating the 10–15% performance overhead caused by virtualization. This makes Akash the "obvious choice" for massive training runs where a 15% efficiency gain can save millions of dollars.
- **Hardware Verification (AEP-29):** Estimated completion in **January 2026**, this uses **Trusted Execution Environments (TEEs)** to cryptographically verify hardware specs, ensuring providers cannot spoof GPU capabilities.
- **Confidential Computing (AEP-65):** Slated for **March 2026**, this enables air-gapped processing. This is a prerequisite for "Cloud Repatriation" for industries like healthcare and finance that require strict data privacy.

### 3. Enterprise VM Migration (AEP-49)

While 2024–2025 was the era of containers, 2026 is the era of the **"Lift and Shift"** for legacy enterprise applications.

- **The KubeVirt Solution:** This integration (Estimated completion: **February 19, 2026**) allows Virtual Machines to run alongside containers.
- **The "Sticky" App Opportunity:** Akash can now host mission-critical legacy software (Oracle databases, Windows-based manufacturing apps) that cannot be easily containerized.
- **Strategic Value:** Enterprise CIOs can migrate to Akash for **immediate cost savings** without the multimillion-dollar expense of rewriting decades-old code.

### 4. Hardware Supply Chain: Blackwell and the Consumer Edge

Akash is addressing the global silicon shortage by diversifying the types of hardware that can serve the Supercloud.

- **NVIDIA Blackwell (B200/B300):** Support is live and scaling through 2026. While hyperscalers like Microsoft and Google have secured the majority of the early supply, Akash's decentralized providers are beginning to integrate these units, offering a "second source" for startups.
- **Consumer GPU Validation:** 2026 marks the widespread use of clustered consumer GPUs (like the **RTX 4090**) for high-performance inference.
  - **The Data:** Clustered 4090s can reduce inference costs by up to **75%** compared to enterprise-grade H100s, with negligible performance loss for batch processing. This validates the **"Akash at Home"** thesis, turning idle gaming PCs into a global AI factory.

## Stay Connected

Don't miss a single technical upgrade or governance proposal as we navigate the 2026 roadmap.

The transition from 2025 into 2026 marks the end of the "experimentation phase" for decentralized compute. As the infrastructure for the Agent-Native Supercloud matures, Akash Network is no longer just a viable alternative to the legacy cloud, it is becoming the inevitable destination for the next era of human and machine intelligence.

Follow @akashnet on [X](https://x.com/akashnet) for real-time updates.

Join the Conversation on [Discord](https://discord.com/invite/akash) to collaborate with core contributors and thousands of developers.

Watch the Supercloud scale in real-time via [Akash Stats](https://stats.akash.network).

The demand for sovereign, high-performance compute is accelerating. The question is no longer if the world will move to the Supercloud, but when. We'll see you on the network.
