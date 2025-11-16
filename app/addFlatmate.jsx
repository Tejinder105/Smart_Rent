import { useRouter } from "expo-router";
import { ArrowLeft, Copy, Key } from "lucide-react-native";
import { Alert, Clipboard, Text, View } from "react-native";
import { useSelector } from "react-redux";
import { Button, Card, PageHeader } from '../components/ui';

const AddFlatmate = () => {
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
      <PageHeader
        title="Add Flatmate"
        leftAction={
          <Button
            variant="ghost"
            size="sm"
            onPress={handleGoBack}
            leftIcon={<ArrowLeft size={20} color="#374151" />}
          />
        }
      />
      
      {/* Content */}
      <View className="flex-1 justify-center px-4">
        {/* Icon */}
        <View className="items-center mb-8">
          <View className="w-20 h-20 bg-success-500 rounded-full items-center justify-center mb-4">
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
        <Card variant="elevated" className="mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4 text-center">
            Your Flat's Join Code
          </Text>
          
          <View className="bg-gray-50 rounded-xl p-4 mb-4">
            <Text className="text-3xl font-bold text-center text-success-600 tracking-widest font-mono">
              {currentFlat?.joinCode || 'Loading...'}
            </Text>
          </View>

          <Button
            variant="success"
            size="lg"
            onPress={handleShareJoinCode}
            leftIcon={<Copy size={20} color="white" />}
          >
            Copy Join Code
          </Button>
        </Card>

        {/* Instructions */}
        <Card variant="outline" className="bg-primary-50 border-primary-200">
          <View className="flex-row items-start">
            <Key size={20} color="#2563eb" />
            <View className="ml-3 flex-1">
              <Text className="text-primary-800 font-medium text-sm mb-2">
                How to add a flatmate:
              </Text>
              <Text className="text-primary-700 text-xs">
                • Share the 6-digit join code with your flatmate
              </Text>
              <Text className="text-primary-700 text-xs">
                • Ask them to download the Smart Rent app
              </Text>
              <Text className="text-primary-700 text-xs">
                • They can join using the "Join Flat" option
              </Text>
              <Text className="text-primary-700 text-xs">
                • The code never expires and can be used multiple times
              </Text>
            </View>
          </View>
        </Card>
      </View>
    </View>
  );
};

export default AddFlatmate;