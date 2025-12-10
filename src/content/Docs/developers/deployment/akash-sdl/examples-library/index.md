---
categories: ["Developers", "Deployment", "Akash SDL"]
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
- **Complete SDL configuration** (`deploy.yaml`)
- **Deployment instructions** (`README.md`)
- **Resource requirements**
- **Configuration options**

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

###  AI - CPU (26 examples)
Run AI workloads on CPU-only instances.

**Popular examples:**
- **Ollama** - Run LLMs locally (Llama, Mistral, etc.)
- **Flowise** - Low-code AI workflows
- **Weaviate** - Vector database

[View all AI - CPU examples →](https://github.com/akash-network/awesome-akash#ai---cpu)

---

###  AI - GPU (80+ examples)
GPU-accelerated AI workloads including LLMs, image generation, and ML training.

**Large Language Models:**
- **DeepSeek-R1** - Latest reasoning model
- **Llama-3.3-70B** - Meta's latest LLM
- **Qwen3-235B** - Alibaba's flagship model

**Image Generation:**
- **AUTOMATIC1111** - Stable Diffusion Web UI
- **ComfyUI** - Node-based SD interface
- **Fooocus** - Professional AI art generation

**Training & Fine-tuning:**
- **LLaMA-Factory** - Model training toolkit
- **Jupyter Notebook** - Interactive AI development

[View all AI - GPU examples →](https://github.com/akash-network/awesome-akash#ai---gpu)

---

###  Databases (15+ examples)

**SQL Databases:**
- **PostgreSQL** - Popular relational database
- **MySQL** - World's most popular database
- **CockroachDB** - Distributed SQL database

**NoSQL Databases:**
- **MongoDB** - Document database
- **Redis** - In-memory data store
- **InfluxDB** - Time-series database

**Database Admin:**
- **Adminer** - Database management tool
- **phpMyAdmin** - MySQL/MariaDB management

[View all Database examples →](https://github.com/akash-network/awesome-akash#databases)

---

###  Web & Blogging

**Blogging Platforms:**
- **WordPress** - Popular CMS
- **Ghost** - Modern publishing platform
- **Wiki.js** - Modern wiki software

**Web Servers:**
- **Nginx** - High-performance web server
- **Caddy** - Automatic HTTPS server

[View all Blogging examples →](https://github.com/akash-network/awesome-akash#blogging)

---

###  Development Tools

**IDEs & Editors:**
- **Code-Server** - VS Code in browser
- **Jupyter Notebook** - Interactive Python notebooks

**CI/CD:**
- **Jenkins** - Automation server
- **Gitea** - Self-hosted Git service
- **GitLab Runner** - Self-hosted GitLab runner

**Business Tools:**
- **n8n** - Workflow automation
- **Budibase** - Low-code platform

[View all Development Tools →](https://github.com/akash-network/awesome-akash#cicd-devops)

---

###  Blockchain Nodes

**Major Networks:**
- **Bitcoin** - Bitcoin full node
- **Ethereum** - Ethereum node
- **Polkadot** - Polkadot validator

**Cosmos Ecosystem:**
- **Akash Node** - Akash Network validator/node
- **Osmosis** - Osmosis DEX node

[View all Blockchain examples →](https://github.com/akash-network/awesome-akash#blockchain)

---

###  Gaming

**Game Servers:**
- **Minecraft** - Minecraft server
- **Counter-Strike: GO** - CS:GO server
- **Palworld** - Palworld dedicated server

**Browser Games:**
- **Tetris** - Classic Tetris
- **Pac-Man** - Pac-Man game

[View all Gaming examples →](https://github.com/akash-network/awesome-akash#games)

---

###  DeFi Applications

**DEX Interfaces:**
- **Uniswap** - Uniswap interface
- **PancakeSwap** - PancakeSwap interface
- **Curve** - Curve Finance

**DeFi Protocols:**
- **Osmosis** - Cosmos IBC DEX
- **Yearn.finance** - Yield optimizer

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
| **Databases** | 15 | [Browse →](https://github.com/akash-network/awesome-akash#databases) |
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
  --from my-wallet \
  --node https://rpc.akashnet.net:443 \
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

- **Test your SDL before submitting
- **Include clear, detailed documentation
- **Specify exact resource requirements
- **Add troubleshooting tips for common issues
- **Follow the existing folder structure
- **Use descriptive commit messages

**[View Contributing Guide →](https://github.com/akash-network/awesome-akash/blob/master/CONTRIBUTING.md)**

---

## Community Support

### Get Help

- **Discord:** [discord.akash.network](https://discord.akash.network) - `#deployments` channel
- **GitHub Issues:** [Report problems](https://github.com/akash-network/awesome-akash/issues)
- **GitHub Discussions:** [Ask questions](https://github.com/akash-network/awesome-akash/discussions)

### Share Your Deployments

- Post in [Discord](https://discord.akash.network) `#deployments` or `#general` channel
- Submit a tutorial or blog post
- Create a video walkthrough
- Add your example to Awesome Akash

---

## Quick Stats

- **391 stars** 
- **257 forks** 
- **148 contributors** 
- **290+ deployment examples** 
- **30+ categories** 
- **Apache 2.0 License** 

---

## Related Resources

- **[SDL Syntax Reference](/docs/developers/deployment/akash-sdl/syntax-reference)** - Complete SDL syntax
- **[SDL Best Practices](/docs/developers/deployment/akash-sdl/best-practices)** - Optimization tips
- **[Akash SDK](/docs/api-documentation/sdk)** - Programmatic deployment
- **[Deployment CLI](/docs/developers/deployment/cli)** - Command-line deployment

---

## Quick Links

| Resource | Link |
|----------|------|
| **Repository** | [github.com/akash-network/awesome-akash](https://github.com/akash-network/awesome-akash) |
| **Browse Examples** | [Table of Contents](https://github.com/akash-network/awesome-akash#table-of-contents) |
| **Submit Issue** | [GitHub Issues](https://github.com/akash-network/awesome-akash/issues) |
| **Contribute** | [Pull Requests](https://github.com/akash-network/awesome-akash/pulls) |
| **Discord** | [Join Community](https://discord.akash.network) |
