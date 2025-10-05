import { useRouter } from 'expo-router';
import {
    CheckCircle,
    ChevronLeft,
    CreditCard,
    FileText,
    Home,
    User,
    Zap
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOutstandingDues, processPayment } from '../store/slices/paymentSlice';

const payDues = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const dispatch = useDispatch();
  
  const { outstandingDues, loading, error } = useSelector((state) => state.payment);
  
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    dispatch(fetchOutstandingDues());
  }, [dispatch]);

  // Icon mapping for different payment types
  const getIconForType = (type) => {
    switch (type) {
      case 'rent': return Home;
      case 'utility': return Zap;
      case 'flatmate': return User;
      case 'other': return FileText;
      default: return FileText;
    }
  };

  // Icon background and color mapping
  const getIconProps = (type, priority) => {
    switch (type) {
      case 'rent':
        return { iconBg: 'bg-green-100', iconColor: '#16a34a' };
      case 'utility':
        return { iconBg: 'bg-yellow-100', iconColor: '#eab308' };
      case 'flatmate':
        return { iconBg: 'bg-purple-100', iconColor: '#8b5cf6' };
      default:
        return { iconBg: 'bg-blue-100', iconColor: '#3b82f6' };
    }
  };

  const paymentMethods = [
    { id: 'card', name: 'Credit Card', subtitle: '**** 1234' },
    { id: 'bank', name: 'Bank Transfer', subtitle: 'Checking Account' },
    { id: 'venmo', name: 'Venmo', subtitle: '@username' },
    { id: 'cash', name: 'Cash', subtitle: 'Mark as paid' }
  ];

  const handleGoBack = () => {
    router.back();
  };

  const handleSelectPayment = (due) => {
    setSelectedPayment(due);
  };

  const handlePayNow = async () => {
    if (!selectedPayment) {
      Alert.alert('Error', 'Please select a payment to process');
      return;
    }

    Alert.alert(
      'Confirm Payment',
      `Pay ₹${selectedPayment.amount} to ${selectedPayment.recipient}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pay Now',
          style: 'default',
          onPress: async () => {
            setProcessing(true);
            try {
              const processData = {
                paymentMethod: selectedPaymentMethod,
                transactionId: `TXN${Date.now()}`,
                processingFee: 0
              };
              
              await dispatch(processPayment({ 
                paymentId: selectedPayment._id, 
                processData 
              })).unwrap();
              
              Alert.alert(
                'Payment Successful!',
                `₹${selectedPayment.amount} paid to ${selectedPayment.recipient}`,
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      setSelectedPayment(null);
                      // Refresh the outstanding dues
                      dispatch(fetchOutstandingDues());
                    }
                  }
                ]
              );
            } catch (error) {
              Alert.alert('Payment Failed', error || 'Unable to process payment');
            } finally {
              setProcessing(false);
            }
          }
        }
      ]
    );
  };

  const DueCard = ({ due, isSelected, onSelect }) => {
    const IconComponent = getIconForType(due.type);
    const iconProps = getIconProps(due.type, due.priority);
    
    return (
      <TouchableOpacity
        onPress={() => onSelect(due)}
        className={`bg-white rounded-2xl p-4 mb-3 border-2 ${
          isSelected ? 'border-blue-500' : 'border-gray-100'
        }`}
      >
        <View className="flex-row items-center">
          <View className={`w-12 h-12 ${iconProps.iconBg} rounded-full items-center justify-center mr-4`}>
            <IconComponent size={24} color={iconProps.iconColor} />
          </View>

          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900">{due.title}</Text>
            <Text className="text-sm text-gray-500">To: {due.recipient}</Text>
            <Text className="text-xs text-gray-400">Due: {new Date(due.dueDate).toLocaleDateString()}</Text>
          </View>

          <View className="items-end">
            <Text className="text-xl font-bold text-gray-900">₹{due.amount}</Text>
            <View className={`px-2 py-1 rounded-full ${
              due.priority === 'high' ? 'bg-red-100' :
              due.priority === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
            }`}>
              <Text className={`text-xs font-medium ${
                due.priority === 'high' ? 'text-red-700' :
                due.priority === 'medium' ? 'text-yellow-700' : 'text-green-700'
              }`}>
                {due.priority}
              </Text>
            </View>
          </View>

          {isSelected && (
            <View className="ml-3">
              <CheckCircle size={24} color="#22c55e" />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const PaymentMethodCard = ({ method, isSelected, onSelect }) => (
    <TouchableOpacity
      onPress={() => onSelect(method.id)}
      className={`bg-white rounded-xl p-4 mb-3 border-2 ${
        isSelected ? 'border-blue-500' : 'border-gray-100'
      }`}
    >
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="font-semibold text-gray-900">{method.name}</Text>
          <Text className="text-sm text-gray-500">{method.subtitle}</Text>
        </View>
        {isSelected && <CheckCircle size={20} color="#22c55e" />}
      </View>
    </TouchableOpacity>
  );

  const totalAmount = selectedPayment ? selectedPayment.amount : 0;

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 py-6 bg-white" style={{ paddingTop: insets.top + 24 }}>
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={handleGoBack}
            className="mr-4 w-10 h-10 items-center justify-center"
          >
            <ChevronLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="flex-1 text-2xl font-bold text-gray-900 text-center mr-14">
            Pay Dues
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Outstanding Dues */}
        <View className="mx-4 mt-6 mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">Outstanding Payments</Text>
          
          {loading && (
            <View className="flex-1 justify-center items-center py-8">
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text className="mt-2 text-gray-600">Loading payments...</Text>
            </View>
          )}
          
          {error && (
            <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <Text className="text-red-800 text-center">{error}</Text>
            </View>
          )}
          
          {!loading && !error && outstandingDues.length === 0 && (
            <View className="bg-green-50 border border-green-200 rounded-xl p-6 items-center">
              <Text className="text-green-800 text-lg font-semibold">No Outstanding Payments</Text>
              <Text className="text-green-600 text-center mt-2">You're all caught up! No pending payments.</Text>
            </View>
          )}
          
          {!loading && outstandingDues.map((due) => (
            <DueCard
              key={due._id}
              due={due}
              isSelected={selectedPayment?._id === due._id}
              onSelect={handleSelectPayment}
            />
          ))}
        </View>

        {selectedPayment && (
          <>
            {/* Payment Methods */}
            <View className="mx-4 mb-6">
              <Text className="text-lg font-bold text-gray-900 mb-4">Payment Method</Text>
              {paymentMethods.map((method) => (
                <PaymentMethodCard
                  key={method.id}
                  method={method}
                  isSelected={selectedPaymentMethod === method.id}
                  onSelect={setSelectedPaymentMethod}
                />
              ))}
            </View>

            {/* Payment Summary */}
            <View className="mx-4 mb-6">
              <View className="bg-white rounded-2xl p-6">
                <Text className="text-lg font-bold text-gray-900 mb-4">Payment Summary</Text>
                
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-600">Amount</Text>
                  <Text className="font-semibold">₹{selectedPayment.amount}</Text>
                </View>
                
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-600">Processing Fee</Text>
                  <Text className="font-semibold">₹0.00</Text>
                </View>
                
                <View className="border-t border-gray-200 pt-2 mt-2">
                  <View className="flex-row justify-between">
                    <Text className="font-bold text-gray-900">Total</Text>
                    <Text className="font-bold text-xl text-gray-900">₹{totalAmount}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Pay Button */}
            <View className="mx-4 mb-8">
              <TouchableOpacity
                onPress={handlePayNow}
                disabled={processing}
                className={`${processing ? 'bg-gray-400' : 'bg-blue-500'} rounded-2xl py-4 flex-row items-center justify-center shadow-sm`}
              >
                {processing ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <CreditCard size={20} color="white" />
                )}
                <Text className="text-white font-semibold text-lg ml-2">
                  {processing ? 'Processing...' : `Pay ₹${totalAmount}`}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default payDues;