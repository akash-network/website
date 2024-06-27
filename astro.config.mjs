import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import astroExpressiveCode from "astro-expressive-code";
import { defineConfig } from "astro/config";
import remark from "remark-directive";
import { customAsidePlugin } from "./src/lib/aside/customAsidePlugin";

import robotsTxt from "astro-robots-txt";

// https://astro.build/config
export default defineConfig({
  // experimental: {
  //   contentCollectionCache: true,
  // },
  redirects: {
    "/ecosystem": "/ecosystem/akash-tools/latest/",
    "/development": "/development/welcome/overview/",
    "/community": "/community/akash-insiders/",
    "/about": "/about/general-information/",
    "/about/pricing": "/about/pricing/compare",
    "/blog/a/acc-akash-accelerationism": "/blog/a-acc-akash-accelerationism/",
    "/roadmap":
      "https://github.com/orgs/akash-network/projects/5/views/1?layout=roadmap",
  },
  markdown: {
    // shikiConfig: {
    //   theme: theme,
    // },
    remarkPlugins: [remark, customAsidePlugin],
  },
  integrations: [
    tailwind(),
    sitemap({
      lastmod: new Date("2024-06-27").toISOString(),
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
      },
    }),
    mdx(),
    robotsTxt(),
  ],
  site: "https://akash.network",
});
