import { useRouter } from 'expo-router';
import { Bell, Camera, CreditCard, FileText, Plus, Receipt } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import ErrorBoundary from '../../components/ErrorBoundary';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import PaymentModal from '../../components/PaymentModal';
import {
    BillCard,
    Button,
    Card,
    EmptyState,
    PageHeader,
    SectionTitle
} from '../../components/ui';
import { fetchExpenseHistory, fetchUserDues, invalidateCache, recordBulkPayment } from '../../store/slices/expenseUnifiedSlice';

const Bills = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = React.useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedExpenses, setSelectedExpenses] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Use unified expense slice
  const { financials, expenseHistory, loading, paymentLoading } = useSelector((state) => state.expenseUnified);
  const { userData } = useSelector((state) => state.auth);
  const { currentFlat, loading: flatLoading } = useSelector((state) => state.flat);

  useEffect(() => {
    loadData();
  }, [currentFlat?._id]);

  const loadData = async () => {
    if (currentFlat?._id) {
      // Fetch user dues (bills + expenses combined)
      await dispatch(fetchUserDues(currentFlat._id));
      // Fetch expense history
      await dispatch(fetchExpenseHistory({ 
        flatId: currentFlat._id, 
        page: 1, 
        limit: 20 
      }));
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleNotificationPress = () => {
    router.push("/reminders");
  };

  const handleScanBill = () => {
    router.push('/scanBill');
  };

  const handleCreateBill = () => {
    router.push('/createBill');
  };

  const handleSplitExpense = () => {
    router.push('/splitExpense');
  };

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedExpenses([]);
  };

  const toggleExpenseSelection = (expense, userAmount, isBill) => {
    const expenseId = expense._id;
    const isSelected = selectedExpenses.some(e => e._id === expenseId);
    
    if (isSelected) {
      setSelectedExpenses(selectedExpenses.filter(e => e._id !== expenseId));
    } else {
      setSelectedExpenses([...selectedExpenses, {
        _id: expense._id,
        title: expense.title,
        userAmount,
        isBill,
        expenseType: isBill ? 'bill' : 'expense'
      }]);
    }
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

      await dispatch(recordBulkPayment({ payments })).unwrap();
      
      // Clear cache and close modal first
      dispatch(invalidateCache());
      setShowPaymentModal(false);
      
      // Reset selection
      setSelectedExpenses([]);
      setSelectionMode(false);
      
      // Force immediate refetch with force=true
      if (currentFlat?._id) {
        await dispatch(fetchUserDues({ flatId: currentFlat._id, force: true })).unwrap();
      }
      await loadData();
      
      Alert.alert(
        'Payment Successful!',
        `Successfully recorded payment for ${payments.length} ${payments.length === 1 ? 'item' : 'items'}`,
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      throw error; // Let PaymentModal handle the error display
    }
  };

  const getSelectedTotal = () => {
    return selectedExpenses.reduce((sum, expense) => sum + expense.userAmount, 0);
  };

  // Extract dues and history from state
  const userDues = financials?.userDues?.dues || [];
  const allExpenses = expenseHistory?.data || [];
  const currentUserId = useSelector(state => state.auth.user?._id);
  
  // Debug logging
  console.log('📊 Bills Screen - All Expenses:', allExpenses.length);
  console.log('📊 Bills Screen - Current User ID:', currentUserId);
  console.log('📊 Bills Screen - Expense History Data:', expenseHistory);
  allExpenses.forEach((exp, idx) => {
    console.log(`  ${idx + 1}. ${exp.title} - splits: ${exp.splits?.length || 0}, participants: ${exp.participants?.length || 0}, status: ${exp.status}`);
  });
  
  // Separate bills (shared expenses) from split expenses
  const billsOnly = allExpenses.filter(e => e.splits !== undefined); // Has splits = Bill
  const splitExpensesOnly = allExpenses.filter(e => e.participants !== undefined && e.splits === undefined); // Has participants but no splits = Split Expense
  
  console.log('💵 Bills Only:', billsOnly.length);
  console.log('💸 Split Expenses Only:', splitExpensesOnly.length);
  
  // For bills, check the CURRENT USER'S split status, not the bill's overall status
  const activeBills = billsOnly.filter(bill => {
    const userSplit = bill.splits?.find(split => 
      split.userId?._id === currentUserId || split.userId === currentUserId
    );
    const isUserOwed = userSplit && userSplit.status === 'owed';
    console.log(`Bill "${bill.title}": userSplit status = ${userSplit?.status || 'N/A'}, isUserOwed = ${isUserOwed}`);
    return isUserOwed;
  });
  
  const paidBills = billsOnly.filter(bill => {
    const userSplit = bill.splits?.find(split => 
      split.userId?._id === currentUserId || split.userId === currentUserId
    );
    const isUserPaid = userSplit && userSplit.status === 'paid';
    return isUserPaid;
  });
  
  console.log('✅ Active Bills (user owes):', activeBills.length);
  console.log('✅ Paid Bills (user paid):', paidBills.length);
  
  // Split expenses with no dues (all are informational)
  const allSplitExpenses = splitExpensesOnly;

  return (
    <ErrorBoundary
      errorMessage="Unable to load bills. Please try again."
      onReset={loadData}
    >
      <View className="flex-1 bg-background">
        {/* Header */}
        <PageHeader 
          title="Bills & Expenses"
          rightAction={
            <TouchableOpacity 
              onPress={handleNotificationPress}
              className="w-10 h-10 items-center justify-center bg-surface-100 rounded-full"
            >
              <Bell size={20} color="#6B7785" />
            </TouchableOpacity>
          }
        />

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="p-4">
          {/* Quick Actions */}
          <View className="flex-row gap-3 mb-6">
            <Card
              variant="interactive"
              onPress={handleScanBill}
              className="flex-1 items-center border-2 border-primary-200"
            >
              <View className="w-12 h-12 bg-primary-100 rounded-full items-center justify-center mb-md">
                <Camera size={24} color="#236B63" />
              </View>
              <Text className="text-primary-500 font-semibold text-sm">Scan Bill</Text>
            </Card>
            
            <Card
              variant="interactive"
              onPress={handleCreateBill}
              className="flex-1 items-center border-2 border-success-200"
            >
              <View className="w-12 h-12 bg-success-100 rounded-full items-center justify-center mb-md">
                <Plus size={24} color="#16A34A" />
              </View>
              <Text className="text-success-500 font-semibold text-sm">Add Bill</Text>
            </Card>

            <Card
              variant="interactive"
              onPress={handleSplitExpense}
              className="flex-1 items-center border-2 border-warning-200"
            >
              <View className="w-12 h-12 bg-warning-100 rounded-full items-center justify-center mb-md">
                <FileText size={24} color="#F59E0B" />
              </View>
              <Text className="text-warning-500 font-semibold text-sm">Split</Text>
            </Card>
          </View>

          {loading && !refreshing ? (
            <LoadingSkeleton type="summary" count={1} />
          ) : !currentFlat ? (
            <EmptyState
              icon={<Receipt size={32} color="#94A3B8" />}
              title="No Flat Yet"
              message="Create or join a flat to start managing bills and expenses"
              actionLabel="Create Flat"
              onAction={() => router.push('/createFlat')}
            />
          ) : (
            <>
              {/* Selection Mode Actions */}
              {activeBills.length > 0 && (
                <Card className="mb-4">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-text-primary">
                        {selectionMode ? `${selectedExpenses.length} Selected` : 'Unpaid Bills'}
                      </Text>
                      {selectionMode && selectedExpenses.length > 0 && (
                        <Text className="text-sm text-text-secondary mt-1">
                          Total: ₹{getSelectedTotal().toFixed(2)}
                        </Text>
                      )}
                    </View>
                    
                    {!selectionMode ? (
                      <Button
                        variant="primary"
                        size="md"
                        onPress={toggleSelectionMode}
                        leftIcon={<CreditCard size={16} color="white" />}
                      >
                        Pay Bills
                      </Button>
                    ) : (
                      <View className="flex-row gap-2">
                        <Button
                          variant="primary"
                          size="md"
                          onPress={() => setShowPaymentModal(true)}
                          disabled={selectedExpenses.length === 0}
                        >
                          Pay
                        </Button>
                        <Button
                          variant="secondary"
                          size="md"
                          onPress={toggleSelectionMode}
                        >
                          Cancel
                        </Button>
                      </View>
                    )}
                  </View>
                </Card>
              )}

              {/* Active Bills */}
              {loading && !refreshing ? (
                <LoadingSkeleton type="bill" count={3} />
              ) : activeBills.length > 0 ? (
                <View className="mb-6">
                  <SectionTitle 
                    title={`Active Bills (${activeBills.length})`}
                    className="px-2"
                  />
                  
                  <View className="gap-3">
                    {activeBills.map((expense, index) => {
                      // Handle both Bill (with splits) and Expense (with participants)
                      const isBill = expense.splits !== undefined;
                      let userShare, isPaid, amount;
                      
                      if (isBill) {
                        // For Bills: find user's split
                        userShare = expense.splits?.find(
                          s => s.userId?._id === userData?._id || s.userId === userData?._id
                        );
                        isPaid = userShare?.status === 'paid' || userShare?.status === 'settled';
                        amount = userShare?.amount || 0;
                      } else {
                        // For Expenses: find user in participants
                        userShare = expense.participants?.find(
                          p => p && p.userId && (p.userId._id === userData?._id || p.userId === userData?._id)
                        );
                        isPaid = userShare?.isPaid || false;
                        amount = userShare?.amount || 0;
                      }
                      
                      const isSelected = selectedExpenses.some(e => e._id === expense._id);
                      const canSelect = selectionMode && !isPaid;
                      
                      // Determine status
                      let status = 'pending';
                      if (isPaid) status = 'paid';
                      else if (expense.status === 'overdue') status = 'overdue';
                      else if (expense.status === 'partial') status = 'partial';
                      
                      return (
                        <TouchableOpacity 
                          key={`${expense._id}-${index}`}
                          onPress={() => {
                            if (canSelect) {
                              toggleExpenseSelection(expense, amount, isBill);
                            } else if (!selectionMode) {
                              router.push(`/${isBill ? 'billDetails' : 'expenseDetails'}?id=${expense._id}`);
                            }
                          }}
                          className={isSelected ? 'opacity-75' : ''}
                        >
                          <BillCard
                            title={expense.title}
                            category={expense.category || (isBill ? 'Bill' : 'Expense')}
                            amount={`₹${amount.toFixed(2)}`}
                            dueDate={expense.dueDate 
                              ? new Date(expense.dueDate).toLocaleDateString()
                              : new Date(expense.createdAt).toLocaleDateString()}
                            status={status}
                            icon={
                              <Text className={`font-bold text-lg ${
                                isPaid ? 'text-success-600' : 
                                expense.status === 'overdue' ? 'text-danger-600' : 
                                'text-warning-600'
                              }`}>
                                {expense.category?.charAt(0).toUpperCase() || (isBill ? 'B' : 'E')}
                              </Text>
                            }
                          />
                          
                          {/* Selection Checkbox Overlay */}
                          {canSelect && (
                            <View className="absolute top-4 left-4 z-10">
                            <View className={`w-6 h-6 rounded-md border-2 items-center justify-center ${
                              isSelected ? 'bg-primary-500 border-primary-500' : 'border-border bg-surface-0'
                            }`}>
                                {isSelected && (
                                  <Text className="text-white text-xs font-bold">✓</Text>
                                )}
                              </View>
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ) : null}

              {/* Recently Paid Bills */}
              {paidBills.length > 0 && (
                <View className="mb-6">
                  <SectionTitle 
                    title={`Recently Paid Bills (${paidBills.slice(0, 5).length})`}
                    className="px-2"
                  />
                  
                  <View className="gap-3">
                    {paidBills.slice(0, 5).map((expense, index) => {
                      // Handle both Bill (with splits) and Expense (with participants)
                      const isBill = expense.splits !== undefined;
                      let userShare, amount;
                      
                      if (isBill) {
                        userShare = expense.splits?.find(
                          s => s.userId?._id === userData?._id || s.userId === userData?._id
                        );
                        amount = userShare?.amount || 0;
                      } else {
                        userShare = expense.participants?.find(
                          p => p && p.userId && (p.userId._id === userData?._id || p.userId === userData?._id)
                        );
                        amount = userShare?.amount || 0;
                      }
                      
                      return (
                        <BillCard
                          key={`${expense._id}-${index}`}
                          title={expense.title}
                          category={expense.category || (isBill ? 'Bill' : 'Expense')}
                          amount={`₹${amount.toFixed(2)}`}
                          dueDate={userShare?.paidAt 
                            ? `Paid on ${new Date(userShare.paidAt).toLocaleDateString()}`
                            : new Date(expense.updatedAt).toLocaleDateString()}
                          status="paid"
                          icon={
                            <Text className="text-text-secondary font-bold text-lg">
                              {expense.category?.charAt(0).toUpperCase() || (isBill ? 'B' : 'E')}
                            </Text>
                          }
                          onPress={() => router.push(`/${isBill ? 'billDetails' : 'expenseDetails'}?id=${expense._id}`)}
                        />
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Split Expenses Section - No Dues */}
              {allSplitExpenses.length > 0 && (
                <View className="mb-6">
                  <SectionTitle 
                    title={`Split Expenses (${allSplitExpenses.length})`}
                    className="px-2"
                  />
    
                  
                  <View className="gap-3">
                    {allSplitExpenses.map((expense, index) => {
                      // For Expenses: find user in participants
                      const userShare = expense.participants?.find(
                        p => p && p.userId && (p.userId._id === userData?._id || p.userId === userData?._id)
                      );
                      const amount = userShare?.amount || 0;
                      const isPaid = userShare?.isPaid || false;
                      
                      return (
                        <TouchableOpacity 
                          key={`${expense._id}-${index}`}
                          onPress={() => router.push(`/expenseDetails?id=${expense._id}`)}
                        >
                          <BillCard
                            title={expense.title}
                            category={expense.category || 'Expense'}
                            amount={`₹${amount.toFixed(2)}`}
                            dueDate={new Date(expense.createdAt).toLocaleDateString()}
                            status={isPaid ? 'paid' : 'info'}
                            icon={
                            <Text className="text-warning-500 font-bold text-lg">
                              {expense.category?.charAt(0).toUpperCase() || 'E'}
                            </Text>
                            }
                          />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Empty State */}
              {activeBills.length === 0 && paidBills.length === 0 && allSplitExpenses.length === 0 && (
                <EmptyState
                  icon={<Receipt size={32} color="#94A3B8" />}
                  title="No Bills Yet"
                  message="Start by scanning a bill or creating a new expense to split with your flatmates"
                  actionLabel="Scan Your First Bill"
                  onAction={handleScanBill}
                />
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Payment Modal */}
      <PaymentModal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        selectedExpenses={selectedExpenses}
        onPaymentComplete={handleBulkPayment}
      />
    </View>
    </ErrorBoundary>
  );
};

export default Bills;
