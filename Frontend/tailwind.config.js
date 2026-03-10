export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#3b82f6",      // blue-500 (brighter for dark)
        accent: "#8b5cf6",

        textLight: "#0f172a",
        textDark: "#e5e7eb",

        mutedLight: "#64748b",
        mutedDark: "#94a3b8",

        surfaceLight: "#ffffff",
        surfaceDark: "#020617",
      },
    },
  },
  plugins: [],
};
