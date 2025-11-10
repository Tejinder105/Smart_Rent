import * as Notifications from 'expo-notifications';
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { ReduxProvider } from "../store/Provider";
import { useAuthPersistence } from "../store/hooks/useAuthPersistence";
import { fetchUserFlat } from "../store/slices/flatSlice";
import notificationPoller from "../utils/notificationPoller";
import notificationService from "../utils/notificationService";
import "./global.css";

function AppLayout() {
  const { status, isLoading: authLoading } = useSelector((state) => state.auth);
  const { currentFlat, loading: flatLoading } = useSelector((state) => state.flat);
  const router = useRouter();
  const segments = useSegments();
  const dispatch = useDispatch();
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();
  
  useAuthPersistence();
  
  // Initialize push notifications
  useEffect(() => {
    if (status && !authLoading) {
      initializePushNotifications();
    }

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [status, authLoading]);

  const initializePushNotifications = async () => {
    try {
      // Request permissions and get push token
      const pushToken = await notificationService.registerForPushNotifications();
      
      if (pushToken) {
        console.log('✅ Push notifications initialized with token');
        // TODO: Send pushToken to backend to store for user
      } else {
        console.log('ℹ️ Push notifications initialized (local only)');
      }

      // Set up notification listeners
      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        console.log('📬 Notification received:', notification.request.content.title);
        // Notification received while app is open
      });

      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('👆 Notification tapped');
        const data = response.notification.request.content.data;
        
        // Navigate based on notification type
        if (data?.screen) {
          router.push(`/${data.screen}`);
        }
      });

      // Start polling for new notifications
      notificationPoller.start();
      
    } catch (error) {
      console.error('❌ Error initializing push notifications:', error.message);
      // Continue anyway - local notifications will still work
    }
  };
  
  // Fetch user's flat when authenticated
  useEffect(() => {
    if (status && !authLoading) {
      dispatch(fetchUserFlat());
    }
  }, [status, authLoading]);

  // Stop polling when user logs out
  useEffect(() => {
    if (!status) {
      notificationPoller.stop();
    }
  }, [status]);

  // Mark navigation as ready after first render
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsNavigationReady(true);
    }, 50);
    return () => clearTimeout(timeout);
  }, []);
  
  useEffect(() => {
    if (!isNavigationReady || authLoading) {
      return;
    }

    // Don't redirect while flat is still loading
    if (flatLoading) {
      return;
    }

    const inAuthGroup = segments[0] === 'auth';
    const inWelcomeGroup = segments[0] === 'welcome';
    const inTabsGroup = segments[0] === '(tabs)';
    const isCreatingOrJoining = segments[0] === 'createFlat' || segments[0] === 'joinFlat';

    if (!status) {
      // Not authenticated - redirect to auth
      if (!inAuthGroup) {
        router.replace("/auth");
      }
    } else if (!currentFlat) {
      // Authenticated but no flat - redirect to welcome (unless creating/joining)
      if (!inWelcomeGroup && !isCreatingOrJoining) {
        router.replace("/welcome");
      }
    } else {
      // Has flat - allow tabs access
      if (inAuthGroup || inWelcomeGroup) {
        router.replace("/(tabs)");
      }
    }
  }, [status, authLoading, currentFlat, flatLoading, segments, isNavigationReady]);

  // Show loading only during auth loading
  if (authLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#22c55e" />
        <Text className="mt-4 text-gray-600">Loading...</Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="reminders" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="payDues" />
      <Stack.Screen name="splitExpense" />
      <Stack.Screen name="addFlatmate" />
      <Stack.Screen name="createFlat" />
      <Stack.Screen name="joinFlat" />
      <Stack.Screen name="scanBill" />
      <Stack.Screen name="createBill" />
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
