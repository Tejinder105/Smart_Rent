import { useRouter } from 'expo-router';
import { Home, UserPlus } from 'lucide-react-native';
import { useEffect } from 'react';
import {
    ActivityIndicator,
    Image,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserFlat } from '../store/slices/flatSlice';

const Welcome = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

  const { currentFlat, loading } = useSelector((state) => state.flat);
  const { userData } = useSelector((state) => state.auth);

  useEffect(() => {
    // Check if user has a flat
    dispatch(fetchUserFlat());
  }, []);

  useEffect(() => {
    // If user has a flat, redirect to home
    if (!loading && currentFlat) {
      router.replace('/(tabs)');
    }
  }, [currentFlat, loading]);

  const handleCreateFlat = () => {
    router.push('/createFlat');
  };

  const handleJoinFlat = () => {
    router.push('/joinFlat');
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-600">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Logo/Header */}
      <View className="items-center pt-12 pb-8">
        <Image
          source={require("../assets/images/logo.jpg")}
          className="w-48 h-24 mb-4"
          resizeMode="contain"
        />
        <Text className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to Smart Rent!
        </Text>
        <Text className="text-gray-600 text-center px-6">
          {userData?.userName || 'User'}
        </Text>
      </View>

      {/* Main Content */}
      <View className="flex-1 px-6 justify-center">
        <View className="mb-8">
          <Text className="text-2xl font-bold text-gray-900 text-center mb-3">
            Get Started
          </Text>
          <Text className="text-gray-600 text-center mb-8">
            To start managing expenses, you need to either create a new flat or join an existing one
          </Text>
        </View>

        {/* Create Flat Card */}
        <TouchableOpacity 
          onPress={handleCreateFlat}
          className="bg-blue-500 rounded-3xl p-8 mb-4 shadow-lg"
          activeOpacity={0.8}
        >
          <View className="flex-row items-center mb-4">
            <View className="w-16 h-16 bg-white rounded-full items-center justify-center mr-4">
              <Home size={32} color="#3B82F6" />
            </View>
            <View className="flex-1">
              <Text className="text-white text-2xl font-bold mb-1">
                Create a Flat
              </Text>
              <Text className="text-blue-100 text-sm">
                Start fresh with your own flat
              </Text>
            </View>
          </View>
          <View className="bg-blue-600 rounded-2xl p-4">
            <Text className="text-white text-sm mb-1">
              ✓ You'll be the admin
            </Text>
            <Text className="text-white text-sm mb-1">
              ✓ Get a unique join code
            </Text>
            <Text className="text-white text-sm">
              ✓ Invite unlimited flatmates
            </Text>
          </View>
        </TouchableOpacity>

        {/* Join Flat Card */}
        <TouchableOpacity 
          onPress={handleJoinFlat}
          className="bg-green-500 rounded-3xl p-8 mb-4 shadow-lg"
          activeOpacity={0.8}
        >
          <View className="flex-row items-center mb-4">
            <View className="w-16 h-16 bg-white rounded-full items-center justify-center mr-4">
              <UserPlus size={32} color="#16A34A" />
            </View>
            <View className="flex-1">
              <Text className="text-white text-2xl font-bold mb-1">
                Join a Flat
              </Text>
              <Text className="text-green-100 text-sm">
                Join your flatmates using a code
              </Text>
            </View>
          </View>
          <View className="bg-green-600 rounded-2xl p-4">
            <Text className="text-white text-sm mb-1">
              ✓ Enter 6-character code
            </Text>
            <Text className="text-white text-sm mb-1">
              ✓ Preview flat details
            </Text>
            <Text className="text-white text-sm">
              ✓ Join instantly
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View className="px-6 pb-8">
        <Text className="text-gray-500 text-center text-sm">
          You can change or leave your flat anytime from the profile settings
        </Text>
      </View>
    </View>
  );
};

export default Welcome;
