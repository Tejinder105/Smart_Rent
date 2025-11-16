import { colors as _colors, getColors } from "./colors";

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
    };

export const borderRadius = {
  none: 0,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  full: 9999,
};

export const typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  fontWeight: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  letterSpacing: {
    tight: -0.2,
    normal: 0,
    wide: 0.4,
  },
};

export const shadows = (isDark = false) => {
  const baseColor = isDark ? "0,0,0" : "2,6,23";
  return {
    none: {
      shadowColor: "transparent",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: `rgba(${baseColor}, ${isDark ? 0.45 : 0.08})`,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDark ? 0.45 : 0.08,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: `rgba(${baseColor}, ${isDark ? 0.5 : 0.12})`,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.5 : 0.12,
      shadowRadius: 6,
      elevation: 3,
    },
    lg: {
      shadowColor: `rgba(${baseColor}, ${isDark ? 0.55 : 0.18})`,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: isDark ? 0.55 : 0.18,
      shadowRadius: 12,
      elevation: 8,
    },
    xl: {
      shadowColor: `rgba(${baseColor}, ${isDark ? 0.6 : 0.24})`,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: isDark ? 0.6 : 0.24,
      shadowRadius: 18,
      elevation: 14,
    },
  };
};

export const layout = {
  borderWidth: {
    thin: 1,
    normal: 1.5,
    thick: 2,
  },
  iconSize: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 36,
  },
  avatarSize: {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 56,
    xl: 72,
  },
  containerPadding: spacing.lg,
  screenPadding: spacing.xl,
  cardPadding: spacing.lg,
};

export const animations = {
  duration: {
    fast: 120,
    normal: 220,
    slow: 360,
  },
  easing: {
    linear: "linear",
    easeIn: "ease-in",
    easeOut: "ease-out",
    easeInOut: "ease-in-out",
  },
};

export const getTheme = (isDark = false) => {
  const colorSet = getColors(isDark);

  return {
    isDark,
    colors: colorSet,
    spacing,
    typography,
    borderRadius,
    shadows: shadows(isDark),
    layout,
    animations,
  };
};

export const theme = getTheme(false);

// Re-export getColors as named export for direct import
export { getColors };

export default {
  colors: _colors,   // full color object with light/dark
  getColors,
  getTheme,
  spacing,
  typography,
  borderRadius,
  shadows,
  layout,
  animations,
};
