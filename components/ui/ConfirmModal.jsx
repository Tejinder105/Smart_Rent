import { AlertTriangle } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { getColors } from '../../constants/colors';
import Button from './Button';
import BaseModal from './Modal';

/**
 * ConfirmModal Component
 * Confirmation dialog with consistent styling
 * 
 * @param {boolean} visible - Modal visibility state
 * @param {function} onClose - Close/cancel handler
 * @param {function} onConfirm - Confirm handler
 * @param {string} title - Modal title
 * @param {string} message - Confirmation message
 * @param {string} confirmLabel - Confirm button label (default: "Confirm")
 * @param {string} cancelLabel - Cancel button label (default: "Cancel")
 * @param {string} variant - 'danger' | 'warning' | 'info' (default: 'danger')
 * @param {boolean} loading - Show loading state on confirm button
 */
const ConfirmModal = ({
  visible,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
}) => {
  const { isDark } = useSelector((state) => state.theme);
  const colors = getColors(isDark);

  // Icon color based on variant
  const iconColors = {
    danger: colors.error,
    warning: colors.warning,
    info: colors.info,
  };

  // Button variant based on dialog variant
  const buttonVariants = {
    danger: 'danger',
    warning: 'primary',
    info: 'primary',
  };

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title={title}
      size="sm"
      showCloseButton={false}
      footer={
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Button
              variant="secondary"
              onPress={onClose}
              disabled={loading}
            >
              {cancelLabel}
            </Button>
          </View>
          <View style={{ flex: 1 }}>
            <Button
              variant={buttonVariants[variant]}
              onPress={onConfirm}
              loading={loading}
            >
              {confirmLabel}
            </Button>
          </View>
        </View>
      }
    >
      <View style={{ alignItems: 'center', paddingVertical: 16 }}>
        {/* Warning icon */}
        <View style={{ width: 64, height: 64, backgroundColor: colors.backgroundTertiary, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <AlertTriangle size={32} color={iconColors[variant]} />
        </View>

        {/* Message */}
        <Text style={{ color: colors.textSecondary, textAlign: 'center', fontSize: 16 }}>
          {message}
        </Text>
      </View>
    </BaseModal>
  );
};

export default ConfirmModal;
