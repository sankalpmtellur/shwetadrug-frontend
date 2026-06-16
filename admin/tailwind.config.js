/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#00478D",
        navy: "#0B1C30",
        background: "#F8F9FF",
        surface: "#FFFFFF",
        "surface-soft": "#EFF4FF",
        "surface-strong": "#E5EEFF",
        border: "#C2C6D4",
        muted: "#424752",
        success: "#0F766E",
        warning: "#F59E0B",
        error: "#BA1A1A",
      },
      fontFamily: { sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"] },
      boxShadow: { soft: "0 18px 45px rgba(11, 28, 48, 0.08)" },
    },
  },
  plugins: [],
}
