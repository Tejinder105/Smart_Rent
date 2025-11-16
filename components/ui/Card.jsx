import { TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { getColors } from "../../constants/colors";
import { borderRadius, layout, spacing } from "../../constants/theme";

const Card = ({
  variant = "flat",
  onPress,
  children,
  className = "",
  style,
  ...props
}) => {
  const { isDark } = useSelector((state) => state.theme);
  const colors = getColors(isDark);

  const base = {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: variant === "flat" ? layout.borderWidth.thin : 0,
    borderColor: colors.border,
  };

  const shadow = {
    elevated: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    interactive: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
  };

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      className={className}
      style={[base, shadow[variant], style]}
      onPress={onPress}
      activeOpacity={0.9}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Card;
