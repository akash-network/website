import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";

const ROOT = process.cwd();
const CONTENT_DIR = "src/content";
const PAGES_DIR = "src/pages";

type ContentRoute = {
  prefix: string;
  collection: string;
  dateFields?: string[];
};

const CONTENT_ROUTES: ContentRoute[] = [
  {
    prefix: "/community/contributions/",
    collection: "Community_Contributions_Page",
  },
  { prefix: "/current-groups/", collection: "Development_Current_Groups_Page" },
  {
    prefix: "/case-studies/",
    collection: "Blog",
    dateFields: ["updatedDate", "pubDate"],
  },
  {
    prefix: "/blog/",
    collection: "Blog",
    dateFields: ["updatedDate", "pubDate"],
  },
  {
    prefix: "/the-bid/",
    collection: "Bits",
    dateFields: ["lastUpdated", "pubDate"],
  },
  { prefix: "/development/", collection: "Development_Page" },
  { prefix: "/community/", collection: "Community_Page" },
  { prefix: "/roadmap/", collection: "aeps" },
  { prefix: "/about/", collection: "About_Page" },
  { prefix: "/docs/", collection: "Docs" },
];

function loadGitDates(): Map<string, Date> {
  const dates = new Map<string, Date>();
  try {
    const shallow = execFileSync(
      "git",
      ["rev-parse", "--is-shallow-repository"],
      { cwd: ROOT, encoding: "utf8" },
    ).trim();
    if (shallow === "true") {
      console.warn(
        "[sitemap] Shallow git clone detected; skipping git-based lastmod. Fetch full history (fetch-depth: 0) to enable it.",
      );
      return dates;
    }
    const log = execFileSync(
      "git",
      [
        "log",
        "--format=@@%cI",
        "--name-only",
        "--no-renames",
        "--",
        CONTENT_DIR,
        PAGES_DIR,
      ],
      { cwd: ROOT, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 },
    );
    let current: Date | undefined;
    for (const line of log.split("\n")) {
      if (line.startsWith("@@")) {
        current = new Date(line.slice(2));
      } else if (line && current && !dates.has(line)) {
        dates.set(line, current);
      }
    }
  } catch (error) {
    console.warn("[sitemap] Could not read git history for lastmod:", error);
  }
  return dates;
}

function readFrontmatter(file: string): Record<string, unknown> {
  const match = readFileSync(file, "utf8").match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return (match && parseYaml(match[1])) || {};
}

function parseDate(value: unknown): Date | undefined {
  if (value instanceof Date) return value;
  if (typeof value !== "string") return undefined;
  const ymd = value.trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  const date = ymd
    ? new Date(Date.UTC(+ymd[1], +ymd[2] - 1, +ymd[3]))
    : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function readFrontmatterDate(
  data: Record<string, unknown>,
  fields: string[],
): Date | undefined {
  for (const field of fields) {
    const date = parseDate(data[field]);
    if (date) return date;
  }
  return undefined;
}

function slugify(segment: string): string {
  return segment
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, "")
    .replace(/\s/g, "-");
}

function listMarkdown(dir: string, rel = ""): string[] {
  const full = path.join(dir, rel);
  if (!existsSync(full)) return [];
  const out: string[] = [];
  for (const entry of readdirSync(full, { withFileTypes: true })) {
    if (entry.name.startsWith("_")) continue;
    const child = path.posix.join(rel, entry.name);
    if (entry.isDirectory()) out.push(...listMarkdown(dir, child));
    else if (/\.mdx?$/.test(entry.name)) out.push(child);
  }
  return out;
}

function indexCollection(collection: string): Map<string, string> {
  const base = path.posix.join(CONTENT_DIR, collection);
  const index = new Map<string, string>();
  for (const rel of listMarkdown(path.join(ROOT, base))) {
    const segments = rel
      .replace(/\.mdx?$/, "")
      .split("/")
      .map(slugify);
    const file = path.posix.join(base, rel);
    if (["index", "readme"].includes(segments.at(-1)!)) {
      const parent = segments.slice(0, -1).join("/");
      if (!index.has(parent)) index.set(parent, file);
    }
    const id = segments.join("/");
    if (!index.has(id)) index.set(id, file);
  }
  return index;
}

function findPageFile(pathname: string): string | undefined {
  const route = pathname.replace(/^\/|\/$/g, "");
  const base = path.posix.join(PAGES_DIR, route);
  const candidates = route
    ? [`${base}.astro`, `${base}.md`, `${base}/index.astro`, `${base}/index.md`]
    : [`${PAGES_DIR}/index.astro`];
  return candidates.find((c) => existsSync(path.join(ROOT, c)));
}

export function createLastmodResolver() {
  const gitDates = loadGitDates();
  const collections = new Map<string, Map<string, string>>();
  const newestInCollection = new Map<string, Date | undefined>();

  const entriesOf = (collection: string) => {
    if (!collections.has(collection)) {
      collections.set(collection, indexCollection(collection));
    }
    return collections.get(collection)!;
  };

  const entryDate = (route: ContentRoute, file: string) =>
    route.dateFields
      ? readFrontmatterDate(
          readFrontmatter(path.join(ROOT, file)),
          route.dateFields,
        )
      : gitDates.get(file);

  const newestPost = (route: ContentRoute): Date | undefined => {
    if (!newestInCollection.has(route.collection)) {
      let newest: Date | undefined;
      for (const file of entriesOf(route.collection).values()) {
        const data = readFrontmatter(path.join(ROOT, file));
        if (data.draft === true || data.draft === "true") continue;
        const date = readFrontmatterDate(data, route.dateFields ?? []);
        if (date && (!newest || date > newest)) newest = date;
      }
      newestInCollection.set(route.collection, newest);
    }
    return newestInCollection.get(route.collection);
  };

  return (url: string): Date | undefined => {
    const pathname = decodeURIComponent(new URL(url).pathname);
    const pageFile = findPageFile(pathname);
    const route = CONTENT_ROUTES.find((r) =>
      `${pathname}/`.startsWith(r.prefix),
    );
    const entryFile = route
      ? entriesOf(route.collection).get(
          pathname.slice(route.prefix.length).replace(/\/$/, ""),
        )
      : undefined;

    const dates = [
      pageFile ? gitDates.get(pageFile) : undefined,
      route && entryFile ? entryDate(route, entryFile) : undefined,
    ].filter((d): d is Date => d !== undefined);
    if (dates.length) return new Date(Math.max(...dates.map(Number)));
    if (pageFile || entryFile) return undefined;

    if (route?.dateFields) return newestPost(route);
    return undefined;
  };
}
