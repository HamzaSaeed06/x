// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // enable class‑based dark mode
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        primary: "hsl(var(--color-primary))",
        "primary-foreground": "hsl(var(--color-primary-foreground))",
        muted: "hsl(var(--color-muted))",
        "muted-foreground": "hsl(var(--color-muted-foreground))",
        border: "hsl(var(--color-border))",
        background: "hsl(var(--color-background))",
        foreground: "hsl(var(--color-foreground))",
        card: "hsl(var(--color-card))",
        "card-foreground": "hsl(var(--color-card-foreground))",
        "card-border": "hsl(var(--color-card-border))",
      },
    },
  },
  plugins: [
    // Allow using our custom utility files via @apply
    function ({ addBase, addComponents, addUtilities, theme }) {
      // No extra plugin logic needed – utilities are defined in utilities.css
    },
  ],
};
