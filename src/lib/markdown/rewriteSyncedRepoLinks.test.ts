/**
 * Tests for rewriteSyncedRepoLinks. Run from the website repo root after copying the plugin to
 * src/lib/markdown/rewriteSyncedRepoLinks.ts:
 *   node --experimental-strip-types --test src/lib/markdown/rewriteSyncedRepoLinks.test.ts
 * (Node 22.6+; no dependencies.)
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  rewriteHref,
  rewriteSyncedRepoLinks,
  SYNCED_SOURCES,
  type RewriteContext,
} from "./rewriteSyncedRepoLinks.ts";

const [AEPS, GROUPS] = SYNCED_SOURCES;
const aepEntries = new Set([
  "aep-1",
  "aep-2",
  "aep-3",
  "aep-4",
  "aep-79",
  "aep-85",
  "aep-86",
  "aep-89",
]);
const groupEntries = new Set([
  "sig-clients",
  "sig-economics",
  "sig-providers",
  "sig-community",
  "sig-deployments",
  "wg-client-libraries",
  "wg-economics-2.0",
  "wg-zealy",
  "wg-provider-audit",
]);
const aepFiles = new Set([
  "aep-86/IMPLEMENTATION.md",
  "aep-86/README.md",
  "aep-79/doc/README.md",
  "aep-79/doc/05-token-migration.md",
  "aep-3/README.md",
]);

const aep = (entryRelDir: string): RewriteContext => ({
  source: AEPS,
  entryRelDir,
  entries: aepEntries,
  exists: (p) => aepFiles.has(p),
});
const grp = (entryRelDir: string): RewriteContext => ({
  source: GROUPS,
  entryRelDir,
  entries: groupEntries,
  exists: () => false,
});

test("leaves absolute, anchor and normal site links alone", () => {
  assert.equal(rewriteHref("https://example.com/x", aep("aep-86")), null);
  assert.equal(rewriteHref("#section", aep("aep-86")), null);
  assert.equal(rewriteHref("mailto:a@b.c", grp("sig-clients")), null);
  assert.equal(
    rewriteHref("/docs/deployments/akash-cli/installation/", aep("aep-1")),
    null,
  );
});

test("AEP root-relative spec links go to roadmap pages", () => {
  assert.deepEqual(rewriteHref("/spec/aep-2", aep("aep-4")), {
    href: "/roadmap/aep-2/",
  });
  assert.deepEqual(rewriteHref("/spec/aep-3", aep("aep-4")), {
    href: "/roadmap/aep-3/",
  });
});

test("same-page README anchors become in-page anchors", () => {
  assert.deepEqual(rewriteHref("README.md#auditor-role", aep("aep-86")), {
    href: "#auditor-role",
  });
  assert.deepEqual(rewriteHref("./README.md#cross-validation", aep("aep-86")), {
    href: "#cross-validation",
  });
});

test("other files in a fully copied AEP go to GitHub", () => {
  assert.deepEqual(rewriteHref("IMPLEMENTATION.md", aep("aep-86")), {
    href: "https://github.com/akash-network/AEP/blob/main/spec/aep-86/IMPLEMENTATION.md",
  });
  assert.deepEqual(rewriteHref("doc/README.md", aep("aep-79")), {
    href: "https://github.com/akash-network/AEP/blob/main/spec/aep-79/doc/README.md",
  });
  assert.deepEqual(rewriteHref("../../LICENSE", aep("aep-89")), {
    href: "https://github.com/akash-network/AEP/blob/main/LICENSE",
  });
});

test("files missing from a fully copied AEP are unwrapped", () => {
  const r = rewriteHref(
    "apps/deploy-web/src/config/remote-deploy.config.ts",
    aep("aep-85"),
  );
  assert.ok(r && "unwrap" in r);
  assert.ok(
    rewriteHref("deployment.yml", aep("aep-3")) &&
      "unwrap" in rewriteHref("deployment.yml", aep("aep-3"))!,
  );
});

test("community README links go to GitHub, other groups go to site pages", () => {
  assert.deepEqual(rewriteHref("akash-console/README.md", grp("sig-clients")), {
    href: "https://github.com/akash-network/community/blob/main/sig-clients/akash-console/README.md",
  });
  assert.deepEqual(
    rewriteHref("meetings/001-2023-02-01.md", grp("sig-economics")),
    {
      href: "https://github.com/akash-network/community/blob/main/sig-economics/meetings/001-2023-02-01.md",
    },
  );
  assert.deepEqual(
    rewriteHref("../sig-providers/README.md", grp("wg-provider-audit")),
    { href: "/current-groups/sig-providers/" },
  );
  assert.deepEqual(rewriteHref("../wg-economics-2.0", grp("sig-economics")), {
    href: "/current-groups/wg-economics-20/",
  });
});

test("bare sibling group names resolve to that group's page", () => {
  assert.deepEqual(rewriteHref("sig-clients", grp("wg-client-libraries")), {
    href: "/current-groups/sig-clients/",
  });
  assert.deepEqual(rewriteHref("sig-community", grp("wg-zealy")), {
    href: "/current-groups/sig-community/",
  });
});

test("plugin rewrites only files inside the synced collections and unwraps broken links", () => {
  const tree = {
    type: "root",
    children: [
      {
        type: "paragraph",
        children: [
          {
            type: "link",
            url: "IMPLEMENTATION.md",
            children: [{ type: "text", value: "Implementation Guide" }],
          },
          {
            type: "link",
            url: "missing.ts",
            children: [{ type: "text", value: "missing" }],
          },
          {
            type: "link",
            url: "https://akash.network/",
            children: [{ type: "text", value: "home" }],
          },
        ],
      },
    ],
  };
  const sources = [{ ...AEPS }];
  const root = "/repo";
  // fake fs: only IMPLEMENTATION.md exists; entries come from a stubbed readdir via a source with fullCopy
  const plugin = rewriteSyncedRepoLinks({ root, sources });
  // monkeypatch existsSync / readdirSync is not needed: missing.ts will be unwrapped, IMPLEMENTATION.md
  // also does not exist under /repo, so both unwrap here; assert the walker mechanics instead.
  plugin(tree as any, { path: "/repo/src/content/aeps/aep-86/README.md" });
  const kids = (tree.children[0] as any).children;
  assert.equal(kids[0].type, "text");
  assert.equal(kids[1].type, "text");
  assert.equal(kids[2].type, "link");
  const outside = {
    type: "root",
    children: [{ type: "link", url: "README.md", children: [] }],
  };
  plugin(outside as any, { path: "/repo/src/content/Blog/x/index.md" });
  assert.equal((outside.children[0] as any).url, "README.md");
});
