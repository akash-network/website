/**
 * Remark plugin: fix relative links in markdown that is synced from other repos.
 *
 * src/content/aeps                            <- akash-network/AEP, spec/ (whole folder copied)
 * src/content/Development_Current_Groups_Page <- akash-network/community, each group's README.md only
 *
 * Those files are written for GitHub, so links like `IMPLEMENTATION.md`, `../../LICENSE`,
 * `akash-console/README.md` or `/spec/aep-2` resolve on GitHub but 404 on akash.network.
 *
 * Rules, in order, for `link` and `definition` nodes in those two collections only:
 *  1. Absolute URLs (any scheme), `#anchors`, and root-relative site links are left alone,
 *     except `/spec/<aep>` in AEPs, which becomes `/roadmap/<aep>/`.
 *  2. A link to an entry's README (this page or another one) becomes that entry's site page,
 *     e.g. `README.md#auditor-role` -> `#auditor-role`, `../sig-providers/README.md` -> `/current-groups/sig-providers/`.
 *  3. A bare sibling-entry name used as if it were at the repo root (`sig-clients` written inside
 *     wg-client-libraries) becomes that entry's site page.
 *  4. Anything else becomes the file's GitHub URL.
 *     For AEPs (whole folder copied) a target that does not exist locally is broken upstream too:
 *     the link is unwrapped (text kept) and a warning is printed, so it can be fixed in the AEP repo.
 *
 * No dependencies. Register in astro.config.mjs -> markdown.remarkPlugins.
 */
import fs from "node:fs";
import path from "node:path";

export type SyncedSource = {
  contentDir: string; // project-relative, posix
  repo: string; // https://github.com/org/name
  branch: string;
  repoDir: string; // folder in the upstream repo that maps to contentDir ("" = repo root)
  siteBase: string; // route prefix for entries
  fullCopy: boolean; // true when every upstream file is copied, so local existence is meaningful
};

export const SYNCED_SOURCES: SyncedSource[] = [
  {
    contentDir: "src/content/aeps",
    repo: "https://github.com/akash-network/AEP",
    branch: "main",
    repoDir: "spec",
    siteBase: "/roadmap",
    fullCopy: true,
  },
  {
    contentDir: "src/content/Development_Current_Groups_Page",
    repo: "https://github.com/akash-network/community",
    branch: "main",
    repoDir: "",
    siteBase: "/current-groups",
    fullCopy: false,
  },
];

/** Route slug for an entry folder. Must match how the collection id becomes the URL
 *  (observed: "wg-economics-2.0" -> "/current-groups/wg-economics-20/"). */
export const entrySlug = (name: string): string =>
  name.toLowerCase().replace(/[^\p{L}\p{N}_-]/gu, "");

export type RewriteContext = {
  source: SyncedSource;
  entryRelDir: string; // dir of the markdown file, relative to contentDir, e.g. "aep-79/doc"
  entries: Set<string>; // entry folder names in contentDir
  exists: (relToContentDir: string) => boolean;
};

export type RewriteResult =
  | { href: string }
  | { unwrap: true; reason: string }
  | null;

const posix = path.posix;

export function rewriteHref(href: string, ctx: RewriteContext): RewriteResult {
  if (!href) return null;
  const raw = href.trim();
  if (
    /^[a-z][a-z0-9+.-]*:/i.test(raw) ||
    raw.startsWith("#") ||
    raw.startsWith("//")
  )
    return null;

  const hashAt = raw.indexOf("#");
  const pathPart = hashAt >= 0 ? raw.slice(0, hashAt) : raw;
  const hash = hashAt >= 0 ? raw.slice(hashAt) : "";
  const { source, entryRelDir, entries } = ctx;
  const currentEntry = entryRelDir.split("/")[0];
  const page = (entry: string) => `${source.siteBase}/${entrySlug(entry)}/`;

  // Rule 1: root-relative
  if (pathPart.startsWith("/")) {
    if (source.repoDir === "spec") {
      const m = pathPart.match(/^\/spec\/([^/]+)\/?(?:readme\.md)?$/i);
      if (m && entries.has(m[1])) return { href: page(m[1]) + hash };
    }
    return null;
  }
  if (pathPart === "") return null;

  const resolved = posix
    .normalize(posix.join(entryRelDir, pathPart))
    .replace(/\/$/, "");
  const segs = resolved.split("/");
  const entry = segs[0];
  const rest = segs.slice(1).join("/");

  // Rule 2: an entry's README (or the entry folder itself) -> its site page
  if (
    entry !== ".." &&
    entries.has(entry) &&
    (rest === "" || /^readme\.md$/i.test(rest))
  ) {
    if (entry === currentEntry && hash) return { href: hash };
    return { href: page(entry) + hash };
  }

  // Rule 3: sibling entry written as if at repo root (`sig-clients` inside wg-client-libraries)
  const firstRaw = pathPart.replace(/^\.\//, "").split("/")[0];
  const missingHere = source.fullCopy ? !ctx.exists(resolved) : true;
  if (
    !pathPart.startsWith("../") &&
    firstRaw !== currentEntry &&
    entries.has(firstRaw) &&
    missingHere
  ) {
    const tail = pathPart.replace(/^\.\//, "").split("/").slice(1).join("/");
    if (tail === "" || /^readme\.md$/i.test(tail))
      return { href: page(firstRaw) + hash };
  }

  // Rule 4: GitHub
  if (source.fullCopy && !resolved.startsWith("../") && !ctx.exists(resolved)) {
    return {
      unwrap: true,
      reason: `not found in ${source.repo} (${posix.join(source.repoDir, resolved)})`,
    };
  }
  const repoPath = posix.normalize(posix.join(source.repoDir || ".", resolved));
  if (repoPath.startsWith("../")) return null; // points outside the upstream repo; leave it
  return { href: `${source.repo}/blob/${source.branch}/${repoPath}${hash}` };
}

// ---------------- remark plugin ----------------

type Node = {
  type: string;
  url?: string;
  children?: Node[];
  [k: string]: unknown;
};

const entryCache = new Map<string, Set<string>>();
function listEntries(root: string, source: SyncedSource): Set<string> {
  const key = path.join(root, source.contentDir);
  if (!entryCache.has(key)) {
    let names: string[] = [];
    try {
      names = fs
        .readdirSync(key, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name);
    } catch {
      names = [];
    }
    entryCache.set(key, new Set(names));
  }
  return entryCache.get(key)!;
}

export function rewriteSyncedRepoLinks(
  options: { root?: string; sources?: SyncedSource[] } = {},
) {
  const root = options.root ?? process.cwd();
  const sources = options.sources ?? SYNCED_SOURCES;
  return (tree: Node, file: { path?: string; history?: string[] }) => {
    const abs = file?.path ?? file?.history?.[0];
    if (!abs) return;
    const rel = path.relative(root, abs).split(path.sep).join("/");
    const source = sources.find((s) => rel.startsWith(s.contentDir + "/"));
    if (!source) return;
    const entryRelDir = posix.dirname(rel.slice(source.contentDir.length + 1));
    const ctx: RewriteContext = {
      source,
      entryRelDir,
      entries: listEntries(root, source),
      exists: (p) => fs.existsSync(path.join(root, source.contentDir, p)),
    };
    const walk = (node: Node) => {
      const kids = node.children;
      if (!kids) return;
      for (let i = 0; i < kids.length; i++) {
        const child = kids[i];
        if (
          (child.type === "link" || child.type === "definition") &&
          typeof child.url === "string"
        ) {
          const r = rewriteHref(child.url, ctx);
          if (r && "href" in r) child.url = r.href;
          else if (r && "unwrap" in r) {
            console.warn(
              `[rewriteSyncedRepoLinks] ${rel}: unlinked "${child.url}" (${r.reason})`,
            );
            if (child.type === "link") {
              kids.splice(i, 1, ...(child.children ?? []));
              i += (child.children?.length ?? 0) - 1;
              continue;
            }
          }
        }
        walk(child);
      }
    };
    walk(tree);
  };
}
