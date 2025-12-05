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

export default defineConfig({
  redirects: redirects,
  markdown: {
    remarkPlugins: [remarkMath, normalizeMath, remarkDirective, mermaid, customAsidePlugin],
  },
  integrations: [
    tailwind(),
    sitemap({
      lastmod: new Date("2024-06-27"),
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
