/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],

  presets: [require("nativewind/preset")],

  theme: {
    extend: {
      // 🎨 SMARTRENT BRAND COLORS (Updated Design System)
      colors: {
        // Primary Brand (Strong Blue)
        primary: {
          50:  "#E6EFFF",
          100: "#CCE0FF",
          200: "#99C1FF",
          300: "#66A2FF",
          400: "#3383FF",
          500: "#0057FF",  // BRAND - Strong Blue
          600: "#0046CC",
          700: "#003499",
          800: "#002366",
          900: "#001133",
        },

        // Accent Color (Vibrant Green for CTAs)
        accent: {
          50:  "#E6F9F0",
          100: "#CCF3E1",
          200: "#99E7C3",
          300: "#66DBA5",
          400: "#33CF87",
          500: "#00C471",  // BRAND ACCENT - Vibrant Green
          600: "#009D5A",
          700: "#007643",
          800: "#004E2C",
          900: "#002716",
        },

        // Neutral Surface System (Light Gray)
        surface: {
          0: "#FFFFFF",
          100: "#F5F7FA",
          200: "#EDF0F4",
          300: "#D4DAE1",
          800: "#1E1E1E",
          900: "#121212",
        },

        // Semantic colors
        success: {
          50: "#E6F9F0",
          100: "#CCF3E1",
          500: "#00C471",
          600: "#009D5A",
          700: "#007643",
        },
        danger: {
          50: "#FFEBED",
          100: "#FFD6DA",
          500: "#E63946",  // Bright Red
          600: "#C92F3B",
          700: "#A62530",
        },
        warning: {
          50: "#FEF3C7",
          100: "#FDE68A",
          500: "#F59E0B",
          600: "#D97706",
        },
        info: {
          50: "#E6EFFF",
          100: "#CCE0FF",
          500: "#0057FF",
          600: "#0046CC",
        },

        // Text tokens
        text: {
          primary: "#1C2A3A",      // Dark Navy
          secondary: "#6B7785",    // Medium Gray
          tertiary: "#9CA5B0",     // Lighter gray
          inverse: "#FFFFFF",
        },

        // Borders
        border: {
          DEFAULT: "#D4DAE1",
          light: "#E5E9ED",
          dark: "#3A3A3A",
        },
      },

      // 📏 SPACING (Synced with theme.js)
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "32px",
        "4xl": "40px",
        "5xl": "48px",
        "6xl": "64px",
      },

      // 🟦 BORDER RADIUS (Matches theme.js)
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
        xl: "18px",
        "2xl": "24px",
        full: "9999px",
      },

      // 📝 TYPOGRAPHY SCALE (Synced with theme.js)
      fontSize: {
        xs: ["12px", { lineHeight: "16px" }],
        sm: ["14px", { lineHeight: "20px" }],
        base: ["16px", { lineHeight: "24px" }],
        lg: ["18px", { lineHeight: "26px" }],
        xl: ["20px", { lineHeight: "28px" }],
        "2xl": ["24px", { lineHeight: "32px" }],
        "3xl": ["30px", { lineHeight: "36px" }],
      },

      // 🌑 Modern shadows (light/dark aware)
      boxShadow: {
        sm: "0 1px 2px rgba(0,0,0,0.05)",
        DEFAULT: "0 2px 4px rgba(0,0,0,0.08)",
        md: "0 4px 8px rgba(0,0,0,0.1)",
        lg: "0 8px 16px rgba(0,0,0,0.12)",
        xl: "0 12px 24px rgba(0,0,0,0.14)",
      },
    },
  },

  plugins: [],
};
