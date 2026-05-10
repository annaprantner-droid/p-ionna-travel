/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#eaecf3",
          100: "#c5cbdc",
          200: "#9ba6c1",
          300: "#7180a5",
          400: "#4f5f8c",
          500: "#2f4072",
          600: "#1f2e5b",
          700: "#172446",
          800: "#0f1a33",
          900: "#0a1228",
          950: "#050a18",
        },
        ocean: {
          400: "#5fb6ff",
          500: "#37a3ff",
          600: "#1f8cea",
        },
        emerald2: {
          500: "#149e7a",
        },
      },
      fontFamily: {
        sans: ['"Inter"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 6px 24px -8px rgba(15, 26, 51, 0.18)",
      },
      keyframes: {
        spinSlow: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        fadeIn: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        bounceDot: {
          "0%, 80%, 100%": { transform: "translateY(0)", opacity: "0.4" },
          "40%": { transform: "translateY(-4px)", opacity: "1" },
        },
      },
      animation: {
        "spin-slow": "spinSlow 12s linear infinite",
        floaty: "floaty 3s ease-in-out infinite",
        "fade-in": "fadeIn 0.35s ease-out both",
        "bounce-dot": "bounceDot 1.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
