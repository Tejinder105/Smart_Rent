import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useSelector } from "react-redux";
import { ReduxProvider } from "../store/Provider";
import { useAuthPersistence } from "../store/hooks/useAuthPersistence";
import "./global.css";

function AppLayout() {
  const { status, isLoading } = useSelector((state) => state.auth);
  const router = useRouter();
  
  // Initialize auth persistence check
  useAuthPersistence();
  
  useEffect(() => {
    // Wait for loading to complete before redirecting
    if (!isLoading) {
      const timeout = setTimeout(() => {
        if (!status) {
          router.replace("/auth");
        } else {
          router.replace("/(tabs)");
        }
      }, 100);

      return () => clearTimeout(timeout);
    }
  }, [status, isLoading, router]);

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#22c55e" />
        <Text className="mt-4 text-gray-600">Loading...</Text>
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="reminders" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ReduxProvider>
      <AppLayout />
    </ReduxProvider>
  );
}
