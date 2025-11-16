import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { getColors } from '../../constants/colors';
import { layout, spacing, typography } from '../../constants/theme';

/**
 * PageHeader Component (Compact Version)
 * 
 * Props:
 * - title: string
 * - subtitle?: string
 * - leftAction?: ReactNode
 * - rightAction?: ReactNode
 * - variant?: 'default' | 'transparent'
 * - className?: string
 */
const PageHeader = ({
  title,
  subtitle,
  leftAction,
  rightAction,
  variant = 'default',
  className = '',
}) => {
  const insets = useSafeAreaInsets();
  const { isDark } = useSelector((state) => state.theme);
  const colors = getColors(isDark);

  const variantStyles = {
    default: { 
      backgroundColor: colors.surface, 
      borderBottomWidth: layout.borderWidth.thin, 
      borderBottomColor: colors.border 
    },
    transparent: { backgroundColor: 'transparent' },
  };

  return (
    <View
      style={[
        variantStyles[variant], 
        { 
          paddingTop: insets.top + spacing.xs, 
          paddingHorizontal: spacing.lg, 
          paddingBottom: spacing.sm 
        }
      ]}
    >
      {/* Row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Left */}
        <View style={{ width: 32, height: 32, justifyContent: 'center' }}>
          {leftAction}
        </View>

        {/* Title */}
        <Text
          style={{ 
            fontSize: typography.fontSize.xl, 
            fontWeight: typography.fontWeight.bold, 
            color: colors.text, 
            flex: 1, 
            textAlign: 'center', 
            marginHorizontal: spacing.sm 
          }}
          numberOfLines={1}
        >
          {title}
        </Text>

        {/* Right */}
        <View style={{ width: 32, height: 32, justifyContent: 'center' }}>
          {rightAction}
        </View>
      </View>

      {/* Subtitle */}
      {subtitle && (
        <Text style={{ 
          fontSize: typography.fontSize.xs, 
          color: colors.textSecondary, 
          textAlign: 'center', 
          marginTop: spacing.xs 
        }}>
          {subtitle}
        </Text>
      )}
    </View>
  );
};

export default PageHeader;
