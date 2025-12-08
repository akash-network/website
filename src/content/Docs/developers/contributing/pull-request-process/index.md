---
categories: ["Developers", "Contributing"]
tags: ["Contributing", "Pull Request", "PR", "Code Review"]
weight: 5
title: "Pull Request Process"
linkTitle: "Pull Request Process"
description: "How to submit and manage pull requests for Akash Network"
---

**Submit high-quality pull requests that get merged quickly.**

This guide walks you through the entire pull request process, from preparation to merge.

---

## Before Creating a PR

### 1. Discuss Major Changes

For significant features or changes:

1. **Open an issue first** - Describe what you want to build
2. **Get feedback** - Ensure it aligns with project goals
3. **Wait for approval** - Look for `design/approved` label
4. **Then start coding** - Build what was agreed upon

**Why?** Prevents wasted effort on changes that won't be merged.

> "Please do not raise a proposal after doing the work - this is counter to the spirit of the project." - Akash Contributing Guidelines

### 2. Verify Your Changes

**Run all checks locally:**

```bash
# Go projects
make test
make lint
make build

# JavaScript projects
npm test
npm run lint
npm run build
```

**Ensure:**
- **All tests pass
- **No linter errors
- **Code builds successfully
- **No new warnings

### 3. Update Documentation

If your changes affect:
- **User behavior** - Update relevant docs
- **API** - Update API documentation
- **Configuration** - Update config docs
- **CLI commands** - Update CLI reference

---

## Creating the Pull Request

### Step 1: Prepare Your Branch

```bash
# Ensure you're on your feature branch
git checkout feature/your-feature

# Rebase on latest main (if needed)
git fetch upstream
git rebase upstream/main

# Push to your fork
git push origin feature/your-feature
```

### Step 2: Open the PR

1. **Go to GitHub** - Navigate to your fork
2. **Click "Compare & pull request"**
3. **Select base and compare branches:**
   - Base: `akash-network/repo` → `main`
   - Compare: `your-fork/repo` → `feature/your-feature`

### Step 3: Fill Out PR Template

#### Title

Use conventional commit format:

```
feat: add GPU model filtering to bidengine
fix: resolve escrow balance calculation error
docs: update CLI installation guide
chore: bump Go version to 1.25
```

#### Description

Provide a clear, complete description:

```markdown
## What

Brief summary of what this PR does.

## Why

Explain the problem this solves or feature this adds.

## Changes

- List specific changes made
- Include technical details
- Mention any breaking changes

## Testing

How did you test this?
- [ ] Unit tests added
- [ ] Integration tests passed
- [ ] Manual testing performed

## Screenshots (if applicable)

Include before/after screenshots for UI changes.

## Related Issues

Fixes #123
Relates to #456
```

**Example:**

```markdown
## What

Adds GPU model filtering to the bidengine, allowing providers to filter
bids based on specific GPU models and memory requirements.

## Why

Providers were receiving bids for GPU models they don't have, causing
bid failures and wasted resources. This change allows providers to only
bid on deployments they can actually fulfill.

## Changes

- Add `GPUFilter` struct to bidengine
- Implement GPU model matching logic
- Add configuration options for GPU filtering
- Update provider config schema

## Testing

- [x] Unit tests added for GPU filtering logic
- [x] Integration tests pass
- [x] Manually tested with RTX 3090 and A100 GPUs

## Related Issues

Fixes #789
```

### Step 4: Link Issues

Use keywords to auto-close issues:

- `Fixes #123` - Closes issue when PR merges
- `Closes #123` - Same as Fixes
- `Resolves #123` - Same as Fixes
- `Relates to #123` - References without closing

---

## After Submitting

### Automated Checks

Your PR will trigger:

**Go Projects:**
- **Tests (`make test`)
- **Linting (`make lint`)
- **Build verification
- **Coverage report

**JavaScript Projects:**
- **Tests (`npm test`)
- **Linting (`npm run lint`)
- **Type checking
- **Build verification

**All checks must pass** before merge.

### Code Review Process

#### Timeline

- **Initial review:** 2-7 days typically
- **Follow-up reviews:** 1-3 days
- **Merge:** After all feedback addressed

> Note: Reviews are done by volunteers. Be patient and follow up politely if needed.

#### Responding to Feedback

**Good responses:**

```markdown
**"Great catch! Fixed in latest commit."
**"I considered that approach but chose X because Y. Thoughts?"
**"Good point. Changed to use interface instead."
**"Can you clarify what you mean by...?"
```

**Avoid:**

```markdown
**"This is fine as-is."
**No response (ignoring feedback)
**"You're wrong."
**Defensive or argumentative responses
```

#### Making Changes

```bash
# Make requested changes
# ... edit files ...

# Commit changes (signed-off)
git add .
git commit -s -m "fix: address review feedback"

# Push to update PR
git push origin feature/your-feature
```

**Tips:**
- Address all comments
- Mark conversations as resolved when fixed
- Ask for clarification if unclear
- Be open to suggestions

---

## Common PR Issues

### Issue: Tests Failing

**Problem:** CI tests fail

**Solution:**
```bash
# Run tests locally
make test  # or npm test

# Fix failing tests
# ... make changes ...

# Verify fix
make test

# Commit and push
git commit -s -m "test: fix failing tests"
git push origin feature/your-feature
```

### Issue: Merge Conflicts

**Problem:** Your branch conflicts with main

**Solution:**
```bash
# Fetch latest main
git fetch upstream

# Rebase on main
git rebase upstream/main

# Resolve conflicts
# ... edit conflicting files ...

# Continue rebase
git add .
git rebase --continue

# Force push (rebase rewrites history)
git push --force-with-lease origin feature/your-feature
```

### Issue: Linter Errors

**Problem:** Linter finds issues

**Solution:**
```bash
# Run linter
make lint  # or npm run lint

# Auto-fix what's possible
make lint-fix  # or npm run lint:fix

# Manually fix remaining issues
# ... edit files ...

# Verify
make lint

# Commit
git commit -s -m "style: fix linter errors"
git push origin feature/your-feature
```

### Issue: Missing Sign-off

**Problem:** Commits not signed-off

**Solution:**
```bash
# Sign off last commit
git commit --amend --signoff

# Sign off multiple commits (interactive rebase)
git rebase -i HEAD~3  # for last 3 commits
# In editor, change 'pick' to 'edit' for commits to sign
# For each commit:
git commit --amend --signoff
git rebase --continue

# Push (force required after rebase)
git push --force-with-lease origin feature/your-feature
```

### Issue: Too Many Commits

**Problem:** PR has many small commits

**Solution:**
```bash
# Squash commits
git rebase -i HEAD~5  # for last 5 commits

# In editor, keep first 'pick', change rest to 'squash'
# Save and edit commit message

# Push
git push --force-with-lease origin feature/your-feature
```

---

## PR Requirements Checklist

### Before Requesting Review

- [ ] **Tests pass** - All automated tests green
- [ ] **Linter passes** - No linting errors
- [ ] **Commits signed** - All commits have sign-off
- [ ] **Clear description** - Explains what, why, and how
- [ ] **Documentation updated** - If applicable
- [ ] **No merge conflicts** - Rebased on latest main
- [ ] **Reviewable size** - Not too large (< 500 lines ideal)

### During Review

- [ ] **Respond to comments** - Address all feedback
- [ ] **Be professional** - Stay respectful and collaborative
- [ ] **Ask questions** - If anything is unclear
- [ ] **Update commits** - Fix issues found in review
- [ ] **Mark resolved** - Mark conversations as resolved

### Before Merge

- [ ] **All checks pass** - Green checkmarks on all CI
- [ ] **Review approved** - At least one approval
- [ ] **Feedback addressed** - All comments resolved
- [ ] **Up to date** - No conflicts with main

---

## PR Size Guidelines

### Ideal PR Size

- **Small:** < 200 lines changed
- **Medium:** 200-500 lines
- **Large:** 500+ lines (try to avoid)

### Breaking Up Large Changes

```bash
# Instead of one large PR:
feat: complete provider bidengine rewrite (2000 lines)

# Create multiple smaller PRs:
1. refactor: extract bid validation to separate package
2. feat: add GPU filtering to bid validation
3. feat: implement new bid pricing algorithm
4. feat: add bid priority system
5. docs: update bidengine documentation
```

**Benefits:**
- Easier to review
- Faster to merge
- Easier to revert if needed
- Better git history

---

## PR Review Etiquette

### As a PR Author

**Do:**
- **Be responsive to feedback
- **Accept constructive criticism
- **Learn from suggestions
- **Thank reviewers
- **Be patient

**Don't:**
- **Take feedback personally
- **Argue with reviewers
- **Rush reviewers
- **Ignore comments
- **Get defensive

### As a Reviewer

**Do:**
- **Be constructive and kind
- **Explain why changes are needed
- **Suggest alternatives
- **Praise good code
- **Be thorough but timely

**Don't:**
- **Be condescending
- **Nitpick excessively
- **Request perfect code
- **Block without explanation
- **Ghost the author

---

## After Merge

### Celebrate! 

Your contribution is now part of Akash Network!

### Next Steps

1. **Delete your branch:**
   ```bash
   git branch -d feature/your-feature
   git push origin --delete feature/your-feature
   ```

2. **Update your fork:**
   ```bash
   git checkout main
   git pull upstream main
   git push origin main
   ```

3. **Find another issue:**
   - Browse [open issues](https://github.com/akash-network/support/issues)
   - Look for `good first issue` labels
   - Help review others' PRs

4. **Share your contribution:**
   - Tweet about it
   - Blog about your experience
   - Help others contribute

---

## Common Questions

### "How long until my PR is reviewed?"

**Answer:** Typically 2-7 days for initial review. Maintainers are volunteers with varying availability.

**What you can do:**
- Ensure all CI checks pass
- Provide a clear description
- Join Discord and mention your PR (politely)
- Be patient

### "Can I work on multiple PRs at once?"

**Answer:** Yes! Just keep them in separate branches:

```bash
git checkout -b feature/gpu-filtering
# Work on GPU filtering PR

git checkout main
git checkout -b fix/escrow-bug
# Work on escrow bug fix PR
```

### "My PR was closed without merging"

**Possible reasons:**
- Didn't follow contributing guidelines
- Duplicate of another PR
- Doesn't align with project goals
- No response to review feedback for 30+ days

**What to do:**
- Read the closing comment
- Address the concerns
- Reopen if appropriate
- Ask in Discord for guidance

### "Do I need approval before starting?"

**For small changes:** No
- Bug fixes
- Documentation improvements
- Typo fixes

**For large changes:** Yes
- New features
- API changes
- Architecture changes

Open an issue first and wait for `design/approved` label.

---

## Resources

- **[Code Conventions](/docs/developers/contributing/code-conventions)** - Coding standards
- **[Getting Started](/docs/developers/contributing/getting-started)** - First contribution guide
- **[GitHub PR Documentation](https://docs.github.com/en/pull-requests)** - GitHub's official guide

---

**Ready to submit?** Make sure your PR follows this process and get ready to contribute!

**Questions?** Ask in [Discord #developers](https://discord.akash.network)!
