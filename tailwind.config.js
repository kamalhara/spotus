/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#4F46E5",
        secondary: "#18181B",
        tertiary: "#A54100",
        bg: "#F8F8FA",
        accent: "#6366F1",
        muted: "#94A3B8",
        surface: "#FFFFFF",
        "surface-alt": "#F1F5F9",
        border: "#E2E8F0",
        "border-light": "#F1F5F9",
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
      },
      borderRadius: {
        "2.5xl": "20px",
        "3.5xl": "28px",
        "4xl": "32px",
      },
    },
  },
  plugins: [],
};
