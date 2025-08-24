import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { ReduxProvider } from "../store/Provider";
import "./global.css";

function AppLayout() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const router = useRouter();
  
  useEffect(() => {
    // Add a small delay to ensure navigation system is ready
    const timeout = setTimeout(() => {
      if (!isAuthenticated) {
        router.replace("/auth");
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [isAuthenticated]);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
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
