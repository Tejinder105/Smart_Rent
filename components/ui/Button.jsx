import { ActivityIndicator, Text, TouchableOpacity } from "react-native";
import { useSelector } from "react-redux";
import { getColors } from "../../constants/colors";
import { borderRadius, spacing, typography } from "../../constants/theme";

const Button = ({
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  onPress,
  children,
  className = "",
  style,
  ...props
}) => {
  const { isDark } = useSelector((state) => state.theme);
  const colors = getColors(isDark);

  const variantStyles = {
    primary: {
      bg: colors.primary,
      text: colors.textInverse,
      borderWidth: 0,
    },
    secondary: {
      bg: colors.backgroundTertiary,
      text: colors.text,
      borderWidth: 0,
    },
    outline: {
      bg: "transparent",
      text: colors.primary,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    danger: {
      bg: colors.danger,
      text: colors.textInverse,
      borderWidth: 0,
    },
    ghost: {
      bg: "transparent",
      text: colors.primary,
      borderWidth: 0,
    },
  };

  const sizeStyles = {
    sm: { 
      paddingVertical: spacing.sm, 
      paddingHorizontal: spacing.lg, 
      fontSize: typography.fontSize.sm 
    },
    md: { 
      paddingVertical: spacing.md, 
      paddingHorizontal: spacing.xl, 
      fontSize: typography.fontSize.base 
    },
    lg: { 
      paddingVertical: spacing.lg, 
      paddingHorizontal: spacing['2xl'], 
      fontSize: typography.fontSize.lg 
    },
  };

  return (
    <TouchableOpacity
      className={className}
      style={[
        {
          backgroundColor: variantStyles[variant].bg,
          borderWidth: variantStyles[variant].borderWidth,
          borderColor: variantStyles[variant].borderColor,
          paddingVertical: sizeStyles[size].paddingVertical,
          paddingHorizontal: sizeStyles[size].paddingHorizontal,
          borderRadius: borderRadius.lg,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          opacity: disabled || loading ? 0.5 : 1,
        },
        style,
      ]}
      disabled={disabled || loading}
      onPress={onPress}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <>
          <ActivityIndicator color={variantStyles[variant].text} />
          <Text style={{ marginLeft: spacing.sm, color: variantStyles[variant].text }}>
            Loading...
          </Text>
        </>
      ) : (
        <>
          {leftIcon}
          <Text
            style={{
              color: variantStyles[variant].text,
              fontSize: sizeStyles[size].fontSize,
              fontWeight: typography.fontWeight.semibold,
            }}
          >
            {children}
          </Text>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
};

export default Button;
