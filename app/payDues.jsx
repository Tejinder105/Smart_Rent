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
import { fetchUserDues, invalidateCache, recordBulkPayment, selectFinancials } from '../store/slices/expenseUnifiedSlice';
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
  console.log('💰 PayDues - billDues:', billDues.length);
  console.log('💰 PayDues - expenseDues:', expenseDues.length);
  console.log('💰 PayDues - userDues total:', userDues.length);
  console.log('💰 PayDues - totalDuesAmount:', totalDuesAmount);
  console.log('💰 PayDues - financials.userDues:', financials.userDues);
  
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    if (currentFlat?._id) {
      dispatch(fetchUserDues(currentFlat._id));
    }
    dispatch(fetchUserFlat());
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
    console.log('💰💰💰 handlePayDue called!', due);
    Alert.alert('Debug', `Clicked on: ${due.title || 'Unknown'}`);
    
    // Determine if it's a bill or expense
    const isBillDue = !!due.billId;
    const id = isBillDue ? due.billId?._id : due.expenseId;
    const title = isBillDue ? due.billId?.title : due.title;
    const amount = due.amount;
    
    console.log('💰 PayDues - Paying due:', { isBillDue, id, title, amount, due });
    
    // Set selected expense for payment modal
    setSelectedExpense({
      _id: id,
      title: title,
      userAmount: amount,
      isBill: isBillDue,
      expenseType: isBillDue ? 'bill' : 'expense'
    });
    setShowPaymentModal(true);
  };

  const handleBulkPayment = async (paymentData) => {
    try {
      const payments = paymentData.expenses.map(expense => ({
        expenseId: expense._id,
        expenseType: expense.expenseType,
        amount: expense.userAmount,
        paymentMethod: paymentData.paymentMethod,
        transactionReference: paymentData.transactionReference,
        note: paymentData.note
      }));

      console.log('💰 PayDues - Recording payment:', payments);

      await dispatch(recordBulkPayment({ payments })).unwrap();
      
      // Clear cache and close modal
      dispatch(invalidateCache());
      setShowPaymentModal(false);
      setSelectedExpense(null);
      
      // Reload data with a small delay
      setTimeout(async () => {
        await loadData();
        
        Alert.alert(
          'Payment Successful!',
          `Successfully recorded payment for ${payments.length} ${payments.length === 1 ? 'item' : 'items'}`,
          [{ text: 'OK' }]
        );
      }, 300);
      
    } catch (error) {
      throw error; // Let PaymentModal handle the error display
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
                ₹{totalDuesAmount.toFixed(2)}
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
            userDues.map((due, index) => {
              // Handle both bill dues and expense dues
              const isBillDue = !!due.billId;
              const id = isBillDue ? due.billId?._id : due.expenseId;
              const title = isBillDue ? due.billId?.title : due.title;
              const category = isBillDue ? due.billId?.category : due.category;
              const dueDate = isBillDue ? due.billId?.dueDate : null;
              const amount = due.amount;
              
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
                        {category?.charAt(0).toUpperCase() || (isBillDue ? 'B' : 'E')}
                      </Text>
                    </View>

                    <View className="flex-1">
                      <Text className="text-base font-semibold text-gray-900">{title || (isBillDue ? 'Bill' : 'Expense')}</Text>
                      <View className="flex-row items-center mt-0.5">
                        <Text className="text-xs text-gray-500">
                          {dueDate ? new Date(dueDate).toLocaleDateString() : 'No due date'}
                        </Text>
                        <Text className="text-xs text-gray-400 ml-2">
                          • {isBillDue ? 'Bill' : 'Split Expense'}
                        </Text>
                      </View>
                    </View>

                    <View className="items-end">
                      <Text className="text-lg font-bold text-gray-900">₹{amount.toFixed(2)}</Text>
                    </View>
                  </View>
                </Card>
              );
            })
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