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
        "primary-light": "#818CF8",
        "primary-dark": "#3730A3",
        secondary: "#18181B",
        tertiary: "#A54100",
        bg: "#F8F8FA",
        accent: "#6366F1",
        "accent-warm": "#A78BFA",
        muted: "#94A3B8",
        surface: "#FFFFFF",
        "surface-alt": "#F1F5F9",
        "surface-elevated": "#FAFBFF",
        border: "#E2E8F0",
        "border-light": "#F1F5F9",
        success: "#10B981",
        "success-light": "#D1FAE5",
        warning: "#F59E0B",
        "warning-light": "#FEF3C7",
        danger: "#EF4444",
        "danger-light": "#FEE2E2",
        "chat-sent": "#4F46E5",
        "chat-sent-dark": "#4338CA",
        "chat-received": "#FFFFFF",
      },
      borderRadius: {
        "2.5xl": "20px",
        "3.5xl": "28px",
        "4xl": "32px",
      },
      fontFamily: {
        system: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
