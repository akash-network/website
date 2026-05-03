---
aep: 85
title: "Console: Buildpacks-Powered Deployments"
description: "Replace the broken Build & Deploy feature with a Cloud Native Buildpacks pipeline that supports any language"
author: Maxime Beauchamp (@baktun14)
status: Draft
type: Standard
category: Interface
created: 2026-04-24
estimated-completion: 2026-09-30
discussions-to: https://github.com/orgs/akash-network/discussions
roadmap: major
replaces: 28
---

## Abstract

This AEP proposes **replacing the current "Build & Deploy" feature in Akash Console with a Cloud Native Buildpacks** ([buildpacks.io](https://buildpacks.io)) pipeline. The existing flow — referenced via `CI_CD_TEMPLATE_ID` in [`apps/deploy-web/src/config/remote-deploy.config.ts`](apps/deploy-web/src/config/remote-deploy.config.ts) — is in a broken state, hard-coded to a small set of JavaScript web frameworks, and relies on language detection that only reads `package.json`. Anyone deploying a Python, Go, Ruby, Java, Rust, .NET, or PHP application currently has to abandon the flow and produce a Dockerfile manually.

The proposal swaps the underlying runner image and the configuration UI in `RemoteRepositoryDeployManager` for a CNB-based stack. A new `awesome-akash` template ships an Akash-native runner image (`cnb-runtime`) built on the Paketo or Heroku builder. At container start, the runner clones the user's repository, invokes `pack build`, and executes the produced launcher. Language is auto-detected from manifest files (`requirements.txt`, `go.mod`, `Gemfile`, `pom.xml`, `Cargo.toml`, `composer.json`, `*.csproj`, `package.json`). No Dockerfile, no local Docker daemon, and no registry credentials are required of the user.

The change is scoped to Console (`apps/deploy-web`) and the `awesome-akash` repository. No changes to chain protocol, provider services, or Economics.

## Motivation

The existing "Build & Deploy" feature in Console — introduced by [AEP-28 ("Auto Deployment from VCS")](../aep-28) — is the front door for first-time deployers who have a Git repository but no container experience. Today that door is broken: the runtime CI/CD template is brittle, the Console-side configuration form is hard-coded to a small JavaScript-framework allowlist (`supportedFrameworks` in [`remote-deploy.config.ts`](apps/deploy-web/src/config/remote-deploy.config.ts)), and the framework-detection hook only inspects `package.json` (see [`useRemoteDeployFramework`](apps/deploy-web/src/components/remote-deploy/hooks/useRemoteDeployFramework.tsx)). Anyone arriving with a Python, Go, Ruby, Java, Rust, .NET, or PHP project hits a dead end.

Cloud Native Buildpacks are the open-standard way Heroku, Cloud Foundry, Google Cloud Run, and Fly.io solve the same problem. They auto-detect the language, fetch the right toolchain, and produce a runnable OCI image without a Dockerfile. Adopting CNB in Console gives Akash Network multi-language Git-to-deploy parity with leading hyperscalers at a fraction of the engineering cost — and lets us retire a known-broken feature instead of patching it.

This AEP follows AEP-72 ("Console - Improved User Onboarding") in spirit: reduce friction for first-time deployers, broaden the set of workloads that "just work" on Akash, and lean on common SaaS/CSP paradigms rather than asking users to learn Akash-specific concepts before they see any value.

## Specification

### Scope

In scope:
- Console UI (`apps/deploy-web`): replace the existing build configuration form, replace the language-detection hook, point the existing "Build and Deploy" entry at the new template.
- Console config: introduce `BUILDPACKS_TEMPLATE_ID` and `BP_*` protected environment variables; remove or deprecate JavaScript-specific config that no longer applies.
- New runner image and template in `akash-network/awesome-akash`; deprecate the existing CI/CD template.

Out of scope:
- Chain protocol changes.
- Provider-side changes.
- Hosted builder service (no new app under `apps/`).
- Image registry, GHCR push, or two-stage build/deploy orchestration.
- Standalone CLI tool.

### A. Console UI changes (`apps/deploy-web`)

**A.1. Config replacement.** [`apps/deploy-web/src/config/remote-deploy.config.ts`](apps/deploy-web/src/config/remote-deploy.config.ts) is updated to:

- Replace `CI_CD_TEMPLATE_ID` (or alias it) with `BUILDPACKS_TEMPLATE_ID = "akash-network-awesome-akash-automatic-deployment-CICD-buildpacks-template"`. The `gitProvider` query param continues to route the user into the same flow; only the underlying template changes.
- Replace the JavaScript-framework-specific keys in `protectedEnvironmentVariables` (`INSTALL_COMMAND`, `BUILD_COMMAND`, `NODE_VERSION`, `BUILD_DIRECTORY`, `CUSTOM_SRC`, `FRONTEND_FOLDER`) with buildpacks-native keys: `BP_BUILDER_IMAGE`, `BP_LANGUAGE`, `BP_LANGUAGE_VERSION`, `BP_PROCFILE`. Repository / branch / token / `DISABLE_PULL` keys remain unchanged — they are language-agnostic and continue to work.
- Replace the JS-only `supportedFrameworks` array with a multi-language `detectedLanguages` table:

  | id | manifest files | default builder | version env |
  |---|---|---|---|
  | js | `package.json` | `paketobuildpacks/builder-jammy-base` | `BP_NODE_VERSION` |
  | py | `requirements.txt`, `pyproject.toml` | `paketobuildpacks/builder-jammy-base` | `BP_CPYTHON_VERSION` |
  | go | `go.mod` | `paketobuildpacks/builder-jammy-base` | `BP_GO_VERSION` |
  | ruby | `Gemfile` | `paketobuildpacks/builder-jammy-base` | `BP_MRI_VERSION` |
  | java | `pom.xml`, `build.gradle` | `paketobuildpacks/builder-jammy-base` | `BP_JVM_VERSION` |
  | php | `composer.json` | `paketobuildpacks/builder-jammy-base` | `BP_PHP_VERSION` |
  | rust | `Cargo.toml` | `heroku/builder:24` | n/a (toolchain pinned via `rust-toolchain.toml`) |
  | dotnet | `*.csproj` | `heroku/builder:24` | `BP_DOTNET_FRAMEWORK_VERSION` |

**A.2. Component replacements.**

- **Replace** [`RemoteBuildInstallConfig.tsx`](apps/deploy-web/src/components/remote-deploy/deployment-configurations/RemoteBuildInstallConfig.tsx) with a new `BuildpacksConfig.tsx` in the same directory. The new component keeps the `Collapsible` + grid layout but exposes: detected-language badge, builder image dropdown, single language-version input, optional Procfile override, autobuild checkbox (reuses existing `DISABLE_PULL`). All writes continue through [`EnvVarManagerService`](apps/deploy-web/src/services/remote-deploy/env-var-manager.service.ts).
- **Replace** [`useRemoteDeployFramework`](apps/deploy-web/src/components/remote-deploy/hooks/useRemoteDeployFramework.tsx) with `useBuildpackLanguageDetection`. The new hook hits the git provider's tree API once per `(repo, branch)` using the OAuth token already in the Jotai store, and resolves language by first-match priority over the table above. Returns `{ language, confidence, detectedFiles[] }`. The user can override via the language dropdown, which writes to `BP_LANGUAGE`.

**A.3. Edited components.**

- [`RemoteRepositoryDeployManager.tsx`](apps/deploy-web/src/components/remote-deploy/RemoteRepositoryDeployManager.tsx) — swaps the import from `RemoteBuildInstallConfig` to `BuildpacksConfig`. No additional UI affordance ("mode toggle") is added; buildpacks **is** the build pipeline.
- [`NewDeploymentContainer.tsx`](apps/deploy-web/src/components/new-deployment/NewDeploymentContainer/NewDeploymentContainer.tsx) — already detects git-provider templates by ID; the new `BUILDPACKS_TEMPLATE_ID` is recognized via the same mechanism.
- [`TemplateList`](apps/deploy-web/src/components/templates/TemplateList) — the existing **"Build and Deploy"** call-to-action's deep link is updated to point at `BUILDPACKS_TEMPLATE_ID`. The user-visible label and entry point remain unchanged.

**A.4. Unchanged.** [`sdlGenerator.ts`](apps/deploy-web/src/utils/sdl/sdlGenerator.ts) is unchanged — the SDL is structurally identical; only the `image:` and the env var keys differ.

### B. `awesome-akash` template

A new template directory `automatic-deployment-CICD-buildpacks-template/` in [`akash-network/awesome-akash`](https://github.com/akash-network/awesome-akash) containing:

- **`deploy.yaml`** — SDL referencing `image: ghcr.io/akash-network/cnb-runtime:latest`, with the new `BP_*` env vars.
- **`Dockerfile`** for `cnb-runtime` — `FROM paketobuildpacks/builder-jammy-base`. Entrypoint script:
  1. Clone repository using the existing token-handling logic from the legacy CI/CD entrypoint (port verbatim, no rewrite).
  2. Run `pack build app --builder $BP_BUILDER_IMAGE --env-file <BP_*>`.
  3. Exec `/cnb/lifecycle/launcher` from the produced image.
  4. On `DISABLE_PULL=no`, poll commit hash and rebuild on change (port verbatim).
- **`README.md`** + entry in `awesome-akash` template index so the new template surfaces in the gallery API consumed by [`apps/api/src/template/services/template-gallery/template-gallery.service.ts`](apps/api/src/template/services/template-gallery/template-gallery.service.ts).
- **Mark the legacy `automatic-deployment-CICD-template/` as deprecated** in its README and remove it from the curated template index in a follow-up change after a deprecation window (see Backward Compatibility).

### C. Telemetry

Hook into the existing GTM / `dataLayer.push` pipeline (deploy-web standardizes on GTM, not gtag):

- `buildpacks_deploy_started` — properties: `language`, `builder_image`.
- `buildpacks_language_detected` — properties: `language`, `detected_files_count`, `was_overridden`.
- `buildpacks_deploy_succeeded` / `buildpacks_deploy_failed` — best-effort, emitted from the front end on lease/manifest-status transitions.

### D. Phased delivery

| Phase | Scope | Indicative duration |
|---|---|---|
| **1 — MVP / replacement** | Sections A + B + C above; legacy CI/CD template marked deprecated | 2–3 weeks |
| **2 — Polish** | Buildpack layer caching to a persistent volume, per-language version pickers driven by Phase 1 telemetry, Procfile editor refinements; legacy CI/CD template removed from gallery | 3–4 weeks (post-Phase-1 data) |
| **3 — Two-stage build (optional)** | "Build once, run many" mode that pushes the result to GHCR using the user's PAT, deploying a slim runtime image. Triggered only by Phase 2 telemetry showing repeated rebuilds or scaled replicas | Only if data justifies |

A hosted builder service (a new `apps/builder` app under Console operation) is explicitly **not** part of this AEP. If Phase 3 telemetry indicates demand, it would be proposed as a follow-up AEP.

## Rationale

### Why replace, not extend

The existing CI/CD template is broken in production and locked to a JavaScript-only mental model. Maintaining two parallel pipelines (legacy CI/CD + new buildpacks) would split the user's mental model, double the surface area requiring tests, and leave the broken path live in the gallery. Buildpacks is a strict superset of what the JS-only path tried to do — Paketo's `builder-jammy-base` already handles Node — so keeping the legacy path adds no user value. Replacement also lets us delete the JS-only `supportedFrameworks` allowlist and the `package.json`-only detection hook outright, simplifying the code.

### Why runtime build instead of two-stage build-then-push

Three options were considered for where `pack build` executes:

1. **Runtime build inside the deployed workload** (this proposal) — same architectural pattern the legacy CI/CD template was already using; zero new infrastructure; first-cold-start cost paid by the user's lease, not Akash.
2. **Two-stage Akash deployment** — a "builder" workload runs first, pushes to a registry, then a "deploy" workload pulls. Requires registry credentials, two-step UX, polling state. Cleaner long-term but materially more complex.
3. **Hosted builder service** — Akash runs the build farm. Best UX but largest operational lift (CPU/IO costs, multi-tenant isolation, abuse prevention).

Option 1 is the smallest shippable thing that proves user demand at parity with — and beyond — the broken predecessor. Options 2 and 3 are deferred behind Phase 1 telemetry. The cost of option 1 (rebuilding on restart) is identical to the legacy CI/CD template, so the trade-off is not a regression.

### Why Paketo Jammy as the default builder

Paketo's `builder-jammy-base` covers Node, Python, Go, Java, Ruby, .NET, and PHP out of the box without buildpack configuration. Heroku's `builder:24` is used only where Paketo lacks first-party support (Rust, .NET specifics). Both are vendor-neutral CNCF / Heroku-stewarded images.

### Why no backend (`apps/api`) changes

The architectural guardrail is that the replacement adds zero load on Console-operated infrastructure beyond what the legacy flow already incurred. If the team finds itself adding API routes during implementation, that is a signal the proposal has quietly drifted into Option 3 (hosted builder) and warrants a separate AEP.

## Backward Compatibility

This is a **replacement**, not an additive change, and therefore has user-visible compatibility impact that must be managed:

- **Existing deployments** built from the legacy CI/CD template continue to run unchanged. Their lease, manifest, and runtime container are unaffected because they reference the legacy `image:` tag, which is not removed from any registry.
- **The "Build and Deploy" entry point** (`TemplateList` CTA, deep links such as `/new-deployment?step=edit-deployment&gitProvider=github&templateId=…`) starts pointing at `BUILDPACKS_TEMPLATE_ID` after this AEP lands. Users who follow an old link with the legacy `templateId` query parameter still resolve correctly during the deprecation window; after Phase 2 the legacy template is removed from the curated gallery and the deep link 404-style falls back to the buildpacks template.
- **Form-state shape** changes: the env-var keys captured by the wizard differ. Because protected env vars are scoped per template and serialized into the SDL at the moment of deployment, no persisted user state is invalidated. Saved user templates that explicitly reference the legacy `INSTALL_COMMAND` / `BUILD_COMMAND` / `NODE_VERSION` keys continue to work as plain SDL — they bypass the new wizard.
- **No chain or provider compatibility implications.**

A deprecation notice is posted in the legacy template's README and in Console release notes when this AEP enters Last Call.

## Test Cases

Per the project's testing guidelines (CLAUDE.md, `/console-tests` skill):

- **Unit:** language-detection priority and tie-breaking in `useBuildpackLanguageDetection`; env-var writes from `BuildpacksConfig` through `EnvVarManagerService`; template-ID resolution in `RemoteRepositoryDeployManager`.
- **Component:** `RemoteRepositoryDeployManager` renders `BuildpacksConfig` for the new template ID.
- **E2E (Playwright, [`apps/deploy-web/test/`](apps/deploy-web/test/)):** click "Build and Deploy" on `TemplateList` → connect a public Python repository → SDL renders with `cnb-runtime` image and `BP_LANGUAGE=py`.
- **Manual integration matrix (week 1, gating Phase 1):** spike `pack build` against the Akash provider runtime using three reference repos — a Python Flask app, a Go HTTP server, a Rails app. All three must produce a runnable launcher. Block the rest of Phase 1 if this spike fails (see Security Considerations for fallback paths).

## Implementations

Reference implementation lands across two PRs:

- `akash-network/console` PR — Console UI replacement (Section A).
- `akash-network/awesome-akash` PR — `cnb-runtime` Dockerfile + new template + deprecation marker on the legacy template (Section B).

A reproducible end-to-end deploy of one Python and one Go repository via the public Console serves as the acceptance criterion for promoting this AEP to Last Call.

## Security Considerations

- **Arbitrary code execution by design.** Buildpacks execute scripts contained in the user's repository (e.g., `pip install`, `go build`, `npm install` post-install hooks). This is identical to the legacy CI/CD template's threat model: the build runs inside the user's leased provider workload, not in any Console-operated environment. Console publishes no API surface that executes user code; the `cnb-runtime` image runs only inside a user-paid lease.
- **Provider runtime compatibility.** `pack build` traditionally requires a Docker daemon. The runner image relies on Paketo's daemonless `lifecycle` binaries (or Heroku's equivalent), which work in a standard container without `--privileged`. **A spike in week 1 must verify this on the Akash provider runtime before any Phase 1 work commits.** If daemonless lifecycle is incompatible, the fallback is to constrain the AEP to providers that support `--privileged` deployments and document the limitation. Because this AEP replaces a broken feature, the fallback baseline is "the previous JavaScript flow is still gone" — there is no obligation to keep it alive.
- **OAuth token handling.** The replacement reuses the existing token storage path (Jotai `atomWithStorage` → SDL env var via the protected-env mechanism). No new token surface is introduced. Tokens already flow client-side directly to GitHub/GitLab/Bitbucket APIs without Console proxying; the buildpacks template inherits the same behavior.
- **Builder image supply chain.** `paketobuildpacks/builder-jammy-base` and `heroku/builder:24` are vendor-published, signed CNCF/Heroku images. The `cnb-runtime` wrapper image is published from the `awesome-akash` repository under the `akash-network` org's GHCR namespace; provenance attestation is enabled via GitHub's built-in `attest-build-provenance` action.
- **Builder image cold-start cost.** The Paketo Jammy base image is approximately 1.5 GB. First pull on a previously unseen Akash provider adds 30–90 seconds before `pack build` begins. This is a UX cost, not a security cost, but must be documented in the user-facing copy to set expectations. Phase 2 caching reduces this on subsequent rebuilds within a lease.
- **Resource exhaustion.** Buildpacks builds can be memory-hungry (especially Java). The default resource profile in the new template sets generous defaults (4 GiB RAM, 2 CPU), with explicit guidance in the README to bump for JVM / Gradle workloads. No Console-operated resources are at risk.
- **Multi-language repository ambiguity.** A repository containing both `package.json` and `requirements.txt` is real (e.g., Next.js + Python serverless functions). Detection picks first-match-by-priority and surfaces the choice; the user can override via the `BP_LANGUAGE` field. No silent behavior.

## Copyright

All content herein is licensed under [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0).
