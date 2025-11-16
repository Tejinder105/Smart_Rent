import { Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { getColors } from '../../constants/colors';
import { spacing, typography } from '../../constants/theme';
import Card from './Card';

/**
 * StatCard Component
 * Displays a statistic with label and optional icon/color
 * 
 * @param {string} label - Stat label
 * @param {string} value - Stat value
 * @param {React.ReactNode} icon - Optional icon
 * @param {string} variant - 'default' | 'success' | 'danger' | 'warning' | 'info'
 * @param {boolean} interactive - Make card pressable
 * @param {function} onPress - Press handler (if interactive)
 * @param {object} style - Additional styles
 */
const StatCard = ({
  label,
  value,
  icon,
  variant = 'default',
  interactive = false,
  onPress,
  style,
}) => {
  const { isDark } = useSelector((state) => state.theme);
  const colors = getColors(isDark);

  // Color variants for value text
  const valueColorStyles = {
    default: colors.text,
    success: colors.success,
    danger: colors.error,
    warning: colors.warning,
    info: colors.info,
  };

  // Background color variants
  const bgColorStyles = {
    default: 'transparent',
    success: colors.successBg,
    danger: colors.errorBg,
    warning: colors.warningBg,
    info: colors.infoBg,
  };

  return (
    <Card
      variant={interactive ? 'interactive' : 'flat'}
      onPress={onPress}
      style={[{ backgroundColor: bgColorStyles[variant] }, style]}
    >
      {/* Icon (if provided) */}
      {icon && (
        <View style={{ marginBottom: spacing.sm }}>
          {icon}
        </View>
      )}

      {/* Stat value */}
      <Text style={{ 
        fontSize: typography.fontSize['2xl'], 
        fontWeight: typography.fontWeight.bold, 
        color: valueColorStyles[variant], 
        marginBottom: spacing.xs 
      }}>
        {value}
      </Text>

      {/* Stat label */}
      <Text style={{ 
        fontSize: typography.fontSize.sm, 
        color: colors.textSecondary 
      }}>
        {label}
      </Text>
    </Card>
  );
};

export default StatCard;
