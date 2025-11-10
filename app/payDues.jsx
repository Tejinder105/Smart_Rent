import { useRouter } from 'expo-router';
import {
    CheckCircle,
    ChevronLeft,
    CreditCard,
    FileText,
    Home,
    Sparkles,
    User,
    Zap
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserExpenses, markParticipantPaid } from '../store/slices/expenseSlice';
import { fetchUserFlat } from '../store/slices/flatSlice';
// Backend Transaction API integration
import { fetchUserDues } from '../store/slices/billSlice';
import { payDues as payBackendDues } from '../store/slices/transactionSlice';

const payDues = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const dispatch = useDispatch();
  
  const { expenses, loading: expenseLoading, error: expenseError } = useSelector((state) => state.expense);
  const { currentFlat, loading: flatLoading } = useSelector((state) => state.flat);
  const { userData } = useSelector((state) => state.auth);
  // Backend bill dues
  const { userDues, loading: duesLoading } = useSelector((state) => state.bill);
  const { loading: transactionLoading } = useSelector((state) => state.transaction);
  
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('upi');
  const [processing, setProcessing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [useBackendBills, setUseBackendBills] = useState(true); // Toggle for backend bills

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    dispatch(fetchUserExpenses({ status: 'active' }));
    dispatch(fetchUserFlat());
    // Load backend bills
    dispatch(fetchUserDues());
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Calculate monthly rent share for current user
  const getRentDue = () => {
    if (!currentFlat || !currentFlat.rent) return null;
    
    const totalRent = currentFlat.rent;
    const totalMembers = currentFlat.stats?.totalMembers || 1;
    const rentPerPerson = totalRent / totalMembers;
    
    // Get the current month and year for the rent due
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
    const currentYear = currentDate.getFullYear();
    
    return {
      _id: `rent-${currentMonth}-${currentYear}`,
      expenseId: null, 
      title: `${currentMonth} ${currentYear} Rent`,
      description: `Monthly rent for ${currentFlat.name}`,
      amount: rentPerPerson,
      category: 'rent',
      recipient: 'Landlord',
      recipientId: currentFlat.admin?._id || currentFlat.admin,
      dueDate: new Date(currentYear, currentDate.getMonth(), 5), 
      type: 'rent',
      priority: getDuePriority(new Date(currentYear, currentDate.getMonth(), 1)),
      participantUserId: userData?._id,
      isRent: true,
      totalRent: totalRent,
      totalMembers: totalMembers
    };
  };


  const expenseDues = expenses.filter(expense => {
    const userParticipant = expense.participants?.find(
      p => (p.userId?._id || p.userId) === userData?._id
    );
    return userParticipant && !userParticipant.isPaid && expense.status === 'active';
  }).map(expense => {
    const userParticipant = expense.participants.find(
      p => (p.userId?._id || p.userId) === userData?._id
    );
    
    return {
      _id: expense._id,
      expenseId: expense._id,
      title: expense.title,
      description: expense.description,
      amount: userParticipant.amount,
      category: expense.category,
      recipient: expense.createdBy?.userName || 'Admin',
      recipientId: expense.createdBy?._id || expense.createdBy,
      dueDate: expense.createdAt,
      type: getCategoryType(expense.category),
      priority: getDuePriority(expense.createdAt),
      participantUserId: userData?._id,
      isRent: false
    };
  });

  const rentDue = getRentDue();
  const outstandingDues = rentDue ? [rentDue, ...expenseDues] : expenseDues;
  
  const loading = expenseLoading || flatLoading;
  const error = expenseError;

  function getCategoryType(category) {
    switch (category) {
      case 'rent':
        return 'rent';
      case 'utilities':
      case 'internet':
        return 'utility';
      case 'groceries':
      case 'cleaning':
      case 'maintenance':
      case 'furniture':
        return 'flatmate';
      default:
        return 'other';
    }
  }

  function getDuePriority(createdDate) {
    const daysSince = Math.floor((Date.now() - new Date(createdDate)) / (1000 * 60 * 60 * 24));
    if (daysSince > 7) return 'high';
    if (daysSince > 3) return 'medium';
    return 'low';
  }

  const getIconForType = (type) => {
    switch (type) {
      case 'rent': return Home;
      case 'utility': return Zap;
      case 'flatmate': return User;
      case 'other': return FileText;
      default: return FileText;
    }
  };

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
    { id: 'upi', name: 'UPI', subtitle: 'Google Pay / PhonePe / Paytm' },
    { id: 'card', name: 'Debit/Credit Card', subtitle: '**** 1234' },
    { id: 'bank', name: 'Bank Transfer', subtitle: 'NEFT/RTGS/IMPS' },
    { id: 'cash', name: 'Cash', subtitle: 'Mark as paid' }
  ];

  const handleGoBack = () => {
    router.back();
  };

  const handleSelectPayment = (due) => {
    setSelectedPayment(due);
  };

  const handlePayBackendBills = async (billIds) => {
    if (!billIds || billIds.length === 0) {
      Alert.alert('Error', 'Please select bills to pay');
      return;
    }

    const selectedBills = userDues.filter(due => billIds.includes(due._id));
    const totalAmount = selectedBills.reduce((sum, bill) => sum + bill.userShare, 0);

    Alert.alert(
      'Confirm Multi-Bill Payment',
      `Pay ${billIds.length} bill(s) totaling ₹${totalAmount.toFixed(2)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pay Now',
          style: 'default',
          onPress: async () => {
            setProcessing(true);
            try {
              await dispatch(payBackendDues({ billIds })).unwrap();
              
              Alert.alert(
                'Payment Successful!',
                `₹${totalAmount.toFixed(2)} paid for ${billIds.length} bill(s). Transaction recorded and participants notified.`,
                [{
                  text: 'OK',
                  onPress: () => {
                    loadData();
                  }
                }]
              );
            } catch (error) {
              Alert.alert('Payment Failed', error?.message || 'Unable to process payment');
            } finally {
              setProcessing(false);
            }
          }
        }
      ]
    );
  };

  const handlePayNow = async () => {
    if (!selectedPayment) {
      Alert.alert('Error', 'Please select a payment to process');
      return;
    }

    if (selectedPayment.isRent) {
      Alert.alert(
        'Rent Payment',
        `Mark ₹${selectedPayment.amount.toFixed(2)} rent payment as paid?\n\nNote: This is for record keeping. Actual rent payment should be made to your landlord.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Mark as Paid',
            style: 'default',
            onPress: () => {
              Alert.alert(
                'Payment Recorded!',
                `₹${selectedPayment.amount.toFixed(2)} rent payment has been recorded.\n\nRemember to make the actual payment to your landlord.`,
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      setSelectedPayment(null);
          
                    }
                  }
                ]
              );
            }
          }
        ]
      );
      return;
    }

    Alert.alert(
      'Confirm Payment',
      `Mark ₹${selectedPayment.amount.toFixed(2)} payment as paid?\n\nThis will notify ${selectedPayment.recipient} that you've made the payment.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark as Paid',
          style: 'default',
          onPress: async () => {
            setProcessing(true);
            try {
              await dispatch(markParticipantPaid({ 
                expenseId: selectedPayment.expenseId,
                participantUserId: selectedPayment.participantUserId
              })).unwrap();
              
              Alert.alert(
                'Payment Marked!',
                `₹${selectedPayment.amount.toFixed(2)} payment has been marked as paid and ${selectedPayment.recipient} has been notified.`,
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      setSelectedPayment(null);
                      loadData();
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
            <Text className="text-xs text-gray-400">Created: {new Date(due.dueDate).toLocaleDateString()}</Text>
          </View>

          <View className="items-end">
            <Text className="text-xl font-bold text-gray-900">₹{due.amount.toFixed(2)}</Text>
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
  const totalDuesAmount = outstandingDues.reduce((sum, due) => sum + due.amount, 0);

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

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Backend Bills Toggle */}
        <View className="mx-4 mt-4 bg-white rounded-2xl p-2 flex-row">
          <TouchableOpacity 
            onPress={() => setUseBackendBills(true)}
            className={`flex-1 py-2 rounded-xl flex-row items-center justify-center ${useBackendBills ? 'bg-blue-500' : 'bg-transparent'}`}
          >
            <Sparkles size={16} color={useBackendBills ? '#fff' : '#6b7280'} />
            <Text className={`font-semibold ml-2 ${useBackendBills ? 'text-white' : 'text-gray-600'}`}>
              Bills
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setUseBackendBills(false)}
            className={`flex-1 py-2 rounded-xl ${!useBackendBills ? 'bg-gray-500' : 'bg-transparent'}`}
          >
            <Text className={`text-center font-semibold ${!useBackendBills ? 'text-white' : 'text-gray-600'}`}>
              Split Expenses
            </Text>
          </TouchableOpacity>
        </View>

        {useBackendBills ? (
          // Backend Bills View
          <>
            {/* Total Outstanding for Backend Bills */}
            {userDues && userDues.length > 0 && (
              <View className="mx-4 mt-6 mb-4">
                <View className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6">
                  <Text className="text-white text-sm font-medium mb-1">Total Bills Due</Text>
                  <Text className="text-white text-4xl font-bold">
                    ₹{userDues.reduce((sum, due) => sum + (due.amount || 0), 0).toFixed(2)}
                  </Text>
                  <Text className="text-blue-100 text-sm mt-2">
                    {userDues.length} pending bill{userDues.length !== 1 ? 's' : ''}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handlePayBackendBills(userDues.map(d => d.billId?._id || d._id))}
                    className="mt-4 bg-white rounded-xl py-3"
                    disabled={processing}
                  >
                    <Text className="text-blue-600 font-bold text-center">
                      {processing ? 'Processing...' : 'Pay All Bills'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Backend Bills List */}
            <View className="mx-4 mb-6">
              <Text className="text-lg font-bold text-gray-900 mb-4">Your Bills</Text>
              
              {duesLoading ? (
                <View className="bg-white rounded-2xl p-8 items-center">
                  <ActivityIndicator size="large" color="#3b82f6" />
                  <Text className="text-gray-600 mt-2">Loading bills...</Text>
                </View>
              ) : !userDues || userDues.length === 0 ? (
                <View className="bg-green-50 border border-green-200 rounded-xl p-6 items-center">
                  <CheckCircle size={48} color="#22c55e" />
                  <Text className="text-green-800 text-lg font-semibold mt-4">All Paid Up!</Text>
                  <Text className="text-green-600 text-center mt-2">
                    You have no pending bills
                  </Text>
                </View>
              ) : (
                userDues.map((due) => {
                  const bill = due.billId || {};
                  const flatName = bill.flatId?.name || 'Unknown Flat';
                  
                  return (
                    <TouchableOpacity
                      key={due._id}
                      onPress={() => handlePayBackendBills([bill._id])}
                      className="bg-white rounded-2xl p-4 mb-3 border border-gray-100"
                    >
                      <View className="flex-row items-start justify-between">
                        <View className="flex-row items-start flex-1">
                          <View className={`w-12 h-12 rounded-xl items-center justify-center mr-3 ${
                            new Date(bill.dueDate) < new Date() ? 'bg-red-100' : 'bg-blue-100'
                          }`}>
                            <FileText size={24} color={new Date(bill.dueDate) < new Date() ? '#ef4444' : '#3b82f6'} />
                          </View>
                          <View className="flex-1">
                            <Text className="text-base font-bold text-gray-900 mb-1">
                              {bill.title || 'Untitled Bill'}
                            </Text>
                            <Text className="text-sm text-gray-500 mb-2">
                              Due: {bill.dueDate ? new Date(bill.dueDate).toLocaleDateString('en-IN') : 'No date'}
                            </Text>
                            <View className="flex-row items-center">
                              <View className="bg-gray-100 px-3 py-1 rounded-lg mr-2">
                                <Text className="text-gray-700 text-xs font-medium capitalize">
                                  {bill.category || 'other'}
                                </Text>
                              </View>
                              <Text className="text-xs text-gray-500">
                                {flatName}
                              </Text>
                            </View>
                          </View>
                        </View>
                        
                        <View className="items-end">
                          <Text className="text-lg font-bold text-blue-600 mb-1">
                            ₹{(due.amount || 0).toFixed(0)}
                          </Text>
                          <Text className="text-xs text-gray-500">
                            Your share
                          </Text>
                        </View>
                      </View>

                      {bill.totalAmount && bill.splits && (
                        <View className="mt-3 pt-3 border-t border-gray-100">
                          <Text className="text-xs text-gray-500">
                            Total: ₹{bill.totalAmount} • Split {bill.splits.length} ways
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          </>
        ) : (
          // Legacy Split Expenses View
          <>
        {/* Total Outstanding Summary */}
        {outstandingDues.length > 0 && (
          <View className="mx-4 mt-6 mb-4">
            <View className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-6">
              <Text className="text-white text-sm font-medium mb-1">Total Outstanding</Text>
              <Text className="text-white text-4xl font-bold">₹{totalDuesAmount.toFixed(2)}</Text>
              <Text className="text-red-100 text-sm mt-2">
                {outstandingDues.length} pending payment{outstandingDues.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        )}

        {/* Outstanding Dues */}
        <View className="mx-4 mb-6">
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
                  <Text className="font-semibold">₹{selectedPayment.amount.toFixed(2)}</Text>
                </View>
                
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-600">Processing Fee</Text>
                  <Text className="font-semibold">₹0.00</Text>
                </View>
                
                <View className="border-t border-gray-200 pt-2 mt-2">
                  <View className="flex-row justify-between">
                    <Text className="font-bold text-gray-900">Total</Text>
                    <Text className="font-bold text-xl text-gray-900">₹{totalAmount.toFixed(2)}</Text>
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
                  {processing ? 'Processing...' : `Mark Paid ₹${totalAmount.toFixed(2)}`}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
        </>
        )}
      </ScrollView>
    </View>
  );
};

export default payDues;