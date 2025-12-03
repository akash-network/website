---
categories: ["For Developers", "Contributing"]
tags: ["Contributing", "Getting Started", "First Contribution"]
weight: 1
title: "Getting Started with Contributing"
linkTitle: "Getting Started"
description: "How to make your first contribution to Akash Network"
---

**Ready to contribute? Here's how to get started!**

This guide walks you through making your first contribution to Akash Network, from finding an issue to submitting your pull request.

---

## Step 1: Choose What to Work On

### Find an Issue

**Core Repositories:**
- **[Support Repository](https://github.com/akash-network/support/issues)** - All node and provider issues
- **[Console Repository](https://github.com/akash-network/console/issues)** - Web UI issues
- **[Website Repository](https://github.com/akash-network/website/issues)** - Documentation issues

**Look for:**
- Issues labeled `good first issue` - Beginner-friendly tasks
- Issues labeled `ready-for-community-dev` - Ready for community contributions
- Issues labeled `help wanted` - Core team welcomes help
- Issues labeled `documentation` - Doc improvements

### Types of Contributions

#### 1. Documentation Improvements
**Perfect for first contributions!**

- Fix typos and broken links
- Clarify confusing sections
- Add missing information
- Improve code examples
- Update outdated content

**Where to contribute:**
- [Website Issues](https://github.com/akash-network/website/issues)
- Browse existing docs and spot improvements

#### 2. Code Contributions

**Node & Provider:**
- Bug fixes
- New features
- Performance improvements
- Test coverage

**Console:**
- UI improvements
- New features
- Bug fixes
- Accessibility improvements

#### 3. Deployment Examples

**Awesome Akash:**
- Add new SDL examples
- Improve existing examples
- Test and verify examples
- Document deployment steps

[Browse Awesome Akash →](https://github.com/akash-network/awesome-akash)

---

## Step 2: Set Up Your Environment

### For Documentation Contributions

Documentation contributions are perfect for first-timers!

1. **Set up the website repository:**
   - Follow the [Console & Website Setup Guide](/docs/for-developers/contributing/console-website-setup)
   - Quick version:
   ```bash
   git clone https://github.com/YOUR-USERNAME/website.git
   cd website
   npm install
   npm run dev
   ```

2. **Create a branch:**
   ```bash
   git checkout -b docs/your-improvement-name
   ```

### For Code Contributions (Node/Provider)

Node and provider development requires a complete Kubernetes environment. Follow these steps:

1. **Fork the repositories:**
   - [akash-network/node](https://github.com/akash-network/node)
   - [akash-network/provider](https://github.com/akash-network/provider)

2. **Clone both repositories:**
   ```bash
   mkdir -p ~/go/src/github.com/akash-network
   cd ~/go/src/github.com/akash-network
   
   git clone https://github.com/YOUR-USERNAME/node.git
   git clone https://github.com/YOUR-USERNAME/provider.git
   ```

3. **Install all development dependencies:**
   ```bash
   # Automated installer for all required tools
   ./provider/script/install_dev_dependencies.sh
   ```

4. **Set up local Kubernetes cluster:**
   ```bash
   cd provider/_run/kube
   
   # Create and provision cluster (may take several minutes)
   make kube-cluster-setup
   
   # If timeout occurs, use extended timeout:
   KUBE_ROLLOUT_TIMEOUT=300 make kube-cluster-setup
   ```

5. **Create a branch:**
   ```bash
   cd ~/go/src/github.com/akash-network/node  # or provider
   git checkout -b feature/your-feature-name
   ```

**Important:** Node and provider development requires a complete Kubernetes environment and is significantly more complex than other contributions. New contributors should start with documentation or Console contributions first. See the complete [Development Environment Guide](/docs/for-developers/contributing/development-environment) for detailed setup instructions.

### For Console Contributions

Console is a great place to start with React/TypeScript contributions!

1. **Set up the console repository:**
   - Follow the [Console & Website Setup Guide](/docs/for-developers/contributing/console-website-setup)
   - Quick version:
   ```bash
   git clone https://github.com/YOUR-USERNAME/console.git
   cd console
   npm install
   npm run dev
   ```

2. **Create a branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

---

## Step 3: Make Your Changes

### Best Practices

1. **Start small** - Your first PR doesn't need to be big
2. **Follow existing patterns** - Look at how similar code is written
3. **Test your changes** - Verify everything works
4. **Keep it focused** - One issue per PR
5. **Document your changes** - Add comments for complex logic

### For Documentation Changes

1. **Edit the relevant `.md` or `.mdx` file** in `src/content/Docs/`
2. **Preview your changes** with `npm run dev`
3. **Check formatting** with `npm run build`

**Tips:**
- Use clear, concise language
- Add code examples where helpful
- Include links to related docs
- Test all code examples

### For Code Changes

1. **Write code** following project conventions
2. **Run tests:**
   ```bash
   make test
   ```

3. **Run linter:**
   ```bash
   make lint
   ```

4. **Verify build:**
   ```bash
   make build
   ```

**See:** [Code Conventions](/docs/for-developers/contributing/code-conventions)

---

## Step 4: Commit Your Changes

### Commit Message Format

Use [conventional commits](https://www.conventionalcommits.org/):

```
<type>: <short summary>

<optional body>
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `chore:` - Maintenance tasks
- `test:` - Test updates
- `refactor:` - Code refactoring
- `style:` - Formatting changes

**Examples:**

```bash
# Documentation fix
git commit -m "docs: fix typo in CLI installation guide"

# Feature addition
git commit -m "feat: add GPU filtering to provider bidengine"

# Bug fix with description
git commit -m "fix: resolve escrow balance calculation error

The escrow balance was not accounting for fees correctly,
causing incorrect balance displays in the console."
```

### Sign Your Commits

All commits must be signed-off:

```bash
git commit -s -m "docs: update provider setup guide"
```

This adds a `Signed-off-by:` line to your commit, certifying you have the right to submit the contribution under the project's license.

**Configure your git identity:**
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

---

## Step 5: Push and Create a Pull Request

### Push Your Changes

```bash
git push origin your-branch-name
```

### Create the Pull Request

1. **Go to your fork on GitHub**
2. **Click "Compare & pull request"**
3. **Fill out the PR template:**

   **Title:** Use conventional commit format
   ```
   docs: improve CLI installation guide
   ```

   **Description:** Explain what and why
   ```markdown
   ## Changes
   - Added troubleshooting section for macOS
   - Fixed broken links to provider docs
   - Clarified version requirements
   
   ## Why
   Users were getting stuck on installation due to missing macOS instructions.
   
   Fixes #123
   ```

4. **Link related issues:**
   - `Fixes #123` - Closes issue #123
   - `Relates to #456` - References issue #456

5. **Click "Create pull request"**

---

## Step 6: Respond to Feedback

### Review Process

1. **Automated checks run** - CI, linting, tests
2. **Maintainers review** - May take a few days
3. **Changes requested** - Address feedback
4. **Approval** - PR gets merged!

### Addressing Feedback

```bash
# Make requested changes
# ... edit files ...

# Commit changes
git add .
git commit -s -m "fix: address review feedback"

# Push to update PR
git push origin your-branch-name
```

### Be Patient and Professional

- Reviews may take time - maintainers are volunteers
- Respond to all comments
- Ask for clarification if needed
- Don't take criticism personally
- Learn from the feedback

---

## Common First Contribution Ideas

### Documentation
- Fix typos in any documentation page
- Add missing links between related docs
- Improve clarity in confusing sections
- Add code examples to API references
- Update screenshots or outdated information

### Code
- Fix a `good first issue` bug
- Add test coverage to existing code
- Improve error messages
- Add logging for debugging
- Update dependencies

### Deployment Examples
- Add your SDL to Awesome Akash
- Test and verify existing examples
- Add README documentation
- Create category-specific examples

---

## Getting Help

### Before Asking

1. **Search existing issues** - Your question might be answered
2. **Check documentation** - Read relevant guides
3. **Review closed PRs** - See how similar changes were done

### Where to Ask

**Discord:**
- **#developers** - Code and technical questions
- **#general** - General questions
- **#providers** - Provider-specific questions

**GitHub:**
- Comment on the issue you're working on
- Open a [Discussion](https://github.com/orgs/akash-network/discussions) for ideas
- Ask in your PR if you need guidance

**Best Practices:**
- Be specific - Provide context, logs, errors
- Show what you've tried
- Be respectful of people's time
- Follow up if you solve it yourself

---

## After Your First Contribution

### Keep Contributing!

- **Look for more issues** to work on
- **Help review others' PRs** - Learn from their code
- **Share your experience** - Write about your contribution
- **Join community calls** - Get to know the team

### Level Up

As you gain experience:
- Tackle more complex issues
- Propose new features
- Become a regular reviewer
- Help onboard new contributors
- Join a Special Interest Group (SIG)

---

## Next Steps

Ready for more?

- **[Code Conventions](/docs/for-developers/contributing/code-conventions)** - Learn coding standards
- **[Development Environment](/docs/for-developers/contributing/development-environment)** - Deep dive into setup
- **[Pull Request Process](/docs/for-developers/contributing/pull-request-process)** - Detailed PR guide

---

## Recognition

Your contributions matter:
- All contributors acknowledged in release notes
- Active contributors join the community leaders
- Outstanding contributors may join core teams
- Build your portfolio and reputation

**Thank you for contributing to Akash Network!** 🎉

---

**Questions?** Join [Discord](https://discord.akash.network) and ask in #developers!
