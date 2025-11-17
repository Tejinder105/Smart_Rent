import { X } from 'lucide-react-native';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { getColors } from '../../constants/colors';

const BaseModal = ({
  visible,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  showCloseButton = true,
  style,
}) => {
  const { isDark } = useSelector((state) => state.theme);
  const colors = getColors(isDark);

  const sizeStyles = {
    sm: { width: '80%', maxHeight: '40%' },
    md: { width: '85%', maxHeight: '60%' },
    lg: { width: '90%', maxHeight: '80%' },
    full: { width: '100%', height: '100%' },
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', alignItems: 'center', justifyContent: 'center' }}
        activeOpacity={1}
        onPress={onClose}
      >
        {/* Modal container */}
        <TouchableOpacity
          activeOpacity={1}
          style={[{ backgroundColor: colors.card, borderRadius: 24 }, sizeStyles[size], style]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, flex: 1 }}>
              {title}
            </Text>
            {showCloseButton && (
              <TouchableOpacity
                onPress={onClose}
                style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Content */}
          <ScrollView
            style={{ paddingHorizontal: 24, paddingVertical: 16 }}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>

          {/* Footer */}
          {footer && (
            <View style={{ paddingHorizontal: 24, paddingVertical: 16, borderTopWidth: 1, borderTopColor: colors.border }}>
              {footer}
            </View>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default BaseModal;
