import { useRouter } from 'expo-router';
import { Bell, Calendar, ChevronRight, Edit, HelpCircle, LogOut, Mail, Settings, Shield, User } from 'lucide-react-native';
import { useEffect } from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import authAPI from '../../store/api/authAPI';
import { logout } from '../../store/slices/authSlice';

const profile = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userData, status } = useSelector((state) => state.auth);

  const handleNotificationPress = () => {
    router.push("/reminders");
  };

  const handleEditProfile = () => {
    console.log("Edit profile");
    // TODO: Navigate to edit profile screen
  };

  const handleSettings = () => {
    router.push("/settings");
  };

  const handleHelp = () => {
    console.log("Help & Support");
    // TODO: Navigate to help screen
  };

  const handlePrivacy = () => {
    console.log("Privacy & Security");
    // TODO: Navigate to privacy screen
  };

  // Use useEffect to handle redirect instead of doing it in render
  useEffect(() => {
    if (!status) {
      router.replace('/auth');
    }
  }, [status, router]);

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
              // Call API logout to clear server-side session
              await authAPI.logout();
              
              // Dispatch logout action to clear Redux state
              dispatch(logout());
              
              // Navigate to auth screen
              router.replace('/auth');
            } catch (error) {
              console.error('Logout error:', error);
              // Even if API fails, clear local state
              dispatch(logout());
              router.replace('/auth');
            }
          }
        }
      ]
    );
  };

  // Show loading or nothing while redirecting
  if (!status) {
    return null;
  }

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="px-4 py-4 bg-white" style={{ paddingTop: insets.top + 12 }}>
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-[26px] pl-2 font-bold text-gray-900 text-left">Profile</Text>
          </View>
          <TouchableOpacity 
            onPress={handleNotificationPress}
            className="w-10 h-10 items-center justify-center bg-gray-50 rounded-full shadow-sm border border-gray-100"
          >
            <Bell size={20} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View className="mx-4 mt-6 mb-6">
          <View className="bg-white rounded-2xl p-6 shadow-sm">
            {/* Avatar and Basic Info */}
            <View className="items-center mb-6">
              <View className="relative">
                <View className="w-24 h-24 border bg-gray-200 rounded-full items-center justify-center shadow-lg">
                  <Text className="text-white text-4xl font-bold">
                    {userData?.userName?.charAt(0)?.toUpperCase() || 
                     userData?.email?.charAt(0)?.toUpperCase() || 'U'}
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={handleEditProfile}
                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 rounded-full items-center justify-center shadow-md"
                >
                  <Edit size={14} color="white" />
                </TouchableOpacity>
              </View>
              
              <Text className="text-xl font-bold text-gray-900 mt-4">
                {userData?.userName || userData?.fullName || 'User'}
              </Text>
              <Text className="text-gray-500 text-sm">
                {userData?.email || 'No email provided'}
              </Text>
            </View>

            {/* Stats Row */}
            <View className="flex-row justify-around py-4 border-t border-gray-100">
              <View className="items-center">
                <Text className="text-2xl font-bold text-gray-900">3</Text>
                <Text className="text-gray-500 text-xs">Flatmates</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-gray-900">12</Text>
                <Text className="text-gray-500 text-xs">Payments</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-gray-900">$2.4k</Text>
                <Text className="text-gray-500 text-xs">Total Spent</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Personal Information */}
        <View className="mx-4 mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">Personal Information</Text>
          <View className="bg-white rounded-2xl shadow-sm">
            
            <View className="flex-row items-center p-4 border-b border-gray-100">
              <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-4">
                <User size={20} color="#3b82f6" />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-gray-500">Full Name</Text>
                <Text className="text-gray-900 font-medium">
                  {userData?.userName || userData?.fullName || 'Not provided'}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center p-4 border-b border-gray-100">
              <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-4">
                <Mail size={20} color="#16a34a" />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-gray-500">Email Address</Text>
                <Text className="text-gray-900 font-medium">
                  {userData?.email || 'Not provided'}
                </Text>
              </View>
            </View>

            {userData?.createdAt && (
              <View className="flex-row items-center p-4">
                <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mr-4">
                  <Calendar size={20} color="#8b5cf6" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm text-gray-500">Member Since</Text>
                  <Text className="text-gray-900 font-medium">
                    {new Date(userData.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Settings & Support */}
        <View className="mx-4 mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">Settings & Support</Text>
          <View className="bg-white rounded-2xl shadow-sm">
            
            <TouchableOpacity 
              onPress={handleSettings}
              className="flex-row items-center p-4 border-b border-gray-100"
            >
              <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-4">
                <Settings size={20} color="#6b7280" />
              </View>
              <Text className="flex-1 text-gray-900 font-medium">Settings</Text>
              <ChevronRight size={20} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handlePrivacy}
              className="flex-row items-center p-4 border-b border-gray-100"
            >
              <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center mr-4">
                <Shield size={20} color="#ea580c" />
              </View>
              <Text className="flex-1 text-gray-900 font-medium">Privacy & Security</Text>
              <ChevronRight size={20} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handleHelp}
              className="flex-row items-center p-4"
            >
              <View className="w-10 h-10 bg-yellow-100 rounded-full items-center justify-center mr-4">
                <HelpCircle size={20} color="#ca8a04" />
              </View>
              <Text className="flex-1 text-gray-900 font-medium">Help & Support</Text>
              <ChevronRight size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <View className="mx-4 mb-8">
          <TouchableOpacity 
            className="bg-red-500 rounded-2xl py-4 flex-row items-center justify-center shadow-sm"
            onPress={handleLogout}
          >
            <LogOut size={20} color="white" />
            <Text className="text-white font-semibold text-lg ml-2">
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default profile;
