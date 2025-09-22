# Repository Guidelines

## Project Structure & Module Organization
Astro pages live under `src/pages`, and route names mirror file names (e.g., `src/pages/network/akash.astro` => `/network/akash`). Shared UI is split between `src/components` (React + Astro components) and `src/layouts`. Reusable logic, services, and data helpers live in `src/lib` and `src/utils`. Content collections (MD/MDX) are stored in `src/content`, while global styles sit in `src/styles` and `public/` hosts static assets. Keep large media or externally hosted scripts in `public/` to avoid bundler bloat.

## Build, Test, and Development Commands
Use `npm install` to hydrate dependencies. Run `npm run dev` for a local server with hot reload at `http://localhost:4321`. Build production assets with `npm run build`; the optimized output lands in `dist/`. Validate a production build locally via `npm run preview`. For targeted Astro tasks (content collections, sync, checks), run `npm run astro -- <subcommand>`; for example `npm run astro -- check` performs type and accessibility verification.

## Coding Style & Naming Conventions
Formatting is enforced by Prettier (`prettier.config.js`) with the Astro and Tailwind plugins—run `npx prettier . --write` before opening a PR. Favor PascalCase for React components, dash-case for route files, and camelCase for utilities. Use Tailwind utility classes where possible; place custom tokens in `tailwind.config.cjs`. Keep TypeScript strictness by updating `tsconfig.json` when introducing new aliases.

## Testing Guidelines
Automated tests are not yet integrated, so rely on `npm run build` and `npm run astro -- check` to catch regressions. When adding dynamic behavior, include lightweight assertions within React components (e.g., prop validation via Zod) and document manual QA steps in the PR. Ensure form flows are validated against the HubSpot sandbox and log validation failures to the console for rapid debugging.

## Commit & Pull Request Guidelines
Follow the conventional `<type>: summary` commit format observed in history (`fix: adjust GPU docs`, `chore: update provider docs`). Squash fixups before merging. PRs should describe the user-facing impact, list manual test steps, and link relevant issues. Include screenshots or GIFs for UI changes, and call out content updates that require localization or marketing review.

