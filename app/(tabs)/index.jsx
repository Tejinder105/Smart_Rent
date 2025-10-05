import { useRouter } from "expo-router";
import { Bell, Droplets, PlusCircleIcon, Wallet, Zap } from "lucide-react-native";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Index() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const handleNotificationPress = () => {
    router.push("/reminders");
  };

  const handlePayDues = () => {
    router.push("/payDues");
  };

  const handleSplitExpense = () => {
    router.push("/splitExpense");
  };
  
  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="px-4 py-4 bg-white" style={{ paddingTop: insets.top + 12 }}>
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-[26px] pl-2 font-bold text-gray-900 text-left">Smart Rent</Text>
          </View>
          <TouchableOpacity 
            onPress={handleNotificationPress}
            className="w-10 h-10 items-center justify-center  rounded-full shadow-sm"
          >
            <Bell size={20} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
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

          {/* Current Month's Rent */}
          <View className="bg-white rounded-2xl p-6 mb-6">
            <View className="mb-4">
              <Text className="text-lg font-bold text-gray-900 mb-1">Current Month's Rent</Text>
              <Text className="text-gray-500 text-sm">August 2024</Text>
            </View>
            
            <Text className="text-3xl font-bold text-gray-900 mb-4">₹12000.00</Text>
            
            {/* Progress Bar */}
            <View className="bg-gray-200 rounded-full h-2 mb-4">
              <View className="bg-green-500 h-2 rounded-full" style={{ width: '50%' }}></View>
            </View>
            
            {/* Payment Status */}
            <View className="flex-row justify-between mb-6">
              <View>
                <Text className="text-green-600 font-semibold">Paid: ₹6000.00</Text>
              </View>
              <View>
                <Text className="text-red-600 font-semibold">Remaining: ₹6000.00</Text>
              </View>
            </View>
            
            {/* Due Date */}
            <View className="flex-row items-center mb-4">
              <Text className="text-gray-600 text-sm">📅 Due Date: Aug 20, 2024</Text>
            </View>
            
            {/* Make Payment Button */}
            <TouchableOpacity className="bg-green-500 rounded-xl py-4 items-center">
              <Text className="text-white font-bold text-lg">Make Payment</Text>
            </TouchableOpacity>
          </View>

          {/* Upcoming Bills */}
          <View className="bg-white rounded-2xl p-6">
            <Text className="text-lg font-bold text-gray-900 mb-4">Upcoming Bills</Text>
            
            {/* Electricity Bill */}
            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 bg-yellow-100 rounded-full items-center justify-center mr-3">
                  <Zap size={20} color="#F59E0B" />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900">Electricity</Text>
                  <Text className="text-gray-500 text-sm">📅 Due: Aug 25, 2024</Text>
                </View>
              </View>
              <View className="items-end">
                <Text className="font-bold text-gray-900">₹1285.50</Text>
                <Text className="text-red-500 text-sm">Unpaid</Text>
              </View>
            </View>
            
            {/* Water Bill */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                  <Droplets size={20} color="#3B82F6" />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900">Water</Text>
                  <Text className="text-gray-500 text-sm">📅 Due: Sep 01, 2024</Text>
                </View>
              </View>
              <View className="items-end">
                <Text className="font-bold text-gray-900">₹450.00</Text>
                <Text className="text-red-500 text-sm">Unpaid</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}