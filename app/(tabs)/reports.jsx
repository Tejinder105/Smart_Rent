import { useRouter } from "expo-router";
import { BarChart3, Calendar, ChevronLeft, ChevronRight, Download, TrendingDown, TrendingUp, Users } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Share, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { fetchParticipantExpenses } from "../../store/slices/expenseSlice";
import { fetchUserPayments } from "../../store/slices/paymentSlice";

const reports = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const dispatch = useDispatch();

  const { payments, loading: paymentsLoading } = useSelector((state) => state.payment);
  const { participantExpenses, loading: expensesLoading } = useSelector((state) => state.expense);
  const { userData } = useSelector((state) => state.auth);
  const user = userData;

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (payments && participantExpenses) {
      generateReportData();
    }
  }, [selectedDate, payments, participantExpenses]);

  const loadData = async () => {
    await Promise.all([
      dispatch(fetchUserPayments()),
      dispatch(fetchParticipantExpenses())
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const generateReportData = () => {
    const month = selectedDate.getMonth();
    const year = selectedDate.getFullYear();

    // Filter payments for selected month
    const monthPayments = payments?.filter(p => {
      if (p.status !== 'paid' || !p.paidAt) return false;
      const paidDate = new Date(p.paidAt);
      return paidDate.getMonth() === month && paidDate.getFullYear() === year;
    }) || [];

    // Filter split expenses for selected month
    const monthExpenses = participantExpenses?.filter(expense => {
      const userParticipant = expense.participants?.find(p => p.userId === user?._id);
      if (!userParticipant || !userParticipant.isPaid || !userParticipant.paidAt) return false;
      const paidDate = new Date(userParticipant.paidAt);
      return paidDate.getMonth() === month && paidDate.getFullYear() === year;
    }) || [];

    // Calculate total spent
    const personalTotal = monthPayments.reduce((sum, p) => sum + p.amount, 0);
    const splitTotal = monthExpenses.reduce((sum, expense) => {
      const userParticipant = expense.participants?.find(p => p.userId === user?._id);
      return sum + (userParticipant?.amount || 0);
    }, 0);
    const totalSpent = personalTotal + splitTotal;

    // Category breakdown
    const categoryBreakdown = {};
    
    // Personal payments by type
    monthPayments.forEach(p => {
      const category = p.type || 'other';
      categoryBreakdown[category] = (categoryBreakdown[category] || 0) + p.amount;
    });

    // Split expenses by category
    monthExpenses.forEach(expense => {
      const category = expense.category || 'other';
      const userParticipant = expense.participants?.find(p => p.userId === user?._id);
      categoryBreakdown[category] = (categoryBreakdown[category] || 0) + (userParticipant?.amount || 0);
    });

    // Convert to array and sort
    const categories = Object.entries(categoryBreakdown)
      .map(([name, amount]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        amount,
        percentage: totalSpent > 0 ? (amount / totalSpent) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount);

    // Calculate previous month data for comparison
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    
    const prevMonthPayments = payments?.filter(p => {
      if (p.status !== 'paid' || !p.paidAt) return false;
      const paidDate = new Date(p.paidAt);
      return paidDate.getMonth() === prevMonth && paidDate.getFullYear() === prevYear;
    }) || [];

    const prevMonthExpenses = participantExpenses?.filter(expense => {
      const userParticipant = expense.participants?.find(p => p.userId === user?._id);
      if (!userParticipant || !userParticipant.isPaid || !userParticipant.paidAt) return false;
      const paidDate = new Date(userParticipant.paidAt);
      return paidDate.getMonth() === prevMonth && paidDate.getFullYear() === prevYear;
    }) || [];

    const prevPersonalTotal = prevMonthPayments.reduce((sum, p) => sum + p.amount, 0);
    const prevSplitTotal = prevMonthExpenses.reduce((sum, expense) => {
      const userParticipant = expense.participants?.find(p => p.userId === user?._id);
      return sum + (userParticipant?.amount || 0);
    }, 0);
    const prevTotalSpent = prevPersonalTotal + prevSplitTotal;

    const spendingChange = prevTotalSpent > 0 
      ? ((totalSpent - prevTotalSpent) / prevTotalSpent) * 100 
      : 0;

    setReportData({
      totalSpent,
      personalTotal,
      splitTotal,
      categories,
      transactionCount: monthPayments.length + monthExpenses.length,
      personalCount: monthPayments.length,
      splitCount: monthExpenses.length,
      spendingChange,
      monthPayments,
      monthExpenses
    });
  };

  const handlePreviousMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    const today = new Date();
    if (selectedDate.getMonth() === today.getMonth() && selectedDate.getFullYear() === today.getFullYear()) {
      Alert.alert('Info', 'You cannot view future reports.');
      return;
    }
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
  };

  const handleDownloadReport = async () => {
    if (!reportData) {
      Alert.alert('Error', 'No report data available');
      return;
    }

    const monthName = selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    // Create report text
    let reportText = `📊 SMART RENT - MONTHLY REPORT\n`;
    reportText += `═══════════════════════════════\n\n`;
    reportText += `📅 Period: ${monthName}\n`;
    reportText += `👤 User: ${user?.userName || 'User'}\n`;
    reportText += `📆 Generated: ${new Date().toLocaleDateString()}\n\n`;
    
    reportText += `💰 FINANCIAL SUMMARY\n`;
    reportText += `───────────────────────────────\n`;
    reportText += `Total Spent: ₹${reportData.totalSpent.toFixed(2)}\n`;
    reportText += `Personal Payments: ₹${reportData.personalTotal.toFixed(2)}\n`;
    reportText += `Split Expenses: ₹${reportData.splitTotal.toFixed(2)}\n`;
    reportText += `Total Transactions: ${reportData.transactionCount}\n\n`;
    
    if (reportData.spendingChange !== 0) {
      const trend = reportData.spendingChange > 0 ? '↑' : '↓';
      reportText += `📈 Month-over-Month: ${trend} ${Math.abs(reportData.spendingChange).toFixed(1)}%\n\n`;
    }
    
    reportText += `📂 CATEGORY BREAKDOWN\n`;
    reportText += `───────────────────────────────\n`;
    reportData.categories.forEach(cat => {
      reportText += `${cat.name}: ₹${cat.amount.toFixed(2)} (${cat.percentage.toFixed(1)}%)\n`;
    });
    
    reportText += `\n💳 PERSONAL PAYMENTS (${reportData.personalCount})\n`;
    reportText += `───────────────────────────────\n`;
    if (reportData.monthPayments.length > 0) {
      reportData.monthPayments.forEach(p => {
        const date = new Date(p.paidAt).toLocaleDateString();
        reportText += `• ${p.title}: ₹${p.amount} (${date})\n`;
      });
    } else {
      reportText += `No personal payments this month\n`;
    }
    
    reportText += `\n👥 SPLIT EXPENSES (${reportData.splitCount})\n`;
    reportText += `───────────────────────────────\n`;
    if (reportData.monthExpenses.length > 0) {
      reportData.monthExpenses.forEach(expense => {
        const userParticipant = expense.participants?.find(p => p.userId === user?._id);
        const date = userParticipant?.paidAt ? new Date(userParticipant.paidAt).toLocaleDateString() : 'N/A';
        reportText += `• ${expense.title}: ₹${userParticipant?.amount.toFixed(2)} (${date})\n`;
      });
    } else {
      reportText += `No split expenses this month\n`;
    }
    
    reportText += `\n═══════════════════════════════\n`;
    reportText += `Generated by Smart Rent App\n`;

    try {
      await Share.share({
        message: reportText,
        title: `Smart Rent Report - ${monthName}`
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share report');
    }
  };

  const getCategoryColor = (index) => {
    const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];
    return colors[index % colors.length];
  };

  const CategoryBar = ({ category, index }) => (
    <View className="mb-4">
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center flex-1">
          <View 
            className="w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: getCategoryColor(index) }}
          />
          <Text className="text-gray-700 font-medium">{category.name}</Text>
        </View>
        <Text className="text-gray-900 font-semibold">₹{category.amount.toFixed(0)}</Text>
      </View>
      <View className="bg-gray-200 rounded-full h-3">
        <View 
          className="h-3 rounded-full"
          style={{ 
            width: `${category.percentage}%`,
            backgroundColor: getCategoryColor(index)
          }}
        />
      </View>
      <Text className="text-xs text-gray-500 mt-1">{category.percentage.toFixed(1)}% of total</Text>
    </View>
  );

  const loading = paymentsLoading || expensesLoading;
  const monthName = selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const isCurrentMonth = selectedDate.getMonth() === new Date().getMonth() && 
                         selectedDate.getFullYear() === new Date().getFullYear();

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="px-4 py-4 bg-white" style={{ paddingTop: insets.top + 12 }}>
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-[26px] pl-2 font-bold text-gray-900 text-left">
              Monthly Reports
            </Text>
            <Text className="text-sm pl-2 text-gray-500 mt-1">
              Track your spending patterns
            </Text>
          </View>
          {reportData && reportData.totalSpent > 0 && (
            <TouchableOpacity 
              onPress={handleDownloadReport}
              className="w-10 h-10 items-center justify-center bg-green-100 rounded-full"
            >
              <Download size={20} color="#16a34a" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Month Selector */}
        <View className="mx-4 mt-4 mb-4">
          <View className="bg-white rounded-2xl p-4">
            <View className="flex-row items-center justify-between">
              <TouchableOpacity 
                onPress={handlePreviousMonth}
                className="w-10 h-10 items-center justify-center bg-gray-100 rounded-full"
              >
                <ChevronLeft size={24} color="#374151" />
              </TouchableOpacity>
              
              <View className="flex-1 items-center">
                <View className="flex-row items-center">
                  <Calendar size={18} color="#6b7280" />
                  <Text className="text-sm text-gray-500 ml-2">Report for</Text>
                </View>
                <Text className="text-xl font-bold text-gray-900 mt-1">{monthName}</Text>
                {isCurrentMonth && (
                  <View className="bg-green-100 px-2 py-1 rounded-full mt-1">
                    <Text className="text-xs text-green-700 font-semibold">Current Month</Text>
                  </View>
                )}
              </View>
              
              <TouchableOpacity 
                onPress={handleNextMonth}
                className="w-10 h-10 items-center justify-center bg-gray-100 rounded-full"
                disabled={isCurrentMonth}
              >
                <ChevronRight size={24} color={isCurrentMonth ? "#d1d5db" : "#374151"} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {loading && !refreshing ? (
          <View className="flex-1 justify-center items-center py-12">
            <ActivityIndicator size="large" color="#22c55e" />
            <Text className="mt-2 text-gray-600">Loading report data...</Text>
          </View>
        ) : !reportData || reportData.totalSpent === 0 ? (
          <View className="bg-blue-50 border border-blue-200 rounded-xl p-6 mx-4 items-center">
            <BarChart3 size={48} color="#3b82f6" />
            <Text className="text-blue-800 text-lg font-semibold mt-4">No Data Available</Text>
            <Text className="text-blue-600 text-center mt-2">
              You haven't made any payments in {monthName}
            </Text>
          </View>
        ) : (
          <>
            {/* Summary Cards */}
            <View className="mx-4 mb-4">
              <View className="flex-row gap-3">
                <View className="flex-1 bg-white rounded-2xl p-4 border border-gray-100">
                  <Text className="text-gray-600 text-xs mb-1">Total Spent</Text>
                  <Text className="text-2xl font-bold text-gray-900">₹{reportData.totalSpent.toFixed(0)}</Text>
                  {reportData.spendingChange !== 0 && (
                    <View className="flex-row items-center mt-1">
                      {reportData.spendingChange > 0 ? (
                        <TrendingUp size={12} color="#ef4444" />
                      ) : (
                        <TrendingDown size={12} color="#22c55e" />
                      )}
                      <Text className={`text-xs ml-1 ${reportData.spendingChange > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {Math.abs(reportData.spendingChange).toFixed(1)}%
                      </Text>
                    </View>
                  )}
                </View>

                <View className="flex-1 bg-white rounded-2xl p-4 border border-gray-100">
                  <Text className="text-gray-600 text-xs mb-1">Transactions</Text>
                  <Text className="text-2xl font-bold text-gray-900">{reportData.transactionCount}</Text>
                  <Text className="text-xs text-gray-500 mt-1">
                    {reportData.personalCount} personal, {reportData.splitCount} split
                  </Text>
                </View>
              </View>
            </View>

            {/* Category Breakdown */}
            {reportData.categories.length > 0 && (
              <View className="mx-4 mb-4">
                <View className="bg-white rounded-2xl p-6">
                  <Text className="text-lg font-bold text-gray-900 mb-4">
                    Spending by Category
                  </Text>
                  
                  {reportData.categories.map((category, index) => (
                    <CategoryBar key={index} category={category} index={index} />
                  ))}
                </View>
              </View>
            )}

            {/* Breakdown Summary */}
            <View className="mx-4 mb-4">
              <View className="bg-white rounded-2xl p-6">
                <Text className="text-lg font-bold text-gray-900 mb-4">
                  Payment Breakdown
                </Text>
                
                <View className="space-y-4">
                  <View className="flex-row justify-between items-center pb-3 border-b border-gray-100">
                    <View className="flex-row items-center">
                      <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                        <Users size={18} color="#3b82f6" />
                      </View>
                      <View>
                        <Text className="text-gray-900 font-semibold">Personal Payments</Text>
                        <Text className="text-xs text-gray-500">{reportData.personalCount} transactions</Text>
                      </View>
                    </View>
                    <Text className="font-bold text-blue-600">₹{reportData.personalTotal.toFixed(0)}</Text>
                  </View>
                  
                  <View className="flex-row justify-between items-center pb-3 border-b border-gray-100">
                    <View className="flex-row items-center">
                      <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mr-3">
                        <Users size={18} color="#8b5cf6" />
                      </View>
                      <View>
                        <Text className="text-gray-900 font-semibold">Split Expenses</Text>
                        <Text className="text-xs text-gray-500">{reportData.splitCount} transactions</Text>
                      </View>
                    </View>
                    <Text className="font-bold text-purple-600">₹{reportData.splitTotal.toFixed(0)}</Text>
                  </View>
                  
                  <View className="flex-row justify-between items-center pt-2">
                    <Text className="font-bold text-gray-900 text-lg">Total</Text>
                    <Text className="font-bold text-green-600 text-xl">₹{reportData.totalSpent.toFixed(0)}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Download Report Button */}
            <View className="mx-4 mb-8">
              <TouchableOpacity
                onPress={handleDownloadReport}
                className="bg-green-500 rounded-2xl py-4 flex-row items-center justify-center shadow-sm"
              >
                <Download size={20} color="white" />
                <Text className="text-white font-semibold text-lg ml-2">
                  Download Full Report
                </Text>
              </TouchableOpacity>
              <Text className="text-xs text-gray-500 text-center mt-2">
                Share detailed report via messaging apps
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default reports;
