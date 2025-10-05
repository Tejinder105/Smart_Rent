import { useRouter } from "expo-router";
import { Bell, FileText, Home, Zap } from "lucide-react-native";
import { useEffect } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { fetchPaymentStats, fetchUserPayments } from "../../store/slices/paymentSlice";

const bills = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const dispatch = useDispatch();
  
  const { payments, stats, loading, error } = useSelector((state) => state.payment);
  
  useEffect(() => {
    dispatch(fetchUserPayments());
    dispatch(fetchPaymentStats());
  }, [dispatch]);
  
  const handleNotificationPress = () => {
    router.push("/reminders");
  };

  // Icon mapping for different payment types
  const getIconForType = (type) => {
    switch (type) {
      case 'rent': return Home;
      case 'utility': return Zap;
      case 'flatmate': return Home;
      case 'other': return FileText;
      default: return FileText;
    }
  };

  // Icon background and color mapping
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

  const handlePayNow = (billId) => {
    console.log("Pay now for bill:", billId);
    // Handle payment functionality
  };

  const handleViewDetails = (billId) => {
    console.log("View details for bill:", billId);
    // Handle view details functionality
  };

  const BillCard = ({ bill }) => {
    const IconComponent = getIconForType(bill.type);
    const iconProps = getIconProps(bill.type);
    const isPaid = bill.status === 'paid';
    
    return (
      <View className="bg-white rounded-2xl p-6 mb-4 mx-4 shadow-lg">
        {/* Header with Icon and Title */}
        <View className="flex-row items-center mb-4">
          <View className={`w-12 h-12 ${iconProps.iconBgColor} rounded-full items-center justify-center mr-4`}>
            <IconComponent size={24} color={iconProps.iconColor} />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900">
              {bill.title}
            </Text>
          </View>
        </View>
  
        {/* Amount */}
        <Text className="text-3xl font-bold text-gray-900 mb-4">
          ₹{bill.amount}
        </Text>
  
        {/* Due Date */}
        <Text className="text-sm text-gray-500 mb-6">
          Due: {new Date(bill.dueDate).toLocaleDateString()}
        </Text>
  
        {/* Status and Action Buttons */}
        <View className="flex-row items-center justify-between">
          {/* Status Badge */}
          <View className={`px-4 py-2 rounded-full ${
            isPaid ? 'bg-green-500' : 'bg-red-500'
          }`}>
            <Text className="text-white text-sm font-medium">
              {isPaid ? 'Paid' : 'Unpaid'}
            </Text>
          </View>
  
          {/* Action Button */}
          {isPaid ? (
            <TouchableOpacity
              onPress={() => handleViewDetails(bill._id)}
              className="bg-gray-100 px-6 py-3 rounded-lg"
            >
              <Text className="text-gray-700 font-medium">
                View Details
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => handlePayNow(bill._id)}
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
  };

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
          {loading && (
            <View className="flex-1 justify-center items-center py-8">
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text className="mt-2 text-gray-600">Loading bills...</Text>
            </View>
          )}
          
          {error && (
            <View className="bg-red-50 border border-red-200 rounded-xl p-4 mx-4 mb-4">
              <Text className="text-red-800 text-center">{error}</Text>
            </View>
          )}
          
          {!loading && !error && payments.length === 0 && (
            <View className="bg-blue-50 border border-blue-200 rounded-xl p-6 mx-4 items-center">
              <Text className="text-blue-800 text-lg font-semibold">No Bills Found</Text>
              <Text className="text-blue-600 text-center mt-2">You don't have any bills or payments yet.</Text>
            </View>
          )}
          
          {!loading && payments.map((bill) => (
            <BillCard key={bill._id} bill={bill} />
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
                <Text className="font-semibold text-gray-900">₹{stats.totalAmount || 0}</Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Paid</Text>
                <Text className="font-semibold text-green-600">₹{stats.paidAmount || 0}</Text>
              </View>
              
              <View className="flex-row justify-between border-t border-gray-200 pt-3">
                <Text className="font-semibold text-gray-900">Outstanding</Text>
                <Text className="font-bold text-red-600">₹{stats.pendingAmount || 0}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default bills;
