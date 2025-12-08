---
categories: ["Developers", "Contributing"]
tags: ["Contributing", "Code Conventions", "Standards"]
weight: 4
title: "Code Conventions & Standards"
linkTitle: "Code Conventions"
description: "Coding standards and conventions for Akash Network contributions"
---

**Write consistent, maintainable code that follows Akash Network standards.**

This guide covers coding conventions for Go (node, provider) and JavaScript/TypeScript (console, docs) projects.

---

## General Principles

### Code Quality

- **Readability first** - Code is read more than written
- **Simple over clever** - Prefer clarity over cleverness
- **Consistent style** - Follow existing patterns
- **Test your code** - Write tests for new functionality
- **Document complexity** - Add comments for non-obvious logic

###YAGNI Principle

"You Aren't Gonna Need It" - Don't add functionality until it's needed.

- Build what's required now
- Avoid over-engineering
- Justify features with real use cases
- Defend proposals with data, not hypotheses

---

## Go Conventions

### Code Style

Follow the official [Go Code Review Comments](https://github.com/golang/go/wiki/CodeReviewComments).

#### Formatting

```bash
# Use gofmt (required)
gofmt -w .

# Or goimports (preferred - also manages imports)
goimports -w .

# Project linting
make lint
```

#### Project Structure

```
cmd/              # Main applications
pkg/              # Library code
internal/         # Private application code
api/              # API definitions
testutil/         # Test utilities
integration/      # Integration tests
```

### Naming Conventions

#### Package Names

```go
// **Good: Short, lowercase, no underscores
package bidengine
package deployment
package manifest

// **Bad: Mixed case, underscores
package bidEngine
package bid_engine
```

#### Variables

```go
// **Good: CamelCase for exported, camelCase for unexported
type DeploymentManager struct {
    MaxBids int
    bidders []Bidder
}

// **Bad: Inconsistent casing
type deploymentManager struct {
    max_bids int
}
```

#### Functions

```go
// **Good: Descriptive, action-oriented
func CreateDeployment(ctx context.Context, sdl []byte) (*Deployment, error)
func ValidateManifest(m *Manifest) error
func (d *Deployment) Close() error

// **Bad: Vague or inconsistent
func DoStuff() error
func deployment_create() error
```

### Error Handling

```go
// **Good: Return errors, don't panic
func ProcessBid(bid *Bid) (*Lease, error) {
    if bid == nil {
        return nil, errors.New("bid cannot be nil")
    }
    
    lease, err := createLease(bid)
    if err != nil {
        return nil, fmt.Errorf("failed to create lease: %w", err)
    }
    
    return lease, nil
}

// **Good: Wrap errors with context
if err != nil {
    return fmt.Errorf("processing bid %s: %w", bid.ID, err)
}

// **Bad: Ignoring errors
lease, _ := createLease(bid)

// **Bad: Panicking in library code
if err != nil {
    panic(err)
}
```

### Interfaces

```go
// **Good: Small, focused interfaces
type Bidder interface {
    PlaceBid(ctx context.Context, order Order) (*Bid, error)
}

type LeaseManager interface {
    CreateLease(ctx context.Context, bid *Bid) (*Lease, error)
    CloseLease(ctx context.Context, leaseID LeaseID) error
}

// **Good: Accept interfaces, return structs
func ProcessBids(ctx context.Context, bidder Bidder, orders []Order) ([]*Bid, error)

// **Bad: Large interfaces with many methods
type Everything interface {
    DoBid()
    DoLease()
    DoManifest()
    DoEverything()
}
```

### Testing

```go
// **Good: Table-driven tests
func TestCreateDeployment(t *testing.T) {
    tests := []struct {
        name    string
        sdl     []byte
        want    *Deployment
        wantErr bool
    }{
        {
            name: "valid SDL",
            sdl:  []byte("version: '2.0'..."),
            want: &Deployment{...},
            wantErr: false,
        },
        {
            name: "invalid SDL",
            sdl:  []byte("invalid"),
            want: nil,
            wantErr: true,
        },
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            got, err := CreateDeployment(context.Background(), tt.sdl)
            if (err != nil) != tt.wantErr {
                t.Errorf("CreateDeployment() error = %v, wantErr %v", err, tt.wantErr)
                return
            }
            if !reflect.DeepEqual(got, tt.want) {
                t.Errorf("CreateDeployment() = %v, want %v", got, tt.want)
            }
        })
    }
}
```

#### Goroutine Leak Detection

```go
// **Good: Use goleak to detect goroutine leaks
import "go.uber.org/goleak"

func TestMyFunction(t *testing.T) {
    defer goleak.VerifyNoLeaks(t)
    
    // Your test code that uses goroutines
}
```

### Comments

```go
// **Good: Package documentation
// Package bidengine provides bid placement and management for Akash providers.
// It handles bid evaluation, placement, and lease creation.
package bidengine

// **Good: Exported function documentation
// CreateDeployment creates a new deployment from the provided SDL.
// It validates the SDL, creates the deployment transaction, and returns
// the deployment ID.
//
// Returns an error if the SDL is invalid or the transaction fails.
func CreateDeployment(ctx context.Context, sdl []byte) (*Deployment, error)

// **Good: Explain complex logic
// Calculate bid price using the formula:
// price = (cpu * cpuPrice) + (memory * memPrice) + (storage * storagePrice)
// Prices are in uakt per unit per block.
price := calculateBidPrice(resources)

// **Bad: Obvious comments
// Increment counter by 1
counter++
```

### Context Usage

```go
// **Good: Pass context as first parameter
func CreateDeployment(ctx context.Context, sdl []byte) (*Deployment, error)

// **Good: Check context cancellation
select {
case <-ctx.Done():
    return ctx.Err()
case result := <-ch:
    return result, nil
}

// **Bad: Store context in struct
type Manager struct {
    ctx context.Context  // Don't do this
}
```

---

## JavaScript/TypeScript Conventions

### Code Style

Follow [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript) and TypeScript best practices.

#### Formatting

```bash
# Use Prettier (required)
npm run format

# Or Prettier with eslint
npm run lint:fix
```

### Naming Conventions

```typescript
// **Good: PascalCase for components and classes
export const DeploymentCard: React.FC<Props> = ({ deployment }) => { }
export class DeploymentManager { }

// **Good: camelCase for variables and functions
const deploymentId = "123"
function createDeployment(sdl: string) { }

// **Good: UPPER_SNAKE_CASE for constants
const MAX_BID_AMOUNT = 1000
const API_BASE_URL = "https://api.akash.network"

// **Bad: Inconsistent casing
const DeploymentId = "123"  // Should be camelCase
function CreateDeployment() { }  // Should be camelCase
```

### TypeScript Best Practices

```typescript
// **Good: Explicit types for function parameters and returns
function createDeployment(sdl: string, deposit: number): Promise<Deployment> {
  return api.post<Deployment>("/deployments", { sdl, deposit })
}

// **Good: Use interfaces for object shapes
interface Deployment {
  dseq: string
  owner: string
  state: DeploymentState
  createdAt: Date
}

// **Good: Use enums for fixed values
enum DeploymentState {
  Active = "active",
  Closed = "closed",
  Paused = "paused"
}

// **Bad: Using `any`
function processDeployment(data: any) {  // Avoid `any`
  return data.something
}

// **Better: Use proper types or `unknown`
function processDeployment(data: unknown) {
  if (isDeployment(data)) {
    return data.dseq
  }
}
```

### React Component Conventions

```typescript
// **Good: Functional components with TypeScript
interface DeploymentCardProps {
  deployment: Deployment
  onClose: (id: string) => void
}

export const DeploymentCard: React.FC<DeploymentCardProps> = ({ 
  deployment, 
  onClose 
}) => {
  const handleClose = () => {
    onClose(deployment.dseq)
  }
  
  return (
    <div className="deployment-card">
      <h3>{deployment.dseq}</h3>
      <button onClick={handleClose}>Close</button>
    </div>
  )
}

// **Good: Custom hooks for reusable logic
function useDeployments() {
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchDeployments().then(setDeployments).finally(() => setLoading(false))
  }, [])
  
  return { deployments, loading }
}

// **Bad: Prop drilling (use Context or state management)
<ComponentA deployment={deployment}>
  <ComponentB deployment={deployment}>
    <ComponentC deployment={deployment} />
  </ComponentB>
</ComponentA>
```

### Error Handling

```typescript
// **Good: Try-catch with proper error handling
async function createDeployment(sdl: string): Promise<Deployment> {
  try {
    const response = await api.post<Deployment>("/deployments", { sdl })
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to create deployment: ${error.message}`)
    }
    throw error
  }
}

// **Good: Error boundaries for React
class ErrorBoundary extends React.Component<Props, State> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo)
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorDisplay error={this.state.error} />
    }
    return this.props.children
  }
}
```

### Async/Await

```typescript
// **Good: Use async/await
async function fetchDeployments(): Promise<Deployment[]> {
  const response = await api.get<Deployment[]>("/deployments")
  return response.data
}

// **Good: Handle errors
async function fetchDeployments(): Promise<Deployment[]> {
  try {
    const response = await api.get<Deployment[]>("/deployments")
    return response.data
  } catch (error) {
    console.error("Failed to fetch deployments:", error)
    return []
  }
}

// **Bad: Unhandled promise rejections
function fetchDeployments() {
  return api.get("/deployments")  // What if this fails?
}
```

---

## Documentation Conventions

### Markdown Style

```markdown
<!-- **Good: Clear headings -->
# Main Title
## Section
### Subsection

<!-- **Good: Code blocks with language -->
```typescript
const deployment = await createDeployment(sdl)
```

<!-- **Good: Inline code for commands and variables -->
Use the `provider-services` CLI to create a deployment.

<!-- **Bad: No language specified -->
```
code here
```
```

### Writing Style

- **Use active voice** - "The provider accepts the bid" not "The bid is accepted"
- **Be concise** - Remove unnecessary words
- **Use examples** - Show, don't just tell
- **Link related content** - Help users navigate
- **Update screenshots** - Keep visuals current

---

## Git Conventions

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format
<type>: <subject>

<body>

<footer>
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `chore:` - Maintenance
- `test:` - Tests
- `refactor:` - Code refactoring
- `style:` - Formatting
- `perf:` - Performance

**Examples:**

```bash
# Simple fix
fix: resolve escrow calculation error

# Feature with description
feat: add GPU resource filtering

Providers can now filter available GPUs by model and memory.
This improves bid accuracy for GPU deployments.

Fixes #123

# Breaking change
feat!: change deployment state enum values

BREAKING CHANGE: Deployment states are now lowercase strings
instead of integers. Update client code accordingly.
```

### Branch Names

```bash
# **Good: Descriptive branch names
feature/gpu-bid-filtering
fix/escrow-calculation-error
docs/update-cli-guide
chore/bump-dependencies

# **Bad: Vague names
my-changes
fix-stuff
update
```

---

## Code Review Checklist

### Before Submitting PR

- [ ] Code follows project conventions
- [ ] All tests pass (`make test` or `npm test`)
- [ ] Linter passes (`make lint` or `npm run lint`)
- [ ] Added tests for new functionality
- [ ] Updated documentation if needed
- [ ] Commit messages follow convention
- [ ] Commits are signed-off (`git commit -s`)

### During Code Review

**As Author:**
- Respond to all comments
- Ask for clarification if needed
- Make requested changes promptly
- Learn from feedback

**As Reviewer:**
- Be constructive and respectful
- Explain the "why" behind suggestions
- Praise good code
- Focus on the code, not the person

---

## Additional Resources

### Go

- [Effective Go](https://golang.org/doc/effective_go)
- [Go Code Review Comments](https://github.com/golang/go/wiki/CodeReviewComments)
- [Uber Go Style Guide](https://github.com/uber-go/guide/blob/master/style.md)

### JavaScript/TypeScript

- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [TypeScript Do's and Don'ts](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

### General

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)

---

## Next Steps

- **[Pull Request Process](/docs/developers/contributing/pull-request-process)** - Submit your changes
- **[Getting Started](/docs/developers/contributing/getting-started)** - Make your first contribution

---

**Questions?** Ask in [Discord #developers](https://discord.akash.network)!
