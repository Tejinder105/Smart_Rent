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
    View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Card, PageHeader, SectionTitle } from '../components/ui';
import { getColors } from '../constants/colors';
import { toggleTheme } from '../store/slices/themeSlice';

const settings = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isDark } = useSelector((state) => state.theme);
  const colors = getColors(isDark);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [autoPayEnabled, setAutoPayEnabled] = useState(false);

  const handleToggleDarkMode = () => {
    dispatch(toggleTheme());
  };

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
    <Card
      variant={showToggle ? "flat" : "interactive"}
      onPress={showToggle ? undefined : onPress}
      style={{ 
        borderBottomWidth: 1, 
        borderBottomColor: colors.border, 
        borderRadius: 0,
        backgroundColor: colors.card
      }}
    >
      <View className="flex-row items-center">
        <View className={`w-10 h-10 ${iconBgColor} rounded-full items-center justify-center mr-4`}>
          <Icon size={20} color={iconColor} />
        </View>
        <View className="flex-1">
          <Text style={{ color: colors.text, fontWeight: '500' }}>{title}</Text>
          {subtitle && (
            <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 4 }}>{subtitle}</Text>
          )}
        </View>
        {showToggle ? (
          <Switch
            value={toggleValue}
            onValueChange={onToggleChange}
            trackColor={{ false: isDark ? '#2A2A2A' : '#EDF0F4', true: '#00C471' }}
            thumbColor={toggleValue ? '#FFFFFF' : '#FFFFFF'}
            ios_backgroundColor={isDark ? '#2A2A2A' : '#EDF0F4'}
          />
        ) : (
          <ChevronRight size={20} color={colors.textTertiary} />
        )}
      </View>
    </Card>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <PageHeader
        title="Settings"
        leftAction={
          <Button
            variant="ghost"
            size="sm"
            onPress={handleGoBack}
            leftIcon={<ChevronLeft size={24} color={colors.text} />}
          />
        }
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Notifications */}
        <View className="mx-4 mt-6 mb-6">
          <SectionTitle title="Notifications" variant="compact" />
          <View style={{ backgroundColor: colors.card, borderRadius: 16, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2, overflow: 'hidden' }}>
            <SettingsRow
              icon={Bell}
              title="Push Notifications"
              subtitle="Receive notifications for bills and reminders"
              showToggle={true}
              toggleValue={notificationsEnabled}
              onToggleChange={setNotificationsEnabled}
              iconBgColor="bg-primary-100"
              iconColor="#3b82f6"
            />
          </View>
        </View>

        {/* Appearance */}
        <View className="mx-4 mb-6">
          <SectionTitle title="Appearance" variant="compact" />
          <View style={{ backgroundColor: colors.card, borderRadius: 16, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2, overflow: 'hidden' }}>
            <SettingsRow
              icon={Moon}
              title="Dark Mode"
              subtitle={isDark ? "Currently enabled" : "Currently disabled"}
              showToggle={true}
              toggleValue={isDark}
              onToggleChange={handleToggleDarkMode}
              iconBgColor="bg-purple-100"
              iconColor="#8b5cf6"
            />
            <SettingsRow
              icon={Globe}
              title="Language"
              subtitle="English (US)"
              onPress={handleLanguage}
              iconBgColor="bg-success-100"
              iconColor="#16a34a"
            />
          </View>
        </View>

        {/* Security */}
        <View className="mx-4 mb-6">
          <SectionTitle title="Security" variant="compact" />
          <View style={{ backgroundColor: colors.card, borderRadius: 16, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2, overflow: 'hidden' }}>
            <SettingsRow
              icon={Shield}
              title="Biometric Login"
              subtitle="Use fingerprint or face ID to login"
              showToggle={true}
              toggleValue={biometricEnabled}
              onToggleChange={setBiometricEnabled}
              iconBgColor="bg-warning-100"
              iconColor="#ea580c"
            />
          </View>
        </View>

        {/* Payment */}
        <View className="mx-4 mb-6">
          <SectionTitle title="Payment" variant="compact" />
          <View style={{ backgroundColor: colors.card, borderRadius: 16, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2, overflow: 'hidden' }}>
            <SettingsRow
              icon={CreditCard}
              title="Payment Methods"
              subtitle="Manage your payment cards and methods"
              onPress={handlePaymentMethods}
              iconBgColor="bg-primary-100"
              iconColor="#3b82f6"
            />
            <SettingsRow
              icon={Smartphone}
              title="Auto-Pay"
              subtitle="Automatically pay bills when due"
              showToggle={true}
              toggleValue={autoPayEnabled}
              onToggleChange={setAutoPayEnabled}
              iconBgColor="bg-success-100"
              iconColor="#16a34a"
            />
          </View>
        </View>

        {/* Data & Privacy */}
        <View className="mx-4 mb-6">
          <SectionTitle title="Data & Privacy" variant="compact" />
          <View style={{ backgroundColor: colors.card, borderRadius: 16, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2, overflow: 'hidden' }}>
            <SettingsRow
              icon={Download}
              title="Export Data"
              subtitle="Download your personal data"
              onPress={handleDataExport}
              iconBgColor="bg-info-100"
              iconColor="#0891b2"
            />
            <SettingsRow
              icon={Trash2}
              title="Delete Account"
              subtitle="Permanently delete your account and data"
              onPress={handleDeleteAccount}
              iconBgColor="bg-danger-100"
              iconColor="#dc2626"
            />
          </View>
        </View>

        {/* About */}
        <View className="mx-4 mb-8">
          <SectionTitle title="About" variant="compact" />
          <View style={{ backgroundColor: colors.card, borderRadius: 16, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2, overflow: 'hidden' }}>
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
          <Text style={{ color: colors.textTertiary, fontSize: 14 }}>Smart Rent v1.0.0</Text>
          <Text style={{ color: colors.textTertiary, fontSize: 12, marginTop: 4 }}>Built with ❤️ for modern living</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default settings;