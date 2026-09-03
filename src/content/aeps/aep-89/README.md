---
aep: 89
title: "Unified Akash Command-Line Interface"
description: "Establish akt as the single user-facing CLI and separate command ownership from daemon and library repositories"
author: Joseph Chalabi (@chalabi2) Artur Troian (@troian)
status: Draft
type: Standard
category: Interface
created: 2026-08-14
discussions-to: https://github.com/orgs/akash-network/discussions
roadmap: major
requires: 56, 63
---

## Abstract

This AEP establishes `akt` as the canonical command-line interface for Akash
users. It consolidates user-facing commands that have historically been spread
across the `akash` node binary, the `provider-services` binary, and CLI packages
in the Chain SDK. Node and provider binaries retain commands needed to run their
respective services, while `akt` owns chain transactions and queries, deployment
workflows, provider gateway operations, local contexts and keys, Console API
access, and monitoring.

The change creates a repository boundary as well as a consistent command
surface. The node, provider, and `akt` repositories may depend on reusable Chain
SDK libraries, but must not share an assembled user CLI or import user-facing
commands from one another. A deployment action is defined once and dispatched
through either a self-custodial chain transport or the managed Console API,
according to the active context.

This AEP does not change the Akash protocol, on-chain message types, provider
protocols, or the operation of node and provider services.

## Motivation

Akash users currently encounter several command-line products depending on the
task they need to perform. Chain queries and transactions have lived in the
`akash` binary, provider interactions in `provider-services`, and reusable CLI
construction in the Chain SDK. Each surface has its own release cadence,
configuration model, flags, output conventions, and assumptions about
authentication.

The result is unnecessary friction for every network participant:

- Workload owners must install software intended to run a blockchain node or a
  provider before they can manage a deployment.
- Validators and node operators receive broad client functionality in a daemon
  binary even when they only need node lifecycle commands.
- Providers use one binary to run infrastructure and another set of commands in
  that same binary to act as an Akash client.
- Automation must account for different configuration homes, output formats,
  authentication methods, and command hierarchies.
- A change to user-facing behavior can require coordinated releases across
  repositories that do not otherwise need to depend on each other.

Moving command constructors into another shared package would preserve the
underlying problem. It would still make unrelated binaries agree on presentation
logic and release it together. The durable boundary is a single client product
that consumes reusable protocol libraries, while daemons remain focused on
running network services.

Akash also has two established ways to manage workloads: direct, self-custodial
transactions and the managed Console API defined by AEP-63. Separate command
trees for those paths would expose infrastructure choices to users and allow the
same action to drift in syntax and behavior. The unified CLI needs one action
model with a transport selected from the user's context.

## Specification

### Scope

This AEP standardizes:

- ownership of the public Akash command-line interface;
- the boundary between user commands and daemon commands;
- the command groups that must be available through `akt`;
- context-based selection of authentication and transport;
- behavior required for human and machine-readable use;
- migration from the legacy binaries; and
- removal of cross-repository CLI dependencies.

This AEP does not standardize terminal styling, the internal local database
schema, a full-screen interface, plugin APIs, or the internal package layout of
the implementation. Those details may evolve without changing the interface
boundary defined here.

### Repository responsibilities

The Akash repositories have the following responsibilities after migration:

| Repository | Responsibility |
| --- | --- |
| `akash-network/akt` | The canonical user-facing CLI, including local client state and workflows. |
| `akash-network/chain-sdk` | Reusable protocol types, clients, signing support, SDL support, certificate support, and provider API libraries. |
| `akash-network/node` | The blockchain node daemon and commands required to initialize, configure, operate, inspect, export, and test a node. |
| `akash-network/provider` | The provider daemon and commands required to configure, migrate, operate, and inspect provider infrastructure. |

`akt`, the node, and the provider may each depend on Chain SDK libraries. The
node and provider must not import `akt`, and they must not import a shared package
that assembles the general user command tree. `akt` must not import user commands
from the node or provider repositories.

Reusable domain logic belongs in a library with no dependency on a specific CLI
application. Argument parsing, command hierarchy, prompts, presentation, local
client state, and workflow orchestration belong to `akt`. This produces the
following dependency direction:

```text
akt ---------+
node --------+--> Chain SDK libraries
provider ----+
```

There is no dependency edge among `akt`, node, and provider for command
construction.

The existing `pkg.akt.dev/go/cli` package is transitional. Command code may be
clean-copied into `akt` to transfer ownership, but later user-interface changes
must happen in `akt`. The package is deprecated after parity and removed after
its consumers migrate. Other Chain SDK packages remain reusable libraries.

### Canonical user command surface

`akt` must provide one entry point for the following user activities. Command
names below define the top-level ownership and may gain compatible subcommands
over time.

| Activity | Canonical command group |
| --- | --- |
| Select a network, identity, and defaults | `akt context` |
| Manage self-custodial keys | `akt context keys` |
| Submit an arbitrary chain transaction | `akt tx` |
| Query chain state | `akt query` or `akt q` |
| Run a deployment lifecycle action | `akt deploy`, `akt update`, `akt close` |
| Interact with a provider gateway | `akt provider` |
| Use managed Console services | `akt console` |
| Validate and inspect SDL | `akt sdl` |
| Inspect local deployment records | `akt store` |
| Observe chain, deployment, and provider state | `akt monitor` |

Aliases may be supplied for compatibility, but documentation and examples must
use the canonical forms.

`akt` may add client-only command groups without revising this AEP. Extensions
must follow the same repository and transport boundaries and must not move
general user commands back into a daemon.

The root command must not require node or provider daemon configuration. A user
who only submits transactions, queries the network, or manages workloads must be
able to install `akt` without installing either daemon binary.

### Commands retained by the node binary

The node binary retains operations whose subject is the local blockchain node,
including:

- starting the node;
- initializing a node home and genesis state;
- editing or preparing genesis state;
- exporting chain state;
- CometBFT diagnostic and maintenance commands;
- testnet construction and testnet conversion tools;
- node-specific JWT or authentication administration; and
- node version and completion commands.

General chain transactions, general chain queries, key management for user
accounts, deployment workflows, and provider gateway interactions move to
`akt`. A node operator uses the node binary to operate the daemon and `akt` to
act as a network user.

### Commands retained by the provider binary

The provider binary retains operations whose subject is the provider service or
its backing infrastructure, including:

- running the provider service;
- provider operator and administrative commands;
- database or state migrations;
- cluster and namespace maintenance tools;
- provider-internal SDL-to-manifest conversion;
- provider-specific diagnostic tools; and
- provider version and completion commands.

Client-side deployment actions, provider gateway queries, lease events, logs,
shell access, manifest submission, and hostname or endpoint migration requests
move to `akt`. A provider operator uses the provider binary to run infrastructure
and `akt` for client interactions with the chain and gateway.

### Contexts and capabilities

Every network operation executes in a named context. A context combines:

- a network identity, including chain ID and service endpoints;
- an authentication rail;
- rail-specific credentials or references to them; and
- optional user defaults used by commands and workflows.

The supported authentication rails are:

1. **Keyring rail.** The user controls a local Cosmos key and signs chain
   transactions directly.
2. **Console rail.** The user authenticates to the managed Console API described
   by AEP-63. Console performs the supported managed operations on the user's
   behalf.

Commands must declare the capabilities they need, such as chain query, chain
transaction, provider gateway, or Console access. `akt` must check those
requirements before execution and return an actionable error when the selected
context cannot satisfy them.

Raw chain transactions are only available on a context that can sign chain
transactions. Chain queries may be available to either rail when the context has
a chain endpoint. Console-only account and billing operations require Console
authentication.

### One workflow across transports

A user action must not be reimplemented as separate chain and Console commands.
The CLI defines the action once, normalizes its input once, and dispatches it
through the transport selected by the active context.

For example, these commands retain the same user intent on both supported rails:

```shell
akt deploy deploy.yaml
akt update deploy.yaml 123
akt close 123
```

On the keyring rail, the workflow signs transactions, selects a bid, creates a
lease, and sends a manifest as required. On the Console rail, the workflow calls
the corresponding managed APIs. Steps that are not meaningful on a rail are
handled by that transport, not exposed as a second user command.

Equivalent input must have equivalent meaning on both rails. Values that cross
the transport boundary, including deployment deposits, must be parsed and
validated before transport dispatch. Rail-specific code must not reinterpret the
same input differently.

### Command input

The primary values of a command, such as a deployment sequence or SDL path, must
be positional arguments. Flags are optional overrides and must not be the only
way to provide a value required for the primary action.

Commands should inherit network, endpoint, account, output, and transaction
defaults from the active context. A user may override an applicable default for
one invocation without modifying the context.

Commands that replace legacy chain query and transaction commands should retain
their established message and query semantics. Intentional syntax changes must
be documented in the command help and migration guide.

### Output and automation

Every command that returns operational data must support a stable
machine-readable output. Structured results must be available as JSON and YAML.
Human-oriented output is the default when attached to an interactive terminal.
Long-running workflows must provide a JSON Lines mode so each event can be
consumed as it occurs.

Commands must observe the following stream contract:

- command results are written to standard output;
- progress, warnings, and diagnostics are written to standard error;
- non-zero exit status indicates failure; and
- structured output must not be mixed with prompts, progress text, or terminal
  decoration.

Addresses must be printed in full. Amounts must identify their denomination, and
human-oriented output should scale micro-denominated amounts without changing
the value represented. Commands must provide a non-interactive mode or fail
clearly when required input cannot be obtained without a prompt.

### Local state and credentials

`akt` owns its configuration and local state. It must not silently read, modify,
or migrate the legacy `akash` home. Importing an existing mnemonic, certificate,
or configuration is an explicit user action.

Credentials for different authentication rails must remain isolated. Console API
keys must not be stored in the same record as self-custodial private key material,
printed in command output, or written to the action log.

State-changing actions must produce a local action log entry containing enough
information to identify the context, operation, affected resource, time, and
result. Read-only queries must not create action entries. The log must not contain
private keys, mnemonics, API keys, or unredacted secret request data.

### Migration and deprecation

Migration occurs by command ownership, not by preserving every legacy command in
every binary. The expected mapping is:

| Legacy surface | Unified surface |
| --- | --- |
| `akash tx ...` | `akt tx ...` |
| `akash query ...` and `akash q ...` | `akt query ...` and `akt q ...` |
| `akash keys ...` | `akt context keys ...` |
| User network and account configuration | `akt context ...` |
| Deployment lifecycle scripts assembled from chain commands | `akt deploy`, `akt update`, `akt close` |
| `provider-services status` | `akt provider status` |
| `provider-services lease-status` | `akt provider lease-status` |
| `provider-services lease-logs` | `akt provider lease-logs` |
| `provider-services lease-events` | `akt provider lease-events` |
| `provider-services lease-shell` | `akt provider lease-shell` |
| `provider-services send-manifest` | `akt provider send-manifest` |
| `provider-services get-manifest` | `akt provider get-manifest` |
| `provider-services migrate-hostnames` | `akt provider migrate-hostnames` |
| `provider-services migrate-endpoints` | `akt provider migrate-endpoints` |
| Managed deployment API scripts | The same `akt` workflow commands under a Console context |

The migration proceeds in four stages:

1. `akt` ships alongside the legacy user commands until functional and automation
   parity is demonstrated.
2. Akash documentation, installation instructions, examples, and support
   material adopt `akt` as the default client.
3. Legacy binaries mark migrated user commands as deprecated and direct users to
   the corresponding `akt` command for a documented support window.
4. User command assembly is removed from the node and provider binaries and from
   general-purpose CLI packages in the Chain SDK. Reusable protocol libraries
   remain available.

Removing a user command from a daemon must not remove the underlying protocol
capability. External clients may continue to use the Chain SDK or protocol APIs.

Releases must publish a command migration table and identify intentional changes
to arguments, flags, configuration, output, or exit behavior. Automation that
depends on legacy human-readable output must migrate to a structured output
format rather than treating terminal presentation as an API.

### Conformance

An implementation conforms to this AEP when:

- users can perform the supported chain, deployment, provider, and Console
  activities through one `akt` binary;
- node and provider binaries contain only their retained daemon and operator
  commands;
- no daemon repository imports `akt` or a general user command tree;
- workflow actions use one definition across keyring and Console transports;
- context capability checks happen before transport execution;
- structured output obeys the stream contract;
- credentials and state are isolated from the legacy home; and
- migration documentation covers every removed legacy user command.

## Rationale

### A separate client binary

A node daemon, a provider daemon, and a user client have different audiences,
privileges, release cadences, and failure domains. Keeping those products
separate lets a validator update client tooling without changing the node binary,
and lets a workload owner use Akash without installing server software. It also
keeps daemon distributions focused on the code required to run a service.

### Libraries instead of shared commands

Protocol types, signing, SDL processing, certificates, and API clients are useful
to many applications and remain reusable through the Chain SDK established by
AEP-56. A complete command tree is application policy. Sharing it would couple
daemon releases to user experience decisions and recreate the dependency this
AEP removes.

### Contexts instead of global flags

An Akash operation commonly needs a chain ID, RPC endpoint, provider endpoint,
identity, and authentication method. Repeating them makes commands difficult to
read and scripts easy to misconfigure. A named context stores that coherent set
of choices while keeping one-invocation overrides available.

### Transport-independent workflows

Deployment intent does not change because a user signs locally or uses a managed
service. Defining the workflow once prevents differences in argument syntax,
validation, lifecycle ordering, and progress output. Transport adapters preserve
the distinct security and execution models without exposing them as separate
products.

### Alternatives considered

**Keep user commands in the daemon binaries.** This would retain the installation
burden, broad daemon surface, and coordinated releases that motivated the work.

**Move all commands into a shared CLI package.** This would reduce copied code but
preserve command-level dependencies among products with unrelated release
lifecycles.

**Make `akt` a wrapper around legacy binaries.** A wrapper would still require
those binaries to be installed and would inherit their configuration and output
differences. It would unify spelling without unifying ownership.

**Create separate self-custodial and managed commands.** This would encode the
transport into the public interface and duplicate deployment behavior. A context
and capability model provides the same clarity without splitting the action.

## Backward Compatibility

This AEP does not modify consensus, chain state, message encoding, provider
protocols, SDL, or transaction semantics. It does not require a network upgrade
or coordinated activation height.

The binary name, configuration home, and ownership of commands do change. Most
general chain operations preserve their hierarchy after replacing the `akash`
prefix with `akt`. Deployment workflows and provider interactions receive a
smaller task-oriented hierarchy instead of mirroring the internal sequence of
protocol calls.

`akt` uses its own configuration and does not automatically consume the legacy
`akash` home. Existing users must explicitly recover or import keys and copy any
certificate material they choose to reuse. This avoids an upgrade unexpectedly
reading or modifying credentials managed by another binary.

Scripts should select an explicit context and a structured output format. Scripts
that invoke a retained node or provider operator command are unaffected. Scripts
that invoke a migrated user command must adopt the corresponding `akt` command
during the deprecation window.

## Test Cases

Conformance should be verified with automated tests covering:

1. **Command ownership.** The `akt` command tree contains every migrated user
   command. Node and provider command trees retain their operator commands and do
   not expose migrated client commands.
2. **Dependency boundaries.** Build metadata confirms that node and provider do
   not import `akt` or a package that assembles its command tree.
3. **Legacy parity.** Representative chain transactions, chain queries, provider
   gateway operations, and deployment lifecycle operations produce the same
   protocol requests as their legacy equivalents.
4. **Transport parity.** A deployment workflow accepts the same arguments on a
   keyring context and a Console context, while each rail performs only its
   authorized operations.
5. **Capability failures.** A command used with an incompatible context fails
   before a network request and names the missing capability and a remedy.
6. **Automation.** JSON, YAML, and JSON Lines output are parseable, contain no
   diagnostic text, and use non-zero exit status for failure.
7. **Positional input.** Primary resource identifiers and file paths can be
   supplied positionally without a required flag.
8. **State isolation.** A fresh `akt` invocation neither reads nor changes a
   legacy `akash` home unless the user runs an explicit import operation.
9. **Secret handling.** Credentials do not appear in output, errors, or action
   logs.
10. **Action logging.** Successful and failed mutations create an action record,
    while read-only queries do not.

## Implementations

The reference implementation is [`akash-network/akt`](https://github.com/akash-network/akt).
Its architecture and interface are specified in the repository's `DESIGN.md` and
`SPEC.md` documents.

Migration work applies to:

- [`akash-network/node`](https://github.com/akash-network/node);
- [`akash-network/provider`](https://github.com/akash-network/provider); and
- [`akash-network/chain-sdk`](https://github.com/akash-network/chain-sdk).

## Security Considerations

Separating the user client from daemon binaries reduces the amount of client and
credential-handling code distributed with long-running network services. It does
not change the security of the underlying chain or provider protocols.

The selected context determines the network and authority used by an operation.
`akt` must display enough context in confirmation and error output for a user to
identify the target chain and signing identity. Capability checks reduce
accidental use of the wrong rail, but they do not validate that a user intended
to select a particular account or network.

Self-custodial keys remain subject to the protections of the configured keyring.
Console contexts inherit the trust and authorization model of the managed API in
AEP-63. The CLI must not imply that the two rails have the same custody model.

Explicit migration protects legacy credentials from unexpected access, but users
remain responsible for handling mnemonics and certificates safely during import.
Machine-readable output and action logs must never disclose secret material.

Remote endpoints and provider gateways remain untrusted inputs. The CLI must
preserve certificate verification, validate response data at transport
boundaries, and avoid treating terminal control sequences from remote data as
trusted presentation.

## References

- [AEP-56: Chain SDK](../aep-56)
- [AEP-63: Console API for Managed Wallet Users - v1](../aep-63)
- [AEP-84: Console Split: Managed Platform and Self-Custodial Air](../aep-84)

## Copyright

All copyrights and related rights are waived under
[Apache License, Version 2.0](../../LICENSE).
