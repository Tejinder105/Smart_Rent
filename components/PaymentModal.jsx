import { Building2, CreditCard, DollarSign, Smartphone, Wallet, X } from 'lucide-react-native';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const PaymentModal = ({ visible, onClose, selectedExpenses = [], onPaymentComplete }) => {
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [transactionReference, setTransactionReference] = useState('');
  const [note, setNote] = useState('');
  const [processing, setProcessing] = useState(false);

  const paymentMethods = [
    { id: 'upi', name: 'UPI', icon: Smartphone, color: 'bg-warning-500' },
    { id: 'card', name: 'Card', icon: CreditCard, color: 'bg-primary-500' },
    { id: 'bank_transfer', name: 'Bank Transfer', icon: Building2, color: 'bg-success-500' },
    { id: 'cash', name: 'Cash', icon: Wallet, color: 'bg-warning-600' },
    { id: 'other', name: 'Other', icon: DollarSign, color: 'bg-surface-800' }
  ];

  // Calculate total amount
  const totalAmount = selectedExpenses.reduce((sum, expense) => {
    return sum + (expense.userAmount || 0);
  }, 0);

  const handlePayment = async () => {
    if (selectedExpenses.length === 0) {
      Alert.alert('Error', 'No expenses selected for payment');
      return;
    }

    // Validate transaction reference for non-cash payments
    if (paymentMethod !== 'cash' && !transactionReference.trim()) {
      Alert.alert('Error', 'Please enter a transaction reference number');
      return;
    }

    setProcessing(true);
    try {
      await onPaymentComplete({
        expenses: selectedExpenses,
        paymentMethod,
        transactionReference: transactionReference.trim() || undefined,
        note: note.trim() || undefined
      });
      
      // Reset form
      setTransactionReference('');
      setNote('');
      setPaymentMethod('upi');
      onClose();
    } catch (error) {
      Alert.alert('Payment Failed', error?.message || 'Failed to process payment');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View className="flex-1 justify-end bg-black/50" style={{ paddingTop: 0 }}>
        <View className="bg-surface-0 rounded-t-3xl h-5/6">
          {/* Header */}
          <View className="flex-row items-center justify-between p-xl border-b border-border">
            <Text className="text-xl font-bold text-text-primary">
              Record Payment
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 items-center justify-center bg-surface-100 rounded-full"
            >
              <X size={20} color="#6B7785" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-xl" showsVerticalScrollIndicator={false}>
            <View className="py-xl">
              {/* Selected Expenses Summary */}
              <View className="bg-info-50 rounded-2xl p-lg mb-xl">
                <Text className="text-sm font-semibold text-info-600 mb-sm">
                  Selected Bills & Expenses ({selectedExpenses.length})
                </Text>
                {selectedExpenses.map((expense, index) => (
                  <View 
                    key={expense._id} 
                    className="flex-row justify-between items-center py-sm border-b border-info-100 last:border-b-0"
                  >
                    <View className="flex-1">
                      <Text className="font-medium text-text-primary" numberOfLines={1}>
                        {expense.title}
                      </Text>
                      {expense.isBill && (
                        <View className="bg-info-100 px-sm py-xs rounded mt-xs self-start">
                          <Text className="text-info-600 text-xs font-semibold">BILL</Text>
                        </View>
                      )}
                    </View>
                    <Text className="font-bold text-text-primary ml-sm">
                      ₹{expense.userAmount?.toFixed(2)}
                    </Text>
                  </View>
                ))}
                
                {/* Total Amount */}
                <View className="flex-row justify-between items-center pt-md mt-md border-t-2 border-info-200">
                  <Text className="text-base font-bold text-info-600">
                    Total Amount
                  </Text>
                  <Text className="text-xl font-bold text-info-600">
                    ₹{totalAmount.toFixed(2)}
                  </Text>
                </View>
              </View>

              {/* Payment Method Selection */}
              <View className="mb-xl">
                <Text className="text-sm font-semibold text-text-secondary mb-md">
                  Payment Method *
                </Text>
                <View className="gap-md">
                  {paymentMethods.map((method) => {
                    const IconComponent = method.icon;
                    const isSelected = paymentMethod === method.id;
                    
                    return (
                      <TouchableOpacity
                        key={method.id}
                        onPress={() => setPaymentMethod(method.id)}
                        className={`flex-row items-center p-lg rounded-xl border-2 ${
                          isSelected 
                            ? 'border-primary-500 bg-primary-50' 
                            : 'border-border bg-surface-0'
                        }`}
                      >
                        <View className={`w-10 h-10 rounded-full items-center justify-center ${method.color}`}>
                          <IconComponent size={20} color="white" />
                        </View>
                        <Text className={`flex-1 ml-md font-semibold ${
                          isSelected ? 'text-primary-500' : 'text-text-primary'
                        }`}>
                          {method.name}
                        </Text>
                        {isSelected && (
                          <View className="w-6 h-6 bg-primary-500 rounded-full items-center justify-center">
                            <Text className="text-white text-xs font-bold">✓</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Transaction Reference */}
              {paymentMethod !== 'cash' && (
                <View className="mb-xl">
                  <Text className="text-sm font-semibold text-text-secondary mb-sm">
                    Transaction Reference *
                  </Text>
                  <View className="bg-surface-0 rounded-xl border border-border p-lg">
                    <TextInput
                      value={transactionReference}
                      onChangeText={setTransactionReference}
                      placeholder={
                        paymentMethod === 'upi' 
                          ? 'UPI Transaction ID (e.g., 123456789012)' 
                          : paymentMethod === 'card'
                          ? 'Last 4 digits of card'
                          : 'Transaction/Reference Number'
                      }
                      className="text-text-primary text-base"
                      placeholderTextColor="#9ca3af"
                    />
                  </View>
                  <Text className="text-xs text-text-tertiary mt-xs">
                    Enter the payment reference for tracking
                  </Text>
                </View>
              )}

              {/* Note (Optional) */}
              <View className="mb-xl">
                <Text className="text-sm font-semibold text-text-secondary mb-sm">
                  Note (Optional)
                </Text>
                <View className="bg-surface-0 rounded-xl border border-border p-lg">
                  <TextInput
                    value={note}
                    onChangeText={setNote}
                    placeholder="Add any additional notes..."
                    className="text-text-primary text-base"
                    placeholderTextColor="#9ca3af"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>
              </View>

              {/* Pay Button */}
              <TouchableOpacity
                onPress={handlePayment}
                disabled={processing}
                className={`${
                  processing ? 'bg-surface-300' : 'bg-success-500'
                } rounded-2xl py-lg flex-row items-center justify-center shadow-lg`}
              >
                {processing ? (
                  <>
                    <ActivityIndicator size="small" color="white" />
                    <Text className="text-white font-bold text-lg ml-sm">
                      Processing...
                    </Text>
                  </>
                ) : (
                  <>
                    <Wallet size={24} color="white" />
                    <Text className="text-white font-bold text-lg ml-sm">
                      Pay ₹{totalAmount.toFixed(2)}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Cancel Button */}
              <TouchableOpacity
                onPress={onClose}
                disabled={processing}
                className="mt-md py-md items-center"
              >
                <Text className="text-text-secondary font-semibold">Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default PaymentModal;
