import { useRouter } from "expo-router";
import { Bell, Droplets, Home, Wifi, Zap } from "lucide-react-native";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const bills = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const handleNotificationPress = () => {
    router.push("/reminders");
  };
  // Sample bills data
  const billsData = [
    {
      id: 1,
      title: "Monthly Rent",
      amount: "$950.00",
      dueDate: "May 25, 2024",
      status: "Unpaid",
      isPaid: false,
      icon: Home,
      iconBgColor: "bg-green-100",
      iconColor: "#16a34a"
    },
    {
      id: 2,
      title: "Electricity Bill",
      amount: "$75.50",
      dueDate: "May 18, 2024",
      status: "Paid",
      isPaid: true,
      icon: Zap,
      iconBgColor: "bg-yellow-100",
      iconColor: "#eab308"
    },
    {
      id: 3,
      title: "Internet Service",
      amount: "$50.00",
      dueDate: "May 20, 2024",
      status: "Unpaid",
      isPaid: false,
      icon: Wifi,
      iconBgColor: "bg-blue-100",
      iconColor: "#3b82f6"
    },
    {
      id: 4,
      title: "Water Bill",
      amount: "$30.25",
      dueDate: "May 10, 2024",
      status: "Paid",
      isPaid: true,
      icon: Droplets,
      iconBgColor: "bg-blue-100",
      iconColor: "#0ea5e9"
    }
  ];

  const handlePayNow = (billId) => {
    console.log("Pay now for bill:", billId);
    // Handle payment functionality
  };

  const handleViewDetails = (billId) => {
    console.log("View details for bill:", billId);
    // Handle view details functionality
  };

  const BillCard = ({ bill }) => (
    <View className="bg-white rounded-2xl p-6 mb-4 mx-4 shadow-lg">
      {/* Header with Icon and Title */}
      <View className="flex-row items-center mb-4">
        <View className={`w-12 h-12 ${bill.iconBgColor} rounded-full items-center justify-center mr-4`}>
          <bill.icon size={24} color={bill.iconColor} />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900">
            {bill.title}
          </Text>
        </View>
      </View>

      {/* Amount */}
      <Text className="text-3xl font-bold text-gray-900 mb-4">
        {bill.amount}
      </Text>

      {/* Due Date */}
      <Text className="text-sm text-gray-500 mb-6">
        Due: {bill.dueDate}
      </Text>

      {/* Status and Action Buttons */}
      <View className="flex-row items-center justify-between">
        {/* Status Badge */}
        <View className={`px-4 py-2 rounded-full ${
          bill.isPaid ? 'bg-green-500' : 'bg-red-500'
        }`}>
          <Text className="text-white text-sm font-medium">
            {bill.status}
          </Text>
        </View>

        {/* Action Button */}
        {bill.isPaid ? (
          <TouchableOpacity
            onPress={() => handleViewDetails(bill.id)}
            className="bg-gray-100 px-6 py-3 rounded-lg"
          >
            <Text className="text-gray-700 font-medium">
              View Details
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => handlePayNow(bill.id)}
            className="bg-blue-500 px-8 py-3 rounded-lg"
          >
            <Text className="text-white font-medium">
              Pay Now
            </Text>
          </TouchableOpacity>
        )}
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
              Bills & Payments
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
        {/* Bills List */}
        <View className="py-6">
          {billsData.map((bill) => (
            <BillCard key={bill.id} bill={bill} />
          ))}
        </View>

        {/* Summary Section */}
        <View className="mx-4 mb-6">
          <View className="bg-white rounded-2xl p-6">
            <Text className="text-lg font-bold text-gray-900 mb-4">
              Payment Summary
            </Text>
            
            <View className="space-y-3">
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Total Bills</Text>
                <Text className="font-semibold text-gray-900">$1,105.75</Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Paid</Text>
                <Text className="font-semibold text-green-600">$105.75</Text>
              </View>
              
              <View className="flex-row justify-between border-t border-gray-200 pt-3">
                <Text className="font-semibold text-gray-900">Outstanding</Text>
                <Text className="font-bold text-red-600">1,000.00</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default bills;
