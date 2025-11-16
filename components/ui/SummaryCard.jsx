import { Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { getColors } from '../../constants/colors';
import Card from './Card';

/**
 * SummaryCard Component
 * Financial summary card with label and amount
 * 
 * @param {string} label - Summary label (e.g., "Total Outstanding")
 * @param {string} amount - Amount (formatted with currency)
 * @param {string} variant - 'default' | 'success' | 'danger' | 'warning' | 'info'
 * @param {React.ReactNode} icon - Optional icon
 * @param {string} subtitle - Optional subtitle/description
 * @param {object} style - Additional styles
 */
const SummaryCard = ({
  label,
  amount,
  variant = 'default',
  icon,
  subtitle,
  style,
}) => {
  const { isDark } = useSelector((state) => state.theme);
  const colors = getColors(isDark);

  // Color variants for amount text
  const amountColorStyles = {
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

  // Icon background color variants
  const iconBgStyles = {
    default: colors.backgroundTertiary,
    success: colors.successBg,
    danger: colors.errorBg,
    warning: colors.warningBg,
    info: colors.infoBg,
  };

  return (
    <Card
      variant="elevated"
      style={[{ backgroundColor: bgColorStyles[variant] }, style]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        {/* Icon (if provided) */}
        {icon && (
          <View style={{ width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12, backgroundColor: iconBgStyles[variant] }}>
            {icon}
          </View>
        )}

        {/* Content */}
        <View style={{ flex: 1 }}>
          {/* Label */}
          <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 4 }}>
            {label}
          </Text>

          {/* Amount */}
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: amountColorStyles[variant], marginBottom: 4 }}>
            {amount}
          </Text>

          {/* Subtitle (if provided) */}
          {subtitle && (
            <Text style={{ fontSize: 12, color: colors.textTertiary }}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
    </Card>
  );
};

export default SummaryCard;
