import { useRouter } from 'expo-router';
import { Bell, Camera, FileText, Plus, Receipt } from 'lucide-react-native';
import React, { useEffect } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserExpenses } from '../../store/slices/expenseSlice';

const Bills = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = React.useState(false);

  const { expenses, loading } = useSelector((state) => state.expense);
  const { userData } = useSelector((state) => state.auth);
  const { currentFlat, loading: flatLoading } = useSelector((state) => state.flat);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await dispatch(fetchUserExpenses({ status: 'active' }));
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

  // Group expenses by status
  const activeExpenses = expenses.filter(e => e.status === 'active');
  const paidExpenses = expenses.filter(e => e.status === 'paid');

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="px-4 py-4 bg-white" style={{ paddingTop: insets.top + 12 }}>
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-[26px] pl-2 font-bold text-gray-900 text-left">
              Bills & Expenses
            </Text>
          </View>
          <TouchableOpacity 
            onPress={handleNotificationPress}
            className="w-10 h-10 items-center justify-center bg-gray-50 rounded-full shadow-sm border border-gray-100"
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
          {/* Quick Actions */}
          <View className="flex-row space-x-4 mb-6 gap-2">
            <TouchableOpacity 
              onPress={handleScanBill}
              className="flex-1 bg-white rounded-2xl p-4 items-center border border-blue-200"
            >
              <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mb-2">
                <Camera size={24} color="#3B82F6" />
              </View>
              <Text className="text-blue-600 font-semibold text-sm">Scan Bill</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={handleCreateBill}
              className="flex-1 bg-white rounded-2xl p-4 items-center border border-green-200"
            >
              <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center mb-2">
                <Plus size={24} color="#16A34A" />
              </View>
              <Text className="text-green-600 font-semibold text-sm">Add Bill</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handleSplitExpense}
              className="flex-1 bg-white rounded-2xl p-4 items-center border border-purple-200"
            >
              <View className="w-12 h-12 bg-purple-100 rounded-full items-center justify-center mb-2">
                <FileText size={24} color="#9333EA" />
              </View>
              <Text className="text-purple-600 font-semibold text-sm">Split</Text>
            </TouchableOpacity>
          </View>

          {loading && !refreshing ? (
            <View className="bg-white rounded-2xl p-6 items-center">
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text className="mt-2 text-gray-600">Loading bills...</Text>
            </View>
          ) : !currentFlat ? (
            <View className="bg-white rounded-2xl p-6 items-center">
              <View className="w-16 h-16 bg-gray-200 rounded-full items-center justify-center mb-4">
                <Receipt size={32} color="#9CA3AF" />
              </View>
              <Text className="text-gray-900 font-bold text-lg mb-2">No Flat Yet</Text>
              <Text className="text-gray-600 text-center mb-4">
                Create or join a flat to start managing bills and expenses
              </Text>
              <View className="flex-row space-x-2 gap-2 w-full">
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
          ) : (
            <>
              {/* Active Bills */}
              {activeExpenses.length > 0 && (
                <View className="bg-white rounded-2xl p-6 mb-6">
                  <Text className="text-lg font-bold text-gray-900 mb-4">
                    Active Bills ({activeExpenses.length})
                  </Text>
                  
                  {activeExpenses.map((expense, index) => {
                    const userParticipant = expense.participants?.find(
                      p => p && p.userId && (p.userId._id === userData?._id || p.userId === userData?._id)
                    );
                    const isPaid = userParticipant?.isPaid || false;
                    const amount = userParticipant?.amount || 0;
                    
                    return (
                      <TouchableOpacity 
                        key={`${expense._id}-${index}`}
                        onPress={() => router.push(`/expenseDetails?id=${expense._id}`)}
                        className="flex-row items-center justify-between mb-4 pb-4 border-b border-gray-100 last:border-b-0 last:mb-0 last:pb-0"
                      >
                        <View className="flex-row items-center flex-1">
                          <View className={`w-10 h-10 ${isPaid ? 'bg-green-100' : 'bg-orange-100'} rounded-full items-center justify-center mr-3`}>
                            <Text className={`${isPaid ? 'text-green-600' : 'text-orange-600'} font-bold`}>
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
                            ₹{amount.toFixed(2)}
                          </Text>
                          <Text className={`text-sm ${isPaid ? 'text-green-500' : 'text-red-500'}`}>
                            {isPaid ? 'Paid' : 'Unpaid'}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Recently Paid Bills */}
              {paidExpenses.length > 0 && (
                <View className="bg-white rounded-2xl p-6 mb-6">
                  <Text className="text-lg font-bold text-gray-900 mb-4">
                    Recently Paid ({paidExpenses.slice(0, 5).length})
                  </Text>
                  
                  {paidExpenses.slice(0, 5).map((expense, index) => {
                    const userParticipant = expense.participants?.find(
                      p => p && p.userId && (p.userId._id === userData?._id || p.userId === userData?._id)
                    );
                    const amount = userParticipant?.amount || 0;
                    
                    return (
                      <TouchableOpacity 
                        key={`${expense._id}-${index}`}
                        onPress={() => router.push(`/expenseDetails?id=${expense._id}`)}
                        className="flex-row items-center justify-between mb-4 pb-4 border-b border-gray-100 last:border-b-0 last:mb-0 last:pb-0"
                      >
                        <View className="flex-row items-center flex-1">
                          <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                            <Text className="text-gray-600 font-bold">
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
                            ₹{amount.toFixed(2)}
                          </Text>
                          <Text className="text-sm text-gray-500">
                            Paid
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Empty State */}
              {activeExpenses.length === 0 && paidExpenses.length === 0 && (
                <View className="bg-white rounded-2xl p-6 items-center">
                  <View className="w-16 h-16 bg-gray-200 rounded-full items-center justify-center mb-4">
                    <Receipt size={32} color="#9CA3AF" />
                  </View>
                  <Text className="text-gray-900 font-bold text-lg mb-2">No Bills Yet</Text>
                  <Text className="text-gray-600 text-center mb-4">
                    Start by scanning a bill or creating a new expense to split with your flatmates
                  </Text>
                  <TouchableOpacity 
                    onPress={handleScanBill}
                    className="bg-blue-500 rounded-xl py-3 px-6"
                  >
                    <Text className="text-white font-semibold">Scan Your First Bill</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default Bills;
