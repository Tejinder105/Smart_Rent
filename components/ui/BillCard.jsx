import { Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { getColors } from '../../constants/colors';
import { borderRadius, layout, spacing, typography } from '../../constants/theme';
import Card from './Card';

/**
 * BillCard Component
 * Displays a bill item with consistent styling
 * 
 * @param {string} title - Bill title
 * @param {string} category - Bill category
 * @param {string} amount - Bill amount (formatted)
 * @param {string} dueDate - Due date (formatted)
 * @param {string} status - 'pending' | 'paid' | 'overdue' | 'partial'
 * @param {React.ReactNode} icon - Category icon
 * @param {function} onPress - Press handler
 * @param {object} style - Additional styles
 */
const BillCard = ({
  title,
  category,
  amount,
  dueDate,
  status = 'pending',
  icon,
  onPress,
  style,
}) => {
  const { isDark } = useSelector((state) => state.theme);
  const colors = getColors(isDark);

  // Status badge styles
  const statusStyles = {
    pending: { backgroundColor: colors.warningBg, color: colors.warning },
    paid: { backgroundColor: colors.successBg, color: colors.success },
    overdue: { backgroundColor: colors.dangerBg, color: colors.danger },
    partial: { backgroundColor: colors.infoBg, color: colors.info },
    info: { backgroundColor: colors.infoBg, color: colors.info },
  };

  // Status labels
  const statusLabels = {
    pending: 'Pending',
    paid: 'Paid',
    overdue: 'Overdue',
    partial: 'Partially Paid',
    info: 'Info',
  };

  // Get safe status style (fallback to pending if status is not recognized)
  const safeStatus = status in statusStyles ? status : 'pending';
  const currentStatusStyle = statusStyles[safeStatus];
  const currentStatusLabel = statusLabels[safeStatus] || status;

  return (
    <Card
      variant="interactive"
      onPress={onPress}
      style={style}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        {/* Icon */}
        {icon && (
          <View style={{ 
            width: layout.avatarSize.md, 
            height: layout.avatarSize.md, 
            backgroundColor: colors.primaryBg, 
            borderRadius: borderRadius.md, 
            alignItems: 'center', 
            justifyContent: 'center', 
            marginRight: spacing.md 
          }}>
            {icon}
          </View>
        )}

        {/* Content */}
        <View style={{ flex: 1 }}>
          {/* Title and status */}
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            marginBottom: spacing.xs 
          }}>
            <Text style={{ 
              fontSize: typography.fontSize.base, 
              fontWeight: typography.fontWeight.semibold, 
              color: colors.text, 
              flex: 1 
            }} numberOfLines={1}>
              {title}
            </Text>
            <View style={[{ 
              paddingHorizontal: spacing.sm, 
              paddingVertical: spacing.xs, 
              borderRadius: borderRadius.sm 
            }, { backgroundColor: currentStatusStyle.backgroundColor }]}>
              <Text style={{ 
                fontSize: typography.fontSize.xs, 
                fontWeight: typography.fontWeight.medium, 
                color: currentStatusStyle.color 
              }}>
                {currentStatusLabel}
              </Text>
            </View>
          </View>

          {/* Category */}
          <Text style={{ 
            fontSize: typography.fontSize.sm, 
            color: colors.textSecondary, 
            marginBottom: spacing.sm 
          }}>
            {category}
          </Text>

          {/* Amount and due date */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ 
              fontSize: typography.fontSize.lg, 
              fontWeight: typography.fontWeight.bold, 
              color: colors.text 
            }}>
              {amount}
            </Text>
            <Text style={{ 
              fontSize: typography.fontSize.sm, 
              color: colors.textSecondary 
            }}>
              Due: {dueDate}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );
};

export default BillCard;
