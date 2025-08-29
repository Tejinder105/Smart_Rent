import { Tabs } from "expo-router";
import { Text } from "react-native";
import { Home,CircleUserRound } from "lucide-react-native";

export default function RootLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "#22c55e", headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{ 
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Home color={color} size={20} />
          )
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{ 
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <CircleUserRound color={color} size={20} />
          )
        }}
      />
    </Tabs>
  );
}
