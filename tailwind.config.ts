import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        lafiya: {
          teal: "#0f766e",
          amber: "#d97706",
        },
      },
    },
  },
  plugins: [],
};

export default config;
