import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";
import remark from "remark-directive";
import { customAsidePlugin } from "./src/lib/aside/customAsidePlugin";
import astroExpressiveCode from "astro-expressive-code";

import mdx from "@astrojs/mdx";

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
  },
  markdown: {
    // shikiConfig: {
    //   theme: theme,
    // },
    remarkPlugins: [remark, customAsidePlugin],
  },
  integrations: [
    tailwind(),
    sitemap(),
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
  ],
  site: "https://akash.network",
});
