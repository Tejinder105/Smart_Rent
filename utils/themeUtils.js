/**
 * Theme Utilities
 * Helper functions for common theme-based styling patterns
 */

/**
 * Create a themed style object
 * @param {Function} styleBuilder - Function that receives theme and returns styles
 * @param {Object} theme - Theme object
 * @returns {Object} Style object
 * 
 * @example
 * const styles = createThemedStyles((theme) => ({
 *   container: {
 *     backgroundColor: theme.colors.background,
 *     padding: theme.spacing.md,
 *   },
 * }), theme);
 */
export const createThemedStyles = (styleBuilder, theme) => {
  return styleBuilder(theme);
};

/**
 * Get status color based on status type
 * @param {Object} colors - Color palette from theme
 * @param {string} status - Status type ('success', 'error', 'warning', 'info')
 * @returns {Object} Status colors (bg, text, border)
 */
export const getStatusColors = (colors, status) => {
  const statusMap = {
    success: {
      bg: colors.successBg,
      text: colors.successText,
      border: colors.successBorder,
      icon: colors.success,
    },
    error: {
      bg: colors.errorBg,
      text: colors.errorText,
      border: colors.errorBorder,
      icon: colors.error,
    },
    warning: {
      bg: colors.warningBg,
      text: colors.warningText,
      border: colors.warningBorder,
      icon: colors.warning,
    },
    info: {
      bg: colors.infoBg,
      text: colors.infoText,
      border: colors.infoBorder,
      icon: colors.info,
    },
    default: {
      bg: colors.backgroundTertiary,
      text: colors.text,
      border: colors.border,
      icon: colors.textSecondary,
    },
  };

  return statusMap[status] || statusMap.default;
};

/**
 * Get category colors
 * @param {Object} colors - Color palette from theme
 * @param {string} categoryId - Category identifier
 * @returns {Object} Category colors (bg, icon, text)
 */
export const getCategoryColors = (colors, categoryId) => {
  return colors.categories[categoryId] || colors.categories.other;
};

/**
 * Create container style with theme
 * @param {Object} theme - Theme object
 * @param {Object} options - Style options
 * @returns {Object} Container style
 */
export const createContainerStyle = (theme, options = {}) => {
  const {
    padding = true,
    backgroundColor = 'background',
    flex = 1,
  } = options;

  return {
    flex,
    backgroundColor: theme.colors[backgroundColor],
    ...(padding && { padding: theme.layout.screenPadding }),
  };
};

/**
 * Create card style with theme
 * @param {Object} theme - Theme object
 * @param {Object} options - Style options
 * @returns {Object} Card style
 */
export const createCardStyle = (theme, options = {}) => {
  const {
    variant = 'flat',
    padding = true,
  } = options;

  const baseStyle = {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    ...(padding && { padding: theme.layout.cardPadding }),
  };

  if (variant === 'elevated') {
    return {
      ...baseStyle,
      ...theme.shadows.md,
    };
  }

  if (variant === 'outline') {
    return {
      ...baseStyle,
      borderWidth: theme.layout.borderWidth.thin,
      borderColor: theme.colors.border,
    };
  }

  return baseStyle;
};

/**
 * Create text style with theme
 * @param {Object} theme - Theme object
 * @param {Object} options - Style options
 * @returns {Object} Text style
 */
export const createTextStyle = (theme, options = {}) => {
  const {
    variant = 'body',
    color = 'text',
    weight = 'normal',
  } = options;

  const variantStyles = {
    h1: {
      fontSize: theme.typography.fontSize['4xl'],
      lineHeight: theme.typography.fontSize['4xl'] * theme.typography.lineHeight.tight,
      fontWeight: theme.typography.fontWeight.bold,
    },
    h2: {
      fontSize: theme.typography.fontSize['3xl'],
      lineHeight: theme.typography.fontSize['3xl'] * theme.typography.lineHeight.tight,
      fontWeight: theme.typography.fontWeight.bold,
    },
    h3: {
      fontSize: theme.typography.fontSize['2xl'],
      lineHeight: theme.typography.fontSize['2xl'] * theme.typography.lineHeight.tight,
      fontWeight: theme.typography.fontWeight.semibold,
    },
    h4: {
      fontSize: theme.typography.fontSize.xl,
      lineHeight: theme.typography.fontSize.xl * theme.typography.lineHeight.normal,
      fontWeight: theme.typography.fontWeight.semibold,
    },
    body: {
      fontSize: theme.typography.fontSize.base,
      lineHeight: theme.typography.fontSize.base * theme.typography.lineHeight.normal,
      fontWeight: theme.typography.fontWeight.normal,
    },
    bodyLarge: {
      fontSize: theme.typography.fontSize.lg,
      lineHeight: theme.typography.fontSize.lg * theme.typography.lineHeight.normal,
      fontWeight: theme.typography.fontWeight.normal,
    },
    bodySmall: {
      fontSize: theme.typography.fontSize.sm,
      lineHeight: theme.typography.fontSize.sm * theme.typography.lineHeight.normal,
      fontWeight: theme.typography.fontWeight.normal,
    },
    caption: {
      fontSize: theme.typography.fontSize.xs,
      lineHeight: theme.typography.fontSize.xs * theme.typography.lineHeight.normal,
      fontWeight: theme.typography.fontWeight.normal,
    },
  };

  return {
    ...variantStyles[variant],
    color: theme.colors[color] || color,
    fontWeight: theme.typography.fontWeight[weight] || weight,
  };
};

/**
 * Create button style with theme
 * @param {Object} theme - Theme object
 * @param {Object} options - Style options
 * @returns {Object} Button style object with container and text styles
 */
export const createButtonStyle = (theme, options = {}) => {
  const {
    variant = 'primary',
    size = 'md',
    disabled = false,
  } = options;

  const sizeStyles = {
    sm: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      fontSize: theme.typography.fontSize.sm,
    },
    md: {
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.md,
      fontSize: theme.typography.fontSize.base,
    },
    lg: {
      paddingHorizontal: theme.spacing['2xl'],
      paddingVertical: theme.spacing.lg,
      fontSize: theme.typography.fontSize.lg,
    },
  };

  const variantStyles = {
    primary: {
      container: {
        backgroundColor: theme.colors.button.primaryBg,
      },
      text: {
        color: theme.colors.button.primaryText,
      },
    },
    secondary: {
      container: {
        backgroundColor: theme.colors.button.secondaryBg,
      },
      text: {
        color: theme.colors.button.secondaryText,
      },
    },
    outline: {
      container: {
        backgroundColor: 'transparent',
        borderWidth: theme.layout.borderWidth.medium,
        borderColor: theme.colors.primary,
      },
      text: {
        color: theme.colors.primary,
      },
    },
    ghost: {
      container: {
        backgroundColor: theme.colors.button.ghostBg,
      },
      text: {
        color: theme.colors.button.ghostText,
      },
    },
    danger: {
      container: {
        backgroundColor: theme.colors.error,
      },
      text: {
        color: '#ffffff',
      },
    },
  };

  const baseContainer = {
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...sizeStyles[size],
    ...variantStyles[variant].container,
    ...(disabled && {
      backgroundColor: theme.colors.button.disabledBg,
      opacity: 0.6,
    }),
  };

  const baseText = {
    fontSize: sizeStyles[size].fontSize,
    fontWeight: theme.typography.fontWeight.semibold,
    ...variantStyles[variant].text,
    ...(disabled && {
      color: theme.colors.button.disabledText,
    }),
  };

  return {
    container: baseContainer,
    text: baseText,
  };
};

/**
 * Get icon color based on context
 * @param {Object} theme - Theme object
 * @param {string} context - Context ('primary', 'secondary', 'tertiary', 'inverse')
 * @returns {string} Icon color
 */
export const getIconColor = (theme, context = 'secondary') => {
  const colorMap = {
    primary: theme.colors.text,
    secondary: theme.colors.textSecondary,
    tertiary: theme.colors.textTertiary,
    inverse: theme.colors.textInverse,
    accent: theme.colors.primary,
  };

  return colorMap[context] || theme.colors.textSecondary;
};

/**
 * Apply opacity to a color
 * @param {string} color - Hex color code
 * @param {number} opacity - Opacity value (0-1)
 * @returns {string} RGBA color string
 */
export const applyOpacity = (color, opacity) => {
  // Remove # if present
  const hex = color.replace('#', '');
  
  // Parse RGB values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export default {
  createThemedStyles,
  getStatusColors,
  getCategoryColors,
  createContainerStyle,
  createCardStyle,
  createTextStyle,
  createButtonStyle,
  getIconColor,
  applyOpacity,
};
