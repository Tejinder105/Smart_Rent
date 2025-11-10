import { Tabs } from "expo-router";
import { BarChart3, CircleUserRound, FileText, History, Home } from "lucide-react-native";

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
        name="bills"
        options={{ 
          title: "Bills",
          tabBarIcon: ({ color }) => (
            <FileText color={color} size={20} />
          )
        }}
      />
      <Tabs.Screen
        name="history"
        options={{ 
          title: "History",
          tabBarIcon: ({ color }) => (
            <History color={color} size={20} />
          )
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{ 
          title: "Reports",
          tabBarIcon: ({ color }) => (
            <BarChart3 color={color} size={20} />
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
