const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      screens: {
        "3xl": "1660px",
        slg: "1100px",
        sxl: "1470px",
      },
      fontSize: {
        "2xs": ".625rem",
        "3xs": ".5rem",
        "2lg": "32px",
        "3lg": "40px",
      },
      typography(theme) {
        return {
          DEFAULT: {
            css: {
              "code::before": {
                content: "none", // don’t generate the pseudo-element
                //                content: '""', // this is an alternative: generate pseudo element using an empty string
              },
              "code::after": {
                content: "none",
              },
              code: {
                color: "hsl(var(--foreground))",

                backgroundColor: "hsl(var(--badge-color))",
                border: "1px solid hsl(var(--default-border))",
                fontWeight: "400",
                borderRadius: "8px",
                paddingLeft: theme("spacing[1.5]"),
                paddingRight: theme("spacing[1.5]"),
                paddingTop: theme("spacing.1"),
                paddingBottom: theme("spacing.1"),
                wordBreak: "break-word",
              },
              strong: {
                color: "hsl(var(--foreground))",
              },
              h4: {
                color: "hsl(var(--foreground))",
              },
              td: {
                backgroundColor: "hsl(var(--background2))",
              },
            },
          },
        };
      },
      backgroundImage: {
        "line-dashed": "url('/images/line-dashed.svg')",
        "line-dashed-dark": "url('/images/line-dashed-dark.svg')",
      },

      colors: {
        background: "hsl(var(--background))",
        background2: "hsl(var(--background2))",
        "background-muted": "hsl(var(--background-muted))",
        foreground: "hsl(var(--foreground))",
        para: "hsl(var(--para))",
        cardGray: "hsl(var(--card-gray))",
        textGray: "hsl(var(--text-gray))",
        border: "hsl(var(--border))",
        paraDark: "hsl(var(--para-dark))",
        lightForeground: "hsl(var(--light-foreground))",
        sortText: "hsl(var(--sort-text))",
        darkGray: "hsl(var(--dark-gray))",
        darkText: "var(--dark-text)",
        badgeColor: "hsl(var(--badge-color))",
        iconText: "hsl(var(--icon-text))",
        linkText: "hsl(var(--link-text))",
        defaultBorder: "hsl(var(--default-border))",
        primary: {
          DEFAULT: "#ff414c",
          foreground: "hsl(var(--primary-foreground))",
        },
        "success-light": "#D1FAE5",
        "success-dark": "#065F46",
        lightGray: "var(--light-gray)",
        darkGrayText: "var(--dark-gray-text)",
        darkGrayBorder: "var(--dark-gray-border)",

        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          rose: "hsl(var(--secondary-rose))",
          lemon: "hsl(var(--secondary-lemon))",
          lemonDark: "hsl(var(--secondary-lemon-dark))",
          gray: "hsl(var(--secondary-gray))",
          lavender: "hsl(var(--secondary-lavender))",
          mint: "hsl(var(--secondary-mint))",
          red: "hsl(var(--secondary-red))",
        },
      },

      fontFamily: {
        sans: ["Inter", ...fontFamily.sans],
        instrument: ["Instrument Serif", ...fontFamily.serif],
        jetBrainsMono: ["JetBrains Mono", ...fontFamily.mono],
      },

      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        marquee2: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0%)" },
        },
      },

      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        marquee: "marquee 250s linear infinite reverse",
        marquee2: "marquee2 250s linear infinite reverse",
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("tailwindcss-animate")],
};
