import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        zone0: "#EF4444",
        zone1: "#F59E0B",
        zone2: "#22C55E",
      },
    },
  },
  plugins: [],
};

export default config;
