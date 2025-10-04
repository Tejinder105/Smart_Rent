import { useRouter } from "expo-router";
import { Bell, ChevronLeft, ChevronRight } from "lucide-react-native";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const reports = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleNotificationPress = () => {
    router.push("/reminders");
  };

  // Sample data for expenses per flatmate
  const flatmateExpenses = [
    { name: "Alice", amount: 850, percentage: 100 },
    { name: "Bob", amount: 720, percentage: 85 },
    { name: "Charlie", amount: 650, percentage: 76 },
    { name: "David", amount: 400, percentage: 47 },
  ];

  // Sample data for spending categories (for donut chart representation)
  const spendingCategories = [
    { name: "Rent", color: "#22c55e", percentage: 45 },
    { name: "Utilities", color: "#3b82f6", percentage: 20 },
    { name: "Groceries", color: "#f59e0b", percentage: 15 },
    { name: "Internet", color: "#8b5cf6", percentage: 10 },
    { name: "Other", color: "#374151", percentage: 10 },
  ];

  const handlePreviousMonth = () => {
    console.log("Previous month");
  };

  const handleNextMonth = () => {
    console.log("Next month");
  };

  // Simple donut chart representation using concentric circles
  const DonutChart = () => (
    <View className="items-center justify-center">
      <View className="relative w-48 h-48">
        {/* Outer ring segments - simplified representation */}
        <View className="absolute inset-0 rounded-full border-[24px] border-gray-200"></View>
        
        {/* Green segment (Rent - 45%) */}
        <View 
          className="absolute inset-0 rounded-full border-[24px] border-transparent"
          style={{
            borderTopColor: '#22c55e',
            borderRightColor: '#22c55e',
            transform: [{ rotate: '0deg' }]
          }}
        />
        
        {/* Blue segment (Utilities - 20%) */}
        <View 
          className="absolute inset-0 rounded-full border-[24px] border-transparent"
          style={{
            borderBottomColor: '#3b82f6',
            borderLeftColor: '#3b82f6',
            transform: [{ rotate: '45deg' }]
          }}
        />
        
        {/* Yellow segment (Groceries - 15%) */}
        <View 
          className="absolute inset-0 rounded-full border-[24px] border-transparent"
          style={{
            borderBottomColor: '#f59e0b',
            transform: [{ rotate: '135deg' }]
          }}
        />
        
        {/* Purple segment (Internet - 10%) */}
        <View 
          className="absolute inset-0 rounded-full border-[24px] border-transparent"
          style={{
            borderLeftColor: '#8b5cf6',
            transform: [{ rotate: '180deg' }]
          }}
        />
        
        {/* Gray segment (Other - 10%) */}
        <View 
          className="absolute inset-0 rounded-full border-[24px] border-transparent"
          style={{
            borderTopColor: '#374151',
            transform: [{ rotate: '225deg' }]
          }}
        />
        
        {/* White center circle */}
        <View className="absolute inset-6 bg-white rounded-full"></View>
      </View>
    </View>
  );

  const ExpenseBar = ({ flatmate }) => (
    <View className="mb-4">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-gray-700 font-medium">{flatmate.name}</Text>
        <Text className="text-gray-900 font-semibold">${flatmate.amount}</Text>
      </View>
      <View className="bg-gray-200 rounded-full h-3">
        <View 
          className="bg-green-500 h-3 rounded-full"
          style={{ width: `${flatmate.percentage}%` }}
        />
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="px-4 py-4 bg-white" style={{ paddingTop: insets.top + 12 }}>
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-[26px]  pl-2 font-bold text-gray-900 text-left">
              Reports
            </Text>
          </View>
          <TouchableOpacity 
            onPress={handleNotificationPress}
            className="w-10 h-10 items-center justify-center bg-white rounded-full shadow-sm border border-gray-100"
          >
            <Bell size={20} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Month Selector */}
        <View className="mx-4 mt-4 mb-4">
          <View className="bg-white rounded-2xl p-6">
            <View className="flex-row items-center justify-between">
              <TouchableOpacity 
                onPress={handlePreviousMonth}
                className="w-10 h-10 items-center justify-center"
              >
                <ChevronLeft size={24} color="#6b7280" />
              </TouchableOpacity>
              
              <View className="flex-1 items-center">
                <Text className="text-sm text-gray-500 mb-1">Monthly Report for</Text>
                <Text className="text-lg font-bold text-gray-900">November 2023</Text>
              </View>
              
              <TouchableOpacity 
                onPress={handleNextMonth}
                className="w-10 h-10 items-center justify-center"
              >
                <ChevronRight size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Spending by Category */}
        <View className="mx-4 mb-4">
          <View className="bg-white rounded-2xl p-6">
            <Text className="text-lg font-bold text-gray-900 mb-6">
              Spending by Category
            </Text>
            
            <DonutChart />
            
            {/* Legend */}
            <View className="mt-8 space-y-3">
              {spendingCategories.map((category, index) => (
                <View key={index} className="flex-row items-center">
                  <View 
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: category.color }}
                  />
                  <Text className="flex-1 text-gray-700">{category.name}</Text>
                  <Text className="text-gray-900 font-medium">{category.percentage}%</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Expenses Per Flatmate */}
        <View className="mx-4 mb-4">
          <View className="bg-white rounded-2xl p-6">
            <Text className="text-lg font-bold text-gray-900 mb-6">
              Expenses Per Flatmate
            </Text>
            
            {flatmateExpenses.map((flatmate, index) => (
              <ExpenseBar key={index} flatmate={flatmate} />
            ))}
          </View>
        </View>

        {/* Summary Stats */}
        <View className="mx-4 mb-4">
          <View className="bg-white rounded-2xl p-6">
            <Text className="text-lg font-bold text-gray-900 mb-4">
              Monthly Summary
            </Text>
            
            <View className="space-y-4">
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Total Expenses</Text>
                <Text className="font-bold text-gray-900">$2,620.00</Text>
              </View>
              
              <View className="flex-row mb-2 justify-between">
                <Text className="text-gray-600">Average per Person</Text>
                <Text className="font-semibold text-gray-900">$655.00</Text>
              </View>
              
              <View className="flex-row justify-between border-t border-gray-200 pt-2">
                <Text className="font-semibold text-gray-900">Highest Spender</Text>
                <Text className="font-bold text-green-600">Alice ($850)</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default reports;
