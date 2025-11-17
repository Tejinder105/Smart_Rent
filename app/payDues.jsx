import { useRouter } from 'expo-router';
import {
    CheckCircle,
    ChevronLeft
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    Text,
    View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import PaymentModal from '../components/PaymentModal';
import {
    Button,
    Card,
    EmptyState,
    PageHeader
} from '../components/ui';
import { fetchUserDues, recordBulkPayment, selectFinancials } from '../store/slices/expenseUnifiedSlice';
import { fetchUserFlat } from '../store/slices/flatSlice';

const payDues = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  
  const { currentFlat } = useSelector((state) => state.flat);
  const { userData } = useSelector((state) => state.auth);
  const financials = useSelector(selectFinancials);
  const { loading } = useSelector((state) => state.expenseUnified);
  
  // V2 API returns userDues as { billDues: [], expenseDues: [], totalDue: 0 }
  const { billDues = [], expenseDues = [], totalDue: totalDuesAmount = 0 } = financials.userDues || {};
  
  // Combine bill dues and expense dues
  const userDues = [...billDues, ...expenseDues];
  
  // Debug logging
  console.log('💰 PayDues - RAW financials.userDues:', JSON.stringify(financials.userDues, null, 2));
  console.log('💰 PayDues - billDues:', billDues.length, billDues);
  console.log('💰 PayDues - expenseDues:', expenseDues.length, expenseDues);
  console.log('💰 PayDues - userDues total:', userDues.length);
  console.log('💰 PayDues - totalDuesAmount:', totalDuesAmount);
  
  // Log individual amounts
  if (billDues.length > 0) {
    console.log('💰 First bill due:', {
      title: billDues[0].title,
      userAmount: billDues[0].userAmount,
      totalAmount: billDues[0].totalAmount
    });
  }
  if (expenseDues.length > 0) {
    console.log('💰 First expense due:', {
      title: expenseDues[0].title,
      userAmount: expenseDues[0].userAmount,
      totalAmount: expenseDues[0].totalAmount
    });
  }
  
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [itemsToShow, setItemsToShow] = useState(10);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (currentFlat?._id) {
      await dispatch(fetchUserDues(currentFlat._id));
    }
    await dispatch(fetchUserFlat());
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleGoBack = () => {
    router.back();
  };

  const handlePayDue = async (due) => {
    console.log('💰 [PayDues] Paying due:', due);
    
    // Backend now returns billId for bills and expenseId for expenses
    const expenseId = due.billId || due.expenseId || due._id;
    const expenseType = due.billId ? 'bill' : 'expense';
    
    setSelectedExpense({
      _id: expenseId,
      title: due.title,
      userAmount: due.userAmount || 0,
      expenseType: expenseType
    });
    setShowPaymentModal(true);
  };

  const handleBulkPayment = async (paymentData) => {
    try {
      const payments = paymentData.expenses.map(expense => ({
        expenseId: expense._id,
        expenseType: expense.expenseType === 'bill' ? 'bill' : 'expense',
        amount: expense.userAmount,
        paymentMethod: paymentData.paymentMethod,
        transactionReference: paymentData.transactionReference,
        note: paymentData.note
      }));

      console.log('💳 [PayDues] Recording payment:', payments);

      // Record payment
      await dispatch(recordBulkPayment({ payments })).unwrap();
      console.log('✅ [PayDues] Payment successful');
      
      // Refetch dues - no cache, no delays
      if (currentFlat?._id) {
        await dispatch(fetchUserDues(currentFlat._id));
        console.log('✅ [PayDues] Dues refetched');
      }
      
      // Refresh flat data
      await dispatch(fetchUserFlat());
      
      // Close modal and show success
      setShowPaymentModal(false);
      setSelectedExpense(null);

      Alert.alert(
        'Payment Successful!',
        `Successfully recorded payment for ${payments.length} ${payments.length === 1 ? 'item' : 'items'}`,
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error('❌ [PayDues] Payment error:', error);
      Alert.alert('Payment Failed', error.message || 'Please try again');
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <PageHeader
        title="Pay Dues"
        leftAction={
          <Button
            variant="ghost"
            size="sm"
            onPress={() => router.back()}
            leftIcon={<ChevronLeft size={24} color="#374151" />}
          />
        }
      />

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Total Outstanding Summary */}
        {userDues && userDues.length > 0 && (
          <View className="mx-4 mt-6 mb-4">
            <View className="bg-primary-500 rounded-2xl p-5 shadow-sm">
              <Text className="text-white text-sm font-medium mb-1">Total Dues</Text>
              <Text className="text-white text-4xl font-bold">
                ₹{(totalDuesAmount || 0).toFixed(2)}
              </Text>
              <Text className="text-white opacity-80 text-sm mt-2">
                {userDues.length} pending payment{userDues.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        )}

        {/* Dues List */}
        <View className="mx-4 mb-6">
          <Text className="text-xl font-bold text-gray-900 mb-3">Outstanding Payments</Text>
          
          {loading ? (
            <Card className="items-center py-8">
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text className="text-gray-600 mt-2">Loading bills...</Text>
            </Card>
          ) : !userDues || userDues.length === 0 ? (
            <EmptyState
              icon={<CheckCircle size={48} color="#00C471" />}
              title="All Paid Up!"
              message="You have no pending payments"
            />
          ) : (
            <>
              {userDues.slice(0, itemsToShow).map((due, index) => {
              // Backend now returns billId for bills, expenseId for expenses
              const isBill = !!due.billId;
              const id = due.billId || due.expenseId || due._id;
              
              return (
                <Card
                  key={`${id}-${index}`}
                  variant="interactive"
                  onPress={() => handlePayDue(due)}
                  className="mb-2 py-2"
                >
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center mr-3">
                      <Text className="text-primary-600 font-bold text-base">
                        {due.category?.charAt(0).toUpperCase() || (isBill ? 'B' : 'E')}
                      </Text>
                    </View>

                    <View className="flex-1">
                      <Text className="text-base font-semibold text-gray-900">
                        {due.title || (isBill ? 'Bill' : 'Expense')}
                      </Text>
                      <View className="flex-row items-center mt-0.5">
                        <Text className="text-xs text-gray-500">
                          {due.dueDate ? new Date(due.dueDate).toLocaleDateString() : 'No due date'}
                        </Text>
                        <Text className="text-xs text-gray-400 ml-2">
                          • {isBill ? 'Bill' : 'Split Expense'}
                        </Text>
                      </View>
                    </View>

                    <View className="items-end">
                      <Text className="text-lg font-bold text-gray-900">
                        ₹{(due.userAmount || 0).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </Card>
              );
            })}
            
            {/* Load More Button */}
            {userDues.length > itemsToShow && (
              <Button
                variant="secondary"
                size="lg"
                onPress={() => setItemsToShow(prev => prev + 10)}
                className="mt-4"
              >
                Load More ({userDues.length - itemsToShow} remaining)
              </Button>
            )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Payment Modal */}
      <PaymentModal
        visible={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedExpense(null);
        }}
        selectedExpenses={selectedExpense ? [selectedExpense] : []}
        onPaymentComplete={handleBulkPayment}
      />
    </View>
  );
};

export default payDues;