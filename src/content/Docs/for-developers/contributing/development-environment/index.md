---
categories: ["For Developers", "Contributing"]
tags: ["Contributing", "Development Environment", "Setup", "Node", "Provider", "Kubernetes"]
weight: 2
title: "Node & Provider Development Environment"
linkTitle: "Node & Provider Setup"
description: "Set up your Kubernetes development environment for Akash node and provider contributions"
---

**Set up a complete Kubernetes development environment for node and provider development.**

This guide covers the complex setup required for contributing to Akash node and provider repositories, including local Kind clusters and remote SSH clusters.

**For Console and website development**, see [Console & Website Setup](/docs/for-developers/contributing/console-website-setup) - much simpler!

---

## Prerequisites

### Required for Node & Provider Development

- **Git** - Version control
- **GitHub Account** - For forking and PRs
- **Code Editor** - VS Code, GoLand, or your preference
- **Go** - 1.25.0 or later (latest version)
- **Docker Engine/Desktop** - For Kind clusters
- **GNU Make** - 4.0 or later
- **Bash** - 4.0 or later
- **Direnv** - 2.32.x or later

---

## System-Specific Setup

### macOS

#### Install Homebrew

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### Install Development Tools

```bash
# Core tools
brew install go node git make

# Additional utilities
brew install wget jq curl gnu-getopt direnv

# GNU Make (macOS default is outdated)
brew install make
export PATH="/usr/local/opt/make/libexec/gnubin:$PATH"
```

Add to your `~/.zshrc` or `~/.bashrc`:
```bash
export PATH="/usr/local/opt/make/libexec/gnubin:$PATH"
```

#### Setup Direnv

Direnv manages environment variables per project:

```bash
# Install
brew install direnv

# Add to ~/.zshrc
echo 'eval "$(direnv hook zsh)"' >> ~/.zshrc

# Or add to ~/.bashrc
echo 'eval "$(direnv hook bash)"' >> ~/.bashrc

# Reload shell
source ~/.zshrc  # or source ~/.bashrc
```

---

### Linux (Ubuntu/Debian)

#### Install Development Tools

```bash
# Update package list
sudo apt-get update

# Install Go
cd /tmp
wget https://go.dev/dl/go1.25.0.linux-amd64.tar.gz
sudo rm -rf /usr/local/go
sudo tar -C /usr/local -xzf go1.25.0.linux-amd64.tar.gz

# Add Go to PATH
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
source ~/.bashrc

# Verify
go version

# Install Node.js (via nvm recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 22
nvm use 22

# Install other tools
sudo apt-get install -y make git wget curl jq build-essential direnv

# Setup direnv
echo 'eval "$(direnv hook bash)"' >> ~/.bashrc
source ~/.bashrc
```

---

### Windows (WSL2 Recommended)

Use Windows Subsystem for Linux 2:

```powershell
# In PowerShell (Admin)
wsl --install -d Ubuntu

# Restart, then follow Linux instructions above
```

---

## Node & Provider Development Environment

The node and provider repositories require a complete Kubernetes development environment. This guide covers both local and remote cluster setups.

### Overview

This page covers setting up a development environment for both node and provider repositories. The provider repository contains all setup scripts as it depends on the node repository.

**Development approaches:**
1. **Local Kind Cluster (`kube`)** - Most common, runs locally with Docker
2. **Single Node Cluster (`single`)** - All services run as Kubernetes deployments
3. **Remote SSH Cluster (`ssh`)** - For testing GPU workloads and IP leases
4. **Minikube** - Alternative local cluster (not commonly used)

---

### Requirements

#### Software Requirements

**Core:**
- **Go** - 1.25.0 or later (latest version required)
- **Docker Engine/Desktop** - For containerization
- **GNU Make** - 4.0 or later
- **Bash** - 4.0 or later
- **Direnv** - 2.32.x or later
- **wget** - For downloads
- **realpath** - Path utilities

**Additional:**
- unzip
- curl
- npm
- jq
- readlink
- git

**macOS Specific:**
- Homebrew
- gnu-getopt (`brew install gnu-getopt`)

**Verify versions:**
```bash
go version
make --version
bash --version
direnv version
```

#### Install All Dependencies (Automated)

```bash
# Clone repositories first
mkdir -p ~/go/src/github.com/akash-network
cd ~/go/src/github.com/akash-network
git clone https://github.com/akash-network/node.git
git clone https://github.com/akash-network/provider.git

# Run automated installer (macOS and Debian-based Linux)
./provider/script/install_dev_dependencies.sh
```

**Supported platforms:**
- ✅ macOS
- ✅ Debian-based Linux
- ❌ Windows (not supported - use WSL2)

---

### Runbook Structure

All development configurations are in the `provider/_run` directory:

```
provider/_run/
├── kube/          # Local Kind cluster (most common)
├── single/        # All services in Kubernetes
├── ssh/           # Remote cluster via SSH
└── minikube/      # Minikube setup
```

**Commands are implemented as `make` targets.** All runbooks share the same commands once set up.

---

### Environment Parameters

Common parameters available across all runbooks:

| Parameter | Default | Applies To | Description |
|-----------|---------|------------|-------------|
| `SKIP_BUILD` | false | All | Skip binary rebuilds |
| `DSEQ` | 1 | deployment-*, lease-*, bid-*, send-manifest | Deployment sequence |
| `OSEQ` | 1 | deployment-*, lease-*, bid-*, send-manifest | Order sequence |
| `GSEQ` | 1 | deployment-*, lease-*, bid-*, send-manifest | Group sequence |
| `KUSTOMIZE_INSTALLS` | Varies | kustomize-* | Components to install |
| `KUBE_ROLLOUT_TIMEOUT` | 120 | All | Kubernetes rollout timeout (seconds) |

**Usage:**
```bash
KUBE_ROLLOUT_TIMEOUT=300 make kube-cluster-setup
DSEQ=5 GSEQ=2 make query-deployments
```

---

## Local Kind Cluster Setup (Recommended)

**Purpose:** Complete local development environment using Kubernetes in Docker.

### Overview

The Kind (Kubernetes in Docker) runbook creates a local cluster where:
- **Node and provider** run as host services
- **Operators** run as Kubernetes deployments
- Complete end-to-end testing capability

This is the most widely used development setup.

### Prerequisites

- Docker Desktop/Engine running
- Direnv configured
- All dependencies installed

### Setup Steps

> **Note:** This requires **three simultaneous terminals**. We'll call them terminal1, terminal2, and terminal3.

#### STEP 1 - Navigate to Kube Directory

Run on **all three terminals:**

```bash
cd ~/go/src/github.com/akash-network/provider/_run/kube
```

#### STEP 2 - Create and Provision Local Cluster

Run on **terminal1 only:**

```bash
# This may take several minutes
make kube-cluster-setup
```

**What this does:**
- Creates a local Kind cluster
- Sets up ingress controller
- Configures networking
- Installs required components

**If timeout occurs:**

The ingress controller may take longer to initialize. If you see:

```
error: timed out waiting for the condition
make: *** [kube-setup-ingress-default] Error 1
```

Run with extended timeout:

```bash
cd ~/go/src/github.com/akash-network/provider/_run/kube
make kube-cluster-delete
make clean
make init
KUBE_ROLLOUT_TIMEOUT=300 make kube-cluster-setup
```

**Goreleaser version issue:**

If you see `Unable to find image 'ghcr.io/goreleaser/goreleaser-cross:v'`:

```bash
export GOVERSION_SEMVER=v1.24.2
KUBE_ROLLOUT_TIMEOUT=300 make kube-cluster-setup
```

#### STEP 3 - Start Akash Node

Run on **terminal2:**

```bash
make node-run
```

**Expected output:**
- Node starts and begins syncing
- Blockchain state initializes
- RPC and API servers start

**Keep this terminal running** - you'll see node logs here.

#### STEP 4 - Create Provider

Run on **terminal1:**

```bash
make provider-create
```

**What this does:**
- Registers provider on the blockchain
- Creates provider account
- Sets provider attributes

#### STEP 5 - Start Provider

Run on **terminal3:**

```bash
make provider-run
```

**Expected output:**
- Provider connects to node
- Bidding engine starts
- Cluster monitoring begins

**Keep this terminal running** - you'll see provider logs here.

#### STEP 6 - Test Deployment Workflow

Run on **terminal1:**

```bash
# Create a test deployment
make deployment-create

# Query the deployment
make query-deployments

# Check for orders
make query-orders

# View provider bids
make query-bids

# Create a lease
make lease-create

# Verify lease
make query-leases

# Send deployment manifest
make send-manifest

# Check lease status
make provider-lease-status

# Test connectivity
make provider-lease-ping

# View deployment logs
make provider-lease-logs
```

### Cleanup and Reset

**Full cleanup:**

```bash
cd ~/go/src/github.com/akash-network/provider/_run/kube
make kube-cluster-delete
make clean
make init
```

**Restart services only:**

```bash
# Stop services
make provider-stop
make node-stop

# Restart
make node-run      # in terminal2
make provider-run  # in terminal3
```

---

## Remote SSH Cluster Setup (Advanced)

**Purpose:** Test GPU workloads, IP leases, or production-like deployments.

### Overview

The SSH runbook connects to a remote Kubernetes cluster for:
- GPU provider testing
- IP lease functionality
- Production environment simulation
- Complex networking scenarios

### Prerequisites

**Remote Cluster:**
- Kubernetes cluster with external API access
- SSH access to cluster nodes
- kubectl configured
- GPU drivers (for GPU testing)

**Local Machine:**
- SSH key configured
- kubectl installed
- Direnv configured

### Remote Cluster Preparation

#### On Remote Cluster

```bash
# Install containerd (if not already installed)
apt-get update && apt-get install -y containerd

# Install nerdctl for image management
wget https://github.com/containerd/nerdctl/releases/download/v1.7.0/nerdctl-1.7.0-linux-amd64.tar.gz
tar Cxzvvf /usr/local/bin nerdctl-1.7.0-linux-amd64.tar.gz
rm nerdctl-1.7.0-linux-amd64.tar.gz

# Verify installation
nerdctl --version
```

#### Generate Kubeconfig for External Access

```bash
# On remote cluster, create external kubeconfig
kubectl config view --raw > /tmp/external-kubeconfig.yaml

# Get cluster's external IP
EXTERNAL_IP=$(curl -s ifconfig.me)
echo "Cluster external IP: $EXTERNAL_IP"

# Replace localhost with external IP
sed -i "s|https://127.0.0.1:6443|https://$EXTERNAL_IP:6443|" /tmp/external-kubeconfig.yaml

# Skip TLS verification (development only!)
kubectl config set-cluster cluster.local \
  --insecure-skip-tls-verify=true \
  --kubeconfig /tmp/external-kubeconfig.yaml

# Test from remote host
KUBECONFIG=/tmp/external-kubeconfig.yaml kubectl get nodes
```

#### Copy Kubeconfig to Local Machine

```bash
# From your local machine
scp -i ~/.ssh/your-key root@<CLUSTER_IP>:/tmp/external-kubeconfig.yaml ~/.kube/remote-cluster-config

# Set KUBECONFIG
export KUBECONFIG=~/.kube/remote-cluster-config

# Test connection
kubectl get nodes
```

### Local Setup

#### STEP 1 - Navigate to SSH Directory

```bash
cd ~/go/src/github.com/akash-network/provider/_run/ssh
```

#### STEP 2 - Configure Environment

Edit `.envrc`:

```bash
vim .envrc
```

Add/verify these settings:

```bash
source_up .envrc
dotenv_if_exists dev.env

AP_RUN_NAME=$(basename "$(pwd)")
AP_RUN_DIR="${DEVCACHE_RUN}/${AP_RUN_NAME}"

export AKASH_HOME="${AP_RUN_DIR}/.akash"
export AKASH_KUBECONFIG=$KUBECONFIG
export AP_KUBECONFIG=$KUBECONFIG
export AP_RUN_NAME
export AP_RUN_DIR
export KUBE_SSH_NODES="root@<YOUR_CLUSTER_IP>"
```

Reload environment:

```bash
direnv allow

# Verify
echo "KUBE_SSH_NODES: $KUBE_SSH_NODES"
echo "KUBECONFIG: $KUBECONFIG"
```

#### STEP 3 - Initialize Environment

```bash
make init
```

#### STEP 4 - Set Up Remote Cluster

**For standard workloads:**

```bash
KUBE_ROLLOUT_TIMEOUT=300 make kube-cluster-setup
```

**For GPU workloads:**

```bash
KUBE_ROLLOUT_TIMEOUT=300 make kube-cluster-setup-gpu
```

**What this does:**
- Creates namespaces
- Sets up ingress controller
- Installs Helm charts
- Configures GPU support (if GPU target)

#### STEP 5 - Start Services

Run these in separate terminals:

**Terminal 1 - Start Node:**

```bash
cd ~/go/src/github.com/akash-network/provider/_run/ssh
export KUBECONFIG=~/.kube/remote-cluster-config
direnv reload

make node-run
```

**Terminal 2 - Create Provider:**

```bash
cd ~/go/src/github.com/akash-network/provider/_run/ssh
export KUBECONFIG=~/.kube/remote-cluster-config
direnv reload

make provider-create
```

**Terminal 3 - Run Provider:**

```bash
cd ~/go/src/github.com/akash-network/provider/_run/ssh
export KUBECONFIG=~/.kube/remote-cluster-config
direnv reload

make provider-run
```

#### STEP 6 - Test Deployment

Same commands as local Kind cluster:

```bash
make deployment-create
make query-deployments
make lease-create
make send-manifest
make provider-lease-status
```

### SSH Cluster Troubleshooting

**SSH Permission Denied:**
- Verify SSH key is loaded: `ssh-add -l`
- Test SSH access: `ssh root@<CLUSTER_IP>`

**Kubeconfig Access Issues:**
- Verify external IP is reachable
- Check firewall rules for port 6443
- Ensure TLS verification is skipped

**Image Upload Failures:**
- Verify nerdctl is installed on nodes
- Check containerd is running
- Test: `ssh root@<CLUSTER_IP> nerdctl version`

**Timeout Errors:**
- Increase timeout: `KUBE_ROLLOUT_TIMEOUT=600`
- Check network latency
- Verify cluster resources

### Reset SSH Environment

```bash
cd ~/go/src/github.com/akash-network/provider/_run/ssh
make init
```

---

### Common Make Targets

Once any runbook is set up, these commands work across all environments:

**Deployment Commands:**
```bash
make deployment-create      # Create test deployment
make deployment-update      # Update deployment
make deployment-close       # Close deployment
```

**Query Commands:**
```bash
make query-deployments      # List all deployments
make query-orders           # List orders
make query-bids             # List bids
make query-leases           # List leases
make query-providers        # List providers
```

**Lease Commands:**
```bash
make lease-create           # Create lease from bid
make send-manifest          # Send manifest to provider
make provider-lease-status  # Check lease status
make provider-lease-logs    # View deployment logs
make provider-lease-ping    # Test connectivity
```

**Provider Commands:**
```bash
make provider-create        # Register provider
make provider-run           # Start provider service
make provider-stop          # Stop provider
```

**Node Commands:**
```bash
make node-run               # Start local node
make node-stop              # Stop node
```

---

### Troubleshooting

#### Common Issues

**Docker not running:**
```bash
# macOS
open -a Docker

# Linux
sudo systemctl start docker
```

**Direnv not loading:**
```bash
# Check hook is configured
grep direnv ~/.zshrc

# If missing
echo 'eval "$(direnv hook zsh)"' >> ~/.zshrc
source ~/.zshrc

# Allow in project
direnv allow
```

**Port already in use:**
```bash
# Find process using port
lsof -i :8080  # or other port

# Kill process
kill -9 <PID>
```

**Kind cluster won't start:**
```bash
# List existing clusters
kind get clusters

# Delete old cluster
kind delete cluster --name akash

# Retry setup
make kube-cluster-setup
```

**Build fails with Go version error:**
```bash
# Set Go version
export GOVERSION_SEMVER=v1.24.2

# Verify
echo $GOVERSION_SEMVER

# Retry build
make kube-cluster-setup
```

**Provider won't connect to node:**
- Verify node is running in terminal2
- Check node logs for errors
- Ensure provider was created: `make query-providers`

**No bids on deployment:**
- Check provider is running in terminal3
- Verify provider attributes match deployment requirements
- Check provider logs for errors

#### Debug Commands

```bash
# Check cluster status
kubectl get nodes
kubectl get pods --all-namespaces

# Check kind cluster
kind get clusters
docker ps

# View provider logs
make provider-logs

# View node logs  
make node-logs

# Check blockchain status
make query-block-results
```

---

### Advanced Topics

#### Custom SDL Files

Place custom SDL files in `_run/kube/deployment.yaml` (or ssh/single):

```yaml
version: "2.0"
services:
  web:
    image: nginx:latest
    expose:
      - port: 80
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
          size: 512Mi
  placement:
    akash:
      pricing:
        web:
          denom: uakt
          amount: 1000
deployment:
  web:
    akash:
      profile: web
      count: 1
```

Then deploy:

```bash
make deployment-create
```

#### Testing Different Scenarios

**Test bid rejection:**
```bash
# Set very low pricing
DSEQ=1 make deployment-create
# Provider should reject bid
```

**Test multiple deployments:**
```bash
DSEQ=1 make deployment-create
DSEQ=2 make deployment-create
DSEQ=3 make deployment-create
make query-deployments
```

**Test deployment updates:**
```bash
make deployment-create
# Modify deployment.yaml
make deployment-update
```

---

### Next Steps

**After setup:**
- Explore `_run/kube/Makefile` to see all available targets
- Read provider logs to understand bidding logic
- Experiment with different SDL configurations
- Test various deployment scenarios

**Other Development Guides:**
- **[Console & Website Setup](/docs/for-developers/contributing/console-website-setup)** - Web development (easier)
- **[Getting Started](/docs/for-developers/contributing/getting-started)** - Make your first contribution
- **[Code Conventions](/docs/for-developers/contributing/code-conventions)** - Coding standards

**Resources:**
- **[Node Repository](https://github.com/akash-network/node)** - Blockchain node source
- **[Provider Repository](https://github.com/akash-network/provider)** - Provider services source


## Editor Setup

### VS Code (Recommended)

**Install Go extension:**

```bash
code --install-extension golang.go
```

**Workspace settings** (`.vscode/settings.json`):

```json
{
  "go.formatTool": "goimports",
  "go.lintTool": "golangci-lint",
  "go.useLanguageServer": true,
  "editor.formatOnSave": true,
  "[go]": {
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
      "source.organizeImports": true
    }
  },
  "go.testFlags": ["-v"],
  "go.testTimeout": "10s"
}
```

### GoLand (Recommended for Go Development)

1. **Open provider or node directory**
2. **Configure Go SDK** - Point to your Go 1.25+ installation
3. **Enable gofmt on save** - Settings → Tools → File Watchers
4. **Set up golangci-lint** - Settings → Tools → golangci-lint
5. **Configure Kubernetes** - Settings → Languages & Frameworks → Kubernetes
6. **Enable Direnv** - Settings → Plugins → Install Direnv plugin

---

## Common Development Tools

### Make Commands

All Akash Go projects use Makefiles:

```bash
# View all available commands
make help

# Run tests
make test

# Run linter
make lint

# Build binaries
make build

# Clean build artifacts
make clean

# Install dependencies
make cache
```

### Git Workflow

```bash
# Keep your fork updated
git fetch upstream
git checkout main
git merge upstream/main

# Create feature branch
git checkout -b feature/your-feature

# Make changes, commit, push
git add .
git commit -s -m "feat: your change"
git push origin feature/your-feature
```

### Testing

**Run all tests:**
```bash
make test
```

**Run specific package tests:**
```bash
go test ./pkg/specific-package
go test ./bidengine/...
```

**Run with coverage:**
```bash
make test-coverage
```

**Integration tests:**
```bash
make test-integration
```

**Verbose output:**
```bash
go test -v ./...
```

---

## Troubleshooting

### "Command not found" Errors

**Problem:** `go`, `make`, or `node` not in PATH

**Solution:**
```bash
# macOS - Add to ~/.zshrc
export PATH=$PATH:/usr/local/go/bin:$HOME/go/bin

# Linux - Add to ~/.bashrc
export PATH=$PATH:/usr/local/go/bin:$HOME/go/bin

# Reload
source ~/.zshrc  # or ~/.bashrc
```

### Make Version Too Old (macOS)

**Problem:** `make: unrecognized option '--version'`

**Solution:**
```bash
brew install make
export PATH="/usr/local/opt/make/libexec/gnubin:$PATH"
```

### Go Module Issues

**Problem:** `go: module not found`

**Solution:**
```bash
# Clear module cache
go clean -modcache

# Re-download dependencies
go mod download

# Verify go.mod
go mod verify
```

### Direnv Not Working

**Problem:** Environment variables not loading

**Solution:**
```bash
# Re-allow direnv
direnv allow

# Check hook is installed
grep direnv ~/.zshrc  # or ~/.bashrc

# If missing, add:
eval "$(direnv hook zsh)"  # or bash
```

### Port Already in Use

**Problem:** Dev server won't start (port 3000 or 4321)

**Solution:**
```bash
# Find process using port
lsof -i :3000  # or :4321

# Kill process
kill -9 <PID>

# Or use different port
npm run dev -- --port 3001
```

### Permission Denied

**Problem:** Can't write to directories

**Solution:**
```bash
# Fix ownership (macOS/Linux)
sudo chown -R $USER:$USER ~/path/to/repo

# Or use sudo for npm (not recommended)
# Instead, fix npm permissions:
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

---

## IDE Debugging

### VS Code - Go Debugging

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Package",
      "type": "go",
      "request": "launch",
      "mode": "auto",
      "program": "${fileDirname}"
    },
    {
      "name": "Attach to Process",
      "type": "go",
      "request": "attach",
      "mode": "local",
      "processId": "${command:pickProcess}"
    }
  ]
}
```

### VS Code - Node.js Debugging

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Next.js: debug server-side",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "port": 9229
    }
  ]
}
```

---

## Performance Tips

### Speed Up Go Builds

```bash
# Use build cache
export GOCACHE=$HOME/.cache/go-build

# Parallel builds
make -j8 build
```

### Speed Up npm installs

```bash
# Use pnpm (faster alternative)
npm install -g pnpm
pnpm install

# Or use npm ci for clean installs
npm ci
```

---

## Next Steps

Environment set up? Great!

- **[Getting Started](/docs/for-developers/contributing/getting-started)** - Make your first contribution
- **[Code Conventions](/docs/for-developers/contributing/code-conventions)** - Learn coding standards
- **[Pull Request Process](/docs/for-developers/contributing/pull-request-process)** - Submit your changes

---

**Need help?** Ask in [Discord #developers](https://discord.akash.network)!
