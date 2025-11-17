import { useRouter } from 'expo-router';
import { Bell, Calendar, ChevronRight, Edit, HelpCircle, LogOut, Mail, Settings, Shield, User } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
    Button,
    Card,
    ConfirmModal,
    PageHeader,
    SectionTitle
} from '../../components/ui';
import authAPI from '../../store/api/authAPI';
import { logout } from '../../store/slices/authSlice';
import { fetchExpenseStats } from '../../store/slices/expenseSlice';
import { fetchUserFlat } from '../../store/slices/flatSlice';
import { fetchUserPayments } from '../../store/slices/paymentSlice';

const profile = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { userData, status } = useSelector((state) => state.auth);
  const { currentFlat, loading: flatLoading } = useSelector((state) => state.flat);
  const { stats } = useSelector((state) => state.expense);
  const { payments } = useSelector((state) => state.payment);

  useEffect(() => {
    // Load user data
    dispatch(fetchUserFlat());
    dispatch(fetchExpenseStats());
    dispatch(fetchUserPayments());
  }, [dispatch]);

  const handleNotificationPress = () => {
    router.push("/reminders");
  };

  const handleEditProfile = () => {
    console.log("Edit profile");
  };

  const handleSettings = () => {
    router.push("/settings");
  };

  const handleHelp = () => {
    console.log("Help & Support");
  };

  const handlePrivacy = () => {
    console.log("Privacy & Security");
  };

  useEffect(() => {
    if (!status) {
      router.replace('/auth');
    }
  }, [status, router]);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      dispatch(logout());
      router.replace('/auth');
    } catch (error) {
      console.error('Logout error:', error);
      dispatch(logout());
      router.replace('/auth');
    }
  };


  if (!status) {
    return null;
  }

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <PageHeader
        title="Profile"
        rightAction={
          <TouchableOpacity 
            onPress={handleNotificationPress}
            className="w-10 h-10 items-center justify-center bg-surface-100 rounded-full"
          >
            <Bell size={20} color="#6B7785" />
          </TouchableOpacity>
        }
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View className="px-4 mt-6 mb-6">
          <Card variant="elevated">
            {/* Avatar and Basic Info */}
            <View className="items-center mb-6">
              <View className="relative">
                <View className="w-24 h-24 bg-primary-500 rounded-full items-center justify-center shadow-lg">
                  <Text className="text-white text-4xl font-bold">
                    {userData?.userName?.charAt(0)?.toUpperCase() || 
                     userData?.email?.charAt(0)?.toUpperCase() || 'U'}
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={handleEditProfile}
                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary-500 rounded-full items-center justify-center shadow-md"
                >
                  <Edit size={14} color="white" />
                </TouchableOpacity>
              </View>
              
              <Text className="text-xl font-bold text-text-primary mt-4">
                {userData?.userName || userData?.fullName || 'User'}
              </Text>
              <Text className="text-text-secondary text-sm">
                {userData?.email || 'No email provided'}
              </Text>
            </View>

            {/* Stats Row */}
            <View className="flex-row justify-around py-4 border-t border-border">
              <View className="items-center">
                <Text className="text-2xl font-bold text-text-primary">
                  {currentFlat?.stats?.totalMembers || 0}
                </Text>
                <Text className="text-text-secondary text-xs">Flatmates</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-text-primary">
                  {payments?.filter(p => p.status === 'paid').length || 0}
                </Text>
                <Text className="text-text-secondary text-xs">Payments</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-text-primary">
                  ₹{((stats?.participant?.paidAmount || 0) / 1000).toFixed(1)}k
                </Text>
                <Text className="text-text-secondary text-xs">Total Spent</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Personal Information */}
        <View className="px-4 mb-6">
          <SectionTitle title="Personal Information" />
          <Card>
            
            <View className="flex-row items-center py-4 border-b border-border">
              <View className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center mr-4">
                <User size={20} color="#3b82f6" />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-text-secondary">Full Name</Text>
                <Text className="text-text-primary font-medium">
                  {userData?.userName || userData?.fullName || 'Not provided'}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center py-4 border-b border-border">
              <View className="w-10 h-10 bg-success-100 rounded-full items-center justify-center mr-4">
                <Mail size={20} color="#16a34a" />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-text-secondary">Email Address</Text>
                <Text className="text-text-primary font-medium">
                  {userData?.email || 'Not provided'}
                </Text>
              </View>
            </View>

            {userData?.createdAt && (
              <View className="flex-row items-center py-4">
                <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mr-4">
                  <Calendar size={20} color="#8b5cf6" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm text-text-secondary">Member Since</Text>
                  <Text className="text-text-primary font-medium">
                    {new Date(userData.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </Text>
                </View>
              </View>
            )}
          </Card>
        </View>

        {/* Settings & Support */}
        <View className="px-4 mb-6">
          <SectionTitle title="Settings & Support" />
          <Card>
            
            <TouchableOpacity 
              onPress={handleSettings}
              className="flex-row items-center py-4 border-b border-border"
            >
              <View className="w-10 h-10 bg-surface-100 rounded-full items-center justify-center mr-4">
                <Settings size={20} color="#6b7280" />
              </View>
              <Text className="flex-1 text-text-primary font-medium">Settings</Text>
              <ChevronRight size={20} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handlePrivacy}
              className="flex-row items-center py-4 border-b border-border"
            >
              <View className="w-10 h-10 bg-warning-100 rounded-full items-center justify-center mr-4">
                <Shield size={20} color="#ea580c" />
              </View>
              <Text className="flex-1 text-text-primary font-medium">Privacy & Security</Text>
              <ChevronRight size={20} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handleHelp}
              className="flex-row items-center py-4"
            >
              <View className="w-10 h-10 bg-yellow-100 rounded-full items-center justify-center mr-4">
                <HelpCircle size={20} color="#ca8a04" />
              </View>
              <Text className="flex-1 text-text-primary font-medium">Help & Support</Text>
              <ChevronRight size={20} color="#9ca3af" />
            </TouchableOpacity>
          </Card>
        </View>

        {/* Logout Button */}
        <View className="px-4 mb-8">
          <Button
            variant="danger"
            size="lg"
            onPress={() => setShowLogoutModal(true)}
            leftIcon={<LogOut size={20} color="white" />}
          >
            Logout
          </Button>
        </View>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Logout"
        message="Are you sure you want to logout? You will need to sign in again to access your account."
        confirmLabel="Logout"
        cancelLabel="Cancel"
        variant="danger"
      />
    </View>
  );
};

export default profile;
