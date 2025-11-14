# Content Verification & Testing Plan

**Philosophy:** Assume everything is wrong until proven correct.

**Reality:** We have a beautiful structure with content that may not work. Let's fix that.

**Source of Truth:** We have the actual codebases in our workspace - ALWAYS reference them first.

---

## 🎯 Golden Rule: SOURCE CODE IS THE SOURCE OF TRUTH

### Available Repositories in Workspace
- **`/Users/zekeezagui/akash-chain-sdk`** - Chain SDK (Go + TypeScript generation)
- **`/Users/zekeezagui/akash-node-sdk50`** - Node implementation
- **`/Users/zekeezagui/akash-provider-sdk50`** - Provider implementation

### NEVER Write Docs Without:
1. ✅ **Checking the actual code** in these repos
2. ✅ **Reading the actual package.json/go.mod** for versions
3. ✅ **Looking at actual examples** in the repos
4. ✅ **Verifying function signatures** in source
5. ✅ **Checking actual import paths** from code

### Why This Matters
- ❌ Old docs might reference deprecated functions
- ❌ Old docs might use wrong package names
- ❌ Old docs might have outdated syntax
- ✅ **Source code never lies** - it's what actually works
- ✅ **Real examples in repos** show actual usage patterns
- ✅ **Package files** show exact dependencies and versions

---

## 🚨 The Brutal Truth

### Current State
- ✅ Navigation structure is excellent
- ✅ CodeTabs component works
- ✅ Docker setup complete
- ✅ **Source code available in workspace** ⭐ NEW
- ❌ **Content accuracy: UNKNOWN**
- ❌ **Code examples: UNTESTED**
- ❌ **Screenshots: OUTDATED**
- ❌ **Version numbers: QUESTIONABLE**

### What This Means
Every single page needs:
1. **Source code verification** - Check against actual repos FIRST ⭐
2. **Code testing** - Run every command, every script
3. **Screenshot updates** - Match current UI
4. **Version verification** - Update to current versions (from package files)
5. **Link checking** - Fix broken references
6. **Real user testing** - Can someone actually follow this?

---

## 📋 Testing Methodology

### Three-Tier Testing Approach

#### Tier 1: Automated Testing (Catch obvious issues)
- Link checker
- Image path validator
- Code syntax validator
- Version number scanner
- Broken reference detector

#### Tier 2: Manual Verification (Test functionality)
- Run every CLI command
- Test every SDK example
- Deploy every deployment guide
- Follow every tutorial step-by-step
- Time how long each takes

#### Tier 3: User Testing (Real-world validation)
- Give to 3-5 new users
- Watch them try to follow guides
- Note where they get stuck
- Fix issues immediately
- Repeat until smooth

---

## 🎯 Priority Order (What to Test First)

### Phase 1: Getting Started (CRITICAL PATH)
**These docs get the most traffic and impact first impressions**

1. **Console Quick Start** ⭐⭐⭐
   - [ ] Test with real Console account
   - [ ] Follow every step exactly as written
   - [ ] Screenshot every step (updated UI)
   - [ ] Time the process (should be < 10 min)
   - [ ] Get 3 new users to try it
   - [ ] Fix issues found

2. **What is Akash?**
   - [ ] Verify all facts are current
   - [ ] Check all external links work
   - [ ] Update any outdated information
   - [ ] Verify examples mentioned still exist

3. **Core Concepts**
   - [ ] Verify terminology is current
   - [ ] Update any changed concepts
   - [ ] Add diagrams if missing
   - [ ] Cross-reference with actual system behavior

---

### Phase 2: SDK Documentation (HIGH IMPACT)
**Developers use these daily**

#### Go SDK Testing
1. **Before Writing ANYTHING**
   - [ ] Open `/Users/zekeezagui/akash-chain-sdk/go/`
   - [ ] Read `go.mod` for correct module path
   - [ ] Check `README.md` for actual install instructions
   - [ ] Look at example code in repo
   - [ ] Verify package structure

2. **Installation Guide**
   ```bash
   # Check chain-sdk/go/README.md for exact commands
   # Then test these exact commands:
   go get pkg.akt.dev/go
   # Does it work? What errors appear?
   ```
   - [ ] Verify go.mod in chain-sdk repo
   - [ ] Test on clean system
   - [ ] Document all prerequisites (check chain-sdk requirements)
   - [ ] Note exact go version needed (from go.mod)
   - [ ] Capture error messages

3. **Quick Start**
   ```go
   // Check chain-sdk/go for actual examples first!
   import "pkg.akt.dev/go"
   // Does it compile? Run?
   ```
   - [ ] Look for examples in chain-sdk/go/examples/
   - [ ] Copy working example from repo
   - [ ] Create test project
   - [ ] Run example code
   - [ ] Document actual output
   - [ ] Note any issues

4. **API Reference**
   - [ ] **Check source code** in chain-sdk/go/ for function signatures
   - [ ] Verify function signatures match actual code
   - [ ] Check return values in source
   - [ ] Copy example patterns from repo tests
   - [ ] Test every example
   - [ ] Update outdated examples

#### JavaScript/TypeScript SDK Testing
1. **Before Writing ANYTHING**
   - [ ] Open `/Users/zekeezagui/akash-chain-sdk/ts/`
   - [ ] Read `package.json` for correct package name and version
   - [ ] Check `README.md` for actual install instructions
   - [ ] Look at example code in ts/examples/ or tests/
   - [ ] Verify export structure in package.json

2. **Installation Guide**
   ```bash
   # Check chain-sdk/ts/package.json for actual package name
   # Then test these commands:
   npm install @akashnetwork/chain-sdk
   # Does it install? What version?
   ```
   - [ ] Verify package.json in chain-sdk/ts/
   - [ ] Check peer dependencies in package.json
   - [ ] Document Node.js version (check engines field)
   - [ ] Test with npm, yarn, pnpm
   - [ ] Test in both Node and browser

3. **Quick Start**
   ```typescript
   // Check chain-sdk/ts/src for actual exports first!
   import { AkashClient } from '@akashnetwork/chain-sdk';
   // Does this work?
   ```
   - [ ] Look for examples in chain-sdk/ts/examples/ or tests/
   - [ ] Verify imports from actual source code
   - [ ] Copy working example from repo
   - [ ] Create test project
   - [ ] Run example code
   - [ ] Test in Node.js
   - [ ] Test in browser (if applicable)

4. **API Reference**
   - [ ] **Check TypeScript definitions** in chain-sdk/ts/src/
   - [ ] Verify types are correct (read .d.ts files)
   - [ ] Check async/await usage in repo examples
   - [ ] Copy patterns from repo tests
   - [ ] Test every TypeScript example
   - [ ] Update outdated examples

---

### Phase 3: CLI Documentation (POWER USERS)

#### CLI Installation Guide
- [ ] Test on macOS (Intel and ARM)
- [ ] Test on Linux (Ubuntu, Debian, Fedora)
- [ ] Test on Windows (WSL2)
- [ ] Document actual file sizes
- [ ] Note actual install times
- [ ] Capture common errors

#### CLI Commands Reference
For EVERY command listed:
- [ ] Run the command
- [ ] Capture actual output
- [ ] Note any warnings/errors
- [ ] Document all flags
- [ ] Test error cases
- [ ] Update examples

---

### Phase 4: Deployment Guides (PRACTICAL USE)

#### Test Each Guide End-to-End

**Web Applications**
- [ ] Follow guide exactly
- [ ] Deploy actual web app
- [ ] Verify it's accessible
- [ ] Time the process
- [ ] Screenshot each step
- [ ] Document costs

**Databases**
- [ ] Deploy PostgreSQL
- [ ] Deploy MongoDB
- [ ] Deploy Redis
- [ ] Verify connectivity
- [ ] Test persistence
- [ ] Document performance

**GPU Workloads**
- [ ] Deploy GPU example
- [ ] Verify GPU access
- [ ] Test performance
- [ ] Document costs
- [ ] Compare to competitors

**Machine Learning**
- [ ] Deploy example ML workload
- [ ] Test inference
- [ ] Verify GPU utilization
- [ ] Document setup time
- [ ] Measure costs

---

### Phase 5: Provider Documentation (OPERATORS)

#### Before Writing Provider Docs
- [ ] Open `/Users/zekeezagui/akash-provider-sdk50/`
- [ ] Read provider README.md for setup instructions
- [ ] Check actual configuration files in repo
- [ ] Look for example configs
- [ ] Verify commands from provider CLI code

#### Provider Setup
- [ ] **Reference provider repo** for actual setup steps
- [ ] Follow guide on fresh server
- [ ] Note all prerequisites (check provider repo requirements)
- [ ] Time the setup process
- [ ] Document actual costs
- [ ] Capture error messages
- [ ] Test troubleshooting steps

#### Operations Guides
- [ ] Check provider repo for operational scripts
- [ ] Test monitoring setup (verify metrics from code)
- [ ] Verify scaling procedures
- [ ] Test security guidelines
- [ ] Check update procedures
- [ ] Validate backup/restore

---

### Phase 6: Node Operator Documentation

#### Before Writing Node Docs
- [ ] Open `/Users/zekeezagui/akash-node-sdk50/`
- [ ] Read node README.md for build instructions
- [ ] Check actual configuration in repo
- [ ] Look for example node configs
- [ ] Verify CLI commands from node code

#### Node Build
- [ ] **Reference node repo** for actual build steps
- [ ] Test CLI build (verify from repo instructions)
- [ ] Test Omnibus deployment
- [ ] Test Helm chart (check repo for helm values)
- [ ] Verify sync times
- [ ] Document resource usage

#### Validator Setup
- [ ] Check node repo for validator setup
- [ ] Follow validator guide
- [ ] Test on testnet first
- [ ] Document staking process
- [ ] Verify key management (check from code)
- [ ] Test slashing protection

---

## 🛠️ Testing Tools We Need

### Automated Tools
```bash
# Link checker
npm install -g markdown-link-check

# Spell checker
npm install -g cspell

# Image validator
# Custom script needed

# Code syntax checker
# Use TypeScript compiler for TS examples
# Use Go compiler for Go examples
```

### Manual Testing Setup
```bash
# Fresh test environments
- Docker container for clean testing
- VM for OS-specific testing
- Test wallets with testnet funds
- Test provider accounts
- Test node infrastructure
```

### Testing Checklist Template
```markdown
## Guide: [Guide Name]
**Location:** [URL]
**Tester:** [Name]
**Date:** [Date]
**Environment:** [OS, versions, etc.]

### Source Code Verification ⭐ MANDATORY
- [ ] Checked relevant repo: [which repo?]
- [ ] Verified against source code
- [ ] Confirmed package versions from package.json/go.mod
- [ ] Reviewed actual examples in repo
- [ ] Confirmed function signatures match code
- [ ] Verified import paths are correct

### Prerequisites Met?
- [ ] All prerequisites available
- [ ] Costs acceptable
- [ ] Time available

### Step-by-Step Test
1. [ ] Step 1 - [Pass/Fail] - Notes:
2. [ ] Step 2 - [Pass/Fail] - Notes:
...

### Issues Found
1. [Issue description]
2. [Issue description]

### Time Taken
- Expected: [X minutes]
- Actual: [Y minutes]
- Difference: [Explain]

### Screenshots Needed
- [ ] Screenshot 1 description
- [ ] Screenshot 2 description

### Recommendations
- [What should change]
- [What's unclear]
- [What's missing]
```

---

## 📊 Tracking Progress

### Content Quality Dashboard
Create a simple spreadsheet or GitHub issues:

| Page | Status | Tested By | Date | Issues | Fixed |
|------|--------|-----------|------|--------|-------|
| Console Quick Start | ⏳ | - | - | - | - |
| Go SDK Install | ⏳ | - | - | - | - |
| JS SDK Install | ⏳ | - | - | - | - |
| Deploy Web App | ⏳ | - | - | - | - |
| Provider Setup | ⏳ | - | - | - | - |
| Node Build | ⏳ | - | - | - | - |

**Legend:**
- ⏳ Not Started
- 🧪 In Testing
- ⚠️ Issues Found
- ✅ Verified & Fixed
- 🎉 User Tested & Approved

---

## 🎯 Definition of "Done" for Each Guide

### A guide is "done" when:
1. ✅ Every command tested and works
2. ✅ Every code example tested and works
3. ✅ All screenshots updated to current UI
4. ✅ All links checked and working
5. ✅ Tested by at least 1 real user
6. ✅ Time-to-complete documented
7. ✅ Common errors documented
8. ✅ "Last tested" date added
9. ✅ Version numbers verified
10. ✅ Cost information updated

---

## 🚀 Getting Started with Testing

### This Week - Test Priority #1: Console Quick Start

#### Day 1: Setup
- [ ] Create test account in Console
- [ ] Fund with minimum AKT
- [ ] Set up screen recording
- [ ] Prepare testing checklist

#### Day 2: First Test Pass
- [ ] Follow guide step-by-step
- [ ] Record screen
- [ ] Note every issue
- [ ] Time the process
- [ ] Screenshot every step

#### Day 3: Fix Issues
- [ ] Update guide with findings
- [ ] Fix any errors
- [ ] Update screenshots
- [ ] Update time estimates

#### Day 4: User Testing
- [ ] Give to 3 new users
- [ ] Watch (don't help)
- [ ] Note where they struggle
- [ ] Collect feedback

#### Day 5: Final Polish
- [ ] Implement feedback
- [ ] Final test pass
- [ ] Mark as ✅ Verified
- [ ] Move to next guide

---

## 💡 Testing Best Practices

### Do's
- ✅ **CHECK SOURCE CODE FIRST** ⭐ MOST IMPORTANT
- ✅ Reference actual repos before writing
- ✅ Copy working examples from repos
- ✅ Verify versions from package files
- ✅ Use fresh environments
- ✅ Follow guides exactly as written
- ✅ Document everything
- ✅ Time each step
- ✅ Screenshot liberally
- ✅ Note costs incurred
- ✅ Test error cases
- ✅ Get real user feedback

### Don'ts
- ❌ **Write docs without checking source code** ⭐ CARDINAL SIN
- ❌ Trust old documentation
- ❌ Assume package names are correct
- ❌ Guess at function signatures
- ❌ Skip steps you "know" work
- ❌ Test on your personal setup
- ❌ Assume anything works
- ❌ Test without documenting
- ❌ Fix without testing the fix
- ❌ Mark done without user testing

---

## 📝 Issue Template

### When You Find an Issue

```markdown
**Guide:** [Guide name and URL]
**Section:** [Specific section]
**Issue Type:** [Code/Content/Screenshot/Link/Other]

**Problem:**
[Clear description of what's wrong]

**Expected:**
[What should happen]

**Actual:**
[What actually happens]

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]

**Environment:**
- OS: [OS and version]
- Tool versions: [Relevant versions]
- Date tested: [Date]

**Severity:**
- [ ] Blocker (guide doesn't work)
- [ ] High (major issue)
- [ ] Medium (usability problem)
- [ ] Low (minor issue)

**Suggested Fix:**
[How to fix it]

**Screenshot/Error:**
[Paste error message or screenshot]
```

---

## 🎯 Success Metrics

### After Testing Phase Complete:

**Quality Metrics:**
- [ ] 100% of examples tested and working
- [ ] 100% of screenshots current
- [ ] 0 broken links
- [ ] 0 syntax errors
- [ ] 100% of guides user-tested

**User Experience Metrics:**
- [ ] Console Quick Start < 10 minutes (tested with users)
- [ ] SDK integration < 30 minutes (tested with developers)
- [ ] Provider setup < 2 hours (tested with operators)
- [ ] Node build < 1 hour (tested with operators)

**Documentation Metrics:**
- [ ] Every page has "Last tested" date
- [ ] Every code block has been run
- [ ] Every screenshot is current
- [ ] Every guide has time estimate
- [ ] Every guide has cost estimate

---

---

## 🎯 Documentation Writing Workflow

### EVERY Time You Write/Update Documentation:

#### Step 1: Check Source Code (MANDATORY)
```bash
# For SDK docs:
cd /Users/zekeezagui/akash-chain-sdk
# Read the actual code, examples, README, package files

# For Provider docs:
cd /Users/zekeezagui/akash-provider-sdk50
# Read the actual code, configs, README

# For Node docs:
cd /Users/zekeezagui/akash-node-sdk50
# Read the actual code, configs, README
```

#### Step 2: Copy/Adapt from Real Examples
- Find working examples in the repo
- Copy the actual code that works
- Adapt it for documentation purposes
- Keep it as close to source as possible

#### Step 3: Verify Package Information
```bash
# For Go:
cat go.mod  # Get module path and dependencies

# For TypeScript:
cat package.json  # Get package name, version, dependencies
cat package.json | jq '.engines'  # Get Node.js requirements
```

#### Step 4: Test Your Documentation
- Run the code you just documented
- Verify it works exactly as written
- Note any prerequisites
- Document any errors

#### Step 5: Add Metadata
```markdown
---
title: "Your Guide Title"
lastTested: "2024-11-14"
testedWith:
  - "@akashnetwork/chain-sdk": "0.x.x"
  - "node": "20.x.x"
sourceReference: "akash-chain-sdk/ts/examples/deploy.ts"
---
```

---

**Remember:** 

1. **Source code is the source of truth** ⭐
2. This is the difference between docs people trust and docs people ignore
3. Never guess - always verify against actual code

**Next Step:** Start with Console Quick Start testing THIS WEEK.


