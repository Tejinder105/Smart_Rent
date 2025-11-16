import { Check, User } from 'lucide-react-native';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { getColors } from '../../constants/colors';

/**
 * FlatmateSelector Component
 * List selector for flatmates with avatars and amounts
 * 
 * @param {Array} flatmates - Array of {id, name, avatar, amount (optional)}
 * @param {Array} selectedIds - Array of selected flatmate IDs
 * @param {function} onToggle - Toggle handler (flatmateId) => void
 * @param {boolean} multiSelect - Allow multiple selection (default: true)
 * @param {boolean} showAmounts - Show amount column (default: false)
 * @param {object} style - Additional styles
 */
const FlatmateSelector = ({
  flatmates = [],
  selectedIds = [],
  onToggle,
  multiSelect = true,
  showAmounts = false,
  style,
}) => {
  const { isDark } = useSelector((state) => state.theme);
  const colors = getColors(isDark);
  
  const isSelected = (id) => selectedIds.includes(id);

  const handleSelect = (id) => {
    if (multiSelect) {
      onToggle(id);
    } else {
      // Single select - only keep the new selection
      onToggle(id);
    }
  };

  return (
    <View style={style}>
      {flatmates.map((flatmate, index) => {
        const selected = isSelected(flatmate.id);
        
        return (
          <TouchableOpacity
            key={flatmate.id}
            onPress={() => handleSelect(flatmate.id)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 16,
              backgroundColor: selected ? colors.primaryBg : colors.card,
              borderRadius: 16,
              borderWidth: 2,
              borderColor: selected ? colors.primary : colors.border,
              marginBottom: index < flatmates.length - 1 ? 12 : 0,
            }}
            activeOpacity={0.7}
          >
            {/* Avatar */}
            <View style={{ position: 'relative', marginRight: 12 }}>
              {flatmate.avatar ? (
                <Image
                  source={{ uri: flatmate.avatar }}
                  style={{ width: 48, height: 48, borderRadius: 24 }}
                />
              ) : (
                <View style={{ width: 48, height: 48, backgroundColor: colors.backgroundTertiary, borderRadius: 24, alignItems: 'center', justifyContent: 'center' }}>
                  <User size={24} color={colors.textSecondary} />
                </View>
              )}
              
              {/* Selected indicator */}
              {selected && (
                <View style={{ position: 'absolute', top: -4, right: -4, width: 20, height: 20, backgroundColor: colors.primary, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.card }}>
                  <Check size={12} color="white" strokeWidth={3} />
                </View>
              )}
            </View>

            {/* Name */}
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: selected ? colors.primary : colors.text }}>
                {flatmate.name}
              </Text>
              {flatmate.email && (
                <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 2 }}>
                  {flatmate.email}
                </Text>
              )}
            </View>

            {/* Amount (if showAmounts) */}
            {showAmounts && flatmate.amount !== undefined && (
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: selected ? colors.primary : colors.text }}>
                ₹{flatmate.amount}
              </Text>
            )}

            {/* Checkbox indicator (if not showing amounts) */}
            {!showAmounts && (
              <View 
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: selected ? colors.primary : colors.border,
                  backgroundColor: selected ? colors.primary : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {selected && (
                  <Check size={14} color="white" strokeWidth={3} />
                )}
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default FlatmateSelector;
