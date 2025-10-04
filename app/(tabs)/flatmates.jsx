import { useRouter } from "expo-router";
import { Bell, DollarSign, Share, UserPlus } from "lucide-react-native";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const flatmates = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const handleNotificationPress = () => {
    router.push("/reminders");
  };
  // Sample flatmate data
  const flatmatesData = [
    {
      id: 1,
      name: "Emily Davis",
      role: "Lead Tenant",
      contribution: "$520/month",
      status: "Active",
      avatar: require("../../assets/images/react-logo.png"), // Placeholder image
      isActive: true,
    },
    {
      id: 2,
      name: "Michael Brown",
      role: "Co-Tenant",
      contribution: "$480/month",
      status: "Active",
      avatar: require("../../assets/images/react-logo.png"), // Placeholder image
      isActive: true,
    },
    {
      id: 3,
      name: "Sophia Lee",
      role: "Temporary Occupant",
      contribution: "$0/month",
      status: "Inactive",
      avatar: require("../../assets/images/react-logo.png"), // Placeholder image
      isActive: false,
    },
  ];

  const handleAddFlatmate = () => {
    // Handle add new flatmate functionality
    console.log("Add new flatmate");
  };

  const handleShareExpense = (flatmateId) => {
    // Handle share expense functionality
    console.log("Share expense with flatmate:", flatmateId);
  };

  const handleAssignPayment = (flatmateId) => {
    // Handle assign payment functionality
    console.log("Assign payment to flatmate:", flatmateId);
  };

  const FlatmateCard = ({ flatmate }) => (
    <View className="bg-white rounded-2xl p-4 mb-4 mx-4">
      {/* Profile Section */}
      <View className="flex-row items-center mb-4">
        <View className="relative">
          <View className="w-12 h-12 bg-gray-300 rounded-full items-center justify-center mr-3">
            <Text className="text-gray-600 font-semibold text-lg">
              {flatmate.name.charAt(0)}
            </Text>
          </View>
          {/* Online status indicator */}
          {flatmate.isActive && (
            <View className="absolute bottom-1  right-1  w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
          )}
        </View>
        
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900">
            {flatmate.name}
          </Text>
          <Text className="text-sm text-gray-500">
            {flatmate.role}
          </Text>
        </View>

        {/* Status Badge */}
        <View className={`px-3 py-1 rounded-full ${
          flatmate.isActive ? 'bg-green-100' : 'bg-red-100'
        }`}>
          <Text className={`text-xs font-medium ${
            flatmate.isActive ? 'text-green-700' : 'text-red-700'
          }`}>
            {flatmate.status}
          </Text>
        </View>
      </View>

      {/* Expense Contribution */}
      <View className="mb-4 flex-row items-center justify-between px-2">
        <Text className="text-sm text-gray-500 mb-1">Expense Contribution</Text>
        <Text className="text-xl font-bold text-gray-900">
          {flatmate.contribution}
        </Text>
      </View>

      {/* Action Buttons */}
      <View className="flex-row space-x-3 gap-2">
        <TouchableOpacity
          onPress={() => handleShareExpense(flatmate.id)}
          className="flex-1 flex-row items-center justify-center bg-green-50 border border-green-200 rounded-lg py-3"
        >
          <Share size={16} color="#16a34a" />
          <Text className="text-green-600 font-medium ml-2">Share Expense</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleAssignPayment(flatmate.id)}
          className="flex-1 flex-row items-center justify-center bg-blue-50 border border-blue-200 rounded-lg py-3"
        >
          <DollarSign size={16} color="#2563eb" />
          <Text className="text-blue-600 font-medium ml-2">Assign Payment</Text>
        </TouchableOpacity>
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
              Flatmates
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
        {/* Add New Flatmate Button */}
        <View className="p-4">
          <TouchableOpacity
            onPress={handleAddFlatmate}
            className="bg-green-500 rounded-2xl py-4 flex-row items-center justify-center "
          >
            <UserPlus size={20} color="white" />
            <Text className="text-white font-semibold text-lg ml-2">
              Add New Flatmate
            </Text>
          </TouchableOpacity>
        </View>

        {/* Flatmates List */}
        <View className="pb-6">
          {flatmatesData.map((flatmate) => (
            <FlatmateCard key={flatmate.id} flatmate={flatmate} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default flatmates;
