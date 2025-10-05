import { useRouter } from "expo-router";
import { Calendar, CheckCircle, DollarSign, FileText, Home, Users, Zap } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { fetchParticipantExpenses } from "../../store/slices/expenseSlice";
import { fetchPaymentStats, fetchUserPayments } from "../../store/slices/paymentSlice";

const history = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const dispatch = useDispatch();
  
  const { payments, stats, loading, error } = useSelector((state) => state.payment);
  const { participantExpenses, loading: expenseLoading } = useSelector((state) => state.expense);
  const { userData } = useSelector((state) => state.auth);
  const user = userData;
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('all'); // 'all', 'month', 'quarter', 'year'
  
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
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
    
    // Only show paid bills
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

  // Filter split bills - ONLY show paid transactions
  const getFilteredSplitBills = () => {
    if (!participantExpenses) return [];
    
    // Only show paid split bills
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
              Track all your past payments
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
      </ScrollView>
    </View>
  );
};

export default history;
