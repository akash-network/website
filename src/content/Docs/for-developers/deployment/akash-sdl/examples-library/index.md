---
categories: ["For Developers", "Deployment", "Akash SDL"]
tags: ["SDL", "Examples", "Templates"]
title: "SDL Examples Library"
linkTitle: "Examples Library"
description: "Real-world SDL deployment examples from the community"
weight: 2
---

**Production-ready SDL examples for deploying popular applications on Akash Network.**

All examples are maintained in the [Awesome Akash](https://github.com/akash-network/awesome-akash) repository—a community-curated collection of **290+ deployment examples**.

---

## Awesome Akash Repository

**GitHub:** [github.com/akash-network/awesome-akash](https://github.com/akash-network/awesome-akash)

**391 stars • 257 forks • 148 contributors**

The Awesome Akash repository contains deployment examples for hundreds of applications across 30+ categories. Each example includes:
- ✅ **Complete SDL configuration** (`deploy.yaml`)
- ✅ **Deployment instructions** (`README.md`)
- ✅ **Resource requirements**
- ✅ **Configuration options**

---

## Repository Structure

The repository is organized as a **flat list of folders**, with each folder containing a complete deployment example for one application:

```
awesome-akash/
├── AUTOMATIC1111/        # Stable Diffusion Web UI
├── ollama/               # Run LLMs locally
├── minecraft/            # Minecraft server
├── postgresql/           # PostgreSQL database
├── code-server/          # VS Code in browser
├── nginx/                # Nginx web server
└── ... (290+ more examples)
```

Each folder typically contains:
- `deploy.yaml` - SDL configuration file
- `README.md` - Setup and deployment instructions
- `config.json` - (Optional) Custom configuration

---

## Categories

The repository includes examples across 30+ categories:

### 🤖 AI - CPU (26 examples)
Run AI workloads on CPU-only instances.

**Popular examples:**
- [Ollama](https://github.com/akash-network/awesome-akash/tree/master/ollama) - Run LLMs locally (Llama, Mistral, etc.)
- [Open WebUI](https://github.com/akash-network/awesome-akash/tree/master/open-webui) - ChatGPT-like interface
- [Flowise](https://github.com/akash-network/awesome-akash/tree/master/flowise) - Low-code AI workflows
- [Langflow](https://github.com/akash-network/awesome-akash/tree/master/langflow) - Visual LLM application builder
- [PrivateGPT](https://github.com/akash-network/awesome-akash/tree/master/privategpt) - Private document Q&A
- [Weaviate](https://github.com/akash-network/awesome-akash/tree/master/weaviate) - Vector database
- [Whisper ASR](https://github.com/akash-network/awesome-akash/tree/master/whisper) - Speech recognition

[View all AI - CPU examples →](https://github.com/akash-network/awesome-akash#ai---cpu)

---

### 🎨 AI - GPU (80+ examples)
GPU-accelerated AI workloads including LLMs, image generation, and ML training.

**Large Language Models:**
- [DeepSeek-R1](https://github.com/akash-network/awesome-akash/tree/master/DeepSeek-R1) - Latest reasoning model
- [Llama-3.3-70B](https://github.com/akash-network/awesome-akash/tree/master/Llama-3.3-70B) - Meta's latest LLM
- [Qwen3-235B](https://github.com/akash-network/awesome-akash/tree/master/Qwen3-235B-A22B-Instruct-2507) - Alibaba's flagship model
- [Mistral-7B](https://github.com/akash-network/awesome-akash/tree/master/mistral-7b) - Efficient 7B parameter model

**Image Generation:**
- [AUTOMATIC1111](https://github.com/akash-network/awesome-akash/tree/master/AUTOMATIC1111) - Stable Diffusion Web UI
- [ComfyUI](https://github.com/akash-network/awesome-akash/tree/master/comfyui) - Node-based SD interface
- [StableSwarmUI](https://github.com/akash-network/awesome-akash/tree/master/StableSwarmUI) - Modular SD interface
- [InvokeAI](https://github.com/akash-network/awesome-akash/tree/master/invokeai) - Professional AI art generation

**Training & Fine-tuning:**
- [Axolotl AI](https://github.com/akash-network/awesome-akash/tree/master/axolotl) - LLM fine-tuning
- [LLaMA-Factory](https://github.com/akash-network/awesome-akash/tree/master/llama-factory) - Model training toolkit
- [Unsloth AI](https://github.com/akash-network/awesome-akash/tree/master/unsloth) - Fast model training

[View all AI - GPU examples →](https://github.com/akash-network/awesome-akash#ai---gpu)

---

### 💾 Databases (15+ examples)

**SQL Databases:**
- [PostgreSQL](https://github.com/akash-network/awesome-akash/tree/master/postgresql) - Popular relational database
- [MySQL](https://github.com/akash-network/awesome-akash/tree/master/mysql) - World's most popular database
- [CockroachDB](https://github.com/akash-network/awesome-akash/tree/master/CockroachDB) - Distributed SQL database

**NoSQL Databases:**
- [MongoDB](https://github.com/akash-network/awesome-akash/tree/master/mongodb) - Document database
- [Redis](https://github.com/akash-network/awesome-akash/tree/master/redis) - In-memory data store
- [CouchDB](https://github.com/akash-network/awesome-akash/tree/master/couchdb) - Document-oriented database
- [InfluxDB](https://github.com/akash-network/awesome-akash/tree/master/influxdb) - Time-series database
- [SurrealDB](https://github.com/akash-network/awesome-akash/tree/master/surrealdb) - Multi-model database
- [neo4j](https://github.com/akash-network/awesome-akash/tree/master/neo4j) - Graph database
- [Qdrant](https://github.com/akash-network/awesome-akash/tree/master/qdrant) - Vector database

**Database Admin:**
- [pgAdmin](https://github.com/akash-network/awesome-akash/tree/master/pgadmin) - PostgreSQL management
- [Adminer](https://github.com/akash-network/awesome-akash/tree/master/adminer) - Database management tool

[View all Database examples →](https://github.com/akash-network/awesome-akash#databases-and-administration)

---

### 🌐 Web & Blogging

**Blogging Platforms:**
- [WordPress](https://github.com/akash-network/awesome-akash/tree/master/wordpress) - Popular CMS
- [Ghost](https://github.com/akash-network/awesome-akash/tree/master/ghost) - Modern publishing platform
- [Grav](https://github.com/akash-network/awesome-akash/tree/master/grav) - Flat-file CMS
- [Drupal](https://github.com/akash-network/awesome-akash/tree/master/drupal) - Powerful CMS
- [Wiki.js](https://github.com/akash-network/awesome-akash/tree/master/wikijs) - Modern wiki software

**Web Servers:**
- [Nginx](https://github.com/akash-network/awesome-akash/tree/master/nginx) - High-performance web server
- [Caddy](https://github.com/akash-network/awesome-akash/tree/master/caddy) - Automatic HTTPS server

[View all Blogging examples →](https://github.com/akash-network/awesome-akash#blogging)

---

### 🛠️ Development Tools

**IDEs & Editors:**
- [Code-Server](https://github.com/akash-network/awesome-akash/tree/master/code-server) - VS Code in browser
- [Jupyter Notebook](https://github.com/akash-network/awesome-akash/tree/master/jupyter) - Interactive Python notebooks

**CI/CD:**
- [Jenkins](https://github.com/akash-network/awesome-akash/tree/master/jenkins) - Automation server
- [Gitea](https://github.com/akash-network/awesome-akash/tree/master/gitea) - Self-hosted Git service
- [Gogs](https://github.com/akash-network/awesome-akash/tree/master/gogs) - Lightweight Git server
- [GitHub Runner](https://github.com/akash-network/awesome-akash/tree/master/github-runner) - Self-hosted runner

**Business Tools:**
- [n8n](https://github.com/akash-network/awesome-akash/tree/master/n8n) - Workflow automation
- [Budibase](https://github.com/akash-network/awesome-akash/tree/master/budibase) - Low-code platform

[View all Development Tools →](https://github.com/akash-network/awesome-akash#cicd-devops)

---

### ⛓️ Blockchain Nodes

**Major Networks:**
- [Bitcoin](https://github.com/akash-network/awesome-akash/tree/master/bitcoin) - Bitcoin full node
- [Ethereum 2.0](https://github.com/akash-network/awesome-akash/tree/master/ethereum) - Ethereum node
- [Polkadot](https://github.com/akash-network/awesome-akash/tree/master/polkadot) - Polkadot validator
- [Avalanche](https://github.com/akash-network/awesome-akash/tree/master/avalanche) - Avalanche node
- [Near](https://github.com/akash-network/awesome-akash/tree/master/near) - Near Protocol node
- [Injective](https://github.com/akash-network/awesome-akash/tree/master/injective) - Injective validator
- [Kadena](https://github.com/akash-network/awesome-akash/tree/master/kadena) - Kadena node

**Cosmos Ecosystem:**
- [Cosmos SDK Node](https://github.com/akash-network/awesome-akash/tree/master/cosmos-sdk) - Generic Cosmos node
- [Osmosis DEX](https://github.com/akash-network/awesome-akash/tree/master/osmosis) - Osmosis interface

[View all Blockchain examples →](https://github.com/akash-network/awesome-akash#blockchain)

---

### 🎮 Gaming

**Game Servers:**
- [Minecraft](https://github.com/akash-network/awesome-akash/tree/master/minecraft) - Minecraft server
- [Counter-Strike: GO](https://github.com/akash-network/awesome-akash/tree/master/csgo) - CS:GO server
- [Team Fortress 2](https://github.com/akash-network/awesome-akash/tree/master/tf2) - TF2 server
- [Palworld](https://github.com/akash-network/awesome-akash/tree/master/palworld) - Palworld dedicated server

**Browser Games:**
- [Tetris](https://github.com/akash-network/awesome-akash/tree/master/tetris) - Classic Tetris
- [Pac-Man](https://github.com/akash-network/awesome-akash/tree/master/pacman) - Pac-Man game
- [Super Mario](https://github.com/akash-network/awesome-akash/tree/master/supermario) - Mario game
- [Snake Game](https://github.com/akash-network/awesome-akash/tree/master/snake) - Classic Snake

[View all Gaming examples →](https://github.com/akash-network/awesome-akash#games)

---

### 💰 DeFi Applications

**DEX Interfaces:**
- [Uniswap](https://github.com/akash-network/awesome-akash/tree/master/uniswap) - Uniswap interface
- [SushiSwap](https://github.com/akash-network/awesome-akash/tree/master/sushiswap) - SushiSwap interface
- [PancakeSwap](https://github.com/akash-network/awesome-akash/tree/master/pancakeswap) - PancakeSwap interface
- [Curve](https://github.com/akash-network/awesome-akash/tree/master/curve) - Curve Finance
- [Balancer](https://github.com/akash-network/awesome-akash/tree/master/balancer) - Balancer DEX
- [Sifchain DEX](https://github.com/akash-network/awesome-akash/tree/master/sifchain) - Sifchain interface

**DeFi Protocols:**
- [Yearn.finance](https://github.com/akash-network/awesome-akash/tree/master/yearn) - Yield optimizer
- [Synthetix](https://github.com/akash-network/awesome-akash/tree/master/synthetix) - Synthetic assets

[View all DeFi examples →](https://github.com/akash-network/awesome-akash#defi)

---

## All Categories

| Category | Count | Link |
|----------|-------|------|
| **AI - CPU** | 26 | [Browse →](https://github.com/akash-network/awesome-akash#ai---cpu) |
| **AI - GPU** | 80+ | [Browse →](https://github.com/akash-network/awesome-akash#ai---gpu) |
| **Blogging** | 7 | [Browse →](https://github.com/akash-network/awesome-akash#blogging) |
| **Built with Cosmos-SDK** | 2 | [Browse →](https://github.com/akash-network/awesome-akash#built-with-cosmos-sdk) |
| **Chat** | 2 | [Browse →](https://github.com/akash-network/awesome-akash#chat) |
| **Machine Learning** | 6 | [Browse →](https://github.com/akash-network/awesome-akash#machine-learning) |
| **CI/CD, DevOps** | 9 | [Browse →](https://github.com/akash-network/awesome-akash#cicd-devops) |
| **Data Visualization** | 3 | [Browse →](https://github.com/akash-network/awesome-akash#data-visualization) |
| **Databases** | 15 | [Browse →](https://github.com/akash-network/awesome-akash#databases-and-administration) |
| **DeFi** | 18 | [Browse →](https://github.com/akash-network/awesome-akash#defi) |
| **Benchmarking** | 10 | [Browse →](https://github.com/akash-network/awesome-akash#benchmarking) |
| **Blockchain** | 16 | [Browse →](https://github.com/akash-network/awesome-akash#blockchain) |
| **Business** | 3 | [Browse →](https://github.com/akash-network/awesome-akash#business) |
| **Games** | 8 | [Browse →](https://github.com/akash-network/awesome-akash#games) |
| **Game Servers** | 6 | [Browse →](https://github.com/akash-network/awesome-akash#game-servers) |
| **Hosting** | 4 | [Browse →](https://github.com/akash-network/awesome-akash#hosting) |
| **Media** | 1 | [Browse →](https://github.com/akash-network/awesome-akash#media) |
| **Search Engines** | 4 | [Browse →](https://github.com/akash-network/awesome-akash#search-engines) |
| **Mining - CPU** | 10 | [Browse →](https://github.com/akash-network/awesome-akash#mining---cpu) |
| **Mining - GPU** | 15 | [Browse →](https://github.com/akash-network/awesome-akash#mining---gpu) |
| **Mining Pools** | 3 | [Browse →](https://github.com/akash-network/awesome-akash#mining-pools) |
| **Peer-to-peer File Sharing** | 1 | [Browse →](https://github.com/akash-network/awesome-akash#peer-to-peer-file-sharing) |
| **Project Management** | 3 | [Browse →](https://github.com/akash-network/awesome-akash#project-management) |
| **Social** | 3 | [Browse →](https://github.com/akash-network/awesome-akash#social) |
| **Decentralized Storage** | 2 | [Browse →](https://github.com/akash-network/awesome-akash#decentralized-storage) |
| **Tools** | 20+ | [Browse →](https://github.com/akash-network/awesome-akash#tools) |
| **Network** | 6 | [Browse →](https://github.com/akash-network/awesome-akash#network) |
| **Video Conferencing** | 1 | [Browse →](https://github.com/akash-network/awesome-akash#video-conferencing) |
| **Wallet** | 2 | [Browse →](https://github.com/akash-network/awesome-akash#wallet) |
| **Web Frameworks** | 4 | [Browse →](https://github.com/akash-network/awesome-akash#web-frameworks) |

**[View Complete List →](https://github.com/akash-network/awesome-akash#table-of-contents)**

---

## How to Use Examples

### 1. Browse the Repository

Visit [github.com/akash-network/awesome-akash](https://github.com/akash-network/awesome-akash) and explore the examples.

### 2. Find Your Application

Use the [Table of Contents](https://github.com/akash-network/awesome-akash#table-of-contents) to find examples by category.

### 3. Download the SDL

```bash
# Clone the entire repository
git clone https://github.com/akash-network/awesome-akash.git

# Or download a specific example
wget https://raw.githubusercontent.com/akash-network/awesome-akash/master/nginx/deploy.yaml
```

### 4. Read the Instructions

Each example includes a `README.md` with:
- Prerequisites
- Configuration options
- Deployment steps
- Troubleshooting tips

### 5. Deploy

Use the Akash CLI, SDK, or Console:

```bash
# Using provider-services CLI
provider-services tx deployment create deploy.yaml \
  --from wallet \
  --node https://rpc.akash.network:443 \
  --chain-id akashnet-2
```

---

## Contributing Examples

The Awesome Akash repository welcomes contributions from the community!

### How to Contribute

1. **Fork the repository**
   ```bash
   git clone https://github.com/akash-network/awesome-akash.git
   ```

2. **Create your example folder**
   ```bash
   mkdir my-application
   cd my-application
   ```

3. **Add required files**
   - `deploy.yaml` - Your SDL configuration
   - `README.md` - Deployment instructions
   - `config.json` - (Optional) Custom configuration

4. **Update the README**
   - Add your example to the Table of Contents in the main README.md
   - Place it in the appropriate category
   - Maintain alphabetical order

5. **Submit a pull request**

### Contribution Guidelines

- ✅ Test your SDL before submitting
- ✅ Include clear, detailed documentation
- ✅ Specify exact resource requirements
- ✅ Add troubleshooting tips for common issues
- ✅ Follow the existing folder structure
- ✅ Use descriptive commit messages

**[View Contributing Guide →](https://github.com/akash-network/awesome-akash/blob/master/CONTRIBUTING.md)**

---

## Community Support

### Get Help

- **Discord:** [discord.akash.network](https://discord.akash.network) - `#deployments` channel
- **GitHub Issues:** [Report problems](https://github.com/akash-network/awesome-akash/issues)
- **GitHub Discussions:** [Ask questions](https://github.com/akash-network/awesome-akash/discussions)

### Share Your Deployments

- Post in Discord `#show-and-tell` channel
- Submit a tutorial or blog post
- Create a video walkthrough
- Add your example to Awesome Akash

---

## Quick Stats

- **391 stars** ⭐
- **257 forks** 🍴
- **148 contributors** 👥
- **290+ deployment examples** 📦
- **30+ categories** 🗂️
- **Apache 2.0 License** 📄

---

## Related Resources

- **[SDL Syntax Reference](/docs/for-developers/deployment/akash-sdl/syntax-reference)** - Complete SDL syntax
- **[SDL Best Practices](/docs/for-developers/deployment/akash-sdl/best-practices)** - Optimization tips
- **[Akash SDK](/docs/for-developers/deployment/akash-sdk)** - Programmatic deployment
- **[Deployment CLI](/docs/for-developers/deployment/cli)** - Command-line deployment

---

## Quick Links

| Resource | Link |
|----------|------|
| **Repository** | [github.com/akash-network/awesome-akash](https://github.com/akash-network/awesome-akash) |
| **Browse Examples** | [Table of Contents](https://github.com/akash-network/awesome-akash#table-of-contents) |
| **Submit Issue** | [GitHub Issues](https://github.com/akash-network/awesome-akash/issues) |
| **Contribute** | [Pull Requests](https://github.com/akash-network/awesome-akash/pulls) |
| **Discord** | [Join Community](https://discord.akash.network) |
