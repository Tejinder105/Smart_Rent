import { Text, TextInput, View } from "react-native";
import { useSelector } from "react-redux";
import { getColors } from "../../constants/colors";
import { borderRadius, layout, spacing, typography } from "../../constants/theme";

const Input = ({
  label,
  error,
  helperText,
  required,
  leftIcon,
  rightIcon,
  className = "",
  variant = "outline",
  ...props
}) => {
  const { isDark } = useSelector((state) => state.theme);
  const colors = getColors(isDark);

  const variantStyles = {
    outline: {
      backgroundColor: colors.input,
      borderColor: error ? colors.error : colors.inputBorder,
      borderWidth: layout.borderWidth.thin,
    },
    filled: {
      backgroundColor: error ? colors.errorBg : colors.backgroundTertiary,
      borderColor: error ? colors.error : "transparent",
      borderWidth: layout.borderWidth.thin,
    },
  };

  return (
    <View className={className} style={{ marginBottom: spacing.lg }}>
      {label && (
        <Text style={{ 
          marginBottom: spacing.xs, 
          color: colors.text, 
          fontWeight: typography.fontWeight.medium 
        }}>
          {label} {required && <Text style={{ color: colors.error }}>*</Text>}
        </Text>
      )}

      <View style={{ position: "relative" }}>
        {leftIcon && (
          <View style={{ 
            position: "absolute", 
            left: spacing.md, 
            top: spacing.md + 1, 
            zIndex: 10 
          }}>
            {leftIcon}
          </View>
        )}

        <TextInput
          style={[
            {
              paddingVertical: spacing.md,
              paddingHorizontal: spacing.lg,
              borderRadius: borderRadius.lg,
              color: colors.text,
              fontSize: typography.fontSize.base,
            },
            variantStyles[variant],
            leftIcon && { paddingLeft: spacing['5xl'] },
            rightIcon && { paddingRight: spacing['5xl'] },
          ]}
          placeholderTextColor={colors.textTertiary}
          {...props}
        />

        {rightIcon && (
          <View style={{ 
            position: "absolute", 
            right: spacing.md, 
            top: spacing.md + 1 
          }}>
            {rightIcon}
          </View>
        )}
      </View>

      {error && (
        <Text style={{ 
          color: colors.error, 
          fontSize: typography.fontSize.xs, 
          marginTop: spacing.xs 
        }}>
          {error}
        </Text>
      )}

      {!error && helperText && (
        <Text style={{ 
          color: colors.textSecondary, 
          fontSize: typography.fontSize.xs, 
          marginTop: spacing.xs 
        }}>
          {helperText}
        </Text>
      )}
    </View>
  );
};

export default Input;
