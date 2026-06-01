/** @type {import('tailwindcss').Config} */
module.exports = {
 content: [
"./app/**/*.{js,jsx,ts,tsx}",
"./components/**/*.{js,jsx,ts,tsx}",
 ],
 darkMode:"class",
 presets: [require("nativewind/preset")],
 theme: {
 extend: {
 colors: {
 primary:"var(--color-primary)",
"primary-light":"var(--color-primary-light)",
"primary-dark":"var(--color-primary-dark)",
"primary-surface":"var(--color-primary-surface)",
 secondary:"var(--color-secondary)",
 bg:"var(--color-bg)",
 muted:"var(--color-muted)",
 surface:"var(--color-surface)",
"surface-alt":"var(--color-surface-alt)",
"surface-elevated":"var(--color-surface-elevated)",
 border:"var(--color-border)",
"border-light":"var(--color-border-light)",
 
 success:"var(--color-success)",
"success-surface":"var(--color-success-surface)",
 
 info:"var(--color-info)",
"info-surface":"var(--color-info-surface)",
 
 warning:"var(--color-warning)",
"warning-surface":"var(--color-warning-surface)",
 
 danger:"var(--color-danger)",
"danger-surface":"var(--color-danger-surface)",

 heart:"var(--color-heart)",
"heart-surface":"var(--color-heart-surface)",

"chat-sent":"#4F46E5",
"chat-sent-dark":"#4338CA",
"chat-received":"var(--color-chat-received)",
 card:"var(--color-card)",
"card-border":"var(--color-card-border)",
"input-bg":"var(--color-input-bg)",
 skeleton:"var(--color-skeleton)",
 },
 borderRadius: {
"2.5xl":"20px",
"3.5xl":"28px",
"4xl":"32px",
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
