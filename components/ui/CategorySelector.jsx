import { Check } from 'lucide-react-native';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { getColors } from '../../constants/colors';

/**
 * CategorySelector Component
 * Grid selector for categories with icons
 * 
 * @param {Array} categories - Array of {id, name, icon, color}
 * @param {string} selectedId - Currently selected category ID
 * @param {function} onSelect - Selection handler (categoryId) => void
 * @param {number} columns - Number of columns in grid (default: 3)
 * @param {object} style - Additional styles
 */
const CategorySelector = ({
  categories = [],
  selectedId,
  onSelect,
  columns = 3,
  style,
}) => {
  const { isDark } = useSelector((state) => state.theme);
  const colors = getColors(isDark);

  return (
    <View style={style}>
      {/* Grid layout */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -8 }}>
        {categories.map((category) => {
          const isSelected = category.id === selectedId;
          
          return (
            <View
              key={category.id}
              style={{ paddingHorizontal: 8, marginBottom: 16, width: `${100 / columns}%` }}
            >
              <TouchableOpacity
                onPress={() => onSelect(category.id)}
                style={{
                  position: 'relative',
                  backgroundColor: isSelected ? colors.primaryBg : colors.card,
                  borderRadius: 16,
                  padding: 16,
                  alignItems: 'center',
                  borderWidth: 2,
                  borderColor: isSelected ? colors.primary : colors.border,
                }}
                activeOpacity={0.7}
              >
                {/* Selected indicator */}
                {isSelected && (
                  <View style={{ position: 'absolute', top: 8, right: 8, width: 20, height: 20, backgroundColor: colors.primary, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={12} color="white" strokeWidth={3} />
                  </View>
                )}

                {/* Icon */}
                <View
                  style={{ width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8, backgroundColor: category.color || colors.backgroundTertiary }}
                >
                  {category.icon}
                </View>

                {/* Category name */}
                <Text 
                  style={{ fontSize: 14, fontWeight: '500', textAlign: 'center', color: isSelected ? colors.primary : colors.text }}
                  numberOfLines={2}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default CategorySelector;
