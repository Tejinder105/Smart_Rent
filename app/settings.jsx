import { useRouter } from 'expo-router';
import {
    Bell,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    Download,
    Globe,
    Info,
    Moon,
    Shield,
    Smartphone,
    Trash2
} from 'lucide-react-native';
import { useState } from 'react';
import {
    ScrollView,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const settings = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [autoPayEnabled, setAutoPayEnabled] = useState(false);

  const handleGoBack = () => {
    router.back();
  };

  const handleLanguage = () => {
    console.log("Language settings");

  };

  const handlePaymentMethods = () => {
    console.log("Payment methods");
  };

  const handleDataExport = () => {
    console.log("Export data");
 
  };

  const handleDeleteAccount = () => {
    console.log("Delete account");

  };

  const handleAbout = () => {
    console.log("About");
  };

  const SettingsRow = ({ icon: Icon, title, subtitle, onPress, showToggle = false, toggleValue, onToggleChange, iconBgColor, iconColor }) => (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center p-4 border-b border-gray-100"
      disabled={showToggle}
    >
      <View className={`w-10 h-10 ${iconBgColor} rounded-full items-center justify-center mr-4`}>
        <Icon size={20} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text className="text-gray-900 font-medium">{title}</Text>
        {subtitle && (
          <Text className="text-gray-500 text-sm mt-1">{subtitle}</Text>
        )}
      </View>
      {showToggle ? (
        <Switch
          value={toggleValue}
          onValueChange={onToggleChange}
          trackColor={{ false: '#f3f4f6', true: '#22c55e' }}
          thumbColor={toggleValue ? '#ffffff' : '#ffffff'}
          ios_backgroundColor="#f3f4f6"
        />
      ) : (
        <ChevronRight size={20} color="#9ca3af" />
      )}
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="px-4 py-4 bg-white" style={{ paddingTop: insets.top + 12 }}>
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={handleGoBack}
            className="mr-4 w-10 h-10 items-center justify-center"
          >
            <ChevronLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="flex-1 text-[26px] font-bold text-gray-900 text-left  mr-14">
            Settings
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Notifications */}
        <View className="mx-4 mt-6 mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">Notifications</Text>
          <View className="bg-white rounded-2xl shadow-sm">
            <SettingsRow
              icon={Bell}
              title="Push Notifications"
              subtitle="Receive notifications for bills and reminders"
              showToggle={true}
              toggleValue={notificationsEnabled}
              onToggleChange={setNotificationsEnabled}
              iconBgColor="bg-blue-100"
              iconColor="#3b82f6"
            />
          </View>
        </View>

        {/* Appearance */}
        <View className="mx-4 mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">Appearance</Text>
          <View className="bg-white rounded-2xl shadow-sm">
            <SettingsRow
              icon={Moon}
              title="Dark Mode"
              subtitle="Switch to dark theme"
              showToggle={true}
              toggleValue={darkModeEnabled}
              onToggleChange={setDarkModeEnabled}
              iconBgColor="bg-purple-100"
              iconColor="#8b5cf6"
            />
            <SettingsRow
              icon={Globe}
              title="Language"
              subtitle="English (US)"
              onPress={handleLanguage}
              iconBgColor="bg-green-100"
              iconColor="#16a34a"
            />
          </View>
        </View>

        {/* Security */}
        <View className="mx-4 mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">Security</Text>
          <View className="bg-white rounded-2xl shadow-sm">
            <SettingsRow
              icon={Shield}
              title="Biometric Login"
              subtitle="Use fingerprint or face ID to login"
              showToggle={true}
              toggleValue={biometricEnabled}
              onToggleChange={setBiometricEnabled}
              iconBgColor="bg-orange-100"
              iconColor="#ea580c"
            />
          </View>
        </View>

        {/* Payment */}
        <View className="mx-4 mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">Payment</Text>
          <View className="bg-white rounded-2xl shadow-sm">
            <SettingsRow
              icon={CreditCard}
              title="Payment Methods"
              subtitle="Manage your payment cards and methods"
              onPress={handlePaymentMethods}
              iconBgColor="bg-blue-100"
              iconColor="#3b82f6"
            />
            <SettingsRow
              icon={Smartphone}
              title="Auto-Pay"
              subtitle="Automatically pay bills when due"
              showToggle={true}
              toggleValue={autoPayEnabled}
              onToggleChange={setAutoPayEnabled}
              iconBgColor="bg-green-100"
              iconColor="#16a34a"
            />
          </View>
        </View>

        {/* Data & Privacy */}
        <View className="mx-4 mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">Data & Privacy</Text>
          <View className="bg-white rounded-2xl shadow-sm">
            <SettingsRow
              icon={Download}
              title="Export Data"
              subtitle="Download your personal data"
              onPress={handleDataExport}
              iconBgColor="bg-cyan-100"
              iconColor="#0891b2"
            />
            <SettingsRow
              icon={Trash2}
              title="Delete Account"
              subtitle="Permanently delete your account and data"
              onPress={handleDeleteAccount}
              iconBgColor="bg-red-100"
              iconColor="#dc2626"
            />
          </View>
        </View>

        {/* About */}
        <View className="mx-4 mb-8">
          <Text className="text-lg font-bold text-gray-900 mb-3">About</Text>
          <View className="bg-white rounded-2xl shadow-sm">
            <SettingsRow
              icon={Info}
              title="App Information"
              subtitle="Version 1.0.0 • Smart Rent"
              onPress={handleAbout}
              iconBgColor="bg-gray-100"
              iconColor="#6b7280"
            />
          </View>
        </View>

        {/* App Version Footer */}
        <View className="items-center pb-8">
          <Text className="text-gray-400 text-sm">Smart Rent v1.0.0</Text>
          <Text className="text-gray-400 text-xs mt-1">Built with ❤️ for modern living</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default settings;