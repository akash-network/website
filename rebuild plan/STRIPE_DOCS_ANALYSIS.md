# Learning from Stripe: A Documentation Masterclass

**Purpose:** Detailed analysis of Stripe's documentation excellence and actionable steps to apply their approach to Akash Network

---

## What Makes Stripe's Docs the Best in Class

### 1. **The Multi-Language Code Toggle** ⭐⭐⭐

**What Stripe Does:**
```
┌─────────────────────────────────────────┐
│  [Python] [JavaScript] [Ruby] [PHP] ... │
├─────────────────────────────────────────┤
│  import stripe                          │
│  stripe.api_key = "sk_test_..."        │
│                                         │
│  charge = stripe.Charge.create(        │
│    amount=2000,                         │
│    currency="usd",                      │
│    source="tok_visa",                   │
│  )                                      │
└─────────────────────────────────────────┘
```

**User Experience:**
- Click once, ALL code examples on the page switch languages
- Preference saved in cookies
- Consistent syntax highlighting
- Copy button on every code block

**How to Implement for Akash:**

```typescript
// Component: CodeTabs.tsx
import { useState, useEffect } from 'react';

const LANGUAGES = ['Python', 'JavaScript', 'TypeScript', 'Go'];

export function CodeTabs({ examples }) {
  const [activeLang, setActiveLang] = useState('Python');
  
  // Save preference to localStorage
  useEffect(() => {
    const saved = localStorage.getItem('akash-docs-lang');
    if (saved) setActiveLang(saved);
  }, []);
  
  const handleLanguageChange = (lang) => {
    setActiveLang(lang);
    localStorage.setItem('akash-docs-lang', lang);
    // Broadcast to all code blocks on page
    window.dispatchEvent(new CustomEvent('language-change', { 
      detail: { language: lang } 
    }));
  };
  
  return (
    <div className="code-tabs">
      <div className="tabs-header">
        {LANGUAGES.map(lang => (
          <button 
            key={lang}
            className={activeLang === lang ? 'active' : ''}
            onClick={() => handleLanguageChange(lang)}
          >
            {lang}
          </button>
        ))}
      </div>
      <div className="code-content">
        {examples[activeLang]}
      </div>
    </div>
  );
}
```

**Akash Example - Create Deployment:**

```markdown
## Create a Deployment

<CodeTabs>
<TabPanel language="python">
```python
from akash import AkashClient

client = AkashClient(
    rpc_url="https://rpc.akash.network:443",
    chain_id="akashnet-2"
)

# Create deployment from SDL
deployment = client.tx.create_deployment(
    sdl_path="deploy.yaml",
    from_key="mykey",
    deposit="5000000uakt"
)

print(f"Deployment ID: {deployment.dseq}")
```
</TabPanel>

<TabPanel language="javascript">
```javascript
import { AkashClient } from '@akashnetwork/akashjs';

const client = new AkashClient({
  rpcUrl: 'https://rpc.akash.network:443',
  chainId: 'akashnet-2'
});

// Create deployment from SDL
const deployment = await client.tx.createDeployment({
  sdlPath: 'deploy.yaml',
  fromKey: 'mykey',
  deposit: '5000000uakt'
});

console.log(`Deployment ID: ${deployment.dseq}`);
```
</TabPanel>

<TabPanel language="go">
```go
package main

import (
    "fmt"
    akash "github.com/akash-network/akash-api/go/node/deployment/v1beta3"
)

func main() {
    client := akash.NewClient(
        "https://rpc.akash.network:443",
        "akashnet-2",
    )
    
    deployment, err := client.CreateDeployment(
        "deploy.yaml",
        "mykey",
        "5000000uakt",
    )
    
    if err != nil {
        panic(err)
    }
    
    fmt.Printf("Deployment ID: %d\n", deployment.Dseq)
}
```
</TabPanel>
</CodeTabs>
```

---

### 2. **The Right-Side API Reference** ⭐⭐⭐

**What Stripe Does:**
```
┌──────────────────────┬──────────────────────┐
│ Documentation Text   │  Code Examples       │
│                      │                      │
│ The Create Charge    │  import stripe       │
│ endpoint allows...   │  stripe.api_key...   │
│                      │                      │
│ Parameters:          │  charge = stripe...  │
│ - amount (required)  │                      │
│ - currency (req.)    │  # Response          │
│ - source (required)  │  {                   │
│                      │    "id": "ch_..."    │
│ Returns:             │    "amount": 2000    │
│ A Charge object      │  }                   │
└──────────────────────┴──────────────────────┘
```

**Key Features:**
- Sticky code panel (follows scroll)
- Live request/response examples
- "Test Mode" toggle
- Real data you can interact with

**How to Implement for Akash:**

```markdown
<!-- Example Page Layout -->
# Create Deployment API

<TwoColumnLayout>
  <LeftColumn>
    ## Description
    Creates a new deployment on the Akash Network based on your SDL configuration.
    
    ## Parameters
    
    | Parameter | Type | Required | Description |
    |-----------|------|----------|-------------|
    | sdl | string/object | Yes | SDL configuration or path to SDL file |
    | deposit | string | Yes | Initial deposit amount (e.g., "5000000uakt") |
    | from | string | Yes | Account address or key name |
    
    ## Returns
    Returns a Deployment object with the following fields:
    
    - `dseq` - Deployment sequence number
    - `state` - Current deployment state
    - `version` - SDL version hash
    - `created_at` - Creation block height
    
    ## Errors
    
    | Code | Description |
    |------|-------------|
    | INSUFFICIENT_FUNDS | Account has insufficient balance |
    | INVALID_SDL | SDL validation failed |
    | DUPLICATE_DEPLOYMENT | Deployment already exists |
  </LeftColumn>
  
  <RightColumn>
    <LiveExample>
      <CodeTabs>
        <TabPanel language="python">
        ```python
        # Create deployment
        deployment = client.tx.create_deployment(
            sdl="deploy.yaml",
            deposit="5000000uakt",
            from_key="mykey"
        )
        ```
        </TabPanel>
      </CodeTabs>
      
      <ResponsePreview>
        ```json
        {
          "dseq": 1234567,
          "state": "active",
          "version": "abc123...",
          "created_at": 9876543,
          "owner": "akash1..."
        }
        ```
      </ResponsePreview>
      
      <TryItButton>
        Try it in Sandbox →
      </TryItButton>
    </LiveExample>
  </RightColumn>
</TwoColumnLayout>
```

---

### 3. **Interactive API Testing** ⭐⭐⭐

**What Stripe Does:**
- "Try it now" buttons on every endpoint
- Pre-filled with test data
- Shows real responses
- Switches between test/live mode

**How to Implement for Akash:**

Create an embedded testing environment:

```typescript
// Component: ApiTester.tsx
export function ApiTester({ endpoint, method, params }) {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testnet, setTestnet] = useState(true);
  
  const runTest = async () => {
    setLoading(true);
    try {
      const result = await fetch(
        testnet 
          ? 'https://api.sandbox.akash.network' 
          : 'https://api.akash.network',
        {
          method,
          body: JSON.stringify(params),
          headers: { 'Content-Type': 'application/json' }
        }
      );
      setResponse(await result.json());
    } catch (error) {
      setResponse({ error: error.message });
    }
    setLoading(false);
  };
  
  return (
    <div className="api-tester">
      <div className="controls">
        <Toggle 
          label="Use Testnet" 
          checked={testnet} 
          onChange={setTestnet} 
        />
        <button onClick={runTest} disabled={loading}>
          {loading ? 'Running...' : 'Test API Call'}
        </button>
      </div>
      
      {response && (
        <CodeBlock language="json">
          {JSON.stringify(response, null, 2)}
        </CodeBlock>
      )}
    </div>
  );
}
```

---

### 4. **Smart Search with Context** ⭐⭐⭐

**What Stripe Does:**
- Instant search results
- Shows code snippets in results
- Categories (API Reference, Guides, etc.)
- Recent searches
- Popular searches

**How to Implement for Akash:**

Use Algolia DocSearch (free for open source):

```javascript
// docusaurus.config.js or astro.config.mjs
module.exports = {
  themeConfig: {
    algolia: {
      appId: 'YOUR_APP_ID',
      apiKey: 'YOUR_SEARCH_API_KEY',
      indexName: 'akash-network',
      contextualSearch: true,
      searchParameters: {
        facetFilters: ['language:en', 'version:latest'],
      },
    },
  },
};
```

**Enhanced with Categories:**
```typescript
const searchConfig = {
  indices: [
    {
      name: 'akash_docs',
      title: 'Documentation',
      hitComponent: 'DocHit'
    },
    {
      name: 'akash_api',
      title: 'API Reference',
      hitComponent: 'ApiHit'
    },
    {
      name: 'akash_examples',
      title: 'Code Examples',
      hitComponent: 'CodeHit'
    }
  ]
};
```

---

### 5. **Progressive Disclosure** ⭐⭐

**What Stripe Does:**
- Start simple, add complexity gradually
- "Show advanced options" toggles
- Expandable parameter details
- "Learn more" inline links

**Example for Akash Deployment Guide:**

```markdown
## Create Your First Deployment

### Basic Example
The simplest deployment uses just these settings:

```yaml
version: "2.0"
services:
  web:
    image: nginx
    expose:
      - port: 80
        to:
          - global: true
```

<AdvancedToggle>

### Advanced Configuration

Add these optional settings for production:

```yaml
version: "2.0"
services:
  web:
    image: nginx:1.21
    env:
      - "ENV=production"
    expose:
      - port: 80
        as: 80
        to:
          - global: true
        accept:
          - example.com
    resources:
      cpu:
        units: 0.5
      memory:
        size: 512Mi
      storage:
        size: 1Gi
```

<ParameterDetails>
#### Resource Units Explained
- CPU units are in fractional cores (0.5 = half a core)
- Memory is in mebibytes (Mi) or gibibytes (Gi)
- Storage is persistent across restarts
</ParameterDetails>

</AdvancedToggle>
```

---

### 6. **Copy-Paste Perfection** ⭐⭐⭐

**What Stripe Does:**
- Every code block has a copy button
- Pre-filled with user's API keys (when logged in)
- Works immediately
- No placeholder text

**How to Implement for Akash:**

```typescript
// Component: CopyableCode.tsx
export function CopyableCode({ code, language, fillUserData = false }) {
  const [copied, setCopied] = useState(false);
  const user = useUser(); // Get logged-in user
  
  // Replace placeholders with real data
  const processedCode = fillUserData 
    ? code
        .replace('YOUR_WALLET_ADDRESS', user?.address || 'YOUR_WALLET_ADDRESS')
        .replace('YOUR_KEY_NAME', user?.keyName || 'YOUR_KEY_NAME')
    : code;
  
  const handleCopy = () => {
    navigator.clipboard.writeText(processedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="copyable-code">
      <div className="code-header">
        <span className="language">{language}</span>
        <button onClick={handleCopy} className="copy-btn">
          {copied ? '✓ Copied!' : 'Copy'}
        </button>
      </div>
      <SyntaxHighlighter language={language}>
        {processedCode}
      </SyntaxHighlighter>
    </div>
  );
}
```

**Akash Example:**
```markdown
<CopyableCode language="bash" fillUserData>
```bash
export AKASH_ACCOUNT_ADDRESS="YOUR_WALLET_ADDRESS"
export AKASH_KEY_NAME="YOUR_KEY_NAME"

provider-services tx deployment create deploy.yml \
  --from $AKASH_KEY_NAME \
  --node https://rpc.akash.network:443 \
  --chain-id akashnet-2
```
</CopyableCode>
```

---

### 7. **Error Handling Documentation** ⭐⭐

**What Stripe Does:**
- Every error code documented
- Example errors in code
- Troubleshooting steps
- Common causes

**Akash Implementation:**

```markdown
## Common Errors

### `INSUFFICIENT_FUNDS`

**Error Message:**
```
Error: account akash1... has insufficient funds for deployment
Required: 5000000uakt, Available: 1000000uakt
```

**Cause:**
Your account doesn't have enough AKT to cover the deployment deposit.

**Solution:**
1. Check your balance:
   ```bash
   provider-services query bank balances $AKASH_ACCOUNT_ADDRESS
   ```

2. Fund your account (minimum 5 AKT recommended):
   - [Buy AKT on exchanges](/docs/token)
   - [Use the testnet faucet](/docs/testnet/faucet)

**Related:**
- [Understanding escrow accounts](/docs/payments)
- [How deposits work](/docs/deployments/deposits)

---

### `INVALID_SDL`

**Error Message:**
```
Error: SDL validation failed at line 12: 'memory.size' must be specified
```

**Cause:**
Your SDL file has a syntax error or missing required field.

**Solution:**
1. Validate your SDL:
   ```bash
   provider-services validate deploy.yml
   ```

2. Check the SDL reference:
   - [SDL Documentation](/docs/sdl)
   - [SDL Examples](/docs/sdl/examples)

3. Use the SDL Builder:
   [Open SDL Builder →](/tools/sdl-builder)
```

---

### 8. **Webhooks/Event Documentation** ⭐⭐

**What Stripe Does:**
- Clear webhook setup guide
- Example payloads
- Security verification code
- Event type reference

**Akash Equivalent - Event Streams:**

```markdown
## Listening to Deployment Events

### WebSocket Connection

<CodeTabs>
<TabPanel language="python">
```python
import asyncio
import websockets
from akash import EventStream

async def listen_to_events():
    stream = EventStream(
        rpc_url="wss://rpc.akash.network:443/websocket",
        filters={"owner": "akash1..."}
    )
    
    async for event in stream.deployments():
        if event.type == "deployment.created":
            print(f"New deployment: {event.dseq}")
        elif event.type == "lease.created":
            print(f"Lease created: {event.lease_id}")

asyncio.run(listen_to_events())
```
</TabPanel>

<TabPanel language="javascript">
```javascript
import { EventStream } from '@akashnetwork/akashjs';

const stream = new EventStream({
  rpcUrl: 'wss://rpc.akash.network:443/websocket',
  filters: { owner: 'akash1...' }
});

stream.on('deployment.created', (event) => {
  console.log(`New deployment: ${event.dseq}`);
});

stream.on('lease.created', (event) => {
  console.log(`Lease created: ${event.leaseId}`);
});

stream.connect();
```
</TabPanel>
</CodeTabs>

### Event Types Reference

| Event Type | Description | Payload |
|------------|-------------|---------|
| `deployment.created` | New deployment created | `{ dseq, owner, version }` |
| `deployment.updated` | Deployment updated | `{ dseq, version }` |
| `deployment.closed` | Deployment closed | `{ dseq }` |
| `bid.created` | New bid received | `{ dseq, provider, price }` |
| `lease.created` | Lease established | `{ dseq, provider }` |
```

---

## Action Plan: Stripe-ify Akash Docs

### Phase 1: Quick Wins (Week 1-2)
- [ ] **Add copy buttons to all code blocks**
  - Use react-copy-to-clipboard
  - Add toast notification on copy
  
- [ ] **Implement language tabs**
  - Create reusable component
  - Add Python, JS, Go examples for top 10 operations
  
- [ ] **Improve code syntax highlighting**
  - Use Prism.js or Shiki
  - Add line numbers
  - Add line highlighting

### Phase 2: Structure (Week 3-4)
- [ ] **Two-column layout for API reference**
  - Text on left, code on right
  - Sticky code panel
  
- [ ] **Progressive disclosure**
  - Add "Show advanced" toggles
  - Collapsible parameter details
  
- [ ] **Error documentation**
  - Document all error codes
  - Add troubleshooting steps

### Phase 3: Interactivity (Week 5-8)
- [ ] **API Testing Environment**
  - Sandbox environment setup
  - "Try it" buttons on API docs
  - Real response examples
  
- [ ] **Smart search**
  - Implement Algolia DocSearch
  - Add search analytics
  
- [ ] **User personalization**
  - Save language preference
  - Pre-fill wallet addresses (when logged in)
  - Remember search history

---

## Metrics to Track (Stripe-style)

### Documentation Health
- **Search Success Rate:** % of searches that lead to page visit
- **Code Copy Rate:** % of code blocks that get copied
- **Page Completion:** % who scroll to bottom
- **Bounce Rate:** % who leave after one page
- **Time to Success:** Minutes to first deployment

### User Behavior
- **Most Popular Languages:** Track tab selections
- **Most Copied Code:** Which examples are used most
- **Most Searched Terms:** What users are looking for
- **Error Rates:** Which errors show up in examples

### Quality Indicators
- **Link Health:** % of working links
- **Freshness:** Days since last update
- **Code Validity:** % of examples that run
- **Community Contributions:** PRs per month

---

## Estimated Implementation

### Team
- 1 Frontend Developer (React/TypeScript) - 4 weeks
- 1 Technical Writer - 6 weeks
- 1 Developer (SDK examples) - 4 weeks

### Timeline
- **Week 1-2:** Component development (tabs, copy buttons, layout)
- **Week 3-4:** Content restructuring (two-column, progressive disclosure)
- **Week 5-6:** Multi-language examples (Python, JS, Go)
- **Week 7-8:** Interactive features (API tester, search)

### Cost
- **Development:** $30k-$40k
- **Tools (Algolia, hosting):** $0 (free tier)
- **Total:** $30k-$40k

---

## Resources

### Design System
- [Stripe's Design Principles](https://stripe.com/docs/design)
- Fonts: Inter (similar to Stripe's custom font)
- Colors: Dark mode + light mode
- Code theme: Based on VS Code's Dark+

### Components to Build
1. `<CodeTabs>` - Multi-language switcher
2. `<TwoColumnLayout>` - Docs + code layout
3. `<CopyButton>` - Copy to clipboard
4. `<ApiTester>` - Interactive testing
5. `<ParameterTable>` - API parameter docs
6. `<ErrorCard>` - Error documentation
7. `<AdvancedToggle>` - Progressive disclosure

### Example Repository
Create a `akash-docs-components` package:
```
akash-docs-components/
├── src/
│   ├── CodeTabs/
│   ├── TwoColumnLayout/
│   ├── CopyButton/
│   ├── ApiTester/
│   └── index.ts
├── package.json
└── README.md
```

---

**This is the way to world-class documentation! 🚀**

