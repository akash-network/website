---
categories: ["Developers", "Contributing"]
tags: ["Contributing", "Documentation", "Writing"]
weight: 6
title: "Documentation Writing Guide"
linkTitle: "Documentation Guide"
description: "Guidelines for writing and improving Akash Network documentation"
---

**Write clear, helpful documentation that serves all Akash users.**

This guide covers how to contribute to Akash documentation, including style guidelines, structure, and best practices.

---

## Why Documentation Matters

Good documentation:
- **Reduces support burden** - Fewer questions in Discord
- **Improves onboarding** - New users get started faster
- **Builds trust** - Professional docs signal project quality
- **Enables growth** - Users can self-serve and scale

**Documentation is code** - Treat it with the same care and rigor.

---

## Getting Started

### Documentation Repository

All documentation lives at [github.com/akash-network/website](https://github.com/akash-network/website)

**Structure:**
```
src/content/Docs/
├── getting-started/          # New user guides
├── for-developers/           # Developer documentation
│   ├── deployment/           # Deployment methods
│   ├── contributing/         # Contributing guides
│   └── ...
├── for-providers/            # Provider documentation
├── for-node-operators/       # Validator/node docs
└── learn/                    # Educational content
```

### Setup

```bash
# Fork and clone
git clone https://github.com/YOUR-USERNAME/website.git
cd website

# Install dependencies
npm install

# Run dev server
npm run dev

# Visit http://localhost:4321
```

---

## Finding Documentation to Improve

### Where to Start

1. **Browse [GitHub Issues](https://github.com/akash-network/website/issues)**
   - Look for `documentation` label
   - Check `good first issue` for beginners

2. **Read the docs as a new user**
   - Follow tutorials
   - Try examples
   - Note what's confusing

3. **Listen to community questions**
   - Check Discord #general and #support
   - Frequent questions = missing docs

4. **Review existing content**
   - Fix typos
   - Update outdated information
   - Improve clarity

---

## Documentation Types

### 1. Tutorials

**Purpose:** Teach a specific task step-by-step

**Structure:**
```markdown
# Task Title

Brief introduction to what they'll learn.

## Prerequisites
- List what they need before starting

## Step 1: First Action
Clear instructions with commands

## Step 2: Next Action
Continue with next logical step

## Verify
How to confirm it worked

## Next Steps
Where to go from here
```

**Example:** [CLI Installation Guide](/docs/developers/deployment/cli/installation-guide)

### 2. How-To Guides

**Purpose:** Solve a specific problem

**Structure:**
```markdown
# How to [Do Something]

Problem statement and use case.

## Quick Solution
TL;DR for experienced users

## Detailed Steps
1. Step one
2. Step two
3. Step three

## Troubleshooting
Common issues and solutions

## Related
Links to related guides
```

**Example:** [Update a Deployment](/docs/developers/deployment/cli/common-tasks#update-a-deployment)

### 3. Reference Documentation

**Purpose:** Comprehensive technical details

**Structure:**
```markdown
# [Component] Reference

Overview and purpose.

## API / Commands
Complete list with syntax

## Parameters
All options explained

## Examples
Code samples

## Error Handling
Common errors and solutions
```

**Example:** [CLI Commands Reference](/docs/developers/deployment/cli/commands-reference)

### 4. Explanations

**Purpose:** Explain concepts and architecture

**Structure:**
```markdown
# Understanding [Concept]

What is it and why it matters.

## How It Works
Technical explanation

## Use Cases
When to use it

## Best Practices
Recommended approaches

## Learn More
Further reading
```

**Example:** [Core Concepts](/docs/getting-started/core-concepts)

---

## Writing Style

### Voice and Tone

**Use:**
- ✅ **Active voice** - "The provider accepts bids" not "Bids are accepted"
- ✅ **Second person** - "You deploy" not "Users deploy" or "One deploys"
- ✅ **Present tense** - "The CLI creates" not "The CLI will create"
- ✅ **Direct language** - "Run this command" not "You might want to consider running"

**Examples:**

```markdown
✅ Good: "Deploy your application using the CLI"
❌ Bad: "Applications can be deployed by users via the CLI"

✅ Good: "Create a deployment with this command"
❌ Bad: "A deployment may be created using the following command"
```

### Clarity

**Be specific:**
```markdown
❌ Vague: "Install the required dependencies"
✅ Specific: "Install Go 1.25.0 or later"

❌ Vague: "Configure your environment"
✅ Specific: "Set the AKASH_NODE environment variable"
```

**Remove unnecessary words:**
```markdown
❌ Wordy: "In order to create a deployment, you will need to..."
✅ Concise: "To create a deployment..."

❌ Wordy: "There are three different methods available for..."
✅ Concise: "Three methods for..."
```

### Technical Accuracy

- **Test all commands** - Every command must work
- **Verify code examples** - All code must compile/run
- **Keep versions current** - Update version numbers
- **Link to source** - Reference actual code when possible

---

## Formatting

### Headings

```markdown
# H1: Page Title (only one per page)
## H2: Main Sections
### H3: Subsections
#### H4: Minor Sections (use sparingly)
```

**Good heading structure:**
```markdown
# Deploy with CLI

## Prerequisites

## Installation

### macOS

### Linux

### Windows

## Your First Deployment

### Create SDL File

### Deploy

## Next Steps
```

### Code Blocks

Always specify language:

````markdown
```bash
provider-services tx deployment create deploy.yaml
```

```typescript
const sdk = createChainNodeSDK({
  rpcEndpoint: "https://rpc.akashnet.net:443"
})
```

```yaml
version: "2.0"
services:
  web:
    image: nginx:1.25.3
```
````

### Inline Code

Use backticks for:
- Commands: `provider-services`
- File names: `deploy.yaml`
- Variable names: `AKASH_NODE`
- Package names: `@akashnetwork/chain-sdk`

```markdown
Run `provider-services version` to check your installation.
```

### Lists

**Ordered lists** for sequences:
```markdown
1. Install the CLI
2. Configure your wallet
3. Create deployment
```

**Unordered lists** for non-sequential items:
```markdown
- CPU: 0.5 cores
- Memory: 512Mi
- Storage: 1Gi
```

### Links

**Internal links:**
```markdown
See the [CLI Guide](/docs/developers/deployment/cli).
```

**External links:**
```markdown
Install [Node.js](https://nodejs.org/) version 22 or later.
```

**Anchor links:**
```markdown
Jump to [Installation](#installation).
```

### Tables

```markdown
| Feature | CLI | Console | SDK |
|---------|-----|---------|-----|
| Easy to use | ⚠️ | ✅ | ❌ |
| Automation | ✅ | ❌ | ✅ |
| GUI | ❌ | ✅ | ❌ |
```

### Admonitions

Use for important information:

```markdown
**Note:** This feature requires provider-services v0.10.0 or later.

**Warning:** This command will close your deployment and refund remaining escrow.

**Tip:** Use `--dry-run` to preview changes without applying them.

⚠️ **Important:** Back up your wallet before proceeding.
```

---

## Code Examples

### Requirements

All code examples must:
1. **Work** - Actually run without errors
2. **Be complete** - Include all necessary imports/setup
3. **Be realistic** - Show real-world usage
4. **Be tested** - Verify before submitting

### Good Example Structure

````markdown
Here's how to query deployments:

```typescript
import { createChainNodeSDK } from "@akashnetwork/chain-sdk"

async function queryDeployments(owner: string) {
  const sdk = createChainNodeSDK({
    rpcEndpoint: "https://rpc.akashnet.net:443"
  })
  
  const deployments = await sdk.query.deployment.deployments({
    filters: { owner }
  })
  
  return deployments
}

// Usage
const myDeployments = await queryDeployments("akash1...")
console.log(`Found ${myDeployments.length} deployments`)
```

This returns all deployments for the specified owner address.
````

### Multi-Language Examples

Use tabs for multiple languages:

````markdown
```go
// Go example
client, err := discovery.DiscoverClient(ctx)
if err != nil {
  return err
}
```

```typescript
// TypeScript example
const sdk = createChainNodeSDK({
  rpcEndpoint: "https://rpc.akashnet.net:443"
})
```
````

---

## Structure Guidelines

### Page Frontmatter

```yaml
---
categories: ["Developers", "Deployment"]
tags: ["CLI", "Installation", "Setup"]
weight: 1
title: "Installing the Akash CLI"
linkTitle: "Installation"
description: "Install and configure the Akash CLI for deployments"
---
```

- **categories**: Breadcrumb path (max 3 levels)
- **tags**: Search keywords
- **weight**: Sidebar ordering (lower = higher)
- **title**: Full page title
- **linkTitle**: Shorter sidebar title
- **description**: SEO and preview text

### Page Structure

```markdown
---
frontmatter...
---

# Page Title

**Bold lead paragraph** - Brief overview of what this page covers.

---

## First Major Section

Content...

### Subsection

More specific content...

---

## Second Major Section

Content...

---

## Next Steps

- [Related Page 1](/link1)
- [Related Page 2](/link2)

---

**Questions?** Join [Discord](https://discord.akash.network)!
```

### Navigation

**Every page should:**
1. **Start with context** - What will they learn?
2. **End with next steps** - Where to go from here?
3. **Link related content** - Connect the docs

**Good navigation example:**
```markdown
## Next Steps

- **[SDL Reference](/docs/developers/deployment/akash-sdl)** - Learn SDL syntax
- **[Examples Library](/docs/developers/deployment/akash-sdl/examples-library)** - 290+ deployment examples
- **[Best Practices](/docs/developers/deployment/akash-sdl/best-practices)** - Production deployment tips
```

---

## Common Documentation Issues

### Issue: Outdated Information

**Problem:** Commands or APIs have changed

**Solution:**
- Check current source code
- Test all commands
- Update version numbers
- Add "Last Updated" dates if needed

### Issue: Missing Prerequisites

**Problem:** Users can't follow the guide

**Solution:**
```markdown
## Prerequisites

Before you begin, ensure you have:
- Go 1.25.0 or later installed
- An Akash wallet with at least 5 AKT
- Basic command-line knowledge

**Not set up yet?** See [Development Environment](/docs/developers/contributing/development-environment)
```

### Issue: Wall of Text

**Problem:** Dense paragraphs are hard to read

**Solution:**
- Break into smaller paragraphs (3-4 lines max)
- Use headings to chunk content
- Add lists and code blocks
- Include visual breaks (horizontal rules)

### Issue: No Examples

**Problem:** Conceptual explanation without practical application

**Solution:**
Always include working examples:
```markdown
## Theory
Deployments are created from SDL files...

## Example
Here's a simple deployment:
```yaml
version: "2.0"
...
```

Use it like this:
```bash
provider-services tx deployment create deploy.yaml
```
```

---

## Checklist for Documentation PRs

Before submitting:

- [ ] **Tested all commands** - Every command works
- [ ] **Verified code examples** - All code runs
- [ ] **Checked links** - No broken links
- [ ] **Proper formatting** - Code blocks have languages
- [ ] **Clear writing** - Active voice, concise
- [ ] **Logical structure** - Good headings and flow
- [ ] **Next steps included** - Users know where to go
- [ ] **Spell-checked** - No typos
- [ ] **Frontmatter correct** - Categories, tags, weight set

---

## Resources

### Style Guides

- **[Google Developer Documentation Style Guide](https://developers.google.com/style)** - Industry standard
- **[Write the Docs](https://www.writethedocs.org/guide/)** - Community resources
- **[Stripe Documentation](https://stripe.com/docs)** - Excellence example

### Tools

- **[Grammarly](https://grammarly.com/)** - Grammar and clarity
- **[Hemingway Editor](http://www.hemingwayapp.com/)** - Readability
- **[markdownlint](https://github.com/DavidAnson/markdownlint)** - Markdown linting

---

## Getting Help

**Before writing:**
- Check existing docs for similar content
- Ask in Discord #developers if unsure
- Review recent documentation PRs

**During writing:**
- Ask for feedback early (draft PRs welcome)
- Test with someone unfamiliar with the topic
- Iterate based on feedback

**After submission:**
- Respond to review feedback
- Be open to suggestions
- Learn from the review process

---

## Recognition

Documentation contributors are valued:
- Acknowledged in release notes
- Featured in blog posts for major contributions
- Build portfolio with technical writing samples
- Help thousands of users succeed

**Thank you for improving Akash documentation!** 📚

---

**Questions?** Ask in [Discord #developers](https://discord.akash.network)!

