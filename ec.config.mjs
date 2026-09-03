import { defineEcConfig } from "astro-expressive-code";

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
