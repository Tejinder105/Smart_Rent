import { Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { getColors } from '../../constants/colors';
import { spacing, typography } from '../../constants/theme';

/**
 * SectionTitle Component
 * Consistent section header with optional right action
 * 
 * @param {string} title - Section title
 * @param {React.ReactNode} rightAction - Right action button/icon/text
 * @param {string} variant - 'default' | 'compact'
 * @param {object} style - Additional styles
 */
const SectionTitle = ({
  title,
  rightAction,
  variant = 'default',
  style,
}) => {
  const { isDark } = useSelector((state) => state.theme);
  const colors = getColors(isDark);

  const variantStyles = {
    default: { marginBottom: spacing.lg },
    compact: { marginBottom: spacing.sm },
  };

  const titleSizeStyles = {
    default: typography.fontSize.xl,
    compact: typography.fontSize.lg,
  };

  return (
    <View style={[
      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, 
      variantStyles[variant], 
      style
    ]}>
      <Text style={{ 
        fontWeight: typography.fontWeight.bold, 
        color: colors.text, 
        fontSize: titleSizeStyles[variant] 
      }}>
        {title}
      </Text>
      {rightAction && (
        <View>
          {rightAction}
        </View>
      )}
    </View>
  );
};

export default SectionTitle;
