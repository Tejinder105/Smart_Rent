import { useRouter } from 'expo-router';
import {
    Alert,
    SafeAreaView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import authAPI from '../../store/api/authAPI';
import { logout } from '../../store/slices/authSlice';

const profile = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { userData, status } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
         
              await authAPI.logout();
              dispatch(logout());
              
              router.replace('/auth');
            } catch (error) {
              console.error('Logout error:', error);
              dispatch(logout());
              router.replace('/auth');
            }
          }
        }
      ]
    );
  };

  // If not authenticated, redirect to auth
  if (!status) {
    router.replace('/auth');
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 py-8">
        {/* Header */}
        <View className="items-center mb-8">
          <Text className="text-3xl font-bold text-gray-900 mb-2">Profile</Text>
        </View>

        {/* Profile Info Card */}
        <View className="bg-gray-50 rounded-xl p-6 mb-6">
          {/* Avatar Placeholder */}
          <View className="items-center mb-6">
            <View className="w-24 h-24 bg-green-500 rounded-full items-center justify-center">
              <Text className="text-white text-2xl font-bold">
                {userData?.userName?.charAt(0)?.toUpperCase() || 
                 userData?.email?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
          </View>

          {/* User Details */}
          <View className="space-y-4">
            <View>
              <Text className="text-sm text-gray-600 mb-1">Name</Text>
              <Text className="text-lg font-semibold text-gray-900">
                {userData?.userName || userData?.fullName || 'User'}
              </Text>
            </View>

            <View>
              <Text className="text-sm text-gray-600 mb-1">Email</Text>
              <Text className="text-lg text-gray-900">
                {userData?.email || 'No email provided'}
              </Text>
            </View>

            {userData?.createdAt && (
              <View>
                <Text className="text-sm text-gray-600 mb-1">Member Since</Text>
                <Text className="text-lg text-gray-900">
                  {new Date(userData.createdAt).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View className="space-y-4">

          <TouchableOpacity 
            className="bg-red-500 py-4 rounded-lg"
            onPress={handleLogout}
          >
            <Text className="text-white text-center font-semibold text-lg">
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default profile;
