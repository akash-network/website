import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import astroExpressiveCode from "astro-expressive-code";
import { defineConfig } from "astro/config";
import remarkDirective from "remark-directive";
import remarkMath from "remark-math";
import { customAsidePlugin } from "./src/lib/aside/customAsidePlugin";
import { normalizeMath } from "./src/lib/markdown/normalizeMath";
import { mermaid } from "./src/utils/mermaid";
import { redirects } from "./src/utils/redirects";
import { getLastmodMap } from "./src/utils/sitemap-lastmod";

// Build the lastmod map at config load time
const lastmodMapPromise = getLastmodMap();

export default defineConfig({
  redirects: redirects,
  markdown: {
    remarkPlugins: [remarkMath, normalizeMath, remarkDirective, mermaid, customAsidePlugin],
  },
  integrations: [
    tailwind(),
    sitemap({
      serialize: async (item) => {
        try {
          const lastmodMap = await lastmodMapPromise;
          const urlPath = new URL(item.url).pathname;
          // Try both with and without trailing slash for robust matching
          const normalizedPath = urlPath.endsWith("/") ? urlPath : `${urlPath}/`;
          const pathWithoutSlash = urlPath.endsWith("/") ? urlPath.slice(0, -1) : urlPath;
          
          // Check both variations
          const customLastmod = lastmodMap.get(normalizedPath) || lastmodMap.get(pathWithoutSlash);
          
          return {
            ...item,
            lastmod: customLastmod || item.lastmod,
          };
        } catch (error) {
          // Fallback to default behavior if there's an error
          console.warn("Error in sitemap serialize:", error);
          return item;
        }
      },
    }),
    react(),
    astroExpressiveCode({
      themes: ["light-plus", "dark-plus"],
      useDarkModeMediaQuery: true,
      themeCssSelector: (theme) => `[data-theme='${theme.name}']`,
      styleOverrides: {
        terminalTitlebarForeground: "var(--theme-header-bg)",
        terminalTitlebarDotsForeground: "var(--three-dots-bg)",
        terminalTitlebarBackground: "var(--theme-header-bg)",
        terminalTitlebarDotsOpacity: "1",
        codeFontFamily: "JetBrains Mono",
      },
    }),
    mdx(),
  ],
  site: "https://akash.network",
});
