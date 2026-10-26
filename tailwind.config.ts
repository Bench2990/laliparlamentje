import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: { forest: "#203f37", parchment: "#f6f2e8", brass: "#b69b65" },
      fontFamily: {
        sans: ["Manrope", "sans-serif"],
        display: ["Cormorant Garamond", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
