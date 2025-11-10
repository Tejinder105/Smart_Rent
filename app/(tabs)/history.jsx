import { useRouter } from "expo-router";
import { ArrowUpDown, Calendar, CheckCircle, DollarSign, FileText, Home, Users, Zap } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { fetchParticipantExpenses } from "../../store/slices/expenseSlice";
import { fetchPaymentStats, fetchUserPayments } from "../../store/slices/paymentSlice";
// Backend Transaction API integration
import { fetchTransactionSummary, fetchUserTransactions } from "../../store/slices/transactionSlice";

const history = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const dispatch = useDispatch();
  
  const { payments, stats, loading, error } = useSelector((state) => state.payment);
  const { participantExpenses, loading: expenseLoading } = useSelector((state) => state.expense);
  const { userData } = useSelector((state) => state.auth);
  const { currentFlat, loading: flatLoading } = useSelector((state) => state.flat);
  // Backend transaction data
  const { userTransactions, transactionSummary, loading: transactionLoading } = useSelector((state) => state.transaction);
  
  const user = userData;
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('all'); // 'all', 'month', 'quarter', 'year'
  const [useBackendData, setUseBackendData] = useState(true); // Toggle between backend/local data
  
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      // Backend data
      dispatch(fetchUserTransactions()),
      dispatch(fetchTransactionSummary()),
      // Legacy data
      dispatch(fetchUserPayments()),
      dispatch(fetchPaymentStats()),
      dispatch(fetchParticipantExpenses())
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getFilteredPayments = () => {
    if (!payments) return [];
    
    let paidPayments = payments.filter(p => p.status === 'paid');
    
    if (selectedPeriod === 'all') {
      return paidPayments;
    }
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return paidPayments.filter(p => {
      if (!p.paidAt) return false;
      const paidDate = new Date(p.paidAt);
      
      switch (selectedPeriod) {
        case 'month':
          return paidDate.getMonth() === currentMonth && paidDate.getFullYear() === currentYear;
        case 'quarter':
          const quarterStart = Math.floor(currentMonth / 3) * 3;
          const paidMonth = paidDate.getMonth();
          return paidMonth >= quarterStart && paidMonth < quarterStart + 3 && paidDate.getFullYear() === currentYear;
        case 'year':
          return paidDate.getFullYear() === currentYear;
        default:
          return true;
      }
    });
  };


  const getFilteredSplitBills = () => {
    if (!participantExpenses) return [];
    

    let paidExpenses = participantExpenses.filter(expense => {
      const userParticipant = expense.participants?.find(p => p.userId === user?._id);
      return userParticipant && userParticipant.isPaid;
    });
    
    if (selectedPeriod === 'all') {
      return paidExpenses;
    }
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return paidExpenses.filter(expense => {
      const userParticipant = expense.participants?.find(p => p.userId === user?._id);
      if (!userParticipant || !userParticipant.paidAt) return false;
      
      const paidDate = new Date(userParticipant.paidAt);
      
      switch (selectedPeriod) {
        case 'month':
          return paidDate.getMonth() === currentMonth && paidDate.getFullYear() === currentYear;
        case 'quarter':
          const quarterStart = Math.floor(currentMonth / 3) * 3;
          const paidMonth = paidDate.getMonth();
          return paidMonth >= quarterStart && paidMonth < quarterStart + 3 && paidDate.getFullYear() === currentYear;
        case 'year':
          return paidDate.getFullYear() === currentYear;
        default:
          return true;
      }
    });
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'rent': return Home;
      case 'utility': return Zap;
      case 'flatmate': return Home;
      case 'other': return FileText;
      default: return FileText;
    }
  };

  const getIconProps = (type) => {
    switch (type) {
      case 'rent':
        return { iconBgColor: 'bg-green-100', iconColor: '#16a34a' };
      case 'utility':
        return { iconBgColor: 'bg-yellow-100', iconColor: '#eab308' };
      case 'flatmate':
        return { iconBgColor: 'bg-purple-100', iconColor: '#8b5cf6' };
      default:
        return { iconBgColor: 'bg-blue-100', iconColor: '#3b82f6' };
    }
  };

  const handleViewDetails = (bill) => {
    Alert.alert(
      bill.title,
      `Amount: ₹${bill.amount}\nRecipient: ${bill.recipient}\nDue Date: ${new Date(bill.dueDate).toLocaleDateString()}\nType: ${bill.type}\nPriority: ${bill.priority}${bill.notes ? `\n\nNotes: ${bill.notes}` : ''}\n\nPaid on: ${new Date(bill.paidAt).toLocaleDateString()}`,
      [{ text: 'OK' }]
    );
  };

  // History Card Component for paid bills
  const HistoryCard = ({ bill }) => {
    const IconComponent = getIconForType(bill.type);
    const iconProps = getIconProps(bill.type);
    const paidDate = bill.paidAt ? new Date(bill.paidAt) : null;
    
    return (
      <View className="bg-white rounded-2xl p-5 mb-4 mx-4 shadow-sm border border-gray-100">
        {/* Header with Icon and Title */}
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-row items-center flex-1">
            <View className={`w-12 h-12 ${iconProps.iconBgColor} rounded-xl items-center justify-center mr-3`}>
              <IconComponent size={24} color={iconProps.iconColor} />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900 mb-1">
                {bill.title}
              </Text>
              <Text className="text-sm text-gray-500">
                {bill.recipient}
              </Text>
            </View>
          </View>
          
          {/* Paid Badge */}
          <View className="px-3 py-1 rounded-full bg-green-100">
            <Text className="text-xs font-semibold text-green-700">
              ✓ Paid
            </Text>
          </View>
        </View>

        {/* Amount and Payment Date */}
        <View className="bg-green-50 rounded-xl p-4 mb-3">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-xs text-green-600 mb-1">Amount Paid</Text>
              <Text className="text-2xl font-bold text-green-700">
                ₹{bill.amount}
              </Text>
            </View>
            {paidDate && (
              <View className="items-end">
                <Text className="text-xs text-green-600 mb-1">Paid On</Text>
                <Text className="text-sm font-semibold text-green-700">
                  {paidDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Original Due Date */}
        <View className="flex-row items-center mb-3">
          <Calendar size={16} color="#6b7280" />
          <Text className="text-sm text-gray-600 ml-2">
            Due Date: {new Date(bill.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </Text>
        </View>

        {/* Notes */}
        {bill.notes && (
          <Text className="text-sm text-gray-600 mb-3 italic" numberOfLines={2}>
            {bill.notes}
          </Text>
        )}

        {/* View Details Button */}
        <TouchableOpacity
          onPress={() => handleViewDetails(bill)}
          className="bg-gray-100 py-3 rounded-xl"
        >
          <Text className="text-gray-700 font-semibold text-center">
            View Details
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // History Card for Split Bills
  const SplitBillHistoryCard = ({ expense }) => {
    const userParticipant = expense.participants?.find(p => p.userId === user?._id);
    if (!userParticipant) return null;

    const paidDate = userParticipant.paidAt ? new Date(userParticipant.paidAt) : null;
    const paidCount = expense.participants?.filter(p => p.isPaid).length || 0;
    const totalCount = expense.participants?.length || 0;

    return (
      <View className="bg-white rounded-2xl p-5 mb-4 mx-4 shadow-sm border border-gray-100">
        {/* Header */}
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-row items-center flex-1">
            <View className="w-12 h-12 bg-green-100 rounded-xl items-center justify-center mr-3">
              <Users size={24} color="#16a34a" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900 mb-1">
                {expense.title}
              </Text>
              <Text className="text-sm text-gray-500">
                Split Expense
              </Text>
            </View>
          </View>
          
          {/* Paid Badge */}
          <View className="px-3 py-1 rounded-full bg-green-100">
            <Text className="text-xs font-semibold text-green-700">
              ✓ Paid
            </Text>
          </View>
        </View>

        {/* Amount Section */}
        <View className="bg-green-50 rounded-xl p-4 mb-3">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-xs text-green-600 mb-1">Your Share Paid</Text>
              <Text className="text-2xl font-bold text-green-700">
                ₹{userParticipant.amount.toFixed(2)}
              </Text>
            </View>
            {paidDate && (
              <View className="items-end">
                <Text className="text-xs text-green-600 mb-1">Paid On</Text>
                <Text className="text-sm font-semibold text-green-700">
                  {paidDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Text>
              </View>
            )}
          </View>
          <Text className="text-xs text-green-600 mt-2">
            Total Bill: ₹{expense.totalAmount} • {paidCount}/{totalCount} paid
          </Text>
        </View>

        {/* Category */}
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-sm text-gray-600">
            {expense.category?.charAt(0).toUpperCase() + expense.category?.slice(1)}
          </Text>
        </View>

        {/* Description */}
        {expense.description && (
          <Text className="text-sm text-gray-600 mb-3 italic" numberOfLines={2}>
            {expense.description}
          </Text>
        )}

        {/* View Details Button */}
        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              expense.title,
              `Total Amount: ₹${expense.totalAmount}\nYour Share: ₹${userParticipant.amount}\nCategory: ${expense.category}\nPaid On: ${paidDate ? paidDate.toLocaleDateString() : 'N/A'}\nParticipants Paid: ${paidCount}/${totalCount}${expense.description ? `\n\nDescription: ${expense.description}` : ''}${expense.notes ? `\n\nNotes: ${expense.notes}` : ''}`,
              [{ text: 'OK' }]
            );
          }}
          className="bg-gray-100 py-3 rounded-xl"
        >
          <Text className="text-gray-700 font-semibold text-center">
            View Details
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const PeriodChip = ({ label, value }) => {
    const isSelected = selectedPeriod === value;
    return (
      <TouchableOpacity
        onPress={() => setSelectedPeriod(value)}
        className={`px-4 py-2 rounded-full mr-2 ${
          isSelected ? 'bg-green-500' : 'bg-white border border-gray-200'
        }`}
      >
        <Text className={`font-medium ${
          isSelected ? 'text-white' : 'text-gray-700'
        }`}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const filteredPayments = getFilteredPayments();
  const filteredSplitBills = getFilteredSplitBills();

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 py-4 bg-white" style={{ paddingTop: insets.top + 12 }}>
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-[26px] pl-2 font-bold text-gray-900">
              Payment History
            </Text>
            <Text className="text-sm pl-2 text-gray-500 mt-1">
              {useBackendData ? 'Unified transaction view' : 'Track all your past payments'}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Data Source Toggle */}
        <View className="mx-4 mt-4 bg-white rounded-2xl p-2 flex-row">
          <TouchableOpacity 
            onPress={() => setUseBackendData(true)}
            className={`flex-1 py-2 rounded-xl flex-row items-center justify-center ${useBackendData ? 'bg-green-500' : 'bg-transparent'}`}
          >
            <ArrowUpDown size={16} color={useBackendData ? '#fff' : '#6b7280'} />
            <Text className={`font-semibold ml-2 ${useBackendData ? 'text-white' : 'text-gray-600'}`}>
              Unified View
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setUseBackendData(false)}
            className={`flex-1 py-2 rounded-xl ${!useBackendData ? 'bg-gray-500' : 'bg-transparent'}`}
          >
            <Text className={`text-center font-semibold ${!useBackendData ? 'text-white' : 'text-gray-600'}`}>
              Separated
            </Text>
          </TouchableOpacity>
        </View>

        {useBackendData ? (
          // Backend Unified Transaction View
          <>
            {/* Transaction Summary Cards */}
            {transactionSummary && (
              <View className="px-4 py-4">
                <View className="flex-row gap-3">
                  <View className="flex-1 bg-white rounded-2xl p-4 border border-green-200">
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-gray-600 text-sm">Total Paid</Text>
                      <CheckCircle size={18} color="#16a34a" />
                    </View>
                    <Text className="text-2xl font-bold text-green-600">
                      ₹{transactionSummary.totalAmount?.toFixed(0) || 0}
                    </Text>
                    <Text className="text-xs text-gray-500 mt-1">
                      {transactionSummary.totalTransactions || 0} transactions
                    </Text>
                  </View>

                  <View className="flex-1 bg-white rounded-2xl p-4 border border-blue-200">
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-gray-600 text-sm">Bills Paid</Text>
                      <FileText size={18} color="#3b82f6" />
                    </View>
                    <Text className="text-2xl font-bold text-blue-600">
                      {transactionSummary.billCount || 0}
                    </Text>
                    <Text className="text-xs text-gray-500 mt-1">
                      ₹{transactionSummary.billAmount?.toFixed(0) || 0}
                    </Text>
                  </View>

                  <View className="flex-1 bg-white rounded-2xl p-4 border border-purple-200">
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-gray-600 text-sm">Avg/Txn</Text>
                      <DollarSign size={18} color="#8b5cf6" />
                    </View>
                    <Text className="text-2xl font-bold text-purple-600">
                      ₹{transactionSummary.totalTransactions > 0 
                        ? Math.round(transactionSummary.totalAmount / transactionSummary.totalTransactions) 
                        : 0}
                    </Text>
                    <Text className="text-xs text-gray-500 mt-1">average</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Unified Transaction List */}
            <View className="pb-6">
              {transactionLoading && !refreshing ? (
                <View className="flex-1 justify-center items-center py-8">
                  <ActivityIndicator size="large" color="#16a34a" />
                  <Text className="mt-2 text-gray-600">Loading transactions...</Text>
                </View>
              ) : !userTransactions || userTransactions.length === 0 ? (
                <View className="bg-blue-50 border border-blue-200 rounded-xl p-6 mx-4 items-center">
                  <ArrowUpDown size={48} color="#3b82f6" />
                  <Text className="text-blue-800 text-lg font-semibold mt-4">No Transactions</Text>
                  <Text className="text-blue-600 text-center mt-2">
                    Your transaction history will appear here
                  </Text>
                </View>
              ) : (
                <View className="mx-4">
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-lg font-bold text-gray-900">
                      All Transactions
                    </Text>
                    <View className="bg-green-100 px-3 py-1 rounded-full">
                      <Text className="text-green-700 text-xs font-semibold">
                        {userTransactions.length} total
                      </Text>
                    </View>
                  </View>

                  {userTransactions.map((txn, index) => (
                    <View key={txn._id || index} className="bg-white rounded-2xl p-4 mb-3 border border-gray-100">
                      <View className="flex-row items-start justify-between mb-2">
                        <View className="flex-row items-center flex-1">
                          <View className={`w-12 h-12 rounded-xl items-center justify-center mr-3 ${
                            txn.type === 'bill_payment' ? 'bg-blue-100' :
                            txn.type === 'expense_share' ? 'bg-purple-100' :
                            'bg-green-100'
                          }`}>
                            {txn.type === 'bill_payment' && <FileText size={24} color="#3b82f6" />}
                            {txn.type === 'expense_share' && <Users size={24} color="#8b5cf6" />}
                            {txn.type === 'payment' && <DollarSign size={24} color="#16a34a" />}
                          </View>
                          <View className="flex-1">
                            <Text className="text-base font-bold text-gray-900">
                              {txn.description || 'Transaction'}
                            </Text>
                            <Text className="text-sm text-gray-500 mt-1">
                              {txn.type === 'bill_payment' ? 'Bill Payment' :
                               txn.type === 'expense_share' ? 'Split Expense' :
                               'Payment'}
                            </Text>
                          </View>
                        </View>
                        
                        <View className="items-end">
                          <Text className="text-lg font-bold text-green-600">
                            ₹{txn.amount?.toFixed(0) || 0}
                          </Text>
                          <Text className="text-xs text-gray-500 mt-1">
                            {new Date(txn.date).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </Text>
                        </View>
                      </View>

                      {txn.reference && (
                        <View className="bg-gray-50 rounded-lg p-2 mt-2">
                          <Text className="text-xs text-gray-600">
                            Ref: {txn.reference}
                          </Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>
          </>
        ) : (
          // Legacy Separated View
          <>
        {/* Payment History Statistics */}
        <View className="px-4 py-4">
          <View className="flex-row gap-3">
            <View className="flex-1 bg-white rounded-2xl p-4 border border-gray-100">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-gray-600 text-sm">Total Paid</Text>
                <CheckCircle size={18} color="#16a34a" />
              </View>
              <Text className="text-2xl font-bold text-green-600">₹{stats.paidAmount || 0}</Text>
              <Text className="text-xs text-gray-500 mt-1">{stats.paidCount || 0} payments</Text>
            </View>

            <View className="flex-1 bg-white rounded-2xl p-4 border border-gray-100">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-gray-600 text-sm">This Month</Text>
                <Calendar size={18} color="#8b5cf6" />
              </View>
              <Text className="text-2xl font-bold text-purple-600">
                ₹{(() => {
                  const currentMonth = new Date().getMonth();
                  const currentYear = new Date().getFullYear();
                  const thisMonthPayments = payments?.filter(p => {
                    if (p.status !== 'paid' || !p.paidAt) return false;
                    const paidDate = new Date(p.paidAt);
                    return paidDate.getMonth() === currentMonth && paidDate.getFullYear() === currentYear;
                  }) || [];
                  return thisMonthPayments.reduce((sum, p) => sum + p.amount, 0).toFixed(0);
                })()}
              </Text>
              <Text className="text-xs text-gray-500 mt-1">
                {(() => {
                  const currentMonth = new Date().getMonth();
                  const currentYear = new Date().getFullYear();
                  const thisMonthCount = payments?.filter(p => {
                    if (p.status !== 'paid' || !p.paidAt) return false;
                    const paidDate = new Date(p.paidAt);
                    return paidDate.getMonth() === currentMonth && paidDate.getFullYear() === currentYear;
                  }).length || 0;
                  return thisMonthCount;
                })()} paid
              </Text>
            </View>

            <View className="flex-1 bg-white rounded-2xl p-4 border border-gray-100">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-gray-600 text-sm">Avg/Bill</Text>
                <DollarSign size={18} color="#0ea5e9" />
              </View>
              <Text className="text-2xl font-bold text-sky-600">
                ₹{stats.paidCount > 0 ? Math.round(stats.paidAmount / stats.paidCount) : 0}
              </Text>
              <Text className="text-xs text-gray-500 mt-1">average</Text>
            </View>
          </View>
        </View>

        {/* Period Filter */}
        <View className="px-4 mb-4">
          <Text className="text-sm font-semibold text-gray-700 mb-2">Filter by Period</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row">
              <PeriodChip label="All Time" value="all" />
              <PeriodChip label="This Month" value="month" />
              <PeriodChip label="This Quarter" value="quarter" />
              <PeriodChip label="This Year" value="year" />
            </View>
          </ScrollView>
        </View>

        {/* Error Message */}
        {error && (
          <View className="bg-red-50 border border-red-200 rounded-xl p-4 mx-4 mb-4">
            <Text className="text-red-800 text-center">{error}</Text>
          </View>
        )}

        {/* Payment History List */}
        <View className="pb-6">
          {(loading || expenseLoading) && !refreshing ? (
            <View className="flex-1 justify-center items-center py-8">
              <ActivityIndicator size="large" color="#16a34a" />
              <Text className="mt-2 text-gray-600">Loading payment history...</Text>
            </View>
          ) : filteredPayments.length === 0 && filteredSplitBills.length === 0 ? (
            <View className="bg-green-50 border border-green-200 rounded-xl p-6 mx-4 items-center">
              <CheckCircle size={48} color="#16a34a" />
              <Text className="text-green-800 text-lg font-semibold mt-4">No Payment History</Text>
              <Text className="text-green-600 text-center mt-2">
                {selectedPeriod === 'all' 
                  ? "You haven't made any payments yet."
                  : `No payments found for the selected period.`}
              </Text>
            </View>
          ) : (
            <>
              {/* Personal Payment History */}
              {filteredPayments.length > 0 && (
                <View className="mb-4">
                  <Text className="text-lg font-bold text-gray-900 mb-3 mx-4">
                    Personal Payments
                  </Text>
                  {filteredPayments.map((bill) => (
                    <HistoryCard key={bill._id} bill={bill} />
                  ))}
                </View>
              )}

              {/* Split Bills History */}
              {filteredSplitBills.length > 0 && (
                <View>
                  <Text className="text-lg font-bold text-gray-900 mb-3 mx-4">
                    Split Bills
                  </Text>
                  {filteredSplitBills.map((expense) => (
                    <SplitBillHistoryCard key={expense._id} expense={expense} />
                  ))}
                </View>
              )}
            </>
          )}
        </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default history;
