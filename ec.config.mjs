import { defineEcConfig } from "astro-expressive-code";

// Expressive Code options live here (rather than inline in astro.config.mjs)
// so the <Code> component can load them; options containing functions are not
// serializable across the integration boundary.
export default defineEcConfig({
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
});
