import { Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { getColors } from '../../constants/colors';
import { borderRadius, layout, spacing, typography } from '../../constants/theme';
import Button from './Button';

/**
 * EmptyState Component
 * Consistent empty state UI with icon, message, and optional action
 * 
 * @param {React.ReactNode} icon - Icon component (e.g., Lucide icon)
 * @param {string} title - Main title
 * @param {string} message - Descriptive message
 * @param {string} actionLabel - Action button label
 * @param {function} onAction - Action button press handler
 * @param {string} actionVariant - Button variant ('primary' | 'secondary' | 'outline')
 * @param {object} style - Additional styles
 */
const EmptyState = ({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  actionVariant = 'primary',
  style,
}) => {
  const { isDark } = useSelector((state) => state.theme);
  const colors = getColors(isDark);

  return (
    <View style={[
      { 
        alignItems: 'center', 
        justifyContent: 'center', 
        paddingHorizontal: spacing['2xl'], 
        paddingVertical: spacing['5xl'] 
      }, 
      style
    ]}>
      {/* Icon container */}
      {icon && (
        <View style={{ 
          width: layout.iconSize.xl * 2, 
          height: layout.iconSize.xl * 2, 
          backgroundColor: colors.backgroundTertiary, 
          borderRadius: borderRadius.full, 
          alignItems: 'center', 
          justifyContent: 'center', 
          marginBottom: spacing.lg 
        }}>
          {icon}
        </View>
      )}

      {/* Title */}
      {title && (
        <Text style={{ 
          color: colors.text, 
          fontWeight: typography.fontWeight.bold, 
          fontSize: typography.fontSize.lg, 
          textAlign: 'center', 
          marginBottom: spacing.sm 
        }}>
          {title}
        </Text>
      )}

      {/* Message */}
      {message && (
        <Text style={{ 
          color: colors.textSecondary, 
          textAlign: 'center', 
          fontSize: typography.fontSize.base, 
          marginBottom: spacing['2xl'] 
        }}>
          {message}
        </Text>
      )}

      {/* Action button */}
      {actionLabel && onAction && (
        <Button 
          variant={actionVariant}
          onPress={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </View>
  );
};

export default EmptyState;
