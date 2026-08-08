import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import astroExpressiveCode from "astro-expressive-code";
import { defineConfig } from "astro/config";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkDirective from "remark-directive";
import remarkMath from "remark-math";
import { customAsidePlugin } from "./src/lib/aside/customAsidePlugin";
import { apiDocsOnly } from "./src/lib/markdown/apiDocsOnly";
import { normalizeMath } from "./src/lib/markdown/normalizeMath";
import { mermaid } from "./src/utils/mermaid";
import { redirects } from "./src/utils/redirects";

export default defineConfig({
  redirects: redirects,
  markdown: {
    remarkPlugins: [
      remarkMath,
      normalizeMath,
      remarkDirective,
      mermaid,
      customAsidePlugin,
    ],
    rehypePlugins: [
      apiDocsOnly(rehypeSlug),
      [
        apiDocsOnly(rehypeAutolinkHeadings),
        {
          behavior: "append",
          // Only h2+ get anchors. The page's <h1> is its title and getting a
          // link to it is meaningless — the page URL already points there.
          test: ["h2", "h3", "h4", "h5", "h6"],
          properties: {
            className: ["heading-anchor"],
            "data-anchor-link": true,
            ariaLabel: "Link to section",
          },
          // The "#" glyph is rendered via CSS (`.heading-anchor-icon::before`)
          // rather than a text node, so it does NOT leak into Astro's extracted
          // heading text and pollute the "On this page" table of contents.
          content: {
            type: "element",
            tagName: "span",
            properties: {
              className: ["heading-anchor-icon"],
              ariaHidden: "true",
            },
            children: [],
          },
        },
      ],
    ],
  },
  integrations: [
    sitemap({
      lastmod: new Date("2024-06-27"),
    }),
    react(),
    // Options are loaded from ec.config.mjs so the <Code> component can share
    // them (see that file).
    astroExpressiveCode(),
    mdx(),
  ],
  site: "https://akash.network",
  server: {
    host: true,
  },
});
