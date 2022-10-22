/** @type {import('tailwindcss').Config} */
const plugin = require("tailwindcss/plugin");

module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "node_modules/daisyui/dist/**/*.js",
    "node_modules/react-daisyui/dist/**/*.js",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("daisyui"),
    plugin(({ addComponents, theme }) => {
      addComponents({
        ".border-base-outline": {
          borderColor: "hsl(var(--bc) / var(--tw-border-opacity))",
          "--tw-border-opacity": "0.2",
        },
        ".divide-base-outline": {
          "&>:not([hidden])~:not([hidden])": {
            borderColor: "hsl(var(--bc) / var(--tw-border-opacity))",
            "--tw-border-opacity": "0.2",
          },
        },
      });
    }),
    plugin(({ addComponents, theme }) => {
      const headings = {
        ".h1": {
          fontSize: theme("fontSize.2xl"),
          fontWeight: theme("fontWeight.medium"),
        },
        ".h2": {
          fontSize: theme("fontSize.xl"),
          fontWeight: theme("fontWeight.medium"),
        },
        ".h3": {
          fontSize: theme("fontSize.lg"),
          fontWeight: theme("fontWeight.medium"),
        },
        ".h4": {
          fontSize: theme("fontSize.lg"),
          fontWeight: theme("fontWeight.medium"),
        },
        "@screen md": {
          ".h1": {
            fontSize: theme("fontSize.3xl"),
            fontWeight: theme("fontWeight.medium"),
          },
          ".h2": {
            fontSize: theme("fontSize.2xl"),
            fontWeight: theme("fontWeight.medium"),
          },
          ".h3": {
            fontSize: theme("fontSize.xl"),
            fontWeight: theme("fontWeight.medium"),
          },
          ".h4": {
            fontSize: theme("fontSize.lg"),
            fontWeight: theme("fontWeight.medium"),
          },
        },
      };
      addComponents(headings, {
        variants: ["responsive"],
      });
    }),
  ],
};
