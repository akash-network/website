---
categories: ["Developers", "Contributing"]
tags: ["Contributing", "Console", "Website", "Setup", "Web Development"]
weight: 3
title: "Console & Website Development Setup"
linkTitle: "Console & Website Setup"
description: "Set up your development environment for Akash Console and website documentation contributions"
---

**Get started with Console and website development—much simpler than node/provider setup!**

This guide covers setting up development environments for:
- **Akash Console** - Web UI (React/Next.js)
- **Akash Website** - Documentation site (Astro)

**Perfect for first-time contributors!** These projects are easier to set up than node/provider development.

---

## Prerequisites

### Required Software

- **Node.js** - 22.14.0 or later ([download](https://nodejs.org/))
- **npm** - Comes with Node.js (or use pnpm/yarn)
- **Git** - Version control
- **Code Editor** - VS Code recommended

### Verify Installation

```bash
node --version   # Should be v22.14.0 or higher
npm --version    # Should be 10.x or higher
git --version
```

---

## Console Development Setup

**Repository:** [github.com/akash-network/console](https://github.com/akash-network/console)

**Tech Stack:** React, Next.js, TypeScript, TailwindCSS

### Step 1: Fork and Clone

```bash
# 1. Fork the repository on GitHub (click "Fork" button)

# 2. Clone your fork
git clone https://github.com/YOUR-USERNAME/console.git
cd console

# 3. Add upstream remote
git remote add upstream https://github.com/akash-network/console.git

# 4. Verify remotes
git remote -v
```

### Step 2: Install Dependencies

```bash
# Install all packages
npm install

# Or use pnpm (faster alternative)
npm install -g pnpm
pnpm install
```

### Step 3: Set Up Environment

```bash
# Copy example environment file
cp .env.example .env.local

# Edit .env.local with your configuration
vim .env.local  # or code .env.local
```

**Typical `.env.local` contents:**

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://console-api.akash.network

# Network Configuration
NEXT_PUBLIC_MAINNET_RPC=https://rpc.akash.network:443
NEXT_PUBLIC_TESTNET_RPC=https://rpc.sandbox.akash.network:443

# Feature Flags (optional)
NEXT_PUBLIC_ENABLE_BETA_FEATURES=false
```

### Step 4: Run Development Server

```bash
npm run dev
```

**Expected output:**

```
> console@x.x.x dev
> next dev

- ready started server on 0.0.0.0:3000
- Local:        http://localhost:3000
- Network:      http://192.168.x.x:3000
```

**Open browser:** Visit `http://localhost:3000` to see the Console.

### Step 5: Verify Setup

```bash
# Run tests
npm test

# Run linter
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Type check
npm run type-check

# Build production version
npm run build
```

**All checks should pass** before submitting a PR.

---

### Console Project Structure

```
console/
├── src/
│   ├── app/             # Next.js app router pages
│   ├── components/      # React components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility libraries
│   ├── services/        # API services
│   ├── stores/          # State management
│   ├── types/           # TypeScript types
│   └── styles/          # Global styles
├── public/              # Static assets
├── .env.example         # Environment variables template
└── package.json
```

---

### Console Development Workflow

#### 1. Create a Feature Branch

```bash
git checkout -b feature/add-deployment-filter
```

#### 2. Make Your Changes

Edit files in `src/`:

```typescript
// Example: src/components/DeploymentCard.tsx
export const DeploymentCard: React.FC<Props> = ({ deployment }) => {
  return (
    <div className="rounded-lg border p-4">
      <h3>{deployment.dseq}</h3>
      <p>Status: {deployment.state}</p>
    </div>
  )
}
```

#### 3. Test Your Changes

```bash
# Development server (hot reload)
npm run dev

# Run tests
npm test

# Check types
npm run type-check

# Lint code
npm run lint
```

#### 4. Build and Verify

```bash
# Build production
npm run build

# Test production build locally
npm run start
```

#### 5. Commit and Push

```bash
git add .
git commit -s -m "feat: add deployment filter component"
git push origin feature/add-deployment-filter
```

#### 6. Open Pull Request

Go to GitHub and create a PR from your fork to `akash-network/console`.

---

### Console Common Tasks

**Update dependencies:**

```bash
npm update
npm audit fix
```

**Clear cache and reinstall:**

```bash
rm -rf node_modules .next
npm install
```

**Run specific test:**

```bash
npm test -- DeploymentCard.test.tsx
```

**Format code:**

```bash
npm run format
```

---

## Website Development Setup

**Repository:** [github.com/akash-network/website](https://github.com/akash-network/website)

**Tech Stack:** Astro, React, TypeScript, TailwindCSS, MDX

### Step 1: Fork and Clone

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR-USERNAME/website.git
cd website

# 3. Add upstream remote
git remote add upstream https://github.com/akash-network/website.git

# 4. Verify remotes
git remote -v
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Run Development Server

```bash
npm run dev
```

**Expected output:**

```
  🚀  astro  v4.x.x started in Xms

  ┃ Local    http://localhost:4321/
  ┃ Network  use --host to expose

  ┃ watching for file changes...
```

**Open browser:** Visit `http://localhost:4321` to preview the docs.

### Step 4: Verify Setup

```bash
# Build site
npm run build

# Preview production build
npm run preview

# Run Astro checks
npm run astro -- check

# Format code
npm run format
```

---

### Website Project Structure

```
website/
├── src/
│   ├── content/
│   │   └── Docs/           # All documentation (Markdown/MDX)
│   │       ├── getting-started/
│   │       ├── for-developers/
│   │       ├── for-providers/
│   │       └── learn/
│   ├── components/         # React/Astro components
│   ├── layouts/            # Page layouts
│   ├── pages/              # Route pages
│   └── styles/             # Global styles
├── public/                 # Static assets (images, fonts)
└── astro.config.mjs        # Astro configuration
```

---

### Website Development Workflow

#### 1. Create a Feature Branch

```bash
git checkout -b docs/improve-cli-guide
```

#### 2. Make Your Changes

**Edit documentation:**

```bash
# Documentation is in src/content/Docs/
vim src/content/Docs/for-developers/deployment/cli/index.md
```

**Example edit:**

```markdown
---
categories: ["Developers", "Deployment"]
tags: ["CLI", "Command Line"]
weight: 1
title: "Akash CLI Guide"
linkTitle: "CLI"
description: "Deploy using the Akash command-line interface"
---

# Akash CLI Guide

Deploy applications on Akash using the command-line interface...

## Installation

```bash
# Install provider-services CLI
curl -sSfL https://raw.githubusercontent.com/akash-network/provider/main/install.sh | sh
```

## Your First Deployment

1. Create SDL file...
```

#### 3. Preview Your Changes

```bash
# Development server with hot reload
npm run dev

# Visit http://localhost:4321 and navigate to your page
```

#### 4. Build and Verify

```bash
# Build production site
npm run build

# Check for errors
npm run astro -- check

# Preview production build
npm run preview
```

#### 5. Commit and Push

```bash
git add .
git commit -s -m "docs: improve CLI installation instructions"
git push origin docs/improve-cli-guide
```

#### 6. Open Pull Request

Create a PR from your fork to `akash-network/website`.

---

### Website Common Tasks

**Add new documentation page:**

1. Create new `.md` or `.mdx` file in `src/content/Docs/`
2. Add frontmatter
3. Write content
4. Preview with `npm run dev`

**Update navigation:**

Navigation is auto-generated from:
- Folder structure in `src/content/Docs/`
- `weight` in frontmatter (lower = higher in sidebar)
- `categories` in frontmatter (for breadcrumbs)

**Add images:**

```markdown
<!-- Place images in public/images/ -->
![Alt text](/images/my-screenshot.png)
```

**Test links:**

```bash
# Build and check for broken links
npm run build

# Any broken links will show errors during build
```

**Format all files:**

```bash
npm run format
```

---

## Editor Setup

### VS Code (Recommended)

**Install extensions:**

```bash
code --install-extension astro-build.astro-vscode
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension bradlc.vscode-tailwindcss
```

**Workspace settings** (`.vscode/settings.json`):

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "[astro]": {
    "editor.defaultFormatter": "astro-build.astro-vscode"
  },
  "[markdown]": {
    "editor.wordWrap": "on"
  }
}
```

---

## Troubleshooting

### Console Issues

**Port 3000 already in use:**

```bash
# Kill process on port 3000
lsof -i :3000
kill -9 <PID>

# Or use different port
npm run dev -- -p 3001
```

**Module not found errors:**

```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
```

**Environment variables not loading:**

```bash
# Ensure .env.local exists
ls -la .env.local

# Verify environment variables start with NEXT_PUBLIC_
grep NEXT_PUBLIC_ .env.local
```

**Build fails:**

```bash
# Check for TypeScript errors
npm run type-check

# Check for linting errors
npm run lint

# Clear Next.js cache
rm -rf .next
npm run build
```

---

### Website Issues

**Port 4321 already in use:**

```bash
# Kill process on port 4321
lsof -i :4321
kill -9 <PID>
```

**Build fails:**

```bash
# Check Astro configuration
npm run astro -- check

# Clear cache
rm -rf .astro dist
npm run build
```

**Images not showing:**

```bash
# Ensure images are in public/ directory
ls -la public/images/

# Use absolute paths in markdown
# ✅ ![Alt](/images/pic.png)
# ❌ ![Alt](./images/pic.png)
```

**MDX parsing errors:**

```bash
# Check frontmatter format
# Ensure YAML is valid
# Check for unclosed code blocks
```

---

## Common Development Commands

### Console

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm test` | Run tests |
| `npm run lint` | Check code quality |
| `npm run lint:fix` | Auto-fix linting issues |
| `npm run type-check` | Check TypeScript types |
| `npm run build` | Build production bundle |
| `npm run start` | Serve production build |
| `npm run format` | Format code with Prettier |

### Website

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Build production site |
| `npm run preview` | Preview production build |
| `npm run astro -- check` | Check for errors |
| `npm run format` | Format code with Prettier |

---

## Keep Your Fork Updated

### Sync with Upstream

```bash
# Fetch upstream changes
git fetch upstream

# Switch to main branch
git checkout main

# Merge upstream changes
git merge upstream/main

# Push to your fork
git push origin main
```

### Update Your Feature Branch

```bash
# Switch to your feature branch
git checkout feature/your-feature

# Rebase on latest main
git rebase main

# If conflicts, resolve them and continue
git add .
git rebase --continue

# Force push to update PR
git push --force-with-lease origin feature/your-feature
```

---

## Best Practices

### For Console Development

- **Test in multiple browsers** - Chrome, Firefox, Safari
- **Check mobile responsiveness** - Use browser dev tools
- **Follow accessibility guidelines** - Use semantic HTML, ARIA labels
- **Keep components small** - Single responsibility principle
- **Write tests** - For new components and functions
- **Use TypeScript** - Don't use `any` type

### For Documentation

- **Test all commands** - Every command must work
- **Add code examples** - Show, don't just tell
- **Use proper formatting** - Code blocks, headings, lists
- **Keep it concise** - Remove unnecessary words
- **Link related content** - Help users navigate
- **Check spelling** - Use a spell checker

---

## Getting Help

### Console Help

- **Discord:** [discord.akash.network](https://discord.akash.network) - #developers channel
- **GitHub Issues:** [console/issues](https://github.com/akash-network/console/issues)
- **Documentation:** Check the Console README

### Website Help

- **Discord:** [discord.akash.network](https://discord.akash.network) - #developers channel
- **GitHub Issues:** [website/issues](https://github.com/akash-network/website/issues)
- **Astro Docs:** [docs.astro.build](https://docs.astro.build)

---

## Next Steps

Ready to contribute?

- **[Getting Started Guide](/docs/developers/contributing/getting-started)** - Make your first contribution
- **[Code Conventions](/docs/developers/contributing/code-conventions)** - Learn coding standards
- **[Documentation Guide](/docs/developers/contributing/documentation-guide)** - Write great docs
- **[Pull Request Process](/docs/developers/contributing/pull-request-process)** - Submit your changes

---

**Questions?** Ask in [Discord #developers](https://discord.akash.network)!

