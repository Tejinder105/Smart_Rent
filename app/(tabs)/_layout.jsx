import { Tabs } from "expo-router";
import { BarChart3, CircleUserRound, FileText, History, Home } from "lucide-react-native";
import { useSelector } from 'react-redux';
import { getColors } from '../../constants/colors';

export default function RootLayout() {
  const { isDark } = useSelector((state) => state.theme);
  const colors = getColors(isDark);

  return (
    <Tabs screenOptions={{ 
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textTertiary,
      tabBarStyle: {
        backgroundColor: colors.surface,
        borderTopColor: colors.border,
        borderTopWidth: 1,
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '500',
      },
      headerShown: false 
    }}>
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
