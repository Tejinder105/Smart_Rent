import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { Bell, PlusCircleIcon, Wallet, TrendingUp, TrendingDown, AlertCircle } from "lucide-react-native";
import React, { useEffect } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View, Alert, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { fetchExpenseStats, fetchUserExpenses } from "../../store/slices/expenseSlice";
import { fetchUserFlat } from "../../store/slices/flatSlice";
import { fetchCurrentBudgetStatus, updateFlatBudget } from "../../store/slices/budgetSlice";

export default function Index() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const dispatch = useDispatch();

  const { currentFlat, loading: flatLoading } = useSelector((state) => state.flat);
  const { stats, expenses, loading: expenseLoading } = useSelector((state) => state.expense);
  const { userData } = useSelector((state) => state.auth);
  const { currentStatus: budgetStatus, loading: budgetLoading } = useSelector((state) => state.budget);
  const user = userData;

  const [refreshing, setRefreshing] = React.useState(false);
  const [editingBudget, setEditingBudget] = React.useState(false);
  const [budgetInput, setBudgetInput] = React.useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (currentFlat?._id) {
      dispatch(fetchCurrentBudgetStatus(currentFlat._id));
    }
  }, [currentFlat]);

  const loadData = async () => {
    await Promise.all([
      dispatch(fetchUserFlat()),
      dispatch(fetchExpenseStats()),
      dispatch(fetchUserExpenses({ status: 'active' }))
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    if (currentFlat?._id) {
      await dispatch(fetchCurrentBudgetStatus(currentFlat._id));
    }
    setRefreshing(false);
  };
  
  const handleNotificationPress = () => {
    router.push("/reminders");
  };

  const handlePayDues = () => {
    router.push("/payDues");
  };

  const handleSplitExpense = () => {
    router.push("/splitExpense");
  };

  const handleEditBudget = () => {
    setBudgetInput(currentFlat?.monthlyBudget?.toString() || '0');
    setEditingBudget(true);
  };

  const handleSaveBudget = async () => {
    const budget = parseFloat(budgetInput);
    if (isNaN(budget) || budget < 0) {
      Alert.alert('Error', 'Please enter a valid budget amount');
      return;
    }

    try {
      await dispatch(updateFlatBudget({ 
        flatId: currentFlat._id, 
        monthlyBudget: budget 
      })).unwrap();
      
      await dispatch(fetchCurrentBudgetStatus(currentFlat._id));
      await dispatch(fetchUserFlat());
      
      setEditingBudget(false);
      Alert.alert('Success', 'Budget updated successfully');
    } catch (error) {
      Alert.alert('Error', error || 'Failed to update budget');
    }
  };

  const handleCancelBudget = () => {
    setEditingBudget(false);
    setBudgetInput('');
  };

  const totalRent = currentFlat?.rent || 0;
  const totalMembers = currentFlat?.stats?.totalMembers || 1;
  const rentPerPerson = totalMembers > 0 ? totalRent / totalMembers : 0;


  const pendingExpenses = expenses.filter((expense, index, self) => {
    if (!expense.participants || !user) return false;
    
    const isFirstOccurrence = self.findIndex(e => e._id === expense._id) === index;
    if (!isFirstOccurrence) return false;
    
    const userParticipant = expense.participants.find(
      p => p && p.userId && (p.userId._id === user._id || p.userId === user._id)
    );
    return userParticipant && !userParticipant.isPaid && expense.status === 'active';
  });


  const pendingAmount = stats.participant?.pendingAmount || 0;
  const paidAmount = stats.participant?.paidAmount || 0;
  const totalOwed = stats.participant?.totalOwed || 0;

  const paymentProgress = totalOwed > 0 ? (paidAmount / totalOwed) * 100 : 0;

  const loading = flatLoading || expenseLoading;
  
  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="px-4 py-4 bg-white" style={{ paddingTop: insets.top + 12 }}>
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-[26px] pl-2 font-bold text-gray-900 text-left">Smart Rent</Text>
            {user && (
              <Text className="text-sm pl-2 text-gray-500">Welcome, {user.userName}</Text>
            )}
          </View>
          <TouchableOpacity 
            onPress={handleNotificationPress}
            className="w-10 h-10 items-center justify-center rounded-full shadow-sm"
          >
            <Bell size={20} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="p-4">
          {/* Action Cards */}
          <View className="flex-row space-x-4 mb-4 gap-2">
            <TouchableOpacity 
              onPress={handlePayDues}
              className="flex-1 bg-white rounded-2xl p-6 items-center border border-blue-200"
            >
              <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mb-3">
                <Wallet size={24} color="#3B82F6" />
              </View>
              <Text className="text-blue-600 font-semibold">Pay Dues</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={handleSplitExpense}
              className="flex-1 bg-white rounded-2xl p-6 items-center border border-blue-200"
            >
              <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mb-3">
                <PlusCircleIcon size={24} color="#3B82F6" />
              </View>
              <Text className="text-blue-600 font-semibold">Split Expense</Text>
            </TouchableOpacity>
          </View>

          {loading && !refreshing ? (
            <View className="bg-white rounded-2xl p-6 mb-6 items-center">
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text className="mt-2 text-gray-600">Loading data...</Text>
            </View>
          ) : (
            <>
              {/* Current Month's Rent */}
              {currentFlat ? (
                <TouchableOpacity 
                  onPress={() => router.push('/flatDetails')}
                  className="bg-white rounded-2xl p-6 mb-6"
                  activeOpacity={0.7}
                >
                  <View className="mb-4">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-lg font-bold text-gray-900 mb-1">{currentFlat.name}</Text>
                        <Text className="text-gray-500 text-sm">
                          {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <Text className="text-blue-600 text-sm font-semibold mr-1">View Details</Text>
                        <Ionicons name="chevron-forward" size={16} color="#3B82F6" />
                      </View>
                    </View>
                  </View>
                  
                  <View className="mb-4">
                    <Text className="text-sm text-gray-600 mb-1">Total Monthly Rent</Text>
                    <Text className="text-3xl font-bold text-gray-900">₹{totalRent.toFixed(2)}</Text>
                  </View>

                  <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                    <Text className="text-sm text-blue-800 mb-1">Your Share</Text>
                    <Text className="text-2xl font-bold text-blue-600">
                      ₹{rentPerPerson.toFixed(2)}
                    </Text>
                    <Text className="text-xs text-blue-600 mt-1">
                      Split among {totalMembers} member{totalMembers !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  
                  {/* Payment Status Section */}
                  <View className="mb-4">
                    {/* Monthly Rent Bar */}
                    <View className="mb-4">
                      <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-sm font-semibold text-gray-700">Monthly Rent</Text>
                        <Text className="text-sm text-gray-600">₹{rentPerPerson.toFixed(2)}</Text>
                      </View>
                      <View className="bg-gray-200 rounded-full h-3 overflow-hidden">
                        <View 
                          className="bg-purple-500 h-3 rounded-full" 
                          style={{ width: '0%' }}
                        />
                      </View>
                      <View className="flex-row justify-between mt-1">
                        <Text className="text-xs text-gray-500">Pending</Text>
                        <Text className="text-xs text-purple-600 font-semibold">Due this month</Text>
                      </View>
                    </View>

                    {/* Other Expenses Bar */}
                    {totalOwed > 0 && (
                      <View>
                        <View className="flex-row justify-between items-center mb-2">
                          <Text className="text-sm font-semibold text-gray-700">Other Expenses</Text>
                          <Text className="text-sm text-gray-600">₹{totalOwed.toFixed(2)}</Text>
                        </View>
                        <View className="bg-gray-200 rounded-full h-3 overflow-hidden">
                          <View 
                            className="bg-green-500 h-3 rounded-full" 
                            style={{ width: `${Math.min(paymentProgress, 100)}%` }}
                          />
                        </View>
                        <View className="flex-row justify-between mt-1">
                          <Text className="text-xs text-green-600 font-semibold">
                            Paid: ₹{paidAmount.toFixed(2)}
                          </Text>
                          <Text className="text-xs text-red-600 font-semibold">
                            Pending: ₹{pendingAmount.toFixed(2)}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                  
                  {/* Make Payment Button */}
                  <TouchableOpacity 
                    onPress={(e) => {
                      e.stopPropagation?.();
                      handlePayDues();
                    }}
                    className="bg-green-500 rounded-xl py-4 items-center"
                  >
                    <Text className="text-white font-bold text-lg">View Payment Details</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ) : (
                <View className="bg-white rounded-2xl p-6 mb-6">
                  <Text className="text-center text-gray-600 mb-4">
                    You're not part of any flat yet
                  </Text>
                  <View className="flex-row space-x-2 gap-2">
                    <TouchableOpacity 
                      onPress={() => router.push('/createFlat')}
                      className="flex-1 bg-blue-500 rounded-xl py-3 items-center"
                    >
                      <Text className="text-white font-semibold">Create Flat</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => router.push('/joinFlat')}
                      className="flex-1 bg-green-500 rounded-xl py-3 items-center"
                    >
                      <Text className="text-white font-semibold">Join Flat</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Budget Tracking Card */}
              {currentFlat && currentFlat.monthlyBudget > 0 && budgetStatus && (
                <View className="bg-white rounded-2xl p-6 mb-6">
                  <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-lg font-bold text-gray-900">Monthly Budget</Text>
                    {currentFlat.admin._id === user._id && (
                      <TouchableOpacity onPress={handleEditBudget}>
                        <Text className="text-blue-600 font-semibold text-sm">Edit</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Budget Overview */}
                  <View className="mb-4">
                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="text-sm text-gray-600">Budget Set</Text>
                      <Text className="text-lg font-bold text-gray-900">
                        ₹{budgetStatus.monthlyBudget?.toFixed(0)}
                      </Text>
                    </View>

                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="text-sm text-gray-600">Spent</Text>
                      <Text className="text-lg font-bold text-orange-600">
                        ₹{budgetStatus.actualSpent?.toFixed(0)}
                      </Text>
                    </View>

                    <View className="flex-row justify-between items-center">
                      <Text className="text-sm text-gray-600">Remaining</Text>
                      <Text className={`text-lg font-bold ${
                        budgetStatus.remaining >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ₹{Math.abs(budgetStatus.remaining || 0).toFixed(0)}
                      </Text>
                    </View>
                  </View>

                  {/* Progress Bar */}
                  <View className="mb-4">
                    <View className="bg-gray-200 rounded-full h-4 overflow-hidden">
                      <View 
                        className={`h-4 rounded-full ${
                          budgetStatus.percentUsed > 100 ? 'bg-red-500' : 
                          budgetStatus.percentUsed > 80 ? 'bg-orange-500' : 
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(budgetStatus.percentUsed || 0, 100)}%` }}
                      />
                    </View>
                    <View className="flex-row justify-between mt-2">
                      <View className="flex-row items-center">
                        {budgetStatus.percentUsed > 100 ? (
                          <>
                            <AlertCircle size={14} color="#ef4444" />
                            <Text className="text-xs text-red-600 font-semibold ml-1">
                              Over Budget!
                            </Text>
                          </>
                        ) : budgetStatus.percentUsed > 80 ? (
                          <>
                            <TrendingUp size={14} color="#f97316" />
                            <Text className="text-xs text-orange-600 font-semibold ml-1">
                              {budgetStatus.percentUsed?.toFixed(0)}% Used
                            </Text>
                          </>
                        ) : (
                          <>
                            <TrendingDown size={14} color="#22c55e" />
                            <Text className="text-xs text-green-600 font-semibold ml-1">
                              {budgetStatus.percentUsed?.toFixed(0)}% Used
                            </Text>
                          </>
                        )}
                      </View>
                      <Text className="text-xs text-gray-500">
                        {new Date().toLocaleDateString('en-US', { month: 'short' })}
                      </Text>
                    </View>
                  </View>

                  {/* Category Breakdown */}
                  {budgetStatus.categoryBreakdown && Object.keys(budgetStatus.categoryBreakdown).some(k => budgetStatus.categoryBreakdown[k] > 0) && (
                    <View className="bg-gray-50 rounded-xl p-4">
                      <Text className="text-sm font-semibold text-gray-700 mb-3">Top Categories</Text>
                      {Object.entries(budgetStatus.categoryBreakdown)
                        .filter(([_, amount]) => amount > 0)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 3)
                        .map(([category, amount], idx) => (
                          <View key={idx} className="flex-row justify-between items-center mb-2">
                            <Text className="text-sm text-gray-600 capitalize">{category}</Text>
                            <Text className="text-sm font-semibold text-gray-900">
                              ₹{amount.toFixed(0)}
                            </Text>
                          </View>
                        ))}
                    </View>
                  )}
                </View>
              )}

              {/* Set Budget Card - Only if no budget set */}
              {currentFlat && (!currentFlat.monthlyBudget || currentFlat.monthlyBudget === 0) && currentFlat.admin._id === user._id && (
                <View className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-2xl p-6 mb-6">
                  <View className="items-center mb-4">
                    <View className="w-16 h-16 bg-purple-100 rounded-full items-center justify-center mb-3">
                      <Wallet size={32} color="#8b5cf6" />
                    </View>
                    <Text className="text-lg font-bold text-gray-900 text-center">
                      Set Monthly Budget
                    </Text>
                    <Text className="text-sm text-gray-600 text-center mt-2">
                      Track your flat's spending and stay within budget
                    </Text>
                  </View>

                  <TouchableOpacity 
                    onPress={handleEditBudget}
                    className="bg-purple-500 rounded-xl py-4 items-center"
                  >
                    <Text className="text-white font-bold text-lg">Set Budget Now</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Pending Expenses */}
              {pendingExpenses.length > 0 && (
                <View className="bg-white rounded-2xl p-6 mb-6">
                  <Text className="text-lg font-bold text-gray-900 mb-4">
                    Pending Payments ({pendingExpenses.length})
                  </Text>
                  
                  {pendingExpenses.slice(0, 3).map((expense, index) => {
                    const userParticipant = expense.participants?.find(
                      p => p && p.userId && (p.userId._id === user?._id || p.userId === user?._id)
                    );
                    
                    return (
                      <TouchableOpacity 
                        key={`${expense._id}-${index}`}
                        onPress={() => router.push(`/expenseDetails?id=${expense._id}`)}
                        className="flex-row items-center justify-between mb-4 pb-4 border-b border-gray-100 last:border-b-0 last:mb-0 last:pb-0"
                      >
                        <View className="flex-row items-center flex-1">
                          <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center mr-3">
                            <Text className="text-orange-600 font-bold">
                              {expense.category?.charAt(0).toUpperCase() || 'E'}
                            </Text>
                          </View>
                          <View className="flex-1">
                            <Text className="font-semibold text-gray-900">{expense.title}</Text>
                            <Text className="text-gray-500 text-sm">
                              {new Date(expense.createdAt).toLocaleDateString()}
                            </Text>
                          </View>
                        </View>
                        <View className="items-end">
                          <Text className="font-bold text-gray-900">
                            ₹{userParticipant?.amount.toFixed(2) || '0.00'}
                          </Text>
                          <Text className="text-red-500 text-sm">Unpaid</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}

                  {pendingExpenses.length > 3 && (
                    <TouchableOpacity 
                      onPress={handlePayDues}
                      className="mt-2"
                    >
                      <Text className="text-blue-600 font-semibold text-center">
                        View All ({pendingExpenses.length})
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Expense Stats */}
              <View className="bg-white rounded-2xl p-6">
                <Text className="text-lg font-bold text-gray-900 mb-4">Your Statistics</Text>
                
                <View className="flex-row justify-between mb-4">
                  <View className="flex-1 items-center p-4 bg-blue-50 rounded-xl mr-2">
                    <Text className="text-2xl font-bold text-blue-600">
                      {stats.created?.totalExpenses || 0}
                    </Text>
                    <Text className="text-xs text-blue-800 text-center mt-1">
                      Expenses Created
                    </Text>
                  </View>
                  <View className="flex-1 items-center p-4 bg-green-50 rounded-xl ml-2">
                    <Text className="text-2xl font-bold text-green-600">
                      {stats.participant?.totalParticipations || 0}
                    </Text>
                    <Text className="text-xs text-green-800 text-center mt-1">
                      Participations
                    </Text>
                  </View>
                </View>

                <View className="p-4 bg-gray-50 rounded-xl">
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-600">Total Owed:</Text>
                    <Text className="font-bold text-gray-900">
                      ₹{totalOwed.toFixed(2)}
                    </Text>
                  </View>
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-600">Paid:</Text>
                    <Text className="font-bold text-green-600">
                      ₹{paidAmount.toFixed(2)}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-gray-600">Remaining:</Text>
                    <Text className="font-bold text-red-600">
                      ₹{pendingAmount.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}