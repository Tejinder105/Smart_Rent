const BRAND_PRIMARY = "#0057FF"; 
const BRAND_ACCENT = "#00C471"; 
const BRAND_PRIMARY_LIGHT = "#4D94FF"; 

export const colors = {
  light: {
    // Brand Colors
    primary: BRAND_PRIMARY,        
    primaryLight: "#4D8AFF",       
    primaryDark: "#0043CC",        // Darker variation
    primaryBg: "#E6EFFF",          // Very subtle blue tint for backgrounds
    
    accent: BRAND_ACCENT,          // #00C471 - Vibrant Green for CTAs
    accentBg: "#E6F9F0",           // Subtle green background

    // Background hierarchy (from design system)
    background: "#FFFFFF",         // Pure White - main background
    backgroundSecondary: "#F5F7FA", // Light Gray for subtle areas
    backgroundTertiary: "#F5F7FA", // Light Gray - cards/surfaces
    surface: "#F5F7FA",            // Light Gray for surfaces
    card: "#F5F7FA",               // Light Gray for cards
    cardHover: "#EDF0F4",

    // Text (from design system)
    text: "#1C2A3A",               // Dark Navy - primary text
    textSecondary: "#6B7785",      // Medium Gray - labels, helper text
    textTertiary: "#9CA5B0",       // Lighter gray for inactive items
    textInverse: "#FFFFFF",        // White text on dark backgrounds

    // Borders / dividers
    border: "#D4DAE1",
    borderLight: "#E5E9ED",
    borderFocus: BRAND_PRIMARY,

    // Status Colors
    success: "#00C471",            // Vibrant Green - using accent color
    successBg: "#E6F9F0",
    warning: "#F59E0B",
    warningBg: "#FEF3C7",
    danger: "#E63946",             // Bright Red - alerts/errors
    dangerBg: "#FFEBED",
    info: "#0057FF",               // Strong Blue - using primary color
    infoBg: "#E6EFFF",

    // Components (semantic)
    input: "#F5F7FA",
    inputBg: "#FFFFFF",
    inputBorder: "#C4CDD5",
    inputDisabled: "#EDF0F4",
    inputFocus: BRAND_PRIMARY,

    // Tab / nav
    tabBarBg: "#FFFFFF",
    tabBarBorder: "#E5E9ED",
    tabBarActive: BRAND_PRIMARY,
    tabBarInactive: "#6B7785",

    // Utility
    overlay: "rgba(28,42,58,0.55)",
    shadow: "rgba(28,42,58,0.08)",

    // Additional semantic colors
    backgroundElevated: "#FFFFFF",
    backgroundMuted: "#F5F7FA",

    // Category / micro palettes
    category: {
      utilities: { bg: "#FEF3C7", fg: "#92400E" },
      groceries:  { bg: "#E6F9F0", fg: "#166534" },
      internet:   { bg: "#E6EFFF", fg: "#1E40AF" },
      maintenance: { bg: "#FED7AA", fg: "#9A3412" },
      rent:       { bg: "#E9D5FF", fg: "#6B21A8" },
      cleaning:   { bg: "#FCE7F3", fg: "#9F1239" },
      furniture:  { bg: "#E0E7FF", fg: "#3730A3" },
      other:      { bg: "#F3F4F6", fg: "#374151" },
    },
  },

  dark: {
    // Brand Colors (adapted for dark mode)
    primary: BRAND_PRIMARY_LIGHT,  // #4D94FF - Lighter Blue for visibility
    primaryLight: "#80B0FF",
    primaryDark: "#3374CC",
    primaryBg: "#1A2847",          // Dark blue background
    
    accent: BRAND_ACCENT,          // #00C471 - Vibrant Green works in both modes
    accentBg: "#0D3D29",           // Dark green background

    // Background hierarchy (from dark mode design)
    background: "#121212",         // Dark Charcoal - main background (Material Design standard)
    backgroundSecondary: "#1E1E1E", // Dark Gray for sections
    backgroundTertiary: "#2A2A2A",  // Slightly lighter for elevation
    surface: "#1E1E1E",            // Dark Gray for cards/surfaces
    card: "#1E1E1E",               // Dark Gray for cards
    cardHover: "#2A2A2A",

    // Text (from dark mode design)
    text: "#E1E1E1",               // Off-White - main text
    textSecondary: "#8A8A8A",      // Medium Gray - labels
    textTertiary: "#666666",       // Darker gray for less important text
    textInverse: "#121212",        // Dark text on light backgrounds

    // Borders
    border: "#3A3A3A",
    borderLight: "#2E2E2E",
    borderFocus: BRAND_PRIMARY_LIGHT,

    // Status Colors (adjusted for dark mode)
    success: "#00C471",            // Vibrant Green - same as light mode
    successBg: "#0D3D29",
    warning: "#FBBF24",
    warningBg: "#78350F",
    danger: "#FF5A5F",             // Soft Red - more legible on dark
    dangerBg: "#4D1A1D",
    info: "#4D94FF",               // Lighter Blue
    infoBg: "#1A2847",

    // Components
    input: "#1E1E1E",
    inputBg: "#121212",
    inputBorder: "#3A3A3A",
    inputDisabled: "#1A1A1A",
    inputFocus: BRAND_PRIMARY_LIGHT,

    // Tab / nav
    tabBarBg: "#121212",
    tabBarBorder: "#2A2A2A",
    tabBarActive: BRAND_PRIMARY_LIGHT,
    tabBarInactive: "#666666",

    // Utility
    overlay: "rgba(0,0,0,0.65)",
    shadow: "rgba(0,0,0,0.5)",

    // Additional semantic colors
    backgroundElevated: "#1E1E1E",
    backgroundMuted: "#1A1A1A",

    // Category palettes adjusted for dark
    category: {
      utilities: { bg: "#78350F", fg: "#FCD34D" },
      groceries:  { bg: "#0D3D29", fg: "#00C471" },
      internet:   { bg: "#1A2847", fg: "#4D94FF" },
      maintenance: { bg: "#7C2D12", fg: "#FED7AA" },
      rent:       { bg: "#581C87", fg: "#E9D5FF" },
      cleaning:   { bg: "#831843", fg: "#F9A8D4" },
      furniture:  { bg: "#3730A3", fg: "#A5B4FC" },
      other:      { bg: "#1F2937", fg: "#D1D5DB" },
    },
  },
};

// convenience getter
export const getColors = (isDark = false) =>
  isDark ? colors.dark : colors.light;

export default {
  colors,
  getColors,
};
