import * as Notifications from 'expo-notifications';
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StatusBar, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { ReduxProvider } from "../store/Provider";
import { useAuthPersistence } from "../store/hooks/useAuthPersistence";
import useTheme from "../store/hooks/useTheme";
import { fetchUserFlat } from "../store/slices/flatSlice";
import notificationPoller from "../utils/notificationPoller";
import notificationService from "../utils/notificationService";
import "./global.css";

function AppLayout() {
  const { status, isLoading: authLoading } = useSelector((state) => state.auth);
  const { currentFlat, loading: flatLoading } = useSelector((state) => state.flat);
  const { isDark } = useTheme();
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
        try {
          Notifications.removeNotificationSubscription(notificationListener.current);
        } catch (error) {
          console.log('Error removing notification listener:', error);
        }
      }
      if (responseListener.current) {
        try {
          Notifications.removeNotificationSubscription(responseListener.current);
        } catch (error) {
          console.log('Error removing response listener:', error);
        }
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

    // Use setTimeout to ensure navigation happens after current render
    setTimeout(() => {
      try {
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
      } catch (error) {
        console.log('Navigation error:', error);
      }
    }, 100);
  }, [status, authLoading, currentFlat, flatLoading, segments, isNavigationReady]);

  // Show loading only during auth loading
  if (authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? '#121212' : '#FFFFFF' }}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={isDark ? '#121212' : '#FFFFFF'} />
        <ActivityIndicator size="large" color="#00C471" />
        <Text style={{ marginTop: 16, color: isDark ? '#8A8A8A' : '#6B7785' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={isDark ? '#121212' : '#FFFFFF'} />
      <Stack screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: isDark ? '#121212' : '#F5F7FA' }
      }}>
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
        <Stack.Screen name="flatDetails" />
        <Stack.Screen name="budget" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ReduxProvider>
      <AppLayout />
    </ReduxProvider>
  );
}
