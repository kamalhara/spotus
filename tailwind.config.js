/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        "primary-light": "var(--color-primary-light)",
        "primary-dark": "var(--color-primary-dark)",
        "primary-surface": "var(--color-primary-surface)",
        secondary: "var(--color-secondary)",
        "text-tertiary": "var(--color-text-tertiary)",
        bg: "var(--color-bg)",
        muted: "var(--color-muted)",
        surface: "var(--color-surface)",
        "surface-alt": "var(--color-surface-alt)",
        "surface-elevated": "var(--color-surface-elevated)",
        border: "var(--color-border)",
        "border-light": "var(--color-border-light)",

        success: "var(--color-success)",
        "success-surface": "var(--color-success-surface)",

        info: "var(--color-info)",
        "info-surface": "var(--color-info-surface)",

        warning: "var(--color-warning)",
        "warning-surface": "var(--color-warning-surface)",

        danger: "var(--color-danger)",
        "danger-surface": "var(--color-danger-surface)",

        heart: "var(--color-heart)",
        "heart-surface": "var(--color-heart-surface)",
      },
      borderRadius: {
        "2.5xl": "20px",
        "3.5xl": "28px",
        "4xl": "32px",
      },
      fontFamily: {
        display: ["PlusJakartaSans_800ExtraBold"],
        heading: ["PlusJakartaSans_700Bold"],
        semibold: ["PlusJakartaSans_600SemiBold"],
        medium: ["PlusJakartaSans_500Medium"],
        body: ["PlusJakartaSans_400Regular"],
        sans: ["PlusJakartaSans_400Regular"],
      },
    },
  },
  plugins: [],
};
