# AI Documentation Writing Guide for Akash Network

**Purpose:** This guide provides AI models (Claude Sonnet 4.5+) with precise instructions for writing documentation that matches the Akash Network style, structure, and quality standards.

**Last Updated:** December 3, 2024

---

## Core Principles

### 1. Accuracy Over Speed
- Verify all version numbers against official sources
- Test all commands before documenting them
- Never assume or hallucinate technical details
- When uncertain, mark content for human verification

### 2. Clarity Over Cleverness
- Use simple, direct language
- Active voice preferred
- No unnecessary jargon
- Define technical terms on first use

### 3. Structure Over Style
- Follow consistent patterns for similar content types
- Use standard headings and organization
- Maintain hierarchy (never skip heading levels)
- Separate concerns (operators vs developers)

### 4. User Focus
- Write for the specified audience (beginners vs experts)
- Provide context before commands
- Explain "why" before "how"
- Include troubleshooting and verification steps

---

## File Metadata

### Required Frontmatter Structure

Every `.md` or `.mdx` file must begin with YAML frontmatter:

```yaml
---
categories: ["Section", "Subsection"]
tags: ["Topic1", "Topic2", "Topic3"]
title: "Full Page Title"
linkTitle: "Sidebar Title"
weight: 0
description: "SEO-friendly description for cards and search results"
---
```

**Field Requirements:**

| Field | Required | Type | Purpose | Example |
|-------|----------|------|---------|---------|
| `categories` | Yes | Array | Breadcrumb navigation | `["For Providers", "Setup & Installation"]` |
| `tags` | No | Array | Related topics | `["Kubernetes", "GPU", "Hardware"]` |
| `title` | Yes | String | H1 heading, SEO | `"Hardware Requirements"` |
| `linkTitle` | No | String | Sidebar (if title too long) | `"Hardware"` |
| `weight` | No | Number | Sidebar ordering (lower = higher) | `2` |
| `description` | Yes | String | SEO, preview cards | `"Hardware specifications for providers"` |

### File Extension Rules

- `.md` - Standard Markdown (most files)
- `.mdx` - Markdown with React components (when using `<CodeTabs>`)

**When to use `.mdx`:**
- File imports React components (`CodeTabs`, custom components)
- Multi-language code examples needed
- Interactive elements required

**When to use `.md`:**
- All other documentation (95% of files)
- Simple guides without code tabs
- Conceptual content

---

## Document Structure Pattern

### Standard Page Template

```markdown
---
categories: ["Section", "Subsection"]
tags: ["Tag1", "Tag2"]
title: "Page Title"
description: "Brief description"
---

[1-2 sentence introduction about what this page covers]

---

## Section 1: [Purpose]

[Content for section 1]

### Subsection 1A

[Detailed content]

---

## Section 2: [Purpose]

[Content for section 2]

---

## Related Resources

- [Link 1](/docs/path/to/page)
- [Link 2](/docs/path/to/page)
```

**Key Structural Rules:**

1. **Always use `---` horizontal rules** between major sections
2. **Heading hierarchy:** `##` for main sections, `###` for subsections
3. **Never skip levels:** No `##` → `####`
4. **End with Related Resources** section linking to related docs
5. **Introduction before first heading** (after frontmatter)

---

## Section Types and Patterns

### Setup/Installation Guide Pattern

```markdown
---
title: "Installing [Component]"
description: "Step-by-step guide to install [component]"
---

Brief description of what will be installed and why.

---

## Prerequisites

Before starting, ensure you have:
- Requirement 1
- Requirement 2
- Requirement 3

**Time Estimate:** X hours

---

## STEP 1: [Action Name]

Brief explanation of what this step accomplishes.

**On the [control plane/worker] node:**

\```bash
# Comment explaining command
command-here
\```

**Expected output:**
\```
output-here
\```

Verify the step:
\```bash
verification-command
\```

---

## STEP 2: [Action Name]

[Repeat pattern]

---

## Verification

[Final verification steps]

---

## Troubleshooting

### Issue: [Common Problem]

**Symptoms:**
- Symptom 1
- Symptom 2

**Solution:**

\```bash
solution-command
\```

---

## Related Resources

- [Link 1](/docs/...)
- [Link 2](/docs/...)
```

**Critical Elements:**
- Number steps clearly: `STEP 1`, `STEP 2`, etc.
- Include "Expected output" for non-obvious commands
- Add verification commands after changes
- Use `---` horizontal rules between steps
- Always include Prerequisites section
- Always include Troubleshooting section

### Architecture/Concept Pattern

```markdown
---
title: "[Component] Architecture"
description: "Technical overview of [component] internals"
---

Brief overview of the component's purpose and role.

---

## Overview

High-level explanation of the component.

**Key responsibilities:**
- Responsibility 1
- Responsibility 2
- Responsibility 3

---

## [Subsystem] Architecture

### [Aspect 1]

Technical details about this aspect.

**Source code:** `path/to/file.go`

### [Aspect 2]

Technical details about this aspect.

---

## Integration Points

How this component interacts with others.

---

## Related Resources

- [Related Architecture Doc](/docs/...)
- [Source Code](https://github.com/...)
```

**Critical Elements:**
- Focus on "how it works" not "how to use it"
- Include source code references
- Explain design decisions
- No operational commands (kubectl, systemctl, etc.)
- Link to related architecture docs, not setup guides

### Troubleshooting Pattern

```markdown
## Troubleshooting

### Issue: [Problem Name]

**Symptoms:**
- Observable symptom 1
- Observable symptom 2

**Diagnosis:**

\```bash
diagnostic-command
\```

**Solution:**

\```bash
solution-command
\```

**Explanation:** [Why this fixes it]

---

### Issue: [Next Problem]

[Repeat pattern]
```

---

## Code Block Standards

### Command Line Examples

**Format:**
```markdown
\```bash
# Explanatory comment
command arg1 arg2
\```
```

**Rules:**
- Always use `bash` language tag
- Include explanatory comments for non-obvious commands
- NO `$` prompts
- NO `sudo su` (use `sudo` per-command)
- Group related commands with comments
- Show one logical action per code block

**Example:**
```markdown
\```bash
# Update package lists
sudo apt update

# Install required packages
sudo apt install -y package1 package2
\```
```

**NOT:**
```markdown
\```
$ sudo su
# apt update
# apt install package1
\```
```

### Multi-Language Code Examples

**When to use:** API/SDK examples that support multiple languages

**File must be `.mdx`**

**Pattern:**
```typescript
---
title: "API Example"
---

import CodeTabs from "@/components/docs/CodeTabs";

## Example: [What This Does]

Brief explanation of the example.

<CodeTabs
  client:load
  examples={[
    {
      language: "bash",
      label: "cURL",
      code: `curl -X GET "https://api.endpoint.com/path" \\
  -H "accept: application/json"`
    },
    {
      language: "go",
      code: `package main

import (
    "context"
    "fmt"
    
    "pkg.akt.dev/go/node/provider/v1"
)

func main() {
    client, _ := provider.NewQueryClient(conn)
    res, _ := client.Providers(context.Background(), &provider.QueryProvidersRequest{})
    fmt.Println(res)
}`
    },
    {
      language: "typescript",
      label: "TypeScript",
      code: `import { akash } from "@akashnetwork/chain-sdk";

const queryClient = await akash.ClientFactory.createRPCQueryClient({ 
  rpcEndpoint: "https://rpc.akash.network:443" 
});

const response = await queryClient.akash.provider.v1.providers({});
console.log(response);`
    }
  ]}
/>
```

**CodeTabs Requirements:**

1. **Import statement:** `import CodeTabs from "@/components/docs/CodeTabs";`
2. **Component props:**
   - `client:load` (Astro hydration directive)
   - `examples` array with objects containing:
     - `language` (required): Syntax highlighting
     - `label` (optional): Tab label (defaults to language name)
     - `code` (required): Code string (use backticks for template literals)

3. **Language order:** Always `bash` (cURL/grpcurl), `go`, `typescript`

4. **Language standards:**
   - **Bash:** Use `curl` or `grpcurl`, include all headers
   - **Go:** Include proper imports, use `pkg.akt.dev/go` for Akash SDK
   - **TypeScript:** Use `@akashnetwork/chain-sdk`, include proper imports

### Configuration Files

**Pattern:**
```markdown
\```yaml
# filename.yaml
key: value
nested:
  key: value
  
# Comment explaining section
section:
  option: value
\```
```

**Rules:**
- Include filename as comment (first line)
- Add comments for clarity
- Show complete working examples when possible
- Use `...` to truncate large sections
- Maintain proper YAML indentation

---

## Version Standards

### Current Official Versions

**ALWAYS use these current versions. Do not hallucinate or guess.**

#### Kubernetes Infrastructure
- **Kubernetes:** `1.33.5` (via Kubespray 2.29.1)
- **etcd:** `3.5.22`
- **containerd:** `2.1.4`
- **Calico CNI:** `3.30.3`

#### Akash
- **Akash Node:** `v1.1.0`
- **Provider Services:** `v0.5.4+`
- **Omnibus Image:** `ghcr.io/akash-network/cosmos-omnibus:v1.2.35-akash-v1.1.0`
- **Chain ID:** `akashnet-2`
- **Gas Price:** `0.025uakt` (NOT 0.0025uakt - common error)

#### GPU & Storage
- **NVIDIA Driver:** `580` (recommended)
- **NVIDIA Device Plugin:** `v0.18.0`
- **NVIDIA CDI:** Strategy `cdi-cri` (NOT `nvidia-docker`)
- **Rook-Ceph:** `v1.18.7`
- **Cert-Manager:** `v1.19.1`

#### Operating Systems
- **Ubuntu:** `24.04 LTS` (only officially supported OS)

#### Storage Classes
- **beta1:** HDD (default, cheapest)
- **beta2:** SSD (faster)
- **beta3:** NVMe (fastest)
- **ram:** SHM (NOT persistent storage)

#### CLI Commands
- **Deployments:** Use `provider-services tx deployment ...` (provider-services includes all akash CLI commands)
- **Queries:** Use `provider-services query ...`
- **Provider-Specific:** Use `provider-services` commands like `manifest`, `lease-status`, `lease-logs`
- **Note:** `provider-services` is a superset of `akash` CLI - it includes all blockchain commands plus provider operations

### When Versions Update

If writing documentation and official versions have changed:
1. Update this guide first
2. Update all affected documentation
3. Use `grep -r "old-version" src/content/Docs/` to find all occurrences
4. Test with new versions before documenting

---

## Formatting Standards

### Emphasis Rules

| Use Case | Syntax | Example |
|----------|--------|---------|
| Important terms | `**bold**` | `**Important:** Backup your keys` |
| Commands | `` `backticks` `` | `kubectl get pods` |
| File names | `` `backticks` `` | `provider.yaml` |
| Paths | `` `backticks` `` | `/etc/kubernetes/manifests` |
| Environment variables | `` `backticks` `` | `AKASH_HOME` |
| Package names | `` `backticks` `` | `akash-node` |
| Rare emphasis | `*italics*` | `*Optional:* Skip this step` |

**Never use:**
- ALL CAPS for emphasis (except acronyms)
- Underscores for emphasis
- Excessive bold/italics
- Emoji (unless explicitly requested)

### Callout Standards

Use bold text for callouts (NOT HTML, NOT admonitions):

```markdown
**Important:** This is important information.

**Note:** Additional context here.

**Critical:** Security or data loss warning.

**Tip:** Helpful suggestion.

**When Needed:** Conditional information.
```

**Callout Types:**

| Type | Use Case | Example |
|------|----------|---------|
| `**Important:**` | Must-know information | Required configuration |
| `**Note:**` | Additional context | Optional considerations |
| `**Critical:**` | Security, data loss | Backup private keys |
| `**Tip:**` | Helpful suggestions | Time-saving methods |
| `**When Needed:**` | Conditional info | Alternative approaches |

**Do NOT use:**
- `:::danger` (doesn't render properly)
- `:::warning` (doesn't render properly)
- `:::info` (doesn't render properly)
- `:::note` (doesn't render properly)
- HTML `<div class="warning">` (Markdown preferred)

### Link Standards

**Internal Links:**
```markdown
[Link Text](/docs/section/page)
```

**Rules:**
- ALWAYS start with `/docs/`
- NO `index.md` in path
- NO relative paths (`../`)
- Use absolute paths from docs root

**External Links:**
```markdown
[Link Text](https://full-url.com)
```

**Examples:**
```markdown
✅ GOOD: [Provider Installation](/docs/for-providers/setup-and-installation/kubespray/provider-installation)
❌ BAD:  [Provider Installation](../provider-installation)
❌ BAD:  [Provider Installation](/for-providers/.../provider-installation/index.md)
```

---

## Audience-Specific Guidelines

### Getting Started (Beginners)

**Audience:** Complete beginners, no Akash experience

**Requirements:**
- Explain every step in detail
- Define all technical terms
- Focus on Akash Console (web UI, not CLI)
- Include time estimates for each section
- Add screenshots for UI interactions
- No assumptions about prior knowledge
- Link to advanced guides for details

**Tone:** Friendly, encouraging, patient

**Example:**
```markdown
## What is a Deployment?

A deployment is your application running on the Akash Network. When you 
create a deployment, you're requesting compute resources (CPU, RAM, storage) 
from providers on the network.

Think of it like renting a server, but:
- Pay only for what you use (per-block pricing)
- Choose from multiple providers bidding on your request
- Your app runs in an isolated container
```

### For Developers (Technical Users)

**Audience:** Developers integrating Akash

**Requirements:**
- Assume CLI/programming familiarity
- Focus on concepts and integration patterns
- Provide multi-language examples (curl, Go, TypeScript)
- Link to detailed API reference
- Show best practices and common patterns
- Include error handling

**Tone:** Professional, technical, concise

**Example:**
```markdown
## Query Providers via gRPC

The provider query service returns all registered providers and their attributes.

\```go
client, _ := provider.NewQueryClient(conn)
res, _ := client.Providers(context.Background(), &provider.QueryProvidersRequest{})
\```

Filter by attribute:
\```go
req := &provider.QueryProvidersRequest{
    Filters: &provider.ProviderFilters{
        Attributes: []*v1beta3.Attribute{
            {Key: "region", Value: "us-west"},
        },
    },
}
\```
```

### For Providers (System Administrators)

**Audience:** DevOps engineers, system administrators

**Requirements:**
- Assume Linux/Kubernetes knowledge
- Be precise with commands and versions
- Include all prerequisites
- Provide verification steps
- Add comprehensive troubleshooting
- Emphasize security best practices
- Provide automated solutions first, manual as fallback

**Tone:** Direct, technical, security-conscious

**Example:**
```markdown
## STEP 3: Configure Persistent Storage

Install Rook-Ceph for persistent storage classes (beta1, beta2, beta3).

**Prerequisites:**
- Dedicated drives (not partitions) on each worker node
- Minimum 4 SSDs or 2 NVMe SSDs across cluster
- Drives must be unformatted

\```bash
# Verify available drives (should show no filesystem)
lsblk -f

# Expected: Empty FSTYPE column for target drives
\```

**Important:** Do not use system drives or shared partitions. Rook-Ceph 
requires exclusive access to raw block devices.
```

### For Node Operators (Blockchain Engineers)

**Audience:** Blockchain node operators, validators

**Requirements:**
- Assume blockchain experience
- Focus on node operations and security
- Document upgrade procedures clearly
- Include monitoring and alerting
- Separate architecture (for devs) from operations (for ops)
- Provide recovery procedures

**Tone:** Technical, security-focused, precise

**Example:**
```markdown
## Validator Security with TMKMS

TMKMS (Tendermint Key Management System) separates your validator key 
from the node, adding a critical security layer.

**Architecture:**
- Validator node runs on Akash (no private key)
- TMKMS runs on local machine (holds private key)
- Stunnel provides encrypted communication

**Security benefits:**
- Private key never exposed to remote server
- Double-signing protection (slashing prevention)
- Hardware security module (HSM) support
```

---

## Content Separation Rules

### Architecture vs Operations

**Architecture Documentation** (For Developers):
- How code works internally
- Service structure and design patterns
- Integration points between services
- Source code references
- Design rationale

**Example:**
```markdown
## Bid Engine Architecture

The Bid Engine monitors on-chain orders and generates bids based on 
available cluster resources.

**Event Flow:**
1. EventBus receives `OrderCreated` event
2. Bid Engine validates order requirements
3. Inventory Service provides available resources
4. Bid calculation determines price
5. Bid transaction submitted to chain

**Source code:** `bidengine/service.go`
```

**Operations Documentation** (For Operators):
- How to install/configure
- How to monitor and troubleshoot
- How to perform maintenance
- What commands to run

**Example:**
```markdown
## Monitor Bid Activity

Check bid submissions:

\```bash
provider-services query market bid list --provider=$(provider-services keys show provider -a)
\```

View bid acceptance rate:

\```bash
kubectl logs -n akash-services deployments/akash-provider -f | grep "bid-order"
\```
```

**NEVER mix these:**
- Architecture docs should not have kubectl commands
- Operations docs should not explain code internals
- Keep them in separate sections

---

## Quality Checklist

### Before Generating Documentation

- [ ] Identify the target audience
- [ ] Verify all version numbers are current
- [ ] Check if similar documentation exists (for consistency)
- [ ] Determine `.md` vs `.mdx` requirement

### While Writing

- [ ] Follow the pattern for this content type
- [ ] Use current official versions
- [ ] Include all required frontmatter fields
- [ ] Add horizontal rules between major sections
- [ ] Use proper heading hierarchy
- [ ] Test or verify all commands
- [ ] Include prerequisite section for setup guides
- [ ] Add troubleshooting section
- [ ] End with Related Resources section

### After Writing

- [ ] Check all internal links (start with `/docs/`)
- [ ] Verify code blocks have language tags
- [ ] Ensure consistent terminology
- [ ] Review for appropriate audience level
- [ ] Check for placeholder content
- [ ] Verify callout syntax (bold text, not admonitions)
- [ ] Confirm file extension matches content (.md vs .mdx)

### Final Verification

- [ ] All version numbers current
- [ ] All commands tested or verified
- [ ] All links valid
- [ ] No hallucinated information
- [ ] No placeholder content
- [ ] Appropriate audience level maintained
- [ ] Related Resources section included

---

## Common Mistakes to Avoid

### Technical Errors

❌ **Old gas prices:**
```markdown
BAD:  --gas-prices 0.0025uakt
GOOD: --gas-prices 0.025uakt
```

❌ **Wrong CLI commands:**
```markdown
BAD:  provider-services tx deployment create
GOOD: akash tx deployment create
```

❌ **Old Omnibus images:**
```markdown
BAD:  cosmos-omnibus:v0.4.25-akash-v0.34.0
GOOD: cosmos-omnibus:v1.2.35-akash-v1.1.0
```

❌ **Wrong chain ID:**
```markdown
BAD:  akashnet-1
GOOD: akashnet-2
```

### Structural Errors

❌ **Missing frontmatter:**
```markdown
# Page Title

Content here...
```

✅ **Correct:**
```markdown
---
categories: ["Section"]
title: "Page Title"
description: "Description here"
---

Content here...
```

❌ **Missing horizontal rules:**
```markdown
## Section 1
Content
## Section 2
Content
```

✅ **Correct:**
```markdown
## Section 1

Content

---

## Section 2

Content
```

❌ **Skipping heading levels:**
```markdown
## Section
#### Subsection
```

✅ **Correct:**
```markdown
## Section
### Subsection
```

### Formatting Errors

❌ **Using admonitions:**
```markdown
:::warning
Important information
:::
```

✅ **Use bold text:**
```markdown
**Important:** Important information
```

❌ **Relative links:**
```markdown
[Link](../other-page)
```

✅ **Absolute links:**
```markdown
[Link](/docs/section/other-page)
```

❌ **Command prompts:**
```markdown
\```bash
$ sudo apt update
$ sudo apt install package
\```
```

✅ **Clean commands:**
```markdown
\```bash
sudo apt update
sudo apt install package
\```
```

### Content Errors

❌ **Mixing audiences:**
```markdown
## Architecture Overview

The Bid Engine monitors orders...

To view logs:
\```bash
kubectl logs ...
\```
```

✅ **Separate concerns:**
```markdown
Architecture doc: Explain how it works
Operations doc: Show kubectl commands
```

❌ **Assuming without verifying:**
```markdown
"The minimum RAM requirement is 0.5 GB"
```

✅ **Verify first:**
```markdown
(Check actual minimums, then document accurately)
```

---

## Examples by Document Type

### Example 1: Setup Guide

```markdown
---
categories: ["For Providers", "Setup & Installation", "Kubespray"]
tags: ["Kubernetes", "Installation", "Setup"]
title: "Kubernetes Cluster Setup"
linkTitle: "Kubernetes Setup"
weight: 1
description: "Build a production Kubernetes cluster using Kubespray for Akash Provider"
---

Set up a production-ready Kubernetes cluster using Kubespray.

---

## Prerequisites

Before starting, ensure you have:
- 3+ servers running Ubuntu 24.04 LTS
- 8+ GB RAM per server
- SSH access to all servers
- Python 3.8+ installed locally

**Time Estimate:** 1-2 hours

---

## STEP 1: Generate SSH Keys

Generate an Ed25519 SSH key for cluster management.

**On your local machine:**

\```bash
ssh-keygen -t ed25519 -f ~/.ssh/akash-cluster -N ""
\```

**Expected output:**
\```
Generating public/private ed25519 key pair.
Your identification has been saved in /home/user/.ssh/akash-cluster
Your public key has been saved in /home/user/.ssh/akash-cluster.pub
\```

Copy the public key to each node:

\```bash
ssh-copy-id -i ~/.ssh/akash-cluster.pub user@node-ip
\```

Verify SSH access:

\```bash
ssh -i ~/.ssh/akash-cluster user@node-ip
\```

---

## STEP 2: Install Kubespray

[Continue with remaining steps...]

---

## Verification

Verify cluster is operational:

\```bash
kubectl get nodes
\```

**Expected output:**
\```
NAME     STATUS   ROLES           AGE   VERSION
node1    Ready    control-plane   5m    v1.33.5
node2    Ready    <none>          5m    v1.33.5
node3    Ready    <none>          5m    v1.33.5
\```

---

## Troubleshooting

### Issue: Kubespray Fails to Deploy

**Symptoms:**
- Ansible playbook fails
- Error: "Failed to download kubeadm"

**Solution:**

Check internet connectivity on nodes:
\```bash
ping -c 4 8.8.8.8
\```

Verify firewall allows outbound HTTPS:
\```bash
curl -I https://github.com
\```

---

## Related Resources

- [GPU Support](/docs/for-providers/setup-and-installation/kubespray/gpu-support)
- [Provider Installation](/docs/for-providers/setup-and-installation/kubespray/provider-installation)
- [Hardware Requirements](/docs/for-providers/getting-started/hardware-requirements)
```

### Example 2: Architecture Document

```markdown
---
categories: ["For Providers", "Architecture"]
tags: ["Architecture", "Cluster", "Kubernetes"]
title: "Cluster Service Architecture"
linkTitle: "Cluster Service"
weight: 3
description: "Technical overview of the Cluster Service and Kubernetes integration"
---

The Cluster Service manages the Kubernetes lifecycle of tenant deployments.

---

## Overview

The Cluster Service acts as the bridge between Akash leases and Kubernetes resources.

**Key responsibilities:**
- Translate SDL manifests to Kubernetes resources
- Monitor deployment health and resource usage
- Enforce resource limits and quotas
- Report inventory to the Inventory Operator

---

## Service Architecture

### Initialization

The Cluster Service initializes with:

\```go
// cluster/service.go
func NewService(ctx context.Context, client kubernetes.Interface) Service {
    return &service{
        client: client,
        inventory: inventory.NewOperator(client),
    }
}
\```

**Source code:** `cluster/service.go:45-52`

### Deployment Lifecycle

1. **Manifest Received** - From Manifest Service
2. **Resource Translation** - SDL → Kubernetes YAML
3. **Deployment Creation** - Applied to cluster
4. **Health Monitoring** - Continuous status checks
5. **Lease Closure** - Resource cleanup

---

## Resource Management

### Translation Process

The Cluster Service translates SDL service definitions to Kubernetes Deployments:

\```go
// cluster/kube/builder/deployment.go
func (b *deploymentBuilder) create() (*appsv1.Deployment, error) {
    return &appsv1.Deployment{
        ObjectMeta: b.buildObjectMeta(),
        Spec: appsv1.DeploymentSpec{
            Replicas: &b.replicas,
            Template: b.buildPodTemplate(),
        },
    }, nil
}
\```

**Key mappings:**
- SDL `cpu` → Kubernetes `resources.requests.cpu`
- SDL `memory` → Kubernetes `resources.requests.memory`
- SDL `storage` → PersistentVolumeClaim
- SDL `expose` → Service + Ingress

---

## Integration Points

**Upstream:**
- Receives manifests from Manifest Service
- Receives inventory queries from Bid Engine

**Downstream:**
- Deploys to Kubernetes API
- Queries Inventory Operator for capacity

**PubSub Events:**
- Publishes `InventoryUpdate` on resource changes
- Subscribes to `LeaseCreated` and `LeaseClosed`

---

## Related Resources

- [Manifest Service Architecture](/docs/for-providers/architecture/manifest-service)
- [Inventory Operator](/docs/for-providers/architecture/operators/inventory)
- [Provider Service Overview](/docs/for-providers/architecture)
```

### Example 3: API Example with CodeTabs

```markdown
---
categories: ["For Developers", "API Protocols"]
tags: ["API", "gRPC", "SDK"]
title: "gRPC Services"
linkTitle: "gRPC"
weight: 1
description: "Access Akash blockchain data and services via gRPC"
---

import CodeTabs from "@/components/docs/CodeTabs";

Query blockchain data and submit transactions using gRPC.

---

## Overview

Akash exposes gRPC services for all blockchain queries and transactions.

**Endpoint:** `grpc.akash.network:443`

**Available services:**
- Provider queries
- Deployment lifecycle
- Market operations
- Account management

---

## Query Providers

Retrieve all registered providers on the network.

<CodeTabs
  client:load
  examples={[
    {
      language: "bash",
      label: "grpcurl",
      code: `grpcurl -d '{}' \\
  grpc.akash.network:443 \\
  akash.provider.v1.Query/Providers`
    },
    {
      language: "go",
      code: `package main

import (
    "context"
    "fmt"
    
    "pkg.akt.dev/go/node/provider/v1"
    "google.golang.org/grpc"
)

func main() {
    conn, _ := grpc.Dial("grpc.akash.network:443", grpc.WithTransportCredentials(credentials.NewTLS(&tls.Config{})))
    defer conn.Close()
    
    client := provider.NewQueryClient(conn)
    res, _ := client.Providers(context.Background(), &provider.QueryProvidersRequest{})
    
    fmt.Printf("Found %d providers\\n", len(res.Providers))
}`
    },
    {
      language: "typescript",
      label: "TypeScript",
      code: `import { akash } from "@akashnetwork/chain-sdk";

const queryClient = await akash.ClientFactory.createRPCQueryClient({ 
  rpcEndpoint: "https://rpc.akash.network:443" 
});

const response = await queryClient.akash.provider.v1.providers({});
console.log(\`Found \${response.providers.length} providers\`);`
    }
  ]}
/>

**Response:**

\```json
{
  "providers": [
    {
      "owner": "akash1...",
      "host_uri": "https://provider.example.com",
      "attributes": [...]
    }
  ]
}
\```

---

## Filter Providers by Attribute

Query providers with specific attributes (e.g., region, GPU capabilities).

<CodeTabs
  client:load
  examples={[
    {
      language: "bash",
      label: "grpcurl",
      code: `grpcurl -d '{
  "filters": {
    "attributes": [
      {"key": "region", "value": "us-west"}
    ]
  }
}' \\
  grpc.akash.network:443 \\
  akash.provider.v1.Query/Providers`
    },
    {
      language: "go",
      code: `req := &provider.QueryProvidersRequest{
    Filters: &provider.ProviderFilters{
        Attributes: []*v1beta3.Attribute{
            {Key: "region", Value: "us-west"},
        },
    },
}

res, _ := client.Providers(context.Background(), req)`
    },
    {
      language: "typescript",
      label: "TypeScript",
      code: `const response = await queryClient.akash.provider.v1.providers({
  filters: {
    attributes: [
      { key: "region", value: "us-west" }
    ]
  }
});`
    }
  ]}
/>

---

## Related Resources

- [REST API](/docs/for-developers/api-protocols/rest-api)
- [RPC Endpoints](/docs/for-developers/api-protocols/rpc-endpoints)
- [Akash SDK](/docs/for-developers/deployment/akash-sdk)
```

---

## Validation Process

### Self-Check Before Generating

Ask yourself:

1. **Audience:** Who is this for? (Beginner, developer, provider, node operator)
2. **Purpose:** Setup guide, concept explanation, API reference, troubleshooting?
3. **Structure:** Does it follow the appropriate pattern?
4. **Versions:** Are all version numbers current and verified?
5. **Testing:** Have I verified commands work?
6. **Links:** Are all internal links absolute paths from `/docs/`?
7. **Completeness:** Prerequisites, troubleshooting, related resources included?

### Human Review Required

Mark these items for human verification:

- [ ] **Version numbers** - Verify against official sources
- [ ] **Commands** - Test in actual environment
- [ ] **Time estimates** - Validate with real users
- [ ] **Hardware requirements** - Confirm minimums/recommendations
- [ ] **External URLs** - Check for 404s
- [ ] **Technical claims** - Verify against source code/official docs

---

## Model-Specific Instructions

### For Claude Sonnet 4.5+

When writing Akash Network documentation:

1. **Load this guide** as context before generating content
2. **Verify versions** - Use the version table in this guide
3. **Follow patterns** - Use the templates for the content type
4. **Check frontmatter** - Every file needs proper YAML metadata
5. **Test structure** - Headings, links, code blocks must follow rules
6. **Mark uncertainties** - Flag items needing human verification
7. **Be precise** - Technical accuracy over completion speed

### Output Format

Generate documentation as:

```markdown
---
[Valid YAML frontmatter]
---

[Content following appropriate pattern]
```

Then provide:

```markdown
## Human Review Required

- [ ] Item 1 needing verification
- [ ] Item 2 needing verification
```

---

## Updates and Maintenance

**This guide is updated:** December 3, 2024

**When to update this guide:**
- Official version numbers change
- New components added (e.g., new operator)
- Documentation patterns change
- New features require new patterns

**How to update:**
1. Update version table
2. Update examples if needed
3. Update patterns if needed
4. Update last updated date
5. Notify AI users of changes

---

## Community and Support

**IMPORTANT:** Akash Network does **NOT** have a forum. Do not add forum links to documentation.

**Official Support Channels:**
- **Discord:** [discord.akash.network](https://discord.akash.network) - Primary community support
- **GitHub:** [github.com/akash-network](https://github.com/akash-network) - Issues and discussions
- **Documentation:** This website

**Questions?** Contact the documentation team via Discord #docs channel or open an issue on GitHub.

