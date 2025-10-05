import { useRouter } from "expo-router";
import { ArrowLeft, Copy, Key } from "lucide-react-native";
import { Alert, Clipboard, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

const AddFlatmate = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { currentFlat } = useSelector((state) => state.flat);

  const handleShareJoinCode = () => {
    if (currentFlat?.joinCode) {
      Clipboard.setString(currentFlat.joinCode);
      Alert.alert(
        "Join Code Copied! 📋",
        `Share this 6-digit code with your flatmate: ${currentFlat.joinCode}`,
        [
          {
            text: "Share via SMS",
            onPress: () => {
              // You can implement SMS sharing here if needed
              Alert.alert("Share Code", `Tell your flatmate to use join code: ${currentFlat.joinCode}`);
            }
          },
          {
            text: "OK",
            style: "default"
          }
        ]
      );
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="bg-white" style={{ paddingTop: insets.top + 12, paddingBottom: 12 }}>
        <View className="flex-row items-center px-4">
          <TouchableOpacity
            onPress={handleGoBack}
            className="w-10 h-10 items-center justify-center bg-gray-100 rounded-full mr-3"
          >
            <ArrowLeft size={20} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">Add Flatmate</Text>
        </View>
      </View>
      
      {/* Content */}
      <View className="flex-1 justify-center px-4">
        {/* Icon */}
        <View className="items-center mb-8">
          <View className="w-20 h-20 bg-green-500 rounded-full items-center justify-center mb-4">
            <Key size={40} color="white" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 text-center">
            Share Join Code
          </Text>
          <Text className="text-gray-600 text-center mt-2">
            Share the 6-digit join code with your flatmate to add them to "{currentFlat?.name}" flat.
          </Text>
        </View>

        {/* Join Code Display */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <Text className="text-lg font-bold text-gray-900 mb-4 text-center">
            Your Flat's Join Code
          </Text>
          
          <View className="bg-gray-50 rounded-xl p-4 mb-4">
            <Text className="text-3xl font-bold text-center text-green-600 tracking-widest font-mono">
              {currentFlat?.joinCode || 'Loading...'}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleShareJoinCode}
            className="bg-green-500 py-4 rounded-xl flex-row items-center justify-center"
          >
            <Copy size={20} color="white" />
            <Text className="text-white font-semibold text-lg ml-2">
              Copy Join Code
            </Text>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <View className="flex-row items-start">
            <Key size={20} color="#2563eb" />
            <View className="ml-3 flex-1">
              <Text className="text-blue-800 font-medium text-sm mb-2">
                How to add a flatmate:
              </Text>
              <Text className="text-blue-700 text-xs">
                • Share the 6-digit join code with your flatmate
              </Text>
              <Text className="text-blue-700 text-xs">
                • Ask them to download the Smart Rent app
              </Text>
              <Text className="text-blue-700 text-xs">
                • They can join using the "Join Flat" option
              </Text>
              <Text className="text-blue-700 text-xs">
                • The code never expires and can be used multiple times
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default AddFlatmate;