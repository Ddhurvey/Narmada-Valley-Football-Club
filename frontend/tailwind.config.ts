import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // NVFC Brand Colors
        nvfc: {
          primary: "#1a1f71", // Deep Blue
          secondary: "#ffd700", // Gold
          accent: "#e63946", // Red
          dark: "#0a0e27",
          light: "#f8f9fa",
        },
        // Extended palette
        brand: {
          blue: {
            50: "#e6f0ff",
            100: "#b3d1ff",
            200: "#80b3ff",
            300: "#4d94ff",
            400: "#1a75ff",
            500: "#1a1f71",
            600: "#151a5c",
            700: "#101447",
            800: "#0a0e27",
            900: "#050712",
          },
          gold: {
            50: "#fffef0",
            100: "#fffacc",
            200: "#fff799",
            300: "#fff366",
            400: "#ffef33",
            500: "#ffd700",
            600: "#ccac00",
            700: "#998100",
            800: "#665600",
            900: "#332b00",
          },
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-down": "slideDown 0.5s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        "bounce-slow": "bounce 3s infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "hero-pattern": "linear-gradient(135deg, #1a1f71 0%, #0a0e27 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
