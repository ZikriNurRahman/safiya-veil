// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#AD8B73",
          secondary: "#CEAB93",
          tertiary: "#E3CAA5",
          cream: "#FFFBE9",
        },
      },
    },
  },
  plugins: [],
};
export default config;